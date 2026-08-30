/* Course notes — Chapter 3.

   The reading edition of the artifact's chapter 3. It says the same things in
   the same order and is not a transcript: a scene builds in reveal steps and a
   page does not, so an argument that arrives in four steps on screen arrives
   here as one paragraph with the same intermediate lines shown. */
(function(){
const P=PLOT, C=P.COL;
const ax=o=>P.Axes(Object.assign({w:700,h:230,pad:{l:58,r:22,t:24,b:40},xtarget:6,ytarget:4},o));

/* Which qubit matrices are states. Isotropic, because the shape of the region
   is the claim: 400 px over an x span of 1.60 and 150 px over a y span of
   0.60, both 250 px to the unit. */
function physical(){
  const a=P.Axes({w:480,h:224,xr:[-0.30,1.30],yr:[-0.05,0.55],
    pad:{l:56,r:24,t:30,b:44},
    xticksOverride:[0,0.25,0.5,0.75,1],yticksOverride:[0,0.25,0.5],
    grid:false,zeroAxes:true,arrows:false});
  a.area(p=>Math.sqrt(Math.max(0,p*(1-p))),0,1,{color:C.dec.in});
  const arc=[]; for(let i=0;i<=160;i++){ const p=i/160; arc.push([p,Math.sqrt(Math.max(0,p*(1-p)))]); }
  a.poly(arc,{color:C.in,width:2.2});
  a.point(0.55,0.20,{color:C.out,r:5});
  a.note(0.55,0.20,'\\text{a state}',{fs:12,color:C.out,dx:12,dy:26,tex:true});
  a.point(0.85,0.45,{color:C.err,r:5});
  a.note(1.00,0.45,'\\text{not a state}',{fs:12,color:C.err,dy:5,tex:true});
  a.note(1.26,0,'p_{0}',{fs:12,color:C.ink,anchor:'end',dy:34,tex:true});
  a.note(-0.28,0.30,'|c|',{fs:12,color:C.ink,tex:true});
  return a.svg();
}

/* A flat cross-section of the ball of qubit states. Isotropic: 400 px over an
   x span of 5.52 and 174 px over a y span of 2.40, both 72.5 px to the unit,
   so the rim is a circle and the length of a vector is readable. */
function ball(){
  const a=P.Axes({w:452,h:226,xr:[-2.76,2.76],yr:[-1.20,1.20],
    pad:{l:26,r:26,t:26,b:26},xticksOverride:[],yticksOverride:[],
    grid:false,zeroAxes:false,arrows:false});
  const ring=[]; for(let i=0;i<=200;i++){ const t=2*Math.PI*i/200; ring.push([Math.cos(t),Math.sin(t)]); }
  a.poly(ring,{color:C.grid,width:1.5});
  a.poly([[-1.18,0],[1.18,0]],{color:C.rule,width:1.1});
  a.poly([[0,-1.18],[0,1.18]],{color:C.rule,width:1.1});
  const pu=[Math.cos(0.9),Math.sin(0.9)];
  a.poly([[0,0],pu],{color:C.in,width:2.4});
  a.point(pu[0],pu[1],{color:C.in,r:5});
  a.note(pu[0],pu[1],'\\text{pure}',{fs:12,color:C.in,dx:10,dy:-6,tex:true});
  const mx=[0.46*Math.cos(-0.6),0.46*Math.sin(-0.6)];
  a.poly([[0,0],mx],{color:C.mid,width:2.4});
  a.point(mx[0],mx[1],{color:C.mid,r:5});
  a.note(mx[0],mx[1],'\\text{mixed}',{fs:12,color:C.mid,dx:10,dy:16,tex:true});
  a.point(0,0,{color:C.err,r:5});
  a.note(0,0,'I/2',{fs:12,color:C.err,dx:-10,dy:-12,tex:true,anchor:'end'});
  a.note(1.22,0,'x',{fs:12,color:C.muted,dx:6,dy:18,tex:true});
  a.note(0,1.10,'z',{fs:12,color:C.muted,dx:8,tex:true});
  return a.svg();
}

/* The two elementary channels acting on |+>, side by side in one frame is not
   possible — the parameters mean different things — so they are two figures.
   Damping first: the population falls linearly and the coherence as a square
   root. */
function damping(){
  const a=ax({w:420,h:290,xr:[0,1],yr:[0,0.78],
    xlabel:'\\gamma',ylabel:'\\text{value}',
    pad:{l:60,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(g=>0.5*(1-g),{color:C.in,width:2.2});
  a.curve(g=>0.5*Math.sqrt(1-g),{color:C.mid,width:2.0,dash:'5 4'});
  a.note(0.26,0.70,'\\rho_{11}',{fs:12,color:C.in,tex:true});
  a.note(0.60,0.70,'|\\rho_{01}|',{fs:12,color:C.mid,tex:true});
  return a.svg();
}

/* Dephasing: the populations are a flat line and only the coherence moves. */
function dephasing(){
  const a=ax({w:420,h:290,xr:[0,1],yr:[0,0.78],
    xlabel:'p',ylabel:'\\text{value}',
    pad:{l:60,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(()=>0.5,{color:C.in,width:2.2});
  a.curve(p=>0.5*Math.abs(1-2*p),{color:C.mid,width:2.0,dash:'5 4'});
  a.point(0.5,0,{color:C.err,r:5});
  a.note(0.5,0.20,'\\text{coherence gone}',{fs:12,color:C.err,anchor:'middle',tex:true});
  a.note(0.05,0.70,'\\rho_{00},\\rho_{11}',{fs:12,color:C.in,tex:true});
  a.note(0.80,0.70,'|\\rho_{01}|',{fs:12,color:C.mid,tex:true});
  return a.svg();
}

/* Relaxation and dephasing in time, with the ceiling the model imposes drawn
   beside the coherence it bounds. */
function times(){
  const T2=1.5;
  const a=ax({w:700,h:250,xr:[0,4],yr:[0,1.35],
    xlabel:'t/T_{1}',ylabel:'\\text{value}',
    pad:{l:58,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(t=>Math.exp(-t),{color:C.in,width:2.2});
  a.curve(t=>Math.exp(-t/T2),{color:C.mid,width:2.0,dash:'5 4'});
  a.curve(t=>Math.exp(-t/2),{color:C.grid,width:1.5});
  a.note(1.15,1.22,'\\rho_{11}',{fs:12,color:C.in,tex:true});
  a.note(1.95,1.22,'|\\rho_{01}|',{fs:12,color:C.mid,tex:true});
  a.note(2.85,1.22,'T_{2}=2T_{1}',{fs:12,color:C.muted,tex:true});
  return a.svg();
}

/* The two Schmidt coefficients of the standard one-parameter family. */
function schmidt(){
  const a=ax({w:420,h:290,xr:[0,Math.PI/2],yr:[0,1.10],
    xlabel:'\\theta',ylabel:'\\lambda',
    pad:{l:56,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(t=>Math.cos(t)**2,{color:C.in,width:2.2});
  a.curve(t=>Math.sin(t)**2,{color:C.mid,width:2.0,dash:'5 4'});
  a.vline(Math.PI/4,{color:C.err,width:1.5,dash:'3 4'});
  a.note(0.25,0.45,'\\lambda_{1}',{fs:12,color:C.in,tex:true});
  a.note(1.10,0.45,'\\lambda_{2}',{fs:12,color:C.mid,tex:true});
  return a.svg();
}

/* The entropy of a two-term Schmidt spectrum. */
function entropy(){
  const h=l=>(l<=0||l>=1)?0:-l*Math.log2(l)-(1-l)*Math.log2(1-l);
  const a=ax({w:420,h:290,xr:[0,1],yr:[0,1.12],
    xlabel:'\\lambda_{1}',ylabel:'S\\,(\\text{bits})',
    pad:{l:60,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(h,{color:C.in,width:2.2});
  a.point(0.5,1,{color:C.out,r:5});
  a.note(0.5,1,'\\text{one ebit}',{fs:12,color:C.out,anchor:'middle',dy:-12,tex:true});
  return a.svg();
}

/* The CHSH value over one family of angles, with both bounds drawn. */
function chsh(){
  const d=Math.PI/180;
  const a=ax({w:700,h:250,xr:[0,90],yr:[0,3.2],
    xlabel:'\\varphi\\,(\\text{degrees})',ylabel:'S',
    pad:{l:56,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(f=>2*(Math.cos(f*d)+Math.sin(f*d)),{color:C.in,width:2.2});
  a.hline(2,{color:C.err,width:1.7,dash:'5 4'});
  a.hline(2*Math.SQRT2,{color:C.out,width:1.3,dash:'2 4'});
  a.point(45,2*Math.SQRT2,{color:C.out,r:5});
  a.note(45,2*Math.SQRT2,'2\\sqrt2',{fs:12,color:C.out,anchor:'middle',dy:-12,tex:true});
  a.note(8,1.28,'\\text{classical bound}',{fs:12,color:C.err,tex:true});
  return a.svg();
}

window.C3 = [

{t:'page'},

{t:'h1', num:'3', text:'Mixed states and entanglement'},

{t:'p', lead:true, text:'Chapters 1 and 2 assumed two things without saying so: that the system is alone, and that its preparation is known exactly. Both fail as soon as a qubit sits beside anything else. This chapter replaces the state vector with an operator that survives both failures, and it needs no new postulate to do it.'},

{t:'p', text:'Two ordinary situations break the vector. In the first, a device emits $|0\\rangle$ half the time and $|1\\rangle$ the other half and nobody records which; that is not the superposition $\\left(|0\\rangle+|1\\rangle\\right)/\\sqrt2$, because the superposition gives a certain answer in the $X$ basis and the device gives a coin there. In the second, two qubits are in a pure state of the pair while neither one has a vector of its own. What replaces the vector in both cases is one matrix, the <b>density operator</b>.'},

/* ---- 3.1 ---- */
{t:'h2', num:'3.1', text:'The density operator'},

{t:'p', text:'For a pure state the definition is the outer product of chapter 1. For a preparation that produces $|\\psi_i\\rangle$ with classical probability $p_i$ it is the weighted sum of those. The weights are ordinary probabilities describing a classical coin, and they are added rather than superposed: a superposition of two states is a third state, and a mixture of two states is neither of them and is not a vector at all.'},

{t:'eqbox', cap:'the density operator', tex:['\\rho_{\\psi} = |\\psi\\rangle\\langle\\psi|', '\\rho = \\sum_{i} p_{i}\\,|\\psi_{i}\\rangle\\langle\\psi_{i}|, \\qquad p_{i}\\ge0, \\qquad \\sum_{i}p_{i}=1'],
 after:'For one qubit the diagonal entries are the probabilities a computational-basis reading returns, and the off-diagonal entry is the <b>coherence</b> — the only place a relative phase survives, and therefore the only thing an $X$ or a $Y$ reading can see. Replacing $|\\psi\\rangle$ by $e^{i\\gamma}|\\psi\\rangle$ leaves $\\rho$ unchanged, because the two phases meet as $e^{i\\gamma}e^{-i\\gamma}$: the global-phase convention of chapter 1 stops being a convention here and becomes a property of the object.'},

{t:'p', text:'Not every square matrix is a state. Three conditions are needed, and each protects a probability: Hermiticity makes every expectation value real, positivity makes every probability non-negative, and unit trace makes them add to one. Together the eigenvalues of $\\rho$ are a probability distribution.'},

{t:'eqbox', cap:'which matrices are physical', tex:'\\rho=\\rho^{\\dagger}, \\qquad \\rho\\succeq0, \\qquad \\operatorname{Tr}\\rho=1',
 after:'For one qubit these collapse to a single inequality on the coherence, $|\\rho_{01}|^{2}\\le\\rho_{00}\\rho_{11}$, which is positivity written as "the determinant is not negative". It is a real physical statement rather than bookkeeping: a nearly-certain qubit is nearly incoherent.'},

{t:'fig', svg:physical, cap:'Every one-qubit matrix with a real coherence, drawn as a point. The shaded half disc is the physical region and the curve is its edge, where the matrix is pure. The upper point is Hermitian and has trace one, and is still not a state.'},

{t:'box', kind:'err', hd:'Two tests are not three', html:'Hermitian with unit trace is easy to arrange and means nothing on its own. Positivity is the condition that actually restricts, and it is the one skipped: a matrix estimated from noisy measured data very often fails it by a small amount, and every tomography routine has to project back onto the physical set. A reported state with a negative eigenvalue is a report that has not finished.'},

{t:'p', text:'Every prediction comes from one trace, and the same formula covers pure and mixed states with no change of case. That it agrees with the average over branches is a calculation rather than a definition: the trace does not care about the order of a product as long as the order is only rotated, so $\\operatorname{Tr}(|\\psi\\rangle\\langle\\psi|A)=\\langle\\psi|A|\\psi\\rangle$, and applying that term by term gives $\\sum_i p_i\\langle\\psi_i|A|\\psi_i\\rangle$ — the quantum average inside each branch, then the classical average over branches.'},

{t:'eqbox', cap:'every prediction, from one trace', tex:'\\langle A\\rangle = \\operatorname{Tr}\\left(\\rho A\\right), \\qquad p(m) = \\operatorname{Tr}\\left(\\rho E_{m}\\right)',
 after:'So $\\rho$ carries exactly what is needed to predict every measurement on the system, and nothing else. It is not a shorthand for a longer story about which state was really made; it is the complete answer to every question that can be asked of the system alone.'},

{t:'ex', hd:'Example 3.1 · one matrix, two preparations', rows:[
 ['Given','Device A emits $|{+}\\rangle$ or $|{-}\\rangle$, each with probability $\\tfrac12$. Device B emits $|0\\rangle$ or $|1\\rangle$, each with probability $\\tfrac12$.'],
 ['Find','Whether any measurement separates them.'],
 ['Solution','Both give $\\tfrac12 I$. Since every prediction is $\\operatorname{Tr}(\\rho E)$ and the two operators are equal, every probability of every outcome of every measurement agrees, on any number of copies.'],
 ['Check','Try $X$ on device A. It emits $X$ eigenstates, but which one is a fair coin, so the $X$ reading is a coin as well — exactly as it is for device B.']]},

{t:'box', kind:'warn', hd:'Where this is misread', html:'"The qubit really was in $|0\\rangle$ or $|1\\rangle$, we just do not know which" is a story, not a fact, and device A shows it is not forced. Nothing in the mathematics picks a preferred decomposition and no experiment does either. The matrix is the physics; the ensemble behind it is a description of a laboratory.'},

/* ---- 3.2 ---- */
{t:'h2', num:'3.2', text:'Purity, and the ball of qubit states'},

{t:'p', text:'The single most useful number about a density operator is the trace of its square. It is one exactly for pure states, where $\\rho^{2}=\\rho$ and the rank is one, and it is $1/d$ for the maximally mixed state $I/d$. It needs no diagonalisation: it is the sum of the squared moduli of all the entries.'},

{t:'eqbox', cap:'purity', tex:'\\gamma = \\operatorname{Tr}\\left(\\rho^{2}\\right) = \\sum_{k}\\lambda_{k}^{2}, \\qquad \\frac1d \\le \\gamma \\le 1',
 after:'Purity says <b>how</b> mixed and never <b>which</b> state. It is one number and a qubit state needs three: for a qubit the trace and the purity fix the two eigenvalues but say nothing about the eigenbasis, so a whole family shares one purity.'},

{t:'p', text:'For a qubit there is a complete picture. The three Pauli means chapter 2 collected into a vector are not a summary of the state, they <b>are</b> the state: the four matrices $I,X,Y,Z$ span every two-by-two matrix, and the trace condition fixes the coefficient of $I$.'},

{t:'eqbox', cap:'a qubit state as a vector', tex:['\\rho = \\tfrac12\\left(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma\\right), \\qquad r_{a}=\\operatorname{Tr}\\left(\\rho\\,\\sigma_{a}\\right)', '\\lambda_{\\pm}=\\tfrac12\\left(1\\pm|\\mathbf{r}|\\right), \\qquad \\operatorname{Tr}\\rho^{2}=\\tfrac12\\left(1+|\\mathbf{r}|^{2}\\right)'],
 after:'Positivity is now the single statement $|\\mathbf{r}|\\le1$, so the set of qubit states is a solid ball: pure states on the surface, mixed states inside, and $I/2$ at the exact centre. Chapter 4 draws the whole sphere and names the two angles; here only the length matters.'},

{t:'fig', svg:ball, cap:'A flat cross-section through the ball of qubit states. A pure state reaches the rim, a mixed one falls short, and $I/2$ sits at the centre with no direction at all.'},

{t:'box', kind:'err', hd:'The centre is not half way between $|0\\rangle$ and $|1\\rangle$', html:'$\\left(|0\\rangle+|1\\rangle\\right)/\\sqrt2$ is $|{+}\\rangle$, a pure state on the rim. The centre of the ball is the <b>mixture</b> of $|0\\rangle$ and $|1\\rangle$, which is a different object entirely. Adding vectors and adding matrices are two different operations, and this is the picture in which the difference is impossible to miss.'},

/* ---- 3.3 ---- */
{t:'h2', num:'3.3', text:'Quantum channels'},

{t:'p', text:'A closed system evolves by a unitary; a qubit on a chip is not closed. The evolution of an open system is a <b>quantum channel</b>, and every channel can be written as a sum of terms of one shape. The second condition below is what keeps the trace at one, and the check is one line: $\\operatorname{Tr}\\mathcal{E}(\\rho)=\\sum_k\\operatorname{Tr}(K_k^{\\dagger}K_k\\rho)=\\operatorname{Tr}\\rho$. A unitary is the one-term case.'},

{t:'eqbox', cap:'a channel in Kraus form', tex:'\\mathcal{E}(\\rho)=\\sum_{k}K_{k}\\,\\rho\\,K_{k}^{\\dagger}, \\qquad \\sum_{k}K_{k}^{\\dagger}K_{k}=I',
 after:'The form is general rather than convenient: couple the system to an environment, run one unitary on the pair, then ignore the environment, and every channel arises that way. Nothing in the theory has been weakened — the whole is still a closed system running a unitary, and what makes the map on $\\rho$ non-unitary is only that part of the result is never looked at. Two different sets of Kraus operators can describe the same channel, so the operators are not physical and the map is.'},

{t:'p', text:'Two elementary qubit channels carry almost all of the practice. <b>Amplitude damping</b> describes a qubit in its upper level emitting and falling to the lower one, with $\\gamma$ the probability that the emission happens. <b>Dephasing</b>, in its phase-flip form, applies $Z$ with probability $p$ and does nothing otherwise.'},

{t:'eqbox', cap:'amplitude damping', tex:['K_{0}=\\begin{bmatrix}1&0\\\\0&\\sqrt{1-\\gamma}\\end{bmatrix}, \\qquad K_{1}=\\begin{bmatrix}0&\\sqrt{\\gamma}\\\\0&0\\end{bmatrix}', '\\rho_{11}\\mapsto(1-\\gamma)\\rho_{11}, \\qquad \\rho_{01}\\mapsto\\sqrt{1-\\gamma}\\,\\rho_{01}'],
 after:'$K_{1}$ is not a matrix any unitary could be: it sends $|1\\rangle$ to $|0\\rangle$ and $|0\\rangle$ to nothing, describing the branch in which a photon was emitted, and that branch is not reversible because the photon is gone. The two branches together do preserve the trace. At $\\gamma=1$ every state becomes $|0\\rangle$, which is why this is the model of relaxation towards a cold equilibrium.'},

{t:'eqbox', cap:'the phase-flip channel', tex:['\\mathcal{E}_{Z}(\\rho)=(1-p)\\,\\rho + p\\,Z\\rho Z', '\\rho_{00},\\rho_{11}\\ \\text{unchanged}, \\qquad \\rho_{01}\\mapsto(1-2p)\\,\\rho_{01}'],
 after:'At $p=\\tfrac12$ the coherence is gone completely and what is left is the diagonal part of what was there. That is exactly the unrecorded measurement chapter 2 promised to describe: measuring $Z$ and throwing the result away is $\\rho\\mapsto|0\\rangle\\langle0|\\rho|0\\rangle\\langle0|+|1\\rangle\\langle1|\\rho|1\\rangle\\langle1|$, and no new postulate was needed. At $p=1$ the channel is the gate $Z$ and nothing has been lost, so the destruction is greatest in the middle and not at the end.'},

{t:'figrow', n:2, items:[
 {svg:damping, cap:'The upper population and the coherence of $|{+}\\rangle$ under amplitude damping. The population falls linearly in $\\gamma$ and the coherence as its square root, so at every partial damping more coherence is left than population.'},
 {svg:dephasing, cap:'The same two quantities under the phase-flip channel. The populations are a flat line at one half for every $p$. Only the coherence moves, and it is what carries every interference effect in this course.'}]},

{t:'box', kind:'warn', hd:'Decoherence is basis-dependent and often misstated', html:'The phase-flip channel destroys coherence <b>in the $Z$ basis</b> and does nothing at all to a state already diagonal there: a qubit sitting in $|0\\rangle$ is untouched by any amount of dephasing. "The environment destroys superpositions" is only true once the basis is named, and naming it is what the engineering of a qubit is about.'},

/* ---- 3.4 ---- */
{t:'h2', num:'3.4', text:'Relaxation and dephasing in time'},

{t:'p', text:'Applied continuously rather than once, the two channels give two exponentials with two time constants. $T_{1}$ is how long a population survives and $T_{2}$ how long a relative phase does, and they are not independent: losing the population also destroys the coherence, at half the rate, which is the same $\\sqrt{1-\\gamma}$ seen above.'},

{t:'eqbox', cap:'the two decays, and the inequality between them', tex:['\\rho_{11}(t)=\\rho_{11}^{\\mathrm{eq}}+\\left[\\rho_{11}(0)-\\rho_{11}^{\\mathrm{eq}}\\right]e^{-t/T_{1}}, \\qquad \\rho_{01}(t)=e^{-t/T_{2}}\\rho_{01}(0)', '\\frac{1}{T_{2}}=\\frac{1}{2T_{1}}+\\frac{1}{T_{\\phi}} \\qquad\\Longrightarrow\\qquad T_{2}\\le 2T_{1}'],
 after:'Equality holds when there is no pure dephasing at all, so $T_{2}=2T_{1}$ is the best a qubit can do and every real device is below it. These are the time constants of a Markovian model in which the environment has no memory: reporting a $T_{1}$ and a $T_{2}$ is reporting the parameters of a fitted model, and a decay that is not exponential does not have them.'},

{t:'fig', svg:times, cap:'The population and the coherence against time, in units of $T_{1}$, for a device with $T_{2}=1.5\\,T_{1}$. The faint curve is the ceiling $T_{2}=2T_{1}$: no coherence may decay more slowly than that, whatever else is done.'},

{t:'box', kind:'warn', hd:'$T_{2}$ and $T_{2}^{*}$ are different measurements', html:'$T_{2}^{*}$ is the decay seen in a plain interference experiment, and it includes drift of the qubit frequency between one run and the next. A spin echo reverses that drift and returns a longer $T_{2}$. Quoting one where the other was measured overstates or understates the device by a large factor, and the two are routinely confused.'},

/* ---- 3.5 ---- */
{t:'h2', num:'3.5', text:'Two systems, and one of them alone'},

{t:'p', text:'A general two-qubit pure state has four amplitudes, $c_{0}|00\\rangle+c_{1}|01\\rangle+c_{2}|10\\rangle+c_{3}|11\\rangle$, and the product of two single-qubit states is the special case in which they factor. Reading the product column below shows the ordering: the left factor changes the amplitude in pairs and the right factor changes it every entry, so the left factor is the more significant bit and entry $x$ of the column is the amplitude of the bit string $x$ written in binary.'},

{t:'eqbox', cap:'the ordering this course fixes', tex:'\\begin{bmatrix}a\\\\b\\end{bmatrix}\\otimes\\begin{bmatrix}c\\\\d\\end{bmatrix}=\\begin{bmatrix}ac\\\\ad\\\\bc\\\\bd\\end{bmatrix}, \\qquad |q_{1}q_{0}\\rangle',
 after:'This is the convention that fails silently. A library that counts qubits the other way builds $(ac,\\,bc,\\,ad,\\,bd)$ from the same two states: nothing raises an error, the norm is still one, two of the four entries agree, and every number downstream describes a different state. Whenever a state crosses from one piece of software to another, print the four amplitudes and look at them. An operation on the first qubit alone is $A\\otimes I$ and on the second alone $I\\otimes B$, and those two commute because they act on different factors.'},

{t:'p', text:'Given a joint state, the operation that answers "what is the state of $A$ by itself" is the <b>partial trace</b>. It does not depend on which basis of $B$ is used, and it is the only operation with the property that makes it the right answer: it reproduces every measurement performed on $A$ alone. That second line is the definition worth remembering — $\\rho_A$ is not an approximation and not an average over anything, it is the exact state for that class of questions.'},

{t:'eqbox', cap:'the partial trace', tex:['\\rho_{A}=\\operatorname{Tr}_{B}\\left(\\rho_{AB}\\right)=\\sum_{j}\\left(I_{A}\\otimes\\langle j|\\right)\\rho_{AB}\\left(I_{A}\\otimes|j\\rangle\\right)', '\\operatorname{Tr}\\left(\\rho_{A}A\\right)=\\operatorname{Tr}\\left[\\rho_{AB}\\left(A\\otimes I_{B}\\right)\\right] \\quad\\text{for every }A'],
 after:'For two qubits there is a block rule. Cut the four-by-four matrix into four two-by-two blocks: the traces of the blocks are $\\rho_{A}$, and the sum of the two diagonal blocks is $\\rho_{B}$. Two different operations, and getting them the wrong way round is the usual slip.'},

{t:'ex', hd:'Example 3.2 · a pure pair with mixed halves', rows:[
 ['Given','$|\\Phi^{+}\\rangle=\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)$.'],
 ['Find','The reduced state of each qubit, and the purity of the pair and of one half.'],
 ['Solution','$\\rho_{AB}$ has $\\tfrac12$ at the four corners of the four-by-four and zero elsewhere. Its diagonal blocks are $\\tfrac12|0\\rangle\\langle0|$ and $\\tfrac12|1\\rangle\\langle1|$ and its off-diagonal blocks are traceless, so $\\rho_{A}=\\rho_{B}=I/2$. The pair has purity one and each half has purity $\\tfrac12$.'],
 ['Check','Every measurement on one qubit of a Bell pair is a fair coin, in every basis, which is what $I/2$ says. Nothing about the pair is unknown and everything about each qubit is — and that cannot happen classically, where a certain joint description makes every part certain too.']]},

{t:'box', kind:'ok', hd:'A working definition of entanglement', html:'A pure joint state is <b>entangled</b> exactly when its reduced states are mixed. There are then two sources of a mixed state and they are not distinguishable from inside: either a classical coin decided the preparation, or the system is entangled with something else that is not being looked at. On real hardware the second is usually the honest description — the qubit is entangled with its environment, and $\\rho$ is what is left after tracing the environment out.'},

{t:'box', kind:'warn', hd:'A partial trace cannot be undone', html:'Two very different joint states can share a reduced state: the Bell pair and the classical mixture $\\tfrac12|00\\rangle\\langle00|+\\tfrac12|11\\rangle\\langle11|$ both give $I/2$ on each side. So $\\rho_{A}$ and $\\rho_{B}$ together do not determine $\\rho_{AB}$, and everything that distinguishes those two joint states lives in the correlations the partial trace threw away.'},

/* ---- 3.6 ---- */
{t:'h2', num:'3.6', text:'Separability, the Schmidt decomposition and entropy'},

{t:'p', text:'A bipartite pure state is <b>separable</b> when it is a product and <b>entangled</b> when it is not. For two qubits the test is one determinant, and it vanishes exactly when the four amplitudes factor as $ac,\\,ad,\\,bc,\\,bd$. So $\\tfrac{1}{\\sqrt2}(|01\\rangle+|11\\rangle)$ is $|{+}\\rangle\\otimes|1\\rangle$, while $\\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)$ is no product at all, for any choice of the two single-qubit states.'},

{t:'eqbox', cap:'the amplitude test, and the general form', tex:['|\\psi\\rangle \\text{ is a product} \\iff c_{0}c_{3}-c_{1}c_{2}=0', '|\\psi\\rangle_{AB}=\\sum_{k=1}^{r}\\sqrt{\\lambda_{k}}\\,|u_{k}\\rangle_{A}|v_{k}\\rangle_{B}, \\qquad \\lambda_{k}>0, \\quad \\sum_{k}\\lambda_{k}=1'],
 after:'The second line is the <b>Schmidt decomposition</b>: two orthonormal sets, chosen for the state, in which only the diagonal terms survive. The number of terms $r$ is the <b>Schmidt rank</b>, the reduced states are $\\rho_{A}=\\sum_k\\lambda_k|u_k\\rangle\\langle u_k|$ and likewise for $B$, and the state is entangled exactly when $r>1$. Both sides always have the same non-zero eigenvalues, so the smaller side caps the rank and entanglement of a pure state cannot be more on one side than on the other. For mixed states "separable" means a mixture of products rather than one product, and no test as short as the determinant exists.'},

{t:'p', text:'The decomposition is computed with a singular value decomposition. Write the amplitudes as a matrix instead of a column, rows indexed by the first system and columns by the second; then $C=U\\Sigma V^{\\dagger}$ is the Schmidt decomposition, the singular values are $\\sqrt{\\lambda_k}$, and the two sets of singular vectors are the two Schmidt bases. Nothing has to be derived twice: $\\rho_{A}=CC^{\\dagger}$, and the singular values of $C$ are the square roots of the eigenvalues of $CC^{\\dagger}$ by definition.'},

{t:'box', kind:'err', hd:'Two things to state before reshaping', html:'The qubit ordering, and which qubits go into the rows. Reshaping the wrong way round transposes $C$, which leaves the singular values alone and swaps the two Schmidt bases — so the entanglement number looks right while the states attached to it belong to the other system. And the rank is the count of singular values above a stated tolerance: a value of $10^{-16}$ is a zero, and calling it a third Schmidt term is reporting rounding.'},

{t:'p', text:'The rank counts; the entropy weighs. The von Neumann entropy is the Shannon entropy of the eigenvalues of $\\rho$, in bits, and for a <b>pure</b> bipartite state the entropy of either reduced state is the amount of entanglement the pair carries. A maximally entangled pair of qubits carries one bit, called one <b>ebit</b>, and it is the unit every protocol in chapter 5 is priced in.'},

{t:'eqbox', cap:'entanglement entropy', tex:'S(\\rho)=-\\operatorname{Tr}\\left(\\rho\\log_{2}\\rho\\right)=-\\sum_{k}\\lambda_{k}\\log_{2}\\lambda_{k}, \\qquad S(\\rho_{A})=S(\\rho_{B})',
 after:'This measure is only for pure pairs. For a mixed joint state $S(\\rho_A)$ measures the total uncertainty about $A$, which mixes entanglement together with ordinary classical noise, and a separable mixed state can have a large $S(\\rho_A)$ while carrying no entanglement at all. Quoting the reduced entropy of a noisy pair as its entanglement is a common and serious overstatement.'},

{t:'figrow', n:2, items:[
 {svg:schmidt, cap:'The two Schmidt coefficients of $\\cos\\theta\\,|00\\rangle+\\sin\\theta\\,|11\\rangle$. At the ends one of them is zero, the rank is one, and the state is a product; where they are equal the pair is maximally entangled.'},
 {svg:entropy, cap:'The entanglement entropy of a two-term Schmidt spectrum, against the larger coefficient. Zero at both ends, where the state is a product, and one bit in the middle.'}]},

/* ---- 3.7 ---- */
{t:'h2', num:'3.7', text:'Bell correlations, CHSH and no signalling'},

{t:'p', text:'Four maximally entangled two-qubit states are used constantly, and together they are an orthonormal basis of the four-dimensional space. Every one of them has $\\rho_{A}=\\rho_{B}=I/2$, so no measurement on one qubit tells them apart; what separates them is entirely in the joint correlations.'},

{t:'eqbox', cap:'the Bell states, and the correlations of one of them', tex:['|\\Phi^{\\pm}\\rangle=\\frac{|00\\rangle\\pm|11\\rangle}{\\sqrt2}, \\qquad |\\Psi^{\\pm}\\rangle=\\frac{|01\\rangle\\pm|10\\rangle}{\\sqrt2}', '\\langle X\\otimes X\\rangle=1, \\qquad \\langle Y\\otimes Y\\rangle=-1, \\qquad \\langle Z\\otimes Z\\rangle=1'],
 after:'Each correlation is $\\pm1$, so each is a certain statement about the pair: measure both qubits in the $X$ basis and the two answers always agree, even though each answer alone is a fair coin. The classical mixture $\\tfrac12|00\\rangle\\langle00|+\\tfrac12|11\\rangle\\langle11|$ reproduces the $Z$ correlation exactly and gives zero for the other two, so any model saying "the pair was made as $00$ or as $11$, we just do not know which" gets the first right and the other two wrong.'},

{t:'p', text:'That is not yet a proof that no such model works, because a cleverer one might be built. The argument that closes it uses two measurements on each side, each returning $\\pm1$, combined into one number with the fourth term subtracted. Suppose every run carries definite values $a_0,a_1,b_0,b_1\\in\\{\\pm1\\}$, fixed before the settings are chosen, and group the terms as $a_{0}(b_{0}+b_{1})+a_{1}(b_{0}-b_{1})$: two numbers each $\\pm1$ either agree or differ, so one bracket is $\\pm2$ and the other is exactly zero.'},

{t:'eqbox', cap:'the CHSH combination and its classical bound', tex:['S=\\langle A_{0}B_{0}\\rangle+\\langle A_{0}B_{1}\\rangle+\\langle A_{1}B_{0}\\rangle-\\langle A_{1}B_{1}\\rangle', '\\left|S\\right|\\le2 \\qquad \\text{for every local model with pre-existing values}'],
 after:'No quantum mechanics went into that derivation. It uses only that the four numbers exist together, which is what "the values were there before anyone looked" means. The minus sign is what makes the bound bite: with four plus signs the classical bound would be four and so would the quantum one.'},

{t:'ex', hd:'Example 3.3 · what quantum mechanics reaches', rows:[
 ['Given','$|\\Phi^{+}\\rangle$, with $A_{0}=Z$, $A_{1}=X$, $B_{0}=(Z+X)/\\sqrt2$ and $B_{1}=(Z-X)/\\sqrt2$.'],
 ['Method','For this state $\\langle(\\mathbf{n}\\cdot\\boldsymbol\\sigma)\\otimes(\\mathbf{m}\\cdot\\boldsymbol\\sigma)\\rangle=n_xm_x-n_ym_y+n_zm_z$.'],
 ['Solution','Each of the first three correlations is $1/\\sqrt2$ and the fourth is $-1/\\sqrt2$, so $S=4/\\sqrt2=2\\sqrt2\\approx2.828$.'],
 ['Check','Every term has modulus at most one, so $S$ could in principle be four. Quantum mechanics stops at $2\\sqrt2$, and that ceiling is a theorem rather than an accident of these four angles.']]},

{t:'fig', svg:chsh, cap:'The CHSH value for $|\\Phi^{+}\\rangle$ with $A_{0}=Z$, $A_{1}=X$, and the other party\u2019s two settings placed symmetrically at $\\pm\\varphi$ in the same plane. The curve is above the classical bound over a wide range of angles rather than at one exact setting, which is what makes the experiment possible with imperfect apparatus.'},

{t:'box', kind:'err', hd:'What is refuted, exactly', html:'Not "the qubits communicate". The assumption that fails is that the four outcomes exist together before the settings are chosen. And $S$ is estimated from four finite runs, so each term carries the sampling error of chapter 2: reporting $S=2.6$ without a shot count and an interval is not reporting a violation.'},

{t:'p', text:'It is tempting to read the correlation as a channel. It is not one, and the proof is the partial trace. Whatever the second party measures, the first party\u2019s state — averaged over outcomes they have not been told — is the operator it was before, because the effects are complete: $\\operatorname{Tr}[\\rho_{AB}(A\\otimes\\sum_m E_m)]=\\operatorname{Tr}[\\rho_{AB}(A\\otimes I)]=\\operatorname{Tr}(\\rho_A A)$. The second party\u2019s choice disappears from the expression before any number is computed.'},

{t:'box', kind:'ok', hd:'Where the correlation actually appears', html:'Only when the two records are brought together and compared, which needs an ordinary classical channel and travels no faster than one. Entanglement is a resource that makes two records agree in ways no classical preparation could; it is not a wire. Every protocol in chapter 5 that uses a Bell pair also sends classical bits, and that is why. "Measuring one qubit instantly collapses the other" describes a bookkeeping step: two parties who have not spoken hold different descriptions of the same pair, and both are correct, because a description is a statement about what its holder can predict.'},

/* ---- 3.8 ---- */
{t:'h2', num:'3.8', text:'Summary'},

{t:'ul', items:[
 'A density operator is Hermitian, positive semidefinite and of unit trace, and every prediction is $\\operatorname{Tr}(\\rho A)$. It does not remember which preparation produced it, and two ensembles giving the same matrix are separated by no experiment.',
 'Purity $\\operatorname{Tr}\\rho^{2}$ runs from $1/d$ to one. For a qubit, $\\rho=\\tfrac12(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma)$ with $|\\mathbf{r}|\\le1$, and the states form a solid ball.',
 'A channel is $\\sum_k K_k\\rho K_k^{\\dagger}$ with $\\sum_k K_k^{\\dagger}K_k=I$: a unitary on a larger system with the rest ignored. Damping moves populations, dephasing moves only coherences, and $T_{2}\\le2T_{1}$.',
 'The partial trace is defined by reproducing every measurement on one system. A pure pair with mixed parts is entangled; the Schmidt rank counts and $S(\\rho_A)$ weighs, in bits.',
 'The Bell states share one reduced state and differ in every joint correlation. $|S|\\le2$ for any model with pre-existing values, and quantum mechanics reaches $2\\sqrt2$.',
 'No choice of local measurement moves the other party\u2019s distribution, so entanglement carries no message on its own.']},

{t:'box', kind:'err', hd:'Four errors that cost a whole question', html:'Treating a mixture as a superposition. Checking Hermiticity and trace and calling the result a state. Swapping the two partial traces, so $\\rho_{A}$ is computed where $\\rho_{B}$ was asked for. And reading a Bell violation as communication.'},

{t:'box', kind:'ok', hd:'What comes next', html:'Chapter 4 draws the ball this chapter has been computing in, gives the two angles of a pure state their names, and turns every single-qubit gate into a rotation of it. It also builds the two-qubit gate that makes a Bell state out of a product one, so the pairs used here stop being assumed and start being constructed.'}

];
})();
