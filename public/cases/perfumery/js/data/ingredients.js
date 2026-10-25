// Teaching ingredients. Profile values (0-5) are ESTIMATED TEACHING VALUES set by the
// author of this build from general perfumery descriptions. They are not measurements,
// not sourced from a lab, and cannot predict a real blend.
// Profile order: [fresh, sweet, floral, woody, spicy, powdery, intensity]

const RAW = [
  // id, family, en, fr, zh, descriptors, profile, note
  ['bergamot', 'citrus', 'Bergamot', 'Bergamote', '佛手柑', ['fresh', 'light'], [5, 1, 1, 0, 0, 0, 2], 'Sparkling, slightly floral peel. Very volatile: it fades quickly.'],
  ['lemon', 'citrus', 'Lemon', 'Citron', '檸檬', ['fresh', 'light'], [5, 1, 0, 0, 0, 0, 2], 'Sharp, clean and zesty. Lifts a blend but does not last.'],
  ['grapefruit', 'citrus', 'Grapefruit', 'Pamplemousse', '葡萄柚', ['fresh', 'light'], [5, 1, 0, 0, 1, 0, 2], 'Juicy with a slightly bitter edge.'],

  ['lavender', 'aromatic', 'Lavender', 'Lavande', '薰衣草', ['fresh', 'green', 'dry'], [4, 0, 2, 1, 1, 1, 3], 'Herbal-floral and clean.'],
  ['rosemary', 'aromatic', 'Rosemary', 'Romarin', '迷迭香', ['fresh', 'green', 'spicy'], [4, 0, 0, 1, 2, 0, 3], 'Camphor-like, herbal and bright.'],
  ['mint', 'aromatic', 'Mint', 'Menthe', '薄荷', ['fresh', 'green'], [5, 0, 0, 0, 1, 0, 3], 'Cool and sharp; a strong sense of freshness.'],

  ['violet_leaf', 'green', 'Violet Leaf', 'Feuille de violette', '紫羅蘭葉', ['green', 'fresh'], [3, 0, 1, 0, 0, 0, 2], 'Cucumber-like, watery green.'],
  ['cut_grass', 'green', 'Cut Grass', 'Herbe coupée', '青草', ['green', 'fresh'], [4, 0, 0, 0, 0, 0, 2], 'Just-mown lawn.'],
  ['galbanum', 'green', 'Galbanum', 'Galbanum', '白松香', ['green', 'dry'], [3, 0, 0, 1, 1, 0, 4], 'Sharp, bitter, resinous-green. Strong.'],
  ['tea', 'green', 'Green Tea', 'Thé vert', '綠茶', ['light', 'dry', 'green'], [3, 1, 0, 0, 0, 0, 1], 'Delicate, slightly bitter and clean.'],

  ['calone', 'aquatic', 'Calone', 'Calone', '西瓜酮', ['fresh', 'light'], [5, 1, 0, 0, 0, 0, 2], 'A synthetic molecule with a watery, melon-like, sea-breeze feel.'],
  ['marine_note', 'aquatic', 'Marine Note', 'Note marine', '海洋調', ['fresh', 'dry'], [4, 0, 0, 1, 0, 0, 2], 'Salty sea air.'],

  ['apple', 'fruity', 'Apple', 'Pomme', '蘋果', ['fresh', 'fruity'], [4, 3, 0, 0, 0, 0, 2], 'Crisp and juicy.'],
  ['peach', 'fruity', 'Peach', 'Pêche', '水蜜桃', ['fruity', 'sweet', 'warm'], [1, 4, 1, 0, 0, 1, 3], 'Soft, velvety and creamy fruit.'],
  ['blackcurrant', 'fruity', 'Blackcurrant', 'Cassis', '黑醋栗', ['fruity', 'green'], [2, 3, 0, 0, 1, 0, 4], 'Tart, juicy, slightly green. Strong.'],

  ['rose', 'floral', 'Rose', 'Rose', '玫瑰', ['floral'], [1, 2, 5, 0, 1, 1, 3], 'The classic flower: soft, slightly sweet, sometimes a little spicy.'],
  ['peony', 'floral', 'Peony', 'Pivoine', '牡丹', ['floral', 'fresh', 'light'], [3, 1, 4, 0, 0, 0, 2], 'Fresh, airy and watery petals.'],
  ['muguet', 'floral', 'Lily of the Valley', 'Muguet', '鈴蘭', ['floral', 'fresh', 'light'], [4, 1, 4, 0, 0, 0, 2], 'Clean, green-floral. Usually recreated with synthetic materials.'],

  ['jasmine', 'whitefloral', 'Jasmine', 'Jasmin', '茉莉', ['floral', 'sweet', 'heavy', 'warm'], [0, 3, 5, 0, 0, 0, 5], 'Heady and rich. Very strong, so it can overpower.'],
  ['orange_blossom', 'whitefloral', 'Orange Blossom', 'Fleur d’oranger', '橙花', ['floral', 'sweet'], [2, 3, 4, 0, 0, 0, 3], 'Honeyed, slightly green white flower.'],
  ['tuberose', 'whitefloral', 'Tuberose', 'Tubéreuse', '晚香玉', ['floral', 'heavy', 'sweet'], [0, 3, 5, 0, 1, 0, 5], 'Creamy, intense and heady.'],

  ['iris', 'powdery', 'Iris', 'Iris', '鳶尾', ['powdery', 'dry', 'earthy'], [1, 1, 2, 1, 0, 5, 3], 'Cool, rooty powder.'],
  ['violet', 'powdery', 'Violet', 'Violette', '紫羅蘭', ['floral', 'powdery', 'light'], [2, 2, 3, 0, 0, 4, 2], 'Soft, sugary-powdery petals.'],
  ['heliotrope', 'powdery', 'Heliotrope', 'Héliotrope', '天芥菜', ['powdery', 'sweet', 'warm'], [0, 4, 2, 0, 0, 4, 3], 'Almond-vanilla powder.'],

  ['black_pepper', 'spicy', 'Black Pepper', 'Poivre noir', '黑胡椒', ['spicy', 'dry'], [2, 0, 0, 1, 5, 0, 3], 'Dry, sharp and tingly.'],
  ['cardamom', 'spicy', 'Cardamom', 'Cardamome', '小豆蔻', ['spicy', 'fresh'], [3, 1, 0, 1, 4, 0, 3], 'Fresh, aromatic spice.'],
  ['cinnamon', 'spicy', 'Cinnamon', 'Cannelle', '肉桂', ['spicy', 'warm', 'sweet'], [0, 3, 0, 1, 5, 0, 4], 'Warm, sweet-hot spice. Strong.'],

  ['vanilla', 'gourmand', 'Vanilla', 'Vanille', '香草', ['sweet', 'warm'], [0, 5, 0, 0, 0, 1, 3], 'Creamy, sweet and comforting.'],
  ['tonka', 'gourmand', 'Tonka Bean', 'Fève tonka', '零陵香豆', ['sweet', 'warm'], [0, 4, 0, 1, 1, 2, 3], 'Sweet hay, almond and vanilla notes.'],

  ['cedarwood', 'woody', 'Cedarwood', 'Cèdre', '雪松', ['woody', 'dry'], [1, 0, 0, 5, 0, 1, 3], 'Pencil shavings: dry and straight.'],
  ['sandalwood', 'woody', 'Sandalwood', 'Santal', '檀香', ['woody', 'warm'], [0, 2, 0, 5, 0, 1, 3], 'Creamy, soft and smooth wood.'],

  ['oakmoss', 'mossy', 'Oakmoss', 'Mousse de chêne', '橡木苔', ['earthy', 'green', 'dry'], [1, 0, 0, 2, 0, 0, 4], 'Damp, bitter forest floor. Its use is restricted in many products because of allergen rules.'],

  ['labdanum', 'amber', 'Labdanum', 'Labdanum', '岩玫瑰脂', ['warm', 'heavy'], [0, 3, 0, 2, 1, 0, 4], 'Sticky, warm resin.'],
  ['ambroxan', 'amber', 'Ambroxan', 'Ambroxan', '龍涎香醚', ['woody', 'warm', 'dry'], [1, 1, 0, 3, 0, 0, 4], 'A synthetic molecule with a woody, ambergris-like, mineral glow.'],

  ['white_musk', 'musk', 'White Musk', 'Musc blanc', '白麝香', ['light', 'powdery'], [1, 1, 0, 0, 0, 2, 2], 'Clean, soft, skin-like.'],

  ['benzoin', 'balsamic', 'Benzoin', 'Benjoin', '安息香', ['sweet', 'warm'], [0, 4, 0, 1, 1, 1, 3], 'Vanilla-like sweet resin.'],
  ['frankincense', 'balsamic', 'Frankincense', 'Oliban', '乳香', ['smoky', 'dry'], [1, 0, 0, 2, 2, 0, 3], 'Lemony, smoky resin used as incense.'],

  ['birch_tar', 'smoky', 'Birch Tar', 'Goudron de bouleau', '樺木焦油', ['smoky', 'dry', 'heavy'], [0, 0, 0, 3, 1, 0, 5], 'Campfire-smoky and very strong.'],

  ['leather_note', 'leather', 'Leather Note', 'Note cuir', '皮革調', ['dry', 'smoky'], [0, 0, 0, 2, 1, 0, 4], 'Dry, supple and slightly smoky.'],

  ['patchouli', 'earthy', 'Patchouli', 'Patchouli', '廣藿香', ['earthy', 'woody', 'heavy'], [0, 1, 0, 3, 1, 0, 4], 'Dark, earthy and woody. Strong.'],
  ['vetiver', 'earthy', 'Vetiver', 'Vétiver', '岩蘭草', ['earthy', 'dry', 'woody'], [1, 0, 0, 4, 0, 0, 3], 'Rooty, smoky-dry grass root.']
];

export const DIMS = ['fresh', 'sweet', 'floral', 'woody', 'spicy', 'powdery', 'intensity'];

export const INGREDIENTS = RAW.map(([id, family, en, fr, zh, desc, p, note]) => ({
  id, family, en, fr, zh, desc,
  profile: Object.fromEntries(DIMS.map((d, i) => [d, p[i]])),
  note,
  status: 'Estimated teaching profile'
}));

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]));
