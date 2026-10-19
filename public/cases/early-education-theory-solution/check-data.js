'use strict';
/*
 * Checks data.js and blueprints.js.   Run:  node check-data.js
 * (Needs Node.js 18 or newer. Not needed to run the website itself.)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load(file) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), sandbox, { filename: file });
  return sandbox.window;
}

const problems = [];
const bad = (msg) => problems.push(msg);

const { LANDMARKS } = load('data.js');
if (!Array.isArray(LANDMARKS) || LANDMARKS.length === 0) bad('data.js: LANDMARKS is empty');

const ids = new Set();
const names = new Set();
for (const L of LANDMARKS || []) {
  const tag = 'id ' + L.id + ' (' + L.name + ')';
  if (!Number.isInteger(L.id)) bad(tag + ': id must be an integer');
  if (ids.has(L.id)) bad(tag + ': duplicate id');
  ids.add(L.id);
  if (names.has(L.name)) bad(tag + ': duplicate name');
  names.add(L.name);
  for (const k of ['category', 'country', 'city']) {
    const right = String(L[k] || '').trim();
    if (!right) { bad(tag + ': missing ' + k); continue; }
    const wr = (L.wrong && L.wrong[k]) || [];
    if (wr.length !== 2) bad(tag + ': ' + k + ' needs exactly 2 wrong options (has ' + wr.length + ')');
    const all = [right, ...wr].map((s) => String(s).trim().toLowerCase());
    if (new Set(all).size !== all.length) bad(tag + ': ' + k + ' options contain a duplicate or a wrong option equals the answer');
    for (const s of [right, ...wr]) if (String(s).length > 24) bad(tag + ': ' + k + ' option too long for a button: ' + s);
  }
  if (!L.intro || !/^Identification Complete: /.test(L.intro)) bad(tag + ': intro must start with "Identification Complete: "');
  if (L.intro && (L.intro.match(/[.!?](\s|$)/g) || []).length !== 1) bad(tag + ': intro must be exactly one sentence');
  if (L.intro && !L.intro.includes(L.city) && !/near/.test(L.intro)) bad(tag + ': intro should mention the city');
}

// Clues: exactly 3, short, and never reveal name / category / country / city (or nationality words).
const DEMONYMS = /\b(french|egyptian|australian|italian|roman|indian|chinese|american|emirati|arab|brazilian|cambodian|khmer|spanish|catalan|british|english|german|prussian|malaysian|japanese|canadian|russian|belgian|parisian|londoner|berliner|new york|giza|usa|u\.s\.)\b/i;
const STOP = new Set(['the', 'of', 'and', 'city', 'tower', 'towers']);
for (const L of LANDMARKS || []) {
  const tag = 'id ' + L.id + ' (' + L.name + ')';
  if (!Array.isArray(L.clues) || L.clues.length !== 3) { bad(tag + ': needs exactly 3 clues'); continue; }
  const secret = [L.name, L.category, L.country, L.city].join(' ').toLowerCase().split(/[^a-zà-ÿ']+/).filter((w) => w.length >= 3 && !(w === 'tower' && false));
  const words = new Set(secret.filter((w) => !['the', 'of', 'and'].includes(w)));
  L.clues.forEach((c, i) => {
    if (c.length > 110) bad(tag + ': clue ' + (i + 1) + ' is too long');
    const cw = c.toLowerCase().split(/[^a-zà-ÿ']+/);
    for (const w of cw) {
      const hit = [...words].find((x) => w === x || w === x + 's' || (x.endsWith('s') && w === x.slice(0, -1)));
      if (hit) bad(tag + ': clue ' + (i + 1) + ' gives away "' + hit + '"');
    }
    if (DEMONYMS.test(c)) bad(tag + ': clue ' + (i + 1) + ' uses a nationality or place word');
  });
}

const { BLUEPRINTS } = load('blueprints.js');
for (const L of LANDMARKS || []) {
  const svg = BLUEPRINTS && BLUEPRINTS[L.id];
  if (typeof svg !== 'string' || !svg.startsWith('<svg')) bad('id ' + L.id + ': no drawing in blueprints.js');
}
for (const id of Object.keys(BLUEPRINTS || {})) {
  if (!ids.has(Number(id))) bad('blueprints.js has a drawing for unknown id ' + id);
}

if (problems.length) {
  console.log('PROBLEMS FOUND:\n - ' + problems.join('\n - '));
  process.exit(1);
}
console.log('OK: ' + LANDMARKS.length + ' questions and ' + Object.keys(BLUEPRINTS).length + ' drawings are consistent.');
