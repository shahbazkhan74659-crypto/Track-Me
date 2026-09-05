# CLAUDE.md

Rules and instructions for how Claude should work in this repository. The first ever rule is never commit and push anything until i say

## Project Documentation System

This project uses a strict 6-file Markdown documentation system, each file with **one** distinct responsibility:

```text
CLAUDE.md       → Rules and instructions (this file)
PROJECT.md      → Project definition — what we're building, and why
PHASES.md       → Development roadmap — in what order we're building it
TASKS.md        → Current execution — what we're doing right now
ARCHITECTURE.md → System design — how the system works internally
DECISIONS.md    → Technical decision history — why we chose to build it this way
```

Claude must preserve this separation. Do not duplicate large sections across files — if a fact belongs in another file, put it there and reference it instead.

## Mandatory Maintenance Rules

### 1. Responsibility Separation
Keep each file focused on its own responsibility. Do not duplicate large sections across files.

### 2. TASKS.md
Must remain actionable. Tasks should normally belong to a phase defined in `PHASES.md`. Tasks represent concrete work, not vague project goals.

### 3. PHASES.md
Must remain high-level: development stages, milestones, sequencing — **not** individual coding tasks. The project owner determines the number and order of phases. Claude must not arbitrarily restructure the project's phase order or phase count, and must not invent future phases the owner hasn't actually specified.

### 4. ARCHITECTURE.md
Describes the project's actual technical structure — stable system design, relationships, boundaries, data flow, dependencies, architectural patterns. Not a dumping ground for temporary implementation notes.

### 5. DECISIONS.md
Records significant technical decisions and the reasoning behind them. Do not create decision records for trivial coding choices.

### 6. Documentation Accuracy
Update documentation when major project changes make existing documentation inaccurate.

### 7. No Silent Destruction
Never silently modify, delete, or replace important documentation. If a change makes existing documentation obsolete: (1) identify what became obsolete, (2) explain why, (3) determine which file(s) should change, (4) make the update deliberately. Do not casually overwrite historical information.

### 8. Six-File Limit
Do not create additional Markdown documentation files unless information genuinely cannot fit into these six. Assume these six are sufficient by default.

### 9. Actual Project State
Documentation must always reflect the actual project state. Never document a feature, architecture, system, component, or integration as completed when it is not actually implemented. As of this writing, Track Me (see `PROJECT.md` for the app's name) is a client-approved **interactive prototype only** — no production backend, framework, or database exists yet. Do not describe it otherwise.

### 10. Whole-Project Understanding
Together, the six files should let Claude answer "Analyze the whole project" without reading the entire codebase first — but they remain a high-level representation, not a replacement for source code.

## Documentation Conflict Priority

```text
CLAUDE.md
    ↓
PROJECT.md
    ↓
PHASES.md
    ↓
TASKS.md
    ↓
ARCHITECTURE.md
    ↓
DECISIONS.md
```

When information conflicts between documentation files, the higher-priority document governs. **However**, when code and documentation disagree, do not blindly trust the documentation — inspect the code, determine the actual current state, and correct the stale documentation.

## Mandatory Pre-Change Documentation Check

Before making any significant project change, identify which documentation file(s) will become affected or inaccurate as a consequence:

- New project requirement → `PROJECT.md`
- Change in development stage → `PHASES.md`
- New/current implementation work → `TASKS.md`
- Architectural change → `ARCHITECTURE.md`
- Significant technical choice → `DECISIONS.md`
- Change to Claude's working rules → `CLAUDE.md`

A single change may require updates to multiple files.

## Project-Specific Notes

- **As of 2026-09-04**, the repository (`C:\RajuApp`) contains `prototype/` (`Main.dc.html`, `canvas.json`, `attendance-tracker.html` — the approved prototype, unchanged reference only), `Project Docs/` (this documentation system), and — as of Phases 1–3 — the real production Next.js project at the repo root, with a working login backend against a local `trackme_dev` Postgres database. See `ARCHITECTURE.md` for what's actually implemented. The repository **is** git-initialized (`git init` + an initial commit, 2026-09-04) — do not re-run `git init`. Per the rule at the top of this file, do not `git commit` or `git push` anything, including documentation changes, until the owner explicitly says to.
- The prototype is a Claude Design Components (`.dc.html`) artifact, not a standalone runnable web app — it only runs inside the sandboxed Design canvas/Artifact viewer. It has been published as a Claude Artifact (canvas) at `https://claude.ai/code/artifact/7dbcdd35-2167-4212-917e-1740c0fe785c`. Do not treat it as deployable source; a production build will be written fresh, using the prototype only as a visual/interaction reference — see `DECISIONS.md`.
- The prototype uses sample/default data only (per-day salary defaults to ₹800, no attendance entries pre-seeded, all state lives in-memory in the browser tab and is lost on reload). Do not treat prototype numbers as real biographical or financial data.
- The client approved the prototype's design and dark-theme styling on 2026-09-04 (see `DECISIONS.md`) — treat this as the confirmed visual direction for any production implementation.
- The production stack is locked (Next.js/TypeScript, PostgreSQL local-dev/Neon-production, Render, UptimeRobot, a real login-only backend — see `DECISIONS.md`), and the owner has locked the full development roadmap, Phase 0 through Phase 20 (see `PHASES.md`; originally Phase 0–18, renumbered 2026-09-04 when the owner injected Phase 14 "Mobile View / Mobile Responsive," and renumbered again 2026-09-05 when the owner injected Phase 13 "Date Entry Modal on Frontend" — see `DECISIONS.md`'s two "injected" entries). Phases 0–3 are complete. **Do not start the next phase's (or any future phase's) actual implementation work until the owner explicitly says to begin it** — locking the stack/roadmap is not the same as authorizing execution. See `TASKS.md` for the current go/no-go state.
