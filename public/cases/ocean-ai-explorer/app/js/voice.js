/* voice.js - READ TO ME, with a lively, child-friendly storytelling style.
 *
 * It uses the speech voices that are already installed on this device (the browser's built-in speech
 * synthesis).  It only picks a voice that the browser says is a LOCAL voice, so no text is sent to an
 * online service.  If no local English voice exists the game says so and keeps all the written
 * instructions on screen.  No sound files are needed.
 *
 * "Ups and downs" (intonation): every sentence is cut into small phrases.  Each phrase gets its own
 * pitch, speed and a short pause, depending on what it says:
 *   question  -> the last phrase rises, a little slower and curious
 *   exclaim   -> brighter and quicker
 *   cheer     -> the brightest (Great! Hooray! Wow!)
 *   oops      -> lower and slower and gentle (Oops, not sure, mistake...)
 *   statement -> the voice goes up a little at the start and settles down at the end
 * The real sound still depends on the voices installed on the device (a different computer sounds
 * different), but the rhythm and the ups and downs are always applied. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var V = OAE.Voice = { state: 'idle', voice: null, supported: false, message: '', muted: false, rate: 0.9, lively: true, allowOnline: false, listeners: [] };
  var synth = window.speechSynthesis;

  function emit() { V.listeners.forEach(function (f) { try { f(V); } catch (e) { /* ignore */ } }); }
  V.onChange = function (f) { V.listeners.push(f); };

  /* Friendly-sounding voices that many systems have installed (any of them is only used when it is local). */
  var KIDDY = /(samantha|ava|allison|susan|zira|jenny|aria|karen|moira|tessa|serena|fiona|kate|female|child|junior|kid)/i;
  function score(v) {
    var s = 0;
    if (/^en[-_]US/i.test(v.lang)) s += 4; else if (/^en[-_](GB|AU|CA|IE|NZ)/i.test(v.lang)) s += 2;
    if (KIDDY.test(v.name || '')) s += 3;
    if (/(compact|enhanced|premium|natural)/i.test(v.name || '')) s += 1;
    return s;
  }
  function pickVoice() {
    if (!synth || !window.SpeechSynthesisUtterance) { V.supported = false; V.message = 'This browser cannot read aloud. You can still read the words on the screen.'; return; }
    var list = synth.getVoices() || [];
    var en = list.filter(function (v) { return /^en([-_]|$)/i.test(v.lang); });
    var local = en.filter(function (v) { return v.localService; });
    var usingOnline = false;
    if (!local.length && V.allowOnline && en.length) { local = en.slice(); usingOnline = true; }
    local.sort(function (a, b) { return score(b) - score(a); });
    if (local.length) { V.voice = local[0]; V.supported = true; V.message = usingOnline ? 'Using an online voice that you allowed in Grown-ups.' : ''; V.online = usingOnline; }
    else {
      V.voice = null; V.supported = false; V.online = false;
      V.message = en.length ? 'The only English voices here need the internet, so they are turned off. A grown-up can allow them in Grown-ups, or install an English voice in the computer settings. You can still read the words on the screen.'
        : (list.length ? 'No English voice is installed on this device. You can still read the words on the screen.' : 'No voice was found yet. You can still read the words on the screen.');
    }
  }
  V.init = function () {
    pickVoice();
    if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', function () { pickVoice(); emit(); });
    emit();
  };

  /* ---------- the "ups and downs" plan */
  var CHEER = /\b(great|hooray|yay|wow|awesome|amazing|congratulations|well done|brilliant|super|fantastic|you did it|learned something)\b/i;
  var OOPS = /\b(oops|uh-oh|mistake|mistakes|wrong|not sure|unsure|hard|confus\w*|sorry|stopped)\b/i;
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  /** Cut text into sentences, then into phrases.  Returns [{text, pitch, rate, pause}] (pause in ms). */
  V.plan = function (text, baseRate) {
    var base = baseRate || V.rate, out = [];
    var sentences = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*(?:\s|$)/g) || [];
    sentences.forEach(function (raw) {
      var s = raw.trim(); if (!s) return;
      var end = /[?]$/.test(s) ? '?' : /[!]$/.test(s) ? '!' : '.';
      var kind = CHEER.test(s) && end !== '?' ? 'cheer' : OOPS.test(s) ? 'oops' : end === '?' ? 'question' : end === '!' ? 'exclaim' : 'statement';
      var pitch0 = { cheer: 1.55, exclaim: 1.45, question: 1.3, oops: 1.0, statement: 1.25 }[kind];
      var rate0 = { cheer: 1.08, exclaim: 1.05, question: 0.95, oops: 0.85, statement: 1.0 }[kind];
      var parts = s.split(/(?<=[,;:])\s+/).filter(Boolean);
      parts.forEach(function (p, i) {
        var last = i === parts.length - 1, first = i === 0, pitch = pitch0, rate = rate0;
        if (kind === 'question') pitch += last ? 0.22 : 0;              // the question rises at the end
        else if (kind === 'cheer' || kind === 'exclaim') pitch += last ? 0.05 : 0.1;
        else if (kind === 'oops') pitch += last ? -0.05 : 0.05;
        else pitch += first && parts.length > 1 ? 0.1 : last ? -0.12 : 0;   // settles down at the end
        if (last && kind !== 'question') rate *= 0.95;                   // slows a little at the end of a sentence
        // very short phrases (names, "Wow!") are said a little slower and brighter so they stand out
        if (p.split(' ').length <= 2) { pitch += 0.1; rate *= 0.92; }
        out.push({ text: p, kind: kind, pitch: clamp(pitch, 0.5, 2), rate: clamp(rate * base, 0.5, 2), pause: last ? (kind === 'question' ? 420 : 340) : 170 });
      });
    });
    return out;
  };

  var queue = [], idx = 0, gap = null, speaking = false;
  function speakNext() {
    if (V.state !== 'playing') return;
    if (idx >= queue.length) { V.state = 'idle'; emit(); return; }
    var piece = queue[idx];
    var u = new SpeechSynthesisUtterance(piece.text);
    u.voice = V.voice; u.lang = V.voice ? V.voice.lang : 'en-US';
    u.rate = piece.rate; u.pitch = piece.pitch; u.volume = V.muted ? 0 : 1;
    speaking = true;
    function done() {
      if (!speaking) return; speaking = false; idx++;
      gap = setTimeout(function () { gap = null; speakNext(); }, V.lively ? piece.pause : 60);
    }
    u.onend = done; u.onerror = done;
    synth.speak(u);
  }
  function build(text) {
    var items = (Array.isArray(text) ? text : [text]), out = [];
    items.forEach(function (t) {
      if (V.lively) { var p = V.plan(t); if (p.length) { p[p.length - 1].pause = 520; out = out.concat(p); } }
      else { var s = String(t).replace(/\s+/g, ' ').trim(); if (s) out.push({ text: s, pitch: 1.1, rate: V.rate, pause: 200 }); }
    });
    return out;
  }
  /** Speak a list of sentences (or one string). */
  V.say = function (text) {
    if (!V.supported) { emit(); return false; }
    clearTimeout(gap); gap = null; speaking = false; synth.cancel();
    queue = build(text); idx = 0; V.state = 'playing'; emit(); speakNext(); return true;
  };
  V.pause = function () { if (V.state === 'playing' && synth) { synth.pause(); V.state = 'paused'; emit(); } };
  V.resume = function () {
    if (V.state === 'paused' && synth) {
      synth.resume(); V.state = 'playing'; emit();
      if (!speaking && !gap) speakNext();          // paused during a pause between phrases
    }
  };
  V.stop = function () { clearTimeout(gap); gap = null; speaking = false; if (synth) synth.cancel(); V.state = 'idle'; queue = []; emit(); };
  V.setMuted = function (m) {
    V.muted = !!m; if (V.muted && synth) { clearTimeout(gap); gap = null; speaking = false; synth.cancel(); if (V.state === 'playing') { V.state = 'idle'; } } emit();
  };
  V.setRate = function (r) { V.rate = r; };
  V.setAllowOnline = function (on) { V.allowOnline = !!on; pickVoice(); emit(); };
  V.setLively = function (on) { V.lively = !!on; };

  /** Short spoken reactions from Bubbles after big moments.  Only spoken when read-aloud is on. */
  V.reactions = {
    trained: function () { return 'Hooray! I learned something! Now, let us test me. Will I get them right?'; },
    tested: function (pct) {
      return pct >= 80 ? 'Wow! I did great! That is a high score!'
        : pct >= 50 ? 'Not bad! I got many right. But, oops, I made some mistakes. Let us find out why.'
          : 'Oops! That was hard for me. Do not worry. We can teach me more pictures!';
    },
    better: function () { return 'Yay! I got better! More good pictures helped me.'; },
    worse: function () { return 'Hmm, I did not get better this time. That is okay! Scientists try again.'; }
  };
  V.react = function (kind, arg) { if (V.supported && !V.muted && V.reactions[kind]) V.say(V.reactions[kind](arg)); };

  /** Collect the text of everything marked data-read on the screen, in order. */
  V.collect = function (root) {
    var out = [];
    (root || document).querySelectorAll('[data-read]').forEach(function (el) {
      var t = el.getAttribute('data-read') || el.innerText;
      if (t && el.offsetParent !== null) out.push(t);
    });
    return out;
  };
})();
