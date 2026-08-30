/* ==========================================================================
   Module 1 laboratories.

   A · The relative-phase interferometer — the mixing angle, the relative phase
       and the global phase against the two amplitudes and the two measurement
       bases. One of the three controls changes nothing, and the laboratory
       exists so that the reader finds out which by moving it.
   B · Gram-Schmidt, one step at a time — three vectors in space, orthogonalised
       step by step, with the loss of orthogonality measured rather than
       asserted. The classical and the modified recursion are both run, and the
       gap between them is the whole argument for not writing the first one.

   Every number here is computed from the definitions at interaction time.
   Nothing is a stored table and nothing is a fit.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F, el = LABS.KIT.el;
  const P = PLOT;
  const D2R = Math.PI/180;

  /* A small number, written for KaTeX. The obvious route — handing
     `(2.2e-10).toExponential(2)` straight to the typesetter — sets the string
     "2.23e-10", and KaTeX reads the `e-10` as an italic e minus ten. The
     mantissa and the exponent are separated here so the page shows a power of
     ten and not a subtraction. */
  const sci = (v, d=2) => {
    if(!isFinite(v)) return '\\infty';
    if(v === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(v)));
    const m = v / Math.pow(10, e);
    return Math.abs(e) < 4 ? fmt(v, Math.max(0, 4-e))
                           : m.toFixed(d) + '\\times 10^{' + e + '}';
  };

  /* =======================================================================
     A · THE RELATIVE-PHASE INTERFEROMETER

     The state is

        |psi> = e^{i gamma} [ cos(theta/2) |0> + e^{i phi} sin(theta/2) |1> ]

     and the laboratory reports its two amplitudes, its two computational
     probabilities, and its two probabilities in the X basis. Only the third
     of those depends on the relative phase, and none of them depends on the
     global one.
     ======================================================================= */
  const A = (() => {
    let st = { theta:90, phi:60, gamma:0 };

    /* Both amplitudes, as (re, im) pairs, straight from the definition. */
    function amps(){
      const th = st.theta*D2R, ph = st.phi*D2R, ga = st.gamma*D2R;
      const c = Math.cos(th/2), s = Math.sin(th/2);
      return [
        [c*Math.cos(ga),      c*Math.sin(ga)],
        [s*Math.cos(ga+ph),   s*Math.sin(ga+ph)]
      ];
    }

    function draw(root){
      const [a0, a1] = amps();
      const p0 = a0[0]*a0[0] + a0[1]*a0[1];
      const p1 = a1[0]*a1[0] + a1[1]*a1[1];
      /* <+|psi> and <-|psi>, formed from the amplitudes rather than from a
         closed form, so that the closed form printed beside them is being
         checked and not restated. */
      const pp = [ (a0[0]+a1[0])/Math.SQRT2, (a0[1]+a1[1])/Math.SQRT2 ];
      const pm = [ (a0[0]-a1[0])/Math.SQRT2, (a0[1]-a1[1])/Math.SQRT2 ];
      const pPlus  = pp[0]*pp[0] + pp[1]*pp[1];
      const pMinus = pm[0]*pm[0] + pm[1]*pm[1];
      const vis = Math.sin(st.theta*D2R);
      const closed = 0.5*(1 + vis*Math.cos(st.phi*D2R));

      /* ---- the two amplitudes in the complex plane ---- */
      /* The horizontal range is set from the vertical one and the shape of
         the frame, so that one unit is the same number of pixels each way and
         the unit circle is drawn round rather than as an ellipse. */
      const ax = P.Axes({w:430,h:360,xr:[-1.66,1.66],yr:[-1.35,1.35],
        xlabel:'\\operatorname{Re}', ylabel:'\\operatorname{Im}',
        pad:{l:52,r:26,t:30,b:44}, xtarget:4, ytarget:4});
      const ring=[]; for(let i=0;i<=180;i++){ const t=2*Math.PI*i/180;
        ring.push([Math.cos(t),Math.sin(t)]); }
      ax.poly(ring,{color:P.COL.grid,width:1.2});
      ax.poly([[0,0],a0],{color:P.COL.in,width:2.8});
      ax.point(a0[0],a0[1],{color:P.COL.in,r:6});
      ax.poly([[0,0],a1],{color:P.COL.mid,width:2.8});
      ax.point(a1[0],a1[1],{color:P.COL.mid,r:6});
      ax.note(a0[0]*1.14+0.06, a0[1]*1.14+0.06,'\\alpha',{fs:14,color:P.COL.in,tex:true});
      ax.note(a1[0]*1.14+0.06, a1[1]*1.14-0.22,'\\beta',{fs:14,color:P.COL.mid,tex:true});

      /* ---- the four probabilities ---- */
      const bx = P.Axes({w:430,h:360,xr:[-0.7,3.7],yr:[0,1.12],
        ylabel:'\\text{probability}', pad:{l:60,r:24,t:28,b:92},
        xticksOverride:[], ytarget:4});
      const bar = (n,v,fill,line)=>{ bx.rect(n-0.28,0,n+0.28,v,{fill:fill});
        bx.poly([[n-0.28,v],[n+0.28,v]],{color:line,width:2.4}); };
      bar(0,p0,P.COL.dec.in,P.COL.in);
      bar(1,p1,P.COL.dec.in,P.COL.in);
      bar(2,pPlus,P.COL.dec.mid,P.COL.mid);
      bar(3,pMinus,P.COL.dec.mid,P.COL.mid);
      bx.note(0,-0.10,'P(0)',{fs:13,color:P.COL.in,anchor:'middle',tex:true});
      bx.note(1,-0.10,'P(1)',{fs:13,color:P.COL.in,anchor:'middle',tex:true});
      bx.note(2,-0.10,'P(+)',{fs:13,color:P.COL.mid,anchor:'middle',tex:true});
      bx.note(3,-0.10,'P(-)',{fs:13,color:P.COL.mid,anchor:'middle',tex:true});
      bx.note(0.5,-0.22,'computational basis',{fs:12,color:P.COL.muted,anchor:'middle'});
      bx.note(2.5,-0.22,'X basis',{fs:12,color:P.COL.muted,anchor:'middle'});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>Amplitude of |0⟩</dt><dd>${fmt(a0[0],4)} ${a0[1]<0?'−':'+'} ${fmt(Math.abs(a0[1]),4)}i</dd></div>
        <div><dt>Amplitude of |1⟩</dt><dd>${fmt(a1[0],4)} ${a1[1]<0?'−':'+'} ${fmt(Math.abs(a1[1]),4)}i</dd></div>
        <div><dt>Total probability</dt><dd class="okv">${fmt(p0+p1,6)}</dd></div>
        <div><dt>P(0)</dt><dd>${fmt(p0,4)}</dd></div>
        <div><dt>P(1)</dt><dd>${fmt(p1,4)}</dd></div>
        <div><dt>P(+)</dt><dd class="okv">${fmt(pPlus,4)}</dd></div>
        <div><dt>P(−)</dt><dd>${fmt(pMinus,4)}</dd></div>
        <div><dt>Fringe visibility sin θ</dt><dd>${fmt(vis,4)}</dd></div>
        <div><dt>P(+) from the closed form</dt><dd>${fmt(closed,4)}</dd></div>
        <div><dt>P(0) from cos²(θ/2)</dt><dd>${fmt(Math.cos(st.theta*D2R/2)**2,4)}</dd></div>`;

      /* The verdict names what the reader has just done rather than repeating
         the numbers above it. Three regimes, and each one is a different
         sentence about the same state. */
      const flat = vis < 1e-9;
      const verdict = flat
        ? `<div class="note warn"><span class="note-h">Nothing for the phase to be relative to</span>
             At this mixing angle one amplitude is zero, so there is only one term and no phase between
             two of them. The relative-phase slider now moves nothing at all, and
             ${T('P(+)=P(-)=\\tfrac12',false)} whatever it is set to. A relative phase needs two
             amplitudes, and the mixing angle is what supplies the second one.</div>`
        : `<div class="note ok"><span class="note-h">What each control did</span>
             The mixing angle set the computational probabilities, ${T('P(0)=\\cos^{2}(\\theta/2)',false)},
             and the relative phase left them alone. In the ${T('X',false)} basis the phase is
             everything: ${T('P(\\pm)=\\tfrac12\\left[1\\pm\\sin\\theta\\cos\\varphi\\right]',false)},
             which is the fringe of Chapter 0 with a visibility of
             ${T(fmt(vis,3),false)}. The global phase appears in neither expression, and moving it
             turns both arrows in the left panel while every number on this page stands still.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack">
            <div class="plots"></div>
          </div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Mixing angle θ, degrees <span class="val" data-out="theta">90</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="90"></div>
              <div class="ctrl"><label>Relative phase φ, degrees <span class="val" data-out="phi">60</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="5" value="60"></div>
              <div class="ctrl"><label>Global phase γ, degrees <span class="val" data-out="gamma">0</span></label>
                <input type="range" data-v="gamma" min="0" max="360" step="5" value="0"></div>
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
     B · GRAM-SCHMIDT, ONE STEP AT A TIME

     Three vectors in real three-dimensional space. The first two are separated
     by an angle the reader sets over nine decades; the third is lifted out of
     their plane by a height the reader sets the same way. Both recursions are
     run on the same inputs, and the orthogonality of each result is measured.

     The classical recursion subtracts every projection from the original
     vector; the modified one subtracts each projection from what is left after
     the previous subtraction. In exact arithmetic the two agree exactly. In
     floating point they do not, and the gap is the point of the laboratory.
     ======================================================================= */
  const B = (() => {
    let st = { logang:0, loglift:-6, step:3, method:'classical' };

    const dot = (a,b)=> a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const nrm = a => Math.sqrt(dot(a,a));
    const sub = (a,b)=> [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
    const mul = (a,c)=> [a[0]*c, a[1]*c, a[2]*c];
    const crs = (a,b)=> [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

    /* The three vectors are built in convenient coordinates and then turned by
       one fixed generic rotation before anything is computed from them. This is
       not decoration. Built axis-aligned, the first subtraction cancels a
       coordinate against itself and comes out exactly zero in floating point,
       so the laboratory would report perfect orthogonality at every setting and
       would be demonstrating a property of the coordinates rather than a
       property of the recursion. Turned off the axes, every component is
       inexact and the cancellation is the real one.

       Rodrigues' formula, about (1,2,3) by 0.7 radians. Nothing depends on
       those numbers beyond their being generic. */
    const AXIS = (() => { const n=[1,2,3]; return mul(n, 1/nrm(n)); })();
    const CA = Math.cos(0.7), SA = Math.sin(0.7);
    function turn(v){
      const c = crs(AXIS, v), d = dot(AXIS, v);
      return [0,1,2].map(i => v[i]*CA + c[i]*SA + AXIS[i]*d*(1-CA));
    }

    /* The three inputs. Both separations are logarithmic because the interesting
       range spans nine decades and a linear slider spends all of itself in the
       part where nothing happens. */
    function inputs(){
      const th = Math.pow(10, st.logang);
      const h  = Math.pow(10, st.loglift);
      const v1 = [1, 0, 0];
      const v2 = [Math.cos(th), Math.sin(th), 0];
      const w  = [Math.cos(th/2), Math.sin(th/2), h];
      const v3 = mul(w, 1/nrm(w));
      return [v1, v2, v3].map(turn);
    }

    /* One recursion, written twice rather than parameterised inside the loop,
       because the difference between the two is exactly one argument and hiding
       it would hide the subject of the laboratory. */
    function gram(V, modified, upto){
      const E = [], res = [], proj = [];
      for(let j=0; j<upto; j++){
        let u = V[j].slice();
        const taken = [];
        for(let i=0; i<E.length; i++){
          const c = modified ? dot(E[i], u) : dot(E[i], V[j]);
          taken.push(mul(E[i], c));
          u = sub(u, mul(E[i], c));
        }
        proj.push(taken);
        const n = nrm(u);
        res.push(n);
        E.push(n > 0 ? mul(u, 1/n) : [0,0,0]);
      }
      return { E, res, proj };
    }

    /* How far the result is from orthonormal: the largest entry of
       |E^T E - I|, which is zero for a perfect answer and of order one for a
       useless one. */
    function defect(E){
      let worst = 0;
      for(let i=0;i<E.length;i++)
        for(let j=0;j<E.length;j++)
          worst = Math.max(worst, Math.abs(dot(E[i],E[j]) - (i===j?1:0)));
      return worst;
    }

    /* An axonometric view: three directions on the page, one per axis. */
    const PX = [1, 0.56, 0], PY = [-0.30, 0.44, 1];
    const flat = v => [ v[0]*PX[0] + v[1]*PX[1] + v[2]*PX[2],
                        v[0]*PY[0] + v[1]*PY[1] + v[2]*PY[2] ];

    function draw(root){
      const V = inputs();
      const modified = st.method === 'modified';
      const g  = gram(V, modified, st.step);
      const gc = gram(V, false, 3);
      const gm = gram(V, true,  3);

      /* ---- the vectors, as they stand after the steps taken so far ---- */
      const ax = P.Axes({w:430,h:308,xr:[-1.45,1.75],yr:[-0.55,1.62],
        pad:{l:26,r:26,t:24,b:26}, xticksOverride:[], yticksOverride:[],
        grid:false, zeroAxes:false, arrows:false});
      [[1,0,0],[0,1,0],[0,0,1]].forEach(e=>{
        const q = flat(mul(e,1.25));
        ax.poly([[0,0],q],{color:P.COL.grid,width:1.2});
      });
      V.forEach((v,i)=>{
        const q = flat(mul(v,0.86));
        ax.poly([[0,0],q],{color:P.COL.in,width:2.2});
        ax.point(q[0],q[1],{color:P.COL.in,r:4});
        if(i === st.step && st.step < 3)
          ax.note(q[0],q[1],'next',{fs:12,color:P.COL.in,anchor:'middle',dy:26});
      });
      /* The pieces being removed at the step just taken, in the operator colour. */
      if(st.step > 0) (g.proj[st.step-1]||[]).forEach(t=>{
        const q = flat(t);
        ax.poly([[0,0],q],{color:P.COL.h,width:3});
        ax.point(q[0],q[1],{color:P.COL.h,r:4});
      });
      g.E.forEach((e,i)=>{
        const q = flat(e);
        ax.poly([[0,0],q],{color:P.COL.out,width:3});
        ax.point(q[0],q[1],{color:P.COL.out,r:5});
        /* The name is set beside its own arrow rather than beyond it. Two
           different directions in space can project onto the same direction on
           the page, so a label pushed out along the arrow lands on whatever
           else happens to point that way; a step sideways cannot. */
        const L = Math.hypot(q[0],q[1]) || 1;
        ax.note(q[0],q[1],'e_{'+(i+1)+'}',{fs:13,color:P.COL.out,dx:-q[1]/L*22,dy:-q[0]/L*22,tex:true});
      });

      /* ---- the defect of both recursions, over the whole slider range ---- */
      /* The horizontal axis counts decades below one radian rather than the
         logarithm itself, so that its zero sits at the left edge. With zero
         inside the range the vertical axis name is drawn from the middle of the
         plot and runs off the right of it. */
      const bx = P.Axes({w:430,h:308,xr:[-0.5,9.5],yr:[0,17.5],
        xlabel:'-\\log_{10}\\theta', ylabel:'\\text{correct digits}',
        pad:{l:60,r:26,t:58,b:46}, xtarget:4, ytarget:5});
      const sweep = (mod) => {
        const pts = [];
        for(let k=-9; k<=0; k+=0.25){
          const th = Math.pow(10,k), h = Math.pow(10, st.loglift);
          const w = [Math.cos(th/2), Math.sin(th/2), h];
          const Vk = [[1,0,0],[Math.cos(th),Math.sin(th),0], mul(w,1/nrm(w))].map(turn);
          const d = defect(gram(Vk, mod, 3).E);
          pts.push([-k, -Math.log10(Math.max(d, 1e-17))]);
        }
        return pts;
      };
      const cPts = sweep(false), mPts = sweep(true);
      bx.poly(cPts,{color:P.COL.err,width:2.4});
      bx.poly(mPts,{color:P.COL.out,width:2.2,dash:'5 4'});
      /* The two names sit in the margin above the frame rather than beside
         their curves. Both curves sweep the whole height of the plot at some
         setting of the two controls, so there is no region inside the frame
         that is reliably empty, and a name that is clear at one setting sits
         on a curve at another. */
      bx.note(5.5, 18.5, 'classical', {fs:12.5,color:P.COL.err});
      bx.note(7.8, 18.5, 'modified',  {fs:12.5,color:P.COL.out});
      bx.vline(-st.logang,{color:P.COL.muted,width:1.3,dash:'3 4'});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;

      const dC = defect(gc.E), dM = defect(gm.E);
      const g12 = g.E.length>1 ? dot(g.E[0],g.E[1]) : 0;
      const g13 = g.E.length>2 ? dot(g.E[0],g.E[2]) : 0;
      const g23 = g.E.length>2 ? dot(g.E[1],g.E[2]) : 0;
      root.querySelector('.ro').innerHTML = `
        <div><dt>⟨e₁|e₂⟩</dt><dd>${fmt(g12,6)}</dd></div>
        <div><dt>⟨e₁|e₃⟩</dt><dd>${fmt(g13,6)}</dd></div>
        <div><dt>⟨e₂|e₃⟩</dt><dd>${fmt(g23,6)}</dd></div>
        <div><dt>Shortest residual ‖u‖</dt><dd>${fmt(Math.min.apply(null, g.res.length?g.res:[0]),6)}</dd></div>
        <div><dt>Defect, classical</dt><dd class="${dC>1e-8?'warnv':'okv'}">${fmt(dC,9)}</dd></div>
        <div><dt>Defect, modified</dt><dd class="${dM>1e-8?'warnv':'okv'}">${fmt(dM,9)}</dd></div>`;

      const verdict = dC > 1e-6
        ? `<div class="note err"><span class="note-h">The answer is not orthonormal any more</span>
             The two inputs are separated by ${T('10^{'+st.logang+'}',false)} radians, so the piece left
             after the subtraction is that small, and rounding error is a large fraction of it. The
             classical recursion is off by ${T(sci(dC),false)} — the vectors it returned are not a
             basis in any useful sense. The modified recursion, on the same inputs, is off by
             ${T(sci(dM),false)}: it subtracts from what is left rather than from the original, so
             the second subtraction sees the error the first one made and removes most of it.</div>`
        : dC > 1e-12
        ? `<div class="note warn"><span class="note-h">Starting to lose digits</span>
             The inputs are close enough together that the subtraction is cancelling most of the
             vector. Nothing is visibly wrong yet, and the defect has already grown to
             ${T(sci(dC),false)} — several orders above the rounding of the inputs. Keep going and
             the curve on the right says where it ends.</div>`
        : `<div class="note ok"><span class="note-h">Well conditioned, and both recursions agree</span>
             The three inputs are comfortably independent, the residuals are of the same size as the
             vectors themselves, and both recursions return an orthonormal set to the last digit a
             double can hold. This is the regime the derivation on the previous page assumes, and it
             is not the regime a real problem arrives in.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg=method]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.val===st.method)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack">
            <div class="plots"></div>
          </div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Recursion <span class="seg">
                <button data-seg="method" data-val="classical">classical</button>
                <button data-seg="method" data-val="modified">modified</button></span></label></div>
              <div class="ctrl"><label>Angle between the first two, 10^ <span class="val" data-out="logang">0</span> rad</label>
                <input type="range" data-v="logang" min="-9" max="0" step="1" value="0"></div>
              <div class="ctrl"><label>Height of the third off their plane, 10^ <span class="val" data-out="loglift">-6</span></label>
                <input type="range" data-v="loglift" min="-9" max="0" step="1" value="-6"></div>
              <div class="ctrl"><label>Steps taken <span class="val" data-out="step">3</span></label>
                <input type="range" data-v="step" min="0" max="3" step="1" value="3"></div>
              ${LABS.KIT.runbar()}
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg=method]'); if(!b) return;
        st.method = b.dataset.val; draw(root); });
      draw(root);
      LABS.KIT.transport(root, { key:'step', max:3, ms:900,
        get:()=>st.step, set:v=>{ st.step=v; }, redraw:()=>draw(root) });
    }};
  })();

  return { A, B };
})());
