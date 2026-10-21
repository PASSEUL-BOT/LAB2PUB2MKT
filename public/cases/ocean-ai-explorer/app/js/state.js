/* state.js - everything the game remembers: settings, progress, each level's training pictures,
 * and the saved test results.  Stored on this device (IndexedDB) through storage.js. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var S = OAE.Storage, D = OAE.Dataset;
  var STEPS = ['look', 'teach', 'train', 'test', 'fix', 'compare'];
  var St = OAE.State = {
    STEPS: STEPS,
    settings: { nick: '', autoRead: false, muted: false, rate: 0.9, lively: true, onlineVoice: true, unlockAll: false },
    progress: {},          // levelId -> {look:true,...}
    entries: {},           // levelId -> [{id, source, label, trueClass, leaf, tags}]
    evals: {},             // levelId -> {test:[run], challenge:[run]}
    rejected: {},          // levelId -> {pictureId:true}
    celebrated: {}
  };
  var timers = {};
  function later(key, fn) { clearTimeout(timers[key]); timers[key] = setTimeout(function () { fn().catch(function () { }); }, 150); }

  St.load = async function () {
    var v;
    v = await S.getKV('settings', null); if (v) Object.assign(St.settings, v);
    v = await S.getKV('progress', null); if (v) St.progress = v;
    v = await S.getKV('celebrated', null); if (v) St.celebrated = v;
    for (var i = 0; i < OAE.cfg.levels.length; i++) {
      var id = OAE.cfg.levels[i].id;
      v = await S.getKV('entries:' + id, null); if (v) St.entries[id] = v;
      v = await S.getKV('evals:' + id, null); if (v) St.evals[id] = v;
      v = await S.getKV('rejected:' + id, null); if (v) St.rejected[id] = v;
    }
  };
  St.saveSettings = function () { return S.setKV('settings', St.settings).catch(function () { }); };
  St.saveProgress = function () { later('p', function () { return Promise.all([S.setKV('progress', St.progress), S.setKV('celebrated', St.celebrated)]); }); };
  St.saveEntries = function (id) { later('e' + id, function () { return S.setKV('entries:' + id, St.entries[id]); }); };
  St.saveEvals = function (id) { return S.setKV('evals:' + id, St.evals[id] || {}); };
  St.saveRejected = function (id) { later('r' + id, function () { return S.setKV('rejected:' + id, St.rejected[id] || {}); }); };

  /* ---------- training pictures */
  St.starterSet = function (level) {
    return D.images.filter(function (im) { return im.split === 'train' && level.classOf(im) && D.has(im.id); })
      .map(function (im) { return { id: im.id, source: 'builtin', label: level.classOf(im), trueClass: level.classOf(im), leaf: im.label, tags: im.tags }; });
  };
  St.getEntries = function (level) {
    if (!St.entries[level.id]) { St.entries[level.id] = St.starterSet(level); St.saveEntries(level.id); }
    return St.entries[level.id];
  };
  St.resetEntries = function (level) { St.entries[level.id] = St.starterSet(level); St.saveEntries(level.id); return St.entries[level.id]; };
  St.hasEntry = function (level, id) { return St.getEntries(level).some(function (e) { return e.id === id; }); };
  St.addEntry = function (level, e) {
    var list = St.getEntries(level);
    if (list.some(function (x) { return x.id === e.id; })) return false;
    e.added = e.added || Date.now(); list.push(e); St.saveEntries(level.id); return true;
  };
  St.removeEntry = function (level, id) {
    var list = St.getEntries(level), i = list.findIndex(function (e) { return e.id === id; });
    if (i >= 0) list.splice(i, 1); St.saveEntries(level.id); return i >= 0;
  };
  St.relabel = function (level, id, label) {
    var e = St.getEntries(level).find(function (x) { return x.id === id; });
    if (e) { e.label = label; St.saveEntries(level.id); }
  };
  St.reject = function (level, id, on) {
    var r = St.rejected[level.id] = St.rejected[level.id] || {};
    if (on) r[id] = true; else delete r[id];
    St.saveRejected(level.id);
  };

  /* ---------- progress */
  St.done = function (levelId, step) { return !!(St.progress[levelId] && St.progress[levelId][step]); };
  St.mark = function (levelId, step) {
    var p = St.progress[levelId] = St.progress[levelId] || {};
    if (!p[step]) { p[step] = Date.now(); St.saveProgress(); return true; }
    return false;
  };
  St.stepsDone = function (levelId) { return STEPS.filter(function (s) { return St.done(levelId, s); }).length; };
  St.complete = function (levelId) { return St.done(levelId, 'compare'); };
  /** A level opens when the one before it has been trained and tested (or a grown-up unlocked everything). */
  St.unlocked = function (levelId) {
    if (St.settings.unlockAll || levelId === 1) return true;
    if (levelId === 4) return St.done(3, 'test') || St.done(2, 'compare');
    return St.done(levelId - 1, 'test');
  };
  St.nextStep = function (levelId) {
    for (var i = 0; i < STEPS.length; i++) if (!St.done(levelId, STEPS[i])) return STEPS[i];
    return 'compare';
  };

  /* ---------- test runs (kept so that before/after comparisons are real) */
  St.runs = function (levelId, setId) { return ((St.evals[levelId] || {})[setId] || []); };
  St.addRun = function (levelId, setId, run) {
    var e = St.evals[levelId] = St.evals[levelId] || {};
    var list = e[setId] = e[setId] || [];
    list.push(run); while (list.length > 8) list.shift();
    return St.saveEvals(levelId);
  };
  St.lastRun = function (levelId, setId) { var r = St.runs(levelId, setId); return r.length ? r[r.length - 1] : null; };

  St.resetLevel = async function (level) {
    delete St.progress[level.id]; delete St.entries[level.id]; delete St.evals[level.id]; delete St.rejected[level.id];
    delete St.celebrated[level.id];
    OAE.Model && OAE.Model.forget(level.id);
    await Promise.all([S.del('kv', 'entries:' + level.id), S.del('kv', 'evals:' + level.id), S.del('kv', 'rejected:' + level.id)]);
    await S.setKV('progress', St.progress); await S.setKV('celebrated', St.celebrated);
  };
  St.resetAll = async function () {
    await S.wipeAll();
    St.progress = {}; St.entries = {}; St.evals = {}; St.rejected = {}; St.celebrated = {};
    St.settings = { nick: '', autoRead: false, muted: false, rate: 0.9, lively: true, onlineVoice: true, unlockAll: false };
    OAE.Model.nets = {}; OAE.Model.featMem = new Map();
  };
})();
