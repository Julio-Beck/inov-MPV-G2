export const stages = ['Inscrito', 'Em análise', 'Entrevista', 'Contratado'];
export const companyId = 'c1';
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function seed() {
  const institutions=[{id:'i1',name:'Faculdade Vale do Recanto',shortName:'Vale do Recanto',accent:'#245847'},{id:'i2',name:'Instituto Horizonte',shortName:'Horizonte',accent:'#425e99'},{id:'i3',name:'Universidade Aurora',shortName:'Aurora',accent:'#7c4d72'}];
  const students=[{id:'s1',institutionId:'i1',name:'Marina Oliveira',headline:'Design, boas ideias e vontade de fazer acontecer.',course:'Design',shift:'Tarde',bio:'Estudante de Design no 4º semestre. Gosto de transformar problemas em experiências simples e de trabalhar em projetos com impacto na comunidade.',project:'Redesign de uma feira local — identidade visual e experiência digital',skills:['Figma','Design visual','Pesquisa UX']},{id:'s2',institutionId:'i1',name:'Lucas Martins',headline:'Desenvolvedor em formação · Sistemas de Informação',course:'Tecnologia',shift:'Manhã',bio:'Construindo meu futuro com código e colaboração.',project:'Aplicativo de organização de estudos',skills:['JavaScript','React','Git']},{id:'s3',institutionId:'i1',name:'Beatriz Santos',headline:'Administração com foco em pessoas e processos',course:'Administração',shift:'Tarde',bio:'Quero conectar pessoas e melhorar processos.',project:'Plano de negócios para comércio regional',skills:['Excel','Comunicação','Organização']},{id:'s4',institutionId:'i2',name:'Rafael Costa',headline:'Tecnologia para resolver problemas reais',course:'Tecnologia',shift:'Tarde',bio:'Estudante e entusiasta de desenvolvimento web.',project:'Dashboard de finanças pessoais',skills:['Python','JavaScript','SQL']},{id:'s5',institutionId:'i3',name:'Clara Almeida',headline:'Comunicação que aproxima pessoas',course:'Marketing',shift:'Manhã',bio:'Criativa, curiosa e pronta para aprender.',project:'Campanha de comunicação para uma ONG',skills:['Conteúdo','Canva','Redes sociais']}];
  const companies=[{id:'c1',name:'Estúdio Forma',initials:'fo',color:'#f0e9fb',ink:'#7954a0',sector:'Design e tecnologia'},{id:'c2',name:'Raiz Tecnologia',initials:'r.',color:'#e1eee6',ink:'#3b7255',sector:'Tecnologia'},{id:'c3',name:'Casa Grão',initials:'cg',color:'#faebdb',ink:'#a07440',sector:'Alimentos e bebidas'},{id:'c4',name:'Nexo Consultoria',initials:'nx',color:'#e4ebf7',ink:'#5676a0',sector:'Consultoria'},{id:'c5',name:'Coletivo Norte',initials:'n',color:'#f8e2df',ink:'#b86b61',sector:'Comunicação'}];
  const jobs=[
    {id:'j1',companyId:'c1',title:'Estágio em UI/UX Design',course:'Design',type:'Estágio',mode:'Híbrido',shift:'Tarde',location:'Santa Maria, RS',salary:1400,hours:25,supervisor:'Ana Ferreira',institutionIds:['i1','i2','i3'],featured:true,description:'Ajude a criar experiências digitais que fazem sentido para as pessoas. Você vai participar de pesquisas, desenhar interfaces no Figma e colaborar com nosso time em projetos reais. Procuramos curiosidade, atenção aos detalhes e vontade de aprender. Não precisa ter experiência profissional.',benefits:['Auxílio-transporte','Mentoria semanal','Horário flexível'],status:'open',createdAt:'2026-11-06'},
    {id:'j2',companyId:'c2',title:'Desenvolvedor(a) Front-end Júnior',course:'Tecnologia',type:'Primeiro emprego',mode:'Remoto',shift:'Manhã',location:'Todo o Brasil',salary:3200,hours:40,supervisor:'',institutionIds:['i1','i2','i3'],description:'Venha construir aplicações web com um time que compartilha conhecimento. Você vai desenvolver componentes, aprender boas práticas de código e participar de revisões com acompanhamento próximo. Conhecimentos de HTML, CSS e JavaScript são bem-vindos.',benefits:['Trabalho remoto','Auxílio educação','Vale-alimentação'],status:'open',createdAt:'2026-11-05'},
    {id:'j3',companyId:'c3',title:'Estágio em Marketing e Conteúdo',course:'Marketing',type:'Estágio',mode:'Presencial',shift:'Tarde',location:'Recanto Maestro, RS',salary:1200,hours:20,supervisor:'Paula Souza',institutionIds:['i1','i3'],description:'Conte as histórias de uma marca que valoriza o que é local. Apoie nossas redes sociais, crie conteúdo e acompanhe ações de comunicação. Um espaço para colocar suas ideias em prática e aprender de perto.',benefits:['Alimentação no local','Auxílio-transporte','Desconto em produtos'],status:'open',createdAt:'2026-11-04'},
    {id:'j4',companyId:'c4',title:'Assistente Administrativo',course:'Administração',type:'Primeiro emprego',mode:'Presencial',shift:'Manhã',location:'Santa Maria, RS',salary:2100,hours:40,supervisor:'',institutionIds:['i1','i2'],description:'Sua organização pode fazer a diferença. Apoie rotinas administrativas, atendimento e organização de documentos com um time preparado para ensinar. Boa comunicação e conhecimentos básicos de planilhas são suficientes para começar.',benefits:['Vale-refeição','Plano de desenvolvimento','Vale-transporte'],status:'open',createdAt:'2026-11-03'},
    {id:'j5',companyId:'c1',title:'Estágio em Desenvolvimento Web',course:'Tecnologia',type:'Estágio',mode:'Híbrido',shift:'Manhã',location:'Santa Maria, RS',salary:1600,hours:30,supervisor:'Pedro Lima',institutionIds:['i1','i2'],description:'Transforme ideias em páginas e aplicações. Trabalhe junto de designers e desenvolvedores, aprendendo na prática sobre acessibilidade, interfaces e desenvolvimento web. Traga projetos de aula ou pessoais para conversarmos.',benefits:['Mentoria técnica','Auxílio-transporte','Equipamento fornecido'],status:'open',createdAt:'2026-11-02'},
    {id:'j6',companyId:'c5',title:'Estágio em Comunicação',course:'Marketing',type:'Estágio',mode:'Remoto',shift:'Tarde',location:'Todo o Brasil',salary:1300,hours:20,supervisor:'Juliana Rocha',institutionIds:['i1','i2','i3'],description:'Participe da criação de campanhas e conteúdos para negócios com propósito. Você terá espaço para experimentar, escrever e descobrir novas formas de comunicar.',benefits:['Trabalho remoto','Cursos online','Horário flexível'],status:'open',createdAt:'2026-11-01'}];
  const applications=[{id:'a1',vacancyId:'j5',studentId:'s1',stage:'Em análise',createdAt:'2026-11-03'},{id:'a2',vacancyId:'j1',studentId:'s2',stage:'Entrevista',createdAt:'2026-11-04'},{id:'a3',vacancyId:'j5',studentId:'s4',stage:'Inscrito',createdAt:'2026-11-05'},{id:'a4',vacancyId:'j3',studentId:'s3',stage:'Contratado',createdAt:'2026-11-02'},{id:'a5',vacancyId:'j1',studentId:'s5',stage:'Inscrito',createdAt:'2026-11-06'}];
  return {version:1,institutions,students,companies,jobs,applications,saved:[],recommendations:[],documents:{},reports:{},context:{role:'aluno',institutionId:'i1'}};
}
export const studentFor=(state,institutionId)=>state.students.find(s=>s.institutionId===institutionId);
export const visibleJobs=(state,institutionId)=>state.jobs.filter(j=>j.status==='open'&&j.institutionIds.includes(institutionId));
export const employerJobs=state=>state.jobs.filter(j=>j.companyId===companyId);
export function apply(state,vacancyId,studentId){
  const j=state.jobs.find(j=>j.id===vacancyId),s=state.students.find(s=>s.id===studentId);
  if(!j||!s||j.status!=='open'||!j.institutionIds.includes(s.institutionId))throw Error('Esta vaga não está disponível para sua instituição.');
  if(state.applications.some(a=>a.vacancyId===vacancyId&&a.studentId===studentId))throw Error('Você já se candidatou a esta vaga.');
  const a={id:uid(),vacancyId,studentId,stage:stages[0],createdAt:new Date().toISOString()};state.applications.push(a);return a;
}
export function publish(state,data){
  const title=String(data.title||'').trim(),description=String(data.description||'').trim();
  if(!title||title.length>100||!description||description.length>3000)throw Error('Preencha o título (até 100 caracteres) e a descrição (até 3.000).');
  if(!['Estágio','Primeiro emprego'].includes(data.type)||!['Remoto','Híbrido','Presencial'].includes(data.mode)||!['Manhã','Tarde'].includes(data.shift))throw Error('Selecione tipo, modalidade e turno válidos.');
  if(!data.institutionIds?.length||data.institutionIds.some(id=>!state.institutions.some(i=>i.id===id)))throw Error('Escolha ao menos uma instituição.');
  const salary=Number(data.salary),hours=Number(data.hours);
  if(!Number.isFinite(salary)||salary<=0)throw Error('Informe uma remuneração maior que zero.');
  if(!Number.isInteger(hours)||hours<1||hours>44)throw Error('Informe uma carga horária entre 1 e 44 horas.');
  if(data.type==='Estágio'&&(hours>30||!String(data.supervisor||'').trim()))throw Error('Para este estágio, informe um supervisor e carga entre 1 e 30 horas semanais.');
  const job={...data,title,description,salary,hours,id:uid(),companyId,status:'open',featured:false,benefits:['Desenvolvimento profissional','Acompanhamento do time'],createdAt:new Date().toISOString()};state.jobs.unshift(job);return job;
}
export function moveApplication(state,id,stage){const a=state.applications.find(a=>a.id===id);if(!a||!stages.includes(stage)||!employerJobs(state).some(j=>j.id===a.vacancyId))throw Error('Candidatura inválida.');a.stage=stage;}
export function recommend(state,studentId,vacancyId,institutionId){const s=state.students.find(s=>s.id===studentId),j=state.jobs.find(j=>j.id===vacancyId);if(!s||s.institutionId!==institutionId||!j||j.status!=='open'||!j.institutionIds.includes(institutionId))throw Error('Selecione um aluno e uma vaga disponíveis nesta instituição.');if(!state.recommendations.some(r=>r.studentId===studentId&&r.vacancyId===vacancyId&&r.institutionId===institutionId))state.recommendations.push({studentId,vacancyId,institutionId});}
export function restore(raw){try{const s=JSON.parse(raw);if(s.version!==1||!['institutions','students','companies','jobs','applications','saved','recommendations'].every(k=>Array.isArray(s[k]))||!s.context||!s.institutions.some(i=>i.id===s.context.institutionId)||!['aluno','empresa','instituicao'].includes(s.context.role)||!s.documents||!s.reports)return seed();return s;}catch{return seed();}}

// --- Operações complementares (reconstrução: perfil, salvos, vagas, portal e estágios) ---
export const courses = ['Design', 'Tecnologia', 'Marketing', 'Administração'];
export const documentStatuses = ['Termo pendente', 'Enviado para assinatura', 'Assinado (simulação)'];
export const reportStatuses = ['Relatório pendente', 'Relatório entregue', 'Relatório aprovado'];
export const accentPattern = /^#[0-9a-f]{6}$/i;
export const portalName = inst => inst?.portalName || `Carreiras ${inst?.shortName || ''}`.trim();
export const isSaved = (state, vacancyId, studentId) => state.saved.some(s => s.vacancyId === vacancyId && s.studentId === studentId);
export function toggleSaved(state, vacancyId, studentId) {
  const i = state.saved.findIndex(s => s.vacancyId === vacancyId && s.studentId === studentId);
  if (i >= 0) { state.saved.splice(i, 1); return false; }
  const j = state.jobs.find(j => j.id === vacancyId), s = state.students.find(s => s.id === studentId);
  if (!j || !s || j.status !== 'open' || !j.institutionIds.includes(s.institutionId)) throw Error('Esta vaga não está disponível para sua instituição.');
  state.saved.push({ vacancyId, studentId }); return true;
}
export function setVacancyStatus(state, id, status) {
  const j = employerJobs(state).find(j => j.id === id);
  if (!j || !['open', 'closed'].includes(status)) throw Error('Vaga inválida.');
  j.status = status; return j;
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
  if (!inst) throw Error('Instituição não encontrada.');
  const name = String(data.portalName ?? '').trim(), accent = String(data.accent ?? '');
  if (name.length < 2 || name.length > 60) throw Error('O nome do portal deve ter entre 2 e 60 caracteres.');
  if (!accentPattern.test(accent)) throw Error('Escolha uma cor válida.');
  Object.assign(inst, { portalName: name, accent }); return inst;
}
export const internships = (state, institutionId) => state.applications.filter(a => a.stage === 'Contratado' && state.students.some(s => s.id === a.studentId && s.institutionId === institutionId));
function internshipFor(state, applicationId, institutionId) {
  const a = internships(state, institutionId).find(a => a.id === applicationId);
  if (!a) throw Error('Estágio não encontrado para esta instituição.');
  return a;
}
export function setDocumentStatus(state, applicationId, status, institutionId) {
  internshipFor(state, applicationId, institutionId);
  if (!documentStatuses.includes(status)) throw Error('Situação de documento inválida.');
  state.documents[applicationId] = status;
}
export function setReportStatus(state, applicationId, status, institutionId) {
  internshipFor(state, applicationId, institutionId);
  if (!reportStatuses.includes(status)) throw Error('Situação de relatório inválida.');
  state.reports[applicationId] = status;
}
export function institutionMetrics(state, institutionId) {
  const ids = new Set(state.students.filter(s => s.institutionId === institutionId).map(s => s.id));
  const apps = state.applications.filter(a => ids.has(a.studentId));
  const byStage = Object.fromEntries(stages.map(st => [st, apps.filter(a => a.stage === st).length]));
  return { students: ids.size, vacancies: visibleJobs(state, institutionId).length, applications: apps.length, hires: byStage.Contratado, byStage, recommendations: state.recommendations.filter(r => r.institutionId === institutionId).length };
}
