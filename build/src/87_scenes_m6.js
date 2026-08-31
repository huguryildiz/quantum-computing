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
   circuit that had to be built inside it. */
function figQuery(){
  const items = [
    {t:'box',x:250,y:40,w:210,h:110,label:'U_{f}',tex:true,fs:22,color:C.h},
    {t:'arrow',x1:110,y1:70,x2:250,y2:70,label:'|x\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:110,y1:120,x2:250,y2:120,label:'|y\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:460,y1:70,x2:600,y2:70,label:'|x\\rangle',tex:true,color:C.out},
    {t:'arrow',x1:460,y1:120,x2:600,y2:120,label:'|y \\oplus f(x)\\rangle',tex:true,color:C.out},
    {t:'text',x:355,y:178,label:'one query, whatever is inside',fs:12.5},
    {t:'line',d:'M40,206 H720',color:C.rule},
    {t:'text',x:150,y:238,anchor:'middle',label:'query count',fs:13,color:C.out},
    {t:'text',x:150,y:262,anchor:'middle',label:'how many times the box is opened',fs:12},
    {t:'text',x:380,y:238,anchor:'middle',label:'gate count',fs:13,color:C.h},
    {t:'text',x:380,y:262,anchor:'middle',label:'what it cost to build the box',fs:12},
    {t:'text',x:614,y:238,anchor:'middle',label:'end-to-end cost',fs:13,color:C.err},
    {t:'text',x:614,y:262,anchor:'middle',label:'both, plus loading, correction and repeats',fs:12},
    {t:'text',x:380,y:298,label:'A separation in the first column is a real theorem. It becomes a saving in seconds only when the other two are filled in.',fs:12.5,color:C.err}
  ];
  return P.blocks({w:760,h:310,items});
}

/* The four classes, their one-line meanings, and the containments that are
   known. Deliberately not a Venn diagram: a nested-box picture of these four
   has to assert something about every pair, and two of those pairs are open
   questions, so the picture would be stating things nobody knows. */
function figClasses(){
  const cols = [
    ['\\mathrm{P}',   'settled by an ordinary algorithm', C.in],
    ['\\mathrm{BPP}', 'and allowed to toss coins', C.in],
    ['\\mathrm{BQP}', 'and allowed to be a quantum one', C.h],
    ['\\mathrm{NP}',  'a yes answer is easy to check', C.mid]
  ];
  const items = [];
  cols.forEach(([k,v,col],i)=>{
    const x = 26 + i*184;
    items.push({t:'box',x,y:34,w:164,h:52,label:k,tex:true,fs:18,color:col});
    items.push({t:'text',x:x+82,y:108,label:v,fs:12});
    if(i<3 && i!==1) return;
  });
  items.push({t:'arrow',x1:190,y1:60,x2:210,y2:60});
  items.push({t:'arrow',x1:374,y1:60,x2:394,y2:60});
  items.push({t:'line',d:'M26,138 H734',color:C.rule});
  items.push({t:'text',x:200,y:174,anchor:'middle',label:'\\mathrm{P} \\subseteq \\mathrm{BPP} \\subseteq \\mathrm{BQP}',tex:true,fs:17,color:C.out});
  items.push({t:'text',x:500,y:174,anchor:'middle',label:'\\mathrm{P} \\subseteq \\mathrm{NP}',tex:true,fs:17,color:C.out});
  items.push({t:'text',x:380,y:216,anchor:'middle',label:'\\mathrm{NP} \\subseteq \\mathrm{BQP}\\,?',tex:true,fs:17,color:C.err});
  items.push({t:'text',x:380,y:242,label:'not known, and no efficient quantum algorithm is known for any NP-complete problem',fs:12.5,color:C.err});
  items.push({t:'text',x:380,y:284,label:'Factoring is in NP and in BQP and is not known to be NP-complete. The size of an input here is its bit length and',fs:12.5});
  items.push({t:'text',x:380,y:308,label:'never the value of the number it encodes, which is where most of the arguments about this subject start.',fs:12.5});
  return P.blocks({w:760,h:320,items});
}

/* Phase kickback for a Boolean oracle: the target is the one state the flip
   cannot move, so the answer comes back as a sign on the query wire. */
function figKick(){
  const items = [
    wire(56,180,470), wire(126,180,470),
    {t:'text',x:170,y:61,anchor:'end',label:'|x\\rangle',tex:true,fs:14},
    {t:'text',x:170,y:131,anchor:'end',label:'|{-}\\rangle',tex:true,fs:14},
    {t:'box',x:250,y:34,w:96,h:114,label:'U_{f}',tex:true,fs:19,color:C.h},
    {t:'text',x:490,y:61,anchor:'start',label:'(-1)^{f(x)}|x\\rangle',tex:true,fs:15,color:C.out},
    {t:'text',x:490,y:131,anchor:'start',label:'|{-}\\rangle',tex:true,fs:14,color:C.in},
    {t:'text',x:298,y:186,label:'the target leaves unchanged',fs:12},
    {t:'line',d:'M40,214 H720',color:C.rule},
    {t:'text',x:380,y:250,anchor:'middle',label:'X|{-}\\rangle = -|{-}\\rangle \\quad\\Longrightarrow\\quad U_{f}|x\\rangle|{-}\\rangle = (-1)^{f(x)}|x\\rangle|{-}\\rangle',tex:true,fs:17,color:C.mid},
    {t:'text',x:380,y:288,label:'A gate written to change a bit has written a sign instead. Nothing else in this chapter is a different idea.',fs:12.5,color:C.err}
  ];
  return P.blocks({w:760,h:300,items});
}

/* The same move with a general unitary: an eigenstate on the target sends its
   eigenvalue up onto the control. */
function figEigen(){
  const items = [
    wire(54,190,470), wire(130,190,470),
    {t:'text',x:180,y:59,anchor:'end',label:'|{+}\\rangle',tex:true,fs:14},
    {t:'text',x:180,y:135,anchor:'end',label:'|u\\rangle',tex:true,fs:14},
    ctrl(300,54)
  ].concat([{t:'line',d:'M300,54 V113',color:C.h}]).concat([
    gate(300,130,'U',true,42),
    {t:'text',x:490,y:59,anchor:'start',label:'\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+e^{2\\pi i\\varphi}|1\\rangle\\big)',tex:true,fs:15,color:C.out},
    {t:'text',x:490,y:135,anchor:'start',label:'|u\\rangle',tex:true,fs:14,color:C.in},
    {t:'text',x:330,y:186,label:'the eigenstate never moves',fs:12},
    {t:'line',d:'M40,214 H720',color:C.rule},
    {t:'text',x:380,y:250,anchor:'middle',label:'U|u\\rangle = e^{2\\pi i\\varphi}|u\\rangle \\quad\\Longrightarrow\\quad \\mathrm{c}U\\,|{+}\\rangle|u\\rangle = \\big(\\tfrac{1}{\\sqrt2}|0\\rangle+\\tfrac{e^{2\\pi i\\varphi}}{\\sqrt2}|1\\rangle\\big)|u\\rangle',tex:true,fs:15,color:C.mid},
    {t:'text',x:380,y:288,label:'The number wanted is now a relative phase on one qubit, which is the one thing this course knows how to read.',fs:12.5,color:C.out}
  ]);
  return P.blocks({w:760,h:300,items});
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
  const a = P.Axes({w:600,h:310,xr:[-0.6,15.6],yr:[-0.60,1.34],
    xlabel:'x\\text{ or }k', ylabel:'\\text{amplitude}',
    pad:{l:70,r:26,t:30,b:48}, xtarget:8, yticksOverride:[-0.25,0,0.25,0.5,0.75,1]});
  a.stem(before,{color:C.in,r:3.4,width:1.6});
  a.stem(after,{color:C.out,r:5.0,width:2.4});
  a.note(-0.2,1.24,'\\text{before the last layer: sixteen amplitudes of size }1/4',{fs:12,color:C.in,anchor:'start',tex:true});
  a.note(-0.2,-0.50,'\\text{after it: one amplitude of size }1',{fs:12,color:C.out,anchor:'start',tex:true});
  return a.svg();
}

/* Deutsch's problem: four functions, two classes, and the one bit the circuit
   returns for each. */
function figDeutsch(){
  const items = [
    wire(50,150,430), wire(112,150,430),
    {t:'text',x:140,y:55,anchor:'end',label:'|0\\rangle',tex:true,fs:13.5},
    {t:'text',x:140,y:117,anchor:'end',label:'|1\\rangle',tex:true,fs:13.5},
    gate(190,50,'H',true), gate(190,112,'H',true),
    {t:'box',x:240,y:30,w:80,h:102,label:'U_{f}',tex:true,fs:17,color:C.h},
    gate(360,50,'H',true),
    meter(420,50)
  ];
  items.push({t:'line',d:'M470,26 V150',color:C.rule});
  const rows = [
    ['f(x)=0','constant','0'],
    ['f(x)=1','constant','0'],
    ['f(x)=x','balanced','1'],
    ['f(x)=1\\oplus x','balanced','1']
  ];
  items.push({t:'text',x:560,y:34,anchor:'middle',label:'the four promised functions',fs:12.5});
  rows.forEach(([f,cls,out],i)=>{
    const y = 66 + i*30;
    items.push({t:'text',x:530,y,anchor:'middle',label:f,tex:true,fs:13.5});
    items.push({t:'text',x:640,y,anchor:'middle',label:cls,fs:12.5,color:i<2?C.in:C.out});
    items.push({t:'text',x:718,y,anchor:'middle',label:out,fs:14,color:i<2?C.in:C.out});
  });
  items.push({t:'text',x:290,y:180,label:'one query',fs:12});
  items.push({t:'text',x:380,y:218,label:'The reading is 0 for a constant function and 1 for a balanced one, every time, from a single query. It never says which',fs:12.5});
  items.push({t:'text',x:380,y:242,label:'of the two constants or which of the two balanced functions it was, and it was never asked to.',fs:12.5,color:C.err});
  return P.blocks({w:760,h:256,items});
}

/* Deutsch-Jozsa: the amplitude of the all-zero string is the mean of the
   signs, so the two promised cases land on 1 and on 0 and on nothing else. */
function figDJ(){
  const items = [];
  const draw = (y0, signs, label, col, val) => {
    items.push({t:'text',x:60,y:y0,anchor:'start',label,fs:12.5,color:col});
    signs.forEach((s,i)=>{
      items.push({t:'text',x:250+i*44,y:y0,anchor:'middle',label:s,fs:16,color:col});
    });
    items.push({t:'text',x:640,y:y0,anchor:'start',label:val,tex:true,fs:15,color:col});
  };
  items.push({t:'text',x:250,y:32,anchor:'start',label:'(-1)^{f(x)}\\text{ for the eight inputs}',tex:true,fs:12.5});
  items.push({t:'text',x:640,y:32,anchor:'start',label:'\\text{mean}',tex:true,fs:12.5});
  items.push({t:'line',d:'M50,44 H730',color:C.rule});
  draw(76,['+','+','+','+','+','+','+','+'],'constant, value 0',C.in,'+1');
  draw(114,['-','-','-','-','-','-','-','-'],'constant, value 1',C.in,'-1');
  draw(158,['+','-','-','+','-','+','+','-'],'balanced, parity',C.out,'0');
  draw(196,['+','+','+','+','-','-','-','-'],'balanced, top bit',C.out,'0');
  items.push({t:'line',d:'M50,222 H730',color:C.rule});
  items.push({t:'text',x:380,y:254,anchor:'middle',label:'\\langle 0^{n}|\\,H^{\\otimes n}\\Big(2^{-n/2}\\textstyle\\sum_{x}(-1)^{f(x)}|x\\rangle\\Big) = \\frac{1}{2^{n}}\\sum_{x}(-1)^{f(x)}',tex:true,fs:16,color:C.mid});
  items.push({t:'text',x:380,y:292,label:'Every balanced function has as many plus signs as minus signs, so they all cancel exactly. The all-zero string is read',fs:12.5});
  items.push({t:'text',x:380,y:316,label:'with probability one for a constant function and with probability zero for a balanced one.',fs:12.5});
  return P.blocks({w:760,h:328,items});
}

/* What the separation is: exact against exact. Both classical curves are
   drawn, because quoting only the deterministic one overstates the result. */
function figDJcost(){
  const a = P.Axes({w:600,h:300,xr:[1,20],yr:[0,8.6],
    xlabel:'n\\,(\\text{input bits})', ylabel:'\\text{queries}',
    pad:{l:76,r:26,t:30,b:48}, xtarget:6,
    yticksOverride:P.decades(0,6), ytickfmt:P.decade});
  a.curve(n => Math.log10(Math.pow(2,n-1)+1), {color:C.err,width:2.6});
  a.curve(() => Math.log10(21), {color:C.h,width:2.2,dash:'5 4'});
  a.curve(() => 0, {color:C.out,width:2.6});
  /* The three names stack in a band above the highest curve, which reaches
     5.72 at twenty bits, and each is drawn in the colour of the curve it
     names rather than in the colour of anything it mentions. */
  a.note(1.4,7.9,'\\text{classical, exact: }2^{n-1}+1',{fs:12.5,color:C.err,anchor:'start',tex:true});
  a.note(1.4,7.0,'\\text{classical, wrong once in a million: }21',{fs:12,color:C.h,anchor:'start',tex:true});
  a.note(1.4,6.1,'\\text{quantum, exact: }1',{fs:12.5,color:C.out,anchor:'start',tex:true});
  return a.svg();
}

/* The transform on one basis state: every magnitude the same, and the phase
   winding at a rate the input index sets. Isotropic: 300 px over an x span of
   2.90 and 300 px over a y span of 2.90, so 103.4 px to the unit either way
   and the eight phases sit on a genuine circle. */
function figQFT(){
  const a = P.Axes({w:620,h:300,xr:[-1.45,2.5375],yr:[-1.45,1.45],
    pad:{l:24,r:266,t:30,b:30}, xticksOverride:[], yticksOverride:[],
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
    a.note(1.16*Math.cos(th),1.16*Math.sin(th),String(k),{fs:12,color:C.muted,anchor:'middle'});
  }
  a.note(1.32,0.98,'F_{8}|3\\rangle = \\tfrac{1}{\\sqrt8}\\sum_{k} e^{2\\pi i\\,3k/8}|k\\rangle',{fs:13,color:C.mid,anchor:'start',tex:true});
  a.note(1.32,0.46,'\\text{every magnitude is }1/\\sqrt8 = 0.354',{fs:12.5,color:C.in,anchor:'start',tex:true});
  a.note(1.32,0.02,'\\text{each step turns by }135^{\\circ}',{fs:12.5,color:C.in,anchor:'start',tex:true});
  a.note(1.32,-0.44,'\\text{the input index sets the rate}',{fs:12.5,color:C.muted,anchor:'start',tex:true});
  a.note(1.32,-0.82,'\\text{of the winding, and nothing else}',{fs:12.5,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* The circuit on three qubits: a Hadamard and then the controlled rotations
   that write the lower bits into the phase, and the swaps that put the output
   back in order. */
function figQFTcirc(){
  const Y=[54,124,194];
  const items = [
    wire(Y[0],130,660), wire(Y[1],130,660), wire(Y[2],130,660),
    {t:'text',x:120,y:Y[0]+5,anchor:'end',label:'q_{2}',tex:true,fs:13.5},
    {t:'text',x:120,y:Y[1]+5,anchor:'end',label:'q_{1}',tex:true,fs:13.5},
    {t:'text',x:120,y:Y[2]+5,anchor:'end',label:'q_{0}',tex:true,fs:13.5},
    gate(168,Y[0],'H',true),
    {t:'line',d:`M230,${Y[0]+17} V${Y[1]}`,color:C.h}, ctrl(230,Y[1]),
    gate(230,Y[0],'R_{2}',true,44),
    {t:'line',d:`M310,${Y[0]+17} V${Y[2]}`,color:C.h}, ctrl(310,Y[2]),
    gate(310,Y[0],'R_{3}',true,44),
    gate(390,Y[1],'H',true),
    {t:'line',d:`M450,${Y[1]+17} V${Y[2]}`,color:C.h}, ctrl(450,Y[2]),
    gate(450,Y[1],'R_{2}',true,44),
    gate(530,Y[2],'H',true),
    /* the output swap, drawn as the crossing it is */
    {t:'line',d:`M596,${Y[0]} L636,${Y[2]}`,color:C.mid},
    {t:'line',d:`M596,${Y[2]} L636,${Y[0]}`,color:C.mid},
    {t:'text',x:616,y:236,label:'swap',fs:11.5,color:C.mid},
    {t:'text',x:240,y:228,label:'the rotations get smaller as the control gets further away',fs:12},
    {t:'text',x:380,y:296,anchor:'middle',label:'R_{k} = \\begin{bmatrix}1&0\\\\0&e^{2\\pi i/2^{k}}\\end{bmatrix}, \\qquad \\tfrac12 n(n+1) \\text{ gates on } n \\text{ qubits}',tex:true,fs:15,color:C.mid},
    {t:'text',x:380,y:342,label:'Six gates here, fifty-five on ten qubits, and dropping the smallest rotations trades a bounded error for less depth.',fs:12.5}
  ];
  return P.blocks({w:760,h:354,items});
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
  const a = P.Axes({w:620,h:274,xr:[-0.6,7.6],yr:[0,0.62],
    xlabel:'k', ylabel:'|\\tilde a_{k}|^{2}',
    pad:{l:74,r:26,t:28,b:46}, xtarget:8, yticksOverride:[0,0.125,0.25,0.375,0.5]});
  a.stem(pts,{color:C.in,r:5,width:2.4});
  a.point(2,amp(2),{color:C.out,r:8});
  a.note(2.2,0.56,'\\text{one run returns } k=2 \\text{, and nothing else}',{fs:12.5,color:C.out,anchor:'start',tex:true});
  a.note(-0.4,0.56,'\\text{eight numbers exist}',{fs:12.5,color:C.in,anchor:'start',tex:true});
  return a.svg();
}

/* The phase-estimation circuit: the counting register, the controlled powers,
   the inverse transform, and the reading. */
function figQPE(){
  const Y=[46,100,154,214];
  const items = [
    wire(Y[0],150,700), wire(Y[1],150,700), wire(Y[2],150,700), wire(Y[3],150,660),
    {t:'text',x:140,y:Y[0]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:13},
    {t:'text',x:140,y:Y[1]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:13},
    {t:'text',x:140,y:Y[2]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:13},
    {t:'text',x:140,y:Y[3]+5,anchor:'end',label:'|u\\rangle',tex:true,fs:13},
    gate(190,Y[0],'H',true), gate(190,Y[1],'H',true), gate(190,Y[2],'H',true),
    {t:'line',d:`M260,${Y[2]} V${Y[3]-17}`,color:C.h}, ctrl(260,Y[2]),
    gate(260,Y[3],'U',true,44),
    {t:'line',d:`M340,${Y[1]} V${Y[3]-17}`,color:C.h}, ctrl(340,Y[1]),
    gate(340,Y[3],'U^{2}',true,54),
    {t:'line',d:`M430,${Y[0]} V${Y[3]-17}`,color:C.h}, ctrl(430,Y[0]),
    gate(430,Y[3],'U^{4}',true,54),
    {t:'box',x:500,y:26,w:76,h:150,label:'F^{\\dagger}',tex:true,fs:17,color:C.mid},
    meter(620,Y[0]), meter(620,Y[1]), meter(620,Y[2]),
    {t:'text',x:345,y:252,label:'each control writes its own power of the phase',fs:12},
    {t:'text',x:664,y:252,anchor:'middle',label:'y,\\ \\varphi \\approx y/2^{t}',tex:true,fs:13},
    {t:'line',d:'M40,278 H720',color:C.rule},
    {t:'text',x:380,y:312,anchor:'middle',label:'U|u\\rangle = e^{2\\pi i\\varphi}|u\\rangle \\;\\Longrightarrow\\; \\tfrac{1}{\\sqrt{2^{t}}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i k\\varphi}|k\\rangle \\;\\xrightarrow{\\;F^{\\dagger}\\;}\\; \\text{a spike near } 2^{t}\\varphi',tex:true,fs:15,color:C.mid},
    {t:'text',x:380,y:348,label:'The counting register has been made to hold the phase as a binary number. The inverse transform is what reads it.',fs:12.5}
  ];
  return P.blocks({w:760,h:360,items});
}

/* The exact case: a phase that is a whole number of steps, and every wrong
   outcome cancelling to nothing. */
function figQPEexact(){
  const t = 3, Q = 8, phi = 3/8;
  const pts=[]; for(let y=0;y<Q;y++) pts.push([y, qpeProb(phi,t,y)]);
  const a = P.Axes({w:600,h:300,xr:[-0.6,7.6],yr:[0,1.34],
    xlabel:'y', ylabel:'P(y)',
    pad:{l:70,r:26,t:30,b:48}, xtarget:8, yticksOverride:[0,0.25,0.5,0.75,1]});
  a.stem(pts,{color:C.in,r:5,width:2.4,showZero:true});
  a.point(3,1,{color:C.out,r:7.5});
  a.note(3.3,1.14,'y=3,\\; \\varphi = 3/8 = 0.375',{fs:12.5,color:C.out,anchor:'start',tex:true});
  a.note(-0.4,1.14,'\\text{seven outcomes cancel exactly}',{fs:12.5,color:C.in,anchor:'start',tex:true});
  return a.svg();
}

/* The inexact case, at two register sizes: the mass concentrates and the
   answer is still only very probable. */
function figQPEprec(){
  const phi = 0.3;
  /* The frame reaches to 1.40 because the six-qubit peak is 0.875 and a stem
     is drawn outside the clip: a range that stopped at 0.78 would let the one
     peak this figure exists to show run off the top of the frame. */
  const a = P.Axes({w:600,h:300,xr:[-0.02,1.02],yr:[0,1.40],
    xlabel:'y/2^{t}', ylabel:'P',
    pad:{l:70,r:26,t:30,b:48}, xtarget:5, yticksOverride:[0,0.25,0.5,0.75,1]});
  const draw = (t,col,r) => { const Q=1<<t, pts=[];
    for(let y=0;y<Q;y++) pts.push([y/Q, qpeProb(phi,t,y)]);
    a.stem(pts,{color:col,r,width:1.8,showZero:true}); };
  draw(3,C.in,4.6);
  draw(6,C.out,3.0);
  a.vline(phi,{color:C.err,width:1.6,dash:'4 4'});
  a.note(0.32,1.06,'\\varphi = 0.3',{fs:12.5,color:C.err,anchor:'start',tex:true});
  a.note(0.50,1.32,'t=3\\text{: coarse, and never exact}',{fs:12,color:C.in,anchor:'start',tex:true});
  a.note(0.50,1.18,'t=6\\text{: tighter, and still a distribution}',{fs:12,color:C.out,anchor:'start',tex:true});
  return a.svg();
}

/* Where the cost is: the controlled powers, against the transform that reads
   them. Both axes are counts, and the vertical one is logarithmic because the
   two differ by three decades before the register is large. */
function figQPEcost(){
  const a = P.Axes({w:600,h:300,xr:[2,14],yr:[0,4.4],
    xlabel:'t\\,(\\text{counting qubits})', ylabel:'\\text{operations}',
    pad:{l:78,r:26,t:30,b:48}, xtarget:6,
    yticksOverride:P.decades(0,4), ytickfmt:P.decade});
  a.curve(t => Math.log10(Math.pow(2,t)-1), {color:C.err,width:2.6});
  a.curve(t => Math.log10(t*(t+1)/2), {color:C.out,width:2.6});
  a.note(6.4,3.9,'\\text{applications of } U:\\; 2^{t}-1',{fs:12.5,color:C.err,anchor:'start',tex:true});
  a.note(6.4,0.66,'\\text{gates in } F^{\\dagger}:\\; \\tfrac12 t(t+1)',{fs:12.5,color:C.out,anchor:'start',tex:true});
  a.point(10,Math.log10(1023),{color:C.err,r:6});
  a.point(10,Math.log10(55),{color:C.out,r:6});
  a.note(10.2,2.72,'1023',{fs:12.5,color:C.err,anchor:'start'});
  a.note(10.2,1.94,'55',{fs:12.5,color:C.out,anchor:'start'});
  return a.svg();
}

/* Quantum counting: the same estimator pointed at the Grover iteration, so
   that the number of marked candidates comes out before the search is run. */
function figCount(){
  const items = [
    {t:'box',x:40,y:44,w:180,h:58,label:'the Grover step',fs:13,color:C.h},
    {t:'arrow',x1:220,y1:73,x2:266,y2:73},
    {t:'box',x:266,y:44,w:200,h:58,label:'phase estimation',fs:13,color:C.mid},
    {t:'arrow',x1:466,y1:73,x2:512,y2:73},
    {t:'box',x:512,y:44,w:210,h:58,label:'an estimate of M',fs:13,color:C.out},
    {t:'text',x:130,y:126,label:'\\text{its two eigenvalues are } e^{\\pm 2i\\theta}',tex:true,fs:12},
    {t:'text',x:366,y:126,label:'\\text{reads } \\theta \\text{ off the phase}',tex:true,fs:12},
    {t:'text',x:617,y:126,label:'\\text{through } M = N\\sin^{2}\\theta',tex:true,fs:12},
    {t:'text',x:380,y:174,anchor:'middle',label:'\\sin^{2}\\theta = M/N \\quad\\Longrightarrow\\quad M = N\\sin^{2}\\theta',tex:true,fs:17,color:C.mid},
    {t:'text',x:380,y:216,label:'Chapter 5 left a hole: the best number of Grover iterations needs M, and M is what was not known. This closes it, and the',fs:12.5},
    {t:'text',x:380,y:240,label:'closing costs about as many queries again, so counting first and searching after is still a square-root method overall.',fs:12.5}
  ];
  return P.blocks({w:760,h:254,items});
}

/* The order of a modulo N, as the thing that repeats. */
function figOrder(){
  const N = 15, a0 = 2, r = orderOf(a0,N);
  const pts=[]; let x=1;
  for(let k=0;k<=12;k++){ pts.push([k,x]); x=(x*a0)%N; }
  const a = P.Axes({w:600,h:300,xr:[0,12],yr:[0,15.8],
    xlabel:'k', ylabel:'2^{k} \\bmod 15',
    pad:{l:70,r:26,t:30,b:48}, xtarget:6, yticksOverride:[0,4,8,12]});
  a.stem(pts,{color:C.in,r:5,width:2.0});
  [0,4,8,12].forEach(k=>a.point(k,1,{color:C.out,r:7}));
  a.span(0,4,13.6,'r = '+r,{color:C.out,fs:13,tex:true});
  a.note(5.2,13.0,'\\text{the sequence repeats, and the period is the order}',{fs:12.5,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* Where the order hides: the eigenphases of the multiplication operator are
   the r fractions s/r, and the state the circuit actually starts in is their
   even mixture. */
function figOrderEig(){
  const r = 4;
  const a = P.Axes({w:600,h:280,xr:[-0.06,1.06],yr:[0,1.30],
    xlabel:'\\varphi', ylabel:'\\text{weight}',
    pad:{l:70,r:26,t:30,b:48}, xtarget:5, yticksOverride:[0,0.25,0.5,0.75,1]});
  const pts=[]; for(let s=0;s<r;s++) pts.push([s/r, 1/r]);
  a.stem(pts,{color:C.in,r:6,width:2.4});
  ['0','1/4','2/4','3/4'].forEach((L,s)=>
    a.note(s/r,0.34,'\\varphi=\\tfrac{'+(s)+'}{4}',{fs:12,color:C.in,anchor:'middle',tex:true}));
  a.note(0.02,1.20,'U_{a}|u_{s}\\rangle = e^{2\\pi i s/r}|u_{s}\\rangle, \\qquad \\tfrac{1}{\\sqrt r}\\sum_{s}|u_{s}\\rangle = |1\\rangle',{fs:13,color:C.mid,anchor:'start',tex:true});
  a.note(0.02,0.62,'\\text{each eigenphase is drawn with probability } 1/r',{fs:12.5,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* The cost of the whole order-finding circuit, and where it sits: the
   modular exponentiation, and not the transform that reads it. */
function figModexp(){
  const a = P.Axes({w:600,h:300,xr:[0,2600],yr:[2,13.4],
    xlabel:'L\\,(\\text{bits of }N)', ylabel:'\\text{gates}',
    pad:{l:78,r:26,t:30,b:48}, xtarget:5,
    yticksOverride:P.decades(2,11).filter(v=>v%2===0), ytickfmt:P.decade});
  a.curve(L => L>0 ? 3*Math.log10(L) + Math.log10(4) : null, {color:C.err,width:2.6});
  a.curve(L => L>0 ? 2*Math.log10(2*L) : null, {color:C.out,width:2.6});
  /* Both names sit in the band above the higher curve, which no value can
     enter: the arithmetic tops out at 10.8 and the frame reaches 12.4. */
  a.note(120,12.0,'\\text{modular exponentiation: order } L^{3}',{fs:12.5,color:C.err,anchor:'start',tex:true});
  a.note(1180,7.9,'\\text{the transform: order } L^{2}',{fs:12.5,color:C.out,anchor:'start',tex:true});
  a.vline(2048,{color:C.rule,width:1.3,dash:'3 4'});
  a.note(2048,2.9,'L=2048',{fs:12,color:C.muted,anchor:'middle',tex:true});
  a.note(120,2.4,'\\text{the expensive part is the arithmetic}',{fs:12,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* Continued fractions: the measured fraction, and the ladder that turns it
   into the small denominator hiding inside it. */
function figCF(){
  const rows = [
    ['0','0','0/1'],
    ['6','1/6','1/6'],
    ['42','42/253','253'],
    ['2','\\ldots','']
  ];
  const items = [
    {t:'text',x:380,y:34,anchor:'middle',label:'\\frac{y}{Q} = \\frac{85}{512} = 0.166016\\ldots',tex:true,fs:18,color:C.in},
    {t:'text',x:130,y:80,anchor:'middle',label:'step',fs:12.5},
    {t:'text',x:330,y:80,anchor:'middle',label:'quotient',fs:12.5},
    {t:'text',x:540,y:80,anchor:'middle',label:'convergent',fs:12.5},
    {t:'line',d:'M60,92 H700',color:C.rule}
  ];
  [['1','0','0/1'],['2','6','1/6'],['3','42','42/253']].forEach(([k,q,c],i)=>{
    const y = 124 + i*38;
    const hit = i===1;
    items.push({t:'text',x:130,y,anchor:'middle',label:k,fs:14});
    items.push({t:'text',x:330,y,anchor:'middle',label:q,fs:14});
    items.push({t:'text',x:540,y,anchor:'middle',label:c,tex:true,fs:15,color:hit?C.out:C.muted});
  });
  items.push({t:'text',x:660,y:162,anchor:'start',label:'\\leftarrow r=6',tex:true,fs:15,color:C.out});
  items.push({t:'line',d:'M60,250 H700',color:C.rule});
  items.push({t:'text',x:380,y:284,label:'The convergent wanted is the last one whose denominator is smaller than the number being factored. Confirming it costs',fs:12.5});
  items.push({t:'text',x:380,y:308,label:'one modular exponentiation to accept or reject, and that check is classical and cheap.',fs:12.5});
  return P.blocks({w:760,h:320,items});
}

/* The failure modes, and what each of them costs: a run that fails is
   detected and repeated, and none of the repairs is quantum. */
function figRepeat(){
  /* The colour marks the repair and not the row, because the repair is what
     the third column is about: amber for a run that is simply repeated, red
     for one that costs a whole base, green for the one that finishes. Two
     rows share a repair and therefore share a colour. */
  const rows = [
    ['\\text{the outcome is } s=0','no information at all','measure again',C.h,true],
    ['s \\text{ and } r \\text{ share a factor}','a proper divisor of the order','measure again',C.h,true],
    ['\\text{the order } r \\text{ is odd}','no square root to take','choose another base',C.err,true],
    ['a^{r/2} \\equiv -1','the two divisors are trivial','choose another base',C.err,true],
    ['otherwise','two factors of N','done',C.out,false]
  ];
  const items = [
    {t:'text',x:180,y:32,anchor:'middle',label:'what went wrong',fs:12.5},
    {t:'text',x:430,y:32,anchor:'middle',label:'what comes out',fs:12.5},
    {t:'text',x:650,y:32,anchor:'middle',label:'what to do',fs:12.5},
    {t:'line',d:'M34,44 H726',color:C.rule}
  ];
  rows.forEach(([a,b,c,col,tx],i)=>{
    const y = 78 + i*38;
    items.push({t:'text',x:180,y,anchor:'middle',label:a,tex:tx,fs:13,color:col});
    items.push({t:'text',x:430,y,anchor:'middle',label:b,fs:13});
    items.push({t:'text',x:650,y,anchor:'middle',label:c,fs:13,color:col});
  });
  items.push({t:'line',d:'M34,286 H726',color:C.rule});
  items.push({t:'text',x:380,y:318,label:'Every branch above is decided by classical arithmetic on numbers that have already been measured. The quantum part is',fs:12.5});
  items.push({t:'text',x:380,y:342,label:'run again from the beginning, and a constant expected number of runs is enough.',fs:12.5,color:C.out});
  return P.blocks({w:760,h:354,items});
}

/* The workflow, with the one quantum box marked and everything else in the
   tone of the classical work it is. */
function figShor(){
  const steps = [
    ['choose a base, and take one greatest common divisor','classical'],
    ['find the order of that base','quantum'],
    ['read the order off by continued fractions','classical'],
    ['confirm the candidate order','classical'],
    ['take two more greatest common divisors','classical']
  ];
  const items = [];
  steps.forEach(([txt,kind],i)=>{
    const y = 26 + i*44;
    const q = kind==='quantum';
    items.push({t:'box',x:60,y,w:400,h:34,label:txt,fs:12.5,color:q?C.h:C.rule});
    items.push({t:'text',x:500,y:y+22,anchor:'start',label:kind,fs:12.5,color:q?C.h:C.muted});
    if(i<4) items.push({t:'line',d:`M260,${y+34} V${y+44}`,color:C.rule});
  });
  items.push({t:'text',x:380,y:262,anchor:'middle',label:'\\gcd\\big(a^{r/2}-1,\\,N\\big) \\quad\\text{and}\\quad \\gcd\\big(a^{r/2}+1,\\,N\\big)',tex:true,fs:16,color:C.out});
  items.push({t:'text',x:380,y:300,label:'One box in five, and it is the only one that needs a quantum computer. The other four are arithmetic on integers that a',fs:12.5});
  items.push({t:'text',x:380,y:324,label:'laptop does in microseconds, which is exactly why the cost of the whole thing is decided inside that one box.',fs:12.5,color:C.err});
  return P.blocks({w:760,h:336,items});
}

/* The whole of N = 15 with a = 2, worked, so that the classical steps can be
   checked by hand and the quantum step can be seen to be one of five. */
function figShor15(){
  const N = 15, a0 = 2, r = orderOf(a0,N);
  const half = Math.pow(a0,r/2);
  const items = [
    {t:'text',x:380,y:38,anchor:'middle',label:'N = 15, \\qquad a = 2, \\qquad \\gcd(2,15) = 1',tex:true,fs:17,color:C.in},
    {t:'text',x:380,y:86,anchor:'middle',label:'2^{0},2^{1},2^{2},2^{3},2^{4} \\equiv 1,\\,2,\\,4,\\,8,\\,1 \\pmod{15}',tex:true,fs:17},
    {t:'text',x:380,y:124,anchor:'middle',label:'r = '+r+'\\text{, which is even}',tex:true,fs:16,color:C.h},
    {t:'text',x:380,y:168,anchor:'middle',label:'2^{r/2} = '+half+' \\not\\equiv -1 \\pmod{15}',tex:true,fs:16,color:C.h},
    {t:'text',x:230,y:216,anchor:'middle',label:'\\gcd('+(half-1)+',15) = '+gcd(half-1,N),tex:true,fs:17,color:C.out},
    {t:'text',x:530,y:216,anchor:'middle',label:'\\gcd('+(half+1)+',15) = '+gcd(half+1,N),tex:true,fs:17,color:C.out},
    {t:'text',x:380,y:252,anchor:'middle',label:'15 = 3 \\times 5',tex:true,fs:18,color:C.out},
    {t:'text',x:380,y:292,label:'A favourable choice. Starting from fourteen instead, the order is two and its square root is minus one, so both greatest',fs:12.5},
    {t:'text',x:380,y:316,label:'common divisors come out trivial and the whole run is thrown away. That is why the procedure repeats.',fs:12.5,color:C.err}
  ];
  return P.blocks({w:760,h:328,items});
}

/* What the result threatens and what it does not. */
function figRSA(){
  return P.blocks({w:760,h:280,items:[
    {t:'box',x:34,y:40,w:330,h:44,label:'RSA, Diffie-Hellman, elliptic curves',fs:13,color:C.err},
    {t:'text',x:199,y:106,label:'broken by a large fault-tolerant machine',fs:12,color:C.err},
    {t:'box',x:34,y:132,w:330,h:44,label:'AES and hash functions',fs:13,color:C.out},
    {t:'text',x:199,y:198,label:'weakened by a square root, and a longer key fixes that',fs:12,color:C.out},
    {t:'box',x:410,y:40,w:316,h:136,label:'',color:C.rule},
    {t:'text',x:568,y:74,label:'the reason to move now',fs:13,color:C.h},
    {t:'text',x:568,y:104,label:'traffic can be recorded today',fs:12},
    {t:'text',x:568,y:130,label:'and decrypted whenever the',fs:12},
    {t:'text',x:568,y:156,label:'machine finally exists',fs:12},
    {t:'text',x:380,y:224,label:'Public-key cryptography rests on the absence of a known efficient attack, never on a proof that one cannot exist. The',fs:12.5},
    {t:'text',x:380,y:248,label:'replacements are classical algorithms chosen because no efficient quantum attack on them is known either.',fs:12.5},
    {t:'text',x:380,y:272,label:'Nothing here is a demonstration that any deployed key is at risk today.',fs:12.5,color:C.out}
  ]});
}

/* Shor's claim, laid against the five things a claim has to name. */
function figShorClaim(){
  const rows = [
    ['task','\\text{factor an } L\\text{-bit integer } N = pq',C.h,true],
    ['input model','the number itself, with no oracle and nothing to load',C.h],
    ['accuracy','a constant success probability per attempt, checked classically',C.h],
    ['hardware model','fault tolerant, millions of physical qubits, hours of running',C.err],
    ['baseline','\\text{the number field sieve: } e^{c\\,L^{1/3}(\\log L)^{2/3}}\\text{, not } 2^{L}',C.err,true]
  ];
  const items = [];
  rows.forEach(([k,v,col,tex],i)=>{
    const y = 20 + i*38;
    items.push({t:'box',x:30,y,w:150,h:30,label:k,fs:12.5,color:col});
    items.push({t:'text',x:196,y:y+20,anchor:'start',label:v,tex:!!tex,fs:12.5});
  });
  /* The two boxes in the error tone are the last two, and the caption beside
     this figure says two. A caption that names a count has to match what the
     figure marks. */
  items.push({t:'text',x:380,y:236,anchor:'middle',label:'\\text{superpolynomial against the best known method, and not against a proved lower bound}',tex:true,fs:14,color:C.out});
  items.push({t:'text',x:380,y:266,label:'The gap is real and it is large. It is a gap against an algorithm, and no proof says factoring is hard.',fs:12.5});
  return P.blocks({w:760,h:278,items});
}

/* The family the one move belongs to. */
function figFamily(){
  return P.blocks({w:760,h:278,items:[
    {t:'box',x:24,y:32,w:712,h:180,label:'',color:C.rule},
    {t:'text',x:380,y:60,label:'the hidden subgroup problem',fs:14,color:C.muted},
    {t:'box',x:70,y:76,w:620,h:120,label:'',color:C.mid},
    {t:'text',x:380,y:104,label:'period finding',fs:14,color:C.mid},
    {t:'box',x:130,y:120,w:500,h:62,label:'',color:C.in},
    {t:'text',x:380,y:148,label:'order finding',fs:14,color:C.in},
    {t:'text',x:380,y:172,label:'factoring, discrete logarithms',fs:12.5,color:C.in},
    {t:'text',x:380,y:238,label:'One mechanism, one transform, and a family of problems whose answers are hidden in a period. Grover is outside it, which is',fs:12.5},
    {t:'text',x:380,y:262,label:'why its saving is a square root and these are more than that.',fs:12.5}
  ]});
}

/* The chapter as one ladder. */
function figLadder(){
  return P.blocks({w:760,h:200,items:[
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
    {t:'text',x:667,y:124,label:'five things, or nothing',fs:12},
    {t:'text',x:380,y:170,label:'Every algorithm in this chapter is these four steps with a different question written into the first one.',fs:12.5}
  ]});
}

const SC = [

/* ---------------------------------------------------------------- 6.0.1 -- */
{ id:'m6-open', module:'M6', nav:'One mechanism, four uses', title:'Every algorithm in this chapter is the same move, made four times',
  objective:'State the one mechanism this chapter is built on and the sentence every algorithm in it has to answer.',
  keywords:'quantum algorithms overview module 6 phase kickback interference cancellation deutsch jozsa fourier phase estimation shor introduction',
  src:'L10 · computational models: what is being counted?', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Quantum algorithms'},
  {t:'title', text:'Every algorithm in this chapter is the same move, made four times'},
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
  src:'L10 · computational models: what is being counted?', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · What a query model counts'},
  {t:'title', text:'A query count is one number, and it is not the cost of anything'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Most of the results in this chapter are stated in a <b>query model</b>. The algorithm is given a black box that computes an unknown function $f$, and it is charged one <b>query</b> each time it uses that box, whatever is inside.</p>'},
    {t:'eq', key:true, tex:'U_{f}\\,|x\\rangle|y\\rangle = |x\\rangle\\,|y \\oplus f(x)\\rangle'},
    {t:'body', html:'<p>The exclusive-or in the second register is what makes the box reversible, and chapter 4 built exactly this embedding. The model is useful because it can be reasoned about: how many questions must be asked before the answer is forced is a question with a proof attached to it.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'It is also a model that hides things on purpose. Building $U_{f}$ as a real circuit costs gates, and those gates are not counted. Loading data into the box, if the function is a lookup rather than a formula, is not counted. Error correction is not counted. A query separation is a theorem about the first column of the figure and says nothing about the third.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQuery(),
      caption:'The same box, seen three ways. A theorem in the first column is real and provable; a claim about a wall clock lives in the third, and the two are not the same claim.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'An algorithm needs $25$ queries where a classical method needs $512$. One query costs a circuit of $4000$ gates on the quantum machine; the classical evaluation costs $30$ operations.'],
        ['Work', 'Quantum gate count: $25 \\times 4000 = 10^{5}$. Classical operation count: $512 \\times 30 = 1.54\\times10^{4}$.'],
        ['Answer', 'The query count improved by a factor of about twenty and the operation count got about six times worse.'],
        ['Check', 'Both numbers are right and they point opposite ways, which is the normal situation. The query saving becomes a real saving only when the problem is large enough that the ratio $\\sqrt{N}$ against $N$ beats the fixed ratio of the two query costs.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The word "exponential" is doing a lot of work in most sentences it appears in', html:'Deutsch–Jozsa has an exponential separation in <b>exact</b> query complexity <b>under a promise</b>. Remove any one of those three qualifiers and the statement becomes false. Chapter 5 asked for five things before a resource claim counts as a claim; this chapter asks for them again, and the input model is the one that decides most of these.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.1.2 -- */
{ id:'m6-classes', module:'M6', nav:'What the classes mean', title:'The classes name what is settled in polynomial time, and P is inside all of them',
  objective:'State what P, BPP, BQP and NP contain, and which containments are known.',
  keywords:'complexity classes P BPP BQP NP decision problem polynomial time bounded error containment factoring np complete input length',
  src:'L10 · computational models: what is being counted?', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · What a query model counts'},
  {t:'title', text:'The classes name what is settled in polynomial time, and P is inside all of them'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A <b>decision problem</b> asks a yes-or-no question about an input, and its size is the number of bits the input is written in. That last point is where the arguments start: the number $N$ has about $\\log_{2}N$ bits, so an algorithm that runs in time $N$ is <b>exponential</b> in the size of its input, not linear.</p>'},
    {t:'body', html:'<p>Four classes, and each is a promise about polynomial time in that bit length:</p>'},
    {t:'small', html:'<b>P</b> — settled by an ordinary algorithm. <b>BPP</b> — settled by an algorithm allowed to toss coins and be wrong with probability below one third. <b>BQP</b> — settled by a quantum algorithm with the same allowance. <b>NP</b> — a yes answer comes with a certificate that can be <b>checked</b> quickly, which says nothing about finding it.'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'What is known is $\\mathrm{P}\\subseteq\\mathrm{BPP}\\subseteq\\mathrm{BQP}$ and $\\mathrm{P}\\subseteq\\mathrm{NP}$. Whether $\\mathrm{NP}\\subseteq\\mathrm{BQP}$ is open, and no efficient quantum algorithm is known for any NP-complete problem. Grover gives a square root on the search, and a square root of an exponential is still an exponential.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figClasses(),
      caption:'The four classes and the containments that are known. Deliberately not a Venn diagram: a nested picture would have to assert something about every pair, and two of those pairs are open questions.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Factoring a $2048$-bit modulus.'],
        ['Work', 'The input is $2048$ bits. Trial division to $\\sqrt{N}$ takes about $2^{1024}$ steps, which is exponential in $2048$. Shor takes a number of operations polynomial in $2048$.'],
        ['Answer', 'Factoring is in NP and in BQP, and it is not known to be NP-complete.'],
        ['Check', 'A certificate for a yes answer is a factor, and multiplying two numbers to confirm it is fast — so the NP membership is easy to see. Nothing about the BQP membership follows from that.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'"Quantum computers solve NP-complete problems" is false as far as anyone knows', html:'The problems a quantum computer is known to settle faster are the ones with hidden algebraic structure — a period, an order, a discrete logarithm. Those are believed <b>not</b> to be NP-complete, and that is precisely why they can have this kind of structure to exploit. A claim that reaches beyond them needs a citation, and there is not one.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.2.1 -- */
{ id:'m6-kick', module:'M6', nav:'Phase kickback', title:'Point the oracle at the state it cannot change and it writes a phase instead',
  objective:'Derive phase kickback for a Boolean oracle and say why the target register is left untouched.',
  keywords:'phase kickback minus state eigenstate of x oracle boolean function sign relative phase mechanism ancilla unchanged',
  src:'L10 · phase kickback and the Deutsch-Jozsa proof', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · One mechanism'},
  {t:'title', text:'Point the oracle at the state it cannot change and it writes a phase instead'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The oracle writes $f(x)$ into the second register by flipping it, and a flip is the gate $X$. So choose for the second register the one state that $X$ leaves alone up to a sign:</p>'},
    {t:'eq', tex:'X\\,|{-}\\rangle = -\\,|{-}\\rangle, \\qquad |{-}\\rangle = \\tfrac{1}{\\sqrt2}\\big(|0\\rangle - |1\\rangle\\big)'},
    {t:'body', html:'<p>Now run the oracle. When $f(x)=0$ nothing happens. When $f(x)=1$ the flip happens and produces a minus sign. Both cases are one line:</p>'},
    {t:'eq', key:true, tex:'U_{f}\\,|x\\rangle|{-}\\rangle = (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The second register never changes at all, so it can be prepared once and ignored. The value of $f$ has become a <b>relative phase</b> among the terms of the first register, and chapter 1 said what that is worth: a relative phase is observable, and it is observable through interference and through nothing else.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figKick(),
      caption:'The oracle acts, the lower wire comes out exactly as it went in, and the answer is a sign attached to the upper one. Nothing was measured and nothing was copied.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'One query qubit in $|{+}\\rangle$, the target in $|{-}\\rangle$, and the balanced oracle $f(x)=x$.'],
        ['Work', 'The state is $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)|{-}\\rangle$. The oracle multiplies the $|x\\rangle$ term by $(-1)^{x}$, giving $\\tfrac{1}{\\sqrt2}(|0\\rangle-|1\\rangle)|{-}\\rangle$.'],
        ['Answer', 'The query qubit has gone from $|{+}\\rangle$ to $|{-}\\rangle$, and a Hadamard now turns it into $|1\\rangle$, which is read with certainty.'],
        ['Check', 'Run the same argument with $f(x)=0$: nothing changes, the qubit is still $|{+}\\rangle$, and the Hadamard returns $|0\\rangle$. Two different promised functions, two different certain answers, one query each.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The phase is on the first register even though the gate was written on the second', html:'This is the step readers re-derive three times before believing it. The sign $(-1)^{f(x)}$ multiplies a term of the <b>whole</b> state, so it can be read as belonging to either factor — and because the second factor is the same $|{-}\\rangle$ in every term, the only place the sign can make a difference is between the terms of the first. A global sign on the whole state would be unobservable; this one is not, because $f(x)$ differs from term to term.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.2.2 -- */
{ id:'m6-eigen', module:'M6', nav:'The general form', title:'The same move with any unitary: an eigenstate sends its phase up to the control',
  objective:'Show that a controlled unitary acting on one of its eigenstates writes the eigenphase onto the control qubit.',
  keywords:'controlled unitary eigenstate eigenphase kickback general form control qubit relative phase estimation preparation',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · One mechanism'},
  {t:'title', text:'The same move with any unitary: an eigenstate sends its phase up to the control'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Nothing above used the fact that the operation was a bit flip. It used only that the target was prepared in an <b>eigenstate</b> of it. So replace $X$ by any unitary $U$ and $|{-}\\rangle$ by an eigenstate $|u\\rangle$:</p>'},
    {t:'eq', tex:'U\\,|u\\rangle = e^{2\\pi i \\varphi}\\,|u\\rangle, \\qquad 0 \\le \\varphi < 1'},
    {t:'body', html:'<p>Because $U$ is unitary its eigenvalues have modulus one, so they are pure phases and can always be written this way. Now control $U$ on a qubit prepared in $|{+}\\rangle$:</p>'},
    {t:'eq', key:true, tex:'\\mathrm{c}U\\,\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+|1\\rangle\\big)|u\\rangle = \\tfrac{1}{\\sqrt2}\\big(|0\\rangle+e^{2\\pi i \\varphi}|1\\rangle\\big)|u\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The target is untouched again, and the eigenphase is now a relative phase on one qubit. Chapter 5\u2019s three-gate circuit — a Hadamard, a phase, a Hadamard — turns a relative phase into a probability, and the rest of this chapter is that idea done with $t$ qubits at once so that the phase comes out as a binary number instead of as one probability.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figEigen(),
      caption:'One controlled gate. The lower wire is unchanged and the upper one has picked up the eigenvalue. The wanted number is now a relative phase, which is the only kind of number this course can read.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$U = T = \\operatorname{diag}(1, e^{i\\pi/4})$ and the target prepared in $|1\\rangle$.'],
        ['Work', '$T|1\\rangle = e^{i\\pi/4}|1\\rangle$, so $2\\pi\\varphi = \\pi/4$ and $\\varphi = 1/8$.'],
        ['Answer', 'The control comes out as $\\tfrac{1}{\\sqrt2}\\left(|0\\rangle + e^{i\\pi/4}|1\\rangle\\right)$, a state on the equator of the Bloch sphere at azimuth $45^{\\circ}$.'],
        ['Check', '$\\varphi = 1/8$ is $0.001$ in binary and needs three bits, so a counting register of three qubits should read it exactly. That is what the next section builds.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'This needs an eigenstate, and getting one can be the hard part', html:'The whole construction assumes $|u\\rangle$ is available. Sometimes it is not, and then the input is a superposition $\\sum_{k}c_{k}|u_{k}\\rangle$; the procedure still runs and returns the eigenphase $\\varphi_{k}$ with probability $|c_{k}|^{2}$. It samples one eigenphase; it does not list the spectrum. Order finding turns this apparent weakness into the thing that makes it work.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.2.3 -- */
{ id:'m6-cancel', module:'M6', nav:'Why a superposition is free', title:'A superposition costs one layer and buys nothing until the wrong terms cancel',
  objective:'Explain why quantum parallelism alone gives no advantage, and what interference has to do before a measurement is worth taking.',
  keywords:'quantum parallelism superposition free interference cancellation readout small state large amplitudes measurement one string',
  src:'L10 · phase kickback and the Deutsch-Jozsa proof', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · One mechanism'},
  {t:'title', text:'A superposition costs one layer and buys nothing until the wrong terms cancel'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>One layer of Hadamards on $n$ qubits produces every input at once, and one query then produces every output at once:</p>'},
    {t:'eq', tex:'\\frac{1}{2^{n/2}}\\sum_{x} |x\\rangle \\;\\xrightarrow{\\;U_{f}\\;}\\; \\frac{1}{2^{n/2}}\\sum_{x} (-1)^{f(x)}|x\\rangle'},
    {t:'body', html:'<p>Measure now and a uniformly random $x$ comes out. Every amplitude has the same modulus, so every string is equally likely, and the signs — which are the entire content of what the query returned — are invisible in this basis. The run has cost a query and returned a coin toss.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>What the last layer of Hadamards does is add the $2^{n}$ signed amplitudes together, so that a term with a plus and a term with a minus destroy each other:</p>'},
      {t:'eq', key:true, tex:'\\langle 0^{n}|\\,H^{\\otimes n}\\Big(\\tfrac{1}{2^{n/2}}\\textstyle\\sum_{x}(-1)^{f(x)}|x\\rangle\\Big) = \\frac{1}{2^{n}}\\sum_{x}(-1)^{f(x)}'},
      {t:'small', html:'That single number is what the algorithm is for. It is not any one value of $f$; it is a <b>global</b> property of the whole table, and it arrived because the unwanted terms cancelled.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCancel(),
      caption:'Sixteen amplitudes before the last layer of Hadamards and one after it, for a balanced function on four bits. The first picture is worth nothing; the second is the whole answer.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The rule, in one line', html:'A quantum algorithm has to make the amplitudes of every answer it does not want <b>cancel</b>, and it has to do that before anything is measured. The readout returns $n$ bits, never $2^{n}$ numbers, so any design that needs to see many amplitudes has already failed. Every algorithm in this chapter is answerable to this sentence and each one answers it differently.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'"It computes all the values in parallel" is true and useless', html:'The superposition really does contain all $2^{n}$ values. It is useless because the only way to look at it is to measure it, and a measurement of a state with $2^{n}$ equal amplitudes is a random number generator. The interesting question is never how many values are held; it is which arrangement of phases lets one number survive the sum.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.3.1 -- */
{ id:'m6-deutsch', module:'M6', nav:'Deutsch\u2019s problem', title:'One query decides a property that two are needed for classically',
  objective:'State Deutsch\u2019s promise problem, run the three-gate circuit, and say exactly what the reading means.',
  keywords:'deutsch algorithm promise problem constant balanced one query four functions circuit hadamard oracle single bit',
  src:'L10 · Deutsch\u2019s promise problem', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Deutsch and Deutsch\u2013Jozsa'},
  {t:'title', text:'One query decides a property that two are needed for classically'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A black box holds one of the four functions $f:\\{0,1\\}\\to\\{0,1\\}$. Two of them are <b>constant</b> — they return the same value on both inputs — and two are <b>balanced</b>, returning $0$ once and $1$ once. The task is to say which class it is in. It is not to find the function.</p>'},
    {t:'body', html:'<p>Classically this needs both values: knowing $f(0)$ alone rules nothing out. So two queries, and no clever ordering avoids it.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The quantum circuit uses one. Prepare the query qubit in $|{+}\\rangle$ and the target in $|{-}\\rangle$, query once, and Hadamard the query qubit:</p>'},
      {t:'eq', key:true, tex:'\\tfrac{1}{\\sqrt2}\\Big((-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\Big) \\;\\xrightarrow{\\;H\\;}\\; \\pm\\,|\\,f(0)\\oplus f(1)\\,\\rangle'},
      {t:'small', html:'The reading is $f(0)\\oplus f(1)$, which is $0$ for both constant functions and $1$ for both balanced ones. It is exactly the one bit that was asked for, and the two bits that were not asked for never appear.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDeutsch(),
      caption:'The circuit and the four promised functions. Each pair of functions gives the same reading, because the reading is the property and not the function.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The balanced oracle $f(x)=x$, implemented as a CNOT from the query qubit to the target.'],
        ['Work', 'Kickback gives $(-1)^{x}$ on the query term, so the query qubit becomes $\\tfrac{1}{\\sqrt2}(|0\\rangle-|1\\rangle) = |{-}\\rangle$.'],
        ['Answer', 'The final Hadamard sends $|{-}\\rangle$ to $|1\\rangle$, so every ideal shot reads $1$: balanced.'],
        ['Check', 'The target is still $|{-}\\rangle$ up to a global phase, and it is not entangled with the query qubit. Measuring it would give a fair coin and would say nothing, which is the sign that the answer really is on the other wire.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What this result is, honestly', html:'A saving of one query on a problem with four possible instances is not a useful computation, and this circuit is not a benchmark for a machine. Its importance is that it is the smallest complete example of the mechanism: a promise, a query answered into a phase, and interference converting that phase into a certain bit. Everything later in this chapter is this circuit made bigger.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.3.2 -- */
{ id:'m6-dj', module:'M6', nav:'Deutsch\u2013Jozsa', title:'The same circuit on n bits, and every balanced function cancels exactly',
  objective:'Run the Deutsch-Jozsa circuit on n query qubits and evaluate the amplitude of the all-zero string.',
  keywords:'deutsch jozsa n qubits balanced constant promise all zero string amplitude mean of signs certainty hadamard transform',
  src:'L10 · extending Deutsch\u2019s algorithm to n inputs', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Deutsch and Deutsch\u2013Jozsa'},
  {t:'title', text:'The same circuit on n bits, and every balanced function cancels exactly'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Now $f:\\{0,1\\}^{n}\\to\\{0,1\\}$, promised to be constant or to be balanced — meaning it returns $1$ on exactly half of its $2^{n}$ inputs. The circuit is unchanged: Hadamards on all $n$ query qubits, one query, Hadamards again, and measure all $n$.</p>'},
    {t:'body', html:'<p>The only quantity that has to be computed is the amplitude of the string $0^{n}$, and the Hadamard layer makes that a plain average:</p>'},
    {t:'eq', key:true, tex:'a_{0^{n}} = \\frac{1}{2^{n}}\\sum_{x\\in\\{0,1\\}^{n}} (-1)^{f(x)}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'A constant function makes every sign the same, so the average is $+1$ or $-1$ and the probability of reading $0^{n}$ is one. A balanced function has exactly $2^{n-1}$ plus signs and $2^{n-1}$ minus signs, so the average is <b>exactly</b> zero and the probability of reading $0^{n}$ is zero. Nothing is approximate: read $0^{n}$ and the function is constant, read anything else and it is balanced.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDJ(),
      caption:'Four promised functions on three bits and the average of their signs. The two balanced rows cancel term by term; that cancellation is the algorithm, and the promise is what guarantees it.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$n=2$ and the balanced oracle $f(x_{1},x_{0}) = x_{0} \\oplus x_{1}$, built from two CNOTs into the target.'],
        ['Work', 'The signs on the four terms are $+,-,-,+$, so the state before the last Hadamards is $|{-}\\rangle|{-}\\rangle$.'],
        ['Answer', 'The Hadamards send it to $|11\\rangle$, so every ideal shot prints $11$ — never $00$.'],
        ['Check', 'The amplitude of $|00\\rangle$ is $\\tfrac14(1-1-1+1)=0$, and the four probabilities are $0,0,0,1$, which add to one. Compare a constant oracle, which is the empty circuit, and prints $00$ every time.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The promise is not decoration', html:'Drop it and the algorithm is worthless. For a function that is neither constant nor balanced the amplitude of $0^{n}$ is some number between $-1$ and $1$, so a reading of $0^{n}$ no longer proves anything and a reading of something else no longer proves anything either. Every "exponential separation" in this family is a separation for a promised input, and stating the promise is part of stating the result.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.3.3 -- */
{ id:'m6-djcost', module:'M6', nav:'What the separation is', title:'The exponential gap is against an exact classical algorithm, and only that one',
  objective:'Compare the quantum query count with the exact and the randomised classical query counts, and say which separation is real.',
  keywords:'separation exact deterministic randomised bounded error queries worst case exponential gap honest statement promise problem',
  src:'L10 · extending Deutsch\u2019s algorithm to n inputs', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Deutsch and Deutsch\u2013Jozsa'},
  {t:'title', text:'The exponential gap is against an exact classical algorithm, and only that one'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A classical algorithm that must never be wrong has to keep asking until the answer is forced. In the worst case it sees $2^{n-1}$ equal values and still cannot tell a constant function from a balanced one, so it needs</p>'},
    {t:'eq', key:true, tex:'2^{n-1}+1 \\ \\text{ queries, against } 1 \\ \\text{ for the quantum circuit}'},
    {t:'body', html:'<p>That is an exponential separation and it is a genuine theorem. It is also a theorem about exact algorithms, and almost nothing in computing is required to be exact.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Allow the classical algorithm to be wrong with small probability and the gap collapses. Query $k$ distinct inputs at random: a constant function always agrees, and a balanced one gives all-equal answers with probability below $2^{-(k-1)}$. So</p>'},
      {t:'eq', tex:'k = 21 \\ \\text{ queries give an error probability below } 10^{-6}, \\ \\text{ for every } n'},
      {t:'small', html:'Twenty-one questions, whatever $n$ is. Against that constant, the quantum saving is a factor of twenty-one and not an exponential.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDJcost(),
      caption:'Three counts on a logarithmic axis. The exponential gap is the distance to the top curve; the honest gap for anyone willing to be wrong once in a million is the distance to the flat one at twenty-one.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$n=10$, so $1024$ inputs.'],
        ['Work', 'Exact classical worst case: $2^{9}+1 = 513$. Quantum: $1$. Randomised for error below $10^{-6}$: $21$.'],
        ['Answer', 'The exact ratio is $513$; the ratio anyone would actually use is $21$.'],
        ['Check', 'Push $n$ to $30$. The exact count becomes $5.4\\times10^{8}$ and the randomised count is still $21$: the first grows and the second does not, which is exactly what "the separation is against exactness" means.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Why the result still matters', html:'It was the first proof that a quantum computer can settle a question with fewer questions than any classical machine, and it introduced the mechanism the rest of the chapter runs on. A first proof of possibility does not have to be useful. What it must not do is get quoted as an exponential speedup for a practical task, because it is not one.'}
    ]}
  ]}
]}
,

/* ---------------------------------------------------------------- 6.4.1 -- */
{ id:'m6-qft', module:'M6', nav:'The Fourier transform', title:'The transform sends a basis state to a phase that winds at a rate the state sets',
  objective:'Write the quantum Fourier transform, apply it to one basis state, and describe the result.',
  keywords:'quantum fourier transform definition basis state phase ramp winding rate unitary discrete fourier amplitudes equal magnitude',
  src:'L10 · quantum Fourier transform', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The quantum Fourier transform'},
  {t:'title', text:'The transform sends a basis state to a phase that winds at a rate the state sets'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>On $n$ qubits there are $Q=2^{n}$ basis states, and the transform is defined on each of them:</p>'},
    {t:'eq', key:true, tex:'F_{Q}\\,|x\\rangle = \\frac{1}{\\sqrt{Q}}\\sum_{k=0}^{Q-1} e^{2\\pi i\\,xk/Q}\\,|k\\rangle'},
    {t:'body', html:'<p>Every output amplitude has the same modulus $1/\\sqrt{Q}$. What carries the input is the <b>rate</b> at which the phase turns as $k$ advances: input $x$ turns it by $2\\pi x/Q$ per step, so $x=0$ does not wind at all.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'It is unitary, so it is a change of basis and nothing more: no information is created and none is destroyed. The inverse takes the opposite sign in the exponent. On a general input $\\sum_{x}a_{x}|x\\rangle$ it acts by linearity, and the result is the discrete Fourier transform of the amplitude list — held as amplitudes, not printed.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQFT(),
      caption:'The eight amplitudes of $F_{8}|3\\rangle$, drawn as arrows in the complex plane. All eight have the same length, and each step turns by $3\\times 45^{\\circ} = 135^{\\circ}$.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$Q=8$ and the input $|3\\rangle$.'],
        ['Work', 'Amplitude $k$ is $\\tfrac{1}{\\sqrt8}e^{2\\pi i\\,3k/8}$. Its modulus is $1/\\sqrt8 = 0.354$ for every $k$, and its phase advances by $135^{\\circ}$ each step.'],
        ['Answer', 'Measuring straight away gives a uniformly random $k$: eight outcomes, each with probability $1/8$.'],
        ['Check', 'The eight probabilities add to one, and they are the same for every input $x$ — so a single application of the transform followed by a measurement can never reveal $x$. The transform is only useful when the phase pattern it produces is made to interfere with something.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'The one input worth memorising', html:'$F_{Q}|0\\rangle$ is the uniform superposition, since every phase is $1$. So the layer of Hadamards that starts every algorithm in this chapter <b>is</b> the Fourier transform of the all-zero state, and on one qubit the Hadamard is exactly $F_{2}$. The chapter has been using this transform since its first scene.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.4.2 -- */
{ id:'m6-qftcirc', module:'M6', nav:'The circuit', title:'A Hadamard and a triangle of small rotations, and the whole thing is quadratic',
  objective:'Read the QFT circuit, count its gates, and say what an approximate version trades away.',
  keywords:'qft circuit hadamard controlled rotation R_k swaps gate count quadratic n squared approximate qft truncation depth',
  src:'L10 · QFT circuit in Qiskit', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The quantum Fourier transform'},
  {t:'title', text:'A Hadamard and a triangle of small rotations, and the whole thing is quadratic'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The transform looks like a $Q\\times Q$ matrix and would take $Q^{2}$ multiplications to apply as one. It factors instead into a short circuit, because the phase $e^{2\\pi i xk/Q}$ separates into one factor per bit of $x$.</p>'},
    {t:'body', html:'<p>Each qubit gets one Hadamard and then one controlled rotation from every qubit below it, with the rotation getting smaller as the control gets further away:</p>'},
    {t:'eq', tex:'R_{k} = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i/2^{k}} \\end{bmatrix}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Counting them: $n$ Hadamards and $n(n-1)/2$ rotations, plus $\\lfloor n/2 \\rfloor$ swaps to put the output bits back in order.</p>'},
      {t:'eq', key:true, tex:'\\tfrac12\\,n(n+1) \\ \\text{ gates}, \\qquad \\text{depth } O(n)'},
      {t:'small', html:'Ten qubits means fifty-five gates, and a thousand qubits would mean about half a million. Quadratic in the number of qubits, which is polynomial in the input length and therefore cheap.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQFTcirc(),
      caption:'Three qubits: three Hadamards, three controlled rotations and one swap. The rotation angles halve with each step down, which is what makes truncating them a sensible thing to do.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A ten-qubit register, so $Q=1024$.'],
        ['Work', 'Gates: $\\tfrac12\\times10\\times11 = 55$, plus $5$ swaps. The smallest rotation is $R_{10}$, an angle of $2\\pi/1024 = 0.35^{\\circ}$.'],
        ['Answer', 'Sixty gates for a transform whose matrix has $1024^{2} \\approx 10^{6}$ entries.'],
        ['Check', 'A classical fast Fourier transform on $1024$ explicitly stored numbers costs about $Q\\log_{2}Q = 10240$ arithmetic operations. The counts are different because the tasks are different: one has the vector in memory and prints the answer, the other has it as amplitudes and prints one index.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'The approximate transform, and why it is used', html:'Rotations by less than some threshold are dropped. This turns a hardware problem — a gate that has to implement an angle of a third of a degree accurately — into a bounded algorithmic error, and it reduces the gate count from $O(n^{2})$ to $O(n\\log n)$. It is the standard choice in every resource estimate for factoring.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.4.3 -- */
{ id:'m6-qftnot', module:'M6', nav:'What it does not return', title:'The transform produces amplitudes, and a measurement still returns one index',
  objective:'Say what a run of the quantum Fourier transform actually gives back, and why it is not a spectrum.',
  keywords:'qft limitation not a spectrum amplitudes measurement one sample fft comparison input output model advantage inference',
  src:'L10 · what the QFT does and does not return', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The quantum Fourier transform'},
  {t:'title', text:'The transform produces amplitudes, and a measurement still returns one index'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>This is the scene the rest of the chapter depends on. Hand the transform a state $\\sum_{x}a_{x}|x\\rangle$ and it produces $\\sum_{k}\\tilde{a}_{k}|k\\rangle$. It does <b>not</b> print the $Q$ numbers $\\tilde{a}_{k}$. It cannot: the readout returns $n$ bits.</p>'},
    {t:'eq', key:true, tex:'\\text{one run returns one } k, \\ \\text{ drawn with probability } |\\tilde{a}_{k}|^{2}'},
    {t:'body', html:'<p>So it is useful only where the thing wanted can be <b>inferred from samples</b> of that distribution — a period, an order, an eigenphase. If the whole spectrum is wanted, a classical fast Fourier transform is the right machine.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The two are also not comparable as costs. The classical transform takes a stored vector of $Q$ numbers and returns $Q$ numbers in about $Q\\log_{2}Q$ operations; the quantum one takes a prepared state and returns one index. Quoting $n^{2}$ against $Q\\log Q$ as a speedup compares two different tasks.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQFTnot(),
      caption:'Eight numbers exist inside the machine and one index comes out. Recovering the shape of the distribution would take many runs, and by then the counting has cost more than the transform saved.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The transform in the figure: probability $0.25$ on each of $k=0,2,4,6$ and exactly zero on the odd indices.'],
        ['Work', 'One run returns one of those four, each with probability one quarter. Nothing else is learnt from that run.'],
        ['Answer', 'The useful inference is about the <b>set</b> of likely indices, not about the amplitudes: every outcome is even, which is already a statement about a period.'],
        ['Check', 'Estimating one of those probabilities to within $0.01$ takes about $1900$ shots, and reading the phase of $\\tilde{a}_{2}$ would take a different experiment entirely.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'"Fourier transforms, exponentially faster" is the commonest wrong sentence about this subject', html:'The circuit really is exponentially smaller than the matrix it implements, and what it produces is not the answer a signal processor wants. Reading $Q$ numbers takes $Q$ readings, so there is no way round it. Every real use of this transform reads a single index out of it.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.1 -- */
{ id:'m6-qpe', module:'M6', nav:'Phase estimation', title:'Write the phase into t qubits at once, then undo the transform to read it',
  objective:'Assemble the phase-estimation circuit and say what each of its three parts does.',
  keywords:'quantum phase estimation circuit counting register controlled powers inverse qft eigenphase binary expansion measurement',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'Write the phase into t qubits at once, then undo the transform to read it'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>One controlled $U$ put $e^{2\\pi i\\varphi}$ onto one control qubit. Use $t$ control qubits, and let control $j$ apply $U$ raised to the power $2^{j}$, so that the phase it collects is doubled each time:</p>'},
    {t:'eq', tex:'\\text{control } j \\ \\text{ collects } e^{2\\pi i\\,2^{j}\\varphi}'},
    {t:'body', html:'<p>The counting register is then exactly the state the Fourier transform produces from the number $2^{t}\\varphi$:</p>'},
    {t:'eq', key:true, tex:'\\frac{1}{\\sqrt{2^{t}}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i k\\varphi}\\,|k\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'So apply the <b>inverse</b> transform and the phase ramp collapses onto the number that produced it. Measuring the $t$ qubits gives an integer $y$, and $y/2^{t}$ is the estimate of $\\varphi$. Three parts: Hadamards, controlled powers, inverse transform — and the middle part is where the physics and the cost both are.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQPE(),
      caption:'Three counting qubits, three controlled powers and the inverse transform. The eigenstate on the bottom wire is unchanged from beginning to end, exactly as in the two-qubit version.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why the powers are powers of two', html:'A $t$-bit binary fraction is $\\varphi \\approx 0.b_{1}b_{2}\\ldots b_{t}$, and multiplying by $2^{j}$ shifts the binary point $j$ places. The control that applies $U^{2^{j}}$ is therefore reading bit $t-j$ of the answer. The circuit is a binary expansion, written in phases, and the inverse transform is the machine that reads a binary expansion out of phases.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A superposition of eigenstates gives a sample, not a list', html:'If the third register holds $\\sum_{k}c_{k}|u_{k}\\rangle$ rather than a single eigenstate, the circuit returns an estimate of $\\varphi_{k}$ with probability $|c_{k}|^{2}$. It samples one eigenphase per run. That is a limitation everywhere else and it is the whole mechanism of order finding, where no single eigenstate can be prepared and the even mixture of all of them can.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.2 -- */
{ id:'m6-qpeexact', module:'M6', nav:'When it is exact', title:'A phase that fits in t bits comes out certain, and every wrong outcome cancels',
  objective:'Show that a phase of the form y/2^t is returned with probability one, and identify the cancellation that makes it so.',
  keywords:'phase estimation exact case binary fraction certainty geometric sum cancellation all wrong outcomes zero amplitude',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'A phase that fits in t bits comes out certain, and every wrong outcome cancels'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Take the case where the phase happens to be a $t$-bit binary fraction, $\\varphi = m/2^{t}$ for a whole number $m$. Then the counting register holds exactly $F|m\\rangle$, and the inverse transform sends it exactly to $|m\\rangle$.</p>'},
    {t:'eq', key:true, tex:'\\varphi = \\frac{m}{2^{t}} \\quad\\Longrightarrow\\quad P(y=m) = 1'},
    {t:'body', html:'<p>It is worth seeing why the other $2^{t}-1$ outcomes are gone. The amplitude of outcome $y$ is a geometric sum, and away from $y=m$ its terms are the roots of unity spread evenly round the circle:</p>'},
    {t:'eq', tex:'a_{y} = \\frac{1}{2^{t}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i k\\left(\\varphi - y/2^{t}\\right)}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'When $\\varphi - y/2^{t}$ is a non-zero multiple of $2^{-t}$, those $2^{t}$ unit vectors are the vertices of a regular polygon and they add to zero. That is the cancellation the whole chapter is about, and here it is complete rather than approximate.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQPEexact(),
      caption:'Three counting qubits and $\\varphi=3/8$. One outcome carries all the probability and the other seven carry exactly none — not a small amount, none.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$U=T$, the target in $|1\\rangle$, so $\\varphi = 1/8$, with $t=3$ counting qubits.'],
        ['Work', '$2^{t}\\varphi = 8\\times\\tfrac18 = 1$, a whole number, so the exact case applies.'],
        ['Answer', 'Every shot reads $y=1$, that is the bits $001$, and $\\varphi = 1/8 = 0.125$ exactly.'],
        ['Check', '$0.125$ in binary is $0.001$, which is three bits — the register was just big enough. With $t=2$ the phase would not fit and the reading would be spread across all four outcomes.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Exactness here is a property of the number, not of the machine', html:'A phase is a real number and almost every real number is not a $t$-bit fraction. The exact case is the special case, and reasoning about phase estimation from it produces a circuit that is expected to print the answer and prints a distribution instead. The next scene is what actually happens.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.3 -- */
{ id:'m6-qpeprec', module:'M6', nav:'Precision and confidence', title:'A phase that does not fit gives a distribution, and more qubits narrow it',
  objective:'Describe the outcome distribution for a general phase and say how many counting qubits a stated accuracy and confidence need.',
  keywords:'phase estimation precision success probability distribution nearest outcome eight over pi squared extra qubits accuracy confidence',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'A phase that does not fit gives a distribution, and more qubits narrow it'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>For a general $\\varphi$ the geometric sum no longer vanishes anywhere, and the outcome distribution is a peak centred on $2^{t}\\varphi$ with tails on both sides:</p>'},
    {t:'eq', tex:'P(y) = \\frac{1}{2^{2t}}\\left|\\frac{\\sin\\!\\big(\\pi\\,2^{t}\\delta\\big)}{\\sin(\\pi\\delta)}\\right|^{2}, \\qquad \\delta = \\varphi - \\frac{y}{2^{t}}'},
    {t:'body', html:'<p>Two guarantees follow. The single nearest outcome carries at least $4/\\pi^{2}\\approx 0.405$, and the two nearest together at least $8/\\pi^{2}\\approx 0.811$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>To get $n$ correct bits with failure probability at most $\\varepsilon$, use</p>'},
      {t:'eq', key:true, tex:'t = n + \\left\\lceil \\log_{2}\\!\\left(2 + \\frac{1}{2\\varepsilon}\\right) \\right\\rceil \\ \\text{ counting qubits}'},
      {t:'small', html:'The extra qubits are cheap: halving the failure probability adds about one. Accuracy is what is expensive, because each extra bit of $n$ doubles the applications of $U$.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQPEprec(),
      caption:'The same phase $\\varphi = 0.3$ read with three counting qubits and with six. The peak sharpens onto a finer grid and the tails shrink, and at no register size does one outcome carry all the probability.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\varphi = 0.3$ and $t=3$, so $2^{t}\\varphi = 2.4$.'],
        ['Work', 'The two nearest outcomes are $y=2$ and $y=3$. Putting $\\delta = 0.05$ and $\\delta = -0.075$ into the formula gives $P(2)=0.577$ and $P(3)=0.259$.'],
        ['Answer', 'The estimate is $2/8 = 0.25$ with probability $0.577$, and one of the two nearest with probability $0.836$.'],
        ['Check', '$0.836$ is above the guaranteed $8/\\pi^{2} = 0.811$, as it must be. The remaining $0.164$ is spread over the other six outcomes, and a run that lands there returns a badly wrong phase with no warning attached.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'One run is not an answer', html:'A single reading is a sample from that distribution. Where the phase is used for something checkable — an order, for instance — a failed run is simply repeated. Where there is no check, the result must be quoted with the confidence the register size bought.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.4 -- */
{ id:'m6-qpecost', module:'M6', nav:'Where the cost is', title:'The controlled powers cost exponentially more than the transform that reads them',
  objective:'Compare the cost of the controlled powers with the cost of the inverse transform and say which one a resource estimate must be about.',
  keywords:'phase estimation cost controlled powers 2^t applications inverse qft quadratic dominant term resource estimate coherent evolution',
  src:'L10 · quantum phase estimation: interface and limitations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'The controlled powers cost exponentially more than the transform that reads them'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Add up what the circuit asks for. The inverse transform is $\\tfrac12 t(t+1)$ gates. The controlled powers are $U$ applied</p>'},
    {t:'eq', key:true, tex:'1 + 2 + 4 + \\cdots + 2^{t-1} = 2^{t}-1 \\ \\text{ times}'},
    {t:'body', html:'<p>That is exponential in the register size, and it has to be exponential: reading $t$ bits of a phase means evolving for a time proportional to $2^{t}$, however the circuit is arranged. Precision $\\delta$ needs about $\\log_{2}(1/\\delta)$ qubits and about $1/\\delta$ applications of $U$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'This is why phase estimation is efficient only when $U^{2^{j}}$ can be built directly, in a circuit of size polynomial in $j$, rather than by repeating $U$ that many times. Order finding can do it, because squaring a modular multiplier is another modular multiplier. For an arbitrary $U$ it cannot be done, and calling the inverse transform efficient does not make the algorithm efficient.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figQPEcost(),
      caption:'The two counts against the register size. At ten counting qubits the transform is fifty-five gates and the controlled powers are one thousand and twenty-three applications of $U$, and the gap only widens.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Ten counting qubits, and a $U$ whose circuit is $500$ gates.'],
        ['Work', 'Applications of $U$: $2^{10}-1 = 1023$. Gates in those: $1023\\times500 \\approx 5.1\\times10^{5}$. Gates in the inverse transform: $55$.'],
        ['Answer', 'The transform is about $0.01\\%$ of the circuit. Everything else is the controlled evolution.'],
        ['Check', 'Add one counting qubit. The transform grows from $55$ to $66$ gates and the controlled part doubles. A rewrite that halved the cost of the transform would change the total by nothing at all.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'What the semiclassical variants change, and what they do not', html:'The counting register can be replaced by one qubit measured and reused $t$ times, with the earlier results fed forward into later rotations — the dynamic circuits of chapter 5. That saves $t-1$ qubits and it saves nothing at all in the controlled evolution, which is the part that costs. Trading qubits for depth is a real engineering choice; it is not a speedup.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.5.5 -- */
{ id:'m6-count', module:'M6', nav:'Counting the marked', title:'Point the estimator at the Grover step and it returns how many answers there are',
  objective:'Explain quantum counting and use it to close the gap chapter 5 left open about an unknown number of marked items.',
  keywords:'quantum counting grover iterate eigenvalue two theta estimate M number of solutions unknown marked items decide existence',
  src:'L10 · Grover search and amplitude amplification', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'Point the estimator at the Grover step and it returns how many answers there are'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 5 finished with a hole in it. The best number of Grover iterations is $\\tfrac{\\pi}{4\\theta}-\\tfrac12$ with $\\sin\\theta = \\sqrt{M/N}$, and $M$ — how many candidates are marked — is usually exactly what is not known.</p>'},
    {t:'body', html:'<p>The Grover step is a rotation of a plane by $2\\theta$, and a rotation of a plane has eigenvalues $e^{\\pm 2i\\theta}$. So it is a unitary with the wanted number sitting in its eigenphase, which is precisely what the last four scenes were built to read.</p>'},
    {t:'eq', key:true, tex:'\\text{estimate } \\theta \\ \\Longrightarrow \\ M = N\\sin^{2}\\theta'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The register does not even need an eigenstate. The uniform superposition is a combination of the two eigenvectors of the rotation, so the circuit samples one of the two eigenphases, and $\\pm\\theta$ give the same $\\sin^{2}\\theta$. This is the case from two scenes ago where sampling an eigenphase is the intended behaviour rather than a limitation.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCount(),
      caption:'The estimator pointed at the search step. The answer to "how many" arrives before the search is run, and the search then uses the right number of iterations rather than a guess.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$N=1024$ candidates with an unknown $M$, and $t=8$ counting qubits.'],
        ['Work', 'Suppose the estimate comes out at $\\theta = 3.6^{\\circ}$. Then $M = 1024\\sin^{2}(3.6^{\\circ}) = 1024\\times 0.003943 = 4.04$.'],
        ['Answer', '$M=4$, and the search should then run $\\tfrac{\\pi}{4}\\sqrt{1024/4} - \\tfrac12 = 12.07$, so twelve iterations.'],
        ['Check', 'Put $M=4$ back: $\\sin\\theta = \\sqrt{4/1024} = 0.0625$, so $\\theta = 3.583^{\\circ}$, which the estimate rounds to. The counting cost is itself about $\\sqrt{N}$ applications, so counting and then searching is still a square-root method overall.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Deciding whether there is an answer at all', html:'The same circuit answers the existence question: if the estimate of $M$ is zero to within its own error bar, nothing is marked. A classical machine can only establish that by checking every candidate, which is $N$ queries, so this is a square-root saving on a question that has no search in it at all.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.L1 --- */
{ id:'m6-lab-k', module:'M6', nav:'Laboratory K', title:'Laboratory K · Phase estimation: the phase, the register, and the distribution',
  objective:'Let the reader turn the phase and the number of counting qubits and watch the outcome distribution answer.',
  keywords:'laboratory phase estimation counting qubits distribution outcomes precision success probability exact case tails guarantee',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Phase estimation'},
  {t:'title', text:'Laboratory K · Phase estimation: the phase, the register, and the distribution'},
  {t:'small', html:'Choose a phase and a number of counting qubits. The left panel is the distribution over the $2^{t}$ possible readings; the right panel is how the probability of landing on the nearest reading behaves as the register grows. Three things to find: a phase that is a $t$-bit fraction gives one outcome with probability one and an exact zero at every other reading, the two nearest readings always carry at least $8/\\pi^{2}$ however badly the phase fits, and the worst case is a phase sitting exactly halfway between two readings.'},
  {t:'lab', id:'K'}
]},

/* ---------------------------------------------------------------- 6.6.1 -- */
{ id:'m6-order', module:'M6', nav:'The order of a number', title:'Multiplying by a fixed number modulo N goes round in a cycle, and its length is the order',
  objective:'Define the order of a modulo N and the unitary whose eigenphases carry it.',
  keywords:'order finding modular multiplication cycle period coprime permutation unitary reversible work register definition',
  src:'L10 · order-finding workflow', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'Multiplying by a fixed number modulo N goes round in a cycle, and its length is the order'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Fix a composite $N$ and a number $a$ with no factor in common with it. The <b>order</b> of $a$ modulo $N$ is the smallest positive $r$ that brings the powers of $a$ back to one:</p>'},
    {t:'eq', key:true, tex:'a^{r} \\equiv 1 \\pmod N, \\qquad r \\ \\text{ smallest such}'},
    {t:'body', html:'<p>Because $a$ and $N$ share no factor, multiplying by $a$ is a <b>permutation</b> of the numbers $0,1,\\ldots,N-1$: nothing is lost and nothing collides. A permutation is a unitary, so it is a legal gate:</p>'},
    {t:'eq', tex:'U_{a}\\,|y\\rangle = |\\,a\\,y \\bmod N\\,\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The work register holds $m$ qubits with $2^{m} \\ge N$, and the basis states from $N$ up to $2^{m}-1$ are outside the interesting range. $U_{a}$ is completed on them as any permutation — usually the identity — which keeps it unitary and changes nothing about the cycle that matters.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOrder(),
      caption:'Powers of two modulo fifteen. The sequence returns to one after four steps and then repeats forever, so the order is four. Finding this length is the only quantum step in factoring.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$N=21$ and $a=2$.'],
        ['Work', 'The powers are $1,2,4,8,16,11,1,\\ldots$ where $32 \\bmod 21 = 11$ and $22 \\bmod 21 = 1$.'],
        ['Answer', 'The order is $r=6$.'],
        ['Check', '$2^{6}=64$ and $64 = 3\\times21+1$, so $2^{6}\\equiv1$. And no smaller power hit one, which is what "smallest" requires — checking that is what makes a candidate order a confirmed one.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Why this is hard classically, and why it does not look hard', html:'Computing the order by walking the cycle takes $r$ steps, and $r$ can be as large as $N$, which is exponential in the number of bits of $N$. Nothing about the cycle is visible from $a$ and $N$ without walking it. The problem looks small because the numbers are small in the examples; the numbers in use have six hundred digits.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.2 -- */
{ id:'m6-ordereig', module:'M6', nav:'Where the order hides', title:'The eigenphases of the multiplier are the fractions s over r, and the state one can prepare is their even mixture',
  objective:'Give the eigenstates and eigenphases of the modular multiplier and explain why the register is started in the state one.',
  keywords:'eigenstates modular multiplier eigenphase s over r superposition state one even mixture sampling eigenphase preparation trick',
  src:'L10 · order-finding workflow', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'The eigenphases of the multiplier are the fractions s over r, and the state one can prepare is their even mixture'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The unitary $U_{a}$ walks a cycle of length $r$. Its eigenvectors are the Fourier combinations of that cycle, one for each $s$ from $0$ to $r-1$:</p>'},
    {t:'eq', tex:'|u_{s}\\rangle = \\frac{1}{\\sqrt r}\\sum_{k=0}^{r-1} e^{-2\\pi i sk/r}\\,|a^{k} \\bmod N\\rangle'},
    {t:'eq', key:true, tex:'U_{a}\\,|u_{s}\\rangle = e^{2\\pi i s/r}\\,|u_{s}\\rangle, \\qquad \\varphi = \\frac{s}{r}'},
    {t:'body', html:'<p>So the order is sitting in the denominators of the eigenphases, and phase estimation reads eigenphases. That is the whole reduction.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>There is one obstacle: preparing $|u_{s}\\rangle$ needs $r$, which is what is being looked for. The way round it is that the $r$ eigenvectors add up to something trivial:</p>'},
      {t:'eq', tex:'\\frac{1}{\\sqrt r}\\sum_{s=0}^{r-1} |u_{s}\\rangle = |1\\rangle'},
      {t:'small', html:'Start the work register in $|1\\rangle$ — one gate — and the circuit samples one eigenphase $s/r$ with $s$ uniform on $0,\\ldots,r-1$. The limitation from two scenes ago has become the preparation.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOrderEig(),
      caption:'The four eigenphases when the order is four, each reached with probability one quarter. Starting the work register in the state one is exactly the even mixture drawn here.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$N=15$, $a=2$, so $r=4$.'],
        ['Work', 'The eigenphases are $0, \\tfrac14, \\tfrac12, \\tfrac34$, each drawn with probability $\\tfrac14$.'],
        ['Answer', 'A run returns an estimate of one of those four numbers, chosen at random.'],
        ['Check', 'The value $s=0$ returns a phase of zero and says nothing about $r$; the value $s=2$ returns $\\tfrac12$, whose reduced form is $1/2$ and gives the candidate $r=2$, which fails the test $2^{2}\\equiv1$. Only $s=1$ and $s=3$ give $r=4$ directly, so half the runs here succeed and the rest are detected and repeated.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'This is the step worth understanding twice', html:'The circuit never holds an eigenstate, never learns $s$ in advance, and never needs to. It measures a phase drawn from a set whose denominators all equal $r$, and a classical procedure then recovers that denominator. The quantum part supplies one noisy fraction per run, and nothing else.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.3 -- */
{ id:'m6-modexp', module:'M6', nav:'What it costs to build', title:'The controlled powers are modular exponentiation, and they are the whole cost',
  objective:'Say how the controlled powers of the modular multiplier are built and which term dominates the circuit.',
  keywords:'modular exponentiation repeated squaring controlled multiplication cost cubic L gate count dominant term qft small',
  src:'L10 · order-finding workflow', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'The controlled powers are modular exponentiation, and they are the whole cost'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Phase estimation needs $U_{a}^{2^{j}}$ for every counting qubit $j$, and applying $U_{a}$ that many times would be exponential. It is not done that way. Squaring the number instead of repeating the gate:</p>'},
    {t:'eq', key:true, tex:'U_{a}^{2^{j}} = U_{a^{2^{j}} \\bmod N}'},
    {t:'body', html:'<p>and $a^{2^{j}} \\bmod N$ is computed classically before the circuit is built, by squaring $j$ times. So each counting qubit controls <b>one</b> modular multiplication by a precomputed constant, and the whole middle of the circuit is a reversible modular exponentiation.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'A reversible multiplier on $L$-bit numbers costs about $L^{2}$ gates, and there are about $2L$ of them, so the arithmetic is order $L^{3}$. The inverse Fourier transform is order $L^{2}$. For a two-thousand-bit number those differ by three decades, and every published resource estimate for factoring is an estimate of the arithmetic.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figModexp(),
      caption:'The two parts of the circuit against the size of $N$. The Fourier transform is the cheap one by three orders of magnitude at the sizes that matter, which is the opposite of how the algorithm is usually described.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$L=2048$ bits, a counting register of $t=2L=4096$ qubits.'],
        ['Work', 'Modular multiplications: about $4096$. Gates in each, at about $L^{2}$: $4.2\\times10^{6}$. Total arithmetic: about $1.7\\times10^{10}$ gates. The inverse transform: $\\tfrac12 t(t+1) \\approx 8.4\\times10^{6}$.'],
        ['Answer', 'The arithmetic is about two thousand times the transform.'],
        ['Check', 'The ratio should be about $L^{3}/L^{2}=L$ up to constants, and $1.7\\times10^{10}/8.4\\times10^{6} = 2050$, which is of the order of $L=2048$. The scaling argument and the arithmetic agree.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'"Shor\u2019s algorithm is the quantum Fourier transform" is the wrong summary', html:'The transform is the smallest part of the circuit. What makes the algorithm work is that modular exponentiation can be done <b>coherently and reversibly</b>, so that the phase information survives it, and what makes the algorithm expensive is that the same modular exponentiation has to be done coherently and reversibly. Chapter 4\u2019s ancillas and uncomputing are where that cost comes from.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.4 -- */
{ id:'m6-cf', module:'M6', nav:'Reading the order out', title:'Continued fractions turn a measured fraction into the small denominator hiding in it',
  objective:'Use the continued-fraction expansion to recover r from a measured y over Q, and check the candidate.',
  keywords:'continued fractions convergents denominator recover order classical post processing candidate check modular exponentiation verify',
  src:'L10 · order-finding workflow', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'Continued fractions turn a measured fraction into the small denominator hiding in it'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The measurement returns an integer $y$, and $y/Q$ is close to some $s/r$ — but $Q$ is a power of two and $r$ is not, so $y/Q$ never <b>equals</b> $s/r$. What is needed is a way to find a fraction with a small denominator near a given number, and that is an old classical algorithm.</p>'},
    {t:'eq', key:true, tex:'\\left| \\frac{y}{Q} - \\frac{s}{r} \\right| \\le \\frac{1}{2Q}, \\qquad Q > N^{2} \\ \\Longrightarrow \\ \\frac{s}{r} \\ \\text{ is the unique such fraction}'},
    {t:'body', html:'<p>Repeatedly take the whole part and invert the remainder. The fractions this builds — the <b>convergents</b> — are the best approximations with small denominators, and the wanted one is the last whose denominator is below $N$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Then check it. Compute $a^{r} \\bmod N$ by repeated squaring, which is fast, and accept $r$ only if the answer is one. If the convergent gave a proper divisor of the order, the check fails and the run is thrown away. Nothing in this paragraph is quantum, and none of it costs anything worth counting.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCF(),
      caption:'One measured reading turned into an order. The convergent wanted is the one whose denominator is below $N$; the next one has a denominator of $253$, which is far too large to be an order modulo twenty-one.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$N=21$, $a=2$, $t=9$ so $Q=512$, and a reading of $y=85$.'],
        ['Work', '$85/512 = 0.166016$. The expansion is $[0;6,42,2]$, with convergents $0/1$, $1/6$ and $42/253$. The last denominator below $21$ is $6$.'],
        ['Answer', 'The candidate order is $r=6$.'],
        ['Check', '$2^{6} = 64 = 3\\times21+1$, so $2^{6}\\equiv1 \\pmod{21}$ and the candidate is confirmed. Compare it with the true fraction: $s/r = 1/6 = 0.16667$, and $85/512 = 0.16602$ — the reading was never exact and did not need to be.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The register has to be twice as long as the number', html:'The uniqueness above needs $Q > N^{2}$, so the counting register carries about $2L$ qubits for an $L$-bit $N$. That is not a detail: it doubles the counting register, doubles the number of controlled modular multiplications, and is the reason the qubit counts in resource estimates are what they are.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.6.5 -- */
{ id:'m6-repeat', module:'M6', nav:'When a run fails', title:'Several things can go wrong, all of them are detected, and none of the repairs is quantum',
  objective:'List the ways an order-finding run fails, say how each is detected, and describe the repetition strategy.',
  keywords:'failure modes s zero common factor odd order minus one repeat runs detection classical check probability constant expected runs',
  src:'L10 · order-finding workflow', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Order finding'},
  {t:'title', text:'Several things can go wrong, all of them are detected, and none of the repairs is quantum'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A run of the quantum circuit produces one number, and that number is not always useful. Four ways it fails, and each one is caught by arithmetic that costs nothing:</p>'},
    {t:'small', html:'The measurement can land on $s=0$, which carries no information about $r$. The values $s$ and $r$ can share a factor, so the convergent is a proper divisor of $r$ and the check $a^{r}\\equiv1$ fails. The order can turn out odd, so $a^{r/2}$ is not a whole number. And $a^{r/2}$ can be $-1$ modulo $N$, in which case both greatest common divisors come out trivial.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The first two are repaired by running the circuit again with the same $a$. The last two are repaired by choosing a different $a$, and the theorem that makes the whole thing work says how often that is needed:</p>'},
      {t:'eq', key:true, tex:'P\\big(r \\text{ even and } a^{r/2} \\not\\equiv -1\\big) \\ \\ge \\ \\tfrac12 \\ \\text{ for } N = pq'},
      {t:'small', html:'A constant probability of success per attempt means a constant expected number of attempts, so the repetition costs a factor and not an exponent. That factor is what turns a probabilistic procedure into a polynomial-time algorithm.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figRepeat(),
      caption:'The four failures, what each produces, and the repair. The colour is the repair: amber where the circuit is simply run again, red where a whole base has to be discarded. Every row is decided by integer arithmetic on numbers already measured.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$N=15$ with $a=2$, so $r=4$, and a counting register long enough to read $s/4$ exactly.'],
        ['Work', 'The four values of $s$ are equally likely. $s=0$ gives nothing; $s=2$ reduces to $1/2$ and the candidate $r=2$ fails $2^{2}=4\\not\\equiv1$; $s=1$ and $s=3$ both give $r=4$.'],
        ['Answer', 'Two of the four values succeed, so the success probability of one run is $1/2$.'],
        ['Check', 'The expected number of runs is then two. Add the check itself: confirming $r=4$ costs one modular exponentiation, and rejecting $r=2$ costs another — both classical, both instant.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'A failure that announces itself is not a real problem', html:'The reason this algorithm tolerates a success probability of a half is that success is <b>checkable</b>. Multiply the candidate factors and see whether they give $N$. Compare that with Deutsch\u2013Jozsa or with Grover, where a wrong answer looks exactly like a right one and the confidence has to come from the analysis instead.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.1 -- */
{ id:'m6-shor', module:'M6', nav:'Factoring, assembled', title:'One box in five needs a quantum computer, and the other four are integer arithmetic',
  objective:'Assemble the factoring algorithm from order finding and the classical steps around it, and identify which step is quantum.',
  keywords:'shor factoring algorithm workflow reduction order finding gcd classical steps square root difference of squares assembly',
  src:'L10 · Shor\u2019s factoring algorithm', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'One box in five needs a quantum computer, and the other four are integer arithmetic'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The reduction from factoring to order finding is a page of school algebra. Suppose the order $r$ of $a$ is even. Then</p>'},
    {t:'eq', tex:'a^{r} - 1 \\equiv 0 \\pmod N \\quad\\Longrightarrow\\quad \\big(a^{r/2}-1\\big)\\big(a^{r/2}+1\\big) \\equiv 0 \\pmod N'},
    {t:'body', html:'<p>So $N$ divides that product but — provided $a^{r/2}\\not\\equiv\\pm1$ — divides neither factor on its own. Its prime factors must therefore be split between the two, and</p>'},
    {t:'eq', key:true, tex:'\\gcd\\big(a^{r/2}-1,\\,N\\big) \\ \\text{ and } \\ \\gcd\\big(a^{r/2}+1,\\,N\\big) \\ \\text{ are proper factors}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Every step of that is classical, and so is picking $a$, taking the first greatest common divisor to check $a$ is coprime to $N$, running the continued fractions, and verifying the candidate order. Order finding is the one line that is not.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShor(),
      caption:'The five steps, with the quantum one marked. Four of them run on a laptop in microseconds; the whole cost of the algorithm is inside the one box that does not.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why the greatest common divisor is the tool', html:'Euclid\u2019s algorithm finds it in about $\\log N$ steps and it is the cheapest thing in the whole procedure. The algebra above turns "the number $N$ is a product" into "these two specific numbers share a factor with $N$", and the second question is easy. The quantum step exists only to supply the exponent that makes the algebra apply.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'This is why "quantum computers factor numbers" is a misleading summary', html:'The claim that is true is narrower and more interesting: a quantum computer can find the period of a modular exponential in polynomial time, and factoring happens to reduce to that. A problem that does not reduce to a period gets nothing from any of this — which is why breaking a hash function or solving an NP-complete problem is not on the same list.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.2 -- */
{ id:'m6-shor15', module:'M6', nav:'Fifteen, worked', title:'The smallest example, worked to the end, including the choice that fails',
  objective:'Factor fifteen through order finding, and show a choice of a for which the same procedure fails.',
  keywords:'worked example fifteen factoring order four gcd three five failure case fourteen minus one repeat choose another base',
  src:'L10 · worked order-finding example: N = 15', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'The smallest example, worked to the end, including the choice that fails'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Take $N=15$ and $a=2$. First check they are coprime: $\\gcd(2,15)=1$, so no factor has fallen out yet and the procedure continues.</p>'},
    {t:'body', html:'<p>The quantum step returns the order. Here it is small enough to see: the powers of two modulo fifteen are $1,2,4,8,1,\\ldots$, so $r=4$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Now the two conditions. The order is even, and $2^{2}=4$, which is not $-1$ modulo fifteen — that would be $14$. Both hold, so take the two greatest common divisors:</p>'},
      {t:'eq', key:true, tex:'\\gcd(3,15) = 3, \\qquad \\gcd(5,15) = 5'},
      {t:'small', html:'And $3\\times5=15$. The multiplication at the end is the whole verification: this algorithm produces an answer that can be checked in one line, which is what lets it tolerate failing half the time.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShor15(),
      caption:'Every number in the run, in order. The only step a laptop cannot do at this size is the second one, and at this size a laptop can do that too.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The same $N=15$, but with $a=14$.'],
        ['Work', '$14^{2} = 196 = 13\\times15+1$, so the order is $r=2$, which is even. But $14^{r/2}=14\\equiv-1 \\pmod{15}$.'],
        ['Answer', 'The second condition fails: $\\gcd(13,15)=1$ and $\\gcd(15,15)=15$, both useless.'],
        ['Check', 'This is not a rare accident. Of the eight numbers below fifteen that are coprime to it, two are useless: $1$, whose order is the odd number $1$, and $14$ for the reason above. So the procedure has to be prepared to discard a base and pick another, which is a classical retry and costs one more run.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What a small demonstration does and does not show', html:'Fifteen has been factored on hardware many times, and the circuits used are almost always simplified using knowledge of the answer — a multiplier built for a known order is not the general circuit. A demonstration at this size shows that the pieces fit together. It is not evidence about what a large number would cost, and the difference between the two is about ten orders of magnitude.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.3 -- */
{ id:'m6-rsa', module:'M6', nav:'What is actually threatened', title:'Public-key cryptography breaks, symmetric cryptography does not, and the timing is the problem',
  objective:'Say which cryptographic systems a large fault-tolerant machine would break and why migration cannot wait for one.',
  keywords:'rsa public key discrete logarithm broken symmetric aes hash grover square root post quantum migration harvest now decrypt later',
  src:'L10 · RSA and the scope of the quantum threat', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'Public-key cryptography breaks, symmetric cryptography does not, and the timing is the problem'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>RSA publishes a modulus $N=pq$ and keeps the factorisation secret; the private key is derived from it. Anyone who can factor $N$ has the private key. Diffie\u2013Hellman and elliptic-curve schemes rest on the discrete logarithm, which the same phase-estimation machinery solves.</p>'},
    {t:'body', html:'<p>So a large enough fault-tolerant quantum computer breaks all of them. Symmetric ciphers and hash functions are in a different position: the best known quantum attack is Grover, a square root, and doubling the key length restores the margin.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Their security was never a proof in either case. It is the absence of a known efficient attack at the sizes in use, and that is exactly what changed when Shor\u2019s algorithm was published — the attack became known, and only the machine is missing.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figRSA(),
      caption:'What each family of schemes faces, and the reason the schedule is not set by when the machine arrives. Traffic recorded today can be opened later by whoever kept it.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Data that must stay secret for twenty years, encrypted today under a key exchange based on elliptic curves.'],
        ['Work', 'The traffic can be recorded now at negligible cost. If a capable machine exists at any point in those twenty years, the recording can be decrypted then.'],
        ['Answer', 'The migration deadline is set by the secrecy lifetime of the data, not by the arrival date of the machine.'],
        ['Check', 'Reverse the reasoning: data that stops mattering next week is not at risk from this, whatever happens. The correct question is always how long a particular secret has to hold.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'What "post-quantum" means, and what it does not', html:'A post-quantum scheme is a <b>classical</b> algorithm — it runs on ordinary computers — chosen because it rests on a problem for which no efficient quantum attack is known. Lattice problems are the main family, and standards for them exist. It is not quantum cryptography, which is a different subject about distributing keys over physical channels.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.4 -- */
{ id:'m6-shorclaim', module:'M6', nav:'What Shor claims', title:'A superpolynomial gap against the best known method, and no lower bound behind it',
  objective:'Write the factoring claim against the five components and say precisely what it does and does not assert.',
  keywords:'shor claim resource five components fault tolerance physical qubits number field sieve baseline no lower bound superpolynomial',
  src:'L10 · Shor\u2019s factoring algorithm', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'A superpolynomial gap against the best known method, and no lower bound behind it'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 5 said a resource claim names five things. Write this one out and two of the five turn out to be carrying almost all the weight.</p>'},
    {t:'body', html:'<p>The <b>hardware model</b> assumes fault tolerance. The logical circuit is about $L^{3}$ gates, but every logical gate is a code block of many physical qubits with rounds of error correction, and published estimates for a two-thousand-bit modulus run to millions of physical qubits and hours of running time.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The <b>baseline</b> is the general number field sieve, which takes about $e^{c\\,L^{1/3}(\\log L)^{2/3}}$ operations — subexponential, not exponential. So the gap is superpolynomial rather than exponential, and it is a gap against the best <b>known</b> classical algorithm. No theorem says factoring is hard; if a fast classical factoring algorithm were found tomorrow, the separation would vanish and none of the quantum mechanics would be wrong.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShorClaim(),
      caption:'The claim against the five. The two in the error tone are the ones usually left unstated, and they are the ones that decide whether any of this happens on a real machine.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A $2048$-bit modulus, and a machine running logical gates at one microsecond each.'],
        ['Work', 'Logical gates: about $1.7\\times10^{10}$. At one microsecond each and no parallelism, that is $1.7\\times10^{4}$ seconds, about five hours.'],
        ['Answer', 'Hours of quantum running time, on a machine with millions of physical qubits behind those logical ones.'],
        ['Check', 'Compare the classical baseline: the number field sieve on the same modulus is beyond any assembled computing effort, which is why the key size is what it is. Both numbers are large; only one of them is finite in practice, and which one that is depends entirely on whether the machine exists.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What the result does say, stated fairly', html:'On an ideal fault-tolerant quantum computer, factoring takes a number of operations polynomial in the bit length, where every known classical method takes subexponentially many. That is a genuine and important separation, and it is the strongest known statement of its kind. It is a statement about two algorithms, not about the difficulty of the problem.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 6.7.5 -- */
{ id:'m6-family', module:'M6', nav:'The family', title:'Order finding is one case of period finding, and period finding is one case of something larger',
  objective:'Place order finding inside the family of problems the same mechanism solves, and say what is outside it.',
  keywords:'period finding hidden subgroup problem discrete logarithm family abelian structure grover outside quadratic limits of the method',
  src:'L10 · quantum Fourier transform', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Factoring, and the reach of one mechanism'},
  {t:'title', text:'Order finding is one case of period finding, and period finding is one case of something larger'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Nothing in the order-finding circuit used the fact that the operation was multiplication. It used that some function repeats:</p>'},
    {t:'eq', key:true, tex:'f(x+r) = f(x) \\ \\text{ for all } x, \\ \\text{ and } f \\text{ takes distinct values within one period}'},
    {t:'body', html:'<p>Given a circuit for such an $f$, the same construction — superpose, evaluate, transform, measure, read the denominator — returns $r$. Order finding is the case $f(x)=a^{x}\\bmod N$. The discrete logarithm is another case, with a function of two variables.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'All of them are instances of one statement about hidden structure in a commutative group, and that statement is where the known superpolynomial quantum speedups live — nearly all of them. Grover is the conspicuous exception, and it is the exception because unstructured search has no such structure to find, which is exactly why its saving is only a square root.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figFamily(),
      caption:'Where factoring sits. The outermost box is the general statement; the inner ones are the cases with algorithms. Grover is outside the picture, and so is every problem with no hidden period.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'This is the honest boundary of the subject', html:'Two mechanisms have produced every algorithm in this course: interference against a hidden period, which is superpolynomial and needs structure, and amplitude amplification, which is quadratic and needs nothing. A claim of a large speedup on a problem with neither is a claim that something new has been found, and it should be read that way.'}
    ]}
  ]}
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
      {t:'small', html:'$U_{f}|x\\rangle|{-}\\rangle = (-1)^{f(x)}|x\\rangle|{-}\\rangle$, and $\\mathrm{c}U|{+}\\rangle|u\\rangle$ puts $e^{2\\pi i\\varphi}$ on the control. The superposition is free; the interference is the algorithm.'}]}],
    [{t:'card', head:'Deutsch\u2013Jozsa', items:[
      {t:'small', html:'The amplitude of $0^{n}$ is $2^{-n}\\sum_{x}(-1)^{f(x)}$: $\\pm1$ constant, exactly $0$ balanced. One query against $2^{n-1}+1$ exact classical ones, and $21$ randomised ones.'}]}],
    [{t:'card', head:'Transform and estimate', items:[
      {t:'small', html:'$F_{Q}|x\\rangle = Q^{-1/2}\\sum_{k}e^{2\\pi ixk/Q}|k\\rangle$, in $\\tfrac12 n(n+1)$ gates, returning one index and not a spectrum. Estimation costs $2^{t}-1$ applications of $U$.'}]}],
    [{t:'card', head:'Order finding', items:[
      {t:'small', html:'$U_{a}|y\\rangle=|ay \\bmod N\\rangle$ has eigenphases $s/r$, and $|1\\rangle$ is their even mixture. Continued fractions give $r$, and $\\gcd(a^{r/2}\\pm1,N)$ gives the factors.'}]}]
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
