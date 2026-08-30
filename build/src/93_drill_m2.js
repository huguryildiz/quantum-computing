/* ==========================================================================
   Practice questions — Module 2.

   Six shapes and twenty questions in them. The numbers are chosen so that the
   Check step is cheap: probabilities that add to one, a Bloch vector of length
   one, an expectation value inside the range of the outcomes, and a variance
   that is never negative. Every one of those catches an arithmetic slip in a
   line, and every solution ends by using one.
   ========================================================================== */
(function(){

CONTENT.DRILLTYPES.M2 = [
  { k:'born', name:'Born probabilities in a named basis',
    asks:'A state and a measurement are given. Find the probability of each outcome.',
    method:['Write the measurement basis explicitly. If it is not the computational one, say what its two vectors are before taking any inner product.',
            'One inner product per outcome, then one squared modulus: $p(n)=|\\langle n|\\psi\\rangle|^{2}$. The modulus, not the square of the coefficient.',
            'For a measurement along a direction, the shortcut is $p(\\pm)=\\tfrac12(1\\pm\\mathbf{n}\\cdot\\mathbf{r})$, with $r_a=\\langle\\sigma_a\\rangle$ computed from the state.',
            'Check that the probabilities add to one before going on.'],
    go:'m2-born' },

  { k:'update', name:'The state after a measurement, and sequences',
    asks:'A measurement is made, an outcome is recorded, and something is asked about what happens next.',
    method:['Find the probability of the recorded outcome first; the update rule divides by its square root and is undefined without it.',
            'Apply the projector and renormalise: $|\\psi_a\\rangle=P_a|\\psi\\rangle/\\sqrt{p(a)}$. For a rank-one projector the answer is the basis vector itself, whatever the state was before.',
            'For a sequence, restart from the state the last outcome left. An immediate repeat of the same measurement returns the same answer with certainty; a different measurement in between destroys that.',
            'Multiply along each branch and add the branches that end the same way.'],
    go:'m2-collapse' },

  { k:'expect', name:'Expectation values and variances',
    asks:'An observable and a state are given. Find the mean of many readings, and how far they scatter.',
    method:['Either sandwich the matrix, $\\langle A\\rangle=\\langle\\psi|A|\\psi\\rangle$, or weight the eigenvalues by their Born probabilities. Doing both is the check.',
            'For a variance, square the <em>operator</em> before the sandwich: $\\operatorname{Var}(A)=\\langle A^{2}\\rangle-\\langle A\\rangle^{2}$.',
            'For any Pauli, $A^{2}=I$, so $\\langle A^{2}\\rangle=1$ and $\\operatorname{Var}(A)=1-\\langle A\\rangle^{2}$ with no second sandwich.',
            'Check that the mean lies between the smallest and the largest eigenvalue, and that the variance is not negative.'],
    go:'m2-obs' },

  { k:'commute', name:'Commutators, compatibility and the bound',
    asks:'Two observables are given. Decide whether both can be sharp at once, and bound how sharp they can be.',
    method:['Compute $[A,B]=AB-BA$. For Pauli operators use the cyclic rule and multiply nothing.',
            'Zero means the two share an eigenbasis and can both be sharp; non-zero means no state makes both certain.',
            'For the bound, evaluate $\\tfrac12|\\langle[A,B]\\rangle|$ on the state given. It depends on the state, so a bound of zero is a bound that says nothing.',
            'Compare with $\\Delta A\\,\\Delta B$ computed directly. It must be at least the bound, and it is allowed to be much larger.'],
    go:'m2-comm' },

  { k:'evolve', name:'Evolution, stationary states and pulses',
    asks:'A Hamiltonian is given, with a starting state and a time. Find the state, a probability, or the time that produces a wanted state.',
    method:['Write $H$ as $\\tfrac{\\Omega}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma$ if you can: then $\\Omega$ is the rate, $\\mathbf{n}$ the axis, and the closed form applies with no diagonalisation.',
            '$U(t)=\\cos(\\Omega t/2)I-i\\sin(\\Omega t/2)\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma$. Apply it to the starting state and keep the amplitudes exact.',
            'For a probability, take the squared modulus at the end and not before. For a wanted time, set the angle $\\Omega t$ to what the wanted rotation needs.',
            'Check that the total probability is one at every time, and that adding a multiple of the identity to $H$ changed nothing.'],
    go:'m2-gate' },

  { k:'shots', name:'What a finite run is worth',
    asks:'A probability or an expectation value is to be estimated from a finite number of shots.',
    method:['For a probability, $\\mathrm{SE}=\\sqrt{p(1-p)/N}$. For a $\\pm1$ observable, $\\mathrm{SE}=\\sqrt{(1-\\langle A\\rangle^{2})/N}$; the two are the same statement.',
            'To reach a target error, invert it: $N$ grows as the square of the precision wanted, so one more decimal digit costs a hundred times as many shots.',
            'Say which uncertainty is being quoted. Sampling error shrinks as $1/\\sqrt N$; a biased readout does not shrink at all.'],
    go:'m2-shots' },

  { k:'full', name:'A full-length question: one experiment end to end',
    asks:'A preparation, an evolution, a measurement and a reported number, in three to five parts.',
    method:['Read every part before starting. The reported number at the end usually depends on every step before it.',
            'Work in the order the experiment runs: state, then unitary, then measurement, then statistics. Do not jump to the last part.',
            'Carry exact values between parts and check each against the one before: probabilities add to one, a Bloch vector of a pure state has length one, and an expectation value stays inside the range of the outcomes.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---- Born probabilities --------------------------------------------- */

{ id:'D2-01', module:'M2', type:'born', src:'L4 · Born rule',
  stem:'A qubit is prepared in $|\\psi\\rangle=\\tfrac15\\left(3|0\\rangle+4i|1\\rangle\\right)$.',
  parts:['Give the probabilities of the two outcomes of a $Z$ measurement.',
         'Give the probabilities of the two outcomes of an $X$ measurement.',
         'Is the state an eigenstate of either? Say how you can tell without solving anything.'],
  sol:'<b>Given.</b> One normalised qubit state with a phase on the second amplitude.<br>'
     +'<b>Method.</b> One inner product per outcome, then a squared modulus. For $X$, write $|\\pm\\rangle$ out first.<br>'
     +'<b>Solution — (a).</b> $p(0)=\\left|\\tfrac35\\right|^{2}=\\tfrac{9}{25}=0.36$ and $p(1)=\\left|\\tfrac{4i}{5}\\right|^{2}=\\tfrac{16}{25}=0.64$.<br>'
     +'<b>Solution — (b).</b> $\\langle+|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\cdot\\tfrac{3+4i}{5}$, so $p(+)=\\tfrac{9+16}{50}=\\tfrac12$. Likewise $\\langle-|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\cdot\\tfrac{3-4i}{5}$ gives $p(-)=\\tfrac12$.<br>'
     +'<b>Solution — (c).</b> Neither: an eigenstate of $Z$ has one probability equal to one, and an eigenstate of $X$ likewise. Both measurements here have two possible answers.<br>'
     +'<b>Check.</b> Each pair adds to one. And the three Pauli means are $\\langle Z\\rangle=0.36-0.64=-0.28$, $\\langle X\\rangle=0$, $\\langle Y\\rangle=2\\operatorname{Im}\\left(\\tfrac35\\cdot\\tfrac{4i}{5}\\right)=\\tfrac{24}{25}=0.96$, and $0.28^{2}+0.96^{2}=1$ exactly — the Bloch vector of a pure state has length one, which is a check on all three at once.',
  err:'Writing $p(1)=\\left(\\tfrac{4i}{5}\\right)^{2}=-\\tfrac{16}{25}$. A probability cannot be negative, and the modulus is what stops it.',
  teach:'Part (b) is the one worth marking carefully. The phase that made no difference to $Z$ has moved the state onto the equator, and a student who reports $p(+)=0.36$ has used the wrong basis vectors.' },

{ id:'D2-02', module:'M2', type:'born', src:'L5 · Stern-Gerlach experiment',
  stem:'A qubit in $|0\\rangle$ is measured along the direction $\\mathbf{n}=(\\sin\\alpha,\\,0,\\,\\cos\\alpha)$.',
  parts:['Write the two projectors of that measurement.',
         'Give $p(+1)$ as a function of $\\alpha$, and evaluate it at $\\alpha=60^{\\circ}$.',
         'At which $\\alpha$ is the measurement a fair coin?'],
  sol:'<b>Given.</b> A definite $Z$ state, and an instrument tilted by $\\alpha$.<br>'
     +'<b>Method.</b> Build $P_{\\pm}=\\tfrac12(I\\pm\\mathbf{n}\\cdot\\boldsymbol\\sigma)$, then use $p(\\pm)=\\tfrac12(1\\pm\\mathbf{n}\\cdot\\mathbf{r})$ with $\\mathbf{r}=(0,0,1)$.<br>'
     +'<b>Solution — (a).</b> $\\mathbf{n}\\cdot\\boldsymbol\\sigma=\\sin\\alpha\\,X+\\cos\\alpha\\,Z$, so $P_{\\pm}=\\tfrac12\\left(I\\pm\\sin\\alpha\\,X\\pm\\cos\\alpha\\,Z\\right)$.<br>'
     +'<b>Solution — (b).</b> $\\mathbf{n}\\cdot\\mathbf{r}=\\cos\\alpha$, so $p(+1)=\\tfrac12(1+\\cos\\alpha)=\\cos^{2}(\\alpha/2)$. At $\\alpha=60^{\\circ}$ this is $\\cos^{2}30^{\\circ}=\\tfrac34$.<br>'
     +'<b>Solution — (c).</b> $\\cos\\alpha=0$, that is $\\alpha=90^{\\circ}$: the instrument is aimed along $X$ and a $Z$ eigenstate is maximally uncertain there.<br>'
     +'<b>Check.</b> $\\alpha=0$ gives $p(+1)=1$, which is the $Z$ measurement of a $Z$ eigenstate; $\\alpha=180^{\\circ}$ gives $0$, the instrument turned upside down. Both ends are right, so the formula between them is doing the right thing.',
  err:'Answering $\\cos^{2}\\alpha$ rather than $\\cos^{2}(\\alpha/2)$. The half angle is the angle between the two <em>states</em>; $\\alpha$ is the angle between the two <em>directions</em>, and they differ by a factor of two.',
  teach:'Ask what $p(+1)$ is at $\\alpha=180^{\\circ}$ before the algebra. A student who expects $1$ there has not separated the vector from the state.' },

{ id:'D2-03', module:'M2', type:'born', src:'L4 · three standard qubit bases',
  stem:'A qubit is prepared in $|{+}i\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right)$.',
  parts:['Give the outcome probabilities for a $Z$ measurement.',
         'Give them for an $X$ measurement.',
         'Give them for a $Y$ measurement, and say what the three answers together mean.'],
  sol:'<b>Given.</b> A state on the equator, a quarter turn from $|+\\rangle$.<br>'
     +'<b>Method.</b> One basis at a time, written out before use.<br>'
     +'<b>Solution — (a).</b> $\\left|\\tfrac{1}{\\sqrt2}\\right|^{2}=\\tfrac12$ for each: a fair coin.<br>'
     +'<b>Solution — (b).</b> $\\langle+|{+}i\\rangle=\\tfrac12(1+i)$, so $p(+)=\\tfrac12$, and likewise $p(-)=\\tfrac12$: a fair coin again.<br>'
     +'<b>Solution — (c).</b> $|{+}i\\rangle$ is the $+1$ eigenstate of $Y$, so $p(+i)=1$ and $p(-i)=0$. The three answers together say the Bloch vector is $\\mathbf{r}=(0,1,0)$: certain along one axis and maximally uncertain along the other two.<br>'
     +'<b>Check.</b> $|\\mathbf{r}|=1$, as a pure state requires. And it had to be: a state certain along one axis is at the end of that axis, and the other two components of a unit vector are then zero.',
  err:'Reporting $p(+)=1$ for the $X$ measurement, because "$|{+}i\\rangle$ looks like $|+\\rangle$". The $i$ turns the state by a quarter turn around the equator, which is exactly far enough to make $X$ a coin.',
  teach:'This question is the fastest way to show that three measurements are needed to pin down one qubit state. Two of them return no information here at all.' },

/* ---- the state afterwards ------------------------------------------- */

{ id:'D2-04', module:'M2', type:'update', src:'L5 · projective measurement',
  stem:'A qubit is prepared in $|\\psi\\rangle=\\tfrac{\\sqrt3}{2}|0\\rangle+\\tfrac12|1\\rangle$ and measured in the $X$ basis.',
  parts:['Give the two outcome probabilities.',
         'Give the state after each outcome.',
         'The outcome was $+1$. A $Z$ measurement now follows. Give its probabilities.'],
  sol:'<b>Given.</b> A real superposition, measured in a basis that mixes both terms.<br>'
     +'<b>Method.</b> Born rule for (a), the update rule for (b), then start again from the new state.<br>'
     +'<b>Solution — (a).</b> $\\langle+|\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\left(\\tfrac{\\sqrt3}{2}+\\tfrac12\\right)=\\tfrac{\\sqrt3+1}{2\\sqrt2}$, so $p(+)=\\tfrac{2+\\sqrt3}{4}\\approx0.9330$ and $p(-)=\\tfrac{2-\\sqrt3}{4}\\approx0.0670$.<br>'
     +'<b>Solution — (b).</b> The projectors are rank one, so the state afterwards is $|+\\rangle$ or $|-\\rangle$ — whichever outcome came back, and nothing else about the old state survives.<br>'
     +'<b>Solution — (c).</b> From $|+\\rangle$, a $Z$ measurement gives $\\tfrac12$ and $\\tfrac12$.<br>'
     +'<b>Check.</b> $\\tfrac{2+\\sqrt3}{4}+\\tfrac{2-\\sqrt3}{4}=1$: the $\\sqrt3$ cancels, which it can only do if both coefficients are right. And part (c) does not depend on part (a) at all, which is the whole content of a rank-one update.',
  err:'Carrying the original state into part (c) and answering $\\tfrac34$ and $\\tfrac14$. The $X$ measurement replaced it; the numbers from before the measurement no longer describe anything.',
  teach:'Ask part (c) for the outcome $-1$ as well. The answer is the same, and seeing that surprises students who expect the rarer outcome to leave a different state.' },

{ id:'D2-05', module:'M2', type:'update', src:'L5 · compatibility, commutators and uncertainty',
  stem:'A qubit is prepared in $|0\\rangle$. Three measurements are made in a row: $Z$, then $X$, then $Z$ again.',
  parts:['Give the outcome of the first measurement and its probability.',
         'Give the probabilities of the second, and the state after each.',
         'Give the probability that the third measurement agrees with the first.',
         'Give the same probability when the middle measurement is omitted.'],
  sol:'<b>Given.</b> A definite $Z$ state and a sequence of three ideal measurements.<br>'
     +'<b>Method.</b> Follow each branch: probability, then updated state, then the next measurement from that state.<br>'
     +'<b>Solution — (a).</b> The state is the $+1$ eigenstate of $Z$, so the outcome is $+1$ with probability one.<br>'
     +'<b>Solution — (b).</b> $|\\langle\\pm|0\\rangle|^{2}=\\tfrac12$ each, leaving $|+\\rangle$ or $|-\\rangle$.<br>'
     +'<b>Solution — (c).</b> From either of those, $|\\langle0|\\pm\\rangle|^{2}=\\tfrac12$. Both branches give $\\tfrac12$, so the total is $\\tfrac12\\cdot\\tfrac12+\\tfrac12\\cdot\\tfrac12=\\tfrac12$.<br>'
     +'<b>Solution — (d).</b> Without the middle measurement, the second $Z$ measurement is an immediate repeat and returns $+1$ with probability one.<br>'
     +'<b>Check.</b> The two answers differ by a half, and no noise was introduced anywhere: every operation was an ideal measurement on a closed system. The difference is entirely $[Z,X]\\ne0$.',
  err:'Answering (c) with one, on the grounds that the qubit "was" in $|0\\rangle$ and nothing was done to it. Something was done to it: a measurement of an incompatible observable, which is not a passive act.',
  teach:'This is the cleanest available demonstration that measurement is a physical operation. It is worth setting before the uncertainty relation rather than after it.' },

{ id:'D2-06', module:'M2', type:'update', src:'L5 · general measurements: POVMs and instruments',
  stem:'A readout reports the wrong bit with probability $\\epsilon=0.05$, in either direction, so its effects are $E_{0}=(1-\\epsilon)|0\\rangle\\langle0|+\\epsilon|1\\rangle\\langle1|$ and $E_{1}=I-E_{0}$.',
  parts:['Give the probability of reporting $0$ for a qubit truly in $|0\\rangle$.',
         'For a state with true $p(0)=q$, give the reported probability.',
         'A long run reports $0$ a fraction $0.62$ of the time. Give the corrected estimate of $q$, and say what the correction does to the error bar.'],
  sol:'<b>Given.</b> A symmetric assignment error of five per cent.<br>'
     +'<b>Method.</b> Sandwich the effect; the answer is linear in $q$, so invert the line.<br>'
     +'<b>Solution — (a).</b> $\\langle0|E_{0}|0\\rangle=1-\\epsilon=0.95$.<br>'
     +'<b>Solution — (b).</b> $p_{\\text{rep}}(0)=(1-\\epsilon)q+\\epsilon(1-q)=\\epsilon+(1-2\\epsilon)q=0.05+0.9\\,q$.<br>'
     +'<b>Solution — (c).</b> $q=(0.62-0.05)/0.9=0.6333$. Inverting divides by $0.9$, so every error is multiplied by $1/0.9=1.111$: the corrected estimate is unbiased and about eleven per cent noisier.<br>'
     +'<b>Check.</b> $E_{0}+E_{1}=I$ and both are positive, so this is a legal measurement. At $\\epsilon=\\tfrac12$ the slope is zero, the correction divides by zero, and the instrument has indeed stopped reporting anything about the state — the formula fails exactly where the device does.',
  err:'Reporting the corrected number without widening the error bar. Mitigation removes a bias and buys it with variance, and a corrected value quoted at the raw precision claims an accuracy the run does not have.',
  teach:'Worth extending: with an asymmetric error the two rows differ and the correction is a matrix inversion, whose condition number is what the last sentence of the solution is really about.' },

/* ---- expectation and variance --------------------------------------- */

{ id:'D2-07', module:'M2', type:'expect', src:'L5 · expectation values and variance',
  stem:'A qubit is in $|\\psi\\rangle=\\tfrac{\\sqrt3}{2}|0\\rangle+\\tfrac12|1\\rangle$.',
  parts:['Give $\\langle Z\\rangle$.',
         'Give $\\langle X\\rangle$ and $\\langle Y\\rangle$.',
         'Give the Bloch vector and check it.'],
  sol:'<b>Given.</b> A real superposition of the two computational states.<br>'
     +'<b>Method.</b> For $Z$, weight the eigenvalues by their probabilities. For $X$ and $Y$, use $\\langle X\\rangle=2\\operatorname{Re}(c_{0}^{*}c_{1})$ and $\\langle Y\\rangle=2\\operatorname{Im}(c_{0}^{*}c_{1})$, which are the sandwiches written out.<br>'
     +'<b>Solution — (a).</b> $p(0)=\\tfrac34$ and $p(1)=\\tfrac14$, so $\\langle Z\\rangle=\\tfrac34-\\tfrac14=\\tfrac12$.<br>'
     +'<b>Solution — (b).</b> $c_{0}^{*}c_{1}=\\tfrac{\\sqrt3}{2}\\cdot\\tfrac12=\\tfrac{\\sqrt3}{4}$, which is real, so $\\langle X\\rangle=\\tfrac{\\sqrt3}{2}\\approx0.866$ and $\\langle Y\\rangle=0$.<br>'
     +'<b>Solution — (c).</b> $\\mathbf{r}=\\left(\\tfrac{\\sqrt3}{2},\\,0,\\,\\tfrac12\\right)$.<br>'
     +'<b>Check.</b> $\\tfrac34+0+\\tfrac14=1$, so $|\\mathbf{r}|=1$ and the state is pure — which it is, being a single vector. The check uses all three numbers at once, so it catches a slip in any of them.',
  err:'Computing $\\langle X\\rangle$ as $p(+)-p(-)$ with the $Z$ probabilities. The two bases are different; the weights have to come from the $X$ basis, and $2\\operatorname{Re}(c_{0}^{*}c_{1})$ is that calculation done in one step.',
  teach:'The state is at polar angle $60^{\\circ}$ with no relative phase, so it lies in the $xz$ plane — which is why $\\langle Y\\rangle$ vanished. Saying so afterwards makes the arithmetic feel less arbitrary.' },

{ id:'D2-08', module:'M2', type:'expect', src:'L5 · expectation values and variance',
  stem:'Continue with $|\\psi\\rangle=\\tfrac{\\sqrt3}{2}|0\\rangle+\\tfrac12|1\\rangle$, for which $\\langle Z\\rangle=\\tfrac12$, $\\langle X\\rangle=\\tfrac{\\sqrt3}{2}$ and $\\langle Y\\rangle=0$.',
  parts:['Give $\\operatorname{Var}(Z)$ and $\\Delta Z$.',
         'Give $\\operatorname{Var}(X)$ and $\\Delta X$.',
         'Give $\\Delta X\\,\\Delta Z$ and the Robertson bound, and say what the comparison shows.'],
  sol:'<b>Given.</b> The three Pauli means of the previous question.<br>'
     +'<b>Method.</b> Every Pauli squares to the identity, so $\\operatorname{Var}(A)=1-\\langle A\\rangle^{2}$ and no second sandwich is needed.<br>'
     +'<b>Solution — (a).</b> $\\operatorname{Var}(Z)=1-\\tfrac14=\\tfrac34$, so $\\Delta Z=\\tfrac{\\sqrt3}{2}\\approx0.866$.<br>'
     +'<b>Solution — (b).</b> $\\operatorname{Var}(X)=1-\\tfrac34=\\tfrac14$, so $\\Delta X=\\tfrac12$.<br>'
     +'<b>Solution — (c).</b> The product is $\\tfrac{\\sqrt3}{4}\\approx0.433$. The bound is $\\tfrac12\\left|\\langle[X,Z]\\rangle\\right|=\\left|\\langle Y\\rangle\\right|=0$. The relation is satisfied and it says nothing: a bound of zero forbids nothing at all.<br>'
     +'<b>Check.</b> $\\operatorname{Var}(X)+\\operatorname{Var}(Z)=\\tfrac14+\\tfrac34=1$, which for a pure state with $\\langle Y\\rangle=0$ is $2-|\\mathbf{r}|^{2}-\\langle Y\\rangle^{2}$ evaluated at $|\\mathbf{r}|=1$. Both variances agree with the Bloch vector of the previous question.',
  err:'Concluding from part (c) that the uncertainty relation has failed, or that the state has beaten it. A bound of zero is a true statement with no content, and this state is simply one where the relation has nothing to say.',
  teach:'Set the same question on $|{+}i\\rangle$, where the bound is one and the product is one: the relation is then saturated. Seeing both cases is what stops the relation being memorised as a slogan.' },

{ id:'D2-09', module:'M2', type:'expect', src:'L5 · expectation values and variance',
  stem:'An observable and a state are $$H=\\begin{bmatrix}2&1-i\\\\1+i&3\\end{bmatrix}, \\qquad |\\psi\\rangle=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1\\\\i\\end{bmatrix}.$$',
  parts:['Give $\\langle H\\rangle$.',
         'Give $\\langle H^{2}\\rangle$ and $\\operatorname{Var}(H)$.',
         'Give the eigenvalues of $H$, and say what they show about the answer to (a).'],
  sol:'<b>Given.</b> A Hermitian observable that is not a Pauli operator.<br>'
     +'<b>Method.</b> Sandwich directly; there is no shortcut, because $H^{2}\\ne I$.<br>'
     +'<b>Solution — (a).</b> $H|\\psi\\rangle=\\tfrac{1}{\\sqrt2}(3+i,\\;1+4i)$, so $\\langle\\psi|H|\\psi\\rangle=\\tfrac12\\left[(3+i)+(-i)(1+4i)\\right]=\\tfrac12(3+4)=\\tfrac72$.<br>'
     +'<b>Solution — (b).</b> $H^{2}=\\begin{bmatrix}6&5-5i\\\\5+5i&11\\end{bmatrix}$, and the same sandwich gives $\\langle H^{2}\\rangle=\\tfrac{27}{2}$. So $\\operatorname{Var}(H)=\\tfrac{27}{2}-\\left(\\tfrac72\\right)^{2}=\\tfrac{54-49}{4}=\\tfrac54$ and $\\Delta H=\\tfrac{\\sqrt5}{2}\\approx1.118$.<br>'
     +'<b>Solution — (c).</b> $\\operatorname{tr}H=5$ and $\\det H=6-(1-i)(1+i)=4$, so $\\lambda^{2}-5\\lambda+4=0$ and $\\lambda=1$ or $4$. The mean $3.5$ is between them and is neither of them: the instrument returns $1$ or $4$ and never $3.5$.<br>'
     +'<b>Check.</b> The eigenvalue route: $p(4)\\cdot4+p(1)\\cdot1=3.5$ needs $p(4)=\\tfrac56$, and then the variance is $\\tfrac56(4-3.5)^{2}+\\tfrac16(1-3.5)^{2}=\\tfrac56\\cdot0.25+\\tfrac16\\cdot6.25=\\tfrac54$. Both quantities agree with the matrix route.',
  err:'Computing $\\langle H^{2}\\rangle$ as $\\langle H\\rangle^{2}$ and reporting a variance of zero. The operator is squared before the sandwich; squaring the number afterwards is the other term of the same formula.',
  teach:'The check is the point of the question: the two routes are genuinely different calculations and agreeing is evidence. Ask for the probabilities explicitly if the class is quick.' },

/* ---- commutators ---------------------------------------------------- */

{ id:'D2-10', module:'M2', type:'commute', src:'L5 · Pauli algebra',
  stem:'Use the Pauli product rule $\\sigma_{i}\\sigma_{j}=\\delta_{ij}I+i\\varepsilon_{ijk}\\sigma_{k}$.',
  parts:['Give $[X,Y]$, $[Y,Z]$ and $[Z,X]$.',
         'Give the anticommutator $\\{X,Y\\}$.',
         'Do $X$ and $Y$ share an eigenvector? Say how the answer follows from (a).'],
  sol:'<b>Given.</b> The three Pauli operators and one rule.<br>'
     +'<b>Method.</b> Read the cyclic order $X\\to Y\\to Z\\to X$: with the arrow the product is $+i$ times the third, against it $-i$ times.<br>'
     +'<b>Solution — (a).</b> $XY=iZ$ and $YX=-iZ$, so $[X,Y]=2iZ$. By cycling, $[Y,Z]=2iX$ and $[Z,X]=2iY$.<br>'
     +'<b>Solution — (b).</b> $XY+YX=iZ-iZ=0$: the two anticommute.<br>'
     +'<b>Solution — (c).</b> No. If $|v\\rangle$ were an eigenvector of both, $[X,Y]|v\\rangle$ would be zero, but $[X,Y]|v\\rangle=2iZ|v\\rangle$ and $Z$ annihilates nothing — it is unitary. So no such vector exists.<br>'
     +'<b>Check.</b> By matrices, $XY=\\begin{bmatrix}i&0\\\\0&-i\\end{bmatrix}=iZ$, which is the rule with $\\varepsilon_{xyz}=+1$. The argument in (c) needs only that $Z$ has no zero eigenvalue, and it does not.',
  err:'Answering $[X,Y]=iZ$, which is the product rather than the commutator. The commutator is the difference of the two orders, and the factor of two comes from subtracting $-iZ$.',
  teach:'Part (c) is the general argument, not a fact about Paulis: two operators with a commutator that has no kernel share no eigenvector at all. It is worth stating that way.' },

{ id:'D2-11', module:'M2', type:'commute', src:'L5 · compatibility, commutators and uncertainty',
  stem:'Two pairs of observables are $A=Z$ with $B=3Z+2I$, and $A=Z$ with $B=X$.',
  parts:['Give $[Z,\\,3Z+2I]$.',
         'Give the common eigenvectors of the first pair, with the eigenvalue of each observable.',
         'Give $[Z,X]$, and say whether any state makes both readings certain.'],
  sol:'<b>Given.</b> One compatible pair and one incompatible pair.<br>'
     +'<b>Method.</b> Expand each commutator by linearity; $Z$ commutes with itself and with the identity.<br>'
     +'<b>Solution — (a).</b> $[Z,3Z+2I]=3[Z,Z]+2[Z,I]=0$.<br>'
     +'<b>Solution — (b).</b> $|0\\rangle$, with $Z=+1$ and $B=5$; and $|1\\rangle$, with $Z=-1$ and $B=-1$. Both readings are certain on both states, and the order of the two measurements does not matter.<br>'
     +'<b>Solution — (c).</b> $[Z,X]=2iY\\ne0$, so no state is an eigenvector of both and no preparation makes both certain.<br>'
     +'<b>Check.</b> $B=3Z+2I$ is a function of $Z$, and every function of an operator shares its eigenvectors with $f(\\lambda_{k})$ as the eigenvalues: $3(+1)+2=5$ and $3(-1)+2=-1$, which is what (b) found. Any two observables that are functions of one another commute, and this is the simplest instance.',
  err:'Concluding from part (a) that $Z$ and $B$ are the same observable. They are not — their eigenvalues differ — but they are simultaneously measurable, which is what commuting means.',
  teach:'Worth pointing out that part (a) is not a coincidence: measuring $Z$ and computing $3z+2$ from the answer <em>is</em> measuring $B$, and that is what compatibility looks like in practice.' },

{ id:'D2-12', module:'M2', type:'commute', src:'L5 · Robertson uncertainty relation',
  stem:'A qubit is in $|{+}i\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right)$.',
  parts:['Give $\\langle X\\rangle$, $\\langle Y\\rangle$ and $\\langle Z\\rangle$.',
         'Give $\\Delta X$ and $\\Delta Z$.',
         'Compare $\\Delta X\\,\\Delta Z$ with $\\tfrac12\\left|\\langle[X,Z]\\rangle\\right|$.'],
  sol:'<b>Given.</b> The $+1$ eigenstate of $Y$.<br>'
     +'<b>Method.</b> The Bloch vector first; every other quantity follows from it.<br>'
     +'<b>Solution — (a).</b> $\\mathbf{r}=(0,1,0)$, so $\\langle X\\rangle=0$, $\\langle Y\\rangle=1$, $\\langle Z\\rangle=0$.<br>'
     +'<b>Solution — (b).</b> $\\operatorname{Var}(A)=1-\\langle A\\rangle^{2}$ for a Pauli, so $\\Delta X=\\Delta Z=1$.<br>'
     +'<b>Solution — (c).</b> The product is $1$. Since $[X,Z]=-2iY$, the bound is $\\left|\\langle Y\\rangle\\right|=1$. The two are equal: the relation is saturated, and no state does better for this pair.<br>'
     +'<b>Check.</b> $|\\mathbf{r}|=1$ as a pure state requires. And the saturation is not luck: the bound is largest when $\\left|\\langle Y\\rangle\\right|=1$, which forces the other two means to zero, which makes both spreads as large as they can be. Both sides are at their extremes at once.',
  err:'Taking the bound to be $\\tfrac12|{-}2i|=1$ without the expectation value, and getting the right answer here for the wrong reason. The bound is $\\tfrac12|\\langle[X,Z]\\rangle|$ and depends on the state; on $|0\\rangle$ the same expression is zero.',
  teach:'Set this immediately after D2-08, which is the same calculation on a state where the bound is empty. The pair is worth more than either question alone.' },

/* ---- evolution ------------------------------------------------------- */

{ id:'D2-13', module:'M2', type:'evolve', src:'L5 · closed-system time evolution',
  stem:'A qubit evolves under $H=\\tfrac{\\omega}{2}Z$ from the initial state $|+\\rangle$.',
  parts:['Give $U(t)$.',
         'Give $|\\psi(t)\\rangle$, with the global phase removed.',
         'Give $P(0)$ and $P(+)$ as functions of $t$.',
         'Give the first time at which the state is $|-\\rangle$.'],
  sol:'<b>Given.</b> A Hamiltonian along $z$, and a starting state on the equator.<br>'
     +'<b>Method.</b> The closed form with $\\mathbf{n}=\\hat z$ and $\\Omega=\\omega$.<br>'
     +'<b>Solution — (a).</b> $U(t)=\\cos\\tfrac{\\omega t}{2}I-i\\sin\\tfrac{\\omega t}{2}Z=\\operatorname{diag}\\left(e^{-i\\omega t/2},\\,e^{i\\omega t/2}\\right)$.<br>'
     +'<b>Solution — (b).</b> $|\\psi(t)\\rangle=\\tfrac{1}{\\sqrt2}\\left(e^{-i\\omega t/2}|0\\rangle+e^{i\\omega t/2}|1\\rangle\\right)\\equiv\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+e^{i\\omega t}|1\\rangle\\right)$.<br>'
     +'<b>Solution — (c).</b> The two moduli never change, so $P(0)=\\tfrac12$ at every time. In the $X$ basis, $P(+)=\\left|\\tfrac{1+e^{i\\omega t}}{2}\\right|^{2}=\\cos^{2}\\tfrac{\\omega t}{2}$.<br>'
     +'<b>Solution — (d).</b> $P(+)=0$ first at $\\omega t=\\pi$, that is $t=\\pi/\\omega$.<br>'
     +'<b>Check.</b> At $t=0$ the state is $|+\\rangle$ and $P(+)=1$; at $t=2\\pi/\\omega$ it is back. The Bloch vector is $(\\cos\\omega t,\\,\\sin\\omega t,\\,0)$, of length one at every time, and it turns once per period — which is what a Hamiltonian along $z$ should do.',
  err:'Reporting that nothing happens because $P(0)$ is constant. Everything happens; it is entirely in the relative phase, and only a measurement that mixes the two levels can see it.',
  teach:'Ask which single measurement would show a flat line and which would show the oscillation, before the algebra. It is the same distinction as D2-03.' },

{ id:'D2-14', module:'M2', type:'evolve', src:'L5 · stationary states and superpositions',
  stem:'A system has $H|E_{1}\\rangle=E_{1}|E_{1}\\rangle$ and $H|E_{2}\\rangle=E_{2}|E_{2}\\rangle$, with $E_{2}>E_{1}$.',
  parts:['Show that $|E_{1}\\rangle$ is stationary.',
         'Give $|\\psi(t)\\rangle$ for the initial state $\\tfrac{1}{\\sqrt2}\\left(|E_{1}\\rangle+|E_{2}\\rangle\\right)$, with the global phase removed.',
         'Give the period of any observable quantity, and say what happens to it when both energies are raised by the same amount.'],
  sol:'<b>Given.</b> Two energy eigenstates and an equal superposition of them.<br>'
     +'<b>Method.</b> The exponential acts on the eigenvalues; then pull out one phase as global.<br>'
     +'<b>Solution — (a).</b> $|E_{1}(t)\\rangle=e^{-iE_{1}t}|E_{1}\\rangle$, which differs from $|E_{1}\\rangle$ by a global phase. Every probability of every measurement is therefore unchanged for all time.<br>'
     +'<b>Solution — (b).</b> $\\tfrac{1}{\\sqrt2}\\left(e^{-iE_{1}t}|E_{1}\\rangle+e^{-iE_{2}t}|E_{2}\\rangle\\right)\\equiv\\tfrac{1}{\\sqrt2}\\left(|E_{1}\\rangle+e^{-i(E_{2}-E_{1})t}|E_{2}\\rangle\\right)$.<br>'
     +'<b>Solution — (c).</b> The relative phase returns after $(E_{2}-E_{1})T=2\\pi$, so $T=2\\pi/(E_{2}-E_{1})$. Raising both energies by $c$ multiplies the state by $e^{-ict}$, a global phase, and leaves $T$ untouched.<br>'
     +'<b>Check.</b> Part (a) is part (c) with the two energies equal: the difference is zero, the period is infinite, and nothing ever happens. The two answers are the same statement.',
  err:'Reporting a period of $2\\pi/E_{2}$, using one energy rather than the difference. Only differences are observable, and part (c) is the demonstration.',
  teach:'This is the whole of spectroscopy in one question: every line an experiment sees is a difference, and the zero of energy is a convention.' },

{ id:'D2-15', module:'M2', type:'evolve', src:'L5 · driven qubit: Hamiltonians become gates',
  stem:'A qubit starting in $|0\\rangle$ is driven on resonance by $H=\\tfrac{\\Omega}{2}X$.',
  parts:['Give $U(t)$.',
         'Give $P(1)$ as a function of $t$.',
         'Give the first time at which the qubit has been flipped, and the operator $U$ is then equal to.',
         'Give the first time at which the state is an even superposition.'],
  sol:'<b>Given.</b> A drive along $x$ and a starting state along $z$.<br>'
     +'<b>Method.</b> The closed form with $\\mathbf{n}=\\hat x$; then one Born rule.<br>'
     +'<b>Solution — (a).</b> $U(t)=\\cos\\tfrac{\\Omega t}{2}I-i\\sin\\tfrac{\\Omega t}{2}X$.<br>'
     +'<b>Solution — (b).</b> $U(t)|0\\rangle=\\cos\\tfrac{\\Omega t}{2}|0\\rangle-i\\sin\\tfrac{\\Omega t}{2}|1\\rangle$, so $P(1)=\\sin^{2}\\tfrac{\\Omega t}{2}$.<br>'
     +'<b>Solution — (c).</b> $P(1)=1$ first at $\\Omega t=\\pi$, that is $t=\\pi/\\Omega$. There $U=-iX$, which is the bit flip up to a global phase — a $\\pi$ pulse.<br>'
     +'<b>Solution — (d).</b> $P(1)=\\tfrac12$ first at $\\Omega t=\\pi/2$, that is $t=\\pi/(2\\Omega)$: a $\\pi/2$ pulse.<br>'
     +'<b>Check.</b> At $\\Omega t=2\\pi$, $U=-I$ and the qubit is back in $|0\\rangle$ with a sign: the full turn of chapter 1, in a laboratory. And $P(0)+P(1)=\\cos^{2}+\\sin^{2}=1$ at every time.',
  err:'Answering $t=2\\pi/\\Omega$ for the flip, by setting $\\Omega t$ rather than $\\Omega t/2$ to $\\pi$. The half angle is in the exponent and every pulse-length calculation in the subject depends on it.',
  teach:'The $-i$ in front of $X$ is the question students ask about. It is a global phase, so the pulse really is a bit flip — and the same phase stops being ignorable in chapter 5, when the pulse becomes one branch of a controlled operation.' },

{ id:'D2-16', module:'M2', type:'evolve', src:'L5 · driven qubit: Hamiltonians become gates',
  stem:'The same qubit is driven off resonance, by $H=\\tfrac12\\left(\\Omega_{x}X+\\Delta Z\\right)$ with $\\Omega_{x}=1$ and $\\Delta=1$, starting from $|0\\rangle$.',
  parts:['Give the generalised rate $\\Omega$ and the rotation axis $\\mathbf{n}$.',
         'Give the largest value $P(1)$ ever reaches.',
         'Give the first time at which it reaches that value.',
         'Say what a $\\pi$ pulse calibrated on resonance does here.'],
  sol:'<b>Given.</b> A drive with an equal detuning.<br>'
     +'<b>Method.</b> Collect the Hamiltonian into $\\tfrac{\\Omega}{2}\\mathbf{n}\\cdot\\boldsymbol\\sigma$; the amplitude of the oscillation is then $(\\Omega_{x}/\\Omega)^{2}$.<br>'
     +'<b>Solution — (a).</b> $\\Omega=\\sqrt{1^{2}+1^{2}}=\\sqrt2$, and $\\mathbf{n}=\\tfrac{1}{\\sqrt2}(1,0,1)$: an axis at $45^{\\circ}$ between $x$ and $z$.<br>'
     +'<b>Solution — (b).</b> $P(1)=\\left(\\tfrac{\\Omega_{x}}{\\Omega}\\right)^{2}\\sin^{2}\\tfrac{\\Omega t}{2}$, so the ceiling is $\\left(1/\\sqrt2\\right)^{2}=\\tfrac12$.<br>'
     +'<b>Solution — (c).</b> $\\sin^{2}$ is one first at $\\Omega t=\\pi$, that is $t=\\pi/\\sqrt2\\approx2.221$.<br>'
     +'<b>Solution — (d).</b> A resonant $\\pi$ pulse runs for $t=\\pi/\\Omega_{x}=\\pi$. Here $\\Omega t=\\sqrt2\\pi$, so $P(1)=\\tfrac12\\sin^{2}\\left(\\pi/\\sqrt2\\right)=\\tfrac12(0.6331)=0.3166$. The pulse fails in two ways at once: it is the wrong length and it turns about the wrong axis.<br>'
     +'<b>Check.</b> Setting $\\Delta=0$ recovers $\\Omega=\\Omega_{x}$, a ceiling of one, and a flip at $t=\\pi/\\Omega_{x}$ — which is the previous question. The detuned formula contains the resonant one, as it must.',
  err:'Reporting a ceiling of one because "the drive is still there". The drive competes with the detuning, and only the component of the axis in the equator can move the population across.',
  teach:'Laboratory D is this question with the two numbers on sliders. Setting the question first and the laboratory second is worth more than the other order.' },

/* ---- shots ----------------------------------------------------------- */

{ id:'D2-17', module:'M2', type:'shots', src:'L5 · finite-shot estimation',
  stem:'A circuit whose true outcome probability is near $\\tfrac12$ is run for $N=10\\,000$ shots.',
  parts:['Give the standard error of the estimated probability.',
         'Give the number of shots needed to reach a standard error of $0.001$.',
         'The readout has a known bias of $0.02$. Say what running more shots does to it.'],
  sol:'<b>Given.</b> A binary outcome with $p\\approx\\tfrac12$.<br>'
     +'<b>Method.</b> $\\mathrm{SE}=\\sqrt{p(1-p)/N}$, which at $p=\\tfrac12$ is $1/(2\\sqrt N)$.<br>'
     +'<b>Solution — (a).</b> $\\mathrm{SE}=1/(2\\sqrt{10^{4}})=1/200=0.005$.<br>'
     +'<b>Solution — (b).</b> $N=1/(4\\,\\mathrm{SE}^{2})=1/(4\\times10^{-6})=250\\,000$.<br>'
     +'<b>Solution — (c).</b> Nothing. A bias is a systematic error: more shots make the wrong number more precise. The estimate converges to $p+0.02$ rather than to $p$, and the error bar shrinks around the wrong value.<br>'
     +'<b>Check.</b> Twenty-five times the shots for five times the precision, and $25=5^{2}$: the square-root law, read backwards. And at $N=250\\,000$ the sampling error is $0.001$ while the bias is still $0.02$ — twenty times larger, so the run is entirely limited by the thing more shots cannot fix.',
  err:'Reporting the corrected precision as $0.001$ when the bias is $0.02$. The uncertainty of a measurement is not the smaller of its two error sources.',
  teach:'Part (c) is the one worth arguing about in class. The number that matters in a real experiment is almost never the one the square root gives.' },

{ id:'D2-18', module:'M2', type:'shots', src:'L5 · finite-shot estimation',
  stem:'The expectation value of a Pauli observable is estimated from $N$ shots by averaging the $\\pm1$ readings. The true value is $\\langle X\\rangle=0.8$.',
  parts:['Give $p(+1)$.',
         'Give the standard error of the estimate for $N=1000$.',
         'Give the number of shots needed for a standard error of $0.01$.'],
  sol:'<b>Given.</b> A $\\pm1$ observable with a known mean.<br>'
     +'<b>Method.</b> A $\\pm1$ variable has $\\operatorname{Var}=1-\\langle X\\rangle^{2}$, so the standard error of the mean is $\\sqrt{(1-\\langle X\\rangle^{2})/N}$.<br>'
     +'<b>Solution — (a).</b> $\\langle X\\rangle=p(+1)-p(-1)$ and the two add to one, so $p(+1)=\\tfrac{1+0.8}{2}=0.9$.<br>'
     +'<b>Solution — (b).</b> $\\mathrm{SE}=\\sqrt{(1-0.64)/1000}=\\sqrt{3.6\\times10^{-4}}=0.019$.<br>'
     +'<b>Solution — (c).</b> $N=(1-0.64)/10^{-4}=3600$.<br>'
     +'<b>Check.</b> The same numbers through the probability: $\\mathrm{SE}(p)=\\sqrt{0.9\\times0.1/1000}=0.0095$, and $\\langle X\\rangle=2p-1$ doubles it to $0.019$. Two routes, one answer.',
  err:'Using $\\sqrt{p(1-p)/N}$ for the expectation value directly, and reporting half the correct error. The estimator is $2\\hat p-1$, and multiplying an estimate by two multiplies its error by two.',
  teach:'A mean near $\\pm1$ is cheap and a mean near zero is dear, which is the opposite of the intuition students bring. Worth asking for the shot count at $\\langle X\\rangle=0$ as a follow-up: it is $10\\,000$.' },

/* ---- full-length ----------------------------------------------------- */

{ id:'D2-19', module:'M2', type:'full', src:'L4 · three standard qubit bases',
  stem:'A qubit is prepared in $|\\psi\\rangle=\\cos\\tfrac{\\theta}{2}|0\\rangle+e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|1\\rangle$ with $\\theta=\\tfrac{\\pi}{2}$ and $\\varphi=\\tfrac{\\pi}{3}$.',
  parts:['Give the Bloch vector.',
         'Give the outcome probabilities of an $X$ measurement.',
         'Give $\\langle X\\rangle$.',
         'Give the number of shots needed to estimate $\\langle X\\rangle$ to a standard error of $0.02$.'],
  sol:'<b>Given.</b> A state on the equator at $60^{\\circ}$ from the $x$ axis.<br>'
     +'<b>Find.</b> Its vector, one measurement, one mean, and the cost of measuring it.<br>'
     +'<b>Method.</b> The Bloch vector from the angles; then the dot-product formula; then the shot count.<br>'
     +'<b>Solution — (a).</b> $\\mathbf{r}=(\\sin\\theta\\cos\\varphi,\\;\\sin\\theta\\sin\\varphi,\\;\\cos\\theta)=\\left(\\tfrac12,\\;\\tfrac{\\sqrt3}{2},\\;0\\right)$.<br>'
     +'<b>Solution — (b).</b> $p(\\pm)=\\tfrac12(1\\pm r_{x})$, so $p(+)=0.75$ and $p(-)=0.25$.<br>'
     +'<b>Solution — (c).</b> $\\langle X\\rangle=r_{x}=0.5$, which is also $0.75-0.25$.<br>'
     +'<b>Solution — (d).</b> $\\mathrm{SE}=\\sqrt{(1-0.25)/N}$, so $N=0.75/(0.02)^{2}=1875$.<br>'
     +'<b>Check.</b> $|\\mathbf{r}|^{2}=\\tfrac14+\\tfrac34+0=1$, so the state is pure. And $\\theta=\\pi/2$ put it on the equator, which is why $r_{z}=0$ and a $Z$ measurement would be a fair coin — worth noting, since a reader who measured $Z$ here would learn nothing at any shot count.',
  err:'Using $\\varphi$ as the angle from the $z$ axis. $\\theta$ is the polar angle and $\\varphi$ the azimuthal one, and swapping them puts the state somewhere else entirely.',
  teach:'Part (d) is the part that makes this an engineering question rather than an algebra one. Ask for the cost of estimating all three components: three separate runs, and the total is what state tomography costs.' },

{ id:'D2-20', module:'M2', type:'full', src:'L5 · driven qubit: Hamiltonians become gates',
  stem:'A qubit starting in $|0\\rangle$ is driven on resonance by $H=\\tfrac{\\Omega}{2}X$ with $\\Omega=2$, held for a time $t$, and then measured in the computational basis.',
  parts:['Give $|\\psi(t)\\rangle$.',
         'Give $P(1)$ and $\\langle Z\\rangle$ as functions of $t$.',
         'Give the first time at which $P(1)=\\tfrac12$.',
         'At that time, give the number of shots needed to estimate $\\langle Z\\rangle$ to a standard error of $0.05$.'],
  sol:'<b>Given.</b> A resonant drive of rate $2$, a variable pulse length, and a $Z$ readout.<br>'
     +'<b>Find.</b> The state, two functions of time, one pulse length, and the cost of the reading.<br>'
     +'<b>Method.</b> Closed form, then Born rule, then the standard error of a $\\pm1$ mean.<br>'
     +'<b>Solution — (a).</b> With $\\Omega t/2=t$, $|\\psi(t)\\rangle=\\cos t\\,|0\\rangle-i\\sin t\\,|1\\rangle$.<br>'
     +'<b>Solution — (b).</b> $P(1)=\\sin^{2}t$, and $\\langle Z\\rangle=P(0)-P(1)=\\cos^{2}t-\\sin^{2}t=\\cos 2t$.<br>'
     +'<b>Solution — (c).</b> $\\sin^{2}t=\\tfrac12$ first at $t=\\pi/4\\approx0.785$.<br>'
     +'<b>Solution — (d).</b> There $\\langle Z\\rangle=\\cos(\\pi/2)=0$, so $\\mathrm{SE}=\\sqrt{(1-0)/N}=1/\\sqrt N$ and $N=1/(0.05)^{2}=400$.<br>'
     +'<b>Check.</b> $\\langle Z\\rangle=\\cos\\Omega t$ with $\\Omega=2$, which is the Bloch vector turning about $x$ at rate $\\Omega$ — one full turn in $t=\\pi$, and $P(1)$ has period $\\pi$ because it depends on the square. The half angle again: the state has period $2\\pi/\\Omega$ and the population has half of it.',
  err:'Reading the pulse that gives $P(1)=\\tfrac12$ as the one that gives $\\langle Z\\rangle=\\tfrac12$. They are different times: $\\langle Z\\rangle$ is zero where $P(1)$ is one half, because the two outcomes are then equally likely.',
  teach:'The last part is worth doing at two other times as well. At $t$ near zero the mean is near one and the estimate is cheap; the cost peaks exactly where the pulse is half done, which is where a calibration sweep spends most of its shots.' }

]);

window.DRILL_M2 = [

{ id:'m2-drill', module:'M2', nav:'Module 2 · practice questions',
  title:'Module 2 — practice questions',
  objective:'Twenty open-ended questions with worked solutions, in the shapes the chapter sets.',
  keywords:'practice questions module 2 born rule measurement update expectation variance commutator evolution shots',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Practice D2-01 … D2-20'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step that reaches the answer a second way. In this chapter the cheap checks are: probabilities add to one, a variance is never negative, the mean of a $\\pm1$ observable lies in $[-1,1]$, the Bloch vector of a pure state has length one, and adding a multiple of the identity to a Hamiltonian changes nothing.'},
  {t:'rule', short:true},
  {t:'drill', module:'M2'}
]}

];
})();
