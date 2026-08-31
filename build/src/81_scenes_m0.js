/* ==========================================================================
   Module 0 — The frame of the course.

   It carries no examinable method and therefore no question section: nothing
   here is on a paper, and everything here is needed to read the rest.

   The module has one job that the rest of the course cannot do for itself. A
   student arrives having been told that a quantum computer tries every answer
   at once, and every later scene is harder to read while that sentence is
   still believed. So the frame states the honest version early: the state
   space is large, only one string of it is ever read out, and the whole art is
   arranging the phases so that the string which is read is the one that was
   wanted.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

/* The six modules on a circle around the question they all answer. A list
   would say the same thing and would imply an order the course does not quite
   have — modules 1 to 4 build one object in four passes, and the ring shows
   that better than a column of numbers. */
function figMap(){
  const R = 0.95;
  /* The ring is drawn inside a wider frame than the circle needs, because the
     labels beside it are the chapter titles rather than short tags. Each title
     is centred over its point rather than run outwards from it: centred, a
     title spends half its width on each side, so a font that measures wider
     than this one does cannot push it off the frame. */
  const a = P.Axes({w:570,h:416,xr:[-2.24,2.24],yr:[-1.6,1.6],
    pad:{l:12,r:12,t:12,b:12}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const items = [
    ['1', 'The mathematics of states', C.in],
    ['2', 'Measurement and dynamics',  C.out],
    ['3', 'Mixed states, entanglement',C.h],
    ['4', 'The Bloch sphere and gates',C.err],
    ['5', 'Circuits and protocols',    C.in],
    ['6', 'Quantum algorithms',        C.out]
  ];
  items.forEach((it,i)=>{
    const th = Math.PI/2 - i*2*Math.PI/6;
    const x = R*Math.cos(th), y = R*Math.sin(th);
    a.poly([[0,0],[x*0.74,y*0.74]], {color:C.grid, width:1.2});
    a.point(x, y, {color:it[2], r:18});
    /* The number, so the ring and the cards beside it can be matched without
       reading a label twice. */
    a.note(x, y - 0.062, it[0], {fs:17, color:C.plate, anchor:'middle'});
    /* The title sits outside the point, clear of it above or below depending
       on which half of the ring the point is in. No point of a six-point ring
       lies on the horizontal axis, so there is no third case. */
    const out = 1.28;
    a.note(x*out, y*out + (y > 0 ? 0.24 : -0.24), it[1],
      {fs:12.5, color:C.muted, anchor:'middle'});
  });
  a.point(0, 0, {color:C.ink, r:5});
  a.note(0, -0.22, 'one question', {fs:12.5, color:C.muted, anchor:'middle'});
  return a.svg();
}

/* Where the machine sits. The picture that has to replace "a faster computer"
   in a reader's head is a coprocessor on the end of a loop, which is what
   every quantum program written today actually is. */
function figCoprocessor(){
  return P.blocks({w:760,h:198,items:[
    {t:'box',x:40,y:62,w:180,h:70,label:'Classical computer',fs:14},
    {t:'arrow',x1:220,y1:84,x2:330,y2:84},
    {t:'box',x:330,y:44,w:190,h:106,label:'Quantum processor',fs:14},
    {t:'arrow',x1:520,y1:126,x2:610,y2:126},
    {t:'box',x:610,y:100,w:120,h:52,label:'counts',fs:14},
    /* The return path is routed above everything rather than level with the
       processor box: drawn at the box's own top edge it read as part of the
       box instead of as a wire leaving the counts. */
    {t:'line',d:'M670,100 v-80 h-560 v6'},
    {t:'arrow',x1:110,y1:26,x2:110,y2:60},
    {t:'text',x:275,y:70,label:'\\text{a circuit}',tex:true,fs:14},
    {t:'text',x:670,y:180,label:'one bit string a shot',fs:12},
    {t:'text',x:425,y:174,label:'prepares, transforms, measures',fs:12},
    {t:'text',x:130,y:158,label:'writes the circuit, reads the statistics',fs:12}
  ]});
}

/* The memory a dense classical description of n qubits needs, drawn as its
   own logarithm because the quantity itself cannot be drawn: at n = 50 it is
   already eighteen petabytes, and a linear axis carrying that shows one
   vertical line and nothing else.

   Two horizontal marks give the curve a meaning a reader can hold: a laptop
   and a large supercomputer. They are drawn from the same formula as the
   curve, so the crossings are where they are because of the arithmetic and not
   because of where the label fitted. */
function figMemory(){
  const a = P.Axes({w:520,h:320,xr:[0,60],yr:[0,20],
    xlabel:'n\\;(\\text{qubits})', ylabel:'\\log_{10}(\\text{bytes})',
    pad:{l:66,r:24,t:26,b:46}, xtarget:6, ytarget:5});
  a.curve(n => Math.log10(16) + n*Math.log10(2), {color:C.in, width:2.4});
  /* 16 GB and 1 PB, as decimal powers so the line and the curve are in the
     same units. */
  a.hline(Math.log10(16e9), {color:C.muted, width:1.3, dash:'4 4'});
  a.hline(Math.log10(1e15), {color:C.muted, width:1.3, dash:'4 4'});
  a.note(2.0, Math.log10(16e9) + 0.7, '16 GB — a laptop', {fs:12.5, color:C.muted});
  a.note(2.0, Math.log10(1e15) + 0.7, '1 PB — a large machine', {fs:12.5, color:C.muted});
  a.point(30, Math.log10(16) + 30*Math.log10(2), {color:C.h, r:6});
  a.point(46, Math.log10(16) + 46*Math.log10(2), {color:C.h, r:6});
  a.note(31.5, Math.log10(16) + 30*Math.log10(2) - 1.5, 'n=30', {fs:12.5, color:C.h, tex:true});
  a.note(47.5, Math.log10(16) + 46*Math.log10(2) - 1.5, 'n=46', {fs:12.5, color:C.h, tex:true});
  return a.svg();
}

/* The three-gate interferometer, and the probability it produces. Drawn from
   the same expression the scene derives, so the picture cannot disagree with
   the algebra beside it. */
function figInterferometer(){
  return P.blocks({w:640,h:150,items:[
    {t:'line',d:'M40,75 h520'},
    {t:'box',x:120,y:48,w:56,h:54,label:'H',tex:true,fs:16},
    {t:'box',x:270,y:48,w:104,h:54,label:'R_z(\\varphi)',tex:true,fs:15},
    {t:'box',x:456,y:48,w:56,h:54,label:'H',tex:true,fs:16},
    {t:'text',x:70,y:60,label:'|0\\rangle',tex:true,fs:16},
    {t:'text',x:225,y:60,label:'|+\\rangle',tex:true,fs:16},
    {t:'text',x:545,y:60,label:'measure',fs:12}
  ]});
}
function figFringe(){
  const a = P.Axes({w:520,h:280,xr:[0,4*Math.PI],yr:[0,1.12],
    xlabel:'\\varphi', ylabel:'P(0)',
    pad:{l:60,r:24,t:24,b:46}, xtarget:5, ytarget:5});
  a.curve(v => Math.cos(v/2)**2, {color:C.in, width:2.4});
  return a.svg();
}

/* ---- pictograms for the how-to-read strip ----
   Four small emblems, one per habit the reader needs. Each is a shape, not a
   diagram: it marks the card the way an icon marks a control. */
function mini(w,h,xr,yr){ return P.Axes({w:w,h:h,xr:xr,yr:yr,pad:{l:10,r:10,t:8,b:8},
  xticksOverride:[], yticksOverride:[], grid:false, zeroAxes:false, arrows:false}); }
function icoSteps(){
  const a = mini(300,64,[0,10],[-1.2,1.2]);
  a.point(2,0,{color:C.ink,r:6}); a.point(5,0,{color:C.ink,r:6});
  a.point(8,0,{color:C.grid,r:6});
  a.poly([[2.8,0],[4.2,0]],{color:C.grid,width:1.6});
  a.poly([[5.8,0],[7.2,0]],{color:C.grid,width:1.6});
  return a.svg();
}
function icoLab(){
  const a = mini(300,64,[0,10],[-1.4,1.4]);
  a.poly([[1,0.6],[9,0.6]],{color:C.grid,width:2});
  a.point(6.2,0.6,{color:C.h,r:6});
  a.poly([[1,-0.7],[9,-0.7]],{color:C.grid,width:2});
  a.point(3.4,-0.7,{color:C.h,r:6});
  return a.svg();
}
function icoModes(){
  const a = mini(300,64,[0,10],[-1.2,1.2]);
  [[0.8,C.dec.in],[3.1,C.dec.out],[5.4,C.dec.mid],[7.7,C.dec.h]].forEach(([x,f])=>
    a.rect(x,-0.85,x+1.6,0.85,{fill:f}));
  return a.svg();
}
/* The mark of the course, at pictogram size: a ball with an equator and one
   state on it. */
function icoBloch(){
  const a = mini(300,64,[-3,3],[-1.25,1.25]);
  const ring=[]; for(let i=0;i<=120;i++){ const t=2*Math.PI*i/120; ring.push([1.1*Math.cos(t),1.1*Math.sin(t)]); }
  a.poly(ring,{color:C.grid,width:1.6});
  const eq=[]; for(let i=0;i<=120;i++){ const t=2*Math.PI*i/120; eq.push([1.1*Math.cos(t),0.38*Math.sin(t)]); }
  a.poly(eq,{color:C.grid,width:1.2});
  a.poly([[0,0],[0.72,0.83]],{color:C.in,width:2.2});
  a.point(0.72,0.83,{color:C.in,r:5});
  return a.svg();
}

const SC = [

/* The cover takes no address. It is the one scene in the artifact that does
   not, and the way that is marked is by leaving it out of `CONTENT.SECTIONS`
   entirely: an address is derived only for a scene that is declared there. */
{ id:'title', module:'M0', nav:'Title', title:'Quantum Computing',
  keywords:'title cover version', steps:0, blocks:[
  {t:'stack', style:'justify-content:center;flex:1;align-items:flex-start', items:[
    {t:'eyebrow', text:'Quantum Computing'},
    {t:'title', level:1, text:'Quantum Computing'},
    {t:'lede', text:'A quantum computer holds a state that a classical description cannot write down, transforms it with operations that never look at it, and then reads out one string of bits. The course is the study of what can be arranged in between, and of what the reading out costs.'},
    {t:'small', html:'Seven modules, with laboratories and worked practice questions throughout. Every figure is drawn from the mathematics beside it, and every number is checked by a program that computes it a second way.'}
  ]}
]},

/* ---------------------------------------------------------------- 0.1 ---- */
{ id:'m0-open', module:'M0', nav:'What the course asks', title:'One question, asked in six ways',
  objective:'State the question the whole course answers before any machinery is introduced.',
  keywords:'opening quantum advantage coprocessor amplitude phase interference measurement',
  src:'L0 · why quantum engineering', steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · The frame of the course'},
  {t:'title', text:'One question, asked in six ways'},
  {t:'lede', text:'A quantum processor is handed a circuit. It prepares a state, transforms it without ever reading it, and returns one string of bits. Everything in this course is one of three things: a way of describing that state, a way of transforming it, or a way of arranging the transformation so that the string which comes back is the one that was wanted.'},
  {t:'fig', frame:true, svg:()=>figCoprocessor(),
    caption:'Where the machine sits. A classical computer writes the circuit and collects the statistics; the quantum processor runs it and returns one bit string per shot. Nothing in this course is a picture of a quantum computer replacing the box on the left.'},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:3, gap:'22px', items:[
      [{t:'card', head:'What is held', items:[
        {t:'small', html:'A state of $n$ qubits carries $2^n$ complex amplitudes. Writing that down, and knowing what of it is physical, is Modules 1, 2 and 3.'}]}],
      [{t:'card', head:'What is done to it', items:[
        {t:'small', html:'Unitary operations, which move amplitude between basis states without ever measuring it. That is Modules 4 and 5.'}]}],
      [{t:'card', head:'What comes out', items:[
        {t:'small', html:'One string of $n$ bits, with a probability given by one amplitude. Arranging for the right string to be likely is Module 6.'}]}]
    ]}
  ]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'ok', head:'The sentence the course keeps returning to', html:'<b>The state is large, the readout is small, and the whole art is interference.</b> A measurement returns $n$ bits, not $2^n$ amplitudes, so an algorithm earns nothing by holding many amplitudes unless it can make the unwanted ones cancel before the readout. If one sentence survives the term, it should be this one.'}
  ]}
]},

/* ---------------------------------------------------------------- 0.2 ---- */
{ id:'m0-what', module:'M0', nav:'What it is for', title:'What a quantum computer is for',
  objective:'Give the honest scope of the machine, and the shape of a defensible advantage claim.',
  keywords:'quantum advantage claim coprocessor simulation cannot replace classical baseline resources',
  src:'L0 · quantum computers do not replace classical computers', steps:3, blocks:[
  {t:'eyebrow', text:'Module 0 · The frame of the course'},
  {t:'title', text:'What a quantum computer is for'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A classical computer is the right machine for almost everything: mail, databases, graphics, control, and most of scientific computing. The reason to build a quantum one is narrower and it is physical. Molecules, spins, electrons and light <b>are</b> quantum systems. Their states are complex amplitudes, and a general many-body state has too many of them to write down.</p>'},
    {t:'body', html:'<p>So the machine is best read as a <b>specialised coprocessor</b>. It earns its place on a task only when three things hold together.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Three conditions, and all three are needed', html:'<b>One.</b> The problem has structure a quantum algorithm can use. <b>Two.</b> That algorithm reaches the answer with fewer of some named resource than the best classical method. <b>Three.</b> The full cost — loading the input, correcting errors, repeating the circuit, moving the data — does not eat the difference.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Where claims go wrong', html:'Almost every overstated claim drops the third condition. A query count is not a runtime: an oracle that costs one query may cost ten thousand gates to build, and a circuit that runs in a microsecond may need a million shots. This course counts the gates and the shots as well as the queries.'}
    ]}
  ], right:[
    {t:'grid', cols:2, gap:'18px', items:[
      [{t:'card', head:'It can, in principle', items:[
        {t:'small', html:'Simulate selected quantum systems in their own language. Give proven asymptotic advantages on specific mathematical problems. Use interference and entanglement as resources. Sit inside a hybrid workflow as an accelerator.'}]}],
      [{t:'card', head:'It does not', items:[
        {t:'small', html:'Replace a classical computer for ordinary work. Make every search or optimisation easy. Reveal all $2^n$ amplitudes in one measurement. Repair a poor model, biased data, or an ill-posed question.'}]}]
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The shape of a claim worth making', html:'<b>For this task, this input model, this accuracy and this hardware model, this quantum procedure uses fewer of this named resource than the best relevant classical alternative.</b> A claim missing any one of those five is not yet a claim. Every comparison in this course is written in that form.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 0.3 ---- */
{ id:'m0-scale', module:'M0', nav:'The size of the state', title:'The size of the state, and why size alone buys nothing',
  objective:'Compute the classical memory a dense n-qubit state needs, and separate that from a speedup claim.',
  keywords:'state space scaling exponential memory statevector simulation not automatic speedup structure',
  src:'L0 · the state-space scaling challenge', steps:3, blocks:[
  {t:'eyebrow', text:'Module 0 · The frame of the course'},
  {t:'title', text:'The size of the state, and why size alone buys nothing'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A classical bit holds one definite value. A qubit is described by two complex amplitudes, and $n$ qubits by one amplitude for every basis string:</p>'},
    {t:'eq', key:true, tex:'N_{\\mathrm{amp}} = 2^{n}'},
    {t:'body', html:'<p>Store each amplitude as two double-precision numbers — sixteen bytes — and the state vector alone occupies</p>'},
    {t:'eq', tex:'M_{\\mathrm{bytes}} = 16 \\times 2^{n}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'That is the state vector and nothing else. A simulator also needs temporaries, operators and buffers, and a dense $2^n\\times 2^n$ operator holds $4^n$ complex entries — at thirty qubits that operator is already beyond any machine, while the state vector is still sixteen gigabytes.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The mistake this scene exists to stop', html:'The exponential is a statement about <b>a generic dense classical description</b>. It is not a proof that the physics is hard. Classical methods exploit locality, symmetry, sparsity, low entanglement, stabilizer structure and tensor-network compressibility, and a great many quantum states fall to one of them. A state being big is not the same as a state being useful.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The test to apply instead', html:'Compare <b>end-to-end</b> resources for the best known classical and the best known quantum approach, at the same accuracy and the same success probability. That is the only comparison that survives contact with a real machine, and it is the one this course keeps making.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figMemory(),
      caption:'Memory for a dense state vector against the number of qubits, drawn as its own logarithm because the quantity itself cannot be drawn. Around thirty qubits it passes a laptop and around forty-six a very large machine. Each further qubit doubles it.'},
    {t:'small', html:'Read the curve as an argument about <b>storage</b>, not about difficulty. It says that writing the state down becomes impossible; it does not say that predicting a particular number about the state becomes impossible.'}
  ]}
]},

/* ---------------------------------------------------------------- 0.4 ---- */
{ id:'m0-phase', module:'M0', nav:'Phase becomes probability', title:'How a phase becomes something you can count',
  objective:'Follow the three-gate interferometer that turns a relative phase into a measurable population.',
  keywords:'interference relative phase hadamard rz interferometer ramsey probability cos squared sensing',
  src:'L0 · converting phase into a measurable probability', steps:4, blocks:[
  {t:'eyebrow', text:'Module 0 · The frame of the course'},
  {t:'title', text:'How a phase becomes something you can count'},
  {t:'lede', text:'A phase is not observable. A probability is. This scene is the smallest machine that turns one into the other, and every algorithm in Module 6 is a larger version of it.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Start in $|0\\rangle$ and apply three gates: a Hadamard, a rotation about $z$ by $\\varphi$, and a second Hadamard.</p>'},
    {t:'body', html:'<p>The first Hadamard makes two coherent alternatives of equal size:</p>'},
    {t:'eq', tex:'|0\\rangle \\;\\xrightarrow{\\;H\\;}\\; |+\\rangle = \\tfrac{1}{\\sqrt2}\\left(|0\\rangle + |1\\rangle\\right)'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The rotation leaves both sizes alone and puts an angle between them. Only the difference of the two phases can ever matter, so write it all on the second term:</p>'},
      {t:'eq', tex:'|+\\rangle \\;\\xrightarrow{\\;R_z(\\varphi)\\;}\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle + e^{i\\varphi}|1\\rangle\\right)'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<p>The second Hadamard sends $|0\\rangle\\mapsto(|0\\rangle+|1\\rangle)/\\sqrt2$ and $|1\\rangle\\mapsto(|0\\rangle-|1\\rangle)/\\sqrt2$. Substitute both and collect the two basis states:</p>'},
      {t:'eq', tex:'\\begin{aligned} \\tfrac{1}{\\sqrt2}\\left(|0\\rangle + e^{i\\varphi}|1\\rangle\\right) &\\;\\xrightarrow{\\;H\\;}\\; \\tfrac{1}{2}\\left(|0\\rangle+|1\\rangle\\right) + \\tfrac{e^{i\\varphi}}{2}\\left(|0\\rangle-|1\\rangle\\right) \\\\ &= \\tfrac{1+e^{i\\varphi}}{2}\\,|0\\rangle \\;+\\; \\tfrac{1-e^{i\\varphi}}{2}\\,|1\\rangle \\end{aligned}'},
      {t:'small', html:'The phase has left the exponent and become part of a <b>sum</b> of two amplitudes. That step is the whole mechanism, and it is why the gate had to be applied twice: once to split, once to recombine.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'body', html:'<p>Now take the squared modulus of the first amplitude. Writing $1+e^{i\\varphi} = e^{i\\varphi/2}\\left(e^{-i\\varphi/2}+e^{i\\varphi/2}\\right) = 2e^{i\\varphi/2}\\cos(\\varphi/2)$ makes the modulus immediate:</p>'},
      {t:'eq', key:true, tex:'P(0) = \\left|\\tfrac{1+e^{i\\varphi}}{2}\\right|^{2} = \\cos^{2}\\!\\left(\\tfrac{\\varphi}{2}\\right), \\qquad P(1) = \\sin^{2}\\!\\left(\\tfrac{\\varphi}{2}\\right)'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figInterferometer(),
      caption:'Split, phase, recombine. The first gate creates two alternatives, the middle gate puts an angle between them, and the last gate makes them add.'},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'Why this is the pattern to remember', html:'Every algorithm in Module 6 has this shape. Something is put into superposition, the problem writes a phase onto the branches, and a final transform makes the branches add where the answer is and cancel where it is not. Only the middle step ever changes.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 0.5 ----
   The fringe and the sensing reading are their own scene. Held together with
   the derivation the scene needed a scale of 0.82 to fit, which is the layout
   sweep saying what a reader would have said: that is two ideas. */
{ id:'m0-fringe', module:'M0', nav:'Reading the fringe', title:'Reading the fringe, and the same machine as a sensor',
  objective:'Read the interference curve as a measurement, and identify the phase source that turns it into a sensor.',
  keywords:'fringe interference curve ramsey sensing magnetometry coherence time shots estimate field',
  src:'L0 · why the same sequence is useful for sensing', steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · The frame of the course'},
  {t:'title', text:'Reading the fringe, and the same machine as a sensor'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The probability derived in the last scene is a curve in the applied phase:</p>'},
    {t:'eq', key:true, tex:'P(0)=\\cos^{2}\\!\\left(\\tfrac{\\varphi}{2}\\right)'},
    {t:'body', html:'<p>No single shot shows it. Each shot returns one bit, and the curve appears only as the fraction of zeros over many repetitions. With $N$ shots that fraction carries a standard error of about $\\sqrt{P(1-P)/N}$, so resolving a fringe to one part in a hundred costs of order ten thousand shots.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The same machine is a sensor', html:'Let the phase be written by a field rather than by a gate, $\\varphi=\\gamma B t$, where $\\gamma$ is a coupling and $t$ the time the state was exposed. Reading the fringe now estimates $B$. Nothing about the circuit changed: only the origin of the phase did.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'And where it stops', html:'Waiting longer accumulates more phase and sharpens the estimate — but only while the state stays coherent. Past that, the fringe flattens and the extra time buys nothing. Sensitivity is therefore a balance of coupling, coherence time, readout fidelity and the number of shots, and no part of it can be improved alone.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figFringe(),
      caption:'The probability of reading zero, against the phase that was applied. A quantity that could not be measured has become a curve that can be, one shot at a time.'}
  ]}
]},

/* ---------------------------------------------------------------- 0.5 ---- */
{ id:'m0-map', module:'M0', nav:'The course map', title:'What is in the six modules',
  objective:'Give the shape of the course and how the modules depend on each other.',
  keywords:'course map modules overview structure dependencies linear algebra measurement entanglement gates circuits algorithms',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · The frame of the course'},
  {t:'title', text:'What is in the six modules'},
  {t:'cols', ratio:'c-5-7', vcenter:true, left:[
    {t:'fig', frame:true, svg:()=>figMap(),
      caption:'The six modules and the one question at the centre of them. Modules 1 to 4 build a single object in four passes: the state, what can be asked of it, what happens when it is not alone, and how it is moved.'}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'card', head:'1 · The mathematics of quantum states', items:[
        {t:'small', html:'Complex vectors, inner and outer products, projectors, tensor products, and the Hermitian and unitary operators that act on them. Dirac notation, introduced as a way of writing what is already there.'}]}],
      [{t:'card', head:'2 · States, measurement and dynamics', items:[
        {t:'small', html:'The Born rule, projective measurement and the more general kind, expectation values, the uncertainty relation, and evolution under a Hamiltonian. What a shot is, and what a shot costs.'}]}],
      [{t:'card', head:'3 · Mixed states and entanglement', items:[
        {t:'small', html:'The density operator, quantum channels, relaxation and dephasing, the partial trace, the Schmidt decomposition, and the Bell correlations no classical model reproduces.'}]}],
      [{t:'card', head:'4 · The Bloch sphere and quantum gates', items:[
        {t:'small', html:'One qubit drawn as a ball, every single-qubit gate as a rotation of it, the two-qubit gates that entangle, and the bit-order conventions that silently break results.'}]}],
      [{t:'card', head:'5 · Circuits and protocols', items:[
        {t:'small', html:'The circuit model as it is actually run: transpilation, shots, depth. Then teleportation and Grover search, each worked from the algebra to the resource count.'}]}],
      [{t:'card', head:'6 · Quantum algorithms', items:[
        {t:'small', html:'Phase kickback, Deutsch–Jozsa, the quantum Fourier transform, phase estimation, and the order finding at the heart of factoring — with the cost of each written out honestly.'}]}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'What depends on what', html:'Module 1 is the language and everything uses it. Modules 2 and 4 should be read in order and not sampled; Module 3 can wait until after 4 if the algebra of one qubit is not yet comfortable. Module 6 rests on 5, and 5 on 4.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Laboratories and worked questions', html:'Each module carries laboratories, where every control changes the mathematics rather than the picture, and practice questions whose solutions are worked rather than stated. Each module names the shapes of question it sets before it starts.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 0.6 ---- */
{ id:'m0-how', module:'M0', nav:'How to read this', title:'How to read this, and where the numbers come from',
  objective:'Explain the reveal, the laboratories, the editions and the textbook anchor convention.',
  keywords:'how to read reveal steps laboratories editions anchors textbook convention notation bit order',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 0 · The frame of the course'},
  {t:'title', text:'How to read this, and where the numbers come from'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'Scenes build in steps', items:[
      {t:'fig', svg:icoSteps},
      {t:'small', html:'Space or the right arrow takes the next step. Pause at each one: a question is worth answering before its answer appears.'}
    ]}],
    [{t:'card', head:'The laboratories are live', items:[
      {t:'fig', svg:icoLab},
      {t:'small', html:'Every control changes the mathematics, not the drawing. The numbers beside a figure are recomputed the moment a control moves.'}
    ]}],
    [{t:'card', head:'Four ways to read it', items:[
      {t:'fig', svg:icoModes},
      {t:'small', html:'<b>Normal</b>, <b>lecture</b>, <b>self-study</b>, and <b>student</b> or <b>instructor</b>. The controls are along the top, and the choice is remembered.'}
    ]}],
    [{t:'card', head:'The conventions are fixed', items:[
      {t:'fig', svg:icoBloch},
      {t:'small', html:'Qubits are ordered $|q_{n-1}\\ldots q_0\\rangle$; a global phase is not physical and a relative one is; $\\hbar=1$. The notation panel repeats all of them.'}
    ]}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:2, gap:'24px', items:[
      [{t:'note', kind:'def', head:'Where the textbook is', html:'Most scenes carry a small chip beside their address, such as <b>NC CH2.2.5</b>, pointing into the course textbook; the marker says the address belongs to the book and not to this artifact. The two numbering systems agree nowhere, so the marker is never dropped. A scene with no chip is one the textbook does not cover in that form.'}],
      [{t:'note', kind:'ok', head:'And where the numbers come from', html:'Every number stated in a scene or a solution is recomputed by a separate program that reaches it a different way. Gate identities are checked against matrix arithmetic, probabilities against sampling, and every entangled state against its own partial trace.'}]
    ]},
    {t:'small', html:CONTENT.META.adapted}
  ]}
]}

];

window.SCENES_M0 = SC;
})();
