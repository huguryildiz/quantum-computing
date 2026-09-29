# Quantum Computing — operating instructions

This file is authoritative for routine work. `AGENTS.md` links to it so Codex and Claude share one root contract. This file, `DESIGN.md`, `PRODUCT.md`, and selected `.claude/` instruction files are tracked. Working plans, specs, notes, audits and other local records remain outside git and must be backed up with the working copy.

## Communication and authority

- Be exact about what was verified. Do not invent source content, textbook anchors, results, or gate outcomes.
- The build pipeline, the content schema, the fixed conventions (qubit order, global phase, inner product, ħ = 1) and the sections of `DESIGN.md` marked LOCKED are locked. If a requested change needs one of them to change, report the issue before modifying it.
- Use `TODO.md` for current work and release state. Read `DESIGN.md` before editing a scene, figure, or style; read `PRODUCT.md` before design work. Read `.claude/reference/history.md` when the reason for a decision is unclear.
- The design is the design of `signals-and-systems` (`~/Documents/GitHub/signals-and-systems`). Its `DESIGN.md` and `.claude/rules/` are the reference for every design decision this repository does not record itself.

## Task-specific rules

Claude Code loads path-scoped `.claude/rules/` files automatically when it reads matching files. Codex must read the relevant rule files before making the corresponding change:

| Task | Read |
| --- | --- |
| Student-facing content, examples, questions, mathematics | `.claude/rules/content-writing.md` |
| Scenes, figures, plotting, styles, KaTeX | `.claude/rules/figures-and-math.md` and `DESIGN.md` |
| Notes or PDF production | `.claude/rules/notes-and-pdf.md` |
| Source material, credit, textbook anchors | `.claude/rules/source-audit.md` |
| Build, verification, site, or generated output | `.claude/rules/build-pipeline.md` |

Read all applicable rows. These files hold the audience, the editorial rules, the fixed conventions, the commands, the gates and every known implementation trap. Keep them as the single source of those details; do not duplicate their full text here.

## Repository and working loop

- `build/src/` holds the interactive artifact; `notes/src/` holds the lecture notes; `web/` builds the public site; `verify/` holds numerical checks; `dist/` is generated output. `source/` is a clone of the open course this one adapts (CC BY 4.0); it is gitignored and never redistributed.
- The one place for chapter, section, address, and textbook anchors is `build/src/89_sections.js`. Scene order is assembled in `build/src/99_tail.html`.
- The credit line the licence requires is written once, in `CONTENT.META.adapted`, and printed in every published copy. Citing that course as an authority on a student page is banned; crediting it is required.
- Run `git status` before writing generated output. Preserve unrelated changes in this shared tree. Stage only task-owned paths and state what a commit contains beyond your own work.
- Never hand-edit `dist/`, run `npm install`, or fetch dependencies from the network. Do not run blanket search-and-replace across `build/src/*.js`.
- `.claude/settings.json` and `.codex/hooks.json` call one repository guard: `agent_guard.py` blocks common `npm install` calls and direct agent edits to `dist/` before a tool runs. Codex requires review and trust of new hook definitions before it runs them. These agent hooks are not CI gates; `.github/workflows/checks.yml` is.
- For routine source changes (styling, wording, a single figure), rebuild and inspect a screenshot; that is the whole loop. Run the full gate chain only before a release, after a change to mathematics or laboratory logic, or when the owner asks. Report actual gate numbers; do not substitute old baseline counts.
- Commit rebuilt tracked `dist/` files with the sources that produced them. Commit and push to `main`; a push to `main` deploys https://quantum-computing.huguryildiz.com. No pull requests and no AI attribution in commits: no `Co-Authored-By`, no `Claude-Session`, and the author is `huguryildiz`.
- This repository shares its engine with `signals-and-systems` and `digital-communications`. `build/src/40_core.js` is kept byte-identical with theirs; `60_plot.js`, `90_app.js`, `10_style.css`, `notes/src/notes.css`, `notes/src/render.js`, `notes/topdf.js`, `build/pw.js` and `web/` share their machinery but carry course-specific parts (the Bloch sphere, circuits, noise and decision-region tokens here). A fix to shared machinery goes into every repository that carries it, in the same working session, each rebuilt and checked, and each commit message names the sync. Course-specific additions stay in their own repository. Do not align the files wholesale.
- If work spans hours or is interrupted, update `TODO.md` and append durable context to `.claude/reference/history.md` before ending.
