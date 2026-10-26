// Teaching pictures in a "maison engraving" finish: ink contours of varied weight, fine hatching for shade,
// double-line metal, gold-leaf accents on an ivory plate. Objects only (no characters), pure inline SVG, decorative
// (aria-hidden): the text beside each picture carries the meaning.
import { INK, PAPER, LDEFS, hatch, dbl, spark, polar, uniq } from './lineart.js';
const GOLDF = 'url(#lgGold)', GOLDS = 'url(#lgGoldS)';
const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`;
const PLATE = `<rect width="120" height="84" rx="3" fill="${PAPER}" stroke="none"/><rect x="3" y="3" width="114" height="78" rx="1.5" fill="none" stroke="#6B6256" stroke-width=".55"/><rect x="5" y="5" width="110" height="74" rx="1" fill="none" stroke="#6B6256" stroke-width=".25"/>${[[3, 3, 1, 1], [117, 3, -1, 1], [3, 81, 1, -1], [117, 81, -1, -1]].map(([x, y, sx, sy]) => `<path d="M${x + sx * 4} ${y + sy * 4}l${sx * 3} ${sy * 3}" stroke="#6B6256" stroke-width=".4"/>`).join('')}`;
const RULER = (() => { let o = ''; for (let i = 0; i <= 20; i++) { const x = 10 + i * 5, l = i % 5 === 0 ? 2.4 : 1.2; o += `M${x} 5v${l}M${x} 79v-${l}`; } for (let i = 0; i <= 13; i++) { const y = 10 + i * 5, l = i % 5 === 0 ? 2.4 : 1.2; o += `M5 ${y}h${l}M115 ${y}h-${l}`; } return `<path d="${o}" stroke="#6B6256" stroke-width=".3"/>`; })();
const S = inner => uniq(`<svg class="art art-line" viewBox="0 0 120 84" aria-hidden="true" focusable="false" fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"><defs>${LDEFS}</defs>${PLATE}${RULER}${inner}</svg>`);
const H = (shape, region, o = {}) => hatch(shape, region, { size: 120, ...o });

// Engraved garden rose: scalloped outer petals, nested rings, a spiral heart in gold leaf.
const rose = (x, y, r) => {
  let pet = ''; for (let i = 0; i < 7; i++) { const [px, py] = polar(0, 0, r * .72, i * 360 / 7 - 90); pet += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${(r * .42).toFixed(2)}" fill="${PAPER}" stroke-width=".8"/>`; }
  return `<g transform="translate(${x} ${y})">${pet}<circle r="${r * .8}" fill="${PAPER}" stroke="none"/><circle r="${r * .66}" stroke-width=".5"/><circle r="${r * .46}" stroke-width=".55" fill="${PAPER}"/><path d="M0 ${-r * .28}a${r * .28} ${r * .28} 0 1 1-${r * .2} ${r * .2}" stroke-width=".7"/><circle r="${r * .14}" fill="${GOLDF}" stroke-width=".5"/>${hatch(circ(0, 0, r * .98), `M${r} ${-r * .2}L${r} ${r}L${-r * .7} ${r}Z`, { size: 120, g: Math.max(1, r / 9), w: .28, op: .7, a: 50 }).replace(/translate/g, 'translate')}</g>`;
};
// Leaf with midrib, side veins and half-tone hatching
const leaf = (x, y, rot, k = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><path d="M0 0C-6-7-5-17 0-23 5-17 6-7 0 0Z" fill="${PAPER}" stroke-width=".8"/><path d="M0 0V-20M0-6l-3-3.4M0-6l3-3.4M0-11l-3.4-3.6M0-11l3.4-3.6M0-16l-2.4-2.4M0-16l2.4-2.4" stroke-width=".35"/></g>`;
const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// Gold glitter: tiny dots and engraved four-point sparkles, thickest below (ox, oy)
const glitter = (w, h, n, ox, oy, seed) => {
  const r = rnd(seed); let out = '';
  for (let i = 0; i < n; i++) {
    const x = Math.max(8, Math.min(w - 8, ox + (r() + r() - 1) * w * 0.7)), y = Math.max(8, Math.min(h - 8, oy + r() * (h - oy - 6)));
    if (true) out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.6 + r() * 1.0).toFixed(2)}" fill="${GOLDF}" stroke="none"/>`;
    else out += spark(+x.toFixed(1), +y.toFixed(1), +(.35 + r() * .5).toFixed(2));
  }
  return out;
};
// Glass shaker (cap up, then rotated to pour): glass, gold powder inside, hatched metal cap with holes
const shaker = (x, y, rot, k) => {
  // powder: seeded gold granules heaped against the cap end (the shaker is tilted, so the powder lies at the mouth)
  const r = rnd(5); let powder = '';
  for (let i = 0; i < 70; i++) { const px = -14 + r() * 28, py = -7 + Math.pow(r(), 1.5) * 22; powder += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(.55 + r() * .9).toFixed(2)}" fill="${GOLDF}" stroke="none"/>`; }
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" stroke-width="${(1 / k * .8).toFixed(2)}"><path d="M-17-8H17V28a10 10 0 0 1-10 10H-7A10 10 0 0 1-17 28Z" fill="${PAPER}"/>${powder}<path d="M-14 15q7 3 14 0t14 0" stroke="#6B6256" stroke-width=".5" stroke-dasharray="1 1.6"/><path d="M-13 17v14" stroke-width=".7" stroke="#6B6256"/><rect x="-20" y="-26" width="40" height="19" rx="5" fill="${PAPER}"/><path d="M-20-12h40" stroke-width=".5"/>${[-12, -6, 0, 6, 12].map(hx => `<circle cx="${hx}" cy="-18" r="1.5" fill="${INK}" stroke="none"/>`).join('')}${[-14, -8, -2, 4, 10].map(hx => `<path d="M${hx}-10l3-5" stroke-width=".35"/>`).join('')}</g>`;
};
// A row of polished metal links, drawn as double-line outlines
const chain = (x1, x2, y, k = 1) => { let o = ''; const step = 22 * k; for (let x = x1; x <= x2; x += step) o += dbl(`M${x + 8 * k} ${y - 8 * k}H${x + 22 * k}a8 8 0 0 1 0 ${16 * k}H${x + 8 * k}a8 8 0 0 1 0-${16 * k}Z`, 2 * k); return o; };

export const ROLE_ART = {
  key: S(`${leaf(46, 72, -52, .85)}${leaf(74, 72, 52, .85)}<path d="M60 56V78" stroke-width="1.1"/>${rose(60, 40, 22)}${spark(60, 11, 1.2)}${spark(30, 20, .7)}${spark(92, 24, .8)}${spark(20, 50, .45)}${spark(102, 54, .5)}`),
  support: S(`${leaf(32, 76, -60, .7)}${leaf(88, 76, 60, .7)}${rose(28, 52, 11)}${rose(92, 52, 11)}${rose(60, 42, 17)}<path d="M40 50q-6 1-9 3M80 50q6 1 9 3" stroke-width=".5" stroke-dasharray="1 2" stroke="#6B6256"/>${spark(60, 14, .8)}`),
  modifier: S(`${glitter(120, 84, 46, 64, 32, 7)}${shaker(20, 20, 125, .66)}${[[40, 33], [44, 37], [47, 33], [50, 41], [43, 42]].map(([gx, gy]) => `<circle cx="${gx}" cy="${gy}" r=".8" fill="${GOLDF}" stroke="none"/>`).join('')}${rose(84, 62, 13)}${spark(104, 22, 1)}${spark(58, 44, .8)}`),
  bridge: S(`<rect x="9" y="9" width="102" height="26" rx="4" fill="${PAPER}" stroke-width=".9"/>${H('M9 9H111V35H9Z', 'M9 9H111V22Z', { g: 2.6, w: .28, a: 0, op: .55 })}<rect x="9" y="49" width="102" height="26" rx="4" fill="${PAPER}" stroke-width=".9"/>${H('M9 49H111V75H9Z', 'M9 62H111V75H9Z', { g: 1.6, w: .3, a: 0, op: .75 })}${chain(16, 80, 42, .8)}`),
  diffusive: S(`<circle cx="26" cy="44" r="12" fill="${GOLDF}" stroke-width=".9"/>${H(circ(26, 44, 12), 'M40 30L40 60L16 60Z', { g: 1.4, w: .3, a: 50 })}${Array.from({ length: 16 }, (_, i) => { const [x1, y1] = polar(26, 44, 15, i * 22.5), [x2, y2] = polar(26, 44, i % 2 ? 18 : 21, i * 22.5); return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke-width="${i % 2 ? .45 : .7}"/>`; }).join('')}${[34, 46, 58].map((yy, i) => `<path d="M${50 - i * 2} ${yy}q10-7 20 0t20 0 14 0" stroke-width=".8"/><path d="M${50 - i * 2} ${yy + 2.4}q10-7 20 0t20 0 14 0" stroke-width=".35" opacity=".7"/>`).join('')}${spark(104, 24, .7)}`),
  fixative: S(`${dbl('M60 18V60M46 29H74', 3)}<circle cx="60" cy="13" r="5.4" fill="none" stroke="${INK}" stroke-width="3.2"/><circle cx="60" cy="13" r="5.4" fill="none" stroke="${PAPER}" stroke-width="1.8"/>${dbl('M27 46Q27 66 60 66T93 46', 3)}${dbl('M20 52l7-9 9 6M100 52l-7-9-9 6', 3)}<path d="M10 76q8-4 16 0t16 0 16 0 16 0 16 0 16 0" stroke-width=".5"/><path d="M60 66v-6" stroke-width=".4"/>${spark(100, 20, .6)}${spark(20, 20, .5)}`)
};

export const CONCEPT_ART = {
  ingredient: S(`${leaf(76, 24, 38, .7)}<path d="M26 46C26 30 42 24 60 24S94 30 94 46 78 68 60 68 26 62 26 46Z" fill="${GOLDF}" stroke-width=".95"/>${H('M26 46C26 30 42 24 60 24S94 30 94 46 78 68 60 68 26 62 26 46Z', 'M120 30L120 80L44 80L90 30Z', { g: 1.7, w: .3, a: 45 })}<path d="M26 46q-5-.4-7-.2M94 46q5-.4 7-.2" stroke-width=".8"/><path d="M36 38q8-8 22-9" stroke="${PAPER}" stroke-width="1.8"/><path d="M42 50h.01M50 56h.01M72 33h.01" stroke-width=".9" stroke="#8A6414"/><circle cx="60" cy="75" r="5" fill="${PAPER}" stroke-width=".6"/><path d="M59 73l1.4-1v6" stroke-width=".7"/>`),
  accord: S(`${(() => { let seg = ''; for (let i = 0; i < 6; i++) { const a0 = i * 60 + 4, a1 = i * 60 + 56; const [x1, y1] = polar(24, 24, 1.6, a0), [x2, y2] = polar(24, 24, 8.4, a0), [x3, y3] = polar(24, 24, 8.4, a1), [x4, y4] = polar(24, 24, 1.6, a1); seg += `<path d="M${x1} ${y1}L${x2} ${y2}A8.4 8.4 0 0 1 ${x3} ${y3}L${x4} ${y4}Z" fill="${i % 2 ? GOLDS : GOLDF}" stroke-width=".4"/>`; } return `<circle cx="24" cy="24" r="10.4" fill="${PAPER}" stroke-width=".8"/>${seg}`; })()}${rose(24, 60, 9)}${leaf(54, 54, 40, .6)}${leaf(52, 40, -50, .55)}<circle cx="52" cy="46" r="1" fill="${INK}" stroke="none"/><path d="M40 42h20" stroke="#6B6256" stroke-width=".7" stroke-dasharray="1 2.2"/><path d="M58 36l7 6-7 6" stroke="#6B6256" stroke-width="1"/>${dbl('M84 30h24v8H84Z', 1)}<path d="M82 38h28V70a4 4 0 0 1-4 4H86a4 4 0 0 1-4-4Z" fill="${PAPER}" stroke-width=".9"/><path d="M83 52q8-3 13 0t13 0V70a3 3 0 0 1-3 3H86a3 3 0 0 1-3-3Z" fill="${GOLDF}" stroke-width=".5"/>${H('M82 38h28V70a4 4 0 0 1-4 4H86a4 4 0 0 1-4-4Z', 'M110 38V74H98L102 38Z', { g: 1.4, w: .28, a: 80, op: .65 })}<path d="M86 42v22" stroke="${PAPER}" stroke-width="1.2"/>${spark(96, 22, .9)}${spark(112, 30, .5)}`),
  formula: S(`<path d="M12 9H54V71H12Z" fill="${PAPER}" stroke-width=".9"/>${H('M12 9H54V71H12Z', 'M54 9V71H49V9Z', { g: 1.2, w: .3, a: 0, op: .6 })}<path d="M19 22H46M19 32H46M19 42H38M19 52H44" stroke-width=".6"/><path d="M19 16h12" stroke-width=".9"/><path d="M64 8V58a7 7 0 0 0 14 0V8" stroke-width=".95"/><path d="M62 8H80" stroke-width=".95"/><path d="M65 36H77V58a6 6 0 0 1-12 0Z" fill="${GOLDF}" stroke-width=".4"/>${[14, 19, 24, 29, 34, 39, 44].map((ty, k) => `<path d="M64 ${ty}h${k % 2 ? 3 : 5}" stroke-width=".5"/>`).join('')}${H('M65 36H77V58a6 6 0 0 1-12 0Z', 'M77 36V64L70 64Z', { g: 1.2, w: .28, a: 45 })}<path d="M95 4a5 5 0 0 1 0 9" fill="none" stroke-width="0"/><ellipse cx="96" cy="12" rx="5.4" ry="7" fill="${PAPER}" stroke-width=".9"/><path d="M90.5 19h11M93 19v13l3 8 3-8V19" fill="${PAPER}" stroke-width=".9"/><path d="M93.6 27h4.8" stroke="#6B6256" stroke-width="3"/><path d="M96 43c1.6 2.4 1.6 3.6 0 4.6-1.6-1-1.6-2.2 0-4.6Z" fill="${GOLDF}" stroke-width=".5"/><rect x="86" y="50" width="26" height="22" rx="5" fill="${GOLDF}" stroke-width=".9"/>${H('M86 50H112V72H86Z', 'M112 50V72H92Z', { g: 1.3, w: .3, a: 45 })}<path d="M91 50v-5a8 8 0 0 1 16 0v5" stroke-width="2.4"/><path d="M91 50v-5a8 8 0 0 1 16 0v5" stroke="${PAPER}" stroke-width=".9"/><circle cx="99" cy="60" r="2.6" fill="${INK}" stroke="none"/><path d="M99 61v5" stroke-width="1.4"/>${spark(110, 14, .5)}`),
  modifier: S(`${glitter(120, 84, 46, 64, 32, 7)}${shaker(20, 20, 125, .66)}${[[40, 33], [44, 37], [47, 33], [50, 41], [43, 42]].map(([gx, gy]) => `<circle cx="${gx}" cy="${gy}" r=".8" fill="${GOLDF}" stroke="none"/>`).join('')}${rose(84, 62, 13)}${spark(104, 22, 1)}${spark(58, 44, .8)}`)
};

export const TIER_COLOR = { top: '#FFE9A8', heart: '#F9C9D5', base: '#CBB8E8', any: '#FFF1C9' };
export const ROLE_TIER = {
  key: { main: 'heart', label: 'Heart' }, support: { main: 'heart', label: 'Heart' },
  diffusive: { main: 'top', label: 'Top' }, fixative: { main: 'base', label: 'Base' },
  bridge: { main: 'heart', label: 'Heart → Base' }, modifier: { main: 'any', label: 'Any level' }
};
export const tierTag = id => `<p class="tier-tag"><span class="rt rt-${id === 'bridge' ? 'bridge' : ROLE_TIER[id].main}">Usually: ${ROLE_TIER[id].label}</span></p>`;

// The pyramid: a true triangle cut into three layers (never distorted), hatched denser toward the base.
// A row of metal links hooks heart and base together (bridging notes); a shaker sprinkles gold over everything (modifiers).
export const PYRAMID = (() => {
  const Hh = y => ((y - 100) * 230 / 380);                  // half-width at height y (apex at y=100)
  const lay = (y1, y2) => `M${300 - Hh(y1)} ${y1}L${300 + Hh(y1)} ${y1}L${300 + Hh(y2)} ${y2}L${300 - Hh(y2)} ${y2}Z`;
  const L = [[100, 236, '#FFF4D2', 14, .6], [240, 370, '#FCE3EA', 9, .7], [374, 480, '#E9E1F8', 6, .8]];
  const big = (shape, region, o) => hatch(shape, region, { size: 600, ...o });
  const layers = L.map(([y1, y2, f, g, op], i) => `<path d="${lay(y1, y2)}" fill="${f}" stroke-width="2"/>${big(lay(y1, y2), `M300 ${y1}L${300 + Hh(y2) + 40} ${y2}L${300 + Hh(y2) + 40} ${y2 + 4}L300 ${y2 + 4}Z`, { g, w: .8, a: 60, op })}`).join('');
  const rim = [[100, 236], [240, 370], [374, 480]].map(([y1, y2]) => `<path d="${lay(y1 + 8, y2 - 8).replace(/Z$/, '')}" stroke="#6B6256" stroke-width=".8" opacity=".6" fill="none"/>`).join('');
  const chainRow = (() => { let o = ''; const x0 = 300 - Hh(372) - 6, x1 = 300 + Hh(372) - 40; for (let x = x0; x <= x1; x += 30) o += dbl(`M${x + 10} 361H${x + 34}a11 11 0 0 1 0 22H${x + 10}a11 11 0 0 1 0-22Z`, 4); return o; })();
  const dust = glitter(600, 500, 60, 300, 60, 11).replace(/scale\(([\d.]+)\)/g, (m, v) => `scale(${(v * 3.6).toFixed(2)})`).replace(/r="([\d.]+)"/g, (m, v) => `r="${(v * 2.4).toFixed(2)}"`);
  const stars = [[120, 150, 2.6], [500, 230, 3], [90, 330, 2.2], [520, 400, 2.8], [200, 80, 2], [440, 330, 2.4], [350, 460, 2.4], [60, 450, 2.4]].map(([x, y, q]) => spark(x, y, q * .9)).join('');
  return uniq(`<svg class="art art-pyramid art-line" viewBox="0 0 600 500" role="img" aria-label="A triangle pyramid with three layers: top, heart and base. A row of metal links hooks the heart and the base together, and a glass shaker pours sparkling gold over the whole pyramid and around it." fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
  <defs>${LDEFS}</defs>
  <rect width="600" height="500" rx="10" fill="${PAPER}" stroke="none"/><rect x="12" y="12" width="576" height="476" rx="6" stroke="#6B6256" stroke-width="1.6"/><rect x="20" y="20" width="560" height="460" rx="4" stroke="#6B6256" stroke-width=".7"/>
  ${layers}${rim}${chainRow}${dust}${stars}
  ${shaker(486, 74, -135, 2.1)}
  <g font-weight="500" fill="${INK}" stroke="${PAPER}" stroke-width="6" paint-order="stroke" text-anchor="middle" font-size="30" font-family="'Bodoni Moda',Georgia,serif" letter-spacing="6"><text x="300" y="206">TOP</text><text x="300" y="316">HEART</text><text x="300" y="440">BASE</text></g>
</svg>`);
})();
