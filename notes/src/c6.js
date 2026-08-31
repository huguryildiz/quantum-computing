/* Course notes — Chapter 6.

   The reading edition of the artifact's chapter 6. It says the same things in
   the same order and is not a transcript: a scene builds in reveal steps and a
   page does not, so an argument that arrives in four steps on screen arrives
   here as one paragraph with the same intermediate lines shown.

   One figure here carries an angle — the eight amplitudes of the transform,
   drawn in the complex plane — and it is in an isotropic frame, with the ratio
   written in the comment above it. An anisotropic frame there would draw the
   equal moduli as unequal ones, which is the one thing that figure exists to
   show.

   Circuit drawings follow the same rules as chapters 4 and 5: a control is a
   filled dot, a target is an open circle with a cross in it, and a vertical
   control line starts at the edge of a gate box and not at its centre, so it
   never runs through the gate's own label. */
(function(){
const P=PLOT, C=P.COL;
const TAU=2*Math.PI;

/* ---- the circuit kit ---------------------------------------------------- */
const wire=(y,x0,x1,col)=>({t:'line',d:`M${x0},${y} H${x1}`,color:col||C.rule});
const gate=(x,y,label,tex,w,col)=>({t:'box',x:x-(w||32)/2,y:y-16,w:w||32,h:32,
  label,tex:!!tex,fs:14,color:col||C.h});
const ctrl=(x,y,col)=>({t:'dot',x,y,r:6,color:col||C.h});
const meter=(x,y)=>({t:'box',x:x-22,y:y-16,w:44,h:32,label:'measure',fs:10.5,
  color:C.out});

/* Phase kickback: the target is the one state the flip cannot move, so the
   answer comes back as a sign on the query wire. */
function kick(){
  const items=[
    wire(52,170,430), wire(118,170,430),
    {t:'text',x:162,y:57,anchor:'end',label:'|x\\rangle',tex:true,fs:13.5},
    {t:'text',x:162,y:123,anchor:'end',label:'|{-}\\rangle',tex:true,fs:13.5},
    {t:'box',x:236,y:32,w:90,h:106,label:'U_{f}',tex:true,fs:18,color:C.h},
    {t:'text',x:450,y:57,anchor:'start',label:'(-1)^{f(x)}|x\\rangle',tex:true,fs:14,color:C.out},
    {t:'text',x:450,y:123,anchor:'start',label:'|{-}\\rangle',tex:true,fs:13.5,color:C.in},
    {t:'text',x:281,y:174,label:'the target leaves unchanged',fs:11.5}
  ];
  return P.blocks({w:720,h:190,items});
}

/* The signs a promised function writes, and the average of them. */
function signs(){
  const items=[];
  const row=(y,cells,name,col,val)=>{
    items.push({t:'text',x:44,y,anchor:'start',label:name,fs:12,color:col});
    cells.forEach((s,i)=>items.push({t:'text',x:232+i*42,y,anchor:'middle',label:s,fs:15,color:col}));
    items.push({t:'text',x:608,y,anchor:'start',label:val,tex:true,fs:14,color:col});
  };
  items.push({t:'text',x:232,y:26,anchor:'start',label:'(-1)^{f(x)}\\text{ for the eight inputs}',tex:true,fs:12});
  items.push({t:'text',x:608,y:26,anchor:'start',label:'\\text{mean}',tex:true,fs:12});
  items.push({t:'line',d:'M36,38 H690',color:C.rule});
  row(68,['+','+','+','+','+','+','+','+'],'constant, value 0',C.in,'+1');
  row(102,['-','-','-','-','-','-','-','-'],'constant, value 1',C.in,'-1');
  row(142,['+','-','-','+','-','+','+','-'],'balanced, parity',C.out,'0');
  row(176,['+','+','+','+','-','-','-','-'],'balanced, top bit',C.out,'0');
  return P.blocks({w:720,h:196,items});
}

/* The eight amplitudes of the transform of one basis state, in the complex
   plane. Isotropic: 330 px over an x span of 3.9875 and 240 px over a y span
   of 2.90, both 82.8 px to the unit, so the eight equal moduli are drawn
   equal and the winding is drawn at its true rate. */
function fourier(){
  const a=P.Axes({w:620,h:300,xr:[-1.45,2.5375],yr:[-1.45,1.45],
    pad:{l:24,r:266,t:30,b:30}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const ring=[]; for(let i=0;i<=220;i++){ const s=TAU*i/220; ring.push([Math.cos(s),Math.sin(s)]); }
  a.poly(ring,{color:C.grid,width:1.4,dash:'3 4'});
  a.poly([[-1.18,0],[1.18,0]],{color:C.rule,width:1.1});
  a.poly([[0,-1.18],[0,1.18]],{color:C.rule,width:1.1});
  for(let k=0;k<8;k++){
    const th=TAU*3*k/8;
    a.poly([[0,0],[Math.cos(th),Math.sin(th)]],{color:k===0?C.out:C.in,width:k===0?2.4:1.6});
    a.point(Math.cos(th),Math.sin(th),{color:k===0?C.out:C.in,r:k===0?5.5:4.2});
    a.note(1.16*Math.cos(th),1.16*Math.sin(th),String(k),{fs:11.5,color:C.muted,anchor:'middle'});
  }
  a.note(1.32,0.98,'F_{8}|3\\rangle = \\tfrac{1}{\\sqrt8}\\sum_{k} e^{2\\pi i\\,3k/8}|k\\rangle',{fs:12.5,color:C.mid,anchor:'start',tex:true});
  a.note(1.32,0.46,'\\text{every magnitude is }1/\\sqrt8',{fs:12,color:C.in,anchor:'start',tex:true});
  a.note(1.32,0.02,'\\text{each step turns by }135^{\\circ}',{fs:12,color:C.in,anchor:'start',tex:true});
  return a.svg();
}

/* The transform circuit on three qubits. */
function qftcirc(){
  const Y=[48,110,172];
  const items=[
    wire(Y[0],120,620), wire(Y[1],120,620), wire(Y[2],120,620),
    {t:'text',x:112,y:Y[0]+5,anchor:'end',label:'q_{2}',tex:true,fs:12.5},
    {t:'text',x:112,y:Y[1]+5,anchor:'end',label:'q_{1}',tex:true,fs:12.5},
    {t:'text',x:112,y:Y[2]+5,anchor:'end',label:'q_{0}',tex:true,fs:12.5},
    gate(156,Y[0],'H',true),
    {t:'line',d:`M212,${Y[0]+16} V${Y[1]}`,color:C.h}, ctrl(212,Y[1]),
    gate(212,Y[0],'R_{2}',true,42),
    {t:'line',d:`M288,${Y[0]+16} V${Y[2]}`,color:C.h}, ctrl(288,Y[2]),
    gate(288,Y[0],'R_{3}',true,42),
    gate(364,Y[1],'H',true),
    {t:'line',d:`M420,${Y[1]+16} V${Y[2]}`,color:C.h}, ctrl(420,Y[2]),
    gate(420,Y[1],'R_{2}',true,42),
    gate(496,Y[2],'H',true),
    {t:'line',d:`M556,${Y[0]} L596,${Y[2]}`,color:C.mid},
    {t:'line',d:`M556,${Y[2]} L596,${Y[0]}`,color:C.mid},
    {t:'text',x:576,y:210,label:'swap',fs:11,color:C.mid},
    {t:'text',x:280,y:210,label:'the rotations get smaller as the control gets further away',fs:11.5}
  ];
  return P.blocks({w:720,h:222,items});
}

/* The phase-estimation circuit. */
function qpecirc(){
  const Y=[44,94,144,200];
  const items=[
    wire(Y[0],140,660), wire(Y[1],140,660), wire(Y[2],140,660), wire(Y[3],140,624),
    {t:'text',x:132,y:Y[0]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:12.5},
    {t:'text',x:132,y:Y[1]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:12.5},
    {t:'text',x:132,y:Y[2]+5,anchor:'end',label:'|0\\rangle',tex:true,fs:12.5},
    {t:'text',x:132,y:Y[3]+5,anchor:'end',label:'|u\\rangle',tex:true,fs:12.5},
    gate(176,Y[0],'H',true), gate(176,Y[1],'H',true), gate(176,Y[2],'H',true),
    {t:'line',d:`M240,${Y[2]} V${Y[3]-16}`,color:C.h}, ctrl(240,Y[2]),
    gate(240,Y[3],'U',true,42),
    {t:'line',d:`M316,${Y[1]} V${Y[3]-16}`,color:C.h}, ctrl(316,Y[1]),
    gate(316,Y[3],'U^{2}',true,52),
    {t:'line',d:`M400,${Y[0]} V${Y[3]-16}`,color:C.h}, ctrl(400,Y[0]),
    gate(400,Y[3],'U^{4}',true,52),
    {t:'box',x:466,y:26,w:70,h:140,label:'F^{\\dagger}',tex:true,fs:16,color:C.mid},
    meter(586,Y[0]), meter(586,Y[1]), meter(586,Y[2]),
    {t:'text',x:320,y:236,label:'each control writes its own power of the phase',fs:11.5}
  ];
  return P.blocks({w:720,h:250,items});
}

/* The outcome distribution at two register sizes, for a phase that fits
   neither. */
function qpedist(){
  const prob=(phi,t,y)=>{ const Q=1<<t, d=phi-y/Q;
    if(Math.abs(d-Math.round(d))<1e-12) return 1;
    const n=Math.sin(Math.PI*Q*d), m=Math.sin(Math.PI*d);
    return (n*n)/(Q*Q*m*m); };
  /* The frame reaches past one because the six-qubit peak is 0.875 and a stem
     is drawn outside the clip: a shorter range would let it run off the top. */
  const a=P.Axes({w:540,h:280,xr:[-0.02,1.02],yr:[0,1.40],
    xlabel:'y/2^{t}', ylabel:'P',
    pad:{l:66,r:26,t:28,b:46}, xtarget:5, yticksOverride:[0,0.25,0.5,0.75,1]});
  const draw=(t,col,r)=>{ const Q=1<<t, pts=[];
    for(let y=0;y<Q;y++) pts.push([y/Q, prob(0.3,t,y)]);
    a.stem(pts,{color:col,r,width:1.7,showZero:true}); };
  draw(3,C.in,4.2); draw(6,C.out,2.8);
  a.vline(0.3,{color:C.err,width:1.5,dash:'4 4'});
  a.note(0.32,1.06,'\\varphi = 0.3',{fs:12,color:C.err,anchor:'start',tex:true});
  a.note(0.56,1.32,'t=3',{fs:12,color:C.in,anchor:'start',tex:true});
  a.note(0.56,1.18,'t=6',{fs:12,color:C.out,anchor:'start',tex:true});
  return a.svg();
}

/* The powers of a fixed base modulo a fixed number, and the period they show. */
function orderfig(){
  const pts=[]; let x=1;
  for(let k=0;k<=12;k++){ pts.push([k,x]); x=(x*2)%15; }
  const a=P.Axes({w:540,h:270,xr:[0,12],yr:[0,15.8],
    xlabel:'k', ylabel:'2^{k} \\bmod 15',
    pad:{l:66,r:26,t:28,b:46}, xtarget:6, yticksOverride:[0,4,8,12]});
  a.stem(pts,{color:C.in,r:4.6,width:1.9});
  [0,4,8,12].forEach(k=>a.point(k,1,{color:C.out,r:6.5}));
  a.span(0,4,13.6,'r = 4',{color:C.out,fs:12.5,tex:true});
  a.note(5.2,13.0,'\\text{the period is the order}',{fs:12,color:C.muted,anchor:'start',tex:true});
  return a.svg();
}

/* Where the cost of the order-finding circuit sits. */
function costfig(){
  const a=P.Axes({w:540,h:270,xr:[0,2600],yr:[2,12.4],
    xlabel:'L\\,(\\text{bits of }N)', ylabel:'\\text{gates}',
    pad:{l:74,r:26,t:28,b:46}, xtarget:5,
    yticksOverride:P.decades(2,11).filter(v=>v%2===0), ytickfmt:P.decade});
  a.curve(L=>L>0?3*Math.log10(L)+Math.log10(4):null,{color:C.err,width:2.4});
  a.curve(L=>L>0?2*Math.log10(2*L):null,{color:C.out,width:2.4});
  a.note(120,12.0,'\\text{modular exponentiation: order } L^{3}',{fs:12,color:C.err,anchor:'start',tex:true});
  a.note(1180,7.9,'\\text{the transform: order } L^{2}',{fs:12,color:C.out,anchor:'start',tex:true});
  a.vline(2048,{color:C.rule,width:1.2,dash:'3 4'});
  a.note(2048,2.9,'L=2048',{fs:11.5,color:C.muted,anchor:'middle',tex:true});
  return a.svg();
}

/* The factoring workflow, with the one quantum step marked. */
function workflow(){
  const steps=[
    ['choose a base, and take one greatest common divisor','classical'],
    ['find the order of that base','quantum'],
    ['read the order off by continued fractions','classical'],
    ['confirm the candidate order','classical'],
    ['take two more greatest common divisors','classical']
  ];
  const items=[];
  steps.forEach(([txt,kind],i)=>{
    const y=20+i*40, q=kind==='quantum';
    items.push({t:'box',x:60,y,w:380,h:32,label:txt,fs:12,color:q?C.h:C.rule});
    items.push({t:'text',x:474,y:y+21,anchor:'start',label:kind,fs:12,color:q?C.h:C.muted});
    if(i<4) items.push({t:'line',d:`M250,${y+32} V${y+40}`,color:C.rule});
  });
  return P.blocks({w:720,h:226,items});
}

/* Shor's claim, against the five components. */
function claim(){
  const rows=[['task','factor a number of a given bit length'],
              ['input model','the number itself, with nothing to load'],
              ['accuracy','a constant chance per attempt, checked classically'],
              ['hardware model','fault tolerant, millions of physical qubits'],
              ['baseline','the number field sieve, which is subexponential']];
  const items=[];
  rows.forEach(([k,v],i)=>{
    const y=18+i*38;
    items.push({t:'box',x:28,y,w:142,h:30,label:k,fs:12.5,color:i>=3?C.err:C.h});
    items.push({t:'text',x:186,y:y+20,anchor:'start',label:v,fs:12.5});
  });
  return P.blocks({w:720,h:206,items});
}

window.C6 = [

{t:'page'},

/* ---------------- chapter 6 ---------------- */
{t:'h1', num:'6', text:'Quantum algorithms'},

{t:'p', lead:true, text:'A quantum computer does not try every answer at once. It holds many amplitudes, and a measurement returns one string of bits. An algorithm earns something only if it can arrange for the amplitudes of the answers it does not want to cancel before that measurement happens. This chapter is four ways of arranging exactly that, and they are all the same arrangement.'},

{t:'p', text:'The mechanism is called <b>phase kickback</b>. An operation is written to change one register; it is pointed instead at a register already prepared in a state that operation cannot move; and so the only thing it can do is write a phase onto the register that controlled it. That is the whole of Deutsch, of Deutsch\u2013Jozsa, of phase estimation and of the order finding inside Shor\u2019s algorithm. What differs between them is which question was written into the phase, and which transform was used to make the wrong answers cancel afterwards.'},

{t:'box', kind:'err', hd:'The sentence every section here answers', html:'Preparing a superposition of $2^{n}$ inputs is one layer of Hadamards, it is free, and on its own it is worth nothing: a measurement of that state returns a uniformly random string, which is what a coin does. Every gain in this chapter comes from the interference after the query, never from the superposition before it.'},

/* ---- 6.1 ---- */
{t:'h2', num:'6.1', text:'What a query model counts'},

{t:'p', text:'Most of the results here are stated in a <b>query model</b>. The algorithm is given a black box that computes an unknown function $f$, and it is charged one <b>query</b> each time it uses that box, whatever is inside. The exclusive-or in the second register is what makes the box reversible, and chapter 4 built exactly this embedding.'},

{t:'eqbox', cap:'the oracle, and what one query means', tex:'U_{f}\\,|x\\rangle|y\\rangle = |x\\rangle\\,|y \\oplus f(x)\\rangle',
 after:'The model is useful because it can be reasoned about: how many questions must be asked before the answer is forced is a question with a proof attached to it. It is also a model that hides things on purpose. Building $U_{f}$ as a real circuit costs gates, and those gates are not counted. Loading data into the box, if the function is a lookup rather than a formula, is not counted. Error correction is not counted. A query separation is a theorem about one column of a table with three columns in it.'},

{t:'p', text:'Three costs, then, and they are not interchangeable. The <b>query count</b> is how many times the box is opened. The <b>gate count</b> is what it cost to build the box and everything around it. The <b>end-to-end cost</b> is both of those plus input preparation, fault tolerance, measurement and classical post-processing. An algorithm that needs $25$ queries where a classical method needs $512$ has improved the first column by a factor of twenty; if one quantum query is a circuit of four thousand gates and one classical evaluation is thirty operations, the second column has got six times worse.'},

{t:'p', text:'A word about what is being counted as an input. A <b>decision problem</b> asks a yes-or-no question, and its size is the number of bits the input is written in. The number $N$ has about $\\log_{2}N$ bits, so an algorithm that runs in time $N$ is exponential in the size of its input and not linear. That single point decides most of the arguments in this subject.'},

{t:'ul', items:[
 '<b>P</b> \u2014 decision problems an ordinary algorithm settles in polynomial time.',
 '<b>BPP</b> \u2014 the same, for an algorithm allowed to toss coins and be wrong with probability below one third.',
 '<b>BQP</b> \u2014 the same, for a quantum algorithm with the same allowance.',
 '<b>NP</b> \u2014 problems whose yes answers carry a certificate that can be checked quickly, which says nothing about finding it.']},

{t:'box', kind:'warn', hd:'What is known, and what is not', html:'$\\mathrm{P}\\subseteq\\mathrm{BPP}\\subseteq\\mathrm{BQP}$ and $\\mathrm{P}\\subseteq\\mathrm{NP}$. Whether $\\mathrm{NP}\\subseteq\\mathrm{BQP}$ is open, and no efficient quantum algorithm is known for any NP-complete problem. Grover gives a square root on the search, and a square root of an exponential is still an exponential. Factoring is in NP and in BQP and is not known to be NP-complete \u2014 which is exactly why it can have the structure the rest of this chapter exploits.'},

/* ---- 6.2 ---- */
{t:'h2', num:'6.2', text:'One mechanism: phase kickback'},

{t:'p', text:'The oracle writes $f(x)$ into the second register by flipping it, and a flip is the gate $X$. So choose for the second register the one state that $X$ leaves alone up to a sign. When $f(x)=0$ nothing happens; when $f(x)=1$ the flip happens and produces a minus sign; and both cases are one line.'},

{t:'eqbox', cap:'phase kickback', tex:['X\\,|{-}\\rangle = -\\,|{-}\\rangle', 'U_{f}\\,|x\\rangle|{-}\\rangle = (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle'],
 after:'The second register never changes, so it can be prepared once and ignored. The value of $f$ has become a <b>relative phase</b> among the terms of the first register, and chapter 1 said what that is worth: a relative phase is observable, and it is observable through interference and through nothing else. The step readers re-derive three times before believing it is that the sign belongs to the first register even though the gate was written on the second. It multiplies a term of the whole state, and because the second factor is the same $|{-}\\rangle$ in every term, the only place the sign can make a difference is between the terms of the first.'},

{t:'fig', svg:kick, cap:'The oracle acts, the lower wire comes out exactly as it went in, and the answer is a sign attached to the upper one. Nothing was measured and nothing was copied.'},

{t:'p', text:'Nothing in that argument used the fact that the operation was a bit flip. It used only that the target was prepared in an <b>eigenstate</b> of it. Replace $X$ by any unitary $U$ and $|{-}\\rangle$ by an eigenstate $|u\\rangle$, and the same thing happens with a general phase in place of the sign. Because $U$ is unitary its eigenvalues have modulus one, so they are pure phases and can always be written this way.'},

{t:'eqbox', cap:'the general form', tex:['U\\,|u\\rangle = e^{2\\pi i \\varphi}\\,|u\\rangle', '\\mathrm{c}U\\,\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+|1\\rangle\\big)|u\\rangle = \\tfrac{1}{\\sqrt2}\\big(|0\\rangle+e^{2\\pi i \\varphi}|1\\rangle\\big)|u\\rangle'],
 after:'The number wanted is now a relative phase on one qubit, which is the one kind of number this course can read. If the third register holds a superposition $\\sum_{k}c_{k}|u_{k}\\rangle$ rather than a single eigenstate, the procedure returns an estimate of $\\varphi_{k}$ with probability $|c_{k}|^{2}$: it samples one eigenphase and does not list the spectrum. That is a limitation everywhere else in the chapter and it is the whole mechanism of order finding.'},

{t:'p', text:'Now the rule the rest of the chapter answers to. One layer of Hadamards on $n$ qubits produces every input at once, and one query produces every output at once. Measure at that point and a uniformly random $x$ comes out: every amplitude has the same modulus, so every string is equally likely, and the signs \u2014 which are the entire content of what the query returned \u2014 are invisible in this basis. The run has cost a query and returned a coin toss.'},

{t:'eqbox', cap:'what the last layer of Hadamards is for', tex:'\\langle 0^{n}|\\,H^{\\otimes n}\\Big(\\tfrac{1}{2^{n/2}}\\textstyle\\sum_{x}(-1)^{f(x)}|x\\rangle\\Big) = \\frac{1}{2^{n}}\\sum_{x}(-1)^{f(x)}',
 after:'That single number is what the algorithm is for. It is not any one value of $f$; it is a global property of the whole table, and it arrived because the unwanted terms cancelled. A quantum algorithm has to make the amplitudes of every answer it does not want cancel, and it has to do that before anything is measured. The readout returns $n$ bits, never $2^{n}$ numbers, so a design that needs to see many amplitudes has already failed.'},

{t:'box', kind:'err', hd:'"It computes all the values in parallel" is true and useless', html:'The superposition really does contain all $2^{n}$ values. It is useless because the only way to look at it is to measure it, and a measurement of a state with $2^{n}$ equal amplitudes is a random number generator. The interesting question is never how many values are held; it is which arrangement of phases lets one number survive the sum.'},

/* ---- 6.3 ---- */
{t:'h2', num:'6.3', text:'Deutsch and Deutsch\u2013Jozsa'},

{t:'p', text:'A black box holds one of the four functions $f:\\{0,1\\}\\to\\{0,1\\}$. Two of them are <b>constant</b> and two are <b>balanced</b>, returning $0$ once and $1$ once. The task is to say which class it is in, and not to find the function. Classically this needs both values, because knowing $f(0)$ alone rules nothing out. The quantum circuit uses one query: prepare $|{+}\\rangle|{-}\\rangle$, query once, and apply a Hadamard to the query qubit.'},

{t:'eqbox', cap:'Deutsch\u2019s algorithm, in one line', tex:'\\tfrac{1}{\\sqrt2}\\Big((-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\Big) \\;\\xrightarrow{\\;H\\;}\\; \\pm\\,|\\,f(0)\\oplus f(1)\\,\\rangle',
 after:'The reading is $f(0)\\oplus f(1)$, which is $0$ for both constant functions and $1$ for both balanced ones. It is exactly the one bit that was asked for, and the two bits that were not asked for never appear. A saving of one query on a problem with four instances is not a useful computation and this circuit is not a benchmark; its importance is that it is the smallest complete example of the mechanism.'},

{t:'p', text:'The same circuit works on $n$ query qubits, for a function promised to be constant or to return $1$ on exactly half of its $2^{n}$ inputs. The only quantity that has to be computed is the amplitude of the string $0^{n}$, and the Hadamard layer makes that a plain average of the signs. A constant function makes every sign the same, so the average is $\\pm1$ and the probability of reading $0^{n}$ is one. A balanced function has exactly $2^{n-1}$ plus signs and $2^{n-1}$ minus signs, so the average is exactly zero. Nothing is approximate.'},

{t:'fig', svg:signs, cap:'Four promised functions on three bits and the average of their signs. The two balanced rows cancel term by term; that cancellation is the algorithm, and the promise is what guarantees it.'},

{t:'box', kind:'err', hd:'The promise is not decoration', html:'Drop it and the algorithm is worthless. For a function that is neither constant nor balanced the amplitude of $0^{n}$ is some number between $-1$ and $1$, so a reading of $0^{n}$ no longer proves anything and a reading of something else no longer proves anything either. A function on four bits returning $1$ on six of its sixteen inputs gives an amplitude of $0.25$ and a probability of $0.0625$, and neither reading licenses a conclusion.'},

{t:'p', text:'What the separation is, stated carefully. A classical algorithm that must never be wrong has to keep asking until the answer is forced: in the worst case it sees $2^{n-1}$ equal values and still cannot tell, so it needs $2^{n-1}+1$ queries against the quantum circuit\u2019s one. That is a genuine exponential separation, and it is a separation between <b>exact</b> query complexities <b>under a promise</b>.'},

{t:'ex', hd:'Example 6.1 · the gap collapses against a randomised algorithm', rows:[
 ['Given','A promised function on $n=10$ bits, so $1024$ inputs.'],
 ['Find','The exact classical count, the quantum count, and the count for an error probability below $10^{-6}$.'],
 ['Solution','Exact: $2^{9}+1 = 513$. Quantum: $1$. Randomised: $k$ distinct queries all agree on a balanced function with probability below $2^{-(k-1)}$, so $k=21$ suffices.'],
 ['Check','Push $n$ to $30$. The exact count becomes $5.4\\times10^{8}$ and the randomised count is still $21$: the first grows and the second does not. The exponential separation is the distance to the first count only.']]},

/* ---- 6.4 ---- */
{t:'h2', num:'6.4', text:'The quantum Fourier transform'},

{t:'p', text:'On $n$ qubits there are $Q=2^{n}$ basis states, and the transform is defined on each of them. Every output amplitude has the same modulus $1/\\sqrt{Q}$; what carries the input is the <b>rate</b> at which the phase turns as the output index advances.'},

{t:'eqbox', cap:'the transform', tex:'F_{Q}\\,|x\\rangle = \\frac{1}{\\sqrt{Q}}\\sum_{k=0}^{Q-1} e^{2\\pi i\\,xk/Q}\\,|k\\rangle',
 after:'It is unitary, so it is a change of basis and nothing more: no information is created and none is destroyed, and the inverse takes the opposite sign in the exponent. On a general input it acts by linearity. The one input worth memorising is $F_{Q}|0\\rangle$, which is the uniform superposition because every phase is one \u2014 so the layer of Hadamards that starts every algorithm in this chapter <b>is</b> the transform of the all-zero state, and on one qubit the Hadamard is exactly $F_{2}$.'},

{t:'fig', svg:fourier, cap:'The eight amplitudes of the transform of the state three, drawn in the complex plane. All eight have the same length, and each step turns by $3\\times45^{\\circ}=135^{\\circ}$. Measuring at this point returns a uniformly random index, whatever the input was.'},

{t:'p', text:'The transform looks like a $Q\\times Q$ matrix and would take $Q^{2}$ multiplications to apply as one. It factors instead into a short circuit, because the phase separates into one factor per bit of the input. Each qubit gets one Hadamard and then one controlled rotation from every qubit below it, with the rotation getting smaller as the control gets further away.'},

{t:'eqbox', cap:'the circuit, and its size', tex:['R_{k} = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i/2^{k}} \\end{bmatrix}', 'n \\text{ Hadamards} + \\tfrac12 n(n-1) \\text{ rotations} = \\tfrac12 n(n+1) \\text{ gates}'],
 after:'Ten qubits means fifty-five gates and five output swaps; the smallest rotation there is an angle of $2\\pi/1024$, about a third of a degree. Rotations below a threshold are usually dropped, which turns a hardware problem into a bounded algorithmic error and takes the gate count from $O(n^{2})$ to $O(n\\log n)$. That approximate transform is the standard choice in every resource estimate for factoring.'},

{t:'fig', svg:qftcirc, cap:'Three qubits: three Hadamards, three controlled rotations and one swap. Six gates for a transform whose matrix has sixty-four entries.'},

{t:'box', kind:'err', hd:'The transform does not return a spectrum', html:'Hand it a state $\\sum_{x}a_{x}|x\\rangle$ and it produces $\\sum_{k}\\tilde a_{k}|k\\rangle$. It does not print the $Q$ numbers $\\tilde a_{k}$, and it cannot: the readout returns $n$ bits, so one run returns one index $k$ drawn with probability $|\\tilde a_{k}|^{2}$. It is useful only where the thing wanted can be inferred from samples of that distribution \u2014 a period, an order, an eigenphase. A classical fast Fourier transform takes a stored vector of $Q$ numbers and returns $Q$ numbers in about $Q\\log_{2}Q$ operations; the two solve different problems and their costs should not be compared as though they did not.'},

/* ---- 6.5 ---- */
{t:'h2', num:'6.5', text:'Phase estimation'},

{t:'p', text:'One controlled $U$ put a phase onto one control qubit. Use $t$ control qubits, and let control $j$ apply $U$ raised to the power $2^{j}$, so that the phase it collects is doubled each time. The counting register is then exactly the state the Fourier transform produces from the number $2^{t}\\varphi$, so applying the <b>inverse</b> transform collapses the phase ramp onto the number that produced it.'},

{t:'eqbox', cap:'what the counting register holds before the inverse transform', tex:'\\frac{1}{\\sqrt{2^{t}}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i k\\varphi}\\,|k\\rangle',
 after:'Measuring the $t$ qubits gives an integer $y$, and $y/2^{t}$ estimates $\\varphi$. The powers are powers of two because a $t$-bit binary fraction is $\\varphi \\approx 0.b_{1}b_{2}\\ldots b_{t}$ and multiplying by $2^{j}$ shifts the binary point $j$ places: the control that applies $U^{2^{j}}$ is reading one bit of the answer. The circuit is a binary expansion written in phases, and the inverse transform is the machine that reads a binary expansion out of phases.'},

{t:'fig', svg:qpecirc, cap:'Three counting qubits, three controlled powers and the inverse transform. The eigenstate on the bottom wire is unchanged from beginning to end.'},

{t:'p', text:'Take first the case where the phase happens to be a $t$-bit binary fraction, $\\varphi = m/2^{t}$. Then the counting register holds exactly the transform of $|m\\rangle$, the inverse transform returns $|m\\rangle$, and the other $2^{t}-1$ outcomes have amplitude exactly zero. It is worth seeing why: the amplitude of outcome $y$ is a geometric sum, and away from $y=m$ its terms are $2^{t}$ unit vectors spread evenly round the circle, which add to nothing. That is the cancellation of section 6.2, complete rather than approximate \u2014 and it is the special case, because almost every real number is not a $t$-bit fraction.'},

{t:'eqbox', cap:'the general case', tex:'P(y) = \\frac{1}{2^{2t}}\\left|\\frac{\\sin\\!\\big(\\pi\\,2^{t}\\delta\\big)}{\\sin(\\pi\\delta)}\\right|^{2}, \\qquad \\delta = \\varphi - \\frac{y}{2^{t}}',
 after:'Two guarantees follow and both are worth remembering: the single nearest outcome carries at least $4/\\pi^{2}\\approx0.405$, and the two nearest together at least $8/\\pi^{2}\\approx0.811$. Neither floor moves as the register grows. To get $n$ correct bits with failure probability at most $\\varepsilon$, take $t = n + \\lceil \\log_{2}(2 + 1/2\\varepsilon) \\rceil$ counting qubits: the extra qubits are cheap, since halving the failure probability adds about one, while accuracy is expensive, because each extra bit of $n$ doubles the applications of $U$.'},

{t:'fig', svg:qpedist, cap:'The same phase read with three counting qubits and with six. The peak sharpens onto a finer grid and the tails shrink, and at no register size does one outcome carry all the probability.'},

{t:'ex', hd:'Example 6.2 · a phase that fits nothing', rows:[
 ['Given','$\\varphi = 0.3$ and $t=3$, so $2^{t}\\varphi = 2.4$.'],
 ['Find','The two most likely readings and their probabilities.'],
 ['Solution','The bracketing outcomes are $y=2$ and $y=3$. Putting $\\delta = 0.05$ and $\\delta=-0.075$ into the formula gives $P(2)=0.577$ and $P(3)=0.259$.'],
 ['Check','Together $0.836$, above the guaranteed $0.811$ as it must be. The remaining $0.164$ is spread over the other six outcomes, and a run that lands there returns a badly wrong phase with no warning attached.']]},

{t:'p', text:'Now add up what the circuit asks for. The inverse transform is $\\tfrac12 t(t+1)$ gates. The controlled powers are $U$ applied $1+2+\\cdots+2^{t-1} = 2^{t}-1$ times, which is exponential in the register size and has to be: reading $t$ bits of a phase means evolving for a time proportional to $2^{t}$, however the circuit is arranged. At ten counting qubits that is $1023$ applications against $55$ gates, and at a $U$ costing $500$ gates the transform is about one part in ten thousand of the circuit.'},

{t:'box', kind:'warn', hd:'Efficient only when the powers can be built directly', html:'Phase estimation is efficient when $U^{2^{j}}$ can be built in a circuit of size polynomial in $j$, rather than by repeating $U$ that many times. Order finding can do it, because squaring a modular multiplier is another modular multiplier. For an arbitrary $U$ it cannot be done, and calling the inverse transform efficient does not make the algorithm efficient. Replacing the counting register by one qubit measured and reused, with the earlier results fed forward, saves $t-1$ qubits and saves nothing at all in the controlled evolution.'},

{t:'p', text:'One application closes a hole chapter 5 left open. The best number of Grover iterations needs the number of marked candidates, which is usually exactly what is not known. The Grover step is a rotation of a plane by $2\\theta$ and a rotation of a plane has eigenvalues $e^{\\pm2i\\theta}$, so it is a unitary with the wanted number in its eigenphase. Estimating $\\theta$ gives $M = N\\sin^{2}\\theta$, and the register does not even need an eigenstate: the uniform superposition is a combination of the two eigenvectors, and $\\pm\\theta$ give the same $\\sin^{2}\\theta$. The counting costs about $\\sqrt{N}$ applications itself, so counting first and searching after is still a square-root method overall.'},

/* ---- 6.6 ---- */
{t:'h2', num:'6.6', text:'Order finding'},

{t:'p', text:'Fix a composite $N$ and a number $a$ with no factor in common with it. The <b>order</b> of $a$ modulo $N$ is the smallest positive $r$ with $a^{r}\\equiv1$. Because $a$ and $N$ share no factor, multiplying by $a$ is a permutation of $0,1,\\ldots,N-1$ \u2014 nothing is lost and nothing collides \u2014 and a permutation is a unitary, so it is a legal gate. The work register holds $m$ qubits with $2^{m}\\ge N$, and the basis states above $N$ are completed as any permutation, usually the identity.'},

{t:'eqbox', cap:'the multiplier, and what its eigenphases carry', tex:['U_{a}\\,|y\\rangle = |\\,a\\,y \\bmod N\\,\\rangle', 'U_{a}\\,|u_{s}\\rangle = e^{2\\pi i s/r}\\,|u_{s}\\rangle, \\qquad |u_{s}\\rangle = \\frac{1}{\\sqrt r}\\sum_{k=0}^{r-1} e^{-2\\pi i sk/r}\\,|a^{k} \\bmod N\\rangle'],
 after:'The order sits in the denominators of the eigenphases, and phase estimation reads eigenphases: that is the whole reduction. One obstacle remains \u2014 preparing $|u_{s}\\rangle$ needs $r$, which is what is being looked for \u2014 and the way round it is that the $r$ eigenvectors add up to something trivial. Since $r^{-1/2}\\sum_{s}|u_{s}\\rangle = |1\\rangle$, starting the work register in the state one costs a single gate, and the circuit then samples one eigenphase $s/r$ with $s$ uniform on $0,\\ldots,r-1$. The limitation of section 6.2 has become the preparation.'},

{t:'fig', svg:orderfig, cap:'Powers of two modulo fifteen. The sequence returns to one after four steps and then repeats forever, so the order is four. Finding this length is the only quantum step in factoring.'},

{t:'p', text:'Phase estimation needs $U_{a}^{2^{j}}$ for every counting qubit, and applying $U_{a}$ that many times would be exponential. It is not done that way: squaring the number instead of repeating the gate gives $U_{a}^{2^{j}} = U_{a^{2^{j}} \\bmod N}$, and the constant $a^{2^{j}} \\bmod N$ is computed classically before the circuit is built. Each counting qubit therefore controls one modular multiplication by a precomputed constant, and the whole middle of the circuit is a reversible modular exponentiation.'},

{t:'fig', svg:costfig, cap:'The two parts of the circuit against the size of the number being factored. A reversible multiplier on $L$-bit numbers costs about $L^{2}$ gates and there are about $2L$ of them, so the arithmetic is order $L^{3}$ where the transform is order $L^{2}$.'},

{t:'box', kind:'err', hd:'"Shor\u2019s algorithm is the quantum Fourier transform" is the wrong summary', html:'At two thousand bits the arithmetic is about two thousand times the transform. What makes the algorithm work is that modular exponentiation can be done coherently and reversibly, so the phase information survives it; what makes it expensive is that the same modular exponentiation has to be done coherently and reversibly. Chapter 4\u2019s ancillas and uncomputing are where that cost comes from.'},

{t:'p', text:'The measurement returns an integer $y$, and $y/Q$ is close to some $s/r$ \u2014 but $Q$ is a power of two and $r$ is not, so it never equals it. What is needed is a way to find a fraction with a small denominator near a given number, and that is an old classical algorithm: repeatedly take the whole part and invert the remainder. The fractions this builds, the <b>convergents</b>, are the best approximations with small denominators, and the one wanted is the last whose denominator is below $N$.'},

{t:'eqbox', cap:'why the reading is enough', tex:'\\left| \\frac{y}{Q} - \\frac{s}{r} \\right| \\le \\frac{1}{2Q}, \\qquad Q > N^{2} \\;\\Longrightarrow\\; \\frac{s}{r} \\text{ is the only such fraction}',
 after:'The uniqueness needs $Q>N^{2}$, so the counting register carries about $2L$ qubits for an $L$-bit $N$. That is not a detail: it doubles the counting register and doubles the number of controlled modular multiplications, and it is where the qubit counts in published resource estimates come from. The candidate is then confirmed by computing $a^{r} \\bmod N$ once, which is fast, and rejected if the answer is not one.'},

{t:'ex', hd:'Example 6.3 · one reading, one order', rows:[
 ['Given','$N=21$, $a=2$, $t=9$ so $Q=512$, and a reading of $y=427$.'],
 ['Find','The order.'],
 ['Solution','$427/512 = 0.833984$, whose expansion is $[0;1,5,42,2]$ with convergents $0/1$, $1/1$, $5/6$, $211/253$ and $427/512$. The last denominator below $21$ is $6$, so $r=6$; and $2^{6}=64=3\\times21+1$ confirms it.'],
 ['Check','The true fraction is $5/6 = 0.833333$, and the reading missed it by $0.00065$ \u2014 below $1/2Q = 0.00098$, exactly as the bound promises. The reading was never exact and did not need to be.']]},

{t:'p', text:'A run can fail in four ways, and all four are detected by arithmetic that costs nothing. The measurement can land on $s=0$, which says nothing about $r$. The values $s$ and $r$ can share a factor, so the convergent is a proper divisor of $r$ and the check fails. The order can turn out odd, so there is no square root to take. And $a^{r/2}$ can be $-1$ modulo $N$, in which case both greatest common divisors come out trivial. The first two are repaired by running the circuit again; the last two by choosing a different $a$.'},

{t:'box', kind:'ok', hd:'A failure that announces itself is not a real problem', html:'For $N=pq$ the probability that the order is even and its half power is not $-1$ is at least a half, so a constant number of attempts suffices and the repetition costs a factor rather than an exponent. What makes this tolerable is that success is <b>checkable</b>: multiply the candidate factors and see whether they give $N$. Compare Deutsch\u2013Jozsa or Grover, where a wrong answer looks exactly like a right one and the confidence has to come from the analysis instead.'},

/* ---- 6.7 ---- */
{t:'h2', num:'6.7', text:'Factoring'},

{t:'p', text:'The reduction from factoring to order finding is a page of school algebra. Suppose the order $r$ of $a$ is even. Then $a^{r}-1 \\equiv 0$, so the product of $a^{r/2}-1$ and $a^{r/2}+1$ is divisible by $N$ \u2014 and provided $a^{r/2}\\not\\equiv\\pm1$, neither factor is divisible by $N$ on its own. The prime factors of $N$ must therefore be split between the two.'},

{t:'eqbox', cap:'the factors, from the order', tex:'\\gcd\\big(a^{r/2}-1,\\,N\\big) \\quad\\text{and}\\quad \\gcd\\big(a^{r/2}+1,\\,N\\big)',
 after:'Euclid\u2019s algorithm finds a greatest common divisor in about $\\log N$ steps and it is the cheapest thing in the whole procedure. The algebra above turns "the number $N$ is a product" into "these two specific numbers share a factor with $N$", and the second question is easy. The quantum step exists only to supply the exponent that makes the algebra apply.'},

{t:'fig', svg:workflow, cap:'The five steps, with the quantum one marked. Four of them run on a laptop in microseconds; the whole cost of the algorithm is inside the one box that does not.'},

{t:'ex', hd:'Example 6.4 · fifteen, and the base that fails', rows:[
 ['Given','$N=15$ with $a=2$, and then the same $N$ with $a=14$.'],
 ['Find','The factors in each case.'],
 ['Solution','For $a=2$: the powers are $1,2,4,8,1$, so $r=4$; it is even and $2^{2}=4$ is not $-1$ modulo fifteen, so $\\gcd(3,15)=3$ and $\\gcd(5,15)=5$. For $a=14$: $14^{2}=196=13\\times15+1$, so $r=2$, but $14\\equiv-1$, and both divisors come out trivial.'],
 ['Check','$3\\times5=15$. And $a=14$ is not a rare accident: of the eight numbers below fifteen coprime to it, two are useless \u2014 one because its order is odd and one for the reason above \u2014 so the procedure has to be ready to discard a base and pick another.']]},

{t:'box', kind:'warn', hd:'What a small demonstration shows', html:'Fifteen has been factored on hardware many times, and the circuits used are almost always simplified using knowledge of the answer: a multiplier built for a known order is not the general circuit. A demonstration at this size shows that the pieces fit together. It is not evidence about what a large number would cost, and the difference between the two is about ten orders of magnitude.'},

{t:'p', text:'RSA publishes a modulus $N=pq$ and keeps the factorisation secret; anyone who can factor $N$ has the private key. Diffie\u2013Hellman and elliptic-curve schemes rest on the discrete logarithm, which the same machinery solves. Symmetric ciphers and hash functions are in a different position: the best known quantum attack is Grover, a square root, and doubling the key length restores the margin. Their security was never a proof in either case \u2014 it is the absence of a known efficient attack at the sizes in use, and that is what changed when the attack became known and only the machine was missing.'},

{t:'box', kind:'err', hd:'The migration deadline is set by the data, not by the machine', html:'Traffic can be recorded today at negligible cost and decrypted whenever a capable machine exists. So the question for any particular secret is how long it has to hold, and a secret that must last twenty years is already exposed. A <b>post-quantum</b> scheme is a classical algorithm \u2014 it runs on ordinary computers \u2014 chosen because it rests on a problem for which no efficient quantum attack is known. It is not quantum cryptography, which is a different subject about distributing keys over physical channels.'},

/* ---- 6.8 ---- */
{t:'h2', num:'6.8', text:'What the claim says'},

{t:'p', text:'Chapter 5 said a resource claim names five things. Written out for factoring, two of the five carry almost all the weight.'},

{t:'fig', svg:claim, cap:'The claim against the five. The two in the error tone are the ones usually left unstated, and they are the ones that decide whether any of this happens on a real machine.'},

{t:'ul', items:[
 '<b>Hardware model.</b> The logical circuit is about $L^{3}$ gates, but every logical gate is a code block of many physical qubits with rounds of error correction. Published estimates for a two-thousand-bit modulus run to millions of physical qubits and hours of running time.',
 '<b>Baseline.</b> The general number field sieve takes about $e^{c\\,L^{1/3}(\\log L)^{2/3}}$ operations, which is subexponential and not exponential. So the gap is superpolynomial rather than exponential, and it is a gap against the best <b>known</b> classical algorithm.']},

{t:'box', kind:'ok', hd:'What the result does say, stated fairly', html:'On an ideal fault-tolerant quantum computer, factoring takes a number of operations polynomial in the bit length, where every known classical method takes subexponentially many. That is a genuine and important separation and the strongest known statement of its kind. It is a statement about two algorithms, not about the difficulty of the problem: no theorem says factoring is hard, and a fast classical factoring algorithm would remove the separation without making any of the quantum mechanics wrong.'},

{t:'p', text:'One last placing. Nothing in the order-finding circuit used the fact that the operation was multiplication; it used that some function repeats, with distinct values within one period. Given a circuit for such a function, the same construction returns the period. Order finding is the case $f(x)=a^{x}\\bmod N$, the discrete logarithm is another case, and all of them are instances of one statement about hidden structure in a commutative group. That is where nearly all the known superpolynomial quantum speedups live. Grover is the conspicuous exception, and it is an exception because unstructured search has no such structure to find \u2014 which is exactly why its saving is only a square root.'},

/* ---- 6.9 ---- */
{t:'h2', num:'6.9', text:'Summary'},

{t:'ul', items:[
 'Phase kickback is the one mechanism: $U_{f}|x\\rangle|{-}\\rangle=(-1)^{f(x)}|x\\rangle|{-}\\rangle$, and with any unitary, a controlled $U$ acting on one of its eigenstates puts $e^{2\\pi i\\varphi}$ on the control.',
 'A superposition costs one layer of Hadamards and buys nothing on its own. Every gain comes from making the unwanted amplitudes cancel before the measurement.',
 'Deutsch\u2013Jozsa: the amplitude of $0^{n}$ is $2^{-n}\\sum_{x}(-1)^{f(x)}$, which is $\\pm1$ for a constant function and exactly $0$ for a balanced one. One query against $2^{n-1}+1$ exact classical queries, and against about $21$ randomised ones whatever $n$ is.',
 'The transform $F_{Q}|x\\rangle = Q^{-1/2}\\sum_{k}e^{2\\pi ixk/Q}|k\\rangle$ costs $\\tfrac12 n(n+1)$ gates and returns one index, never a spectrum.',
 'Phase estimation costs $2^{t}-1$ applications of $U$ against $\\tfrac12 t(t+1)$ gates in the inverse transform. A phase that is a $t$-bit fraction is read with certainty; otherwise the two nearest readings carry at least $8/\\pi^{2}$, and $t = n + \\lceil\\log_{2}(2+1/2\\varepsilon)\\rceil$ buys $n$ bits at confidence $1-\\varepsilon$.',
 'Order finding: $U_{a}|y\\rangle=|ay \\bmod N\\rangle$ has eigenphases $s/r$, and the state one is their even mixture. Continued fractions recover $r$ from a reading, one modular exponentiation confirms it, and $\\gcd(a^{r/2}\\pm1,N)$ gives the factors.',
 'Modular exponentiation is order $L^{3}$ and the transform is order $L^{2}$, so the arithmetic is the algorithm\u2019s cost. Everything around order finding \u2014 the base, the continued fractions, the checks, the repeats \u2014 is classical.']},

{t:'box', kind:'err', hd:'Four errors that cost a whole question', html:'Calling a query count a runtime. Quoting the Deutsch\u2013Jozsa separation without the words "exact" and "promised". Saying that the Fourier transform returns the spectrum. And treating the classical work around order finding as the expensive part of factoring.'},

{t:'box', kind:'ok', hd:'Where this leaves the three sentences of chapter 0', html:'The state is large and the readout is small: every algorithm here reads $n$ bits and had to make everything else cancel first. A relative phase is everything: kickback writes the answer as one and the transform reads it back. And a resource claim names five things: written out in full, Deutsch\u2013Jozsa is a promise problem, Grover is quadratic, and Shor is a gap against one classical algorithm rather than against a proof.'}

];
})();
