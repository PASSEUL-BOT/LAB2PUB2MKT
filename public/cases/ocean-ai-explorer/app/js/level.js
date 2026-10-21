/* level.js - the level screen: step path, LOOK (explore pictures) and TEACH (choose training pictures,
 * add library pictures, import pictures).  TRAIN/TEST are in train.js; FIX/AGAIN are in report.js. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var U = OAE.U, h = U.h, A = OAE.Art, D = OAE.Dataset, St = OAE.State, M = OAE.Model, S = OAE.Storage, UI = OAE.UI;
  var LS = OAE.LevelScreen = { steps: {} };
  UI.importUrls = {};

  var STEPINFO = {
    look: ['LOOK', 'eye'], teach: ['TEACH', 'book'], train: ['TRAIN', 'brain'], test: ['TEST', 'check'], fix: ['FIX', 'search'], compare: ['AGAIN', 'refresh']
  };

  UI.loadImports = function () {
    return S.all('imports').then(function (rows) { rows.forEach(function (kv) { UI.importUrls[kv[0]] = kv[1].dataUrl; }); }).catch(function () { });
  };
  var basePic = UI.pic;
  UI.pic = function (id, alt, cls) {
    if (!D.byId[id] && UI.importUrls[id]) {
      var img = h('img.pic' + (cls ? '.' + cls : ''), { alt: alt || 'Imported picture', src: UI.importUrls[id], draggable: 'false' });
      return h('span.picwrap' + (cls ? '.' + cls : ''), img);
    }
    return basePic(id, alt, cls);
  };

  /** Can the child open this step yet? */
  function stepReady(L, step) {
    if (step === 'test') return M.has(L.id);
    if (step === 'fix' || step === 'compare') return St.runs(L.id, 'test').length > 0 || St.runs(L.id, 'challenge').length > 0;
    return true;
  }
  LS.stepReady = stepReady;

  function stepper(L, step) {
    var ol = h('ol.stepper', { 'aria-label': 'Steps in this level' });
    St.STEPS.forEach(function (s, i) {
      var ok = stepReady(L, s), done = St.done(L.id, s), cur = s === step;
      var inner = [h('span.st-dot', done ? UI.icon('check', 16) : String(i + 1)), h('span.st-name', STEPINFO[s][0])];
      ol.appendChild(h('li' + (cur ? '.cur' : '') + (done ? '.done' : '') + (ok ? '' : '.off'),
        ok ? h('a', { href: '#/level/' + L.id + '/' + s, 'aria-current': cur ? 'step' : null }, inner) : h('span', { 'aria-disabled': 'true', title: s === 'test' ? 'Train your AI first' : 'Run a test first' }, inner)));
    });
    return ol;
  }

  LS.render = function (L, step, extra) {
    if (!STEPINFO[step]) step = 'look';
    var content;
    if (!stepReady(L, step)) { UI.toast(step === 'test' ? 'Train your AI first.' : 'Run a test first.', 'warn'); step = step === 'test' ? 'train' : 'test'; if (!M.has(L.id)) step = 'train'; }
    var root = h('div.screen.levelscreen.lv' + L.id);
    root.appendChild(h('div.lvhead',
      h('a.backlink', { href: '#/map' }, UI.icon('back', 20), 'MAP'),
      h('div.lvtitle', h('span.lvnum', L.optional ? 'BONUS LEVEL' : 'LEVEL ' + L.id), h('h1', { 'data-read': 'Level ' + L.id + '. ' + L.title }, L.title)),
      stepper(L, step),
      UI.btn('PLAY LEVEL AGAIN', { kind: 'ghost', icon: 'refresh', cls: 'restartbtn', onclick: function () { UI.restartLevel(L); } })));
    return Promise.resolve(UI.loadImports()).then(function () {
      var fn = LS.steps[step];
      return Promise.resolve(fn(L, extra || [])).then(function (node) { root.appendChild(node); return root; });
    });
  };

  /* ================================================================= LOOK */
  var PAGE = 24;
  function habitatChip(im) { return UI.chip(im.habitat, im.habitat === 'OCEAN' ? '#19b7c9' : im.habitat === 'COASTAL' ? '#ffb703' : '#5fd3a0', 'small'); }

  function openPicture(L, im) {
    var tax = D.taxonomy, leaf = tax.leaves[im.label], grp = tax.groups[im.group], cls = L.classOf(im) || L.expectedOf(im) || 'unsure';
    var tags = im.tags.map(function (t) { return OAE.cfg.tagNames[t] || t; });
    UI.modal(h('div.picmodal',
      h('div.big', UI.pic(im.id, leaf.label + ': ' + im.alt)),
      h('div.info', h('h2', leaf.label), h('div.row.wrap', UI.classChip(L, cls), habitatChip(im), UI.chip(grp.label, '#8f7cf0', 'small')),
        h('p.fact', leaf.fact), grp.fact ? h('p.fact2', grp.fact) : null,
        tags.length ? h('p.tricky', h('b', 'A tricky picture: '), tags.join(', ') + '.') : null,
        cls === 'unsure' ? h('p.tricky', 'This level does not teach this group. The right answer for the AI is UNSURE.') : null)), { title: leaf.label, wide: true });
  }

  LS.steps.look = function (L) {
    var root = h('div.stepbody');
    root.appendChild(UI.bubblesSays(L.mission, 'happy'));
    root.appendChild(h('section.panel', h('h2', 'What you will learn'), h('ul.learn', L.learn.map(function (t) { return h('li', { 'data-read': '' }, t); }))));
    var cards = h('div.classcards');
    L.classes.forEach(function (c) { cards.appendChild(h('div.classcard', { style: { '--c': c.color } }, h('h3', c.label), h('p', c.fact))); });
    if (L.unsureAllowed) cards.appendChild(h('div.classcard', { style: { '--c': '#8a95a8' } }, h('h3', 'UNSURE'), h('p', 'A good AI says UNSURE when it does not know. This is better than a wrong guess.')));
    root.appendChild(h('section.panel', h('h2', 'The groups'), cards));
    if (L.id === 4) root.appendChild(LS.familyTree(L));

    // searchable library
    var all = D.libraryImages().filter(function (im) { return L.classOf(im) || L.expectedOf(im); });
    (function mix() {   // show a mix of different animals first, not 20 clownfish in a row
      var seen = {}; all.forEach(function (im) { im._k = (seen[im.label] = (seen[im.label] || 0) + 1); });
      all = all.slice().sort(function (a, b) { return a._k - b._k || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0); });
    })();
    var state = { q: '', cls: '', hab: '', shown: PAGE };
    var grid = h('div.picgrid'), count = h('p.small'), more = h('div.row');
    var q = h('input.search', { type: 'search', placeholder: 'Search: dolphin, jellyfish, bag...', 'aria-label': 'Search pictures', oninput: U.debounce(function () { state.q = q.value; state.shown = PAGE; draw(); }, 150) });
    var chips = h('div.filters', { role: 'group', 'aria-label': 'Filter by group' });
    function mkChip(label, val, color) {
      var b = h('button.fchip' + (state.cls === val ? '.on' : ''), { type: 'button', style: color ? { '--c': color } : null, 'aria-pressed': state.cls === val ? 'true' : 'false', onclick: function () { state.cls = val; state.shown = PAGE; drawChips(); draw(); } }, label);
      return b;
    }
    function drawChips() {
      U.clear(chips); chips.appendChild(mkChip('ALL', ''));
      L.classes.forEach(function (c) { chips.appendChild(mkChip(c.label, c.id, c.color)); });
      if (L.unsureAllowed) chips.appendChild(mkChip('NOT TAUGHT', 'unsure', '#8a95a8'));
    }
    var hab = h('select.habsel', { 'aria-label': 'Where does it live?', onchange: function () { state.hab = hab.value; state.shown = PAGE; draw(); } },
      h('option', { value: '' }, 'Any place'), h('option', { value: 'OCEAN' }, 'OCEAN'), h('option', { value: 'COASTAL' }, 'COASTAL'), h('option', { value: 'FRESHWATER' }, 'FRESHWATER'));
    function match(im) {
      var cls = L.classOf(im) || 'unsure';
      if (state.cls && cls !== state.cls) return false;
      if (state.hab && im.habitat !== state.hab) return false;
      if (state.q) {
        var leaf = D.taxonomy.leaves[im.label], hay = (leaf.label + ' ' + D.taxonomy.groups[im.group].label + ' ' + im.habitat + ' ' + im.tags.join(' ').replace(/_/g, ' ')).toLowerCase();
        return state.q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
      }
      return true;
    }
    function draw() {
      var list = all.filter(match);
      U.clear(grid); U.clear(more);
      if (!list.length) grid.appendChild(h('div.empty', U.svg(A.bubbles('think', 90)), h('p', 'No pictures match. Try a different word or press ALL.')));
      list.slice(0, state.shown).forEach(function (im) {
        var leaf = D.taxonomy.leaves[im.label], cls = L.classOf(im) || 'unsure';
        grid.appendChild(h('button.piccard', { type: 'button', onclick: function () { openPicture(L, im); }, 'aria-label': leaf.label + ', ' + (cls === 'unsure' ? 'not taught' : L.cls[cls].label) },
          UI.pic(im.id, leaf.label), h('span.pc-name', leaf.label), UI.classChip(L, cls)));
      });
      count.textContent = 'Showing ' + Math.min(state.shown, list.length) + ' of ' + list.length + ' pictures.';
      if (list.length > state.shown) more.appendChild(UI.btn('SHOW MORE', { kind: 'secondary', onclick: function () { state.shown += PAGE; draw(); } }));
    }
    drawChips(); draw();
    root.appendChild(h('section.panel', h('h2', 'Look at the pictures'), h('p', { 'data-read': '' }, 'Look at the picture. What do you see? Tap a picture to learn more.'),
      h('div.toolbar', q, hab), chips, count, grid, more));
    root.appendChild(h('div.nextbar', UI.btn('I AM READY! CHOOSE TRAINING PICTURES', { kind: 'primary', big: true, icon: 'arrow', onclick: function () { St.mark(L.id, 'look'); UI.go('/level/' + L.id + '/teach'); } })));
    return root;
  };

  /* Level 4: the animal family tree (HTML boxes inside boxes) */
  LS.familyTree = function (L) {
    var G = D.taxonomy.groups, shown = h('div.treeinfo', h('p', 'Tap a group to see what it means.'));
    function node(id, extra) {
      var g = G[id] || { label: id.toUpperCase(), fact: '' }, c = L.cls[id];
      return h('button.tnode', { type: 'button', style: { '--c': c ? c.color : '#8a95a8' }, onclick: function () {
        U.clear(shown); shown.appendChild(h('h3', g.label)); shown.appendChild(h('p', g.fact || '')); if (extra) shown.appendChild(h('p.small', extra));
      } }, g.label);
    }
    var H = OAE.cfg.hierarchy;
    var tree = h('div.tree',
      h('div.tnode.root', 'ANIMALS'),
      h('div.tbranches',
        h('div.tbranch', h('div.tlabel', 'VERTEBRATES (have a backbone)'), h('div.tleaves', H.vertebrates.map(function (g) { return node(g, g === 'marine_mammals' ? 'There are many kinds of mammals on land too. This game only has marine mammals.' : ''); }))),
        h('div.tbranch', h('div.tlabel', 'INVERTEBRATES (no backbone)'), h('div.tleaves',
          h('div.tarthro', h('div.tlabel.small', 'ARTHROPODS'), h('div.tleaves', H.arthropods.map(function (g) { return node(g); }))),
          ['mollusks', 'cnidarians', 'echinoderms', 'sponges', 'worms'].map(function (g) { return node(g); })))));
    return h('section.panel', h('h2', 'The animal family tree'),
      h('p', { 'data-read': '' }, 'Vertebrates and invertebrates are two big groupings. Crustaceans, insects, and arachnids are all arthropods. These groups are not all the same rank, so the tree is only a simple picture.'),
      tree, shown);
  };

  /* ================================================================= TEACH */
  function classCounts(L, entries) {
    var c = {}; L.classIds.forEach(function (id) { c[id] = 0; }); entries.forEach(function (e) { if (c[e.label] != null) c[e.label]++; }); return c;
  }
  LS.classCounts = classCounts;

  function pickLabel(L, entry, done) {
    var m = UI.modal(h('div.labelpick', h('h2', 'Change the label'), h('p', 'What is in this picture?'), h('div.big-sm', UI.pic(entry.id, 'Training picture')),
      h('div.row.wrap', L.classes.map(function (c) { return h('button.fchip.on', { type: 'button', style: { '--c': c.color }, onclick: function () { St.relabel(L, entry.id, c.id); m.close(); done(); } }, c.label); })),
      h('p.small', 'Careful! If you give a picture the wrong label, the AI may learn the wrong thing. Scientists check their labels.')), { title: 'Change the label' });
  }

  LS.steps.teach = function (L) {
    var root = h('div.stepbody'), entries = St.getEntries(L);
    var body = h('div.teachgrid'), summary = h('aside.panel.sticky'), lists = h('div.trainlists');
    var open = {};

    function drawSummary() {
      var counts = classCounts(L, St.getEntries(L)), total = St.getEntries(L).length, max = Math.max.apply(null, L.classIds.map(function (c) { return counts[c]; }).concat([1]));
      var bad = L.classIds.filter(function (c) { return counts[c] < 2; });
      U.clear(summary);
      summary.appendChild(h('h2', 'Bubbles\' lesson'));
      summary.appendChild(h('p.big', h('b', String(total)), ' training pictures'));
      L.classes.forEach(function (c) {
        summary.appendChild(h('div.cbar', { style: { '--c': c.color } }, h('span', c.label), h('div.bar', h('i', { style: { width: (counts[c.id] / max * 100) + '%' } })), h('b', String(counts[c.id]))));
      });
      if (bad.length) summary.appendChild(h('div.banner.warn', 'Bubbles needs at least 2 pictures of every group. Add pictures for: ' + bad.map(function (c) { return L.cls[c].label; }).join(', ') + '.'));
      var skew = L.classIds.length > 1 && Math.max.apply(null, L.classIds.map(function (c) { return counts[c]; })) > 3 * Math.max(1, Math.min.apply(null, L.classIds.map(function (c) { return counts[c]; })));
      if (!bad.length && skew) summary.appendChild(h('p.tip', 'Tip: one group has many more pictures than another. The AI may pay too much attention to the big group.'));
      summary.appendChild(h('p.tip', { 'data-read': '' }, 'Tip: more pictures is not always better. Good, different pictures are best.'));
      summary.appendChild(h('div.stack',
        UI.btn('ADD PICTURES FROM THE LIBRARY', { kind: 'secondary', icon: 'plus', onclick: function () { LS.picker(L, null, redraw); } }),
        UI.btn('IMPORT A PICTURE', { kind: 'secondary', icon: 'image', onclick: function () { LS.importer(L, redraw); } }),
        UI.btn('START OVER', { kind: 'ghost', icon: 'refresh', onclick: function () { UI.confirm({ title: 'Start over?', text: 'This puts back the starter pictures and removes the pictures you added or changed in this level.', yes: 'YES, START OVER' }).then(function (ok) { if (ok) { St.resetEntries(L); redraw(); } }); } }),
        UI.btn('TRAIN MY AI', { kind: 'primary', big: true, icon: 'brain', disabled: bad.length > 0, onclick: function () { St.mark(L.id, 'teach'); UI.go('/level/' + L.id + '/train'); } })));
    }

    function drawLists() {
      U.clear(lists);
      var all = St.getEntries(L);
      L.classes.forEach(function (c) {
        var mine = all.filter(function (e) { return e.label === c.id; }).sort(function (a, b) { return (b.added || 0) - (a.added || 0); }), lim = open[c.id] ? mine.length : 12;   // newest first
        var grid = h('div.picgrid.small');
        mine.slice(0, lim).forEach(function (e) {
          var wrong = e.trueClass != null && e.trueClass !== e.label, im = D.byId[e.id];
          grid.appendChild(h('div.tcard' + (wrong ? '.wrong' : ''),
            UI.pic(e.id, im ? D.taxonomy.leaves[im.label].label : 'Your picture'),
            h('div.tc-name', im ? D.taxonomy.leaves[im.label].label : 'My picture', e.added ? h('span.newtag', 'NEW') : null),
            wrong ? h('div.tc-warn', 'Different from the library label', h('button.linkbtn', { type: 'button', onclick: function () { St.relabel(L, e.id, e.trueClass); redraw(); } }, 'FIX')) : null,
            h('div.tc-tools',
              h('button.mini', { type: 'button', title: 'Change label', 'aria-label': 'Change label', onclick: function () { pickLabel(L, e, redraw); } }, UI.icon('search', 16)),
              h('button.mini.bad', { type: 'button', title: 'Remove from training', 'aria-label': 'Remove ' + (im ? D.taxonomy.leaves[im.label].label : 'picture') + ' from training', onclick: function () { St.removeEntry(L, e.id); if (e.source === 'import') { S.del('imports', e.id); delete UI.importUrls[e.id]; } redraw(); } }, UI.icon('cross', 16)))));
        });
        lists.appendChild(h('section.panel.classlist', { style: { '--c': c.color } }, h('h3', c.label, h('span', ' ' + mine.length)),
          mine.length ? grid : h('div.empty.small', h('p', 'No pictures yet. Add some so Bubbles can learn ' + c.label + '.')),
          mine.length > 12 ? UI.btn(open[c.id] ? 'SHOW FEWER' : 'SHOW ALL ' + mine.length, { kind: 'ghost', onclick: function () { open[c.id] = !open[c.id]; drawLists(); } }) : null));
      });
    }
    function redraw() { drawSummary(); drawLists(); UI.refreshStatus(); }
    redraw();
    root.appendChild(UI.bubblesSays('Choose the pictures I will learn from. Check that every picture is in the right group!', 'think'));
    body.appendChild(lists); body.appendChild(summary);
    root.appendChild(body);
    return root;
  };

  /* ---------------------------------------------------------------- picture picker (library) */
  /** focus = {ids:[...], note:'...'} shows only these suggestions first. */
  LS.picker = function (L, focus, onChange) {
    var state = { cls: '', shown: 18, skipped: false }, grid = h('div.picgrid.picker'), count = h('p.small'), chips = h('div.filters'), more = h('div.row');
    var pool = D.libraryImages().filter(function (im) { return L.classOf(im); });
    function avail() {
      var rej = St.rejected[L.id] || {};
      return pool.filter(function (im) {
        if (St.hasEntry(L, im.id)) return false;
        if (focus && focus.ids && focus.ids.indexOf(im.id) < 0) return false;
        if (state.cls && L.classOf(im) !== state.cls) return false;
        return state.skipped ? !!rej[im.id] : !rej[im.id];
      });
    }
    function draw() {
      var list = avail();
      U.clear(grid); U.clear(more); U.clear(chips);
      var mk = function (label, val, color) { return h('button.fchip' + (state.cls === val ? '.on' : ''), { type: 'button', style: color ? { '--c': color } : null, onclick: function () { state.cls = val; state.shown = 18; draw(); } }, label); };
      chips.appendChild(mk('ALL', '')); L.classes.forEach(function (c) { chips.appendChild(mk(c.label, c.id, c.color)); });
      if (!list.length) grid.appendChild(h('div.empty', U.svg(A.bubbles('happy', 90)), h('p', state.skipped ? 'No skipped pictures.' : 'No more pictures to add here.')));
      list.slice(0, state.shown).forEach(function (im) {
        var leaf = D.taxonomy.leaves[im.label], cls = L.classOf(im), rej = !!(St.rejected[L.id] || {})[im.id];
        grid.appendChild(h('div.tcard.pick',
          UI.pic(im.id, leaf.label), h('div.tc-name', leaf.label), UI.classChip(L, cls),
          im.tags.length ? h('small.tc-tags', im.tags.map(function (t) { return OAE.cfg.tagNames[t] || t; }).join(', ')) : null,
          h('div.row.tight',
            UI.btn('ADD TO TRAINING', { kind: 'primary', icon: 'plus', aria: 'Add ' + leaf.label + ' to training as ' + L.cls[cls].label, onclick: function () {
              St.addEntry(L, { id: im.id, source: 'builtin', label: cls, trueClass: cls, leaf: im.label, tags: im.tags }); UI.toast('Added a ' + leaf.label.toLowerCase() + ' picture as ' + L.cls[cls].label + '.'); if (onChange) onChange(); draw();
            } }),
            rej ? UI.btn('UNSKIP', { kind: 'ghost', onclick: function () { St.reject(L, im.id, false); draw(); } }) : UI.btn('SKIP', { kind: 'ghost', aria: 'Skip this picture. I am not sure about it.', onclick: function () { St.reject(L, im.id, true); draw(); } }))));
      });
      count.textContent = list.length + ' pictures to look at.' + (focus && focus.note ? ' ' + focus.note : '');
      if (list.length > state.shown) more.appendChild(UI.btn('SHOW MORE', { kind: 'secondary', onclick: function () { state.shown += 18; draw(); } }));
    }
    var skipT = h('label.check', h('input', { type: 'checkbox', onchange: function (e) { state.skipped = e.target.checked; state.shown = 18; draw(); } }), ' Show pictures I skipped');
    draw();
    var m = UI.modal(h('div.pickermodal', h('h2', 'Add pictures to teach Bubbles'),
      h('p', { 'data-read': '' }, 'Check the label under each picture. If it is right, press ADD. If you are not sure, press SKIP.'),
      chips, skipT, count, grid, more, h('div.row', UI.btn('DONE', { kind: 'primary', onclick: function () { m.close(); if (onChange) onChange(); } }))), { title: 'Add pictures', wide: true, onclose: function () { if (onChange) onChange(); } });
  };

  /* ---------------------------------------------------------------- import a local picture */
  LS.importer = function (L, onChange) {
    var st = { rec: null }, msg = h('div.banner', { hidden: true }), prev = h('div.prev'), label = null;
    var file = h('input', { type: 'file', accept: 'image/*', 'aria-label': 'Choose a picture file', onchange: function () { load(file.files[0]); } });
    var perm = h('input', { type: 'checkbox', id: 'perm', onchange: upd });
    var chosen = null, chips = h('div.row.wrap');
    var add = UI.btn('ADD TO TRAINING', { kind: 'primary', icon: 'plus', disabled: true, onclick: doAdd });
    function say(t, kind) { msg.hidden = !t; msg.className = 'banner ' + (kind || ''); msg.textContent = t || ''; }
    function upd() { add.disabled = !(st.rec && chosen && perm.checked); }
    function drawChips() {
      U.clear(chips);
      L.classes.forEach(function (c) { chips.appendChild(h('button.fchip' + (chosen === c.id ? '.on' : ''), { type: 'button', style: { '--c': c.color }, 'aria-pressed': chosen === c.id ? 'true' : 'false', onclick: function () { chosen = c.id; drawChips(); upd(); } }, c.label)); });
    }
    drawChips();
    function load(f) {
      st.rec = null; U.clear(prev); say(''); upd();
      if (!f) return;
      if (!/^image\/(png|jpeg|gif|webp|bmp)$/.test(f.type)) return say('That file is not a picture Bubbles can open. Try a JPG or PNG.', 'bad');
      if (f.size > 12 * 1048576) return say('That picture is too big (over 12 MB). Pick a smaller one.', 'bad');
      var fr = new FileReader();
      fr.onerror = function () { say('The picture could not be read.', 'bad'); };
      fr.onload = function () {
        D.decodeURL(fr.result).then(function (px) {
          return M.findSecretTwin(px.data, px.w, px.h).then(function (r) {
            if (r.twin) return say('This picture looks the same as one of the secret test pictures. Test pictures can never be used for training. Pick a different one.', 'bad');
            return S.all('imports').then(function (rows) {
              var dup = rows.some(function (kv) { return OAE.Features.hamming(kv[1].dhash, r.hash) <= 2; });
              if (dup) return say('You already imported this picture.', 'bad');
              st.rec = { dataUrl: px.canvas.toDataURL('image/jpeg', 0.9), dhash: r.hash, name: f.name.slice(0, 60), added: Date.now() };
              U.clear(prev); prev.appendChild(h('img', { src: st.rec.dataUrl, alt: 'Your picture, cropped to a square' })); prev.appendChild(h('small', 'Bubbles looks at the middle square of the picture.'));
              upd();
            });
          });
        }).catch(function (e) { say(e.message || 'The picture could not be opened.', 'bad'); });
      };
      fr.readAsDataURL(f);
    }
    function doAdd() {
      var id = 'imp-' + U.uid();
      S.put('imports', id, st.rec).then(function () {
        UI.importUrls[id] = st.rec.dataUrl;
        St.addEntry(L, { id: id, source: 'import', label: chosen, trueClass: null, leaf: null, tags: [] });
        UI.toast('Your picture was added as ' + L.cls[chosen].label + '.'); m.close(); if (onChange) onChange();
      }).catch(UI.problem);
    }
    var m = UI.modal(h('div.importmodal', h('h2', 'Import a picture'),
      h('p', { 'data-read': '' }, 'Pick a picture file from this computer. It stays on this computer. It is never sent anywhere.'),
      file, msg, prev,
      h('p', h('b', 'What is in the picture?')), chips,
      h('label.check', perm, ' This is my own picture, or a grown-up says I can use it.'),
      h('div.row', UI.btn('CANCEL', { kind: 'ghost', onclick: function () { m.close(); } }), add)), { title: 'Import a picture' });
  };
})();
