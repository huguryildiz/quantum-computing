/* ==========================================================================
   web/fig.js — Figure 1 on the cover page, drawn from the scroll position.

   One qubit, three gates, and the smallest complete measurement in the course:

       |0> --[H]--[P(phi)]--[H]--  measure       p(0) = cos^2(phi/2)

   It is section 0.5 of the course, a phase turned into a probability, in
   three steps. First, the state after the first Hadamard and the phase gate:
   the probability of reading zero there is one half whatever the phase is, so
   the curve is flat. Second, the second Hadamard brings the two amplitudes
   into the same outcome, and the flat line bends into the fringe
   cos^2(phi/2). Third, a run of N shots at the working point estimates that
   probability, and the two bars close on the exact value as N grows.

   The drawing is a pure function of how far the reader has scrolled through
   #track, so it never runs on its own and needs no reduced-motion branch. The
   shots are one fixed pseudo-random sequence, so the same scroll position
   always shows the same counts. index.html styles the canvas with CSS custom
   properties (--cyan, --amber, --violet, --fig-axis, --fig-text) and data
   attributes (data-pad="L,R,T,B", data-glow), and receives the state through
   window.onFig(state) to update the caption and the readout.
   ========================================================================== */
(function () {
  var cv = document.getElementById('plot'), ctx = cv.getContext('2d');
  var track = document.getElementById('track'), fig = document.getElementById('fig');
  var PHI_MAX = 4 * Math.PI;   // two full fringes across the plot
  var NMAX = 400;              // shots in the finished run
  var W = 0, H = 0, dpr = 1, C = {};
  var pad = (cv.dataset.pad || '44,18,20,36').split(',').map(Number);
  var L = pad[0], R = pad[1], T = pad[2], B = pad[3];
  var GLOW = cv.hasAttribute('data-glow');

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(v) { return v * v * (3 - 2 * v); }
  function css(n) { return getComputedStyle(cv).getPropertyValue(n).trim(); }
  function p0(phi) { var c = Math.cos(phi / 2); return c * c; }

  /* One fixed sequence of uniform numbers (a linear congruential generator
     with a fixed seed). Shot i reads zero when u_i < p, so the first n shots
     at any probability are a genuine binomial sample and the count only ever
     moves by the shots added. */
  var U = (function () {
    var s = 20260925, out = new Float64Array(NMAX);
    for (var i = 0; i < NMAX; i++) { s = (1103515245 * s + 12345) % 2147483648; out[i] = s / 2147483648; }
    return out;
  })();
  function zeros(p, n) { var k = 0; for (var i = 0; i < n; i++) if (U[i] < p) k++; return k; }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    C = { cyan: css('--cyan'), amber: css('--amber'), violet: css('--violet'),
          axis: css('--fig-axis'), text: css('--fig-text') };
  }
  function progress() {
    var r = track.getBoundingClientRect();
    var st = parseFloat(getComputedStyle(fig).top) || 0;
    var span = r.height - fig.offsetHeight;
    return span > 0 ? clamp((st - r.top) / span) : 0;
  }

  /* the plot takes the upper part of the canvas, the two count bars the rest */
  var BARS = 78;
  function fx(phi) { return L + (phi / PHI_MAX) * (W - L - R); }
  var TOP = 1.1;                                   // the data area runs to p = 1.1
  function fy(p) { return T + (TOP - p) / TOP * (H - T - B - BARS); }

  function curve(fn, upto, color, width, alpha, dash, glow) {
    var n = Math.max(240, Math.round(W * 1.5));
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
    if (glow && GLOW) { ctx.shadowColor = color; ctx.shadowBlur = 10; }
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var phi = (i / n) * upto, y = fy(fn(phi));
      i ? ctx.lineTo(fx(phi), y) : ctx.moveTo(fx(phi), y);
    }
    ctx.stroke(); ctx.restore();
  }
  function label(txt, x, y, align, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color || C.text; ctx.textAlign = align || 'left';
    ctx.font = 'italic 15px "Iowan Old Style", Palatino, Georgia, serif'; ctx.fillText(txt, x, y); ctx.restore();
  }
  function ticks() {
    var y0 = fy(0);
    ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, y0); ctx.lineTo(W - R, y0); ctx.moveTo(L, fy(TOP)); ctx.lineTo(L, y0); ctx.stroke();
    ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(L, fy(1)); ctx.lineTo(W - R, fy(1)); ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = '12px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ['0', 'π', '2π', '3π', '4π'].forEach(function (t, i) { ctx.fillText(t, fx(i * Math.PI), y0 + 16); });
    ctx.textAlign = 'right';
    ctx.fillText('1', L - 8, fy(1) + 4); ctx.fillText('½', L - 8, fy(.5) + 4); ctx.fillText('0', L - 8, y0 + 4);
    ctx.restore();
    label('φ', W - R, y0 + 34, 'right', C.text, 1);
    label('p(0)', L + 8, T - 6, 'left', C.text, 1);
  }

  function bars(p, n, alpha) {
    var k = zeros(p, n), rows = [[n ? k / n : 0, p, C.cyan, '0'], [n ? 1 - k / n : 0, 1 - p, C.amber, '1']];
    var w = W - L - R, rowH = 15, gap = 10, top = H - BARS + 14;
    rows.forEach(function (r, i) {
      var y = top + i * (rowH + gap);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(230,226,217,.06)'; ctx.fillRect(L, y, w, rowH);
      ctx.globalAlpha = alpha * .35; ctx.fillStyle = r[2]; ctx.fillRect(L, y, Math.max(1.5, r[0] * w), rowH);
      ctx.globalAlpha = alpha; ctx.fillRect(L, y, Math.max(1.5, r[0] * w), 2);
      ctx.strokeStyle = '#E6E2D9'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(L + r[1] * w, y - 3); ctx.lineTo(L + r[1] * w, y + rowH + 3); ctx.stroke();
      ctx.fillStyle = C.text; ctx.font = '12px Inter, -apple-system, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(r[3], L - 8, y + rowH - 3);
      ctx.restore();
    });
    return k;
  }

  function render() {
    if (!W) size();
    var p = progress();
    var sa = clamp(p / .34), sb = clamp((p - .36) / .28), sc = clamp((p - .68) / .3);
    var s = p < .35 ? 0 : p < .67 ? 1 : 2;
    /* the working point: swept across the plot in the first step, then held
       at phi = 2π/3, where p(0) = 1/4 once the fringe has formed */
    var phiEnd = 2 * Math.PI / 3;
    var phi = s === 0 ? Math.max(.001, ease(sa) * PHI_MAX) : phiEnd;
    var g = ease(sb);                                   // the second Hadamard, 0 → 1
    var pf = function (a) { return (1 - g) * .5 + g * p0(a); };
    var n = Math.round(ease(sc) * NMAX);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ticks();
    if (s === 0) curve(function () { return .5; }, phi, C.cyan, 2.2, 1, null, true);
    else {
      curve(function () { return .5; }, PHI_MAX, C.cyan, 1.2, .35 * (1 - g), [4, 5]);
      curve(pf, PHI_MAX, C.violet, 2.2, 1, null, true);
    }
    var mp = s === 0 ? .5 : pf(phi);
    ctx.save(); ctx.fillStyle = C.cyan; if (GLOW) { ctx.shadowColor = C.cyan; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.arc(fx(phi), fy(mp), 4.6, 0, 7); ctx.fill(); ctx.restore();
    var k = 0, ba = s === 2 ? ease(clamp(sc / .15)) : 0;
    if (ba > 0) k = bars(p0(phiEnd), n, ba);

    if (window.onFig) window.onFig({
      p: p, s: s, sa: sa, sb: sb, sc: sc,
      phi: phi, p0: mp, shots: n, zeros: k
    });
  }

  var queued = false;
  function queue() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; render(); }); } }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', function () { size(); queue(); });
  size(); render();
})();
