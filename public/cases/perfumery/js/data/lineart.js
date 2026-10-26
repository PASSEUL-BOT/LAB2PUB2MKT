// "Maison engraving" toolkit: fine ink contours with varied weight, parallel-line hatching for shade,
// double-line (outlined) strokes, and gold-leaf accents. Everything here is plain SVG strings.
export const INK = '#1E1A16', GOLD = '#B08A3E', PAPER = '#FFFDF8';
let k = 0;
const uid = p => p + (++k);
// Shared gradients (fixed ids: identical wherever they appear)
export const LDEFS = `<linearGradient id="lgGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1E6C4"/><stop offset=".45" stop-color="#D9C186"/><stop offset="1" stop-color="#A98C4C"/></linearGradient>
<linearGradient id="lgGoldS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAF3DC"/><stop offset="1" stop-color="#E6D5A4"/></linearGradient>`;
// Hatching: parallel lines at angle `a`, clipped to `shape` (path d) and, optionally, to `region` (path d) so only one side is shaded.
export function hatch(shape, region, { a = 45, g = 1.5, w = .3, op = .8, size = 48, c = INK } = {}) {
  const s = uid('hs'), r = uid('hr'); let lines = '';
  for (let y = -size; y <= size * 2; y += g) lines += `M${-size} ${y.toFixed(2)}H${size * 2}`;
  const body = `<g transform="rotate(${a} ${size / 2} ${size / 2})"><path d="${lines}" stroke="${c}" stroke-width="${w}" opacity="${op}" fill="none"/></g>`;
  return `<clipPath id="${s}"><path d="${shape}"/></clipPath>${region ? `<clipPath id="${r}"><path d="${region}"/></clipPath>` : ''}<g clip-path="url(#${s})">${region ? `<g clip-path="url(#${r})">${body}</g>` : body}</g>`;
}
// Double-line stroke: a thick ink stroke with a paper-coloured stroke inside it (outlined ribbon / metal rod).
export const dbl = (d, w = 3, extra = '') => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 1.2}" stroke-linecap="round" stroke-linejoin="round" ${extra}/><path d="${d}" fill="none" stroke="${PAPER}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const polar = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
// An engraved four-point gold sparkle
export const spark = () => '';   // no decorative sparkles: notebook pages carry no ornaments

// Gradients referenced from a hidden (display:none) SVG fail to render in Chrome, so every picture gets its own copy of the ids.
let u = 0;
export const uniq = svg => { const n = ++u; return svg.replace(/lgGoldS/g, 'lgGoldS' + n).replace(/lgGold(?!S)/g, 'lgGold' + n); };
