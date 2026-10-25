// Chapter 2: the 18 olfactive families used throughout the site.
// NOTE: The original curriculum list of 18 families was not supplied with the brief,
// so this set was authored for this build. The wheel order is this site's own teaching
// arrangement (fresh -> sweet -> warm -> dark); adjacency is NOT evidence of compatibility.

export const FAMILIES = [
  { id: 'citrus',     en: 'Citrus',         fr: 'Hespéridé',      zh: '柑橘',     color: '#FFE9A3', traits: 'Bright, juicy, sparkling peel notes. Very volatile, so they open a perfume and fade first.' },
  { id: 'aromatic',   en: 'Aromatic',       fr: 'Aromatique',     zh: '芳香草本', color: '#A5DEC4', traits: 'Herbal notes such as lavender, rosemary and mint. Clean, airy and slightly cooling.' },
  { id: 'green',      en: 'Green',          fr: 'Vert',           zh: '青綠',     color: '#BDEBCB', traits: 'Crushed leaves, stems and cut grass. Crisp and sometimes bitter.' },
  { id: 'aquatic',    en: 'Aquatic',        fr: 'Aquatique',      zh: '水生',     color: '#A9D8F2', traits: 'Watery, breezy, marine impressions. Light, clean and modern.' },
  { id: 'fruity',     en: 'Fruity',         fr: 'Fruité',         zh: '果香',     color: '#FFB9AA', traits: 'Juicy or tart fruit other than citrus peel, from crisp apple to velvety peach.' },
  { id: 'floral',     en: 'Floral',         fr: 'Floral',         zh: '花香',     color: '#F6BDCF', traits: 'Garden flowers such as rose, peony and lily of the valley. Soft to richly sweet.' },
  { id: 'whitefloral',en: 'White Floral',   fr: 'Fleurs blanches',zh: '白花',     color: '#FFF4D0', traits: 'Creamy, heady flowers like jasmine, tuberose and orange blossom. Rich and radiant.' },
  { id: 'powdery',    en: 'Powdery',        fr: 'Poudré',         zh: '粉香',     color: '#D9CCF5', traits: 'Soft, dry, cosmetic-like notes such as iris and violet. Smooth and cushioned.' },
  { id: 'musk',       en: 'Musk',           fr: 'Musqué',         zh: '麝香',     color: '#E6DEF8', traits: 'Clean, soft, skin-like notes that smooth the edges of other materials.' },
  { id: 'gourmand',   en: 'Gourmand',       fr: 'Gourmand',       zh: '美食甜香', color: '#F7D98F', traits: 'Edible-sweet impressions such as vanilla and tonka. Cozy and dessert-like.' },
  { id: 'amber',      en: 'Amber',          fr: 'Ambré',          zh: '琥珀',     color: '#F3C386', traits: 'Warm, resinous-sweet and slightly mineral. Glowing and enveloping.' },
  { id: 'balsamic',   en: 'Balsamic',       fr: 'Balsamique',     zh: '樹脂香',   color: '#E9C9A8', traits: 'Sweet-warm tree resins such as benzoin, or incense-like frankincense.' },
  { id: 'spicy',      en: 'Spicy',          fr: 'Épicé',          zh: '辛香',     color: '#FFA28C', traits: 'Tingling or warm kitchen spices: pepper, cardamom, cinnamon.' },
  { id: 'smoky',      en: 'Smoky',          fr: 'Fumé',           zh: '煙燻',     color: '#B9C2DA', traits: 'Campfire, burnt wood and tar. Strong and dark.' },
  { id: 'leather',    en: 'Leather',        fr: 'Cuiré',          zh: '皮革',     color: '#D7B9AA', traits: 'Supple, dry, slightly smoky impressions that recall leather goods.' },
  { id: 'earthy',     en: 'Earthy',         fr: 'Terreux',        zh: '泥土',     color: '#CBD9A6', traits: 'Roots, soil and forest depth, for example patchouli and vetiver. Rich and grounded.' },
  { id: 'mossy',      en: 'Mossy',          fr: 'Mousse',         zh: '苔蘚',     color: '#A9D2A4', traits: 'Damp forest floor, bitter-green and earthy. The backbone of the chypre structure.' },
  { id: 'woody',      en: 'Woody',          fr: 'Boisé',          zh: '木質',     color: '#BFDDB4', traits: 'Dry or creamy woods: pencil shavings, cedar, sandalwood. Structured and steady.' }
];

export const FAMILY_BY_ID = Object.fromEntries(FAMILIES.map((f, i) => [f.id, { ...f, n: i + 1 }]));
export const FAMILY_ORDER = FAMILIES.map(f => f.id);
