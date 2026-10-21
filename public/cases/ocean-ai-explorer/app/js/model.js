/* model.js - connects pictures, the feature "eyes" (features.js) and the neural network (nn.js).
 *
 *  - features(): decodes a real picture and turns it into numbers (cached on this device).
 *  - trainLevel(): runs REAL training (back-propagation) on the chosen training pictures only.
 *  - predictItems(): runs the trained network on pictures and returns the real class scores.
 *  - Trained networks are saved in IndexedDB so they survive a restart.
 *
 * Training can only use pictures from the "train" and "pool" splits, or pictures the child imported.
 * The validation, test and challenge pictures are refused here, so they can never leak into training.
 */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var F = OAE.Features, NN = OAE.NN, D = OAE.Dataset, S = OAE.Storage, U = OAE.U;
  var M = OAE.Model = { nets: {}, featMem: new Map() };

  function fkey(id) { return id + '|v' + F.VERSION; }

  /** Decode one picture (library id or imported id) -> {data,w,h}. */
  function decodeAny(id) {
    if (D.byId[id]) return D.decode(id);
    return S.get('imports', id).then(function (rec) {
      if (!rec) throw new Error('An imported picture is missing from this device.');
      return D.decodeURL(rec.dataUrl);
    });
  }

  /** Feature vectors [normal, mirrored] for a list of ids. Cached in memory and on the device. */
  M.ensureFeatures = async function (ids, onProgress) {
    var need = [], i, out = {};
    var cached = await S.getMany('features', ids.map(fkey)).catch(function () { return []; });
    for (i = 0; i < ids.length; i++) {
      var c = M.featMem.get(ids[i]) || cached[i];
      if (c && c.a && c.a.length === F.DIM) { M.featMem.set(ids[i], c); out[ids[i]] = c; } else need.push(ids[i]);
    }
    if (onProgress) onProgress(ids.length - need.length, ids.length);
    var pairs = [];
    for (i = 0; i < need.length; i++) {
      var id = need[i], px = await decodeAny(id);
      var rec = { a: F.extract(px.data, px.w, px.h, false), b: F.extract(px.data, px.w, px.h, true) };
      M.featMem.set(id, rec); out[id] = rec; pairs.push([fkey(id), rec]);
      if (pairs.length >= 40) { await S.putMany('features', pairs).catch(function () { }); pairs = []; }
      if (i % 4 === 3) { if (onProgress) onProgress(ids.length - need.length + i + 1, ids.length); await U.yieldUI(); }
    }
    if (pairs.length) await S.putMany('features', pairs).catch(function () { });
    if (onProgress) onProgress(ids.length, ids.length);
    return out;
  };

  /** A short fingerprint of a training set (ids + labels), to tell whether the child changed it. */
  M.entryHash = function (entries) {
    var s = entries.map(function (e) { return e.id + ':' + e.label; }).sort().join('|'), h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36) + '-' + entries.length;
  };

  /** Throws a friendly Error when the training set is not allowed or not good enough. */
  M.checkTrainingSet = function (level, entries) {
    var counts = {}, trainable = OAE.cfg.trainableSplits;
    level.classIds.forEach(function (c) { counts[c] = 0; });
    entries.forEach(function (e) {
      if (e.source === 'import') { if (counts[e.label] != null) counts[e.label]++; return; }
      var im = D.byId[e.id];
      if (!im) throw new Error('A training picture is not in the library.');
      if (trainable.indexOf(im.split) < 0) { var err = new Error('Test pictures are secret and can never be used for training.'); err.code = 'leak'; throw err; }
      if (counts[e.label] != null) counts[e.label]++;
    });
    var bad = level.classIds.filter(function (c) { return counts[c] < 2; });
    if (bad.length) {
      var err2 = new Error('Bubbles needs at least 2 pictures of every group. Add pictures for: ' + bad.map(function (c) { return level.cls[c].label; }).join(', ') + '.');
      err2.code = 'few'; throw err2;
    }
    return counts;
  };

  /**
   * Real training. opts: {onStatus(text), onFeatures(done,total), onEpoch(info), onBatch(info), shouldStop()}
   * Returns the model record that is also saved on the device.
   */
  M.trainLevel = async function (level, entries, opts) {
    opts = opts || {};
    var counts = M.checkTrainingSet(level, entries), i;
    var ids = entries.map(function (e) { return e.id; });
    var vals = D.images.filter(function (im) { return im.split === 'validation' && level.classOf(im) && D.has(im.id); });
    if (opts.onStatus) opts.onStatus('Looking at the pictures...');
    var feats = await M.ensureFeatures(ids.concat(vals.map(function (v) { return v.id; })), opts.onFeatures);
    var X = [], y = [], classW = new Float32Array(level.classIds.length);
    entries.forEach(function (e) {
      var k = level.classIds.indexOf(e.label), f = feats[e.id];
      X.push(f.a); y.push(k); X.push(f.b); y.push(k);        // each picture and its mirror image
    });
    var total = entries.length, K = level.classIds.length;
    level.classIds.forEach(function (c, k) { classW[k] = counts[c] ? total / (K * counts[c]) : 1; });
    var valX = vals.map(function (v) { return feats[v.id].a; }), valY = vals.map(function (v) { return level.classIds.indexOf(level.classOf(v)); });
    var T = OAE.cfg.train;
    if (opts.onStatus) opts.onStatus('Learning...');
    var t0 = Date.now();
    var res = await NN.train({
      X: X, y: y, nClasses: K, classW: classW, valX: valX, valY: valY, hidden: T.hidden, epochs: T.epochs, batch: T.batch,
      lr: T.lr, l2: T.l2, dropout: T.dropout, seed: T.seed, keepBest: false,
      onEpoch: opts.onEpoch, onBatch: opts.onBatch, shouldStop: opts.shouldStop
    });
    var rec = {
      levelId: level.id, classIds: level.classIds.slice(), trainedAt: Date.now(), seconds: (Date.now() - t0) / 1000,
      entryHash: M.entryHash(entries), nPictures: entries.length, nExamples: X.length, counts: counts,
      history: res.history, bestEpoch: res.bestEpoch, stoppedEarly: res.stoppedEarly, featVersion: F.VERSION,
      hidden: T.hidden, nValidation: vals.length,
      entryIds: entries.map(function (e) { return e.id + ':' + e.label; })
    };
    M.nets[level.id] = { net: res.net, meta: rec };
    await S.put('models', String(level.id), { net: res.net, meta: rec });
    return rec;
  };

  /** Load all saved networks from the device (called at start-up). */
  M.loadSaved = async function () {
    var rows = await S.all('models').catch(function () { return []; });
    rows.forEach(function (kv) {
      var v = kv[1];
      if (v && v.net && v.meta && v.meta.featVersion === F.VERSION && v.net.nIn === F.DIM) M.nets[v.meta.levelId] = v;
    });
    return Object.keys(M.nets).length;
  };
  M.has = function (levelId) { return !!M.nets[levelId]; };
  M.meta = function (levelId) { return M.nets[levelId] ? M.nets[levelId].meta : null; };
  M.forget = function (levelId) { delete M.nets[levelId]; return S.del('models', String(levelId)); };

  /** Turn network scores for one picture into an answer for this level. */
  M.decide = function (level, probs) {
    var best = 0, k, second = -1;
    for (k = 1; k < probs.length; k++) if (probs[k] > probs[best]) best = k;
    var top = Array.prototype.map.call(probs, function (p, i) { return [level.classIds[i], p]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 3);
    var pred = level.classIds[best], conf = probs[best];
    if (level.unsureAllowed && conf < level.unsureBelow) pred = 'unsure';
    return { pred: pred, conf: conf, best: level.classIds[best], top: top };
  };

  M.predictFeatures = function (level, feat) {
    var m = M.nets[level.id];
    if (!m) throw new Error('This level has no trained AI yet. Press TRAIN MY AI first.');
    return M.decide(level, NN.predict(m.net, feat));
  };

  /** Run the trained AI on every picture of an evaluation set ('test' or 'challenge'). */
  M.predictItems = async function (level, setId, onProgress) {
    var m = M.nets[level.id];
    if (!m) throw new Error('This level has no trained AI yet. Press TRAIN MY AI first.');
    var imgs = (D.bySplit[setId] || []).filter(function (im) { return level.expectedOf(im) && D.has(im.id); });
    var feats = await M.ensureFeatures(imgs.map(function (im) { return im.id; }), onProgress);
    return imgs.map(function (im) {
      var d = M.decide(level, NN.predict(m.net, feats[im.id].a));
      return { id: im.id, expected: level.expectedOf(im), pred: d.pred, conf: d.conf, top: d.top, tags: im.tags, leaf: im.label, difficulty: im.difficulty };
    });
  };

  /** Does an imported picture look the same as a secret test/validation/challenge picture?
   *  Candidates come from the perceptual hash; a real copy must also be (nearly) pixel-identical
   *  (contrast-normalised correlation above 0.99 on a small grey version). */
  function grey(px) {
    var rgb = F.resizeArea(px, 160, 160, 24, 24), g = new Float32Array(576), i, mu = 0, n = 0;
    for (i = 0; i < 576; i++) { g[i] = 0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2]; mu += g[i]; }
    mu /= 576; for (i = 0; i < 576; i++) { g[i] -= mu; n += g[i] * g[i]; }
    n = Math.sqrt(n) || 1; for (i = 0; i < 576; i++) g[i] /= n; return g;
  }
  M.grey = grey;
  M.findSecretTwin = function (rgba, w, h) {
    var hash = F.dhash(rgba, w, h), limit = OAE.cfg.hashDistanceLimit;
    var cand = D.images.filter(function (im) { return OAE.cfg.secretSplits.indexOf(im.split) >= 0 && F.hamming(im.dhash, hash) <= limit; });
    if (!cand.length) return Promise.resolve({ hash: hash, twin: null });
    var mine = grey(rgba);
    function corr(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
    return Promise.all(cand.slice(0, 30).map(function (im) { return D.decode(im.id).then(function (p) { return Math.max(corr(mine, grey(p.data)), corr(mine, grey(flipPixels(p.data)))); }); }))
      .then(function (cs) { return { hash: hash, twin: Math.max.apply(null, cs) > 0.99 ? true : null }; })
      .catch(function () { return { hash: hash, twin: null }; });
  };
  function flipPixels(d) {
    var o = new Uint8ClampedArray(d.length), W = 160, x, y;
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) { var a = (y * W + x) * 4, b = (y * W + (W - 1 - x)) * 4; o[a] = d[b]; o[a + 1] = d[b + 1]; o[a + 2] = d[b + 2]; o[a + 3] = d[b + 3]; }
    return o;
  }
})();
