/* ==========================================================================
   Module 5 — Circuits and protocols.

   Chapter 4 gave the gates. This chapter runs them. It has two halves and one
   argument joining them.

   The first half is the machine as it is actually operated: a circuit is a
   program and not a stored state, a run returns bit strings and not
   amplitudes, a compiler rewrites the circuit before any hardware sees it, and
   the number a coherence time is spent against is the depth rather than the
   gate count.

   The second half works two protocols end to end on that machine. Teleportation
   is where the reader finds out that a protocol can be finished only when the
   classical bits arrive, and that the entanglement on its own moves nothing:
   the correction table is selected by the measured bits, and without the
   classical channel Bob holds exactly the maximally mixed state whatever was
   sent. Grover is where the third sentence of this course finally has a real
   home, because the square-root claim is a claim about queries and a query is
   not a runtime.

   Three things in here are the ones students get wrong, and each has a scene.
   A gate count is not a depth and neither is a runtime. Teleportation is not a
   channel that sends a state faster than a classical bit can travel. And more
   Grover iterations are not better: past the optimum the success probability
   falls, and at twice the optimum it is back to nothing.

   Every figure that carries an angle is drawn in an isotropic frame — the same
   number of pixels to the unit on both axes — and the ratio is written in the
   comment above it. The amplitude-amplification figure is the one where this
   matters, because the rotation by two theta is the whole argument.

   Circuit drawings follow the chapter-4 rules exactly: a control is the `dot`
   item of `P.blocks`, which is a filled disc, and a target is an open circle
   with a cross in it. A control drawn as an open circle is drawn as a target,
   and no gate reads a rendering.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const D2R = Math.PI/180;

/* ---- the circuit-drawing kit every diagram below is built from -----------
   A wire is a hairline in the rule tone, a gate is a box in the operator
   tone, a control is a filled dot and a target is an open circle with a
   cross. A classical wire is drawn as two hairlines three pixels apart,
   which is the standard notation and the only mark on these diagrams that
   means "bits, not amplitudes". */
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
/* A meter is the box a measurement is drawn as. It carries a plain word, not
   mathematics, so it takes no TeX and no `\text{}` wrapper. */
function meter(x,y,col){ return {t:'box',x:x-24,y:y-17,w:48,h:34,label:'measure',fs:11,
  color:col||C.out}; }

/* ---------------------------------------------------------------- figures --
   Each is a function, so the palette is the one in force when it is drawn. */

/* The chapter as three objects that are often confused: the program, the run,
   and the numbers that come back. */
function figOpen(){
  return P.blocks({w:760,h:236,items:[
    {t:'box',x:30,y:52,w:170,h:64,label:'a circuit',fs:14,color:C.in},
    {t:'arrow',x1:200,y1:84,x2:262,y2:84},
    {t:'box',x:262,y:52,w:170,h:64,label:'a run of N shots',fs:14,color:C.h},
    {t:'arrow',x1:432,y1:84,x2:494,y2:84},
    {t:'box',x:494,y:52,w:200,h:64,label:'counts of bit strings',fs:14,color:C.out},
    {t:'text',x:115,y:140,label:'a program: gates, wires, order',fs:12},
    {t:'text',x:347,y:140,label:'a physical experiment, repeated',fs:12},
    {t:'text',x:594,y:140,label:'n\\text{ bits each time, never }2^{n}\\text{ numbers}',tex:true,fs:12},
    {t:'text',x:380,y:190,label:'The state in the middle is never handed to anyone.',fs:12.5},
    {t:'text',x:380,y:214,label:'Everything this chapter does has to survive that.',fs:12.5}
  ]});
}

/* A circuit as wires and layers: three qubits, four gates, and the layers
   drawn so that depth and gate count can be counted apart. */
function figCircuit(){
  const items = [
    wire(50,90,470), wire(112,90,470), wire(174,90,470),
    {t:'text',x:78,y:55,anchor:'end',label:'q_{0}',tex:true,fs:14},
    {t:'text',x:78,y:117,anchor:'end',label:'q_{1}',tex:true,fs:14},
    {t:'text',x:78,y:179,anchor:'end',label:'q_{2}',tex:true,fs:14},
    gate(140,50,'H',true),
    {t:'line',d:'M240,50 V112',color:C.h},
    ctrl(240,50)
  ].concat(targ(240,112)).concat([
    {t:'line',d:'M340,112 V174',color:C.h},
    ctrl(340,112)
  ]).concat(targ(340,174)).concat([
    /* The last gate sits on q2 and not on q0. On q0 it would be free to run
       beside the second CNOT, which would make the depth three and the
       caption false. */
    gate(430,174,'T',true),
    /* the three layer boundaries, drawn faint and named below the wires */
    {t:'line',d:'M190,26 V206',color:C.rule},
    {t:'line',d:'M290,26 V206',color:C.rule},
    {t:'line',d:'M390,26 V206',color:C.rule},
    {t:'text',x:140,y:228,label:'layer 1',fs:11.5},
    {t:'text',x:240,y:228,label:'layer 2',fs:11.5},
    {t:'text',x:340,y:228,label:'layer 3',fs:11.5},
    {t:'text',x:430,y:228,label:'layer 4',fs:11.5},
    {t:'text',x:620,y:60,anchor:'middle',label:'4 gates',fs:15,color:C.mid},
    {t:'text',x:620,y:88,anchor:'middle',label:'depth 4',fs:15,color:C.out},
    {t:'text',x:620,y:130,anchor:'middle',label:'two different counts,',fs:12},
    {t:'text',x:620,y:152,anchor:'middle',label:'equal only by accident',fs:12},
    {t:'text',x:620,y:190,anchor:'middle',label:'here, because nothing runs',fs:12},
    {t:'text',x:620,y:210,anchor:'middle',label:'beside anything else',fs:12}
  ]);
  return P.blocks({w:760,h:244,items});
}

/* The circuit model of computation, as the four things it licenses. */
function figModel(){
  return P.blocks({w:760,h:210,items:[
    {t:'box',x:24,y:44,w:150,h:58,label:'prepare',fs:14,color:C.in},
    {t:'arrow',x1:174,y1:73,x2:216,y2:73},
    {t:'box',x:216,y:44,w:150,h:58,label:'apply gates',fs:14,color:C.h},
    {t:'arrow',x1:366,y1:73,x2:408,y2:73},
    {t:'box',x:408,y:44,w:150,h:58,label:'measure',fs:14,color:C.out},
    {t:'arrow',x1:558,y1:73,x2:600,y2:73},
    {t:'box',x:600,y:44,w:136,h:58,label:'repeat',fs:14,color:C.mid},
    {t:'text',x:99,y:126,label:'\\text{every qubit in }|0\\rangle',tex:true,fs:12},
    {t:'text',x:291,y:126,label:'from one fixed finite set',fs:12},
    {t:'text',x:483,y:126,label:'in the computational basis',fs:12},
    {t:'text',x:668,y:126,label:'N times, and count',fs:12},
    {t:'text',x:380,y:174,label:'Anything a machine can do is one of these four. Everything else is a name for a pattern of them.',fs:12.5}
  ]});
}

/* Bit order: the picture, the ket, the vector index and the printed string,
   all naming one state. */
function figOrder(){
  const items = [
    wire(48,150,300), wire(96,150,300), wire(144,150,300),
    {t:'text',x:140,y:53,anchor:'end',label:'q_{0}',tex:true,fs:14},
    {t:'text',x:140,y:101,anchor:'end',label:'q_{1}',tex:true,fs:14},
    {t:'text',x:140,y:149,anchor:'end',label:'q_{2}',tex:true,fs:14},
    {t:'text',x:312,y:53,anchor:'start',label:'0',fs:14,color:C.mid},
    {t:'text',x:312,y:101,anchor:'start',label:'0',fs:14,color:C.mid},
    {t:'text',x:312,y:149,anchor:'start',label:'1',fs:14,color:C.mid},
    {t:'text',x:225,y:22,label:'q_{0}\\text{ drawn at the top}',tex:true,fs:12},
    {t:'text',x:225,y:186,label:'the readings, wire by wire',fs:12},
    {t:'text',x:560,y:46,anchor:'middle',label:'|q_{2}q_{1}q_{0}\\rangle = |100\\rangle',tex:true,fs:17,color:C.out},
    {t:'text',x:560,y:96,anchor:'middle',label:'x = 4q_{2}+2q_{1}+q_{0} = 4',tex:true,fs:16},
    {t:'text',x:560,y:142,anchor:'middle',label:'entry 4 of the state vector',fs:12.5},
    {t:'text',x:560,y:186,anchor:'middle',label:'printed string "100"',fs:12.5},
    {t:'text',x:380,y:224,label:'One state. The wire at the top is the last digit of the ket.',fs:12.5,color:C.err}
  ];
  return P.blocks({w:760,h:236,items});
}

/* The same state prepared two ways: a chain and a tree. Same gate count, and
   the depth is what differs. */
function figDepth(){
  const items = [];
  const Y = [36,74,112,150];
  const name = (x,i) => ({t:'text',x,y:Y[i]+5,anchor:'end',label:'q_{'+i+'}',tex:true,fs:12.5});
  /* left: the chain — every CNOT waits for the one before it */
  Y.forEach((y,i)=>{ items.push(wire(y,84,252)); items.push(name(74,i)); });
  items.push({t:'text',x:168,y:18,label:'the chain',fs:13,color:C.in});
  items.push(gate(112,Y[0],'H',true));
  items.push({t:'line',d:`M150,${Y[0]} V${Y[1]}`,color:C.h}, ctrl(150,Y[0]));
  targ(150,Y[1]).forEach(o=>items.push(o));
  items.push({t:'line',d:`M190,${Y[1]} V${Y[2]}`,color:C.h}, ctrl(190,Y[1]));
  targ(190,Y[2]).forEach(o=>items.push(o));
  items.push({t:'line',d:`M230,${Y[2]} V${Y[3]}`,color:C.h}, ctrl(230,Y[2]));
  targ(230,Y[3]).forEach(o=>items.push(o));
  items.push({t:'text',x:168,y:210,label:'4 gates, depth 4',fs:13});
  /* right: the tree — the last two CNOTs touch four different qubits, so they
     run together, and the two faint rules are what say so. */
  Y.forEach((y,i)=>{ items.push(wire(y,452,664)); items.push(name(442,i)); });
  items.push({t:'text',x:558,y:18,label:'the tree',fs:13,color:C.out});
  items.push(gate(480,Y[0],'H',true));
  items.push({t:'line',d:`M518,${Y[0]} V${Y[1]}`,color:C.h}, ctrl(518,Y[0]));
  targ(518,Y[1]).forEach(o=>items.push(o));
  items.push({t:'line',d:'M546,20 V172',color:C.rule});
  items.push({t:'line',d:'M652,20 V172',color:C.rule});
  items.push({t:'line',d:`M578,${Y[0]} V${Y[2]}`,color:C.h}, ctrl(578,Y[0]));
  targ(578,Y[2]).forEach(o=>items.push(o));
  items.push({t:'line',d:`M620,${Y[1]} V${Y[3]}`,color:C.h}, ctrl(620,Y[1]));
  targ(620,Y[3]).forEach(o=>items.push(o));
  items.push({t:'text',x:599,y:190,label:'one layer',fs:12,color:C.out});
  items.push({t:'text',x:558,y:210,label:'4 gates, depth 3',fs:13});
  items.push({t:'text',x:380,y:240,label:'The same four-qubit state. The gate count cannot tell them apart and the coherence time can.',fs:12.5});
  return P.blocks({w:760,h:252,items});
}

/* How much memory an exact statevector needs, against the qubit count.
   Logarithmic in the vertical, so the exponential is a straight line. */
function figState(){
  /* bytes = 16 * 2^n for complex128; the axis is log10 of that. */
  const a = P.Axes({w:560,h:280,xr:[0,60],yr:[0,19],
    xlabel:'n\\,(\\text{qubits})', ylabel:'\\text{bytes stored}',
    pad:{l:78,r:26,t:30,b:48}, xtarget:6,
    yticksOverride:P.decades(0,19).filter(v=>v%3===0), ytickfmt:P.decade});
  a.curve(n => Math.log10(16) + n*Math.log10(2), {color:C.in,width:2.6});
  a.hline(Math.log10(16e9),{color:C.rule,width:1.2,dash:'4 4'});
  a.note(2,10.6,'16\\text{ GB, one large workstation}',{fs:12,color:C.muted,tex:true});
  /* Both names sit below and to the right of their markers, which is the one
     side of a rising curve that is empty. */
  a.point(30,Math.log10(16)+30*Math.log10(2),{color:C.h,r:6});
  a.note(33,8.2,'n=30',{fs:12.5,color:C.h,anchor:'start',tex:true});
  a.point(50,Math.log10(16)+50*Math.log10(2),{color:C.err,r:6});
  a.note(52,13.8,'n=50',{fs:12.5,color:C.err,anchor:'start',tex:true});
  return a.svg();
}

/* The standard error of a probability read from N shots. Both axes
   logarithmic, so the one-over-root-N law is a straight line of slope -1/2. */
function figShots(){
  const a = P.Axes({w:560,h:280,xr:[1,7],yr:[-4,0],
    xlabel:'N\\,(\\text{shots})', ylabel:'\\text{standard error}',
    pad:{l:78,r:26,t:30,b:48},
    xticksOverride:P.decades(1,7), xtickfmt:P.decade,
    yticksOverride:P.decades(-4,0), ytickfmt:P.decade});
  a.curve(L => Math.log10(0.5) - 0.5*L, {color:C.in,width:2.6});
  a.point(3,Math.log10(0.5)-1.5,{color:C.h,r:6});
  a.note(3.1,-1.5,'1000\\text{ shots}: \\pm 0.016',{fs:12,color:C.h,tex:true});
  a.point(5,Math.log10(0.5)-2.5,{color:C.out,r:6});
  a.note(5.1,-2.6,'10^{5}: \\pm 0.0016',{fs:12,color:C.out,tex:true});
  a.note(1.2,-3.4,'\\text{a hundredfold in shots buys ten in accuracy}',{fs:12,color:C.muted,tex:true});
  return a.svg();
}

/* The principle of deferred measurement: the two circuits are the same. */
function figMeasure(){
  const items = [
    wire(46,90,300), wire(108,90,300),
    {t:'text',x:78,y:51,anchor:'end',label:'q_{0}',tex:true,fs:13.5},
    {t:'text',x:78,y:113,anchor:'end',label:'q_{1}',tex:true,fs:13.5},
    {t:'line',d:'M160,46 V108',color:C.h}, ctrl(160,46)
  ].concat(targ(160,108)).concat([
    meter(250,46),
    {t:'text',x:190,y:158,label:'measure the control last',fs:12},
    /* the second circuit */
    wire(46,460,700), wire(108,460,700),
    {t:'text',x:448,y:51,anchor:'end',label:'q_{0}',tex:true,fs:13.5},
    {t:'text',x:448,y:113,anchor:'end',label:'q_{1}',tex:true,fs:13.5},
    meter(510,46)
  ]).concat(cwire(46,534,610)).concat([
    {t:'line',d:'M610,46 V108',color:C.out},
    gate(610,108,'X',true),
    {t:'text',x:580,y:158,label:'measure it first and switch on the bit',fs:12},
    {t:'text',x:380,y:200,label:'The two circuits produce the same counts on every input. A control may be measured before or after it controls.',fs:12.5},
    {t:'text',x:380,y:226,label:'What may not move is a measurement past a gate that acts on the same wire.',fs:12.5,color:C.err}
  ]);
  return P.blocks({w:760,h:236,items});
}

/* A dynamic circuit: measure, act on the bit, measure again. */
function figFeed(){
  const items = [
    wire(50,110,250), wire(50,300,470), wire(50,520,660),
    {t:'text',x:98,y:55,anchor:'end',label:'q_{0}',tex:true,fs:14},
    gate(170,50,'H',true),
    meter(275,50)
  ].concat(cwire(50,299,410)).concat([
    {t:'line',d:'M410,50 V116',color:C.out},
    {t:'box',x:360,y:116,w:100,h:40,label:'if the bit is 1',fs:11.5,color:C.out},
    {t:'line',d:'M410,156 V178',color:C.out},
    gate(410,196,'X',true),
    {t:'line',d:'M410,213 V232',color:C.rule},
    {t:'text',x:410,y:250,label:'applied back onto the same wire',fs:11.5},
    {t:'text',x:485,y:44,anchor:'start',label:'\\rightarrow',tex:true,fs:15},
    meter(560,50),
    {t:'text',x:680,y:55,anchor:'start',label:'0',fs:15,color:C.out},
    {t:'text',x:380,y:284,label:'The second reading is 0 every time, whatever the first one was. The correction is chosen by a bit that did not exist',fs:12.5},
    {t:'text',x:380,y:308,label:'when the circuit was written, and the whole decision happens inside one shot.',fs:12.5}
  ]);
  return P.blocks({w:760,h:320,items});
}

/* One ideal gate, rewritten into a set a machine actually offers. */
function figIset(){
  return P.blocks({w:760,h:224,items:[
    {t:'box',x:40,y:40,w:150,h:56,label:'H',tex:true,fs:18,color:C.in},
    {t:'arrow',x1:190,y1:68,x2:250,y2:68},
    {t:'box',x:250,y:40,w:130,h:56,label:'R_{z}(\\pi/2)',tex:true,fs:15,color:C.h},
    {t:'box',x:390,y:40,w:130,h:56,label:'R_{x}(\\pi/2)',tex:true,fs:15,color:C.h},
    {t:'box',x:530,y:40,w:130,h:56,label:'R_{z}(\\pi/2)',tex:true,fs:15,color:C.h},
    {t:'text',x:115,y:118,label:'what the circuit says',fs:12},
    {t:'text',x:455,y:118,label:'what the machine runs, up to a global phase',fs:12},
    {t:'box',x:40,y:150,w:150,h:52,label:'\\mathrm{CNOT}',tex:true,fs:15,color:C.in},
    {t:'arrow',x1:190,y1:176,x2:250,y2:176},
    {t:'box',x:250,y:150,w:110,h:52,label:'H',tex:true,fs:16,color:C.h},
    {t:'box',x:370,y:150,w:110,h:52,label:'\\mathrm{CZ}',tex:true,fs:15,color:C.h},
    {t:'box',x:490,y:150,w:110,h:52,label:'H',tex:true,fs:16,color:C.h},
    {t:'text',x:672,y:180,label:'one gate becomes three',fs:12,color:C.err}
  ]});
}

/* Routing: the two qubits a gate names are not neighbours on the chip. */
function figRoute(){
  const items = [];
  /* the coupling map: a line of four */
  for(let i=0;i<4;i++){
    items.push({t:'box',x:60+i*90,y:36,w:52,h:44,label:'Q_{'+i+'}',tex:true,fs:13,color:C.mid});
    if(i<3) items.push({t:'line',d:`M${112+i*90},58 H${150+i*90}`,color:C.rule});
  }
  items.push({t:'text',x:210,y:104,label:'the chip: each pair joined by a line can share a gate',fs:12});
  items.push({t:'text',x:210,y:150,anchor:'middle',label:'\\mathrm{CNOT}_{0\\to 3}',tex:true,fs:16,color:C.err});
  items.push({t:'text',x:210,y:178,label:'names a pair that is not joined',fs:12,color:C.err});
  items.push({t:'arrow',x1:390,y1:150,x2:450,y2:150});
  items.push({t:'text',x:600,y:60,anchor:'middle',label:'2 \\text{ SWAPs} = 6\\ \\mathrm{CNOT}s',tex:true,fs:15});
  items.push({t:'text',x:600,y:104,anchor:'middle',label:'+\\;1\\ \\mathrm{CNOT}',tex:true,fs:15});
  items.push({t:'text',x:600,y:150,anchor:'middle',label:'=\\;7\\ \\mathrm{CNOT}s',tex:true,fs:16,color:C.out});
  items.push({t:'text',x:600,y:186,anchor:'middle',label:'for the one gate that was written',fs:12});
  items.push({t:'text',x:380,y:222,label:'Nothing about the algorithm changed. The chip decided the cost, and it decided it after the circuit was written.',fs:12.5});
  return P.blocks({w:760,h:234,items});
}

/* The five things a resource claim has to name. */
function figClaimBox(){
  const rows = [
    ['task','what exactly is to be produced, and from what'],
    ['input model','how the data is reached: a query, a list in memory, a formula'],
    ['accuracy','with what probability, and to what error'],
    ['hardware model','how many qubits, how connected, how noisy, error corrected or not'],
    ['baseline','the best classical algorithm for the same task, run on real hardware']
  ];
  const items = [];
  rows.forEach(([k,v],i)=>{
    const y = 22 + i*40;
    /* The last two carry the error tone, and the caption beside the figure
       names two. A caption that promises two and a figure that marks one is
       the pairing chapter 4's Pauli figure shipped and had to fix. */
    items.push({t:'box',x:34,y,w:150,h:32,label:k,fs:13,color:i>=3?C.err:C.h});
    items.push({t:'text',x:200,y:y+21,anchor:'start',label:v,fs:12.5});
  });
  items.push({t:'text',x:380,y:246,label:'A claim missing any one of the five is not yet a claim. It is a sentence that cannot be checked.',fs:12.5,color:C.err});
  return P.blocks({w:760,h:258,items});
}

/* The Ramsey sandwich: a phase written between two Hadamards comes out as a
   population, and the curve is what is actually measured. */
function figRamsey(){
  const a = P.Axes({w:560,h:290,xr:[0,360],yr:[0,1.34],
    xlabel:'\\varphi\\,(\\text{degrees})', ylabel:'p(0)',
    pad:{l:68,r:26,t:30,b:48}, xtarget:5, yticksOverride:[0,0.25,0.5,0.75,1]});
  a.curve(d => Math.cos(d*D2R/2)**2, {color:C.in,width:2.6,n:361});
  /* The frame is taller than the curve so that every name has a band of its
     own above it. A name laid on the curve is what `textclash.js` fires on. */
  a.point(90,0.5,{color:C.h,r:6});
  a.note(96,0.62,'\\varphi=90^{\\circ}: \\text{ a fair coin}',{fs:12,color:C.h,tex:true});
  a.point(180,0,{color:C.out,r:6});
  a.note(180,0.34,'\\varphi=180^{\\circ}: \\text{ always } 1',{fs:12,color:C.out,anchor:'middle',tex:true});
  a.note(178,1.22,'p(0)=\\cos^{2}(\\varphi/2)',{fs:13,color:C.in,anchor:'middle',tex:true});
  return a.svg();
}

/* The copier that works on the basis and fails on everything else. */
function figClone(){
  const items = [
    wire(46,120,330), wire(108,120,330),
    {t:'text',x:108,y:51,anchor:'end',label:'|\\psi\\rangle',tex:true,fs:14},
    {t:'text',x:108,y:113,anchor:'end',label:'|0\\rangle',tex:true,fs:14},
    {t:'line',d:'M230,46 V108',color:C.h}, ctrl(230,46)
  ].concat(targ(230,108)).concat([
    {t:'text',x:225,y:152,label:'the obvious copier',fs:12},
    {t:'text',x:560,y:44,anchor:'middle',label:'|0\\rangle \\mapsto |00\\rangle, \\qquad |1\\rangle \\mapsto |11\\rangle',tex:true,fs:15,color:C.out},
    {t:'text',x:560,y:92,anchor:'middle',label:'|{+}\\rangle \\mapsto \\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle) \\neq |{+}\\rangle|{+}\\rangle',tex:true,fs:15,color:C.err},
    {t:'text',x:560,y:136,anchor:'middle',label:'entangled, not copied',fs:12,color:C.err},
    {t:'text',x:380,y:190,label:'It copies the two states it was tested on and entangles everything else. The overlap with a true copy is only one half.',fs:12.5},
    {t:'text',x:380,y:216,label:'No other circuit does better: a machine that copied every unknown state would not preserve inner products.',fs:12.5}
  ]);
  return P.blocks({w:760,h:228,items});
}

/* The teleportation circuit, whole, with the classical wires drawn as the
   double lines they are. */
function figTele(){
  const Y0=46, Y1=118, Y2=190;
  const items = [
    wire(Y0,150,720), wire(Y1,150,720), wire(Y2,150,720),
    {t:'text',x:140,y:Y0+5,anchor:'end',label:'q_{0}:\\;|\\psi\\rangle',tex:true,fs:13.5},
    {t:'text',x:140,y:Y1+5,anchor:'end',label:'q_{1}:\\;|0\\rangle',tex:true,fs:13.5},
    {t:'text',x:140,y:Y2+5,anchor:'end',label:'q_{2}:\\;|0\\rangle',tex:true,fs:13.5},
    /* stage 1: the Bell pair on q1 and q2 */
    gate(200,Y1,'H',true),
    {t:'line',d:`M250,${Y1} V${Y2}`,color:C.h}, ctrl(250,Y1)
  ].concat(targ(250,Y2)).concat([
    /* stage 2: the Bell-basis rotation on q0 and q1 */
    {t:'line',d:`M330,${Y0} V${Y1}`,color:C.h}, ctrl(330,Y0)
  ]).concat(targ(330,Y1)).concat([
    gate(390,Y0,'H',true),
    /* stage 3: the two measurements */
    meter(455,Y0), meter(455,Y1),
    /* stage 4: the classical wires, down to the two corrections */
    ]).concat(cwire(Y1,479,560)).concat(cwire(Y0,479,630)).concat([
    /* m1, from q1, chooses the X; m0, from q0, chooses the Z, and the X is
       applied first. Crossing these two wires produces a circuit that repairs
       one branch in four and looks entirely reasonable. */
    {t:'line',d:`M560,${Y1} V${Y2}`,color:C.out},
    {t:'line',d:`M630,${Y0} V${Y2}`,color:C.out},
    gate(560,Y2,'X',true,34,C.out),
    gate(630,Y2,'Z',true,34,C.out),
    {t:'text',x:225,y:246,label:'one Bell pair, shared',fs:12},
    {t:'text',x:360,y:246,label:'Bell-basis rotation',fs:12},
    {t:'text',x:455,y:246,label:'two bits',fs:12},
    {t:'text',x:640,y:246,label:'the correction those bits choose',fs:12},
    {t:'line',d:'M290,20 V222',color:C.rule},
    {t:'line',d:'M420,20 V222',color:C.rule},
    {t:'line',d:'M500,20 V222',color:C.rule},
    {t:'text',x:380,y:280,label:'The double lines are classical bits. Everything to the right of them waits for those bits to arrive.',fs:12.5,color:C.err}
  ]);
  return P.blocks({w:760,h:292,items});
}

/* The four branches, each with its probability and its correction. */
function figBranch(){
  const rows = [
    ['00','|\\psi\\rangle','I',C.out],
    ['01','Z|\\psi\\rangle','Z',C.h],
    ['10','X|\\psi\\rangle','X',C.h],
    ['11','XZ|\\psi\\rangle','ZX',C.mid]
  ];
  const items = [
    {t:'text',x:110,y:30,anchor:'middle',label:'m_{1}m_{0}',tex:true,fs:13},
    {t:'text',x:280,y:30,anchor:'middle',label:'probability',fs:12.5},
    {t:'text',x:450,y:30,anchor:'middle',label:'what Bob holds',fs:12.5},
    {t:'text',x:640,y:30,anchor:'middle',label:'what Bob applies',fs:12.5},
    {t:'line',d:'M40,42 H720',color:C.rule}
  ];
  rows.forEach(([m,b,c,col],i)=>{
    const y = 76 + i*42;
    items.push({t:'text',x:110,y,anchor:'middle',label:m,fs:15,color:col});
    items.push({t:'text',x:280,y,anchor:'middle',label:'0.25',fs:14});
    items.push({t:'text',x:450,y,anchor:'middle',label:b,tex:true,fs:15});
    items.push({t:'text',x:640,y,anchor:'middle',label:c,tex:true,fs:15,color:col});
  });
  items.push({t:'text',x:380,y:266,label:'Every branch has probability one quarter, for every input state. That is the whole of the no-signalling argument.',fs:12.5,color:C.err});
  return P.blocks({w:760,h:280,items});
}

/* Bob's qubit before and after the two bits arrive, as points of the ball.
   Isotropic: 240 px over a span of 3.00 on both axes in each disc, so 80 px to
   the unit in either direction and both circles are round. */
function figNosig(){
  /* Isotropic: 540 px over an x span of 7.65 and 240 px over a y span of
     3.40, both 70.6 px to the unit, so both balls are drawn as circles. An
     anisotropic frame here would draw the one object the scene is about as an
     ellipse. */
  const a = P.Axes({w:600,h:300,xr:[-1.65,6.00],yr:[-1.50,1.90],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const circle = (cx,cy)=>{ const p=[]; for(let i=0;i<=220;i++){ const s=2*Math.PI*i/220;
    p.push([cx+Math.cos(s), cy+Math.sin(s)]); } return p; };
  a.poly(circle(0,0),{color:C.grid,width:1.6});
  a.poly(circle(4.3,0),{color:C.grid,width:1.6});
  a.point(0,0,{color:C.err,r:7});
  a.note(0,-1.30,'\\text{before the bits: } I/2',{fs:12.5,color:C.err,anchor:'middle',dy:14,tex:true});
  a.poly([[4.3,0],[4.3+0.55,0.83]],{color:C.out,width:2.6});
  a.point(4.3+0.55,0.83,{color:C.out,r:7});
  a.note(4.3,-1.30,'\\text{after the bits: } |\\psi\\rangle',{fs:12.5,color:C.out,anchor:'middle',dy:14,tex:true});
  a.note(2.175,1.66,'\\text{the qubit did not move, only the description of it}',{fs:12.5,color:C.muted,anchor:'middle',tex:true});
  return a.svg();
}

/* The resource ledger of one teleportation, and the fidelity a protocol has to
   beat before it is entitled to the word. */
function figAccount(){
  return P.blocks({w:760,h:240,items:[
    {t:'box',x:36,y:40,w:180,h:50,label:'1 shared Bell pair',fs:13,color:C.in},
    {t:'box',x:36,y:104,w:180,h:50,label:'2 classical bits',fs:13,color:C.out},
    {t:'arrow',x1:216,y1:98,x2:290,y2:98},
    {t:'box',x:290,y:72,w:180,h:52,label:'1 qubit moved',fs:13,color:C.mid},
    {t:'text',x:126,y:180,label:'consumed, both of them',fs:12},
    {t:'text',x:380,y:180,label:'and the original is destroyed',fs:12},
    {t:'text',x:630,y:56,anchor:'middle',label:'F_{\\text{avg}} \\le \\tfrac23',tex:true,fs:17,color:C.err},
    {t:'text',x:630,y:88,anchor:'middle',label:'with no entanglement',fs:12,color:C.err},
    {t:'text',x:630,y:130,anchor:'middle',label:'F_{\\text{avg}} = \\tfrac{2f+1}{3}',tex:true,fs:16,color:C.out},
    {t:'text',x:630,y:162,anchor:'middle',label:'with a pair of quality f',fs:12},
    {t:'text',x:380,y:220,label:'Beating two thirds on average is the claim. A good number on one favourable input is not.',fs:12.5}
  ]});
}

/* The oracle as a box that is only ever asked questions. */
function figOracle(){
  return P.blocks({w:760,h:224,items:[
    {t:'box',x:270,y:52,w:200,h:96,label:'U_{f}',tex:true,fs:22,color:C.h},
    {t:'arrow',x1:120,y1:80,x2:270,y2:80,label:'|x\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:120,y1:126,x2:270,y2:126,label:'|y\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:470,y1:80,x2:640,y2:80,label:'|x\\rangle',tex:true,color:C.out},
    {t:'arrow',x1:470,y1:126,x2:640,y2:126,label:'|y \\oplus f(x)\\rangle',tex:true,color:C.out},
    {t:'text',x:370,y:176,label:'one query',fs:12.5},
    {t:'text',x:380,y:210,label:'Counting how many times this box is opened is not counting what it cost to build. Both numbers are needed.',fs:12.5,color:C.err}
  ]});
}

/* Phase kickback: the target is prepared in the state the flip cannot change,
   so the answer comes back as a sign on the other register. */
function figKick(){
  return P.blocks({w:760,h:224,items:[
    {t:'text',x:380,y:52,anchor:'middle',label:'X|{-}\\rangle = -|{-}\\rangle',tex:true,fs:18,color:C.h},
    {t:'text',x:380,y:88,anchor:'middle',label:'the target is an eigenstate of the flip',fs:12.5},
    {t:'text',x:380,y:140,anchor:'middle',label:'U_{f}\\,|x\\rangle|{-}\\rangle = (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle',tex:true,fs:18,color:C.mid},
    {t:'text',x:380,y:176,anchor:'middle',label:'so the target never changes and the answer lands as a sign on the first register',fs:12.5},
    {t:'text',x:380,y:210,anchor:'middle',label:'A gate written to change a bit has written a phase instead. That is the whole trick.',fs:12.5,color:C.out}
  ]});
}

/* Amplitude amplification, drawn where it happens: the plane spanned by the
   marked and unmarked states. Isotropic: 380 px over an x span of 2.375 and
   224 px over a y span of 1.40, both exactly 160 px to the unit, so the angle
   theta is drawn at its true size and the reflection is a reflection. */
function figGeom(){
  const a = P.Axes({w:520,h:290,xr:[-0.30,2.075],yr:[-0.33,1.07],
    pad:{l:36,r:36,t:30,b:36}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const th = 22*D2R;
  a.poly([[0,0],[1.05,0]],{color:C.rule,width:1.4});
  a.poly([[0,0],[0,1.02]],{color:C.rule,width:1.4});
  a.note(1.07,0,'|B\\rangle',{fs:13,color:C.muted,dy:5,tex:true});
  a.note(0,1.05,'|G\\rangle',{fs:13,color:C.muted,anchor:'middle',tex:true});
  /* the unit arc the three states all sit on */
  const arc=[]; for(let i=0;i<=90;i++){ const s=Math.PI/2*i/90; arc.push([Math.cos(s),Math.sin(s)]); }
  a.poly(arc,{color:C.grid,width:1.2,dash:'3 4'});
  /* the starting state */
  a.poly([[0,0],[Math.cos(th),Math.sin(th)]],{color:C.in,width:2.6});
  a.point(Math.cos(th),Math.sin(th),{color:C.in,r:6});
  a.note(Math.cos(th),Math.sin(th),'|s\\rangle',{fs:13.5,color:C.in,dx:10,dy:-6,tex:true});
  /* the reflected state, below the axis */
  a.poly([[0,0],[Math.cos(th),-Math.sin(th)]],{color:C.h,width:2.2});
  a.point(Math.cos(th),-Math.sin(th),{color:C.h,r:5.5});
  a.note(Math.cos(th),-Math.sin(th),'O_{f}|s\\rangle',{fs:12.5,color:C.h,dx:10,dy:14,tex:true});
  /* one full iteration */
  const t3 = 3*th;
  a.poly([[0,0],[Math.cos(t3),Math.sin(t3)]],{color:C.out,width:2.6});
  a.point(Math.cos(t3),Math.sin(t3),{color:C.out,r:6});
  a.note(Math.cos(t3),Math.sin(t3),'DO_{f}|s\\rangle',{fs:12.5,color:C.out,dx:10,dy:-6,tex:true});
  /* the angle from the horizontal, drawn as an arc */
  const a1=[]; for(let i=0;i<=30;i++){ const s=th*i/30; a1.push([0.40*Math.cos(s),0.40*Math.sin(s)]); }
  a.poly(a1,{color:C.in,width:1.6});
  a.note(0.44,0.05,'\\theta',{fs:13,color:C.in,tex:true});
  const a2=[]; for(let i=0;i<=30;i++){ const s=th+2*th*i/30; a2.push([0.62*Math.cos(s),0.62*Math.sin(s)]); }
  a.poly(a2,{color:C.out,width:1.8});
  a.note(0.60,0.35,'2\\theta',{fs:13,color:C.out,tex:true});
  a.note(1.30,0.86,'\\sin\\theta=\\sqrt{M/N}',{fs:13,color:C.muted,anchor:'start',tex:true});
  a.note(1.30,0.62,'\\text{one iteration}=\\text{two reflections}',{fs:12.5,color:C.muted,anchor:'start',tex:true});
  a.note(1.30,0.40,'\\text{two reflections}=\\text{a rotation by }2\\theta',{fs:12.5,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* The success probability against the iteration count, with the optimum and
   the overshoot both on the same axes. */
function figIter(){
  const N = 1024, M = 1, th = Math.asin(Math.sqrt(M/N));
  /* The vertical range reaches past one so that the three names have a band
     of their own. A probability cannot enter it, so nothing can collide. */
  const a = P.Axes({w:600,h:310,xr:[0,60],yr:[0,1.40],
    xlabel:'r\\,(\\text{iterations})', ylabel:'P_{\\text{good}}',
    pad:{l:70,r:26,t:30,b:48}, xtarget:6, yticksOverride:[0,0.25,0.5,0.75,1]});
  a.curve(r => Math.sin((2*r+1)*th)**2, {color:C.in,width:2.4,n:600});
  a.point(25, Math.sin(51*th)**2, {color:C.out,r:7});
  a.note(25, 1.16,'r=25:\\;0.9995',{fs:12.5,color:C.out,anchor:'middle',tex:true});
  a.point(50, Math.sin(101*th)**2, {color:C.err,r:7});
  a.note(50, 0.30,'r=50:\\;0.0002',{fs:12.5,color:C.err,anchor:'middle',tex:true});
  a.vline(25,{color:C.rule,width:1.2,dash:'3 4'});
  a.note(1,1.32,'N=1024,\\;M=1',{fs:13,color:C.muted,anchor:'start',tex:true});
  a.note(1,1.16,'\\theta=1.79^{\\circ}',{fs:13,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* Grover's claim, laid against the five things a claim has to name. */
function figGroverClaim(){
  const rows = [
    ['task','\\text{find an }x\\text{ with }f(x)=1\\text{ among }N\\text{ candidates}',C.h,true],
    ['input model','query access to a reversible oracle, not a list in memory',C.h],
    ['accuracy','0.9995 at the optimum, and only if M is known',C.h],
    ['hardware model','ideal qubits, any pair may interact, no error correction counted',C.err],
    ['baseline','\\text{about }N/2\\text{ classical queries, each one a comparison}',C.err,true]
  ];
  const items = [];
  rows.forEach(([k,v,col,tex],i)=>{
    const y = 20 + i*38;
    items.push({t:'box',x:30,y,w:150,h:30,label:k,fs:12.5,color:col});
    items.push({t:'text',x:196,y:y+20,anchor:'start',label:v,tex:!!tex,fs:12.5});
  });
  /* Twenty-five and not thirty-two: the optimum is (pi/4) sqrt(N) and not
     sqrt(N), and the worked example beside this figure uses twenty-five. */
  items.push({t:'text',x:380,y:234,anchor:'middle',label:'25\\text{ queries against }512',tex:true,fs:17,color:C.out});
  items.push({t:'text',x:380,y:262,label:'a quadratic saving in queries, and no statement about time at all',fs:12.5});
  return P.blocks({w:760,h:274,items});
}

/* The chapter as one ladder. */
function figLadder(){
  return P.blocks({w:760,h:200,items:[
    {t:'box',x:24,y:44,w:150,h:56,label:'a circuit',fs:13,color:C.in},
    {t:'arrow',x1:174,y1:72,x2:214,y2:72},
    {t:'box',x:214,y:44,w:150,h:56,label:'a run',fs:13,color:C.h},
    {t:'arrow',x1:364,y1:72,x2:404,y2:72},
    {t:'box',x:404,y:44,w:150,h:56,label:'a protocol',fs:13,color:C.out},
    {t:'arrow',x1:554,y1:72,x2:594,y2:72},
    {t:'box',x:594,y:44,w:146,h:56,label:'a claim',fs:13,color:C.mid},
    {t:'text',x:99,y:124,label:'gates in layers',fs:12},
    {t:'text',x:289,y:124,label:'shots, and a compiler',fs:12},
    {t:'text',x:479,y:124,label:'teleportation, Grover',fs:12},
    {t:'text',x:667,y:124,label:'five things, or nothing',fs:12},
    {t:'text',x:380,y:170,label:'Each step is the one before it, run on something that is not ideal.',fs:12.5}
  ]});
}

const SC = [

/* ---------------------------------------------------------------- 5.0.1 -- */
{ id:'m5-open', module:'M5', nav:'The machine, as it is run', title:'From a drawing of gates to a machine that returns bit strings',
  objective:'Say what this chapter adds to the gates of chapter 4, and name the three objects it keeps apart.',
  keywords:'circuit model overview module 5 program run shots protocol teleportation grover resource claim introduction',
  src:'L8 · a circuit is an abstract program', steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Circuits and protocols'},
  {t:'title', text:'From a drawing of gates to a machine that returns bit strings'},
  {t:'lede', text:'Chapter 4 finished the gates. Nothing new about quantum mechanics is needed after that. What is still missing is everything about running the gates: what a circuit is as an object, what a machine gives back when it runs one, what a compiler does to it first, and how to say honestly what any of it cost.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Three objects get confused with each other, and keeping them apart is most of this chapter. A <b>circuit</b> is a program: wires, gates, and the order they run in. A <b>run</b> is a physical experiment repeated many times. The <b>result</b> is a table of bit strings and how often each came up.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The state in the middle is never handed to anyone. A simulator can print it and a machine cannot, and every claim made in this chapter has to survive that. This is the first sentence of the course, arriving as an engineering constraint rather than as a slogan.</p>'},
      {t:'note', kind:'def', head:'The two halves', html:'The first half is the machine: circuits, shots, measurement inside a circuit, and what a compiler does. The second half runs two protocols on it end to end — teleportation, which needs a classical channel before it finishes anything, and Grover, which is where a resource claim finally has to be written out in full.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOpen(),
      caption:'The three objects, in the order they occur. Each arrow loses something: the second loses the amplitudes and the third loses everything but the counts. An algorithm has to be designed against those losses, not in spite of them.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Nothing here needs new physics', html:'Every gate used in this chapter was written down in chapter 4, and the measurement rule is the one from chapter 2. What is new is bookkeeping: which gates a particular machine has, how long a circuit is, how many times it is run, and what a saving in one of those is worth. Bookkeeping is where the errors of this chapter live.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.1.1 -- */
{ id:'m5-circuit', module:'M5', nav:'What a circuit is', title:'A circuit is a program, and its picture is not a picture of hardware',
  objective:'Read a circuit diagram: wires, gates, layers, and the order the gates act in.',
  keywords:'quantum circuit diagram wires gates layers program abstract not hardware time left to right qubit lines',
  src:'L8 · building an abstract circuit', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'A circuit is a program, and its picture is not a picture of hardware'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A circuit diagram has one horizontal line for each qubit. Time runs left to right along those lines. A box on a line is a gate acting on that qubit; a box drawn across two lines, or a dot on one line joined to a symbol on another, is a gate acting on both.</p>'},
    {t:'body', html:'<p>That is the whole notation. What it describes is a <b>program</b>: a list of instructions and the order they must run in. It is not a stored state, and it is not a drawing of anything on a chip.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Two gates that act on different qubits and have nothing between them may run at the same moment. A set of gates that can all run at once is a <b>layer</b>. The number of layers is the <b>depth</b>, and the number of gates is the <b>gate count</b>. They are two different numbers and the next scenes turn on the difference.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCircuit(),
      caption:'Three qubits and four gates. The vertical rules are the layer boundaries. Here each gate waits for the one before it, so the depth happens to equal the gate count; that is not the usual case and it is worth noticing when it fails.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The circuit in the figure, run on $|000\\rangle$.'],
        ['Work', 'The Hadamard makes $q_{0}$ into $|{+}\\rangle$; the first CNOT copies that into $q_{1}$; the second copies it into $q_{2}$.'],
        ['Answer', 'The state before the last gate is $\\tfrac{1}{\\sqrt2}\\left(|000\\rangle+|111\\rangle\\right)$, and the last gate puts a phase $e^{i\\pi/4}$ on the second term.'],
        ['Check', 'Two amplitudes, each of modulus $1/\\sqrt2$, so the probabilities are $0.5$ and $0.5$ and they add to one. Only two of the eight basis states are ever occupied.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A diagram is not a schedule and not a layout', html:'The lines are not wires on a chip and the spacing is not a duration. Two gates drawn side by side may run at very different speeds, and two qubits drawn next to each other may be far apart on the hardware. Reading a diagram as a picture of the machine is how a circuit that looks short turns out to be slow.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.1.2 -- */
{ id:'m5-model', module:'M5', nav:'The circuit model', title:'What the circuit model of computation allows, and nothing more',
  objective:'State the four steps of the circuit model and say what each one fixes.',
  keywords:'circuit model computation prepare unitary measure repeat computational basis finite gate set model of computation',
  src:'L8 · a circuit is an abstract program', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'What the circuit model of computation allows, and nothing more'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The model is deliberately narrow, and the narrowness is what makes a cost statement possible. Four steps, and nothing else is permitted:</p>'},
    {t:'eq', key:true, tex:'|0\\rangle^{\\otimes n} \\;\\xrightarrow{\\;U_{d}\\cdots U_{2}U_{1}\\;}\\; |\\psi\\rangle \\;\\xrightarrow{\\;\\text{measure}\\;}\\; x \\in \\{0,1\\}^{n}'},
    {t:'body', html:'<p>Every qubit starts in $|0\\rangle$. Every gate comes from one fixed finite set. The measurement is in the computational basis. And the whole thing is repeated, because one run gives one string.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Each restriction is doing work. Fixing the input state means an algorithm cannot smuggle in an answer through its preparation. Fixing the gate set means the cost of a circuit is the number of gates, since each costs the same. Fixing the measurement basis means a change of basis is a gate and has to be paid for.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figModel(),
      caption:'The four steps. Every quantum algorithm in this course is an instance of this diagram, and the differences between them are entirely in the middle box.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Where the other operations went', html:'Measurement in another basis is a rotation followed by a computational-basis measurement. Preparing another input state is a circuit that builds it from $|0\\rangle$. A classical bit steering a gate is the dynamic circuit of a later scene. Nothing was left out; everything was reduced to the four steps so that counting means something.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A run gives one string, not a distribution', html:'The model returns $n$ bits per run. The probabilities are never observed directly and are always <b>estimated</b> from repeats. An algorithm whose output is "the distribution over $x$" has not finished; it has to say how many shots the estimate needs and how accurate the estimate then is.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.1.3 -- */
{ id:'m5-read', module:'M5', nav:'Reading the wires', title:'The wire at the top is the last digit of the ket',
  objective:'Translate between the wire order in a diagram, the ket, the vector index and the printed bit string.',
  keywords:'bit order convention wire order ket index vector entry classical register string little endian least significant',
  src:'L8 · bit order: wires, integers, kets and strings', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'The wire at the top is the last digit of the ket'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 4 fixed the ordering and this scene is where it starts costing money. Two conventions meet on a circuit diagram and they point in opposite directions.</p>'},
    {t:'eq', key:true, tex:'|q_{n-1}\\,\\ldots\\,q_{1}q_{0}\\rangle, \\qquad x = \\sum_{k} 2^{k} q_{k}'},
    {t:'body', html:'<p>Qubit $q_{0}$ is drawn on the <b>top</b> wire, and $q_{0}$ is the <b>last</b> digit of the ket and the <b>least significant</b> bit of the index. So the wire order down the page and the digit order across the ket are reverses of each other.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The classical string a run prints follows the same rule: if wire $q_{k}$ is written into classical bit $c_{k}$, the printed string is $c_{n-1}\\ldots c_{1}c_{0}$, so the top wire is the rightmost character. One convention, applied consistently, and every one of the four descriptions above lands on the same state.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOrder(),
      caption:'One state, named four ways. The reading on the bottom wire is the leading digit of the ket, the leading bit of the index and the leading character of the printed string.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A three-qubit run prints the string $101$ with high frequency.'],
        ['Work', 'The leftmost character is $c_{2}$ and the rightmost is $c_{0}$, so $q_{2}=1$, $q_{1}=0$ and $q_{0}=1$.'],
        ['Answer', 'The state is $|101\\rangle$ and the index is $x = 4+0+1 = 5$: entry $5$ of the state vector.'],
        ['Check', 'Read it back the other way. Entry $5$ is $101$ in binary, the top wire carries the last digit, so the top wire read $1$ — which is what $q_{0}=1$ says.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The reversed reading is normalised and wrong', html:'Reading $101$ as $q_{0}=1,q_{1}=0,q_{2}=1$ gives $|101\\rangle$ again, which is why the error hides: a palindrome cannot expose it. Try $|100\\rangle$ against $|001\\rangle$. Both are legal states, both have probability one, and they are different states — so every number computed downstream is wrong with no symptom anywhere. Fix the convention before the first calculation and write it at the top of the page.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.1.4 -- */
{ id:'m5-depth', module:'M5', nav:'Depth against gate count', title:'Depth is what a coherence time is spent against, and it is not the gate count',
  objective:'Compute the depth and the gate count of a circuit and say which one a coherence budget limits.',
  keywords:'depth gate count layers parallel ghz chain tree coherence time budget circuit length two qubit count',
  src:'L8 · GHZ state, transpilation and instruction-set compliance', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'Depth is what a coherence time is spent against, and it is not the gate count'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Two numbers describe how big a circuit is, and they answer different questions. The <b>gate count</b> is how much work there is. The <b>depth</b> is how many layers must run one after another, and therefore how long the circuit takes.</p>'},
    {t:'body', html:'<p>Chapter 3 gave the reason depth is the one that hurts. A qubit keeps its phase for a time $T_{2}$, and a circuit of depth $d$ made of gates lasting $\\tau$ each occupies</p>'},
    {t:'eq', key:true, tex:'T_{\\text{circuit}} \\approx d\\,\\tau, \\qquad \\text{useful while } d\\,\\tau \\ll T_{2}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Gates that act on different qubits run in the same layer, so a wide circuit can be shallow. The GHZ state on $n$ qubits needs $n-1$ CNOTs however it is built, but a chain has depth $n$ and a tree has depth about $1+\\log_{2}n$. Same work, very different time on the machine.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDepth(),
      caption:'The same four-qubit GHZ state, two ways. Four gates in both. The chain waits for each CNOT before starting the next; the tree runs two of them together in one layer.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'GHZ on $n=16$ qubits, gates of $200\\,\\text{ns}$, $T_{2}=80\\,\\mu\\text{s}$.'],
        ['Work', 'Both circuits use $1+15=16$ gates. The chain has depth $16$; the tree has depth $1+\\log_{2}16 = 5$.'],
        ['Answer', 'The chain takes $3.2\\,\\mu\\text{s}$ and the tree $1.0\\,\\mu\\text{s}$ — a factor of about three in time, for no change in gate count at all.'],
        ['Check', 'Both are far below $80\\,\\mu\\text{s}$, so both are plausible here. Now put $n=1000$ in: the chain needs $200\\,\\mu\\text{s}$ and is impossible, while the tree needs $2.2\\,\\mu\\text{s}$ and is not. The gate count never saw the difference.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'"Fewer gates" is not "faster" and not "more accurate"', html:'A rewrite that removes gates but serialises what was parallel makes the circuit slower. A rewrite that removes one-qubit gates and adds one two-qubit gate usually makes it <b>less</b> accurate, because a two-qubit gate is the expensive one by an order of magnitude. Compare two-qubit count, depth and duration, and say which of the three the claim is about.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.2.1 -- */
{ id:'m5-state', module:'M5', nav:'Exact simulation', title:'An exact statevector is a debugging tool, and it stops at about thirty qubits',
  objective:'Say what an exact statevector simulation gives and where it stops being possible.',
  keywords:'statevector simulation exact amplitudes deterministic memory exponential debugging tool classical simulation limit',
  src:'L8 · exact statevector evolution and the operator representation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'An exact statevector is a debugging tool, and it stops at about thirty qubits'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A classical computer can hold the state vector of a small circuit and apply the gates to it exactly. There are no shots and no noise, and the amplitudes it prints are deterministic up to rounding. That is what makes it useful: it answers "is my circuit the circuit I meant to write".</p>'},
    {t:'body', html:'<p>It also stops. The vector has $2^{n}$ complex entries, and each takes sixteen bytes in double precision:</p>'},
    {t:'eq', key:true, tex:'\\text{bytes} = 16\\cdot 2^{n}, \\qquad n=30 \\Rightarrow 17\\,\\text{GB}, \\qquad n=50 \\Rightarrow 18\\,\\text{PB}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The unitary matrix of a circuit is worse: $2^{n}\\times 2^{n}$ entries, so $4^{n}$ of them. A twenty-qubit gate matrix is already beyond any machine, and this is why a circuit is checked by acting on states rather than by forming its matrix.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figState(),
      caption:'What one state vector costs, against the number of qubits. The vertical axis is logarithmic, so the exponential is a straight line and no amount of extra hardware bends it.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A workstation with $64\\,\\text{GB}$ of memory.'],
        ['Work', 'Solve $16\\cdot 2^{n} \\le 64\\times 10^{9}$, so $2^{n} \\le 4\\times 10^{9}$ and $n \\le 31.9$.'],
        ['Answer', 'About $31$ qubits, and in practice fewer, because a simulator needs at least one working copy of the vector.'],
        ['Check', 'One more qubit doubles the requirement. Going from $31$ to $41$ qubits asks for a thousand times the memory, which is the whole reason the exponential matters.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A simulation limit is not a proof of advantage', html:'"A classical computer cannot store this state" is a statement about one particular method. Many circuits that are far too large for a state vector are still easy to simulate another way — Clifford circuits by the stabiliser method, shallow circuits by tensor networks. The size of the state vector is an upper bound on the difficulty, never a lower one.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.2.2 -- */
{ id:'m5-shots', module:'M5', nav:'Shots and their error', title:'A probability read from a finite run carries an error bar, and it is not noise',
  objective:'Give the standard error of a probability estimated from N shots and separate it from device noise.',
  keywords:'shots sampling binomial standard error one over root n estimation finite statistics not physical noise systematic',
  src:'L8 · measurement, barriers and finite shots', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'A probability read from a finite run carries an error bar, and it is not noise'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Each shot returns one string. Counting how often a particular outcome came up and dividing by the number of shots gives an <b>estimate</b> of its probability, and an estimate is not the probability.</p>'},
    {t:'body', html:'<p>The count of a fixed outcome over $N$ independent shots is binomial, so the estimate has a standard error that chapter 2 already derived:</p>'},
    {t:'eq', key:true, tex:'K \\sim \\text{Binomial}(N,p), \\qquad \\hat{p}=\\frac{K}{N}, \\qquad \\mathrm{SE}(\\hat{p}) = \\sqrt{\\frac{p(1-p)}{N}}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The square root is the whole economics of running a quantum computer. Ten times the accuracy costs a hundred times the shots, and every shot is a full circuit executed on the machine. Choosing the shot count from a target accuracy, rather than from habit, is the difference between a five-minute job and a five-hour one.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShots(),
      caption:'The error bar on a probability near one half, against the shot count. Both axes are logarithmic, so the one-over-root-$N$ law is a straight line, and its slope of minus one half is the law itself.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'An outcome with true probability $p=0.5$, and a target of $\\pm 0.005$ at one standard error.'],
        ['Work', '$\\sqrt{0.25/N} \\le 0.005$ gives $N \\ge 0.25/0.005^{2}$.'],
        ['Answer', '$N \\ge 10{,}000$ shots.'],
        ['Check', 'At $N=1000$ the error is $0.0158$, three times larger, and $1000$ is ten times fewer shots. Ten in shots, about three in accuracy: the square root, seen directly.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'More shots never remove a bias', html:'Sampling error shrinks as $1/\\sqrt{N}$ and goes to zero. Device error does not: a faulty gate or a mis-calibrated readout changes the distribution being sampled, so more shots estimate the <b>wrong</b> probability more precisely. When a result disagrees with the ideal value by far more than its error bar, the answer is never more shots.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.2.3 -- */
{ id:'m5-measure', module:'M5', nav:'Measurement inside a circuit', title:'A measurement in the middle can be moved to the end, and a gate cannot be moved past one',
  objective:'Apply the deferred-measurement rule and say which rearrangements it does not permit.',
  keywords:'deferred measurement principle mid circuit measurement implicit measurement control classical equivalence commute barrier',
  src:'L8 · measurement, barriers and finite shots', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'A measurement in the middle can be moved to the end, and a gate cannot be moved past one'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A measurement need not be the last thing a circuit does. Once it is not, one question decides whether a circuit can be rearranged: does anything after the measurement act on the measured wire?</p>'},
    {t:'body', html:'<p>If a qubit is measured and the result only ever <b>controls</b> later gates, the measurement can be pushed to the end of the circuit and the classical control replaced by a quantum control. The counts are identical:</p>'},
    {t:'eq', key:true, tex:'\\text{measure } q_{0},\\ \\text{then } X^{m}\\ \\text{on } q_{1} \\;\\equiv\\; \\mathrm{CNOT}_{0\\to1},\\ \\text{then measure } q_{0}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The reason is short. A control acts differently on the two branches of the control qubit and does nothing to mix them, so whether the branches were separated by a measurement first makes no difference to any later count. This is the rule that lets a circuit with mid-circuit measurements be simulated as one unitary.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figMeasure(),
      caption:'The same circuit twice. On the left the control is measured last; on the right it is measured first and its bit switches the gate. Every outcome has the same probability in both.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The other half of the rule', html:'A qubit that is measured and then never used again may as well not be measured at all: leaving it alone gives the same statistics on everything else. Chapter 3 already proved this — an unread system is traced out, and tracing out is what an unrecorded measurement does.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A gate on the measured wire may not cross the measurement', html:'Put a Hadamard on $q_{0}$ <b>after</b> the measurement and the two circuits stop agreeing at once, because the measurement destroyed the phase the Hadamard needed. The rule is about a measured wire being used as a control and nothing else. This is what a barrier in a compiled circuit protects: it marks a place the optimiser may not move an instruction across.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.2.4 -- */
{ id:'m5-feed', module:'M5', nav:'Classical feedforward', title:'A gate chosen by a bit that did not exist when the circuit was written',
  objective:'Read a dynamic circuit and say what feedforward costs that a fixed circuit does not.',
  keywords:'dynamic circuit classical feedforward conditional gate mid circuit measurement latency reset real time control flow',
  src:'L8 · dynamic circuits and classical feedforward', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'A gate chosen by a bit that did not exist when the circuit was written'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A <b>dynamic circuit</b> measures a qubit part-way through a shot, and uses that classical bit to decide what to do next, inside the same shot. The decision is made by control electronics beside the machine, not by a program on a laptop.</p>'},
    {t:'body', html:'<p>The distinction matters because of what it makes possible. Teleportation, error correction and state reset all need a gate whose identity is not known until a measurement has happened, and none of them can wait for a result to travel to a host computer and back.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The example in the figure is the smallest one. A Hadamard makes the outcome a fair coin; the bit is read; an $X$ is applied exactly when the bit was one. The second reading is $0$ every single time, with certainty, although the first reading was a coin toss.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figFeed(),
      caption:'The smallest dynamic circuit. The double line carries one classical bit. Both readings happen inside one shot, and the second one is deterministic.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The circuit in the figure, on $|0\\rangle$.'],
        ['Work', 'After $H$ the state is $|{+}\\rangle$, so the first reading is $0$ or $1$ with probability $0.5$ each, and the qubit is left in the state that was read.'],
        ['Answer', 'If the bit is $0$ nothing is applied and the qubit is $|0\\rangle$; if it is $1$ the $X$ maps $|1\\rangle$ back to $|0\\rangle$. The second reading is $0$ with probability $1$.'],
        ['Check', 'The two branches have probability $0.5$ and both end at $|0\\rangle$, so the final distribution is a point mass at $0$. Remove the conditional $X$ and the final distribution is a fair coin again.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Feedforward is not free, and it is not instantaneous', html:'A mid-circuit measurement takes far longer than a gate, and the electronics need time to read the bit and act on it. Both count against the coherence time. A dynamic circuit can be worse than the fixed circuit it replaced even when it has fewer gates, and the only way to know is to compare durations rather than gate counts.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.3.1 -- */
{ id:'m5-iset', module:'M5', nav:'The instruction set', title:'A machine runs a few gates, and every other gate is rewritten into them',
  objective:'Rewrite a gate into a stated instruction set and count what the rewrite costs.',
  keywords:'instruction set native gates basis gates translation rewriting hadamard cz decomposition compile target isa',
  src:'L8 · transpilation and instruction-set compliance', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'A machine runs a few gates, and every other gate is rewritten into them'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 4 showed that a small set of gates is universal. A real machine chooses one such set — its <b>instruction set</b> — and it can run nothing else. A circuit written in convenient gates has to be translated first.</p>'},
    {t:'body', html:'<p>The translations are the identities of chapter 4, used in the other direction. Two examples, both exact:</p>'},
    {t:'eq', key:true, tex:'H = e^{i\\pi/2} R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{x}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right)'},
    {t:'eq', key:true, tex:'\\mathrm{CNOT}_{0\\to1} = \\left(H \\text{ on } q_{1}\\right)\\;\\mathrm{CZ}\\;\\left(H \\text{ on } q_{1}\\right)'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Neither rewrite is an approximation: both are exact identities, and the Euler decomposition of chapter 4 guarantees that one exists for every one-qubit gate. What is lost is only length. One gate has become three, and a circuit of a thousand gates has become a circuit of three thousand.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figIset(),
      caption:'Two translations. The upper one is exact up to a global phase, which is invisible here and would not be if the gate were controlled. The lower one is exact outright.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A machine whose only two-qubit gate is CZ, and a circuit with $40$ CNOTs.'],
        ['Work', 'Each CNOT becomes one CZ with a Hadamard either side of the target.'],
        ['Answer', '$40$ CZ gates and $80$ Hadamards, so $120$ instructions where the circuit named $40$.'],
        ['Check', 'The two-qubit count is unchanged at $40$, and that is the number the error budget cares about. The extra Hadamards are one-qubit gates and cost roughly a tenth as much error each.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A global phase in a rewrite is not always harmless', html:'The Hadamard identity above carries $e^{i\\pi/2}$. On its own that is invisible, exactly as chapter 4 said. Put the gate under a control and the phase moves to one branch only, where it is fully observable. A compiler tracks these phases; a person rewriting a controlled gate by hand often does not, and the circuit then computes something else.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.3.2 -- */
{ id:'m5-transpile', module:'M5', nav:'Layout and routing', title:'Two qubits that are not neighbours cannot share a gate until one of them moves',
  objective:'Count what routing a gate between distant qubits costs on a stated coupling map.',
  keywords:'transpilation layout routing coupling map connectivity swap overhead physical qubits virtual mapping compiler passes',
  src:'L8 · transpilation and instruction-set compliance', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'Two qubits that are not neighbours cannot share a gate until one of them moves'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A circuit assumes any two qubits can share a gate. A chip does not: only certain pairs are physically joined, and the list of joined pairs is the <b>coupling map</b>. Bringing a circuit onto a chip has four jobs, and each is a compiler pass.</p>'},
    {t:'body', html:'<p><b>Layout</b> chooses which physical qubit plays each qubit of the circuit. <b>Routing</b> inserts SWAP gates so that every two-qubit gate acts on a joined pair when it runs. <b>Translation</b> rewrites into the instruction set. <b>Optimisation</b> then removes what it can.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Routing is the expensive one, and it is expensive in the currency that matters: a SWAP is three CNOTs, and a CNOT is the gate with the largest error. A gate between qubits $d$ steps apart on the map costs $3(d-1)$ extra CNOTs to bring them together, and possibly the same again to put them back.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figRoute(),
      caption:'A chip whose qubits form a line, and a gate the circuit wrote between the two ends. Nothing about the algorithm changed; the chip decided the cost, after the circuit was written.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A line of four qubits, and $\\mathrm{CNOT}_{0\\to3}$.'],
        ['Work', 'Two SWAPs bring the state of $Q_{0}$ next to $Q_{3}$, at three CNOTs each, then the CNOT itself runs.'],
        ['Answer', '$2\\times 3 + 1 = 7$ two-qubit gates for one written gate.'],
        ['Check', 'The compiler can often leave the qubits permuted at the end and relabel the classical bits instead of swapping back, which halves the overhead. A report that does not say which was done is not comparable with one that does.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Two runs of a compiler need not agree', html:'Layout and routing are heuristic searches, and most of them are randomised. The same circuit compiled twice can differ in depth by a large factor, and both results are correct. A published gate count is therefore incomplete unless it names the compiler, its settings and its seed — which is the same discipline any numerical result needs.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.3.3 -- */
{ id:'m5-cost', module:'M5', nav:'What a resource claim names', title:'Five things, or it is not yet a claim',
  objective:'State the five components of a resource claim and reject a claim that is missing one.',
  keywords:'resource claim task input model accuracy hardware model classical baseline speedup comparison honest reporting',
  src:'L8 · execution time, usage and experimental cost', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'Five things, or it is not yet a claim'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The third sentence of this course arrives here, and from now on it is a working tool rather than a warning. A statement that one method beats another has to name five things, and a statement missing any of them cannot be checked at all.</p>'},
    {t:'body', html:'<p>The <b>task</b>: what is to be produced. The <b>input model</b>: how the data is reached. The <b>accuracy</b>: with what probability and to what error. The <b>hardware model</b>: how many qubits, how connected, how noisy. The <b>baseline</b>: the best classical method for the same task.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The last one is where most claims fail, and it fails in a particular way: the quantum method is compared against the obvious classical method rather than the best one. A quadratic saving over a bad algorithm is not a saving at all if a good classical algorithm was already faster than both.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figClaimBox(),
      caption:'The five. The two in the error tone are the two that get left out, and they are the two that decide whether a claim survives contact with a machine.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The claim: "this circuit sorts a list quadratically faster".'],
        ['Work', 'Task: sorting — but of what, and returned how? Input model: is the list already in a quantum memory, and what did loading it cost? Accuracy: what is the failure probability? Hardware: how many qubits, error corrected? Baseline: against which sort?'],
        ['Answer', 'Five questions, five gaps. The sentence is not false; it is not yet a claim, because nothing in it can be measured.'],
        ['Check', 'Fill any one of them in and the sentence changes meaning. If the list has to be loaded into a quantum memory one item at a time, the loading alone is linear and no quadratic saving over the whole task is possible.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A query count is not a runtime', html:'Almost every quantum speedup in a textbook is stated as a count of <b>queries</b> to a black box. That is a real and provable statement, and it is not a time. One quantum query is a whole circuit, deep and error-corrected, running for microseconds; one classical query is a memory read taking nanoseconds. A ratio of query counts and a ratio of runtimes can point in opposite directions.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.4.1 -- */
{ id:'m5-ramsey', module:'M5', nav:'Turning phase into counts', title:'A phase is invisible until two Hadamards turn it into a population',
  objective:'Trace the Hadamard sandwich and give the probability it produces from a phase.',
  keywords:'ramsey interference hadamard sandwich phase to population conversion fringe measurement basis change cosine squared',
  src:'L8 · Ramsey-style phase-to-population conversion', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Interference in a circuit'},
  {t:'title', text:'A phase is invisible until two Hadamards turn it into a population'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Every algorithm in this course and the next works by arranging a relative phase and then converting it into a probability. The smallest circuit that does both is three gates long, and it is worth being able to write down from memory.</p>'},
    {t:'eq', tex:'|0\\rangle \\;\\xrightarrow{\\;H\\;}\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right) \\;\\xrightarrow{\\;P(\\varphi)\\;}\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\varphi}|1\\rangle\\right)'},
    {t:'eq', key:true, tex:'\\xrightarrow{\\;H\\;}\\; \\tfrac12\\left(1+e^{i\\varphi}\\right)|0\\rangle + \\tfrac12\\left(1-e^{i\\varphi}\\right)|1\\rangle, \\qquad p(0) = \\cos^{2}\\frac{\\varphi}{2}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The middle state has probability one half on each outcome for every $\\varphi$, so measuring there learns nothing about the phase at all. The second Hadamard is what makes the phase readable, and it does so by bringing the two amplitudes into the same outcome so they can add or cancel.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figRamsey(),
      caption:'The output of the three-gate circuit against the phase written in the middle of it. This is the fringe of chapter 0, produced by a circuit rather than by an interferometer.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\varphi = 90^{\\circ}$, and $4000$ shots.'],
        ['Work', '$p(0)=\\cos^{2}45^{\\circ}=0.5$, so the circuit is a fair coin at this setting.'],
        ['Answer', 'About $2000$ zeros, with a standard error of $\\sqrt{0.25/4000}=0.0079$ on the estimated probability.'],
        ['Check', 'At $\\varphi=180^{\\circ}$ the same circuit gives $p(0)=0$ exactly. A reading of $0.5$ and a reading of $0$ come from the same three gates with one dial moved, which is what "the phase is the whole content" means.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why this circuit measures $T_{2}$', html:'Replace $P(\\varphi)$ by a wait of duration $t$ and the phase becomes $\\varphi=\\Delta\\omega\\, t$, so the counts oscillate as the wait grows. Chapter 3 said the coherence decays as $e^{-t/T_{2}}$; here that decay is the shrinking amplitude of the oscillation. The most common measurement made on a real qubit is this circuit with a dial on the middle gate.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.1 -- */
{ id:'m5-nocopy', module:'M5', nav:'Why not just copy it', title:'No circuit copies an unknown state, and the obvious one entangles instead',
  objective:'Show that a universal copier is impossible and say what the CNOT copier actually does.',
  keywords:'no cloning theorem copy unknown state inner product proof cnot copier entangles instead orthogonal states classical bit',
  src:'L9 · the no-cloning theorem', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'No circuit copies an unknown state, and the obvious one entangles instead'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Before asking how to move a quantum state from one place to another, it is worth knowing why the classical answer — copy it and send the copy — is unavailable.</p>'},
    {t:'body', html:'<p>Suppose a unitary $U$ copied every state: $U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle$ for all $|\\psi\\rangle$. Apply it to two states and take the inner product of the two results. A unitary preserves inner products, so</p>'},
    {t:'eq', key:true, tex:'\\langle\\phi|\\psi\\rangle = \\left(\\langle\\phi|\\psi\\rangle\\right)^{2} \\qquad\\Longrightarrow\\qquad \\langle\\phi|\\psi\\rangle \\in \\{0,\\,1\\}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>So a copier can exist only for a set of states that are all either identical or orthogonal — which is exactly a set of classical alternatives. A machine that copies an <b>unknown</b> qubit does not exist.</p>'},
      {t:'small', html:'Note what is not forbidden. A known state can be prepared again as often as wanted, and orthogonal states can be copied, which is why classical bits can be copied at all. What cannot be done is copying a state nobody has been told.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figClone(),
      caption:'The circuit everybody tries first. It copies the two states it was tested on and entangles every other one, which is the failure the theorem predicts rather than a defect of this particular circuit.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The CNOT copier applied to $|{+}\\rangle|0\\rangle$.'],
        ['Work', 'Expand: $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)|0\\rangle \\mapsto \\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)$.'],
        ['Answer', 'That is the Bell state $|\\Phi^{+}\\rangle$, not $|{+}\\rangle|{+}\\rangle = \\tfrac12(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle)$.'],
        ['Check', 'The overlap is $\\left|\\langle{+}{+}|\\Phi^{+}\\rangle\\right|^{2} = 0.5$, so the "copy" agrees with a real copy only half the time. And the reduced state of each qubit is $I/2$: each half alone is now maximally mixed, having started pure.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'No-cloning is not "measurement disturbs the state"', html:'The two are related and they are not the same statement. No-cloning is a consequence of linearity alone, and it holds for a perfectly gentle unitary that never measures anything. Quoting the uncertainty principle here is the wrong argument for a true conclusion, and it fails in the very next scene, where teleportation moves an unknown state without violating either.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.2 -- */
{ id:'m5-tele', module:'M5', nav:'The teleportation circuit', title:'Teleportation, as a circuit with three qubits and two classical wires',
  objective:'Read the teleportation circuit stage by stage and name what each stage does.',
  keywords:'teleportation circuit bell pair bell measurement basis rotation classical wires correction three qubits protocol stages',
  src:'L9 · the three-qubit teleportation circuit', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Teleportation, as a circuit with three qubits and two classical wires'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Three qubits, and each belongs to somebody. Qubit $q_{0}$ carries the unknown state $|\\psi\\rangle$ and belongs to Alice. Qubits $q_{1}$ and $q_{2}$ are an entangled pair: Alice keeps $q_{1}$ and Bob has taken $q_{2}$ away with him.</p>'},
    {t:'body', html:'<p>The circuit has four stages, and the last one is not a quantum gate at all.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p><b>One.</b> A Hadamard and a CNOT make the shared pair $|\\Phi^{+}\\rangle$ on $q_{1}$ and $q_{2}$. In a real network this happens long before anything else and has to be verified.</p>'},
      {t:'body', html:'<p><b>Two.</b> A CNOT from $q_{0}$ to $q_{1}$ and a Hadamard on $q_{0}$. These two gates rotate the Bell basis of Alice\u2019s pair onto the computational basis, so that the next step is an ordinary measurement.</p>'},
      {t:'body', html:'<p><b>Three.</b> Alice measures $q_{0}$ and $q_{1}$, obtaining two bits $m_{0}$ and $m_{1}$.</p>'},
      {t:'body', html:'<p><b>Four.</b> The two bits travel to Bob by any ordinary classical channel, and Bob applies the correction they name.</p>'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figTele(),
      caption:'The whole protocol. The double lines are classical bits, and everything to the right of them waits for those bits to arrive. That wait is not a detail of the drawing; it is the reason nothing travels faster than light here.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What "Bell measurement" means here', html:'A measurement in the Bell basis is not a special piece of hardware. It is a change of basis followed by an ordinary computational-basis measurement, exactly as chapter 2 said every non-standard measurement is. The CNOT and the Hadamard are that change of basis, and they are the only clever step in the protocol.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The input is destroyed, and that is required', html:'After the measurement, $q_{0}$ holds a classical bit and nothing else: the state $|\\psi\\rangle$ is gone from Alice\u2019s side. If it were not, the protocol would have produced two copies of an unknown state, and the previous scene showed that no circuit can. Teleportation moves a state; it never copies one.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.3 -- */
{ id:'m5-teleid', module:'M5', nav:'The identity, derived', title:'The teleportation identity, one step at a time',
  objective:'Derive the four-branch teleportation identity from the initial product state.',
  keywords:'teleportation identity derivation four branches expansion cnot hadamard algebra three qubit state pauli frame',
  src:'L9 · teleportation identity, resources and no signaling', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'The teleportation identity, one step at a time'},
  {t:'body', html:'<p>The protocol is one algebraic identity. It is worth doing in full once, because every claim about teleportation — the correction table, the resource count, the no-signalling argument — is read straight off the last line. Write $|\\psi\\rangle = \\alpha|0\\rangle+\\beta|1\\rangle$ on $q_{0}$, and the shared pair on $q_{1}$ and $q_{2}$. Kets are written $|q_{2}q_{1}q_{0}\\rangle$ throughout.</p>'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'small', html:'<b>Step 1 — write the starting state.</b> The input and the pair are independent, so the state is a product, and multiplying it out gives four terms.'},
    {t:'eq', tex:'|\\Psi_{0}\\rangle = \\left(\\alpha|0\\rangle+\\beta|1\\rangle\\right)_{0} \\otimes \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)_{21}'},
    {t:'eq', tex:'= \\tfrac{1}{\\sqrt2}\\Big[\\alpha\\left(|000\\rangle+|110\\rangle\\right) + \\beta\\left(|001\\rangle+|111\\rangle\\right)\\Big]'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'<b>Step 2 — apply the CNOT from $q_{0}$ to $q_{1}$.</b> It flips $q_{1}$ exactly on the terms where $q_{0}=1$, so the last two terms move and the first two do not.'},
      {t:'eq', tex:'|\\Psi_{1}\\rangle = \\tfrac{1}{\\sqrt2}\\Big[\\alpha\\left(|000\\rangle+|110\\rangle\\right) + \\beta\\left(|011\\rangle+|101\\rangle\\right)\\Big]'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'small', html:'<b>Step 3 — apply the Hadamard to $q_{0}$.</b> Replace $|0\\rangle_{0}$ by $(|0\\rangle+|1\\rangle)/\\sqrt2$ and $|1\\rangle_{0}$ by $(|0\\rangle-|1\\rangle)/\\sqrt2$. Eight terms, all with coefficient one half.'},
      {t:'eq', tex:'\\begin{aligned}|\\Psi_{2}\\rangle = \\tfrac12\\Big[&\\;\\alpha|000\\rangle+\\alpha|001\\rangle+\\alpha|110\\rangle+\\alpha|111\\rangle \\\\ &+ \\beta|010\\rangle-\\beta|011\\rangle+\\beta|100\\rangle-\\beta|101\\rangle\\Big]\\end{aligned}'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'small', html:'<b>Step 4 — collect the terms by what Alice will read.</b> Group the eight terms by the pair $(q_{1},q_{0}) = (m_{1},m_{0})$, and what is left on $q_{2}$ in each group is the input state with a Pauli operator in front of it.'},
      {t:'eq', key:true, tex:'|\\Psi_{2}\\rangle = \\tfrac12 \\sum_{m_{1},m_{0}\\in\\{0,1\\}} |m_{1}m_{0}\\rangle_{10} \\otimes X^{m_{1}}Z^{m_{0}}|\\psi\\rangle_{2}'},
      {t:'small', html:'That is the identity. It is exact, it holds for every $\\alpha$ and $\\beta$, and nothing in it depends on knowing what they are — which is the point, because Alice does not.'}
    ]}
  ]},
  {t:'reveal', at:3, items:[
    {t:'note', kind:'err', head:'The sum is not a probabilistic mixture yet', html:'Before Alice measures, the four terms are a superposition, not four alternatives that have already happened. Reading the identity as "the state is one of these four with probability a quarter each" gives the right numbers for every subsequent question in this course, and it is the wrong description of the state, in exactly the way chapter 3 separated a superposition from a mixture.'}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.4 -- */
{ id:'m5-telecorr', module:'M5', nav:'The correction table', title:'Two measured bits choose one of four corrections, and nothing else does',
  objective:'Read the correction out of the two measured bits and verify one branch by hand.',
  keywords:'correction table pauli frame measured bits branches x z gates classical feedforward teleportation recovery four cases',
  src:'L9 · teleportation identity, resources and no signaling', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Two measured bits choose one of four corrections, and nothing else does'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The identity of the last scene says that after Alice measures, Bob holds $X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$. Since $X$ and $Z$ are their own inverses, undoing that is immediate: apply $X^{m_{1}}$, then $Z^{m_{0}}$.</p>'},
    {t:'eq', key:true, tex:'Z^{m_{0}}X^{m_{1}}\\;\\left(X^{m_{1}}Z^{m_{0}}|\\psi\\rangle\\right) = |\\psi\\rangle'},
    {t:'body', html:'<p>Four bit patterns, four corrections, and the choice is made by the bits and by nothing else. Bob has no way to guess which one he needs and no way to check afterwards.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The two bits are individually fair coins, and they carry no information at all about $\\alpha$ or $\\beta$. What they carry is which of four known operations was applied. That is why two classical bits are enough to move a state described by two continuous parameters: the bits do not describe the state, they select a correction.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figBranch(),
      caption:'The four branches. Every one has probability exactly one quarter, whatever $|\\psi\\rangle$ was, and that fact on its own is the whole of the no-signalling argument in the next scene.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Alice reads $m_{1}=1$, $m_{0}=1$, and the input was $|\\psi\\rangle = \\alpha|0\\rangle+\\beta|1\\rangle$.'],
        ['Work', 'Bob holds $XZ|\\psi\\rangle$. Now $Z|\\psi\\rangle = \\alpha|0\\rangle-\\beta|1\\rangle$, and applying $X$ to that gives $-\\beta|0\\rangle+\\alpha|1\\rangle$.'],
        ['Answer', 'Bob applies $X$ first and then $Z$. The $X$ gives $\\alpha|0\\rangle-\\beta|1\\rangle$ and the $Z$ gives $\\alpha|0\\rangle+\\beta|1\\rangle = |\\psi\\rangle$.'],
        ['Check', 'Try the order the other way: $Z$ then $X$ on $-\\beta|0\\rangle+\\alpha|1\\rangle$ gives $-\\alpha|0\\rangle-\\beta|1\\rangle$, which is $-|\\psi\\rangle$. Here that is a global phase and harmless, but the habit of checking the order is what saves the same calculation inside a larger circuit, where it would not be.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Skipping the correction does not give a slightly worse state', html:'It gives the maximally mixed state. Averaging the four branches with weight one quarter each is exactly the depolarising channel of chapter 3 at full strength, and it destroys the state completely rather than degrading it. There is no partially successful teleportation without the bits.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.5 -- */
{ id:'m5-nosig', module:'M5', nav:'Nothing is sent', title:'Before the two bits arrive, Bob holds the same thing whatever was sent',
  objective:'Show that Bob\u2019s reduced state is independent of the input and say what that rules out.',
  keywords:'no signaling reduced state maximally mixed independent of input classical channel light speed entanglement alone sends nothing',
  src:'L9 · teleportation identity, resources and no signaling', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Before the two bits arrive, Bob holds the same thing whatever was sent'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 3 proved that no local operation on one half of an entangled pair changes the other half\u2019s reduced state. Here that theorem becomes a circuit, and the circuit is the one everybody first suspects of sending something instantly.</p>'},
    {t:'body', html:'<p>Bob\u2019s state, before he learns the bits, is the average over the four equally likely branches:</p>'},
    {t:'eq', key:true, tex:'\\rho_{B} = \\tfrac14\\sum_{m_{1},m_{0}} X^{m_{1}}Z^{m_{0}}\\,\\rho\\,Z^{m_{0}}X^{m_{1}} = \\frac{I}{2}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The right-hand side has no $\\rho$ in it. Whatever Alice was sending, whatever she did, and whether or not she ran the protocol at all, Bob\u2019s qubit is the maximally mixed state until two classical bits reach him.</p>'},
      {t:'small', html:'The sum is worth checking once by hand. Written in the Bloch picture it is easy: $X$ flips the signs of $r_{y}$ and $r_{z}$, $Z$ flips $r_{x}$ and $r_{y}$, and $XZ$ flips $r_{x}$ and $r_{z}$. Adding the four vectors gives zero componentwise, and a Bloch vector of zero is $I/2$.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figNosig(),
      caption:'Bob\u2019s qubit, drawn twice. On the left, before the bits arrive: at the centre of the ball, carrying nothing. On the right, after the correction: the state that was sent. The qubit did not move between the two pictures; the description did.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The classical channel is the whole protocol', html:'Two bits at the speed of light are what turns the left picture into the right one. Teleportation is therefore not faster than a telephone call, and it is not a way of sending information without one. What it does is move a <b>quantum</b> state down a channel that can only carry classical bits, by spending entanglement that was distributed in advance.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'"Bob\u2019s qubit changed the moment Alice measured" is a statement about a description', html:'Alice\u2019s measurement changes what <b>she</b> can say about Bob\u2019s qubit, because she now knows which branch happened. It changes nothing that Bob can observe: every measurement he can make on his qubit gives the same statistics as before. That is the content of the equation above, and it is the reason the theory and relativity do not collide.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.6 -- */
{ id:'m5-teleres', module:'M5', nav:'What it costs, and what counts as working', title:'One entangled pair and two bits for one qubit, and two thirds to beat',
  objective:'Account for the resources one teleportation consumes and state the fidelity benchmark it must exceed.',
  keywords:'resources ebit classical bits fidelity benchmark two thirds measure and prepare singlet fraction average fidelity claim',
  src:'L9 · teleportation fidelity and experimental claims', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'One entangled pair and two bits for one qubit, and two thirds to beat'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The account is exact and short. Moving one unknown qubit consumes one shared entangled pair and two classical bits, and destroys the original. Nothing here is reusable: the pair is used up, and a second qubit needs a second pair.</p>'},
    {t:'body', html:'<p>Saying that a laboratory has <b>done</b> this needs a number, because a noisy apparatus produces something that resembles the input. The number is the fidelity, and for a pure target it is the overlap of chapter 2:</p>'},
    {t:'eq', key:true, tex:'F(\\psi) = \\langle\\psi|\\rho_{\\text{out}}|\\psi\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'One fidelity on one input proves nothing, because a machine that always outputs $|0\\rangle$ scores $F=1$ whenever the input happened to be $|0\\rangle$. The claim has to be an <b>average</b> over a set of inputs that covers the sphere, and it has to be compared against what is achievable without any entanglement at all.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figAccount(),
      caption:'The account, and the line a claim has to cross. Two thirds is what measuring the qubit and preparing a new one achieves on average over the sphere; anything at or below it needed no entanglement.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A run reporting an average fidelity of $0.81$ over inputs spread across the sphere.'],
        ['Work', 'The classical benchmark for uniformly spread pure inputs is $2/3 = 0.667$. The relation $F_{\\text{avg}}=(2f+1)/3$ inverts to $f = (3F_{\\text{avg}}-1)/2$.'],
        ['Answer', '$0.81$ is above the benchmark, and it implies a pair quality of $f = (2.43-1)/2 = 0.715$.'],
        ['Check', 'Put $f=0.5$ in, which is the best a separable pair reaches: $F_{\\text{avg}}=2/3$ exactly, the benchmark. Put $f=1$ in, a perfect pair: $F_{\\text{avg}}=1$. The formula meets both ends correctly, which is the cheapest test of it.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A best-case fidelity is not a result', html:'A claim has to state the unconditional success rate, what was discarded and by what rule, the quality of the entangled pairs, whether readout errors were corrected out, and a confidence interval. A single number for a single favourable input, with the failures removed afterwards, can be made arbitrarily high by a machine that does nothing at all.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.L1 --- */
{ id:'m5-lab-i', module:'M5', nav:'Laboratory I', title:'Laboratory I · Teleportation, stepped, with the correction the bits choose',
  objective:'Let the reader step the teleportation circuit and see the correction selected by the measured bits.',
  keywords:'laboratory teleportation stepped branches correction measured bits reduced state bloch no signaling classical channel',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Laboratory I · Teleportation, stepped, with the correction the bits choose'},
  {t:'small', html:'Choose the state to send with the two angles, then walk the circuit one stage at a time. The left panel is the Bloch vector of Bob\u2019s qubit at the chosen stage; the right panel is the fidelity against the tilt of the input. Three things to find: the four branches all have probability one quarter whatever the input is, Bob\u2019s vector sits exactly at the centre until the correction is applied, and applying the wrong correction is not a small error but a completely different state.'},
  {t:'lab', id:'I'}
]},

/* ---------------------------------------------------------------- 5.6.1 -- */
{ id:'m5-search', module:'M5', nav:'The search problem', title:'An unstructured search, and what a query is allowed to be',
  objective:'State the search problem in the query model and say what the oracle is and is not.',
  keywords:'unstructured search oracle query model black box marked items reversible embedding classical baseline n over two',
  src:'L9 · Grover search and the oracle', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'An unstructured search, and what a query is allowed to be'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The problem is stated carefully because the statement is what the result is about. There are $N=2^{n}$ candidates. A function $f$ answers one question about each: $f(x)=1$ if $x$ is a solution and $0$ otherwise. Exactly $M$ candidates are solutions. Nothing else is known — the candidates have no order and no structure to exploit.</p>'},
    {t:'body', html:'<p>The function is available only as a <b>black box</b>, built as chapter 4 built every reversible embedding:</p>'},
    {t:'eq', key:true, tex:'U_{f}\\,|x\\rangle|y\\rangle = |x\\rangle\\,|y \\oplus f(x)\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'One use of that box is one <b>query</b>. The classical cost of the problem in the same model is easy: check candidates one at a time, and with $M=1$ expect about $N/2$ queries before finding the solution. That is the number Grover is compared against, and it is a count of queries and not of seconds.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOracle(),
      caption:'The box, and the only thing that may be done with it. Counting how often it is opened is a well-defined question with a clean answer; what it cost to build is a separate question with a much messier one.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why the box is written as an addition', html:'Overwriting the second register with $f(x)$ would throw away whatever was there, and chapter 4 showed that a unitary cannot throw anything away. Writing the answer with an exclusive OR keeps the map reversible: apply it twice and the second register is back where it started, because $f(x)\\oplus f(x)=0$.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'"Unstructured" is a strong assumption and it is usually false', html:'Real search problems have structure, and classical algorithms exploit it: a sorted list is searched in $\\log_{2}N$ steps, and a hash table in one. The quadratic saving below applies only where no structure exists at all, and comparing it against a linear scan of a problem that a classical method would not scan linearly is the most common way this result is misused.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.2 -- */
{ id:'m5-kick', module:'M5', nav:'Phase kickback', title:'The oracle writes a phase instead of a bit, and that is the only trick',
  objective:'Derive phase kickback and use it to turn the standard oracle into a phase oracle.',
  keywords:'phase kickback minus state eigenstate oracle sign marked items reflection relative phase mechanism interference algorithms',
  src:'L9 · oracles and hidden implementation cost', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The oracle writes a phase instead of a bit, and that is the only trick'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The oracle flips a target bit. Interference needs a phase. One line of preparation converts one into the other, and it is the mechanism every algorithm in this chapter and the next runs on.</p>'},
    {t:'body', html:'<p>Prepare the target in $|{-}\\rangle$, which is the eigenstate of the flip with eigenvalue $-1$:</p>'},
    {t:'eq', tex:'X|{-}\\rangle = -|{-}\\rangle'},
    {t:'eq', key:true, tex:'U_{f}\\,|x\\rangle|{-}\\rangle = (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Read the second line carefully. The target register comes out exactly as it went in, so it is not entangled with anything and can be ignored from here on. The answer has landed on the <b>first</b> register, as a sign.</p>'},
      {t:'small', html:'Applied to a superposition, one query signs every marked term at once: $\\sum_{x}c_{x}|x\\rangle \\mapsto \\sum_{x}(-1)^{f(x)}c_{x}|x\\rangle$. That is not "trying every answer at once" — no probability has changed and a measurement here still returns one string. What has changed is a set of relative phases, and relative phases are the only thing an algorithm can work with.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figKick(),
      caption:'Kickback in two lines. The gate was written to change the target; because the target was prepared in an eigenstate of that change, the effect appears on the control register instead.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Two qubits, $f(0)=0$ and $f(1)=1$, and the input $|{+}\\rangle|{-}\\rangle$.'],
        ['Work', 'Expand the first register: $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)|{-}\\rangle$. The oracle signs the $|1\\rangle$ term and leaves the $|0\\rangle$ term.'],
        ['Answer', '$\\tfrac{1}{\\sqrt2}(|0\\rangle-|1\\rangle)|{-}\\rangle = |{-}\\rangle|{-}\\rangle$: the first register has moved from $|{+}\\rangle$ to $|{-}\\rangle$.'],
        ['Check', 'Measure the first register in the $X$ basis and the answer is certain, from one query. Measure it in the $Z$ basis and it is a fair coin, exactly as it was before the query — so the query is invisible in the wrong basis and decisive in the right one.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The kickback is a relative phase, and it dies if the target is left dirty', html:'The argument needs the target to come out unchanged. If the oracle leaves anything behind — an ancilla holding an intermediate result, a target in some other state — the first register is entangled with it, the phases become unavailable, and the interference at the end of the algorithm simply does not happen. This is why chapter 4 spent a scene on uncomputing.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.3 -- */
{ id:'m5-geom', module:'M5', nav:'The plane it happens in', title:'The whole algorithm lives in a plane spanned by two states',
  objective:'Write the uniform superposition in the marked and unmarked basis and give the angle it makes.',
  keywords:'grover geometry two dimensional subspace good bad states uniform superposition angle theta arcsin marked fraction plane',
  src:'L9 · geometry of amplitude amplification', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The whole algorithm lives in a plane spanned by two states'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>An $n$-qubit state lives in $2^{n}$ dimensions, and following it there would be hopeless. It is not necessary. Define two states — the even mixture of the marked candidates and the even mixture of the rest:</p>'},
    {t:'eq', tex:'|G\\rangle = \\frac{1}{\\sqrt{M}}\\sum_{f(x)=1}|x\\rangle, \\qquad |B\\rangle = \\frac{1}{\\sqrt{N-M}}\\sum_{f(x)=0}|x\\rangle'},
    {t:'body', html:'<p>They are orthonormal. The starting state — Hadamards on every qubit, giving the uniform superposition — lies in the plane they span:</p>'},
    {t:'eq', key:true, tex:'|s\\rangle = \\sin\\theta\\,|G\\rangle + \\cos\\theta\\,|B\\rangle, \\qquad \\sin\\theta = \\sqrt{\\frac{M}{N}}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Both operations the algorithm uses keep the state inside that plane, so a problem in $2^{n}$ dimensions has become a problem in two, and the two dimensions can be drawn on paper. The whole of Grover\u2019s algorithm is a picture of a vector turning in a plane.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figGeom(),
      caption:'The plane, drawn isotropically so the angles are the real ones. The starting vector is close to the horizontal because $\\sin\\theta=\\sqrt{M/N}$ is small, which is exactly the statement that a random guess almost never works.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$n=10$ qubits, so $N=1024$, with one marked candidate.'],
        ['Work', '$\\sin\\theta = \\sqrt{1/1024} = 1/32 = 0.03125$, so $\\theta = 1.7908^{\\circ}$.'],
        ['Answer', 'The starting state makes an angle of under two degrees with $|B\\rangle$.'],
        ['Check', 'The probability of measuring a marked item straight away is $\\sin^{2}\\theta = 1/1024 = 0.000977$ — one in $N$, which is what a uniform superposition should give and is the sanity test for the whole construction.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'$\\theta$ is an angle in this plane and not on a Bloch sphere', html:'The picture is a two-dimensional real plane inside a $2^{n}$-dimensional complex space. It is not a Bloch sphere, the vectors are not Bloch vectors, and the half-angle rules of chapter 4 do not apply here. Two different pictures, both two-dimensional, and mixing their rules produces answers that are wrong by a factor of two.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.4 -- */
{ id:'m5-rotate', module:'M5', nav:'Two reflections make a turn', title:'One iteration is two reflections, and two reflections are a rotation',
  objective:'Show that the Grover iteration rotates the state by twice the angle theta.',
  keywords:'grover iteration oracle reflection diffusion operator inversion about the mean rotation two theta amplitude amplification',
  src:'L9 · geometry of amplitude amplification', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'One iteration is two reflections, and two reflections are a rotation'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>One iteration is two operations, and each of them is a reflection of the plane.</p>'},
    {t:'body', html:'<p>The <b>phase oracle</b> of the last scene puts a minus sign on the marked terms, which is exactly a reflection of the plane in the $|B\\rangle$ axis. The <b>diffusion operator</b> reflects in the starting vector:</p>'},
    {t:'eq', tex:'O_{f} = I - 2\\,|G\\rangle\\langle G|, \\qquad D = 2\\,|s\\rangle\\langle s| - I'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Two reflections of a plane, in lines separated by an angle, compose to a rotation by twice that angle. The two lines here are $|B\\rangle$ and $|s\\rangle$, separated by $\\theta$, so:</p>'},
      {t:'eq', key:true, tex:'D\\,O_{f}\\;:\\; \\text{a rotation of the plane by } 2\\theta \\text{ towards } |G\\rangle'},
      {t:'small', html:'So after $r$ iterations the state has turned to $(2r+1)\\theta$ from the $|B\\rangle$ axis, and the marked component has grown from $\\sin\\theta$ to $\\sin\\!\\left((2r+1)\\theta\\right)$. Every step adds the same angle, not the same probability, and that difference is what the next scene is about.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figGeom(),
      caption:'One iteration, drawn. The oracle takes the vector below the horizontal; the diffusion takes it back above, but past where it started. The two reflections are separated by $\\theta$, so the net turn is $2\\theta$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Where "inversion about the mean" comes from', html:'Write $D$ out in the computational basis and it says: replace each amplitude $c_{x}$ by $2\\bar{c}-c_{x}$, where $\\bar{c}$ is the mean of all the amplitudes. That is the same operator seen in a different basis. The reflection picture is the one to reason with; the mean picture is the one to program.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The diffusion operator is not an oracle and it is not free', html:'It contains no information about $f$ — it is the same circuit whatever the problem is — so it is not counted as a query. It is still a circuit: $H^{\\otimes n}$, a multiply-controlled phase on $|0\\rangle^{\\otimes n}$, and $H^{\\otimes n}$ again, and the middle gate needs a chain of Toffolis and their ancillas. Query counting ignores this on purpose, and a resource estimate may not.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.5 -- */
{ id:'m5-iter', module:'M5', nav:'How many iterations', title:'There is a best number of iterations, and going past it makes things worse',
  objective:'Compute the optimal iteration count and the success probability, and describe the overshoot.',
  keywords:'optimal iterations grover success probability sine squared overshoot rotate past unknown m quantum counting stopping',
  src:'L9 · geometry of amplitude amplification', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'There is a best number of iterations, and going past it makes things worse'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The angle after $r$ iterations is $(2r+1)\\theta$, so the probability of measuring a marked candidate is a sine squared and nothing else:</p>'},
    {t:'eq', key:true, tex:'P_{\\text{good}}(r) = \\sin^{2}\\!\\big((2r+1)\\theta\\big)'},
    {t:'body', html:'<p>That is maximised when the angle reaches a right angle, so the best real number of iterations, and then the nearest whole number to it, are</p>'},
    {t:'eq', key:true, tex:'r_{*} = \\frac{\\pi}{4\\theta} - \\frac12, \\qquad r_{*} \\approx \\frac{\\pi}{4}\\sqrt{\\frac{N}{M}} \\ \\text{ when } M \\ll N'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The square root is right here, at the end, and it comes from the size of one step. Each iteration adds a fixed angle $2\\theta \\approx 2\\sqrt{M/N}$, and a right angle has to be reached, so the number of steps goes as $\\sqrt{N/M}$. Nothing exponential ever happened; a small angle was added many times.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figIter(),
      caption:'The success probability against the iteration count, for a thousand candidates with one marked. It rises to almost one at twenty-five iterations and falls back to almost nothing at fifty. The curve is a sine squared and it keeps going.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Three qubits, $N=8$, with two marked candidates.'],
        ['Work', '$\\sin\\theta=\\sqrt{2/8}=0.5$, so $\\theta=30^{\\circ}$ and $r_{*} = \\tfrac{90}{60}-\\tfrac12 = 1$ exactly.'],
        ['Answer', 'One iteration, and $P = \\sin^{2}(3\\times30^{\\circ}) = \\sin^{2}90^{\\circ} = 1$. The answer is certain.'],
        ['Check', 'Run a second iteration: $P=\\sin^{2}150^{\\circ}=0.25$, which is exactly $P(0)$, the probability before any iteration at all. Two iterations have undone the work of one.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'More iterations are not better, and this is the error that costs a whole question', html:'Past $r_{*}$ the rotation carries the vector beyond $|G\\rangle$ and the success probability falls. At about $2r_{*}$ it is back to where it started. Running "as many as the time allows" is therefore worse than running the right number, and it is worse in a way that looks like a broken machine rather than a broken plan. When $M$ is not known the fix is not more iterations: it is a randomised schedule of iteration counts, or estimating $M$ first.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.6 -- */
{ id:'m5-claim', module:'M5', nav:'What the square root claims', title:'The square root is a count of queries, and a query is not a runtime',
  objective:'Write Grover\u2019s claim against the five components and say precisely what it does and does not assert.',
  keywords:'grover claim query complexity optimality lower bound end to end cost data loading error correction baseline speedup honest',
  src:'L9 · oracles and hidden implementation cost', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The square root is a count of queries, and a query is not a runtime'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The result is real and it is provable. About $\\tfrac{\\pi}{4}\\sqrt{N}$ queries find a marked candidate among $N$, where a classical search needs about $N/2$. It is also optimal: no quantum algorithm in this model does better than order $\\sqrt{N}$, so the quadratic saving is the end of the story rather than the beginning of it.</p>'},
    {t:'body', html:'<p>Now write the claim out against the five components, and three of them turn out to be doing heavy work.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The <b>input model</b> assumes query access to a reversible circuit for $f$. If instead the candidates are records in a database, they have to be loaded into a quantum memory first, and loading $N$ records takes at least $N$ operations — which destroys the saving before the algorithm starts. The <b>hardware model</b> assumes ideal qubits: a circuit of $\\sqrt{N}$ oracle calls, each with its Toffolis and ancillas, needs error correction, and error correction multiplies both the qubit count and the depth by a large factor. And the <b>baseline</b> assumes the classical method must scan; almost no real problem is unstructured enough for that to be true.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figGroverClaim(),
      caption:'Grover\u2019s claim, laid against the five. The two in the error tone are the ones that are usually left unstated, and they are the ones that decide whether the saving survives on a real machine.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$N=1024$, $M=1$, and a machine whose oracle circuit takes $10\\,\\mu\\text{s}$ per call.'],
        ['Work', 'Queries: $25$ against a classical $512$, a saving of about twenty times. Time: $25 \\times 10\\,\\mu\\text{s} = 250\\,\\mu\\text{s}$.'],
        ['Answer', 'A classical computer evaluating the same $f$ in $10\\,\\text{ns}$ per call finishes $512$ of them in $5.1\\,\\mu\\text{s}$ — about fifty times faster than the quantum run.'],
        ['Check', 'The query ratio and the time ratio point in opposite directions, and both are correct. The crossing point is where $N$ is large enough that $\\sqrt{N}$ times the slow query beats $N$ times the fast one, and finding that $N$ is the honest form of the question.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What the result does say, stated fairly', html:'For a problem with genuinely no structure, where the predicate is cheap to build as a reversible circuit and the data never has to be loaded, a quantum computer needs quadratically fewer evaluations of that predicate, and this is optimal. That is a strong theorem. It is a theorem about a count, and turning it into a statement about a wall clock needs every one of the other four components filled in.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 5.L2 --- */
{ id:'m5-lab-j', module:'M5', nav:'Laboratory J', title:'Laboratory J · Grover iterations, the angle, and the overshoot',
  objective:'Let the reader turn the problem size and the iteration count and watch the success probability rise and fall.',
  keywords:'laboratory grover amplitude amplification iterations angle success probability overshoot optimum marked items amplitudes',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'Laboratory J · Grover iterations, the angle, and the overshoot'},
  {t:'small', html:'Choose the number of qubits and how many candidates are marked, then step the iterations. The left panel is the plane of the last two scenes with the state drawn where it actually is; the right panel is the success probability against the iteration count, with every integer marked. Three things to find: the optimum is near $\\tfrac{\\pi}{4}\\sqrt{N/M}$ and is only occasionally exact, running twice the optimum returns almost exactly the probability you started with, and marking a quarter of the candidates makes the algorithm useless because the first step already overshoots.'},
  {t:'lab', id:'J'}
]},

/* ---------------------------------------------------------------- 5.7.1 -- */
{ id:'m5-synth', module:'M5', nav:'Summary', title:'What this chapter leaves you with',
  objective:'Collect what this chapter added and the errors it exists to prevent.',
  keywords:'summary module 5 review circuit depth shots transpilation teleportation grover resource claim query runtime overshoot',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Summary'},
  {t:'title', text:'What this chapter leaves you with'},
  {t:'fig', frame:true, svg:()=>figLadder(),
    caption:'The chapter as one ladder. A protocol is worth nothing until its cost has been stated in a form somebody else can check.'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'The machine', items:[
      {t:'small', html:'Prepare $|0\\rangle^{\\otimes n}$, apply gates from a fixed set, measure, repeat. Depth is layers and is what a coherence time is spent against; the gate count is not. $q_{0}$ is the top wire and the last digit of the ket.'}]}],
    [{t:'card', head:'Running it', items:[
      {t:'small', html:'An exact state vector costs $16\\cdot2^{n}$ bytes and stops near thirty qubits. A probability from $N$ shots carries $\\sqrt{p(1-p)/N}$, which shrinks; device error does not. A SWAP costs three CNOTs.'}]}],
    [{t:'card', head:'Teleportation', items:[
      {t:'small', html:'$|\\Psi\\rangle = \\tfrac12\\sum_{m_{1}m_{0}}|m_{1}m_{0}\\rangle X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$. Four branches of probability $\\tfrac14$ for every input, so $\\rho_{B}=I/2$ until two classical bits arrive. One pair and two bits per qubit.'}]}],
    [{t:'card', head:'Grover', items:[
      {t:'small', html:'$\\sin\\theta=\\sqrt{M/N}$, one iteration is a rotation by $2\\theta$, and $P(r)=\\sin^{2}((2r+1)\\theta)$ with $r_{*}=\\tfrac{\\pi}{4\\theta}-\\tfrac12$. Past the optimum the probability falls. Quadratic in <b>queries</b>, and silent about time.'}]}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:2, gap:'24px', items:[
      [{t:'note', kind:'ok', head:'Five lines to be able to write without looking', html:'$\\mathrm{SE}=\\sqrt{p(1-p)/N}$ &nbsp;·&nbsp; $U_{f}|x\\rangle|{-}\\rangle=(-1)^{f(x)}|x\\rangle|{-}\\rangle$ &nbsp;·&nbsp; $|\\Psi\\rangle=\\tfrac12\\sum|m_{1}m_{0}\\rangle X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$ &nbsp;·&nbsp; $\\sin\\theta=\\sqrt{M/N}$ &nbsp;·&nbsp; $P(r)=\\sin^{2}((2r+1)\\theta)$.'}],
      [{t:'note', kind:'warn', head:'Four errors that cost a whole question', html:'Reporting a gate count where a depth was asked for. Reading a printed bit string backwards. Saying teleportation finished before the bits arrived. Running more Grover iterations than the optimum.'}]
    ]}
  ]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'def', head:'What comes next', html:'Chapter 6 keeps the oracle and the kickback and changes what is done between them: one mechanism, four algorithms, and the resource discipline of this chapter applied to every one of them.'}
  ]}
]},

/* ---------------------------------------------------------------- 5.7.2 -- */
{ id:'m5-shapes', module:'M5', nav:'The shapes of question', title:'The shapes of question this chapter sets',
  objective:'Name the recurring question types of chapter 5 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice circuit depth shots teleportation grover resource claim',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 5 · Summary and practice'},
  {t:'title', text:'The shapes of question this chapter sets'},
  {t:'small', html:'Six shapes keep coming back, and a seventh — a <b>full-length question</b> — puts three to five of them in one statement, usually as one protocol followed from its input to a reported number with an error bar on it. Name the shape before starting; the method for each is fixed.'},
  {t:'grid', cols:3, gap:'22px', items:[
    [{t:'drilltypes', module:'M5', from:0, to:2}],
    [{t:'drilltypes', module:'M5', from:2, to:4}],
    [{t:'drilltypes', module:'M5', from:4, to:6}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'The check that catches most of it', html:'Probabilities add to one, a depth is never larger than a gate count, an estimated probability is quoted with $\\sqrt{p(1-p)/N}$ beside it, a reduced state that should be $I/2$ has Bloch vector zero, and a Grover probability is $\\sin^{2}$ of something and therefore never above one. Five one-line tests, and between them they catch nearly every slip this chapter can produce.'}
  ]}
]}

];

window.SCENES_M5 = SC;
})();
