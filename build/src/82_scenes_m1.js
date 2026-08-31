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
  return P.blocks({w:700,h:210,items:[
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
  const a = P.Axes({w:540,h:254,xr:[-0.6,3.8],yr:[0,1.15],
    ylabel:'\\text{probability}', pad:{l:62,r:24,t:28,b:56},
    xticksOverride:[], ytarget:4});
  a.rect(-0.22,0,0.22,1,{fill:C.dec.out});
  a.rect(0.78,0,1.22,0,{fill:C.dec.out});
  a.rect(1.78,0,2.22,0,{fill:C.dec.err});
  a.rect(2.78,0,3.22,1,{fill:C.dec.err});
  a.poly([[-0.22,1],[0.22,1]],{color:C.out,width:2.6});
  a.poly([[2.78,1],[3.22,1]],{color:C.err,width:2.6});
  a.poly([[0.78,0],[1.22,0]],{color:C.out,width:2.6});
  a.poly([[1.78,0],[2.22,0]],{color:C.err,width:2.6});
  a.note(0,-0.10,'0',{fs:13,color:C.muted,anchor:'middle'});
  a.note(1,-0.10,'1',{fs:13,color:C.muted,anchor:'middle'});
  a.note(2,-0.10,'0',{fs:13,color:C.muted,anchor:'middle'});
  a.note(3,-0.10,'1',{fs:13,color:C.muted,anchor:'middle'});
  a.note(0.5,-0.21,'H|+\\rangle',{fs:14,color:C.out,anchor:'middle',tex:true});
  a.note(2.5,-0.21,'H|-\\rangle',{fs:14,color:C.err,anchor:'middle',tex:true});
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
  return P.blocks({w:700,h:150,items:[
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
  return P.blocks({w:640,h:168,items:[
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

const SC = [

/* ---------------------------------------------------------------- 1.0.1 -- */
{ id:'m1-open', module:'M1', nav:'One language', title:'One language for states, operations and questions',
  objective:'Say what the chapter is for: the notation every later chapter is written in.',
  keywords:'linear algebra language complex vector space basis matrix inner product overview module 1',
  src:'L2 · why linear algebra is the language', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · The mathematics of quantum states'},
  {t:'title', text:'One language for states, operations and questions'},
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
{ id:'m1-ket', module:'M1', nav:'A state is a column', title:'A state is a column of complex numbers',
  objective:'Write a qubit state as a normalised complex column and read superposition as linearity.',
  keywords:'ket state vector complex vector space superposition linearity normalisation amplitude column',
  src:'L2 · vectors and dual vectors', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'A state is a column of complex numbers'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A quantum state is written $|\\psi\\rangle$ and is called a <b>ket</b>. Once a basis $\\{|0\\rangle,|1\\rangle\\}$ has been named, the ket is a column of two complex numbers, called <b>amplitudes</b>:</p>'},
    {t:'eq', key:true, tex:'|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle = \\begin{bmatrix}\\alpha\\\\ \\beta\\end{bmatrix}, \\qquad \\alpha,\\beta\\in\\mathbb{C}'},
    {t:'body', html:'<p>The space these live in is a complex vector space, which means only that adding two states gives a state and multiplying a state by a complex number gives a state. That closure is the whole content of the word <b>superposition</b>: if $|\\psi\\rangle$ and $|\\phi\\rangle$ are allowed, so is $\\alpha|\\psi\\rangle+\\beta|\\phi\\rangle$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>One condition is imposed on top of the vector-space axioms. A physical state has length one:</p>'},
      {t:'eq', tex:'|\\alpha|^{2} + |\\beta|^{2} = 1'},
      {t:'small', html:'This is not a mathematical necessity; it is the bookkeeping that makes the probabilities of Chapter 2 add up to one. A column that is not normalised still names a direction, and dividing by its length is how the state is recovered.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The unnormalised column $\\begin{bmatrix}2+i\\\\ 1-3i\\end{bmatrix}$.'],
        ['Method', 'Square the modulus of each entry, add, take the square root, and divide.'],
        ['Work', '$|2+i|^{2}=4+1=5$ and $|1-3i|^{2}=1+9=10$, so the squared length is $15$.'],
        ['Answer', '$|\\psi\\rangle=\\tfrac{1}{\\sqrt{15}}\\left[(2+i)|0\\rangle + (1-3i)|1\\rangle\\right]$.'],
        ['Check', '$\\tfrac{5}{15}+\\tfrac{10}{15}=1$, and the two probabilities of Chapter 2 will be $1/3$ and $2/3$.']
      ]}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figKet(),
      caption:'A superposition drawn in a real slice of the state space. The picture shows two of the four real numbers a qubit carries, so it is a shadow and not the object: it can show that a state is a sum of two basis states, and it cannot show a phase.'},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What a superposition is not', html:'It is <b>not</b> the statement that the qubit is really in $|0\\rangle$ or really in $|1\\rangle$ and that we do not yet know which. That description predicts different numbers, and the interferometer of Chapter 0 is the experiment that separates the two. A superposition is one state, with two amplitudes, and both of them are there at once.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.1.2 -- */
{ id:'m1-bra', module:'M1', nav:'Bras and the inner product', title:'The bra, and the inner product it computes',
  objective:'Form the adjoint of a ket and compute an inner product with the conjugate in the right place.',
  keywords:'bra dual vector adjoint conjugate transpose inner product vdot overlap dagger',
  src:'L3 · Dirac notation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'The bra, and the inner product it computes'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Every ket has a partner. The <b>bra</b> $\\langle a|$ is the ket $|a\\rangle$ transposed and conjugated, written with a dagger:</p>'},
    {t:'eq', tex:'\\langle a| = |a\\rangle^{\\dagger} = \\begin{bmatrix}a_{1}^{*} & a_{2}^{*} & \\cdots & a_{n}^{*}\\end{bmatrix}'},
    {t:'body', html:'<p>A bra is a row. Put a row on the left of a column and the shapes contract to a single number. That number is the <b>inner product</b>:</p>'},
    {t:'eq', key:true, tex:'\\langle a|b\\rangle = \\sum_{k} a_{k}^{*}\\,b_{k}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The conjugate sits on the <b>first</b> argument and on nothing else. Swapping the two arguments therefore conjugates the answer, $\\langle b|a\\rangle=\\langle a|b\\rangle^{*}$, and the inner product of a state with itself, $\\langle a|a\\rangle=\\sum_k|a_k|^{2}$, is real and never negative — which is what lets it be a squared length.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShapes(),
      caption:'The two ways of putting a row and a column together. A row on the left contracts to one number; a column on the left spreads into a matrix. The shapes decide which of the two happened, and they are the quickest check on a line of algebra.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|a\\rangle=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1\\\\ i\\end{bmatrix}$ and $|b\\rangle=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1\\\\ -i\\end{bmatrix}$.'],
        ['Method', 'Conjugate the entries of $|a\\rangle$, then multiply term by term and add.'],
        ['Work', '$\\langle a| = \\tfrac{1}{\\sqrt2}\\begin{bmatrix}1 & -i\\end{bmatrix}$, so $\\langle a|b\\rangle = \\tfrac12\\left[(1)(1) + (-i)(-i)\\right] = \\tfrac12\\left[1 - 1\\right]$.'],
        ['Answer', '$\\langle a|b\\rangle = 0$: the two states are orthogonal.'],
        ['Check', 'Both are normalised, $\\langle a|a\\rangle=\\tfrac12(1+1)=1$, so an overlap of zero is the smallest it could have been.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The mistake this scene exists to stop', html:'Leaving the conjugate out gives $\\tfrac12\\left[(1)(1)+(i)(-i)\\right]=\\tfrac12\\left[1+1\\right]=1$. That is not a small error: an overlap of one says the two states are <b>the same state</b>, where the truth is that they are perfectly distinguishable. In NumPy the conjugating product is <code>np.vdot(a, b)</code>; <code>np.dot(a, b)</code> is the version without it and will return the wrong number without complaint.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.1.3 -- */
{ id:'m1-overlap', module:'M1', nav:'Length and overlap', title:'Length, orthogonality and how alike two states are',
  objective:'Read the modulus of an inner product as a measure of similarity, bounded by Cauchy-Schwarz.',
  keywords:'norm length orthogonality cauchy schwarz overlap distinguishable states unit vector angle',
  src:'L2 · Cauchy-Schwarz and quantum overlaps', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'Length, orthogonality and how alike two states are'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The inner product of a state with itself gives its length, and the inner product of two different states says how alike they are:</p>'},
    {t:'eq', tex:'\\|a\\| = \\sqrt{\\langle a|a\\rangle}, \\qquad \\langle a|b\\rangle = 0 \\;\\Longleftrightarrow\\; \\text{orthogonal}'},
    {t:'body', html:'<p>The second is bounded. In any inner-product space the <b>Cauchy–Schwarz inequality</b> holds:</p>'},
    {t:'eq', key:true, tex:'|\\langle a|b\\rangle| \\le \\|a\\|\\,\\|b\\|'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>For two normalised states both lengths are one, so the squared modulus of the overlap lies in a closed interval:</p>'},
      {t:'eq', tex:'0 \\le |\\langle a|b\\rangle|^{2} \\le 1'},
      {t:'small', html:'The two ends have names. Zero means the states are <b>orthogonal</b> and a single measurement can tell them apart with certainty. One means they are the same state up to a phase on the whole vector, and no measurement can tell them apart at all.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOverlap(),
      caption:'The overlap of $|0\\rangle$ with the family $|\\psi(\\theta)\\rangle=\\cos(\\theta/2)|0\\rangle+\\sin(\\theta/2)|1\\rangle$. The three marks are $\\theta=0$, where the states coincide; $\\theta=\\pi/2$, where the squared overlap is one half; and $\\theta=\\pi$, where they are orthogonal. The half angle is the first sighting of a factor Chapter 4 explains.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|\\psi(\\theta)\\rangle = \\cos(\\theta/2)|0\\rangle+\\sin(\\theta/2)|1\\rangle$, all coefficients real.'],
        ['Work', '$\\langle 0|\\psi(\\theta)\\rangle = \\cos(\\theta/2)$, so the squared overlap is $\\cos^{2}(\\theta/2)$.'],
        ['Answer', 'It is $1$ at $\\theta=0$, one half at $\\theta=\\pi/2$, and $0$ at $\\theta=\\pi$.'],
        ['Check', '$\\theta=\\pi$ gives $|\\psi\\rangle=|1\\rangle$, and $|1\\rangle$ is orthogonal to $|0\\rangle$ by construction.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What an overlap of one half does not mean', html:'It does not mean the two states can be told apart half the time by any sensible procedure. Turning an overlap into a probability of a correct guess needs a measurement rule and a strategy, and both belong to Chapter 2. Here the overlap is a geometric quantity: the cosine of an angle, nothing more.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.1.4 -- */
{ id:'m1-basis', module:'M1', nav:'Orthonormal bases', title:'An orthonormal basis, and reading the coefficients off',
  objective:'Derive the expansion coefficient as an inner product and see that coefficients are basis dependent.',
  keywords:'orthonormal basis kronecker delta expansion coefficients change of basis completeness dimension',
  src:'L2 · dimension and bases', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Vectors, dual vectors and the inner product'},
  {t:'title', text:'An orthonormal basis, and reading the coefficients off'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A set $\\{|e_{1}\\rangle,\\ldots,|e_{n}\\rangle\\}$ is an <b>orthonormal basis</b> when its members are mutually orthogonal, each has length one, and they span the space:</p>'},
    {t:'eq', tex:'\\langle e_{i}|e_{j}\\rangle = \\delta_{ij}'},
    {t:'body', html:'<p>Every vector then has one expansion in that basis, $|v\\rangle=\\sum_{i} v_{i}|e_{i}\\rangle$. The coefficients are not guessed; they are computed. Apply the bra $\\langle e_{j}|$ to both sides:</p>'},
    {t:'eq', tex:'\\langle e_{j}|v\\rangle = \\sum_{i} v_{i}\\,\\langle e_{j}|e_{i}\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Orthonormality kills every term of the sum but one, the term with $i=j$:</p>'},
      {t:'eq', key:true, tex:'v_{j} = \\langle e_{j}|v\\rangle'},
      {t:'small', html:'That single line is used constantly and is worth naming: <b>a coefficient is an inner product with the corresponding basis vector</b>. It is why the basis is chosen orthonormal in the first place, and it fails as soon as the basis is not.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figBasis(),
      caption:'The state $|0\\rangle$, read off in two bases. In the computational basis the two coefficients are $1$ and $0$; in the $X$ basis they are both $1/\\sqrt2$. The state did not change between the two readings.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The state $|0\\rangle$, and the basis $|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$.'],
        ['Method', 'One inner product per basis vector.'],
        ['Work', '$\\langle +|0\\rangle=\\tfrac{1}{\\sqrt2}$ and $\\langle -|0\\rangle=\\tfrac{1}{\\sqrt2}$.'],
        ['Answer', '$|0\\rangle = \\tfrac{1}{\\sqrt2}|+\\rangle + \\tfrac{1}{\\sqrt2}|-\\rangle$.'],
        ['Check', 'The squared coefficients add to $\\tfrac12+\\tfrac12=1$, as they must for any orthonormal basis.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'The state is not its coordinates', html:'A definite state in one basis is an even superposition in another. Neither reading is more true than the other, and the word "superposition" is therefore incomplete on its own: a state is a superposition <b>with respect to a named basis</b>. Chapter 2 makes the basis physical by attaching it to a measuring device.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.2.1 -- */
{ id:'m1-amp', module:'M1', nav:'Modulus and phase', title:'What a complex amplitude carries: a size and an angle',
  objective:'Split a complex amplitude into modulus and phase and compute both without losing the quadrant.',
  keywords:'complex number modulus phase argument euler formula conjugate polar form atan2 amplitude',
  src:'L3 · complex numbers', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Amplitude, phase and interference'},
  {t:'title', text:'What a complex amplitude carries: a size and an angle'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>An amplitude is one complex number, and it carries two real ones. In Cartesian form it is a real part and an imaginary part; in polar form it is a size and an angle:</p>'},
    {t:'eq', tex:'z = x + iy = r\\,e^{i\\varphi}, \\qquad r=|z|=\\sqrt{x^{2}+y^{2}}'},
    {t:'body', html:'<p>The bridge between the two forms is Euler\u2019s formula, $e^{i\\varphi}=\\cos\\varphi+i\\sin\\varphi$. The size is recovered from the conjugate:</p>'},
    {t:'eq', tex:'zz^{*} = (x+iy)(x-iy) = x^{2}+y^{2} = |z|^{2}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Every probability in this course is a $|z|^{2}$, and every interference effect is a difference of two $\\varphi$. That division of labour is worth fixing now:</p>'},
      {t:'note', kind:'def', head:'Which part does what', html:'The <b>modulus</b> becomes a probability, through the Born rule of Chapter 2. The <b>phase</b> never becomes a probability on its own, and only ever acts by being added to or subtracted from another phase. An amplitude with no partner to interfere with has a phase that no experiment can see.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figComplex(),
      caption:'A complex number, its modulus $r$, its phase $\\varphi$, and its conjugate. Conjugation is a reflection in the real axis. It is not a rotation by $\\pi$, which would send $z$ to $-z$ instead.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$z = -1 + i$.'],
        ['Method', 'Modulus from $\\sqrt{x^{2}+y^{2}}$, phase from the quadrant the point is actually in.'],
        ['Work', '$r=\\sqrt{1+1}=\\sqrt2$. The point is up and to the left, so the phase is in the second quadrant.'],
        ['Answer', '$z=\\sqrt2\\,e^{i3\\pi/4}$.'],
        ['Check', '$\\sqrt2\\cos(3\\pi/4)=-1$ and $\\sqrt2\\sin(3\\pi/4)=+1$, which is the $z$ we started with.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Where the phase gets lost', html:'Computing the phase as $\\arctan(y/x)$ gives $\\arctan(-1)=-\\pi/4$ here, which is the wrong quadrant and points at $1-i$ rather than $-1+i$. The function that keeps the quadrant takes the two arguments separately: $\\operatorname{atan2}(y,x)$, which is <code>np.angle</code> in NumPy. It also survives $x=0$, where the ratio does not exist at all.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.2.2 -- */
{ id:'m1-phase', module:'M1', nav:'Global and relative phase', title:'A global phase is invisible; a relative phase is everything',
  objective:'Show that a phase on the whole state changes no probability, and that a phase between two terms changes them all.',
  keywords:'global phase relative phase interference hadamard plus minus indistinguishable equivalence class',
  src:'L3 · global phase, relative phase and interference', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · Amplitude, phase and interference'},
  {t:'title', text:'A global phase is invisible; a relative phase is everything'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Multiply a whole state by a phase and ask what changes. Take any other state $|\\phi\\rangle$ and form the overlap:</p>'},
    {t:'eq', tex:'\\left|\\langle\\phi|\\,e^{i\\gamma}\\psi\\rangle\\right|^{2} = \\left|e^{i\\gamma}\\right|^{2}\\left|\\langle\\phi|\\psi\\rangle\\right|^{2} = \\left|\\langle\\phi|\\psi\\rangle\\right|^{2}'},
    {t:'body', html:'<p>Nothing changes, because $|e^{i\\gamma}|=1$. Every number an experiment can produce is of this form, so the two columns describe one physical state:</p>'},
    {t:'eq', key:true, tex:'e^{i\\gamma}|\\psi\\rangle \\;\\equiv\\; |\\psi\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Now put the phase on one term only, and compare the two states</p>'},
      {t:'eq', tex:'|+\\rangle = \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right), \\qquad |-\\rangle = \\tfrac{1}{\\sqrt2}\\left(|0\\rangle-|1\\rangle\\right)'},
      {t:'small', html:'The minus sign is a relative phase of $\\pi$. Both states give $|{\\pm}\\tfrac{1}{\\sqrt2}|^{2}=\\tfrac12$ for each computational outcome, so a measurement in that basis cannot tell them apart.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<p>Apply a Hadamard, which sends $|0\\rangle\\mapsto(|0\\rangle+|1\\rangle)/\\sqrt2$ and $|1\\rangle\\mapsto(|0\\rangle-|1\\rangle)/\\sqrt2$, and collect terms:</p>'},
      {t:'eq', tex:'\\begin{aligned} H|+\\rangle &= \\tfrac12\\left(|0\\rangle+|1\\rangle\\right)+\\tfrac12\\left(|0\\rangle-|1\\rangle\\right) = |0\\rangle \\\\ H|-\\rangle &= \\tfrac12\\left(|0\\rangle+|1\\rangle\\right)-\\tfrac12\\left(|0\\rangle-|1\\rangle\\right) = |1\\rangle \\end{aligned}'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figPhaseBars(),
      caption:'After one Hadamard, the two states of the derivation give opposite certain answers. Before the gate both gave one half and one half on each outcome, which is why the figure shows only the half of the story that the relative phase decides.'},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The rule to carry forward', html:'A phase on the <b>whole</b> state can always be dropped. A phase <b>between two terms</b> can never be dropped. Interference is the only mechanism any algorithm in this course has, and interference is entirely a statement about relative phase.'}
    ]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'And the trap inside that rule', html:'A phase that is global for one qubit stops being global as soon as that qubit is one branch of a larger superposition. Writing $|0\\rangle(e^{i\\varphi}|\\psi\\rangle) + |1\\rangle|\\psi\\rangle$ and cancelling the $e^{i\\varphi}$ as "just a global phase" changes the state. Chapter 6 builds its whole mechanism, phase kickback, out of exactly this.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.L1 --- */
{ id:'m1-lab-a', module:'M1', nav:'Laboratory A', title:'Laboratory A · The relative-phase interferometer',
  objective:'Let the reader move a global phase and a relative phase and watch only one of them do anything.',
  keywords:'laboratory interferometer relative phase global phase hadamard probabilities amplitudes interactive',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Amplitude, phase and interference'},
  {t:'title', text:'Laboratory A · The relative-phase interferometer'},
  {t:'body', html:'<p>The state is $|\\psi\\rangle = e^{i\\gamma}\\left[\\cos(\\theta/2)|0\\rangle + e^{i\\varphi}\\sin(\\theta/2)|1\\rangle\\right]$. Three controls set the mixing angle $\\theta$, the relative phase $\\varphi$ and the global phase $\\gamma$. The left plot draws the two amplitudes in the complex plane; the right one gives the outcome probabilities in the computational basis and in the $X$ basis, which is the basis a Hadamard measures in.</p>'},
  {t:'small', html:'One of the three controls changes nothing at all, and finding out which is the exercise. Move each one in turn and watch the two probability panels rather than the arrows.'},
  {t:'lab', id:'A'}
]},

/* ---------------------------------------------------------------- 1.3.1 -- */
{ id:'m1-outer', module:'M1', nav:'The outer product', title:'A ket beside a bra is an operator',
  objective:'Build an operator from two states and tell the outer product apart from the inner and tensor products.',
  keywords:'outer product operator matrix unit dyad column times row rank one shapes',
  src:'L2 · outer products are not tensor products', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'A ket beside a bra is an operator'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Reverse the order of the row and the column. A column on the left of a row does not contract; it spreads into a square array, and that array is an operator:</p>'},
    {t:'eq', key:true, tex:'|a\\rangle\\langle b| = |a\\rangle\\,|b\\rangle^{\\dagger}, \\qquad \\left(|a\\rangle\\langle b|\\right)_{jk} = a_{j}\\,b_{k}^{*}'},
    {t:'body', html:'<p>This is the one construction that turns states into the things that act on states, and it is the reason a course can be written entirely in kets and bras without ever writing a matrix down.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>What it does is easy to read. Feed it a ket and the bra eats that ket first, leaving a number times $|a\\rangle$:</p>'},
      {t:'eq', tex:'\\left(|a\\rangle\\langle b|\\right)|v\\rangle = |a\\rangle\\,\\langle b|v\\rangle = \\langle b|v\\rangle\\,|a\\rangle'},
      {t:'small', html:'So every outer product sends the whole space onto one line, the line through $|a\\rangle$. It has rank one, and the number it multiplies by is the overlap of the input with $|b\\rangle$.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|0\\rangle=\\begin{bmatrix}1\\\\0\\end{bmatrix}$ and $|1\\rangle=\\begin{bmatrix}0\\\\1\\end{bmatrix}$.'],
        ['Method', 'Write the column, write the conjugated row, and multiply.'],
        ['Work', '$|0\\rangle\\langle 1| = \\begin{bmatrix}1\\\\0\\end{bmatrix}\\begin{bmatrix}0&1\\end{bmatrix}$.'],
        ['Answer', '$|0\\rangle\\langle 1| = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}$, the operator that turns $|1\\rangle$ into $|0\\rangle$ and kills $|0\\rangle$.'],
        ['Check', 'Its square is the zero matrix, which is right: it sends everything to the $|0\\rangle$ line, and it then kills $|0\\rangle$.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Three products, three shapes', html:'$\\langle a|b\\rangle$ is a <b>number</b>. $|a\\rangle\\langle b|$ is an $n\\times n$ <b>operator</b>. $|a\\rangle\\otimes|b\\rangle$, which is the next section, is a longer <b>column</b> of length $n^{2}$. They are built from the same two arrays and they are not interchangeable, so when a line of algebra will not typecheck, the shapes are the first thing to count.'}
    ]},
    {t:'note', kind:'def', head:'Order matters here too', html:'$|a\\rangle\\langle b|$ and $|b\\rangle\\langle a|$ are different operators: one is the adjoint of the other, $\\left(|a\\rangle\\langle b|\\right)^{\\dagger}=|b\\rangle\\langle a|$. They are equal only when $|a\\rangle$ and $|b\\rangle$ are the same state up to a phase, which is the case the next scene is about.'}
  ]}
]},

/* ---------------------------------------------------------------- 1.3.2 -- */
{ id:'m1-proj', module:'M1', nav:'Projectors', title:'The projector, and the part of a state it keeps',
  objective:'Define a rank-one projector, verify idempotence, and split a state into a kept and a discarded part.',
  keywords:'projector idempotent hermitian rank one complement subspace component parallel orthogonal',
  src:'L2 · projectors and the resolution of identity', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'The projector, and the part of a state it keeps'},
  {t:'cols', ratio:'c-7-5', vcenter:true, left:[
    {t:'body', html:'<p>Take the outer product of a normalised state with itself. The result is called a <b>projector</b>:</p>'},
    {t:'eq', key:true, tex:'P_{u} = |u\\rangle\\langle u|, \\qquad \\langle u|u\\rangle = 1'},
    {t:'body', html:'<p>It has two properties and both are one line. It is its own adjoint, because reversing an outer product swaps two copies of the same state; and applying it twice is the same as applying it once:</p>'},
    {t:'eq', tex:'P_{u}^{2} = |u\\rangle\\underbrace{\\langle u|u\\rangle}_{=\\,1}\\langle u| = P_{u}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'An operator with $P^{2}=P$ can only have eigenvalues $0$ and $1$, since $\\lambda^{2}=\\lambda$. Those two numbers are "kept" and "discarded", and in Chapter 2 they become the two things a measurement can report.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figProject(),
      caption:'A state split into the part along $|u\\rangle$ and the part orthogonal to it. The two pieces are $P|v\\rangle$ and $(I-P)|v\\rangle$, they meet at a right angle, and they add back to $|v\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$|u\\rangle=|+\\rangle$ and $|v\\rangle=|0\\rangle$.'],
        ['Work', '$\\langle +|0\\rangle = 1/\\sqrt2$, so $P|0\\rangle = \\tfrac{1}{\\sqrt2}|+\\rangle = \\tfrac12\\left(|0\\rangle+|1\\rangle\\right)$, of length $1/\\sqrt2$.'],
        ['Check', 'The discarded part is $(I-P)|0\\rangle=\\tfrac{1}{\\sqrt2}|-\\rangle$, orthogonal to it because $\\langle+|-\\rangle=0$.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A projector does not preserve length', html:'The output has length $1/\\sqrt2$, not $1$, and that is not an arithmetic slip: the lost length is exactly the probability of the other outcome. Renormalising is a separate step, and Chapter 2 says when it is taken.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.3.3 -- */
{ id:'m1-resid', module:'M1', nav:'Resolving the identity', title:'The projectors of a basis add to the identity',
  objective:'State the completeness relation and use inserting it as a named derivation step.',
  keywords:'resolution of identity completeness relation basis expansion insert identity sum of projectors',
  src:'L2 · projectors and the resolution of identity', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Outer products and projectors'},
  {t:'title', text:'The projectors of a basis add to the identity'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Take one projector for each vector of an orthonormal basis and add them. Nothing has been thrown away, so nothing has changed:</p>'},
    {t:'eq', key:true, tex:'\\sum_{k} |e_{k}\\rangle\\langle e_{k}| = I'},
    {t:'body', html:'<p>This is the <b>resolution of the identity</b>, and it is used as a move rather than as a fact. Inserting it turns a statement about a vector into a statement about its coefficients, without any guessing. Start with a triviality and insert it:</p>'},
    {t:'eq', tex:'|v\\rangle = I|v\\rangle = \\sum_{k}|e_{k}\\rangle\\langle e_{k}|v\\rangle = \\sum_{k}\\langle e_{k}|v\\rangle\\,|e_{k}\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The basis expansion of the previous scene has just been <b>derived</b> rather than assumed, and in one line. That is the pattern: wherever a sum over basis states is wanted and is not there, the identity is what puts it there.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figResolve(),
      caption:'One vector, resolved by the identity. Each dashed guide is one inner product $\\langle e_{k}|v\\rangle$, and each solid piece is that number multiplying its own basis vector. The pieces add back to the vector exactly.'},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<p>The same move works between two bras, and it is how an inner product becomes a sum:</p>'},
      {t:'eq', tex:'\\langle a|b\\rangle = \\langle a|I|b\\rangle = \\sum_{k}\\langle a|e_{k}\\rangle\\langle e_{k}|b\\rangle'},
      {t:'small', html:'With the computational basis this reproduces $\\sum_{k}a_{k}^{*}b_{k}$, which is where the definition came from. With any other basis it gives the same number computed a different way, and that freedom is the point.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Name the move', html:'When a derivation in this course says <b>insert the resolution of the identity</b>, this is the step being taken, and the only decision is which basis to insert. Choose the basis in which one of the objects in the expression is simple, and the sum usually collapses.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.4.1 -- */
{ id:'m1-gs', module:'M1', nav:'Gram-Schmidt', title:'Gram-Schmidt: making an orthonormal basis out of what you have',
  objective:'Run the Gram-Schmidt recursion by hand and say what makes it fail numerically.',
  keywords:'gram schmidt orthonormalisation qr factorisation projection subtract normalise conditioning stability',
  src:'L2 · constructing an orthonormal basis', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Building an orthonormal basis'},
  {t:'title', text:'Gram-Schmidt: making an orthonormal basis out of what you have'},
  {t:'cols', ratio:'c-7-5', vcenter:true, left:[
    {t:'body', html:'<p>Given independent vectors $v_{1},\\ldots,v_{k}$, the <b>Gram–Schmidt procedure</b> produces an orthonormal set spanning the same space. Each step removes from the next vector everything that already lies along the vectors already built, then divides by the length of what is left:</p>'},
    {t:'eq', key:true, tex:'u_{j} = v_{j} - \\sum_{i<j}\\langle e_{i}|v_{j}\\rangle\\,e_{i}, \\qquad e_{j} = \\frac{u_{j}}{\\|u_{j}\\|}'},
    {t:'body', html:'<p>The subtraction is the whole idea, and the picture beside it is the whole proof: what is left after removing the component along $e_{1}$ has no component along $e_{1}$, so it is orthogonal to it.</p>'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Given', '$v_{1}=(1,1)$ and $v_{2}=(1,0)$, real.'],
        ['Step 1', '$\\|v_{1}\\|=\\sqrt2$, so $e_{1}=\\tfrac{1}{\\sqrt2}(1,1)$.'],
        ['Step 2', '$\\langle e_{1}|v_{2}\\rangle = \\tfrac{1}{\\sqrt2}$, so $u_{2}=(1,0)-\\tfrac12(1,1)=(\\tfrac12,-\\tfrac12)$, of length $\\tfrac{1}{\\sqrt2}$, and $e_{2}=\\tfrac{1}{\\sqrt2}(1,-1)$.'],
        ['Check', '$\\langle e_{1}|e_{2}\\rangle = \\tfrac12(1-1)=0$ and both have length one. The pair is $|+\\rangle$ and $|-\\rangle$ in disguise.']
      ]}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figGram(),
      caption:'One step of the procedure. The amber arrow is the part of $v_{2}$ that already lies along $e_{1}$; removing it leaves $u_{2}$, which is at a right angle to $e_{1}$ by construction and only has to be scaled to length one.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Where it breaks on a computer', html:'If two input vectors are nearly parallel the subtraction cancels almost everything, and $u_{j}$ is a small difference of large numbers. Rounding error, negligible in the inputs, is then a large fraction of the result, and the "orthonormal" vectors come out neither orthogonal nor normal. Laboratory B is this failure, driven by the reader.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What is used instead', html:'A QR factorisation computes the same span by a different arithmetic route and loses far less; in NumPy that is <code>np.linalg.qr</code>. Gram–Schmidt stays the right thing to know because it says <b>what</b> is computed; QR is the right thing to run because it says how.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.L2 --- */
{ id:'m1-lab-b', module:'M1', nav:'Laboratory B', title:'Laboratory B · Gram-Schmidt, one step at a time',
  objective:'Let the reader choose three vectors, step the orthogonalisation, and drive it to failure.',
  keywords:'laboratory gram schmidt orthonormalisation steps conditioning near dependent modified stability',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Building an orthonormal basis'},
  {t:'title', text:'Laboratory B · Gram-Schmidt, one step at a time'},
  {t:'small', html:'Three vectors in space. One control sets the angle between the first two, one sets the height of the third above their plane, both over nine decades. The step control runs the recursion one vector at a time: amber is the piece being removed, green is the orthonormal set so far. The right-hand plot counts how many digits of $\\langle e_{i}|e_{j}\\rangle=\\delta_{ij}$ survive, for the recursion of the last scene and for the <b>modified</b> one, which subtracts each projection from what is left rather than from the original vector. Bring both controls down together and watch the two part company.'},
  {t:'lab', id:'B'}
]},

/* ---------------------------------------------------------------- 1.5.1 -- */
{ id:'m1-tensor', module:'M1', nav:'The tensor product', title:'Two systems make one, and the dimensions multiply',
  objective:'Form a tensor product of columns and of matrices, under the bit order this course fixes.',
  keywords:'tensor product kronecker composite system dimension multiply bit order qubit register basis strings',
  src:'L2 · tensor products', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · The tensor product'},
  {t:'title', text:'Two systems make one, and the dimensions multiply'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Two separate systems are described by one state, and the construction that builds it is the <b>tensor product</b>. For two columns it is every product of an entry of the first with an entry of the second:</p>'},
    {t:'eq', key:true, tex:'\\begin{bmatrix}a_{1}\\\\a_{2}\\end{bmatrix}\\otimes\\begin{bmatrix}b_{1}\\\\b_{2}\\end{bmatrix} = \\begin{bmatrix}a_{1}b_{1}\\\\a_{1}b_{2}\\\\a_{2}b_{1}\\\\a_{2}b_{2}\\end{bmatrix}'},
    {t:'body', html:'<p>Two qubits are therefore described by four numbers and not by two plus two. For matrices the rule is the same one block by block: $A\\otimes B$ has the block $A_{ij}B$ in position $(i,j)$.</p>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The convention that fails silently', html:'This course writes a register as $|q_{n-1}\\ldots q_{1}q_{0}\\rangle$, and entry $x$ of the column is the amplitude of $|x\\rangle$ read as a binary number. So $|01\\rangle$ means $q_{1}=0$, $q_{0}=1$, and it is entry $1$. Courses that count the other way write the same symbols and mean a different state. Nothing looks wrong when the two are mixed; every number afterwards is simply another problem’s answer.'}
    ]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Qubit $1$ in $|0\\rangle$ and qubit $0$ in $|1\\rangle$.'],
        ['Method', 'Order the factors $q_{1}\\otimes q_{0}$ and expand.'],
        ['Work', '$(1,0)\\otimes(0,1) = (1\\cdot 0,\\;1\\cdot 1,\\;0\\cdot 0,\\;0\\cdot 1)$.'],
        ['Answer', '$(0,1,0,0)$, which is $|01\\rangle$: the amplitude sits in entry $1$.'],
        ['Check', 'Binary $01$ is the number $1$, and entry $1$ is the one that is non-zero.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'body', html:'<p>The same product applies to operators. Acting with $X$ on both qubits at once is one $4\\times4$ matrix:</p>'},
      {t:'eq', tex:'X\\otimes X = \\begin{bmatrix}0&0&0&1\\\\0&0&1&0\\\\0&1&0&0\\\\1&0&0&0\\end{bmatrix}'}
    ]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'Not every joint state is a product', html:'Every $|a\\rangle\\otimes|b\\rangle$ is a legal two-qubit state, but the reverse fails: most four-entry columns cannot be written that way. Those that cannot are the entangled ones, and they are the subject of Chapter 3. The tensor product is what makes room for them; it does not produce them by itself.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.5.2 -- */
{ id:'m1-expo', module:'M1', nav:'Where the exponential comes from', title:'Where the exponential comes from, and what it does not buy',
  objective:'Derive the 2^n dimension from the tensor product and separate size from advantage.',
  keywords:'exponential dimension two to the n state space size readout n bits advantage structure scaling',
  src:'L2 · tensor products', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · The tensor product'},
  {t:'title', text:'Where the exponential comes from, and what it does not buy'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The tensor product multiplies dimensions. One qubit has dimension two, so adding a qubit doubles the space, and $n$ of them give</p>'},
    {t:'eq', key:true, tex:'\\dim\\left(\\mathbb{C}^{2}\\right)^{\\otimes n} = 2^{n}'},
    {t:'body', html:'<p>That is the entire origin of the exponential this subject is famous for. It is not a physical postulate, it is not an assumption about speed, and it is not special to quantum mechanics: it is what "combine two systems" means, applied $n$ times.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'At $n=10$ the column has $1024$ entries. At $n=50$ it has about $1.13\\times10^{15}$, which is more numbers than a large classical machine can hold. At $n=300$ it has more entries than there are atoms in the observable universe, and the register still fits on a bench.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'What the reading out costs', html:'A measurement of $n$ qubits returns $n$ bits. Not $2^{n}$ amplitudes, and not a summary of them: one string. Holding many amplitudes is therefore worth nothing on its own, and an algorithm has to make the unwanted amplitudes cancel <b>before</b> the readout. That is the first of the three sentences this course exists to install.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figTree(),
      caption:'Why the count doubles. Each new qubit gives every basis string of the register two continuations rather than one, so the number of strings goes $1, 2, 4, 8$ and the amplitude column grows with it.'},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'And what the size does not prove', html:'A large state space does not prove the physics is hard to simulate. Classical methods use locality, symmetry, sparsity, low entanglement and stabilizer structure, and a great many quantum states fall to one of them. The dimension is a fact about a <b>generic dense description</b>. It is a reason the problem might be interesting, never a proof that it is.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.1 -- */
{ id:'m1-adjoint', module:'M1', nav:'The adjoint', title:'The adjoint, and how to take one without losing a conjugate',
  objective:'Form the adjoint of an operator, test a matrix for Hermiticity, and apply the order-reversal rule.',
  keywords:'adjoint dagger conjugate transpose hermitian test order reversal product numpy conj',
  src:'L3 · Hermitian matrices', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'The adjoint, and how to take one without losing a conjugate'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The <b>adjoint</b> of an operator is its conjugate transpose. It is the same operation that turned a ket into a bra, applied to a square array instead of a column:</p>'},
    {t:'eq', key:true, tex:'A^{\\dagger} = \\left(A^{*}\\right)^{T}, \\qquad \\left(A^{\\dagger}\\right)_{jk} = A_{kj}^{*}'},
    {t:'body', html:'<p>Two things happen and both are needed. Every entry is conjugated, and every entry is moved across the diagonal. In NumPy that is <code>A.conj().T</code>; <code>A.T</code> alone is the real-valued version and drops the conjugation without warning.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>An operator that equals its own adjoint is called <b>Hermitian</b>:</p>'},
      {t:'eq', key:true, tex:'A = A^{\\dagger}'},
      {t:'small', html:'The diagonal entries of such an operator satisfy $A_{jj}=A_{jj}^{*}$ and are therefore real, and the off-diagonal entries come in conjugate pairs. Both are visible at a glance and are the fastest first check.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figAdjoint(),
      caption:'The adjoint as the two steps it is made of. Doing only the transpose, or only the conjugation, produces a well-formed matrix that is not the adjoint, and nothing later in a calculation announces the error.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$C=\\begin{bmatrix}1&i\\\\-i&1\\end{bmatrix}$.'],
        ['Work', 'Conjugating gives $\\begin{bmatrix}1&-i\\\\i&1\\end{bmatrix}$; transposing that gives $\\begin{bmatrix}1&i\\\\-i&1\\end{bmatrix}$.'],
        ['Answer', '$C^{\\dagger}=C$, so $C$ is Hermitian.'],
        ['Check', 'Its diagonal is real and its off-diagonal pair is $i$ and $-i$, which are conjugates. Both signs of Hermiticity are present.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The adjoint reverses a product', html:'$(AB)^{\\dagger}=B^{\\dagger}A^{\\dagger}$, exactly as the transpose does. One consequence is worth storing now: a product of two Hermitian operators is Hermitian only when they commute, since $(AB)^{\\dagger}=B^{\\dagger}A^{\\dagger}=BA$, and that equals $AB$ only if the two commute. This is the first place the commutator of Chapter 2 makes itself felt.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.2 -- */
{ id:'m1-herm', module:'M1', nav:'Why observables are Hermitian', title:'A Hermitian operator has real eigenvalues',
  objective:'Prove that Hermiticity forces real eigenvalues and say why an observable therefore has to be Hermitian.',
  keywords:'hermitian real eigenvalues proof observable measurement outcomes orthonormal eigenbasis spectrum',
  src:'L3 · Hermitian matrices', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'A Hermitian operator has real eigenvalues'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The proof is three lines and it is worth following, because it is the reason the whole course insists on Hermiticity. Let $A|v\\rangle=\\lambda|v\\rangle$ with $|v\\rangle$ normalised, and compute the number $\\langle v|A|v\\rangle$ twice.</p>'},
    {t:'body', html:'<p>Let the operator act to the right, on the ket:</p>'},
    {t:'eq', tex:'\\langle v|A|v\\rangle = \\langle v|\\lambda v\\rangle = \\lambda\\,\\langle v|v\\rangle = \\lambda'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Now let it act to the left instead. Moving an operator onto the bra turns it into its adjoint, and $A^{\\dagger}=A$, so the same $A$ arrives there. The bra conjugates whatever it meets, so $\\lambda$ becomes $\\lambda^{*}$:</p>'},
      {t:'eq', tex:'\\langle v|A|v\\rangle = \\langle A v|v\\rangle = \\lambda^{*}\\,\\langle v|v\\rangle = \\lambda^{*}'},
      {t:'body', html:'<p>One number, computed two ways, so the two answers agree:</p>'},
      {t:'eq', key:true, tex:'\\lambda = \\lambda^{*} \\quad\\Longrightarrow\\quad \\lambda \\in \\mathbb{R}'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figSpectrum(),
      caption:'Where eigenvalues are allowed to sit. The rotation $\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ has eigenvalues $\\pm i$, off the axis. The Hermitian $\\begin{bmatrix}1&i\\\\-i&1\\end{bmatrix}$ has $0$ and $2$, on it. Only the second can be a list of laboratory readings.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'This is the whole reason observables are Hermitian', html:'A measuring instrument reports a real number. An operator whose job is to carry the list of readings that instrument can produce must therefore have real eigenvalues, and Hermiticity is the condition that guarantees it.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'And the second half of the theorem', html:'Hermiticity also gives an orthonormal basis of eigenvectors, and eigenvectors belonging to different eigenvalues are orthogonal. That is what makes two different readings perfectly distinguishable, and it is what the spectral theorem two scenes from here is built on.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.2 -- */
{ id:'m1-unit', module:'M1', nav:'Unitary operators', title:'Unitary operators preserve every inner product',
  objective:'Derive the unitarity condition from the requirement that overlaps are preserved.',
  keywords:'unitary inner product preserved norm reversible gate adjoint inverse orthonormal columns',
  src:'L3 · unitary operators', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'Unitary operators preserve every inner product'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Ask for the operators that leave every overlap alone, and the condition writes itself. Apply $U$ to both arguments and move one copy across the inner product:</p>'},
    {t:'eq', tex:'\\langle Ua|Ub\\rangle = (Ua)^{\\dagger}(Ub) = a^{\\dagger}U^{\\dagger}U\\,b = \\langle a|U^{\\dagger}U|b\\rangle'},
    {t:'body', html:'<p>For this to equal $\\langle a|b\\rangle$ for <b>every</b> pair of vectors, the operator in the middle must be the identity:</p>'},
    {t:'eq', key:true, tex:'U^{\\dagger}U = I \\qquad\\Longleftrightarrow\\qquad U^{-1}=U^{\\dagger}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Three consequences follow at once. Lengths are preserved, so a normalised state stays normalised and the probabilities of Chapter 2 keep adding to one. The operator is invertible, so the evolution is reversible. And the columns of $U$ are an orthonormal basis, which is what $U^{\\dagger}U=I$ says entry by entry.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figUnitCircle(),
      caption:'What unitarity is, drawn as what it preserves. The teal circle is every state of unit length. A unitary sends that set to itself; a map that is merely invertible sends it to the dashed ellipse, and states that started normalised no longer are.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$H=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}$.'],
        ['Work', 'Every entry is real and the matrix is symmetric, so $H^{\\dagger}=H$ and the product to check is $H^{2}$.'],
        ['Answer', '$H^{2}=I$, so $H$ is unitary — and it is its own inverse.'],
        ['Check', 'Its columns are $|+\\rangle$ and $|-\\rangle$: orthonormal, as the condition requires.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A determinant of modulus one is not enough', html:'The matrix $\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ has determinant $1$ and is invertible, and it is not unitary: it sends $(0,1)$ to $(1,1)$, whose length is $\\sqrt2$. Unitarity is a statement about every vector, and the only way to test it is $U^{\\dagger}U=I$.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.3 -- */
{ id:'m1-gen', module:'M1', nav:'Hermitian generators', title:'A Hermitian generator makes a family of unitaries',
  objective:'Show that the exponential of a Hermitian operator is unitary and derive its closed form for a Pauli.',
  keywords:'generator exponential unitary family pauli series even odd terms closed form cosine sine',
  src:'L3 · Hermitian generators produce unitary transformations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'A Hermitian generator makes a family of unitaries'},
  {t:'lede', text:'The two kinds of operator this course needs are joined by one construction. Feed a Hermitian operator to an exponential and a unitary comes out, one for every value of a real parameter.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>If $G$ is Hermitian and $\\theta$ is real, then</p>'},
    {t:'eq', key:true, tex:'U(\\theta) = e^{-i\\theta G} \\quad\\text{is unitary}'},
    {t:'body', html:'<p>The check is one line. The adjoint of an exponential is the exponential of the adjoint, and the $-i$ picks up a sign, so $U^{\\dagger}=e^{+i\\theta G^{\\dagger}}=e^{+i\\theta G}$. The two exponentials share a generator, so their exponents add:</p>'},
    {t:'eq', tex:'U^{\\dagger}U = e^{+i\\theta G}\\,e^{-i\\theta G} = e^{0} = I'},
    {t:'small', html:'The step that adds the exponents is legal only because the two operators commute, which they do here since both are functions of the same $G$. For two different generators it fails, and that failure is why gate sequences do not simplify the way a reader expects.'}
  ], right:[
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>For a Pauli operator the exponential closes in two terms. Use $\\sigma^{2}=I$, which makes every even power the identity and every odd power $\\sigma$ again, and split the series accordingly:</p>'},
      {t:'eq', tex:'e^{-i\\theta\\sigma/2} = \\sum_{m\\ \\mathrm{even}} \\frac{(-i\\theta/2)^{m}}{m!}\\,I \\;+\\; \\sum_{m\\ \\mathrm{odd}} \\frac{(-i\\theta/2)^{m}}{m!}\\,\\sigma'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<p>The two sums are the series for a cosine and for a sine, with the argument halved by the $\\tfrac12$ in the exponent:</p>'},
      {t:'eq', key:true, tex:'e^{-i\\theta\\sigma/2} = \\cos\\!\\left(\\tfrac{\\theta}{2}\\right) I \\;-\\; i\\sin\\!\\left(\\tfrac{\\theta}{2}\\right)\\sigma'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Where this is going', html:'Chapter 2 will say that a closed system evolves as $U(t)=e^{-iHt}$ with $H$ the Hamiltonian. None of that is new mathematics: it is this scene, with $\\theta G$ replaced by $Ht$. What Chapter 2 adds is the claim that nature does it.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.6.5 -- */
{ id:'m1-halfangle', module:'M1', nav:'The half angle', title:'The half angle, and what a full turn leaves behind',
  objective:'Evaluate a Pauli rotation at a given angle and read the sign a full turn produces.',
  keywords:'half angle double cover full turn minus identity rotation rz worked example global phase period',
  src:'L3 · Hermitian generators produce unitary transformations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Hermitian and unitary operators'},
  {t:'title', text:'The half angle, and what a full turn leaves behind'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The angle inside the closed form is halved, so the operator repeats only after $\\theta$ has gone round twice. Set $\\theta=2\\pi$ and read it off: the cosine is $-1$, the sine is $0$, and</p>'},
    {t:'eq', key:true, tex:'e^{-i(2\\pi)\\sigma/2} = -I'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The half angle is not a typographic accident', html:'The operator has period $4\\pi$ while the physical state has period $2\\pi$. The two are consistent because the leftover $-1$ is a phase on the <b>whole</b> state, which the second scene of this chapter showed is not physical. So the state does come back after one full turn; the matrix that brought it back is not the identity. Chapter 4 gives this a picture and calls it the double cover.'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\sigma=Z=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}$ and $\\theta=\\pi/3$.'],
        ['Method', 'Substitute into the closed form; no series and no diagonalisation are needed.'],
        ['Work', '$\\cos(\\pi/6)=\\tfrac{\\sqrt3}{2}$ and $\\sin(\\pi/6)=\\tfrac12$.'],
        ['Answer', '$R_{z}(\\pi/3)=\\begin{bmatrix}e^{-i\\pi/6}&0\\\\0&e^{i\\pi/6}\\end{bmatrix}$.'],
        ['Check', 'Each diagonal entry has modulus one and the matrix is diagonal, so $U^{\\dagger}U=I$. The relative phase between the two entries is $\\pi/3$, which is the $\\theta$ that went in.']
      ]}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figHalfAngle(),
      caption:'The two coefficients over two full turns. At $\\theta=2\\pi$ the operator is $-I$ and at $\\theta=4\\pi$ it is the identity again, so the matrix takes twice as long to come home as the state it acts on.'},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Where the extra sign stops being harmless', html:'It is unobservable only while it is global. Apply the rotation to one branch of a larger superposition — one qubit of a controlled operation, for instance — and the $-1$ sits between two terms that will later interfere. Chapter 5 uses exactly that to build a controlled phase out of rotations, and a reader who dismissed the sign here will not be able to follow it.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.7.1 -- */
{ id:'m1-eig', module:'M1', nav:'Eigenvectors', title:'Eigenvectors: the directions an operator leaves alone',
  objective:'Solve a two-by-two eigenvalue problem and say what an eigenvector is determined up to.',
  keywords:'eigenvector eigenvalue characteristic polynomial invariant direction degeneracy eigh eig scale phase',
  src:'L3 · eigenvectors and eigenvalues', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'Eigenvectors: the directions an operator leaves alone'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Most vectors are turned by an operator. A few are not: they come back pointing the same way, scaled by a number. Those are its <b>eigenvectors</b>, and the numbers are its <b>eigenvalues</b>:</p>'},
    {t:'eq', key:true, tex:'A|v\\rangle = \\lambda|v\\rangle, \\qquad |v\\rangle \\ne 0'},
    {t:'body', html:'<p>Rearranged, $(A-\\lambda I)|v\\rangle=0$ has a non-zero solution only when the matrix in front is not invertible, which happens exactly when its determinant vanishes:</p>'},
    {t:'eq', tex:'\\det\\left(A-\\lambda I\\right) = 0'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Given', '$A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$.'],
        ['Method', 'Write the determinant condition, solve for $\\lambda$, then solve for each $|v\\rangle$.'],
        ['Work', '$(2-\\lambda)^{2}-1=0$, so $2-\\lambda=\\pm1$.'],
        ['Answer', '$\\lambda=3$ with $|v\\rangle\\propto(1,1)$, and $\\lambda=1$ with $|v\\rangle\\propto(1,-1)$.'],
        ['Check', '$A(1,1)=(3,3)$ and $A(1,-1)=(1,-1)$. The eigenvalues also add to the trace, $3+1=4=2+2$.']
      ]}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figEigen(),
      caption:'Teal arrows in, red arrows out. Every input leaves its own line except the two dashed directions: along one the operator stretches by three, along the other it does nothing at all.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'An eigenvector is a direction, not a vector', html:'If $|v\\rangle$ works then so does $c|v\\rangle$ for any non-zero complex $c$. Two conventions remove most of the freedom: normalise to length one, and then only a phase is left. For a quantum state that leftover phase is global and unobservable, so an eigenvector really is one physical state.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Which routine to call', html:'For a Hermitian matrix use <code>np.linalg.eigh</code>, which exploits the structure, returns real eigenvalues in order, and gives genuinely orthonormal eigenvectors. The general <code>np.linalg.eig</code> returns tiny imaginary parts on eigenvalues that are known in advance to be real, and eigenvectors that are not orthogonal to machine precision. Choosing the wrong one turns an exact statement into a numerical question.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.7.2 -- */
{ id:'m1-spectral', module:'M1', nav:'The spectral theorem', title:'The spectral theorem: eigenvalues, and the projectors that belong to them',
  objective:'Write a Hermitian operator as a weighted sum of projectors and verify the two properties they satisfy.',
  keywords:'spectral theorem decomposition projectors orthogonal eigenbasis diagonalisation weighted sum degeneracy',
  src:'L3 · the finite-dimensional spectral theorem', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'The spectral theorem: eigenvalues, and the projectors that belong to them'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A Hermitian operator has an orthonormal basis of eigenvectors. Take the projector onto each eigenspace and weight it by that eigenvalue:</p>'},
    {t:'eq', key:true, tex:'A = \\sum_{k}\\lambda_{k}P_{k}, \\qquad P_{k}=|v_{k}\\rangle\\langle v_{k}|'},
    {t:'body', html:'<p>The projectors that appear are not an arbitrary set. They are mutually annihilating, and together they resolve the identity:</p>'},
    {t:'eq', tex:'P_{j}P_{k} = \\delta_{jk}P_{k}, \\qquad \\sum_{k}P_{k} = I'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The second of these is the resolution of the identity again, now in the eigenbasis of a particular operator. Multiplying it by $A$ on the left and using $AP_{k}=\\lambda_{k}P_{k}$ is one way to derive the decomposition rather than assert it.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figSpectral(),
      caption:'An operator, taken apart. Each eigenvalue is a number and each projector is an operator, and the sum of the products is the operator back again. Nothing has been approximated; the two sides are equal.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$, with $\\lambda=3$ on $|+\\rangle$ and $\\lambda=1$ on $|-\\rangle$.'],
        ['Method', 'Build the two projectors, weight them, and add.'],
        ['Work', '$|+\\rangle\\langle+| = \\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$ and $|-\\rangle\\langle-| = \\tfrac12\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix}$.'],
        ['Answer', '$3\\cdot\\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix} + 1\\cdot\\tfrac12\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$.'],
        ['Check', 'The two projectors add to $\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$, and their product is the zero matrix, as $P_{j}P_{k}=\\delta_{jk}P_{k}$ requires.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'This is the shape of every measurement in Chapter 2', html:'A projective measurement of an observable $A$ has one outcome per eigenvalue $\\lambda_{k}$, and the projector $P_{k}$ decides both how likely that outcome is and what the state becomes afterwards. The decomposition above is not a computational trick; it is the statement of what an observable is.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.7.3 -- */
{ id:'m1-fofa', module:'M1', nav:'Functions of an operator', title:'A function of an operator acts on its eigenvalues',
  objective:'Evaluate a function of a Hermitian operator through its spectral decomposition.',
  keywords:'operator function exponential spectral eigenvalues matrix exponential not elementwise square root',
  src:'L3 · spectral projectors and functions of an operator', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · The spectral theorem and functions of an operator'},
  {t:'title', text:'A function of an operator acts on its eigenvalues'},
  {t:'cols', ratio:'c-7-5', vcenter:true, left:[
    {t:'body', html:'<p>Once an operator is written as eigenvalues times projectors, a function of it means one thing only: apply the function to the eigenvalues and leave the projectors alone.</p>'},
    {t:'eq', key:true, tex:'f(A) = \\sum_{k} f(\\lambda_{k})\\,P_{k}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The definition agrees with the obvious one wherever the obvious one exists. For a power, $A^{2}=\\sum_{j,k}\\lambda_{j}\\lambda_{k}P_{j}P_{k}$, and $P_{j}P_{k}=\\delta_{jk}P_{k}$ collapses the double sum to $\\sum_{k}\\lambda_{k}^{2}P_{k}$. Every power therefore follows the rule, so every power series does — which is why the definition may be used for functions with no series at all, such as a square root.</p>'}
    ]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<p>The case this course needs constantly is the exponential. With $A=\\sum_{k}\\lambda_{k}P_{k}$,</p>'},
      {t:'eq', key:true, tex:'e^{-iAt} = \\sum_{k} e^{-i\\lambda_{k}t}\\,P_{k}'}
    ]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'The mistake this scene exists to stop', html:'$e^{A}$ is <b>not</b> the matrix of $e^{A_{jk}}$. Entry by entry, $A$ above would give $\\begin{bmatrix}e^{2}&e\\\\e&e^{2}\\end{bmatrix}$, with eigenvalues $e^{2}\\pm e$; the correct answer has $e^{3}$ and $e^{1}$. The two agree only for a diagonal matrix, so checking on one teaches the wrong lesson.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figFunction(),
      caption:'The exponential, drawn on the eigenvalues it acts on. Each eigenvalue sits on the real axis; the map sends it to a point of unit modulus at angle $-\\lambda t$. The projectors do not move, so the operator is fully described by two points on a circle.'},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Given', '$A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$ again, with eigenvalues $3$ on $|+\\rangle$ and $1$ on $|-\\rangle$.'],
        ['Method', 'Exponentiate each eigenvalue; keep the projectors.'],
        ['Answer', '$e^{-iAt} = e^{-3it}\\,|+\\rangle\\langle+| \\;+\\; e^{-it}\\,|-\\rangle\\langle-|$.'],
        ['Check', 'At $t=0$ both factors are one and the sum is $P_{+}+P_{-}=I$. Each factor has modulus one at every $t$, so the result is unitary, which it must be because $A$ is Hermitian.']
      ]}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.8.1 -- */
{ id:'m1-dirac', module:'M1', nav:'Dirac notation', title:'Dirac notation is a way of writing what is already there',
  objective:'Translate between Dirac notation and matrix notation in both directions and read a product right to left.',
  keywords:'dirac notation bra ket translation matrix column row expectation value basis independent order',
  src:'L3 · Dirac notation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Dirac notation'},
  {t:'title', text:'Dirac notation is a way of writing what is already there'},
  {t:'lede', text:'Nothing in this chapter needed the notation. Every result was a statement about columns, rows and matrices, and could have been written that way throughout. The notation earns its place because it says which object is which without naming a basis, and because the shapes then check themselves.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'wex', rows:[
      ['$|\\psi\\rangle$', 'A column of $n$ complex numbers, once a basis is chosen.'],
      ['$\\langle\\psi|$', 'The same column, conjugated and laid on its side: a row.'],
      ['$\\langle\\phi|\\psi\\rangle$', 'Row times column: one complex number.'],
      ['$|\\phi\\rangle\\langle\\psi|$', 'Column times row: an $n\\times n$ operator.'],
      ['$A|\\psi\\rangle$', 'Matrix times column: another column, another state.'],
      ['$\\langle\\psi|A|\\psi\\rangle$', 'Row times matrix times column: one number, the expectation value of Chapter 2.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'How to read a product', html:'A matrix product acts on a ket from the right, so the operator written <b>last</b> in a product is applied <b>first</b>. The circuit $H$ then $R_{z}$ then $H$ of Chapter 0 is the operator $H R_{z} H$, read right to left. Circuit diagrams run left to right and algebra runs right to left, and the two are not in conflict — they are two orders for the same sequence.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figShapes(),
      caption:'The shapes again, because they are the check. A line of algebra that produces a number where an operator was expected has an inner product where an outer product belonged, and counting rows and columns finds it faster than reading the symbols does.'},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<p>An operator can also be written entirely in the notation, with no matrix anywhere. Insert the identity on both sides:</p>'},
      {t:'eq', tex:'A = I\\,A\\,I = \\sum_{j,k} |e_{j}\\rangle\\,\\langle e_{j}|A|e_{k}\\rangle\\,\\langle e_{k}|'},
      {t:'small', html:'The number $\\langle e_{j}|A|e_{k}\\rangle$ is the matrix entry $A_{jk}$. So the matrix is not a different object from the operator: it is the operator, read in a basis, and the notation says which basis was used.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'One symbol, two jobs', html:'$H$ is the Hadamard gate and $H$ is a Hamiltonian, and this course uses both. They are told apart by where they stand: a gate acts in a circuit or on a ket, a Hamiltonian sits inside an exponential. Where a scene could be read either way it says which is meant, and the notation panel repeats both entries.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.9.1 -- */
{ id:'m1-wavefunctions', module:'M1', nav:'Functions as vectors', title:'A wavefunction is a vector with a continuous index',
  objective:'Use the inner product for square-integrable functions and recognise it as the continuous version of a complex column.',
  keywords:'wavefunction function vector Hilbert space square integrable L2 inner product integral norm orthogonal sine cosine',
  src:'L4 · square-integrable functions as vectors', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Function spaces'},
  {t:'title', text:'A wavefunction is a vector with a continuous index'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A column labels its entries by an integer. A function labels them by a continuous coordinate. The vector-space rules stay the same, but the sum in the inner product becomes an integral:</p>'},
    {t:'eq', key:true, tex:'\\langle f|g\\rangle = \\int_{a}^{b} f^{*}(x)\\,g(x)\\,\\mathrm{d}x, \\qquad \\|f\\|^{2}=\\int_{a}^{b}|f(x)|^{2}\\,\\mathrm{d}x'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The space $L^{2}[a,b]$', html:'A function belongs to $L^{2}[a,b]$ when its squared modulus has a finite integral. That condition gives the function a finite norm, so it can be normalised and used as a state. Addition and multiplication by complex numbers work exactly as they do for columns.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figFunctionVector(),
      caption:'Two normalised functions on $[-\\pi,\\pi]$: $\\sin x/\\sqrt\\pi$ and $\\cos x/\\sqrt\\pi$. Their inner product is zero, so they are orthogonal vectors even though their curves cross many times.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$u(x)=\\sin x/\\sqrt\\pi$ and $v(x)=\\cos x/\\sqrt\\pi$ on $[-\\pi,\\pi]$.'],
        ['Work', '$\\langle u|v\\rangle=\\pi^{-1}\\int_{-\\pi}^{\\pi}\\sin x\\cos x\\,\\mathrm dx=0$. Also $\\|u\\|^{2}=\\pi^{-1}\\int_{-\\pi}^{\\pi}\\sin^{2}x\\,\\mathrm dx=1$.'],
        ['Answer', '$u$ and $v$ are orthonormal vectors in a function space.'],
        ['Check', 'The product is odd on a symmetric interval, so its integral must vanish.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Finite at every point is not enough', html:'A function can have a finite value at each point and still have an infinite squared norm over an unbounded interval. Membership in the state space is decided by the integral of $|f|^{2}$, not by inspecting the height of the curve.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.9.2 -- */
{ id:'m1-completeness', module:'M1', nav:'Completeness and truncation', title:'Completeness turns a function into coefficients and measures what truncation loses',
  objective:'Use a complete orthonormal basis, Parseval identity and the coefficient tail to quantify a truncated expansion.',
  keywords:'complete basis Parseval Fourier expansion coefficients truncation error norm convergence function space',
  src:'L4 · completeness and Parseval; Fourier expansion as a change of basis', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Function spaces'},
  {t:'title', text:'Completeness turns a function into coefficients and measures what truncation loses'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>An orthonormal family is complete when no non-zero vector is orthogonal to every member. Then every function in the space is recovered from its inner products with the basis:</p>'},
    {t:'eq', key:true, tex:'|f\\rangle=\\sum_{n=1}^{\\infty}c_{n}|u_{n}\\rangle, \\qquad c_{n}=\\langle u_{n}|f\\rangle'},
    {t:'eq', tex:'\\|f\\|^{2}=\\sum_{n=1}^{\\infty}|c_{n}|^{2}, \\qquad \\left\\|f-\\sum_{n=1}^{N}c_{n}u_{n}\\right\\|^{2}=\\sum_{n>N}|c_{n}|^{2}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The first equality is Parseval identity. The second makes a numerical promise: the coefficient tail is exactly the squared error of the truncated approximation. It is not an informal sign that later terms look small.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figParseval(),
      caption:'A coefficient spectrum with the first four terms retained. Parseval says the total bar height is the squared norm; the bars to the right of the dashed line add to the squared truncation error.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Fourier expansion is one basis choice', html:'On a finite interval, the constant, sine and cosine functions form an orthonormal basis after normalisation. Multiplying an expansion by one basis function and integrating isolates its coefficient, just as multiplying a column by a basis bra selects one entry.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Norm convergence is not pointwise convergence', html:'A Fourier approximation can converge in squared norm while behaving poorly at selected points. Parseval controls the integrated error. It does not state that every plotted point approaches the target at the same rate.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 1.10.1 - */
{ id:'m1-synth', module:'M1', nav:'Summary', title:'What this chapter leaves you with',
  objective:'Collect the four constructions and the three derivation moves the rest of the course uses.',
  keywords:'summary module 1 review constructions moves inner outer tensor spectral checklist',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Summary'},
  {t:'title', text:'What this chapter leaves you with'},
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

/* ---------------------------------------------------------------- 1.10.2 ---
   The promise made in the course map — that each chapter names the shapes of
   question it sets before it sets them — is kept here. The list is the same
   object the questions themselves are labelled from, so a shape cannot be
   described here and set differently there. */
{ id:'m1-shapes', module:'M1', nav:'The shapes of question', title:'The shapes of question this chapter sets',
  objective:'Name the recurring question types and the method each one is answered by.',
  keywords:'question types taxonomy shapes method examination practice inner basis phase operator spectral tensor',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Summary and practice'},
  {t:'title', text:'The shapes of question this chapter sets'},
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
