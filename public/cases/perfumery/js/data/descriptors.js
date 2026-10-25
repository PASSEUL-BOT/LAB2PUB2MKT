// Chapter 1 (14 olfactive descriptors), Chapter 3 (roles + concepts).
// NOTE: The original curriculum list of 14 descriptors was not supplied with the brief,
// so this set was authored for this build. Replace if the original list differs.

export const DESCRIPTORS = [
  { id: 'fresh',  en: 'Fresh',  fr: 'Frais',      zh: '清新', def: 'Bright, cool and airy, like a breeze or freshly cut fruit.', example: 'lemon' },
  { id: 'sweet',  en: 'Sweet',  fr: 'Sucré',      zh: '甜香', def: 'Reminds you of sugar, honey or dessert.', example: 'vanilla' },
  { id: 'floral', en: 'Floral', fr: 'Floral',     zh: '花香', def: 'Smells of flower petals, from light and watery to rich and heady.', example: 'rose' },
  { id: 'fruity', en: 'Fruity', fr: 'Fruité',     zh: '果香', def: 'Juicy or tart like ripe fruit (not citrus peel).', example: 'peach' },
  { id: 'green',  en: 'Green',  fr: 'Vert',       zh: '青綠', def: 'Like crushed leaves, stems and cut grass.', example: 'cut_grass' },
  { id: 'woody',  en: 'Woody',  fr: 'Boisé',      zh: '木質', def: 'Like pencil shavings, tree bark or a warm wooden room.', example: 'cedarwood' },
  { id: 'spicy',  en: 'Spicy',  fr: 'Épicé',      zh: '辛香', def: 'Tingly and aromatic, like spices in the kitchen.', example: 'black_pepper' },
  { id: 'powdery',en: 'Powdery',fr: 'Poudré',     zh: '粉感', def: 'Soft and dry, like cosmetic powder or a clean cloth.', example: 'iris' },
  { id: 'warm',   en: 'Warm',   fr: 'Chaleureux', zh: '溫暖', def: 'Cozy and enveloping, like sun-warmed skin or a soft blanket.', example: 'labdanum' },
  { id: 'dry',    en: 'Dry',    fr: 'Sec',        zh: '乾爽', def: 'Not juicy or sugary; crisp like paper or dry wood.', example: 'vetiver' },
  { id: 'smoky',  en: 'Smoky',  fr: 'Fumé',       zh: '煙燻', def: 'Like a campfire, burnt wood or incense.', example: 'birch_tar' },
  { id: 'earthy', en: 'Earthy', fr: 'Terreux',    zh: '泥土', def: 'Like damp soil, roots and the forest floor.', example: 'patchouli' },
  { id: 'light',  en: 'Light',  fr: 'Léger',      zh: '輕盈', def: 'Airy and delicate; lifts quickly and feels almost weightless.', example: 'bergamot' },
  { id: 'heavy',  en: 'Heavy',  fr: 'Dense',      zh: '濃重', def: 'Rich and thick; feels full and stays in the air.', example: 'tuberose' }
];

export const ROLES = [
  { id: 'key', en: 'Key Note', fr: 'Note principale', zh: '主調',
    def: 'The note that defines the theme of an accord.',
    example: 'Rose is the key note of a rose accord.', exampleIds: ['rose'] },
  { id: 'support', en: 'Supporting Note', fr: 'Note de soutien', zh: '輔助調',
    def: 'Reinforces and rounds out the key note.',
    example: 'Violet or peony can support rose.', exampleIds: ['violet', 'peony'] },
  { id: 'modifier', en: 'Modifier', fr: 'Modificateur', zh: '修飾調',
    def: 'Changes the character of the accord, giving it a twist.',
    example: 'A little black pepper adds a spicy edge to rose.', exampleIds: ['black_pepper'] },
  { id: 'bridge', en: 'Bridging Note', fr: 'Note de liaison', zh: '橋接調',
    def: 'Connects two parts that do not blend easily on their own.',
    example: 'Sandalwood can link a bright floral and a warm amber.', exampleIds: ['sandalwood'] },
  { id: 'diffusive', en: 'Diffusive Note', fr: 'Note diffusante', zh: '擴散調',
    def: 'Spreads through the air quickly and gives lift and radiance.',
    example: 'Bergamot and mint are light and travel fast.', exampleIds: ['bergamot', 'mint'] },
  { id: 'fixative', en: 'Fixative', fr: 'Fixateur', zh: '定香調',
    def: 'Slows evaporation so an accord lasts longer on a scent strip or skin.',
    example: 'Labdanum, white musk and vetiver are often used for this job.', exampleIds: ['labdanum', 'white_musk', 'vetiver'] }
];

export const CONCEPTS = [
  { id: 'ingredient', en: 'Ingredient', fr: 'Ingrédient', zh: '香氣材料',
    def: 'A single scent material.', example: 'Lemon, rose, vanilla.' },
  { id: 'accord', en: 'Accord', fr: 'Accord', zh: '香氣和弦',
    def: 'The overall scent impression created when several materials blend together.',
    example: 'Bergamot + oakmoss + labdanum + patchouli can create a chypre impression (teaching example).' },
  { id: 'formula', en: 'Formula', fr: 'Formule', zh: '配方',
    def: 'The full list of materials with their exact amounts. Perfumers usually keep real formulas private, so this site shows none.',
    example: 'Not shown here: this site never gives amounts or ratios.' },
  { id: 'modifier', en: 'Modifier', fr: 'Modificateur', zh: '修飾調',
    def: 'A material used to change how the whole accord behaves.',
    example: 'Pepper turns a soft rose slightly sharper.' }
];
