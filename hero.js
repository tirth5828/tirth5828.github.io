/* The split face. Left of the seam: contour lines (research). Right: UI tiles (production).
   Drawn from a quantised darkness grid (face.json: figure mask + 8 levels). Decorative only:
   everything it stands for is a real link in the hero markup. */
(function () {
  'use strict';

  var canvas = document.getElementById('face');
  if (!canvas || !canvas.getContext || !window.fetch) return;
  var wrap = canvas.parentElement;
  var hero = document.getElementById('top');
  var ctx = canvas.getContext('2d');
  var root = document.documentElement;

  var LV = [0.22, 0.38, 0.54, 0.7, 0.86];
  var TILE = 5;                 // grid cells per production tile
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqTouch = window.matchMedia('(hover: none)');

  var GW, GH, faceCx;           // grid size, face centre (grid x)
  var SEGS = [];                // per level: Float32Array [x1,y1,x2,y2,...] sorted by mid x
  var MIDS = [];                // per level: Float32Array of segment mid x
  var TILES;                    // Float32Array [cx, cy, d, ...]
  // How the production half is drawn: 'code' (minimap, live), 'circuit', 'layout' or 'tiles'.
  // All four are kept; switch with data-prod on the canvas in index.html.
  var PROD = canvas.getAttribute('data-prod') || 'code';
  var CIRC, PADS, CODE, BOXES;
  var W = 0, H = 0, s = 1, k = 1, dpr = 1;
  var C = {};
  var seam = 0, t = 0, last = 0;
  var mouse = { x: -1e4, y: -1e4, inside: false };
  var ripples = [];             // {x, y, age}
  var lift = null;              // {x, y, age} a soft highlight on the tile side
  var visible = true, raf = 0;

  fetch(canvas.getAttribute('data-src')).then(function (r) { return r.json(); }).then(init)
    .catch(function () { wrap.classList.add('face-off'); });

  function init(F) {
    GW = F.w; GH = F.h;
    var top = (F.levels || 8) - 1;
    var D = new Float32Array(GW * GH), M = new Uint8Array(GW * GH);
    for (var y = 0; y < GH; y++) {
      var row = F.rows[y];
      for (var x = 0; x < GW; x++) {
        var c = row.charCodeAt(x);
        if (c !== 95) { M[y * GW + x] = 1; D[y * GW + x] = (c - 48) / top; }
      }
    }
    var B = blur(D);
    buildContours(B, M);
    if (PROD === 'circuit') buildCircuit();
    else if (PROD === 'code') buildCode(B, M);
    else if (PROD === 'layout') buildLayout(B, M);
    else buildTiles(B, M);
    // the face's own centre line: mean x of figure cells in the head (top 45% of rows)
    var sx = 0, n = 0;
    for (y = 0; y < Math.floor(GH * 0.45); y++) for (x = 0; x < GW; x++) if (M[y * GW + x]) { sx += x; n++; }
    faceCx = n ? sx / n : GW / 2;

    readColours();
    resize();
    seam = faceCx * s;
    bind();
    wrap.classList.add('face-on');
    kick();
  }

  // separable [1 4 6 4 1] blur: smooths the 8-level steps back into flowing contours
  function blur(src) {
    var out = new Float32Array(src.length), tmp = new Float32Array(src.length);
    var w = [1, 4, 6, 4, 1], x, y, i, acc, xx, yy;
    for (y = 0; y < GH; y++) for (x = 0; x < GW; x++) {
      acc = 0;
      for (i = -2; i <= 2; i++) { xx = x + i; if (xx >= 0 && xx < GW) acc += w[i + 2] * src[y * GW + xx]; }
      tmp[y * GW + x] = acc / 16;
    }
    for (y = 0; y < GH; y++) for (x = 0; x < GW; x++) {
      acc = 0;
      for (i = -2; i <= 2; i++) { yy = y + i; if (yy >= 0 && yy < GH) acc += w[i + 2] * tmp[yy * GW + x]; }
      out[y * GW + x] = acc / 16;
    }
    return out;
  }

  // marching squares, one segment list per level
  function buildContours(B, M) {
    function f(x, y) { var i = y * GW + x; return M[i] ? B[i] : 0; }
    for (var li = 0; li < LV.length; li++) {
      var lv = LV[li], segs = [];
      for (var y = 0; y < GH - 1; y++) for (var x = 0; x < GW - 1; x++) {
        var a = f(x, y), b = f(x + 1, y), c = f(x + 1, y + 1), d = f(x, y + 1);
        var idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        var T = [x + (lv - a) / (b - a), y], R = [x + 1, y + (lv - b) / (c - b)],
            Bo = [x + (lv - d) / (c - d), y + 1], L = [x, y + (lv - a) / (d - a)];
        var E = CASES[idx](T, R, Bo, L);
        for (var e = 0; e < E.length; e++) segs.push(E[e][0][0], E[e][0][1], E[e][1][0], E[e][1][1]);
      }
      // sort by mid x so the seam is a single cut-off index per frame
      var n = segs.length / 4, order = new Array(n);
      for (var i = 0; i < n; i++) order[i] = i;
      order.sort(function (p, q) { return (segs[p * 4] + segs[p * 4 + 2]) - (segs[q * 4] + segs[q * 4 + 2]); });
      var S = new Float32Array(segs.length), Mx = new Float32Array(n);
      for (i = 0; i < n; i++) {
        var o = order[i] * 4;
        S[i * 4] = segs[o]; S[i * 4 + 1] = segs[o + 1]; S[i * 4 + 2] = segs[o + 2]; S[i * 4 + 3] = segs[o + 3];
        Mx[i] = (segs[o] + segs[o + 2]) / 2;
      }
      SEGS.push(S); MIDS.push(Mx);
    }
  }
  var CASES = {
    1: function (T, R, B, L) { return [[L, B]]; },  2: function (T, R, B, L) { return [[B, R]]; },
    3: function (T, R, B, L) { return [[L, R]]; },  4: function (T, R, B, L) { return [[T, R]]; },
    5: function (T, R, B, L) { return [[L, T], [B, R]]; }, 6: function (T, R, B, L) { return [[T, B]]; },
    7: function (T, R, B, L) { return [[L, T]]; },  8: function (T, R, B, L) { return [[L, T]]; },
    9: function (T, R, B, L) { return [[T, B]]; },  10: function (T, R, B, L) { return [[L, B], [T, R]]; },
    11: function (T, R, B, L) { return [[T, R]]; }, 12: function (T, R, B, L) { return [[L, R]]; },
    13: function (T, R, B, L) { return [[B, R]]; }, 14: function (T, R, B, L) { return [[L, B]]; }
  };

  function buildTiles(B, M) {
    var out = [];
    for (var by = 0; by + TILE <= GH; by += TILE) for (var bx = 0; bx + TILE <= GW; bx += TILE) {
      var cnt = 0, sum = 0;
      for (var y = by; y < by + TILE; y++) for (var x = bx; x < bx + TILE; x++) {
        var i = y * GW + x; if (M[i]) { cnt++; sum += B[i]; }
      }
      if (cnt < TILE * TILE * 0.5) continue;
      var d = sum / cnt;
      if (d < 0.06) continue;
      out.push(bx + TILE / 2, by + TILE / 2, d);
    }
    TILES = new Float32Array(out);
  }

  /* ---- production option: circuit. The same contours, re-routed like PCB traces ---- */
  function buildCircuit() {
    var segs = [], pads = [], LAT = 2;
    for (var li = 0; li < LV.length; li++) {
      var lines = chain(SEGS[li]);
      for (var p = 0; p < lines.length; p++) {
        var pts = simplify(lines[p], 1.1);
        // snap to a lattice so traces line up like a board
        var snapped = [];
        for (var i = 0; i < pts.length; i++) {
          var q = [Math.round(pts[i][0] / LAT) * LAT, Math.round(pts[i][1] / LAT) * LAT];
          var prev = snapped[snapped.length - 1];
          if (!prev || prev[0] !== q[0] || prev[1] !== q[1]) snapped.push(q);
        }
        if (snapped.length < 3) continue;
        var route = [], len = 0;
        for (i = 1; i < snapped.length; i++) {
          var a = snapped[i - 1], b = snapped[i], dx = b[0] - a[0], dy = b[1] - a[1];
          var dd = Math.min(Math.abs(dx), Math.abs(dy));
          // octilinear route: a 45-degree run, then a straight run
          var mx = a[0] + Math.sign(dx) * dd, my = a[1] + Math.sign(dy) * dd;
          if (dd) route.push(a[0], a[1], mx, my, li);
          if (mx !== b[0] || my !== b[1]) route.push(mx, my, b[0], b[1], li);
          len += Math.abs(dx) + Math.abs(dy);
        }
        if (len < 10) continue;          // drop specks
        for (i = 0; i < route.length; i++) segs.push(route[i]);
        pads.push(snapped[0][0], snapped[0][1], li);
        for (i = 6; i < snapped.length - 1; i += 7) pads.push(snapped[i][0], snapped[i][1], li);
      }
    }
    CIRC = new Float32Array(segs);
    PADS = new Float32Array(pads);
  }

  // join marching-squares segments that share endpoints into polylines
  function chain(S) {
    var n = S.length / 4, used = new Uint8Array(n), ends = {};
    function key(x, y) { return Math.round(x * 1000) + ',' + Math.round(y * 1000); }
    for (var i = 0; i < n; i++) {
      var k1 = key(S[i * 4], S[i * 4 + 1]), k2 = key(S[i * 4 + 2], S[i * 4 + 3]);
      (ends[k1] = ends[k1] || []).push(i); (ends[k2] = ends[k2] || []).push(i);
    }
    function other(i, x, y) {
      var a = key(S[i * 4], S[i * 4 + 1]);
      return a === key(x, y) ? [S[i * 4 + 2], S[i * 4 + 3]] : [S[i * 4], S[i * 4 + 1]];
    }
    var out = [];
    for (i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = 1;
      var line = [[S[i * 4], S[i * 4 + 1]], [S[i * 4 + 2], S[i * 4 + 3]]];
      for (var dir = 0; dir < 2; dir++) {
        while (true) {
          var tip = line[line.length - 1], list = ends[key(tip[0], tip[1])] || [], next = -1;
          for (var j = 0; j < list.length; j++) if (!used[list[j]]) { next = list[j]; break; }
          if (next < 0) break;
          used[next] = 1;
          line.push(other(next, tip[0], tip[1]));
        }
        line.reverse();
      }
      out.push(line);
    }
    return out;
  }

  // Douglas-Peucker
  function simplify(pts, tol) {
    if (pts.length < 3) return pts;
    var keep = new Uint8Array(pts.length), stack = [[0, pts.length - 1]];
    keep[0] = keep[pts.length - 1] = 1;
    while (stack.length) {
      var r = stack.pop(), a = pts[r[0]], b = pts[r[1]], best = -1, bd = tol;
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
      for (var i = r[0] + 1; i < r[1]; i++) {
        // closed loops start and end on the same point: fall back to distance from that point
        var d = L > 1e-6 ? Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L
                         : Math.sqrt((pts[i][0] - a[0]) * (pts[i][0] - a[0]) + (pts[i][1] - a[1]) * (pts[i][1] - a[1]));
        if (d > bd) { bd = d; best = i; }
      }
      if (best > 0) { keep[best] = 1; stack.push([r[0], best], [best, r[1]]); }
    }
    var out = [];
    for (i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
    return out;
  }

  /* ---- production option: code minimap. Rows of tokens whose weight follows the face ---- */
  function buildCode(B, M) {
    var out = [], ROW = 3, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var y0 = 0; y0 + ROW <= GH; y0 += ROW) {
      var yc = y0 + ROW / 2, x = 0;
      var dk = function (x) {
        var sum = 0, m = 0;
        for (var y = y0; y < y0 + ROW; y++) { var i = y * GW + x; if (M[i]) { sum += B[i]; m++; } }
        return m >= 2 ? sum / m : -1;
      };
      while (x < GW) {
        var d = dk(x);
        if (d < 0.05) { x++; continue; }
        var want = 2 + Math.floor(rnd() * 8), x0 = x, acc = 0, n = 0;
        while (x < GW && n < want) { var v = dk(x); if (v < 0.05) break; acc += v; n++; x++; }
        if (n >= 2) {
          var kw = rnd() < 0.1 ? 1 : 0, r = rnd();
          var syn = kw ? 0 : r < 0.25 ? 1 : r < 0.5 ? 2 : r < 0.68 ? 3 : r < 0.82 ? 4 : 5;
          out.push(x0, x, yc, acc / n, kw, syn);
        }
        x += 1 + (rnd() < 0.3 ? 1 : 0);
      }
    }
    CODE = new Float32Array(out);
  }

  /* ---- production option: component layout. A quadtree of UI panels ---- */
  function buildLayout(B, M) {
    // summed-area tables for mask count, darkness sum, darkness squared
    var W1 = GW + 1, SM = new Float64Array(W1 * (GH + 1)), SD = new Float64Array(W1 * (GH + 1)), SQ = new Float64Array(W1 * (GH + 1));
    for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) {
      var i = y * GW + x, m = M[i], d = m ? B[i] : 0, o = (y + 1) * W1 + x + 1;
      SM[o] = m + SM[o - 1] + SM[o - W1] - SM[o - W1 - 1];
      SD[o] = d + SD[o - 1] + SD[o - W1] - SD[o - W1 - 1];
      SQ[o] = d * d + SQ[o - 1] + SQ[o - W1] - SQ[o - W1 - 1];
    }
    function sum(T, x0, y0, x1, y1) { return T[y1 * W1 + x1] - T[y0 * W1 + x1] - T[y1 * W1 + x0] + T[y0 * W1 + x0]; }
    var out = [];
    function q(x0, y0, sz) {
      var x1 = Math.min(GW, x0 + sz), y1 = Math.min(GH, y0 + sz);
      if (x0 >= GW || y0 >= GH) return;
      var area = (x1 - x0) * (y1 - y0), m = sum(SM, x0, y0, x1, y1);
      if (m === 0) return;
      var mean = sum(SD, x0, y0, x1, y1) / m, v = sum(SQ, x0, y0, x1, y1) / m - mean * mean;
      var partial = m < area;
      if (sz > 2 && ((partial && sz > 4) || v > 0.0035 * (sz > 8 ? 1 : 1.6) || (sz > 16))) {
        var h = sz / 2; q(x0, y0, h); q(x0 + h, y0, h); q(x0, y0 + h, h); q(x0 + h, y0 + h, h); return;
      }
      if (m / area < 0.6) return;
      out.push(x0, y0, sz, mean);
    }
    for (var by = 0; by < GH; by += 32) for (var bx = 0; bx < GW; bx += 32) q(bx, by, 32);
    BOXES = new Float32Array(out);
  }

  function readColours() {
    var cs = getComputedStyle(root);
    C.ink = cs.getPropertyValue('--ink').trim() || '#1b2433';
    C.res = cs.getPropertyValue('--res').trim() || '#0e7c86';
    C.prod = cs.getPropertyValue('--prod').trim() || '#d9480f';
    C.seam = cs.getPropertyValue('--seam').trim() || 'rgba(27,36,51,.28)';
    C.ground = cs.getPropertyValue('--ground').trim() || '#f6f4ef';
    C.syn = [C.prod, C.res];
    ['--syn-fn', '--syn-type', '--syn-num'].forEach(function (v, i) {
      C.syn.push(cs.getPropertyValue(v).trim() || ['#2f6fd6', '#7a4fc4', '#c4880c'][i]);
    });
    C.syn.push(C.ink);
  }

  function resize() {
    var cssW = wrap.clientWidth;
    if (!cssW || !GW) return;
    var cssH = Math.round(cssW * GH / GW);
    var oldW = W;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cssW; H = cssH; s = W / GW; k = Math.max(0.8, Math.min(1.6, W / 360));
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.height = H + 'px';
    if (oldW) seam = seam * (W / oldW);
  }

  function centre() { return faceCx * s; }
  function reduce() { return mqReduce.matches; }
  function touch() { return mqTouch.matches; }

  function target() {
    var c = centre();
    if (reduce()) return c;
    if (mouse.inside) return clamp(c + (mouse.x - c) * 0.45, W * 0.12, W * 0.88);
    if (touch()) return c + Math.sin(t * 0.45) * W * 0.13;
    return c;
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ripple displacement for a contour vertex at (x, y), in CSS px
  function disp(x, y, out) {
    var dx = 0, dy = 0, i, ddx, ddy, dist, a;
    if (mouse.inside) {
      ddx = x - mouse.x; ddy = y - mouse.y; dist = Math.sqrt(ddx * ddx + ddy * ddy) + 0.01;
      var R = 90 * k;
      if (dist < R) { a = 5 * k * (1 - dist / R) * Math.sin(t * 6 - dist / (7 * k)); dx += ddx / dist * a; dy += ddy / dist * a; }
    }
    for (i = 0; i < ripples.length; i++) {
      var r = ripples[i], ring = r.age * 150 * k;
      ddx = x - r.x; ddy = y - r.y; dist = Math.sqrt(ddx * ddx + ddy * ddy) + 0.01;
      var off = dist - ring;
      if (off > -40 * k && off < 40 * k) {
        a = 6 * k * (1 - r.age / 1.8) * Math.exp(-(off * off) / (2 * 15 * 15 * k * k)) * Math.sin(off / (5 * k));
        dx += ddx / dist * a; dy += ddy / dist * a;
      }
    }
    out[0] = x + dx; out[1] = y + dy;
  }

  var P = [0, 0], Q = [0, 0];
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var moving = mouse.inside || ripples.length;
    var cut = seam / s;

    // research: contours left of the seam
    ctx.lineWidth = Math.max(0.8, 0.9 * k);
    ctx.lineJoin = 'round';
    for (var li = 0; li < LV.length; li++) {
      var S = SEGS[li], Mx = MIDS[li], lv = LV[li];
      ctx.strokeStyle = lv > 0.8 ? C.prod : C.res;
      ctx.globalAlpha = 0.35 + lv * 0.6;
      ctx.beginPath();
      for (var i = 0, n = Mx.length; i < n && Mx[i] < cut; i++) {
        var x1 = (S[i * 4] + 0.5) * s, y1 = (S[i * 4 + 1] + 0.5) * s,
            x2 = (S[i * 4 + 2] + 0.5) * s, y2 = (S[i * 4 + 3] + 0.5) * s;
        if (moving) { disp(x1, y1, P); disp(x2, y2, Q); ctx.moveTo(P[0], P[1]); ctx.lineTo(Q[0], Q[1]); }
        else { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
      }
      ctx.stroke();
    }

    // production: right of the seam
    var R = 60 * k, hx = -1e4, hy = -1e4, hr = 0;
    if (mouse.inside) { hx = mouse.x; hy = mouse.y; hr = R; }
    else if (lift) { hx = lift.x; hy = lift.y; hr = R * 1.4 * Math.sin(Math.min(1, lift.age / 1.6) * Math.PI); }
    var near = function (px, py) {
      if (hr <= 0) return 0;
      var ex = px - hx, ey = py - hy, dd = Math.sqrt(ex * ex + ey * ey);
      return dd < hr ? 1 - dd / hr : 0;
    };
    if (PROD === 'tiles') drawTiles(near);
    else {
      ctx.save(); ctx.beginPath(); ctx.rect(seam, 0, W - seam, H); ctx.clip();
      if (PROD === 'circuit') drawCircuit(near);
      else if (PROD === 'code') drawCode(near);
      else if (PROD === 'layout') drawLayout(near);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // the seam
    ctx.strokeStyle = C.seam; ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(seam, 4); ctx.lineTo(seam, H - 4); ctx.stroke();
    ctx.setLineDash([]);
  }

  function rr(x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
    else ctx.fillRect(x, y, w, h);
  }

  function drawTiles(near) {
    var cell = TILE * s;
    for (var j = 0, m = TILES.length; j < m; j += 3) {
      var cx = (TILES[j] + 0.5) * s;
      if (cx < seam) continue;
      var cy = (TILES[j + 1] + 0.5) * s, d = TILES[j + 2], n = near(cx, cy);
      var sz = cell * (0.2 + 0.72 * d) * (1 + 0.6 * n), hot = n > 0.05;
      ctx.fillStyle = hot ? C.prod : C.ink;
      ctx.globalAlpha = hot ? 0.55 + 0.45 * n : 0.22 + 0.72 * d;
      rr(cx - sz / 2, cy - sz / 2 - n * 3 * k, sz, sz, Math.min(2.5 * k, sz / 3));
    }
  }

  function drawCircuit(near) {
    var cut = seam / s - 2, hot = [], li, j, m;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (li = 0; li < LV.length; li++) {
      ctx.strokeStyle = C.ink;
      ctx.globalAlpha = 0.28 + LV[li] * 0.62;
      ctx.lineWidth = (0.75 + li * 0.18) * k;
      ctx.beginPath();
      for (j = 0, m = CIRC.length; j < m; j += 5) {
        if (CIRC[j + 4] !== li) continue;
        if (CIRC[j] < cut && CIRC[j + 2] < cut) continue;
        var x1 = (CIRC[j] + 0.5) * s, y1 = (CIRC[j + 1] + 0.5) * s, x2 = (CIRC[j + 2] + 0.5) * s, y2 = (CIRC[j + 3] + 0.5) * s;
        var n = near((x1 + x2) / 2, (y1 + y2) / 2);
        if (n > 0.05) { hot.push(x1, y1, x2, y2, n, li); continue; }
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    }
    // current flows near the cursor
    ctx.strokeStyle = C.prod;
    for (j = 0; j < hot.length; j += 6) {
      ctx.globalAlpha = 0.5 + 0.5 * hot[j + 4];
      ctx.lineWidth = (1.1 + hot[j + 5] * 0.18 + hot[j + 4]) * k;
      ctx.beginPath(); ctx.moveTo(hot[j], hot[j + 1]); ctx.lineTo(hot[j + 2], hot[j + 3]); ctx.stroke();
    }
    // pads
    for (j = 0, m = PADS.length; j < m; j += 3) {
      if (PADS[j] < cut) continue;
      var px = (PADS[j] + 0.5) * s, py = (PADS[j + 1] + 0.5) * s, pn = near(px, py), r = (1.5 + PADS[j + 2] * 0.15) * k;
      ctx.globalAlpha = 1;
      ctx.fillStyle = pn > 0.05 ? C.prod : C.ground;
      ctx.beginPath(); ctx.arc(px, py, r + pn * k, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = pn > 0.05 ? C.prod : C.ink; ctx.globalAlpha = 0.85; ctx.lineWidth = 0.9 * k; ctx.stroke();
    }
  }

  function drawCode(near) {
    var cut = seam / s - 10, row = 3 * s;
    for (var j = 0, m = CODE.length; j < m; j += 6) {
      if (CODE[j + 1] < cut) continue;
      var x0 = CODE[j] * s, x1 = CODE[j + 1] * s - 0.25 * s, y = (CODE[j + 2] + 0.5) * s, d = CODE[j + 3];
      var n = near((x0 + x1) / 2, y), hot = n > 0.05;
      var th = row * (0.32 + 0.42 * d);
      // near the cursor the minimap lights up in syntax colours
      ctx.fillStyle = hot ? C.syn[CODE[j + 5]] : CODE[j + 4] ? C.prod : C.ink;
      ctx.globalAlpha = hot ? 0.6 + 0.4 * n : CODE[j + 4] ? 0.55 + 0.4 * d : 0.16 + 0.78 * d;
      rr(x0, y - th / 2 - n * 2 * k, Math.max(1, x1 - x0), th, th / 2);
    }
  }

  function drawLayout(near) {
    var cut = seam / s - 32, g = 0.55;
    ctx.lineWidth = 0.8;
    for (var j = 0, m = BOXES.length; j < m; j += 4) {
      var gx = BOXES[j], sz = BOXES[j + 2];
      if (gx + sz < cut) continue;
      var x = gx * s + g, y = BOXES[j + 1] * s + g, w = sz * s - 2 * g, d = BOXES[j + 3];
      var n = near(x + w / 2, y + w / 2), hot = n > 0.05, r = Math.min(3 * k, w / 4);
      y -= n * 2.5 * k;
      ctx.fillStyle = hot ? C.prod : C.ink;
      ctx.globalAlpha = hot ? 0.35 + 0.6 * n : 0.05 + 0.85 * Math.pow(d, 1.3);
      rr(x, y, w, w, r);
      if (sz >= 8 && !hot) {
        ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.3;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x + 0.4, y + 0.4, w - 0.8, w - 0.8, r); ctx.stroke(); }
        else ctx.strokeRect(x + 0.4, y + 0.4, w - 0.8, w - 0.8);
      }
    }
  }

  function animating() {
    if (reduce()) return false;
    return mouse.inside || ripples.length > 0 || lift !== null || touch() || Math.abs(target() - seam) > 0.3;
  }

  function frame(now) {
    raf = 0;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    t += dt;
    if (reduce()) { seam = centre(); }
    else {
      seam += (target() - seam) * (1 - Math.pow(0.92, dt * 60));
      for (var i = ripples.length - 1; i >= 0; i--) { ripples[i].age += dt; if (ripples[i].age > 1.8) ripples.splice(i, 1); }
      if (lift) { lift.age += dt; if (lift.age > 1.6) lift = null; }
    }
    draw();
    if (visible && !document.hidden && animating()) raf = requestAnimationFrame(frame);
    else last = 0;
  }

  function kick() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  function local(e) {
    var r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  }

  function bind() {
    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduce()) return;
      var p = local(e); mouse.x = p[0]; mouse.y = p[1]; mouse.inside = true; kick();
    });
    canvas.addEventListener('pointerleave', function () { mouse.inside = false; mouse.x = mouse.y = -1e4; kick(); });
    canvas.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || reduce()) return;
      var p = local(e); ripples.push({ x: p[0], y: p[1], age: 0 });
      lift = { x: p[0], y: p[1], age: 0 };
      kick();
    });

    // hovering a formula sends a ripple through the contour half; a project card lights the tile half
    var items = hero ? hero.querySelectorAll('[data-pulse]') : [];
    Array.prototype.forEach.call(items, function (el) {
      function go() {
        if (reduce() || mouse.inside || !W) return;
        var side = el.getAttribute('data-pulse');
        var row = parseFloat(el.getAttribute('data-row')) || 0.4;
        var c = centre();
        if (side === 'res') ripples.push({ x: c * 0.55, y: H * row, age: 0 });
        else lift = { x: c + (W - c) * 0.45, y: H * row, age: 0 };
        kick();
      }
      el.addEventListener('mouseenter', go);
      el.addEventListener('focusin', go);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(canvas);
    }
    document.addEventListener('visibilitychange', kick);

    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { resize(); draw(); kick(); }, 80);
    });
    function restyle() { readColours(); draw(); kick(); }
    new MutationObserver(restyle).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (mqDark.addEventListener) mqDark.addEventListener('change', restyle);
    if (mqReduce.addEventListener) mqReduce.addEventListener('change', function () { draw(); kick(); });
  }
})();
