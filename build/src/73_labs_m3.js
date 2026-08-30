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

   Both compute from the definitions at interaction time. Every Bloch-plane
   figure here is isotropic — equal pixels to the unit on both axes — because
   in both laboratories an angle and the roundness of a circle are the claim
   being made, and an anisotropic frame would draw a false one.
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

  return { E, F };
})());
