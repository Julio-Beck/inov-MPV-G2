/* Oportuniza Rede — regras de negócio (v2: rede nacional de faculdades)
 * Tudo aqui é puro: recebe o estado, valida, altera e devolve.
 * Dados de exemplo são fictícios e gerados de forma determinística. */

export const VERSION = 2;
export const roles = ['faculdade', 'empresa', 'aluno'];
export const stages = ['Inscrito', 'Em análise', 'Entrevista', 'Contratado'];
export const courses = ['Administração', 'Direito', 'Sistemas de Informação', 'Design', 'Marketing', 'Engenharia Civil', 'Psicologia'];
export const studyShifts = ['Manhã', 'Noite'];
export const workShifts = ['Manhã', 'Tarde'];
export const types = ['Estágio', 'Primeiro emprego'];
export const modes = ['Remoto', 'Híbrido', 'Presencial'];
export const PRICE = { intern: 40, student: 1, minPlan: 1500 };
export const companyId = 'c1';
export const accentPattern = /^#[0-9a-f]{6}$/i;

const DAY = 864e5;
export const today = () => new Date().toISOString().slice(0, 10);
export const addDays = (d, n) => new Date(Date.parse(d) + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const FIRST = ['Ana', 'Bruno', 'Camila', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Larissa', 'Mateus', 'Natália', 'Otávio', 'Paula', 'Renan', 'Sofia', 'Thiago', 'Vitória', 'Yuri', 'Bianca', 'Caio', 'Débora', 'Igor', 'Júlia', 'Leonardo', 'Mariana', 'Pedro'];
const LAST = ['Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Esteves', 'Freitas', 'Gomes', 'Lopes', 'Macedo', 'Nunes', 'Oliveira', 'Pereira', 'Queiroz', 'Rocha', 'Santana', 'Teixeira', 'Vieira', 'Moura', 'Ramos', 'Pinto'];
const PROFS = ['Profa. Helena Duarte', 'Prof. Marcos Pacheco', 'Profa. Sílvia Arantes', 'Prof. Rui Fontana'];
const SKILLS = {
  'Administração': ['Excel', 'Finanças', 'Comunicação'], 'Direito': ['Pesquisa jurídica', 'Redação', 'Atendimento'],
  'Sistemas de Informação': ['JavaScript', 'SQL', 'Git'], 'Design': ['Figma', 'Identidade visual', 'UX'],
  'Marketing': ['Redes sociais', 'Conteúdo', 'Análise de dados'], 'Engenharia Civil': ['AutoCAD', 'Orçamento', 'Obras'],
  'Psicologia': ['Escuta ativa', 'Recrutamento', 'Avaliação'],
};

/** Dados de exemplo da rede, relativos a `now` (AAAA-MM-DD). */
export function seed(now = today()) {
  const R = rng(2026);
  const pick = arr => arr[Math.floor(R() * arr.length)];
  const institutions = [
    { id: 'i1', name: 'Centro Universitário Vale Verde', shortName: 'Vale Verde', city: 'Londrina, PR', enrolled: 4200, plan: 'gestao', accent: '#245847', portalName: 'Carreiras Vale Verde' },
    { id: 'i2', name: 'Faculdade Serra Azul', shortName: 'Serra Azul', city: 'Juiz de Fora, MG', enrolled: 2600, plan: 'essencial', accent: '#425e99', portalName: 'Serra Azul Carreiras' },
    { id: 'i3', name: 'Instituto Superior Maré', shortName: 'Maré', city: 'Caruaru, PE', enrolled: 3100, plan: 'gestao', accent: '#7c4d72', portalName: 'Maré Conecta' },
  ];
  const companies = [
    { id: 'c1', name: 'Ondaz Tecnologia', initials: 'oz', color: '#e4ebf7', ink: '#3f5f94', sector: 'Tecnologia e serviços', city: 'Curitiba, PR' },
    { id: 'c2', name: 'Lumeo Contabilidade', initials: 'lu', color: '#e1eee6', ink: '#3b7255', sector: 'Serviços contábeis', city: 'Londrina, PR' },
    { id: 'c3', name: 'Casa Ipê Alimentos', initials: 'ci', color: '#faebdb', ink: '#a07440', sector: 'Indústria de alimentos', city: 'Juiz de Fora, MG' },
    { id: 'c4', name: 'Rotavia Logística', initials: 'rv', color: '#f8e2df', ink: '#b06257', sector: 'Logística', city: 'Caruaru, PE' },
    { id: 'c5', name: 'Estúdio Trama', initials: 'tr', color: '#f0e9fb', ink: '#7954a0', sector: 'Design e comunicação', city: 'Remoto' },
    { id: 'c6', name: 'Prumo Alto Engenharia', initials: 'pa', color: '#eceadf', ink: '#6b6440', sector: 'Construção civil', city: 'Londrina, PR' },
    { id: 'c7', name: 'Clínica Ser Integral', initials: 'si', color: '#e2f0ef', ink: '#2f6f6a', sector: 'Saúde', city: 'Juiz de Fora, MG' },
  ];
  const all = ['i1', 'i2', 'i3'];
  const J = (id, companyId, title, course, type, mode, shift, hours, salary, minSemester, institutionIds, supervisor, location, featured = false) =>
    ({ id, companyId, title, course, type, mode, shift, hours, salary, minSemester, institutionIds, supervisor, location, featured, status: 'open', createdAt: addDays(now, -Math.floor(R() * 20) - 1),
      description: `Vaga para estudantes de ${course} a partir do ${minSemester}º semestre. Você vai aprender na prática com acompanhamento próximo de ${supervisor || 'um gestor do time'}, em atividades reais da área. Não exigimos experiência anterior: valorizamos vontade de aprender e projetos da faculdade.`,
      benefits: type === 'Estágio' ? ['Bolsa-auxílio', 'Auxílio-transporte', 'Recesso remunerado'] : ['CLT', 'Vale-refeição', 'Plano de saúde'] });
  const jobs = [
    J('j1', 'c1', 'Estágio em Desenvolvimento Web', 'Sistemas de Informação', 'Estágio', 'Remoto', 'Tarde', 30, 1500, 3, all, 'Carla Mendes', 'Remoto', true),
    J('j2', 'c1', 'Estágio em Suporte e Dados', 'Sistemas de Informação', 'Estágio', 'Híbrido', 'Manhã', 25, 1300, 2, ['i1', 'i3'], 'Diego Ramos', 'Curitiba, PR'),
    J('j3', 'c2', 'Estágio em Contabilidade e Finanças', 'Administração', 'Estágio', 'Presencial', 'Tarde', 30, 1200, 3, ['i1'], 'Renata Sá', 'Londrina, PR'),
    J('j4', 'c3', 'Estágio em Marketing', 'Marketing', 'Estágio', 'Híbrido', 'Manhã', 25, 1250, 2, ['i2'], 'Lívia Prado', 'Juiz de Fora, MG'),
    J('j5', 'c4', 'Estágio em Operações Logísticas', 'Administração', 'Estágio', 'Presencial', 'Manhã', 30, 1300, 4, ['i3'], 'Fábio Neves', 'Caruaru, PE'),
    J('j6', 'c5', 'Estágio em Design Gráfico', 'Design', 'Estágio', 'Remoto', 'Tarde', 20, 1100, 2, all, 'Íris Tavares', 'Remoto', true),
    J('j7', 'c6', 'Estágio em Engenharia Civil (Obras)', 'Engenharia Civil', 'Estágio', 'Presencial', 'Manhã', 30, 1600, 5, ['i1'], 'Eng. Paulo Brandão', 'Londrina, PR'),
    J('j8', 'c7', 'Estágio em Psicologia Organizacional', 'Psicologia', 'Estágio', 'Presencial', 'Tarde', 20, 1000, 6, ['i2'], 'Dra. Cecília Maia', 'Juiz de Fora, MG'),
    J('j9', 'c1', 'Estágio em Marketing Digital', 'Marketing', 'Estágio', 'Remoto', 'Tarde', 25, 1300, 3, all, 'Bruna Lacerda', 'Remoto'),
    J('j10', 'c2', 'Estágio Jurídico Tributário', 'Direito', 'Estágio', 'Presencial', 'Tarde', 25, 1200, 4, ['i1'], 'Dr. Álvaro Reis', 'Londrina, PR'),
    J('j11', 'c1', 'Desenvolvedor(a) Júnior', 'Sistemas de Informação', 'Primeiro emprego', 'Remoto', 'Manhã', 40, 3200, 7, all, '', 'Remoto'),
  ];

  const students = [
    { id: 's1', institutionId: 'i1', name: 'Lucas Ferreira', course: 'Sistemas de Informação', semester: 3, shift: 'Noite', headline: 'Desenvolvedor em formação, buscando o primeiro estágio', bio: 'Trabalho de dia fora da área e estudo à noite. Quero meu primeiro estágio em desenvolvimento para começar a carreira ainda durante o curso.', project: 'App de organização de estudos em React, feito na disciplina de Programação Web', skills: ['JavaScript', 'React', 'Git'] },
    { id: 's2', institutionId: 'i2', name: 'Marina Costa', course: 'Design', semester: 4, shift: 'Noite', headline: 'Design visual e experiência do usuário', bio: 'Gosto de transformar problemas em interfaces simples.', project: 'Identidade visual para uma feira de economia solidária', skills: ['Figma', 'Identidade visual', 'UX'] },
    { id: 's3', institutionId: 'i3', name: 'Rafael Lima', course: 'Administração', semester: 5, shift: 'Noite', headline: 'Administração com foco em operações', bio: 'Quero aprender gestão na prática.', project: 'Plano de melhoria de estoque para um comércio local', skills: ['Excel', 'Finanças', 'Comunicação'] },
  ];
  let n = 4;
  for (const inst of institutions) for (let k = 0; k < 69; k++) {
    const course = pick(courses);
    students.push({ id: `s${n++}`, institutionId: inst.id, name: `${pick(FIRST)} ${pick(LAST)}`, course, semester: 1 + Math.floor(R() * 8), shift: R() < 0.7 ? 'Noite' : 'Manhã', headline: `Estudante de ${course}`, bio: '', project: '', skills: SKILLS[course] });
  }

  const state = { version: VERSION, institutions, students, companies, jobs, applications: [], internships: [], saved: [], recommendations: [], context: { role: 'faculdade', institutionId: 'i1' } };

  for (const s of students.slice(3)) {
    if (R() > 0.6) continue;
    const options = jobsForStudent(state, s).filter(x => x.compatible);
    if (!options.length) continue;
    let hired = false;
    for (const { job } of options.slice(0, 2)) {
      const r = R();
      const stage = hired ? 'Inscrito' : r < 0.4 ? 'Inscrito' : r < 0.6 ? 'Em análise' : r < 0.75 ? 'Entrevista' : 'Contratado';
      const app = { id: `a${state.applications.length + 1}`, vacancyId: job.id, studentId: s.id, stage, createdAt: addDays(now, -Math.floor(R() * 40) - 1) };
      state.applications.push(app);
      if (stage === 'Contratado') {
        hired = true;
        const start = addDays(now, -Math.floor(15 + R() * 300));
        state.internships.push(makeInternship(state, app, start, pick(PROFS), { empresa: start, aluno: start, faculdade: start }, now, R));
      }
    }
  }
  // Situações garantidas para a demonstração na Vale Verde (i1).
  const i1 = state.internships.filter(it => it.institutionId === 'i1');
  if (i1.at(0)) { const it = i1.at(0); it.start = addDays(now, 7); it.end = addDays(it.start, 365); it.signatures = { empresa: addDays(now, -2), aluno: addDays(now, -1), faculdade: null }; it.reports = [{ id: uid(), due: addDays(it.start, 182), status: 'pendente' }]; }
  if (i1.at(1)) { const it = i1.at(1); it.start = addDays(now, -200); it.end = addDays(it.start, 365); it.signatures = { empresa: it.start, aluno: it.start, faculdade: it.start }; it.reports = [{ id: uid(), due: addDays(it.start, 182), status: 'pendente' }]; }
  if (i1.at(2)) { const it = i1.at(2); it.start = addDays(now, -175); it.end = addDays(it.start, 365); it.signatures = { empresa: it.start, aluno: it.start, faculdade: it.start }; it.reports = [{ id: uid(), due: addDays(it.start, 182), status: 'entregue', submittedAt: addDays(now, -1) }]; }
  const rec = state.students.find(s => s.institutionId === 'i1' && s.course === 'Sistemas de Informação' && s.id !== 's1' && !state.applications.some(a => a.studentId === s.id && a.vacancyId === 'j1'));
  if (rec) { state.recommendations.push({ studentId: rec.id, vacancyId: 'j1', institutionId: 'i1' }); state.applications.push({ id: `a${state.applications.length + 1}`, vacancyId: 'j1', studentId: rec.id, stage: 'Em análise', createdAt: addDays(now, -3) }); }
  return state;
}

function makeInternship(state, app, start, orientador, signatures, now, R = Math.random) {
  const job = state.jobs.find(j => j.id === app.vacancyId), s = state.students.find(x => x.id === app.studentId);
  const reports = [];
  const due1 = addDays(start, 182);
  if (due1 < now) {
    const r = R();
    if (r < 0.55) { reports.push({ id: uid(), due: due1, status: 'aprovado', submittedAt: addDays(due1, -3), approvedAt: due1 }); reports.push({ id: uid(), due: addDays(start, 364), status: 'pendente' }); }
    else if (r < 0.8) reports.push({ id: uid(), due: due1, status: 'entregue', submittedAt: addDays(due1, -1) });
    else reports.push({ id: uid(), due: due1, status: 'pendente' });
  } else reports.push({ id: uid(), due: due1, status: 'pendente' });
  return { id: `e-${app.id}`, applicationId: app.id, studentId: s.id, institutionId: s.institutionId, companyId: job.companyId, vacancyId: job.id,
    start, end: addDays(start, 365), hours: job.hours, salary: job.salary, supervisor: job.supervisor || 'Gestor(a) da área', orientador,
    signatures, reports, insurance: `Apólice simulada nº ${String(100000 + Math.floor(R() * 899999))}`, reminders: [] };
}

/* ---------- consultas ---------- */
export const studentFor = (state, institutionId) => state.students.find(s => s.institutionId === institutionId);
export const studentsOf = (state, institutionId) => state.students.filter(s => s.institutionId === institutionId);
export const visibleJobs = (state, institutionId) => state.jobs.filter(j => j.status === 'open' && j.institutionIds.includes(institutionId));
export const employerJobs = state => state.jobs.filter(j => j.companyId === companyId);
export const portalName = inst => inst?.portalName || `Carreiras ${inst?.shortName || ''}`.trim();

/** Vagas visíveis ao aluno, com o motivo de compatibilidade. */
export function jobsForStudent(state, s) {
  return visibleJobs(state, s.institutionId).map(job => {
    const course = job.course === s.course, semester = s.semester >= job.minSemester, shift = s.shift !== job.shift;
    return { job, course, semester, shift, compatible: course && semester && shift };
  });
}

export function internshipStatus(it, now = today()) {
  if (Object.values(it.signatures).some(v => !v)) return 'Aguardando assinaturas';
  if (it.end < now) return 'Encerrado';
  if (it.start > now) return 'Assinado, começa em breve';
  if (it.reports.some(r => r.status === 'pendente' && r.due < now)) return 'Relatório atrasado';
  return 'Ativo';
}
export const isActive = (it, now = today()) => ['Ativo', 'Relatório atrasado'].includes(internshipStatus(it, now));
export const internshipsOf = (state, institutionId) => state.internships.filter(it => it.institutionId === institutionId);
export const nextReport = it => it.reports.find(r => r.status !== 'aprovado');

export function institutionMetrics(state, institutionId, now = today()) {
  const studs = studentsOf(state, institutionId), ids = new Set(studs.map(s => s.id));
  const its = internshipsOf(state, institutionId), active = its.filter(it => isActive(it, now));
  const activeIds = new Set(active.map(it => it.studentId));
  const apps = state.applications.filter(a => ids.has(a.studentId));
  const byCourse = courses.map(course => {
    const cs = studs.filter(s => s.course === course);
    const interns = cs.filter(s => activeIds.has(s.id)).length;
    return { course, students: cs.length, interns, pct: cs.length ? interns / cs.length : 0 };
  }).filter(c => c.students).sort((a, b) => b.pct - a.pct);
  return {
    students: studs.length, interning: active.length, pct: studs.length ? active.length / studs.length : 0,
    applications: apps.length, inProcess: apps.filter(a => a.stage !== 'Contratado').length,
    hiresSemester: its.filter(it => daysBetween(it.signatures.empresa || it.start, now) <= 182).length,
    companies: new Set(active.map(it => it.companyId)).size,
    vacancies: visibleJobs(state, institutionId).length,
    pending: {
      signatures: its.filter(it => !it.signatures.faculdade),
      overdue: its.filter(it => isActive(it, now) && it.reports.some(r => r.status === 'pendente' && r.due < now)),
      toApprove: its.filter(it => it.reports.some(r => r.status === 'entregue')),
      dueSoon: its.filter(it => isActive(it, now) && it.reports.some(r => r.status === 'pendente' && r.due >= now && daysBetween(now, r.due) <= 30)),
    },
    byCourse,
  };
}

export function employerMetrics(state, now = today()) {
  const jobs = employerJobs(state), ids = new Set(jobs.map(j => j.id));
  const apps = state.applications.filter(a => ids.has(a.vacancyId));
  const its = state.internships.filter(it => it.companyId === companyId);
  const active = its.filter(it => isActive(it, now));
  return { open: jobs.filter(j => j.status === 'open').length, applications: apps.length, interviews: apps.filter(a => a.stage === 'Entrevista').length,
    active: active.length, pendingSign: its.filter(it => internshipStatus(it, now) === 'Aguardando assinaturas').length,
    bill: active.length * PRICE.intern, institutions: new Set(jobs.flatMap(j => j.institutionIds)).size,
    reportsDue: active.filter(it => it.reports.some(r => r.status === 'pendente' && daysBetween(now, r.due) <= 30)) };
}

export const planCost = inst => inst.plan === 'gestao' ? Math.max(PRICE.minPlan, inst.enrolled * PRICE.student) : 0;

export function employabilityCSV(state, institutionId, now = today()) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Aluno', 'Curso', 'Semestre', 'Situação', 'Empresa', 'Vaga', 'Início', 'Fim'].map(esc).join(';')];
  for (const s of studentsOf(state, institutionId)) {
    const it = state.internships.find(x => x.studentId === s.id);
    const apps = state.applications.filter(a => a.studentId === s.id);
    const situation = it ? (isActive(it, now) ? 'Estagiando' : internshipStatus(it, now)) : apps.length ? 'Em processo seletivo' : 'Sem candidatura';
    const job = it && state.jobs.find(j => j.id === it.vacancyId), comp = it && state.companies.find(c => c.id === it.companyId);
    rows.push([s.name, s.course, `${s.semester}º`, situation, comp?.name || '', job?.title || '', it?.start || '', it?.end || ''].map(esc).join(';'));
  }
  return rows.join('\r\n');
}

/* ---------- mutações ---------- */
export function apply(state, vacancyId, studentId) {
  const j = state.jobs.find(j => j.id === vacancyId), s = state.students.find(s => s.id === studentId);
  if (!j || !s || j.status !== 'open' || !j.institutionIds.includes(s.institutionId)) throw Error('Esta vaga não está disponível para sua faculdade.');
  if (state.applications.some(a => a.vacancyId === vacancyId && a.studentId === studentId)) throw Error('Você já se candidatou a esta vaga.');
  const a = { id: uid(), vacancyId, studentId, stage: stages[0], createdAt: today() };
  state.applications.push(a); return a;
}

export function publish(state, data) {
  const title = String(data.title || '').trim(), description = String(data.description || '').trim();
  if (!title || title.length > 100 || !description || description.length > 3000) throw Error('Preencha o título (até 100 caracteres) e a descrição (até 3.000).');
  if (!types.includes(data.type) || !modes.includes(data.mode) || !workShifts.includes(data.shift) || !courses.includes(data.course)) throw Error('Selecione curso, tipo, modalidade e turno válidos.');
  if (!data.institutionIds?.length || data.institutionIds.some(id => !state.institutions.some(i => i.id === id))) throw Error('Escolha ao menos uma faculdade da rede.');
  const salary = Number(data.salary), hours = Number(data.hours), minSemester = Number(data.minSemester ?? 1);
  if (!Number.isFinite(salary) || salary <= 0) throw Error('Informe uma bolsa ou salário maior que zero.');
  if (!Number.isInteger(hours) || hours < 1 || hours > 44) throw Error('Informe uma carga horária entre 1 e 44 horas.');
  if (!Number.isInteger(minSemester) || minSemester < 1 || minSemester > 10) throw Error('Informe o semestre mínimo entre 1 e 10.');
  if (data.type === 'Estágio' && (hours > 30 || !String(data.supervisor || '').trim())) throw Error('Pela Lei do Estágio: informe um(a) supervisor(a) e no máximo 30 horas semanais.');
  const job = { id: uid(), companyId, title, description, course: data.course, type: data.type, mode: data.mode, shift: data.shift, location: String(data.location || '').trim() || 'A combinar',
    salary, hours, minSemester, supervisor: data.type === 'Estágio' ? String(data.supervisor).trim() : '', institutionIds: [...new Set(data.institutionIds)], featured: false, status: 'open', createdAt: today(),
    benefits: data.type === 'Estágio' ? ['Bolsa-auxílio', 'Auxílio-transporte', 'Recesso remunerado'] : ['CLT', 'Vale-refeição'] };
  state.jobs.unshift(job); return job;
}

export function setVacancyStatus(state, id, status) {
  const j = employerJobs(state).find(j => j.id === id);
  if (!j || !['open', 'closed'].includes(status)) throw Error('Vaga inválida.');
  j.status = status; return j;
}

/** Move a candidatura. Ao chegar em "Contratado", gera o termo de compromisso tripartite. */
export function moveApplication(state, id, stage, now = today()) {
  const a = state.applications.find(a => a.id === id);
  if (!a || !stages.includes(stage) || !employerJobs(state).some(j => j.id === a.vacancyId)) throw Error('Candidatura inválida.');
  const existing = state.internships.find(it => it.applicationId === a.id);
  if (a.stage === 'Contratado' && stage !== 'Contratado' && existing) {
    if (internshipStatus(existing, now) !== 'Aguardando assinaturas') throw Error('O estágio já está assinado; não é possível voltar a etapa.');
    state.internships = state.internships.filter(it => it !== existing);
  }
  if (stage === 'Contratado' && !existing) {
    if (state.internships.some(it => it.studentId === a.studentId && internshipStatus(it, now) !== 'Encerrado')) throw Error('Este aluno já tem um estágio em andamento.');
    const start = now;
    const s = state.students.find(x => x.id === a.studentId);
    const inst = state.institutions.find(i => i.id === s.institutionId);
    const it = makeInternship(state, a, start, `Coordenação de estágios · ${inst.shortName}`, { empresa: now, aluno: null, faculdade: null }, now);
    state.internships.push(it);
  }
  a.stage = stage; return a;
}

export function signInternship(state, id, party, now = today()) {
  const it = state.internships.find(x => x.id === id);
  if (!it || !['empresa', 'aluno', 'faculdade'].includes(party)) throw Error('Termo não encontrado.');
  if (it.signatures[party]) throw Error('Este termo já foi assinado por esta parte.');
  it.signatures[party] = now; return it;
}

export function submitReport(state, id, now = today()) {
  const it = state.internships.find(x => x.id === id), r = it && it.reports.find(r => r.status === 'pendente');
  if (!it || !r) throw Error('Não há relatório pendente para este estágio.');
  r.status = 'entregue'; r.submittedAt = now; return r;
}

export function approveReport(state, id, institutionId, now = today()) {
  const it = state.internships.find(x => x.id === id && x.institutionId === institutionId), r = it && it.reports.find(r => r.status === 'entregue');
  if (!it || !r) throw Error('Não há relatório entregue para aprovar.');
  r.status = 'aprovado'; r.approvedAt = now;
  const nextDue = addDays(r.due, 182);
  if (nextDue <= it.end && !it.reports.some(x => x.due === nextDue)) it.reports.push({ id: uid(), due: nextDue, status: 'pendente' });
  return r;
}

export function remindReport(state, id, institutionId, now = today()) {
  const it = state.internships.find(x => x.id === id && x.institutionId === institutionId);
  if (!it) throw Error('Estágio não encontrado.');
  it.reminders.push(now); return it;
}

export function recommend(state, studentId, vacancyId, institutionId) {
  const s = state.students.find(s => s.id === studentId), j = state.jobs.find(j => j.id === vacancyId);
  if (!s || s.institutionId !== institutionId || !j || j.status !== 'open' || !j.institutionIds.includes(institutionId)) throw Error('Selecione um aluno e uma vaga disponíveis nesta faculdade.');
  if (!state.recommendations.some(r => r.studentId === studentId && r.vacancyId === vacancyId && r.institutionId === institutionId)) state.recommendations.push({ studentId, vacancyId, institutionId });
}

export function updateProfile(state, studentId, data) {
  const s = state.students.find(s => s.id === studentId);
  if (!s) throw Error('Perfil não encontrado.');
  const v = k => String(data[k] ?? '').trim();
  const name = v('name'), headline = v('headline'), bio = v('bio'), project = v('project');
  if (!name || name.length > 80) throw Error('Informe seu nome (até 80 caracteres).');
  if (headline.length > 120 || bio.length > 600 || project.length > 180) throw Error('Revise os limites: título até 120, sobre até 600 e projeto até 180 caracteres.');
  Object.assign(s, { name, headline, bio, project }); return s;
}

export function updateBranding(state, institutionId, data) {
  const inst = state.institutions.find(i => i.id === institutionId);
  if (!inst) throw Error('Faculdade não encontrada.');
  const name = String(data.portalName ?? '').trim(), accent = String(data.accent ?? '');
  if (name.length < 2 || name.length > 60) throw Error('O nome do portal deve ter entre 2 e 60 caracteres.');
  if (!accentPattern.test(accent)) throw Error('Escolha uma cor válida.');
  Object.assign(inst, { portalName: name, accent }); return inst;
}

export function setPlan(state, institutionId, plan) {
  const inst = state.institutions.find(i => i.id === institutionId);
  if (!inst || !['essencial', 'gestao'].includes(plan)) throw Error('Plano inválido.');
  inst.plan = plan; return inst;
}

export function restore(raw) {
  try {
    const s = JSON.parse(raw);
    const arrays = ['institutions', 'students', 'companies', 'jobs', 'applications', 'internships', 'saved', 'recommendations'];
    if (s.version !== VERSION || !arrays.every(k => Array.isArray(s[k])) || !s.context || !roles.includes(s.context.role) || !s.institutions.some(i => i.id === s.context.institutionId)) return seed();
    return s;
  } catch { return seed(); }
}
