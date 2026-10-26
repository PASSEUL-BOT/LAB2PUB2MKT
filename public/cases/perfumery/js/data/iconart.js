// Hand-built "maison engraving" illustrations for the 18 families and the lab-made materials.
// Ink contours, fine hatching for shade, one gold-leaf accent each. Objects only (no characters).
// They illustrate the idea of each smell; they are not photos of the raw material.
import { INK, PAPER, LDEFS, hatch, polar, spark, uniq } from './lineart.js';
const svg = body => uniq(`<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"><defs>${LDEFS}</defs>${body}</svg>`);
const P = (d, fill = PAPER, w = .85) => `<path d="${d}" fill="${fill}" stroke-width="${w}"/>`;
const GOLDF = 'url(#lgGold)', GOLDS = 'url(#lgGoldS)';
const LR = (cx, cy, r) => `M${cx + r} ${cy - r}L${cx + r + 1} ${cy + r + 1}L${cx - r} ${cy + r + 1}Z`;   // lower-right half-plane around a point
const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`;

const mk = {
  citrus() {
    let seg = ''; const [cx, cy] = [24, 24];
    for (let i = 0; i < 8; i++) { const a0 = i * 45 + 4, a1 = i * 45 + 41; const [x1, y1] = polar(cx, cy, 2.6, a0), [x2, y2] = polar(cx, cy, 12.4, a0), [x3, y3] = polar(cx, cy, 12.4, a1), [x4, y4] = polar(cx, cy, 2.6, a1); seg += `<path d="M${x1} ${y1}L${x2} ${y2}A12.4 12.4 0 0 1 ${x3} ${y3}L${x4} ${y4}A2.6 2.6 0 0 0 ${x1} ${y1}Z" fill="${i % 2 ? GOLDS : GOLDF}" stroke-width=".5"/>`; }
    return svg(`${P(circ(24, 24, 16.5), PAPER, 1)}<circle cx="24" cy="24" r="14.4" stroke-width=".45"/>${seg}${hatch(circ(24, 24, 16.5), 'M48 6L48 48L6 48Z', { a: 45, g: 1.4, w: .3 })}<path d="M12 15q3-4.6 8-5.8" stroke="${PAPER}" stroke-width="1.2"/>`);
  },
  aromatic() {
    let buds = ''; for (let i = 0; i < 5; i++) { const y = 28 - i * 4.4; buds += [-1, 1].map(s => `<ellipse cx="${24 + s * 3.4}" cy="${y}" rx="1.7" ry="3.3" transform="rotate(${s * 32} ${24 + s * 3.4} ${y})" fill="${i % 2 ? PAPER : GOLDS}" stroke-width=".6"/>`).join(''); }
    return svg(`<path d="M24 45C24 34 24.4 22 24 8" stroke-width=".9"/>${buds}<ellipse cx="24" cy="7.5" rx="1.6" ry="3.4" fill="${GOLDF}" stroke-width=".6"/><path d="M24 38C19 38 14 34 12 28 18 29 22 33 24 38ZM24 38C29 38 34 34 36 28 30 29 26 33 24 38Z" fill="${PAPER}" stroke-width=".7"/><path d="M24 38Q18 34 13 29M24 38Q30 34 35 29" stroke-width=".35"/><path d="M21 41q3 2.4 6 0M20 43q4 3 8 0" stroke-width=".5"/>`);
  },
  green() {
    const l2 = 'M24 38C34 34 41 24 39 8C29 10 22 22 24 38Z', l1 = 'M24 39C13 37 8 26 10 13C20 15 27 26 24 39Z';
    return svg(`${P(l1)}${P(l2)}${hatch(l2, 'M48 0L48 48L26 48L30 0Z', { a: 60, g: 1.3, w: .3 })}<path d="M24 39C19 30 14.5 22 10.5 13.5M24 38C26 28 31 18 38.5 9" stroke-width=".5"/><path d="M19 32q-4-1-7-4M16.5 26q-3-.5-5-3M28 29q4-1 7-.5M31 22q3.5-1 6-.5M26.4 34q3.5.4 6-.6" stroke-width=".35"/><path d="M24 39v6" stroke-width=".9"/><path d="M40 6q2.6 3.4 0 5.4-2.6-2-0-5.4Z" fill="${GOLDF}" stroke-width=".5"/>`);
  },
  aquatic() {
    const d = 'M24 5C24 5 11 20 11 29a13 13 0 0 0 26 0C37 20 24 5 24 5Z';
    return svg(`${P(d, PAPER, 1)}${hatch(d, 'M48 14L48 48L16 48Z', { a: 50, g: 1.5, w: .3 })}<path d="M14 31q2.5-2.6 5 0t5 0 5 0 5 0M16 36q2.5-2.4 5 0t5 0 5 0" stroke-width=".55"/><path d="M16 26q.4 5 5 8" stroke="${PAPER}" stroke-width="1.4"/><path d="M33 10q2.2 3.2 0 5-2.2-1.8 0-5Z" fill="${GOLDF}" stroke-width=".5"/><path d="M38 17q1.6 2.4 0 3.6-1.6-1.2 0-3.6Z" fill="${GOLDS}" stroke-width=".45"/>`);
  },
  fruity() {
    return svg(`<path d="M15 31C16 21 22 13 31 7M31 31C30 21 29 14 31 7" stroke-width=".8"/><path d="M31 7C34 2.4 40 3 43.4 6.4 40 10.8 34 10.6 31 7Z" fill="${PAPER}" stroke-width=".7"/><path d="M31 7Q37 5.6 42.6 6.4" stroke-width=".35"/>${[[15, 35], [32, 35]].map(([x, y], i) => `${P(circ(x, y, 8), i ? GOLDS : GOLDF, .9)}${hatch(circ(x, y, 8), LR(x, y, 8), { a: 45, g: 1.3, w: .3, op: .75 })}<path d="M${x - 5} ${y - 2.4}q1.2-3 4.2-3.6" stroke="${PAPER}" stroke-width="1.3"/><path d="M${x} ${y - 8}q-1.6 2 0 3.2" stroke-width=".5"/>`).join('')}`);
  },
  floral() {
    let pet = ''; for (let i = 0; i < 5; i++) { const t = `rotate(${i * 72} 24 24)`; pet += `<path transform="${t}" d="M24 24C16.6 21 15.2 11 24 7.6 32.8 11 31.4 21 24 24Z" fill="${PAPER}" stroke-width=".85"/><path transform="${t}" d="M24 22C22 18 22 13.5 24 10.5M24 22C26 18 26 13.5 24 10.5" stroke-width=".35"/>`; }
    return svg(`${pet}<circle cx="24" cy="24" r="4.2" fill="${GOLDF}" stroke-width=".7"/><path d="M21.6 24.4a2.5 2.5 0 0 1 4-2.2M22.8 22.4h.01M25.6 25.2h.01" stroke-width=".5"/>${[0, 1, 2, 3, 4].map(i => `<path transform="rotate(${i * 72 + 36} 24 24)" d="M24 8.6q-1.2-1.6 0-3 1.2 1.4 0 3Z" fill="${GOLDS}" stroke-width=".4"/>`).join('')}`);
  },
  whitefloral() {
    let pet = ''; for (let i = 0; i < 6; i++) { const t = `rotate(${i * 60} 24 24)`; pet += `<path transform="${t}" d="M24 24C19.6 20 19.6 11.6 24 5.6 28.4 11.6 28.4 20 24 24Z" fill="${PAPER}" stroke-width=".85"/><path transform="${t}" d="M24 21.6V9.4" stroke-width=".35"/>`; }
    return svg(`${pet}<circle cx="24" cy="24" r="3" fill="${GOLDF}" stroke-width=".6"/>${[0, 1, 2, 3, 4, 5].map(i => { const [x, y] = polar(24, 24, 5.4, i * 60 + 30); return `<circle cx="${x}" cy="${y}" r=".7" fill="${INK}" stroke="none"/>`; }).join('')}`);
  },
  powdery() {
    let sc = ''; const n = 14; for (let i = 0; i < n; i++) { const [x, y] = polar(21, 29, 11, i * 360 / n); sc += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.4" fill="${PAPER}" stroke-width=".7"/>`; }
    return svg(`${sc}<circle cx="21" cy="29" r="10.4" fill="${PAPER}" stroke="none"/>${hatch(circ(21, 29, 11.2), 'M40 15L40 48L8 48Z', { a: 40, g: 1.5, w: .3, op: .6 })}<path d="M14 26q3-4 8-4.4M16 31q4-3 9-1" stroke-width=".4"/><path d="M30 17q5-4 10-9M37 14l2.4-2.4" stroke-width=".8"/><path d="M40 5q2 .6 2.8 2.8-2.2.2-2.8-2.8Z" fill="${GOLDF}" stroke-width=".4"/>${spark(38, 22, .5)}${spark(43, 16, .4)}${spark(33, 9, .35)}`);
  },
  musk() {
    const d = 'M12 35a8 8 0 0 1 0-16 9.5 9.5 0 0 1 17.6-3.4A8.4 8.4 0 0 1 36 35Z';
    return svg(`${P(d, PAPER, 1)}${hatch(d, 'M0 30L48 26L48 48L0 48Z', { a: 20, g: 1.4, w: .3 })}<path d="M16 24q1.6-3.4 5.6-3.6M26 20.6q3 .2 4.4 2.6" stroke-width=".45"/><circle cx="38" cy="14" r="2" fill="${GOLDF}" stroke-width=".5"/><circle cx="42.6" cy="22" r="1.2" fill="${GOLDS}" stroke-width=".4"/><circle cx="9" cy="12" r="1.2" fill="${GOLDS}" stroke-width=".4"/>`);
  },
  gourmand() {
    const top = 'M9 22C9 13 16 8.4 24 8.4S39 13 39 22Z', bot = 'M9 28C9 36 16 40.4 24 40.4S39 36 39 28Z';
    return svg(`${P(top, GOLDS, .9)}${hatch(top, 'M48 0L48 30L24 30L34 0Z', { a: 55, g: 1.3, w: .3 })}<path d="M10 22.6q14 2.6 28 0M10 27.4q14-2.6 28 0" stroke-width=".7"/><path d="M12 24.6q3 2 5 0t5 0 5 0 5 0 4.8 0" fill="${PAPER}" stroke-width=".55"/>${P(bot, GOLDF, .9)}${hatch(bot, 'M48 20L48 48L20 48Z', { a: 55, g: 1.3, w: .3 })}<path d="M12.6 14q3-3.6 8-4.6M13.2 17.6q.4.4 1 .4M17 17h.01M22 14.6h.01M28 15.6h.01" stroke="${PAPER}" stroke-width=".8"/>`);
  },
  amber() {
    const d = 'M24 5L39 14V32L24 43L9 32V14Z';
    return svg(`${P(d, GOLDF, 1)}<path d="M24 5V43M9 14L39 32M39 14L9 32M9 14L24 22L39 14M9 32L24 22L39 32" stroke-width=".45"/>${hatch('M24 22L39 14V32L24 43Z', null, { a: 55, g: 1.2, w: .3, op: .75 })}<path d="M13 15.6l7-4M12 21l1 5" stroke="${PAPER}" stroke-width="1.2"/>${spark(40, 8, .7)}`);
  },
  balsamic() {
    const body = 'M17 23H31V40a2.4 2.4 0 0 1-2.4 2.4H19.4A2.4 2.4 0 0 1 17 40Z';
    return svg(`${P(body, PAPER, .95)}${hatch(body, 'M48 20L48 48L26 48L28 20Z', { a: 80, g: 1.3, w: .3 })}<path d="M16 23h16M24 23v-4" stroke-width=".8"/><path d="M24 6C28 10.6 29.6 14 29.6 17a5.6 5.6 0 0 1-11.2 0C18.4 14 20.4 10.6 24 6Z" fill="${GOLDF}" stroke-width=".85"/><path d="M24 11.6c2 2.4 2.8 4.2 2.8 5.8a2.8 2.8 0 0 1-5.6 0c0-1.6.8-3.4 2.8-5.8Z" fill="${PAPER}" stroke-width=".45"/><path d="M20.4 28v8M22 42.4q2 1.4 4 0" stroke-width=".5"/>${spark(38, 12, .6)}${spark(10, 16, .45)}`);
  },
  spicy() {
    let pods = ''; for (let i = 0; i < 8; i++) { const t = `rotate(${i * 45} 24 24)`; pods += `<path transform="${t}" d="M24 22.6C19.6 19.4 19.6 11.8 24 6.4 28.4 11.8 28.4 19.4 24 22.6Z" fill="${PAPER}" stroke-width=".85"/><ellipse transform="${t}" cx="24" cy="12.4" rx="1.3" ry="2.2" fill="${INK}" stroke="none" opacity=".85"/>`; }
    return svg(`${pods}<circle cx="24" cy="24" r="4" fill="${GOLDF}" stroke-width=".8"/><circle cx="24" cy="24" r="1.5" fill="${PAPER}" stroke-width=".4"/>`);
  },
  smoky() {
    return svg(`<path d="M17 44C7 38.4 22 34.4 15.6 28.6S27 21 20.6 14.4 28 7 24 3" stroke-width="1.3"/><path d="M17.8 44C9 38.4 24 35 17.6 28.6S29 21.4 22.4 14.4 29 8 26 3" stroke-width=".5" opacity=".7"/><path d="M33 45C26 41 37 38 31.4 33.4S40 28 35 22.6 41 18 38.4 14" stroke-width="1"/><path d="M33.8 45C27 41.4 38 38.4 32.6 33.4S41 28.4 36.4 22.6 42 18.6 40 14" stroke-width=".4" opacity=".7"/><path d="M8 46h32" stroke-width=".5"/><path d="M12 43q2-2 3.6 0M32 44q1.6-1.6 3 0" stroke-width=".4"/><path d="M26.4 42.4q2 2.6 0 3.6-2-1 0-3.6Z" fill="${GOLDF}" stroke-width=".4"/>`);
  },
  leather() {
    const bag = 'M9 19H39L42 42H6Z';
    return svg(`<path d="M17 19v-3a7 7 0 0 1 14 0v3" stroke-width=".95"/><path d="M19.4 19v-2.6a4.6 4.6 0 0 1 9.2 0V19" stroke-width=".45"/>${P(bag, PAPER, 1)}${hatch(bag, 'M48 19L48 48L28 48L34 19Z', { a: 75, g: 1.3, w: .3 })}<path d="M9.6 24H38.4" stroke-width=".6"/><path d="M11.4 27H36.6M7.4 39H40.6" stroke-width=".35" stroke-dasharray="1.6 1.4"/><rect x="21" y="26" width="6" height="5.4" rx="1.3" fill="${GOLDF}" stroke-width=".7"/><circle cx="24" cy="28.6" r=".8" fill="${INK}" stroke="none"/>`);
  },
  earthy() {
    const cap = 'M6 28C6 15 14 8 24 8S42 15 42 28Z', stem = 'M19 28H29L30.4 40a2.2 2.2 0 0 1-2.2 2.4H19.8A2.2 2.2 0 0 1 17.6 40Z';
    return svg(`${P(stem, PAPER, .9)}${hatch(stem, 'M48 28L48 48L24 48L26 28Z', { a: 80, g: 1.3, w: .3 })}${P(cap, PAPER, 1)}${hatch(cap, 'M48 8L48 28L26 28L34 8Z', { a: 50, g: 1.3, w: .3 })}<path d="M7 28q17 3.4 34 0" stroke-width=".7"/><path d="M12 27l2-5M18 28.4l1-6M24 29l0-6.4M30 28.4l-1-6M36 27l-2-5" stroke-width=".3"/>${[[15, 18, 2.4], [26, 13, 1.8], [33, 20, 2.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLDF}" stroke-width=".5"/>`).join('')}`);
  },
  mossy() {
    const blobs = [[14, 31, 8.4], [26, 25, 10.6], [35, 32, 7.6], [22, 36, 7.4]];
    let o = ''; blobs.forEach(([x, y, r]) => { o += `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke-width=".85"/>`; });
    let st = ''; const rr = (() => { let s = 7; return () => (s = s * 16807 % 2147483647) / 2147483647; })(); for (let i = 0; i < 46; i++) { const x = 8 + rr() * 34, y = 17 + rr() * 22; st += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".42" fill="${INK}" stroke="none"/>`; }
    return svg(`${o}${hatch(circ(26, 25, 10.6) + circ(35, 32, 7.6), 'M48 26L48 48L20 48Z', { a: 40, g: 1.6, w: .28, op: .55 })}${st}<path d="M6 41q18 4.4 36 0" stroke-width=".9"/><path d="M10 43.6q14 3 28 0" stroke-width=".4"/>${spark(38, 12, .6)}<path d="M36 18q-1.4-2.6 0-5 1.4 2.4 0 5Z" fill="${GOLDS}" stroke-width=".4"/>`);
  },
  woody() {
    const d = 'M7.4 25C7.4 15 14 8.4 24 8.4S40.6 15 40.6 25 34 41.6 24 41.6 7.4 35 7.4 25Z';
    return svg(`<path d="M10 38C12 43.4 17 45.6 24 45.6S36 43.4 38 38" stroke-width=".7"/>${P(d, PAPER, 1)}${[14, 10.2, 6.6, 3.2].map((r, i) => `<path d="M${24 - r * 1.14} 25a${r * 1.14} ${r} 0 1 0 ${r * 2.28} 0a${r * 1.14} ${r} 0 1 0-${r * 2.28} 0Z" stroke-width="${i ? .45 : .6}"/>`).join('')}${hatch(d, 'M48 22L48 48L20 48Z', { a: 55, g: 1.5, w: .28, op: .55 })}<path d="M24 25L40 22M24 25L10 31" stroke-width=".3"/><circle cx="24" cy="25" r="1.4" fill="${GOLDF}" stroke-width=".5"/>${spark(40, 10, .6)}`);
  },
  flask() {
    const b = 'M19 7H29M21 7V19L9 38a3 3 0 0 0 2.6 4.4H36.4A3 3 0 0 0 39 38L27 19V7';
    return svg(`<path d="${b}" fill="${PAPER}" stroke-width=".95"/><path d="M13.6 31H34.4L39 38A3 3 0 0 1 36.4 42.4H11.6A3 3 0 0 1 9 38Z" fill="${GOLDF}" stroke-width=".6"/>${hatch('M13.6 31H34.4L39 38A3 3 0 0 1 36.4 42.4H11.6A3 3 0 0 1 9 38Z', 'M48 34L48 48L24 48Z', { a: 45, g: 1.3, w: .3 })}<path d="M19 9.6H29" stroke-width=".4"/><circle cx="19" cy="35.6" r="1.2" fill="${PAPER}" stroke-width=".4"/><circle cx="27" cy="37" r=".9" fill="${PAPER}" stroke-width=".4"/><circle cx="24" cy="26" r="1.1" stroke-width=".4"/><circle cx="25.6" cy="22" r=".7" stroke-width=".4"/>`);
  }
};
export const FAM_SVG = { citrus: mk.citrus, aromatic: mk.aromatic, green: mk.green, aquatic: mk.aquatic, fruity: mk.fruity, floral: mk.floral, whitefloral: mk.whitefloral, powdery: mk.powdery, musk: mk.musk, gourmand: mk.gourmand, amber: mk.amber, balsamic: mk.balsamic, spicy: mk.spicy, smoky: mk.smoky, leather: mk.leather, earthy: mk.earthy, mossy: mk.mossy, woody: mk.woody };
export const ING_SVG = { calone: mk.flask, ambroxan: mk.flask, white_musk: mk.musk };
