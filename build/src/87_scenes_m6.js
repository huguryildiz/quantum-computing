/* ==========================================================================
   Module 6 — Quantum algorithms.

   This chapter has one mechanism in it and four uses of that mechanism. The
   mechanism is phase kickback: an operation written to change one register
   writes a phase onto another one instead, because the register it was
   pointed at was prepared in a state that operation cannot move. Deutsch,
   Deutsch-Jozsa, phase estimation and order finding are four instances of
   that one move, and each of them is written here against the same sentence:
   nothing is gained until the unwanted amplitudes have been made to cancel.

   That sentence is the reason the chapter is arranged this way. A student who
   believes a quantum computer tries every answer at once reads the uniform
   superposition as the answer and the rest of the circuit as bookkeeping. It
   is the other way round. Preparing the superposition is free and worth
   nothing; the interference that follows it is the algorithm, and every one
   of these four algorithms is the same interference with a different question
   written into the phases.

   Two things this chapter refuses to say. The quantum Fourier transform does
   not return a spectrum: what it produces is a set of amplitudes that still
   has to be measured, and a measurement returns one index. And Shor's
   algorithm is not a quantum algorithm for factoring: the only quantum step in
   it is order finding, and the modular exponentiation that dominates its cost,
   the continued fractions that read the answer, the greatest common divisors
   that extract the factors and the repetition that covers the failures are all
   classical or classically dominated. Chapter 5's five-part resource claim is
   applied to it in full, and the answer is not a slogan.

   Every figure that carries an angle is drawn in an isotropic frame — the same
   number of pixels to the unit on both axes — and the ratio is written in the
   comment above it. Circuit drawings follow the chapter-4 rules exactly: a
   control is the `dot` item of `P.blocks`, which is a filled disc, and a target
   is an open circle with a cross in it.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const TAU = 2*Math.PI;

/* ---- the circuit-drawing kit, the same one chapters 4 and 5 use ---------- */
function wire(y,x0,x1,col){ return {t:'line',d:`M${x0},${y} H${x1}`,color:col||C.rule}; }
function cwire(y,x0,x1){ return [{t:'line',d:`M${x0},${y-2} H${x1}`,color:C.out},
                                 {t:'line',d:`M${x0},${y+2} H${x1}`,color:C.out}]; }
function gate(x,y,label,tex,w,col){ return {t:'box',x:x-(w||34)/2,y:y-17,w:w||34,h:34,
  label,tex:!!tex,fs:15,color:col||C.h}; }
function ctrl(x,y,col){ return {t:'dot',x,y,r:6.5,color:col||C.h}; }
function targ(x,y,col){ const k=col||C.h; return [
  {t:'line',d:`M${x-13},${y} a13,13 0 1,0 26,0 a13,13 0 1,0 -26,0`,color:k},
  {t:'line',d:`M${x},${y-13} V${y+13}`,color:k},
  {t:'line',d:`M${x-13},${y} H${x+13}`,color:k}]; }
/* A meter carries a plain word, so it takes no TeX and no `\text{}` wrapper. */
function meter(x,y,col){ return {t:'box',x:x-24,y:y-17,w:48,h:34,label:'measure',fs:11,
  color:col||C.out}; }

/* A swap is drawn as the two crosses joined by a line, the standard mark. Two
   wires drawn crossing each other would pass straight through the wire
   between them and read as nothing at all. */
function swapMark(x,y0,y1,col){ const k=col||C.mid, c=(y)=>[
    {t:'line',d:`M${x-7},${y-7} L${x+7},${y+7}`,color:k},
    {t:'line',d:`M${x-7},${y+7} L${x+7},${y-7}`,color:k}];
  return [{t:'line',d:`M${x},${y0} V${y1}`,color:k}].concat(c(y0)).concat(c(y1)); }

/* A box diagram has no axes to stretch, so when a slide grows its figure into
   the spare height of the column, the diagram keeps its size and is centred in
   the taller frame. Chapter 4's helper: a wire here is drawn with absolute
   commands (`M60,50 H250`, `M180,52 V120`), so every absolute y in a path
   moves by the same amount, and not only the first point. The lowercase
   commands are relative and need nothing. */
function growBlocks(spec){
  const h1 = P.hOverride;
  if(!h1 || h1 <= spec.h) return P.blocks(spec);
  const dy = (h1 - spec.h) / 2;
  const items = spec.items.map(it => {
    const o = Object.assign({}, it);
    ['y','y1','y2'].forEach(k => { if(o[k] != null) o[k] += dy; });
    if(o.t === 'line' && o.d) o.d = o.d
      .replace(/([ML])\s*([-\d.]+),([-\d.]+)/g, (m,c,x,y) => `${c}${x},${+y + dy}`)
      .replace(/V\s*([-\d.]+)/g, (m,y) => `V${+y + dy}`);
    return o;
  });
  return P.blocks({w:spec.w, h:h1, items:items});
}

/* ---- the arithmetic the figures below compute their own numbers from -----
   Nothing in this file is a tabulated value. Each of these is the definition,
   written once, so that a figure and the caption beside it cannot drift. */

/* The phase-estimation distribution: t counting qubits in a uniform
   superposition, a phase e^{2 pi i 2^k phi} written onto each of them, then
   the inverse transform. The amplitude of the outcome y is the geometric sum
   below, and its modulus squared is the probability. */
function qpeProb(phi, t, y){
  const Q = Math.pow(2,t), d = phi - y/Q;
  /* The sum of Q terms e^{2 pi i k d} is Q when d is a whole number. */
  if(Math.abs(d - Math.round(d)) < 1e-12) return 1;
  const num = Math.sin(Math.PI*Q*d), den = Math.sin(Math.PI*d);
  return (num*num)/(Q*Q*den*den);
}
/* The order of a modulo N, by direct search. Small numbers only, which is the
   whole point of the scene it is drawn for. */
function orderOf(a,N){ let x=1%N; for(let r=1;r<=N;r++){ x=(x*a)%N; if(x===1) return r; } return 0; }
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ const t=a%b; a=b; b=t; } return a; }

/* ---------------------------------------------------------------- figures --
   Each is a function, so the palette is the one in force when it is drawn. */

/* The chapter as one mechanism with four uses. */
function figOpen(){
  return P.blocks({w:760,h:250,items:[
    {t:'box',x:26,y:36,w:150,h:58,label:'a superposition',fs:13,color:C.in},
    {t:'arrow',x1:176,y1:65,x2:218,y2:65},
    {t:'box',x:218,y:36,w:150,h:58,label:'one query',fs:13,color:C.h},
    {t:'arrow',x1:368,y1:65,x2:410,y2:65},
    {t:'box',x:410,y:36,w:150,h:58,label:'interference',fs:13,color:C.mid},
    {t:'arrow',x1:560,y1:65,x2:602,y2:65},
    {t:'box',x:602,y:36,w:132,h:58,label:'n bits',fs:13,color:C.out},
    {t:'text',x:101,y:116,label:'free, and worth nothing on its own',fs:12},
    {t:'text',x:293,y:116,label:'writes a phase, not a bit',fs:12},
    {t:'text',x:485,y:116,label:'this step is the algorithm',fs:12},
    {t:'text',x:668,y:116,label:'all anyone ever sees',fs:12},
    {t:'line',d:'M26,146 H734',color:C.rule},
    /* One centred line, not four names spaced under the four boxes: names
       laid under the boxes would read as labels for them, and they are not.
       That pairing is the mistake chapter 4's Pauli figure shipped. */
    {t:'text',x:380,y:180,label:'the four algorithms: Deutsch-Jozsa, phase estimation, order finding, Grover',fs:13,color:C.h},
    {t:'text',x:380,y:216,label:'Four algorithms and one move. Each writes a different question into the phases and then makes the wrong answers cancel.',fs:12.5},
    {t:'text',x:380,y:240,label:'A superposition that is never made to interfere has bought nothing at all.',fs:12.5,color:C.err}
  ]});
}

/* What a query counts, and what it hides: the same box, opened once, and the
   three numbers a cost can mean. */
function figQuery(){
  return growBlocks({w:560,h:212,items:[
    {t:'box',x:200,y:22,w:160,h:92,label:'U_{f}',tex:true,fs:22,color:C.h},
    {t:'arrow',x1:60,y1:48,x2:200,y2:48,label:'|x\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:60,y1:90,x2:200,y2:90,label:'|y\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:360,y1:48,x2:500,y2:48,label:'|x\\rangle',tex:true,color:C.out},
    {t:'arrow',x1:360,y1:90,x2:500,y2:90,label:'|y \\oplus f(x)\\rangle',tex:true,color:C.out},
    {t:'line',d:'M20,134 H540',color:C.rule},
    {t:'text',x:95,y:166,label:'query count',fs:15,color:C.out},
    {t:'text',x:95,y:192,label:'boxes opened',fs:13},
    {t:'text',x:280,y:166,label:'gate count',fs:15,color:C.h},
    {t:'text',x:280,y:192,label:'the box, built',fs:13},
    {t:'text',x:465,y:166,label:'end-to-end',fs:15,color:C.err},
    {t:'text',x:465,y:192,label:'plus loading, repeats',fs:13}
  ]});
}

/* The four classes and the containments that are known. Deliberately not a
   Venn diagram: a nested-box picture of these four has to assert something
   about every pair, and two of those pairs are open questions, so the picture
   would be stating things nobody knows. Four separate boxes, and the
   containments written out underneath. */
function figClasses(){
  const cols = [
    ['\\mathrm{P}',   'deterministic', C.in, 12],
    ['\\mathrm{BPP}', 'with coins',    C.in, 142],
    ['\\mathrm{BQP}', 'quantum',       C.h,  272],
    ['\\mathrm{NP}',  'checkable',     C.mid, 436]
  ];
  const items = [];
  cols.forEach(([k,v,col,x])=>{
    items.push({t:'box',x,y:22,w:112,h:50,label:k,tex:true,fs:19,color:col});
    items.push({t:'text',x:x+56,y:96,label:v,fs:14});
  });
  items.push({t:'arrow',x1:124,y1:47,x2:142,y2:47});
  items.push({t:'arrow',x1:254,y1:47,x2:272,y2:47});
  items.push({t:'line',d:'M12,118 H548',color:C.rule});
  items.push({t:'text',x:180,y:152,anchor:'middle',label:'\\mathrm{P} \\subseteq \\mathrm{BPP} \\subseteq \\mathrm{BQP}',tex:true,fs:17,color:C.out});
  items.push({t:'text',x:440,y:152,anchor:'middle',label:'\\mathrm{P} \\subseteq \\mathrm{NP}',tex:true,fs:17,color:C.out});
  items.push({t:'text',x:280,y:194,anchor:'middle',label:'\\mathrm{NP} \\subseteq \\mathrm{BQP}\\ ?\\quad\\text{open}',tex:true,fs:17,color:C.err});
  return growBlocks({w:560,h:214,items});
}

/* Phase kickback for a Boolean oracle: the target is the one state the flip
   cannot move, so the answer comes back as a sign on the query wire. */
function figKick(){
  const Y0 = 52, Y1 = 124;
  return growBlocks({w:560,h:204,items:[
    wire(Y0,88,370), wire(Y1,88,370),
    {t:'text',x:78,y:Y0+5,anchor:'end',label:'|x\\rangle',tex:true,fs:16},
    {t:'text',x:78,y:Y1+5,anchor:'end',label:'|{-}\\rangle',tex:true,fs:16},
    {t:'box',x:180,y:28,w:100,h:120,label:'U_{f}',tex:true,fs:22,color:C.h},
    {t:'text',x:382,y:Y0+5,anchor:'start',label:'(-1)^{f(x)}|x\\rangle',tex:true,fs:16,color:C.out},
    {t:'text',x:382,y:Y1+5,anchor:'start',label:'|{-}\\rangle',tex:true,fs:16,color:C.in},
    {t:'text',x:382,y:Y1+36,anchor:'start',label:'unchanged',fs:14,color:C.in},
    {t:'text',x:230,y:182,label:'one query',fs:14}
  ]});
}

/* The same move with a general unitary: an eigenstate sends its eigenvalue up
   onto the control. The control line stops at the top edge of the box. */
function figEigen(){
  const Y0 = 52, Y1 = 128;
  return growBlocks({w:560,h:200,items:[
    wire(Y0,88,322), wire(Y1,88,322),
    {t:'text',x:78,y:Y0+5,anchor:'end',label:'|{+}\\rangle',tex:true,fs:16},
    {t:'text',x:78,y:Y1+5,anchor:'end',label:'|u\\rangle',tex:true,fs:16},
    {t:'line',d:`M200,${Y0} V${Y1-17}`,color:C.h},
    ctrl(200,Y0),
    gate(200,Y1,'U',true,44),
    {t:'text',x:334,y:Y0+5,anchor:'start',label:'\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+e^{2\\pi i\\varphi}|1\\rangle\\big)',tex:true,fs:15,color:C.out},
    {t:'text',x:334,y:Y1+5,anchor:'start',label:'|u\\rangle',tex:true,fs:16,color:C.in},
    {t:'text',x:334,y:Y1+36,anchor:'start',label:'unchanged',fs:14,color:C.in},
    {t:'text',x:200,y:180,label:'one controlled gate',fs:14}
  ]});
}

/* The rule the whole chapter answers to: sixteen amplitudes before the last
   layer of Hadamards and after it, for a balanced function on four bits.
   Nothing is gained by the first picture; everything is gained by the second. */
function figCancel(){
  const n = 4, Q = 1 << n;
  /* f(x) = the parity of x, which is balanced. The amplitude before the last
     Hadamards is (-1)^{f(x)} / 4, and after them the state is the single
     basis state |1111>, which is what the sum below computes. */
  const par = x => { let p=0,y=x; while(y){ p^=y&1; y>>=1; } return p; };
  const before = [], after = [];
  for(let k=0;k<Q;k++){
    let s = 0;
    for(let x=0;x<Q;x++){
      let dot=0, t=x&k; while(t){ dot^=t&1; t>>=1; }
      s += Math.pow(-1, par(x)+dot);
    }
    before.push([k, Math.pow(-1,par(k))/Math.sqrt(Q)]);
    after.push([k, s/Q]);
  }
  const a = P.Axes({w:560,h:280,xr:[-0.6,15.6],yr:[-0.60,1.34],
    xlabel:'x\\text{ or }k', ylabel:'\\text{amplitude}',
    pad:{l:70,r:26,t:30,b:48}, xtarget:8, yticksOverride:[-0.25,0,0.25,0.5,0.75,1]});
  a.stem(before,{color:C.in,r:3.4,width:1.6});
  a.stem(after,{color:C.out,r:5.0,width:2.4});
  a.note(-0.2,1.24,'\\text{before the last layer: sixteen of size }1/4',{fs:13,color:C.in,anchor:'start',tex:true});
  a.note(-0.2,-0.50,'\\text{after it: one of size }1',{fs:13,color:C.out,anchor:'start',tex:true});
  return a.svg();
}

/* Deutsch's problem: the circuit, and the four promised functions with the
   one bit the circuit returns for each. */
function figDeutsch(){
  const Y0 = 50, Y1 = 112;
  const items = [
    wire(Y0,60,290), wire(Y1,60,290),
    {t:'text',x:52,y:Y0+5,anchor:'end',label:'|0\\rangle',tex:true,fs:15},
    {t:'text',x:52,y:Y1+5,anchor:'end',label:'|1\\rangle',tex:true,fs:15},
    gate(92,Y0,'H',true), gate(92,Y1,'H',true),
    {t:'box',x:126,y:28,w:64,h:106,label:'U_{f}',tex:true,fs:19,color:C.h},
    gate(220,Y0,'H',true),
    meter(266,Y0),
    {t:'text',x:158,y:166,label:'one query',fs:14},
    {t:'line',d:'M306,18 V172',color:C.rule},
    {t:'text',x:360,y:34,label:'f',tex:true,fs:15},
    {t:'text',x:452,y:34,label:'class',fs:14},
    {t:'text',x:526,y:34,label:'reads',fs:14}
  ];
  [['f(x)=0','constant','0'],['f(x)=1','constant','0'],
   ['f(x)=x','balanced','1'],['f(x)=1\\oplus x','balanced','1']].forEach(([f,cls,out],i)=>{
    const y = 70 + i*32, col = i<2 ? C.in : C.out;
    items.push({t:'text',x:360,y,anchor:'middle',label:f,tex:true,fs:15});
    items.push({t:'text',x:452,y,anchor:'middle',label:cls,fs:14,color:col});
    items.push({t:'text',x:526,y,anchor:'middle',label:out,fs:16,color:col});
  });
  return growBlocks({w:560,h:186,items});
}

/* Deutsch-Jozsa: the amplitude of the all-zero string is the mean of the
   signs, so the two promised cases land on 1 and on 0 and on nothing else. */
function figDJ(){
  const items = [
    {t:'text',x:289,y:30,anchor:'middle',label:'(-1)^{f(x)}\\text{ for the eight inputs}',tex:true,fs:14},
    {t:'text',x:500,y:30,anchor:'middle',label:'\\text{mean}',tex:true,fs:14},
    {t:'line',d:'M12,44 H548',color:C.rule}
  ];
  const draw = (y, signs, label, col, val) => {
    items.push({t:'text',x:12,y,anchor:'start',label,fs:14,color:col});
    signs.forEach((s,i)=>items.push({t:'text',x:170+i*34,y,anchor:'middle',label:s,fs:17,color:col}));
    items.push({t:'text',x:500,y,anchor:'middle',label:val,tex:true,fs:16,color:col});
  };
  draw(76, ['+','+','+','+','+','+','+','+'],'constant 0',C.in,'+1');
  draw(110,['-','-','-','-','-','-','-','-'],'constant 1',C.in,'-1');
  draw(152,['+','-','-','+','-','+','+','-'],'parity',C.out,'0');
  draw(186,['+','+','+','+','-','-','-','-'],'top bit',C.out,'0');
  return growBlocks({w:560,h:204,items});
}

/* What the separation is: exact against exact. Both classical curves are
   drawn, because quoting only the deterministic one overstates the result. */
function figDJcost(){
  const a = P.Axes({w:560,h:280,xr:[1,20],yr:[0,8.6],
    xlabel:'n\\,(\\text{input bits})', ylabel:'\\text{queries}',
    pad:{l:76,r:26,t:30,b:48}, xtarget:6,
    yticksOverride:P.decades(0,6), ytickfmt:P.decade});
  a.curve(n => Math.log10(Math.pow(2,n-1)+1), {color:C.err,width:2.6});
  a.curve(() => Math.log10(21), {color:C.h,width:2.2,dash:'5 4'});
  a.curve(() => 0, {color:C.out,width:2.6});
  /* The three names stack in a band above the highest curve, which reaches
     5.72 at twenty bits, and each is drawn in the colour of the curve it
     names rather than in the colour of anything it mentions. */
  a.note(1.4,7.9,'\\text{classical, exact: }2^{n-1}+1',{fs:13,color:C.err,anchor:'start',tex:true});
  a.note(1.4,7.0,'\\text{classical, wrong once in a million: }21',{fs:13,color:C.h,anchor:'start',tex:true});
  a.note(1.4,6.1,'\\text{quantum, exact: }1',{fs:13,color:C.out,anchor:'start',tex:true});
  return a.svg();
}

/* The transform on one basis state: every magnitude the same, and the phase
   winding at a rate the input index sets. Isotropic: the plot area is 330 px
   over an x span of 3.9875 and 240 px over a y span of 2.90, so 82.8 px to the
   unit either way and the eight phases sit on a genuine circle. The x range
   runs past the circle to hold the two notes; the formula and the sentence
   about the rate are in the caption and the cards. */
function figQFT(){
  const a = P.Axes({w:560,h:300,xr:[-1.45,2.5375],yr:[-1.45,1.45],
    pad:{l:24,r:206,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const ring=[]; for(let i=0;i<=220;i++){ const s=TAU*i/220; ring.push([Math.cos(s),Math.sin(s)]); }
  a.poly(ring,{color:C.grid,width:1.4,dash:'3 4'});
  a.poly([[-1.18,0],[1.18,0]],{color:C.rule,width:1.1});
  a.poly([[0,-1.18],[0,1.18]],{color:C.rule,width:1.1});
  /* x = 3 and Q = 8: the phase of amplitude k is 2 pi (3 k) / 8, so each step
     turns by 135 degrees and the eight arrows land on all eight eighths. */
  for(let k=0;k<8;k++){
    const th = TAU*3*k/8;
    a.poly([[0,0],[Math.cos(th),Math.sin(th)]],{color:k===0?C.out:C.in,width:k===0?2.6:1.8});
    a.point(Math.cos(th),Math.sin(th),{color:k===0?C.out:C.in,r:k===0?6:4.6});
    a.note(1.16*Math.cos(th),1.16*Math.sin(th),String(k),{fs:13,color:C.muted,anchor:'middle'});
  }
  a.note(1.42,0.30,'|a_{k}| = 1/\\sqrt8 = 0.354',{fs:14,color:C.in,anchor:'start',tex:true});
  a.note(1.42,-0.34,'135^{\\circ}\\text{ a step}',{fs:14,color:C.in,anchor:'start',tex:true});
  return a.svg();
}

/* The circuit on three qubits, q0 on the top wire. The most significant bit
   q2 takes a Hadamard and then a controlled rotation from each lower bit, the
   rotation halving as the control gets further away; q1 and q0 follow; and
   the swap of q0 and q2 puts the output back in order. Every control line
   stops at the edge of the box it controls. */
function figQFTcirc(){
  const Y = [44,100,156];
  const items = [
    wire(Y[0],60,530), wire(Y[1],60,530), wire(Y[2],60,530),
    {t:'text',x:52,y:Y[0]+5,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:52,y:Y[1]+5,anchor:'end',label:'q_{1}',tex:true,fs:15},
    {t:'text',x:52,y:Y[2]+5,anchor:'end',label:'q_{2}',tex:true,fs:15},
    gate(96,Y[2],'H',true),
    {t:'line',d:`M158,${Y[1]} V${Y[2]-17}`,color:C.h}, ctrl(158,Y[1]),
    gate(158,Y[2],'R_{2}',true,44),
    {t:'line',d:`M226,${Y[0]} V${Y[2]-17}`,color:C.h}, ctrl(226,Y[0]),
    gate(226,Y[2],'R_{3}',true,44),
    gate(292,Y[1],'H',true),
    {t:'line',d:`M354,${Y[0]} V${Y[1]-17}`,color:C.h}, ctrl(354,Y[0]),
    gate(354,Y[1],'R_{2}',true,44),
    gate(418,Y[0],'H',true)
  ].concat(swapMark(484,Y[0],Y[2])).concat([
    {t:'text',x:484,y:186,label:'swap',fs:14,color:C.mid}
  ]);
  return growBlocks({w:560,h:198,items});
}

/* What comes out: a distribution over indices, and one draw from it. The bars
   are what exists; the single mark is what is seen. */
function figQFTnot(){
  const Q = 8;
  /* A state with two components, so the transform has a shape worth sampling:
     the equal mixture of |1> and |5>, whose transform has weight on the even
     indices only. Computed here rather than tabulated. */
  const amp = k => {
    let re=0, im=0;
    [1,5].forEach(x=>{ const th=TAU*x*k/Q; re+=Math.cos(th)/Math.sqrt(2); im+=Math.sin(th)/Math.sqrt(2); });
    return (re*re+im*im)/Q;
  };
  const pts=[]; for(let k=0;k<Q;k++) pts.push([k,amp(k)]);
  const a = P.Axes({w:560,h:280,xr:[-0.6,7.6],yr:[0,0.62],
    xlabel:'k', ylabel:'|\\tilde a_{k}|^{2}',
    pad:{l:74,r:26,t:28,b:46}, xtarget:8, yticksOverride:[0,0.125,0.25,0.375,0.5]});
  a.stem(pts,{color:C.in,r:5,width:2.4});
  a.point(2,amp(2),{color:C.out,r:8});
  a.note(2.2,0.56,'\\text{one run returns } k=2',{fs:13,color:C.out,anchor:'start',tex:true});
  a.note(3.2,0.44,'\\text{eight numbers exist}',{fs:13,color:C.in,anchor:'start',tex:true});
  return a.svg();
}

/* The phase-estimation circuit with q0 on the top wire: counting qubit j
   controls U raised to 2^j, so the top wire applies U once and the third
   applies it four times. Then the inverse transform and the readings. */
function figQPE(){
  const Y = [40,88,136,196];
  const items = [
    wire(Y[0],60,448), wire(Y[1],60,448), wire(Y[2],60,448), wire(Y[3],60,392),
    {t:'text',x:52,y:Y[0]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:15},
    {t:'text',x:52,y:Y[1]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:15},
    {t:'text',x:52,y:Y[2]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:15},
    {t:'text',x:52,y:Y[3]+5,anchor:'end',label:'|u\\rangle',tex:true,fs:15},
    gate(92,Y[0],'H',true), gate(92,Y[1],'H',true), gate(92,Y[2],'H',true),
    {t:'line',d:`M148,${Y[0]} V${Y[3]-17}`,color:C.h}, ctrl(148,Y[0]),
    gate(148,Y[3],'U',true,40),
    {t:'line',d:`M206,${Y[1]} V${Y[3]-17}`,color:C.h}, ctrl(206,Y[1]),
    gate(206,Y[3],'U^{2}',true,48),
    {t:'line',d:`M266,${Y[2]} V${Y[3]-17}`,color:C.h}, ctrl(266,Y[2]),
    gate(266,Y[3],'U^{4}',true,48),
    {t:'box',x:308,y:20,w:62,h:136,label:'F^{\\dagger}',tex:true,fs:19,color:C.mid},
    meter(420,Y[0]), meter(420,Y[1]), meter(420,Y[2]),
    {t:'text',x:500,y:Y[1]+5,anchor:'middle',label:'y',tex:true,fs:17,color:C.out},
    {t:'text',x:470,y:Y[3]+5,anchor:'middle',label:'\\varphi \\approx y/2^{t}',tex:true,fs:15,color:C.out}
  ];
  return growBlocks({w:560,h:222,items});
}

/* The exact case: a phase that is a whole number of steps, and every wrong
   outcome cancelling to nothing. */
function figQPEexact(){
  const t = 3, Q = 8, phi = 3/8;
  const pts=[]; for(let y=0;y<Q;y++) pts.push([y, qpeProb(phi,t,y)]);
  const a = P.Axes({w:560,h:280,xr:[-0.6,7.6],yr:[0,1.34],
    xlabel:'y', ylabel:'P(y)',
    pad:{l:70,r:26,t:30,b:48}, xtarget:8, yticksOverride:[0,0.25,0.5,0.75,1]});
  a.stem(pts,{color:C.in,r:5,width:2.4,showZero:true});
  a.point(3,1,{color:C.out,r:7.5});
  a.note(3.3,1.16,'y=3,\\; \\varphi = 3/8',{fs:13,color:C.out,anchor:'start',tex:true});
  a.note(4.2,0.36,'\\text{seven are exactly }0',{fs:13,color:C.in,anchor:'start',tex:true});
  return a.svg();
}

/* The inexact case, at two register sizes: the mass concentrates and the
   answer is still only very probable. */
function figQPEprec(){
  const phi = 0.3;
  /* The frame reaches to 1.40 because the six-qubit peak is 0.875 and a stem
     is drawn outside the clip: a range that stopped at 0.78 would let the one
     peak this figure exists to show run off the top of the frame. */
  const a = P.Axes({w:560,h:280,xr:[-0.02,1.02],yr:[0,1.40],
    xlabel:'y/2^{t}', ylabel:'P',
    pad:{l:70,r:26,t:30,b:48}, xtarget:5, yticksOverride:[0,0.25,0.5,0.75,1]});
  const draw = (t,col,r) => { const Q=1<<t, pts=[];
    for(let y=0;y<Q;y++) pts.push([y/Q, qpeProb(phi,t,y)]);
    a.stem(pts,{color:col,r,width:1.8,showZero:true}); };
  draw(3,C.in,4.6);
  draw(6,C.out,3.0);
  a.vline(phi,{color:C.err,width:1.6,dash:'4 4'});
  a.note(0.32,1.06,'\\varphi = 0.3',{fs:13,color:C.err,anchor:'start',tex:true});
  a.note(0.50,1.30,'t=3\\text{: coarse}',{fs:13,color:C.in,anchor:'start',tex:true});
  a.note(0.50,1.14,'t=6\\text{: tighter, still spread}',{fs:13,color:C.out,anchor:'start',tex:true});
  return a.svg();
}

/* Where the cost is: the controlled powers, against the transform that reads
   them. Both axes are counts, and the vertical one is logarithmic because the
   two differ by three decades before the register is large. */
function figQPEcost(){
  const a = P.Axes({w:560,h:280,xr:[2,14],yr:[0,4.4],
    xlabel:'t\\,(\\text{counting qubits})', ylabel:'\\text{operations}',
    pad:{l:78,r:26,t:30,b:48}, xtarget:6,
    yticksOverride:P.decades(0,4), ytickfmt:P.decade});
  a.curve(t => Math.log10(Math.pow(2,t)-1), {color:C.err,width:2.6});
  a.curve(t => Math.log10(t*(t+1)/2), {color:C.out,width:2.6});
  a.note(5.6,3.9,'\\text{uses of } U:\\; 2^{t}-1',{fs:13,color:C.err,anchor:'start',tex:true});
  a.note(6.4,0.66,'\\text{gates in } F^{\\dagger}:\\; \\tfrac12 t(t+1)',{fs:13,color:C.out,anchor:'start',tex:true});
  a.point(10,Math.log10(1023),{color:C.err,r:6});
  a.point(10,Math.log10(55),{color:C.out,r:6});
  a.note(10.3,2.72,'1023',{fs:13,color:C.err,anchor:'start'});
  a.note(10.3,1.94,'55',{fs:13,color:C.out,anchor:'start'});
  return a.svg();
}

/* Quantum counting: the same estimator pointed at the Grover iteration, so
   that the number of marked candidates comes out before the search is run. */
function figCount(){
  return growBlocks({w:560,h:150,items:[
    {t:'box',x:12,y:30,w:150,h:54,label:'the Grover step',fs:14,color:C.h},
    {t:'arrow',x1:162,y1:57,x2:205,y2:57},
    {t:'box',x:205,y:30,w:150,h:54,label:'phase estimation',fs:14,color:C.mid},
    {t:'arrow',x1:355,y1:57,x2:398,y2:57},
    {t:'box',x:398,y:30,w:150,h:54,label:'\\text{an estimate of }M',tex:true,fs:14,color:C.out},
    {t:'text',x:87,y:116,label:'e^{\\pm 2i\\theta}',tex:true,fs:16},
    {t:'text',x:280,y:116,label:'\\text{reads }\\theta',tex:true,fs:15},
    {t:'text',x:473,y:116,label:'M = N\\sin^{2}\\theta',tex:true,fs:15}
  ]});
}

/* The order of a modulo N, as the thing that repeats. */
function figOrder(){
  const N = 15, a0 = 2, r = orderOf(a0,N);
  const pts=[]; let x=1;
  for(let k=0;k<=12;k++){ pts.push([k,x]); x=(x*a0)%N; }
  const a = P.Axes({w:560,h:280,xr:[0,12],yr:[0,15.8],
    xlabel:'k', ylabel:'2^{k} \\bmod 15',
    pad:{l:70,r:26,t:30,b:48}, xtarget:6, yticksOverride:[0,4,8,12]});
  a.stem(pts,{color:C.in,r:5,width:2.0});
  [0,4,8,12].forEach(k=>a.point(k,1,{color:C.out,r:7}));
  a.span(0,4,13.6,'r = '+r,{color:C.out,fs:14,tex:true});
  a.note(5.2,13.0,'\\text{the period is the order}',{fs:13,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* Where the order hides: the eigenphases of the multiplication operator are
   the r fractions s/r, and the state the circuit actually starts in is their
   even mixture. */
function figOrderEig(){
  const r = 4;
  const a = P.Axes({w:560,h:280,xr:[-0.06,1.06],yr:[0,1.30],
    xlabel:'\\varphi', ylabel:'\\text{weight}',
    pad:{l:70,r:26,t:30,b:48}, xtarget:5, yticksOverride:[0,0.25,0.5,0.75,1]});
  const pts=[]; for(let s=0;s<r;s++) pts.push([s/r, 1/r]);
  a.stem(pts,{color:C.in,r:6,width:2.4});
  /* The first name starts at its stem rather than centring on it, so that it
     clears the axis and the tick labels to its left. */
  ['0','\\tfrac14','\\tfrac12','\\tfrac34'].forEach((L,s)=>
    a.note(s/r+(s?0:0.015),0.40,'\\varphi='+L,{fs:13,color:C.in,anchor:s?'middle':'start',tex:true}));
  a.note(0.02,1.18,'\\text{each drawn with probability } 1/r',{fs:13,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* The cost of the whole order-finding circuit, and where it sits: the
   modular exponentiation, and not the transform that reads it. */
function figModexp(){
  const a = P.Axes({w:560,h:280,xr:[0,2600],yr:[2,13.4],
    xlabel:'L\\,(\\text{bits of }N)', ylabel:'\\text{gates}',
    pad:{l:78,r:26,t:30,b:48}, xtarget:5,
    yticksOverride:P.decades(2,11).filter(v=>v%2===0), ytickfmt:P.decade});
  a.curve(L => L>0 ? 3*Math.log10(L) + Math.log10(4) : null, {color:C.err,width:2.6});
  a.curve(L => L>0 ? 2*Math.log10(2*L) : null, {color:C.out,width:2.6});
  /* Both names sit clear of the curves: the arithmetic tops out at 10.8 and
     the frame reaches 13.4, and the transform's name sits under its curve. */
  a.note(120,12.2,'\\text{modular exponentiation: } L^{3}',{fs:13,color:C.err,anchor:'start',tex:true});
  a.note(1180,5.2,'\\text{the transform: } L^{2}',{fs:13,color:C.out,anchor:'start',tex:true});
  a.vline(2048,{color:C.rule,width:1.3,dash:'3 4'});
  a.note(2048,2.9,'L=2048',{fs:13,color:C.muted,anchor:'middle',tex:true});
  return a.svg();
}

/* Continued fractions: the measured fraction, and the ladder that turns it
   into the small denominator hiding inside it. */
function figCF(){
  const items = [
    {t:'text',x:280,y:30,anchor:'middle',label:'\\frac{y}{Q} = \\frac{85}{512} = 0.166016\\ldots',tex:true,fs:18,color:C.in},
    {t:'text',x:90,y:78,anchor:'middle',label:'step',fs:14},
    {t:'text',x:230,y:78,anchor:'middle',label:'quotient',fs:14},
    {t:'text',x:380,y:78,anchor:'middle',label:'convergent',fs:14},
    {t:'line',d:'M20,90 H540',color:C.rule}
  ];
  [['1','0','0/1'],['2','6','1/6'],['3','42','42/253']].forEach(([k,q,c],i)=>{
    const y = 120 + i*34, hit = i===1;
    items.push({t:'text',x:90,y,anchor:'middle',label:k,fs:15});
    items.push({t:'text',x:230,y,anchor:'middle',label:q,fs:15});
    items.push({t:'text',x:380,y,anchor:'middle',label:c,tex:true,fs:16,color:hit?C.out:C.muted});
  });
  items.push({t:'text',x:448,y:154,anchor:'start',label:'\\leftarrow r=6',tex:true,fs:16,color:C.out});
  return growBlocks({w:560,h:204,items});
}

/* The failure modes, and what each of them costs: a run that fails is
   detected and repeated, and none of the repairs is quantum. */
function figRepeat(){
  /* The colour marks the repair and not the row, because the repair is what
     the third column is about: amber for a run that is simply repeated, red
     for one that costs a whole base, green for the one that finishes. Two
     rows share a repair and therefore share a colour. */
  const rows = [
    ['s=0','\\text{nothing about }r','run again',C.h],
    ['\\gcd(s,r)>1','\\text{a divisor of }r','run again',C.h],
    ['r\\text{ odd}','\\text{no square root}','new base',C.err],
    ['a^{r/2} \\equiv -1','\\text{trivial divisors}','new base',C.err],
    ['\\text{otherwise}','\\text{two factors}','done',C.out]
  ];
  const items = [
    {t:'text',x:100,y:28,anchor:'middle',label:'what went wrong',fs:14},
    {t:'text',x:300,y:28,anchor:'middle',label:'what comes out',fs:14},
    {t:'text',x:470,y:28,anchor:'middle',label:'what to do',fs:14},
    {t:'line',d:'M12,40 H548',color:C.rule}
  ];
  rows.forEach(([a,b,c,col],i)=>{
    const y = 70 + i*34;
    items.push({t:'text',x:100,y,anchor:'middle',label:a,tex:true,fs:15,color:col});
    items.push({t:'text',x:300,y,anchor:'middle',label:b,tex:true,fs:15});
    items.push({t:'text',x:470,y,anchor:'middle',label:c,fs:14,color:col});
  });
  return growBlocks({w:560,h:222,items});
}

/* The workflow, with the one quantum box marked and everything else in the
   tone of the classical work it is. */
function figShor(){
  const steps = [
    ['choose a base, take one gcd','classical'],
    ['find the order of the base','quantum'],
    ['continued fractions','classical'],
    ['confirm the order','classical'],
    ['two more gcds','classical']
  ];
  const items = [];
  steps.forEach(([txt,kind],i)=>{
    const y = 14 + i*40, q = kind==='quantum';
    items.push({t:'box',x:40,y,w:300,h:30,label:txt,fs:14,color:q?C.h:C.rule});
    items.push({t:'text',x:364,y:y+20,anchor:'start',label:kind,fs:14,color:q?C.h:C.muted});
    if(i<4) items.push({t:'line',d:`M190,${y+30} V${y+40}`,color:C.rule});
  });
  return growBlocks({w:560,h:212,items});
}

/* The whole of N = 15 with a = 2, worked, so that the classical steps can be
   checked by hand and the quantum step can be seen to be one of five. */
function figShor15(){
  const N = 15, a0 = 2, r = orderOf(a0,N);
  const half = Math.pow(a0,r/2);
  return growBlocks({w:560,h:236,items:[
    {t:'text',x:280,y:30,anchor:'middle',label:'N = 15, \\quad a = 2, \\quad \\gcd(2,15) = 1',tex:true,fs:16,color:C.in},
    {t:'text',x:280,y:70,anchor:'middle',label:'2^{0},\\ldots,2^{4} \\equiv 1,\\,2,\\,4,\\,8,\\,1 \\pmod{15}',tex:true,fs:16},
    {t:'text',x:280,y:106,anchor:'middle',label:'r = '+r+'\\text{, even}',tex:true,fs:16,color:C.h},
    {t:'text',x:280,y:142,anchor:'middle',label:'2^{r/2} = '+half+' \\not\\equiv -1 \\pmod{15}',tex:true,fs:16,color:C.h},
    {t:'text',x:160,y:182,anchor:'middle',label:'\\gcd('+(half-1)+',15) = '+gcd(half-1,N),tex:true,fs:16,color:C.out},
    {t:'text',x:400,y:182,anchor:'middle',label:'\\gcd('+(half+1)+',15) = '+gcd(half+1,N),tex:true,fs:16,color:C.out},
    {t:'text',x:280,y:220,anchor:'middle',label:'15 = 3 \\times 5',tex:true,fs:17,color:C.out}
  ]});
}

/* What the result threatens and what it does not. */
function figRSA(){
  return growBlocks({w:560,h:196,items:[
    {t:'box',x:12,y:22,w:270,h:42,label:'RSA, Diffie-Hellman, ECC',fs:14,color:C.err},
    {t:'text',x:147,y:86,label:'broken, once the machine exists',fs:13,color:C.err},
    {t:'box',x:12,y:112,w:270,h:42,label:'AES and hash functions',fs:14,color:C.out},
    {t:'text',x:147,y:176,label:'a square root: longer keys',fs:13,color:C.out},
    {t:'box',x:306,y:22,w:242,h:132,label:'',color:C.rule},
    {t:'text',x:427,y:56,label:'why move now',fs:15,color:C.h},
    {t:'text',x:427,y:90,label:'recorded today',fs:14},
    {t:'text',x:427,y:116,label:'decrypted later',fs:14}
  ]});
}

/* Shor's claim, laid against the five things a claim has to name. */
function figShorClaim(){
  const rows = [
    ['task','\\text{factor an }L\\text{-bit } N = pq',C.h,true],
    ['input model','the number itself, nothing to load',C.h],
    ['accuracy','constant, checked classically',C.h],
    ['hardware model','fault tolerant, millions of qubits',C.err],
    ['baseline','\\text{number field sieve: } e^{c\\,L^{1/3}(\\log L)^{2/3}}',C.err,true]
  ];
  const items = [];
  rows.forEach(([k,v,col,tex],i)=>{
    const y = 14 + i*40;
    items.push({t:'box',x:12,y,w:146,h:32,label:k,fs:14,color:col});
    items.push({t:'text',x:172,y:y+21,anchor:'start',label:v,tex:!!tex,fs:14});
  });
  /* The two boxes in the error tone are the last two, and the caption beside
     this figure says two. A caption that names a count has to match what the
     figure marks. */
  return growBlocks({w:560,h:214,items});
}

/* The family the one move belongs to. Order finding sits inside period
   finding with factoring in it; the discrete logarithm is a period-finding
   problem in two variables and so sits beside order finding, not inside it. */
function figFamily(){
  return growBlocks({w:560,h:236,items:[
    {t:'box',x:12,y:14,w:536,h:190,label:'',color:C.rule},
    {t:'text',x:280,y:40,label:'the hidden subgroup problem',fs:15,color:C.muted},
    {t:'box',x:40,y:56,w:480,h:136,label:'',color:C.mid},
    {t:'text',x:280,y:82,label:'period finding',fs:15,color:C.mid},
    {t:'box',x:62,y:98,w:236,h:80,label:'',color:C.in},
    {t:'text',x:180,y:128,label:'order finding',fs:15,color:C.in},
    {t:'text',x:180,y:156,label:'factoring',fs:14,color:C.in},
    {t:'text',x:410,y:142,label:'discrete logarithms',fs:14,color:C.mid},
    {t:'text',x:280,y:226,label:'Grover sits outside every box',fs:14,color:C.err}
  ]});
}

/* The chapter as one ladder. The sentence that closes it is the caption. */
function figLadder(){
  return P.blocks({w:760,h:146,items:[
    {t:'box',x:24,y:44,w:150,h:56,label:'a phase',fs:13,color:C.in},
    {t:'arrow',x1:174,y1:72,x2:214,y2:72},
    {t:'box',x:214,y:44,w:150,h:56,label:'interference',fs:13,color:C.h},
    {t:'arrow',x1:364,y1:72,x2:404,y2:72},
    {t:'box',x:404,y:44,w:150,h:56,label:'a number read',fs:13,color:C.out},
    {t:'arrow',x1:554,y1:72,x2:594,y2:72},
    {t:'box',x:594,y:44,w:146,h:56,label:'a claim',fs:13,color:C.mid},
    {t:'text',x:99,y:124,label:'kickback writes it',fs:12},
    {t:'text',x:289,y:124,label:'the wrong answers cancel',fs:12},
    {t:'text',x:479,y:124,label:'one index, not a spectrum',fs:12},
    {t:'text',x:667,y:124,label:'five things, or nothing',fs:12}
  ]});
}

const SC = [

/* ---------------------------------------------------------------- 6.0.1 -- */
{ id:'m6-open', module:'M6', nav:'One mechanism, four uses', title:'Quantum Algorithms',
  objective:'State the one mechanism this chapter is built on and the sentence every algorithm in it has to answer.',
  keywords:'quantum algorithms overview module 6 phase kickback interference cancellation deutsch jozsa fourier phase estimation shor introduction',
  src:'L10 · computational models: what is being counted?', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Quantum algorithms'},
  {t:'title', text:'Quantum Algorithms'},
  {t:'lede', text:'A quantum computer does not try every answer at once. It holds many amplitudes, and a measurement returns one string of bits. An algorithm earns something only if it can arrange for the amplitudes of the answers it does not want to cancel before that measurement happens. This chapter is four ways of arranging exactly that, and they are all the same arrangement.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The mechanism is called <b>phase kickback</b>. An operation is written to change one register; it is pointed instead at a register already prepared in a state that operation cannot move; and so the only thing it can do is write a phase onto the register that controlled it.</p>'},
    {t:'body', html:'<p>That is the whole of Deutsch, of Deutsch–Jozsa, of phase estimation and of the order finding inside Shor\u2019s algorithm. What differs between them is which question was written into the phase and which transform was used to make the wrong answers cancel afterwards.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The sentence every scene here answers', html:'Preparing a superposition of $2^{n}$ inputs is one layer of Hadamards, it is free, and on its own it is worth <b>nothing</b>: a measurement of that state returns a uniformly random string, which is what a coin does. Every gain in this chapter comes from the interference after the query, never from the superposition before it.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOpen(),
      caption:'Four steps and four algorithms. The first step is free and the last step is small; the middle two are where the work is, and they are the same two in every column.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What the chapter refuses to say', html:'The quantum Fourier transform does not return a spectrum: it produces amplitudes that still have to be measured, and a measurement returns one index. And Shor\u2019s algorithm is not a quantum algorithm for factoring: its only quantum step is order finding, and the arithmetic, the continued fractions and the repetition around it are classical. Chapter 5\u2019s five-part resource claim is applied to both.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.1.1 -- */
{ id:'m6-query', module:'M6', nav:'What a query counts', title:'A query count is one number, and it is not the cost of anything',
  objective:'Distinguish query complexity, gate complexity and end-to-end cost, and say what each one omits.',
  keywords:'query model oracle black box query complexity gate complexity end to end cost separation counting calls resource claim',
  src:'L10 · computational models: what is being counted?', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · What a query model counts'},
  {t:'title', text:'A query count is one number, and it is not the cost of anything'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figQuery(),
      caption:'The same box, counted three ways. A separation in the first column is a real theorem; it becomes a saving in seconds only when the other two are filled in.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'"Exponential" needs its qualifiers', html:'Deutsch\u2013Jozsa has an exponential separation in <b>exact</b> query complexity <b>under a promise</b>. Remove any one of those words and the statement is false.'}]}
  ], right:[
    {t:'eq', key:true, label:'A query', tex:'U_{f}\\,|x\\rangle|y\\rangle = |x\\rangle\\,|y \\oplus f(x)\\rangle',
      note:'The algorithm is charged one query each time it uses the box, whatever is inside. The exclusive-or keeps the box reversible; chapter 4 built this embedding. What the box costs to build, to load with data and to protect from errors is not counted.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\text{quantum: } 25 \\times 4000 &= 10^{5}\\text{ gates} \\\\ \\text{classical: } 512 \\times 30 &= 1.54\\times10^{4}\\text{ operations} \\end{aligned}',
        note:'Twenty times fewer queries, and about six times more work. Both numbers are right. The query saving becomes a real one only when the problem is large enough for $\\sqrt{N}$ against $N$ to beat the ratio of the two query costs.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A quantum method needs $1000$ queries at $2000$ gates each. A classical method needs $10^{6}$ queries at $50$ operations each.<div class="nsep"></div>Which run does less work in total?',
        ask:{key:'m6-query', choices:['quantum: $2\\times10^{6}$ against $5\\times10^{7}$','classical: its query is cheaper','they tie'], answer:0,
          why:'$1000\\times2000 = 2\\times10^{6}$ and $10^{6}\\times50 = 5\\times10^{7}$. Here the query saving pays for the dearer query, with a factor of $25$ to spare.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.1.2 -- */
{ id:'m6-classes', module:'M6', nav:'What the classes mean', title:'The classes name what is settled in polynomial time, and P is inside all of them',
  objective:'State what P, BPP, BQP and NP contain, and which containments are known.',
  keywords:'complexity classes P BPP BQP NP decision problem polynomial time bounded error containment factoring np complete input length',
  src:'L10 · computational models: what is being counted?', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · What a query model counts'},
  {t:'title', text:'The classes name what is settled in polynomial time, and P is inside all of them'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figClasses(),
      caption:'Four separate classes and the containments that are known. Not a Venn diagram: a nested picture would assert something about every pair, and two of the pairs are open questions.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'"Quantum computers solve NP-complete problems" is false as far as anyone knows', html:'The known fast quantum algorithms need hidden algebraic structure: a period, an order, a discrete logarithm. Grover gives a square root on search, and the square root of an exponential is still an exponential.'}]}
  ], right:[
    {t:'eq', key:true, label:'What is known', tex:'\\mathrm{P} \\subseteq \\mathrm{BPP} \\subseteq \\mathrm{BQP}, \\qquad \\mathrm{P} \\subseteq \\mathrm{NP}, \\qquad \\mathrm{NP} \\subseteq \\mathrm{BQP}\\ ?',
      note:'Each class promises polynomial time in the <b>bit length</b> of the input. BPP may toss coins and err below one third, BQP is its quantum version, and NP asks only that a yes answer can be <b>checked</b> quickly. Whether NP sits inside BQP is open.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'2048 \\text{ bits: } \\quad \\text{trial division} \\approx 2^{1024} \\text{ steps}, \\qquad \\text{Shor: polynomial in } 2048',
        note:'Factoring is in NP and in BQP and is not known to be NP-complete. Checking a factor is fast; finding one is the question.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'An algorithm takes $N$ steps on the input number $N$, and $N$ is written in $40$ bits.<div class="nsep"></div>In the size of its input, the algorithm is:',
        ask:{key:'m6-classes', choices:['exponential: up to $2^{40}\\approx1.1\\times10^{12}$ steps','linear: $N$ steps for the input $N$','polynomial, of degree $40$'], answer:0,
          why:'The input is $40$ bits long and $N$ can be as large as $2^{40}$. Time linear in the value of a number is exponential in its length.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m6-code-query', module:'M6', nav:'Code · What a query model counts', title:'What a query model counts in code',
  objective:'Build an oracle as a permutation, count the queries a tester makes, and price a randomised one.',
  keywords:'code qiskit numpy program oracle permutation query count exact randomised tester error',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 6 · What a query model counts'},
  {t:'title', text:'What a query model counts in code'},
  {t:'raw', html:()=>CODEBANK.page('m6-code-query')}
]},

/* ---------------------------------------------------------------- 6.2.1 -- */
{ id:'m6-kick', module:'M6', nav:'Phase kickback', title:'Point the oracle at the state it cannot change and it writes a phase instead',
  objective:'Derive phase kickback for a Boolean oracle and say why the target register is left untouched.',
  keywords:'phase kickback minus state eigenstate of x oracle boolean function sign relative phase mechanism ancilla unchanged',
  src:'L10 · phase kickback and the Deutsch-Jozsa proof', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · One mechanism'},
  {t:'title', text:'Point the oracle at the state it cannot change and it writes a phase instead'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figKick(),
      caption:'The oracle acts, the lower wire comes out exactly as it went in, and the answer is a sign on the upper one. Nothing was measured and nothing was copied.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The sign lands on the first register', html:'The sign multiplies a term of the whole state. The second factor is the same $|{-}\\rangle$ in every term, so the sign can only make a difference between the terms of the first.'}]}
  ], right:[
    {t:'eq', key:true, label:'Kickback', tex:'\\begin{aligned} X\\,|{-}\\rangle &= -\\,|{-}\\rangle \\\\ U_{f}\\,|x\\rangle|{-}\\rangle &= (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle \\end{aligned}',
      note:'The oracle writes $f(x)$ by flipping the target, and $|{-}\\rangle$ is the state a flip leaves alone up to a sign. When $f(x)=0$ nothing happens; when $f(x)=1$ the sign appears. The target never changes, and $f$ is now a relative phase on the first register, observable through interference.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'f(x) = x: \\quad |{+}\\rangle|{-}\\rangle \\;\\xrightarrow{\\;U_{f}\\;}\\; |{-}\\rangle|{-}\\rangle \\;\\xrightarrow{\\;H\\;}\\; |1\\rangle|{-}\\rangle',
        note:'The query signs the $|1\\rangle$ term, so the query qubit moves from $|{+}\\rangle$ to $|{-}\\rangle$ and a Hadamard reads $1$ with certainty. With $f(x)=0$ nothing moves, and the Hadamard returns $|0\\rangle$ every time.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Two query qubits in $|{+}\\rangle|{+}\\rangle$, the target in $|{-}\\rangle$, and $f(x_{1},x_{0}) = x_{1}\\text{ AND }x_{0}$.<div class="nsep"></div>Which terms of the query register pick up a minus sign?',
        ask:{key:'m6-kick', choices:['only $|11\\rangle$','$|01\\rangle$ and $|10\\rangle$','all four, as a global sign'], answer:0,
          why:'$f$ is $1$ only at $x=11$, so one query gives $\\tfrac12\\big(|00\\rangle+|01\\rangle+|10\\rangle-|11\\rangle\\big)|{-}\\rangle$. One sign in four is a relative phase.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.2.2 -- */
{ id:'m6-eigen', module:'M6', nav:'The general form', title:'The same move with any unitary: an eigenstate sends its phase up to the control',
  objective:'Show that a controlled unitary acting on one of its eigenstates writes the eigenphase onto the control qubit.',
  keywords:'controlled unitary eigenstate eigenphase kickback general form control qubit relative phase estimation preparation',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · One mechanism'},
  {t:'title', text:'The same move with any unitary: an eigenstate sends its phase up to the control'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figEigen(),
      caption:'One controlled gate. The lower wire is unchanged and the upper one has picked up the eigenvalue as a relative phase, the kind of number this course can read.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'This needs an eigenstate', html:'Given a superposition $\\sum_{k}c_{k}|u_{k}\\rangle$ instead, the procedure returns $\\varphi_{k}$ with probability $|c_{k}|^{2}$. It samples one eigenphase; it does not list the spectrum.'}]}
  ], right:[
    {t:'eq', key:true, label:'Kickback, general form', tex:'\\begin{aligned} U\\,|u\\rangle &= e^{2\\pi i \\varphi}\\,|u\\rangle, \\qquad 0 \\le \\varphi < 1 \\\\ \\mathrm{c}U\\,\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+|1\\rangle\\big)|u\\rangle &= \\tfrac{1}{\\sqrt2}\\big(|0\\rangle+e^{2\\pi i \\varphi}|1\\rangle\\big)|u\\rangle \\end{aligned}',
      note:'The Boolean case used only that the target was an eigenstate of the flip. A unitary has eigenvalues of modulus one, so each is a pure phase. The target is untouched, and the eigenphase is a relative phase on the control, which a Hadamard turns into a probability.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'U = T,\\ |u\\rangle = |1\\rangle: \\quad T|1\\rangle = e^{i\\pi/4}|1\\rangle, \\qquad \\varphi = \\tfrac18',
        note:'The control comes out as $\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+e^{i\\pi/4}|1\\rangle\\big)$, on the equator at azimuth $45^{\\circ}$. In binary $\\varphi = 0.001$, so three counting qubits should read it exactly; phase estimation does that.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$U = S = \\operatorname{diag}(1, i)$, the control in $|{+}\\rangle$, and the target in $|0\\rangle$.<div class="nsep"></div>What is the control after the controlled-$S$?',
        ask:{key:'m6-eigen', choices:['$|{+}\\rangle$, unchanged: here $\\varphi = 0$','$\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+i|1\\rangle\\big)$','entangled with the target'], answer:0,
          why:'$S|0\\rangle = |0\\rangle$, so the eigenvalue is $1$ and $\\varphi = 0$. The phase $i$ belongs to the other eigenstate, $|1\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.2.3 -- */
{ id:'m6-cancel', module:'M6', nav:'Why a superposition is free', title:'A superposition costs one layer and buys nothing until the wrong terms cancel',
  objective:'Explain why quantum parallelism alone gives no advantage, and what interference has to do before a measurement is worth taking.',
  keywords:'quantum parallelism superposition free interference cancellation readout small state large amplitudes measurement one string',
  src:'L10 · phase kickback and the Deutsch-Jozsa proof', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · One mechanism'},
  {t:'title', text:'A superposition costs one layer and buys nothing until the wrong terms cancel'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCancel(),
      caption:'Sixteen amplitudes before the last layer of Hadamards and one after it, for a balanced function on four bits. The first picture is worth nothing; the second is the whole answer.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'"It computes all the values in parallel" is true and useless', html:'The only way to look at the superposition is to measure it, and $2^{n}$ equal amplitudes measure as a random number. The question is which arrangement of phases lets one number survive the sum.'}]}
  ], right:[
    {t:'eq', key:true, label:'What the last layer computes', tex:'\\langle 0^{n}|\\,H^{\\otimes n}\\Big(\\tfrac{1}{2^{n/2}}\\textstyle\\sum_{x}(-1)^{f(x)}|x\\rangle\\Big) = \\frac{1}{2^{n}}\\sum_{x}(-1)^{f(x)}',
      note:'One layer of Hadamards and one query produce every output at once, all with the same modulus. Measured now, the state gives a uniformly random string and the signs are invisible. The last layer adds the signed amplitudes, so a plus and a minus destroy each other and one global property of $f$ survives.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'n = 4,\\ f = \\text{parity}: \\quad 16 \\text{ amplitudes } \\pm\\tfrac14 \\;\\xrightarrow{\\;H^{\\otimes 4}\\;}\\; |1111\\rangle',
        note:'After the last layer one string carries all the probability and fifteen carry none, and $0000$ is never printed. That cancellation is the answer.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$n = 3$, and $f(x) = 1$ on the two inputs $000$ and $001$ only.<div class="nsep"></div>What is the probability of reading $000$?',
        ask:{key:'m6-cancel', choices:['$\\tfrac14$','$0$','$\\tfrac34$'], answer:0,
          why:'Six signs are $+$ and two are $-$, so the mean is $\\tfrac{6-2}{8} = \\tfrac12$ and the probability is its square. This $f$ is neither constant nor balanced, and the reading proves nothing.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m6-code-kick', module:'M6', nav:'Code · One mechanism', title:'Phase kickback in code',
  objective:'Watch an oracle write a sign, a controlled gate write an eigenphase, and interference turn signs into one string.',
  keywords:'code qiskit numpy program phase kickback oracle sign eigenstate controlled phase interference',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 6 · One mechanism'},
  {t:'title', text:'Phase kickback in code'},
  {t:'raw', html:()=>CODEBANK.page('m6-code-kick')}
]},

/* ---------------------------------------------------------------- 6.3.1 -- */
{ id:'m6-deutsch', module:'M6', nav:'Deutsch\u2019s problem', title:'One query decides a property that two are needed for classically',
  objective:'State Deutsch\u2019s promise problem, run the three-gate circuit, and say exactly what the reading means.',
  keywords:'deutsch algorithm promise problem constant balanced one query four functions circuit hadamard oracle single bit',
  src:'L10 · Deutsch\u2019s promise problem', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Deutsch and Deutsch\u2013Jozsa'},
  {t:'title', text:'One query decides a property that two are needed for classically'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figDeutsch(),
      caption:'The circuit and the four promised functions. Each pair gives the same reading, because the reading is the property and not the function.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'What this result is', html:'One query saved on a problem with four instances is not a useful computation. It is the smallest complete example of the mechanism: a promise, a query answered into a phase, and interference that turns the phase into a certain bit.'}]}
  ], right:[
    {t:'eq', key:true, label:'Deutsch', tex:'\\tfrac{1}{\\sqrt2}\\Big((-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\Big) \\;\\xrightarrow{\\;H\\;}\\; \\pm\\,|\\,f(0)\\oplus f(1)\\,\\rangle',
      note:'Two of the four functions $f:\\{0,1\\}\\to\\{0,1\\}$ are constant and two are balanced; the task is to say which class, not which function. Classically that needs both values. Prepare $|{+}\\rangle|{-}\\rangle$, query once, apply a Hadamard: the reading is $f(0)\\oplus f(1)$, the one bit asked for.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'f(x) = x: \\quad |{+}\\rangle \\;\\xrightarrow{\\;U_{f}\\;}\\; |{-}\\rangle \\;\\xrightarrow{\\;H\\;}\\; |1\\rangle',
        note:'The oracle is a CNOT from the query qubit to the target. Every ideal shot reads $1$: balanced. The target stays $|{-}\\rangle$, unentangled, and measuring it would give a fair coin.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The balanced oracle $f(x) = x$ again, but the target is prepared in $|1\\rangle$, with no Hadamard on it.<div class="nsep"></div>What does the query qubit read?',
        ask:{key:'m6-deutsch', choices:['a fair coin','$1$, every shot','$0$, every shot'], answer:0,
          why:'The CNOT turns $|{+}\\rangle|1\\rangle$ into $\\tfrac{1}{\\sqrt2}\\big(|0\\rangle|1\\rangle+|1\\rangle|0\\rangle\\big)$, which is entangled. $|1\\rangle$ is not an eigenstate of the flip, nothing is kicked back, and the reading is $0$ or $1$ with probability $\\tfrac12$ each.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.3.2 -- */
{ id:'m6-dj', module:'M6', nav:'Deutsch\u2013Jozsa', title:'The same circuit on n bits, and every balanced function cancels exactly',
  objective:'Run the Deutsch-Jozsa circuit on n query qubits and evaluate the amplitude of the all-zero string.',
  keywords:'deutsch jozsa n qubits balanced constant promise all zero string amplitude mean of signs certainty hadamard transform',
  src:'L10 · extending Deutsch\u2019s algorithm to n inputs', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Deutsch and Deutsch\u2013Jozsa'},
  {t:'title', text:'The same circuit on n bits, and every balanced function cancels exactly'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figDJ(),
      caption:'Four promised functions on three bits and the mean of their signs. The balanced rows cancel term by term; the promise is what guarantees it.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The promise is not decoration', html:'For a function that is neither constant nor balanced the amplitude of $0^{n}$ lies between $-1$ and $1$, and no reading proves anything. Stating the promise is part of stating the result.'}]}
  ], right:[
    {t:'eq', key:true, label:'The all-zero amplitude', tex:'a_{0^{n}} = \\frac{1}{2^{n}}\\sum_{x\\in\\{0,1\\}^{n}} (-1)^{f(x)}',
      note:'The promise: $f$ is constant, or it is $1$ on exactly half its $2^{n}$ inputs. The circuit is Deutsch\u2019s on $n$ query qubits. A constant $f$ makes the mean $\\pm1$, so $0^{n}$ is read with certainty; a balanced $f$ makes it exactly zero, so $0^{n}$ is never read.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'n = 2,\\ f = x_{0}\\oplus x_{1}: \\quad a_{00} = \\tfrac14(1-1-1+1) = 0, \\qquad \\text{reading } 11',
        note:'The signs $+,-,-,+$ make the state before the last Hadamards $|{-}\\rangle|{-}\\rangle$, and the Hadamards send it to $|11\\rangle$. A constant oracle, the empty circuit, prints $00$ every time.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$n = 3$ and the balanced oracle $f(x) = x_{0}\\oplus x_{2}$.<div class="nsep"></div>Which string does every ideal shot print?',
        ask:{key:'m6-dj', choices:['$101$','$000$','$010$'], answer:0,
          why:'The parity of the bits picked out by $s = 101$ puts the sign $(-1)^{x\\cdot s}$ on each term, and the Hadamards send that pattern to $|s\\rangle$. Any reading but $000$ says balanced.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.3.3 -- */
{ id:'m6-djcost', module:'M6', nav:'What the separation is', title:'The exponential gap is against an exact classical algorithm, and only that one',
  objective:'Compare the quantum query count with the exact and the randomised classical query counts, and say which separation is real.',
  keywords:'separation exact deterministic randomised bounded error queries worst case exponential gap honest statement promise problem',
  src:'L10 · extending Deutsch\u2019s algorithm to n inputs', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Deutsch and Deutsch\u2013Jozsa'},
  {t:'title', text:'The exponential gap is against an exact classical algorithm, and only that one'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figDJcost(),
      caption:'Three counts on a logarithmic axis. The exponential gap is the distance to the top curve; for anyone willing to be wrong once in a million it is the distance to the flat line at twenty-one.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Why the result still matters', html:'It was the first proof that a quantum computer can settle a question with fewer queries than any classical machine. It must not be quoted as an exponential speedup for a practical task.'}]}
  ], right:[
    {t:'eq', key:true, label:'Exact against exact', tex:'2^{n-1}+1 \\ \\text{ classical queries, against } 1',
      note:'A classical algorithm that must never be wrong can see $2^{n-1}$ equal values and still not know. That gap is a theorem about exact algorithms. Allow an error: $k$ random queries err below $2^{-(k-1)}$, for every $n$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} n = 10: \\quad \\text{exact } &2^{9}+1 = 513 \\\\ \\text{error below } 10^{-6}: \\quad &21 \\end{aligned}',
        note:'The ratio anyone would use is $21$, not $513$. At $n = 30$ the randomised count is still $21$, and the exact count has grown to $5.4\\times10^{8}$ queries.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A randomised classical tester may be wrong once in a billion, $\\varepsilon = 10^{-9}$, and $n = 20$.<div class="nsep"></div>How many queries does it need?',
        ask:{key:'m6-djcost', choices:['$31$','$524\\,289$','$30$'], answer:0,
          why:'$2^{-(k-1)} \\le 10^{-9}$ needs $k-1 \\ge 29.9$, so $k = 31$, whatever $n$ is. $524\\,289 = 2^{19}+1$ is the exact count.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m6-code-dj', module:'M6', nav:'Code · Deutsch and Deutsch\u2013Jozsa', title:'Deutsch\u2013Jozsa in code',
  objective:'Run Deutsch\u2013Jozsa on several oracles, check the mean of the signs, and see what happens without the promise.',
  keywords:'code qiskit numpy program deutsch jozsa oracles balanced constant mean of signs promise',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 6 · Deutsch and Deutsch\u2013Jozsa'},
  {t:'title', text:'Deutsch\u2013Jozsa in code'},
  {t:'raw', html:()=>CODEBANK.page('m6-code-dj')}
]},

/* ---------------------------------------------------------------- 6.4.1 -- */
{ id:'m6-qft', module:'M6', nav:'The Fourier transform', title:'The transform sends a basis state to a phase that winds at a rate the state sets',
  objective:'Write the quantum Fourier transform, apply it to one basis state, and describe the result.',
  keywords:'quantum fourier transform definition basis state phase ramp winding rate unitary discrete fourier amplitudes equal magnitude',
  src:'L10 · quantum Fourier transform', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · The quantum Fourier transform'},
  {t:'title', text:'The transform sends a basis state to a phase that winds at a rate the state sets'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figQFT(),
      caption:'The eight amplitudes of $F_{8}|3\\rangle$ as arrows in the complex plane, drawn with equal scales. All have one length; the input index sets how fast the phase winds, and nothing else.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The one input worth memorising', html:'$F_{Q}|0\\rangle$ is the uniform superposition, and on one qubit $F_{2}$ is the Hadamard. The layer of Hadamards that opens every algorithm here does the same to $|0^{n}\\rangle$.'}]}
  ], right:[
    {t:'eq', key:true, label:'The transform', tex:'F_{Q}\\,|x\\rangle = \\frac{1}{\\sqrt{Q}}\\sum_{k=0}^{Q-1} e^{2\\pi i\\,xk/Q}\\,|k\\rangle',
      note:'On $n$ qubits $Q = 2^{n}$. Every output amplitude has modulus $1/\\sqrt{Q}$; the input sets the <b>rate</b> at which the phase turns, $2\\pi x/Q$ a step. It is unitary, a change of basis. On a general input it gives the discrete Fourier transform of the amplitudes, held as amplitudes and not printed.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'F_{8}|3\\rangle: \\quad |a_{k}| = \\tfrac{1}{\\sqrt8} = 0.354, \\qquad \\text{each step turns } 3\\times45^{\\circ} = 135^{\\circ}',
        note:'Measured straight away it gives each $k$ with probability $1/8$, for every input $x$. The transform is useful only when its phase pattern is made to interfere with something.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$Q = 8$ and the input $|4\\rangle$.<div class="nsep"></div>What is the amplitude of $|k\\rangle$ in $F_{8}|4\\rangle$?',
        ask:{key:'m6-qft', choices:['$(-1)^{k}/\\sqrt8$','$1/\\sqrt8$ for every $k$','$e^{i\\pi k/4}/\\sqrt8$'], answer:0,
          why:'Each step turns by $2\\pi\\cdot4/8 = \\pi$, half a turn, so the phase alternates between $+1$ and $-1$. The third choice is the ramp of $|1\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.4.2 -- */
{ id:'m6-qftcirc', module:'M6', nav:'The circuit', title:'A Hadamard and a triangle of small rotations, and the whole thing is quadratic',
  objective:'Read the QFT circuit, count its gates, and say what an approximate version trades away.',
  keywords:'qft circuit hadamard controlled rotation R_k swaps gate count quadratic n squared approximate qft truncation depth',
  src:'L10 · QFT circuit in Qiskit', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · The quantum Fourier transform'},
  {t:'title', text:'A Hadamard and a triangle of small rotations, and the whole thing is quadratic'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figQFTcirc(),
      caption:'Three qubits: three Hadamards, three controlled rotations and one swap. The rotation angle halves as the control gets further away, which is why dropping the smallest ones is sensible.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The approximate transform', html:'Rotations below a threshold are dropped. That turns a gate of a third of a degree into a bounded error and cuts the count from $O(n^{2})$ to $O(n\\log n)$.'}]}
  ], right:[
    {t:'eq', key:true, label:'The circuit', tex:'\\begin{aligned} R_{k} &= \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i/2^{k}} \\end{bmatrix} \\\\ n + \\tfrac12 n(n-1) &= \\tfrac12 n(n+1) \\text{ gates} \\end{aligned}',
      note:'The phase $e^{2\\pi i xk/Q}$ splits into one factor per bit of $x$, so the $Q\\times Q$ matrix factors into a short circuit. Each qubit gets a Hadamard and a controlled rotation from every less significant qubit. Add $\\lfloor n/2\\rfloor$ swaps to restore the bit order; the depth is $O(n)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'n = 10: \\quad \\tfrac12\\cdot10\\cdot11 = 55 \\text{ gates} + 5 \\text{ swaps}, \\qquad R_{10}: 0.35^{\\circ}',
        note:'Sixty gates for a matrix with $1024^{2}\\approx10^{6}$ entries. A classical FFT on $1024$ stored numbers costs about $Q\\log_{2}Q = 10240$ operations, for a different task: it prints all $Q$ numbers.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The transform on $n = 6$ qubits, swaps not counted.<div class="nsep"></div>How many Hadamards and controlled rotations does it take?',
        ask:{key:'m6-qftcirc', choices:['$21$','$36$','$15$'], answer:0,
          why:'$6$ Hadamards and $\\tfrac12\\cdot6\\cdot5 = 15$ rotations, $21$ in all. $36 = n^{2}$ counts every ordered pair of qubits.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.4.3 -- */
{ id:'m6-qftnot', module:'M6', nav:'What it does not return', title:'The transform produces amplitudes, and a measurement still returns one index',
  objective:'Say what a run of the quantum Fourier transform actually gives back, and why it is not a spectrum.',
  keywords:'qft limitation not a spectrum amplitudes measurement one sample fft comparison input output model advantage inference',
  src:'L10 · what the QFT does and does not return', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · The quantum Fourier transform'},
  {t:'title', text:'The transform produces amplitudes, and a measurement still returns one index'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figQFTnot(),
      caption:'Eight numbers exist inside the machine and one index comes out. Recovering the shape would take many runs, and the counting would cost more than the transform saved.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'"Fourier transforms, exponentially faster" is the commonest wrong sentence here', html:'The circuit is exponentially smaller than its matrix, and its output is not what a signal processor wants. Reading $Q$ numbers takes $Q$ readings.'}]}
  ], right:[
    {t:'eq', key:true, label:'What one run returns', tex:'\\text{one } k, \\ \\text{ drawn with probability } |\\tilde{a}_{k}|^{2}',
      note:'Given $\\sum_{x}a_{x}|x\\rangle$, the transform produces $\\sum_{k}\\tilde{a}_{k}|k\\rangle$ and does not print the $Q$ numbers; the readout returns $n$ bits. It helps only where the wanted thing can be inferred from samples: a period, an order, an eigenphase. For the whole spectrum a classical FFT is the right machine.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\tfrac{1}{\\sqrt2}\\big(|1\\rangle+|5\\rangle\\big) \\;\\xrightarrow{\\;F_{8}\\;}\\; P(k) = 0.25 \\text{ on } k = 0,2,4,6',
        note:'One run returns one even index. Every outcome is even, which is already a statement about a period. Estimating one of the probabilities to $\\pm0.01$ takes about $1900$ shots.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The input $\\tfrac12\\big(|0\\rangle+|2\\rangle+|4\\rangle+|6\\rangle\\big)$ on $Q = 8$.<div class="nsep"></div>What can one run of the transform return?',
        ask:{key:'m6-qftnot', choices:['$0$ or $4$, each with probability $\\tfrac12$','any even index, each with $\\tfrac14$','the four amplitudes'], answer:0,
          why:'The input repeats every $2$ steps, so the transform has weight only on multiples of $8/2 = 4$. A shorter period in $x$ means a wider spacing in $k$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m6-code-qft', module:'M6', nav:'Code · The quantum Fourier transform', title:'The Fourier transform in code',
  objective:'Compare the transform matrix with its circuit, draw a phase ramp, and transform a periodic input.',
  keywords:'code qiskit numpy program quantum fourier transform matrix circuit phase ramp periodic input',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 6 · The quantum Fourier transform'},
  {t:'title', text:'The Fourier transform in code'},
  {t:'raw', html:()=>CODEBANK.page('m6-code-qft')}
]},

/* ---------------------------------------------------------------- 6.5.1 -- */
{ id:'m6-qpe', module:'M6', nav:'Phase estimation', title:'Write the phase into t qubits at once, then undo the transform to read it',
  objective:'Assemble the phase-estimation circuit and say what each of its three parts does.',
  keywords:'quantum phase estimation circuit counting register controlled powers inverse qft eigenphase binary expansion measurement',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'Write the phase into t qubits at once, then undo the transform to read it'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figQPE(),
      caption:'Three counting qubits, three controlled powers and the inverse transform. The eigenstate on the bottom wire is unchanged from beginning to end.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A superposition of eigenstates gives a sample', html:'With $\\sum_{k}c_{k}|u_{k}\\rangle$ on the bottom wire, the circuit returns $\\varphi_{k}$ with probability $|c_{k}|^{2}$. Order finding relies on exactly that.'}]}
  ], right:[
    {t:'eq', key:true, label:'The counting register', tex:'\\text{control } j \\text{ applies } U^{2^{j}}: \\qquad \\frac{1}{\\sqrt{2^{t}}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i k\\varphi}\\,|k\\rangle',
      note:'Control $j$ collects $e^{2\\pi i\\,2^{j}\\varphi}$, so the phase doubles from wire to wire. The register is then the state the Fourier transform makes from the number $2^{t}\\varphi$, and the inverse transform collapses the ramp onto that number. Measuring gives $y$, and $y/2^{t}$ estimates $\\varphi$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\varphi = \\tfrac58 = 0.101_{2},\\ t = 3: \\quad \\text{the controls collect } \\tfrac58,\\ \\tfrac14,\\ \\tfrac12 \\text{ of a turn}',
        note:'Doubling shifts the binary point: $2\\varphi = 1.01_{2}$ and $4\\varphi = 10.1_{2}$, and whole turns drop out. The inverse transform reads $y = 5$, the bits $101$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$t = 4$ counting qubits and $\\varphi = 3/16$.<div class="nsep"></div>Which control collects a phase of exactly half a turn?',
        ask:{key:'m6-qpe', choices:['$j = 3$, the one applying $U^{8}$','$j = 0$, the one applying $U$','none of them'], answer:0,
          why:'Control $j$ collects $2^{j}\\cdot\\tfrac{3}{16}$ of a turn: $\\tfrac{3}{16}$, $\\tfrac38$, $\\tfrac34$, then $\\tfrac32$, which is half a turn once the whole turn drops out.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.2 -- */
{ id:'m6-qpeexact', module:'M6', nav:'When it is exact', title:'A phase that fits in t bits comes out certain, and every wrong outcome cancels',
  objective:'Show that a phase of the form y/2^t is returned with probability one, and identify the cancellation that makes it so.',
  keywords:'phase estimation exact case binary fraction certainty geometric sum cancellation all wrong outcomes zero amplitude',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'A phase that fits in t bits comes out certain, and every wrong outcome cancels'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figQPEexact(),
      caption:'Three counting qubits and $\\varphi = 3/8$. One outcome carries all the probability and the other seven carry none at all.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Exactness is a property of the number, not of the machine', html:'Almost no real phase is a $t$-bit fraction. A circuit designed from the exact case is expected to print the answer and prints a distribution instead.'}]}
  ], right:[
    {t:'eq', key:true, label:'The exact case', tex:'\\begin{aligned} \\varphi = \\frac{m}{2^{t}} &\\;\\Longrightarrow\\; P(y = m) = 1 \\\\ a_{y} &= \\frac{1}{2^{t}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i k\\left(\\varphi - y/2^{t}\\right)} \\end{aligned}',
      note:'When the phase is a $t$-bit fraction the register holds exactly $F|m\\rangle$, and the inverse transform returns $|m\\rangle$. For every other $y$ the $2^{t}$ terms are the vertices of a regular polygon and add to zero. The cancellation is complete.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'U = T,\\ \\varphi = \\tfrac18,\\ t = 3: \\quad 2^{t}\\varphi = 1, \\qquad y = 001 \\text{ every shot}',
        note:'$0.125$ is $0.001$ in binary, three bits, so the register was just big enough. With two counting qubits the phase would not fit, and the reading would spread over all four outcomes.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The phase $\\varphi = 5/16$.<div class="nsep"></div>Which register sizes read it with certainty?',
        ask:{key:'m6-qpeexact', choices:['$t \\ge 4$','$t \\ge 3$','none: $5/16$ is not exact'], answer:0,
          why:'$5/16 = 0.0101$ in binary needs four bits. At $t = 3$, $2^{t}\\varphi = 2.5$ sits halfway between two readings, and the better one has probability $0.41$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.3 -- */
{ id:'m6-qpeprec', module:'M6', nav:'Precision and confidence', title:'A phase that does not fit gives a distribution, and more qubits narrow it',
  objective:'Describe the outcome distribution for a general phase and say how many counting qubits a stated accuracy and confidence need.',
  keywords:'phase estimation precision success probability distribution nearest outcome eight over pi squared extra qubits accuracy confidence',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'A phase that does not fit gives a distribution, and more qubits narrow it'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figQPEprec(),
      caption:'The phase $\\varphi = 0.3$ read with three counting qubits and with six. The peak sharpens onto a finer grid, and at no register size does one outcome take all the probability.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'One run is not an answer', html:'Where the phase feeds something checkable, such as an order, a failed run is repeated. Where there is no check, quote the confidence the register bought.'}]}
  ], right:[
    {t:'eq', key:true, label:'Distribution and register size', tex:'\\begin{aligned} P(y) &= \\frac{1}{2^{2t}}\\left|\\frac{\\sin\\!\\big(\\pi\\,2^{t}\\delta\\big)}{\\sin(\\pi\\delta)}\\right|^{2}, \\qquad \\delta = \\varphi - \\frac{y}{2^{t}} \\\\ t &= n + \\left\\lceil \\log_{2}\\!\\left(2 + \\frac{1}{2\\varepsilon}\\right) \\right\\rceil \\end{aligned}',
      note:'A general phase gives a peak at $2^{t}\\varphi$ with tails. The nearest outcome carries at least $4/\\pi^{2}\\approx0.405$, the two nearest at least $8/\\pi^{2}\\approx0.811$. For $n$ correct bits with failure at most $\\varepsilon$, take the $t$ of the second line; halving $\\varepsilon$ costs about one qubit.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\varphi = 0.3,\\ t = 3: \\quad P(2) = 0.577,\\ \\ P(3) = 0.259, \\qquad \\text{together } 0.836',
        note:'$0.836$ is above the guaranteed $0.811$. The other $0.164$ is spread over six outcomes, and a run that lands there returns a wrong phase with no warning.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Three correct bits are wanted, with failure probability at most $1\\%$.<div class="nsep"></div>How many counting qubits?',
        ask:{key:'m6-qpeprec', choices:['$9$','$4$','$10$'], answer:0,
          why:'$2 + 1/(2\\times0.01) = 52$ and $\\lceil\\log_{2}52\\rceil = 6$, so $t = 3 + 6 = 9$. Four is the three bits with a single qubit of margin.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.4 -- */
{ id:'m6-qpecost', module:'M6', nav:'Where the cost is', title:'The controlled powers cost exponentially more than the transform that reads them',
  objective:'Compare the cost of the controlled powers with the cost of the inverse transform and say which one a resource estimate must be about.',
  keywords:'phase estimation cost controlled powers 2^t applications inverse qft quadratic dominant term resource estimate coherent evolution',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'The controlled powers cost exponentially more than the transform that reads them'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figQPEcost(),
      caption:'The two counts against the register size. At ten counting qubits the transform is fifty-five gates and the controlled powers are $1023$ uses of $U$, and the gap only widens.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Semiclassical variants', html:'One qubit, measured and reused $t$ times with feedforward, can replace the counting register. That saves $t-1$ qubits and nothing in the controlled evolution.'}]}
  ], right:[
    {t:'eq', key:true, label:'The two costs', tex:'\\begin{aligned} \\text{controlled powers: } & 1 + 2 + \\cdots + 2^{t-1} = 2^{t}-1 \\text{ uses of } U \\\\ \\text{inverse transform: } & \\tfrac12 t(t+1) \\text{ gates} \\end{aligned}',
      note:'Reading $t$ bits of a phase means evolving for a time proportional to $2^{t}$, however the circuit is arranged. So the method is efficient only when $U^{2^{j}}$ can be built directly, in size polynomial in $j$. Order finding can do that; an arbitrary $U$ cannot.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'t = 10,\\ U \\text{ of } 500 \\text{ gates}: \\quad 1023 \\times 500 \\approx 5.1\\times10^{5}, \\ \\text{ against } 55',
        note:'The transform is about $0.01\\%$ of the circuit. One more counting qubit takes it from $55$ to $66$ gates and doubles the rest.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$t = 12$ counting qubits and a $U$ whose circuit is $200$ gates.<div class="nsep"></div>About how many gates are in the controlled powers?',
        ask:{key:'m6-qpecost', choices:['$8.2\\times10^{5}$','$2400$','$78$'], answer:0,
          why:'$(2^{12}-1)\\times200 = 4095\\times200 = 819\\,000$. $2400 = 12\\times200$ counts each control once, and $78$ is the inverse transform.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.5 -- */
{ id:'m6-count', module:'M6', nav:'Counting the marked', title:'Point the estimator at the Grover step and it returns how many answers there are',
  objective:'Explain quantum counting and use it to close the gap chapter 5 left open about an unknown number of marked items.',
  keywords:'quantum counting grover iterate eigenvalue two theta estimate M number of solutions unknown marked items decide existence',
  src:'L10 · Grover search and amplitude amplification', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'Point the estimator at the Grover step and it returns how many answers there are'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCount(),
      caption:'The estimator pointed at the search step. The answer to how many arrives before the search is run, and the search then uses the right number of iterations.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Is there an answer at all?', html:'If the estimate of $M$ is zero within its error bar, nothing is marked. A classical machine settles that only by checking all $N$ candidates.'}]}
  ], right:[
    {t:'eq', key:true, label:'Counting', tex:'\\text{eigenvalues } e^{\\pm 2i\\theta} \\;\\Longrightarrow\\; \\text{estimate } \\theta, \\qquad M = N\\sin^{2}\\theta',
      note:'The best Grover count needs $M$, the number of marked candidates, and $M$ is usually what is unknown. The Grover step turns a plane by $2\\theta$, so its eigenphases carry $\\theta$. The uniform start is a mixture of the two eigenvectors, and $\\pm\\theta$ give the same $M$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 1024,\\ \\theta = 3.6^{\\circ}: \\quad M = 1024\\sin^{2}3.6^{\\circ} = 4.04 \\;\\to\\; 4',
        note:'The search then runs $\\tfrac{\\pi}{4}\\sqrt{1024/4}-\\tfrac12 = 12.07$, so twelve iterations. Counting costs about $\\sqrt{N}$ applications, so counting and then searching is still a square-root method.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 4096$, and the estimate comes out at $\\theta = 5.1^{\\circ}$.<div class="nsep"></div>How many candidates are marked?',
        ask:{key:'m6-count', choices:['$32$','$365$','$64$'], answer:0,
          why:'$\\sin^{2}5.1^{\\circ} = 0.00790$, and $4096\\times0.00790 = 32.4$. The $365$ multiplies $N$ by $\\theta$ in radians and forgets the sine squared.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.L1 --- */
{ id:'m6-lab-k', module:'M6', nav:'Laboratory K', title:'Laboratory K · Phase estimation: the phase, the register, and the distribution',
  objective:'Let the reader turn the phase and the number of counting qubits and watch the outcome distribution answer.',
  keywords:'laboratory phase estimation counting qubits distribution outcomes precision success probability exact case tails guarantee',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'Laboratory K · Phase estimation: the phase, the register, and the distribution'},
  {t:'small', html:'Choose a phase and a number of counting qubits. The left panel is the distribution over the $2^{t}$ possible readings; the right panel is how the probability of landing on the nearest reading behaves as the register grows. Three things to find: a phase that is a $t$-bit fraction gives one outcome with probability one and an exact zero at every other reading, the two nearest readings always carry at least $8/\\pi^{2}$ however badly the phase fits, and the worst case is a phase sitting exactly halfway between two readings.'},
  {t:'lab', id:'K'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m6-code-qpe', module:'M6', nav:'Code · Phase estimation', title:'Phase estimation in code',
  objective:'Read an exact phase, a halfway phase against the two bounds, and the register a target error needs.',
  keywords:'code qiskit numpy program phase estimation exact halfway bounds counting qubits success',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'Phase estimation in code'},
  {t:'raw', html:()=>CODEBANK.page('m6-code-qpe')}
]},

/* ---------------------------------------------------------------- 6.6.1 -- */
{ id:'m6-order', module:'M6', nav:'The order of a number', title:'Multiplying by a fixed number modulo N goes round in a cycle, and its length is the order',
  objective:'Define the order of a modulo N and the unitary whose eigenphases carry it.',
  keywords:'order finding modular multiplication cycle period coprime permutation unitary reversible work register definition',
  src:'L10 · order-finding workflow', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'Multiplying by a fixed number modulo N goes round in a cycle, and its length is the order'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOrder(),
      caption:'Powers of two modulo fifteen. The sequence returns to one after four steps and then repeats, so the order is four. Finding this length is the only quantum step in factoring.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Why this is hard classically', html:'Walking the cycle takes $r$ steps, and $r$ can be close to $N$, which is exponential in its bit length. The examples look easy because their numbers are small; the numbers in use have six hundred digits.'}]}
  ], right:[
    {t:'eq', key:true, label:'The order', tex:'\\begin{aligned} a^{r} &\\equiv 1 \\pmod N, \\qquad r \\text{ the smallest such} \\\\ U_{a}\\,|y\\rangle &= |\\,a\\,y \\bmod N\\,\\rangle \\end{aligned}',
      note:'When $a$ and $N$ share no factor, multiplying by $a$ permutes $0,1,\\ldots,N-1$: nothing is lost and nothing collides. A permutation is a unitary, so it is a legal gate. On the unused basis states from $N$ to $2^{m}-1$ it is completed as the identity.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 21,\\ a = 2: \\quad 1,\\,2,\\,4,\\,8,\\,16,\\,11,\\,1 \\;\\Longrightarrow\\; r = 6',
        note:'$2^{6} = 64 = 3\\times21+1$, and no smaller power reached one. Checking that is what confirms a candidate order.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 35$ and $a = 2$.<div class="nsep"></div>What is the order?',
        ask:{key:'m6-order', choices:['$12$','$6$','$34$'], answer:0,
          why:'The powers run $2,4,8,16,32,29,23,11,22,9,18,1$, so the cycle closes at $k = 12$. At $k = 6$ the value is $29$, not $1$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.2 -- */
{ id:'m6-ordereig', module:'M6', nav:'Where the order hides', title:'The eigenphases of the multiplier are the fractions s over r, and the state one can prepare is their even mixture',
  objective:'Give the eigenstates and eigenphases of the modular multiplier and explain why the register is started in the state one.',
  keywords:'eigenstates modular multiplier eigenphase s over r superposition state one even mixture sampling eigenphase preparation trick',
  src:'L10 · order-finding workflow', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'The eigenphases of the multiplier are the fractions s over r, and the state one can prepare is their even mixture'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOrderEig(),
      caption:'The four eigenphases when the order is four, each reached with probability one quarter. Starting the work register in the state one is exactly this even mixture.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The step worth understanding twice', html:'The circuit never holds an eigenstate and never learns $s$. It measures a phase whose denominator is $r$, and classical arithmetic recovers that denominator.'}]}
  ], right:[
    {t:'eq', key:true, label:'The eigenphases', tex:'\\begin{aligned} |u_{s}\\rangle &= \\frac{1}{\\sqrt r}\\sum_{k=0}^{r-1} e^{-2\\pi i sk/r}\\,|a^{k} \\bmod N\\rangle \\\\ U_{a}\\,|u_{s}\\rangle &= e^{2\\pi i s/r}\\,|u_{s}\\rangle, \\qquad \\frac{1}{\\sqrt r}\\sum_{s=0}^{r-1}|u_{s}\\rangle = |1\\rangle \\end{aligned}',
      note:'The eigenvectors are the Fourier combinations of the cycle, and their eigenphases are $s/r$: the order sits in the denominators. Preparing one $|u_{s}\\rangle$ would need $r$. Their even mixture is $|1\\rangle$, one gate, so the circuit samples $s/r$ with $s$ uniform.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 15,\\ a = 2,\\ r = 4: \\quad \\varphi \\in \\{0, \\tfrac14, \\tfrac12, \\tfrac34\\}, \\text{ each with } \\tfrac14',
        note:'$s = 0$ says nothing about $r$; $s = 2$ reduces to $\\tfrac12$, and the candidate $2$ fails $2^{2}\\equiv1$. Only $s = 1$ and $s = 3$ give $r = 4$, so half the runs succeed.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 15$ and $a = 4$, whose order is $r = 2$.<div class="nsep"></div>Which eigenphases does a run sample?',
        ask:{key:'m6-ordereig', choices:['$0$ and $\\tfrac12$, each with probability $\\tfrac12$','$0$, $\\tfrac14$, $\\tfrac12$ and $\\tfrac34$','only $\\tfrac12$'], answer:0,
          why:'With $r = 2$ the eigenphases are $s/2$ for $s = 0, 1$, each drawn with probability $\\tfrac12$. The four quarters belong to $a = 2$, whose order is four.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.3 -- */
{ id:'m6-modexp', module:'M6', nav:'What it costs to build', title:'The controlled powers are modular exponentiation, and they are the whole cost',
  objective:'Say how the controlled powers of the modular multiplier are built and which term dominates the circuit.',
  keywords:'modular exponentiation repeated squaring controlled multiplication cost cubic L gate count dominant term qft small',
  src:'L10 · order-finding workflow', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'The controlled powers are modular exponentiation, and they are the whole cost'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figModexp(),
      caption:'The two parts of the circuit against the size of $N$. At the sizes that matter the Fourier transform is the cheap part by three orders of magnitude.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'"Shor\u2019s algorithm is the quantum Fourier transform" is the wrong summary', html:'The transform is the smallest part. The modular exponentiation has to run coherently and reversibly, and chapter 4\u2019s ancillas and uncomputing are where its cost comes from.'}]}
  ], right:[
    {t:'eq', key:true, label:'Squaring, not repeating', tex:'U_{a}^{2^{j}} = U_{a^{2^{j}} \\bmod N}',
      note:'Applying $U_{a}$ $2^{j}$ times would be exponential. The constant $a^{2^{j}}\\bmod N$ is computed classically by squaring $j$ times, so each counting qubit controls one modular multiplication. A reversible multiplier costs about $L^{2}$ gates and there are about $2L$ of them: order $L^{3}$, against $L^{2}$ for the transform.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} L = 2048: \\quad 4096 \\times 4.2\\times10^{6} &\\approx 1.7\\times10^{10} \\text{ gates} \\\\ \\tfrac12\\, t(t+1) &\\approx 8.4\\times10^{6} \\end{aligned}',
        note:'The arithmetic is about $2050$ times the transform, of the order of $L$, as the scaling says. Every published resource estimate for factoring is an estimate of the arithmetic.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 15$ and $a = 7$. Counting qubit $j = 2$ multiplies by the constant $7^{4} \\bmod 15$.<div class="nsep"></div>What is that constant?',
        ask:{key:'m6-modexp', choices:['$1$: that control does nothing','$4$','$13$'], answer:0,
          why:'Squaring twice: $7^{2} = 49 \\equiv 4$ and $4^{2} = 16 \\equiv 1$. The order of $7$ is four, so every control from $j = 2$ on multiplies by one.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.4 -- */
{ id:'m6-cf', module:'M6', nav:'Reading the order out', title:'Continued fractions turn a measured fraction into the small denominator hiding in it',
  objective:'Use the continued-fraction expansion to recover r from a measured y over Q, and check the candidate.',
  keywords:'continued fractions convergents denominator recover order classical post processing candidate check modular exponentiation verify',
  src:'L10 · order-finding workflow', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'Continued fractions turn a measured fraction into the small denominator hiding in it'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCF(),
      caption:'One reading turned into an order. The convergent wanted is the last one whose denominator is below $N$; the next has denominator $253$, far too large to be an order modulo twenty-one.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The register is twice as long as the number', html:'$Q > N^{2}$ means about $2L$ counting qubits for an $L$-bit $N$, and so twice as many controlled multiplications.'}]}
  ], right:[
    {t:'eq', key:true, label:'Continued fractions', tex:'\\left| \\frac{y}{Q} - \\frac{s}{r} \\right| \\le \\frac{1}{2Q}, \\quad Q > N^{2} \\;\\Longrightarrow\\; \\frac{s}{r} \\text{ is a convergent of } \\frac{y}{Q}',
      note:'The reading $y/Q$ is close to $s/r$ but never equal, because $Q$ is a power of two. Take the whole part, invert the remainder, repeat: the convergents are the best approximations with small denominators. Keep the last denominator below $N$, and accept it only if $a^{r}\\equiv1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 21,\\ Q = 512,\\ y = 85: \\quad [0;6,42,2] \\;\\to\\; \\tfrac01,\\ \\tfrac16,\\ \\tfrac{42}{253} \\;\\to\\; r = 6',
        note:'$2^{6} = 64 \\equiv 1 \\pmod{21}$ confirms it. The reading $0.16602$ was never exactly $1/6 = 0.16667$ and did not need to be.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 21$, $a = 2$, $Q = 512$, and the reading $y = 171$.<div class="nsep"></div>What does the classical step accept?',
        ask:{key:'m6-cf', choices:['nothing: the candidate $3$ fails the check','$r = 6$','$r = 3$'], answer:0,
          why:'$171/512$ has the convergents $0$, $\\tfrac12$, $\\tfrac13$ and then $\\tfrac{171}{512}$. The last denominator below $21$ is $3$, and $2^{3} = 8 \\not\\equiv 1$. The run drew $s/r = 2/6$, which reduced, and it is repeated.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.5 -- */
{ id:'m6-repeat', module:'M6', nav:'When a run fails', title:'Several things can go wrong, all of them are detected, and none of the repairs is quantum',
  objective:'List the ways an order-finding run fails, say how each is detected, and describe the repetition strategy.',
  keywords:'failure modes s zero common factor odd order minus one repeat runs detection classical check probability constant expected runs',
  src:'L10 · order-finding workflow', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'Several things can go wrong, all of them are detected, and none of the repairs is quantum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figRepeat(),
      caption:'The four failures, what each produces, and the repair. The colour is the repair: amber where the circuit is run again, red where the base is discarded. Every row is decided by integer arithmetic.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'A failure that announces itself', html:'Success is checkable: multiply the factors and compare with $N$. In Deutsch\u2013Jozsa or Grover a wrong answer looks exactly like a right one.'}]}
  ], right:[
    {t:'eq', key:true, label:'How often a base works', tex:'P\\big(r \\text{ even and } a^{r/2} \\not\\equiv -1\\big) \\ge \\tfrac12 \\quad \\text{for } N = pq',
      note:'A run fails in four ways. $s = 0$ carries nothing, and an $s$ sharing a factor with $r$ gives a divisor that fails $a^{r}\\equiv1$: run again. An odd $r$, or $a^{r/2}\\equiv-1$, leaves only trivial divisors: choose another base. A constant success probability means a constant expected number of attempts.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 15,\\ a = 2: \\quad s \\in \\{0,1,2,3\\}, \\quad s = 1, 3 \\text{ succeed}, \\quad P = \\tfrac12',
        note:'$s = 2$ gives the candidate $2$, which fails $2^{2} = 4 \\not\\equiv 1$. The expected number of runs is two, and each check is one classical modular exponentiation.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 21$ and the base $a = 20$.<div class="nsep"></div>What should the procedure do?',
        ask:{key:'m6-repeat', choices:['choose another base','run the circuit again','stop: the factors are $3$ and $7$'], answer:0,
          why:'$20^{2} = 400 = 19\\times21+1$, so $r = 2$, and $a^{r/2} = 20 \\equiv -1 \\pmod{21}$. Then $\\gcd(19,21) = 1$ and $\\gcd(21,21) = 21$, both trivial, whatever the circuit returns.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m6-code-order', module:'M6', nav:'Code · Order finding', title:'Order finding in code',
  objective:'Find an order by brute force, simulate the order-finding readings, and turn a reading into an order.',
  keywords:'code qiskit numpy program order finding modular exponentiation continued fractions readings',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'Order finding in code'},
  {t:'raw', html:()=>CODEBANK.page('m6-code-order')}
]},

/* ---------------------------------------------------------------- 6.7.1 -- */
{ id:'m6-shor', module:'M6', nav:'Factoring, assembled', title:'One box in five needs a quantum computer, and the other four are integer arithmetic',
  objective:'Assemble the factoring algorithm from order finding and the classical steps around it, and identify which step is quantum.',
  keywords:'shor factoring algorithm workflow reduction order finding gcd classical steps square root difference of squares assembly',
  src:'L10 · Shor\u2019s factoring algorithm', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'One box in five needs a quantum computer, and the other four are integer arithmetic'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShor(),
      caption:'The five steps, with the quantum one marked. Four of them run on a laptop in microseconds; the whole cost of the algorithm is inside the one that does not.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Why "quantum computers factor numbers" misleads', html:'What is true is narrower: a quantum computer finds the period of a modular exponential in polynomial time, and factoring reduces to that. A problem with no hidden period gets nothing from this.'}]}
  ], right:[
    {t:'eq', key:true, label:'The reduction', tex:'\\begin{aligned} \\big(a^{r/2}-1\\big)\\big(a^{r/2}+1\\big) &\\equiv 0 \\pmod N \\\\ \\gcd\\big(a^{r/2}\\pm1,\\,N\\big) &\\ \\text{ are proper factors} \\end{aligned}',
      note:'If $r$ is even, $a^{r}-1\\equiv0$ factors as a difference of squares. Provided $a^{r/2}\\not\\equiv\\pm1$, $N$ divides the product but neither factor, so its primes are split between the two. Picking $a$, the first gcd, the continued fractions and the check are classical too.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 21,\\ a = 2,\\ r = 6: \\quad 2^{3} = 8, \\qquad \\gcd(7,21) = 7,\\ \\ \\gcd(9,21) = 3',
        note:'$8 \\not\\equiv \\pm1 \\pmod{21}$, so both divisors are proper, and $3\\times7 = 21$. Euclid\u2019s algorithm takes about $\\log N$ steps, the cheapest thing in the procedure.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 33$ and $a = 5$, whose order is $r = 10$.<div class="nsep"></div>What does the procedure return?',
        ask:{key:'m6-shor', choices:['$3$ and $11$','nothing: choose another base','$23$ and $33$'], answer:0,
          why:'$5^{5} = 3125 = 94\\times33+23$, and $23 \\not\\equiv \\pm1$. Then $\\gcd(22,33) = 11$ and $\\gcd(24,33) = 3$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.2 -- */
{ id:'m6-shor15', module:'M6', nav:'Fifteen, worked', title:'The smallest example, worked to the end, including the choice that fails',
  objective:'Factor fifteen through order finding, and show a choice of a for which the same procedure fails.',
  keywords:'worked example fifteen factoring order four gcd three five failure case fourteen minus one repeat choose another base',
  src:'L10 · worked order-finding example: N = 15', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'The smallest example, worked to the end, including the choice that fails'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShor15(),
      caption:'Every number in the run, in order. The only step a laptop cannot do at scale is the order, and at this size a laptop can do that too.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'What a small demonstration shows', html:'Hardware runs on fifteen almost always simplify the circuit using the known answer. They show that the pieces fit, not what a large number would cost.'}]}
  ], right:[
    {t:'eq', key:true, label:'Fifteen, base two', tex:'\\begin{aligned} 2^{k} \\bmod 15 &: \\ 1,\\,2,\\,4,\\,8,\\,1 \\;\\Longrightarrow\\; r = 4 \\\\ \\gcd(3,15) &= 3, \\qquad \\gcd(5,15) = 5 \\end{aligned}',
      note:'$\\gcd(2,15) = 1$, so no factor falls out early. The order is even and $2^{2} = 4$ is not $-1\\equiv14$, so both divisors are proper, and $3\\times5 = 15$ checks the answer in one line.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'a = 14: \\quad 14^{2} \\equiv 1,\\ r = 2, \\quad 14 \\equiv -1 \\;\\Longrightarrow\\; \\gcd(13,15) = 1,\\ \\gcd(15,15) = 15',
        note:'Both divisors are useless. Of the eight bases coprime to fifteen, two fail: $1$, whose order is the odd number $1$, and $14$. A failed base costs one more run.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N = 15$ and the base $a = 11$.<div class="nsep"></div>What happens?',
        ask:{key:'m6-shor15', choices:['$r = 2$, and the factors $5$ and $3$','$r = 2$, and both divisors are trivial','$r = 4$, and the factors $3$ and $5$'], answer:0,
          why:'$11^{2} = 121 = 8\\times15+1$, so $r = 2$, and $11 \\not\\equiv -1$. Then $\\gcd(10,15) = 5$ and $\\gcd(12,15) = 3$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.3 -- */
{ id:'m6-rsa', module:'M6', nav:'What is actually threatened', title:'Public-key cryptography breaks, symmetric cryptography does not, and the timing is the problem',
  objective:'Say which cryptographic systems a large fault-tolerant machine would break and why migration cannot wait for one.',
  keywords:'rsa public key discrete logarithm broken symmetric aes hash grover square root post quantum migration harvest now decrypt later',
  src:'L10 · RSA and the scope of the quantum threat', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'Public-key cryptography breaks, symmetric cryptography does not, and the timing is the problem'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figRSA(),
      caption:'What each family of schemes faces. The schedule is not set by when the machine arrives, because traffic recorded today can be opened later by whoever kept it.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What "post-quantum" means', html:'A <b>classical</b> algorithm resting on a problem with no known efficient quantum attack; lattice schemes are the main family. It is not quantum cryptography, which distributes keys over physical channels.'}]}
  ], right:[
    {t:'eq', key:true, label:'When it matters', tex:'\\text{secret lifetime} + \\text{migration time} \\; > \\; \\text{time to a large machine}',
      note:'RSA rests on factoring; Diffie\u2013Hellman and elliptic curves rest on the discrete logarithm, which the same machinery solves. Symmetric ciphers and hashes face only Grover\u2019s square root, and a doubled key restores the margin. None of this was ever a proof of security, and recorded traffic is at risk whenever the inequality holds.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'20 \\text{ years of secrecy, recorded today} \\;\\Longrightarrow\\; \\text{the data sets the deadline}',
        note:'Recording costs almost nothing, and the recording can be opened whenever a machine exists within those twenty years. Data that stops mattering next week is not at risk.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A secret must hold for $10$ years, replacing the key exchange takes $5$ years, and a large machine is assumed $12$ years away.<div class="nsep"></div>Is traffic sent before the migration ends at risk?',
        ask:{key:'m6-rsa', choices:['yes: $10 + 5 = 15 > 12$','no: $10 < 12$','no: migration ends before the machine'], answer:0,
          why:'Traffic sent in year $5$ must stay secret until year $15$, three years after the machine. Comparing the secret lifetime alone with the arrival date forgets the migration.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.4 -- */
{ id:'m6-shorclaim', module:'M6', nav:'What Shor claims', title:'A superpolynomial gap against the best known method, and no lower bound behind it',
  objective:'Write the factoring claim against the five components and say precisely what it does and does not assert.',
  keywords:'shor claim resource five components fault tolerance physical qubits number field sieve baseline no lower bound superpolynomial',
  src:'L10 · Shor\u2019s factoring algorithm', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'A superpolynomial gap against the best known method, and no lower bound behind it'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShorClaim(),
      caption:'The claim against the five. The two in the error tone are usually left unstated, and they decide whether any of this happens on a real machine.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What the result does say', html:'On an ideal fault-tolerant machine factoring takes polynomially many operations, where every known classical method takes subexponentially many. It is a statement about two algorithms, not about the problem.'}]}
  ], right:[
    {t:'eq', key:true, label:'The claim', tex:'\\text{polynomial in } L, \\ \\text{ against } \\ e^{c\\,L^{1/3}(\\log L)^{2/3}} \\text{ for the best known method}',
      note:'Two of the five components carry the weight. The <b>hardware model</b> is fault tolerant: about $L^{3}$ logical gates, each a code block, and millions of physical qubits for a $2048$-bit modulus. The <b>baseline</b> is the number field sieve, subexponential, and no theorem says factoring is hard.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'1.7\\times10^{10} \\text{ gates} \\times 1\\,\\mu\\text{s} = 1.7\\times10^{4}\\,\\text{s} \\approx 4.8 \\text{ hours}',
        note:'Hours of running, with no parallelism, on millions of physical qubits. The sieve on the same modulus is beyond any assembled effort; which number is finite in practice depends on whether the machine exists.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same $1.7\\times10^{10}$ logical gates, run at $10\\,\\mu\\text{s}$ each with no parallelism.<div class="nsep"></div>About how long does one run take?',
        ask:{key:'m6-shorclaim', choices:['about two days','about five hours','about half an hour'], answer:0,
          why:'$1.7\\times10^{10}\\times10^{-5}\\,\\text{s} = 1.7\\times10^{5}\\,\\text{s}$, about $47$ hours. The logical clock rate enters the running time directly.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.5 -- */
{ id:'m6-family', module:'M6', nav:'The family', title:'Order finding is one case of period finding, and period finding is one case of something larger',
  objective:'Place order finding inside the family of problems the same mechanism solves, and say what is outside it.',
  keywords:'period finding hidden subgroup problem discrete logarithm family abelian structure grover outside quadratic limits of the method',
  src:'L10 · quantum Fourier transform', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'Order finding is one case of period finding, and period finding is one case of something larger'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figFamily(),
      caption:'Where factoring sits. The outer box is the general statement about hidden structure in a commutative group; the inner ones are cases with algorithms.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The honest boundary', html:'Interference against a hidden period is superpolynomial and needs structure; amplitude amplification is quadratic and needs none. A large speedup on a problem with neither is a claim of something new.'}]}
  ], right:[
    {t:'eq', key:true, label:'Period finding', tex:'f(x + r) = f(x) \\ \\text{ for all } x, \\quad f \\text{ distinct within one period}',
      note:'Order finding used only that a function repeats, not that it multiplies. Superpose, evaluate, transform, measure, read the denominator: the same construction returns $r$ whenever $f$ repeats. Order finding is $f(x) = a^{x}\\bmod N$; the discrete logarithm is a case in two variables. Grover is outside, which is why its saving is only a square root.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'Q = 16,\\ r = 4: \\quad y \\in \\{0, 4, 8, 12\\}, \\ \\text{ each with } \\tfrac14',
        note:'When $r$ divides $Q$ the readings are exactly the multiples of $Q/r$, and a reading gives $y/Q = s/r$. For $f(x) = 2^{x}\\bmod 15$ this is the order four again.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A function with period $r = 8$, read on a counting register with $Q = 64$.<div class="nsep"></div>What can one run return?',
        ask:{key:'m6-family', choices:['a multiple of $8$, each of the eight with $\\tfrac18$','only $y = 8$','any $y$, each with $\\tfrac1{64}$'], answer:0,
          why:'$Q/r = 64/8 = 8$, so the readings are $0, 8, \\ldots, 56$, with $s$ uniform on $0,\\ldots,7$. Each gives $y/64 = s/8$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m6-code-shor', module:'M6', nav:'Code · Factoring, and the reach of one mechanism', title:'Factoring in code',
  objective:'Factor fifteen end to end, meet the failure cases, and count the bases that work.',
  keywords:'code qiskit numpy program shor factoring gcd order failure cases bases',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'Factoring in code'},
  {t:'raw', html:()=>CODEBANK.page('m6-code-shor')}
]},

/* ---------------------------------------------------------------- 6.8.1 -- */
{ id:'m6-synth', module:'M6', nav:'Summary', title:'What this chapter leaves you with',
  objective:'Collect what this chapter added and the errors it exists to prevent.',
  keywords:'summary module 6 review kickback interference deutsch jozsa fourier transform phase estimation order finding shor resource claim',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Summary'},
  {t:'title', text:'What this chapter leaves you with'},
  {t:'fig', frame:true, svg:()=>figLadder(),
    caption:'The chapter as one ladder. Every algorithm in it is these four steps with a different question written into the first one.'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'The mechanism', items:[
      {t:'small', html:'$U_{f}|x\\rangle|{-}\\rangle = (-1)^{f(x)}|x\\rangle|{-}\\rangle$. The superposition is free; the interference is the algorithm.'}]}],
    [{t:'card', head:'Deutsch\u2013Jozsa', items:[
      {t:'small', html:'The amplitude of $0^{n}$ is $2^{-n}\\sum_{x}(-1)^{f(x)}$: $\\pm1$ constant, exactly $0$ balanced. One query against $2^{n-1}+1$ exact, or $21$ randomised.'}]}],
    [{t:'card', head:'Transform and estimate', items:[
      {t:'small', html:'$F_{Q}|x\\rangle = Q^{-1/2}\\sum_{k}e^{2\\pi ixk/Q}|k\\rangle$, in $\\tfrac12 n(n+1)$ gates, returning one index. Estimation costs $2^{t}-1$ uses of $U$.'}]}],
    [{t:'card', head:'Order finding', items:[
      {t:'small', html:'$U_{a}|y\\rangle=|ay \\bmod N\\rangle$ has eigenphases $s/r$. Continued fractions give $r$; $\\gcd(a^{r/2}\\pm1,N)$ gives the factors.'}]}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:2, gap:'24px', items:[
      [{t:'note', kind:'ok', head:'Five lines to be able to write without looking', html:'$U_{f}|x\\rangle|{-}\\rangle=(-1)^{f(x)}|x\\rangle|{-}\\rangle$ &nbsp;·&nbsp; $a_{0^{n}}=2^{-n}\\sum_{x}(-1)^{f(x)}$ &nbsp;·&nbsp; $F_{Q}|x\\rangle=Q^{-1/2}\\sum_{k}e^{2\\pi ixk/Q}|k\\rangle$ &nbsp;·&nbsp; $U_{a}|u_{s}\\rangle=e^{2\\pi is/r}|u_{s}\\rangle$ &nbsp;·&nbsp; $\\gcd(a^{r/2}\\pm1,N)$.'}],
      [{t:'note', kind:'warn', head:'Four errors that cost a whole question', html:'Calling a query count a runtime. Quoting the Deutsch\u2013Jozsa separation without the words "exact" and "promised". Saying the Fourier transform returns the spectrum. And treating the classical work around order finding as the expensive part.'}]
    ]}
  ]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'def', head:'Where this leaves the three sentences of chapter 0', html:'The readout is small, so every algorithm here made everything else cancel first. A relative phase is everything, and kickback is what writes the answer as one. And a resource claim names five things: Deutsch\u2013Jozsa is a promise problem, Grover is quadratic, Shor is a gap against one classical algorithm.'}
  ]}
]},

/* ---------------------------------------------------------------- 6.8.2 -- */
{ id:'m6-shapes', module:'M6', nav:'The shapes of question', title:'The shapes of question this chapter sets',
  objective:'Name the recurring question types of chapter 6 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice kickback interference fourier phase estimation order finding claim',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 6 · Summary and practice'},
  {t:'title', text:'The shapes of question this chapter sets'},
  {t:'small', html:'Six shapes keep coming back, and a seventh — a <b>full-length question</b> — puts three to five of them in one statement, usually as one algorithm followed from its circuit to a probability and then to an honest cost. Name the shape before starting; the method for each is fixed.'},
  {t:'grid', cols:3, gap:'22px', items:[
    [{t:'drilltypes', module:'M6', from:0, to:2}],
    [{t:'drilltypes', module:'M6', from:2, to:4}],
    [{t:'drilltypes', module:'M6', from:4, to:6}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'The check that catches most of it', html:'Probabilities add to one, an amplitude of a balanced function averages to exactly zero, a phase-estimation distribution puts at least $8/\\pi^{2}$ on the two nearest outcomes, a candidate order is confirmed by one modular exponentiation, and a query count is never quoted as a time. Five one-line tests, and between them they catch nearly every slip this chapter can produce.'}
  ]}
]}

];

window.SCENES_M6 = SC;
})();
