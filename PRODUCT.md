# Product

## Platform

web

## Users

Undergraduate engineering students who have had linear algebra and some Python but no quantum
mechanics. They meet the material in a lecture, where the instructor presents from the artifact in a
16:9 room, and alone, before a paper. The instructor is the second user.

## Product purpose

A first course in quantum computing in four documents built from one set of sources: the
interactive artifact (178 scenes, eleven laboratories, 120 practice questions with worked
solutions), the lecture notes, the student workbook and the formula reference. It is published as a
static site behind a cover page. The course is an adaptation of Aleksandr Krasnok's Quantum
Computing Lectures, under CC BY 4.0; `NOTICE` has the full attribution.

## Operating context

- Lecture room, 16:9 projector. Lecture mode raises the type scale.
- Laptop, independent study, either theme, any window shape.
- Phone and portrait tablet: the one-column phone layout.
- Print: the PDF editions made by the notes pipeline.

## Constraints

- One HTML file with no network request of its own. Progress is stored on the device only.
- Every number on a page is recomputed by a script in `verify/`; every label in every figure is
  swept for collisions by `build/textclash.js`.
- A redesign never changes a formula, a number, a question, an address or a textbook anchor.
- Instructor material is never published as a file.

## Brand

The artifact is calm, rigorous and editorial, and it reads as the same publication as the sibling
course `signals-and-systems`, whose design it carries (`DESIGN.md`). The public cover page is the
exception: dark and cinematic, one pinned frame in which Figure 1 builds as the reader scrolls. The
language is plain academic English with no promotional tone.
