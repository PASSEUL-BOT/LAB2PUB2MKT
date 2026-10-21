/* storage.js - saves progress, settings, trained AI brains, picture numbers and imported pictures
 * on this device only (IndexedDB).  Nothing is ever sent anywhere.
 * If IndexedDB is not available (some private windows) it falls back to memory and says so. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var DB = 'ocean-ai-explorer', VER = 1, STORES = ['kv', 'models', 'features', 'imports'];
  var db = null, mem = {}, listeners = [];
  var S = OAE.Storage = { mode: 'closed', error: null };
  STORES.forEach(function (s) { mem[s] = new Map(); });

  S.onProblem = function (fn) { listeners.push(fn); };
  function problem(msg) { S.lastProblem = msg; listeners.forEach(function (f) { try { f(msg); } catch (e) { /* ignore */ } }); }

  S.open = function () {
    return new Promise(function (resolve) {
      var done = false;
      function fallback(err) {
        if (done) return; done = true;
        S.mode = 'memory'; S.error = (err && err.message) || String(err || 'IndexedDB is not available');
        resolve(S);
      }
      try {
        if (!window.indexedDB) return fallback(new Error('IndexedDB is not available in this browser.'));
        var req = indexedDB.open(DB, VER);
        req.onupgradeneeded = function () { STORES.forEach(function (s) { if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s); }); };
        req.onsuccess = function () { if (done) return; done = true; db = req.result; S.mode = 'idb'; resolve(S); };
        req.onerror = function () { fallback(req.error); };
        req.onblocked = function () { fallback(new Error('The saved data is locked by another window.')); };
        setTimeout(function () { fallback(new Error('Opening saved data took too long.')); }, 4000);
      } catch (e) { fallback(e); }
    });
  };

  function wrapErr(e) {
    var name = e && e.name;
    if (name === 'QuotaExceededError' || (e && /quota/i.test(e.message || ''))) {
      var err = new Error('This device is out of space. Free some space, or ask a grown-up to press RESET in the Grown-ups page to delete saved AI brains.');
      err.code = 'quota'; return err;
    }
    return e;
  }

  function tx(store, mode) { return db.transaction(store, mode).objectStore(store); }
  function p(req) { return new Promise(function (res, rej) { req.onsuccess = function () { res(req.result); }; req.onerror = function () { rej(wrapErr(req.error)); }; }); }

  S.get = function (store, key) {
    if (S.mode !== 'idb') return Promise.resolve(mem[store].get(key));
    return p(tx(store, 'readonly').get(key));
  };
  S.put = function (store, key, val) {
    if (S.mode !== 'idb') { mem[store].set(key, val); return Promise.resolve(); }
    return new Promise(function (res, rej) {
      try {
        var t = db.transaction(store, 'readwrite'); t.objectStore(store).put(val, key);
        t.oncomplete = function () { res(); };
        t.onerror = t.onabort = function () { var e = wrapErr(t.error); problem(e.message); rej(e); };
      } catch (e) { var w = wrapErr(e); problem(w.message); rej(w); }
    });
  };
  S.del = function (store, key) {
    if (S.mode !== 'idb') { mem[store].delete(key); return Promise.resolve(); }
    return p(tx(store, 'readwrite').delete(key));
  };
  S.clear = function (store) {
    if (S.mode !== 'idb') { mem[store].clear(); return Promise.resolve(); }
    return p(tx(store, 'readwrite').clear());
  };
  S.all = function (store) {
    if (S.mode !== 'idb') return Promise.resolve(Array.from(mem[store].entries()));
    return new Promise(function (res, rej) {
      var out = [], r = tx(store, 'readonly').openCursor();
      r.onsuccess = function () { var c = r.result; if (c) { out.push([c.key, c.value]); c.continue(); } else res(out); };
      r.onerror = function () { rej(r.error); };
    });
  };
  S.getMany = function (store, keys) {
    if (S.mode !== 'idb') return Promise.resolve(keys.map(function (k) { return mem[store].get(k); }));
    return new Promise(function (res, rej) {
      var t = db.transaction(store, 'readonly'), os = t.objectStore(store), out = new Array(keys.length);
      keys.forEach(function (k, i) { var r = os.get(k); r.onsuccess = function () { out[i] = r.result; }; });
      t.oncomplete = function () { res(out); };
      t.onerror = t.onabort = function () { rej(t.error); };
    });
  };
  S.putMany = function (store, pairs) {
    if (S.mode !== 'idb') { pairs.forEach(function (kv) { mem[store].set(kv[0], kv[1]); }); return Promise.resolve(); }
    return new Promise(function (res, rej) {
      try {
        var t = db.transaction(store, 'readwrite'), os = t.objectStore(store);
        pairs.forEach(function (kv) { os.put(kv[1], kv[0]); });
        t.oncomplete = function () { res(); };
        t.onerror = t.onabort = function () { var e = wrapErr(t.error); problem(e.message); rej(e); };
      } catch (e) { var w = wrapErr(e); problem(w.message); rej(w); }
    });
  };
  S.wipeAll = function () { return Promise.all(STORES.map(function (s) { return S.clear(s); })); };
  S.estimate = function () {
    if (navigator.storage && navigator.storage.estimate) return navigator.storage.estimate().catch(function () { return null; });
    return Promise.resolve(null);
  };
  /** kv helpers with JSON-safe values */
  S.getKV = function (k, dflt) { return S.get('kv', k).then(function (v) { return v === undefined ? dflt : v; }); };
  S.setKV = function (k, v) { return S.put('kv', k, v); };
})();
