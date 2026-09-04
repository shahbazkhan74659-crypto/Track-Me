# Architecture

This describes the **actual current implementation** — an interactive design prototype only. No production application exists yet. See `DECISIONS.md` for the reasoning behind building it this way, and `PROJECT.md`/`PHASES.md` for what comes next. The **Planned Production Architecture** section below records the locked stack ahead of any of it being built — see `CLAUDE.md` rule 9: do not treat anything in that section as implemented until it actually is.

## System Overview

The repository (`C:\RajuApp`) currently contains only a `prototype/` directory:

- `Main.dc.html` — hand-authored Claude Design Components source: the entire app in one file (markup with `{{hole}}`/`sc-if`/`sc-for` templating, plus a `class Component extends DCLogic` JS logic block).
- `canvas.json` — the single-artboard canvas layout manifest (positions `Main.dc.html` as the one artboard, launches focused).
- `attendance-tracker.html` — the seeded, publishable payload: `Main.dc.html`/`canvas.json` bundled with the Design Components editor/runtime into one self-contained page.

The seeded file has been published as a Claude Artifact (Design canvas) at `https://claude.ai/code/artifact/7dbcdd35-2167-4212-917e-1740c0fe785c` — this is how the prototype is actually viewed and interacted with. It is **not** a standalone deployable web app; `.dc.html` source only runs inside the Design Components sandboxed preview runtime. No production framework, server, backend, or database exists. The repository is not git-initialized.

## Technology Stack (prototype only)

- Claude Design Components format (`.dc.html`): plain HTML, a constrained templating syntax (dotted-path `{{holes}}`, `sc-if`, `sc-for`), and a React-class-like JS logic block (`state`, `setState`, `renderVals()`), executed inside a sandboxed preview iframe by the platform-provided runtime (`support.js`, injected at render time).
- Fonts: Google Fonts — Manrope (headings/numbers), Work Sans (body) — loaded via `<link>` in `<helmet>`.
- Styling: inline `style="..."` attributes throughout (state-driven values computed in JS and bound via holes), plus a small `<style>` block in `<helmet>` for `:hover` states and spin-button styling. Colors are defined with `oklch()`.
- No package manager, no build tooling, no server-side code, no database.

## Application Structure (prototype only)

Single artboard, single component (`Main.dc.html`), no routing. All state lives client-side, in memory, in the component's React-like `state`:

- `year` / `month` — the calendar's currently displayed month (0-indexed month).
- `perDaySalary` — the single per-day rate the owner sets via Salary Setup; every other figure is derived from it.
- `entries` — a plain object keyed `"<year>-<month>-<day>"` (no zero-padding) → `{ status: 'present' | 'half' | 'leave', advanceOn: boolean, advance: number }`.
- `openDate` + `draftStatus` / `draftAdvanceOn` / `draftAdvanceAmt` — the currently-open date-entry modal's target date and in-progress (unsaved) edits.
- `salaryOpen` / `salaryDraft` — the Salary Setup modal's open state and in-progress input.

The calendar grid (42 cells, 6 fixed rows) and all derived display values (formatted ₹ labels, per-status button/cell styling, the "today" ring, stat-card totals) are recomputed from `state` on every render inside `renderVals()` — nothing is cached or memoized beyond React's own re-render.

## Data / Persistence

None. All state is in-memory only and is lost on page reload — an explicit, current limitation of the prototype, not yet addressed. The production persistence approach (local storage, a backend + database, or something else) has not been decided — see `DECISIONS.md`.

## Important Invariants

Documented so a future production build doesn't regress behavior already established (and debugged) in the prototype:

- Entry keys are built as `` `${year}-${month}-${day}` `` with a **0-indexed month** and **no zero-padding** on month or day — this exact format is relied on both when writing entries and when filtering them by the currently displayed month (a string-prefix match on `` `${year}-${month}-` ``).
- Advance tracking uses a dedicated `advanceOn` boolean, separate from `advance` (the amount). Do not go back to treating `advance > 0` as "was an advance taken" — a real ₹0 advance must still count as taken; this was a bug found and fixed during prototyping (see `TASKS.md`).
- The Done button in the date-entry modal is disabled until a status (Present/Half-Day/Leave) is selected; an advance amount alone, with no status, cannot be saved.
- Earned So Far = (present days × per-day rate) + (half days × per-day rate ÷ 2), summed over entries in the currently displayed month only.
- Net Payable = Earned So Far − Advance Taken, both computed over the currently displayed month only (not the whole year, not "up to today" if viewing a different month).
- Calendar navigation (prev/next month) rolls the year over automatically at the Dec/Jan boundary; there is a separate "Today" shortcut back to the current month.

## Planned Production Architecture

**Not yet built.** Recorded here so the production build has a target — see `DECISIONS.md`'s "Production stack locked" entry and `PHASES.md`.

- **Framework:** Next.js, written in TypeScript, for both the frontend and the backend — one project, one language. No separate Express/API server.
- **Frontend:** Plain React (via Next.js), not a server-rendered-template-plus-islands layer — there's no separate template engine to embed React into, unlike the `core`/Django-templates approach used in `C:\Portfolio`. Interactive actions (saving a date entry, changing salary, live stat recalculation) call Next.js API routes via `fetch` (AJAX-style, no full page reloads), carrying forward the interaction feel already established by the prototype.
- **Backend:** Next.js API routes / route handlers, same project as the frontend.
- **Database:** PostgreSQL — a local Postgres install for day-to-day development, Neon (serverless Postgres) in production. Replaces the prototype's in-memory `entries` object with real persisted rows; the prototype's entry shape (`{ status, advanceOn, advance }` keyed by date) and its invariants above are the intended starting schema shape, not a redesign.
- **Hosting:** Render, free tier.
- **Uptime:** An UptimeRobot monitor pinging the deployed app, to counter Render free tier's idle spin-down (same reason this pattern is used in `C:\Portfolio`).
- **Auth:** Not yet decided — the app is single-user by design (see `DECISIONS.md`), but whether the deployed instance needs a simple password/PIN gate (since it's reachable by anyone with the URL) is still open. See `TASKS.md`.
