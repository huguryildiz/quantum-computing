/* Appendix A — the formula summary.

   Every formula the six chapters establish, in the order they establish it.
   Nothing is derived here and nothing new is introduced here: each entry names
   the chapter section that develops it, and that section carries the argument.

   The file is loaded twice and written once. `notes/build.js` finds it by the
   `c[a-z].js` pattern and places it after the numbered chapters, so it is
   Appendix A of the lecture notes. `notes/editions.js` slices everything after
   the `APPENDIX` heading and prints it as Part 2 of the formula reference, so
   the two documents cannot drift apart: there is one copy of these formulas and
   this is it. Both facts are load-bearing — the heading must keep the word
   APPENDIX in its `num`, and the global must stay `CA`. */
(function(){

window.CA = [

/* The appendix starts a page of its own. Without this it opens at the foot of
   the last page of chapter 6, under that chapter’s closing box, and only the
   lead paragraph fits beneath the heading. `editions.js` slices from after the
   APPENDIX heading, so the break belongs to the notes alone and the formula
   reference is unaffected. */
{t:'page'},

{t:'h1', num:'APPENDIX A', text:'Formula summary'},

{t:'p', lead:true, text:'Every formula the course establishes, in the order the course establishes it. Nothing here is derived and nothing here is new: each entry names the section that develops it, and the argument is in that section. Read this page to check a result you already understand, never to meet one for the first time.'},

{t:'p', text:'Four conventions are in force throughout and are not repeated under each entry. A register of $n$ qubits is written $|q_{n-1}\\ldots q_1q_0\\rangle$, and entry $x$ of its column of amplitudes is the amplitude of $|x\\rangle$ with $x$ read as a binary number. A phase on the whole state is not physical; a phase between two terms is. The inner product conjugates its first argument. And $\\hbar=1$, so a Hamiltonian is in angular frequency, evolution is $U(t)=e^{-iHt}$, and a logarithm of a probability is taken base two.'},

/* ============================================================= chapter 1 */
{t:'h2', num:'A.1', text:'Chapter 1 · The mathematics of quantum states'},

{t:'eqbox', cap:'a qubit state', tex:'|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle = \\begin{bmatrix}\\alpha\\\\ \\beta\\end{bmatrix}, \\qquad |\\alpha|^{2}+|\\beta|^{2}=1',
 after:'The object every other formula acts on. Chapter 1, section 1.1.'},

{t:'eqbox', cap:'the inner product', tex:['\\langle a| = |a\\rangle^{\\dagger} = \\begin{bmatrix}a_{1}^{*} & \\cdots & a_{n}^{*}\\end{bmatrix}', '\\langle a|b\\rangle = \\sum_{k} a_{k}^{*}\\,b_{k}'],
 after:'The conjugate sits on the first argument and on nothing else, so $\\langle b|a\\rangle=\\langle a|b\\rangle^{*}$. Chapter 1, section 1.1.'},

{t:'eqbox', cap:'a coefficient is an inner product', tex:'|v\\rangle = \\sum_{i} v_{i}|e_{i}\\rangle \\qquad\\Longrightarrow\\qquad v_{j} = \\langle e_{j}|v\\rangle',
 after:'True only for an orthonormal basis, and it is what an orthonormal basis is chosen for. Chapter 1, section 1.1.'},

{t:'eqbox', cap:'Cauchy–Schwarz, and the two ends of it', tex:'\\left|\\langle a|b\\rangle\\right| \\le \\|a\\|\\,\\|b\\|, \\qquad 0 \\le \\left|\\langle a|b\\rangle\\right|^{2} \\le 1 \\ \\text{ for normalised states}',
 after:'Zero means orthogonal and one measurement separates the two with certainty; one means the same state up to a global phase. Chapter 1, section 1.1.'},

{t:'eqbox', cap:'modulus and phase', tex:'z = x+iy = r\\,e^{i\\varphi}, \\qquad zz^{*} = x^{2}+y^{2} = |z|^{2}',
 after:'Every probability in the course is a $|z|^{2}$ and every interference effect is a difference of two $\\varphi$. Chapter 1, section 1.2.'},

{t:'eqbox', cap:'a global phase is not physical, a relative phase is', tex:['e^{i\\gamma}|\\psi\\rangle \\;\\equiv\\; |\\psi\\rangle', '\\alpha|0\\rangle + e^{i\\varphi}\\beta|1\\rangle \\;\\not\\equiv\\; \\alpha|0\\rangle + \\beta|1\\rangle'],
 after:'The second line is the mechanism every algorithm in the course runs on. Chapter 1, section 1.2.'},

{t:'eqbox', cap:'the outer product and the projector', tex:['|a\\rangle\\langle b| = |a\\rangle\\,|b\\rangle^{\\dagger}, \\qquad \\left(|a\\rangle\\langle b|\\right)_{jk} = a_{j}\\,b_{k}^{*}', 'P_{u} = |u\\rangle\\langle u|, \\qquad P_{u}^{\\dagger}=P_{u}, \\qquad P_{u}^{2}=P_{u}'],
 after:'A bra eats the ket to its right first, so $\\left(|a\\rangle\\langle b|\\right)|v\\rangle=\\langle b|v\\rangle\\,|a\\rangle$. Chapter 1, section 1.3.'},

{t:'eqbox', cap:'the resolution of the identity', tex:'\\sum_{k} |e_{k}\\rangle\\langle e_{k}| = I',
 after:'Used as a move rather than as a fact: inserting it turns a statement about a vector into a statement about its coefficients. Chapter 1, section 1.3.'},

{t:'eqbox', cap:'Gram–Schmidt', tex:'u_{j} = v_{j} - \\sum_{i<j}\\langle e_{i}|v_{j}\\rangle\\,e_{i}, \\qquad e_{j} = \\frac{u_{j}}{\\|u_{j}\\|}',
 after:'The modified recursion subtracts against the partly built $u_{j}$ rather than against $v_{j}$, and keeps far more digits. Chapter 1, section 1.4.'},

{t:'eqbox', cap:'the tensor product', tex:['\\begin{bmatrix}a_{1}\\\\a_{2}\\end{bmatrix}\\otimes\\begin{bmatrix}b_{1}\\\\b_{2}\\end{bmatrix} = \\begin{bmatrix}a_{1}b_{1}\\\\a_{1}b_{2}\\\\a_{2}b_{1}\\\\a_{2}b_{2}\\end{bmatrix}', '\\left(A\\otimes B\\right)_{(i,j)} = A_{ij}B, \\qquad \\dim = 2^{n} \\ \\text{ for } n \\text{ qubits}'],
 after:'Two qubits are four numbers and not two plus two, and that is where the exponential comes from. Chapter 1, section 1.5.'},

{t:'eqbox', cap:'adjoint, Hermitian, unitary', tex:['A^{\\dagger} = \\left(A^{*}\\right)^{T}, \\qquad \\left(AB\\right)^{\\dagger}=B^{\\dagger}A^{\\dagger}', 'A = A^{\\dagger} \\;\\Longrightarrow\\; \\text{real eigenvalues}, \\qquad U^{\\dagger}U = I \\iff U^{-1}=U^{\\dagger}'],
 after:'A Hermitian operator is a measurable quantity and a unitary one is a reversible motion. Chapter 1, section 1.6.'},

{t:'eqbox', cap:'the exponential that joins them', tex:['G = G^{\\dagger}, \\ \\theta \\in \\mathbb{R} \\qquad\\Longrightarrow\\qquad U(\\theta) = e^{-i\\theta G} \\ \\text{ is unitary}', 'e^{-i\\theta\\sigma/2} = \\cos\\!\\left(\\tfrac{\\theta}{2}\\right) I \\;-\\; i\\sin\\!\\left(\\tfrac{\\theta}{2}\\right)\\sigma'],
 after:'The second line holds for any operator whose square is the identity, which is every Pauli and every $\\mathbf{n}\\cdot\\boldsymbol\\sigma$. Chapter 1, section 1.6.'},

{t:'eqbox', cap:'the spectral decomposition, and a function of an operator', tex:['A = \\sum_{k}\\lambda_{k}P_{k}, \\qquad P_{j}P_{k} = \\delta_{jk}P_{k}, \\qquad \\sum_{k}P_{k} = I', 'f(A) = \\sum_{k} f(\\lambda_{k})\\,P_{k}, \\qquad e^{-iAt} = \\sum_{k} e^{-i\\lambda_{k}t}\\,P_{k}'],
 after:'The second line is what makes an evolution operator computable at all. Chapter 1, section 1.7.'},

{t:'page'},

/* ============================================================= chapter 2 */
{t:'h2', num:'A.2', text:'Chapter 2 · States, measurement and dynamics'},

{t:'eqbox', cap:'the Born rule', tex:'p(n) = \\left|\\langle n|\\psi\\rangle\\right|^{2}',
 after:'The one postulate that connects a state to a number an instrument prints. Chapter 2, section 2.1.'},

{t:'eqbox', cap:'a projective measurement, and the state it leaves', tex:['p(a) = \\langle\\psi|P_{a}|\\psi\\rangle, \\qquad P_{j}P_{k}=\\delta_{jk}P_{k}, \\qquad \\sum_{a}P_{a}=I', '|\\psi_{a}\\rangle = \\frac{P_{a}|\\psi\\rangle}{\\sqrt{p(a)}}'],
 after:'Orthogonality makes the outcomes exclusive and completeness makes them add to one. Chapter 2, section 2.2.'},

{t:'eqbox', cap:'a general measurement', tex:'p(m) = \\langle\\psi|M_{m}^{\\dagger}M_{m}|\\psi\\rangle, \\qquad \\sum_{m} M_{m}^{\\dagger}M_{m} = I, \\qquad E_{m}=M_{m}^{\\dagger}M_{m}',
 after:'What an imperfect readout is. The projective case is $M_{m}=P_{m}$. Chapter 2, section 2.2.'},

{t:'eqbox', cap:'expectation and variance', tex:['\\langle A\\rangle = \\langle\\psi|A|\\psi\\rangle = \\sum_{a} a\\,p(a)', '\\operatorname{Var}(A) = \\langle A^{2}\\rangle - \\langle A\\rangle^{2}, \\qquad \\Delta A = \\sqrt{\\operatorname{Var}(A)}'],
 after:'For any Pauli $A^{2}=I$, so $\\operatorname{Var}(A)=1-\\langle A\\rangle^{2}$ and no second sandwich is needed. Chapter 2, section 2.3.'},

{t:'eqbox', cap:'the Robertson relation', tex:'\\Delta A \\,\\Delta B \\;\\ge\\; \\tfrac12\\left|\\langle [A,B]\\rangle\\right|, \\qquad [A,B]=AB-BA',
 after:'The bound depends on the state, so a vanishing right-hand side says nothing rather than saying both spreads are zero. Chapter 2, section 2.4.'},

{t:'table', head:['Observable','$+1$ eigenstate','$-1$ eigenstate'], rows:[
 ['$X=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$','$|+\\rangle=\\tfrac{1}{\\sqrt2}(1,1)$','$|-\\rangle=\\tfrac{1}{\\sqrt2}(1,-1)$'],
 ['$Y=\\begin{bmatrix}0&-i\\\\i&0\\end{bmatrix}$','$|{+}i\\rangle=\\tfrac{1}{\\sqrt2}(1,i)$','$|{-}i\\rangle=\\tfrac{1}{\\sqrt2}(1,-i)$'],
 ['$Z=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}$','$|0\\rangle=(1,0)$','$|1\\rangle=(0,1)$']]},

{t:'eqbox', cap:'the Pauli algebra', tex:['\\sigma_{i}\\sigma_{j} = \\delta_{ij}\\,I + i\\sum_{k}\\varepsilon_{ijk}\\,\\sigma_{k}', '[\\sigma_{i},\\sigma_{j}] = 2i\\sum_{k}\\varepsilon_{ijk}\\sigma_{k}, \\qquad \\{\\sigma_{i},\\sigma_{j}\\} = 2\\delta_{ij}I'],
 after:'Cyclic order $X\\to Y\\to Z\\to X$ carries the plus sign. Two different Pauli operators anticommute. Chapter 2, section 2.5.'},

{t:'eqbox', cap:'measuring along a direction', tex:['\\mathbf{n}\\cdot\\boldsymbol\\sigma, \\qquad P_{\\pm}=\\tfrac12\\left(I\\pm\\mathbf{n}\\cdot\\boldsymbol\\sigma\\right), \\qquad r_{a}=\\langle\\sigma_{a}\\rangle', 'p(\\pm) = \\tfrac12\\left(1 \\pm \\mathbf{n}\\cdot\\mathbf{r}\\right) , \\qquad p(+) = \\cos^{2}\\frac{\\alpha}{2}'],
 after:'$\\alpha$ is the angle between two vectors, which is twice the angle between the two states. Chapter 2, section 2.5.'},

{t:'eqbox', cap:'closed-system evolution', tex:['i\\,\\frac{\\mathrm{d}}{\\mathrm{d}t}|\\psi(t)\\rangle = H\\,|\\psi(t)\\rangle', '|\\psi(t)\\rangle = U(t)|\\psi(0)\\rangle, \\qquad U(t)=e^{-iHt}'],
 after:'Replacing $H$ by $H+cI$ multiplies $U$ by a global phase, so only energy differences are physical. Chapter 2, section 2.6.'},

{t:'eqbox', cap:'a driven qubit', tex:['H = \\tfrac12\\left(\\Omega_{x}X+\\Omega_{y}Y+\\Delta Z\\right) = \\tfrac{\\Omega}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma, \\qquad \\Omega = \\sqrt{\\Omega_{x}^{2}+\\Omega_{y}^{2}+\\Delta^{2}}', 'U(t) = \\cos\\!\\left(\\tfrac{\\Omega t}{2}\\right)I - i\\sin\\!\\left(\\tfrac{\\Omega t}{2}\\right)\\mathbf{n}\\cdot\\boldsymbol\\sigma, \\qquad p_{\\max} = \\left(\\frac{\\Omega_{x}}{\\Omega}\\right)^{2}'],
 after:'Pulse area sets the angle, drive phase sets the axis in the equator, and detuning tilts that axis towards $z$. Chapter 2, section 2.6.'},

{t:'eqbox', cap:'what a finite run is worth', tex:'K\\sim\\mathrm{Binomial}(N,p), \\qquad \\mathrm{SE}\\!\\left(\\tfrac{K}{N}\\right)=\\sqrt{\\frac{p(1-p)}{N}} \\ \\le\\ \\frac{1}{2\\sqrt{N}}',
 after:'One more decimal place costs a hundred times the shots. This is counting and not physics, so no hardware improvement changes it. Chapter 2, section 2.7.'},

{t:'page'},

/* ============================================================= chapter 3 */
{t:'h2', num:'A.3', text:'Chapter 3 · Mixed states and entanglement'},

{t:'eqbox', cap:'the density operator', tex:['\\rho_{\\psi} = |\\psi\\rangle\\langle\\psi|', '\\rho = \\sum_{i} p_{i}\\,|\\psi_{i}\\rangle\\langle\\psi_{i}|, \\qquad p_{i}\\ge0, \\qquad \\sum_{i}p_{i}=1'],
 after:'It does not remember which preparation made it: two different mixtures with the same $\\rho$ are the same state. Chapter 3, section 3.1.'},

{t:'eqbox', cap:'which matrices are states, and every prediction from one trace', tex:['\\rho=\\rho^{\\dagger}, \\qquad \\rho\\succeq0, \\qquad \\operatorname{Tr}\\rho=1', '\\langle A\\rangle = \\operatorname{Tr}\\left(\\rho A\\right), \\qquad p(m) = \\operatorname{Tr}\\left(\\rho E_{m}\\right)'],
 after:'For one qubit positivity is the single inequality $|\\rho_{01}|^{2}\\le\\rho_{00}\\rho_{11}$. Chapter 3, section 3.1.'},

{t:'eqbox', cap:'purity', tex:'\\gamma = \\operatorname{Tr}\\left(\\rho^{2}\\right) = \\sum_{k}\\lambda_{k}^{2}, \\qquad \\frac1d \\le \\gamma \\le 1',
 after:'It says how mixed and never which state: one number where a qubit state needs three. Chapter 3, section 3.2.'},

{t:'eqbox', cap:'a qubit state as a vector', tex:['\\rho = \\tfrac12\\left(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma\\right), \\qquad r_{a}=\\operatorname{Tr}\\left(\\rho\\,\\sigma_{a}\\right), \\qquad |\\mathbf{r}|\\le1', '\\lambda_{\\pm}=\\tfrac12\\left(1\\pm|\\mathbf{r}|\\right), \\qquad \\operatorname{Tr}\\rho^{2}=\\tfrac12\\left(1+|\\mathbf{r}|^{2}\\right)'],
 after:'From a state vector $(a,b)$ the $y$ component reads $r_{y}=2\\operatorname{Im}(a^{*}b)$; from $\\rho$ it reads $r_{y}=-2\\operatorname{Im}\\rho_{01}$. The two signs are not a contradiction, and both give $r_{y}=+1$ on $|{+}i\\rangle$. Chapter 3, section 3.2.'},

{t:'eqbox', cap:'a channel in Kraus form', tex:'\\mathcal{E}(\\rho)=\\sum_{k}K_{k}\\,\\rho\\,K_{k}^{\\dagger}, \\qquad \\sum_{k}K_{k}^{\\dagger}K_{k}=I',
 after:'Every channel arises this way, and two different sets of Kraus operators can describe one channel. Chapter 3, section 3.3.'},

{t:'eqbox', cap:'amplitude damping', tex:['K_{0}=\\begin{bmatrix}1&0\\\\0&\\sqrt{1-\\gamma}\\end{bmatrix}, \\qquad K_{1}=\\begin{bmatrix}0&\\sqrt{\\gamma}\\\\0&0\\end{bmatrix}', '\\rho_{11}\\mapsto(1-\\gamma)\\rho_{11}, \\qquad \\rho_{01}\\mapsto\\sqrt{1-\\gamma}\\,\\rho_{01}'],
 after:'At $\\gamma=1$ every state becomes $|0\\rangle$, which is why this is the model of relaxation. Chapter 3, section 3.3.'},

{t:'eqbox', cap:'the phase-flip channel', tex:['\\mathcal{E}_{Z}(\\rho)=(1-p)\\,\\rho + p\\,Z\\rho Z', '\\rho_{00},\\rho_{11}\\ \\text{unchanged}, \\qquad \\rho_{01}\\mapsto(1-2p)\\,\\rho_{01}'],
 after:'The damage peaks at $p=\\tfrac12$ and vanishes at $p=1$, where the channel is the gate $Z$. Chapter 3, section 3.3.'},

{t:'eqbox', cap:'the two decay times', tex:['\\rho_{11}(t)=\\rho_{11}^{\\mathrm{eq}}+\\left[\\rho_{11}(0)-\\rho_{11}^{\\mathrm{eq}}\\right]e^{-t/T_{1}}, \\qquad \\rho_{01}(t)=e^{-t/T_{2}}\\rho_{01}(0)', '\\frac{1}{T_{2}}=\\frac{1}{2T_{1}}+\\frac{1}{T_{\\phi}} \\qquad\\Longrightarrow\\qquad T_{2}\\le 2T_{1}'],
 after:'Populations decay on $T_{1}$ and the coherence on $T_{2}$, and the inequality is a theorem rather than a measurement. Chapter 3, section 3.4.'},

{t:'eqbox', cap:'the ordering this course fixes', tex:'\\begin{bmatrix}a\\\\b\\end{bmatrix}\\otimes\\begin{bmatrix}c\\\\d\\end{bmatrix}=\\begin{bmatrix}ac\\\\ad\\\\bc\\\\bd\\end{bmatrix}, \\qquad |q_{1}q_{0}\\rangle',
 after:'Read under the other convention this names a different state, and every number downstream is quietly wrong. Chapter 3, section 3.5.'},

{t:'eqbox', cap:'the partial trace', tex:['\\rho_{A}=\\operatorname{Tr}_{B}\\left(\\rho_{AB}\\right)=\\sum_{j}\\left(I_{A}\\otimes\\langle j|\\right)\\rho_{AB}\\left(I_{A}\\otimes|j\\rangle\\right)', '\\operatorname{Tr}\\left(\\rho_{A}A\\right)=\\operatorname{Tr}\\left[\\rho_{AB}\\left(A\\otimes I_{B}\\right)\\right] \\quad\\text{for every }A'],
 after:'The second line is the property that makes it the right operation: it is the state that answers every question about $A$ alone. Chapter 3, section 3.5.'},

{t:'eqbox', cap:'separability, and the Schmidt form', tex:['|\\psi\\rangle \\text{ is a product} \\iff c_{0}c_{3}-c_{1}c_{2}=0', '|\\psi\\rangle_{AB}=\\sum_{k=1}^{r}\\sqrt{\\lambda_{k}}\\,|u_{k}\\rangle_{A}|v_{k}\\rangle_{B}, \\qquad \\lambda_{k}>0, \\quad \\sum_{k}\\lambda_{k}=1'],
 after:'The Schmidt rank $r$ is one exactly when the pair is a product. Chapter 3, section 3.6.'},

{t:'eqbox', cap:'entanglement entropy', tex:'S(\\rho)=-\\operatorname{Tr}\\left(\\rho\\log_{2}\\rho\\right)=-\\sum_{k}\\lambda_{k}\\log_{2}\\lambda_{k}, \\qquad S(\\rho_{A})=S(\\rho_{B})',
 after:'Zero for a product and one bit for a Bell state. Chapter 3, section 3.6.'},

{t:'eqbox', cap:'the Bell states', tex:['|\\Phi^{\\pm}\\rangle=\\frac{|00\\rangle\\pm|11\\rangle}{\\sqrt2}, \\qquad |\\Psi^{\\pm}\\rangle=\\frac{|01\\rangle\\pm|10\\rangle}{\\sqrt2}', '\\text{for } |\\Phi^{+}\\rangle: \\quad \\langle X\\otimes X\\rangle=1, \\qquad \\langle Y\\otimes Y\\rangle=-1, \\qquad \\langle Z\\otimes Z\\rangle=1'],
 after:'All four share the same reduced state $I/2$ and differ only in their joint correlations. Chapter 3, section 3.7.'},

{t:'eqbox', cap:'CHSH, and the two ceilings', tex:['S=\\langle A_{0}B_{0}\\rangle+\\langle A_{0}B_{1}\\rangle+\\langle A_{1}B_{0}\\rangle-\\langle A_{1}B_{1}\\rangle', '\\left|S\\right|\\le2 \\ \\text{ for pre-existing values}, \\qquad \\left|S\\right|\\le2\\sqrt2 \\ \\text{ for quantum states}'],
 after:'Both bounds are theorems. A measured value above two is what rules out the first model. Chapter 3, section 3.7.'},

{t:'page'},

/* ============================================================= chapter 4 */
{t:'h2', num:'A.4', text:'Chapter 4 · The Bloch sphere and quantum gates'},

{t:'eqbox', cap:'a pure qubit state, and the point it names', tex:['|\\psi(\\theta,\\varphi)\\rangle = \\cos\\frac{\\theta}{2}\\,|0\\rangle + e^{i\\varphi}\\sin\\frac{\\theta}{2}\\,|1\\rangle, \\qquad 0\\le\\theta\\le\\pi, \\quad 0\\le\\varphi<2\\pi', '\\mathbf{r} = \\left(\\sin\\theta\\cos\\varphi,\\;\\sin\\theta\\sin\\varphi,\\;\\cos\\theta\\right), \\qquad |\\mathbf{r}|=1'],
 after:'At a pole the azimuth means nothing, because $\\sin 0=0$ leaves nothing for the phase to multiply. Chapter 4, section 4.1.'},

{t:'eqbox', cap:'the overlap of two pure states', tex:'\\left|\\langle\\chi|\\psi\\rangle\\right|^{2} = \\frac{1+\\mathbf{r}\\cdot\\mathbf{s}}{2} = \\cos^{2}\\frac{\\Theta}{2}',
 after:'Orthogonal states sit at opposite points; points at a right angle overlap with probability one half. Chapter 4, section 4.1.'},

{t:'eqbox', cap:'a full turn is not the identity', tex:'R_{\\mathbf{n}}(2\\pi) = -I, \\qquad R_{\\mathbf{n}}(4\\pi) = +I',
 after:'$U$ and $-U$ give the same rotation of the sphere, so the map from gates to rotations is two to one. Chapter 4, section 4.2.'},

{t:'eqbox', cap:'the rotation operator', tex:['R_{\\mathbf{n}}(\\alpha) = e^{-i\\alpha\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma/2} = \\cos\\frac{\\alpha}{2}\\,I - i\\sin\\frac{\\alpha}{2}\\;\\mathbf{n}\\cdot\\boldsymbol\\sigma', '\\text{every } 2\\times2 \\text{ unitary} = e^{i\\gamma}R_{\\mathbf{n}}(\\alpha) \\ \\text{ for some } \\gamma,\\ \\mathbf{n},\\ \\alpha'],
 after:'Rotation is not one family of one-qubit gates among many; it is all of them. Chapter 4, section 4.3.'},

{t:'eqbox', cap:'the Pauli gates as rotations', tex:['R_{x}(\\pi) = -iX, \\qquad R_{y}(\\pi) = -iY, \\qquad R_{z}(\\pi) = -iZ', '\\begin{aligned} X&:\\; |0\\rangle\\leftrightarrow|1\\rangle, \\qquad |{+}\\rangle \\text{ and } |{-}\\rangle \\text{ fixed} \\\\ Z&:\\; |{+}\\rangle\\leftrightarrow|{-}\\rangle, \\qquad |0\\rangle \\text{ and } |1\\rangle \\text{ fixed}\\end{aligned}'],
 after:'Which gate looks like a flip depends entirely on the basis the state is written in. Chapter 4, section 4.3.'},

{t:'eqbox', cap:'the Hadamard', tex:['H = \\frac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = \\frac{X+Z}{\\sqrt2}, \\qquad H^{2}=I', 'HXH = Z, \\qquad HZH = X, \\qquad HYH = -Y'],
 after:'Measuring $X$ is applying $H$ and then measuring $Z$, which is the only reading a machine offers. Chapter 4, section 4.3.'},

{t:'eqbox', cap:'the phase family', tex:['P(\\varphi) = \\begin{bmatrix}1&0\\\\0&e^{i\\varphi}\\end{bmatrix} = e^{i\\varphi/2}\\,R_{z}(\\varphi)', 'S = P\\!\\left(\\tfrac{\\pi}{2}\\right), \\qquad T = P\\!\\left(\\tfrac{\\pi}{4}\\right), \\qquad S^{2}=Z, \\quad T^{2}=S'],
 after:'$S$ is a Clifford gate and cheap to correct for; $T$ is not, and that difference sets the cost of fault tolerance. Chapter 4, section 4.3.'},

{t:'eqbox', cap:'the order a circuit multiplies in', tex:['U_{1} \\text{ first},\\; U_{2} \\text{ next},\\; U_{3} \\text{ last} \\qquad\\Longrightarrow\\qquad U = U_{3}\\,U_{2}\\,U_{1}', '\\left(A\\otimes I\\right)\\left(I\\otimes B\\right) = A\\otimes B = \\left(I\\otimes B\\right)\\left(A\\otimes I\\right)'],
 after:'Gates on different qubits always commute; gates sharing a qubit usually do not. Chapter 4, section 4.4.'},

{t:'eqbox', cap:'the Euler decomposition, and the gate with three dials', tex:['U = e^{i\\alpha}\\,R_{z}(\\phi)\\,R_{y}(\\theta)\\,R_{z}(\\lambda)', 'U(\\theta,\\phi,\\lambda) = \\begin{bmatrix} \\cos\\frac{\\theta}{2} & -e^{i\\lambda}\\sin\\frac{\\theta}{2} \\\\[2pt] e^{i\\phi}\\sin\\frac{\\theta}{2} & e^{i(\\phi+\\lambda)}\\cos\\frac{\\theta}{2}\\end{bmatrix}'],
 after:'$H=U(\\tfrac{\\pi}{2},0,\\pi)$, $X=U(\\pi,0,\\pi)$ and $P(\\varphi)=U(0,\\varphi,0)$. Chapter 4, section 4.4.'},

{t:'eqbox', cap:'reversible embeddings and the oracle pattern', tex:['(a,\\,b) \\longmapsto (a,\\;a\\oplus b) \\qquad \\text{is exactly CNOT}', '|x\\rangle|y\\rangle \\longmapsto |x\\rangle\\,|y\\oplus f(x)\\rangle \\qquad \\text{for any } f'],
 after:'AND needs a third wire, $(a,b,c)\\mapsto(a,b,c\\oplus ab)$, which is the Toffoli gate. Chapter 4, section 4.5.'},

{t:'eqbox', cap:'compute, copy out, uncompute', tex:'V_{f}^{\\dagger}\\;\\left(\\text{copy}\\right)\\;V_{f} \\;:\\; |x\\rangle|0\\rangle|y\\rangle \\;\\longmapsto\\; |x\\rangle|0\\rangle|y\\oplus f(x)\\rangle',
 after:'An ancilla that leaves in a state depending on $x$ stays entangled with the register, and the interference at the end does not happen. Chapter 4, section 4.5.'},

{t:'eqbox', cap:'a one-qubit gate on a named qubit', tex:['\\text{on } q_{0}: \\; I\\otimes A, \\qquad \\text{on } q_{1}: \\; A\\otimes I', '\\left(I\\otimes X\\right)|10\\rangle = |11\\rangle, \\qquad \\left(X\\otimes I\\right)|10\\rangle = |00\\rangle'],
 after:'Both are valid gates and they do different things. Nothing in the mathematics protects a reader who picks the wrong one. Chapter 4, section 4.6.'},

{t:'eqbox', cap:'the two CNOT matrices, in the basis order $|00\\rangle,|01\\rangle,|10\\rangle,|11\\rangle$', tex:['\\mathrm{CNOT}:\\; |c\\rangle|t\\rangle \\longmapsto |c\\rangle|c\\oplus t\\rangle', '\\mathrm{CNOT}_{0\\to 1} = \\begin{bmatrix}1&0&0&0\\\\0&0&0&1\\\\0&0&1&0\\\\0&1&0&0\\end{bmatrix}, \\qquad \\mathrm{CNOT}_{1\\to 0} = \\begin{bmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&0&1\\\\0&0&1&0\\end{bmatrix}'],
 after:'The subscript reads control to target. Chapter 4, section 4.6.'},

{t:'eqbox', cap:'CZ and SWAP', tex:['\\mathrm{CZ} = \\operatorname{diag}(1,1,1,-1) = \\left(H\\otimes I\\right)\\,\\mathrm{CNOT}_{0\\to 1}\\,\\left(H\\otimes I\\right)', '\\mathrm{SWAP} = \\mathrm{CNOT}_{0\\to 1}\\;\\mathrm{CNOT}_{1\\to 0}\\;\\mathrm{CNOT}_{0\\to 1}'],
 after:'Three two-qubit gates to move a state one step across a chip, which is what routing costs. Chapter 4, section 4.6.'},

{t:'eqbox', cap:'making a Bell pair, and two universal sets', tex:['|00\\rangle \\xrightarrow{\\;I\\otimes R_{y}(\\theta)\\;} \\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|01\\rangle \\xrightarrow{\\;\\mathrm{CNOT}_{0\\to 1}\\;} \\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|11\\rangle', '\\left\\{\\text{every one-qubit gate}\\right\\}\\cup\\left\\{\\mathrm{CNOT}\\right\\} \\ \\text{exactly}, \\qquad \\left\\{H,\\;S,\\;T,\\;\\mathrm{CNOT}\\right\\} \\ \\text{to any } \\varepsilon>0'],
 after:'A gate is entangling if it entangles some input, not every input. The price of $\\varepsilon$ is a length growing like a power of $\\log(1/\\varepsilon)$. Chapter 4, section 4.7.'},

{t:'page'},

/* ============================================================= chapter 5 */
{t:'h2', num:'A.5', text:'Chapter 5 · Circuits and protocols'},

{t:'eqbox', cap:'the circuit model, in one line', tex:'|0\\rangle^{\\otimes n} \\;\\xrightarrow{\\;U_{d}\\cdots U_{2}U_{1}\\;}\\; |\\psi\\rangle \\;\\xrightarrow{\\;\\text{measure}\\;}\\; x \\in \\{0,1\\}^{n}',
 after:'Fixed input, fixed gate set, fixed measurement basis, and one string per run. Chapter 5, section 5.1.'},

{t:'eqbox', cap:'one state, named four ways', tex:'|q_{n-1}\\,\\ldots\\,q_{1}q_{0}\\rangle, \\qquad x = \\sum_{k} 2^{k} q_{k}',
 after:'A run that prints $101$ read $q_{2}=1$, $q_{1}=0$, $q_{0}=1$, which is entry $5$ of the state vector. Chapter 5, section 5.1.'},

{t:'eqbox', cap:'depth, gate count and simulation cost', tex:['\\text{depth} = \\text{layers of gates that must run in order}, \\qquad \\text{count} = \\text{gates}', '\\text{bytes} = 16\\cdot 2^{n}, \\qquad n=30 \\Rightarrow 17\\,\\text{GB}, \\qquad n=50 \\Rightarrow 18\\,\\text{PB}'],
 after:'A coherence time is spent against depth and an error budget against the two-qubit count. The size of the vector is an upper bound on the difficulty of simulation and never a lower one. Chapter 5, sections 5.1 and 5.2.'},

{t:'eqbox', cap:'the error bar on a probability read from a finite run', tex:'K \\sim \\text{Binomial}(N,p), \\qquad \\mathrm{SE}(\\hat{p}) = \\sqrt{\\frac{p(1-p)}{N}}',
 after:'An estimate near one half to within $\\pm0.005$ needs ten thousand shots. Chapter 5, section 5.2.'},

{t:'eqbox', cap:'deferred measurement', tex:'\\text{measure } q_{0},\\ \\text{then } X^{m}\\ \\text{on } q_{1} \\;\\equiv\\; \\mathrm{CNOT}_{0\\to1},\\ \\text{then measure } q_{0}',
 after:'The rule is about a measured wire used as a control and about nothing else. Chapter 5, section 5.2.'},

{t:'eqbox', cap:'two exact rewrites a compiler uses', tex:['H = e^{i\\pi/2} R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{x}\\!\\left(\\tfrac{\\pi}{2}\\right) R_{z}\\!\\left(\\tfrac{\\pi}{2}\\right)', '\\mathrm{CNOT}_{0\\to1} = \\left(H \\text{ on } q_{1}\\right)\\;\\mathrm{CZ}\\;\\left(H \\text{ on } q_{1}\\right)'],
 after:'What is lost is only length; the two-qubit count does not move. The phase in the first line becomes observable the moment the gate is controlled. Chapter 5, section 5.3.'},

{t:'eqbox', cap:'turning a phase into counts', tex:['|0\\rangle \\;\\xrightarrow{\\;H\\;}\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right) \\;\\xrightarrow{\\;P(\\varphi)\\;}\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\varphi}|1\\rangle\\right)', '\\xrightarrow{\\;H\\;}\\; \\tfrac12\\left(1+e^{i\\varphi}\\right)|0\\rangle + \\tfrac12\\left(1-e^{i\\varphi}\\right)|1\\rangle, \\qquad p(0) = \\cos^{2}\\frac{\\varphi}{2}'],
 after:'Measuring in the middle learns nothing; the second Hadamard is what makes the phase readable. Chapter 5, section 5.4.'},

{t:'eqbox', cap:'teleportation, as one identity', tex:'|\\Psi_{2}\\rangle = \\tfrac12 \\sum_{m_{1},m_{0}\\in\\{0,1\\}} |m_{1}m_{0}\\rangle_{10} \\otimes X^{m_{1}}Z^{m_{0}}|\\psi\\rangle_{2}',
 after:'Exact, and independent of $\\alpha$ and $\\beta$. Bob applies $Z^{m_{0}}$ and then $X^{m_{1}}$ to undo it. Chapter 5, section 5.5.'},

{t:'eqbox', cap:'what Bob holds before the bits arrive', tex:'\\rho_{B} = \\tfrac14\\sum_{m_{1},m_{0}} X^{m_{1}}Z^{m_{0}}\\,\\rho\\,Z^{m_{0}}X^{m_{1}} = \\frac{I}{2}',
 after:'No $\\rho$ on the right-hand side, which is why the protocol sends nothing ahead of the two classical bits. Chapter 5, section 5.5.'},

{t:'eqbox', cap:'phase kickback', tex:['X|{-}\\rangle = -|{-}\\rangle', 'U_{f}\\,|x\\rangle|{-}\\rangle = (-1)^{f(x)}\\,|x\\rangle|{-}\\rangle'],
 after:'The target comes out unchanged, so the answer has landed on the first register as a sign. Chapter 5, section 5.6, and again in chapter 6.'},

{t:'eqbox', cap:'the plane Grover search lives in', tex:['|G\\rangle = \\frac{1}{\\sqrt{M}}\\sum_{f(x)=1}|x\\rangle, \\qquad |B\\rangle = \\frac{1}{\\sqrt{N-M}}\\sum_{f(x)=0}|x\\rangle', '|s\\rangle = \\sin\\theta\\,|G\\rangle + \\cos\\theta\\,|B\\rangle, \\qquad \\sin\\theta = \\sqrt{\\frac{M}{N}}'],
 after:'A real two-dimensional plane inside a complex space of $2^{n}$ dimensions. It is not a Bloch sphere. Chapter 5, section 5.6.'},

{t:'eqbox', cap:'the Grover success probability, and where it peaks', tex:['P_{\\text{good}}(r) = \\sin^{2}\\!\\big((2r+1)\\theta\\big)', 'r_{*} = \\frac{\\pi}{4\\theta} - \\frac12, \\qquad r_{*} \\approx \\frac{\\pi}{4}\\sqrt{\\frac{N}{M}} \\ \\text{ when } M \\ll N'],
 after:'Each iteration adds a fixed angle $2\\theta$, and a right angle has to be reached. Iterating past $r_{*}$ makes the answer less likely. Chapter 5, section 5.6.'},

{t:'box', kind:'ok', hd:'What a resource claim must name', html:'The task, the input model, the accuracy, the hardware model, and the classical baseline it is measured against. A claim missing one of the five is not yet a claim, and a query count is not a runtime. Chapter 5, section 5.7.'},

{t:'page'},

/* ============================================================= chapter 6 */
{t:'h2', num:'A.6', text:'Chapter 6 · Quantum algorithms'},

{t:'eqbox', cap:'the oracle, and what one query means', tex:'U_{f}\\,|x\\rangle|y\\rangle = |x\\rangle\\,|y \\oplus f(x)\\rangle',
 after:'Building $U_{f}$ costs gates and those gates are not counted. A query separation is a theorem about one column of the table. Chapter 6, section 6.1.'},

{t:'eqbox', cap:'kickback with an arbitrary unitary', tex:['U\\,|u\\rangle = e^{2\\pi i \\varphi}\\,|u\\rangle', '\\mathrm{c}U\\,\\tfrac{1}{\\sqrt2}\\big(|0\\rangle+|1\\rangle\\big)|u\\rangle = \\tfrac{1}{\\sqrt2}\\big(|0\\rangle+e^{2\\pi i \\varphi}|1\\rangle\\big)|u\\rangle'],
 after:'On a superposition of eigenstates the procedure samples one eigenphase with probability $|c_{k}|^{2}$; it does not list the spectrum. Chapter 6, section 6.2.'},

{t:'eqbox', cap:'what the last layer of Hadamards is for', tex:'\\langle 0^{n}|\\,H^{\\otimes n}\\Big(\\tfrac{1}{2^{n/2}}\\textstyle\\sum_{x}(-1)^{f(x)}|x\\rangle\\Big) = \\frac{1}{2^{n}}\\sum_{x}(-1)^{f(x)}',
 after:'A superposition that never interferes has bought nothing. The readout returns $n$ bits, never $2^{n}$ numbers. Chapter 6, section 6.2.'},

{t:'eqbox', cap:'Deutsch, and Deutsch–Jozsa', tex:['\\tfrac{1}{\\sqrt2}\\Big((-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\Big) \\;\\xrightarrow{\\;H\\;}\\; \\pm\\,|\\,f(0)\\oplus f(1)\\,\\rangle', '\\text{amplitude of } |0^{n}\\rangle = \\frac{1}{2^{n}}\\sum_{x}(-1)^{f(x)} = \\begin{cases} \\pm1 & \\text{constant} \\\\ 0 & \\text{balanced}\\end{cases}'],
 after:'One query against $2^{n-1}+1$ exact classical queries, on a promised input. Chapter 6, section 6.3.'},

{t:'eqbox', cap:'the quantum Fourier transform, and its circuit', tex:['F_{Q}\\,|x\\rangle = \\frac{1}{\\sqrt{Q}}\\sum_{k=0}^{Q-1} e^{2\\pi i\\,xk/Q}\\,|k\\rangle, \\qquad Q = 2^{n}', 'R_{k} = \\begin{bmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i/2^{k}} \\end{bmatrix}, \\qquad n + \\tfrac12 n(n-1) = \\tfrac12 n(n+1) \\ \\text{gates}'],
 after:'It is a change of basis and returns one index, never a spectrum. $F_{2}$ is the Hadamard. Chapter 6, section 6.4.'},

{t:'eqbox', cap:'phase estimation', tex:['\\frac{1}{\\sqrt{2^{t}}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i k\\varphi}\\,|k\\rangle \\;\\xrightarrow{\\;F^{\\dagger}\\;}\\; y, \\qquad \\hat{\\varphi} = \\frac{y}{2^{t}}', 'P(y) = \\frac{1}{2^{2t}}\\left|\\frac{\\sin\\!\\big(\\pi\\,2^{t}\\delta\\big)}{\\sin(\\pi\\delta)}\\right|^{2}, \\qquad \\delta = \\varphi - \\frac{y}{2^{t}}'],
 after:'Costs $2^{t}-1$ applications of $U$ against $\\tfrac12 t(t+1)$ gates in the inverse transform. Chapter 6, section 6.5.'},

{t:'eqbox', cap:'the two floors, and how many counting qubits to take', tex:['P(\\text{nearest}) \\ge \\frac{4}{\\pi^{2}} \\approx 0.405, \\qquad P(\\text{two nearest}) \\ge \\frac{8}{\\pi^{2}} \\approx 0.811', 't = n + \\left\\lceil \\log_{2}\\!\\left(2 + \\frac{1}{2\\varepsilon}\\right) \\right\\rceil'],
 after:'Neither floor moves as the register grows: extra qubits buy accuracy and never confidence. Chapter 6, section 6.5.'},

{t:'eqbox', cap:'order finding', tex:['U_{a}\\,|y\\rangle = |\\,a\\,y \\bmod N\\,\\rangle, \\qquad U_{a}\\,|u_{s}\\rangle = e^{2\\pi i s/r}\\,|u_{s}\\rangle', '\\frac{1}{\\sqrt r}\\sum_{s=0}^{r-1}|u_{s}\\rangle = |1\\rangle, \\qquad |u_{s}\\rangle = \\frac{1}{\\sqrt r}\\sum_{k=0}^{r-1} e^{-2\\pi i sk/r}\\,|a^{k} \\bmod N\\rangle'],
 after:'The order sits in the denominators of the eigenphases, and starting the work register in the state one costs a single gate. Chapter 6, section 6.6.'},

{t:'eqbox', cap:'why the reading is enough', tex:'\\left| \\frac{y}{Q} - \\frac{s}{r} \\right| \\le \\frac{1}{2Q}, \\qquad Q > N^{2} \\;\\Longrightarrow\\; \\frac{s}{r} \\text{ is the only such fraction}',
 after:'Continued fractions recover $s/r$ from the reading, and one modular exponentiation confirms $r$. The condition $Q>N^{2}$ is what doubles the counting register. Chapter 6, section 6.6.'},

{t:'eqbox', cap:'the factors, from the order', tex:'\\gcd\\big(a^{r/2}-1,\\,N\\big) \\quad\\text{and}\\quad \\gcd\\big(a^{r/2}+1,\\,N\\big)',
 after:'Needs $r$ even and $a^{r/2} \\not\\equiv -1 \\bmod N$; a random $a$ satisfies both at least half the time. Chapter 6, section 6.7.'},

{t:'eqbox', cap:'where the work is', tex:'\\text{modular exponentiation } O(L^{3}), \\qquad \\text{transform } O(L^{2}), \\qquad \\text{everything else classical}',
 after:'The arithmetic is the algorithm, and the quantum step exists only to supply the exponent that makes the algebra apply. Chapter 6, section 6.7.'}

];

})();
