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
  { n:'3', module:'M3', title:'Mixed states and entanglement' }
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
  'm3-nosig':'2.6'
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
