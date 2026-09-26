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

/* ==========================================================================
   K1 · Deutsch-Jozsa — the reader chooses the number of query qubits and one
       of four functions, and the laboratory draws the sixteen (or fewer)
       signs (-1)^{f(x)} together with the amplitude they average to. The
       right panel is that same amplitude, squared, against every possible
       balance of pluses and minuses at this n, so the reader can see how far
       from the two promised cases a mixed count of signs really sits.

   Two things the controls are for. The two constant functions put every sign
   the same way and the mean is exactly +-1; the two balanced functions split
   the signs exactly in half and the mean is exactly zero. Between them, nine
   pluses and seven minuses on four qubits gives a mean that is neither, and
   the reading of 0^n is then only probable, never certain — the case the
   promise rules out.

   Everything is computed at interaction time from the signs themselves: the
   amplitude of 0^n is their mean, formed by summing here and never quoted
   from the closed form the scene beside it teaches.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F;
  const P = PLOT;

  const K1 = (() => {
    let st = { n:3, kind:'bal-parity' };

    /* The four functions, each returning 0 or 1 on the n-bit input x. Two are
       constant, two are balanced, and both balanced ones are honestly split:
       parity is the standard example, and half-random keeps exactly half of
       the 2^n inputs at 1 by construction, not by chance, so the same n and
       the same kind always draw the same figure. */
    function fval(kind, x, n){
      if(kind === 'const0') return 0;
      if(kind === 'const1') return 1;
      if(kind === 'bal-parity'){ let p=0,y=x; while(y){ p^=y&1; y>>=1; } return p; }
      /* bal-half: 1 on the top half of the 2^n inputs by index, 0 on the
         bottom half — balanced by construction and unlike parity in its
         pattern, so the reader sees a second honest balanced case. */
      return x >= (1 << n) / 2 ? 1 : 0;
    }
    function signs(kind, n){
      const Q = 1 << n, s = [];
      for(let x=0;x<Q;x++) s.push(fval(kind,x,n) ? -1 : 1);
      return s;
    }
    const mean = s => s.reduce((a,b)=>a+b,0) / s.length;

    function draw(root){
      const n = st.n, Q = 1 << n, kind = st.kind;
      const s = signs(kind, n);
      const a0 = mean(s);
      const prob0 = a0*a0;
      const plus = s.filter(v=>v>0).length;

      /* ---- the signs themselves, one stem per input ---- */
      const a = P.Axes({w:430,h:310,xr:[-0.6,Q-0.4],yr:[-1.5,1.5],
        xlabel:'x', ylabel:'(-1)^{f(x)}',
        pad:{l:56,r:24,t:30,b:46}, xtarget:Math.min(Q,8),
        yticksOverride:[-1,0,1]});
      const pts = []; for(let x=0;x<Q;x++) pts.push([x, s[x]]);
      a.stem(pts,{color:P.COL.in,r:Q>32?2.2:4.2,width:1.8,showZero:true});
      a.hline(a0,{color:P.COL.err,width:1.6,dash:'4 4'});
      a.note(Q-0.5,a0+(a0>=0?0.16:-0.28),'\\text{mean}='+fmt(a0,4),{fs:12,color:P.COL.err,anchor:'end',tex:true});

      /* ---- the same mean, squared, against every possible split ---- */
      /* A function need not be constant or balanced: this panel walks every
         count of plus signs from 0 to Q and plots the amplitude of 0^n each
         one would give, so the two promised points sit on a curve the reader
         can see the rest of. */
      const b = P.Axes({w:430,h:310,xr:[0,Q],yr:[0,1.10],
        xlabel:'\\text{inputs with }f(x)=0', ylabel:'P(0^{n})',
        pad:{l:58,r:24,t:30,b:46}, xtarget:5,
        yticksOverride:[0,0.25,0.5,0.75,1]});
      const curve = []; for(let k=0;k<=Q;k++){ const m=(2*k-Q)/Q; curve.push([k, m*m]); }
      b.poly(curve,{color:P.COL.mid,width:2.0});
      b.point(plus, prob0, {color:P.COL.out,r:7});
      b.vline(Q/2,{color:P.COL.rule,width:1.4,dash:'3 4'});
      b.note(Q/2,1.02,'\\text{balanced}',{fs:12,color:P.COL.muted,anchor:'middle',tex:true});
      b.note(plus, prob0+ (prob0>0.5?-0.14:0.12),'\\text{this }f',{fs:12,color:P.COL.out,anchor:plus>Q/2?'end':'start',tex:true});

      root.querySelector('.plots').innerHTML =
        '<div class="labgrid">' + a.svg() + b.svg() + '</div>';

      root.querySelector('.ro').innerHTML = `
        <div><dt>Query qubits</dt><dd>${T('n = '+n+',\\ 2^{n} = '+Q,false)}</dd></div>
        <div><dt>Inputs with f(x)=0</dt><dd>${plus} of ${Q}</dd></div>
        <div><dt>Mean of the signs</dt><dd>${T('a_{0^{n}} = '+fmt(a0,4),false)}</dd></div>
        <div><dt>Probability of reading 0\u207f</dt><dd class="${prob0>0.99?'okv':(prob0<0.01?'okv':'warnv')}">${fmt(prob0,5)}</dd></div>
        <div><dt>Certain reading, if any</dt><dd>${prob0>0.99?T('0^{'+n+'}',false):(prob0<0.01?'any string but '+T('0^{'+n+'}',false):'none \u2014 a distribution')}</dd></div>`;

      const verdict = (kind==='const0'||kind==='const1')
        ? `<div class="note ok"><span class="note-h">Constant: every sign the same way</span>
             All ${Q} signs are ${T(kind==='const0'?'+1':'-1',false)}, so the mean has modulus 1 and
             ${T('0^{n}',false)} is read with probability exactly ${T('1',false)}. One query settles
             the whole class, for any of the ${Q} inputs ${T('f',false)} could equal.</div>`
        : (kind==='bal-parity'||kind==='bal-half')
        ? `<div class="note err"><span class="note-h">Balanced: exactly half and half</span>
             ${plus} of ${Q} inputs give ${T('+1',false)} and ${Q-plus} give ${T('-1',false)}, the signs cancel exactly, and
             ${T('0^{n}',false)} is <b>never</b> read. Any other string proves balanced with certainty,
             on the same one query.</div>`
        : '';
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out="n"]').forEach(o=>{ o.textContent = String(st.n); });
      root.querySelectorAll('[data-seg]').forEach(x=>
        x.setAttribute('aria-pressed', String(x.dataset.val===st.kind)));
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Query qubits n <span class="val" data-out="n">3</span></label>
                <input type="range" data-v="n" min="1" max="6" step="1" value="3"></div>
              <div class="ctrl"><label>Function f <span class="seg">
                <button data-seg="kind" data-val="const0">constant 0</button>
                <button data-seg="kind" data-val="const1">constant 1</button>
                <button data-seg="kind" data-val="bal-parity">balanced, parity</button>
                <button data-seg="kind" data-val="bal-half">balanced, half</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', function(e){ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click', function(e){
        const b = e.target.closest('[data-seg]');
        if(b){ st[b.dataset.seg] = b.dataset.val; draw(root); }
      });
      draw(root);
    }};
  })();

  return { K1 };
})());

/* ==========================================================================
   K2 · The quantum Fourier transform — the reader chooses the input index x
       and the register size Q = 2^n, and the laboratory draws the Q output
       amplitudes of F_Q|x> as arrows in the complex plane, on an isotropic
       frame so the circle they sit on is a genuine circle. The right panel
       is the same amplitudes read off as a phase against the output index k,
       the picture that turns into the winding rate the scene states.

   Turning x changes nothing about where the arrows sit on the circle — they
   are always the Q-th roots of unity — only how many steps apart consecutive
   ones are and, when x and Q share a factor, how many of the Q points are
   actually visited before the pattern repeats.

   Everything is computed at interaction time from the definition
   F_Q|x> = Q^{-1/2} sum_k e^{2 pi i x k / Q} |k>, term by term, never from a
   tabulated angle. */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F;
  const P = PLOT;
  const TAU = 2*Math.PI;
  const gcd = LABS.KIT.gcd;

  const K2 = (() => {
    let st = { n:3, x:3 };

    function draw(root){
      const n = st.n, Q = 1 << n, x = Math.min(st.x, Q-1);

      /* ---- the amplitudes as arrows on the unit circle, equal scales ---- */
      const a = P.Axes({w:430,h:310,xr:[-1.35,1.35],yr:[-1.35,1.35],
        pad:{l:24,r:24,t:24,b:24}, xticksOverride:[], yticksOverride:[],
        grid:false, zeroAxes:false, arrows:false});
      const ring = []; for(let i=0;i<=220;i++){ const s=TAU*i/220; ring.push([Math.cos(s),Math.sin(s)]); }
      a.poly(ring,{color:P.COL.grid,width:1.4,dash:'3 4'});
      for(let k=0;k<Q;k++){
        const th = TAU*x*k/Q;
        const c = Math.cos(th), sn = Math.sin(th);
        a.poly([[0,0],[c,sn]],{color:k===0?P.COL.out:P.COL.in,width:k===0?2.6:1.6});
        a.point(c,sn,{color:k===0?P.COL.out:P.COL.in,r:k===0?6:(Q>16?3.2:4.4)});
      }
      a.note(0,1.28,'|a_{k}|='+fmt(1/Math.sqrt(Q),3),{fs:12,color:P.COL.muted,anchor:'middle',tex:true});

      /* ---- the phase of each amplitude against its index, unwrapped ---- */
      const b = P.Axes({w:430,h:310,xr:[-0.6,Q-0.4],yr:[-0.06,1.06],
        xlabel:'k', ylabel:'\\text{turns of phase}',
        pad:{l:58,r:24,t:30,b:46}, xtarget:Math.min(Q,8),
        yticksOverride:[0,0.25,0.5,0.75,1]});
      const pts = []; for(let k=0;k<Q;k++){ const f=(x*k/Q)%1; pts.push([k,f]); }
      b.stem(pts,{color:P.COL.in,r:Q>16?2.6:4,width:1.8,showZero:true});
      b.hline(0,{color:P.COL.rule,width:1});
      b.note(Q-0.5,0.98,'\\text{step}='+fmt((x/Q)%1,4)+'\\text{ turns}',{fs:12,color:P.COL.muted,anchor:'end',tex:true});

      root.querySelector('.plots').innerHTML =
        '<div class="labgrid">' + a.svg() + b.svg() + '</div>';

      /* The rate the arrow turns each step, and how many distinct points that
         rate actually reaches before it returns to k=0: the amplitude visits
         Q/gcd(x,Q) of the Q points and no others. */
      const g = x===0 ? Q : gcd(x,Q);
      const visited = Q / g;
      root.querySelector('.ro').innerHTML = `
        <div><dt>Register</dt><dd>${T('n = '+n+',\\ Q = '+Q,false)}</dd></div>
        <div><dt>Input index</dt><dd>${T('x = '+x,false)}</dd></div>
        <div><dt>Turn each step</dt><dd>${T('2\\pi x/Q = '+fmt(TAU*x/Q,4)+'\\ \\text{rad}',false)}</dd></div>
        <div><dt>Amplitude of every output</dt><dd>${fmt(1/Math.sqrt(Q),5)}</dd></div>
        <div><dt>Distinct points on the circle</dt><dd class="${visited<Q?'warnv':'okv'}">${visited} of ${Q}</dd></div>`;

      const verdict = x===0
        ? `<div class="note warn"><span class="note-h">The one input with no phase at all</span>
             ${T('F_{'+Q+'}|0\\rangle',false)} is the uniform superposition: every arrow points along
             the real axis and every step is zero turns. This is what the opening layer of
             Hadamards produces on ${T('|0^{n}\\rangle',false)}.</div>`
        : g>1
        ? `<div class="note err"><span class="note-h">x and Q share a factor</span>
             ${T('\\gcd('+x+','+Q+')='+g,false)}, so the arrow returns to its start after only
             ${visited} steps and revisits those ${visited} points ${g} times each; ${Q-visited} of
             the ${Q} outputs are never drawn. Every magnitude is still ${T('1/\\sqrt{'+Q+'}',false)}.</div>`
        : `<div class="note ok"><span class="note-h">Every point on the circle, once each</span>
             ${T('\\gcd('+x+','+Q+')=1',false)}, so the ${Q} arrows land on all ${Q} roots of unity
             before the pattern closes. Measured now, without interference, every ${T('k',false)}
             comes out equally likely: ${T('1/'+Q,false)} each, whatever ${T('x',false)} was.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out="n"]').forEach(o=>{ o.textContent = String(st.n); });
      root.querySelectorAll('[data-out="x"]').forEach(o=>{ o.textContent = String(x); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Register size, qubits n <span class="val" data-out="n">3</span></label>
                <input type="range" data-v="n" min="1" max="6" step="1" value="3"></div>
              <div class="ctrl"><label>Input index x <span class="val" data-out="x">3</span></label>
                <input type="range" data-v="x" min="0" max="63" step="1" value="3"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', function(e){ const k=e.target.dataset.v; if(!k) return;
        const Q = 1 << st.n;
        st[k] = parseInt(e.target.value,10);
        if(st.x >= Q) st.x = Q-1;
        const sl = root.querySelector('[data-v="x"]'); if(sl) sl.max = String(Q-1);
        draw(root);
      });
      draw(root);
    }};
  })();

  return { K2 };
})());

/* ==========================================================================
   K3 · Order finding — the reader chooses the modulus N and the base a, and
       the laboratory walks the sequence a^k mod N term by term until it
       returns to 1, which is the order r by definition. The right panel is
       the r eigenphases s/r of the multiplication operator, each drawn with
       weight 1/r, the even mixture that preparing the work register in |1>
       actually gives.

   The point the controls are for: r is read off a cycle, not looked up, and
   it can be short or nearly as long as N, and a base that shares a factor
   with N never reaches 1 at all — the laboratory says so rather than walking
   forever, because gcd(a,N) > 1 already gives a factor and order finding is
   not needed.

   Everything is computed at interaction time from a^k mod N, taken one
   multiplication at a time, and from the r that walk actually finds — never
   from a stored table of orders. */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, fmt = LABS.KIT.F;
  const P = PLOT;
  const gcd = LABS.KIT.gcd;

  const K3 = (() => {
    let st = { N:15, a:2 };

    /* The order of a modulo N, found by walking the sequence, and the
       sequence itself up to and including the return to 1. Capped at N steps,
       which is always enough: the powers of a coprime to N are a permutation
       of a subgroup, so the walk closes by then or a never reaches 1 because
       gcd(a,N) > 1, which is checked before this is called. */
    function walk(a,N){
      const seq = [1]; let x = 1;
      for(let k=1;k<=N;k++){ x = (x*a) % N; seq.push(x); if(x===1) return seq; }
      return seq; /* unreachable when gcd(a,N)=1, kept only as a safety stop */
    }

    function draw(root){
      const N = st.N, a = ((st.a % N)+N) % N || 1;
      const g = gcd(a,N);
      const coprime = g===1;
      const seq = coprime ? walk(a,N) : null;
      const r = coprime ? seq.length-1 : 0;

      /* ---- the sequence, one stem per step, up to the return to 1 ---- */
      const xmax = coprime ? r : Math.min(N,12);
      const c = P.Axes({w:430,h:310,xr:[-0.4,xmax+0.4],yr:[0,N*1.12],
        xlabel:'k', ylabel:'a^{k}\\bmod N',
        pad:{l:58,r:24,t:30,b:46}, xtarget:Math.min(xmax||1,8), ytarget:4});
      if(coprime){
        const pts = seq.map((v,k)=>[k,v]);
        c.stem(pts,{color:P.COL.in,r:xmax>20?2.6:4.4,width:1.8});
        c.point(0,1,{color:P.COL.out,r:6}); c.point(r,1,{color:P.COL.out,r:6});
        c.note(r,N*1.04,'r='+r,{fs:13,color:P.COL.out,anchor:'end',tex:true});
      } else {
        const pts=[]; for(let k=0;k<=xmax;k++) pts.push([k,(Math.pow(a,k))%N]);
        /* a^k mod N grown the honest way, one multiplication at a time, so a
           shared factor shows the sequence never returning to 1 rather than
           quoting that fact. */
        let xk=1; const grown=[[0,1]];
        for(let k=1;k<=xmax;k++){ xk=(xk*a)%N; grown.push([k,xk]); }
        c.stem(grown,{color:P.COL.err,r:4,width:1.8});
        c.note(xmax/2,N*1.04,'\\text{never returns to }1',{fs:12,color:P.COL.err,anchor:'middle',tex:true});
      }

      /* ---- the r eigenphases, each with weight 1/r ---- */
      const d = P.Axes({w:430,h:310,xr:[-0.06,1.06],yr:[0,1.15],
        xlabel:'\\varphi', ylabel:'\\text{weight}',
        pad:{l:58,r:24,t:30,b:46}, xtarget:5,
        yticksOverride:[0,0.25,0.5,0.75,1]});
      if(coprime){
        const pts=[]; for(let s=0;s<r;s++) pts.push([s/r, 1/r]);
        d.stem(pts,{color:P.COL.mid,r:Math.max(3,7-Math.floor(r/4)),width:2.2});
        d.note(0.02,1.06,'\\text{each with probability }1/'+r,{fs:12,color:P.COL.muted,anchor:'start',tex:true});
      } else {
        d.note(0.5,0.5,'\\text{no order: no eigenphases to sample}',{fs:13,color:P.COL.err,anchor:'middle',tex:true});
      }

      root.querySelector('.plots').innerHTML =
        '<div class="labgrid">' + c.svg() + d.svg() + '</div>';

      root.querySelector('.ro').innerHTML = `
        <div><dt>Modulus</dt><dd>${T('N = '+N,false)}</dd></div>
        <div><dt>Base</dt><dd>${T('a = '+a,false)}</dd></div>
        <div><dt>gcd(a, N)</dt><dd class="${coprime?'okv':'warnv'}">${g}</dd></div>
        <div><dt>Order</dt><dd>${coprime?T('r = '+r,false):'none: no order exists'}</dd></div>
        <div><dt>Steps walked to close the cycle</dt><dd>${coprime?r:'\u2014'}</dd></div>
        <div><dt>Eigenphases sampled</dt><dd>${coprime?r+' values of '+T('s/r',false):'none'}</dd></div>`;

      const verdict = !coprime
        ? `<div class="note err"><span class="note-h">This base has no order</span>
             ${T('\\gcd('+a+','+N+')='+g,false)}, so multiplying by ${a} is not a permutation of
             ${T('0,\\ldots,'+(N-1),false)} and the sequence never returns to 1. This is not a
             failure of the search: ${T('\\gcd('+a+','+N+')',false)} is already a factor of
             ${N}, found with no quantum step at all.</div>`
        : r===N-1 || (N>4 && r>=N-1)
        ? `<div class="note warn"><span class="note-h">A long cycle</span>
             The order is ${r}, out of a possible ${N-1}: walking it classically took nearly every
             residue. The quantum circuit costs the same whatever ${T('r',false)} turns out to be;
             a classical walk does not.</div>`
        : `<div class="note ok"><span class="note-h">The cycle closes at r = ${r}</span>
             The ${r} eigenphases ${T('s/r',false)} are what phase estimation samples from, each
             with probability ${T('1/'+r,false)}, because starting the work register in
             ${T('|1\\rangle',false)} is exactly their even mixture. Continued fractions turn a
             sampled ${T('s/r',false)} back into the denominator ${T('r',false)}.</div>`;
      root.querySelector('.verdict').innerHTML = verdict;

      root.querySelectorAll('[data-out="N"]').forEach(o=>{ o.textContent = String(st.N); });
      root.querySelectorAll('[data-out="a"]').forEach(o=>{ o.textContent = String(a); });
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:40px">
          <div class="col stack"><div class="plots"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Modulus N <span class="val" data-out="N">15</span></label>
                <input type="range" data-v="N" min="5" max="35" step="1" value="15"></div>
              <div class="ctrl"><label>Base a <span class="val" data-out="a">2</span></label>
                <input type="range" data-v="a" min="2" max="34" step="1" value="2"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
          </div></div>`;
      root.addEventListener('input', function(e){ const k=e.target.dataset.v; if(!k) return;
        st[k] = parseInt(e.target.value,10); draw(root); });
      draw(root);
    }};
  })();

  return { K3 };
})());
