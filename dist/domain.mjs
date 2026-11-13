/* Oportuniza Rede — regras de negócio (v3: rede nacional de faculdades)
 * Tudo aqui é puro: recebe o estado, valida, altera e devolve.
 * Dados de exemplo são fictícios e gerados de forma determinística. */

export const VERSION = 3;
export const roles = ['faculdade', 'empresa', 'aluno'];
export const stages = ['Inscrito', 'Em análise', 'Entrevista', 'Contratado'];
export const courses = ['Administração', 'Agronomia', 'Ciências Contábeis', 'Design', 'Direito', 'Enfermagem', 'Engenharia Civil', 'Engenharia de Produção', 'Marketing', 'Pedagogia', 'Psicologia', 'Sistemas de Informação'];
export const studyShifts = ['Manhã', 'Tarde', 'Noite'];
export const workShifts = ['Manhã', 'Tarde'];
export const types = ['Estágio', 'Primeiro emprego'];
export const modes = ['Remoto', 'Híbrido', 'Presencial'];
export const PRICE = { intern: 40, student: 1, minPlan: 1500 };
export const companyId = 'c1';
export const currentCompanyId = state => state?.context?.companyId || companyId;
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

const FIRST = ['Ana Clara', 'Bruno', 'Camila', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João Pedro', 'Larissa', 'Mateus', 'Natália', 'Otávio', 'Paula', 'Renan', 'Sofia', 'Thiago', 'Vitória', 'Yuri', 'Bianca', 'Caio', 'Débora', 'Igor', 'Júlia', 'Leonardo', 'Mariana', 'Pedro', 'Kauã', 'Luana', 'Raíssa', 'Wesley', 'Thalita', 'Iago', 'Maria Eduarda', 'Davi', 'Heloísa', 'Kaique', 'Jaqueline', 'Edson', 'Cristiane', 'Rosângela', 'Anderson', 'Patrícia', 'Gustavo', 'Letícia', 'Vinícius', 'Tainá', 'Samuel', 'Ingrid', 'Murilo', 'Ester', 'Rodrigo', 'Aline', 'Diego', 'Fernanda', 'Lorena', 'Arthur', 'Joana', 'Wellington'];
const LAST = ['Silva', 'Santos', 'Souza', 'Oliveira', 'Lima', 'Araújo', 'Ribeiro', 'Carvalho', 'Rodrigues', 'Cavalcanti', 'Nascimento', 'Moraes', 'Batista', 'Correia', 'Fonseca', 'Medeiros', 'Tavares', 'Andrade', 'Bezerra', 'Campos', 'Duarte', 'Farias', 'Guimarães', 'Holanda', 'Kowalski', 'Schmidt', 'Yamamoto', 'Nakamura', 'Haddad', 'Bittencourt', 'Zanella', 'Pereira', 'Barbosa', 'Gomes', 'Rocha', 'Teixeira', 'Vieira', 'Moura', 'Ramos', 'Cardoso'];
const PROFS = ['Profa. Helena Duarte', 'Prof. Marcos Pacheco', 'Profa. Sílvia Arantes', 'Prof. Rui Fontana', 'Profa. Lúcia Vasconcelos', 'Prof. Caetano Brito', 'Profa. Denise Kuhn', 'Prof. Jorge Amaral'];
const SKILLS = {
  'Administração': ['Excel', 'Finanças', 'Comunicação', 'Gestão de pessoas', 'Processos'], 'Agronomia': ['Manejo de solo', 'Topografia', 'Defensivos', 'Agricultura de precisão'],
  'Ciências Contábeis': ['Excel', 'Conciliação', 'Tributos', 'ERP'], 'Design': ['Figma', 'Identidade visual', 'UX', 'Ilustração'],
  'Direito': ['Pesquisa jurídica', 'Redação', 'Atendimento', 'Processo digital'], 'Enfermagem': ['Sinais vitais', 'Curativos', 'Acolhimento', 'Biossegurança'],
  'Engenharia Civil': ['AutoCAD', 'Orçamento', 'Obras', 'Revit'], 'Engenharia de Produção': ['Lean', 'Excel', 'Controle de qualidade', 'PCP'],
  'Marketing': ['Redes sociais', 'Conteúdo', 'Análise de dados', 'Canva'], 'Pedagogia': ['Ludicidade', 'Planejamento de aula', 'Inclusão', 'Contação de histórias'],
  'Psicologia': ['Escuta ativa', 'Recrutamento', 'Avaliação', 'Dinâmicas de grupo'], 'Sistemas de Informação': ['JavaScript', 'SQL', 'Git', 'Python', 'React'],
};
const PROJECTS = {
  'Administração': ['Plano de negócios para uma padaria do bairro', 'Mapeamento de processos de uma ONG', 'Pesquisa de satisfação para o comércio local'],
  'Agronomia': ['Ensaio de adubação em soja na fazenda-escola', 'Mapa de produtividade com drone', 'Horta comunitária com irrigação por gotejamento'],
  'Ciências Contábeis': ['Núcleo de apoio fiscal ao MEI', 'Fluxo de caixa de uma cooperativa', 'Análise de balanços de empresas locais'],
  'Design': ['Identidade visual para uma feira de economia solidária', 'Redesign do site de uma biblioteca municipal', 'Série de pôsteres sobre saúde mental'],
  'Direito': ['Núcleo de prática jurídica: atendimento à comunidade', 'Artigo sobre a LGPD no comércio', 'Simulação de júri da turma'],
  'Enfermagem': ['Campanha de vacinação na escola do bairro', 'Cartilha de primeiros socorros', 'Projeto de extensão em saúde do idoso'],
  'Engenharia Civil': ['Projeto de uma casa popular com orçamento', 'Laudo de patologias em uma escola', 'Maquete de ponte treliçada'],
  'Engenharia de Produção': ['Redução de desperdício em uma confecção', 'Layout de uma pequena fábrica de móveis', 'Controle estatístico de processo em laboratório'],
  'Marketing': ['Campanha de comunicação para uma ONG', 'Gestão das redes de uma loja de bairro', 'Pesquisa de mercado sobre delivery'],
  'Pedagogia': ['Oficina de leitura na educação infantil', 'Material adaptado para alunos com TEA', 'Reforço escolar voluntário'],
  'Psicologia': ['Grupo de apoio a calouros', 'Pesquisa sobre ansiedade em universitários', 'Processo seletivo simulado para a empresa júnior'],
  'Sistemas de Informação': ['App de organização de estudos em React', 'Sistema de agendamento para uma clínica', 'Bot de avisos da turma no Telegram'],
};
const HEADLINES = [c => `Estudante de ${c}`, c => `${c} em formação, aberto(a) a estágio`, c => `Buscando a primeira oportunidade em ${c}`, c => `Curioso(a) por ${c.toLowerCase()} na prática`, c => `${c} · disponível para estágio`];
const BIOS_YOUNG = ['Primeira pessoa da família na faculdade. Quero aprender na prática.', 'Faço trabalho voluntário nos fins de semana e gosto de projetos em equipe.', 'Participo da empresa júnior e quero minha primeira experiência formal.', 'Trabalho meio período no comércio e procuro estágio na área.'];
const BIOS_ADULT = ['Voltei a estudar depois de anos no mercado e quero mudar de área.', 'Mãe de dois filhos, estudo à noite e busco estágio com horário compatível.', 'Trabalhei 8 anos no varejo; agora quero atuar na minha formação.', 'Fiz curso técnico, trabalhei na área e decidi fazer a graduação.'];
const ACTIVITIES = {
  'Administração': 'apoiar rotinas administrativas, organizar indicadores e participar de reuniões de planejamento',
  'Agronomia': 'acompanhar lavouras, coletar amostras de solo e apoiar a assistência técnica aos produtores',
  'Ciências Contábeis': 'conciliar contas, apoiar o fechamento mensal e organizar documentos fiscais',
  'Design': 'criar peças gráficas, participar de pesquisas com usuários e prototipar interfaces',
  'Direito': 'pesquisar jurisprudência, redigir minutas e acompanhar processos digitais',
  'Enfermagem': 'apoiar a equipe de enfermagem no cuidado ao paciente, sob supervisão',
  'Engenharia Civil': 'acompanhar a obra, levantar quantitativos e apoiar o orçamento',
  'Engenharia de Produção': 'mapear processos da fábrica, acompanhar indicadores e propor melhorias',
  'Marketing': 'produzir conteúdo, acompanhar métricas das redes e apoiar campanhas',
  'Pedagogia': 'apoiar o professor regente, planejar atividades e acompanhar o desenvolvimento das crianças',
  'Psicologia': 'apoiar processos seletivos, aplicar dinâmicas e acompanhar ações de clima',
  'Sistemas de Informação': 'desenvolver funcionalidades, corrigir bugs e participar das revisões de código',
};
const INTROS = [(c, s) => `Vaga para estudantes de ${c} a partir do ${s}º semestre.`, (c, s) => `Quer começar em ${c.toLowerCase()} ainda durante o curso? Esta vaga é para você, a partir do ${s}º semestre.`, (c, s) => `Buscamos estudantes de ${c} (${s}º semestre em diante) com vontade de aprender.`];
const BENEFITS = ['Auxílio-transporte', 'Recesso remunerado', 'Vale-refeição', 'Horário flexível em semana de provas', 'Mentoria semanal', 'Plano de saúde', 'Possibilidade de efetivação', 'Equipamento fornecido', 'Folga no aniversário', 'Curso de idiomas'];

/** Dados de exemplo da rede, relativos a `now` (AAAA-MM-DD). */
export function seed(now = today()) {
  const R = rng(2026);
  const pick = arr => arr[Math.floor(R() * arr.length)];
  const weighted = obj => { const e = Object.entries(obj), t = e.reduce((s, [, w]) => s + w, 0); let x = R() * t; for (const [k, w] of e) { x -= w; if (x <= 0) return k; } return e.at(-1)[0]; };
  const institutions = [
    { id: 'i1', name: 'Centro Universitário Vale Verde', shortName: 'Vale Verde', city: 'Londrina, PR', enrolled: 4200, plan: 'gestao', accent: '#245847', portalName: 'Carreiras Vale Verde' },
    { id: 'i2', name: 'Faculdade Serra Azul', shortName: 'Serra Azul', city: 'Juiz de Fora, MG', enrolled: 2600, plan: 'essencial', accent: '#425e99', portalName: 'Serra Azul Carreiras' },
    { id: 'i3', name: 'Instituto Superior Maré', shortName: 'Maré', city: 'Caruaru, PE', enrolled: 3100, plan: 'gestao', accent: '#7c4d72', portalName: 'Maré Conecta' },
    { id: 'i4', name: 'Faculdade Pinhal Alto', shortName: 'Pinhal Alto', city: 'Passo Fundo, RS', enrolled: 1800, plan: 'gestao', accent: '#8a4b2f', portalName: 'Pinhal Alto Carreiras' },
    { id: 'i5', name: 'Centro Universitário Cerrado Vivo', shortName: 'Cerrado Vivo', city: 'Anápolis, GO', enrolled: 5200, plan: 'essencial', accent: '#2f5f73', portalName: 'Cerrado Vivo Oportunidades' },
    { id: 'i6', name: 'Faculdade Baía Norte', shortName: 'Baía Norte', city: 'Joinville, SC', enrolled: 2300, plan: 'gestao', accent: '#5d5a24', portalName: 'Baía Norte Carreiras' },
  ];
  const PROFILE = {
    i1: { size: 90, mix: { 'Sistemas de Informação': 3, 'Administração': 3, 'Direito': 3, 'Engenharia Civil': 2, 'Ciências Contábeis': 2, 'Design': 1, 'Marketing': 1, 'Psicologia': 1 } },
    i2: { size: 60, mix: { 'Psicologia': 3, 'Direito': 3, 'Pedagogia': 2, 'Enfermagem': 2, 'Marketing': 2, 'Administração': 1, 'Sistemas de Informação': 1 } },
    i3: { size: 75, mix: { 'Administração': 3, 'Pedagogia': 3, 'Ciências Contábeis': 2, 'Marketing': 2, 'Direito': 2, 'Sistemas de Informação': 1 } },
    i4: { size: 45, mix: { 'Agronomia': 4, 'Administração': 3, 'Engenharia Civil': 2, 'Ciências Contábeis': 2, 'Engenharia de Produção': 1 } },
    i5: { size: 110, mix: { 'Enfermagem': 4, 'Direito': 3, 'Sistemas de Informação': 2, 'Marketing': 2, 'Administração': 2, 'Psicologia': 1 } },
    i6: { size: 55, mix: { 'Engenharia de Produção': 3, 'Sistemas de Informação': 3, 'Design': 2, 'Direito': 2, 'Administração': 1 } },
  };
  const C = (id, name, initials, color, ink, sector, city) => ({ id, name, initials, color, ink, sector, city });
  const companies = [
    C('c1', 'Ondaz Tecnologia', 'oz', '#e4ebf7', '#3f5f94', 'Tecnologia e serviços', 'Curitiba, PR'),
    C('c2', 'Lumeo Contabilidade', 'lu', '#e1eee6', '#3b7255', 'Serviços contábeis', 'Londrina, PR'),
    C('c3', 'Casa Ipê Alimentos', 'ci', '#faebdb', '#a07440', 'Indústria de alimentos', 'Juiz de Fora, MG'),
    C('c4', 'Rotavia Logística', 'rv', '#f8e2df', '#b06257', 'Logística', 'Caruaru, PE'),
    C('c5', 'Estúdio Trama', 'tr', '#f0e9fb', '#7954a0', 'Design e comunicação', 'Remoto'),
    C('c6', 'Prumo Alto Engenharia', 'pa', '#eceadf', '#6b6440', 'Construção civil', 'Londrina, PR'),
    C('c7', 'Clínica Ser Integral', 'si', '#e2f0ef', '#2f6f6a', 'Saúde', 'Juiz de Fora, MG'),
    C('c8', 'Cooperativa Agro Coxilha', 'ac', '#e8f0d8', '#55702a', 'Agronegócio', 'Passo Fundo, RS'),
    C('c9', 'Hospital Santa Aurélia', 'sa', '#fde7ea', '#a3404f', 'Saúde', 'Anápolis, GO'),
    C('c10', 'Engrena Metalúrgica', 'en', '#e6e9ee', '#4a5566', 'Indústria metalúrgica', 'Joinville, SC'),
    C('c11', 'Escola Pequeno Saber', 'ps', '#fff1d6', '#9a6a12', 'Educação', 'Caruaru, PE'),
    C('c12', 'Raiz Forte Cooperativa de Crédito', 'rf', '#e0efe9', '#2d6b55', 'Serviços financeiros', 'Passo Fundo, RS'),
    C('c13', 'Vitrine Varejo', 'vv', '#f6e6f3', '#8c3f7d', 'Varejo', 'Anápolis, GO'),
    C('c14', 'Moraes & Bittencourt Advogados', 'mb', '#ebe7df', '#5b4a32', 'Serviços jurídicos', 'Joinville, SC'),
  ];
  const ALL = institutions.map(i => i.id);
  const J = (id, companyId, title, course, type, mode, shift, hours, salary, minSemester, institutionIds, supervisor, location, extra = {}) => {
    const n = 2 + Math.floor(R() * 3), perks = [...BENEFITS].sort(() => R() - 0.5).slice(0, n);
    return { id, companyId, title, course, type, mode, shift, hours, salary, minSemester, institutionIds, supervisor, location, featured: false, status: 'open', createdAt: addDays(now, -1 - Math.floor(R() * 55)),
      description: `${pick(INTROS)(course, minSemester)} Você vai ${ACTIVITIES[course]}, com acompanhamento de ${supervisor || 'um gestor do time'}. Não exigimos experiência anterior: valorizamos projetos da faculdade e vontade de aprender.`,
      benefits: type === 'Estágio' ? ['Bolsa-auxílio', ...perks] : ['CLT', ...perks], ...extra };
  };
  const jobs = [
    J('j1', 'c1', 'Estágio em Desenvolvimento Web', 'Sistemas de Informação', 'Estágio', 'Remoto', 'Tarde', 30, 1500, 3, ALL, 'Carla Mendes', 'Remoto', { featured: true }),
    J('j2', 'c1', 'Estágio em Suporte e Dados', 'Sistemas de Informação', 'Estágio', 'Híbrido', 'Manhã', 25, 1300, 2, ['i1', 'i6'], 'Diego Ramos', 'Curitiba, PR'),
    J('j3', 'c2', 'Estágio em Contabilidade e Finanças', 'Ciências Contábeis', 'Estágio', 'Presencial', 'Tarde', 30, 1200, 3, ['i1'], 'Renata Sá', 'Londrina, PR'),
    J('j4', 'c3', 'Estágio em Marketing', 'Marketing', 'Estágio', 'Híbrido', 'Manhã', 25, 1250, 2, ['i2'], 'Lívia Prado', 'Juiz de Fora, MG'),
    J('j5', 'c4', 'Estágio em Operações Logísticas', 'Administração', 'Estágio', 'Presencial', 'Manhã', 30, 1300, 4, ['i3'], 'Fábio Neves', 'Caruaru, PE'),
    J('j6', 'c5', 'Estágio em Design Gráfico', 'Design', 'Estágio', 'Remoto', 'Tarde', 20, 1100, 2, ALL, 'Íris Tavares', 'Remoto', { featured: true }),
    J('j7', 'c6', 'Estágio em Engenharia Civil (Obras)', 'Engenharia Civil', 'Estágio', 'Presencial', 'Manhã', 30, 1600, 5, ['i1'], 'Eng. Paulo Brandão', 'Londrina, PR'),
    J('j8', 'c7', 'Estágio em Psicologia Organizacional', 'Psicologia', 'Estágio', 'Presencial', 'Tarde', 20, 1000, 6, ['i2'], 'Dra. Cecília Maia', 'Juiz de Fora, MG'),
    J('j9', 'c1', 'Estágio em Marketing Digital', 'Marketing', 'Estágio', 'Remoto', 'Tarde', 25, 1300, 3, ALL, 'Bruna Lacerda', 'Remoto'),
    J('j10', 'c2', 'Estágio Jurídico Tributário', 'Direito', 'Estágio', 'Presencial', 'Tarde', 25, 1200, 4, ['i1'], 'Dr. Álvaro Reis', 'Londrina, PR'),
    J('j11', 'c1', 'Desenvolvedor(a) Júnior', 'Sistemas de Informação', 'Primeiro emprego', 'Remoto', 'Manhã', 40, 3200, 7, ALL, '', 'Remoto'),
    J('j12', 'c1', 'Estágio em Produto Digital (UX)', 'Design', 'Estágio', 'Remoto', 'Tarde', 20, 1400, 4, ALL, 'Tomás Viana', 'Remoto', { status: 'closed' }),
    J('j13', 'c3', 'Estágio em Controle de Qualidade', 'Engenharia de Produção', 'Estágio', 'Presencial', 'Manhã', 30, 1350, 5, ['i2', 'i6'], 'Sérgio Lemos', 'Juiz de Fora, MG'),
    J('j14', 'c4', 'Analista de Logística Júnior', 'Administração', 'Primeiro emprego', 'Presencial', 'Manhã', 44, 2600, 7, ['i3'], '', 'Caruaru, PE'),
    J('j15', 'c5', 'Estágio em Social Media', 'Marketing', 'Estágio', 'Remoto', 'Manhã', 20, 1000, 1, ALL, 'Íris Tavares', 'Remoto'),
    J('j16', 'c6', 'Estágio em Orçamento de Obras', 'Engenharia Civil', 'Estágio', 'Híbrido', 'Tarde', 24, 1450, 6, ['i1', 'i4'], 'Eng. Marta Quintana', 'Londrina, PR'),
    J('j17', 'c7', 'Estágio em Psicologia Clínica (triagem)', 'Psicologia', 'Estágio', 'Presencial', 'Manhã', 20, 900, 7, ['i2'], 'Dra. Cecília Maia', 'Juiz de Fora, MG', { status: 'closed' }),
    J('j18', 'c8', 'Estágio em Agronomia de Campo', 'Agronomia', 'Estágio', 'Presencial', 'Manhã', 30, 1800, 5, ['i4'], 'Eng. Agr. Nelson Weber', 'Passo Fundo, RS', { featured: true }),
    J('j19', 'c8', 'Estágio em Gestão de Cooperados', 'Administração', 'Estágio', 'Híbrido', 'Tarde', 25, 1400, 3, ['i4'], 'Gisele Ritter', 'Passo Fundo, RS'),
    J('j20', 'c9', 'Estágio em Enfermagem Hospitalar', 'Enfermagem', 'Estágio', 'Presencial', 'Manhã', 30, 1200, 6, ['i5'], 'Enf. Rosana Paiva', 'Anápolis, GO', { featured: true }),
    J('j21', 'c9', 'Estágio em Faturamento Hospitalar', 'Administração', 'Estágio', 'Presencial', 'Tarde', 25, 1100, 2, ['i5'], 'Marcelo Antunes', 'Anápolis, GO'),
    J('j22', 'c10', 'Estágio em Engenharia de Produção', 'Engenharia de Produção', 'Estágio', 'Presencial', 'Manhã', 30, 1900, 4, ['i6', 'i4'], 'Eng. Frederico Lenz', 'Joinville, SC'),
    J('j23', 'c10', 'Estágio em Automação de Processos', 'Sistemas de Informação', 'Estágio', 'Presencial', 'Tarde', 30, 1700, 4, ['i6'], 'Helena Krause', 'Joinville, SC'),
    J('j24', 'c11', 'Estágio em Educação Infantil', 'Pedagogia', 'Estágio', 'Presencial', 'Manhã', 20, 850, 2, ['i3'], 'Profa. Rejane Lins', 'Caruaru, PE'),
    J('j25', 'c11', 'Auxiliar de Coordenação Pedagógica', 'Pedagogia', 'Primeiro emprego', 'Presencial', 'Tarde', 30, 1900, 7, ['i3'], '', 'Caruaru, PE'),
    J('j26', 'c12', 'Estágio em Análise de Crédito', 'Ciências Contábeis', 'Estágio', 'Presencial', 'Tarde', 25, 1500, 4, ['i4', 'i1'], 'Ricardo Dalla Costa', 'Passo Fundo, RS'),
    J('j27', 'c13', 'Estágio em Trade Marketing', 'Marketing', 'Estágio', 'Presencial', 'Manhã', 30, 1150, 3, ['i5'], 'Priscila Rezende', 'Anápolis, GO'),
    J('j28', 'c13', 'Estágio em Dados de Vendas', 'Sistemas de Informação', 'Estágio', 'Híbrido', 'Tarde', 25, 1400, 3, ['i5'], 'Fábio Cunha', 'Anápolis, GO'),
    J('j29', 'c14', 'Estágio em Direito Empresarial', 'Direito', 'Estágio', 'Presencial', 'Tarde', 25, 1600, 5, ['i6'], 'Dra. Luísa Bittencourt', 'Joinville, SC'),
    J('j30', 'c14', 'Estágio em Direito do Trabalho', 'Direito', 'Estágio', 'Híbrido', 'Manhã', 20, 1300, 3, ['i6', 'i1'], 'Dr. Paulo Moraes', 'Joinville, SC'),
    J('j31', 'c7', 'Estágio em Enfermagem Ambulatorial', 'Enfermagem', 'Estágio', 'Presencial', 'Tarde', 24, 950, 5, ['i2'], 'Enf. Tânia Barros', 'Juiz de Fora, MG'),
    J('j32', 'c3', 'Estágio em Recursos Humanos', 'Psicologia', 'Estágio', 'Híbrido', 'Manhã', 20, 1100, 4, ['i2'], 'Lívia Prado', 'Juiz de Fora, MG'),
  ];

  const P = (id, institutionId, name, course, semester, shift, age, headline, bio, project, skills) => ({ id, institutionId, name, course, semester, shift, age, headline, bio, project, skills });
  const students = [
    P('s1', 'i1', 'Lucas Ferreira', 'Sistemas de Informação', 3, 'Noite', 21, 'Desenvolvedor em formação, buscando o primeiro estágio', 'Trabalho de dia fora da área e estudo à noite. Quero meu primeiro estágio em desenvolvimento para começar a carreira ainda durante o curso.', 'App de organização de estudos em React, feito na disciplina de Programação Web', ['JavaScript', 'React', 'Git']),
    P('s2', 'i2', 'Marina Costa', 'Psicologia', 6, 'Noite', 24, 'Psicologia organizacional e pessoas', 'Fiz estágio voluntário no CRAS e quero atuar com pessoas nas empresas.', 'Grupo de apoio a calouros', ['Escuta ativa', 'Recrutamento', 'Dinâmicas de grupo']),
    P('s3', 'i3', 'Rafael Lima', 'Administração', 5, 'Noite', 26, 'Administração com foco em operações', 'Trabalho no comércio da família e quero aprender gestão na prática.', 'Plano de melhoria de estoque para um comércio local', ['Excel', 'Finanças', 'Processos']),
    P('s4', 'i4', 'Bruna Schmidt', 'Agronomia', 5, 'Noite', 22, 'Agronomia e agricultura de precisão', 'Cresci no interior e quero levar tecnologia para o campo.', 'Mapa de produtividade com drone', ['Manejo de solo', 'Agricultura de precisão', 'Topografia']),
    P('s5', 'i5', 'Kauã Batista', 'Enfermagem', 7, 'Noite', 27, 'Enfermagem com foco em urgência', 'Sou técnico de enfermagem há 5 anos e estou terminando a graduação.', 'Campanha de vacinação na escola do bairro', ['Sinais vitais', 'Acolhimento', 'Biossegurança']),
    P('s6', 'i6', 'Ana Clara Yamamoto', 'Engenharia de Produção', 4, 'Noite', 22, 'Melhoria de processos e indústria', 'Participo da empresa júnior e gosto de resolver problemas de fábrica.', 'Redução de desperdício em uma confecção', ['Lean', 'Excel', 'PCP']),
  ];
  const featured = new Set(students.map(s => s.id));
  let n = students.length + 1;
  for (const inst of institutions) {
    const prof = PROFILE[inst.id];
    for (let k = 1; k < prof.size; k++) {
      const course = weighted(prof.mix), r = R();
      const age = r < 0.6 ? 18 + Math.floor(R() * 7) : r < 0.85 ? 25 + Math.floor(R() * 8) : 33 + Math.floor(R() * 13);
      const sr = R(), shift = sr < 0.65 ? 'Noite' : sr < 0.92 ? 'Manhã' : 'Tarde';
      const semester = 1 + Math.floor(R() * (course === 'Engenharia Civil' || course === 'Engenharia de Produção' || course === 'Direito' || course === 'Agronomia' || course === 'Psicologia' ? 10 : 8));
      const skills = [...SKILLS[course]].sort(() => R() - 0.5).slice(0, 2 + Math.floor(R() * 2));
      const rich = R() < 0.55;
      students.push(P(`s${n++}`, inst.id, `${pick(FIRST)} ${pick(LAST)}`, course, semester, shift, age, pick(HEADLINES)(course),
        rich ? pick(age > 30 ? BIOS_ADULT : BIOS_YOUNG) : '', rich ? pick(PROJECTS[course]) : '', skills));
    }
  }

  const state = { version: VERSION, institutions, students, companies, jobs, applications: [], internships: [], saved: [], recommendations: [], context: { role: 'faculdade', institutionId: 'i1', companyId } };

  for (const s of students) {
    if (featured.has(s.id)) continue;
    const chance = 0.25 + Math.min(s.semester, 8) * 0.06;
    if (R() > chance) continue;
    const options = jobsForStudent(state, s).filter(x => x.compatible).sort(() => R() - 0.5);
    if (!options.length) continue;
    let hired = false;
    for (const { job } of options.slice(0, 1 + Math.floor(R() * 3))) {
      const r = R();
      const stage = hired ? (r < 0.7 ? 'Inscrito' : 'Em análise') : r < 0.38 ? 'Inscrito' : r < 0.58 ? 'Em análise' : r < 0.74 ? 'Entrevista' : 'Contratado';
      const app = { id: `a${state.applications.length + 1}`, vacancyId: job.id, studentId: s.id, stage, createdAt: addDays(now, -1 - Math.floor(R() * 75)) };
      state.applications.push(app);
      if (stage === 'Contratado') {
        hired = true;
        const start = addDays(now, -Math.floor(5 + R() * 430));
        const it = makeInternship(state, app, start, pick(PROFS), { empresa: start, aluno: start, faculdade: start }, now, R);
        const q = R();
        if (D_recent(start, now) && q < 0.5) { it.signatures.faculdade = null; if (q < 0.15) it.signatures.aluno = null; }
        if (it.reports.some(x => x.status === 'pendente' && x.due < now) && R() < 0.5) it.reminders.push(addDays(now, -Math.floor(1 + R() * 10)));
        state.internships.push(it);
      }
    }
  }
  // Situações garantidas para a demonstração na Vale Verde (i1).
  const i1 = state.internships.filter(it => it.institutionId === 'i1' && it.end >= now);
  if (i1.at(0)) { const it = i1.at(0); it.start = addDays(now, 7); it.end = addDays(it.start, 365); it.signatures = { empresa: addDays(now, -2), aluno: addDays(now, -1), faculdade: null }; it.reports = [{ id: uid(), due: addDays(it.start, 182), status: 'pendente' }]; it.reminders = []; }
  if (i1.at(1)) { const it = i1.at(1); it.start = addDays(now, -200); it.end = addDays(it.start, 365); it.signatures = { empresa: it.start, aluno: it.start, faculdade: it.start }; it.reports = [{ id: uid(), due: addDays(it.start, 182), status: 'pendente' }]; it.reminders = []; }
  if (i1.at(2)) { const it = i1.at(2); it.start = addDays(now, -175); it.end = addDays(it.start, 365); it.signatures = { empresa: it.start, aluno: it.start, faculdade: it.start }; it.reports = [{ id: uid(), due: addDays(it.start, 182), status: 'entregue', submittedAt: addDays(now, -1) }]; }
  // Indicações das faculdades: 2 a 4 por faculdade, parte delas já virou candidatura.
  for (const inst of institutions) {
    const pool = studentsOf(state, inst.id).filter(s => !featured.has(s.id) && !state.internships.some(it => it.studentId === s.id));
    for (let k = 0, made = 0; k < pool.length && made < 2 + Math.floor(R() * 3); k++) {
      const s = pool.at(Math.floor(R() * pool.length)), opt = jobsForStudent(state, s).find(x => x.compatible);
      if (!opt || state.recommendations.some(r => r.studentId === s.id)) continue;
      state.recommendations.push({ studentId: s.id, vacancyId: opt.job.id, institutionId: inst.id }); made++;
      if (R() < 0.6 && !state.applications.some(a => a.studentId === s.id && a.vacancyId === opt.job.id)) state.applications.push({ id: `a${state.applications.length + 1}`, vacancyId: opt.job.id, studentId: s.id, stage: R() < 0.5 ? 'Em análise' : 'Entrevista', createdAt: addDays(now, -1 - Math.floor(R() * 10)) });
    }
  }
  return state;
}
const D_recent = (start, now) => daysBetween(start, now) < 60;

function makeInternship(state, app, start, orientador, signatures, now, R = Math.random) {
  const job = state.jobs.find(j => j.id === app.vacancyId), s = state.students.find(x => x.id === app.studentId);
  const end = addDays(start, 365), reports = [];
  const due1 = addDays(start, 182), due2 = addDays(start, 364);
  if (end < now) {
    reports.push({ id: uid(), due: due1, status: 'aprovado', submittedAt: addDays(due1, -4), approvedAt: addDays(due1, 2) });
    reports.push({ id: uid(), due: due2, status: 'aprovado', submittedAt: addDays(due2, -2), approvedAt: addDays(due2, 3) });
  } else if (due1 < now) {
    const r = R();
    if (r < 0.55) { reports.push({ id: uid(), due: due1, status: 'aprovado', submittedAt: addDays(due1, -3), approvedAt: due1 }); reports.push({ id: uid(), due: due2, status: 'pendente' }); }
    else if (r < 0.78) reports.push({ id: uid(), due: due1, status: 'entregue', submittedAt: addDays(due1, -1) });
    else reports.push({ id: uid(), due: due1, status: 'pendente' });
  } else reports.push({ id: uid(), due: due1, status: 'pendente' });
  return { id: `e-${app.id}`, applicationId: app.id, studentId: s.id, institutionId: s.institutionId, companyId: job.companyId, vacancyId: job.id,
    start, end, hours: job.hours, salary: job.salary, supervisor: job.supervisor || 'Gestor(a) da área', orientador,
    signatures, reports, insurance: `Apólice simulada nº ${String(100000 + Math.floor(R() * 899999))}`, reminders: [] };
}

/* ---------- consultas ---------- */
export const studentFor = (state, institutionId) => state.students.find(s => s.institutionId === institutionId);
export const studentsOf = (state, institutionId) => state.students.filter(s => s.institutionId === institutionId);
export const visibleJobs = (state, institutionId) => state.jobs.filter(j => j.status === 'open' && j.institutionIds.includes(institutionId));
export const employerJobs = state => state.jobs.filter(j => j.companyId === currentCompanyId(state));
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
  const its = state.internships.filter(it => it.companyId === currentCompanyId(state));
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
  const job = { id: uid(), companyId: currentCompanyId(state), title, description, course: data.course, type: data.type, mode: data.mode, shift: data.shift, location: String(data.location || '').trim() || 'A combinar',
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
    if (!s.companies.some(c => c.id === s.context.companyId)) s.context.companyId = companyId;
    return s;
  } catch { return seed(); }
}
