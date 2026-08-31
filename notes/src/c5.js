/* Course notes — Chapter 5.

   The reading edition of the artifact's chapter 5. It says the same things in
   the same order and is not a transcript: a scene builds in reveal steps and a
   page does not, so an argument that arrives in four steps on screen arrives
   here as one paragraph with the same intermediate lines shown.

   Two figures here carry an angle and both are drawn in an isotropic frame —
   the same number of pixels to the unit on both axes, with the ratio written
   in the comment above each. The amplitude-amplification plane is the one
   where it matters, because the claim the whole section makes is that one
   iteration turns the state by exactly two theta.

   Circuit drawings follow the same rules as chapter 4's: a control is a filled
   dot, a target is an open circle with a cross in it, and a classical wire is
   two hairlines. A control drawn as an open circle is drawn as a target. */
(function(){
const P=PLOT, C=P.COL;
const D2R=Math.PI/180;

/* ---- the circuit kit ---------------------------------------------------- */
const wire=(y,x0,x1,col)=>({t:'line',d:`M${x0},${y} H${x1}`,color:col||C.rule});
const cwire=(y,x0,x1)=>[{t:'line',d:`M${x0},${y-2} H${x1}`,color:C.out},
                        {t:'line',d:`M${x0},${y+2} H${x1}`,color:C.out}];
const gate=(x,y,label,tex,w,col)=>({t:'box',x:x-(w||32)/2,y:y-16,w:w||32,h:32,
  label,tex:!!tex,fs:14,color:col||C.h});
const ctrl=(x,y,col)=>({t:'dot',x,y,r:6,color:col||C.h});
const targ=(x,y,col)=>{ const k=col||C.h; return [
  {t:'line',d:`M${x-12},${y} a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0`,color:k},
  {t:'line',d:`M${x},${y-12} V${y+12}`,color:k},
  {t:'line',d:`M${x-12},${y} H${x+12}`,color:k}]; };
const meter=(x,y)=>({t:'box',x:x-22,y:y-16,w:44,h:32,label:'measure',fs:10.5,
  color:C.out});

/* Three qubits, four gates, and the layer boundaries drawn so that the depth
   and the gate count can be counted apart. */
function circuit(){
  const items=[
    wire(46,86,440), wire(104,86,440), wire(162,86,440),
    {t:'text',x:74,y:51,anchor:'end',label:'q_{0}',tex:true,fs:13},
    {t:'text',x:74,y:109,anchor:'end',label:'q_{1}',tex:true,fs:13},
    {t:'text',x:74,y:167,anchor:'end',label:'q_{2}',tex:true,fs:13},
    gate(134,46,'H',true),
    {t:'line',d:'M228,46 V104',color:C.h}, ctrl(228,46)
  ].concat(targ(228,104)).concat([
    {t:'line',d:'M322,104 V162',color:C.h}, ctrl(322,104)
  ]).concat(targ(322,162)).concat([
    /* The last gate sits on q2. On q0 it would be free to run beside the
       second CNOT, which would make the depth three and the caption false. */
    gate(406,162,'T',true),
    {t:'line',d:'M182,24 V194',color:C.rule},
    {t:'line',d:'M276,24 V194',color:C.rule},
    {t:'line',d:'M366,24 V194',color:C.rule},
    {t:'text',x:590,y:60,anchor:'middle',label:'4 gates',fs:14,color:C.mid},
    {t:'text',x:590,y:88,anchor:'middle',label:'depth 4',fs:14,color:C.out},
    {t:'text',x:590,y:130,anchor:'middle',label:'two counts, equal here',fs:12},
    {t:'text',x:590,y:152,anchor:'middle',label:'only by accident',fs:12}
  ]);
  return P.blocks({w:720,h:210,items});
}

/* One state, two circuits: the same gate count and a different depth. The
   tree's last two CNOTs touch four different qubits, so they run together, and
   the two faint rules are what say so. */
function depth(){
  const items=[];
  const Y=[34,70,106,142];
  const name=(x,i)=>({t:'text',x,y:Y[i]+5,anchor:'end',label:'q_{'+i+'}',tex:true,fs:12});
  Y.forEach((y,i)=>{ items.push(wire(y,78,240)); items.push(name(68,i)); });
  items.push({t:'text',x:160,y:16,label:'the chain',fs:12.5,color:C.in});
  items.push(gate(104,Y[0],'H',true));
  items.push({t:'line',d:`M142,${Y[0]} V${Y[1]}`,color:C.h}, ctrl(142,Y[0]));
  targ(142,Y[1]).forEach(o=>items.push(o));
  items.push({t:'line',d:`M180,${Y[1]} V${Y[2]}`,color:C.h}, ctrl(180,Y[1]));
  targ(180,Y[2]).forEach(o=>items.push(o));
  items.push({t:'line',d:`M218,${Y[2]} V${Y[3]}`,color:C.h}, ctrl(218,Y[2]));
  targ(218,Y[3]).forEach(o=>items.push(o));
  items.push({t:'text',x:160,y:196,label:'4 gates, depth 4',fs:12.5});
  Y.forEach((y,i)=>{ items.push(wire(y,438,646)); items.push(name(428,i)); });
  items.push({t:'text',x:544,y:16,label:'the tree',fs:12.5,color:C.out});
  items.push(gate(466,Y[0],'H',true));
  items.push({t:'line',d:`M504,${Y[0]} V${Y[1]}`,color:C.h}, ctrl(504,Y[0]));
  targ(504,Y[1]).forEach(o=>items.push(o));
  items.push({t:'line',d:'M532,18 V164',color:C.rule});
  items.push({t:'line',d:'M636,18 V164',color:C.rule});
  items.push({t:'line',d:`M564,${Y[0]} V${Y[2]}`,color:C.h}, ctrl(564,Y[0]));
  targ(564,Y[2]).forEach(o=>items.push(o));
  items.push({t:'line',d:`M606,${Y[1]} V${Y[3]}`,color:C.h}, ctrl(606,Y[1]));
  targ(606,Y[3]).forEach(o=>items.push(o));
  items.push({t:'text',x:584,y:180,label:'one layer',fs:11.5,color:C.out});
  items.push({t:'text',x:544,y:196,label:'4 gates, depth 3',fs:12.5});
  return P.blocks({w:720,h:210,items});
}

/* What one exact state vector costs, against the qubit count. */
function statecost(){
  const a=P.Axes({w:540,h:270,xr:[0,60],yr:[0,19],
    xlabel:'n\\,(\\text{qubits})', ylabel:'\\text{bytes stored}',
    pad:{l:76,r:26,t:28,b:46}, xtarget:6,
    yticksOverride:P.decades(0,19).filter(v=>v%3===0), ytickfmt:P.decade});
  a.curve(n=>Math.log10(16)+n*Math.log10(2),{color:C.in,width:2.4});
  a.hline(Math.log10(16e9),{color:C.rule,width:1.2,dash:'4 4'});
  a.note(2,10.7,'16\\text{ GB}',{fs:12,color:C.muted,tex:true});
  a.point(30,Math.log10(16)+30*Math.log10(2),{color:C.h,r:5.5});
  a.note(33,8.2,'n=30',{fs:12,color:C.h,anchor:'start',tex:true});
  a.point(50,Math.log10(16)+50*Math.log10(2),{color:C.err,r:5.5});
  a.note(52,13.8,'n=50',{fs:12,color:C.err,anchor:'start',tex:true});
  return a.svg();
}

/* The teleportation circuit, whole. */
function tele(){
  const Y0=42, Y1=106, Y2=170;
  const items=[
    wire(Y0,146,690), wire(Y1,146,690), wire(Y2,146,690),
    {t:'text',x:138,y:Y0+5,anchor:'end',label:'q_{0}:\\;|\\psi\\rangle',tex:true,fs:13},
    {t:'text',x:138,y:Y1+5,anchor:'end',label:'q_{1}:\\;|0\\rangle',tex:true,fs:13},
    {t:'text',x:138,y:Y2+5,anchor:'end',label:'q_{2}:\\;|0\\rangle',tex:true,fs:13},
    gate(196,Y1,'H',true),
    {t:'line',d:`M244,${Y1} V${Y2}`,color:C.h}, ctrl(244,Y1)
  ].concat(targ(244,Y2)).concat([
    {t:'line',d:`M320,${Y0} V${Y1}`,color:C.h}, ctrl(320,Y0)
  ]).concat(targ(320,Y1)).concat([
    gate(378,Y0,'H',true), meter(440,Y0), meter(440,Y1)
  /* m1, from q1, chooses the X; m0, from q0, chooses the Z, and the X is
     applied first. Crossing these two wires produces a circuit that repairs
     one branch in four and looks entirely reasonable. */
  ]).concat(cwire(Y1,462,540)).concat(cwire(Y0,462,608)).concat([
    {t:'line',d:`M540,${Y1} V${Y2}`,color:C.out},
    {t:'line',d:`M608,${Y0} V${Y2}`,color:C.out},
    gate(540,Y2,'X',true,32,C.out),
    gate(608,Y2,'Z',true,32,C.out),
    {t:'text',x:220,y:216,label:'one shared pair',fs:12},
    {t:'text',x:350,y:216,label:'Bell-basis rotation',fs:12},
    {t:'text',x:440,y:216,label:'two bits',fs:12},
    {t:'text',x:610,y:216,label:'the correction they choose',fs:12}
  ]);
  return P.blocks({w:720,h:230,items});
}

/* Amplitude amplification, drawn where it happens. Isotropic: 372 px over an
   x span of 2.325 and 216 px over a y span of 1.35, both exactly 160 px to
   the unit, so the turn of 2 theta is drawn at its true size. */
function geom(){
  const a=P.Axes({w:500,h:280,xr:[-0.30,2.025],yr:[-0.32,1.03],
    pad:{l:32,r:96,t:32,b:32},xticksOverride:[],yticksOverride:[],
    grid:false,zeroAxes:false,arrows:false});
  const th=22*D2R;
  a.poly([[0,0],[1.05,0]],{color:C.rule,width:1.3});
  a.poly([[0,0],[0,1.00]],{color:C.rule,width:1.3});
  a.note(1.07,0,'|B\\rangle',{fs:12.5,color:C.muted,dy:5,tex:true});
  a.note(0,1.02,'|G\\rangle',{fs:12.5,color:C.muted,anchor:'middle',tex:true});
  const arc=[]; for(let i=0;i<=90;i++){ const s=Math.PI/2*i/90;
    arc.push([Math.cos(s),Math.sin(s)]); }
  a.poly(arc,{color:C.grid,width:1.1,dash:'3 4'});
  a.poly([[0,0],[Math.cos(th),Math.sin(th)]],{color:C.in,width:2.4});
  a.point(Math.cos(th),Math.sin(th),{color:C.in,r:5.5});
  a.note(Math.cos(th),Math.sin(th),'|s\\rangle',{fs:13,color:C.in,dx:9,dy:-6,tex:true});
  a.poly([[0,0],[Math.cos(th),-Math.sin(th)]],{color:C.h,width:2.0});
  a.point(Math.cos(th),-Math.sin(th),{color:C.h,r:5});
  a.note(Math.cos(th),-Math.sin(th),'O_{f}|s\\rangle',{fs:12,color:C.h,dx:9,dy:14,tex:true});
  const t3=3*th;
  a.poly([[0,0],[Math.cos(t3),Math.sin(t3)]],{color:C.out,width:2.4});
  a.point(Math.cos(t3),Math.sin(t3),{color:C.out,r:5.5});
  a.note(Math.cos(t3),Math.sin(t3),'DO_{f}|s\\rangle',{fs:12,color:C.out,dx:9,dy:-6,tex:true});
  const a1=[]; for(let i=0;i<=30;i++){ const s=th*i/30;
    a1.push([0.40*Math.cos(s),0.40*Math.sin(s)]); }
  a.poly(a1,{color:C.in,width:1.5});
  a.note(0.44,0.05,'\\theta',{fs:12.5,color:C.in,tex:true});
  const a2=[]; for(let i=0;i<=30;i++){ const s=th+2*th*i/30;
    a2.push([0.62*Math.cos(s),0.62*Math.sin(s)]); }
  a.poly(a2,{color:C.out,width:1.7});
  a.note(0.60,0.36,'2\\theta',{fs:12.5,color:C.out,tex:true});
  return a.svg();
}

/* The success probability against the iteration count, with the optimum and
   the overshoot on the same axes. The vertical range reaches past one so that
   every name sits in a band no probability can enter. */
function iter(){
  const th=Math.asin(Math.sqrt(1/1024));
  const a=P.Axes({w:540,h:290,xr:[0,60],yr:[0,1.36],
    xlabel:'r\\,(\\text{iterations})', ylabel:'P_{\\text{good}}',
    pad:{l:68,r:26,t:28,b:46}, xtarget:6,
    yticksOverride:[0,0.25,0.5,0.75,1]});
  a.curve(r=>Math.sin((2*r+1)*th)**2,{color:C.in,width:2.2,n:600});
  a.point(25,Math.sin(51*th)**2,{color:C.out,r:6});
  a.note(25,1.14,'r=25:\\;0.9995',{fs:12,color:C.out,anchor:'middle',tex:true});
  a.point(50,Math.sin(101*th)**2,{color:C.err,r:6});
  a.note(50,0.30,'r=50:\\;0.0002',{fs:12,color:C.err,anchor:'middle',tex:true});
  a.vline(25,{color:C.rule,width:1.2,dash:'3 4'});
  a.note(1,1.28,'N=1024,\\;M=1',{fs:12.5,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* The five things a resource claim has to name. */
function claim(){
  const rows=[['task','what exactly is to be produced, and from what'],
              ['input model','how the data is reached: a query, a list, a formula'],
              ['accuracy','with what probability, and to what error'],
              ['hardware model','how many qubits, how connected, how noisy'],
              ['baseline','the best classical algorithm for the same task']];
  const items=[];
  rows.forEach(([k,v],i)=>{
    const y=18+i*38;
    items.push({t:'box',x:28,y,w:142,h:30,label:k,fs:12.5,color:i===4?C.err:C.h});
    items.push({t:'text',x:186,y:y+20,anchor:'start',label:v,fs:12.5});
  });
  return P.blocks({w:720,h:206,items});
}

window.C5 = [

{t:'page'},

/* ---------------- chapter 5 ---------------- */
{t:'h1', num:'5', text:'Circuits and protocols'},

{t:'p', lead:true, text:'Chapter 4 finished the gates, and nothing new about quantum mechanics is needed after it. What is still missing is everything about running the gates: what a circuit is as an object, what a machine gives back when it runs one, what a compiler does to it first, and how to say honestly what any of it cost.'},

{t:'p', text:'Three objects get confused with each other, and keeping them apart is most of this chapter. A <b>circuit</b> is a program: wires, gates, and the order they run in. A <b>run</b> is a physical experiment, repeated. The <b>result</b> is a table of bit strings and how often each came up. The state in the middle is never handed to anyone: a simulator can print it and a machine cannot, and every claim made here has to survive that.'},

{t:'box', kind:'ok', hd:'The two halves', html:'The first half is the machine — circuits, shots, measurement inside a circuit, and what a compiler does. The second half runs two protocols on it end to end: teleportation, which finishes nothing until a classical channel has delivered two bits, and Grover, which is where a resource claim finally has to be written out in full.'},

/* ---- 5.1 ---- */
{t:'h2', num:'5.1', text:'The circuit model'},

{t:'p', text:'A circuit diagram has one horizontal line for each qubit, and time runs left to right along those lines. A box on a line is a gate acting on that qubit; a dot on one line joined to a symbol on another is a gate acting on both. That is the whole notation, and what it describes is a program: a list of instructions and the order they must run in. It is not a stored state and it is not a drawing of anything on a chip.'},

{t:'fig', svg:circuit, cap:'Three qubits and four gates. The vertical rules are the layer boundaries. Here every gate waits for the one before it, so the depth happens to equal the gate count; that is not the usual case and it is worth noticing when it fails.'},

{t:'p', text:'The model of computation the diagram belongs to is deliberately narrow, and the narrowness is what makes a cost statement possible at all.'},

{t:'eqbox', cap:'the circuit model, in one line', tex:'|0\\rangle^{\\otimes n} \\;\\xrightarrow{\\;U_{d}\\cdots U_{2}U_{1}\\;}\\; |\\psi\\rangle \\;\\xrightarrow{\\;\\text{measure}\\;}\\; x \\in \\{0,1\\}^{n}',
 after:'Every qubit starts in $|0\\rangle$, every gate comes from one fixed finite set, the measurement is in the computational basis, and the whole thing is repeated because one run gives one string. Each restriction is doing work. Fixing the input means an algorithm cannot smuggle in an answer through its preparation; fixing the gate set means the cost of a circuit is the number of gates; fixing the measurement basis means a change of basis is a gate and has to be paid for.'},

{t:'p', text:'The ordering convention of chapter 4 starts costing money here, because two conventions meet on a diagram and they point in opposite directions. Qubit $q_{0}$ is drawn on the <b>top</b> wire, and $q_{0}$ is the <b>last</b> digit of the ket and the <b>least significant</b> bit of the index. So the wire order down the page and the digit order across the ket are reverses of each other, and the printed classical string follows the ket: the top wire is its rightmost character.'},

{t:'eqbox', cap:'one state, named four ways', tex:'|q_{n-1}\\,\\ldots\\,q_{1}q_{0}\\rangle, \\qquad x = \\sum_{k} 2^{k} q_{k}',
 after:'A run that prints $101$ on three qubits read $q_{2}=1$, $q_{1}=0$ and $q_{0}=1$, which is the ket $|101\\rangle$ and entry $5$ of the state vector. Reading the string onto the wires from the top instead names $|101\\rangle$ again — a palindrome cannot expose the error — and names $|001\\rangle$ where the run printed $|100\\rangle$. Both are legal normalised states, so nothing downstream complains.'},

{t:'p', text:'Two numbers describe how big a circuit is and they answer different questions. The <b>gate count</b> is how much work there is; the <b>depth</b> is how many layers must run one after another, and therefore how long the circuit takes. Chapter 3 gave the reason the second is the one that hurts: a qubit keeps its phase for a time $T_{2}$, and a circuit of depth $d$ made of gates lasting $\\tau$ occupies about $d\\tau$, so it is useful only while $d\\tau \\ll T_{2}$.'},

{t:'fig', svg:depth, cap:'The same four-qubit GHZ state, two ways. Four gates in both. The chain waits for each CNOT before starting the next; the tree runs two of them together in one layer.'},

{t:'ex', hd:'Example 5.1 · the same work, a third of the time', rows:[
 ['Given','GHZ on $n=16$ qubits, gates of $200\\,\\text{ns}$, $T_{2}=80\\,\\mu\\text{s}$.'],
 ['Find','The gate count, the depth and the duration of each construction.'],
 ['Solution','Both use $1+15=16$ gates. The chain has depth $16$ and takes $3.2\\,\\mu\\text{s}$; the tree has depth $1+\\log_{2}16=5$ and takes $1.0\\,\\mu\\text{s}$.'],
 ['Check','Put $n=1000$ in. The chain needs $200\\,\\mu\\text{s}$ against a $T_{2}$ of $80$ and is impossible; the tree needs $2.2\\,\\mu\\text{s}$ and is not. The gate count never saw the difference.']]},

{t:'box', kind:'err', hd:'"Fewer gates" is not "faster" and not "more accurate"', html:'A rewrite that removes gates but serialises what was parallel makes the circuit slower. A rewrite that removes one-qubit gates and adds one two-qubit gate usually makes it less accurate, because a two-qubit gate is the expensive one by an order of magnitude. Compare two-qubit count, depth and duration, and say which of the three the claim is about.'},

/* ---- 5.2 ---- */
{t:'h2', num:'5.2', text:'Running a circuit'},

{t:'p', text:'A classical computer can hold the state vector of a small circuit and apply the gates to it exactly. There are no shots and no noise, and the amplitudes it prints are deterministic up to rounding, which is what makes it useful: it answers whether the circuit is the circuit that was meant. It also stops, because the vector has $2^{n}$ complex entries at sixteen bytes each.'},

{t:'eqbox', cap:'what an exact simulation costs', tex:'\\text{bytes} = 16\\cdot 2^{n}, \\qquad n=30 \\Rightarrow 17\\,\\text{GB}, \\qquad n=50 \\Rightarrow 18\\,\\text{PB}',
 after:'The unitary matrix of a circuit is worse at $16\\cdot 4^{n}$: a fifteen-qubit gate matrix already needs $17\\,\\text{GB}$, which is why a circuit is checked by acting on states rather than by forming its matrix. Note what this argument does <b>not</b> establish. "A classical computer cannot store this state" is a statement about one method; many circuits far too large for a state vector are easy to simulate another way, so the size of the vector is an upper bound on the difficulty and never a lower one.'},

{t:'fig', svg:statecost, cap:'What one state vector costs, against the number of qubits. The vertical axis is logarithmic, so the exponential is a straight line and no amount of extra hardware bends it.'},

{t:'p', text:'A machine gives back strings, not amplitudes. Counting how often an outcome came up and dividing by the number of shots gives an <b>estimate</b> of its probability, and an estimate is not the probability.'},

{t:'eqbox', cap:'the error bar on a probability read from a finite run', tex:'K \\sim \\text{Binomial}(N,p), \\qquad \\mathrm{SE}(\\hat{p}) = \\sqrt{\\frac{p(1-p)}{N}}',
 after:'The square root is the whole economics of running a quantum computer: ten times the accuracy costs a hundred times the shots, and every shot is a full circuit executed on the machine. An estimate near one half to within $\\pm0.005$ needs ten thousand shots. Choosing the shot count from a target accuracy rather than from habit is the difference between a five-minute job and a five-hour one.'},

{t:'box', kind:'err', hd:'More shots never remove a bias', html:'Sampling error shrinks as $1/\\sqrt N$ and goes to zero. Device error does not: a faulty gate or a mis-calibrated readout changes the distribution being sampled, so more shots estimate the <b>wrong</b> probability more precisely. When a result disagrees with the ideal value by far more than its error bar, the answer is never more shots.'},

{t:'p', text:'A measurement need not be the last thing a circuit does, and once it is not, one question decides whether the circuit can be rearranged: does anything after the measurement act on the measured wire? If a qubit is measured and its result only ever <b>controls</b> later gates, the measurement can be pushed to the end and the classical control replaced by a quantum one, with identical counts. The reason is short: a control acts differently on the two branches of the control qubit and does nothing to mix them, so whether the branches were separated first makes no difference to any later count.'},

{t:'eqbox', cap:'deferred measurement', tex:'\\text{measure } q_{0},\\ \\text{then } X^{m}\\ \\text{on } q_{1} \\;\\equiv\\; \\mathrm{CNOT}_{0\\to1},\\ \\text{then measure } q_{0}',
 after:'Put a Hadamard on $q_{0}$ <b>after</b> the measurement and the two circuits stop agreeing at once, because the measurement destroyed the phase that Hadamard needed. The rule is about a measured wire used as a control and nothing else, and a barrier in a compiled circuit is the mark that tells an optimiser it may not move an instruction across a particular place.'},

{t:'p', text:'A <b>dynamic circuit</b> goes the other way: it measures part-way through a shot and uses that classical bit to decide what to do next, inside the same shot, with the decision made by control electronics beside the machine. Teleportation, error correction and state reset all need a gate whose identity is not known until a measurement has happened, and none of them can wait for a result to travel to a host computer and back. Feedforward is not free — a mid-circuit measurement takes far longer than a gate, and the electronics need time to read the bit and act on it — so a dynamic circuit can be worse than the fixed circuit it replaced even with fewer gates.'},

/* ---- 5.3 ---- */
{t:'h2', num:'5.3', text:'Compiling for a machine'},

{t:'p', text:'Chapter 4 showed that a small set of gates is universal. A real machine chooses one such set — its <b>instruction set</b> — and can run nothing else, so a circuit written in convenient gates has to be translated first. The translations are the identities of chapter 4 used in the other direction, and none of them is an approximation.'},

{t:'eqbox', cap:'two exact rewrites', tex:['H = e^{i\\pi/2} R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{x}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right)', '\\mathrm{CNOT}_{0\\to1} = \\left(H \\text{ on } q_{1}\\right)\\;\\mathrm{CZ}\\;\\left(H \\text{ on } q_{1}\\right)'],
 after:'What is lost is only length: one gate becomes three, and a circuit of a thousand becomes a circuit of three thousand. The two-qubit count, which is the number the error budget cares about, does not move. The phase $e^{i\\pi/2}$ in the first line is invisible on its own and fully observable the moment the gate is controlled, which is why a compiler tracks it and a person rewriting a controlled gate by hand often does not.'},

{t:'p', text:'A circuit also assumes that any two qubits can share a gate, and a chip does not: only certain pairs are physically joined, and the list of joined pairs is the <b>coupling map</b>. Bringing a circuit onto a chip is four compiler passes. <b>Layout</b> chooses which physical qubit plays each qubit of the circuit. <b>Routing</b> inserts SWAP gates so that every two-qubit gate acts on a joined pair when it runs. <b>Translation</b> rewrites into the instruction set, and <b>optimisation</b> then removes what it can.'},

{t:'p', text:'Routing is the expensive one, and it is expensive in the currency that matters. A SWAP is three CNOTs, and a CNOT is the gate with the largest error, so a gate between qubits $d$ steps apart costs about $3(d-1)$ extra CNOTs to bring them together and possibly the same again to put them back. On a line of five qubits, a CNOT written between the two ends becomes ten two-qubit gates, or nineteen if the original layout has to be restored. Nothing about the algorithm changed; the chip decided the cost, after the circuit was written.'},

{t:'box', kind:'warn', hd:'Two runs of a compiler need not agree', html:'Layout and routing are heuristic searches and most of them are randomised, so the same circuit compiled twice can differ in depth by a large factor and both results are correct. A published gate count is incomplete unless it names the compiler, its settings and its seed — the same discipline any numerical result needs.'},

{t:'p', text:'That brings the third sentence of this course to the place where it becomes a working tool rather than a warning. A statement that one method beats another has to name five things, and a statement missing any of them cannot be checked at all.'},

{t:'fig', svg:claim, cap:'The five. The last one is where most claims fail, and it fails in a particular way: the quantum method is compared against the obvious classical method rather than the best one.'},

{t:'box', kind:'err', hd:'A query count is not a runtime', html:'Almost every quantum speedup in a textbook is stated as a count of <b>queries</b> to a black box. That is a real and provable statement, and it is not a time. One quantum query is a whole circuit, deep and error-corrected, running for microseconds; one classical query is a memory read taking nanoseconds. A ratio of query counts and a ratio of runtimes can point in opposite directions, and section 5.7 works an example where they do.'},

{t:'h3', text:'From physical qubits to logical qubits'},

{t:'p', text:'A <b>physical qubit</b> is a device on a chip. A <b>logical qubit</b> is quantum information encoded across a block of physical data qubits. Extra ancilla qubits measure checks on the block. Their results form a <b>syndrome</b>, which reveals information about an error pattern without reading the unknown amplitudes. A classical decoder maps that syndrome to a correction, and the checks repeat while the computation runs.'},

{t:'p', text:'A code corrects only the error patterns it was designed to handle. Increasing its <b>distance</b> can protect against more faults, but it also needs more physical qubits and more check rounds. Let $p$ be the physical error rate and $p_{\\mathrm{th}}$ the threshold for a stated code, noise model and control system. When $p<p_{\\mathrm{th}}$, increasing the distance can reduce the logical error rate. Above that threshold, making the same code larger does not provide scalable reliability. The threshold is not one universal hardware number.'},

{t:'box', kind:'err', hd:'Logical resources are not hardware resources', html:'A count of logical qubits and logical gates is only the first line of a hardware estimate. The estimate must name the code and distance, physical error assumptions, ancillas and routing. It must also name the correction-cycle time and target failure probability. Error correction expands both space and time, sometimes by many orders of magnitude.'},

/* ---- 5.4 ---- */
{t:'h2', num:'5.4', text:'Turning a phase into counts'},

{t:'p', text:'Every algorithm in this course and the next works by arranging a relative phase and then converting it into a probability. The smallest circuit that does both is three gates long and is worth being able to write from memory.'},

{t:'eqbox', cap:'a phase written between two Hadamards', tex:['|0\\rangle \\;\\xrightarrow{\\;H\\;}\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right) \\;\\xrightarrow{\\;P(\\varphi)\\;}\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\varphi}|1\\rangle\\right)', '\\xrightarrow{\\;H\\;}\\; \\tfrac12\\left(1+e^{i\\varphi}\\right)|0\\rangle + \\tfrac12\\left(1-e^{i\\varphi}\\right)|1\\rangle, \\qquad p(0) = \\cos^{2}\\frac{\\varphi}{2}'],
 after:'The middle state has probability one half on each outcome for every $\\varphi$, so measuring there learns nothing about the phase at all. The second Hadamard is what makes the phase readable, and it does so by bringing the two amplitudes into the same outcome so that they can add or cancel. Replace $P(\\varphi)$ by a wait of duration $t$ and the phase becomes $\\Delta\\omega\\,t$, so the counts oscillate as the wait grows and their shrinking amplitude is the $T_{2}$ of chapter 3. The most common measurement made on a real qubit is this circuit with a dial on the middle gate.'},

/* ---- 5.5 ---- */
{t:'h2', num:'5.5', text:'Teleportation'},

{t:'p', text:'Before asking how to move a quantum state from one place to another, it is worth knowing why the classical answer — copy it and send the copy — is unavailable. Suppose a unitary copied every state, so that $U|\\psi\\rangle|0\\rangle=|\\psi\\rangle|\\psi\\rangle$ for all $|\\psi\\rangle$. Apply it to two states and take the inner product of the results; a unitary preserves inner products, so $\\langle\\phi|\\psi\\rangle = \\left(\\langle\\phi|\\psi\\rangle\\right)^{2}$, which forces the overlap to be zero or one.'},

{t:'box', kind:'def', hd:'What no-cloning does and does not forbid', html:'A copier can exist only for a set of states that are all either identical or orthogonal, which is exactly a set of classical alternatives — and is why classical bits can be copied. A known state can be prepared again as often as wanted. What cannot be done is copying a state nobody has been told. The obvious circuit shows the failure directly: a CNOT sends $|{+}\\rangle|0\\rangle$ to $\\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)$, which overlaps the real copy $|{+}\\rangle|{+}\\rangle$ with probability one half and leaves each half maximally mixed. It entangled instead of copying.'},

{t:'p', text:'Teleportation moves the state instead. Three qubits, and each belongs to somebody: $q_{0}$ carries the unknown state and belongs to Alice, $q_{1}$ is Alice\u2019s half of an entangled pair, and $q_{2}$ is Bob\u2019s half, which he has taken away with him. The circuit has four stages, and the last is not a quantum gate at all.'},

{t:'fig', svg:tele, cap:'The whole protocol. The double lines are classical bits, and everything to the right of them waits for those bits to arrive. That wait is not a detail of the drawing; it is the reason nothing here travels faster than light.'},

{t:'p', text:'The protocol is one algebraic identity, and it is worth doing in full once, because every claim about teleportation is read straight off the last line. Write $|\\psi\\rangle=\\alpha|0\\rangle+\\beta|1\\rangle$ on $q_{0}$ and the shared pair on $q_{1}$ and $q_{2}$, with kets written $|q_{2}q_{1}q_{0}\\rangle$ throughout.'},

{t:'eqbox', cap:'step one: the starting state, multiplied out', tex:'|\\Psi_{0}\\rangle = \\left(\\alpha|0\\rangle+\\beta|1\\rangle\\right)_{0} \\otimes \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)_{21} = \\tfrac{1}{\\sqrt2}\\Big[\\alpha\\left(|000\\rangle+|110\\rangle\\right) + \\beta\\left(|001\\rangle+|111\\rangle\\right)\\Big]'},

{t:'eqbox', cap:'step two: the CNOT from $q_{0}$ to $q_{1}$ flips $q_{1}$ where $q_{0}=1$', tex:'|\\Psi_{1}\\rangle = \\tfrac{1}{\\sqrt2}\\Big[\\alpha\\left(|000\\rangle+|110\\rangle\\right) + \\beta\\left(|011\\rangle+|101\\rangle\\right)\\Big]'},

{t:'eqbox', cap:'step three: the Hadamard on $q_{0}$ splits every term', tex:'\\begin{aligned}|\\Psi_{2}\\rangle = \\tfrac12\\Big[&\\;\\alpha|000\\rangle+\\alpha|001\\rangle+\\alpha|110\\rangle+\\alpha|111\\rangle \\\\ &+ \\beta|010\\rangle-\\beta|011\\rangle+\\beta|100\\rangle-\\beta|101\\rangle\\Big]\\end{aligned}'},

{t:'eqbox', cap:'step four: collect the terms by what Alice will read', tex:'|\\Psi_{2}\\rangle = \\tfrac12 \\sum_{m_{1},m_{0}\\in\\{0,1\\}} |m_{1}m_{0}\\rangle_{10} \\otimes X^{m_{1}}Z^{m_{0}}|\\psi\\rangle_{2}',
 after:'That is the identity. It is exact, it holds for every $\\alpha$ and $\\beta$, and nothing in it depends on knowing what they are — which is the point, because Alice does not. One warning about how to read it: before Alice measures, the four terms are a superposition and not four alternatives that have already happened. Treating them as four equally likely cases gives the right number for every question in this course and is the wrong description of the state, in exactly the way chapter 3 separated a superposition from a mixture.'},

{t:'p', text:'Since $X$ and $Z$ are their own inverses, undoing the operator is immediate: Bob applies $X^{m_{1}}$ and then $Z^{m_{0}}$. Four bit patterns, four corrections, and the choice is made by the bits and by nothing else.'},

{t:'table', head:['$m_{1}m_{0}$','probability','what Bob holds','what Bob applies'], rows:[
 ['$00$','$0.25$','$|\\psi\\rangle$','$I$'],
 ['$01$','$0.25$','$Z|\\psi\\rangle$','$Z$'],
 ['$10$','$0.25$','$X|\\psi\\rangle$','$X$'],
 ['$11$','$0.25$','$XZ|\\psi\\rangle$','$X$ then $Z$']]},

{t:'p', text:'The two bits are individually fair coins and carry no information at all about $\\alpha$ or $\\beta$. What they carry is which of four known operations was applied, and that is why two classical bits are enough to move a state described by two continuous parameters: the bits do not describe the state, they select a correction. Skipping the correction does not give a slightly worse state — averaging the four branches with weight one quarter each is the depolarising channel of chapter 3 at full strength, and it destroys the state completely.'},

{t:'p', text:'The same average is the reason nothing is sent. Chapter 3 proved that no local operation on one half of an entangled pair changes the other half\u2019s reduced state, and here that theorem becomes a circuit — the one everybody first suspects of sending something instantly.'},

{t:'eqbox', cap:'what Bob holds before the bits arrive', tex:'\\rho_{B} = \\tfrac14\\sum_{m_{1},m_{0}} X^{m_{1}}Z^{m_{0}}\\,\\rho\\,Z^{m_{0}}X^{m_{1}} = \\frac{I}{2}',
 after:'The right-hand side has no $\\rho$ in it. Whatever Alice was sending, whatever she did, and whether or not she ran the protocol at all, Bob\u2019s qubit is maximally mixed until two classical bits reach him. The sum is easiest to check in the Bloch picture: $X$ flips the signs of $r_{y}$ and $r_{z}$, $Z$ flips $r_{x}$ and $r_{y}$, and $XZ$ flips $r_{x}$ and $r_{z}$, so each component appears twice with each sign and the four vectors add to zero. Alice\u2019s measurement changes what <b>she</b> can say about Bob\u2019s qubit; it changes nothing he can observe, and that is why the theory and relativity do not collide.'},

{t:'p', text:'The account is short and exact. Moving one unknown qubit consumes one shared entangled pair and two classical bits, and destroys the original; nothing is reusable, and a second qubit needs a second pair. Saying that a laboratory has <b>done</b> this needs a number, because a noisy apparatus produces something that resembles the input, and the number is the fidelity $F(\\psi)=\\langle\\psi|\\rho_{\\text{out}}|\\psi\\rangle$.'},

{t:'box', kind:'def', hd:'Why this is a quantum-network primitive', html:'A quantum network first distributes an entangled pair across a link. Teleportation then consumes that pair and two classical bits to move a state between nodes without sending the data qubit through the link. Teleportation does not create the pair, remove loss or extend the link by itself. A repeater needs entanglement generation, verification and link joining around it.'},

{t:'box', kind:'err', hd:'A best-case fidelity is not a result', html:'One fidelity on one input proves nothing: a machine that always outputs $|0\\rangle$ scores $F=1$ whenever the input happened to be $|0\\rangle$. The claim has to be an average over inputs covering the sphere, and it has to beat $2/3$ — what measuring the qubit and preparing a new one achieves with no entanglement at all. With pairs of singlet fraction $f$ the optimum is $F_{\\text{avg}}=(2f+1)/3$, which meets both ends correctly: $f=0.5$ gives exactly $2/3$ and $f=1$ gives $1$. A report must also state the unconditional success rate, what was discarded and by what rule, and a confidence interval.'},

/* ---- 5.6 ---- */
{t:'h2', num:'5.6', text:'Grover search'},

{t:'p', text:'The problem is stated carefully because the statement is what the result is about. There are $N=2^{n}$ candidates; a function $f$ answers one question about each, returning $1$ for a solution and $0$ otherwise; exactly $M$ candidates are solutions; and nothing else is known, so the candidates have no order and no structure to exploit. The function is available only as a black box, built as chapter 4 built every reversible embedding: $U_{f}|x\\rangle|y\\rangle = |x\\rangle|y\\oplus f(x)\\rangle$. One use of that box is one <b>query</b>, and the classical cost in the same model is about $N/2$ queries when $M=1$.'},

{t:'p', text:'The oracle flips a target bit and interference needs a phase. One line of preparation converts one into the other, and it is the mechanism every algorithm in this chapter and the next runs on.'},

{t:'eqbox', cap:'phase kickback', tex:['X|{-}\\rangle = -|{-}\\rangle', 'U_{f}\\,|x\\rangle|{-}\\rangle = (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle'],
 after:'Read the second line carefully. The target register comes out exactly as it went in, so it is not entangled with anything and can be ignored from here on; the answer has landed on the first register, as a sign. Applied to a superposition, one query signs every marked term at once — which is not "trying every answer at once", because no probability has changed and a measurement here still returns one string. What has changed is a set of relative phases, and relative phases are the only thing an algorithm can work with. The argument needs the target to come out unchanged, so an oracle that leaves an ancilla behind entangles the register with it and the interference at the end simply does not happen.'},

{t:'p', text:'An $n$-qubit state lives in $2^{n}$ dimensions and following it there would be hopeless. It is not necessary. Define the even mixture of the marked candidates and the even mixture of the rest; they are orthonormal, the starting state lies in the plane they span, and both operations the algorithm uses keep the state inside that plane.'},

{t:'eqbox', cap:'the plane the algorithm lives in', tex:['|G\\rangle = \\frac{1}{\\sqrt{M}}\\sum_{f(x)=1}|x\\rangle, \\qquad |B\\rangle = \\frac{1}{\\sqrt{N-M}}\\sum_{f(x)=0}|x\\rangle', '|s\\rangle = \\sin\\theta\\,|G\\rangle + \\cos\\theta\\,|B\\rangle, \\qquad \\sin\\theta = \\sqrt{\\frac{M}{N}}'],
 after:'A problem in $2^{n}$ dimensions has become a problem in two, and the two can be drawn on paper. One warning: this is a two-dimensional real plane inside a $2^{n}$-dimensional complex space. It is not a Bloch sphere, the vectors are not Bloch vectors, and the half-angle rules of chapter 4 do not apply to it.'},

{t:'p', text:'One iteration is two operations and each of them is a reflection of that plane. The <b>phase oracle</b> $O_{f}=I-2|G\\rangle\\langle G|$ puts a minus sign on the marked terms, which is a reflection in the $|B\\rangle$ axis. The <b>diffusion operator</b> $D=2|s\\rangle\\langle s|-I$ reflects in the starting vector. Two reflections of a plane, in lines separated by an angle, compose to a rotation by twice that angle — and the two lines here are separated by $\\theta$.'},

{t:'fig', svg:geom, cap:'One iteration, drawn isotropically so the angles are the real ones. The oracle takes the vector below the horizontal; the diffusion takes it back above, but past where it started. The net turn is $2\\theta$.'},

{t:'p', text:'Written out in the computational basis, $D$ says: replace each amplitude by twice the mean of all the amplitudes, minus itself. That is the familiar "inversion about the mean", and it is the same operator in a different basis. The reflection picture is the one to reason with and the mean picture is the one to program. Note also what $D$ is not: it contains no information about $f$, so it is not counted as a query — but it is still a circuit, and its multiply-controlled phase needs a chain of Toffolis and their ancillas.'},

{t:'p', text:'After $r$ iterations the state has turned to $(2r+1)\\theta$ from the $|B\\rangle$ axis, so the probability of measuring a marked candidate is a sine squared and nothing else.'},

{t:'eqbox', cap:'the success probability, and where it peaks', tex:['P_{\\text{good}}(r) = \\sin^{2}\\!\\big((2r+1)\\theta\\big)', 'r_{*} = \\frac{\\pi}{4\\theta} - \\frac12, \\qquad r_{*} \\approx \\frac{\\pi}{4}\\sqrt{\\frac{N}{M}} \\ \\text{ when } M \\ll N'],
 after:'The square root arrives here, at the end, and it comes from the size of one step: each iteration adds a fixed angle $2\\theta\\approx 2\\sqrt{M/N}$ and a right angle has to be reached, so the number of steps goes as $\\sqrt{N/M}$. Nothing exponential ever happened; a small angle was added many times.'},

{t:'fig', svg:iter, cap:'The success probability against the iteration count, for a thousand candidates with one marked. It rises to almost one at twenty-five iterations and falls back to almost nothing at fifty. The curve is a sine squared and it keeps going.'},

{t:'ex', hd:'Example 5.2 · eight candidates, two marked', rows:[
 ['Given','$N=8$ and $M=2$.'],
 ['Find','The angle, the best iteration count, and the success probability at it and at the next one.'],
 ['Solution','$\\sin\\theta=\\sqrt{2/8}=0.5$, so $\\theta=30^{\\circ}$ and $r_{*}=\\tfrac{90}{60}-\\tfrac12=1$ exactly. Then $P(1)=\\sin^{2}90^{\\circ}=1$: the answer is certain after one iteration.'],
 ['Check','A second iteration gives $P=\\sin^{2}150^{\\circ}=0.25$, which is exactly $P(0)$ — the probability before any iteration at all. Two iterations have undone the work of one.']]},

{t:'box', kind:'err', hd:'More iterations are not better', html:'Past $r_{*}$ the rotation carries the vector beyond $|G\\rangle$ and the success probability falls; at about $2r_{*}$ it is back where it started. Running "as many as the time allows" is therefore worse than running the right number, and it fails in a way that looks like a broken machine — a flat distribution over every outcome — produced by a perfect machine following a bad plan. When $M$ is not known the fix is not more iterations: it is a randomised schedule of iteration counts, or estimating $M$ first.'},

/* ---- 5.7 ---- */
{t:'h2', num:'5.7', text:'What the square root claims'},

{t:'p', text:'The result is real and it is provable. About $\\tfrac{\\pi}{4}\\sqrt{N}$ queries find a marked candidate among $N$, where a classical search needs about $N/2$, and it is optimal: no quantum algorithm in this model does better than order $\\sqrt{N}$, so the quadratic saving is the end of the story rather than the beginning of it. Written out against the five components, three of them turn out to be doing heavy work.'},

{t:'ul', items:[
 '<b>Input model.</b> The saving assumes query access to a reversible circuit for $f$. If the candidates are records in a database they must first be loaded into a quantum memory, and loading $N$ records takes at least $N$ operations — which destroys the saving before the algorithm starts.',
 '<b>Hardware model.</b> The count assumes ideal qubits. A circuit of $\\sqrt{N}$ oracle calls, each with its Toffolis and ancillas, needs error correction, and error correction multiplies both the qubit count and the depth by a large factor.',
 '<b>Baseline.</b> The comparison assumes the classical method must scan. Almost no real problem is unstructured enough for that to be true: a sorted list is searched in $\\log_{2}N$ steps and a hash table in one.']},

{t:'ex', hd:'Example 5.3 · the query ratio and the time ratio point opposite ways', rows:[
 ['Given','$N=1024$ with one marked candidate, an oracle circuit taking $10\\,\\mu\\text{s}$ per call, and a classical processor evaluating the same predicate in $10\\,\\text{ns}$.'],
 ['Find','The two query counts and the two runtimes.'],
 ['Solution','Queries: $25$ against $512$, a saving of about twenty times. Time: $25\\times10\\,\\mu\\text{s}=250\\,\\mu\\text{s}$ against $512\\times10\\,\\text{ns}=5.1\\,\\mu\\text{s}$ — the classical run is about fifty times faster.'],
 ['Check','Both ratios are correct. The crossing point is the $N$ at which $\\sqrt{N}$ slow queries beat $N$ fast ones, and finding that $N$ is the honest form of the question.']]},

{t:'box', kind:'ok', hd:'What the result does say, stated fairly', html:'For a problem with genuinely no structure, where the predicate is cheap to build as a reversible circuit and the data never has to be loaded, a quantum computer needs quadratically fewer evaluations of that predicate, and this is optimal. That is a strong theorem. It is a theorem about a count, and turning it into a statement about a wall clock needs every one of the other four components filled in.'},

/* ---- 5.8 ---- */
{t:'h2', num:'5.8', text:'Summary'},

{t:'ul', items:[
 'A circuit is a program: prepare $|0\\rangle^{\\otimes n}$, apply gates from a fixed set, measure in the computational basis, repeat. Depth is layers and is what a coherence time is spent against; the gate count is a different number and only accidentally equal to it.',
 '$q_{0}$ is the top wire, the last digit of the ket and the least significant bit of the index, so the wire order and the ket digits run opposite ways.',
 'An exact state vector costs $16\\cdot2^{n}$ bytes and stops near thirty qubits; a circuit matrix costs $16\\cdot4^{n}$ and stops much sooner.',
 'A probability from $N$ shots carries $\\sqrt{p(1-p)/N}$, which shrinks as $1/\\sqrt N$. Device error does not shrink at all, so a large disagreement is never a reason for more shots.',
 'A measured control may be deferred to the end of a circuit; a gate on the measured wire may not cross the measurement. A compiler rewrites gates exactly and routes them at three CNOTs per SWAP, and two runs of it need not agree.',
 'A logical qubit is an encoded block of physical data qubits and check ancillas. Syndromes guide corrections. Below the threshold, more distance can suppress logical error, while the encoding and correction cycles expand both space and time.',
 'Teleportation: $|\\Psi\\rangle = \\tfrac12\\sum_{m_{1}m_{0}}|m_{1}m_{0}\\rangle\\,X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$, four branches of probability $\\tfrac14$ for every input, so $\\rho_{B}=I/2$ until two classical bits arrive. A network consumes one distributed pair and those two bits to move one state between nodes.',
 'Grover: $\\sin\\theta=\\sqrt{M/N}$, one iteration is a rotation by $2\\theta$, and $P(r)=\\sin^{2}((2r+1)\\theta)$ with $r_{*}=\\tfrac{\\pi}{4\\theta}-\\tfrac12$. Past the optimum the probability falls. Quadratic in queries, optimal in that model, and silent about time.']},

{t:'box', kind:'err', hd:'Four errors that cost a whole question', html:'Reporting a gate count where a depth was asked for. Reading a printed bit string in the wrong direction. Saying that teleportation finished before the classical bits arrived. And running more Grover iterations than the optimum, which lowers the success probability rather than raising it.'},

{t:'box', kind:'ok', hd:'What comes next', html:'Chapter 6 keeps the oracle and the kickback and changes what is done between them: one mechanism, four algorithms, and the resource discipline of this chapter applied to every one of them.'}

];
})();
