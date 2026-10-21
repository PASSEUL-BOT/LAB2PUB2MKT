/* util.js - tiny helpers shared by all screens. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var packs = {}, packWaiters = {};
  OAE.registerPack = function (leaf, imgs) { packs[leaf] = imgs; OAE.Packs = OAE.Packs || {}; for (var k in imgs) OAE.Packs[k] = imgs[k]; };

  var U = OAE.U = {};
  /** h('div.card#id', {onclick: fn, 'aria-label': 'x'}, child, 'text', [more]) */
  U.h = function (tag, attrs) {
    var m = /^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i.exec(tag) || [], el = document.createElement(m[1] || 'div'), i;
    (m[2] || '').replace(/([.#])([\w-]+)/g, function (_, t, n) { if (t === '.') el.classList.add(n); else el.id = n; });
    var start = 1;
    if (attrs && typeof attrs === 'object' && !(attrs instanceof Node) && !Array.isArray(attrs)) {
      start = 2;
      for (var k in attrs) {
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'class') v.split(' ').forEach(function (c) { if (c) el.classList.add(c); });
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'value') el.value = v;
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    for (i = start; i < arguments.length; i++) U.append(el, arguments[i]);
    return el;
  };
  U.append = function (el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { U.append(el, x); });
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  };
  U.svg = function (markup) { var d = document.createElement('div'); d.innerHTML = markup.trim(); return d.firstChild; };
  U.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  U.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  U.pct = function (x, d) { return (x * 100).toFixed(d == null ? 0 : d) + '%'; };
  U.sum = function (a) { return a.reduce(function (s, v) { return s + v; }, 0); };
  U.shuffle = function (arr, rnd) {
    var a = arr.slice(), r = rnd || Math.random;
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  U.plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); };
  U.cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  U.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  U.debounce = function (fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; };
  U.loadScript = function (src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = function () { res(); }; s.onerror = function () { rej(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  };
  U.yieldUI = function () { return new Promise(function (r) { requestAnimationFrame ? requestAnimationFrame(function () { setTimeout(r, 0); }) : setTimeout(r, 0); }); };
})();
