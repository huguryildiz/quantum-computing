/* ==========================================================================
   Module 5 laboratories.

   I · Teleportation, stepped — the reader chooses the state to send with two
       angles and then walks the protocol one stage at a time. The left panel
       is Bob's qubit as a point of the Bloch ball at that stage, and the
       right panel is the fidelity of what Bob ends up holding, against the
       tilt of the input, for three different things Bob might do with the two
       classical bits. The point of the laboratory is the middle stage: after
       Alice has measured and before the bits arrive, Bob's point sits exactly
       at the centre of the ball whatever was sent, and it stays there.
   J · Grover, and the overshoot — the reader chooses how many candidates
       there are and how many of them are marked, and then steps the
       iterations. The left panel is the two-dimensional plane the algorithm
       lives in, with the state drawn where it actually is; the right panel is
       the success probability against the iteration count. The point is that
       the curve comes back down, and that at twice the optimum it is back
       where it started.

   Both compute from the definitions at interaction time. Laboratory I builds
   the three-qubit state as eight complex amplitudes and applies the gates to
   it one at a time; the branch is a projection followed by a renormalisation,
   and Bob's state is a partial trace taken over the two qubits Alice holds.
   Laboratory J performs the two reflections as reflections rather than
   quoting the closed form for the angle. Nothing in either file is tabulated.

   The Bloch ball may be turned. It is drawn through an orthographic camera
   in an isotropic frame, so the rim is a true circle at every viewpoint and
   the length of a vector can be read against it however far the ball has been
   turned. The camera opens at the view the fixed oblique drawing of chapter 4
   gave, so the figure looks as it always did until the reader drags it; the
   camera itself, and why the poles stay put, are written down in
   `70_labs.js`.

   The plane of laboratory J is isotropic for a sharper reason: the whole
   argument of the scene beside it is that one iteration turns the state by
   exactly two theta, and an anisotropic frame would draw that angle as
   something else.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F, KIT = LABS.KIT;
  const P = PLOT;
  const D2R = Math.PI/180;

  /* ---- the smallest complex arithmetic that will do ----------------------
     A complex number is [re, im]. A three-qubit state is a flat array of eight
     of them, indexed x = 4q2 + 2q1 + q0, which is the ordering the whole
     course fixes: qubit k is bit k of the index. */
  const cx  = (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
  const cad = (a,b) => [a[0]+b[0], a[1]+b[1]];
  const csb = (a,b) => [a[0]-b[0], a[1]-b[1]];
  const cj  = a      => [a[0], -a[1]];
  const ph  = t      => [Math.cos(t), Math.sin(t)];
  const sc  = (r,a)  => [r*a[0], r*a[1]];
  const ab2 = a      => a[0]*a[0] + a[1]*a[1];

  /* A Bloch component that comes out as 5.5e-17 is a zero with rounding on
     top, and the number formatter prints the exponent rather than the zero.
     Snapping below the last digit shown is honest; snapping any higher would
     hide a value that is genuinely small. */
  const z0 = v => Math.abs(v) < 1e-12 ? 0 : v;

  /* =======================================================================
     I · TELEPORTATION, STEPPED

     Three qubits, |q2 q1 q0>. Alice owns q0, which carries the unknown state,
     and q1, which is her half of the pair. Bob owns q2.

     The circuit is exactly the one the scene draws:

        H on q1,  CNOT from q1 to q2      -- distribute the pair
        CNOT from q0 to q1,  H on q0      -- rotate into the Bell basis
        measure q0 and q1                 -- two classical bits m0 and m1
        X^{m1} then Z^{m0} on q2          -- the correction those bits choose

     Every gate below is applied to the eight amplitudes by hand, so the four
     branches and their probabilities are computed rather than quoted.
     ======================================================================= */
  const I = (() => {
    /* `az` and `el` are the camera, and they sit in the same object as the
       rest of the state because they are state: a drag changes what the
       figure shows and nothing else about the laboratory. */
    let st = { theta:60, phi:30, stage:'corr', branch:0, fix:'bits',
               az:KIT.CAM0.az, el:KIT.CAM0.el };
    const STAGES = ['pair','sent','arrived','corr'];
    const SNAME = { pair:'the pair is shared',
                    sent:'Alice has measured; the bits are travelling',
                    arrived:'the bits have arrived: this branch',
                    corr:'the correction has been applied' };
    const FIXES = ['bits','none','always'];
    const FNAME = { bits:'as the two bits say', none:'no correction at all',
                    always:'always Z, whatever the bits say' };

    const zero8 = () => { const v=[]; for(let i=0;i<8;i++) v.push([0,0]); return v; };
    /* A Hadamard on qubit q: pair up the indices that differ in bit q. */
    function hOn(v,q){
      const R2 = Math.SQRT1_2, w = v.slice();
      for(let x=0;x<8;x++){
        if((x>>q)&1) continue;
        const y = x | (1<<q);
        w[x] = sc(R2, cad(v[x],v[y]));
        w[y] = sc(R2, csb(v[x],v[y]));
      }
      return w;
    }
    /* A CNOT with the named control and target: exchange the two amplitudes
       that differ in the target bit, wherever the control bit is one. */
    function cnotOn(v,c,t){
      const w = v.slice();
      for(let x=0;x<8;x++){
        if(!((x>>c)&1)) continue;
        if((x>>t)&1) continue;
        const y = x | (1<<t);
        w[x] = v[y]; w[y] = v[x];
      }
      return w;
    }

    /* The three states the circuit passes through, for the chosen input. */
    function run(theta, phi){
      const t = theta*D2R, f = phi*D2R;
      let v = zero8();
      v[0] = [Math.cos(t/2), 0];                       /* alpha on q0 = 0 */
      v[1] = cx(ph(f), [Math.sin(t/2), 0]);            /* beta  on q0 = 1 */
      const pair = cnotOn(hOn(v,1), 1, 2);
      const sent = hOn(cnotOn(pair, 0, 1), 0);
      return { pair, sent };
    }

    /* Bob's density operator: trace out q0 and q1, which is a sum over the
       four values of the two bits Alice holds. */
    function rhoB(v){
      const r = [[0,0],[0,0],[0,0],[0,0]];             /* row-major 2 by 2 */
      for(let a=0;a<2;a++) for(let b=0;b<2;b++){
        let s = [0,0];
        for(let k=0;k<4;k++) s = cad(s, cx(v[4*a+k], cj(v[4*b+k])));
        r[2*a+b] = s;
      }
      return r;
    }
    /* Bob's two amplitudes in one branch, renormalised. The branch has weight
       one quarter, so the factor is two. */
    function branchState(v, m0, m1){
      const k = 2*m1 + m0;
      const b0 = v[k], b1 = v[4+k];
      const n = Math.sqrt(ab2(b0) + ab2(b1));
      return n < 1e-12 ? [[0,0],[0,0]] : [sc(1/n,b0), sc(1/n,b1)];
    }
    const branchProb = (v,m0,m1) => { const k=2*m1+m0; return ab2(v[k]) + ab2(v[4+k]); };

    const XG = u => [u[1], u[0]];
    const ZG = u => [u[0], sc(-1,u[1])];
    /* What Bob does with the bits, in the order the scene fixes: X first,
       then Z, so the operator is Z^{m0} X^{m1}. */
    function correct(u, m0, m1, how){
      if(how === 'none')   return u;
      if(how === 'always') return ZG(u);
      let w = m1 ? XG(u) : u;
      return m0 ? ZG(w) : w;
    }

    /* The Bloch vector of a pure two-component state, from its definition.
       The y component is 2 Im(a* b): |{+}i> must come out at r_y = +1. */
    function blochOf(u){
      const s = cx(cj(u[0]), u[1]);
      return [ z0(2*s[0]), z0(2*s[1]),
               z0(ab2(u[0]) - ab2(u[1])) ];
    }
    /* r_y = Tr(rho Y) = i(rho_{01} - rho_{10}) = -2 Im(rho_{01}), and the minus
       sign is the whole content of this line. The test that catches it is
       |{+}i>, whose density operator has rho_{01} = -i/2 and whose r_y is +1.
       With the sign wrong, Bob's point and the input's point disagree in y and
       nothing on the page says so. */
    const blochRho = r => [ z0(2*r[1][0]), z0(-2*r[1][1]), z0(r[0][0] - r[3][0]) ];
    const purityRho = r => r[0][0]**2 + r[3][0]**2 + 2*(r[1][0]**2 + r[1][1]**2);

    /* The state that was sent, as a pure column, for the fidelity. */
    function input(theta, phi){
      const t = theta*D2R, f = phi*D2R;
      return [[Math.cos(t/2),0], cx(ph(f),[Math.sin(t/2),0])];
    }
    const fidPure = (u,w) => ab2(cad(cx(cj(u[0]),w[0]), cx(cj(u[1]),w[1])));

    /* What Bob holds at the chosen stage, as a density operator. */
    function bobAt(theta, phi, stage, branch, how){
      const R = run(theta, phi);
      if(stage === 'pair') return { rho: rhoB(R.pair), pure:null };
      if(stage === 'sent') return { rho: rhoB(R.sent), pure:null };
      const m0 = branch & 1, m1 = (branch >> 1) & 1;
      let u = branchState(R.sent, m0, m1);
      if(stage === 'corr') u = correct(u, m0, m1, how);
      const r = [[ab2(u[0]),0], cx(u[0],cj(u[1])), cx(u[1],cj(u[0])), [ab2(u[1]),0]];
      return { rho:r, pure:u };
    }

    /* The fidelity Bob ends up with, as a function of the input tilt, for one
       of the three things he might do. Computed by running the whole circuit
       again at that tilt, not by a formula. */
    function fidCurve(deg, phi, branch, how){
      const m0 = branch & 1, m1 = (branch >> 1) & 1;
      const R = run(deg, phi);
      const u = correct(branchState(R.sent, m0, m1), m0, m1, how);
      return fidPure(input(deg, phi), u);
    }

    /* Isotropic: 300 px over a span of 3.00 on both axes, so 100 px to the
       unit either way and the rim is a circle. */
    const ball = () => P.Axes({w:360,h:360,xr:[-1.5,1.5],yr:[-1.5,1.5],
      pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
      grid:false, zeroAxes:false, arrows:false});

    /* The frame the ball is drawn in, as it looks from the camera `V`.

       The rim is a true circle at every viewpoint, because that is what the
       orthographic projection of a sphere is, so the length of a Bloch vector
       can be read against it however far the ball has been turned.

       The equator is the ellipse the horizontal great circle projects to, drawn
       solid over the half nearer the reader and dashed over the half behind.
       The depth of the equator at angle t is cos(el) cos(t - az), so the near
       half is exactly t in (az - 90, az + 90) and the two arcs are written down
       rather than sampled and sorted.

       All three axes are drawn end to end. Before the ball could be turned the
       y axis was drawn as a half only, which reads as depth in one fixed view
       and as a missing line in every other. */
    function frame(a, V){
      const pj = V.p, L = 1.22;
      const rim=[]; for(let i=0;i<=220;i++){ const s=2*Math.PI*i/220;
        rim.push([Math.cos(s),Math.sin(s)]); }
      a.poly(rim,{color:P.COL.grid,width:1.5});
      const arc = (t0,t1) => { const e=[]; for(let i=0;i<=110;i++){
        const t = t0 + (t1-t0)*i/110; e.push(pj(Math.cos(t),Math.sin(t),0)); } return e; };
      const A = V.az*D2R, Q = Math.PI/2;
      a.poly(arc(A+Q, A+3*Q),{color:P.COL.rule,width:1.0,dash:'4 4'});
      a.poly(arc(A-Q, A+Q),  {color:P.COL.rule,width:1.4});
      a.poly([pj(0,0,-L),pj(0,0,L)],{color:P.COL.rule,width:1.1});
      a.poly([pj(-L,0,0),pj(L,0,0)],{color:P.COL.rule,width:1.1});
      a.poly([pj(0,-L,0),pj(0,L,0)],{color:P.COL.rule,width:1.1});
      /* All four names sit just beyond the rim on their own axes, each pushed
         clear of its line on the side the line is not on.

         A name is dropped as soon as its axis has turned towards the reader far
         enough to be drawn shorter than four fifths of the rim. An axis pointing
         at the reader projects to a stub near the centre of the picture, and a
         name left at the edge of the frame then labels a piece of the rim
         instead of the axis it belongs to. That rule is what takes |0> and |1>
         off the picture when the ball is turned to look down the z axis, and it
         is why y is unnamed at the view the figure opens in — which is the view
         this course has always drawn, so the picture opens labelled exactly as
         it was. */
      const tag = (q, s) => { if(Math.hypot(q[0],q[1]) < 0.80) return;
        a.note(q[0], q[1], s, {fs:12.5, color:P.COL.muted, tex:true,
          anchor: q[0] > 0.25 ? 'start' : q[0] < -0.25 ? 'end' : 'middle',
          dx: q[0] > 0.25 ? 5 : q[0] < -0.25 ? -5 : 0,
          dy: q[1] < 0 ? 15 : -5}); };
      tag(pj(0,0, 1.32),'|0\\rangle');
      tag(pj(0,0,-1.32),'|1\\rangle');
      tag(pj(1.32,0,0),'x');
      tag(pj(0,1.32,0),'y');
      /* A control nobody can see is a control that teaches nothing. The corner
         is the one part of this frame no rim, axis or state vector reaches. */
      a.note(-1.45,-1.40,'drag to turn',{fs:11.5,color:P.COL.muted});
      return a;
    }

    function draw(root){
      const R = run(st.theta, st.phi);
      const bob = bobAt(st.theta, st.phi, st.stage, st.branch, st.fix);
      const rb = blochRho(bob.rho);
      const psi = input(st.theta, st.phi);
      const rin = blochOf(psi);
      const pur = purityRho(bob.rho);
      const m0 = st.branch & 1, m1 = (st.branch >> 1) & 1;
      const pbr = branchProb(R.sent, m0, m1);
      /* F = <psi| rho |psi>, written out for a two-by-two rho. */
      const fid = (() => {
        const r = bob.rho, u = psi;
        const t0 = cad(cx(r[0],u[0]), cx(r[1],u[1]));
        const t1 = cad(cx(r[2],u[0]), cx(r[3],u[1]));
        return cad(cx(cj(u[0]),t0), cx(cj(u[1]),t1))[0];
      })();

      /* ---- the ball: the input state, and Bob's qubit ---- */
      const V = KIT.cam(st.az, st.el), pj = V.p;
      const a = frame(ball(), V);
      const qi = pj(rin[0],rin[1],rin[2]);
      a.poly([[0,0],qi],{color:P.COL.in,width:1.6,dash:'4 4'});
      a.point(qi[0],qi[1],{color:P.COL.in,r:5});
      a.note(qi[0],qi[1],'|\\psi\\rangle',{fs:12.5,color:P.COL.in,dx:-8,dy:-8,anchor:'end',tex:true});
      const len = Math.hypot(rb[0],rb[1],rb[2]);
      if(len < 1e-9){
        a.point(0,0,{color:P.COL.err,r:8});
        a.note(0,-0.20,'I/2',{fs:13,color:P.COL.err,anchor:'middle',tex:true});
      } else {
        const qb = pj(rb[0],rb[1],rb[2]);
        a.poly([[0,0],qb],{color:P.COL.out,width:2.8});
        a.point(qb[0],qb[1],{color:P.COL.out,r:6.5});
        a.note(qb[0],qb[1],'\\text{Bob}',{fs:12.5,color:P.COL.out,dx:10,dy:14,tex:true});
      }

      /* ---- the fidelity against the input tilt, for the three choices ---- */
      /* The frame reaches past one so the three names sit in a band no
         fidelity can enter. A name laid on a curve is a collision. */
      const b = P.Axes({w:430,h:310,xr:[0,180],yr:[0,1.34],
        xlabel:'\\theta\\,(\\text{degrees})', ylabel:'F',
        pad:{l:62,r:24,t:30,b:46}, xtarget:4,
        yticksOverride:[0,0.25,0.5,0.75,1]});
      b.curve(d => fidCurve(d, st.phi, st.branch, 'bits'), {color:P.COL.out,width:2.6,n:180});
      b.curve(d => fidCurve(d, st.phi, st.branch, 'always'), {color:P.COL.h,width:2.2,n:180});
      b.hline(0.5,{color:P.COL.err,width:2.0,dash:'5 4'});
      b.vline(st.theta,{color:P.COL.rule,width:1.4,dash:'3 4'});
      b.note(3,1.24,'\\text{as the bits say}',{fs:12,color:P.COL.out,tex:true});
      b.note(66,1.24,'\\text{no correction}',{fs:12,color:P.COL.err,tex:true});
      b.note(134,1.24,'\\text{always }Z',{fs:12,color:P.COL.h,tex:true});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${KIT.orbitBox(a.svg())}${b.svg()}</div>`;

      const good = fid > 1 - 1e-9;
      root.querySelector('.ro').innerHTML = `
        <div style="grid-column:1/-1"><dt>Stage</dt><dd>${SNAME[st.stage]}</dd></div>
        <div><dt>Sent</dt><dd>${T('\\theta='+st.theta+'^{\\circ},\\ \\varphi='+st.phi+'^{\\circ}',false)}</dd></div>
        <div><dt>Branch</dt><dd>${T('m_{1}m_{0}='+m1+m0,false)}</dd></div>
        <div><dt>Branch probability</dt><dd>${fmt(pbr,4)}</dd></div>
        <div><dt>Correction</dt><dd>${FNAME[st.fix]}</dd></div>
        <div><dt>Bob's vector</dt><dd>${fmt(rb[0],3)}, ${fmt(rb[1],3)}, ${fmt(rb[2],3)}</dd></div>
        <div><dt>Length</dt><dd>${fmt(len,4)}</dd></div>
        <div><dt>Purity</dt><dd>${fmt(pur,4)}</dd></div>
        <div><dt>Fidelity with what was sent</dt><dd class="${good?'okv':'warnv'}">${fmt(fid,4)}</dd></div>`;

      const mixed = len < 1e-9;
      const verdict = mixed
        ? `<div class="note warn"><span class="note-h">Bob holds ${T('I/2',false)}, and it does not depend on what was sent</span>
             Turn either input dial as far as you like: the point stays at the centre of the ball.
             Every branch has probability one quarter for every input, so the average over the four
             branches is the same operator whatever ${T('|\\psi\\rangle',false)} was. Nothing has
             reached Bob yet, and nothing will until two classical bits do.</div>`
        : st.fix === 'none'
        ? `<div class="note warn"><span class="note-h">The branch is known and the correction was skipped</span>
             Bob is holding ${T('X^{m_{1}}Z^{m_{0}}|\\psi\\rangle',false)}, which is a perfectly
             good pure state and, in three of the four branches, the wrong one. The fidelity read
             above is what he has; averaged over the four branches it is exactly one half, which is
             the dashed line on the right panel and is what no correction is worth.</div>`
        : st.fix === 'always'
        ? `<div class="note err"><span class="note-h">One fixed correction cannot serve four branches</span>
             Applying ${T('Z',false)} regardless of the bits repairs branch ${T('m_{1}m_{0}=01',false)}
             and damages the other three. Watch the amber curve on the right: at some tilts it reaches
             one and at others it reaches zero, so the error is not small — it is a completely
             different state. The table has four rows because four are needed.</div>`
        : good
        ? `<div class="note ok"><span class="note-h">The state arrived, exactly</span>
             The two bits selected one of four corrections and the fidelity is one. Nothing about
             ${T('\\theta',false)} or ${T('\\varphi',false)} was ever measured, sent or known by
             anybody: the bits named an operation, not a state. One shared pair and two classical
             bits, and the original on ${T('q_{0}',false)} is gone.</div>`
        : `<div class="note warn"><span class="note-h">Not yet what was sent</span>
             The fidelity is ${T(fmt(fid,4),false)}. Step to the last stage, with the correction set
             to follow the bits, and it becomes one.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-stage]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.stage===st.stage)));
      root.querySelectorAll('[data-prop]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.prop===st.fix)));
      root.querySelectorAll('[data-seg="branch"]').forEach(x=>
        x.setAttribute('aria-pressed', String(String(st.branch)===x.dataset.val)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Tilt θ of the state sent, degrees <span class="val" data-out="theta">60</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="60"></div>
              <div class="ctrl"><label>Phase φ of the state sent, degrees <span class="val" data-out="phi">30</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="15" value="30"></div>
              <div class="ctrl"><label>Stage of the protocol <span class="seg">
                ${STAGES.map(s=>`<button data-stage="${s}">${SNAME[s]}</button>`).join('')}
                </span></label></div>
              <div class="ctrl"><label>Which branch Alice read <span class="seg">
                ${[0,1,2,3].map(k=>`<button data-seg="branch" data-val="${k}">${(k>>1)&1}${k&1}</button>`).join('')}
                </span></label></div>
              <div class="ctrl"><label>What Bob does with the bits <span class="seg">
                ${FIXES.map(f=>`<button data-prop="${f}">${FNAME[f]}</button>`).join('')}
                </span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{
        const s = e.target.closest('[data-stage]');
        if(s){ st.stage = s.dataset.stage; draw(root); return; }
        const f = e.target.closest('[data-prop]');
        if(f){ st.fix = f.dataset.prop; draw(root); return; }
        const b = e.target.closest('[data-seg="branch"]');
        if(b){ st.branch = parseInt(b.dataset.val,10); draw(root); }
      });
      KIT.orbit(root, st, ()=>draw(root));
      draw(root);
    }};
  })();

  /* =======================================================================
     J · GROVER, AND THE OVERSHOOT

     The whole algorithm lives in the plane spanned by the even mixture of the
     marked candidates and the even mixture of the rest, so the state is two
     real numbers and the iteration is two reflections of the plane.

     Both reflections are performed here as reflections rather than replaced
     by the closed form for the angle. The success probability the readout
     prints is the square of a component that was reached by reflecting, so
     the agreement with sin^2((2r+1)theta) is a result of the laboratory
     rather than an assumption in it.
     ======================================================================= */
  const J = (() => {
    let st = { n:10, m:1, r:0 };
    const MS = [1,2,4,8];

    const size  = () => Math.pow(2, st.n);
    const theta = () => Math.asin(Math.sqrt(st.m / size()));

    /* The state after r iterations, as (cG, cB), by reflecting twice each
       time. The oracle reflects in the |B> axis; the diffusion reflects in
       the starting vector. */
    function after(r){
      const th = theta();
      const s = [Math.sin(th), Math.cos(th)];
      let v = [s[0], s[1]];
      for(let k=0;k<r;k++){
        v = [-v[0], v[1]];                               /* the phase oracle */
        const d = 2*(s[0]*v[0] + s[1]*v[1]);
        v = [d*s[0] - v[0], d*s[1] - v[1]];              /* the diffusion */
      }
      return v;
    }
    const psucc = r => after(r)[0]**2;
    /* The optimum, as a real number and as the whole number nearest to it. */
    const rStar = () => Math.PI/(4*theta()) - 0.5;
    const rBest = () => Math.max(0, Math.round(rStar()));

    /* Isotropic: 340 px over an x span of 2.125 and 240 px over a y span of
       1.50, both exactly 160 px to the unit, so the turn of 2 theta is drawn
       at its true size and a reflection looks like one. */
    const plane = () => P.Axes({w:420,h:300,xr:[-0.30,1.825],yr:[-0.35,1.15],
      pad:{l:40,r:40,t:30,b:30}, xticksOverride:[], yticksOverride:[],
      grid:false, zeroAxes:false, arrows:false});

    function draw(root){
      const N = size(), th = theta(), rs = rStar(), rb = rBest();
      const v = after(st.r), p = v[0]*v[0];

      /* ---- the plane, with every step so far drawn as a faint spoke ---- */
      const a = plane();
      a.poly([[0,0],[1.10,0]],{color:P.COL.rule,width:1.4});
      a.poly([[0,0],[0,1.06]],{color:P.COL.rule,width:1.4});
      a.note(1.12,0,'|B\\rangle',{fs:12.5,color:P.COL.muted,dy:5,tex:true});
      a.note(0,1.10,'|G\\rangle',{fs:12.5,color:P.COL.muted,anchor:'middle',tex:true});
      const arc=[]; for(let i=0;i<=120;i++){ const s=Math.PI/2*i/120;
        arc.push([Math.cos(s),Math.sin(s)]); }
      a.poly(arc,{color:P.COL.grid,width:1.2,dash:'3 4'});
      for(let k=0;k<st.r;k++){
        const w = after(k);
        a.poly([[0,0],[w[1],w[0]]],{color:P.COL.dec.in,width:1.4});
        a.point(w[1],w[0],{color:P.COL.dec.in,r:3.5});
      }
      a.poly([[0,0],[v[1],v[0]]],{color:P.COL.out,width:2.8});
      a.point(v[1],v[0],{color:P.COL.out,r:6.5});
      /* The angle from the |B> axis, drawn as an arc at the true size. */
      const ang = Math.atan2(v[0], v[1]);
      const a1=[]; for(let i=0;i<=40;i++){ const s=ang*i/40;
        a1.push([0.34*Math.cos(s),0.34*Math.sin(s)]); }
      a.poly(a1,{color:P.COL.out,width:1.6});
      a.note(1.28,0.92,'(2r+1)\\theta',{fs:12.5,color:P.COL.out,anchor:'start',tex:true});
      a.note(1.28,0.70,'\\theta='+fmt(th/D2R,3)+'^{\\circ}',{fs:12.5,color:P.COL.muted,anchor:'start',tex:true});
      a.note(1.28,0.48,'r='+st.r,{fs:12.5,color:P.COL.muted,anchor:'start',tex:true});

      /* ---- the success probability against the iteration count ---- */
      const rmax = Math.max(8, Math.min(60, 2*rb + 4));
      const b = P.Axes({w:430,h:310,xr:[0,rmax],yr:[0,1.34],
        xlabel:'r\\,(\\text{iterations})', ylabel:'P_{\\text{good}}',
        pad:{l:62,r:24,t:30,b:46}, xtarget:5,
        yticksOverride:[0,0.25,0.5,0.75,1]});
      b.curve(x => Math.sin((2*x+1)*th)**2, {color:P.COL.grid,width:1.6,n:600});
      const pts = [];
      for(let k=0;k<=rmax;k++) pts.push([k, psucc(k)]);
      pts.forEach(([k,q])=> b.point(k,q,{color:P.COL.in,r:3.4}));
      b.point(rb, psucc(rb), {color:P.COL.out,r:7});
      b.point(st.r, p, {color:P.COL.h,r:6});
      b.vline(st.r,{color:P.COL.rule,width:1.3,dash:'3 4'});
      b.note(rmax*0.5, 1.24, '\\text{best whole number: } r='+rb, {fs:12,color:P.COL.out,anchor:'middle',tex:true});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      const classical = (N + 1) / (st.m + 1);
      root.querySelector('.ro').innerHTML = `
        <div><dt>Candidates</dt><dd>${T('N=2^{'+st.n+'}='+N,false)}</dd></div>
        <div><dt>Marked</dt><dd>${T('M='+st.m,false)}</dd></div>
        <div><dt>Angle</dt><dd>${fmt(th/D2R,4)}°</dd></div>
        <div><dt>Optimum, exactly</dt><dd>${fmt(rs,4)}</dd></div>
        <div><dt>Optimum, rounded</dt><dd>${rb}</dd></div>
        <div><dt>Success now</dt><dd class="${p>0.5?'okv':'warnv'}">${fmt(p,5)}</dd></div>
        <div><dt>Success at the optimum</dt><dd>${fmt(psucc(rb),5)}</dd></div>
        <div><dt>Marked amplitude</dt><dd>${fmt(v[0]/Math.sqrt(st.m),5)}</dd></div>
        <div><dt>Classical queries expected</dt><dd>${fmt(classical,1)}</dd></div>`;

      const overshoot = st.r > rb;
      const degenerate = st.m / N >= 0.25 - 1e-12;
      const verdict = degenerate
        ? `<div class="note err"><span class="note-h">Too many marked for amplification to help</span>
             With ${T('M/N \\ge 1/4',false)} the angle ${T('\\theta',false)} is at least
             ${T('30^{\\circ}',false)}, so one iteration already turns the state by at least
             ${T('60^{\\circ}',false)} and the optimum is one step or less. There is nothing to
             amplify: a random guess already succeeds often enough that a classical machine would
             take a handful of tries. The saving lives entirely in the regime
             ${T('M \\ll N',false)}.</div>`
        : st.r === 0
        ? `<div class="note warn"><span class="note-h">Nothing has run yet</span>
             The uniform superposition gives ${T('P=\\sin^{2}\\theta = M/N',false)}, which reads
             ${T(fmt(p,5),false)} above — one chance in ${T(fmt(N/st.m,0),false)}, exactly what a
             random guess is worth. Step the iterations and watch the vector turn by
             ${T('2\\theta',false)} each time.</div>`
        : overshoot
        ? `<div class="note err"><span class="note-h">Past the optimum, and going backwards</span>
             The rotation does not stop at ${T('|G\\rangle',false)}. Each further iteration carries
             the vector another ${T('2\\theta',false)} past it and the success probability falls.
             Set ${T('r',false)} to ${2*rb} — twice the optimum — and it is back to about where it
             started. Running "as many iterations as there is time for" is worse than running the
             right number, and it fails in a way that looks like a broken machine.</div>`
        : st.r === rb
        ? `<div class="note ok"><span class="note-h">At the best whole number of iterations</span>
             ${T('r_{*} = \\frac{\\pi}{4\\theta}-\\frac12 = '+fmt(rs,4),false)}, and the nearest
             whole number is ${T(String(rb),false)}, giving ${T(fmt(psucc(rb),5),false)}. It is
             rarely exactly one, because the optimum is rarely a whole number. Compare the count
             with the ${T(fmt(classical,1),false)} classical queries the same problem expects:
             quadratically fewer questions, and no statement at all about how long each takes.</div>`
        : `<div class="note warn"><span class="note-h">On the way up</span>
             Each iteration adds ${T('2\\theta',false)} to the angle, so the marked amplitude grows
             by the same angle every step rather than by the same probability. Keep stepping to
             ${T('r='+rb,false)} and then one further, to see the curve turn over.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg="m"]').forEach(x=>
        x.setAttribute('aria-pressed', String(String(st.m)===x.dataset.val)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Number of qubits <span class="val" data-out="n">10</span></label>
                <input type="range" data-v="n" min="4" max="12" step="1" value="10"></div>
              <div class="ctrl"><label>Marked candidates M <span class="seg">
                ${MS.map(m=>`<button data-seg="m" data-val="${m}">${m}</button>`).join('')}
                </span></label></div>
              <div class="ctrl"><label>Iterations r <span class="val" data-out="r">0</span></label>
                <input type="range" data-v="r" min="0" max="60" step="1" value="0"></div>
              ${LABS.KIT.runbar()}
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{
        const m = e.target.closest('[data-seg="m"]');
        if(m){ st.m = parseInt(m.dataset.val,10); draw(root); }
      });
      LABS.KIT.transport(root, { key:'r', ms:420, max:60,
        get:()=>st.r, set:v=>{ st.r=v; }, redraw:()=>draw(root) });
      draw(root);
    }};
  })();

  return { I, J };
})());
