import * as D from './domain.mjs';

/* ------------------------------------------------------------------ *
 * Oportuniza Rede — interface (aluno, empresa, instituição, ajuda)
 * Estado único em localStorage (oportuniza-rede-v1); toda mutação passa
 * pelas funções de domínio, salva uma vez, redesenha e avisa o resultado.
 * ------------------------------------------------------------------ */

const KEY = 'oportuniza-rede-v1';
const NAV = {
  aluno: [['vagas', 'Vagas'], ['salvas', 'Salvas'], ['candidaturas', 'Candidaturas'], ['perfil', 'Meu perfil']],
  empresa: [['painel', 'Painel'], ['vagas', 'Minhas vagas'], ['candidatos', 'Candidatos']],
  instituicao: [['painel', 'Painel'], ['talentos', 'Talentos'], ['estagios', 'Estágios'], ['portal', 'Portal']],
};
const ROLE_LABEL = { aluno: 'Aluno', empresa: 'Empresa', instituicao: 'Instituição' };
const ACCENTS = [['#245847', 'Verde'], ['#425e99', 'Azul'], ['#7c4d72', 'Ameixa'], ['#8a4b2f', 'Terracota'], ['#2f5f73', 'Petróleo'], ['#5d5a24', 'Oliva']];
const TYPES = ['Estágio', 'Primeiro emprego'], MODES = ['Remoto', 'Híbrido', 'Presencial'], SHIFTS = ['Manhã', 'Tarde'];

const ICON = {
  bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = v => String(v ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const money = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
const fmtDate = v => { const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T12:00:00` : v); return isNaN(d) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); };
const initials = name => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
const firstName = name => String(name || '').split(/\s+/)[0];
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const opts = (list, val) => list.map(v => { const [value, label] = Array.isArray(v) ? v : [v, v]; return `<option value="${esc(value)}"${value === val ? ' selected' : ''}>${esc(label)}</option>`; }).join('');

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
const ui = { q: '', type: '', mode: '', shift: '', board: '' };
let lastRoute = '';

const inst = () => state.institutions.find(i => i.id === state.context.institutionId) || state.institutions[0];
const student = () => D.studentFor(state, inst().id);
const job = id => state.jobs.find(j => j.id === id);
const company = id => state.companies.find(c => c.id === id) || { name: 'Empresa', initials: '?', color: '#eee', ink: '#333', sector: '' };
const studentById = id => state.students.find(s => s.id === id);
const instById = id => state.institutions.find(i => i.id === id);
const applicationFor = (vacancyId, studentId) => state.applications.find(a => a.vacancyId === vacancyId && a.studentId === studentId);
const recommenders = (studentId, vacancyId) => state.recommendations.filter(r => r.studentId === studentId && r.vacancyId === vacancyId).map(r => instById(r.institutionId)?.shortName).filter(Boolean);
const safeAccent = a => (D.accentPattern.test(a || '') ? a : '#245847');

/** Executa uma mutação de domínio: salva uma vez, redesenha e anuncia. */
function mutate(fn, message) {
  try {
    const result = fn(state);
    persist(); render();
    if (message) toast(typeof message === 'function' ? message(result) : message);
    return true;
  } catch (e) { toast(e.message || 'Algo deu errado.', 'error'); return false; }
}

/* ---------- feedback, diálogo ---------- */
let toastTimer;
function toast(msg, kind = 'ok') {
  const t = $('#toast');
  t.textContent = msg; t.className = `toast show ${kind}`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.className = 'toast'; }, 3600);
}
let lastFocus = null;
function openModal(html) {
  const m = $('#modal');
  lastFocus = document.activeElement;
  m.innerHTML = html; m.setAttribute('aria-labelledby', 'modal-title');
  m.showModal();
  (m.querySelector('[autofocus]') || m.querySelector('input,select,textarea,button'))?.focus();
}
function closeModal() { const m = $('#modal'); if (m.open) m.close(); }
$('#modal').addEventListener('close', () => {
  $('#modal').innerHTML = '';
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); else $('#main h1')?.focus();
});
$('#modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
const modalHead = title => `<header class="modal-head"><h2 id="modal-title">${esc(title)}</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Fechar">${ICON.close}</button></header>`;

/* ---------- componentes ---------- */
const logo = (c, size = '') => `<span class="logo ${size}" style="--logo-bg:${esc(c.color)};--logo-ink:${esc(c.ink)}" aria-hidden="true">${esc(c.initials)}</span>`;
const avatar = (name, size = '') => `<span class="avatar ${size}" aria-hidden="true">${esc(initials(name))}</span>`;
const tags = list => `<ul class="tags">${list.filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
const jobTags = j => tags([j.type, j.mode, `Turno: ${j.shift}`, `${j.hours}h/semana`]);
const stepper = stage => {
  const idx = D.stages.indexOf(stage);
  return `<ol class="stepper" aria-label="Etapa atual: ${esc(stage)}">${D.stages.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'current' : ''}"${i === idx ? ' aria-current="step"' : ''}><span>${esc(s)}</span></li>`).join('')}</ol>`;
};
const empty = (title, text, action = '') => `<div class="empty card"><h2>${esc(title)}</h2><p>${esc(text)}</p>${action}</div>`;
const metric = (value, label, note = '') => `<div class="metric card"><strong>${esc(value)}</strong><span>${esc(label)}</span>${note ? `<small>${esc(note)}</small>` : ''}</div>`;
const pageHead = (eyebrow, title, lead = '', actions = '') => `<header class="page-head"><div><p class="eyebrow">${esc(eyebrow)}</p><h1 tabindex="-1">${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</div>${actions ? `<div class="head-actions">${actions}</div>` : ''}</header>`;

function saveButton(j, s, label = false) {
  const on = D.isSaved(state, j.id, s.id);
  const text = on ? 'Remover dos salvos' : 'Salvar vaga';
  return label
    ? `<button type="button" class="btn ghost block save-btn${on ? ' on' : ''}" data-action="toggle-save" data-id="${esc(j.id)}" aria-pressed="${on}">${ICON.bookmark}<span>${on ? 'Vaga salva' : 'Salvar vaga'}</span></button>`
    : `<button type="button" class="icon-btn save-btn${on ? ' on' : ''}" data-action="toggle-save" data-id="${esc(j.id)}" aria-pressed="${on}" aria-label="${esc(`${text}: ${j.title}`)}" title="${esc(text)}">${ICON.bookmark}</button>`;
}

function jobCard(j, s) {
  const c = company(j.companyId), app = applicationFor(j.id, s.id), rec = recommenders(s.id, j.id).length;
  const chips = [
    app ? `<span class="chip ok">${ICON.check}${esc(app.stage)}</span>` : '',
    rec ? `<span class="chip rec">${ICON.star}Indicada para você</span>` : '',
    !app && !rec && j.featured ? '<span class="chip">Destaque</span>' : '',
  ].join('');
  return `<article class="card job-card">
    <div class="job-head">${logo(c)}<div class="job-title"><h3><a href="#/aluno/vaga/${esc(j.id)}">${esc(j.title)}</a></h3><p>${esc(c.name)} · ${esc(j.location)}</p></div>${saveButton(j, s)}</div>
    ${jobTags(j)}
    <div class="job-foot"><p class="salary"><strong>${money(j.salary)}</strong> /mês</p>${chips}</div>
  </article>`;
}

/* ---------- ALUNO ---------- */
function filteredJobs() {
  const s = student(), q = fold(ui.q.trim());
  return D.visibleJobs(state, inst().id).filter(j => {
    const c = company(j.companyId);
    if (q && !fold([j.title, c.name, j.course, j.location, j.type, j.mode].join(' ')).includes(q)) return false;
    if (ui.type && j.type !== ui.type) return false;
    if (ui.mode && j.mode !== ui.mode) return false;
    const want = ui.shift === 'meu' ? s.shift : ui.shift;
    return !want || j.shift === want;
  });
}
function resultsHtml() {
  const list = filteredJobs(), s = student();
  if (!list.length) return empty('Nenhuma vaga encontrada', 'Tente outros termos ou remova alguns filtros para ver mais oportunidades.', '<button type="button" class="btn primary" data-action="clear-filters">Limpar filtros</button>');
  return `<div class="grid jobs">${list.map(j => jobCard(j, s)).join('')}</div>`;
}
const countText = () => { const n = filteredJobs().length; return n === 1 ? '1 vaga encontrada' : `${n} vagas encontradas`; };

function alunoVagas() {
  const s = student(), i = inst(), total = D.visibleJobs(state, i.id).length, mine = state.applications.filter(a => a.studentId === s.id).length;
  return `<section class="hero">
      <div class="hero-text"><p class="eyebrow">${esc(D.portalName(i))}</p>
        <h1 tabindex="-1">Olá, ${esc(firstName(s.name))}. Sua próxima conquista começa com uma conexão.</h1>
        <p class="lead">${plural(total, 'oportunidade aberta', 'oportunidades abertas')} para estudantes desta instituição.</p></div>
      <dl class="hero-stats"><div><dt>Vagas para você</dt><dd>${total}</dd></div><div><dt>Candidaturas</dt><dd>${mine}</dd></div><div><dt>Salvas</dt><dd>${state.saved.filter(x => x.studentId === s.id).length}</dd></div></dl>
    </section>
    <form class="filters card" role="search" aria-label="Filtrar vagas" data-form="filters">
      <label class="field grow"><span>Buscar</span><input type="search" data-filter="q" value="${esc(ui.q)}" placeholder="Cargo, empresa, curso ou cidade" maxlength="80" autocomplete="off"></label>
      <label class="field"><span>Tipo</span><select data-filter="type"><option value="">Todos</option>${opts(TYPES, ui.type)}</select></label>
      <label class="field"><span>Modalidade</span><select data-filter="mode"><option value="">Todas</option>${opts(MODES, ui.mode)}</select></label>
      <label class="field"><span>Turno</span><select data-filter="shift"><option value="">Todos</option>${opts([['meu', `Compatível comigo (${s.shift})`], ...SHIFTS], ui.shift)}</select></label>
      <button type="button" class="btn ghost" data-action="clear-filters">Limpar</button>
    </form>
    <p class="count" id="count" aria-live="polite">${countText()}</p>
    <div id="results">${resultsHtml()}</div>`;
}

function alunoVaga(id) {
  const j = job(id), s = student(), i = inst();
  const back = `<a class="back" href="#/aluno/vagas">${ICON.arrow}Voltar para vagas</a>`;
  if (!j || j.status !== 'open' || !j.institutionIds.includes(i.id))
    return `${back}<div class="empty card"><h1 tabindex="-1">Vaga indisponível</h1><p>Esta vaga foi encerrada ou não está aberta para estudantes desta instituição.</p><a class="btn primary" href="#/aluno/vagas">Ver vagas abertas</a></div>`;
  const c = company(j.companyId), app = applicationFor(j.id, s.id), recs = recommenders(s.id, j.id);
  const facts = [['Curso', j.course], ['Carga horária', `${j.hours} horas por semana`], ['Turno', j.shift], ['Modalidade', j.mode], ['Local', j.location],
    j.supervisor ? ['Supervisão', j.supervisor] : null, ['Publicada em', fmtDate(j.createdAt)],
    ['Aberta para', j.institutionIds.map(x => instById(x)?.shortName).filter(Boolean).join(', ')]].filter(Boolean);
  return `${back}
    <div class="detail">
      <article class="card detail-main">
        <header class="detail-head">${logo(c, 'lg')}<div><p class="eyebrow">${esc(c.name)} · ${esc(c.sector)}</p><h1 tabindex="-1">${esc(j.title)}</h1>${jobTags(j)}</div></header>
        ${recs.length ? `<p class="callout">${ICON.star}<span>${esc(recs.join(', '))} indicou você para esta vaga.</span></p>` : ''}
        <h2>Sobre a vaga</h2><p class="prose">${esc(j.description)}</p>
        <h2>Benefícios</h2><ul class="checks">${(j.benefits || []).map(b => `<li>${ICON.check}${esc(b)}</li>`).join('')}</ul>
        <h2>Detalhes</h2><dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </article>
      <aside class="card detail-side" aria-label="Candidatura">
        <p class="salary big"><strong>${money(j.salary)}</strong> /mês</p>
        ${app
          ? `<div class="applied"><p class="ok-line">${ICON.check}Candidatura enviada em ${esc(fmtDate(app.createdAt))}</p>${stepper(app.stage)}<a href="#/aluno/candidaturas">Acompanhar minhas candidaturas</a></div>`
          : `<button type="button" class="btn primary block" data-action="apply" data-id="${esc(j.id)}">Candidatar-me</button><p class="hint">Seu perfil (${esc(s.name)}, ${esc(s.course)}) será enviado para ${esc(c.name)}.</p>`}
        ${saveButton(j, s, true)}
      </aside>
    </div>`;
}

function alunoSalvas() {
  const s = student(), saved = state.saved.filter(x => x.studentId === s.id).map(x => job(x.vacancyId)).filter(Boolean);
  const open = saved.filter(j => j.status === 'open' && j.institutionIds.includes(s.institutionId));
  const closed = saved.filter(j => !open.includes(j));
  return pageHead('Aluno', 'Vagas salvas', 'Guarde oportunidades para decidir com calma.') +
    (saved.length ? `<div class="grid jobs">${open.map(j => jobCard(j, s)).join('')}</div>
      ${closed.length ? `<h2 class="section-title">Encerradas</h2><ul class="plain-list">${closed.map(j => `<li class="card row"><span><strong>${esc(j.title)}</strong> · ${esc(company(j.companyId).name)}</span><button type="button" class="btn small ghost" data-action="toggle-save" data-id="${esc(j.id)}">Remover</button></li>`).join('')}</ul>` : ''}`
      : empty('Nenhuma vaga salva ainda', 'Use o marcador nas vagas para guardá-las aqui.', '<a class="btn primary" href="#/aluno/vagas">Explorar vagas</a>'));
}

function alunoCandidaturas() {
  const s = student(), apps = state.applications.filter(a => a.studentId === s.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return pageHead('Aluno', 'Minhas candidaturas', 'Acompanhe em que etapa cada processo está.') +
    (apps.length ? `<div class="stack">${apps.map(a => {
      const j = job(a.vacancyId); if (!j) return '';
      const c = company(j.companyId);
      return `<article class="card app-row"><div class="app-info">${logo(c)}<div><h2 class="h3"><a href="#/aluno/vaga/${esc(j.id)}">${esc(j.title)}</a></h2><p>${esc(c.name)} · enviada em ${esc(fmtDate(a.createdAt))}${j.status !== 'open' ? ' · <em>vaga encerrada</em>' : ''}</p></div></div>${stepper(a.stage)}</article>`;
    }).join('')}</div>`
      : empty('Você ainda não se candidatou', 'Encontre uma vaga que combine com você e envie sua candidatura em um clique.', '<a class="btn primary" href="#/aluno/vagas">Ver vagas</a>'));
}

function alunoPerfil() {
  const s = student(), i = inst();
  const field = (name, label, max, value, area = false) => `<label class="field"><span>${esc(label)} <small class="counter" data-counter-for="${name}">${String(value || '').length}/${max}</small></span>${area
    ? `<textarea name="${name}" maxlength="${max}" rows="4">${esc(value)}</textarea>`
    : `<input name="${name}" maxlength="${max}" value="${esc(value)}"${name === 'name' ? ' required autocomplete="name"' : ''}>`}</label>`;
  return pageHead('Aluno', 'Meu perfil', 'É assim que empresas e sua instituição veem você.') +
    `<div class="two-col">
      <section class="card profile-card" aria-label="Pré-visualização do perfil">
        ${avatar(s.name, 'xl')}<h2>${esc(s.name)}</h2><p class="muted">${esc(s.headline)}</p>
        ${tags([s.course, `Disponível: ${s.shift}`, i.shortName])}
        <h3>Sobre</h3><p class="prose">${esc(s.bio) || '<span class="muted">Conte um pouco sobre você.</span>'}</p>
        <h3>Projeto em destaque</h3><p class="prose">${esc(s.project) || '<span class="muted">Adicione um projeto.</span>'}</p>
        <h3>Habilidades</h3>${tags(s.skills || [])}
      </section>
      <form class="card form" data-form="profile">
        <h2>Editar informações</h2>
        ${field('name', 'Nome', 80, s.name)}${field('headline', 'Título', 120, s.headline)}${field('bio', 'Sobre você', 600, s.bio, true)}${field('project', 'Projeto do portfólio', 180, s.project, true)}
        <p class="form-error" role="alert" hidden></p>
        <div class="actions"><button class="btn primary" type="submit">Salvar perfil</button></div>
      </form>
    </div>`;
}

/* ---------- EMPRESA ---------- */
const myCompany = () => company(D.companyId);
const employerApps = () => { const ids = new Set(D.employerJobs(state).map(j => j.id)); return state.applications.filter(a => ids.has(a.vacancyId)); };

function empresaPainel() {
  const c = myCompany(), jobs = D.employerJobs(state), apps = employerApps();
  const recent = [...apps].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  return pageHead('Empresa', c.name, `${c.sector} · recrutando em ${state.institutions.length} instituições parceiras.`, '<button type="button" class="btn primary" data-action="new-job">Publicar vaga</button>') +
    `<div class="metrics">${metric(jobs.filter(j => j.status === 'open').length, 'Vagas abertas')}${metric(apps.length, 'Candidaturas')}${metric(apps.filter(a => a.stage === 'Entrevista').length, 'Em entrevista')}${metric(apps.filter(a => a.stage === 'Contratado').length, 'Contratações')}</div>
    <section class="card"><div class="section-head"><h2>Candidaturas recentes</h2><a href="#/empresa/candidatos">Ver todas</a></div>
      ${recent.length ? `<ul class="plain-list divided">${recent.map(a => { const s = studentById(a.studentId), j = job(a.vacancyId); return `<li class="row">${avatar(s?.name)}<span class="grow"><strong>${esc(s?.name)}</strong><br><small class="muted">${esc(j?.title)} · ${esc(instById(s?.institutionId)?.shortName)}</small></span><span class="chip stage-${D.stages.indexOf(a.stage)}">${esc(a.stage)}</span></li>`; }).join('')}</ul>` : '<p class="muted">Nenhuma candidatura ainda.</p>'}
    </section>`;
}

function empresaVagas() {
  const jobs = D.employerJobs(state), apps = employerApps();
  return pageHead('Empresa', 'Minhas vagas', 'Publique, encerre ou reabra oportunidades.', '<button type="button" class="btn primary" data-action="new-job">Publicar vaga</button>') +
    (jobs.length ? `<div class="stack">${jobs.map(j => {
      const n = apps.filter(a => a.vacancyId === j.id).length, open = j.status === 'open';
      return `<article class="card vac-row${open ? '' : ' is-closed'}">
        <div class="grow"><div class="row-title"><h2 class="h3">${esc(j.title)}</h2><span class="chip ${open ? 'ok' : 'off'}">${open ? 'Aberta' : 'Encerrada'}</span></div>
          ${jobTags(j)}<p class="muted small">Público: ${esc(j.institutionIds.map(x => instById(x)?.shortName).filter(Boolean).join(', '))} · ${money(j.salary)}/mês · publicada em ${esc(fmtDate(j.createdAt))}</p></div>
        <div class="row-actions"><button type="button" class="btn small" data-action="see-candidates" data-id="${esc(j.id)}">${plural(n, 'candidato', 'candidatos')}</button>
          <button type="button" class="btn small ghost" data-action="toggle-status" data-id="${esc(j.id)}">${open ? 'Encerrar' : 'Reabrir'}</button></div>
      </article>`;
    }).join('')}</div>` : empty('Nenhuma vaga publicada', 'Publique a primeira vaga para começar a receber candidaturas.'));
}

function empresaCandidatos() {
  const jobs = D.employerJobs(state);
  if (ui.board && !jobs.some(j => j.id === ui.board)) ui.board = '';
  const apps = employerApps().filter(a => !ui.board || a.vacancyId === ui.board);
  const jobIds = new Set(jobs.filter(j => !ui.board || j.id === ui.board).map(j => j.id));
  const pendingRecs = state.recommendations.filter(r => jobIds.has(r.vacancyId) && !applicationFor(r.vacancyId, r.studentId));
  const card = a => {
    const s = studentById(a.studentId), j = job(a.vacancyId), recs = recommenders(a.studentId, a.vacancyId), idx = D.stages.indexOf(a.stage), closed = j?.status !== 'open';
    return `<article class="card cand">
      <div class="cand-head">${avatar(s?.name)}<div><h3>${esc(s?.name)}</h3><p>${esc(s?.course)} · ${esc(instById(s?.institutionId)?.shortName)}</p></div></div>
      <p class="cand-job">${esc(j?.title)}</p>
      ${recs.length ? `<p class="chip rec">${ICON.star}Indicado por ${esc(recs.join(', '))}</p>` : ''}
      ${tags((s?.skills || []).slice(0, 3))}
      <label class="field compact"><span>Etapa</span><select data-change="stage" data-id="${esc(a.id)}"${closed ? ' disabled' : ''}>${opts(D.stages, a.stage)}</select></label>
      ${closed ? '<p class="muted small">Vaga encerrada: reabra para mover.</p>' : idx < D.stages.length - 1 ? `<button type="button" class="btn small block" data-action="advance" data-id="${esc(a.id)}">Avançar para ${esc(D.stages[idx + 1])}</button>` : ''}
    </article>`;
  };
  return pageHead('Empresa', 'Candidatos', 'Mova cada pessoa pelas etapas do processo.') +
    `<div class="toolbar card"><label class="field"><span>Vaga</span><select data-change="board">${opts([['', 'Todas as vagas'], ...jobs.map(j => [j.id, `${j.title}${j.status === 'open' ? '' : ' (encerrada)'}`])], ui.board)}</select></label><p class="muted">${plural(apps.length, 'candidatura', 'candidaturas')}</p></div>
    <div class="board">${D.stages.map(st => { const list = apps.filter(a => a.stage === st); return `<section class="column" aria-label="${esc(st)}"><h2 class="column-head">${esc(st)} <span class="count-pill">${list.length}</span></h2>${list.map(card).join('') || '<p class="column-empty">Ninguém nesta etapa.</p>'}</section>`; }).join('')}</div>
    ${pendingRecs.length ? `<section class="card"><h2>Indicações das instituições</h2><p class="muted">Estudantes indicados que ainda não se candidataram.</p><ul class="plain-list divided">${pendingRecs.map(r => { const s = studentById(r.studentId); return `<li class="row">${avatar(s?.name)}<span class="grow"><strong>${esc(s?.name)}</strong><br><small class="muted">${esc(job(r.vacancyId)?.title)} · indicado por ${esc(instById(r.institutionId)?.shortName)}</small></span></li>`; }).join('')}</ul></section>` : ''}`;
}

function jobForm() {
  const check = state.institutions.map(i => `<label class="check"><input type="checkbox" name="institutionIds" value="${esc(i.id)}" checked><span>${esc(i.name)}</span></label>`).join('');
  return `<form class="modal-card form" data-form="publish" novalidate>
    ${modalHead('Publicar nova vaga')}
    <div class="modal-body">
      <label class="field"><span>Título da vaga</span><input name="title" maxlength="100" required autofocus placeholder="Ex.: Estágio em Design de Produto"></label>
      <div class="form-grid">
        <label class="field"><span>Curso</span><select name="course">${opts(D.courses, 'Design')}</select></label>
        <label class="field"><span>Tipo</span><select name="type" data-change="job-type">${opts(TYPES, 'Estágio')}</select></label>
        <label class="field"><span>Modalidade</span><select name="mode">${opts(MODES, 'Híbrido')}</select></label>
        <label class="field"><span>Turno</span><select name="shift">${opts(SHIFTS, 'Tarde')}</select></label>
        <label class="field"><span>Remuneração mensal (R$)</span><input name="salary" type="number" min="1" step="any" required inputmode="numeric"></label>
        <label class="field"><span>Horas por semana</span><input name="hours" type="number" min="1" max="44" step="1" required inputmode="numeric"></label>
        <label class="field"><span>Local</span><input name="location" maxlength="60" value="Santa Maria, RS"></label>
        <label class="field" data-supervisor><span>Supervisor(a) do estágio</span><input name="supervisor" maxlength="80"></label>
      </div>
      <p class="hint" data-type-hint>Estágio: informe um(a) supervisor(a) e carga de 1 a 30 horas semanais.</p>
      <label class="field"><span>Descrição <small class="counter" data-counter-for="description">0/3000</small></span><textarea name="description" rows="5" maxlength="3000" required placeholder="O que a pessoa vai fazer, aprender e o que você procura."></textarea></label>
      <fieldset class="field"><legend>Publicar para</legend><div class="checks-grid">${check}</div></fieldset>
      <p class="form-error" role="alert" hidden></p>
    </div>
    <footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal">Cancelar</button><button type="submit" class="btn primary">Publicar vaga</button></footer>
  </form>`;
}

/* ---------- INSTITUIÇÃO ---------- */
function instituicaoPainel() {
  const i = inst(), m = D.institutionMetrics(state, i.id);
  const ids = new Set(state.students.filter(s => s.institutionId === i.id).map(s => s.id));
  const recent = state.applications.filter(a => ids.has(a.studentId)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 6);
  const max = Math.max(1, ...Object.values(m.byStage));
  return pageHead(D.portalName(i), i.name, 'Visão da rede de carreiras dos seus estudantes.') +
    `<div class="metrics">${metric(m.students, 'Estudantes')}${metric(m.vacancies, 'Vagas disponíveis')}${metric(m.applications, 'Candidaturas')}${metric(m.hires, 'Contratações')}</div>
    <div class="two-col">
      <section class="card"><h2>Funil de candidaturas</h2><ul class="bars">${D.stages.map(st => `<li><span>${esc(st)}</span><span class="bar" aria-hidden="true"><i style="width:${(m.byStage[st] / max) * 100}%"></i></span><strong>${m.byStage[st]}</strong></li>`).join('')}</ul>
        <p class="muted small">${plural(m.recommendations, 'indicação feita', 'indicações feitas')} pela instituição.</p></section>
      <section class="card"><div class="section-head"><h2>Atividade recente</h2><a href="#/instituicao/talentos">Ver talentos</a></div>
        ${recent.length ? `<ul class="plain-list divided">${recent.map(a => { const s = studentById(a.studentId), j = job(a.vacancyId); return `<li class="row">${avatar(s?.name)}<span class="grow"><strong>${esc(s?.name)}</strong><br><small class="muted">${esc(j?.title)} · ${esc(company(j?.companyId).name)}</small></span><span class="chip stage-${D.stages.indexOf(a.stage)}">${esc(a.stage)}</span></li>`; }).join('')}</ul>` : '<p class="muted">Seus estudantes ainda não se candidataram.</p>'}</section>
    </div>`;
}

function instituicaoTalentos() {
  const i = inst(), list = state.students.filter(s => s.institutionId === i.id);
  return pageHead(D.portalName(i), 'Talentos', 'Estudantes da instituição e seus processos seletivos.') +
    (list.length ? `<div class="grid people">${list.map(s => {
      const apps = state.applications.filter(a => a.studentId === s.id), recs = state.recommendations.filter(r => r.studentId === s.id && r.institutionId === i.id);
      return `<article class="card person">
        <div class="cand-head">${avatar(s.name, 'lg')}<div><h2 class="h3">${esc(s.name)}</h2><p>${esc(s.course)} · ${esc(s.shift)}</p></div></div>
        <p class="muted">${esc(s.headline)}</p>${tags(s.skills || [])}
        <h3 class="mini">Candidaturas</h3>${apps.length ? `<ul class="plain-list mini-list">${apps.map(a => `<li><span>${esc(job(a.vacancyId)?.title)}</span><span class="chip stage-${D.stages.indexOf(a.stage)}">${esc(a.stage)}</span></li>`).join('')}</ul>` : '<p class="muted small">Nenhuma ainda.</p>'}
        ${recs.length ? `<h3 class="mini">Indicações</h3><ul class="plain-list mini-list">${recs.map(r => `<li>${ICON.star}<span>${esc(job(r.vacancyId)?.title)}</span></li>`).join('')}</ul>` : ''}
        <button type="button" class="btn small block" data-action="recommend" data-id="${esc(s.id)}">Indicar para vaga</button>
      </article>`;
    }).join('')}</div>` : empty('Nenhum estudante', 'Esta instituição ainda não tem estudantes cadastrados.'));
}

function recommendForm(studentId) {
  const s = studentById(studentId), i = inst(), jobs = D.visibleJobs(state, i.id);
  return `<form class="modal-card form" data-form="recommend" data-student="${esc(studentId)}">
    ${modalHead(`Indicar ${firstName(s?.name)}`)}
    <div class="modal-body">
      <p>A indicação aparece para a empresa junto da candidatura de ${esc(s?.name)}.</p>
      <label class="field"><span>Vaga</span><select name="vacancyId" required autofocus>${opts(jobs.map(j => [j.id, `${j.title} — ${company(j.companyId).name}${recommenders(studentId, j.id).includes(i.shortName) ? ' (já indicada)' : ''}`]), '')}</select></label>
      <p class="form-error" role="alert" hidden></p>
    </div>
    <footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal">Cancelar</button><button type="submit" class="btn primary">Indicar</button></footer>
  </form>`;
}

function instituicaoEstagios() {
  const i = inst(), list = D.internships(state, i.id);
  return pageHead(D.portalName(i), 'Estágios e contratações', 'Acompanhe documentos e relatórios dos estudantes contratados.') +
    '<p class="callout warn"><strong>Demonstração:</strong>&nbsp;as assinaturas e relatórios abaixo são simulados e não têm validade jurídica.</p>' +
    (list.length ? `<div class="stack">${list.map(a => {
      const s = studentById(a.studentId), j = job(a.vacancyId), c = company(j?.companyId);
      return `<article class="card intern">
        <div class="app-info">${logo(c)}<div><h2 class="h3">${esc(s?.name)}</h2><p>${esc(j?.title)} · ${esc(c.name)}</p><p class="muted small">${esc(j?.type)} · ${esc(j?.hours)}h/semana${j?.supervisor ? ` · supervisão: ${esc(j.supervisor)}` : ''}</p></div></div>
        <div class="intern-controls">
          <label class="field compact"><span>Termo de compromisso</span><select data-change="document" data-id="${esc(a.id)}">${opts(D.documentStatuses, state.documents[a.id] || D.documentStatuses[0])}</select></label>
          <label class="field compact"><span>Relatório de atividades</span><select data-change="report" data-id="${esc(a.id)}">${opts(D.reportStatuses, state.reports[a.id] || D.reportStatuses[0])}</select></label>
        </div>
      </article>`;
    }).join('')}</div>` : empty('Nenhuma contratação ainda', 'Quando uma empresa contratar um estudante da instituição, o acompanhamento aparece aqui.'));
}

function instituicaoPortal() {
  const i = inst(), accent = safeAccent(i.accent);
  return pageHead(D.portalName(i), 'Portal da instituição', 'Personalize como seus estudantes veem a rede.') +
    `<div class="two-col">
      <form class="card form" data-form="branding">
        <label class="field"><span>Nome do portal</span><input name="portalName" maxlength="60" minlength="2" required value="${esc(D.portalName(i))}"></label>
        <fieldset class="field"><legend>Cor de destaque</legend><div class="swatches">${ACCENTS.map(([hex, name]) => `<label class="swatch" style="--sw:${hex}"><input type="radio" name="accent" value="${hex}"${hex.toLowerCase() === accent.toLowerCase() ? ' checked' : ''}><span>${esc(name)}</span></label>`).join('')}</div></fieldset>
        <p class="form-error" role="alert" hidden></p>
        <div class="actions"><button type="submit" class="btn primary">Salvar portal</button></div>
      </form>
      <section class="card preview" id="portal-preview" style="--accent:${accent}" aria-label="Pré-visualização">
        <p class="eyebrow">Pré-visualização</p>
        <div class="preview-bar"><span class="preview-logo" aria-hidden="true"></span><strong data-preview-name>${esc(D.portalName(i))}</strong></div>
        <p class="preview-title">Sua próxima conquista começa com uma conexão.</p>
        <span class="btn primary">Ver vagas</span>
      </section>
    </div>`;
}

/* ---------- AJUDA ---------- */
function ajuda() {
  return pageHead('Ajuda', 'Como usar a demonstração', 'A Oportuniza Rede conecta estudantes, empresas e instituições de ensino.') +
    `<div class="two-col">
      <section class="card"><h2>Roteiro sugerido (5 minutos)</h2><ol class="steps">
        <li><strong>Empresa:</strong> publique um estágio para a Vale do Recanto (supervisor obrigatório, até 30h).</li>
        <li><strong>Aluno:</strong> encontre a nova vaga, salve e candidate-se.</li>
        <li><strong>Instituição:</strong> veja o funil e indique um talento para uma vaga.</li>
        <li><strong>Empresa:</strong> avance a candidatura até “Contratado”.</li>
        <li><strong>Instituição:</strong> acompanhe o termo e o relatório em Estágios.</li></ol></section>
      <section class="card"><h2>Perfis</h2><dl class="facts single">
        <div><dt>Aluno</dt><dd>Busca vagas, salva, se candidata e edita o perfil.</dd></div>
        <div><dt>Empresa</dt><dd>Estúdio Forma publica vagas e conduz os candidatos.</dd></div>
        <div><dt>Instituição</dt><dd>Acompanha estudantes, indica talentos e personaliza o portal.</dd></div></dl>
        <p class="muted small">Troque a instituição no topo para ver outro portal, outro estudante e outros registros.</p></section>
    </div>
    <section class="card"><h2>Seus dados</h2>
      <p>${storageOk ? 'As alterações ficam salvas apenas neste navegador.' : 'Este navegador bloqueou o armazenamento: as alterações valem só até fechar a aba.'} Todas as pessoas, empresas e vagas são fictícias.</p>
      <button type="button" class="btn danger" data-action="reset">Restaurar dados de exemplo</button></section>`;
}

/* ---------- roteamento e renderização ---------- */
const VIEWS = {
  aluno: { vagas: alunoVagas, salvas: alunoSalvas, candidaturas: alunoCandidaturas, perfil: alunoPerfil, vaga: alunoVaga },
  empresa: { painel: empresaPainel, vagas: empresaVagas, candidatos: empresaCandidatos },
  instituicao: { painel: instituicaoPainel, talentos: instituicaoTalentos, estagios: instituicaoEstagios, portal: instituicaoPortal },
};
const home = role => `#/${role}/${NAV[role][0][0]}`;
const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);

function render() {
  const [role, page, id] = route();
  let html, activeRole, activePage;
  if (role === 'ajuda' && !page) { html = ajuda(); activeRole = state.context.role; activePage = 'ajuda'; }
  else if (VIEWS[role]?.[page] && (page === 'vaga' ? id : !id)) {
    state.context.role = role; // só em memória: evita ciclos entre abas
    html = VIEWS[role][page](id); activeRole = role; activePage = page === 'vaga' ? 'vagas' : page;
  } else { location.replace(home(state.context.role)); return; }

  const i = inst();
  document.documentElement.style.setProperty('--accent', safeAccent(i.accent));
  document.title = `${activePage === 'ajuda' ? 'Ajuda' : NAV[activeRole].find(n => n[0] === activePage)?.[1] || 'Vaga'} · Oportuniza Rede`;
  $('#app').innerHTML = `
    <header class="topbar"><div class="wrap topbar-inner">
      <a class="brand" href="${home(activeRole)}"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M11 25V15h10m-4 14 12-12m-9-2h9v9"/></svg></span><span class="brand-text"><strong>Oportuniza Rede</strong><small>${esc(D.portalName(i))}</small></span></a>
      <span class="demo-badge" title="Dados fictícios">Demonstração</span>
      <div class="controls">
        <nav class="persona" aria-label="Ver como">${Object.keys(NAV).map(r => `<a href="${home(r)}"${r === activeRole && activePage !== 'ajuda' ? ' aria-current="true"' : ''}>${ROLE_LABEL[r]}</a>`).join('')}</nav>
        <label class="inst-select"><span class="sr-only">Instituição</span><select data-change="institution" aria-label="Instituição">${opts(state.institutions.map(x => [x.id, x.shortName]), i.id)}</select></label>
      </div></div>
      <nav class="tabs" aria-label="Seções"><div class="wrap tabs-inner">${NAV[activeRole].map(([p, label]) => `<a href="#/${activeRole}/${p}"${activePage === p ? ' aria-current="page"' : ''}>${label}</a>`).join('')}<a href="#/ajuda" class="help-link"${activePage === 'ajuda' ? ' aria-current="page"' : ''}>Ajuda</a></div></nav>
    </header>
    ${storageOk ? '' : '<p class="storage-note wrap" role="note">O navegador bloqueou o armazenamento local. Você pode navegar normalmente, mas as alterações serão perdidas ao fechar a aba.</p>'}
    <main id="main" class="wrap" tabindex="-1">${html}</main>
    <footer class="wrap footer"><p>Oportuniza Rede · MVP de demonstração. Pessoas, empresas e vagas são fictícias.</p><a href="#/ajuda">Ajuda e restauração</a></footer>`;

  if (location.hash !== lastRoute) {
    lastRoute = location.hash; window.scrollTo(0, 0);
    if (document.activeElement === document.body || !$('#app').contains(document.activeElement)) ($('#main h1') || $('#main')).focus({ preventScroll: true });
  }
}

/* ---------- ações (delegação) ---------- */
function showFormError(form, msg) { const p = form.querySelector('.form-error'); if (!p) return toast(msg, 'error'); p.textContent = msg; p.hidden = false; }

const ACTIONS = {
  'close-modal': () => closeModal(),
  'clear-filters': () => { Object.assign(ui, { q: '', type: '', mode: '', shift: '' }); render(); $('[data-filter="q"]')?.focus(); },
  'toggle-save': ({ id }) => mutate(s => D.toggleSaved(s, id, student().id), on => (on ? 'Vaga salva.' : 'Vaga removida dos salvos.')),
  apply: ({ id }) => mutate(s => D.apply(s, id, student().id), () => `Candidatura enviada para ${company(job(id).companyId).name}!`),
  'new-job': () => { openModal(jobForm()); syncJobType(); },
  'toggle-status': ({ id }) => { const j = job(id); mutate(s => D.setVacancyStatus(s, id, j.status === 'open' ? 'closed' : 'open'), r => (r.status === 'open' ? 'Vaga reaberta.' : 'Vaga encerrada: ela não aparece mais para estudantes.')); },
  'see-candidates': ({ id }) => { ui.board = id; location.hash = '#/empresa/candidatos'; },
  advance: ({ id }) => { const a = state.applications.find(x => x.id === id), next = D.stages[D.stages.indexOf(a.stage) + 1]; mutate(s => D.moveApplication(s, id, next), `${studentById(a.studentId)?.name} avançou para ${next}.`); },
  recommend: ({ id }) => openModal(recommendForm(id)),
  reset: () => openModal(`<div class="modal-card">${modalHead('Restaurar dados de exemplo?')}<div class="modal-body"><p>Vagas publicadas, candidaturas, perfis e personalizações feitas nesta demonstração serão apagados deste navegador.</p></div><footer class="modal-foot"><button type="button" class="btn ghost" data-action="close-modal" autofocus>Cancelar</button><button type="button" class="btn danger" data-action="confirm-reset">Restaurar</button></footer></div>`),
  'confirm-reset': () => { state = D.seed(); Object.assign(ui, { q: '', type: '', mode: '', shift: '', board: '' }); persist(); closeModal(); if (location.hash === home('aluno')) render(); else location.hash = home('aluno'); toast('Dados de exemplo restaurados.'); },
};

const CHANGES = {
  institution: v => { state.context.institutionId = v; persist(); render(); toast(`Visualizando ${inst().shortName}.`); },
  board: v => { ui.board = v; render(); $('[data-change="board"]')?.focus(); },
  stage: (v, { id }) => { const a = state.applications.find(x => x.id === id); mutate(s => D.moveApplication(s, id, v), `${studentById(a?.studentId)?.name}: ${v}.`); $(`[data-change="stage"][data-id="${CSS.escape(id)}"]`)?.focus(); },
  document: (v, { id }) => mutate(s => D.setDocumentStatus(s, id, v, inst().id), `Termo: ${v}.`),
  report: (v, { id }) => mutate(s => D.setReportStatus(s, id, v, inst().id), `${v}.`),
  'job-type': () => syncJobType(),
};

function syncJobType() {
  const f = $('[data-form="publish"]'); if (!f) return;
  const intern = f.type.value === 'Estágio';
  f.querySelector('[data-supervisor]').hidden = !intern;
  f.supervisor.required = intern;
  f.hours.max = intern ? 30 : 44;
  f.querySelector('[data-type-hint]').textContent = intern ? 'Estágio: informe um(a) supervisor(a) e carga de 1 a 30 horas semanais.' : 'Primeiro emprego: carga de 1 a 44 horas semanais.';
}

const FORMS = {
  filters: () => {},
  profile: f => {
    const data = Object.fromEntries(new FormData(f));
    try { D.updateProfile(state, student().id, data); persist(); render(); toast('Perfil atualizado.'); }
    catch (e) { showFormError(f, e.message); }
  },
  publish: f => {
    const fd = new FormData(f), data = Object.fromEntries(fd);
    data.institutionIds = fd.getAll('institutionIds');
    if (data.type !== 'Estágio') data.supervisor = '';
    if (!String(data.location || '').trim()) data.location = 'A combinar';
    try {
      const j = D.publish(state, data); persist(); closeModal();
      if (location.hash === '#/empresa/vagas') render(); else location.hash = '#/empresa/vagas';
      toast(`Vaga “${j.title}” publicada para ${plural(j.institutionIds.length, 'instituição', 'instituições')}.`);
    } catch (e) { showFormError(f, e.message); }
  },
  recommend: f => {
    const sid = f.dataset.student, vid = f.vacancyId.value;
    try { D.recommend(state, sid, vid, inst().id); persist(); closeModal(); render(); toast(`${firstName(studentById(sid)?.name)} indicado(a) para ${job(vid)?.title}.`); }
    catch (e) { showFormError(f, e.message); }
  },
  branding: f => {
    const data = Object.fromEntries(new FormData(f));
    try { D.updateBranding(state, inst().id, data); persist(); render(); toast('Portal atualizado.'); }
    catch (e) { showFormError(f, e.message); }
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) { e.preventDefault(); ACTIONS[el.dataset.action](el.dataset, el); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]');
  if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el.value, el.dataset);
  if (e.target.dataset.filter) onFilter(e.target);
  if (e.target.name === 'accent') $('#portal-preview')?.style.setProperty('--accent', safeAccent(e.target.value));
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.filter) onFilter(t);
  const counter = t.form?.querySelector(`[data-counter-for="${t.name}"]`);
  if (counter) counter.textContent = `${t.value.length}/${t.maxLength}`;
  if (t.name === 'portalName') { const n = $('[data-preview-name]'); if (n) n.textContent = t.value; }
  const err = t.form?.querySelector('.form-error'); if (err && !err.hidden) err.hidden = true;
});
document.addEventListener('submit', e => {
  const f = e.target, k = f.dataset.form;
  if (!k || !FORMS[k]) return;
  e.preventDefault();
  if (k !== 'filters' && k !== 'publish' && !f.reportValidity()) return;
  if (k === 'publish') {
    const bad = [...f.elements].find(el => el.willValidate && !el.checkValidity());
    if (bad) { showFormError(f, bad.name === 'hours' ? `Informe uma carga horária entre 1 e ${bad.max} horas.` : bad.name === 'salary' ? 'Informe uma remuneração maior que zero.' : bad.name === 'supervisor' ? 'Para este estágio, informe um(a) supervisor(a).' : 'Preencha o título e a descrição da vaga.'); bad.focus(); return; }
  }
  FORMS[k](f);
});
function onFilter(t) {
  if (ui[t.dataset.filter] === t.value) return; // evita redesenhar no blur (ex.: clique em "Limpar")
  ui[t.dataset.filter] = t.value;
  $('#results').innerHTML = resultsHtml();
  $('#count').textContent = countText();
}

window.addEventListener('hashchange', render);
window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  state = e.newValue ? D.restore(e.newValue) : D.seed();
  closeModal(); render(); toast('Dados atualizados em outra aba.');
});

render();
