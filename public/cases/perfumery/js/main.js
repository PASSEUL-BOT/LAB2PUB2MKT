// Entry point: renders every section, wires every control, routes between the learning
// chapters and the Explore Real Perfumes tool. All shared state lives in state.js.
import { state } from './state.js';
import { esc } from './ui.js';
import { FAMILIES } from './data/families.js';
import { ING_BY_ID } from './data/ingredients.js';
import { PHOTOS } from './data/photos.js';
import { initSpeech, speech, setHoverEnabled, setMuted, setVolume, onStatus, isSupported, findVoice, speakLong, stop } from './speech.js';
import { renderCh1, renderFamilyCards, renderCh3, renderCh4, renderWheelSlots } from './views.js';
import { renderLab } from './lab.js';
import { renderLookup } from './lookup.js';
import { searchAll, getProduct } from './source.js';

const $ = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ rendering
function renderWheels() {
  document.querySelectorAll('.wheel-host').forEach(renderWheelSlots);
  $('fam-cards').innerHTML = renderFamilyCards();
}
function renderCh1Now() { $('ch1-root').innerHTML = renderCh1(); }
function renderCh3Now() { $('ch3-root').innerHTML = renderCh3(); }
function renderLabNow() {
  // drop references to things that are no longer in the combination
  const c = state.lab.combo;
  if (state.lab.pair) {
    const [a, b] = state.lab.pair.split('+');
    if (!c.includes(a) || !c.includes(b)) state.lab.pair = null;
  }
  if (state.lab.node && !c.includes(state.lab.node)) state.lab.node = null;
  renderLab();
}

// Re-render, then put keyboard focus back on the control the user just used.
function keepFocus(fn) {
  const el = document.activeElement;
  const act = el && el.getAttribute && el.getAttribute('data-act');
  const arg = el && el.getAttribute && el.getAttribute('data-arg');
  const root = el && el.closest ? el.closest('[data-focus-root]') : null;
  fn();
  if (act) {
    const scope = (root && root.id && $(root.id)) || document;
    const next = Array.from(scope.querySelectorAll('[data-act]')).find(n => n.getAttribute('data-act') === act && n.getAttribute('data-arg') === arg);
    if (next) next.focus({ preventScroll: true });
  }
}

// ------------------------------------------------------------------ navigation
function scrollToId(id, focus = true) {
  const el = $(id); if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  if (focus) { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
}
function goto(id) { if (location.hash === '#' + id) route(); else location.hash = id; }

let lookupDrawn = false, routedOnce = false;
const PANELS = ['top', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5'];
// Which level (panel) holds this id? A chapter id is its own panel; anything inside a chapter
// (e.g. #lab-picker, #accord-rose) opens that chapter first.
function panelFor(id) {
  if (!id || id === 'top') return 'top';
  const el = $(id); if (!el) return null;
  const sec = el.closest('.panel');
  return sec ? sec.id : null;
}
function showPanel(id) {
  PANELS.forEach(pid => { const el = $(pid); if (el) el.hidden = pid !== id; });
  document.querySelectorAll('.nav a').forEach(a => {
    const t = a.getAttribute('href').slice(1);
    if (t === id) { a.setAttribute('aria-current', 'page'); const nv = a.parentElement; if (nv && nv.scrollWidth > nv.clientWidth) nv.scrollLeft = a.offsetLeft - (nv.clientWidth - a.offsetWidth) / 2; } else a.removeAttribute('aria-current');
  });
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  const perf = h === 'perfumes';
  document.body.dataset.view = perf ? 'perfumes' : 'learn';
  $('view-learn').hidden = perf;
  $('view-perfumes').hidden = !perf;
  if (perf) {
    document.querySelectorAll('.nav a').forEach(a => { if (a.getAttribute('href') === '#perfumes') a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (!lookupDrawn) { renderLookup(); lookupDrawn = true; }
    window.scrollTo(0, 0);
    return;
  }
  const pid = panelFor(h) || 'top';
  showPanel(pid);
  if (!h || PANELS.includes(h)) {            // a level tab: start at its top
    window.scrollTo(0, 0);
    const head = routedOnce ? $(pid).querySelector('h1, h2') : null; if (head) { head.setAttribute('tabindex', '-1'); head.focus({ preventScroll: true }); }
  } else {
    requestAnimationFrame(() => scrollToId(h));
  }
  routedOnce = true;
}

// ------------------------------------------------------------------ lab helpers
function labTouched() { state.lab.pair = null; state.lab.node = null; state.lab.edge = null; }
function addToLab(id) { if (ING_BY_ID[id] && !state.lab.combo.includes(id)) { state.lab.combo.push(id); return true; } return false; }
function move(id, delta) {
  const c = state.lab.combo, i = c.indexOf(id), j = i + delta;
  if (i < 0 || j < 0 || j >= c.length) return;
  [c[i], c[j]] = [c[j], c[i]];
}

// ------------------------------------------------------------------ actions
const ACTIONS = {
  'fam.open'(id) { const o = state.famOpen; const i = o.indexOf(id); if (i >= 0) o.splice(i, 1); else o.push(id); $('fam-cards').innerHTML = renderFamilyCards(); },
  'narr.en'(_, el) { speech.activated = true; speakLong(narrationText(el.closest('.guide'), 'en'), 'en'); },
  'narr.stop'() { stop(); },
  // ---- wheel
  'wheel.toggle'(id) {
    const s = state.wheel.selected, i = s.indexOf(id);
    if (i >= 0) s.splice(i, 1); else { s.push(id); if (s.length > 5) s.shift(); }
    state.wheel.pair = null; renderWheels();
  },
  'wheel.clear'() { state.wheel.selected = []; state.wheel.pair = null; renderWheels(); },
  'wheel.pair'(key) { state.wheel.pair = key; renderWheels(); },
  'wheel.with'(key) { state.wheel.selected = key.split('|'); state.wheel.pair = key; renderWheels(); goto('wheel-ch2-panel'); },
  'wheel.reset'() { state.wheel.q = ''; state.wheel.filter = 'all'; $('wheel-q').value = ''; $('wheel-filter').value = 'all'; renderWheels(); },
  'wheel.tolab'() { state.lab.fam = 'wheel'; state.lab.q = ''; renderLabNow(); goto('lab-picker'); },

  // ---- chapter 1 / 3
  'ch1.toggle'(id) {
    const c = state.ch1.chosen, i = c.indexOf(id);
    if (i >= 0) c.splice(i, 1); else { c.push(id); if (c.length > 5) c.shift(); }
    renderCh1Now();
  },
  'ch1.clear'() { state.ch1.chosen = []; renderCh1Now(); },
  'ch3.goto'(id) { const o = state.ch3.open, i = o.indexOf(id); if (i >= 0) { o.splice(i, 1); renderCh3Now(); const l = document.querySelector(`[data-act="ch3.goto"][data-arg="${id}"]`); if (l) l.focus(); return; } o.push(id); state.ch3.role = id; renderCh3Now(); const c = $('role-' + id); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); c.focus({ preventScroll: true }); } },
  'ch3.role'(id) { state.ch3.role = id; renderCh3Now(); },

  // ---- lab
  'lab.toggle'(id) {
    const c = state.lab.combo, i = c.indexOf(id);
    if (i >= 0) c.splice(i, 1); else c.push(id);
    labTouched(); renderLabNow(); renderWheelMarks();
  },
  'lab.add'(id) { addToLab(id); labTouched(); renderLabNow(); },
  'lab.remove'(id) { state.lab.combo = state.lab.combo.filter(x => x !== id); labTouched(); renderLabNow(); },
  'lab.up'(id) { move(id, -1); renderLabNow(); },
  'lab.down'(id) { move(id, 1); renderLabNow(); },
  'lab.clear'() { state.lab.combo = []; state.lab.origin = null; labTouched(); renderLabNow(); },
  'lab.pair'(key) { state.lab.pair = key; renderLabNow(); },
  'lab.edge'(key) { state.lab.edge = state.lab.edge === key ? null : key; renderLabNow(); },
  'lab.node'(id) { state.lab.node = state.lab.node === id ? null : id; renderLabNow(); },
  'lab.load'(arg, el) {
    const ids = arg.split(',').filter(id => ING_BY_ID[id]);
    state.lab.combo = ids; state.lab.fam = 'all'; state.lab.q = ''; labTouched();
    state.lab.origin = { label: (el && el.dataset.label) || 'A teaching example', note: 'Loaded as a starting point. It is a teaching example or inspiration, never the formula of a real perfume.' };
    renderLabNow(); goto('lab-combo-h');
  },
  'lab.addgo'(id) { addToLab(id); labTouched(); renderLabNow(); goto('lab-combo-h'); },
  'lab.family'(id) { state.lab.fam = id; state.lab.q = ''; renderLabNow(); goto('lab-picker'); },
  'lab.resetfilter'() { state.lab.fam = 'all'; state.lab.q = ''; renderLabNow(); },
  'lab.dismiss'() { state.lab.origin = null; renderLabNow(); },

  // ---- Explore Real Perfumes
  async 'lookup.open'(id) {
    state.lookup.open = await getProduct(id); state.lookup.explore = false;
    renderLookup(); scrollToId('prod-title');
  },
  'lookup.close'() { state.lookup.open = null; state.lookup.explore = false; renderLookup(); scrollToId('lookup-results', false); },
  'lookup.explore'() { state.lookup.explore = !state.lookup.explore; renderLookup(); if (state.lookup.explore) scrollToId('explore-panel'); },
  'lookup.reset'() {
    state.lookup = { query: { brand: '', name: '', concentration: '', year: '' }, includeDemo: false, searched: false, result: null, open: null, explore: false };
    renderLookup();
  },
  async 'lookup.demo'(_, el) { state.lookup.includeDemo = el.checked; if (state.lookup.searched) await runSearch(); else renderLookup(); }
};

// small marker so the wheel in Ch2/5C also shows which families the current combination uses
function renderWheelMarks() { /* the wheel panel already lists the selected families; nothing extra to draw */ }

async function runSearch(form) {
  const f = form || $('lookup-form');
  const fd = new FormData(f);
  const q = {
    brand: String(fd.get('brand') || '').trim(), name: String(fd.get('name') || '').trim(),
    concentration: String(fd.get('concentration') || ''), year: String(fd.get('year') || '').trim()
  };
  state.lookup.query = q; state.lookup.searched = true;
  if (q.year && !/^\d{4}$/.test(q.year)) {
    state.lookup.result = { hits: [], suggestions: [], hiddenByFilter: 0, demoHidden: 0, totalRecords: 0,
      error: { en: 'Please enter a four-digit year such as 1925, or leave the year empty.', fr: 'Saisissez une année à quatre chiffres, par exemple 1925, ou laissez le champ vide.' } };
  } else {
    state.lookup.result = await searchAll({ ...q, includeDemo: state.lookup.includeDemo });
  }
  const open = state.lookup.open;
  if (open && !(state.lookup.result.hits.some(h => h.product.id === open.id))) { state.lookup.open = null; state.lookup.explore = false; }
  renderLookup();
  const box = $('lookup-results'); if (box) { box.setAttribute('tabindex', '-1'); box.focus({ preventScroll: false }); }
}

async function dispatch(name, arg, el) {
  const fn = ACTIONS[name];
  if (!fn) { console.warn('Unknown action', name); return; }
  const isLookup = name.startsWith('lookup.');
  if (isLookup) await fn(arg, el); else keepFocus(() => fn(arg, el));
}

// ------------------------------------------------------------------ visible voice messages + level narration
let toastTimer = 0;
function toast(msg) {
  const t = $('sp-toast'); if (!t) return;
  clearTimeout(toastTimer);
  if (!msg) { t.hidden = true; return; }
  t.textContent = msg; t.hidden = false;
  toastTimer = setTimeout(() => { t.hidden = true; }, 9000);
}
// Text of a level's "idea + how to use" card in one language. EN = visible English text, FR = the lang="fr" parts.
function narrationText(aside, lang) {
  const out = [];
  aside.querySelectorAll('.guide-col').forEach(col => {
    const h = col.querySelector('h3');
    if (h) out.push(((lang === 'fr' ? (h.querySelector('i[lang="fr"]') || {}).textContent : h.firstChild.textContent) || '').trim() + '.');
    col.querySelectorAll('p, li').forEach(n => {
      if (n.closest('h3')) return;
      let t;
      if (n.tagName === 'LI') t = lang === 'fr' ? (n.querySelector('i[lang="fr"]') || {}).textContent : n.firstChild.textContent;
      else if (n.classList.contains('p-fr')) t = lang === 'fr' ? n.textContent : '';
      else if (n.children.length === 1 && n.firstElementChild.lang === 'zh-Hant') t = '';
      else t = lang === 'fr' ? '' : n.textContent;
      if (t && t.trim()) out.push(t.trim().replace(/([^.!?])$/, '$1.'));
    });
  });
  return out.filter(Boolean).join(' ');
}
function addNarrationButtons() {
  document.querySelectorAll('.guide').forEach(g => {
    if (g.querySelector('.guide-listen')) return;
    const row = document.createElement('div'); row.className = 'guide-listen';
    row.innerHTML = '<button type="button" class="btn btn-sm" data-act="narr.en" aria-label="Listen to this level\'s introduction in English">🔊 Listen to this level</button>' +
      '<button type="button" class="btn btn-sm ghost" data-act="narr.stop">■ Stop <i lang="fr">Arrêter</i></button>';
    g.insertBefore(row, g.firstChild);
  });
}

// ------------------------------------------------------------------ voice panel
function voiceInfo() {
  const box = $('sp-voices'); if (!box) return;
  if (!isSupported()) { box.textContent = 'This browser has no speech synthesis, so pronunciation is unavailable. All text is still readable.'; return; }
  const en = findVoice('en'), fr = findVoice('fr');
  box.innerHTML = `English voice: <b>${en ? esc(en.name) : 'none found'}</b> · French voice: <b>${fr ? esc(fr.name) : 'none found'}</b>` +
    (fr ? '' : '<br><span class="warn-text">No French voice is installed on this device, so the FR buttons cannot play. Installing a French voice in your system settings fixes this. <i lang="fr">Aucune voix française installée : les boutons FR ne peuvent pas jouer.</i></span>');
}
function wireVoice() {
  const supported = isSupported();
  ['sp-hover', 'sp-mute', 'sp-vol'].forEach(id => { $(id).disabled = !supported; });
  $('sp-hover').addEventListener('change', e => setHoverEnabled(e.target.checked));
  $('sp-mute').addEventListener('change', e => setMuted(e.target.checked));
  $('sp-vol').addEventListener('input', e => { setVolume(e.target.value / 100); $('sp-vol-out').textContent = e.target.value + '%'; });
  onStatus(msg => { $('sp-status').textContent = msg; toast(msg); });
  const hint = () => { if (!speech.activated) $('sp-status').textContent = 'Press any key or tap once to turn sound on (browsers block sound until then).'; };
  hint();
  document.addEventListener('pointerdown', () => { if (speech.activated && /turn sound on/.test($('sp-status').textContent)) $('sp-status').textContent = ''; }, { capture: true });
  document.addEventListener('keydown', () => { if (speech.activated && /turn sound on/.test($('sp-status').textContent)) $('sp-status').textContent = ''; }, { capture: true });
  voiceInfo();
  if (supported && window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', voiceInfo);
  const btn = $('voice-btn'), panel = $('voice-panel');
  btn.addEventListener('click', () => { const open = panel.hidden; panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
}

// ------------------------------------------------------------------ startup
function wireEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el || el.hasAttribute('data-act-change')) return;
    if (el.tagName === 'A') e.preventDefault();
    dispatch(el.getAttribute('data-act'), el.getAttribute('data-arg'), el);
  });
  // Keyboard activation for SVG parts that act as buttons (wheel segments, chords, map nodes/edges)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target;
    if (!el || !el.matches || !el.matches('[role="button"][data-act]') || el.tagName === 'BUTTON') return;
    e.preventDefault();
    dispatch(el.getAttribute('data-act'), el.getAttribute('data-arg'), el);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.matches('[data-act-change]')) { dispatch(el.getAttribute('data-act-change'), el.getAttribute('data-arg'), el); return; }
    if (el.id === 'lab-fam') { state.lab.fam = el.value; renderLabNow(); }
    else if (el.id === 'wheel-filter') { state.wheel.filter = el.value; renderWheels(); }
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'lab-search') { state.lab.q = el.value; renderLabNow(); }
    else if (el.id === 'wheel-q') { state.wheel.q = el.value; renderWheels(); }
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'lookup-form') { e.preventDefault(); runSearch(e.target); }
  });
  // Radar: show what a point means on hover or keyboard focus
  const radarInfo = e => {
    const pt = e.target.closest ? e.target.closest('.radar-pt') : null;
    const box = document.querySelector('.radar-info'); if (!pt || !box) return;
    box.textContent = pt.getAttribute('aria-label');
  };
  document.addEventListener('pointerover', radarInfo);
  document.addEventListener('focusin', radarInfo);
  window.addEventListener('hashchange', route);
}

function init() {
  $('lab-fam').innerHTML = `<option value="all">All families / Toutes les familles</option><option value="wheel">Families selected on the wheel / Familles choisies sur la roue</option>` +
    FAMILIES.map(f => `<option value="${f.id}">${esc(f.en)} / ${esc(f.fr)}</option>`).join('');
  initSpeech(document);
  addNarrationButtons();
  $('photo-credits-list').innerHTML = Object.entries(PHOTOS).map(([id, p]) => `<li><b>${esc(p.name)}</b>: <a href="${esc(p.page)}" target="_blank" rel="noopener">${esc(p.title)}</a>, ${esc(p.author)}, ${p.licurl ? `<a href="${esc(p.licurl)}" target="_blank" rel="noopener">${esc(p.license)}</a>` : esc(p.license)}</li>`).join('');
  wireVoice();
  wireEvents();
  renderCh1Now(); renderCh3Now(); $('ch4-root').innerHTML = renderCh4();
  renderWheels(); renderLabNow();
  route();
  document.documentElement.dataset.ready = '1';
}
init();
