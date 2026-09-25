---
name: Quantum Computing
description: An interactive lecture artifact, lecture notes and practice questions for a first course in quantum computing, in one design.
colors:
  canvas: "#FAF8F4"
  panel: "#FFFFFF"
  well: "#F2EFE8"
  ink: "#232B33"
  graphite: "#3B4650"
  muted: "#616B76"
  faint: "#939BA4"
  hairline: "#DCD7CC"
  hairline-strong: "#C2BCB0"
  coral: "#A0451C"
  slate: "#28567E"
  navy: "#12314E"
  signal-cyan: "#14707F"
  signal-amber: "#C08422"
  signal-green: "#4A7A46"
  signal-violet: "#6A5A92"
  signal-red: "#A63B2A"
typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "74px"
  title:
    fontFamily: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "45px"
  body:
    fontFamily: "Inter, SF Pro Text, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "19px"
  card:
    fontFamily: "Inter, SF Pro Text, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "21.5px"
  label:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, IBM Plex Mono, Menlo, monospace"
    fontSize: "13.5px"
rounded:
  sm: "3px"
---

# Design System: Quantum Computing

This file records the visual design of the artifact, the printed documents and the public page.
The source of truth for a value is the code: `:root` and `body[data-theme=dark]` in
`build/src/10_style.css`, `LIGHT` and `DARK` in `build/src/60_plot.js`, `notes/src/notes.css`, and
the inline styles of `web/index.html`. Where this file and the code disagree, the code wins and this
file is corrected.

## Provenance

The design is the design of the sibling course `huguryildiz/signals-and-systems`, ported on
2026-09-25. Its `DESIGN.md` is the reference for every decision not recorded here. What was taken,
what was adapted and what stayed this course's own is listed below, so a later port can repeat it.

| Layer | Files | Taken from the reference | Kept from this course |
| --- | --- | --- | --- |
| Engine | `build/src/40_core.js` | verbatim | — |
| Page shell | `build/src/00_head.html` | icon toolbar, settings menu, page box, arrows, help-screen credits | title, description, the atom mark, CC BY 4.0 credits |
| Stylesheet | `build/src/10_style.css` | the whole sheet, including the slide language | the mark, `runbar`, `labgrid`, the question-type grid, noise and decision-region tokens |
| Renderer | `build/src/90_app.js` | cards, tones, title icons, drill pager, solution cards, recall deck, code pages, sliders, frames, sound, sketch | the `\Od` macro, backtick code spans, the `drilltypes` block, the question type in the question id |
| Plotting | `build/src/60_plot.js` | back-row emphasis, `flatTeX`, lab growth, phone aspect cap | noise and decision-region colours, `dot`, `decade`/`decades` |
| Print | `notes/src/notes.css`, `notes/src/render.js`, `notes/topdf.js` | navy cover, headings, numbered figures and tables, contents with page numbers, colophon | NC anchors, the mark from `assets/icon.svg`, the title page, CC BY 4.0 |
| Public page | `web/` | the pinned cover frame, timeline, facts row, chapter list, document cards, build script | the Moiré backdrop, Figure 1, the chapter texts |

## Colors

The surface, ink, accent and signal tokens are the reference's, unchanged, in both themes. Three places
hold them and must move together: `10_style.css`, `60_plot.js`, and the token lists in
`build/textclash.js`. This course adds two token groups the reference does not have, `--sig-noise` and
`--dec-*` (and `COL.noise`, `COL.dec` in the plotting library); the laboratories fill bars and
regions with them.

## Typography

As in the reference: serif for display and scene titles, sans for sentences, mono uppercase with
wide tracking for labels. Every size is written `calc(Npx * var(--ts))`, so lecture mode raises it.
The laboratory type floor (labels 16 px, segmented choices 17 px, values 20 px, readouts 21 px, notes
19 px, captions 18 px) applies to every laboratory here. The reference keys those rules to its own
laboratory letters; the same letters name different laboratories in this course, so the rules are
written for `.lab` in general instead.

## Layout

The fixed 1920×1080 stage, the phone layout and the fit rules are the reference's.

**Slides.** Every scene carries `slide:true` except the title, the chapter openings, the summaries,
the question-type pages (`m*-shapes`) and the practice questions. That is the reference's rule. The
reference converted each module by rewriting its scenes into two columns of short cards and
splitting any scene that no longer fitted. That conversion was not done here, because it changes
content: the scenes keep their blocks, their prose and their order. The consequence is recorded,
not hidden: at the slide type sizes many scenes fit only below 0.90, and `build/qa.js` lists them
under `dense`. Splitting or shortening those scenes is content work, owed separately.

**Laboratories.** `growLabs()` draws a laboratory's plots taller to fill its column. A frame drawn
with equal pixels to the unit on both axes keeps its height (`isotropic()` in `60_plot.js`), because
the Bloch-ball rim and the unit circle of the complex plane are the claim in those figures and a
taller frame would draw an ellipse. Laboratories G and I take the tighter control spacing the
reference gives its stacked laboratories, so they fit without clipping.

## Components

Cards, card tones, title icons, equations, the drill pager, the question-id pill and worked solutions
as cards are the reference's (its `DESIGN.md`, *Components*). The prediction card, sliders, frames,
sound, sketch, the recall deck and code pages are present in the renderer and unused by this
course's content; a scene opts into one by the fields the reference documents.

## Printed documents

Each document opens on a full-bleed navy cover whose art is this course's fringe,
p(0) = cos²(φ/2), sampled by coral stems, with the other outcome behind it in amber. The title page
with its meta rows follows the cover. The lecture notes number figures and tables by chapter and list
them; the contents carry page numbers, which `notes/topdf.js` finds with `pdftotext` and writes in
before the final print. Every page but the cover carries the licence line and the page number; the
last page carries the colophon and the version history (`DOC_HISTORY` in `render.js`, mirrored to
`dist/PDF_VERSIONS.md`).

## The public page

`web/index.html` is the reference's cover: one pinned frame of 300vh, four corner marks, a serif
title that changes with each step, a caption, a timeline and a GitHub button; then the facts row,
the seven chapters and the three documents. It is dark only. Figure 1 (`web/fig.js`) is section 0.5
of the course, the interferometer H · P(φ) · H, in three steps driven by the scroll: the flat
p(0) = ½ after the first Hadamard, the fringe after the second, and a fixed run of shots estimating
p(0) at φ = 120°. The backdrop (`web/backdrop.js`) is this course's Moiré shader on the reference's
schedule. `web/sitecheck.js` fails when the facts row disagrees with the artifact. The document images
in `web/img/` are the PDFs' first page and one inside page (lecture notes 24, workbook 8, reference
3); re-render them when those pages change.

## Do's and Don'ts

- Do multiply every type size by `var(--ts)`.
- Do route every text field a renderer accepts through `md()`.
- Do re-run `build/qa.js` and `build/textclash.js` after a style change: a restyle changes the fit of
  every scene.
- Don't port a reference rule keyed to a laboratory letter without checking which laboratory that
  letter names here.
- Don't add shadows, gradients, glass, emoji or a second radius to the artifact.
- Don't hard-code a page or ink colour in figure code.
