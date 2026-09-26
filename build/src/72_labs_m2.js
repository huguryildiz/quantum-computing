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
   D1 · Two measurements in a row — a state, a first basis and a second one.
        The first reading collapses the state; the second reading is computed
        from what is left, not from the original state, and the two bases
        agree only when they share an eigenbasis.
   D2 · How tight is the uncertainty bound? — a state and two measurement
        directions on the equatorial plane. The product of the two spreads
        and the Robertson bound are both computed from the state, and the
        gap between them closes only at one angle for a given state.
   D3 · Measuring along a tilted axis — a state's Bloch vector and an
        instrument direction, both set by two angles apiece. The probability
        of the plus outcome is read from the angle between the two vectors,
        never quoted, and it falls to one half exactly at a right angle.

   All compute from the definitions at interaction time. The sampling in C is
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

  /* =======================================================================
     D1 · TWO MEASUREMENTS IN A ROW

     The state is cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>, with Bloch
     vector r = (sin theta cos phi, sin theta sin phi, cos theta). A first
     measurement along axis a gives + with probability (1+r.a)/2 and leaves
     the state's vector at +a or -a, whichever the reading was — computed
     here by re-reading the Pauli mean of the collapsed state, not asserted.
     A second measurement along axis b then reads (1+r'.b)/2 from that new
     vector. Both readings come from n.sigma probabilities; nothing is a
     lookup table of the nine basis pairs.
     ======================================================================= */
  const D1 = (() => {
    let st = { theta:60, phi:30, first:'Z', second:'X', outcome:1 };
    const AX = { Z:[0,0,1], X:[1,0,0], Y:[0,1,0] };

    function bloch(){
      const th = st.theta*D2R, ph = st.phi*D2R;
      return [Math.sin(th)*Math.cos(ph), Math.sin(th)*Math.sin(ph), Math.cos(th)];
    }
    const dot = (u,v) => u[0]*v[0]+u[1]*v[1]+u[2]*v[2];

    function draw(root){
      const r = bloch(), a = AX[st.first], b = AX[st.second];
      const ra = dot(r,a);
      const pFirst = (1 + ra)/2;
      /* The reading the reader has chosen. A projective measurement along a
         puts the vector exactly at +a or -a; nothing between them survives. */
      const sign = st.outcome;
      const rPrime = sign > 0 ? a : a.map(v=>-v);
      const pSecond = (1 + sign*dot(rPrime,b))/2;
      const commute = Math.abs(dot(a,b)) > 1 - 1e-9;

      /* ---- the Bloch vector before and after, on the equatorial-ish disc
         used elsewhere in this module: a 2-D projection along (x,y) with z
         shown as a filled fraction, since the full sphere is chapter 4's. ---- */
      const ax = P.Axes({w:430,h:320,xr:[-1.3,1.3],yr:[-1.3,1.3],
        pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
        grid:false, zeroAxes:true, arrows:false});
      const ring=[]; for(let i=0;i<=160;i++){ const t=2*Math.PI*i/160; ring.push([Math.cos(t),Math.sin(t)]); }
      ax.poly(ring,{color:P.COL.grid,width:1.2});
      const proj = v => [v[0]+0.32*v[1], v[2]+0.20*v[1]];
      [[a,'a',P.COL.mid],[b,'b',P.COL.out]].forEach(([v,l,col])=>{
        const p = proj(v);
        ax.poly([[0,0],p],{color:col,width:2,dash:'4 4'});
        ax.note(p[0],p[1],l,{fs:13,color:col,dx:p[0]>=0?8:-16,dy:p[1]>0?-6:16,tex:true});
      });
      const p0 = proj(r), p1 = proj(rPrime);
      ax.poly([[0,0],p0],{color:P.COL.in,width:2.6});
      ax.point(p0[0],p0[1],{color:P.COL.in,r:6});
      ax.note(p0[0],p0[1],'\\mathbf{r}',{fs:14,color:P.COL.in,dx:10,dy:-10,tex:true});
      ax.poly([[0,0],p1],{color:P.COL.err,width:2.6});
      ax.point(p1[0],p1[1],{color:P.COL.err,r:6});
      ax.note(p1[0],p1[1],"\\mathbf{r}'",{fs:14,color:P.COL.err,dx:10,dy:14,tex:true});

      /* ---- the two probabilities that were actually asked for ---- */
      const bx = P.Axes({w:430,h:320,xr:[-0.7,1.7],yr:[0,1.12],
        ylabel:'\\text{probability}', pad:{l:60,r:24,t:28,b:56},
        xticksOverride:[], ytarget:4});
      bx.rect(-0.30,0,0.30,pFirst,{fill:P.COL.dec.mid});
      bx.poly([[-0.30,pFirst],[0.30,pFirst]],{color:P.COL.mid,width:2.6});
      bx.rect(0.70,0,1.30,pSecond,{fill:P.COL.dec.out});
      bx.poly([[0.70,pSecond],[1.30,pSecond]],{color:P.COL.out,width:2.6});
      bx.note(0,0,'1st, '+st.first,{fs:12,color:P.COL.muted,anchor:'middle',dy:26});
      bx.note(1,0,'2nd, '+st.second,{fs:12,color:P.COL.muted,anchor:'middle',dy:26});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>r before</dt><dd>(${fmt(r[0],3)}, ${fmt(r[1],3)}, ${fmt(r[2],3)})</dd></div>
        <div><dt>p(+) on the 1st measurement</dt><dd class="okv">${fmt(pFirst,5)}</dd></div>
        <div><dt>Reading kept</dt><dd>${sign>0?'+1':'-1'}</dd></div>
        <div><dt>r after</dt><dd>(${fmt(rPrime[0],3)}, ${fmt(rPrime[1],3)}, ${fmt(rPrime[2],3)})</dd></div>
        <div><dt>p(+) on the 2nd measurement</dt><dd class="${commute?'okv':'warnv'}">${fmt(pSecond,5)}</dd></div>`;

      const verdict = commute
        ? `<div class="note ok"><span class="note-h">The two bases share an eigenbasis</span>
             ${T(st.first+'\\text{ and }'+st.second,false)} point along the same line, so the first
             reading already puts the state at an eigenvector of the second observable. The second
             probability is exactly ${T(fmt(pSecond,3),false)}: certain, one way or the other.</div>`
        : `<div class="note warn"><span class="note-h">The first reading destroyed the second question</span>
             Whatever ${T('\\mathbf{r}',false)} was before, the first measurement threw it away and
             replaced it with ${T('\\pm\\mathbf{a}',false)}. The second probability
             ${T(fmt(pSecond,4),false)} depends only on the angle between
             ${T('\\mathbf{a}',false)} and ${T('\\mathbf{b}',false)} — the original state has left no
             trace on it at all.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.val===String(st[b.dataset.seg]))));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Polar angle θ, degrees <span class="val" data-out="theta">60</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="60"></div>
              <div class="ctrl"><label>Relative phase φ, degrees <span class="val" data-out="phi">30</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="5" value="30"></div>
              <div class="ctrl"><label>1st measurement <span class="seg">
                <button data-seg="first" data-val="Z">Z</button>
                <button data-seg="first" data-val="X">X</button>
                <button data-seg="first" data-val="Y">Y</button></span></label></div>
              <div class="ctrl"><label>Reading kept <span class="seg">
                <button data-seg="outcome" data-val="1">+1</button>
                <button data-seg="outcome" data-val="-1">-1</button></span></label></div>
              <div class="ctrl"><label>2nd measurement <span class="seg">
                <button data-seg="second" data-val="Z">Z</button>
                <button data-seg="second" data-val="X">X</button>
                <button data-seg="second" data-val="Y">Y</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg]'); if(!b) return;
        const key = b.dataset.seg;
        st[key] = key==='outcome' ? parseInt(b.dataset.val,10) : b.dataset.val;
        draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     D2 · HOW TIGHT IS THE UNCERTAINTY BOUND?

     The state has Bloch vector r(theta,phi). The two observables measured
     are n.sigma and m.sigma, both unit vectors in the equatorial plane at
     angles alpha and alpha+beta from x. For a Pauli observable
     Var(n.sigma) = 1 - (n.r)^2, so both spreads and the commutator bound
     come from r, n and m alone — nothing here is looked up from the closed
     forms the teaching scene gives for X and Z in particular.
     ======================================================================= */
  const D2 = (() => {
    let st = { theta:70, phi:20, alpha:0, beta:90 };

    function bloch(){
      const th = st.theta*D2R, ph = st.phi*D2R;
      return [Math.sin(th)*Math.cos(ph), Math.sin(th)*Math.sin(ph), Math.cos(th)];
    }
    const dirv = deg => [Math.cos(deg*D2R), Math.sin(deg*D2R), 0];
    const cross = (u,v) => [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
    const dot = (u,v) => u[0]*v[0]+u[1]*v[1]+u[2]*v[2];

    function draw(root){
      const r = bloch(), n = dirv(st.alpha), m = dirv(st.alpha+st.beta);
      const rn = dot(r,n), rm = dot(r,m);
      const dN = Math.sqrt(Math.max(0,1-rn*rn)), dM = Math.sqrt(Math.max(0,1-rm*rm));
      const product = dN*dM;
      /* [n.sigma, m.sigma] = 2i (n x m).sigma, so the bound is |(n x m).r|. */
      const nxm = cross(n,m);
      const bound = Math.abs(dot(nxm,r));
      const gap = product - bound;

      const ax = P.Axes({w:430,h:320,xr:[-1.25,1.25],yr:[-1.25,1.25],
        pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
        grid:false, zeroAxes:true, arrows:false});
      const ring=[]; for(let i=0;i<=160;i++){ const t=2*Math.PI*i/160; ring.push([Math.cos(t),Math.sin(t)]); }
      ax.poly(ring,{color:P.COL.grid,width:1.2});
      const proj = v => [v[0]+0.32*v[1], v[2]+0.20*v[1]];
      [[n,'n',P.COL.mid],[m,'m',P.COL.out]].forEach(([v,l,col])=>{
        const p = proj(v);
        ax.poly([[0,0],p],{color:col,width:2.4});
        ax.point(p[0],p[1],{color:col,r:5});
        ax.note(p[0],p[1],l,{fs:13,color:col,dx:p[0]>=0?10:-18,dy:p[1]>0?-8:18,tex:true});
      });
      const pr = proj(r);
      ax.poly([[0,0],pr],{color:P.COL.in,width:2.6});
      ax.point(pr[0],pr[1],{color:P.COL.in,r:6});
      ax.note(pr[0],pr[1],'\\mathbf{r}',{fs:14,color:P.COL.in,dx:10,dy:-10,tex:true});

      const bx = P.Axes({w:430,h:320,xr:[0,181],yr:[0,1.12],
        xlabel:'\\beta,\\text{ the angle between }\\mathbf{n}\\text{ and }\\mathbf{m}',
        ylabel:'\\text{value}', pad:{l:60,r:24,t:28,b:52}, xtarget:5, ytarget:4});
      bx.curve(b => { const mm = dirv(st.alpha+b);
        const rmm = dot(r,mm); return Math.sqrt(Math.max(0,1-rn*rn))*Math.sqrt(Math.max(0,1-rmm*rmm)); },
        {color:P.COL.in,width:2.4});
      bx.curve(b => { const mm = dirv(st.alpha+b);
        return Math.abs(dot(cross(n,mm),r)); }, {color:P.COL.err,width:2.2,dash:'5 4'});
      bx.vline(st.beta,{color:P.COL.h,width:1.6,dash:'3 4'});
      bx.point(st.beta,product,{color:P.COL.in,r:6});
      bx.point(st.beta,bound,{color:P.COL.err,r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>ΔN</dt><dd>${fmt(dN,4)}</dd></div>
        <div><dt>ΔM</dt><dd>${fmt(dM,4)}</dd></div>
        <div><dt>ΔN · ΔM</dt><dd class="okv">${fmt(product,5)}</dd></div>
        <div><dt>Robertson bound</dt><dd>${fmt(bound,5)}</dd></div>
        <div><dt>Gap</dt><dd class="${gap<1e-3?'okv':''}">${fmt(gap,5)}</dd></div>`;

      const verdict = st.beta < 1 || st.beta > 179
        ? `<div class="note warn"><span class="note-h">The same observable twice</span>
             At ${T('\\beta='+st.beta+'^{\\circ}',false)} the two directions coincide, so
             ${T('[\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma,\\mathbf{m}\\cdot\\boldsymbol\\sigma\\,]=0',false)}
             and the bound is exactly zero. Both spreads can still be large; the relation says nothing
             about a single observable measured against itself.</div>`
        : gap < 1e-3
        ? `<div class="note ok"><span class="note-h">The bound is saturated here</span>
             ${T('\\Delta N\\,\\Delta M',false)} touches the Robertson bound at this state and this
             angle. Move ${T('\\theta',false)} or ${T('\\varphi',false)} and the two curves separate
             again: saturation is a property of one state, not of the pair of observables.</div>`
        : `<div class="note def"><span class="note-h">A bound, not a prediction</span>
             The product ${T(fmt(product,4),false)} sits above the bound ${T(fmt(bound,4),false)} by
             ${T(fmt(gap,4),false)}. The relation guarantees the product cannot fall below the bound;
             it never promises the product will reach it.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Polar angle θ, degrees <span class="val" data-out="theta">70</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="70"></div>
              <div class="ctrl"><label>Relative phase φ, degrees <span class="val" data-out="phi">20</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="5" value="20"></div>
              <div class="ctrl"><label>Direction n, degrees <span class="val" data-out="alpha">0</span></label>
                <input type="range" data-v="alpha" min="0" max="180" step="5" value="0"></div>
              <div class="ctrl"><label>Angle to m, degrees <span class="val" data-out="beta">90</span></label>
                <input type="range" data-v="beta" min="0" max="180" step="5" value="90"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     D3 · MEASURING ALONG A TILTED AXIS

     Both the state's Bloch vector r(theta,phi) and the instrument direction
     n(alpha,beta) are set independently, each by its own polar and azimuthal
     angle. p(+) = (1+n.r)/2 is read from their dot product; the angle
     between them is recovered from the same dot product via arccos, not
     assumed to equal any control on the panel.
     ======================================================================= */
  const D3 = (() => {
    let st = { theta:40, phi:0, alpha:90, beta:0 };

    const vec = (th,ph) => { const t=th*D2R, p=ph*D2R;
      return [Math.sin(t)*Math.cos(p), Math.sin(t)*Math.sin(p), Math.cos(t)]; };
    const dot = (u,v) => u[0]*v[0]+u[1]*v[1]+u[2]*v[2];

    function draw(root){
      const r = vec(st.theta,st.phi), n = vec(st.alpha,st.beta);
      const c = Math.max(-1,Math.min(1,dot(r,n)));
      const pPlus = (1+c)/2;
      const angle = Math.acos(c);

      const ax = P.Axes({w:430,h:320,xr:[-1.3,1.3],yr:[-1.3,1.3],
        pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
        grid:false, zeroAxes:true, arrows:false});
      const ring=[]; for(let i=0;i<=160;i++){ const t=2*Math.PI*i/160; ring.push([Math.cos(t),Math.sin(t)]); }
      ax.poly(ring,{color:P.COL.grid,width:1.2});
      const proj = v => [v[0]+0.32*v[1], v[2]+0.20*v[1]];
      const pn = proj(n);
      ax.poly([[0,0],pn],{color:P.COL.mid,width:2.6});
      ax.point(pn[0],pn[1],{color:P.COL.mid,r:6});
      ax.note(pn[0],pn[1],'\\mathbf{n}',{fs:14,color:P.COL.mid,dx:10,dy:-10,tex:true});
      const pr = proj(r);
      ax.poly([[0,0],pr],{color:P.COL.in,width:2.6});
      ax.point(pr[0],pr[1],{color:P.COL.in,r:6});
      ax.note(pr[0],pr[1],'\\mathbf{r}',{fs:14,color:P.COL.in,dx:10,dy:14,tex:true});

      const bx = P.Axes({w:430,h:320,xr:[0,Math.PI],yr:[0,1.12],
        xlabel:'\\alpha,\\text{ the angle }\\mathbf{n}\\text{ to }\\mathbf{r}', ylabel:'p(+)',
        pad:{l:60,r:24,t:28,b:52}, xtarget:4, ytarget:4});
      bx.curve(a => (1+Math.cos(a))/2, {color:P.COL.in,width:2.4});
      bx.vline(angle,{color:P.COL.h,width:1.6,dash:'3 4'});
      bx.point(angle,pPlus,{color:P.COL.h,r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>r</dt><dd>(${fmt(r[0],3)}, ${fmt(r[1],3)}, ${fmt(r[2],3)})</dd></div>
        <div><dt>n</dt><dd>(${fmt(n[0],3)}, ${fmt(n[1],3)}, ${fmt(n[2],3)})</dd></div>
        <div><dt>n · r</dt><dd>${fmt(c,4)}</dd></div>
        <div><dt>Angle between them</dt><dd>${fmt(angle/D2R,2)}°</dd></div>
        <div><dt>p(+)</dt><dd class="okv">${fmt(pPlus,5)}</dd></div>`;

      const aligned = angle < 1e-6, opposed = Math.abs(angle-Math.PI) < 1e-6, right = Math.abs(angle-Math.PI/2)<1e-2;
      const verdict = aligned
        ? `<div class="note ok"><span class="note-h">The instrument reads the state's own axis</span>
             ${T('\\mathbf{n}=\\mathbf{r}',false)}, so the state is an eigenstate of
             ${T('\\mathbf{n}\\cdot\\boldsymbol\\sigma',false)} and ${T('p(+)=1',false)} exactly. This is
             what "aligned with the measurement direction" means for a Bloch vector.</div>`
        : opposed
        ? `<div class="note err"><span class="note-h">Pointed the wrong way</span>
             ${T('\\mathbf{n}=-\\mathbf{r}',false)}: the instrument is aimed at the state's antipode, and
             every shot returns ${T('-1',false)}. Nothing is broken; the axis was chosen backwards.</div>`
        : right
        ? `<div class="note warn"><span class="note-h">A right angle is a coin</span>
             At ${T('\\alpha=90^{\\circ}',false)}, ${T('\\mathbf{n}\\cdot\\mathbf{r}=0',false)} and
             ${T('p(+)=\\tfrac12',false)} whatever the two vectors' individual directions were. This is
             the same right angle Section 2.1.3 measures in state space, doubled onto the Bloch sphere.</div>`
        : `<div class="note def"><span class="note-h">Read straight off the dot product</span>
             ${T('p(+)=\\tfrac12(1+\\mathbf{n}\\cdot\\mathbf{r})',false)} needs no other formula once
             both vectors are written down. Turning either slider moves one vector and recomputes the
             same dot product.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>State polar angle θ, degrees <span class="val" data-out="theta">40</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="40"></div>
              <div class="ctrl"><label>State azimuth φ, degrees <span class="val" data-out="phi">0</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="5" value="0"></div>
              <div class="ctrl"><label>Instrument polar angle, degrees <span class="val" data-out="alpha">90</span></label>
                <input type="range" data-v="alpha" min="0" max="180" step="5" value="90"></div>
              <div class="ctrl"><label>Instrument azimuth, degrees <span class="val" data-out="beta">0</span></label>
                <input type="range" data-v="beta" min="0" max="360" step="5" value="0"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      draw(root);
    }};
  })();

  return { C, D, D1, D2, D3 };
})());
