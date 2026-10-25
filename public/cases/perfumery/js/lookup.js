// Explore Real Perfumes: search, product page, and the bridge into the learning tools.
// Everything shown comes from js/data/products.js (see the header of that file) through the
// replaceable data-access layer in source.js. Nothing is fetched from the network.
import { state } from './state.js';
import { esc, L, Q, term, famChip } from './ui.js';
import { ingIcon, famIcon } from './data/icons.js';
import { FAMILY_BY_ID } from './data/families.js';
import { ING_BY_ID } from './data/ingredients.js';
import { mapProduct } from './engine.js';
import { wheelSVG } from './charts.js';
import { searchAll, SOURCE_STATUS, CONCENTRATIONS } from './source.js';

// The six data-status labels required by the brief.
export const STATUS_META = {
  verified:   { en: 'Verified Source',              fr: 'Source vérifiée',            zh: '已核查來源', color: '#2E9C7A' },
  official:   { en: 'Official Product Information', fr: 'Informations officielles du produit', zh: '品牌官方資料', color: '#2F7FB0' },
  retailer:   { en: 'Retailer Information',         fr: 'Informations du détaillant', zh: '零售商資料', color: '#6B58B8' },
  community:  { en: 'Community-reported',           fr: 'Signalé par la communauté',  zh: '社群提供',   color: '#B7791F' },
  unverified: { en: 'Unverified',                   fr: 'Non vérifié',                zh: '尚未核實',   color: '#D4533F' },
  na:         { en: 'Not Available',                fr: 'Non disponible',             zh: '無可用資料', color: '#6B7280' }
};
const CONC = { EDC: 'Eau de Cologne', EDT: 'Eau de Toilette', EDP: 'Eau de Parfum', Parfum: 'Parfum' };
const KIND = {
  exact:   { en: 'Exact match', fr: 'Correspondance exacte' },
  partial: { en: 'Partial match', fr: 'Correspondance partielle' },
  fuzzy:   { en: 'Similar spelling', fr: 'Orthographe proche' },
  weak:    { en: 'Weak match', fr: 'Correspondance faible' }
};
const ACCORD_KIND = {
  label:        { en: 'Stated by the source', fr: 'Indiqué par la source', cls: 'src' },
  'named-note': { en: 'Educational inference: the page names the lead note', fr: 'Déduction pédagogique : la page nomme la note principale', cls: 'inf' },
  combination:  { en: 'Educational inference: several teaching materials match', fr: 'Déduction pédagogique : plusieurs matières correspondent', cls: 'inf' }
};

const sBadge = key => { const m = STATUS_META[key] || STATUS_META.na; return `<span class="badge" style="--c:${m.color}"><b>${esc(m.en)}</b> <i lang="fr">${esc(m.fr)}</i> <small lang="zh-Hant">${m.zh}</small></span>`; };
const na = () => `<span class="muted">Not available <i lang="fr">Non disponible</i></span>`;
const concLabel = c => c ? `${esc(CONC[c] || c)} <small>(${esc(c)})</small>` : na();

// ---------------------------------------------------------------- search form + results
export function renderLookup() {
  const q = state.lookup.query, L0 = state.lookup;
  const form = `<form id="lookup-form" class="lookup-form" novalidate>
    <label>${L('Brand', 'Marque', '品牌')}<input name="brand" type="text" autocomplete="off" value="${esc(q.brand)}" placeholder="e.g. Guerlain"></label>
    <label>${L('Perfume Name', 'Nom du parfum', '香水名稱')}<input name="name" type="text" autocomplete="off" value="${esc(q.name)}" placeholder="e.g. Shalimar"></label>
    <label>${L('Concentration', 'Concentration', '濃度')}<select name="concentration"><option value="">Any / Toutes</option>${CONCENTRATIONS.map(c => `<option value="${c}" ${q.concentration === c ? 'selected' : ''}>${esc(CONC[c])} (${c})</option>`).join('')}</select></label>
    <label>${L('Release Year', 'Année de sortie', '年份')}<input name="year" type="text" inputmode="numeric" maxlength="4" autocomplete="off" value="${esc(q.year)}" placeholder="e.g. 1925"></label>
    <div class="lookup-actions">
      <button type="submit" class="btn">${L('Search', 'Rechercher', '搜尋')}</button>
      <button type="button" class="btn ghost" data-act="lookup.reset">${L('Reset', 'Réinitialiser', '重設')}</button>
    </div>
    <label class="check"><input type="checkbox" name="includeDemo" data-act-change="lookup.demo" ${L0.includeDemo ? 'checked' : ''}> <span>Also search unverified demo seeds <i lang="fr">Inclure les données de démonstration non vérifiées</i> <small class="muted">(written from memory, not checked against any source)</small></span></label>
  </form>`;

  const sources = `<details class="sources"><summary>${L('Where does this data come from?', 'D’où viennent ces données ?', '資料來源與限制')}</summary>
    <ul class="src-list">${SOURCE_STATUS.map(s => `<li><b>${esc(s.name)}</b> <span class="src-state">${esc(s.state)}</span><br>${esc(s.detail)}</li>`).join('')}</ul>
    <p class="note"><b>Data status labels</b> <i lang="fr">Niveaux de fiabilité</i>: ${Object.values(STATUS_META).map(m => `<span class="badge" style="--c:${m.color}"><b>${esc(m.en)}</b> <i lang="fr">${esc(m.fr)}</i></span>`).join(' ')}</p>
    <p class="note">Brand names and trademarks belong to their owners and are used only to identify products. No logos, images or marketing text are reproduced. <i lang="fr">Les marques appartiennent à leurs propriétaires ; elles ne servent qu’à identifier les produits.</i></p></details>`;

  const banner = `<div class="data-banner"><b>A small snapshot, not a catalogue.</b> <i lang="fr">Un petit échantillon, pas un catalogue.</i>
    This tool holds ${L0.result ? L0.result.totalRecords : 4} product pages that were read by hand from official brand websites on 25 Oct 2026. It cannot search all perfumes and is not connected to any live database.
    <span class="p-fr" lang="fr">Cet outil contient quelques pages produits lues sur des sites officiels ; il ne recherche pas tous les parfums et n’est relié à aucune base de données en ligne.</span></div>`;

  document.getElementById('lookup-root').innerHTML = banner + form + sources + `<div id="lookup-results" aria-live="polite">${resultsHTML()}</div><div id="lookup-detail">${L0.open ? detailHTML(L0.open) : ''}</div>`;
}

function resultsHTML() {
  const r = state.lookup.result;
  if (r && r.error) return `<div class="warn-box" role="alert">${esc(r.error.en)} <i lang="fr">${esc(r.error.fr)}</i></div>`;
  if (!state.lookup.searched || !r) {
    return `<p class="panel-hint">Type a brand, a name, or both, then press Search. Leave everything empty and press Search to list the whole snapshot. <i lang="fr">Saisissez une marque, un nom, ou les deux, puis lancez la recherche.</i></p>`;
  }
  let html = '';
  if (r.hits.length) {
    html += `<h3 class="res-title">${r.hits.length} result${r.hits.length > 1 ? 's' : ''} <i lang="fr">résultat${r.hits.length > 1 ? 's' : ''}</i></h3><ul class="res-list">${r.hits.map(h => {
      const p = h.product, k = KIND[h.kind] || KIND.partial, on = state.lookup.open && state.lookup.open.id === p.id;
      return `<li class="res-item ${on ? 'on' : ''}">
        <div class="res-main"><b class="res-brand">${esc(p.brand)}</b> <span class="res-name">${esc(p.name)}</span>
          <span class="res-meta">${concLabel(p.concentration)} · ${p.year ? esc(p.year) : 'Year: not available'} · ${p.isDemo ? 'Demo seed' : 'Official page snapshot'}</span></div>
        <div class="res-badges">${sBadge(p.source.status)} ${h.kind !== 'exact' ? `<span class="badge soft"><b>${esc(k.en)}</b> <i lang="fr">${esc(k.fr)}</i></span>` : ''}</div>
        <button type="button" class="btn btn-sm ${on ? 'on' : ''}" data-act="lookup.open" data-arg="${p.id}" aria-pressed="${on}">${on ? 'Shown below ✓' : 'Open product page'}</button></li>`;
    }).join('')}</ul>`;
  } else {
    html += `<div class="empty-box"><p><b>No matching product in this snapshot.</b> <i lang="fr">Aucun produit correspondant dans cet échantillon.</i></p>
      <p>That does not mean the perfume does not exist, only that this site has no checked data for it. Nothing has been invented. <span class="p-fr" lang="fr">Cela ne veut pas dire que le parfum n’existe pas : ce site n’a simplement aucune donnée vérifiée à son sujet.</span></p>
      <ul class="tight"><li>Check the spelling, or try the full brand name (for example “Guerlain”, not “G.”).</li><li>Try only the brand, or only part of the name.</li><li>Remove the concentration or year filter.</li></ul></div>`;
    if (r.suggestions.length) html += `<p><b>Did you mean…?</b> <i lang="fr">Vouliez-vous dire… ?</i></p><ul class="res-list">${r.suggestions.map(p => `<li class="res-item"><div class="res-main"><b class="res-brand">${esc(p.brand)}</b> <span class="res-name">${esc(p.name)}</span> <span class="res-meta">${concLabel(p.concentration)}</span></div><div class="res-badges">${sBadge(p.source.status)}</div><button type="button" class="btn btn-sm" data-act="lookup.open" data-arg="${p.id}">Open product page</button></li>`).join('')}</ul>`;
  }
  if (r.hiddenByFilter) html += `<p class="note">${r.hiddenByFilter} record(s) were left out because the filter you used (concentration or year) is not available for them. They were not guessed. <i lang="fr">Ces fiches n’ont pas cette information : elles n’ont pas été devinées.</i></p>`;
  if (r.demoHidden) html += `<p class="note">${r.demoHidden} unverified demo seed(s) are hidden. Tick “Also search unverified demo seeds” to include them. <i lang="fr">Des données de démonstration non vérifiées sont masquées.</i></p>`;
  return html;
}

// ---------------------------------------------------------------- product page
function noteChip(m) {
  if (!m.mapped) return `<li class="note-chip unmapped"><b>${esc(m.name)}</b><span class="map-tag">not mapped <i lang="fr">non classé</i></span></li>`;
  const target = m.ingredientId ? ING_BY_ID[m.ingredientId].en : FAMILY_BY_ID[m.family].en + ' family';
  const f = FAMILY_BY_ID[m.family];
  return `<li class="note-chip" style="--fc:${f.color}">${m.ingredientId ? ingIcon(m.ingredientId) : famIcon(m.family)}<b>${esc(m.name)}</b><span class="map-tag">→ ${esc(target)} <small>(${m.basis === 'direct' ? 'direct' : 'approximate'})</small></span></li>`;
}

function tierBlock(title, fr, zh, list) {
  return `<div class="tier"><h5>${L(title, fr, zh)}</h5>${list.length ? `<ul class="note-list">${list.map(noteChip).join('')}</ul>` : '<p class="muted tier-empty">Not given by the source <i lang="fr">Non indiqué</i></p>'}</div>`;
}

function detailHTML(p) {
  const m = mapProduct(p);
  const lab = (k, fr, zh) => `<dt>${Q(k, fr, zh)}</dt>`;
  const fam = p.publishedFamily ? esc(p.publishedFamily) : `${na()} <span class="note">(the source states no family)</span>`;
  const hasTier = m.available && ['top', 'heart', 'base'].some(t => m.mapped[t].length);

  // clear teaching lead only when one family has strictly more notes than the next
  let lead = '';
  if (m.available && m.families.length) {
    const f = m.families, c = i => (f[i] ? f[i].count : 0);
    const prim = c(0) > c(1) ? f[0] : null;
    const sec = prim && c(1) > c(2) ? f[1] : null;
    lead = prim
      ? `Primary: ${famChip(FAMILY_BY_ID[prim.id])}${sec ? ` · Secondary: ${famChip(FAMILY_BY_ID[sec.id])}` : ''}`
      : `<span class="muted">No single family leads: several families have the same number of published notes. <i lang="fr">Aucune famille ne domine : plusieurs familles ont le même nombre de notes publiées.</i></span>`;
  }

  let html = `<article class="product" aria-labelledby="prod-title">
    <header class="prod-head"><h3 id="prod-title"><span class="res-brand">${esc(p.brand)}</span> ${esc(p.name)}</h3>
      <div>${sBadge(p.source.status)} ${p.isDemo ? '<span class="badge" style="--c:#D4533F"><b>Demo seed</b> <i lang="fr">Donnée de démonstration</i></span>' : ''}</div>
      <button type="button" class="btn btn-sm ghost" data-act="lookup.close">Close <i lang="fr">Fermer</i></button></header>
    ${p.isDemo ? `<div class="warn-box"><b>Unverified demo seed.</b> This record was written from memory and was not checked against any source. Do not rely on it. <i lang="fr">Donnée écrite de mémoire, non vérifiée : ne vous y fiez pas.</i></div>` : ''}

    <section><h4>${L('Olfactive Profile', 'Profil olfactif', '香氣輪廓')} <span class="tag-src">Published product notes · Notes publiées du produit</span></h4>
      <dl class="prod-dl">
        ${lab('Family wording used by the source', 'Famille indiquée par la source', '來源標示的家族')}<dd>${fam}</dd>
        ${p.listedAccords && p.listedAccords.length ? `${lab('Main Accords', 'Accords principaux', '主要和弦')}<dd>${p.listedAccords.map(esc).join(', ')}</dd>` : ''}
      </dl>`;
  if (!m.available) {
    html += `<p class="empty-box">Notes: ${na()}. No published notes are stored for this product, so there is nothing to map. This site will not guess them. <i lang="fr">Aucune note publiée n’est enregistrée : rien à classer, et rien n’est deviné.</i></p>`;
  } else {
    html += `<div class="tiers">${tierBlock('Top Notes', 'Notes de tête', '前調', m.mapped.top)}${tierBlock('Heart Notes', 'Notes de cœur', '中調', m.mapped.heart)}${tierBlock('Base Notes', 'Notes de fond', '後調', m.mapped.base)}</div>${''}${m.mapped.unlabelled.length ? tierBlock('Notes not assigned to a tier by the source', 'Notes sans niveau indiqué par la source', '來源未分前中後調', m.mapped.unlabelled) : ''}
      ${hasTier && m.mapped.unlabelled.length === 0 ? '' : `<p class="note">${hasTier ? 'Only the notes the source placed in a tier are shown in one.' : 'The source does not split these notes into top, heart and base, so this site does not either.'} <i lang="fr">${hasTier ? 'Seules les notes placées dans un niveau par la source sont présentées ainsi.' : 'La source ne répartit pas ces notes en tête, cœur et fond ; ce site non plus.'}</i></p>`}`;
  }
  html += `</section>`;
  html += `    <details class="prod-meta"><summary>${L('Product details and source', 'Détails et source', '商品資訊與來源')}</summary><dl class="prod-dl">
      ${lab('Brand', 'Marque', '品牌')}<dd>${esc(p.brand)}</dd>
      ${lab('Perfume Name', 'Nom du parfum', '香水名稱')}<dd>${esc(p.name)}</dd>
      ${lab('Concentration', 'Concentration', '濃度')}<dd>${concLabel(p.concentration)}</dd>
      ${lab('Release Year', 'Année de sortie', '年份')}<dd>${p.year ? esc(p.year) : na()}</dd>
      ${lab('Perfumer', 'Parfumeur', '調香師')}<dd>${p.perfumer ? esc(p.perfumer) : na()}</dd>
      ${lab('Source', 'Source des données', '資料來源')}<dd>${esc(p.source.label)}
        ${p.source.url ? `<br><a href="${esc(p.source.url)}" target="_blank" rel="noopener noreferrer">${esc(p.source.url)}</a>` : '<br><span class="muted">No source URL</span>'}
        <br><span class="note">Last checked: ${p.source.lastChecked ? esc(p.source.lastChecked) : 'never'} · Data completeness: ${esc(p.source.completeness)}</span></dd>
    </dl></details>

`;

  if (m.available) {
    html += `<section><h4>${L('Educational Interpretation', 'Interprétation pédagogique', '教學詮釋')} <span class="tag-inf">Educational family mapping · Classification pédagogique</span></h4>
      <ul class="interp">
        <li><b>Teaching families found in the notes</b> <i lang="fr">Familles pédagogiques présentes</i>: ${m.families.length ? m.families.map(f => famChip(FAMILY_BY_ID[f.id], ` ×${f.count}`)).join(' ') : '<span class="muted">none could be mapped</span>'}</li>
        <li><b>Lead family</b> <i lang="fr">Famille dominante</i>: ${lead || '–'}</li>
        <li><b>Mapped / total notes</b>: ${m.mappedCount} of ${m.total}. ${m.total - m.mappedCount ? `${m.total - m.mappedCount} note(s) have no equivalent in this curriculum (for example aldehydes or a generic “flowers”).` : ''}</li>
        <li><b>Source wording vs this site</b>: ${p.publishedFamily ? `the page says “${esc(p.publishedFamily)}”; the families above are this site’s own mapping and may differ.` : 'the page states no family, so every family above is this site’s inference.'} <i lang="fr">Ce qui vient de la source et ce qui vient de ce site sont distingués.</i></li>
      </ul>
      <p class="note warn">A list of published notes is an impression of the scent, not an ingredient list or a formula, and it cannot be used to recreate the perfume. <i lang="fr">Une liste de notes publiées est une impression olfactive, pas une formule : elle ne permet pas de recréer le parfum.</i></p>
      <div class="panel-actions"><button type="button" class="btn" data-act="lookup.explore" aria-expanded="${state.lookup.explore}">${L('Explore This Scent Profile', 'Explorer ce profil olfactif', '探索這款香水的香氣輪廓')}</button></div>
      ${state.lookup.explore ? exploreHTML(p, m) : ''}</section>`;
  }
  return html + `</article>`;
}

function exploreHTML(p, m) {
  const counts = Object.fromEntries(m.families.map(f => [f.id, f.count]));
  const mappedIngs = m.ingredientIds.map(id => ING_BY_ID[id]);
  return `<div class="explore" id="explore-panel" tabindex="-1">
    <h4>${L('Explore This Scent Profile', 'Explorer ce profil olfactif', '探索這款香水的香氣輪廓')}</h4>
    <div class="explore-grid">
      <div class="ex-block"><h5><span class="tag-src">1 · Published product notes</span> <i lang="fr">Notes publiées du produit</i></h5>
        <p>${[...m.mapped.top, ...m.mapped.heart, ...m.mapped.base, ...m.mapped.unlabelled].map(x => `<span class="plain-chip">${esc(x.name)}</span>`).join(' ')}</p>
        <p class="note">Exactly the names the source uses, not an ingredient list. <i lang="fr">Exactement les noms de la source.</i></p></div>

      <div class="ex-block"><h5><span class="tag-inf">2 · Educational family mapping</span> <i lang="fr">Classification pédagogique</i></h5>
        <div class="wheel-mini">${wheelSVG({ selected: [], counts, readonly: true })}</div>
        <p class="note">Coloured segments hold the number of published notes mapped to that family. The position on the wheel says nothing about compatibility. <i lang="fr">Les segments colorés indiquent le nombre de notes classées dans la famille.</i></p>
        <ul class="map-list">${m.families.map(f => {
          const fm = FAMILY_BY_ID[f.id];
          const why = [...m.mapped.top, ...m.mapped.heart, ...m.mapped.base, ...m.mapped.unlabelled].filter(x => x.mapped && x.family === f.id).map(x => `${x.name}${x.basis === 'approx' ? ' (approx.)' : ''}`).join(', ');
          return `<li>${term(fm, { cls: 'term-sm' })} <span class="note">because of: ${esc(why)}</span>
            <button type="button" class="btn btn-sm" data-act="lab.family" data-arg="${f.id}">Take this family to the lab <i lang="fr">Au laboratoire</i></button></li>`;
        }).join('')}</ul></div>

      <div class="ex-block"><h5><span class="tag-hyp">3 · Hypothetical accord exploration</span> <i lang="fr">Exploration hypothétique d’un accord</i></h5>
        ${m.accords.length ? `<ul class="map-list">${m.accords.map(a => `<li><a href="#accord-${a.accord.id}"><b>${esc(a.accord.en)}</b> <i lang="fr">${esc(a.accord.fr)}</i></a>
            <span class="kind ${ACCORD_KIND[a.kind].cls}">${esc(ACCORD_KIND[a.kind].en)}</span><br><span class="note">${esc(a.basis)}</span></li>`).join('')}</ul>`
          : `<p class="muted">No link to the 15 classic accords could be justified from these notes. <i lang="fr">Aucun lien justifiable avec les 15 accords classiques.</i></p>`}
        ${mappedIngs.length ? `<p><b>Take the matching teaching materials to the lab, as inspiration</b> <i lang="fr">Prendre les matières correspondantes comme inspiration</i></p>
          <div class="chips">${mappedIngs.map(i => `<button type="button" class="chip-btn" style="--fc:${FAMILY_BY_ID[i.family].color}" data-act="lab.addgo" data-arg="${i.id}">+ ${esc(i.en)}</button>`).join(' ')}</div>
          <button type="button" class="btn" data-act="lab.load" data-arg="${mappedIngs.map(i => i.id).join(',')}" data-label="${esc(p.brand + ' ' + p.name + ' (' + (p.concentration || 'version n/a') + '): published notes, as inspiration only')}">Open all ${mappedIngs.length} in the pairing lab</button>` : ''}
        <p class="note warn">Hypothetical: these teaching materials are not the perfume’s ingredients and the lab result is not its formula. <i lang="fr">Hypothétique : ce ne sont pas les ingrédients du parfum.</i></p></div>
    </div></div>`;
}
