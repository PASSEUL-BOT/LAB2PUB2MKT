// Single shared UI state. The wheel (Chapter 2 and 5C), the guide, the radar, the map and the
// summary all read from this one object, so they can never disagree.
export const state = {
  route: 'ch1',
  ch1: { chosen: [] },
  ch3: { role: 'key', open: [] },
  wheel: { selected: [], q: '', filter: 'all', pair: null },
  famOpen: [],
  lab: { combo: [], fam: 'all', q: '', pair: null, node: null, edge: null, origin: null },
  lookup: { query: { brand: '', name: '', concentration: '', year: '' }, includeDemo: false, searched: false, result: null, open: null, explore: false }
};
