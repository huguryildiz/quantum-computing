/* ==========================================================================
   Interactive laboratories — the kit they are all built from.

   Every control changes the mathematics, not the decoration. All displayed
   values are computed from the definitions at interaction time.

   A module's laboratories live in their own file, `build/src/7N_labs_mM.js`,
   and register themselves against this object rather than being written in
   here, so that two modules never edit the same file:

     Object.assign(LABS, (function(){
       const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F,
             el = LABS.KIT.el, gcd = LABS.KIT.gcd;
       return { A: { mount(root){ } }, B: { mount(root){ } } };
     })());

   Note the alias: the number formatter is `F` here, and `F` is also going to be
   the id of a laboratory. In a module file it is `fmt`, so the laboratory keeps
   the letter.
   ========================================================================== */
const LABS = (() => {
  /* A label that fails to parse still renders, in KaTeX's own red, but it also
     reaches the console so that qa.js turns red with it. Silent failure here is
     how a broken label survives a full pass of the gates. */
  const T = (s,d)=>{ try{ return katex.renderToString(s,{displayMode:!!d,throwOnError:true,strict:false}); }
                     catch(e){ console.error('LAB: label is not valid TeX: ' + s + ' — ' + e.message);
                               try{ return katex.renderToString(s,{displayMode:!!d,throwOnError:false,strict:false}); }
                               catch(e2){ return s; } } };
  /* Typeset the $...$ spans of a fragment before it reaches the DOM. Reading a
     fragment back out of innerHTML to typeset it in place cannot work: the
     serialiser escapes < and > inside the mathematics, KaTeX is then handed
     &lt; and fails, and a bare < in a formula is read as a tag on the way in. */
  const M = h => String(h).replace(/\$([^$]+)\$/g,(m,a)=>T(a,false));
  const F = (v,d=3)=>{ if(!isFinite(v)) return '∞';
                       if(v!==0 && Math.abs(v)<0.5*Math.pow(10,-d)) return v.toExponential(2);
                       const r=Math.round(v*10**d)/10**d;
                       return Object.is(r,-0)?'0':String(r); };
  const el = (h)=>{ const d=document.createElement('div'); d.innerHTML=h.trim(); return d.firstElementChild; };
  const gcd=(a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; };

  /* The three buttons a laboratory with a time axis carries. They are marked
     `data-run` rather than `data-seg`: a segmented control selects one state
     out of a set and `labwalk.js` walks every one of them, which is right for
     a state and wrong for a clock. What `labwalk.js` does with these is
     written down in that file. */
  const runbar = () => `<div class="ctrl runbar">
        <button data-run="play" aria-pressed="false">&#9654; Play</button>
        <button data-run="step">&#9197; Step</button>
        <button data-run="reset">&#8634; Reset</button></div>`;

  /* Drives one control — the `phase` slider — and nothing else, so a
     laboratory that animates has exactly as many drawing paths as one that
     does not, and `labwalk.js` covers the axis because a slider is a thing it
     already walks.

     It never starts on its own. Every gate reads the DOM a fixed number of
     milliseconds after navigating, and a page that moved by itself would give
     a different answer on every run.

     The loop is a fixed-step accumulator over requestAnimationFrame: whole
     steps at a fixed tempo, so a 60 Hz display and a 120 Hz one show the same
     frame at the same moment. The time comes from the frame timestamp and
     never from the clock, which would make the artifact's behaviour depend on
     when it was opened. */
  function transport(root, o){
    const slider = root.querySelector(`[data-v="${o.key}"]`);
    const bPlay  = root.querySelector('[data-run="play"]');
    const bStep  = root.querySelector('[data-run="step"]');
    const bReset = root.querySelector('[data-run="reset"]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, acc = 0, last = 0;

    const chrome = () => {
      if(bPlay){ bPlay.innerHTML = raf ? '&#10074;&#10074; Pause' : '&#9654; Play';
                 bPlay.setAttribute('aria-pressed', String(!!raf)); }
      if(bStep){ bStep.disabled = (o.get() >= o.max) && !raf; }
    };
    const put = v => { o.set(v); if(slider) slider.value = String(v); o.redraw(); chrome(); };
    const stop = () => { if(raf) cancelAnimationFrame(raf); raf = 0; acc = 0; last = 0; chrome(); };

    function frame(now){
      /* The scene changed under us: the host's innerHTML was replaced and this
         tree is detached. Drawing into it would burn a core for nobody, and a
         second loop would join it on the next visit. The engine offers no
         teardown hook, so the loop takes responsibility for its own death. */
      if(!root.isConnected){ raf = 0; return; }
      if(!last) last = now;
      acc += now - last; last = now;
      let v = o.get();
      while(acc >= o.ms && v < o.max){ acc -= o.ms; v++; }
      if(v !== o.get()) put(v);
      if(v >= o.max){ stop(); return; }
      raf = requestAnimationFrame(frame);
    }

    if(bPlay) bPlay.addEventListener('click', ()=>{
      if(raf){ stop(); return; }
      /* Reduced motion gets the result without the journey. */
      if(reduced){ put(o.max); return; }
      if(o.get() >= o.max) put(0);
      last = 0; acc = 0; raf = requestAnimationFrame(frame); chrome();
    });
    if(bStep)  bStep.addEventListener('click', ()=>{ stop(); if(o.get() < o.max) put(o.get()+1); });
    if(bReset) bReset.addEventListener('click', ()=>{ stop(); put(0); });
    chrome();
  }

  /* ---- the camera every Bloch ball is drawn through ----------------------
     An orthographic camera, so the outline of the unit sphere is a circle at
     every viewpoint and the length of a Bloch vector can still be read
     against that circle whichever way the ball has been turned. A mixed state
     is short and a pure one reaches the rim, and that stays true under
     rotation, which is the whole reason the ball may be turned at all.

     The camera is two angles. At azimuth `az` and elevation `el` it sits along

         w = (cos el cos az,  cos el sin az,  sin el),

     the screen's horizontal is u = (-sin az, cos az, 0), which is w turned a
     quarter turn in the horizontal plane, and the screen's vertical is
     v = w x u = (-sin el cos az, -sin el sin az, cos el). A point is projected
     by taking its components along u and v; its depth is its component along
     w, and a positive depth is the half of the ball nearer the reader.

     Note that z projects to (0, cos el) at every setting, so |0> stays at the
     top of the picture and |1> at the bottom however far the ball is turned.
     That is deliberate: the computational basis is the one axis a student is
     asked to keep hold of, and a picture in which it wanders is a picture in
     which nothing is fixed.

     The default view reproduces the drawing this course shipped before the
     ball could be turned. That figure used the oblique convention
     (x, y, z) -> (x + 0.42 y, z + 0.24 y), and at az = -65.2 and el = 15.3
     the camera above sends y to (0.420, 0.240) to three places, so the picture
     opens where it always did. What changes is that x and z are foreshortened
     by the few per cent an honest projection costs instead of being drawn at
     full length. */
  const CAM0 = { az:-65.2, el:15.3 };
  const cam = (az, el) => {
    const a = az*Math.PI/180, e = el*Math.PI/180;
    const ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e);
    return { az, el,
      p: (x,y,z) => [-sa*x + ca*y, -se*ca*x - se*sa*y + ce*z],
      d: (x,y,z) => ce*ca*x + ce*sa*y + se*z };
  };

  /* Drag the ball to turn it, double-click to put it back.

     A redraw replaces the very figure the pointer went down on, so the move
     and up handlers go on the window and not on that element: an element that
     has been thrown away receives no further events, and the drag would stop
     after one frame. They are added when a drag starts and removed when it
     ends, so nothing accumulates if a laboratory is mounted twice.

     Every redraw is deferred to the next frame, so a pointer that reports
     faster than the screen refreshes still draws once per frame.

     The elevation stops short of the poles. At exactly ninety degrees the
     camera looks straight down the axis it is turning about, the equator fills
     the rim and the two poles land on the centre together, and the picture
     stops saying anything.

     Nothing here starts on its own. Every gate reads the DOM a fixed time
     after navigating, and a figure that moved by itself would give a
     different answer on every run. */
  function orbit(root, view, redraw){
    let pending = false;
    const flush = () => { pending = false; redraw(); };
    const inBall = e => !!(e.target.closest && e.target.closest('[data-orbit]'));
    root.addEventListener('pointerdown', e => {
      if(!inBall(e)) return;
      let px = e.clientX, py = e.clientY;
      const move = ev => {
        view.az -= (ev.clientX - px)*0.45;
        view.el  = Math.max(-80, Math.min(80, view.el + (ev.clientY - py)*0.45));
        px = ev.clientX; py = ev.clientY;
        if(!pending){ pending = true; requestAnimationFrame(flush); }
      };
      const up = () => { window.removeEventListener('pointermove', move);
                         window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      e.preventDefault();
    });
    root.addEventListener('dblclick', e => {
      if(!inBall(e)) return;
      view.az = CAM0.az; view.el = CAM0.el; redraw();
    });
  }

  /* The wrapper a turnable figure is written into. `touch-action:pan-y` is
     what lets a phone read past a figure that fills most of its screen: a
     sideways drag turns the ball and an up-and-down one scrolls the page. */
  const orbitBox = svg =>
    `<div data-orbit style="touch-action:pan-y;cursor:grab">${svg}</div>`;

  return { KIT:{ T, M, F, el, gcd, transport, runbar, CAM0, cam, orbit, orbitBox } };
})();
