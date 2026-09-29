---
paths:
  - "build/src/10_style.css"
  - "build/src/60_plot.js"
  - "build/src/7*.js"
  - "build/src/8*.js"
  - "build/src/9*.js"
  - "build/textclash.js"
  - "notes/src/**/*.js"
  - "web/**/*"
---

# Figures, typesetting and layout

## Editorial rules for mathematics in figures

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

## Colour semantics

Teal is the `|0⟩` component or the state going in, amber the operator acting on it, green
the state coming out or the measured outcome, violet a phase or an intermediate amplitude, red an
error or a leaked population. **Decoherence takes no colour** — it is the hairline tone at low
opacity, the same treatment noise had in the engine's source course. A probability shading is a
low-opacity fill of the colour of the outcome it belongs to.

## Traps

Carried forward from the engine's source course, all of them met at least once there, plus the ones
this course has met so far.

- **A figure built at load time keeps the palette it was born with.** Pass a function to `fig.svg`
  and `raw.html`, never a string built at module scope.
- **`textclash.js` classifies by colour.** A palette change that skips it leaves it measuring
  nothing while still reporting green.
- **A figure rule can reach into typeset mathematics.** `#scene-host svg` and `figure svg` make
  every SVG in their scope a full-width block, and KaTeX draws a tall square root as a surd whose
  tail is a small SVG. If either rule is touched, look at an equation with a root in it — and this
  course has roots in almost every scene.
- **Look at screenshots.** Several bugs in the engine's source course were invisible to every gate
  and visible at a glance.
- **A backslash before a semicolon inside a JavaScript string is a lost escape.** A TeX backslash survives a JavaScript
  string only when it is doubled, so `'\;'` is the one-character string `;` and the thin space never
  reaches KaTeX. `rule_check.py` catches it inside a figure label and nothing catches it inside an
  `eq` or a worked solution, so it is worth a scan of the whole file after writing one: a backslash
  followed by a semicolon and not preceded by another backslash is always wrong.
- **A small number handed to KaTeX as `2.23e-10` is typeset as an italic `e` minus ten.** Split the
  mantissa from the exponent and write it as a power of ten before typesetting. Laboratory B's
  verdict shipped the subtraction until a screenshot showed it.
- **A geometry figure has to be isotropic or its right angles are lies.** `Axes` maps the two ranges
  to the two pixel extents independently, so a right angle survives only where
  `(xr span)/(yr span)` equals `(w - padl - padr)/(h - padt - padb)`. The Gram-Schmidt figure of the
  notes is where this matters, because the right angle is the proof.
- **`labwalk.js` assumed a transport slider named `phase` and a `Measured` readout beside it.** Both
  come from the engine's source course and neither exists here, so its accumulation check is now
  guarded by the presence of both. A gate that crashes on a laboratory it was not written for is a
  gate that gets deleted.
- **A demonstration of floating-point cancellation has to be built off the coordinate axes.** With
  `v1 = (1,0,0)` the first Gram-Schmidt subtraction cancels a coordinate against itself and comes
  out exactly zero, so Laboratory B reported perfect orthogonality at every setting and was
  measuring a property of the coordinates. One fixed generic rotation of all three inputs fixes it.
- **Two figures stacked in one laboratory column overflow the stage.** `#scene-host svg` makes every
  figure a full-width block, so two of them are two full-height figures. `.labgrid` is the two-track
  grid that halves the width each is printed at, and therefore halves its height too.
- **A figure caption is a claim, and the numerical gate is what checks it.** Chapter 2 shipped a
  caption saying a beat returns to one at `omega t = 4 pi` when it does so at `2 pi`; the scene
  gate caught it because the caption's claim had been written down as a check. A caption nobody
  turned into a check is a caption nobody has read carefully.
- **The arrowhead in `P.blocks` always points right.** A vertical arrow therefore draws its head at
  ninety degrees to its own line, and no gate reads a rendering. Chapter 4's universality figure
  shipped one until a screenshot showed it; it is now a plain connector with a word beside it.
- **A `line` item in `P.blocks` is stroked and never filled.** A circuit control is a solid dot and a
  target is an open one, and that difference is the whole notation, so a control drawn as a circular
  path is drawn as a target. `P.blocks` gained a `dot` item for exactly this, and all three circuit
  figures of chapter 4 use it.
- **A figure's margin legend must be coloured by what the colour marks, not by what the sentence
  names.** Chapter 4's Pauli figure said "X: a half turn about x" in the colour of the two states
  that move, which are on the *z* axis. Both statements were true and the pairing read as an error.
- **A readout value of `-5.55e-17` is a zero with rounding on top.** `LABS.KIT.F` prints an exponent
  rather than rounding a tiny value to zero, which is right for a quantity that is genuinely small
  and wrong for a Bloch component that is exactly zero. Snap below the last digit shown, and only
  there.
- **A grid track written `1fr` is `minmax(auto,1fr)`.** In the phone layout that lets one wide
  figure or one long formula push the whole page past the edge of the screen. Every single-column
  track there is `minmax(0,1fr)`.
- **The Bloch `y` component has a minus sign in one route and not in the other.** For a state
  `psi = (a, b)`, `r_y = 2 Im(a* b)`; for a density operator, `r_y = -2 Im(rho_01)`, because
  `rho_01 = a b*` is the conjugate of `a* b`. Laboratory G shipped the first with a minus sign and
  laboratory I shipped the second without one, and in both cases every number on the page stayed
  plausible while the sphere was mirrored. The test is `|+i>`, which must read `r_y = +1`.
- **A classical wire is as easy to cross as a qubit wire, and nothing catches it.** The
  teleportation figure had the bit from `q_1` running to the `Z` and the bit from `q_0` to the `X`.
  The drawing is well formed, every gate is real, and the circuit repairs one branch in four.
  Draw the correction wires last and read the table off the figure to check them.
- **A figure that claims a depth has to have that depth.** Chapter 5's circuit figure put its last
  gate on a wire that had been free since layer two, so the gate could have run a layer earlier and
  the depth the caption claimed was one more than the depth the circuit had. Where a caption states
  a layer count, lay the gates out and count them.
- **A figure whose point is "these two run together" has to draw them together.** The depth figure
  drew the tree's two parallel gates at two different horizontal positions, so the only thing that
  figure exists to show was invisible. Two faint rules and the words "one layer" are what say it.
- **A number in a figure and the same number in the worked example beside it are two claims.** The
  Grover claim figure said thirty-two queries where the optimum is twenty-five, because the square
  root was written without the factor of `pi/4`. The worked example next to it had the right
  number and no gate compares the two.
- **A caption that names a count has to match what the figure marks.** The resource-claim figure
  put one box in the error tone under a caption saying "the two in the error tone". This is the
  chapter-4 Pauli-figure trap again, in a different form.
- **A figure aspect ratio is a scene budget.** `#scene-host svg` makes every figure a full-width
  block, so a 560 by 360 frame is a quarter taller on the page than the 560 by 280 the rest of the
  course uses, and that alone drove `m6-qft` to 0.82. A scene under 0.90 is usually two ideas and
  is sometimes one tall figure; measure the frame before splitting the scene.
- **A range that excludes zero draws a full rectangle, and a name near the top sits on it.**
  `Axes` draws its zero axes when both ranges contain zero and a frame rectangle otherwise. A note
  placed within about one twentieth of the top of such a frame is struck through by the frame's own
  border, and no gate reads that. Two chapter-6 figures shipped it.
- **`stem` is drawn outside the clip.** `curve` is clipped to the data area and `stem` is not, so a
  stem taller than the range runs off the top of the frame and over whatever is above it. The
  phase-estimation precision figure had a peak of 0.875 in a frame that stopped at 0.78, and the one
  thing that figure exists to show was the thing that left the picture.
- **A row of names under a row of boxes is a claim that they pair up.** The chapter-6 opening
  figure named its four algorithms in four columns beneath its four steps, and they do not
  correspond at all. One centred line fixes it. Same fault as the chapter-4 Pauli figure.
- **Colour a table by what the column means, not by the row.** The order-finding failure table had
  one repair drawn in two colours, because the colour marked how bad the failure was and the
  column it landed in was "what to do". Two rows that share a repair share a colour.
- **A control line drawn from the centre of a gate box runs through the gate's own label.** The
  transform circuit did this on all three of its controlled rotations. Start the line at the edge
  of the box, `y ± h/2`.
- **A nested-box picture of complexity classes asserts something about every pair.** Two of those
  pairs are open questions, so the drawing states things nobody knows. The four classes are drawn
  as four boxes with the known containments written out beneath them, and the caption says why.
- **`md()` handled `$…$` and not backticks.** The notation glossary and the conventions manifest both
  write a NumPy call in backticks, so the backticks reached the page as backticks — in the artifact,
  in the lecture notes and in the printed formula reference at once, and no gate looks for one. Both
  renderers now typeset mathematics first and turn a backtick span into `<code>` after it.
- **`&rang;` is not `&#10217;` everywhere it is read.** The entity name rendered as a parenthesis in
  the conventions block of the public page and the numeric reference rendered as the angle bracket
  it is. Where a page carries notation without KaTeX, write the numeric reference and set it large
  enough that an angle bracket does not read as a bracket.
- **A name at the edge of a frame claims to label whatever is nearest it.** The Bloch ball may now
  be turned, and at the view looking down the z axis the poles project to a stub near the centre
  while `|0>` and `|1>` were still drawn at the top and bottom of the frame — where they read as
  names for the rim. Every axis name is now dropped as soon as its own axis projects shorter than
  four fifths of the rim. No gate reads this; a screenshot of the dragged ball is what showed it.
- **A canvas readout pinned to the four corners is a constraint on the drawing.** The first
  instrument drew its plot under its own HUD: the bit string crossed the top gridline and the axis
  name collided with the bar labels. Inset the drawing past every corner of the readout and set
  those numbers by looking at the rendered screen, not by guessing.

## Laser and board on a touch screen

Both live in `build/src/40_core.js`, which is byte-identical in signals-and-systems,
digital-communications and quantum-computing, so a change to either goes into all three in the same
session, each rebuilt and checked, and each commit message names the sync. Both canvases cover the
whole page and are never moved or offset to follow a pinch zoom. A point is carried into a canvas
through that canvas's own `getBoundingClientRect()`, read at the same moment as the event: Safari on
iOS, and so every browser on an iPad, measures client coordinates from the visible part of a zoomed
page, Chrome on a desktop from the page, and a correction through
`visualViewport.offsetLeft`/`offsetTop` shifts the dot twice on one of them. The laser canvas sits
in the top layer as a manual popover and is raised again whenever another popover opens, so no flip
card, scaled stage or menu paints over it. Its backing store follows `devicePixelRatio` times the
zoom, rounded to half steps and capped at 12 megapixels; do not reallocate it on every pinch frame.
`touch-action` alone does not stop iPadOS from taking a pencil's first contact for a tap, a long
press or a scroll and cancelling it: the board canvas cancels its own `touchstart` and `touchmove`
(non-passive listeners), and the laser cancels `touchmove` while a stroke is being drawn. On the
board, once a pen has touched it a finger is a resting palm and writes nothing; before that a finger
writes, and a pen set down while a finger is writing takes the pointer and the finger's stroke is
dropped. While the board is open the slide keys are held and the laser answers the pointer only when
the board's Laser tool is chosen (`board.lasering()`). After a change here, check on a real iPad,
unzoomed and pinch-zoomed, that a pencil tap leaves a dot, a quick stroke is not lost, a resting
palm writes nothing, a pen takes over from a writing finger, and the laser dot lands under the
pencil, over a slide and over the board.
