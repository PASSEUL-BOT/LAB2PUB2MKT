/* nn.js - a small neural network (multi-layer perceptron) with real
 * back-propagation and the Adam optimiser, written from scratch so that it runs
 * fully offline in any browser (and in Node for the automated tests).
 *
 *   inputs -> hidden layer (ReLU, dropout while training) -> softmax over classes
 *
 * Loss = class-weighted cross-entropy + small L2 weight decay.
 * Everything the screen shows during training (loss, accuracy) is measured here.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.OAE = root.OAE || {}; root.OAE.NN = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function rng(seed) {            // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  function create(nIn, nHid, nOut, seed) {
    var r = rng(seed || 1), W1 = new Float32Array(nIn * nHid), W2 = new Float32Array(nHid * nOut), i;
    var s1 = Math.sqrt(2 / nIn), s2 = Math.sqrt(2 / nHid);
    for (i = 0; i < W1.length; i++) W1[i] = gauss(r) * s1;
    for (i = 0; i < W2.length; i++) W2[i] = gauss(r) * s2;
    return { nIn: nIn, nHid: nHid, nOut: nOut, W1: W1, b1: new Float32Array(nHid), W2: W2, b2: new Float32Array(nOut) };
  }

  function softmax(z) {
    var m = -Infinity, i, s = 0, o = new Float32Array(z.length);
    for (i = 0; i < z.length; i++) if (z[i] > m) m = z[i];
    for (i = 0; i < z.length; i++) { o[i] = Math.exp(z[i] - m); s += o[i]; }
    for (i = 0; i < z.length; i++) o[i] /= s;
    return o;
  }

  /** Forward pass for one input vector -> class probabilities. */
  function predict(net, x) {
    var o;
    var nH = net.nHid, nO = net.nOut, W1 = net.W1, W2 = net.W2, i, j, k;
    var h = Float32Array.from(net.b1), z = Float32Array.from(net.b2);
    for (i = 0; i < net.nIn; i++) {
      var xi = x[i]; if (xi === 0) continue;
      for (j = 0, o = i * nH; j < nH; j++) h[j] += xi * W1[o + j];
    }
    for (j = 0; j < nH; j++) {
      if (h[j] <= 0) { h[j] = 0; continue; }
      for (k = 0, o = j * nO; k < nO; k++) z[k] += h[j] * W2[o + k];
    }
    return softmax(z);
  }

  /** Mean weighted cross-entropy loss (no weight decay) and accuracy on a set. */
  function evaluate(net, X, y, classW) {
    var loss = 0, wsum = 0, ok = 0;
    for (var n = 0; n < X.length; n++) {
      var p = predict(net, X[n]), w = classW ? classW[y[n]] : 1, best = 0;
      loss += -Math.log(Math.max(1e-9, p[y[n]])) * w; wsum += w;
      for (var k = 1; k < p.length; k++) if (p[k] > p[best]) best = k;
      if (best === y[n]) ok++;
    }
    return { loss: wsum ? loss / wsum : 0, acc: X.length ? ok / X.length : 0 };
  }

  /** Loss + gradients for a mini-batch (exposed so tests can gradient-check it). */
  function lossAndGrads(net, Xb, yb, wb, masks) {
    var B = Xb.length, nIn = net.nIn, nH = net.nHid, nO = net.nOut;
    var gW1 = new Float32Array(net.W1.length), gb1 = new Float32Array(nH), gW2 = new Float32Array(net.W2.length), gb2 = new Float32Array(nO);
    var loss = 0, wsum = 0, correct = 0, n, i, j, k;
    for (n = 0; n < B; n++) wsum += wb[n];
    for (n = 0; n < B; n++) {
      var x = Xb[n], pre = Float32Array.from(net.b1), h = new Float32Array(nH), z = Float32Array.from(net.b2), o;
      for (i = 0; i < nIn; i++) {
        var xi = x[i]; if (xi === 0) continue;
        for (j = 0, o = i * nH; j < nH; j++) pre[j] += xi * net.W1[o + j];
      }
      for (j = 0; j < nH; j++) {
        h[j] = pre[j] > 0 ? pre[j] * (masks ? masks[n][j] : 1) : 0;
        if (h[j] === 0) continue;
        for (k = 0, o = j * nO; k < nO; k++) z[k] += h[j] * net.W2[o + k];
      }
      var p = softmax(z), best = 0;
      for (k = 1; k < nO; k++) if (p[k] > p[best]) best = k;
      if (best === yb[n]) correct++;
      loss += -Math.log(Math.max(1e-9, p[yb[n]])) * wb[n] / wsum;
      var dz = new Float32Array(nO), dh = new Float32Array(nH);
      for (k = 0; k < nO; k++) { dz[k] = (p[k] - (k === yb[n] ? 1 : 0)) * wb[n] / wsum; gb2[k] += dz[k]; }
      for (j = 0; j < nH; j++) {
        var a = 0;
        if (h[j] !== 0) for (k = 0, o = j * nO; k < nO; k++) { gW2[o + k] += h[j] * dz[k]; a += net.W2[o + k] * dz[k]; }
        else for (k = 0, o = j * nO; k < nO; k++) a += net.W2[o + k] * dz[k];
        dh[j] = pre[j] > 0 ? a * (masks ? masks[n][j] : 1) : 0;
        gb1[j] += dh[j];
      }
      for (i = 0; i < nIn; i++) {
        var xv = x[i]; if (xv === 0) continue;
        for (j = 0, o = i * nH; j < nH; j++) gW1[o + j] += xv * dh[j];
      }
    }
    return { loss: loss, acc: correct / B, gW1: gW1, gb1: gb1, gW2: gW2, gb2: gb2 };
  }

  function yieldToUI() { return new Promise(function (res) { setTimeout(res, 0); }); }

  /**
   * Train a network.  opts: {X, y, classW, valX, valY, hidden, epochs, batch, lr, l2, dropout, seed,
   *   onEpoch(info), shouldStop()}
   * Returns {net, history, stoppedEarly, bestEpoch}.  The returned net is the last epoch, or the epoch
   * with the lowest validation loss when opts.keepBest is true.
   */
  async function train(opts) {
    var X = opts.X, y = opts.y, nIn = X[0].length, nOut = opts.nClasses;
    var net = create(nIn, opts.hidden || 96, nOut, opts.seed || 7);
    var r = rng((opts.seed || 7) * 31 + 5), epochs = opts.epochs || 40, batch = opts.batch || 32;
    var lr = opts.lr || 0.003, l2 = opts.l2 == null ? 1e-4 : opts.l2, drop = opts.dropout == null ? 0.25 : opts.dropout;
    var classW = opts.classW || new Float32Array(nOut).fill(1);
    var m = { W1: new Float32Array(net.W1.length), b1: new Float32Array(net.b1.length), W2: new Float32Array(net.W2.length), b2: new Float32Array(net.b2.length) };
    var v = { W1: new Float32Array(net.W1.length), b1: new Float32Array(net.b1.length), W2: new Float32Array(net.W2.length), b2: new Float32Array(net.b2.length) };
    var idx = []; for (var i = 0; i < X.length; i++) idx.push(i);
    var t = 0, history = [], best = null, bestLoss = Infinity, bestEpoch = 0, stopped = false;
    var b1c = 0.9, b2c = 0.999, eps = 1e-8;
    function step(key, g, w) {
      var c1 = 1 - Math.pow(b1c, t), c2 = 1 - Math.pow(b2c, t), isW = key[0] === 'W', mk = m[key], vk = v[key];
      for (var q = 0; q < w.length; q++) {
        var gq = g[q] + (isW ? l2 * w[q] : 0);
        mk[q] = b1c * mk[q] + (1 - b1c) * gq;
        vk[q] = b2c * vk[q] + (1 - b2c) * gq * gq;
        w[q] -= lr * (mk[q] / c1) / (Math.sqrt(vk[q] / c2) + eps);
      }
    }
    for (var ep = 1; ep <= epochs; ep++) {
      for (i = idx.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
      var eLoss = 0, eAcc = 0, eN = 0;
      for (var s = 0; s < idx.length; s += batch) {
        var bi = idx.slice(s, s + batch), Xb = [], yb = [], wb = [], masks = [];
        for (var q = 0; q < bi.length; q++) {
          Xb.push(X[bi[q]]); yb.push(y[bi[q]]); wb.push(classW[y[bi[q]]]);
          var mk = new Float32Array(net.nHid);
          for (var h = 0; h < net.nHid; h++) mk[h] = r() < drop ? 0 : 1 / (1 - drop);
          masks.push(mk);
        }
        var g = lossAndGrads(net, Xb, yb, wb, masks);
        t++;
        step('W1', g.gW1, net.W1); step('b1', g.gb1, net.b1); step('W2', g.gW2, net.W2); step('b2', g.gb2, net.b2);
        eLoss += g.loss * bi.length; eAcc += g.acc * bi.length; eN += bi.length;
        if (opts.onBatch) opts.onBatch({ epoch: ep, seen: Math.min(s + batch, idx.length), total: idx.length });
        if (opts.onBatch && t % 6 === 0) await yieldToUI();   // keep the screen smooth while learning
      }
      var info = { epoch: ep, epochs: epochs, trainLoss: eLoss / eN, trainAcc: eAcc / eN, examples: idx.length };
      if (opts.valX && opts.valX.length) {
        var ev = evaluate(net, opts.valX, opts.valY, classW);
        info.valLoss = ev.loss; info.valAcc = ev.acc;
        if (ev.loss < bestLoss) {
          bestLoss = ev.loss; bestEpoch = ep;
          best = { W1: net.W1.slice(), b1: net.b1.slice(), W2: net.W2.slice(), b2: net.b2.slice() };
        }
      }
      history.push(info);
      if (opts.onEpoch) opts.onEpoch(info);
      await yieldToUI();
      if (opts.shouldStop && opts.shouldStop()) { stopped = true; break; }
    }
    if (best && opts.keepBest) { net.W1 = best.W1; net.b1 = best.b1; net.W2 = best.W2; net.b2 = best.b2; } else bestEpoch = history.length;
    if (!opts.keepBest) bestEpoch = history.length;
    return { net: net, history: history, stoppedEarly: stopped, bestEpoch: bestEpoch };
  }

  return { rng: rng, create: create, predict: predict, evaluate: evaluate, lossAndGrads: lossAndGrads, train: train, softmax: softmax };
});
