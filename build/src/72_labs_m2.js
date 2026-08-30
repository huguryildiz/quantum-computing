/* ==========================================================================
   Module 2 laboratories.

   C · Exact probability against a finite sample — a state, a measurement
       basis and a shot count, with the Born probability beside the frequency
       a simulated run actually produced. The device is perfect; everything
       that moves is the counting.
   D · Driving a qubit — the drive strength, the detuning and the elapsed
       time against the population. A pulse that flips the qubit on resonance
       stops flipping it a little way off, and the second panel says by how
       much.

   Both compute from the definitions at interaction time. The sampling in C is
   from a seeded generator, so the figure is the same figure on every machine
   and in every render: a gate that reads the page a fixed time after
   navigating cannot be handed a different answer each run.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F;
  const P = PLOT;
  const D2R = Math.PI/180;

  /* mulberry32, so a run is reproducible from its seed. */
  function rng(seed){
    let a = seed >>> 0;
    return function(){
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* =======================================================================
     C · EXACT PROBABILITY AGAINST A FINITE SAMPLE

     The state is cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>, and the three
     Pauli means are computed from it rather than quoted:

        r_x = sin(theta) cos(phi),  r_y = sin(theta) sin(phi),  r_z = cos(theta)

     A measurement along axis a then has p(+) = (1 + r_a)/2, which is the
     formula the n-dot-sigma scene derives. Nothing here is a table.
     ======================================================================= */
  const C = (() => {
    let st = { theta:60, phi:45, logn:3, basis:'Z' };

    function bloch(){
      const th = st.theta*D2R, ph = st.phi*D2R;
      return { x: Math.sin(th)*Math.cos(ph),
               y: Math.sin(th)*Math.sin(ph),
               z: Math.cos(th) };
    }

    function draw(root){
      const r = bloch();
      const comp = st.basis==='X' ? r.x : st.basis==='Y' ? r.y : r.z;
      const pPlus = (1 + comp)/2;
      const N = Math.round(Math.pow(10, st.logn));

      /* One run of N shots, drawn once and reused for both panels so that the
         final point of the right-hand curve is the bar on the left. */
      const gen = rng(20260830 + st.theta*7919 + st.phi*104729 + st.logn*31);
      const K = 200, step = Math.max(1, Math.floor(N/K));
      const run = []; let hits = 0;
      for(let i=1;i<=N;i++){
        if(gen() < pPlus) hits++;
        if(i % step === 0 || i === N) run.push([i, hits/i]);
      }
      const freq = hits/N;
      const se = Math.sqrt(pPlus*(1-pPlus)/N);
      const inside = Math.abs(freq - pPlus) <= 2*se + 1e-12;

      /* ---- the two probabilities, exact and counted ---- */
      const ax = P.Axes({w:430,h:300,xr:[-0.7,1.7],yr:[0,1.12],
        ylabel:'\\text{probability}', pad:{l:60,r:24,t:28,b:64},
        xticksOverride:[], ytarget:4});
      const pair = (n, exact, counted) => {
        ax.rect(n-0.30,0,n+0.30,exact,{fill:P.COL.dec.in});
        ax.poly([[n-0.30,exact],[n+0.30,exact]],{color:P.COL.in,width:2.6});
        ax.poly([[n-0.30,counted],[n+0.30,counted]],{color:P.COL.err,width:2.6,dash:'5 4'});
      };
      pair(0, pPlus, freq);
      pair(1, 1-pPlus, 1-freq);
      ax.note(0,0,'+1',{fs:13,color:P.COL.muted,anchor:'middle',dy:26});
      ax.note(1,0,'-1',{fs:13,color:P.COL.muted,anchor:'middle',dy:26});
      ax.note(0.5,0,'exact, and counted',{fs:12,color:P.COL.muted,anchor:'middle',dy:50});

      /* ---- the estimate as the shots accumulate ---- */
      const bx = P.Axes({w:430,h:300,xr:[0,Math.log10(N)],
        yr:[Math.max(0,pPlus-0.42), Math.min(1,pPlus+0.42)],
        xlabel:'\\log_{10} n', ylabel:'\\text{estimate}',
        pad:{l:64,r:24,t:28,b:46}, xtarget:4, ytarget:4});
      /* Two standard errors either side of the true value, as a function of
         how many shots have been taken so far. */
      const band = k => 2*Math.sqrt(pPlus*(1-pPlus)/Math.pow(10,k));
      bx.curve(k => pPlus + band(k), {color:P.COL.grid, width:1.4});
      bx.curve(k => pPlus - band(k), {color:P.COL.grid, width:1.4});
      bx.hline(pPlus,{color:P.COL.in,width:2,dash:'4 4'});
      bx.poly(run.filter(q=>q[0]>=1).map(q=>[Math.log10(q[0]), q[1]]),
        {color:P.COL.err, width:1.8});
      bx.point(Math.log10(N), freq, {color:P.COL.err, r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>Bloch component</dt><dd>${fmt(comp,4)}</dd></div>
        <div><dt>Exact p(+1)</dt><dd class="okv">${fmt(pPlus,5)}</dd></div>
        <div><dt>Shots</dt><dd>${N}</dd></div>
        <div><dt>Counted +1</dt><dd>${hits}</dd></div>
        <div><dt>Frequency</dt><dd>${fmt(freq,5)}</dd></div>
        <div><dt>Error of this run</dt><dd>${fmt(freq-pPlus,5)}</dd></div>
        <div><dt>Standard error</dt><dd>${fmt(se,5)}</dd></div>
        <div><dt>Inside two of them</dt><dd class="${inside?'okv':'warnv'}">${inside?'yes':'no'}</dd></div>`;

      const flat = Math.abs(comp) < 1e-9;
      const verdict = flat
        ? `<div class="note warn"><span class="note-h">This measurement learns nothing</span>
             The state's vector has no component along the measurement axis, so
             ${T('p(+1)=p(-1)=\\tfrac12',false)} exactly and every shot is a fair coin. The counting
             still costs the same. Turn the state until the bars part, and notice that the shot
             cost of resolving a difference is largest exactly here, where
             ${T('p(1-p)',false)} is at its maximum.</div>`
        : `<div class="note ok"><span class="note-h">What the two colours are</span>
             The filled bars are ${T('p(\\pm)=\\tfrac12(1\\pm\\mathbf{n}\\cdot\\mathbf{r})',false)},
             computed from the state. The dashed lines are what ${T('N='+N,false)} shots of a
             perfect device actually returned. They differ by ${T(fmt(Math.abs(freq-pPlus),4),false)},
             against a standard error of ${T(fmt(se,4),false)} — and the right-hand panel is the
             same run watched from its first shot, settling inside a band that narrows as
             ${T('1/\\sqrt{n}',false)} and no faster.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelector('[data-out="shots"]').textContent = String(N);
      root.querySelectorAll('[data-seg=basis]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.val===st.basis)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Measure along <span class="seg">
                <button data-seg="basis" data-val="Z">Z</button>
                <button data-seg="basis" data-val="X">X</button>
                <button data-seg="basis" data-val="Y">Y</button></span></label></div>
              <div class="ctrl"><label>Polar angle θ, degrees <span class="val" data-out="theta">60</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="60"></div>
              <div class="ctrl"><label>Relative phase φ, degrees <span class="val" data-out="phi">45</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="5" value="45"></div>
              <div class="ctrl"><label>Shots <span class="val" data-out="shots">1000</span></label>
                <input type="range" data-v="logn" min="1" max="5" step="1" value="3"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg=basis]'); if(!b) return;
        st.basis = b.dataset.val; draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     D · DRIVING A QUBIT

     H = (1/2)(Omega_x X + Delta Z), starting from |0>. The generator squares
     to Omega^2/4 times the identity, so the closed form of chapter 1 applies
     and the population of |1> is

        P(1) = (Omega_x / Omega)^2 sin^2(Omega t / 2),   Omega^2 = Omega_x^2 + Delta^2

     The two panels are that expression against time at the chosen detuning,
     and its ceiling against detuning at the chosen drive strength. Both come
     from the same formula.
     ======================================================================= */
  const D = (() => {
    let st = { drive:10, det:0, step:40 };
    const TMAX = 20;

    const om = () => st.drive/10;            /* drive strength, angular units */
    const de = () => st.det/10;              /* detuning, the same units      */
    const big = () => Math.hypot(om(), de());
    const pop = t => { const O = big();
      return O < 1e-12 ? 0 : (om()*om()/(O*O)) * Math.sin(O*t/2)**2; };

    function draw(root){
      const O = big(), t = TMAX*st.step/100;
      const ceiling = O < 1e-12 ? 0 : om()*om()/(O*O);

      const ax = P.Axes({w:430,h:300,xr:[0,TMAX],yr:[0,1.12],
        xlabel:'t', ylabel:'P(1)',
        pad:{l:60,r:24,t:28,b:46}, xtarget:4, ytarget:4});
      ax.hline(ceiling,{color:P.COL.grid,width:1.4,dash:'4 4'});
      ax.curve(pop,{color:P.COL.in,width:2.4,n:900});
      ax.vline(t,{color:P.COL.h,width:1.6,dash:'3 4'});
      ax.point(t,pop(t),{color:P.COL.h,r:6});

      const bx = P.Axes({w:430,h:300,xr:[-2,2],yr:[0,1.12],
        xlabel:'\\Delta', ylabel:'\\text{largest }P(1)',
        pad:{l:64,r:24,t:28,b:46}, xtarget:4, ytarget:4});
      bx.curve(d => { const o=om(); const q=o*o+d*d;
        return q < 1e-12 ? 0 : o*o/q; },{color:P.COL.out,width:2.4});
      bx.vline(de(),{color:P.COL.h,width:1.6,dash:'3 4'});
      bx.point(de(), ceiling, {color:P.COL.h,r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;

      const tPi = O < 1e-12 ? Infinity : Math.PI/O;
      root.querySelector('.ro').innerHTML = `
        <div><dt>Drive Ω<sub>x</sub></dt><dd>${fmt(om(),3)}</dd></div>
        <div><dt>Detuning Δ</dt><dd>${fmt(de(),3)}</dd></div>
        <div><dt>Generalised rate Ω</dt><dd>${fmt(O,4)}</dd></div>
        <div><dt>Elapsed time t</dt><dd>${fmt(t,3)}</dd></div>
        <div><dt>Angle turned Ωt</dt><dd>${fmt(O*t,3)}</dd></div>
        <div><dt>P(1) now</dt><dd class="okv">${fmt(pop(t),5)}</dd></div>
        <div><dt>Largest P(1) reachable</dt><dd class="${ceiling>0.99?'okv':'warnv'}">${fmt(ceiling,5)}</dd></div>
        <div><dt>Half-turn time π/Ω</dt><dd>${fmt(tPi,4)}</dd></div>`;

      const verdict = Math.abs(de()) < 1e-9
        ? `<div class="note ok"><span class="note-h">On resonance</span>
             The rotation axis lies in the equator, ${T('\\Omega=\\Omega_{x}',false)}, and the drive
             can take the qubit all the way to ${T('|1\\rangle',false)}. It does so first at
             ${T('t=\\pi/\\Omega=' + fmt(tPi,3),false)}, which is what a
             ${T('\\pi',false)} pulse is. Twice that time brings it back: the population is
             ${T('\\sin^{2}(\\Omega t/2)',false)} and nothing about it decays, because nothing here
             is open to anything.</div>`
        : ceiling < 0.2
        ? `<div class="note err"><span class="note-h">Too far detuned to flip</span>
             The axis has tilted almost onto ${T('z',false)}, so the drive turns the state about a
             direction the state is nearly along, and hardly moves it. The ceiling is
             ${T(fmt(ceiling,4),false)}: no pulse length whatever reaches
             ${T('|1\\rangle',false)}. More drive strength, not more time, is what fixes this —
             the second panel widens as ${T('\\Omega_{x}',false)} grows.</div>`
        : `<div class="note warn"><span class="note-h">Detuned, and the pulse no longer flips</span>
             The population now oscillates faster — ${T('\\Omega>\\Omega_{x}',false)} — and reaches
             only ${T(fmt(ceiling,4),false)}. A ${T('\\pi',false)} pulse calibrated on resonance is
             therefore wrong in two ways at once: it runs for the wrong length of time and it turns
             about the wrong axis. This is the commonest coherent gate error there is.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Drive strength, tenths <span class="val" data-out="drive">10</span></label>
                <input type="range" data-v="drive" min="1" max="20" step="1" value="10"></div>
              <div class="ctrl"><label>Detuning, tenths <span class="val" data-out="det">0</span></label>
                <input type="range" data-v="det" min="-20" max="20" step="1" value="0"></div>
              <div class="ctrl"><label>Elapsed time, per cent of the axis <span class="val" data-out="step">40</span></label>
                <input type="range" data-v="step" min="0" max="100" step="1" value="40"></div>
              ${LABS.KIT.runbar()}
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      draw(root);
      LABS.KIT.transport(root, { key:'step', max:100, ms:38,
        get:()=>st.step, set:v=>{ st.step=v; }, redraw:()=>draw(root) });
    }};
  })();

  return { C, D };
})());
