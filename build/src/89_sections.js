/* ==========================================================================
   NUMBERING — the contents address of every scene, and its textbook anchor.

   Two independent things live here, and they answer different questions.

   The address (`sec`) says where a scene sits in this course: chapter, section,
   scene. The chapters are the ones the lecture notes carry, so the artifact and
   the notes name the same material the same way.

   The anchor (`book`) says where the same material is developed at length in
   the course textbook. It is a reference and nothing more: no title, no
   sentence and no figure is taken from there.

   Both are declared once, here, and derived onto the scene objects at load
   time by `applyNumbering`. No scene file carries either field, so a
   renumbering is an edit to this file alone.

   The two numbering systems do not agree anywhere, and the disagreement is
   large rather than subtle: the textbook develops the qubit, the Bloch sphere
   and the whole gate set inside its chapters 1, 2 and 4, and this course
   reaches them in its chapters 2 and 4. A reader who follows a bare chapter
   number into the book lands somewhere unrelated. The mark in
   `CONTENT.BOOKMARK` is what keeps the two apart on the page, and it is not
   optional in any surface.

   A chapter appears here only once its scenes exist. A declaration naming a
   scene that has not been written prints an error at load time and leaves a
   hole in the contents, so the chapters arrive one phase at a time.
   ========================================================================== */
(function(){

/* ---- chapters ----------------------------------------------------------
   `flat:true` marks a chapter with no section level: its scenes are numbered
   two-part. Chapter 0 is the course opening, short enough that a section level
   would be an empty frame. */
CONTENT.CHAPTERS = [
  { n:'0', module:'M0', title:'The frame of the course', flat:true },
  { n:'1', module:'M1', title:'The mathematics of quantum states' },
  { n:'2', module:'M2', title:'States, measurement and dynamics' },
  { n:'3', module:'M3', title:'Mixed states and entanglement' },
  { n:'4', module:'M4', title:'The Bloch sphere and quantum gates' },
  { n:'5', module:'M5', title:'Circuits and protocols' },
  { n:'6', module:'M6', title:'Quantum algorithms' }
];

/* ---- sections ----------------------------------------------------------
   Per module, in scene order: the section number, its title, and the scene ids
   it holds. A laboratory is listed inside the section whose material it
   exercises but takes a laboratory number rather than an ordinal, so the
   ordinals of the teaching scenes around it stay unbroken.

   A flat chapter lists its scenes under a single entry with no title. The
   artifact cover is deliberately absent: it takes no address. */
CONTENT.SECTIONS = {

  M0: [
    { n:'0', ids:['m0-open','m0-what','m0-scale','m0-phase','m0-fringe','m0-map','m0-how'] }
  ],

  /* Chapter 1 carries two source lectures, so it is long. The section titles
     are what a reader scans, and they name the object being built rather than
     the theorem being proved: "building an orthonormal basis" rather than
     "Gram-Schmidt", because the reader who needs that section does not yet
     know the name. */
  M1: [
    { n:'1.0', title:'Opening',                          ids:['m1-open'] },
    { n:'1.1', title:'Vectors, dual vectors and the inner product', ids:[
        'm1-ket','m1-bra','m1-overlap','m1-basis'] },
    { n:'1.2', title:'Amplitude, phase and interference', ids:[
        'm1-amp','m1-phase','m1-lab-a'] },
    { n:'1.3', title:'Outer products and projectors',     ids:[
        'm1-outer','m1-proj','m1-resid'] },
    { n:'1.4', title:'Building an orthonormal basis',     ids:['m1-gs','m1-lab-b'] },
    { n:'1.5', title:'The tensor product',                ids:['m1-tensor','m1-expo'] },
    { n:'1.6', title:'Hermitian and unitary operators',   ids:[
        'm1-adjoint','m1-herm','m1-unit','m1-gen','m1-halfangle'] },
    { n:'1.7', title:'The spectral theorem and functions of an operator', ids:[
        'm1-eig','m1-spectral','m1-fofa'] },
    { n:'1.8', title:'Dirac notation',                    ids:['m1-dirac'] },
    { n:'1.9', title:'Summary and practice',              ids:['m1-synth','m1-shapes'] }
  ],

  /* Chapter 2 carries the other two postulates. The measurement sections come
     before the dynamics one, which is the order the source lectures use and
     also the order a reader needs: every statement about evolution in this
     course is eventually checked by a measurement, and the measurement rule
     has to be in hand before that check means anything. */
  M2: [
    { n:'2.0', title:'Opening',                           ids:['m2-open'] },
    { n:'2.1', title:'The Born rule',                     ids:[
        'm2-born','m2-bases','m2-distinguish','m2-lab-c'] },
    { n:'2.2', title:'Projective measurement',            ids:[
        'm2-proj','m2-collapse','m2-povm'] },
    { n:'2.3', title:'Observables',                       ids:['m2-obs','m2-var'] },
    { n:'2.4', title:'Compatibility and uncertainty',     ids:['m2-comm','m2-uncert'] },
    { n:'2.5', title:'The Pauli algebra',                 ids:[
        'm2-pauli','m2-paulialg','m2-ndotsigma'] },
    { n:'2.6', title:'Dynamics',                          ids:[
        'm2-schrod','m2-stationary','m2-gate','m2-lab-d'] },
    { n:'2.7', title:'Finite shots',                      ids:['m2-shots'] },
    { n:'2.8', title:'Summary and practice',              ids:['m2-synth','m2-shapes'] }
  ],

  /* Chapter 3 drops the two assumptions chapters 1 and 2 rested on, one at a
     time, and the section order is that sequence: the state need not be known,
     the system need not be closed, and the system need not be the whole of
     what it belongs to. The section titles name the object rather than the
     theorem for the same reason as chapter 1's do. Nothing here needs the
     Bloch sphere, so the chapter can be read after chapter 4 as well as
     before it, which is what the course map promises. */
  M3: [
    { n:'3.0', title:'Opening',                           ids:['m3-open'] },
    { n:'3.1', title:'The density operator',              ids:[
        'm3-rho','m3-physical','m3-expect','m3-ensemble'] },
    { n:'3.2', title:'Purity and the ball of states',     ids:['m3-purity','m3-ball'] },
    { n:'3.3', title:'Quantum channels',                  ids:[
        'm3-kraus','m3-damp','m3-dephase','m3-lab-e'] },
    { n:'3.4', title:'Relaxation and dephasing',          ids:['m3-t1t2'] },
    { n:'3.5', title:'Two systems, and one of them alone', ids:[
        'm3-order','m3-ptrace','m3-local'] },
    { n:'3.6', title:'Separability and the Schmidt decomposition', ids:[
        'm3-sep','m3-schmidt','m3-svd'] },
    { n:'3.7', title:'Entropy',                           ids:['m3-entropy'] },
    { n:'3.8', title:'Bell correlations',                 ids:[
        'm3-bell','m3-chsh','m3-violate','m3-lab-f','m3-nosig'] },
    { n:'3.9', title:'Summary and practice',              ids:['m3-synth','m3-shapes'] }
  ],

  /* Chapter 4 is one qubit drawn, and then everything that can be done to it
     read off that drawing. The section order is the order the picture is
     built: the sphere first, then a gate as a motion of it, then a sequence of
     gates, then the second qubit, which is where the picture stops helping and
     the algebra takes over. The ordering convention has a section of its own,
     restated from chapter 3, because this is where it starts producing wrong
     states rather than merely wrong labels. */
  M4: [
    { n:'4.0', title:'Opening',                           ids:['m4-open'] },
    { n:'4.1', title:'The Bloch sphere',                  ids:[
        'm4-sphere','m4-cardinal','m4-overlap','m4-glob','m4-cover'] },
    { n:'4.2', title:'Single-qubit gates as rotations',   ids:[
        'm4-rot','m4-pauli','m4-had','m4-phase'] },
    { n:'4.3', title:'Composing gates',                   ids:[
        'm4-time','m4-euler','m4-ugate','m4-lab-g'] },
    { n:'4.4', title:'Reversible embeddings',             ids:['m4-rev','m4-toffoli'] },
    { n:'4.5', title:'Two-qubit gates',                   ids:[
        'm4-order','m4-cnot','m4-cz','m4-swap'] },
    { n:'4.6', title:'Entanglement from a gate',          ids:['m4-entangle','m4-lab-h'] },
    { n:'4.7', title:'Universality',                      ids:['m4-univ'] },
    { n:'4.8', title:'Summary and practice',              ids:['m4-synth','m4-shapes'] }
  ],

  /* Chapter 5 has two halves and the section order is the join between them.
     The first three sections are the machine — what a circuit is, what a run
     gives back, and what a compiler does to it in between — in the order a
     circuit meets them. Then one section on the three-gate circuit that turns
     a phase into counts, placed there rather than in chapter 4 because it is
     the first thing in this course that is a measurement rather than an
     identity, and because both protocols after it are built on it.

     The two protocols take a section each and both run to the same shape: the
     mechanism, the derivation, the thing that is easy to get wrong, then the
     laboratory. Teleportation closes on what it costs and Grover closes on
     what its claim does and does not say, because those two scenes are the
     ones this chapter exists for. */
  M5: [
    { n:'5.0', title:'Opening',                           ids:['m5-open'] },
    { n:'5.1', title:'The circuit model',                 ids:[
        'm5-circuit','m5-model','m5-read','m5-depth'] },
    { n:'5.2', title:'Running a circuit',                 ids:[
        'm5-state','m5-shots','m5-measure','m5-feed'] },
    { n:'5.3', title:'Compiling for a machine',           ids:[
        'm5-iset','m5-transpile','m5-cost'] },
    { n:'5.4', title:'Interference in a circuit',         ids:['m5-ramsey'] },
    { n:'5.5', title:'Teleportation',                     ids:[
        'm5-nocopy','m5-tele','m5-teleid','m5-telecorr','m5-nosig','m5-teleres',
        'm5-lab-i'] },
    { n:'5.6', title:'Grover search',                     ids:[
        'm5-search','m5-kick','m5-geom','m5-rotate','m5-iter','m5-claim',
        'm5-lab-j'] },
    { n:'5.7', title:'Summary and practice',              ids:['m5-synth','m5-shapes'] }
  ],

  /* Chapter 6 is one mechanism and four uses of it, and the section order is
     the order the mechanism is built and then spent. The first section says
     what a query model counts, because every result after it is stated in one
     and a reader who takes a query count for a runtime will misread all four
     algorithms. The second section is the mechanism itself, in three scenes:
     the Boolean form, the general form, and the rule that a superposition
     which never interferes has bought nothing. The remaining sections spend
     it \u2014 on a promise problem, on a transform, on an eigenphase, and on an
     order \u2014 and each of them answers that same rule.

     The laboratory sits inside phase estimation rather than after it, because
     the distribution it draws is the thing the two scenes before it describe
     and the two after it depend on.

     The last section is called factoring and the reach of one mechanism, and
     the words after "factoring" are the point of it: the family scene at the
     end is what stops the chapter reading as a list of tricks. */
  M6: [
    { n:'6.0', title:'Opening',                           ids:['m6-open'] },
    { n:'6.1', title:'What a query model counts',         ids:['m6-query','m6-classes'] },
    { n:'6.2', title:'One mechanism: phase kickback',     ids:[
        'm6-kick','m6-eigen','m6-cancel'] },
    { n:'6.3', title:'Deutsch and Deutsch\u2013Jozsa',      ids:[
        'm6-deutsch','m6-dj','m6-djcost'] },
    { n:'6.4', title:'The quantum Fourier transform',     ids:[
        'm6-qft','m6-qftcirc','m6-qftnot'] },
    { n:'6.5', title:'Phase estimation',                  ids:[
        'm6-qpe','m6-qpeexact','m6-qpeprec','m6-qpecost','m6-count','m6-lab-k'] },
    { n:'6.6', title:'Order finding',                     ids:[
        'm6-order','m6-ordereig','m6-modexp','m6-cf','m6-repeat'] },
    { n:'6.7', title:'Factoring, and the reach of one mechanism', ids:[
        'm6-shor','m6-shor15','m6-rsa','m6-shorclaim','m6-family'] },
    { n:'6.8', title:'Summary and practice',              ids:['m6-synth','m6-shapes'] }
  ]

};

/* ---- textbook anchors --------------------------------------------------
   Scene id to the textbook section that develops the same material. A scene
   resting on two places names both. A scene with no counterpart — the course
   opening, the concept map, the closing material — is simply absent from this
   table and renders no anchor.

   Every anchor here was looked up in the book before it was written down. A
   wrong anchor is well formed, so no gate can catch it; where one cannot be
   verified, none is written. */
CONTENT.BOOK = {
  /* Section 1.1 of the book is "Global perspectives", which is where it makes
     the same argument this chapter opens with: what a quantum computer is for,
     and what the size of the state space does and does not buy. Section 1.3.1,
     "Single qubits", carries the amplitude-and-phase picture that the
     interferometer scene and the fringe beside it both rest on. */
  'm0-what':'1.1',
  'm0-scale':'1.1',
  'm0-phase':'1.3.1',
  'm0-fringe':'1.3.1',

  /* Chapter 1 sits almost entirely inside the book's section 2.1, which is the
     linear algebra its chapter 2 opens with. Four scenes reach outside it: the
     two phase scenes go to 2.2.7, which is where the book argues that a global
     phase has no observable consequence, and the generator scene goes to 2.2.2,
     where the same exponential appears as the evolution postulate.

     Three scenes carry no anchor and the omission is deliberate. `m1-proj` is
     one: the projector is defined in the book, but this course could not verify
     which subsection carries the definition, and a well-formed wrong anchor is
     worse than none because no gate can catch it. `m1-open` and `m1-synth` are
     an opening and a summary, and the book has no counterpart to either. The
     two laboratories are exercises rather than exposition. */
  'm1-ket':'2.1.1',
  'm1-bra':'2.1.4',
  'm1-overlap':'2.1.4',
  'm1-basis':'2.1.1',
  'm1-amp':'2.2.7',
  'm1-phase':'2.2.7',
  'm1-outer':'2.1.4',
  'm1-resid':'2.1.4',
  'm1-gs':'2.1.4',
  'm1-tensor':'2.1.7',
  'm1-expo':'2.1.7',
  'm1-adjoint':'2.1.6',
  'm1-herm':'2.1.6',
  'm1-unit':'2.1.6',
  'm1-gen':'2.2.2',
  'm1-halfangle':'2.2.2',
  'm1-eig':'2.1.5',
  'm1-spectral':'2.1.6',
  'm1-fofa':'2.1.8',
  'm1-dirac':'2.1',

  /* Chapter 2 is the book's section 2.2, the postulates, with three excursions
     back into 2.1: the Pauli matrices are defined there, and so are the
     commutator and the uncertainty relation that follows it.

     Four scenes carry no anchor. `m2-shots` is one: finite-shot estimation is
     statistics rather than quantum mechanics and the book does not develop it
     where this chapter needs it. The opening, the summary and the question
     taxonomy have no counterpart, and neither do the two laboratories. */
  'm2-born':'2.2.3',
  'm2-bases':'2.2.5',
  'm2-distinguish':'2.2.4',
  'm2-proj':'2.2.5',
  'm2-collapse':'2.2.5',
  'm2-povm':'2.2.6',
  'm2-obs':'2.2.5',
  'm2-var':'2.2.5',
  'm2-comm':'2.1.9',
  'm2-uncert':'2.1.9',
  'm2-pauli':'2.1.3',
  'm2-paulialg':'2.1.3',
  'm2-ndotsigma':'2.2.5',
  'm2-schrod':'2.2.2',
  'm2-stationary':'2.2.2',
  'm2-gate':'2.2.2',

  /* Chapter 3 rests on the book's sections 2.4 to 2.6, which is where the
     density operator, the Schmidt decomposition and the Bell inequality are
     developed. The channels leave chapter 2 of the book entirely: the
     operator-sum form is 8.2.3 and the two elementary qubit channels are
     8.3.5 and 8.3.6, with the continuous-time model in 8.4.1. Entropy is
     11.3, and the Bell states are first written down in the book's opening
     chapter, at 1.3.6.

     Every one of those was read in the book's contents before it was written
     here. Five scenes carry no anchor: the opening and the summary, the
     question taxonomy, and the two laboratories. `m3-order` carries 2.2.8,
     which is where the book states the composition postulate, but the
     ordering convention itself is this course's and not the book's. */
  'm3-rho':'2.4.1',
  'm3-physical':'2.4.2',
  'm3-expect':'2.4.2',
  'm3-ensemble':'2.4.1',
  'm3-purity':'2.4.2',
  'm3-ball':'2.4.2',
  'm3-kraus':'8.2.3',
  'm3-damp':'8.3.5',
  'm3-dephase':'8.3.6',
  'm3-t1t2':'8.4.1',
  'm3-order':'2.2.8',
  'm3-ptrace':'2.4.3',
  'm3-local':'2.4.3',
  'm3-sep':'2.5',
  'm3-schmidt':'2.5',
  'm3-svd':'2.1.10',
  'm3-entropy':'11.3',
  'm3-bell':'1.3.6',
  'm3-chsh':'2.6',
  'm3-violate':'2.6',
  'm3-nosig':'2.6',

  /* Chapter 4 is spread across three chapters of the book, which is the
     sharpest illustration of why the mark exists. The sphere and the two
     angles are in 1.2, where the book introduces the qubit; the Hadamard and
     the multiple-qubit gates are in 1.3.1 and 1.3.2; the circuit conventions
     and the swap circuit are in 1.3.4; the Bell states are in 1.3.6. Rotation
     operators, the Euler decomposition and everything about a one-qubit gate
     as a motion are 4.2, the controlled operations are 4.3, and universality
     is 4.5. Reversible classical computation is not in the quantum chapters at
     all: it is 3.2.5, "Energy and computation", which is where the book
     develops Landauer's argument and the Toffoli gate.

     The composite-system postulate 2.2.8 carries the ordering scene, exactly
     as it does in chapter 3, and the phase section 2.2.7 carries the global
     against relative phase scene, exactly as it does in chapter 1.

     Every one of those was read in the book's contents before it was written
     here. Seven scenes carry no anchor: the opening, the summary, the question
     taxonomy, the two laboratories, the question scene, and `m4-ugate`, whose
     three-parameter gate matrix is a software convention rather than anything
     the book states. */
  'm4-sphere':'1.2',
  'm4-cardinal':'1.2',
  'm4-overlap':'1.2',
  'm4-glob':'2.2.7',
  'm4-cover':'4.2',
  'm4-rot':'4.2',
  'm4-pauli':'4.2',
  'm4-had':'1.3.1',
  'm4-phase':'4.2',
  'm4-time':'1.3.4',
  'm4-euler':'4.2',
  'm4-rev':'3.2.5',
  'm4-toffoli':'3.2.5',
  'm4-order':'2.2.8',
  'm4-cnot':'1.3.2',
  'm4-cz':'4.3',
  'm4-swap':'1.3.4',
  'm4-entangle':'1.3.6',
  'm4-univ':'4.5',

  /* Chapter 5 rests on three places in the book and one of them is a surprise.
     The circuit notation is 1.3.4 and the model as a whole is 4.6, which is
     the book's own summary of what a quantum computation is allowed to be.
     Measurement inside a circuit, and the two principles that let one be moved
     or dropped, are 4.4. Compiling into a fixed gate set is 4.5.3, the
     discrete universal set.

     The surprise is 3.2.1, "How to quantify computational resources", which is
     in the book's computer-science chapter and not in any quantum one. That is
     the right place for the scene that says what a resource claim has to name,
     and putting it anywhere else would make the claim look like a quantum
     matter when it is not.

     Teleportation is 1.3.7 throughout, and no-cloning is 1.3.5, which the book
     calls the qubit copying circuit — the same failed circuit this course
     draws. What one teleportation costs is 12.5, entanglement as a physical
     resource.

     Grover is 6.1: the oracle is 6.1.1, the procedure 6.1.2, the geometric
     picture 6.1.3 and the iteration count 6.1.4. The scene that writes the
     claim out against the five components takes 6.6, the optimality of the
     search algorithm, because that is where the book states what the result
     does and does not promise.

     Every one of those was read in the book's contents before it was written
     here. Six scenes carry no anchor: the opening, the summary, the question
     taxonomy, the two laboratories, and three scenes the book has no
     counterpart for — `m5-state` and `m5-shots`, which are classical
     simulation and sampling statistics rather than quantum mechanics, and
     `m5-transpile`, whose layout and routing passes are a property of a chip
     rather than of the theory. */
  'm5-circuit':'1.3.4',
  'm5-model':'4.6',
  'm5-read':'2.2.8',
  'm5-depth':'4.6',
  'm5-measure':'4.4',
  'm5-feed':'4.4',
  'm5-iset':'4.5.3',
  'm5-cost':'3.2.1',
  'm5-ramsey':'4.2',
  'm5-nocopy':'1.3.5',
  'm5-tele':'1.3.7',
  'm5-teleid':'1.3.7',
  'm5-telecorr':'1.3.7',
  'm5-nosig':'1.3.7',
  'm5-teleres':'12.5',
  'm5-search':'6.1.1',
  'm5-kick':'6.1.1',
  'm5-geom':'6.1.3',
  'm5-rotate':'6.1.2',
  'm5-iter':'6.1.4',
  'm5-claim':'6.6',

  /* Chapter 6 rests on three chapters of the book and on one section outside
     them. Quantum parallelism, and the argument that it buys nothing on its
     own, is 1.4.2; Deutsch is 1.4.3 and Deutsch-Jozsa is 1.4.4. The transform
     and its circuit are 5.1, phase estimation is 5.2 with its precision and
     confidence in 5.2.1, order finding is 5.3.1 and factoring is 5.3.2, and
     the family the whole construction belongs to is 5.4.1, period finding.
     Quantum counting is 6.3, which is where the book applies phase estimation
     to the search iterate. The scene that says what a query count is and is
     not takes 3.2.1, "How to quantify computational resources", exactly as
     chapter 5's resource scene does, because that is the book's own statement
     of what a cost model has to fix.

     Every one of those was read in the book's contents before it was written
     here. Six scenes carry no anchor. The opening, the summary, the question
     taxonomy and the laboratory have no counterpart, as in every chapter.
     `m6-classes` is the interesting omission: the complexity classes are
     developed in the book's computer-science chapter, but which subsection
     carries the definitions could not be verified, and a well-formed wrong
     anchor is worse than none because no gate can catch it. `m6-rsa` is the
     other: the book develops RSA in an appendix rather than in a numbered
     section, and this table has no form for that. */
  'm6-query':'3.2.1',
  'm6-kick':'1.4.3',
  'm6-eigen':'5.2',
  'm6-cancel':'1.4.2',
  'm6-deutsch':'1.4.3',
  'm6-dj':'1.4.4',
  'm6-djcost':'1.4.4',
  'm6-qft':'5.1',
  'm6-qftcirc':'5.1',
  'm6-qftnot':'5.1',
  'm6-qpe':'5.2',
  'm6-qpeexact':'5.2',
  'm6-qpeprec':'5.2.1',
  'm6-qpecost':'5.2.1',
  'm6-count':'6.3',
  'm6-order':'5.3.1',
  'm6-ordereig':'5.3.1',
  'm6-modexp':'5.3.1',
  'm6-cf':'5.3.1',
  'm6-repeat':'5.3.2',
  'm6-shor':'5.3.2',
  'm6-shor15':'5.3.2',
  'm6-shorclaim':'3.2.1',
  'm6-family':'5.4.1'
};

/* ---- derivation --------------------------------------------------------
   Hangs `sec` and `book` on every scene object, and returns the chapter view
   the contents surfaces render from. Addresses are computed rather than
   written down twice, so a section that gains a scene renumbers by itself and
   cannot drift out of step with the declaration.

   Two id shapes take a space of their own rather than an ordinal, because
   they are not teaching scenes: a laboratory (`*-lab-*`) takes `L`, and the
   question scene of a module takes `Q1`. Each counts from 1 within its
   chapter. */
window.applyNumbering = function(scenes){
  const byId = {};
  scenes.forEach(s=>{ byId[s.id] = s; });

  return CONTENT.CHAPTERS.map(ch=>{
    const secs = CONTENT.SECTIONS[ch.module] || [];
    let labN = 0;
    const out = { n:ch.n, title:ch.title, module:ch.module, flat:!!ch.flat, sections:[] };

    /* The questions close the chapter: they are worked after the teaching
       scenes. The scene is listed where it occurs, so it is collected from the
       scene array rather than from the declaration. */
    const q = { drill:byId[ch.module.toLowerCase()+'-drill'] };
    if(q.drill) q.drill.sec = ch.n+'.Q1';

    secs.forEach(sec=>{
      const entries = [];
      let ord = 0;
      sec.ids.forEach(id=>{
        const s = byId[id];
        if(!s){ console.error('numbering: no scene with id '+id); return; }
        s.sec  = /-lab-/.test(id) ? ch.n+'.L'+(++labN)
               : ch.flat          ? ch.n+'.'+(++ord)
               :                    sec.n+'.'+(++ord);
        s.book = CONTENT.BOOK[id];
        entries.push(s);
      });
      out.sections.push({ n:sec.n, title:sec.title, scenes:entries });
    });

    out.q = q;
    return out;
  });
};

})();
