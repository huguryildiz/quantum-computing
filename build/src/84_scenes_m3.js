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

/* A box diagram has no axes to stretch, so when a slide grows its figure into
   the spare height of the column, the diagram keeps its size and is centred in
   the taller frame. Chapter 2's helper: a `line` is a path that starts with an
   absolute move, so shifting that first point shifts the whole wire. */
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
  return growBlocks({w:740,h:250,items:[
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
  a.note(0.5,0.5,'\\text{maximally mixed}',{fs:12.5,color:C.err,anchor:'middle',dy:26,tex:true});
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
  return growBlocks({w:740,h:220,items:[
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
    items.push({t:'text',x:150,y:y+30,anchor:'end',label:k,tex:true,fs:15});
    items.push({t:'box',x:168,y:y,w:110,h:40,label:c,tex:true,fs:15,
      color:i===0?C.in:i===3?C.out:C.mid});
    items.push({t:'text',x:300,y:y+28,anchor:'start',label:d,tex:true,fs:13});
  });
  items.push({t:'text',x:280,y:236,label:'the left qubit is the most significant, so the index is two q1 plus q0',fs:12});
  return growBlocks({w:560,h:252,items});
}

/* The partial trace on two qubits, read off the block structure of the joint
   matrix. Two different reductions, two different operations on the blocks. */
function figPtrace(){
  /* The blocks on the left and the two rules beside them, in a frame narrow
     enough for the matrix of traces to be read at slide size. */
  const B=[['M_{00}',20,40],['M_{01}',140,40],['M_{10}',20,140],['M_{11}',140,140]];
  const items = B.map(([l,x,y])=>({t:'box',x,y,w:120,h:100,label:l,tex:true,fs:18,
    color:(l==='M_{00}'||l==='M_{11}')?C.in:C.mid}));
  items.push({t:'text',x:140,y:24,label:'the joint matrix, in blocks',fs:13});
  items.push({t:'text',x:300,y:92,anchor:'start',
    label:'\\rho_{A}=\\begin{bmatrix}\\mathrm{Tr}\\,M_{00}&\\mathrm{Tr}\\,M_{01}\\\\ \\mathrm{Tr}\\,M_{10}&\\mathrm{Tr}\\,M_{11}\\end{bmatrix}',tex:true,fs:16});
  items.push({t:'text',x:300,y:136,anchor:'start',label:'the trace of each block',fs:13});
  items.push({t:'text',x:300,y:200,anchor:'start',label:'\\rho_{B}=M_{00}+M_{11}',tex:true,fs:17});
  items.push({t:'text',x:300,y:230,anchor:'start',label:'the sum of the diagonal blocks',fs:13});
  return growBlocks({w:580,h:256,items});
}

/* A pure pair whose halves are mixed, beside a product pair whose halves are
   not. Purity is the quantity, and it is computed from the states. */
function figLocal(){
  const a = P.Axes({w:560,h:250,xr:[0,4.4],yr:[0,1.14],
    ylabel:'\\operatorname{Tr}\\rho^{2}', pad:{l:64,r:24,t:30,b:62},
    xticksOverride:[], ytarget:4});
  /* The bars start at 0.7 so the vertical axis sits clear of the first one. */
  const bar=(k,v,f,l)=>{ const n = k + 0.7; a.rect(n-0.28,0,n+0.28,v,{fill:f});
    a.poly([[n-0.28,v],[n+0.28,v]],{color:l,width:2.6}); };
  bar(0,1,C.dec.in,C.in);   bar(1,0.5,C.dec.err,C.err);
  bar(2,1,C.dec.in,C.in);   bar(3,1,C.dec.out,C.out);
  [['pair',0],['half',1],['pair',2],['half',3]].forEach(([t,k])=>
    a.note(k+0.7,0,t,{fs:12,color:C.muted,anchor:'middle',dy:24}));
  a.note(1.2,0,'|\\Phi^{+}\\rangle',{fs:14,color:C.in,anchor:'middle',dy:48,tex:true});
  a.note(3.2,0,'|{+}\\rangle\\otimes|0\\rangle',{fs:14,color:C.out,anchor:'middle',dy:48,tex:true});
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
  return growBlocks({w:740,h:220,items:[
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
  const a = P.Axes({w:560,h:260,xr:[0,6.4],yr:[-1.30,1.62],
    ylabel:'\\langle \\sigma\\otimes\\sigma\\rangle', pad:{l:64,r:24,t:30,b:62},
    xticksOverride:[], yticksOverride:[-1,-0.5,0.5,1]});
  /* The bars start at 0.7 so the vertical axis sits clear of the first one. */
  const bar=(k,v,f,l)=>{ const n = k + 0.7; a.rect(n-0.26,0,n+0.26,v,{fill:f});
    a.poly([[n-0.26,v],[n+0.26,v]],{color:l,width:2.6}); };
  bar(0,1,C.dec.in,C.in);   bar(1,-1,C.dec.in,C.in);   bar(2,1,C.dec.in,C.in);
  bar(3,0,C.dec.err,C.err); bar(4,0,C.dec.err,C.err);  bar(5,1,C.dec.err,C.err);
  [['XX',0],['YY',1],['ZZ',2],['XX',3],['YY',4],['ZZ',5]].forEach(([t,k])=>
    a.note(k+0.7,0,t,{fs:12,color:C.muted,anchor:'middle',dy:k<3?(k===1?-16:24):24}));
  /* Both group names go in the strip above the tallest bar, so neither can
     land on the geometry it is naming. */
  a.note(1.7,1.40,'|\\Phi^{+}\\rangle',{fs:14,color:C.in,anchor:'middle',tex:true});
  a.note(4.7,1.40,'\\text{classical mixture}',{fs:13,color:C.err,anchor:'middle',tex:true});
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
  return growBlocks({w:760,h:262,items});
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
  const a = P.Axes({w:560,h:250,xr:[0,6.4],yr:[0,1.12],
    ylabel:'\\text{probability for A}', pad:{l:64,r:24,t:30,b:62},
    xticksOverride:[], ytarget:4});
  /* The bars start at 0.7 so the vertical axis sits clear of the first one. */
  const bar=(k,f,l)=>{ const n = k + 0.7; a.rect(n-0.26,0,n+0.26,0.5,{fill:f});
    a.poly([[n-0.26,0.5],[n+0.26,0.5]],{color:l,width:2.6}); };
  [0,1].forEach(k=>bar(k,C.dec.in,C.in));
  [2,3].forEach(k=>bar(k,C.dec.mid,C.mid));
  [4,5].forEach(k=>bar(k,C.dec.out,C.out));
  [['+1',0],['-1',1],['+1',2],['-1',3],['+1',4],['-1',5]].forEach(([t,k])=>
    a.note(k+0.7,0,t,{fs:12,color:C.muted,anchor:'middle',dy:24}));
  a.note(1.2,0,'B\\text{ measures }Z',{fs:12.5,color:C.in,anchor:'middle',dy:48,tex:true});
  a.note(3.2,0,'B\\text{ measures }X',{fs:12.5,color:C.mid,anchor:'middle',dy:48,tex:true});
  a.note(5.2,0,'B\\text{ does nothing}',{fs:12.5,color:C.out,anchor:'middle',dy:48,tex:true});
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

/* Two routes to one expectation value, for the mixture of |0> and |+> in equal
   parts. In each group the first two bars are the mean inside each branch and
   the third is Tr(rho A); the third is the average of the first two. */
function figExpect(){
  const a = P.Axes({w:560,h:250,xr:[0,7.4],yr:[0,1.15],
    ylabel:'\\text{mean}', pad:{l:62,r:24,t:26,b:56},
    xticksOverride:[], ytarget:4});
  /* The bars start at 0.7 so the vertical axis sits clear of the first one. */
  const bar=(n,v,f,l)=>{ a.rect(n-0.28,0,n+0.28,v,{fill:f});
    a.poly([[n-0.28,v],[n+0.28,v]],{color:l,width:2.4}); };
  const X = [0.7,1.7,2.7,4.7,5.7,6.7];
  bar(X[0],1,C.dec.in,C.in);    bar(X[1],0,C.dec.in,C.in);    bar(X[2],0.5,C.dec.out,C.out);
  bar(X[3],0,C.dec.in,C.in);    bar(X[4],1,C.dec.in,C.in);    bar(X[5],0.5,C.dec.out,C.out);
  ['|0\\rangle','|{+}\\rangle','\\operatorname{Tr}','|0\\rangle','|{+}\\rangle','\\operatorname{Tr}'].forEach((t,k)=>
    a.note(X[k],0,t,{fs:12.5,color:C.muted,anchor:'middle',dy:24,tex:true}));
  a.note(1.7,0,'\\langle Z\\rangle',{fs:14,color:C.in,anchor:'middle',dy:48,tex:true});
  a.note(5.7,0,'\\langle X\\rangle',{fs:14,color:C.in,anchor:'middle',dy:48,tex:true});
  return a.svg();
}

/* Two preparations of I/2 in the cross-section of the ball: the pair |0>, |1>
   and the pair |+>, |->. Each pair averages to the centre, which is the whole
   claim. Isotropic, with figBall's geometry, because the rim is a circle. */
function figEnsemble(){
  /* 400 px over an x span of 5.52 and 174 px over a y span of 2.40: both
     72.5 px to the unit, so the rim is round. */
  const a = P.Axes({w:452,h:226,xr:[-2.76,2.76],yr:[-1.20,1.20],
    pad:{l:26,r:26,t:26,b:26}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const ring=[]; for(let i=0;i<=200;i++){ const t=2*Math.PI*i/200; ring.push([Math.cos(t),Math.sin(t)]); }
  a.poly(ring,{color:C.grid,width:1.6});
  a.poly([[0,-1],[0,1]],{color:C.in,width:2.2});
  a.poly([[-1,0],[1,0]],{color:C.mid,width:2.2,dash:'5 4'});
  [[0,1,'|0\\rangle',10,-4,'start'],[0,-1,'|1\\rangle',10,16,'start']].forEach(([x,y,t,dx,dy,an])=>{
    a.point(x,y,{color:C.in,r:6});
    a.note(x,y,t,{fs:13,color:C.in,dx:dx,dy:dy,anchor:an,tex:true}); });
  [[1,0,'|{+}\\rangle',12,5,'start'],[-1,0,'|{-}\\rangle',-12,5,'end']].forEach(([x,y,t,dx,dy,an])=>{
    a.point(x,y,{color:C.mid,r:6});
    a.note(x,y,t,{fs:13,color:C.mid,dx:dx,dy:dy,anchor:an,tex:true}); });
  a.point(0,0,{color:C.out,r:6});
  a.note(0,0,'I/2',{fs:13,color:C.out,dx:10,dy:-10,tex:true});
  return a.svg();
}

/* The four amplitudes of a two-qubit state as a two-by-two array, rows for the
   left qubit and columns for the right one. The determinant of the array is
   the product test: zero for a product, non-zero for an entangled state. */
function figSep(){
  const cell = (x,y,l,on,col) => ({t:'box',x,y,w:100,h:70,label:l,tex:true,fs:18,color:on?col:C.muted});
  const r = '\\tfrac{1}{\\sqrt2}';
  const items = [
    cell(40,52,'0',false),   cell(140,52,r,true,C.in),
    cell(40,122,'0',false),  cell(140,122,r,true,C.in),
    cell(320,52,r,true,C.mid),  cell(420,52,'0',false),
    cell(320,122,'0',false),    cell(420,122,r,true,C.mid),
    {t:'text',x:140,y:34,label:'|{+}\\rangle\\otimes|1\\rangle',tex:true,fs:17},
    {t:'text',x:420,y:34,label:'|\\Phi^{+}\\rangle',tex:true,fs:17},
    {t:'text',x:140,y:226,label:'c_{0}c_{3}-c_{1}c_{2}=0',tex:true,fs:16},
    {t:'text',x:420,y:226,label:'c_{0}c_{3}-c_{1}c_{2}=\\tfrac12',tex:true,fs:16},
    {t:'text',x:140,y:258,label:'a product',fs:14},
    {t:'text',x:420,y:258,label:'entangled',fs:14}
  ];
  return growBlocks({w:560,h:276,items});
}

const SC = [

/* ---------------------------------------------------------------- 3.0.1 -- */
{ id:'m3-open', module:'M3', nav:'Why a vector is not enough', title:'Mixed States and Entanglement',
  objective:'Name the two situations in which a pure state vector cannot be written, and say what replaces it.',
  keywords:'mixed state density operator open system subsystem ignorance entanglement module 3 overview',
  src:'L6 · density operators: pure states, mixtures, and reduced states', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Mixed states and entanglement'},
  {t:'title', text:'Mixed States and Entanglement'},
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
{ id:'m3-rho', module:'M3', nav:'The density operator', title:'The Density Operator',
  objective:'Write the density operator of a pure state and of a mixture, and name the meaning of each entry.',
  keywords:'density operator density matrix outer product ensemble populations coherences mixture pure state',
  src:'L6 · density operators: pure states, mixtures, and reduced states', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'The Density Operator'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figRho(),
      caption:'The four entries of a one-qubit density matrix. The diagonal holds what a $Z$ reading returns. The off-diagonal holds the coherence, the only place a relative phase survives.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The global phase drops out', html:'Replace $|\\psi\\rangle$ by $e^{i\\gamma}|\\psi\\rangle$ and $\\rho$ does not change, because the two phases cancel. The relative phase stays, in the off-diagonal entry.'}]},
  ], right:[
    {t:'eq', key:true, label:'Density operator', tex:'\\rho_{\\psi} = |\\psi\\rangle\\langle\\psi|, \\qquad \\rho = \\sum_{i} p_{i}\\,|\\psi_{i}\\rangle\\langle\\psi_{i}|',
      note:'A pure state is one outer product. A device that makes $|\\psi_{i}\\rangle$ with probability $p_{i}$ gives the weighted sum. The weights are added, not superposed: a mixture is not a vector at all.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} |\\psi\\rangle &= \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right) \\\\ \\rho &= \\tfrac12\\begin{bmatrix}1&-i\\\\i&1\\end{bmatrix} \\end{aligned}',
        note:'The top-right entry is $c_{0}c_{1}^{*}=-i/2$. The trace is one and $\\rho^{2}=\\rho$, which every pure state satisfies.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A device emits $|0\\rangle$ with probability $\\tfrac14$ and $|1\\rangle$ with probability $\\tfrac34$, and nobody records which.<div class="nsep"></div>What is $\\rho_{01}$?',
        ask:{key:'m3-rho', choices:['$0$','$\\tfrac{\\sqrt3}{4}$','$\\tfrac14$'], answer:0,
          why:'Each branch is diagonal, so the weighted sum is diagonal. $\\tfrac{\\sqrt3}{4}$ belongs to the superposition $\\tfrac12|0\\rangle+\\tfrac{\\sqrt3}{2}|1\\rangle$, which is a different state.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.1.2 -- */
{ id:'m3-physical', module:'M3', nav:'Which matrices are states', title:'Physical Density Matrices',
  objective:'Test a candidate matrix against the three conditions and say which one a given matrix fails.',
  keywords:'hermitian positive semidefinite trace one physical density matrix eigenvalues test coherence bound',
  src:'L6 · which matrices are physical states?', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'Physical Density Matrices'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figPhysical(),
      caption:'One-qubit matrices with a real coherence. The shaded half disc is the set of states, and its edge is where they are pure. The red point is Hermitian with trace one, and is still not a state.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Two tests are not three', html:'Hermitian with unit trace is easy to arrange. Positivity is the real restriction, and it is the test that gets skipped. A matrix fitted to noisy data often fails it by a little.'}]},
  ], right:[
    {t:'eq', key:true, label:'Three conditions', tex:'\\rho = \\rho^{\\dagger}, \\qquad \\rho \\succeq 0, \\qquad \\operatorname{Tr}\\rho = 1',
      note:'Hermitian makes every mean real. Positive, $\\langle v|\\rho|v\\rangle\\ge 0$, makes every probability non-negative. Unit trace makes them add to one. Together they say the eigenvalues are a probability distribution.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} M &= \\begin{bmatrix}0.5&0.8\\\\0.8&0.5\\end{bmatrix} \\\\ \\lambda &= 0.5 \\pm 0.8 = 1.3, \\ -0.3 \\end{aligned}',
        note:'Hermitian with trace one, and one eigenvalue is negative, so not a state. For a qubit, positivity is $|\\rho_{01}|^{2}\\le p_{0}(1-p_{0})$: here $|\\rho_{01}|$ may be at most $0.5$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$M=\\begin{bmatrix}0.9&0.4\\\\0.4&0.1\\end{bmatrix}$.<div class="nsep"></div>Is $M$ a state?',
        ask:{key:'m3-physical', choices:['Yes','No: it is not positive','No: its trace is not one'], answer:1,
          why:'$p_{0}(1-p_{0})=0.09$, so $|\\rho_{01}|$ may be at most $0.3$, and $0.4$ is larger. One eigenvalue is negative.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.1.3 -- */
{ id:'m3-expect', module:'M3', nav:'Predictions from the matrix', title:'Expectation Values from the Trace',
  objective:'Compute an outcome probability and an expectation value from a density operator.',
  keywords:'trace rho A expectation probability povm effects cyclicity born rule mixed state prediction',
  src:'L6 · expectation values and measurement probabilities', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'Expectation Values from the Trace'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figExpect(),
      caption:'$\\langle Z\\rangle$ and $\\langle X\\rangle$ for $\\tfrac12|0\\rangle\\langle 0|+\\tfrac12|{+}\\rangle\\langle{+}|$. The first two bars are the mean in each branch; the green bar is $\\operatorname{Tr}(\\rho A)$, their average.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Two averages, one formula', html:'Term by term, $\\operatorname{Tr}(\\rho A)=\\sum_{i}p_{i}\\langle\\psi_{i}|A|\\psi_{i}\\rangle$: the quantum mean in each branch, then the classical mean over branches. The formula never says which is which.'}]},
  ], right:[
    {t:'eq', key:true, label:'Predictions', tex:'\\langle A\\rangle = \\operatorname{Tr}\\left(\\rho A\\right), \\qquad p(m) = \\operatorname{Tr}\\left(\\rho E_{m}\\right)',
      note:'One formula for pure and mixed states. For $\\rho=|\\psi\\rangle\\langle\\psi|$, rotating the product inside the trace gives back $\\langle\\psi|A|\\psi\\rangle$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\rho &= \\begin{bmatrix}0.75&0.25\\\\0.25&0.25\\end{bmatrix} \\\\ \\langle Z\\rangle &= 0.75-0.25 = 0.5, \\quad \\langle X\\rangle = 2(0.25) = 0.5 \\end{aligned}',
        note:'The mixture in the figure. By branches, $\\langle Z\\rangle=\\tfrac12(1)+\\tfrac12(0)=0.5$: the same number, and no matrix was multiplied.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\rho=\\tfrac12|1\\rangle\\langle 1|+\\tfrac12|{+}\\rangle\\langle{+}|$.<div class="nsep"></div>What is $\\langle Z\\rangle$?',
        ask:{key:'m3-expect', choices:['$-\\tfrac12$','$0$','$\\tfrac12$'], answer:0,
          why:'By branches, $\\tfrac12(-1)+\\tfrac12(0)=-\\tfrac12$. The trace of $\\rho Z$ gives the same.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.1.4 -- */
{ id:'m3-ensemble', module:'M3', nav:'Ensembles are not unique', title:'Non-Uniqueness of Ensembles',
  objective:'Show two different ensembles with the same density operator and say what follows.',
  keywords:'ensemble decomposition not unique maximally mixed identity over two operationally identical preparation',
  src:'L6 · density operators: pure states, mixtures, and reduced states', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'Non-Uniqueness of Ensembles'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figEnsemble(),
      caption:'Two preparations drawn in a cross-section of the qubit states. The pair $|0\\rangle$, $|1\\rangle$ and the pair $|{+}\\rangle$, $|{-}\\rangle$ each average to the centre, $I/2$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A story, not a fact', html:'"The qubit really was $|0\\rangle$ or $|1\\rangle$" is one story. The second device fits the same matrix, and no experiment picks one story over the other.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two ensembles, one matrix', tex:'\\frac{I}{2} = \\tfrac12\\left(|0\\rangle\\langle 0| + |1\\rangle\\langle 1|\\right) = \\tfrac12\\left(|{+}\\rangle\\langle {+}| + |{-}\\rangle\\langle {-}|\\right)',
      note:'One device emits $|0\\rangle$ or $|1\\rangle$ on a fair coin; the other emits $|{+}\\rangle$ or $|{-}\\rangle$. The matrices are equal, so every prediction is equal too.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\langle Z\\rangle &= \\tfrac12(1-1) = \\tfrac12(0+0) = 0 \\\\ \\langle X\\rangle &= \\tfrac12(0+0) = \\tfrac12(1-1) = 0 \\end{aligned}',
        note:'The first device, then the second, computed by branches. In each basis both give a fair coin, which is what $I/2$ says.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A third device emits $|{+}i\\rangle$ or $|{-}i\\rangle$ on a fair coin.<div class="nsep"></div>Can any measurement tell it from the first two?',
        ask:{key:'m3-ensemble', choices:['No: its matrix is also $I/2$','Yes: measure $Y$','Yes, with enough copies'], answer:0,
          why:'$\\tfrac12\\left(|{+}i\\rangle\\langle{+}i|+|{-}i\\rangle\\langle{-}i|\\right)=I/2$. The same matrix gives the same statistics for every measurement.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-rho', module:'M3', nav:'Code · The density operator', title:'The Density Operator in Code',
  objective:'Build a density matrix, test a candidate against the three conditions, and compare two preparations of one state.',
  keywords:'code qiskit numpy program density matrix outer product positivity eigenvalues ensemble run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · The density operator'},
  {t:'title', text:'The Density Operator in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-rho')}
]},

/* ---------------------------------------------------------------- 3.2.1 -- */
{ id:'m3-purity', module:'M3', nav:'Purity', title:'Purity',
  objective:'Compute the purity of a state and place it between its two bounds.',
  keywords:'purity trace rho squared bounds maximally mixed pure state rank one idempotent dimension',
  src:'L6 · which matrices are physical states?', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Purity and the ball of states'},
  {t:'title', text:'Purity'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figPurity(),
      caption:'The purity of $(1-p)|0\\rangle\\langle 0| + p|1\\rangle\\langle 1|$. It is one at both ends and one half in the middle, where the coin is fair. For a qubit it never goes below one half.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'How mixed, not which state', html:'Purity is one number and a qubit state needs three. A whole family of states shares each value of the purity.'}]},
  ], right:[
    {t:'eq', key:true, label:'Purity', tex:'\\gamma = \\operatorname{Tr}\\left(\\rho^{2}\\right) = \\sum_{k}\\lambda_{k}^{2}, \\qquad \\frac{1}{d} \\le \\gamma \\le 1',
      note:'It is one exactly for pure states, where $\\rho^{2}=\\rho$, and $1/d$ exactly for $I/d$. No diagonalising is needed: $\\operatorname{Tr}\\rho^{2}$ is the sum of $|\\rho_{jk}|^{2}$ over all entries.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\gamma &= 0.75^{2}+0.25^{2}+2(0.25)^{2} \\\\ &= 0.5625+0.0625+0.125 = 0.75 \\end{aligned}',
        note:'For $\\rho=\\begin{bmatrix}0.75&0.25\\\\0.25&0.25\\end{bmatrix}$. Its eigenvalues are about $0.854$ and $0.146$, and $0.854^{2}+0.146^{2}=0.75$ as well.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\rho=\\begin{bmatrix}0.8&0\\\\0&0.2\\end{bmatrix}$.<div class="nsep"></div>What is its purity?',
        ask:{key:'m3-purity', choices:['$0.68$','$0.8$','$1$'], answer:0,
          why:'$0.8^{2}+0.2^{2}=0.64+0.04=0.68$, between $\\tfrac12$ and $1$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.2.2 -- */
{ id:'m3-ball', module:'M3', nav:'The ball of qubit states', title:'The Bloch Ball',
  objective:'Write a qubit density operator in the Pauli basis and read purity off the length of its vector.',
  keywords:'bloch vector ball pauli expansion length purity eigenvalues mixed inside sphere surface qubit',
  src:'L6 · example: a pure qubit', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Purity and the ball of states'},
  {t:'title', text:'The Bloch Ball'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figBall(),
      caption:'A flat cross-section of the ball. A pure state reaches the rim, a mixed one falls short, and $I/2$ sits at the centre. Chapter 4 draws the whole sphere.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The centre is not a superposition', html:'$\\left(|0\\rangle+|1\\rangle\\right)/\\sqrt2$ is $|{+}\\rangle$, a pure state on the rim. The centre is the mixture of $|0\\rangle$ and $|1\\rangle$. Adding vectors is not adding matrices.'}]},
  ], right:[
    {t:'eq', key:true, label:'Pauli form', tex:'\\rho = \\tfrac12\\left(I + \\mathbf{r}\\cdot\\boldsymbol\\sigma\\right), \\qquad \\operatorname{Tr}\\rho^{2} = \\tfrac12\\left(1 + |\\mathbf{r}|^{2}\\right)',
      note:'Here $r_{a}=\\operatorname{Tr}(\\rho\\,\\sigma_{a})$, the three Pauli means. The eigenvalues are $\\tfrac12(1\\pm|\\mathbf{r}|)$, so positivity is $|\\mathbf{r}|\\le 1$: pure states on the surface, mixed ones inside.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} r_{z} &= 0.75-0.25 = 0.5, \\quad r_{x} = 2(0.25) = 0.5 \\\\ |\\mathbf{r}|^{2} &= 0.5, \\quad \\tfrac12\\left(1+0.5\\right) = 0.75 \\end{aligned}',
        note:'For $\\rho=\\begin{bmatrix}0.75&0.25\\\\0.25&0.25\\end{bmatrix}$, with $r_{y}=0$. The purity is $0.75$, as on the last slide.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A qubit state has $\\mathbf{r}=(0.6,\\,0,\\,0)$.<div class="nsep"></div>What are the eigenvalues of $\\rho$?',
        ask:{key:'m3-ball', choices:['$0.8$ and $0.2$','$0.6$ and $0.4$','$0.68$ and $0.32$'], answer:0,
          why:'$\\tfrac12(1\\pm 0.6)$ gives $0.8$ and $0.2$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-purity', module:'M3', nav:'Code · Purity and the ball', title:'Purity and the Bloch Ball in Code',
  objective:'Compute a purity by two routes, read the Bloch vector of a mixed state, and follow the purity of a mixture.',
  keywords:'code qiskit numpy program purity bloch vector pauli expansion mixture eigenvalues run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · Purity and the ball of states'},
  {t:'title', text:'Purity and the Bloch Ball in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-purity')}
]},

/* ---------------------------------------------------------------- 3.3.1 -- */
{ id:'m3-kraus', module:'M3', nav:'Quantum channels', title:'Quantum Channels and Kraus Operators',
  objective:'State the Kraus form of a channel and check that it preserves the trace.',
  keywords:'quantum channel kraus operators cptp completely positive trace preserving operator sum environment',
  src:'L6 · quantum channels and Kraus operators', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Quantum Channels and Kraus Operators'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figKraus(),
      caption:'A channel is one unitary on the system and its environment, with the environment then ignored. The whole is still closed; the map on $\\rho$ is not unitary only because part of the result is never read.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The operators are not the channel', html:'Two different sets of Kraus operators can give the same map. Only $\\rho\\mapsto\\mathcal{E}(\\rho)$ is physical, not the individual $K_{k}$.'}]},
  ], right:[
    {t:'eq', key:true, label:'Kraus form', tex:'\\mathcal{E}(\\rho) = \\sum_{k} K_{k}\\,\\rho\\,K_{k}^{\\dagger}, \\qquad \\sum_{k} K_{k}^{\\dagger}K_{k} = I',
      note:'The second condition keeps the trace, because $\\operatorname{Tr}\\left(K\\rho K^{\\dagger}\\right)=\\operatorname{Tr}\\left(K^{\\dagger}K\\rho\\right)$. A unitary is the one-term case, $K_{0}=U$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} K_{0} &= \\sqrt{1-p}\\,I, \\quad K_{1} = \\sqrt{p}\\,X \\\\ K_{0}^{\\dagger}K_{0} + K_{1}^{\\dagger}K_{1} &= (1-p)\\,I + p\\,I = I \\end{aligned}',
        note:'The <b>bit-flip</b> channel: $X$ with probability $p$, nothing otherwise. $X^{\\dagger}X=I$, so the two terms add to the identity and the trace is kept.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The bit-flip channel with $p=\\tfrac14$ acts on $|0\\rangle$.<div class="nsep"></div>What is $\\rho_{11}$ afterwards?',
        ask:{key:'m3-kraus', choices:['$\\tfrac14$','$\\tfrac12$','$0$'], answer:0,
          why:'With probability $\\tfrac34$ nothing happens and with $\\tfrac14$ the state becomes $X|0\\rangle=|1\\rangle$. So $\\rho=\\operatorname{diag}(\\tfrac34,\\tfrac14)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.3.2 -- */
{ id:'m3-damp', module:'M3', nav:'Amplitude damping', title:'Amplitude Damping',
  objective:'Apply the amplitude-damping Kraus operators and say what happens to each entry.',
  keywords:'amplitude damping relaxation energy loss spontaneous emission kraus population coherence square root',
  src:'L6 · quantum channels and Kraus operators', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Amplitude Damping'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figDamp(),
      caption:'The upper population and the coherence of $|{+}\\rangle$ under damping. The population falls linearly in $\\gamma$ and the coherence as its square root, so more coherence is left than population.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'A fixed point', html:'At $\\gamma=1$ every state becomes $|0\\rangle$. Damping drives the qubit to one state; dephasing, next, destroys as much and drives it nowhere.'}]},
  ], right:[
    {t:'eq', key:true, label:'Amplitude damping', tex:'K_{0}=\\begin{bmatrix}1&0\\\\0&\\sqrt{1-\\gamma}\\end{bmatrix}, \\qquad K_{1}=\\begin{bmatrix}0&\\sqrt{\\gamma}\\\\0&0\\end{bmatrix}',
      note:'$\\gamma$ is the probability that the upper level emits. Multiplied out: $\\rho_{11}\\mapsto(1-\\gamma)\\,\\rho_{11}$ and $\\rho_{01}\\mapsto\\sqrt{1-\\gamma}\\,\\rho_{01}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\rho_{11} &\\to \\tfrac12\\left(1-\\tfrac12\\right) = 0.25, \\quad \\rho_{00} \\to 0.75 \\\\ \\rho_{01} &\\to \\tfrac12\\sqrt{0.5} \\approx 0.354, \\quad \\operatorname{Tr}\\rho^{2} = 0.875 \\end{aligned}',
        note:'For $|{+}\\rangle$ with $\\gamma=\\tfrac12$. The state moves inside the ball and towards $|0\\rangle$, where all the population ends up.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|1\\rangle$ goes through amplitude damping with $\\gamma=0.3$.<div class="nsep"></div>What is $\\rho_{11}$ afterwards?',
        ask:{key:'m3-damp', choices:['$0.7$','$0.3$','$\\sqrt{0.7}$'], answer:0,
          why:'$\\rho_{11}\\mapsto(1-\\gamma)\\,\\rho_{11}=0.7$. The square root belongs to the coherence, not to the population.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.3.3 -- */
{ id:'m3-dephase', module:'M3', nav:'Dephasing', title:'Dephasing',
  objective:'Apply the phase-flip channel and identify what it does and does not change.',
  keywords:'dephasing phase flip channel decoherence coherence populations unchanged measured and ignored basis',
  src:'L6 · quantum channels and Kraus operators', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Dephasing'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figDephase(),
      caption:'The populations and the coherence of $|{+}\\rangle$ under the phase-flip channel. The populations stay at one half. Only the coherence moves, and it carries every interference effect.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Decoherence needs a basis', html:'This channel destroys coherence in the $Z$ basis only. A qubit in $|0\\rangle$ is untouched by any amount of it.'}]},
  ], right:[
    {t:'eq', key:true, label:'Phase flip', tex:'\\mathcal{E}_{Z}(\\rho) = (1-p)\\,\\rho + p\\,Z\\rho Z',
      note:'$Z$ keeps the diagonal and flips the sign of the off-diagonal. So the populations never move, and $\\rho_{01}\\mapsto(1-2p)\\,\\rho_{01}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} p = \\tfrac12:&\\quad \\rho \\mapsto |0\\rangle\\langle 0|\\rho|0\\rangle\\langle 0| + |1\\rangle\\langle 1|\\rho|1\\rangle\\langle 1| \\\\ p = 1:&\\quad \\rho \\mapsto Z\\rho Z \\end{aligned}',
        note:'At one half the coherence is gone: this is a $Z$ measurement with the result thrown away, as in chapter 2. At $p=1$ the channel is the gate $Z$, and the coherence is back with a sign change.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|{+}\\rangle$ goes through the phase-flip channel with $p=0.1$.<div class="nsep"></div>What is $|\\rho_{01}|$ afterwards?',
        ask:{key:'m3-dephase', choices:['$0.4$','$0.45$','$0.5$'], answer:0,
          why:'$\\rho_{01}=\\tfrac12$ for $|{+}\\rangle$, times $1-2p=0.8$, gives $0.4$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.L1 --- */
{ id:'m3-lab-e', module:'M3', nav:'Laboratory E', title:'Laboratory E \u2014 A Channel on the Bloch Ball',
  objective:'Let the reader choose a state and a channel and watch the ball of states deform.',
  keywords:'laboratory channel bloch ball depolarising amplitude damping dephasing purity contraction fixed point',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Laboratory E \u2014 A Channel on the Bloch Ball'},
  {t:'small', html:'The left panel is the flat cross-section of the ball again, with the chosen input state and where the channel sends it, and with the whole rim carried along so the deformation of the set is visible. The right panel follows the purity as the strength is turned up. Find the state each channel leaves alone, and notice that two of the three channels have one and the third has a whole line of them.'},
  {t:'lab', id:'E'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-channels', module:'M3', nav:'Code · Quantum channels', title:'Quantum Channels in Code',
  objective:'Check that a set of Kraus operators keeps the trace, and apply amplitude damping and dephasing to a state.',
  keywords:'code qiskit numpy program kraus channel amplitude damping dephasing bit flip coherence run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · Quantum channels'},
  {t:'title', text:'Quantum Channels in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-channels')}
]},

/* ---------------------------------------------------------------- 3.4.1 -- */
{ id:'m3-t1t2', module:'M3', nav:'T1 and T2', title:'Relaxation and Dephasing Times',
  objective:'Write the two exponential decays and derive the inequality between their times.',
  keywords:'T1 T2 relaxation dephasing lindblad master equation exponential decay coherence time inequality echo',
  src:'L6 · Markovian relaxation and dephasing', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Relaxation and dephasing'},
  {t:'title', text:'Relaxation and Dephasing Times'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figT1T2(),
      caption:'Population and coherence against time, for $T_{2}=1.5\\,T_{1}$. The faint curve is the ceiling $T_{2}=2T_{1}$: no coherence decays more slowly than that.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'$T_{2}$ and $T_{2}^{*}$ differ', html:'$T_{2}^{*}$ comes from a plain interference run and includes drift of the qubit frequency. A spin echo removes the drift and gives the longer $T_{2}$. Say which one was measured.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two decays', tex:'\\begin{aligned} \\rho_{11}(t) &= \\rho_{11}^{\\mathrm{eq}} + \\left[\\rho_{11}(0)-\\rho_{11}^{\\mathrm{eq}}\\right]e^{-t/T_{1}} \\\\ \\rho_{01}(t) &= e^{-t/T_{2}}\\,\\rho_{01}(0) \\end{aligned}',
      note:'$T_{1}$ is how long a population lasts, $T_{2}$ how long a relative phase lasts. Losing population also costs coherence: damping took $\\rho_{01}$ as $\\sqrt{1-\\gamma}$, which is half the rate.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'The bound on T2', tex:'\\frac{1}{T_{2}} = \\frac{1}{2T_{1}} + \\frac{1}{T_{\\phi}} \\qquad\\Longrightarrow\\qquad T_{2} \\le 2T_{1}',
        note:'$1/T_{\\phi}$ is a separate pure-dephasing rate. With none, $T_{2}=2T_{1}$, the best a qubit can do. The figure has $T_{\\phi}=6\\,T_{1}$, which gives $T_{2}=1.5\\,T_{1}$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A qubit has $T_{1}=100\\,\\mu\\text{s}$ and $T_{\\phi}=200\\,\\mu\\text{s}$.<div class="nsep"></div>What is $T_{2}$?',
        ask:{key:'m3-t1t2', choices:['$100\\,\\mu\\text{s}$','$200\\,\\mu\\text{s}$','$67\\,\\mu\\text{s}$'], answer:0,
          why:'$1/T_{2}=1/200+1/200=1/100$, so $T_{2}=100\\,\\mu\\text{s}$: half the ceiling $2T_{1}=200\\,\\mu\\text{s}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-t1t2', module:'M3', nav:'Code · T1 and T2', title:'Relaxation and Dephasing in Code',
  objective:'Compute T2 from two rates, print the two decays, and build the continuous decay out of many small channels.',
  keywords:'code qiskit numpy program T1 T2 relaxation dephasing decay exponential kraus steps run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · Relaxation and dephasing'},
  {t:'title', text:'Relaxation and Dephasing in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-t1t2')}
]},

/* ---------------------------------------------------------------- 3.5.1 -- */
{ id:'m3-order', module:'M3', nav:'Two qubits, and their order', title:'Two-Qubit States and Qubit Ordering',
  objective:'Write a two-qubit state in the fixed ordering and locate each amplitude.',
  keywords:'two qubits tensor product basis ordering convention kronecker significant bit index product state',
  src:'L6 · composite systems and tensor products', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Composite systems and the partial trace'},
  {t:'title', text:'Two-Qubit States and Qubit Ordering'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOrder(),
      caption:'Which entry belongs to which pair of bits, in this course\u2019s ordering $|q_{1}q_{0}\\rangle$. Circuit drawings put $q_{0}$ at the top; that is a drawing convention, not a second ordering.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'This one fails silently', html:'The other ordering builds $(ac,\\,bc,\\,ad,\\,bd)$ from the same two states. No error, norm one, and a different state. Print the four amplitudes whenever a state moves between programs.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two qubits', tex:'|\\psi\\rangle = c_{0}|00\\rangle + c_{1}|01\\rangle + c_{2}|10\\rangle + c_{3}|11\\rangle',
      note:'Entry $x$ of the column is the amplitude of the bit string $x$, read as $|q_{1}q_{0}\\rangle$. The left qubit is the more significant bit.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{bmatrix}a\\\\b\\end{bmatrix}\\otimes\\begin{bmatrix}c\\\\d\\end{bmatrix} = \\begin{bmatrix}ac\\\\ad\\\\bc\\\\bd\\end{bmatrix}',
        note:'A product of two qubit states. The left factor changes every two entries, the right factor every entry.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The state $\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right)\\otimes|1\\rangle$.<div class="nsep"></div>Which entries of the column are non-zero?',
        ask:{key:'m3-order', choices:['$c_{1}$ and $c_{3}$','$c_{2}$ and $c_{3}$','$c_{0}$ and $c_{1}$'], answer:0,
          why:'The right qubit is $1$ in both terms, so the strings are $01$ and $11$: entries $1$ and $3$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.5.2 -- */
{ id:'m3-ptrace', module:'M3', nav:'The partial trace', title:'The Partial Trace',
  objective:'Compute a partial trace by the block rule and say what characterises it.',
  keywords:'partial trace reduced density operator subsystem block matrix trace out marginal characterisation',
  src:'L6 · partial trace: the state of a subsystem', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Composite systems and the partial trace'},
  {t:'title', text:'The Partial Trace'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figPtrace(),
      caption:'The rule for two qubits. Cut the four-by-four matrix into two-by-two blocks: their traces give $\\rho_{A}$, and the sum of the diagonal blocks gives $\\rho_{B}$. Swapping the two is the usual slip.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'It cannot be undone', html:'The Bell pair and the classical mixture of $|00\\rangle$ and $|11\\rangle$ both give $I/2$ on each side. Their difference lives in the correlations the partial trace threw away.'}]},
  ], right:[
    {t:'eq', key:true, label:'Partial trace', tex:'\\rho_{A} = \\operatorname{Tr}_{B}\\rho_{AB} = \\sum_{j}\\left(I_{A}\\otimes\\langle j|\\right)\\rho_{AB}\\left(I_{A}\\otimes|j\\rangle\\right)',
      note:'$\\rho_{A}$ is the one operator that reproduces every measurement on $A$ alone: $\\operatorname{Tr}(\\rho_{A}A)=\\operatorname{Tr}\\left[\\rho_{AB}(A\\otimes I_{B})\\right]$ for every $A$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\rho_{AB} &= \\tfrac12\\left(|00\\rangle\\langle 00| + |00\\rangle\\langle 11| + |11\\rangle\\langle 00| + |11\\rangle\\langle 11|\\right) \\\\ \\rho_{A} &= \\tfrac12\\left(|0\\rangle\\langle 0| + |1\\rangle\\langle 1|\\right) = I/2 \\end{aligned}',
        note:'For $|\\Phi^{+}\\rangle$. The cross terms carry $\\langle 1|0\\rangle=0$ from $B$ and drop out. Every measurement on one qubit of a Bell pair is a fair coin.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|01\\rangle\\right)$.<div class="nsep"></div>What is $\\rho_{A}$, the state of the left qubit?',
        ask:{key:'m3-ptrace', choices:['$|0\\rangle\\langle 0|$','$I/2$','$|{+}\\rangle\\langle{+}|$'], answer:0,
          why:'The state is $|0\\rangle\\otimes|{+}\\rangle$, and the left qubit is $0$ in both terms. $|{+}\\rangle\\langle{+}|$ is $\\rho_{B}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.5.3 -- */
{ id:'m3-local', module:'M3', nav:'A pure whole with mixed parts', title:'Reduced States of a Pure Pair',
  objective:'Show that a maximally entangled pair has maximally mixed parts and say what that rules out.',
  keywords:'entanglement local mixedness reduced state maximally mixed pure joint state purity contrast product',
  src:'L6 · partial trace: the state of a subsystem', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Composite systems and the partial trace'},
  {t:'title', text:'Reduced States of a Pure Pair'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figLocal(),
      caption:'Purity of the pair and of one half. The product pair is pure and so is its half. The entangled pair is just as pure, and its half is at the bottom of the range.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Where a mixed state comes from', html:'Either a coin chose the preparation, or the qubit is entangled with something nobody looks at. On hardware it is usually the second, and the something is the environment.'}]},
  ], right:[
    {t:'eq', key:true, label:'Pure whole, mixed parts', tex:'\\operatorname{Tr}\\rho_{AB}^{2} = 1, \\qquad \\operatorname{Tr}\\rho_{A}^{2} = \\tfrac12',
      note:'For $|\\Phi^{+}\\rangle$ the pair is one known vector, and each half is $I/2$, the most mixed a qubit can be. For classical systems a certain whole always has certain parts.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Definition', tex:'\\text{a pure } |\\psi\\rangle_{AB} \\text{ is entangled} \\iff \\rho_{A} \\text{ is mixed}',
        note:'Complete knowledge of the whole with incomplete knowledge of the parts is not a paradox; it is what <b>entangled</b> means. The next section turns it into a number.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(|01\\rangle-|10\\rangle\\right)$.<div class="nsep"></div>What is the purity of the left qubit?',
        ask:{key:'m3-local', choices:['$\\tfrac12$','$1$','$0$'], answer:0,
          why:'The two terms differ in $B$, so the cross terms drop out and $\\rho_{A}=I/2$. Its purity is $\\tfrac14+\\tfrac14=\\tfrac12$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-ptrace', module:'M3', nav:'Code · Two systems', title:'Two Systems in Code',
  objective:'Build a two-qubit state in the fixed ordering, take both partial traces, and compare the purity of a pair with its halves.',
  keywords:'code qiskit numpy program tensor product ordering partial trace reduced state purity bell run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · Composite systems and the partial trace'},
  {t:'title', text:'Two Systems in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-ptrace')}
]},

/* ---------------------------------------------------------------- 3.6.1 -- */
{ id:'m3-sep', module:'M3', nav:'Product or entangled', title:'Separable and Entangled States',
  objective:'Decide whether a two-qubit pure state factors, and factor it when it does.',
  keywords:'separable product state entangled test determinant factor amplitudes bipartite pure mixed convex',
  src:'L6 · separability and the Schmidt decomposition', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Separability and the Schmidt decomposition'},
  {t:'title', text:'Separable and Entangled States'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figSep(),
      caption:'The four amplitudes as a two-by-two array: rows for the left qubit, columns for the right. The determinant is zero for the product and one half for the Bell state.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Mixed states are harder', html:'A mixed $\\rho_{AB}$ is separable when it is a mixture of products, $\\sum_{i}p_{i}\\,\\rho_{A}^{(i)}\\otimes\\rho_{B}^{(i)}$. No test as short as the determinant exists for it.'}]},
  ], right:[
    {t:'eq', key:true, label:'Product test', tex:'|\\psi\\rangle \\text{ is a product} \\iff c_{0}c_{3} - c_{1}c_{2} = 0',
      note:'A product has amplitudes $ac,\\,ad,\\,bc,\\,bd$, and exactly then the determinant of the array is zero. A state that is not a product is <b>entangled</b>.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} c &= \\tfrac12\\left(1,\\,1,\\,1,\\,1\\right) \\\\ c_{0}c_{3} - c_{1}c_{2} &= \\tfrac14 - \\tfrac14 = 0 \\end{aligned}',
        note:'So the state is a product: $|{+}\\rangle\\otimes|{+}\\rangle$. Its reduced state $|{+}\\rangle\\langle{+}|$ is pure, which is a second route to the same answer.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac12\\left(|00\\rangle+|01\\rangle+|10\\rangle-|11\\rangle\\right)$.<div class="nsep"></div>Is it a product or entangled?',
        ask:{key:'m3-sep', choices:['Entangled','A product','The amplitudes cannot tell'], answer:0,
          why:'$c_{0}c_{3}-c_{1}c_{2}=-\\tfrac14-\\tfrac14=-\\tfrac12$, which is not zero. One minus sign is enough.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.6.2 -- */
{ id:'m3-schmidt', module:'M3', nav:'The Schmidt decomposition', title:'The Schmidt Decomposition',
  objective:'State the Schmidt decomposition and read the entanglement off its rank.',
  keywords:'schmidt decomposition coefficients rank orthonormal bases bipartite pure state reduced eigenvalues',
  src:'L6 · separability and the Schmidt decomposition', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Separability and the Schmidt decomposition'},
  {t:'title', text:'The Schmidt Decomposition'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figSchmidt(),
      caption:'The two Schmidt coefficients of $\\cos\\theta\\,|00\\rangle+\\sin\\theta\\,|11\\rangle$. At the ends one is zero and the state is a product. Where they are equal the state is maximally entangled.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Both sides agree', html:'$\\rho_{A}$ and $\\rho_{B}$ have the same non-zero eigenvalues. So one qubit entangled with a thousand others still has at most two Schmidt terms.'}]},
  ], right:[
    {t:'eq', key:true, label:'Schmidt decomposition', tex:'|\\psi\\rangle_{AB} = \\sum_{k=1}^{r} \\sqrt{\\lambda_{k}}\\;|u_{k}\\rangle_{A}\\,|v_{k}\\rangle_{B}, \\qquad \\sum_{k}\\lambda_{k}=1',
      note:'The two sets are orthonormal and chosen for the state, and $\\rho_{A}=\\sum_{k}\\lambda_{k}|u_{k}\\rangle\\langle u_{k}|$. The number of terms $r$ is the <b>Schmidt rank</b>: entangled exactly when $r>1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} |\\psi\\rangle &= \\tfrac{\\sqrt3}{2}\\,|00\\rangle + \\tfrac12\\,|11\\rangle \\\\ \\lambda &= \\tfrac34, \\ \\tfrac14, \\quad r = 2 \\end{aligned}',
        note:'Already in Schmidt form. Rank two, so entangled but not maximally: $\\rho_{A}=\\operatorname{diag}(0.75,0.25)$ has purity $0.625$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac{1}{\\sqrt5}\\left(2|00\\rangle+|11\\rangle\\right)$.<div class="nsep"></div>What are its Schmidt coefficients $\\lambda_{k}$?',
        ask:{key:'m3-schmidt', choices:['$\\tfrac45$ and $\\tfrac15$','$\\tfrac{2}{\\sqrt5}$ and $\\tfrac{1}{\\sqrt5}$','$\\tfrac12$ and $\\tfrac12$'], answer:0,
          why:'The amplitudes are $\\sqrt{\\lambda_{k}}$, so square them: $\\tfrac45$ and $\\tfrac15$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.6.3 -- */
{ id:'m3-svd', module:'M3', nav:'Computing it', title:'Computing the Schmidt Decomposition',
  objective:'Reshape a state vector into a coefficient matrix and get the Schmidt data from its singular values.',
  keywords:'singular value decomposition svd reshape coefficient matrix numerical rank tolerance schmidt computation',
  src:'L6 · computing Schmidt decompositions with an SVD', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Separability and the Schmidt decomposition'},
  {t:'title', text:'Computing the Schmidt Decomposition'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figSVD(),
      caption:'The recipe: reshape the four amplitudes into a two-by-two matrix, take its singular values, and square them. For $n$ qubits split into two groups the matrix is rectangular and nothing else changes.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Two things to state first', html:'The qubit ordering, and which qubits go in the rows. And the rank counts singular values above a stated tolerance: $10^{-16}$ is a zero, not a third term.'}]},
  ], right:[
    {t:'eq', key:true, label:'Reshape, then SVD', tex:'|\\psi\\rangle = \\sum_{i,j} C_{ij}\\,|i\\rangle_{A}|j\\rangle_{B}, \\qquad C = U\\Sigma V^{\\dagger}',
      note:'Rows are the first system and columns the second. The singular values are the square roots $\\sqrt{\\lambda_{k}}$ and the singular vectors are the two Schmidt bases. Also $\\rho_{A}=CC^{\\dagger}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} c &= \\left(\\tfrac{\\sqrt3}{2},\\,0,\\,0,\\,\\tfrac12\\right) \\\\ C &= \\begin{bmatrix}\\sqrt3/2&0\\\\0&1/2\\end{bmatrix}, \\quad \\lambda = \\tfrac34, \\ \\tfrac14 \\end{aligned}',
        note:'$C$ is already diagonal, so its singular values are $\\sqrt3/2$ and $1/2$. $CC^{\\dagger}=\\operatorname{diag}(0.75,0.25)$ is $\\rho_{A}$ by the block rule too.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$c=\\tfrac12\\left(1,\\,-1,\\,1,\\,-1\\right)$.<div class="nsep"></div>How many non-zero singular values does $C$ have?',
        ask:{key:'m3-svd', choices:['$1$','$2$','$4$'], answer:0,
          why:'Both rows of $C$ are $\\left(\\tfrac12,-\\tfrac12\\right)$, so $C$ has rank one. One Schmidt term: the product $|{+}\\rangle\\otimes|{-}\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-schmidt', module:'M3', nav:'Code · Schmidt decomposition', title:'The Schmidt Decomposition in Code',
  objective:'Apply the product test, compute Schmidt coefficients with an SVD, and count a rank with a stated tolerance.',
  keywords:'code qiskit numpy program separable product test schmidt svd singular values rank tolerance run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · Separability and the Schmidt decomposition'},
  {t:'title', text:'The Schmidt Decomposition in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-schmidt')}
]},

/* ---------------------------------------------------------------- 3.7.1 -- */
{ id:'m3-entropy', module:'M3', nav:'Entropy', title:'Entanglement Entropy',
  objective:'Compute the von Neumann entropy of a reduced state and interpret it as an amount of entanglement.',
  keywords:'von neumann entropy entanglement entropy ebit bits log base two reduced state pure zero maximal',
  src:'L6 · separability and the Schmidt decomposition', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Entropy'},
  {t:'title', text:'Entanglement Entropy'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figEntropy(),
      caption:'The entropy of a two-term Schmidt spectrum, against the larger coefficient. Zero at both ends, where the state is a product, and one bit in the middle.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Only for pure pairs', html:'For a mixed $\\rho_{AB}$, $S(\\rho_{A})$ mixes entanglement with classical noise. A separable noisy state can have a large $S(\\rho_{A})$ and no entanglement at all.'}]},
  ], right:[
    {t:'eq', key:true, label:'Von Neumann entropy', tex:'S(\\rho) = -\\operatorname{Tr}\\left(\\rho\\log_{2}\\rho\\right) = -\\sum_{k}\\lambda_{k}\\log_{2}\\lambda_{k}',
      note:'Zero for a pure state, $\\log_{2}d$ for $I/d$. For a pure pair, $S(\\rho_{A})=S(\\rho_{B})$ is the entanglement in bits. A Bell pair carries one bit, called one <b>ebit</b>.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} S &= -0.75\\log_{2}0.75 - 0.25\\log_{2}0.25 \\\\ &= 0.75(0.415) + 0.25(2) \\approx 0.811 \\end{aligned}',
        note:'For $\\lambda=\\tfrac34,\\tfrac14$: entangled, and worth about four fifths of an ebit.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Two Bell pairs are shared so that one qubit of each pair is on each side.<div class="nsep"></div>What is $S(\\rho_{A})$?',
        ask:{key:'m3-entropy', choices:['$2$ bits','$1$ bit','$4$ bits'], answer:0,
          why:'$\\rho_{A}=\\tfrac{I}{2}\\otimes\\tfrac{I}{2}=\\tfrac{I}{4}$, so $S=\\log_{2}4=2$. Entropy adds over independent pairs.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-entropy', module:'M3', nav:'Code · Entropy', title:'Entropy in Code',
  objective:'Compute the entanglement entropy of three pairs, follow it along a family of states, and see where it stops measuring entanglement.',
  keywords:'code qiskit numpy program von neumann entropy ebit schmidt reduced state mixture run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · Entropy'},
  {t:'title', text:'Entropy in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-entropy')}
]},

/* ---------------------------------------------------------------- 3.8.1 -- */
{ id:'m3-bell', module:'M3', nav:'The Bell states', title:'The Bell States',
  objective:'List the Bell states and compute the three Pauli correlations of one of them.',
  keywords:'bell states phi psi plus minus basis maximally entangled correlations XX YY ZZ classical mixture',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'The Bell States'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figBell(),
      caption:'The three correlations of $|\\Phi^{+}\\rangle$, beside those of the classical mixture $\\tfrac12|00\\rangle\\langle 00|+\\tfrac12|11\\rangle\\langle 11|$. They agree in $Z$ and nowhere else.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What the contrast buys', html:'The classical mixture gets the $Z$ bar right and the $X$ and $Y$ bars wrong. That does not yet rule out a cleverer model; the next slide does.'}]},
  ], right:[
    {t:'eq', key:true, label:'Bell states', tex:'|\\Phi^{\\pm}\\rangle = \\frac{|00\\rangle \\pm |11\\rangle}{\\sqrt2}, \\qquad |\\Psi^{\\pm}\\rangle = \\frac{|01\\rangle \\pm |10\\rangle}{\\sqrt2}',
      note:'An orthonormal basis of two qubits. Every one has $\\rho_{A}=\\rho_{B}=I/2$, so only the joint correlations tell them apart.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} Y\\otimes Y\\,|00\\rangle &= (i)(i)\\,|11\\rangle = -|11\\rangle \\\\ \\langle Y\\otimes Y\\rangle &= -1, \\quad \\langle X\\otimes X\\rangle = \\langle Z\\otimes Z\\rangle = 1 \\end{aligned}',
        note:'On $|\\Phi^{+}\\rangle$. Likewise $Y\\otimes Y|11\\rangle=-|00\\rangle$, so the state is an eigenvector with eigenvalue $-1$. Each correlation is certain, though each answer alone is a fair coin.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The state $|\\Psi^{-}\\rangle$.<div class="nsep"></div>What is $\\langle Z\\otimes Z\\rangle$?',
        ask:{key:'m3-bell', choices:['$-1$','$1$','$0$'], answer:0,
          why:'Both terms, $|01\\rangle$ and $|10\\rangle$, have opposite bits, so every $ZZ$ reading is $-1$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.8.2 -- */
{ id:'m3-chsh', module:'M3', nav:'The classical bound', title:'The CHSH Inequality',
  objective:'Assemble the CHSH combination and derive the bound a model with pre-existing values obeys.',
  keywords:'chsh bell inequality local hidden variable classical bound two pre-existing values correlations',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'The CHSH Inequality'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figChshBox(),
      caption:'The assumption being tested. Whatever fixes a run also fixes all four answers, including the two nobody asked for. That alone traps the combination between $-2$ and $+2$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'No quantum mechanics used', html:'Only that the four values exist together, and that one party\u2019s answer does not depend on the other party\u2019s setting.'}]},
  ], right:[
    {t:'eq', key:true, label:'CHSH combination', tex:'S = \\langle A_{0}B_{0}\\rangle + \\langle A_{0}B_{1}\\rangle + \\langle A_{1}B_{0}\\rangle - \\langle A_{1}B_{1}\\rangle',
      note:'Each party has two settings, and every reading is $\\pm1$. The minus sign on the last term is what makes the bound bite: with four plus signs both theories would reach four.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'The classical bound', tex:'\\begin{aligned} a_{0}\\left(b_{0}+b_{1}\\right) + a_{1}\\left(b_{0}-b_{1}\\right) &= \\pm 2 \\\\ \\Longrightarrow \\quad \\left|S\\right| &\\le 2 \\end{aligned}',
        note:'Suppose every run carries all four values $\\pm1$ before the settings are chosen. One bracket is $\\pm2$ and the other is $0$, so each run gives $\\pm2$, and an average stays in $[-2,2]$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'On one run a model has $a_{0}=a_{1}=b_{0}=+1$ and $b_{1}=-1$.<div class="nsep"></div>What is $a_{0}b_{0}+a_{0}b_{1}+a_{1}b_{0}-a_{1}b_{1}$?',
        ask:{key:'m3-chsh', choices:['$2$','$0$','$4$'], answer:0,
          why:'$1-1+1+1=2$. Grouped, $a_{0}(b_{0}+b_{1})=0$ and $a_{1}(b_{0}-b_{1})=2$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.8.3 -- */
{ id:'m3-violate', module:'M3', nav:'The violation', title:'The Quantum Violation of CHSH',
  objective:'Evaluate the CHSH combination on a Bell state and say precisely which assumption fails.',
  keywords:'chsh violation tsirelson 2 root 2 bell state measurement angles refutation realism error bar shots',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'The Quantum Violation of CHSH'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCHSH(),
      caption:'The combination with the second party\u2019s two settings at $\\pm\\varphi$ from $z$. The dashed line is the classical bound, and the curve is above it over a wide range of angles.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'What is refuted', html:'Not "the qubits communicate". What fails is that all four outcomes exist before the settings are chosen. A measured $S$ also needs a shot count and an error bar.'}]},
  ], right:[
    {t:'eq', key:true, label:'Correlation on the Bell state', tex:'\\langle \\left(\\mathbf{n}\\cdot\\boldsymbol\\sigma\\right)\\otimes\\left(\\mathbf{m}\\cdot\\boldsymbol\\sigma\\right)\\rangle = n_{x}m_{x} - n_{y}m_{y} + n_{z}m_{z}',
      note:'On $|\\Phi^{+}\\rangle$. For directions in the $z$–$x$ plane at angles $\\alpha$ and $\\beta$ from $z$, this is $\\cos(\\alpha-\\beta)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} A_{0} &= Z, \\quad A_{1} = X, \\quad B_{0,1} = \\left(Z \\pm X\\right)/\\sqrt2 \\\\ S &= \\tfrac{1}{\\sqrt2} + \\tfrac{1}{\\sqrt2} + \\tfrac{1}{\\sqrt2} + \\tfrac{1}{\\sqrt2} = 2\\sqrt2 \\approx 2.828 \\end{aligned}',
        note:'The fourth correlation is $-1/\\sqrt2$, and the minus sign in $S$ turns it positive. No quantum state and no settings go above $2\\sqrt2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'On $|\\Phi^{+}\\rangle$ all four settings are $Z$.<div class="nsep"></div>What is $S$?',
        ask:{key:'m3-violate', choices:['$2$','$2\\sqrt2$','$0$'], answer:0,
          why:'Every correlation is $\\langle Z\\otimes Z\\rangle=1$, so $S=1+1+1-1=2$: on the bound, not above it. A violation needs different settings.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 3.L2 --- */
{ id:'m3-lab-f', module:'M3', nav:'Laboratory F', title:'Laboratory F \u2014 The CHSH Game',
  objective:'Let the reader set the four measurement directions and read the CHSH value against the classical bound.',
  keywords:'laboratory chsh bell inequality four angles classical bound tsirelson correlations violation sweep',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'Laboratory F \u2014 The CHSH Game'},
  {t:'small', html:'Both parties measure $|\\Phi^{+}\\rangle$ along a direction in the $z$–$x$ plane, and each of the four directions is a slider. The left panel is the four correlations; the right one sweeps the first of the other party\u2019s two settings with the rest held where they are, against the classical bound and the largest value quantum mechanics permits. Find a setting that violates the bound, then find one that does not, and notice how much of the circle each occupies.'},
  {t:'lab', id:'F'}
]},

/* ---------------------------------------------------------------- 3.8.4 -- */
{ id:'m3-nosig', module:'M3', nav:'No signalling', title:'The No-Signalling Theorem',
  objective:'Show that one party\u2019s outcome distribution does not depend on the other party\u2019s choice.',
  keywords:'no signalling faster than light communication reduced state unchanged partial trace correlation classical channel',
  src:'L6 · Bell states, correlations, and no signaling', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'The No-Signalling Theorem'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figNoSig(),
      caption:'What one party sees, for three things the other party does. Every bar is one half, and no setting moves them, so there is nothing here to carry a message.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Where the correlation appears', html:'Only when the two records are compared, over an ordinary classical channel. Every protocol in chapter 5 that uses a Bell pair also sends classical bits.'}]},
  ], right:[
    {t:'eq', key:true, label:'No signalling', tex:'\\sum_{m} p(m)\\,\\rho_{A\\mid m} = \\rho_{A} \\qquad \\text{for every set } \\{E_{m}\\}',
      note:'The second party measures with effects $E_{m}$ and tells no one. Averaged over those outcomes, the first party\u2019s state is the one it was before.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Why', tex:'\\begin{aligned} \\operatorname{Tr}\\left[\\rho_{AB}\\left(A\\otimes \\textstyle\\sum_{m}E_{m}\\right)\\right] &= \\operatorname{Tr}\\left[\\rho_{AB}\\left(A\\otimes I\\right)\\right] \\\\ &= \\operatorname{Tr}\\left(\\rho_{A}A\\right) \\end{aligned}',
        note:'The effects add to $I$, so the second party\u2019s choice is gone before any number is computed.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The second party measures $Z$ on their half of $|\\Phi^{+}\\rangle$ and tells no one.<div class="nsep"></div>What does the first party now predict for $p(0)$ in $Z$?',
        ask:{key:'m3-nosig', choices:['$\\tfrac12$','$1$','$0$'], answer:0,
          why:'Each outcome has probability $\\tfrac12$ and leaves $|0\\rangle$ or $|1\\rangle$, so the average is $\\tfrac12(1)+\\tfrac12(0)=\\tfrac12$, as before.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m3-code-bell', module:'M3', nav:'Code · Bell correlations', title:'Bell Correlations in Code',
  objective:'Compute the Pauli correlations of Bell states, the CHSH value over a range of angles, and the reduced state after a distant measurement.',
  keywords:'code qiskit numpy program bell states correlations chsh violation no signalling reduced state run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 3 · Bell correlations'},
  {t:'title', text:'Bell Correlations in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-bell')}
]},

/* ---------------------------------------------------------------- 3.9.1 -- */
{ id:'m3-synth', module:'M3', nav:'Summary', title:'Summary',
  objective:'Collect the objects this chapter added and the four errors it exists to prevent.',
  keywords:'summary module 3 review density operator purity channel partial trace schmidt entropy bell chsh',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Summary'},
  {t:'title', text:'Summary'},
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
{ id:'m3-shapes', module:'M3', nav:'The shapes of question', title:'Question Types',
  objective:'Name the recurring question types of chapter 3 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice density purity channel partial trace schmidt chsh',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 3 · Summary and practice'},
  {t:'title', text:'Question Types'},
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
