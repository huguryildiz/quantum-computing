/* ==========================================================================
   Module 2 — States, measurement and dynamics.

   Chapter 1 built the language. This chapter says what the objects in it are
   for: which operator a laboratory instrument corresponds to, how an amplitude
   becomes a probability, what the state is after a reading has been taken, and
   why the evolution of a closed system is the exponential of a Hermitian
   operator.

   Four things in here are the ones students get wrong, and each has a scene of
   its own. An expectation value is an average over repetitions and is very
   often not a value the instrument can return at all. Choosing a measurement
   basis is choosing a different experiment, not a change of coordinates. Two
   observables that do not commute cannot both be sharp on one state, and that
   is a statement about the state rather than about the clumsiness of the
   apparatus. And a histogram of counts is an estimate with an error bar on it,
   never the distribution itself.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const R2 = Math.SQRT1_2;

/* ---------------------------------------------------------------- figures --
   Each is a function, so the palette is the one in force when it is drawn. */

/* A box diagram has no axes to stretch, so when a slide grows its figure into
   the spare height of the column, the diagram keeps its size and is centred in
   the taller frame. Chapter 1's helper, plus one case: a `line` is a path
   that starts with an absolute move and continues in relative steps, so
   shifting that first point shifts the whole wire. */
function growBlocks(spec){
  const h1 = P.hOverride;
  if(!h1 || h1 <= spec.h) return P.blocks(spec);
  const dy = (h1 - spec.h) / 2;
  const items = spec.items.map(it => {
    const o = Object.assign({}, it);
    ['y','y1','y2'].forEach(k => { if(o[k] != null) o[k] += dy; });
    if(o.t === 'line' && o.d) o.d = o.d.replace(/^M\s*([-\d.]+),([-\d.]+)/, (m,x,y) => `M${x},${+y + dy}`);
    return o;
  });
  return P.blocks({w:spec.w, h:h1, items:items});
}

/* The four postulates, in the order they are used. The chapter is the middle
   two; the first was chapter 1 and the last is chapter 3. */
function figPostulates(){
  return P.blocks({w:740,h:180,items:[
    {t:'box',x:20,y:40,w:150,h:56,label:'a state',fs:14},
    {t:'arrow',x1:170,y1:68,x2:210,y2:68},
    {t:'box',x:210,y:40,w:150,h:56,label:'evolution',fs:14},
    {t:'arrow',x1:360,y1:68,x2:400,y2:68},
    {t:'box',x:400,y:40,w:150,h:56,label:'measurement',fs:14},
    {t:'arrow',x1:550,y1:68,x2:590,y2:68},
    {t:'box',x:590,y:40,w:150,h:56,label:'composition',fs:14},
    {t:'text',x:95,y:124,label:'chapter 1',fs:12},
    {t:'text',x:285,y:124,label:'this chapter',fs:12},
    {t:'text',x:475,y:124,label:'this chapter',fs:12},
    {t:'text',x:665,y:124,label:'chapter 3',fs:12},
    {t:'text',x:370,y:158,label:'each one says what is allowed, and nothing about how to build it',fs:12}
  ]});
}

/* What one shot is. The circuit returns one string, and the amplitudes decide
   only how often each string comes back. */
function figShot(){
  return growBlocks({w:700,h:206,items:[
    {t:'box',x:30,y:52,w:150,h:60,label:'|\\psi\\rangle',tex:true,fs:17},
    {t:'arrow',x1:180,y1:82,x2:280,y2:82},
    {t:'box',x:280,y:52,w:150,h:60,label:'measure',fs:14},
    {t:'arrow',x1:430,y1:60,x2:530,y2:36},
    {t:'arrow',x1:430,y1:104,x2:530,y2:128},
    {t:'box',x:530,y:12,w:130,h:48,label:'0',fs:16,color:C.out},
    {t:'box',x:530,y:104,w:130,h:48,label:'1',fs:16,color:C.err},
    {t:'text',x:595,y:82,label:'p=|\\langle 0|\\psi\\rangle|^{2}',tex:true,fs:13},
    {t:'text',x:595,y:180,label:'p=|\\langle 1|\\psi\\rangle|^{2}',tex:true,fs:13},
    {t:'text',x:230,y:192,label:'one shot returns one of them, and nothing else',fs:12}
  ]});
}

/* One state, three measurements. The bars are computed from the state, so the
   figure cannot disagree with the arithmetic beside it. */
function figThreeBases(){
  const th = Math.PI/3, ph = Math.PI/4;
  const c = Math.cos(th/2), s = Math.sin(th/2);
  const rx = Math.sin(th)*Math.cos(ph), ry = Math.sin(th)*Math.sin(ph), rz = Math.cos(th);
  const a = P.Axes({w:560,h:250,xr:[0,6.5],yr:[0,1.12],
    ylabel:'\\text{probability}', pad:{l:60,r:24,t:26,b:56},
    xticksOverride:[], ytarget:4});
  /* The bars start at 0.7 so the vertical axis sits clear of the first one. */
  const bar=(k,v,f,l)=>{ const n = k + 0.7; a.rect(n-0.26,0,n+0.26,v,{fill:f});
    a.poly([[n-0.26,v],[n+0.26,v]],{color:l,width:2.4}); };
  bar(0,(1+rz)/2,C.dec.in,C.in);   bar(1,(1-rz)/2,C.dec.in,C.in);
  bar(2,(1+rx)/2,C.dec.mid,C.mid); bar(3,(1-rx)/2,C.dec.mid,C.mid);
  bar(4,(1+ry)/2,C.dec.out,C.out); bar(5,(1-ry)/2,C.dec.out,C.out);
  [['0',0],['1',1]].forEach(([t,k])=>a.note(k+0.7,0,t,{fs:12.5,color:C.muted,anchor:'middle',dy:26}));
  [['+',2],['-',3]].forEach(([t,k])=>a.note(k+0.7,0,t,{fs:12.5,color:C.muted,anchor:'middle',dy:26}));
  a.note(4.7,0,'+i',{fs:12.5,color:C.muted,anchor:'middle',dy:26});
  a.note(5.7,0,'-i',{fs:12.5,color:C.muted,anchor:'middle',dy:26});
  a.note(1.2,0,'Z',{fs:14,color:C.in,anchor:'middle',dy:48,tex:true});
  a.note(3.2,0,'X',{fs:14,color:C.mid,anchor:'middle',dy:48,tex:true});
  a.note(5.2,0,'Y',{fs:14,color:C.out,anchor:'middle',dy:48,tex:true});
  return a.svg();
}

/* Two states at an angle, and the one measurement direction that separates
   them best. Isotropic, because the angle between them is the whole quantity. */
function figDistinguish(){
  /* 372 px over an x span of 2.60 and 216 px over a y span of 1.51: both
     143 px to the unit, so the drawn angle is the angle. */
  const a = P.Axes({w:430,h:274,xr:[-1.30,1.30],yr:[-0.31,1.20],
    pad:{l:32,r:26,t:26,b:32}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:true, arrows:false});
  const ring=[]; for(let i=0;i<=120;i++){ const t=Math.PI*i/120; ring.push([Math.cos(t),Math.sin(t)]); }
  a.poly(ring,{color:C.grid,width:1.2});
  const A = 0.35, B = 1.15;
  a.poly([[0,0],[Math.cos(A),Math.sin(A)]],{color:C.in,width:2.6});
  a.point(Math.cos(A),Math.sin(A),{color:C.in,r:6});
  a.note(Math.cos(A),Math.sin(A),'|a\\rangle',{fs:14,color:C.in,dx:12,dy:-8,tex:true});
  a.poly([[0,0],[Math.cos(B),Math.sin(B)]],{color:C.mid,width:2.6});
  a.point(Math.cos(B),Math.sin(B),{color:C.mid,r:6});
  a.note(Math.cos(B),Math.sin(B),'|b\\rangle',{fs:14,color:C.mid,dx:10,dy:-8,tex:true});
  const arc=[]; for(let i=0;i<=40;i++){ const t=A+(B-A)*i/40; arc.push([0.34*Math.cos(t),0.34*Math.sin(t)]); }
  a.poly(arc,{color:C.h,width:1.8});
  a.note(0.36,0.24,'\\theta',{fs:14,color:C.h,tex:true});
  return a.svg();
}

/* An observable, taken apart into the numbers it can return and the projectors
   that decide how often. */
function figObservable(){
  return growBlocks({w:700,h:170,items:[
    {t:'box',x:30,y:50,w:120,h:56,label:'A',tex:true,fs:17},
    {t:'arrow',x1:150,y1:78,x2:250,y2:78},
    {t:'box',x:250,y:16,w:180,h:50,label:'\\lambda_{1},\\,P_{1}',tex:true,fs:15},
    {t:'box',x:250,y:90,w:180,h:50,label:'\\lambda_{2},\\,P_{2}',tex:true,fs:15},
    {t:'arrow',x1:430,y1:41,x2:520,y2:41},
    {t:'arrow',x1:430,y1:115,x2:520,y2:115},
    {t:'text',x:530,y:46,anchor:'start',label:'p_{1}=\\langle\\psi|P_{1}|\\psi\\rangle',tex:true,fs:13},
    {t:'text',x:530,y:120,anchor:'start',label:'p_{2}=\\langle\\psi|P_{2}|\\psi\\rangle',tex:true,fs:13},
    {t:'text',x:200,y:34,label:'diagonalise',fs:12}
  ]});
}

/* The outcomes of an observable as a distribution on the real line, with the
   mean marked. The mean sits between the two outcomes and is not one of them,
   which is the point. */
function figExpectation(){
  const p0 = 0.7;
  const a = P.Axes({w:540,h:250,xr:[-1.6,1.6],yr:[0,0.95],
    xlabel:'\\text{outcome}', ylabel:'\\text{probability}',
    pad:{l:62,r:24,t:26,b:46}, xtarget:4, ytarget:4});
  a.stem([[-1,1-p0],[1,p0]],{color:C.in,r:6});
  const mean = p0 - (1-p0);
  a.vline(mean,{color:C.err,width:1.8,dash:'4 4'});
  a.note(mean,0.86,'\\langle A\\rangle',{fs:14,color:C.err,dx:8,tex:true});
  return a.svg();
}

/* The mean and the spread of Z over a family of states. Where the state is an
   eigenstate the spread is zero and the mean is the eigenvalue; between them
   the mean is a number no instrument ever returns. */
function figVariance(){
  const a = P.Axes({w:560,h:250,xr:[0,Math.PI],yr:[-1.15,1.15],
    xlabel:'\\theta', ylabel:'\\text{value}',
    pad:{l:60,r:24,t:26,b:46}, xtarget:4, ytarget:5});
  a.curve(t => Math.cos(t), {color:C.in, width:2.4});
  a.curve(t => Math.abs(Math.sin(t)), {color:C.err, width:2.2, dash:'5 4'});
  a.note(0.30,-0.72,'\\langle Z\\rangle',{fs:13.5,color:C.in,tex:true});
  a.note(1.20,1.02,'\\Delta Z',{fs:13.5,color:C.err,tex:true});
  return a.svg();
}

/* Three measurements in a row, on a qubit that starts in a definite Z state.
   The third disagrees with the first, and no noise was added anywhere. */
function figSequence(){
  return growBlocks({w:740,h:200,items:[
    /* The wire stops at each box, so it never runs through a label. */
    {t:'line',d:'M30,80 h80'}, {t:'line',d:'M186,80 h134'},
    {t:'line',d:'M396,80 h134'}, {t:'line',d:'M606,80 h84'},
    {t:'box',x:110,y:52,w:76,h:56,label:'Z',tex:true,fs:16},
    {t:'box',x:320,y:52,w:76,h:56,label:'X',tex:true,fs:16},
    {t:'box',x:530,y:52,w:76,h:56,label:'Z',tex:true,fs:16},
    {t:'text',x:60,y:64,label:'|0\\rangle',tex:true,fs:15},
    {t:'text',x:148,y:140,label:'0 always',fs:12},
    {t:'text',x:358,y:140,label:'each half the time',fs:12},
    {t:'text',x:568,y:140,label:'each half the time',fs:12},
    {t:'text',x:370,y:180,label:'the first reading has been destroyed by the second measurement',fs:12}
  ]});
}

/* The Robertson bound and the product it bounds, over a family of states. The
   two touch where the bound is tight and nowhere else. */
function figUncertainty(){
  const ph = Math.PI/4, cp = Math.cos(ph), sp = Math.sin(ph);
  const a = P.Axes({w:560,h:250,xr:[0,Math.PI],yr:[0,1.15],
    xlabel:'\\theta', ylabel:'\\text{value}',
    pad:{l:60,r:24,t:26,b:46}, xtarget:4, ytarget:4});
  a.curve(t => Math.sqrt(1 - (Math.sin(t)*cp)**2) * Math.abs(Math.sin(t)),
    {color:C.in, width:2.4});
  a.curve(t => Math.abs(Math.sin(t)*sp), {color:C.err, width:2.2, dash:'5 4'});
  a.note(0.34,0.74,'\\Delta X\\,\\Delta Z',{fs:13,color:C.in,tex:true});
  a.note(1.95,0.26,'\\tfrac12|\\langle[X,Z]\\rangle|',{fs:13,color:C.err,tex:true});
  return a.svg();
}

/* The three measurement directions of one qubit, drawn as three axes. It is
   not the Bloch sphere yet — that is chapter 4 — but it is where the picture
   comes from. */
function figAxes(){
  /* 340 px over an x span of 2.72 and 200 px over a y span of 1.60: both
     125 px to the unit, so the circle is round. */
  const a = P.Axes({w:400,h:260,xr:[-1.36,1.36],yr:[-0.80,0.80],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const eq=[]; for(let i=0;i<=160;i++){ const t=2*Math.PI*i/160; eq.push([Math.cos(t),0.36*Math.sin(t)]); }
  a.poly(eq,{color:C.grid,width:1.3});
  const AX = [[[1,0],'X',C.mid],[[-0.56,-0.30],'Y',C.out],[[0,0.72],'Z',C.in]];
  AX.forEach(([v,t,col])=>{
    a.poly([[0,0],v],{color:col,width:2.4});
    a.point(v[0],v[1],{color:col,r:5});
    a.note(v[0],v[1],t,{fs:14,color:col,dx:v[0]>=0?10:-24,dy:v[1]>0?-8:20,tex:true});
  });
  a.point(0,0,{color:C.ink,r:4});
  return a.svg();
}

/* The cyclic product rule, drawn as the cycle it is. */
function figCycle(){
  /* 460 px over an x span of 4.98 and 240 px over a y span of 2.60: both
     92.3 px to the unit, so the triangle is equilateral on the page. The frame
     is wider than the triangle needs, and the rule goes in the space. */
  const a = P.Axes({w:520,h:300,xr:[-2.49,2.49],yr:[-1.30,1.30],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const N = [[0,0.95,'X',C.mid],[0.82,-0.48,'Y',C.out],[-0.82,-0.48,'Z',C.in]];
  for(let k=0;k<3;k++){
    const p = N[k], q = N[(k+1)%3];
    const dx = q[0]-p[0], dy = q[1]-p[1], L = Math.hypot(dx,dy);
    const ux = dx/L, uy = dy/L;
    a.poly([[p[0]+0.26*ux, p[1]+0.26*uy],[q[0]-0.30*ux, q[1]-0.30*uy]],
      {color:C.h, width:2.0});
    a.point(q[0]-0.30*ux, q[1]-0.30*uy, {color:C.h, r:4});
  }
  N.forEach(([x,y,t,col])=>{ a.point(x,y,{color:col,r:16});
    /* A plain italic letter with a hairline halo (`haloW:0` falls back to the default): a TeX label's halo is drawn in the
       page colour, which is the colour of the letter here, and blurs it. */
    a.note(x,y,t,{fs:15,color:C.plate,anchor:'middle',dy:5,italic:true,haloW:0.01}); });
  a.note(-2.40,0.34,'\\sigma_{i}\\sigma_{j}=+i\\sigma_{k}',{fs:14,color:C.h,tex:true});
  a.note(-2.40,0.02,'with the arrow',{fs:12,color:C.muted});
  a.note(1.16,0.34,'\\sigma_{j}\\sigma_{i}=-i\\sigma_{k}',{fs:14,color:C.h,tex:true});
  a.note(1.16,0.02,'against it',{fs:12,color:C.muted});
  return a.svg();
}

/* The probability of the plus outcome, against the angle between the direction
   the instrument is aimed along and the state's own vector. Drawn from
   (1 + cos alpha)/2 and nothing else. */
function figNdotR(){
  const a = P.Axes({w:560,h:250,xr:[0,Math.PI],yr:[0,1.12],
    xlabel:'\\alpha', ylabel:'p(+)',
    pad:{l:60,r:24,t:26,b:46}, xtarget:4, ytarget:4});
  a.curve(t => (1+Math.cos(t))/2, {color:C.in, width:2.4});
  a.point(0,1,{color:C.out,r:6});
  a.point(Math.PI/2,0.5,{color:C.h,r:6});
  a.point(Math.PI,0,{color:C.err,r:6});
  return a.svg();
}

/* A superposition of two energy eigenstates, watched in the computational
   basis. Every component is stationary and the sum is not. */
function figBeat(){
  const a = P.Axes({w:560,h:250,xr:[0,4*Math.PI],yr:[0,1.12],
    xlabel:'\\omega t', ylabel:'P(+)',
    pad:{l:60,r:24,t:26,b:46}, xtarget:5, ytarget:4});
  a.curve(t => Math.cos(t/2)**2, {color:C.in, width:2.4});
  a.hline(0.5,{color:C.muted, width:1.2, dash:'4 4'});
  return a.svg();
}

/* The axis a drive turns the qubit about, as the detuning is changed. On
   resonance it lies in the equator; far off it lies along z and the drive does
   almost nothing. */
function figDrive(){
  /* 340 px over an x span of 2.72 and 200 px over a y span of 1.60. */
  const a = P.Axes({w:400,h:260,xr:[-0.35,2.37],yr:[-0.30,1.30],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:true, arrows:true});
  [[1,0,'\\Omega_{x}',C.mid],[0,1,'\\Delta',C.in]].forEach(([x,y,t,col])=>{
    a.poly([[0,0],[x,y]],{color:C.grid,width:1.4,dash:'4 4'});
    a.note(x,y,t,{fs:13,color:col,dx:x>0?8:10,dy:y>0?-6:22,tex:true});
  });
  [0.15,0.5,1.0,2.2].forEach((r,i)=>{
    const ang = Math.atan2(1, r*2);
    const col = [C.err,C.h,C.out,C.mid][i];
    a.poly([[0,0],[Math.cos(ang)*1.05, Math.sin(ang)*1.05]],{color:col,width:2.4});
    a.point(Math.cos(ang)*1.05, Math.sin(ang)*1.05,{color:col,r:5});
  });
  a.note(1.12,0.10,'\\text{on resonance}',{fs:12,color:C.mid,tex:true});
  a.note(0.34,1.16,'\\text{far detuned}',{fs:12,color:C.err,tex:true});
  return a.svg();
}

/* The standard error of a probability estimate, against the number of shots.
   Both axes are decades, because the interesting range is four of them. */
function figShots(){
  const a = P.Axes({w:560,h:250,xr:[1,7],yr:[-4,-0.5],
    xlabel:'\\log_{10} N', ylabel:'\\log_{10}\\mathrm{SE}',
    pad:{l:64,r:24,t:26,b:46}, xtarget:5, ytarget:4});
  a.curve(k => Math.log10(0.5) - k/2, {color:C.err, width:2.4});
  a.curve(k => Math.log10(Math.sqrt(0.1*0.9)) - k/2, {color:C.in, width:2.2, dash:'5 4'});
  a.note(2.6, Math.log10(0.5)-1.3, 'p=\\tfrac12',{fs:13,color:C.err,dy:-12,tex:true});
  a.note(4.6, Math.log10(Math.sqrt(0.09))-2.3, 'p=0.1',{fs:13,color:C.in,dy:40,tex:true});
  return a.svg();
}

/* What the chapter licenses, in the order a run uses it. */
function figLoop(){
  return P.blocks({w:740,h:150,items:[
    {t:'box',x:24,y:44,w:150,h:60,label:'prepare',fs:14},
    {t:'arrow',x1:174,y1:74,x2:222,y2:74},
    {t:'box',x:222,y:44,w:150,h:60,label:'evolve',fs:14},
    {t:'arrow',x1:372,y1:74,x2:420,y2:74},
    {t:'box',x:420,y:44,w:150,h:60,label:'measure',fs:14},
    {t:'arrow',x1:570,y1:74,x2:618,y2:74},
    {t:'box',x:618,y:44,w:100,h:60,label:'count',fs:14},
    {t:'text',x:99,y:128,label:'a normalised vector',fs:12},
    {t:'text',x:297,y:128,label:'e^{-iHt}',tex:true,fs:13},
    {t:'text',x:495,y:128,label:'\\langle\\psi|P_{a}|\\psi\\rangle',tex:true,fs:13},
    {t:'text',x:668,y:128,label:'N shots',fs:12}
  ]});
}

/* A normalisable packet beside the oscillation that supplies its local wave
   number. The envelope is what makes the squared norm finite. */
function figWavePacket(){
  const a=P.Axes({w:560,h:270,xr:[-6,6],yr:[-1.15,1.15],
    xlabel:'x',ylabel:'\\operatorname{Re}\\psi(x)',pad:{l:58,r:22,t:24,b:42},xtarget:6,ytarget:5});
  a.curve(x=>Math.exp(-x*x/8)*Math.cos(3*x),{color:C.in,width:2.3});
  a.curve(x=>Math.exp(-x*x/8),{color:C.muted,width:1.2,dash:'4 4'});
  a.curve(x=>-Math.exp(-x*x/8),{color:C.muted,width:1.2,dash:'4 4'});
  return a.svg();
}

/* The first three well eigenfunctions, shifted to their energy levels. */
function figWell(){
  const a=P.Axes({w:560,h:300,xr:[-0.15,1.15],yr:[0,10.2],
    xlabel:'x/a',ylabel:'E/E_1',pad:{l:58,r:22,t:24,b:42},xtarget:5,ytarget:5});
  a.vline(0,{color:C.err,width:2}); a.vline(1,{color:C.err,width:2});
  [1,2,3].forEach((n,i)=>{
    const col=[C.in,C.out,C.h][i];
    a.hline(n*n,{color:C.grid,width:1,dash:'3 4'});
    a.curve(x=>n*n+0.55*Math.sin(n*Math.PI*x),{color:col,width:2.1,from:0,to:1});
  });
  return a.svg();
}

/* The same state before and after a reading. Before, the bars are the Born
   probabilities; after the reading 1, the state is |1> and a repeat is
   certain. */
function figCollapse(){
  const a = P.Axes({w:540,h:250,xr:[0,4.4],yr:[0,1.15],
    ylabel:'\\text{probability}', pad:{l:62,r:24,t:26,b:56},
    xticksOverride:[], ytarget:4});
  const bar=(n,v,f,l)=>{ a.rect(n-0.28,0,n+0.28,v,{fill:f});
    a.poly([[n-0.28,v],[n+0.28,v]],{color:l,width:2.4}); };
  const X = [0.6,1.6,2.8,3.8];
  bar(X[0],0.2,C.dec.in,C.in);  bar(X[1],0.8,C.dec.in,C.in);
  bar(X[2],0,C.dec.out,C.out);  bar(X[3],1,C.dec.out,C.out);
  ['0','1','0','1'].forEach((t,k)=>a.note(X[k],0,t,{fs:12.5,color:C.muted,anchor:'middle',dy:26}));
  a.note(1.1,0,'before',{fs:13,color:C.in,anchor:'middle',dy:48});
  a.note(3.3,0,'after the reading 1',{fs:13,color:C.out,anchor:'middle',dy:48});
  return a.svg();
}

/* The reported probability of 0 against the true one, for three symmetric
   error rates. All three lines pass through (1/2, 1/2); the slope is 1-2 eps. */
function figReadout(){
  const a = P.Axes({w:540,h:260,xr:[0,1],yr:[0,1.08],
    xlabel:'q', ylabel:'p_{\\text{rep}}(0)',
    pad:{l:66,r:24,t:26,b:46}, xtarget:5, ytarget:4});
  a.curve(q => q, {color:C.in, width:2.4});
  a.curve(q => 0.1 + 0.8*q, {color:C.err, width:2.2});
  a.curve(q => 0.5, {color:C.muted, width:1.8, dash:'5 4'});
  a.note(0.95,0.95,'\\epsilon=0',{fs:13,color:C.in,anchor:'end',dx:-14,dy:-4,tex:true});
  a.note(0.97,0.876,'\\epsilon=0.1',{fs:13,color:C.err,anchor:'end',dy:36,tex:true});
  a.note(0.03,0.5,'\\epsilon=\\tfrac12',{fs:13,color:C.muted,dy:-12,tex:true});
  return a.svg();
}

/* The |1> amplitude of |+> under H = (omega/2) Z, taken relative to the |0>
   amplitude, at four times. Its length never changes; only its angle does. */
function figPhaseCircle(){
  /* 340 px over an x span of 2.72 and 200 px over a y span of 1.60: both
     125 px to the unit, so the circle is round and the quarter turns are
     right angles. */
  const a = P.Axes({w:400,h:260,xr:[-1.36,1.36],yr:[-0.80,0.80],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:true, arrows:false});
  const ring=[]; for(let i=0;i<=160;i++){ const t=2*Math.PI*i/160; ring.push([R2*Math.cos(t),R2*Math.sin(t)]); }
  a.poly(ring,{color:C.grid,width:1.3});
  a.poly([[0,0],[R2,0]],{color:C.mid,width:2.6});
  [[0,'\\omega t=0',10,-8,'start'],[Math.PI/2,'\\pi/2',12,5,'start'],
   [Math.PI,'\\pi',-10,-8,'end'],[3*Math.PI/2,'3\\pi/2',12,5,'start']].forEach(([t,l,dx,dy,an])=>{
    const x = R2*Math.cos(t), y = R2*Math.sin(t);
    a.point(x,y,{color:C.mid,r:6});
    a.note(x,y,l,{fs:13.5,color:C.mid,dx:dx,dy:dy,anchor:an,tex:true});
  });
  return a.svg();
}

const SC = [

/* ---------------------------------------------------------------- 2.0.1 -- */
{ id:'m2-open', module:'M2', nav:'States, Measurement and Dynamics', title:'States, Measurement and Dynamics',
  objective:'Name the four postulates and say which parts of the course each one licenses.',
  keywords:'postulates state evolution measurement composition overview module 2 quantum mechanics',
  src:'L4 · quantum-mechanical state and measurement principles', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · States, measurement and dynamics'},
  {t:'title', text:'States, Measurement and Dynamics'},
  {t:'lede', text:'Chapter 1 was mathematics and nothing else could have been argued with. This chapter adds the four statements that connect that mathematics to a laboratory. They are postulates: they are not derived from anything, they are what experiment has found to hold, and everything else in the course follows from them.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The first says what a state is: a normalised vector in a complex space, with two vectors differing by a global phase describing the same physical state. That was chapter 1, and this chapter uses it without restating it.</p>'},
    {t:'body', html:'<p>The fourth says how two systems combine: by the tensor product. That was chapter 1 too, and chapter 3 takes it further.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The two in between', html:'<b>Evolution.</b> A closed system evolves by a unitary operator, and that operator is the exponential of a Hermitian one: $|\\psi(t)\\rangle=e^{-iHt}|\\psi(0)\\rangle$. <b>Measurement.</b> A measurement is described by a set of operators; it returns one outcome, with a probability given by the state, and it leaves the state changed. Everything in this chapter is one of those two.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figPostulates(),
      caption:'The four statements, in the order a run of a quantum computer uses them. Each says what is allowed and none says how to build it; the hardware chapters of a fuller course are about the second question and this one is about the first.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'What a postulate is not', html:'It is not an interpretation. The word <b>collapse</b> in the measurement postulate is shorthand for "condition the state on the result that was recorded", and every number in this chapter follows from the rule without anyone choosing what the collapse <i>means</i>. Where that choice matters this course says so; it does not matter anywhere in it.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.1.1 -- */
{ id:'m2-born', module:'M2', nav:'The Born Rule', title:'The Born Rule',
  objective:'State the Born rule and check that the probabilities it gives add to one.',
  keywords:'born rule probability amplitude squared modulus outcome basis completeness shot',
  src:'L4 · Born rule', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'The Born Rule'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShot(),
      caption:'One shot returns one outcome and nothing else. The amplitudes decide only how often each outcome comes back over many shots.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Square the modulus', html:'$p(n)$ is $|c_{n}|^{2}$, never $c_{n}^{2}$. For $c_{1}=4i/5$ the square is $-16/25$, and a probability cannot be negative.'}]},
  ], right:[
    {t:'eq', key:true, label:'Born rule', tex:'p(n) = \\left|\\langle n|\\psi\\rangle\\right|^{2}',
      note:'Measure in an orthonormal basis $\\{|n\\rangle\\}$. The coefficients $c_{n}=\\langle n|\\psi\\rangle$ are called <b>probability amplitudes</b>. The probabilities add to one because the state is normalised.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} c_{0} &= \\tfrac35, \\quad c_{1} = \\tfrac{4i}{5} \\\\ p(0) &= \\tfrac{9}{25}, \\quad p(1) = \\tfrac{16}{25} \\end{aligned}',
        note:'For $|\\psi\\rangle=\\tfrac15\\left(3|0\\rangle+4i|1\\rangle\\right)$. The two add to one, and the $i$ changes nothing: this basis cannot see a phase on one amplitude.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac12\\left(\\sqrt3\\,|0\\rangle+i|1\\rangle\\right)$, measured in the computational basis.<div class="nsep"></div>What is $p(1)$?',
        ask:{key:'m2-born', choices:['$\\tfrac14$','$-\\tfrac14$','$\\tfrac12$'], answer:0,
          why:'$c_{1}=i/2$ and $|i/2|^{2}=\\tfrac14$. The modulus removes the $i$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.1.2 -- */
{ id:'m2-bases', module:'M2', nav:'Measurement Bases', title:'Measurement Bases',
  objective:'Separate a passive change of coordinates from the choice of what to measure.',
  keywords:'measurement basis Z X Y eigenbasis passive change of coordinates different experiment pauli',
  src:'L4 · three standard qubit bases', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'Measurement Bases'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figThreeBases(),
      caption:'One state, read by three instruments. The bars are computed from the state. The state is the same in all three groups; the experiment is not.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Not a change of coordinates', html:'Rewriting a state in another basis changes no prediction. Choosing what to measure picks different projectors, and the probabilities change. Only the second is a new experiment.'}]},
  ], right:[
    {t:'eq', key:true, label:'Three standard bases', tex:'\\{|0\\rangle,|1\\rangle\\}, \\qquad \\{|+\\rangle,|-\\rangle\\}, \\qquad \\{|{+}i\\rangle,|{-}i\\rangle\\}',
      note:'They are the eigenbases of $Z$, $X$ and $Y$, so the three measurements are named after those operators. Hardware measures $X$ by applying a gate first, and that gate has its own error.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} Z:&\\quad \\left|\\langle 0|+\\rangle\\right|^{2} = \\tfrac12 \\\\ X:&\\quad \\left|\\langle +|+\\rangle\\right|^{2} = 1 \\end{aligned}',
        note:'The state $|+\\rangle$ in two experiments. Measured in $Z$ it is a coin; measured in $X$ the answer is certain.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The state $|0\\rangle$ is measured in the $X$ basis.<div class="nsep"></div>What is $p(+)$?',
        ask:{key:'m2-bases', choices:['$1$','$\\tfrac12$','$0$'], answer:1,
          why:'$\\langle +|0\\rangle=1/\\sqrt2$, so $p(+)=\\tfrac12$. A certain $Z$ state is a coin in $X$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.1.3 -- */
{ id:'m2-distinguish', module:'M2', nav:'Distinguishing Quantum States', title:'Distinguishing Quantum States',
  objective:'Show that one measurement separates two states with certainty exactly when they are orthogonal.',
  keywords:'distinguishing states orthogonal certainty overlap single shot no cloning discrimination',
  src:'L4 · projectors and measurement geometry', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'Distinguishing Quantum States'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figDistinguish(),
      caption:'Two states at an angle $\\theta$, with $|\\langle a|b\\rangle|=\\cos\\theta$. One measurement separates them with certainty only when $\\theta$ is a right angle.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Name the resource', html:'With <b>one copy</b> the error of a guess cannot reach zero. With <b>many copies</b> it can, because repeated shots estimate the probabilities.'}]},
  ], right:[
    {t:'eq', key:true, label:'Certain in one shot', tex:'\\text{certain in one shot} \\iff \\langle a|b\\rangle = 0',
      note:'Measure with $P_{a}=|a\\rangle\\langle a|$ and $I-P_{a}$. On $|a\\rangle$ the first outcome is certain. On an orthogonal $|b\\rangle$ it never happens.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Best single guess', tex:'p_{\\text{correct}} = \\tfrac12\\left(1+\\sin\\theta\\right)',
        note:'For two equally likely states and the best measurement. It is $\\tfrac12$ when the states coincide and $1$ when they are orthogonal.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The states $|0\\rangle$ and $|+\\rangle$, each sent half the time, one copy.<div class="nsep"></div>What is the best chance of naming the state correctly?',
        ask:{key:'m2-distinguish', choices:['$0.5$','$0.854$','$1$'], answer:1,
          why:'$|\\langle 0|+\\rangle|=1/\\sqrt2$, so $\\theta=\\pi/4$ and $\\tfrac12\\left(1+\\sin\\tfrac{\\pi}{4}\\right)\\approx 0.854$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.L1 --- */
{ id:'m2-lab-c', module:'M2', nav:'Laboratory C \u2014 Exact Probability and Finite Samples', title:'Laboratory C \u2014 Exact Probability and Finite Samples',
  objective:'Let the reader set a state, a measurement basis and a shot count, and read the exact answer beside the sampled one.',
  keywords:'laboratory measurement basis shots histogram exact probability sampling error wilson interval',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'Laboratory C \u2014 Exact Probability and Finite Samples'},
  {t:'small', html:'The state is $\\cos(\\theta/2)|0\\rangle+e^{i\\varphi}\\sin(\\theta/2)|1\\rangle$ and the instrument measures along $Z$, $X$ or $Y$. The left panel puts the exact Born probabilities beside the frequencies of a simulated run; the right one follows the estimate as the shots accumulate, inside the band the sampling error allows. Nothing here is noisy hardware: the device is perfect and the spread is the counting alone.'},
  {t:'lab', id:'C'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m2-code-born', module:'M2', nav:'The Born Rule in Code', title:'The Born Rule in Code',
  objective:'Turn amplitudes into probabilities, read one state in three bases, and compute the best guess between two states.',
  keywords:'code qiskit numpy program born rule probability basis measurement distinguish run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'The Born Rule in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-born')}
]},

/* ---------------------------------------------------------------- 2.2.1 -- */
{ id:'m2-proj', module:'M2', nav:'Projective Measurement', title:'Projective Measurement',
  objective:'Write a measurement as a set of orthogonal projectors and compute an outcome probability from them.',
  keywords:'projective measurement projectors orthogonal complete degenerate eigenspace born probability rank',
  src:'L5 · projective measurement', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Projective measurement'},
  {t:'title', text:'Projective Measurement'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figObservable(),
      caption:'An observable, taken apart. The eigenvalues are the numbers the instrument reports. The projectors decide how often each one comes back.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The outcome is a number', html:'An instrument reports an eigenvalue, not a vector. "The outcome was $|+\\rangle$" means: the reading was $+1$ of $X$, and the state afterwards is $|+\\rangle$.'}]},
  ], right:[
    {t:'eq', key:true, label:'Projective measurement', tex:'p(a) = \\langle\\psi|P_{a}|\\psi\\rangle, \\qquad P_{j}P_{k}=\\delta_{jk}P_{k}, \\qquad \\sum_{a}P_{a}=I',
      note:'Orthogonal projectors make the outcomes exclusive. Adding to $I$ makes the probabilities add to one. With rank-one projectors this is the Born rule again.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} P_{+1} &= |0\\rangle\\langle 0| + |1\\rangle\\langle 1| \\\\ p(+1) &= \\tfrac13 + \\tfrac13 = \\tfrac23 \\end{aligned}',
        note:'For $A=\\operatorname{diag}(1,1,-1)$ on the three-level state $\\tfrac{1}{\\sqrt3}\\left(|0\\rangle+|1\\rangle+|2\\rangle\\right)$. The eigenvalue $+1$ is repeated, so its projector has rank two: a <b>degenerate</b> outcome.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$Z$ is measured on $|\\psi\\rangle=\\tfrac{1}{\\sqrt{10}}\\left(3|0\\rangle+|1\\rangle\\right)$.<div class="nsep"></div>What is the probability of the reading $-1$?',
        ask:{key:'m2-proj', choices:['$\\tfrac{1}{10}$','$\\tfrac{9}{10}$','$\\tfrac{1}{\\sqrt{10}}$'], answer:0,
          why:'The reading $-1$ belongs to $|1\\rangle$, so $p(-1)=\\langle\\psi|1\\rangle\\langle 1|\\psi\\rangle=\\tfrac{1}{10}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.2.2 -- */
{ id:'m2-collapse', module:'M2', nav:'The Post-Measurement State', title:'The Post-Measurement State',
  objective:'Apply the projection update rule and show that an immediate repeat gives the same answer.',
  keywords:'state update luders rule collapse conditioning renormalise repeatable measurement disturbance',
  src:'L5 · projective measurement', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Projective measurement'},
  {t:'title', text:'The Post-Measurement State'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCollapse(),
      caption:'The state $\\tfrac{1}{\\sqrt5}\\left(|0\\rangle+2|1\\rangle\\right)$ before a $Z$ measurement, and after the reading $1$. Afterwards the state is $|1\\rangle$, so a repeat gives $1$ with certainty.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Divide by the length', html:'$P_{a}|\\psi\\rangle$ alone has length $\\sqrt{p(a)}$, not $1$. Forget the division and every later probability comes out too small.'}]},
  ], right:[
    {t:'eq', key:true, label:'State after the reading', tex:'|\\psi_{a}\\rangle = \\frac{P_{a}|\\psi\\rangle}{\\sqrt{p(a)}}',
      note:'Project, then put the state back to length one. The length the projector removes is the probability of the other outcomes.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} P_{1}|\\psi\\rangle &= \\tfrac{2}{\\sqrt5}\\,|1\\rangle, \\quad p(1) = \\tfrac45 \\\\ |\\psi_{1}\\rangle &= \\tfrac{2}{\\sqrt5}\\,|1\\rangle \\Big/ \\tfrac{2}{\\sqrt5} = |1\\rangle \\end{aligned}',
        note:'For the state in the figure and the reading $1$. A repeat gives $\\langle\\psi_{1}|P_{1}|\\psi_{1}\\rangle=1$: that is what <b>projective</b> means.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|+\\rangle$ is measured in $Z$ and gives $0$. It is measured in $Z$ again at once.<div class="nsep"></div>What is $p(0)$ on the second measurement?',
        ask:{key:'m2-collapse', choices:['$\\tfrac12$','$1$','$\\tfrac14$'], answer:1,
          why:'The first reading left the state $|0\\rangle$, so the repeat gives $0$ with certainty.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.2.3 -- */
{ id:'m2-povm', module:'M2', nav:'Generalized Measurements and Readout Error', title:'Generalized Measurements and Readout Error',
  objective:'Use effects for outcome probabilities, an instrument for the conditional state, and a POVM to model imperfect readout.',
  keywords:'povm effects positive operators readout error assignment fidelity calibration matrix instrument',
  src:'L5 · general measurements: POVMs and instruments', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Projective measurement'},
  {t:'title', text:'Generalized Measurements and Readout Error'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figReadout(),
      caption:'The reported $p(0)$ against the true $q$ for three error rates. At $\\epsilon=\\tfrac12$ the line is flat, and the readout says nothing about the state.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Correcting costs precision', html:'Inverting the line recovers $q$ from the reported frequency. Dividing by $1-2\\epsilon$ also multiplies the sampling error by $1/(1-2\\epsilon)$, so report the wider error bar with the corrected number.'}]},
  ], right:[
    {t:'eq', key:true, label:'Effects', tex:'E_{m}\\succeq 0, \\qquad \\sum_{m} E_{m} = I, \\qquad p(m) = \\langle\\psi|E_{m}|\\psi\\rangle',
      note:'Positive operators that add to the identity: a <b>POVM</b>. Projectors are the special case. Effects fix only the probabilities: the state afterwards needs operators $M_{m}$ with $E_{m}=M_{m}^{\\dagger}M_{m}$, and two devices with the same effects can disturb it differently.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} E_{0} &= (1-\\epsilon)\\,|0\\rangle\\langle 0| + \\epsilon\\,|1\\rangle\\langle 1| \\\\ p_{\\text{rep}}(0) &= (1-\\epsilon)\\,q + \\epsilon\\,(1-q) = \\epsilon + (1-2\\epsilon)\\,q \\end{aligned}',
        note:'A readout that flips the bit with probability $\\epsilon$, on a state with true $p(0)=q$. $E_{0}^{2}\\ne E_{0}$, so $E_{0}$ is not a projector.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The error rate is $\\epsilon=0.1$ and the state is $|0\\rangle$, so $q=1$.<div class="nsep"></div>What is the reported $p(0)$?',
        ask:{key:'m2-povm', choices:['$1$','$0.9$','$0.8$'], answer:1,
          why:'$\\epsilon+(1-2\\epsilon)q=0.1+0.8=0.9$. One shot in ten is flipped.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m2-code-measure', module:'M2', nav:'Projective Measurement in Code', title:'Projective Measurement in Code',
  objective:'Apply the update rule, follow three measurements in a row, and model a readout error with effects.',
  keywords:'code qiskit numpy program projective measurement update rule collapse readout error povm run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 2 · Projective measurement'},
  {t:'title', text:'Projective Measurement in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-measure')}
]},

/* ---------------------------------------------------------------- 2.3.1 -- */
{ id:'m2-obs', module:'M2', nav:'Expectation Values', title:'Expectation Values',
  objective:'Compute an expectation value two ways and say what it is an average over.',
  keywords:'observable expectation value ensemble average hermitian eigenvalue mean not an outcome',
  src:'L5 · expectation values and variance', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Observables'},
  {t:'title', text:'Expectation Values'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figExpectation(),
      caption:'Outcomes $-1$ and $+1$, and the mean of many readings. The instrument returns one of the two stems and never the dashed line.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A mean is not a reading', html:'The instrument returns $+1$ or $-1$, never $0.6$. $\\langle Z\\rangle=0.6$ describes a long run of identical preparations, and it needs a shot count and an error bar.'}]},
  ], right:[
    {t:'eq', key:true, label:'Expectation value', tex:'\\langle A\\rangle = \\langle\\psi|A|\\psi\\rangle = \\sum_{a} a\\,p(a)',
      note:'Expand $A$ in its eigenvalues and projectors: the sandwich is the average of the eigenvalues, weighted by their probabilities. It is real because $A$ is Hermitian.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} p(+1) &= \\tfrac45, \\quad p(-1) = \\tfrac15 \\\\ \\langle Z\\rangle &= \\tfrac45 - \\tfrac15 = \\tfrac35 \\end{aligned}',
        note:'For $|\\psi\\rangle=\\tfrac{1}{\\sqrt5}\\left(2|0\\rangle+|1\\rangle\\right)$. The matrix route gives $\\tfrac15(4-1)=\\tfrac35$ as well.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The observable $X$ and the state $|0\\rangle$.<div class="nsep"></div>What is $\\langle X\\rangle$?',
        ask:{key:'m2-obs', choices:['$0$','$1$','$\\tfrac12$'], answer:0,
          why:'$X|0\\rangle=|1\\rangle$ and $\\langle 0|1\\rangle=0$. The readings $+1$ and $-1$ come equally often.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.3.2 -- */
{ id:'m2-var', module:'M2', nav:'Variance and Sharp Observables', title:'Variance and Sharp Observables',
  objective:'Compute a variance and identify the states for which it vanishes.',
  keywords:'variance standard deviation spread sharp eigenstate certainty delta A observable',
  src:'L5 · expectation values and variance', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Observables'},
  {t:'title', text:'Variance and Sharp Observables'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figVariance(),
      caption:'The mean and the spread of $Z$ on $\\cos(\\theta/2)|0\\rangle+\\sin(\\theta/2)|1\\rangle$. At both ends the state is an eigenstate and the spread is zero.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Square before, or after?', html:'$\\langle A^{2}\\rangle$ squares the matrix before the sandwich. $\\langle A\\rangle^{2}$ squares the number after it. Using $\\langle A\\rangle^{2}$ for both gives zero spread on every state.'}]},
  ], right:[
    {t:'eq', key:true, label:'Variance', tex:'\\operatorname{Var}(A) = \\langle A^{2}\\rangle - \\langle A\\rangle^{2}, \\qquad \\Delta A = \\sqrt{\\operatorname{Var}(A)}',
      note:'The spread is zero exactly when $|\\psi\\rangle$ is an eigenstate of $A$. Then every reading gives the same number, and the reading is <b>sharp</b>.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\langle Z\\rangle &= 0, \\quad \\langle Z^{2}\\rangle = \\langle I\\rangle = 1 \\\\ \\operatorname{Var}(Z) &= 1 - 0 = 1 \\end{aligned}',
        note:'On $|+\\rangle$. Every Pauli squares to $I$, so for a Pauli $\\operatorname{Var}(A)=1-\\langle A\\rangle^{2}$ on any state.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The observable $Z$ and the state $\\tfrac12\\left(|0\\rangle+\\sqrt3\\,|1\\rangle\\right)$.<div class="nsep"></div>What is $\\operatorname{Var}(Z)$?',
        ask:{key:'m2-var', choices:['$\\tfrac34$','$\\tfrac14$','$1$'], answer:0,
          why:'$\\langle Z\\rangle=\\tfrac14-\\tfrac34=-\\tfrac12$, so $\\operatorname{Var}(Z)=1-\\tfrac14=\\tfrac34$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m2-code-obs', module:'M2', nav:'Observables in Code', title:'Observables in Code',
  objective:'Compute an expectation value by two routes, a variance, and a mean from the eigenvalues.',
  keywords:'code qiskit numpy program expectation value variance observable eigenvalues run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 2 · Observables'},
  {t:'title', text:'Observables in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-obs')}
]},

/* ---------------------------------------------------------------- 2.4.1 -- */
{ id:'m2-comm', module:'M2', nav:'Commutators and Compatibility', title:'Commutators and Compatibility',
  objective:'Compute a commutator and connect it to whether two observables share an eigenbasis.',
  keywords:'commutator compatible observables shared eigenbasis simultaneous sharp sequential measurement disturbance',
  src:'L5 · compatibility, commutators and uncertainty', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Compatibility and uncertainty'},
  {t:'title', text:'Commutators and Compatibility'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figSequence(),
      caption:'Three measurements on $|0\\rangle$. The first is certain. The $X$ measurement leaves an $X$ eigenstate, so the last $Z$ is a coin.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Not a clumsy apparatus', html:'The reason is not that a measurement kicks the system. No state is an eigenvector of both $X$ and $Z$, so no preparation makes both readings certain.'}]},
  ], right:[
    {t:'eq', key:true, label:'Commutator', tex:'[A,B] = AB - BA',
      note:'Two observables can both be sharp on one state when they share an eigenbasis. For Hermitian operators that happens exactly when $[A,B]=0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} [X,Z] &= \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix} - \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix} \\\\ &= \\begin{bmatrix}0&-2\\\\2&0\\end{bmatrix} = -2iY \\end{aligned}',
        note:'The first matrix is $XZ$ and the second is $ZX$. The result is not zero, so no state has a sharp $X$ and a sharp $Z$ together.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$YZ=iX$.<div class="nsep"></div>What is $[Y,Z]$?',
        ask:{key:'m2-comm', choices:['$0$','$2iX$','$-2iX$'], answer:1,
          why:'$ZY=(YZ)^{\\dagger}=-iX$, so $[Y,Z]=iX-(-iX)=2iX$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.4.2 -- */
{ id:'m2-uncert', module:'M2', nav:'The Uncertainty Relation', title:'The Uncertainty Relation',
  objective:'State the Robertson relation, check it on a family of states, and say what it does not claim.',
  keywords:'uncertainty relation robertson bound commutator spread product cauchy schwarz saturated',
  src:'L5 · Robertson uncertainty relation', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Compatibility and uncertainty'},
  {t:'title', text:'The Uncertainty Relation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figUncertainty(),
      caption:'The product $\\Delta X\\,\\Delta Z$ and the bound on $\\cos(\\theta/2)|0\\rangle+e^{i\\pi/4}\\sin(\\theta/2)|1\\rangle$. The product stays above the bound and touches it at one state.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'It is not about disturbance', html:'$\\Delta A$ and $\\Delta B$ come from two separate sets of runs on the same preparation. The relation is about two distributions, not about one apparatus spoiling another.'}]},
  ], right:[
    {t:'eq', key:true, label:'Robertson relation', tex:'\\Delta A \\,\\Delta B \\;\\ge\\; \\tfrac12\\left|\\langle [A,B]\\rangle\\right|',
      note:'It holds on every state. The proof is Cauchy-Schwarz from Chapter 1, applied to $A-\\langle A\\rangle I$ and $B-\\langle B\\rangle I$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} [X,Z] &= -2iY \\\\ \\Delta X\\,\\Delta Z &\\ge \\tfrac12\\left|\\langle -2iY\\rangle\\right| = \\left|\\langle Y\\rangle\\right| \\end{aligned}',
        note:'On $|0\\rangle$, $\\langle Y\\rangle=0$ and the bound says nothing, correctly: $Z$ is sharp there. The bound has content only where $\\langle Y\\rangle\\ne 0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The state $|{+}i\\rangle$, on which $\\langle Y\\rangle=1$.<div class="nsep"></div>What lower bound does the relation give for $\\Delta X\\,\\Delta Z$?',
        ask:{key:'m2-uncert', choices:['$0$','$\\tfrac12$','$1$'], answer:2,
          why:'The bound is $|\\langle Y\\rangle|=1$. Here $\\Delta X=\\Delta Z=1$, so the state meets it exactly.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m2-code-comm', module:'M2', nav:'Compatibility and Uncertainty in Code', title:'Compatibility and Uncertainty in Code',
  objective:'Compute a commutator, check the Robertson bound on one state, and see the order of two measurements matter.',
  keywords:'code qiskit numpy program commutator uncertainty robertson sequential measurement run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 2 · Compatibility and uncertainty'},
  {t:'title', text:'Compatibility and Uncertainty in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-comm')}
]},

/* ---------------------------------------------------------------- 2.5.1 -- */
{ id:'m2-pauli', module:'M2', nav:'The Pauli Operators', title:'The Pauli Operators',
  objective:'List the three Pauli operators with their eigenvalues and eigenstates, and say why each is both an observable and a gate.',
  keywords:'pauli matrices X Y Z hermitian unitary traceless square identity eigenstates spin stern gerlach',
  src:'L5 · spin-1/2 observables and Pauli matrices', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · The Pauli algebra'},
  {t:'title', text:'The Pauli Operators'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figAxes(),
      caption:'The three measurement directions of one qubit, one axis for each Pauli operator. Chapter 4 turns this picture into the Bloch sphere.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Where they come from', html:'They are the components of spin: $S_{a}=\\tfrac{\\hbar}{2}\\sigma_{a}$. A Stern-Gerlach magnet, which sorts atoms into two beams, measures one of them.'}]},
  ], right:[
    {t:'eq', key:true, label:'Pauli operators', tex:'X=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}, \\quad Y=\\begin{bmatrix}0&-i\\\\i&0\\end{bmatrix}, \\quad Z=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}',
      note:'Each is Hermitian, so it is an observable, and unitary, so it is also a gate. Each squares to $I$ and has trace $0$, so its eigenvalues are $+1$ and $-1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Eigenstates', tex:'\\begin{aligned} X|\\pm\\rangle &= \\pm|\\pm\\rangle \\\\ Y|{\\pm}i\\rangle &= \\pm|{\\pm}i\\rangle \\\\ Z|0\\rangle &= |0\\rangle, \\quad Z|1\\rangle = -|1\\rangle \\end{aligned}',
        note:'Here $|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$ and $|{\\pm}i\\rangle=(|0\\rangle\\pm i|1\\rangle)/\\sqrt2$: the three bases of Section 2.1.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The gate $Y$ acts on $|0\\rangle$.<div class="nsep"></div>What comes out?',
        ask:{key:'m2-pauli', choices:['$|1\\rangle$','$i|1\\rangle$','$-i|1\\rangle$'], answer:1,
          why:'$Y|0\\rangle$ is the first column of $Y$, which is $(0,i)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.5.2 -- */
{ id:'m2-paulialg', module:'M2', nav:'The Pauli Algebra', title:'The Pauli Algebra',
  objective:'Use the Pauli product rule to get any commutator or anticommutator without multiplying matrices.',
  keywords:'pauli algebra product rule commutator anticommutator cyclic levi civita identity operator basis',
  src:'L5 · Pauli algebra', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · The Pauli algebra'},
  {t:'title', text:'The Pauli Algebra'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figCycle(),
      caption:'The cyclic order $X\\to Y\\to Z\\to X$. With an arrow, the product of two is $i$ times the third; against it, $-i$ times the third.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Why it pays to know this', html:'Every one-qubit gate in Chapter 4 is $\\cos(\\theta/2)I-i\\sin(\\theta/2)\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma$. Composing two gates is then a Pauli product, done in your head.'}]},
  ], right:[
    {t:'eq', key:true, label:'Product rule', tex:'\\sigma_{i}\\sigma_{j} = \\delta_{ij}\\,I \\;+\\; i\\sum_{k}\\varepsilon_{ijk}\\,\\sigma_{k}',
      note:'Same index: the identity. Different indices: $i$ times the third, with $+$ in the cyclic order and $-$ against it.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} XY &= iZ, \\quad YX = -iZ \\\\ [X,Y] &= 2iZ, \\quad \\{X,Y\\} = XY+YX = 0 \\end{aligned}',
        note:'Two different Pauli operators <b>anticommute</b>: $\\sigma_{i}\\sigma_{j}=-\\sigma_{j}\\sigma_{i}$. By matrices, $XY=\\operatorname{diag}(i,-i)=iZ$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The product $ZX$.<div class="nsep"></div>What is it?',
        ask:{key:'m2-paulialg', choices:['$iY$','$-iY$','$Y$'], answer:0,
          why:'$Z\\to X$ follows the cycle, so the sign is $+i$ and $ZX=iY$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.5.3 -- */
{ id:'m2-ndotsigma', module:'M2', nav:'Spin Along an Arbitrary Direction', title:'Spin Along an Arbitrary Direction',
  objective:'Build the projectors for a measurement along an arbitrary axis and read off the outcome probability.',
  keywords:'n dot sigma arbitrary direction projector half identity plus axis bloch vector cos squared',
  src:'L5 · Stern-Gerlach experiment', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · The Pauli algebra'},
  {t:'title', text:'Spin Along an Arbitrary Direction'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figNdotR(),
      caption:'The probability of $+1$ against the angle $\\alpha$ between the instrument direction $\\mathbf{n}$ and the vector $\\mathbf{r}$ of the state. Aligned: certain. At a right angle: a coin.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Twice the angle', html:'Two orthogonal states sit at $\\alpha=\\pi$ in this picture, not at a right angle. The angle between the vectors is twice the angle between the states.'}]},
  ], right:[
    {t:'eq', key:true, label:'Projectors along a direction', tex:'P_{\\pm} = \\tfrac12\\left(I \\pm \\mathbf{n}\\cdot\\boldsymbol\\sigma\\right), \\qquad \\mathbf{n}\\cdot\\boldsymbol\\sigma = n_{x}X+n_{y}Y+n_{z}Z',
      note:'For a unit vector $\\mathbf{n}$, $(\\mathbf{n}\\cdot\\boldsymbol\\sigma)^{2}=I$, so the readings are again $\\pm1$ and $P_{\\pm}^{2}=P_{\\pm}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'Probability', tex:'p(\\pm) = \\tfrac12\\left(1 \\pm \\mathbf{n}\\cdot\\mathbf{r}\\right), \\qquad r_{a} = \\langle\\sigma_{a}\\rangle',
        note:'Three measurable means answer every one-qubit measurement. For $|0\\rangle$, $\\mathbf{r}=(0,0,1)$, and an instrument $60^{\\circ}$ from $z$ gives $p(+)=\\tfrac12(1+\\tfrac12)=\\tfrac34$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The instrument points along $x$, $\\mathbf{n}=(1,0,0)$, and the state is $|0\\rangle$.<div class="nsep"></div>What is $p(+)$?',
        ask:{key:'m2-ndotsigma', choices:['$1$','$\\tfrac12$','$0$'], answer:1,
          why:'$\\mathbf{r}=(0,0,1)$, so $\\mathbf{n}\\cdot\\mathbf{r}=0$ and $p(+)=\\tfrac12$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m2-code-pauli', module:'M2', nav:'The Pauli Algebra in Code', title:'The Pauli Algebra in Code',
  objective:'Check the Pauli properties, the product rule, and a measurement along a tilted direction.',
  keywords:'code qiskit numpy program pauli product rule anticommute direction projector run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 2 · The Pauli algebra'},
  {t:'title', text:'The Pauli Algebra in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-pauli')}
]},

/* ---------------------------------------------------------------- 2.6.1 -- */
{ id:'m2-position', module:'M2', nav:'Position and Momentum Operators', title:'Position and Momentum Operators',
  objective:'Write the position, momentum and free-particle Hamiltonian in the coordinate representation and distinguish a plane wave from a physical packet.',
  keywords:'coordinate representation position momentum operator wavefunction plane wave wave packet free particle Hamiltonian continuous spectrum hbar',
  src:'L5 · coordinate representation and the free particle', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Position and Momentum Operators'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figWavePacket(),
      caption:'An oscillation inside a decaying envelope. The oscillation gives the wave number; the envelope makes the squared norm finite, so the state can be normalised.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'A plane wave is not a state', html:'$e^{ikx}$ fills all of space, so its squared norm is infinite. A physical free particle is a <b>wave packet</b>: a continuous superposition of plane waves.'}]},
  ], right:[
    {t:'eq', key:true, label:'Position and momentum', tex:'(\\hat{x}\\psi)(x)=x\\psi(x), \\qquad (\\hat{p}\\psi)(x)=-i\\hbar\\frac{\\mathrm d\\psi}{\\mathrm dx}',
      note:'Position multiplies the function; momentum differentiates it. A free particle has only kinetic energy, $\\hat{H}_{0}=\\hat{p}^{2}/2m$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\hat{p}\\,e^{ikx} &= -i\\hbar\\,(ik)\\,e^{ikx} = \\hbar k\\,e^{ikx} \\\\ \\hat{H}_{0}\\,e^{ikx} &= \\frac{\\hbar^{2}k^{2}}{2m}\\,e^{ikx} \\end{aligned}',
        note:'The plane wave is an eigenfunction of momentum, with $p=\\hbar k$, and of the free-particle energy. The derivative turns a wavelength into a momentum.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\psi(x)=e^{3ix}$, in units with $\\hbar=1$.<div class="nsep"></div>What momentum does $\\hat{p}$ return?',
        ask:{key:'m2-position', choices:['$3$','$-3$','$3i$'], answer:0,
          why:'$-i\\,\\tfrac{\\mathrm d}{\\mathrm dx}e^{3ix}=-i(3i)\\,e^{3ix}=3\\,e^{3ix}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.2 -- */
{ id:'m2-schrod', module:'M2', nav:'The Schrödinger Equation', title:'The Schrödinger Equation',
  objective:'Go from the Schrodinger equation to the evolution operator and check that it is unitary.',
  keywords:'schrodinger equation hamiltonian evolution operator unitary exponential closed system energy',
  src:'L5 · closed-system time evolution', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'The Schrödinger Equation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figPhaseCircle(),
      caption:'The $|1\\rangle$ amplitude of $|+\\rangle$ under $H=\\tfrac{\\omega}{2}Z$, measured against the $|0\\rangle$ amplitude, at four times. Its length stays $1/\\sqrt2$; only its angle turns, at rate $\\omega$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Only energy differences matter', html:'Replacing $H$ by $H+cI$ multiplies $U(t)$ by $e^{-ict}$, which is a global phase. So a Hamiltonian may be shifted to any zero of energy.'}]},
  ], right:[
    {t:'eq', key:true, label:'Evolution', tex:'\\begin{aligned} i\\,\\frac{\\mathrm{d}}{\\mathrm{d}t}|\\psi(t)\\rangle &= H\\,|\\psi(t)\\rangle \\\\ |\\psi(t)\\rangle &= e^{-iHt}\\,|\\psi(0)\\rangle \\end{aligned}',
      note:'A closed system, with $\\hbar=1$ and $H$ fixed in time. $H$ is Hermitian, so $U(t)=e^{-iHt}$ is unitary and the state stays normalised.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} U(t) &= \\operatorname{diag}\\left(e^{-i\\omega t/2},\\,e^{i\\omega t/2}\\right) \\\\ U(t)|+\\rangle &\\equiv \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\omega t}|1\\rangle\\right) \\end{aligned}',
        note:'For $H=\\tfrac{\\omega}{2}Z$, up to a global phase. $P(0)=\\tfrac12$ at every time: only the relative phase moves, and an $X$ measurement would see it.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The Hamiltonian $H$ is replaced by $H+5I$.<div class="nsep"></div>What happens to $P(0)$ at time $t$?',
        ask:{key:'m2-schrod', choices:['It does not change','It gains a factor $e^{-5it}$','It oscillates at rate $5$'], answer:0,
          why:'The shift multiplies the state by $e^{-5it}$, a global phase, and no probability changes.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.3 -- */
{ id:'m2-stationary', module:'M2', nav:'Stationary States and Beats', title:'Stationary States and Beats',
  objective:'Show that an energy eigenstate is stationary and that a superposition of two oscillates at their difference.',
  keywords:'stationary state energy eigenstate superposition beat frequency difference relative phase oscillation',
  src:'L5 · stationary states and superpositions', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Stationary States and Beats'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figBeat(),
      caption:'Start in $|+\\rangle$ under $H=\\tfrac{\\omega}{2}Z$ and measure in the $X$ basis. $P(+)$ falls to zero at $\\omega t=\\pi$ and returns to one at $\\omega t=2\\pi$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Watch in the right basis', html:'In the computational basis this state has $P(0)=\\tfrac12$ at every time, and the qubit looks dead. Only an $X$ or a $Y$ measurement sees the relative phase turn.'}]},
  ], right:[
    {t:'eq', label:'Stationary state', tex:'|E_{n}(t)\\rangle = e^{-iE_{n}t}\\,|E_{n}\\rangle',
      note:'An energy eigenstate only gains a global phase, so no probability of anything ever changes.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'Two energies beat', tex:'\\begin{aligned} |\\psi(t)\\rangle &= c_{1}e^{-iE_{1}t}|E_{1}\\rangle + c_{2}e^{-iE_{2}t}|E_{2}\\rangle \\\\ &\\equiv c_{1}|E_{1}\\rangle + c_{2}\\,e^{-i(E_{2}-E_{1})t}|E_{2}\\rangle \\end{aligned}',
        note:'Pull out the first phase as a global one. What is left is a relative phase that turns at the energy <b>difference</b>.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Two levels with $E_{1}=2$ and $E_{2}=5$, in units with $\\hbar=1$.<div class="nsep"></div>At what angular frequency does the relative phase turn?',
        ask:{key:'m2-stationary', choices:['$3$','$7$','$5$'], answer:0,
          why:'Only the difference $E_{2}-E_{1}=3$ is observable.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.4 -- */
{ id:'m2-well', module:'M2', nav:'The Infinite Square Well', title:'The Infinite Square Well',
  objective:'Derive the allowed states and energies of an infinite square well and distinguish an energy eigenstate from a superposition.',
  keywords:'infinite square well particle in a box boundary conditions quantisation eigenfunction energy discrete stationary superposition',
  src:'L5 · infinite square well', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'The Infinite Square Well'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figWell(),
      caption:'The first three standing waves, each drawn at its energy level. The levels rise as $n^{2}$, not in equal steps.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'There is no $n=0$ state', html:'The sine with $n=0$ is the zero function, which cannot be normalised. The ground state is $n=1$, and its energy is not zero.'}]},
  ], right:[
    {t:'eq', key:true, label:'Standing waves', tex:'\\phi_{n}(x)=\\sqrt{\\frac{2}{a}}\\sin\\!\\left(\\frac{n\\pi x}{a}\\right), \\qquad n=1,2,\\ldots',
      note:'Inside $0<x<a$ the free equation holds, and the wavefunction must vanish at both walls. Only $k_{n}=n\\pi/a$ fits.'},
    {t:'eq', tex:'E_{n}=\\frac{\\hbar^{2}\\pi^{2}n^{2}}{2ma^{2}}'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} E_{2}/E_{1} &= 2^{2}/1^{2} = 4 \\\\ E_{2}-E_{1} &= 3E_{1} \\end{aligned}',
        note:'An equal mix of $\\phi_{1}$ and $\\phi_{2}$ beats with period $2\\pi\\hbar/(3E_{1})$. Either state alone has a density that never moves.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same well.<div class="nsep"></div>What is $E_{3}/E_{1}$?',
        ask:{key:'m2-well', choices:['$3$','$9$','$6$'], answer:1,
          why:'The energies grow as $n^{2}$, and $3^{2}=9$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.5 -- */
{ id:'m2-gate', module:'M2', nav:'Gates as Hamiltonian Evolution', title:'Gates as Hamiltonian Evolution',
  objective:'Read a driven-qubit Hamiltonian as a rotation axis and an angle, and identify what each control sets.',
  keywords:'driven qubit rabi drive strength detuning rotation axis pulse area gate calibration resonance',
  src:'L5 · driven qubit: Hamiltonians become gates', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Gates as Hamiltonian Evolution'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figDrive(),
      caption:'The rotation axis for four detunings at fixed drive strength. On resonance it lies in the equator; far detuned it points almost along $z$ and the drive barely moves the state.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Where a gate error comes from', html:'A pulse a few per cent too long turns a few per cent too far, the same way every time. This coherent error adds up over a circuit instead of averaging away.'}]},
  ], right:[
    {t:'eq', key:true, label:'Driven qubit', tex:'H = \\tfrac12\\left(\\Omega_{x}X + \\Omega_{y}Y + \\Delta Z\\right) = \\tfrac{\\Omega}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma',
      note:'Here $\\Omega=\\sqrt{\\Omega_{x}^{2}+\\Omega_{y}^{2}+\\Delta^{2}}$ and $\\mathbf{n}$ is the unit vector along $(\\Omega_{x},\\Omega_{y},\\Delta)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'The gate', tex:'U(t) = \\cos\\!\\left(\\tfrac{\\Omega t}{2}\\right) I \\;-\\; i\\sin\\!\\left(\\tfrac{\\Omega t}{2}\\right)\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma',
        note:'The closed form of Chapter 1. The <b>pulse area</b> $\\Omega t$ sets the angle, the drive phase picks $X$ or $Y$, and the <b>detuning</b> $\\Delta$ tilts the axis toward $z$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A resonant pulse ($\\Delta=0$, $\\Omega_{y}=0$) with pulse area $\\Omega t=\\pi/2$ acts on $|0\\rangle$.<div class="nsep"></div>What is $P(1)$ afterwards?',
        ask:{key:'m2-gate', choices:['$\\tfrac12$','$1$','$\\tfrac14$'], answer:0,
          why:'$U=\\cos(\\pi/4)I-i\\sin(\\pi/4)X$, so $P(1)=\\sin^{2}(\\pi/4)=\\tfrac12$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 2.L2 --- */
{ id:'m2-lab-d', module:'M2', nav:'Laboratory D \u2014 Driving a Qubit', title:'Laboratory D \u2014 Driving a Qubit',
  objective:'Let the reader move the drive strength and the detuning and watch the population follow.',
  keywords:'laboratory rabi oscillation drive strength detuning population resonance pulse area pi pulse',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Laboratory D \u2014 Driving a Qubit'},
  {t:'small', html:'The qubit starts in $|0\\rangle$ under $H=\\tfrac12(\\Omega_{x}X+\\Delta Z)$. The left panel is the population of $|1\\rangle$ against time, with the elapsed time marked; the right one is the largest population the drive can ever reach, against the detuning. The transport runs the clock forward. Find the pulse length that flips the qubit, then detune and watch that pulse stop working.'},
  {t:'lab', id:'D'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m2-code-dynamics', module:'M2', nav:'Dynamics in Code', title:'Dynamics in Code',
  objective:'Evolve a state under a Hamiltonian, shift the energy by a constant, and drive a qubit with a pulse.',
  keywords:'code qiskit numpy program evolution hamiltonian unitary exponential rabi pulse detuning run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Dynamics in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-dynamics')}
]},

/* ---------------------------------------------------------------- 2.7.1 -- */
{ id:'m2-shots', module:'M2', nav:'Finite Shots and Estimation', title:'Finite Shots and Estimation',
  objective:'Give the standard error of a probability estimated from N shots and say what it is not.',
  keywords:'shots binomial standard error sampling noise estimate histogram confidence square root scaling',
  src:'L5 · finite-shot estimation', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 2 · Finite shots'},
  {t:'title', text:'Finite Shots and Estimation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShots(),
      caption:'The standard error against the shot count, on decade axes. Both lines drop half a decade for every decade of shots: that is the square root.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Sampling is not noise', html:'Sampling error shrinks as $1/\\sqrt{N}$, even on a perfect device. Gate and readout errors are <b>systematic</b>: more shots make a wrong number more precise, not more right.'}]},
  ], right:[
    {t:'eq', key:true, label:'Standard error', tex:'K \\sim \\mathrm{Binomial}(N,p), \\qquad \\mathrm{SE}\\!\\left(\\tfrac{K}{N}\\right) = \\sqrt{\\frac{p(1-p)}{N}}',
      note:'Run $N$ shots and count $K$. The worst case is $p=\\tfrac12$, where $\\mathrm{SE}=1/(2\\sqrt{N})$: one more decimal place costs a hundred times the shots.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\mathrm{SE} = \\sqrt{0.25/1000} = 0.0158',
        note:'For $p$ near $\\tfrac12$ and $N=1000$. Two runs that differ by $0.02$ have not disagreed about anything.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N=10\\,000$ shots of a circuit with $p=\\tfrac12$.<div class="nsep"></div>What is the standard error of $K/N$?',
        ask:{key:'m2-shots', choices:['$0.005$','$0.05$','$0.0005$'], answer:0,
          why:'$\\sqrt{0.25/10\\,000}=0.5/100=0.005$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m2-code-shots', module:'M2', nav:'Finite Shots in Code', title:'Finite Shots in Code',
  objective:'Compute a standard error, the shots a precision needs, and the exact chance that an estimate lands near the truth.',
  keywords:'code qiskit numpy program shots standard error binomial precision estimate run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 2 · Finite shots'},
  {t:'title', text:'Finite Shots in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-shots')}
]},

/* ---------------------------------------------------------------- 2.7.1 -- */
{ id:'m2-quick', module:'M2', nav:'Quick Check', title:'Quick Check',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict born rule measurement collapse expectation variance commutator pauli algebra shots',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Quick check'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Born rule', html:'$|\\psi\\rangle=\\tfrac{1}{\\sqrt5}(|0\\rangle+2i|1\\rangle)$. Find $p(1)$.',
      ask:{key:'m2-qc0', choices:['$\\tfrac15$','$\\tfrac45$','$-\\tfrac45$'], answer:1,
        why:'$|2i/\\sqrt5|^{2}=4/5$.'}}],
    [{t:'note', kind:'def', head:'Measurement basis', html:'$|1\\rangle$ measured in $X$. Find $p(-)$.',
      ask:{key:'m2-qc1', choices:['$0$','$\\tfrac12$','$1$'], answer:1,
        why:'$\\langle -|1\\rangle=-1/\\sqrt2$.'}}],
    [{t:'note', kind:'def', head:'Repeated measurement', html:'$Z$ on $|+\\rangle$ gives $-1$, then $Z$ again. Find $p(-1)$.',
      ask:{key:'m2-qc2', choices:['$\\tfrac12$','$1$','$0$'], answer:1,
        why:'Collapse to $|1\\rangle$.'}}],
    [{t:'note', kind:'def', head:'Expectation value', html:'$Z$ on $|1\\rangle$. Find $\\langle Z\\rangle$.',
      ask:{key:'m2-qc3', choices:['$1$','$0$','$-1$'], answer:2,
        why:'$|1\\rangle$ has eigenvalue $-1$.'}}],
    [{t:'note', kind:'def', head:'Sharp observable', html:'$Z$ on the eigenstate $|0\\rangle$. Find $\\operatorname{Var}(Z)$.',
      ask:{key:'m2-qc4', choices:['$0$','$\\tfrac12$','$1$'], answer:0,
        why:'Zero spread on an eigenstate.'}}],
    [{t:'note', kind:'def', head:'Commutator', html:'$XY=iZ$, $YX=-iZ$. Find $[X,Y]$.',
      ask:{key:'m2-qc5', choices:['$0$','$2iZ$','$iZ$'], answer:1,
        why:'$iZ-(-iZ)=2iZ$.'}}],
    [{t:'note', kind:'def', head:'Pauli algebra', html:'Find the product $YZ$.',
      ask:{key:'m2-qc6', choices:['$iX$','$-iX$','$X$'], answer:0,
        why:'Cyclic order $Y\\to Z\\to X$.'}}],
    [{t:'note', kind:'def', head:'Spin along z', html:'$\\mathbf{n}=(0,0,1)$, state $|+\\rangle$. Find $p(+)$.',
      ask:{key:'m2-qc7', choices:['$1$','$\\tfrac12$','$0$'], answer:1,
        why:'$\\mathbf{n}\\cdot\\mathbf{r}=0$.'}}],
    [{t:'note', kind:'def', head:'Beat frequency', html:'$E_{1}=1$, $E_{2}=6$, $\\hbar=1$. Find the beat rate.',
      ask:{key:'m2-qc8', choices:['$5$','$6$','$7$'], answer:0,
        why:'Only $E_{2}-E_{1}$ shows.'}}],
    [{t:'note', kind:'def', head:'Infinite well', html:'The square well. Find $E_{4}/E_{1}$.',
      ask:{key:'m2-qc9', choices:['$4$','$8$','$16$'], answer:2,
        why:'Energies grow as $n^{2}$.'}}],
    [{t:'note', kind:'def', head:'Shot noise', html:'$N=2500$, $p=\\tfrac12$. Find the standard error.',
      ask:{key:'m2-qc10', choices:['$0.01$','$0.1$','$0.001$'], answer:0,
        why:'$\\sqrt{0.25/2500}$.'}}],
    [{t:'note', kind:'def', head:'Resonant pulse', html:'Pulse area $\\Omega t=\\pi$ on $|0\\rangle$. Find $P(1)$.',
      ask:{key:'m2-qc11', choices:['$0$','$\\tfrac12$','$1$'], answer:2,
        why:'A full $\\pi$ pulse flips it.'}}]
  ]}
]},

/* ---------------------------------------------------------------- 2.8.1 -- */
{ id:'m2-synth', module:'M2', nav:'Summary', title:'Summary',
  objective:'Collect the two postulates this chapter added and the four errors it exists to prevent.',
  keywords:'summary module 2 review born rule projective measurement expectation commutator evolution shots',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Summary'},
  {t:'title', text:'Summary'},
  {t:'fig', frame:true, svg:()=>figLoop(),
    caption:'One run of a quantum computer, and where each part of this chapter sits in it. Everything in chapters 4, 5 and 6 is a way of choosing the middle two boxes so that the last one returns something useful.'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'Reading out', items:[
      {t:'small', html:'$p(a)=\\langle\\psi|P_{a}|\\psi\\rangle$, with orthogonal projectors that add to the identity. The outcomes are the eigenvalues. Afterwards the state is $P_{a}|\\psi\\rangle$, put back to length one.'}]}],
    [{t:'card', head:'Averages', items:[
      {t:'small', html:'$\\langle A\\rangle=\\langle\\psi|A|\\psi\\rangle$ is a mean over repetitions, usually not a possible reading. $\\operatorname{Var}(A)=\\langle A^{2}\\rangle-\\langle A\\rangle^{2}$, and it vanishes exactly on the eigenstates.'}]}],
    [{t:'card', head:'Compatibility', items:[
      {t:'small', html:'$[A,B]=0$ exactly when the two can both be sharp. Otherwise $\\Delta A\\,\\Delta B\\ge\\tfrac12|\\langle[A,B]\\rangle|$ — a statement about two distributions, not about a clumsy instrument.'}]}],
    [{t:'card', head:'Evolution', items:[
      {t:'small', html:'$U(t)=e^{-iHt}$, unitary because $H$ is Hermitian. An energy eigenstate is stationary; two of them beat at their difference. A gate is a Hamiltonian run for a chosen time.'}]}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:2, gap:'24px', items:[
      [{t:'note', kind:'ok', head:'Six lines to be able to write without looking', html:'$p(n)=|\\langle n|\\psi\\rangle|^{2}$ &nbsp;·&nbsp; $|\\psi_{a}\\rangle=P_{a}|\\psi\\rangle/\\sqrt{p(a)}$ &nbsp;·&nbsp; $\\langle A\\rangle=\\langle\\psi|A|\\psi\\rangle$ &nbsp;·&nbsp; $\\sigma_{i}\\sigma_{j}=\\delta_{ij}I+i\\varepsilon_{ijk}\\sigma_{k}$ &nbsp;·&nbsp; $U(t)=e^{-iHt}$ &nbsp;·&nbsp; $\\mathrm{SE}=\\sqrt{p(1-p)/N}$.'}],
      [{t:'note', kind:'warn', head:'Four errors that cost a whole question', html:'Squaring an amplitude instead of its modulus. Reporting an expectation value as though an instrument could return it. Reading the uncertainty relation as a statement about disturbing the system. And treating a histogram of counts as the distribution rather than as an estimate of it.'}]
    ]}
  ]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'def', head:'What comes next', html:'Everything here assumed the system is alone and its state is a single vector. Chapter 3 drops both: a system that is one half of a larger one has no vector of its own, and describing it needs the density operator. That is also where a measurement whose result was thrown away finally gets a proper description.'}
  ]}
]},

/* ---------------------------------------------------------------- 2.8.2 -- */
{ id:'m2-shapes', module:'M2', nav:'Question Types', title:'Question Types',
  objective:'Name the recurring question types of chapter 2 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice born projective expectation commutator evolution shots',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 2 · Summary and practice'},
  {t:'title', text:'Question Types'},
  {t:'small', html:'Six shapes keep coming back, and a seventh — a <b>full-length question</b> — puts three to five of them in one statement, usually as one experiment worked from preparation to reported number. Name the shape before starting; the method for each is fixed.'},
  {t:'grid', cols:3, gap:'22px', items:[
    [{t:'drilltypes', module:'M2', from:0, to:2}],
    [{t:'drilltypes', module:'M2', from:2, to:4}],
    [{t:'drilltypes', module:'M2', from:4, to:6}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'The check that catches most of it', html:'Probabilities add to one, a variance is never negative, an expectation value of a $\\pm1$ observable lies in $[-1,1]$, and a Hermitian operator has real eigenvalues. Four one-line tests, and between them they catch nearly every arithmetic slip this chapter can produce.'}
  ]}
]}

];

window.SCENES_M2 = SC;
})();
