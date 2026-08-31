/* Course notes — front matter and Chapter 1.

   The front matter lives here because chapter 1 is the first chapter file the
   builder finds. It moves to `c0.js` when the course opening is written for the
   notes as well. The contents lists the chapters that exist; it grows as they
   are added.

   These notes are the reading edition of the same material the artifact
   presents scene by scene. They say the same things in the same order and they
   are not a transcript: a scene builds in reveal steps and a page does not, so
   a derivation that arrives in four steps on screen arrives as one argument
   here, with the same intermediate lines shown. */
(function(){
const P=PLOT, C=P.COL;
const ax=o=>P.Axes(Object.assign({w:700,h:220,pad:{l:56,r:22,t:24,b:38},xtarget:6,ytarget:4},o));

/* The overlap of one state with a family of states, against the angle between
   them. Drawn from the definition, so the two ends of the curve are the two
   cases the text names rather than two points chosen to look right. */
function overlap(){
  const a=ax({w:700,h:240,xr:[0,2*Math.PI],yr:[0,1.12],
    xlabel:'\\theta',ylabel:'|\\langle 0|\\psi(\\theta)\\rangle|^{2}',
    pad:{l:62,r:22,t:24,b:42},xtarget:5,ytarget:4});
  a.curve(t=>Math.cos(t/2)**2,{color:C.in,width:2.2});
  a.point(0,1,{color:C.out,r:5});
  a.point(Math.PI/2,0.5,{color:C.mid,r:5});
  a.point(Math.PI,0,{color:C.err,r:5});
  return a.svg();
}

/* A complex number and its conjugate: a reflection in the real axis, drawn as
   one so that a reader who has been treating conjugation as a rotation sees the
   difference rather than being told about it. */
function argand(){
  const a=ax({w:400,h:330,xr:[-0.9,3.75],yr:[-1.9,1.9],
    xlabel:'\\operatorname{Re} z',ylabel:'\\operatorname{Im} z',
    pad:{l:52,r:20,t:24,b:38},xtarget:4,ytarget:4});
  a.poly([[0,0],[2,1.5]],{color:C.in,width:2.4});
  a.point(2,1.5,{color:C.in,r:5});
  a.poly([[2,0],[2,1.5]],{color:C.grid,width:1.1,dash:'3 4'});
  a.poly([[0,1.5],[2,1.5]],{color:C.grid,width:1.1,dash:'3 4'});
  a.poly([[0,0],[2,-1.5]],{color:C.mid,width:1.4,dash:'4 4'});
  a.point(2,-1.5,{color:C.mid,r:5});
  a.note(2,1.5,'z',{fs:13,color:C.in,dx:12,dy:-9,tex:true});
  a.note(2,-1.5,'z^{*}',{fs:13,color:C.mid,dx:12,dy:26,tex:true});
  return a.svg();
}

/* One step of Gram-Schmidt in the plane. The subtraction is the whole proof:
   what is left after the component along the first vector is removed has no
   component along it. */
function gram(){
  const a=ax({w:400,h:330,xr:[-0.6,2.02],yr:[-0.85,1.25],
    pad:{l:26,r:22,t:22,b:26},xticksOverride:[],yticksOverride:[],
    grid:false,zeroAxes:true,arrows:false});
  a.poly([[0,0],[1,1]],{color:C.in,width:2.2});   a.point(1,1,{color:C.in,r:5});
  a.poly([[0,0],[1,0]],{color:C.mid,width:2.2});  a.point(1,0,{color:C.mid,r:5});
  a.poly([[0,0],[0.5,0.5]],{color:C.h,width:3});
  a.poly([[0.5,0.5],[1,0]],{color:C.grid,width:1.2,dash:'4 4'});
  a.poly([[0,0],[0.5,-0.5]],{color:C.out,width:2.8});
  a.point(0.5,-0.5,{color:C.out,r:5});
  a.note(1,1,'v_{1}',{fs:13,color:C.in,dx:12,dy:-8,tex:true});
  a.note(1,0,'v_{2}',{fs:13,color:C.mid,dx:12,dy:-8,tex:true});
  a.note(0.5,-0.5,'u_{2}',{fs:13,color:C.out,dx:12,dy:22,tex:true});
  return a.svg();
}

/* The two states a Z measurement cannot separate, after one Hadamard. Before
   the gate all four bars are one half, which is the half of the story the
   figure deliberately does not draw. */
function phasebars(){
  const a=ax({w:400,h:330,xr:[-0.6,3.8],yr:[0,1.12],
    ylabel:'\\text{probability}',pad:{l:56,r:20,t:26,b:58},
    xticksOverride:[],ytarget:4});
  const bar=(n,v,fill,line)=>{ a.rect(n-0.24,0,n+0.24,v,{fill:fill});
    a.poly([[n-0.24,v],[n+0.24,v]],{color:line,width:2.2}); };
  bar(0,1,C.dec.out,C.out); bar(1,0,C.dec.out,C.out);
  bar(2,0,C.dec.err,C.err); bar(3,1,C.dec.err,C.err);
  ['0','1','0','1'].forEach((t,k)=>a.note(k,0,t,{fs:12,color:C.muted,anchor:'middle',dy:26}));
  a.note(0.5,0,'H|+\\rangle',{fs:13,color:C.out,anchor:'middle',dy:48,tex:true});
  a.note(2.5,0,'H|-\\rangle',{fs:13,color:C.err,anchor:'middle',dy:48,tex:true});
  return a.svg();
}

/* How many digits of orthogonality survive, against how nearly parallel the
   inputs are. Measured rather than predicted: the recursion is run at each
   setting and the largest entry of E^dagger E - I is read off the result. */
function conditioning(){
  const dot=(u,v)=>u[0]*v[0]+u[1]*v[1]+u[2]*v[2];
  const nrm=u=>Math.sqrt(dot(u,u));
  const sub=(u,v)=>[u[0]-v[0],u[1]-v[1],u[2]-v[2]];
  const mul=(u,c)=>[u[0]*c,u[1]*c,u[2]*c];
  const crs=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  /* One fixed generic rotation, so that no coordinate is special. Built on the
     axes, the first subtraction cancels a coordinate against itself and comes
     out exactly zero, and the figure would report perfect orthogonality
     everywhere — a property of the coordinates and not of the recursion. */
  const n=mul([1,2,3],1/nrm([1,2,3])), CA=Math.cos(0.7), SA=Math.sin(0.7);
  const turn=v=>{ const c=crs(n,v), d=dot(n,v);
    return [0,1,2].map(i=>v[i]*CA + c[i]*SA + n[i]*d*(1-CA)); };
  function gs(V,mod){ const E=[];
    for(let j=0;j<3;j++){ let u=V[j].slice();
      for(let i=0;i<E.length;i++){ const c=mod?dot(E[i],u):dot(E[i],V[j]);
        u=sub(u,mul(E[i],c)); }
      const q=nrm(u); E.push(q>0?mul(u,1/q):[0,0,0]); }
    return E; }
  const defect=E=>{ let w=0;
    for(let i=0;i<3;i++) for(let j=0;j<3;j++)
      w=Math.max(w,Math.abs(dot(E[i],E[j])-(i===j?1:0)));
    return w; };
  const a=ax({w:400,h:330,xr:[-0.5,9.5],yr:[0,17.5],
    xlabel:'-\\log_{10}\\theta',ylabel:'\\text{correct digits}',
    pad:{l:56,r:20,t:52,b:42},xtarget:4,ytarget:5});
  const sweep=mod=>{ const pts=[];
    for(let k=0;k<=9;k+=0.25){ const th=Math.pow(10,-k), h=1e-6;
      const w=[Math.cos(th/2),Math.sin(th/2),h];
      const V=[[1,0,0],[Math.cos(th),Math.sin(th),0],mul(w,1/nrm(w))].map(turn);
      pts.push([k,-Math.log10(Math.max(defect(gs(V,mod)),1e-17))]); }
    return pts; };
  a.poly(sweep(false),{color:C.err,width:2.2});
  a.poly(sweep(true),{color:C.out,width:2.0,dash:'5 4'});
  a.note(5.4,18.6,'classical',{fs:12,color:C.err});
  a.note(7.7,18.6,'modified',{fs:12,color:C.out});
  return a.svg();
}

/* Why the amplitude count doubles: each new qubit gives every basis string of
   the register two continuations rather than one. */
function tree(){
  const a=ax({w:700,h:250,xr:[-0.35,3.5],yr:[-0.9,8.6],
    pad:{l:24,r:22,t:22,b:36},xticksOverride:[],yticksOverride:[],
    grid:false,zeroAxes:false,arrows:false});
  const lv=[[4],[2,6],[1,3,5,7],[0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5]];
  for(let k=1;k<lv.length;k++)
    lv[k].forEach((y,i)=>a.poly([[k-1,lv[k-1][i>>1]],[k,y]],{color:C.grid,width:1.2}));
  const hue=[C.ink,C.in,C.mid,C.out];
  lv.forEach((ys,k)=>ys.forEach(y=>a.point(k,y,{color:hue[k],r:k===3?3.5:4.5})));
  [['1',0],['2',1],['4',2],['8',3]].forEach(([t,k])=>
    a.note(k,-0.55,t,{fs:13,color:hue[k],anchor:'middle'}));
  return a.svg();
}

/* The two coefficients of a Pauli rotation over two full turns. The matrix has
   twice the period of the state it acts on, and this is where that is first
   visible. */
function halfangle(){
  const a=ax({w:700,h:240,xr:[0,4*Math.PI],yr:[-1.45,1.4],
    xlabel:'\\theta',ylabel:'\\text{coefficient}',
    pad:{l:58,r:22,t:26,b:42},xtarget:5,ytarget:4});
  a.curve(t=>Math.cos(t/2),{color:C.in,width:2.2});
  a.curve(t=>Math.sin(t/2),{color:C.mid,width:2.0,dash:'5 4'});
  a.vline(2*Math.PI,{color:C.err,width:1.2,dash:'4 4'});
  a.note(2.4,1.12,'\\cos(\\theta/2)',{fs:12,color:C.in,tex:true});
  a.note(5.0,-1.28,'\\sin(\\theta/2)',{fs:12,color:C.mid,tex:true});
  return a.svg();
}

window.C1 = [

/* ---------------- front matter ---------------- */
{t:'title', kicker:'Quantum Computing', text:'Quantum Computing',
 sub:'Lecture notes for the software half of the course: what a quantum state is, what can be done to it, what a measurement returns, and what an algorithm has to arrange before that measurement is worth making.',
 meta:[['Covers','Chapters 1 to 6, and Appendix A'],['Level','Undergraduate'],
       ['Assumed background','Linear algebra over the real numbers, and some Python']]},

/* The credit CC BY 4.0 asks for. It sits in the front matter rather than in a
   colophon at the back, because a reader who never reaches the last page has
   still been told. The artifact prints the same sentence from
   `CONTENT.META.adapted`; this pipeline does not load that file, so the two
   are kept in step by hand. */
{t:'p', text:'These notes are an adaptation. Their syllabus and the sequence of topics they teach derive from <b>Quantum Computing Lectures</b> by Aleksandr Krasnok, <i class="url">github.com/AlexKrasnok/quantum-computing-lectures</i>, used under CC BY 4.0. Every page here — the prose, the figures, the worked examples and the questions — is written for this edition.'},

{t:'h3', text:'How to read these notes'},
{t:'p', text:'Each idea arrives in the same order: what it is for, a definition, an equation, a short derivation with every step shown, a worked example, and the mistake that is easiest to make. Worked examples use five headings — Given, Find, Method, Solution, Check. Do the Check step yourself before reading it; it is where a wrong answer is most likely to survive, because a calculation that goes wrong in the middle usually goes wrong in the check as well and agrees with itself.'},
{t:'p', text:'Four conventions apply everywhere, and the first two are worth fixing now because getting either wrong costs an error that nothing on the page reveals. A register of $n$ qubits is written $|q_{n-1}\\ldots q_1q_0\\rangle$, and entry $x$ of its column of amplitudes is the amplitude of $|x\\rangle$ with $x$ read as a binary number. A phase on the whole state is not physical and may be dropped; a phase between two terms is physical and may never be dropped. The inner product conjugates its first argument, $\\langle u|v\\rangle=\\sum_k u_k^{*}v_k$, which in NumPy is <code>np.vdot(u, v)</code> and never <code>np.dot</code>. And $\\hbar=1$, so a Hamiltonian is measured in angular frequency and evolution is $U(t)=e^{-iHt}$.'},
{t:'p', text:'The contents below carries a third column. An entry such as <b>NC CH2.1.4</b> points into the course textbook, Nielsen and Chuang, <i>Quantum Computation and Quantum Information</i>, tenth anniversary edition, where the same material is developed at length. The <b>NC</b> marker is what tells the two numbering systems apart, and it is not decorative: this chapter is chapter 1 here and section 2.1 there, and every later chapter disagrees with the book by a different amount.'},

{t:'box', kind:'def', hd:'The engineering regime these notes assume', html:'Semiconductor scaling made quantum effects unavoidable at small dimensions. Quantum engineering asks when selected effects can instead be controlled as resources. The field then added a general computational model, algorithms with proved advantages under stated resource models, and today\u2019s noisy intermediate-scale quantum (NISQ) processors. NISQ hardware supports calibration studies, small demonstrations and experiments with noise. It is not fault-tolerant hardware, and error mitigation is not error correction. A defensible result names the task, classical baseline, hardware conditions, shot count, uncertainty and mitigation cost.'},

{t:'toc', items:[
 ['1','The mathematics of quantum states',
  'States as complex columns; bras and the inner product; length, orthogonality and overlap; orthonormal bases. Amplitude and phase, and the difference between a global and a relative one. Outer products, projectors and the resolution of the identity. Gram–Schmidt. The tensor product and where the exponential comes from. The adjoint, Hermitian and unitary operators, and the exponential that joins them. Eigenvectors, the spectral theorem and functions of an operator. Dirac notation. Square-integrable functions as vectors, complete bases, Parseval and truncation.',
  'NC CH2.1 · NC CH2.2.7'],
 ['2','States, measurement and dynamics',
  'The Born rule, active and passive transformations, and why choosing a measurement basis is choosing an experiment. Projective measurement, the state it leaves behind, and the instrument behind a general measurement. Observables, means and spreads. Compatibility, the commutator, and the uncertainty relation. The Pauli algebra and a measurement along any direction. Position and momentum, the free particle, the infinite square well, stationary states and why a gate is an exponential. What a finite run of shots is worth.',
  'NC CH2.2, NC CH2.1.3, NC CH2.1.9'],
 ['3','Mixed states and entanglement',
  'The density operator, and the two situations no state vector describes. Which matrices are states, and the purity that says how mixed one is. Quantum channels in Kraus form, amplitude damping and dephasing, and the two decay times they become in continuous time. The partial trace, and a pure pair whose halves are mixed. Separability, the Schmidt decomposition and the entropy that weighs it. The Bell states, CHSH, and why entanglement sends nothing.',
  'NC CH2.4 · NC CH2.5 · NC CH2.6 · NC CH8.2 · NC CH11.3'],
 ['4','The Bloch sphere and quantum gates',
  'One qubit drawn: the two angles, the half angle, and why opposite points are the orthogonal ones. Global against relative phase, and the double cover. Every one-qubit gate as a rotation — the Pauli gates, the Hadamard and the phase family. The order a circuit multiplies in, the Euler decomposition, and the three-parameter gate a machine offers. Reversible embeddings, ancillas and uncomputing. Two-qubit gates and the ordering that fails silently. Entangling power and universality.',
  'NC CH1.2 · NC CH1.3 · NC CH3.2.5 · NC CH4.2 · NC CH4.5'],
 ['5','Circuits and protocols',
  'A circuit as a program, and the model of computation it belongs to. Depth against gate count, and which one a coherence time is spent against. Exact simulation and where it stops; shots, error bars, and the difference between sampling noise and a broken machine. Measurement inside a circuit, classical feedforward, and what a compiler does before the hardware sees anything. Then the five things a resource claim must name, and two protocols worked end to end against them: teleportation, which finishes nothing until two classical bits arrive, and Grover, whose square root is a count of queries and not a time.',
  'NC CH1.3.4 · NC CH1.3.5 · NC CH1.3.7 · NC CH4.4 · NC CH4.6 · NC CH6.1 · NC CH6.6'],
 ['6','Quantum algorithms',
  'What a query model counts, and what a query count is not. One mechanism — phase kickback — first with a Boolean oracle and then with any unitary, and the rule that a superposition which never interferes has bought nothing. Deutsch and Deutsch–Jozsa. The quantum Fourier transform, its circuit and what it does not return. Phase estimation, the two floors it guarantees, and quantum counting. Order finding, the continued fractions that read it, and the factoring that follows — with the reach of the same mechanism named at the end.',
  'NC CH1.4.2 · NC CH1.4.3 · NC CH1.4.4 · NC CH5.1 · NC CH5.2 · NC CH5.3 · NC CH6.3'],
 ['A','Formula summary',
  'Every formula the six chapters establish, in the order they establish it, each entry naming the section that develops it. Nothing is derived there.',
  '']
]},

{t:'page'},

/* ---------------- chapter 1 ---------------- */
{t:'h1', num:'1', text:'The mathematics of quantum states'},

{t:'p', lead:true, text:'Nothing in this chapter is quantum mechanics. It is the language the quantum mechanics of the rest of the course is written in, and it is worth learning on its own terms first: a reader who is decoding the notation cannot also be following the physics.'},

{t:'p', text:'Fix a basis — a list of the outcomes a system can be found in — and three things become concrete at once. A <b>state</b> is a column of complex numbers, one for each outcome. An <b>operation</b> is a matrix acting on that column. A <b>question</b> is a single number, formed from two columns by an inner product. For $n$ qubits the column has $2^{n}$ entries, so the objects are large; they are not complicated, and everything done to them in this course is built from four constructions, all of them in this chapter.'},

{t:'box', kind:'ok', hd:'The four constructions', html:'The <b>inner product</b> $\\langle\\phi|\\psi\\rangle$, which turns two states into a number and is where every probability comes from. The <b>outer product</b> $|\\phi\\rangle\\langle\\psi|$, which turns two states into an operator. The <b>tensor product</b> $\\otimes$, which turns two systems into one. The <b>spectral decomposition</b>, which turns an operator into its eigenvalues and the projectors that belong to them.'},

/* ---- 1.1 ---- */
{t:'h2', num:'1.1', text:'Vectors, dual vectors and the inner product'},

{t:'p', text:'A quantum state is written $|\\psi\\rangle$ and is called a <b>ket</b>. Once a basis $\\{|0\\rangle,|1\\rangle\\}$ has been named, the ket is a column of two complex numbers called <b>amplitudes</b>.'},

{t:'eqbox', cap:'a qubit state', tex:'|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle = \\begin{bmatrix}\\alpha\\\\ \\beta\\end{bmatrix}, \\qquad |\\alpha|^{2}+|\\beta|^{2}=1',
 after:'The space these live in is a complex vector space, which means only that adding two states gives a state and multiplying a state by a complex number gives a state. That closure is the whole content of the word <b>superposition</b>. The normalisation is not a mathematical necessity; it is the bookkeeping that makes the probabilities of the next chapter add to one.'},

{t:'box', kind:'warn', hd:'What a superposition is not', html:'It is not the statement that the qubit is really in $|0\\rangle$ or really in $|1\\rangle$ and that we do not yet know which. That description predicts different numbers, and an interference experiment separates the two. A superposition is one state with two amplitudes, and both of them are there at once.'},

{t:'p', text:'Every ket has a partner. The <b>bra</b> $\\langle a|$ is the ket $|a\\rangle$ transposed and conjugated, so it is a row. A row on the left of a column contracts to a single number, and that number is the <b>inner product</b>.'},

{t:'eqbox', cap:'the inner product', tex:['\\langle a| = |a\\rangle^{\\dagger} = \\begin{bmatrix}a_{1}^{*} & \\cdots & a_{n}^{*}\\end{bmatrix}', '\\langle a|b\\rangle = \\sum_{k} a_{k}^{*}\\,b_{k}'],
 after:'The conjugate sits on the <b>first</b> argument and on nothing else. Swapping the arguments therefore conjugates the answer, $\\langle b|a\\rangle=\\langle a|b\\rangle^{*}$, and $\\langle a|a\\rangle=\\sum_k|a_k|^{2}$ is real and never negative — which is what lets it be a squared length.'},

{t:'ex', hd:'Example 1.1 · an overlap, with the conjugate in the right place', rows:[
 ['Given','$|a\\rangle=\\tfrac{1}{\\sqrt2}(1,\\,i)$ and $|b\\rangle=\\tfrac{1}{\\sqrt2}(1,\\,-i)$.'],
 ['Find','$\\langle a|b\\rangle$.'],
 ['Method','Write the bra explicitly — conjugate every entry of the first vector — then multiply term by term and add.'],
 ['Solution','$\\langle a|=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-i\\end{bmatrix}$, so $\\langle a|b\\rangle=\\tfrac12\\left[(1)(1)+(-i)(-i)\\right]=\\tfrac12\\left[1-1\\right]=0$. The two states are orthogonal.'],
 ['Check','Both are normalised, so Cauchy–Schwarz allows anything from $0$ to $1$ in modulus. Zero is the smallest it could have been, and it says the two states are perfectly distinguishable.']]},

{t:'box', kind:'err', hd:'The mistake this section exists to stop', html:'Leaving the conjugate out gives $\\tfrac12\\left[(1)(1)+(i)(-i)\\right]=1$. That is not a small error: an overlap of one says the two are <b>the same state</b>, where the truth is that they are as different as two states can be. In NumPy the conjugating product is <code>np.vdot(a, b)</code>; <code>np.dot(a, b)</code> is the version without it and returns the wrong number without complaint.'},

{t:'p', text:'The inner product of a state with itself gives its length, $\\|a\\|=\\sqrt{\\langle a|a\\rangle}$, and the inner product of two different states says how alike they are. The second is bounded: in any inner-product space the <b>Cauchy–Schwarz inequality</b> holds, $|\\langle a|b\\rangle|\\le\\|a\\|\\,\\|b\\|$. For two normalised states that reads $0\\le|\\langle a|b\\rangle|^{2}\\le1$, and the two ends have names. Zero means <b>orthogonal</b> and a single measurement separates them with certainty. One means the same state up to a phase on the whole vector, and nothing separates them ever.'},

{t:'fig', svg:overlap, cap:'The squared overlap of $|0\\rangle$ with the family $|\\psi(\\theta)\\rangle=\\cos(\\theta/2)|0\\rangle+\\sin(\\theta/2)|1\\rangle$. The three marks are $\\theta=0$, where the states coincide; $\\theta=\\pi/2$, where the overlap is one half; and $\\theta=\\pi$, where they are orthogonal. The half angle is the first sighting of a factor chapter 4 explains.'},

{t:'p', text:'A set $\\{|e_1\\rangle,\\ldots,|e_n\\rangle\\}$ is an <b>orthonormal basis</b> when $\\langle e_i|e_j\\rangle=\\delta_{ij}$ and it spans the space. Every vector then has one expansion in it, and the coefficients are computed rather than guessed. Apply $\\langle e_j|$ to both sides of $|v\\rangle=\\sum_i v_i|e_i\\rangle$:'},

{t:'eq', tex:'\\langle e_{j}|v\\rangle = \\sum_{i} v_{i}\\,\\langle e_{j}|e_{i}\\rangle = \\sum_{i} v_{i}\\,\\delta_{ji} = v_{j}'},

{t:'p', text:'One line, and it is used constantly: <b>a coefficient is an inner product with the corresponding basis vector</b>. It is why the basis is chosen orthonormal in the first place, and it fails as soon as the basis is not. It also makes clear that the coefficients belong to the basis and not to the state: writing $|0\\rangle=\\tfrac{1}{\\sqrt2}|+\\rangle+\\tfrac{1}{\\sqrt2}|-\\rangle$ changes nothing about the state, and the word "superposition" is therefore incomplete on its own. A state is a superposition <b>with respect to a named basis</b>.'},

/* ---- 1.2 ---- */
{t:'h2', num:'1.2', text:'Amplitude, phase and interference'},

{t:'p', text:'An amplitude is one complex number and it carries two real ones. In Cartesian form it is a real part and an imaginary part; in polar form it is a size and an angle, and Euler\u2019s formula $e^{i\\varphi}=\\cos\\varphi+i\\sin\\varphi$ is the bridge between them.'},

{t:'eqbox', cap:'modulus and phase', tex:'z = x+iy = r\\,e^{i\\varphi}, \\qquad zz^{*} = x^{2}+y^{2} = |z|^{2}',
 after:'Every probability in this course is a $|z|^{2}$, and every interference effect is a difference of two $\\varphi$. The modulus becomes a probability; the phase never becomes a probability on its own, and only ever acts by being added to or subtracted from another phase.'},

{t:'figrow', n:2, items:[
 {svg:argand, cap:'A complex number and its conjugate. Conjugation is a reflection in the real axis. It is not a rotation by $\\pi$, which would send $z$ to $-z$ instead.'},
 {svg:phasebars, cap:'After one Hadamard, $|+\\rangle$ and $|-\\rangle$ give opposite certain answers. Before the gate all four bars were one half, which is why the figure shows only the half of the story the relative phase decides.'}]},

{t:'box', kind:'err', hd:'Where the phase gets lost', html:'Computing the phase as $\\arctan(y/x)$ throws the quadrant away: for $z=-1+i$ it returns $-\\pi/4$, which points at $1-i$. The function that keeps the quadrant takes the two arguments separately, $\\operatorname{atan2}(y,x)$, which is <code>np.angle</code> in NumPy. It also survives $x=0$, where the ratio does not exist at all.'},

{t:'p', text:'Now multiply a whole state by a phase and ask what changes. Take any other state $|\\phi\\rangle$ and form the overlap: $\\left|\\langle\\phi|e^{i\\gamma}\\psi\\rangle\\right|^{2}=\\left|e^{i\\gamma}\\right|^{2}\\left|\\langle\\phi|\\psi\\rangle\\right|^{2}=\\left|\\langle\\phi|\\psi\\rangle\\right|^{2}$. Nothing changes, because $|e^{i\\gamma}|=1$, and every number an experiment can produce is of that form.'},

{t:'eqbox', cap:'a global phase is not physical', tex:'e^{i\\gamma}|\\psi\\rangle \\;\\equiv\\; |\\psi\\rangle'},

{t:'p', text:'Put the phase on one term only and the conclusion reverses. The states $|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$ differ by a relative phase of $\\pi$. Both give $\\left|\\pm\\tfrac{1}{\\sqrt2}\\right|^{2}=\\tfrac12$ for each computational outcome, so a measurement in that basis cannot tell them apart. Apply a Hadamard, which sends $|0\\rangle\\mapsto(|0\\rangle+|1\\rangle)/\\sqrt2$ and $|1\\rangle\\mapsto(|0\\rangle-|1\\rangle)/\\sqrt2$, and collect terms:'},

{t:'eq', tex:'\\begin{aligned} H|+\\rangle &= \\tfrac12\\left(|0\\rangle+|1\\rangle\\right)+\\tfrac12\\left(|0\\rangle-|1\\rangle\\right) = |0\\rangle \\\\ H|-\\rangle &= \\tfrac12\\left(|0\\rangle+|1\\rangle\\right)-\\tfrac12\\left(|0\\rangle-|1\\rangle\\right) = |1\\rangle \\end{aligned}'},

{t:'box', kind:'ok', hd:'The rule to carry forward', html:'A phase on the <b>whole</b> state can always be dropped. A phase <b>between two terms</b> can never be dropped. Interference is the only mechanism any algorithm in this course has, and interference is entirely a statement about relative phase. The trap inside that rule: a phase that is global for one qubit stops being global as soon as that qubit is one branch of a larger superposition, and chapter 6 builds its whole mechanism out of exactly this.'},

/* ---- 1.3 ---- */
{t:'h2', num:'1.3', text:'Outer products, projectors and the identity'},

{t:'p', text:'Reverse the order of the row and the column. A column on the left of a row does not contract; it spreads into a square array, and that array is an operator. This is the one construction that turns states into the things that act on states.'},

{t:'eqbox', cap:'the outer product', tex:'|a\\rangle\\langle b| = |a\\rangle\\,|b\\rangle^{\\dagger}, \\qquad \\left(|a\\rangle\\langle b|\\right)_{jk} = a_{j}\\,b_{k}^{*}',
 after:'What it does is easy to read: $\\left(|a\\rangle\\langle b|\\right)|v\\rangle=\\langle b|v\\rangle\\,|a\\rangle$, because the bra eats the ket first. Every outer product therefore sends the whole space onto the one line through $|a\\rangle$, and the number it multiplies by is the overlap of the input with $|b\\rangle$.'},

{t:'table', head:['Written','Shape','What it is'], rows:[
 ['$\\langle a|b\\rangle$','$1\\times n$ times $n\\times1$','a number'],
 ['$|a\\rangle\\langle b|$','$n\\times1$ times $1\\times n$','an operator'],
 ['$|a\\rangle\\otimes|b\\rangle$','$n\\times1$ with $m\\times1$','a longer column, of length $nm$']]},

{t:'p', text:'Take the outer product of a normalised state with itself and the result is a <b>projector</b>, $P_u=|u\\rangle\\langle u|$. It is its own adjoint, because reversing an outer product swaps two copies of the same state, and applying it twice is the same as applying it once:'},

{t:'eq', tex:'P_{u}^{2} = |u\\rangle\\underbrace{\\langle u|u\\rangle}_{=\\,1}\\langle u| = P_{u}'},

{t:'p', text:'An operator with $P^{2}=P$ can only have eigenvalues $0$ and $1$, since $\\lambda^{2}=\\lambda$. Those two numbers are "kept" and "discarded", and in chapter 2 they become the two things a measurement can report. A projector does not preserve length: for $P=|+\\rangle\\langle+|$ and $|v\\rangle=|0\\rangle$ the output $P|0\\rangle=\\tfrac12(|0\\rangle+|1\\rangle)$ has length $1/\\sqrt2$, and the lost length is exactly the probability of the other outcome.'},

{t:'p', text:'Now take one projector for each vector of an orthonormal basis and add them. Nothing has been thrown away, so nothing has changed.'},

{t:'eqbox', cap:'the resolution of the identity', tex:'\\sum_{k} |e_{k}\\rangle\\langle e_{k}| = I',
 after:'This is used as a <b>move</b> rather than as a fact. Inserting it turns a statement about a vector into a statement about its coefficients, and it derives the basis expansion of section 1.1 rather than assuming it: $|v\\rangle=I|v\\rangle=\\sum_k|e_k\\rangle\\langle e_k|v\\rangle$. The same move between two bras turns an inner product into a sum, $\\langle a|b\\rangle=\\sum_k\\langle a|e_k\\rangle\\langle e_k|b\\rangle$, and the basis to insert is whichever one makes an object in the expression simple.'},

/* ---- 1.4 ---- */
{t:'h2', num:'1.4', text:'Building an orthonormal basis'},

{t:'p', text:'Given independent vectors $v_1,\\ldots,v_k$, the <b>Gram–Schmidt procedure</b> produces an orthonormal set spanning the same space. Each step removes from the next vector everything that already lies along the vectors already built, then divides by the length of what is left.'},

{t:'eqbox', cap:'Gram–Schmidt', tex:'u_{j} = v_{j} - \\sum_{i<j}\\langle e_{i}|v_{j}\\rangle\\,e_{i}, \\qquad e_{j} = \\frac{u_{j}}{\\|u_{j}\\|}'},

{t:'figrow', n:2, items:[
 {svg:gram, cap:'One step of the procedure. The amber arrow is the part of $v_2$ that already lies along $e_1$; removing it leaves $u_2$, which is at a right angle to $e_1$ by construction and only has to be scaled to length one.'},
 {svg:conditioning, cap:'How many digits of orthogonality survive three vectors in space, against how nearly parallel the first two are. The recursion above is run at every setting and the result measured; the modified recursion, which subtracts from what is left rather than from the original, is run on the same inputs.'}]},

{t:'ex', hd:'Example 1.2 · two vectors in the plane', rows:[
 ['Given','$v_1=(1,1)$ and $v_2=(1,0)$, real.'],
 ['Method','Normalise the first; subtract from the second the part along it; normalise what is left.'],
 ['Solution','$\\|v_1\\|=\\sqrt2$, so $e_1=\\tfrac{1}{\\sqrt2}(1,1)$. Then $\\langle e_1|v_2\\rangle=\\tfrac{1}{\\sqrt2}$ and $u_2=(1,0)-\\tfrac12(1,1)=(\\tfrac12,-\\tfrac12)$, of length $\\tfrac{1}{\\sqrt2}$, so $e_2=\\tfrac{1}{\\sqrt2}(1,-1)$.'],
 ['Check','$\\langle e_1|e_2\\rangle=\\tfrac12(1-1)=0$ and both have length one. The pair is $|+\\rangle$ and $|-\\rangle$ in disguise.']]},

{t:'box', kind:'warn', hd:'Where it breaks on a computer', html:'If two input vectors are nearly parallel, the subtraction cancels almost everything and $u_j$ is a small difference of large numbers. Rounding error, negligible in the inputs, is then a large fraction of the result, and the "orthonormal" vectors come out neither orthogonal nor normal. A QR factorisation computes the same span by a different arithmetic route and loses far less; in NumPy that is <code>np.linalg.qr</code>, and the columns of $Q$ are the orthonormal set. Gram–Schmidt stays the right thing to know because it says <b>what</b> is being computed; QR is the right thing to run because it says how.'},

/* ---- 1.5 ---- */
{t:'h2', num:'1.5', text:'The tensor product, and where the exponential comes from'},

{t:'p', text:'Two separate systems are described by one state, and the construction that builds it is the <b>tensor product</b>: every product of an entry of the first with an entry of the second.'},

{t:'eqbox', cap:'the tensor product of two columns', tex:'\\begin{bmatrix}a_{1}\\\\a_{2}\\end{bmatrix}\\otimes\\begin{bmatrix}b_{1}\\\\b_{2}\\end{bmatrix} = \\begin{bmatrix}a_{1}b_{1}\\\\a_{1}b_{2}\\\\a_{2}b_{1}\\\\a_{2}b_{2}\\end{bmatrix}',
 after:'Two qubits are therefore described by four numbers and not by two plus two. For matrices the rule is the same block by block: $A\\otimes B$ carries the block $A_{ij}B$ in position $(i,j)$.'},

{t:'box', kind:'err', hd:'The convention that fails silently', html:'This course writes a register as $|q_{n-1}\\ldots q_1q_0\\rangle$, and entry $x$ of the column is the amplitude of $|x\\rangle$ read as a binary number. So $|10\\rangle$ means $q_1=1$ and $q_0=0$, and it is entry $2$. Courses that count the other way write the same symbols and mean a different state. Nothing looks wrong when the two are mixed; every number afterwards is simply another problem\u2019s answer.'},

{t:'p', text:'The tensor product multiplies dimensions, so adding a qubit doubles the space and $n$ of them give $\\dim(\\mathbb{C}^{2})^{\\otimes n}=2^{n}$. That is the entire origin of the exponential this subject is famous for. It is not a physical postulate, it is not an assumption about speed, and it is not special to quantum mechanics: it is what "combine two systems" means, applied $n$ times.'},

{t:'fig', svg:tree, cap:'Why the count doubles. Each new qubit gives every basis string of the register two continuations rather than one, so the number of strings goes $1$, $2$, $4$, $8$ and the amplitude column grows with it.'},

{t:'box', kind:'ok', hd:'And what the size does not buy', html:'A measurement of $n$ qubits returns $n$ bits — one string, not $2^{n}$ amplitudes and not a summary of them. Holding many amplitudes is therefore worth nothing on its own, and an algorithm has to make the unwanted ones cancel <b>before</b> the readout. Nor does a large state space prove the physics is hard to simulate: classical methods use locality, symmetry, sparsity, low entanglement and stabilizer structure, and a great many quantum states fall to one of them. The dimension is a fact about a generic dense description, and a reason the problem might be interesting rather than a proof that it is.'},

/* ---- 1.6 ---- */
{t:'h2', num:'1.6', text:'Hermitian and unitary operators'},

{t:'p', text:'The <b>adjoint</b> of an operator is its conjugate transpose, $A^{\\dagger}=(A^{*})^{T}$ — the same operation that turned a ket into a bra, applied to a square array. Two things happen and both are needed: every entry is conjugated, and every entry is moved across the diagonal. In NumPy that is <code>A.conj().T</code>; <code>A.T</code> alone is the real-valued version and drops the conjugation without warning. The adjoint reverses a product, $(AB)^{\\dagger}=B^{\\dagger}A^{\\dagger}$.'},

{t:'p', text:'An operator equal to its own adjoint is <b>Hermitian</b>. Its diagonal entries are real and its off-diagonal entries come in conjugate pairs, both visible at a glance. The consequence that matters is one short argument. Let $A|v\\rangle=\\lambda|v\\rangle$ with $|v\\rangle$ normalised, and compute $\\langle v|A|v\\rangle$ twice. Reading the operator to the right gives $\\lambda$; reading it to the left uses $A^{\\dagger}=A$ and gives $\\lambda^{*}$:'},

{t:'eq', tex:'\\langle v|A|v\\rangle = \\langle v|\\lambda v\\rangle = \\lambda, \\qquad \\langle v|A|v\\rangle = \\langle A v|v\\rangle = \\lambda^{*} \\;\\Longrightarrow\\; \\lambda\\in\\mathbb{R}'},

{t:'p', text:'A measuring instrument reports a real number, so an operator whose job is to carry the list of readings it can produce must have real eigenvalues, and Hermiticity is the condition that guarantees it. The same theorem gives an orthonormal basis of eigenvectors, which is what makes two different readings perfectly distinguishable.'},

{t:'p', text:'Ask instead for the operators that leave every overlap alone, and the condition writes itself. Apply $U$ to both arguments and move one copy across the inner product: $\\langle Ua|Ub\\rangle=\\langle a|U^{\\dagger}U|b\\rangle$. For this to equal $\\langle a|b\\rangle$ for every pair, the operator in the middle must be the identity.'},

{t:'eqbox', cap:'unitary', tex:'U^{\\dagger}U = I \\qquad\\Longleftrightarrow\\qquad U^{-1}=U^{\\dagger}',
 after:'Three consequences follow at once. Lengths are preserved, so a normalised state stays normalised and the probabilities of chapter 2 keep adding to one. The operator is invertible, so the evolution is reversible. And the columns of $U$ are an orthonormal basis, which is what the condition says entry by entry.'},

{t:'box', kind:'warn', hd:'A determinant of modulus one is not enough', html:'The shear $\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ has determinant $1$ and is invertible, and it is not unitary: it sends $(0,1)$ to $(1,1)$, of length $\\sqrt2$. Unitarity is a statement about every vector, and the only way to test it is $U^{\\dagger}U=I$.'},

{t:'p', text:'The two kinds of operator are joined by an exponential. If $G$ is Hermitian and $\\theta$ is real then $U(\\theta)=e^{-i\\theta G}$ is unitary, because $U^{\\dagger}=e^{+i\\theta G}$ and the two exponentials share a generator, so their exponents add to zero. For a Pauli operator the series closes in two terms: $\\sigma^{2}=I$ makes every even power the identity and every odd power $\\sigma$, and the two resulting sums are a cosine and a sine.'},

{t:'eqbox', cap:'a Pauli rotation', tex:'e^{-i\\theta\\sigma/2} = \\cos\\!\\left(\\tfrac{\\theta}{2}\\right) I \\;-\\; i\\sin\\!\\left(\\tfrac{\\theta}{2}\\right)\\sigma'},

{t:'fig', svg:halfangle, cap:'The two coefficients over two full turns. At $\\theta=2\\pi$ the cosine is $-1$ and the sine is $0$, so the operator is $-I$: the matrix takes twice as long to come home as the state it acts on. The leftover sign is a global phase and no experiment sees it, which is why the two are consistent.'},

{t:'ex', hd:'Example 1.3 · a rotation about $z$', rows:[
 ['Given','$\\sigma=Z=\\operatorname{diag}(1,-1)$ and $\\theta=\\pi/3$.'],
 ['Method','Substitute into the closed form; no series and no diagonalisation are needed.'],
 ['Solution','$\\cos(\\pi/6)=\\tfrac{\\sqrt3}{2}$ and $\\sin(\\pi/6)=\\tfrac12$, so $R_{z}(\\pi/3)=\\operatorname{diag}\\left(e^{-i\\pi/6},\\,e^{i\\pi/6}\\right)$.'],
 ['Check','Each diagonal entry has modulus one and the matrix is diagonal, so $U^{\\dagger}U=I$. The relative phase between the two entries is $\\pi/3$, which is the $\\theta$ that went in.']]},

{t:'p', text:'Chapter 2 will say that a closed system evolves as $U(t)=e^{-iHt}$ with $H$ the Hamiltonian. None of that is new mathematics: it is this section with $\\theta G$ replaced by $Ht$. What chapter 2 adds is the claim that nature does it.'},

/* ---- 1.7 ---- */
{t:'h2', num:'1.7', text:'The spectral theorem and functions of an operator'},

{t:'p', text:'Most vectors are turned by an operator; a few come back pointing the same way, scaled by a number. Those are its <b>eigenvectors</b> and the numbers are its <b>eigenvalues</b>, and $(A-\\lambda I)|v\\rangle=0$ has a non-zero solution only when $\\det(A-\\lambda I)=0$. For a $2\\times2$ that is $\\lambda^{2}-(\\operatorname{tr}A)\\lambda+\\det A=0$, whose two coefficients are read straight off the matrix. An eigenvector is a direction rather than a vector: normalising leaves only a phase, and for a quantum state that phase is global and unobservable, so an eigenvector really is one physical state.'},

{t:'p', text:'A Hermitian operator has an orthonormal basis of eigenvectors. Take the projector onto each eigenspace and weight it by that eigenvalue, and the operator comes back.'},

{t:'eqbox', cap:'the spectral decomposition', tex:['A = \\sum_{k}\\lambda_{k}P_{k}, \\qquad P_{k}=|v_{k}\\rangle\\langle v_{k}|', 'P_{j}P_{k} = \\delta_{jk}P_{k}, \\qquad \\sum_{k}P_{k} = I'],
 after:'The second line is the resolution of the identity again, now in the eigenbasis of a particular operator. This is the shape every measurement in chapter 2 has: one outcome per eigenvalue, with $P_k$ deciding both how likely that outcome is and what the state becomes afterwards.'},

{t:'p', text:'Once an operator is written that way, a function of it means one thing only: apply the function to the eigenvalues and leave the projectors alone.'},

{t:'eqbox', cap:'a function of an operator', tex:'f(A) = \\sum_{k} f(\\lambda_{k})\\,P_{k}',
 after:'This agrees with the obvious definition wherever the obvious one exists. For a power, $A^{2}=\\sum_{j,k}\\lambda_j\\lambda_kP_jP_k$ collapses to $\\sum_k\\lambda_k^{2}P_k$, so every power series follows — and the definition may then be used for functions with no series at all, such as a square root. The case this course needs constantly is $e^{-iAt}=\\sum_k e^{-i\\lambda_kt}P_k$, which is what makes an evolution operator computable at all.'},

{t:'ex', hd:'Example 1.4 · a spectral decomposition end to end', rows:[
 ['Given','$A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$.'],
 ['Find','Its eigenvalues, its projectors, and $e^{-iAt}$.'],
 ['Method','Characteristic equation; then $(A-\\lambda I)|v\\rangle=0$; then the weighted sum; then the function on the eigenvalues.'],
 ['Solution','$(2-\\lambda)^{2}-1=0$ gives $\\lambda=3$ on $|+\\rangle$ and $\\lambda=1$ on $|-\\rangle$. So $A=3\\,|+\\rangle\\langle+|+1\\,|-\\rangle\\langle-|$ and $e^{-iAt}=e^{-3it}|+\\rangle\\langle+|+e^{-it}|-\\rangle\\langle-|$.'],
 ['Check','The eigenvalues add to the trace, $3+1=4=2+2$, and multiply to the determinant, $3\\times1=3=4-1$. At $t=0$ both exponentials are one and the sum is $P_++P_-=I$, as any evolution operator must be at zero time.']]},

{t:'box', kind:'err', hd:'A function of an operator is never applied entry by entry', html:'For $X=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$ the correct $e^{X}=\\cosh(1)I+\\sinh(1)X$ has entries $1.5431$ and $1.1752$ and eigenvalues $e$ and $e^{-1}$. Exponentiating the entries gives $\\begin{bmatrix}1&e\\\\e&1\\end{bmatrix}$, whose eigenvalues are $1\\pm e$ — one of them negative, so it is not the exponential of any Hermitian matrix. The two agree only for a diagonal matrix, which is why testing on one teaches the wrong lesson.'},

/* ---- 1.8 ---- */
{t:'h2', num:'1.8', text:'Dirac notation'},

{t:'p', text:'Nothing in this chapter needed the notation. Every result was a statement about columns, rows and matrices and could have been written that way throughout. The notation earns its place because it says which object is which without naming a basis, and because the shapes then check themselves.'},

{t:'table', head:['Written','Once a basis is chosen','What it is'], rows:[
 ['$|\\psi\\rangle$','a column of $n$ complex numbers','a state'],
 ['$\\langle\\psi|$','the same column, conjugated and laid on its side','a row'],
 ['$\\langle\\phi|\\psi\\rangle$','row times column','one complex number'],
 ['$|\\phi\\rangle\\langle\\psi|$','column times row','an $n\\times n$ operator'],
 ['$A|\\psi\\rangle$','matrix times column','another state'],
 ['$\\langle\\psi|A|\\psi\\rangle$','row times matrix times column','the expectation value of chapter 2']]},

{t:'p', text:'A matrix product acts on a ket from the right, so the operator written <b>last</b> in a product is applied <b>first</b>: a circuit that runs $H$, then $R_z$, then $H$ is the operator $HR_zH$. Circuit diagrams run left to right and algebra runs right to left, and the two are not in conflict — they are two orders for the same sequence. An operator can also be written entirely in the notation, with no matrix anywhere, by inserting the identity on both sides: $A=\\sum_{j,k}|e_j\\rangle\\langle e_j|A|e_k\\rangle\\langle e_k|$, where $\\langle e_j|A|e_k\\rangle$ is the matrix entry $A_{jk}$. The matrix is not a different object from the operator; it is the operator, read in a basis.'},

/* ---- 1.9 ---- */
{t:'h2', num:'1.9', text:'Square-integrable functions, completeness and truncation'},

{t:'p', text:'A column labels its entries with integers. A function labels them with a continuous coordinate. The same vector-space construction therefore uses an integral in place of a sum. A function belongs to $L^{2}[a,b]$ when its squared modulus has a finite integral, which gives it a finite norm and allows it to be normalised.'},

{t:'eqbox', cap:'the function-space inner product', tex:['\\langle f|g\\rangle=\\int_a^b f^{*}(x)g(x)\\,\\mathrm dx', '\\|f\\|^{2}=\\int_a^b |f(x)|^{2}\\,\\mathrm dx'],
 after:'For example, $\\sin x/\\sqrt\\pi$ and $\\cos x/\\sqrt\\pi$ are orthonormal on $[-\\pi,\\pi]$. Their curves cross, but orthogonality is decided by the integral of their product.'},

{t:'p', text:'An orthonormal family is <b>complete</b> when no non-zero vector is orthogonal to every member. Then the inner products with the basis recover the function. Fourier expansion is this statement for the normalised constant, sine and cosine functions on a finite interval.'},

{t:'eqbox', cap:'completeness, Parseval and truncation', tex:['|f\\rangle=\\sum_{n=1}^{\\infty}c_n|u_n\\rangle, \\qquad c_n=\\langle u_n|f\\rangle', '\\|f\\|^{2}=\\sum_{n=1}^{\\infty}|c_n|^{2}, \\qquad \\left\\|f-\\sum_{n=1}^{N}c_nu_n\\right\\|^{2}=\\sum_{n>N}|c_n|^{2}'],
 after:'Parseval turns the coefficient tail into an exact squared error for the truncated approximation. It controls convergence in norm, not uniform or pointwise convergence at every coordinate.'},

{t:'box', kind:'err', hd:'Two tests that a plot cannot replace', html:'A function can be finite at every point and still have an infinite squared norm on an unbounded interval. A truncated Fourier plot can also look accurate while its pointwise error is poor at selected coordinates. Test the integral for membership in $L^{2}$ and use the coefficient tail for the norm error.'},

/* ---- 1.10 ---- */
{t:'h2', num:'1.10', text:'Summary'},

{t:'ul', items:[
 'A state is a normalised column of complex amplitudes. Its coefficients in a basis are inner products with that basis, and they change when the basis does while the state does not.',
 'The inner product conjugates its first argument. Nearly every wrong answer in this chapter is a missing conjugate.',
 'A phase on the whole state is not physical and may be dropped. A phase between two terms is physical and may never be dropped.',
 'A ket beside a bra is an operator; the projectors of an orthonormal basis add to the identity, and inserting that identity is a derivation step with a name.',
 'Two systems make one by the tensor product, so dimensions multiply and $n$ qubits carry $2^{n}$ amplitudes. A measurement returns $n$ bits.',
 'Hermitian means real eigenvalues and an orthonormal eigenbasis, which is what an observable needs. Unitary means every inner product is preserved, which is what a gate needs. The exponential of a Hermitian operator is unitary.',
 'A function of an operator acts on its eigenvalues and leaves its projectors alone.',
 'Square-integrable functions are vectors with an integral inner product. In a complete orthonormal basis, Parseval gives both the norm and the exact truncation error.']},

{t:'box', kind:'ok', hd:'Six lines to be able to write without looking', html:'$\\langle a|b\\rangle=\\sum_k a_k^{*}b_k$ &nbsp;·&nbsp; $v_j=\\langle e_j|v\\rangle$ &nbsp;·&nbsp; $\\sum_k|e_k\\rangle\\langle e_k|=I$ &nbsp;·&nbsp; $A=\\sum_k\\lambda_kP_k$ &nbsp;·&nbsp; $f(A)=\\sum_kf(\\lambda_k)P_k$ &nbsp;·&nbsp; $e^{-i\\theta\\sigma/2}=\\cos(\\theta/2)I-i\\sin(\\theta/2)\\sigma$.'},

{t:'box', kind:'err', hd:'Four errors that cost a whole question', html:'A missing conjugate in an inner product. A phase cancelled as global when it sat on one branch of a superposition. A function of a matrix applied entry by entry. And a two-qubit state written in the other bit order, which does not make an answer approximately wrong — it makes it an answer to a different question.'}

];
})();
