/* app.js - start-up, screen switching, the header (status labels, READ TO ME) and the
 * Home, Ocean Map, How-it-works, Certificate and Grown-ups screens.
 * Level screens live in level.js, train.js and report.js. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var U = OAE.U, h = U.h, A = OAE.Art, D = OAE.Dataset, St = OAE.State, M = OAE.Model, V = OAE.Voice, S = OAE.Storage;
  var UI = OAE.UI = {}, Screens = OAE.Screens = {};
  var view, chipsEl, voiceEl, current = { name: '', level: null };

  /* ------------------------------------------------------------ small helpers */
  UI.go = function (path) { if (location.hash === '#' + path) route(); else location.hash = '#' + path; };
  UI.icon = function (n, s) { return U.svg(A.icon(n, s)); };
  UI.btn = function (label, opts) {
    opts = opts || {};
    var b = h('button.btn' + (opts.kind ? '.' + opts.kind : '') + (opts.big ? '.big' : ''), { type: 'button', onclick: opts.onclick, disabled: opts.disabled, title: opts.title, 'aria-label': opts.aria },
      opts.icon ? UI.icon(opts.icon, opts.big ? 28 : 22) : null, h('span', label));
    return b;
  };
  UI.link = function (label, path, opts) { opts = opts || {}; var b = UI.btn(label, Object.assign({}, opts, { onclick: function () { UI.go(path); } })); return b; };

  /** A picture element that shows a friendly message if the file is missing. */
  UI.pic = function (id, alt, cls) {
    var url = D.url(id) || null;
    var img = h('img.pic' + (cls ? '.' + cls : ''), { alt: alt || '', loading: 'lazy', draggable: 'false' });
    var holder = h('span.picwrap' + (cls ? '.' + cls : ''), img);
    function missing() { holder.classList.add('missing'); U.clear(holder); holder.appendChild(h('span.picmiss', UI.icon('image', 28), h('small', 'Picture missing'))); }
    if (!url) { missing(); return holder; }
    img.onerror = missing; img.src = url;
    return holder;
  };
  UI.chip = function (text, color, cls) { return h('span.chip' + (cls ? '.' + cls : ''), { style: color ? { '--c': color } : null }, text); };
  UI.classChip = function (level, id) {
    if (id === 'unsure') return UI.chip('UNSURE', '#8a95a8');
    var c = level.cls[id]; return UI.chip(c ? c.label : String(id).toUpperCase(), c ? c.color : '#8a95a8');
  };
  UI.sectionTitle = function (t, sub) { return h('div.sectiontitle', h('h2', t), sub ? h('p', sub) : null); };
  UI.bubblesSays = function (text, mood, read) {
    return h('div.says', h('div.says-bot', U.svg(A.bubbles(mood || 'happy', 110))), h('div.says-bubble', h('p', { 'data-read': read || '' }, text)));
  };

  var toastTimer;
  UI.toast = function (msg, kind) {
    var el = document.getElementById('toast');
    el.className = 'toast show ' + (kind || ''); el.textContent = msg;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.className = 'toast'; }, 4800);
    if (St.settings.autoRead && V.supported && !V.muted) V.say(msg);
  };
  UI.problem = function (e) {
    var msg = (e && e.message) || String(e);
    UI.toast(msg, 'bad');
  };

  /** Modal dialogs. */
  UI.modal = function (content, opts) {
    opts = opts || {};
    var root = document.getElementById('modal'), prev = document.activeElement;
    U.clear(root); root.classList.add('open');
    var box = h('div.modalbox' + (opts.wide ? '.wide' : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title || 'Message' },
      h('button.modalx', { type: 'button', 'aria-label': 'Close', onclick: close }, UI.icon('cross', 20)), content);
    root.appendChild(box);
    function close() { root.classList.remove('open'); U.clear(root); document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); if (opts.onclose) opts.onclose(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    root.onclick = function (e) { if (e.target === root) close(); };
    var f = box.querySelector('button.btn,input,select') || box.querySelector('.modalx'); if (f) f.focus();
    return { close: close, box: box };
  };
  UI.confirm = function (o) {
    return new Promise(function (resolve) {
      var m;
      var yes = UI.btn(o.yes || 'YES', { kind: o.danger ? 'danger' : 'primary', onclick: function () { done = true; m.close(); resolve(true); } });
      var no = UI.btn(o.no || 'NO, GO BACK', { kind: 'ghost', onclick: function () { m.close(); } });
      var done = false;
      m = UI.modal(h('div.confirm', U.svg(A.bubbles(o.danger ? 'think' : 'happy', 100)), h('h2', o.title), h('p', o.text), h('div.row', no, yes)), { title: o.title, onclose: function () { if (!done) resolve(false); } });
    });
  };

  /** Play one level again from the very beginning (asks first). */
  UI.restartLevel = function (L) {
    return UI.confirm({ title: 'Play Level ' + L.id + ' again from the start?', text: 'Bubbles forgets what it learned in Level ' + L.id + ', and your picture choices and test scores for this level are cleared. Other levels are not changed.', yes: 'YES, START LEVEL ' + L.id + ' OVER', no: 'NO, KEEP GOING', danger: true }).then(function (ok) {
      if (!ok) return false;
      return St.resetLevel(L).then(function () { UI.refreshStatus(); UI.toast('Level ' + L.id + ' is ready to play again!'); UI.go('/level/' + L.id + '/look'); return true; }).catch(function (e) { UI.problem(e); return false; });
    });
  };
  /** Start the whole game again (asks twice, because it deletes everything). */
  UI.restartAll = function () {
    return UI.confirm({ title: 'Start a brand new game?', text: 'This deletes everything: every trained AI, training pictures, test scores, imported pictures and settings.', yes: 'YES, NEW GAME', no: 'NO, KEEP MY GAME', danger: true }).then(function (ok) {
      if (!ok) return false;
      return UI.confirm({ title: 'Really start over?', text: 'Last check. There is no way to get it back.', yes: 'START OVER', no: 'KEEP MY GAME', danger: true }).then(function (ok2) {
        if (!ok2) return false;
        return St.resetAll().then(function () { UI.refreshStatus(); UI.toast('A brand new game is ready!'); UI.go('/'); return true; }).catch(function (e) { UI.problem(e); return false; });
      });
    });
  };

  /* ------------------------------------------------------------ status labels */
  var offlineInfo = { ok: false, external: [], checked: false };
  UI.checkOffline = function () {
    var ext = [];
    function isLocal(u) {
      try {
        var x = new URL(u, location.href);
        if (/^(data|blob|about):$/.test(x.protocol) || x.protocol === 'file:') return true;
        if (/^https?:$/.test(x.protocol)) return x.host === location.host;
        return false;
      } catch (e) { return false; }
    }
    try {
      (performance.getEntriesByType('resource') || []).forEach(function (r) { if (!isLocal(r.name)) ext.push(r.name); });
      document.querySelectorAll('script[src],link[href],img[src],iframe[src],source[src]').forEach(function (el) {
        var u = el.getAttribute('src') || el.getAttribute('href');
        if (u && !isLocal(u) && !/^#/.test(u)) ext.push(u);
      });
    } catch (e) { /* ignore */ }
    offlineInfo = { ok: ext.length === 0 && D.state !== 'idle' && D.state !== 'loading', external: ext, checked: true };
    return offlineInfo;
  };
  UI.refreshStatus = function () {
    if (!chipsEl) return;
    var off = UI.checkOffline(), lv = current.level, n = Object.keys(M.nets).length;
    U.clear(chipsEl);
    function chip(ok, warn, text, title) { return h('li.status' + (ok ? '.ok' : warn ? '.warn' : '.bad'), { title: title }, h('i'), text); }
    chipsEl.appendChild(chip(off.ok, false, off.ok ? 'OFFLINE READY' : 'ONLINE FILE FOUND', off.ok ? 'Every file this game loaded is stored on this computer. No internet is needed.' : 'Something tried to load from the internet: ' + off.external.slice(0, 3).join(', ')));
    var haveModel = lv ? M.has(lv) : n > 0;
    chipsEl.appendChild(chip(haveModel, !haveModel, haveModel ? 'AI MODEL READY' : 'AI NOT TRAINED YET', haveModel ? (lv ? 'A trained AI for this level is loaded on this computer.' : n + ' trained AI brain(s) loaded from this computer.') : 'Press TRAIN MY AI in a level. The AI is trained here, on this computer.'));
    var dOk = D.state === 'ready';
    chipsEl.appendChild(chip(dOk, D.state === 'loading', dOk ? 'TRAINING DATA READY' : D.state === 'loading' ? 'LOADING PICTURES...' : 'PICTURES MISSING: ' + D.missing.length, dOk ? D.images.length + ' pictures checked and loaded from the game folder.' : 'Some pictures could not be found in the game folder.'));
    if (S.mode !== 'idb') chipsEl.appendChild(chip(false, true, 'SAVING IS OFF', 'This browser would not allow saving. Your work is kept only until you close this page. ' + (S.error || '')));
  };

  function renderVoice() {
    if (!voiceEl) return;
    U.clear(voiceEl);
    var playing = V.state === 'playing', paused = V.state === 'paused';
    if (!V.supported) {
      voiceEl.appendChild(h('button.btn.voice.off', { type: 'button', onclick: function () { UI.toast(V.message || 'Reading aloud is not available.', 'bad'); }, title: V.message }, UI.icon('sound', 20), h('span', 'READ TO ME')));
      voiceEl.appendChild(h('span.voicenote', 'Voice not available'));
      return;
    }
    voiceEl.appendChild(h('button.btn.voice' + (playing ? '.on' : ''), { type: 'button', 'aria-label': playing ? 'Pause reading' : paused ? 'Continue reading' : 'Read this page to me', onclick: function () {
      if (V.muted) UI.toast('Sound is off. Press the speaker button to turn it on.', 'warn'); else if (playing) V.pause(); else if (paused) V.resume(); else V.say(V.collect(view));
    } }, UI.icon(playing ? 'pause' : 'play', 20), h('span', playing ? 'PAUSE' : paused ? 'CONTINUE' : 'READ TO ME')));
    voiceEl.appendChild(h('button.btn.voice.sq', { type: 'button', 'aria-label': 'Stop reading', title: 'Stop', onclick: function () { V.stop(); } }, UI.icon('stop', 18)));
    voiceEl.appendChild(h('button.btn.voice.sq' + (V.muted ? '.on' : ''), { type: 'button', 'aria-label': V.muted ? 'Sound is off. Turn sound on' : 'Mute reading', 'aria-pressed': V.muted ? 'true' : 'false', title: V.muted ? 'Sound off' : 'Mute', onclick: function () { V.setMuted(!V.muted); St.settings.muted = V.muted; St.saveSettings(); } }, UI.icon(V.muted ? 'mute' : 'sound', 18)));
  }

  /* ------------------------------------------------------------ routing */
  function route() {
    var parts = (location.hash || '#/').slice(1).split('/').filter(Boolean), name = parts[0] || 'home', node;
    V.stop();
    current = { name: name, level: null };
    try {
      if (name === 'level') {
        var lv = OAE.cfg.levels.filter(function (l) { return String(l.id) === parts[1]; })[0];
        if (!lv) return UI.go('/map');
        if (!St.unlocked(lv.id)) { UI.toast('Finish the test in the level before this one to open this level.', 'warn'); return UI.go('/map'); }
        current.level = lv.id;
        node = OAE.LevelScreen.render(lv, parts[2] || St.nextStep(lv.id), parts.slice(3));
      } else if (Screens[name]) node = Screens[name](parts.slice(1));
      else node = Screens.home();
    } catch (e) { console.error(e); node = h('div.panel.errorpanel', h('h2', 'Oops! Something went wrong.'), h('p', e.message || String(e)), UI.link('GO HOME', '/', { kind: 'primary' })); }
    Promise.resolve(node).then(function (el) {
      U.clear(view); view.appendChild(el);
      document.body.setAttribute('data-screen', name);
      window.scrollTo(0, 0);
      var hd = view.querySelector('h1,h2'); if (hd) { hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true }); }
      document.querySelectorAll('.nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === name); });
      UI.refreshStatus(); renderVoice();
      if (St.settings.autoRead && V.supported && !V.muted) setTimeout(function () { V.say(V.collect(view)); }, 500);
    });
  }
  UI.reroute = route;

  /* ------------------------------------------------------------ HOME */
  Screens.home = function () {
    var started = Object.keys(St.progress).length > 0, nick = St.settings.nick;
    var lvDone = OAE.cfg.levels.filter(function (l) { return St.complete(l.id); }).length;
    var root = h('div.screen.home');
    root.appendChild(h('section.hero',
      h('div.hero-text',
        h('p.eyebrow', 'An ocean game about AI'),
        h('h1', { 'data-read': 'Ocean AI Explorer. Let\'s teach Bubbles!' }, 'Ocean AI Explorer'),
        h('p.lead', { 'data-read': '' }, nick ? 'Welcome back, ' + nick + '! Bubbles the robot is ready to learn.' : 'Let\'s teach Bubbles! Bubbles is a robot. You will show it pictures. Then you will see how an AI learns.'),
        h('div.row.wrap', UI.link(started ? 'CONTINUE' : 'PLAY', started ? '/map' : '/level/1', { kind: 'primary', big: true, icon: 'play' }), UI.link('OCEAN MAP', '/map', { kind: 'secondary', big: true, icon: 'map' }))),
      h('div.hero-art', U.svg(A.bubbles('wave', 250)))));

    var warn = [];
    if (D.state === 'incomplete') warn.push(h('div.banner.bad', h('b', 'Some pictures are missing. '), 'Ask a grown-up to check the game folder (' + D.missing.length + ' missing). The game will use the pictures it has.'));
    if (S.mode !== 'idb') warn.push(h('div.banner.warn', h('b', 'Saving is turned off. '), 'This browser did not allow saving. You can still play, but your work will be lost when you close the page.'));
    warn.forEach(function (w) { root.appendChild(w); });

    root.appendChild(h('section.panel',
      UI.sectionTitle('How does an AI learn?', 'Bubbles learns the same way you do: by looking, trying, and fixing mistakes.'),
      h('div.cards4',
        [['look', 'LOOK', 'Look at pictures that have names.'], ['brain', 'TRAIN', 'The AI studies the pictures. This is called training.'], ['check', 'TEST', 'The AI sees new pictures it has never seen.'], ['refresh', 'FIX', 'Find the mistakes. Add better pictures. Train again.']].map(function (c, i) {
          return h('div.how', h('div.how-n', String(i + 1)), h('div.how-i', UI.icon(c[0] === 'look' ? 'eye' : c[0], 34)), h('h3', c[1]), h('p', { 'data-read': c[1] + '. ' + c[2] }, c[2]));
        }))));
    root.appendChild(h('section.homefoot',
      h('div.progresscard', h('b', lvDone + ' of 3 main levels finished'), h('div.bar', h('i', { style: { width: (lvDone / 3 * 100) + '%' } }))),
      UI.link('HOW THIS AI WORKS', '/how', { kind: 'ghost', icon: 'book' }), UI.link('CERTIFICATE', '/certificate', { kind: 'ghost', icon: 'trophy' }), UI.link('GROWN-UPS', '/grownups', { kind: 'ghost', icon: 'gear' })));
    return root;
  };

  /* ------------------------------------------------------------ OCEAN MAP */
  var MAPICON = { 1: ['clownfish-tr00', 'plastic_bottle-tr00'], 2: ['dolphin-tr00', 'jellyfish-tr00'], 3: ['sea_turtle-tr00', 'plastic_bag-tr00'], 4: ['frog-tr00', 'shore_bird-tr00'] };
  var STEPNAMES = { look: 'LOOK', teach: 'TEACH', train: 'TRAIN', test: 'TEST', fix: 'FIX', compare: 'AGAIN' };
  UI.stepNames = STEPNAMES;
  Screens.map = function () {
    var root = h('div.screen.mapscreen');
    root.appendChild(h('div.maphead', h('h1', { 'data-read': 'Ocean Map. Pick a level.' }, 'Ocean Map'), h('p', { 'data-read': '' }, 'Pick a level. Finish the test in one level to open the next one.')));
    var map = h('div.oceanmap');
    OAE.cfg.levels.forEach(function (L) {
      var open = St.unlocked(L.id), n = St.stepsDone(L.id), fin = St.complete(L.id);
      var next = St.nextStep(L.id);
      var node = h('a.mapnode.n' + L.id + (open ? '' : '.locked') + (fin ? '.done' : ''), { href: open ? '#/level/' + L.id : null, 'aria-disabled': open ? null : 'true', tabindex: open ? '0' : '-1',
        'aria-label': 'Level ' + L.id + ': ' + L.title + (open ? '' : ' (locked)') },
        h('div.mn-top', h('span.mn-num', L.optional ? 'BONUS' : 'LEVEL ' + L.id), open ? null : UI.icon('lock', 20), fin ? UI.icon('star', 22) : null),
        h('div.mn-icons', MAPICON[L.id].map(function (id) { return UI.pic(id, '', 'round'); })),
        h('h2', L.title), h('p', L.short),
        h('div.bar', h('i', { style: { width: (n / 6 * 100) + '%' } })), h('small', open ? (fin ? 'Finished! Play again any time.' : n ? 'Next: ' + STEPNAMES[next] : 'Ready to start') : 'Locked'),
        h('span.mn-go', open ? (n ? 'CONTINUE' : 'START') : 'LOCKED'));
      map.appendChild(node);
    });
    map.appendChild(h('div.mapchest', U.svg(A.chest(110, St.complete(1) && St.complete(2) && St.complete(3))), UI.link('CERTIFICATE', '/certificate', { kind: 'secondary' })));
    map.appendChild(h('div.mapbot', U.svg(A.bubbles('happy', 130))));
    root.appendChild(map);
    root.appendChild(h('section.panel.restartbar', h('h3', 'Play again'),
      h('div.row.wrap', OAE.cfg.levels.map(function (L) { return UI.btn('PLAY LEVEL ' + L.id + ' AGAIN', { kind: 'ghost', icon: 'refresh', onclick: function () { UI.restartLevel(L); } }); }),
        UI.btn('START A NEW GAME', { kind: 'danger', icon: 'refresh', onclick: function () { UI.restartAll(); } }))));
    return root;
  };

  /* ------------------------------------------------------------ HOW IT WORKS */
  Screens.how = function () {
    var tr = OAE.cfg.train;
    return h('div.screen.how-screen', h('h1', 'How this AI works'),
      UI.bubblesSays('I am Bubbles. Here is how I really learn inside this computer.', 'think'),
      h('div.panel', h('h2', 'The easy story'),
        h('ol.bigsteps',
          h('li', h('b', 'My eyes. '), 'A picture is made of tiny dots. My eyes turn the dots into numbers: colors, edges, and shapes. My eyes are fixed filters. They do not learn.'),
          h('li', h('b', 'My brain. '), 'My brain is a small network of numbers called a neural network. It starts out guessing.'),
          h('li', h('b', 'Training. '), 'For each training picture I make a guess. You told me the right answer. The network changes its numbers a tiny bit so the next guess is better. This happens thousands of times.'),
          h('li', h('b', 'Testing. '), 'Then I look at test pictures I have never seen. The score is the number of right answers out of all test pictures.'))),
      h('div.panel', h('h2', 'For grown-ups'),
        h('ul.plain',
          h('li', 'Everything runs on this computer. No pictures or answers are sent anywhere, and there is no account.'),
          h('li', 'The AI is a small neural network written for this game: ' + (OAE.Features.DIM) + ' numbers from a fixed image filter bank go in, one hidden layer of ' + tr.hidden + ' units, and one score per group come out. It is trained with back-propagation and the Adam method for up to ' + tr.epochs + ' rounds (epochs). Each picture is also shown mirrored.'),
          h('li', 'There was no pretrained photo model available when this game was built, so Bubbles starts with no knowledge at all. It only knows what the child teaches it.'),
          h('li', 'The pictures are original cartoon-style illustrations made for this game (CC0), not photographs. A real photo may be harder for the AI than these drawings. See IMAGE_SOURCES.md.'),
          h('li', 'Test, validation and challenge pictures are kept apart. The game refuses to use them for training.'),
          h('li', 'Scores come from real predictions. A score can go down after retraining, and the game shows that honestly.'))),
      h('div.row', UI.link('BACK HOME', '/', { kind: 'ghost', icon: 'home' })));
  };

  /* ------------------------------------------------------------ CERTIFICATE */
  Screens.certificate = function () {
    var done = OAE.cfg.levels.filter(function (L) { return St.done(L.id, 'test'); });
    var root = h('div.screen.certscreen');
    if (!done.length) {
      return h('div.screen', h('h1', 'Certificate'), h('div.panel.empty', U.svg(A.chest(120, false)), h('h2', 'Your certificate is waiting!'), h('p', 'Train and test your AI in a level. Then come back here.'), UI.link('GO TO THE MAP', '/map', { kind: 'primary', icon: 'map' })));
    }
    var name = St.settings.nick || 'Ocean Explorer';
    var input = h('input.nick', { type: 'text', maxlength: '20', value: St.settings.nick, placeholder: 'Type a name (you can skip this)', 'aria-label': 'Name on the certificate (optional)', oninput: function () { St.settings.nick = input.value.trim(); nameEl.textContent = St.settings.nick || 'Ocean Explorer'; St.saveSettings(); } });
    var nameEl = h('div.cert-name', name);
    root.appendChild(h('div.noprint', h('h1', 'Certificate'), h('div.row.wrap', input, UI.btn('PRINT', { kind: 'primary', icon: 'trophy', onclick: function () { window.print(); } }), UI.link('MAP', '/map', { kind: 'ghost', icon: 'map' }))));
    root.appendChild(h('div.cert',
      h('div.cert-bot', U.svg(A.bubbles('cheer', 130))),
      h('div.cert-body', h('p.cert-small', 'OCEAN AI EXPLORER'), h('h2', 'Certificate of Discovery'), h('p', 'This is to say that'), nameEl, h('p', 'taught an AI to learn from pictures, found its mistakes, and tried again.'),
        h('ul.cert-list', OAE.cfg.levels.filter(function (L) { return St.done(L.id, 'test'); }).map(function (L) {
          var run = St.lastRun(L.id, 'test');
          return h('li', UI.icon(St.complete(L.id) ? 'star' : 'check', 18), h('b', 'Level ' + L.id + ': ' + L.title), run ? ' - last score ' + run.accuracy.toFixed(1) + '% on the fixed test set (' + run.items.length + ' pictures)' : '', St.complete(L.id) ? '' : ' - still to finish');
        })),
        h('p.cert-small', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '. Great scientists learn from mistakes!')),
      h('div.cert-chest', U.svg(A.chest(100, true)))));
    return root;
  };

  /* ------------------------------------------------------------ GROWN-UPS */
  Screens.grownups = function () {
    var root = h('div.screen.grownups');
    root.appendChild(h('h1', 'Grown-ups'));
    root.appendChild(h('p.lead', 'Settings, checks and reset options for a teacher or parent. Nothing on this page is needed to play.'));

    // offline self check
    var chk = h('div.checklist');
    function line(ok, text, detail) { return h('li' + (ok === null ? '.pending' : ok ? '.ok' : '.bad'), h('b', text), detail ? h('small', detail) : null); }
    function runChecks() {
      U.clear(chk); chk.appendChild(h('p', 'Checking...'));
      var off = UI.checkOffline();
      var packOk = D.state === 'ready';
      var imgTests = ['clownfish-tr00', 'dolphin-te00', 'plastic_bag-tr00'].map(function (id) { return D.byId[id] ? D.decode(id).then(function () { return true; }, function () { return false; }) : Promise.resolve(false); });
      Promise.all(imgTests).then(function (r) {
        var net = Object.keys(M.nets).length, ul = h('ul.checks');
        ul.appendChild(line(off.ok, 'No internet files used', off.ok ? 'Every script, style and picture came from this computer.' : 'External: ' + off.external.slice(0, 3).join(', ')));
        ul.appendChild(line(packOk, 'Picture library complete', D.images.length + ' pictures in the list. ' + (D.missing.length ? D.missing.length + ' missing.' : 'All found.')));
        ul.appendChild(line(r.every(Boolean), 'Pictures can be opened and read', 'Opened 3 sample pictures and read their pixels.'));
        ul.appendChild(line(true, 'AI engine loaded', 'Neural network + image filters in this page (' + OAE.Features.DIM + ' numbers per picture).'));
        ul.appendChild(line(true, net + ' saved AI brain' + (net === 1 ? '' : 's') + ' loaded', net ? 'Levels: ' + Object.keys(M.nets).join(', ') : 'Train a level to make one.'));
        ul.appendChild(line(S.mode === 'idb', 'Saving on this device', S.mode === 'idb' ? 'Using IndexedDB (stays on this computer).' : 'Not available: ' + (S.error || 'unknown reason') + '. Progress is kept only while the page is open.'));
        ul.appendChild(line(V.supported ? true : null, 'Offline voice', V.supported ? 'Using the local voice "' + V.voice.name + '".' : V.message));
        U.clear(chk); chk.appendChild(ul);
        S.estimate().then(function (e) { if (e && e.quota) chk.appendChild(h('p.small', 'Storage used: ' + (e.usage / 1048576).toFixed(1) + ' MB of about ' + Math.round(e.quota / 1048576) + ' MB available to this page.')); });
        UI.refreshStatus();
      });
    }
    root.appendChild(h('section.panel', h('h2', 'Offline check'), chk, UI.btn('RUN CHECK AGAIN', { kind: 'secondary', icon: 'refresh', onclick: runChecks })));
    setTimeout(runChecks, 0);

    // settings
    var nick = h('input.nick', { type: 'text', maxlength: '20', value: St.settings.nick, 'aria-label': 'Explorer name (optional)', placeholder: 'Optional name for the certificate', oninput: function () { St.settings.nick = nick.value.trim(); St.saveSettings(); } });
    var auto = h('input', { type: 'checkbox', id: 'autoread', onchange: function (e) { St.settings.autoRead = e.target.checked; St.saveSettings(); if (e.target.checked && !V.supported) UI.toast(V.message, 'warn'); } }); auto.checked = !!St.settings.autoRead;
    var lively = h('input', { type: 'checkbox', id: 'lively', onchange: function (e) { St.settings.lively = e.target.checked; V.setLively(e.target.checked); St.saveSettings(); } }); lively.checked = St.settings.lively !== false;
    var online = h('input', { type: 'checkbox', id: 'onlinevoice', onchange: function (e) { St.settings.onlineVoice = e.target.checked; V.setAllowOnline(e.target.checked); St.saveSettings(); UI.toast(e.target.checked ? (V.supported ? 'Online voices are allowed. The browser may send the words to its speech service.' : V.message) : 'Only voices stored on this computer will be used.', e.target.checked ? 'warn' : ''); } }); online.checked = !!St.settings.onlineVoice;
    var unlock = h('input', { type: 'checkbox', id: 'unlockall', onchange: function (e) { St.settings.unlockAll = e.target.checked; St.saveSettings(); } }); unlock.checked = !!St.settings.unlockAll;
    var rate = h('input', { type: 'range', min: '0.6', max: '1.3', step: '0.1', value: String(St.settings.rate), 'aria-label': 'Reading speed', oninput: function (e) { St.settings.rate = +e.target.value; V.setRate(St.settings.rate); St.saveSettings(); } });
    root.appendChild(h('section.panel', h('h2', 'Settings'),
      h('div.formrow', h('label', { for: 'x' }, 'Explorer name'), nick),
      h('div.formrow', auto, h('label', { for: 'autoread' }, 'Read each new screen aloud automatically')),
      h('div.formrow', h('label', 'Reading speed'), rate, UI.btn('TRY IT', { kind: 'ghost', onclick: function () { V.say('Hello! I am Bubbles. Let us learn about the ocean. Are you ready? Wow, this will be fun!'); } })),
      h('div.formrow', lively, h('label', { for: 'lively' }, 'Lively storytelling voice (ups and downs, like a happy kid)')),
      h('div.formrow', online, h('label', { for: 'onlinevoice' }, 'Allow online voices if no voice is stored on this computer (the browser may send the spoken words to its speech service, so the game is no longer fully offline while this is on)')),
      h('div.formrow', unlock, h('label', { for: 'unlockall' }, 'Open all levels (skip the unlock rule)'))));

    // library counts
    var cnt = D.counts(), splits = ['train', 'pool', 'validation', 'test', 'challenge'], tot = { train: 0, pool: 0, validation: 0, test: 0, challenge: 0, total: 0 };
    var rows = D.leaves().map(function (l) { var c = cnt[l] || {}; splits.concat(['total']).forEach(function (s) { tot[s] += c[s] || 0; }); return h('tr', h('th', D.leafInfo(l).label), splits.map(function (s) { return h('td', String(c[s] || 0)); }), h('td', h('b', String(c.total || 0)))); });
    rows.push(h('tr.total', h('th', 'ALL'), splits.map(function (s) { return h('td', String(tot[s])); }), h('td', h('b', String(tot.total)))));
    root.appendChild(h('section.panel', h('h2', 'Picture library'),
      h('p', 'These are original illustrations made for this game, free to use (CC0). They are not photographs. "Library" pictures (train + extra) can be used for teaching. "Validation", "test" and "challenge" pictures are secret and never used for training.'),
      h('div.tablewrap', h('table.counts', h('thead', h('tr', h('th', 'Picture'), h('th', 'Train'), h('th', 'Extra (library)'), h('th', 'Validation'), h('th', 'Test'), h('th', 'Challenge'), h('th', 'All'))), h('tbody', rows)))));

    // reset
    var resetBtns = OAE.cfg.levels.map(function (L) {
      return UI.btn('Reset Level ' + L.id, { kind: 'ghost', icon: 'refresh', onclick: function () {
        UI.confirm({ title: 'Reset Level ' + L.id + '?', text: 'This deletes the trained AI, the training pictures you chose, and the test results for Level ' + L.id + ' only.', yes: 'YES, RESET LEVEL ' + L.id, danger: true }).then(function (ok) {
          if (ok) St.resetLevel(L).then(function () { UI.toast('Level ' + L.id + ' was reset.'); UI.reroute(); }).catch(UI.problem);
        });
      } });
    });
    root.appendChild(h('section.panel.danger', h('h2', 'Reset'),
      h('p', 'Delete saved progress from this computer. This cannot be undone.'),
      h('div.row.wrap', resetBtns, UI.btn('RESET EVERYTHING', { kind: 'danger', icon: 'trash', onclick: function () {
        UI.confirm({ title: 'Delete ALL progress?', text: 'This deletes every saved AI brain, training choice, test result, imported picture, and setting. Are you sure?', yes: 'YES, DELETE EVERYTHING', danger: true }).then(function (ok) {
          if (!ok) return;
          UI.confirm({ title: 'Really delete everything?', text: 'Last check. There is no way to get it back.', yes: 'DELETE', no: 'KEEP MY WORK', danger: true }).then(function (ok2) {
            if (ok2) St.resetAll().then(function () { UI.toast('Everything was deleted.'); UI.go('/'); }).catch(UI.problem);
          });
        });
      } }))));
    root.appendChild(h('div.row', UI.link('BACK HOME', '/', { kind: 'ghost', icon: 'home' })));
    return root;
  };

  /* ------------------------------------------------------------ BOOT */
  function buildShell() {
    var app = document.getElementById('app');
    U.clear(app);
    A.bubblesBackground(document.body);
    chipsEl = h('ul.statuslist', { 'aria-label': 'Game status' });
    voiceEl = h('div.voicebox', { role: 'group', 'aria-label': 'Read to me' });
    var header = h('header.top',
      h('a.brand', { href: '#/', 'aria-label': 'Ocean AI Explorer home' }, U.svg(A.bubbles('happy', 46)), h('span', 'Ocean AI ', h('em', 'Explorer'))),
      h('nav.nav', { 'aria-label': 'Main' }, h('a', { href: '#/', 'data-nav': 'home' }, UI.icon('home', 20), 'HOME'), h('a', { href: '#/map', 'data-nav': 'map' }, UI.icon('map', 20), 'MAP'), h('a', { href: '#/grownups', 'data-nav': 'grownups' }, UI.icon('gear', 20), 'GROWN-UPS')),
      voiceEl, chipsEl);
    view = h('main#view', { tabindex: '-1' });
    app.appendChild(header); app.appendChild(view);
    app.appendChild(h('div.reefwrap', U.svg(A.reef())));
  }

  function splash(msg, p) {
    var app = document.getElementById('app');
    U.clear(app);
    app.appendChild(h('div.splash', U.svg(A.bubbles('happy', 160)), h('h1', 'Ocean AI Explorer'), h('p#splashmsg', msg), h('div.bar.big', h('i#splashbar', { style: { width: ((p || 0) * 100) + '%' } }))));
  }

  OAE.boot = async function () {
    try {
      if (!OAE.data) throw new Error('The game data file is missing (app/data/data.js).');
      OAE.cfg = OAE.Config.build(OAE.data.taxonomy);
      splash('Opening saved data...', 0.05);
      await S.open();
      D.init();
      splash('Loading the picture library...', 0.1);
      await D.loadPacks(function (p) { var b = document.getElementById('splashbar'); if (b) b.style.width = (10 + p * 80) + '%'; var m = document.getElementById('splashmsg'); if (m) m.textContent = 'Loading pictures... ' + Math.round(p * 100) + '%'; });
      splash('Waking up Bubbles...', 0.93);
      await St.load();
      await M.loadSaved();
      V.init(); V.muted = !!St.settings.muted; V.setRate(St.settings.rate); V.setLively(St.settings.lively !== false); V.setAllowOnline(!!St.settings.onlineVoice);
      V.onChange(renderVoice);
      S.onProblem(function (msg) { UI.toast(msg, 'bad'); });
      buildShell();
      window.addEventListener('hashchange', route);
      route();
      if (S.mode !== 'idb') UI.toast('Saving is not available in this browser. Your work will not be kept.', 'warn');
    } catch (e) {
      console.error(e);
      var app = document.getElementById('app'); U.clear(app);
      app.appendChild(h('div.splash', U.svg(A.bubbles('oops', 140)), h('h1', 'Oops!'), h('p', 'The game could not start. ' + (e && e.message || '')), h('p.small', 'Ask a grown-up to check that the whole game folder is here, then reload this page.')));
    }
  };
})();
