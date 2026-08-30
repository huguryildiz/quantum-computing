/* ==========================================================================
   Practice questions — Module 3.

   Six shapes and twenty questions in them. The numbers are chosen so that the
   Check step is cheap: a trace that is one, eigenvalues between zero and one,
   a purity between one half and one, an entropy that is never negative, and a
   correlation of two plus-or-minus-one observables inside its own range. Every
   one of those catches an arithmetic slip in a line, and every solution ends
   by using one.
   ========================================================================== */
(function(){

CONTENT.DRILLTYPES.M3 = [
  { k:'dm', name:'Building a density operator, and testing one',
    asks:'A preparation or a matrix is given. Write the density operator, or decide whether the matrix is a state.',
    method:['For a preparation, write $\\rho=\\sum_i p_i|\\psi_i\\rangle\\langle\\psi_i|$ term by term. Each term is an outer product and is a matrix, not a number.',
            'To test a matrix, take the three conditions in order: Hermitian, trace one, and positive. The third is the one that fails, and for a qubit it is $|\\rho_{01}|^{2}\\le\\rho_{00}\\rho_{11}$.',
            'Purity is $\\operatorname{Tr}\\rho^{2}$, the sum of the squared moduli of all the entries. For a qubit it also equals $\\tfrac12(1+|\\mathbf{r}|^{2})$, and computing it both ways is the check.',
            'A state is pure exactly when the purity is one, equivalently $\\rho^{2}=\\rho$, equivalently the determinant is zero.'],
    go:'m3-rho' },

  { k:'predict', name:'Predictions from a density operator',
    asks:'A density operator is given. Find an outcome probability, an expectation value, or the Bloch vector.',
    method:['Every prediction is one trace: $\\langle A\\rangle=\\operatorname{Tr}(\\rho A)$ and $p(m)=\\operatorname{Tr}(\\rho E_m)$. No case distinction between pure and mixed is needed.',
            'For a qubit, read the three Pauli means off the entries: $r_z=\\rho_{00}-\\rho_{11}$, and $\\rho_{01}=\\tfrac12(r_x-ir_y)$.',
            'For a measurement along a direction, $p(\\pm)=\\tfrac12(1\\pm\\mathbf{n}\\cdot\\mathbf{r})$, exactly as in chapter 2 — the formula never needed the state to be pure.',
            'Check that the probabilities add to one and that $|\\mathbf{r}|\\le1$.'],
    go:'m3-expect' },

  { k:'channel', name:'Channels, damping and dephasing',
    asks:'A channel or a pair of decay times is given. Find the state afterwards, or a time, or a rate.',
    method:['Apply the channel entry by entry rather than multiplying matrices: damping sends $\\rho_{11}\\to(1-\\gamma)\\rho_{11}$ and $\\rho_{01}\\to\\sqrt{1-\\gamma}\\,\\rho_{01}$; the phase flip leaves the diagonal and sends $\\rho_{01}\\to(1-2p)\\rho_{01}$.',
            'Then rebuild the diagonal from the trace: it is one, so one population fixes the other.',
            'In time, populations decay with $T_1$ and coherences with $T_2$, and the two are tied by $1/T_2=1/(2T_1)+1/T_\\phi$.',
            'Check that the result is still a state — trace one, and $|\\rho_{01}|^{2}\\le\\rho_{00}\\rho_{11}$ — and that $T_2\\le 2T_1$.'],
    go:'m3-kraus' },

  { k:'ptrace', name:'Reduced states and the partial trace',
    asks:'A two-qubit state is given. Find the state of one qubit, or compare two joint states that share one.',
    method:['Fix the ordering first: $|q_1q_0\\rangle$, with entry $x$ of the column carrying the amplitude of $|x\\rangle$.',
            'Cut the four-by-four into two-by-two blocks. The traces of the blocks are $\\rho_A$; the sum of the two diagonal blocks is $\\rho_B$. Getting these the wrong way round is the usual slip.',
            'For a pure joint state the quicker route is the coefficient matrix: $\\rho_A=CC^{\\dagger}$ and $\\rho_B=(C^{\\dagger}C)^{\\mathsf{T}}$.',
            'Check that each reduced state has trace one, and that both have the same non-zero eigenvalues.'],
    go:'m3-ptrace' },

  { k:'entangle', name:'Separability, Schmidt rank and entropy',
    asks:'A bipartite pure state is given. Decide whether it factors, and if not, say by how much it is entangled.',
    method:['For two qubits the test is one determinant: the state is a product exactly when $c_0c_3-c_1c_2=0$.',
            'For the amount, reshape the amplitudes into $C$ and take its singular values. Their squares are the Schmidt coefficients, and the count of non-zero ones is the rank.',
            'The entropy is $S=-\\sum_k\\lambda_k\\log_2\\lambda_k$, in bits, and it is what "how much entanglement" means for a pure pair.',
            'Check that the $\\lambda_k$ add to one, that $S=0$ exactly when the state factors, and that $S$ never exceeds one bit for two qubits.'],
    go:'m3-schmidt' },

  { k:'bell', name:'Bell correlations and the CHSH number',
    asks:'A Bell state and some measurement directions are given. Find the correlations, or the CHSH value, or what one party alone sees.',
    method:['Apply the joint operator to the state and look for an eigenvector: for a Bell state each of $X\\otimes X$, $Y\\otimes Y$ and $Z\\otimes Z$ gives $\\pm1$ with certainty.',
            'For directions in one plane on $|\\Phi^{+}\\rangle$, the correlation of the two readings is $\\cos$ of the angle between them.',
            'Assemble $S$ with the fourth term subtracted, compare with $2$, and remember the ceiling $2\\sqrt2$.',
            'For anything about one party alone, take the partial trace and stop: it does not depend on what the other party chose to do.'],
    go:'m3-bell' },

  { k:'full', name:'A full-length question: one pair, end to end',
    asks:'A preparation, a channel or an idle period, a set of measurements and a reported number, in three to five parts.',
    method:['Read every part before starting. The number at the end usually depends on every step before it.',
            'Work in the order the experiment runs: state, then channel, then measurement, then statistics. Do not jump to the last part.',
            'Carry exact values between parts and check each against the one before: trace one, purity in range, a correlation inside $[-1,1]$, and an error bar quoted with every estimated number.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---- building and testing a density operator ------------------------- */

{ id:'D3-01', module:'M3', type:'dm', src:'L6 · density operators: pure states, mixtures, and reduced states',
  stem:'A source emits $|0\\rangle$ with probability $\\tfrac14$ and $|{+}\\rangle$ with probability $\\tfrac34$, and nothing records which.',
  parts:['Write the density operator as a matrix in the computational basis.',
         'Is the state pure? Say how you can tell without diagonalising.',
         'Give the purity, and check it a second way.'],
  sol:'<b>Given.</b> A classical coin choosing between two pure states, so the operator is a weighted sum of two outer products.<br>'
     +'<b>Method.</b> Write each outer product as a matrix, then add with the weights.<br>'
     +'<b>Solution — (a).</b> $|0\\rangle\\langle 0|=\\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}$ and $|{+}\\rangle\\langle{+}|=\\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$, so $\\rho=\\tfrac14\\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}+\\tfrac38\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}=\\begin{bmatrix}0.625&0.375\\\\0.375&0.375\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> Not pure. Its determinant is $0.625(0.375)-0.375^{2}=0.09375$, and a pure state has rank one and therefore determinant zero.<br>'
     +'<b>Solution — (c).</b> $\\operatorname{Tr}\\rho^{2}=0.625^{2}+0.375^{2}+2(0.375)^{2}=0.8125$.<br>'
     +'<b>Check.</b> The Bloch vector is $r_{z}=0.625-0.375=0.25$ and $r_{x}=2(0.375)=0.75$, so $|\\mathbf{r}|^{2}=0.625$ and $\\tfrac12(1+0.625)=0.8125$. Two routes, one number, and $|\\mathbf{r}|<1$ as a mixed state requires.',
  err:'Writing the superposition $\\tfrac12|0\\rangle+\\tfrac{\\sqrt3}{2}|{+}\\rangle$ instead. That is a pure state with purity one, and it is a different physical object: the source flips a coin, it does not add amplitudes.',
  teach:'Ask for the purity of the superposition the error names. Getting one there and $0.8125$ here, from the same two numbers, is the fastest way to see that a mixture is not a superposition.' },

{ id:'D3-02', module:'M3', type:'dm', src:'L6 · which matrices are physical states?',
  stem:'Three candidate matrices: $M_{1}=\\begin{bmatrix}0.6&0.4\\\\0.4&0.4\\end{bmatrix}$, $M_{2}=\\begin{bmatrix}0.5&0.6i\\\\-0.6i&0.5\\end{bmatrix}$, $M_{3}=\\begin{bmatrix}0.5&0.3\\\\0.3&0.6\\end{bmatrix}$.',
  parts:['Say which of the three are density operators, and which condition each failure breaks.',
         'For the one that is a state, give its eigenvalues.',
         'Give its purity, and check it against the eigenvalues.'],
  sol:'<b>Given.</b> Three Hermitian-looking two-by-two matrices.<br>'
     +'<b>Method.</b> Hermitian, then trace, then positive, in that order. For a qubit the last is $|\\rho_{01}|^{2}\\le\\rho_{00}\\rho_{11}$.<br>'
     +'<b>Solution — (a).</b> $M_{1}$ is a state: Hermitian, trace one, and $0.4^{2}=0.16\\le 0.6(0.4)=0.24$. $M_{2}$ is Hermitian with trace one but $0.6^{2}=0.36>0.5(0.5)=0.25$, so positivity fails. $M_{3}$ has trace $1.1$, so it fails before positivity is reached.<br>'
     +'<b>Solution — (b).</b> For $M_{1}$, $\\det = 0.24-0.16=0.08$, so $\\lambda_{\\pm}=\\tfrac12\\left(1\\pm\\sqrt{1-4(0.08)}\\right)=\\tfrac12\\left(1\\pm\\sqrt{0.68}\\right)$, that is $0.9123$ and $0.0877$.<br>'
     +'<b>Solution — (c).</b> $\\operatorname{Tr}M_{1}^{2}=0.36+0.16+2(0.16)=0.84$.<br>'
     +'<b>Check.</b> $0.9123^{2}+0.0877^{2}=0.84$. Both eigenvalues are in $[0,1]$ and they add to one, which is what positivity and unit trace together say.',
  err:'Passing $M_{2}$ because it is Hermitian and has trace one. Those two are easy to arrange and mean nothing on their own; positivity is the condition that actually restricts, and it is the one skipped.',
  teach:'$M_{2}$ is worth putting on the board as a warning: it looks more like a state than $M_{1}$ does, because its diagonal is symmetric. The eye is no help here and the inequality is.' },

{ id:'D3-03', module:'M3', type:'dm', src:'L6 · density operators: pure states, mixtures, and reduced states',
  stem:'Device A emits $|{+}\\rangle$ or $|{-}\\rangle$, each with probability $\\tfrac12$. Device B emits $|0\\rangle$ or $|1\\rangle$, each with probability $\\tfrac12$.',
  parts:['Write both density operators.',
         'Is there any measurement, or any number of copies, that tells the two devices apart?',
         'Device A is now retuned to emit $|{+}\\rangle$ with probability $\\tfrac34$. Give the new matrix, and name a measurement that now separates it from device B.'],
  sol:'<b>Given.</b> Two preparations that differ in every respect except their statistics.<br>'
     +'<b>Method.</b> Build each matrix, compare, and then use the Bloch vector to find a measurement.<br>'
     +'<b>Solution — (a).</b> $\\tfrac12\\left(|{+}\\rangle\\langle{+}|+|{-}\\rangle\\langle{-}|\\right)=\\tfrac12 I$ and $\\tfrac12\\left(|0\\rangle\\langle 0|+|1\\rangle\\langle 1|\\right)=\\tfrac12 I$. The two matrices are equal.<br>'
     +'<b>Solution — (b).</b> No. Every prediction is $\\operatorname{Tr}(\\rho E)$ and the two $\\rho$ are the same operator, so every probability of every outcome of every measurement agrees, on any number of copies.<br>'
     +'<b>Solution — (c).</b> $\\tfrac34|{+}\\rangle\\langle{+}|+\\tfrac14|{-}\\rangle\\langle{-}|=\\begin{bmatrix}0.5&0.25\\\\0.25&0.5\\end{bmatrix}$, with $\\mathbf{r}=(0.5,0,0)$. An $X$ measurement gives $p(+)=\\tfrac12(1+0.5)=0.75$, against $\\tfrac12$ for device B.<br>'
     +'<b>Check.</b> A $Z$ measurement still gives $\\tfrac12$ and $\\tfrac12$ for both, so a reader who only ever measures $Z$ would still call them identical. The purity is $\\tfrac12(1+0.25)=0.625$, above the $0.5$ of $I/2$ and below one.',
  err:'Answering part (b) with "yes, measure in the $X$ basis". Device A emits $X$ eigenstates, but which one is a fair coin, so the $X$ reading is a coin as well — exactly as it is for device B.',
  teach:'Part (b) is the one to insist on. A student who answers it correctly has understood that $\\rho$ is the complete answer to every question that can be asked, and the rest of the chapter is easier afterwards.' },

/* ---- predictions from a density operator ----------------------------- */

{ id:'D3-04', module:'M3', type:'predict', src:'L6 · expectation values and measurement probabilities',
  stem:'A qubit is in the state $\\rho=\\begin{bmatrix}0.7&0.2i\\\\-0.2i&0.3\\end{bmatrix}$.',
  parts:['Give the three Pauli expectation values.',
         'Give the outcome probabilities of a $Z$ measurement.',
         'Give the purity, and say whether the state is pure.'],
  sol:'<b>Given.</b> A density matrix with an imaginary coherence.<br>'
     +'<b>Method.</b> Read the Bloch vector off the entries using $\\rho=\\tfrac12(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma)$, which gives $r_{z}=\\rho_{00}-\\rho_{11}$ and $\\rho_{01}=\\tfrac12(r_{x}-ir_{y})$.<br>'
     +'<b>Solution — (a).</b> $r_{z}=0.7-0.3=0.4$. From $\\tfrac12(r_{x}-ir_{y})=0.2i$ we get $r_{x}=0$ and $r_{y}=-0.4$. So $\\langle Z\\rangle=0.4$, $\\langle X\\rangle=0$, $\\langle Y\\rangle=-0.4$.<br>'
     +'<b>Solution — (b).</b> $p(0)=\\rho_{00}=0.7$ and $p(1)=0.3$.<br>'
     +'<b>Solution — (c).</b> $\\operatorname{Tr}\\rho^{2}=0.49+0.09+2(0.04)=0.66$, so the state is mixed.<br>'
     +'<b>Check.</b> $|\\mathbf{r}|^{2}=0+0.16+0.16=0.32$ and $\\tfrac12(1+0.32)=0.66$, the same purity by the other route. The probabilities add to one and $|\\mathbf{r}|=0.566<1$, as a mixed state requires.',
  err:'Reading $r_{y}=+0.4$ because the entry above the diagonal is $+0.2i$. The relation is $\\rho_{01}=\\tfrac12(r_{x}-ir_{y})$, with a minus sign, and the sign of $\\langle Y\\rangle$ is exactly what it decides.',
  teach:'This is the question that catches a student who has memorised the matrix form without ever writing $\\tfrac12(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma)$ out. Ask them to reconstruct $\\rho$ from their own $\\mathbf{r}$ as a check.' },

{ id:'D3-05', module:'M3', type:'predict', src:'L6 · expectation values and measurement probabilities',
  stem:'A qubit is in the mixture $\\rho=\\tfrac34|0\\rangle\\langle 0| + \\tfrac14|1\\rangle\\langle 1|$, and is measured along the direction $\\mathbf{n}=(\\sin\\alpha,\\,0,\\,\\cos\\alpha)$.',
  parts:['Give the Bloch vector of the state.',
         'Give $p(+1)$ as a function of $\\alpha$, and evaluate it at $\\alpha=60^{\\circ}$.',
         'At which $\\alpha$ is the measurement a fair coin, and why does the answer not depend on how mixed the state is?'],
  sol:'<b>Given.</b> A diagonal mixed state and a tilted instrument.<br>'
     +'<b>Method.</b> $p(\\pm)=\\tfrac12(1\\pm\\mathbf{n}\\cdot\\mathbf{r})$, which was derived in chapter 2 and never needed the state to be pure.<br>'
     +'<b>Solution — (a).</b> $r_{z}=0.75-0.25=0.5$ and the off-diagonal entries are zero, so $\\mathbf{r}=(0,0,0.5)$.<br>'
     +'<b>Solution — (b).</b> $\\mathbf{n}\\cdot\\mathbf{r}=0.5\\cos\\alpha$, so $p(+1)=\\tfrac12\\left(1+0.5\\cos\\alpha\\right)$. At $\\alpha=60^{\\circ}$ this is $\\tfrac12(1+0.25)=0.625$.<br>'
     +'<b>Solution — (c).</b> At $\\alpha=90^{\\circ}$, where $\\cos\\alpha=0$. The instrument is then aimed at right angles to $\\mathbf{r}$, and any vector along $z$ — of any length — has no component there.<br>'
     +'<b>Check.</b> At $\\alpha=0$ the answer is $0.75$, which is $p(0)$ for a $Z$ measurement, as it must be. The probabilities add to one at every $\\alpha$.',
  err:'Using $p(+1)=\\cos^{2}(\\alpha/2)$, which is the pure-state answer of chapter 2. That formula assumed $|\\mathbf{r}|=1$; here $|\\mathbf{r}|=0.5$ and the range of $p$ is only $0.25$ to $0.75$.',
  teach:'Plot $p(+1)$ against $\\alpha$ for $|\\mathbf{r}|=1$ and for $|\\mathbf{r}|=0.5$ side by side. The mixed curve is the pure one squeezed towards one half, and that squeezing is the whole visible effect of mixedness.' },

{ id:'D3-06', module:'M3', type:'predict', src:'L6 · expectation values and measurement probabilities',
  stem:'The observable $A=X+Z$ is measured on the state $\\rho=\\begin{bmatrix}0.625&0.375\\\\0.375&0.375\\end{bmatrix}$.',
  parts:['Give $\\langle A\\rangle$.',
         'Give the variance of $A$ in this state.',
         'The mean comes out as $1$. Is $1$ a reading the instrument can return?'],
  sol:'<b>Given.</b> A sum of two Pauli operators, and the mixed state of the first question.<br>'
     +'<b>Method.</b> The trace is linear, so $\\operatorname{Tr}(\\rho A)=\\langle X\\rangle+\\langle Z\\rangle$ and no matrix has to be multiplied.<br>'
     +'<b>Solution — (a).</b> $\\langle X\\rangle=2(0.375)=0.75$ and $\\langle Z\\rangle=0.625-0.375=0.25$, so $\\langle A\\rangle=1$.<br>'
     +'<b>Solution — (b).</b> $A^{2}=(X+Z)^{2}=X^{2}+Z^{2}+XZ+ZX=2I$, because $X$ and $Z$ anticommute. So $\\langle A^{2}\\rangle=2$ and $\\operatorname{Var}(A)=2-1^{2}=1$.<br>'
     +'<b>Solution — (c).</b> No. $A^{2}=2I$ means the eigenvalues of $A$ are $\\pm\\sqrt2$, so every single reading is $+1.414$ or $-1.414$. The mean is where those two balance.<br>'
     +'<b>Check.</b> The mean lies inside $[-\\sqrt2,\\sqrt2]$, as it must. And $\\operatorname{Var}(A)=1$ is positive, which a variance always is.',
  err:'Computing $\\langle A^{2}\\rangle$ as $\\langle A\\rangle^{2}=1$ and reporting a variance of zero. The operator is squared before the sandwich, and here that squaring uses the anticommutation of $X$ and $Z$ rather than any property of the state.',
  teach:'The anticommutation doing the work in part (b) is the Pauli algebra of chapter 2, used for something new. It is worth naming out loud: the cross terms cancel, and they cancel for every state.' },

/* ---- channels, damping and dephasing --------------------------------- */

{ id:'D3-07', module:'M3', type:'channel', src:'L6 · quantum channels and Kraus operators',
  stem:'A qubit prepared in $|{+}\\rangle$ passes through an amplitude-damping channel of strength $\\gamma$.',
  parts:['Give the density matrix after the channel for $\\gamma=0.36$.',
         'Give its purity.',
         'As $\\gamma$ runs from $0$ to $1$, what is the smallest purity the output ever has, and at which $\\gamma$?'],
  sol:'<b>Given.</b> $\\rho=\\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$, and the rules $\\rho_{11}\\to(1-\\gamma)\\rho_{11}$, $\\rho_{01}\\to\\sqrt{1-\\gamma}\\,\\rho_{01}$.<br>'
     +'<b>Method.</b> Apply the two rules, then rebuild the other population from the trace.<br>'
     +'<b>Solution — (a).</b> $\\rho_{11}\\to 0.64(0.5)=0.32$, so $\\rho_{00}=0.68$, and $\\rho_{01}\\to\\sqrt{0.64}(0.5)=0.4$. The state is $\\begin{bmatrix}0.68&0.4\\\\0.4&0.32\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> $0.68^{2}+0.32^{2}+2(0.4)^{2}=0.4624+0.1024+0.32=0.8848$.<br>'
     +'<b>Solution — (c).</b> In general $r_{z}=\\gamma$ and $r_{x}=\\sqrt{1-\\gamma}$, so the purity is $\\tfrac12\\left(1+\\gamma^{2}+1-\\gamma\\right)=1-\\tfrac{\\gamma}{2}+\\tfrac{\\gamma^{2}}{2}$. That is smallest at $\\gamma=\\tfrac12$, where it is $0.875$.<br>'
     +'<b>Check.</b> At $\\gamma=0.36$ the formula gives $1-0.18+0.0648=0.8848$, matching (b). At $\\gamma=1$ it gives one, correctly: the output is $|0\\rangle$, a pure state again.',
  err:'Multiplying the coherence by $1-\\gamma$ instead of $\\sqrt{1-\\gamma}$. It is the amplitude that is damped once and the population twice, so the coherence always survives better than the population does.',
  teach:'Part (c) is the surprise worth setting: a channel that destroys the qubit completely at full strength does its worst damage half way, and ends on a pure state. Ask why before showing the algebra.' },

{ id:'D3-08', module:'M3', type:'channel', src:'L6 · quantum channels and Kraus operators',
  stem:'A qubit prepared in $|{+}\\rangle$ passes through the phase-flip channel $\\mathcal{E}_{Z}(\\rho)=(1-p)\\rho+pZ\\rho Z$.',
  parts:['Give the density matrix and the purity for $p=0.25$.',
         'At which $p$ is the output the maximally mixed state?',
         'Give the output at $p=1$, and explain why a channel at full strength has destroyed nothing.'],
  sol:'<b>Given.</b> $\\rho=\\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$, and the rule $\\rho_{01}\\to(1-2p)\\rho_{01}$ with the diagonal untouched.<br>'
     +'<b>Method.</b> One multiplication on one entry.<br>'
     +'<b>Solution — (a).</b> $\\rho_{01}\\to 0.5(0.5)=0.25$, so the state is $\\begin{bmatrix}0.5&0.25\\\\0.25&0.5\\end{bmatrix}$, of purity $0.25+0.25+2(0.0625)=0.625$.<br>'
     +'<b>Solution — (b).</b> At $p=\\tfrac12$, where $1-2p=0$ and the coherence vanishes. The diagonal is already $\\tfrac12,\\tfrac12$, so the output is $I/2$.<br>'
     +'<b>Solution — (c).</b> At $p=1$ the channel is $\\rho\\mapsto Z\\rho Z$, which is the gate $Z$: the output is $|{-}\\rangle$, a pure state. Nothing was lost, because at $p=1$ the environment learns nothing — the same thing happens every run.<br>'
     +'<b>Check.</b> The purity is $\\tfrac12\\left(1+(1-2p)^{2}\\right)$, which is one at $p=0$ and $p=1$ and $\\tfrac12$ in the middle. At $p=0.25$ that gives $\\tfrac12(1+0.25)=0.625$, matching (a).',
  err:'Reading the strength as "how much damage", so that $p=1$ is the worst case. Damage is largest where the channel is least predictable, which is $p=\\tfrac12$; at either end the qubit undergoes the same unitary every time.',
  teach:'Set this beside D3-07. Both channels are worst in the middle, and for the same reason, and neither is worst at full strength. That pattern is worth naming once so it is recognised later.' },

{ id:'D3-09', module:'M3', type:'channel', src:'L6 · Markovian relaxation and dephasing',
  stem:'A device has a relaxation time $T_{1}=80\\;\\mu\\text{s}$ and a pure-dephasing time $T_{\\phi}=40\\;\\mu\\text{s}$.',
  parts:['Give $T_{2}$.',
         'A qubit is prepared with an excited population and a coherence, and idles for $20\\;\\mu\\text{s}$. Give the surviving fraction of each.',
         'What is the largest $T_{2}$ this $T_{1}$ allows, and what would have to be true of the device to reach it?'],
  sol:'<b>Given.</b> Two rates, and the relation $1/T_{2}=1/(2T_{1})+1/T_{\\phi}$.<br>'
     +'<b>Method.</b> Add the rates, invert, then evaluate the two exponentials.<br>'
     +'<b>Solution — (a).</b> $1/T_{2}=1/160+1/40=5/160$, so $T_{2}=32\\;\\mu\\text{s}$.<br>'
     +'<b>Solution — (b).</b> The population keeps $e^{-20/80}=e^{-0.25}=0.779$ of its initial value; the coherence keeps $e^{-20/32}=e^{-0.625}=0.535$.<br>'
     +'<b>Solution — (c).</b> $T_{2}\\le 2T_{1}=160\\;\\mu\\text{s}$, reached only when $T_{\\phi}$ is infinite — that is, when there is no dephasing other than what relaxation itself causes.<br>'
     +'<b>Check.</b> $32\\le160$, so the inequality holds. And the coherence has decayed further than the population, which it must whenever there is any pure dephasing at all.',
  err:'Writing $1/T_{2}=1/T_{1}+1/T_{\\phi}$ and getting $T_{2}=26.7\\;\\mu\\text{s}$. The factor of two is not decoration: relaxation costs the coherence only half the rate it costs the population, which is the same $\\sqrt{1-\\gamma}$ as in D3-07.',
  teach:'Connect the factor of two back to the damping channel explicitly. A student who has seen $\\sqrt{1-\\gamma}$ once will not misremember $1/(2T_{1})$ afterwards.' },

/* ---- reduced states and the partial trace ---------------------------- */

{ id:'D3-10', module:'M3', type:'ptrace', src:'L6 · partial trace: the state of a subsystem',
  stem:'Two qubits are in the pure state $|\\psi\\rangle=\\tfrac12\\left(\\sqrt3\\,|00\\rangle+|11\\rangle\\right)$.',
  parts:['Give the reduced state of each qubit.',
         'Give the purity of each.',
         'Is the pair entangled? Give the reason in one sentence.'],
  sol:'<b>Given.</b> A pure two-qubit state with two non-zero amplitudes.<br>'
     +'<b>Method.</b> Reshape the amplitudes into $C$ with rows indexed by $q_{1}$ and columns by $q_{0}$, then $\\rho_{A}=CC^{\\dagger}$.<br>'
     +'<b>Solution — (a).</b> $C=\\begin{bmatrix}\\sqrt3/2&0\\\\0&1/2\\end{bmatrix}$, so $\\rho_{A}=CC^{\\dagger}=\\operatorname{diag}(0.75,\\,0.25)$, and $\\rho_{B}$ is the same.<br>'
     +'<b>Solution — (b).</b> $0.75^{2}+0.25^{2}=0.625$ for each.<br>'
     +'<b>Solution — (c).</b> Yes. The pair is pure with purity one and each half is mixed with purity $0.625$, and only entanglement produces that combination.<br>'
     +'<b>Check.</b> Each reduced state has trace one, and the two have the same eigenvalues, which they must for a pure joint state. The separability determinant is $c_{0}c_{3}-c_{1}c_{2}=\\tfrac{\\sqrt3}{2}\\cdot\\tfrac12-0=\\tfrac{\\sqrt3}{4}\\ne0$, agreeing with (c).',
  err:'Reporting $\\rho_{A}=\\operatorname{diag}(0.75,0.25)$ but $\\rho_{B}=\\operatorname{diag}(0.25,0.75)$, from reading the second index the wrong way along the column. Both reduced states of a pure pair have the same eigenvalues, and here they are the same matrix.',
  teach:'Have the class do it twice, once by the block rule on the four-by-four and once by $CC^{\\dagger}$. The agreement is the point, and the second route is the one they will use afterwards.' },

{ id:'D3-11', module:'M3', type:'ptrace', src:'L6 · partial trace: the state of a subsystem',
  stem:'Two qubits are in the state $|\\psi\\rangle=\\tfrac12\\left(|00\\rangle+|01\\rangle+|10\\rangle-|11\\rangle\\right)$.',
  parts:['Give the reduced state of the first qubit.',
         'Decide whether the state is entangled, using the amplitude test.',
         'Give the Schmidt coefficients and the entanglement entropy in bits.'],
  sol:'<b>Given.</b> Four equal amplitudes with one sign changed.<br>'
     +'<b>Method.</b> Reshape, then $\\rho_{A}=CC^{\\dagger}$; the determinant of $C$ answers (b) at the same time.<br>'
     +'<b>Solution — (a).</b> $C=\\tfrac12\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}$, so $CC^{\\dagger}=\\tfrac14\\begin{bmatrix}2&0\\\\0&2\\end{bmatrix}=\\tfrac12 I$.<br>'
     +'<b>Solution — (b).</b> $c_{0}c_{3}-c_{1}c_{2}=\\tfrac12\\left(-\\tfrac12\\right)-\\tfrac12\\left(\\tfrac12\\right)=-\\tfrac12\\ne0$, so the state is entangled.<br>'
     +'<b>Solution — (c).</b> $\\rho_{A}=I/2$ has eigenvalues $\\tfrac12,\\tfrac12$, so the Schmidt coefficients are $\\lambda=\\tfrac12,\\tfrac12$ and $S=-2\\left(\\tfrac12\\log_{2}\\tfrac12\\right)=1$ bit.<br>'
     +'<b>Check.</b> One bit is the maximum for two qubits, and it goes with a maximally mixed reduced state — which is what (a) gave. The three answers are the same fact three times.',
  err:'Deciding the state is a product because the four amplitudes have equal size. Sign matters: with all four positive the state is $|{+}\\rangle\\otimes|{+}\\rangle$ and the determinant is zero, and one sign change makes it maximally entangled.',
  teach:'Set the all-plus version first, get the product, then flip the last sign. The two states look almost identical on the page and are as far apart as two-qubit states get.' },

{ id:'D3-12', module:'M3', type:'ptrace', src:'L6 · Bell states, correlations, and no signaling',
  stem:'Compare $|\\Phi^{+}\\rangle=\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)$ with the mixed state $\\rho_{\\text{mix}}=\\tfrac12|00\\rangle\\langle 00|+\\tfrac12|11\\rangle\\langle 11|$.',
  parts:['Give the reduced state of the first qubit in each case.',
         'Give the purity of each joint state.',
         'Name one measurement whose statistics differ, and give both answers.'],
  sol:'<b>Given.</b> A pure entangled state and the classical mixture with the same populations.<br>'
     +'<b>Method.</b> Partial trace for (a), $\\operatorname{Tr}\\rho^{2}$ for (b), and a joint correlation for (c).<br>'
     +'<b>Solution — (a).</b> Both give $\\rho_{A}=I/2$. No measurement on one qubit alone separates them.<br>'
     +'<b>Solution — (b).</b> $|\\Phi^{+}\\rangle$ is pure, so its purity is one. The mixture has eigenvalues $\\tfrac12,\\tfrac12$ inside a four-dimensional space, so its purity is $\\tfrac12$.<br>'
     +'<b>Solution — (c).</b> Measure both qubits in the $X$ basis. For $|\\Phi^{+}\\rangle$, $\\langle X\\otimes X\\rangle=1$: the two readings always agree. For the mixture each qubit is separately a fair coin in $X$ and the readings are independent, so $\\langle X\\otimes X\\rangle=0$.<br>'
     +'<b>Check.</b> Both give $\\langle Z\\otimes Z\\rangle=1$, so a reader who only measures in the computational basis sees no difference at all. That is why the $X$ correlation is the one worth reporting.',
  err:'Concluding from part (a) that the two states are the same. Equal reduced states say only that no <em>local</em> measurement separates them; everything that differs is in the correlations, which the partial trace threw away.',
  teach:'This question is the bridge to CHSH. A student who can say why $\\langle X\\otimes X\\rangle$ separates these two is ready for why one correlation is not enough to rule out every classical model.' },

/* ---- separability, Schmidt rank and entropy -------------------------- */

{ id:'D3-13', module:'M3', type:'entangle', src:'L6 · separability and the Schmidt decomposition',
  stem:'Three two-qubit pure states: (i) $\\tfrac12\\left(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle\\right)$, (ii) $\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)$, (iii) $\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|01\\rangle\\right)$.',
  parts:['Apply the amplitude test to each.',
         'Factor the ones that factor.',
         'For each, say what the reduced state of the first qubit is without computing a partial trace.'],
  sol:'<b>Given.</b> Three states, written in the ordering $|q_{1}q_{0}\\rangle$.<br>'
     +'<b>Method.</b> The test is $c_{0}c_{3}-c_{1}c_{2}=0$ for a product.<br>'
     +'<b>Solution — (a).</b> (i) $\\tfrac14-\\tfrac14=0$: a product. (ii) $\\tfrac12-0=\\tfrac12\\ne0$: entangled. (iii) $c=(\\tfrac{1}{\\sqrt2},\\tfrac{1}{\\sqrt2},0,0)$, so $0-0=0$: a product.<br>'
     +'<b>Solution — (b).</b> (i) is $|{+}\\rangle\\otimes|{+}\\rangle$. (iii) is $|0\\rangle\\otimes|{+}\\rangle$.<br>'
     +'<b>Solution — (c).</b> A product state has a pure reduced state, and it is the corresponding factor: $|{+}\\rangle\\langle{+}|$ for (i) and $|0\\rangle\\langle 0|$ for (iii). For (ii) the state is maximally entangled, so $\\rho_{A}=I/2$.<br>'
     +'<b>Check.</b> Each factorisation multiplies back out to the stated four amplitudes. And (iii) has all its weight on $q_{1}=0$, so the first qubit had to come out as $|0\\rangle$.',
  err:'Calling (iii) entangled because two of its amplitudes are zero. Zeros are not evidence either way; the determinant is, and here it vanishes because the two non-zero amplitudes sit in the same row of $C$.',
  teach:'Ask which qubit is the interesting one in (iii). The second is in $|{+}\\rangle$ and the first is definite, and reading that off the bit strings is a skill the later chapters use constantly.' },

{ id:'D3-14', module:'M3', type:'entangle', src:'L6 · computing Schmidt decompositions with an SVD',
  stem:'Two qubits are in the pure state $|\\psi\\rangle=\\tfrac{1}{\\sqrt6}\\left(|00\\rangle+|01\\rangle+2|10\\rangle\\right)$.',
  parts:['Write the coefficient matrix and give $\\rho_{A}$.',
         'Give the two Schmidt coefficients.',
         'Give the entanglement entropy in bits.'],
  sol:'<b>Given.</b> Three non-zero amplitudes, already normalised since $1+1+4=6$.<br>'
     +'<b>Method.</b> Reshape into $C$, form $\\rho_{A}=CC^{\\dagger}$, and take its eigenvalues; those are the Schmidt coefficients.<br>'
     +'<b>Solution — (a).</b> $C=\\tfrac{1}{\\sqrt6}\\begin{bmatrix}1&1\\\\2&0\\end{bmatrix}$, so $\\rho_{A}=CC^{\\dagger}=\\tfrac16\\begin{bmatrix}2&2\\\\2&4\\end{bmatrix}$.<br>'
     +'<b>Solution — (b).</b> The trace is one and the determinant is $\\left(8-4\\right)/36=\\tfrac19$, so $\\lambda_{\\pm}=\\tfrac12\\left(1\\pm\\sqrt{1-\\tfrac49}\\right)=\\tfrac12\\left(1\\pm\\tfrac{\\sqrt5}{3}\\right)$, that is $0.8727$ and $0.1273$.<br>'
     +'<b>Solution — (c).</b> $S=-0.8727\\log_{2}0.8727-0.1273\\log_{2}0.1273=0.1714+0.3786=0.550$ bits.<br>'
     +'<b>Check.</b> The two coefficients add to one. The purity of $\\rho_{A}$ is $1-2\\det=\\tfrac79=0.778$, and $0.8727^{2}+0.1273^{2}=0.778$ as well. The entropy is between zero and one bit, as two qubits require.',
  err:'Reshaping the column the wrong way round, so that $C$ is transposed. The singular values are unchanged, so the entropy still comes out right, and the two Schmidt bases have been swapped without any warning — which is why the ordering has to be stated before the reshape and not after.',
  teach:'Worth doing once numerically as well. Ask for the singular values of $C$ directly and check that their squares are the eigenvalues found here; that is the whole content of the SVD route.' },

{ id:'D3-15', module:'M3', type:'entangle', src:'L6 · separability and the Schmidt decomposition',
  stem:'A family of two-qubit states, $|\\psi(\\theta)\\rangle=\\cos\\theta\\,|00\\rangle+\\sin\\theta\\,|11\\rangle$, with $\\theta$ between $0$ and $90^{\\circ}$.',
  parts:['Give the Schmidt coefficients as functions of $\\theta$.',
         'At which $\\theta$ is the pair maximally entangled, and at which is it a product?',
         'Give the entropy at $\\theta=30^{\\circ}$.'],
  sol:'<b>Given.</b> A one-parameter family, already written in Schmidt form.<br>'
     +'<b>Method.</b> Read the coefficients off, since the two product terms are already orthogonal on both sides.<br>'
     +'<b>Solution — (a).</b> $\\lambda_{1}=\\cos^{2}\\theta$ and $\\lambda_{2}=\\sin^{2}\\theta$.<br>'
     +'<b>Solution — (b).</b> Maximally entangled at $\\theta=45^{\\circ}$, where both are $\\tfrac12$; a product at $\\theta=0$ and $\\theta=90^{\\circ}$, where one of them vanishes and the rank drops to one.<br>'
     +'<b>Solution — (c).</b> At $\\theta=30^{\\circ}$, $\\lambda=\\tfrac34,\\tfrac14$, so $S=-0.75\\log_{2}0.75-0.25\\log_{2}0.25=0.3113+0.5=0.811$ bits.<br>'
     +'<b>Check.</b> The coefficients add to one at every $\\theta$. The entropy is zero at both ends and one bit in the middle, and $0.811$ sits between them, closer to the maximum than $\\theta=30^{\\circ}$ might suggest.',
  err:'Reporting the Schmidt coefficients as $\\cos\\theta$ and $\\sin\\theta$. Those are the coefficients of the state; the $\\lambda_{k}$ are their squares, and they are the ones that add to one and go into the entropy.',
  teach:'Ask for the entropy at $\\theta=10^{\\circ}$ as well. It is about $0.20$ bits, which is far more than the $\\sin^{2}10^{\\circ}=0.03$ a student expects, and it shows how slowly entanglement disappears near a product state.' },

/* ---- Bell correlations and CHSH -------------------------------------- */

{ id:'D3-16', module:'M3', type:'bell', src:'L6 · Bell states, correlations, and no signaling',
  stem:'Two qubits are in the singlet $|\\Psi^{-}\\rangle=\\tfrac{1}{\\sqrt2}\\left(|01\\rangle-|10\\rangle\\right)$.',
  parts:['Give $\\langle X\\otimes X\\rangle$, $\\langle Y\\otimes Y\\rangle$ and $\\langle Z\\otimes Z\\rangle$.',
         'Give the reduced state of each qubit.',
         'What do the three answers in (a) say about measuring both qubits along the <em>same</em> arbitrary direction?'],
  sol:'<b>Given.</b> The one Bell state that is antisymmetric under exchanging the two qubits.<br>'
     +'<b>Method.</b> Apply each joint operator and look for an eigenvector.<br>'
     +'<b>Solution — (a).</b> $X\\otimes X$ swaps $|01\\rangle$ and $|10\\rangle$, giving $-|\\Psi^{-}\\rangle$, so $\\langle X\\otimes X\\rangle=-1$. $Y\\otimes Y$ maps $|01\\rangle\\to|10\\rangle$ and $|10\\rangle\\to|01\\rangle$, giving $-|\\Psi^{-}\\rangle$ again. $Z\\otimes Z$ multiplies both terms by $-1$. All three are $-1$.<br>'
     +'<b>Solution — (b).</b> $\\rho_{A}=\\rho_{B}=I/2$, as for every Bell state.<br>'
     +'<b>Solution — (c).</b> The two readings always disagree, along <em>any</em> direction. Since the correlation is $-1$ along all three axes and the general direction is a combination of them, the singlet anticorrelates perfectly in every basis — which no other two-qubit state does.<br>'
     +'<b>Check.</b> Each correlation has modulus one, so each is a certain statement, and each qubit alone is still a fair coin. Certainty about the pair with complete uncertainty about each part is the signature of maximal entanglement.',
  err:'Getting $\\langle Y\\otimes Y\\rangle=+1$ by forgetting one of the two factors of $i$. Track both: $Y|0\\rangle=i|1\\rangle$ and $Y|1\\rangle=-i|0\\rangle$, so each term picks up $i(-i)=+1$ and the minus sign comes from the state, not from the operator.',
  teach:'The singlet is the state to remember, because its perfect anticorrelation in every direction is what makes the classical explanation feel most obviously available — and it is the one CHSH removes.' },

{ id:'D3-17', module:'M3', type:'bell', src:'L6 · Bell states, correlations, and no signaling',
  stem:'Both parties measure $|\\Phi^{+}\\rangle$ along directions in the $z$–$x$ plane, at angles from $z$ of $A_{0}=0^{\\circ}$, $A_{1}=90^{\\circ}$, $B_{0}=30^{\\circ}$ and $B_{1}=-30^{\\circ}$. For this state the correlation of two such readings is the cosine of the angle between the directions.',
  parts:['Give the four correlations.',
         'Give $S=\\langle A_{0}B_{0}\\rangle+\\langle A_{0}B_{1}\\rangle+\\langle A_{1}B_{0}\\rangle-\\langle A_{1}B_{1}\\rangle$, and say whether it violates the classical bound.',
         'Keeping $A_{0}$ and $A_{1}$ fixed and the two $B$ angles symmetric at $\\pm\\varphi$, find the $\\varphi$ that makes $S$ largest, and the value there.'],
  sol:'<b>Given.</b> Four directions and one rule, $\\langle A B\\rangle=\\cos(a-b)$.<br>'
     +'<b>Method.</b> Four cosines, then one sum with the last term subtracted.<br>'
     +'<b>Solution — (a).</b> $\\cos(-30^{\\circ})=0.866$, $\\cos(30^{\\circ})=0.866$, $\\cos(60^{\\circ})=0.5$ and $\\cos(120^{\\circ})=-0.5$.<br>'
     +'<b>Solution — (b).</b> $S=0.866+0.866+0.5-(-0.5)=2.732$, which is above $2$, so it violates.<br>'
     +'<b>Solution — (c).</b> In general $S=2\\left(\\cos\\varphi+\\sin\\varphi\\right)=2\\sqrt2\\cos\\left(\\varphi-45^{\\circ}\\right)$, largest at $\\varphi=45^{\\circ}$ with $S=2\\sqrt2\\approx2.828$.<br>'
     +'<b>Check.</b> At $\\varphi=30^{\\circ}$ the general formula gives $2(0.866+0.5)=2.732$, matching (b). Every individual correlation stays inside $[-1,1]$, and $S$ never passes $2\\sqrt2$.',
  err:'Adding all four terms. The minus sign on the last one is the whole construction: with four plus signs the classical bound is four as well and nothing is being tested.',
  teach:'Part (c) is worth doing on the board: the violation covers a wide band of angles rather than one exact setting, and that is why the experiment can be performed with imperfect apparatus at all.' },

{ id:'D3-18', module:'M3', type:'bell', src:'L6 · Bell states, correlations, and no signaling',
  stem:'Two parties each hold one qubit of $|\\Phi^{+}\\rangle$. The second party measures their qubit in the $X$ basis.',
  parts:['Rewrite $|\\Phi^{+}\\rangle$ with both qubits in the $X$ basis.',
         'Given that the second party obtained $+1$ and told the first party so, what is the first party\u2019s state?',
         'If the second party says nothing, what is the first party\u2019s state — and does the answer depend on whether the second party measured $X$, measured $Z$, or did nothing at all?'],
  sol:'<b>Given.</b> A Bell pair and one local measurement.<br>'
     +'<b>Method.</b> Change basis on both sides, then read off; for (c) take the partial trace and stop.<br>'
     +'<b>Solution — (a).</b> Substituting $|0\\rangle=(|{+}\\rangle+|{-}\\rangle)/\\sqrt2$ and $|1\\rangle=(|{+}\\rangle-|{-}\\rangle)/\\sqrt2$ into both factors and collecting terms gives $|\\Phi^{+}\\rangle=\\tfrac{1}{\\sqrt2}\\left(|{+}{+}\\rangle+|{-}{-}\\rangle\\right)$: the same form in the new basis.<br>'
     +'<b>Solution — (b).</b> $|{+}\\rangle$, with certainty. The correlation $\\langle X\\otimes X\\rangle=1$ says the two readings always agree.<br>'
     +'<b>Solution — (c).</b> $I/2$ in all three cases. The reduced state is $\\operatorname{Tr}_{B}|\\Phi^{+}\\rangle\\langle\\Phi^{+}|=I/2$ and the second party\u2019s choice never enters it.<br>'
     +'<b>Check.</b> Averaging the two conditional states of (b) with their probabilities gives $\\tfrac12|{+}\\rangle\\langle{+}|+\\tfrac12|{-}\\rangle\\langle{-}|=I/2$, which is (c). The conditioning changes the description and not the statistics.',
  err:'Answering (c) with $|{+}\\rangle$ or $|{-}\\rangle$, "we just do not know which". That is one particular ensemble for $I/2$, and $Z$ would have given a different one with the same matrix. Naming either as what is really there is the step that makes signalling look possible.',
  teach:'Part (a) is the surprise: the Bell state has the same form in the $X$ basis. It is worth doing the substitution in full, because it explains the perfect $X$ correlation without any further calculation.' },

/* ---- full-length questions ------------------------------------------- */

{ id:'D3-19', module:'M3', type:'full', src:'L6 · Bell states, correlations, and no signaling',
  stem:'A Bell pair $|\\Phi^{+}\\rangle$ is made. One of the two qubits then passes through a phase-flip channel of strength $p$ before both are measured along directions in the $z$–$x$ plane. The channel multiplies $\\langle X\\otimes X\\rangle$ and $\\langle Y\\otimes Y\\rangle$ by $\\eta=1-2p$ and leaves $\\langle Z\\otimes Z\\rangle$ alone.',
  parts:['With $A_{0}=0^{\\circ}$, $A_{1}=90^{\\circ}$, $B_{0}=45^{\\circ}$ and $B_{1}=-45^{\\circ}$, write $S$ as a function of $\\eta$.',
         'Evaluate $S$ at $p=0.1$.',
         'Find the largest $p$ for which the pair still violates the classical bound.',
         'The state is a mixture of two Bell states and stays entangled for every $p<\\tfrac12$. What does the gap between that and your answer to (c) say?'],
  sol:'<b>Given.</b> A Bell pair, a channel acting on one side, and four measurement directions.<br>'
     +'<b>Method.</b> Write each correlation as $n_{x}m_{x}\\eta+n_{z}m_{z}$, since the $y$ components are zero for directions in this plane, then assemble $S$.<br>'
     +'<b>Solution — (a).</b> $A_{0}$ has $n=(0,0,1)$, so its two correlations carry no $\\eta$: both are $\\cos45^{\\circ}=1/\\sqrt2$. $A_{1}$ has $n=(1,0,0)$, so its two are $\\eta/\\sqrt2$ and $-\\eta/\\sqrt2$. Hence $S=\\sqrt2\\left(1+\\eta\\right)$.<br>'
     +'<b>Solution — (b).</b> At $p=0.1$, $\\eta=0.8$ and $S=\\sqrt2(1.8)=2.546$.<br>'
     +'<b>Solution — (c).</b> $S>2$ needs $1+\\eta>\\sqrt2$, that is $\\eta>0.4142$ and $p<0.2929$.<br>'
     +'<b>Solution — (d).</b> Between $p=0.293$ and $p=0.5$ the pair is entangled and violates nothing. So a CHSH violation is a sufficient test for entanglement and not a necessary one: passing the test proves entanglement, failing it proves nothing.<br>'
     +'<b>Check.</b> At $p=0$, $\\eta=1$ and $S=2\\sqrt2$, the undamaged value. At $p=\\tfrac12$, $\\eta=0$ and $S=\\sqrt2=1.414$, well inside the bound — and there the state is the classical mixture of D3-12, which is not entangled.',
  err:'Multiplying all four correlations by $\\eta$. Two of the four involve a direction along $z$ on the damaged side, and the channel does nothing to $Z$; noticing which terms it touches is most of this question.',
  teach:'Part (d) is the one worth the time. Students leave with "entangled means it violates CHSH", and this is the cheapest counterexample: one channel, one parameter, and a whole band where the two notions come apart.' },

{ id:'D3-20', module:'M3', type:'full', src:'L6 · Markovian relaxation and dephasing',
  stem:'A qubit is prepared in $|{+}\\rangle$ on a device with $T_{1}=50\\;\\mu\\text{s}$ and $T_{2}=30\\;\\mu\\text{s}$. It is left idle for a time $t$ and then measured in the $X$ basis.',
  parts:['Give $p(+)$ as a function of $t$.',
         'Evaluate it at $t=20\\;\\mu\\text{s}$.',
         'How many shots are needed to estimate that probability to $\\pm0.01$ at two standard errors?',
         'Check that the two quoted times are consistent with each other, and say what would have to be measured to know $T_{\\phi}$.'],
  sol:'<b>Given.</b> A coherence that decays with $T_{2}$, and a measurement that reads the coherence.<br>'
     +'<b>Method.</b> $|{+}\\rangle$ has $\\mathbf{r}=(1,0,0)$; the coherence decays as $e^{-t/T_{2}}$, so $r_{x}(t)=e^{-t/T_{2}}$, and $p(+)=\\tfrac12\\left(1+r_{x}\\right)$.<br>'
     +'<b>Solution — (a).</b> $p(+)=\\tfrac12\\left(1+e^{-t/T_{2}}\\right)$.<br>'
     +'<b>Solution — (b).</b> $e^{-20/30}=e^{-0.6667}=0.5134$, so $p(+)=0.7567$.<br>'
     +'<b>Solution — (c).</b> Two standard errors is $0.01$, so $\\mathrm{SE}=0.005$ and $N=p(1-p)/\\mathrm{SE}^{2}=0.1841/(2.5\\times10^{-5})\\approx 7400$ shots.<br>'
     +'<b>Solution — (d).</b> $T_{2}=30\\le 2T_{1}=100$, so the pair is consistent. From $1/T_{2}=1/(2T_{1})+1/T_{\\phi}$, $1/T_{\\phi}=1/30-1/100$, giving $T_{\\phi}=42.9\\;\\mu\\text{s}$ — so $T_{\\phi}$ is not measured directly, it is what is left after the relaxation contribution is removed from $T_{2}$.<br>'
     +'<b>Check.</b> At $t=0$ the formula gives $p(+)=1$, which is a fresh $|{+}\\rangle$ measured in its own basis. As $t$ grows, $p(+)\\to\\tfrac12$: the state has become $I/2$ in every respect the $X$ reading can see. And $7400$ shots is the ordinary cost of two decimal places, exactly as chapter 2 said.',
  err:'Using $T_{1}$ for the decay of $p(+)$. The $X$ reading is sensitive to the coherence, not to the population, so it is $T_{2}$ that appears — and a student who uses $T_{1}$ reports a device that looks better than it is.',
  teach:'This question is the whole of chapters 2 and 3 in one experiment: a state, a channel, a measurement basis chosen so the effect is visible, and a shot count with an error bar. It is a good one to set as the last item of the sheet.' }

]);

window.DRILL_M3 = [

{ id:'m3-drill', module:'M3', nav:'Module 3 · practice questions',
  title:'Module 3 — practice questions',
  objective:'Twenty open-ended questions with worked solutions, in the shapes the chapter sets.',
  keywords:'practice questions module 3 density operator purity channel partial trace schmidt entropy bell chsh',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Practice D3-01 … D3-20'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step that reaches the answer a second way. In this chapter the cheap checks are: a trace of one, eigenvalues in $[0,1]$, a purity between $1/d$ and one computed both from the entries and from $|\\mathbf{r}|$, Schmidt coefficients that add to one, an entropy that is never negative, and a correlation of two $\\pm1$ observables inside $[-1,1]$.'},
  {t:'rule', short:true},
  {t:'drill', module:'M3'}
]}

];
})();
