/* features.js - turns a picture into numbers the AI can learn from.
 *
 * No pretrained network could be bundled in this build, so the "eyes" of the AI
 * are a fixed image filter bank: contrast normalisation, colour layout, Gabor edge
 * filters, colour-edge filters, edge density, a rough shape mask and 64 random
 * convolution filters (seeded, never trained).  Nothing in
 * here is trained and nothing is looked up by image id: the same code runs on any
 * picture, including pictures the child imports.  The TRAINABLE part of the AI is
 * the neural network in nn.js that learns from these numbers.
 *
 * Works in the browser and in Node (UMD).  Input: RGBA bytes (any size).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.OAE = root.OAE || {}; root.OAE.Features = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var SIZE = 64;
  var VERSION = 3;

  /** Area-average resize of RGBA bytes -> Float32 RGB in 0..1 (length dw*dh*3). */
  function resizeArea(src, sw, sh, dw, dh, rx0, ry0, rx1, ry1) {
    var out = new Float32Array(dw * dh * 3);
    rx0 = rx0 || 0; ry0 = ry0 || 0; rx1 = rx1 || sw; ry1 = ry1 || sh;
    var xs = (rx1 - rx0) / dw, ys = (ry1 - ry0) / dh;
    for (var y = 0; y < dh; y++) {
      var y0 = ry0 + y * ys, y1 = ry0 + (y + 1) * ys;
      var iy0 = Math.max(0, Math.floor(y0)), iy1 = Math.min(sh, Math.ceil(y1));
      for (var x = 0; x < dw; x++) {
        var x0 = rx0 + x * xs, x1 = rx0 + (x + 1) * xs;
        var ix0 = Math.max(0, Math.floor(x0)), ix1 = Math.min(sw, Math.ceil(x1));
        var r = 0, g = 0, b = 0, wsum = 0;
        for (var yy = iy0; yy < iy1; yy++) {
          var wy = Math.min(yy + 1, y1) - Math.max(yy, y0);
          for (var xx = ix0; xx < ix1; xx++) {
            var wx = Math.min(xx + 1, x1) - Math.max(xx, x0);
            var w = wx * wy, p = (yy * sw + xx) * 4;
            r += src[p] * w; g += src[p + 1] * w; b += src[p + 2] * w; wsum += w;
          }
        }
        var o = (y * dw + x) * 3;
        out[o] = r / wsum / 255; out[o + 1] = g / wsum / 255; out[o + 2] = b / wsum / 255;
      }
    }
    return out;
  }

  function flipRGB(a, w, h) {
    var o = new Float32Array(a.length);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var s = (y * w + x) * 3, d = (y * w + (w - 1 - x)) * 3;
      o[d] = a[s]; o[d + 1] = a[s + 1]; o[d + 2] = a[s + 2];
    }
    return o;
  }

  // ---- filter banks (built once)
  function gabor(size, theta, lambda, sigma) {
    var k = new Float32Array(size * size), c = (size - 1) / 2, sum = 0, ct = Math.cos(theta), st = Math.sin(theta);
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      var dx = x - c, dy = y - c, xr = dx * ct + dy * st, yr = -dx * st + dy * ct;
      var v = Math.exp(-(xr * xr + 0.5 * yr * yr) / (2 * sigma * sigma)) * Math.cos(2 * Math.PI * xr / lambda);
      k[y * size + x] = v; sum += v;
    }
    var m = sum / (size * size), n = 0;
    for (var i = 0; i < k.length; i++) { k[i] -= m; n += Math.abs(k[i]); }
    for (i = 0; i < k.length; i++) k[i] /= n;
    return k;
  }
  var GABORS = [];
  [[4, 1.8], [7, 3.0]].forEach(function (ls) {
    for (var o = 0; o < 6; o++) GABORS.push(gabor(7, o * Math.PI / 6, ls[0], ls[1]));
  });
  var OPP = [];
  for (var o4 = 0; o4 < 4; o4++) OPP.push(gabor(7, o4 * Math.PI / 4, 5, 2.4));

  function convAbs(chan, w, h, k, ks, stride) {
    var half = (ks - 1) >> 1, ow = Math.floor(w / stride), oh = Math.floor(h / stride);
    var out = new Float32Array(ow * oh);
    for (var oy = 0; oy < oh; oy++) for (var ox = 0; ox < ow; ox++) {
      var cy = oy * stride + (stride >> 1), cx = ox * stride + (stride >> 1), s = 0;
      for (var ky = 0; ky < ks; ky++) {
        var yy = cy + ky - half; if (yy < 0 || yy >= h) continue;
        for (var kx = 0; kx < ks; kx++) {
          var xx = cx + kx - half; if (xx < 0 || xx >= w) continue;
          s += chan[yy * w + xx] * k[ky * ks + kx];
        }
      }
      out[oy * ow + ox] = Math.abs(s);
    }
    return { d: out, w: ow, h: oh };
  }

  function poolGrid(map, n, out, off) {
    var cw = map.w / n, ch = map.h / n;
    for (var gy = 0; gy < n; gy++) for (var gx = 0; gx < n; gx++) {
      var s = 0, c = 0;
      for (var y = Math.floor(gy * ch); y < Math.floor((gy + 1) * ch); y++)
        for (var x = Math.floor(gx * cw); x < Math.floor((gx + 1) * cw); x++) { s += map.d[y * map.w + x]; c++; }
      out[off + gy * n + gx] = s / c;
    }
  }

  // ---- random convolution bank: fixed seeded filters (these are NOT trained)
  var RC_N = 64, RC_K = 5, RCF = (function () {
    var a = 12345, out = [];
    function rnd() { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    for (var f = 0; f < RC_N; f++) {
      var k = new Float32Array(RC_K * RC_K * 3), m = 0, n = 0, i;
      for (i = 0; i < k.length; i++) { k[i] = Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd()); m += k[i]; }
      m /= k.length; for (i = 0; i < k.length; i++) { k[i] -= m; n += k[i] * k[i]; }
      n = Math.sqrt(n); for (i = 0; i < k.length; i++) k[i] /= n;
      out.push(k);
    }
    return out;
  })();
  function randomConv(rgb, out) {
    var W = SIZE, stride = 2, ow = Math.floor((W - RC_K) / stride) + 1, f, y, x, ky, kx, c;
    var grid = 3, cell = ow / grid;
    for (f = 0; f < RC_N; f++) {
      var k = RCF[f], pooled = new Float32Array(9), cnt = new Float32Array(9), mx = 0;
      for (y = 0; y < ow; y++) for (x = 0; x < ow; x++) {
        var s = 0, base = (y * stride) * W + x * stride;
        for (ky = 0; ky < RC_K; ky++) for (kx = 0; kx < RC_K; kx++) {
          var p = (base + ky * W + kx) * 3, q = (ky * RC_K + kx) * 3;
          s += rgb[p] * k[q] + rgb[p + 1] * k[q + 1] + rgb[p + 2] * k[q + 2];
        }
        if (s < 0) s = 0;
        var cidx = Math.min(grid - 1, Math.floor(y / cell)) * grid + Math.min(grid - 1, Math.floor(x / cell));
        pooled[cidx] += s; cnt[cidx]++; if (s > mx) mx = s;
      }
      for (c = 0; c < 9; c++) out.push(pooled[c] / Math.max(1, cnt[c]));
      out.push(mx);
    }
  }

  /** RGB float image (SIZE x SIZE) -> feature vector. */
  function fromRGB(rgb) {
    var W = SIZE, N = W * W;
    var gray = new Float32Array(N), sat = new Float32Array(N), val = new Float32Array(N), hue = new Float32Array(N);
    var rg = new Float32Array(N), by = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
      val[i] = mx; sat[i] = mx > 0 ? dl / mx : 0;
      var h = 0;
      if (dl > 1e-5) {
        if (mx === r) h = ((g - b) / dl) % 6; else if (mx === g) h = (b - r) / dl + 2; else h = (r - g) / dl + 4;
        h /= 6; if (h < 0) h += 1;
      }
      hue[i] = h; rg[i] = r - g; by[i] = b - (r + g) / 2;
    }
    var f = [];
    // a) colour layout 4x4: mean R,G,B,S per cell (64)
    var cs = W / 4;
    for (var gy = 0; gy < 4; gy++) for (var gx = 0; gx < 4; gx++) {
      var sr = 0, sg = 0, sb = 0, ss = 0, c = 0;
      for (var y = gy * cs; y < (gy + 1) * cs; y++) for (var x = gx * cs; x < (gx + 1) * cs; x++) {
        var p = y * W + x; sr += rgb[p * 3]; sg += rgb[p * 3 + 1]; sb += rgb[p * 3 + 2]; ss += sat[p]; c++;
      }
      f.push(sr / c, sg / c, sb / c, ss / c);
    }
    // b) hue histogram (12), value histogram (6), colour stats (4)
    var hh = new Float32Array(12), vh = new Float32Array(6), hw = 0, ms = 0, mv = 0, ss2 = 0, sv2 = 0;
    for (i = 0; i < N; i++) {
      var wgt = sat[i] * val[i];
      if (sat[i] > 0.15 && val[i] > 0.15) { hh[Math.min(11, Math.floor(hue[i] * 12))] += wgt; hw += wgt; }
      vh[Math.min(5, Math.floor(val[i] * 6))] += 1;
      ms += sat[i]; mv += val[i]; ss2 += sat[i] * sat[i]; sv2 += val[i] * val[i];
    }
    for (i = 0; i < 12; i++) f.push(hw > 0 ? hh[i] / hw : 0);
    for (i = 0; i < 6; i++) f.push(vh[i] / N);
    ms /= N; mv /= N;
    f.push(ms, mv, Math.sqrt(Math.max(0, ss2 / N - ms * ms)), Math.sqrt(Math.max(0, sv2 / N - mv * mv)));
    // c) Gabor edge energy: 12 filters, 4x4 pooled (192) + global max (12)
    var gm = new Float32Array(16);
    for (var gi = 0; gi < GABORS.length; gi++) {
      var map = convAbs(gray, W, W, GABORS[gi], 7, 2);
      poolGrid(map, 4, gm, 0);
      for (i = 0; i < 16; i++) f.push(gm[i] * 6);
      var mxv = 0; for (i = 0; i < map.d.length; i++) if (map.d[i] > mxv) mxv = map.d[i];
      f.push(mxv * 6);
    }
    // d) colour-edge energy: 2 opponent channels x 4 orientations, 2x2 pooled (32)
    var g4 = new Float32Array(4);
    [rg, by].forEach(function (ch) {
      for (var oi = 0; oi < 4; oi++) { poolGrid(convAbs(ch, W, W, OPP[oi], 7, 4), 2, g4, 0); for (var q = 0; q < 4; q++) f.push(g4[q] * 8); }
    });
    // e) edge density 8x8 (64)
    var ed = new Float32Array(64), cnt = new Float32Array(64);
    for (y = 1; y < W - 1; y++) for (x = 1; x < W - 1; x++) {
      var gx2 = gray[y * W + x + 1] - gray[y * W + x - 1], gy2 = gray[(y + 1) * W + x] - gray[(y - 1) * W + x];
      var cell = ((y >> 3) * 8) + (x >> 3);
      ed[cell] += Math.sqrt(gx2 * gx2 + gy2 * gy2); cnt[cell]++;
    }
    for (i = 0; i < 64; i++) f.push(ed[i] / Math.max(1, cnt[i]) * 2);
    // f) rough foreground mask: pixels unlike every border strip (73)
    var strips = [[0, 3, 0, W], [W - 3, W, 0, W], [0, W, 0, 3], [0, W, W - 3, W]], refs = [];
    strips.forEach(function (s) {
      var a = 0, b2 = 0, c2 = 0, n2 = 0;
      for (var yy = s[0]; yy < s[1]; yy++) for (var xx = s[2]; xx < s[3]; xx++) { var q = yy * W + xx; a += rgb[q * 3]; b2 += rgb[q * 3 + 1]; c2 += rgb[q * 3 + 2]; n2++; }
      refs.push([a / n2, b2 / n2, c2 / n2]);
    });
    var mask = new Float32Array(N), area = 0, mxs = 0, mys = 0;
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) {
      var q2 = y * W + x, best = 9;
      for (var ri = 0; ri < 4; ri++) {
        var dr = rgb[q2 * 3] - refs[ri][0], dg = rgb[q2 * 3 + 1] - refs[ri][1], db = rgb[q2 * 3 + 2] - refs[ri][2];
        var dd = Math.sqrt(dr * dr + dg * dg + db * db); if (dd < best) best = dd;
      }
      // interior pixels count as foreground when they differ from the border colours
      var m = best > 0.2 ? 1 : 0; mask[q2] = m; area += m; mxs += m * x; mys += m * y;
    }
    var mm = new Float32Array(64);
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) mm[((y >> 3) * 8) + (x >> 3)] += mask[y * W + x] / 64;
    for (i = 0; i < 64; i++) f.push(mm[i]);
    var cx0 = area > 0 ? mxs / area : W / 2, cy0 = area > 0 ? mys / area : W / 2, sxx = 0, syy = 0, sxy = 0, minx = W, maxx = 0, miny = W, maxy = 0, sym = 0;
    for (y = 0; y < W; y++) for (x = 0; x < W; x++) if (mask[y * W + x]) {
      sxx += (x - cx0) * (x - cx0); syy += (y - cy0) * (y - cy0); sxy += (x - cx0) * (y - cy0);
      if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      if (mask[y * W + (W - 1 - x)]) sym++;
    }
    var a2 = Math.max(1, area); sxx /= a2; syy /= a2; sxy /= a2;
    var tr = sxx + syy, det = sxx * syy - sxy * sxy, disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    var l1 = tr / 2 + disc, l2 = Math.max(1e-3, tr / 2 - disc);
    f.push(area / N, cx0 / W, cy0 / W, area ? (maxx - minx + 1) / W : 0, area ? (maxy - miny + 1) / W : 0,
      Math.min(6, Math.sqrt(l1 / l2)) / 3, sym / a2, Math.sqrt(l1) / W * 3, Math.sqrt(l2) / W * 3);
    randomConv(rgb, f);
    return Float32Array.from(f);
  }

  /** Stretch contrast so dark or washed-out pictures look more like normal ones. */
  function normalize(rgb) {
    var n = rgb.length / 3, lum = new Float32Array(n), i;
    for (i = 0; i < n; i++) lum[i] = 0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2];
    var sorted = Float32Array.from(lum).sort(), lo = sorted[Math.floor(n * 0.02)], hi = sorted[Math.floor(n * 0.98)];
    var span = Math.max(0.25, hi - lo), out = new Float32Array(rgb.length);
    for (i = 0; i < rgb.length; i++) out[i] = Math.min(1, Math.max(0, (rgb[i] - lo) / span));
    return out;
  }

  /** RGBA bytes (any size) -> feature vector.  flipped=true mirrors the picture first. */
  function extract(rgba, w, h, flipped) {
    var rgb = normalize(resizeArea(rgba, w, h, SIZE, SIZE));
    if (flipped) rgb = flipRGB(rgb, SIZE, SIZE);
    return fromRGB(rgb);
  }

  /** 64-bit difference hash (hex) used to spot copies of secret test pictures. */
  function dhash(rgba, w, h) {
    var px = resizeArea(rgba, w, h, 9, 8), bits = '', y, x;
    function g(i) { return 0.299 * px[i * 3] + 0.587 * px[i * 3 + 1] + 0.114 * px[i * 3 + 2]; }
    for (y = 0; y < 8; y++) for (x = 0; x < 8; x++) bits += g(y * 9 + x) < g(y * 9 + x + 1) ? '1' : '0';
    var hex = '';
    for (var i = 0; i < 64; i += 4) hex += parseInt(bits.substr(i, 4), 2).toString(16);
    return hex;
  }
  function hamming(a, b) {
    var d = 0;
    for (var i = 0; i < a.length; i++) { var v = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (v) { d += v & 1; v >>= 1; } }
    return d;
  }

  var DIM = fromRGB(new Float32Array(SIZE * SIZE * 3)).length;
  return { SIZE: SIZE, VERSION: VERSION, DIM: DIM, extract: extract, fromRGB: fromRGB, resizeArea: resizeArea, dhash: dhash, hamming: hamming };
});
