/* ==========================================================================
   Module 4 laboratories.

   G · A gate sequence, and the vector it moves — the reader builds a sequence
       of up to eight one-qubit gates by pressing them, and the Bloch vector is
       followed through it. The path is drawn on the sphere and the three
       components are plotted against the step number, so every intermediate
       state can be read exactly rather than guessed off a picture. The
       readout names the net rotation of the whole sequence, because there
       always is one: a product of one-qubit unitaries is a one-qubit unitary,
       and every one of those is a rotation.
   H · The Bell circuit — two input bits, one tilt and one phase, and the two
       gates that make an entangled pair out of a product one. Both reduced
       states are shown beside the joint one, and the entanglement is plotted
       against the tilt, so the reader can see the phase control move the state
       without moving the entanglement at all.

   Both compute from the definitions at interaction time: the gates are two-by-
   two matrices multiplied out, and the Bloch vector is the three Pauli traces
   of the resulting density operator. Nothing is tabulated.

   The Bloch ball may be turned. It is drawn through an orthographic camera
   in an isotropic frame, so the rim is a true circle at every viewpoint and
   the length of a vector can be read against it however far the ball has been
   turned. The camera opens at the view the fixed oblique drawing of chapter 4
   gave, so the figure looks as it always did until the reader drags it; the
   camera itself, and why the poles stay put, are written down in
   `70_labs.js`.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F, KIT = LABS.KIT;
  const P = PLOT;
  const D2R = Math.PI/180;

  /* ---- the smallest complex arithmetic that will do ----------------------
     A complex number is [re, im] and a one-qubit gate is a flat array of four
     of them, in row order. Writing it out this way rather than reaching for a
     library keeps the laboratory honest: every number on the screen comes
     from these six lines. */
  const cx  = (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
  const cad = (a,b) => [a[0]+b[0], a[1]+b[1]];
  const cj  = a      => [a[0], -a[1]];
  const ph  = t      => [Math.cos(t), Math.sin(t)];
  const sc  = (r,a)  => [r*a[0], r*a[1]];

  /* M applied to the column v. */
  const apply = (M, v) => [cad(cx(M[0],v[0]), cx(M[1],v[1])),
                           cad(cx(M[2],v[0]), cx(M[3],v[1]))];
  /* A B, as two-by-two matrices. */
  const mul = (A,B) => [
    cad(cx(A[0],B[0]),cx(A[1],B[2])), cad(cx(A[0],B[1]),cx(A[1],B[3])),
    cad(cx(A[2],B[0]),cx(A[3],B[2])), cad(cx(A[2],B[1]),cx(A[3],B[3]))];

  const Z0 = [0,0], ONE = [1,0];

  /* ---- the Bloch vector of a normalised two-component state --------------
     Straight from the definition r_a = <psi|sigma_a|psi>, written out.

     The y component is the one to write carefully, and it is worth doing on
     paper once rather than reading off a table. With Y = [[0,-i],[i,0]] and
     psi = (a, b),

         Y psi = (-i b,  i a),   <psi|Y|psi> = -i a* b + i a b* = 2 Im(a* b),

     so the sign is positive. The test that catches it is |+i> = (|0> + i|1>)
     over root two, which must come out at r_y = +1: with a real and b = i/root
     two, a* b = i/2 and twice its imaginary part is one. A minus sign here
     mirrors the whole sphere in the x-z plane and no gate reads a rendering. */
  function bloch(v){
    const a = v[0], b = v[1];
    const ab = cx(cj(a), b);                  /* a* b */
    return [ 2*ab[0], 2*ab[1],
             a[0]*a[0]+a[1]*a[1] - (b[0]*b[0]+b[1]*b[1]) ];
  }
  const norm = v => Math.sqrt(v[0][0]**2+v[0][1]**2+v[1][0]**2+v[1][1]**2);
  /* A Bloch component that comes out as 5.5e-17 is zero with rounding on top,
     and the number formatter would print the exponent rather than the zero.
     Snapping below the last digit shown is honest; snapping any higher would
     hide a real small value. */
  const z0 = v => Math.abs(v) < 1e-12 ? 0 : v;

  /* The frame every sphere in this file is drawn in. Isotropic: 300 px over a
     span of 3.00 on both axes, so 100 px to the unit in either direction and
     the great circle in the plane of the page is round. */
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
    /* The two poles keep the places they have always had, because z projects
       to the vertical whatever the camera is doing.

       The names of x and y follow their own axes, each pushed clear of its
       line on the side the line is not on, and each dropped altogether once
       its axis is pointing at the reader and has nothing left to name. At the
       view the figure opens in that is the y axis, so the picture opens
       labelled exactly as it always was. */
    a.note(0, 1.30,'|0\\rangle',{fs:12.5,color:P.COL.muted,anchor:'middle',tex:true});
    a.note(0,-1.30,'|1\\rangle',{fs:12.5,color:P.COL.muted,anchor:'middle',dy:12,tex:true});
    const tag = (q, s) => { if(Math.hypot(q[0],q[1]) < 0.80) return;
      a.note(q[0], q[1], s, {fs:12.5, color:P.COL.muted, tex:true,
        anchor: q[0] > 0.25 ? 'start' : q[0] < -0.25 ? 'end' : 'middle',
        dx: q[0] > 0.25 ? 5 : q[0] < -0.25 ? -5 : 0,
        dy: q[1] < 0 ? 15 : -5}); };
    tag(pj(1.34,0,0),'x');
    tag(pj(0,1.34,0),'y');
    /* A control nobody can see is a control that teaches nothing. The corner
       is the one part of this frame no rim, axis or state vector reaches. */
    a.note(-1.45,-1.40,'drag to turn',{fs:11.5,color:P.COL.muted});
    return a;
  }

  /* =======================================================================
     G · A GATE SEQUENCE, AND THE VECTOR IT MOVES

     The state starts at one of the three chosen inputs and each gate of the
     sequence is applied in turn, so the list of states is as long as the
     sequence plus one. Nothing is precomputed: the gate matrices below are
     written out and multiplied at interaction time, and the Bloch vector of
     every intermediate state is taken from its own definition.

     The rotation gates take their angle from the slider, and they all take the
     same one, so moving it turns every rotation in the sequence at once. That
     is stated on the panel, because a control whose effect is not obvious is
     a control that teaches nothing.
     ======================================================================= */
  const G = (() => {
    const MAXLEN = 8;
    /* `az` and `el` are the camera, and they sit in the same object as the
       rest of the state because they are state: a drag changes what the
       figure shows and nothing else about the laboratory. */
    let st = { ang:90, step:8, inp:'z', seq:['H','T','H','S'],
               az:KIT.CAM0.az, el:KIT.CAM0.el };

    /* The gate set. Each is a function of the slider angle, in radians, so a
       fixed gate simply ignores it. */
    const R2 = Math.SQRT1_2;
    const GATES = {
      X : () => [Z0,ONE,ONE,Z0],
      Y : () => [Z0,[0,-1],[0,1],Z0],
      Z : () => [ONE,Z0,Z0,[-1,0]],
      H : () => [[R2,0],[R2,0],[R2,0],[-R2,0]],
      S : () => [ONE,Z0,Z0,[0,1]],
      T : () => [ONE,Z0,Z0,ph(Math.PI/4)],
      Rx: a => [[Math.cos(a/2),0],[0,-Math.sin(a/2)],
                [0,-Math.sin(a/2)],[Math.cos(a/2),0]],
      Rz: a => [ph(-a/2),Z0,Z0,ph(a/2)]
    };
    const ORDER = ['X','Y','Z','H','S','T','Rx','Rz'];
    const SHOW  = { X:'X', Y:'Y', Z:'Z', H:'H', S:'S', T:'T',
                    Rx:'R_{x}(\\alpha)', Rz:'R_{z}(\\alpha)' };
    const INP = { z:{ v:[ONE,Z0],                 name:'|0\\rangle' },
                  x:{ v:[[R2,0],[R2,0]],          name:'|{+}\\rangle' },
                  y:{ v:[[R2,0],[0,R2]],          name:'|{+}i\\rangle' } };

    /* Every state the sequence passes through, input first. */
    function trail(){
      const a = st.ang*D2R;
      let v = INP[st.inp].v;
      const out = [v];
      st.seq.forEach(g => { v = apply(GATES[g](a), v); out.push(v); });
      return out;
    }
    /* The net unitary of the whole sequence, first gate applied first. */
    function net(){
      const a = st.ang*D2R;
      let M = [ONE,Z0,Z0,ONE];
      st.seq.forEach(g => { M = mul(GATES[g](a), M); });
      return M;
    }
    /* The axis and angle of a one-qubit unitary, from its own definition.
       Divide out the phase that makes the determinant one, then read the
       rotation off U = cos(t/2) I - i sin(t/2) n.sigma. */
    function axisAngle(M){
      const det = cad(cx(M[0],M[3]), sc(-1, cx(M[1],M[2])));
      const dth = Math.atan2(det[1], det[0]) / 2;          /* det = e^{2 i dth} */
      const g = ph(-dth);
      const U = M.map(e => cx(g, e));                      /* now det U = 1 */
      const c = 0.5*(U[0][0] + U[3][0]);                   /* cos(t/2) */
      const cc = Math.max(-1, Math.min(1, c));
      let t = 2*Math.acos(cc);
      const s = Math.sin(t/2);
      /* -i sin(t/2) n.sigma is the traceless part; read n off its entries. */
      const nx = -(U[1][1] + U[2][1]) / 2;
      const ny =  (U[2][0] - U[1][0]) / 2;
      const nz = -(U[0][1] - U[3][1]) / 2;
      /* sin(t/2) vanishes at t = 0 and at t = 2 pi. Both act as the identity
         on the Bloch vector; the second is the gate -I, and reporting a turn
         of 360 degrees for it rather than 0 is the honest line. */
      if(Math.abs(s) < 1e-9) return { t: cc < 0 ? 2*Math.PI : 0, n:[0,0,1], trivial:true };
      return { t, n:[nx/s, ny/s, nz/s], trivial:false };
    }

    function draw(root){
      const states = trail();
      const k = Math.min(st.step, states.length-1);
      const vecs = states.map(bloch);
      const cur  = vecs[k];
      const N = net();
      const aa = axisAngle(N);

      /* ---- the sphere, with the whole path drawn on it ---- */
      const V = KIT.cam(st.az, st.el), pj = V.p;
      const a = frame(ball(), V);
      if(vecs.length > 1){
        const path = vecs.map(v => pj(v[0],v[1],v[2]));
        a.poly(path,{color:P.COL.h,width:1.8,dash:'4 4'});
      }
      vecs.forEach((v,i)=>{
        if(i === k) return;
        const q = pj(v[0],v[1],v[2]);
        a.point(q[0],q[1],{color:i===0?P.COL.in:P.COL.mid,r:i===0?5:4});
      });
      const q0 = pj(vecs[0][0],vecs[0][1],vecs[0][2]);
      a.poly([[0,0],q0],{color:P.COL.in,width:1.8});
      const qc = pj(cur[0],cur[1],cur[2]);
      a.poly([[0,0],qc],{color:P.COL.out,width:2.8});
      a.point(qc[0],qc[1],{color:P.COL.out,r:7});
      /* The two names go outside the rim on opposite sides, so neither can sit
         on the other and neither can sit on a state vector. */
      a.note(-1.44,1.30,'\\text{start}',{fs:12.5,color:P.COL.in,tex:true});
      a.note(1.44,1.30,'\\text{step }'+k,{fs:12.5,color:P.COL.out,anchor:'end',tex:true});

      /* ---- the three components against the step number ---- */
      const n = states.length - 1;
      const b = P.Axes({w:430,h:300,xr:[-0.35, Math.max(1,n)+0.35],yr:[-1.25,1.25],
        xlabel:'\\text{step}', ylabel:'\\text{component}',
        pad:{l:60,r:24,t:30,b:46},
        xticksOverride:Array.from({length:n+1},(_,i)=>i), ytarget:4});
      [[0,P.COL.in,'r_{x}'],[1,P.COL.mid,'r_{y}'],[2,P.COL.out,'r_{z}']].forEach(([c,col])=>{
        b.poly(vecs.map((v,i)=>[i, v[c]]),{color:col,width:2.2});
        vecs.forEach((v,i)=> b.point(i, v[c], {color:col, r:4}));
      });
      b.vline(k,{color:P.COL.h,width:1.6,dash:'3 4'});
      /* The three names sit in the strip above every curve, which nothing
         reaches: a component of a unit vector never exceeds one. */
      const w = Math.max(1,n);
      b.note(0.06*w, 1.14,'r_{x}',{fs:12.5,color:P.COL.in,tex:true});
      b.note(0.40*w, 1.14,'r_{y}',{fs:12.5,color:P.COL.mid,tex:true});
      b.note(0.74*w, 1.14,'r_{z}',{fs:12.5,color:P.COL.out,tex:true});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${KIT.orbitBox(a.svg())}${b.svg()}</div>`;

      /* ---- the readout ---- */
      const v = states[k];
      const len = Math.hypot(cur[0],cur[1],cur[2]);
      const p0 = v[0][0]*v[0][0] + v[0][1]*v[0][1];
      const gateHere = k === 0 ? 'the input state'
        : LABS.KIT.M('$'+SHOW[st.seq[k-1]]+'$') + ', gate ' + k;
      const seqShown = st.seq.length
        ? st.seq.map(g => T(SHOW[g],false)).join(' <span class="muted">then</span> ')
        : '<span class="muted">empty — press a gate</span>';
      const axis = aa.trivial ? '—'
        : `(${fmt(aa.n[0],3)}, ${fmt(aa.n[1],3)}, ${fmt(aa.n[2],3)})`;

      root.querySelector('.ro').innerHTML = `
        <div style="grid-column:1/-1"><dt>Sequence</dt><dd>${seqShown}</dd></div>
        <div><dt>At this step</dt><dd>${gateHere}</dd></div>
        <div><dt>Amplitude of 0</dt><dd>${fmt(z0(v[0][0]),4)} ${v[0][1]<0?'−':'+'} ${fmt(z0(Math.abs(v[0][1])),4)}i</dd></div>
        <div><dt>Amplitude of 1</dt><dd>${fmt(z0(v[1][0]),4)} ${v[1][1]<0?'−':'+'} ${fmt(z0(Math.abs(v[1][1])),4)}i</dd></div>
        <div><dt>Bloch vector</dt><dd>(${fmt(z0(cur[0]),4)}, ${fmt(z0(cur[1]),4)}, ${fmt(z0(cur[2]),4)})</dd></div>
        <div><dt>Length</dt><dd class="${Math.abs(len-1)<1e-6?'okv':'warnv'}">${fmt(len,6)}</dd></div>
        <div><dt>p(0)</dt><dd>${fmt(p0,4)}</dd></div>
        <div><dt>Norm of the state</dt><dd class="${Math.abs(norm(v)-1)<1e-6?'okv':'warnv'}">${fmt(norm(v),6)}</dd></div>
        <div><dt>Net turn</dt><dd>${fmt(aa.t/D2R,2)}°</dd></div>
        <div><dt>Net axis</dt><dd>${axis}</dd></div>`;

      const verdict = st.seq.length === 0
        ? `<div class="note warn"><span class="note-h">Nothing has been built yet</span>
             Press a gate to add it to the end of the sequence. Up to ${MAXLEN} fit, and the
             two rotation gates take their turn from the angle slider — all of them at once,
             so moving it turns every rotation in the sequence together.</div>`
        : aa.trivial
        ? `<div class="note ok"><span class="note-h">The whole sequence is the identity</span>
             Every gate in the list has been undone by the ones after it: the net unitary is
             ${T('I',false)} up to a phase, so this sequence returns every input state exactly
             where it started. That is a real fact about the product and not about the input —
             switch the input state and the last point still lands on the first.</div>`
        : `<div class="note ok"><span class="note-h">The whole sequence is one rotation</span>
             ${st.seq.length} gates, and their product is a single turn of
             ${T(fmt(aa.t/D2R,2)+'^{\\circ}',false)} about
             ${T('\\mathbf{n}='+`(${fmt(z0(aa.n[0]),3)},\\,${fmt(z0(aa.n[1]),3)},\\,${fmt(z0(aa.n[2]),3)})`,false)}.
             It has to be: a product of two-by-two unitaries is one, and every one of those is
             ${T('e^{i\\gamma}R_{\\mathbf{n}}(\\alpha)',false)}. Depth buys nothing on one qubit.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-prop]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.prop===st.inp)));
      const sl = root.querySelector('[data-v="step"]');
      if(sl){ sl.max = String(st.seq.length); if(+sl.value > st.seq.length) sl.value = String(st.seq.length); }
    }

    return { mount(root){
      /* Two rows of four rather than one row of eight. On a 320 px screen a
         single row leaves each button 31 px wide, which is below the touch
         target the phone sweep enforces; `mcheck.js` found exactly that. */
      const row = gs => gs.map(g =>
        `<button data-case="${g}">${LABS.KIT.M('$'+SHOW[g]+'$')}</button>`).join('');
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Input state <span class="seg">
                <button data-prop="z">${LABS.KIT.M('$|0\\rangle$')}</button>
                <button data-prop="x">${LABS.KIT.M('$|{+}\\rangle$')}</button>
                <button data-prop="y">${LABS.KIT.M('$|{+}i\\rangle$')}</button></span></label></div>
              <div class="ctrl"><label>Add a gate to the end <span class="seg">${row(ORDER.slice(0,4))}</span></label></div>
              <div class="ctrl"><label>…or one of the rotations <span class="seg">${row(ORDER.slice(4))}</span></label></div>
              <div class="ctrl"><label>Edit the sequence <span class="seg">
                <button data-cls="undo">Undo</button>
                <button data-cls="clear">Clear</button></span></label></div>
              <div class="ctrl"><label>Rotation angle α, degrees <span class="val" data-out="ang">90</span></label>
                <input type="range" data-v="ang" min="0" max="360" step="15" value="90"></div>
              <div class="ctrl"><label>Read the state after step <span class="val" data-out="step">4</span></label>
                <input type="range" data-v="step" min="0" max="8" step="1" value="4"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{
        const g = e.target.closest('[data-case]');
        if(g){ if(st.seq.length < MAXLEN) st.seq = st.seq.concat([g.dataset.case]);
               st.step = st.seq.length; draw(root); return; }
        const c = e.target.closest('[data-cls]');
        if(c){ st.seq = c.dataset.cls==='clear' ? [] : st.seq.slice(0,-1);
               st.step = Math.min(st.step, st.seq.length); draw(root); return; }
        const p = e.target.closest('[data-prop]');
        if(p){ st.inp = p.dataset.prop; draw(root); }
      });
      KIT.orbit(root, st, ()=>draw(root));
      st.step = st.seq.length;
      draw(root);
    }};
  })();

  /* =======================================================================
     H · THE BELL CIRCUIT

     Two qubits written |q1 q0>, with q0 drawn at the top of a circuit and
     used as the control, exactly as chapter 4 fixes it. The circuit is

        R_y(theta) on q0,   then P(phi) on q0,   then CNOT from q0 to q1,

     which at theta = 90 degrees and phi = 0 is the Hadamard circuit of the
     scene beside it: it turns the four computational inputs into the four Bell
     states. The joint state is built by applying four-by-four matrices written
     out here, and both reduced states come from the partial trace taken over
     the block structure, so nothing is read off a table.
     ======================================================================= */
  const H = (() => {
    let st = { q0:0, q1:0, theta:90, phi:0, stage:'out' };
    const STAGES = ['in','mid','out'];
    const SNAME = { in:'before any gate', mid:'after the one-qubit gates',
                    out:'after the CNOT' };

    /* The four amplitudes of |q1 q0>, as complex pairs, at the chosen stage. */
    function state(){
      const t = st.theta*D2R, f = st.phi*D2R;
      const c = Math.cos(t/2), s = Math.sin(t/2);
      /* the input basis state, index 2 q1 + q0 */
      const v = [[0,0],[0,0],[0,0],[0,0]];
      v[2*st.q1 + st.q0] = [1,0];
      if(st.stage === 'in') return v;
      /* R_y(theta) then P(phi), both on q0 — the right factor, so they mix the
         pairs (0,1) and (2,3) of the column. */
      const w = [[0,0],[0,0],[0,0],[0,0]];
      for(let b = 0; b < 2; b++){
        const a0 = v[2*b], a1 = v[2*b+1];
        const n0 = [c*a0[0] - s*a1[0], c*a0[1] - s*a1[1]];
        const n1 = [s*a0[0] + c*a1[0], s*a0[1] + c*a1[1]];
        w[2*b]   = n0;
        w[2*b+1] = cx(ph(f), n1);
      }
      if(st.stage === 'mid') return w;
      /* CNOT with q0 as control and q1 as target: |q1 q0> -> |q1 xor q0, q0>,
         which exchanges the entries 01 and 11, that is indices 1 and 3. */
      return [w[0], w[3], w[2], w[1]];
    }

    /* rho_A on q1 and rho_B on q0, from the two-by-two block rule of chapter 3
       applied to the outer product of the pure state with itself. */
    function reduced(v){
      const R = (i,j) => cx(v[i], cj(v[j]));         /* rho_{ij} */
      const q1 = [cad(R(0,0),R(1,1)), cad(R(0,2),R(1,3)),
                  cad(R(2,0),R(3,1)), cad(R(2,2),R(3,3))];
      const q0 = [cad(R(0,0),R(2,2)), cad(R(0,1),R(2,3)),
                  cad(R(1,0),R(3,2)), cad(R(1,1),R(3,3))];
      return { q1, q0 };
    }
    const pur = r => {
      /* Tr(rho^2) for a two-by-two rho, from the entries. */
      const d0 = r[0][0], d1 = r[3][0], off = r[1][0]*r[1][0] + r[1][1]*r[1][1];
      return d0*d0 + d1*d1 + 2*off;
    };
    const ent = l => (l<=0||l>=1) ? 0 : -l*Math.log2(l) - (1-l)*Math.log2(1-l);
    /* The entanglement of the circuit's output, as a function of the tilt. It
       depends on nothing else, which is what the right panel is there to show. */
    const Sof = deg => ent(Math.cos(deg*D2R/2)**2);

    const KET = ['|00\\rangle','|01\\rangle','|10\\rangle','|11\\rangle'];

    function draw(root){
      const v = state();
      const pr = v.map(z => z[0]*z[0] + z[1]*z[1]);
      const rd = reduced(v);
      const lam = Math.cos(st.theta*D2R/2)**2;
      const S = st.stage === 'out' ? Sof(st.theta) : 0;

      /* ---- the four amplitudes at this stage ---- */
      /* The bars carry an amplitude, so they run from -1 to 1. The frame
         reaches past both, and the two names and the four kets sit in the
         strips beyond that, which no bar can reach. */
      /* The four bars sit at 0.5, 1.5, 2.5 and 3.5 so that the vertical axis
         at x = 0 falls on the left edge of the frame rather than through the
         middle of the first bar. */
      const a = P.Axes({w:430,h:300,xr:[0,4],yr:[-1.60,1.45],
        ylabel:'\\text{amplitude}', pad:{l:64,r:24,t:30,b:46},
        xticksOverride:[], ytarget:4});
      v.forEach((z,i)=>{
        const c = i + 0.5, re = z[0], im = z[1];
        a.rect(c-0.30, 0, c-0.01, re, {fill:P.COL.dec.in});
        a.poly([[c-0.30,re],[c-0.01,re]],{color:P.COL.in,width:2.4});
        a.rect(c+0.01, 0, c+0.30, im, {fill:P.COL.dec.mid});
        a.poly([[c+0.01,im],[c+0.30,im]],{color:P.COL.mid,width:2.4});
        a.note(c, -1.48, KET[i], {fs:12.5,color:P.COL.muted,anchor:'middle',tex:true});
      });
      a.note(0.20, 1.32,'\\text{real}',{fs:12.5,color:P.COL.in,tex:true});
      a.note(1.60, 1.32,'\\text{imaginary}',{fs:12.5,color:P.COL.mid,tex:true});

      /* ---- the entanglement of the output, against the tilt ---- */
      const b = P.Axes({w:430,h:300,xr:[0,180],yr:[0,1.14],
        xlabel:'\\theta\\,(\\text{degrees})', ylabel:'S(\\rho_{A})\\,(\\text{bits})',
        pad:{l:74,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      b.curve(d => Sof(d), {color:P.COL.in, width:2.4, n:360});
      b.vline(st.theta,{color:P.COL.h,width:1.6,dash:'3 4'});
      b.point(st.theta, Sof(st.theta), {color:P.COL.h, r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      /* Two diagonal entries and the modulus of the coherence: enough to see
         both what a Z reading returns and whether any phase information is
         left. The heading is words, because the style sheet uppercases it and
         a lower-case rho would come out looking like a Latin P. */
      const m = (r) => `diag ${fmt(r[0][0],3)}, ${fmt(r[3][0],3)} · |off| ${fmt(Math.hypot(r[1][0],r[1][1]),3)}`;
      const prod = S < 1e-9;
      root.querySelector('.ro').innerHTML = `
        <div style="grid-column:1/-1"><dt>Stage</dt><dd>${SNAME[st.stage]}</dd></div>
        <div><dt>Input</dt><dd>${T('|'+st.q1+st.q0+'\\rangle',false)}</dd></div>
        <div><dt>Probabilities</dt><dd>${pr.map(p=>fmt(p,3)).join(', ')}</dd></div>
        <div><dt>State of q₁</dt><dd>${m(rd.q1)}</dd></div>
        <div><dt>State of q₀</dt><dd>${m(rd.q0)}</dd></div>
        <div><dt>Purity of q₁</dt><dd>${fmt(pur(rd.q1),4)}</dd></div>
        <div><dt>Purity of q₀</dt><dd>${fmt(pur(rd.q0),4)}</dd></div>
        <div><dt>Schmidt weights</dt><dd>${st.stage==='out'?fmt(lam,4)+', '+fmt(1-lam,4):'1, 0'}</dd></div>
        <div><dt>Entanglement, bits</dt><dd class="${prod?'warnv':'okv'}">${fmt(S,4)}</dd></div>
        <div><dt>Total probability</dt><dd class="${Math.abs(pr.reduce((x,y)=>x+y,0)-1)<1e-9?'okv':'warnv'}">${fmt(pr.reduce((x,y)=>x+y,0),6)}</dd></div>`;

      const bellish = st.stage==='out' && Math.abs(st.theta-90)<1e-9;
      const NAMES = ['\\Phi^{+}','\\Phi^{-}','\\Psi^{+}','\\Psi^{-}'];
      const which = NAMES[2*st.q1 + st.q0];
      const verdict = st.stage !== 'out'
        ? `<div class="note warn"><span class="note-h">The pair is still a product</span>
             Nothing that has run so far touches both qubits, and no one-qubit gate can change
             the Schmidt weights. Both reduced states are pure, both purities read one, and the
             entanglement is zero however the two sliders are set. Step to the last stage to see
             the one gate that changes that.</div>`
        : bellish && Math.abs(st.phi % 360) < 1e-9
        ? `<div class="note ok"><span class="note-h">This is ${T(`|${which}\\rangle`,false)}</span>
             At a tilt of ${T('90^{\\circ}',false)} the first gate is the Hadamard, up to a sign on
             the ${T('|1\\rangle',false)} input that nothing can see, and the four input bit
             patterns give the four Bell states. Both reduced states are ${T('I/2',false)}, both
             purities read one half, and the pair carries a full bit — while the pair itself is
             perfectly known. Now turn the phase: the joint state moves and the entanglement does
             not move at all.</div>`
        : prod
        ? `<div class="note warn"><span class="note-h">One gate, and still a product</span>
             At this tilt the control is left in a computational-basis state, so the CNOT is just
             a permutation of basis states and cannot correlate anything. The gate is entangling
             — it entangles <b>some</b> inputs — and this is not one of them. That distinction is
             the whole content of the scene before this one.</div>`
        : `<div class="note ok"><span class="note-h">Entangled, and by this much</span>
             The output is ${T('\\cos\\tfrac{\\theta}{2}|00\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|11\\rangle',false)},
             whose Schmidt weights are ${T(fmt(lam,4),false)} and ${T(fmt(1-lam,4),false)} and whose
             entanglement is ${T(fmt(S,4),false)} bits. The phase control changes the joint state
             and leaves both reduced states, both purities and this number exactly where they are:
             a phase inside a Schmidt term is not entanglement.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg]').forEach(x=>
        x.setAttribute('aria-pressed', String(String(st[x.dataset.seg])===x.dataset.val)));
      root.querySelectorAll('[data-stage]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.stage===st.stage)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Input bit on q₀, the control <span class="seg">
                <button data-seg="q0" data-val="0">0</button>
                <button data-seg="q0" data-val="1">1</button></span></label></div>
              <div class="ctrl"><label>Input bit on q₁, the target <span class="seg">
                <button data-seg="q1" data-val="0">0</button>
                <button data-seg="q1" data-val="1">1</button></span></label></div>
              <div class="ctrl"><label>Stage of the circuit <span class="seg">
                ${STAGES.map(s=>`<button data-stage="${s}">${SNAME[s]}</button>`).join('')}
                </span></label></div>
              <div class="ctrl"><label>Tilt θ on q₀, degrees <span class="val" data-out="theta">90</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="90"></div>
              <div class="ctrl"><label>Phase φ on q₀, degrees <span class="val" data-out="phi">0</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="15" value="0"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{
        const s = e.target.closest('[data-seg]');
        if(s){ st[s.dataset.seg] = parseInt(s.dataset.val,10); draw(root); return; }
        const g = e.target.closest('[data-stage]');
        if(g){ st.stage = g.dataset.stage; draw(root); }
      });
      draw(root);
    }};
  })();

  return { G, H };
})());
