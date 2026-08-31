/* Course notes — Chapter 2.

   The reading edition of the artifact's chapter 2. It says the same things in
   the same order and is not a transcript: a scene builds in reveal steps and a
   page does not, so a derivation that arrives in four steps on screen arrives
   as one argument here with the same intermediate lines shown. */
(function(){
const P=PLOT, C=P.COL;
const ax=o=>P.Axes(Object.assign({w:700,h:230,pad:{l:58,r:22,t:24,b:40},xtarget:6,ytarget:4},o));

/* One state, three instruments. The bars are computed from the state, so the
   three groups are three predictions rather than three drawings. */
function threebases(){
  const th=Math.PI/3, ph=Math.PI/4;
  const rx=Math.sin(th)*Math.cos(ph), ry=Math.sin(th)*Math.sin(ph), rz=Math.cos(th);
  const a=ax({w:700,h:250,xr:[-0.7,5.8],yr:[0,1.12],
    ylabel:'\\text{probability}',pad:{l:58,r:22,t:24,b:56},
    xticksOverride:[],ytarget:4});
  const bar=(n,v,f,l)=>{ a.rect(n-0.26,0,n+0.26,v,{fill:f});
    a.poly([[n-0.26,v],[n+0.26,v]],{color:l,width:2.2}); };
  bar(0,(1+rz)/2,C.dec.in,C.in);   bar(1,(1-rz)/2,C.dec.in,C.in);
  bar(2,(1+rx)/2,C.dec.mid,C.mid); bar(3,(1-rx)/2,C.dec.mid,C.mid);
  bar(4,(1+ry)/2,C.dec.out,C.out); bar(5,(1-ry)/2,C.dec.out,C.out);
  [['0',0],['1',1],['+',2],['-',3],['+i',4],['-i',5]].forEach(([t,k])=>
    a.note(k,0,t,{fs:12,color:C.muted,anchor:'middle',dy:24}));
  [['Z',0.5,C.in],['X',2.5,C.mid],['Y',4.5,C.out]].forEach(([t,x,col])=>
    a.note(x,0,t,{fs:14,color:col,anchor:'middle',dy:46,tex:true}));
  return a.svg();
}

/* The outcomes of a qubit observable, and the mean of many readings. The
   instrument returns one of the two stems and never the dashed line. */
function expectation(){
  const p0=0.7;
  const a=ax({w:420,h:290,xr:[-1.6,1.6],yr:[0,0.95],
    xlabel:'\\text{outcome}',ylabel:'\\text{probability}',
    pad:{l:58,r:22,t:24,b:44},xtarget:4,ytarget:4});
  a.stem([[-1,1-p0],[1,p0]],{color:C.in,r:5});
  a.vline(2*p0-1,{color:C.err,width:1.6,dash:'4 4'});
  a.note(2*p0-1,0.86,'\\langle A\\rangle',{fs:13,color:C.err,dx:8,tex:true});
  return a.svg();
}

/* The mean and the spread of Z over a family of states. At the two ends the
   state is an eigenstate; between them the mean is a number no instrument
   ever returns. */
function variance(){
  const a=ax({w:420,h:290,xr:[0,Math.PI],yr:[-1.15,1.15],
    xlabel:'\\theta',ylabel:'\\text{value}',
    pad:{l:56,r:22,t:24,b:44},xtarget:4,ytarget:5});
  a.curve(t=>Math.cos(t),{color:C.in,width:2.2});
  a.curve(t=>Math.abs(Math.sin(t)),{color:C.err,width:2.0,dash:'5 4'});
  a.note(0.28,-0.74,'\\langle Z\\rangle',{fs:13,color:C.in,tex:true});
  a.note(1.18,1.02,'\\Delta Z',{fs:13,color:C.err,tex:true});
  return a.svg();
}

/* A superposition of two energy eigenstates, watched in a basis that mixes
   them. Every component is stationary and the sum is not. */
function beat(){
  const a=ax({w:700,h:230,xr:[0,4*Math.PI],yr:[0,1.12],
    xlabel:'\\omega t',ylabel:'P(+)',
    pad:{l:58,r:22,t:24,b:42},xtarget:5,ytarget:4});
  a.curve(t=>Math.cos(t/2)**2,{color:C.in,width:2.2});
  a.hline(0.5,{color:C.muted,width:1.1,dash:'4 4'});
  return a.svg();
}

/* The axis a drive turns the qubit about, for four detunings at one drive
   strength. Isotropic, because the tilt of the axis is the quantity. */
function driveaxis(){
  /* 348 px over an x span of 2.90 and 240 px over a y span of 2.00: both
     120 px to the unit. */
  const a=ax({w:400,h:300,xr:[-0.45,2.45],yr:[-0.35,1.65],
    pad:{l:30,r:22,t:30,b:30},xticksOverride:[],yticksOverride:[],
    grid:false,zeroAxes:true,arrows:true});
  [[1,0,'\\Omega_{x}'],[0,1,'\\Delta']].forEach(([x,y,t])=>{
    a.poly([[0,0],[x,y]],{color:C.grid,width:1.3,dash:'4 4'});
    a.note(x,y,t,{fs:13,color:C.muted,dx:x>0?8:10,dy:y>0?-6:22,tex:true});
  });
  [0.15,0.5,1.0,2.2].forEach((r,i)=>{
    const ang=Math.atan2(1,r*2), col=[C.err,C.h,C.out,C.mid][i];
    a.poly([[0,0],[Math.cos(ang)*1.15,Math.sin(ang)*1.15]],{color:col,width:2.2});
    a.point(Math.cos(ang)*1.15,Math.sin(ang)*1.15,{color:col,r:4});
  });
  a.note(1.20,0.14,'\\text{on resonance}',{fs:12,color:C.mid,tex:true});
  a.note(0.30,1.44,'\\text{far detuned}',{fs:12,color:C.err,tex:true});
  return a.svg();
}

/* The standard error of an estimated probability against the shot count, on
   decade axes. The slope is one half: that is the square root, drawn. */
function shots(){
  const a=ax({w:400,h:300,xr:[1,7],yr:[-4,-0.5],
    xlabel:'\\log_{10} N',ylabel:'\\log_{10}\\mathrm{SE}',
    pad:{l:60,r:22,t:24,b:44},xtarget:4,ytarget:4});
  a.curve(k=>Math.log10(0.5)-k/2,{color:C.err,width:2.2});
  a.curve(k=>Math.log10(Math.sqrt(0.09))-k/2,{color:C.in,width:2.0,dash:'5 4'});
  a.note(2.4,Math.log10(0.5)-1.2,'p=\\tfrac12',{fs:12,color:C.err,dy:-12,tex:true});
  a.note(4.4,Math.log10(Math.sqrt(0.09))-2.2,'p=0.1',{fs:12,color:C.in,dy:40,tex:true});
  return a.svg();
}

window.C2 = [

{t:'page'},

{t:'h1', num:'2', text:'States, measurement and dynamics'},

{t:'p', lead:true, text:'Chapter 1 built a language and nothing in it could have been argued with. This chapter adds the four statements that connect that language to a laboratory. They are postulates: they are not derived from anything, they are what experiment has found to hold, and everything after them follows.'},

{t:'p', text:'Two of the four were already used. The <b>state</b> postulate says a pure state is a normalised vector, with two vectors differing by a global phase describing the same physical state; the <b>composition</b> postulate says two systems combine by the tensor product. This chapter is about the other two: how a state evolves, and what happens when it is read.'},

{t:'box', kind:'ok', hd:'Evolution and measurement', html:'<b>Evolution.</b> A closed system evolves by a unitary operator, and that operator is the exponential of a Hermitian one: $|\\psi(t)\\rangle=e^{-iHt}|\\psi(0)\\rangle$. <b>Measurement.</b> A measurement returns one outcome, with a probability fixed by the state, and it leaves the state changed. Everything in this chapter is one of those two.'},

/* ---- 2.1 ---- */
{t:'h2', num:'2.1', text:'The Born rule'},

{t:'p', text:'An amplitude is not observable. The rule that turns one into something a laboratory can count is the only bridge in the subject between the mathematics and an experiment, and it is one line. Measure in an orthonormal basis $\\{|n\\rangle\\}$; the probability of outcome $n$ is the squared modulus of the coefficient.'},

{t:'eqbox', cap:'the Born rule', tex:'p(n) = \\left|\\langle n|\\psi\\rangle\\right|^{2}',
 after:'The coefficients of chapter 1 now have a name: <b>probability amplitudes</b>. That the probabilities add to one is a theorem rather than a second postulate — insert the resolution of the identity into $\\langle\\psi|\\psi\\rangle=1$ and the sum $\\sum_n|c_n|^{2}=1$ falls out. Normalisation was the bookkeeping; this is what it was bookkeeping for.'},

{t:'box', kind:'err', hd:'The modulus, not the square', html:'$p(n)$ is $|c_{n}|^{2}$ and never $c_{n}^{2}$. For $c=4i/5$ the square is $-16/25$, a negative probability. Squaring the coefficient instead of its modulus is the commonest first error in the subject, and a negative or complex probability is always this mistake and no other.'},

{t:'p', text:'Two things in this course are both called "changing the basis" and they are not the same. A <b>passive change of coordinates</b> rewrites the same state and the same operator in a different orthonormal basis, and every physical prediction is unchanged. <b>Choosing what to measure</b> is a different matter: an instrument whose outcomes are the $X$ eigenstates is a different instrument from one whose outcomes are the $Z$ eigenstates, and it returns a different distribution from the same state.'},

{t:'eqbox', cap:'passive coordinates against an active transformation', tex:['|\\psi\\rangle^{\\prime}=V^{\\dagger}|\\psi\\rangle, \\qquad A^{\\prime}=V^{\\dagger}AV, \\qquad \\langle\\psi|A|\\psi\\rangle=\\langle\\psi^{\\prime}|A^{\\prime}|\\psi^{\\prime}\\rangle', '|\\psi\\rangle\\longmapsto U|\\psi\\rangle \\qquad \\text{with the coordinates and } A \\text{ fixed}'],
 after:'The first line changes only the numbers used to describe the same state and observable, so every prediction is invariant. The second is active: a gate or physical evolution moves the state, and its probabilities generally change. Choosing a new measurement basis changes the projectors of the apparatus and is a third operation.'},

{t:'fig', svg:threebases, cap:'One state, read by three different instruments. The three groups are the eigenbases of $Z$, $X$ and $Y$, and the bars are computed from the state itself. Nothing about the state changed between them; the apparatus did.'},

{t:'box', kind:'warn', hd:'And what a change of basis costs', html:'Real hardware measures in one basis only, almost always the computational one. Measuring $X$ means applying a gate that rotates the $X$ eigenstates onto the computational ones and then measuring as usual. A change of measurement basis therefore costs a gate, that gate has an error, and a scheme that needs many bases pays for each of them.'},

{t:'p', text:'Chapter 1 said that an overlap of zero means two states are perfectly distinguishable. The argument is short. If $\\langle a|b\\rangle=0$, measure with $P_{a}=|a\\rangle\\langle a|$ and $I-P_{a}$: on $|a\\rangle$ the first outcome is certain, and on $|b\\rangle$ it has probability $|\\langle a|b\\rangle|^{2}=0$. If they are not orthogonal, every outcome is one both states can produce, and one copy is not enough to be certain. The best guess succeeds with probability $\\tfrac12(1+\\sin\\theta)$, where $\\cos\\theta=|\\langle a|b\\rangle|$.'},

/* ---- 2.2 ---- */
{t:'h2', num:'2.2', text:'Projective measurement'},

{t:'p', text:'The Born rule was written for an orthonormal basis. The general form replaces the basis vectors by the projectors of the spectral decomposition, and says the same thing wherever both apply.'},

{t:'eqbox', cap:'a projective measurement', tex:['p(a) = \\langle\\psi|P_{a}|\\psi\\rangle', 'P_{j}P_{k}=\\delta_{jk}P_{k}, \\qquad \\sum_{a}P_{a}=I'],
 after:'The two conditions are not decoration. Orthogonality makes the outcomes exclusive and completeness makes the probabilities add to one; drop either and the numbers stop being a distribution. When every projector has rank one this reduces to $p(a)=|\\langle a|\\psi\\rangle|^{2}$. The new case is a repeated eigenvalue, whose projector has higher rank: the instrument then reports a number and cannot tell apart the states inside that eigenspace.'},

{t:'p', text:'A measurement also changes the state. Given the outcome $a$, what is left is the projected state, put back to length one.'},

{t:'eqbox', cap:'the update rule', tex:'|\\psi_{a}\\rangle = \\frac{P_{a}|\\psi\\rangle}{\\sqrt{p(a)}}',
 after:'The division is the renormalisation chapter 1 deliberately did not do: a projector shortens a state, and the length it removes is the probability of the other outcomes. Measure the same observable again immediately and $P_{a}|\\psi_{a}\\rangle=|\\psi_{a}\\rangle$, so the same reading comes back with certainty. That is what makes a reading mean something, and it is what the word <b>projective</b> names.'},

{t:'ex', hd:'Example 2.1 · three measurements in a row', rows:[
 ['Given','A qubit in $|0\\rangle$. Measure $Z$, then $X$, then $Z$ again.'],
 ['Find','The probability that the third reading agrees with the first.'],
 ['Method','Follow each branch: probability, updated state, next measurement.'],
 ['Solution','The first is $+1$ with certainty. The second gives $\\pm1$ with probability $\\tfrac12$ each, leaving $|+\\rangle$ or $|-\\rangle$. From either, the third gives $\\pm1$ with probability $\\tfrac12$. So the third agrees with the first with probability $\\tfrac12$.'],
 ['Check','Omit the middle measurement and the answer is one, because an immediate repeat is certain. The difference is entirely $[Z,X]\\ne0$, and no noise was added anywhere in the story.']]},

{t:'p', text:'A projective measurement is not the most general one an apparatus can perform. The general form keeps only what is needed for the probabilities to be a distribution: a set of positive operators called <b>effects</b> that add to the identity, with $p(m)=\\langle\\psi|E_{m}|\\psi\\rangle$. Projectors are the special case. Effects need not be orthogonal and there need not be as many of them as the space has dimensions.'},

{t:'eqbox', cap:'a POVM gives probabilities and an instrument gives the state', tex:['E_m=\\sum_{\\alpha}M_{m\\alpha}^{\\dagger}M_{m\\alpha}, \\qquad p(m)=\\operatorname{Tr}(\\rho E_m)', '\\rho_m=\\frac{\\sum_{\\alpha}M_{m\\alpha}\\rho M_{m\\alpha}^{\\dagger}}{p(m)}'],
 after:'The effects alone do not determine the conditional state. Two devices can have the same POVM and disturb the system differently because their instruments differ. A projective measurement is the special case $M_m=P_m$.'},

{t:'ex', hd:'Example 2.2 · a readout that sometimes lies', rows:[
 ['Given','A symmetric assignment error $\\epsilon$: $E_{0}=(1-\\epsilon)|0\\rangle\\langle0|+\\epsilon|1\\rangle\\langle1|$ and $E_{1}=I-E_{0}$.'],
 ['Find','What the instrument reports for a state with true $p(0)=q$.'],
 ['Solution','$p_{\\text{rep}}(0)=(1-\\epsilon)q+\\epsilon(1-q)=\\epsilon+(1-2\\epsilon)q$: a straight line of slope $1-2\\epsilon$.'],
 ['Check','At $\\epsilon=0$ it is $q$; at $\\epsilon=\\tfrac12$ it is $\\tfrac12$ whatever $q$ is, and the instrument has stopped reporting anything about the state.']]},

{t:'box', kind:'warn', hd:'Inverting the calibration is not free', html:'That line can be inverted to recover $q$, which is what readout-error mitigation does. Dividing by $1-2\\epsilon$ removes the bias and multiplies the statistical error by the same factor. The correction is exact in expectation and noisier in practice, and a report that gives the corrected number without the widened error bar has not reported the measurement it made.'},

/* ---- 2.3 ---- */
{t:'h2', num:'2.3', text:'Observables, means and spreads'},

{t:'p', text:'An observable is a Hermitian operator, its eigenvalues are the numbers an instrument can report, and its projectors say how often. The average of many readings is one sandwich, and that it agrees with the average is a calculation rather than a definition: expand $A$ spectrally and use the Born rule on each term.'},

{t:'eqbox', cap:'expectation and variance', tex:['\\langle A\\rangle = \\langle\\psi|A|\\psi\\rangle = \\sum_{a} a\\,p(a)', '\\operatorname{Var}(A) = \\langle A^{2}\\rangle - \\langle A\\rangle^{2}'],
 after:'Note which operator is squared where: $\\langle A^{2}\\rangle$ squares the matrix before the sandwich, and $\\langle A\\rangle^{2}$ squares the number afterwards. Their difference is the whole quantity. For any Pauli, $A^{2}=I$, so $\\operatorname{Var}(A)=1-\\langle A\\rangle^{2}$ and no second sandwich is needed.'},

{t:'figrow', n:2, items:[
 {svg:expectation, cap:'A qubit observable with outcomes $-1$ and $+1$, and the mean of many readings. The instrument returns one of the two stems and never the dashed line; the dashed line is where the stems balance.'},
 {svg:variance, cap:'The mean and the spread of $Z$ over the family $\\cos(\\theta/2)|0\\rangle+\\sin(\\theta/2)|1\\rangle$. At the two ends the state is an eigenstate: the spread is zero and the mean is the eigenvalue.'}]},

{t:'box', kind:'err', hd:'An expectation value is not a reading', html:'An instrument measuring $Z$ returns $+1$ or $-1$. It never returns $0.6$, and no single shot ever will. $\\langle Z\\rangle=0.6$ is a statement about a long run of identically prepared systems, and reporting it without the shot count and the error bar is reporting a number nobody measured. The spread vanishes exactly on the eigenstates: $\\Delta A=0$ if and only if $A|\\psi\\rangle=a|\\psi\\rangle$.'},

/* ---- 2.4 ---- */
{t:'h2', num:'2.4', text:'Compatibility and uncertainty'},

{t:'p', text:'Two observables can both be sharp on one state exactly when they share an eigenbasis, and there is a test for that which needs no eigenvectors: the commutator $[A,B]=AB-BA$ vanishes. One direction is immediate, since diagonal matrices commute; the other is the theorem, and it holds for Hermitian operators in finite dimensions.'},

{t:'p', text:'The commutator does more than answer yes or no. It bounds how sharp two readings can be at once, on any state at all. The proof is the Cauchy–Schwarz inequality of chapter 1, applied to the two shifted operators $A-\\langle A\\rangle I$ and $B-\\langle B\\rangle I$.'},

{t:'eqbox', cap:'the Robertson relation', tex:'\\Delta A \\,\\Delta B \\;\\ge\\; \\tfrac12\\left|\\langle [A,B]\\rangle\\right|',
 after:'For $X$ and $Z$ the commutator is $-2iY$, so the bound is $\\left|\\langle Y\\rangle\\right|$ — a number that depends on the state. On $|0\\rangle$ it is zero and the relation says nothing, correctly, since $\\Delta Z=0$ there makes the left side zero too. On $|{+}i\\rangle$ it is one, and the product of the two spreads is also one: the relation is saturated and no state does better.'},

{t:'box', kind:'err', hd:'It is not about clumsy instruments', html:'The relation says nothing about disturbing a system by looking at it. $\\Delta A$ is the spread of the readings of $A$ over many runs of <b>one</b> preparation, and $\\Delta B$ the same for $B$ over a separate set of runs of the same preparation. No single experiment measures both, and none has to: the claim is about two distributions. For position and momentum, $[x,p]=i\\hbar I$ gives the constant $\\hbar/2$; the qubit case, where the bound moves with the state, is the general one and the constant is the accident.'},

/* ---- 2.5 ---- */
{t:'h2', num:'2.5', text:'The Pauli algebra'},

{t:'p', text:'Three matrices carry almost all of the one-qubit course. Each is Hermitian, so each is an observable; each is also unitary, so each is a gate. That coincidence is particular to them, and it is why they appear on both sides of every calculation here.'},

{t:'table', head:['Observable','$+1$ eigenstate','$-1$ eigenstate'], rows:[
 ['$X=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$','$|+\\rangle=\\tfrac{1}{\\sqrt2}(1,1)$','$|-\\rangle=\\tfrac{1}{\\sqrt2}(1,-1)$'],
 ['$Y=\\begin{bmatrix}0&-i\\\\i&0\\end{bmatrix}$','$|{+}i\\rangle=\\tfrac{1}{\\sqrt2}(1,i)$','$|{-}i\\rangle=\\tfrac{1}{\\sqrt2}(1,-i)$'],
 ['$Z=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}$','$|0\\rangle=(1,0)$','$|1\\rangle=(0,1)$']]},

{t:'p', text:'Each squares to the identity and each is traceless, and those two facts force the eigenvalues: a traceless operator whose square is the identity has eigenvalues summing to zero and squaring to one, which leaves $+1$ and $-1$, one of each. Multiplying two of them never needs a matrix.'},

{t:'eqbox', cap:'the Pauli product rule', tex:['\\sigma_{i}\\sigma_{j} = \\delta_{ij}\\,I + i\\sum_{k}\\varepsilon_{ijk}\\,\\sigma_{k}', '[\\sigma_{i},\\sigma_{j}] = 2i\\sum_{k}\\varepsilon_{ijk}\\sigma_{k}, \\qquad \\{\\sigma_{i},\\sigma_{j}\\} = 2\\delta_{ij}I'],
 after:'Read the first line in two halves. Same index: the identity. Different indices: $i$ times the third, with a plus sign in the cyclic order $X\\to Y\\to Z\\to X$ and a minus against it. Two different Pauli operators therefore <b>anticommute</b>, and that single fact does most of the work in chapters 4 and 5.'},

{t:'p', text:'An instrument can be aimed along any direction. For a unit vector $\\mathbf{n}$ the observable is $\\mathbf{n}\\cdot\\boldsymbol\\sigma$, its square is the identity, its eigenvalues are again $\\pm1$, and its projectors are one line: $P_{\\pm}=\\tfrac12(I\\pm\\mathbf{n}\\cdot\\boldsymbol\\sigma)$. Collecting the three Pauli means of the state into a real vector $r_{a}=\\langle\\sigma_{a}\\rangle$ turns every single-qubit measurement question into a dot product.'},

{t:'eqbox', cap:'a measurement along a direction', tex:'p(\\pm) = \\tfrac12\\left(1 \\pm \\mathbf{n}\\cdot\\mathbf{r}\\right)',
 after:'A pure state has $|\\mathbf{r}|=1$, so three numbers describe it completely, and they are measurable: run the circuit three times over, once in each basis. Writing $\\mathbf{n}\\cdot\\mathbf{r}=\\cos\\alpha$ gives $p(+)=\\cos^{2}(\\alpha/2)$, and $\\alpha$ is the angle between two <b>vectors</b> — twice the angle between the corresponding states. Two orthogonal states sit at opposite ends of the sphere, not at a right angle. That factor of two is the double cover of chapter 1, appearing as geometry.'},

/* ---- 2.6 ---- */
{t:'h2', num:'2.6', text:'Dynamics'},

{t:'p', text:'The function-space vectors of section 1.9 become physical wavefunctions when the coordinate is position. In one dimension, position multiplies a wavefunction and momentum differentiates it. A free particle has kinetic energy only.'},

{t:'eqbox', cap:'coordinate representation and a free particle', tex:['(\\hat{x}\\psi)(x)=x\\psi(x), \\qquad (\\hat{p}\\psi)(x)=-i\\hbar\\frac{\\mathrm d\\psi}{\\mathrm dx}', '\\hat H_0=\\frac{\\hat p^{2}}{2m}=-\\frac{\\hbar^{2}}{2m}\\frac{\\mathrm d^{2}}{\\mathrm dx^{2}}'],
 after:'The plane wave $e^{ikx}$ has momentum $p=\\hbar k$ and energy $E=\\hbar^{2}k^{2}/(2m)$. It extends across all space and is not square-integrable, so a physical free-particle state is a normalisable wave packet built as a continuous superposition of plane waves.'},

{t:'p', text:'Confining the particle to $0<x<a$ with infinite walls keeps the free-particle equation inside the well and adds the boundary conditions $\\phi(0)=\\phi(a)=0$. Those conditions select a discrete set of standing waves.'},

{t:'eqbox', cap:'the infinite square well', tex:['\\phi_n(x)=\\sqrt{\\frac{2}{a}}\\sin\\!\\left(\\frac{n\\pi x}{a}\\right), \\qquad n=1,2,\\ldots', 'E_n=\\frac{\\hbar^{2}\\pi^{2}n^{2}}{2ma^{2}}'],
 after:'There is no $n=0$ state because it is the zero function. Each energy eigenstate has a time-independent probability density. A superposition of two levels has a moving cross term at angular frequency $(E_m-E_n)/\\hbar$. For the first two levels, $E_2=4E_1$ and the period is $2\\pi\\hbar/(3E_1)$.'},

{t:'p', text:'A closed system evolves by a differential equation with one operator in it, the <b>Hamiltonian</b>. With $\\hbar=1$, and for a Hamiltonian that does not depend on time, the solution is the exponential of chapter 1 and no new mathematics is needed.'},

{t:'eqbox', cap:'closed-system evolution', tex:['i\\,\\frac{\\mathrm{d}}{\\mathrm{d}t}|\\psi(t)\\rangle = H\\,|\\psi(t)\\rangle', '|\\psi(t)\\rangle = U(t)|\\psi(0)\\rangle, \\qquad U(t)=e^{-iHt}'],
 after:'$H$ is Hermitian because it is the observable called energy, and the exponential of a Hermitian operator is unitary. So the evolution preserves every inner product and the probabilities keep adding to one at every time, and nothing had to be imposed to make that true. Replacing $H$ by $H+cI$ multiplies $U$ by a global phase, so only energy <b>differences</b> are physical.'},

{t:'p', text:'Start in an eigenstate of the Hamiltonian and the exponential returns a phase, $|E_{n}(t)\\rangle=e^{-iE_{n}t}|E_{n}\\rangle$. That is a global phase, so no probability changes ever: such a state is <b>stationary</b>, and the name is exact. Start in a superposition of two of them and each term picks up its own phase; pulling out the first as a global one leaves a relative phase turning at the difference $E_{2}-E_{1}$.'},

{t:'fig', svg:beat, cap:'A qubit started in $|+\\rangle$ under $H=\\tfrac{\\omega}{2}Z$, watched in the $X$ basis. The two energy eigenstates are each stationary and their sum is not. In the computational basis nothing at all happens: $P(0)=\\tfrac12$ at every time, and a reader watching only that basis would report a dead qubit.'},

{t:'p', text:'A qubit driven by an engineered field has, in the frame the drive defines, a Hamiltonian built from the three Pauli operators and nothing else. Since $(\\mathbf{n}\\cdot\\boldsymbol\\sigma)^{2}=I$, the closed form applies at once, and a gate is not a separate kind of object bolted onto the theory: it is what a Hamiltonian does for a chosen length of time.'},

{t:'eqbox', cap:'a driven qubit', tex:['H = \\tfrac12\\left(\\Omega_{x}X+\\Omega_{y}Y+\\Delta Z\\right) = \\tfrac{\\Omega}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma', 'U(t) = \\cos\\!\\left(\\tfrac{\\Omega t}{2}\\right)I - i\\sin\\!\\left(\\tfrac{\\Omega t}{2}\\right)\\mathbf{n}\\cdot\\boldsymbol\\sigma'],
 after:'Three knobs, three properties of one rotation. The <b>pulse area</b> $\\Omega t$ sets the angle turned through, so a $\\pi$ pulse is a bit flip and a $\\pi/2$ pulse makes an even superposition. The <b>phase of the drive</b> chooses an axis in the equator. The <b>detuning</b> tilts that axis towards $z$, and the population can then reach only $(\\Omega_{x}/\\Omega)^{2}$.'},

{t:'figrow', n:2, items:[
 {svg:driveaxis, cap:'The axis the drive turns the qubit about, for four detunings at one drive strength. On resonance it lies in the equator and the drive moves the population fully; far off it lies almost along $z$ and the drive barely tips the state at all.'},
 {svg:shots, cap:'The standard error of an estimated probability against the shot count, on decade axes. The slope is one half in both cases: that is the square root, drawn. A rare outcome is cheaper in absolute terms and dearer in relative ones.'}]},

{t:'box', kind:'warn', hd:'Where a gate error comes from', html:'A pulse a few per cent too long turns through a few per cent too much: a <b>coherent</b> error, the same every time, which accumulates over a circuit rather than averaging away. A residual detuning does the same about a slightly wrong axis. Both are calibration failures rather than noise, and both are why chapter 5 counts depth.'},

/* ---- 2.7 ---- */
{t:'h2', num:'2.7', text:'Finite shots'},

{t:'p', text:'Every probability in this chapter is exact and none of them is ever observed. What is observed is a count: run the circuit $N$ times, see the outcome $K$ times, report $K/N$. That number is a random variable and its spread is known.'},

{t:'eqbox', cap:'the cost of a measurement', tex:'K\\sim\\mathrm{Binomial}(N,p), \\qquad \\mathrm{SE}\\!\\left(\\tfrac{K}{N}\\right)=\\sqrt{\\frac{p(1-p)}{N}}',
 after:'The worst case is $p=\\tfrac12$, where the standard error is $1/(2\\sqrt N)$. One more decimal place costs a hundred times as many shots: one per cent needs of order ten thousand shots, one part in a thousand a million. No hardware improvement changes this, because it is counting and not physics. For a $\\pm1$ observable the same statement reads $\\mathrm{SE}=\\sqrt{(1-\\langle A\\rangle^{2})/N}$.'},

{t:'box', kind:'err', hd:'Sampling error is not noise', html:'Sampling error is present on a perfect device and shrinks as $1/\\sqrt N$. State-preparation, gate and readout errors are <b>systematic</b>: they bias the answer, and more shots make the wrong number more precise rather than more right. A report that gives a shot count and no error bar, or an error bar with no statement of which of the two it covers, has not reported the measurement.'},

/* ---- 2.8 ---- */
{t:'h2', num:'2.8', text:'Summary'},

{t:'ul', items:[
 'A measurement returns one outcome with probability $p(a)=\\langle\\psi|P_{a}|\\psi\\rangle$, and leaves the state $P_{a}|\\psi\\rangle$ put back to length one. The outcomes are the eigenvalues, not the eigenvectors.',
 'Choosing a measurement basis is choosing an experiment, not a coordinate system. On real hardware it costs a gate.',
 'An expectation value is a mean over repetitions and is usually not a reading any instrument can return. A variance vanishes exactly on the eigenstates.',
 'Two observables can both be sharp exactly when they commute; otherwise $\\Delta A\\,\\Delta B\\ge\\tfrac12|\\langle[A,B]\\rangle|$, which is a statement about two distributions and not about a clumsy apparatus.',
 'The three Pauli operators are Hermitian and unitary at once, square to the identity, and multiply by one cyclic rule.',
 'A closed system evolves by $U(t)=e^{-iHt}$. An energy eigenstate is stationary; two of them beat at their difference; a gate is a Hamiltonian run for a chosen time.',
 'A histogram of counts is an estimate with an error bar of $\\sqrt{p(1-p)/N}$, and never the distribution itself.']},

{t:'box', kind:'err', hd:'Four errors that cost a whole question', html:'Squaring an amplitude instead of its modulus. Reporting an expectation value as though an instrument could return it. Reading the uncertainty relation as a statement about disturbing the system. And treating a histogram of counts as the distribution rather than as an estimate of it.'},

{t:'box', kind:'ok', hd:'What comes next', html:'Everything here assumed the system is alone and its state is a single vector. Chapter 3 drops both: a system that is one half of a larger one has no vector of its own, and describing it needs the density operator. That is also where a measurement whose result was thrown away finally gets a proper description.'}

];
})();
