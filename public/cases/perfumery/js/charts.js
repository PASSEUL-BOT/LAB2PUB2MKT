// SVG renderers: Fragrance Wheel, Olfactive Profile Radar, Accord Map.
import { FAMILIES, FAMILY_BY_ID } from './data/families.js';
import { ING_BY_ID } from './data/ingredients.js';
import { TYPE_META, relatedFamilies } from './data/relations.js';
import { relationBetweenFamilies, DIMS, DIM_INFO } from './engine.js';
import { esc } from './ui.js';

const rad = d => (d * Math.PI) / 180;
const pol = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
const f1 = n => Math.round(n * 10) / 10;

// ---------------- Fragrance Wheel ----------------
export function wheelSVG({ selected = [], q = '', activePair = null, counts = null, readonly = false, mini = false } = {}) {
  const cx = 280, cy = 280, R1 = 150, R0 = 88, RL = 194;
  const N = FAMILIES.length, step = 360 / N, gap = 1.4;
  const sel = new Set(selected);
  const related = new Set(selected.length === 1 ? relatedFamilies(selected[0]).map(r => r.id) : []);
  const qn = q.trim().toLowerCase();
  const match = f => !qn || (f.en + ' ' + f.fr + ' ' + f.zh).toLowerCase().includes(qn);

  const mid = i => -90 + step * i + step / 2;
  let segs = '';
  FAMILIES.forEach((f, i) => {
    const a0 = mid(i) - step / 2 + gap / 2, a1 = mid(i) + step / 2 - gap / 2;
    const [x0, y0] = pol(cx, cy, R1, a0), [x1, y1] = pol(cx, cy, R1, a1);
    const [x2, y2] = pol(cx, cy, R0, a1), [x3, y3] = pol(cx, cy, R0, a0);
    const d = `M${f1(x0)} ${f1(y0)} A${R1} ${R1} 0 0 1 ${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} A${R0} ${R0} 0 0 0 ${f1(x3)} ${f1(y3)}Z`;
    const isSel = sel.has(f.id), isRel = related.has(f.id), dim = !match(f);
    const cnt = counts ? (counts[f.id] || 0) : null;
    const [nx, ny] = pol(cx, cy, (R0 + R1) / 2, mid(i));
    const [lx, ly] = pol(cx, cy, Math.abs(Math.sin(rad(mid(i)))) > 0.9 ? RL + 24 : RL, mid(i));
    const c = Math.cos(rad(mid(i))), s = Math.sin(rad(mid(i)));
    const anchor = c > 0.05 ? 'start' : c < -0.05 ? 'end' : 'middle';
    const ly1 = s < -0.8 ? ly - 20 : s > 0.8 ? ly + 6 : ly - 2;
    const fill = counts ? (cnt ? f.color : '#F4F6F8') : f.color;
    const cls = ['seg', isSel ? 'is-sel' : '', isRel ? 'is-rel' : '', dim ? 'is-dim' : '', counts && !cnt ? 'is-off' : ''].join(' ');
    const attrs = readonly
      ? `role="img" aria-label="${esc(f.en)}, ${esc(f.fr)}${cnt ? `: ${cnt} mapped note(s)` : ''}"`
      : `role="button" tabindex="0" aria-pressed="${isSel}" data-act="wheel.toggle" data-arg="${f.id}" data-en="${esc(f.en)}" data-fr="${esc(f.fr)}" aria-label="${esc(f.en)} (${esc(f.fr)}). ${isSel ? 'Selected. Press to unselect.' : 'Press to select.'}"`;
    segs += `<g class="${cls}" ${attrs}>
      <path d="${d}" fill="${fill}"/>
      <text class="seg-n" x="${f1(nx)}" y="${f1(ny + 5)}" text-anchor="middle">${cnt ? cnt : i + 1}</text>
      ${mini ? '' : `<text class="seg-en" x="${f1(lx)}" y="${f1(ly1)}" text-anchor="${anchor}">${esc(f.en)}</text>
      <text class="seg-fr" x="${f1(lx)}" y="${f1(ly1 + 18)}" text-anchor="${anchor}">${esc(f.fr)}</text>`}
      ${isSel ? `<path class="seg-ring" d="${d}" fill="none"/>` : ''}
    </g>`;
  });

  // Chords between selected families (from the relation data, not from position)
  let chords = '';
  for (let i = 0; i < selected.length; i++) for (let j = i + 1; j < selected.length; j++) {
    const a = selected[i], b = selected[j];
    const ia = FAMILIES.findIndex(f => f.id === a), ib = FAMILIES.findIndex(f => f.id === b);
    const [ax, ay] = pol(cx, cy, R0 - 6, mid(ia)), [bx, by] = pol(cx, cy, R0 - 6, mid(ib));
    const rel = relationBetweenFamilies(a, b);
    const meta = TYPE_META[rel.type];
    const key = a + '|' + b;
    const active = activePair && (activePair === key || activePair === b + '|' + a);
    const dash = rel.type === 'insufficient' ? '5 5' : rel.evidence === 'hypothesis' ? '2 5' : rel.evidence === 'inference' ? '9 5' : '';
    const dpath = `M${f1(ax)} ${f1(ay)} Q${cx} ${cy} ${f1(bx)} ${f1(by)}`;
    chords += `<g class="chord ${active ? 'is-active' : ''}">
      <path d="${dpath}" fill="none" stroke="${meta.color}" stroke-width="${active ? 5 : 3}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>
      ${readonly ? '' : `<path class="chord-hit" d="${dpath}" fill="none" stroke="transparent" stroke-width="16" role="button" tabindex="0" data-act="wheel.pair" data-arg="${key}" aria-label="Open relationship: ${esc(FAMILY_BY_ID[a].en)} and ${esc(FAMILY_BY_ID[b].en)} (${esc(meta.en)})"/>`}
    </g>`;
  }

  const center = `<circle cx="${cx}" cy="${cy}" r="${R0 - 14}" fill="#fff" stroke="#d7dee5"/>
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" class="wc-en">Fragrance Wheel</text>
    <text x="${cx}" y="${cy + 8}" text-anchor="middle" class="wc-fr">Roue des familles</text>
    <text x="${cx}" y="${cy + 22}" text-anchor="middle" class="wc-zh">香氣家族輪盤</text>`;

  // measuring scale: a graduated ring (a tick every 5 degrees, a long tick on every family boundary) and a fine inner circle
  let scale = `<circle cx="${cx}" cy="${cy}" r="${R1 + 5}" fill="none" class="w-scale"/><circle cx="${cx}" cy="${cy}" r="${R0 - 5}" fill="none" class="w-scale"/>`;
  for (let dg = 0; dg < 360; dg += 5) { const major = ((dg + 90) % step) < 0.01 || ((dg + 90) % step) > step - 0.01; const [x1, y1] = pol(cx, cy, R1 + 5, dg), [x2, y2] = pol(cx, cy, R1 + (major ? 14 : 9.5), dg); scale += `<path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" class="w-tick${major ? ' major' : ''}"/>`; }

  return `<svg class="wheel-svg" viewBox="-12 34 584 508" role="group" aria-label="Fragrance Wheel: 18 olfactive families. Position on the wheel is not evidence of compatibility.">
    ${scale}${chords}${center}${segs}</svg>`;
}

// ---------------- Radar ----------------
export function radarSVG(profile, prev, n) {
  const cx = 180, cy = 175, R = 110, K = DIMS.length;
  const ang = i => -90 + (360 / K) * i;
  const pt = (i, v) => pol(cx, cy, (R * v) / 5, ang(i));
  const ring = v => DIMS.map((_, i) => pt(i, v).map(f1).join(',')).join(' ');
  let grid = '';
  for (let v = 1; v <= 5; v++) grid += `<polygon points="${ring(v)}" class="r-ring ${v === 5 ? 'r-outer' : ''}"/>`;
  let axes = '', labels = '';
  grid += `<circle cx="${cx}" cy="${cy}" r="${R + 9}" class="r-dial"/>`; for (let dg = 0; dg < 360; dg += 10) { const [x1, y1] = pol(cx, cy, R + 9, dg), [x2, y2] = pol(cx, cy, R + (dg % 30 === 0 ? 15 : 12.5), dg); grid += `<path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" class="r-tick"/>`; }
  grid += `<path d="M${cx - 5} ${cy}h10M${cx} ${cy - 5}v10" class="r-tick"/>`;
  for (let v = 1; v <= 5; v++) { const [nx, ny] = pt(0, v); grid += `<text x="${f1(nx + 4)}" y="${f1(ny + 3)}" class="r-num">${v}</text>`; }
  DIMS.forEach((d, i) => {
    for (let v = 1; v <= 5; v++) { const [tx, ty] = pt(i, v); const a = rad(ang(i) + 90); axes += `<path d="M${f1(tx - Math.cos(a) * 2.6)} ${f1(ty - Math.sin(a) * 2.6)}L${f1(tx + Math.cos(a) * 2.6)} ${f1(ty + Math.sin(a) * 2.6)}" class="r-tick"/>`; }
    const [x, y] = pt(i, 5); axes += `<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" class="r-axis"/>`;
    const [lx, ly] = pol(cx, cy, R + 22, ang(i));
    const c = Math.cos(rad(ang(i)));
    const anchor = c > 0.2 ? 'start' : c < -0.2 ? 'end' : 'middle';
    const info = DIM_INFO[d];
    labels += `<text x="${f1(lx)}" y="${f1(ly)}" text-anchor="${anchor}" class="r-lab">${info.en}</text><text x="${f1(lx)}" y="${f1(ly + 11)}" text-anchor="${anchor}" class="r-lab-fr">${info.zh}</text>`;
  });
  let layers = '';
  if (n >= 2 && prev) layers += `<polygon points="${DIMS.map((d, i) => pt(i, prev[d]).map(f1).join(',')).join(' ')}" class="r-prev"/>`;
  if (n >= 1) {
    layers += `<polygon points="${DIMS.map((d, i) => pt(i, profile[d]).map(f1).join(',')).join(' ')}" class="r-now"/>`;
    layers += DIMS.map((d, i) => {
      const [x, y] = pt(i, profile[d]);
      const v = f1(profile[d]);
      return `<circle class="radar-pt" cx="${f1(x)}" cy="${f1(y)}" r="6" tabindex="0" data-dim="${d}" aria-label="${DIM_INFO[d].en} (${DIM_INFO[d].zh}): ${v} out of 5. ${esc(DIM_INFO[d].hint)}"><title>${DIM_INFO[d].en}: ${v} / 5</title></circle>`;
    }).join('');
  } else {
    layers = `<text x="${cx}" y="${cy + 4}" text-anchor="middle" class="r-empty">Add ingredients to draw the profile</text>`;
  }
  return `<svg class="radar-svg" viewBox="0 0 360 360" role="group" aria-label="Olfactive profile radar, estimated teaching profile, scale 0 to 5">${grid}${axes}${layers}${labels}</svg>`;
}

// ---------------- Accord Map ----------------
export function mapSVG(ids, edges, selectedNode, activeEdge) {
  const W = 400, H = 360, cx = 200, cy = 170, R = ids.length > 1 ? 115 : 0;
  const pos = {};
  ids.forEach((id, i) => {
    const a = -90 + (360 / ids.length) * i;
    pos[id] = pol(cx, cy, R, a);
  });
  let grid = '';
  for (let g = 0; g <= W; g += 20) grid += `<path d="M${g} 0V${H}" class="m-grid${g % 100 === 0 ? ' major' : ''}"/>`;
  for (let g = 0; g <= H; g += 20) grid += `<path d="M0 ${g}H${W}" class="m-grid${g % 100 === 0 ? ' major' : ''}"/>`;
  if (R) grid += `<circle cx="${cx}" cy="${cy}" r="${R}" class="m-dial"/>`;
  grid += `<path d="M${cx - 6} ${cy}h12M${cx} ${cy - 6}v12" class="r-tick"/>`;
  let e = '';
  for (const ed of edges) {
    const [x1, y1] = pos[ed.a], [x2, y2] = pos[ed.b];
    const meta = TYPE_META[ed.type];
    const dash = ed.evidence === 'hypothesis' ? '2 5' : ed.evidence === 'inference' ? '9 5' : '';
    const active = activeEdge === ed.key;
    e += `<g class="edge ${active ? 'is-active' : ''}">
      <line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${meta.color}" stroke-width="${active ? 6 : ed.evidence === 'documented' ? 4 : 2.5}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>
      <line class="edge-hit" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="transparent" stroke-width="18" role="button" tabindex="0" data-act="lab.edge" data-arg="${ed.key}" aria-label="Open relationship between ${esc(ING_BY_ID[ed.a].en)} and ${esc(ING_BY_ID[ed.b].en)} (${esc(meta.en)}, ${ed.evidence})"/>
    </g>`;
  }
  let nodes = '';
  ids.forEach(id => {
    const ing = ING_BY_ID[id], fam = FAMILY_BY_ID[ing.family];
    const [x, y] = pos[id];
    const on = selectedNode === id;
    nodes += `<g class="node ${on ? 'is-sel' : ''}" role="button" tabindex="0" aria-pressed="${on}" data-act="lab.node" data-arg="${id}" data-en="${esc(ing.en)}" data-fr="${esc(ing.fr)}" aria-label="${esc(ing.en)} (${esc(ing.fr)}), ${esc(fam.en)} family. Press for details.">
      <circle cx="${f1(x)}" cy="${f1(y)}" r="${on ? 27 : 23}" fill="${fam.color}"/>
      <text x="${f1(x)}" y="${f1(y + 4)}" text-anchor="middle" class="node-n">${fam.n}</text>
      <text x="${f1(x)}" y="${f1(y + 40)}" text-anchor="middle" class="node-l">${esc(ing.en)}</text><text x="${f1(x)}" y="${f1(y + 54)}" text-anchor="middle" class="node-z">${esc(ing.zh)}</text>
    </g>`;
  });
  if (!ids.length) nodes = `<text x="${cx}" y="${cy}" text-anchor="middle" class="r-empty">Add ingredients to build the map</text>`;
  return `<svg class="map-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Accord map. Lines appear only where this site has a curated relationship between two families.">${grid}${e}${nodes}</svg>`;
}
