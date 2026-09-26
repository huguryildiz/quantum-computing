---
name: Quantum Computing
description: A lecture deck, lecture notes and practice questions for a first course in quantum computing, in one design.
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
  signal-input: "#14707F"
  signal-system: "#C08422"
  signal-output: "#4A7A46"
  signal-intermediate: "#6A5A92"
  signal-error: "#A63B2A"
  tab-amber: "#8A5E12"
typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "74px"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "45px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.008em"
  body:
    fontFamily: "Inter, SF Pro Text, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.55
  card:
    fontFamily: "Inter, SF Pro Text, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "21.5px"
    fontWeight: 400
    lineHeight: 1.52
  label:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, IBM Plex Mono, Menlo, monospace"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.12em"
rounded:
  sm: "3px"
spacing:
  s1: "8px"
  s2: "16px"
  s3: "24px"
  s4: "32px"
  s5: "48px"
  gutter: "44px"
  s7: "80px"
  page: "104px"
  flow: "18px"
components:
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.graphite}"
    typography: "{typography.card}"
    rounded: "{rounded.sm}"
    padding: "17px 22px 16px"
  card-tab:
    backgroundColor: "{colors.slate}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 12px 4px 10px"
  equation:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "16px 22px 16px 24px"
  figure-frame:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.sm}"
    padding: "14px 16px"
---

# Design System: Quantum Computing

This file holds every visual decision for the project. `CLAUDE.md` holds how to build and check;
`PRODUCT.md` holds who it is for. The source of truth for a value is the code: `:root` and
`body[data-theme=dark]` in `build/src/10_style.css`, `LIGHT` and `DARK` in `build/src/60_plot.js`,
`notes/src/notes.css`, and the styles of `web/index.html`. Where this file and the code disagree, say
so and stop; do not pick one silently.

**Status of each part.** Sections marked **LOCKED** describe what is built and may not be changed
without the owner saying so. Sections marked **REFERENCE** are built in the engine and follow the
sibling course `signals-and-systems` without a decision of their own here; its `DESIGN.md` has the
detail and is the evidence for them.

### The sibling course is the reference — decided 2026-09-25

The design is the design of `huguryildiz/signals-and-systems`, ported on 2026-09-25: the engine, the
page shell, the stylesheet, the renderer, the plotting library, the print design and the public cover
page. Its Module 1 is the reference for the slide language. This course's modules are converted to
match it from that file and `.claude/rules/`, with no design decision of their own. Where a module
needs something the reference does not show, stop and ask. What was taken, what was adapted and what
stayed this course's own is under *Reference* at the end of this file, so a later port can repeat it.

## Overview

**Creative North Star: "The lecture deck of a careful department"**

A scene is a lecture slide: a title, a rule, two columns, a figure, the equations, and short
information cards. It is read from the back row of a 16:9 room while the instructor talks, so it
carries little prose and large type. The long explanation lives in the lecture notes.

The look is calm, rigorous and editorial: ivory paper or deep navy, a serif title, a plain sans body,
small uppercase mono labels, hairline rules, a 3 px radius. There is no gradient, no glass, no
decorative shadow, no emoji, no hero number. Colour is spent on meaning: the five figure colours say
what a state or an operator *is*, and the card colours say what a card *does*.

**Key characteristics**

- One slide, one figure, two to four tabbed cards. See "Slides" under Layout.
- One idea a card, one or two short sentences a card.
- The stage is full: nothing top-heavy, nothing clipped.
- The same slide works in both themes and in lecture mode without a second design.

## Colors

### Figure colour semantics — LOCKED

Reused unchanged in every module, in every figure, in the artifact and in the notes. The hues are the
reference's; the meanings are this course's:

teal `#14707F` the `|0⟩` component, or the state going in · amber `#C08422` the operator acting on it ·
green `#4A7A46` the state coming out, or the measured outcome · violet `#6A5A92` a phase, or an
intermediate amplitude · red `#A63B2A` an error, or a leaked population.

**Decoherence takes no colour.** It is the hairline tone at low opacity (`--sig-noise`). A probability
shading is a low-opacity fill of the colour of the outcome it belongs to (`--dec-*`). A figure never
uses one of the five for anything else. A card may borrow green for a solution and red for a common
error because those meanings agree; it never borrows teal or violet.

### Surface and accent tokens — REFERENCE

The surface, ink, hairline and accent tokens are the reference's, unchanged, in both themes:

| | light | dark |
| --- | --- | --- |
| canvas | `#FAF8F4` | `#0E1621` |
| raised panel | `#FFFFFF` | `#1A2634` |
| ink | `#232B33` | `#E6E2D9` |
| hairline | `#DCD7CC` | `#27333F` |
| coral, editorial emphasis | `#A0451C` | `#E09A6A` |
| slate, metadata | `#28567E` | `#8FB8DC` |
| navy, module-opening and synthesis scenes only | `#12314E` | `#080F18` |

In the dark theme the figure tokens are light tints: teal `#4FBECE`, amber `#E5B255`, green `#82C27B`,
violet `#AC99DC`, red `#E8785F`.

**Three places hold these values and must move together:** `:root` and `body[data-theme=dark]` in
`build/src/10_style.css`, `LIGHT` and `DARK` in `build/src/60_plot.js`, and the token lists in
`build/textclash.js`. The collision sweep classifies a drawn element by its colour, so a palette change
that skips `textclash.js` makes the gate report on colours the artifact no longer draws.

This course adds two token groups the reference does not have: `--sig-noise` and `--dec-*` in the
stylesheet, `COL.noise` and `COL.dec` in the plotting library. The laboratories fill bars and regions
with them.

### The public cover page — LOCKED

`web/index.html` is the reference's cover: one pinned frame of 300vh, four corner marks, a serif title
that changes with each step, a caption, a timeline and a GitHub button; then the facts row, the seven
chapters and the three documents. It is dark only.

Figure 1 (`web/fig.js`) is section 0.5 of the course, the interferometer H · P(φ) · H, in three steps
driven by the scroll: the flat p(0) = ½ after the first Hadamard, the fringe after the second, and a
fixed run of shots estimating p(0) at φ = 120°. Every number in it is computed from p(0) = cos²(φ/2)
and one binomial sample. The backdrop (`web/backdrop.js`) is this course's Moiré shader on the
reference's schedule.

The documents are linked by address (`/artifact`, `/notes`, `/workbook`, `/reference`), never by file
name; `vercel.json` maps the addresses. `web/sitecheck.js` fails when the facts row disagrees with the
artifact or a link does not resolve. The document images in `web/img/` are the PDFs' first page and
one inside page (lecture notes 24, workbook 8, reference 3); re-render them when those pages change.

## Typography

Serif for the display and scene titles, sans for everything read as a sentence, mono uppercase with
wide tracking for labels: the eyebrow, a card tab, an equation label, the key of a worked-example row.
Mono is used for labels and addresses only, never for running text. The sizes are the reference's
(its `DESIGN.md`, *Typography*).

**Every size is written `calc(Npx * var(--ts))`.** `--ts` is 1 in normal display and 1.36 in lecture
mode. A size written as a bare pixel value does not grow in the lecture room, which is the one place it
has to.

**Laboratory type floor.** Labels 16 px, segmented choices 17 px, values 20 px, readouts 21 px, notes
19 px, captions 18 px, all at `--ts:1`. The reference keys those rules to its own laboratory letters;
the same letters name different laboratories in this course, so the rules are written for `.lab` in
general instead.

**A label frame does not rewrite the mathematics it carries.** `.katex{text-transform:none;
letter-spacing:normal}` resets both for every label class at once. An `eq` block's `label` is
uppercased by the style sheet, so Greek letters and TeX macros never go in it.

## Layout

### The stage — REFERENCE

The fixed 1920×1080 stage, scaled to the window; `fitScene()` and its floor; the fit rule that a
scene needing below about 0.90 is split. These are the reference's.

### Slides — Modules 1 to 3 converted, Modules 4 to 6 owed

Every scene carries `slide:true` except the title, the chapter openings, the summaries, the
question-type pages (`m*-shapes`) and the practice questions. That is the reference's rule.

The reference converted each module by rewriting its scenes into two columns in the ratio 5:7
(`{t:'cols', ratio:'c-5-7', fill:true, …}`): the framed figure and its caption on the left, two to
four tabbed cards on the right. Module 1 was converted this way on 2026-09-26: its 21 teaching slides
each carry one figure, two to four cards and a prediction card (`note.ask`, head **Given**), and every
number a prediction states has a PASS line in `verify/verify_scenes.py`. A worked example became one
labelled `Example` equation, and the card the right column had no room for sits under the figure. A
box diagram cannot stretch like a plot, so `growBlocks()` in `82_scenes_m1.js` centres it in the
taller frame when the slide grows its figure. The two laboratories keep their layout; Laboratory A
still fits only at 0.82 and waits for the laboratory pass. Module 2 followed on the same day with the
same recipe: 19 teaching slides, 3 new figures (the state before and after a reading, the readout line,
the turning relative phase), and none of its scenes under `dense`. A figure drawn with equal pixels to
the unit on both axes does not take `grow:true`, because growing redraws it taller and breaks the
isotropy; its card sits under it instead. `growBlocks()` in `83_scenes_m2.js` also moves a `line`
item. Module 3 followed the same recipe: 23 teaching slides, 3 new figures (two routes to one
expectation value, two ensembles of `I/2` in the disc, the product test on the amplitude array), and
none of its scenes under `dense`. A box diagram drawn 740 px wide prints its labels too small once it
sits in the 5 column; the partial-trace, ordering and amplitude-array figures were redrawn narrower
(560 to 580 px) for that reason. Modules 4 to 6 are not converted yet and `build/qa.js` still lists
many of their scenes under `dense`; `TODO.md` holds the state.

### Phone and portrait tablet — REFERENCE

The one media query in `build/src/40_core.js` picks the layout: a portrait phone (≤760 px) and a
portrait tablet (≤1024 px, touch) get the single-column `data-layout=phone` layout; any screen on its
side gets the desktop stage. A grid track in the phone layout is `minmax(0,1fr)`, never `1fr`.
`build/mcheck.js` sweeps it at four sizes.

### Laboratories

`growLabs()` draws a laboratory's plots taller to fill its column. A frame drawn with equal pixels to
the unit on both axes keeps its height (`isotropic()` in `60_plot.js`), because the Bloch-ball rim and
the unit circle of the complex plane are the claim in those figures and a taller frame would draw an
ellipse. Laboratories G and I take the tighter control spacing the reference gives its stacked
laboratories. Two figures stacked in one laboratory column overflow the stage; `.labgrid` is the
two-track grid that halves the width each is printed at.

## Elevation & Depth

Flat. Depth is tonal: canvas, raised panel, sunken well. There are no shadows on cards, figures or
equations.

## Shapes

One radius, 3 px. Hairline borders, 1 px. The only thicker strokes are the 3 px left edge of a card or
an equation and the 2 px coral segment under a title. A circuit control is a solid dot and a target an
open one; that difference is the whole notation, so `P.blocks` draws a control with `dot`, never with a
stroked circle.

## Components

Cards, card tones, title icons, equations, worked examples, the drill pager with its typed question
number, the question-id pill and worked solutions as cards are the reference's (its `DESIGN.md`,
*Components*). The prediction card and code pages are used (Module 1). Sliders, frames, sound, sketch and the recall deck are
present in the renderer and unused by this course's content; a scene opts into one by the fields the
reference documents.

A code page here has two tabs, **Qiskit** and **NumPy**, where the reference has MATLAB and Python.
Qiskit does not run in the browser (it is not a Pyodide package), so the Qiskit tab offers Copy and
the NumPy tab, which prints the same lines, runs on the page. `CODE_LANGS` in `build/src/90_app.js`
is the course-specific part; the rest of the code page is the reference's.

Two blocks are this course's own: `drilltypes`, the question-type grid on the `m*-shapes` pages, and
the question type carried in the question id.

## Printed documents

Each document opens on a full-bleed navy cover whose art is this course's fringe, p(0) = cos²(φ/2),
sampled by coral stems, with the other outcome behind it in amber. The title page with its meta rows
follows the cover. The lecture notes number figures and tables by chapter and list them; the contents
carry page numbers, which `notes/topdf.js` finds with `pdftotext` and writes in before the final
print. Every page but the cover carries the licence line and the page number; the last page carries
the colophon and the version history (`DOC_HISTORY` in `render.js`, mirrored to
`dist/PDF_VERSIONS.md`). The print rules are in `.claude/rules/notes-and-pdf.md`.

## Do's and Don'ts

**Do**

- Put a figure on every slide that has a state, a gate or a circuit in it.
- Cut a paragraph to one card of one or two sentences, and move what is lost to the lecture notes.
- Split a scene that holds two ideas.
- Multiply every type size by `var(--ts)`.
- Route every text field a renderer accepts through `md()`, a tab and a caption included.
- Re-run `build/qa.js` and `build/textclash.js` after any style change: a restyle changes the fit of
  every scene.

**Don't**

- Don't port a reference rule keyed to a laboratory letter without checking which laboratory that
  letter names here.
- Don't use a figure colour for decoration, or teal and violet for a card.
- Don't add shadows, gradients, glass, emoji, or a second radius.
- Don't set `text-transform` or `letter-spacing` on a `.katex` subtree.
- Don't hard-code a page or ink colour in figure code or in a card.
- Don't write a sentence to sound impressive. The copy rules are in `.claude/rules/content-writing.md`.

## Reference

What the 2026-09-25 port took from `signals-and-systems`, what it adapted, and what stayed this
course's own:

| Layer | Files | Taken from the reference | Kept from this course |
| --- | --- | --- | --- |
| Engine | `build/src/40_core.js` | verbatim | — |
| Page shell | `build/src/00_head.html` | icon toolbar, settings menu, page box, arrows, help-screen credits | title, description, the atom mark, CC BY 4.0 credits |
| Stylesheet | `build/src/10_style.css` | the whole sheet, including the slide language | the mark, `runbar`, `labgrid`, the question-type grid, noise and decision-region tokens |
| Renderer | `build/src/90_app.js` | cards, tones, title icons, drill pager, solution cards, recall deck, code pages, sliders, frames, sound, sketch | the `\Od` macro, backtick code spans, the `drilltypes` block, the question type in the question id |
| Plotting | `build/src/60_plot.js` | back-row emphasis, `flatTeX`, lab growth, phone aspect cap | noise and decision-region colours, `dot`, `decade`/`decades` |
| Print | `notes/src/notes.css`, `notes/src/render.js`, `notes/topdf.js` | navy cover, headings, numbered figures and tables, contents with page numbers, colophon | NC anchors, the mark from `assets/icon.svg`, the title page, CC BY 4.0 |
| Public page | `web/` | the pinned cover frame, timeline, facts row, chapter list, document cards, build script | the Moiré backdrop, Figure 1, the chapter texts |
| Repository | root files, `.claude/`, `.codex/`, `.github/` | file set, `CLAUDE.md` and `.claude/rules/` layout, agent guard, CI workflow, MIT and content licence split | the CC BY 4.0 content licence and `NOTICE`, the numerical suite in `verify/` |
