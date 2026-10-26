// Instrument studies for the chapter heads: pencil-and-ink sketches of the tools of the perfumer's bench,
// drawn like pages of a laboratory notebook, each with its parts named (no measurements, no formulas).
import { INK, hatch } from './lineart.js';
const W = 440, Ht = 176;
const G = '#6B6256';                       // graphite for leader lines and notes
const T = (x, y, s, anchor = 'start', cls = 'ms-note') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${s}</text>`;
const lead = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${G}" stroke-width=".7"/><circle cx="${x1}" cy="${y1}" r="1.8" fill="${INK}" stroke="none"/>`;
const dim = (x1, y1, x2, y2, label, lx, ly) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${G}" stroke-width=".6"/><path d="M${x1 - 3} ${y1 - 3}l3 3-3 3M${x2 + 3} ${y2 - 3}l-3 3 3 3" stroke="${G}" stroke-width=".6" fill="none" transform="rotate(0)"/>${label ? T(lx, ly, label, 'middle', 'ms-pencil') : ''}`;
const wrap = (n, inner, caption) => `<svg class="ms-fig" viewBox="0 0 ${W} ${Ht}" fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}${T(W - 6, Ht - 6, caption, 'end', 'ms-cap')}</svg>`;
const ticks = (x, y1, y2, n, len = 6, w = .6) => Array.from({ length: n + 1 }, (_, i) => { const y = y1 + (y2 - y1) * i / n; return `<path d="M${x} ${y.toFixed(1)}h${i % 5 === 0 ? len * 1.6 : len}" stroke-width="${w}"/>`; }).join('');

export const MS_FIG = {
  // 1  a row of sample vials in a rack
  1: wrap(1, `${[0, 1, 2, 3, 4, 5].map(i => { const x = 40 + i * 62; const fill = ['#FBF6EA', '#F4EBD3', '#EFE2C0', '#FBF6EA', '#F4EBD3', '#EFE2C0'][i]; const lv = [.7, .5, .35, .6, .45, .3][i]; return `<rect x="${x}" y="56" width="30" height="14" rx="3" fill="#FBF6EA" stroke-width="1"/><path d="M${x + 3} 70h24v6a2 2 0 0 1-2 2h-20a2 2 0 0 1-2-2Z" fill="#FBF6EA" stroke-width=".9"/><path d="M${x} 78h30v62a8 8 0 0 1-8 8h-14a8 8 0 0 1-8-8Z" fill="${fill}" stroke-width="1.1"/><path d="M${x + 1} ${148 - 70 * lv}h28" stroke-width=".6"/>${hatch(`M${x} 78h30v62a8 8 0 0 1-8 8h-14a8 8 0 0 1-8-8Z`, `M${x} ${148 - 70 * lv}h30v80h-30Z`, { size: 440, g: 2.4, w: .4, a: 60, op: .55 })}<rect x="${x + 5}" y="96" width="20" height="16" fill="#fff" stroke-width=".6"/><path d="M${x + 9} 102h12M${x + 9} 107h8" stroke-width=".5"/><text x="${x + 15}" y="124" text-anchor="middle" class="ms-pencil">${i + 1}</text>`; }).join('')}<path d="M24 148H414M24 156H414" stroke-width="1.2"/><path d="M30 156v8M404 156v8" stroke-width="1.2"/>
    <ellipse cx="179" cy="104" rx="21" ry="13" transform="rotate(-4 179 104)" stroke="#B3382C" stroke-width="1.6" fill="none"/>${lead(55, 62, 48, 28)}${T(20, 22, 'cap')}${lead(150, 104, 176, 40)}${T(178, 34, 'label, one number per sample')}${lead(264, 120, 300, 22)}${T(302, 18, 'liquid level')}${lead(380, 152, 392, 134)}${T(398, 130, 'rack', 'start')}`, 'fig. 1 · samples are numbered, never mixed up'),
  // 2  smelling strip (mouillette) receiving a drop from a dropper head
  2: wrap(2, `<g transform="rotate(-24 150 100)"><path d="M30 92H196L214 102 196 112H30Z" fill="#FBF6EA" stroke-width="1.1"/>${hatch('M30 92H196L214 102 196 112H30Z', 'M150 92H214V112H150Z', { size: 440, g: 2.2, w: .4, a: 70, op: .8 })}<text x="44" y="108" class="ms-pencil">rose</text><ellipse cx="62" cy="102" rx="26" ry="12" transform="rotate(0 62 102)" stroke="#B3382C" stroke-width="1.6" fill="none"/></g>
    <g transform="translate(236 0)"><ellipse cx="0" cy="20" rx="12" ry="16" fill="#FBF6EA" stroke-width="1.2"/>${hatch('M-12 20a12 16 0 1 0 24 0a12 16 0 1 0-24 0Z', 'M12 8L12 36L-4 38Z', { size: 440, g: 2, w: .4, a: 50, op: .7 })}<path d="M-14 36h28v5h-28Z" fill="#FBF6EA" stroke-width="1"/><path d="M-6 41V58L-1 70H1L6 58V41" fill="#FBF6EA" stroke-width="1.1"/><path d="M-6 50h12" stroke-width=".5"/><path d="M0 84c3.4 5 3.4 7 0 9.6-3.4-2.600-3.400-4.600 0-9.600Z" fill="#F0DFA8" stroke-width=".9"/></g>
    ${lead(60, 136, 40, 156)}${T(22, 168, 'hand end: scent name (rose)')}${lead(196, 96, 250, 128)}${T(254, 132, 'dipped end')}${lead(248, 18, 286, 12)}${T(290, 16, 'dropper head: bulb + tip')}${lead(236, 90, 290, 78)}${T(294, 82, 'one drop falls on the strip')}`, 'fig. 2 · the strip carries the smell'),
  // 3  three strips in one hand: two held high and near the nose (weak scent, more), one low and far (strong scent, less)
  3: wrap(3, (() => {
    const H = [402, 112];
    const strip = (px, py) => { const dx = H[0] - px, dy = H[1] - py, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx) * 180 / Math.PI; return `<g transform="translate(${px} ${py}) rotate(${a.toFixed(1)})"><path d="M0 0L12 -6H${L.toFixed(0)}V6H12Z" fill="#FBF6EA" stroke-width="1"/>${hatch('M0 0L12 -6H46V6H12Z', null, { size: 440, g: 2, w: .4, a: 60, op: .7 })}</g>`; };
    const wave = (x, y, n, w) => Array.from({ length: n }, (_, i) => `<path d="M${x - i * 11} ${y - 8}q-6 8 0 16" stroke="${G}" stroke-width="${w}" fill="none"/>`).join('');
    return `<path d="M44 52C56 60 56 70 50 80C62 83 64 88 58 93C62 99 60 106 50 108C44 118 32 120 28 114V52Z" fill="#FBF6EA" stroke-width="1.2"/><circle cx="42" cy="86" r="1.4" fill="${INK}" stroke="none"/>
    ${strip(116, 58)}${strip(118, 88)}${strip(232, 130)}
    ${wave(104, 58, 3, .9)}${wave(106, 88, 3, .9)}${wave(220, 130, 1, 1.5)}
    <ellipse cx="238" cy="134" rx="36" ry="13" transform="rotate(-6 238 134)" stroke="#B3382C" stroke-width="1.6" fill="none"/>${T(124, 46, 'base', 'start', 'ms-pencil')}${T(126, 112, 'heart', 'start', 'ms-pencil')}${T(236, 112, 'top', 'start', 'ms-pencil')}
    <path d="M394 100q16-8 28 4l4 24q-4 14-22 12-14-2-12-16Z" fill="#FBF6EA" stroke-width="1.1"/><path d="M398 110q10-4 20 0M399 120q10-4 20 0M400 130q10-4 18 0" stroke-width=".6"/>
    ${T(24, 16, 'two held high, close to the nose: weaker scent, more of it')}${T(24, 152, 'one held low, farther away:')}${T(24, 168, 'stronger scent, less of it')}
    ${T(250, 34, 'build up, smelling each time:')}${T(250, 52, '1 base · 2 heart', 'start', 'ms-pencil')}${T(250, 70, '3 top · 4 modifier', 'start', 'ms-pencil')}`;
  })(), 'fig. 3 · three strips, layered one by one'),
  // 4  a formula sheet (the page a perfumer writes a known accord on). Material names only: the amounts stay blank on purpose.
  4: wrap(4, (() => {
    const rows = [['Rose', 'heart'], ['Violet', 'heart'], ['White musk', 'base']];
    const y0 = 86, dy = 22;
    const lines = rows.map(([m, t], i) => { const y = y0 + i * dy; return `<path d="M30 ${y + 6}H410" stroke="${G}" stroke-width=".5"/>${T(40, y, m)}${T(168, y, t, 'start', 'ms-pencil')}<path d="M258 ${y + 4}H318" stroke="${G}" stroke-width=".8" stroke-dasharray="2 3"/>${T(324, y, 'parts', 'start', 'ms-pencil')}`; }).join('');
    return `<path d="M20 8H420V158H20Z" fill="#FBF6EA" stroke-width="1.2"/><path d="M20 158q10 8 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" stroke-width=".6" fill="none" transform="translate(0 2)" opacity=".0"/>
    <path d="M30 24H410" stroke-width="1"/><path d="M30 28H410" stroke-width=".4"/>${T(36, 20, 'FORMULA SHEET', 'start', 'ms-cap')}${T(404, 20, 'No. ____', 'end', 'ms-pencil')}
    ${T(36, 46, 'Rose accord (a teaching example)')}${T(36, 62, 'material', 'start', 'ms-cap')}${T(168, 62, 'level', 'start', 'ms-cap')}${T(258, 62, 'amount', 'start', 'ms-cap')}
    <path d="M30 67H410" stroke-width=".8"/><path d="M158 50V136M248 50V136" stroke="${G}" stroke-width=".5"/>
    ${lines}
    <ellipse cx="288" cy="108" rx="34" ry="40" transform="rotate(0 288 108)" stroke="#B3382C" stroke-width="1.6" fill="none"/>${T(258, 152, 'total ____ parts', 'start', 'ms-pencil')}${T(36, 152, 'the perfumer fills in the amounts', 'start', 'ms-pencil')}`;
  })(), 'fig. 4 · a known accord, written as a formula'),
  // 5  three trial pages of the same practice formula: v1, v2, v3, with red-pen notes and struck-out old numbers
  5: wrap(5, (() => {
    const RED = '#B3382C';
    const red = (x, y, t, anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="ms-red">${t}</text>`;
    const page = (x, v, rows, note, circ) => {
      let o = `<path d="M${x} 8H${x + 128}V150H${x}Z" fill="#FBF6EA" stroke-width="1.1"/><path d="M${x + 16} 8V150" stroke="${RED}" stroke-width=".5" opacity=".6"/><path d="M${x + 4} 30H${x + 124}" stroke-width=".6"/>${T(x + 24, 25, v, 'start', 'ms-pencil')}${T(x + 124, 25, 'drops', 'end', 'ms-cap')}`;
      rows.forEach(([m, old, now], i) => { const y = 54 + i * 28;
        o += `<path d="M${x + 4} ${y + 8}H${x + 124}" stroke="${G}" stroke-width=".4"/>${T(x + 24, y, 'material ' + m)}`;
        if (old != null) o += `<text x="${x + 92}" y="${y}" class="ms-pencil" text-anchor="middle">${old}</text><path d="M${x + 84} ${y - 2}L${x + 100} ${y - 12}" stroke="${RED}" stroke-width="1.4"/>${red(x + 112, y + 1, now, 'middle')}`;
        else o += `<text x="${x + 106}" y="${y}" class="ms-pencil" text-anchor="middle">${now}</text>`;
        if (circ === i) o += `<ellipse cx="${x + 80}" cy="${y - 5}" rx="38" ry="12" stroke="${RED}" stroke-width="1.2" fill="none"/>`;
      });
      return o + red(x + 22, 142, note);
    };
    return page(14, 'v1', [['A', null, 5], ['B', null, 3], ['C', null, 2]], 'B too strong', 1)
      + page(156, 'v2', [['A', null, 5], ['B', 3, 2], ['C', null, 2]], 'C too loud', 2)
      + page(298, 'v3', [['A', null, 5], ['B', null, 2], ['C', 2, 1]], '✓ in balance')
      + `<path d="M144 80h10M286 80h10" stroke="${RED}" stroke-width="1.2"/><path d="M151 76l5 4-5 4M293 76l5 4-5 4" stroke="${RED}" stroke-width="1.2"/>${T(14, 168, 'practice numbers, not a real formula', 'start', 'ms-cap')}`;
  })(), 'fig. 5 · change one thing, then try again'),
  // 6  from blend to bottle: funnel with filter paper over a clean bottle, a capped and labelled bottle beside it
  6: wrap(6, `<path d="M60 40h52l-6 40H66Z" fill="#FBF6EA" stroke-width="1.2"/><path d="M52 40h68" stroke-width="1.2"/><path d="M66 80l10 30h20l10-30" fill="#FBF6EA" stroke-width="1.2"/><path d="M70 50L86 98 102 50" fill="#F4EBD3" stroke-width=".7"/>${hatch('M70 50L86 98 102 50Z', null, { size: 440, g: 2.4, w: .4, a: 40, op: .6 })}<path d="M80 110h12v10H80Z" fill="#FBF6EA" stroke-width="1"/><path d="M86 122v6" stroke="${G}" stroke-width=".8" stroke-dasharray="2 2"/>
    <path d="M62 136h48v14a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8Z" fill="#FBF6EA" stroke-width="1.2"/><path d="M62 146h48" stroke-width=".5"/>${hatch('M62 146h48v4a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8Z', 'M110 146V158H92Z', { size: 440, g: 2.2, w: .4, a: 50, op: .6 })}
    <path d="M250 70h28v10l8 8v66a6 6 0 0 1-6 6h-32a6 6 0 0 1-6-6V88l8-8Z" fill="#FBF6EA" stroke-width="1.2"/><rect x="254" y="48" width="20" height="22" rx="3" fill="#FBF6EA" stroke-width="1.2"/><path d="M257 48v22M262 48v22M267 48v22M272 48v22" stroke-width=".4"/><rect x="246" y="110" width="40" height="32" fill="#fff" stroke-width=".7"/><path d="M252 120h28M252 127h22M252 134h16" stroke-width=".5"/>
    <ellipse cx="86" cy="76" rx="30" ry="34" transform="rotate(0 86 76)" stroke="#B3382C" stroke-width="1.6" fill="none"/>${lead(112, 66, 150, 40)}${T(154, 36, 'filter paper catches particles')}${lead(110, 148, 122, 148)}${T(126, 153, 'clean, dry bottle')}${lead(70, 44, 36, 26)}${T(22, 20, 'funnel')}${lead(274, 56, 322, 30)}${T(326, 26, 'cap: seal it tight')}${lead(286, 126, 322, 126)}${T(326, 130, 'label + batch no.')}${T(326, 150, 'keep dark, cool', 'start', 'ms-pencil')}`, 'fig. 6 · filter, fill, seal'),
};

// Level 6 banner: the commercial route of an alcohol perfume, drawn as a laboratory flow sheet with handwritten notes.
export const MS_BANNER = (() => {
  const F = '#FBF6EA', Y = '#F0DFA8';
  const title = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" class="ms-title">${t}</text>`;
  const note = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" class="ms-pencil">${t}</text>`;
  const hz = (d, o = {}) => hatch(d, o.region || null, { size: 440, g: o.g || 2.4, w: .45, a: o.a || 50, op: o.op || .6 });
  const icons = [
    // 1 big bottle of pure alcohol + a vial under a magnifier
    `<path d="M-40 -46h20v12l8 10v56a5 5 0 0 1-5 5h-26a5 5 0 0 1-5-5v-56l8-10z" fill="${F}" stroke-width="1.4"/><rect x="-37" y="-58" width="14" height="12" rx="2" fill="${F}" stroke-width="1.2"/><path d="M-45 10h34" stroke-width=".6"/>${hz('M-45 10h34v31a5 5 0 0 1-5 5h-24a5 5 0 0 1-5-5z')}<rect x="-41" y="16" width="26" height="18" fill="#fff" stroke-width=".7"/><path d="M-37 22h18M-37 28h12" stroke-width=".5"/>
     <path d="M12 -2h14v8l5 6v30a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V12l5-6z" fill="${F}" stroke-width="1.3"/><path d="M8 24h22v18a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="${Y}" stroke-width=".6"/><circle cx="38" cy="-14" r="17" fill="rgba(255,255,255,.55)" stroke-width="1.6"/><path d="M50 -2l16 18" stroke-width="3.4"/>`,
    // 2 beaker + dropper (mixing by exact amounts)
    `<path d="M-36 -6h72l-6 52a6 6 0 0 1-6 5H-24a6 6 0 0 1-6-5z" fill="${F}" stroke-width="1.4"/><path d="M-39 -6h78" stroke-width="1.4"/><path d="M-33 20h66l-3 26a6 6 0 0 1-6 5H-24a6 6 0 0 1-6-5z" fill="${Y}" stroke-width=".6"/>${hz('M-33 20h66l-3 26a6 6 0 0 1-6 5H-24a6 6 0 0 1-6-5z', { region: 'M33 20V51H0z' })}<path d="M-30 4h8M-30 14h8M-30 24h8" stroke-width=".6"/>
     <ellipse cx="6" cy="-58" rx="10" ry="13" fill="${F}" stroke-width="1.3"/><path d="M-6 -46h24v5H-6z" fill="${F}" stroke-width="1"/><path d="M0 -41v22l6 12 6-12v-22" fill="${F}" stroke-width="1.2"/><path d="M6 -2c3 4 3 6 0 9-3-3-3-5 0-9z" fill="${Y}" stroke-width=".8"/>`,
    // 3 a corked jar resting on a shelf, with a calendar of struck-off days
    `<path d="M-52 54h60" stroke-width="2"/><path d="M-48 54v8M4 54v8" stroke-width="1.2"/><path d="M-38 -28h36v8l6 6v62a6 6 0 0 1-6 6h-36a6 6 0 0 1-6-6v-62l6-6z" fill="${F}" stroke-width="1.4"/><rect x="-32" y="-44" width="24" height="16" rx="2" fill="#E3CDA0" stroke-width="1.2"/><path d="M-44 4h48" stroke-width=".6"/>${hz('M-44 4h48v52a6 6 0 0 1-6 6h-36a6 6 0 0 1-6-6z', { g: 2.8, op: .5 })}
     <rect x="18" y="-38" width="46" height="52" fill="${F}" stroke-width="1.2"/><path d="M18 -24h46" stroke-width="1"/>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${22 + c * 10.5}" y="${-18 + r * 10.5}" width="8" height="8" fill="none" stroke-width=".5"/>${r * 4 + c < 7 ? `<path d="M${22 + c * 10.5} ${-18 + r * 10.5}l8 8" stroke="#B3382C" stroke-width=".9"/>` : ''}`).join('')).join('')}`,
    // 4 thermometer and funnel with filter paper
    `<path d="M-40 -52a6 6 0 0 1 12 0V14a12 12 0 1 1-12 0z" fill="${F}" stroke-width="1.4"/><path d="M-34 -2V18" stroke="#B3382C" stroke-width="3"/><circle cx="-34" cy="24" r="6" fill="#B3382C" stroke="none"/><path d="M-26 -40h6M-26 -28h6M-26 -16h6M-26 -4h6" stroke-width=".7"/>
     <path d="M-6 -34h60l-14 42H8z" fill="${F}" stroke-width="1.4"/><path d="M-10 -34h68" stroke-width="1.4"/><path d="M4 -26l24 44 24-44" fill="#F4EBD3" stroke-width=".7"/>${hz('M4 -26l24 44 24-44z', { a: 40 })}<path d="M20 8h16v14H20z" fill="${F}" stroke-width="1.1"/><path d="M28 24v8" stroke-width=".8" stroke-dasharray="2 2"/><path d="M12 40h32v14a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z" fill="${F}" stroke-width="1.2"/>`,
    // 5 three sample vials to compare + a clock for the ageing test
    `${[-46, -22, 2].map((x, i) => `<path d="M${x} -26h16v6l3 3v44a4 4 0 0 1-4 4h-14a4 4 0 0 1-4-4v-44l3-3z" fill="${F}" stroke-width="1.3"/><path d="M${x - 2} ${i === 2 ? 8 : 2}h20v28a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4z" fill="${i === 2 ? '#E8CF8C' : Y}" stroke-width=".6"/>`).join('')}<circle cx="42" cy="22" r="22" fill="${F}" stroke-width="1.5"/><path d="M42 8v14l10 6" stroke-width="1.6"/><path d="M42 0v3M64 22h-3M42 44v-3M20 22h3" stroke-width="1"/><path d="M-50 -38q40-18 84-2" fill="none" stroke="#B3382C" stroke-width="1.2"/><path d="M30 -42l6 4-8 4" fill="none" stroke="#B3382C" stroke-width="1.2"/>`,
    // 6 a bottle with a spray pump and the dark box it is packed in
    `<path d="M-30 -8h30v8l6 8v50a5 5 0 0 1-5 5H-31a5 5 0 0 1-5-5V8l6-8z" fill="${F}" stroke-width="1.4"/><rect x="-26" y="-18" width="22" height="10" rx="2" fill="${F}" stroke-width="1.2"/><path d="M-15 -18v-14h16l4 4" stroke-width="1.6"/><path d="M-36 20h42" stroke-width=".6"/>${hz('M-36 20h42v38a5 5 0 0 1-5 5H-31a5 5 0 0 1-5-5z', { g: 2.6, op: .5 })}
     <path d="M16 -14l30-10 20 10v60l-26 12-24-10z" fill="${F}" stroke-width="1.4"/><path d="M16 -14l24 10 26-10M40 -4v64" stroke-width="1"/>${hz('M40 -4l26-10v60L40 60z', { g: 2, a: 70, op: .8 })}`
  ];
  const names = ['1 · buy and check', '2 · mix by recipe', '3 · rest', '4 · chill and filter', '5 · test it', '6 · fill and seal'];
  const notes = ['pure? clean? fresh?', 'exact parts + a helper', 'wait, then look again', 'cold → clear liquid', 'fast + slow ageing tests', 'keep light and air out'];
  let o = '';
  icons.forEach((ic, i) => {
    const cx = 100 + i * 180;
    o += `<g transform="translate(${cx} 142)">${ic}</g><circle cx="${cx}" cy="58" r="14" fill="${F}" stroke-width="1.3"/><text x="${cx}" y="64" text-anchor="middle" class="ms-num">${i + 1}</text>${title(cx, 232, names[i].slice(4))}${note(cx, 260, notes[i])}`;
    if (i < 5) o += `<path d="M${cx + 74} 142h34" stroke="#B3382C" stroke-width="1.4" stroke-dasharray="5 4"/><path d="M${cx + 102} 136l8 6-8 6" stroke="#B3382C" stroke-width="1.4" fill="none"/>`;
  });
  return `<svg class="ms-fig ms-banner-svg" viewBox="0 0 1100 296" fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Flow sheet of six steps: buy and check the materials, mix by recipe, rest, chill and filter, test, fill and seal.">
    <ellipse cx="280" cy="256" rx="92" ry="17" transform="rotate(-1.5 280 256)" stroke="#B3382C" stroke-width="1.8" fill="none"/><text x="24" y="26" class="ms-cap">EXPERIMENT FLOW · how an alcohol perfume is made</text><text x="1076" y="26" text-anchor="end" class="ms-pencil">(simplified)</text><path d="M24 32H1076" stroke-width=".6"/>${o}
    <text x="1076" y="288" text-anchor="end" class="ms-cap">fig. 6b · from the bench to the shelf</text></svg>`;
})();
