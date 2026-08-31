<!-- markdownlint-disable MD033 -->
<!-- Inline HTML is intentional: centered hero header and badge row. -->

<p align="center">
  <img src="assets/icon.svg" alt="Quantum Computing logo" width="120" height="120">
</p>

<h1 align="center">Quantum Computing</h1>

<p align="center">
  <strong>Interactive Lecture Artifact, Laboratories and Lecture Notes</strong><br>
  <sub>A single offline HTML file for a first course in quantum computing. Step through a scene and watch a phase turn into something you can count.</sub>
</p>

<p align="center">
  <a href="https://quantum-computing-course.vercel.app/"><img src="https://img.shields.io/badge/quantum--computing--course.vercel.app-12314E?style=for-the-badge&logo=vercel&logoColor=FAF8F4" alt="The course, online"></a>
  &nbsp;
  <a href="dist/Quantum_Computing.html"><img src="https://img.shields.io/badge/Quantum__Computing.html-12314E?style=for-the-badge&logo=html5&logoColor=FAF8F4" alt="The interactive artifact"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/Offline%20%C2%B7%20one%20file-12314E?style=for-the-badge&logoColor=white" alt="Offline, one file">
  <img src="https://img.shields.io/badge/KaTeX%20vendored-12314E?style=for-the-badge&logo=latex&logoColor=white" alt="KaTeX">
  <img src="https://img.shields.io/badge/Playwright-12314E?style=for-the-badge&logo=playwright&logoColor=45BA4B" alt="Playwright">
  <img src="https://img.shields.io/badge/NumPy%20%C2%B7%20SciPy%20%C2%B7%20SymPy-12314E?style=for-the-badge&logo=python&logoColor=FFD343" alt="NumPy, SciPy and SymPy">
  <img src="https://img.shields.io/badge/v1.0%20%C2%B7%20Chapters%200%E2%80%936-12314E?style=for-the-badge" alt="Version v1.0">
</p>

---

## Overview

**Quantum Computing** turns a first course in quantum computing into a stepped, self-explaining
document. It covers the software half of the subject — the mathematics of quantum
states; measurement and dynamics; density operators, decoherence and entanglement; the Bloch sphere
and the gate set; circuits, teleportation and Grover search; and the introductory algorithms
through phase estimation and order finding — in scenes that advance one idea at a time.

Everything runs from one HTML file. No install, no sign-in, no server, no network request at any
point. Progress is stored on the reader's own device and nowhere else.

It is written for **undergraduate engineering students who have had linear algebra and some Python
but no quantum mechanics**, and that constraint decides every writing question: plain first and
formal second, a worked example before a general theorem, and nothing the course does not need.

**Status: version 1.0.** All seven chapters are written: the frame of the course, the mathematics of
quantum states, states and measurement and dynamics, mixed states and entanglement, the Bloch sphere
and quantum gates, circuits and protocols, and quantum algorithms. That is 178 scenes, eleven
interactive laboratories and 120 worked practice questions, with every number in them re-derived by
a separate numerical suite.

Four documents are generated from the same content, so a question number means the same question in
every one of them and a formula is written in one place only:

| Document | What it is |
| --- | --- |
| `dist/Quantum_Computing.html` | the interactive artifact — one offline file |
| `dist/Lecture_Notes.pdf` | the reading edition, chapters 1 to 6 and Appendix A |
| `dist/Student_Workbook.pdf` | every question, with no answer and no solution |
| `dist/Formula_Reference.pdf` | the conventions, every formula, and every symbol |

A fifth, the instructor solutions, prints every question fully worked and is not published.
`site/index.html` is the public page that introduces them.

---

## Why this artifact

A quantum computing course is hard to follow from a static page because the central objects cannot
be seen and the central mistake is a sentence, not an equation. A student who believes that a
quantum computer tries every answer at once will misread every scene that follows. So the artifact
puts the honest version first and makes the mechanism the interface.

- **One step, one idea.** A scene reveals its parts in order, so a derivation is read rather than decoded.
- **Every figure is drawn, not pasted.** Bloch spheres, interference fringes, circuits and probability distributions are generated per render from the mathematics beside them.
- **Live laboratories.** Every control changes the mathematics and not the drawing: the numbers beside a figure are computed from the definitions at the moment the control moves.
- **Every number is checked twice.** Results are recomputed by a separate program that reaches each one by a different route.
- **Every label is checked.** A sweep proves that nothing written inside a figure is crossed by anything drawn in it.

---

## Building

```bash
cd build && node build.js          # the artifact → dist/Quantum_Computing.html
```

The verification gates and the notes pipeline are documented for contributors in `CLAUDE.md`.
Python is the arm64 virtual environment at `.venv/`, pinned by `requirements.txt`.

---

## Attribution and licence

This work is an **adaptation**. Its syllabus and the technical content it teaches derive from
[Quantum Computing Lectures](https://github.com/AlexKrasnok/quantum-computing-lectures) by
Aleksandr Krasnok, whose educational materials are licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The adaptation consists of rewriting
that course as a stepped interactive artifact with generated figures, laboratories and worked
questions, at the level of a second-year undergraduate reader.

This work is itself released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); the
full terms are in [LICENSE](LICENSE). Full attribution, including what was changed and the terms
carried forward, is in [NOTICE](NOTICE). KaTeX is vendored into the built artifact under the MIT
License, and the interference figure on the public page is adapted from an MIT-licensed shader.
