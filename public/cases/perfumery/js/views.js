// Chapters 1-4 and the shared Fragrance Wheel panel / relation card.
import { state } from './state.js';
import { esc, L, Q, QZ, term, famChip, badge, dirChips, bilingualPara, zhPara, ingLabel } from './ui.js';
import { FAMILIES, FAMILY_BY_ID } from './data/families.js';
import { INGREDIENTS, ING_BY_ID } from './data/ingredients.js';
import { DESCRIPTORS, ROLES, CONCEPTS } from './data/descriptors.js';
import { ACCORDS } from './data/accords.js';
import { TYPE_META, EVIDENCE_META, DIRS, partnersOf, relatedFamilies } from './data/relations.js';
import { relationBetweenFamilies } from './engine.js';
import { wheelSVG } from './charts.js';

const dirObjs = keys => (keys || []).map(k => DIRS[k]).filter(Boolean);
const pairKey = (a, b) => a + '|' + b;

// ================= shared: relation card (used by wheel AND lab) =================
export function relationCard(famA, famB, extraButtons = '', zhMode = false) {
  const T = zhMode ? (en, fr, zh) => QZ(en, zh || '') : Q;
  const P = zhMode ? zhPara : bilingualPara;
  const rel = relationBetweenFamilies(famA, famB);
  const A = FAMILY_BY_ID[famA], B = FAMILY_BY_ID[famB];
  const tm = TYPE_META[rel.type], em = EVIDENCE_META[rel.evidence];
  return `<article class="rel-card" aria-label="Relationship: ${esc(A.en)} and ${esc(B.en)}">
    <header class="rel-head">
      ${famChip(A)} <span class="times" aria-hidden="true">×</span> ${famChip(B)}
    </header>
    <div class="rel-badges">${badge(tm, '', zhMode)} ${badge(em, '', zhMode)}</div>
    <dl class="rel-dl">
      <dt>${T('Family A', 'Famille A', '家族 A')}</dt><dd>${term(A)}</dd>
      <dt>${T('Family B', 'Famille B', '家族 B')}</dt><dd>${term(B)}</dd>
      <dt>${T('Relationship type', 'Type de relation', '關係類型')}</dt><dd>${esc(tm.en)} ${zhMode ? '' : `<i lang="fr">/ ${esc(tm.fr)}</i> `}<small lang="zh-Hant">${tm.zh}</small></dd>
      <dt>${T('Educational rationale', 'Justification pédagogique', '教學理由')}</dt><dd>${P(rel.why)}</dd>
      <dt>${T('Expected scent effect', 'Effet olfactif attendu', '預期氣味效果')}</dt><dd>${dirChips(dirObjs(rel.dirs), zhMode)}<p class="note">An expected direction, not a guaranteed result. ${zhMode ? '<small lang="zh-Hant">這是預期的方向，不保證一定如此。</small>' : '<i lang="fr">Une direction attendue, pas un résultat garanti.</i>'}</p></dd>
      <dt>${T('Potential challenge', 'Difficulté possible', '可能的困難')}</dt><dd>${P(rel.challenge)}</dd>
      <dt>${T('Suggested next experiment', 'Prochaine expérience suggérée', '建議的下一個實驗')}</dt><dd>${P(rel.next)}</dd>
      <dt>${T('Evidence status', 'Niveau de fiabilité', '依據等級')}</dt><dd>${esc(em.en)} ${zhMode ? '' : `<i lang="fr">/ ${esc(em.fr)}</i> `}<small lang="zh-Hant">${em.zh}</small><p class="note">${esc(rel.source)}</p></dd>
    </dl>
    <p class="note warn">Wheel position is not evidence of compatibility: different classification systems place and name families differently. ${zhMode ? '<small lang="zh-Hant">輪盤上的位置不能證明合不合：不同的分類系統排列和命名家族的方式不同。</small>' : '<i lang="fr">La position sur la roue ne prouve pas la compatibilité : chaque système de classification organise les familles à sa façon.</i>'}</p>
    ${extraButtons}
  </article>`;
}

// ================= Fragrance Wheel: panel under the SVG =================
export function selectedPair() {
  const s = state.wheel.selected;
  if (s.length < 2) return null;
  const p = state.wheel.pair;
  if (p) { const [a, b] = p.split('|'); if (s.includes(a) && s.includes(b)) return [a, b]; }
  return [s[s.length - 2], s[s.length - 1]];
}

export function renderWheelSlots(host) {
  const sel = state.wheel.selected;
  const pair = selectedPair();
  const svgSlot = host.querySelector('.wheel-svg-slot');
  const panel = host.querySelector('.wheel-panel-slot');
  svgSlot.innerHTML = wheelSVG({ selected: sel, q: state.wheel.q, activePair: pair ? pair.join('|') : null }) +
    `<p class="note center">Numbers match the list on the right. Click a segment, or use the list. Dashed lines = less certain relationships. <i lang="fr">Les numéros correspondent à la liste.</i></p>`;
  const famList = `<div class="fam-list" role="group" aria-label="Families (list version of the wheel)">${
       FAMILIES.filter(f => !state.wheel.q || (f.en + f.fr + f.zh).toLowerCase().includes(state.wheel.q.toLowerCase())).map(f => {
         const on = sel.includes(f.id);
         return `<button type="button" class="fam-btn ${on ? 'on' : ''}" style="--fc:${f.color}" aria-pressed="${on}" data-act="wheel.toggle" data-arg="${f.id}"><span class="fam-num">${FAMILY_BY_ID[f.id].n}</span> ${esc(f.en)} <i lang="fr">${esc(f.fr)}</i></button>`;
       }).join('')}</div>`;

  let html = '';
  if (!sel.length) {
    html = `<div class="panel-hint"><p><b>Start here.</b> Select a family to see its character, then select a second one to open the relationship between them.</p></div>`;
  } else {
    html += `<div class="sel-row"><b>Selected</b> <i lang="fr">Sélection</i>: ${sel.map(id => `<span class="sel-chip" style="--fc:${FAMILY_BY_ID[id].color}">${esc(FAMILY_BY_ID[id].en)} <button type="button" class="x" data-act="wheel.toggle" data-arg="${id}" aria-label="Remove ${esc(FAMILY_BY_ID[id].en)} from selection">✕</button></span>`).join(' ')}
      <button type="button" class="btn btn-sm ghost" data-act="wheel.clear">${L('Clear selection', 'Effacer la sélection')}</button></div>`;
    if (sel.length === 1) html += familyDetail(sel[0]);
    else {
      const pairs = [];
      for (let i = 0; i < sel.length; i++) for (let j = i + 1; j < sel.length; j++) pairs.push([sel[i], sel[j]]);
      html += `<div class="pair-tabs" role="group" aria-label="Relationships among selected families">${pairs.map(([a, b]) => {
        const rel = relationBetweenFamilies(a, b); const on = pair && pair[0] === a && pair[1] === b;
        return `<button type="button" class="pair-tab ${on ? 'on' : ''}" aria-pressed="${on}" data-act="wheel.pair" data-arg="${pairKey(a, b)}" style="--c:${TYPE_META[rel.type].color}">${esc(FAMILY_BY_ID[a].en)} × ${esc(FAMILY_BY_ID[b].en)}<small>${esc(TYPE_META[rel.type].en)}</small></button>`;
      }).join('')}</div>`;
      html += relationCard(pair[0], pair[1]);
    }
    html += `<div class="panel-actions"><button type="button" class="btn" data-act="wheel.tolab">${L('Show ingredients from these families in the lab', 'Voir les ingrédients de ces familles dans le laboratoire', '在實驗室查看這些家族的材料')}</button></div>`;
  }
  panel.innerHTML = famList + html;
}

function partnerButtons(id, types) {
  const list = partnersOf(id, types);
  if (!list.length) return `<span class="muted">None curated yet. <i lang="fr">Aucune pour l’instant.</i></span>`;
  return list.map(p => `<button type="button" class="chip-btn" style="--fc:${FAMILY_BY_ID[p.id].color}" data-act="wheel.with" data-arg="${pairKey(id, p.id)}">${esc(FAMILY_BY_ID[p.id].en)} <i lang="fr">${esc(FAMILY_BY_ID[p.id].fr)}</i></button>`).join(' ');
}

function familyDetail(id) {
  const f = FAMILY_BY_ID[id];
  const ex = INGREDIENTS.filter(i => i.family === id);
  return `<article class="fam-detail" style="--fc:${f.color}">
    <header>${term(f, { cls: 'term-lg' })}</header>
    <p><b>Key characteristics</b> <i lang="fr">Caractéristiques</i>: ${esc(f.traits)}</p>
    <p><b>Representative scents</b> <i lang="fr">Odeurs représentatives</i>: ${ex.map(i => `<span class="ing-inline">${ingLabel(i)}</span>`).join(' ')}</p>
    <p><b>Common pairing directions</b> <i lang="fr">Directions d’association fréquentes</i></p><div class="chips">${partnerButtons(id, ['common'])}</div>
    <p><b>Worth exploring</b> <i lang="fr">À explorer</i></p><div class="chips">${partnerButtons(id, ['contrast', 'exploratory'])}</div>
    <p class="note">Select a second family to open the relationship. <i lang="fr">Choisissez une seconde famille pour ouvrir la relation.</i></p>
  </article>`;
}

// ================= Chapter 1 =================
function sentence(chosen) {
  if (!chosen.length) return null;
  const ds = chosen.map(id => DESCRIPTORS.find(d => d.id === id));
  const join = (arr, and) => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ` ${and} ` + arr[arr.length - 1];
  const en = ds.map(d => d.en.toLowerCase());
  const art = /^[aeiou]/.test(en[0]) ? 'An' : 'A';
  return {
    en: `${art} ${join(en, 'and')} scent.`,
    fr: `Un parfum ${join(ds.map(d => d.fr.toLowerCase()), 'et')}.`,
    zh: `一款${ds.map(d => d.zh).join('、')}的氣味。`
  };
}

export function renderCh1() {
  const chosen = state.ch1.chosen;
  const rows = DESCRIPTORS.map(d => {
    const on = chosen.includes(d.id); const ex = ING_BY_ID[d.example];
    return `<tr><th scope="row">${term(d)}</th><td data-label="Definition">${esc(d.def)}</td><td data-label="Example scent">${term(ex, { cls: 'term-sm' })}</td>
      <td><button type="button" class="btn btn-sm ${on ? 'on' : ''}" aria-pressed="${on}" data-act="ch1.toggle" data-arg="${d.id}">${on ? 'Selected ✓' : 'Add to description'}</button></td></tr>`;
  }).join('');

  const s = sentence(chosen);
  let tool = `<p class="panel-hint">Choose two or more words below to build a description and compare what they mean.</p>`;
  if (s) {
    const all = INGREDIENTS.filter(i => chosen.every(c => i.desc.includes(c)));
    const near = INGREDIENTS.map(i => ({ i, k: chosen.filter(c => i.desc.includes(c)).length })).filter(x => x.k > 0).sort((a, b) => b.k - a.k || a.i.en.localeCompare(b.i.en));
    const matches = (all.length ? all : near.map(x => x.i)).slice(0, 8);
    tool = `<div class="sentence"><p class="s-en">${esc(s.en)}</p><p class="s-fr" lang="fr">${esc(s.fr)}</p><small lang="zh-Hant">${esc(s.zh)}</small></div>
      <p><b>${all.length ? 'Scents that match every word' : 'Closest scents (no single ingredient matches every word)'}</b> <i lang="fr">${all.length ? 'Odeurs qui correspondent à tous les mots' : 'Odeurs les plus proches'}</i></p>
      <div class="chips">${matches.map(i => `<span class="match">${term(i, { cls: 'term-sm' })} <button type="button" class="chip-btn" data-act="lab.addgo" data-arg="${i.id}">Try in lab</button></span>`).join('')}</div>`;
    if (chosen.length >= 2) {
      tool += `<h4>${Q('Compare the words', 'Comparer les mots')}</h4><div class="cmp-grid">${chosen.map(id => {
        const d = DESCRIPTORS.find(x => x.id === id);
        const ings = INGREDIENTS.filter(i => i.desc.includes(id)).slice(0, 6).map(i => `<span class="ing-inline">${ingLabel(i)}</span>`).join(' ');
        return `<div class="cmp-col"><div>${term(d)}</div><p>${esc(d.def)}</p><p class="note"><b>Smell examples</b> <i lang="fr">Exemples</i>: ${ings}</p></div>`;
      }).join('')}</div>`;
    }
    tool += `<button type="button" class="btn btn-sm ghost" data-act="ch1.clear">${L('Clear words', 'Effacer les mots')}</button>`;
  }
  return `<div class="card-pad">
    <p class="lead">Perfumers describe smells with a shared vocabulary. These 14 words are your starting toolkit.<br><span class="p-fr" lang="fr">Les parfumeurs décrivent les odeurs avec un vocabulaire commun. Ces 14 mots sont votre boîte à outils.</span></p>
    <div class="table-wrap"><table class="resp"><thead><tr><th>${L('Scent word', 'Mot olfactif', '氣味詞')}</th><th>${L('Simple definition', 'Définition simple', '簡單定義')}</th><th>${L('Example scent', 'Exemple', '例子')}</th><th>${L('Describe', 'Décrire')}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <section class="tool" aria-live="polite"><h3>${L('Build a description', 'Composer une description', '組合氣味描述')}</h3>${tool}</section></div>`;
}

// ================= Chapter 2 (family cards; the wheel itself is a shared host) =================
export function renderFamilyCards() {
  const { q, filter, selected } = state.wheel;
  const partnerIds = new Set(selected.flatMap(id => partnersOf(id).map(p => p.id)));
  const list = FAMILIES.filter(f => {
    if (q && !(f.en + f.fr + f.zh).toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'selected') return selected.includes(f.id);
    if (filter === 'partners') return partnerIds.has(f.id) || selected.includes(f.id);
    return true;
  });
  if (!list.length) return `<p class="panel-hint">No family matches this search or filter. <i lang="fr">Aucune famille ne correspond.</i> <button type="button" class="btn btn-sm" data-act="wheel.reset">Reset filters</button></p>`;
  return list.map(f => {
    const on = selected.includes(f.id);
    const ex = INGREDIENTS.filter(i => i.family === f.id);
    const rel = relatedFamilies(f.id);
    const open = state.famOpen.includes(f.id);
    return `<article class="fam-card ${on ? 'is-sel' : ''}" style="--fc:${f.color}">
      <header><span class="fam-num">${FAMILY_BY_ID[f.id].n}</span>${term(f, { cls: 'term-lg' })}</header>
      <p>${esc(f.traits)}</p>
      <button type="button" class="btn btn-sm ghost fam-toggle" aria-expanded="${open}" aria-controls="fam-body-${f.id}" data-act="fam.open" data-arg="${f.id}">${open ? 'Hide details ▴' : 'Show materials and pairings ▾'} <i lang="fr">${open ? 'Masquer' : 'Voir les détails'}</i></button>
      <div class="fam-body" id="fam-body-${f.id}" ${open ? '' : 'hidden'}>
      <p><b>Representative scents</b> <i lang="fr">Odeurs représentatives</i><br>${ex.map(i => term(i, { cls: 'term-sm' })).join(' ')}</p>
      <p><b>Common pairing directions</b> <i lang="fr">Associations fréquentes</i></p><div class="chips">${partnerButtons(f.id, ['common'])}</div>
      <p><b>Related families</b> <i lang="fr">Familles liées</i> <small class="muted">(${rel.length} curated)</small></p>
      <div class="chips">${rel.length ? rel.map(r => `<button type="button" class="chip-btn" style="--fc:${FAMILY_BY_ID[r.id].color}" data-act="wheel.with" data-arg="${pairKey(f.id, r.id)}" title="${esc(TYPE_META[r.rel.type].en)}">${esc(FAMILY_BY_ID[r.id].en)}</button>`).join(' ') : '<span class="muted">No curated relationships yet. <i lang="fr">Aucune relation établie.</i></span>'}</div>
      <div class="card-actions">
        <button type="button" class="btn btn-sm ${on ? 'on' : ''}" aria-pressed="${on}" data-act="wheel.toggle" data-arg="${f.id}">${on ? 'Selected on wheel ✓' : 'Select on wheel'}</button>
        <button type="button" class="btn btn-sm ghost" data-act="lab.family" data-arg="${f.id}">Use in lab</button>
      </div></div></article>`;
  }).join('');
}

// ================= Chapter 3 =================
const ROSE_EXAMPLE = [['rose', 'key'], ['violet', 'support'], ['black_pepper', 'modifier'], ['sandalwood', 'bridge'], ['bergamot', 'diffusive'], ['white_musk', 'fixative']];

import { ROLE_ART, CONCEPT_ART, PYRAMID, ROLE_TIER, TIER_COLOR, tierTag } from './data/art.js';
const R = (id, t) => `<button type="button" class="role-link" data-act="ch3.goto" data-arg="${id}">${t}</button>`;
export function renderCh3() {
  const role = state.ch3.role;
  const card = id => {
    const r = ROLES.find(x => x.id === id); if (!state.ch3.open.includes(id)) return '';
    return `<article class="role-card inbox ${ROLE_TIER[id].main === 'any' ? 'is-any' : ''} ${role === id ? 'is-sel' : ''}" id="role-${id}" tabindex="-1" style="--fc:${TIER_COLOR[ROLE_TIER[id].main]}">
      ${ROLE_ART[id]}<header>${term(r)}</header>${tierTag(id)}<p>${esc(r.def)}</p><p class="note">Example: ${esc(r.example)}</p>
      <div class="card-actions"><button type="button" class="btn btn-sm ${role === id ? 'on' : ''}" aria-pressed="${role === id}" data-act="ch3.role" data-arg="${id}">${role === id ? 'Highlighted below ✓' : 'Highlight in example'}</button>
      <button type="button" class="btn btn-sm ghost" data-act="ch3.goto" data-arg="${id}">Close ✕</button></div></article>`;
  };
  const chips = ROSE_EXAMPLE.map(([id, rid]) => {
    const ing = ING_BY_ID[id], r = ROLES.find(x => x.id === rid);
    return `<div class="role-chip ${ROLE_TIER[rid].main === 'any' ? 'is-any' : ''} ${rid === role ? 'on' : ''}" style="--fc:${TIER_COLOR[ROLE_TIER[rid].main]}">${term(ing, { cls: 'term-sm' })}<span class="role-tag">${esc(r.en)} <i lang="fr">${esc(r.fr)}</i></span>${tierTag(rid)}</div>`;
  }).join('');
  const cons = CONCEPTS.map(c => `<article class="concept">${CONCEPT_ART[c.id]}<header>${term(c)}</header><p>${esc(c.def)}</p><p class="note">Example: ${esc(c.example)}</p></article>`).join('');
  return `<div class="card-pad">
    <p class="lead">An <b>accord</b> is the overall scent impression created when several materials blend together. It is more than the sum of its parts.</p>
    <h3>${L('Four ideas, kept apart', 'Quatre notions à distinguer', '四個要分清楚的概念')}</h3><div class="grid g4">${cons}</div>
    <section class="tool tiers-vs"><h3>${L('Six structural roles', 'Six rôles structurels', '六種結構角色')}</h3>
      <div class="vs-grid">
        <div>${PYRAMID}</div>
        <div class="vs-text">
          <p class="note"><b>Top, heart, base answer “when?”</b> <b>Roles answer “what job?”</b> Press a role to open its card.</p>
          <div class="tinfo t-top"><h4>Top · <i lang="fr">Tête</i></h4><p class="when">Smelled first (minutes)</p><p>Often ${R('diffusive','Diffusive')}: light, lifts fast.</p></div>${card('diffusive')}
          <div class="tinfo t-heart"><h4>Heart · <i lang="fr">Cœur</i></h4><p class="when">Comes next (about an hour)</p><p>Often ${R('key','Key')} and ${R('support','Supporting')}: the theme of the accord.</p></div>${card('key')}${card('support')}
          <div class="tinfo t-base"><h4>Base · <i lang="fr">Fond</i></h4><p class="when">Stays last (hours)</p><p>Often ${R('fixative','Fixative')}: slows evaporation so the scent lasts.</p></div>${card('fixative')}
          <div class="tinfo t-bridge"><h4>Bridge · <i lang="fr">Liaison</i></h4><p class="when">Hooks the heart and the base together</p><p>${R('bridge','Bridging')}: connects two parts that do not blend easily.</p></div>${card('bridge')}
          <div class="tinfo t-mod"><h4>Modifier · <i lang="fr">Modificateur</i></h4><p class="when">Any level, over the whole pyramid</p><p>${R('modifier','Modifier')}: a decorative touch, like gold sprinkles.</p></div>${card('modifier')}
          <p class="note">These are tendencies, not rules. <small lang="zh-Hant">前中後調＝何時聞到；角色＝負責什麼，只是常見傾向。</small></p>
        </div>
      </div></section>
    <section class="tool"><h3>${L('Roles in one teaching example', 'Les rôles dans un exemple pédagogique', '教學示例中的角色')}</h3>
      <p class="note">Teaching example only: a rose accord with one possible role for each material. It is not a formula, it has no amounts, and not every accord follows a fixed structure. <i lang="fr">Exemple pédagogique uniquement : ce n’est pas une formule, et tous les accords ne suivent pas la même structure.</i></p>
      <div class="role-row">${chips}</div>
      <button type="button" class="btn" data-act="lab.load" data-arg="rose,violet,black_pepper,sandalwood,bergamot,white_musk" data-label="Chapter 3 teaching example (rose accord roles)">Open these six in the pairing lab</button></section></div>`;
}

// ================= Chapter 4 =================
export function renderCh4() {
  const exChip = id => { const ing = ING_BY_ID[id]; return `<span class="ing-inline fc" style="--fc:${FAMILY_BY_ID[ing.family].color}">${ingLabel(ing)}</span>`; };
  return `<div class="card-pad"><p class="lead">Fifteen accords every learner meets early. Combinations are <b>teaching examples</b>, not formulas.</p>
  <div class="grid g3">${ACCORDS.map((a, i) => `<article class="accord-card" id="accord-${a.id}" tabindex="-1">
    <header><span class="fam-num">${i + 1}</span>${term(a, { cls: 'term-lg' })}</header>
    <p><b>Typical family associations</b></p><div class="chips">${a.families.map(f => famChip(FAMILY_BY_ID[f])).join(' ')}</div>
    <details class="acc-more"><summary>Example combinations <span class="tag-teach">teaching example</span></summary>
        ${a.examples.map((e, k) => `<div class="ex-row"><span class="ex-label">${esc(e.label)}:</span> ${e.ids.map(exChip).join(' ')}
      <button type="button" class="btn btn-sm" data-act="lab.load" data-arg="${e.ids.join(',')}" data-label="${esc(a.en)}: ${esc(e.label)} (teaching example)">Try in the lab →</button></div>`).join('')}</details>
    <details class="acc-more"><summary>Impression and main characteristics</summary>
      <p><b>Olfactive impression</b><br>${esc(a.impression)}</p>
      <p><b>Main characteristics</b></p><ul class="tight">${a.traits.map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>
  </article>`).join('')}</div></div>`;
}
