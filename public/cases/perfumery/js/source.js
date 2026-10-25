// Replaceable data-access layer for Explore Real Perfumes.
//
// Any future source (an API, a licensed dataset, a brand page importer) implements the
// same two async methods: search(query) and getById(id), and is added to SOURCES.
// Today only the LOCAL DATASET source is connected (a small snapshot typed in by hand from
// official product pages, plus optional unverified demo seeds). No external service is called.

import { PRODUCTS } from './data/products.js';

export const CONCENTRATIONS = ['EDC', 'EDT', 'EDP', 'Parfum'];

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9& ]+/g, ' ').replace(/\s+/g, ' ').trim();

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// Score a text field against a query. Returns {score 0..1, kind}
function fieldScore(query, texts) {
  const q = norm(query);
  if (!q) return { score: 1, kind: 'none' };
  let best = { score: 0, kind: 'none' };
  for (const raw of texts) {
    const t = norm(raw);
    if (!t) continue;
    if (t === q) return { score: 1, kind: 'exact' };
    if (t.includes(q) || q.includes(t)) { if (best.score < 0.85) best = { score: 0.85, kind: 'partial' }; continue; }
    const qt = q.split(' '), tt = t.split(' ');
    let ok = 0;
    for (const w of qt) {
      const hit = tt.some(x => x.startsWith(w) || (x.length >= 3 && w.startsWith(x)) || levenshtein(x, w) <= Math.max(1, Math.floor(w.length / 4)));
      if (hit) ok++;
    }
    const s = ok / qt.length;
    if (s >= 0.99 && best.score < 0.7) best = { score: 0.7, kind: 'fuzzy' };
    else if (s >= 0.5 && best.score < 0.4) best = { score: 0.4, kind: 'weak' };
  }
  return best;
}

export class LocalDatasetSource {
  constructor() {
    this.id = 'local-dataset';
    this.label = 'Local dataset (official-page snapshot + optional demo seeds)';
    this.records = PRODUCTS;
  }
  async getById(id) { return this.records.find(p => p.id === id) || null; }

  // includeDemo=false (default): only records read from an official page are searched.
  async search({ brand = '', name = '', concentration = '', year = '', includeDemo = false } = {}) {
    const pool = includeDemo ? this.records : this.records.filter(p => !p.isDemo);
    const scored = pool.map(p => {
      const b = fieldScore(brand, [p.brand, ...(p.aliases || [])]);
      const n = fieldScore(name, [p.name, ...(p.aliases || []), `${p.brand} ${p.name}`]);
      return { p, b, n };
    });
    const hasText = norm(brand) || norm(name);
    const hits = [], weak = [];
    let hiddenByFilter = 0;
    for (const { p, b, n } of scored) {
      if (hasText && (b.score === 0 || n.score === 0)) continue;
      const strength = (b.score + n.score) / 2;
      const strong = (!norm(brand) || b.score >= 0.7) && (!norm(name) || n.score >= 0.7);
      const entry = { product: p, strength, kind: strength >= 0.99 ? 'exact' : strong ? (b.kind === 'fuzzy' || n.kind === 'fuzzy' ? 'fuzzy' : 'partial') : 'weak' };
      if (!strong) { weak.push(entry); continue; }
      if (concentration) {
        if (!p.concentration) { hiddenByFilter++; continue; }
        if (norm(p.concentration) !== norm(concentration)) continue;
      }
      if (year) {
        if (!p.year) { hiddenByFilter++; continue; }
        if (String(p.year) !== String(year)) continue;
      }
      hits.push(entry);
    }
    hits.sort((x, y) => y.strength - x.strength || x.product.brand.localeCompare(y.product.brand) || x.product.name.localeCompare(y.product.name) || String(x.product.concentration).localeCompare(String(y.product.concentration)));
    // "Did you mean": closest weak matches, only when there are no real hits.
    let suggestions = [];
    if (!hits.length) {
      suggestions = weak.sort((x, y) => y.strength - x.strength).slice(0, 3).map(w => w.product);
      if (!suggestions.length && hasText) {
        const all = pool.map(p => ({ p, d: Math.min(levenshtein(norm(name), norm(p.name)), levenshtein(norm(brand), norm(p.brand))) }))
          .sort((x, y) => x.d - y.d).slice(0, 3);
        suggestions = all.map(x => x.p);
      }
    }
    return { sourceId: this.id, hits, suggestions, hiddenByFilter, totalRecords: pool.length, demoHidden: includeDemo ? 0 : this.records.length - pool.length };
  }
}
export const LocalDemoSource = LocalDatasetSource;   // old name, kept for compatibility

export const SOURCES = [new LocalDatasetSource()];

export async function searchAll(query) {
  const results = await Promise.all(SOURCES.map(s => s.search(query)));
  return {
    hits: results.flatMap(r => r.hits),
    suggestions: results.flatMap(r => r.suggestions),
    hiddenByFilter: results.reduce((a, r) => a + r.hiddenByFilter, 0),
    totalRecords: results.reduce((a, r) => a + r.totalRecords, 0),
    demoHidden: results.reduce((a, r) => a + (r.demoHidden || 0), 0)
  };
}

export async function getProduct(id) {
  for (const s of SOURCES) { const p = await s.getById(id); if (p) return p; }
  return null;
}

// Honest status of candidate data sources (what was actually checked on 25 Oct 2026).
export const SOURCE_STATUS = [
  { name: 'Local database: brand pages read by hand (Chanel, Guerlain, Dior, Hermès, Penhaligon’s official; Diptyque, Jo Malone, Le Labo, Miller Harris via retailer pages)', state: 'snapshot', detail: 'Eleven product pages were opened and read by hand on 25 Oct 2026 (seven official, four retailer, each labelled); only the family wording, concentration and note names were typed into this site, with the page URL. This is a frozen snapshot, not a live connection, and the pages may change. No images, logos or marketing text are copied. Whether a brand allows reuse of its note lists was not confirmed: check each brand’s terms before publishing this site.' },
  { name: 'Local demo seeds (8 records)', state: 'hidden by default', detail: 'Written from general knowledge, not checked against any source, no URL. Hidden unless you switch them on, and always labelled Unverified.' },
  { name: 'Fragella API', state: 'not connected', detail: 'A third-party perfume API. Its terms say an account and API key are required, forbid reselling the data as a standalone product and restrict caching large portions of it unless your plan allows it. Prices, free-tier limits and attribution rules were not confirmed. Not wired in.' },
  { name: 'Fragrances of the World', state: 'not used', detail: 'Subscription database. Its legal terms do not license copying the database, forbid entering its material into another database and forbid sharing it with AI systems. Not used.' },
  { name: 'Scento', state: 'not connected', detail: 'Publishes articles about perfume databases. Whether it offers a usable API, and under what terms, was not confirmed. Not used.' },
  { name: 'Fragrantica / Parfumo', state: 'not used', detail: 'No official open API was confirmed. Copying their data is not assumed to be permitted.' }
];
