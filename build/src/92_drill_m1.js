/* ==========================================================================
   Practice questions — Module 1.

   Seven shapes of question and twenty questions in those shapes. Every worked
   solution is hidden until the reader asks for it, so a first pass shows the
   target and not the answer, and every one of them ends with a **Check** step
   that reaches the answer a second way.

   The numbers were chosen so that the check is cheap and the arithmetic is
   exact wherever it can be. A question whose answer is a decimal a reader
   cannot verify by hand teaches the reader to trust the page, which is the
   opposite of what a worked solution is for.
   ========================================================================== */
(function(){

/* ======================================================================
   The taxonomy. Six shapes that keep coming back, and one that combines
   them. Each names what the question gives, what it asks, and the method
   that answers it — in the order the method is applied.
   ====================================================================== */
CONTENT.DRILLTYPES.M1 = [
  { k:'inner', name:'Inner products, norms and orthogonality',
    asks:'Two columns of complex numbers are given. Find their overlap, their lengths, and whether they are orthogonal.',
    method:['Write the bra first, as an explicit row: conjugate every entry of the first vector, then lay it on its side. Doing this on the page rather than in your head is what stops the missing conjugate.',
            'Multiply term by term and add. The result is one complex number, and it is a number and not a vector.',
            'A length is $\\sqrt{\\langle a|a\\rangle}$ and is always real and non-negative. If your $\\langle a|a\\rangle$ came out complex, the conjugate went on the wrong side.'],
    go:'m1-bra' },

  { k:'basis', name:'Expanding a state in a basis',
    asks:'A state and a basis are given. Find the coefficients in that basis, or reassemble the state from them.',
    method:['One inner product per basis vector: $v_j=\\langle e_j|v\\rangle$. This works only because the basis is orthonormal, so check that it is before using it.',
            'Write the expansion out, $|v\\rangle=\\sum_j v_j|e_j\\rangle$, and keep the coefficients exact.',
            'Check that $\\sum_j|v_j|^{2}=1$. It must, for any orthonormal basis, and it catches an arithmetic slip in one line.'],
    go:'m1-basis' },

  { k:'phase', name:'Global against relative phase',
    asks:'Two states, or one state and a phase, are given. Decide what is physical, what is not, and what a measurement would see.',
    method:['Try to write one state as a number times the other. If you can, and that number has modulus one, they are the same physical state and every probability agrees.',
            'If you cannot, the phase is between two terms. It changes nothing in the basis the terms are written in, and it changes everything in a basis that mixes them.',
            'To see it, apply a Hadamard — or take the overlap with $|\\pm\\rangle$ — and read the two probabilities.'],
    go:'m1-phase' },

  { k:'op', name:'Building an operator and testing it',
    asks:'An outer product, a projector, or a matrix is given. Build it, or decide whether it is Hermitian, unitary or idempotent.',
    method:['For an outer product, write the column and the conjugated row and multiply. The result is a matrix; if you got a number, the two were the wrong way round.',
            'For Hermitian, form $A^{\\dagger}$ in full — conjugate, then transpose — and compare. The two shortcuts are that the diagonal must be real and the off-diagonal entries must be conjugate pairs.',
            'For unitary, compute $U^{\\dagger}U$ and compare with $I$. A determinant of modulus one does not settle it.',
            'For a projector, check $P^{2}=P$ and $P^{\\dagger}=P$ together. Either one alone is satisfied by things that are not projectors.'],
    go:'m1-outer' },

  { k:'spec', name:'Eigenvalues, the spectral form, and functions',
    asks:'A small Hermitian matrix is given. Find its eigenvalues and projectors, and evaluate a function of it.',
    method:['Solve $\\det(A-\\lambda I)=0$. For a $2\\times2$ this is $\\lambda^{2}-(\\operatorname{tr}A)\\lambda+\\det A=0$, and the two coefficients are read straight off the matrix.',
            'For each eigenvalue solve $(A-\\lambda I)|v\\rangle=0$ and normalise. Then $P_k=|v_k\\rangle\\langle v_k|$.',
            'Check $\\sum_k P_k=I$ and $P_jP_k=0$ for $j\\ne k$ before going on. Everything after this rests on both.',
            'A function acts on the eigenvalues and leaves the projectors alone: $f(A)=\\sum_k f(\\lambda_k)P_k$. Never entry by entry.'],
    go:'m1-spectral' },

  { k:'tensor', name:'Tensor products, bit order and counting',
    asks:'Two or more subsystems are given. Build the joint column, say which entry is which basis string, or count what the space costs.',
    method:['Order the factors as this course does, $|q_{n-1}\\rangle\\otimes\\cdots\\otimes|q_{0}\\rangle$, and expand: every entry of the first multiplies the whole of the second.',
            'Entry $x$ of the column is the amplitude of $|x\\rangle$, with $x$ read as a binary number. Convert the string to a number and count from zero.',
            'For a counting question, dimensions multiply: $2^{n}$ amplitudes, $16\\times2^{n}$ bytes in double precision, and $n$ bits back from a measurement.'],
    go:'m1-tensor' },

  { k:'full', name:'A full-length question combining several of the shapes',
    asks:'One statement and three to five lettered parts, most of them resting on the part before.',
    method:['Read every part before starting. A later part almost always uses a number an earlier part produced, so an error early on travels the whole way.',
            'Name the shape of each part before working it, and use the method for that shape unchanged.',
            'Carry exact values between parts. Probabilities must add to one at every stage, and a Hermitian operator must have real eigenvalues at every stage; either check finds a slip immediately.'] }
];

/* ======================================================================
   The questions.
   ====================================================================== */
CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---- inner products ------------------------------------------------- */

{ id:'D1-01', module:'M1', type:'inner', src:'L2 · inner products',
  stem:'Two states of one qubit are $$|a\\rangle=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1\\\\ i\\end{bmatrix}, \\qquad |b\\rangle=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1\\\\ 1\\end{bmatrix}.$$',
  parts:['Compute $\\langle a|b\\rangle$.',
         'Compute $\\langle b|a\\rangle$, and state the relation between the two.',
         'Give $|\\langle a|b\\rangle|^{2}$ and say what it means about telling the two states apart.'],
  sol:'<b>Given.</b> Two normalised columns, one of them complex.<br>'
     +'<b>Find.</b> The overlap both ways round, and its squared modulus.<br>'
     +'<b>Method.</b> Write the bra explicitly, then multiply term by term.<br>'
     +'<b>Solution — (a).</b> $\\langle a|=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-i\\end{bmatrix}$, so $\\langle a|b\\rangle=\\tfrac12\\left[(1)(1)+(-i)(1)\\right]=\\tfrac{1-i}{2}$.<br>'
     +'<b>Solution — (b).</b> $\\langle b|=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\end{bmatrix}$, so $\\langle b|a\\rangle=\\tfrac12\\left[(1)(1)+(1)(i)\\right]=\\tfrac{1+i}{2}$. The two are complex conjugates: $\\langle b|a\\rangle=\\langle a|b\\rangle^{*}$.<br>'
     +'<b>Solution — (c).</b> $\\left|\\tfrac{1-i}{2}\\right|^{2}=\\tfrac{1^{2}+1^{2}}{4}=\\tfrac12$. The two states are neither the same nor orthogonal, so no measurement can separate them with certainty.<br>'
     +'<b>Check.</b> Both are normalised, $\\langle a|a\\rangle=\\tfrac12(1+1)=1$ and $\\langle b|b\\rangle=1$, so Cauchy–Schwarz requires $|\\langle a|b\\rangle|\\le1$. Here it is $1/\\sqrt2\\approx0.707$, comfortably inside.',
  err:'Writing $\\langle a|=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&i\\end{bmatrix}$, without the conjugate. That gives $\\tfrac{1+i}{2}$ for part (a) and the same for part (b), so the relation in (b) disappears and nothing warns you.',
  teach:'Ask for part (b) before part (a) is marked. A student who has to compute the second overlap from scratch, rather than conjugating the first, has not yet noticed the relation.' },

{ id:'D1-02', module:'M1', type:'inner', src:'L2 · inner products',
  stem:'An unnormalised column is $|\\tilde\\psi\\rangle = 3|0\\rangle + 4i|1\\rangle$.',
  parts:['Give $\\langle\\tilde\\psi|\\tilde\\psi\\rangle$ and the length $\\|\\tilde\\psi\\|$.',
         'Give the normalised state $|\\psi\\rangle$.',
         'Give the two computational-basis probabilities that Chapter 2 will read off it.'],
  sol:'<b>Given.</b> $|\\tilde\\psi\\rangle=(3,\\,4i)$, not normalised.<br>'
     +'<b>Method.</b> Square the modulus of each entry, add, take the root, divide.<br>'
     +'<b>Solution — (a).</b> $|3|^{2}=9$ and $|4i|^{2}=16$, so $\\langle\\tilde\\psi|\\tilde\\psi\\rangle=25$ and $\\|\\tilde\\psi\\|=5$.<br>'
     +'<b>Solution — (b).</b> $|\\psi\\rangle=\\tfrac{1}{5}\\left(3|0\\rangle+4i|1\\rangle\\right)$.<br>'
     +'<b>Solution — (c).</b> $p(0)=\\left|\\tfrac35\\right|^{2}=\\tfrac{9}{25}=0.36$ and $p(1)=\\left|\\tfrac{4i}{5}\\right|^{2}=\\tfrac{16}{25}=0.64$.<br>'
     +'<b>Check.</b> $0.36+0.64=1$, which is what normalising was for. And $9+16=25$ is the same Pythagorean triple as the length, which is the same statement read twice.',
  err:'Taking $|4i|^{2}=-16$, from $(4i)^{2}=-16$. The squared modulus is $z z^{*}$ and never $z^{2}$; a probability that came out negative is this mistake and no other.',
  teach:'The $3$–$4$–$5$ triangle is chosen so the arithmetic is invisible and the structure is not. Change $4i$ to $4$ and ask what changed: nothing here, and everything in Chapter 2 once a second basis is used.' },

{ id:'D1-03', module:'M1', type:'inner', src:'L2 · inner products',
  stem:'A student computes the squared length of $|a\\rangle=(1,\\,i)$ in NumPy with <code>np.dot(a, a)</code> and gets zero.',
  parts:['Compute $\\langle a|a\\rangle$ correctly.',
         'Compute the quantity <code>np.dot(a, a)</code> returns, and say what it would claim about $|a\\rangle$.',
         'Give the normalised state.'],
  sol:'<b>Given.</b> One complex column, and a routine that does not conjugate.<br>'
     +'<b>Method.</b> Do it both ways and compare.<br>'
     +'<b>Solution — (a).</b> $\\langle a|=\\begin{bmatrix}1&-i\\end{bmatrix}$, so $\\langle a|a\\rangle=(1)(1)+(-i)(i)=1+1=2$.<br>'
     +'<b>Solution — (b).</b> Without the conjugate the sum is $(1)(1)+(i)(i)=1-1=0$. Read as an inner product that says $|a\\rangle$ is a vector of length zero, and therefore that it is orthogonal to itself.<br>'
     +'<b>Solution — (c).</b> $\\|a\\|=\\sqrt2$, so $|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right)$.<br>'
     +'<b>Check.</b> A correct $\\langle a|a\\rangle$ is a sum of squared moduli and is therefore real and never negative. The value $0$ is possible only for the zero vector, and $(1,i)$ is not it, so the second answer is wrong for a reason that needs no arithmetic at all.',
  err:'Concluding that the state is somehow degenerate rather than that the routine is the wrong one. The correct call is <code>np.vdot(a, a)</code>, which conjugates its first argument.',
  teach:'Worth running in front of the class. The failure is silent, returns a perfectly plausible number, and appears in almost every first quantum program.' },

/* ---- expanding in a basis -------------------------------------------- */

{ id:'D1-04', module:'M1', type:'basis', src:'L2 · dimension and bases',
  stem:'A state is $|\\psi\\rangle = \\tfrac{\\sqrt3}{2}|0\\rangle + \\tfrac12|1\\rangle$.',
  parts:['Confirm that it is normalised.',
         'Expand it in the basis $|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$.',
         'Give $|\\langle+|\\psi\\rangle|^{2}$ and $|\\langle-|\\psi\\rangle|^{2}$, and check them.'],
  sol:'<b>Given.</b> A real superposition, and a second orthonormal basis.<br>'
     +'<b>Method.</b> One inner product per basis vector.<br>'
     +'<b>Solution — (a).</b> $\\tfrac34+\\tfrac14=1$.<br>'
     +'<b>Solution — (b).</b> $\\langle+|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(\\tfrac{\\sqrt3}{2}+\\tfrac12\\right)=\\tfrac{\\sqrt3+1}{2\\sqrt2}$ and $\\langle-|\\psi\\rangle=\\tfrac{\\sqrt3-1}{2\\sqrt2}$, so $$|\\psi\\rangle=\\tfrac{\\sqrt3+1}{2\\sqrt2}\\,|+\\rangle+\\tfrac{\\sqrt3-1}{2\\sqrt2}\\,|-\\rangle.$$'
     +'<b>Solution — (c).</b> $\\left|\\tfrac{\\sqrt3+1}{2\\sqrt2}\\right|^{2}=\\tfrac{4+2\\sqrt3}{8}=\\tfrac{2+\\sqrt3}{4}\\approx0.9330$ and $\\left|\\tfrac{\\sqrt3-1}{2\\sqrt2}\\right|^{2}=\\tfrac{2-\\sqrt3}{4}\\approx0.0670$.<br>'
     +'<b>Check.</b> The two add to $\\tfrac{(2+\\sqrt3)+(2-\\sqrt3)}{4}=1$, as they must in any orthonormal basis. The $\\sqrt3$ cancels exactly, which is the check doing its work: had either coefficient been wrong the cancellation would fail.',
  err:'Reporting the coefficients as $\\tfrac34$ and $\\tfrac14$, the probabilities in the <em>computational</em> basis. The state has not changed, but the basis has, and the coefficients belong to the basis.',
  teach:'The state is $|\\psi(\\theta)\\rangle$ at $\\theta=60^{\\circ}$, so it sits $15^{\\circ}$ from $|+\\rangle$ on the circle of the overlap scene, and $\\cos^{2}15^{\\circ}=0.9330$. Worth showing after the algebra, not before.' },

{ id:'D1-05', module:'M1', type:'basis', src:'L2 · projectors and the resolution of identity',
  stem:'The resolution of the identity in the $X$ basis is $|+\\rangle\\langle+|+|-\\rangle\\langle-|=I$.',
  parts:['Insert it into $\\langle 0|1\\rangle$ and write the resulting sum.',
         'Evaluate every factor and give the total.',
         'Say what the calculation demonstrates.'],
  sol:'<b>Given.</b> Two computational basis states and a different orthonormal basis.<br>'
     +'<b>Method.</b> Insert the identity between the bra and the ket, then evaluate the four overlaps.<br>'
     +'<b>Solution — (a).</b> $\\langle0|1\\rangle=\\langle0|I|1\\rangle=\\langle0|+\\rangle\\langle+|1\\rangle+\\langle0|-\\rangle\\langle-|1\\rangle$.<br>'
     +'<b>Solution — (b).</b> $\\langle0|+\\rangle=\\tfrac{1}{\\sqrt2}$, $\\langle+|1\\rangle=\\tfrac{1}{\\sqrt2}$, $\\langle0|-\\rangle=\\tfrac{1}{\\sqrt2}$, $\\langle-|1\\rangle=-\\tfrac{1}{\\sqrt2}$. The sum is $\\tfrac12-\\tfrac12=0$.<br>'
     +'<b>Solution — (c).</b> The answer is $\\langle0|1\\rangle=0$, which was known from the start. What the calculation shows is that inserting the identity is exact: it changes the route and not the number.<br>'
     +'<b>Check.</b> Run the same insertion on $\\langle0|0\\rangle$: $\\tfrac12+\\tfrac12=1$, again the known answer. A basis that gave anything else would not be orthonormal.',
  err:'Dropping the minus sign in $\\langle-|1\\rangle$. The sum then comes to one, and $|0\\rangle$ and $|1\\rangle$ appear to be the same state.',
  teach:'This is the move, not the result. Set it again with a basis the student chooses, and the point lands: the answer cannot depend on which identity was inserted.' },

/* ---- phase ------------------------------------------------------------ */

{ id:'D1-06', module:'M1', type:'phase', src:'L3 · global phase, relative phase and interference',
  stem:'Three states are $$|\\psi_1\\rangle=\\tfrac{|0\\rangle+i|1\\rangle}{\\sqrt2}, \\quad |\\psi_2\\rangle=\\tfrac{i|0\\rangle-|1\\rangle}{\\sqrt2}, \\quad |\\psi_3\\rangle=\\tfrac{|0\\rangle-i|1\\rangle}{\\sqrt2}.$$',
  parts:['Decide whether $|\\psi_1\\rangle$ and $|\\psi_2\\rangle$ are the same physical state.',
         'Compute $\\langle\\psi_1|\\psi_3\\rangle$.',
         'Say which pair a measurement can separate with certainty, and which it cannot separate at all.'],
  sol:'<b>Given.</b> Three normalised states differing only in phases.<br>'
     +'<b>Method.</b> Try to write one as a number times another; where that fails, take the overlap.<br>'
     +'<b>Solution — (a).</b> $i\\left(|0\\rangle+i|1\\rangle\\right)=i|0\\rangle+i^{2}|1\\rangle=i|0\\rangle-|1\\rangle$, so $|\\psi_2\\rangle=i|\\psi_1\\rangle$. The factor $i$ has modulus one, so it is a global phase and the two are the same physical state.<br>'
     +'<b>Solution — (b).</b> $\\langle\\psi_1|=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-i\\end{bmatrix}$ and $|\\psi_3\\rangle=\\tfrac{1}{\\sqrt2}(1,\\,-i)$, so $\\langle\\psi_1|\\psi_3\\rangle=\\tfrac12\\left[(1)(1)+(-i)(-i)\\right]=\\tfrac12\\left[1-1\\right]=0$.<br>'
     +'<b>Solution — (c).</b> $|\\psi_1\\rangle$ and $|\\psi_3\\rangle$ are orthogonal, so one measurement separates them with certainty. $|\\psi_1\\rangle$ and $|\\psi_2\\rangle$ are the same state, so nothing separates them ever.<br>'
     +'<b>Check.</b> $|\\langle\\psi_1|\\psi_2\\rangle|=|i|\\,\\langle\\psi_1|\\psi_1\\rangle=1$, the largest an overlap of normalised states can be, and $|\\langle\\psi_1|\\psi_3\\rangle|=0$, the smallest. The three states occupy both ends of the Cauchy–Schwarz range and nothing in between.',
  err:'Calling $|\\psi_3\\rangle$ a global phase away from $|\\psi_1\\rangle$ because "only the sign of $i$ changed". The sign changed on <em>one term</em>, which is a relative phase of $\\pi$, and it takes the state to an orthogonal one.',
  teach:'The three states are $|{+}i\\rangle$, the same state again, and $|{-}i\\rangle$. Naming them afterwards makes the point that the labels were not needed.' },

{ id:'D1-07', module:'M1', type:'phase', src:'L3 · global phase, relative phase and interference',
  stem:'A qubit is prepared in $|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\varphi}|1\\rangle\\right)$.',
  parts:['Give $P(0)$ and $P(1)$ in the computational basis.',
         'Apply a Hadamard and give the two probabilities after it, as a function of $\\varphi$.',
         'Evaluate both at $\\varphi=\\pi/3$.'],
  sol:'<b>Given.</b> An even superposition with an adjustable relative phase.<br>'
     +'<b>Method.</b> Expand $H$ on each term and collect the two basis states, then take squared moduli.<br>'
     +'<b>Solution — (a).</b> The amplitudes have modulus $1/\\sqrt2$ whatever $\\varphi$ is, so $P(0)=P(1)=\\tfrac12$ and neither depends on the phase.<br>'
     +'<b>Solution — (b).</b> $H|0\\rangle=\\tfrac{|0\\rangle+|1\\rangle}{\\sqrt2}$ and $H|1\\rangle=\\tfrac{|0\\rangle-|1\\rangle}{\\sqrt2}$, so $$H|\\psi\\rangle=\\tfrac{1+e^{i\\varphi}}{2}|0\\rangle+\\tfrac{1-e^{i\\varphi}}{2}|1\\rangle.$$ Writing $1+e^{i\\varphi}=2e^{i\\varphi/2}\\cos(\\varphi/2)$ gives $P(0)=\\cos^{2}(\\varphi/2)$ and $P(1)=\\sin^{2}(\\varphi/2)$.<br>'
     +'<b>Solution — (c).</b> At $\\varphi=\\pi/3$: $\\cos^{2}(\\pi/6)=\\tfrac34$ and $\\sin^{2}(\\pi/6)=\\tfrac14$.<br>'
     +'<b>Check.</b> At $\\varphi=0$ the state is $|+\\rangle$ and the formula gives $P(0)=1$, which is $H|+\\rangle=|0\\rangle$. At $\\varphi=\\pi$ it is $|-\\rangle$ and the formula gives $P(1)=1$. Both are the results of the phase scene, reached from a formula that was derived without them.',
  err:'Answering part (b) with $\\tfrac12$ and $\\tfrac12$, on the grounds that the phase is unobservable. It is unobservable in the basis of part (a) and in no other; the Hadamard is exactly the change of basis that exposes it.',
  teach:'This is the interferometer of Chapter 0 with the middle gate removed and the phase written in by hand. Saying so after the working, not before, is what makes the two feel like one thing.' },

/* ---- operators -------------------------------------------------------- */

{ id:'D1-08', module:'M1', type:'op', src:'L2 · projectors and the resolution of identity',
  stem:'A state is $|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right)$.',
  parts:['Form the operator $P=|\\psi\\rangle\\langle\\psi|$ as a $2\\times2$ matrix.',
         'Verify that $P^{\\dagger}=P$ and $P^{2}=P$.',
         'Compute $P|0\\rangle$ and give its length.'],
  sol:'<b>Given.</b> One normalised complex state.<br>'
     +'<b>Method.</b> Column times conjugated row; then two matrix checks; then apply it.<br>'
     +'<b>Solution — (a).</b> $$P=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1\\\\ i\\end{bmatrix}\\cdot\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-i\\end{bmatrix}=\\tfrac12\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}.$$'
     +'<b>Solution — (b).</b> Conjugating gives $\\tfrac12\\begin{bmatrix}1&i\\\\ -i&1\\end{bmatrix}$ and transposing that returns $P$, so $P^{\\dagger}=P$. For the square, $\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}^{2}=\\begin{bmatrix}2&-2i\\\\ 2i&2\\end{bmatrix}$, so $P^{2}=\\tfrac14\\begin{bmatrix}2&-2i\\\\2i&2\\end{bmatrix}=P$.<br>'
     +'<b>Solution — (c).</b> $P|0\\rangle=\\tfrac12(1,\\,i)$, of length $\\sqrt{\\tfrac14+\\tfrac14}=\\tfrac{1}{\\sqrt2}$.<br>'
     +'<b>Check.</b> Part (c) the other way round: $P|0\\rangle=\\langle\\psi|0\\rangle\\,|\\psi\\rangle$ and $\\langle\\psi|0\\rangle=1/\\sqrt2$, so the output is $1/\\sqrt2$ times a unit vector and has length $1/\\sqrt2$. The trace of $P$ is $\\tfrac12+\\tfrac12=1$, as it is for every rank-one projector.',
  err:'Writing the row without conjugating and getting $\\tfrac12\\begin{bmatrix}1&i\\\\ i&-1\\end{bmatrix}$, whose trace is zero. A projector onto one state has trace one, so the trace catches this before any other check does.',
  teach:'Keep this matrix. It is the $\\lambda=2$ projector of D1-13, and a student who has already built it will see the spectral decomposition assemble itself.' },

{ id:'D1-09', module:'M1', type:'op', src:'L3 · Hermitian matrices',
  stem:'Two matrices are $$A=\\begin{bmatrix}2&1+i\\\\ 1-i&3\\end{bmatrix}, \\qquad X=\\begin{bmatrix}0&1\\\\ 1&0\\end{bmatrix}.$$',
  parts:['Decide whether each is Hermitian.',
         'Compute $AX$ and $XA$.',
         'Decide whether $AX$ is Hermitian, and say what settles it.'],
  sol:'<b>Given.</b> Two matrices, both Hermitian, and their product.<br>'
     +'<b>Method.</b> Form the adjoint of each and compare; then multiply both ways round.<br>'
     +'<b>Solution — (a).</b> $A$ has a real diagonal and $\\left(1+i\\right)^{*}=1-i$ in the mirrored position, so $A^{\\dagger}=A$. $X$ is real and symmetric, so $X^{\\dagger}=X$. Both are Hermitian.<br>'
     +'<b>Solution — (b).</b> $AX=\\begin{bmatrix}1+i&2\\\\ 3&1-i\\end{bmatrix}$ and $XA=\\begin{bmatrix}1-i&3\\\\ 2&1+i\\end{bmatrix}$.<br>'
     +'<b>Solution — (c).</b> $(AX)^{\\dagger}=X^{\\dagger}A^{\\dagger}=XA$, and $XA\\ne AX$, so $AX$ is not Hermitian. What settles it is the commutator: $AX-XA=\\begin{bmatrix}2i&-1\\\\ 1&-2i\\end{bmatrix}\\ne0$.<br>'
     +'<b>Check.</b> Read the answer off $AX$ directly: its diagonal is $1+i$ and $1-i$, and a Hermitian matrix has a real diagonal. One glance is enough, and it agrees with the argument.',
  err:'Assuming that a product of Hermitian matrices is Hermitian because each factor is. The adjoint reverses the order, so the product is Hermitian only when the two commute.',
  teach:'The commutator is Chapter 2 arriving early. Point at it and move on; the uncertainty relation is not needed to see that the order matters here.' },

{ id:'D1-10', module:'M1', type:'op', src:'L3 · unitary operators',
  stem:'A matrix is $U=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\ i&-i\\end{bmatrix}$.',
  parts:['Write $U^{\\dagger}$.',
         'Compute $U^{\\dagger}U$ and decide whether $U$ is unitary.',
         'Apply $U$ to $|0\\rangle$ and confirm that the length is preserved.'],
  sol:'<b>Given.</b> A complex $2\\times2$ matrix.<br>'
     +'<b>Method.</b> Conjugate, transpose, multiply, compare with $I$.<br>'
     +'<b>Solution — (a).</b> Conjugating gives $\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\ -i&i\\end{bmatrix}$; transposing that gives $U^{\\dagger}=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-i\\\\ 1&i\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> $$U^{\\dagger}U=\\tfrac12\\begin{bmatrix}1&-i\\\\ 1&i\\end{bmatrix}\\begin{bmatrix}1&1\\\\ i&-i\\end{bmatrix}=\\tfrac12\\begin{bmatrix}1+1&1-1\\\\ 1-1&1+1\\end{bmatrix}=I,$$ so $U$ is unitary.<br>'
     +'<b>Solution — (c).</b> $U|0\\rangle=\\tfrac{1}{\\sqrt2}(1,\\,i)$, whose squared length is $\\tfrac12+\\tfrac12=1$.<br>'
     +'<b>Check.</b> The columns of $U$ are $\\tfrac{1}{\\sqrt2}(1,i)$ and $\\tfrac{1}{\\sqrt2}(1,-i)$. Each has length one and their overlap is $\\tfrac12\\left[1+(-i)(-i)\\right]=0$, so they are orthonormal — which is what $U^{\\dagger}U=I$ says entry by entry.',
  err:'Transposing without conjugating. The product then comes out $\\tfrac12\\begin{bmatrix}1-1&1+1\\\\ 1+1&1-1\\end{bmatrix}=X$, which is not the identity, and the matrix is wrongly rejected.',
  teach:'The two columns are $|{+}i\\rangle$ and $|{-}i\\rangle$, so this $U$ is the change of basis into the $Y$ basis. Saying so connects it to D1-06 without any extra work.' },

{ id:'D1-11', module:'M1', type:'op', src:'L3 · unitary operators',
  stem:'A matrix is $M=\\begin{bmatrix}1&1\\\\ 0&1\\end{bmatrix}$.',
  parts:['Give $\\det M$.',
         'Compute $M^{\\dagger}M$.',
         'Apply $M$ to $|1\\rangle$ and give the length of the result. Is $M$ a legal gate?'],
  sol:'<b>Given.</b> A real, invertible, upper-triangular matrix.<br>'
     +'<b>Method.</b> The determinant first, because it is the tempting test; then the real one.<br>'
     +'<b>Solution — (a).</b> $\\det M=(1)(1)-(1)(0)=1$.<br>'
     +'<b>Solution — (b).</b> $M^{\\dagger}=M^{T}=\\begin{bmatrix}1&0\\\\ 1&1\\end{bmatrix}$, so $M^{\\dagger}M=\\begin{bmatrix}1&1\\\\ 1&2\\end{bmatrix}\\ne I$.<br>'
     +'<b>Solution — (c).</b> $M|1\\rangle=(1,\\,1)$, of length $\\sqrt2$. A normalised state came out with length $\\sqrt2$, so probabilities would add to two. $M$ is not unitary and is not a legal gate.<br>'
     +'<b>Check.</b> $M|0\\rangle=(1,0)$ still has length one, so a single well-chosen input proves nothing. Unitarity is a statement about <em>every</em> vector, and only $U^{\\dagger}U=I$ tests all of them at once.',
  err:'Concluding from $\\det M=1$ that $M$ preserves length. The determinant measures how volumes scale, and a shear leaves volume alone while stretching some directions and squashing others.',
  teach:'Draw the unit circle and its image under $M$: an ellipse of the same area. The picture and the determinant then say the same thing, and it is not the thing that was asked.' },

/* ---- the spectral theorem ---------------------------------------------- */

{ id:'D1-12', module:'M1', type:'spec', src:'L3 · eigenvectors and eigenvalues',
  stem:'A Hermitian matrix is $A=\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}$.',
  parts:['Give the characteristic equation and solve it.',
         'Find a normalised eigenvector for each eigenvalue.',
         'Check the two eigenvalues against the trace and the determinant.'],
  sol:'<b>Given.</b> A $2\\times2$ Hermitian matrix.<br>'
     +'<b>Method.</b> $\\lambda^{2}-(\\operatorname{tr}A)\\lambda+\\det A=0$, then solve $(A-\\lambda I)|v\\rangle=0$ for each root.<br>'
     +'<b>Solution — (a).</b> $\\operatorname{tr}A=2$ and $\\det A=(1)(1)-(-i)(i)=1-1=0$, so $\\lambda^{2}-2\\lambda=0$ and $\\lambda=0$ or $\\lambda=2$.<br>'
     +'<b>Solution — (b).</b> For $\\lambda=2$: $(1-2)v_1-iv_2=0$, so $v_1=-iv_2$; taking $v_2=i$ gives $|v_+\\rangle=\\tfrac{1}{\\sqrt2}(1,\\,i)$. For $\\lambda=0$: $v_1-iv_2=0$, so $v_1=iv_2$; taking $v_2=-i$ gives $|v_-\\rangle=\\tfrac{1}{\\sqrt2}(1,\\,-i)$.<br>'
     +'<b>Solution — (c).</b> $0+2=2=\\operatorname{tr}A$ and $0\\times2=0=\\det A$. Both agree.<br>'
     +'<b>Check.</b> Multiply out: $A(1,i)=(1-i\\cdot i,\\;i+i)=(2,\\,2i)=2(1,i)$, and $A(1,-i)=(1+i\\cdot i,\\;i-i)=(0,\\,0)$. Both eigenvalue equations hold exactly. The two eigenvectors also satisfy $\\langle v_+|v_-\\rangle=\\tfrac12\\left[1+(-i)(-i)\\right]=0$, as Hermiticity requires for distinct eigenvalues.',
  err:'Reporting a complex eigenvalue. $A$ is Hermitian, so both roots are real before any arithmetic is done; a complex answer is an arithmetic error and not a discovery.',
  teach:'A zero eigenvalue surprises students who expect an "energy" to be non-zero. It only means the operator annihilates one direction, which is exactly what the projector structure of the next question makes visible.' },

{ id:'D1-13', module:'M1', type:'spec', src:'L3 · the finite-dimensional spectral theorem',
  stem:'Use the eigenvectors of $A=\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}$, namely $|v_+\\rangle=\\tfrac{1}{\\sqrt2}(1,i)$ with $\\lambda=2$ and $|v_-\\rangle=\\tfrac{1}{\\sqrt2}(1,-i)$ with $\\lambda=0$.',
  parts:['Build the projectors $P_+$ and $P_-$.',
         'Verify $P_++P_-=I$ and $P_+P_-=0$.',
         'Reassemble $A$ from the spectral form and confirm it.'],
  sol:'<b>Given.</b> The eigenvalues and normalised eigenvectors of a Hermitian matrix.<br>'
     +'<b>Method.</b> Outer product for each projector, then the two identities, then the weighted sum.<br>'
     +'<b>Solution — (a).</b> $P_+=|v_+\\rangle\\langle v_+|=\\tfrac12\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}$ and $P_-=|v_-\\rangle\\langle v_-|=\\tfrac12\\begin{bmatrix}1&i\\\\ -i&1\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> $P_++P_-=\\tfrac12\\begin{bmatrix}2&0\\\\ 0&2\\end{bmatrix}=I$. For the product, $\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}\\begin{bmatrix}1&i\\\\ -i&1\\end{bmatrix}=\\begin{bmatrix}1-1&i-i\\\\ i-i&-1+1\\end{bmatrix}=0$, so $P_+P_-=0$.<br>'
     +'<b>Solution — (c).</b> $A=2P_++0\\,P_-=\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}$, which is $A$.<br>'
     +'<b>Check.</b> $\\operatorname{Tr}P_+=\\operatorname{Tr}P_-=1$, as a rank-one projector must have, and $\\operatorname{Tr}A=2(1)+0(1)=2$, which matches the trace read off the matrix. The trace of the spectral form is the sum of the eigenvalues, and that is a check that costs nothing.',
  err:'Building $P_-$ from $|v_-\\rangle\\langle v_+|$ by mistake. That is not Hermitian, does not square to itself, and does not sum with $P_+$ to the identity — three separate warnings, which is why all three checks are worth doing.',
  teach:'The $\\lambda=0$ term contributes nothing to $A$ and everything to the identity. That asymmetry is what makes the spectral form more informative than the matrix, and it is what Chapter 2 measures.' },

{ id:'D1-14', module:'M1', type:'spec', src:'L3 · spectral projectors and functions of an operator',
  stem:'Continue with $A=\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}=2P_++0\\,P_-$.',
  parts:['Give $A^{2}$ from the spectral form, and confirm it by squaring the matrix.',
         'Give $\\sqrt{A}$, meaning the positive operator whose square is $A$.',
         'Give $e^{-iAt}$.'],
  sol:'<b>Given.</b> A Hermitian matrix in spectral form, with eigenvalues $2$ and $0$.<br>'
     +'<b>Method.</b> Apply the function to the eigenvalues; keep the projectors.<br>'
     +'<b>Solution — (a).</b> $A^{2}=2^{2}P_++0^{2}P_-=4P_+=2A=\\begin{bmatrix}2&-2i\\\\ 2i&2\\end{bmatrix}$. Squaring the matrix directly gives the same: $\\begin{bmatrix}1&-i\\\\ i&1\\end{bmatrix}^{2}=\\begin{bmatrix}1+1&-i-i\\\\ i+i&1+1\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> $\\sqrt A=\\sqrt2\\,P_++0\\,P_-=\\sqrt2\\,P_+=\\tfrac{A}{\\sqrt2}$.<br>'
     +'<b>Solution — (c).</b> $e^{-iAt}=e^{-2it}P_++e^{0}P_-=e^{-2it}P_++P_-$.<br>'
     +'<b>Check.</b> Square the answer to (b): $\\left(\\tfrac{A}{\\sqrt2}\\right)^{2}=\\tfrac{A^{2}}{2}=\\tfrac{2A}{2}=A$. And set $t=0$ in (c): both factors become one and the result is $P_++P_-=I$, as any evolution operator must be at zero time.',
  err:'Computing $\\sqrt A$ entry by entry, which asks for $\\sqrt{-i}$ and produces a matrix that squares to something else entirely. A function of an operator is never applied to the entries.',
  teach:'That $A$ has a square root at all is because its eigenvalues are non-negative. Ask what $\\sqrt{A}$ would mean for a Hermitian matrix with a negative eigenvalue: the recipe still runs, and the answer is no longer Hermitian.' },

{ id:'D1-15', module:'M1', type:'spec', src:'L3 · spectral projectors and functions of an operator',
  stem:'For $X=\\begin{bmatrix}0&1\\\\ 1&0\\end{bmatrix}$, compute $e^{X}$.',
  parts:['Give the eigenvalues and the two projectors of $X$.',
         'Give $e^{X}$ from the spectral form, in closed form and to four decimals.',
         'Give the matrix that exponentiating $X$ entry by entry would produce, and show by its eigenvalues that it cannot be the exponential of any Hermitian matrix.'],
  sol:'<b>Given.</b> The Pauli $X$ matrix.<br>'
     +'<b>Method.</b> Diagonalise, exponentiate the eigenvalues, reassemble; then do the wrong thing and inspect it.<br>'
     +'<b>Solution — (a).</b> $\\lambda=\\pm1$, with $|\\pm\\rangle=\\tfrac{1}{\\sqrt2}(1,\\pm1)$, so $P_\\pm=\\tfrac12\\begin{bmatrix}1&\\pm1\\\\ \\pm1&1\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> $e^{X}=e\\,P_++e^{-1}P_-=\\cosh(1)\\,I+\\sinh(1)\\,X$, that is $$e^{X}=\\begin{bmatrix}1.5431&1.1752\\\\ 1.1752&1.5431\\end{bmatrix}.$$'
     +'<b>Solution — (c).</b> Entry by entry it would be $\\begin{bmatrix}e^{0}&e^{1}\\\\ e^{1}&e^{0}\\end{bmatrix}=\\begin{bmatrix}1&2.7183\\\\ 2.7183&1\\end{bmatrix}$, whose eigenvalues are $1\\pm e$, that is $3.7183$ and $-1.7183$. One of them is negative, and $e^{H}$ has eigenvalues $e^{\\lambda_k}$, which are positive for every real $\\lambda_k$. So no Hermitian matrix has that as its exponential.<br>'
     +'<b>Check.</b> The correct answer has eigenvalues $e=2.7183$ and $e^{-1}=0.3679$, both positive, and their product is $1$ — which is $\\det e^{X}=e^{\\operatorname{tr}X}=e^{0}=1$. The wrong answer has determinant $1-e^{2}=-6.389$, and no exponential of a real-trace Hermitian matrix has a negative determinant.',
  err:'Believing the entrywise answer because it is close for a nearly diagonal matrix. The two agree exactly only when the matrix is diagonal, and a student who tests on a diagonal example learns the wrong lesson.',
  teach:'The determinant check in the last line is the fastest way to mark this question, and it is worth teaching for its own sake: $\\det e^{A}=e^{\\operatorname{tr}A}$ holds for every square $A$.' },

/* ---- tensor products --------------------------------------------------- */

{ id:'D1-16', module:'M1', type:'tensor', src:'L2 · tensor products',
  stem:'A two-qubit register has $q_1$ in $|1\\rangle$ and $q_0$ in $|0\\rangle$.',
  parts:['Write the joint state as a four-entry column, in the ordering this course fixes.',
         'Say which entry carries the amplitude, and why.',
         'Give the column the opposite convention would produce, and name the state it describes.'],
  sol:'<b>Given.</b> Two qubits in definite states, and a convention.<br>'
     +'<b>Method.</b> Order the factors $|q_1\\rangle\\otimes|q_0\\rangle$, expand, then read the index as a binary number.<br>'
     +'<b>Solution — (a).</b> $|1\\rangle\\otimes|0\\rangle=\\begin{bmatrix}0\\\\1\\end{bmatrix}\\otimes\\begin{bmatrix}1\\\\0\\end{bmatrix}=\\left(0\\cdot1,\\;0\\cdot0,\\;1\\cdot1,\\;1\\cdot0\\right)=(0,0,1,0)$.<br>'
     +'<b>Solution — (b).</b> Entry $2$, counting from zero. The string is $q_1q_0=10$, and binary $10$ is the number $2$.<br>'
     +'<b>Solution — (c).</b> Ordering $|q_0\\rangle\\otimes|q_1\\rangle$ gives $|0\\rangle\\otimes|1\\rangle=(0,1,0,0)$, entry $1$. Under this course\u2019s reading that column is the state $|01\\rangle$ — a different state, in which the roles of the two qubits are exchanged.<br>'
     +'<b>Check.</b> Exactly one entry is non-zero, as it must be for a product of two basis states, and its position is the decimal value of the bit string. Both conventions give a legal state; only one of them gives the state that was asked for.',
  err:'Reading the column as $(0,0,1,0)\\to$ "the third entry" and calling it $|11\\rangle$. Entries are counted from zero, and $|11\\rangle$ is entry $3$.',
  teach:'This is the convention that fails silently, and it is worth an examination mark of its own. A student who cannot state which end of the string is $q_0$ will produce plausible wrong answers for the rest of the course.' },

{ id:'D1-17', module:'M1', type:'tensor', src:'L2 · tensor products',
  stem:'Consider $$|\\alpha\\rangle=\\tfrac{|0\\rangle+|1\\rangle}{\\sqrt2}\\otimes\\tfrac{|0\\rangle-|1\\rangle}{\\sqrt2}, \\qquad |\\beta\\rangle=\\tfrac{|00\\rangle+|11\\rangle}{\\sqrt2}.$$',
  parts:['Write $|\\alpha\\rangle$ as a four-entry column.',
         'Show that $|\\beta\\rangle$ cannot be written as a product of two single-qubit states.',
         'Arrange the four amplitudes of each state as a $2\\times2$ array $c_{q_1q_0}$ and give its determinant.'],
  sol:'<b>Given.</b> One state built as a product and one written directly.<br>'
     +'<b>Method.</b> Expand the product; then assume a factorisation for the second and find the contradiction.<br>'
     +'<b>Solution — (a).</b> $\\tfrac{1}{\\sqrt2}(1,1)\\otimes\\tfrac{1}{\\sqrt2}(1,-1)=\\tfrac12\\left(1,\\,-1,\\,1,\\,-1\\right)$.<br>'
     +'<b>Solution — (b).</b> Suppose $|\\beta\\rangle=(a_0,a_1)\\otimes(b_0,b_1)=(a_0b_0,\\,a_0b_1,\\,a_1b_0,\\,a_1b_1)$. Matching entries, $a_0b_0=\\tfrac{1}{\\sqrt2}$ forces $a_0\\ne0$ and $b_0\\ne0$; $a_1b_1=\\tfrac{1}{\\sqrt2}$ forces $a_1\\ne0$ and $b_1\\ne0$. But then $a_0b_1\\ne0$, and the second entry of $|\\beta\\rangle$ is $0$. No such factorisation exists.<br>'
     +'<b>Solution — (c).</b> For $|\\alpha\\rangle$: $\\tfrac12\\begin{bmatrix}1&-1\\\\ 1&-1\\end{bmatrix}$, determinant $\\tfrac14\\left[(1)(-1)-(-1)(1)\\right]=0$. For $|\\beta\\rangle$: $\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&0\\\\ 0&1\\end{bmatrix}$, determinant $\\tfrac12$.<br>'
     +'<b>Check.</b> The determinant test agrees with the argument in (b): it vanishes exactly when the array has rank one, which is exactly when the amplitudes factor as $a_jb_k$. It is the same contradiction, computed rather than argued.',
  err:'Concluding that $|\\beta\\rangle$ is a product because each qubit "is in a superposition of $|0\\rangle$ and $|1\\rangle$". Each qubit alone has no state of its own here, which is what Chapter 3 makes precise.',
  teach:'Part (c) is the Schmidt rank in two dimensions, three chapters early. Naming it now costs nothing and gives Chapter 3 something to attach to.' },

{ id:'D1-18', module:'M1', type:'tensor', src:'L2 · tensor products',
  stem:'A register holds $n$ qubits, and a simulator stores each complex amplitude as two double-precision numbers.',
  parts:['Give the number of amplitudes for $n=1,2,3,4$.',
         'Give the number of amplitudes and the storage in bytes for $n=20$.',
         'Give the number of bits one measurement of the register returns, and say what that implies for an algorithm.'],
  sol:'<b>Given.</b> A register of $n$ qubits and $16$ bytes an amplitude.<br>'
     +'<b>Method.</b> Dimensions multiply, so the count is $2^{n}$; multiply by the bytes; the readout is separate.<br>'
     +'<b>Solution — (a).</b> $2,\\;4,\\;8,\\;16$.<br>'
     +'<b>Solution — (b).</b> $2^{20}=1\\,048\\,576$ amplitudes, and $16\\times2^{20}=16\\,777\\,216$ bytes, which is $16$ MiB.<br>'
     +'<b>Solution — (c).</b> Twenty bits: one string, not a million amplitudes. An algorithm therefore earns nothing by holding many amplitudes unless it can make the unwanted ones cancel before the readout.<br>'
     +'<b>Check.</b> Each extra qubit doubles the storage and adds one bit to the readout. Twenty qubits is $16$ MiB and thirty is $16$ GiB, which is the crossing the course opening drew; the two arrive at the same number by different routes.',
  err:'Answering part (c) with $2^{20}$, on the grounds that the state "contains" that many numbers. It does, and a measurement returns exactly one string of twenty bits.',
  teach:'The gap between (b) and (c) is the first of the three sentences the course is built on. Ask for it in words before the arithmetic is marked.' },

/* ---- full-length ------------------------------------------------------- */

{ id:'D1-19', module:'M1', type:'full', src:'L3 · global phase, relative phase and interference',
  stem:'A qubit is prepared in $$|\\psi\\rangle=\\cos\\tfrac{\\theta}{2}\\,|0\\rangle+e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\,|1\\rangle, \\qquad \\theta=\\tfrac{\\pi}{3}, \\quad \\varphi=\\tfrac{\\pi}{2}.$$',
  parts:['Give the state as an explicit column.',
         'Give $P(0)$ and $P(1)$.',
         'Give $P(+)$ and $P(-)$, where $|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$.',
         'The state is now multiplied by $e^{i\\pi/4}$. State which of the four probabilities change.'],
  sol:'<b>Given.</b> A pure qubit state in the standard angle parameterisation.<br>'
     +'<b>Find.</b> Its column, its probabilities in two bases, and the effect of a global phase.<br>'
     +'<b>Method.</b> Evaluate the two coefficients; take squared moduli in the computational basis; take overlaps with $|\\pm\\rangle$ for the other.<br>'
     +'<b>Solution — (a).</b> $\\cos(\\pi/6)=\\tfrac{\\sqrt3}{2}$, $\\sin(\\pi/6)=\\tfrac12$ and $e^{i\\pi/2}=i$, so $|\\psi\\rangle=\\left(\\tfrac{\\sqrt3}{2},\\;\\tfrac{i}{2}\\right)$.<br>'
     +'<b>Solution — (b).</b> $P(0)=\\tfrac34$ and $P(1)=\\tfrac14$.<br>'
     +'<b>Solution — (c).</b> $\\langle+|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(\\tfrac{\\sqrt3}{2}+\\tfrac{i}{2}\\right)$, so $$P(+)=\\tfrac12\\left(\\tfrac34+\\tfrac14\\right)=\\tfrac12,$$ and likewise $P(-)=\\tfrac12$.<br>'
     +'<b>Solution — (d).</b> None of them. $\\left|e^{i\\pi/4}\\right|=1$, so every squared modulus is unchanged.<br>'
     +'<b>Check.</b> The closed form for the $X$ basis is $P(\\pm)=\\tfrac12\\left[1\\pm\\sin\\theta\\cos\\varphi\\right]$. Here $\\cos\\varphi=\\cos(\\pi/2)=0$, so both are $\\tfrac12$ whatever $\\theta$ is — which is what part (c) found by direct computation. The two probabilities in each basis add to one.',
  err:'Reporting $P(+)=\\tfrac34$ in part (c), by squaring $\\tfrac{\\sqrt3}{2}$ and forgetting that the overlap mixes both amplitudes. The $X$-basis probability is not the $Z$-basis one relabelled.',
  teach:'Part (c) is the interesting one: the relative phase is $\\pi/2$, which puts the state on the equator of the $Y$ axis, and the $X$ measurement is then maximally uncertain. Laboratory A shows the same thing with the slider at $90^{\\circ}$.' },

{ id:'D1-20', module:'M1', type:'full', src:'L3 · Hermitian generators produce unitary transformations',
  stem:'An operator is $$G=\\begin{bmatrix}1&1\\\\ 1&-1\\end{bmatrix}.$$',
  parts:['Decide whether $G$ is Hermitian.',
         'Compute $G^{2}$, and use it to give the eigenvalues of $G$ without solving the characteristic equation.',
         'Give $e^{-iGt}$ in closed form.',
         'Evaluate it at $t=\\pi/(2\\sqrt2)$ and confirm that the result is unitary.'],
  sol:'<b>Given.</b> A real symmetric matrix, which is $\\sqrt2$ times the Hadamard.<br>'
     +'<b>Find.</b> Its eigenvalues by a shortcut, and the unitary family it generates.<br>'
     +'<b>Method.</b> Hermiticity by inspection; then $G^{2}$, which pins the eigenvalues; then the Pauli-style closed form on the normalised generator.<br>'
     +'<b>Solution — (a).</b> $G$ is real and symmetric, so $G^{\\dagger}=G^{T}=G$: Hermitian.<br>'
     +'<b>Solution — (b).</b> $G^{2}=\\begin{bmatrix}1+1&1-1\\\\ 1-1&1+1\\end{bmatrix}=2I$. If $G|v\\rangle=\\lambda|v\\rangle$ then $G^{2}|v\\rangle=\\lambda^{2}|v\\rangle=2|v\\rangle$, so $\\lambda^{2}=2$ and $\\lambda=\\pm\\sqrt2$.<br>'
     +'<b>Solution — (c).</b> Put $\\hat G=G/\\sqrt2$, so that $\\hat G^{2}=I$. Then $-iGt=-i(\\sqrt2\\,t)\\hat G$ and the closed form of the generator scene applies with the angle $2\\sqrt2\\,t$: $$e^{-iGt}=\\cos\\!\\left(\\sqrt2\\,t\\right)I-i\\sin\\!\\left(\\sqrt2\\,t\\right)\\hat G=\\cos\\!\\left(\\sqrt2\\,t\\right)I-\\tfrac{i}{\\sqrt2}\\sin\\!\\left(\\sqrt2\\,t\\right)G.$$'
     +'<b>Solution — (d).</b> At $t=\\pi/(2\\sqrt2)$ the argument $\\sqrt2\\,t$ is $\\pi/2$, so $e^{-iGt}=-i\\hat G$. Then $\\left(-i\\hat G\\right)^{\\dagger}\\left(-i\\hat G\\right)=\\left(i\\hat G\\right)\\left(-i\\hat G\\right)=\\hat G^{2}=I$: unitary.<br>'
     +'<b>Check.</b> Two ways. The trace of $G$ is zero and $\\sqrt2+(-\\sqrt2)=0$, and $\\det G=-1-1=-2=(\\sqrt2)(-\\sqrt2)$; both eigenvalues agree with the matrix. And the answer to (d) is $-i$ times the Hadamard, whose square is the identity, so the operator is its own inverse up to a phase — which the closed form confirms at twice that time, where $\\cos\\pi=-1$ gives $-I$.',
  err:'Writing $e^{-iGt}=\\cos(t)I-i\\sin(t)G$, by using the closed form on $G$ itself. That form needs a generator squaring to the identity, and $G^{2}=2I$; the factor $\\sqrt2$ has to be taken out first.',
  teach:'The whole chapter is in this question: Hermiticity, a shortcut to a spectrum, a function of an operator, and unitarity. It also foreshadows Chapter 4, where $\\hat G$ is a rotation axis and $2\\sqrt2\\,t$ is the angle turned through.' }

]);

/* ======================================================================
   The scene that carries them.
   ====================================================================== */
window.DRILL_M1 = [

{ id:'m1-drill', module:'M1', nav:'Module 1 · practice questions',
  title:'Module 1 — practice questions',
  objective:'Twenty open-ended questions with worked solutions, in the shapes the chapter sets.',
  keywords:'practice questions module 1 inner product basis phase operator hermitian unitary spectral tensor',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Practice D1-01 … D1-20'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step that reaches the answer a second way. In this chapter the cheap checks are: $\\langle a|a\\rangle$ is real and never negative, the squared coefficients in any orthonormal basis add to one, the eigenvalues of a Hermitian matrix are real and add to the trace, the projectors of a spectral decomposition add to the identity, and a unitary sends a normalised state to a normalised state.'},
  {t:'rule', short:true},
  {t:'drill', module:'M1'}
]}

];
})();
