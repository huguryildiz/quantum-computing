/* ─────────────────────────────────────────────────────────────────────────
   Moiré Interference — four concentric wave sources, drifting, whose products
   beat against each other and leave fringes. The figure is the mechanism the
   whole course is about, so it is a statement rather than decoration: bright
   where the waves arrive in phase and dark where they cancel.

   Adapted from the "Moiré Interference" shader in Radiant Shaders, MIT
   licensed. The palette is retuned to the three stops of this course's mark —
   teal, violet, amber — and the canvas is bound to the hero rather than to the
   window.

     MIT License. Copyright (c) 2025 Paul Bakaus.
     Permission is hereby granted, free of charge, to any person obtaining a
     copy of this software and associated documentation files (the "Software"),
     to deal in the Software without restriction, including without limitation
     the rights to use, copy, modify, merge, publish, distribute, sublicense,
     and/or sell copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following conditions:
     The above copyright notice and this permission notice shall be included in
     all copies or substantial portions of the Software.
     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
     THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     DEALINGS IN THE SOFTWARE.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  var canvas = document.getElementById('grid');
  if (!canvas) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  /* No WebGL is not a failure. The scrim already paints the hero, so the page
     simply stands still and every word on it is still there. */
  if (!gl) { canvas.style.display = 'none'; return; }

  var RING_DENSITY = 0.78;
  var DRIFT_SPEED  = 0.34;

  var vertSrc = [
    'attribute vec2 a_pos;',
    'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }'
  ].join('\n');

  var fragSrc = [
    'precision highp float;',
    'uniform float u_time;',
    'uniform vec2  u_res;',
    'uniform float u_ringDensity;',
    'uniform float u_driftSpeed;',
    'uniform vec2  u_mouse;',
    '',
    'float hash(vec2 p){',
    '  vec3 p3 = fract(vec3(p.xyx) * 0.1031);',
    '  p3 += dot(p3, p3.yzx + 33.33);',
    '  return fract((p3.x + p3.y) * p3.z);',
    '}',
    '',
    'float rings(vec2 uv, vec2 center, float freq){',
    '  return sin(length(uv - center) * freq);',
    '}',
    '',
    'void main(){',
    '  vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);',
    '  float t = u_time;',
    '  float d = u_driftSpeed;',
    '',
    '  float breathe = 1.0 + 0.04 * sin(t * 0.3) + 0.02 * sin(t * 0.17 + 1.0);',
    '  float freq = 60.0 * u_ringDensity * breathe;',
    '',
    '  vec2 c0 = vec2(0.22 * cos(t * d * 0.31),       0.18 * sin(t * d * 0.43));',
    '  vec2 c1 = vec2(0.25 * cos(t * d * 0.23 + 2.1), 0.20 * sin(t * d * 0.37 + 1.4));',
    '  vec2 c2 = vec2(0.19 * sin(t * d * 0.41 + 4.2), 0.24 * cos(t * d * 0.29 + 3.1));',
    '  vec2 c3 = vec2(0.21 * cos(t * d * 0.19 + 5.7), 0.17 * sin(t * d * 0.47 + 0.8));',
    '',
    '  if (u_mouse.x > 0.0) {',
    '    c3 = (u_mouse - u_res * 0.5) / min(u_res.x, u_res.y);',
    '  }',
    '',
    '  float r0 = rings(uv, c0, freq);',
    '  float r1 = rings(uv, c1, freq * 1.07);',
    '  float r2 = rings(uv, c2, freq * 0.93);',
    '  float r3 = rings(uv, c3, freq * 1.13);',
    '',
    '  float moire    = r0 * r1 * r2 * r3;',
    '  float additive = (r0 + r1 + r2 + r3) * 0.25;',
    '  float intensity = clamp((moire * 0.7 + additive * 0.3) * 0.5 + 0.5, 0.0, 1.0);',
    '  intensity = pow(intensity, 1.62);',
    '',
    '  vec3 darkColor   = vec3(0.016, 0.020, 0.042);',
    '  vec3 midColor    = vec3(0.048, 0.155, 0.182);',
    '  vec3 brightColor = vec3(0.330, 0.285, 0.500);',
    '  vec3 peakColor   = vec3(0.940, 0.760, 0.400);',
    '',
    '  vec3 col;',
    '  if (intensity < 0.50)      col = mix(darkColor,   midColor,    intensity / 0.50);',
    '  else if (intensity < 0.78) col = mix(midColor,    brightColor, (intensity - 0.50) / 0.28);',
    '  else                       col = mix(brightColor, peakColor,   (intensity - 0.78) / 0.22);',
    '',
    '  float peakMask = smoothstep(0.80, 1.0, intensity);',
    '  col += peakColor * peakMask * 0.16;',
    '',
    '  float shimmer = smoothstep(0.4, 0.8, r0 * r2 * 0.5 + 0.5);',
    '  col += vec3(0.06, 0.11, 0.14) * shimmer * 0.22;',
    '',
    '  float vig = clamp(1.0 - dot(uv * 0.92, uv * 0.92), 0.0, 1.0);',
    '  col *= pow(vig, 0.55);',
    '',
    '  col += (hash(gl_FragCoord.xy + fract(t * 37.0) * 1000.0) - 0.5) * 0.028;',
    '  col = max(col, vec3(0.0));',
    '  col = col / (1.0 + col * 0.2);',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.error('shader compile: ' + gl.getShaderInfoLog(s));
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    console.error('program link: ' + gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uRes  = gl.getUniformLocation(prog, 'u_res');
  var uDen  = gl.getUniformLocation(prog, 'u_ringDensity');
  var uDrift= gl.getUniformLocation(prog, 'u_driftSpeed');
  var uMouse= gl.getUniformLocation(prog, 'u_mouse');

  /* One and a half device pixels is enough for a pattern this soft, and it
     keeps a phone from rendering four times the fragments it needs to. */
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var mouseX = -1, mouseY = -1, needsResize = true;

  /* The canvas fills the hero and not the window, so a pointer position has to
     be measured against the canvas box rather than against the page. */
  canvas.addEventListener('mousemove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) * dpr;
    mouseY = (r.bottom - e.clientY) * dpr;
  });
  canvas.addEventListener('mouseleave', function () { mouseX = -1; mouseY = -1; });

  function resize() {
    needsResize = false;
    var w = Math.max(1, Math.round(canvas.clientWidth  * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
  }

  /* Two reasons to stop drawing: the tab is hidden, or the hero has scrolled
     away. Neither is visible to the reader and both cost a whole core. */
  var visible = true, onScreen = true;
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; })
      .observe(canvas);
  }

  window.addEventListener('resize', function () { needsResize = true; });
  resize();

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || !onScreen) return;
    if (needsResize) resize();
    gl.uniform1f(uTime, reduced ? 6.0 : now * 0.001);
    gl.uniform1f(uDen, RING_DENSITY);
    gl.uniform1f(uDrift, DRIFT_SPEED);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (reduced) { visible = false; }
  }
  requestAnimationFrame(frame);
})();
