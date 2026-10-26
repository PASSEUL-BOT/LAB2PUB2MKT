// Picture stickers for materials and families, so each word has an image to remember it by.
// These are emoji chosen as the closest everyday picture of the smell's source or feeling
// (a lemon for Lemon, a bell for Lily of the Valley, a flask for a lab-made material).
// They illustrate the idea only: they are not photos of the raw material.
export const ING_ICON = {
  bergamot: '🍐', lemon: '🍋', grapefruit: '🍊',
  lavender: '🪻', rosemary: '🌿', mint: '🍃',
  violet_leaf: '🥒', cut_grass: '🌱', galbanum: '🥬', tea: '🍵',
  calone: '🫧', marine_note: '🌊',
  apple: '🍎', peach: '🍑', blackcurrant: '🫐',
  rose: '🌹', peony: '🌸', muguet: '🔔',
  jasmine: '🌼', orange_blossom: '🏵️', tuberose: '🌷',
  iris: '⚜️', violet: '💜', heliotrope: '🪷',
  black_pepper: '⚫', cardamom: '🫛', cinnamon: '🍂',
  vanilla: '🍦', tonka: '🫘',
  cedarwood: '🌲', sandalwood: '🪵', oakmoss: '🌳',
  labdanum: '🍯', ambroxan: '🧪', white_musk: '☁️',
  benzoin: '🍮', frankincense: '🪔', birch_tar: '🔥',
  leather_note: '👜', patchouli: '🪴', vetiver: '🌾'
};
export const FAM_ICON = {
  citrus: '🍋', aromatic: '🌿', green: '🌱', aquatic: '🌊', fruity: '🍓', floral: '🌸',
  whitefloral: '🌼', powdery: '🪶', musk: '☁️', gourmand: '🍰', amber: '🍯', balsamic: '🕯️',
  spicy: '🌶️', smoky: '💨', leather: '👜', earthy: '🍄', mossy: '🌳', woody: '🪵'
};
const e = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Round sticker. Decorative (aria-hidden): the word next to it carries the meaning.
export const stickerHTML = (emoji, extra = '', svgFn) => svgFn ? `<span class="ico ico-svg${extra}" aria-hidden="true">${svgFn()}</span>` : emoji ? `<span class="ico${extra}" aria-hidden="true">${e(emoji)}</span>` : '';
import { PHOTOS } from './photos.js';
import { FAM_SVG, ING_SVG } from './iconart.js';
// Individual materials show a real photo when one exists; otherwise the cartoon sticker.
export const ingVisual = (id, extra = '') => PHOTOS[id]
  ? `<img class="ico photo${extra}" src="photos/${id}.jpg" alt="" aria-hidden="true" width="48" height="48" title="Photo: ${e(PHOTOS[id].author)}, ${e(PHOTOS[id].license)} (Wikimedia Commons)">`
  : stickerHTML(ING_ICON[id], extra, ING_SVG[id]);
export const ingIcon = id => ingVisual(id);
export const famIcon = id => stickerHTML(FAM_ICON[id], '', FAM_SVG[id]);
