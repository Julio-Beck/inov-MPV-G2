import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../dist/domain.mjs';

const NOW = '2026-11-13';
const valid = (over = {}) => ({ title: 'Estágio em Mobile', description: 'Descrição.', course: 'Sistemas de Informação', type: 'Estágio', mode: 'Remoto', shift: 'Tarde', salary: 1500, hours: 30, minSemester: 2, supervisor: 'Ana', institutionIds: ['i1'], ...over });

test('dados de exemplo: rede com 3 faculdades, escopo por faculdade', () => {
  const s = D.seed(NOW);
  assert.equal(s.institutions.length, 3);
  assert.equal(D.studentsOf(s, 'i1').length, 70);
  assert.equal(D.studentFor(s, 'i1').name, 'Lucas Ferreira');
  assert.ok(D.visibleJobs(s, 'i2').every(j => j.institutionIds.includes('i2')));
  assert.deepEqual(D.seed(NOW).students.map(x => x.name), s.students.map(x => x.name), 'geração determinística');
});

test('compatibilidade considera curso, semestre e horário de aula', () => {
  const s = D.seed(NOW), lucas = D.studentFor(s, 'i1');
  const byId = Object.fromEntries(D.jobsForStudent(s, lucas).map(x => [x.job.id, x]));
  assert.equal(byId.j1.compatible, true);
  assert.equal(byId.j11.semester, false);
  assert.equal(byId.j3.course, false);
});

test('candidatura única e só para vagas da própria faculdade', () => {
  const s = D.seed(NOW);
  D.apply(s, 'j1', 's1');
  assert.throws(() => D.apply(s, 'j1', 's1'), /já se candidatou/);
  assert.throws(() => D.apply(s, 'j4', 's1'), /não está disponível/);
});

test('publicação respeita a Lei do Estágio', () => {
  const s = D.seed(NOW);
  assert.throws(() => D.publish(s, valid({ hours: 40 })), /30 horas/);
  assert.throws(() => D.publish(s, valid({ supervisor: '' })), /supervisor/);
  assert.throws(() => D.publish(s, valid({ institutionIds: [] })), /ao menos uma faculdade/);
  assert.throws(() => D.publish(s, valid({ minSemester: 0 })), /semestre/);
  const j = D.publish(s, valid());
  assert.ok(D.visibleJobs(s, 'i1').some(x => x.id === j.id));
  assert.ok(!D.visibleJobs(s, 'i2').some(x => x.id === j.id));
  assert.ok(D.publish(s, valid({ type: 'Primeiro emprego', hours: 40, supervisor: '' })));
});

test('contratar gera termo tripartite; três assinaturas ativam o estágio', () => {
  const s = D.seed(NOW);
  const a = D.apply(s, 'j1', 's1');
  for (const st of ['Em análise', 'Entrevista', 'Contratado']) D.moveApplication(s, a.id, st, NOW);
  const it = s.internships.find(x => x.applicationId === a.id);
  assert.equal(D.internshipStatus(it, NOW), 'Aguardando assinaturas');
  assert.ok(it.signatures.empresa);
  const before = D.institutionMetrics(s, 'i1', NOW).interning;
  D.signInternship(s, it.id, 'aluno', NOW);
  assert.throws(() => D.signInternship(s, it.id, 'aluno', NOW), /já foi assinado/);
  D.signInternship(s, it.id, 'faculdade', NOW);
  assert.equal(D.internshipStatus(it, NOW), 'Ativo');
  assert.equal(D.institutionMetrics(s, 'i1', NOW).interning, before + 1);
  assert.throws(() => D.moveApplication(s, a.id, 'Entrevista', NOW), /já está assinado/);
});

test('voltar a etapa antes das assinaturas cancela o termo', () => {
  const s = D.seed(NOW);
  const a = D.apply(s, 'j1', 's1');
  D.moveApplication(s, a.id, 'Contratado', NOW);
  D.moveApplication(s, a.id, 'Entrevista', NOW);
  assert.ok(!s.internships.some(x => x.applicationId === a.id));
});

test('relatórios: atrasado, entregue, aprovado e próximo agendado', () => {
  const s = D.seed(NOW);
  const m = D.institutionMetrics(s, 'i1', NOW);
  assert.ok(m.pending.signatures.length >= 1 && m.pending.overdue.length >= 1 && m.pending.toApprove.length >= 1);
  const late = m.pending.overdue.at(0);
  assert.equal(D.internshipStatus(late, NOW), 'Relatório atrasado');
  D.remindReport(s, late.id, 'i1', NOW);
  assert.equal(late.reminders.length, 1);
  D.submitReport(s, late.id, NOW);
  D.approveReport(s, late.id, 'i1', NOW);
  assert.equal(late.reports.filter(r => r.status === 'pendente').length, 1);
  assert.throws(() => D.approveReport(s, late.id, 'i2', NOW), /Não há relatório/);
});

test('empresa só move as próprias candidaturas; fatura = ativos × preço', () => {
  const s = D.seed(NOW);
  const other = s.applications.find(a => s.jobs.find(j => j.id === a.vacancyId).companyId !== D.companyId);
  assert.throws(() => D.moveApplication(s, other.id, 'Entrevista', NOW), /inválida/);
  const e = D.employerMetrics(s, NOW);
  assert.equal(e.bill, e.active * D.PRICE.intern);
});

test('plano, portal, perfil e indicação validam entradas', () => {
  const s = D.seed(NOW);
  assert.equal(D.planCost(s.institutions[0]), 4200);
  D.setPlan(s, 'i1', 'essencial');
  assert.equal(D.planCost(s.institutions[0]), 0);
  assert.throws(() => D.updateBranding(s, 'i1', { portalName: 'Ok', accent: 'red' }), /cor/);
  assert.throws(() => D.updateProfile(s, 's1', { name: '' }), /nome/);
  D.recommend(s, 's1', 'j1', 'i1'); D.recommend(s, 's1', 'j1', 'i1');
  assert.equal(s.recommendations.filter(r => r.studentId === 's1').length, 1);
  assert.throws(() => D.recommend(s, 's2', 'j1', 'i1'), /aluno e uma vaga/);
});

test('CSV de empregabilidade e restauração de estado inválido', () => {
  const s = D.seed(NOW);
  const csv = D.employabilityCSV(s, 'i1', NOW).split('\r\n');
  assert.equal(csv.length, 71);
  assert.match(csv[0], /Situação/);
  assert.equal(D.restore('{x').version, 2);
  assert.equal(D.restore(JSON.stringify({ version: 1 })).version, 2);
  assert.equal(D.restore(JSON.stringify(s)).students.length, 210);
});
