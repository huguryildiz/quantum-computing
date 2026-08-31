/* ==========================================================================
   The interferometer on the page.

   One qubit, three gates, and the smallest complete measurement in the course:

       |0> --[H]--[P(phi)]--[H]--  measure       p(0) = cos^2(phi/2)

   The middle state is an even superposition whatever the phase is, so measuring
   there learns nothing at all. The second Hadamard is what makes the phase
   readable, and it does so by bringing the two amplitudes into the same outcome
   so that they can add or cancel. That is the whole mechanism every algorithm
   in the course runs on, drawn once.

   Nothing on the screen is decoration and nothing is a second random process.
   The curve is cos^2(phi/2). The marker sits on that curve at the phase in the
   readout. The two bars are counts drawn from that same p, one binomial sample
   of N shots, and the bit string in the corner is the first twelve of those
   shots rather than a separate stream. So the exact probability and the
   measured frequency in the readout disagree by exactly what sampling noise is
   worth, which is the point: a histogram is an estimate, not a distribution.
   ========================================================================== */
(function () {
  var cv = document.getElementById('scope');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  if (!ctx) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var C = {
    teal:   '#4FBECE',   /* the |0> outcome, and the working point */
    violet: '#AC99DC',   /* the phase, and the fringe it draws */
    amber:  '#E5B255',   /* the |1> outcome */
    grid:   'rgba(146,164,214,.13)',
    axis:   'rgba(146,164,214,.30)',
    faint:  'rgba(146,164,214,.55)'
  };

  var SHOTS = 400;            /* one run of the circuit, four hundred times */
  var RESAMPLE = 260;         /* ms between fresh samples; faster only flickers */

  /* the readout elements */
  var elBits = document.getElementById('hud-bits');
  var elPhi  = document.getElementById('hud-phi');
  var elP    = document.getElementById('hud-p');
  var elHat  = document.getElementById('hud-hat');
  var elN    = document.getElementById('hud-n');
  if (elN) elN.textContent = SHOTS + ' shots';

  /* ---- the model. One line, and everything on the screen comes from it. ---- */
  function p0(phi) { var c = Math.cos(phi / 2); return c * c; }

  /* One binomial sample of N shots at probability p, drawn the slow honest way
     so that the bit string in the corner is the same run as the bar heights. */
  var bits = '';
  function sample(p, n) {
    var k = 0, s = '';
    for (var i = 0; i < n; i++) {
      var b = Math.random() < p ? 0 : 1;
      if (b === 0) k++;
      if (i < 12) s += b;
    }
    bits = s.replace(/(.{4})/g, '$1 ').trim();
    return k;
  }

  var phi = 0.9;              /* radians */
  var counted = sample(p0(phi), SHOTS);
  var lastSample = 0;
  var w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function line(x0, y0, x1, y1, col, wid, dash) {
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = wid || 1;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* The readout is pinned to the four corners of the screen, so the drawing
       is inset far enough to clear it. Every one of these numbers was set by
       looking at the rendered screen; a plot that runs under its own readout is
       a plot nobody can read. */
    var padL = 44, padR = 18, padT = 64, padB = 52;
    var tickH = 22;                       /* room under the axis for the ticks */
    var barsH = 56;                       /* two stacked bars and their labels */
    var plotL = padL, plotR = w - padR;
    var plotT = padT, plotB = h - padB - barsH - tickH;
    var pw = plotR - plotL, ph = plotB - plotT;
    if (pw < 60 || ph < 50) return;

    var PHI_MAX = 4 * Math.PI;                  /* two full fringes on screen */
    var X = function (a) { return plotL + (a / PHI_MAX) * pw; };
    var Y = function (p) { return plotB - p * ph; };

    ctx.font = '11px ui-monospace, "SF Mono", Menlo, monospace';

    /* ---- graticule ---- */
    for (var g = 0; g <= 4; g++) line(plotL, plotT + (ph * g) / 4, plotR, plotT + (ph * g) / 4, C.grid, 1);
    for (var k = 0; k <= 4; k++) line(plotL + (pw * k) / 4, plotT, plotL + (pw * k) / 4, plotB, C.grid, 1);
    line(plotL, plotB, plotR, plotB, C.axis, 1);
    line(plotL, plotT, plotL, plotB, C.axis, 1);

    ctx.fillStyle = C.faint;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText('1.0', plotL - 7, Y(1));
    ctx.fillText('0.5', plotL - 7, Y(0.5));
    ctx.fillText('0.0', plotL - 7, Y(0));

    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ['0', '180', '360', '540', '720'].forEach(function (t, i) {
      ctx.fillText(t, plotL + (pw * i) / 4, plotB + 6);
    });
    /* right-aligned under the axis, where no tick and no readout can reach it */
    ctx.textAlign = 'right';
    ctx.fillText('PHASE, DEGREES', plotR, plotB + tickH - 2);

    /* ---- the fringe itself, from cos^2(phi/2) and nothing else ---- */
    ctx.save();
    ctx.strokeStyle = C.violet; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i <= 300; i++) {
      var a = (PHI_MAX * i) / 300;
      var x = X(a), y = Y(p0(a));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    /* ---- the working point, and the phase it stands at ---- */
    var px = X(phi % PHI_MAX), py = Y(p0(phi));
    line(px, plotT, px, plotB, 'rgba(79,190,206,.34)', 1, [3, 4]);
    line(plotL, py, px, py, 'rgba(79,190,206,.22)', 1, [3, 4]);
    ctx.save();
    ctx.fillStyle = C.teal;
    ctx.shadowColor = 'rgba(79,190,206,.85)'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(px, py, 4.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* ---- the counts one run of that circuit actually produced ----
       Two bars stacked and full width, because the screen is wide and short and
       because a bar the width of the plot can carry the exact probability as a
       tick on the same axis it is drawn on. The gap between the tick and the
       end of the bar is what a finite run costs. */
    var p = p0(phi);
    var rows = [[counted / SHOTS, p, C.teal, '0'],
                [1 - counted / SHOTS, 1 - p, C.amber, '1']];
    var rowH = 17, rowGap = 9;
    var barsT = plotB + tickH + 14;

    rows.forEach(function (r, i) {
      var y = barsT + i * (rowH + rowGap);
      var len = Math.max(1.5, r[0] * pw);
      var exact = r[1] * pw;

      ctx.fillStyle = 'rgba(146,164,214,.07)';
      ctx.fillRect(plotL, y, pw, rowH);
      ctx.fillStyle = r[2] + '38';
      ctx.fillRect(plotL, y, len, rowH);
      ctx.fillStyle = r[2];
      ctx.fillRect(plotL, y, len, 2);

      line(plotL + exact, y - 3, plotL + exact, y + rowH + 3, '#e9edf7', 1.4);

      ctx.fillStyle = C.faint;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(r[3], plotL - 7, y + rowH / 2);

      ctx.fillStyle = r[2];
      ctx.textAlign = 'left';
      ctx.fillText(r[0].toFixed(3), plotL + Math.max(len, exact) + 8, y + rowH / 2);
    });
  }

  function readout() {
    var p = p0(phi), f = counted / SHOTS;
    if (elPhi)  elPhi.textContent  = (((phi % (4 * Math.PI)) * 180 / Math.PI)).toFixed(1) + '°';
    if (elP)    elP.textContent    = p.toFixed(3);
    if (elHat)  elHat.textContent  = f.toFixed(3);
    if (elBits) elBits.textContent = bits;
  }

  var running = true, onScreen = true, last = 0;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; });
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; },
      { threshold: 0 }).observe(cv);
  }
  window.addEventListener('resize', function () { resize(); draw(); });

  resize();

  function frame(now) {
    requestAnimationFrame(frame);
    if (!running || !onScreen) return;
    var dt = last ? Math.min(now - last, 60) : 16; last = now;
    if (!reduced) phi += dt * 0.00042;            /* a slow sweep of the phase */
    if (now - lastSample > RESAMPLE) {
      counted = sample(p0(phi), SHOTS);
      lastSample = now;
    }
    draw(); readout();
  }
  readout(); draw();
  requestAnimationFrame(frame);
})();
