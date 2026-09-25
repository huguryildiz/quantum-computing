# Local working area

This folder is ignored by git. Only the agent instructions and guards are tracked:
this README, `settings.json`, `rules/`, and `hooks/`. Everything else is a local
working record and never leaves this machine.

| Folder | Tracked | What goes in it |
|---|---|---|
| `rules/` | yes | path-scoped content, figure, notes/PDF, source, and build instructions; `CLAUDE.md` routes Codex to the relevant file |
| `hooks/` | yes | the shared `PreToolUse` guard and its behaviour test |
| `commands/` | no | the `/uret` command that works through the plans |
| `plans/` | no | the plans, one per phase; their `- [ ]` checkboxes are the state of that work |
| `specs/` | no | the design record for each plan, under the same date |
| `notes/` | no | the coverage audits (`scope-audit-2.md` is current) and scratch findings |
| `reference/` | no | `history.md`: how the course reached its state, and the numbers recorded before the port |

The tracked `settings.json` and the repository's `.codex/hooks.json` both run
`hooks/agent_guard.py` before a tool call; it blocks common `npm install` calls
and direct edits to `dist/`. Codex requires the user to review and trust a new
hook definition before it runs. These agent hooks do not run in CI.

`plans/`, `notes/` and `reference/history.md` exist only on this machine; back up
the working copy accordingly. Current work and release state are in the root
`TODO.md`, which is also local.
