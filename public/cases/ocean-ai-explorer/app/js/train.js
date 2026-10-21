/* train.js - TRAIN step (real training with live numbers) and TEST step (real predictions). */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var U = OAE.U, h = U.h, A = OAE.Art, D = OAE.Dataset, St = OAE.State, M = OAE.Model, UI = OAE.UI, LS = OAE.LevelScreen, Ev = OAE.Evaluation;

  UI.ring = function (pct, size, label) {
    var r = 52, c = 2 * Math.PI * r, col = pct >= 80 ? '#2fbf8f' : pct >= 50 ? '#ffb703' : '#ff7a9a';
    return U.svg('<svg class="ring" viewBox="0 0 130 130" width="' + (size || 150) + '" role="img" aria-label="' + (label || 'Score') + ' ' + pct.toFixed(1) + ' percent"><circle cx="65" cy="65" r="' + r + '" fill="none" stroke="#dff3f7" stroke-width="14"/><circle cx="65" cy="65" r="' + r +
      '" fill="none" stroke="' + col + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + (c * pct / 100) + ' ' + c + '" transform="rotate(-90 65 65)"/><text x="65" y="72" text-anchor="middle" font-size="26" font-weight="800" fill="#06304f">' + pct.toFixed(1) + '%</text></svg>');
  };
  UI.when = function (ts) { try { return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } };
  UI.confWords = function (conf, pred) {
    if (pred === 'unsure') return 'Bubbles says UNSURE. It does not know this one.';
    if (conf >= 0.8) return 'Bubbles is pretty sure. But even a sure AI can be wrong!';
    if (conf >= 0.55) return 'Bubbles thinks so, but it is not certain.';
    return 'Bubbles is not sure. This is just a guess.';
  };
  UI.meter = function (p, color) { return h('div.meter', h('i', { style: { width: Math.max(2, p * 100) + '%', background: color || '#19b7c9' } })); };

  /* ---------------------------------------------------- loss chart (inline SVG) */
  function lossChart(hist) {
    var W = 520, H = 190, pad = 34, n = Math.max(hist.length, 2);
    var vals = []; hist.forEach(function (e) { vals.push(e.trainLoss); if (e.valLoss != null) vals.push(e.valLoss); });
    var mx = Math.max.apply(null, vals.concat([0.5])), mn = 0;
    function X(i) { return pad + (W - pad - 10) * i / Math.max(1, (OAE.cfg.train.epochs - 1)); }
    function Y(v) { return H - pad - (H - pad - 12) * (v - mn) / (mx - mn); }
    function path(key) {
      var pts = hist.filter(function (e) { return e[key] != null; }).map(function (e) { return X(e.epoch - 1).toFixed(1) + ',' + Y(e[key]).toFixed(1); });
      return pts.length ? '<polyline fill="none" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" points="' + pts.join(' ') + '"' : '';
    }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="losschart" role="img" aria-label="Chart of the loss score while learning. Lower is better.">' +
      '<line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - 8) + '" y2="' + (H - pad) + '" stroke="#9bc9d3" stroke-width="2"/><line x1="' + pad + '" y1="10" x2="' + pad + '" y2="' + (H - pad) + '" stroke="#9bc9d3" stroke-width="2"/>' +
      '<text x="' + pad + '" y="' + (H - 10) + '" font-size="12" fill="#35637a">Round 1</text><text x="' + (W - 8) + '" y="' + (H - 10) + '" font-size="12" text-anchor="end" fill="#35637a">Round ' + OAE.cfg.train.epochs + '</text>' +
      '<text x="' + (pad - 6) + '" y="22" font-size="12" text-anchor="end" fill="#35637a">' + mx.toFixed(1) + '</text><text x="' + (pad - 6) + '" y="' + (H - pad) + '" font-size="12" text-anchor="end" fill="#35637a">0</text>' +
      path('trainLoss') + ' stroke="#ff7a9a"/>' + path('valLoss') + ' stroke="#3f8ef5"/></svg>';
    return U.svg(s);
  }

  /* ================================================================= TRAIN */
  LS.steps.train = function (L) {
    var root = h('div.stepbody'), entries = function () { return St.getEntries(L); };
    var meta = M.meta(L.id), running = false, stop = false;
    root.appendChild(UI.bubblesSays(meta ? 'I already learned something here. You can train me again after you change the pictures.' : 'Time to train! Press the button and watch me learn.', meta ? 'happy' : 'think'));

    var counts = LS.classCounts(L, entries());
    var sum = h('section.panel', h('h2', 'Ready to train'),
      h('p', h('b', String(entries().length)), ' pictures will be used. Each picture is also shown mirrored, so the AI sees ' + (entries().length * 2) + ' examples.'),
      h('div.chiprow', L.classes.map(function (c) { return h('span.chip', { style: { '--c': c.color } }, c.label + ': ' + counts[c.id]); })));
    if (meta) {
      var same = M.entryHash(entries()) === meta.entryHash;
      sum.appendChild(h('p.small', 'Last training: ' + UI.when(meta.trainedAt) + ' with ' + meta.nPictures + ' pictures.' + (same ? ' You have not changed the pictures since then, so training again would give the same AI.' : ' You changed the pictures since then.')));
    }
    root.appendChild(sum);

    var phase = h('p.phase', { 'aria-live': 'polite' }, 'Waiting for you.'), fbar = h('div.bar', h('i', { style: { width: '0%' } })), ebar = h('div.bar', h('i', { style: { width: '0%' } }));
    var stats = {}, grid = h('div.statgrid');
    [['epoch', 'Round (epoch)'], ['seen', 'Examples processed'], ['loss', 'Training loss'], ['vloss', 'Validation loss'], ['acc', 'Training accuracy'], ['vacc', 'Validation accuracy']].forEach(function (s) {
      stats[s[0]] = h('b', '-'); grid.appendChild(h('div.stat', h('small', s[1]), stats[s[0]]));
    });
    var chart = h('div.chartbox'), hist = [], totalSeen = 0, lastSeen = 0, lastEpoch = 1;
    var result = h('div.resultbox', { 'aria-live': 'polite' });
    var trainBtn = UI.btn(meta ? 'TRAIN MY AI AGAIN' : 'TRAIN MY AI', { kind: 'primary', big: true, icon: 'brain', onclick: go });
    var stopBtn = UI.btn('STOP', { kind: 'ghost', icon: 'stop', onclick: function () { stop = true; stopBtn.disabled = true; phase.textContent = 'Stopping after this round...'; } }); stopBtn.hidden = true;
    var live = h('section.panel.live', h('h2', 'What the AI is doing'), phase,
      h('div.minirow', h('small', 'Looking at pictures'), fbar), h('div.minirow', h('small', 'Learning'), ebar), grid,
      h('p.small', 'Loss is a score for mistakes while learning. Smaller is better. Validation pictures are a small separate set used to check the learning. They are not the test pictures.'),
      h('div.legend', h('span.l1', 'Training loss'), h('span.l2', 'Validation loss')), chart);
    function drawChart() { U.clear(chart); chart.appendChild(lossChart(hist)); }
    drawChart();

    async function go() {
      var list = entries().filter(function (e) { return e.source === 'import' || (D.byId[e.id] && D.has(e.id)); });
      try { M.checkTrainingSet(L, list); } catch (e) { UI.toast(e.message, 'bad'); return; }
      running = true; stop = false; hist = []; totalSeen = 0; lastSeen = 0; lastEpoch = 1; drawChart(); U.clear(result);
      trainBtn.disabled = true; stopBtn.hidden = false; stopBtn.disabled = false; fbar.firstChild.style.width = '0%'; ebar.firstChild.style.width = '0%';
      Object.keys(stats).forEach(function (k) { stats[k].textContent = '-'; });
      var rec = null, saveErr = null;
      try {
        rec = await M.trainLevel(L, list, {
          onStatus: function (t) { phase.textContent = t; },
          onFeatures: function (d, t) { fbar.firstChild.style.width = (t ? d / t * 100 : 100) + '%'; phase.textContent = 'Looking at the pictures... ' + d + ' of ' + t; },
          onBatch: function (b) {
            if (b.epoch !== lastEpoch) { lastEpoch = b.epoch; lastSeen = 0; }
            totalSeen += (b.seen - lastSeen); lastSeen = b.seen;
            stats.seen.textContent = totalSeen.toLocaleString('en-US') + ' (' + b.seen + ' of ' + b.total + ' this round)';
            stats.epoch.textContent = b.epoch + ' of ' + OAE.cfg.train.epochs;
          },
          onEpoch: function (e) {
            hist.push(e); drawChart();
            ebar.firstChild.style.width = (e.epoch / e.epochs * 100) + '%';
            phase.textContent = 'Learning... round ' + e.epoch + ' of ' + e.epochs;
            stats.epoch.textContent = e.epoch + ' of ' + e.epochs; stats.loss.textContent = e.trainLoss.toFixed(3); stats.acc.textContent = (e.trainAcc * 100).toFixed(1) + '%';
            stats.vloss.textContent = e.valLoss != null ? e.valLoss.toFixed(3) : '-'; stats.vacc.textContent = e.valAcc != null ? (e.valAcc * 100).toFixed(1) + '%' : '-';
          },
          shouldStop: function () { return stop; }
        });
      } catch (e) {
        if (M.has(L.id) && M.meta(L.id).entryHash === M.entryHash(list) && e.code === 'quota') { rec = M.meta(L.id); saveErr = e; }
        else {
          running = false; trainBtn.disabled = false; stopBtn.hidden = true; phase.textContent = 'Training stopped.';
          result.appendChild(h('div.banner.bad', e.message || 'Something went wrong while training.')); UI.problem(e); return;
        }
      }
      running = false; trainBtn.disabled = false; stopBtn.hidden = true;
      St.mark(L.id, 'train'); UI.refreshStatus();
      phase.textContent = rec.stoppedEarly ? 'Training stopped early.' : 'Training finished!';
      var last = rec.history[rec.history.length - 1];
      if (St.settings.autoRead && !rec.stoppedEarly) OAE.Voice.react('trained');
      U.clear(result);
      result.appendChild(h('div.panel.success', U.svg(A.bubbles('cheer', 110)),
        h('div', h('h2', 'I learned something!'),
          h('p', 'Trained on ' + rec.nPictures + ' pictures (' + rec.nExamples + ' examples) for ' + rec.history.length + ' rounds in ' + rec.seconds.toFixed(1) + ' seconds.' + (last.valLoss != null ? ' On the separate validation pictures, my loss was ' + last.valLoss.toFixed(3) + ' and I was right on ' + (last.valAcc * 100).toFixed(0) + '%.' : '')),
          h('p.small', 'My score on the pictures I studied is not my real score. The real score comes from the test.'),
          saveErr ? h('div.banner.warn', saveErr.message + ' I can use what I learned now, but it may not be saved.') : null,
          h('div.row', UI.btn('TIME TO TEST!', { kind: 'primary', big: true, icon: 'arrow', onclick: function () { UI.go('/level/' + L.id + '/test'); } })))));
    }
    root.appendChild(h('div.row.center', trainBtn, stopBtn));
    root.appendChild(live); root.appendChild(result);
    if (meta && !hist.length) {   // show the saved training curve
      hist = meta.history.slice(); drawChart(); var l = hist[hist.length - 1];
      if (l) { stats.epoch.textContent = l.epoch + ' of ' + l.epochs; stats.loss.textContent = l.trainLoss.toFixed(3); stats.acc.textContent = (l.trainAcc * 100).toFixed(1) + '%'; stats.vloss.textContent = l.valLoss != null ? l.valLoss.toFixed(3) : '-'; stats.vacc.textContent = l.valAcc != null ? (l.valAcc * 100).toFixed(1) + '%' : '-'; stats.seen.textContent = (meta.nExamples * meta.history.length).toLocaleString('en-US'); phase.textContent = 'This is the last training (saved on this computer).'; }
      result.appendChild(h('div.row', UI.btn('GO TO THE TEST', { kind: 'secondary', icon: 'arrow', onclick: function () { UI.go('/level/' + L.id + '/test'); } })));
    }
    return root;
  };

  /* ================================================================= TEST */
  function seededShuffle(arr, seed) { return U.shuffle(arr, OAE.NN.rng(seed)); }

  LS.steps.test = function (L) {
    var root = h('div.stepbody'), meta = M.meta(L.id), setId = 'test', out = h('div.testout');
    root.appendChild(UI.bubblesSays('Time to test! I will look at pictures I have never seen. Then we will see if I was right.', 'think'));
    var setBox = h('div.setpick', { role: 'radiogroup', 'aria-label': 'Which pictures to test with' });
    function counts(id) { return (D.bySplit[id] || []).filter(function (im) { return L.expectedOf(im) && D.has(im.id); }).length; }
    function drawSets() {
      U.clear(setBox);
      OAE.cfg.evalSets.forEach(function (s) {
        setBox.appendChild(h('button.setcard' + (setId === s.id ? '.on' : ''), { type: 'button', role: 'radio', 'aria-checked': setId === s.id ? 'true' : 'false', onclick: function () { setId = s.id; drawSets(); U.clear(out); showExisting(); } },
          h('b', s.label), h('span', counts(s.id) + ' pictures'), h('small', s.note)));
      });
    }
    drawSets();
    var startBtn = UI.btn('START THE TEST', { kind: 'primary', big: true, icon: 'play', onclick: run });
    var prog = h('div.bar', { hidden: true }, h('i', { style: { width: '0%' } }));
    root.appendChild(h('section.panel', h('h2', 'Choose your test'), setBox,
      h('p.small', 'AI brain: trained ' + UI.when(meta.trainedAt) + ' with ' + meta.nPictures + ' pictures.'),
      h('div.row', startBtn), prog));
    root.appendChild(out);

    function existing() { var r = St.lastRun(L.id, setId); return r && r.modelTrainedAt === meta.trainedAt ? r : null; }
    function showExisting() { var r = existing(); if (r) showRun(r); }

    async function run() {
      startBtn.disabled = true; prog.hidden = false; U.clear(out);
      try {
        var r = existing();
        if (!r) {
          var items = await M.predictItems(L, setId, function (d, t) { prog.firstChild.style.width = (t ? d / t * 100 : 100) + '%'; });
          var sum = Ev.summarize(items, L.classIds);
          r = { ts: Date.now(), setId: setId, levelId: L.id, modelTrainedAt: meta.trainedAt, entryHash: meta.entryHash, entryIds: meta.entryIds, nPictures: meta.nPictures, accuracy: sum.accuracy, correct: sum.correct, items: items, revealed: {} };
          await St.addRun(L.id, setId, r);
        }
        if (setId === 'test') { St.mark(L.id, 'test'); }
        showRun(r);
      } catch (e) { UI.problem(e); }
      startBtn.disabled = false; prog.hidden = true;
    }

    function showRun(r) {
      U.clear(out);
      var sum = Ev.summarize(r.items, L.classIds), setName = OAE.cfg.evalSets.filter(function (s) { return s.id === r.setId; })[0].label;
      if (St.settings.autoRead && !r.__spoken) { r.__spoken = true; OAE.Voice.react('tested', sum.accuracy * 100); }
      out.appendChild(h('section.panel.scorehead', UI.ring(sum.accuracy, 150, 'Accuracy'),
        h('div', h('h2', 'Test finished!'), h('p.big', h('b', sum.correct + ' of ' + sum.total), ' right on the ' + setName.toLowerCase() + '.'),
          h('p.small', 'Accuracy = right answers / all test pictures x 100.'),
          h('div.row.wrap', UI.btn('SEE THE FULL REPORT', { kind: 'primary', icon: 'search', onclick: function () { UI.go('/level/' + L.id + '/fix'); } })))));
      // blind spot-check deck
      var deck = seededShuffle(r.items, r.ts % 100000).slice(0, 8), i = 0, box = h('section.panel.deck');
      function draw() {
        U.clear(box);
        if (i >= deck.length) {
          var seenN = deck.filter(function (d) { return r.revealed[d.id]; }), ok = seenN.filter(function (d) { return d.expected === d.pred; }).length;
          box.appendChild(h('h2', 'Spot check done'));
          box.appendChild(h('p', 'You looked at ' + seenN.length + ' pictures. Bubbles was right on ' + ok + ' of them.'));
          box.appendChild(h('p.small', 'Only the full test counts for the score above.'));
          box.appendChild(h('div.row', UI.btn('LOOK AGAIN', { kind: 'ghost', icon: 'refresh', onclick: function () { i = 0; draw(); } }), UI.btn('SEE THE FULL REPORT', { kind: 'primary', icon: 'search', onclick: function () { UI.go('/level/' + L.id + '/fix'); } })));
          return;
        }
        var it = deck[i], im = D.byId[it.id], rev = !!r.revealed[it.id], right = it.expected === it.pred;
        box.appendChild(h('h2', 'Spot check ' + (i + 1) + ' of ' + deck.length));
        box.appendChild(h('div.deckcard',
          h('div.deckpic', UI.pic(it.id, 'A test picture')),
          h('div.deckinfo',
            h('p.q', 'What do you see?'),
            h('div.thinks', U.svg(A.bubbles(rev ? (right ? 'happy' : 'oops') : 'think', 80)), h('div', h('p', 'Bubbles thinks: ', UI.classChip(L, it.pred)), h('p.conf', 'Confidence ' + (it.conf * 100).toFixed(0) + '%'), UI.meter(it.conf), h('p.small', UI.confWords(it.conf, it.pred)),
              it.top && it.top.length > 1 ? h('p.small', 'Other ideas: ' + it.top.slice(1).map(function (t) { return (t[0] === 'unsure' ? 'UNSURE' : L.cls[t[0]].label) + ' ' + (t[1] * 100).toFixed(0) + '%'; }).join(', ')) : null)),
            rev ? h('div.reveal' + (right ? '.right' : '.wrong'), h('h3', right ? 'Yes! Bubbles was right.' : 'Oops! The AI made a mistake.'), h('p', 'Correct answer: ', UI.classChip(L, it.expected), ' ', h('b', D.taxonomy.leaves[im.label].label)), h('p.small', D.taxonomy.leaves[im.label].fact))
              : UI.btn('REVEAL THE ANSWER', { kind: 'secondary', icon: 'eye', onclick: function () { r.revealed[it.id] = true; St.saveEvals(L.id); draw(); } }),
            h('div.row', i > 0 ? UI.btn('BACK', { kind: 'ghost', icon: 'back', onclick: function () { i--; draw(); } }) : null, UI.btn(i === deck.length - 1 ? 'FINISH' : 'NEXT PICTURE', { kind: rev ? 'primary' : 'ghost', icon: 'arrow', onclick: function () { i++; draw(); } })))));
      }
      draw(); out.appendChild(box);
    }
    showExisting();

    // try any picture
    var tryOut = h('div.tryout'), file = h('input', { type: 'file', accept: 'image/*', 'aria-label': 'Choose a picture to try', onchange: function () { tryFile(file.files[0]); } });
    function tryFile(f) {
      U.clear(tryOut); if (!f) return;
      if (!/^image\//.test(f.type)) return tryOut.appendChild(h('div.banner.bad', 'That file is not a picture.'));
      var fr = new FileReader();
      fr.onload = function () {
        D.decodeURL(fr.result).then(function (px) {
          var d = M.predictFeatures(L, OAE.Features.extract(px.data, px.w, px.h, false));
          tryOut.appendChild(h('div.tryres', h('div.big-sm', h('img', { src: px.canvas.toDataURL('image/jpeg', 0.85), alt: 'Your picture' })),
            h('div', h('p', 'Bubbles thinks: ', UI.classChip(L, d.pred)), h('p.conf', 'Confidence ' + (d.conf * 100).toFixed(0) + '%'), UI.meter(d.conf), h('p.small', UI.confWords(d.conf, d.pred)),
              h('div.tops', d.top.map(function (t) { return h('div.cbar', { style: { '--c': t[0] === 'unsure' ? '#8a95a8' : L.cls[t[0]].color } }, h('span', L.cls[t[0]].label), h('div.bar', h('i', { style: { width: (t[1] * 100) + '%' } })), h('b', (t[1] * 100).toFixed(0) + '%')); })),
              h('p.small', 'This picture is not saved, and nothing is sent anywhere. I do not know the right answer. I can only guess.'))));
        }).catch(function (e) { tryOut.appendChild(h('div.banner.bad', e.message || 'That picture could not be opened.')); });
      };
      fr.readAsDataURL(f);
    }
    root.appendChild(h('section.panel', h('h2', 'Try any picture!'), h('p', 'Pick a picture file from this computer. Bubbles will make a real guess. It never leaves this computer.'), file, tryOut));
    return root;
  };
})();
