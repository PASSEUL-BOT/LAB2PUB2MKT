// Chapter 5: pairing laboratory (picker, combination, guide, radar, map, summary).
import { state } from './state.js';
import { esc, L, Q, QZ, term, famChip, badge, dirChips, ingLabel } from './ui.js';
import { FAMILY_BY_ID, FAMILIES } from './data/families.js';
import { INGREDIENTS, ING_BY_ID } from './data/ingredients.js';
import { TYPE_META, EVIDENCE_META, GROUP_META } from './data/relations.js';
import { analyzeCombo, mapGraph, DIMS, DIM_INFO, round1 } from './engine.js';
import { radarSVG, mapSVG } from './charts.js';
import { relationCard } from './views.js';

const $ = id => document.getElementById(id);
const nm = id => ING_BY_ID[id];
const ingTag = ing => `<span class="ing-tag" style="--fc:${FAMILY_BY_ID[ing.family].color}">${ingLabel(ing)}</span>`;

// ---------------- picker ----------------
export function renderPicker() {
  const { combo, fam, q } = state.lab;
  const wheelSel = new Set(state.wheel.selected);
  let list = INGREDIENTS.filter(i => {
    if (fam === 'wheel') { if (!wheelSel.size || !wheelSel.has(i.family)) return false; }
    else if (fam !== 'all' && i.family !== fam) return false;
    if (q) { const s = (i.en + ' ' + i.fr + ' ' + i.zh + ' ' + FAMILY_BY_ID[i.family].en + ' ' + i.desc.join(' ')).toLowerCase(); if (!s.includes(q.toLowerCase())) return false; }
    return true;
  });
  const info = fam === 'wheel' && !wheelSel.size
    ? `<p class="panel-hint">No families are selected on the wheel yet. Select one above, or choose “All families”. <small lang="zh-Hant">輪盤上還沒有選任何家族。</small></p>` : '';
  const html = list.map(i => {
    const on = combo.includes(i.id), f = FAMILY_BY_ID[i.family];
    return `<article class="ing-card ${on ? 'is-on' : ''}" style="--fc:${f.color}">
      <header>${term(i, { cls: 'term-md' })}</header>
      <p class="ing-fam">${famChip(f)}</p>
      <p class="ing-desc">${i.desc.map(d => esc(d)).join(' · ')}</p>
      <p class="note">${esc(i.note)}</p>
      <button type="button" class="btn btn-sm ${on ? 'on' : ''}" aria-pressed="${on}" data-act="lab.toggle" data-arg="${i.id}">${on ? 'Added ✓ (press to remove)' : '+ Add to combination'}</button></article>`;
  }).join('');
  $('lab-picker-list').innerHTML = info + (html || `<p class="panel-hint">No ingredient matches. <small lang="zh-Hant">沒有符合的材料。</small> <button type="button" class="btn btn-sm" data-act="lab.resetfilter">Reset filters</button></p>`);
  $('lab-count').textContent = `${list.length} of ${INGREDIENTS.length} ingredients shown`;
}

// ---------------- current combination ----------------
export function renderCombo() {
  const { combo } = state.lab;
  if (!combo.length) { $('lab-combo').innerHTML = `<p class="panel-hint">Your combination is empty. Add an ingredient above, or open a teaching example from Chapter 4. <small lang="zh-Hant">你的組合是空的。</small></p>`; return; }
  $('lab-combo').innerHTML = `<ol class="combo-list">${combo.map((id, i) => {
    const ing = nm(id);
    return `<li class="combo-item" style="--fc:${FAMILY_BY_ID[ing.family].color}">
      <span class="combo-n">${i + 1}</span>
      <span class="combo-name">${term(ing, { cls: 'term-md' })}${i === 0 ? ' <span class="tag-teach">lead / thème</span>' : ''}</span>
      <span class="combo-btns">
        <button type="button" class="btn btn-sm ghost" data-act="lab.up" data-arg="${id}" ${i === 0 ? 'disabled' : ''} aria-label="Move ${esc(ing.en)} earlier">↑</button>
        <button type="button" class="btn btn-sm ghost" data-act="lab.down" data-arg="${id}" ${i === combo.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(ing.en)} later">↓</button>
        <button type="button" class="btn btn-sm ghost" data-act="lab.remove" data-arg="${id}" aria-label="Remove ${esc(ing.en)}">✕</button>
      </span></li>`;
  }).join('')}</ol>
  <p class="note">Order matters: earlier ingredients lead the theme and carry slightly more weight in the estimated profile. <small lang="zh-Hant">順序很重要：排在前面的材料帶領主題。</small></p>
  <button type="button" class="btn btn-sm ghost" data-act="lab.clear">${QZ('Clear all', '清空')}</button>`;
}

// ---------------- guide ----------------
function activePair(a) {
  if (!a.pairs.length) return null;
  const found = a.pairs.find(p => p.key === state.lab.pair);
  if (found) return found;
  for (const g of ['harmonious', 'explore', 'tension', 'insufficient']) if (a.groups[g].length) return a.groups[g][0];
  return a.pairs[0];
}

function pairRow(p, active) {
  return `<li class="pair-row ${active ? 'on' : ''}">
    <span class="pair-names">${ingTag(p.a)} + ${ingTag(p.b)}</span>
    ${badge(TYPE_META[p.type], '', true)} ${badge(EVIDENCE_META[p.evidence], '', true)}
    <button type="button" class="btn btn-sm ${active ? 'on' : ''}" aria-pressed="${active}" data-act="lab.pair" data-arg="${p.key}">${active ? 'Shown below ✓' : 'Why?'}</button></li>`;
}

export function renderGuide(a) {
  const el = $('lab-guide');
  if (a.n === 0) {
    el.innerHTML = `<p class="panel-hint">Add your first ingredient to start. The guide answers five questions every time the combination changes. <small lang="zh-Hant">先加入第一個材料開始。</small></p>`;
    return;
  }
  const ev = EVIDENCE_META[a.overallEvidence];
  const c = a.evidenceCounts;
  let html = `<div class="ev-banner" style="--c:${ev.color}"><div><b>How certain is this?</b> <small lang="zh-Hant">這個判斷有多可靠？</small></div>
    <div>Overall: ${badge(ev, '', true)} <small>(the weakest evidence among the pairs)</small></div>
    <div class="ev-counts">${a.n < 2 ? 'Only one ingredient: no pair to judge yet.' : `Pairs: ${c.documented} documented · ${c.inference} inference · ${c.hypothesis} hypothesis · ${c.insufficient} insufficient data`}</div>
    <p class="note">This is teaching guidance, not a prediction. Real blends must be smelled. <small lang="zh-Hant">這是教學提示，不是預測。</small></p></div>`;

  // Q1
  html += `<div class="guide-grid"><section class="q q1"><h4>1. ${QZ('What works together?', '哪些搭配得來？')}</h4>`;
  if (a.n < 2) {
    html += `<p>Add a second ingredient to see how the two relate. <small lang="zh-Hant">再加入第二個材料。</small></p>`;
  } else {
    const ap = activePair(a);
    for (const g of ['harmonious', 'explore', 'tension', 'insufficient']) {
      const items = a.groups[g];
      if (!items.length) continue;
      const gm = GROUP_META[g];
      html += `<h5 class="grp grp-${g}">${esc(gm.en)} <small lang="zh-Hant">${gm.zh}</small> <span class="count">${items.length}</span></h5><ul class="pair-list">${items.map(p => pairRow(p, ap && ap.key === p.key)).join('')}</ul>`;
    }
    if (!a.groups.harmonious.length) html += `<p class="note">No common pairing is curated among these picks yet. That is not a verdict: see “Worth exploring” and the next experiments. <small lang="zh-Hant">目前這些材料之間還沒有已整理的常見搭配。</small></p>`;
    const fams = a.dist.families;
    html += `<p class="note"><b>Family distribution</b> <small lang="zh-Hant">家族分布</small>: ${fams.map(f => `${esc(FAMILY_BY_ID[f.id].en)} ×${f.count}`).join(', ')}</p>`;
  }
  html += `</section>`;

  // Q2
  html += `<section class="q q2"><h4>2. ${QZ('Why?', '為什麼？')}</h4>`;
  const ap = activePair(a);
  if (!ap) html += `<p>The reasons appear here as soon as there are two ingredients. <small lang="zh-Hant">有兩個材料之後就會顯示原因。</small></p>`;
  else {
    html += `<p class="pair-title">${ingTag(ap.a)} + ${ingTag(ap.b)} <small>(${esc(FAMILY_BY_ID[ap.a.family].en)} × ${esc(FAMILY_BY_ID[ap.b.family].en)})</small></p>`;
    if (ap.hint) html += `<div class="hint-box"><div>${badge(EVIDENCE_META.hypothesis, '', true)}</div><p>${esc(ap.hint.en)}</p><p><small lang="zh-Hant">${esc(ap.hint.zh || '')}</small></p></div>`;
    html += relationCard(ap.a.family, ap.b.family, '', true);
  }
  html += `</section>`;

  // Q3
  html += `<section class="q q3"><h4>3. ${QZ('What might the result smell like?', '可能聞起來像什麼？')}</h4>`;
  if (a.n < 2) {
    const top = DIMS.filter(d => a.profile[d] >= 3.5 && d !== 'intensity').map(d => DIM_INFO[d]);
    html += `<p>Starting point: ${top.length ? top.map(d => `${esc(d.en)} <small lang="zh-Hant">${esc(d.zh)}</small>`).join(', ') : 'a gentle, balanced profile'}. Add another ingredient to see a direction of change.</p>`;
  } else {
    const last = nm(a.ids[a.n - 1]);
    html += `<p>Compared with the combination <b>without ${esc(last.en)}</b> <small lang="zh-Hant">（不含${esc(last.zh)}）</small>, the estimated direction is:</p>
      <div class="chips">${a.directions.length ? a.directions.map(d => `<span class="dir-chip">${esc(d.en)} <small lang="zh-Hant">${esc(d.zh)}</small></span>`).join(' ') : `<span class="muted">No large change on the 0–5 scale: this ingredient mostly blends in. <small lang="zh-Hant">變化不大。</small></span>`}</div>`;
  }
  html += `<p class="note">Estimated teaching profile: an expected direction, not a guaranteed result. <small lang="zh-Hant">教學用預估：這是預期的方向，不保證一定如此。</small></p></section>`;

  // Q4
  html += `<section class="q q4"><h4>4. ${QZ('What might be difficult?', '可能有什麼困難？')}</h4>`;
  if (a.n < 2) html += `<p>Nothing to compare yet. <small lang="zh-Hant">目前沒有可以比較的。</small></p>`;
  else {
    const real = a.tensions.filter(t => !t.note), notes = a.tensions.filter(t => t.note);
    if (!real.length && !notes.length) html += `<p>No tension is flagged by this site’s rules. That does not mean none exists: smell to check. <small lang="zh-Hant">網站規則沒有標出衝突；仍需要實際聞香確認。</small></p>`;
    html += `<ul class="tension-list">${[...real, ...notes].map(t => `<li class="${t.note ? 'is-note' : ''}"><span class="t-flag">${t.note ? 'Balance note' : 'Possible tension'}</span> ${esc(t.en)}<br><small lang="zh-Hant">${esc(t.zh)}</small></li>`).join('')}</ul>`;
    if (a.contrasts.length) html += `<p class="note"><b>Clear contrast</b> <small lang="zh-Hant">明顯對比</small>: ${a.contrasts.slice(0, 3).map(x => `${esc(nm(x.a).en)} vs ${esc(nm(x.b).en)} (${esc(DIM_INFO[x.dim].en.toLowerCase())})`).join('; ')}. Contrast can be interesting or can clash.</p>`;
    const insuf = a.groups.insufficient;
    if (insuf.length) html += `<p class="note"><b>${insuf.length} pair(s) have insufficient data.</b> They need a real smelling test. <small lang="zh-Hant">這些組合需要實際聞香測試。</small></p>`;
  }
  html += `</section>`;

  // Q5
  html += `<section class="q q5"><h4>5. ${QZ('What should we try next?', '接下來可以試什麼？')}</h4><ul class="sugg-list">${a.suggestions.map(s => {
    let btns = '';
    if (s.add && s.add.length) btns = `<span class="sugg-btns">${s.add.map(id => `<button type="button" class="chip-btn" style="--fc:${FAMILY_BY_ID[nm(id).family].color}" data-act="lab.add" data-arg="${id}">+ ${esc(nm(id).en)}</button>`).join(' ')}</span>`;
    if (s.remove) btns = `<span class="sugg-btns"><button type="button" class="chip-btn" data-act="lab.remove" data-arg="${s.remove}">Remove ${esc(nm(s.remove).en)}</button></span>`;
    return `<li><span class="sugg-kind">${esc(s.kind)}</span> ${esc(s.en)}<br><small lang="zh-Hant">${esc(s.zh)}</small>${btns}</li>`;
  }).join('')}</ul></section>`;

  html += `</div><p class="note legend"><b>Evidence labels</b> <small lang="zh-Hant">依據等級</small>: ${Object.values(EVIDENCE_META).map(e => badge(e, '', true)).join(' ')}</p>`;
  el.innerHTML = html;
}

// ---------------- radar ----------------
export function renderRadar(a) {
  const now = a.profile, prev = a.n >= 2 ? a.prevProfile : null;
  const rows = DIMS.map(d => {
    const info = DIM_INFO[d]; const delta = prev ? round1(now[d] - prev[d]) : null;
    return `<tr><th scope="row">${esc(info.en)} <small lang="zh-Hant">${info.zh}</small></th><td>${a.n ? round1(now[d]) : '–'}</td><td>${delta === null ? '–' : (delta > 0 ? '+' : '') + delta}</td><td class="hint-cell">${esc(info.hint)}</td></tr>`;
  }).join('');
  $('lab-radar').innerHTML = `<div class="radar-grid"><div class="radar-left">${radarSVG(now, prev, a.n)}
    <div class="radar-side"><div class="radar-info" aria-live="polite">Hover or focus a point to read what it means. <small lang="zh-Hant">滑過或聚焦任一點，看它代表什麼。</small></div>
    <p class="legend-line"><span class="sw sw-now"></span> current combination <small lang="zh-Hant">目前組合</small> ${a.n >= 2 ? '<span class="sw sw-prev"></span> before the last addition <small lang="zh-Hant">加入最後一個材料之前</small>' : ''}</p>
    <button type="button" class="btn btn-sm ghost" data-act="lab.clear">${QZ('Reset radar', '重設')}</button></div></div>
    <div class="radar-right"><div class="table-wrap"><table class="mini"><thead><tr><th>Dimension <small lang="zh-Hant">項目</small></th><th>Now (0–5) <small lang="zh-Hant">現在</small></th><th>Change <small lang="zh-Hant">變化</small></th><th>What it means <small lang="zh-Hant">意思</small></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="note"><b>Estimated teaching profile</b> <small lang="zh-Hant">教學用預估輪廓</small>. Values are author-set teaching estimates, combined by a public rule (weighted mean; earlier picks weigh slightly more; intensity +0.25 per extra ingredient). They are not measurements and cannot predict a real blend. <small lang="zh-Hant">數值是作者設定的教學估計，用公開規則合併（加權平均，排前面的材料權重稍高，每多一個材料強度 +0.25）。不是測量值，也不能預測真實的調配。</small></p></div></div>`;
}

// ---------------- map ----------------
export function renderMap(a) {
  const g = mapGraph(a.ids);
  const activeEdge = g.edges.find(e => e.key === state.lab.edge) ? state.lab.edge : null;
  // left: the circle map, with the blue how-to box right under it
  const left = `<div class="map-wrap">${mapSVG(a.ids, g.edges, state.lab.node, activeEdge)}</div>
    <p class="panel-hint map-hint">Select a circle or a line to open its explanation on the right. Select it again to close it. <small lang="zh-Hant">點圓圈或線，說明會在右側展開；再點一次就收合。</small></p>`;
  // right: legend, the list of relationships, then whatever is opened
  let right = `<p class="legend-line">Lines: <span class="ln ln-doc"></span> documented <span class="ln ln-inf"></span> inference <span class="ln ln-hyp"></span> hypothesis · line colour = relationship type · circle colour = family <small lang="zh-Hant">線型＝依據等級（有資料／推論／假設）；線的顏色＝關係類型；圓圈顏色＝家族。</small></p>`;
  if (g.edges.length) right += `<div class="edge-list"><b>Relationships on this map <small lang="zh-Hant">這張圖上的關係</small></b>${g.edges.map(e => `<button type="button" class="chip-btn ${e.key === activeEdge ? 'on' : ''}" aria-pressed="${e.key === activeEdge}" data-act="lab.edge" data-arg="${e.key}">${esc(nm(e.a).en)} + ${esc(nm(e.b).en)}</button>`).join(' ')}</div>`;
  if (a.n >= 2 && !g.edges.length) right += `<p class="note">No curated relationship connects these picks, so no line is drawn. That is a gap in the data, not a verdict. <small lang="zh-Hant">沒有已整理的關係，所以不畫線。</small></p>`;
  const nid = state.lab.node;
  if (nid && a.ids.includes(nid)) {
    const ing = nm(nid), f = FAMILY_BY_ID[ing.family];
    right += `<div class="node-card" style="--fc:${f.color}"><header>${term(ing, { cls: 'term-md' })}</header><p>${famChip(f)}</p><p>${esc(ing.note)}</p>
      <p class="note">Estimated teaching profile: ${DIMS.map(d => `${DIM_INFO[d].en} ${ing.profile[d]}`).join(' · ')}</p></div>`;
  }
  if (activeEdge) { const e = g.edges.find(x => x.key === activeEdge); right += relationCard(nm(e.a).family, nm(e.b).family, '', true); }
  $('lab-map').innerHTML = `<div class="map-grid"><div class="map-left">${left}</div><div class="map-right">${a.n ? right : '<p class="panel-hint">Add two or more ingredients to see how they relate. <small lang="zh-Hant">加入兩個以上的材料，就能看到它們的關係。</small></p>'}</div></div>`;
}

// ---------------- summary ----------------
function bar(label, fr, v) {
  const w = Math.round((v / 5) * 100);
  return `<div class="sum-bar"><div class="sb-l">${esc(label)} <small lang="zh-Hant">${esc(fr)}</small><span>${v} / 5</span></div><div class="sb-track" role="img" aria-label="${esc(label)} ${v} out of 5"><div class="sb-fill" style="width:${w}%"></div></div></div>`;
}
export function renderSummary(a) {
  if (!a.n) { $('lab-summary').innerHTML = `<p class="panel-hint">The summary appears when you add an ingredient. <small lang="zh-Hant">加入第一個材料後就會出現摘要。</small></p>`; return; }
  const s = a.summary, tn = a.tensions.filter(t => !t.note);
  $('lab-summary').innerHTML = `<div class="sum-cards">
    <section class="sum-card sc-bars"><h4>${QZ('How it feels', '整體感受')}</h4>
      <p class="sum-help">Each bar is a 0–5 teaching estimate. <small lang="zh-Hant">每條都是 0–5 的教學估計。</small></p>
      ${bar('Overall freshness', '整體清新度', s.freshness)}${bar('Overall sweetness', '整體甜度', s.sweetness)}${bar('Overall intensity', '整體強度', s.intensity)}</section>
    <section class="sum-card sc-fam"><h4>${QZ('Dominant fragrance families', '主要香氣家族')}</h4>
      <p class="sum-help">The families that appear most often in your picks. <small lang="zh-Hant">你選的材料裡最常出現的家族。</small></p>
      <div class="chips">${s.dominant.map(id => famChip(FAMILY_BY_ID[id])).join(' ')}</div>
      <h4>${QZ('Potential tension points', '可能的衝突點')}</h4>
      ${tn.length ? `<ul class="tight">${tn.map(t => `<li>${esc(t.en)}<br><small lang="zh-Hant">${esc(t.zh || '')}</small></li>`).join('')}</ul>` : `<p class="muted">None flagged by the rules. <small lang="zh-Hant">規則沒有標出衝突。</small></p>`}</section>
    <section class="sum-card sc-next"><h4>${QZ('Suggested next experiment', '建議的下一個實驗')}</h4>
      <p>${s.nextExperiment ? `${esc(s.nextExperiment.en)}<br><small lang="zh-Hant">${esc(s.nextExperiment.zh || '')}</small>` : '–'}</p>
      <p class="note">Estimated teaching profile: values are teaching estimates, not measurements. <small lang="zh-Hant">教學用預估：數值是教學估計，不是測量。</small></p></section></div>`;
}

// ---------------- origin banner + orchestrator ----------------
export function renderLab() {
  const o = state.lab.origin;
  $('lab-origin').innerHTML = o ? `<div class="origin-banner"><div><b>Loaded from:</b> ${esc(o.label)}<br><span class="note">${esc(o.note)}</span></div><button type="button" class="btn btn-sm ghost" data-act="lab.dismiss">Dismiss</button></div>` : '';
  const sel = $('lab-fam');
  if (sel && sel.value !== state.lab.fam) sel.value = state.lab.fam;
  const qi = $('lab-search');
  if (qi && document.activeElement !== qi && qi.value !== state.lab.q) qi.value = state.lab.q;
  renderPicker();
  renderCombo();
  const a = analyzeCombo(state.lab.combo);
  renderGuide(a); renderRadar(a); renderMap(a); renderSummary(a);
  return a;
}
