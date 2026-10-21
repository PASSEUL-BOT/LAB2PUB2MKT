/* art.js - original local artwork: the robot Bubbles, icons, reef, treasure chest, confetti.
 * Everything is inline SVG drawn for this game, so nothing is downloaded. */
(function () {
  'use strict';
  window.OAE = window.OAE || {};
  var A = OAE.Art = {};

  /** Bubbles the robot. mood: happy | think | oops | cheer | wave | sleepy */
  A.bubbles = function (mood, size) {
    mood = mood || 'happy';
    var eyes, mouth, brows = '', extra = '', armL = 'M44 150 q-26 6 -22 30', armR = 'M156 150 q26 6 22 30';
    var eyeFill = '#8ff7ff';
    function eye(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + eyeFill + '"/><circle cx="' + (cx + 3) + '" cy="' + (cy - 3) + '" r="' + (r / 3.2) + '" fill="#fff"/>'; }
    if (mood === 'happy' || mood === 'wave') {
      eyes = eye(78, 78, 11) + eye(122, 78, 11);
      mouth = '<path d="M84 98 q16 18 32 0" fill="none" stroke="#8ff7ff" stroke-width="5" stroke-linecap="round"/>';
      if (mood === 'wave') armR = 'M156 150 q34 -10 30 -44';
    } else if (mood === 'cheer') {
      eyes = '<path d="M66 82 q12 -20 24 0" fill="none" stroke="#8ff7ff" stroke-width="6" stroke-linecap="round"/><path d="M110 82 q12 -20 24 0" fill="none" stroke="#8ff7ff" stroke-width="6" stroke-linecap="round"/>';
      mouth = '<path d="M82 94 q18 28 36 0 z" fill="#8ff7ff"/><path d="M92 106 q8 6 16 0" fill="none" stroke="#ff7a9a" stroke-width="4" stroke-linecap="round"/>';
      armL = 'M44 150 q-34 -10 -30 -50'; armR = 'M156 150 q34 -10 30 -50';
      extra = '<g fill="#ffc933"><path d="M20 40 l4 10 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1z" transform="scale(.8)"/><path d="M170 30 l4 10 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1z" transform="translate(40 0) scale(.8)"/></g>';
    } else if (mood === 'oops') {
      eyes = eye(78, 80, 10) + eye(122, 80, 10);
      brows = '<path d="M64 62 l22 6" stroke="#8ff7ff" stroke-width="5" stroke-linecap="round"/><path d="M136 62 l-22 6" stroke="#8ff7ff" stroke-width="5" stroke-linecap="round"/>';
      mouth = '<path d="M84 108 q6 -8 11 0 t11 0 t11 0" fill="none" stroke="#8ff7ff" stroke-width="5" stroke-linecap="round"/>';
      extra = '<path d="M160 54 q9 14 0 22 q-9 -8 0 -22z" fill="#8fd8ff" stroke="#3f8ef5" stroke-width="2"/>';
    } else if (mood === 'think') {
      eyes = eye(78, 80, 11) + '<circle cx="122" cy="76" r="8" fill="' + eyeFill + '"/><circle cx="125" cy="73" r="2.6" fill="#fff"/>';
      brows = '<path d="M108 60 l24 -6" stroke="#8ff7ff" stroke-width="5" stroke-linecap="round"/>';
      mouth = '<circle cx="104" cy="104" r="5" fill="none" stroke="#8ff7ff" stroke-width="4.5"/>';
      armR = 'M156 150 q24 -14 6 -38';
      extra = '<g fill="#fff" stroke="#3f8ef5" stroke-width="2"><circle cx="168" cy="26" r="4"/><circle cx="180" cy="12" r="6"/></g>';
    } else {   // sleepy
      eyes = '<path d="M66 80 q12 10 24 0" fill="none" stroke="#8ff7ff" stroke-width="6" stroke-linecap="round"/><path d="M110 80 q12 10 24 0" fill="none" stroke="#8ff7ff" stroke-width="6" stroke-linecap="round"/>';
      mouth = '<path d="M92 104 q8 4 16 0" fill="none" stroke="#8ff7ff" stroke-width="5" stroke-linecap="round"/>';
    }
    return '<svg class="bubbles bubbles-' + mood + '" viewBox="0 0 200 220" width="' + (size || 160) + '" role="img" aria-label="Bubbles the robot">' +
      '<g class="b-body">' +
      '<ellipse cx="100" cy="212" rx="48" ry="6" fill="#06304f" opacity=".18"/>' +
      '<g class="b-antenna"><line x1="100" y1="32" x2="100" y2="14" stroke="#0b6f86" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="11" r="8" fill="#ffc933" stroke="#e29a00" stroke-width="3"/></g>' +
      '<path d="' + armL + '" fill="none" stroke="#0b6f86" stroke-width="16" stroke-linecap="round"/><path d="' + armL + '" fill="none" stroke="#19b7c9" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="' + armR + '" fill="none" stroke="#0b6f86" stroke-width="16" stroke-linecap="round"/><path d="' + armR + '" fill="none" stroke="#19b7c9" stroke-width="9" stroke-linecap="round"/>' +
      '<rect x="48" y="124" width="104" height="78" rx="30" fill="#19b7c9" stroke="#0b6f86" stroke-width="5"/>' +
      '<circle cx="100" cy="162" r="17" fill="#e8fbff" stroke="#0b6f86" stroke-width="4"/><path d="M92 163 l6 6 11 -13" fill="none" stroke="#ff7a9a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="76" cy="205" rx="17" ry="8" fill="#ff7a9a" stroke="#c9486a" stroke-width="3"/><ellipse cx="124" cy="205" rx="17" ry="8" fill="#ff7a9a" stroke="#c9486a" stroke-width="3"/>' +
      '<rect x="28" y="30" width="144" height="104" rx="46" fill="#e8fbff" stroke="#0b6f86" stroke-width="5"/>' +
      '<rect x="42" y="44" width="116" height="76" rx="34" fill="#0b3a57"/>' +
      '<path d="M54 56 q14 -8 34 -6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>' +
      '<circle cx="60" cy="100" r="8" fill="#ff7a9a" opacity=".75"/><circle cx="140" cy="100" r="8" fill="#ff7a9a" opacity=".75"/>' +
      eyes + brows + mouth + '</g>' + extra + '</svg>';
  };

  var ICONS = {
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8q4 4 0 8M18.5 5.5q7 6.5 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="currentColor"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>',
    search: '<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
    gear: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    image: '<rect x="3.5" y="5" width="17" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="M5 17l5-5 3 3 3-3 3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    star: '<path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17l-5.6 3 1.3-6.2L3 9.5l6.3-.7z" fill="currentColor"/>',
    brain: '<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3.2 3.2 0 002 4.4A3 3 0 009 20a3 3 0 003-3V6a2 2 0 00-3-2zM15 4a3 3 0 013 3 3 3 0 012 5 3.2 3.2 0 01-2 4.4A3 3 0 0115 20a3 3 0 01-3-3V6a2 2 0 013-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    book: '<path d="M4 5.5C7 4 10 4 12 6c2-2 5-2 8-.5V19c-3-1.5-6-1.5-8 .5-2-2-5-2-8-.5z M12 6v13.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 20h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  A.icon = function (name, size) {
    return '<svg class="icon" viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) + '" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  };

  /** A strip of coral, seaweed and shells for the bottom of the screen. */
  A.reef = function () {
    var cols = ['#ff7a9a', '#ffb703', '#8f7cf0', '#ff8f3d', '#5fd3a0'], out = '', i;
    for (i = 0; i < 9; i++) {
      var x = 60 + i * 150 + (i % 2) * 30, h = 50 + (i * 37) % 50, c = cols[i % cols.length];
      out += '<g transform="translate(' + x + ' 120)"><path d="M0 0 q-6 -' + h / 2 + ' 0 -' + h + ' M0 -' + h / 2 + ' q-18 -10 -22 -28 M0 -' + h / 2 + ' q18 -12 22 -30" fill="none" stroke="' + c + '" stroke-width="10" stroke-linecap="round"/></g>';
      out += '<path d="M' + (x + 70) + ' 120 q-14 -40 4 -70 q-2 34 14 52 q6 -20 -4 -52 q22 30 6 70z" fill="#2fbf8f" opacity=".85" class="sway"/>';
    }
    return '<svg class="reef" viewBox="0 0 1400 130" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + out +
      '<path d="M0 120 q175 -22 350 0 t350 0 t350 0 t350 0 V130 H0z" fill="#f4d58d"/></svg>';
  };

  A.chest = function (size, open) {
    return '<svg viewBox="0 0 120 100" width="' + (size || 100) + '" role="img" aria-label="Treasure chest">' +
      '<rect x="10" y="46" width="100" height="46" rx="8" fill="#b9733a" stroke="#6b3b17" stroke-width="4"/>' +
      (open ? '<path d="M10 46 L18 18 H102 L110 46z" fill="#d38b4a" stroke="#6b3b17" stroke-width="4" transform="rotate(-14 10 46)"/><circle cx="60" cy="40" r="6" fill="#ffc933"/><circle cx="46" cy="38" r="5" fill="#ffb703"/><circle cx="74" cy="38" r="5" fill="#ffc933"/>' :
        '<path d="M10 50 q0 -34 50 -34 t50 34z" fill="#d38b4a" stroke="#6b3b17" stroke-width="4"/>') +
      '<rect x="52" y="48" width="16" height="20" rx="4" fill="#ffc933" stroke="#a46b00" stroke-width="3"/><circle cx="60" cy="58" r="3" fill="#a46b00"/>' +
      '<path d="M30 46v46M90 46v46" stroke="#6b3b17" stroke-width="4"/></svg>';
  };

  /** Floating bubbles behind everything. */
  A.bubblesBackground = function (host) {
    var wrap = document.createElement('div'); wrap.className = 'bg-bubbles'; wrap.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 14; i++) {
      var b = document.createElement('i'), s = 8 + (i * 13) % 34;
      b.style.cssText = 'left:' + ((i * 71) % 100) + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + (11 + (i * 5) % 14) + 's;animation-delay:-' + ((i * 3) % 17) + 's';
      wrap.appendChild(b);
    }
    host.appendChild(wrap);
  };

  /** Small celebration. Respects the reduced-motion setting. */
  A.confetti = function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'); c.className = 'confetti'; c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    var ctx = c.getContext('2d'), cols = ['#19b7c9', '#ff7a9a', '#ffc933', '#5fd3a0', '#8f7cf0', '#ff8f3d'], P = [], i;
    for (i = 0; i < 140; i++) P.push({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.6, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[i % cols.length] });
    var t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      P.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6); ctx.restore(); });
      if (t - t0 < 3200) requestAnimationFrame(frame); else c.remove();
    })(t0);
  };
})();
