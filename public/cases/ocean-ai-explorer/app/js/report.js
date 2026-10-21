/* report.js - FIX step (AI Improvement Lab: score, mistakes, Mistake Detective, AI Coach)
 * and AGAIN step (honest before/after comparison). Everything shown is computed from the real
 * predictions saved by the test; nothing is invented. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var U = OAE.U, h = U.h, A = OAE.Art, D = OAE.Dataset, St = OAE.State, M = OAE.Model, UI = OAE.UI, LS = OAE.LevelScreen, Ev = OAE.Evaluation, Co = OAE.Coach;

  function setName(id) { return OAE.cfg.evalSets.filter(function (s) { return s.id === id; })[0].label; }
  function lab(L, id) { return id === 'unsure' ? 'UNSURE' : (L.cls[id] ? L.cls[id].label : String(id).toUpperCase()); }

  function coachCtx(L, items) {
    var rej = St.rejected[L.id] || {};
    return {
      level: L, taxonomy: D.taxonomy, items: items, tagNames: OAE.cfg.tagNames, tagImageHint: OAE.cfg.tagImageHint,
      trainEntries: St.getEntries(L).map(function (e) { return { id: e.id, leaf: e.leaf, tags: e.tags || [], label: e.label, trueClass: e.trueClass }; }),
      pool: D.libraryImages().filter(function (im) { return L.classOf(im) && !rej[im.id]; }).map(function (im) { return { id: im.id, leaf: im.label, tags: im.tags }; }),
      topConfusions: Ev.topConfusions(items, 5),
      classOfLeaf: function (leaf) { var im = D.byLeaf[leaf] && D.byLeaf[leaf][0]; return im ? L.classOf(im) : null; }
    };
  }

  /** Pick the run to show: ?set=challenge in the route, else the newest run of the current brain. */
  function chooseRun(L, wanted) {
    var meta = M.meta(L.id), best = null;
    ['test', 'challenge'].forEach(function (s) {
      var r = St.lastRun(L.id, s); if (!r) return;
      if (wanted === s) best = r; else if (!wanted && (!best || (r.modelTrainedAt === (meta && meta.trainedAt) && r.ts > best.ts) || (best.modelTrainedAt !== (meta && meta.trainedAt) && r.ts > best.ts))) best = r;
    });
    return best;
  }

  /* ================================================================= FIX */
  LS.steps.fix = function (L, extra) {
    var wanted = extra && extra[0] === 'challenge' ? 'challenge' : (extra && extra[0] === 'test' ? 'test' : null);
    var run = chooseRun(L, wanted), root = h('div.stepbody');
    if (!run) return h('div.panel.empty', U.svg(A.bubbles('think', 110)), h('h2', 'No test yet'), h('p', 'Run a test first. Then the lab can look at the mistakes.'), UI.link('GO TO THE TEST', '/level/' + L.id + '/test', { kind: 'primary' }));
    var meta = M.meta(L.id), items = run.items, sum = Ev.summarize(items, L.classIds), ctx = coachCtx(L, items), an = Co.analyze(ctx);
    var tab = 'score';

    root.appendChild(h('div.labhead',
      h('div', h('h2', 'AI Improvement Lab'), h('p', { 'data-read': '' }, 'Scientists learn from mistakes! Let\'s see what happened.')),
      h('div.row.wrap', ['test', 'challenge'].filter(function (s) { return St.lastRun(L.id, s); }).map(function (s) {
        return h('a.fchip' + (run.setId === s ? '.on' : ''), { href: '#/level/' + L.id + '/fix/' + s, style: { '--c': '#19b7c9' } }, setName(s).toUpperCase());
      }))));
    root.appendChild(h('div.banner.info', h('b', 'This score is for the ' + setName(run.setId).toLowerCase() + ': '), sum.total + ' pictures the AI never studied. The AI brain was trained ' + UI.when(run.modelTrainedAt) + ' with ' + run.nPictures + ' pictures.'));
    if (meta && run.modelTrainedAt !== meta.trainedAt) root.appendChild(h('div.banner.warn', 'You trained the AI again after this test. These results are from the older brain. ', h('a', { href: '#/level/' + L.id + '/test' }, 'Test again')));
    else if (meta && run.entryHash !== M.entryHash(St.getEntries(L))) root.appendChild(h('div.banner.warn', 'You changed the training pictures after this test. Train again and test again to see if it helps.'));

    var tabs = h('div.tabs', { role: 'tablist' }), pane = h('div.tabpane');
    var TABS = [['score', 'SCORE'], ['mistakes', 'MISTAKES (' + sum.wrong + ')'], ['detective', 'MISTAKE DETECTIVE'], ['coach', 'AI COACH']];
    function drawTabs() {
      U.clear(tabs);
      TABS.forEach(function (t) { tabs.appendChild(h('button.tab' + (tab === t[0] ? '.on' : ''), { type: 'button', role: 'tab', 'aria-selected': tab === t[0] ? 'true' : 'false', onclick: function () { tab = t[0]; drawTabs(); drawPane(); } }, t[1])); });
    }
    function drawPane() {
      U.clear(pane);
      pane.appendChild(tab === 'score' ? scoreTab() : tab === 'mistakes' ? mistakesTab() : tab === 'detective' ? detectiveTab() : coachTab());
      UI.refreshStatus();
    }

    /* ---- score */
    function scoreTab() {
      var box = h('div.tabbody');
      var p = sum;
      box.appendChild(h('section.panel.scorehead', UI.ring(p.accuracy, 160, 'Accuracy'),
        h('div', h('div.facts',
          h('div.fact', h('small', 'Test pictures'), h('b', String(p.total))), h('div.fact.good', h('small', 'Right'), h('b', String(p.correct))), h('div.fact.bad', h('small', 'Wrong'), h('b', String(p.wrong))),
          L.unsureAllowed || p.unsure ? h('div.fact', h('small', 'Said UNSURE'), h('b', String(p.unsure))) : null),
          h('p.small', 'Accuracy = ' + p.correct + ' right / ' + p.total + ' test pictures x 100 = ' + p.accuracy.toFixed(1) + '%.'),
          h('p.small', 'With this many pictures, the real score could be about ' + p.ci95.lo.toFixed(0) + '% to ' + p.ci95.hi.toFixed(0) + '%. Small differences between two tests can be luck.'),
          L.unsureAllowed ? h('p.small', 'In this level, UNSURE counts as right only for pictures of groups the AI was never taught. For all other pictures UNSURE counts as not right.') : null)));
      // per class
      var rows = L.classIds.concat(p.perClass.unsure && p.perClass.unsure.total ? ['unsure'] : []).map(function (c) {
        var pc = p.perClass[c]; if (!pc || !pc.total) return null;
        return h('div.cbar.wide', { style: { '--c': c === 'unsure' ? '#8a95a8' : L.cls[c].color } }, h('span', lab(L, c)), h('div.bar', h('i', { style: { width: pc.recall + '%' } })), h('b', pc.recall.toFixed(0) + '%'), h('small', pc.correct + ' of ' + pc.total));
      }).filter(Boolean);
      box.appendChild(h('section.panel', h('h3', 'Score for each group'), h('p.small', 'How many test pictures of each group did the AI get right?'), h('div.cbars', rows)));
      // top mix-ups
      var conf = Ev.topConfusions(items, 5);
      box.appendChild(h('section.panel', h('h3', 'Biggest mix-ups'),
        conf.length ? h('ul.plain', conf.map(function (c) { return h('li', h('b', c.count + ' '), UI.classChip(L, c.expected), ' pictures were called ', UI.classChip(L, c.pred), '.'); })) : h('p', 'No mix-ups. Every test picture was right!')));
      // confusion matrix
      var rowsIds = L.classIds.concat(p.perClass.unsure && p.perClass.unsure.total ? ['unsure'] : []), colIds = L.classIds.concat(L.unsureAllowed || p.unsure ? ['unsure'] : []);
      var tbl = h('table.matrix', { 'aria-label': 'Confusion matrix: rows are the right answers, columns are what the AI said' },
        h('thead', h('tr', h('th.corner', 'Right answer ↓ / AI said →'), colIds.map(function (c) { return h('th.col', h('span', lab(L, c))); }))),
        h('tbody', rowsIds.map(function (r) {
          var tot = p.perClass[r].total || 1;
          return h('tr', h('th', lab(L, r)), colIds.map(function (c) {
            var n = (p.confusion[r] || {})[c] || 0, a = n / tot;
            var bg = !n ? null : (r === c ? 'rgba(47,191,143,' : 'rgba(255,143,61,') + (0.2 + a * 0.75).toFixed(2) + ')';
            return h('td' + (r === c ? '.diag' : n ? '.off' : ''), { style: bg ? { background: bg } : null, title: n + ' ' + lab(L, r) + ' picture(s) were called ' + lab(L, c) }, n ? String(n) : '');
          }));
        })));
      box.appendChild(h('section.panel', h('h3', 'Confusion table'), h('p.small', 'Each row is a right answer. Each column is what the AI said. Green boxes on the diagonal are right answers. Orange boxes are mix-ups.'), h('div.tablewrap', tbl)));
      return box;
    }

    /* ---- mistakes */
    function mistakesTab() {
      var box = h('div.tabbody'), wrong = items.filter(function (it) { return it.expected !== it.pred; }).sort(function (a, b) { return b.conf - a.conf; });
      if (!wrong.length) return h('div.panel.empty', U.svg(A.bubbles('cheer', 110)), h('h2', 'No mistakes!'), h('p', 'The AI got every test picture right. Try the challenge set to find harder pictures.'));
      var shown = 12, grid = h('div.mgrid'), more = h('div.row'), filter = '';
      var sel = h('select', { 'aria-label': 'Show mistakes for one group', onchange: function () { filter = sel.value; shown = 12; draw(); } }, h('option', { value: '' }, 'All groups (' + wrong.length + ')'),
        L.classIds.concat(['unsure']).filter(function (c) { return wrong.some(function (w) { return w.expected === c; }); }).map(function (c) { return h('option', { value: c }, lab(L, c) + ' (' + wrong.filter(function (w) { return w.expected === c; }).length + ')'); }));
      function draw() {
        U.clear(grid); U.clear(more);
        var list = wrong.filter(function (w) { return !filter || w.expected === filter; });
        list.slice(0, shown).forEach(function (it) {
          var ex = Co.explainError(ctx, it), im = D.byId[it.id];
          grid.appendChild(h('article.mcard', UI.pic(it.id, 'Picture the AI got wrong'),
            h('div.mtext', h('p.oops', 'Oops! The AI made a mistake.'),
              h('p', 'Correct answer: ', UI.classChip(L, it.expected), ' ', h('b', D.taxonomy.leaves[im.label].label)),
              h('p', 'AI prediction: ', UI.classChip(L, it.pred)),
              h('p', 'Confidence: ', h('b', (it.conf * 100).toFixed(0) + '%'), it.pred === 'unsure' ? ' (best guess: ' + lab(L, it.top[0][0]) + ')' : ''),
              h('p.clue', h('b', 'Detective clue: '), ex.clue), h('p.reason', ex.reason),
              it.tags.length ? h('p.small', 'Tricky picture: ' + it.tags.map(function (t) { return OAE.cfg.tagNames[t] || t; }).join(', ') + '.') : null)));
        });
        if (list.length > shown) more.appendChild(UI.btn('SHOW MORE', { kind: 'secondary', onclick: function () { shown += 12; draw(); } }));
      }
      draw(); box.appendChild(h('div.toolbar', h('p', 'Mistakes are shown with the most confident wrong answers first.'), sel)); box.appendChild(grid); box.appendChild(more);
      return box;
    }

    /* ---- detective */
    function detectiveTab() {
      var box = h('div.tabbody');
      box.appendChild(UI.bubblesSays('Let\'s be detectives! Some things we can measure. Other things are only clues, because an AI cannot tell us why it was wrong.', 'think'));
      if (!an.detective.length) box.appendChild(h('div.panel.empty', h('h2', 'No patterns found'), h('p', 'The mistakes do not show a clear pattern, or there are no mistakes.')));
      an.detective.sort(function (a, b) { return (a.strength === 'high' ? 0 : 1) - (b.strength === 'high' ? 0 : 1); }).forEach(function (d) {
        box.appendChild(h('article.panel.dcard' + (d.strength === 'high' ? '.high' : ''), h('h3', d.title),
          h('p.measured', h('span.tagm', 'MEASURED'), ' ', d.measured.replace(/^We measured: /, '')),
          h('p.possible', h('span.tagp', 'POSSIBLE CLUE'), ' ', d.possible)));
      });
      return box;
    }

    /* ---- coach */
    function coachTab() {
      var box = h('div.tabbody');
      box.appendChild(UI.bubblesSays(an.next || 'Look at the ideas below.', 'happy'));
      if (!an.recommendations.length) box.appendChild(h('div.panel.empty', h('h2', 'No ideas right now'), h('p', 'There are no mistakes to learn from in this test.')));
      an.recommendations.forEach(function (r, idx) {
        var cands = h('div.picgrid.small');
        (r.candidates || []).forEach(function (id) {
          var im = D.byId[id], cls = L.classOf(im), card = h('div.tcard.pick');
          card.appendChild(UI.pic(id, D.taxonomy.leaves[im.label].label)); card.appendChild(h('div.tc-name', D.taxonomy.leaves[im.label].label)); card.appendChild(UI.classChip(L, cls));
          card.appendChild(UI.btn('ADD TO TRAINING', { kind: 'primary', icon: 'plus', onclick: function () {
            St.addEntry(L, { id: id, source: 'builtin', label: cls, trueClass: cls, leaf: im.label, tags: im.tags });
            U.clear(card); card.appendChild(h('p.added', UI.icon('check', 18), ' Added as ' + lab(L, cls))); UI.toast('Added to training: ' + D.taxonomy.leaves[im.label].label + ' as ' + lab(L, cls) + '.');
          } }));
          cands.appendChild(card);
        });
        var acts = h('div.row.wrap');
        if (r.kind === 'labels') acts.appendChild(UI.link('REVIEW THE LABELS', '/level/' + L.id + '/teach', { kind: 'secondary', icon: 'search' }));
        else if (r.kind === 'unknown') acts.appendChild(UI.link('GO TO THE MAP', '/map', { kind: 'secondary', icon: 'map' }));
        else {
          if ((r.candidates || []).length) acts.appendChild(UI.btn('SHOW MORE PICTURES', { kind: 'secondary', icon: 'image', onclick: function () { LS.picker(L, r.leaves && r.leaves.length ? { ids: (D.libraryImages().filter(function (im) { return r.leaves.indexOf(im.label) >= 0 && L.classOf(im); }).map(function (im) { return im.id; })), note: 'Only the kinds of pictures from this idea.' } : null, function () { UI.refreshStatus(); }); } }));
          acts.appendChild(UI.btn('IMPORT A PICTURE', { kind: 'ghost', icon: 'image', onclick: function () { LS.importer(L, function () { UI.refreshStatus(); }); } }));
        }
        box.appendChild(h('article.panel.rec', h('div.rec-n', String(idx + 1)),
          h('div.rec-body', h('h3', r.title),
            h('p.rweak', h('b', 'Weak spot: '), r.weak.replace(/^Weak spot: /, '')), h('p', h('b', 'What to add: '), r.what.replace(/^Add /, 'Add ')), h('p', h('b', 'Why it may help: '), r.may.replace(/^Why it may help: /, '')), h('p', h('b', 'How: '), r.how.replace(/^How: /, '')),
            (r.candidates || []).length ? cands : null, acts)));
      });
      box.appendChild(h('div.panel.callout', h('p', 'No idea is a promise. Adding a picture might help, might not change anything, or might make some answers worse. The only way to find out is to train again and test again.'),
        h('div.row', UI.btn('TRAIN AGAIN WITH NEW PICTURES', { kind: 'primary', big: true, icon: 'refresh', onclick: function () { St.mark(L.id, 'fix'); UI.go('/level/' + L.id + '/teach'); } }))));
      return box;
    }

    drawTabs(); drawPane();
    root.appendChild(tabs); root.appendChild(pane);
    return root;
  };

  /* ================================================================= AGAIN (compare) */
  LS.steps.compare = function (L, extra) {
    var root = h('div.stepbody'), setId = extra && extra[0] === 'challenge' ? 'challenge' : 'test';
    var runs = St.runs(L.id, setId), meta = M.meta(L.id);
    root.appendChild(h('div.labhead', h('div', h('h2', 'Before and after'), h('p', { 'data-read': '' }, 'Did training again change the score? Let\'s look at the real numbers.')),
      h('div.row.wrap', ['test', 'challenge'].filter(function (s) { return St.runs(L.id, s).length; }).map(function (s) { return h('a.fchip' + (setId === s ? '.on' : ''), { href: '#/level/' + L.id + '/compare/' + s, style: { '--c': '#19b7c9' } }, setName(s).toUpperCase()); }))));
    if (runs.length < 2) {
      root.appendChild(h('div.panel.empty', U.svg(A.bubbles('think', 110)), h('h2', 'Nothing to compare yet'),
        h('p', 'You need two tests on the same pictures: one before, and one after you change the training pictures and train again.'),
        h('div.row.wrap', UI.link('SEE THE MISTAKES', '/level/' + L.id + '/fix', { kind: 'secondary', icon: 'search' }), UI.link('CHANGE THE TRAINING PICTURES', '/level/' + L.id + '/teach', { kind: 'primary', icon: 'book' }))));
      root.appendChild(history(runs)); return root;
    }
    var prev = runs[runs.length - 2], last = runs[runs.length - 1];
    var cmp = Ev.compare(prev.items, last.items, L.classIds), changedSet = prev.entryHash !== last.entryHash;
    var a = new Set(prev.entryIds || []), b = new Set(last.entryIds || []), added = 0, removed = 0;
    b.forEach(function (x) { if (!a.has(x)) added++; }); a.forEach(function (x) { if (!b.has(x)) removed++; });
    var d = cmp.delta, sign = d > 0 ? '+' : '';
    root.appendChild(h('div.banner.info', h('b', 'Same test: '), setName(setId) + ', ' + cmp.n + ' pictures the AI never studies.', cmp.sameSet ? '' : ' (Only pictures that were in both tests are compared.)'));
    root.appendChild(h('section.panel.cmphead',
      h('div.cmpcol', h('small', 'BEFORE'), UI.ring(cmp.before, 130, 'Before'), h('p.small', prev.nPictures + ' training pictures')),
      h('div.cmpmid', h('div.delta' + (d > 0.0001 ? '.up' : d < -0.0001 ? '.down' : ''), sign + d.toFixed(1)), h('small', 'percentage points')),
      h('div.cmpcol', h('small', 'AFTER'), UI.ring(cmp.after, 130, 'After'), h('p.small', last.nPictures + ' training pictures'))));
    if (St.settings.autoRead && cmp.verdict !== 'unclear') OAE.Voice.react(cmp.verdict);
    var verdictText = cmp.verdict === 'better' ? 'This looks like a real improvement. The change is big enough that luck alone is unlikely to explain it.'
      : cmp.verdict === 'worse' ? 'The AI did worse this time. That can happen, and it is useful to know! Maybe some new pictures were confusing, or a label was wrong.'
        : 'The change is too small to be sure about. With ' + cmp.n + ' test pictures, a small change can happen by luck.';
    root.appendChild(h('section.panel.verdict.' + cmp.verdict, U.svg(A.bubbles(cmp.verdict === 'better' ? 'cheer' : cmp.verdict === 'worse' ? 'oops' : 'think', 100)),
      h('div', h('h3', cmp.verdict === 'better' ? 'Better!' : cmp.verdict === 'worse' ? 'Worse this time' : 'Not clear'), h('p', { 'data-read': '' }, verdictText),
        h('p.small', 'Mistakes fixed: ' + cmp.fixed + '. New mistakes: ' + cmp.broke + '. Right both times: ' + cmp.bothRight + '. Wrong both times: ' + cmp.bothWrong + '.'),
        h('p.small', 'Training pictures changed: ' + (changedSet ? added + ' added, ' + removed + ' removed.' : 'none. The training pictures were the same, so the AI did not change.')))));
    root.appendChild(h('div.two',
      h('section.panel', h('h3', 'Groups that got better'), cmp.improved.length ? h('ul.plain', cmp.improved.map(function (x) { return h('li', UI.classChip(L, x.id), ' ' + x.before.toFixed(0) + '% → ' + x.after.toFixed(0) + '%'); })) : h('p', 'None.')),
      h('section.panel', h('h3', 'Groups that got worse'), cmp.worse.length ? h('ul.plain', cmp.worse.map(function (x) { return h('li', UI.classChip(L, x.id), ' ' + x.before.toFixed(0) + '% → ' + x.after.toFixed(0) + '%'); })) : h('p', 'None.'))));
    root.appendChild(history(runs));

    // finishing the level needs a real change to the training pictures, tested on the fixed test set
    if (setId === 'test') {
      if (changedSet) {
        var first = St.mark(L.id, 'compare');
        if (first || !St.celebrated[L.id]) {
          St.celebrated[L.id] = true; St.saveProgress();
          setTimeout(function () { A.confetti(); finishModal(L); }, 400);
        }
        root.appendChild(h('div.row.wrap', UI.link('BACK TO THE MAP', '/map', { kind: 'primary', big: true, icon: 'map' }), UI.link('TRY MORE CHANGES', '/level/' + L.id + '/fix', { kind: 'ghost', icon: 'search' })));
      } else {
        root.appendChild(h('div.banner.warn', 'To finish this level, change the training pictures, train again, and test again. Then the before-and-after is a real experiment.'));
        root.appendChild(h('div.row.wrap', UI.link('CHANGE THE TRAINING PICTURES', '/level/' + L.id + '/teach', { kind: 'primary', icon: 'book' })));
      }
    }
    return root;
  };

  function history(runs) {
    if (!runs.length) return h('span');
    var rows = runs.map(function (r, i) {
      return h('div.cbar.wide', { style: { '--c': '#19b7c9' } }, h('span', 'Test ' + (i + 1)), h('div.bar', h('i', { style: { width: r.accuracy + '%' } })), h('b', r.accuracy.toFixed(1) + '%'), h('small', r.nPictures + ' pictures, ' + UI.when(r.ts)));
    });
    return h('section.panel', h('h3', 'All tests on this set'), h('div.cbars', rows));
  }

  function finishModal(L) {
    var next = OAE.cfg.levels.filter(function (x) { return x.id === L.id + 1; })[0], m;
    m = UI.modal(h('div.confirm.finish', U.svg(A.bubbles('cheer', 130)), h('h2', 'Level complete!'),
      h('p', 'You taught Bubbles, found its mistakes, and tried again. Great scientists learn from mistakes!'),
      h('div.row.wrap', UI.btn('MAP', { kind: 'ghost', onclick: function () { m.close(); UI.go('/map'); } }),
        next && St.unlocked(next.id) ? UI.btn('NEXT: ' + next.title.toUpperCase(), { kind: 'primary', icon: 'arrow', onclick: function () { m.close(); UI.go('/level/' + next.id); } }) : UI.btn('CERTIFICATE', { kind: 'primary', icon: 'trophy', onclick: function () { m.close(); UI.go('/certificate'); } }))), { title: 'Level complete' });
  }
})();
