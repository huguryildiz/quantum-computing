/* ==========================================================================
   Module 3 — Mixed states and entanglement.

   Chapters 1 and 2 assumed the system is alone and its state is one vector.
   Both assumptions fail as soon as a qubit sits next to anything else, and
   this chapter replaces the vector with an operator that survives.

   Four things in here are the ones students get wrong, and each has a scene of
   its own. A density operator does not remember which preparation produced it,
   so two different stories about the same matrix are the same physics. A part
   of a pure whole is genuinely mixed, and that mixedness is not noise and not
   ignorance about a classical fact. A channel is not a mistake in the theory;
   it is what a unitary looks like when part of the world is ignored. And a
   Bell correlation is not a signal: the reduced state of one qubit does not
   move when the other is measured, and no message crosses.

   The chapter is written so that it can be read after chapter 4 as well as
   before it, which is what the course map promises. Nothing in it needs the
   Bloch sphere; where a picture of the ball helps, it is drawn as a
   cross-section and derived from the three Pauli means chapter 2 already has.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const R2 = Math.SQRT1_2;

/* ---------------------------------------------------------------- figures --
   Each is a function, so the palette is the one in force when it is drawn. */

/* Why a vector is not enough: one pure state of a pair, and the part of it
   that has no vector of its own. */
function figWhy(){
  return P.blocks({w:740,h:210,items:[
    {t:'box',x:40,y:44,w:300,h:110,label:''},
    {t:'box',x:70,y:70,w:110,h:58,label:'A',tex:true,fs:16,color:C.in},
    {t:'box',x:200,y:70,w:110,h:58,label:'B',tex:true,fs:16,color:C.mid},
    {t:'text',x:190,y:32,label:'one pure state of the pair',fs:12},
    {t:'arrow',x1:340,y1:99,x2:440,y2:99,label:'ignore B'},
    {t:'box',x:440,y:70,w:170,h:58,label:'\\rho_{A}',tex:true,fs:18,color:C.out},
    {t:'text',x:525,y:180,label:'a matrix, because no vector describes it',fs:12},
    {t:'text',x:190,y:180,label:'a vector describes this',fs:12}
  ]});
}

/* The one-qubit density matrix, with its four entries named. The diagonal is
   what a computational-basis reading returns; the off-diagonal is what an X or
   a Y reading sees, and it is the only place a relative phase survives. */
function figRho(){
  return P.blocks({w:740,h:250,items:[
    {t:'box',x:200,y:46,w:150,h:70,label:'p_{0}',tex:true,fs:18,color:C.in},
    {t:'box',x:350,y:46,w:150,h:70,label:'c',tex:true,fs:18,color:C.mid},
    {t:'box',x:200,y:116,w:150,h:70,label:'c^{*}',tex:true,fs:18,color:C.mid},
    {t:'box',x:350,y:116,w:150,h:70,label:'p_{1}',tex:true,fs:18,color:C.in},
    {t:'text',x:275,y:36,label:'|0\\rangle',tex:true,fs:13},
    {t:'text',x:425,y:36,label:'|1\\rangle',tex:true,fs:13},
    {t:'text',x:190,y:88,anchor:'end',label:'\\langle 0|',tex:true,fs:13},
    {t:'text',x:190,y:158,anchor:'end',label:'\\langle 1|',tex:true,fs:13},
    {t:'text',x:275,y:222,label:'populations',fs:12,color:C.in},
    {t:'text',x:425,y:222,label:'coherences',fs:12,color:C.mid},
    {t:'text',x:520,y:80,anchor:'start',label:'what a Z reading returns',fs:12},
    {t:'text',x:520,y:158,anchor:'start',label:'what an X or Y reading sees',fs:12}
  ]});
}

/* Which qubit matrices are states. With a real coherence the condition is one
   inequality, and the region it cuts out is a half disc. Isotropic, because
   the shape of that region is the claim. */
function figPhysical(){
  /* 400 px over an x span of 1.60 and 150 px over a y span of 0.60: both
     250 px to the unit, so the boundary is a genuine half circle. */
  const a = P.Axes({w:480,h:224,xr:[-0.30,1.30],yr:[-0.05,0.55],
    pad:{l:56,r:24,t:30,b:44},
    xticksOverride:[0,0.25,0.5,0.75,1], yticksOverride:[0,0.25,0.5],
    grid:false, zeroAxes:true, arrows:false});
  a.area(p => Math.sqrt(Math.max(0,p*(1-p))), 0, 1, {color:C.dec.in});
  const arc=[]; for(let i=0;i<=160;i++){ const p=i/160; arc.push([p, Math.sqrt(Math.max(0,p*(1-p)))]); }
  a.poly(arc,{color:C.in,width:2.4});
  a.point(0.55,0.20,{color:C.out,r:6});
  a.note(0.55,0.20,'\\text{a state}',{fs:12.5,color:C.out,dx:12,dy:26,tex:true});
  a.point(0.85,0.45,{color:C.err,r:6});
  a.note(1.00,0.45,'\\text{not a state}',{fs:12.5,color:C.err,dy:5,tex:true});
  a.note(1.26,0,'p_{0}',{fs:13,color:C.ink,anchor:'end',dy:34,tex:true});
  a.note(-0.28,0.30,'|c|',{fs:13,color:C.ink,dy:0,tex:true});
  return a.svg();
}

/* Purity against the mixing of two orthogonal states. One at the ends, one
   half in the middle, and never below it for a qubit. */
function figPurity(){
  const a = P.Axes({w:560,h:250,xr:[0,1],yr:[0.35,1.08],
    xlabel:'p', ylabel:'\\operatorname{Tr}\\rho^{2}',
    pad:{l:64,r:24,t:26,b:46}, xtarget:4, ytarget:4});
  a.curve(p => (1-p)*(1-p) + p*p, {color:C.in, width:2.4});
  a.hline(0.5,{color:C.err, width:1.4, dash:'4 4'});
  a.point(0.5,0.5,{color:C.err,r:6});
  a.note(0.5,0.5,'\\text{maximally mixed}',{fs:12.5,color:C.err,anchor:'middle',dy:-12,tex:true});
  a.point(0,1,{color:C.out,r:6});
  a.point(1,1,{color:C.out,r:6});
  return a.svg();
}

/* A cross-section of the set of qubit states: the disc of Bloch vectors, with
   a pure state on the rim, a mixed one inside and the maximally mixed state at
   the centre. Isotropic, because the rim is a circle and the length of the
   vector is the whole quantity. */
function figBall(){
  /* 400 px over an x span of 5.52 and 174 px over a y span of 2.40: both
     72.5 px to the unit, so the rim is round. The frame is far wider than the
     ball needs, and the three labels go in the space beside it. */
  const a = P.Axes({w:452,h:226,xr:[-2.76,2.76],yr:[-1.20,1.20],
    pad:{l:26,r:26,t:26,b:26}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const ring=[]; for(let i=0;i<=200;i++){ const t=2*Math.PI*i/200; ring.push([Math.cos(t),Math.sin(t)]); }
  a.poly(ring,{color:C.grid,width:1.6});
  a.poly([[-1.18,0],[1.18,0]],{color:C.rule,width:1.1});
  a.poly([[0,-1.18],[0,1.18]],{color:C.rule,width:1.1});
  const pu=[Math.cos(0.9),Math.sin(0.9)];
  a.poly([[0,0],pu],{color:C.in,width:2.6});
  a.point(pu[0],pu[1],{color:C.in,r:6});
  a.note(pu[0],pu[1],'\\text{pure}',{fs:13,color:C.in,dx:10,dy:-6,tex:true});
  const mx=[0.46*Math.cos(-0.6),0.46*Math.sin(-0.6)];
  a.poly([[0,0],mx],{color:C.mid,width:2.6});
  a.point(mx[0],mx[1],{color:C.mid,r:6});
  a.note(mx[0],mx[1],'\\text{mixed}',{fs:13,color:C.mid,dx:10,dy:16,tex:true});
  a.point(0,0,{color:C.err,r:6});
  a.note(0,0,'I/2',{fs:13,color:C.err,dx:-10,dy:-12,tex:true,anchor:'end'});
  a.note(1.22,0,'x',{fs:13,color:C.muted,dx:6,dy:18,tex:true});
  a.note(0,1.10,'z',{fs:13,color:C.muted,dx:8,tex:true});
  return a.svg();
}

/* A channel, drawn as what it is: a unitary on the system together with
   whatever it touches, and then the rest ignored. */
function figKraus(){
  return P.blocks({w:740,h:220,items:[
    {t:'box',x:20,y:40,w:110,h:56,label:'\\rho',tex:true,fs:18,color:C.in},
    {t:'box',x:20,y:120,w:110,h:56,label:'environment',fs:12},
    {t:'arrow',x1:130,y1:68,x2:190,y2:68},
    {t:'arrow',x1:130,y1:148,x2:190,y2:148},
    {t:'box',x:190,y:40,w:150,h:136,label:'one unitary',fs:14,color:C.h},
    {t:'arrow',x1:340,y1:108,x2:400,y2:108},
    {t:'box',x:400,y:80,w:140,h:56,label:'\\operatorname{Tr}_{E}',tex:true,fs:16},
    {t:'arrow',x1:540,y1:108,x2:600,y2:108},
    {t:'box',x:600,y:80,w:120,h:56,label:'\\mathcal{E}(\\rho)',tex:true,fs:16,color:C.out},
    {t:'text',x:370,y:206,label:'nothing is broken here: a channel is a unitary with part of the world ignored',fs:12}
  ]});
}

/* Amplitude damping: the population flows one way and the coherence follows a
   square root, so a half-damped qubit keeps more coherence than population. */
function figDamp(){
  const a = P.Axes({w:560,h:250,xr:[0,1],yr:[0,0.78],
    xlabel:'\\gamma', ylabel:'\\text{value}',
    pad:{l:64,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(g => 0.5*(1-g), {color:C.in, width:2.4});
  a.curve(g => 0.5*Math.sqrt(1-g), {color:C.mid, width:2.2, dash:'5 4'});
  /* The names go in the strip above both curves, which nothing reaches. */
  a.note(0.30,0.70,'\\rho_{11}',{fs:13,color:C.in,tex:true});
  a.note(0.62,0.70,'|\\rho_{01}|',{fs:13,color:C.mid,tex:true});
  return a.svg();
}

/* Phase damping: the populations do not move at all and the coherence is
   multiplied by 1 - 2p, which vanishes at one half. */
function figDephase(){
  const a = P.Axes({w:560,h:250,xr:[0,1],yr:[0,0.78],
    xlabel:'p', ylabel:'\\text{value}',
    pad:{l:64,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(() => 0.5, {color:C.in, width:2.4});
  a.curve(p => 0.5*Math.abs(1-2*p), {color:C.mid, width:2.2, dash:'5 4'});
  a.point(0.5,0,{color:C.err,r:6});
  a.note(0.5,0.20,'\\text{coherence gone}',{fs:12.5,color:C.err,anchor:'middle',tex:true});
  a.note(0.05,0.70,'\\rho_{00},\\rho_{11}',{fs:13,color:C.in,tex:true});
  a.note(0.80,0.70,'|\\rho_{01}|',{fs:13,color:C.mid,tex:true});
  return a.svg();
}

/* Relaxation and dephasing in time, with the ceiling the model imposes on the
   coherence drawn beside the coherence itself. */
function figT1T2(){
  const T2 = 1.5;
  const a = P.Axes({w:560,h:250,xr:[0,4],yr:[0,1.35],
    xlabel:'t/T_{1}', ylabel:'\\text{value}',
    pad:{l:64,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(t => Math.exp(-t), {color:C.in, width:2.4});
  a.curve(t => Math.exp(-t/T2), {color:C.mid, width:2.2, dash:'5 4'});
  a.curve(t => Math.exp(-t/2), {color:C.grid, width:1.6});
  /* Three names in one row above everything drawn; all three curves are below
     0.45 past t = 1.2, so the strip is empty. */
  a.note(1.15,1.22,'\\rho_{11}',{fs:13,color:C.in,tex:true});
  a.note(1.95,1.22,'|\\rho_{01}|',{fs:13,color:C.mid,tex:true});
  a.note(2.85,1.22,'T_{2}=2T_{1}',{fs:12.5,color:C.muted,tex:true});
  return a.svg();
}

/* Two qubits: which entry of the column belongs to which pair of bits, under
   the ordering this course fixes. */
function figOrder(){
  const rows = [['|00\\rangle','c_{0}','q_{1}=0,\\,q_{0}=0'],
                ['|01\\rangle','c_{1}','q_{1}=0,\\,q_{0}=1'],
                ['|10\\rangle','c_{2}','q_{1}=1,\\,q_{0}=0'],
                ['|11\\rangle','c_{3}','q_{1}=1,\\,q_{0}=1']];
  const items = [];
  rows.forEach(([k,c,d],i)=>{
    const y = 24 + i*46;
    items.push({t:'text',x:250,y:y+30,anchor:'end',label:k,tex:true,fs:15});
    items.push({t:'box',x:268,y:y,w:110,h:40,label:c,tex:true,fs:15,
      color:i===0?C.in:i===3?C.out:C.mid});
    items.push({t:'text',x:400,y:y+28,anchor:'start',label:d,tex:true,fs:13});
  });
  items.push({t:'text',x:370,y:236,label:'the left qubit is the most significant, so the index is two q1 plus q0',fs:12});
  return P.blocks({w:740,h:252,items});
}

/* The partial trace on two qubits, read off the block structure of the joint
   matrix. Two different reductions, two different operations on the blocks. */
function figPtrace(){
  const B=[['M_{00}',60,40],['M_{01}',175,40],['M_{10}',60,150],['M_{11}',175,150]];
  const items = B.map(([l,x,y])=>({t:'box',x,y,w:105,h:90,label:l,tex:true,fs:15,
    color:(l==='M_{00}'||l==='M_{11}')?C.in:C.mid}));
  items.push({t:'text',x:170,y:24,label:'the joint matrix, in blocks',fs:12});
  items.push({t:'arrow',x1:300,y1:85,x2:370,y2:85});
  items.push({t:'text',x:380,y:92,anchor:'start',
    label:'\\rho_{A}=\\begin{bmatrix}\\mathrm{Tr}\\,M_{00}&\\mathrm{Tr}\\,M_{01}\\\\ \\mathrm{Tr}\\,M_{10}&\\mathrm{Tr}\\,M_{11}\\end{bmatrix}',tex:true,fs:13});
  items.push({t:'text',x:380,y:126,anchor:'start',label:'the trace of each block',fs:12});
  items.push({t:'arrow',x1:300,y1:195,x2:370,y2:195});
  items.push({t:'text',x:380,y:202,anchor:'start',label:'\\rho_{B}=M_{00}+M_{11}',tex:true,fs:14});
  items.push({t:'text',x:380,y:234,anchor:'start',label:'the sum of the diagonal blocks',fs:12});
  return P.blocks({w:760,h:262,items});
}

/* A pure pair whose halves are mixed, beside a product pair whose halves are
   not. Purity is the quantity, and it is computed from the states. */
function figLocal(){
  const a = P.Axes({w:560,h:250,xr:[-0.7,3.7],yr:[0,1.14],
    ylabel:'\\operatorname{Tr}\\rho^{2}', pad:{l:64,r:24,t:30,b:62},
    xticksOverride:[], ytarget:4});
  const bar=(n,v,f,l)=>{ a.rect(n-0.28,0,n+0.28,v,{fill:f});
    a.poly([[n-0.28,v],[n+0.28,v]],{color:l,width:2.6}); };
  bar(0,1,C.dec.in,C.in);   bar(1,0.5,C.dec.err,C.err);
  bar(2,1,C.dec.in,C.in);   bar(3,1,C.dec.out,C.out);
  [['pair',0],['half',1],['pair',2],['half',3]].forEach(([t,k])=>
    a.note(k,0,t,{fs:12,color:C.muted,anchor:'middle',dy:24}));
  a.note(0.5,0,'|\\Phi^{+}\\rangle',{fs:14,color:C.in,anchor:'middle',dy:48,tex:true});
  a.note(2.5,0,'|{+}\\rangle\\otimes|0\\rangle',{fs:14,color:C.out,anchor:'middle',dy:48,tex:true});
  return a.svg();
}

/* The two Schmidt coefficients of cos(t)|00> + sin(t)|11>, against t. They
   cross where the state is maximally entangled and one of them vanishes where
   it is a product. */
function figSchmidt(){
  const a = P.Axes({w:560,h:250,xr:[0,Math.PI/2],yr:[0,1.10],
    xlabel:'\\theta', ylabel:'\\lambda',
    pad:{l:60,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(t => Math.cos(t)**2, {color:C.in, width:2.4});
  a.curve(t => Math.sin(t)**2, {color:C.mid, width:2.2, dash:'5 4'});
  a.vline(Math.PI/4,{color:C.err,width:1.6,dash:'3 4'});
  a.note(Math.PI/4+0.06,1.02,'\\text{maximally entangled}',{fs:12,color:C.err,tex:true});
  /* Each name sits in the band between the two curves on its own side, where
     one of them is above 0.77 and the other below 0.24. */
  a.note(0.25,0.45,'\\lambda_{1}',{fs:13,color:C.in,tex:true});
  a.note(1.10,0.45,'\\lambda_{2}',{fs:13,color:C.mid,tex:true});
  return a.svg();
}

/* How the Schmidt coefficients are actually computed: reshape, then one
   singular value decomposition. */
function figSVD(){
  return P.blocks({w:740,h:220,items:[
    {t:'box',x:20,y:56,w:150,h:70,label:'c_{0},c_{1},c_{2},c_{3}',tex:true,fs:14,color:C.in},
    {t:'arrow',x1:170,y1:91,x2:250,y2:91,label:'reshape'},
    {t:'box',x:250,y:56,w:170,h:70,label:'C=\\begin{bmatrix}c_{0}&c_{1}\\\\c_{2}&c_{3}\\end{bmatrix}',tex:true,fs:14,color:C.h},
    {t:'arrow',x1:420,y1:91,x2:500,y2:91,label:'SVD'},
    {t:'box',x:500,y:56,w:210,h:70,label:'s_{1}\\ge s_{2}\\ge 0',tex:true,fs:15,color:C.out},
    {t:'text',x:95,y:160,label:'the amplitudes',fs:12},
    {t:'text',x:335,y:160,label:'rows are qubit 1, columns qubit 0',fs:12},
    {t:'text',x:605,y:160,label:'the Schmidt coefficients',fs:12},
    {t:'text',x:370,y:200,label:'the number of non-zero singular values is the Schmidt rank',fs:12}
  ]});
}

/* The entropy of a two-term Schmidt spectrum. Zero at the ends, where the
   state is a product, and one bit in the middle. */
function figEntropy(){
  const h = l => (l<=0||l>=1) ? 0 : -l*Math.log2(l) - (1-l)*Math.log2(1-l);
  const a = P.Axes({w:560,h:250,xr:[0,1],yr:[0,1.12],
    xlabel:'\\lambda_{1}', ylabel:'S\\,(\\text{bits})',
    pad:{l:64,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(h, {color:C.in, width:2.4});
  a.point(0.5,1,{color:C.out,r:6});
  a.note(0.5,1,'\\text{one ebit}',{fs:12.5,color:C.out,anchor:'middle',dy:-12,tex:true});
  a.point(0,0,{color:C.err,r:5});
  a.point(1,0,{color:C.err,r:5});
  a.note(0.86,0,'\\text{product}',{fs:12.5,color:C.err,anchor:'middle',dy:-12,tex:true});
  return a.svg();
}

/* The three Pauli correlations of the Bell state, beside those of the
   classical mixture that has the same reduced states. */
function figBell(){
  const a = P.Axes({w:560,h:260,xr:[-0.7,5.7],yr:[-1.30,1.62],
    ylabel:'\\langle \\sigma\\otimes\\sigma\\rangle', pad:{l:64,r:24,t:30,b:62},
    xticksOverride:[], yticksOverride:[-1,-0.5,0.5,1]});
  const bar=(n,v,f,l)=>{ a.rect(n-0.26,0,n+0.26,v,{fill:f});
    a.poly([[n-0.26,v],[n+0.26,v]],{color:l,width:2.6}); };
  bar(0,1,C.dec.in,C.in);   bar(1,-1,C.dec.in,C.in);   bar(2,1,C.dec.in,C.in);
  bar(3,0,C.dec.err,C.err); bar(4,0,C.dec.err,C.err);  bar(5,1,C.dec.err,C.err);
  [['XX',0],['YY',1],['ZZ',2],['XX',3],['YY',4],['ZZ',5]].forEach(([t,k])=>
    a.note(k,0,t,{fs:12,color:C.muted,anchor:'middle',dy:k<3?(k===1?-16:24):24}));
  /* Both group names go in the strip above the tallest bar, so neither can
     land on the geometry it is naming. */
  a.note(1,1.40,'|\\Phi^{+}\\rangle',{fs:14,color:C.in,anchor:'middle',tex:true});
  a.note(4,1.40,'\\text{classical mixture}',{fs:13,color:C.err,anchor:'middle',tex:true});
  return a.svg();
}

/* The assumption a Bell inequality tests: that the four answers exist together
   before anyone chooses which two to ask for. */
function figChshBox(){
  const rows = [['a_{0}=\\pm1',10],['a_{1}=\\pm1',66],['b_{0}=\\pm1',122],['b_{1}=\\pm1',178]];
  const items = [
    {t:'box',x:30,y:80,w:120,h:58,label:'\\lambda',tex:true,fs:18,color:C.mid},
    {t:'text',x:90,y:60,label:'whatever fixed the run',fs:12}
  ];
  rows.forEach(([l,y],i)=>{
    items.push({t:'arrow',x1:150,y1:109,x2:250,y2:y+22});
    items.push({t:'box',x:250,y:y,w:130,h:44,label:l,tex:true,fs:14,color:C.in});
  });
  items.push({t:'text',x:400,y:100,anchor:'start',
    label:'a_{0}(b_{0}+b_{1}) + a_{1}(b_{0}-b_{1}) = \\pm 2',tex:true,fs:15});
  items.push({t:'text',x:400,y:132,anchor:'start',label:'one bracket is zero, the other is two',fs:12});
  items.push({t:'text',x:370,y:248,label:'no assignment of four values escapes the range, so no average does either',fs:12});
  return P.blocks({w:760,h:262,items});
}

/* The CHSH combination for one family of measurement angles, against the
   classical bound and the largest value quantum mechanics allows. */
function figCHSH(){
  const a = P.Axes({w:560,h:260,xr:[0,90],yr:[0,3.2],
    xlabel:'\\varphi\\,(\\text{degrees})', ylabel:'S',
    pad:{l:60,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  const d = Math.PI/180;
  a.curve(f => 2*(Math.cos(f*d)+Math.sin(f*d)), {color:C.in, width:2.4});
  a.hline(2,{color:C.err, width:1.8, dash:'5 4'});
  a.hline(2*Math.SQRT2,{color:C.out, width:1.4, dash:'2 4'});
  a.point(45,2*Math.SQRT2,{color:C.out,r:6});
  a.note(45,2*Math.SQRT2,'2\\sqrt2',{fs:13,color:C.out,anchor:'middle',dy:-12,tex:true});
  a.note(8,1.28,'\\text{classical bound}',{fs:12.5,color:C.err,tex:true});
  return a.svg();
}

/* What one party sees, for three settings of the other. Nothing moves, which
   is the whole content of no signalling. */
function figNoSig(){
  const a = P.Axes({w:560,h:250,xr:[-0.7,5.7],yr:[0,1.12],
    ylabel:'\\text{probability for A}', pad:{l:64,r:24,t:30,b:62},
    xticksOverride:[], ytarget:4});
  const bar=(n,f,l)=>{ a.rect(n-0.26,0,n+0.26,0.5,{fill:f});
    a.poly([[n-0.26,0.5],[n+0.26,0.5]],{color:l,width:2.6}); };
  [0,1].forEach(k=>bar(k,C.dec.in,C.in));
  [2,3].forEach(k=>bar(k,C.dec.mid,C.mid));
  [4,5].forEach(k=>bar(k,C.dec.out,C.out));
  [['+1',0],['-1',1],['+1',2],['-1',3],['+1',4],['-1',5]].forEach(([t,k])=>
    a.note(k,0,t,{fs:12,color:C.muted,anchor:'middle',dy:24}));
  a.note(0.5,0,'B\\text{ measures }Z',{fs:12.5,color:C.in,anchor:'middle',dy:48,tex:true});
  a.note(2.5,0,'B\\text{ measures }X',{fs:12.5,color:C.mid,anchor:'middle',dy:48,tex:true});
  a.note(4.5,0,'B\\text{ does nothing}',{fs:12.5,color:C.out,anchor:'middle',dy:48,tex:true});
  return a.svg();
}

/* The chapter as one ladder: each step drops an assumption the step before it
   was resting on. */
function figLadder(){
  return P.blocks({w:740,h:180,items:[
    {t:'box',x:20,y:44,w:150,h:60,label:'|\\psi\\rangle',tex:true,fs:17,color:C.in},
    {t:'arrow',x1:170,y1:74,x2:222,y2:74},
    {t:'box',x:222,y:44,w:150,h:60,label:'\\rho',tex:true,fs:17,color:C.mid},
    {t:'arrow',x1:372,y1:74,x2:424,y2:74},
    {t:'box',x:424,y:44,w:150,h:60,label:'\\mathcal{E}(\\rho)',tex:true,fs:16,color:C.h},
    {t:'arrow',x1:574,y1:74,x2:626,y2:74},
    {t:'box',x:626,y:44,w:100,h:60,label:'\\operatorname{Tr}_{B}',tex:true,fs:16,color:C.out},
    {t:'text',x:95,y:132,label:'alone and known',fs:12},
    {t:'text',x:297,y:132,label:'unknown, or a part',fs:12},
    {t:'text',x:499,y:132,label:'no longer closed',fs:12},
    {t:'text',x:676,y:132,label:'no longer whole',fs:12},
    {t:'text',x:370,y:166,label:'each step drops an assumption the one before it was resting on',fs:12}
  ]});
}

const SC = [

/* ---------------------------------------------------------------- 3.0.1 -- */
{ id:'m3-open', module:'M3', nav:'Why a vector is not enough', title:'Two situations no state vector describes',
  objective:'Name the two situations in which a pure state vector cannot be written, and say what replaces it.',
  keywords:'mixed state density operator open system subsystem ignorance entanglement module 3 overview',
  src:'L6 · density operators: pure states, mixtures, and reduced states', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Mixed states and entanglement'},
  {t:'title', text:'Two situations no state vector describes'},
  {t:'lede', text:'Every state so far has been one normalised vector. That is enough only while the system is alone and the preparation is known exactly. Two ordinary situations break it, and both are the normal case rather than the exception.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p><b>The preparation is not known.</b> A device emits $|0\\rangle$ half the time and $|1\\rangle$ the other half, and nobody records which. That is not the superposition $\\left(|0\\rangle+|1\\rangle\\right)/\\sqrt2$: the superposition gives a certain answer in the $X$ basis and this device gives a coin there. The two are different physics and no single vector tells them apart.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p><b>The system is part of something larger.</b> Two qubits can be in a pure state of the pair while neither one has a vector of its own. Chapter 2 ended on a version of this: a measurement whose result was thrown away leaves a system that no vector describes.</p>'},
      {t:'note', kind:'def', head:'What replaces the vector', html:'One matrix, the <b>density operator</b> $\\rho$. It is built out of the same objects chapter 1 already has — outer products of states — and it covers the pure case as well, so nothing is lost by using it everywhere.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figWhy(),
      caption:'A pure state of a pair, and the half of it that has no vector. This is not a failure of the mathematics and not an approximation: no vector exists that gives the right answer to every measurement on $A$ alone, and a matrix does.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The two cases feel different and are not', html:'The first is ignorance about a classical fact and the second is not — the pair is completely known. Yet the two produce the same matrix for the part, and every prediction about that part agrees. This chapter shows why that is a feature: what can be predicted is exactly what the matrix carries, and nothing more.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.1.1 -- */
{ id:'m3-rho', module:'M3', nav:'The density operator', title:'The density operator, and what its four entries are',
  objective:'Write the density operator of a pure state and of a mixture, and name the meaning of each entry.',
  keywords:'density operator density matrix outer product ensemble populations coherences mixture pure state',
  src:'L6 · density operators: pure states, mixtures, and reduced states', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'The density operator, and what its four entries are'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>For a pure state the definition is one outer product, and chapter 1 built that construction already:</p>'},
    {t:'eq', key:true, tex:'\\rho_{\\psi} = |\\psi\\rangle\\langle\\psi|'},
    {t:'body', html:'<p>For a preparation that produces $|\\psi_{i}\\rangle$ with classical probability $p_{i}$, the operator is the weighted sum of those:</p>'},
    {t:'eq', key:true, tex:'\\rho = \\sum_{i} p_{i}\\,|\\psi_{i}\\rangle\\langle\\psi_{i}|, \\qquad p_{i}\\ge 0, \\qquad \\sum_{i} p_{i} = 1'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The weights are ordinary probabilities: they describe a classical coin deciding which state was made, and they are added, not superposed. A superposition of two states is a third state; a mixture of two states is neither of them and is not a vector at all.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figRho(),
      caption:'The four entries of a one-qubit density matrix. The diagonal holds the probabilities a computational-basis reading returns. The off-diagonal holds the coherence, and it is the only place a relative phase survives — which is why an $X$ or a $Y$ reading is the one that sees it.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right)$.'],
        ['Work', '$c_{0}=1/\\sqrt2$ and $c_{1}=i/\\sqrt2$, so $c_{0}c_{1}^{*}=-i/2$.'],
        ['Answer', '$\\rho=\\tfrac12\\begin{bmatrix}1&-i\\\\i&1\\end{bmatrix}$.'],
        ['Check', 'The trace is one, and $\\rho^{2}=\\rho$, which is what a pure state must satisfy.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The global phase disappears by itself', html:'Replacing $|\\psi\\rangle$ by $e^{i\\gamma}|\\psi\\rangle$ leaves $\\rho$ unchanged, because the two phases meet as $e^{i\\gamma}e^{-i\\gamma}$. The convention of chapter 1 — that a global phase is not physical — stops being a convention here and becomes a property of the object. The relative phase, in the off-diagonal entry, survives untouched.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.1.2 -- */
{ id:'m3-physical', module:'M3', nav:'Which matrices are states', title:'Which matrices are physical states, and which are not',
  objective:'Test a candidate matrix against the three conditions and say which one a given matrix fails.',
  keywords:'hermitian positive semidefinite trace one physical density matrix eigenvalues test coherence bound',
  src:'L6 · which matrices are physical states?', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'Which matrices are physical states, and which are not'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Not every square matrix is a state. Three conditions are needed, and each one is there to protect a probability:</p>'},
    {t:'eq', key:true, tex:'\\rho = \\rho^{\\dagger}, \\qquad \\rho \\succeq 0, \\qquad \\operatorname{Tr}\\rho = 1'},
    {t:'body', html:'<p>Hermiticity makes every expectation value real. Positivity, meaning $\\langle v|\\rho|v\\rangle\\ge 0$ for every $|v\\rangle$, makes every probability non-negative. Unit trace makes them add to one. Together the eigenvalues of $\\rho$ are a probability distribution.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>For one qubit the three collapse to one inequality on the coherence. With $\\rho_{00}=p_{0}$ and $\\rho_{11}=1-p_{0}$, positivity says the determinant is not negative:</p>'},
      {t:'eq', tex:'\\left|\\rho_{01}\\right|^{2} \\;\\le\\; p_{0}\\left(1-p_{0}\\right)'},
      {t:'small', html:'So the coherence is capped by the populations, and a state whose populations are lopsided cannot carry much of it. That is a real physical statement, not bookkeeping: a nearly-certain qubit is nearly incoherent.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figPhysical(),
      caption:'Every one-qubit matrix with a real coherence, drawn as a point. The shaded half disc is the physical region and the curve is its edge, where the matrix is pure. The point above the curve is Hermitian and has trace one, and is still not a state.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$M=\\begin{bmatrix}0.5&0.8\\\\0.8&0.5\\end{bmatrix}$. Is it a state?'],
        ['Work', 'It is Hermitian and its trace is one, so the first two tests pass. Its eigenvalues are $0.5\\pm 0.8$.'],
        ['Answer', 'No: one eigenvalue is $-0.3$, so $M\\succeq 0$ fails.'],
        ['Check', 'The inequality says the same thing faster: $|\\rho_{01}|$ may be at most $\\sqrt{0.5\\times 0.5}=0.5$, and $0.8$ is larger.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Two tests are not three', html:'Hermitian with unit trace is easy to arrange and means nothing on its own. Positivity is the condition that is actually restrictive, and it is the one skipped: a matrix estimated from noisy measured data very often fails it by a small amount, and every tomography routine has to project back onto the physical set. A reported state with a negative eigenvalue is a report that has not finished.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.1.3 -- */
{ id:'m3-expect', module:'M3', nav:'Predictions from the matrix', title:'Every prediction, from one trace',
  objective:'Compute an outcome probability and an expectation value from a density operator.',
  keywords:'trace rho A expectation probability povm effects cyclicity born rule mixed state prediction',
  src:'L6 · expectation values and measurement probabilities', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'Every prediction, from one trace'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The Born rule and the expectation value of chapter 2 both have one-line replacements, and both work for pure and mixed states without a change of case:</p>'},
    {t:'eq', key:true, tex:'\\langle A\\rangle = \\operatorname{Tr}\\left(\\rho A\\right), \\qquad p(m) = \\operatorname{Tr}\\left(\\rho E_{m}\\right)'},
    {t:'body', html:'<p>The derivation is one move — the trace does not care about the order of a product, as long as the order is only rotated:</p>'},
    {t:'eq', tex:'\\operatorname{Tr}\\left(|\\psi\\rangle\\langle\\psi|A\\right) = \\langle\\psi|A|\\psi\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Apply that term by term to $\\rho=\\sum_{i}p_{i}|\\psi_{i}\\rangle\\langle\\psi_{i}|$ and the result is $\\sum_{i}p_{i}\\langle\\psi_{i}|A|\\psi_{i}\\rangle$: the quantum average inside each branch, then the classical average over branches. Two kinds of uncertainty, one formula, and the formula never says which is which.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\rho=\\tfrac12|0\\rangle\\langle 0|+\\tfrac12|{+}\\rangle\\langle {+}|$.'],
        ['Work', 'The matrix is $\\begin{bmatrix}0.75&0.25\\\\0.25&0.25\\end{bmatrix}$.'],
        ['Answer', '$\\langle Z\\rangle=0.75-0.25=0.5$ and $\\langle X\\rangle=0.25+0.25=0.5$, while $\\langle Y\\rangle=0$.'],
        ['Check', 'By branches: $\\langle Z\\rangle=\\tfrac12(1)+\\tfrac12(0)=0.5$ and $\\langle X\\rangle=\\tfrac12(0)+\\tfrac12(1)=0.5$. Same numbers, and no matrix was multiplied.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'This is the whole reason the object is useful', html:'$\\rho$ carries exactly what is needed to predict every measurement on the system and nothing else. It is not a shorthand for a longer story about which state was really made; it is the complete answer to every question that can be asked of the system alone. The next scene is the sharpest form of that statement.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.1.4 -- */
{ id:'m3-ensemble', module:'M3', nav:'Ensembles are not unique', title:'One matrix, many preparations, and no experiment between them',
  objective:'Show two different ensembles with the same density operator and say what follows.',
  keywords:'ensemble decomposition not unique maximally mixed identity over two operationally identical preparation',
  src:'L6 · density operators: pure states, mixtures, and reduced states', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'One matrix, many preparations, and no experiment between them'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A density operator does not remember how it was made. The plainest example is the maximally mixed qubit, which two very different devices produce:</p>'},
    {t:'eq', key:true, tex:'\\frac{I}{2} = \\tfrac12\\left(|0\\rangle\\langle 0| + |1\\rangle\\langle 1|\\right) = \\tfrac12\\left(|{+}\\rangle\\langle {+}| + |{-}\\rangle\\langle {-}|\\right)'},
    {t:'body', html:'<p>One device flips a coin and emits $|0\\rangle$ or $|1\\rangle$. The other flips a coin and emits $|{+}\\rangle$ or $|{-}\\rangle$. The matrices are equal, so by the last scene every prediction about them is equal too.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'What "operationally identical" means', html:'No measurement, no sequence of measurements, and no number of copies distinguishes the two devices. They are the same state of knowledge about the system, whatever the engineer who built them believes. Where two preparations give different matrices, some measurement tells them apart; where they give the same matrix, none does.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The two devices above, and a $Z$ measurement.'],
        ['Work', 'The first gives $0$ or $1$ with probability $\\tfrac12$ each, directly. The second emits $|{\\pm}\\rangle$, and each of those gives $0$ or $1$ with probability $\\tfrac12$.'],
        ['Answer', 'The same distribution, $\\tfrac12$ and $\\tfrac12$.'],
        ['Check', 'Now try $X$. The second device gives a certain answer inside each branch, but the branch itself was a coin, so the answer is a coin again. Every basis is a coin, which is exactly what $I/2$ says.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Where this is misread', html:'"The qubit really was in $|0\\rangle$ or $|1\\rangle$, we just do not know which" is a story, not a fact, and the second device shows it is not forced. Nothing in the mathematics picks a preferred decomposition, and no experiment does either. The matrix is the physics; the ensemble behind it is a description of a laboratory.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.2.1 -- */
{ id:'m3-purity', module:'M3', nav:'Purity', title:'Purity: one number that says how mixed a state is',
  objective:'Compute the purity of a state and place it between its two bounds.',
  keywords:'purity trace rho squared bounds maximally mixed pure state rank one idempotent dimension',
  src:'L6 · which matrices are physical states?', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Purity and the ball'},
  {t:'title', text:'Purity: one number that says how mixed a state is'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The single most useful number about a density operator is the trace of its square:</p>'},
    {t:'eq', key:true, tex:'\\gamma = \\operatorname{Tr}\\left(\\rho^{2}\\right) = \\sum_{k}\\lambda_{k}^{2}, \\qquad \\frac{1}{d} \\le \\gamma \\le 1'},
    {t:'body', html:'<p>The upper bound is reached exactly by pure states, where one eigenvalue is one and the rest are zero — equivalently $\\rho^{2}=\\rho$, or $\\rho$ has rank one. The lower bound belongs to the maximally mixed state $I/d$, whose eigenvalues are all $1/d$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Purity is cheap to compute and needs no diagonalisation: $\\operatorname{Tr}(\\rho^{2})$ is the sum of the squared moduli of all the entries. For one qubit that is $p_{0}^{2}+p_{1}^{2}+2|\\rho_{01}|^{2}$, and it can be read off the matrix by eye.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figPurity(),
      caption:'The purity of the mixture $(1-p)|0\\rangle\\langle 0| + p|1\\rangle\\langle 1|$. It is one at both ends, where the preparation is certain, and one half in the middle, where the coin is fair. For a qubit nothing can go below one half.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\rho=\\begin{bmatrix}0.75&0.25\\\\0.25&0.25\\end{bmatrix}$, the state of the last section.'],
        ['Work', '$0.75^{2}+0.25^{2}+2(0.25)^{2}=0.5625+0.0625+0.125$.'],
        ['Answer', '$\\gamma=0.75$: mixed, but much closer to pure than to $I/2$.'],
        ['Check', 'Its eigenvalues are about $0.854$ and $0.146$, and $0.854^{2}+0.146^{2}=0.75$. Two routes, one number.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Purity does not identify a state', html:'It is one number and a qubit state needs three. For a qubit the trace and the purity fix the two eigenvalues but say nothing about the eigenbasis, so a whole family of states shares one purity. In three dimensions and above even the spectrum is not pinned down by it. Purity says <b>how</b> mixed, never <b>which</b> state.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.2.2 -- */
{ id:'m3-ball', module:'M3', nav:'The ball of qubit states', title:'A qubit state is a vector of length at most one',
  objective:'Write a qubit density operator in the Pauli basis and read purity off the length of its vector.',
  keywords:'bloch vector ball pauli expansion length purity eigenvalues mixed inside sphere surface qubit',
  src:'L6 · example: a pure qubit', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Purity and the ball'},
  {t:'title', text:'A qubit state is a vector of length at most one'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The three Pauli means chapter 2 collected into a vector are not a summary of a qubit state: they <b>are</b> the state. The four matrices $I,X,Y,Z$ span every two-by-two matrix, and the trace condition fixes the coefficient of $I$.</p>'},
    {t:'eq', key:true, tex:'\\rho = \\tfrac12\\left(I + \\mathbf{r}\\cdot\\boldsymbol\\sigma\\right), \\qquad r_{a} = \\operatorname{Tr}\\left(\\rho\\,\\sigma_{a}\\right)'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\lambda_{\\pm} = \\tfrac12\\left(1 \\pm \\left|\\mathbf{r}\\right|\\right), \\qquad \\operatorname{Tr}\\rho^{2} = \\tfrac12\\left(1 + \\left|\\mathbf{r}\\right|^{2}\\right)',
        note:'Positivity is now the single statement $|\\mathbf{r}|\\le 1$, so the set of qubit states is a solid ball: pure states on the surface, mixed states inside, $I/2$ at the centre.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figBall(),
      caption:'A flat cross-section through that ball. A pure state reaches the rim, a mixed one falls short, and $I/2$ sits at the centre with no direction at all. Chapter 4 draws the whole sphere; here only the length matters.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\rho=\\begin{bmatrix}0.75&0.25\\\\0.25&0.25\\end{bmatrix}$ again.'],
        ['Work', '$r_{z}=0.5$, $r_{x}=2(0.25)=0.5$, $r_{y}=0$, so $|\\mathbf{r}|=\\sqrt{0.5}\\approx 0.707$.'],
        ['Check', '$\\tfrac12(1+0.5)=0.75$, the purity of the last scene, and $\\lambda_{\\pm}=0.854,\\,0.146$ as before.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The centre is not half way between $|0\\rangle$ and $|1\\rangle$', html:'$\\left(|0\\rangle+|1\\rangle\\right)/\\sqrt2$ is $|{+}\\rangle$, a pure state on the rim. The centre is the <b>mixture</b> of $|0\\rangle$ and $|1\\rangle$. Adding vectors and adding matrices are different operations, and this is the picture in which the difference is impossible to miss.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.3.1 -- */
{ id:'m3-kraus', module:'M3', nav:'Quantum channels', title:'A channel: what a unitary looks like from inside',
  objective:'State the Kraus form of a channel and check that it preserves the trace.',
  keywords:'quantum channel kraus operators cptp completely positive trace preserving operator sum environment',
  src:'L6 · quantum channels and Kraus operators', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'A channel: what a unitary looks like from inside'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 2 said a closed system evolves by a unitary. A qubit on a chip is not closed. The evolution of an open system is a <b>quantum channel</b>, and every channel can be written as a sum of terms of one shape:</p>'},
    {t:'eq', key:true, tex:'\\mathcal{E}(\\rho) = \\sum_{k} K_{k}\\,\\rho\\,K_{k}^{\\dagger}, \\qquad \\sum_{k} K_{k}^{\\dagger}K_{k} = I'},
    {t:'body', html:'<p>The second condition is what keeps the trace at one. Check it directly: $\\operatorname{Tr}\\mathcal{E}(\\rho)=\\sum_{k}\\operatorname{Tr}\\left(K_{k}^{\\dagger}K_{k}\\rho\\right)=\\operatorname{Tr}\\rho$, using the same rotation of the trace as before. A unitary is the one-term case, $K_{0}=U$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The reason this form is general rather than convenient is the figure: couple the system to an environment, run one unitary on the pair, then ignore the environment. Every $K_{k}$ is one column of that unitary as seen from one final environment state, and every channel arises this way.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figKraus(),
      caption:'A channel, drawn as what it is. Nothing in the theory has been weakened: the whole is still a closed system running a unitary. What makes the map on $\\rho$ non-unitary is only that part of the result is never looked at.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Completely positive, not merely positive', html:'A channel must send states to states even when the system is one half of an entangled pair that it is applied to alone. That is a stronger requirement than sending states to states on its own, and it is the reason for the word <b>completely</b>. The Kraus form builds it in; a map written down by hand may satisfy the weaker condition and fail this one.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The operators are not the channel', html:'Two different sets of Kraus operators can describe the same channel — they are related by a unitary mixing of the set — so the number of terms and their individual form are not physical. Only the map $\\rho\\mapsto\\mathcal{E}(\\rho)$ is. Reading one Kraus operator as "what really happened to the qubit" is reading a choice of coordinates as a fact.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.3.2 -- */
{ id:'m3-damp', module:'M3', nav:'Amplitude damping', title:'Amplitude damping: energy leaves, and the coherence follows',
  objective:'Apply the amplitude-damping Kraus operators and say what happens to each entry.',
  keywords:'amplitude damping relaxation energy loss spontaneous emission kraus population coherence square root',
  src:'L6 · quantum channels and Kraus operators', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Amplitude damping: energy leaves, and the coherence follows'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A qubit in its upper level can emit and fall to the lower one. The channel that describes this has two Kraus operators, with $\\gamma$ the probability that the emission happens:</p>'},
    {t:'eq', key:true, tex:'K_{0}=\\begin{bmatrix}1&0\\\\0&\\sqrt{1-\\gamma}\\end{bmatrix}, \\qquad K_{1}=\\begin{bmatrix}0&\\sqrt{\\gamma}\\\\0&0\\end{bmatrix}'},
    {t:'body', html:'<p>Multiplying out gives the effect entry by entry, and this is the whole content of the channel:</p>'},
    {t:'eq', key:true, tex:'\\rho_{11} \\mapsto (1-\\gamma)\\,\\rho_{11}, \\qquad \\rho_{01} \\mapsto \\sqrt{1-\\gamma}\\;\\rho_{01}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'$K_{1}$ is not a matrix any unitary could be: it sends $|1\\rangle$ to $|0\\rangle$ and $|0\\rangle$ to nothing. It describes the branch in which a photon was emitted, and the branch is not reversible because the photon is gone. The two branches together do preserve the trace.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDamp(),
      caption:'The upper population and the coherence of $|{+}\\rangle$ under this channel. The population falls linearly in $\\gamma$ and the coherence falls as its square root, so at every partial damping there is more coherence left than population.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|{+}\\rangle$, so $\\rho=\\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$, with $\\gamma=\\tfrac12$.'],
        ['Work', '$\\rho_{11}\\to 0.25$, so $\\rho_{00}\\to 0.75$, and $\\rho_{01}\\to \\sqrt{0.5}\\times 0.5 \\approx 0.3536$.'],
        ['Answer', '$\\rho\\to\\begin{bmatrix}0.75&0.354\\\\0.354&0.25\\end{bmatrix}$, of purity $0.875$.'],
        ['Check', 'By the Bloch vector: $r_{z}=0.5$, $r_{x}=0.707$, so $|\\mathbf{r}|^{2}=0.75$ and $\\tfrac12(1+0.75)=0.875$. The state has moved off the rim and towards $|0\\rangle$, which is where all the population ends up.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'This channel has a fixed point and the next one does not', html:'Run amplitude damping to $\\gamma=1$ and every state becomes $|0\\rangle$, whatever it was. That is why it is the model of relaxation towards a cold equilibrium: it does not merely destroy information, it drives the qubit to one particular state. Dephasing, next, destroys just as much and drives the qubit nowhere.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.3.3 -- */
{ id:'m3-dephase', module:'M3', nav:'Dephasing', title:'Dephasing: the populations never move and the phase is lost anyway',
  objective:'Apply the phase-flip channel and identify what it does and does not change.',
  keywords:'dephasing phase flip channel decoherence coherence populations unchanged measured and ignored basis',
  src:'L6 · quantum channels and Kraus operators', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Dephasing: the populations never move and the phase is lost anyway'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The other elementary channel applies $Z$ with probability $p$ and does nothing otherwise:</p>'},
    {t:'eq', key:true, tex:'\\mathcal{E}_{Z}(\\rho) = (1-p)\\,\\rho + p\\,Z\\rho Z'},
    {t:'body', html:'<p>$Z$ leaves the diagonal alone and flips the sign of the off-diagonal, so the two branches add to leave the populations untouched and shrink the coherence:</p>'},
    {t:'eq', key:true, tex:'\\rho_{00},\\rho_{11} \\;\\text{unchanged}, \\qquad \\rho_{01} \\mapsto (1-2p)\\,\\rho_{01}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'At $p=\\tfrac12$ the coherence is gone completely and the state is the diagonal part of what it was. At $p=1$ the channel is just $Z$, a perfectly good gate: the coherence is back at full size with a sign change. So the destruction is greatest in the middle and not at the end.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figDephase(),
      caption:'The populations and the coherence of $|{+}\\rangle$ under the phase-flip channel. The populations are a flat line at one half at every $p$. Only the coherence moves, and it is what carries every interference effect in this course.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'This is chapter 2\u2019s unrecorded measurement', html:'Measuring $Z$ and throwing the result away is exactly $p=\\tfrac12$ here: $\\rho\\mapsto |0\\rangle\\langle 0|\\rho|0\\rangle\\langle 0| + |1\\rangle\\langle 1|\\rho|1\\rangle\\langle 1|$, the diagonal part. The promise made at the end of chapter 2 is now kept, and the answer needed no new postulate — only the matrix.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Decoherence is basis-dependent and often misstated', html:'This channel destroys coherence <b>in the $Z$ basis</b> and does nothing at all to a state that is already diagonal there. A qubit sitting in $|0\\rangle$ is untouched by any amount of dephasing. "The environment destroys superpositions" is only true once the basis is named, and naming it is what the engineering of a qubit is about.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.L1 --- */
{ id:'m3-lab-e', module:'M3', nav:'Laboratory E', title:'Laboratory E · A channel applied to the ball of states',
  objective:'Let the reader choose a state and a channel and watch the ball of states deform.',
  keywords:'laboratory channel bloch ball depolarising amplitude damping dephasing purity contraction fixed point',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Laboratory E · A channel applied to the ball of states'},
  {t:'small', html:'The left panel is the flat cross-section of the ball again, with the chosen input state and where the channel sends it, and with the whole rim carried along so the deformation of the set is visible. The right panel follows the purity as the strength is turned up. Find the state each channel leaves alone, and notice that two of the three channels have one and the third has a whole line of them.'},
  {t:'lab', id:'E'}
]},

/* ---------------------------------------------------------------- 3.4.1 -- */
{ id:'m3-t1t2', module:'M3', nav:'T1 and T2', title:'Relaxation and dephasing in time, and why $T_{2}\\le 2T_{1}$',
  objective:'Write the two exponential decays and derive the inequality between their times.',
  keywords:'T1 T2 relaxation dephasing lindblad master equation exponential decay coherence time inequality echo',
  src:'L6 · Markovian relaxation and dephasing', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Relaxation and dephasing'},
  {t:'title', text:'Relaxation and dephasing in time, and why $T_{2}\\le 2T_{1}$'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The two channels of the last two scenes, applied continuously rather than once, give two exponentials with two time constants:</p>'},
    {t:'eq', key:true, tex:'\\rho_{11}(t) = \\rho_{11}^{\\mathrm{eq}} + \\left[\\rho_{11}(0)-\\rho_{11}^{\\mathrm{eq}}\\right]e^{-t/T_{1}}, \\qquad \\rho_{01}(t) = e^{-t/T_{2}}\\,\\rho_{01}(0)'},
    {t:'body', html:'<p>$T_{1}$ is how long a population survives and $T_{2}$ how long a relative phase does. They are not independent, because losing the population also destroys the coherence: the damping scene showed the coherence going as $\\sqrt{1-\\gamma}$, which is half the rate on a logarithmic scale.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Adding a separate pure-dephasing rate $1/T_{\\phi}$ on top of that gives the standard relation, and the inequality is what it forces:</p>'},
      {t:'eq', key:true, tex:'\\frac{1}{T_{2}} = \\frac{1}{2T_{1}} + \\frac{1}{T_{\\phi}} \\qquad\\Longrightarrow\\qquad T_{2} \\le 2T_{1}'},
      {t:'small', html:'The equality holds when there is no pure dephasing at all, so $T_{2}=2T_{1}$ is the best a qubit can do and every real device is below it.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figT1T2(),
      caption:'The population and the coherence against time, in units of $T_{1}$, for a device with $T_{2}=1.5\\,T_{1}$. The faint curve is the ceiling $T_{2}=2T_{1}$: no coherence may decay more slowly than that, whatever else is done.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Where these numbers come from', html:'They are the time constants of a Markovian model — the Lindblad equation — in which the environment has no memory. That model is a good description of many devices and a bad one of some. Reporting a $T_{1}$ and a $T_{2}$ is reporting the parameters of a fitted model, and a decay that is not exponential does not have them.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'$T_{2}$ and $T_{2}^{*}$ are different measurements', html:'$T_{2}^{*}$ is the decay seen in a plain interference experiment, and it includes drift of the qubit frequency between one run and the next. A spin echo reverses that drift and returns a longer $T_{2}$. Quoting one where the other was measured overstates or understates the device by a large factor, and the two are routinely confused.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.5.1 -- */
{ id:'m3-order', module:'M3', nav:'Two qubits, and their order', title:'Two qubits, and the ordering that silently breaks results',
  objective:'Write a two-qubit state in the fixed ordering and locate each amplitude.',
  keywords:'two qubits tensor product basis ordering convention kronecker significant bit index product state',
  src:'L6 · composite systems and tensor products', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Two systems'},
  {t:'title', text:'Two qubits, and the ordering that silently breaks results'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 1 built the tensor product; here is the first place two qubits are actually written down. A general two-qubit pure state has four amplitudes:</p>'},
    {t:'eq', key:true, tex:'|\\psi\\rangle = c_{0}|00\\rangle + c_{1}|01\\rangle + c_{2}|10\\rangle + c_{3}|11\\rangle'},
    {t:'body', html:'<p>The product of two single-qubit states is the special case in which the four amplitudes factor:</p>'},
    {t:'eq', tex:'\\begin{bmatrix}a\\\\b\\end{bmatrix}\\otimes\\begin{bmatrix}c\\\\d\\end{bmatrix} = \\begin{bmatrix}ac\\\\ad\\\\bc\\\\bd\\end{bmatrix}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Read that column and the ordering is visible: the left factor changes the amplitude in pairs and the right factor changes it every entry. The left factor is the more significant bit, so entry $x$ of the column is the amplitude of the bit string $x$ written in binary.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOrder(),
      caption:'Which entry belongs to which pair of bits, under the ordering this course fixes: $|q_{1}q_{0}\\rangle$, with entry $x$ carrying the amplitude of $|x\\rangle$. Circuit drawings later put $q_{0}$ at the top, which is a drawing convention and not a second ordering.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'This is the convention that fails silently', html:'A library that counts qubits the other way builds $\\begin{bmatrix}ac\\\\bc\\\\ad\\\\bd\\end{bmatrix}$ from the same two states. Nothing raises an error, the norm is still one, and every number downstream describes a different state. Two of the four entries agree, which is why the mistake survives a quick check. Whenever a state crosses from one piece of software to another, print the four amplitudes and look at them.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'And the same for operators', html:'An operation on the first qubit alone is $A\\otimes I$, and on the second alone $I\\otimes B$. Those two commute, because they act on different factors. That is the formal version of a plain statement: doing something to one qubit and doing something to the other are independent, whatever the joint state is.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.5.2 -- */
{ id:'m3-ptrace', module:'M3', nav:'The partial trace', title:'The partial trace: the state of one system alone',
  objective:'Compute a partial trace by the block rule and say what characterises it.',
  keywords:'partial trace reduced density operator subsystem block matrix trace out marginal characterisation',
  src:'L6 · partial trace: the state of a subsystem', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Two systems'},
  {t:'title', text:'The partial trace: the state of one system alone'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Given a joint state $\\rho_{AB}$, the operation that answers "what is the state of $A$ by itself" is the <b>partial trace</b>:</p>'},
    {t:'eq', key:true, tex:'\\rho_{A} = \\operatorname{Tr}_{B}\\left(\\rho_{AB}\\right) = \\sum_{j}\\left(I_{A}\\otimes\\langle j|\\right)\\rho_{AB}\\left(I_{A}\\otimes|j\\rangle\\right)'},
    {t:'body', html:'<p>It does not depend on which basis $\\{|j\\rangle\\}$ of $B$ is used, and it is the only operation with the property that makes it the right answer:</p>'},
    {t:'eq', key:true, tex:'\\operatorname{Tr}\\left(\\rho_{A}A\\right) = \\operatorname{Tr}\\left[\\rho_{AB}\\left(A\\otimes I_{B}\\right)\\right] \\quad\\text{for every }A'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'That line is the definition worth remembering. $\\rho_{A}$ is whatever reproduces every measurement performed on $A$ alone. It is not an approximation and it is not an average over anything: it is the exact state for that class of questions, and there is exactly one operator that does the job.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figPtrace(),
      caption:'The rule for two qubits, read off the block structure. Cut the four-by-four matrix into four two-by-two blocks: the traces of the blocks are $\\rho_{A}$, and the sum of the two diagonal blocks is $\\rho_{B}$. Two different operations, and getting them the wrong way round is the usual slip.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\Phi^{+}\\rangle=\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)$.'],
        ['Work', '$\\rho_{AB}$ has entries $\\tfrac12$ at the four corners of the four-by-four and zero elsewhere. Its diagonal blocks are $\\tfrac12|0\\rangle\\langle 0|$ and $\\tfrac12|1\\rangle\\langle 1|$; the off-diagonal blocks are traceless.'],
        ['Answer', '$\\rho_{A}=\\rho_{B}=I/2$.'],
        ['Check', 'Every measurement on one qubit of a Bell pair is a fair coin, in every basis. That is the same statement, and it is what the next scene is about.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A partial trace loses information and cannot be undone', html:'Two very different joint states can share a reduced state — the Bell pair and a plain classical mixture of $|00\\rangle$ and $|11\\rangle$ both give $I/2$ on each side. So $\\rho_{A}$ and $\\rho_{B}$ together do not determine $\\rho_{AB}$, and everything that distinguishes those two joint states lives in the correlations the partial trace threw away.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.5.3 -- */
{ id:'m3-local', module:'M3', nav:'A pure whole with mixed parts', title:'A pure pair whose halves are as mixed as a state can be',
  objective:'Show that a maximally entangled pair has maximally mixed parts and say what that rules out.',
  keywords:'entanglement local mixedness reduced state maximally mixed pure joint state purity contrast product',
  src:'L6 · partial trace: the state of a subsystem', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Two systems'},
  {t:'title', text:'A pure pair whose halves are as mixed as a state can be'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The last scene computed it; this scene is about what it means. For $|\\Phi^{+}\\rangle$ the pair is pure — it is one vector, known exactly, with purity one — and each half is $I/2$, the most mixed state a qubit has.</p>'},
    {t:'eq', key:true, tex:'\\operatorname{Tr}\\rho_{AB}^{2} = 1, \\qquad \\operatorname{Tr}\\rho_{A}^{2} = \\tfrac12'},
    {t:'body', html:'<p>Nothing about the pair is unknown, and yet everything about each qubit is. That cannot happen for classical systems: if a joint description is certain then so is each part of it.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'A working definition of entanglement', html:'A pure joint state is <b>entangled</b> exactly when its reduced states are mixed. Complete knowledge of the whole together with incomplete knowledge of the parts is not a paradox to be resolved; it is the definition, and the next section turns it into a number.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figLocal(),
      caption:'Purity of the pair and of one half, for a maximally entangled state and for a product state. The product pair is pure and so is its half. The entangled pair is just as pure and its half is at the bottom of the range.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Where a mixed state comes from', html:'There are now two sources and they are not distinguishable from inside. Either a classical coin decided the preparation, or the qubit is entangled with something else and that something else is not being looked at. On real hardware the second is usually the honest description: the qubit is entangled with its environment, and $\\rho$ is what is left after tracing the environment out.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What this does not license', html:'"Each qubit is really in $|0\\rangle$ or $|1\\rangle$ and the pair is correlated" is the classical mixture of the last scene. It has the same two reduced states and it is a different joint state, with different correlations in every basis but $Z$. The chapter closes by measuring exactly that difference.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.6.1 -- */
{ id:'m3-sep', module:'M3', nav:'Product or entangled', title:'Separable or entangled: the test on four amplitudes',
  objective:'Decide whether a two-qubit pure state factors, and factor it when it does.',
  keywords:'separable product state entangled test determinant factor amplitudes bipartite pure mixed convex',
  src:'L6 · separability and the Schmidt decomposition', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Separability and the Schmidt decomposition'},
  {t:'title', text:'Separable or entangled: the test on four amplitudes'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A bipartite pure state is <b>separable</b> when it is a product, and <b>entangled</b> when it is not. For two qubits the test is one line of algebra: comparing the product form of the last section with a general state,</p>'},
    {t:'eq', key:true, tex:'|\\psi\\rangle \\text{ is a product} \\iff c_{0}c_{3} - c_{1}c_{2} = 0'},
    {t:'body', html:'<p>It is the determinant of the two-by-two array of amplitudes, and it vanishes exactly when the four numbers factor as $ac,\\,ad,\\,bc,\\,bd$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Applied to the two standard examples:</p>'},
      {t:'eq', tex:'\\tfrac{1}{\\sqrt2}\\left(|01\\rangle+|11\\rangle\\right) = |{+}\\rangle\\otimes|1\\rangle, \\qquad \\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right) \\ne |\\alpha\\rangle\\otimes|\\beta\\rangle'},
      {t:'small', html:'The first has $c_{0}c_{3}-c_{1}c_{2}=0-0=0$ and factors. The second has $\\tfrac12-0=\\tfrac12$ and does not, for any choice of the two single-qubit states whatever.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\psi\\rangle=\\tfrac12\\left(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle\\right)$.'],
        ['Work', '$c_{0}c_{3}-c_{1}c_{2}=\\tfrac14-\\tfrac14=0$, so it is a product.'],
        ['Answer', 'Factoring, $a=b=c=d=1/\\sqrt2$: the state is $|{+}\\rangle\\otimes|{+}\\rangle$.'],
        ['Check', 'The reduced state of either qubit is $|{+}\\rangle\\langle{+}|$, which is pure — the signature of a product state, and a second route to the same answer.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'For mixed states the word means something weaker', html:'A mixed $\\rho_{AB}$ is called separable when it is a mixture of products, $\\sum_{i}p_{i}\\rho_{A}^{(i)}\\otimes\\rho_{B}^{(i)}$ — not when it is itself one product. Deciding whether a given mixed state can be written that way is hard in general, and no test as short as the determinant exists. Everything in this chapter that has a clean answer is about <b>pure</b> bipartite states.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.6.2 -- */
{ id:'m3-schmidt', module:'M3', nav:'The Schmidt decomposition', title:'The Schmidt decomposition: two bases in which the state is diagonal',
  objective:'State the Schmidt decomposition and read the entanglement off its rank.',
  keywords:'schmidt decomposition coefficients rank orthonormal bases bipartite pure state reduced eigenvalues',
  src:'L6 · separability and the Schmidt decomposition', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Separability and the Schmidt decomposition'},
  {t:'title', text:'The Schmidt decomposition: two bases in which the state is diagonal'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A general bipartite pure state needs a double sum over two bases. The Schmidt decomposition says that the bases can always be chosen so that only the diagonal terms survive:</p>'},
    {t:'eq', key:true, tex:'|\\psi\\rangle_{AB} = \\sum_{k=1}^{r} \\sqrt{\\lambda_{k}}\\;|u_{k}\\rangle_{A}\\,|v_{k}\\rangle_{B}, \\qquad \\lambda_{k}>0, \\quad \\sum_{k}\\lambda_{k}=1'},
    {t:'body', html:'<p>The two sets $\\{|u_{k}\\rangle\\}$ and $\\{|v_{k}\\rangle\\}$ are orthonormal and are chosen for the state; the number of terms $r$ is the <b>Schmidt rank</b>.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Two consequences do all the work. The reduced states are diagonal in those bases, with the $\\lambda_{k}$ as their eigenvalues; and the test for entanglement becomes a count:</p>'},
      {t:'eq', key:true, tex:'\\rho_{A} = \\sum_{k}\\lambda_{k}|u_{k}\\rangle\\langle u_{k}|, \\qquad \\text{entangled} \\iff r > 1'},
      {t:'small', html:'One term means the state is a product and the reduced state is pure. Two or more means it is entangled, and the reduced state is mixed. This is the earlier definition, now with a number attached.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figSchmidt(),
      caption:'The two Schmidt coefficients of $\\cos\\theta\\,|00\\rangle+\\sin\\theta\\,|11\\rangle$. At the ends one of them is zero, the rank is one, and the state is a product. Where they are equal the state is maximally entangled, and every state in between is entangled by some amount.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\psi\\rangle=\\tfrac12\\left(\\sqrt3\\,|00\\rangle+|11\\rangle\\right)$.'],
        ['Work', 'It is already in Schmidt form, with $\\sqrt{\\lambda_{1}}=\\sqrt3/2$ and $\\sqrt{\\lambda_{2}}=1/2$.'],
        ['Answer', '$\\lambda=\\tfrac34,\\tfrac14$, rank two, so the state is entangled but not maximally so.'],
        ['Check', 'The coefficients add to one, and $\\rho_{A}=\\operatorname{diag}(0.75,0.25)$ has purity $0.625$ — mixed, as the rank being two requires.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why both sides always agree', html:'$\\rho_{A}$ and $\\rho_{B}$ have the same non-zero eigenvalues, whatever the two dimensions are. So one qubit entangled with a thousand others still has at most two Schmidt terms, because the smaller side caps the rank. Entanglement of a pure state is a property of the pair and cannot be more on one side than on the other.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.6.3 -- */
{ id:'m3-svd', module:'M3', nav:'Computing it', title:'How the decomposition is actually computed',
  objective:'Reshape a state vector into a coefficient matrix and get the Schmidt data from its singular values.',
  keywords:'singular value decomposition svd reshape coefficient matrix numerical rank tolerance schmidt computation',
  src:'L6 · computing Schmidt decompositions with an SVD', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Separability and the Schmidt decomposition'},
  {t:'title', text:'How the decomposition is actually computed'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Write the amplitudes as a matrix instead of a column, with the rows indexed by the first system and the columns by the second:</p>'},
    {t:'eq', key:true, tex:'|\\psi\\rangle = \\sum_{i,j} C_{ij}\\,|i\\rangle_{A}|j\\rangle_{B}, \\qquad C = U\\Sigma V^{\\dagger}'},
    {t:'body', html:'<p>The singular value decomposition of $C$ is the Schmidt decomposition. The singular values are $\\sqrt{\\lambda_{k}}$, their squares are the eigenvalues of both reduced states, and the two sets of singular vectors are the two Schmidt bases.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Nothing has to be derived a second time: $\\rho_{A}=CC^{\\dagger}$ and $\\rho_{B}=\\left(C^{\\dagger}C\\right)^{\\mathsf{T}}$, and the singular values of $C$ are the square roots of the eigenvalues of $CC^{\\dagger}$ by definition. The decomposition of chapter 1 has been waiting for this.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figSVD(),
      caption:'The recipe. Reshape the four amplitudes into a two-by-two matrix, take its singular values, and read the Schmidt coefficients. For $n$ qubits split into two groups the matrix is rectangular and the recipe is unchanged.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\psi\\rangle=\\tfrac12\\left(\\sqrt3\\,|00\\rangle+|11\\rangle\\right)$, so $c=\\left(\\sqrt3/2,0,0,1/2\\right)$.'],
        ['Work', '$C=\\begin{bmatrix}\\sqrt3/2&0\\\\0&1/2\\end{bmatrix}$, already diagonal, so the singular values are $\\sqrt3/2$ and $1/2$.'],
        ['Answer', '$\\lambda=\\tfrac34$ and $\\tfrac14$, agreeing with the last scene.'],
        ['Check', '$CC^{\\dagger}=\\operatorname{diag}(0.75,0.25)$, which is $\\rho_{A}$ computed by the block rule. Two routes, one answer.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Two things to state before reshaping', html:'The qubit ordering, and which qubits go into the rows. Reshaping a column the wrong way round transposes $C$, which leaves the singular values alone and swaps the two Schmidt bases — so the entanglement number looks right while the states attached to it are the other system\u2019s. And the rank is the count of singular values above a stated tolerance: a value of $10^{-16}$ is a zero, and calling it a third Schmidt term is reporting rounding.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.7.1 -- */
{ id:'m3-entropy', module:'M3', nav:'Entropy', title:'Entropy: how much entanglement, in bits',
  objective:'Compute the von Neumann entropy of a reduced state and interpret it as an amount of entanglement.',
  keywords:'von neumann entropy entanglement entropy ebit bits log base two reduced state pure zero maximal',
  src:'L6 · separability and the Schmidt decomposition', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Entropy'},
  {t:'title', text:'Entropy: how much entanglement, in bits'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The Schmidt rank counts; the entropy weighs. It is the Shannon entropy of the eigenvalues of $\\rho$, and with logarithms base two it is measured in bits:</p>'},
    {t:'eq', key:true, tex:'S(\\rho) = -\\operatorname{Tr}\\left(\\rho\\log_{2}\\rho\\right) = -\\sum_{k}\\lambda_{k}\\log_{2}\\lambda_{k}'},
    {t:'body', html:'<p>For a pure state one eigenvalue is one and $S=0$: there is nothing to be uncertain about. For $I/d$ every eigenvalue is $1/d$ and $S=\\log_{2}d$, the largest it can be.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>For a <b>pure</b> bipartite state the entropy of either reduced state is the amount of entanglement the pair carries, and the two agree because the eigenvalues do:</p>'},
      {t:'eq', key:true, tex:'S(\\rho_{A}) = S(\\rho_{B}) = -\\sum_{k}\\lambda_{k}\\log_{2}\\lambda_{k}'},
      {t:'small', html:'A maximally entangled pair of qubits has $\\lambda=\\tfrac12,\\tfrac12$ and carries one bit, called one <b>ebit</b>. It is the unit every protocol in chapter 5 is priced in.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figEntropy(),
      caption:'The entanglement entropy of a two-term Schmidt spectrum, against the larger coefficient. Zero at both ends, where the state is a product, and one bit in the middle, where the pair is maximally entangled.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The state with $\\lambda=\\tfrac34,\\tfrac14$.'],
        ['Work', '$-0.75\\log_{2}0.75 - 0.25\\log_{2}0.25 = 0.75(0.415) + 0.25(2)$.'],
        ['Answer', '$S\\approx 0.811$ bits: entangled, and worth about four fifths of an ebit.'],
        ['Check', 'A Bell pair gives $-2\\times\\tfrac12\\log_{2}\\tfrac12 = 1$ bit, and a product state gives $0$. The answer sits between them, where the rank-two-but-lopsided spectrum says it should.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'This measure is only for pure pairs', html:'$S(\\rho_{A})$ measures entanglement only when $\\rho_{AB}$ is pure. For a mixed joint state it measures the total uncertainty about $A$, which mixes entanglement together with ordinary classical noise, and a separable mixed state can have a large $S(\\rho_{A})$ while carrying no entanglement at all. Quoting the reduced entropy of a noisy pair as its entanglement is a common and serious overstatement.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.8.1 -- */
{ id:'m3-bell', module:'M3', nav:'The Bell states', title:'The four Bell states, and the correlations that separate them',
  objective:'List the Bell states and compute the three Pauli correlations of one of them.',
  keywords:'bell states phi psi plus minus basis maximally entangled correlations XX YY ZZ classical mixture',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'The four Bell states, and the correlations that separate them'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Four maximally entangled two-qubit states are used constantly, and together they are an orthonormal basis of the four-dimensional space:</p>'},
    {t:'eq', key:true, tex:'|\\Phi^{\\pm}\\rangle = \\frac{|00\\rangle \\pm |11\\rangle}{\\sqrt2}, \\qquad |\\Psi^{\\pm}\\rangle = \\frac{|01\\rangle \\pm |10\\rangle}{\\sqrt2}'},
    {t:'body', html:'<p>Every one of them has $\\rho_{A}=\\rho_{B}=I/2$, so no measurement on one qubit tells them apart. What separates them is entirely in the joint correlations.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>For $|\\Phi^{+}\\rangle$ the three Pauli correlations are computed by applying the operators and reading the sign:</p>'},
      {t:'eq', key:true, tex:'\\langle X\\otimes X\\rangle = 1, \\qquad \\langle Y\\otimes Y\\rangle = -1, \\qquad \\langle Z\\otimes Z\\rangle = 1'},
      {t:'small', html:'Each is $\\pm1$, so each is a <b>certain</b> statement about the pair: measure both qubits in the $X$ basis and the two answers always agree, even though each answer on its own is a fair coin.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figBell(),
      caption:'The three correlations of $|\\Phi^{+}\\rangle$, beside those of the classical mixture $\\tfrac12|00\\rangle\\langle 00|+\\tfrac12|11\\rangle\\langle 11|$. The two agree perfectly in $Z$ and nowhere else, and both have the same two reduced states.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\Phi^{+}\\rangle$ and the operator $Y\\otimes Y$.'],
        ['Work', '$Y|0\\rangle=i|1\\rangle$ and $Y|1\\rangle=-i|0\\rangle$, so $Y\\otimes Y|00\\rangle=-|11\\rangle$ and $Y\\otimes Y|11\\rangle=-|00\\rangle$.'],
        ['Answer', '$Y\\otimes Y|\\Phi^{+}\\rangle=-|\\Phi^{+}\\rangle$, so $\\langle Y\\otimes Y\\rangle=-1$.'],
        ['Check', 'The state is an eigenvector, so the reading is certain and the mean is the eigenvalue. The minus sign comes from the two factors of $i$ meeting, and it is the reason $|\\Phi^{+}\\rangle$ anticorrelates in $Y$ while correlating in $X$ and $Z$.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What the contrast in the figure buys', html:'The classical mixture reproduces the $Z$ correlation exactly. Any model that says "the pair was made as $00$ or as $11$, we just do not know which" therefore predicts the first bar correctly and the other two wrongly. That is not yet a proof that no such model works, because a cleverer one might be built. Making the argument airtight is the next scene.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.8.2 -- */
{ id:'m3-chsh', module:'M3', nav:'The classical bound', title:'CHSH: the number every classical model is trapped below',
  objective:'Assemble the CHSH combination and derive the bound a model with pre-existing values obeys.',
  keywords:'chsh bell inequality local hidden variable classical bound two pre-existing values correlations',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'CHSH: the number every classical model is trapped below'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Each party has two possible measurements, each returning $\\pm1$, and each pair of choices gives one correlation. Combine four of them into one number, with the fourth subtracted:</p>'},
    {t:'eq', key:true, tex:'S = \\langle A_{0}B_{0}\\rangle + \\langle A_{0}B_{1}\\rangle + \\langle A_{1}B_{0}\\rangle - \\langle A_{1}B_{1}\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Now suppose every run carries definite values $a_{0},a_{1},b_{0},b_{1}\\in\\{\\pm1\\}$, fixed before the two settings are chosen. Group the four terms:</p>'},
      {t:'eq', tex:'a_{0}\\left(b_{0}+b_{1}\\right) + a_{1}\\left(b_{0}-b_{1}\\right)'},
      {t:'small', html:'Two numbers each $\\pm1$ either agree or differ, so one bracket is $\\pm2$ and the other is exactly zero. The whole expression is $\\pm2$ on every single run, and an average of numbers in $[-2,2]$ stays there.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figChshBox(),
      caption:'The assumption being tested, drawn. Whatever fixes a run also fixes all four answers, including the two nobody asked for. That is the only thing used, and it is enough to trap the combination between $-2$ and $+2$.'},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\left|S\\right| \\le 2 \\qquad \\text{for every local model with pre-existing values}'},
      {t:'small', html:'No quantum mechanics went into that. It uses only that the four numbers exist together, which is what "the values were there before anyone looked" means, and that each party’s answer does not depend on the other party’s setting.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why this shape and not another', html:'The minus sign is what makes the bound bite. With four plus signs the classical bound would be four and so would the quantum one, and the two theories would agree. Bell inequalities are built to find a combination on which they do not, and the next scene evaluates this one.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.8.3 -- */
{ id:'m3-violate', module:'M3', nav:'The violation', title:'What quantum mechanics reaches, and what that refutes',
  objective:'Evaluate the CHSH combination on a Bell state and say precisely which assumption fails.',
  keywords:'chsh violation tsirelson 2 root 2 bell state measurement angles refutation realism error bar shots',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'What quantum mechanics reaches, and what that refutes'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Take $|\\Phi^{+}\\rangle$ and four directions in one plane. For that state a joint Pauli correlation is one dot product with a sign:</p>'},
    {t:'eq', key:true, tex:'\\langle \\left(\\mathbf{n}\\cdot\\boldsymbol\\sigma\\right)\\otimes\\left(\\mathbf{m}\\cdot\\boldsymbol\\sigma\\right)\\rangle = n_{x}m_{x} - n_{y}m_{y} + n_{z}m_{z}'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Given', '$A_{0}=Z$, $A_{1}=X$, $B_{0}=(Z+X)/\\sqrt2$ and $B_{1}=(Z-X)/\\sqrt2$.'],
        ['Work', 'Each of the first three correlations is $1/\\sqrt2$, and the fourth is $-1/\\sqrt2$.'],
        ['Answer', '$S = 4/\\sqrt2 = 2\\sqrt2 \\approx 2.828$, above the bound of two.'],
        ['Check', 'Every term has modulus at most one, so $S$ could in principle be four. Quantum mechanics stops at $2\\sqrt2$, and that ceiling is a theorem rather than an accident of these angles.']
      ]}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCHSH(),
      caption:'The same combination with the second party’s two settings placed symmetrically at $\\pm\\varphi$ in the plane. The dashed line is the classical bound, and the curve is above it over a wide range of angles rather than at one exact setting.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'What is refuted, exactly', html:'Not "the qubits communicate". The assumption that fails is that the four outcomes exist together before the settings are chosen. Reading a violation as a signal is the misreading the next scene exists to close, and it is the one students reach for first.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A violation is a measurement and carries an error bar', html:'$S$ is estimated from four finite runs, so each of the four terms carries the sampling error of chapter 2. Reporting $S=2.6$ without a shot count and an interval is not reporting a violation. Noise pushes $S$ back towards two: mixing a Bell state with enough of the maximally mixed state stops the violation entirely, while leaving the state entangled for a while longer.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.L2 --- */
{ id:'m3-lab-f', module:'M3', nav:'Laboratory F', title:'Laboratory F · CHSH: four angles and one number',
  objective:'Let the reader set the four measurement directions and read the CHSH value against the classical bound.',
  keywords:'laboratory chsh bell inequality four angles classical bound tsirelson correlations violation sweep',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'Laboratory F · CHSH: four angles and one number'},
  {t:'small', html:'Both parties measure $|\\Phi^{+}\\rangle$ along a direction in the $z$–$x$ plane, and each of the four directions is a slider. The left panel is the four correlations; the right one sweeps the first of the other party\u2019s two settings with the rest held where they are, against the classical bound and the largest value quantum mechanics permits. Find a setting that violates the bound, then find one that does not, and notice how much of the circle each occupies.'},
  {t:'lab', id:'F'}
]},

/* ---------------------------------------------------------------- 3.8.4 -- */
{ id:'m3-nosig', module:'M3', nav:'No signalling', title:'Why entanglement sends nothing',
  objective:'Show that one party\u2019s outcome distribution does not depend on the other party\u2019s choice.',
  keywords:'no signalling faster than light communication reduced state unchanged partial trace correlation classical channel',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'Why entanglement sends nothing'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The last scene showed a correlation no classical model reproduces. It is tempting to read that as a channel. It is not one, and the proof is the partial trace.</p>'},
    {t:'body', html:'<p>Whatever measurement the second party makes, the state of the first party afterwards — averaged over the outcomes the first party has not been told — is the same operator it was before:</p>'},
    {t:'eq', key:true, tex:'\\sum_{m} p(m)\\,\\rho_{A\\mid m} = \\rho_{A} \\qquad \\text{for every set } \\{E_{m}\\}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The reason is the completeness of the effects, $\\sum_{m}E_{m}=I$, together with the characterisation of the partial trace:</p>'},
      {t:'eq', tex:'\\operatorname{Tr}\\left[\\rho_{AB}\\left(A\\otimes \\textstyle\\sum_{m}E_{m}\\right)\\right] = \\operatorname{Tr}\\left[\\rho_{AB}\\left(A\\otimes I\\right)\\right] = \\operatorname{Tr}\\left(\\rho_{A}A\\right)'},
      {t:'small', html:'The second party\u2019s choice of measurement disappears from the expression before any number is computed. Nothing about the first party\u2019s statistics can depend on it.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figNoSig(),
      caption:'What one party sees, for three different things the other party does. Every bar is one half. There is no setting of anyone\u2019s apparatus that moves them, so there is nothing here to encode a message in.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Where the correlation actually appears', html:'Only when the two records are brought together and compared, which needs an ordinary classical channel and travels no faster than one. Entanglement is a resource that makes the two records agree in ways no classical preparation could; it is not a wire. Every protocol in chapter 5 that uses a Bell pair also sends classical bits, and that is why.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The language does most of the damage', html:'"Measuring one qubit instantly collapses the other" describes a bookkeeping step: the first party updates their description of the pair conditioned on a result only they have. Two parties who have not spoken hold different descriptions of the same pair, and both are correct, because a description is a statement about what its holder can predict.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 3.9.1 -- */
{ id:'m3-synth', module:'M3', nav:'Summary', title:'What this chapter leaves you with',
  objective:'Collect the objects this chapter added and the four errors it exists to prevent.',
  keywords:'summary module 3 review density operator purity channel partial trace schmidt entropy bell chsh',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Summary'},
  {t:'title', text:'What this chapter leaves you with'},
  {t:'fig', frame:true, svg:()=>figLadder(),
    caption:'The chapter as one ladder. Each step drops an assumption the step before it was resting on, and each time the object that survives is a matrix rather than a vector. Nothing was added to the postulates to make any of this work.'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'The object', items:[
      {t:'small', html:'$\\rho=\\rho^{\\dagger}\\succeq 0$ with $\\operatorname{Tr}\\rho=1$. Predictions are $\\operatorname{Tr}(\\rho A)$. Purity $\\operatorname{Tr}\\rho^{2}$ runs from $1/d$ to $1$. For a qubit, $\\rho=\\tfrac12(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma)$ with $|\\mathbf{r}|\\le 1$.'}]}],
    [{t:'card', head:'Open evolution', items:[
      {t:'small', html:'$\\mathcal{E}(\\rho)=\\sum_{k}K_{k}\\rho K_{k}^{\\dagger}$ with $\\sum_{k}K_{k}^{\\dagger}K_{k}=I$: a unitary on a larger system with the rest ignored. Damping moves populations, dephasing moves only coherences, and $T_{2}\\le 2T_{1}$.'}]}],
    [{t:'card', head:'Parts of a whole', items:[
      {t:'small', html:'$\\rho_{A}=\\operatorname{Tr}_{B}\\rho_{AB}$, defined by reproducing every measurement on $A$. A pure pair with mixed parts is entangled; the Schmidt rank counts and $S(\\rho_{A})$ weighs, in bits.'}]}],
    [{t:'card', head:'Correlations', items:[
      {t:'small', html:'The Bell states share one reduced state and differ in every joint correlation. $|S|\\le 2$ for any model with pre-existing values; quantum mechanics reaches $2\\sqrt2$. No choice of setting moves the other party\u2019s distribution.'}]}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:2, gap:'24px', items:[
      [{t:'note', kind:'ok', head:'Six lines to be able to write without looking', html:'$\\rho=\\sum_{i}p_{i}|\\psi_{i}\\rangle\\langle\\psi_{i}|$ &nbsp;·&nbsp; $\\langle A\\rangle=\\operatorname{Tr}(\\rho A)$ &nbsp;·&nbsp; $\\operatorname{Tr}\\rho^{2}=\\tfrac12(1+|\\mathbf{r}|^{2})$ &nbsp;·&nbsp; $\\mathcal{E}(\\rho)=\\sum_{k}K_{k}\\rho K_{k}^{\\dagger}$ &nbsp;·&nbsp; $S=-\\sum_{k}\\lambda_{k}\\log_{2}\\lambda_{k}$ &nbsp;·&nbsp; $|S_{\\text{CHSH}}|\\le 2$.'}],
      [{t:'note', kind:'warn', head:'Four errors that cost a whole question', html:'Treating a mixture as a superposition. Checking Hermiticity and trace and calling the result a state. Swapping the two partial traces, so $\\rho_{A}$ is computed where $\\rho_{B}$ was asked for. And reading a Bell violation as communication.'}]
    ]}
  ]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'def', head:'What comes next', html:'Chapter 4 draws the ball this chapter has been computing in, gives the two angles of a pure state their names, and turns every single-qubit gate into a rotation of it. It also builds the two-qubit gate that makes a Bell state out of a product one, so the pairs used here stop being assumed and start being constructed.'}
  ]}
]},

/* ---------------------------------------------------------------- 3.9.2 -- */
{ id:'m3-shapes', module:'M3', nav:'The shapes of question', title:'The shapes of question this chapter sets',
  objective:'Name the recurring question types of chapter 3 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice density purity channel partial trace schmidt chsh',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 3 · Summary and practice'},
  {t:'title', text:'The shapes of question this chapter sets'},
  {t:'small', html:'Six shapes keep coming back, and a seventh — a <b>full-length question</b> — puts three to five of them in one statement, usually as one pair of qubits followed from its preparation to a reported correlation. Name the shape before starting; the method for each is fixed.'},
  {t:'grid', cols:3, gap:'22px', items:[
    [{t:'drilltypes', module:'M3', from:0, to:2}],
    [{t:'drilltypes', module:'M3', from:2, to:4}],
    [{t:'drilltypes', module:'M3', from:4, to:6}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'The check that catches most of it', html:'A trace is one, every eigenvalue is between zero and one, a purity lies between $1/d$ and one, an entropy is never negative, and a correlation of two $\\pm1$ observables lies in $[-1,1]$. Five one-line tests, and between them they catch nearly every arithmetic slip this chapter can produce.'}
  ]}
]}

];

window.SCENES_M3 = SC;
})();
