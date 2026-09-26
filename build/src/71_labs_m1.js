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
             The mixing angle set ${T('P(0)=\\cos^{2}(\\theta/2)',false)}; the relative phase left it
             alone but set the ${T('X',false)}-basis fringe,
             ${T('P(\\pm)=\\tfrac12\\left[1\\pm\\sin\\theta\\cos\\varphi\\right]',false)}, at a visibility of
             ${T(fmt(vis,3),false)}. The global phase appears in neither expression.</div>`;
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

/* ==========================================================================
   B1 · B2 · B3 — three further laboratories for Module 1.

   B1 · A projector, split and put back together — real states of one qubit,
       the direction a projector keeps, and the length that is lost.
   B2 · One generator, two routes to its rotation — a Pauli generator and an
       angle, the closed form against a truncated matrix exponential.
   B3 · A Hermitian matrix, taken apart and rebuilt — its own eigenvalues and
       projectors, a function of it two ways, and the case where an
       eigenvector is not unique.

   Every number here is computed from the definitions at interaction time.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F, el = LABS.KIT.el;
  const P = PLOT;
  const D2R = Math.PI/180;

  const sci = (v, d=2) => {
    if(!isFinite(v)) return '\\infty';
    if(v === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(v)));
    const m = v / Math.pow(10, e);
    return Math.abs(e) < 4 ? fmt(v, Math.max(0, 4-e))
                           : m.toFixed(d) + '\\times 10^{' + e + '}';
  };

  /* Complex-number helpers, as (re,im) pairs, written from the definitions:
     nothing here calls a library routine that already knows the answer. */
  const cAdd=(u,v)=>[u[0]+v[0],u[1]+v[1]];
  const cSub=(u,v)=>[u[0]-v[0],u[1]-v[1]];
  const cMul=(u,v)=>[u[0]*v[0]-u[1]*v[1], u[0]*v[1]+u[1]*v[0]];
  const cConj=u=>[u[0],-u[1]];
  const cScaleR=(u,r)=>[u[0]*r,u[1]*r];

  /* =======================================================================
     B1 · A PROJECTOR, SPLIT AND PUT BACK TOGETHER

     Two real states of one qubit, both angles measured from |0>:

        |v> = cos(beta/2)|0> + sin(beta/2)|1>      the state being split
        |u> = cos(alpha/2)|0> + sin(alpha/2)|1>    the direction kept

     P = |u><u| keeps the part of |v> along |u>; I-P keeps the rest. The
     laboratory draws both pieces and reports how much of |v>'s own length
     survives being kept, which is the thing a student assumes is unchanged.
     ======================================================================= */
  const B1 = (() => {
    let st = { beta:70, alpha:20 };

    function vecs(){
      const b = st.beta*D2R, a = st.alpha*D2R;
      const v = [Math.cos(b/2), Math.sin(b/2)];
      const u = [Math.cos(a/2), Math.sin(a/2)];
      return { v, u };
    }

    function draw(root){
      const { v, u } = vecs();
      const c = v[0]*u[0] + v[1]*u[1];              /* <u|v>, both real */
      const Pv = [u[0]*c, u[1]*c];                   /* P|v> = <u|v> |u> */
      const Qv = [v[0]-Pv[0], v[1]-Pv[1]];           /* (I-P)|v> */
      const lenPv = Math.hypot(Pv[0],Pv[1]);
      const lenQv = Math.hypot(Qv[0],Qv[1]);
      const rebuilt = [Pv[0]+Qv[0], Pv[1]+Qv[1]];
      const rebuildErr = Math.hypot(rebuilt[0]-v[0], rebuilt[1]-v[1]);
      /* P^2 - P, measured entrywise on the 2x2 real matrix |u><u|. */
      const Pxx=u[0]*u[0], Pxy=u[0]*u[1], Pyx=u[1]*u[0], Pyy=u[1]*u[1];
      const P2xx=Pxx*Pxx+Pxy*Pyx, P2xy=Pxx*Pxy+Pxy*Pyy, P2yx=Pyx*Pxx+Pyy*Pyx, P2yy=Pyx*Pxy+Pyy*Pyy;
      const idemDefect = Math.max(Math.abs(P2xx-Pxx),Math.abs(P2xy-Pxy),Math.abs(P2yx-Pyx),Math.abs(P2yy-Pyy));

      const ax = P.Axes({w:430,h:360,xr:[-0.35,1.45],yr:[-0.35,1.30],
        pad:{l:34,r:24,t:26,b:34}, xticksOverride:[], yticksOverride:[],
        grid:false, zeroAxes:true, arrows:true});
      ax.note(1,0,'|0\\rangle',{fs:14,color:P.COL.muted,anchor:'middle',dy:24,tex:true});
      ax.note(0,1,'|1\\rangle',{fs:14,color:P.COL.muted,dx:12,dy:-6,tex:true});
      ax.poly([[0,0],u],{color:P.COL.h,width:2.2,dash:'5 5'});
      ax.point(u[0],u[1],{color:P.COL.h,r:5});
      ax.note(u[0],u[1],'|u\\rangle',{fs:13,color:P.COL.h,dx:10,dy:-8,tex:true});
      ax.poly([[0,0],v],{color:P.COL.in,width:2.6});
      ax.point(v[0],v[1],{color:P.COL.in,r:6});
      ax.note(v[0],v[1],'|v\\rangle',{fs:14,color:P.COL.in,dx:10,dy:20,tex:true});
      ax.poly([[0,0],Pv],{color:P.COL.out,width:3.2});
      ax.point(Pv[0],Pv[1],{color:P.COL.out,r:6});
      ax.note(Pv[0],Pv[1],'P|v\\rangle',{fs:13,color:P.COL.out,anchor:'end',dx:-10,dy:-10,tex:true});
      ax.poly([[Pv[0],Pv[1]],v],{color:P.COL.mid,width:2.2,dash:'4 4'});
      ax.note((Pv[0]+v[0])/2,(Pv[1]+v[1])/2,'(I-P)|v\\rangle',{fs:12,color:P.COL.mid,dx:10,tex:true});

      const bx = P.Axes({w:430,h:360,xr:[-0.7,2.7],yr:[0,1.12],
        ylabel:'\\text{length}', pad:{l:56,r:24,t:28,b:56}, xticksOverride:[], ytarget:4});
      const bar=(n,val,fill,line)=>{ bx.rect(n-0.28,0,n+0.28,val,{fill}); bx.poly([[n-0.28,val],[n+0.28,val]],{color:line,width:2.4}); };
      bar(0,1,P.COL.dec.in,P.COL.in);
      bar(1,lenPv,P.COL.dec.out,P.COL.out);
      bar(2,lenQv,P.COL.dec.mid,P.COL.mid);
      bx.note(0,-0.10,'\\lVert v\\rVert',{fs:13,color:P.COL.in,anchor:'middle',tex:true});
      bx.note(1,-0.10,'\\lVert P v\\rVert',{fs:13,color:P.COL.out,anchor:'middle',tex:true});
      bx.note(2,-0.10,'\\lVert(I-P)v\\rVert',{fs:12,color:P.COL.mid,anchor:'middle',tex:true});

      root.querySelector('.plots').innerHTML = `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;
      root.querySelector('.ro').innerHTML = `
        <div><dt>⟨u|v⟩</dt><dd>${fmt(c,4)}</dd></div>
        <div><dt>‖Pv‖</dt><dd>${fmt(lenPv,4)}</dd></div>
        <div><dt>‖(I-P)v‖</dt><dd>${fmt(lenQv,4)}</dd></div>
        <div><dt>‖Pv‖²+‖(I-P)v‖²</dt><dd class="okv">${fmt(lenPv*lenPv+lenQv*lenQv,6)}</dd></div>
        <div><dt>Rebuild error ‖Pv+(I-P)v-v‖</dt><dd>${T(sci(rebuildErr),false)}</dd></div>
        <div><dt>Idempotence defect ‖P²-P‖<sub>∞</sub></dt><dd>${T(sci(idemDefect),false)}</dd></div>`;

      const aligned = lenPv > 0.999;
      const verdict = aligned
        ? `<div class="note ok"><span class="note-h">Kept in full only when it was already there</span>
             At ${T('\\alpha=\\beta',false)} the state lies exactly along ${T('|u\\rangle',false)}, so
             ${T('P|v\\rangle',false)} has length one and ${T('(I-P)|v\\rangle',false)} vanishes. Move either
             slider and the kept piece shrinks at once.</div>`
        : `<div class="note warn"><span class="note-h">A projector shortens a state</span>
             ${T('\\lVert Pv\\rVert='+fmt(lenPv,3),false)} is not one, and a student who reads
             ${T('P|v\\rangle',false)} as a new normalised state has thrown away the missing length —
             which is exactly the probability ${T('1-\\lVert Pv\\rVert^{2}='+fmt(1-lenPv*lenPv,3),false)}
             of the other outcome. The two pieces still add back to ${T('|v\\rangle',false)} exactly, and
             ${T('P^{2}=P',false)} to the last digit a double holds.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;
      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>State angle β, degrees <span class="val" data-out="beta">70</span></label>
                <input type="range" data-v="beta" min="0" max="180" step="5" value="70"></div>
              <div class="ctrl"><label>Kept direction α, degrees <span class="val" data-out="alpha">20</span></label>
                <input type="range" data-v="alpha" min="0" max="180" step="5" value="20"></div>
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
     B2 · ONE GENERATOR, TWO ROUTES TO ITS ROTATION

     U(theta) = exp(-i theta G / 2) for G in {X, Y, Z}, computed two ways:
     the closed form cos(theta/2) I - i sin(theta/2) G, and a truncated power
     series sum_{k=0}^{K} (-i theta G/2)^k / k! carried to enough terms that
     the two agree to machine precision except right at the edge of the
     series' own reach. Both are checked against U^dagger U = I.
     ======================================================================= */
  const B2 = (() => {
    let st = { gen:'X', theta:180, terms:8 };
    const GEN = {
      X: [[[0,0],[1,0]], [[1,0],[0,0]]],
      Y: [[[0,0],[0,-1]],[[0,1],[0,0]]],
      Z: [[[1,0],[0,0]], [[0,0],[-1,0]]]
    };
    const mMul = (A,B) => { const C=[[[0,0],[0,0]],[[0,0],[0,0]]];
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){ let re=0, im=0;
        for(let k=0;k<2;k++){ const t=cMul(A[i][k],B[k][j]); re+=t[0]; im+=t[1]; }
        C[i][j]=[re,im]; } return C; };
    const mAdd = (A,B) => [[cAdd(A[0][0],B[0][0]),cAdd(A[0][1],B[0][1])],[cAdd(A[1][0],B[1][0]),cAdd(A[1][1],B[1][1])]];
    const mScale = (A,s) => [[cMul(A[0][0],s),cMul(A[0][1],s)],[cMul(A[1][0],s),cMul(A[1][1],s)]];
    const I2 = [[[1,0],[0,0]],[[0,0],[1,0]]];
    const dagger = A => [[cConj(A[0][0]),cConj(A[1][0])],[cConj(A[0][1]),cConj(A[1][1])]];
    const mSub = (A,B) => [[cSub(A[0][0],B[0][0]),cSub(A[0][1],B[0][1])],[cSub(A[1][0],B[1][0]),cSub(A[1][1],B[1][1])]];
    const mMaxAbs = A => { let m=0; for(let i=0;i<2;i++) for(let j=0;j<2;j++) m=Math.max(m,Math.hypot(A[i][j][0],A[i][j][1])); return m; };

    /* The closed form, from the Pauli algebra derived in the scene above. */
    function closedForm(theta, G){
      const c = Math.cos(theta/2), s = Math.sin(theta/2);
      const negI = [0,-1];
      return mAdd(mScale(I2,[c,0]), mScale(G, cMul(negI,[s,0])));
    }
    /* The power series for exp(-i theta G/2), computed from its own definition
       and not from the closed form the scene derives it from. */
    function seriesForm(theta, G, K){
      const A = mScale(G, cMul([0,-1],[theta/2,0]));   /* -i theta G/2 */
      let term = I2, sum = I2;
      for(let k=1;k<=K;k++){
        term = mScale(mMul(term, A), [1/k, 0]);
        sum = mAdd(sum, term);
      }
      return sum;
    }

    function draw(root){
      const G = GEN[st.gen], th = st.theta*D2R;
      const Uc = closedForm(th, G);
      const Us = seriesForm(th, G, st.terms);
      const diff = mMaxAbs(mSub(Uc, Us));
      const UdU = mMul(dagger(Uc), Uc);
      const unitDefect = mMaxAbs(mSub(UdU, I2));

      /* ---- the two coefficients of the closed form, with the current angle marked ---- */
      const ax = P.Axes({w:430,h:340,xr:[0,4*Math.PI],yr:[-1.5,1.42],
        xlabel:'\\theta', ylabel:'\\text{coefficient}', pad:{l:56,r:24,t:26,b:44}, xtarget:5, ytarget:5});
      ax.curve(t => Math.cos(t/2), {color:P.COL.in, width:2.4});
      ax.curve(t => Math.sin(t/2), {color:P.COL.mid, width:2.0, dash:'5 4'});
      ax.vline(th, {color:P.COL.h, width:1.6, dash:'3 4'});
      /* The vline sweeps the whole width of the frame as theta moves, so both
         names sit in the margin above the curves rather than beside them: a
         label placed at any x inside the data area is on the moving line at
         some setting of the angle slider. */
      ax.note(0.35,-1.16,'\\cos(\\theta/2)',{fs:12.5,color:P.COL.in,anchor:'start',tex:true});
      ax.note(0.35,-1.38,'\\sin(\\theta/2)',{fs:12.5,color:P.COL.mid,anchor:'start',tex:true});

      /* ---- the entrywise gap between the two routes, over the terms kept ---- */
      const bx = P.Axes({w:430,h:340,xr:[0.5,12.5],yr:[0,17.5],
        xlabel:'\\text{terms kept}', ylabel:'\\text{correct digits}', pad:{l:56,r:24,t:26,b:44}, xtarget:6, ytarget:5});
      const pts = []; for(let k=1;k<=12;k++){ const d = mMaxAbs(mSub(Uc, seriesForm(th,G,k))); pts.push([k, -Math.log10(Math.max(d,1e-17))]); }
      bx.poly(pts, {color:P.COL.out, width:2.2});
      pts.forEach(([x,y])=>bx.point(x,y,{color:P.COL.out,r:3.4}));
      bx.vline(st.terms, {color:P.COL.muted, width:1.2, dash:'3 4'});

      root.querySelector('.plots').innerHTML = `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;
      root.querySelector('.ro').innerHTML = `
        <div><dt>Closed form, entry (0,0)</dt><dd>${fmt(Uc[0][0][0],4)} ${Uc[0][0][1]<0?'−':'+'} ${fmt(Math.abs(Uc[0][0][1]),4)}i</dd></div>
        <div><dt>Series (${st.terms} terms), entry (0,0)</dt><dd>${fmt(Us[0][0][0],4)} ${Us[0][0][1]<0?'−':'+'} ${fmt(Math.abs(Us[0][0][1]),4)}i</dd></div>
        <div><dt>Max entrywise gap, closed vs. series</dt><dd>${T(sci(diff),false)}</dd></div>
        <div><dt>Unitarity defect ‖U†U-I‖<sub>∞</sub></dt><dd class="${unitDefect>1e-8?'warnv':'okv'}">${T(sci(unitDefect),false)}</dd></div>`;

      /* Near an odd multiple of 360 degrees, U is close to -I: a full turn of
         the generator, not a return to the identity. */
      const nearestOddTurn = Math.round((st.theta - 360) / 720) * 2 + 1;
      const nearFull = Math.abs(st.theta - 360*nearestOddTurn) < 2;
      const verdict = nearFull
        ? `<div class="note warn"><span class="note-h">A full turn is minus the identity, not the identity</span>
             At ${T('\\theta\\approx 2\\pi',false)} the closed form gives ${T('\\cos(\\pi)=-1',false)} and
             ${T('\\sin(\\pi)=0',false)}, so ${T('U='+ '-I',false)}. On the whole state that minus sign is a
             global phase and changes nothing; on one branch of a superposition it is a relative phase and
             changes everything, which is the double cover the Bloch sphere makes formal in Chapter 4.
             The series needs only ${T(String(st.terms),false)} terms to match it to
             ${T(sci(diff),false)}.</div>`
        : `<div class="note ok"><span class="note-h">Two routes to the same matrix</span>
             The closed form ${T('\\cos(\\theta/2)I-i\\sin(\\theta/2)G',false)} and the power series it is a
             resummation of agree to ${T(sci(diff),false)} after ${T(String(st.terms),false)} terms, and both
             satisfy ${T('U^{\\dagger}U=I',false)} to ${T(sci(unitDefect),false)}. Neither route reads the
             other's answer off a table.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;
      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg=gen]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.val===st.gen)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Generator <span class="seg">
                <button data-seg="gen" data-val="X">X</button>
                <button data-seg="gen" data-val="Y">Y</button>
                <button data-seg="gen" data-val="Z">Z</button></span></label></div>
              <div class="ctrl"><label>Angle θ, degrees <span class="val" data-out="theta">180</span></label>
                <input type="range" data-v="theta" min="0" max="1440" step="5" value="180"></div>
              <div class="ctrl"><label>Series terms kept <span class="val" data-out="terms">8</span></label>
                <input type="range" data-v="terms" min="1" max="12" step="1" value="8"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg=gen]'); if(!b) return;
        st.gen = b.dataset.val; draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     B3 · A HERMITIAN MATRIX, TAKEN APART AND REBUILT

     A = [[a, b-ic],[b+ic, d]], Hermitian for any real a,b,c,d. The lab finds
     its own eigenvalues and eigenvectors from the definition, rebuilds A as
     sum lambda_k P_k, and evaluates f(A) = exp(-iAt) two ways: through the
     spectral decomposition, and through a direct truncated power series of
     the matrix itself. At b=c=0, a=d the matrix is proportional to I, every
     vector is an eigenvector, and the two projectors the lab reports are one
     arbitrary orthonormal pair rather than an invariant.
     ======================================================================= */
  const B3 = (() => {
    const T_FIXED = 0.7;
    let st = { a:2, d:2, b:1, c:0 };

    const mMul = (A,B) => { const C=[[[0,0],[0,0]],[[0,0],[0,0]]];
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){ let re=0, im=0;
        for(let k=0;k<2;k++){ const t=cMul(A[i][k],B[k][j]); re+=t[0]; im+=t[1]; }
        C[i][j]=[re,im]; } return C; };
    const mAdd = (A,B) => [[cAdd(A[0][0],B[0][0]),cAdd(A[0][1],B[0][1])],[cAdd(A[1][0],B[1][0]),cAdd(A[1][1],B[1][1])]];
    const mScale = (A,s) => [[cMul(A[0][0],s),cMul(A[0][1],s)],[cMul(A[1][0],s),cMul(A[1][1],s)]];
    const mSub = (A,B) => [[cSub(A[0][0],B[0][0]),cSub(A[0][1],B[0][1])],[cSub(A[1][0],B[1][0]),cSub(A[1][1],B[1][1])]];
    const I2 = [[[1,0],[0,0]],[[0,0],[1,0]]];
    const mMaxAbs = A => { let m=0; for(let i=0;i<2;i++) for(let j=0;j<2;j++) m=Math.max(m,Math.hypot(A[i][j][0],A[i][j][1])); return m; };
    const outer = (u) => { /* |u><u| for a complex 2-vector u */
      return [[cMul(u[0],cConj(u[0])), cMul(u[0],cConj(u[1]))],
              [cMul(u[1],cConj(u[0])), cMul(u[1],cConj(u[1]))]];
    };

    /* A closed-form 2x2 Hermitian eigensolver, from the characteristic
       equation lambda^2 - (a+d) lambda + (ad - |z|^2) = 0 with z = b+ic. */
    function eigH(){
      const { a, d, b, c } = st;
      const tr = a+d, z2 = b*b+c*c, det = a*d - z2;
      const disc = Math.max(0, tr*tr - 4*det);
      const gap = Math.sqrt(disc);
      const l1 = (tr+gap)/2, l2 = (tr-gap)/2;
      /* Degenerate: a=d and z=0. Any orthonormal pair works; report the
         computational basis rather than a division by zero. */
      if(gap < 1e-12 && Math.hypot(b,c) < 1e-12){
        return { l1:a, l2:d, e1:[[1,0],[0,0]], e2:[[0,0],[1,0]], degenerate:true };
      }
      /* Eigenvector for l1 from (A - l1 I): row 0 gives (a-l1) x + (b-ic) y = 0,
         so (x,y) is proportional to (b-ic, l1-a) whenever the off-diagonal is
         non-zero; otherwise the matrix is already diagonal in this basis. */
      let v1;
      if(Math.hypot(b,c) > 1e-9) v1 = [[b,-c], [l1-a,0]];
      else v1 = (l1===a) ? [[1,0],[0,0]] : [[0,0],[1,0]];
      const norm1 = Math.sqrt(v1[0][0]**2+v1[0][1]**2+v1[1][0]**2+v1[1][1]**2);
      const e1 = [cScaleR(v1[0],1/norm1), cScaleR(v1[1],1/norm1)];
      /* e2 orthogonal to e1: (-e1_1^*, e1_0^*) up to phase, which is a valid
         second eigenvector because the matrix is Hermitian and 2x2. */
      const e2 = [cScaleR(cConj(e1[1]),1), cScaleR(cConj(e1[0]),-1)];
      return { l1, l2, e1, e2, degenerate:false };
    }

    function draw(root){
      const { a, d, b, c } = st;
      const t = T_FIXED;
      const A = [[[a,0],[b,-c]],[[b,c],[d,0]]];
      const { l1, l2, e1, e2, degenerate } = eigH();
      const P1 = outer(e1), P2 = outer(e2);
      const rebuilt = mAdd(mScale(P1,[l1,0]), mScale(P2,[l2,0]));
      const rebuildDefect = mMaxAbs(mSub(rebuilt, A));

      /* f(A) = exp(-iAt): spectral route. */
      const fSpec = mAdd(mScale(P1,[Math.cos(l1*t),-Math.sin(l1*t)]), mScale(P2,[Math.cos(l2*t),-Math.sin(l2*t)]));
      /* Direct route: a truncated power series of exp(-iAt) built from A itself. */
      const iAt = mScale(A, cMul([0,-1],[t,0]));
      let term = I2, series = I2;
      for(let k=1;k<=14;k++){ term = mScale(mMul(term, iAt), [1/k,0]); series = mAdd(series, term); }
      const fnDiff = mMaxAbs(mSub(fSpec, series));

      /* ---- the eigenvalues on the real axis, and A's diagonal for scale ---- */
      const ax = P.Axes({w:430,h:300,xr:[Math.min(-1,l1-1,l2-1),Math.max(1,l1+1,l2+1)],yr:[-1.4,1.4],
        xlabel:'\\operatorname{Re}\\lambda', ylabel:'\\operatorname{Im}\\lambda', pad:{l:56,r:24,t:28,b:44}, xtarget:5, ytarget:4});
      ax.point(l1,0,{color:P.COL.h,r:7});
      ax.note(l1,0.18,'\\lambda_{1}',{fs:13,color:P.COL.h,anchor:'middle',tex:true});
      ax.point(l2,0,{color:P.COL.out,r:7});
      ax.note(l2,0.18,'\\lambda_{2}',{fs:13,color:P.COL.out,anchor:'middle',tex:true});
      if(degenerate) ax.note((l1+l2)/2,-0.9,'\\lambda_{1}=\\lambda_{2}: \\text{ every direction is an eigenvector}',{fs:11.5,color:P.COL.muted,anchor:'middle',tex:true});

      /* ---- f(A) evaluated on the unit circle, spectral route ---- */
      const bx = P.Axes({w:430,h:300,xr:[-1.5,1.5],yr:[-1.35,1.35],
        xlabel:'\\operatorname{Re}', ylabel:'\\operatorname{Im}', pad:{l:56,r:24,t:28,b:44}, xtarget:4, ytarget:4});
      const ring=[]; for(let i=0;i<=180;i++){ const th=2*Math.PI*i/180; ring.push([Math.cos(th),Math.sin(th)]); }
      bx.poly(ring,{color:P.COL.grid,width:1.2});
      const f1 = [Math.cos(l1*t), -Math.sin(l1*t)], f2=[Math.cos(l2*t), -Math.sin(l2*t)];
      bx.point(f1[0],f1[1],{color:P.COL.h,r:6});
      bx.point(f2[0],f2[1],{color:P.COL.out,r:6});
      bx.note(f1[0],f1[1],'e^{-i\\lambda_{1}t}',{fs:12,color:P.COL.h,dx:10,dy:-8,tex:true});
      bx.note(f2[0],f2[1],'e^{-i\\lambda_{2}t}',{fs:12,color:P.COL.out,dx:10,dy:16,tex:true});

      root.querySelector('.plots').innerHTML = `<div class="labgrid">${ax.svg()}${bx.svg()}</div>`;
      root.querySelector('.ro').innerHTML = `
        <div><dt>λ₁, λ₂</dt><dd>${fmt(l1,4)}, ${fmt(l2,4)}</dd></div>
        <div><dt>Rebuild defect ‖ΣλₖPₖ − A‖<sub>∞</sub></dt><dd class="${rebuildDefect>1e-8?'warnv':'okv'}">${T(sci(rebuildDefect),false)}</dd></div>
        <div><dt>f(A) gap, spectral vs. series</dt><dd class="${fnDiff>1e-6?'warnv':'okv'}">${T(sci(fnDiff),false)}</dd></div>`;

      const verdict = degenerate
        ? `<div class="note warn"><span class="note-h">A repeated eigenvalue has no invariant eigenvector</span>
             ${T('A=aI',false)} here, so every state is an eigenvector of ${T(fmt(a,3),false)}. The pair
             ${T('e_1,e_2',false)} shown is one arbitrary orthonormal choice, not a property of ${T('A',false)}.</div>`
        : `<div class="note ok"><span class="note-h">Taken apart and put back together exactly</span>
             ${T('A=\\lambda_{1}P_{1}+\\lambda_{2}P_{2}',false)} rebuilds ${T('A',false)} to
             ${T(sci(rebuildDefect),false)}, and the two routes to ${T('e^{-iAt}',false)} agree to
             ${T(sci(fnDiff),false)}.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;
      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Diagonal a <span class="val" data-out="a">2</span></label>
                <input type="range" data-v="a" min="-3" max="3" step="0.5" value="2"></div>
              <div class="ctrl"><label>Diagonal d <span class="val" data-out="d">2</span></label>
                <input type="range" data-v="d" min="-3" max="3" step="0.5" value="2"></div>
              <div class="ctrl"><label>Off-diagonal, real part b <span class="val" data-out="b">1</span></label>
                <input type="range" data-v="b" min="-3" max="3" step="0.5" value="1"></div>
              <div class="ctrl"><label>Off-diagonal, imaginary part c <span class="val" data-out="c">0</span></label>
                <input type="range" data-v="c" min="-3" max="3" step="0.5" value="0"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseFloat(e.target.value); draw(root); });
      draw(root);
    }};
  })();

  return { B1, B2, B3 };
})());
