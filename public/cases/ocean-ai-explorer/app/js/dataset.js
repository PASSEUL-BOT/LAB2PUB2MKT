/* dataset.js - the bundled picture library: manifest, picture data, decoding and search. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var U = OAE.U, F = OAE.Features;
  var D = OAE.Dataset = { images: [], byId: {}, bySplit: {}, byLeaf: {}, taxonomy: null, state: 'idle', missing: [], packsLoaded: 0 };

  D.init = function () {
    var data = OAE.data;
    D.taxonomy = data.taxonomy;
    D.images = data.manifest.images;
    D.images.forEach(function (im) {
      D.byId[im.id] = im;
      (D.bySplit[im.split] = D.bySplit[im.split] || []).push(im);
      (D.byLeaf[im.label] = D.byLeaf[im.label] || []).push(im);
    });
    return D;
  };
  D.leaves = function () { return Object.keys(D.taxonomy.leaves); };
  D.leafInfo = function (leaf) { return D.taxonomy.leaves[leaf]; };
  D.counts = function () {
    var c = {};
    D.images.forEach(function (im) { var s = c[im.label] = c[im.label] || { train: 0, pool: 0, validation: 0, test: 0, challenge: 0, total: 0 }; s[im.split]++; s.total++; });
    return c;
  };

  /** Load picture packs (plain scripts, so this works even from file://).  Reports progress 0..1. */
  D.loadPacks = function (onProgress) {
    D.state = 'loading';
    var leaves = D.leaves(), done = 0, idx = 0, workers = 3;
    function next() {
      if (idx >= leaves.length) return Promise.resolve();
      var leaf = leaves[idx++];
      return U.loadScript('assets/pack/' + leaf + '.js').catch(function () { /* checked in verify */ }).then(function () {
        done++; D.packsLoaded = done; if (onProgress) onProgress(done / leaves.length); return next();
      });
    }
    var ps = []; for (var i = 0; i < workers; i++) ps.push(next());
    return Promise.all(ps).then(D.verify);
  };

  /** Check that every picture in the manifest is really available (from its pack, or as a loose file). */
  D.looseOk = {};
  D.verify = function () {
    var missing = [];
    D.images.forEach(function (im) { if (!(OAE.Packs && OAE.Packs[im.id])) missing.push(im.id); });
    D.looseOk = {};
    // a picture whose pack did not load may still be a loose file when the game is served from its folder
    var idx = 0, workers = 6;
    function one() {
      if (idx >= missing.length) return Promise.resolve();
      var id = missing[idx++];
      return new Promise(function (res) { var i = new Image(); i.onload = function () { D.looseOk[id] = true; res(); }; i.onerror = function () { res(); }; i.src = D.byId[id].path; }).then(one);
    }
    var ps = []; for (var w = 0; w < workers; w++) ps.push(one());
    return Promise.all(ps).then(function () {
      D.missing = missing.filter(function (id) { return !D.looseOk[id]; });
      D.state = D.missing.length ? 'incomplete' : 'ready';
      return D.state;
    });
  };
  /** Is this library picture really available right now? */
  D.has = function (id) { return !!((OAE.Packs && OAE.Packs[id]) || D.looseOk[id]); };

  D.url = function (id) { return (OAE.Packs && OAE.Packs[id]) || (D.byId[id] && D.looseOk[id] && D.byId[id].path) || null; };

  /** Decode a picture URL to 160x160 RGBA bytes (centre-crop). */
  D.decodeURL = function (url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        try {
          var S = 160, c = document.createElement('canvas'); c.width = c.height = S;
          var ctx = c.getContext('2d', { willReadFrequently: true });
          var m = Math.min(img.naturalWidth, img.naturalHeight), sx = (img.naturalWidth - m) / 2, sy = (img.naturalHeight - m) / 2;
          ctx.drawImage(img, sx, sy, m, m, 0, 0, S, S);
          resolve({ data: ctx.getImageData(0, 0, S, S).data, w: S, h: S, canvas: c });
        } catch (e) { reject(new Error('The browser would not let the game read this picture. ' + e.message)); }
      };
      img.onerror = function () { reject(new Error('This picture could not be opened.')); };
      img.src = url;
    });
  };
  D.decode = function (id) {
    var u = D.url(id);
    if (!u) return Promise.reject(new Error('Picture ' + id + ' is missing.'));
    return D.decodeURL(u);
  };

  /** Library = only pictures that may be shown with their labels (training + extra pool). */
  D.libraryImages = function () { return D.images.filter(function (im) { return (im.split === 'train' || im.split === 'pool') && D.has(im.id); }); };
  D.search = function (opt) {
    var q = (opt.q || '').trim().toLowerCase(), tax = D.taxonomy;
    return D.libraryImages().filter(function (im) {
      var leaf = tax.leaves[im.label], grp = tax.groups[im.group];
      if (opt.group && im.group !== opt.group) return false;
      if (opt.habitat && im.habitat !== opt.habitat) return false;
      if (opt.tag && im.tags.indexOf(opt.tag) < 0) return false;
      if (opt.kind && im.kind !== opt.kind) return false;
      if (q) {
        var hay = (leaf.label + ' ' + grp.label + ' ' + im.habitat + ' ' + im.tags.join(' ').replace(/_/g, ' ')).toLowerCase();
        return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
      }
      return true;
    });
  };
  D.isSecret = function (id) { var im = D.byId[id]; return !im || OAE.cfg.secretSplits.indexOf(im.split) >= 0; };
})();
