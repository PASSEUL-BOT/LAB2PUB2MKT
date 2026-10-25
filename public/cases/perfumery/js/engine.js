// Compatibility engine. Pure functions, no DOM. Deterministic: same input -> same output.
// Used by the Fragrance Wheel, the Guide, the Radar, the Accord Map and the Summary,
// so all of them always agree.
//
// PUBLIC TEACHING RULES (also shown on the site):
//  R1  Pair relation: same family -> "same-family" inference; different families -> the
//      curated family relation if one exists, otherwise "Insufficient information".
//  R2  Combined profile: each dimension (fresh, sweet, floral, woody, spicy, powdery) is a
//      weighted mean of the ingredient values. Weight of the ingredient at position i
//      (0 = first) is 1 + 0.25 * (n - 1 - i): earlier picks lead the theme.
//  R3  Combined intensity = weighted mean of intensities + 0.25 per extra ingredient, max 5.
//  R4  Direction ("what might happen") compares the combination with the same combination
//      minus the last ingredient. A direction is reported when the change reaches the
//      threshold (0.3 on a 0-5 scale; 0.5 for the derived Drier index; 0.4 for Warmer).
//  R5  Tension warnings appear only when their stated condition is true.
//  R6  There is NO single "compatibility score". Evidence labels are shown instead.

import { FAMILY_BY_ID } from './data/families.js';
import { ING_BY_ID, DIMS } from './data/ingredients.js';
import { getFamilyRelation, partnersOf, DIRS, GROUP_META, TYPE_META } from './data/relations.js';

export { DIMS };

export const DIM_INFO = {
  fresh:     { en: 'Fresh',     fr: 'Frais',     zh: '清新', hint: 'Bright, cool, airy (citrus, mint, sea air).' },
  sweet:     { en: 'Sweet',     fr: 'Sucré',     zh: '甜',   hint: 'Sugar, honey, vanilla, ripe fruit.' },
  floral:    { en: 'Floral',    fr: 'Floral',    zh: '花香', hint: 'Petals and flowers.' },
  woody:     { en: 'Woody',     fr: 'Boisé',     zh: '木質', hint: 'Wood, roots, dry bark.' },
  spicy:     { en: 'Spicy',     fr: 'Épicé',     zh: '辛香', hint: 'Pepper, cardamom, cinnamon.' },
  powdery:   { en: 'Powdery',   fr: 'Poudré',    zh: '粉感', hint: 'Soft, dry, cosmetic-like.' },
  intensity: { en: 'Intensity', fr: 'Intensité', zh: '強度', hint: 'How strongly the material or blend presents itself.' }
};

const clamp = (x, lo = 0, hi = 5) => Math.max(lo, Math.min(hi, x));
export const round1 = x => Math.round(x * 10) / 10;

export function weights(n) {
  return Array.from({ length: n }, (_, i) => 1 + 0.25 * (n - 1 - i));
}

export function combineProfile(ids) {
  const n = ids.length;
  const out = Object.fromEntries(DIMS.map(d => [d, 0]));
  if (!n) return out;
  const w = weights(n);
  const wsum = w.reduce((a, b) => a + b, 0);
  for (const d of DIMS) {
    out[d] = ids.reduce((acc, id, i) => acc + ING_BY_ID[id].profile[d] * w[i], 0) / wsum;
  }
  out.intensity = clamp(out.intensity + 0.25 * (n - 1));
  return out;
}

// ---------- pair analysis ----------
function sameFamilyRelation(famId) {
  const f = FAMILY_BY_ID[famId];
  return {
    a: famId, b: famId, type: 'common', evidence: 'inference', dirs: [], sameFamily: true,
    why: {
      en: `Both belong to the ${f.en} family, so they share a core character and tend to reinforce each other.`,
      fr: `Les deux appartiennent à la famille ${f.fr} : ils partagent un caractère central et se renforcent.`,
      zh: `兩者都屬於${f.zh}家族，共享核心特色，彼此加強。`
    },
    challenge: {
      en: 'Two similar materials can blur together, so the blend may feel one-dimensional.',
      fr: 'Deux matières proches peuvent se confondre : le mélange peut sembler monodimensionnel.',
      zh: '兩種相近的材料可能糊在一起，混合後會顯得單一。'
    },
    next: {
      en: 'Smell them separately and name one difference (sharper vs. softer, for example).',
      fr: 'Sentez-les séparément et nommez une différence (plus vif ou plus doux, par exemple).',
      zh: '分開聞，說出一個差別（例如更鋭利或更柔和）。'
    },
    source: 'Educational reasoning from typical family character; not a sourced rule.'
  };
}

export function relationBetweenFamilies(a, b) {
  return a === b ? sameFamilyRelation(a) : getFamilyRelation(a, b);
}

function contrastHint(a, b) {
  // Experimental hypothesis derived from the two profiles, for pairs without a curated relation.
  let best = null;
  for (const d of DIMS) {
    const diff = Math.abs(a.profile[d] - b.profile[d]);
    if (!best || diff > best.diff) best = { d, diff };
  }
  if (!best || best.diff < 3) {
    return {
      en: 'The two profiles are similar overall, so they may blend quietly. A smelling test is needed to confirm.',
      fr: 'Les deux profils sont proches : ils pourraient se fondre discrètement. Un test olfactif est nécessaire.',
      zh: '兩者的輪廓很接近，可能安靜地融在一起，需要聞香測試確認。'
    };
  }
  const hi = a.profile[best.d] >= b.profile[best.d] ? a : b;
  const lo = hi === a ? b : a;
  const dim = DIM_INFO[best.d];
  return {
    en: `Their profiles differ most in “${dim.en.toLowerCase()}” (${hi.en} ${hi.profile[best.d]} vs. ${lo.en} ${lo.profile[best.d]}). That could create contrast or a mismatch: a smelling test is needed.`,
    fr: `Leurs profils diffèrent surtout par « ${dim.fr.toLowerCase()} » (${hi.fr} ${hi.profile[best.d]} contre ${lo.fr} ${lo.profile[best.d]}). Cela peut créer du contraste ou un décalage : un test olfactif est nécessaire.`,
      zh: `兩者差異最大的是「${dim.zh}」（${hi.zh} ${hi.profile[best.d]}，${lo.zh} ${lo.profile[best.d]}）。這可能形成對比，也可能不協調，需要聞香測試。`
  };
}

export function analyzePair(idA, idB) {
  const a = ING_BY_ID[idA], b = ING_BY_ID[idB];
  const rel = relationBetweenFamilies(a.family, b.family);
  const out = {
    key: [idA, idB].join('+'), a, b, rel,
    type: rel.type, evidence: rel.evidence, group: TYPE_META[rel.type].group,
    sameFamily: a.family === b.family, curated: rel.type !== 'insufficient'
  };
  if (rel.type === 'insufficient') {
    out.hint = { ...contrastHint(a, b), evidence: 'hypothesis' };
  }
  return out;
}

// ---------- tensions (R5) ----------
function tensionRules(ids, items, profile) {
  const list = [];
  const n = ids.length;
  const nameList = arr => arr.map(i => i.en).join(', ');
  const nameListFr = arr => arr.map(i => i.fr).join(', ');
  const nameListZh = arr => arr.map(i => i.zh).join('、');

  const sweetStrong = items.filter(i => i.profile.sweet >= 4);
  const freshStrong = items.filter(i => i.profile.fresh >= 4 && i.profile.intensity <= 3);
  if (sweetStrong.length && freshStrong.length) {
    list.push({
      id: 'sweet-over-fresh', ings: [...sweetStrong, ...freshStrong].map(i => i.id),
      en: `Sweetness may overpower freshness: ${nameList(sweetStrong)} is strongly sweet next to ${nameList(freshStrong)}, which is light and short-lived.`,
      fr: `La douceur peut écraser la fraîcheur : ${nameListFr(sweetStrong)} est très sucré à côté de ${nameListFr(freshStrong)}, léger et éphémère.`,
      zh: `甜味可能壓過清新：${nameListZh(sweetStrong)} 很甜，旁邊的 ${nameListZh(freshStrong)} 輕盈又短暫。`
    });
  }

  const spicyStrong = items.filter(i => i.profile.spicy >= 4);
  const delicate = items.filter(i => i.profile.spicy <= 1 && i.profile.intensity <= 2);
  if (spicyStrong.length && delicate.length) {
    list.push({
      id: 'spice-prominent', ings: [...spicyStrong, ...delicate].map(i => i.id),
      en: `Spice may stand out: ${nameList(spicyStrong)} is strongly spicy and may sit on top of the delicate ${nameList(delicate)}.`,
      fr: `L’épice peut dominer : ${nameListFr(spicyStrong)} est très épicé et peut recouvrir ${nameListFr(delicate)}, plus délicat.`,
      zh: `辛香可能太突出：${nameListZh(spicyStrong)} 很辛，可能蓋過細緻的 ${nameListZh(delicate)}。`
    });
  }

  const heavyBase = items.filter(i => i.profile.intensity >= 4 && (i.profile.woody >= 4 || ['amber', 'balsamic', 'smoky', 'leather'].includes(i.family)));
  const brightTop = items.filter(i => i.profile.fresh >= 4 && i.profile.intensity <= 3);
  if (heavyBase.length && brightTop.length) {
    list.push({
      id: 'heavy-vs-bright', ings: [...heavyBase, ...brightTop].map(i => i.id),
      en: `A heavy wood or resin (${nameList(heavyBase)}) may change the bright impression of ${nameList(brightTop)}.`,
      fr: `Un bois ou une résine dense (${nameListFr(heavyBase)}) peut modifier l’impression lumineuse de ${nameListFr(brightTop)}.`,
      zh: `厚重的木質或樹脂（${nameListZh(heavyBase)}）可能改變 ${nameListZh(brightTop)} 的明亮印象。`
    });
  }

  const strongest = items.filter(i => i.profile.intensity >= 5);
  const strongFams = new Set(strongest.map(i => i.family));
  if (strongest.length >= 2 && strongFams.size >= 2) {
    list.push({
      id: 'strong-vs-strong', ings: strongest.map(i => i.id),
      en: `Two strong personalities may compete: ${nameList(strongest)} are both at the top of the intensity scale.`,
      fr: `Deux personnalités fortes peuvent se concurrencer : ${nameListFr(strongest)} sont toutes deux au sommet de l’échelle d’intensité.`,
      zh: `兩個強勢的個性可能互相競爭：${nameListZh(strongest)} 的強度都在最高等級。`
    });
  } else if (strongest.length === 1 && items.some(i => i.profile.intensity <= 2) && n >= 2) {
    const mild = items.filter(i => i.profile.intensity <= 2);
    list.push({
      id: 'masking', ings: [strongest[0].id, ...mild.map(i => i.id)],
      en: `${strongest[0].en} is very strong and may mask the gentler ${nameList(mild)}.`,
      fr: `${strongest[0].fr} est très puissant et peut masquer ${nameListFr(mild)}, plus discret.`,
      zh: `${strongest[0].zh} 非常強，可能蓋住比較溫和的 ${nameListZh(mild)}。`
    });
  }
  return list;
}

// ---------- suggestions ----------
function suggestions(ids, items, pairs, dist, tensions) {
  const out = [];
  const present = new Set(ids);
  const famPresent = new Set(items.map(i => i.family));
  const n = ids.length;

  const pick = (famId, count = 3) => Object.values(ING_BY_ID).filter(i => i.family === famId && !present.has(i.id)).slice(0, count);

  if (n === 1) {
    const f = items[0].family;
    const partners = partnersOf(f, ['common']).filter(p => !famPresent.has(p.id)).slice(0, 3);
    const cands = partners.flatMap(p => pick(p.id, 1));
    out.push({
      kind: 'add', add: cands.map(c => c.id),
      en: 'Add a second ingredient from a family with a common pairing, then compare it with the first alone.',
      fr: 'Ajoutez un deuxième ingrédient d’une famille à association fréquente, puis comparez-le avec le premier seul.',
      zh: '再加第二種材料，選一個常見搭配的家族，然後和單獨的第一種比較。'
    });
    return out;
  }

  if (n === 2) {
    const cands = [];
    for (const p of partnersOf(items[0].family, ['common', 'contrast'])) {
      if (famPresent.has(p.id)) continue;
      const q = partnersOf(items[1].family, ['common', 'contrast']).find(x => x.id === p.id);
      if (q) cands.push(...pick(p.id, 1));
    }
    out.push({
      kind: 'compare',
      en: 'Compare the two ingredients on their own before adding a third.',
      fr: 'Comparez d’abord les deux ingrédients seuls avant d’en ajouter un troisième.',
      zh: '加第三種材料前，先把兩種材料單獨比較。'
    });
    out.push({
      kind: 'add', add: cands.slice(0, 3).map(c => c.id),
      en: cands.length ? 'Add a third ingredient from a family that is linked to both in the relation data.'
                       : 'No third family is linked to both in the relation data; try a contrasting family and treat it as a hypothesis.',
      fr: cands.length ? 'Ajoutez un troisième ingrédient d’une famille reliée aux deux dans les données de relations.'
                       : 'Aucune troisième famille n’est reliée aux deux dans les données ; essayez une famille contrastée et traitez-la comme une hypothèse.',
      zh: cands.length ? '加第三種材料，選一個在關係資料裡與兩者都有連結的家族。'
                       : '資料裡沒有同時連結兩者的第三個家族；試試對比的家族，並把它當成假設。'
    });
  }

  if (n >= 3) {
    if (dist.topShare >= 0.6) {
      const partners = partnersOf(dist.top, ['contrast', 'common']).filter(p => !famPresent.has(p.id)).slice(0, 3);
      out.push({
        kind: 'add', add: partners.flatMap(p => pick(p.id, 1)).map(c => c.id),
        en: `Try a contrasting family: ${FAMILY_BY_ID[dist.top].en} makes up most of the blend.`,
        fr: `Essayez une famille contrastée : la famille ${FAMILY_BY_ID[dist.top].fr} domine le mélange.`,
      zh: `試試對比的家族：${FAMILY_BY_ID[dist.top].zh}佔了混合的大部分。`
      });
    }
    if (tensions.length) {
      const t = tensions[0];
      out.push({
        kind: 'remove', remove: t.ings[0],
        en: `Remove ${ING_BY_ID[t.ings[0]].en} for a moment and compare how the overall impression changes.`,
        fr: `Retirez ${ING_BY_ID[t.ings[0]].fr} un instant et comparez le changement d’impression générale.`,
      zh: `先暫時拿掉${ING_BY_ID[t.ings[0]].zh}，比較整體印象怎麼變。`
      });
    }
    const last = ING_BY_ID[ids[n - 1]];
    const alts = pick(last.family, 2);
    if (alts.length) {
      out.push({
        kind: 'swap', add: alts.map(a => a.id),
        en: `Test a different material from the same family as ${last.en} and compare.`,
        fr: `Testez une autre matière de la même famille que ${last.fr} et comparez.`,
      zh: `換成和${last.zh}同家族的另一種材料，再比較。`
      });
    }
  }

  const hasBase = items.some(i => ['woody', 'amber', 'musk', 'earthy', 'balsamic', 'mossy'].includes(i.family));
  const hasVolatile = items.some(i => i.profile.fresh >= 4 && i.profile.intensity <= 3);
  if (n >= 2 && hasVolatile && !hasBase) {
    out.push({
      kind: 'add', add: ['white_musk', 'sandalwood', 'cedarwood'].filter(x => !present.has(x)),
      en: 'The blend has fast-fading top notes but no base. Try adding a woody or musky base and compare how long the impression holds.',
      fr: 'Le mélange a des notes de tête éphémères mais pas de fond. Essayez un fond boisé ou musqué et comparez la tenue de l’impression.',
      zh: '這個組合有很快消散的前調，卻沒有基底。試著加入木質或麝香基底，比較印象能維持多久。'
    });
  }

  if (n >= 2) {
    out.push({
      kind: 'theme',
      en: `Treat ${items[0].en} as the theme (first in the list) and the others as supporting directions. Reorder the list to hear a different lead.`,
      fr: `Prenez ${items[0].fr} comme thème (premier de la liste) et les autres comme directions de soutien. Changez l’ordre pour entendre une autre dominante.`,
      zh: `把${items[0].zh}當成主題（清單第一個），其他當成輔助方向。調換順序，聽聽不同的主角。`
    });
  }
  return out;
}

// ---------- directions (R4) ----------
function warmth(p) { return (p.sweet + p.spicy + p.woody) / 3; }
function dryness(p) { return p.woody + p.powdery - p.sweet; }

function directions(ids) {
  const out = [];
  if (ids.length < 2) return out;
  const now = combineProfile(ids);
  const before = combineProfile(ids.slice(0, -1));
  const d = k => now[k] - before[k];
  const push = (id, v) => out.push({ id, delta: round1(v), ...DIRS[id] });
  if (d('fresh') >= 0.3) push('fresher', d('fresh'));
  if (d('sweet') >= 0.3) push('sweeter', d('sweet'));
  if (d('floral') >= 0.3) push('floral', d('floral'));
  if (d('woody') >= 0.3) push('woody', d('woody'));
  if (d('spicy') >= 0.3) push('spicier', d('spicy'));
  if (d('powdery') >= 0.3) push('powdery', d('powdery'));
  if (warmth(now) - warmth(before) >= 0.4) push('warmer', warmth(now) - warmth(before));
  if (dryness(now) - dryness(before) >= 0.5) push('drier', dryness(now) - dryness(before));
  if (d('intensity') >= 0.3) push('heavier', d('intensity'));
  if (d('intensity') <= -0.3) push('lighter', -d('intensity'));
  if (d('fresh') <= -0.3) out.push({ id: 'less-fresh', delta: round1(d('fresh')), en: 'Less fresh', fr: 'Moins frais', zh: '不那麼清新' });
  return out;
}

// ---------- full combination analysis ----------
export function analyzeCombo(ids) {
  const n = ids.length;
  const items = ids.map(id => ING_BY_ID[id]);
  const profile = combineProfile(ids);
  const prevProfile = n >= 1 ? combineProfile(ids.slice(0, -1)) : null;

  const pairs = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(analyzePair(ids[i], ids[j]));

  const w = weights(n);
  const famWeight = {};
  items.forEach((it, i) => { famWeight[it.family] = (famWeight[it.family] || 0) + w[i]; });
  const wsum = w.reduce((a, b) => a + b, 0) || 1;
  const families = Object.entries(famWeight)
    .map(([id, wt]) => ({ id, count: items.filter(i => i.family === id).length, share: wt / wsum }))
    .sort((a, b) => b.share - a.share || a.id.localeCompare(b.id));
  const top = families[0]?.id || null;
  const countShare = n ? Math.max(...families.map(f => f.count)) / n : 0;
  const dist = { families, top, topShare: countShare };

  const groups = { harmonious: [], explore: [], tension: [], insufficient: [] };
  pairs.forEach(p => groups[p.group].push(p));

  const tensions = tensionRules(ids, items, profile);
  pairs.filter(p => p.type === 'conflict').forEach(p => tensions.push({
    id: 'conflict-' + p.key, ings: [p.a.id, p.b.id], rel: p.rel,
    en: `${p.a.en} + ${p.b.en}: ${p.rel.challenge.en}`,
    fr: `${p.a.fr} + ${p.b.fr} : ${p.rel.challenge.fr}`,
      zh: `${p.a.zh} + ${p.b.zh}：${p.rel.challenge.zh || p.rel.challenge.en}`
  }));
  if (n >= 3 && countShare >= 0.6) {
    tensions.push({
      id: 'concentration', ings: items.filter(i => i.family === top).map(i => i.id), note: true,
      en: `Most of the blend is ${FAMILY_BY_ID[top].en}. That gives a clear theme but little contrast.`,
      fr: `L’essentiel du mélange est de la famille ${FAMILY_BY_ID[top].fr} : thème clair, mais peu de contraste.`,
      zh: `這個組合大部分是${FAMILY_BY_ID[top].zh}：主題清楚，但對比很少。`
    });
  }

  // clear tonal contrast (positive observation, not a tension)
  const contrasts = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = items[i], b = items[j];
    for (const d of ['fresh', 'sweet', 'floral', 'woody']) {
      if (Math.abs(a.profile[d] - b.profile[d]) >= 4) { contrasts.push({ a: a.id, b: b.id, dim: d }); break; }
    }
  }

  const evidenceCounts = { documented: 0, inference: 0, hypothesis: 0, insufficient: 0 };
  pairs.forEach(p => { evidenceCounts[p.evidence]++; });
  let overall = n < 2 ? 'insufficient' : 'documented';
  if (n >= 2) {
    if (evidenceCounts.insufficient) overall = 'insufficient';
    else if (evidenceCounts.hypothesis) overall = 'hypothesis';
    else if (evidenceCounts.inference) overall = 'inference';
  }

  const dirs = directions(ids);
  const sugg = suggestions(ids, items, pairs, dist, tensions);

  return {
    n, ids, items, profile, prevProfile, pairs, groups, dist, tensions, contrasts,
    evidenceCounts, overallEvidence: overall, directions: dirs, suggestions: sugg,
    summary: {
      freshness: round1(profile.fresh), sweetness: round1(profile.sweet), intensity: round1(profile.intensity),
      dominant: families.slice(0, 2).map(f => f.id),
      tensionTitles: tensions.filter(t => !t.note).map(t => t.id),
      nextExperiment: sugg[0] || null
    }
  };
}

// Documented/inferred relationships that connect the chosen ingredients (Accord Map edges).
export function mapGraph(ids) {
  const nodes = ids.map(id => ({ id, family: ING_BY_ID[id].family }));
  const edges = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const p = analyzePair(ids[i], ids[j]);
    if (p.curated && !p.sameFamily) edges.push({ a: ids[i], b: ids[j], type: p.type, evidence: p.evidence, key: p.key });
  }
  return { nodes, edges };
}

// ---------- product mapping ----------
import { NOTE_MAP } from './data/products.js';
import { ACCORDS } from './data/accords.js';

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function mapNote(name) {
  const m = NOTE_MAP[name.toLowerCase().trim()] || NOTE_MAP[norm(name)];
  if (!m) return { name, mapped: false };
  const ing = m.ing ? ING_BY_ID[m.ing] : null;
  return { name, mapped: true, basis: m.basis, ingredientId: ing ? ing.id : null, family: ing ? ing.family : m.fam };
}

export function mapProduct(product) {
  if (!product.notes) return { available: false };
  const tiers = ['top', 'heart', 'base', 'unlabelled'];
  const mapped = {};
  const famCount = {};
  const ingredientIds = [];
  let total = 0, mappedCount = 0;
  for (const t of tiers) {
    mapped[t] = (product.notes[t] || []).map(mapNote);
    for (const m of mapped[t]) {
      total++;
      if (m.mapped) {
        mappedCount++;
        famCount[m.family] = (famCount[m.family] || 0) + 1;
        if (m.ingredientId && !ingredientIds.includes(m.ingredientId)) ingredientIds.push(m.ingredientId);
      }
    }
  }
  const families = Object.entries(famCount).map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
  // Relation to the 15 classic accords. Three kinds, each labelled so the learner can tell
  // what the source said from what this site inferred:
  //   label       the page's own family wording contains the accord's name (source-stated)
  //   named-note  the page names the accord's lead material (the accord is this site's inference)
  //   combination >= 60% (min. 2) of one teaching example's materials appear in the notes AND its
  //               lead material is one of them (educational inference only)
  const label = norm(product.publishedFamily || '');
  const accords = [];
  for (const a of ACCORDS) {
    const hits = [];
    if (label && (label.includes(norm(a.en.replace(' Accord', ''))) || label.includes(norm(a.fr.replace(/^Accord (de |d’)?/, ''))))) {
      hits.push({ kind: 'label', overlap: [], basis: `The page’s own family wording is “${product.publishedFamily}”.` });
    }
    for (const e of a.examples) {
      const overlap = e.ids.filter(id => ingredientIds.includes(id));
      if (overlap.length >= Math.max(2, Math.ceil(e.ids.length * 0.6)) && overlap.includes(e.ids[0])) hits.push({ kind: 'combination', overlap, basis: `${overlap.length} of ${e.ids.length} materials of the teaching example “${e.label}” appear in the published notes.` });
    }
    const lead = a.examples[0].ids[0];
    const NAMED = ['rose', 'jasmine', 'orange_blossom', 'muguet', 'violet', 'sandalwood', 'vanilla'];
    if (NAMED.includes(a.id) && ingredientIds.includes(lead) && !hits.some(h => h.kind === 'combination')) {
      hits.push({ kind: 'named-note', overlap: [lead], basis: `The published notes name ${ING_BY_ID[lead].en}, the lead material of this accord.` });
    }
    if (hits.length) {
      const best = hits.sort((x, y) => (y.kind === 'label') - (x.kind === 'label') || y.overlap.length - x.overlap.length)[0];
      accords.push({ accord: a, kind: best.kind, overlap: best.overlap, basis: best.basis });
    }
  }
  accords.sort((x, y) => (y.kind === 'label') - (x.kind === 'label') || y.overlap.length - x.overlap.length);
  return {
    available: true, mapped, total, mappedCount, families,
    primary: families[0]?.id || null, secondary: families[1]?.id || null,
    ingredientIds, accords
  };
}
