/* ==========================================================================
   Module 1 — The mathematics of quantum states.

   One chapter, one language. Everything the rest of the course does to a
   quantum state is written in the notation this chapter builds: a state is a
   column of complex numbers, an operation is a matrix, a question is an inner
   product, and two systems together are a tensor product.

   The chapter is written so a reader who has had linear algebra over the reals
   can follow every line. Three things are genuinely new to such a reader and
   each has a scene of its own: the inner product conjugates its first
   argument, a phase between two amplitudes is physical while a phase on the
   whole state is not, and the dimension of a joint space is a product rather
   than a sum. Everything else is recognition.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const R2 = Math.SQRT1_2;

/* ---------------------------------------------------------------- figures --
   Each figure is a function, never a string built at module scope: a figure
   built once at load time keeps the palette it was born with, and the theme
   can change under it. */

/* A box diagram has no axes to stretch, so when a slide grows its figure into
   the spare height of the column, the diagram keeps its size and is centred in
   the taller frame. Without this the frame stops short and leaves the lower
   half of the column empty. */
function growBlocks(spec){
  const h1 = P.hOverride;
  if(!h1 || h1 <= spec.h) return P.blocks(spec);
  const dy = (h1 - spec.h) / 2;
  const items = spec.items.map(it => {
    const o = Object.assign({}, it);
    ['y','y1','y2'].forEach(k => { if(o[k] != null) o[k] += dy; });
    return o;
  });
  return P.blocks({w:spec.w, h:h1, items:items});
}

/* The three translations this chapter installs. Drawn as a table of arrows
   rather than written as a list, because the point is that the left column and
   the right column are the same objects and not two subjects. */
function figLanguage(){
  return P.blocks({w:720,h:236,items:[
    {t:'text',x:360,y:24,label:'once a basis is chosen',fs:13},
    {t:'box',x:40,y:44,w:210,h:48,label:'a state',fs:15},
    {t:'arrow',x1:250,y1:68,x2:400,y2:68},
    {t:'box',x:400,y:44,w:280,h:48,label:'a column of complex numbers',fs:14},
    {t:'box',x:40,y:114,w:210,h:48,label:'an operation',fs:15},
    {t:'arrow',x1:250,y1:138,x2:400,y2:138},
    {t:'box',x:400,y:114,w:280,h:48,label:'a matrix',fs:15},
    {t:'box',x:40,y:184,w:210,h:48,label:'a question',fs:15},
    {t:'arrow',x1:250,y1:208,x2:400,y2:208},
    {t:'box',x:400,y:184,w:280,h:48,label:'\\langle \\phi | \\psi \\rangle,\\; \\text{one number}',tex:true,fs:15}
  ]});
}

/* A superposition drawn in a real slice of the state space. The slice is the
   whole content of the caption: the amplitudes are complex and the picture is
   two of their four real degrees of freedom. */
function figKet(){
  const a = P.Axes({w:480,h:300,xr:[-0.35,1.45],yr:[-0.35,1.30],
    pad:{l:34,r:24,t:26,b:34}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:true, arrows:true});
  a.poly([[0,0],[1,0]],{color:C.grid,width:2.2});
  a.poly([[0,0],[0,1]],{color:C.grid,width:2.2});
  a.point(1,0,{color:C.grid,r:5}); a.point(0,1,{color:C.grid,r:5});
  a.note(1,0,'|0\\rangle',{fs:15,color:C.muted,anchor:'middle',dy:28,tex:true});
  a.note(0,1,'|1\\rangle',{fs:15,color:C.muted,dx:14,dy:-6,tex:true});
  a.poly([[0,0],[0.6,0.8]],{color:C.in,width:2.6});
  a.point(0.6,0.8,{color:C.in,r:6});
  a.poly([[0.6,0],[0.6,0.8]],{color:C.grid,width:1.2,dash:'3 4'});
  a.poly([[0,0.8],[0.6,0.8]],{color:C.grid,width:1.2,dash:'3 4'});
  a.note(0.63,0.86,'|\\psi\\rangle',{fs:15,color:C.in,tex:true});
  a.note(0.6,-0.13,'\\alpha',{fs:14,color:C.muted,anchor:'middle',tex:true});
  a.note(-0.05,0.8,'\\beta',{fs:14,color:C.muted,anchor:'end',tex:true});
  return a.svg();
}

/* What each product does to the shapes. The two rows are the same two arrays
   in the two possible orders, and the shapes say why one is a number and the
   other an operator. */
function figShapes(){
  return growBlocks({w:700,h:210,items:[
    {t:'box',x:40,y:34,w:120,h:52,label:'1\\times n',tex:true,fs:15},
    {t:'box',x:172,y:34,w:120,h:52,label:'n\\times 1',tex:true,fs:15},
    {t:'arrow',x1:300,y1:60,x2:400,y2:60},
    {t:'box',x:400,y:34,w:110,h:52,label:'1\\times 1',tex:true,fs:15},
    {t:'text',x:530,y:64,label:'a number',fs:13,anchor:'start'},
    {t:'text',x:100,y:110,label:'\\langle a|',tex:true,fs:14},
    {t:'text',x:232,y:110,label:'|b\\rangle',tex:true,fs:14},
    {t:'box',x:40,y:134,w:120,h:52,label:'n\\times 1',tex:true,fs:15},
    {t:'box',x:172,y:134,w:120,h:52,label:'1\\times n',tex:true,fs:15},
    {t:'arrow',x1:300,y1:160,x2:400,y2:160},
    {t:'box',x:400,y:134,w:110,h:52,label:'n\\times n',tex:true,fs:15},
    {t:'text',x:530,y:164,label:'an operator',fs:13,anchor:'start'}
  ]});
}

/* Overlap against the angle between two pure states of one qubit. The curve is
   the squared modulus of the inner product and nothing else, so the two ends
   of it are the two cases the scene names. */
function figOverlap(){
  const a = P.Axes({w:540,h:262,xr:[0,2*Math.PI],yr:[0,1.12],
    xlabel:'\\theta', ylabel:'|\\langle 0|\\psi(\\theta)\\rangle|^{2}',
    pad:{l:66,r:26,t:26,b:46}, xtarget:5, ytarget:5});
  a.curve(t => Math.cos(t/2)**2, {color:C.in, width:2.4});
  a.point(0,1,{color:C.out,r:6});
  a.point(Math.PI,0,{color:C.err,r:6});
  a.point(Math.PI/2,0.5,{color:C.mid,r:6});
  /* The three marks are named in the caption rather than beside them: every
     label placed near this curve sits on it somewhere, because the curve
     sweeps the whole height of the frame. */
  return a.svg();
}

/* The same state, read off in two bases. The heights are the moduli of the
   coefficients, and the point of the picture is that they change while the
   state does not. */
function figBasis(){
  const a = P.Axes({w:540,h:246,xr:[-0.7,3.7],yr:[0,1.15],
    ylabel:'|\\text{coefficient}|', pad:{l:60,r:24,t:28,b:52},
    xticksOverride:[], ytarget:4});
  a.stem([[0,1],[1,0]],{color:C.in,r:5});
  a.stem([[2,R2],[3,R2]],{color:C.mid,r:5});
  a.note(0,0,'\\langle 0|0\\rangle',{fs:13,color:C.in,anchor:'middle',dy:28,tex:true});
  a.note(1,0,'\\langle 1|0\\rangle',{fs:13,color:C.in,anchor:'middle',dy:28,tex:true});
  a.note(2,0,'\\langle +|0\\rangle',{fs:13,color:C.mid,anchor:'middle',dy:28,tex:true});
  a.note(3,0,'\\langle -|0\\rangle',{fs:13,color:C.mid,anchor:'middle',dy:28,tex:true});
  return a.svg();
}

/* A complex number, its parts and its conjugate. The conjugate is drawn as a
   reflection in the real axis because that is what it is, and a student who
   has read it as a rotation by pi will see the difference here. */
function figComplex(){
  const a = P.Axes({w:520,h:286,xr:[-0.7,3.3],yr:[-2.3,2.3],
    xlabel:'\\operatorname{Re} z', ylabel:'\\operatorname{Im} z',
    pad:{l:54,r:26,t:30,b:44}, xtarget:4, ytarget:4});
  a.poly([[0,0],[2,1.5]],{color:C.in,width:2.6});
  a.point(2,1.5,{color:C.in,r:6});
  a.poly([[2,0],[2,1.5]],{color:C.grid,width:1.2,dash:'3 4'});
  a.poly([[0,1.5],[2,1.5]],{color:C.grid,width:1.2,dash:'3 4'});
  a.note(2,1.5,'z=x+iy',{fs:14,color:C.in,dx:14,dy:-10,tex:true});
  a.point(2,-1.5,{color:C.mid,r:6});
  a.note(2,-1.5,'z^{*}=x-iy',{fs:14,color:C.mid,dx:14,dy:28,tex:true});
  a.poly([[0,0],[2,-1.5]],{color:C.mid,width:1.6,dash:'4 4'});
  a.note(1.0,0.75,'r=|z|',{fs:13.5,color:C.muted,dx:-52,dy:-12,tex:true});
  a.note(0.42,0.14,'\\varphi',{fs:14,color:C.muted,tex:true});
  return a.svg();
}

/* The two states that a Z measurement cannot tell apart, after one Hadamard.
   Before the gate all four bars are one half; the caption says so, and the
   figure shows only the part that changed. */
function figPhaseBars(){
  const a = P.Axes({w:540,h:254,xr:[0,4.4],yr:[0,1.15],
    ylabel:'\\text{probability}', pad:{l:62,r:24,t:28,b:56},
    xticksOverride:[], ytarget:4});
  a.rect(0.38,0,0.82,1,{fill:C.dec.out});
  a.rect(1.38,0,1.82,0,{fill:C.dec.out});
  a.rect(2.38,0,2.82,0,{fill:C.dec.err});
  a.rect(3.38,0,3.82,1,{fill:C.dec.err});
  a.poly([[0.38,1],[0.82,1]],{color:C.out,width:2.6});
  a.poly([[3.38,1],[3.82,1]],{color:C.err,width:2.6});
  a.poly([[1.38,0],[1.82,0]],{color:C.out,width:2.6});
  a.poly([[2.38,0],[2.82,0]],{color:C.err,width:2.6});
  a.note(0.6,-0.10,'0',{fs:13,color:C.muted,anchor:'middle'});
  a.note(1.6,-0.10,'1',{fs:13,color:C.muted,anchor:'middle'});
  a.note(2.6,-0.10,'0',{fs:13,color:C.muted,anchor:'middle'});
  a.note(3.6,-0.10,'1',{fs:13,color:C.muted,anchor:'middle'});
  a.note(1.1,-0.21,'H|+\\rangle',{fs:14,color:C.out,anchor:'middle',tex:true});
  a.note(3.1,-0.21,'H|-\\rangle',{fs:14,color:C.err,anchor:'middle',tex:true});
  return a.svg();
}

/* Projection in the plane: what the projector keeps, and what its complement
   keeps. The two pieces are drawn as a right angle because that is the only
   property being claimed. */
function figProject(){
  /* One unit is 118.97 px each way: 342 px of data width over an x span of
     2.875, and 232 px of data height over a y span of 1.95. The right angle
     between the two pieces is the only thing this figure claims, and under an
     anisotropic scale it would not be drawn as one. */
  const a = P.Axes({w:400,h:290,xr:[-0.35,2.525],yr:[-0.85,1.10],
    pad:{l:32,r:26,t:26,b:32}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:true, arrows:false});
  a.poly([[0,0],[1.15,1.15]],{color:C.grid,width:1.4,dash:'5 5'});
  a.poly([[0,0],[R2,R2]],{color:C.h,width:2.4});
  a.point(R2,R2,{color:C.h,r:5});
  a.note(R2,R2,'|u\\rangle',{fs:14,color:C.h,dx:12,dy:-8,tex:true});
  a.poly([[0,0],[1,0]],{color:C.in,width:2.6});
  a.point(1,0,{color:C.in,r:6});
  a.note(1,0,'|v\\rangle',{fs:14,color:C.in,dx:10,dy:28,tex:true});
  a.poly([[0,0],[0.5,0.5]],{color:C.out,width:3.2});
  a.point(0.5,0.5,{color:C.out,r:6});
  a.note(0.5,0.5,'P|v\\rangle',{fs:14,color:C.out,anchor:'end',dx:-12,dy:-10,tex:true});
  a.poly([[0.5,0.5],[1,0]],{color:C.mid,width:2.2,dash:'4 4'});
  a.note(0.80,0.36,'(I-P)|v\\rangle',{fs:13,color:C.mid,tex:true});
  return a.svg();
}

/* One vector, resolved by the identity. The two dashed guides are the two
   inner products, and the solid pieces are what they multiply. */
function figResolve(){
  const a = P.Axes({w:500,h:268,xr:[-0.25,1.35],yr:[-0.25,1.15],
    pad:{l:32,r:26,t:26,b:32}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:true, arrows:true});
  a.poly([[0,0],[0.8,0]],{color:C.in,width:3});
  a.poly([[0,0],[0,0.6]],{color:C.in,width:3});
  a.poly([[0,0],[0.8,0.6]],{color:C.out,width:2.6});
  a.point(0.8,0.6,{color:C.out,r:6});
  a.poly([[0.8,0],[0.8,0.6]],{color:C.grid,width:1.2,dash:'3 4'});
  a.poly([[0,0.6],[0.8,0.6]],{color:C.grid,width:1.2,dash:'3 4'});
  a.note(0.82,0.66,'|v\\rangle',{fs:14,color:C.out,tex:true});
  a.note(0.40,-0.13,'\\langle 0|v\\rangle\\,|0\\rangle',{fs:13,color:C.in,anchor:'middle',tex:true});
  a.note(-0.03,0.66,'\\langle 1|v\\rangle\\,|1\\rangle',{fs:13,color:C.in,anchor:'end',tex:true});
  return a.svg();
}

/* One step of Gram-Schmidt, with the subtraction drawn. The second vector is
   not rotated onto a right angle; the part of it that was already along the
   first is removed, and what is left is at a right angle by construction. */
function figGram(){
  /* Isotropic, for the same reason as the projector figure: the right angle
     between what was removed and what was left is the proof. */
  const a = P.Axes({w:400,h:300,xr:[-0.4,2.780],yr:[-0.95,1.30],
    pad:{l:32,r:26,t:26,b:32}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:true, arrows:false});
  a.poly([[0,0],[1,1]],{color:C.in,width:2.6});
  a.point(1,1,{color:C.in,r:6});
  a.note(1,1,'v_{1}',{fs:14,color:C.in,dx:12,dy:-8,tex:true});
  a.poly([[0,0],[1,0]],{color:C.mid,width:2.6});
  a.point(1,0,{color:C.mid,r:6});
  a.note(1,0,'v_{2}',{fs:14,color:C.mid,dx:12,dy:-8,tex:true});
  a.poly([[0,0],[0.5,0.5]],{color:C.h,width:3.2});
  /* Above the line the two vectors share, and ending short of it: below it
     is where the dashed guide and the second vector both are. */
  a.note(0.45,0.62,'\\langle e_{1}|v_{2}\\rangle\\,e_{1}',{fs:13,color:C.h,anchor:'end',tex:true});
  a.poly([[0.5,0.5],[1,0]],{color:C.grid,width:1.4,dash:'4 4'});
  a.poly([[0,0],[0.5,-0.5]],{color:C.out,width:3});
  a.point(0.5,-0.5,{color:C.out,r:6});
  a.note(0.5,-0.5,'u_{2}=v_{2}-\\langle e_{1}|v_{2}\\rangle\\,e_{1}',{fs:13,color:C.out,dx:14,dy:26,tex:true});
  return a.svg();
}

/* Where the exponential comes from, drawn as the thing that causes it: one
   more qubit is one more branch at every leaf. */
function figTree(){
  const a = P.Axes({w:560,h:272,xr:[-0.35,3.55],yr:[-0.6,8.6],
    pad:{l:26,r:26,t:26,b:44}, xticksOverride:[], yticksOverride:[],
    grid:false, zeroAxes:false, arrows:false});
  const levels = [[4],[2,6],[1,3,5,7],[0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5]];
  for(let k=1;k<levels.length;k++){
    levels[k].forEach((y,i)=>{
      a.poly([[k-1, levels[k-1][i>>1]],[k, y]],{color:C.grid,width:1.3});
    });
  }
  const hue = [C.ink, C.in, C.mid, C.out];
  levels.forEach((ys,k)=> ys.forEach(y=> a.point(k,y,{color:hue[k],r:k===3?4:5})));
  [['1',0],['2',1],['4',2],['8',3]].forEach(([t,k])=>
    a.note(k,-0.5,t,{fs:14,color:hue[k],anchor:'middle'}));
  a.note(1.75,-1.35,'basis strings of the register',{fs:13,color:C.muted,anchor:'middle'});
  return a.svg();
}

/* Eigenvalues in the complex plane. A general matrix puts them anywhere; a
   Hermitian one puts them on the real axis, and that is the whole reason an
   observable is Hermitian. */
function figSpectrum(){
  const a = P.Axes({w:540,h:268,xr:[-1.4,3.4],yr:[-1.6,1.6],
    xlabel:'\\operatorname{Re}\\lambda', ylabel:'\\operatorname{Im}\\lambda',
    pad:{l:56,r:26,t:30,b:44}, xtarget:5, ytarget:4});
  a.point(0,1,{color:C.err,r:6});
  a.point(0,-1,{color:C.err,r:6});
  a.note(0.12,1.05,'\\pm i',{fs:14,color:C.err,tex:true});
  a.point(0,0,{color:C.in,r:7});
  a.point(2,0,{color:C.in,r:7});
  a.note(2.1,0.18,'0\\text{ and }2',{fs:13.5,color:C.in,tex:true});
  return a.svg();
}

/* What unitarity is, drawn as what it preserves. The circle is every unit
   vector; a unitary sends it to itself, and a map that is merely invertible
   sends it to an ellipse. */
function figUnitCircle(){
  /* Exactly isotropic — 368 px over an x span of 4.6 and 184 px over a y span
     of 2.3, both 80 px to the unit. This is the one figure in the chapter that
     cannot survive anything else: it is a circle beside an ellipse, and under
     an anisotropic scale the circle is drawn as an ellipse too. */
  const a = P.Axes({w:438,h:250,xr:[-2.3,2.3],yr:[-1.15,1.15],
    pad:{l:44,r:26,t:26,b:40}, xtarget:4, ytarget:4});
  const N = 240, circ=[], ell=[];
  for(let i=0;i<=N;i++){
    const t = 2*Math.PI*i/N, c=Math.cos(t), s=Math.sin(t);
    circ.push([c,s]);
    ell.push([1.6*c + 0.6*s, 0.7*s]);
  }
  a.poly(circ,{color:C.in,width:2.6});
  a.poly(ell,{color:C.err,width:2.2,dash:'5 4'});
  a.note(-2.25,0.74,'U\\,:\\; \\text{the circle}',{fs:13,color:C.in,tex:true});
  a.note(-2.25,-1.05,'M\\,:\\; \\text{an ellipse}',{fs:13,color:C.err,tex:true});
  return a.svg();
}

/* The two coefficients of a rotation generated by a Pauli operator, over two
   full turns. At one turn the operator is minus the identity, which is the
   first sighting of the double cover the Bloch sphere makes formal. */
function figHalfAngle(){
  const a = P.Axes({w:560,h:280,xr:[0,4*Math.PI],yr:[-1.5,1.42],
    xlabel:'\\theta', ylabel:'\\text{coefficient}',
    pad:{l:62,r:26,t:28,b:46}, xtarget:5, ytarget:5});
  a.curve(t => Math.cos(t/2), {color:C.in, width:2.4});
  a.curve(t => Math.sin(t/2), {color:C.mid, width:2.2, dash:'5 4'});
  a.vline(2*Math.PI,{color:C.err,width:1.4,dash:'4 4'});
  /* The three labels live in the band above and the band below the curves,
     which never reach past one in modulus. Anywhere inside that range a label
     sits on one of the two curves at some point of its width. */
  a.note(2.6,1.14,'\\cos(\\theta/2)',{fs:13.5,color:C.in,tex:true});
  a.note(5.0,-1.30,'\\sin(\\theta/2)',{fs:13.5,color:C.mid,tex:true});
  a.note(2*Math.PI+0.35,1.14,'\\theta=2\\pi:\\; U=-I',{fs:13,color:C.err,tex:true});
  return a.svg();
}

/* Eigenvectors of a symmetric operator, drawn as the directions the map does
   not turn. Every other arrow leaves its own line. */
function figEigen(){
  const a = P.Axes({w:540,h:282,xr:[-2.6,3.4],yr:[-2.0,3.0],
    pad:{l:50,r:26,t:26,b:40}, xtarget:5, ytarget:5});
  const A = ([x,y]) => [2*x + y, x + 2*y];
  a.poly([[-1.8,-1.8],[2.6,2.6]],{color:C.grid,width:1.3,dash:'5 5'});
  a.poly([[-1.5,1.5],[1.9,-1.9]],{color:C.grid,width:1.3,dash:'5 5'});
  [[1,0],[0,1],[-0.8,0.4]].forEach(v=>{
    a.poly([[0,0],v],{color:C.in,width:2});
    const w = A(v);
    a.poly([[0,0],w],{color:C.err,width:1.8,dash:'4 3'});
    a.point(w[0],w[1],{color:C.err,r:4});
  });
  const e1=[R2,R2], e2=[R2,-R2];
  a.poly([[0,0],e1],{color:C.h,width:2.6});
  a.poly([[0,0],[3*e1[0],3*e1[1]]],{color:C.h,width:1.8,dash:'4 3'});
  a.point(3*e1[0],3*e1[1],{color:C.h,r:5});
  a.note(3*e1[0]+0.1,3*e1[1],'\\lambda=3',{fs:13.5,color:C.h,tex:true});
  a.poly([[0,0],e2],{color:C.out,width:2.6});
  a.point(e2[0],e2[1],{color:C.out,r:5});
  a.note(e2[0]+0.12,e2[1]-0.28,'\\lambda=1',{fs:13.5,color:C.out,tex:true});
  return a.svg();
}

/* A Hermitian operator, taken apart. The eigenvalue is a number and the
   projector is an operator, and the sum of the products is the operator back
   again. */
function figSpectral(){
  return growBlocks({w:700,h:150,items:[
    {t:'box',x:40,y:46,w:110,h:56,label:'A',tex:true,fs:17},
    {t:'arrow',x1:150,y1:74,x2:250,y2:74},
    {t:'box',x:250,y:46,w:170,h:56,label:'\\lambda_{1}P_{1}',tex:true,fs:16},
    {t:'text',x:440,y:80,label:'+',fs:20},
    {t:'box',x:470,y:46,w:170,h:56,label:'\\lambda_{2}P_{2}',tex:true,fs:16},
    {t:'text',x:335,y:126,label:'\\sum_{k}P_{k}=I',tex:true,fs:14},
    {t:'text',x:200,y:36,label:'diagonalise',fs:12}
  ]});
}

/* A function of an operator, drawn on the two eigenvalues it acts on. The
   eigenvalues sit on the real axis; the exponential moves each one onto the
   unit circle, by its own angle. */
function figFunction(){
  /* Isotropic: the unit circle has to be drawn round, because the whole claim
     is that the exponential sends each eigenvalue onto it. */
  const a = P.Axes({w:452,h:270,xr:[-1.6,3.5],yr:[-1.35,1.35],
    xlabel:'\\operatorname{Re}', ylabel:'\\operatorname{Im}',
    pad:{l:56,r:26,t:30,b:44}, xtarget:5, ytarget:4});
  const N=240, circ=[];
  for(let i=0;i<=N;i++){ const t=2*Math.PI*i/N; circ.push([Math.cos(t),Math.sin(t)]); }
  a.poly(circ,{color:C.grid,width:1.4});
  const t0 = 0.7;
  [[3,C.h],[1,C.out]].forEach(([lam,col])=>{
    a.point(lam,0,{color:col,r:6});
    a.point(Math.cos(lam*t0),-Math.sin(lam*t0),{color:col,r:6});
  });
  a.note(3.0,0.18,'\\lambda=3',{fs:13,color:C.h,anchor:'middle',tex:true});
  a.note(1.05,0.20,'\\lambda=1',{fs:13,color:C.out,anchor:'start',tex:true});
  a.note(Math.cos(3*t0),-Math.sin(3*t0),'e^{-3it}',{fs:13,color:C.h,anchor:'end',dx:-12,dy:26,tex:true});
  a.note(Math.cos(t0),-Math.sin(t0),'e^{-it}',{fs:13,color:C.out,dx:12,dy:28,tex:true});
  return a.svg();
}

/* The three moves the chapter leaves the reader with, in the order they are
   usually needed. */
function figMoves(){
  return P.blocks({w:740,h:150,items:[
    {t:'box',x:24,y:44,w:200,h:60,label:'insert the identity',fs:14},
    {t:'arrow',x1:224,y1:74,x2:290,y2:74},
    {t:'box',x:290,y:44,w:200,h:60,label:'decompose spectrally',fs:14},
    {t:'arrow',x1:490,y1:74,x2:556,y2:74},
    {t:'box',x:556,y:44,w:160,h:60,label:'factor with \\otimes',tex:true,fs:14},
    {t:'text',x:124,y:126,label:'a basis expansion',fs:12},
    {t:'text',x:390,y:126,label:'a function of an operator',fs:12},
    {t:'text',x:636,y:126,label:'a joint system',fs:12}
  ]});
}

/* The adjoint, drawn as the two operations it is made of. Conjugating changes
   every entry; transposing moves it. Doing only one of the two is the most
   common way an adjoint comes out wrong. */
function figAdjoint(){
  const cell = (x,y,t) => ({t:'box',x:x,y:y,w:96,h:44,label:t,tex:true,fs:14});
  return growBlocks({w:640,h:168,items:[
    cell(40,36,'A_{11}'), cell(140,36,'A_{12}'),
    cell(40,86,'A_{21}'), cell(140,86,'A_{22}'),
    {t:'arrow',x1:250,y1:86,x2:360,y2:86},
    {t:'text',x:305,y:66,label:'\\dagger',tex:true,fs:15},
    cell(360,36,'A_{11}^{*}'), cell(460,36,'A_{21}^{*}'),
    cell(360,86,'A_{12}^{*}'), cell(460,86,'A_{22}^{*}'),
    {t:'text',x:40,y:156,anchor:'start',label:'conjugate every entry, then move it across the diagonal',fs:12}
  ]});
}

/* A finite-dimensional column and a square-integrable function are shown as
   the same vector-space construction with different index sets. */
function figFunctionVector(){
  const a = P.Axes({w:560,h:270,xr:[-Math.PI,Math.PI],yr:[-0.8,0.8],
    xlabel:'x', ylabel:'u(x)', pad:{l:52,r:22,t:24,b:42}, xtarget:5, ytarget:5});
  const s = 1/Math.sqrt(Math.PI);
  a.curve(x=>s*Math.sin(x),{color:C.in,width:2.4});
  a.curve(x=>s*Math.cos(x),{color:C.out,width:2.0,dash:'5 4'});
  return a.svg();
}

/* Parseval drawn as energy accounted for by retained coefficients. The
   omitted tail is the squared truncation error, not a visual metaphor. */
function figParseval(){
  const vals=[];
  for(let n=1;n<=9;n++) vals.push([n,1/(n*n)]);
  const a=P.Axes({w:560,h:270,xr:[0.3,9.7],yr:[0,1.12],
    xlabel:'n',ylabel:'|c_n|^2',pad:{l:58,r:22,t:24,b:42},xtarget:5,ytarget:5});
  a.stem(vals,{color:C.in,r:4});
  a.vline(4.5,{color:C.err,width:1.4,dash:'4 4'});
  a.note(5.0,0.78,'omitted tail',{fs:12.5,color:C.err});
  return a.svg();
}

/* The outer product |0><1| worked out as shapes: a column times a row is a
   square array, and the one non-zero entry sits where the 1 of the column
   meets the 1 of the row. */
function figOuter(){
  const c = (x,y,t,col) => ({t:'box',x:x,y:y,w:52,h:44,label:t,fs:16,color:col});
  return growBlocks({w:470,h:196,items:[
    {t:'text',x:66,y:34,label:'|0\\rangle',tex:true,fs:15,color:C.in},
    c(40,50,'1',C.in), c(40,94,'0',C.in),
    {t:'text',x:156,y:56,label:'\\langle 1|',tex:true,fs:15,color:C.in},
    c(130,72,'0',C.in), c(182,72,'1',C.in),
    {t:'text',x:268,y:100,label:'=',tex:true,fs:22,color:C.ink},
    {t:'text',x:356,y:34,label:'|0\\rangle\\langle 1|',tex:true,fs:15,color:C.out},
    c(304,50,'0'), c(356,50,'1',C.out),
    c(304,94,'0'), c(356,94,'0'),
    {t:'text',x:235,y:180,label:'a column times a row: an operator',fs:13}
  ]});
}

/* The tensor product of two columns, with each entry of the result named by
   the basis string it is the amplitude of. The strings are read q1 q0, the
   order this course fixes, so the index of each row is the string in binary. */
function figTensor(){
  const b = (x,y,t,col,w) => ({t:'box',x:x,y:y,w:w||60,h:40,label:t,tex:true,fs:15,color:col});
  const rows = [['a_{1}b_{1}','|00\\rangle','0'],['a_{1}b_{2}','|01\\rangle','1'],
                ['a_{2}b_{1}','|10\\rangle','2'],['a_{2}b_{2}','|11\\rangle','3']];
  const items = [
    {t:'text',x:70,y:62,label:'q_{1}',tex:true,fs:14,color:C.in},
    b(40,76,'a_{1}',C.in), b(40,116,'a_{2}',C.in),
    {t:'text',x:128,y:144,label:'\\otimes',tex:true,fs:18,color:C.ink},
    {t:'text',x:186,y:62,label:'q_{0}',tex:true,fs:14,color:C.in},
    b(156,76,'b_{1}',C.in), b(156,116,'b_{2}',C.in),
    {t:'text',x:250,y:140,label:'=',tex:true,fs:22,color:C.ink},
    {t:'text',x:326,y:14,label:'entry',fs:12,anchor:'end'}
  ];
  rows.forEach(([t,s,k],i)=>{
    const y = 26 + i*46;
    items.push({t:'text',x:326,y:y+26,label:k,fs:14,anchor:'end'});
    items.push(b(340,y,t,C.out,92));
    items.push({t:'text',x:448,y:y+24,label:s,tex:true,fs:14,anchor:'start',color:C.out});
  });
  return growBlocks({w:520,h:216,items:items});
}

/* Why the exponential of a Hermitian operator is unitary, drawn as what it
   does to the eigenvalues: a real number goes in, a number of modulus one
   comes out. */
function figGenerator(){
  return growBlocks({w:640,h:170,items:[
    {t:'box',x:30,y:44,w:190,h:56,label:'G=G^{\\dagger}',tex:true,fs:17},
    {t:'arrow',x1:220,y1:72,x2:410,y2:72,color:C.h},
    {t:'text',x:315,y:52,label:'e^{-i\\theta G}',tex:true,fs:16,color:C.h},
    {t:'box',x:410,y:44,w:200,h:56,label:'U^{\\dagger}U=I',tex:true,fs:17},
    {t:'text',x:125,y:132,label:'real eigenvalues',fs:13},
    {t:'text',x:125,y:156,label:'\\lambda\\in\\mathbb{R}',tex:true,fs:14},
    {t:'text',x:510,y:132,label:'eigenvalues on the unit circle',fs:13},
    {t:'text',x:510,y:156,label:'|e^{-i\\theta\\lambda}|=1',tex:true,fs:14}
  ]});
}

/* ---- Around Us: where this section's idea shows up outside the notation.
   Adapted from the engine's source course (signals-and-systems), with no
   `src` field: this course does not cite a page for these. */
function realGallery(cfg){
  return { id:cfg.id, module:'M1', nav:cfg.nav, title:cfg.title,
    objective:cfg.objective, keywords:cfg.keywords,
    budget:cfg.budget||'A gallery: two or three schematic figures beside one photograph.',
    slide:true, steps:cfg.notes.length-1, blocks:[
    {t:'eyebrow', text:cfg.eyebrow},
    {t:'title', text:cfg.title},
    {t:'cols', ratio:'c-8-4', fill:true, left:[
      {t:'grid', cols:2, gap:'18px 22px', items:cfg.figs.map(([svg,cap])=>
        [{t:'fig', frame:true, svg, caption:cap}])}
    ], right:[
      {t:'fig', svg:()=>`<img class="photo" src="${IMG[cfg.photo[0]]}" alt="${cfg.photo[1]}">`, caption:cfg.photo[2]}
    ].concat(cfg.notes.map((n,i)=>i ? {t:'reveal', at:i, items:[n]} : n))}
  ]};
}

/* Malus's law: intensity through two linear polarisers as a function of the
   angle between their transmission axes. A polariser projects the incoming
   field onto its own axis, so the transmitted amplitude is the projection of
   the field and the transmitted intensity is the squared overlap -- the same
   $|\langle u|v\rangle|^2$ this section defines, with the projector built
   from the axis rather than from a qubit basis vector. */
function figMalus(){
  const a = P.Axes({w:520,h:250,xr:[0,180],yr:[0,1.12],
    xlabel:'\\theta\\;(\\text{deg})', ylabel:'I/I_{0}',
    pad:{l:56,r:22,t:24,b:44}, xtarget:5, ytarget:4});
  a.curve(t => Math.cos(t*Math.PI/180)**2, {color:C.in, width:2.4, n:400});
  a.point(0,1,{color:C.out,r:5});
  a.point(45,0.5,{color:C.mid,r:5});
  a.point(90,0,{color:C.err,r:5});
  return a.svg();
}

/* The same law read as a projector's expectation value: keeping the axis
   fixed and drawing the transmitted fraction as a bar at three angles most
   students actually try with two polarising sheets. */
function figMalusBars(){
  const a = P.Axes({w:460,h:250,xr:[-0.6,2.6],yr:[0,1.12],
    ylabel:'I/I_{0}', pad:{l:56,r:20,t:24,b:46}, xticksOverride:[], ytarget:4});
  const vals=[[0,1,C.out],[1,0.5,C.mid],[2,0,C.err]];
  vals.forEach(([x,v,col])=> a.rect(x-0.32,0,x+0.32,v,{fill:col}));
  a.note(0,-0.10,'0^{\\circ}',{fs:13,color:C.muted,anchor:'middle',tex:true});
  a.note(1,-0.10,'45^{\\circ}',{fs:13,color:C.muted,anchor:'middle',tex:true});
  a.note(2,-0.10,'90^{\\circ}',{fs:13,color:C.muted,anchor:'middle',tex:true});
  return a.svg();
}

/* A prism's refractive index against wavelength, the Cauchy relation for a
   typical crown glass: n(lambda) = A + B/lambda^2. Every wavelength bends by
   a different amount because it sees a different eigenvalue of the same
   dispersion law -- one function, read off at many points of its spectrum,
   which is exactly what "a function of an operator" means once the operator
   is diagonal. */
function figDispersion(){
  const A = 1.5046, B = 0.00420; // BK7-like Cauchy coefficients, lambda in micrometres
  const n = lam => A + B/(lam*lam);
  const a = P.Axes({w:520,h:250,xr:[0.40,0.70],yr:[1.513,1.528],
    xlabel:'\\lambda\\;(\\mu\\text{m})', ylabel:'n(\\lambda)',
    pad:{l:64,r:22,t:24,b:44}, xtarget:4, ytarget:4});
  a.curve(n, {color:C.in, width:2.4, n:400});
  const marks = [[0.44,C.h],[0.55,C.mid],[0.66,C.err]];
  marks.forEach(([lam,col]) => a.point(lam, n(lam), {color:col, r:5}));
  return a.svg();
}

/* The rainbow of eigenvalues the prism sorts by: the bend angle from Snell's
   law at a fixed prism geometry, one point per sample wavelength, coloured to
   match the visible light it stands for. */
function figSpectrumBars(){
  const A = 1.5046, B = 0.00420;
  const n = lam => A + B/(lam*lam);
  const apex = 60*Math.PI/180;
  // minimum-deviation angle for a symmetric pass through a prism of apex angle A:
  // delta_min = 2*asin(n*sin(A/2)) - A
  const dev = lam => (2*Math.asin(n(lam)*Math.sin(apex/2)) - apex) * 180/Math.PI;
  const a = P.Axes({w:460,h:250,xr:[0.40,0.70],yr:[38.5,40.5],
    xlabel:'\\lambda\\;(\\mu\\text{m})', ylabel:'\\delta_{\\min}\\;(\\text{deg})',
    pad:{l:60,r:20,t:24,b:44}, xtarget:4, ytarget:4});
  a.curve(dev, {color:C.mid, width:2.2, n:300});
  [[0.44,C.h],[0.55,C.mid],[0.66,C.err]].forEach(([lam,col]) => a.point(lam, dev(lam), {color:col, r:5}));
  return a.svg();
}

/* A guitar string's first three normal modes: sin(n*pi*x/L) on a fixed
   length, the same orthonormal family the notes use for a function space. A
   plucked string is a superposition of these, and the ear hears the
   coefficients as the note's harmonics. */
function figStringModes(){
  const a = P.Axes({w:520,h:250,xr:[0,1],yr:[-1.25,1.25],
    xlabel:'x/L', ylabel:'u_{n}(x)', pad:{l:52,r:22,t:24,b:42}, xtarget:4, ytarget:4});
  a.curve(x=>Math.sin(Math.PI*x), {color:C.in, width:2.4, n:300});
  a.curve(x=>Math.sin(2*Math.PI*x), {color:C.mid, width:2, dash:'5 4', n:300});
  a.curve(x=>Math.sin(3*Math.PI*x), {color:C.out, width:1.8, dash:'2 3', n:300});
  return a.svg();
}

/* A plucked shape (a triangle, the classic guitar pluck) rebuilt from a
   truncated sine series, showing the partial sums approach the plucked shape
   as more modes are kept -- completeness and truncation, read off a string
   instead of an abstract coefficient list. */
function figPluckSum(){
  const pluck = x => x<=0.3 ? x/0.3 : (1-x)/0.7;
  const coef = n => 2*Math.sin(n*Math.PI*0.3)/(Math.pow(n,2)*Math.PI*Math.PI*0.3*0.7);
  const partial = (x,N) => { let s=0; for(let n=1;n<=N;n++) s+=coef(n)*Math.sin(n*Math.PI*x); return s; };
  const a = P.Axes({w:460,h:250,xr:[0,1],yr:[-0.05,1.05],
    xlabel:'x/L', ylabel:'\\text{shape}', pad:{l:44,r:20,t:24,b:42}, xtarget:4, ytarget:4});
  a.curve(pluck, {color:C.muted, dash:'5 4', width:1.8, n:300});
  a.curve(x=>partial(x,3), {color:C.mid, width:1.8, n:300});
  a.curve(x=>partial(x,12), {color:C.in, width:2.2, n:300});
  return a.svg();
}

const SC = [

/* ---------------------------------------------------------------- 1.0.1 -- */
{ id:'m1-open', module:'M1', nav:'The Mathematics of Quantum States', title:'The Mathematics of Quantum States',
  objective:'Say what the chapter is for: the notation every later chapter is written in.',
  keywords:'linear algebra language complex vector space basis matrix inner product overview module 1',
  src:'L2 · why linear algebra is the language', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · The mathematics of quantum states'},
  {t:'title', text:'The Mathematics of Quantum States'},
  {t:'lede', text:'Nothing in this chapter is quantum mechanics. It is the language that the quantum mechanics of the next five chapters is written in, and it is worth learning on its own terms first, because a reader who is decoding the notation cannot also be following the physics.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Fix a basis — a list of the outcomes the system can be found in. Three things become concrete at once. A <b>state</b> becomes a column of complex numbers, one for each outcome. An <b>operation</b> becomes a matrix acting on that column. A <b>question</b> becomes a single number, formed from two columns by an inner product.</p>'},
    {t:'body', html:'<p>For $n$ qubits the column has $2^{n}$ entries, so the objects are large. They are not, however, complicated: everything done to them in this course is built from four constructions, and all four are in this chapter.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The four constructions', html:'<b>The inner product</b> $\\langle\\phi|\\psi\\rangle$, which turns two states into a number and is where every probability comes from. <b>The outer product</b> $|\\phi\\rangle\\langle\\psi|$, which turns two states into an operator. <b>The tensor product</b> $\\otimes$, which turns two systems into one. <b>The spectral decomposition</b>, which turns an operator into its eigenvalues and the projectors that belong to them.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The one habit to change', html:'Over the real numbers the inner product is symmetric and you may take the two arguments in either order. Over the complex numbers it is not. $\\langle u|v\\rangle$ conjugates $u$ and leaves $v$ alone, so $\\langle v|u\\rangle=\\langle u|v\\rangle^{*}$. Nearly every wrong answer in this chapter is a missing conjugate.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figLanguage(),
      caption:'The translation this chapter installs. The left column is what a physicist says and the right column is what a program computes. They are the same objects, and the arrow between them is a choice of basis.'},
    {t:'small', html:'A basis is a choice, not a fact about the system. The state does not change when the basis does; only its column of numbers does. That distinction is the subject of the last scene of this chapter.'}
  ]}
]},

/* ---------------------------------------------------------------- 1.1.1 -- */
{ id:'m1-ket', module:'M1', nav:'Kets as Column Vectors', title:'Kets as Column Vectors',
  objective:'Write a qubit state as a normalised complex column and read superposition as linearity.',
  keywords:'ket state vector complex vector space superposition linearity normalisation amplitude column',
  src:'L2 · vectors and dual vectors', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'Kets as Column Vectors'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figKet(),
      caption:'A superposition drawn in a real slice of the state space. The picture shows two of the four real numbers a qubit carries, so it cannot show a phase.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Not one or the other', html:'A superposition is one state with two amplitudes. It is not a qubit that is secretly $|0\\rangle$ or $|1\\rangle$; the interferometer of Chapter 0 tells the two ideas apart.'}]},
  ], right:[
    {t:'eq', key:true, label:'Ket', tex:'|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle = \\begin{bmatrix}\\alpha\\\\ \\beta\\end{bmatrix}, \\qquad \\alpha,\\beta\\in\\mathbb{C}',
      note:'Adding two states, or scaling one by a complex number, gives a state. That closure is what <b>superposition</b> means.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Normalisation', tex:'|\\alpha|^{2} + |\\beta|^{2} = 1',
        note:'Divide a column by its length to get the state. $(2+i,\\,1-3i)$ has squared length $5+10=15$, so its probabilities are $\\tfrac13$ and $\\tfrac23$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac{3}{5}|0\\rangle+\\tfrac{4i}{5}|1\\rangle$.<div class="nsep"></div>What is $|\\beta|^{2}$?',
        ask:{key:'m1-ket', choices:['$\\tfrac{16}{25}$','$-\\tfrac{16}{25}$','$\\tfrac{4}{5}$'], answer:0,
          why:'$|4i/5|^{2}=16/25$. A squared modulus is never negative.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.1.2 -- */
{ id:'m1-bra', module:'M1', nav:'Bras and the Inner Product', title:'Bras and the Inner Product',
  objective:'Form the adjoint of a ket and compute an inner product with the conjugate in the right place.',
  keywords:'bra dual vector adjoint conjugate transpose inner product vdot overlap dagger',
  src:'L3 · Dirac notation', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'Bras and the Inner Product'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShapes(),
      caption:'A row on the left of a column contracts to one number. A column on the left of a row spreads into a matrix. Counting shapes is the quickest check on a line of algebra.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The missing conjugate', html:'Without it the sum is $\\tfrac12[1+1]=1$, which says the two states are the same state. Use <code>np.vdot(a, b)</code>, never <code>np.dot(a, b)</code>.'}]},
  ], right:[
    {t:'eq', tex:'\\langle a| = |a\\rangle^{\\dagger} = \\begin{bmatrix}a_{1}^{*} & a_{2}^{*} & \\cdots & a_{n}^{*}\\end{bmatrix}'},
    {t:'eq', key:true, label:'Inner product', tex:'\\langle a|b\\rangle = \\sum_{k} a_{k}^{*}\\,b_{k}',
      note:'The conjugate sits on the first argument only, so $\\langle b|a\\rangle=\\langle a|b\\rangle^{*}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned}\\langle a|b\\rangle &= \\tfrac12\\left[(1)(1)+(-i)(-i)\\right]\\\\ &= \\tfrac12\\left[1-1\\right] = 0\\end{aligned}',
        note:'For $|a\\rangle=\\tfrac{1}{\\sqrt2}(1,i)$ and $|b\\rangle=\\tfrac{1}{\\sqrt2}(1,-i)$. The two states are orthogonal.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\langle a|b\\rangle=2i$.<div class="nsep"></div>What is $\\langle b|a\\rangle$?',
        ask:{key:'m1-bra', choices:['$2i$','$-2i$','$2$'], answer:1,
          why:'Swapping the two arguments conjugates the answer.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.1.3 -- */
{ id:'m1-overlap', module:'M1', nav:'Norm, Orthogonality and Overlap', title:'Norm, Orthogonality and Overlap',
  objective:'Read the modulus of an inner product as a measure of similarity, bounded by Cauchy-Schwarz.',
  keywords:'norm length orthogonality cauchy schwarz overlap distinguishable states unit vector angle',
  src:'L2 · Cauchy-Schwarz and quantum overlaps', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'Norm, Orthogonality and Overlap'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOverlap(),
      caption:'The squared overlap of $|0\\rangle$ with $|\\psi(\\theta)\\rangle=\\cos(\\theta/2)|0\\rangle+\\sin(\\theta/2)|1\\rangle$ is $\\cos^{2}(\\theta/2)$: $1$ at $\\theta=0$, one half at $\\theta=\\pi/2$, $0$ at $\\theta=\\pi$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'An overlap is an angle', html:'An overlap of one half is the cosine of an angle. Turning it into a chance of a correct guess needs the measurement rules of Chapter 2.'}]},
  ], right:[
    {t:'eq', tex:'\\|a\\| = \\sqrt{\\langle a|a\\rangle}, \\qquad \\langle a|b\\rangle = 0 \\;\\Longleftrightarrow\\; \\text{orthogonal}'},
    {t:'eq', key:true, label:'Cauchy-Schwarz', tex:'|\\langle a|b\\rangle| \\le \\|a\\|\\,\\|b\\|',
      note:'For two normalised states this gives $0\\le|\\langle a|b\\rangle|^{2}\\le 1$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The two ends', html:'Zero: the states are orthogonal, and one measurement tells them apart with certainty. One: they are the same state up to a global phase, and no measurement can tell them apart.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\cos(\\pi/3)|0\\rangle+\\sin(\\pi/3)|1\\rangle$.<div class="nsep"></div>What is $|\\langle 0|\\psi\\rangle|^{2}$?',
        ask:{key:'m1-overlap', choices:['$\\tfrac14$','$\\tfrac12$','$\\tfrac34$'], answer:0,
          why:'$\\langle 0|\\psi\\rangle=\\cos(\\pi/3)=\\tfrac12$, and its square is $\\tfrac14$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.1.4 -- */
{ id:'m1-basis', module:'M1', nav:'Orthonormal Bases', title:'Orthonormal Bases',
  objective:'Derive the expansion coefficient as an inner product and see that coefficients are basis dependent.',
  keywords:'orthonormal basis kronecker delta expansion coefficients change of basis completeness dimension',
  src:'L2 · dimension and bases', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'Orthonormal Bases'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figBasis(),
      caption:'The state $|0\\rangle$ read in two bases. In the computational basis its coefficients are $1$ and $0$. In the $X$ basis both are $1/\\sqrt2$, so $|0\\rangle=\\tfrac{1}{\\sqrt2}|+\\rangle+\\tfrac{1}{\\sqrt2}|-\\rangle$. The state did not change.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The state is not its coordinates', html:'A definite state in one basis is an even superposition in another. "Superposition" always means superposition in a named basis.'}]},
  ], right:[
    {t:'eq', label:'Orthonormal basis', tex:'\\langle e_{i}|e_{j}\\rangle = \\delta_{ij}',
      note:'Every vector then has exactly one expansion $|v\\rangle=\\sum_{i} v_{i}|e_{i}\\rangle$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\langle e_{j}|v\\rangle = \\sum_{i} v_{i}\\,\\langle e_{j}|e_{i}\\rangle'},
      {t:'eq', key:true, label:'Coefficient', tex:'v_{j} = \\langle e_{j}|v\\rangle',
        note:'Apply the bra $\\langle e_{j}|$ to both sides. Orthonormality keeps only the term $i=j$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The state $|1\\rangle$ and the basis $|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$.<div class="nsep"></div>What is the coefficient $\\langle -|1\\rangle$?',
        ask:{key:'m1-basis', choices:['$\\tfrac{1}{\\sqrt2}$','$-\\tfrac{1}{\\sqrt2}$','$0$'], answer:1,
          why:'The minus sign of $|-\\rangle$ sits on $|1\\rangle$, so $\\langle -|1\\rangle=-\\tfrac{1}{\\sqrt2}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-inner', module:'M1', nav:'The Inner Product in Code', title:'The Inner Product in Code',
  objective:'Normalise a state, take an inner product with the conjugate in place, and read coefficients in a basis.',
  keywords:'code qiskit numpy program statevector inner product normalise conjugate basis coefficient run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'The Inner Product in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-inner')}
]},

/* ---------------------------------------------------------------- 1.2.1 -- */
{ id:'m1-amp', module:'M1', nav:'Complex Amplitudes', title:'Complex Amplitudes',
  objective:'Split a complex amplitude into modulus and phase and compute both without losing the quadrant.',
  keywords:'complex number modulus phase argument euler formula conjugate polar form atan2 amplitude',
  src:'L3 · complex numbers', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Amplitude, phase and interference'},
  {t:'title', text:'Complex Amplitudes'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figComplex(),
      caption:'A complex number, its modulus $r$, its phase $\\varphi$ and its conjugate. Conjugation is a reflection in the real axis. It is not a rotation by $\\pi$, which would give $-z$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Where the phase gets lost', html:'$\\arctan(y/x)=\\arctan(-1)=-\\pi/4$ points at $1-i$, not at $-1+i$. Use $\\operatorname{atan2}(y,x)$, which is <code>np.angle</code> in NumPy.'}]},
  ], right:[
    {t:'eq', key:true, label:'Polar form', tex:'z = x + iy = r\\,e^{i\\varphi}, \\qquad r=|z|=\\sqrt{x^{2}+y^{2}}',
      note:'$zz^{*}=|z|^{2}$. The modulus becomes a probability; the phase acts only against another phase.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} z &= -1+i \\\\ r &= \\sqrt{1+1} = \\sqrt2 \\\\ \\varphi &= \\operatorname{atan2}(1,-1) = \\tfrac{3\\pi}{4} \\end{aligned}',
        note:'The point is up and to the left, so the phase is in the second quadrant: $z=\\sqrt2\\,e^{i3\\pi/4}$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$z=3e^{i\\pi/5}$.<div class="nsep"></div>What is $|z|^{2}$?',
        ask:{key:'m1-amp', choices:['$3$','$9$','$9e^{2i\\pi/5}$'], answer:1,
          why:'$zz^{*}=3e^{i\\pi/5}\\cdot 3e^{-i\\pi/5}=9$. The phase cancels.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.2.2 -- */
{ id:'m1-phase', module:'M1', nav:'Global and Relative Phase', title:'Global and Relative Phase',
  objective:'Show that a phase on the whole state changes no probability, and that a phase between two terms changes them all.',
  keywords:'global phase relative phase interference hadamard plus minus indistinguishable equivalence class',
  src:'L3 · global phase, relative phase and interference', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Amplitude, phase and interference'},
  {t:'title', text:'Global and Relative Phase'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figPhaseBars(),
      caption:'After one Hadamard, $|+\\rangle$ and $|-\\rangle$ give opposite certain answers. Before the gate both gave one half on each outcome. Only the relative phase differs between them.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Global for one qubit is not global', html:'In $|0\\rangle e^{i\\varphi}|\\psi\\rangle+|1\\rangle|\\psi\\rangle$ the $e^{i\\varphi}$ sits on one branch, so it is a relative phase. Chapter 6 builds phase kickback out of this.'}]},
  ], right:[
    {t:'eq', label:'Global phase', tex:'\\begin{aligned}\\left|\\langle\\phi|\\,e^{i\\gamma}\\psi\\rangle\\right|^{2} &= \\left|e^{i\\gamma}\\right|^{2}\\left|\\langle\\phi|\\psi\\rangle\\right|^{2} \\\\ &= \\left|\\langle\\phi|\\psi\\rangle\\right|^{2}\\end{aligned}',
      note:'No probability changes, so $e^{i\\gamma}|\\psi\\rangle$ and $|\\psi\\rangle$ are one physical state.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'Relative phase', tex:'\\begin{aligned} H|+\\rangle &= \\tfrac12\\left(|0\\rangle+|1\\rangle\\right)+\\tfrac12\\left(|0\\rangle-|1\\rangle\\right) = |0\\rangle \\\\ H|-\\rangle &= \\tfrac12\\left(|0\\rangle+|1\\rangle\\right)-\\tfrac12\\left(|0\\rangle-|1\\rangle\\right) = |1\\rangle \\end{aligned}',
        note:'$|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$ differ only by a relative phase of $\\pi$, and a Hadamard turns that phase into different outcomes.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right)$ goes through a Hadamard.<div class="nsep"></div>What is $P(0)$?',
        ask:{key:'m1-phase', choices:['$0$','$\\tfrac12$','$1$'], answer:1,
          why:'$H|\\psi\\rangle=\\tfrac{1+i}{2}|0\\rangle+\\tfrac{1-i}{2}|1\\rangle$, and $|(1+i)/2|^{2}=\\tfrac12$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.L1 --- */
{ id:'m1-lab-a', module:'M1', nav:'Laboratory A \u2014 The Relative-Phase Interferometer', title:'Laboratory A \u2014 The Relative-Phase Interferometer',
  objective:'Let the reader move a global phase and a relative phase and watch only one of them do anything.',
  keywords:'laboratory interferometer relative phase global phase hadamard probabilities amplitudes interactive',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Amplitude, phase and interference'},
  {t:'title', text:'Laboratory A \u2014 The Relative-Phase Interferometer'},
  {t:'body', html:'<p>The state is $|\\psi\\rangle = e^{i\\gamma}\\left[\\cos(\\theta/2)|0\\rangle + e^{i\\varphi}\\sin(\\theta/2)|1\\rangle\\right]$. Three controls set the mixing angle $\\theta$, the relative phase $\\varphi$ and the global phase $\\gamma$. The left plot draws the two amplitudes in the complex plane; the right one gives the outcome probabilities in the computational basis and in the $X$ basis, which is the basis a Hadamard measures in.</p>'},
  {t:'small', html:'One of the three controls changes nothing at all, and finding out which is the exercise. Move each one in turn and watch the two probability panels rather than the arrows.'},
  {t:'lab', id:'A'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-phase', module:'M1', nav:'Amplitude and Phase in Code', title:'Amplitude and Phase in Code',
  objective:'Split an amplitude into modulus and phase, show that a global phase changes nothing, and read a relative phase with a Hadamard.',
  keywords:'code qiskit numpy program phase global relative hadamard angle atan2 run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · Amplitude, phase and interference'},
  {t:'title', text:'Amplitude and Phase in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-phase')}
]},

/* ---------------------------------------------------------------- 1.3.1 -- */
{ id:'m1-outer', module:'M1', nav:'The Outer Product', title:'The Outer Product',
  objective:'Build an operator from two states and tell the outer product apart from the inner and tensor products.',
  keywords:'outer product operator matrix unit dyad column times row rank one shapes',
  src:'L2 · outer products are not tensor products', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'The Outer Product'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOuter(),
      caption:'The column $|0\\rangle$ times the row $\\langle 1|$. The one non-zero entry sits where the $1$ of the column meets the $1$ of the row.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Three products, three shapes', html:'$\\langle a|b\\rangle$ is a number. $|a\\rangle\\langle b|$ is an $n\\times n$ operator. $|a\\rangle\\otimes|b\\rangle$ is a column of length $n^{2}$. When a line of algebra does not fit together, count the shapes first.'}]},
  ], right:[
    {t:'eq', key:true, label:'Outer product', tex:'|a\\rangle\\langle b| = |a\\rangle\\,|b\\rangle^{\\dagger}, \\qquad \\left(|a\\rangle\\langle b|\\right)_{jk} = a_{j}\\,b_{k}^{*}',
      note:'Fed a ket, the bra acts first: $\\left(|a\\rangle\\langle b|\\right)|v\\rangle=\\langle b|v\\rangle\\,|a\\rangle$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'|0\\rangle\\langle 1| = \\begin{bmatrix}1\\\\0\\end{bmatrix}\\begin{bmatrix}0&1\\end{bmatrix} = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}',
        note:'It turns $|1\\rangle$ into $|0\\rangle$ and sends $|0\\rangle$ to zero, so its square is the zero matrix.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The operator $|1\\rangle\\langle 0|$ acts on $|0\\rangle$.<div class="nsep"></div>What comes out?',
        ask:{key:'m1-outer', choices:['$|0\\rangle$','$|1\\rangle$','The zero vector'], answer:1,
          why:'The bra $\\langle 0|$ meets $|0\\rangle$ and gives $1$, which multiplies $|1\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.3.2 -- */
{ id:'m1-proj', module:'M1', nav:'Projectors', title:'Projectors',
  objective:'Define a rank-one projector, verify idempotence, and split a state into a kept and a discarded part.',
  keywords:'projector idempotent hermitian rank one complement subspace component parallel orthogonal',
  src:'L2 · projectors and the resolution of identity', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'Projectors'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figProject(),
      caption:'The state $|v\\rangle=|0\\rangle$ split along $|u\\rangle=|+\\rangle$. The kept part $P|v\\rangle=\\tfrac{1}{\\sqrt2}|+\\rangle$ and the discarded part $(I-P)|v\\rangle=\\tfrac{1}{\\sqrt2}|-\\rangle$ meet at a right angle and add back to $|v\\rangle$.'},
  ], right:[
    {t:'eq', key:true, label:'Projector', tex:'P_{u} = |u\\rangle\\langle u|, \\qquad \\langle u|u\\rangle = 1',
      note:'It is its own adjoint: reversing it swaps two copies of the same state.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Applied twice', tex:'P_{u}^{2} = |u\\rangle\\underbrace{\\langle u|u\\rangle}_{=\\,1}\\langle u| = P_{u}',
        note:'So an eigenvalue satisfies $\\lambda^{2}=\\lambda$: only $0$ (discarded) and $1$ (kept).'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A projector shortens a state', html:'In the figure $P|0\\rangle$ has length $1/\\sqrt2$, not $1$. The lost length is the probability of the other outcome. Renormalising is a separate step, taken in Chapter 2.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$P=|1\\rangle\\langle 1|$ and $|v\\rangle=\\tfrac{\\sqrt3}{2}|0\\rangle+\\tfrac12|1\\rangle$.<div class="nsep"></div>What is the length of $P|v\\rangle$?',
        ask:{key:'m1-proj', choices:['$\\tfrac12$','$\\tfrac{\\sqrt3}{2}$','$1$'], answer:0,
          why:'$P|v\\rangle=\\tfrac12|1\\rangle$: the projector keeps only the $|1\\rangle$ part.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.3.3 -- */
{ id:'m1-resid', module:'M1', nav:'Resolution of the Identity', title:'Resolution of the Identity',
  objective:'State the completeness relation and use inserting it as a named derivation step.',
  keywords:'resolution of identity completeness relation basis expansion insert identity sum of projectors',
  src:'L2 · projectors and the resolution of identity', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'Resolution of the Identity'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figResolve(),
      caption:'One vector, resolved by the identity. Each dashed guide is one inner product $\\langle e_{k}|v\\rangle$, and each solid piece is that number times its basis vector. The pieces add back to the vector exactly.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Name the move', html:'"Insert the resolution of the identity" means this step. The only choice is the basis: pick one in which some object in the expression is simple.'}]},
  ], right:[
    {t:'eq', key:true, label:'Resolution of the identity', tex:'\\sum_{k} |e_{k}\\rangle\\langle e_{k}| = I',
      note:'One projector for each vector of an orthonormal basis. Nothing is thrown away, so nothing changes.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Insert it', tex:'\\begin{aligned}|v\\rangle &= I|v\\rangle \\\\ &= \\sum_{k}|e_{k}\\rangle\\langle e_{k}|v\\rangle \\\\ &= \\sum_{k}\\langle e_{k}|v\\rangle\\,|e_{k}\\rangle\\end{aligned}',
        note:'The basis expansion of the last scene is now derived, not assumed.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Insert the $X$ basis into $\\langle 0|1\\rangle$: $\\langle 0|+\\rangle\\langle +|1\\rangle+\\langle 0|-\\rangle\\langle -|1\\rangle$.<div class="nsep"></div>What is the sum?',
        ask:{key:'m1-resid', choices:['$0$','$\\tfrac12$','$1$'], answer:0,
          why:'The two terms are $\\tfrac12$ and $-\\tfrac12$. Any basis gives the same number, and $\\langle 0|1\\rangle=0$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.3.R -- */
realGallery({ id:'m1-real-projector', nav:'Projectors Around Us', title:'Projectors Around Us',
  eyebrow:'Module 1 · Outer products and projectors',
  objective:'Read Malus\'s law for two polarising sheets as the squared overlap a projector computes.',
  keywords:'projector polariser malus law crossed polarisers cosine squared overlap real world example',
  photo:['m1_polarizer','Two sheets of polarising film held up against a window, one rotated against the other',
    'Rotating the second sheet against the first dims the light: at ninety degrees almost none gets through.'],
  figs:[
    [()=>figMalus(),'A polariser projects incoming light onto its own axis. The transmitted intensity is $I_{0}\\cos^{2}\\theta$, the squared overlap between the two axes.'],
    [()=>figMalusBars(),'Three settings a student can try by hand: aligned sheets pass everything, sheets at $45^{\\circ}$ pass half, and crossed sheets pass (almost) none.']
  ],
  notes:[
    {t:'note', kind:'def', head:'A polariser is a projector', html:'A sheet keeps the part of the light along its own axis $|u\\rangle$: exactly what $P=|u\\rangle\\langle u|$ does. Intensity survives as $I=I_{0}|\\langle u|v\\rangle|^{2}=I_{0}\\cos^{2}\\theta$.'},
    {t:'note', kind:'warn', head:'Not a dimmer switch', html:'$\\cos^{2}\\theta$ is not light fading out. It is a projection: what gets through has been rotated onto the second axis.'}
  ]}),

/* ---------------------------------------------------------------- 1.L-B1 -- */
{ id:'m1-lab-b1', module:'M1', nav:'Laboratory B1 — A Projector, Split and Put Back Together', title:'Laboratory B1 — A Projector, Split and Put Back Together',
  objective:'Let the reader split a real qubit state along a chosen direction and watch the kept length change.',
  keywords:'laboratory projector split idempotent resolution of identity length lost interactive',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'Laboratory B1 — A Projector, Split and Put Back Together'},
  {t:'body', html:'<p>The state $|v\\rangle=\\cos(\\beta/2)|0\\rangle+\\sin(\\beta/2)|1\\rangle$ and the direction $|u\\rangle=\\cos(\\alpha/2)|0\\rangle+\\sin(\\alpha/2)|1\\rangle$ are both real states of one qubit. The projector $P=|u\\rangle\\langle u|$ keeps the part of $|v\\rangle$ along $|u\\rangle$; $I-P$ keeps the rest. The left figure draws both pieces; the right one bars their lengths against the length of $|v\\rangle$ itself.</p>'},
  {t:'small', html:'Set $\\alpha=\\beta$ and the kept piece is everything. Pull them apart and watch how much length $P|v\\rangle$ loses — that missing length is a probability, not a rounding error.'},
  {t:'lab', id:'B1'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-proj', module:'M1', nav:'Outer Products and Projectors in Code', title:'Outer Products and Projectors in Code',
  objective:'Build an outer product, split a state with a projector, and insert the resolution of the identity.',
  keywords:'code qiskit numpy program outer product projector resolution identity run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'Outer Products and Projectors in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-proj')}
]},

/* ---------------------------------------------------------------- 1.4.1 -- */
{ id:'m1-gs', module:'M1', nav:'The Gram\u2013Schmidt Process', title:'The Gram\u2013Schmidt Process',
  objective:'Run the Gram-Schmidt recursion by hand and say what makes it fail numerically.',
  keywords:'gram schmidt orthonormalisation qr factorisation projection subtract normalise conditioning stability',
  src:'L2 · constructing an orthonormal basis', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Building an orthonormal basis'},
  {t:'title', text:'The Gram\u2013Schmidt Process'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figGram(),
      caption:'One step. The amber arrow is the part of $v_{2}$ that already lies along $e_{1}$. Removing it leaves $u_{2}$, which is at a right angle to $e_{1}$ by construction.'},
  ], right:[
    {t:'eq', key:true, label:'One step', tex:'u_{j} = v_{j} - \\sum_{i<j}\\langle e_{i}|v_{j}\\rangle\\,e_{i}, \\qquad e_{j} = \\frac{u_{j}}{\\|u_{j}\\|}',
      note:'Remove what already lies along the vectors built so far, then divide by the length that is left.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} e_{1} &= \\tfrac{1}{\\sqrt2}(1,1) \\\\ u_{2} &= (1,0)-\\tfrac12(1,1) = \\left(\\tfrac12,-\\tfrac12\\right) \\\\ e_{2} &= \\tfrac{1}{\\sqrt2}(1,-1) \\end{aligned}',
        note:'For $v_{1}=(1,1)$ and $v_{2}=(1,0)$, as in the figure. The pair is $|+\\rangle$ and $|-\\rangle$ in disguise.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Where it breaks on a computer', html:'For nearly parallel inputs the subtraction cancels almost everything, and rounding error becomes a large part of $u_{j}$. To compute, use a QR factorisation, <code>np.linalg.qr</code>. Laboratory B shows the failure.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$v_{1}=(1,0)$ and $v_{2}=(3,4)$.<div class="nsep"></div>What is $u_{2}$?',
        ask:{key:'m1-gs', choices:['$(0,4)$','$(3,0)$','$(0,1)$'], answer:0,
          why:'$\\langle e_{1}|v_{2}\\rangle=3$, so $u_{2}=(3,4)-3(1,0)=(0,4)$. Normalising it gives $(0,1)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.L2 --- */
{ id:'m1-lab-b', module:'M1', nav:'Laboratory B \u2014 Gram\u2013Schmidt, Step by Step', title:'Laboratory B \u2014 Gram\u2013Schmidt, Step by Step',
  objective:'Let the reader choose three vectors, step the orthogonalisation, and drive it to failure.',
  keywords:'laboratory gram schmidt orthonormalisation steps conditioning near dependent modified stability',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Building an orthonormal basis'},
  {t:'title', text:'Laboratory B \u2014 Gram\u2013Schmidt, Step by Step'},
  {t:'small', html:'Three vectors in space. One control sets the angle between the first two, one sets the height of the third above their plane, both over nine decades. The step control runs the recursion one vector at a time: amber is the piece being removed, green is the orthonormal set so far. The right-hand plot counts how many digits of $\\langle e_{i}|e_{j}\\rangle=\\delta_{ij}$ survive, for the recursion of the last scene and for the <b>modified</b> one, which subtracts each projection from what is left rather than from the original vector. Bring both controls down together and watch the two part company.'},
  {t:'lab', id:'B'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-gs', module:'M1', nav:'Gram\u2013Schmidt in Code', title:'Gram\u2013Schmidt in Code',
  objective:'Run Gram-Schmidt by hand, compare it with QR, and watch the classical recursion lose orthogonality.',
  keywords:'code qiskit numpy program gram schmidt qr modified orthonormal run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · Building an orthonormal basis'},
  {t:'title', text:'Gram\u2013Schmidt in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-gs')}
]},

/* ---------------------------------------------------------------- 1.5.1 -- */
{ id:'m1-tensor', module:'M1', nav:'The Tensor Product', title:'The Tensor Product',
  objective:'Form a tensor product of columns and of matrices, under the bit order this course fixes.',
  keywords:'tensor product kronecker composite system dimension multiply bit order qubit register basis strings',
  src:'L2 · tensor products', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · The tensor product'},
  {t:'title', text:'The Tensor Product'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figTensor(),
      caption:'Every entry of the first column times every entry of the second. Each product is the amplitude of one basis string, and entry $x$ belongs to the string that is $x$ in binary.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Not every joint state is a product', html:'Most four-entry columns cannot be written as $|a\\rangle\\otimes|b\\rangle$. Those are the entangled states of Chapter 3.'}]},
  ], right:[
    {t:'eq', key:true, label:'Tensor product', tex:'\\begin{bmatrix}a_{1}\\\\a_{2}\\end{bmatrix}\\otimes\\begin{bmatrix}b_{1}\\\\b_{2}\\end{bmatrix} = \\begin{bmatrix}a_{1}b_{1}\\\\a_{1}b_{2}\\\\a_{2}b_{1}\\\\a_{2}b_{2}\\end{bmatrix}',
      note:'Two qubits carry four amplitudes, not two plus two. For matrices, $A\\otimes B$ has the block $A_{ij}B$ at $(i,j)$, so $X\\otimes X$ has a $1$ in its corner entry $(0,3)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The bit order', html:'This course writes $|q_{n-1}\\ldots q_{1}q_{0}\\rangle$. So $(1,0)\\otimes(0,1)=(0,1,0,0)$ is $|01\\rangle$, entry $1$. The other order names a different state, and nothing looks wrong.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Qubit $1$ is in $|1\\rangle$ and qubit $0$ is in $|0\\rangle$.<div class="nsep"></div>Which entry of the four is non-zero?',
        ask:{key:'m1-tensor', choices:['Entry $1$','Entry $2$','Entry $3$'], answer:1,
          why:'The string is $|10\\rangle$, and binary $10$ is the number $2$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.5.2 -- */
{ id:'m1-expo', module:'M1', nav:'Exponential Growth of the State Space', title:'Exponential Growth of the State Space',
  objective:'Derive the 2^n dimension from the tensor product and separate size from advantage.',
  keywords:'exponential dimension two to the n state space size readout n bits advantage structure scaling',
  src:'L2 · tensor products', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · The tensor product'},
  {t:'title', text:'Exponential Growth of the State Space'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figTree(),
      caption:'Each new qubit gives every basis string two continuations, so the count goes $1, 2, 4, 8$. At $n=50$ the column has about $1.13\\times10^{15}$ entries.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What the size does not prove', html:'Many states are easy to simulate on a classical computer, through locality, sparsity, low entanglement or stabilizer structure. A large dimension makes a problem interesting; it does not prove it hard.'}]},
  ], right:[
    {t:'eq', key:true, label:'Dimension', tex:'\\dim\\left(\\mathbb{C}^{2}\\right)^{\\otimes n} = 2^{n}',
      note:'This is what "combine two systems" means, applied $n$ times. It is not a claim about speed.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'What the reading out costs', html:'Measuring $n$ qubits returns $n$ bits: one string, not $2^{n}$ amplitudes. An algorithm must make the unwanted amplitudes cancel before the readout.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A register of $20$ qubits.<div class="nsep"></div>How many amplitudes does its column hold?',
        ask:{key:'m1-expo', choices:['$40$','$400$','$1\\,048\\,576$'], answer:2,
          why:'$2^{20}=1\\,048\\,576$. The dimensions multiply; they do not add.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-tensor', module:'M1', nav:'The Tensor Product in Code', title:'The Tensor Product in Code',
  objective:'Form tensor products of states and operators in the course bit order and count the amplitudes of a register.',
  keywords:'code qiskit numpy program tensor kron bit order register dimension run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · The tensor product'},
  {t:'title', text:'The Tensor Product in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-tensor')}
]},

/* ---------------------------------------------------------------- 1.6.1 -- */
{ id:'m1-adjoint', module:'M1', nav:'The Adjoint', title:'The Adjoint',
  objective:'Form the adjoint of an operator, test a matrix for Hermiticity, and apply the order-reversal rule.',
  keywords:'adjoint dagger conjugate transpose hermitian test order reversal product numpy conj',
  src:'L3 · Hermitian matrices', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'The Adjoint'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figAdjoint(),
      caption:'The adjoint as the two steps it is made of. Doing only one of them gives a well-formed matrix that is not the adjoint, and nothing later announces the error.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The adjoint reverses a product', html:'$(AB)^{\\dagger}=B^{\\dagger}A^{\\dagger}$. So a product of two Hermitian operators is Hermitian only when they commute.'}]},
  ], right:[
    {t:'eq', key:true, label:'Adjoint', tex:'A^{\\dagger} = \\left(A^{*}\\right)^{T}, \\qquad \\left(A^{\\dagger}\\right)_{jk} = A_{kj}^{*}',
      note:'In NumPy: <code>A.conj().T</code>. The call <code>A.T</code> alone drops the conjugate.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Hermitian', tex:'\\begin{bmatrix}1&i\\\\-i&1\\end{bmatrix}^{*} = \\begin{bmatrix}1&-i\\\\i&1\\end{bmatrix} \\;\\xrightarrow{\\;T\\;}\\; \\begin{bmatrix}1&i\\\\-i&1\\end{bmatrix}',
        note:'This matrix equals its adjoint, so it is <b>Hermitian</b>: $A=A^{\\dagger}$. Its diagonal is real and its off-diagonal pair is conjugate.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$A=\\begin{bmatrix}1&2i\\\\2i&3\\end{bmatrix}$.<div class="nsep"></div>Is $A$ Hermitian?',
        ask:{key:'m1-adjoint', choices:['Yes','No: the off-diagonal entries are not conjugates','No: the diagonal is not real'], answer:1,
          why:'The conjugate of $2i$ is $-2i$, so $A^{\\dagger}$ has $-2i$ off the diagonal.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.2 -- */
{ id:'m1-herm', module:'M1', nav:'Hermitian Operators', title:'Hermitian Operators',
  objective:'Prove that Hermiticity forces real eigenvalues and say why an observable therefore has to be Hermitian.',
  keywords:'hermitian real eigenvalues proof observable measurement outcomes orthonormal eigenbasis spectrum',
  src:'L3 · Hermitian matrices', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'Hermitian Operators'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figSpectrum(),
      caption:'The rotation $\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ has eigenvalues $\\pm i$, off the real axis. The Hermitian $\\begin{bmatrix}1&i\\\\-i&1\\end{bmatrix}$ has $0$ and $2$, on it.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Why observables are Hermitian', html:'An instrument reports a real number. Hermiticity guarantees real eigenvalues, and also an orthonormal eigenbasis, so two different readings are perfectly distinguishable.'}]},
  ], right:[
    {t:'eq', label:'Act to the right', tex:'\\langle v|A|v\\rangle = \\langle v|\\lambda v\\rangle = \\lambda\\,\\langle v|v\\rangle = \\lambda',
      note:'Let $A|v\\rangle=\\lambda|v\\rangle$ with $|v\\rangle$ normalised, and compute one number twice.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Act to the left', tex:'\\langle v|A|v\\rangle = \\langle A v|v\\rangle = \\lambda^{*}\\,\\langle v|v\\rangle = \\lambda^{*}',
        note:'On the bra, $A$ becomes $A^{\\dagger}=A$, and the bra conjugates $\\lambda$.'},
      {t:'eq', key:true, tex:'\\lambda = \\lambda^{*} \\quad\\Longrightarrow\\quad \\lambda \\in \\mathbb{R}'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$A=\\begin{bmatrix}3&1-i\\\\1+i&2\\end{bmatrix}$ is Hermitian.<div class="nsep"></div>Can $A$ have the eigenvalue $2+i$?',
        ask:{key:'m1-herm', choices:['Yes','No','Only if $A$ is also unitary'], answer:1,
          why:'Every eigenvalue of a Hermitian operator is real. Here they are $4$ and $1$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.3 -- */
{ id:'m1-unit', module:'M1', nav:'Unitary Operators', title:'Unitary Operators',
  objective:'Derive the unitarity condition from the requirement that overlaps are preserved.',
  keywords:'unitary inner product preserved norm reversible gate adjoint inverse orthonormal columns',
  src:'L3 · unitary operators', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'Unitary Operators'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figUnitCircle(),
      caption:'The teal circle is every state of unit length. A unitary sends it to itself. A map that is only invertible sends it to the dashed ellipse, and normalised states stop being normalised.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Determinant one is not enough', html:'The shear $\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ has determinant $1$, but it sends $(0,1)$ to $(1,1)$, of length $\\sqrt2$. Test $U^{\\dagger}U=I$.'}]},
  ], right:[
    {t:'eq', label:'Keep every overlap', tex:'\\begin{aligned}\\langle Ua|Ub\\rangle &= (Ua)^{\\dagger}(Ub) \\\\ &= a^{\\dagger}U^{\\dagger}U\\,b = \\langle a|U^{\\dagger}U|b\\rangle\\end{aligned}',
      note:'For this to equal $\\langle a|b\\rangle$ for every pair, $U^{\\dagger}U$ must be $I$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'Unitary', tex:'U^{\\dagger}U = I \\qquad\\Longleftrightarrow\\qquad U^{-1}=U^{\\dagger}',
        note:'Lengths are kept, the map is reversible, and the columns are orthonormal. The Hadamard has $H^{2}=I$: it is unitary and its own inverse.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$U=\\begin{bmatrix}0&i\\\\i&0\\end{bmatrix}$.<div class="nsep"></div>Is $U$ unitary?',
        ask:{key:'m1-unit', choices:['Yes','No: its entries are imaginary','No: it has no inverse'], answer:0,
          why:'$U^{\\dagger}=\\begin{bmatrix}0&-i\\\\-i&0\\end{bmatrix}$, and $U^{\\dagger}U=I$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.4 -- */
{ id:'m1-gen', module:'M1', nav:'Hermitian Generators of Unitaries', title:'Hermitian Generators of Unitaries',
  objective:'Show that the exponential of a Hermitian operator is unitary and derive its closed form for a Pauli.',
  keywords:'generator exponential unitary family pauli series even odd terms closed form cosine sine',
  src:'L3 · Hermitian generators produce unitary transformations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'Hermitian Generators of Unitaries'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figGenerator(),
      caption:'A real eigenvalue $\\lambda$ of $G$ becomes $e^{-i\\theta\\lambda}$, which has modulus one. Chapter 2 uses the same construction with $\\theta G$ replaced by $Ht$.'}
  ], right:[
    {t:'eq', key:true, label:'Generator', tex:'U(\\theta) = e^{-i\\theta G} \\quad\\text{is unitary}',
      note:'For every Hermitian $G$ and every real $\\theta$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Check', tex:'U^{\\dagger}U = e^{+i\\theta G}\\,e^{-i\\theta G} = e^{0} = I',
        note:'The exponents may be added because both are functions of the same $G$. For two different generators this step fails.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, label:'Pauli closed form', tex:'e^{-i\\theta\\sigma/2} = \\cos\\!\\left(\\tfrac{\\theta}{2}\\right) I \\;-\\; i\\sin\\!\\left(\\tfrac{\\theta}{2}\\right)\\sigma',
        note:'$\\sigma^{2}=I$, so the even terms of the series sum to a cosine and the odd terms to a sine.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\sigma=X$ and $\\theta=\\pi$.<div class="nsep"></div>What is $e^{-i\\pi X/2}$?',
        ask:{key:'m1-gen', choices:['$-iX$','$X$','$I$'], answer:0,
          why:'$\\cos(\\pi/2)=0$ and $\\sin(\\pi/2)=1$, so only $-iX$ is left.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.5 -- */
{ id:'m1-halfangle', module:'M1', nav:'The Half Angle', title:'The Half Angle',
  objective:'Evaluate a Pauli rotation at a given angle and read the sign a full turn produces.',
  keywords:'half angle double cover full turn minus identity rotation rz worked example global phase period',
  src:'L3 · Hermitian generators produce unitary transformations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'The Half Angle'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figHalfAngle(),
      caption:'The two coefficients over two full turns. At $\\theta=2\\pi$ the operator is $-I$; at $\\theta=4\\pi$ it is $I$ again. On one branch of a superposition that $-1$ becomes a relative phase, and Chapter 5 uses it.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Not a typing accident', html:'The operator has period $4\\pi$ and the state has period $2\\pi$. They agree because $-1$ on the whole state is a global phase, which is not physical.'}]},
  ], right:[
    {t:'eq', key:true, label:'A full turn', tex:'e^{-i(2\\pi)\\sigma/2} = -I',
      note:'At $\\theta=2\\pi$ the cosine is $-1$ and the sine is $0$.'},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'Example', tex:'R_{z}(\\pi/3)=\\begin{bmatrix}e^{-i\\pi/6}&0\\\\0&e^{i\\pi/6}\\end{bmatrix}',
        note:'Put $\\sigma=Z$, $\\cos(\\pi/6)=\\tfrac{\\sqrt3}{2}$ and $\\sin(\\pi/6)=\\tfrac12$ into the closed form. The relative phase is $\\pi/3$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\sigma=Z$ and $\\theta=4\\pi$.<div class="nsep"></div>What is $e^{-i(4\\pi)Z/2}$?',
        ask:{key:'m1-halfangle', choices:['$-I$','$I$','$iZ$'], answer:1,
          why:'$\\cos(2\\pi)=1$ and $\\sin(2\\pi)=0$. Two full turns bring the matrix home.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.L-B2 -- */
{ id:'m1-lab-b2', module:'M1', nav:'Laboratory B2 — One Generator, Two Routes to Its Rotation', title:'Laboratory B2 — One Generator, Two Routes to Its Rotation',
  objective:'Let the reader compare the closed form of a Pauli rotation against a truncated power series of its own generator.',
  keywords:'laboratory generator rotation pauli power series closed form unitary full turn interactive',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'Laboratory B2 — One Generator, Two Routes to Its Rotation'},
  {t:'body', html:'<p>Pick a generator $G\\in\\{X,Y,Z\\}$ and an angle $\\theta$. The left figure marks $\\cos(\\theta/2)$ and $\\sin(\\theta/2)$, the coefficients of the closed form $U(\\theta)=\\cos(\\theta/2)I-i\\sin(\\theta/2)G$. The right one builds $U(\\theta)$ a second way, from the power series $\\sum_k(-i\\theta G/2)^k/k!$ of the matrix $-i\\theta G/2$ itself, and counts how many correct digits survive as more terms are kept.</p>'},
  {t:'small', html:'Push $\\theta$ past $360^{\\circ}$ and read the sign the closed form gives, not the one you expect. Then check that $U^{\\dagger}U=I$ holds anyway.'},
  {t:'lab', id:'B2'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-herm', module:'M1', nav:'Hermitian and Unitary Operators in Code', title:'Hermitian and Unitary Operators in Code',
  objective:'Test for Hermiticity and unitarity, and build a rotation from its Hermitian generator.',
  keywords:'code qiskit numpy program adjoint hermitian unitary generator rotation rx run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'Hermitian and Unitary Operators in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-herm')}
]},

/* ---------------------------------------------------------------- 1.7.1 -- */
{ id:'m1-eig', module:'M1', nav:'Eigenvalues and Eigenvectors', title:'Eigenvalues and Eigenvectors',
  objective:'Solve a two-by-two eigenvalue problem and say what an eigenvector is determined up to.',
  keywords:'eigenvector eigenvalue characteristic polynomial invariant direction degeneracy eigh eig scale phase',
  src:'L3 · eigenvectors and eigenvalues', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'Eigenvalues and Eigenvectors'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figEigen(),
      caption:'Teal arrows in, red arrows out. Every input leaves its own line except along the two dashed directions: along one the operator stretches by three, along the other it does nothing.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A direction, and the right routine', html:'If $|v\\rangle$ works, so does $c|v\\rangle$; after normalising only a global phase is left. For a Hermitian matrix call <code>np.linalg.eigh</code>, not <code>np.linalg.eig</code>.'}]},
  ], right:[
    {t:'eq', key:true, label:'Eigenvector', tex:'A|v\\rangle = \\lambda|v\\rangle, \\qquad |v\\rangle \\ne 0',
      note:'A non-zero solution of $(A-\\lambda I)|v\\rangle=0$ exists only when $\\det(A-\\lambda I)=0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} (2-\\lambda)^{2}-1 &= 0 \\\\ \\lambda=3:&\\quad |v\\rangle\\propto(1,1) \\\\ \\lambda=1:&\\quad |v\\rangle\\propto(1,-1) \\end{aligned}',
        note:'For $A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$. Check: the eigenvalues add to the trace, $3+1=4$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$A=\\begin{bmatrix}5&0\\\\0&-2\\end{bmatrix}$.<div class="nsep"></div>What are its eigenvalues?',
        ask:{key:'m1-eig', choices:['$5$ and $-2$','$5$ and $0$','$3$ and $7$'], answer:0,
          why:'A diagonal matrix leaves $|0\\rangle$ and $|1\\rangle$ on their own lines, so its eigenvalues are the diagonal entries.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.7.2 -- */
{ id:'m1-spectral', module:'M1', nav:'The Spectral Theorem', title:'The Spectral Theorem',
  objective:'Write a Hermitian operator as a weighted sum of projectors and verify the two properties they satisfy.',
  keywords:'spectral theorem decomposition projectors orthogonal eigenbasis diagonalisation weighted sum degeneracy',
  src:'L3 · the finite-dimensional spectral theorem', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'The Spectral Theorem'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figSpectral(),
      caption:'An operator taken apart into eigenvalues and projectors, and put back together exactly. In Chapter 2 each projector becomes one outcome of a measurement.'}
  ], right:[
    {t:'eq', key:true, label:'Spectral decomposition', tex:'A = \\sum_{k}\\lambda_{k}P_{k}, \\qquad P_{k}=|v_{k}\\rangle\\langle v_{k}|',
      note:'A Hermitian operator has an orthonormal eigenbasis; weight each projector by its eigenvalue.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'The projectors', tex:'P_{j}P_{k} = \\delta_{jk}P_{k}, \\qquad \\sum_{k}P_{k} = I',
        note:'They annihilate each other, and together they resolve the identity.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'Example', tex:'3\\cdot\\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix} + 1\\cdot\\tfrac12\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}',
        note:'$\\lambda=3$ on $|+\\rangle$ and $\\lambda=1$ on $|-\\rangle$, the eigenvectors of the last scene.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$A=4P_{+}-P_{-}$, with $P_{\\pm}=|\\pm\\rangle\\langle\\pm|$.<div class="nsep"></div>What are the eigenvalues of $A$?',
        ask:{key:'m1-spectral', choices:['$4$ and $-1$','$4$ and $1$','$3$ and $5$'], answer:0,
          why:'In a spectral decomposition the weights of the projectors are the eigenvalues.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.7.3 -- */
{ id:'m1-fofa', module:'M1', nav:'Functions of an Operator', title:'Functions of an Operator',
  objective:'Evaluate a function of a Hermitian operator through its spectral decomposition.',
  keywords:'operator function exponential spectral eigenvalues matrix exponential not elementwise square root',
  src:'L3 · spectral projectors and functions of an operator', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'Functions of an Operator'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figFunction(),
      caption:'The exponential acts on the eigenvalues. Each eigenvalue on the real axis goes to a point of modulus one at angle $-\\lambda t$. The projectors do not move.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not entry by entry', html:'$e^{A}$ is not the matrix of $e^{A_{jk}}$. For the $A$ above that gives $\\begin{bmatrix}e^{2}&e\\\\e&e^{2}\\end{bmatrix}$, with eigenvalues $e^{2}\\pm e$; the correct ones are $e^{3}$ and $e^{1}$.'}]},
  ], right:[
    {t:'eq', key:true, label:'Function of an operator', tex:'f(A) = \\sum_{k} f(\\lambda_{k})\\,P_{k}',
      note:'Apply $f$ to the eigenvalues and keep the projectors. For a power this follows from $P_{j}P_{k}=\\delta_{jk}P_{k}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'The exponential', tex:'e^{-iAt} = \\sum_{k} e^{-i\\lambda_{k}t}\\,P_{k}',
        note:'For $A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$: $e^{-iAt}=e^{-3it}P_{+}+e^{-it}P_{-}$, unitary at every $t$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$A=4P_{+}+9P_{-}$.<div class="nsep"></div>What is $\\sqrt{A}$?',
        ask:{key:'m1-fofa', choices:['$2P_{+}+3P_{-}$','$\\sqrt{13}\\,I$','$4P_{+}+9P_{-}$'], answer:0,
          why:'The square root acts on the eigenvalues $4$ and $9$ and keeps the projectors.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.7.R -- */
realGallery({ id:'m1-real-spectral', nav:'The Spectral Theorem Around Us', title:'The Spectral Theorem Around Us',
  eyebrow:'Module 1 · The spectral theorem and functions of an operator',
  objective:'Read a prism\'s spectrum as one dispersion law read off at many wavelengths, the way a function of an operator is its eigenvalues read off one at a time.',
  keywords:'prism spectrum dispersion refractive index wavelength eigenvalue function of an operator real world example',
  photo:['m1_prism','A glass prism splitting a beam of white light into a fan of coloured light',
    'One prism, one law of refraction; the colours separate because each wavelength obeys it by a different amount.'],
  figs:[
    [()=>figDispersion(),'The refractive index of a crown-glass prism, $n(\\lambda)=A+B/\\lambda^{2}$. Blue light sees a larger $n$ than red, so it bends more.'],
    [()=>figSpectrumBars(),'The angle by which the prism bends each wavelength, computed from $n(\\lambda)$ through the prism\'s own geometry. One formula, one output for every colour.']
  ],
  notes:[
    {t:'note', kind:'def', head:'One law, many outputs', html:'In $f(A)=\\sum_{k}f(\\lambda_{k})P_{k}$ $f$ acts on each component alone. The prism applies one law, $n(\\lambda)$, to each wavelength alone.'},
    {t:'note', kind:'warn', head:'Sorted, not created', html:'The prism sorts colours already in the beam; $f(A)$ keeps the eigenvectors and changes only their numbers. Here $\\lambda$ is a wavelength, not an eigenvalue.'}
  ]}),

/* ---------------------------------------------------------------- 1.L-B3 -- */
{ id:'m1-lab-b3', module:'M1', nav:'Laboratory B3 — A Hermitian Matrix, Taken Apart and Rebuilt', title:'Laboratory B3 — A Hermitian Matrix, Taken Apart and Rebuilt',
  objective:'Let the reader build a Hermitian matrix, find its own spectral decomposition, and drive it to a repeated eigenvalue.',
  keywords:'laboratory hermitian eigenvalue eigenvector spectral decomposition function of an operator degenerate interactive',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'Laboratory B3 — A Hermitian Matrix, Taken Apart and Rebuilt'},
  {t:'body', html:'<p>Four sliders build the Hermitian matrix $A=\\begin{bmatrix}a&b-ic\\\\b+ic&d\\end{bmatrix}$. The laboratory finds its eigenvalues and eigenvectors from the characteristic equation, rebuilds $A=\\lambda_1P_1+\\lambda_2P_2$, and evaluates $e^{-iAt}$ two ways: from the projectors, and from a power series of $A$ itself. The left figure marks the two eigenvalues on the real axis; the right one marks $e^{-i\\lambda_1t}$ and $e^{-i\\lambda_2t}$ on the unit circle.</p>'},
  {t:'small', html:'Set $a=d$ and $b=c=0$: the two eigenvalues meet, and the eigenvectors the laboratory reports stop meaning anything beyond "some orthonormal pair". Move any one slider off that point and a definite pair returns.'},
  {t:'lab', id:'B3'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-spectral', module:'M1', nav:'The Spectral Theorem in Code', title:'The Spectral Theorem in Code',
  objective:'Diagonalise a Hermitian matrix, rebuild it from its projectors, and evaluate a function of it.',
  keywords:'code qiskit numpy program eigh eigenvalue spectral projector exponential function run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'The Spectral Theorem in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-spectral')}
]},

/* ---------------------------------------------------------------- 1.8.1 -- */
{ id:'m1-dirac', module:'M1', nav:'Dirac Notation', title:'Dirac Notation',
  objective:'Translate between Dirac notation and matrix notation in both directions and read a product right to left.',
  keywords:'dirac notation bra ket translation matrix column row expectation value basis independent order',
  src:'L3 · Dirac notation', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Dirac notation'},
  {t:'title', text:'Dirac Notation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figShapes(),
      caption:'The shapes are the check. A line of algebra that gives a number where an operator was expected has an inner product where an outer product belonged.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Read a product right to left', html:'The operator written last acts first. The circuit $H$, then $R_{z}$, then $H$ is the operator $HR_{z}H$.'}]},
  ], right:[
    {t:'eq', tex:'\\begin{array}{ll} |\\psi\\rangle & \\text{a column, } n\\times 1 \\\\ \\langle\\phi|\\psi\\rangle & \\text{row times column: a number} \\\\ |\\phi\\rangle\\langle\\psi| & \\text{column times row: an } n\\times n \\text{ operator} \\\\ \\langle\\psi|A|\\psi\\rangle & \\text{row, matrix, column: a number} \\end{array}',
      note:'Each symbol is an array once a basis is chosen. The last line is the expectation value of Chapter 2.'},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'An operator in the notation', tex:'A = I\\,A\\,I = \\sum_{j,k} |e_{j}\\rangle\\,\\langle e_{j}|A|e_{k}\\rangle\\,\\langle e_{k}|',
        note:'The number $\\langle e_{j}|A|e_{k}\\rangle$ is the matrix entry $A_{jk}$: the matrix is the operator read in a basis.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\phi\\rangle$ and $|\\psi\\rangle$ are columns and $A$ is a matrix.<div class="nsep"></div>What is $A|\\psi\\rangle\\langle\\phi|$?',
        ask:{key:'m1-dirac', choices:['A number','A column','A matrix'], answer:2,
          why:'Matrix times column is a column, and a column times a row is an $n\\times n$ matrix.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-dirac', module:'M1', nav:'Dirac Notation in Code', title:'Dirac Notation in Code',
  objective:'Compute expectation values and matrix elements, and read a circuit as a matrix product right to left.',
  keywords:'code qiskit numpy program expectation value matrix element circuit order run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · Dirac notation'},
  {t:'title', text:'Dirac Notation in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-dirac')}
]},

/* ---------------------------------------------------------------- 1.9.1 -- */
{ id:'m1-wavefunctions', module:'M1', nav:'Wavefunctions as Vectors', title:'Wavefunctions as Vectors',
  objective:'Use the inner product for square-integrable functions and recognise it as the continuous version of a complex column.',
  keywords:'wavefunction function vector Hilbert space square integrable L2 inner product integral norm orthogonal sine cosine',
  src:'L4 · square-integrable functions as vectors', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Functions as vectors'},
  {t:'title', text:'Wavefunctions as Vectors'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figFunctionVector(),
      caption:'Two normalised functions on $[-\\pi,\\pi]$: $\\sin x/\\sqrt\\pi$ and $\\cos x/\\sqrt\\pi$. Their inner product is zero, so they are orthogonal vectors, although their curves cross.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Finite at every point is not enough', html:'A function can be finite at each point and still have an infinite squared norm on an unbounded interval. The integral of $|f|^{2}$ decides membership.'}]},
  ], right:[
    {t:'eq', key:true, label:'Inner product of functions', tex:'\\langle f|g\\rangle = \\int_{a}^{b} f^{*}(x)\\,g(x)\\,\\mathrm{d}x, \\qquad \\|f\\|^{2}=\\int_{a}^{b}|f(x)|^{2}\\,\\mathrm{d}x',
      note:'The sum over entries becomes an integral. A function whose $\\|f\\|^{2}$ is finite belongs to $L^{2}[a,b]$ and can be normalised and used as a state.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned}\\langle u|v\\rangle &= \\tfrac{1}{\\pi}\\int_{-\\pi}^{\\pi}\\sin x\\cos x\\,\\mathrm{d}x = 0 \\\\ \\|u\\|^{2} &= \\tfrac{1}{\\pi}\\int_{-\\pi}^{\\pi}\\sin^{2}x\\,\\mathrm{d}x = 1\\end{aligned}',
        note:'The product $\\sin x\\cos x$ is odd on a symmetric interval, so its integral vanishes.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$f(x)=1$ on $[0,4]$.<div class="nsep"></div>What is $\\|f\\|$?',
        ask:{key:'m1-wavefunctions', choices:['$4$','$2$','$16$'], answer:1,
          why:'$\\|f\\|^{2}=\\int_{0}^{4}1\\,\\mathrm{d}x=4$, so $\\|f\\|=2$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.9.2 -- */
{ id:'m1-completeness', module:'M1', nav:'Completeness and Truncation', title:'Completeness and Truncation',
  objective:'Use a complete orthonormal basis, Parseval identity and the coefficient tail to quantify a truncated expansion.',
  keywords:'complete basis Parseval Fourier expansion coefficients truncation error norm convergence function space',
  src:'L4 · completeness and Parseval; Fourier expansion as a change of basis', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 1 · Functions as vectors'},
  {t:'title', text:'Completeness and Truncation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figParseval(),
      caption:'A coefficient spectrum with the first four terms kept. The bars add to the squared norm; the bars right of the dashed line add to the squared truncation error. Sines and cosines on an interval are one such basis.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Norm convergence is not pointwise', html:'Parseval controls the integrated error. It does not say that every point of the curve approaches the target at the same rate.'}]},
  ], right:[
    {t:'eq', key:true, label:'Expansion', tex:'|f\\rangle=\\sum_{n=1}^{\\infty}c_{n}|u_{n}\\rangle, \\qquad c_{n}=\\langle u_{n}|f\\rangle',
      note:'The family is complete: no non-zero vector is orthogonal to every $u_{n}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Parseval and the tail', tex:'\\|f\\|^{2}=\\sum_{n=1}^{\\infty}|c_{n}|^{2}, \\qquad \\left\\|f-\\sum_{n=1}^{N}c_{n}u_{n}\\right\\|^{2}=\\sum_{n>N}|c_{n}|^{2}',
        note:'The coefficient tail is exactly the squared error of the truncated expansion.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|c_{1}|^{2}=0.5$, $|c_{2}|^{2}=0.3$, $|c_{3}|^{2}=0.2$, and every other $c_{n}$ is $0$. Keep the first two terms.<div class="nsep"></div>What is the squared error?',
        ask:{key:'m1-completeness', choices:['$0.2$','$0.8$','$0.5$'], answer:0,
          why:'The squared error is the sum of the omitted $|c_{n}|^{2}$, here only $|c_{3}|^{2}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 1.9.R -- */
realGallery({ id:'m1-real-functions', nav:'Functions as Vectors Around Us', title:'Functions as Vectors Around Us',
  eyebrow:'Module 1 · Functions as vectors',
  objective:'Hear a plucked string\'s normal modes as the orthonormal basis this section builds functions out of.',
  keywords:'guitar string normal modes harmonics fourier series orthonormal basis completeness real world example',
  photo:['m1_string','A guitar string vibrating after being plucked, its blurred outline showing the range of the motion',
    'The string\'s shape at every instant is one function; the note you hear is built from a fixed set of others.'],
  figs:[
    [()=>figStringModes(),'The first three normal modes of a string fixed at both ends, $\\sin(n\\pi x/L)$. They are mutually orthogonal, the same property the inner product of functions checks.'],
    [()=>figPluckSum(),'A plucked (triangular) shape, rebuilt from 3 modes and from 12. More terms kept means less squared error left over, exactly as Parseval states.']
  ],
  notes:[
    {t:'note', kind:'def', head:'A pluck is a superposition', html:'The plucked shape is a sum $\\sum_{n}c_{n}\\sin(n\\pi x/L)$ over every mode, with $c_{n}=\\langle u_{n}|f\\rangle$. The ear hears these as the fundamental plus its overtones.'},
    {t:'note', kind:'warn', head:'A finite sum is already close', html:'A dozen modes already sound right, because the coefficients fall off quickly. That is completeness and truncation, heard rather than computed.'}
  ]}),

/* ---------------------------------------------------------------- code --- */
{ id:'m1-code-functions', module:'M1', nav:'Functions as Vectors in Code', title:'Functions as Vectors in Code',
  objective:'Store sampled functions as states, check an orthonormal family, and measure what truncation loses.',
  keywords:'code qiskit numpy program function amplitude encoding parseval truncation run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 1 · Functions as vectors'},
  {t:'title', text:'Functions as Vectors in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-functions')}
]},

/* ---------------------------------------------------------------- 1.9.3 -- */
{ id:'m1-quick', module:'M1', nav:'Quick Check', title:'Quick Check',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict inner product outer product tensor adjoint unitary hermitian spectral gram schmidt phase',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Quick check'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Conjugate', html:'$\\langle a|b\\rangle=2-3i$. Find $\\langle b|a\\rangle$.',
      ask:{key:'m1-qc0', choices:['$2-3i$','$2+3i$','$-2+3i$'], answer:1,
        why:'Swap and conjugate.'}}],
    [{t:'note', kind:'def', head:'Modulus', html:'$z=4e^{i\\pi/3}$. Find $|z|^{2}$.',
      ask:{key:'m1-qc1', choices:['$4$','$8$','$16$'], answer:2,
        why:'$zz^{*}=16$.'}}],
    [{t:'note', kind:'def', head:'Outer product', html:'$|0\\rangle\\langle 0|$ acts on $|1\\rangle$.',
      ask:{key:'m1-qc2', choices:['$|0\\rangle$','$|1\\rangle$','Zero'], answer:2,
        why:'$\\langle 0|1\\rangle=0$.'}}],
    [{t:'note', kind:'def', head:'Tensor size', html:'Three qubits. How many amplitudes?',
      ask:{key:'m1-qc3', choices:['$3$','$6$','$8$'], answer:2,
        why:'$2^{3}=8$.'}}],
    [{t:'note', kind:'def', head:'Adjoint order', html:'$(AB)^{\\dagger}$ equals',
      ask:{key:'m1-qc4', choices:['$A^{\\dagger}B^{\\dagger}$','$B^{\\dagger}A^{\\dagger}$','$BA$'], answer:1,
        why:'Order reverses.'}}],
    [{t:'note', kind:'def', head:'Unitary test', html:'$Z=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}$. Unitary?',
      ask:{key:'m1-qc5', choices:['Yes','No','Not invertible'], answer:0,
        why:'$Z^{\\dagger}Z=I$.'}}],
    [{t:'note', kind:'def', head:'Hermitian spectrum', html:'$A$ is Hermitian. Eigenvalue $3i$?',
      ask:{key:'m1-qc6', choices:['Yes','No','If unitary'], answer:1,
        why:'Eigenvalues are real.'}}],
    [{t:'note', kind:'def', head:'Spectral trace', html:'$A=2P_{+}+6P_{-}$. Find $\\operatorname{tr}(A)$.',
      ask:{key:'m1-qc7', choices:['$4$','$8$','$12$'], answer:1,
        why:'$2+6$.'}}],
    [{t:'note', kind:'def', head:'Cauchy-Schwarz', html:'Normalised $|a\\rangle,|b\\rangle$. Largest $|\\langle a|b\\rangle|$?',
      ask:{key:'m1-qc8', choices:['$0$','$1$','$2$'], answer:1,
        why:'Bounded by $\\|a\\|\\|b\\|$.'}}],
    [{t:'note', kind:'def', head:'Gram-Schmidt', html:'$v_{1}=(0,1)$, $v_{2}=(1,1)$. Find $u_{2}$.',
      ask:{key:'m1-qc9', choices:['$(1,0)$','$(1,1)$','$(0,1)$'], answer:0,
        why:'$(1,1)-(0,1)$.'}}],
    [{t:'note', kind:'def', head:'Global phase', html:'$\\tfrac35|0\\rangle+\\tfrac45|1\\rangle\\to-|\\psi\\rangle$. Find $P(0)$.',
      ask:{key:'m1-qc10', choices:['$\\tfrac{9}{25}$','$-\\tfrac{9}{25}$','$0$'], answer:0,
        why:'Phase changes nothing.'}}],
    [{t:'note', kind:'def', head:'Function of $A$', html:'$A=9P_{+}+4P_{-}$. Find $\\operatorname{tr}(A^{2})$.',
      ask:{key:'m1-qc11', choices:['$81+16$','$13$','$13^{2}$'], answer:0,
        why:'$81P_{+}+16P_{-}$.'}}]
  ]}
]},

/* ---------------------------------------------------------------- 1.10.1 - */
{ id:'m1-synth', module:'M1', nav:'Summary', title:'Summary',
  objective:'Collect the four constructions and the three derivation moves the rest of the course uses.',
  keywords:'summary module 1 review constructions moves inner outer tensor spectral checklist',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Summary'},
  {t:'title', text:'Summary'},
  {t:'fig', frame:true, svg:()=>figMoves(),
    caption:'Three moves, in the order they are usually needed. Each one turns an expression you cannot evaluate into a sum of expressions you can, and every derivation in the next five chapters is some sequence of them.'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'States', items:[
      {t:'small', html:'A state is a normalised column of complex amplitudes. Its coefficients in a basis are inner products with that basis, and they change when the basis does while the state does not.'}]}],
    [{t:'card', head:'Phase', items:[
      {t:'small', html:'A phase on the whole state is not physical and may be dropped. A phase between two terms is physical and may never be dropped. Every interference effect in this course is the second kind.'}]}],
    [{t:'card', head:'Operators', items:[
      {t:'small', html:'Hermitian means real eigenvalues and an orthonormal eigenbasis, which is what an observable needs. Unitary means every inner product is preserved, which is what a gate needs. The exponential of a Hermitian operator is unitary.'}]}],
    [{t:'card', head:'Composition', items:[
      {t:'small', html:'Two systems make one by the tensor product, so dimensions multiply and $n$ qubits carry $2^{n}$ amplitudes. That is the whole origin of the exponential, and it buys nothing until the readout is arranged.'}]}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:2, gap:'24px', items:[
      [{t:'note', kind:'ok', head:'Six lines to be able to write without looking', html:'$\\langle a|b\\rangle=\\sum_k a_k^{*}b_k$. &nbsp; $v_j=\\langle e_j|v\\rangle$. &nbsp; $\\sum_k|e_k\\rangle\\langle e_k|=I$. &nbsp; $A=\\sum_k\\lambda_kP_k$. &nbsp; $f(A)=\\sum_k f(\\lambda_k)P_k$. &nbsp; $e^{-i\\theta\\sigma/2}=\\cos(\\theta/2)I-i\\sin(\\theta/2)\\sigma$.'}],
      [{t:'note', kind:'warn', head:'Four errors that will cost you a whole question', html:'A missing conjugate in an inner product. A phase cancelled as global when it sat on one branch of a superposition. A function of a matrix applied entry by entry. And a two-qubit state written in the other bit order, which does not make an answer approximately wrong — it makes it an answer to a different question.'}]
    ]}
  ]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'def', head:'What comes next', html:'Chapter 2 adds the physics this chapter deliberately left out: which operator a laboratory instrument corresponds to, how an amplitude becomes a probability, what the state is after a measurement, and why the evolution of a closed system is the exponential of a Hermitian operator. Every one of those is a sentence about objects defined here.'}
  ]}
]}
,

/* Four optional projects for students who want to run the chapter's own
   constructions on their own computer. They carry no grade and no code: each
   card gives an aim, what it practises, a few steps and what to look for. The
   briefs state no numerical answer, so they need no line in verify/. Small
   local glyphs, modelled on the reference course's summary-card sketches,
   since the summary page is always navy and needs the dark-page signal
   tints rather than the light-page figure colours. */
{ id:'m1-projects', module:'M1', nav:'Projects to Try', title:'Projects to Try',
  dark:true, objective:'Offer four optional projects that run the chapter’s own constructions in NumPy.',
  keywords:'projects numpy qiskit python inner product gram schmidt qr tensor product spectral decomposition matrix function',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Projects'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>{
    const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
    const ln = (d,c,w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const AX='rgba(239,231,216,.30)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
    const G = {
      inner: sv(ln('M46 6 L46 38',AX,1)+ln('M6 22 L86 22',AX,1)
        +ln('M46 22 L74 9',CY)+`<circle cx="74" cy="9" r="3" fill="${CY}"/>`
        +ln('M46 22 L66 36',VI)+`<circle cx="66" cy="36" r="3" fill="${VI}"/>`),
      gs: sv(ln('M8 38 L60 8',CY,1.6)+`<circle cx="60" cy="8" r="3" fill="${CY}"/>`
        +ln('M8 38 L58 38',AM,1.6)+`<circle cx="58" cy="38" r="3" fill="${AM}"/>`
        +ln('M58 38 L60 8',AX,1.2)+ln('M8 38 L36 15',GR,2)+`<circle cx="36" cy="15" r="3" fill="${GR}"/>`),
      tensor: sv(ln('M2 38 H90',AX,1)+[1,2,4,8].map((n,k)=>{ const x=8+k*22, y=Math.max(4,38-n*4);
        return ln(`M${x} 38 V${y}`,AX,1)+`<circle cx="${x}" cy="${y}" r="3" fill="${k<2?CY:GR}"/>`; }).join('')),
      spectral: sv(ln('M10 22 H36',CY,2)+`<circle cx="10" cy="22" r="3" fill="${CY}"/><circle cx="36" cy="22" r="3" fill="${CY}"/>`
        +ln('M46 22 H56',AX,1.4)+ln('M52 18 L56 22 L52 26',AX,1.4)
        +ln('M66 10 H90',AM,2)+`<circle cx="66" cy="10" r="3" fill="${AM}"/><circle cx="90" cy="10" r="3" fill="${AM}"/>`
        +ln('M66 34 H90',RD,2)+`<circle cx="66" cy="34" r="3" fill="${RD}"/><circle cx="90" cy="34" r="3" fill="${RD}"/>`)
    };
    return PROJECTS.deck('m1', [
      {title:'Normalise a state and watch the probabilities move', glyph:G.inner,
       aim:'Use the inner product to normalise an unnormalised column and check Cauchy-Schwarz on a pair of states.',
       learn:['Normalising a column by dividing by its own length.',
              'Computing an inner product with the conjugate on the first argument, never the second.',
              'The Cauchy-Schwarz bound as a numerical check rather than a theorem to quote.'],
       steps:['Build the column $(1+2i,\\,3-i)$ in NumPy. Normalise it with `np.vdot` for the squared length, and print both probabilities.',
              'Build two more normalised states and print $\\langle a|b\\rangle$ with `np.vdot(a,b)` and with `np.dot(a,b)`. Compare the two.',
              'Print $|\\langle a|b\\rangle|$ against $\\lVert a\\rVert\\lVert b\\rVert$ for ten random normalised states of dimension four.'],
       look:'`np.dot` silently drops the conjugate and agrees with `np.vdot` only when every entry is real. The Cauchy-Schwarz ratio never exceeds one, and it reaches one only when the two states agree up to a phase.'},
      {title:'Break Gram-Schmidt on purpose', glyph:G.gs,
       aim:'Reproduce Laboratory B in plain NumPy and watch the classical recursion lose orthogonality where the modified one does not.',
       learn:['Writing the classical and the modified Gram-Schmidt recursions from their own definitions.',
              'Measuring a defect from orthonormality rather than trusting a plot.',
              'Comparing a hand-written recursion against `np.linalg.qr`.'],
       steps:['Write both recursions for three vectors in $\\mathbb{C}^3$, following the definitions of this chapter.',
              'Generate two vectors separated by an angle $\\theta=10^{-k}$ radians for $k=1,\\dots,8$, plus a third vector off their plane, and run both recursions.',
              'At each $k$ print $\\max_{i,j}\\lvert\\langle e_i|e_j\\rangle-\\delta_{ij}\\rvert$ for both recursions, and compare the classical one against `np.linalg.qr`.'],
       look:'The classical recursion’s defect grows by roughly a factor of ten each time $k$ does; the modified one stays many digits smaller for much longer. `np.linalg.qr` tracks the modified recursion, not the classical one.'},
      {title:'Count the amplitudes a register actually has', glyph:G.tensor,
       aim:'Build tensor products of growing registers and read off the exponential growth directly from array shapes.',
       learn:['Forming a multi-qubit state with `np.kron`, in this course’s bit order.',
              'Reading dimension growth from `.shape` rather than from a formula alone.',
              'Telling the size of a state apart from the cost of preparing or reading it.'],
       steps:['Build $|0\\rangle$ and $|1\\rangle$ as columns. Form $|1\\rangle\\otimes|0\\rangle$ with `np.kron(b,a)` for qubit $1$ then qubit $0$, and check which entry is $1$.',
              'Write a loop that tensors $n$ copies of $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)$ for $n=1,\\dots,20$ and prints the array length at each step.',
              'At $n=20$, print how long the array takes to build, and how many entries would be needed at $n=50$ without building it.'],
       look:'The array length doubles every step, exactly $2^n$, and by $n=20$ it already holds over a million entries while every one of them equals $2^{-n/2}$. The array is easy to build only because it needs no structure beyond one repeated tensor factor; Chapter 3 finds states this trick cannot reach.'},
      {title:'Take a matrix apart and put it back together', glyph:G.spectral,
       aim:'Diagonalise a Hermitian matrix, rebuild it from its own projectors, and evaluate a function of it two ways.',
       learn:['Using `np.linalg.eigh` on a Hermitian matrix rather than `np.linalg.eig`.',
              'Rebuilding a matrix from $\\sum_k\\lambda_kP_k$ and checking the rebuild against the original.',
              'Evaluating $e^{-iAt}$ from the spectral decomposition and from `scipy.linalg.expm`, and comparing them.'],
       steps:['Build a random $4\\times4$ Hermitian matrix $A$ (a random matrix plus its own adjoint).',
              'Diagonalise it with `np.linalg.eigh`, form each projector $P_k=|v_k\\rangle\\langle v_k|$, and print $\\max\\lvert\\sum_k\\lambda_kP_k-A\\rvert$.',
              'For ten values of $t$, compute $e^{-iAt}$ from $\\sum_k e^{-i\\lambda_kt}P_k$ and from `scipy.linalg.expm(-1j*A*t)`, and print the largest entrywise gap.'],
       look:'Both defects stay at the size of floating-point rounding, about $10^{-14}$, for a generic matrix. Repeat with two of the four eigenvalues set equal by hand, and the individual projectors printed by `eigh` change under a tiny perturbation of the matrix while their sum for the repeated eigenvalue does not.'}
    ]);
  }}
]},

/* ---------------------------------------------------------------- 1.10.2 ---
   The promise made in the course map — that each chapter names the shapes of
   question it sets before it sets them — is kept here. The list is the same
   object the questions themselves are labelled from, so a shape cannot be
   described here and set differently there. */
{ id:'m1-shapes', module:'M1', nav:'Question Types', title:'Question Types',
  objective:'Name the recurring question types and the method each one is answered by.',
  keywords:'question types taxonomy shapes method examination practice inner basis phase operator spectral tensor',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Summary and practice'},
  {t:'title', text:'Question Types'},
  {t:'small', html:'Six shapes keep coming back, and a seventh — a <b>full-length question</b> — puts three to five of them in one statement, with each part resting on the one before. Name the shape before starting: the method for each is fixed, and most of the marks lost in this chapter are lost by applying the method for one shape to a question of another.'},
  {t:'grid', cols:3, gap:'22px', items:[
    [{t:'drilltypes', module:'M1', from:0, to:2}],
    [{t:'drilltypes', module:'M1', from:2, to:4}],
    [{t:'drilltypes', module:'M1', from:4, to:6}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'How to read a full-length question', html:'Read every part before starting. An error in the first part travels the whole way, and the marks for the later parts usually survive a wrong number carried forward correctly — but only if the working shows where it came from.'}
  ]}
]}

];

window.SCENES_M1 = SC;
})();
