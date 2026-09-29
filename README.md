<!-- markdownlint-disable MD033 MD041 -->

<p align="center">
  <img src="assets/icon.svg" alt="Quantum Computing logo" width="120" height="120">
</p>

<h1 align="center">Quantum Computing</h1>

<p align="center">
  <strong>Interactive Lecture Artifact</strong><br>
  <sub>An interactive deck for a first course in quantum computing, written for engineering students who have had linear algebra and some Python but no quantum mechanics.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML_%C2%B7_JavaScript-0b1220?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="HTML and JavaScript">
  <img src="https://img.shields.io/badge/KaTeX-0b1220?style=for-the-badge&logo=latex&logoColor=4FBECE" alt="KaTeX">
  <img src="https://img.shields.io/badge/NumPy_%C2%B7_SciPy_%C2%B7_SymPy-0b1220?style=for-the-badge&logo=numpy&logoColor=4DABCF" alt="NumPy, SciPy and SymPy">
  <img src="https://img.shields.io/badge/Playwright-0b1220?style=for-the-badge&logo=playwright&logoColor=45BA4B" alt="Playwright">
  <a href="https://quantum-computing.huguryildiz.com"><img src="https://img.shields.io/badge/quantum--computing.huguryildiz.com-0b1220?style=for-the-badge&logo=vercel&logoColor=white" alt="Live"></a>
  <a href="https://github.com/huguryildiz/quantum-computing/actions/workflows/checks.yml"><img src="https://img.shields.io/github/actions/workflow/status/huguryildiz/quantum-computing/checks.yml?branch=main&style=for-the-badge&label=checks" alt="Checks"></a>
</p>

<h3 align="center">
  <a href="#what-this-is">Overview</a>
  &nbsp;·&nbsp;
  <a href="#topics">Topics</a>
  &nbsp;·&nbsp;
  <a href="#repository-layout">Architecture</a>
  &nbsp;·&nbsp;
  <a href="#building">Building</a>
  &nbsp;·&nbsp;
  <a href="#checks">Checks</a>
</h3>

---

## What this is

The course is taught from a single HTML document that works as both a lecture deck and a study
guide. Each scene reveals one idea at a time, so a derivation can be followed step by step, whether
it is projected in the lecture room or read alone before an exam.

The course runs from the mathematics of quantum states, through measurement and dynamics, mixed
states and entanglement, the Bloch sphere and the gate set, to circuits, teleportation, Grover search
and the algorithms built on phase estimation. It is written against one common mistake: the belief
that a quantum computer tries every answer at once. The scenes replace it with three statements. The
state is large and the readout is small. A global phase is not physical, and a relative phase is
everything. A resource claim has to name its task, input model, accuracy, hardware model and
classical baseline.

Alongside the scenes, the artifact contains:

- **Laboratories.** Each has controls for a state, a gate or a circuit; moving one updates the figure and every number beside it, such as a probability, a Bloch vector or a count of shots.
- **Practice questions.** Open-ended questions for each module, each with a worked solution that shows every step.
- **Laser pointer and whiteboard.** In projector mode the pointer becomes a red laser dot; holding the mouse button or pressing a pen draws strokes that fade after a pause or stay until cleared. Pressing `W` opens a whiteboard over the page, with four inks, three line widths and blank, squared or ruled paper. It takes a mouse, a finger or a pen such as the Apple Pencil, and its laser tool brings the pointer over the board.

The same content also produces a set of printable PDF editions: the lecture notes, a student workbook
with the questions only, and a formula reference.

## Topics

| Module | Title | Topics |
| --- | --- | --- |
| 0 | The frame of the course | What the course asks · what it is for · how the field reached NISQ · the size of the state · phase becomes probability · reading the fringe · the course map |
| 1 | The mathematics of quantum states | Vectors, dual vectors and the inner product · amplitude, phase and interference · outer products and projectors · Gram–Schmidt · the tensor product · Hermitian and unitary operators · the spectral theorem · Dirac notation · functions as vectors |
| 2 | States, measurement and dynamics | The Born rule · projective measurement · observables · compatibility and uncertainty · the Pauli algebra · dynamics · finite shots |
| 3 | Mixed states and entanglement | The density operator · purity and the ball of states · quantum channels · relaxation and dephasing · the partial trace · separability and the Schmidt decomposition · entropy · Bell correlations |
| 4 | The Bloch sphere and quantum gates | The Bloch sphere · single-qubit gates as rotations · composing gates · reversible embeddings · two-qubit gates · entanglement from a gate · universality |
| 5 | Circuits and protocols | The circuit model · running a circuit · compiling for a machine · interference in a circuit · teleportation · Grover search |
| 6 | Quantum algorithms | What a query model counts · phase kickback · Deutsch and Deutsch–Jozsa · the quantum Fourier transform · phase estimation · order finding · factoring |

## How students use it

Students open the course at its site address and work there; the artifact is not handed out as a
download. The PDF editions are available from the same site. Reading progress is kept in the reader's
own browser and is not sent anywhere. The site has no sign-in and no analytics.

The artifact has a student edition and an instructor edition. The instructor solutions PDF is never
published: `.vercelignore` keeps it off the host and the site build does not copy it.

Press `?` inside the artifact for the keyboard shortcuts.

## Repository layout

```text
build/     the artifact: sources in build/src/, the build script, and the browser checks
notes/     the lecture notes and the other PDF editions
verify/    Python scripts that recompute every numerical result independently
tools/     text checks on student-facing wording and figure labels
web/       the public site and the script that assembles it
dist/      generated output; never edited by hand
assets/    the course icon
source/    the course this one adapts; not tracked and never redistributed
```

`build/src/` is a set of numbered files concatenated in order. Content is data: scenes, laboratories
and questions are plain JavaScript objects, and one renderer and one plotting module draw them. Figures
are drawn at render time, so they always follow the current light or dark theme.

## Building

Node.js is the only requirement for the artifact and the notes. KaTeX is vendored into the sources, so
nothing is installed and nothing is fetched from the network.

```bash
cd build && node build.js                              # the artifact
cd notes && node build.js                              # the lecture notes
cd notes && node editions.js && node ../build/pw.js topdf.js   # the other editions and all PDFs
node web/build-site.js                                 # the public site, in site/
```

The numerical checks use a local Python environment:

```bash
/opt/homebrew/bin/python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

## Checks

Before a release, the sources pass a chain of checks. Browser checks render every scene and look for
overflow, damaged mathematics and labels that collide with a drawn curve, and they drive every
laboratory control in both themes. Python scripts recompute every number the course states, by a
route independent of the artifact's own arithmetic. Text checks enforce the wording rules. The browser
checks run through `build/pw.js`, which locates the local Playwright install (set `PW_PATH` if it is
elsewhere). Report the result a run actually printed, not a remembered one.

## Reporting errors

If you find a mistake in a scene, a figure, a question or a PDF, please open an issue on
[GitHub Issues](https://github.com/huguryildiz/quantum-computing/issues). Say where it is (the scene
title or the page number), what is wrong, and, if it is a display problem, which browser and theme you
used. A screenshot helps.

## Conventions

These are fixed for the whole course and stated in the artifact where a reader first meets them.

- Qubit order is `|q_{n−1} … q_1 q_0⟩`, and entry `x` of a state vector is the amplitude of `|x⟩`. Circuit drawings put `q_0` at the top.
- States are equal up to a global phase. A relative phase is observable and is never dropped.
- The inner product conjugates its first argument: `⟨u|v⟩ = Σ u_k* v_k`, which is `np.vdot(u, v)` in NumPy.
- `ħ = 1`, so a Hamiltonian is an angular frequency and evolution is `U(t) = e^{−iHt}`.
- Logarithms of probabilities are base two.

## Design

The visual language, the colour roles and the figure rules are in [`DESIGN.md`](DESIGN.md). The
audience, purpose and constraints are in [`PRODUCT.md`](PRODUCT.md).

## Sources

This course is an adaptation. Its syllabus and the sequence of topics it teaches derive from
[Quantum Computing Lectures](https://github.com/AlexKrasnok/quantum-computing-lectures) by Aleksandr
Krasnok, used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Every scene, figure,
laboratory and question here is written for this artifact, and no text, figure or code file from the
original is reproduced. Nielsen and Chuang, *Quantum Computation and Quantum Information*, is the
textbook the scenes point to for further reading; it is never quoted or reproduced. The full
attribution is in [`NOTICE`](NOTICE).

## Citing

If you use this material in teaching or research, please cite it. The citation metadata is in
[`CITATION.cff`](CITATION.cff), and GitHub's **Cite this repository** button in the repository sidebar
gives it in APA and BibTeX. In BibTeX:

```bibtex
@misc{yildiz_quantum_computing,
  author       = {Y{\i}ld{\i}z, H{\"u}seyin U{\u{g}}ur},
  title        = {Quantum Computing: An Interactive Lecture Artifact},
  year         = {2026},
  version      = {1.0},
  howpublished = {\url{https://quantum-computing.huguryildiz.com}},
  note         = {Source: \url{https://github.com/huguryildiz/quantum-computing}}
}
```

Please cite the version you used. When a new version is released, the version number in
`CITATION.cff` changes with it.

## License

The repository separates course content from software.

- **Course content** (scenes, laboratories, questions, worked solutions, lecture notes, figures and the
  authored material in the generated files) is licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `LICENSE-CONTENT`. It is an
  adaptation of a CC BY 4.0 work, and `NOTICE` carries the attribution that goes with every copy.
- **Software** (the build pipeline, renderer, plotting code, checks, notes pipeline and site build) is
  licensed under the MIT License. See `LICENSE`.
- **Generated HTML files** combine both, plus third-party components, and each part keeps its own
  license.

KaTeX and the shader on the cover page keep their upstream MIT licenses; see `THIRD_PARTY_NOTICES.md`.
Material in `source/` is third-party and is covered by neither project license.

Suggested attribution:

> Hüseyin Uğur Yıldız, *Quantum Computing*, https://quantum-computing.huguryildiz.com, adapted from Aleksandr Krasnok,
> *Quantum Computing Lectures*, CC BY 4.0.
