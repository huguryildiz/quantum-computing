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
      const b = P.Axes({w:430,h:280,xr:[-0.35, Math.max(1,n)+0.35],yr:[-1.18,1.18],
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
      b.note(0.06*w, 1.08,'r_{x}',{fs:12.5,color:P.COL.in,tex:true});
      b.note(0.40*w, 1.08,'r_{y}',{fs:12.5,color:P.COL.mid,tex:true});
      b.note(0.74*w, 1.08,'r_{z}',{fs:12.5,color:P.COL.out,tex:true});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${KIT.orbitBox(a.svg())}${b.svg()}</div>`;

      /* ---- the readout ---- */
      const v = states[k];
      const len = Math.hypot(cur[0],cur[1],cur[2]);
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
        <div><dt>Bloch vector</dt><dd>(${fmt(z0(cur[0]),4)}, ${fmt(z0(cur[1]),4)}, ${fmt(z0(cur[2]),4)})</dd></div>
        <div><dt>Length</dt><dd class="${Math.abs(len-1)<1e-6?'okv':'warnv'}">${fmt(len,6)}</dd></div>
        <div><dt>Norm of the state</dt><dd class="${Math.abs(norm(v)-1)<1e-6?'okv':'warnv'}">${fmt(norm(v),6)}</dd></div>
        <div><dt>Net turn</dt><dd>${fmt(aa.t/D2R,2)}°</dd></div>
        <div><dt>Net axis</dt><dd>${axis}</dd></div>`;

      const verdict = st.seq.length === 0
        ? `<div class="note warn"><span class="note-h">Nothing has been built yet</span>
             Press a gate to add it to the end of the sequence. Up to ${MAXLEN} fit, and both
             rotation gates take their turn from the angle slider at once.</div>`
        : aa.trivial
        ? `<div class="note ok"><span class="note-h">The whole sequence is the identity</span>
             Every gate has been undone by the ones after it: the net unitary is
             ${T('I',false)} up to a phase, so this sequence returns every input exactly
             where it started, whichever input is chosen.</div>`
        : `<div class="note ok"><span class="note-h">The whole sequence is one rotation</span>
             ${st.seq.length} gates, and their product is a single turn of
             ${T(fmt(aa.t/D2R,2)+'^{\\circ}',false)} about
             ${T('\\mathbf{n}='+`(${fmt(z0(aa.n[0]),3)},\\,${fmt(z0(aa.n[1]),3)},\\,${fmt(z0(aa.n[2]),3)})`,false)}.
             It has to be, since every one-qubit unitary is
             ${T('e^{i\\gamma}R_{\\mathbf{n}}(\\alpha)',false)}: depth buys nothing on one qubit.</div>`;
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
      const a = P.Axes({w:430,h:280,xr:[0,4],yr:[-1.32,1.22],
        ylabel:'\\text{amplitude}', pad:{l:64,r:24,t:30,b:46},
        xticksOverride:[], ytarget:4});
      v.forEach((z,i)=>{
        const c = i + 0.5, re = z[0], im = z[1];
        a.rect(c-0.30, 0, c-0.01, re, {fill:P.COL.dec.in});
        a.poly([[c-0.30,re],[c-0.01,re]],{color:P.COL.in,width:2.4});
        a.rect(c+0.01, 0, c+0.30, im, {fill:P.COL.dec.mid});
        a.poly([[c+0.01,im],[c+0.30,im]],{color:P.COL.mid,width:2.4});
        a.note(c, -1.22, KET[i], {fs:12.5,color:P.COL.muted,anchor:'middle',tex:true});
      });
      a.note(0.20, 1.10,'\\text{real}',{fs:12.5,color:P.COL.in,tex:true});
      a.note(1.60, 1.10,'\\text{imaginary}',{fs:12.5,color:P.COL.mid,tex:true});

      /* ---- the entanglement of the output, against the tilt ---- */
      const b = P.Axes({w:430,h:280,xr:[0,180],yr:[0,1.14],
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
        <div style="grid-column:1/-1"><dt>Stage</dt><dd>${SNAME[st.stage]} · input ${T('|'+st.q1+st.q0+'\\rangle',false)}</dd></div>
        <div><dt>State of q₁</dt><dd>${m(rd.q1)}</dd></div>
        <div><dt>State of q₀</dt><dd>${m(rd.q0)}</dd></div>
        <div><dt>Purity, q₁ · q₀</dt><dd>${fmt(pur(rd.q1),4)} · ${fmt(pur(rd.q0),4)}</dd></div>
        <div><dt>Schmidt weights</dt><dd>${st.stage==='out'?fmt(lam,4)+', '+fmt(1-lam,4):'1, 0'}</dd></div>
        <div><dt>Entanglement, bits</dt><dd class="${prod?'warnv':'okv'}">${fmt(S,4)}</dd></div>`;

      const bellish = st.stage==='out' && Math.abs(st.theta-90)<1e-9;
      const NAMES = ['\\Phi^{+}','\\Phi^{-}','\\Psi^{+}','\\Psi^{-}'];
      const which = NAMES[2*st.q1 + st.q0];
      const verdict = st.stage !== 'out'
        ? `<div class="note warn"><span class="note-h">The pair is still a product</span>
             No one-qubit gate can change the Schmidt weights, so both reduced states stay pure
             and the entanglement is zero however the sliders are set — step to the last stage
             for the one gate that changes that.</div>`
        : bellish && Math.abs(st.phi % 360) < 1e-9
        ? `<div class="note ok"><span class="note-h">This is ${T(`|${which}\\rangle`,false)}</span>
             At a tilt of ${T('90^{\\circ}',false)} the first gate is the Hadamard, and the four
             input bit patterns give the four Bell states, each with both reduced states
             ${T('I/2',false)} while the pair itself is perfectly known. Now turn the phase: the
             joint state moves and the entanglement does not.</div>`
        : prod
        ? `<div class="note warn"><span class="note-h">One gate, and still a product</span>
             At this tilt the control is left in a computational-basis state, so the CNOT only
             permutes basis states — entangling for <b>some</b> inputs, and not this one.</div>`
        : `<div class="note ok"><span class="note-h">Entangled, and by this much</span>
             The output is ${T('\\cos\\tfrac{\\theta}{2}|00\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|11\\rangle',false)},
             with Schmidt weights ${T(fmt(lam,4),false)} and ${T(fmt(1-lam,4),false)}, entanglement
             ${T(fmt(S,4),false)} bits. The phase moves the joint state and leaves everything
             else — reduced states, purities, this number — exactly where it is.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg]').forEach(x=>
        x.setAttribute('aria-pressed', String(String(st[x.dataset.seg])===x.dataset.val)));
      root.querySelectorAll('[data-stage]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.stage===st.stage)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-4-8" style="gap:40px">
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

/* ==========================================================================
   Module 4 laboratories, second file.

   H1 · The point and the angles — the reader sets theta and phi directly and
        watches the point move on the sphere, then reads a second state off a
        chosen preset and the overlap between the two. The half-angle rule is
        the whole content: two states at a right angle on the sphere overlap
        at one half, and only the antipodal setting gives zero.
   H2 · One gate, one turn — the reader picks a single gate, sets the input
        state by its own two sphere angles, and watches the vector move under
        that one gate, with its axis and turn read off the matrix rather than
        looked up. Every gate in the course's set is a turn about some axis by
        some angle, and this is where that claim is checked one gate at a
        time.
   H3 · A two-qubit gate on a chosen qubit — the reader picks CNOT, CZ or SWAP,
        a control and a target, and an input bit string, and reads the output
        amplitudes and which entries moved. The point is the ordering trap:
        the same gate name applied to the other qubit gives a different
        state, and the lab computes both routes from the same four-by-four
        matrices so neither is asserted.
   H4 · Reaching a target with H and T — the reader grows a word in H and T
        and watches the net gate's distance from a chosen target rotation
        fall, then switches the target to a non-Clifford turn and sees why no
        word built from H and S alone can close the gap.

   All four compute from the definitions at interaction time: a gate is a
   two-by-two or four-by-four matrix multiplied out, and every angle or
   distance is read off the resulting matrix, never off a table.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F, KIT = LABS.KIT;
  const P = PLOT;
  const D2R = Math.PI/180;

  const cx  = (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
  const cad = (a,b) => [a[0]+b[0], a[1]+b[1]];
  const cj  = a      => [a[0], -a[1]];
  const ph  = t      => [Math.cos(t), Math.sin(t)];
  const sc  = (r,a)  => [r*a[0], r*a[1]];
  const cabs= a      => Math.hypot(a[0],a[1]);

  const apply = (M, v) => [cad(cx(M[0],v[0]), cx(M[1],v[1])),
                           cad(cx(M[2],v[0]), cx(M[3],v[1]))];
  const mul = (A,B) => [
    cad(cx(A[0],B[0]),cx(A[1],B[2])), cad(cx(A[0],B[1]),cx(A[1],B[3])),
    cad(cx(A[2],B[0]),cx(A[3],B[2])), cad(cx(A[2],B[1]),cx(A[3],B[3]))];

  const Z0 = [0,0], ONE = [1,0];
  const z0 = v => Math.abs(v) < 1e-12 ? 0 : v;

  function bloch(v){
    const a = v[0], b = v[1];
    const ab = cx(cj(a), b);
    return [ 2*ab[0], 2*ab[1],
             a[0]*a[0]+a[1]*a[1] - (b[0]*b[0]+b[1]*b[1]) ];
  }
  /* The state at polar angle theta and azimuth phi, in the fixed convention
     of this chapter: |psi> = cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>. */
  const stateOf = (th,ph_) => {
    const t = th*D2R, f = ph_*D2R;
    return [[Math.cos(t/2),0], cx(ph(f), [Math.sin(t/2),0])];
  };

  const ball = () => P.Axes({w:360,h:360,xr:[-1.5,1.5],yr:[-1.5,1.5],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});

  /* The same turnable frame as the first laboratory file, repeated rather
     than shared, because the two files are never both loaded from a build
     that drops one of them. */
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
    const tag = (q, s) => { if(Math.hypot(q[0],q[1]) < 0.80) return;
      a.note(q[0], q[1], s, {fs:12.5, color:P.COL.muted, tex:true,
        anchor: q[0] > 0.25 ? 'start' : q[0] < -0.25 ? 'end' : 'middle',
        dx: q[0] > 0.25 ? 5 : q[0] < -0.25 ? -5 : 0,
        dy: q[1] < 0 ? 15 : -5}); };
    tag(pj(0,0, 1.32),'|0\\rangle');
    tag(pj(0,0,-1.32),'|1\\rangle');
    tag(pj(1.32,0,0),'x');
    tag(pj(0,1.32,0),'y');
    a.note(-1.45,-1.40,'drag to turn',{fs:11.5,color:P.COL.muted});
    return a;
  }

  /* =======================================================================
     H1 · THE POINT AND THE ANGLES

     The state the reader is asked to hold in mind, |psi(theta,phi)>, drawn as
     a point that moves the instant either slider moves. A second state is
     picked from six presets, and the overlap |<chi|psi>|^2 is computed from
     the two column vectors, never from the half-angle formula the scene
     teaches: the formula is what the reader is here to check, not what draws
     the picture. A common mistake — reading theta as the angle already
     halved — is named in the verdict once the two points sit at a right
     angle and the reader is told what a coin means for this pair.
     ======================================================================= */
  const H1 = (() => {
    let st = { theta:60, phi:135, chi:'z1', az:KIT.CAM0.az, el:KIT.CAM0.el };
    const PRESET = {
      z0:{ v:[ONE,Z0], name:'|0\\rangle' }, z1:{ v:[Z0,ONE], name:'|1\\rangle' },
      x0:{ v:[[Math.SQRT1_2,0],[Math.SQRT1_2,0]], name:'|{+}\\rangle' },
      x1:{ v:[[Math.SQRT1_2,0],[-Math.SQRT1_2,0]], name:'|{-}\\rangle' },
      y0:{ v:[[Math.SQRT1_2,0],[0,Math.SQRT1_2]], name:'|{+}i\\rangle' },
      y1:{ v:[[Math.SQRT1_2,0],[0,-Math.SQRT1_2]], name:'|{-}i\\rangle' }
    };

    function draw(root){
      const v = stateOf(st.theta, st.phi);
      const r = bloch(v);
      const chi = PRESET[st.chi];
      const overlap = cx(cj(chi.v[0]), v[0]);
      const ov2 = cx(cj(chi.v[1]), v[1]);
      const amp = cad(overlap, ov2);
      const prob = amp[0]*amp[0] + amp[1]*amp[1];

      const V = KIT.cam(st.az, st.el), pj = V.p;
      const a = frame(ball(), V);
      const rc = bloch(chi.v);
      const qc = pj(rc[0],rc[1],rc[2]);
      a.poly([[0,0],qc],{color:P.COL.mid,width:2.2,dash:'4 4'});
      a.point(qc[0],qc[1],{color:P.COL.mid,r:6});
      a.note(qc[0],qc[1],chi.name,{fs:12.5,color:P.COL.mid,tex:true,dx:8,dy:-8});
      const q = pj(r[0],r[1],r[2]);
      a.poly([[0,0],q],{color:P.COL.in,width:2.8});
      a.point(q[0],q[1],{color:P.COL.in,r:7});
      a.note(q[0],q[1],'|\\psi\\rangle',{fs:13,color:P.COL.in,tex:true,dx:-10,dy:-10,anchor:'end'});

      const b = P.Axes({w:430,h:280,xr:[0,180],yr:[0,1.12],
        xlabel:'\\Theta\\,(\\text{degrees})', ylabel:'|\\langle\\chi|\\psi\\rangle|^{2}',
        pad:{l:66,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      b.curve(d => Math.cos(d*D2R/2)**2, {color:P.COL.h, width:2.0, dash:'5 4'});
      const dot = r[0]*rc[0]+r[1]*rc[1]+r[2]*rc[2];
      const Theta = Math.acos(Math.max(-1,Math.min(1,dot)))/D2R;
      b.point(Theta, prob, {color:P.COL.in, r:7});
      b.hline(0.5,{color:P.COL.rule,width:1.2,dash:'4 4'});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${KIT.orbitBox(a.svg())}${b.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>Bloch vector of |ψ⟩</dt><dd>(${fmt(z0(r[0]),4)}, ${fmt(z0(r[1]),4)}, ${fmt(z0(r[2]),4)})</dd></div>
        <div><dt>Angle between the two points</dt><dd>${fmt(Theta,2)}°</dd></div>
        <div><dt>Overlap ⟨χ|ψ⟩</dt><dd>(${fmt(amp[0],4)}, ${fmt(amp[1],4)})</dd></div>
        <div><dt>|⟨χ|ψ⟩|²</dt><dd class="${Math.abs(prob-Math.cos(Theta*D2R/2)**2)<1e-6?'okv':'warnv'}">${fmt(prob,4)}</dd></div>`;

      const verdict = Math.abs(Theta-180) < 1.5
        ? `<div class="note ok"><span class="note-h">Opposite points, and the overlap is zero</span>
             The two states are antipodal, so they are orthogonal. Reading ${T('\\theta',false)}
             itself as the angle on the sphere would say ${T(fmt(st.theta,1)+'^{\\circ}',false)} instead
             of ${T(fmt(Theta,1)+'^{\\circ}',false)}; the picture is drawn from the half angle for exactly this reason.</div>`
        : Math.abs(Theta-90) < 1.5
        ? `<div class="note warn"><span class="note-h">A right angle on the sphere is a coin</span>
             ${T('\\Theta='+fmt(Theta,1)+'^{\\circ}',false)} gives ${T('|\\langle\\chi|\\psi\\rangle|^{2}=0.5',false)}: no
             measurement, on either state, tells the two apart better than a guess.</div>`
        : `<div class="note ok"><span class="note-h">The curve, checked at one point</span>
             The dot sits on ${T('\\cos^{2}(\\Theta/2)',false)} at every setting of both sliders and the preset,
             because the overlap here was computed from the two columns, not from that formula.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-prop]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.prop===st.chi)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Polar angle θ, degrees <span class="val" data-out="theta">60</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="1" value="60"></div>
              <div class="ctrl"><label>Azimuth φ, degrees <span class="val" data-out="phi">135</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="1" value="135"></div>
              <div class="ctrl"><label>Compare against <span class="seg">
                <button data-prop="z0">${LABS.KIT.M('$|0\\rangle$')}</button>
                <button data-prop="z1">${LABS.KIT.M('$|1\\rangle$')}</button>
                <button data-prop="x0">${LABS.KIT.M('$|{+}\\rangle$')}</button>
                <button data-prop="x1">${LABS.KIT.M('$|{-}\\rangle$')}</button>
                <button data-prop="y0">${LABS.KIT.M('$|{+}i\\rangle$')}</button>
                <button data-prop="y1">${LABS.KIT.M('$|{-}i\\rangle$')}</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{
        const p = e.target.closest('[data-prop]');
        if(p){ st.chi = p.dataset.prop; draw(root); }
      });
      KIT.orbit(root, st, ()=>draw(root));
      draw(root);
    }};
  })();

  /* =======================================================================
     H2 · ONE GATE, ONE TURN

     One gate at a time, applied to a state the reader sets by its own two
     sphere angles. The axis and angle of the gate are read off its matrix by
     the same construction as laboratory G, so a Pauli reports a half turn and
     a phase gate reports a turn about z without either being asserted.
     ======================================================================= */
  const H2 = (() => {
    let st = { theta:90, phi:0, gate:'H', alpha:90, az:KIT.CAM0.az, el:KIT.CAM0.el };
    const R2 = Math.SQRT1_2;
    const GATES = {
      X : () => [Z0,ONE,ONE,Z0],
      Y : () => [Z0,[0,-1],[0,1],Z0],
      Z : () => [ONE,Z0,Z0,[-1,0]],
      H : () => [[R2,0],[R2,0],[R2,0],[-R2,0]],
      S : () => [ONE,Z0,Z0,[0,1]],
      T : () => [ONE,Z0,Z0,ph(Math.PI/4)],
      P : a => [ONE,Z0,Z0,ph(a)]
    };
    const SHOW = { X:'X', Y:'Y', Z:'Z', H:'H', S:'S', T:'T', P:'P(\\alpha)' };
    const ORDER = ['X','Y','Z','H','S','T','P'];

    function axisAngle(M){
      const det = cad(cx(M[0],M[3]), sc(-1, cx(M[1],M[2])));
      const dth = Math.atan2(det[1], det[0]) / 2;
      const g = ph(-dth);
      const U = M.map(e => cx(g, e));
      const c = 0.5*(U[0][0] + U[3][0]);
      const cc = Math.max(-1, Math.min(1, c));
      let t = 2*Math.acos(cc);
      const s = Math.sin(t/2);
      const nx = -(U[1][1] + U[2][1]) / 2;
      const ny =  (U[2][0] - U[1][0]) / 2;
      const nz = -(U[0][1] - U[3][1]) / 2;
      if(Math.abs(s) < 1e-9) return { t: cc < 0 ? 2*Math.PI : 0, n:[0,0,1], trivial:true };
      return { t, n:[nx/s, ny/s, nz/s], trivial:false };
    }

    function draw(root){
      const a_ = st.alpha*D2R;
      const M = st.gate === 'P' ? GATES.P(a_) : GATES[st.gate]();
      const vin = stateOf(st.theta, st.phi);
      const vout = apply(M, vin);
      const rin = bloch(vin), rout = bloch(vout);
      const aa = axisAngle(M);

      const V = KIT.cam(st.az, st.el), pj = V.p;
      const a = frame(ball(), V);
      if(!aa.trivial){
        const n = aa.n, nq = pj(1.30*n[0],1.30*n[1],1.30*n[2]);
        a.poly([[0,0],nq],{color:P.COL.h,width:2.0});
        a.note(nq[0],nq[1],'\\mathbf{n}',{fs:13,color:P.COL.h,tex:true,dx:6,dy:-6});
      }
      const qi = pj(rin[0],rin[1],rin[2]);
      a.poly([[0,0],qi],{color:P.COL.in,width:2.2});
      a.point(qi[0],qi[1],{color:P.COL.in,r:6});
      a.note(qi[0],qi[1],'\\text{in}',{fs:12.5,color:P.COL.in,tex:true,dx:-8,dy:-8,anchor:'end'});
      const qo = pj(rout[0],rout[1],rout[2]);
      a.poly([[0,0],qo],{color:P.COL.out,width:2.8});
      a.point(qo[0],qo[1],{color:P.COL.out,r:7});
      a.note(qo[0],qo[1],'\\text{out}',{fs:12.5,color:P.COL.out,tex:true,dx:8,dy:-8});

      const b = P.Axes({w:430,h:280,xr:[-0.35,2.35],yr:[-1.18,1.18],
        xlabel:'\\text{step}', ylabel:'\\text{component}',
        pad:{l:60,r:24,t:30,b:46}, xticksOverride:[0,1], ytarget:4});
      [[0,P.COL.in,'r_{x}'],[1,P.COL.mid,'r_{y}'],[2,P.COL.out,'r_{z}']].forEach(([c,col])=>{
        b.poly([[0,rin[c]],[1,rout[c]]],{color:col,width:2.2});
        b.point(0,rin[c],{color:col,r:4}); b.point(1,rout[c],{color:col,r:4});
      });
      b.note(0.06,1.08,'r_{x}',{fs:12.5,color:P.COL.in,tex:true});
      b.note(0.40,1.08,'r_{y}',{fs:12.5,color:P.COL.mid,tex:true});
      b.note(0.74,1.08,'r_{z}',{fs:12.5,color:P.COL.out,tex:true});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${KIT.orbitBox(a.svg())}${b.svg()}</div>`;

      const lenI = Math.hypot(rin[0],rin[1],rin[2]), lenO = Math.hypot(rout[0],rout[1],rout[2]);
      const axis = aa.trivial ? '—' : `(${fmt(aa.n[0],3)}, ${fmt(aa.n[1],3)}, ${fmt(aa.n[2],3)})`;
      root.querySelector('.ro').innerHTML = `
        <div><dt>In</dt><dd>(${fmt(z0(rin[0]),4)}, ${fmt(z0(rin[1]),4)}, ${fmt(z0(rin[2]),4)})</dd></div>
        <div><dt>Out</dt><dd>(${fmt(z0(rout[0]),4)}, ${fmt(z0(rout[1]),4)}, ${fmt(z0(rout[2]),4)})</dd></div>
        <div><dt>Length in · out</dt><dd class="${Math.abs(lenI-1)<1e-6&&Math.abs(lenO-1)<1e-6?'okv':'warnv'}">${fmt(lenI,6)} · ${fmt(lenO,6)}</dd></div>
        <div><dt>Turn of ${T(SHOW[st.gate],false)}</dt><dd>${fmt(aa.t/D2R,2)}°</dd></div>
        <div><dt>Axis of the turn</dt><dd>${axis}</dd></div>`;

      const verdict = aa.trivial
        ? `<div class="note ok"><span class="note-h">The identity, up to phase</span>
             ${T(SHOW[st.gate],false)} at this setting moves nothing on the sphere: the input and the output land on the same point.</div>`
        : Math.abs(aa.t/D2R - 180) < 0.5
        ? `<div class="note ok"><span class="note-h">A half turn</span>
             ${T(SHOW[st.gate],false)} turns the sphere by exactly ${T('180^{\\circ}',false)} about
             ${T('\\mathbf{n}='+`(${fmt(z0(aa.n[0]),2)},\\,${fmt(z0(aa.n[1]),2)},\\,${fmt(z0(aa.n[2]),2)})`,false)}.
             Every Pauli, and ${T('H',false)}, is a half turn — never a quarter, whatever the matrix entry ${T('i',false)} suggests.</div>`
        : `<div class="note ok"><span class="note-h">A turn of ${T(fmt(aa.t/D2R,1)+'^{\\circ}',false)}</span>
             The vector is carried about ${T('\\mathbf{n}='+`(${fmt(z0(aa.n[0]),2)},\\,${fmt(z0(aa.n[1]),2)},\\,${fmt(z0(aa.n[2]),2)})`,false)}
             by that angle, and its length does not move: a rotation cannot lengthen or shorten a vector.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-case]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.case===st.gate)));
      const ctrl = root.querySelector('[data-ctrl="alpha"]');
      if(ctrl) ctrl.style.display = st.gate === 'P' ? '' : 'none';
    }

    return { mount(root){
      const row = gs => gs.map(g =>
        `<button data-case="${g}">${LABS.KIT.M('$'+SHOW[g]+'$')}</button>`).join('');
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Input angle θ, degrees <span class="val" data-out="theta">90</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="1" value="90"></div>
              <div class="ctrl"><label>Input angle φ, degrees <span class="val" data-out="phi">0</span></label>
                <input type="range" data-v="phi" min="0" max="360" step="1" value="0"></div>
              <div class="ctrl"><label>Gate <span class="seg">${row(ORDER)}</span></label></div>
              <div class="ctrl" data-ctrl="alpha" style="display:none"><label>Phase α, degrees <span class="val" data-out="alpha">90</span></label>
                <input type="range" data-v="alpha" min="0" max="360" step="15" value="90"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{
        const g = e.target.closest('[data-case]');
        if(g){ st.gate = g.dataset.case; draw(root); }
      });
      KIT.orbit(root, st, ()=>draw(root));
      draw(root);
    }};
  })();

  /* =======================================================================
     H3 · A TWO-QUBIT GATE ON A CHOSEN QUBIT

     CNOT, CZ and SWAP, each built from its own four-by-four matrix, applied
     to a chosen computational input with a chosen control and target. The
     panel names which qubit moved, so swapping the control and the target of
     a CNOT on the same input can be compared entry by entry rather than
     trusted.
     ======================================================================= */
  const H3 = (() => {
    let st = { gate:'CNOT', ctrl:0, q1:0, q0:0 };
    const KET = ['|00\\rangle','|01\\rangle','|10\\rangle','|11\\rangle'];

    /* Each matrix acts on the column ordered |q1 q0>, entry x = 2 q1 + q0. */
    function matrix(){
      if(st.gate === 'CZ') return [
        [ONE,Z0,Z0,Z0],[Z0,ONE,Z0,Z0],[Z0,Z0,ONE,Z0],[Z0,Z0,Z0,[-1,0]]
      ].flat();
      if(st.gate === 'SWAP') return [
        ONE,Z0,Z0,Z0, Z0,Z0,ONE,Z0, Z0,ONE,Z0,Z0, Z0,Z0,Z0,ONE];
      /* CNOT, control chosen by st.ctrl: 0 -> q0 controls q1, 1 -> q1 controls q0. */
      if(st.ctrl === 0) return [
        ONE,Z0,Z0,Z0, Z0,Z0,Z0,ONE, Z0,Z0,ONE,Z0, Z0,ONE,Z0,Z0];
      return [
        ONE,Z0,Z0,Z0, Z0,ONE,Z0,Z0, Z0,Z0,Z0,ONE, Z0,Z0,ONE,Z0];
    }
    const apply4 = (M, v) => {
      const out = [Z0,Z0,Z0,Z0];
      for(let i=0;i<4;i++){ let s=Z0; for(let j=0;j<4;j++) s = cad(s, cx(M[4*i+j], v[j])); out[i]=s; }
      return out;
    };

    function draw(root){
      const M = matrix();
      const idx = 2*st.q1 + st.q0;
      const v = [Z0,Z0,Z0,Z0]; v[idx] = ONE;
      const out = apply4(M, v);
      const outIdx = out.findIndex(a => cabs(a) > 0.5);

      const a = P.Axes({w:430,h:280,xr:[0,4],yr:[-0.24,1.22],
        ylabel:'\\text{amplitude}', pad:{l:56,r:24,t:30,b:46}, xticksOverride:[], ytarget:4});
      out.forEach((z,i)=>{
        const c = i+0.5;
        a.rect(c-0.24,0,c+0.24,z[0],{fill:P.COL.dec.in});
        a.poly([[c-0.24,z[0]],[c+0.24,z[0]]],{color:P.COL.in,width:2.4});
        a.note(c,-0.16,KET[i],{fs:12.5,color:P.COL.muted,anchor:'middle',tex:true});
      });

      const b = P.Axes({w:430,h:280,xr:[0,4],yr:[-0.24,1.22],
        ylabel:'\\text{amplitude, in}', pad:{l:56,r:24,t:30,b:46}, xticksOverride:[], ytarget:4});
      v.forEach((z,i)=>{
        const c = i+0.5;
        b.rect(c-0.24,0,c+0.24,z[0],{fill:P.COL.dec.mid});
        b.poly([[c-0.24,z[0]],[c+0.24,z[0]]],{color:P.COL.mid,width:2.4});
        b.note(c,-0.16,KET[i],{fs:12.5,color:P.COL.muted,anchor:'middle',tex:true});
      });

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${b.svg()}${a.svg()}</div>`;

      const which = st.gate === 'CNOT' ? (st.ctrl===0 ? 'q_{0}\\to q_{1}' : 'q_{1}\\to q_{0}')
                  : st.gate === 'CZ' ? '\\text{symmetric}' : '\\text{both}';
      root.querySelector('.ro').innerHTML = `
        <div style="grid-column:1/-1"><dt>Gate</dt><dd>${T(st.gate,false)}, ${T(which,false)}</dd></div>
        <div><dt>Input</dt><dd>${T(KET[idx],false)}</dd></div>
        <div><dt>Output</dt><dd>${outIdx>=0?T(KET[outIdx],false):'\\text{spread over more than one term}'}</dd></div>
        <div><dt>Amplitude that moved</dt><dd>${outIdx>=0 && outIdx!==idx?'yes':'no'}</dd></div>`;

      const moved = outIdx>=0 && outIdx!==idx;
      const verdict = st.gate === 'CNOT'
        ? `<div class="note ${moved?'ok':'warn'}"><span class="note-h">${moved?'The target flipped':'The control was 0, so nothing moved'}</span>
             ${moved
               ? `${T(which,false)} means the ${st.ctrl===0?'q_{1}':'q_{0}'} entry alone changed, because that is the wire named as the target.
                  Apply the other CNOT to the same input and the amplitude that moves is a different one.`
               : `The control bit read here is 0, so this CNOT is the identity on this particular input — a CNOT is only
                  entangling for <b>some</b> states, not every one it is handed.`}</div>`
        : st.gate === 'CZ'
        ? `<div class="note ${st.q1===1&&st.q0===1?'warn':'ok'}"><span class="note-h">${st.q1===1&&st.q0===1?'A sign, not a swap of terms':'No visible change on a basis state'}</span>
             CZ only multiplies ${T('|11\\rangle',false)} by ${T('-1',false)}: on a computational input the bars look unchanged, because a
             sign is invisible on a single real bar and only shows up once the qubits are in superposition.</div>`
        : `<div class="note ok"><span class="note-h">The two labels traded places</span>
             SWAP sends ${T(KET[idx],false)} to ${T(outIdx>=0?KET[outIdx]:'?',false)}: the bit that was on
             ${T('q_{1}',false)} is now on ${T('q_{0}',false)} and back again, which is why SWAP alone can never entangle a product state.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-seg]').forEach(x=>
        x.setAttribute('aria-pressed', String(String(st[x.dataset.seg])===x.dataset.val)));
      root.querySelectorAll('[data-case]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.case===st.gate)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-4-8" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Gate <span class="seg">
                <button data-case="CNOT">CNOT</button>
                <button data-case="CZ">CZ</button>
                <button data-case="SWAP">SWAP</button></span></label></div>
              <div class="ctrl"><label>CNOT direction (CZ and SWAP ignore this) <span class="seg">
                <button data-seg="ctrl" data-val="0">q₀ → q₁</button>
                <button data-seg="ctrl" data-val="1">q₁ → q₀</button></span></label></div>
              <div class="ctrl"><label>Input bit on q₁ <span class="seg">
                <button data-seg="q1" data-val="0">0</button>
                <button data-seg="q1" data-val="1">1</button></span></label></div>
              <div class="ctrl"><label>Input bit on q₀ <span class="seg">
                <button data-seg="q0" data-val="0">0</button>
                <button data-seg="q0" data-val="1">1</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('click', e=>{
        const g = e.target.closest('[data-case]');
        if(g){ st.gate = g.dataset.case; draw(root); return; }
        const s = e.target.closest('[data-seg]');
        if(s){ st[s.dataset.seg] = parseInt(s.dataset.val,10); draw(root); }
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     H4 · REACHING A TARGET WITH H AND T

     A word built from H and T, up to eight letters, multiplied out into one
     net gate, and its distance from a chosen target rotation. The distance is
     one minus the fidelity |Tr(U_target^dagger U_word)|/2, which is zero only
     when the two agree up to a global phase. Switching the target to a
     Clifford rotation lets a word of H and S alone close the gap exactly;
     switching it to T(pi/8) itself does the same in one letter. The
     restricted alphabet — H and S only, no T — is offered so the reader can
     see the distance floor at a nonzero value however long the word grows,
     which is the content of Universal Gate Sets stated as a number rather
     than asserted.
     ======================================================================= */
  const H4 = (() => {
    const MAXLEN = 8;
    let st = { seq:['H','T','H','T'], target:'p8', clifford:false };
    const R2 = Math.SQRT1_2;
    const LETTERS = { H:[[R2,0],[R2,0],[R2,0],[-R2,0]], S:[ONE,Z0,Z0,[0,1]], T:[ONE,Z0,Z0,ph(Math.PI/4)] };
    const TARGETS = {
      p8: { m:[ONE,Z0,Z0,ph(Math.PI/8)], name:'R_{z}(\\pi/4),\\ \\text{off-Clifford}' },
      s  : { m:[ONE,Z0,Z0,[0,1]], name:'S,\\ \\text{Clifford}' },
      h  : { m:[[R2,0],[R2,0],[R2,0],[-R2,0]], name:'H,\\ \\text{Clifford}' }
    };

    function net(letters){
      let M = [ONE,Z0,Z0,ONE];
      letters.forEach(g => { M = mul(LETTERS[g], M); });
      return M;
    }
    /* One minus the (phase-independent) fidelity between two one-qubit
       unitaries: dist = 0 exactly when they agree up to a global phase. */
    function dist(A,B){
      const tr = cad(cx(cj(A[0]),B[0]), cad(cx(cj(A[1]),B[2]), cad(cx(cj(A[2]),B[1]), cx(cj(A[3]),B[3]))));
      return 1 - cabs(tr)/2;
    }

    function draw(root){
      const alphabet = st.clifford ? st.seq.filter(g=>g!=='T') : st.seq;
      const Ms = []; for(let k=0;k<=alphabet.length;k++) Ms.push(net(alphabet.slice(0,k)));
      const tgt = TARGETS[st.target].m;
      const ds = Ms.map(M => dist(M, tgt));

      const a = P.Axes({w:430,h:280,xr:[-0.35, Math.max(1,alphabet.length)+0.35],yr:[-0.05,1.05],
        xlabel:'\\text{length}', ylabel:'\\text{distance from target}',
        pad:{l:64,r:24,t:30,b:46}, xticksOverride:Array.from({length:alphabet.length+1},(_,i)=>i), ytarget:4});
      a.poly(ds.map((d,i)=>[i,d]),{color:P.COL.in,width:2.2});
      ds.forEach((d,i)=>a.point(i,d,{color:P.COL.in,r:4}));
      a.hline(0,{color:P.COL.out,width:1.4,dash:'3 4'});

      root.querySelector('.plots').innerHTML = `<div class="plot-wrap">${a.svg()}</div>`;

      const seqShown = alphabet.length
        ? alphabet.map(g => T(g,false)).join(' <span class="muted">then</span> ')
        : '<span class="muted">empty — add a letter</span>';
      root.querySelector('.ro').innerHTML = `
        <div style="grid-column:1/-1"><dt>Word</dt><dd>${seqShown}</dd></div>
        <div style="grid-column:1/-1"><dt>Target</dt><dd>${T(TARGETS[st.target].name,false)}</dd></div>
        <div><dt>Distance at this length</dt><dd class="${ds[ds.length-1]<1e-6?'okv':''}">${fmt(ds[ds.length-1],4)}</dd></div>
        <div><dt>Alphabet</dt><dd>${st.clifford?'H and S only':'H and T'}</dd></div>`;

      const last = ds[ds.length-1];
      const verdict = alphabet.length === 0
        ? `<div class="note warn"><span class="note-h">No word yet</span>Add a letter to build the net gate.</div>`
        : last < 1e-6
        ? `<div class="note ok"><span class="note-h">Exact, not approximate</span>
             This word's net gate agrees with the target up to a global phase: distance ${T('0',false)}.</div>`
        : st.clifford && st.target === 'p8'
        ? `<div class="note warn"><span class="note-h">The floor does not fall with length</span>
             Every word of H and S alone sends Pauli operators to Pauli operators, and the target here does not.
             Add more letters and the distance stops improving past a fixed floor: length cannot buy what the
             alphabet does not contain.</div>`
        : `<div class="note ok"><span class="note-h">Longer words close the gap</span>
             Distance ${T(fmt(last,4),false)} at length ${alphabet.length}. With T available the target can be reached
             to any accuracy by a long enough word; the cost is paid in length, not in a new kind of gate.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-seg]').forEach(x=>
        x.setAttribute('aria-pressed', String(String(st[x.dataset.seg])===x.dataset.val)));
      root.querySelectorAll('[data-prop]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.prop===st.target)));
    }

    return { mount(root){
      const row = gs => gs.map(g =>
        `<button data-case="${g}">${LABS.KIT.M('$'+g+'$')}</button>`).join('');
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Target <span class="seg">
                <button data-prop="p8">off-Clifford</button>
                <button data-prop="s">S</button>
                <button data-prop="h">H</button></span></label></div>
              <div class="ctrl"><label>Alphabet <span class="seg">
                <button data-seg="clifford" data-val="false">H and T</button>
                <button data-seg="clifford" data-val="true">H and S only</button></span></label></div>
              <div class="ctrl"><label>Add a letter to the end <span class="seg">${row(['H','S','T'])}</span></label></div>
              <div class="ctrl"><label>Edit the word <span class="seg">
                <button data-cls="undo">Undo</button>
                <button data-cls="clear">Clear</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('click', e=>{
        const g = e.target.closest('[data-case]');
        if(g){ if(st.seq.length < MAXLEN) st.seq = st.seq.concat([g.dataset.case]); draw(root); return; }
        const c = e.target.closest('[data-cls]');
        if(c){ st.seq = c.dataset.cls==='clear' ? [] : st.seq.slice(0,-1); draw(root); return; }
        const p = e.target.closest('[data-prop]');
        if(p){ st.target = p.dataset.prop; draw(root); return; }
        const s = e.target.closest('[data-seg]');
        if(s){ st[s.dataset.seg] = s.dataset.val === 'true'; draw(root); }
      });
      draw(root);
    }};
  })();

  return { H1, H2, H3, H4 };
})());
