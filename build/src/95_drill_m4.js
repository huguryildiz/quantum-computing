/* ==========================================================================
   Practice questions — Module 4.

   Six shapes and twenty questions in them. The numbers are chosen so that the
   Check step is cheap: a Bloch vector of a pure state has length one, a
   probability is $\tfrac12(1 + \mathbf{n}\cdot\mathbf{r})$ and can always be
   found a second way, a rotation never changes a length, a gate matrix has
   orthonormal columns, and a local gate never changes an entanglement entropy.
   Every solution ends by using one of those.

   Two questions in the sheet are there for the ordering convention alone —
   D4-13 and D4-14 — because that is the error of this chapter that no later
   arithmetic catches.
   ========================================================================== */
(function(){

CONTENT.DRILLTYPES.M4 = [
  { k:'bloch', name:'Between a state, a matrix and a point',
    asks:'A state, a density matrix or a Bloch vector is given. Convert to the other two, or read a probability off it.',
    method:['From angles to a state: $|\\psi\\rangle=\\cos\\frac{\\theta}{2}|0\\rangle+e^{i\\varphi}\\sin\\frac{\\theta}{2}|1\\rangle$. The angle in the amplitude is always half the angle on the sphere.',
            'From a state to a vector: $\\mathbf{r}=(\\sin\\theta\\cos\\varphi,\\sin\\theta\\sin\\varphi,\\cos\\theta)$, or equivalently $r_a=\\langle\\psi|\\sigma_a|\\psi\\rangle$.',
            'From a vector to a probability: $p(\\pm)=\\tfrac12(1\\pm\\mathbf{n}\\cdot\\mathbf{r})$ along any direction $\\mathbf{n}$, and $|\\langle\\chi|\\psi\\rangle|^{2}=\\tfrac12(1+\\mathbf{r}\\cdot\\mathbf{s})$ for two pure states.',
            'Check that $|\\mathbf{r}|=1$ for a pure state, and that the probabilities you find add to one.'],
    go:'m4-sphere' },

  { k:'rotate', name:'A gate as a rotation',
    asks:'A gate is given. Find its axis and angle, or the state and the Bloch vector it produces.',
    method:['Write the gate as $e^{i\\gamma}\\left(\\cos\\frac{\\alpha}{2}I-i\\sin\\frac{\\alpha}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma\\right)$. The traceless part carries the axis and the trace carries the angle.',
            'A gate of the form $\\mathbf{n}\\cdot\\boldsymbol\\sigma$ is always a half turn about $\\mathbf{n}$, up to phase. $X$, $Y$, $Z$ and $H$ are all of this kind.',
            'For a half turn the image is $\\mathbf{r}\\mapsto 2(\\mathbf{r}\\cdot\\mathbf{n})\\mathbf{n}-\\mathbf{r}$; for a general turn about $\\hat z$ it is the plain rotation of $r_x$ and $r_y$.',
            'Check the length of the vector, which a rotation never changes, and check that any state on the axis has not moved.'],
    go:'m4-rot' },

  { k:'seq', name:'Composing a sequence of gates',
    asks:'Several gates are applied in a stated order. Find the state, the net unitary, or whether the order matters.',
    method:['Write the matrix product with the first gate on the right. A circuit reads left to right and a product is eaten from the right.',
            'It is usually quicker to follow the Bloch vector than to multiply matrices: each gate is one turn, and three turns of a vector is less work than three products of matrices.',
            'Gates on different qubits commute; gates on one qubit usually do not. If a question asks whether the order matters, compute both.',
            'Check the length after every step, and check the net unitary against the state you followed.'],
    go:'m4-time' },

  { k:'decomp', name:'Decomposing and synthesising a gate',
    asks:'A gate is to be built from a stated set, or a stated set is to be assessed.',
    method:['Any one-qubit gate is $e^{i\\alpha}R_z(\\phi)R_y(\\theta)R_z(\\lambda)$. Match $|U_{00}|=\\cos\\frac{\\theta}{2}$ first, then the phases of the entries.',
            'The same gate written as one matrix is $U(\\theta,\\phi,\\lambda)$; its first column is the state it prepares from $|0\\rangle$.',
            'Keep the global phase whenever the gate is about to be controlled, and drop it only for a gate acting on the whole state.',
            'Check by multiplying out, and check unitarity: the columns must be orthonormal.'],
    go:'m4-euler' },

  { k:'two', name:'Two-qubit gates, and which qubit is which',
    asks:'A two-qubit gate or a one-qubit gate on a pair is given. Find the matrix, the output state, or the reduced states.',
    method:['Fix the ordering before anything else: $|q_1q_0\\rangle$ with $x=2q_1+q_0$. A gate on $q_0$ is $I\\otimes A$ and a gate on $q_1$ is $A\\otimes I$.',
            'For a controlled gate, name the control and the target. $\\mathrm{CNOT}_{0\\to1}$ and $\\mathrm{CNOT}_{1\\to0}$ are different matrices and the question is not answerable until one of them is chosen.',
            'Act on the basis states one at a time and collect the images; a permutation gate needs no matrix multiplication at all.',
            'Check that the four probabilities add to one, and check the reduced states with the block rule of chapter 3.'],
    go:'m4-order' },

  { k:'entangle4', name:'Entangling power and universality',
    asks:'A gate or a gate set is given. Decide what it can produce, or how much entanglement it makes.',
    method:['A local gate $U_A\\otimes U_B$ never changes the Schmidt coefficients, so it never changes the entanglement. If a question reports an increase from a local gate, something is wrong.',
            'A gate is entangling if it entangles at least one product input, not every one. Test it on a product input whose factors are not basis states.',
            'For a two-qubit pure state use the amplitude test $c_0c_3-c_1c_2$, then the entropy $-\\sum_k\\lambda_k\\log_2\\lambda_k$ for how much.',
            'For a gate set, ask two separate questions: does it contain an entangling gate, and does it leave the Clifford group.'],
    go:'m4-entangle' },

  { k:'full', name:'A full-length question: one circuit, end to end',
    asks:'A circuit, an input state, a measurement and a reported number, in three to five parts.',
    method:['Read every part before starting. The number at the end usually depends on every step before it.',
            'Work in the order the circuit runs, and keep the Bloch vector rather than the amplitudes wherever the circuit is one qubit.',
            'Carry exact values between parts and check each against the one before: a length of one, probabilities that add to one, and an error bar quoted with every estimated number.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---- between a state, a matrix and a point --------------------------- */

{ id:'D4-01', module:'M4', type:'bloch', src:'L7 · pure qubit states and the Bloch sphere',
  stem:'A qubit is prepared in $|\\psi\\rangle = \\tfrac{\\sqrt3}{2}|0\\rangle + \\tfrac12 e^{i2\\pi/3}|1\\rangle$.',
  parts:['Give the two angles $\\theta$ and $\\varphi$.',
         'Give the Bloch vector.',
         'Give the probability of reading $0$ in the computational basis, two different ways.'],
  sol:'<b>Given.</b> A state already written with a real, non-negative amplitude on $|0\\rangle$, so no global phase has to be removed first.<br>'
     +'<b>Method.</b> Match against $\\cos\\frac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\frac{\\theta}{2}|1\\rangle$, then use $\\mathbf{r}=(\\sin\\theta\\cos\\varphi,\\sin\\theta\\sin\\varphi,\\cos\\theta)$.<br>'
     +'<b>Solution — (a).</b> $\\cos\\frac{\\theta}{2}=\\frac{\\sqrt3}{2}$ gives $\\frac{\\theta}{2}=30^{\\circ}$, so $\\theta=60^{\\circ}$. The phase is $2\\pi/3$, so $\\varphi=120^{\\circ}$.<br>'
     +'<b>Solution — (b).</b> $\\sin 60^{\\circ}=0.8660$, $\\cos 120^{\\circ}=-0.5$ and $\\sin 120^{\\circ}=0.8660$, so $\\mathbf{r}=(-0.4330,\\;0.7500,\\;0.5000)$.<br>'
     +'<b>Solution — (c).</b> From the amplitude: $p(0)=\\left(\\frac{\\sqrt3}{2}\\right)^{2}=0.75$. From the vector: $p(0)=\\tfrac12(1+r_z)=\\tfrac12(1.5)=0.75$.<br>'
     +'<b>Check.</b> $|\\mathbf{r}|^{2}=0.1875+0.5625+0.25=1$, so the point is on the surface, as a pure state must be.',
  err:'Reading $\\cos\\theta=\\frac{\\sqrt3}{2}$ and reporting $\\theta=30^{\\circ}$. The angle in the amplitude is half the angle on the sphere, and this slip puts the state in the wrong place by $30^{\\circ}$ while leaving every formula looking right.',
  teach:'Ask for $p(0)$ under both answers: $0.75$ against $\\tfrac12(1+\\cos 30^{\\circ})=0.933$. Two very different experiments, from one factor of two.' },

{ id:'D4-02', module:'M4', type:'bloch', src:'L7 · the Bloch ball and measurable coordinates',
  stem:'Tomography on a qubit returns $\\mathbf{r}=(0.6,\\,0,\\,0.8)$.',
  parts:['Is the state pure? Say how you can tell in one line.',
         'Give $\\theta$ and $\\varphi$, and write the state.',
         'Give the probability of the $+1$ outcome of an $X$ measurement and of a $Z$ measurement.'],
  sol:'<b>Given.</b> Three measured Pauli means, which are exactly the three components of the Bloch vector.<br>'
     +'<b>Method.</b> The length decides purity; the direction gives the angles; $p(\\pm)=\\tfrac12(1\\pm\\mathbf{n}\\cdot\\mathbf{r})$ gives every probability.<br>'
     +'<b>Solution — (a).</b> $|\\mathbf{r}|=\\sqrt{0.36+0.64}=1$, so the state is pure and sits on the surface.<br>'
     +'<b>Solution — (b).</b> $\\cos\\theta=0.8$ gives $\\theta=36.87^{\\circ}$, and $r_y=0$ with $r_x>0$ gives $\\varphi=0$. Then $\\cos\\frac{\\theta}{2}=\\cos 18.43^{\\circ}=0.9487$ and $\\sin\\frac{\\theta}{2}=0.3162$, so $|\\psi\\rangle=0.9487|0\\rangle+0.3162|1\\rangle$.<br>'
     +'<b>Solution — (c).</b> Along $\\hat{x}$: $\\tfrac12(1+0.6)=0.8$. Along $\\hat{z}$: $\\tfrac12(1+0.8)=0.9$.<br>'
     +'<b>Check.</b> From the amplitudes, $p(0)=0.9487^{2}=0.9$, which agrees. And $0.9487^{2}+0.3162^{2}=1$, so the state is normalised.',
  err:'Writing $|\\psi\\rangle=\\cos\\theta\\,|0\\rangle+\\sin\\theta\\,|1\\rangle=0.8|0\\rangle+0.6|1\\rangle$. That is normalised and looks right, but it gives $p(0)=0.64$ instead of $0.9$, so it is a different state.',
  teach:'A useful habit to install: after writing a state from a Bloch vector, always recompute $p(0)$ from the amplitude and compare with $\\tfrac12(1+r_z)$. It takes five seconds and catches the half-angle slip every time.' },

{ id:'D4-03', module:'M4', type:'bloch', src:'L7 · pure qubit states and the Bloch sphere',
  stem:'Three pure states: $|a\\rangle$ at $(\\theta,\\varphi)=(60^{\\circ},0)$, $|b\\rangle$ at $(120^{\\circ},180^{\\circ})$, and $|c\\rangle$ at $(90^{\\circ},0)$.',
  parts:['Give the three Bloch vectors.',
         'Which pair is orthogonal, and how do you know from the picture alone?',
         'Give $\\left|\\langle c|a\\rangle\\right|^{2}$.'],
  sol:'<b>Given.</b> Three points named by their angles.<br>'
     +'<b>Method.</b> Convert to vectors, then use $\\left|\\langle\\chi|\\psi\\rangle\\right|^{2}=\\tfrac12(1+\\mathbf{r}\\cdot\\mathbf{s})$.<br>'
     +'<b>Solution — (a).</b> $\\mathbf{r}_a=(0.8660,\\,0,\\,0.5)$, $\\mathbf{r}_b=(-0.8660,\\,0,\\,-0.5)$ and $\\mathbf{r}_c=(1,\\,0,\\,0)$.<br>'
     +'<b>Solution — (b).</b> $\\mathbf{r}_b=-\\mathbf{r}_a$, so $|a\\rangle$ and $|b\\rangle$ are at opposite points of the sphere. Opposite means orthogonal: $\\tfrac12(1-1)=0$.<br>'
     +'<b>Solution — (c).</b> $\\mathbf{r}_c\\cdot\\mathbf{r}_a=0.8660$, so $\\left|\\langle c|a\\rangle\\right|^{2}=\\tfrac12(1.8660)=0.9330$.<br>'
     +'<b>Check.</b> The angle between $\\mathbf{r}_c$ and $\\mathbf{r}_a$ is $30^{\\circ}$, and $\\cos^{2}15^{\\circ}=0.9330$. Two routes, one number, and the answer is between zero and one as a probability must be.',
  err:'Calling $|a\\rangle$ and $|c\\rangle$ orthogonal because their vectors are $30^{\\circ}$ apart and "not parallel", or calling two states at $90^{\\circ}$ orthogonal. A right angle on the sphere gives an overlap of one half.',
  teach:'Draw all three on one sphere before computing anything. The pair that is orthogonal is visibly the only pair through the centre, and the picture answers part (b) before any arithmetic starts.' },

/* ---- a gate as a rotation ------------------------------------------- */

{ id:'D4-04', module:'M4', type:'rotate', src:'L7 · single-qubit gates as rotations',
  stem:'The gate $R_y(70^{\\circ})$ is applied to $|0\\rangle$.',
  parts:['Write the matrix of $R_y(\\alpha)$.',
         'Give the state and the Bloch vector afterwards.',
         'Give $p(0)$, two ways.'],
  sol:'<b>Given.</b> A rotation about $\\hat{y}$ acting on the north pole.<br>'
     +'<b>Method.</b> $R_{\\mathbf{n}}(\\alpha)=\\cos\\frac{\\alpha}{2}I-i\\sin\\frac{\\alpha}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma$, with $\\mathbf{n}=\\hat{y}$ so $\\mathbf{n}\\cdot\\boldsymbol\\sigma=Y$.<br>'
     +'<b>Solution — (a).</b> $-iY=\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$, so $R_y(\\alpha)=\\begin{bmatrix}\\cos\\frac{\\alpha}{2}&-\\sin\\frac{\\alpha}{2}\\\\ \\sin\\frac{\\alpha}{2}&\\cos\\frac{\\alpha}{2}\\end{bmatrix}$ — a real rotation matrix, with the half angle in it.<br>'
     +'<b>Solution — (b).</b> The first column is the answer: $|\\psi\\rangle=\\cos 35^{\\circ}|0\\rangle+\\sin 35^{\\circ}|1\\rangle=0.8192|0\\rangle+0.5736|1\\rangle$. On the sphere the vector has turned $70^{\\circ}$ from $\\hat{z}$ towards $\\hat{x}$, so $\\mathbf{r}=(\\sin 70^{\\circ},\\,0,\\,\\cos 70^{\\circ})=(0.9397,\\,0,\\,0.3420)$.<br>'
     +'<b>Solution — (c).</b> From the amplitude: $\\cos^{2}35^{\\circ}=0.6710$. From the vector: $\\tfrac12(1+0.3420)=0.6710$.<br>'
     +'<b>Check.</b> $|\\mathbf{r}|^{2}=0.8830+0.1170=1$, and a rotation cannot change a length, so a value other than one would mean an arithmetic slip rather than a physical effect.',
  err:'Reporting the vector as $(\\sin 35^{\\circ},0,\\cos 35^{\\circ})$, that is, using the angle inside the matrix as the angle on the sphere. The gate turns the vector by $\\alpha$ and the amplitudes by $\\alpha/2$, and this is the error the whole chapter warns about.',
  teach:'This is the cheapest question on the sheet and the one worth setting first. Every later rotation question fails in exactly this way if the factor of two is not fixed here.' },

{ id:'D4-05', module:'M4', type:'rotate', src:'L7 · single-qubit gates as rotations',
  stem:'Consider the gate $G=\\dfrac{X+Y}{\\sqrt2}$.',
  parts:['Show that $G$ is a rotation, and give its axis and its angle.',
         'Give $G|0\\rangle$.',
         'Give $G|{+}i\\rangle$, using the geometry rather than the matrices.'],
  sol:'<b>Given.</b> A gate written as a combination of Pauli operators, which is how an axis is usually hidden in plain sight.<br>'
     +'<b>Method.</b> Any $\\mathbf{n}\\cdot\\boldsymbol\\sigma$ with $|\\mathbf{n}|=1$ is a half turn about $\\mathbf{n}$, because $R_{\\mathbf{n}}(\\pi)=-i\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma$.<br>'
     +'<b>Solution — (a).</b> $G=\\mathbf{n}\\cdot\\boldsymbol\\sigma$ with $\\mathbf{n}=\\left(\\tfrac{1}{\\sqrt2},\\tfrac{1}{\\sqrt2},0\\right)$, a unit vector on the equator halfway between $\\hat{x}$ and $\\hat{y}$. So $G$ is a half turn about that axis, up to the phase $i$.<br>'
     +'<b>Solution — (b).</b> $X|0\\rangle=|1\\rangle$ and $Y|0\\rangle=i|1\\rangle$, so $G|0\\rangle=\\frac{1+i}{\\sqrt2}|1\\rangle=e^{i\\pi/4}|1\\rangle$, which is $|1\\rangle$.<br>'
     +'<b>Solution — (c).</b> $|{+}i\\rangle$ is at $\\mathbf{r}=(0,1,0)$. A half turn sends $\\mathbf{r}\\mapsto 2(\\mathbf{r}\\cdot\\mathbf{n})\\mathbf{n}-\\mathbf{r}$, and $\\mathbf{r}\\cdot\\mathbf{n}=0.7071$, so the image is $(1,1,0)-(0,1,0)=(1,0,0)$, which is $|{+}\\rangle$.<br>'
     +'<b>Check.</b> Part (b) agrees with the geometry too: $|0\\rangle$ is at the north pole, the axis is on the equator, and a half turn about any equatorial axis sends the north pole to the south pole. Both images have length one.',
  err:'Treating $G$ as "a bit of $X$ and a bit of $Y$" and averaging their effects. Operators do not act one after another when they are added; $G$ is a single gate with a single axis, and adding the two images is not what it does.',
  teach:'Set the same question for $(X+Z)/\\sqrt2$, which is the Hadamard, and let the class discover that the gate they have used for weeks is one member of this family.' },

{ id:'D4-06', module:'M4', type:'rotate', src:'L7 · the phase, S and T gates',
  stem:'A qubit in $|{+}\\rangle$ has the gate $T$ applied to it.',
  parts:['Give the Bloch vector afterwards.',
         'Give the probability of reading $0$ in the computational basis.',
         'A Hadamard is now applied as well. Give the probability of reading $0$, and say what changed.'],
  sol:'<b>Given.</b> A state on the equator and a turn about the vertical axis.<br>'
     +'<b>Method.</b> $T=P(\\pi/4)$ turns the Bloch vector about $\\hat{z}$ by $45^{\\circ}$; $H$ exchanges $x$ with $z$ and reverses $y$.<br>'
     +'<b>Solution — (a).</b> $(1,0,0)$ turns to $(\\cos 45^{\\circ},\\,\\sin 45^{\\circ},\\,0)=(0.7071,\\,0.7071,\\,0)$.<br>'
     +'<b>Solution — (b).</b> $p(0)=\\tfrac12(1+r_z)=\\tfrac12(1+0)=0.5$. The gate did not change it at all, and could not: a turn about $\\hat{z}$ never moves $r_z$.<br>'
     +'<b>Solution — (c).</b> $H$ sends $(0.7071,0.7071,0)$ to $(0,\\,-0.7071,\\,0.7071)$, so $p(0)=\\tfrac12(1+0.7071)=0.8536$. The phase $T$ wrote has become a population difference.<br>'
     +'<b>Check.</b> Directly: $HT|{+}\\rangle$ has $\\left|\\langle 0|HT|{+}\\rangle\\right|^{2}=\\cos^{2}(\\pi/8)=0.8536$. Both lengths are one throughout, as two rotations require.',
  err:'Concluding from part (b) that $T$ "did nothing". It moved the state a long way — $45^{\\circ}$ round the equator — and the computational-basis reading is simply blind to that direction. Part (c) is the same state read by an instrument that is not blind to it.',
  teach:'This three-part shape is the whole mechanism of every algorithm in chapter 6: write a phase, then turn it into a population with one more gate. Set it early and refer back to it.' },

/* ---- composing a sequence -------------------------------------------- */

{ id:'D4-07', module:'M4', type:'seq', src:'L7 · the quantum circuit model',
  stem:'The gates $H$, then $S$, then $H$ are applied to $|0\\rangle$, in that order.',
  parts:['Write the matrix product that represents the circuit.',
         'Follow the Bloch vector through the three gates.',
         'Name the state at the end, and say what single rotation the whole circuit is.'],
  sol:'<b>Given.</b> Three gates in a stated time order.<br>'
     +'<b>Method.</b> The first gate goes on the right of the product. Then follow the vector, which is quicker than three matrix products.<br>'
     +'<b>Solution — (a).</b> $U=HSH$. It happens to read the same in both directions here, which is a warning rather than a comfort — check the rule on a product that does not.<br>'
     +'<b>Solution — (b).</b> $|0\\rangle$ is $(0,0,1)$. $H$ swaps $x$ and $z$: $(1,0,0)$. $S$ turns a quarter turn about $\\hat{z}$: $(0,1,0)$. $H$ again swaps $x$ and $z$ and reverses $y$: $(0,-1,0)$.<br>'
     +'<b>Solution — (c).</b> $(0,-1,0)$ is $|{-}i\\rangle$. Since $HZH=X$ and $S=e^{i\\pi/4}R_z(\\pi/2)$, the whole circuit is $HSH=e^{i\\pi/4}R_x(\\pi/2)$: a quarter turn about $\\hat{x}$.<br>'
     +'<b>Check.</b> A quarter turn about $\\hat{x}$ takes $(0,0,1)$ to $(0,-1,0)$, which is what part (b) found by three separate steps. The length is one throughout.',
  err:'Applying the gates as $H$ then $S$ then $H$ but writing the matrix as $H\\cdot S\\cdot H$ read left to right as the time order. Here the product is symmetric so nothing goes wrong, which is exactly why it teaches the wrong habit.',
  teach:'Part (c) is the point of the question: conjugating a rotation by $H$ moves its axis. That single fact removes most of the matrix arithmetic from the rest of the sheet.' },

{ id:'D4-08', module:'M4', type:'seq', src:'L7 · the quantum circuit model',
  stem:'Two gates, $H$ and $S$, and one input $|0\\rangle$.',
  parts:['Give the state when $H$ runs first, and when $S$ runs first.',
         'How far apart are the two results on the sphere, and what is the overlap?',
         'Say in one sentence why the two orders disagree.'],
  sol:'<b>Given.</b> The same two gates in the two possible orders.<br>'
     +'<b>Method.</b> Follow the vector twice.<br>'
     +'<b>Solution — (a).</b> $H$ first: $(0,0,1)\\to(1,0,0)$, then $S$ turns it a quarter turn: $(0,1,0)$, which is $|{+}i\\rangle$. $S$ first: $S|0\\rangle=|0\\rangle$ because the north pole is on the axis of the turn, then $H$ gives $(1,0,0)$, which is $|{+}\\rangle$.<br>'
     +'<b>Solution — (b).</b> $(0,1,0)$ and $(1,0,0)$ are at $90^{\\circ}$, so the overlap is $\\tfrac12(1+0)=0.5$.<br>'
     +'<b>Solution — (c).</b> They are turns about two different axes, $\\hat{z}$ and the diagonal $(\\hat{x}+\\hat{z})/\\sqrt2$, and rotations about different axes do not commute.<br>'
     +'<b>Check.</b> Both answers have length one, and a $Z$ measurement gives $0.5$ for both — so a reader who only ever measures $Z$ would never see the difference. An $X$ measurement gives $0.5$ against $1$, and separates them.',
  err:'Assuming that because both outputs give the same $Z$ statistics they are the same state. They differ by a quarter turn of the equator, and the measurement that sees it has to be chosen deliberately.',
  teach:'Ask which single measurement setting separates the two outputs most sharply. The answer is the $X$ basis, and finding it is the same skill the tomography of chapter 3 needed.' },

{ id:'D4-09', module:'M4', type:'seq', src:'L7 · global phase, relative phase and the double cover',
  stem:'The four gates $X$, $Z$, $X$, $Z$ are applied in that order.',
  parts:['Give the net unitary of the sequence.',
         'What does the sequence do to any Bloch vector?',
         'A control qubit is added, so that the whole four-gate sequence runs only when the control is $|1\\rangle$. The control starts in $|{+}\\rangle$. What is the control at the end?'],
  sol:'<b>Given.</b> Four Pauli gates, in a repeating pair.<br>'
     +'<b>Method.</b> Use the anticommutation $XZ=-ZX$ rather than multiplying four matrices out.<br>'
     +'<b>Solution — (a).</b> The product, with the first gate on the right, is $ZXZX$. Moving one $Z$ past one $X$ costs a minus sign: $ZXZX=-ZZXX=-I$.<br>'
     +'<b>Solution — (b).</b> Nothing. $-I$ is the identity up to a global phase, so every Bloch vector ends exactly where it started, whatever the input state was.<br>'
     +'<b>Solution — (c).</b> The controlled version applies $-I$ in the $|1\\rangle$ branch and $I$ in the $|0\\rangle$ branch, so $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)\\mapsto\\tfrac{1}{\\sqrt2}(|0\\rangle-|1\\rangle)$: the control has become $|{-}\\rangle$.<br>'
     +'<b>Check.</b> Part (b) and part (c) are consistent and not contradictory: the target really is untouched in both, and what part (c) reports is a change to the <b>control</b>. An $X$ measurement on the control returns $+1$ with certainty before and $-1$ with certainty after.',
  err:'Answering part (c) with "nothing happens, the sequence is the identity". It is the identity as a state map on that qubit alone and it is $-I$ as a gate, and the difference is exactly what a control exposes.',
  teach:'This is the cheapest demonstration in the course that a global phase is not always ignorable. Worth setting immediately before chapter 6, where every algorithm turns a phase into a population this way.' },

/* ---- decomposing and synthesising ------------------------------------ */

{ id:'D4-10', module:'M4', type:'decomp', src:'L7 · the phase, S and T gates',
  stem:'The $S$ gate, $S=\\operatorname{diag}(1,i)$.',
  parts:['Write $S$ as a phase times a rotation about $\\hat{z}$.',
         'Give its Euler form $e^{i\\alpha}R_z(\\phi)R_y(\\theta)R_z(\\lambda)$.',
         'Is the controlled-$S$ the same circuit as the controlled-$R_z(\\pi/2)$? If not, what is the difference?'],
  sol:'<b>Given.</b> A diagonal gate with unequal phases on the two entries.<br>'
     +'<b>Method.</b> Factor out the average phase, which is what turns a diagonal gate into a rotation.<br>'
     +'<b>Solution — (a).</b> $\\operatorname{diag}(1,i)=e^{i\\pi/4}\\operatorname{diag}(e^{-i\\pi/4},e^{i\\pi/4})=e^{i\\pi/4}R_z(\\pi/2)$.<br>'
     +'<b>Solution — (b).</b> $\\alpha=\\pi/4$, $\\phi=\\pi/2$, $\\theta=0$ and $\\lambda=0$. There is no tilt because the gate leaves both poles where they are.<br>'
     +'<b>Solution — (c).</b> No. Controlling $e^{i\\alpha}V$ gives the controlled-$V$ together with a phase gate $P(\\alpha)$ on the control, so controlled-$S$ is controlled-$R_z(\\pi/2)$ followed by $P(\\pi/4)$ on the control.<br>'
     +'<b>Check.</b> Both gates act identically on any single qubit — the Bloch picture is the same quarter turn — and they differ on a superposed control, which is what part (c) measures.',
  err:'Dropping the phase in part (a) and then using the result inside a controlled gate. The global phase of a gate is unobservable only while that gate acts on the whole state, and a control is exactly the situation where it stops being global.',
  teach:'Ask for the same analysis of $T$ and of $Z$. The pattern — $P(\\varphi)=e^{i\\varphi/2}R_z(\\varphi)$ — is one line and it removes a whole class of circuit errors.' },

{ id:'D4-11', module:'M4', type:'decomp', src:'L7 · arbitrary single-qubit gates and Euler angles',
  stem:'A gate $U(\\theta,\\phi,\\lambda)$ is wanted that prepares the state at $(\\theta,\\varphi)=(60^{\\circ},45^{\\circ})$ from $|0\\rangle$.',
  parts:['Give the parameters $\\theta$ and $\\phi$.',
         'Is $\\lambda$ determined by the requirement? Say why.',
         'With $\\lambda=0$, write the four entries of the matrix.'],
  sol:'<b>Given.</b> A target state and the standard three-parameter gate.<br>'
     +'<b>Method.</b> The first column of $U(\\theta,\\phi,\\lambda)$ is $\\left(\\cos\\frac{\\theta}{2},\\;e^{i\\phi}\\sin\\frac{\\theta}{2}\\right)$, which is the state prepared from $|0\\rangle$.<br>'
     +'<b>Solution — (a).</b> Reading the parameterisation straight off: $\\theta=60^{\\circ}$ and $\\phi=45^{\\circ}$.<br>'
     +'<b>Solution — (b).</b> No. $\\lambda$ appears only in the second column, which is what the gate does to $|1\\rangle$. The requirement says nothing about $|1\\rangle$, so $\\lambda$ is free and a whole one-parameter family of gates prepares the same state.<br>'
     +'<b>Solution — (c).</b> $\\cos 30^{\\circ}=0.8660$ and $\\sin 30^{\\circ}=0.5$, so the matrix is $\\begin{bmatrix}0.8660 & -0.5\\\\ 0.3536+0.3536i & 0.6124+0.6124i\\end{bmatrix}$.<br>'
     +'<b>Check.</b> Each column has squared entries adding to one: $0.75+0.25=1$ for the first and $0.25+0.75=1$ for the second. The two columns are also orthogonal, so the matrix is unitary.',
  err:'Solving for $\\lambda$ as though three conditions were given. Only two numbers were asked for and only two are determined; inventing a third condition produces one particular gate and hides the fact that many gates do the job.',
  teach:'Part (b) is the one to press on. It is the same counting argument as the chapter opening: a state needs two parameters and a gate needs three, so one parameter of the gate is always left over when only a state is specified.' },

{ id:'D4-12', module:'M4', type:'decomp', src:'L7 · local gates, entangling gates and universality',
  stem:'A machine offers only $H$, $S$, $T$ and CNOT.',
  parts:['How many $T$ gates make a $Z$? Show the chain.',
         'Is $\\{H,S,\\mathrm{CNOT}\\}$ on its own universal? Say why or why not.',
         'A one-qubit gate is to be approximated to $\\varepsilon$, and the gate count grows like $\\log^{2}(1/\\varepsilon)$. By what factor does the count grow when $\\varepsilon$ drops from $10^{-2}$ to $10^{-4}$?'],
  sol:'<b>Given.</b> A discrete instruction set and a question about what it reaches.<br>'
     +'<b>Method.</b> Chain the phase gates, then separate the two independent questions a gate set raises: does it entangle, and does it leave the Clifford group.<br>'
     +'<b>Solution — (a).</b> $T^{2}=S$ and $S^{2}=Z$, so $T^{4}=Z$: four of them.<br>'
     +'<b>Solution — (b).</b> No. $H$, $S$ and CNOT generate the Clifford group, which maps Pauli operators to Pauli operators. A Clifford circuit can be simulated on a classical computer in polynomial time, so the set cannot reach every unitary and offers no advantage on its own.<br>'
     +'<b>Solution — (c).</b> The count is proportional to $\\log^{2}(1/\\varepsilon)$, and $\\log(10^{4})/\\log(10^{2})=2$, so the count grows by a factor of $2^{2}=4$.<br>'
     +'<b>Check.</b> Part (a) says $T^{8}=I$, so eight $T$ gates are a full turn of the equator and return the identity — which is the same statement as $T$ being an eighth turn. Part (c) is a ratio, so no unknown constant is needed and none was used.',
  err:'Answering (b) with "yes, it has an entangling gate, so it is universal". Entangling is one of the two requirements. The other is leaving the Clifford group, and it is the one $T$ was added for.',
  teach:'Part (c) is worth doing carefully. Students quote Solovay–Kitaev as though the constant mattered; the whole practical content is that accuracy is cheap, and the ratio shows that without any constant at all.' },

/* ---- two-qubit gates, and which qubit is which ------------------------ */

{ id:'D4-13', module:'M4', type:'two', src:'L7 · qubit and bit-order conventions',
  stem:'The two-qubit state is $|\\psi\\rangle=\\tfrac{1}{\\sqrt3}\\left(|00\\rangle+|01\\rangle+|10\\rangle\\right)$, written $|q_1q_0\\rangle$.',
  parts:['Give $(I\\otimes X)|\\psi\\rangle$.',
         'Give $(X\\otimes I)|\\psi\\rangle$.',
         'Name one measurement outcome whose probability tells the two apart.'],
  sol:'<b>Given.</b> One state and the same one-qubit gate applied to each of its two qubits in turn.<br>'
     +'<b>Method.</b> $I\\otimes X$ flips $q_0$, the right digit; $X\\otimes I$ flips $q_1$, the left digit. Act on the three basis states one at a time.<br>'
     +'<b>Solution — (a).</b> $|00\\rangle\\to|01\\rangle$, $|01\\rangle\\to|00\\rangle$, $|10\\rangle\\to|11\\rangle$, so the result is $\\tfrac{1}{\\sqrt3}\\left(|00\\rangle+|01\\rangle+|11\\rangle\\right)$.<br>'
     +'<b>Solution — (b).</b> $|00\\rangle\\to|10\\rangle$, $|01\\rangle\\to|11\\rangle$, $|10\\rangle\\to|00\\rangle$, so the result is $\\tfrac{1}{\\sqrt3}\\left(|00\\rangle+|10\\rangle+|11\\rangle\\right)$.<br>'
     +'<b>Solution — (c).</b> The outcome $01$. Its probability is $\\tfrac13$ after (a) and $0$ after (b), so a few hundred shots separate the two with no ambiguity.<br>'
     +'<b>Check.</b> Both results are normalised and both have three equal amplitudes, which is why neither the norm nor a casual glance catches the mistake. They share two of their three basis states and differ in the third.',
  err:'Reading $I\\otimes X$ as "$X$ on the first qubit named" and applying it to $q_1$. Both operators are perfectly valid four-by-four unitaries and both give a normalised state, so nothing downstream raises an error.',
  teach:'Set this as a five-minute exercise on a machine as well as on paper: prepare the state, apply $X$ to the qubit you mean, and print all four amplitudes. That is the only reliable test when a state crosses from one program to another.' },

{ id:'D4-14', module:'M4', type:'two', src:'L7 · the CNOT gate',
  stem:'The state $\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|10\\rangle\\right)$ is handed to a CNOT.',
  parts:['Give the result when the control is $q_0$ and the target is $q_1$.',
         'Give the result when the control is $q_1$ and the target is $q_0$.',
         'Which of the two outputs is entangled? Give its entanglement entropy in bits.'],
  sol:'<b>Given.</b> A state in which $q_0$ is $|0\\rangle$ and $q_1$ is $|{+}\\rangle$, and a gate whose direction has not yet been named.<br>'
     +'<b>Method.</b> Write the action on the two basis states present, using $|c\\rangle|t\\rangle\\mapsto|c\\rangle|c\\oplus t\\rangle$ with the stated control.<br>'
     +'<b>Solution — (a).</b> The control is $q_0$, which is $0$ in both terms, so the gate does nothing: the state is unchanged, $\\tfrac{1}{\\sqrt2}(|00\\rangle+|10\\rangle)$.<br>'
     +'<b>Solution — (b).</b> The control is $q_1$. $|00\\rangle$ is untouched and $|10\\rangle\\to|11\\rangle$, giving $\\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)=|\\Phi^{+}\\rangle$.<br>'
     +'<b>Solution — (c).</b> Only the second. The amplitude test on $(a)$ gives $c_0c_3-c_1c_2=0$, and on $(b)$ it gives $\\tfrac12\\ne0$. Its Schmidt weights are $\\tfrac12$ and $\\tfrac12$, so $S=1$ bit.<br>'
     +'<b>Check.</b> The reduced states confirm it: after (a) each qubit is pure, $|{+}\\rangle$ and $|0\\rangle$, with purity one. After (b) both are $I/2$ with purity one half, and $S=-2\\times\\tfrac12\\log_2\\tfrac12=1$.',
  err:'Answering the question at all without noticing that the direction was not stated. "Apply a CNOT" is not an instruction: one direction here produces a maximally entangled pair and the other produces nothing at all.',
  teach:'This is the sharpest pair in the sheet. One gate name, two readings, and the difference is the whole of the chapter\u2019s entanglement content against no change whatsoever.' },

{ id:'D4-15', module:'M4', type:'two', src:'L7 · the controlled-Z gate',
  stem:'The controlled-$Z$ gate, $\\mathrm{CZ}=\\operatorname{diag}(1,1,1,-1)$, is applied to $|{+}\\rangle\\otimes|{+}\\rangle$.',
  parts:['Give the output state.',
         'Is it entangled? Give the reduced state of one qubit and the entropy.',
         'CZ moves no probability at all. Reconcile that with the answer to (b).'],
  sol:'<b>Given.</b> A diagonal gate and an input with all four amplitudes equal.<br>'
     +'<b>Method.</b> A diagonal gate multiplies each amplitude by its own phase. Then use the amplitude test and the coefficient matrix.<br>'
     +'<b>Solution — (a).</b> The input is $\\tfrac12(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle)$, and only the last term changes sign: $\\tfrac12(|00\\rangle+|01\\rangle+|10\\rangle-|11\\rangle)$.<br>'
     +'<b>Solution — (b).</b> $c_0c_3-c_1c_2=\\left(\\tfrac12\\right)\\left(-\\tfrac12\\right)-\\left(\\tfrac12\\right)\\left(\\tfrac12\\right)=-\\tfrac12\\ne0$, so yes. The coefficient matrix is $C=\\tfrac12\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}$, so $\\rho_A=CC^{\\dagger}=\\tfrac12 I$ and $S=1$ bit: maximally entangled.<br>'
     +'<b>Solution — (c).</b> The four outcome probabilities are $\\tfrac14$ each before and after, so no probability moved. What moved is a relative phase, and the entanglement of a pure state lives in the amplitudes and not in their moduli.<br>'
     +'<b>Check.</b> $\\operatorname{Tr}\\rho_A=1$ and $\\operatorname{Tr}\\rho_A^{2}=\\tfrac12$, the lowest a qubit can reach, which agrees with $S=1$ bit — and the pair itself is pure throughout.',
  err:'Concluding that a diagonal gate cannot entangle, because it changes no computational-basis probability. That is true of the probabilities and false of the state, and this input is the counterexample.',
  teach:'Ask what happens to $|0\\rangle\\otimes|0\\rangle$ under the same gate: nothing at all. One gate, one input entangled to the maximum and another untouched, which is the definition of an entangling gate stated as an experiment.' },

{ id:'D4-16', module:'M4', type:'two', src:'L7 · the SWAP gate',
  stem:'A chip couples $q_0$ to $q_1$ and $q_1$ to $q_2$, and nothing else. A CNOT is wanted with $q_0$ as control and $q_2$ as target.',
  parts:['Give the SWAP gate as a matrix, in the ordering $|q_1q_0\\rangle$.',
         'How many CNOTs does the whole job cost if the qubits may be left in their new positions?',
         'And if they must be returned to where they started?',
         'A reversible half adder must also write $s=a\\oplus b$ and $c=ab$. Give an embedding that preserves its inputs, and name the gates that write the two outputs.'],
  sol:'<b>Given.</b> A coupling map with a missing edge, and a gate that needs it.<br>'
     +'<b>Method.</b> SWAP exchanges the two labels; three CNOTs build one when CNOT is the native gate.<br>'
     +'<b>Solution — (a).</b> $\\mathrm{SWAP}|q_1q_0\\rangle=|q_0q_1\\rangle$ exchanges the middle two basis states, so $\\mathrm{SWAP}=\\begin{bmatrix}1&0&0&0\\\\0&0&1&0\\\\0&1&0&0\\\\0&0&0&1\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> Swap $q_0$ with $q_1$ so that the state of $q_0$ sits next to $q_2$ — three CNOTs — then apply the wanted CNOT: four in total.<br>'
     +'<b>Solution — (c).</b> Swap back afterwards: three more, so seven.<br>'
     +'<b>Solution — (d).</b> Initialise two output wires to zero and use $(a,b,0,0)\\mapsto(a,b,a\\oplus b,ab)$. Two CNOTs write the sum on the third wire and one Toffoli writes the carry on the fourth. Keeping $a$ and $b$ makes the map invertible.<br>'
     +'<b>Check.</b> SWAP creates no entanglement, so none of the extra six gates does any of the work; all of it is done by the one CNOT in the middle. That is the honest way to read the cost of limited connectivity.',
  err:'Assuming a SWAP is free because it "only relabels". It only relabels when the algorithm is indifferent to the labels, in which case no gate is needed at all. Here the coupling map is fixed and the qubits really must move.',
  teach:'Ask whether the swap back in part (c) is ever avoidable. It usually is, by renaming the qubits for the rest of the circuit, and noticing that is what a routing pass in a compiler does.' },

/* ---- entangling power and universality ------------------------------- */

{ id:'D4-17', module:'M4', type:'entangle4', src:'L7 · local gates, entangling gates and universality',
  stem:'From $|00\\rangle$, the gate $R_y(\\theta)$ is applied to $q_0$ and then a CNOT with $q_0$ as control and $q_1$ as target.',
  parts:['Give the output state in terms of $\\theta$.',
         'Give the entanglement entropy at $\\theta=120^{\\circ}$.',
         'At which $\\theta$ is the output a product state?',
         'A further one-qubit gate is applied to each qubit. What happens to the entropy?'],
  sol:'<b>Given.</b> The Bell circuit with the first gate made adjustable.<br>'
     +'<b>Method.</b> Follow the two basis terms, then read the Schmidt weights off the two amplitudes.<br>'
     +'<b>Solution — (a).</b> $R_y(\\theta)$ on $q_0$ gives $\\cos\\frac{\\theta}{2}|00\\rangle+\\sin\\frac{\\theta}{2}|01\\rangle$, and the CNOT flips $q_1$ in the second term: $\\cos\\frac{\\theta}{2}|00\\rangle+\\sin\\frac{\\theta}{2}|11\\rangle$.<br>'
     +'<b>Solution — (b).</b> The Schmidt weights are $\\cos^{2}60^{\\circ}=0.25$ and $0.75$, so $S=-0.25\\log_2 0.25-0.75\\log_2 0.75=0.5+0.3113=0.8113$ bits.<br>'
     +'<b>Solution — (c).</b> At $\\theta=0$ and at $\\theta=180^{\\circ}$, where one of the two amplitudes vanishes and the state is $|00\\rangle$ or $|11\\rangle$.<br>'
     +'<b>Solution — (d).</b> Nothing. A local gate $U_A\\otimes U_B$ rotates the two Schmidt bases and leaves the weights untouched, so $S$ is exactly what it was.<br>'
     +'<b>Check.</b> The weights add to one at every $\\theta$, $S$ is never negative, and $S=1$ at $\\theta=90^{\\circ}$, which is the Bell circuit and one full ebit — the largest two qubits can carry.',
  err:'Expecting part (d) to increase the entanglement because more gates have run. Depth is not entanglement: only a gate touching both qubits can change the Schmidt weights, and a one-qubit gate never touches both.',
  teach:'Set part (d) as a prediction before it is computed. It is the question that separates students who have understood the Schmidt decomposition from students who have memorised it.' },

{ id:'D4-18', module:'M4', type:'entangle4', src:'L7 · local gates, entangling gates and universality',
  stem:'Four proposed gate sets: (i) every one-qubit gate; (ii) $\\{H,S,\\mathrm{CNOT}\\}$; (iii) $\\{H,S,T,\\mathrm{CNOT}\\}$; (iv) every one-qubit gate together with CNOT.',
  parts:['Which of the four can produce an entangled state at all?',
         'Which are universal, and in which sense — exactly or to any accuracy?',
         'Give one sentence saying what "universal" does not promise.'],
  sol:'<b>Given.</b> Four sets, differing in two independent ways: whether they entangle, and whether they leave the Clifford group.<br>'
     +'<b>Method.</b> Ask the two questions separately, in that order.<br>'
     +'<b>Solution — (a).</b> Sets (ii), (iii) and (iv) contain CNOT and can entangle. Set (i) cannot: a product of one-qubit gates never changes a Schmidt coefficient, whatever the circuit does.<br>'
     +'<b>Solution — (b).</b> Set (iv) is universal exactly: every unitary is reached with no approximation. Set (iii) is universal to any accuracy $\\varepsilon>0$, and only that: a finite set generates countably many circuits and there are uncountably many unitaries. Set (ii) is not universal in either sense.<br>'
     +'<b>Solution — (c).</b> It promises that every unitary can be approximated, and says nothing at all about the length of the circuit that does it.<br>'
     +'<b>Check.</b> A counting argument backs part (c): there are far more $n$-qubit unitaries than circuits of any fixed short length, so almost every unitary needs a circuit exponential in $n$. Universality makes a machine programmable; it is never an argument that a task is fast.',
  err:'Treating "universal" as a performance claim. It is a reachability claim. Every classical computer is universal too, and that has never been a reason to expect a particular program to be quick.',
  teach:'The two-question habit in the Method line is what to install: does it entangle, and does it leave the Clifford group. Almost every universality question in an examination is one of those two in disguise.' },

/* ---- full-length ----------------------------------------------------- */

{ id:'D4-19', module:'M4', type:'full', src:'L7 · the quantum circuit model',
  stem:'A single qubit starts in $|0\\rangle$. The circuit applies $H$, then $T$, then $H$, and the qubit is measured in the computational basis.',
  parts:['Give the Bloch vector after each of the three gates.',
         'Give $p(0)$ exactly, and as a decimal.',
         'How many shots are needed to estimate that probability to $\\pm0.01$ at two standard errors?',
         'The $T$ is replaced by $T^{\\dagger}$. What happens to $p(0)$, and why?'],
  sol:'<b>Given.</b> The smallest circuit in which a phase becomes visible, and a measurement of it.<br>'
     +'<b>Method.</b> Follow the vector: $H$ exchanges $x$ and $z$ and reverses $y$; $T$ turns the vector $45^{\\circ}$ about $\\hat{z}$.<br>'
     +'<b>Solution — (a).</b> Start $(0,0,1)$. After $H$: $(1,0,0)$. After $T$: $(0.7071,\\,0.7071,\\,0)$. After the second $H$: $(0,\\,-0.7071,\\,0.7071)$.<br>'
     +'<b>Solution — (b).</b> $p(0)=\\tfrac12(1+r_z)=\\tfrac12(1+0.7071)=0.8536$, and exactly $\\cos^{2}(\\pi/8)=\\tfrac12\\left(1+\\tfrac{1}{\\sqrt2}\\right)$.<br>'
     +'<b>Solution — (c).</b> Two standard errors is $0.01$, so $\\mathrm{SE}=0.005$ and $N=p(1-p)/\\mathrm{SE}^{2}=0.8536\\times0.1464/(2.5\\times10^{-5})=5000$ shots.<br>'
     +'<b>Solution — (d).</b> It is unchanged, at $0.8536$. $T^{\\dagger}$ turns the vector the other way, to $(0.7071,-0.7071,0)$, and the second $H$ maps that to $(0,0.7071,0.7071)$ — the same $r_z$, with only the sign of $r_y$ different.<br>'
     +'<b>Check.</b> The length is one after every gate, as three rotations require. And the middle vector has $r_z=0$, so a measurement taken there would have been a fair coin: the whole of the answer was created by the last gate turning a phase into a population.',
  err:'Stopping after the $T$ and reporting $p(0)=0.5$ as though the circuit were finished, or applying the gates in the order $H$, $H$, $T$ because the product was read left to right.',
  teach:'Part (d) is the one worth the time. Two circuits that differ by the sign of a phase give the same computational-basis statistics, and separating them needs a different final gate — which is the design problem chapter 6 solves for a whole register.' },

{ id:'D4-20', module:'M4', type:'full', src:'L7 · the Bell-state circuit',
  stem:'Two qubits start in $|00\\rangle$, written $|q_1q_0\\rangle$. The circuit applies $H$ to $q_0$, then a CNOT with $q_0$ as control and $q_1$ as target, then $Z$ to $q_1$.',
  parts:['Give the state after each of the three gates, and name the final one.',
         'Give the two reduced states, and the entanglement in bits.',
         'Give the probabilities of the four computational-basis outcomes.',
         'A colleague claims the circuit produced $|\\Phi^{+}\\rangle$. Name one measurement setting that decides the question, and say how many shots it needs in the ideal case.'],
  sol:'<b>Given.</b> The Bell circuit with one extra gate at the end.<br>'
     +'<b>Method.</b> Act on the basis terms in the order the circuit runs, keeping the ordering $|q_1q_0\\rangle$ throughout.<br>'
     +'<b>Solution — (a).</b> $H$ on $q_0$: $\\tfrac{1}{\\sqrt2}(|00\\rangle+|01\\rangle)$. The CNOT flips $q_1$ where $q_0=1$: $\\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)=|\\Phi^{+}\\rangle$. $Z$ on $q_1$ changes the sign of the term with $q_1=1$: $\\tfrac{1}{\\sqrt2}(|00\\rangle-|11\\rangle)=|\\Phi^{-}\\rangle$.<br>'
     +'<b>Solution — (b).</b> The coefficient matrix is $\\tfrac{1}{\\sqrt2}\\operatorname{diag}(1,-1)$, so $\\rho_{q_1}=\\rho_{q_0}=I/2$, the Schmidt weights are $\\tfrac12$ and $\\tfrac12$, and $S=1$ bit.<br>'
     +'<b>Solution — (c).</b> $p(00)=p(11)=\\tfrac12$ and $p(01)=p(10)=0$: the two readings always agree.<br>'
     +'<b>Solution — (d).</b> Measure both qubits in the $X$ basis. $\\langle X\\otimes X\\rangle=+1$ for $|\\Phi^{+}\\rangle$ and $-1$ for $|\\Phi^{-}\\rangle$, so both outcomes are certain and a single ideal shot decides it. In practice a few hundred shots are run to bound the readout error.<br>'
     +'<b>Check.</b> The four probabilities add to one. Both states have the same reduced states and the same computational-basis statistics, which is why part (c) cannot answer part (d) and a second basis is needed — exactly the point chapter 3 made about the Bell states.',
  err:'Reporting the final state as $|\\Phi^{+}\\rangle$ because the computational-basis statistics are unchanged, or applying the $Z$ to $q_0$ because the ordering was not fixed at the start. Applying it to $q_0$ gives the same state here, and that coincidence is not a reason to stop naming the qubit.',
  teach:'The last part is the one that transfers. A circuit diagram is not evidence about a state, and the measurement that separates two candidate states has to be chosen deliberately — which is the whole content of tomography and of an entanglement witness.' }

]);

window.DRILL_M4 = [

{ id:'m4-drill', module:'M4', nav:'Module 4 · practice questions',
  title:'Module 4 — practice questions',
  objective:'Twenty open-ended questions with worked solutions, in the shapes the chapter sets.',
  keywords:'practice questions module 4 bloch sphere rotation gate sequence decomposition two qubit cnot universality',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Practice D4-01 … D4-20'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step that reaches the answer a second way. In this chapter the cheap checks are: a Bloch vector of length one, a probability found both from an amplitude and from $\\tfrac12(1+\\mathbf{n}\\cdot\\mathbf{r})$, a gate matrix whose columns are orthonormal, probabilities that add to one, and an entanglement entropy that no one-qubit gate has moved.'},
  {t:'rule', short:true},
  {t:'drill', module:'M4'}
]}

];
})();
