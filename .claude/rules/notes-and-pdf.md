---
paths:
  - "notes/**/*"
  - "dist/*.pdf"
---

# Notes and PDF production

Read `content-writing.md` before authoring notes, examples or solutions.

## The four editions and the formula reference

All four editions build from `notes/`. `notes/src/ca.js` is Appendix A of the lecture notes and,
sliced from after its `APPENDIX` heading, Part 2 of the formula reference: one copy of every
formula the course establishes, in course order, and nothing derived there. Part 1 of that
reference is this course's four fixed conventions and the two expressions everything else is
built on, the Born rule and $U(t)=e^{-iHt}$. `editions.js` slices Part 2 of the formula reference
out of `ca.js` — it is the one copy, never duplicated by hand.

## The credit line

`CONTENT.META.adapted` is where the CC BY 4.0 credit is written once. The artifact and the three
derived editions print it from there. The lecture notes and the public page carry the same
sentence in their own files, because neither pipeline loads `80_content_core.js`; if one changes,
all three change. Removing the credit from a published edition would be a licence breach, not an
editorial choice — see `source-audit.md` for the credit-versus-citation distinction.

## Print layout

Read what the code actually does before touching `notes/src/notes.css` or `notes/topdf.js`; do
not carry over the print rules from a sibling repository without checking this repository's own
files first.

- `notes/topdf.js` prints each document from the `@page` rules in `notes/src/notes.css`. The cover
  is the named page `cover`, with no margin, so it has no footer; every other page keeps its
  margin box and its footer.
- The footer, set by `@page` in `notes/src/notes.css`, reads `© 2026 Hüseyin Uğur Yıldız ·
  huguryildiz.com · CC BY 4.0` at the bottom left, with the page number at the bottom right.
- Print at scale 1. If an equation overflows, fix the equation; do not shrink the document.

## Traps

- **A page break is a layout decision and no gate reads one.** Appendix A opened at the foot of the
  last page of chapter 6, under that chapter's closing box, with only its lead paragraph beneath the
  heading. `break-after:avoid` on a heading keeps the heading with the next block and does nothing
  about the block after that. An appendix, and anything else that is a fresh start, takes a
  `{t:'page'}` of its own.
- **`md()` handled `$…$` and not backticks.** The notation glossary and the conventions manifest both
  write a NumPy call in backticks, so the backticks reached the page as backticks — in the artifact,
  in the lecture notes and in the printed formula reference at once, and no gate looks for one. Both
  renderers now typeset mathematics first and turn a backtick span into `<code>` after it.
- **`.gitignore` and `.vercelignore` have to agree about what ships.** `.vercelignore` assumed the
  printed editions were on the host; `.gitignore` dropped two of the three before they could reach
  it, so two links on the public page would have been dead and nothing local would have shown it.
  The HTML intermediates are ignored, the printed editions are tracked, and the instructor edition
  is ignored in both.
- **A licence credit that lives only in `NOTICE` has not travelled.** `NOTICE` and `README.md` stay
  in the repository; the artifact, the four printed editions and the public page are what actually
  reach a reader, and for a while none of them named the course this adapts. CC BY 4.0 asks for the
  credit to accompany the work, so it is now printed in each of them, from `CONTENT.META.adapted`
  wherever that file is loaded. Ask of any new published surface: if this were the only file
  somebody ever received, would the credit be on it?
