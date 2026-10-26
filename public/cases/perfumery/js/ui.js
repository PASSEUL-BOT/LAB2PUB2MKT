// Small HTML-string helpers. Language hierarchy is fixed everywhere:
// English (primary) > Français (alongside) > 中文 (very small helper text).

import { ING_ICON, FAM_ICON, stickerHTML, ingVisual } from './data/icons.js';
import { FAM_SVG } from './data/iconart.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Stacked label (headings, buttons, table heads)
export const L = (en, fr, zh) =>
  `<span class="l-en">${esc(en)}</span>${fr ? `<span class="l-fr" lang="fr">${esc(fr)}</span>` : ''}${zh ? `<small class="l-zh" lang="zh-Hant">${esc(zh)}</small>` : ''}`;

// Inline label for question headings: "English / Français" + small Chinese
export const Q = (en, fr, zh) =>
  `<span class="l-en">${esc(en)}</span> <span class="l-fr" lang="fr">/ ${esc(fr)}</span>${zh ? ` <small class="l-zh" lang="zh-Hant">${esc(zh)}</small>` : ''}`;

// Pronounceable term: hover/focus plays English once; FR button plays French; click on EN button plays English.
export function term({ en, fr, zh }, opts = {}) {
  const cls = opts.cls ? ' ' + opts.cls : '';
  const speakFr = opts.speakFr || fr;
  // Picture sticker: ingredients carry .family, families carry .color + .traits
  const arguments0 = arguments[0];
  const isIng = !!arguments0.family;
  const visual = isIng ? ingVisual(arguments0.id) : (arguments0.color && arguments0.traits ? stickerHTML(FAM_ICON[arguments0.id], '', FAM_SVG[arguments0.id]) : '');
  return `<span class="term${cls}${visual ? ' has-ico' : ''}" data-en="${esc(opts.speakEn || en)}" data-fr="${esc(speakFr)}">` + visual +
    `<button type="button" class="term-en" data-speak="en" aria-label="Hear “${esc(en)}” in English">${esc(en)}</button>` +
    (fr ? `<span class="term-fr" lang="fr">${esc(fr)}</span>` : '') +
    (fr ? `<button type="button" class="fr-btn" data-speak="fr" lang="fr" aria-label="Écouter « ${esc(fr)} » en français">FR</button>` : '') +
    (zh ? `<small class="zh" lang="zh-Hant">${esc(zh)}</small>` : '') +
    `</span>`;
}

// A small coloured chip for a family
export function famChip(f, extra = '') {
  return `<span class="fam-chip" style="--fc:${f.color}"><span class="fam-dot"></span>${stickerHTML(FAM_ICON[f.id], ' ico-sm', FAM_SVG[f.id])}${esc(f.en)} <i lang="fr">${esc(f.fr)}</i>${extra}</span>`;
}

export function badge(meta, extraCls = '', noFr = false) {
  return `<span class="badge ${extraCls}" style="--c:${meta.color}"><b>${esc(meta.en)}</b>${noFr ? '' : ` <i lang="fr">${esc(meta.fr)}</i>`}${meta.zh ? ` <small lang="zh-Hant">${esc(meta.zh)}</small>` : ''}</span>`;
}

export function dirChips(dirs, zhMode = false) {
  if (!dirs || !dirs.length) return `<span class="muted">No expected direction stated. ${zhMode ? '<small lang="zh-Hant">沒有標示預期方向。</small>' : '<i lang="fr">Aucune direction attendue indiquée.</i>'}</span>`;
  return dirs.map(d => `<span class="dir-chip">${esc(d.en)} ${zhMode ? `<small lang="zh-Hant">${esc(d.zh || '')}</small>` : `<i lang="fr">/ ${esc(d.fr)}</i>`}</span>`).join(' ');
}

export function bilingualPara(obj) {
  return `<p class="p-en">${esc(obj.en)}</p><p class="p-fr" lang="fr">${esc(obj.fr)}</p>`;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// "🍋 Lemon" label for lists that are not full terms
export const ingLabel = i => `${ingVisual(i.id, ' ico-sm')}${esc(i.en)}`;

// English with a small Chinese helper (no French): used where French was removed from body text.
export const QZ = (en, zh) => `<span class="l-en">${esc(en)}</span> <small class="l-zh" lang="zh-Hant">${esc(zh)}</small>`;
export function zhPara(obj) { return `<p class="p-en">${esc(obj.en)}</p>${obj.zh ? `<p><small lang="zh-Hant">${esc(obj.zh)}</small></p>` : ''}`; }
