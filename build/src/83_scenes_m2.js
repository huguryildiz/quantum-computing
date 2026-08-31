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
  return P.blocks({w:700,h:206,items:[
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
  const a = P.Axes({w:560,h:250,xr:[-0.7,5.8],yr:[0,1.12],
    ylabel:'\\text{probability}', pad:{l:60,r:24,t:26,b:56},
    xticksOverride:[], ytarget:4});
  const bar=(n,v,f,l)=>{ a.rect(n-0.26,0,n+0.26,v,{fill:f});
    a.poly([[n-0.26,v],[n+0.26,v]],{color:l,width:2.4}); };
  bar(0,(1+rz)/2,C.dec.in,C.in);   bar(1,(1-rz)/2,C.dec.in,C.in);
  bar(2,(1+rx)/2,C.dec.mid,C.mid); bar(3,(1-rx)/2,C.dec.mid,C.mid);
  bar(4,(1+ry)/2,C.dec.out,C.out); bar(5,(1-ry)/2,C.dec.out,C.out);
  [['0',0],['1',1]].forEach(([t,k])=>a.note(k,0,t,{fs:12.5,color:C.muted,anchor:'middle',dy:26}));
  [['+',2],['-',3]].forEach(([t,k])=>a.note(k,0,t,{fs:12.5,color:C.muted,anchor:'middle',dy:26}));
  a.note(4,0,'+i',{fs:12.5,color:C.muted,anchor:'middle',dy:26});
  a.note(5,0,'-i',{fs:12.5,color:C.muted,anchor:'middle',dy:26});
  a.note(0.5,0,'Z',{fs:14,color:C.in,anchor:'middle',dy:48,tex:true});
  a.note(2.5,0,'X',{fs:14,color:C.mid,anchor:'middle',dy:48,tex:true});
  a.note(4.5,0,'Y',{fs:14,color:C.out,anchor:'middle',dy:48,tex:true});
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
  return P.blocks({w:700,h:170,items:[
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
  return P.blocks({w:740,h:200,items:[
    {t:'line',d:'M30,80 h660'},
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
  a.note(1.95,0.36,'\\tfrac12|\\langle[X,Z]\\rangle|',{fs:13,color:C.err,tex:true});
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
    a.note(x,y,t,{fs:15,color:C.plate,anchor:'middle',dy:6,tex:true}); });
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
    xlabel:'\\omega t', ylabel:'P(0)',
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

const SC = [

/* ---------------------------------------------------------------- 2.0.1 -- */
{ id:'m2-open', module:'M2', nav:'What a postulate says', title:'Four postulates, and the two this chapter is about',
  objective:'Name the four postulates and say which parts of the course each one licenses.',
  keywords:'postulates state evolution measurement composition overview module 2 quantum mechanics',
  src:'L4 · quantum-mechanical state and measurement principles', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · States, measurement and dynamics'},
  {t:'title', text:'Four postulates, and the two this chapter is about'},
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
{ id:'m2-born', module:'M2', nav:'The Born rule', title:'The Born rule: from an amplitude to a count',
  objective:'State the Born rule and check that the probabilities it gives add to one.',
  keywords:'born rule probability amplitude squared modulus outcome basis completeness shot',
  src:'L4 · Born rule', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'The Born rule: from an amplitude to a count'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>An amplitude is not observable. The rule that turns one into something a laboratory can count is the only bridge in the subject between the mathematics and an experiment, and it is one line. Measure in an orthonormal basis $\\{|n\\rangle\\}$; the probability of outcome $n$ is</p>'},
    {t:'eq', key:true, tex:'p(n) = \\left|\\langle n|\\psi\\rangle\\right|^{2}'},
    {t:'body', html:'<p>The numbers $c_{n}=\\langle n|\\psi\\rangle$ are the coefficients of chapter 1, now given a name: <b>probability amplitudes</b>. Nothing new has to be assumed about them, and the fact that the probabilities add to one is a theorem rather than a second postulate.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Insert the resolution of the identity into $\\langle\\psi|\\psi\\rangle=1$ and read the sum:</p>'},
      {t:'eq', tex:'1 = \\langle\\psi|\\psi\\rangle = \\sum_{n}\\langle\\psi|n\\rangle\\langle n|\\psi\\rangle = \\sum_{n}\\left|c_{n}\\right|^{2} = \\sum_{n} p(n)'},
      {t:'small', html:'That is the move of chapter 1, used for the first time to prove something physical. Normalisation was the bookkeeping; here is what it was bookkeeping for.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShot(),
      caption:'One shot. The circuit is run, the instrument reports one outcome, and the amplitudes decide nothing except how often each outcome comes back. A single run tells you almost nothing; the distribution is what the amplitudes are about.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\psi\\rangle=\\tfrac{1}{5}\\left(3|0\\rangle+4i|1\\rangle\\right)$, measured in the computational basis.'],
        ['Work', '$c_{0}=\\tfrac35$ and $c_{1}=\\tfrac{4i}{5}$, so $p(0)=\\tfrac{9}{25}$ and $p(1)=\\tfrac{16}{25}$.'],
        ['Answer', '$0.36$ and $0.64$.'],
        ['Check', 'They add to one, and the $i$ made no difference at all: it is a phase on one amplitude, and this basis cannot see it.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The mistake this scene exists to stop', html:'$p(n)$ is $|c_{n}|^{2}$ and never $c_{n}^{2}$. For $c_{1}=4i/5$ the square is $-16/25$, a negative probability, and the modulus is what stops that. Squaring the coefficient instead of its modulus is the single most common first error in this subject.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.1.2 -- */
{ id:'m2-bases', module:'M2', nav:'Choosing a basis is choosing an experiment', title:'A measurement basis is an experiment, not a coordinate system',
  objective:'Separate a passive change of coordinates from the choice of what to measure.',
  keywords:'measurement basis Z X Y eigenbasis passive change of coordinates different experiment pauli',
  src:'L4 · three standard qubit bases', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'A measurement basis is an experiment, not a coordinate system'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Two things in this course are both called "changing the basis" and they are not the same thing at all.</p>'},
    {t:'body', html:'<p>A <b>passive change of coordinates</b> rewrites the same state and the same operator in a different orthonormal basis. Every physical prediction is unchanged, because an inner product does not care which basis it is computed in. Chapter 1 ended on exactly this.</p>'},
    {t:'eq', tex:'|\\psi\\rangle^{\\prime}=V^{\\dagger}|\\psi\\rangle, \\qquad A^{\\prime}=V^{\\dagger}AV, \\qquad \\langle\\psi|A|\\psi\\rangle=\\langle\\psi^{\\prime}|A^{\\prime}|\\psi^{\\prime}\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>An <b>active transformation</b> instead changes the state while the coordinates and observable stay fixed: $|\\psi\\rangle\\mapsto U|\\psi\\rangle$. Its probabilities generally change. <b>Choosing what to measure</b> is different again: an instrument with $X$ eigenstates is not the instrument with $Z$ eigenstates.</p>'},
      {t:'eq', tex:'\\{|0\\rangle,|1\\rangle\\}, \\qquad \\{|+\\rangle,|-\\rangle\\}, \\qquad \\{|{+}i\\rangle,|{-}i\\rangle\\}'},
      {t:'small', html:'They are the eigenbases of $Z$, $X$ and $Y$, which is why the three measurements are usually named after those operators rather than after their outcomes.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figThreeBases(),
      caption:'One state, read by three different instruments. The bars are computed from the state itself, so the three groups are three genuine predictions and not three drawings. Nothing about the state changed between them.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Three operations, three questions', html:'Passive: did only the numbers used to describe the same objects change? Active: did a gate or physical evolution move the state? Measurement choice: did the apparatus select a different set of projectors? Only the first must leave every prediction unchanged.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'And why it matters in practice', html:'Real hardware measures in one basis only, almost always the computational one. Measuring $X$ means applying a gate that rotates the $X$ eigenstates onto the computational ones and then measuring as usual. So a change of measurement basis costs a gate, and that gate has an error; a scheme that needs many bases pays for each of them.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.1.3 -- */
{ id:'m2-distinguish', module:'M2', nav:'Telling two states apart', title:'When two states can be told apart, and when they cannot',
  objective:'Show that one measurement separates two states with certainty exactly when they are orthogonal.',
  keywords:'distinguishing states orthogonal certainty overlap single shot no cloning discrimination',
  src:'L4 · projectors and measurement geometry', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'When two states can be told apart, and when they cannot'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 1 said that an overlap of zero means the two states are perfectly distinguishable and promised the argument here. It is short.</p>'},
    {t:'body', html:'<p>Suppose $\\langle a|b\\rangle=0$. Measure with the two projectors $P_{a}=|a\\rangle\\langle a|$ and $I-P_{a}$. On $|a\\rangle$ the first outcome has probability $\\langle a|P_{a}|a\\rangle=1$; on $|b\\rangle$ it has probability $\\left|\\langle a|b\\rangle\\right|^{2}=0$. One shot, and the answer is certain.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Now suppose they are not orthogonal, and let $\\theta$ be the angle between them, $\\left|\\langle a|b\\rangle\\right|=\\cos\\theta$ with $\\theta<\\pi/2$. Whatever outcome the instrument reports, both states could have produced it: every projector that gives outcome one with certainty on $|a\\rangle$ gives it with probability at least $\\cos^{2}\\theta$ on $|b\\rangle$.</p>'},
      {t:'eq', key:true, tex:'\\text{certain in one shot} \\iff \\langle a|b\\rangle = 0'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDistinguish(),
      caption:'Two states, and the angle between them. Only when that angle is a right angle does a single measurement separate them with certainty. Every smaller angle leaves an outcome that both states can produce.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What can still be done', html:'A guess can still be better than a coin. With the best measurement the probability of guessing right is $\\tfrac12\\left(1+\\sin\\theta\\right)$, which is one half when the states coincide and one when they are orthogonal. Repeating the measurement does not help if only one copy exists, and copying is not available: chapter 5 shows why.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Where students overreach', html:'"Non-orthogonal states cannot be distinguished" is too strong, and "they can be distinguished with enough shots" is too strong in the other direction. The correct statement names the resource: with <b>one copy</b> the error cannot be driven to zero; with <b>many identically prepared copies</b> it can, because the estimate of a probability improves with the shot count.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.L1 --- */
{ id:'m2-lab-c', module:'M2', nav:'Laboratory C', title:'Laboratory C · Exact probability against a finite sample',
  objective:'Let the reader set a state, a measurement basis and a shot count, and read the exact answer beside the sampled one.',
  keywords:'laboratory measurement basis shots histogram exact probability sampling error wilson interval',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · The Born rule'},
  {t:'title', text:'Laboratory C · Exact probability against a finite sample'},
  {t:'small', html:'The state is $\\cos(\\theta/2)|0\\rangle+e^{i\\varphi}\\sin(\\theta/2)|1\\rangle$ and the instrument measures along $Z$, $X$ or $Y$. The left panel puts the exact Born probabilities beside the frequencies of a simulated run; the right one follows the estimate as the shots accumulate, inside the band the sampling error allows. Nothing here is noisy hardware: the device is perfect and the spread is the counting alone.'},
  {t:'lab', id:'C'}
]},

/* ---------------------------------------------------------------- 2.2.1 -- */
{ id:'m2-proj', module:'M2', nav:'Projective measurement', title:'Projective measurement, and what a degenerate outcome is',
  objective:'Write a measurement as a set of orthogonal projectors and compute an outcome probability from them.',
  keywords:'projective measurement projectors orthogonal complete degenerate eigenspace born probability rank',
  src:'L5 · projective measurement', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Projective measurement'},
  {t:'title', text:'Projective measurement, and what a degenerate outcome is'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The Born rule was written for an orthonormal basis. The general form replaces the basis vectors by the projectors of the spectral decomposition of chapter 1, and it says the same thing where both apply:</p>'},
    {t:'eq', key:true, tex:'p(a) = \\langle\\psi|P_{a}|\\psi\\rangle, \\qquad P_{j}P_{k}=\\delta_{jk}P_{k}, \\qquad \\sum_{a}P_{a}=I'},
    {t:'body', html:'<p>The two conditions on the projectors are not decoration. Orthogonality is what makes the outcomes exclusive, and completeness is what makes the probabilities add to one. Drop either and the numbers stop being a distribution.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'When every $P_{a}$ has rank one this reduces to $p(a)=\\left|\\langle a|\\psi\\rangle\\right|^{2}$ and nothing has been generalised. The new case is a projector of higher rank, which happens when an eigenvalue is repeated.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figObservable(),
      caption:'An observable, taken apart. The eigenvalues are the numbers the instrument can report and the projectors decide how often each one is reported. Both come from the same spectral decomposition, and neither is a choice.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'A degenerate outcome', html:'If two eigenvectors share an eigenvalue, the instrument cannot tell them apart: the outcome is the number, not the vector. Its projector is the sum of the rank-one projectors of that eigenspace, and its probability is the total weight the state has there. On one qubit no observable can be degenerate unless it is a multiple of the identity, so this first matters in chapter 3.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The outcomes are the eigenvalues, not the eigenvectors', html:'An instrument reports a number. "The outcome was $|+\\rangle$" is loose talk for "the outcome was the eigenvalue $+1$ of $X$, and the state afterwards is $|+\\rangle$" — two different things, and the next scene is about the second one.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.2.2 -- */
{ id:'m2-collapse', module:'M2', nav:'The state afterwards', title:'What the state is after a reading has been taken',
  objective:'Apply the projection update rule and show that an immediate repeat gives the same answer.',
  keywords:'state update luders rule collapse conditioning renormalise repeatable measurement disturbance',
  src:'L5 · projective measurement', steps:4, blocks:[
  {t:'eyebrow', text:'Module 2 · Projective measurement'},
  {t:'title', text:'What the state is after a reading has been taken'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A measurement does not only produce a number; it changes the state. Given the outcome $a$, the state afterwards is the projected state, put back to length one:</p>'},
    {t:'eq', key:true, tex:'|\\psi_{a}\\rangle = \\frac{P_{a}|\\psi\\rangle}{\\sqrt{p(a)}}'},
    {t:'body', html:'<p>The division is the renormalisation chapter 1 deliberately did not do: a projector shortens a state, and the length it removes is exactly the probability of the other outcomes. Once the outcome is known, those are gone.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Measure the same observable again immediately. The state is now in the eigenspace of $a$, so $P_{a}|\\psi_{a}\\rangle=|\\psi_{a}\\rangle$ and</p>'},
      {t:'eq', tex:'p(a\\text{ again}) = \\langle\\psi_{a}|P_{a}|\\psi_{a}\\rangle = 1'},
      {t:'small', html:'The same reading comes back with certainty. That is what makes the reading mean something, and it is the property the word <b>projective</b> is naming.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\psi\\rangle=\\tfrac{1}{\\sqrt5}\\left(|0\\rangle+2|1\\rangle\\right)$, measured in the computational basis.'],
        ['Work', '$p(0)=\\tfrac15$ and $p(1)=\\tfrac45$. For the outcome $0$, $P_{0}|\\psi\\rangle=\\tfrac{1}{\\sqrt5}|0\\rangle$.'],
        ['Answer', 'Dividing by $\\sqrt{p(0)}=1/\\sqrt5$ gives $|\\psi_{0}\\rangle=|0\\rangle$ exactly.'],
        ['Check', 'The outcome $1$ gives $|\\psi_{1}\\rangle=|1\\rangle$ the same way. In a rank-one measurement the state afterwards does not depend on what it was before — only on which outcome came back.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Measure something else in between and the first answer is gone', html:'Measure $Z$ on $|0\\rangle$: the answer is $0$. Measure $X$: the state becomes $|+\\rangle$ or $|-\\rangle$, each half the time. Measure $Z$ again: now each answer comes back half the time. The first reading was true when it was taken and the second measurement destroyed the state it described. No noise was added anywhere in that story.'}
    ]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'def', head:'If the result is thrown away', html:'A measurement whose outcome nobody records still changes the state: the coherence between the outcome subspaces is gone even though no number was written down. Saying that properly needs the density operator, which is chapter 3. It is worth knowing now that "measured and ignored" and "not measured" are different situations.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.2.3 -- */
{ id:'m2-povm', module:'M2', nav:'When the reading is imperfect', title:'The general measurement, and what a readout error looks like',
  objective:'Use effects for outcome probabilities, an instrument for the conditional state, and a POVM to model imperfect readout.',
  keywords:'povm effects positive operators readout error assignment fidelity calibration matrix instrument',
  src:'L5 · general measurements: POVMs and instruments', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Projective measurement'},
  {t:'title', text:'The general measurement, and what a readout error looks like'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A projective measurement is not the most general one an apparatus can perform. The general form keeps only what is needed for the probabilities to be a distribution: a set of positive operators, called <b>effects</b>, that add to the identity.</p>'},
    {t:'eq', key:true, tex:'E_{m}\\succeq 0, \\qquad \\sum_{m} E_{m} = I, \\qquad p(m) = \\langle\\psi|E_{m}|\\psi\\rangle'},
    {t:'body', html:'<p>Projectors are the special case $E_{m}=P_{m}$. Effects need not be orthogonal to each other and there need not be as many of them as the space has dimensions, and both of those freedoms are used in practice.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The everyday example is a readout that sometimes reports the wrong bit. With a symmetric error rate $\\epsilon$,</p>'},
      {t:'eq', tex:'\\begin{aligned} E_{0} &= (1-\\epsilon)\\,|0\\rangle\\langle 0| + \\epsilon\\,|1\\rangle\\langle 1| \\\\ E_{1} &= \\epsilon\\,|0\\rangle\\langle 0| + (1-\\epsilon)\\,|1\\rangle\\langle 1| \\end{aligned}'},
      {t:'small', html:'They are positive and they add to the identity, so they are a legal measurement. They are not projectors: $E_{0}^{2}\\ne E_{0}$ unless $\\epsilon$ is $0$ or $1$.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A state with true $p(0)=q$, read out with symmetric error $\\epsilon$.'],
        ['Work', 'The reported probability is $\\langle\\psi|E_{0}|\\psi\\rangle=(1-\\epsilon)q+\\epsilon(1-q)$.'],
        ['Answer', '$p_{\\text{reported}}(0) = \\epsilon + (1-2\\epsilon)\\,q$: a straight line in $q$, of slope $1-2\\epsilon$.'],
        ['Check', 'At $\\epsilon=0$ it is $q$. At $\\epsilon=\\tfrac12$ it is $\\tfrac12$ whatever $q$ is, and the instrument has stopped reporting anything about the state.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Inverting the calibration is not free', html:'The line above can be inverted to recover $q$ from the reported frequency, and that is what readout-error mitigation does. Dividing by $1-2\\epsilon$ removes the bias and multiplies the statistical error by the same factor, so a badly calibrated readout turns a small sampling error into a large one. The correction is exact in expectation and noisier in practice, and a report that gives the corrected number without the widened error bar is not reporting the measurement it made.'}
    ]},
    {t:'note', kind:'def', head:'Effects do not fix the state afterwards', html:'A set of effects fixes the outcome probabilities but not the conditional state. A measurement <b>instrument</b> supplies operators $M_{m\\alpha}$ with $E_m=\\sum_\\alpha M_{m\\alpha}^{\\dagger}M_{m\\alpha}$ and $\\rho_m=\\sum_\\alpha M_{m\\alpha}\\rho M_{m\\alpha}^{\\dagger}/p(m)$. Different instruments can have the same effects and disturb the state differently. For a projective measurement, $M_m=P_m$.'}
  ]}
]},

/* ---------------------------------------------------------------- 2.3.1 -- */
{ id:'m2-obs', module:'M2', nav:'Expectation values', title:'The expectation value, and why it is often not an outcome',
  objective:'Compute an expectation value two ways and say what it is an average over.',
  keywords:'observable expectation value ensemble average hermitian eigenvalue mean not an outcome',
  src:'L5 · expectation values and variance', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Observables'},
  {t:'title', text:'The expectation value, and why it is often not an outcome'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>An observable is a Hermitian operator, its eigenvalues are the numbers an instrument can report, and its projectors say how often. The average of many readings has a name and a one-line formula:</p>'},
    {t:'eq', key:true, tex:'\\langle A\\rangle = \\langle\\psi|A|\\psi\\rangle'},
    {t:'body', html:'<p>That it agrees with the average is a calculation rather than a definition. Expand $A$ spectrally and use the Born rule on each term:</p>'},
    {t:'eq', tex:'\\langle\\psi|A|\\psi\\rangle = \\sum_{a} a\\,\\langle\\psi|P_{a}|\\psi\\rangle = \\sum_{a} a\\,p(a)'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'So the sandwich is the mean of the outcomes weighted by their probabilities, which is what an average is. It is also real, because $A$ is Hermitian, and that was the point of insisting on Hermiticity in chapter 1.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figExpectation(),
      caption:'A qubit observable with outcomes $-1$ and $+1$, and the mean of many readings. The instrument returns one of the two stems and never the dashed line; the dashed line is where the stems balance.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$A=Z$ and $|\\psi\\rangle=\\tfrac{1}{\\sqrt5}\\left(2|0\\rangle+|1\\rangle\\right)$.'],
        ['Method', 'Either sandwich the matrix, or weight the eigenvalues by their probabilities.'],
        ['Work', '$p(+1)=\\tfrac45$ and $p(-1)=\\tfrac15$, so $\\langle Z\\rangle=\\tfrac45-\\tfrac15=\\tfrac35$.'],
        ['Check', 'The matrix route: $Z|\\psi\\rangle=\\tfrac{1}{\\sqrt5}(2,-1)$, and $\\langle\\psi|Z|\\psi\\rangle=\\tfrac15(4-1)=\\tfrac35$. Same number, different road.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'An expectation value is not a reading', html:'The instrument in the worked example returns $+1$ or $-1$. It never returns $0.6$, and no single shot ever will. $\\langle Z\\rangle=0.6$ is a statement about a long run of identically prepared systems, and reporting it without the shot count and the error bar is reporting a number nobody measured.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.3.2 -- */
{ id:'m2-var', module:'M2', nav:'Spread', title:'Variance, and the states on which an observable is sharp',
  objective:'Compute a variance and identify the states for which it vanishes.',
  keywords:'variance standard deviation spread sharp eigenstate certainty delta A observable',
  src:'L5 · expectation values and variance', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Observables'},
  {t:'title', text:'Variance, and the states on which an observable is sharp'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The mean says where the readings sit; the variance says how far they scatter. Both are computed from the same sandwich:</p>'},
    {t:'eq', key:true, tex:'\\operatorname{Var}(A) = \\langle A^{2}\\rangle - \\langle A\\rangle^{2}, \\qquad \\Delta A = \\sqrt{\\operatorname{Var}(A)}'},
    {t:'body', html:'<p>Note which operator is squared where. $\\langle A^{2}\\rangle$ is $\\langle\\psi|A^{2}|\\psi\\rangle$, with the matrix squared before the sandwich; $\\langle A\\rangle^{2}$ squares the number afterwards. The two are different, and their difference is the whole quantity.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The vanishing case is worth stating on its own. $\\Delta A=0$ exactly when the state lies inside a single eigenspace of $A$:</p>'},
      {t:'eq', tex:'\\Delta A = 0 \\iff A|\\psi\\rangle = a|\\psi\\rangle \\;\\text{ for some } a'},
      {t:'small', html:'Then every ideal measurement returns $a$ and the reading is <b>sharp</b>. Any other state gives a genuine spread, and that spread is a property of the state and the observable together rather than of the instrument.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figVariance(),
      caption:'The mean and the spread of $Z$ over the family $\\cos(\\theta/2)|0\\rangle+\\sin(\\theta/2)|1\\rangle$. At the two ends the state is an eigenstate: the spread is zero and the mean is the eigenvalue. In between the mean is a number the instrument never returns.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$A=Z$ on $|+\\rangle$.'],
        ['Work', '$\\langle Z\\rangle=0$ by symmetry, and $Z^{2}=I$ so $\\langle Z^{2}\\rangle=1$.'],
        ['Answer', '$\\operatorname{Var}(Z)=1-0=1$, so $\\Delta Z=1$.'],
        ['Check', 'The outcomes are $\\pm1$, each half the time, so the readings are as far from their mean as they can be. A spread of one is the largest a $\\pm1$ observable can have.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'$Z^{2}=I$ is doing real work', html:'Every Pauli operator squares to the identity, so $\\langle A^{2}\\rangle=1$ for any state and $\\operatorname{Var}(A)=1-\\langle A\\rangle^{2}$ without any further calculation. That shortcut is worth keeping: it turns almost every variance question in this course into one expectation value.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.4.1 -- */
{ id:'m2-comm', module:'M2', nav:'Compatibility', title:'The commutator, and when two readings can both be sharp',
  objective:'Compute a commutator and connect it to whether two observables share an eigenbasis.',
  keywords:'commutator compatible observables shared eigenbasis simultaneous sharp sequential measurement disturbance',
  src:'L5 · compatibility, commutators and uncertainty', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Compatibility and uncertainty'},
  {t:'title', text:'The commutator, and when two readings can both be sharp'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Two observables can both have sharp values on one state exactly when they share an eigenbasis, and there is a test for that which needs no eigenvectors at all:</p>'},
    {t:'eq', key:true, tex:'[A,B] = AB - BA = 0'},
    {t:'body', html:'<p>One direction is immediate. If $A$ and $B$ are both diagonal in the same basis then their matrices are diagonal there, diagonal matrices commute, and the commutator vanishes. The other direction is the theorem, and it holds for Hermitian operators in finite dimensions.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>For the Pauli operators the commutator is as far from zero as it can be:</p>'},
      {t:'eq', tex:'[X,Z] = XZ - ZX = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix} - \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix} = -2iY'},
      {t:'small', html:'So no state has a sharp $X$ and a sharp $Z$ at the same time. That is not a limitation of any apparatus; it is a statement about which vectors exist.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figSequence(),
      caption:'Three measurements in a row on a qubit prepared in $|0\\rangle$. The first is certain. The second is a coin, and it leaves the qubit in an $X$ eigenstate. The third is then a coin as well — the answer the first measurement gave has been destroyed, and nothing noisy happened anywhere.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Read the picture as the definition', html:'"Compatible" means the order does not matter and the readings survive each other. $Z$ and $X$ fail that test, and the middle box of the figure is where the first answer is lost. Two commuting observables can be measured in either order, and each keeps the other’s answer.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What it does not say', html:'It does not say that measuring $A$ physically kicks the system and spoils $B$, in the way a thermometer warms a small sample. That story predicts the same thing here and the wrong thing elsewhere. The correct statement is that no state is an eigenvector of both, so no preparation exists on which both readings are certain.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.4.2 -- */
{ id:'m2-uncert', module:'M2', nav:'The uncertainty relation', title:'The uncertainty relation, and what it is a statement about',
  objective:'State the Robertson relation, check it on a family of states, and say what it does not claim.',
  keywords:'uncertainty relation robertson bound commutator spread product cauchy schwarz saturated',
  src:'L5 · Robertson uncertainty relation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Compatibility and uncertainty'},
  {t:'title', text:'The uncertainty relation, and what it is a statement about'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The commutator does more than answer yes or no. It bounds how sharp two readings can be at once, on any state at all:</p>'},
    {t:'eq', key:true, tex:'\\Delta A \\,\\Delta B \\;\\ge\\; \\tfrac12\\left|\\langle [A,B]\\rangle\\right|'},
    {t:'body', html:'<p>The proof is Cauchy–Schwarz from chapter 1, applied to the two shifted operators $A-\\langle A\\rangle I$ and $B-\\langle B\\rangle I$. Nothing physical enters it; the physics is in what $\\Delta A$ means.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>For $X$ and $Z$ the commutator is $-2iY$, so the bound is one expectation value:</p>'},
      {t:'eq', tex:'\\Delta X\\,\\Delta Z \\;\\ge\\; \\left|\\langle Y\\rangle\\right|'},
      {t:'small', html:'On $|0\\rangle$ the right side is zero and the relation says nothing, correctly: $Z$ is sharp there and $\\Delta Z=0$ makes the left side zero too. The bound has content only where the third Pauli has a non-zero mean.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figUncertainty(),
      caption:'The product of the two spreads, and the bound, over the family $\\cos(\\theta/2)|0\\rangle+e^{i\\pi/4}\\sin(\\theta/2)|1\\rangle$. The product is above the bound everywhere and touches it at one state. Both curves are computed from the definitions.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'It is not about clumsy instruments', html:'The relation says nothing about disturbing a system by looking at it. $\\Delta A$ is the spread of the readings of $A$ over many runs of <b>one</b> preparation, and $\\Delta B$ the same for $B$ over a separate set of runs of the same preparation. No single experiment measures both, and none has to: the claim is about the two distributions, not about one apparatus interfering with another.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Where the famous version comes from', html:'For position and momentum, $[x,p]=i\\hbar I$, so the right side is the constant $\\hbar/2$ and the bound holds on every state. For a qubit the right side depends on the state, which is why the curve in the figure moves. The qubit case is the general one and the constant is the accident.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.5.1 -- */
{ id:'m2-pauli', module:'M2', nav:'The Pauli operators', title:'The Pauli operators: observable and gate at once',
  objective:'List the three Pauli operators with their eigenvalues and eigenstates, and say why each is both an observable and a gate.',
  keywords:'pauli matrices X Y Z hermitian unitary traceless square identity eigenstates spin stern gerlach',
  src:'L5 · spin-1/2 observables and Pauli matrices', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · The Pauli algebra'},
  {t:'title', text:'The Pauli operators: observable and gate at once'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Three matrices carry almost all of the one-qubit course:</p>'},
    {t:'eq', key:true, tex:'X=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}, \\quad Y=\\begin{bmatrix}0&-i\\\\i&0\\end{bmatrix}, \\quad Z=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}'},
    {t:'body', html:'<p>Each is Hermitian, so each is an observable. Each is also unitary, so each is a gate. That coincidence is particular to them and it is why they appear on both sides of every calculation in this course; almost no other operator here is both.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Three properties follow by inspection and are used constantly:</p>'},
      {t:'eq', tex:'\\sigma^{2} = I, \\qquad \\operatorname{Tr}\\sigma = 0, \\qquad \\text{eigenvalues } \\pm 1'},
      {t:'small', html:'The first two force the third: a traceless operator whose square is the identity has eigenvalues summing to zero and squaring to one, which leaves only $+1$ and $-1$, one of each.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figAxes(),
      caption:'The three measurement directions of one qubit, drawn as three axes with the equator behind them. This is not the Bloch sphere yet — chapter 4 earns that — but it is where the picture comes from, and the three bases of the last section are the three arrows.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['$X$', '$+1$ on $|+\\rangle=\\tfrac{1}{\\sqrt2}(1,1)$, and $-1$ on $|-\\rangle=\\tfrac{1}{\\sqrt2}(1,-1)$.'],
        ['$Y$', '$+1$ on $|{+}i\\rangle=\\tfrac{1}{\\sqrt2}(1,i)$, and $-1$ on $|{-}i\\rangle=\\tfrac{1}{\\sqrt2}(1,-i)$.'],
        ['$Z$', '$+1$ on $|0\\rangle$, and $-1$ on $|1\\rangle$.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Where they come from', html:'They are the components of spin, up to a factor: $S_{a}=\\tfrac{\\hbar}{2}\\sigma_{a}$, so the physical readings are $\\pm\\hbar/2$ and the dimensionless ones $\\pm1$. A Stern–Gerlach magnet sorting atoms into two beams is the oldest picture of a projective measurement, and it measures one of these.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.5.2 -- */
{ id:'m2-paulialg', module:'M2', nav:'The Pauli algebra', title:'One product rule, and everything else follows from it',
  objective:'Use the Pauli product rule to get any commutator or anticommutator without multiplying matrices.',
  keywords:'pauli algebra product rule commutator anticommutator cyclic levi civita identity operator basis',
  src:'L5 · Pauli algebra', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · The Pauli algebra'},
  {t:'title', text:'One product rule, and everything else follows from it'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Multiplying two Pauli operators never needs a matrix. One rule covers every case:</p>'},
    {t:'eq', key:true, tex:'\\sigma_{i}\\sigma_{j} = \\delta_{ij}\\,I \\;+\\; i\\sum_{k}\\varepsilon_{ijk}\\,\\sigma_{k}'},
    {t:'body', html:'<p>Read it in two halves. Same index: the answer is the identity, which is $\\sigma^{2}=I$ again. Different indices: the answer is $i$ times the third one, with a plus sign in the cyclic order $X\\to Y\\to Z\\to X$ and a minus sign against it.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Splitting the rule into its antisymmetric and symmetric halves gives the two brackets at once:</p>'},
      {t:'eq', tex:'[\\sigma_{i},\\sigma_{j}] = 2i\\sum_{k}\\varepsilon_{ijk}\\sigma_{k}, \\qquad \\{\\sigma_{i},\\sigma_{j}\\} = 2\\delta_{ij}I'},
      {t:'small', html:'So two different Pauli operators <b>anticommute</b>: $\\sigma_{i}\\sigma_{j}=-\\sigma_{j}\\sigma_{i}$. That single fact does most of the work in chapters 4 and 5.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCycle(),
      caption:'The cyclic order. Going with an arrow, the product of two is $i$ times the third; going against one, it is $-i$ times the third. Nothing else has to be remembered about Pauli products.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The product $XY$, then $YX$, then $[X,Y]$.'],
        ['Work', '$X\\to Y$ is with the arrow, so $XY=iZ$. Against it, $YX=-iZ$.'],
        ['Answer', '$[X,Y]=iZ-(-iZ)=2iZ$, which is the rule with $\\varepsilon_{xyz}=1$.'],
        ['Check', 'By matrices, $XY=\\begin{bmatrix}i&0\\\\0&-i\\end{bmatrix}=iZ$. The rule and the multiplication agree.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Why this is worth memorising', html:'Every single-qubit gate in chapter 4 is $\\cos(\\theta/2)I-i\\sin(\\theta/2)\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma$, and composing two of them is a Pauli product. A reader who can multiply Paulis in their head can compose rotations in their head; a reader who cannot will be multiplying two-by-two matrices for the rest of the course.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.5.3 -- */
{ id:'m2-ndotsigma', module:'M2', nav:'Measuring along any direction', title:'Measuring along a direction, and the first sight of a vector',
  objective:'Build the projectors for a measurement along an arbitrary axis and read off the outcome probability.',
  keywords:'n dot sigma arbitrary direction projector half identity plus axis bloch vector cos squared',
  src:'L5 · Stern-Gerlach experiment', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · The Pauli algebra'},
  {t:'title', text:'Measuring along a direction, and the first sight of a vector'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>An instrument can be aimed along any direction, not only along the three axes. For a unit vector $\\mathbf{n}$ the observable is $\\mathbf{n}\\cdot\\boldsymbol\\sigma=n_{x}X+n_{y}Y+n_{z}Z$, and its square is the identity, so its eigenvalues are again $\\pm1$. Its projectors are then one line:</p>'},
    {t:'eq', key:true, tex:'P_{\\pm} = \\tfrac12\\left(I \\pm \\mathbf{n}\\cdot\\boldsymbol\\sigma\\right)'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Check them: they are Hermitian, they add to $I$, and $P_{\\pm}^{2}=\\tfrac14\\left(I\\pm2\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma+I\\right)=P_{\\pm}$ using $(\\mathbf{n}\\cdot\\boldsymbol\\sigma)^{2}=I$. Everything the last two scenes established is being used at once.'},
      {t:'body', html:'<p>Now collect the three Pauli means of the state into one real vector, $r_{a}=\\langle\\sigma_{a}\\rangle$. The outcome probability becomes a dot product:</p>'},
      {t:'eq', key:true, tex:'p(\\pm) = \\tfrac12\\left(1 \\pm \\mathbf{n}\\cdot\\mathbf{r}\\right)'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figNdotR(),
      caption:'The probability of the $+1$ outcome, against the angle between the instrument and the state’s own vector. Aligned, the answer is certain; at a right angle it is a coin; opposed, the other outcome is certain.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Three numbers describe the whole state', html:'A pure qubit state has $|\\mathbf{r}|=1$, so the three Pauli means are a point on a sphere and the formula above answers <b>every</b> single-qubit measurement question from them. Chapter 4 draws that sphere and chapter 3 explains what a shorter vector means. It is worth noticing here that the three numbers are measurable: run the circuit three times over, once in each basis.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The angle in the picture is not the angle in the state', html:'Writing $\\mathbf{n}\\cdot\\mathbf{r}=\\cos\\alpha$ gives $p(+)=\\cos^{2}(\\alpha/2)$, and $\\alpha$ is the angle between two <b>vectors</b>. It is twice the angle between the corresponding states in the complex space: two orthogonal states sit at opposite ends of the sphere, at $\\alpha=\\pi$, and not at a right angle. That factor of two is the double cover of chapter 1, showing up as geometry.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.1 -- */
{ id:'m2-position', module:'M2', nav:'Position representation', title:'Position and momentum are operators on a wavefunction',
  objective:'Write the position, momentum and free-particle Hamiltonian in the coordinate representation and distinguish a plane wave from a physical packet.',
  keywords:'coordinate representation position momentum operator wavefunction plane wave wave packet free particle Hamiltonian continuous spectrum hbar',
  src:'L5 · coordinate representation and the free particle', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Position and momentum are operators on a wavefunction'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The function-space vectors of chapter 1 become physical wavefunctions when the coordinate is position. In one dimension, position multiplies the function and momentum differentiates it:</p>'},
    {t:'eq', key:true, tex:'(\\hat{x}\\psi)(x)=x\\psi(x), \\qquad (\\hat{p}\\psi)(x)=-i\\hbar\\frac{\\mathrm d\\psi}{\\mathrm dx}'},
    {t:'body', html:'<p>A free particle has kinetic energy only, so its Hamiltonian is</p>'},
    {t:'eq', key:true, tex:'\\hat{H}_{0}=\\frac{\\hat{p}^{2}}{2m}=-\\frac{\\hbar^{2}}{2m}\\frac{\\mathrm d^{2}}{\\mathrm dx^{2}}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The plane wave $e^{ikx}$ is an eigenfunction of momentum with $p=\\hbar k$ and of free-particle energy with $E=\\hbar^{2}k^{2}/(2m)$. The differential operator has turned the wavelength into a measured momentum.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figWavePacket(),
      caption:'A travelling oscillation inside a decaying envelope. The local oscillation supplies the wave number; the envelope makes the state square-integrable and therefore normalisable.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why the plane wave is still useful', html:'A plane wave extends across all space, so its squared norm is infinite and it is not a physical state by itself. It is a generalised eigenfunction. A physical free-particle state is a wave packet, built as a continuous superposition of plane waves.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Continuous normalisation is different', html:'Momentum eigenfunctions are normalised with a Dirac delta, not to unit norm. Treating the constant amplitude of a plane wave as if it could make an integral over all space equal one hides this distinction.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.2 -- */
{ id:'m2-schrod', module:'M2', nav:'Evolution', title:'Evolution: one Hermitian operator, one unitary family',
  objective:'Go from the Schrodinger equation to the evolution operator and check that it is unitary.',
  keywords:'schrodinger equation hamiltonian evolution operator unitary exponential closed system energy',
  src:'L5 · closed-system time evolution', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Evolution: one Hermitian operator, one unitary family'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A closed system — one that exchanges nothing with anything else — evolves by a differential equation with one operator in it, the <b>Hamiltonian</b>. With $\\hbar=1$ as this course fixes,</p>'},
    {t:'eq', key:true, tex:'i\\,\\frac{\\mathrm{d}}{\\mathrm{d}t}|\\psi(t)\\rangle = H\\,|\\psi(t)\\rangle'},
    {t:'body', html:'<p>If $H$ does not depend on time, the solution is the exponential of chapter 1, and no new mathematics is needed to write it down:</p>'},
    {t:'eq', key:true, tex:'|\\psi(t)\\rangle = U(t)\\,|\\psi(0)\\rangle, \\qquad U(t) = e^{-iHt}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'$H$ is Hermitian because it is an observable — the observable called energy — and the exponential of a Hermitian operator is unitary, which chapter 1 proved. So the evolution preserves every inner product, the state stays normalised, and the probabilities keep adding to one at every time. Nothing had to be imposed to make that true.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$H=\\tfrac{\\omega}{2}Z$, and the state $|+\\rangle$ at $t=0$.'],
        ['Method', 'Use the closed form of chapter 1 with $\\theta=\\omega t$.'],
        ['Work', '$U(t)=e^{-i\\omega t Z/2}=\\operatorname{diag}\\left(e^{-i\\omega t/2},\\,e^{i\\omega t/2}\\right)$.'],
        ['Answer', '$|\\psi(t)\\rangle=\\tfrac{1}{\\sqrt2}\\left(e^{-i\\omega t/2}|0\\rangle+e^{i\\omega t/2}|1\\rangle\\right)$, which up to a global phase is $\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\omega t}|1\\rangle\\right)$.'],
        ['Check', 'The two amplitudes keep modulus $1/\\sqrt2$ at every time, so $P(0)=P(1)=\\tfrac12$ always. What moves is the relative phase, at rate $\\omega$ — and that is what an $X$ measurement would see.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Adding a constant to the energy changes nothing', html:'Replacing $H$ by $H+cI$ multiplies $U(t)$ by $e^{-ict}$, which is a global phase. So only energy <b>differences</b> are physical in a closed system, and a Hamiltonian is always free to be shifted to whichever zero makes the algebra easiest. This is the global-phase rule of chapter 1, met again as a statement about energy.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.3 -- */
{ id:'m2-stationary', module:'M2', nav:'Stationary states and beats', title:'Why one energy eigenstate does nothing and two of them beat',
  objective:'Show that an energy eigenstate is stationary and that a superposition of two oscillates at their difference.',
  keywords:'stationary state energy eigenstate superposition beat frequency difference relative phase oscillation',
  src:'L5 · stationary states and superpositions', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Why one energy eigenstate does nothing and two of them beat'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Start in an eigenstate of the Hamiltonian, $H|E_{n}\\rangle=E_{n}|E_{n}\\rangle$. The exponential acts on the eigenvalue and returns a phase:</p>'},
    {t:'eq', tex:'|E_{n}(t)\\rangle = e^{-iE_{n}t}\\,|E_{n}\\rangle'},
    {t:'body', html:'<p>That is a global phase, so no probability of anything changes ever. Such a state is called <b>stationary</b>, and the name is exact: the state moves in the mathematics and nothing observable moves at all.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Now start in a superposition of two of them. Each term picks up its own phase, and the two phases are different:</p>'},
      {t:'eq', key:true, tex:'|\\psi(t)\\rangle = c_{1}e^{-iE_{1}t}|E_{1}\\rangle + c_{2}e^{-iE_{2}t}|E_{2}\\rangle'},
      {t:'body', html:'<p>Pull out the first phase as a global one and what is left is a relative phase turning at the difference:</p>'},
      {t:'eq', key:true, tex:'\\equiv\\; c_{1}|E_{1}\\rangle + c_{2}e^{-i(E_{2}-E_{1})t}|E_{2}\\rangle'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figBeat(),
      caption:'A qubit started in $|+\\rangle$ under $H=\\tfrac{\\omega}{2}Z$, watched in the $X$ basis. The two energy eigenstates are each stationary and their sum is not: the probability falls to zero at $\\omega t=\\pi$ and returns to one at $\\omega t=2\\pi$, once per turn of the relative phase.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Only differences are observable', html:'Every oscillation frequency in this course is an energy <b>difference</b>, $\\omega_{12}=E_{2}-E_{1}$. That is the same statement as the last scene’s: shifting both energies by the same amount is a global phase and changes no rate. A two-level system has one frequency, and every experiment on it is measuring that number.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The basis you watch in decides whether you see anything', html:'The state in the figure has $P(0)=P(1)=\\tfrac12$ at every time: in the computational basis absolutely nothing happens, and a reader watching only that basis would report a dead qubit. The oscillation is entirely in the relative phase, and only a measurement that mixes the two levels — an $X$ or a $Y$ measurement — can see it. Every phase-sensitive experiment in this course is that observation.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.4 -- */
{ id:'m2-well', module:'M2', nav:'The infinite square well', title:'Boundary conditions turn a continuous wave number into discrete energies',
  objective:'Derive the allowed states and energies of an infinite square well and distinguish an energy eigenstate from a superposition.',
  keywords:'infinite square well particle in a box boundary conditions quantisation eigenfunction energy discrete stationary superposition',
  src:'L5 · infinite square well', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Boundary conditions turn a continuous wave number into discrete energies'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Confine a particle to $0<x<a$ with an infinite potential outside. The wavefunction must vanish at both walls. The free-particle equation still holds inside, but only standing waves that meet both boundary conditions survive:</p>'},
    {t:'eq', key:true, tex:'\\phi_{n}(x)=\\sqrt{\\frac{2}{a}}\\sin\\!\\left(\\frac{n\\pi x}{a}\\right), \\qquad n=1,2,\\ldots'},
    {t:'eq', key:true, tex:'E_{n}=\\frac{\\hbar^{2}\\pi^{2}n^{2}}{2ma^{2}}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The walls have not changed the kinetic-energy operator inside the box. They have restricted its domain. That restriction selects $k_n=n\\pi/a$ and turns a continuous free-particle spectrum into discrete energies.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figWell(),
      caption:'The first three normalised standing-wave shapes, shifted to their energy levels. The nodes meet the walls, and the levels rise as $n^{2}$ rather than at equal spacing.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A well of width $a$, and the first two levels.'],
        ['Work', '$E_{2}/E_{1}=2^{2}/1^{2}=4$, so $E_{2}-E_{1}=3E_{1}$.'],
        ['Answer', 'An equal superposition of $\\phi_{1}$ and $\\phi_{2}$ has relative phase frequency $(E_{2}-E_{1})/\\hbar$ and period $T=2\\pi\\hbar/(3E_{1})$.'],
        ['Check', 'Either eigenstate alone has a time-independent probability density. Only the cross term of the superposition moves.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'There is no $n=0$ state', html:'Putting $n=0$ into the sine gives the zero function, which cannot be normalised and is not a state. The ground state is $n=1$, with non-zero energy. Confinement therefore has an energy cost even before any excitation is added.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.6.5 -- */
{ id:'m2-gate', module:'M2', nav:'Why a gate is an exponential', title:'Why a gate is an exponential, and what a pulse controls',
  objective:'Read a driven-qubit Hamiltonian as a rotation axis and an angle, and identify what each control sets.',
  keywords:'driven qubit rabi drive strength detuning rotation axis pulse area gate calibration resonance',
  src:'L5 · driven qubit: Hamiltonians become gates', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Why a gate is an exponential, and what a pulse controls'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A qubit driven by an engineered field has, in the frame the drive defines, a Hamiltonian built from the three Pauli operators and nothing else:</p>'},
    {t:'eq', key:true, tex:'H = \\tfrac12\\left(\\Omega_{x}X + \\Omega_{y}Y + \\Delta Z\\right) = \\tfrac{\\Omega}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma'},
    {t:'body', html:'<p>with $\\Omega=\\sqrt{\\Omega_{x}^{2}+\\Omega_{y}^{2}+\\Delta^{2}}$ and $\\mathbf{n}$ the unit vector in that direction. Since $(\\mathbf{n}\\cdot\\boldsymbol\\sigma)^{2}=I$, the closed form of chapter 1 applies with no further work:</p>'},
    {t:'eq', key:true, tex:'U(t) = \\cos\\!\\left(\\tfrac{\\Omega t}{2}\\right) I \\;-\\; i\\sin\\!\\left(\\tfrac{\\Omega t}{2}\\right)\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'A gate is therefore not a separate kind of object bolted onto the theory. It is what a Hamiltonian does for a set length of time, and building a gate means choosing $\\mathbf{n}$ and $\\Omega t$.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDrive(),
      caption:'The axis the drive turns the qubit about, for four detunings at fixed drive strength. On resonance the axis lies in the equator and the drive moves the population fully; far off resonance it lies almost along $z$, and the drive barely tips the state at all.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What each control does', html:'The <b>pulse area</b> $\\Omega t$ sets the angle turned through, so a $\\pi$ pulse is a bit flip and a $\\pi/2$ pulse makes an even superposition. The <b>phase of the drive</b> chooses between $X$ and $Y$, and therefore between two axes in the equator. The <b>detuning</b> tilts the axis out of the equator towards $z$. Three knobs, three properties of one rotation.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'And where a gate error comes from', html:'A pulse that is a few per cent too long turns through a few per cent too much: a coherent error, the same every time, which accumulates over a circuit rather than averaging away. A residual detuning tilts the axis and does the same thing about a slightly wrong direction. Both are calibration failures rather than noise, and both are why chapter 5 counts depth.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.L2 --- */
{ id:'m2-lab-d', module:'M2', nav:'Laboratory D', title:'Laboratory D · Driving a qubit: strength, detuning and time',
  objective:'Let the reader move the drive strength and the detuning and watch the population follow.',
  keywords:'laboratory rabi oscillation drive strength detuning population resonance pulse area pi pulse',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Dynamics'},
  {t:'title', text:'Laboratory D · Driving a qubit: strength, detuning and time'},
  {t:'small', html:'The qubit starts in $|0\\rangle$ under $H=\\tfrac12(\\Omega_{x}X+\\Delta Z)$. The left panel is the population of $|1\\rangle$ against time, with the elapsed time marked; the right one is the largest population the drive can ever reach, against the detuning. The transport runs the clock forward. Find the pulse length that flips the qubit, then detune and watch that pulse stop working.'},
  {t:'lab', id:'D'}
]},

/* ---------------------------------------------------------------- 2.7.1 -- */
{ id:'m2-shots', module:'M2', nav:'What a count is worth', title:'Finite shots: a histogram is an estimate, not a distribution',
  objective:'Give the standard error of a probability estimated from N shots and say what it is not.',
  keywords:'shots binomial standard error sampling noise estimate histogram confidence square root scaling',
  src:'L5 · finite-shot estimation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Finite shots'},
  {t:'title', text:'Finite shots: a histogram is an estimate, not a distribution'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Every probability in this chapter is exact and none of them is ever observed. What is observed is a count: run the circuit $N$ times, see the outcome $K$ times, and report $K/N$. That number is a random variable, and its spread is known:</p>'},
    {t:'eq', key:true, tex:'K \\sim \\mathrm{Binomial}(N,p), \\qquad \\mathrm{SE}\\!\\left(\\tfrac{K}{N}\\right) = \\sqrt{\\frac{p(1-p)}{N}}'},
    {t:'body', html:'<p>The worst case is $p=\\tfrac12$, where the standard error is $1/(2\\sqrt{N})$. Everything about the cost of a quantum experiment follows from that square root.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'One more decimal place costs a hundred times as many shots. An estimate good to one per cent needs of order ten thousand shots; good to one part in a thousand, a million. No hardware improvement changes this, because it is counting and not physics.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShots(),
      caption:'The standard error of an estimated probability against the shot count, on decade axes. The slope is one half in both cases: that is the square root, drawn. A rare outcome is cheaper in absolute terms and dearer in relative ones.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A circuit whose true $p$ is near $\\tfrac12$, run for $N=1000$ shots.'],
        ['Work', '$\\mathrm{SE}=\\sqrt{0.25/1000}=0.0158$.'],
        ['Answer', 'The estimate carries about $\\pm 0.016$ at one standard error, so about $\\pm 0.03$ at two.'],
        ['Check', 'Two runs of the same circuit differing by $0.02$ have not disagreed about anything. Reporting that difference as an effect is reporting the sampling.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'This is not the same as noise', html:'Sampling error is present on a perfect device and shrinks as $1/\\sqrt{N}$. State-preparation, gate and readout errors are <b>systematic</b>: they bias the answer and more shots make the wrong number more precise, not more right. A report that gives a shot count and no error bar, or an error bar with no statement of which of the two it covers, has not reported the measurement.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 2.8.1 -- */
{ id:'m2-synth', module:'M2', nav:'Summary', title:'What this chapter leaves you with',
  objective:'Collect the two postulates this chapter added and the four errors it exists to prevent.',
  keywords:'summary module 2 review born rule projective measurement expectation commutator evolution shots',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Summary'},
  {t:'title', text:'What this chapter leaves you with'},
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
{ id:'m2-shapes', module:'M2', nav:'The shapes of question', title:'The shapes of question this chapter sets',
  objective:'Name the recurring question types of chapter 2 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice born projective expectation commutator evolution shots',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 2 · Summary and practice'},
  {t:'title', text:'The shapes of question this chapter sets'},
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
