/* ==========================================================================
   Practice questions — Module 6.

   Six shapes and twenty questions in them. The numbers are chosen so that the
   Check step is cheap: probabilities add to one, a balanced function averages
   to exactly zero, a phase-estimation distribution puts at least $8/\pi^2$ on
   the two nearest outcomes, and a candidate order is confirmed by one modular
   exponentiation. Every solution ends by using one of those.

   Four questions in the sheet exist for the chapter's own argument rather than
   for any technique. D6-05 hands over a function that is neither constant nor
   balanced and asks what may be concluded, and the answer is nothing, which is
   the sharpest available statement that the promise is part of the result.
   D6-09 shows a transform whose output carries a period and asks what one run
   returns, which is the scene about what the transform does not give back.
   D6-15 counts how often an order-finding run is wasted, and D6-19 asks which
   part of the factoring circuit a resource estimate is really an estimate of.
   ========================================================================== */
(function(){

CONTENT.DRILLTYPES.M6 = [
  { k:'kickback', name:'Kickback and interference',
    asks:'A circuit with an oracle or a controlled gate is given. Find the state it produces, or the reading it returns.',
    method:['Write the target register first. If it is $|{-}\\rangle$, use $U_{f}|x\\rangle|{-}\\rangle=(-1)^{f(x)}|x\\rangle|{-}\\rangle$; if it is an eigenstate $|u\\rangle$, the control picks up $e^{2\\pi i\\varphi}$.',
            'The target never changes, so drop it and work with the first register alone.',
            'Apply the last layer of Hadamards by summing the signed amplitudes: the amplitude of $|k\\rangle$ is $2^{-n}\\sum_{x}(-1)^{f(x)+x\\cdot k}$.',
            'Check that the probabilities add to one, and that a global sign has been discarded rather than kept.'],
    go:'m6-kick' },

  { k:'promise', name:'Promise problems and query counts',
    asks:'A promised function is given. Find the reading, the classical query count, or what may be concluded.',
    method:['Compute $2^{-n}\\sum_{x}(-1)^{f(x)}$. It is $\\pm1$ for a constant function and exactly $0$ for a balanced one.',
            'For the exact classical count use $2^{n-1}+1$: the worst case is seeing half the inputs agree and still not knowing.',
            'For a randomised count, $k$ distinct queries leave an error probability below $2^{-(k-1)}$; solve that for $k$.',
            'Check the promise before concluding anything. Without it, neither reading proves anything at all.'],
    go:'m6-dj' },

  { k:'fourier', name:'The transform: amplitudes and cost',
    asks:'A state or a register size is given. Find what the transform produces, or what its circuit costs.',
    method:['Use $F_{Q}|x\\rangle = Q^{-1/2}\\sum_{k}e^{2\\pi ixk/Q}|k\\rangle$ and act on a general input by linearity, one basis state at a time.',
            'Every output amplitude of a single basis state has modulus $Q^{-1/2}$; only the rate of the phase winding carries the input.',
            'For the circuit: $n$ Hadamards, $n(n-1)/2$ controlled rotations, $\\lfloor n/2\\rfloor$ swaps, so $\\tfrac12 n(n+1)$ gates in all.',
            'Check what one run returns. It is one index drawn from $|\\tilde a_{k}|^{2}$, never the list of coefficients.'],
    go:'m6-qft' },

  { k:'qpe', name:'Phase estimation: precision and cost',
    asks:'A phase and a register size are given. Find the outcome distribution, the register a stated accuracy needs, or the cost.',
    method:['Check first whether $2^{t}\\varphi$ is a whole number. If it is, one outcome has probability one and every other is exactly zero.',
            'Otherwise use $P(y)=2^{-2t}\\left|\\sin(\\pi 2^{t}\\delta)/\\sin(\\pi\\delta)\\right|^{2}$ with $\\delta=\\varphi-y/2^{t}$, at the two outcomes that bracket $2^{t}\\varphi$.',
            'For a register size, $t = n + \\lceil\\log_{2}(2+1/2\\varepsilon)\\rceil$ gives $n$ correct bits with failure probability at most $\\varepsilon$.',
            'For cost, count $2^{t}-1$ applications of $U$ against $\\tfrac12 t(t+1)$ gates in the inverse transform, and say which dominates.'],
    go:'m6-qpeprec' },

  { k:'order', name:'Order finding and its classical steps',
    asks:'A base and a modulus are given. Find the order, the eigenphases, the continued-fraction reading, or the factors.',
    method:['For the order, list the powers until one returns. For a candidate order, confirm it with one modular exponentiation.',
            'The eigenphases are the $r$ fractions $s/r$, each reached with probability $1/r$, and the register started in $|1\\rangle$ is their even mixture.',
            'For a reading, expand $y/Q$ as a continued fraction and take the last convergent whose denominator is below $N$.',
            'For the factors, check $r$ is even and $a^{r/2}\\not\\equiv-1$, then take $\\gcd(a^{r/2}\\pm1,N)$ and multiply the two answers back together.'],
    go:'m6-cf' },

  { k:'claim', name:'Assessing an algorithmic claim',
    asks:'A claim about a quantum algorithm is quoted. Say what it asserts, or find which part of the cost it hides.',
    method:['Name the five components: task, input model, accuracy, hardware model, and the classical baseline. List which of them the claim states.',
            'Separate a query count from a gate count and both from a runtime. Multiply each count by the cost of one of its own operations before comparing.',
            'Ask which classical algorithm the baseline is. An exact one and a randomised one can differ by an exponential on the same task.',
            'Check where the circuit actually spends its gates, and whether the part being praised is the part that costs.'],
    go:'m6-query' },

  { k:'full', name:'A full-length question: one algorithm, end to end',
    asks:'An algorithm, a register size, a measurement and an honest cost, in four to five parts.',
    method:['Read every part before starting. The number at the end usually depends on every step before it.',
            'Work in the order the circuit does: fix the registers, write the state, apply the transform, read one outcome, then do the classical work on it.',
            'Carry exact values between parts and check each against the one before: probabilities between zero and one, a confirmed order, and a cost statement that names what is being counted.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---- kickback and interference --------------------------------------- */

{ id:'D6-01', module:'M6', type:'kickback', src:'L10 · Deutsch\u2019s promise problem',
  stem:'The Deutsch circuit is run with the constant oracle $f(x)=1$. The query qubit starts in $|0\\rangle$ and the target in $|1\\rangle$, both are sent through a Hadamard, the oracle acts, and a Hadamard is applied to the query qubit alone.',
  parts:['Give the state of the two qubits just after the oracle.',
         'Give the state of the query qubit after the last Hadamard.',
         'Give the reading and say what it proves and what it does not.'],
  sol:'<b>Given.</b> A constant oracle, and the standard preparation $|{+}\\rangle|{-}\\rangle$.<br>'
     +'<b>Method.</b> Use $U_{f}|x\\rangle|{-}\\rangle=(-1)^{f(x)}|x\\rangle|{-}\\rangle$ and then remember that a sign common to every term is a global phase.<br>'
     +'<b>Solution — (a).</b> $f(x)=1$ for both $x$, so both terms pick up a minus: the state is $-|{+}\\rangle|{-}\\rangle$.<br>'
     +'<b>Solution — (b).</b> The minus is a global phase, so the query qubit is $|{+}\\rangle$ up to that phase and the Hadamard returns $-|0\\rangle$, which is $|0\\rangle$.<br>'
     +'<b>Solution — (c).</b> Every ideal shot reads $0$, which proves the function is constant. It does not say <b>which</b> constant, and the two constant functions are not distinguished by this circuit at all.<br>'
     +'<b>Check.</b> Run the other constant function, $f(x)=0$. Nothing happens to the state and the reading is again $0$, with no minus sign anywhere — the two runs differ by a global phase and therefore agree on every measurement, which is exactly what "global phase is not physical" says.',
  err:'Keeping the minus sign and concluding that the two constant functions can be told apart. The sign multiplies every term of the whole state, so it is unobservable; only a sign that differs between terms can ever be seen.',
  teach:'Set the two constant oracles side by side and ask for a measurement that separates them. There is none, and finding that out is worth more than the answer to part (c).' },

{ id:'D6-02', module:'M6', type:'kickback', src:'L10 · extending Deutsch\u2019s algorithm to n inputs',
  stem:'The Deutsch\u2013Jozsa circuit is run on $n=3$ query qubits with the oracle $f(x_{2}x_{1}x_{0}) = x_{0}$.',
  parts:['Say whether the oracle satisfies the promise, and why.',
         'Give the amplitude of $|000\\rangle$ at the output, and the state the circuit actually produces.',
         'Give the number of queries an exact classical algorithm needs in the worst case.'],
  sol:'<b>Given.</b> Three query qubits and an oracle that returns the bottom bit.<br>'
     +'<b>Method.</b> Count how many inputs give $1$; then evaluate $a_{k}=2^{-n}\\sum_{x}(-1)^{f(x)+x\\cdot k}$.<br>'
     +'<b>Solution — (a).</b> Of the eight inputs, four have $x_{0}=1$. Exactly half, so the oracle is balanced and the promise holds.<br>'
     +'<b>Solution — (b).</b> $a_{000}=\\tfrac18(4-4)=0$. And $(-1)^{x_{0}}=(-1)^{x\\cdot k}$ for $k=001$, so the state after the oracle is $H^{\\otimes3}|001\\rangle$ and the last Hadamards return $|001\\rangle$ exactly. Every shot prints $001$.<br>'
     +'<b>Solution — (c).</b> $2^{n-1}+1 = 4+1 = 5$ queries.<br>'
     +'<b>Check.</b> The eight output probabilities are one at $001$ and zero everywhere else, so they add to one. And the reading is not $000$, which is what "balanced" was supposed to produce.',
  err:'Reporting that the output is a uniform spread over the seven non-zero strings. The signs the oracle wrote are a pattern, not noise, and here they line up with one basis state exactly.',
  teach:'Ask for the output of $f(x)=x_{0}\\oplus x_{2}$ before doing the algebra. The answer is $|101\\rangle$, and once a student sees the rule — the output string is the pattern of bits the function depends on — the whole circuit stops looking mysterious.' },

{ id:'D6-03', module:'M6', type:'kickback', src:'L10 · quantum phase estimation: interface and limitations',
  stem:'A single control qubit in $|{+}\\rangle$ controls the gate $S=\\operatorname{diag}(1,i)$, whose target is prepared in $|1\\rangle$.',
  parts:['Give the eigenphase $\\varphi$ that the control picks up.',
         'Give the state of the control qubit after the gate, and the probability of reading $0$ after a Hadamard.',
         'Say why one control qubit cannot tell this phase from $\\varphi=3/4$, and what measurement would.'],
  sol:'<b>Given.</b> One controlled gate, with the target in an eigenstate of it.<br>'
     +'<b>Method.</b> Read the eigenvalue off the diagonal, write it as $e^{2\\pi i\\varphi}$, and put it on the $|1\\rangle$ term of the control.<br>'
     +'<b>Solution — (a).</b> $S|1\\rangle = i|1\\rangle = e^{i\\pi/2}|1\\rangle$, so $2\\pi\\varphi=\\pi/2$ and $\\varphi=1/4$.<br>'
     +'<b>Solution — (b).</b> The control becomes $\\tfrac{1}{\\sqrt2}(|0\\rangle+i|1\\rangle) = |{+}i\\rangle$. After a Hadamard its amplitudes are $\\tfrac{1+i}{2}$ and $\\tfrac{1-i}{2}$, so $p(0)=\\left|\\tfrac{1+i}{2}\\right|^{2}=\\tfrac12$.<br>'
     +'<b>Solution — (c).</b> A phase of $3/4$ gives $\\tfrac{1}{\\sqrt2}(|0\\rangle-i|1\\rangle)$, and a Hadamard sends that to $p(0)=\\tfrac12$ as well. The two are told apart by measuring in the $Y$ basis: apply $S^{\\dagger}$ then $H$, and the two phases give readings $0$ and $1$ with certainty.<br>'
     +'<b>Check.</b> The two probabilities in part (b) add to one. And the ambiguity is the right shape: one qubit carries one bit, and distinguishing four phases needs two.',
  err:'Concluding that the phase is unmeasurable because the two outcomes are equally likely. The information is in the relative phase, and a measurement in the wrong basis is blind to it — which is chapter 2\u2019s point arriving inside an algorithm.',
  teach:'Follow it with $\\varphi=1/8$, where no single-qubit measurement basis gives a certain answer. That is what makes the $t$-qubit register of phase estimation necessary rather than merely convenient.' },

/* ---- promise problems and query counts -------------------------------- */

{ id:'D6-04', module:'M6', type:'promise', src:'L10 · extending Deutsch\u2019s algorithm to n inputs',
  stem:'A promised function on $n=8$ bits is either constant or balanced.',
  parts:['Give the exact classical worst-case query count and the quantum query count.',
         'Give the number of distinct classical queries needed to be wrong with probability below $10^{-3}$.',
         'Say what happens to each of those three counts as $n$ grows.'],
  sol:'<b>Given.</b> A promise problem on $256$ inputs.<br>'
     +'<b>Method.</b> The exact count is $2^{n-1}+1$. For the randomised count, $k$ distinct queries on a balanced function all agree with probability below $2^{-(k-1)}$; solve that for $k$.<br>'
     +'<b>Solution — (a).</b> Exact classical: $2^{7}+1 = 129$. Quantum: $1$.<br>'
     +'<b>Solution — (b).</b> $2^{-(k-1)} \\le 10^{-3}$ needs $k-1 \\ge 10$, so $k=11$ queries. The exact probability at $k=11$ is $7.8\\times10^{-4}$.<br>'
     +'<b>Solution — (c).</b> The exact count doubles with every extra bit; the quantum count stays at $1$; and the randomised count does not move at all, because $2^{-(k-1)}$ does not depend on $n$.<br>'
     +'<b>Check.</b> At $n=8$ the randomised count $11$ is smaller than the exact count $129$ by a factor of about twelve, and at $n=30$ it is smaller by a factor of about fifty million. The separation being called exponential is the one against the first count.',
  err:'Quoting the exponential separation without the word "exact". Against a classical algorithm allowed a one-in-a-thousand error, the quantum advantage on this problem is a factor of eleven and it never grows.',
  teach:'Ask what error probability would make the randomised count reach $129$. It is about $2^{-128}$, which is far below the failure rate of any real machine — so the exact count is describing a requirement nobody imposes.' },

{ id:'D6-05', module:'M6', type:'promise', src:'L10 · phase kickback and the Deutsch-Jozsa proof',
  stem:'The Deutsch\u2013Jozsa circuit is run on $n=4$ query qubits with a function that returns $1$ on exactly six of its sixteen inputs. The promise has been broken.',
  parts:['Give the amplitude of $|0000\\rangle$ at the output.',
         'Give the probability of reading $0000$.',
         'Say what a reading of $0000$ and a reading of anything else each allow you to conclude.'],
  sol:'<b>Given.</b> A function that is neither constant nor balanced.<br>'
     +'<b>Method.</b> The amplitude of the all-zero string is the average of the signs, and nothing about that formula needed the promise.<br>'
     +'<b>Solution — (a).</b> Ten inputs give $+1$ and six give $-1$, so $a_{0000}=\\tfrac{10-6}{16}=\\tfrac{4}{16}=0.25$.<br>'
     +'<b>Solution — (b).</b> $p(0000)=0.25^{2}=0.0625$.<br>'
     +'<b>Solution — (c).</b> Nothing, in either case. A reading of $0000$ no longer proves the function is constant, because a non-constant function can produce it; and a reading of something else no longer proves the function is balanced, because this one is not.<br>'
     +'<b>Check.</b> Put the promise back and the two possible amplitudes are $\\pm1$ and $0$, which are the only two values that make a single shot conclusive. Any other value leaves both readings ambiguous, and $0.25$ is such a value.',
  err:'Answering part (c) with "it is probably balanced". The circuit was never a test for balance; it was a test that separates two cases the promise guaranteed. Remove the guarantee and there is no test left.',
  teach:'Ask for the number of shots that would estimate the fraction of ones to within one per cent. It is about $2500$, and that is a sampling problem with no quantum advantage in it — which shows what the promise was buying.' },

{ id:'D6-06', module:'M6', type:'promise', src:'L10 · extending Deutsch\u2019s algorithm to n inputs',
  stem:'On three query qubits the oracle computes $f(x_{2}x_{1}x_{0}) = x_{0}\\oplus x_{2}$ into the target, using two CNOT gates.',
  parts:['Say whether the promise holds.',
         'Give the string the circuit prints, and the probability of printing it.',
         'Give the depth of the oracle and say whether the two CNOTs can run together.'],
  sol:'<b>Given.</b> A parity oracle on two of the three input bits.<br>'
     +'<b>Method.</b> Count the inputs giving $1$; then use the rule that the output string is the pattern of bits the parity is taken over.<br>'
     +'<b>Solution — (a).</b> The parity of two bits is $1$ on half of the four combinations, and the third bit is free, so four of the eight inputs give $1$. Balanced: the promise holds.<br>'
     +'<b>Solution — (b).</b> $(-1)^{x_{0}\\oplus x_{2}} = (-1)^{x\\cdot k}$ with $k=101$, so the output is $|101\\rangle$ with probability $1$.<br>'
     +'<b>Solution — (c).</b> Both CNOTs write into the same target wire, so the second must wait for the first: the depth is $2$, not $1$.<br>'
     +'<b>Check.</b> The printed string names exactly the wires the function depends on, and $q_{1}$ — which $f$ ignores — reads $0$. That is a check anyone can do on the statement of the question before computing anything.',
  err:'Reporting the depth as one because the two gates have different controls. Depth is decided by the wires a gate touches, and both of these touch the target.',
  teach:'Ask what the printed string would be if the target were prepared in $|0\\rangle$ instead of $|{-}\\rangle$. There is no kickback then, the query register stays uniform, and the reading is a random string \u2014 which is the cleanest demonstration that the preparation is the mechanism.' },

/* ---- the transform: amplitudes and cost ------------------------------- */

{ id:'D6-07', module:'M6', type:'fourier', src:'L10 · quantum Fourier transform',
  stem:'The three-qubit Fourier transform, $Q=8$, is applied to the basis state $|6\\rangle$.',
  parts:['Give the modulus of every output amplitude.',
         'Give the angle the phase advances by as $k$ increases by one.',
         'Give the eight measurement probabilities, and say what a single run reveals about the input.'],
  sol:'<b>Given.</b> $F_{8}|6\\rangle = \\tfrac{1}{\\sqrt8}\\sum_{k}e^{2\\pi i\\,6k/8}|k\\rangle$.<br>'
     +'<b>Method.</b> Read the modulus and the phase off the definition separately; the modulus does not depend on $x$ and the phase step does.<br>'
     +'<b>Solution — (a).</b> Every amplitude has modulus $1/\\sqrt8 = 0.354$.<br>'
     +'<b>Solution — (b).</b> The phase advances by $2\\pi\\times6/8 = 270^{\\circ}$ per step.<br>'
     +'<b>Solution — (c).</b> Every probability is $|1/\\sqrt8|^{2} = 1/8$, and a single run therefore reveals <b>nothing</b> about the input: the distribution is the same for every $x$.<br>'
     +'<b>Check.</b> Eight probabilities of $1/8$ add to one. And the information really is still there — applying the inverse transform returns $|6\\rangle$ exactly — it is simply not visible in this basis.',
  err:'Expecting the transform to make the input readable. It moves the input entirely into phases, and a computational-basis measurement is blind to phase, so the transform is only ever useful with something after it.',
  teach:'Ask what happens if the transform is applied twice. The result is $|{-6} \\bmod 8\\rangle = |2\\rangle$, which is a permutation and not the identity, and working out why is a good exercise in reading the definition carefully.' },

{ id:'D6-08', module:'M6', type:'fourier', src:'L10 · QFT circuit in Qiskit',
  stem:'The exact Fourier transform circuit is to be built on $n=6$ qubits.',
  parts:['Give the number of Hadamards, the number of controlled rotations and the number of swaps.',
         'Give the smallest rotation angle in the circuit.',
         'A classical fast Fourier transform on $64$ stored numbers costs about $Q\\log_{2}Q$ operations. Give that count and say why the two numbers should not be compared.'],
  sol:'<b>Given.</b> $n=6$, so $Q=64$.<br>'
     +'<b>Method.</b> Each qubit takes one Hadamard and one controlled rotation from every qubit below it, and the output order is reversed by swaps.<br>'
     +'<b>Solution — (a).</b> Hadamards: $6$. Controlled rotations: $6\\times5/2 = 15$. Total gates $21$, plus $\\lfloor6/2\\rfloor = 3$ swaps.<br>'
     +'<b>Solution — (b).</b> The smallest is $R_{6}$, an angle of $2\\pi/2^{6} = 2\\pi/64 = 5.625^{\\circ}$.<br>'
     +'<b>Solution — (c).</b> $64\\times6 = 384$ operations. The two solve different problems: the classical one takes $64$ explicitly stored numbers and returns $64$ numbers, while the quantum one takes a prepared state and returns one index.<br>'
     +'<b>Check.</b> $\\tfrac12 n(n+1) = 21$, which is what parts (a) adds up to. And the smallest angle halves with every extra qubit, which is what makes the approximate transform — dropping rotations below a threshold — a sensible engineering choice.',
  err:'Reporting $21$ against $384$ as a speedup. It is a comparison of two different tasks with two different input models, and it is the commonest overstatement made about this circuit.',
  teach:'Ask what the count becomes if every rotation smaller than $R_{4}$ is dropped. The gate count falls from $21$ to about $15$ and the error is bounded; at $n=2048$ the same rule takes the count from $L^{2}$ to $O(L\\log L)$, which is why it is standard.' },

{ id:'D6-09', module:'M6', type:'fourier', src:'L10 · what the QFT does and does not return',
  stem:'The state $\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|4\\rangle\\right)$ on three qubits is sent through the Fourier transform, $Q=8$.',
  parts:['Give the eight output amplitudes.',
         'Give the eight measurement probabilities.',
         'Say what one run tells you about the input, and how many runs a full description of the output would take.'],
  sol:'<b>Given.</b> A two-term input, so the transform acts by linearity.<br>'
     +'<b>Method.</b> Transform each basis state and add: $\\tilde a_{k} = \\tfrac{1}{4}\\left(1 + e^{2\\pi i\\,4k/8}\\right) = \\tfrac14\\left(1+(-1)^{k}\\right)$.<br>'
     +'<b>Solution — (a).</b> $\\tilde a_{k} = 1/2$ for $k$ even and $0$ for $k$ odd.<br>'
     +'<b>Solution — (b).</b> $p(k) = 0.25$ at $k=0,2,4,6$ and $0$ at the odd indices.<br>'
     +'<b>Solution — (c).</b> One run returns one even index, which says the input had period four and nothing more. Describing the whole output distribution to within one per cent would take a few thousand runs, and by then the counting has cost far more than the transform saved.<br>'
     +'<b>Check.</b> Four probabilities of $0.25$ add to one. And the odd amplitudes are exactly zero rather than small, which is the cancellation the whole chapter turns on.',
  err:'Saying that the transform has computed the spectrum. It has produced amplitudes; a spectrum is a list of numbers, and getting a list of $Q$ numbers out of a quantum computer takes at least $Q$ readings.',
  teach:'Change the input to $\\tfrac{1}{\\sqrt2}(|0\\rangle+|2\\rangle)$ and the surviving indices become $0$ and $4$ only. The pattern — a period of $d$ in the input gives support on multiples of $Q/d$ in the output — is the whole of period finding in one line.' },

/* ---- phase estimation: precision and cost ----------------------------- */

{ id:'D6-10', module:'M6', type:'qpe', src:'L10 · quantum phase estimation: interface and limitations',
  stem:'Phase estimation is run with $t=4$ counting qubits on a unitary whose eigenphase is $\\varphi = 5/16$.',
  parts:['Give the reading and its probability.',
         'Give the four bits the counting register holds.',
         'Give the number of applications of $U$ the run needs.'],
  sol:'<b>Given.</b> $t=4$, so $Q=16$, and a phase that is a four-bit binary fraction.<br>'
     +'<b>Method.</b> Check whether $2^{t}\\varphi$ is a whole number before doing anything else.<br>'
     +'<b>Solution — (a).</b> $16\\times\\tfrac{5}{16} = 5$, a whole number, so the exact case applies: $y=5$ with probability $1$.<br>'
     +'<b>Solution — (b).</b> $5$ in four bits is $0101$, and $\\varphi = 0.0101$ in binary, which is $\\tfrac14+\\tfrac{1}{16} = 0.3125$.<br>'
     +'<b>Solution — (c).</b> $1+2+4+8 = 2^{4}-1 = 15$ applications.<br>'
     +'<b>Check.</b> The other fifteen outcomes have amplitude exactly zero, because their sixteen phase terms are the vertices of a regular polygon. And $5/16 = 0.3125$ is the phase that was put in, so the circuit returned it exactly.',
  err:'Assuming the exact case is the normal one. Almost every real phase is not a $t$-bit fraction, and reasoning from this question alone produces a circuit that is expected to print an answer and prints a distribution.',
  teach:'Ask what happens with $t=3$ instead. The phase $0.0101$ no longer fits, the reading spreads over all eight outcomes, and the two nearest carry about $0.81$ between them — which is the general case arriving.' },

{ id:'D6-11', module:'M6', type:'qpe', src:'L10 · quantum phase estimation: interface and limitations',
  stem:'Phase estimation is run with $t=3$ counting qubits on a unitary whose eigenphase is $\\varphi = 0.1$.',
  parts:['Give the two readings that bracket the true phase.',
         'Give the probability of each of them.',
         'Compare their total with the guaranteed floor, and give the error of the best estimate.'],
  sol:'<b>Given.</b> $Q=8$ and $2^{t}\\varphi = 0.8$, which is not a whole number.<br>'
     +'<b>Method.</b> Use $P(y)=2^{-2t}\\left|\\sin(\\pi 2^{t}\\delta)/\\sin(\\pi\\delta)\\right|^{2}$ with $\\delta = \\varphi - y/8$.<br>'
     +'<b>Solution — (a).</b> $0.8$ lies between $0$ and $1$, so the two readings are $y=0$ and $y=1$.<br>'
     +'<b>Solution — (b).</b> For $y=1$, $\\delta = 0.1-0.125 = -0.025$ and $P = 0.8769$. For $y=0$, $\\delta = 0.1$ and $P = 0.0565$.<br>'
     +'<b>Solution — (c).</b> Together $0.9334$, comfortably above the guaranteed $8/\\pi^{2} = 0.8106$. The best estimate is $1/8 = 0.125$, in error by $0.025$.<br>'
     +'<b>Check.</b> The remaining six outcomes carry $0.0666$ between them, and $0.9334+0.0666 = 1$. The guarantee is a floor and not an equality, so a comfortable margin above it is expected rather than suspicious.',
  err:'Taking the guarantee $8/\\pi^{2}$ for the answer. It is the worst case over all phases, reached when the phase sits exactly halfway between two readings; here the phase is close to a reading and the probability is much higher.',
  teach:'Ask for the worst case at $t=3$. It is $\\varphi=1/16$, exactly halfway between $y=0$ and $y=1$, where each carries $0.4053 = 4/\\pi^{2}$ and the two together carry $0.8107$ — the floor, met exactly.' },

{ id:'D6-12', module:'M6', type:'qpe', src:'L10 · quantum phase estimation: interface and limitations',
  stem:'A phase is to be estimated to six correct binary digits, with a failure probability of at most $0.05$.',
  parts:['Give the number of counting qubits.',
         'Give the number of applications of $U$ that needs.',
         'Say what changes if the failure probability is tightened to $0.005$, and what changes if a seventh digit is wanted instead.'],
  sol:'<b>Given.</b> $n=6$ digits and $\\varepsilon=0.05$.<br>'
     +'<b>Method.</b> $t = n + \\left\\lceil \\log_{2}\\left(2 + \\tfrac{1}{2\\varepsilon}\\right)\\right\\rceil$.<br>'
     +'<b>Solution — (a).</b> $\\tfrac{1}{2\\varepsilon} = 10$, so the bracket is $\\log_{2}12 = 3.58$ and its ceiling is $4$. Then $t = 6+4 = 10$.<br>'
     +'<b>Solution — (b).</b> $2^{10}-1 = 1023$ applications of $U$.<br>'
     +'<b>Solution — (c).</b> Tightening the failure probability tenfold makes the bracket $\\log_{2}102 = 6.67$, so $t=13$: three more qubits. Wanting a seventh digit makes $t=11$: one more qubit, but the applications double to $2047$.<br>'
     +'<b>Check.</b> Confidence is cheap and accuracy is expensive, which is the shape the formula has: $\\varepsilon$ sits inside a logarithm and $n$ does not.',
  err:'Reporting the qubit count as the cost. Ten qubits sounds small; the $1023$ applications of $U$ behind them are the circuit, and they are what a coherence time has to survive.',
  teach:'Ask for the register that would read a phase to thirty digits. It is $t=34$, which is a modest number of qubits and about $1.7\\times10^{10}$ applications of $U$ \u2014 and that arithmetic is the whole difficulty of the algorithms in this chapter.' },

{ id:'D6-13', module:'M6', type:'qpe', src:'L10 · quantum phase estimation: interface and limitations',
  stem:'Phase estimation is run with $t=12$ counting qubits, on a unitary whose own circuit is $800$ gates.',
  parts:['Give the number of applications of $U$ and the gate count they come to.',
         'Give the gate count of the inverse Fourier transform.',
         'Say what fraction of the circuit the transform is, and what a rewrite that halved it would buy.'],
  sol:'<b>Given.</b> $t=12$, and one application of $U$ costing $800$ gates.<br>'
     +'<b>Method.</b> Add the powers: $1+2+\\cdots+2^{t-1} = 2^{t}-1$. The transform is $\\tfrac12 t(t+1)$.<br>'
     +'<b>Solution — (a).</b> $2^{12}-1 = 4095$ applications, at $800$ gates each: $3.28\\times10^{6}$ gates.<br>'
     +'<b>Solution — (b).</b> $\\tfrac12\\times12\\times13 = 78$ gates.<br>'
     +'<b>Solution — (c).</b> The transform is $78$ out of about $3.28\\times10^{6}$, which is $0.0024\\%$. Halving it would remove $39$ gates from three million and change nothing measurable.<br>'
     +'<b>Check.</b> Add one counting qubit: the transform goes from $78$ to $91$ and the controlled part doubles to $6.6\\times10^{6}$. The two terms are not in the same league and never become so.',
  err:'Describing this algorithm as "the quantum Fourier transform". The transform is the part that reads the answer, and it is the smallest part of the circuit by four orders of magnitude.',
  teach:'Ask which of the two parts a hardware improvement should target. The answer decides a research programme, and the arithmetic above answers it in one line.' },

/* ---- order finding and its classical steps ---------------------------- */

{ id:'D6-14', module:'M6', type:'order', src:'L10 · worked order-finding example: N = 15',
  stem:'Take $N=33$ and $a=5$.',
  parts:['Give the order of $5$ modulo $33$.',
         'Check the two conditions the factoring step needs.',
         'Give the two factors, and verify them.'],
  sol:'<b>Given.</b> $\\gcd(5,33)=1$, so no factor has fallen out yet.<br>'
     +'<b>Method.</b> List the powers until one returns to $1$; then test that the order is even and that its half power is not $-1$.<br>'
     +'<b>Solution — (a).</b> $5,25,26,31,23,16,14,4,20,1$, so $r=10$.<br>'
     +'<b>Solution — (b).</b> $r=10$ is even. $5^{5} = 3125 = 94\\times33+23$, so $5^{5}\\equiv23$, and $-1$ modulo $33$ is $32$. Both conditions hold.<br>'
     +'<b>Solution — (c).</b> $\\gcd(22,33) = 11$ and $\\gcd(24,33) = 3$.<br>'
     +'<b>Check.</b> $11\\times3 = 33$, and both are prime. The multiplication is the whole verification, and it is why this algorithm can afford to fail half the time.',
  err:'Stopping at the first power that looks like a repeat. The order is the smallest positive exponent giving $1$, and every intermediate value has to be checked against $1$ and not against the previous one.',
  teach:'Set the same modulus with $a=32$, which is $-1$. Its order is $2$, and $32^{1}\\equiv-1$, so the second condition fails and the run is discarded. Two bases, two outcomes, one classical test between them.' },

{ id:'D6-15', module:'M6', type:'order', src:'L10 · order-finding workflow',
  stem:'Order finding is run on $N=21$ with $a=2$. Take the idealised case in which every run samples one value of $s$ uniformly and the continued fractions return the reduced form of $s/r$.',
  parts:['Give the order, the eigenphases, and the probability of each.',
         'For each measured $s$, give the candidate order the continued fractions return and say whether it passes the check.',
         'Give the probability that one run succeeds.'],
  sol:'<b>Given.</b> $N=21$, $a=2$, and a reading that reduces to $s/r$ exactly.<br>'
     +'<b>Method.</b> Find $r$; the eigenphases are $s/r$ for $s=0,\\ldots,r-1$, each with probability $1/r$. Reduce each fraction and test its denominator with one modular exponentiation.<br>'
     +'<b>Solution — (a).</b> The powers are $1,2,4,8,16,11,1$, so $r=6$. The eigenphases are $0,\\tfrac16,\\tfrac26,\\tfrac36,\\tfrac46,\\tfrac56$, each with probability $\\tfrac16$.<br>'
     +'<b>Solution — (b).</b> $s=0$ gives $0/1$ and no information. $s=1$ and $s=5$ reduce to sixths and give $r=6$, and $2^{6}=64\\equiv1$: both pass. $s=2$ and $s=4$ reduce to thirds and give $3$, but $2^{3}=8\\not\\equiv1$: both fail. $s=3$ reduces to a half and gives $2$, but $2^{2}=4\\not\\equiv1$: fails.<br>'
     +'<b>Solution — (c).</b> Two of the six values succeed, so one run succeeds with probability $\\tfrac13$.<br>'
     +'<b>Check.</b> The values of $s$ that work are exactly the ones coprime to $6$, which are $1$ and $5$ — and counting the integers below $r$ that are coprime to it is the general rule. Three runs are expected before one lands.',
  err:'Accepting the first candidate the continued fractions return. Half the values of $s$ here give a proper divisor of the order, and the only thing separating them from the truth is the modular exponentiation check.',
  teach:'Ask how the success probability behaves as $r$ grows. It is the fraction of integers below $r$ coprime to $r$, which never falls far, so the expected number of runs stays small however large $N$ becomes.' },

{ id:'D6-16', module:'M6', type:'order', src:'L10 · order-finding workflow',
  stem:'An order-finding run on $N=15$ with $a=2$ uses $t=8$ counting qubits and returns the reading $y=192$.',
  parts:['Give the fraction $y/Q$ and its continued-fraction convergents.',
         'Give the candidate order and confirm it.',
         'Give the two factors of fifteen.'],
  sol:'<b>Given.</b> $Q = 2^{8} = 256$ and $y=192$.<br>'
     +'<b>Method.</b> Expand $y/Q$ as a continued fraction and take the last convergent whose denominator is below $N$; then confirm with one modular exponentiation.<br>'
     +'<b>Solution — (a).</b> $192/256 = 3/4 = 0.75$. The expansion is $[0;1,3]$ and the convergents are $0/1$, $1/1$ and $3/4$.<br>'
     +'<b>Solution — (b).</b> The last denominator below $15$ is $4$, so $r=4$. Confirm: $2^{4}=16 = 15+1$, so $2^{4}\\equiv1 \\pmod{15}$.<br>'
     +'<b>Solution — (c).</b> $r$ is even and $2^{2}=4\\not\\equiv-1$, so $\\gcd(3,15)=3$ and $\\gcd(5,15)=5$.<br>'
     +'<b>Check.</b> $3\\times5=15$. And the reading was exact here because $s/r = 3/4$ happens to be a $t$-bit fraction; a reading of $191$ or $193$ would have given the same order through the same convergents, which is what the method is for.',
  err:'Taking the last convergent rather than the last one with a small enough denominator. The full expansion always ends at $y/Q$ itself, whose denominator is $256$ — a perfectly correct fraction and a useless order.',
  teach:'Ask what $y=64$ would give. That is $1/4$, the same denominator and the same order, from the value $s=1$ instead of $s=3$. Two different readings, one answer, which is the redundancy the procedure relies on.' },

{ id:'D6-17', module:'M6', type:'order', src:'L10 · order-finding workflow',
  stem:'An order-finding run on $N=21$ with $a=2$ uses $t=9$ counting qubits and returns $y=427$.',
  parts:['Give the convergents of $y/Q$.',
         'Give the candidate order and confirm it.',
         'Say why $t=9$ was chosen rather than $t=5$.'],
  sol:'<b>Given.</b> $Q=2^{9}=512$ and $y=427$.<br>'
     +'<b>Method.</b> Expand and stop at the last denominator below $N=21$.<br>'
     +'<b>Solution — (a).</b> $427/512 = 0.833984$. The expansion is $[0;1,5,42,2]$ and the convergents are $0/1$, $1/1$, $5/6$, $211/253$ and $427/512$.<br>'
     +'<b>Solution — (b).</b> The last denominator below $21$ is $6$, so $r=6$, and $2^{6}=64 = 3\\times21+1$ confirms it.<br>'
     +'<b>Solution — (c).</b> The uniqueness of the nearby fraction needs $Q > N^{2} = 441$, and $2^{9}=512$ is the smallest power of two above that. With $t=5$, $Q=32$ and several fractions with small denominators sit within $1/2Q$ of the reading, so no convergent is forced.<br>'
     +'<b>Check.</b> The true fraction is $5/6 = 0.83333$ and the reading was $0.83398$, which differs by $0.00065$ — below $1/2Q = 0.00098$, exactly as the theorem promises.',
  err:'Choosing the counting register from the number of bits of $N$ rather than from $N^{2}$. Half the register length is the difference between an answer that is forced and one that is a guess, and it doubles the modular multiplications the circuit needs.',
  teach:'Ask for the register a $2048$-bit modulus needs. It is about $4096$ counting qubits, which is where the qubit counts in published resource estimates come from.' },

/* ---- assessing an algorithmic claim ----------------------------------- */

{ id:'D6-18', module:'M6', type:'claim', src:'L10 · computational models: what is being counted?',
  stem:'A summary states: "the Deutsch\u2013Jozsa algorithm gives an exponential speedup over classical computers."',
  parts:['Name the five components a resource claim has to state, and say which of them this sentence states.',
         'Rewrite the sentence so that it is true.',
         'Give the largest honest ratio for $n=20$, and say against which classical algorithm.'],
  sol:'<b>Given.</b> A one-sentence claim.<br>'
     +'<b>Method.</b> Take the five components in turn and mark each as stated or missing.<br>'
     +'<b>Solution — (a).</b> Task, input model, accuracy, hardware model, classical baseline. The sentence states the task loosely and nothing else. The input model — query access to a reversible oracle — is missing; the accuracy requirement, exactness, is missing; the promise is missing; and the baseline is unnamed.<br>'
     +'<b>Solution — (b).</b> "For a function promised to be constant or balanced, given as a reversible oracle, one quantum query decides which, where any classical algorithm that must never be wrong needs $2^{n-1}+1$ queries in the worst case."<br>'
     +'<b>Solution — (c).</b> Against the exact classical algorithm at $n=20$ the ratio is $2^{19}+1 = 524{,}289$. Against a randomised algorithm allowed to be wrong once in a million it is $21$, and that number does not grow with $n$.<br>'
     +'<b>Check.</b> Both ratios are correct and they differ by a factor of twenty-five thousand. Which one is quoted is decided entirely by the accuracy component, which the original sentence omitted.',
  err:'Treating the omission as pedantry. The two ratios above differ by four orders of magnitude and one of them does not grow at all, so the missing component is not a detail — it is the whole result.',
  teach:'Ask the class to apply the same five headings to Grover and to Shor before reading the last scenes of the chapter. The exercise is more useful than any of the three answers.' },

{ id:'D6-19', module:'M6', type:'claim', src:'L10 · Shor\u2019s factoring algorithm',
  stem:'A resource estimate for factoring a $1024$-bit modulus is to be sketched. Take a reversible modular multiplier to cost about $L^{2}$ gates, and a counting register of $t=2L$ qubits.',
  parts:['Give the number of controlled modular multiplications and the gates they come to.',
         'Give the gate count of the inverse Fourier transform on that register.',
         'Say which of the two an estimate is really an estimate of, and what the hardware model adds.'],
  sol:'<b>Given.</b> $L=1024$, so $t=2048$.<br>'
     +'<b>Method.</b> One controlled modular multiplication per counting qubit; the transform is $\\tfrac12 t(t+1)$.<br>'
     +'<b>Solution — (a).</b> $2048$ multiplications at about $1024^{2} = 1.05\\times10^{6}$ gates each: about $2.1\\times10^{9}$ gates.<br>'
     +'<b>Solution — (b).</b> $\\tfrac12\\times2048\\times2049 \\approx 2.1\\times10^{6}$ gates.<br>'
     +'<b>Solution — (c).</b> The arithmetic, by a factor of about a thousand. And every one of those $2.1\\times10^{9}$ gates is a <b>logical</b> gate: the hardware model turns each into a code block with rounds of error correction, which multiplies both the qubit count and the duration by a large factor.<br>'
     +'<b>Check.</b> The ratio should be about $L^{3}/L^{2}=L$, and $2.1\\times10^{9}/2.1\\times10^{6} = 1000$, which is of the order of $L=1024$. The scaling argument and the arithmetic agree.',
  err:'Reporting the logical gate count as the cost. A logical gate is not a physical operation, and the factor between them is where the millions of physical qubits in published estimates come from.',
  teach:'Ask what happens to part (a) if the approximate transform is used. Nothing: it changes part (b), which was already negligible. That is the cleanest demonstration of which part of this algorithm is worth optimising.' },

/* ---- a full-length question ------------------------------------------ */

{ id:'D6-20', module:'M6', type:'full', src:'L10 · order-finding workflow',
  stem:'Factor $N=21$ by order finding, with the base $a=2$. Take the counting register to be as short as the uniqueness condition allows, and assume every reading is exact.',
  parts:['Give the counting register size and the number of applications of the modular multiplier.',
         'Give the order, the eigenphases, and the probability that one run yields a usable reading.',
         'Take the reading $y=427$ and recover the order from it.',
         'Give the two factors, and verify them.',
         'State the claim this run supports and the claim it does not, using the five components.'],
  sol:'<b>Given.</b> $N=21$, $a=2$, and $\\gcd(2,21)=1$, so the procedure continues.<br>'
     +'<b>Method.</b> Fix the registers from $Q>N^{2}$; find the eigenphases; read one; recover the order classically; extract the factors; then write the claim out.<br>'
     +'<b>Solution — (a).</b> $N^{2}=441$, so $Q$ must exceed $441$ and the smallest power of two above it is $512$: $t=9$ counting qubits. The work register needs $2^{m}\\ge21$, so $m=5$. Applications of the multiplier: $2^{9}-1 = 511$.<br>'
     +'<b>Solution — (b).</b> The powers of two modulo $21$ are $1,2,4,8,16,11,1$, so $r=6$. The eigenphases are $s/6$ for $s=0,\\ldots,5$, each with probability $\\tfrac16$. Only $s=1$ and $s=5$ are coprime to $6$ and give the order directly, so one run is usable with probability $\\tfrac13$.<br>'
     +'<b>Solution — (c).</b> $427/512 = 0.833984$, whose convergents are $0/1$, $1/1$, $5/6$, $211/253$ and $427/512$. The last denominator below $21$ is $6$, so $r=6$; and $2^{6} = 64 \\equiv 1 \\pmod{21}$ confirms it.<br>'
     +'<b>Solution — (d).</b> $r$ is even and $2^{3} = 8 \\not\\equiv -1$, so $\\gcd(7,21) = 7$ and $\\gcd(9,21) = 3$. And $7\\times3 = 21$.<br>'
     +'<b>Solution — (e).</b> Task: factor a $5$-bit integer. Input model: the number itself, with nothing to load. Accuracy: one run in three is usable, and every candidate is confirmed classically, so the answer is certain once it arrives. Hardware model: nine counting qubits, five work qubits, $511$ coherent modular multiplications, no error correction counted. Baseline: at this size, trial division finds the answer in two steps. So the run supports the claim that the pieces fit together, and supports no claim at all about a saving.<br>'
     +'<b>Check.</b> The order divides the size of the group of units modulo $21$, which is $\\varphi(21)=12$, and $6$ divides $12$. Every number in the run is consistent with that, and the final multiplication closes it.',
  err:'Reading part (e) as pedantry after four correct parts. A demonstration on a number a child can factor is evidence about the wiring and about nothing else, and the difference between it and a useful run is about ten orders of magnitude in every column.',
  teach:'Ask for part (a) with $N$ a $2048$-bit number. The counting register becomes about $4096$ qubits and the multiplications about $4096$, each on $2048$-bit numbers — and the whole change from this question to that one is in the hardware model, which is the component students skip.' }

]);

window.DRILL_M6 = [

{ id:'m6-drill', module:'M6', nav:'Module 6 \u00b7 practice questions',
  title:'Module 6 \u2014 practice questions',
  objective:'Twenty open-ended questions with worked solutions, in the shapes the chapter sets.',
  keywords:'practice questions module 6 kickback deutsch jozsa fourier transform phase estimation order finding factoring resource claim',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 \u00b7 Practice D6-01 \u2026 D6-20'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step that reaches the answer a second way. In this chapter the cheap checks are: probabilities that add to one, a balanced function whose signs average to exactly zero, a phase-estimation distribution with at least $8/\\pi^{2}$ on the two nearest outcomes, a candidate order confirmed by one modular exponentiation, and two factors that multiply back to $N$.'},
  {t:'rule', short:true},
  {t:'drill', module:'M6'}
]}

];

})();
