/* evaluation.js - honest scoring.  Pure functions, no screen code.
 *
 * An item is {id, expected, pred, conf, tags?, leaf?}.  expected and pred are class ids;
 * pred may be 'unsure', and expected may be 'unsure' for pictures the AI was never taught
 * (the only correct answer for those is UNSURE).
 * Accuracy = correct / total * 100.  UNSURE on a normal picture counts as NOT correct.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.OAE = root.OAE || {}; root.OAE.Evaluation = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isCorrect(it) { return it.expected === it.pred; }

  /** 95% Wilson score interval for k correct out of n, in percent. */
  function wilson(k, n) {
    if (!n) return { lo: 0, hi: 0 };
    var z = 1.96, p = k / n, d = 1 + z * z / n;
    var c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
    return { lo: Math.max(0, (c - h) * 100), hi: Math.min(100, (c + h) * 100) };
  }

  function summarize(items, classIds) {
    var total = items.length, correct = 0, unsure = 0, wrongSure = 0, perClass = {}, confusion = {}, cols = classIds.concat(['unsure']);
    classIds.concat(['unsure']).forEach(function (c) {
      perClass[c] = { id: c, total: 0, correct: 0, predicted: 0, predictedRight: 0, recall: null, precision: null };
      confusion[c] = {}; cols.forEach(function (d) { confusion[c][d] = 0; });
    });
    items.forEach(function (it) {
      var ok = isCorrect(it);
      if (ok) correct++;
      if (it.pred === 'unsure') unsure++; else if (!ok) wrongSure++;
      if (!perClass[it.expected]) { perClass[it.expected] = { id: it.expected, total: 0, correct: 0, predicted: 0, predictedRight: 0 }; confusion[it.expected] = {}; }
      perClass[it.expected].total++; if (ok) perClass[it.expected].correct++;
      if (!perClass[it.pred]) perClass[it.pred] = { id: it.pred, total: 0, correct: 0, predicted: 0, predictedRight: 0 };
      perClass[it.pred].predicted++; if (ok) perClass[it.pred].predictedRight++;
      confusion[it.expected][it.pred] = (confusion[it.expected][it.pred] || 0) + 1;
    });
    Object.keys(perClass).forEach(function (c) {
      var p = perClass[c];
      p.recall = p.total ? p.correct / p.total * 100 : null;
      p.precision = p.predicted ? p.predictedRight / p.predicted * 100 : null;
    });
    var accuracy = total ? correct / total * 100 : 0;
    return { total: total, correct: correct, wrong: total - correct, unsure: unsure, wrongButSure: wrongSure,
      accuracy: accuracy, ci95: wilson(correct, total), perClass: perClass, confusion: confusion, columns: cols };
  }

  /** The most common mix-ups, e.g. [{expected, pred, count}] sorted by count. */
  function topConfusions(items, limit) {
    var m = {};
    items.forEach(function (it) { if (!isCorrect(it)) { var k = it.expected + '>' + it.pred; m[k] = (m[k] || 0) + 1; } });
    return Object.keys(m).map(function (k) { var s = k.split('>'); return { expected: s[0], pred: s[1], count: m[k] }; })
      .sort(function (a, b) { return b.count - a.count; }).slice(0, limit || 5);
  }

  /** log of binomial coefficient helper for the exact sign test */
  function lchoose(n, k) { var s = 0; for (var i = 1; i <= k; i++) s += Math.log((n - k + i) / i); return s; }
  function signTestP(fixed, broke) {
    var n = fixed + broke; if (!n) return 1;
    var k = Math.min(fixed, broke), p = 0;
    for (var i = 0; i <= k; i++) p += Math.exp(lchoose(n, i) + n * Math.log(0.5));
    return Math.min(1, 2 * p);
  }

  /**
   * Compare two evaluations of the SAME set of pictures (before vs after).
   * Only pictures present in both are compared.  Verdict is 'better', 'worse' or 'unclear'
   * using an exact sign test on the pictures whose result changed (p < 0.05) and a change of
   * at least 2 percentage points.
   */
  function compare(before, after, classIds) {
    var bi = {}; before.forEach(function (it) { bi[it.id] = it; });
    var pairs = [];
    after.forEach(function (it) { if (bi[it.id]) pairs.push([bi[it.id], it]); });
    var n = pairs.length, fixed = 0, broke = 0, bothRight = 0, bothWrong = 0;
    pairs.forEach(function (p) {
      var a = isCorrect(p[0]), b = isCorrect(p[1]);
      if (!a && b) fixed++; else if (a && !b) broke++; else if (a && b) bothRight++; else bothWrong++;
    });
    var sb = summarize(pairs.map(function (p) { return p[0]; }), classIds), sa = summarize(pairs.map(function (p) { return p[1]; }), classIds);
    var delta = sa.accuracy - sb.accuracy, p = signTestP(fixed, broke);
    var improved = [], worse = [];
    classIds.forEach(function (c) {
      var r0 = sb.perClass[c], r1 = sa.perClass[c];
      if (!r0 || !r0.total) return;
      var d = r1.recall - r0.recall;
      if (d > 0.0001) improved.push({ id: c, before: r0.recall, after: r1.recall, delta: d });
      else if (d < -0.0001) worse.push({ id: c, before: r0.recall, after: r1.recall, delta: d });
    });
    var verdict = 'unclear';
    if (p < 0.05 && Math.abs(delta) >= 2) verdict = delta > 0 ? 'better' : 'worse';
    return { n: n, before: sb.accuracy, after: sa.accuracy, delta: delta, fixed: fixed, broke: broke, bothRight: bothRight, bothWrong: bothWrong,
      pValue: p, verdict: verdict, improved: improved, worse: worse, sameSet: n > 0 && n === before.length && n === after.length };
  }

  /** error rate by picture tag, for the Mistake Detective */
  function byTag(items) {
    var out = {};
    items.forEach(function (it) {
      (it.tags || []).forEach(function (t) {
        var o = out[t] = out[t] || { tag: t, total: 0, wrong: 0 };
        o.total++; if (!isCorrect(it)) o.wrong++;
      });
    });
    return out;
  }

  return { isCorrect: isCorrect, summarize: summarize, topConfusions: topConfusions, compare: compare, wilson: wilson, signTestP: signTestP, byTag: byTag };
});
