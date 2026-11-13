import * as D from './domain.mjs';

/* ------------------------------------------------------------------ *
 * Oportuniza Rede v2 — a central de carreiras e estágios das faculdades
 * Três perfis: Faculdade (quem adota), Empresa (quem paga), Aluno (quem usa).
 * Estado em localStorage; toda mutação passa pelo domínio, salva e redesenha.
 * ------------------------------------------------------------------ */

const KEY = 'oportuniza-rede-v2';
const NAV = {
  faculdade: [['painel', 'Painel'], ['estagios', 'Estágios'], ['talentos', 'Talentos'], ['empresas', 'Empresas da rede'], ['portal', 'Portal e plano']],
  empresa: [['painel', 'Painel'], ['vagas', 'Minhas vagas'], ['candidatos', 'Candidatos'], ['estagiarios', 'Estagiários']],
  aluno: [['vagas', 'Vagas'], ['candidaturas', 'Candidaturas'], ['estagio', 'Meu estágio'], ['perfil', 'Meu perfil']],
};
const ROLE_LABEL = { faculdade: 'Faculdade', empresa: 'Empresa', aluno: 'Aluno' };
const ACCENTS = [['#245847', 'Verde'], ['#425e99', 'Azul'], ['#7c4d72', 'Ameixa'], ['#8a4b2f', 'Terracota'], ['#2f5f73', 'Petróleo'], ['#5d5a24', 'Oliva']];
const PARTY = { empresa: 'Empresa', aluno: 'Aluno', faculdade: 'Faculdade' };

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
};

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = v => String(v ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const money = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
const num = n => new Intl.NumberFormat('pt-BR').format(n);
const pct = x => `${Math.round(x * 100)}%`;
const fmtDate = v => { const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? `${v}T12:00:00` : v); return isNaN(d) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); };
const initials = name => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
const firstName = name => String(name || '').split(/\s+/)[0];
const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : many}`;
const opts = (list, val) => list.map(v => { const [value, label] = Array.isArray(v) ? v : [v, v]; return `<option value="${esc(value)}"${String(value) === String(val) ? ' selected' : ''}>${esc(label)}</option>`; }).join('');
const now = () => D.today();

/* ---------- estado ---------- */
let storageOk = true;
function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? D.restore(raw) : D.seed(); }
  catch { storageOk = false; return D.seed(); }
}
function persist() {
  if (!storageOk) return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { storageOk = false; }
}
let state = load();
const ui = { q: '', type: '', mode: '', onlyCompatible: true, board: '', talentCourse: '', talentFree: false, talentLimit: 20, estStatus: '' };
let lastRoute = '';

const inst = () => state.institutions.find(i => i.id === state.context.institutionId) || state.institutions[0];
const student = () => D.studentFor(state, inst().id);
const job = id => state.jobs.find(j => j.id === id);
const company = id => state.companies.find(c => c.id === id) || { name: 'Empresa', initials: '?', color: '#eee', ink: '#333', sector: '', city: '' };
const studentById = id => state.students.find(s => s.id === id);
const instById = id => state.institutions.find(i => i.id === id);
const appFor = (vacancyId, studentId) => state.applications.find(a => a.vacancyId === vacancyId && a.studentId === studentId);
const internshipOfStudent = sid => state.internships.find(it => it.studentId === sid && D.internshipStatus(it, now()) !== 'Encerrado');
const recommenders = (sid, vid) => state.recommendations.filter(r => r.studentId === sid && r.vacancyId === vid).map(r => instById(r.institutionId)?.shortName).filter(Boolean);
const safeAccent = a => (D.accentPattern.test(a || '') ? a : '#245847');

function mutate(fn, message) {
  try { const r = fn(state); persist(); render(); if (message) toast(typeof message === 'function' ? message(r) : message); return true; }
  catch (e) { toast(e.message || 'Algo deu errado.', 'error'); return false; }
}

/* ---------- feedback e diálogo ---------- */
let toastTimer;
function toast(msg, kind = 'ok') {
  const t = $('#toast'); t.textContent = msg; t.className = `toast show ${kind}`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.className = 'toast'; }, 4000);
}
let lastFocus = null;
function openModal(html) {
  const m = $('#modal'); lastFocus = document.activeElement;
  m.innerHTML = html; m.setAttribute('aria-labelledby', 'modal-title'); m.showModal();
  (m.querySelector('[autofocus]') || m.querySelector('input,select,textarea,button'))?.focus();
}
function closeModal() { const m = $('#modal'); if (m.open) m.close(); }
$('#modal').addEventListener('close', () => { $('#modal').innerHTML = ''; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); else $('#main h1')?.focus(); });
$('#modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
const modalHead = title => `<header class="modal-head"><h2 id="modal-title">${esc(title)}</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Fechar">${ICON.close}</button></header>`;

/* ---------- componentes ---------- */
const logo = (c, size = '') => `<span class="logo ${size}" style="--logo-bg:${esc(c.color)};--logo-ink:${esc(c.ink)}" aria-hidden="true">${esc(c.initials)}</span>`;
const avatar = (name, size = '') => `<span class="avatar ${size}" aria-hidden="true">${esc(initials(name))}</span>`;
const tags = list => `<ul class="tags">${list.filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
const jobTags = j => tags([j.type, j.mode, `Turno: ${j.shift}`, `${j.hours}h/semana`, `A partir do ${j.minSemester}º sem.`]);
const stepper = stage => {
  const idx = D.stages.indexOf(stage);
  return `<ol class="stepper" aria-label="Etapa atual: ${esc(stage)}">${D.stages.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'current' : ''}"${i === idx ? ' aria-current="step"' : ''}><span>${esc(s)}</span></li>`).join('')}</ol>`;
};
const empty = (title, text, action = '') => `<div class="empty card"><h2>${esc(title)}</h2><p>${esc(text)}</p>${action}</div>`;
const metric = (value, label, note = '', accent = false) => `<div class="metric card${accent ? ' accent' : ''}"><strong>${esc(value)}</strong><span>${esc(label)}</span>${note ? `<small>${esc(note)}</small>` : ''}</div>`;
const pageHead = (eyebrow, title, lead = '', actions = '') => `<header class="page-head"><div><p class="eyebrow">${esc(eyebrow)}</p><h1 tabindex="-1">${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</div>${actions ? `<div class="head-actions">${actions}</div>` : ''}</header>`;
const STATUS_CLASS = { 'Ativo': 'ok', 'Aguardando assinaturas': 'warn', 'Relatório atrasado': 'bad', 'Encerrado': 'off', 'Assinado, começa em breve': 'info' };
const statusChip = it => { const s = D.internshipStatus(it, now()); return `<span class="chip ${STATUS_CLASS[s] || ''}">${esc(s)}</span>`; };
const sigs = it => `<ul class="sigs" aria-label="Assinaturas do termo">${Object.keys(PARTY).map(p => `<li class="${it.signatures[p] ? 'on' : ''}">${it.signatures[p] ? ICON.check : ICON.clock}<span>${PARTY[p]}${it.signatures[p] ? '' : ' (pendente)'}</span></li>`).join('')}</ul>`;
function reportLine(it) {
  const r = D.nextReport(it); if (!r) return '<span class="muted small">Relatórios em dia</span>';
  const d = D.daysBetween(now(), r.due);
  if (r.status === 'entregue') return `<span class="small">${ICON.doc} Relatório entregue em ${esc(fmtDate(r.submittedAt))}, aguardando aprovação</span>`;
  if (d < 0) return `<span class="small bad-text">${ICON.alert} Relatório semestral atrasado há ${plural(-d, 'dia', 'dias')}</span>`;
  return `<span class="small muted">${ICON.clock} Próximo relatório em ${esc(fmtDate(r.due))} (${plural(d, 'dia', 'dias')})</span>`;
}

/* ---------- FACULDADE ---------- */
function pendItem(icon, text, action = '') { return `<li class="pend">${icon}<span class="grow">${text}</span>${action}</li>`; }
function faculdadePainel() {
  const i = inst(), m = D.institutionMetrics(state, i.id, now()), p = m.pending;
  const who = it => `<strong>${esc(studentById(it.studentId)?.name)}</strong> · ${esc(company(it.companyId).name)}`;
  const items = [
    ...p.signatures.map(it => pendItem(ICON.doc, `Termo de ${who(it)} aguarda a assinatura da faculdade`, `<button type="button" class="btn small primary" data-action="sign" data-id="${esc(it.id)}" data-party="faculdade">Assinar termo</button>`)),
    ...p.overdue.map(it => { const r = D.nextReport(it); return pendItem(ICON.alert, `Relatório de ${who(it)} atrasado há ${plural(-D.daysBetween(now(), r.due), 'dia', 'dias')}`, `<button type="button" class="btn small" data-action="remind" data-id="${esc(it.id)}">${it.reminders.length ? 'Cobrar de novo' : 'Cobrar'}</button>`); }),
    ...p.toApprove.map(it => pendItem(ICON.doc, `Relatório de ${who(it)} entregue para análise`, `<button type="button" class="btn small" data-action="approve" data-id="${esc(it.id)}">Aprovar</button>`)),
    ...p.dueSoon.map(it => { const r = D.nextReport(it); return pendItem(ICON.clock, `Relatório de ${who(it)} vence em ${plural(D.daysBetween(now(), r.due), 'dia', 'dias')}`); }),
  ];
  const recent = state.applications.filter(a => studentById(a.studentId)?.institutionId === i.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  const exportBtn = i.plan === 'gestao'
    ? `<button type="button" class="btn" data-action="export">${ICON.download}Exportar relatório de empregabilidade</button>`
    : `<a class="btn ghost" href="#/faculdade/portal" title="Disponível no plano Gestão">${ICON.download}Relatório de empregabilidade (plano Gestão)</a>`;
  return pageHead(D.portalName(i), i.name, `${i.city} · ${num(i.enrolled)} alunos matriculados · plano ${i.plan === 'gestao' ? 'Gestão' : 'Essencial'}`, exportBtn) +
    `<div class="metrics">${metric(num(m.students), 'Alunos na plataforma')}${metric(num(m.interning), 'Estagiando agora', `${pct(m.pct)} dos alunos na plataforma`, true)}${metric(num(m.hiresSemester), 'Contratações no semestre')}${metric(num(m.companies), 'Empresas com estagiários seus', `${m.vacancies} vagas abertas para seus alunos`)}</div>
    <div class="two-col">
      <section class="card"><div class="section-head"><h2>Pendências de estágio</h2><a href="#/faculdade/estagios">Ver todos os estágios</a></div>
        ${items.length ? `<ul class="plain-list pend-list">${items.join('')}</ul>` : '<p class="ok-line">' + ICON.check + 'Nenhuma pendência: termos e relatórios em dia.</p>'}
        <p class="muted small">Pela Lei do Estágio, a faculdade assina o termo de compromisso e acompanha relatórios a cada 6 meses.</p></section>
      <section class="card"><h2>Estagiando por curso</h2><p class="muted small">Alunos com estágio ativo sobre o total do curso na plataforma.</p>
        <ul class="bars wide">${m.byCourse.map(c => `<li><span>${esc(c.course)}</span><span class="bar" aria-hidden="true"><i style="width:${Math.max(c.pct * 100, 1)}%"></i></span><strong>${pct(c.pct)}</strong><small class="muted">${c.interns}/${c.students}</small></li>`).join('')}</ul></section>
    </div>
    <section class="card"><div class="section-head"><h2>Candidaturas recentes dos seus alunos</h2><a href="#/faculdade/talentos">Ver talentos</a></div>
      ${recent.length ? `<ul class="plain-list divided">${recent.map(a => { const s = studentById(a.studentId), j = job(a.vacancyId); return `<li class="row">${avatar(s?.name)}<span class="grow"><strong>${esc(s?.name)}</strong><br><small class="muted">${esc(j?.title)} · ${esc(company(j?.companyId).name)}</small></span><span class="chip stage-${D.stages.indexOf(a.stage)}">${esc(a.stage)}</span></li>`; }).join('')}</ul>` : '<p class="muted">Nenhuma candidatura ainda.</p>'}</section>`;
}

function internshipCard(it, viewer) {
  const s = studentById(it.studentId), j = job(it.vacancyId), c = company(it.companyId), r = D.nextReport(it), st = D.internshipStatus(it, now());
  const actions = [
    `<button type="button" class="btn small ghost" data-action="termo" data-id="${esc(it.id)}">${ICON.doc}Ver termo</button>`,
    viewer === 'faculdade' && !it.signatures.faculdade ? `<button type="button" class="btn small primary" data-action="sign" data-id="${esc(it.id)}" data-party="faculdade">Assinar como faculdade</button>` : '',
    viewer === 'faculdade' && st === 'Relatório atrasado' ? `<button type="button" class="btn small" data-action="remind" data-id="${esc(it.id)}">${it.reminders.length ? 'Cobrar de novo' : 'Cobrar relatório'}</button>` : '',
    viewer === 'faculdade' && r?.status === 'entregue' ? `<button type="button" class="btn small" data-action="approve" data-id="${esc(it.id)}">Aprovar relatório</button>` : '',
    viewer === 'empresa' && r?.status === 'pendente' && D.isActive(it, now()) ? `<button type="button" class="btn small" data-action="report" data-id="${esc(it.id)}">Enviar relatório</button>` : '',
  ].join('');
  return `<article class="card intern">
    <div class="intern-main">
      <div class="app-info">${viewer === 'empresa' ? avatar(s?.name) : logo(c)}<div><h3>${esc(s?.name)}</h3><p>${esc(j?.title)} · ${esc(c.name)}</p><p class="muted small">${esc(s?.course)} · ${esc(s?.semester)}º semestre · ${esc(instById(it.institutionId)?.shortName)}</p></div></div>
      <div class="intern-meta"><span class="muted small">${esc(fmtDate(it.start))} a ${esc(fmtDate(it.end))} · ${it.hours}h/semana · ${money(it.salary)}/mês</span>${reportLine(it)}${it.reminders.length ? `<span class="muted small">Cobrado ${plural(it.reminders.length, 'vez', 'vezes')}, a última em ${esc(fmtDate(it.reminders.at(-1)))}</span>` : ''}</div>
    </div>
    <div class="intern-side">${statusChip(it)}${sigs(it)}<div class="row-actions">${actions}</div></div>
  </article>`;
}

function faculdadeEstagios() {
  const i = inst(), all = D.internshipsOf(state, i.id).sort((a, b) => String(b.start).localeCompare(String(a.start)));
  const statuses = ['Aguardando assinaturas', 'Relatório atrasado', 'Ativo', 'Assinado, começa em breve', 'Encerrado'];
  const list = all.filter(it => !ui.estStatus || D.internshipStatus(it, now()) === ui.estStatus);
  const count = s => all.filter(it => D.internshipStatus(it, now()) === s).length;
  return pageHead(D.portalName(i), 'Estágios', 'Termos de compromisso, assinaturas e relatórios em um lugar só.') +
    `<div class="toolbar card"><label class="field"><span>Situação</span><select data-change="estStatus">${opts([['', `Todas (${all.length})`], ...statuses.map(s => [s, `${s} (${count(s)})`])], ui.estStatus)}</select></label>
      <p class="muted small">Assinaturas e documentos são simulados nesta demonstração.</p></div>` +
    (list.length ? `<div class="stack">${list.map(it => internshipCard(it, 'faculdade')).join('')}</div>` : empty('Nenhum estágio nesta situação', 'Troque o filtro para ver outros estágios.'));
}

function termoDialog(id) {
  const it = state.internships.find(x => x.id === id); if (!it) return;
  const s = studentById(it.studentId), j = job(it.vacancyId), c = company(it.companyId), i = instById(it.institutionId);
  const row = (k, v) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`;
  openModal(`<div class="modal-card">${modalHead('Termo de compromisso de estágio')}
    <div class="modal-body">
      <p class="callout warn"><strong>Simulação:</strong>&nbsp;no piloto, este termo é assinado eletronicamente pelas três partes.</p>
      <dl class="facts">${row('Estudante', `${s?.name} · ${s?.course}, ${s?.semester}º semestre`)}${row('Parte concedente', `${c.name} (${c.city})`)}${row('Instituição de ensino', i?.name)}${row('Atividade', j?.title)}
        ${row('Vigência', `${fmtDate(it.start)} a ${fmtDate(it.end)} (máximo de 2 anos)`)}${row('Jornada', `${it.hours} horas por semana, compatível com o horário de aula`)}${row('Bolsa-auxílio', `${money(it.salary)} por mês`)}${row('Seguro contra acidentes', it.insurance)}
        ${row('Supervisor(a) na empresa', it.supervisor)}${row('Orientação na faculdade', it.orientador)}${row('Relatórios de atividades', 'A cada 6 meses, com visto do estagiário')}${row('Situação', D.internshipStatus(it, now()))}</dl>
      <h3>Assinaturas</h3>${sigs(it)}
      <p class="muted small">${Object.keys(PARTY).map(p => `${PARTY[p]}: ${it.signatures[p] ? `assinou em ${fmtDate(it.signatures[p])}` : 'pendente'}`).join(' · ')}</p>
    </div>
    <footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal" autofocus>Fechar</button></footer></div>`);
}

function faculdadeTalentos() {
  const i = inst();
  let list = D.studentsOf(state, i.id);
  if (ui.talentCourse) list = list.filter(s => s.course === ui.talentCourse);
  if (ui.talentFree) list = list.filter(s => !internshipOfStudent(s.id));
  const shown = list.slice(0, ui.talentLimit);
  const situation = s => {
    const it = internshipOfStudent(s.id); if (it) return `<span class="chip ${STATUS_CLASS[D.internshipStatus(it, now())] || ''}">${D.isActive(it, now()) ? 'Estagiando' : esc(D.internshipStatus(it, now()))}</span>`;
    const apps = state.applications.filter(a => a.studentId === s.id);
    return apps.length ? `<span class="chip stage-1">${plural(apps.length, 'candidatura', 'candidaturas')}</span>` : '<span class="chip off">Sem candidatura</span>';
  };
  return pageHead(D.portalName(i), 'Talentos', 'Seus alunos na rede. Indique quem combina com uma vaga: a empresa vê a indicação da faculdade.') +
    `<div class="toolbar card"><label class="field"><span>Curso</span><select data-change="talentCourse">${opts([['', 'Todos os cursos'], ...D.courses], ui.talentCourse)}</select></label>
      <label class="check"><input type="checkbox" data-change="talentFree"${ui.talentFree ? ' checked' : ''}><span>Só quem ainda não estagia</span></label><p class="muted small">${plural(list.length, 'aluno', 'alunos')}</p></div>
    <ul class="plain-list people-list card">${shown.map(s => `<li class="row">${avatar(s.name)}<span class="grow"><strong>${esc(s.name)}</strong><br><small class="muted">${esc(s.course)} · ${s.semester}º semestre · aula de ${esc(s.shift.toLowerCase())}</small></span>${situation(s)}<button type="button" class="btn small ghost" data-action="recommend" data-id="${esc(s.id)}">Indicar</button></li>`).join('')}</ul>
    ${list.length > shown.length ? `<button type="button" class="btn ghost" data-action="more-talents">Mostrar mais (${list.length - shown.length})</button>` : ''}`;
}

function recommendForm(studentId) {
  const s = studentById(studentId), i = inst();
  const jobs = D.jobsForStudent(state, s).sort((a, b) => Number(b.compatible) - Number(a.compatible));
  return `<form class="modal-card form" data-form="recommend" data-student="${esc(studentId)}">
    ${modalHead(`Indicar ${firstName(s?.name)}`)}
    <div class="modal-body"><p>${esc(s?.name)} · ${esc(s?.course)}, ${s?.semester}º semestre. A indicação aparece para a empresa ao lado do perfil.</p>
      <label class="field"><span>Vaga</span><select name="vacancyId" required autofocus>${opts(jobs.map(({ job: j, compatible }) => [j.id, `${j.title} — ${company(j.companyId).name}${compatible ? ' · compatível' : ''}${recommenders(studentId, j.id).includes(i.shortName) ? ' (já indicado)' : ''}`]), '')}</select></label>
      <p class="form-error" role="alert" hidden></p></div>
    <footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal">Cancelar</button><button type="submit" class="btn primary">Indicar</button></footer></form>`;
}

function faculdadeEmpresas() {
  const i = inst();
  const rows = state.companies.map(c => {
    const open = state.jobs.filter(j => j.companyId === c.id && j.status === 'open' && j.institutionIds.includes(i.id)).length;
    const interns = D.internshipsOf(state, i.id).filter(it => it.companyId === c.id && D.isActive(it, now())).length;
    return { c, open, interns };
  }).filter(r => r.open || r.interns).sort((a, b) => b.interns - a.interns || b.open - a.open);
  return pageHead(D.portalName(i), 'Empresas da rede', `Empresas que publicam vagas para a ${i.shortName} ou já têm estagiários seus. A rede inteira trabalha por você.`, '<button type="button" class="btn primary" data-action="invite">Convidar empresa</button>') +
    `<div class="metrics">${metric(num(state.companies.length), 'Empresas na rede')}${metric(num(rows.length), 'Recrutando seus alunos')}${metric(num(state.institutions.length), 'Faculdades na rede')}</div>
    <div class="stack">${rows.map(({ c, open, interns }) => `<article class="card vac-row">${logo(c)}<div class="grow"><h2 class="h3">${esc(c.name)}</h2><p class="muted small">${esc(c.sector)} · ${esc(c.city)}</p></div><span class="chip">${plural(open, 'vaga aberta', 'vagas abertas')}</span><span class="chip ${interns ? 'ok' : 'off'}">${plural(interns, 'estagiário seu', 'estagiários seus')}</span></article>`).join('')}</div>`;
}

function faculdadePortal() {
  const i = inst(), accent = safeAccent(i.accent);
  const plan = (id, name, price, items) => `<article class="card plan${i.plan === id ? ' current' : ''}"><div class="row-title"><h3>${esc(name)}</h3>${i.plan === id ? '<span class="chip ok">Plano atual</span>' : ''}</div><p class="plan-price">${price}</p><ul class="checks">${items.map(t => `<li>${ICON.check}${esc(t)}</li>`).join('')}</ul>${i.plan === id ? '' : `<button type="button" class="btn small" data-action="set-plan" data-plan="${id}">Mudar para ${esc(name)}</button>`}</article>`;
  return pageHead(D.portalName(i), 'Portal e plano', 'Sua marca na central de carreiras e o plano contratado.') +
    `<div class="two-col">
      <form class="card form" data-form="branding">
        <h2>Portal com a sua marca</h2>
        <label class="field"><span>Nome do portal</span><input name="portalName" maxlength="60" minlength="2" required value="${esc(D.portalName(i))}"></label>
        <fieldset class="field"><legend>Cor de destaque</legend><div class="swatches">${ACCENTS.map(([hex, name]) => `<label class="swatch" style="--sw:${hex}"><input type="radio" name="accent" value="${hex}"${hex.toLowerCase() === accent.toLowerCase() ? ' checked' : ''}><span>${esc(name)}</span></label>`).join('')}</div></fieldset>
        <p class="form-error" role="alert" hidden></p>
        <div class="actions"><button type="submit" class="btn primary">Salvar portal</button></div>
      </form>
      <section class="card preview" id="portal-preview" style="--accent:${accent}" aria-label="Pré-visualização">
        <p class="eyebrow">Como seus alunos veem</p>
        <div class="preview-bar"><span class="preview-logo" aria-hidden="true"></span><strong data-preview-name>${esc(D.portalName(i))}</strong></div>
        <p class="preview-title">Pedem experiência para te dar experiência. Aqui é diferente.</p>
        <span class="btn primary">Ver vagas para mim</span>
      </section>
    </div>
    <h2 class="section-title">Plano</h2>
    <div class="plans">${plan('essencial', 'Essencial', 'Grátis', ['Portal com a marca da faculdade', 'Vagas de toda a rede para seus alunos', 'Indicação de talentos'])}
      ${plan('gestao', 'Gestão', `${money(D.PRICE.student)} por aluno por mês <small>(mínimo ${money(D.PRICE.minPlan)}) · para você: ${money(Math.max(D.PRICE.minPlan, i.enrolled * D.PRICE.student))}/mês</small>`, ['Tudo do Essencial', 'Termo de estágio digital e assinatura eletrônica', 'Alertas de relatórios e prazos', 'Relatório de empregabilidade para o MEC e a CPA'])}</div>
    <p class="muted small">Empresas pagam ${money(D.PRICE.intern)} por estagiário ativo por mês; publicar vagas é gratuito. Alunos nunca pagam.</p>`;
}

/* ---------- EMPRESA ---------- */
const myCompany = () => company(D.companyId);
const employerApps = () => { const ids = new Set(D.employerJobs(state).map(j => j.id)); return state.applications.filter(a => ids.has(a.vacancyId)); };

function empresaPainel() {
  const c = myCompany(), m = D.employerMetrics(state, now());
  const recent = [...employerApps()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  return pageHead('Empresa', c.name, `${c.sector} · recrutando em ${plural(m.institutions, 'faculdade', 'faculdades')} da rede.`, '<button type="button" class="btn primary" data-action="new-job">Publicar vaga</button>') +
    `<div class="metrics">${metric(m.open, 'Vagas abertas')}${metric(m.applications, 'Candidaturas')}${metric(m.interviews, 'Em entrevista')}${metric(m.active, 'Estagiários ativos', m.pendingSign ? `${m.pendingSign} termo(s) aguardando assinatura` : '', true)}</div>
    <div class="two-col">
      <section class="card bill"><h2>Fatura estimada deste mês</h2>
        <p class="bill-total">${money(m.bill)}</p>
        <p class="muted">${plural(m.active, 'estagiário ativo', 'estagiários ativos')} × ${money(D.PRICE.intern)}. Inclui termo digital, controle de jornada e relatórios.</p>
        <p class="muted small">Publicar vagas e receber candidaturas é gratuito. Você só paga por estagiário com termo assinado.</p></section>
      <section class="card"><div class="section-head"><h2>Relatórios a enviar</h2><a href="#/empresa/estagiarios">Ver estagiários</a></div>
        ${m.reportsDue.length ? `<ul class="plain-list pend-list">${m.reportsDue.map(it => pendItem(ICON.doc, `<strong>${esc(studentById(it.studentId)?.name)}</strong> · relatório até ${esc(fmtDate(D.nextReport(it)?.due))}`, `<button type="button" class="btn small" data-action="report" data-id="${esc(it.id)}">Enviar</button>`)).join('')}</ul>` : `<p class="ok-line">${ICON.check}Nenhum relatório vencendo nos próximos 30 dias.</p>`}</section>
    </div>
    <section class="card"><div class="section-head"><h2>Candidaturas recentes</h2><a href="#/empresa/candidatos">Ver todas</a></div>
      ${recent.length ? `<ul class="plain-list divided">${recent.map(a => { const s = studentById(a.studentId), j = job(a.vacancyId); return `<li class="row">${avatar(s?.name)}<span class="grow"><strong>${esc(s?.name)}</strong><br><small class="muted">${esc(j?.title)} · ${esc(instById(s?.institutionId)?.shortName)}</small></span><span class="chip stage-${D.stages.indexOf(a.stage)}">${esc(a.stage)}</span></li>`; }).join('')}</ul>` : '<p class="muted">Nenhuma candidatura ainda.</p>'}</section>`;
}

function empresaVagas() {
  const jobs = D.employerJobs(state), apps = employerApps();
  return pageHead('Empresa', 'Minhas vagas', 'Publique uma vez e alcance alunos de várias faculdades.', '<button type="button" class="btn primary" data-action="new-job">Publicar vaga</button>') +
    (jobs.length ? `<div class="stack">${jobs.map(j => {
      const n = apps.filter(a => a.vacancyId === j.id).length, open = j.status === 'open';
      return `<article class="card vac-row${open ? '' : ' is-closed'}"><div class="grow"><div class="row-title"><h2 class="h3">${esc(j.title)}</h2><span class="chip ${open ? 'ok' : 'off'}">${open ? 'Aberta' : 'Encerrada'}</span></div>
        ${jobTags(j)}<p class="muted small">${esc(j.course)} · faculdades: ${esc(j.institutionIds.map(x => instById(x)?.shortName).filter(Boolean).join(', '))} · ${money(j.salary)}/mês</p></div>
        <div class="row-actions"><button type="button" class="btn small" data-action="see-candidates" data-id="${esc(j.id)}">${plural(n, 'candidato', 'candidatos')}</button><button type="button" class="btn small ghost" data-action="toggle-status" data-id="${esc(j.id)}">${open ? 'Encerrar' : 'Reabrir'}</button></div></article>`;
    }).join('')}</div>` : empty('Nenhuma vaga publicada', 'Publique a primeira vaga para receber candidaturas.'));
}

function empresaCandidatos() {
  const jobs = D.employerJobs(state);
  if (ui.board && !jobs.some(j => j.id === ui.board)) ui.board = '';
  const apps = employerApps().filter(a => !ui.board || a.vacancyId === ui.board);
  const card = a => {
    const s = studentById(a.studentId), j = job(a.vacancyId), recs = recommenders(a.studentId, a.vacancyId), idx = D.stages.indexOf(a.stage), closed = j?.status !== 'open';
    const it = state.internships.find(x => x.applicationId === a.id);
    return `<article class="card cand">
      <div class="cand-head">${avatar(s?.name)}<div><h3>${esc(s?.name)}</h3><p>${esc(s?.course)} · ${s?.semester}º sem. · ${esc(instById(s?.institutionId)?.shortName)}</p></div></div>
      <p class="cand-job">${esc(j?.title)}</p>
      ${recs.length ? `<p class="chip rec">${ICON.star}Indicado por ${esc(recs.join(', '))}</p>` : ''}
      ${it ? `<div class="cand-termo">${statusChip(it)}</div>` : ''}
      <label class="field compact"><span>Etapa</span><select data-change="stage" data-id="${esc(a.id)}"${closed ? ' disabled' : ''}>${opts(D.stages, a.stage)}</select></label>
      ${closed ? '<p class="muted small">Vaga encerrada: reabra para mover.</p>' : idx < D.stages.length - 1 ? `<button type="button" class="btn small block${idx === 2 ? ' primary' : ''}" data-action="advance" data-id="${esc(a.id)}">${idx === 2 ? 'Contratar e gerar termo' : `Avançar para ${esc(D.stages[idx + 1])}`}</button>` : ''}
    </article>`;
  };
  return pageHead('Empresa', 'Candidatos', 'Ao contratar, o termo de estágio é gerado e enviado ao aluno e à faculdade.') +
    `<div class="toolbar card"><label class="field"><span>Vaga</span><select data-change="board">${opts([['', 'Todas as vagas'], ...jobs.map(j => [j.id, `${j.title}${j.status === 'open' ? '' : ' (encerrada)'}`])], ui.board)}</select></label><p class="muted">${plural(apps.length, 'candidatura', 'candidaturas')}</p></div>
    <div class="board">${D.stages.map(st => { const list = apps.filter(a => a.stage === st); return `<section class="column" aria-label="${esc(st)}"><h2 class="column-head">${esc(st)} <span class="count-pill">${list.length}</span></h2>${list.map(card).join('') || '<p class="column-empty">Ninguém nesta etapa.</p>'}</section>`; }).join('')}</div>`;
}

function empresaEstagiarios() {
  const list = state.internships.filter(it => it.companyId === D.companyId).sort((a, b) => String(b.start).localeCompare(String(a.start)));
  return pageHead('Empresa', 'Estagiários', 'Termos, jornada e relatórios de cada estagiário, sem papel.') +
    (list.length ? `<div class="stack">${list.map(it => internshipCard(it, 'empresa')).join('')}</div>` : empty('Nenhum estagiário ainda', 'Quando você contratar alguém pela rede, o estágio aparece aqui.'));
}

function jobForm() {
  const check = state.institutions.map(i => `<label class="check"><input type="checkbox" name="institutionIds" value="${esc(i.id)}" checked><span>${esc(i.name)} <small class="muted">· ${esc(i.city)}</small></span></label>`).join('');
  return `<form class="modal-card form" data-form="publish" novalidate>
    ${modalHead('Publicar nova vaga')}
    <div class="modal-body">
      <label class="field"><span>Título da vaga</span><input name="title" maxlength="100" required autofocus placeholder="Ex.: Estágio em Desenvolvimento Mobile"></label>
      <div class="form-grid">
        <label class="field"><span>Curso</span><select name="course">${opts(D.courses, 'Sistemas de Informação')}</select></label>
        <label class="field"><span>A partir do semestre</span><select name="minSemester">${opts([1, 2, 3, 4, 5, 6, 7, 8].map(n => [n, `${n}º`]), 2)}</select></label>
        <label class="field"><span>Tipo</span><select name="type" data-change="job-type">${opts(D.types, 'Estágio')}</select></label>
        <label class="field"><span>Modalidade</span><select name="mode">${opts(D.modes, 'Remoto')}</select></label>
        <label class="field"><span>Turno de trabalho</span><select name="shift">${opts(D.workShifts, 'Tarde')}</select></label>
        <label class="field"><span>Bolsa ou salário (R$/mês)</span><input name="salary" type="number" min="1" step="any" required inputmode="numeric"></label>
        <label class="field"><span>Horas por semana</span><input name="hours" type="number" min="1" max="30" step="1" required inputmode="numeric"></label>
        <label class="field" data-supervisor><span>Supervisor(a) do estágio</span><input name="supervisor" maxlength="80"></label>
      </div>
      <p class="hint" data-type-hint>Estágio: supervisor(a) obrigatório e no máximo 30 horas semanais (Lei 11.788/2008).</p>
      <label class="field"><span>Descrição <small class="counter" data-counter-for="description">0/3000</small></span><textarea name="description" rows="4" maxlength="3000" required placeholder="O que a pessoa vai fazer e aprender."></textarea></label>
      <fieldset class="field"><legend>Publicar para as faculdades</legend><div class="checks-grid">${check}</div></fieldset>
      <p class="form-error" role="alert" hidden></p>
    </div>
    <footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal">Cancelar</button><button type="submit" class="btn primary">Publicar vaga</button></footer>
  </form>`;
}

/* ---------- ALUNO ---------- */
function reasons(x) {
  return [x.course ? '' : 'Outro curso', x.semester ? '' : `A partir do ${x.job.minSemester}º semestre`, x.shift ? '' : 'Conflita com seu horário de aula'].filter(Boolean);
}
function filteredJobs() {
  const s = student(), q = fold(ui.q.trim());
  return D.jobsForStudent(state, s).filter(x => {
    const j = x.job, c = company(j.companyId);
    if (ui.onlyCompatible && !x.compatible) return false;
    if (q && !fold([j.title, c.name, j.course, j.location, j.type, j.mode].join(' ')).includes(q)) return false;
    if (ui.type && j.type !== ui.type) return false;
    return !ui.mode || j.mode === ui.mode;
  }).sort((a, b) => Number(b.compatible) - Number(a.compatible) || Number(b.job.featured) - Number(a.job.featured));
}
function jobCard(x, s) {
  const j = x.job, c = company(j.companyId), app = appFor(j.id, s.id), rec = recommenders(s.id, j.id).length, why = reasons(x);
  const chips = [app ? `<span class="chip ok">${ICON.check}${esc(app.stage)}</span>` : '', rec ? `<span class="chip rec">${ICON.star}Indicada pela faculdade</span>` : '', x.compatible && !app ? '<span class="chip info">Compatível com você</span>' : ''].join('');
  return `<article class="card job-card${x.compatible ? '' : ' dim'}">
    <div class="job-head">${logo(c)}<div class="job-title"><h3><a href="#/aluno/vaga/${esc(j.id)}">${esc(j.title)}</a></h3><p>${esc(c.name)} · ${esc(j.location)}</p></div></div>
    ${jobTags(j)}
    ${why.length ? `<p class="why">${esc(why.join(' · '))}</p>` : ''}
    <div class="job-foot"><p class="salary"><strong>${money(j.salary)}</strong> /mês</p>${chips}</div>
  </article>`;
}
const countText = () => { const n = filteredJobs().length; return n === 1 ? '1 vaga' : `${n} vagas`; };
function resultsHtml() {
  const list = filteredJobs(), s = student();
  if (!list.length) return empty('Nenhuma vaga com esses filtros', 'Desmarque “só compatíveis” ou limpe os filtros para ver todas as vagas da rede.', '<button type="button" class="btn primary" data-action="clear-filters">Limpar filtros</button>');
  return `<div class="grid jobs">${list.map(x => jobCard(x, s)).join('')}</div>`;
}
function alunoVagas() {
  const s = student(), i = inst(), all = D.jobsForStudent(state, s), comp = all.filter(x => x.compatible).length;
  return `<section class="hero">
      <div class="hero-text"><p class="eyebrow">${esc(D.portalName(i))}</p>
        <h1 tabindex="-1">Olá, ${esc(firstName(s.name))}. Pedem experiência para te dar experiência? Aqui não.</h1>
        <p class="lead">${plural(comp, 'vaga combina', 'vagas combinam')} com o seu curso, o seu semestre e o seu horário de aula.</p></div>
      <dl class="hero-stats"><div><dt>Vagas na rede</dt><dd>${all.length}</dd></div><div><dt>Compatíveis</dt><dd>${comp}</dd></div><div><dt>Candidaturas</dt><dd>${state.applications.filter(a => a.studentId === s.id).length}</dd></div></dl>
    </section>
    <form class="filters card" role="search" aria-label="Filtrar vagas" data-form="filters">
      <label class="field grow"><span>Buscar</span><input type="search" data-filter="q" value="${esc(ui.q)}" placeholder="Cargo, empresa ou cidade" maxlength="80" autocomplete="off"></label>
      <label class="field"><span>Tipo</span><select data-filter="type"><option value="">Todos</option>${opts(D.types, ui.type)}</select></label>
      <label class="field"><span>Modalidade</span><select data-filter="mode"><option value="">Todas</option>${opts(D.modes, ui.mode)}</select></label>
      <label class="check filter-check"><input type="checkbox" data-filter="onlyCompatible"${ui.onlyCompatible ? ' checked' : ''}><span>Só compatíveis comigo</span></label>
    </form>
    <p class="count" id="count" aria-live="polite">${countText()} · ${esc(s.course)}, ${s.semester}º semestre, aula de ${esc(s.shift.toLowerCase())}</p>
    <div id="results">${resultsHtml()}</div>`;
}
function alunoVaga(id) {
  const j = job(id), s = student(), i = inst();
  const back = `<a class="back" href="#/aluno/vagas">${ICON.arrow}Voltar para vagas</a>`;
  if (!j || j.status !== 'open' || !j.institutionIds.includes(i.id)) return `${back}<div class="empty card"><h1 tabindex="-1">Vaga indisponível</h1><p>Esta vaga foi encerrada ou não está aberta para alunos da sua faculdade.</p><a class="btn primary" href="#/aluno/vagas">Ver vagas</a></div>`;
  const x = D.jobsForStudent(state, s).find(v => v.job.id === id), c = company(j.companyId), app = appFor(j.id, s.id), recs = recommenders(s.id, j.id), why = reasons(x);
  const facts = [['Curso', j.course], ['Semestre mínimo', `${j.minSemester}º`], ['Carga horária', `${j.hours} horas por semana`], ['Turno', j.shift], ['Modalidade', j.mode], ['Local', j.location], j.supervisor ? ['Supervisão', j.supervisor] : null, ['Publicada em', fmtDate(j.createdAt)]].filter(Boolean);
  return `${back}<div class="detail">
    <article class="card detail-main">
      <header class="detail-head">${logo(c, 'lg')}<div><p class="eyebrow">${esc(c.name)} · ${esc(c.sector)}</p><h1 tabindex="-1">${esc(j.title)}</h1>${jobTags(j)}</div></header>
      ${recs.length ? `<p class="callout">${ICON.star}<span>A ${esc(recs.join(', '))} indicou você para esta vaga.</span></p>` : ''}
      ${why.length ? `<p class="callout warn">${ICON.alert}<span>Atenção: ${esc(why.join(' · '))}.</span></p>` : `<p class="callout ok">${ICON.check}<span>Compatível com o seu curso, semestre e horário de aula.</span></p>`}
      <h2>Sobre a vaga</h2><p class="prose">${esc(j.description)}</p>
      <h2>Benefícios</h2><ul class="checks">${(j.benefits || []).map(b => `<li>${ICON.check}${esc(b)}</li>`).join('')}</ul>
      <h2>Detalhes</h2><dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </article>
    <aside class="card detail-side" aria-label="Candidatura"><p class="salary big"><strong>${money(j.salary)}</strong> /mês</p>
      ${app ? `<div class="applied"><p class="ok-line">${ICON.check}Candidatura enviada em ${esc(fmtDate(app.createdAt))}</p>${stepper(app.stage)}<a href="#/aluno/candidaturas">Acompanhar candidaturas</a></div>`
        : `<button type="button" class="btn primary block" data-action="apply" data-id="${esc(j.id)}">Candidatar-me</button><p class="hint">Seu perfil (${esc(s.name)}, ${esc(s.course)}, ${s.semester}º semestre) vai para ${esc(c.name)} com o selo da ${esc(i.shortName)}.</p>`}
    </aside></div>`;
}
function alunoCandidaturas() {
  const s = student(), apps = state.applications.filter(a => a.studentId === s.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return pageHead('Aluno', 'Minhas candidaturas', 'Acompanhe em que etapa cada processo está.') +
    (apps.length ? `<div class="stack">${apps.map(a => { const j = job(a.vacancyId); if (!j) return ''; const c = company(j.companyId);
      return `<article class="card app-row"><div class="app-info">${logo(c)}<div><h2 class="h3"><a href="#/aluno/vaga/${esc(j.id)}">${esc(j.title)}</a></h2><p>${esc(c.name)} · enviada em ${esc(fmtDate(a.createdAt))}</p></div></div>${stepper(a.stage)}</article>`; }).join('')}</div>`
      : empty('Você ainda não se candidatou', 'Encontre uma vaga compatível e candidate-se em um clique.', '<a class="btn primary" href="#/aluno/vagas">Ver vagas</a>'));
}
function alunoEstagio() {
  const s = student(), it = internshipOfStudent(s.id);
  if (!it) return pageHead('Aluno', 'Meu estágio') + empty('Você ainda não tem estágio', 'Quando uma empresa contratar você, o termo de estágio aparece aqui para você assinar.', '<a class="btn primary" href="#/aluno/vagas">Ver vagas</a>');
  const j = job(it.vacancyId), c = company(it.companyId), r = D.nextReport(it);
  return pageHead('Aluno', 'Meu estágio', `${j?.title} · ${c.name}`) +
    `<div class="two-col"><section class="card"><div class="row-title"><h2>Termo de compromisso</h2>${statusChip(it)}</div>${sigs(it)}
      ${it.signatures.aluno ? `<p class="ok-line">${ICON.check}Você assinou em ${esc(fmtDate(it.signatures.aluno))}.</p>` : `<p>Confira os dados e assine. Depois a faculdade assina e o estágio começa.</p><button type="button" class="btn primary" data-action="sign" data-id="${esc(it.id)}" data-party="aluno">Assinar termo</button>`}
      <button type="button" class="btn ghost small" data-action="termo" data-id="${esc(it.id)}">${ICON.doc}Ver termo completo</button></section>
      <section class="card"><h2>Relatórios de atividades</h2><p class="muted">A cada 6 meses você e o(a) supervisor(a) registram o que foi feito; a faculdade aprova.</p>${reportLine(it)}
      ${r?.status === 'pendente' && D.isActive(it, now()) ? `<p><button type="button" class="btn small" data-action="report" data-id="${esc(it.id)}">Enviar relatório</button></p>` : ''}
      <dl class="facts single"><div><dt>Período</dt><dd>${esc(fmtDate(it.start))} a ${esc(fmtDate(it.end))}</dd></div><div><dt>Jornada</dt><dd>${it.hours} horas por semana</dd></div><div><dt>Supervisor(a)</dt><dd>${esc(it.supervisor)}</dd></div></dl></section></div>`;
}
function alunoPerfil() {
  const s = student(), i = inst();
  const field = (name, label, max, value, area = false) => `<label class="field"><span>${esc(label)} <small class="counter" data-counter-for="${name}">${String(value || '').length}/${max}</small></span>${area ? `<textarea name="${name}" maxlength="${max}" rows="4">${esc(value)}</textarea>` : `<input name="${name}" maxlength="${max}" value="${esc(value)}"${name === 'name' ? ' required autocomplete="name"' : ''}>`}</label>`;
  return pageHead('Aluno', 'Meu perfil', 'É assim que as empresas veem você.') +
    `<div class="two-col"><section class="card profile-card">${avatar(s.name, 'xl')}<h2>${esc(s.name)}</h2><p class="muted">${esc(s.headline)}</p>${tags([s.course, `${s.semester}º semestre`, `Aula de ${s.shift.toLowerCase()}`, i.shortName])}
      <h3>Sobre</h3><p class="prose">${esc(s.bio) || '<span class="muted">Conte um pouco sobre você.</span>'}</p><h3>Projeto em destaque</h3><p class="prose">${esc(s.project) || '<span class="muted">Adicione um projeto da faculdade.</span>'}</p><h3>Habilidades</h3>${tags(s.skills || [])}</section>
      <form class="card form" data-form="profile"><h2>Editar informações</h2>${field('name', 'Nome', 80, s.name)}${field('headline', 'Título', 120, s.headline)}${field('bio', 'Sobre você', 600, s.bio, true)}${field('project', 'Projeto do portfólio', 180, s.project, true)}
        <p class="form-error" role="alert" hidden></p><div class="actions"><button class="btn primary" type="submit">Salvar perfil</button></div></form></div>`;
}

/* ---------- AJUDA ---------- */
function ajuda() {
  return pageHead('Ajuda', 'Roteiro da demonstração', 'A Oportuniza é a central de carreiras e estágios das faculdades, conectada a uma rede nacional de empresas.') +
    `<div class="two-col"><section class="card"><h2>Demonstração em 3 minutos</h2><ol class="steps">
      <li><strong>Faculdade:</strong> veja o painel, as pendências e assine o termo que está esperando.</li>
      <li><strong>Empresa:</strong> publique uma vaga de estágio para toda a rede (tente 40 horas: a lei não deixa).</li>
      <li><strong>Aluno (Lucas):</strong> encontre a vaga compatível e candidate-se.</li>
      <li><strong>Empresa:</strong> avance o Lucas até “Contratar e gerar termo”. A fatura sobe quando o termo for assinado.</li>
      <li><strong>Aluno:</strong> em “Meu estágio”, assine o termo.</li>
      <li><strong>Faculdade:</strong> assine o termo nas pendências. O indicador “Estagiando agora” sobe.</li></ol></section>
    <section class="card"><h2>Quem paga o quê</h2><dl class="facts single">
      <div><dt>Faculdade</dt><dd>Essencial gratuito; Gestão por ${money(D.PRICE.student)} por aluno por mês (mínimo ${money(D.PRICE.minPlan)}).</dd></div>
      <div><dt>Empresa</dt><dd>Publica de graça; paga ${money(D.PRICE.intern)} por estagiário ativo por mês.</dd></div>
      <div><dt>Aluno</dt><dd>Nunca paga.</dd></div></dl>
      <p class="muted small">Faculdades, empresas e pessoas são fictícias. Assinaturas e documentos são simulados.</p></section></div>
    <section class="card"><h2>Seus dados</h2><p>${storageOk ? 'As alterações ficam salvas apenas neste navegador.' : 'Este navegador bloqueou o armazenamento: as alterações valem só até fechar a aba.'}</p>
      <button type="button" class="btn danger" data-action="reset">Restaurar dados de exemplo</button></section>`;
}

/* ---------- roteamento ---------- */
const VIEWS = {
  faculdade: { painel: faculdadePainel, estagios: faculdadeEstagios, talentos: faculdadeTalentos, empresas: faculdadeEmpresas, portal: faculdadePortal },
  empresa: { painel: empresaPainel, vagas: empresaVagas, candidatos: empresaCandidatos, estagiarios: empresaEstagiarios },
  aluno: { vagas: alunoVagas, vaga: alunoVaga, candidaturas: alunoCandidaturas, estagio: alunoEstagio, perfil: alunoPerfil },
};
const home = role => `#/${role}/${NAV[role][0][0]}`;
const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);

function render() {
  const [role, page, id] = route();
  let html, activeRole, activePage;
  if (role === 'ajuda' && !page) { html = ajuda(); activeRole = state.context.role; activePage = 'ajuda'; }
  else if (VIEWS[role]?.[page] && (page === 'vaga' ? id : !id)) { state.context.role = role; html = VIEWS[role][page](id); activeRole = role; activePage = page === 'vaga' ? 'vagas' : page; }
  else { location.replace(home(state.context.role)); return; }
  const i = inst();
  document.documentElement.style.setProperty('--accent', activeRole === 'empresa' ? '#245847' : safeAccent(i.accent));
  document.title = `${activePage === 'ajuda' ? 'Ajuda' : NAV[activeRole].find(n => n[0] === activePage)?.[1] || 'Vaga'} · Oportuniza Rede`;
  const sub = activeRole === 'empresa' ? `${myCompany().name} · rede de ${state.institutions.length} faculdades` : D.portalName(i);
  $('#app').innerHTML = `
    <header class="topbar"><div class="wrap topbar-inner">
      <a class="brand" href="${home(activeRole)}"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M11 25V15h10m-4 14 12-12m-9-2h9v9"/></svg></span><span class="brand-text"><strong>Oportuniza Rede</strong><small>${esc(sub)}</small></span></a>
      <span class="demo-badge" title="Dados fictícios">Demonstração</span>
      <div class="controls">
        <nav class="persona" aria-label="Ver como">${Object.keys(NAV).map(r => `<a href="${home(r)}"${r === activeRole && activePage !== 'ajuda' ? ' aria-current="true"' : ''}>${ROLE_LABEL[r]}</a>`).join('')}</nav>
        ${activeRole === 'empresa' ? '' : `<label class="inst-select"><span class="sr-only">Faculdade</span><select data-change="institution" aria-label="Faculdade">${opts(state.institutions.map(x => [x.id, x.shortName]), i.id)}</select></label>`}
      </div></div>
      <nav class="tabs" aria-label="Seções"><div class="wrap tabs-inner">${NAV[activeRole].map(([p, label]) => `<a href="#/${activeRole}/${p}"${activePage === p ? ' aria-current="page"' : ''}>${label}</a>`).join('')}<a href="#/ajuda" class="help-link"${activePage === 'ajuda' ? ' aria-current="page"' : ''}>Roteiro e ajuda</a></div></nav>
    </header>
    ${storageOk ? '' : '<p class="storage-note wrap" role="note">O navegador bloqueou o armazenamento local. As alterações serão perdidas ao fechar a aba.</p>'}
    <main id="main" class="wrap" tabindex="-1">${html}</main>
    <footer class="wrap footer"><p>Oportuniza Rede · demonstração. Faculdades, empresas e pessoas são fictícias.</p><a href="#/ajuda">Roteiro e restauração</a></footer>`;
  if (location.hash !== lastRoute) {
    lastRoute = location.hash; window.scrollTo(0, 0);
    if (document.activeElement === document.body || !$('#app').contains(document.activeElement)) ($('#main h1') || $('#main')).focus({ preventScroll: true });
  }
}

/* ---------- ações ---------- */
function showFormError(form, msg) { const p = form.querySelector('.form-error'); if (!p) return toast(msg, 'error'); p.textContent = msg; p.hidden = false; }
function download(name, text) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const ACTIONS = {
  'close-modal': () => closeModal(),
  'clear-filters': () => { Object.assign(ui, { q: '', type: '', mode: '', onlyCompatible: false }); render(); },
  apply: ({ id }) => mutate(s => D.apply(s, id, student().id), () => `Candidatura enviada para ${company(job(id).companyId).name}!`),
  'new-job': () => { openModal(jobForm()); syncJobType(); },
  'toggle-status': ({ id }) => { const j = job(id); mutate(s => D.setVacancyStatus(s, id, j.status === 'open' ? 'closed' : 'open'), r => (r.status === 'open' ? 'Vaga reaberta.' : 'Vaga encerrada.')); },
  'see-candidates': ({ id }) => { ui.board = id; location.hash = '#/empresa/candidatos'; },
  advance: ({ id }) => { const a = state.applications.find(x => x.id === id), next = D.stages[D.stages.indexOf(a.stage) + 1], name = studentById(a.studentId)?.name;
    mutate(s => D.moveApplication(s, id, next, now()), next === 'Contratado' ? `${name} contratado(a). Termo enviado para assinatura do aluno e da faculdade.` : `${name} avançou para ${next}.`); },
  sign: ({ id, party }) => mutate(s => D.signInternship(s, id, party, now()), it => D.internshipStatus(it, now()) === 'Aguardando assinaturas' ? 'Assinatura registrada. Falta a outra parte assinar.' : 'Termo assinado pelas três partes. Estágio liberado!'),
  remind: ({ id }) => mutate(s => D.remindReport(s, id, inst().id, now()), it => `Cobrança enviada por e-mail e WhatsApp para ${studentById(it.studentId)?.name} e ${company(it.companyId).name} (simulação).`),
  approve: ({ id }) => mutate(s => D.approveReport(s, id, inst().id, now()), 'Relatório aprovado. O próximo foi agendado para daqui a 6 meses.'),
  report: ({ id }) => mutate(s => D.submitReport(s, id, now()), 'Relatório enviado para a faculdade aprovar.'),
  termo: ({ id }) => termoDialog(id),
  recommend: ({ id }) => openModal(recommendForm(id)),
  'more-talents': () => { ui.talentLimit += 20; render(); },
  invite: () => openModal(`<form class="modal-card form" data-form="invite">${modalHead('Convidar empresa para a rede')}<div class="modal-body"><p>A empresa recebe um convite para publicar vagas para os seus alunos. Publicar é gratuito.</p>
    <label class="field"><span>Nome da empresa</span><input name="name" required maxlength="80" autofocus></label><label class="field"><span>E-mail do RH</span><input name="email" type="email" required maxlength="120"></label></div>
    <footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal">Cancelar</button><button type="submit" class="btn primary">Enviar convite</button></footer></form>`),
  'set-plan': ({ plan }) => mutate(s => D.setPlan(s, inst().id, plan), r => `Plano alterado para ${r.plan === 'gestao' ? 'Gestão' : 'Essencial'} (simulação).`),
  export: () => { download(`empregabilidade-${inst().shortName.toLowerCase().replace(/\s+/g, '-')}-${now()}.csv`, D.employabilityCSV(state, inst().id, now())); toast('Relatório de empregabilidade exportado (CSV).'); },
  reset: () => openModal(`<div class="modal-card">${modalHead('Restaurar dados de exemplo?')}<div class="modal-body"><p>Tudo o que foi feito nesta demonstração será apagado deste navegador.</p></div><footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal" autofocus>Cancelar</button><button type="button" class="btn danger" data-action="confirm-reset">Restaurar</button></footer></div>`),
  'confirm-reset': () => { state = D.seed(); Object.assign(ui, { q: '', type: '', mode: '', onlyCompatible: true, board: '', talentCourse: '', talentFree: false, talentLimit: 20, estStatus: '' }); persist(); closeModal(); if (location.hash === home('faculdade')) render(); else location.hash = home('faculdade'); toast('Dados de exemplo restaurados.'); },
};

const CHANGES = {
  institution: v => { state.context.institutionId = v; persist(); render(); toast(`Visualizando ${inst().shortName}.`); },
  board: v => { ui.board = v; render(); $('[data-change="board"]')?.focus(); },
  estStatus: v => { ui.estStatus = v; render(); $('[data-change="estStatus"]')?.focus(); },
  talentCourse: v => { ui.talentCourse = v; ui.talentLimit = 20; render(); $('[data-change="talentCourse"]')?.focus(); },
  talentFree: (v, d, el) => { ui.talentFree = el.checked; ui.talentLimit = 20; render(); $('[data-change="talentFree"]')?.focus(); },
  stage: (v, { id }) => { const a = state.applications.find(x => x.id === id); mutate(s => D.moveApplication(s, id, v, now()), `${studentById(a?.studentId)?.name}: ${v}.`); $(`[data-change="stage"][data-id="${CSS.escape(id)}"]`)?.focus(); },
  'job-type': () => syncJobType(),
};

function syncJobType() {
  const f = $('[data-form="publish"]'); if (!f) return;
  const intern = f.type.value === 'Estágio';
  f.querySelector('[data-supervisor]').hidden = !intern; f.supervisor.required = intern; f.hours.max = intern ? 30 : 44;
  f.querySelector('[data-type-hint]').textContent = intern ? 'Estágio: supervisor(a) obrigatório e no máximo 30 horas semanais (Lei 11.788/2008).' : 'Primeiro emprego: carga de 1 a 44 horas semanais.';
}

const FORMS = {
  filters: () => {},
  profile: f => { try { D.updateProfile(state, student().id, Object.fromEntries(new FormData(f))); persist(); render(); toast('Perfil atualizado.'); } catch (e) { showFormError(f, e.message); } },
  publish: f => {
    const fd = new FormData(f), data = Object.fromEntries(fd); data.institutionIds = fd.getAll('institutionIds');
    try { const j = D.publish(state, data); persist(); closeModal(); if (location.hash === '#/empresa/vagas') render(); else location.hash = '#/empresa/vagas'; toast(`Vaga “${j.title}” publicada para ${plural(j.institutionIds.length, 'faculdade', 'faculdades')}.`); }
    catch (e) { showFormError(f, e.message); }
  },
  recommend: f => { const sid = f.dataset.student, vid = f.vacancyId.value; try { D.recommend(state, sid, vid, inst().id); persist(); closeModal(); render(); toast(`${firstName(studentById(sid)?.name)} indicado(a) para ${job(vid)?.title}.`); } catch (e) { showFormError(f, e.message); } },
  branding: f => { try { D.updateBranding(state, inst().id, Object.fromEntries(new FormData(f))); persist(); render(); toast('Portal atualizado.'); } catch (e) { showFormError(f, e.message); } },
  invite: f => { const name = f.name.value.trim(); closeModal(); toast(`Convite enviado para ${name} (simulação).`); },
};

document.addEventListener('click', e => { const el = e.target.closest('[data-action]'); if (el && ACTIONS[el.dataset.action]) { e.preventDefault(); ACTIONS[el.dataset.action](el.dataset, el); } });
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]');
  if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el.value, el.dataset, el);
  if (e.target.dataset.filter) onFilter(e.target);
  if (e.target.name === 'accent') $('#portal-preview')?.style.setProperty('--accent', safeAccent(e.target.value));
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.filter && t.type !== 'checkbox') onFilter(t);
  const counter = t.form?.querySelector(`[data-counter-for="${t.name}"]`); if (counter) counter.textContent = `${t.value.length}/${t.maxLength}`;
  if (t.name === 'portalName') { const n = $('[data-preview-name]'); if (n) n.textContent = t.value; }
  const err = t.form?.querySelector('.form-error'); if (err && !err.hidden) err.hidden = true;
});
document.addEventListener('submit', e => {
  const f = e.target, k = f.dataset.form; if (!k || !FORMS[k]) return; e.preventDefault();
  if (k === 'publish') {
    const bad = [...f.elements].find(el => el.willValidate && !el.checkValidity());
    if (bad) { showFormError(f, bad.name === 'hours' ? `Informe uma carga horária entre 1 e ${bad.max} horas.` : bad.name === 'salary' ? 'Informe uma bolsa ou salário maior que zero.' : bad.name === 'supervisor' ? 'Para estágio, informe um(a) supervisor(a).' : 'Preencha o título e a descrição da vaga.'); bad.focus(); return; }
  } else if (k !== 'filters' && !f.reportValidity()) return;
  FORMS[k](f);
});
function onFilter(t) {
  const k = t.dataset.filter, v = t.type === 'checkbox' ? t.checked : t.value;
  if (ui[k] === v) return; ui[k] = v;
  $('#results').innerHTML = resultsHtml();
  const s = student(); $('#count').textContent = `${countText()} · ${s.course}, ${s.semester}º semestre, aula de ${s.shift.toLowerCase()}`;
}

window.addEventListener('hashchange', render);
window.addEventListener('storage', e => { if (e.key !== KEY) return; state = e.newValue ? D.restore(e.newValue) : D.seed(); closeModal(); render(); toast('Dados atualizados em outra aba.'); });
render();
