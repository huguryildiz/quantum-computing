/* ==========================================================================
   COURSE CONTENT — the shared constants every other content file reads.

   This file holds what is true of the course as a whole: its identity, the
   module list the contents rail filters on, the notation glossary, the four
   conventions fixed for the whole artifact, and the mark that tells this
   course's chapter numbers apart from the textbook's.

   Addresses and textbook anchors are not here. They are declared once in
   `89_sections.js` and derived onto the scenes at load time.
   ========================================================================== */
const CONTENT = {

  META: {
    course:'Quantum Computing',
    title:'Quantum Computing',
    version:'0.1',
    language:'Academic English',
    /* Four conventions, stated once on the page in the scene where each is
       first needed, and repeated here so the conventions panel can show them
       without the reader having to find that scene again.

       The first is where the silent errors in this material come from. Two
       courses can write the same two-qubit state and mean different things by
       it, because one counts qubits left to right and the other right to left.
       An expression written under one ordering and read under the other is not
       wrong by a factor — it names a different state, and every number
       downstream of it is quietly wrong.

       The second is the one students meet first and misuse longest. A state
       and the same state times a phase are the same state; two amplitudes
       inside one state and a phase between them are not the same state. The
       whole of interference lives in that distinction. */
    conventions:{
      order:'|q_{n-1}\\,\\ldots\\,q_1 q_0\\rangle,\\qquad \\text{amplitude of }|x\\rangle\\text{ is entry }x\\text{ of the state vector}',
      phase:'e^{i\\gamma}|\\psi\\rangle \\equiv |\\psi\\rangle, \\qquad \\alpha|0\\rangle+e^{i\\varphi}\\beta|1\\rangle \\;\\not\\equiv\\; \\alpha|0\\rangle+\\beta|1\\rangle',
      inner:'The inner product conjugates its first argument, $\\langle u|v\\rangle=\\sum_k u_k^{*}v_k$. In NumPy that is `np.vdot(u, v)` and never `np.dot`. Matrix products act on a ket from right to left, so the gate written last in a product is applied first.',
      hbar:'Reduced Planck constant $\\hbar=1$ throughout, so a Hamiltonian is measured in angular frequency and evolution is $U(t)=e^{-iHt}$. Where a physical energy is meant, the units are written out. Logarithms of probabilities are base two, so an entropy is in bits.'
    }
  },

  MODULES: [
    { id:'M0', title:'The Frame of the Course' },
    { id:'M1', title:'The Mathematics of Quantum States' },
    { id:'M2', title:'States, Measurement and Dynamics' },
    { id:'M3', title:'Mixed States and Entanglement' },
    { id:'M4', title:'The Bloch Sphere and Quantum Gates' },
    { id:'M5', title:'Circuits and Protocols' },
    { id:'M6', title:'Quantum Algorithms' }
  ],

  /* ---- the textbook mark ----
     The short form that prefixes every rendered anchor, and the full statement
     of what it points into. The full form is printed once, in the scene that
     introduces the convention, and nowhere else.

     The mark is not decorative. This course's chapter numbers and the
     textbook's do not agree anywhere: this course reaches the Bloch sphere in
     its chapter 4 and the textbook develops it in its chapter 1, and this
     course's chapter 6 is the algorithms the textbook spreads across its
     chapters 5 and 6. An anchor is therefore never rendered as a bare number. */
  BOOKMARK:'NC',
  BOOKREF:'Nielsen and Chuang, <i>Quantum Computation and Quantum Information</i>, 10th anniversary edition',

  /* On screen the mark is an open book rather than the letters. It is drawn
     here, once, as inline SVG in `currentColor`: the artifact is one offline
     file, so an icon cannot be fetched, and a glyph from a font cannot be
     relied on to exist. In the printed notes the letters stay, because a rule
     in a contents column at eight point is read, not looked at. */
  BOOKICON:
    '<svg class="ebicon" viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" focusable="false">'
  + '<path d="M8 4.4C7.2 3.5 6 3 4.6 3H2v9.1h2.6c1.4 0 2.6.5 3.4 1.4" '
  + 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>'
  + '<path d="M8 4.4C8.8 3.5 10 3 11.4 3H14v9.1h-2.6c-1.4 0-2.6.5-3.4 1.4" '
  + 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>'
  + '<path d="M8 4.4v9.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
  + '</svg>',

  /* ---- notation glossary; every symbol defined once, linked from prose ----
     `go` names the scene where the symbol is introduced. An entry with no `go`
     is one whose scene is not written yet.

     A symbol is never reused for a second meaning. Where two courses would
     disagree — the order of the qubits, which argument of an inner product is
     conjugated, whether a Hamiltonian carries an hbar — the entry says which
     convention is in force. */
  GLOSS: {
    /* Chapter 1 — the mathematics of quantum states */
    ket:{ s:'|\\psi\\rangle', d:'A quantum state, written as a column of complex numbers once a basis has been chosen. Normalised: $\\langle\\psi|\\psi\\rangle=1$.' },
    bra:{ s:'\\langle\\psi|', d:'The dual of $|\\psi\\rangle$: the same column transposed and conjugated, so it is a row that eats a ket and returns a number.' },
    inner:{ s:'\\langle\\phi|\\psi\\rangle', d:'Inner product, conjugating the first argument. It measures overlap: zero when the two states are perfectly distinguishable, unit modulus when they are the same state.' },
    norm:{ s:'\\|\\psi\\|', d:'Length of a state, $\\sqrt{\\langle\\psi|\\psi\\rangle}$. A physical state has length one, which is what makes the Born probabilities sum to one.' },
    outer:{ s:'|\\phi\\rangle\\langle\\psi|', d:'Outer product: a ket beside a bra is an operator, not a number. It is the one construction that turns states into the things that act on states.' },
    proj:{ s:'P_k', d:'A projector, $P_k=|k\\rangle\\langle k|$ for a basis state. Idempotent, $P_k^2=P_k$, and Hermitian.' },
    resid:{ s:'\\sum_k |k\\rangle\\langle k| = I', d:'Resolution of the identity. Inserting it is how a basis expansion is derived rather than guessed.' },
    kron:{ s:'\\otimes', d:'Tensor product. Two systems of dimension $d_1$ and $d_2$ make one system of dimension $d_1 d_2$, not $d_1+d_2$: this is where the exponential comes from.' },
    dag:{ s:'A^{\\dagger}', d:'Adjoint: transpose and conjugate. In NumPy, `A.conj().T`.' },
    herm:{ s:'A=A^{\\dagger}', d:'Hermitian. Its eigenvalues are real, which is why observables are Hermitian: a measurement returns a real number.' },
    unit:{ s:'U^{\\dagger}U=I', d:'Unitary. It preserves inner products and therefore norms, which is why closed-system evolution and every gate is unitary.' },
    eig:{ s:'A|v\\rangle=\\lambda|v\\rangle', d:'Eigenvalue equation. The eigenvectors are the states the operator leaves in place, up to a scale.' },
    spec:{ s:'A=\\sum_k \\lambda_k P_k', d:'Spectral decomposition of a Hermitian operator: the eigenvalues, and the projectors onto the eigenspaces they belong to.' },
    fofa:{ s:'f(A)=\\sum_k f(\\lambda_k)P_k', d:'A function of an operator is that function applied to the eigenvalues. This is what an operator exponential means, and it is why $e^{-iHt}$ can be computed at all.' },

    /* Chapter 2 — states, measurement and dynamics */
    zero:{ s:'|0\\rangle,\\;|1\\rangle', d:'The computational basis of one qubit, the eigenvectors of $Z$. Every measurement in this course is in this basis unless a scene says otherwise.' },
    plus:{ s:'|+\\rangle,\\;|-\\rangle', d:'The $X$ basis, $|\\pm\\rangle=(|0\\rangle\\pm|1\\rangle)/\\sqrt2$. A state definite in $X$ is maximally uncertain in $Z$.' },
    ibasis:{ s:'|{+}i\\rangle,\\;|{-}i\\rangle', d:'The $Y$ basis, $(|0\\rangle\\pm i|1\\rangle)/\\sqrt2$.' },
    born:{ s:'p(k)=|\\langle k|\\psi\\rangle|^2', d:'The Born rule. The amplitude is complex and unobservable; its squared modulus is the probability, and that is the only bridge from the mathematics to a laboratory count.' },
    obs:{ s:'A', d:'An observable: a Hermitian operator whose eigenvalues are the outcomes that can be seen and whose eigenvectors are the states that give them with certainty.' },
    expect:{ s:'\\langle A\\rangle', d:'Expectation value, $\\langle\\psi|A|\\psi\\rangle$. It is an average over repetitions, never the result of one run.' },
    dev:{ s:'\\Delta A', d:'Standard deviation of an observable in a state, $\\sqrt{\\langle A^2\\rangle-\\langle A\\rangle^2}$.' },
    comm:{ s:'[A,B]', d:'Commutator, $AB-BA$. It is zero exactly when the two observables share an eigenbasis and can both be definite at once.' },
    pauli:{ s:'X,\\;Y,\\;Z', d:'The Pauli operators. Each is Hermitian and unitary at once, so each is both an observable and a gate.' },
    ham:{ s:'H', d:'Hamiltonian: the Hermitian operator that generates evolution. With $\\hbar=1$ it is measured in angular frequency.' },
    eve:{ s:'U(t)=e^{-iHt}', d:'The evolution operator of a closed system. Every gate in this course is one of these for some $H$ and some duration.' },
    povm:{ s:'\\{E_k\\}', d:'A POVM: positive operators summing to the identity. It is the most general set of outcome probabilities a measurement can have, and it need not have as many outcomes as the space has dimensions.' },
    shots:{ s:'N_{\\text{shots}}', d:'The number of repetitions a circuit is run for. A probability read from $N$ shots carries a standard error of about $\\sqrt{p(1-p)/N}$, which is sampling noise and not physical noise.' },

    /* Chapter 3 — mixed states and entanglement */
    rho:{ s:'\\rho', d:'Density operator: positive semidefinite, Hermitian, unit trace. It describes a state that is either genuinely mixed or a piece of a larger entangled state.' },
    purity:{ s:'\\operatorname{Tr}\\rho^2', d:'Purity. Equal to one for a pure state and as low as $1/d$ for the maximally mixed state of dimension $d$.' },
    kraus:{ s:'\\mathcal{E}(\\rho)=\\sum_k K_k\\rho K_k^{\\dagger}', d:'A quantum channel in Kraus form, with $\\sum_k K_k^{\\dagger}K_k=I$. This is what a gate becomes once the system is no longer closed.' },
    ptrace:{ s:'\\operatorname{Tr}_B', d:'Partial trace: the operation that answers "what is the state of $A$ alone". Its result is mixed exactly when $A$ and $B$ are entangled.' },
    schmidt:{ s:'\\lambda_i', d:'Schmidt coefficients of a bipartite pure state. One non-zero coefficient means the state is a product; more than one means it is entangled.' },
    vn:{ s:'S(\\rho)', d:'Von Neumann entropy, $-\\operatorname{Tr}\\rho\\log_2\\rho$, in bits. For a pure state it is zero, and for the reduced state of an entangled pair it is how much entanglement the pair carries.' },
    bell:{ s:'|\\Phi^{\\pm}\\rangle,\\;|\\Psi^{\\pm}\\rangle', d:'The four Bell states: an orthonormal basis of two qubits in which every state is maximally entangled.' },
    tone:{ s:'T_1,\\;T_2', d:'Relaxation and dephasing times. $T_1$ is how long a population survives, $T_2$ how long a relative phase does, and $T_2\\le 2T_1$ always.' },

    /* Chapter 4 — the Bloch sphere and quantum gates */
    bloch:{ s:'\\mathbf{r}', d:'Bloch vector, $r_a=\\operatorname{Tr}(\\rho\\,\\sigma_a)$ for $a=x,y,z$. Its length is one for a pure state and less for a mixed one, so the sphere is really a ball.' },
    angles:{ s:'\\theta,\\;\\varphi', d:'Polar and azimuthal angles of a pure qubit state, $\\cos(\\theta/2)|0\\rangle+e^{i\\varphi}\\sin(\\theta/2)|1\\rangle$. The half angle is not a typographic accident: it is the double cover.' },
    rot:{ s:'R_a(\\theta)', d:'Rotation of the Bloch vector by $\\theta$ about axis $a$, $e^{-i\\theta\\sigma_a/2}$. Every single-qubit gate is one of these up to a global phase.' },
    hgate:{ s:'H', d:'The Hadamard gate, which exchanges the $Z$ and $X$ bases. Written the same way as a Hamiltonian, and told apart by where it stands: a gate acts in a circuit, a Hamiltonian sits in an exponential.' },
    sgate:{ s:'S,\\;T', d:'The quarter- and eighth-turn phase gates about $Z$, $S=\\operatorname{diag}(1,i)$ and $T=\\operatorname{diag}(1,e^{i\\pi/4})$.' },
    cnot:{ s:'\\mathrm{CNOT}', d:'The controlled-NOT gate. Together with the single-qubit gates it is universal, and on its own it is what turns a product state into an entangled one.' },

    /* Chapter 5 — circuits and protocols */
    depth:{ s:'d', d:'Circuit depth: the number of layers of gates that must run one after another. It is the quantity a coherence time is spent against, and it is not the gate count.' },
    isa:{ s:'\\text{ISA}', d:'The instruction set a particular machine actually runs. A circuit written in ideal gates is transpiled into it, and the transpiled depth is the one that matters.' },
    fid:{ s:'F', d:'Fidelity between a prepared state and its target, $F=\\langle\\psi|\\rho|\\psi\\rangle$ for a pure target. A protocol is claimed to work only against a fidelity that beats the best classical strategy.' },
    grov:{ s:'k_{\\text{opt}}', d:'The number of Grover iterations that maximises the success probability, about $\\tfrac{\\pi}{4}\\sqrt{N/M}$. Running past it makes the answer less likely, not more.' },

    /* Chapter 6 — quantum algorithms */
    oracle:{ s:'U_f', d:'A reversible embedding of a classical function, $U_f|x\\rangle|y\\rangle=|x\\rangle|y\\oplus f(x)\\rangle$. Counting queries to it is not the same as counting the gates it costs to build.' },
    kick:{ s:'\\text{phase kickback}', d:'The mechanism behind every algorithm in this chapter: an oracle written to change a target register instead writes a phase onto the control register, because the target was prepared in an eigenstate of the operation.' },
    qft:{ s:'\\mathrm{QFT}_N', d:'The quantum Fourier transform on $N=2^n$ amplitudes. It costs $O(n^2)$ gates, and it does not hand back the spectrum: the amplitudes it produces still have to be measured.' },
    qpe:{ s:'\\varphi', d:'The phase estimated by quantum phase estimation, defined by $U|u\\rangle=e^{2\\pi i\\varphi}|u\\rangle$. The number of counting qubits fixes both the precision and the success probability.' },
    order:{ s:'r', d:'The order of $a$ modulo $N$: the smallest $r>0$ with $a^r\\equiv 1 \\pmod N$. Finding it is the only quantum step in factoring; everything around it is classical.' }
  }
};
