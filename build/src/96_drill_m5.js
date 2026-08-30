/* ==========================================================================
   Practice questions — Module 5.

   Six shapes and twenty questions in them. The numbers are chosen so that the
   Check step is cheap: a depth is never larger than a gate count, probabilities
   add to one, an estimated probability carries $\sqrt{p(1-p)/N}$, a teleported
   branch always has probability one quarter, and a Grover probability is a sine
   squared and therefore never above one. Every solution ends by using one of
   those.

   Three questions in the sheet exist for the chapter's own argument rather than
   for any technique. D5-12 asks what happens when only one of the two classical
   bits is sent, and the answer is exactly the classical benchmark, which is the
   sharpest available statement that the classical channel is the protocol.
   D5-16 asks for the success probability at twice the optimum, which is the
   error the whole Grover section exists to prevent. And D5-19 asks for the
   problem size at which a quadratic saving in queries becomes a saving in
   seconds, which is the question a resource claim is really making.
   ========================================================================== */
(function(){

CONTENT.DRILLTYPES.M5 = [
  { k:'circuit', name:'Reading and counting a circuit',
    asks:'A circuit is given as a diagram or a gate list. Find its depth, its counts, or the state it produces.',
    method:['Fix the ordering before anything else: $|q_{n-1}\\ldots q_0\\rangle$, $q_0$ on the top wire and the last digit of the ket, and $x=\\sum_k 2^k q_k$ for the vector index.',
            'For a depth, group the gates into layers: a gate joins the current layer only if no gate already in it touches one of its qubits.',
            'Count three numbers separately — total gates, two-qubit gates, and depth. They answer different questions and only the last two matter for a machine.',
            'For a state, act on the basis states one at a time; a permutation gate needs no matrix multiplication at all.'],
    go:'m5-circuit' },

  { k:'runcost', name:'Shots, error bars and simulation cost',
    asks:'A circuit is to be run or simulated. Find the shots a target accuracy needs, or the memory an exact simulation needs.',
    method:['For a probability estimated from $N$ shots, $\\mathrm{SE}=\\sqrt{p(1-p)/N}$. Solve it for $N$ when a target accuracy is given, and use $p=0.5$ when $p$ is unknown, because that is the worst case.',
            'Ten times the accuracy costs a hundred times the shots. If a question asks for a factor in accuracy, square it to get the factor in shots.',
            'An exact state vector is $16\\cdot 2^{n}$ bytes and a circuit matrix is $16\\cdot 4^{n}$. Solve either for $n$ against a stated memory.',
            'Check whether the error asked about is sampling error, which shrinks with shots, or device error, which does not.'],
    go:'m5-shots' },

  { k:'compile', name:'Rewriting and routing for a machine',
    asks:'A circuit is to run on a stated instruction set and coupling map. Find what it becomes and what that costs.',
    method:['Translate first: rewrite every gate into the instruction set using the identities of chapter 4, and keep the global phase whenever the gate is controlled.',
            'Then route: for a two-qubit gate between qubits $d$ steps apart on the coupling map, $d-1$ SWAPs bring them together and each SWAP is three CNOTs.',
            'Report the two-qubit count and the depth separately. The two-qubit count drives the gate error and the depth drives the duration.',
            'Check that the rewrite left the two-qubit count alone where it should have, and that nothing was compared across two different compiler settings.'],
    go:'m5-iset' },

  { k:'tele', name:'Teleportation: branches, corrections and resources',
    asks:'A teleportation run is described. Find what Bob holds, what he must apply, or what the protocol consumed.',
    method:['Write the identity: after Alice measures, Bob holds $X^{m_1}Z^{m_0}|\\psi\\rangle$, and the correction is $X^{m_1}$ then $Z^{m_0}$.',
            'Every branch has probability exactly one quarter for every input. If a calculation gives anything else, the algebra is wrong.',
            'Before the two bits arrive, $\\rho_B = I/2$. Any question about what Bob can do without them has that as its answer.',
            'For resources, count one shared pair and two classical bits per qubit moved, and check any fidelity claim against the classical benchmark of $2/3$.'],
    go:'m5-telecorr' },

  { k:'grover', name:'Grover: angle, iterations and probability',
    asks:'A search problem is given. Find the angle, the best iteration count, or the success probability.',
    method:['Start with $\\sin\\theta=\\sqrt{M/N}$ and get $\\theta$ in degrees or radians before anything else. Every later number is built on it.',
            'The optimum is $r_{*}=\\frac{\\pi}{4\\theta}-\\frac12$; round it to a whole number and check the neighbour on each side.',
            '$P(r)=\\sin^{2}\\!\\big((2r+1)\\theta\\big)$ for every $r$, including the ones past the optimum, where it falls.',
            'Check that $P$ is between zero and one, and that $P(0)=M/N$, which is what a random guess is worth.'],
    go:'m5-iter' },

  { k:'claim', name:'Assessing a resource claim',
    asks:'A claim about a speedup is quoted. Say what it does and does not assert, or find where it stops being true.',
    method:['Name the five components: task, input model, accuracy, hardware model, and the classical baseline. List which of them the claim states.',
            'Separate a query count from a runtime. Multiply each count by the cost of one of its own operations before comparing.',
            'For a crossover, set the two total times equal and solve for the problem size. A saving that only starts beyond a size nobody will run is not a saving.',
            'Check the baseline: is the classical method quoted the best one for this task, or the most obvious one?'],
    go:'m5-cost' },

  { k:'full', name:'A full-length question: one protocol, end to end',
    asks:'A protocol, a machine, a measurement and a reported number, in four to five parts.',
    method:['Read every part before starting. The number at the end usually depends on every step before it.',
            'Work in the order the machine does: write the circuit, compile it, count what it costs, then run it and report an estimate with its error bar.',
            'Carry exact values between parts and check each against the one before: a probability between zero and one, a depth no larger than a gate count, and an error bar quoted with every estimated number.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---- reading and counting a circuit ---------------------------------- */

{ id:'D5-01', module:'M5', type:'circuit', src:'L8 · GHZ state, depth and gate count',
  stem:'A GHZ state on eight qubits is prepared two ways. The <b>chain</b> applies $H$ to $q_{0}$ and then $\\mathrm{CNOT}_{0\\to1}$, $\\mathrm{CNOT}_{1\\to2}$, and so on up to $\\mathrm{CNOT}_{6\\to7}$. The <b>tree</b> applies $H$ to $q_{0}$, then $\\mathrm{CNOT}_{0\\to1}$, then $\\mathrm{CNOT}_{0\\to2}$ and $\\mathrm{CNOT}_{1\\to3}$ together, then four more together.',
  parts:['Give the total gate count and the two-qubit count for each.',
         'Give the depth of each.',
         'A two-qubit gate takes $400\\,\\text{ns}$ and a one-qubit gate $40\\,\\text{ns}$. Give the duration of each.'],
  sol:'<b>Given.</b> Two circuits that produce the same eight-qubit state.<br>'
     +'<b>Method.</b> Count the gates; then group them into layers, where a gate joins the current layer only if no gate already in that layer touches one of its qubits.<br>'
     +'<b>Solution — (a).</b> Both use one $H$ and seven CNOTs: $8$ gates, of which $7$ are two-qubit gates. The counts are identical.<br>'
     +'<b>Solution — (b).</b> In the chain each CNOT needs the qubit the previous one wrote, so nothing runs together: depth $8$. In the tree the CNOTs come in layers of $1$, $2$ and $4$, so the depth is $1+3=4$.<br>'
     +'<b>Solution — (c).</b> Chain: $40 + 7\\times400 = 2840\\,\\text{ns}$. Tree: $40 + 3\\times400 = 1240\\,\\text{ns}$.<br>'
     +'<b>Check.</b> The depth is never larger than the gate count, and both are here. The tree is $2.3$ times faster with exactly the same amount of work, which is the whole reason the two numbers are kept apart.',
  err:'Reporting the depth as the gate count because both circuits have eight gates. The gate count cannot see parallelism, and parallelism is what the tree is buying.',
  teach:'Ask for the general $n$ before the arithmetic: the chain is depth $n$ and the tree is depth $1+\\lceil\\log_{2}n\\rceil$. At $n=1000$ one is impossible and the other is routine, and the gate count is the same for both.' },

{ id:'D5-02', module:'M5', type:'circuit', src:'L8 · bit order: wires, integers, kets and strings',
  stem:'A three-qubit circuit maps $q_{k}$ to classical bit $c_{k}$, and one run prints the string $011$.',
  parts:['Give the values read on each wire, and name the wire drawn at the top.',
         'Give the ket and the state-vector index this string names.',
         'Write the matrix of $\\mathrm{CNOT}_{0\\to1}$ on two qubits in the ordered basis $|00\\rangle,|01\\rangle,|10\\rangle,|11\\rangle$.'],
  sol:'<b>Given.</b> A printed string, under the convention $|q_{n-1}\\ldots q_{1}q_{0}\\rangle$ with $q_{0}$ drawn at the top.<br>'
     +'<b>Method.</b> The leftmost character of the string is the highest-numbered bit. Read it off, then convert.<br>'
     +'<b>Solution — (a).</b> $c_{2}=0$, $c_{1}=1$, $c_{0}=1$, so $q_{2}=0$, $q_{1}=1$ and $q_{0}=1$. The top wire is $q_{0}$, and it read $1$.<br>'
     +'<b>Solution — (b).</b> The ket is $|011\\rangle$ and the index is $x = 4(0)+2(1)+1 = 3$: entry $3$ of the state vector.<br>'
     +'<b>Solution — (c).</b> The gate flips $q_{1}$ when $q_{0}=1$, so $|00\\rangle\\mapsto|00\\rangle$, $|01\\rangle\\mapsto|11\\rangle$, $|10\\rangle\\mapsto|10\\rangle$, $|11\\rangle\\mapsto|01\\rangle$. Reading each image into its column: $\\begin{bmatrix}1&0&0&0\\\\0&0&0&1\\\\0&0&1&0\\\\0&1&0&0\\end{bmatrix}$.<br>'
     +'<b>Check.</b> Every column of the matrix has exactly one $1$, so it is a permutation matrix and therefore unitary. And applying it twice returns the identity, which is what $c\\oplus c = 0$ says.',
  err:'Reading the string left to right onto the wires from the top, so that the top wire is given the leftmost character. That reverses the state, and $|011\\rangle$ against $|110\\rangle$ is not an approximation — it is a different state with a different index.',
  teach:'Set the same question with the string $100$ and then $001$. The two answers differ, which is exactly what a palindrome like $011$ against $110$ can hide from a careless reader.' },

{ id:'D5-03', module:'M5', type:'circuit', src:'L8 · Bell-state circuit',
  stem:'From $|00\\rangle$, a circuit applies $H$ to $q_{0}$, then $\\mathrm{CNOT}_{0\\to1}$, then $Z$ to $q_{1}$.',
  parts:['Give the state after each of the three gates.',
         'Name the final state.',
         'Give the four measurement probabilities, and the depth of the circuit.'],
  sol:'<b>Given.</b> Three gates on two qubits, written $|q_{1}q_{0}\\rangle$.<br>'
     +'<b>Method.</b> Act on the basis states one at a time; both the CNOT and the $Z$ are diagonal or permutations, so no matrix multiplication is needed.<br>'
     +'<b>Solution — (a).</b> After $H$: $\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|01\\rangle\\right)$. The CNOT flips $q_{1}$ where $q_{0}=1$, sending $|01\\rangle$ to $|11\\rangle$: $\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)$. The $Z$ on $q_{1}$ signs every term with $q_{1}=1$: $\\tfrac{1}{\\sqrt2}\\left(|00\\rangle-|11\\rangle\\right)$.<br>'
     +'<b>Solution — (b).</b> That is the Bell state $|\\Phi^{-}\\rangle$.<br>'
     +'<b>Solution — (c).</b> $p(00)=0.5$, $p(11)=0.5$, and $p(01)=p(10)=0$. Nothing here runs in parallel, so the depth is $3$.<br>'
     +'<b>Check.</b> The probabilities add to one. And the $Z$ changed no probability at all — it moved a relative phase, which is invisible in this basis and would be fully visible after a Hadamard on each qubit.',
  err:'Applying the $Z$ to $q_{0}$ because $q_{0}$ is the wire the Hadamard was on. That gives $\\tfrac{1}{\\sqrt2}(|00\\rangle-|11\\rangle)$ as well, by accident, because both qubits agree in every term — so the error survives this question and fails the next one.',
  teach:'Follow it with the same circuit on the input $|01\\rangle$, where the output is $|\\Psi^{\\pm}\\rangle$ and the two placements of the $Z$ give different signs. That is where the accident stops covering the mistake.' },

/* ---- shots, error bars and simulation cost --------------------------- */

{ id:'D5-04', module:'M5', type:'runcost', src:'L8 · measurement, barriers and finite shots',
  stem:'A circuit produces an outcome with true probability $p=0.2$.',
  parts:['Give the standard error of the estimated probability after $1000$ shots.',
         'Give the shots needed for a standard error of $0.002$.',
         'The measured value comes out at $0.31$ after $40{,}000$ shots. Say what that does and does not mean.'],
  sol:'<b>Given.</b> A binomial outcome and a target accuracy.<br>'
     +'<b>Method.</b> $\\mathrm{SE}(\\hat p)=\\sqrt{p(1-p)/N}$, solved forwards for part (a) and backwards for part (b).<br>'
     +'<b>Solution — (a).</b> $\\sqrt{0.2\\times0.8/1000} = \\sqrt{1.6\\times10^{-4}} = 0.01265$.<br>'
     +'<b>Solution — (b).</b> $N \\ge 0.16/0.002^{2} = 0.16/4\\times10^{-6} = 40{,}000$ shots.<br>'
     +'<b>Solution — (c).</b> At $40{,}000$ shots the standard error is $0.002$, so $0.31$ sits about $55$ standard errors away from $0.2$. That is not sampling variation. It means the machine is not sampling the distribution the ideal circuit predicts, and more shots will only measure the wrong number more precisely.<br>'
     +'<b>Check.</b> Forty times the shots of part (a) should divide the error by $\\sqrt{40}=6.32$, and $0.01265/6.32 = 0.0020$, which is what part (b) asked for.',
  err:'Concluding from part (c) that the run needs more shots. Sampling error shrinks as $1/\\sqrt N$ and device error does not: a disagreement of fifty standard errors is a statement about the machine, not about the sample size.',
  teach:'Ask the class what number of shots would make $0.31$ a plausible sample from $p=0.2$. The answer is about $14$, which makes the point better than any argument: the discrepancy is not something shots can explain.' },

{ id:'D5-05', module:'M5', type:'runcost', src:'L8 · exact statevector evolution and the operator representation',
  stem:'An exact simulation stores each complex amplitude in $16$ bytes.',
  parts:['Give the memory a $34$-qubit state vector needs.',
         'Give the largest $n$ whose state vector fits in $1\\,\\text{TB} = 10^{12}$ bytes.',
         'Give the memory the circuit matrix of a $15$-qubit circuit needs, and say why circuits are checked on states instead.'],
  sol:'<b>Given.</b> A state vector of $2^{n}$ complex entries, and a circuit matrix of $2^{n}\\times2^{n}$.<br>'
     +'<b>Method.</b> Multiply, then solve the same expression for $n$.<br>'
     +'<b>Solution — (a).</b> $16\\times2^{34} = 16\\times1.718\\times10^{10} = 2.749\\times10^{11}$ bytes, about $275\\,\\text{GB}$.<br>'
     +'<b>Solution — (b).</b> $2^{n}\\le 10^{12}/16 = 6.25\\times10^{10}$, so $n \\le \\log_{2}(6.25\\times10^{10}) = 35.86$, giving $n=35$.<br>'
     +'<b>Solution — (c).</b> $16\\times4^{15} = 16\\times1.074\\times10^{9} = 1.718\\times10^{10}$ bytes, about $17.2\\,\\text{GB}$ — for only fifteen qubits. The matrix grows as $4^{n}$ and the state as $2^{n}$, so acting on states is the only route that reaches useful sizes.<br>'
     +'<b>Check.</b> One more qubit doubles the state and quadruples the matrix. From part (a), $35$ qubits need $550\\,\\text{GB}$ and $36$ need $1.1\\,\\text{TB}$, which agrees with part (b).',
  err:'Reading "$34$ qubits needs $275\\,\\text{GB}$" as "a machine with $275\\,\\text{GB}$ can simulate any $34$-qubit circuit". A simulator needs at least one working copy of the vector, so the real limit is a qubit or two lower.',
  teach:'Ask what a thousand times more memory buys. The answer is ten more qubits, and that single fact makes the exponential more concrete than any graph.' },

{ id:'D5-06', module:'M5', type:'runcost', src:'L8 · dynamic circuits and classical feedforward',
  stem:'A one-qubit dynamic circuit applies $H$ to a qubit in $|0\\rangle$, measures it into $c_{0}$, applies $X$ if $c_{0}=1$, and measures again into $c_{1}$.',
  parts:['Give the joint distribution of $(c_{1},c_{0})$.',
         'Give it again with the conditional $X$ removed.',
         'Give it again with the conditional $X$ kept and one further $H$ inserted before the second measurement.'],
  sol:'<b>Given.</b> A circuit whose second half depends on a bit produced by its first half.<br>'
     +'<b>Method.</b> Follow each branch of the first measurement separately, then weight the branches by their probabilities.<br>'
     +'<b>Solution — (a).</b> After $H$ the state is $|{+}\\rangle$, so $c_{0}$ is $0$ or $1$ with probability $0.5$ each, and the qubit is left in the state that was read. If $c_{0}=1$ the $X$ returns it to $|0\\rangle$. Both branches end at $|0\\rangle$, so $c_{1}=0$ always: $(0,0)$ with probability $0.5$ and $(0,1)$ with probability $0.5$.<br>'
     +'<b>Solution — (b).</b> Without the $X$, the qubit stays where the first measurement left it, so the second reading repeats the first: $(0,0)$ and $(1,1)$, each with probability $0.5$.<br>'
     +'<b>Solution — (c).</b> The correction leaves $|0\\rangle$, the extra $H$ makes it $|{+}\\rangle$, and the second reading is a fresh fair coin independent of the first: all four patterns with probability $0.25$.<br>'
     +'<b>Check.</b> Each of the three distributions adds to one, and each has a different structure — deterministic in $c_{1}$, perfectly correlated, and independent. One gate moved, three different experiments.',
  err:'Treating the state after the first measurement as still $|{+}\\rangle$. The measurement leaves the qubit in the outcome that was read; carrying the superposition past it makes part (b) come out as four equal outcomes, which no run ever produces.',
  teach:'Part (b) is the cheapest demonstration of collapse that exists, because the perfect correlation between two readings of the same qubit is something a classical mixture also produces — and that is exactly why part (c) is needed to tell them apart.' },

/* ---- rewriting and routing for a machine ----------------------------- */

{ id:'D5-07', module:'M5', type:'compile', src:'L8 · transpilation and instruction-set compliance',
  stem:'A circuit has $12$ CNOTs and $20$ one-qubit gates. The machine offers only $R_{z}(\\lambda)$, $R_{x}(\\pi/2)$ and CZ. Each CNOT becomes $H\\,\\mathrm{CZ}\\,H$, each $H$ becomes three rotations, and each of the original one-qubit gates becomes three rotations.',
  parts:['Give the instruction count after translation, and the two-qubit count.',
         'A two-qubit gate fails with probability $0.008$ and a one-qubit gate with $0.0003$. Give the probability that no gate fails.',
         'Say which of the two counts in part (a) the answer to part (b) depended on.'],
  sol:'<b>Given.</b> A circuit and a target instruction set, with the translation rules stated.<br>'
     +'<b>Method.</b> Translate each kind of gate, add up, then multiply the survival probabilities.<br>'
     +'<b>Solution — (a).</b> The $12$ CNOTs give $12$ CZ and $24$ Hadamards, and those become $72$ rotations. The $20$ original one-qubit gates give $60$ rotations. Total: $12 + 72 + 60 = 144$ instructions, of which $12$ are two-qubit gates.<br>'
     +'<b>Solution — (b).</b> $0.992^{12}\\times0.9997^{132} = 0.9081\\times0.9612 = 0.8728$.<br>'
     +'<b>Solution — (c).</b> Almost entirely on the two-qubit count. The twelve CZ gates cost $9.2$ percentage points and the hundred and thirty-two rotations cost $3.9$, although there are eleven times as many of them.<br>'
     +'<b>Check.</b> The two-qubit count is unchanged by the translation, which it must be: the rewrite replaces one two-qubit gate by one two-qubit gate and adds only one-qubit gates around it.',
  err:'Reporting the translation as a failure because the instruction count went from $32$ to $144$. The number that changed is the one that costs least; the number that decides the outcome did not move at all.',
  teach:'Ask what happens if the machine offers CNOT directly. The answer is $12+60=72$ instructions and the same $0.8728$, which makes the point that instruction count and error budget are nearly independent.' },

{ id:'D5-08', module:'M5', type:'compile', src:'L8 · transpilation and instruction-set compliance',
  stem:'A chip has five qubits joined in a line, $Q_{0}\\!-\\!Q_{1}\\!-\\!Q_{2}\\!-\\!Q_{3}\\!-\\!Q_{4}$, and the circuit asks for a CNOT between $Q_{0}$ and $Q_{4}$.',
  parts:['Give the number of two-qubit gates the compiler needs, leaving the qubits permuted at the end.',
         'Give it again if the original layout has to be restored.',
         'Give it again if the chip is a ring, with $Q_{4}$ also joined to $Q_{0}$.'],
  sol:'<b>Given.</b> A coupling map and a gate between two qubits that are not joined.<br>'
     +'<b>Method.</b> Count the steps between the two qubits on the map; $d-1$ SWAPs bring them together, and each SWAP is three CNOTs.<br>'
     +'<b>Solution — (a).</b> $Q_{0}$ and $Q_{4}$ are $4$ steps apart, so $3$ SWAPs bring the state of $Q_{0}$ next to $Q_{4}$. That is $3\\times3=9$ CNOTs, plus the one that was asked for: $10$.<br>'
     +'<b>Solution — (b).</b> Undoing the three SWAPs costs another $9$: $19$ in total.<br>'
     +'<b>Solution — (c).</b> On a ring the two are joined directly, so the answer is $1$ — no SWAPs at all.<br>'
     +'<b>Check.</b> Part (c) is the sanity test on the whole calculation: nothing about the algorithm changed between the three answers, and the count went from $19$ to $1$. The chip decided the cost.',
  err:'Counting four SWAPs rather than three. Moving a state four steps along the line takes four SWAPs, but the gate only needs the two qubits to be <b>neighbours</b>, which takes three.',
  teach:'Two circuits with identical gate lists, compiled onto a line and onto a ring, differ by a factor of nineteen here. A published two-qubit count with no coupling map beside it cannot be compared with anything.' },

{ id:'D5-09', module:'M5', type:'compile', src:'L8 · execution time, usage and experimental cost',
  stem:'A compiler returns two valid versions of one circuit. Version A has $40$ two-qubit gates and depth $30$; version B has $52$ and depth $18$. Every layer contains at least one two-qubit gate, a two-qubit gate takes $400\\,\\text{ns}$ and fails with probability $0.01$, and the qubits have $T_{2}=60\\,\\mu\\text{s}$.',
  parts:['Give the duration of each version.',
         'Give the probability that no gate fails, for each.',
         'Combine the two effects with a factor $e^{-T/T_{2}}$ and say which version to run.'],
  sol:'<b>Given.</b> Two compilations of one circuit, differing in both counts.<br>'
     +'<b>Method.</b> Duration from the depth, gate error from the two-qubit count, and then both together.<br>'
     +'<b>Solution — (a).</b> A: $30\\times400\\,\\text{ns} = 12.0\\,\\mu\\text{s}$. B: $18\\times400\\,\\text{ns} = 7.2\\,\\mu\\text{s}$.<br>'
     +'<b>Solution — (b).</b> A: $0.99^{40}=0.6690$. B: $0.99^{52}=0.5930$.<br>'
     +'<b>Solution — (c).</b> A: $0.6690\\times e^{-12/60} = 0.6690\\times0.8187 = 0.5477$. B: $0.5930\\times e^{-7.2/60} = 0.5930\\times0.8869 = 0.5259$. Version A is slightly better, despite being $67\\%$ longer.<br>'
     +'<b>Check.</b> The two effects pull in opposite directions, which is why neither number alone decides. B wins on time by $4.8\\,\\mu\\text{s}$ and loses on gate error by $12$ marked in the answer to part (b); the gate error is the larger of the two here.',
  err:'Choosing B because it is shallower, or A because it has fewer gates. Each is a defensible half-argument, and neither is the answer: the two have to be combined before anything can be chosen.',
  teach:'Change $T_{2}$ to $15\\,\\mu\\text{s}$ and rerun part (c): A gives $0.6690\\times0.4493=0.3006$ and B gives $0.5930\\times0.6188=0.3670$, so B now wins. The right answer depends on the machine, which is exactly why the hardware model is one of the five things a claim must name.' },

/* ---- teleportation --------------------------------------------------- */

{ id:'D5-10', module:'M5', type:'tele', src:'L9 · teleportation identity, resources and no signaling',
  stem:'Alice teleports $|\\psi\\rangle = 0.6\\,|0\\rangle + 0.8\\,|1\\rangle$ and reads $m_{1}=1$, $m_{0}=0$.',
  parts:['Give the state Bob holds before any correction.',
         'Give the correction he applies, and verify that it returns $|\\psi\\rangle$.',
         'Give the fidelity Bob would have if he applied nothing.'],
  sol:'<b>Given.</b> One branch of the teleportation identity, with a real input state.<br>'
     +'<b>Method.</b> Bob holds $X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$; the correction is $X^{m_{1}}$ followed by $Z^{m_{0}}$.<br>'
     +'<b>Solution — (a).</b> With $m_{0}=0$ and $m_{1}=1$ the operator is $X$, so Bob holds $X|\\psi\\rangle = 0.8\\,|0\\rangle+0.6\\,|1\\rangle$.<br>'
     +'<b>Solution — (b).</b> He applies $X$, and $X(0.8|0\\rangle+0.6|1\\rangle) = 0.6|0\\rangle+0.8|1\\rangle = |\\psi\\rangle$.<br>'
     +'<b>Solution — (c).</b> $F = \\left|\\langle\\psi|X|\\psi\\rangle\\right|^{2} = (0.6\\times0.8 + 0.8\\times0.6)^{2} = 0.96^{2} = 0.9216$.<br>'
     +'<b>Check.</b> Both states are normalised: $0.6^{2}+0.8^{2}=1$ either way round. And $0.9216$ is well above the classical benchmark of $2/3$ — for <b>this</b> input, which is exactly why a fidelity has to be averaged over inputs before it means anything.',
  err:'Applying $Z$ because $m_{0}$ is the first bit read. The bit that selects $X$ is $m_{1}$, from the qubit Alice shared, and the bit that selects $Z$ is $m_{0}$, from the qubit that carried the state. Swapping them repairs one branch in four.',
  teach:'Part (c) is the trap worth setting: $0.9216$ looks like a good result and was obtained by doing nothing at all. Ask for the same number with $|\\psi\\rangle=|0\\rangle$, where it is $0$, and the case for averaging makes itself.' },

{ id:'D5-11', module:'M5', type:'tele', src:'L9 · teleportation identity, resources and no signaling',
  stem:'Alice teleports an arbitrary qubit $|\\psi\\rangle$ with Bloch vector $\\mathbf{r}$.',
  parts:['Give the probability of each of the four branches.',
         'Give the four Bloch vectors Bob\u2019s qubit could carry, and their average.',
         'Say whether Bob can tell that Alice ran the protocol at all, before the bits arrive.'],
  sol:'<b>Given.</b> The identity $|\\Psi\\rangle = \\tfrac12\\sum_{m_{1}m_{0}}|m_{1}m_{0}\\rangle\\,X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$.<br>'
     +'<b>Method.</b> The branch probability is the squared norm of its term; the Bloch vectors follow from how $X$ and $Z$ act on a vector by conjugation.<br>'
     +'<b>Solution — (a).</b> Each term carries the factor $\\tfrac12$ and a normalised state, so each branch has probability $\\left(\\tfrac12\\right)^{2}=0.25$, for every $|\\psi\\rangle$.<br>'
     +'<b>Solution — (b).</b> $I$ leaves $(r_x,r_y,r_z)$; $Z$ gives $(-r_x,-r_y,r_z)$; $X$ gives $(r_x,-r_y,-r_z)$; $XZ$ gives $(-r_x,r_y,-r_z)$. Each component appears twice with each sign, so the average is $(0,0,0)$.<br>'
     +'<b>Solution — (c).</b> No. A Bloch vector of zero is $\\rho_{B}=I/2$, and that is the state Bob\u2019s qubit was in as soon as the pair was shared. Nothing he can measure changes when Alice acts.<br>'
     +'<b>Check.</b> All four probabilities add to one, and they had to be equal: if any branch were more likely for some inputs than others, Bob could learn something about $|\\psi\\rangle$ from his own statistics, and that would be a signal.',
  err:'Answering part (c) with "yes, because the state collapsed". A collapse changes what Alice can say about Bob\u2019s qubit. Part (b) is the proof that it changes nothing Bob can measure, and the two statements are not in conflict.',
  teach:'Work part (b) with a specific vector, say $(0.6,0,0.8)$, and write the four out as numbers. Seeing $(0.6,0,0.8)$, $(-0.6,0,0.8)$, $(0.6,0,-0.8)$ and $(-0.6,0,-0.8)$ average to zero is more convincing than the general argument.' },

{ id:'D5-12', module:'M5', type:'tele', src:'L9 · teleportation identity, resources and no signaling',
  stem:'A three-qubit state is to be teleported, and a colleague proposes saving bandwidth by sending only $m_{1}$ for each qubit.',
  parts:['Give the entangled pairs and classical bits the honest protocol needs.',
         'With only $m_{1}$ sent, give the state Bob ends up with, as a channel applied to $\\rho$.',
         'Give the resulting average fidelity over inputs spread across the sphere, and say what it shows.'],
  sol:'<b>Given.</b> Teleportation of three qubits, and a proposal to send one bit each instead of two.<br>'
     +'<b>Method.</b> Count the resources; then average over the bit that was not sent, which is a channel.<br>'
     +'<b>Solution — (a).</b> Three shared pairs and six classical bits, and the three originals are destroyed. Nothing is reusable: each pair is consumed by one qubit.<br>'
     +'<b>Solution — (b).</b> Bob applies $X^{m_{1}}$ correctly, which leaves $Z^{m_{0}}$ with $m_{0}$ unknown and equally likely either way: $\\rho_{\\text{out}} = \\tfrac12\\left(\\rho + Z\\rho Z\\right)$. That is the dephasing channel of chapter 3 at full strength.<br>'
     +'<b>Solution — (c).</b> $F = \\langle\\psi|\\rho_{\\text{out}}|\\psi\\rangle = \\tfrac12\\left(1 + r_{z}^{2}\\right)$, and averaging $r_{z}^{2}$ over the sphere gives $\\tfrac13$, so $F_{\\text{avg}} = \\tfrac12\\left(1+\\tfrac13\\right) = \\tfrac23$. That is exactly the benchmark a protocol with no entanglement at all achieves, so the saved bit threw away every advantage the entangled pairs bought.<br>'
     +'<b>Check.</b> The channel keeps the diagonal and kills the off-diagonal, so a $Z$ measurement is unaffected and an $X$ measurement is a fair coin. The states on the $z$ axis come through with $F=1$ and those on the equator with $F=0.5$, and $\\tfrac23$ sits between them, as an average must.',
  err:'Reporting the loss as "about half the fidelity", or averaging $F$ over only the six cardinal states. Averaging over the six gives $\\tfrac12(1+\\tfrac{2}{6}\\cdot 3)$-style arithmetic that happens to land near the right answer for the wrong reason; the average that matters is over the whole sphere.',
  teach:'This is the sharpest statement in the chapter that the classical channel <b>is</b> the protocol. Halving the classical communication does not halve the quality; it removes the entanglement advantage entirely, to the last decimal place.' },

{ id:'D5-13', module:'M5', type:'tele', src:'L9 · teleportation fidelity and experimental claims',
  stem:'A group reports an average teleportation fidelity of $F_{\\text{avg}}=0.78$ over inputs spread across the sphere, using pairs of singlet fraction $f$ and the relation $F_{\\text{avg}}=(2f+1)/3$.',
  parts:['Say whether the result beats the classical benchmark.',
         'Give the singlet fraction the result implies.',
         'Give the singlet fraction that would be needed for $F_{\\text{avg}}=0.9$, and name two things the report must state besides the fidelity.'],
  sol:'<b>Given.</b> An averaged fidelity and the relation between it and the quality of the shared pairs.<br>'
     +'<b>Method.</b> Compare against $2/3$; then invert the relation to $f = (3F_{\\text{avg}}-1)/2$.<br>'
     +'<b>Solution — (a).</b> $2/3 = 0.6667$, and $0.78 > 0.6667$, so the result is above the best that measuring and re-preparing can achieve. Entanglement was doing something.<br>'
     +'<b>Solution — (b).</b> $f = (3\\times0.78 - 1)/2 = (2.34-1)/2 = 0.67$.<br>'
     +'<b>Solution — (c).</b> $f = (2.7-1)/2 = 0.85$. The report must also state the unconditional success rate — what fraction of runs were kept and by what rule — and a confidence interval on the fidelity, since $0.78$ from a few hundred runs may not be distinguishable from $0.667$ at all.<br>'
     +'<b>Check.</b> The relation meets both ends correctly: $f=0.5$, the best a separable pair reaches, gives $F_{\\text{avg}}=2/3$ exactly, and $f=1$ gives $F_{\\text{avg}}=1$. A formula that failed either of those checks would be the wrong formula.',
  err:'Reporting $0.78$ as "$78\\%$ successful teleportation". It is an average overlap, not a success rate, and the number that matters is its distance above $0.667$ measured in its own error bars.',
  teach:'Ask what $F_{\\text{avg}}=0.66$ would mean. It is not a slightly worse experiment: it is an experiment that has demonstrated nothing at all, because a machine with no entanglement reaches the same number.' },

/* ---- Grover ---------------------------------------------------------- */

{ id:'D5-14', module:'M5', type:'grover', src:'L9 · geometry of amplitude amplification',
  stem:'Four qubits carry $N=16$ candidates, and exactly one is marked.',
  parts:['Give the angle $\\theta$ in degrees.',
         'Give the exact optimum $r_{*}$ and the whole number nearest it.',
         'Give the success probability at that whole number and at the one below it.'],
  sol:'<b>Given.</b> $N=16$, $M=1$.<br>'
     +'<b>Method.</b> $\\sin\\theta=\\sqrt{M/N}$, then $r_{*}=\\frac{\\pi}{4\\theta}-\\frac12$, then $P(r)=\\sin^{2}((2r+1)\\theta)$.<br>'
     +'<b>Solution — (a).</b> $\\sin\\theta = \\sqrt{1/16}=0.25$, so $\\theta = 14.4775^{\\circ} = 0.25268\\,\\text{rad}$.<br>'
     +'<b>Solution — (b).</b> $r_{*} = \\frac{90^{\\circ}}{4\\times14.4775^{\\circ}}\\cdot 2 - \\frac12$; more simply, $\\frac{\\pi}{4\\times0.25268} - 0.5 = 3.1083 - 0.5 = 2.6083$, so the nearest whole number is $3$.<br>'
     +'<b>Solution — (c).</b> $P(3) = \\sin^{2}(7\\times14.4775^{\\circ}) = \\sin^{2}(101.34^{\\circ}) = 0.9613$. $P(2) = \\sin^{2}(72.39^{\\circ}) = 0.9084$.<br>'
     +'<b>Check.</b> $P(0) = \\sin^{2}\\theta = 0.0625 = 1/16$, which is what one guess out of sixteen is worth, so the construction is right at the start as well as at the optimum.',
  err:'Rounding $r_{*}$ down "to be safe". Here that costs five percentage points, and in general the correct habit is to compute both neighbours and take the larger, since $r_{*}$ is almost never a whole number.',
  teach:'Point out that $P(3)$ is not one. The optimum is a real number and the machine can only run whole iterations, so the residual failure probability is a property of the arithmetic and not of the hardware.' },

{ id:'D5-15', module:'M5', type:'grover', src:'L9 · geometry of amplitude amplification',
  stem:'Six qubits carry $N=64$ candidates.',
  parts:['With $M=4$ marked, give $\\theta$, the best whole $r$, and $P$ at it.',
         'With $M=1$ marked, give the same three numbers.',
         'Give the ratio of the two iteration counts, and say what it shows.'],
  sol:'<b>Given.</b> One problem size and two numbers of marked candidates.<br>'
     +'<b>Method.</b> The same three steps twice, and then compare.<br>'
     +'<b>Solution — (a).</b> $\\sin\\theta=\\sqrt{4/64}=0.25$, so $\\theta=14.4775^{\\circ}$, $r_{*}=2.6083$, $r=3$, and $P(3)=0.9613$.<br>'
     +'<b>Solution — (b).</b> $\\sin\\theta=\\sqrt{1/64}=0.125$, so $\\theta=7.1808^{\\circ}$, $r_{*}=5.7667$, $r=6$, and $P(6)=0.9966$.<br>'
     +'<b>Solution — (c).</b> $6/3 = 2$, and $\\sqrt{4/1}=2$. The iteration count grows as $\\sqrt{N/M}$, so marking four times as many candidates halves the work.<br>'
     +'<b>Check.</b> Part (a) has exactly the same three numbers as $N=16$, $M=1$ in the previous question, and it must: only the ratio $M/N$ enters, and $4/64 = 1/16$.',
  err:'Expecting four times as many marked candidates to divide the iterations by four. The dependence is on $\\sqrt{M}$, not on $M$, and this is the same square root that makes the algorithm worth anything in the first place.',
  teach:'Part (a) and the previous question sharing every number is worth stopping on: the algorithm cannot tell $N=64,M=4$ from $N=16,M=1$, because the two-dimensional plane it lives in is the same plane.' },

{ id:'D5-16', module:'M5', type:'grover', src:'L9 · geometry of amplitude amplification',
  stem:'Ten qubits carry $N=1024$ candidates, one of them marked. A run is scheduled for as many iterations as the coherence time allows.',
  parts:['Give the best whole number of iterations and the success probability there.',
         'Give the success probability after $50$ iterations.',
         'Give it after $75$, and say what the three answers together mean for the schedule.'],
  sol:'<b>Given.</b> $N=1024$, $M=1$, and a plan to run as long as possible.<br>'
     +'<b>Method.</b> $\\sin\\theta=1/32$ gives $\\theta$; then $P(r)=\\sin^{2}((2r+1)\\theta)$ evaluated at three counts.<br>'
     +'<b>Solution — (a).</b> $\\theta = 1.7908^{\\circ} = 0.031255\\,\\text{rad}$, so $r_{*} = 25.1187-0.5 = 24.6187$ and the best whole number is $25$, with $P(25)=\\sin^{2}(91.34^{\\circ}) = 0.99946$.<br>'
     +'<b>Solution — (b).</b> $P(50) = \\sin^{2}(101\\times1.7908^{\\circ}) = \\sin^{2}(180.87^{\\circ}) = 0.00023$.<br>'
     +'<b>Solution — (c).</b> $P(75) = \\sin^{2}(151\\times1.7908^{\\circ}) = \\sin^{2}(270.4^{\\circ}) = 0.99995$. The curve is a sine squared and keeps going: the schedule must stop at $25$, because running longer is not merely wasteful but actively wrong until the count comes all the way round again at three times the cost.<br>'
     +'<b>Check.</b> $P(50)\\approx 0$ and $P(0)=1/1024=0.00098$ are both tiny, which is the statement that fifty iterations have undone everything twenty-five achieved.',
  err:'Running "as many iterations as fit". Here that gives an answer that looks like a completely broken machine — a flat distribution over all $1024$ outcomes — produced by a perfect machine following a bad plan.',
  teach:'Part (c) is worth the surprise. The algorithm is periodic, so a schedule three times too long works again; but it costs three times as much, and the only reliable rule is to stop at the computed optimum.' },

{ id:'D5-17', module:'M5', type:'grover', src:'L9 · oracles and hidden implementation cost',
  stem:'Two qubits carry $N=4$ candidates and the marked one is $x=2$, that is $|10\\rangle$. The register starts in the uniform superposition and the oracle target is prepared in $|{-}\\rangle$.',
  parts:['Give the state of the register after one oracle call.',
         'Give the probability of measuring the marked state at that point.',
         'Give the best whole number of iterations and the success probability there.'],
  sol:'<b>Given.</b> A four-candidate search with one marked item, and phase kickback in force.<br>'
     +'<b>Method.</b> One query signs the marked terms: $\\sum_x c_x|x\\rangle \\mapsto \\sum_x (-1)^{f(x)}c_x|x\\rangle$. Then use $\\sin\\theta=\\sqrt{M/N}$.<br>'
     +'<b>Solution — (a).</b> $\\tfrac12\\left(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle\\right) \\mapsto \\tfrac12\\left(|00\\rangle+|01\\rangle-|10\\rangle+|11\\rangle\\right)$.<br>'
     +'<b>Solution — (b).</b> $\\left|-\\tfrac12\\right|^{2}=0.25$, exactly as before the query. The oracle changed a sign and no probability at all.<br>'
     +'<b>Solution — (c).</b> $\\sin\\theta=\\sqrt{1/4}=0.5$, so $\\theta=30^{\\circ}$ and $r_{*} = \\frac{90^{\\circ}}{4\\times30^{\\circ}}\\cdot 2 - \\frac12 = 1.5-0.5 = 1$ exactly. Then $P(1)=\\sin^{2}(3\\times30^{\\circ}) = \\sin^{2}90^{\\circ} = 1$: one query, and the answer is certain.<br>'
     +'<b>Check.</b> The four probabilities in part (a) add to one, as they must after a unitary. And part (c) is the smallest case where the whole algorithm succeeds with certainty, which makes it the one to work by hand.',
  err:'Concluding from part (b) that the query achieved nothing. It achieved the only thing available: a relative phase. The diffusion operator is what converts that phase into a probability, and without the second half of the iteration part (b) is right that nothing has happened yet.',
  teach:'This is the whole course in four amplitudes. The state after the query is a legal state with a marked sign and a flat distribution, and one further operation makes the answer certain. Ask the class to write out the diffusion step by hand.' },

/* ---- assessing a resource claim -------------------------------------- */

{ id:'D5-18', module:'M5', type:'claim', src:'L9 · oracles and hidden implementation cost',
  stem:'A report states: "our quantum algorithm searches a ten-million-row customer database quadratically faster than any classical method".',
  parts:['Name the five components a resource claim must state, and say which the sentence states.',
         'Say what the input model has to be for the quadratic saving to hold, and what that costs here.',
         'Say what the correct classical baseline for this task is.'],
  sol:'<b>Given.</b> A claim with a stated task and nothing else.<br>'
     +'<b>Method.</b> Take the five components one at a time and mark each as stated or missing.<br>'
     +'<b>Solution — (a).</b> Task, input model, accuracy, hardware model, classical baseline. Only the task is stated, and even that is vague: searching for what, returned how?<br>'
     +'<b>Solution — (b).</b> The saving is a saving in <b>oracle queries</b>, so the predicate must already exist as a reversible circuit. A database is rows in memory, so those rows must first be loaded into a quantum memory — and loading ten million rows takes at least ten million operations, which is more than the classical search the claim is competing against.<br>'
     +'<b>Solution — (c).</b> A database has structure. The right baseline is an index or a hash lookup, which finds a row in about one operation, not the linear scan the word "search" suggests.<br>'
     +'<b>Check.</b> Two of the three answers above kill the claim on their own, and neither of them is about the quantum algorithm being wrong. The theorem is correct; the sentence built on it is not yet a claim.',
  err:'Arguing against the sentence by disputing the square root. The square root is a theorem and is not in question. What is in question is whether the model the theorem is stated in describes this problem, and it does not.',
  teach:'Ask the class to rewrite the sentence so that it is true. The result is long, narrow and much less impressive, which is the point of the exercise.' },

{ id:'D5-19', module:'M5', type:'claim', src:'L9 · oracles and hidden implementation cost',
  stem:'One quantum oracle call takes $20\\,\\mu\\text{s}$ on the machine available; the same predicate takes $5\\,\\text{ns}$ to evaluate on a classical processor. Grover needs about $\\tfrac{\\pi}{4}\\sqrt{N}$ calls and the classical search about $N/2$.',
  parts:['Give both total times at $N=10^{6}$.',
         'Give the problem size at which the two are equal.',
         'Say what would move that size, in each direction.'],
  sol:'<b>Given.</b> Two query counts and the cost of one query in each technology.<br>'
     +'<b>Method.</b> Multiply each count by its own per-query cost, then set the two products equal and solve for $N$.<br>'
     +'<b>Solution — (a).</b> Quantum: $\\tfrac{\\pi}{4}\\times1000 = 785.4$ calls at $20\\,\\mu\\text{s}$, so $15.7\\,\\text{ms}$. Classical: $5\\times10^{5}$ calls at $5\\,\\text{ns}$, so $2.5\\,\\text{ms}$. The classical run is six times faster.<br>'
     +'<b>Solution — (b).</b> $\\tfrac{\\pi}{4}\\sqrt{N}\\times20\\,\\mu\\text{s} = \\tfrac{N}{2}\\times5\\,\\text{ns}$ gives $\\sqrt{N} = \\dfrac{\\pi/4\\times20\\times10^{-6}}{2.5\\times10^{-9}} = 6283$, so $N = 3.9\\times10^{7}$.<br>'
     +'<b>Solution — (c).</b> A faster oracle circuit, or a cheaper error-correcting code, lowers the crossover. Error correction on the oracle raises it, often by orders of magnitude, and any need to load data raises it without limit.<br>'
     +'<b>Check.</b> At $N=3.9\\times10^{7}$ both sides come to about $0.1\\,\\text{s}$, and at $N=10^{6}$, which is forty times smaller, the classical side is ahead by about six — consistent with the classical time growing as $N$ and the quantum time as $\\sqrt{N}$.',
  err:'Comparing $785$ against $500{,}000$ and reporting a speedup of $640$. Those are counts of two different operations whose costs differ by a factor of four thousand, and comparing them directly is the single most common error in this subject.',
  teach:'The crossover is the honest form of the question. Every quadratic advantage has one, and quoting it turns an argument about slogans into an engineering estimate anybody can check.' },

/* ---- a full-length question ------------------------------------------ */

{ id:'D5-20', module:'M5', type:'full', src:'L9 · Grover search, end to end',
  stem:'A group reports finding a marked item among $N=4096$ candidates on hardware. Their oracle compiles to $65$ two-qubit gates and their diffusion operator to $62$. Two-qubit gates fail with probability $0.01$ and there is no error correction.',
  parts:['Give $\\theta$, the exact optimum $r_{*}$, and the best whole number of iterations.',
         'Give the success probability at that count, in the ideal circuit model.',
         'Give the total number of two-qubit gates the run needs, and the probability that none of them fails.',
         'Say how many shots would be needed to distinguish an ideal run from a uniformly random one, and what the answer to part (c) does to that plan.',
         'Say which of the five components of a resource claim this report has and has not established.'],
  sol:'<b>Given.</b> A search on $4096$ candidates, with the compiled cost of both halves of one iteration.<br>'
     +'<b>Method.</b> Work through the algorithm first, then the machine, then the statistics, then the claim.<br>'
     +'<b>Solution — (a).</b> $\\sin\\theta=\\sqrt{1/4096}=1/64$, so $\\theta = 0.0156256\\,\\text{rad} = 0.89528^{\\circ}$. Then $r_{*} = \\frac{\\pi}{4\\times0.0156256} - 0.5 = 50.2634-0.5 = 49.7634$, and the best whole number is $50$.<br>'
     +'<b>Solution — (b).</b> $P(50) = \\sin^{2}(101\\times0.0156256) = \\sin^{2}(1.5782\\,\\text{rad}) = 0.99995$.<br>'
     +'<b>Solution — (c).</b> Each iteration costs $65+62 = 127$ two-qubit gates, so fifty iterations cost $6350$. The probability that none fails is $0.99^{6350} = e^{-63.8} = 1.9\\times10^{-28}$.<br>'
     +'<b>Solution — (d).</b> An ideal run gives the marked string with probability $0.99995$ and a random one with probability $1/4096 = 0.000244$; a handful of shots separates those. But part (c) says the machine reaches the end of the circuit intact essentially never, so the distribution actually sampled is not the ideal one, and no number of shots repairs that. The shot budget was never the binding constraint.<br>'
     +'<b>Solution — (e).</b> The <b>task</b> is stated and the <b>accuracy</b> is computed. The <b>input model</b> is assumed rather than argued: the oracle is counted as if it exists, and where the marked item comes from is not said. The <b>hardware model</b> is stated and is fatal, by part (c). The <b>classical baseline</b> is missing entirely — a classical search of $4096$ items expects $2048$ evaluations of a predicate that costs nanoseconds, so it finishes in microseconds.<br>'
     +'<b>Check.</b> Every number is internally consistent: $P$ is between zero and one; the gate count is fifty times one iteration; the survival probability is $e^{-6350\\times0.01005}$, which matches; and $0.000244\\times4096=1$, so the random baseline is a probability distribution.',
  err:'Reporting parts (a) and (b) and stopping. Those two numbers are correct and they describe a machine nobody has. The report becomes a claim only at part (e), and the honest conclusion of parts (c) and (d) is that this experiment cannot have worked as described.',
  teach:'Work part (c) before part (b) once, with a different class. Knowing that the circuit survives with probability $10^{-28}$ makes the whole of parts (a) and (b) feel different, which is exactly the reordering a referee performs.' }

]);

window.DRILL_M5 = [

{ id:'m5-drill', module:'M5', nav:'Module 5 · practice questions',
  title:'Module 5 — practice questions',
  objective:'Twenty open-ended questions with worked solutions, in the shapes the chapter sets.',
  keywords:'practice questions module 5 circuit depth shots transpilation teleportation grover resource claim query runtime',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Practice D5-01 … D5-20'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step that reaches the answer a second way. In this chapter the cheap checks are: probabilities that add to one, a depth no larger than a gate count, an estimated probability quoted with $\\sqrt{p(1-p)/N}$ beside it, a teleported branch whose probability is exactly one quarter, and a Grover probability that is a sine squared and therefore never above one.'},
  {t:'rule', short:true},
  {t:'drill', module:'M5'}
]}

];
})();
