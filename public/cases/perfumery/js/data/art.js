// Cartoon teaching pictures (objects only, no characters). Pure inline SVG, decorative: the text beside
// each picture carries the meaning, so every picture is aria-hidden.
const S = (inner, bg = '#FFF6E5') => `<svg class="art" viewBox="0 0 120 84" aria-hidden="true" focusable="false"><rect width="120" height="84" rx="14" fill="${bg}"/>${inner}</svg>`;
const rose = (x, y, r, c = '#F4A6B8') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${c}" stroke="#C9627D" stroke-width="2"/><path d="M0-${r * .6}a${r * .6} ${r * .6} 0 1 1-${r * .35} ${r * .5}M0-${r * .25}a${r * .3} ${r * .3} 0 1 1 ${r * .2} ${r * .2}" fill="none" stroke="#C9627D" stroke-width="1.8" stroke-linecap="round"/></g>`;
const star = (x, y, s, c = '#FFD66B') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-8 2.4-2.6 8-2 3.8 1.8 5 7.5 0 4.6-5 7.5-3.8 1.8-8-2-2.4-2.6Z" fill="${c}" stroke="#D9A21B" stroke-width="1.2" stroke-linejoin="round"/>`;


const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const GOLDS = ['#FFD700', '#FFC928', '#FFE680', '#FFB400', '#FFF2B0'];
// Gold glitter spread over a w x h picture, thickest below the point (ox, oy) where the shaker pours.
const glitter = (w, h, n, ox, oy, seed, k = 1) => {
  const r = rnd(seed); let out = '';
  for (let i = 0; i < n; i++) {
    const x = Math.max(3, Math.min(w - 3, ox + (r() + r() - 1) * w * 0.75)), y = oy + r() * (h - oy - 3), c = GOLDS[Math.floor(r() * GOLDS.length)], t = r();
    if (t < 0.45) out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${((1 + r() * 2.4) * k).toFixed(1)}" fill="${c}"/>`;
    else if (t < 0.8) { const q = (3 + r() * 4.5) * k; out += `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" d="M0-${q}L${q * .28} -${q * .28}L${q} 0L${q * .28} ${q * .28}L0 ${q}L-${q * .28} ${q * .28}L-${q} 0L-${q * .28} -${q * .28}Z" fill="${c}"/>`; }
    else out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(5 * k).toFixed(1)}" height="${(2 * k).toFixed(1)}" rx="1" fill="${c}" transform="rotate(${Math.floor(r() * 180)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return out;
};
// A glass shaker with a metal, holed cap, drawn upright (cap up) and then rotated to pour.
const shaker = (x, y, rot, k) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><rect x="-19" y="-8" width="38" height="46" rx="10" fill="#EAF6FB" stroke="#7FA9BD" stroke-width="2.6"/><rect x="-15" y="12" width="30" height="22" rx="7" fill="#FFD34D"/><circle cx="-6" cy="20" r="2" fill="#FFF2B0"/><circle cx="5" cy="26" r="2.2" fill="#FFB400"/><path d="M-13 -2v10" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><rect x="-22" y="-28" width="44" height="22" rx="7" fill="#C5CED7" stroke="#6C7A89" stroke-width="2.6"/><path d="M-16 -23h32" stroke="#fff" stroke-width="2" opacity=".8"/>${[-13, -6.5, 0, 6.5, 13].map(hx => `<circle cx="${hx}" cy="-15" r="2.1" fill="#4A5560"/>`).join('')}</g>`;
// A horizontal row of interlocking metal links (a chain).
const chain = (x1, x2, y, k = 1) => { let o = ''; const step = 28 * k; for (let x = x1, i = 0; x <= x2; x += step, i++) o += `<rect x="${x}" y="${y - 11 * k}" width="${40 * k}" height="${22 * k}" rx="${11 * k}" fill="none" stroke="#6C7A89" stroke-width="${5 * k}"/><rect x="${x}" y="${y - 11 * k}" width="${40 * k}" height="${22 * k}" rx="${11 * k}" fill="none" stroke="#EEF2F6" stroke-width="${1.6 * k}"/>`; return o; };

export const ROLE_ART = {
  key: S(`${rose(60, 46, 21)}${star(60, 14, 1.2)}<path d="M60 67v12" stroke="#6BB38A" stroke-width="4" stroke-linecap="round"/>`),
  support: S(`${rose(60, 44, 15)}${rose(32, 54, 10, '#F9C9D5')}${rose(88, 54, 10, '#F9C9D5')}<path d="M44 52q-6 2-8 6M76 52q6 2 8 6" stroke="#6BB38A" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  modifier: S(`${glitter(120,84,34,70,28,7,.8)}${shaker(26,24,-125,.68)}${rose(80,64,13)}${glitter(120,84,10,70,10,3,.7)}`),
  bridge: S(`<rect x="8" y="8" width="104" height="28" rx="8" fill="#F9C9D5" stroke="#C9627D" stroke-width="2"/><rect x="8" y="48" width="104" height="28" rx="8" fill="#CBB8E8" stroke="#8D6BB8" stroke-width="2"/>${chain(10,84,42,.62)}`),
  diffusive: S(`<circle cx="26" cy="46" r="15" fill="#FFE27A" stroke="#D9A21B" stroke-width="2"/><path d="M26 31v30M11 46h30M16 36l20 20M36 36 16 56" stroke="#D9A21B" stroke-width="1.4"/><path d="M48 34q12-8 22 0t22 0M48 46q12-8 22 0t22 0M48 58q12-8 22 0t22 0" fill="none" stroke="#7CC1E8" stroke-width="3.5" stroke-linecap="round"/>`),
  fixative: S(`<path d="M60 12v40M44 22h32" stroke="#6C7A89" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="12" r="5" fill="none" stroke="#6C7A89" stroke-width="4"/><path d="M26 44q0 24 34 24t34-24" fill="none" stroke="#6C7A89" stroke-width="5" stroke-linecap="round"/><path d="M20 50l6-8 8 6M100 50l-6-8-8 6" fill="none" stroke="#6C7A89" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 70v6" stroke="#A9B6C3" stroke-width="3"/>`)
};

export const CONCEPT_ART = {
  ingredient: S(`<path d="M30 44q0-20 30-20t30 20q0 20-30 20t-30-20Z" fill="#FFE27A" stroke="#D9A21B" stroke-width="2.5"/><path d="M52 24q6-10 16-6" fill="none" stroke="#6BB38A" stroke-width="3.5" stroke-linecap="round"/><text x="60" y="76" text-anchor="middle" font-size="10" font-weight="700" fill="#6A5A2A">1</text>`),
  accord: S(`<circle cx="26" cy="26" r="11" fill="#FFE27A" stroke="#D9A21B" stroke-width="2"/><circle cx="26" cy="60" r="11" fill="#F4A6B8" stroke="#C9627D" stroke-width="2"/><circle cx="52" cy="43" r="11" fill="#A9D8B8" stroke="#4E9970" stroke-width="2"/><path d="M62 43h14" stroke="#555" stroke-width="3" stroke-linecap="round"/><path d="M72 36l8 7-8 7" fill="none" stroke="#555" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M84 44c0-14 24-14 24 0s-24 14-24 0Z" fill="#D9C2F0" stroke="#8D6BB8" stroke-width="2.4"/><path d="M92 44q4-6 8 0" fill="none" stroke="#8D6BB8" stroke-width="2" stroke-linecap="round"/>`),
  formula: S(`<rect x="32" y="10" width="46" height="60" rx="6" fill="#fff" stroke="#8A8A8A" stroke-width="2.5"/><path d="M40 24h30M40 34h30M40 44h22" stroke="#C9C9C9" stroke-width="3" stroke-linecap="round"/><rect x="72" y="42" width="30" height="26" rx="6" fill="#FFD66B" stroke="#D9A21B" stroke-width="2.5"/><path d="M79 42v-7a8 8 0 0 1 16 0v7" fill="none" stroke="#D9A21B" stroke-width="3.5" stroke-linecap="round"/><circle cx="87" cy="54" r="3" fill="#8A6A10"/>`),
  modifier: S(`${glitter(120,84,34,70,28,7,.8)}${shaker(26,24,-125,.68)}${rose(80,64,13)}${glitter(120,84,10,70,10,3,.7)}`)
};

export const TIER_COLOR = { top: '#FFE9A8', heart: '#F9C9D5', base: '#CBB8E8', any: '#FFF1C9' };
export const ROLE_TIER = {
  key: { main: 'heart', label: 'Heart' }, support: { main: 'heart', label: 'Heart' },
  diffusive: { main: 'top', label: 'Top' }, fixative: { main: 'base', label: 'Base' },
  bridge: { main: 'heart', label: 'Heart → Base' }, modifier: { main: 'any', label: 'Any level' }
};
export const tierTag = id => `<p class="tier-tag"><span class="rt rt-${id === 'bridge' ? 'bridge' : ROLE_TIER[id].main}">Usually: ${ROLE_TIER[id].label}</span></p>`;

// The pyramid: a true triangle cut into three layers (so it is never distorted). It carries only the three names;
// the roles live in the coloured panel beside it. A metal clip hooks heart and base together (bridging notes);
// a shaker sprinkles gold over the whole pyramid (modifiers).
const H = y => ((y - 100) * 230 / 380);                // half-width at height y (apex at y=100)
const layer = (y1, y2, fill, stroke) => `<path d="M${300 - H(y1)} ${y1} L${300 + H(y1)} ${y1} L${300 + H(y2)} ${y2} L${300 - H(y2)} ${y2}Z" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`;
export const PYRAMID = `<svg class="art art-pyramid" viewBox="0 0 600 500" role="img" aria-label="A triangle pyramid with three layers: top, heart and base. A row of metal links hooks the heart and the base together, and a glass shaker pours sparkling gold over the whole pyramid and around it.">
  <defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="600" height="500" rx="18" fill="#FFF6E5"/>
  ${layer(100, 236, '#FFE9A8', '#D9A21B')}${layer(240, 370, '#F9C9D5', '#C9627D')}${layer(374, 480, '#CBB8E8', '#8D6BB8')}
  ${chain(300 - H(372) - 8, 300 + H(372) - 30, 372, 1.05)}
  <g filter="url(#glow)">${glitter(600, 500, 150, 300, 60, 11, 1.25)}</g>
  <g filter="url(#glow)">${[[120, 150, 13], [500, 230, 15], [90, 330, 11], [520, 400, 14], [200, 80, 10], [440, 330, 12], [350, 460, 12], [60, 450, 12]].map(([x, y, q]) => `<path transform="translate(${x} ${y})" d="M0-${q}L${q * .25} -${q * .25}L${q} 0L${q * .25} ${q * .25}L0 ${q}L-${q * .25} ${q * .25}L-${q} 0L-${q * .25} -${q * .25}Z" fill="#FFE680" stroke="#FFB400" stroke-width="1.2"/>`).join('')}</g>
  ${shaker(486, 74, -135, 2.1)}
  <g font-weight="700" fill="#2A3340" text-anchor="middle" font-size="28" stroke="#fff" stroke-width="5" paint-order="stroke"><text x="300" y="206">TOP</text><text x="300" y="316">HEART</text><text x="300" y="440">BASE</text></g>
</svg>`;
