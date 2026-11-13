import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../dist/domain.mjs';

const valid = (over = {}) => ({ title: 'Estágio em Design', description: 'Descrição da vaga.', course: 'Design', type: 'Estágio', mode: 'Híbrido', shift: 'Tarde', location: 'Santa Maria, RS', salary: 1500, hours: 30, supervisor: 'Ana', institutionIds: ['i1'], ...over });

test('dados iniciais respeitam o escopo de cada instituição', () => {
  const s = D.seed();
  assert.equal(D.studentFor(s, 'i1').id, 's1');
  assert.equal(D.studentFor(s, 'i3').id, 's5');
  assert.equal(D.visibleJobs(s, 'i1').length, 6);
  assert.ok(D.visibleJobs(s, 'i3').every(j => j.institutionIds.includes('i3')));
  assert.ok(!D.visibleJobs(s, 'i3').some(j => j.id === 'j4'));
});

test('candidatura é registrada uma única vez', () => {
  const s = D.seed();
  const a = D.apply(s, 'j1', 's1');
  assert.equal(a.stage, 'Inscrito');
  assert.throws(() => D.apply(s, 'j1', 's1'), /já se candidatou/);
  assert.equal(s.applications.filter(x => x.vacancyId === 'j1' && x.studentId === 's1').length, 1);
});

test('aluno não se candidata a vaga fora da sua instituição ou encerrada', () => {
  const s = D.seed();
  assert.throws(() => D.apply(s, 'j4', 's5'), /não está disponível/);
  D.setVacancyStatus(s, 'j1', 'closed');
  assert.throws(() => D.apply(s, 'j1', 's1'), /não está disponível/);
  assert.ok(!D.visibleJobs(s, 'i1').some(j => j.id === 'j1'));
  D.setVacancyStatus(s, 'j1', 'open');
  assert.ok(D.visibleJobs(s, 'i1').some(j => j.id === 'j1'));
});

test('publicação valida estágio, carga horária e público', () => {
  const s = D.seed();
  assert.throws(() => D.publish(s, valid({ hours: 40 })), /supervisor e carga entre 1 e 30/);
  assert.throws(() => D.publish(s, valid({ supervisor: ' ' })), /supervisor/);
  assert.throws(() => D.publish(s, valid({ institutionIds: [] })), /ao menos uma instituição/);
  assert.throws(() => D.publish(s, valid({ title: '' })), /título/);
  assert.throws(() => D.publish(s, valid({ salary: 0 })), /remuneração/);
  assert.throws(() => D.publish(s, valid({ type: 'Primeiro emprego', hours: 45, supervisor: '' })), /entre 1 e 44/);
  const j = D.publish(s, valid());
  assert.equal(j.companyId, D.companyId);
  assert.ok(D.visibleJobs(s, 'i1').some(x => x.id === j.id));
  assert.ok(!D.visibleJobs(s, 'i2').some(x => x.id === j.id));
  assert.ok(D.publish(s, valid({ type: 'Primeiro emprego', hours: 40, supervisor: '' })));
});

test('empresa move apenas candidaturas das próprias vagas', () => {
  const s = D.seed();
  D.moveApplication(s, 'a1', 'Contratado');
  assert.equal(s.applications.find(a => a.id === 'a1').stage, 'Contratado');
  assert.throws(() => D.moveApplication(s, 'a4', 'Entrevista'), /inválida/);
  assert.throws(() => D.moveApplication(s, 'a1', 'Outra'), /inválida/);
  assert.throws(() => D.setVacancyStatus(s, 'j2', 'closed'), /inválida/);
});

test('indicação exige aluno da instituição e não duplica', () => {
  const s = D.seed();
  D.recommend(s, 's1', 'j1', 'i1');
  D.recommend(s, 's1', 'j1', 'i1');
  assert.equal(s.recommendations.length, 1);
  assert.throws(() => D.recommend(s, 's4', 'j1', 'i1'), /aluno e uma vaga/);
  assert.throws(() => D.recommend(s, 's5', 'j4', 'i3'), /aluno e uma vaga/);
});

test('vagas salvas alternam sem duplicar', () => {
  const s = D.seed();
  assert.equal(D.toggleSaved(s, 'j2', 's1'), true);
  assert.ok(D.isSaved(s, 'j2', 's1'));
  assert.equal(D.toggleSaved(s, 'j2', 's1'), false);
  assert.equal(s.saved.length, 0);
  assert.throws(() => D.toggleSaved(s, 'j4', 's5'), /não está disponível/);
});

test('perfil e portal validam limites', () => {
  const s = D.seed();
  D.updateProfile(s, 's1', { name: ' Marina O. ', headline: 'Oi', bio: '', project: '' });
  assert.equal(s.students[0].name, 'Marina O.');
  assert.throws(() => D.updateProfile(s, 's1', { name: '' }), /nome/);
  assert.throws(() => D.updateProfile(s, 's1', { name: 'A', bio: 'x'.repeat(601) }), /limites/);
  D.updateBranding(s, 'i2', { portalName: 'Horizonte Carreiras', accent: '#7c4d72' });
  assert.equal(D.portalName(s.institutions[1]), 'Horizonte Carreiras');
  assert.throws(() => D.updateBranding(s, 'i2', { portalName: 'Ok', accent: 'red;x' }), /cor/);
  assert.throws(() => D.updateBranding(s, 'i2', { portalName: 'x', accent: '#000000' }), /nome do portal/);
});

test('estágios e métricas ficam no escopo da instituição', () => {
  const s = D.seed();
  assert.deepEqual(D.internships(s, 'i1').map(a => a.id), ['a4']);
  D.setDocumentStatus(s, 'a4', 'Assinado (simulação)', 'i1');
  D.setReportStatus(s, 'a4', 'Relatório entregue', 'i1');
  assert.equal(s.documents.a4, 'Assinado (simulação)');
  assert.throws(() => D.setDocumentStatus(s, 'a4', 'Assinado (simulação)', 'i2'), /não encontrado/);
  assert.throws(() => D.setReportStatus(s, 'a4', 'Qualquer', 'i1'), /inválida/);
  const m = D.institutionMetrics(s, 'i1');
  assert.equal(m.students, 3); assert.equal(m.applications, 3); assert.equal(m.hires, 1);
  assert.equal(D.institutionMetrics(s, 'i2').applications, 1);
});

test('estado corrompido volta aos dados de exemplo', () => {
  assert.equal(D.restore('{não é json').jobs.length, 6);
  assert.equal(D.restore(JSON.stringify({ version: 2 })).version, 1);
  const s = D.seed(); s.context.institutionId = 'i9';
  assert.equal(D.restore(JSON.stringify(s)).context.institutionId, 'i1');
  const ok = D.seed(); D.apply(ok, 'j2', 's1');
  assert.equal(D.restore(JSON.stringify(ok)).applications.length, 6);
});
