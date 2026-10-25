// DATASET for Explore Real Perfumes. Two kinds of records, never mixed up in the UI:
//
// 1. VERIFIED_PRODUCTS (isDemo: false): read on 25 Oct 2026 from the brand's own product
//    page. Only facts the page states are stored (names of notes, the family wording, the
//    concentration). Marketing text is NOT copied. Fields the page does not state are null,
//    which the UI shows as "Not available". Notes the page does not assign to top / heart /
//    base are kept in `unlabelled` instead of being guessed into a tier.
//
// 2. DEMO_PRODUCTS (isDemo: true): seeds written from the author's general knowledge. NOT
//    checked against any source, no URL, may be wrong. Labelled "Unverified" and hidden from
//    search unless the user switches them on. `notes: null` means "not available".
//
// Nothing here is a formula. Published notes are an impression, not an ingredient list.

const CHECKED = '2026-10-25';

function V(id, brand, name, concentration, aliases, publishedFamily, notes, source) {
  return {
    id, brand, name, concentration, year: null, perfumer: null, aliases,
    publishedFamily,               // wording used by the page itself (not by this site)
    listedAccords: null,           // these pages publish no structured accord list
    notes: { top: [], heart: [], base: [], unlabelled: [], ...notes },
    source: { status: 'official', lastChecked: CHECKED, ...source },
    isDemo: false
  };
}

export const VERIFIED_PRODUCTS = [
  V('chanel-no5-edp', 'Chanel', 'N°5', 'EDP', ['no 5', 'no5', 'number 5', 'n 5'],
    'Floral aldehyde',
    { top: ['Citrus'], unlabelled: ['May Rose', 'Jasmine', 'Vanilla'] },
    { label: 'Chanel product page: N°5 Eau de Parfum Spray, 100 ml (ref. 125530), India site',
      url: 'https://www.chanel.com/in/fragrance/p/125530/n5-eau-de-parfum-spray/',
      completeness: 'Partial. The page names the family, a citrus top and three other notes. It gives no release year, no perfumer and no top/heart/base split for most notes.' }),
  V('chanel-no5-eau-premiere-edp', 'Chanel', 'N°5 Eau Première', 'EDP', ['no 5 eau premiere', 'n 5 eau premiere', 'eau premiere', 'n°5 premiere'],
    'Aldehyde floral bouquet',
    { unlabelled: ['Ylang-Ylang', 'May Rose', 'Jasmine', 'Aldehydes', 'Vanilla', 'Musky notes'] },
    { label: 'Chanel product page: N°5 Eau Première, twist and spray refillable bottle (ref. 105117), India site',
      url: 'https://www.chanel.com/in/fragrance/p/105117/n5-eau-premiere-twist-and-spray-refillable-bottle-eau-de-parfum/',
      completeness: 'Partial. Notes are named in a description, with no top/heart/base split, release year or perfumer.' }),
  V('guerlain-shalimar-edp', 'Guerlain', 'Shalimar', 'EDP', ['shalimar eau de parfum'],
    null,
    { unlabelled: ['Flowers', 'Bergamot', 'Iris', 'Jasmine', 'Rose', 'Vanilla', 'Balsam notes', 'Tonka Bean'] },
    { label: 'Guerlain product page: Shalimar Eau de Parfum, refill, international English site',
      url: 'https://www.guerlain.com/int/en-int/p/shalimar-eau-de-parfum---refill-P012198.html',
      completeness: 'Partial. The page does not state a fragrance family, year or perfumer, and it does not assign notes to top, heart or base. The refill page was read, not the main bottle page.' }),
  V('guerlain-shalimar-edt', 'Guerlain', 'Shalimar', 'EDT', ['shalimar eau de toilette'],
    'Ambré (amber)',
    { unlabelled: ['Flowers', 'Bergamot', 'Iris', 'Jasmine', 'Rose', 'Vanilla', 'Balsam notes', 'Tonka Bean'] },
    { label: 'Guerlain product page (French): Shalimar Eau de Toilette, recharge, Belgian site',
      url: 'https://www.guerlain.com/be/fr-be/p/shalimar-eau-de-toilette---recharge-P012203.html',
      completeness: 'Partial. The page is in French; note names were translated into English by this site. It calls the perfume an amber fragrance. No year, perfumer or tier split.' }),
  V('penhaligons-blenheim-bouquet-edt', 'Penhaligon’s', 'Blenheim Bouquet (120th Anniversary)', 'EDT', ['blenheim bouquet', 'penhaligons', 'penhalligons'],
    null,
    { top: ['Lemon'], heart: ['Lavender'], base: ['Pine'] },
    { label: 'Penhaligon’s product page: Blenheim Bouquet (120th Anniversary), US English site',
      url: 'https://www.penhaligons.com/us/en/product/blenheim-bouquet-000000000065173449',
      completeness: 'Partial. One note per tier as listed. The page spells the heart note “Lavander”; it is stored here as Lavender. No family, year or perfumer was read.' }),
  V('hermes-terre-edt', 'Hermès', 'Terre d’Hermès', 'EDT', ['hermes', 'terre d hermes', 'terre dhermes'],
    'Woody, mineral (page wording: “A mineral, woody fragrance”; olfactory emotion “Spicy, Dry”)',
    { unlabelled: ['Grapefruit', 'Cedar', 'Flint'] },
    { label: 'Hermès product page: Terre d’Hermès Eau de toilette, hermes.cn English site',
      url: 'https://hermes.cn/cn/en/product/terre-d-hermes-eau-de-toilette-V107188VN',
      completeness: 'Partial. The page names three main raw materials with no top/heart/base split. It says the fragrance was created by Jean-Claude Ellena in 2006; the year and perfumer fields are left empty here because the page states them only in running text. The hermes.com US pages could not be opened from this workspace.' }),
  V('dior-sauvage-edt', 'Dior', 'Sauvage', 'EDT', ['christian dior', 'sauvage eau de toilette'],
    'Woody, citrus (page wording: “a woody and citrus eau de toilette”)',
    { unlabelled: ['Citrus', 'Bergamot', 'Sichuan Pepper', 'Ambroxan', 'Elemi'] },
    { label: 'Dior product page: Sauvage Eau de Toilette, international English site',
      url: 'https://www.dior.com/en_int/beauty/products/Y0685240-',
      completeness: 'Partial. Note names come from the descriptive text; the page gives no top/heart/base split. The ingredient list on the page (limonene, linalool…) is not treated as notes. Perfumer, year not stored.' }),
  V('dior-jadore-edp', 'Dior', 'J’adore Eau de Parfum', 'EDP', ['jadore', 'j adore', 'christian dior'],
    'Solar and floral (page subtitle: “Eau de Parfum - Solar and Floral Notes”)',
    { top: ['Ylang-Ylang'], heart: ['Damascus Rose'], base: ['Jasmine Grandiflorum', 'Jasmine Sambac'] },
    { label: 'Dior product page: J’adore Eau de Parfum, Indonesia English site',
      url: 'https://www.dior.com/en_id/beauty/products/j%E2%80%99adore-eau-de-parfum-Y0998031.html',
      completeness: 'Notes are split into three tiers on the page. No year or perfumer was read. The page text was read through an automatic summary, so check the link if a detail matters.' }),
  V('dior-jadore-edt', 'Dior', 'J’adore Eau de Toilette', 'EDT', ['jadore', 'j adore', 'christian dior'],
    'Floral and citrusy (page subtitle: “Floral and Citrusy Notes”)',
    { unlabelled: ['Blood Orange', 'Neroli', 'Damascus Rose'] },
    { label: 'Dior product page: J’adore Eau de Toilette, Norway English site',
      url: 'https://www.dior.com/en_no/beauty/products/jadore-eau-de-toilette-F361524609.html',
      completeness: 'Partial. Three notes named, with no top/heart/base split. No year or perfumer was read.' }),
  V('dior-jadore-parfum-deau', 'Dior', 'J’adore Parfum d’eau', 'Alcohol-free EDP', ['jadore', 'j adore', 'christian dior'],
    'Floral and fresh (page subtitle: “Floral and Fresh Notes”; “The water flower”)',
    { unlabelled: ['Neroli', 'Jasmine Sambac', 'Chinese Magnolia'] },
    { label: 'Dior product page: J’adore Parfum d’eau (alcohol-free), Norway English site',
      url: 'https://www.dior.com/en_no/beauty/products/jadore-parfum-deau-C099600980.html',
      completeness: 'Partial. Three notes named, with no top/heart/base split. No year or perfumer was read.' }),
  V('dior-jadore-infinissime-edp', 'Dior', 'J’adore Eau de Parfum Infinissime', 'EDP', ['jadore', 'j adore', 'christian dior'],
    'Not stated as a family on the page',
    { top: ['Bergamot', 'Blood Orange'], heart: ['Centifolia Rose', 'Jasmine Sambac', 'Ylang-Ylang', 'Tuberose'], base: ['Sandalwood'] },
    { label: 'Dior product page: J’adore Eau de Parfum Infinissime, Indonesia English site',
      url: 'https://www.dior.com/en_id/beauty/products/jadore-eau-de-parfum-infinissime-Y0996116.html',
      completeness: 'Notes are split into top, heart and base on the page. No family wording, year or perfumer was read.' }),
  V('dior-jadore-intense', 'Dior', 'J’adore Intense', 'Parfum', ['jadore', 'j adore', 'christian dior'],
    'Floral and honeyed (page subtitle: “Floral and Honeyed Notes”)',
    { unlabelled: ['Ylang-Ylang', 'Rose', 'Jasmine', 'Apricot', 'Sandalwood', 'Vanilla'] },
    { label: 'Dior product page: J’adore Intense, Norway English site',
      url: 'https://www.dior.com/en_no/beauty/products/jadore-intense-E000000713.html',
      completeness: 'Partial. Notes come from a descriptive paragraph, with no top/heart/base split. Apricot is described as an accent. No year or perfumer was read.' }),
  V('dior-jadore-lor', 'Dior', 'J’adore L’Or', 'Perfume essence', ['jadore', 'j adore', 'christian dior'],
    'Solar and floral (page subtitle: “Perfume Essence - Solar and Floral Notes”)',
    { unlabelled: ['Orange Blossom', 'Jasmine Grandiflorum', 'Centifolia Rose'] },
    { label: 'Dior product page: L’Or de J’adore, Norway English site',
      url: 'https://www.dior.com/en_no/beauty/products/lor-de-jadore-C099700827.html',
      completeness: 'Partial. Three absolutes named, with no top/heart/base split. No year or perfumer was read.' }),
  V('dior-jadore-extrait', 'Dior', 'J’adore Extrait de Parfum', 'Extrait', ['jadore', 'j adore', 'christian dior'],
    'Intense and floral (page subtitle: “Intense and Floral Notes”)',
    { top: ['Ylang-Ylang'], base: ['Jasmine Sambac'], unlabelled: ['Rose de Mai', 'Damascus Rose'] },
    { label: 'Dior product page: J’adore Extrait de Parfum, Norway English site',
      url: 'https://www.dior.com/en_no/beauty/products/jadore-extrait-de-parfum-F081515000.html',
      completeness: 'Partial. The page places ylang-ylang in the top and jasmine sambac in the base; no heart note is named. No year or perfumer was read.' }),
  V('diptyque-philosykos-edt', 'Diptyque', 'Philosykos', 'EDT', ['philosykos', 'diptique', 'dyptique'],
    'Aromatic, woody (retailer category)',
    { top: ['Fig', 'Fig Leaf'], heart: ['Fig Tree'], base: ['Cedar', 'Musk'] },
    { status: 'retailer', label: 'Notino UK retailer page: Diptyque Philosykos Eau de Toilette (not the brand’s own site)',
      url: 'https://www.notino.co.uk/diptyque/philosykos-eau-de-toilette-unisex/p-545498/',
      completeness: 'Retailer information only. No official Diptyque page was read, so the note list may differ from the brand’s own.' }),
  V('jomalone-english-pear-freesia-cologne', 'Jo Malone London', 'English Pear & Freesia', 'EDC', ['jo malone', 'jo malon', 'english pear', 'pear and freesia'],
    'Floral (retailer category)',
    { unlabelled: ['King William Pear', 'Freesia', 'Patchouli'] },
    { status: 'retailer', label: 'Sephora US retailer page: English Pear & Freesia Cologne with Rose, 100 ml (not the brand’s own site)',
      url: 'https://www.sephora.com/product/english-pear-freesia-cologne-P417180',
      completeness: 'Retailer information only (“Key Notes”). The retailer page lists no rose note although the title says “with Rose”. No official Jo Malone page was read.' }),
  V('lelabo-santal33-edp', 'Le Labo', 'Santal 33', 'EDP', ['santal33', 'santal 33', 'le labo'],
    null,
    { top: ['Sandalwood', 'Virginia Cedar'], heart: ['Cardamom', 'Violet', 'Papyrus'], base: ['Leather', 'Amber', 'Iris'] },
    { status: 'retailer', label: 'Harrods retailer page: Le Labo Santal 33 Eau de Parfum 50 ml (not the brand’s own site)',
      url: 'https://harrods.com/en-gb/p/le-labo-santal-33-eau-de-parfum-50ml-000000000006491728',
      completeness: 'Retailer information only. The retailer’s tier split is unusual (sandalwood as a top note) and is kept as published. The page misspells some names; they are corrected here. No official Le Labo page was read.' }),
  V('millerharris-tea-tonique-edp', 'Miller Harris', 'Tea Tonique', 'EDP', ['tea tonique', 'miller haris'],
    null,
    { top: ['Bergamot', 'Petit Grain', 'Lemon'], heart: ['Smoky Tea', 'Nutmeg'], base: ['Mate Absolute', 'Birch Tar', 'Musk'] },
    { status: 'retailer', label: 'Escentual retailer page: Miller Harris Tea Tonique Eau de Parfum (not the brand’s own site)',
      url: 'https://www.escentual.com/miller-harris/editions/tea-tonique/millerharris087/',
      completeness: 'Retailer information only. No formal family is stated (the page says “citrus-aromatic”). No official Miller Harris page was read.' })
];

const DEMO = 'Demo seed (not checked against a source)';

function P(id, brand, name, concentration, year, perfumer, notes, aliases = []) {
  return {
    id, brand, name, concentration, year, perfumer, notes, aliases,
    listedAccords: null,           // no accord list is stored for demo records
    publishedFamily: null,         // no family is published for demo records
    source: { label: DEMO, url: null, status: 'unverified', lastChecked: null,
              completeness: notes ? 'partial: identity + a short note list' : 'identity only' },
    isDemo: true
  };
}

export const DEMO_PRODUCTS = [
  P('chanel-no5-edt', 'Chanel', 'N°5', 'EDT', null, null, null, ['no 5', 'no5', 'number 5', 'n 5']),
  P('chanel-no5-parfum', 'Chanel', 'N°5', 'Parfum', 1921, 'Ernest Beaux', null, ['no 5', 'no5', 'number 5', 'n 5']),
  P('guerlain-mitsouko', 'Guerlain', 'Mitsouko', null, 1919, 'Jacques Guerlain',
    { top: ['Bergamot'], heart: ['Peach', 'Jasmine', 'Rose'], base: ['Oakmoss', 'Patchouli', 'Labdanum'] }),
  P('dg-lightblue-edt', 'Dolce & Gabbana', 'Light Blue', 'EDT', 2001, 'Olivier Cresp',
    { top: ['Sicilian Lemon', 'Apple', 'Cedar', 'Bellflower'], heart: ['Jasmine', 'White Rose', 'Bamboo'], base: ['Cedar', 'Musk', 'Amber'] },
    ['dolce gabbana', 'd&g', 'dg']),
  P('dg-lightblue-intense-edp', 'Dolce & Gabbana', 'Light Blue Eau Intense', 'EDP', 2017, null, null, ['dolce gabbana', 'd&g', 'dg']),
  P('dior-sauvage-edp', 'Dior', 'Sauvage', 'EDP', 2018, null, null, ['christian dior']),
  P('ck-one-edt', 'Calvin Klein', 'CK One', 'EDT', 1994, 'Alberto Morillas, Harry Fremont',
    { top: ['Bergamot', 'Lemon', 'Cardamom'], heart: ['Jasmine', 'Violet', 'Rose'], base: ['Musk', 'Sandalwood', 'Cedar', 'Amber'] },
    ['ck1', 'ck 1']),
  P('4711-original-edc', '4711', 'Original Eau de Cologne', 'EDC', null, null,
    { top: ['Lemon', 'Orange', 'Bergamot'], heart: ['Neroli', 'Lavender', 'Rosemary'], base: [] },
    ['original cologne', 'eau de cologne'])
];

export const PRODUCTS = [...VERIFIED_PRODUCTS, ...DEMO_PRODUCTS];

// Educational mapping of published note names -> teaching ingredients / families.
// basis 'direct' = the same material; 'approx' = nearest teaching equivalent (family-level
// or similar material). Notes not listed here are shown as "not mapped".
export const NOTE_MAP = {
  'citrus': { fam: 'citrus', basis: 'approx' },
  'blood orange': { fam: 'citrus', basis: 'approx' },
  'damascus rose': { ing: 'rose', basis: 'direct' },
  'centifolia rose': { ing: 'rose', basis: 'direct' },
  'rose de mai': { ing: 'rose', basis: 'direct' },
  'jasmine grandiflorum': { ing: 'jasmine', basis: 'direct' },
  'jasmine sambac': { ing: 'jasmine', basis: 'direct' },
  'orange blossom': { ing: 'orange_blossom', basis: 'direct' },
  'chinese magnolia': { fam: 'whitefloral', basis: 'approx' },
  'tuberose': { ing: 'tuberose', basis: 'direct' },
  'apricot': { ing: 'peach', basis: 'approx' },
  'may rose': { ing: 'rose', basis: 'direct' },
  'balsam notes': { fam: 'balsamic', basis: 'approx' },
  'musky notes': { ing: 'white_musk', basis: 'approx' },
  'bergamot': { ing: 'bergamot', basis: 'direct' },
  'calabrian bergamot': { ing: 'bergamot', basis: 'direct' },
  'lemon': { ing: 'lemon', basis: 'direct' },
  'sicilian lemon': { ing: 'lemon', basis: 'direct' },
  'grapefruit': { ing: 'grapefruit', basis: 'direct' },
  'orange': { fam: 'citrus', basis: 'approx' },
  'neroli': { ing: 'orange_blossom', basis: 'approx' },
  'apple': { ing: 'apple', basis: 'direct' },
  'peach': { ing: 'peach', basis: 'direct' },
  'jasmine': { ing: 'jasmine', basis: 'direct' },
  'rose': { ing: 'rose', basis: 'direct' },
  'white rose': { ing: 'rose', basis: 'approx' },
  'ylang-ylang': { fam: 'whitefloral', basis: 'approx' },
  'lily of the valley': { ing: 'muguet', basis: 'direct' },
  'iris': { ing: 'iris', basis: 'direct' },
  'violet': { ing: 'violet', basis: 'direct' },
  'geranium': { fam: 'floral', basis: 'approx' },
  'pelargonium': { fam: 'floral', basis: 'approx' },
  'pepper': { ing: 'black_pepper', basis: 'approx' },
  'sichuan pepper': { ing: 'black_pepper', basis: 'approx' },
  'pink pepper': { ing: 'black_pepper', basis: 'approx' },
  'cardamom': { ing: 'cardamom', basis: 'direct' },
  'lavender': { ing: 'lavender', basis: 'direct' },
  'rosemary': { ing: 'rosemary', basis: 'direct' },
  'vanilla': { ing: 'vanilla', basis: 'direct' },
  'tonka bean': { ing: 'tonka', basis: 'direct' },
  'sandalwood': { ing: 'sandalwood', basis: 'direct' },
  'cedar': { ing: 'cedarwood', basis: 'direct' },
  'virginia cedar': { ing: 'cedarwood', basis: 'direct' },
  'smoky tea': { ing: 'tea', basis: 'approx' },
  'fig': { fam: 'green', basis: 'approx' },
  'fig leaf': { fam: 'green', basis: 'approx' },
  'fig tree': { fam: 'green', basis: 'approx' },
  'pear': { fam: 'fruity', basis: 'approx' },
  'king william pear': { fam: 'fruity', basis: 'approx' },
  'nutmeg': { fam: 'spicy', basis: 'approx' },
  'petit grain': { fam: 'citrus', basis: 'approx' },
  'elemi': { fam: 'balsamic', basis: 'approx' },
  'pine': { fam: 'woody', basis: 'approx' },
  'vetiver': { ing: 'vetiver', basis: 'direct' },
  'patchouli': { ing: 'patchouli', basis: 'direct' },
  'oakmoss': { ing: 'oakmoss', basis: 'direct' },
  'labdanum': { ing: 'labdanum', basis: 'direct' },
  'ambroxan': { ing: 'ambroxan', basis: 'direct' },
  'amber': { fam: 'amber', basis: 'approx' },
  'musk': { ing: 'white_musk', basis: 'approx' },
  'benzoin': { ing: 'benzoin', basis: 'direct' },
  'incense': { ing: 'frankincense', basis: 'approx' },
  'leather': { ing: 'leather_note', basis: 'direct' }
};
