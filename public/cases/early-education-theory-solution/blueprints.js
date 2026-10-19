/*
 * Blueprint drawings for the 20 landmarks (simplified engineering elevations, drawn in code).
 * Each drawing is an inline SVG string in window.BLUEPRINTS[id].
 * They are original line drawings, not 3D renders. See README.md for the limits.
 */
(function () {
  'use strict';

  var GY = 340; // ground line
  var RAD = Math.PI / 180;

  /* ---------- tiny drawing helpers ---------- */
  function f(v) { return Math.round(v * 10) / 10; }
  function M(x, y) { return 'M' + f(x) + ',' + f(y); }
  function Lt(x, y) { return 'L' + f(x) + ',' + f(y); }
  function path(d) { return '<path d="' + d + '"/>'; }
  function line(x1, y1, x2, y2) { return path(M(x1, y1) + Lt(x2, y2)); }
  function poly(pts, close) {
    var d = '';
    pts.forEach(function (p, i) { d += (i ? Lt(p[0], p[1]) : M(p[0], p[1])); });
    return path(d + (close ? 'Z' : ''));
  }
  function rect(x, y, w, h) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"/>'; }
  function circle(cx, cy, r) { return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/>'; }
  function ell(cx, cy, rx, ry) { return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '"/>'; }
  // round-topped opening: bottom y, half width, straight height
  function arch(cx, yb, hw, h) {
    return path(M(cx - hw, yb) + Lt(cx - hw, yb - h) + 'A' + f(hw) + ',' + f(hw) + ' 0 0 1 ' + f(cx + hw) + ',' + f(yb - h) + Lt(cx + hw, yb));
  }
  function grp(cls, s) { return '<g class="' + cls + '">' + s + '</g>'; }
  function thin(s) { return grp('t', s); }
  function dashed(s) { return grp('d', s); }
  function qp(p0, p1, p2, s) {
    var a = (1 - s) * (1 - s), b = 2 * s * (1 - s), c = s * s;
    return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]];
  }
  function mirror(id, left) {
    return '<g id="m' + id + '">' + left + '</g><use href="#m' + id + '" transform="translate(640 0) scale(-1 1)"/>';
  }
  function waves() {
    var s = '';
    for (var x = 20; x < 620; x += 24) s += path(M(x, 347) + 'q6,-4 12,0 t12,0');
    return thin(s);
  }

  /* ---------- 1. Eiffel Tower ---------- */
  function eiffel() {
    var s = '';
    s += path('M320,34 Q316,70 313,100 Q309,150 302,190 Q290,230 264,262 Q238,300 220,340');
    s += line(320, 18, 320, 34);
    s += path('M276,270 Q264,300 262,340');
    s += path('M262,340 Q280,280 320,276');
    [[313, 100], [302, 190], [299, 197], [264, 262], [270, 270]].forEach(function (p) { s += line(p[0], p[1], 320, p[1]); });
    s += line(313, 100, 338, 190) + line(302, 190, 376, 262);
    s += thin(line(311, 130, 320, 130) + line(307, 160, 320, 160) +
      line(249, 285, 271, 285) + line(240, 300, 268, 300) + line(229, 320, 265, 320) +
      line(249, 285, 268, 300) + line(240, 300, 265, 320));
    return mirror(1, s);
  }

  /* ---------- 2. Statue of Liberty ---------- */
  function liberty() {
    var s = '';
    s += rect(255, 312, 130, 28);
    s += poly([[272, 312], [368, 312], [360, 236], [280, 236]], true);
    s += rect(270, 228, 100, 8);
    s += thin(line(276, 288, 364, 288) + line(279, 262, 361, 262));
    s += poly([[296, 228], [298, 176], [304, 130], [312, 118], [328, 118], [336, 130], [342, 176], [344, 228]]);
    s += circle(320, 100, 13);
    [-60, -40, -20, 0, 20, 40, 60].forEach(function (a) {
      var r = a === 0 ? 40 : 31, rad = a * RAD;
      s += line(320 + 13 * Math.sin(rad), 100 - 13 * Math.cos(rad), 320 + r * Math.sin(rad), 100 - r * Math.cos(rad));
    });
    s += path('M308,92 Q320,84 332,92');
    s += poly([[296, 130], [278, 62], [288, 58], [306, 126]]);
    s += poly([[271, 60], [295, 60], [291, 70], [275, 70]], true);
    s += path('M283,58 Q273,46 283,32 Q293,46 283,58 Z');
    s += poly([[338, 150], [362, 144], [366, 178], [342, 184]], true);
    s += thin(line(344, 158, 360, 154) + line(344, 166, 361, 162) + line(345, 174, 362, 170));
    s += thin(path('M308,150 Q304,190 306,228') + path('M320,140 L320,228') + path('M332,150 Q336,190 334,228'));
    return s;
  }

  /* ---------- 3. Pyramids of Giza ---------- */
  function pyr(ax, ay, bl, br, cx, cy, n) {
    var s = line(bl, GY, br, GY) + line(ax, ay, bl, GY) + line(ax, ay, br, GY) + line(ax, ay, cx, cy) + line(br, GY, cx, cy);
    var hb = bl + (cx - br);
    var hidden = dashed(line(ax, ay, hb, cy) + line(hb, cy, cx, cy) + line(bl, GY, hb, cy));
    var t = '';
    for (var i = 1; i <= n; i++) {
      var u = i / (n + 1), y = ay + (GY - ay) * u;
      t += line(ax + (bl - ax) * u, y, ax + (br - ax) * u, y);
      t += line(ax + (br - ax) * u, y, ax + (cx - ax) * u, ay + (cy - ay) * u);
    }
    return s + thin(t) + hidden;
  }
  function giza() {
    return pyr(250, 110, 140, 360, 410, 318, 6) + pyr(440, 208, 386, 494, 522, 326, 4) + pyr(548, 268, 516, 580, 604, 334, 3);
  }

  /* ---------- 4. Sydney Opera House ---------- */
  function sail(x0, w, px, py) {
    var by = 318, h = by - py;
    var d = M(x0, by) + 'C' + f(x0) + ',' + f(by - h * 0.45) + ' ' + f(px - w * 0.25) + ',' + f(py + h * 0.12) + ' ' + f(px) + ',' + f(py) +
      'C' + f(px + w * 0.12) + ',' + f(py + h * 0.35) + ' ' + f(x0 + w) + ',' + f(by - h * 0.25) + ' ' + f(x0 + w) + ',' + f(by) + 'Z';
    var ribs = '';
    for (var k = 1; k <= 4; k++) ribs += line(px, py, x0 + w * k / 5, by);
    return path(d) + thin(ribs);
  }
  function opera() {
    var s = line(100, 318, 570, 318) + line(92, 326, 578, 326) + line(100, 318, 92, 326) + line(570, 318, 578, 326);
    s += thin(line(110, 332, 560, 332));
    s += sail(150, 110, 172, 128) + sail(214, 100, 236, 152) + sail(272, 90, 292, 182);
    s += sail(360, 100, 448, 164) + sail(420, 85, 488, 194) + sail(490, 60, 540, 250);
    return s;
  }

  /* ---------- 5. Colosseum ---------- */
  function colosseum() {
    var s = ell(320, 150, 200, 36) + path('M120,340 A200,36 0 0 0 520,340') + line(120, 150, 120, 340) + line(520, 150, 520, 340);
    s += thin(ell(320, 150, 150, 26));
    [180, 233, 286].forEach(function (y) { s += path('M120,' + y + ' A200,36 0 0 0 520,' + y); });
    var tiers = [[180, 233], [233, 286], [286, 340]], a = '';
    for (var i = 0; i < 16; i++) {
      var x = 120 + (i + 0.5) * 25, d = 36 * Math.sqrt(1 - Math.pow((x - 320) / 200, 2));
      tiers.forEach(function (t) {
        a += path(M(x - 7, t[1] + d - 6) + Lt(x - 7, t[0] + d + 17) + 'Q' + f(x - 7) + ',' + f(t[0] + d + 9) + ' ' + f(x) + ',' + f(t[0] + d + 9) +
          'Q' + f(x + 7) + ',' + f(t[0] + d + 9) + ' ' + f(x + 7) + ',' + f(t[0] + d + 17) + Lt(x + 7, t[1] + d - 6));
      });
      a += rect(x - 3, 150 + d + 8, 6, 14);
    }
    return '<g transform="translate(0 -36)">' + s + thin(a) + '</g>';
  }

  /* ---------- 6. Taj Mahal ---------- */
  function taj() {
    var s = '';
    s += path('M150,340 L150,316 L320,316');
    s += path('M180,316 L180,236 L250,236 L250,210 L320,210');
    s += path('M192,316 L192,284 Q200,268 208,284 L208,316') + path('M220,316 L220,284 Q228,268 236,284 L236,316');
    s += path('M298,316 L298,258 Q298,232 320,220') + thin(path('M306,316 L306,262 Q306,244 320,236'));
    s += path('M256,210 L256,194 Q262,180 268,194 L268,210') + line(262, 180, 262, 172);
    s += path('M286,210 L286,198 Q292,186 298,198 L298,210') + line(292, 186, 292, 180);
    s += path('M290,210 L290,180') + path('M290,180 C268,164 276,118 320,92') + line(320, 92, 320, 60) + line(316, 70, 324, 70);
    s += path('M162,316 L162,150 L178,150 L178,316') + line(158, 260, 182, 260) + line(158, 205, 182, 205);
    s += path('M162,150 L162,138 Q170,124 178,138 L178,150') + line(170, 124, 170, 114);
    return mirror(6, s);
  }

  /* ---------- 7. Forbidden City (hall with double roof) ---------- */
  function forbidden() {
    var s = '', i, x;
    s += path('M110,340 L110,322 L130,322 L130,306 L150,306 L150,290 L320,290');
    s += path('M190,290 L190,240') + line(190, 246, 320, 246);
    for (x = 210; x <= 310; x += 20) s += thin(line(x, 290, x, 246));
    s += path('M300,290 L300,262 L320,262');
    s += path('M148,220 Q152,240 172,240 L320,240') + line(172, 240, 212, 200) + line(212, 200, 320, 200);
    for (x = 192; x <= 312; x += 20) s += thin(line(x, 240, x, 200 + (x < 212 ? (212 - x) : 0)));
    s += path('M212,200 L212,172') + line(212, 172, 320, 172);
    for (x = 232; x <= 312; x += 20) s += thin(line(x, 200, x, 172));
    s += path('M190,150 Q194,168 214,168 L320,168') + line(214, 168, 252, 126) + line(252, 126, 320, 126);
    s += path('M252,126 L246,118 L252,110');
    [270, 290, 310].forEach(function (xx) { s += thin(line(xx, 126, xx, 168)); });
    return mirror(7, s);
  }

  /* ---------- 8. Golden Gate Bridge ---------- */
  function goldengate() {
    var s = '', i, p;
    s += line(182, 70, 182, GY) + line(198, 70, 198, GY) + rect(177, 64, 26, 6);
    [100, 140, 180, 220, 250].forEach(function (y) { s += line(182, y, 198, y); });
    [100, 140, 180].forEach(function (y) { s += thin(line(182, y, 198, y + 40) + line(198, y, 182, y + 40)); });
    s += line(40, 268, 320, 268) + line(40, 276, 320, 276) + line(40, 268, 40, GY);
    s += path('M190,70 Q100,190 40,264');
    s += path('M190,70 Q255,226 320,226');
    var sus = '';
    for (i = 1; i <= 10; i++) { p = qp([190, 70], [255, 226], [320, 226], i * 0.095); sus += line(p[0], p[1], p[0], 268); }
    for (i = 1; i <= 8; i++) { p = qp([190, 70], [100, 190], [40, 264], i * 0.12); if (p[1] < 266) sus += line(p[0], p[1], p[0], 268); }
    s += thin(sus);
    return mirror(8, s) + waves();
  }

  /* ---------- 9. Burj Khalifa ---------- */
  function burj() {
    var ys = [340, 300, 250, 210, 170, 135, 105, 80, 60], hw = [46, 42, 36, 30, 24, 18, 12, 7, 4];
    var s = M(320 - hw[0], ys[0]), i, y, t = '';
    for (i = 0; i < 8; i++) s += Lt(320 - hw[i], ys[i + 1]) + Lt(320 - hw[i + 1], ys[i + 1]);
    s = path(s) + line(316, 60, 320, 8) + path('M222,340 L222,322 L274,322');
    for (i = 0; i < 8; i++) {
      for (y = ys[i] - 9; y > ys[i + 1] + 2; y -= 9) t += line(320 - hw[i], y, 320, y);
      t += line(320 - hw[i] * 0.5, ys[i], 320 - hw[i] * 0.5, ys[i + 1]);
    }
    return mirror(9, s + thin(t));
  }

  /* ---------- 10. Christ the Redeemer ---------- */
  function christ() {
    var s = '';
    s += path('M280,340 L286,262 L282,262 L282,252 L320,252');
    s += path('M298,252 L296,196 L304,164 L304,144 L312,138 L312,128');
    s += path('M304,144 L170,150 L166,154 L176,158 L302,164');
    s += path('M320,108 A14,14 0 0 0 320,136');
    s += thin(path('M312,252 L310,176') + path('M304,252 L302,200') + line(286, 290, 320, 290) + line(284, 316, 320, 316));
    return mirror(10, s);
  }

  /* ---------- 11. Angkor Wat ---------- */
  function khmerTower(cx, base, hws, ys, budTop) {
    var L = M(cx - hws[0], base), R = M(cx + hws[0], base), t = '', i;
    for (i = 0; i < hws.length; i++) {
      L += Lt(cx - hws[i], ys[i]); R += Lt(cx + hws[i], ys[i]);
      if (i < hws.length - 1) { L += Lt(cx - hws[i + 1], ys[i]); R += Lt(cx + hws[i + 1], ys[i]); }
      t += line(cx - hws[i], ys[i], cx + hws[i], ys[i]);
    }
    var hl = hws[hws.length - 1], yl = ys[ys.length - 1], cy = budTop + (yl - budTop) * 0.35;
    L += 'Q' + f(cx - hl * 1.3) + ',' + f(cy) + ' ' + f(cx) + ',' + f(budTop);
    R += 'Q' + f(cx + hl * 1.3) + ',' + f(cy) + ' ' + f(cx) + ',' + f(budTop);
    return path(L) + path(R) + thin(t);
  }
  function angkor() {
    var s = '', y, x;
    s += path('M80,340 L80,282 L320,282') + path('M110,282 L110,236 L320,236') + path('M140,236 L140,200 L320,200');
    var t = '';
    for (x = 94; x < 320; x += 14) t += line(x, 296, x, 340);
    for (x = 124; x < 320; x += 14) t += line(x, 248, x, 282);
    for (x = 154; x < 320; x += 14) t += line(x, 208, x, 236);
    s += thin(t);
    s += khmerTower(320, 200, [28, 23, 18, 13, 9], [178, 154, 130, 108, 90], 38);
    s += khmerTower(242, 200, [18, 14, 10, 7], [180, 160, 142, 128], 96);
    s += path('M300,340 L306,200');
    var st = '';
    for (y = 330; y > 206; y -= 14) st += line(300 + (340 - y) * (6 / 140), y, 320, y);
    return mirror(11, s + thin(st));
  }

  /* ---------- 12. Sagrada Família ---------- */
  function spire(x, topY, hb, ht) {
    var by = 250, yc = topY + 34, s, r = '', y, u, hw;
    s = path(M(x - hb, by) + Lt(x - ht, yc) + Lt(x, topY) + Lt(x + ht, yc) + Lt(x + hb, by));
    for (y = yc + 10; y < by - 4; y += 11) { u = (y - yc) / (by - yc); hw = ht + (hb - ht) * u; r += line(x - hw, y, x + hw, y); }
    r += line(x, yc, x, by);
    return s + thin(r) + circle(x, topY - 4, 3);
  }
  function sagrada() {
    var s = path('M100,340 L100,250 L320,250');
    s += path('M240,340 L240,304 Q240,284 254,278 Q268,284 268,304 L268,340');
    s += path('M172,340 L172,304 Q172,284 186,278 Q200,284 200,304 L200,340');
    s += path('M298,340 L298,298 Q298,268 320,258');
    s += spire(134, 110, 14, 7) + spire(174, 92, 14, 7) + spire(214, 92, 14, 7) + spire(254, 110, 14, 7);
    s += spire(320, 38, 24, 11);
    var star = [];
    for (var i = 0; i < 16; i++) { var r = i % 2 ? 4 : 10, a = i * 22.5 * RAD; star.push([320 + r * Math.sin(a), 22 - r * Math.cos(a)]); }
    s += poly(star, true);
    return mirror(12, s);
  }

  /* ---------- 13. Leaning Tower of Pisa ---------- */
  function pisa() {
    var s = '', t = '', i, k, x, yt, yb;
    var tiers = [340, 306, 272, 238, 204, 170, 136, 102];
    s += line(284, GY, 284, 102) + line(356, GY, 356, 102);
    tiers.forEach(function (y) { s += line(284, y, 356, y); });
    for (i = 0; i < 7; i++) {
      yb = tiers[i]; yt = tiers[i + 1] || 102;
      if (i === 0) {
        for (k = 0; k < 7; k++) { x = 284 + k * 72 / 7 + 5; t += arch(x, 340, 4.5, 8); }
      } else {
        for (k = 0; k < 9; k++) { x = 284 + k * 9; t += line(x, yb, x, yt + 8); }
        for (k = 0; k < 8; k++) { x = 284 + k * 9; t += path('M' + f(x) + ',' + f(yt + 8) + ' A4.5,4.5 0 0 1 ' + f(x + 9) + ',' + f(yt + 8)); }
      }
    }
    s += thin(t);
    s += rect(294, 70, 52, 32) + rect(290, 64, 60, 6);
    var w = '';
    for (k = 0; k < 5; k++) w += arch(302 + k * 9, 100, 3, 14);
    s += thin(w);
    var tilt = '<g transform="rotate(4 320 340)">' + s + '</g>';
    tilt += dashed(line(320, 40, 320, 340));
    tilt += '<g class="c"><path d="M320,250 A90,90 0 0 1 326.3,250.2"/></g><text class="x" x="332" y="247">θ</text>';
    return tilt;
  }

  /* ---------- 14. Tower Bridge ---------- */
  function towerbridge() {
    var s = '', i, p, t = '', x;
    s += line(202, GY, 202, 128) + line(258, GY, 258, 128) + path('M202,128 L202,118 L258,118 L258,128');
    s += path('M200,128 L206,100 L212,128') + path('M248,128 L254,100 L260,128') + path('M212,118 L230,66 L248,118') + line(230, 66, 230, 50);
    s += thin(line(202, 128, 258, 128) + line(202, 200, 258, 200) + line(202, 270, 258, 270));
    [186, 250, 310].forEach(function (yb) { t += arch(216, yb, 5, 24) + arch(244, yb, 5, 24); });
    s += thin(t);
    s += line(258, 140, 320, 140) + line(258, 160, 320, 160);
    s += thin(arch(274, 158, 4, 10) + arch(292, 158, 4, 10) + arch(310, 158, 4, 10));
    s += line(258, 290, 320, 290) + line(258, 298, 320, 298) + line(202, 290, 60, 290) + line(202, 298, 60, 298);
    s += path('M202,200 Q110,246 60,288') + line(60, 290, 60, GY);
    for (i = 1; i <= 9; i++) { p = qp([202, 200], [110, 246], [60, 288], i * 0.1); x = p[0]; t += line(x, p[1], x, 290); }
    s += thin(t.slice(0, 0));
    var sus = '';
    for (i = 1; i <= 9; i++) { p = qp([202, 200], [110, 246], [60, 288], i * 0.1); sus += line(p[0], p[1], p[0], 290); }
    s += thin(sus);
    return mirror(14, s) + waves();
  }

  /* ---------- 15. Brandenburg Gate ---------- */
  function horse(x) {
    return path('M' + f(x - 7) + ',108 L' + f(x - 6) + ',92 Q' + f(x - 9) + ',82 ' + f(x - 4) + ',76 L' + f(x - 1) + ',68 Q' + f(x + 2) + ',66 ' + f(x + 4) + ',70 L' + f(x + 5) + ',78 Q' + f(x + 8) + ',86 ' + f(x + 6) + ',92 L' + f(x + 7) + ',108');
  }
  function brandenburg() {
    var s = path('M160,340 L160,326 L320,326'), t = '', x;
    [196, 246, 296].forEach(function (cx) {
      s += rect(cx - 8, 196, 16, 122) + rect(cx - 11, 190, 22, 6) + rect(cx - 10, 318, 20, 8);
      t += line(cx - 3, 196, cx - 3, 318) + line(cx + 3, 196, cx + 3, 318);
    });
    s += line(164, 190, 320, 190) + line(164, 176, 320, 176) + path('M164,190 L164,160 L320,160');
    for (x = 172; x < 320; x += 14) t += line(x, 164, x, 172);
    s += path('M178,160 L178,126 L320,126') + path('M174,126 L174,120 L320,120');
    t += line(220, 126, 220, 160) + line(270, 126, 270, 160);
    s += path('M262,120 L262,108 L320,108') + horse(272) + horse(288);
    s += circle(300, 99, 9) + path('M300,108 L304,86 L320,86');
    s += path('M316,86 L316,62 Q316,52 320,50') + line(320, 86, 320, 44) + circle(320, 40, 6);
    s += path('M314,36 L304,30 L313,43');
    return mirror(15, s + thin(t));
  }

  /* ---------- 16. Petronas Towers ---------- */
  function petronasTower(cx) {
    var ys = [340, 230, 170, 120, 86, 60, 44], hw = [44, 40, 34, 28, 20, 12], i, y, k;
    var L = M(cx - hw[0], ys[0]), R = M(cx + hw[0], ys[0]), t = '';
    for (i = 0; i < 6; i++) {
      L += Lt(cx - hw[i], ys[i + 1]); R += Lt(cx + hw[i], ys[i + 1]);
      if (i < 5) { L += Lt(cx - hw[i + 1], ys[i + 1]); R += Lt(cx + hw[i + 1], ys[i + 1]); }
      for (y = ys[i] - 9; y > ys[i + 1] + 1; y -= 9) t += line(cx - hw[i], y, cx + hw[i], y);
      for (k = 1; k * 11 < hw[i] * 2; k++) t += line(cx - hw[i] + k * 11, ys[i], cx - hw[i] + k * 11, ys[i + 1]);
    }
    var s = path(L) + path(R);
    for (i = 1; i < 6; i++) s += line(cx - hw[i], ys[i], cx + hw[i], ys[i]);
    s += line(cx - 12, 44, cx + 12, 44) + path(M(cx - 5, 44) + Lt(cx, 12) + Lt(cx + 5, 44)) + circle(cx, 16, 3);
    return s + thin(t);
  }
  function petronas() {
    var s = petronasTower(250) + rect(290, 206, 60, 10) + path('M296,216 L320,250 L344,216');
    return mirror(16, s);
  }

  /* ---------- 17. Himeji Castle ---------- */
  function himejiKeep() {
    var s = '', cx = 320;
    s += path('M214,340 Q236,308 262,282 L378,282 Q404,308 426,340');
    var lv = [{ hw: 56, top: 250, bot: 282 }, { hw: 44, top: 200, bot: 228 }, { hw: 34, top: 156, bot: 182 }, { hw: 24, top: 116, bot: 138 }, { hw: 16, top: 84, bot: 98 }];
    var win = [[-36, -12, 12, 36], [-22, 0, 22], [-12, 12], [0], []], t = '';
    lv.forEach(function (l, i) {
      s += rect(cx - l.hw, l.top, l.hw * 2, l.bot - l.top);
      win[i].forEach(function (o) { t += rect(cx + o - 4, l.top + 10, 8, 11); });
      var ew = l.hw + 14, ey = l.top + 4;
      s += path('M' + f(cx - ew - 2) + ',' + f(ey - 10) + ' Q' + f(cx - ew) + ',' + f(ey + 2) + ' ' + f(cx - ew + 14) + ',' + f(ey + 2) + ' L' + f(cx + ew - 14) + ',' + f(ey + 2) + ' Q' + f(cx + ew) + ',' + f(ey + 2) + ' ' + f(cx + ew + 2) + ',' + f(ey - 10));
      if (i + 1 < lv.length) s += poly([[cx - ew + 12, ey + 2], [cx - lv[i + 1].hw, lv[i + 1].bot], [cx + lv[i + 1].hw, lv[i + 1].bot], [cx + ew - 12, ey + 2]]);
    });
    s += thin(t);
    s += path('M' + f(cx - 12) + ',88 L' + f(cx - 12) + ',70 L' + f(cx + 12) + ',70 L' + f(cx + 12) + ',88');
    s += path('M308,70 L305,58 Q308,52 312,58') + path('M332,70 L335,58 Q332,52 328,58') + line(308, 70, 332, 70);
    s += path('M290,254 Q306,238 320,228 Q334,238 350,254');
    s += path('M296,204 L320,186 L344,204');
    s += path('M300,160 Q310,148 320,142 Q330,148 340,160');
    return s;
  }
  function himejiSmall() {
    var s = path('M100,340 Q112,318 124,302 L176,302 Q188,318 200,340') + rect(128, 276, 44, 26);
    s += path('M110,270 Q112,282 122,282 L178,282 Q188,282 190,270') + poly([[120, 282], [132, 262], [168, 262], [180, 282]]);
    s += rect(134, 240, 32, 22) + path('M126,232 Q127,242 134,242 L166,242 Q173,242 174,232') + poly([[130, 242], [140, 224], [160, 224], [170, 242]]);
    s += line(140, 224, 160, 224) + thin(rect(140, 284, 7, 10) + rect(153, 284, 7, 10) + rect(145, 246, 6, 9));
    return s;
  }
  function himeji() {
    return mirror(17, himejiKeep() + himejiSmall());
  }

  /* ---------- 18. CN Tower ---------- */
  function cntower() {
    var s = '';
    s += path('M262,340 Q300,326 308,262 L313,178');
    s += path('M313,178 L296,168 L284,154 L296,140 L320,136');
    s += line(296, 168, 320, 168) + line(284, 154, 320, 154) + line(296, 140, 320, 140);
    s += path('M314,136 L314,96') + path('M314,96 L308,92 L308,84 L314,80 L320,79') + line(308, 88, 320, 88);
    s += line(316, 78, 320, 12) + line(318, 46, 322, 46);
    var t = '', x, y;
    for (x = 292; x < 320; x += 8) t += line(x, 140, x, 168);
    [330, 313, 291, 262].forEach(function (yy, i) { t += line([279, 292, 302, 308][i], yy, 320, yy); });
    for (y = 200; y < 250; y += 18) t += line(313, y, 320, y);
    s += thin(t);
    return mirror(18, s);
  }

  /* ---------- 19. Saint Basil's Cathedral ---------- */
  function onion(cx, by, r) {
    var s = path(M(cx - r, by) + 'C' + f(cx - r * 1.6) + ',' + f(by - r * 0.9) + ' ' + f(cx - r * 0.5) + ',' + f(by - r * 2) + ' ' + f(cx) + ',' + f(by - r * 3) +
      'C' + f(cx + r * 0.5) + ',' + f(by - r * 2) + ' ' + f(cx + r * 1.6) + ',' + f(by - r * 0.9) + ' ' + f(cx + r) + ',' + f(by));
    s += line(cx, by - r * 3, cx, by - r * 3 - 10) + line(cx - 3, by - r * 3 - 7, cx + 3, by - r * 3 - 7);
    s += thin(path(M(cx - r * 0.55, by) + 'C' + f(cx - r * 0.9) + ',' + f(by - r * 0.9) + ' ' + f(cx - r * 0.1) + ',' + f(by - r * 1.7) + ' ' + f(cx) + ',' + f(by - r * 3)) +
      path(M(cx + r * 0.55, by) + 'C' + f(cx + r * 0.9) + ',' + f(by - r * 0.9) + ' ' + f(cx + r * 0.1) + ',' + f(by - r * 1.7) + ' ' + f(cx) + ',' + f(by - r * 3)));
    return s;
  }
  function stbasil() {
    var s = path('M110,340 L110,262 L320,262') + line(104, 268, 320, 268), t = '', x, i;
    for (x = 128; x < 320; x += 24) t += arch(x, 332, 6, 22);
    s += thin(t);
    [[146, 224, 12], [198, 200, 15], [258, 184, 17]].forEach(function (c) {
      s += rect(c[0] - c[2], c[1], c[2] * 2, 262 - c[1]) + thin(arch(c[0], 256, 4, 16)) + onion(c[0], c[1], c[2] * 1.05);
    });
    s += rect(296, 214, 48, 48);
    for (i = 0; i < 6; i++) s += path('M' + (296 + i * 8) + ',214 A4,4 0 0 1 ' + (304 + i * 8) + ',214');
    s += path('M300,210 L320,84 L340,210') + thin(line(310, 212, 316, 100) + line(330, 212, 324, 100) + line(306, 160, 334, 160) + line(312, 120, 328, 120));
    s += onion(320, 88, 7);
    return mirror(19, s);
  }

  /* ---------- 20. Atomium ---------- */
  function tube(p, q, rp, rq) {
    var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len, nx = -uy * 4, ny = ux * 4;
    var a = [p[0] + ux * rp, p[1] + uy * rp], b = [q[0] - ux * rq, q[1] - uy * rq];
    return line(a[0] + nx, a[1] + ny, b[0] + nx, b[1] + ny) + line(a[0] - nx, a[1] - ny, b[0] - nx, b[1] - ny);
  }
  function sphere(c, r) {
    return circle(c[0], c[1], r) + thin(ell(c[0], c[1], r, r * 0.32) + ell(c[0], c[1], r * 0.32, r));
  }
  function atomium() {
    var T = [320, 70], B = [320, 312], Cn = [320, 191], A = [250, 128], Bp = [390, 128], C = [320, 143], D = [250, 250], E = [390, 250], F = [320, 236];
    var s = dashed(tube(T, B, 28, 28));
    [[T, A], [T, Bp], [T, C], [B, D], [B, E], [B, F], [A, D], [A, F], [Bp, E], [Bp, F], [C, D], [C, E]].forEach(function (e) { s += tube(e[0], e[1], 26, 26); });
    [[T, 28], [B, 28], [A, 26], [Bp, 26], [C, 26], [D, 26], [E, 26], [F, 26], [Cn, 30]].forEach(function (c) { s += sphere(c[0], c[1]); });
    return s;
  }

  /* ---------- catalogue ---------- */
  var DEFS = [
    { id: 1, name: 'Eiffel Tower', sym: true, bbox: [220, 18, 420, 340], build: eiffel },
    { id: 2, name: 'Statue of Liberty', bbox: [255, 30, 385, 340], build: liberty },
    { id: 3, name: 'Pyramids of Giza', bbox: [140, 110, 604, 340], build: giza },
    { id: 4, name: 'Sydney Opera House', bbox: [92, 128, 578, 340], build: opera },
    { id: 5, name: 'Colosseum', sym: true, bbox: [120, 78, 520, 340], build: colosseum },
    { id: 6, name: 'Taj Mahal', sym: true, bbox: [162, 60, 478, 340], build: taj },
    { id: 7, name: 'Forbidden City', sym: true, bbox: [110, 110, 530, 340], build: forbidden },
    { id: 8, name: 'Golden Gate Bridge', sym: true, bbox: [40, 64, 600, 340], build: goldengate },
    { id: 9, name: 'Burj Khalifa', sym: true, bbox: [222, 8, 418, 340], build: burj },
    { id: 10, name: 'Christ the Redeemer', sym: true, bbox: [166, 108, 474, 340], build: christ },
    { id: 11, name: 'Angkor Wat', sym: true, bbox: [80, 38, 560, 340], build: angkor },
    { id: 12, name: 'Sagrada Família', sym: true, bbox: [100, 12, 540, 340], build: sagrada },
    { id: 13, name: 'Leaning Tower of Pisa', bbox: [276, 40, 384, 340], build: pisa },
    { id: 14, name: 'Tower Bridge', sym: true, bbox: [60, 50, 580, 340], build: towerbridge },
    { id: 15, name: 'Brandenburg Gate', sym: true, bbox: [160, 30, 480, 340], build: brandenburg },
    { id: 16, name: 'Petronas Towers', sym: true, bbox: [206, 12, 434, 340], build: petronas },
    { id: 17, name: 'Himeji Castle', sym: true, bbox: [100, 52, 540, 340], build: himeji },
    { id: 18, name: 'CN Tower', sym: true, bbox: [262, 12, 378, 340], build: cntower },
    { id: 19, name: "Saint Basil's Cathedral", sym: true, bbox: [104, 50, 536, 340], build: stbasil },
    { id: 20, name: 'Atomium', bbox: [224, 42, 416, 340], build: atomium }
  ];

  var CSS = '.w{fill:none;stroke:#fff;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}' +
    '.t{stroke-width:.8;stroke-opacity:.75}.d{stroke-dasharray:5 4;stroke-opacity:.7;stroke-width:1}' +
    '.c{fill:none;stroke:#4DD0E1;stroke-width:1;stroke-linecap:round}' +
    '.x{font:600 9px "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;fill:#B0BEC5;stroke:none;letter-spacing:.08em}' +
    '.k{fill:#4DD0E1;stroke:none}' +
    '.a{stroke-dasharray:1;animation:bpd 2.4s ease-out both}' +
    '@keyframes bpd{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}' +
    '@media (prefers-reduced-motion:reduce){.a{animation:none;stroke-dasharray:none}}';

  // Adds the draw-on animation to solid shapes (never to dashed groups).
  function inject(str) {
    return str.split(/(<g class="d">[\s\S]*?<\/g>)/).map(function (seg, i) {
      return i % 2 ? seg : seg.replace(/<(path|line|circle|ellipse|rect|polyline|polygon) /g, '<$1 class="a" pathLength="1" ');
    }).join('');
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function arrow(x, y, dir, horizontal) {
    var p = horizontal ? [[x, y], [x + dir * 8, y - 3], [x + dir * 8, y + 3]] : [[x, y], [x - 3, y + dir * 8], [x + 3, y + dir * 8]];
    return '<polygon class="k" points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>';
  }
  function dims(b) {
    var x1 = b[0], y1 = b[1], x2 = b[2], y2 = b[3], right = x2 + 26 <= 616;
    var dx = right ? x2 + 26 : x1 - 26, ex = right ? x2 + 4 : x1 - 4, ov = right ? dx + 6 : dx - 6, ym = 354;
    var s = '<g class="c">' + line(ex, y1, ov, y1) + line(ex, y2, ov, y2) + line(dx, y1 + 6, dx, y2 - 6) +
      line(x1, ym - 4, x1, ym + 4) + line(x2, ym - 4, x2, ym + 4) + line(x1 + 8, ym, x2 - 8, ym) + '</g>';
    s += arrow(dx, y1, 1, false) + arrow(dx, y2, -1, false) + arrow(x1, ym, 1, true) + arrow(x2, ym, -1, true);
    s += '<text class="x" x="' + (right ? dx + 7 : dx - 14) + '" y="' + f((y1 + y2) / 2) + '">H</text>';
    s += '<text class="x" x="' + f((x1 + x2) / 2 - 3) + '" y="350">W</text>';
    return s;
  }
  function frame(d) {
    var n = d.id, b = d.bbox, no = (n < 10 ? '0' : '') + n;
    var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="' + esc('Blueprint wireframe of ' + d.name) + '">';
    o += '<style>' + CSS + '</style>';
    o += '<defs><pattern id="gs' + n + '" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" stroke-opacity=".07"/></pattern>' +
      '<pattern id="gl' + n + '" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#fff" stroke-opacity=".15"/></pattern></defs>';
    o += '<rect width="640" height="400" fill="#0F1E3D"/><rect width="640" height="400" fill="url(#gs' + n + ')"/><rect width="640" height="400" fill="url(#gl' + n + ')"/>';
    o += '<g class="w t"><rect x="6" y="6" width="628" height="388"/></g>';
    var hatch = '';
    for (var x = 20; x < 626; x += 12) hatch += line(x, GY, x - 8, GY + 8);
    o += '<g class="w"><path d="M14,340 L626,340"/><g class="t">' + hatch + '</g></g>';
    if (d.sym) o += '<g class="c"><path d="M320,' + (b[1] - 14) + ' L320,' + (GY + 6) + '" stroke-dasharray="9 3 2 3"/></g>';
    o += '<g class="w">' + inject(d.build()) + '</g>';
    o += dims(b);
    o += '<g class="w t"><rect x="372" y="362" width="254" height="26"/></g>';
    o += '<text class="x" x="380" y="379">No.' + no + ' · ' + esc(d.name.toUpperCase()) + '</text>';
    o += '<text class="x" x="14" y="379">ELEVATION · NOT TO SCALE</text>';
    return o + '</svg>';
  }

  window.BLUEPRINTS = {};
  DEFS.forEach(function (d) { window.BLUEPRINTS[d.id] = frame(d); });
})();
