---
paths:
  - "build/**/*"
  - "notes/**/*"
  - "verify/**/*"
  - "tools/**/*"
  - "web/**/*"
  - "dist/**/*"
  - "vercel.json"
  - ".vercelignore"
---

# Build, gates and deployment

## Repository layout

| Path | Responsibility |
| --- | --- |
| `build/build.js` | concatenates `build/src/*` into `dist/Quantum_Computing.html` |
| `build/src/00…70`, `90_app.js` | the engine, carried forward from the earlier artifact, not redesigned |
| `build/src/80_content_core.js` | `CONTENT.META`, the module list, the glossary, the `NC` mark |
| `build/src/89_sections.js` | **the one place** chapters, sections, addresses and anchors are declared |
| `build/src/8N_scenes_mM.js` | teaching scenes, one file per module |
| `build/src/70_labs.js` + `7N_labs_mM.js` | the laboratory kit and the laboratories |
| `build/src/9N_drill_mM.js` | question sections, one file per module |
| `build/src/99_tail.html` | **scene order** — an array not registered here never appears |
| `assets/icon.svg` | **the only copy of the mark** — favicon, header logo and every PDF title page |
| `notes/src/render.js`, `notes.css` | the lecture-notes renderer and stylesheet, carried forward |
| `notes/src/cN.js` | the lecture notes, one file per chapter; `c1.js` also carries the front matter |
| `notes/src/ca.js` | Appendix A, the formula summary — **the one copy**; `editions.js` slices Part 2 of the formula reference out of it |
| `web/index.html` | the public page, on the same skeleton as the sibling artifact page |
| `web/build-site.js` | assembles `site/` from `dist/`, `web/` and the built artifact — the output is generated and gitignored |
| `web/sitecheck.js` | checks what the published site actually renders |
| `vercel.json` | `/` to the page, and `/artifact`, `/notes`, `/workbook`, `/reference` to the four downloads |
| `.vercelignore` | what reaches the host. `dist/Instructor_Solutions.*` is the line that matters |
| `verify/qcheck.py`, `qops.py` | the shared runner, and the standard operators the gates are built on — including the partial trace, the entropy and the Kraus channels, each written from its own definition rather than from the route the artifact teaches |
| `verify/verify_scenes.py`, `verify_drills.py` | every number in the scenes and in the worked solutions, re-derived |
| `verify/*.py` | the numerical gates |
| `tools/rule_check.py` | banned phrases, figure-label rules, the `NC` mark |
| `source/` | the open course this one adapts — gitignored, never redistributed |

`site/` is not tracked. It is generated on every deploy by `node web/build-site.js`, from
`dist/`, `web/` and the built artifact, and it is gitignored. Never hand-edit it.

## Building

```bash
cd build  && node build.js          # the artifact
cd notes  && node build.js          # the lecture notes HTML
cd notes  && node editions.js       # the workbook, the solutions, the formula reference
cd build  && node pw.js ../notes/topdf.js   # every edition printed
```

Python is the arm64 venv at `.venv/`, built from `/opt/homebrew/bin/python3.12`:

```bash
/opt/homebrew/bin/python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Never the x86_64 anaconda `python3`. `source/` is gitignored and must be present locally before
anything can be checked against it.

## The gates, and what each must print

```bash
for f in build/src/[789]*.js; do node --check "$f"; done   # not a gate; runs first
cd build && node pw.js qa.js                 # 0 errors, 0 overflow, nothing under `dense`
cd build && node pw.js labtest.js            # ERRORS: none, options=0
cd build && node pw.js textclash.js          # TOTAL COLLISIONS: 0
cd build && node pw.js mathscan.js           # SCENES WITH MATH DAMAGE: 0 / N
cd build && node pw.js labwalk.js            # PROBLEMS: none
cd build && node pw.js seccheck.js           # PROBLEMS: none
.venv/bin/python tools/rule_check.py "build/src/8[1-9]_scenes*.js" \
  "build/src/9[2-8]_drill_m*.js" "build/src/7[0-9]_labs*.js" "build/src/7*_code*.js" \
  "notes/src/*.js" "web/index.html"
.venv/bin/python verify/verify_scenes.py     # N passed, 0 failed
.venv/bin/python verify/verify_drills.py     # N passed, 0 failed
.venv/bin/python -m pytest verify/ -q        # the runner's own tests
.venv/bin/python verify/code_check.py         # N passed, 0 failed, 0 skipped
cd build && node pw.js ../notes/mathscan.js  # LITERAL MATH IN NOTES: 0, KATEX ERRORS: 0
cd build && node pw.js ../web/sitecheck.js   # SITE: no problems
```

Report the numbers a run actually printed. Never a summary in place of a run.

None of the gates reads the phone layout. When anything in `10_style.css`, `40_core.js` or
`90_app.js` is touched, run `mcheck.js` at four sizes as well:

```bash
cd build && node pw.js mcheck.js              # PAGE SCROLLS SIDEWAYS / SPILLED / TARGETS: none
cd build && node pw.js mcheck.js --w=320 --h=568
cd build && node pw.js mcheck.js --w=844 --h=390     # a phone on its side
cd build && node pw.js mcheck.js --w=820 --h=1180    # a tablet upright
```

On a local machine, run every browser gate through `pw.js`, one per command: `qa.js`,
`textclash.js`, `mathscan.js` and the others fail when started with plain `node`. macOS has no
`timeout` command, so do not chain several browser gates in one shell command with a `timeout`
wrapper — run each gate on its own and read its summary line. Every Playwright script uses the
existing container-path `require('/home/claude/.npm-global/lib/node_modules/playwright')`; do not
rewrite that line. `build/pw.js` redirects resolution to the available local Playwright
installation.

`verify/code_check.py` runs every code-page program in both forms and compares what each prints
with its `out`. The NumPy half runs with `.venv/`. The Qiskit half needs Qiskit, which is not in
`requirements.txt`: it runs with `.venv-qiskit/` (gitignored), built once with
`/opt/homebrew/bin/python3.12 -m venv .venv-qiskit && .venv-qiskit/bin/pip install qiskit`, or with
`$QISKIT_PYTHON`. Without either the Qiskit half reports SKIP, which is what CI does.

## Deployment

`https://quantum-computing-tedu.vercel.app` is the published address. The page in `web/`, built
into `site/` by `node web/build-site.js`, with `/artifact`, `/notes`, `/workbook` and `/reference`
rewritten onto the four files by `vercel.json`. The instructor edition is not on the host:
`.vercelignore` excludes it, and `/dist/Instructor_Solutions.pdf` answers 404.

A push to `main` deploys on its own: the project is linked to the repository and
`.vercel/project.json` is what links it, so the live page is whatever `main` last said.
`vercel --prod` from the repository root is the manual route and is only needed when a deploy has
to happen without a commit. Two things it needs and neither is obvious: `requirements.txt` is
excluded, because the platform reads it as a Python application and fails looking for an
entrypoint, and `vercel.json` says `framework: null` with `outputDirectory: "site"`, because this
is a directory of static files and nothing is built on the host beyond `node web/build-site.js`.

`node web/build-site.js` also places the Python runtime for the code pages' Run button in
`site/pyodide/`: `web/pyodide.js` fetches Pyodide and the NumPy and Matplotlib packages from
jsDelivr and checks each file against a pinned SHA-256. Files are cached in `web/.cache/`;
`SKIP_PYODIDE=1` skips the step for an offline build, and Run then reports that Python could not be
loaded. A code page opened from `file://` offers Copy only.

## Traps

- **Never run a blanket search-and-replace over `build/src/*.js`.** A backslash means one thing in
  JavaScript and another inside a TeX string.
- **`node --check` takes one file.** `node --check build/src/*.js` checks the first and ignores the
  rest without complaining. Loop over the glob instead.
- **A `const` at the top level of a classic script is not a property of `window`.** A probe reading
  `window.LABS` finds nothing and reports a laboratory missing that is present.
- **`labwalk.js` assumed a transport slider named `phase` and a `Measured` readout beside it.** Both
  come from the engine's source course and neither exists here, so its accumulation check is now
  guarded by the presence of both. A gate that crashes on a laboratory it was not written for is a
  gate that gets deleted.
- **A student-facing page may not name a file, and a download link names one.** `rule_check.py` bans
  `\.pdf\b` because naming a file is naming a source. The public page therefore links to
  `/artifact`, `/notes`, `/workbook` and `/reference`, and `vercel.json` maps those to the files.
  Narrowing the rule for one page would have been the wrong repair: the rule is what keeps every
  other page clean.
- **`.gitignore` and `.vercelignore` have to agree about what ships.** `.vercelignore` assumed the
  printed editions were on the host; `.gitignore` dropped two of the three before they could reach
  it, so two links on the public page would have been dead and nothing local would have shown it.
  The HTML intermediates are ignored, the printed editions are tracked, and the instructor edition
  is ignored in both.
- **Two pages by the same hand should read as one system.** The first public page here was written
  from scratch and looked like a different product beside the sibling artifact's page. The fix was
  not more design: it was taking that page's skeleton — the same sections in the same order, the
  same class names, the same type scale, an external stylesheet and one script per moving thing —
  and changing only the palette, the instrument and the words. Look at the sibling before writing a
  surface that will sit beside it.
- **A `requirements.txt` in the root makes a static site a Python deployment.** The first `vercel
  --prod` failed with "No python entrypoint found" — the pin for the numerical suite, which does not
  ship, was enough for the platform to decide what the project is. It is excluded in
  `.vercelignore`, and `vercel.json` names the project static outright.
- **`git add -A` commits whatever else is in the tree, including work in progress that is not
  yours.** The deployment commit swept up a half-finished Bloch-camera change in `70_labs.js`,
  `74_labs_m4.js` and `75_labs_m5.js` that had appeared minutes earlier, and pushed it under a
  message about a domain name. Somebody else may be editing this repository at the same moment.
  Stage by path — `git add web/ vercel.json README.md` — and read `git status` immediately before
  committing rather than several steps earlier.
- **Commit sources and any rebuilt `dist/` file together, never in separate commits.**
