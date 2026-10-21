/* coach.js - Mistake Detective + AI Coach.  Pure functions: they only look at the measured
 * test results, the picture metadata and the current training set.
 *
 * Language rule: things we MEASURED are stated as facts.  Reasons are always hedged
 * ("One possible reason is ...") because an AI cannot tell us why it made a mistake,
 * and no advice promises that a picture will fix an error.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.OAE = root.OAE || {}; root.OAE.Coach = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var TAGS = ['transparent', 'camouflage', 'low_light', 'distant', 'unusual_angle', 'partially_hidden', 'similar_shape'];
  var MAX_RECS = 6, MAX_PICKS = 6;

  function nice(tax, leaf) { return tax.leaves[leaf] ? tax.leaves[leaf].label.toLowerCase() : String(leaf); }
  function plural(n, a, b) { return n === 1 ? a : (b || a + 's'); }
  function clsLabel(level, id) { return id === 'unsure' ? 'UNSURE' : (level.cls[id] ? level.cls[id].label : id); }

  /** Child-friendly explanation for one wrong prediction. Hedged on purpose. */
  function explainError(ctx, it) {
    var tax = ctx.taxonomy, leaf = tax.leaves[it.leaf], tagText = tax.tags || {}, level = ctx.level;
    var clue = leaf ? leaf.fact : '';
    if (it.expected === 'unsure') clue = 'The AI was never taught this kind of picture, so the best answer is UNSURE. ' + (leaf ? leaf.fact : '');
    else if (level.cls[it.expected] && level.cls[it.expected].fact && (it.expected !== 'animal' && it.expected !== 'trash')) clue = (level.cls[it.expected].fact) + ' ' + clue;
    var reason = null;
    var tags = (it.tags || []).filter(function (t) { return tagText[t]; });
    var predLook = leaf && (leaf.lookalikes || []).some(function (lk) { var L = tax.leaves[lk]; return L && level.classOf && L.group === it.pred; });
    if (tags.length) reason = 'One possible reason is that this picture has a tricky part. ' + tagText[tags[0]];
    else if (predLook) reason = 'One possible reason is that a ' + nice(tax, it.leaf) + ' can look like something in the ' + clsLabel(level, it.pred) + ' group.';
    else if (ctx.trainCountByLeaf && (ctx.trainCountByLeaf[it.leaf] || 0) < 4) reason = 'One possible reason is that the AI saw only ' + (ctx.trainCountByLeaf[it.leaf] || 0) + ' ' + nice(tax, it.leaf) + ' ' + plural(ctx.trainCountByLeaf[it.leaf] || 0, 'picture') + ' while learning.';
    else reason = 'One possible reason is that the AI looked at colors or the background instead of the shape of the animal.';
    return { clue: clue.trim(), reason: reason };
  }

  function pick(pool, leaves, tags, taken, limit) {
    var want = {}, out = [];
    leaves.forEach(function (l) { want[l] = true; });
    var list = pool.filter(function (p) { return want[p.leaf] && !taken[p.id]; });
    list.sort(function (a, b) {
      var sa = tags.length ? (tags.some(function (t) { return a.tags.indexOf(t) >= 0; }) ? 0 : 1) : (a.tags.length ? 1 : 0);
      var sb = tags.length ? (tags.some(function (t) { return b.tags.indexOf(t) >= 0; }) ? 0 : 1) : (b.tags.length ? 1 : 0);
      return sa - sb || (a.id < b.id ? -1 : 1);
    });
    for (var i = 0; i < list.length && out.length < limit; i++) { out.push(list[i].id); taken[list[i].id] = true; }
    return out;
  }

  function analyze(ctx) {
    var level = ctx.level, tax = ctx.taxonomy, items = ctx.items, tagNames = ctx.tagNames, hints = ctx.tagImageHint;
    var wrong = items.filter(function (it) { return it.expected !== it.pred; });
    var total = items.length, overallRate = total ? wrong.length / total : 0;
    var trainByLeaf = {}, trainByTag = {}, trainByClass = {}, mislabeled = [];
    ctx.trainEntries.forEach(function (e) {
      if (e.leaf) trainByLeaf[e.leaf] = (trainByLeaf[e.leaf] || 0) + (e.trueClass == null || e.label === e.trueClass ? 1 : 0);
      (e.tags || []).forEach(function (t) { trainByTag[t] = (trainByTag[t] || 0) + 1; });
      trainByClass[e.label] = (trainByClass[e.label] || 0) + 1;
      if (e.trueClass != null && e.label !== e.trueClass) mislabeled.push(e);
    });
    ctx.trainCountByLeaf = trainByLeaf;

    var detective = [], recs = [], taken = {};
    ctx.trainEntries.forEach(function (e) { taken[e.id] = true; });

    // ---------- Mistake Detective: patterns (facts first, reasons hedged)
    var tagStats = {};
    items.forEach(function (it) { (it.tags || []).forEach(function (t) { var o = tagStats[t] = tagStats[t] || { total: 0, wrong: 0 }; o.total++; if (it.expected !== it.pred) o.wrong++; }); });
    var standout = [];
    TAGS.forEach(function (t) {
      var s = tagStats[t]; if (!s || !s.wrong) return;
      var rate = s.wrong / s.total, strong = s.total >= 3 && rate >= overallRate + 0.15;
      if (strong) standout.push(t);
      detective.push({
        id: 'tag:' + t, kind: 'tag', strength: strong ? 'high' : 'low', tag: t, wrong: s.wrong, total: s.total,
        title: U_cap(tagNames[t] || t),
        measured: 'We measured: ' + s.wrong + ' of ' + s.total + ' pictures with ' + (tagNames[t] || t) + ' were wrong (' + Math.round(rate * 100) + '%). All test pictures: ' + Math.round(overallRate * 100) + '% wrong.',
        possible: 'One possible reason: ' + ((tax.tags && tax.tags[t]) || '') + ' The training set has ' + (trainByTag[t] || 0) + ' pictures like this.'
      });
    });
    var confs = ctx.topConfusions || [];
    confs.filter(function (c) { return c.count >= 2; }).slice(0, 3).forEach(function (c) {
      detective.push({
        id: 'pair:' + c.expected + '>' + c.pred, kind: 'pair', strength: 'high', title: clsLabel(level, c.expected) + ' mixed up with ' + clsLabel(level, c.pred),
        measured: 'We measured: ' + c.count + ' ' + clsLabel(level, c.expected) + ' pictures were called ' + clsLabel(level, c.pred) + '.',
        possible: 'One possible reason is that these two groups share a look, like a similar shape or color.'
      });
    });
    var sureWrong = wrong.filter(function (it) { return it.pred !== 'unsure' && it.conf >= 0.8; });
    if (sureWrong.length) detective.push({
      id: 'sure', kind: 'confidence', strength: 'low', title: 'Very sure, but wrong',
      measured: 'We measured: ' + sureWrong.length + ' wrong ' + plural(sureWrong.length, 'answer') + ' had a confidence of 80% or more.',
      possible: 'A high confidence number does not mean the AI is right. It only shows how strongly the AI leans toward its answer.'
    });
    var weakLeaves = {};
    wrong.forEach(function (it) { if (it.leaf && it.expected !== 'unsure') (weakLeaves[it.leaf] = weakLeaves[it.leaf] || []).push(it); });
    Object.keys(weakLeaves).forEach(function (leaf) {
      if ((trainByLeaf[leaf] || 0) < 4 && weakLeaves[leaf].length >= 1) detective.push({
        id: 'missing:' + leaf, kind: 'missing', strength: (trainByLeaf[leaf] || 0) === 0 ? 'high' : 'low', title: 'Missing examples: ' + nice(tax, leaf),
        measured: 'We measured: the AI missed ' + weakLeaves[leaf].length + ' ' + nice(tax, leaf) + ' ' + plural(weakLeaves[leaf].length, 'picture') + ' and the training set has ' + (trainByLeaf[leaf] || 0) + '.',
        possible: 'One possible reason is that the AI had too few ' + nice(tax, leaf) + ' pictures to learn from.'
      });
    });
    if (mislabeled.length) detective.push({
      id: 'labels', kind: 'labels', strength: 'high', title: 'Labels to check',
      measured: 'We measured: ' + mislabeled.length + ' training ' + plural(mislabeled.length, 'picture has', 'pictures have') + ' a label that is different from the library label.',
      possible: 'If a label is wrong, the AI learns the wrong lesson. Scientists always check their labels.'
    });
    var unknown = wrong.filter(function (it) { return it.expected === 'unsure'; });
    if (unknown.length) detective.push({
      id: 'unknown', kind: 'unknown', strength: 'high', title: 'Never-taught pictures',
      measured: 'We measured: ' + unknown.length + ' ' + plural(unknown.length, 'picture') + ' of animals the AI was never taught got a confident answer instead of UNSURE.',
      possible: 'An AI only knows what it was taught. It can still guess, even when it has never seen that kind of picture.'
    });

    // ---------- AI Coach: recommendations
    var weakList = Object.keys(weakLeaves).map(function (l) { return { leaf: l, errs: weakLeaves[l] }; })
      .sort(function (a, b) { return b.errs.length - a.errs.length || (a.leaf < b.leaf ? -1 : 1); });
    var leafTotals = {};
    items.forEach(function (it) { if (it.leaf) leafTotals[it.leaf] = (leafTotals[it.leaf] || 0) + 1; });

    weakList.forEach(function (w) {
      var tagCount = {};
      w.errs.forEach(function (e) { (e.tags || []).forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; }); });
      var tags = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; }).slice(0, 2);
      var cands = pick(ctx.pool, [w.leaf], tags, taken, MAX_PICKS);
      var name = nice(tax, w.leaf), n = trainByLeaf[w.leaf] || 0;
      recs.push({
        id: 'leaf:' + w.leaf, kind: 'leaf', priority: w.errs.length * 10 + (n === 0 ? 6 : n < 4 ? 3 : 0) + (tags.length ? 1 : 0),
        title: 'Add more ' + name + ' pictures' + (tags.length ? ', in different situations' : ''),
        weak: 'Weak spot: the AI got ' + w.errs.length + ' of ' + (leafTotals[w.leaf] || w.errs.length) + ' ' + name + ' test pictures wrong. The training set has ' + n + ' ' + name + ' ' + plural(n, 'picture') + '.',
        what: 'Add ' + name + ' pictures' + (tags.length ? ' with ' + tags.map(function (t) { return hints[t] || tagNames[t]; }).join(' and ') : ' from different angles, backgrounds, and light') + '.',
        may: 'Why it may help: new kinds of ' + name + ' pictures can show the AI more ways a ' + name + ' can look. This may help, but there is no promise.',
        how: cands.length ? 'How: press SHOW PICTURES, check that each label is right, then press ADD TO TRAINING.' : 'How: use IMPORT A PICTURE to add your own ' + name + ' picture, then choose the label ' + clsLabel(level, level.classOf ? classForLeaf(ctx, w.leaf) : '') + '.',
        candidates: cands, leaves: [w.leaf]
      });
    });

    // look-alike pairs: add both kinds so the AI can compare them
    confs.filter(function (c) { return c.count >= 2 && c.expected !== 'unsure' && c.pred !== 'unsure'; }).slice(0, 2).forEach(function (c) {
      var leavesA = {}, leavesB = {};
      wrong.forEach(function (it) { if (it.expected === c.expected && it.pred === c.pred && it.leaf) { leavesA[it.leaf] = 1; ((tax.leaves[it.leaf] || {}).lookalikes || []).forEach(function (lk) { var L = tax.leaves[lk]; if (L && ctx.classOfLeaf(lk) === c.pred) leavesB[lk] = 1; }); } });
      var errN = {}; wrong.forEach(function (it) { if (it.leaf) errN[it.leaf] = (errN[it.leaf] || 0) + 1; });
      var a = Object.keys(leavesA).sort(function (x, y) { return (errN[y] || 0) - (errN[x] || 0) || (x < y ? -1 : 1); }).slice(0, 3);
      var b = Object.keys(leavesB).sort(function (x, y) { return (errN[y] || 0) - (errN[x] || 0) || (x < y ? -1 : 1); }).slice(0, 3);
      if (!b.length) return;
      var cands = pick(ctx.pool, a.concat(b), [], taken, MAX_PICKS);
      recs.push({
        id: 'pair:' + c.expected + '>' + c.pred, kind: 'pair', priority: c.count * 10 - 1,
        title: 'Show the difference: ' + a.map(function (l) { return nice(tax, l); }).join(', ') + ' and ' + b.map(function (l) { return nice(tax, l); }).join(', '),
        weak: 'Weak spot: ' + c.count + ' ' + clsLabel(level, c.expected) + ' pictures were called ' + clsLabel(level, c.pred) + '.',
        what: 'Add pictures of both: ' + a.concat(b).map(function (l) { return nice(tax, l); }).join(', ') + '. Choose the right label for each.',
        may: 'Why it may help: seeing look-alikes side by side with correct labels may help the AI find what is different. No promise!',
        how: 'How: press SHOW PICTURES, check each label, then press ADD TO TRAINING.',
        candidates: cands, leaves: a.concat(b)
      });
    });

    standout.forEach(function (t) {
      var have = trainByTag[t] || 0;
      if (have >= 4) return;
      var leaves = weakList.length ? weakList.map(function (w) { return w.leaf; }) : Object.keys(leafTotals);
      var cands = pick(ctx.pool, leaves, [t], taken, MAX_PICKS);
      if (!cands.length) return;
      var s = tagStats[t];
      recs.push({
        id: 'tag:' + t, kind: 'tag', priority: s.wrong * 8 + (have === 0 ? 5 : 2),
        title: 'Add pictures with ' + (tagNames[t] || t),
        weak: 'Weak spot: ' + s.wrong + ' of ' + s.total + ' test pictures with ' + (tagNames[t] || t) + ' were wrong. The training set has ' + have + ' like this.',
        what: 'Add ' + (hints[t] || tagNames[t]) + '.',
        may: 'Why it may help: the AI can only learn tricky cases if it has seen some. This may help, but it is not guaranteed.',
        how: 'How: press SHOW PICTURES, check each label, then press ADD TO TRAINING.',
        candidates: cands, leaves: []
      });
    });

    if (mislabeled.length) recs.push({
      id: 'labels', kind: 'labels', priority: 60 + mislabeled.length,
      title: 'Check the labels',
      weak: 'Weak spot: ' + mislabeled.length + ' training ' + plural(mislabeled.length, 'picture has', 'pictures have') + ' a different label from the library.',
      what: 'Look at each picture and fix its label, or remove it.',
      may: 'Why it may help: the AI learns from labels. A wrong label teaches a wrong lesson.',
      how: 'How: open the training pictures list and press FIX or REMOVE.',
      candidates: [], leaves: [], fixIds: mislabeled.map(function (e) { return e.id; })
    });

    if (unknown.length) recs.push({
      id: 'unknown', kind: 'unknown', priority: unknown.length * 5,
      title: 'Teach new groups in Level 4',
      weak: 'Weak spot: ' + unknown.length + ' pictures of insects or spiders got a confident answer. The AI was not taught those groups here.',
      what: 'In Level 4 the AI also learns INSECTS and ARACHNIDS.',
      may: 'Why it may help: when an animal group is taught, the AI does not have to guess.',
      how: 'How: finish this level, then open Level 4 on the map.',
      candidates: [], leaves: []
    });

    var maxC = 0, minC = Infinity, minId = null;
    level.classIds.forEach(function (c) { var n = trainByClass[c] || 0; if (n > maxC) maxC = n; if (n < minC) { minC = n; minId = c; } });
    if (minId && maxC > 0 && minC < maxC * 0.4 && level.classIds.length > 1) {
      var leaves = Object.keys(leafTotals).filter(function (l) { return ctx.classOfLeaf(l) === minId; });
      var cands = pick(ctx.pool, leaves, [], taken, MAX_PICKS);
      if (cands.length) recs.push({
        id: 'balance:' + minId, kind: 'balance', priority: 12,
        title: 'Add more ' + clsLabel(level, minId) + ' pictures',
        weak: 'Weak spot: the training set has only ' + minC + ' ' + clsLabel(level, minId) + ' ' + plural(minC, 'picture') + ', and ' + maxC + ' for the biggest group.',
        what: 'Add different ' + clsLabel(level, minId) + ' pictures.',
        may: 'Why it may help: a group with few pictures is easy for the AI to overlook. This may help.',
        how: 'How: press SHOW PICTURES, check each label, then press ADD TO TRAINING.',
        candidates: cands, leaves: leaves
      });
    }

    recs.sort(function (a, b) { return b.priority - a.priority; });
    recs = recs.slice(0, MAX_RECS);
    var next = null;
    if (!wrong.length) next = 'No mistakes on this test! Try the Challenge set to look for harder pictures.';
    else if (recs.length) next = 'Start with: ' + recs[0].title + '.';
    return { total: total, wrong: wrong.length, detective: detective, recommendations: recs, next: next, standoutTags: standout };
  }

  function classForLeaf(ctx, leaf) { return ctx.classOfLeaf ? ctx.classOfLeaf(leaf) : ''; }
  function U_cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  return { analyze: analyze, explainError: explainError, TAGS: TAGS };
});
