/* ==========================================================================
   Module 3 laboratories.

   E · A channel applied to the ball of states — the reader chooses a pure
       input and one of the three elementary qubit channels, and watches both
       the state and the whole set of states deform. The rim of the ball is
       carried along point by point, so the contraction is visible as a shape
       rather than asserted as a number.
   F · CHSH — four measurement directions in one plane, the four correlations
       they produce on a Bell pair, and the one number they combine into,
       against the bound no model with pre-existing values can pass.
   F1 · A point in the Bloch ball — direction and radius set a qubit density
        matrix, and the eigenvalues and purity are read off its length alone.
   F2 · The partial trace, live — a two-qubit state in the Schmidt family, with
        both reduced states computed by the block rule and shown not to move
        when the relative phase does.
   F3 · The product test, on a general state — four amplitudes and two phases,
        the determinant and the Schmidt coefficients recomputed from an
        explicit 2x2 eigenproblem at every setting.
   F4 · Entanglement entropy along a family — one slider drives the entropy,
        both Schmidt weights and the purity of one half together.

   Every computed quantity here is derived from the current sliders at
   interaction time, never looked up from the closed forms the teaching scenes
   print. Every Bloch-plane figure is isotropic — equal pixels to the unit on
   both axes — because in these laboratories an angle and the roundness of a
   circle are the claim being made, and an anisotropic frame would draw a
   false one.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F;
  const P = PLOT;
  const D2R = Math.PI/180;

  /* A square Bloch-plane frame: 300 px over a span of 3.00 on both axes, so
     one unit is 100 px in either direction and the rim is a circle. */
  const disc = () => P.Axes({w:360,h:360,xr:[-1.5,1.5],yr:[-1.5,1.5],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});

  /* The frame of every such figure: the rim of the ball and the two axes it is
     read against. Drawn first, so the data sits over it. */
  function frame(a){
    const ring=[]; for(let i=0;i<=200;i++){ const t=2*Math.PI*i/200;
      ring.push([Math.sin(t),Math.cos(t)]); }
    a.poly(ring,{color:P.COL.grid,width:1.5});
    a.poly([[-1.3,0],[1.3,0]],{color:P.COL.rule,width:1.1});
    a.poly([[0,-1.3],[0,1.3]],{color:P.COL.rule,width:1.1});
    /* The two axis names sit past the far end of every arm — an arm reaches at
       most radius 1.28 — and off the axes themselves, so no measurement
       direction can ever land on one. */
    a.note(1.42,-0.20,'x',{fs:13,color:P.COL.muted,anchor:'middle',tex:true});
    a.note(0.20,1.42,'z',{fs:13,color:P.COL.muted,anchor:'middle',tex:true});
    return a;
  }

  /* =======================================================================
     E · A CHANNEL APPLIED TO THE BALL OF STATES

     The input is the pure state at polar angle theta in the z-x plane, so its
     Bloch vector is (sin theta, 0, cos theta). Each channel is applied as its
     action on that vector, derived once from the Kraus operators:

        depolarising      r -> (1 - p) r
        amplitude damping (rx, rz) -> (sqrt(1-p) rx,  p + (1-p) rz)
        phase damping     rx -> (1 - 2p) rx,   rz unchanged

     Nothing is tabulated: the rim of the ball is the image of the unit circle
     under the same map, computed point by point.
     ======================================================================= */
  const E = (() => {
    let st = { theta:60, str:50, chan:'depol' };

    const par = () => st.str/100;

    /* One channel, acting on a Bloch vector in the plane. The strength is an
       argument rather than read from the state, so the purity curve can be
       drawn at every strength without the control moving. */
    function act(rx, rz, p){
      if(st.chan==='depol') return [(1-p)*rx, (1-p)*rz];
      if(st.chan==='damp')  return [Math.sqrt(1-p)*rx, p + (1-p)*rz];
      return [(1-2*p)*rx, rz];
    }

    /* The purity of a qubit state from the length of its vector. */
    const pur = (rx,rz) => 0.5*(1 + rx*rx + rz*rz);

    const NAME = { depol:'depolarising', damp:'amplitude damping', phase:'phase damping' };

    function draw(root){
      const th = st.theta*D2R;
      const ix = Math.sin(th), iz = Math.cos(th);
      const out = act(ix, iz, par());
      const ox = out[0], oz = out[1];
      const len = Math.hypot(ox, oz);
      const gamma = pur(ox, oz);
      const lo = 0.5*(1-len), hi = 0.5*(1+len);

      /* ---- the ball, its image, and the two states ---- */
      const a = frame(disc());
      const img=[]; for(let i=0;i<=200;i++){ const t=2*Math.PI*i/200;
        const q = act(Math.sin(t), Math.cos(t), par()); img.push([q[0], q[1]]); }
      a.poly(img,{color:P.COL.h,width:2.0});
      a.poly([[0,0],[ix,iz]],{color:P.COL.in,width:2.6});
      a.point(ix,iz,{color:P.COL.in,r:6});
      a.note(ix,iz,'\\text{in}',{fs:13,color:P.COL.in,dx:9,dy:-6,tex:true});
      a.poly([[0,0],[ox,oz]],{color:P.COL.out,width:2.6});
      a.point(ox,oz,{color:P.COL.out,r:6});
      a.note(ox,oz,'\\text{out}',{fs:13,color:P.COL.out,dx:9,dy:16,tex:true});
      a.point(0,0,{color:P.COL.err,r:4});

      /* ---- purity against the strength, for this input and this channel ---- */
      const b = P.Axes({w:430,h:300,xr:[0,1],yr:[0.35,1.08],
        xlabel:'\\text{strength}', ylabel:'\\operatorname{Tr}\\rho^{2}',
        pad:{l:66,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      b.curve(u => { const q = act(ix, iz, u); return pur(q[0], q[1]); },
        {color:P.COL.in, width:2.4, n:220});
      b.hline(0.5,{color:P.COL.err,width:1.4,dash:'4 4'});
      b.vline(par(),{color:P.COL.h,width:1.6,dash:'3 4'});
      b.point(par(), gamma, {color:P.COL.h, r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>Channel</dt><dd>${NAME[st.chan]}</dd></div>
        <div><dt>Strength</dt><dd>${fmt(par(),3)}</dd></div>
        <div><dt>Input vector</dt><dd>(${fmt(ix,3)}, 0, ${fmt(iz,3)})</dd></div>
        <div><dt>Output vector</dt><dd>(${fmt(ox,3)}, 0, ${fmt(oz,3)})</dd></div>
        <div><dt>Length out</dt><dd>${fmt(len,4)}</dd></div>
        <div><dt>Purity out</dt><dd class="${gamma>0.999?'okv':'warnv'}">${fmt(gamma,5)}</dd></div>
        <div><dt>Eigenvalues</dt><dd>${fmt(hi,4)}, ${fmt(lo,4)}</dd></div>
        <div><dt>Still a state</dt><dd class="${len<=1+1e-9?'okv':'warnv'}">${len<=1+1e-9?'yes':'no'}</dd></div>`;

      const fixed = st.chan==='depol'
        ? `<div class="note ok"><span class="note-h">One fixed point, at the centre</span>
             The amber curve is the whole ball after the channel: a circle of radius
             ${T(fmt(1-par(),3),false)}, shrunk towards ${T('I/2',false)} and not moved anywhere.
             Every direction is treated alike, so the only state this channel leaves alone is the
             centre itself. At full strength the ball collapses to that one point and every input
             gives the same output, which is a channel that has destroyed everything.</div>`
        : st.chan==='damp'
        ? `<div class="note warn"><span class="note-h">One fixed point, at the top</span>
             The ball shrinks and its centre climbs towards ${T('|0\\rangle',false)}: the channel
             takes energy out and has nowhere to put it back. The only state it leaves alone is
             ${T('|0\\rangle',false)} itself, at the top of the rim. The image is an ellipse rather
             than a circle, because the two directions shrink by different amounts —
             ${T('\\sqrt{1-p}',false)} across and ${T('1-p',false)} along ${T('z',false)} — and it
             is pushed upwards by ${T('r_{z}\\mapsto p+(1-p)r_{z}',false)}.</div>`
        : `<div class="note warn"><span class="note-h">A whole line of fixed points</span>
             The vertical component never moves, so every state on the ${T('z',false)} axis is left
             exactly as it was and the ball is squashed onto that axis rather than towards a point.
             This is why a qubit resting in ${T('|0\\rangle',false)} or ${T('|1\\rangle',false)} is
             untouched by any amount of dephasing, and a qubit in
             ${T('|{+}\\rangle',false)} is destroyed by it. Past
             ${T('p=\\tfrac12',false)} the width grows again with the sign reversed: at
             ${T('p=1',false)} the channel is the gate ${T('Z',false)} and nothing has been lost.</div>`;
      root.querySelector('.verdict').innerHTML = fixed;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg=chan]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.val===st.chan)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Channel <span class="seg">
                <button data-seg="chan" data-val="depol">Depolarising</button>
                <button data-seg="chan" data-val="damp">Damping</button>
                <button data-seg="chan" data-val="phase">Dephasing</button></span></label></div>
              <div class="ctrl"><label>Input polar angle θ, degrees <span class="val" data-out="theta">60</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="60"></div>
              <div class="ctrl"><label>Strength, per cent <span class="val" data-out="str">50</span></label>
                <input type="range" data-v="str" min="0" max="100" step="1" value="50"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', e=>{ const x=e.target.closest('[data-seg=chan]'); if(!x) return;
        st.chan = x.dataset.val; draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     F · CHSH: FOUR ANGLES AND ONE NUMBER

     Both parties hold one qubit of |Phi+> and each measures along a direction
     in the z-x plane at angle a from z, so n = (sin a, 0, cos a). For that
     state

        <(n.sigma) (x) (m.sigma)> = n_x m_x - n_y m_y + n_z m_z = cos(a - b)

     and the CHSH combination is assembled from four such correlations. Both
     bounds drawn on the sweep are constants of the subject and not of this
     laboratory: 2 for any model with pre-existing values, 2 sqrt 2 for
     quantum mechanics.
     ======================================================================= */
  const F = (() => {
    let st = { a0:0, a1:90, b0:45, b1:-45 };

    const corr = (a,b) => Math.cos((a-b)*D2R);
    const chsh = (a0,a1,b0,b1) =>
      corr(a0,b0) + corr(a0,b1) + corr(a1,b0) - corr(a1,b1);

    function draw(root){
      const { a0, a1, b0, b1 } = st;
      const E00 = corr(a0,b0), E01 = corr(a0,b1),
            E10 = corr(a1,b0), E11 = corr(a1,b1);
      const S = E00 + E01 + E10 - E11;
      const TS = 2*Math.SQRT2;

      /* ---- the four directions, drawn where they actually point ---- */
      const a = frame(disc());
      const arms = [[a0,'A_{0}',P.COL.in],[a1,'A_{1}',P.COL.mid],
                    [b0,'B_{0}',P.COL.h],[b1,'B_{1}',P.COL.out]];
      arms.forEach(([ang,lab,col],k)=>{
        const x = Math.sin(ang*D2R), z = Math.cos(ang*D2R);
        const r = 1.00 - 0.06*k;
        a.poly([[0,0],[x*r,z*r]],{color:col,width:2.6});
        a.point(x*r,z*r,{color:col,r:5});
        /* the name sits beyond the end of its own arm, so it never lands on
           the marker or on any other arm, which all stop at radius one */
        a.note(x*(r+0.28), z*(r+0.28), lab, {fs:13,color:col,anchor:'middle',dy:5,tex:true});
      });

      /* ---- S as the first of the second party's two settings is swept ---- */
      const b = P.Axes({w:430,h:300,xr:[-180,180],yr:[-3.2,3.2],
        xlabel:'B_{0}\\,(\\text{degrees})', ylabel:'S',
        pad:{l:60,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      b.curve(u => chsh(a0,a1,u,b1), {color:P.COL.in, width:2.4, n:420});
      b.hline(2,{color:P.COL.err,width:1.6,dash:'5 4'});
      b.hline(-2,{color:P.COL.err,width:1.6,dash:'5 4'});
      b.hline(TS,{color:P.COL.out,width:1.2,dash:'2 4'});
      b.hline(-TS,{color:P.COL.out,width:1.2,dash:'2 4'});
      b.vline(b0,{color:P.COL.h,width:1.6,dash:'3 4'});
      b.point(b0, S, {color:P.COL.h, r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      const beats = Math.abs(S) > 2 + 1e-12;
      root.querySelector('.ro').innerHTML = `
        <div><dt>⟨A₀B₀⟩</dt><dd>${fmt(E00,4)}</dd></div>
        <div><dt>⟨A₀B₁⟩</dt><dd>${fmt(E01,4)}</dd></div>
        <div><dt>⟨A₁B₀⟩</dt><dd>${fmt(E10,4)}</dd></div>
        <div><dt>⟨A₁B₁⟩</dt><dd>${fmt(E11,4)}</dd></div>
        <div><dt>S</dt><dd class="${beats?'okv':'warnv'}">${fmt(S,5)}</dd></div>
        <div><dt>Classical bound</dt><dd>2</dd></div>
        <div><dt>Largest S allowed</dt><dd>${fmt(TS,5)}</dd></div>
        <div><dt>Beats the bound</dt><dd class="${beats?'okv':'warnv'}">${beats?'yes':'no'}</dd></div>`;

      const near = Math.abs(Math.abs(S) - TS) < 1e-3;
      const verdict = near
        ? `<div class="note ok"><span class="note-h">As far as quantum mechanics goes</span>
             ${T('|S|=2\\sqrt2\\approx 2.8284',false)}, the largest value any quantum state and any
             measurements can produce. Every one of the four correlations has modulus
             ${T(fmt(Math.abs(E00),4),false)} here, and three of them add while the fourth is
             subtracted. Note that no correlation is ${T('\\pm1',false)}: the maximum is not reached
             by making any single term certain.</div>`
        : beats
        ? `<div class="note ok"><span class="note-h">Past the bound, and by how much</span>
             ${T('|S|='+fmt(Math.abs(S),4),false)} against a classical ceiling of
             ${T('2',false)}. No assignment of four values ${T('\\pm1',false)} fixed before the
             settings were chosen reaches this, so the four outcomes did not exist together. The
             sweep shows how much of the circle does this: the violation is not a knife edge, which
             is what makes the experiment possible at all.</div>`
        : `<div class="note warn"><span class="note-h">Inside the classical bound</span>
             ${T('|S|='+fmt(Math.abs(S),4),false)} is at most ${T('2',false)}, so these four
             settings prove nothing — a model with pre-existing values reproduces them. That is not
             a statement about the state, which is the same Bell pair throughout. Bad angles hide a
             real violation, and finding good ones is a genuine part of running the experiment.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>A₀ angle, degrees <span class="val" data-out="a0">0</span></label>
                <input type="range" data-v="a0" min="-180" max="180" step="5" value="0"></div>
              <div class="ctrl"><label>A₁ angle, degrees <span class="val" data-out="a1">90</span></label>
                <input type="range" data-v="a1" min="-180" max="180" step="5" value="90"></div>
              <div class="ctrl"><label>B₀ angle, degrees <span class="val" data-out="b0">45</span></label>
                <input type="range" data-v="b0" min="-180" max="180" step="5" value="45"></div>
              <div class="ctrl"><label>B₁ angle, degrees <span class="val" data-out="b1">-45</span></label>
                <input type="range" data-v="b1" min="-180" max="180" step="5" value="-45"></div>
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
     F1 · A POINT IN THE BLOCH BALL

     The reader sets a direction (polar angle theta from z, azimuth phi in the
     x-y plane) and a radius r, and gets the qubit density matrix
        rho = (1/2)(I + r n . sigma),   n = (sin theta cos phi, sin theta sin
     phi, cos theta), read off the cross-section at that azimuth. Everything on
     the readout — the four matrix entries, the two eigenvalues, the purity —
     is recomputed from (r, theta, phi) each time a slider moves, never looked
     up from a table.
     ======================================================================= */
  const F1 = (() => {
    let st = { theta:60, phi:0, r:60 };

    /* the Bloch vector, and the four entries of rho in the Pauli expansion */
    function rho(theta, phi, r){
      const th = theta*D2R, ph = phi*D2R;
      const nx = Math.sin(th)*Math.cos(ph), ny = Math.sin(th)*Math.sin(ph), nz = Math.cos(th);
      const rx = r*nx, ry = r*ny, rz = r*nz;
      const p0 = 0.5*(1+rz), p1 = 0.5*(1-rz);
      const cRe = 0.5*rx, cIm = -0.5*ry; /* rho_01 = (rx - i ry)/2 */
      return { rx, ry, rz, p0, p1, cRe, cIm };
    }

    function draw(root){
      const r = st.r/100;
      const { rx, ry, rz, p0, p1, cRe, cIm } = rho(st.theta, st.phi, r);
      const len = Math.hypot(rx,ry,rz);
      const gamma = 0.5*(1+len*len);
      const lo = 0.5*(1-len), hi = 0.5*(1+len);

      /* the x-z cross-section at the chosen azimuth: the projection of the
         vector onto the plane containing z and the horizontal direction n,
         i.e. the point (r sin theta, r cos theta) in that tilted plane */
      const a = frame(disc());
      const px = r*Math.sin(st.theta*D2R), pz = r*Math.cos(st.theta*D2R);
      a.poly([[0,0],[px,pz]],{color:P.COL.in,width:2.6});
      a.point(px,pz,{color:P.COL.in,r:6});
      a.note(px,pz,'\\rho',{fs:13,color:P.COL.in,dx:9,dy:-6,tex:true});
      a.point(0,0,{color:P.COL.err,r:4});

      /* the purity against radius, for this direction, held fixed */
      const b = P.Axes({w:430,h:300,xr:[0,1],yr:[0.35,1.08],
        xlabel:'r', ylabel:'\\operatorname{Tr}\\rho^{2}',
        pad:{l:66,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      b.curve(u => 0.5*(1+u*u), {color:P.COL.in, width:2.4, n:220});
      b.hline(0.5,{color:P.COL.err,width:1.4,dash:'4 4'});
      b.vline(r,{color:P.COL.h,width:1.6,dash:'3 4'});
      b.point(r, gamma, {color:P.COL.h, r:6});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>Bloch vector</dt><dd>(${fmt(rx,3)}, ${fmt(ry,3)}, ${fmt(rz,3)})</dd></div>
        <div><dt>Length |r|</dt><dd>${fmt(len,4)}</dd></div>
        <div><dt>p&#8320;</dt><dd>${fmt(p0,4)}</dd></div>
        <div><dt>p&#8321;</dt><dd>${fmt(p1,4)}</dd></div>
        <div><dt>Re(&rho;&#8320;&#8321;)</dt><dd>${fmt(cRe,4)}</dd></div>
        <div><dt>Im(&rho;&#8320;&#8321;)</dt><dd>${fmt(cIm,4)}</dd></div>
        <div><dt>Purity</dt><dd class="${gamma>0.999?'okv':'warnv'}">${fmt(gamma,5)}</dd></div>
        <div><dt>Eigenvalues</dt><dd>${fmt(hi,4)}, ${fmt(lo,4)}</dd></div>`;

      const onRim = Math.abs(len-1) < 1e-9;
      root.querySelector('.verdict').innerHTML = onRim
        ? `<div class="note ok"><span class="note-h">On the rim, a pure state</span>
             At full radius the eigenvalues are ${T('1',false)} and ${T('0',false)}: this is a rank-one
             projector, ${T('\\rho=|\\psi\\rangle\\langle\\psi|',false)} for some vector, and no vector
             gives anything shorter.</div>`
        : `<div class="note warn"><span class="note-h">Length is the whole of purity</span>
             The direction ${T('(\\theta,\\varphi)',false)} decides where the state points; only the
             length decides how mixed it is. Two states with the same ${T('\\theta',false)} and
             ${T('\\varphi',false)} but different ${T('r',false)} have the same eigenvectors and different
             eigenvalues — turning the radius slider alone never moves the point sideways in this
             cross-section, because the azimuth is held fixed while it moves.</div>`;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Polar angle &theta;, degrees <span class="val" data-out="theta">60</span></label>
                <input type="range" data-v="theta" min="0" max="180" step="5" value="60"></div>
              <div class="ctrl"><label>Azimuth &phi;, degrees <span class="val" data-out="phi">0</span></label>
                <input type="range" data-v="phi" min="-180" max="180" step="5" value="0"></div>
              <div class="ctrl"><label>Radius r, per cent <span class="val" data-out="r">60</span></label>
                <input type="range" data-v="r" min="0" max="100" step="1" value="60"></div>
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
     F2 · THE PARTIAL TRACE, LIVE

     The state is drawn from the one-parameter family
        |psi> = cos(theta)|00> + sin(theta) e^{i phi} |11>,
     the same family the Schmidt-decomposition section uses, so the reader
     already knows its coefficients. Both reduced states are computed by the
     block rule of 3.5.2 at interaction time — never assumed to be diagonal —
     and both come out diagonal here because the state has no |01> or |10>
     term; the readout shows the off-diagonal entries are exactly zero rather
     than merely small, which is itself worth noticing.
     ======================================================================= */
  const F2 = (() => {
    let st = { theta:45, phi:0 };

    /* the four amplitudes of |psi>, in the order c0=|00>, c1=|01>, c2=|10>, c3=|11> */
    function amps(theta, phi){
      const th = theta*D2R, ph = phi*D2R;
      const c0 = { re:Math.cos(th), im:0 };
      const c3 = { re:Math.sin(th)*Math.cos(ph), im:Math.sin(th)*Math.sin(ph) };
      return [c0, {re:0,im:0}, {re:0,im:0}, c3];
    }
    const cmul = (a,b)=>({re:a.re*b.re-a.im*b.im, im:a.re*b.im+a.im*b.re});
    const conj = a=>({re:a.re, im:-a.im});

    /* rho_A by the block rule: trace of each 2x2 block of the 4x4 matrix
       c c^dagger, read in the |q1 q0> ordering this course fixes. Written out
       from the block structure rather than from a shortcut for this family,
       so the same code would work for a state with all four amplitudes. */
    function reduced(c){
      /* M[i][j] = c_i c_j^*, blocks indexed by the left qubit */
      const M = (i,j)=>cmul(c[i], conj(c[j]));
      const tr = (i0,j0)=>{ const a=M(i0,j0), b=M(i0+1,j0+1); return {re:a.re+b.re, im:a.im+b.im}; };
      /* rho_A: trace of block (q1=0,q1=0), (q1=0,q1=1) etc, stepping by 2 */
      const rhoA00 = tr(0,0), rhoA01 = tr(0,1), rhoA10 = tr(2,0), rhoA11 = tr(2,2);
      /* rho_B: sum of the diagonal blocks M00+M11 (each block indexed by q0) */
      const rhoB00 = { re:M(0,0).re+M(2,2).re, im:M(0,0).im+M(2,2).im };
      const rhoB01 = { re:M(0,1).re+M(2,3).re, im:M(0,1).im+M(2,3).im };
      const rhoB10 = { re:M(1,0).re+M(3,2).re, im:M(1,0).im+M(3,2).im };
      const rhoB11 = { re:M(1,1).re+M(3,3).re, im:M(1,1).im+M(3,3).im };
      return { A:{p00:rhoA00.re, c01:rhoA01, p11:rhoA11.re},
               B:{p00:rhoB00.re, c01:rhoB01, p11:rhoB11.re} };
    }
    const pur = (p00,c01,p11) => p00*p00 + p11*p11 + 2*(c01.re*c01.re+c01.im*c01.im);

    function draw(root){
      const c = amps(st.theta, st.phi);
      const { A, B } = reduced(c);
      const gA = pur(A.p00, A.c01, A.p11), gB = pur(B.p00, B.c01, B.p11);
      const gWhole = c.reduce((s,x)=>s+x.re*x.re+x.im*x.im, 0); /* should print 1 */

      /* ---- purity of each half against theta, phi held fixed ---- */
      const a = P.Axes({w:430,h:300,xr:[0,90],yr:[0.35,1.08],
        xlabel:'\\theta\\,(\\text{degrees})', ylabel:'\\operatorname{Tr}\\rho^{2}',
        pad:{l:66,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      a.curve(u => { const th=u*D2R; const p=Math.cos(th)**2, q=Math.sin(th)**2;
        return p*p+q*q; }, {color:P.COL.in, width:2.4, n:220});
      a.hline(0.5,{color:P.COL.err,width:1.4,dash:'4 4'});
      a.vline(st.theta,{color:P.COL.h,width:1.6,dash:'3 4'});
      a.point(st.theta, gA, {color:P.COL.h, r:6});

      /* ---- the two reduced states as bars: population and |coherence| ---- */
      const b = P.Axes({w:430,h:300,xr:[0,4.4],yr:[0,1.08],
        ylabel:'\\text{value}', pad:{l:56,r:20,t:26,b:56}, xticksOverride:[], ytarget:4});
      const bar=(n,v,f,l)=>{ b.rect(n-0.28,0,n+0.28,v,{fill:f}); b.poly([[n-0.28,v],[n+0.28,v]],{color:l,width:2.6}); };
      bar(0.7, A.p00, P.COL.dec.in, P.COL.in);
      bar(1.7, Math.hypot(A.c01.re,A.c01.im), P.COL.dec.mid, P.COL.mid);
      bar(2.9, B.p00, P.COL.dec.out, P.COL.out);
      bar(3.9, Math.hypot(B.c01.re,B.c01.im), P.COL.dec.mid, P.COL.mid);
      [['\\rho_{A,00}',0.7],['|\\rho_{A,01}|',1.7],['\\rho_{B,00}',2.9],['|\\rho_{B,01}|',3.9]].forEach(([t,x])=>
        b.note(x,0,t,{fs:12,color:P.COL.muted,anchor:'middle',dy:24,tex:true}));

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>c&#8320;</dt><dd>${fmt(c[0].re,4)}</dd></div>
        <div><dt>c&#8323;</dt><dd>${fmt(c[3].re,4)} + ${fmt(c[3].im,4)}i</dd></div>
        <div><dt>&rho;<sub>A</sub></dt><dd>diag(${fmt(A.p00,4)}, ${fmt(A.p11,4)})</dd></div>
        <div><dt>&rho;<sub>B</sub></dt><dd>diag(${fmt(B.p00,4)}, ${fmt(B.p11,4)})</dd></div>
        <div><dt>Purity of whole</dt><dd class="${Math.abs(gWhole-1)<1e-9?'okv':'warnv'}">${fmt(gWhole,6)}</dd></div>
        <div><dt>Purity of A</dt><dd>${fmt(gA,4)}</dd></div>
        <div><dt>Purity of B</dt><dd>${fmt(gB,4)}</dd></div>`;

      const uncorrelated = Math.abs(st.theta) < 1e-9 || Math.abs(st.theta-90) < 1e-9;
      root.querySelector('.verdict').innerHTML = uncorrelated
        ? `<div class="note ok"><span class="note-h">A product, at either end</span>
             At ${T('\\theta=0',false)} or ${T('\\theta=90^\\circ',false)} the state is one computational
             basis state, a product, and both halves are pure: turning ${T('\\varphi',false)} does
             nothing here, because a global phase on a product state is not physical.</div>`
        : `<div class="note warn"><span class="note-h">The phase never reaches either half</span>
             ${T('\\rho_{A}',false)} and ${T('\\rho_{B}',false)} depend on ${T('\\theta',false)} and not at
             all on ${T('\\varphi',false)}, though the whole state does. Drag the phase slider and watch
             both bars sit still: the joint state changes and every prediction about one qubit alone
             does not, which is the content of no signalling two sections ahead.</div>`;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>&theta;, degrees <span class="val" data-out="theta">45</span></label>
                <input type="range" data-v="theta" min="0" max="90" step="1" value="45"></div>
              <div class="ctrl"><label>&phi;, degrees <span class="val" data-out="phi">0</span></label>
                <input type="range" data-v="phi" min="-180" max="180" step="5" value="0"></div>
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
     F3 · THE PRODUCT TEST, ON A GENERAL STATE

     Three independent amplitude magnitudes and one relative phase, normalised
     at interaction time, so the reader can steer a genuinely general two-qubit
     pure state rather than a one-parameter family, with the fourth magnitude
     fixed as the reference the other three are read against. The determinant
     c0 c3 - c1 c2 is recomputed from the four complex amplitudes on every
     move, and the Schmidt coefficients come from an explicit 2x2 eigenproblem.
     ======================================================================= */
  const F3 = (() => {
    let st = { a1:40, a2:40, a3:100, p3:0 };

    /* normalise the four magnitudes, with the phase on c3 only: c0, c1, c2
       kept real. A relative phase between any two of the four is enough to
       move the determinant off the real axis, and this is the shortest
       control set that still lets the reader reach both a product and a
       maximally entangled state. */
    function amps(){
      const mags = [100, st.a1, st.a2, st.a3].map(v=>v/100);
      const norm = Math.hypot(...mags) || 1;
      const m = mags.map(v=>v/norm);
      const c0 = {re:m[0], im:0}, c1 = {re:m[1], im:0}, c2 = {re:m[2], im:0};
      const c3 = {re:m[3]*Math.cos(st.p3*D2R), im:m[3]*Math.sin(st.p3*D2R)};
      return [c0,c1,c2,c3];
    }
    const cmul = (a,b)=>({re:a.re*b.re-a.im*b.im, im:a.re*b.im+a.im*b.re});
    const csub = (a,b)=>({re:a.re-b.re, im:a.im-b.im});
    const cabs = a=>Math.hypot(a.re,a.im);

    /* the two Schmidt coefficients of the 2x2 coefficient matrix C = [[c0,c1],[c2,c3]],
       from the eigenvalues of C C^dagger — an explicit 2x2 Hermitian
       eigenproblem rather than a library SVD, so the numbers are traceable */
    function schmidt(c){
      const [c0,c1,c2,c3] = c;
      /* G = C C^dagger, a 2x2 Hermitian matrix */
      const g00 = cabs(c0)**2 + cabs(c1)**2;
      const g11 = cabs(c2)**2 + cabs(c3)**2;
      const g01re = c0.re*c2.re+c0.im*c2.im + c1.re*c3.re+c1.im*c3.im;
      const g01im = c0.im*c2.re-c0.re*c2.im + c1.im*c3.re-c1.re*c3.im;
      const g01abs = Math.hypot(g01re,g01im);
      const tr = g00+g11, disc = Math.sqrt(Math.max(0,(g00-g11)**2 + 4*g01abs*g01abs));
      return [0.5*(tr+disc), 0.5*(tr-disc)];
    }

    function draw(root){
      const c = amps();
      const det = csub(cmul(c[0],c[3]), cmul(c[1],c[2]));
      const detAbs = cabs(det);
      const [l1,l2] = schmidt(c);
      const rank = l2 > 1e-6 ? 2 : 1;

      /* ---- the four amplitudes as a 2x2 array of point markers, sized by |c| ---- */
      const a = P.Axes({w:430,h:300,xr:[-0.6,1.6],yr:[-0.6,1.6],
        pad:{l:40,r:20,t:20,b:40}, xticksOverride:[], yticksOverride:[],
        grid:false, zeroAxes:false, arrows:false});
      const cell=(x,y,v,lab)=>{ const r = 4+22*cabs(v);
        a.point(x,y,{color:P.COL.in,r}); a.note(x,y,lab,{fs:12,color:P.COL.ink,dy:-16-r,anchor:'middle',tex:true}); };
      cell(0,1,c[0],'c_{0}'); cell(1,1,c[1],'c_{1}');
      cell(0,0,c[2],'c_{2}'); cell(1,0,c[3],'c_{3}');
      a.note(0.5,1.5,'|q_{0}\\rangle',{fs:12,color:P.COL.muted,anchor:'middle',tex:true});
      a.note(-0.45,0.5,'|q_{1}\\rangle',{fs:12,color:P.COL.muted,anchor:'middle',tex:true});

      /* ---- the two Schmidt coefficients as bars, always adding to one ---- */
      const b = P.Axes({w:430,h:300,xr:[0,2.4],yr:[0,1.08],
        ylabel:'\\lambda', pad:{l:56,r:20,t:26,b:46}, xticksOverride:[], ytarget:4});
      const bar=(n,v,f,l)=>{ b.rect(n-0.3,0,n+0.3,v,{fill:f}); b.poly([[n-0.3,v],[n+0.3,v]],{color:l,width:2.6}); };
      bar(0.6, l1, P.COL.dec.in, P.COL.in);
      bar(1.8, l2, P.COL.dec.mid, P.COL.mid);
      b.note(0.6,0,'\\lambda_{1}',{fs:13,color:P.COL.in,anchor:'middle',dy:24,tex:true});
      b.note(1.8,0,'\\lambda_{2}',{fs:13,color:P.COL.mid,anchor:'middle',dy:24,tex:true});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>c&#8320;</dt><dd>${fmt(c[0].re,3)}</dd></div>
        <div><dt>c&#8321;</dt><dd>${fmt(c[1].re,3)}</dd></div>
        <div><dt>c&#8322;</dt><dd>${fmt(c[2].re,3)}</dd></div>
        <div><dt>c&#8323;</dt><dd>${fmt(c[3].re,3)} + ${fmt(c[3].im,3)}i</dd></div>
        <div><dt>|c&#8320;c&#8323; - c&#8321;c&#8322;|</dt><dd class="${detAbs<1e-6?'warnv':'okv'}">${fmt(detAbs,5)}</dd></div>
        <div><dt>&lambda;&#8321;, &lambda;&#8322;</dt><dd>${fmt(l1,4)}, ${fmt(l2,4)}</dd></div>
        <div><dt>&lambda;&#8321;+&lambda;&#8322;</dt><dd class="${Math.abs(l1+l2-1)<1e-6?'okv':'warnv'}">${fmt(l1+l2,6)}</dd></div>
        <div><dt>Schmidt rank</dt><dd class="${rank===1?'warnv':'okv'}">${rank}</dd></div>`;

      root.querySelector('.verdict').innerHTML = rank===1
        ? `<div class="note warn"><span class="note-h">Rank one is a product</span>
             The determinant is zero to the precision shown and one Schmidt coefficient is zero: this
             state factors as one vector on the left qubit times one on the right, and the array of
             four points has the shape of an outer product — one row is a multiple of the other.</div>`
        : `<div class="note ok"><span class="note-h">Two terms, genuinely entangled</span>
             Neither Schmidt coefficient is zero, so no single product state reproduces these four
             amplitudes. The determinant and the smaller of the two ${T('\\lambda',false)} vanish
             together and nowhere else — that agreement, not a resemblance between the pictures, is
             the actual claim of the product test.</div>`;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>|c&#8321;|, per cent of |c&#8320;| <span class="val" data-out="a1">40</span></label>
                <input type="range" data-v="a1" min="0" max="100" step="1" value="40"></div>
              <div class="ctrl"><label>|c&#8322;|, per cent of |c&#8320;| <span class="val" data-out="a2">40</span></label>
                <input type="range" data-v="a2" min="0" max="100" step="1" value="40"></div>
              <div class="ctrl"><label>|c&#8323;|, per cent of |c&#8320;| <span class="val" data-out="a3">100</span></label>
                <input type="range" data-v="a3" min="0" max="100" step="1" value="100"></div>
              <div class="ctrl"><label>Phase of c&#8323;, degrees <span class="val" data-out="p3">0</span></label>
                <input type="range" data-v="p3" min="-180" max="180" step="5" value="0"></div>
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
     F4 · ENTANGLEMENT ENTROPY ALONG A FAMILY

     The same family cos(theta)|00> + sin(theta)|11> the Schmidt section
     draws statically. Here the reader sweeps theta and the entropy, the two
     Schmidt coefficients and the purity of one half are all read off a
     single moving marker, so the three quantities are seen agreeing at every
     setting rather than only at the two or three the static figure marks.
     ======================================================================= */
  const F4 = (() => {
    let st = { theta:45 };

    const h = l => (l<=1e-12 || l>=1-1e-12) ? 0 : -l*Math.log2(l) - (1-l)*Math.log2(1-l);

    function draw(root){
      const th = st.theta*D2R;
      const l1 = Math.cos(th)**2, l2 = Math.sin(th)**2;
      const S = h(l1);
      const purity = l1*l1 + l2*l2;

      /* ---- entropy against theta, with the moving marker ---- */
      const a = P.Axes({w:430,h:300,xr:[0,90],yr:[0,1.12],
        xlabel:'\\theta\\,(\\text{degrees})', ylabel:'S\\,(\\text{bits})',
        pad:{l:60,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      a.curve(u => h(Math.cos(u*D2R)**2), {color:P.COL.in, width:2.4, n:220});
      a.vline(st.theta,{color:P.COL.h,width:1.6,dash:'3 4'});
      a.point(st.theta, S, {color:P.COL.h, r:6});
      a.hline(1,{color:P.COL.err,width:1.2,dash:'2 4'});

      /* ---- the two Schmidt coefficients, and the purity, against theta ---- */
      const b = P.Axes({w:430,h:300,xr:[0,90],yr:[0,1.08],
        xlabel:'\\theta\\,(\\text{degrees})', ylabel:'\\text{value}',
        pad:{l:60,r:24,t:30,b:46}, xtarget:4, ytarget:4});
      b.curve(u => Math.cos(u*D2R)**2, {color:P.COL.in, width:2.2});
      b.curve(u => Math.sin(u*D2R)**2, {color:P.COL.mid, width:2.0, dash:'5 4'});
      b.curve(u => (Math.cos(u*D2R)**4+Math.sin(u*D2R)**4), {color:P.COL.out, width:1.8, dash:'2 3'});
      b.vline(st.theta,{color:P.COL.h,width:1.4,dash:'3 4'});
      b.note(12,1.02,'\\lambda_{1}',{fs:12,color:P.COL.in,anchor:'middle',tex:true});
      b.note(78,1.02,'\\lambda_{2}',{fs:12,color:P.COL.mid,anchor:'middle',tex:true});
      b.note(45,0.30,'\\operatorname{Tr}\\rho_{A}^{2}',{fs:12,color:P.COL.out,anchor:'middle',dx:70,tex:true});

      root.querySelector('.plots').innerHTML =
        `<div class="labgrid">${a.svg()}${b.svg()}</div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>&lambda;&#8321;</dt><dd>${fmt(l1,4)}</dd></div>
        <div><dt>&lambda;&#8322;</dt><dd>${fmt(l2,4)}</dd></div>
        <div><dt>Entropy S</dt><dd>${fmt(S,5)} bits</dd></div>
        <div><dt>Purity of A</dt><dd>${fmt(purity,5)}</dd></div>
        <div><dt>2<sup>&#8722;S</sup></dt><dd>${fmt(Math.pow(2,-S),4)}</dd></div>`;

      const atEnd = st.theta<=1e-9 || st.theta>=89.999;
      const atMid = Math.abs(st.theta-45)<1e-9;
      root.querySelector('.verdict').innerHTML = atEnd
        ? `<div class="note err"><span class="note-h">A product, zero entropy</span>
             One Schmidt coefficient is ${T('0',false)} and the other is ${T('1',false)}: the state is
             one computational basis state and the reduced state is pure, so ${T('S=0',false)}. Purity
             is ${T('1',false)} here too — the two quantities agree at being extreme together, not by
             coincidence: both are functions of the same single number, ${T('\\lambda_{1}',false)}.</div>`
        : atMid
        ? `<div class="note ok"><span class="note-h">One ebit, at equal weights</span>
             ${T('\\lambda_{1}=\\lambda_{2}=\\tfrac12',false)} gives ${T('S=1',false)} bit, the most a
             single qubit pair can carry, and the purity of ${T('\\rho_{A}',false)} is at its lowest,
             ${T('\\tfrac12',false)}. Entropy and purity move oppositely: high entropy is low purity.</div>`
        : `<div class="note warn"><span class="note-h">Entropy and purity move together, not equal</span>
             Away from the middle the two Schmidt weights are unequal, so ${T('S',false)} sits strictly
             between ${T('0',false)} and ${T('1',false)} bit. Purity here is not ${T('1-S',false)} or any
             simple function read off the graph by eye; it is the second curve's own value at this
             ${T('\\theta',false)}, computed from the same two ${T('\\lambda',false)} the entropy uses.</div>`;

      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>&theta;, degrees <span class="val" data-out="theta">45</span></label>
                <input type="range" data-v="theta" min="0" max="90" step="1" value="45"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      draw(root);
    }};
  })();

  return { E, F, F1, F2, F3, F4 };
})());
