/* ==========================================================================
   Module 6 laboratory.

   K · Phase estimation — the reader chooses the phase to be measured and the
       number of counting qubits, and the laboratory draws the distribution
       over the readings the circuit would produce. The left panel is that
       distribution; the right panel is how the probability of landing on the
       nearest reading behaves as the register grows, with the two guaranteed
       floors drawn across it.

   Three things the controls are for. A phase that happens to be a t-bit
   binary fraction gives one outcome with probability one and exact zeros
   everywhere else, which is the complete cancellation the scene beside it
   describes. A phase that sits exactly halfway between two readings is the
   worst case, and the nearest reading then carries 4/pi^2 and no more. And
   however badly the phase fits, the two nearest readings together always
   carry at least 8/pi^2 — a floor that does not move as the register grows,
   which is why extra qubits buy precision rather than confidence.

   Everything is computed at interaction time from the amplitude the circuit
   produces. The amplitude of the reading y is the sum over the counting
   register of e^{2 pi i k (phi - y/2^t)}, and the laboratory forms that sum
   term by term rather than quoting the closed form for it, so the ratio of
   sines that the scene prints is a result here and not an assumption.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F;
  const P = PLOT;

  const K = (() => {
    let st = { phi:300, t:4 };            /* the phase is held in thousandths */

    /* The amplitude of the reading y, summed term by term over the counting
       register. Nothing here knows the closed form. */
    function amp(phi, t, y){
      const Q = 1 << t;
      let re = 0, im = 0;
      for(let k=0;k<Q;k++){
        const a = 2*Math.PI*k*(phi - y/Q);
        re += Math.cos(a); im += Math.sin(a);
      }
      return [re/Q, im/Q];
    }
    const prob = (phi,t,y) => { const a = amp(phi,t,y); return a[0]*a[0] + a[1]*a[1]; };

    /* The reading nearest the true phase, and the one on the other side of
       it. Both are taken modulo the register size, because the phase lives on
       a circle and the reading 0 is next to the reading Q-1. */
    const nearest = (phi,t) => { const Q = 1<<t; return ((Math.round(phi*Q) % Q) + Q) % Q; };
    function twoNearest(phi,t){
      const Q = 1<<t, lo = Math.floor(phi*Q), hi = lo+1;
      return [((lo%Q)+Q)%Q, ((hi%Q)+Q)%Q];
    }
    const pNear = (phi,t) => prob(phi,t,nearest(phi,t));
    function pTwo(phi,t){
      const ab = twoNearest(phi,t);
      return ab[0]===ab[1] ? prob(phi,t,ab[0]) : prob(phi,t,ab[0]) + prob(phi,t,ab[1]);
    }

    function draw(root){
      const phi = st.phi/1000, t = st.t, Q = 1 << t;
      const yn = nearest(phi,t);
      const pn = pNear(phi,t), p2 = pTwo(phi,t);
      /* An outcome is exact when 2^t phi is a whole number: the counting
         register then holds the transform of that whole number and nothing
         else survives the inverse transform. */
      const exact = Math.abs(phi*Q - Math.round(phi*Q)) < 1e-12;

      /* ---- the distribution over the readings ---- */
      const a = P.Axes({w:430,h:310,xr:[-0.02,1.02],yr:[0,1.34],
        xlabel:'y/2^{t}', ylabel:'P(y)',
        pad:{l:62,r:24,t:30,b:46}, xtarget:5,
        yticksOverride:[0,0.25,0.5,0.75,1]});
      const pts = [];
      for(let y=0;y<Q;y++) pts.push([y/Q, prob(phi,t,y)]);
      a.stem(pts,{color:P.COL.in,r:Q>64?2.2:4.2,width:1.8,showZero:true});
      a.point(yn/Q, pn, {color:P.COL.out,r:6.5});
      a.vline(phi,{color:P.COL.err,width:1.6,dash:'4 4'});
      a.note(0.02,1.24,'\\varphi='+fmt(phi,3),{fs:12,color:P.COL.err,anchor:'start',tex:true});
      a.note(0.98,1.24,'\\text{nearest reading}',{fs:12,color:P.COL.out,anchor:'end',tex:true});

      /* ---- the two floors, against the register size ---- */
      /* The right margin is wide because the two floors are named there: a
         name laid on a probability curve is a collision, and both curves
         wander over most of this frame as the phase is turned. */
      const b = P.Axes({w:430,h:310,xr:[1,10],yr:[0,1.34],
        xlabel:'t\\,(\\text{counting qubits})', ylabel:'P',
        pad:{l:58,r:62,t:30,b:46}, xtarget:5,
        yticksOverride:[0,0.25,0.5,0.75,1]});
      const one = [], two = [];
      for(let k=1;k<=10;k++){ one.push([k, pNear(phi,k)]); two.push([k, pTwo(phi,k)]); }
      b.poly(two,{color:P.COL.out,width:2.4});
      b.poly(one,{color:P.COL.in,width:2.4});
      two.forEach(function(p){ b.point(p[0],p[1],{color:P.COL.out,r:3.6}); });
      one.forEach(function(p){ b.point(p[0],p[1],{color:P.COL.in,r:3.6}); });
      b.hline(8/(Math.PI*Math.PI),{color:P.COL.err,width:1.6,dash:'5 4'});
      b.hline(4/(Math.PI*Math.PI),{color:P.COL.err,width:1.6,dash:'5 4'});
      b.vline(t,{color:P.COL.rule,width:1.4,dash:'3 4'});
      b.note(1.2,1.24,'\\text{the two nearest}',{fs:12,color:P.COL.out,anchor:'start',tex:true});
      b.note(6.2,1.24,'\\text{the single nearest}',{fs:12,color:P.COL.in,anchor:'start',tex:true});
      b.note(10.15,8/(Math.PI*Math.PI)-0.05,'8/\\pi^{2}',{fs:11.5,color:P.COL.err,anchor:'start',tex:true});
      b.note(10.15,4/(Math.PI*Math.PI)-0.05,'4/\\pi^{2}',{fs:11.5,color:P.COL.err,anchor:'start',tex:true});

      root.querySelector('.plots').innerHTML =
        '<div class="labgrid">' + a.svg() + b.svg() + '</div>';

      /* The applications of U the same run would need, which is the cost the
         register size is really being traded against. */
      const calls = Q - 1;
      const err = Math.abs(yn/Q - phi);
      root.querySelector('.ro').innerHTML = `
        <div><dt>Phase</dt><dd>${T('\\varphi = '+fmt(phi,3),false)}</dd></div>
        <div><dt>Counting qubits</dt><dd>${T('t = '+t+',\\ 2^{t} = '+Q,false)}</dd></div>
        <div><dt>Nearest reading</dt><dd>${T('y = '+yn+',\\ y/2^{t} = '+fmt(yn/Q,5),false)}</dd></div>
        <div><dt>Error of that reading</dt><dd>${fmt(err,5)}</dd></div>
        <div><dt>Probability of it</dt><dd class="${pn>0.5?'okv':'warnv'}">${fmt(pn,5)}</dd></div>
        <div><dt>Probability of the two nearest</dt><dd>${fmt(p2,5)}</dd></div>
        <div><dt>Guaranteed floors</dt><dd>${T('4/\\pi^{2} = 0.4053,\\ 8/\\pi^{2} = 0.8106',false)}</dd></div>
        <div><dt>Applications of U this needs</dt><dd>${calls}</dd></div>`;

      /* Halfway between two readings is the worst case the guarantee was
         written for, and it is worth naming when the reader lands on it. */
      const frac = phi*Q - Math.floor(phi*Q);
      const halfway = Math.abs(frac - 0.5) < 0.02;
      const verdict = exact
        ? `<div class="note ok"><span class="note-h">The phase fits the register exactly</span>
             ${T('2^{t}\\varphi = '+Math.round(phi*Q),false)} is a whole number, so the counting
             register holds exactly ${T('F|'+Math.round(phi*Q)+'\\rangle',false)} and the inverse
             transform sends it to a single basis state. Every other reading has amplitude exactly
             zero: the ${Q-1} unit vectors in its sum are the vertices of a regular polygon and they
             add to nothing. This is the complete cancellation, and it is the special case.</div>`
        : halfway
        ? `<div class="note err"><span class="note-h">The worst case: the phase sits halfway between two readings</span>
             Neither neighbour is right and the probability splits between them. The single nearest
             reading now carries ${T(fmt(pn,4),false)}, which is as low as it ever goes and is the
             floor ${T('4/\\pi^{2}=0.4053',false)}. The two together still carry
             ${T(fmt(p2,4),false)}. Adding counting qubits does not raise these two numbers; it
             makes the reading they refer to more precise.</div>`
        : `<div class="note warn"><span class="note-h">A distribution, not an answer</span>
             The reading is ${T('y='+yn,false)} with probability ${T(fmt(pn,4),false)}, and it is
             wrong by ${T(fmt(err,5),false)}. One run is a sample from the left panel. Watch the
             right panel as the register grows: the two curves wander but neither ever crosses its
             dashed floor, so extra qubits buy accuracy and never confidence. Confidence comes from
             repeating the run, or from a check on the answer.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out="t"]').forEach(function(o){ o.textContent = String(st.t); });
      root.querySelectorAll('[data-out="phi"]').forEach(function(o){ o.textContent = fmt(st.phi/1000,3); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Phase φ to be measured <span class="val" data-out="phi">0.3</span></label>
                <input type="range" data-v="phi" min="0" max="999" step="1" value="300"></div>
              <div class="ctrl"><label>Counting qubits t <span class="val" data-out="t">4</span></label>
                <input type="range" data-v="t" min="1" max="8" step="1" value="4"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', function(e){ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      draw(root);
    }};
  })();

  return { K };
})());
