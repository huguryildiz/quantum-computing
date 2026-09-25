---
paths:
  - "build/src/7*.js"
  - "build/src/8*.js"
  - "build/src/9*.js"
  - "notes/src/**/*.js"
---

# Student-facing content and fixed conventions

## Who this is for

**Undergraduate engineering students taking a first course in quantum computing.** They have had
linear algebra and some Python; they have not had quantum mechanics. This is the constraint that
decides every writing question, and it outranks completeness, elegance and rigour-for-its-own-sake.

- **Plain first, formal second.** Every scene says what is going on in ordinary words before it says
  it in symbols, and again afterwards if the symbols were heavy. A reader who stops at the prose
  should still have learnt something true.
- **A worked example beats a general theorem.** Where the two compete, the example wins and the
  theorem goes in a note beside it.
- **No material the course does not need.** The syllabus is the fourteen lectures in `source/`.
  Where a gap has to be filled, the textbook named in `CONTENT.BOOKREF` is the authority — but fill
  it at the level the rest of the course is written at, not at the level the book is written at.
- **Name the mistake.** Every worked example carries the error a student actually makes, said
  plainly. That is worth more than another example.
- **One idea a scene.** A scene that needs a scale factor below 0.90 to fit is a scene carrying two
  ideas. `qa.js` prints those under `dense`; split them. Module 0 already lost a scene this way:
  the interferometer derivation and the fringe reading are `m0-phase` and `m0-fringe` because
  together they measured 0.82.

## The three sentences this course exists to install

A student arrives believing that a quantum computer tries every answer at once, and every later
scene is harder to read while that sentence is still believed. Three replacements, and every module
is answerable to them:

1. **The state is large, the readout is small.** A measurement returns `n` bits, never `2^n`
   amplitudes. An algorithm earns nothing by holding many amplitudes unless it can make the
   unwanted ones cancel first.
2. **A global phase is not physical; a relative phase is everything.** Interference is the only
   mechanism any algorithm in this course has, and it is entirely a statement about relative phase.
3. **A resource claim names five things** — task, input model, accuracy, hardware model, and the
   classical baseline. A claim missing one is not yet a claim. Query counts are not runtimes.

## How every note is written

**Every note in this repository is written clean and plain, at the level an undergraduate can
follow.** This binds the exposition, not only the sentences: one idea a paragraph, the steps of a
derivation in order with none of them left for the reader to supply, and no aside that the result
does not need. A passage that only a reader who already knows the material can follow has failed
this rule, however correct it is.

**The English is simple English.** The reader is an engineering student who may be reading in a
second language, so the vocabulary stays common and the grammar stays direct: everyday words, active
voice, subject and verb close together, no idiom and no figure of speech. The only hard words on the
page are the technical ones, and each of those is defined where it first appears. Difficulty belongs
to the mathematics, never to the English carrying it.

**A note teaches; it does not record.** Say what the idea is for before developing it, and name the
move each step makes — "insert the resolution of the identity", "trace out the second qubit",
"write the sum of two exponentials as a cosine" — so the reader learns a method and not one result.
Where a step is the one students get wrong, say so and say why. Where a definition looks arbitrary,
show the case it was made to handle.

## Editorial rules

Inherited from the engine's source course and binding on every student-facing string.
The ones that get broken:

- **Never cite the material this was written from as an authority.** "The source" as a physical
  emitter is fine — `rule_check.py` was narrowed for exactly that — and so is the credit line the
  licence requires, which every edition prints. What is banned is a sentence that makes a claim rest
  on that course: "the source says", "the original notes state", a page reference into it.
- **Every piece of mathematics in a figure is typeset LaTeX**, with `tex:true`, on one line. A
  plain word is a plain label and takes no `\text{}` wrapper: writing `'\\text{measure}'` without
  `tex:true` prints the backslash on the page, and both `mathscan.js` and `textclash.js` will say
  so. Both fired on this exact mistake in chapter 0.
- **A derivation shows its intermediate steps, set large, one step to a line.** Each step is its
  own display `eq` block, never a formula buried in a `body` or `small` line. Where a step is a
  chain of more than one equality, write it `\begin{aligned}` with each equality on its own line
  and aligned at the `=`; a chain run across the page overflows on any window narrower than the
  stage, and `qa.js` measures 1920 px and will pass it.
- **An `eq` block's `label` is uppercased by the style sheet.** Greek letters and TeX macros must
  not go in it; put them in the equation or write the name in ASCII.
- **Every text field passes through `md()`,** so mathematics in running text needs `$…$`. A legend
  item, a card body and an `eq` note are running text.

## Decisions that are fixed

- **Qubit order is `|q_{n-1} … q_1 q_0⟩`**, and entry `x` of the state vector is the amplitude of
  `|x⟩`. Circuit drawings put `q_0` at the top. Mixing this with the other convention does not
  make a result approximately wrong — it names a different state, and every number downstream is
  silently wrong. This is the `N₀/2` of this course.
- **A global phase is not physical.** State equality is up to global phase throughout; relative
  phase is observable and is never dropped.
- **The inner product conjugates its first argument**, `⟨u|v⟩ = Σ u_k* v_k`. In NumPy that is
  `np.vdot(u, v)` and never `np.dot`.
- **`ħ = 1`**, so a Hamiltonian is in angular frequency and evolution is `U(t) = e^{-iHt}`. Where a
  physical energy is meant the units are written out. Logarithms of probabilities are base two.
- A question may keep the shape of a paper question and **no** number from it.
- The numerical gates in `verify/` are written independently of the artifact. Porting the
  artifact's own arithmetic into the gate makes the gate verify itself.
- Commit sources and any rebuilt `dist/` file together, never in separate commits.
