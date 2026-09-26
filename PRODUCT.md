# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Undergraduate engineering students taking a first course in quantum computing. They have had linear
algebra and some Python; they have not had quantum mechanics, and many read English as a second
language. They meet the material twice: projected in a lecture, with the instructor talking over it,
and alone, before a paper. The instructor is the second user: he presents from the artifact in a 16:9
room and needs each scene to work as a lecture slide.

## Product Purpose

A first course in quantum computing in four documents built from one set of sources: the interactive
artifact (209 scenes, 11 laboratories, 120 practice questions with worked solutions), the lecture
notes, the student workbook, and the formula reference. It is published as a static site behind a
cover page at https://quantum-computing-tedu.vercel.app.

The course is an adaptation of Aleksandr Krasnok's *Quantum Computing Lectures*, used under
CC BY 4.0. `NOTICE` carries the full attribution, and the credit line is printed in every published
copy.

The artifact is the lecture deck. The lecture notes carry the long explanation. A student who wants the
full argument reads the notes; a student in the room reads the slide and listens.

## Operating Context

- Lecture room, 16:9 projector, read from the back row. `Lecture mode` raises the type scale.
- Laptop, independent study, either theme, any window shape.
- Phone and portrait tablet: the one-column phone layout. A screen on its side gets the desktop stage.
- Online, from the course site. Students open the course at its address and do not download it; only
  the PDF editions are offered as documents.
- Print: the PDF editions made by the notes pipeline.

## Capabilities and Constraints

- One HTML file, served by the site. It makes no network request of its own. No analytics. Progress
  is stored on the device only.
- Fixed 1920×1080 stage, scaled to the window.
- Every number on a page is recomputed by a script in `verify/`, written independently of the
  artifact's own arithmetic; every label in every figure is swept for collisions by
  `build/textclash.js`. A design change that a gate cannot check is a change someone has to check by
  eye.
- The mathematics is fixed. A redesign never changes a formula, a number, a question setup, an address
  or a textbook anchor.
- Instructor material is never published as a file.

## Brand Commitments

The artifact is calm, rigorous and editorial. The interface makes a demanding technical course feel
navigable, and never competes with the mathematics. It reads as the same publication as the sibling
course `signals-and-systems`, whose design it carries (`DESIGN.md`).

The public cover page is the exception. It is dark and cinematic: one pinned frame in which Figure 1
builds as the reader scrolls, under a large serif title that changes with each step, and a row of
facts below it. `DESIGN.md`, "The public cover page", has the details.

The language is plain academic English. No promotional tone, no slogans, no sentence written to sound
impressive. `.claude/rules/content-writing.md` is the standard.

## Evidence on Hand

- The open course this one adapts, cloned into `source/` (not in git, never redistributed).
- Nielsen and Chuang, *Quantum Computation and Quantum Information*, the textbook the scenes point to
  for further reading (never quoted or reproduced).
- No testimonials, usage figures or outcomes data exist. Do not invent any.

## Product Principles

1. The state is large, the readout is small. No scene may suggest that a quantum computer tries every
   answer at once.
2. A global phase is not physical; a relative phase is everything. Interference is the only mechanism
   an algorithm in this course has.
3. A resource claim names five things: task, input model, accuracy, hardware model and classical
   baseline. A query count is not a runtime.
4. Plain first, formal second. A worked example beats a general theorem, and every worked example
   names the mistake a student actually makes.
5. One idea a scene. A scene that needs a scale factor below 0.90 to fit carries two ideas.
6. Difficulty belongs to the mathematics, never to the English or the layout carrying it.

## Engagement Rules

The sibling course's rules apply here as each module is converted to the slide design; no module of
this course is converted yet. The mechanics are in the sibling's `DESIGN.md`, "Interaction on a slide".

1. **Intuition before algebra.** A student first sees or guesses what a state or a gate does. The
   calculation comes after that, not first.
2. **Predict first.** Where a card asks a question, it offers two to four choices (`note.ask`). The
   student commits to an answer before the reveal step shows the working.
3. **Move it.** When a parameter changes what the figure shows (a phase, an angle, a number of shots),
   the figure gets a slider (`fig.live`). The default slider value draws the figure the slide had
   before.
4. **Close with a quick check.** Before its summary, each module has one slide of short predictions.
   None needs a calculation on paper, and each shows a one-sentence reason after the answer.
5. **Keep the rigour.** Interaction never replaces a derivation. Every derivation is still shown in
   full, and the practice questions stay open-ended.

## Accessibility & Inclusion

Keyboard access to every control. `Motion: reduced` and `prefers-reduced-motion` give a complete still
frame, never a missing one. Text contrast of at least 4.5:1 in both themes, tab labels included. The
five figure colours are never the only carrier of meaning: a curve, a state or a bar is also labelled.
