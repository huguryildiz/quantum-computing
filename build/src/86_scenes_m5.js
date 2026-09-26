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
/* A CNOT from wire yc to wire yt at x: the link, the control dot, the target. */
function cx(x,yc,yt,col){ const k=col||C.h;
  return [{t:'line',d:`M${x},${yc} V${yt}`,color:k}, ctrl(x,yc,k)].concat(targ(x,yt,k)); }
/* A meter is the box a measurement is drawn as. It carries a plain word, not
   mathematics, so it takes no TeX and no `\text{}` wrapper. */
function meter(x,y,col){ return {t:'box',x:x-24,y:y-17,w:48,h:34,label:'measure',fs:11,
  color:col||C.out}; }

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

/* ---------------------------------------------------------------- figures --
   Each is a function, so the palette is the one in force when it is drawn.
   The box and circuit diagrams of the slides are drawn 560 to 580 px wide,
   because a 760 px diagram prints its labels too small in the narrow column
   of a slide. Sentences live in the captions and the cards; a figure keeps
   names and short labels. */

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
   drawn so that depth and gate count can be counted apart. H, then CNOT 0->1,
   then CNOT 1->2, then T on q2: each gate needs a wire the one before it has
   just used, so there are four layers. */
function figCircuit(){
  const Y = [48,104,160];
  const items = [
    wire(Y[0],60,420), wire(Y[1],60,420), wire(Y[2],60,420),
    {t:'text',x:50,y:Y[0]+5,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:50,y:Y[1]+5,anchor:'end',label:'q_{1}',tex:true,fs:15},
    {t:'text',x:50,y:Y[2]+5,anchor:'end',label:'q_{2}',tex:true,fs:15},
    gate(100,Y[0],'H',true)
  ].concat(cx(180,Y[0],Y[1])).concat(cx(260,Y[1],Y[2])).concat([
    /* The last gate sits on q2 and not on q0. On q0 it would be free to run
       beside the second CNOT, which would make the depth three and the
       caption false. */
    gate(340,Y[2],'T',true),
    /* the three layer boundaries, drawn faint and named below the wires */
    {t:'line',d:'M140,24 V184',color:C.rule},
    {t:'line',d:'M220,24 V184',color:C.rule},
    {t:'line',d:'M300,24 V184',color:C.rule},
    {t:'text',x:100,y:206,label:'layer 1',fs:13},
    {t:'text',x:180,y:206,label:'layer 2',fs:13},
    {t:'text',x:260,y:206,label:'layer 3',fs:13},
    {t:'text',x:340,y:206,label:'layer 4',fs:13},
    {t:'text',x:490,y:92,anchor:'middle',label:'4 gates',fs:16,color:C.mid},
    {t:'text',x:490,y:126,anchor:'middle',label:'depth 4',fs:16,color:C.out}
  ]);
  return growBlocks({w:560,h:220,items});
}

/* The circuit model of computation, as the four things it licenses. */
function figModel(){
  return growBlocks({w:560,h:130,items:[
    {t:'box',x:12,y:30,w:112,h:54,label:'prepare',fs:14,color:C.in},
    {t:'arrow',x1:124,y1:57,x2:152,y2:57},
    {t:'box',x:152,y:30,w:112,h:54,label:'apply gates',fs:14,color:C.h},
    {t:'arrow',x1:264,y1:57,x2:292,y2:57},
    {t:'box',x:292,y:30,w:112,h:54,label:'measure',fs:14,color:C.out},
    {t:'arrow',x1:404,y1:57,x2:432,y2:57},
    {t:'box',x:432,y:30,w:112,h:54,label:'repeat',fs:14,color:C.mid},
    {t:'text',x:68,y:112,label:'|0\\rangle^{\\otimes n}',tex:true,fs:14},
    {t:'text',x:208,y:112,label:'a fixed set',fs:13},
    {t:'text',x:348,y:112,label:'one basis',fs:13},
    {t:'text',x:488,y:112,label:'N\\text{ times}',tex:true,fs:14}
  ]});
}

/* Bit order: the picture, the ket and the vector index, all naming one
   state. */
function figOrder(){
  const items = [
    wire(48,80,200), wire(100,80,200), wire(152,80,200),
    {t:'text',x:70,y:53,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:70,y:105,anchor:'end',label:'q_{1}',tex:true,fs:15},
    {t:'text',x:70,y:157,anchor:'end',label:'q_{2}',tex:true,fs:15},
    {t:'text',x:214,y:54,anchor:'start',label:'0',fs:16,color:C.mid},
    {t:'text',x:214,y:106,anchor:'start',label:'0',fs:16,color:C.mid},
    {t:'text',x:214,y:158,anchor:'start',label:'1',fs:16,color:C.mid},
    {t:'text',x:400,y:58,anchor:'middle',label:'|q_{2}q_{1}q_{0}\\rangle = |100\\rangle',tex:true,fs:17,color:C.out},
    {t:'text',x:400,y:106,anchor:'middle',label:'x = 4q_{2}+2q_{1}+q_{0} = 4',tex:true,fs:15},
    {t:'text',x:400,y:152,anchor:'middle',label:'entry 4, printed "100"',fs:13}
  ];
  return growBlocks({w:560,h:190,items});
}

/* The same state prepared two ways: a chain and a tree. Same gate count, and
   the depth is what differs. The tree starts from q1, so that its last two
   CNOTs join neighbouring wires, q1 to q0 and q2 to q3, and can be drawn at
   one horizontal position without either crossing the other. */
function figDepth(){
  const items = [];
  const Y = [40,78,116,154];
  const name = (x,i) => ({t:'text',x,y:Y[i]+5,anchor:'end',label:'q_{'+i+'}',tex:true,fs:14});
  /* left: the chain — every CNOT waits for the one before it */
  Y.forEach((y,i)=>{ items.push(wire(y,52,250)); items.push(name(44,i)); });
  items.push({t:'text',x:150,y:18,label:'the chain',fs:14,color:C.in});
  items.push(gate(80,Y[0],'H',true));
  cx(124,Y[0],Y[1]).forEach(o=>items.push(o));
  cx(166,Y[1],Y[2]).forEach(o=>items.push(o));
  cx(208,Y[2],Y[3]).forEach(o=>items.push(o));
  items.push({t:'text',x:150,y:206,label:'4 gates, depth 4',fs:14});
  /* right: the tree — the last two CNOTs touch four different qubits, so they
     run together, and the two faint rules are what say so. */
  Y.forEach((y,i)=>{ items.push(wire(y,332,530)); items.push(name(324,i)); });
  items.push({t:'text',x:430,y:18,label:'the tree',fs:14,color:C.out});
  items.push(gate(360,Y[1],'H',true));
  cx(408,Y[1],Y[2]).forEach(o=>items.push(o));
  items.push({t:'line',d:'M438,26 V168',color:C.rule});
  items.push({t:'line',d:'M494,26 V168',color:C.rule});
  cx(466,Y[1],Y[0]).forEach(o=>items.push(o));
  cx(466,Y[2],Y[3]).forEach(o=>items.push(o));
  items.push({t:'text',x:466,y:184,label:'one layer',fs:13,color:C.out});
  items.push({t:'text',x:430,y:206,label:'4 gates, depth 3',fs:14});
  return growBlocks({w:560,h:216,items});
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
  a.note(2,10.6,'16\\text{ GB}',{fs:13,color:C.muted,tex:true});
  /* Both names sit below and to the right of their markers, which is the one
     side of a rising curve that is empty. */
  a.point(30,Math.log10(16)+30*Math.log10(2),{color:C.h,r:6});
  a.note(33,8.2,'n=30',{fs:13,color:C.h,anchor:'start',tex:true});
  a.point(50,Math.log10(16)+50*Math.log10(2),{color:C.err,r:6});
  a.note(52,13.8,'n=50',{fs:13,color:C.err,anchor:'start',tex:true});
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
  a.note(3.1,-1.5,'1000\\text{ shots}: \\pm 0.016',{fs:13,color:C.h,tex:true});
  a.point(5,Math.log10(0.5)-2.5,{color:C.out,r:6});
  a.note(5.1,-2.6,'10^{5}: \\pm 0.0016',{fs:13,color:C.out,tex:true});
  return a.svg();
}

/* The principle of deferred measurement: the two circuits are the same. On
   the right, q0 stops being a qubit wire at the meter and carries a bit. */
function figMeasure(){
  const Y0 = 50, Y1 = 112;
  const items = [
    wire(Y0,60,250), wire(Y1,60,250),
    {t:'text',x:50,y:Y0+5,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:50,y:Y1+5,anchor:'end',label:'q_{1}',tex:true,fs:15}
  ].concat(cx(120,Y0,Y1)).concat([
    meter(200,Y0),
    {t:'text',x:155,y:162,label:'measure last',fs:14},
    /* the second circuit */
    wire(Y0,320,346), wire(Y1,320,530),
    {t:'text',x:310,y:Y0+5,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:310,y:Y1+5,anchor:'end',label:'q_{1}',tex:true,fs:15},
    meter(370,Y0)
  ]).concat(cwire(Y0,394,460)).concat([
    {t:'line',d:`M460,${Y0} V${Y1-17}`,color:C.out},
    gate(460,Y1,'X',true),
    {t:'text',x:425,y:162,label:'measure first',fs:14}
  ]);
  return growBlocks({w:560,h:176,items});
}

/* A dynamic circuit: measure, act on the bit, measure again. The qubit wire
   runs on after the first reading; the bit it produced goes down onto the
   classical wire and comes back up to switch the X. */
function figFeed(){
  const Q = 52, B = 128;
  const items = [
    wire(Q,60,500),
    {t:'text',x:50,y:Q+5,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:50,y:B+5,anchor:'end',label:'c',tex:true,fs:15},
    gate(100,Q,'H',true),
    meter(180,Q),
    {t:'line',d:`M180,${Q+17} V${B}`,color:C.out}
  ].concat(cwire(B,60,500)).concat([
    {t:'line',d:`M290,${B} V${Q+17}`,color:C.out},
    gate(290,Q,'X',true),
    {t:'text',x:300,y:100,anchor:'start',label:'if 1',fs:13,color:C.out},
    meter(390,Q),
    {t:'text',x:430,y:58,anchor:'start',label:'0',fs:16,color:C.out},
    {t:'text',x:390,y:108,label:'every time',fs:13,color:C.out}
  ]);
  return growBlocks({w:560,h:160,items});
}

/* One ideal gate, rewritten into a set a machine actually offers. */
function figIset(){
  return growBlocks({w:560,h:170,items:[
    {t:'text',x:60,y:18,label:'written',fs:13},
    {t:'text',x:338,y:18,label:'run',fs:13},
    {t:'box',x:12,y:32,w:96,h:54,label:'H',tex:true,fs:18,color:C.in},
    {t:'arrow',x1:108,y1:59,x2:148,y2:59},
    {t:'box',x:148,y:32,w:124,h:54,label:'R_{z}(\\pi/2)',tex:true,fs:15,color:C.h},
    {t:'box',x:276,y:32,w:124,h:54,label:'R_{x}(\\pi/2)',tex:true,fs:15,color:C.h},
    {t:'box',x:404,y:32,w:124,h:54,label:'R_{z}(\\pi/2)',tex:true,fs:15,color:C.h},
    {t:'box',x:12,y:106,w:96,h:54,label:'\\mathrm{CNOT}',tex:true,fs:15,color:C.in},
    {t:'arrow',x1:108,y1:133,x2:148,y2:133},
    {t:'box',x:148,y:106,w:124,h:54,label:'H',tex:true,fs:16,color:C.h},
    {t:'box',x:276,y:106,w:124,h:54,label:'\\mathrm{CZ}',tex:true,fs:15,color:C.h},
    {t:'box',x:404,y:106,w:124,h:54,label:'H',tex:true,fs:16,color:C.h}
  ]});
}

/* Routing: the two qubits a gate names are not neighbours on the chip. */
function figRoute(){
  const items = [];
  /* the coupling map: a line of four */
  for(let i=0;i<4;i++){
    items.push({t:'box',x:66+i*125,y:30,w:52,h:44,label:'Q_{'+i+'}',tex:true,fs:15,color:C.mid});
    if(i<3) items.push({t:'line',d:`M${118+i*125},52 H${191+i*125}`,color:C.rule});
  }
  items.push({t:'text',x:140,y:130,anchor:'middle',label:'\\mathrm{CNOT}_{0\\to 3}',tex:true,fs:17,color:C.err});
  items.push({t:'arrow',x1:222,y1:124,x2:282,y2:124});
  items.push({t:'text',x:410,y:130,anchor:'middle',label:'2\\times 3 + 1 = 7\\ \\mathrm{CNOT}s',tex:true,fs:17,color:C.out});
  items.push({t:'text',x:140,y:160,label:'not a joined pair',fs:13,color:C.err});
  items.push({t:'text',x:410,y:160,label:'two SWAPs, then the gate',fs:13});
  return growBlocks({w:560,h:176,items});
}

/* The five things a resource claim has to name. */
function figClaimBox(){
  const rows = [
    ['task','what is produced, from what'],
    ['input model','how the data is reached'],
    ['accuracy','what probability, what error'],
    ['hardware model','qubits, connections, noise'],
    ['baseline','the best classical method']
  ];
  const items = [];
  rows.forEach(([k,v],i)=>{
    const y = 16 + i*42;
    /* The last two carry the error tone, and the caption beside the figure
       names two. A caption that promises two and a figure that marks one is
       the pairing chapter 4's Pauli figure shipped and had to fix. */
    items.push({t:'box',x:20,y,w:150,h:34,label:k,fs:14,color:i>=3?C.err:C.h});
    items.push({t:'text',x:188,y:y+22,anchor:'start',label:v,fs:14});
  });
  return growBlocks({w:560,h:226,items});
}

/* One logical qubit as a protected encoding and the control loop that keeps it
   useful. The threshold condition sits below the loop because it is a
   condition on the whole construction, not another step inside it. */
function figFault(){
  return growBlocks({w:560,h:200,items:[
    {t:'box',x:6,y:24,w:122,h:52,label:'physical qubits',fs:13,color:C.in},
    {t:'arrow',x1:128,y1:50,x2:148,y2:50},
    {t:'box',x:148,y:24,w:122,h:52,label:'syndrome checks',fs:13,color:C.h},
    {t:'arrow',x1:270,y1:50,x2:290,y2:50},
    {t:'box',x:290,y:24,w:122,h:52,label:'decoder',fs:13,color:C.mid},
    {t:'arrow',x1:412,y1:50,x2:432,y2:50},
    {t:'box',x:432,y:24,w:122,h:52,label:'correction',fs:13,color:C.out},
    {t:'text',x:280,y:104,label:'one logical qubit',fs:14,color:C.out},
    {t:'line',d:'M60,118 H500',color:C.rule},
    {t:'text',x:140,y:146,label:'space overhead',fs:14,color:C.err},
    {t:'text',x:420,y:146,label:'time overhead',fs:14,color:C.err},
    {t:'text',x:280,y:184,label:'p < p_{\\mathrm{th}}',tex:true,fs:16,color:C.h}
  ]});
}

/* The Ramsey sandwich: a phase written between two Hadamards comes out as a
   population, and the curve is what is actually measured. */
function figRamsey(){
  const a = P.Axes({w:560,h:280,xr:[0,360],yr:[0,1.34],
    xlabel:'\\varphi\\,(\\text{degrees})', ylabel:'p(0)',
    pad:{l:68,r:26,t:30,b:48}, xtarget:5, yticksOverride:[0,0.25,0.5,0.75,1]});
  a.curve(d => Math.cos(d*D2R/2)**2, {color:C.in,width:2.6,n:361});
  /* The frame is taller than the curve so that every name has a band of its
     own above it. A name laid on the curve is what `textclash.js` fires on. */
  a.point(90,0.5,{color:C.h,r:6});
  a.note(96,0.62,'\\varphi=90^{\\circ}: \\text{ a fair coin}',{fs:13,color:C.h,tex:true});
  a.point(180,0,{color:C.out,r:6});
  a.note(180,0.34,'\\varphi=180^{\\circ}: \\text{ always } 1',{fs:13,color:C.out,anchor:'middle',tex:true});
  a.note(178,1.22,'p(0)=\\cos^{2}(\\varphi/2)',{fs:14,color:C.in,anchor:'middle',tex:true});
  return a.svg();
}

/* The copier that works on the basis and fails on everything else. */
function figClone(){
  const items = [
    wire(56,80,230), wire(120,80,230),
    {t:'text',x:70,y:61,anchor:'end',label:'|\\psi\\rangle',tex:true,fs:15},
    {t:'text',x:70,y:125,anchor:'end',label:'|0\\rangle',tex:true,fs:15}
  ].concat(cx(155,56,120)).concat([
    {t:'text',x:155,y:164,label:'the obvious copier',fs:13},
    {t:'text',x:400,y:40,anchor:'middle',label:'|0\\rangle \\mapsto |00\\rangle',tex:true,fs:16,color:C.out},
    {t:'text',x:400,y:74,anchor:'middle',label:'|1\\rangle \\mapsto |11\\rangle',tex:true,fs:16,color:C.out},
    {t:'text',x:400,y:118,anchor:'middle',label:'|{+}\\rangle \\mapsto \\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)',tex:true,fs:16,color:C.err},
    {t:'text',x:400,y:152,anchor:'middle',label:'entangled, not copied',fs:13,color:C.err}
  ]);
  return growBlocks({w:560,h:180,items});
}

/* The teleportation circuit, whole, with the classical wires drawn as the
   double lines they are. With `marks`, the three states the derivation names
   are written above the places they are taken, instead of the stage names
   below. */
function figTele(marks){
  const Y0=44, Y1=100, Y2=156;
  const items = [
    wire(Y0,78,292), wire(Y1,78,292), wire(Y2,78,540),
    {t:'text',x:70,y:Y0+5,anchor:'end',label:'|\\psi\\rangle',tex:true,fs:15},
    {t:'text',x:70,y:Y1+5,anchor:'end',label:'|0\\rangle',tex:true,fs:15},
    {t:'text',x:70,y:Y2+5,anchor:'end',label:'|0\\rangle',tex:true,fs:15},
    /* stage 1: the Bell pair on q1 and q2 */
    gate(104,Y1,'H',true)
  ].concat(cx(146,Y1,Y2)).concat(
    /* stage 2: the Bell-basis rotation on q0 and q1 */
    cx(204,Y0,Y1)).concat([
    gate(250,Y0,'H',true),
    /* stage 3: the two measurements */
    meter(316,Y0), meter(316,Y1)
    /* stage 4: the classical wires, down to the two corrections. m1, from q1,
       chooses the X; m0, from q0, chooses the Z, and the X is applied first.
       Crossing these two wires produces a circuit that repairs one branch in
       four and looks entirely reasonable. */
  ]).concat(cwire(Y1,340,410)).concat(cwire(Y0,340,470)).concat([
    {t:'line',d:`M410,${Y1} V${Y2-17}`,color:C.out},
    {t:'line',d:`M470,${Y0} V${Y2-17}`,color:C.out},
    gate(410,Y2,'X',true,34,C.out),
    gate(470,Y2,'Z',true,34,C.out),
    {t:'text',x:410,y:Y1-8,label:'m_{1}',tex:true,fs:13,color:C.out},
    {t:'text',x:470,y:Y0-8,label:'m_{0}',tex:true,fs:13,color:C.out}
  ]);
  if(marks){
    [[174,'|\\Psi_{0}\\rangle'],[227,'|\\Psi_{1}\\rangle'],[280,'|\\Psi_{2}\\rangle']].forEach(([x,l])=>{
      items.push({t:'line',d:`M${x},28 V174`,color:C.rule});
      items.push({t:'text',x,y:194,label:l,tex:true,fs:15,color:C.mid});
    });
  } else {
    [174,280,352].forEach(x=>items.push({t:'line',d:`M${x},24 V174`,color:C.rule}));
    items.push({t:'text',x:120,y:194,label:'pair',fs:13});
    items.push({t:'text',x:227,y:194,label:'rotate',fs:13});
    items.push({t:'text',x:316,y:194,label:'read',fs:13});
    items.push({t:'text',x:446,y:194,label:'correct',fs:13});
  }
  return growBlocks({w:560,h:206,items});
}

/* The four branches, each with its probability and its correction. The
   correction column is the operator tone throughout, because every entry in
   it is the same kind of thing. */
function figBranch(){
  const rows = [
    ['00','|\\psi\\rangle','\\text{nothing}'],
    ['01','Z|\\psi\\rangle','Z'],
    ['10','X|\\psi\\rangle','X'],
    ['11','XZ|\\psi\\rangle','X\\text{, then }Z']
  ];
  const items = [
    {t:'text',x:62,y:26,anchor:'middle',label:'m_{1}m_{0}',tex:true,fs:14},
    {t:'text',x:176,y:26,anchor:'middle',label:'probability',fs:14},
    {t:'text',x:312,y:26,anchor:'middle',label:'Bob holds',fs:14},
    {t:'text',x:460,y:26,anchor:'middle',label:'Bob applies',fs:14},
    {t:'line',d:'M20,40 H540',color:C.rule}
  ];
  rows.forEach(([m,b,c],i)=>{
    const y = 74 + i*40;
    items.push({t:'text',x:62,y,anchor:'middle',label:m,fs:16,color:C.ink});
    items.push({t:'text',x:176,y,anchor:'middle',label:'0.25',fs:15});
    items.push({t:'text',x:312,y,anchor:'middle',label:b,tex:true,fs:16});
    items.push({t:'text',x:460,y,anchor:'middle',label:c,tex:true,fs:16,color:C.h});
  });
  return growBlocks({w:560,h:210,items});
}

/* Bob's qubit before and after the two bits arrive, as points of the ball.
   Isotropic: 540 px over an x span of 7.65 and 198 px over a y span of 2.805,
   both 70.6 px to the unit, so both balls are drawn as circles. An
   anisotropic frame here would draw the one object the scene is about as an
   ellipse. */
function figNosig(){
  const a = P.Axes({w:600,h:258,xr:[-1.65,6.00],yr:[-1.50,1.305],
    pad:{l:30,r:30,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const circle = (cx,cy)=>{ const p=[]; for(let i=0;i<=220;i++){ const s=2*Math.PI*i/220;
    p.push([cx+Math.cos(s), cy+Math.sin(s)]); } return p; };
  a.poly(circle(0,0),{color:C.grid,width:1.6});
  a.poly(circle(4.3,0),{color:C.grid,width:1.6});
  a.point(0,0,{color:C.err,r:7});
  a.note(0,-1.30,'\\text{before the bits: } I/2',{fs:14,color:C.err,anchor:'middle',dy:14,tex:true});
  a.poly([[4.3,0],[4.3+0.55,0.83]],{color:C.out,width:2.6});
  a.point(4.3+0.55,0.83,{color:C.out,r:7});
  a.note(4.3,-1.30,'\\text{after the bits: } |\\psi\\rangle',{fs:14,color:C.out,anchor:'middle',dy:14,tex:true});
  return a.svg();
}

/* The resource ledger of one teleportation, and the fidelity a protocol has to
   beat before it is entitled to the word. */
function figAccount(){
  return growBlocks({w:560,h:176,items:[
    {t:'box',x:12,y:24,w:150,h:46,label:'1 Bell pair',fs:14,color:C.in},
    {t:'box',x:12,y:84,w:150,h:46,label:'2 classical bits',fs:14,color:C.out},
    {t:'arrow',x1:162,y1:77,x2:204,y2:77},
    {t:'box',x:204,y:54,w:140,h:46,label:'1 qubit moved',fs:14,color:C.mid},
    {t:'text',x:87,y:160,label:'both used up',fs:13},
    {t:'text',x:274,y:128,label:'original destroyed',fs:13},
    {t:'text',x:460,y:46,anchor:'middle',label:'F_{\\text{avg}} \\le \\tfrac23',tex:true,fs:17,color:C.err},
    {t:'text',x:460,y:72,anchor:'middle',label:'no entanglement',fs:13,color:C.err},
    {t:'text',x:460,y:122,anchor:'middle',label:'F_{\\text{avg}} = \\tfrac{2f+1}{3}',tex:true,fs:16,color:C.out},
    {t:'text',x:460,y:152,anchor:'middle',label:'\\text{a pair of quality }f',tex:true,fs:13}
  ]});
}

/* The oracle as a box that is only ever asked questions. */
function figOracle(){
  return growBlocks({w:560,h:176,items:[
    {t:'box',x:200,y:30,w:160,h:100,label:'U_{f}',tex:true,fs:22,color:C.h},
    {t:'arrow',x1:60,y1:62,x2:200,y2:62,label:'|x\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:60,y1:108,x2:200,y2:108,label:'|y\\rangle',tex:true,color:C.in},
    {t:'arrow',x1:360,y1:62,x2:500,y2:62,label:'|x\\rangle',tex:true,color:C.out},
    {t:'arrow',x1:360,y1:108,x2:500,y2:108,label:'|y \\oplus f(x)\\rangle',tex:true,color:C.out},
    {t:'text',x:280,y:160,label:'one query',fs:14}
  ]});
}

/* Phase kickback: the target is prepared in the state the flip cannot change,
   so the answer comes back as a sign on the other register. */
function figKick(){
  return growBlocks({w:560,h:176,items:[
    {t:'text',x:280,y:42,anchor:'middle',label:'X|{-}\\rangle = -|{-}\\rangle',tex:true,fs:18,color:C.h},
    {t:'text',x:280,y:72,anchor:'middle',label:'an eigenstate of the flip',fs:14},
    {t:'text',x:280,y:124,anchor:'middle',label:'U_{f}\\,|x\\rangle|{-}\\rangle = (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle',tex:true,fs:18,color:C.mid},
    {t:'text',x:280,y:156,anchor:'middle',label:'the sign lands on the first register',fs:14,color:C.out}
  ]});
}

/* Amplitude amplification, drawn where it happens: the plane spanned by the
   marked and unmarked states. Isotropic: 380 px over an x span of 2.375 and
   224 px over a y span of 1.40, both exactly 160 px to the unit, so the angle
   theta is drawn at its true size, the unit arc is a circle and the
   reflection is a reflection. */
function figGeom(){
  const a = P.Axes({w:444,h:284,xr:[-0.30,2.075],yr:[-0.33,1.07],
    pad:{l:32,r:32,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const th = 22*D2R;
  a.poly([[0,0],[1.05,0]],{color:C.rule,width:1.4});
  a.poly([[0,0],[0,1.02]],{color:C.rule,width:1.4});
  a.note(1.07,0,'|B\\rangle',{fs:14,color:C.muted,dy:5,tex:true});
  a.note(0,1.05,'|G\\rangle',{fs:14,color:C.muted,anchor:'middle',tex:true});
  /* the unit arc the three states all sit on */
  const arc=[]; for(let i=0;i<=90;i++){ const s=Math.PI/2*i/90; arc.push([Math.cos(s),Math.sin(s)]); }
  a.poly(arc,{color:C.grid,width:1.2,dash:'3 4'});
  /* the starting state */
  a.poly([[0,0],[Math.cos(th),Math.sin(th)]],{color:C.in,width:2.6});
  a.point(Math.cos(th),Math.sin(th),{color:C.in,r:6});
  a.note(Math.cos(th),Math.sin(th),'|s\\rangle',{fs:14,color:C.in,dx:10,dy:-6,tex:true});
  /* the reflected state, below the axis */
  a.poly([[0,0],[Math.cos(th),-Math.sin(th)]],{color:C.h,width:2.2});
  a.point(Math.cos(th),-Math.sin(th),{color:C.h,r:5.5});
  a.note(Math.cos(th),-Math.sin(th),'O_{f}|s\\rangle',{fs:14,color:C.h,dx:10,dy:10,tex:true});
  /* one full iteration */
  const t3 = 3*th;
  a.poly([[0,0],[Math.cos(t3),Math.sin(t3)]],{color:C.out,width:2.6});
  a.point(Math.cos(t3),Math.sin(t3),{color:C.out,r:6});
  a.note(Math.cos(t3),Math.sin(t3),'DO_{f}|s\\rangle',{fs:14,color:C.out,dx:10,dy:-6,tex:true});
  /* the angle from the horizontal, drawn as an arc */
  const a1=[]; for(let i=0;i<=30;i++){ const s=th*i/30; a1.push([0.40*Math.cos(s),0.40*Math.sin(s)]); }
  a.poly(a1,{color:C.in,width:1.6});
  a.note(0.44,0.05,'\\theta',{fs:14,color:C.in,tex:true});
  const a2=[]; for(let i=0;i<=30;i++){ const s=th+2*th*i/30; a2.push([0.62*Math.cos(s),0.62*Math.sin(s)]); }
  a.poly(a2,{color:C.out,width:1.8});
  a.note(0.60,0.35,'2\\theta',{fs:14,color:C.out,tex:true});
  a.note(1.25,0.80,'\\sin\\theta=\\sqrt{M/N}',{fs:14,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* The success probability against the iteration count, with the optimum and
   the overshoot both on the same axes. */
function figIter(){
  const N = 1024, M = 1, th = Math.asin(Math.sqrt(M/N));
  /* The vertical range reaches past one so that the names have a band of
     their own. A probability cannot enter it, so nothing can collide. */
  const a = P.Axes({w:560,h:280,xr:[0,60],yr:[0,1.34],
    xlabel:'r\\,(\\text{iterations})', ylabel:'P_{\\text{good}}',
    pad:{l:70,r:26,t:30,b:48}, xtarget:6, yticksOverride:[0,0.25,0.5,0.75,1]});
  a.curve(r => Math.sin((2*r+1)*th)**2, {color:C.in,width:2.4,n:600});
  a.point(25, Math.sin(51*th)**2, {color:C.out,r:7});
  a.note(25, 1.16,'r=25:\\;0.9995',{fs:13,color:C.out,anchor:'middle',tex:true});
  a.point(50, Math.sin(101*th)**2, {color:C.err,r:7});
  a.note(50, 0.30,'r=50:\\;0.0002',{fs:13,color:C.err,anchor:'middle',tex:true});
  a.vline(25,{color:C.rule,width:1.2,dash:'3 4'});
  a.note(58,1.16,'N=1024,\\;M=1',{fs:13,color:C.muted,anchor:'end',tex:true});
  return a.svg();
}

/* Grover's claim, laid against the five things a claim has to name. */
function figGroverClaim(){
  const rows = [
    ['task','\\text{find }x\\text{ with }f(x)=1',C.h,true],
    ['input model','a reversible oracle',C.h],
    ['accuracy','0.9995\\text{, if }M\\text{ is known}',C.h,true],
    ['hardware model','ideal qubits, no correction',C.err],
    ['baseline','\\text{about }N/2\\text{ queries}',C.err,true]
  ];
  const items = [];
  rows.forEach(([k,v,col,tex],i)=>{
    const y = 14 + i*40;
    items.push({t:'box',x:20,y,w:150,h:32,label:k,fs:14,color:col});
    items.push({t:'text',x:188,y:y+21,anchor:'start',label:v,tex:!!tex,fs:14});
  });
  /* Twenty-five and not thirty-two: the optimum is (pi/4) sqrt(N) and not
     sqrt(N), and the worked example beside this figure uses twenty-five. */
  items.push({t:'text',x:280,y:236,anchor:'middle',label:'25\\text{ queries against }512',tex:true,fs:17,color:C.out});
  return growBlocks({w:560,h:252,items});
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
{ id:'m5-open', module:'M5', nav:'Circuits and Protocols', title:'Circuits and Protocols',
  objective:'Say what this chapter adds to the gates of chapter 4, and name the three objects it keeps apart.',
  keywords:'circuit model overview module 5 program run shots protocol teleportation grover resource claim introduction',
  src:'L8 · a circuit is an abstract program', steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Circuits and protocols'},
  {t:'title', text:'Circuits and Protocols'},
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
{ id:'m5-circuit', module:'M5', nav:'Quantum Circuits', title:'Quantum Circuits',
  objective:'Read a circuit diagram: wires, gates, layers, and the order the gates act in.',
  keywords:'quantum circuit diagram wires gates layers program abstract not hardware time left to right qubit lines',
  src:'L8 · building an abstract circuit', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'Quantum Circuits'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCircuit(),
      caption:'Three qubits and four gates, with the layer boundaries drawn faint. Each gate needs a wire the gate before it has just used, so the depth equals the gate count here. That is the unusual case.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A diagram is not a schedule and not a layout', html:'The lines are not wires on a chip and the spacing is not a duration. Two qubits drawn side by side may be far apart on the hardware.'}]},
  ], right:[
    {t:'eq', key:true, label:'A circuit', tex:'\\begin{aligned} &\\text{one line a qubit, time left to right} \\\\ &\\text{gate count} = \\text{gates}, \\qquad \\text{depth} = \\text{layers} \\end{aligned}',
      note:'A circuit is a <b>program</b>: a list of gates and the order they run in. Gates on different qubits with nothing between them may run at the same moment, and a set of gates that run together is a <b>layer</b>.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'|000\\rangle \\;\\longmapsto\\; \\tfrac{1}{\\sqrt2}\\left(|000\\rangle + e^{i\\pi/4}|111\\rangle\\right)',
        note:'$H$ makes $q_{0}$ into $|{+}\\rangle$, the first CNOT copies that bit into $q_{1}$, the second into $q_{2}$, and $T$ puts a phase on the $|111\\rangle$ term. Two outcomes, each with probability $0.5$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A three-qubit circuit: $H$ on each of the three qubits, then $\\mathrm{CNOT}_{0\\to1}$.<div class="nsep"></div>What are its gate count and its depth?',
        ask:{key:'m5-circuit', choices:['4 gates, depth 2','4 gates, depth 4','2 gates, depth 2'], answer:0,
          why:'The three Hadamards act on different qubits, so they form one layer. The CNOT needs $q_{0}$ and $q_{1}$ afterwards and forms the second.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.1.2 -- */
{ id:'m5-model', module:'M5', nav:'The Circuit Model of Computation', title:'The Circuit Model of Computation',
  objective:'State the four steps of the circuit model and say what each one fixes.',
  keywords:'circuit model computation prepare unitary measure repeat computational basis finite gate set model of computation',
  src:'L8 · a circuit is an abstract program', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'The Circuit Model of Computation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figModel(),
      caption:'The four steps. Every quantum algorithm in this course is an instance of this diagram, and the algorithms differ only in the second box.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Where the other operations went', html:'A measurement in another basis is a rotation and then a $Z$ measurement. Another input state is a circuit that builds it from $|0\\rangle$. Nothing is left out; everything is written in the four steps, so counting means something.'}]},
  ], right:[
    {t:'eq', key:true, label:'The model', tex:'|0\\rangle^{\\otimes n} \\;\\xrightarrow{\\;U_{d}\\cdots U_{2}U_{1}\\;}\\; |\\psi\\rangle \\;\\xrightarrow{\\;\\text{measure}\\;}\\; x \\in \\{0,1\\}^{n}',
      note:'Every qubit starts in $|0\\rangle$, every gate comes from one fixed set, the measurement is in the computational basis, and the run is repeated. Each rule does work: an answer cannot hide in the input, and a change of basis is a gate that has to be paid for.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'n = 3:\\quad 2^{3} = 8 \\text{ amplitudes in } |\\psi\\rangle, \\qquad 3 \\text{ bits per run}',
        note:'The state carries eight complex numbers and a run hands back one string such as $101$. The probabilities are never read directly. They are <b>estimated</b> from many runs, and the estimate needs its own error bar.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A circuit on $n=4$ qubits is run for one shot.<div class="nsep"></div>What comes back, and how many amplitudes did the state have?',
        ask:{key:'m5-model', choices:['4 bits; 16 amplitudes','16 numbers; 16 amplitudes','4 bits; 4 amplitudes'], answer:0,
          why:'One run returns one bit a qubit. The state has one amplitude for each of the $2^{4}=16$ strings, and none of them is handed back.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.1.3 -- */
{ id:'m5-read', module:'M5', nav:'Reading Circuit Diagrams', title:'Reading Circuit Diagrams',
  objective:'Translate between the wire order in a diagram, the ket, the vector index and the printed bit string.',
  keywords:'bit order convention wire order ket index vector entry classical register string little endian least significant',
  src:'L8 · bit order: wires, integers, kets and strings', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'Reading Circuit Diagrams'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOrder(),
      caption:'One state, named three ways. $q_{0}$ is drawn at the top, and its reading is the <b>last</b> digit of the ket, the lowest bit of the index and the last character of the printed string.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A palindrome hides the error', html:'Reading $101$ backwards gives $101$ again. Try $100$ against $001$: both are legal states, and every number computed from the wrong one is wrong with no symptom.'}]},
  ], right:[
    {t:'eq', key:true, label:'Bit order', tex:'|q_{n-1}\\,\\ldots\\,q_{1}q_{0}\\rangle, \\qquad x = \\sum_{k} 2^{k} q_{k}',
      note:'Chapter 4 fixed this order. The wire order down the page and the digit order across the ket are reverses of each other. A printed string follows the ket: if wire $q_{k}$ is read into bit $c_{k}$, the string is $c_{n-1}\\ldots c_{1}c_{0}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\text{string } 101: \\quad q_{2}=1,\\; q_{1}=0,\\; q_{0}=1, \\qquad x = 4+0+1 = 5',
        note:'The leftmost character is $c_{2}$ and the rightmost is $c_{0}$. So the state is $|101\\rangle$, entry $5$ of the state vector. Check it backwards: $5$ is $101$ in binary, and the top wire read the last digit.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A three-qubit run prints the string $110$.<div class="nsep"></div>Which wire read $0$, and which entry of the state vector is this?',
        ask:{key:'m5-read', choices:['the top wire, $q_{0}$; entry $6$','the bottom wire, $q_{2}$; entry $3$','the top wire, $q_{0}$; entry $3$'], answer:0,
          why:'The last character is $c_{0}$, the reading of the top wire. The index is $4\\cdot1+2\\cdot1+0=6$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.1.4 -- */
{ id:'m5-depth', module:'M5', nav:'Circuit Depth and Gate Count', title:'Circuit Depth and Gate Count',
  objective:'Compute the depth and the gate count of a circuit and say which one a coherence budget limits.',
  keywords:'depth gate count layers parallel ghz chain tree coherence time budget circuit length two qubit count',
  src:'L8 · GHZ state, transpilation and instruction-set compliance', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'Circuit Depth and Gate Count'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figDepth(),
      caption:'The same four-qubit GHZ state, two ways, with four gates in each. The chain waits for each CNOT before the next. The tree starts from $q_{1}$ and runs its last two CNOTs together in one layer.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Fewer gates is not faster', html:'A rewrite that removes gates but runs in sequence what ran in parallel makes a circuit slower. Compare the two-qubit count, the depth and the duration, and say which one a claim is about.'}]},
  ], right:[
    {t:'eq', key:true, label:'Time', tex:'T_{\\text{circuit}} \\approx d\\,\\tau, \\qquad \\text{useful while } d\\,\\tau \\ll T_{2}',
      note:'The <b>gate count</b> is how much work there is. The <b>depth</b> $d$ is how many layers run one after another. With gates of duration $\\tau$, depth is what uses up the coherence time $T_{2}$ of chapter 3. GHZ on $n$ qubits needs $n-1$ CNOTs either way; a chain has depth $n$ and a tree about $1+\\log_{2}n$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} n = 16,\\ \\tau = 200\\,\\text{ns}: \\quad \\text{chain } &16 \\times 0.2\\,\\mu\\text{s} = 3.2\\,\\mu\\text{s} \\\\ \\text{tree } &(1+\\log_{2}16) \\times 0.2\\,\\mu\\text{s} = 1.0\\,\\mu\\text{s} \\end{aligned}',
        note:'Both circuits have sixteen gates. At $n=1000$ the chain needs $200\\,\\mu\\text{s}$, far past a $T_{2}$ of $80\\,\\mu\\text{s}$, and the tree needs $2.2\\,\\mu\\text{s}$. The gate count never sees the difference.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'GHZ on $n=64$ qubits, built as a tree, with gates of $100\\,\\text{ns}$.<div class="nsep"></div>How long does the circuit take?',
        ask:{key:'m5-depth', choices:['$0.7\\,\\mu\\text{s}$','$6.4\\,\\mu\\text{s}$','$0.6\\,\\mu\\text{s}$'], answer:0,
          why:'The depth is $1+\\log_{2}64=7$ layers: one Hadamard, then six rounds that double the entangled set. Seven times $100\\,\\text{ns}$ is $0.7\\,\\mu\\text{s}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m5-code-circuit', module:'M5', nav:'The Circuit Model in Code', title:'The Circuit Model in Code',
  objective:'Build a circuit from its gate list, read the order of its wires, and count its layers.',
  keywords:'code qiskit numpy program circuit unitary gate list depth layers bit order run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 5 · The circuit model'},
  {t:'title', text:'The Circuit Model in Code'},
  {t:'raw', html:()=>CODEBANK.page('m5-code-circuit')}
]},

/* ---------------------------------------------------------------- 5.2.1 -- */
{ id:'m5-state', module:'M5', nav:'Statevector Simulation', title:'Statevector Simulation',
  objective:'Say what an exact statevector simulation gives and where it stops being possible.',
  keywords:'statevector simulation exact amplitudes deterministic memory exponential debugging tool classical simulation limit',
  src:'L8 · exact statevector evolution and the operator representation', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'Statevector Simulation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figState(),
      caption:'The memory one state vector needs, against the number of qubits. The vertical axis is logarithmic, so the exponential is a straight line; more hardware does not bend it. The dashed line is $16\\,\\text{GB}$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A simulation limit is not an advantage', html:'Many circuits too large for a state vector are easy another way: Clifford circuits by the stabiliser method, shallow ones by tensor networks. The vector size bounds the difficulty from above only.'}]},
  ], right:[
    {t:'eq', key:true, label:'Memory', tex:'\\text{bytes} = 16\\cdot 2^{n}, \\qquad n=30 \\Rightarrow 17\\,\\text{GB}, \\qquad n=50 \\Rightarrow 18\\,\\text{PB}',
      note:'A classical computer can hold the state of a small circuit and apply every gate exactly: no shots, no noise. That answers the question "is this the circuit I meant". The vector has $2^{n}$ complex entries at sixteen bytes each, and the unitary matrix is worse, with $4^{n}$ entries.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'64\\,\\text{GB}: \\quad 16\\cdot 2^{n} \\le 64\\times10^{9} \\;\\Rightarrow\\; n \\le \\log_{2}(4\\times10^{9}) = 31.9',
        note:'About $31$ qubits, and fewer in practice, because a simulator needs a working copy. Each extra qubit doubles the memory, so going from $31$ to $41$ qubits needs a thousand times more.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A laptop with $16\\,\\text{GB}$ of memory stores one exact state vector.<div class="nsep"></div>What is the largest number of qubits?',
        ask:{key:'m5-state', choices:['$29$','$30$','$34$'], answer:0,
          why:'$16\\cdot2^{n}\\le16\\times10^{9}$ gives $2^{n}\\le10^{9}$ and $n\\le29.9$. Thirty qubits need $17.2\\,\\text{GB}$, just too much.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.2.2 -- */
{ id:'m5-shots', module:'M5', nav:'Shots and Sampling Error', title:'Shots and Sampling Error',
  objective:'Give the standard error of a probability estimated from N shots and separate it from device noise.',
  keywords:'shots sampling binomial standard error one over root n estimation finite statistics not physical noise systematic',
  src:'L8 · measurement, barriers and finite shots', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'Shots and Sampling Error'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShots(),
      caption:'The error bar on a probability near one half, against the shot count. Both axes are logarithmic, so the law is a straight line of slope minus one half. A hundred times the shots buys ten times the accuracy.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'More shots never remove a bias', html:'A faulty gate or readout changes the distribution being sampled. More shots then estimate the <b>wrong</b> probability more precisely. When a result misses by far more than its error bar, the fix is never more shots.'}]},
  ], right:[
    {t:'eq', key:true, label:'Standard error', tex:'K \\sim \\text{Binomial}(N,p), \\qquad \\hat{p}=\\frac{K}{N}, \\qquad \\mathrm{SE}(\\hat{p}) = \\sqrt{\\frac{p(1-p)}{N}}',
      note:'Each shot returns one string. The fraction $\\hat{p}$ of shots showing an outcome is an <b>estimate</b> of its probability, and chapter 2 gave its spread. Ten times the accuracy costs a hundred times the shots, and each shot is a full run of the circuit.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'p = 0.5,\\ \\mathrm{SE} \\le 0.005: \\quad N \\ge \\frac{0.25}{0.005^{2}} = 10{,}000',
        note:'Choose the shot count from the accuracy you need. At $N=1000$ the error is $0.0158$: ten times fewer shots, about three times the error. That is the square root, seen directly.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'An outcome with $p=0.1$ is estimated from $N=900$ shots.<div class="nsep"></div>What is the standard error of $\\hat{p}$?',
        ask:{key:'m5-shots', choices:['$0.01$','$0.0033$','$0.1$'], answer:0,
          why:'$\\sqrt{0.1\\times0.9/900}=\\sqrt{0.0001}=0.01$. A small $p$ has a smaller spread than $p=0.5$ at the same $N$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.2.3 -- */
{ id:'m5-measure', module:'M5', nav:'Mid-Circuit Measurement', title:'Mid-Circuit Measurement',
  objective:'Apply the deferred-measurement rule and say which rearrangements it does not permit.',
  keywords:'deferred measurement principle mid circuit measurement implicit measurement control classical equivalence commute barrier',
  src:'L8 · measurement, barriers and finite shots', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'Mid-Circuit Measurement'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figMeasure(),
      caption:'The same circuit twice. On the left the control is measured last; on the right it is measured first and its bit switches the $X$. Every outcome has the same probability in both.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A gate on the measured wire may not cross', html:'Put a Hadamard on $q_{0}$ after the measurement and the two circuits stop agreeing: the measurement destroyed the phase the Hadamard needed. A barrier marks a place a compiler may not move a gate across.'}]},
  ], right:[
    {t:'eq', key:true, label:'Deferred measurement', tex:'\\text{measure } q_{0},\\ \\text{then } X^{m}\\ \\text{on } q_{1} \\;\\equiv\\; \\mathrm{CNOT}_{0\\to1},\\ \\text{then measure } q_{0}',
      note:'If a measured qubit is only used to <b>control</b> later gates, the measurement can move to the end and the classical control becomes a quantum one. A control acts on each branch of the control qubit separately and never mixes them, so measuring first changes no count.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\mathrm{CNOT}_{0\\to1}\\,|0\\rangle|{+}\\rangle &= \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right) \\\\ m=0: |00\\rangle, \\quad m=1: X \\text{ on } q_{1} &\\to |11\\rangle \\end{aligned}',
        note:'With $q_{0}=|{+}\\rangle$ and $q_{1}=|0\\rangle$, the left circuit reads $00$ or $11$ with probability $0.5$ each. On the right the first reading is $0$ or $1$ with probability $0.5$, and the switched $X$ makes $q_{1}$ agree. Same counts.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$q_{0}=\\sqrt{0.3}\\,|0\\rangle+\\sqrt{0.7}\\,|1\\rangle$ and $q_{1}=|0\\rangle$, in the right-hand circuit.<div class="nsep"></div>What is the probability of reading $q_{1}q_{0}=11$?',
        ask:{key:'m5-measure', choices:['$0.7$','$0.49$','$0.3$'], answer:0,
          why:'The first reading is $1$ with probability $0.7$, and then the $X$ sets $q_{1}=1$ too. The left circuit gives $|\\sqrt{0.7}|^{2}=0.7$ on $|11\\rangle$ as well.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.2.4 -- */
{ id:'m5-feed', module:'M5', nav:'Classical Feedforward', title:'Classical Feedforward',
  objective:'Read a dynamic circuit and say what feedforward costs that a fixed circuit does not.',
  keywords:'dynamic circuit classical feedforward conditional gate mid circuit measurement latency reset real time control flow',
  src:'L8 · dynamic circuits and classical feedforward', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'Classical Feedforward'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figFeed(),
      caption:'The smallest dynamic circuit. The double line $c$ carries one classical bit, and the $X$ runs only when that bit is $1$. Both readings happen inside one shot.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Feedforward is not free', html:'A mid-circuit measurement takes far longer than a gate, and the electronics need time to act on the bit. Both use coherence time, so compare durations, not gate counts.'}]},
  ], right:[
    {t:'eq', key:true, label:'Dynamic circuit', tex:'\\text{measure } q \\;\\to\\; m, \\qquad \\text{apply } U^{m}, \\qquad \\text{continue}',
      note:'A <b>dynamic circuit</b> reads a qubit part-way through a shot and uses the bit to choose the next gate, inside the same shot. Control electronics beside the machine make the choice. Teleportation, error correction and reset all need a gate that is not known until a reading has happened.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} H|0\\rangle = |{+}\\rangle: \\quad m=0 &\\to |0\\rangle \\\\ m=1 &\\to X|1\\rangle = |0\\rangle \\end{aligned}',
        note:'The first reading is a fair coin, and it leaves the qubit in the state that was read. The $X$ runs only on the $1$ branch and maps it back to $|0\\rangle$. The second reading is $0$ with probability $1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The switched $X$ is replaced by an $X$ that runs every time, whatever the bit.<div class="nsep"></div>What is the probability that the second reading is $0$?',
        ask:{key:'m5-feed', choices:['$0.5$','$1$','$0$'], answer:0,
          why:'Now the $0$ branch is flipped to $|1\\rangle$ and the $1$ branch to $|0\\rangle$. Each has probability $0.5$, so the second reading is a fair coin again.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m5-code-run', module:'M5', nav:'Running a Circuit in Code', title:'Running a Circuit in Code',
  objective:'Compare an exact state with finite shots, and follow a measurement and a classically controlled gate branch by branch.',
  keywords:'code qiskit numpy program statevector shots standard error mid circuit measurement feedforward run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 5 · Running a circuit'},
  {t:'title', text:'Running a Circuit in Code'},
  {t:'raw', html:()=>CODEBANK.page('m5-code-run')}
]},

/* ---------------------------------------------------------------- 5.3.1 -- */
{ id:'m5-iset', module:'M5', nav:'Native Gate Sets', title:'Native Gate Sets',
  objective:'Rewrite a gate into a stated instruction set and count what the rewrite costs.',
  keywords:'instruction set native gates basis gates translation rewriting hadamard cz decomposition compile target isa',
  src:'L8 · transpilation and instruction-set compliance', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'Native Gate Sets'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figIset(),
      caption:'Two translations. The upper one is exact up to a global phase; the lower one, with the Hadamards on the target $q_{1}$, is exact outright. One written gate becomes three run gates.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A global phase is not always harmless', html:'The phase $e^{i\\pi/2}$ is invisible on its own. Put the gate under a control and the phase sits on one branch only, where it is observable. A hand-rewritten controlled gate often loses it.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two rewrites', tex:'\\begin{aligned} H &= e^{i\\pi/2}\\, R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{x}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right) \\\\ \\mathrm{CNOT}_{0\\to1} &= \\left(H \\text{ on } q_{1}\\right)\\,\\mathrm{CZ}\\,\\left(H \\text{ on } q_{1}\\right) \\end{aligned}',
      note:'A machine offers one universal set, its <b>instruction set</b>, and runs nothing else. The identities of chapter 4, read the other way, translate a circuit into it. Nothing is approximated; only length is lost.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'40\\ \\mathrm{CNOT} \\;\\to\\; 40\\ \\mathrm{CZ} + 80\\ H = 120 \\text{ instructions}',
        note:'The only two-qubit gate is CZ, so each CNOT gets a Hadamard on each side of its target. The two-qubit count stays at $40$, and that is the number the error budget cares about: a one-qubit gate costs about a tenth of the error.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A circuit of $25$ CNOTs and $10$ Hadamards runs on a machine with CZ, $R_{z}$ and $R_{x}$ only. Nothing cancels.<div class="nsep"></div>How many instructions does it run?',
        ask:{key:'m5-iset', choices:['$105$','$75$','$35$'], answer:0,
          why:'Each CNOT becomes three instructions and each Hadamard becomes three rotations: $75+30=105$. The two-qubit count is still $25$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.3.2 -- */
{ id:'m5-transpile', module:'M5', nav:'Layout and Routing', title:'Layout and Routing',
  objective:'Count what routing a gate between distant qubits costs on a stated coupling map.',
  keywords:'transpilation layout routing coupling map connectivity swap overhead physical qubits virtual mapping compiler passes',
  src:'L8 · transpilation and instruction-set compliance', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'Layout and Routing'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figRoute(),
      caption:'A chip whose qubits form a line, and a gate the circuit wrote between the two ends. The algorithm did not change; the chip set the cost, after the circuit was written.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Two compiler runs need not agree', html:'Layout and routing are heuristic searches, often randomised. The same circuit compiled twice can differ a lot in depth. A reported gate count names the compiler, its settings and its seed.'}]},
  ], right:[
    {t:'eq', key:true, label:'Routing cost', tex:'d \\text{ steps apart:} \\quad 3(d-1) \\text{ extra CNOTs}',
      note:'Only pairs joined on the chip can share a gate; the list of joined pairs is the <b>coupling map</b>. <b>Layout</b> places each circuit qubit on the chip, <b>routing</b> adds SWAPs, <b>translation</b> rewrites into the instruction set, and <b>optimisation</b> removes what it can. A SWAP is three CNOTs.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\text{line of 4},\\ \\mathrm{CNOT}_{0\\to3}: \\quad 2\\times 3 + 1 = 7 \\text{ two-qubit gates}',
        note:'Two SWAPs bring the state of $Q_{0}$ next to $Q_{3}$, then the CNOT runs. Swapping back doubles the overhead; relabelling the classical bits instead avoids it. A report says which was done.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A line of six qubits and $\\mathrm{CNOT}_{0\\to5}$, with no swap back.<div class="nsep"></div>How many two-qubit gates does it cost?',
        ask:{key:'m5-transpile', choices:['$13$','$16$','$10$'], answer:0,
          why:'$Q_{0}$ and $Q_{5}$ are five steps apart, so four SWAPs bring them together: $4\\times3+1=13$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.3.3 -- */
{ id:'m5-cost', module:'M5', nav:'Resource Claims', title:'Resource Claims',
  objective:'State the five components of a resource claim and reject a claim that is missing one.',
  keywords:'resource claim task input model accuracy hardware model classical baseline speedup comparison honest reporting',
  src:'L8 · execution time, usage and experimental cost', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'Resource Claims'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figClaimBox(),
      caption:'The five. The two in the error tone are the two that get left out, and they decide whether a claim survives on a machine.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A query count is not a runtime', html:'Most textbook speedups count <b>queries</b> to a black box. One quantum query is a deep circuit taking microseconds; one classical query is a memory read taking nanoseconds.'}]},
  ], right:[
    {t:'eq', key:true, label:'A claim', tex:'\\text{claim} = \\left(\\text{task},\\ \\text{input model},\\ \\text{accuracy},\\ \\text{hardware},\\ \\text{baseline}\\right)',
      note:'This is the third sentence of the course, now as a tool. A statement that one method beats another names all five, or nothing in it can be checked. The baseline fails most often: the quantum method is compared with the obvious classical method, not the best one.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\text{``sorts a list quadratically faster\'\'}: \\quad 5 \\text{ gaps}',
        note:'Sorting what, returned how? Is the list already in a quantum memory? What failure probability? Which machine? Against which sort? And if the list is loaded one item at a time, the loading alone is linear, so no quadratic saving over the whole task is possible.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'"Finds the one marked item among $N=2^{14}$, with probability above $0.99$, in $100$ oracle queries, against $8192$ classical queries."<div class="nsep"></div>Which component is missing?',
        ask:{key:'m5-cost', choices:['the hardware model','the accuracy','the input model'], answer:0,
          why:'The task, the query access, the probability and a classical count are all named. Nothing says how many qubits, how noisy, or whether error correction is counted.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.3.4 -- */
{ id:'m5-fault', module:'M5', nav:'Physical and Logical Qubits', title:'Physical and Logical Qubits',
  objective:'Distinguish physical and logical qubits, explain syndrome checks and the threshold, and identify space and time overhead.',
  keywords:'quantum error correction physical qubit logical qubit code block syndrome checks decoder threshold code distance fault tolerance space overhead time overhead',
  src:'L0 · physical qubits, logical qubits and fault tolerance; L11 · fault-tolerant logical operations; L12 · error budgets and logical qubits; L13 · error correction changes scaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'Physical and Logical Qubits'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figFault(),
      caption:'The protection loop and its two costs. The logical qubit is the encoded information carried through the loop, not one of the devices in the first box.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Logical resources are not hardware resources', html:'A count of logical qubits is only the first line of an estimate. It still needs the code and distance, the physical error rate, the ancillas, the cycle time and the target failure probability.'}]},
  ], right:[
    {t:'eq', key:true, label:'Threshold', tex:'p < p_{\\mathrm{th}} \\;\\Rightarrow\\; \\text{a larger code gives a lower logical error}',
      note:'A <b>logical qubit</b> is one qubit of information spread over a block of physical qubits. Ancillas measure checks on the block; their results, the <b>syndrome</b>, reveal the error without reading $\\alpha$ or $\\beta$, and a decoder chooses a correction. Below the threshold $p_{\\mathrm{th}}$ of a stated code and noise model, a larger code helps.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\text{three copies, majority vote:} \\quad p_{L} = 3p^{2} - 2p^{3}, \\qquad p = 0.01 \\Rightarrow p_{L} = 3.0\\times10^{-4}',
        note:'The smallest case: one bit stored three times, read by majority, against bit flips only. It fails when two or three copies flip. Below $p=\\tfrac12$ it helps, and above it makes things worse. That is a threshold, in the simplest code there is.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same three-copy code, with each copy flipping with probability $p=0.1$.<div class="nsep"></div>What is the logical error $p_{L}$?',
        ask:{key:'m5-fault', choices:['$0.028$','$0.1$','$0.003$'], answer:0,
          why:'$3(0.1)^{2}-2(0.1)^{3}=0.03-0.002=0.028$. Three times the qubits cut the error by a factor of more than three.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m5-code-compile', module:'M5', nav:'Compiling for a Machine in Code', title:'Compiling for a Machine in Code',
  objective:'Rewrite gates into a basis set, check them up to a global phase, and count what routing on a line costs.',
  keywords:'code qiskit numpy program decomposition basis gates global phase routing swap cnot count run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 5 · Compiling for a machine'},
  {t:'title', text:'Compiling for a Machine in Code'},
  {t:'raw', html:()=>CODEBANK.page('m5-code-compile')}
]},

/* ---------------------------------------------------------------- 5.4.1 -- */
{ id:'m5-ramsey', module:'M5', nav:'Ramsey Interference', title:'Ramsey Interference',
  objective:'Trace the Hadamard sandwich and give the probability it produces from a phase.',
  keywords:'ramsey interference hadamard sandwich phase to population conversion fringe measurement basis change cosine squared',
  src:'L8 · Ramsey-style phase-to-population conversion', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Interference in a circuit'},
  {t:'title', text:'Ramsey Interference'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figRamsey(),
      caption:'The output of the three-gate circuit against the phase written in the middle. This is the fringe of chapter 0, made by a circuit instead of an interferometer.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why this circuit measures $T_{2}$', html:'Replace $P(\\varphi)$ by a wait $t$, so $\\varphi=\\Delta\\omega\\,t$ and the counts oscillate. The coherence decays as $e^{-t/T_{2}}$, and here that decay is the shrinking size of the oscillation.'}]},
  ], right:[
    {t:'eq', key:true, label:'Hadamard sandwich', tex:'\\begin{aligned} |0\\rangle &\\xrightarrow{\\;H\\;} \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right) \\xrightarrow{\\;P(\\varphi)\\;} \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\varphi}|1\\rangle\\right) \\\\ &\\xrightarrow{\\;H\\;} \\tfrac12\\left(1+e^{i\\varphi}\\right)|0\\rangle + \\tfrac12\\left(1-e^{i\\varphi}\\right)|1\\rangle \\\\ p(0) &= \\cos^{2}\\tfrac{\\varphi}{2} \\end{aligned}',
      note:'Every algorithm here arranges a relative phase and then turns it into a probability. The middle state gives one half on each outcome for every $\\varphi$, so a reading there learns nothing. The second Hadamard brings both amplitudes into one outcome, where they add or cancel.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\varphi = 90^{\\circ},\\ 4000 \\text{ shots}: \\quad p(0) = 0.5, \\qquad \\mathrm{SE} = \\sqrt{0.25/4000} = 0.0079',
        note:'About $2000$ zeros. At $\\varphi=180^{\\circ}$ the same circuit gives $p(0)=0$ exactly. One dial moved, and the reading goes from a coin to a certainty: the phase is the whole content.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The phase in the middle is $\\varphi=60^{\\circ}$.<div class="nsep"></div>What is $p(0)$?',
        ask:{key:'m5-ramsey', choices:['$0.75$','$0.25$','$0.5$'], answer:0,
          why:'$\\cos^{2}30^{\\circ}=0.75$. The half angle is the step to watch: $\\cos^{2}60^{\\circ}$ would give $0.25$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m5-code-ramsey', module:'M5', nav:'Interference in a Circuit in Code', title:'Interference in a Circuit in Code',
  objective:'Run the Hadamard sandwich and read the fringe off the counts it predicts.',
  keywords:'code qiskit numpy program ramsey hadamard phase fringe cosine squared run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 5 · Interference in a circuit'},
  {t:'title', text:'Interference in a Circuit in Code'},
  {t:'raw', html:()=>CODEBANK.page('m5-code-ramsey')}
]},

/* ---------------------------------------------------------------- 5.5.1 -- */
{ id:'m5-nocopy', module:'M5', nav:'The No-Cloning Theorem', title:'The No-Cloning Theorem',
  objective:'Show that a universal copier is impossible and say what the CNOT copier actually does.',
  keywords:'no cloning theorem copy unknown state inner product proof cnot copier entangles instead orthogonal states classical bit',
  src:'L9 · the no-cloning theorem', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'The No-Cloning Theorem'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figClone(),
      caption:'The circuit everybody tries first. It copies the two basis states and entangles every other one. That is the failure the theorem predicts, not a defect of this circuit.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not "measurement disturbs the state"', html:'No-cloning follows from linearity alone and holds for a unitary that measures nothing. The uncertainty principle is the wrong argument here, and teleportation next moves an unknown state without breaking either rule.'}]},
  ], right:[
    {t:'eq', key:true, label:'No cloning', tex:'U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle \\ \\text{for all } \\psi \\;\\Rightarrow\\; \\langle\\phi|\\psi\\rangle = \\langle\\phi|\\psi\\rangle^{2} \\;\\Rightarrow\\; \\langle\\phi|\\psi\\rangle \\in \\{0,\\,1\\}',
      note:'Copy two states and take the inner product of the results; a unitary keeps inner products. So a copier works only on states that are identical or orthogonal, which is a set of classical alternatives. A known state can be prepared again, but an <b>unknown</b> one cannot be copied.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} |{+}\\rangle|0\\rangle &\\mapsto \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right) \\\\ \\left|\\langle{+}{+}|\\Phi^{+}\\rangle\\right|^{2} &= 0.5 \\end{aligned}',
        note:'The copier makes the Bell state $|\\Phi^{+}\\rangle$, not $|{+}\\rangle|{+}\\rangle = \\tfrac12(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle)$. The "copy" matches a real one half the time, and each qubit alone is now $I/2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The CNOT copier is given $|{-}\\rangle|0\\rangle$.<div class="nsep"></div>What is the overlap $|\\langle{-}{-}|\\,\\text{out}\\rangle|^{2}$ with a true copy?',
        ask:{key:'m5-nocopy', choices:['$0$','$0.5$','$1$'], answer:0,
          why:'The output is $\\tfrac{1}{\\sqrt2}(|00\\rangle-|11\\rangle)$ and $|{-}{-}\\rangle=\\tfrac12(|00\\rangle-|01\\rangle-|10\\rangle+|11\\rangle)$. The two terms that meet give $\\tfrac{1}{2\\sqrt2}(1-1)=0$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.2 -- */
{ id:'m5-tele', module:'M5', nav:'The Teleportation Circuit', title:'The Teleportation Circuit',
  objective:'Read the teleportation circuit stage by stage, name what each stage does, and state its role in a quantum network.',
  keywords:'teleportation circuit quantum network primitive nodes link bell pair bell measurement basis rotation classical wires correction three qubits protocol stages',
  src:'L0 · computing, sensing and networking; L9 · the three-qubit teleportation circuit', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'The Teleportation Circuit'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figTele(false),
      caption:'The whole protocol, $q_{0}$ at the top. The double lines are classical bits: $m_{1}$ from $q_{1}$ switches the $X$, $m_{0}$ from $q_{0}$ switches the $Z$. Everything right of them waits for the bits to arrive.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The input is destroyed, and must be', html:'After the reading, $q_{0}$ holds a bit and nothing else. If $|\\psi\\rangle$ survived on Alice’s side there would be two copies of an unknown state. Teleportation moves a state; it never copies one.'}]},
  ], right:[
    {t:'eq', key:true, label:'Four stages', tex:'\\begin{aligned} &1.\\ H,\\ \\mathrm{CNOT}_{1\\to2}: \\text{ the shared pair on } q_{1}, q_{2} \\\\ &2.\\ \\mathrm{CNOT}_{0\\to1},\\ H \\text{ on } q_{0}: \\text{ the Bell basis becomes the } Z \\text{ basis} \\\\ &3.\\ \\text{Alice reads } m_{0}, m_{1} \\\\ &4.\\ \\text{two bits travel; Bob applies } X^{m_{1}}, \\text{ then } Z^{m_{0}} \\end{aligned}',
      note:'Alice holds the unknown state on $q_{0}$ and half of a shared pair on $q_{1}$; Bob holds $q_{2}$. Teleportation uses up the pair and two bits to move a state between two nodes of a network. The last stage is not a quantum gate.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'|00\\rangle_{21} \\xrightarrow{\\;H \\text{ on } q_{1}\\;} \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|01\\rangle\\right)_{21} \\xrightarrow{\\;\\mathrm{CNOT}_{1\\to2}\\;} \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)_{21}',
        note:'Stage one. The Hadamard puts $q_{1}$ in $|{+}\\rangle$ and the CNOT copies its bit into $q_{2}$: the pair $|\\Phi^{+}\\rangle$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Alice has made her two readings.<div class="nsep"></div>What must travel, and which way, before Bob holds $|\\psi\\rangle$?',
        ask:{key:'m5-tele', choices:['two classical bits, Alice to Bob','one qubit, Alice to Bob','two classical bits, Bob to Alice'], answer:0,
          why:'The readings select one of four corrections, and four choices take two bits. Only Bob can apply the correction, so the bits go to him.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.3 -- */
{ id:'m5-teleid', module:'M5', nav:'Deriving Teleportation', title:'Deriving Teleportation',
  objective:'Derive the four-branch teleportation identity from the initial product state.',
  keywords:'teleportation identity derivation four branches expansion cnot hadamard algebra three qubit state pauli frame',
  src:'L9 · teleportation identity, resources and no signaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Deriving Teleportation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figTele(true),
      caption:'The circuit with the three states of the derivation marked where they are taken. $|\\psi\\rangle=\\alpha|0\\rangle+\\beta|1\\rangle$ sits on $q_{0}$, and kets are written $|q_{2}q_{1}q_{0}\\rangle$ throughout.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The sum is not a mixture yet', html:'Before Alice reads, the four terms are a superposition, not four things that have already happened. Chapter 3 separated a superposition from a mixture, and the difference holds here too.'}]},
  ], right:[
    {t:'eq', key:true, label:'Steps 1 and 2', tex:'\\begin{aligned} |\\Psi_{0}\\rangle &= \\left(\\alpha|0\\rangle+\\beta|1\\rangle\\right)_{0} \\otimes \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)_{21} \\\\ &= \\tfrac{1}{\\sqrt2}\\Big[\\alpha\\left(|000\\rangle+|110\\rangle\\right) + \\beta\\left(|001\\rangle+|111\\rangle\\right)\\Big] \\\\ |\\Psi_{1}\\rangle &= \\tfrac{1}{\\sqrt2}\\Big[\\alpha\\left(|000\\rangle+|110\\rangle\\right) + \\beta\\left(|011\\rangle+|101\\rangle\\right)\\Big] \\end{aligned}',
      note:'Multiply out the product, then let $\\mathrm{CNOT}_{0\\to1}$ flip $q_{1}$ where $q_{0}=1$: only the $\\beta$ terms change.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Steps 3 and 4', tex:'\\begin{aligned} |\\Psi_{2}\\rangle = \\tfrac12\\Big[&\\;\\alpha|000\\rangle+\\alpha|001\\rangle+\\alpha|110\\rangle+\\alpha|111\\rangle \\\\ &+ \\beta|010\\rangle-\\beta|011\\rangle+\\beta|100\\rangle-\\beta|101\\rangle\\Big] \\\\ = \\tfrac12 &\\sum_{m_{1},m_{0}} |m_{1}m_{0}\\rangle_{10} \\otimes X^{m_{1}}Z^{m_{0}}|\\psi\\rangle_{2} \\end{aligned}',
        note:'$H$ on $q_{0}$ gives eight terms. Group them by $(q_{1},q_{0})=(m_{1},m_{0})$: what is left on $q_{2}$ is $|\\psi\\rangle$ with a Pauli in front, for every $\\alpha$ and $\\beta$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=0.6\\,|0\\rangle+0.8\\,|1\\rangle$, and Alice reads $m_{1}m_{0}=10$.<div class="nsep"></div>What does Bob hold before any correction?',
        ask:{key:'m5-teleid', choices:['$0.8\\,|0\\rangle+0.6\\,|1\\rangle$','$0.6\\,|0\\rangle-0.8\\,|1\\rangle$','$0.6\\,|0\\rangle+0.8\\,|1\\rangle$'], answer:0,
          why:'With $m_{1}=1$ and $m_{0}=0$ Bob holds $X|\\psi\\rangle$, which exchanges the two amplitudes. In the eight terms: $q_{1}q_{0}=10$ picks $\\alpha|110\\rangle$ and $\\beta|010\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.4 -- */
{ id:'m5-telecorr', module:'M5', nav:'The Correction Table', title:'The Correction Table',
  objective:'Read the correction out of the two measured bits and verify one branch by hand.',
  keywords:'correction table pauli frame measured bits branches x z gates classical feedforward teleportation recovery four cases',
  src:'L9 · teleportation identity, resources and no signaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'The Correction Table'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figBranch(),
      caption:'The four branches. Each has probability exactly one quarter, whatever $|\\psi\\rangle$ was; the next scene builds the no-signalling argument on that fact.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'No correction is not a slightly worse state', html:'Averaging the four branches with weight one quarter is the depolarising channel of chapter 3 at full strength. It gives $I/2$: without the bits, teleportation does not partly work.'}]},
  ], right:[
    {t:'eq', key:true, label:'The correction', tex:'Z^{m_{0}}X^{m_{1}}\\;\\left(X^{m_{1}}Z^{m_{0}}|\\psi\\rangle\\right) = |\\psi\\rangle',
      note:'Bob holds $X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$. $X$ and $Z$ are their own inverses, so he applies $X^{m_{1}}$ and then $Z^{m_{0}}$. The bits are fair coins and say nothing about $\\alpha$ or $\\beta$. They name which known operation happened, which is why two bits move a state with two continuous parameters.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} XZ|\\psi\\rangle &= -\\beta|0\\rangle+\\alpha|1\\rangle \\\\ &\\xrightarrow{\\;X\\;} \\alpha|0\\rangle-\\beta|1\\rangle \\;\\xrightarrow{\\;Z\\;}\\; \\alpha|0\\rangle+\\beta|1\\rangle \\end{aligned}',
        note:'Alice read $m_{1}m_{0}=11$, so Bob applies $X$ first, then $Z$. The other order gives $-|\\psi\\rangle$, a global phase that is harmless here. Inside a larger circuit, where the qubit may be controlled later, it would not be, so check the order every time.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=|0\\rangle$. Alice reads $m_{1}m_{0}=01$, and Bob applies $X$ by mistake instead of $Z$.<div class="nsep"></div>What is his fidelity with $|0\\rangle$?',
        ask:{key:'m5-telecorr', choices:['$0$','$0.5$','$1$'], answer:0,
          why:'Bob holds $Z|0\\rangle=|0\\rangle$, and the wrong $X$ turns it into $|1\\rangle$, orthogonal to the state sent. A wrong correction is not a small error.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.5 -- */
{ id:'m5-nosig', module:'M5', nav:'Teleportation and No-Signalling', title:'Teleportation and No-Signalling',
  objective:'Show that Bob’s reduced state is independent of the input and say what that rules out.',
  keywords:'no signaling reduced state maximally mixed independent of input classical channel light speed entanglement alone sends nothing',
  src:'L9 · teleportation identity, resources and no signaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Teleportation and No-Signalling'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figNosig(),
      caption:'Bob’s qubit, drawn twice. Before the bits: at the centre of the ball, carrying nothing. After the correction: the state that was sent. The qubit did not move between the two pictures; only the description of it did.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'"Bob’s qubit changed when Alice measured"', html:'Her reading changes what <b>she</b> can say about his qubit. It changes nothing Bob can observe: every measurement he makes has the same statistics as before. That is why the theory and relativity agree.'}]},
  ], right:[
    {t:'eq', key:true, label:'Bob before the bits', tex:'\\rho_{B} = \\tfrac14\\sum_{m_{1},m_{0}} X^{m_{1}}Z^{m_{0}}\\,\\rho\\,Z^{m_{0}}X^{m_{1}} = \\frac{I}{2}',
      note:'Until he learns the bits, Bob’s state is the average of the four equally likely branches. The right-hand side has no $\\rho$ in it: whatever Alice sent, Bob holds the maximally mixed state. This is the chapter-3 theorem that no local operation changes the other half of a pair, as a circuit.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\tfrac14\\Big[(r_{x},r_{y},r_{z}) + (r_{x},-r_{y},-r_{z}) + (-r_{x},-r_{y},r_{z}) + (-r_{x},r_{y},-r_{z})\\Big] = \\mathbf{0}',
        note:'The sum in the Bloch picture. $X$ flips the signs of $r_{y}$ and $r_{z}$, $Z$ flips $r_{x}$ and $r_{y}$, and $XZ$ flips $r_{x}$ and $r_{z}$. Each component cancels, and a Bloch vector of zero is $I/2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Alice sends $0.6\\,|0\\rangle+0.8\\,|1\\rangle$. Before the bits arrive, Bob measures his qubit in the $X$ basis.<div class="nsep"></div>What is the probability that he reads $|{+}\\rangle$?',
        ask:{key:'m5-nosig', choices:['$0.5$','$0.98$','$0.02$'], answer:0,
          why:'Before the bits his qubit is $I/2$ for every input, so every basis gives $0.5$ each. The $0.98$ is $|\\langle{+}|\\psi\\rangle|^{2}$, which only the corrected qubit shows.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.5.6 -- */
{ id:'m5-teleres', module:'M5', nav:'The Cost and Fidelity of Teleportation', title:'The Cost and Fidelity of Teleportation',
  objective:'Account for the resources one teleportation consumes and state the fidelity benchmark it must exceed.',
  keywords:'resources ebit classical bits fidelity benchmark two thirds measure and prepare singlet fraction average fidelity claim',
  src:'L9 · teleportation fidelity and experimental claims', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'The Cost and Fidelity of Teleportation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figAccount(),
      caption:'The account, and the line a claim has to cross. Measuring the qubit and preparing a new one reaches two thirds on average over the sphere, with no entanglement at all.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A best-case fidelity is not a result', html:'A claim states the unconditional success rate, what was discarded and why, the pair quality, any readout correction and a confidence interval. One number on one good input proves nothing.'}]},
  ], right:[
    {t:'eq', key:true, label:'Fidelity', tex:'F(\\psi) = \\langle\\psi|\\rho_{\\text{out}}|\\psi\\rangle, \\qquad F_{\\text{avg}} = \\frac{2f+1}{3}',
      note:'Moving one unknown qubit uses up one shared pair and two bits, and destroys the original. A noisy apparatus makes something close to the input, so success needs a number: the overlap of chapter 2. A machine that always outputs $|0\\rangle$ scores $F=1$ on input $|0\\rangle$, so the claim is an <b>average</b> over the sphere, written here for a pair of quality $f$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'F_{\\text{avg}} = 0.81 > \\tfrac23: \\quad f = \\frac{3F_{\\text{avg}}-1}{2} = \\frac{2.43-1}{2} = 0.715',
        note:'The run beats the classical benchmark of $2/3$. Check the formula at both ends: a separable pair, $f=0.5$, gives exactly $2/3$, and a perfect pair, $f=1$, gives $1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A shared pair has quality $f=0.85$.<div class="nsep"></div>What average fidelity can teleportation with it reach?',
        ask:{key:'m5-teleres', choices:['$0.9$','$0.85$','$0.567$'], answer:0,
          why:'$(2\\times0.85+1)/3=2.7/3=0.9$. A pair error applies a wrong Pauli, which still leaves an average overlap of $\\tfrac13$ with the input: $f\\cdot1+(1-f)\\cdot\\tfrac13$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.L1 --- */
{ id:'m5-lab-i', module:'M5', nav:'Laboratory I \u2014 Teleportation, Step by Step', title:'Laboratory I \u2014 Teleportation, Step by Step',
  objective:'Let the reader step the teleportation circuit and see the correction selected by the measured bits.',
  keywords:'laboratory teleportation stepped branches correction measured bits reduced state bloch no signaling classical channel',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Laboratory I \u2014 Teleportation, Step by Step'},
  {t:'small', html:'Choose the state to send with the two angles, then walk the circuit one stage at a time. The left panel is the Bloch vector of Bob\u2019s qubit at the chosen stage; the right panel is the fidelity against the tilt of the input. Three things to find: the four branches all have probability one quarter whatever the input is, Bob\u2019s vector sits exactly at the centre until the correction is applied, and applying the wrong correction is not a small error but a completely different state.'},
  {t:'lab', id:'I'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m5-code-tele', module:'M5', nav:'Teleportation in Code', title:'Teleportation in Code',
  objective:'Run the teleportation circuit branch by branch, apply the correction the bits choose, and check what Bob holds before they arrive.',
  keywords:'code qiskit numpy program teleportation branches correction fidelity reduced state maximally mixed run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 5 · Teleportation'},
  {t:'title', text:'Teleportation in Code'},
  {t:'raw', html:()=>CODEBANK.page('m5-code-tele')}
]},

/* ---------------------------------------------------------------- 5.6.1 -- */
{ id:'m5-search', module:'M5', nav:'Unstructured Search', title:'Unstructured Search',
  objective:'State the search problem in the query model and say what the oracle is and is not.',
  keywords:'unstructured search oracle query model black box marked items reversible embedding classical baseline n over two',
  src:'L9 · Grover search and the oracle', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'Unstructured Search'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOracle(),
      caption:'The box, and the only thing that may be done with it. How often it is opened has a clean answer; what it cost to build is a separate and messier question.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'"Unstructured" is usually false', html:'A sorted list is searched in $\\log_{2}N$ steps and a hash table in one. The quadratic saving holds only where no structure exists, and comparing it with a linear scan of a problem nobody would scan is the common misuse.'}]},
  ], right:[
    {t:'eq', key:true, label:'The oracle', tex:'U_{f}\\,|x\\rangle|y\\rangle = |x\\rangle\\,|y \\oplus f(x)\\rangle',
      note:'There are $N=2^{n}$ candidates, and $f(x)=1$ marks the $M$ that are solutions. Nothing else is known. $f$ is available only as a black box, built as chapter 4 built every reversible embedding: the exclusive OR keeps it reversible, since $f(x)\\oplus f(x)=0$. One use of the box is one <b>query</b>.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 1024,\\ M = 1: \\quad \\text{about } N/2 = 512 \\text{ classical queries}',
        note:'Check the candidates one at a time. The solution is equally likely to be anywhere, so on average half the list is checked. This is the number Grover is compared with, and it counts queries, not seconds.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N=2^{20}$ candidates with one solution, searched classically one at a time.<div class="nsep"></div>About how many queries does the search take on average?',
        ask:{key:'m5-search', choices:['$5.2\\times10^{5}$','$1.0\\times10^{3}$','$1.0\\times10^{6}$'], answer:0,
          why:'On average $(N+1)/2 = 524{,}288.5$ queries, half of $1{,}048{,}576$. The number $\\sqrt{N}=1024$ is what Grover is measured against.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.2 -- */
{ id:'m5-kick', module:'M5', nav:'The Phase Oracle', title:'The Phase Oracle',
  objective:'Derive phase kickback and use it to turn the standard oracle into a phase oracle.',
  keywords:'phase kickback minus state eigenstate oracle sign marked items reflection relative phase mechanism interference algorithms',
  src:'L9 · oracles and hidden implementation cost', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The Phase Oracle'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figKick(),
      caption:'Kickback in two lines. The gate was written to change the target; the target is an eigenstate of that change, so the effect appears on the first register instead.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A dirty target kills the phase', html:'If the oracle leaves anything behind, such as an ancilla holding a partial result, the first register is entangled with it and the interference at the end does not happen. This is why chapter 4 uncomputes.'}]},
  ], right:[
    {t:'eq', key:true, label:'Kickback', tex:'\\begin{aligned} X|{-}\\rangle &= -|{-}\\rangle \\\\ U_{f}\\,|x\\rangle|{-}\\rangle &= (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle \\end{aligned}',
      note:'The oracle flips a bit, and interference needs a phase. Prepare the target in $|{-}\\rangle$, the eigenstate of the flip with eigenvalue $-1$. The target comes out unchanged, and the answer lands on the <b>first</b> register as a sign. On a superposition one query signs every marked term; no probability changes.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'f(0)=0,\\ f(1)=1: \\quad \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right)|{-}\\rangle \\;\\mapsto\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle-|1\\rangle\\right)|{-}\\rangle',
        note:'The query signs the $|1\\rangle$ term, so the first register moves from $|{+}\\rangle$ to $|{-}\\rangle$. Read it in the $X$ basis and the answer is certain after one query. Read it in the $Z$ basis and it is still a fair coin.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$f(0)=1$ and $f(1)=1$, and the input is $|{+}\\rangle|{-}\\rangle$.<div class="nsep"></div>What is the first register after one query?',
        ask:{key:'m5-kick', choices:['$|{+}\\rangle$, up to a global sign','$|{-}\\rangle$','entangled with the target'], answer:0,
          why:'Both terms get the sign $-1$, so the state is $-|{+}\\rangle|{-}\\rangle$. A sign on every term is a global phase, and nothing observable changed.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.3 -- */
{ id:'m5-geom', module:'M5', nav:'The Geometry of Grover Search', title:'The Geometry of Grover Search',
  objective:'Write the uniform superposition in the marked and unmarked basis and give the angle it makes.',
  keywords:'grover geometry two dimensional subspace good bad states uniform superposition angle theta arcsin marked fraction plane',
  src:'L9 · geometry of amplitude amplification', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The Geometry of Grover Search'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figGeom(),
      caption:'The plane, drawn with equal scales so the angles are the real ones. One iteration is two reflections, and two reflections are a turn by $2\\theta$. $|s\\rangle$ starts near the horizontal because a random guess almost never works.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'$\\theta$ is not a Bloch-sphere angle', html:'This is a real plane inside a $2^{n}$-dimensional space. The half-angle rules of chapter 4 do not apply here, and mixing the two pictures gives answers wrong by a factor of two.'}]},
  ], right:[
    {t:'eq', key:true, label:'The plane', tex:'\\begin{aligned} |G\\rangle &= \\frac{1}{\\sqrt{M}}\\sum_{f(x)=1}|x\\rangle, \\qquad |B\\rangle = \\frac{1}{\\sqrt{N-M}}\\sum_{f(x)=0}|x\\rangle \\\\ |s\\rangle &= \\sin\\theta\\,|G\\rangle + \\cos\\theta\\,|B\\rangle, \\qquad \\sin\\theta = \\sqrt{\\frac{M}{N}} \\end{aligned}',
      note:'$|G\\rangle$ is the even mixture of the marked candidates and $|B\\rangle$ of the rest; they are orthonormal. The start $|s\\rangle$, Hadamards on every qubit, lies in their plane, and both operations of the algorithm keep it there. A problem in $2^{n}$ dimensions has become a problem in two.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 1024,\\ M = 1: \\quad \\sin\\theta = \\tfrac{1}{32}, \\qquad \\theta = 1.79^{\\circ}, \\qquad \\sin^{2}\\theta = 0.000977',
        note:'The start makes an angle under two degrees with $|B\\rangle$. Measuring straight away finds the marked item with probability $1/1024$, one in $N$, which is the sanity test for the construction.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N=64$ candidates, of which $M=4$ are marked.<div class="nsep"></div>What is the angle $\\theta$?',
        ask:{key:'m5-geom', choices:['$14.5^{\\circ}$','$3.6^{\\circ}$','$0.25^{\\circ}$'], answer:0,
          why:'$\\sin\\theta=\\sqrt{4/64}=0.25$, so $\\theta=\\arcsin0.25=14.5^{\\circ}$. The $0.25$ is the sine, not the angle.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.4 -- */
{ id:'m5-rotate', module:'M5', nav:'The Grover Iteration', title:'The Grover Iteration',
  objective:'Show that the Grover iteration rotates the state by twice the angle theta.',
  keywords:'grover iteration oracle reflection diffusion operator inversion about the mean rotation two theta amplitude amplification',
  src:'L9 · geometry of amplitude amplification', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The Grover Iteration'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figGeom(),
      caption:'One iteration, drawn. The oracle takes the vector below the horizontal; the diffusion brings it back above, past where it started. The two mirrors are $\\theta$ apart, so the net turn is $2\\theta$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The diffusion is not free', html:'It holds no information about $f$, so it is not a query. It is still a circuit: $H^{\\otimes n}$, a many-controlled phase with its Toffolis and ancillas, and $H^{\\otimes n}$. A resource estimate counts it.'}]},
  ], right:[
    {t:'eq', key:true, label:'One iteration', tex:'\\begin{aligned} O_{f} &= I - 2\\,|G\\rangle\\langle G|, \\qquad D = 2\\,|s\\rangle\\langle s| - I \\\\ D\\,O_{f} &: \\text{ a turn of the plane by } 2\\theta \\text{ towards } |G\\rangle \\end{aligned}',
      note:'The phase oracle signs the marked terms: a reflection in the $|B\\rangle$ axis. The diffusion reflects in $|s\\rangle$. Two reflections in lines $\\theta$ apart make a rotation by $2\\theta$. After $r$ iterations the angle is $(2r+1)\\theta$. In the computational basis $D$ replaces each amplitude $c_{x}$ by $2\\bar{c}-c_{x}$: inversion about the mean.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 1024: \\quad \\theta = 1.79^{\\circ} \\;\\to\\; 3\\theta = 5.37^{\\circ}, \\qquad \\sin^{2}3\\theta = 0.0088',
        note:'One iteration adds the same angle $2\\theta$ every time, not the same probability. The success probability grows from $0.000977$ to $0.0088$, about nine times, because $\\sin^{2}$ of a small angle grows as its square.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N=16$ with one marked candidate, after two iterations.<div class="nsep"></div>What angle does the state make with $|B\\rangle$?',
        ask:{key:'m5-rotate', choices:['$72.4^{\\circ}$','$43.4^{\\circ}$','$57.9^{\\circ}$'], answer:0,
          why:'$\\theta=\\arcsin\\tfrac14=14.48^{\\circ}$, and two iterations reach $5\\theta=72.4^{\\circ}$. Each iteration adds $2\\theta$ to the starting $\\theta$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.5 -- */
{ id:'m5-iter', module:'M5', nav:'The Optimal Number of Iterations', title:'The Optimal Number of Iterations',
  objective:'Compute the optimal iteration count and the success probability, and describe the overshoot.',
  keywords:'optimal iterations grover success probability sine squared overshoot rotate past unknown m quantum counting stopping',
  src:'L9 · geometry of amplitude amplification', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The Optimal Number of Iterations'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figIter(),
      caption:'The success probability against the iteration count, for one marked item among $1024$. It reaches almost one at twenty-five iterations and falls back to almost nothing at fifty.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'More iterations are not better', html:'Past $r_{*}$ the vector turns beyond $|G\\rangle$ and the probability falls; near $2r_{*}$ it is back where it began. When $M$ is unknown, the fix is a random schedule of counts or an estimate of $M$, not more iterations.'}]},
  ], right:[
    {t:'eq', key:true, label:'The optimum', tex:'\\begin{aligned} P_{\\text{good}}(r) &= \\sin^{2}\\!\\big((2r+1)\\theta\\big) \\\\ r_{*} &= \\frac{\\pi}{4\\theta} - \\frac12 \\;\\approx\\; \\frac{\\pi}{4}\\sqrt{\\frac{N}{M}} \\quad (M \\ll N) \\end{aligned}',
      note:'The angle after $r$ iterations is $(2r+1)\\theta$, and the probability is its sine squared. It is largest at a right angle; take the nearest whole number to $r_{*}$. Each step adds $2\\theta\\approx2\\sqrt{M/N}$, so the count goes as $\\sqrt{N/M}$. Nothing exponential happened: a small angle was added many times.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'N = 8,\\ M = 2: \\quad \\sin\\theta = 0.5,\\ \\theta = 30^{\\circ}, \\quad r_{*} = \\tfrac{90}{60} - \\tfrac12 = 1, \\quad P = \\sin^{2}90^{\\circ} = 1',
        note:'One iteration makes the answer certain. A second gives $\\sin^{2}150^{\\circ}=0.25$, exactly the probability before any iteration: two iterations undo the work of one.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N=256$ candidates with one marked.<div class="nsep"></div>What is the best whole number of iterations?',
        ask:{key:'m5-iter', choices:['$12$','$16$','$25$'], answer:0,
          why:'$\\theta=\\arcsin\\tfrac1{16}=0.0625\\,\\text{rad}$, so $r_{*}=\\pi/(4\\theta)-\\tfrac12=12.06$. At $12$ the probability is $0.99995$. The $16$ forgets the factor $\\pi/4$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.6.6 -- */
{ id:'m5-claim', module:'M5', nav:'The Grover Speedup', title:'The Grover Speedup',
  objective:'Write Grover\u2019s claim against the five components and say precisely what it does and does not assert.',
  keywords:'grover claim query complexity optimality lower bound end to end cost data loading error correction baseline speedup honest',
  src:'L9 · oracles and hidden implementation cost', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'The Grover Speedup'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figGroverClaim(),
      caption:'Grover\u2019s claim against the five. The two in the error tone are usually left unstated, and they decide whether the saving survives on a real machine.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What the result does say', html:'For a problem with no structure, a cheap reversible predicate and no data to load, a quantum computer needs quadratically fewer evaluations of the predicate, and that is optimal. It is a theorem about a count, not a clock.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two counts', tex:'Q_{\\text{quantum}} \\approx \\tfrac{\\pi}{4}\\sqrt{N}, \\qquad Q_{\\text{classical}} \\approx \\tfrac{N}{2}',
      note:'The result is real and provable, and no quantum algorithm does better than order $\\sqrt{N}$ in this model. Three components carry heavy weight. The <b>input model</b>: loading $N$ records into a quantum memory takes $N$ steps. The <b>hardware</b>: $\\sqrt{N}$ oracle calls need error correction. The <b>baseline</b>: real problems are rarely unstructured.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} N = 1024: \\quad \\text{quantum } &25 \\times 10\\,\\mu\\text{s} = 250\\,\\mu\\text{s} \\\\ \\text{classical } &512 \\times 10\\,\\text{ns} = 5.1\\,\\mu\\text{s} \\end{aligned}',
        note:'Twenty times fewer queries, and fifty times slower. Both ratios are correct and they point in opposite directions. The honest question is the $N$ at which $\\sqrt{N}$ slow queries beat $N/2$ fast ones.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same query times, $10\\,\\mu\\text{s}$ and $10\\,\\text{ns}$, at $N=2^{20}$ with one marked item.<div class="nsep"></div>Which run finishes first?',
        ask:{key:'m5-claim', choices:['classical: $5.2\\,\\text{ms}$ against $8.0\\,\\text{ms}$','quantum: $8.0\\,\\text{ms}$ against $5.2\\,\\text{s}$','they tie'], answer:0,
          why:'Grover needs $804$ queries, $8.0\\,\\text{ms}$. The classical scan needs $2^{19}=524{,}288$ queries, $5.2\\,\\text{ms}$. The crossing is near $N=2.5\\times10^{6}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 5.L2 --- */
{ id:'m5-lab-j', module:'M5', nav:'Laboratory J \u2014 Grover Iterations and Overshoot', title:'Laboratory J \u2014 Grover Iterations and Overshoot',
  objective:'Let the reader turn the problem size and the iteration count and watch the success probability rise and fall.',
  keywords:'laboratory grover amplitude amplification iterations angle success probability overshoot optimum marked items amplitudes',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'Laboratory J \u2014 Grover Iterations and Overshoot'},
  {t:'small', html:'Choose the number of qubits and how many candidates are marked, then step the iterations. The left panel is the plane of the last two scenes with the state drawn where it actually is; the right panel is the success probability against the iteration count, with every integer marked. Three things to find: the optimum is near $\\tfrac{\\pi}{4}\\sqrt{N/M}$ and is only occasionally exact, running twice the optimum returns almost exactly the probability you started with, and marking a quarter of the candidates makes the algorithm useless because the first step already overshoots.'},
  {t:'lab', id:'J'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m5-code-grover', module:'M5', nav:'Grover Search in Code', title:'Grover Search in Code',
  objective:'Build Grover from two reflections, find the best iteration count, and watch the overshoot.',
  keywords:'code qiskit numpy program grover oracle diffusion reflection iterations success probability overshoot run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 5 · Grover search'},
  {t:'title', text:'Grover Search in Code'},
  {t:'raw', html:()=>CODEBANK.page('m5-code-grover')}
]},

/* ---------------------------------------------------------------- 5.6.7 -- */
{ id:'m5-quick', module:'M5', nav:'Quick Check', title:'Quick Check',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict circuit depth gate count shots native gate set routing fault tolerance ramsey grover',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Quick check'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Depth', html:'$H$ on both qubits, then $\\mathrm{CZ}$. Find the depth.',
      ask:{key:'m5-qc0', choices:['$2$','$3$','$1$'], answer:0,
        why:'One layer, then CZ.'}}],
    [{t:'note', kind:'def', head:'Circuit model', html:'$n=3$ qubits, one shot. What comes back?',
      ask:{key:'m5-qc1', choices:['3 bits','8 numbers','3 amps'], answer:0,
        why:'One bit a qubit.'}}],
    [{t:'note', kind:'def', head:'Bit order', html:'A three-qubit run prints $011$. Which entry?',
      ask:{key:'m5-qc2', choices:['$3$','$6$','$4$'], answer:0,
        why:'$0{+}2{+}1=3$.'}}],
    [{t:'note', kind:'def', head:'GHZ tree', html:'$n=32$, gates of $50$ns. Find the time.',
      ask:{key:'m5-qc3', choices:['$0.3\\mu s$','$1.6\\mu s$','$0.25\\mu s$'], answer:0,
        why:'Depth $1{+}\\log_2 32$.'}}],
    [{t:'note', kind:'def', head:'Memory', html:'$8$GB, one state vector. Largest qubit count?',
      ask:{key:'m5-qc4', choices:['$28$','$29$','$32$'], answer:0,
        why:'$16\\cdot2^{n}\\le8\\times10^{9}$.'}}],
    [{t:'note', kind:'def', head:'Shot noise', html:'$p=0.2$, $N=400$. Find the SE.',
      ask:{key:'m5-qc5', choices:['$0.02$','$0.2$','$0.002$'], answer:0,
        why:'$\\sqrt{0.16/400}$.'}}],
    [{t:'note', kind:'def', head:'Gate set', html:'$10$ CNOTs on CZ, $R_z$, $R_x$. Instructions?',
      ask:{key:'m5-qc6', choices:['$30$','$10$','$20$'], answer:0,
        why:'Three per CNOT.'}}],
    [{t:'note', kind:'def', head:'Routing', html:'Qubits $3$ steps apart. Extra CNOTs?',
      ask:{key:'m5-qc7', choices:['$6$','$3$','$9$'], answer:0,
        why:'$3(d-1)=6$.'}}],
    [{t:'note', kind:'def', head:'Resource claims', html:'"Solves it in $50$ queries." Missing?',
      ask:{key:'m5-qc8', choices:['most of it','baseline','nothing'], answer:0,
        why:'One of five is named.'}}],
    [{t:'note', kind:'def', head:'Fault tolerance', html:'Three-copy code, $p=0.05$. Find $p_{L}$.',
      ask:{key:'m5-qc9', choices:['$0.0073$','$0.05$','$0.15$'], answer:0,
        why:'$3p^{2}-2p^{3}$.'}}],
    [{t:'note', kind:'def', head:'Ramsey', html:'$\\varphi=120^{\\circ}$. Find $p(0)$.',
      ask:{key:'m5-qc10', choices:['$0.25$','$0.75$','$0.5$'], answer:0,
        why:'$\\cos^{2}60^{\\circ}$.'}}],
    [{t:'note', kind:'def', head:'No-cloning', html:'CNOT copier on $|0\\rangle|0\\rangle$. Succeed?',
      ask:{key:'m5-qc11', choices:['Yes','No','Only half'], answer:0,
        why:'Basis states copy fine.'}}]
  ]}
]},

/* ---------------------------------------------------------------- 5.7.1 -- */
{ id:'m5-synth', module:'M5', nav:'Summary', title:'Summary',
  objective:'Collect what this chapter added and the errors it exists to prevent.',
  keywords:'summary module 5 review circuit depth shots transpilation teleportation grover resource claim query runtime overshoot',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Summary'},
  {t:'title', text:'Summary'},
  {t:'fig', frame:true, svg:()=>figLadder(),
    caption:'The chapter as one ladder. A protocol is worth nothing until its cost has been stated in a form somebody else can check.'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'The machine', items:[
      {t:'small', html:'Prepare $|0\\rangle^{\\otimes n}$, apply gates from a fixed set, measure, repeat. Depth is layers and is what a coherence time is spent against; the gate count is not. $q_{0}$ is the top wire and the last digit of the ket.'}]}],
    [{t:'card', head:'Running it', items:[
      {t:'small', html:'A state vector costs $16\\cdot2^{n}$ bytes. Sampling error shrinks as $1/\\sqrt N$; device error does not. A logical qubit is an encoded block, and correction expands space and time.'}]}],
    [{t:'card', head:'Teleportation', items:[
      {t:'small', html:'A network spends one distributed pair and two classical bits to move a state between nodes. Bob has $I/2$ before the bits arrive, so the protocol cannot signal faster than light.'}]}],
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
{ id:'m5-shapes', module:'M5', nav:'Question Types', title:'Question Types',
  objective:'Name the recurring question types of chapter 5 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice circuit depth shots teleportation grover resource claim',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 5 · Summary and practice'},
  {t:'title', text:'Question Types'},
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
