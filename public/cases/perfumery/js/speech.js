// Pronunciation using the browser's Web Speech API (speechSynthesis). No external service.
//
// Markup contract:
//   [data-en] (+ optional [data-fr])  = a pronounceable item (hover / focus plays English once)
//   button[data-speak="en|fr"]         = explicit pronounce button (click / tap / Enter)
// Nothing is claimed as played unless speechSynthesis.speak() was actually called.

export const speech = {
  hoverEnabled: true,
  muted: false,
  volume: 0.9,
  activated: false,       // set by the first user gesture (autoplay policy)
  currentEl: null,
  lastSpoken: null,       // {text, lang, voiceName} of the most recent speak() call (for tests/diagnostics)
  statusListeners: new Set()
};

const synth = () => (typeof window !== 'undefined' && window.speechSynthesis) || null;
export const isSupported = () => !!synth() && typeof window.SpeechSynthesisUtterance !== 'undefined';

function say(msg) { speech.statusListeners.forEach(fn => fn(msg)); }
export function onStatus(fn) { speech.statusListeners.add(fn); }

// Best voice for a language. Never returns a voice of another language, so English is never read by
// a Chinese voice and French is never read by an English one. Within the language, prefer the most
// natural-sounding engines: Edge "Online (Natural)" voices, then Google / Apple / Microsoft neural ones.
export function findVoice(langPrefix) {
  const s = synth(); if (!s) return null;
  const voices = (s.getVoices ? s.getVoices() : []).filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix));
  if (!voices.length) return null;
  const want = langPrefix === 'fr' ? ['fr-fr'] : ['en-us', 'en-gb'];
  const score = v => {
    const n = (v.name || '').toLowerCase(), l = v.lang.toLowerCase().replace('_', '-');
    let sc = 0;
    if (/natural/.test(n)) sc += 100;
    if (/online/.test(n)) sc += 40;
    if (/google/.test(n)) sc += 60;
    if (/(premium|enhanced|neural|siri|samantha|thomas|amelie|audrey|aria|jenny|denise|henri|eloise)/.test(n)) sc += 30;
    const k = want.indexOf(l); if (k >= 0) sc += 20 - k * 5;
    return sc;
  };
  return voices.slice().sort((a, b) => score(b) - score(a))[0];
}

// Symbols that a voice would read aloud or stumble on (slashes, bullets, arrows, emoji) are removed.
function cleanForSpeech(t) { return String(t).replace(/[\/|·•→←↑↓✓✕★]+/g, ' ').replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim(); }

export function speak(text, lang) {
  if (!text) return false;
  if (!isSupported()) { say('Speech is not supported in this browser.'); return false; }
  if (speech.muted) { say('Sound is muted. Turn Mute off to hear pronunciation.'); return false; }
  if (!speech.activated) { say('Tap or press any key once to enable sound.'); return false; }
  const prefix = lang === 'fr' ? 'fr' : 'en';
  const voice = findVoice(prefix);
  const loaded = (synth().getVoices ? synth().getVoices() : []).length > 0;
  if (prefix === 'en' && !voice && loaded) {
    say('No English voice is installed on this device. Install English (United States) in your system speech settings, then reload this page.');
    return false;
  }
  if (prefix === 'fr' && !voice && loaded) {
    say('No French voice is installed on this device, so French cannot be played. Install a French voice in your system speech settings, then reload this page.');
    return false;
  }
  const s = synth();
  s.cancel();                                   // never overlap two utterances
  const u = new window.SpeechSynthesisUtterance(cleanForSpeech(text));
  u.lang = prefix === 'fr' ? 'fr-FR' : 'en-US';
  if (voice) u.voice = voice;
  u.volume = speech.volume;
  u.rate = 0.95; u.pitch = 1.08;
  s.speak(u);
  speech.lastSpoken = { text, lang: u.lang, voiceName: voice ? voice.name : null };
  say('');
  return true;
}

// Long narration: split into short sentences and queue them (some engines cut long utterances).
// Same rules as speak(): muted / not unlocked / no French voice -> nothing is played and a message is shown.
export function speakLong(text, lang) {
  if (!text) return false;
  const first = [];
  const parts = text.replace(/\s+/g, ' ').match(/[^.!?;:]+[.!?;:]?/g) || [text];
  const chunks = []; let cur = '';
  for (const part of parts) { if ((cur + part).length > 170 && cur) { chunks.push(cur.trim()); cur = part; } else cur += part; }
  if (cur.trim()) chunks.push(cur.trim());
  if (!speak(chunks[0], lang)) return false;
  const s = synth(), prefix = lang === 'fr' ? 'fr' : 'en', voice = findVoice(prefix);
  for (const c of chunks.slice(1)) {
    const u = new window.SpeechSynthesisUtterance(cleanForSpeech(c));
    u.lang = prefix === 'fr' ? 'fr-FR' : 'en-US'; if (voice) u.voice = voice; u.volume = speech.volume; u.rate = 0.95; u.pitch = 1.08;
    s.speak(u); speech.lastSpoken = { text: c, lang: u.lang, voiceName: voice ? voice.name : null };
  }
  return true;
}

export function stop() { const s = synth(); if (s) s.cancel(); }

function itemOf(target) { return target && target.closest ? target.closest('[data-en]') : null; }

// A "unit" is a pronounceable item: hover reads the English once. French is read only when the FR
// button is pressed (click or Enter), never on hover.
function unitOf(target) {
  const it = itemOf(target);
  return it ? { el: it, text: it.dataset.en, lang: 'en' } : null;
}

export function initSpeech(root = document) {
  const activate = () => { speech.activated = true; };
  root.addEventListener('pointerdown', activate, { capture: true });
  root.addEventListener('keydown', activate, { capture: true });

  // HOVER: mouse only. Plays English once per entry; moving to another item cancels the old one.
  root.addEventListener('pointerover', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const u = unitOf(e.target);
    if (!u || u.el === speech.currentEl) return;      // same item -> never repeat
    speech.currentEl = u.el;
    if (!speech.hoverEnabled) return;
    speak(u.text, u.lang);
  });
  root.addEventListener('pointerout', e => {
    const u = unitOf(e.target);
    if (!u || u.el !== speech.currentEl) return;
    const to = unitOf(e.relatedTarget);
    if (to && to.el === u.el) return;                // moving inside the same item
    speech.currentEl = null;
  });

  // KEYBOARD: focusing a pronounceable item (via keyboard) plays English once.
  root.addEventListener('focusin', e => {
    const el = itemOf(e.target);
    if (!el || !speech.hoverEnabled) return;
    let kb = true;
    try { kb = e.target.matches(':focus-visible'); } catch (_) { kb = true; }
    if (!kb) return;
    if (el === speech.currentEl) return;
    speech.currentEl = el;
    speak(el.dataset.en, 'en');
  });

  // CLICK / TAP: explicit buttons (works on touch, where there is no hover).
  root.addEventListener('click', e => {
    const b = e.target.closest ? e.target.closest('button[data-speak]') : null;
    if (!b) return;
    const el = itemOf(b);
    if (!el) return;
    const lang = b.dataset.speak;
    speech.activated = true;
    speak(lang === 'fr' ? (el.dataset.fr || el.dataset.en) : el.dataset.en, lang);
  });
}

export function setHoverEnabled(v) { speech.hoverEnabled = !!v; if (!v) stop(); }
export function setMuted(v) { speech.muted = !!v; if (v) stop(); }
export function setVolume(v) { speech.volume = Math.max(0, Math.min(1, Number(v))); }
