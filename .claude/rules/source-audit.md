---
paths:
  - "source/**/*"
  - "build/src/8*.js"
  - "build/src/89_sections.js"
  - "notes/src/**/*.js"
---

# Where the material comes from

`source/` is a clone of the open course this one adapts, and it is gitignored: it is third-party
material and is never redistributed from here. It is the syllabus and the authority on what the
course covers and in what order. It is **not** the authority on how a thing is explained — its
notebooks are written for a reader who already has the mathematics, and this artifact is not.

## Credit versus citation

**The credit and the citation are two different things, and only one of them is banned.**

The **credit** is what CC BY 4.0 requires: the name of the work, its author, its licence, and a
link. It travels with every copy of the work, so it is printed in every document this repository
generates — the artifact, the lecture notes, all three derived editions, and the public page — as
well as in `NOTICE` and `README.md`. Removing it from a published edition would be a licence
breach, not an editorial choice. See `notes-and-pdf.md` for where the credit line is written and
printed from.

The **citation** is what is banned: treating that course as an authority on a page a student reads.
"The source says", "per the source", "the original notes state", a page reference into it — these
make the reader's understanding depend on a document they do not have, and `rule_check.py` fires on
every one of them. That rule is not relaxed.

## The textbook anchor

Where a gap in the syllabus has to be filled, the textbook named in `CONTENT.BOOKREF` is the
authority — but fill it at the level the rest of the course is written at, not at the level the
book is written at. Textbook anchors (the `NC` mark) are declared only in `build/src/89_sections.js`.

## Traps

- **A textbook anchor is looked up in the book before it is written.** A wrong `NC` anchor is well
  formed, so no gate can catch it. Where an anchor cannot be verified, write none.
- **The book's chapter numbers and this course's agree nowhere.** The book develops the qubit, the
  Bloch sphere and the whole gate set inside its chapters 1, 2 and 4; this course reaches them in
  its chapters 2 and 4. The `NC` mark is what keeps the two apart and it is not optional.

## `m5-fault` is a different case from the unanchored scenes

`m5-fault` is unanchored for a different reason and must not be filed with the scenes below. The
book develops error correction at length, so a counterpart exists and the reader does have
somewhere to go; the anchor was simply not looked up before the scene shipped. Read the book's
contents and write it. Never guess a section number — a wrong anchor is well formed and no gate
can catch it.

## The unanchored scenes, and why

Of the 272 scenes, 104 carry no textbook anchor (`seccheck.js`, 2026-09-27). Besides `m5-fault`,
they include the cover, six chapter openings, six summaries, six quick checks, six project pages, eighteen Around Us galleries, a course
map, a how-to-read, six question taxonomies, six drill scenes, thirty-one laboratories, and thirteen scenes whose material the book has no counterpart for — `m2-shots` and `m5-shots`, which
are sampling statistics rather than quantum mechanics; `m5-state`, which is classical simulation;
`m5-transpile`, whose layout and routing passes are a property of a chip; `m1-proj`, whose
subsection in the book could not be verified; `m4-ugate`, whose three-parameter gate matrix is a
software convention rather than anything the book states; `m6-classes`, whose complexity-class
definitions live in the book's computer-science chapter but in a subsection this course could not
verify; `m6-rsa`, because the book develops RSA in an appendix rather than in a numbered
section and `CONTENT.BOOK` has no form for that; `m0-regimes`, whose subject is the state of the
hardware field rather than the theory; and the four scenes added to close the earlier coverage gaps —
`m1-wavefunctions`, `m1-completeness`, `m2-position` and `m2-well` — because the book is
finite-dimensional throughout and develops neither function spaces nor a particle in a box. Those
four are the price of that decision: the reader who wants more has nowhere in the named textbook
to go, and the scenes have to stand alone.

The cover carries no address, which is why one scene is short of the total under `seccheck.js`'s
`addressed` count.

## Coverage audit

`.claude/notes/` holds the coverage audits, which are working notes and stay out of the
repository. `scope-audit-2.md` is the current audit; `scope-audit.md` and `coverage_audit.md` are
superseded and carry wrong counts.
