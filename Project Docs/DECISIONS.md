# Technical Decisions

These decisions were made during initial prototyping. They are recorded here as established direction for `ARCHITECTURE.md` and `PHASES.md`. Where reasoning was not explicitly stated by the owner, this is marked rather than guessed.

## Decision: Personal, single-user scope — no authentication planned

- Status: Accepted
- Date: 2026-09-04
- Context: The owner described the app explicitly as "for personal use" / "a single user self attendance record app."
- Decision: Treat the app as strictly single-user. No login/authentication system is in scope unless the owner says otherwise.
- Reasoning: Matches the original brief verbatim.
- Consequences: Production architecture decisions (e.g. whether there's a real backend at all vs. a purely client-side/local-storage app) should default to single-user assumptions unless revisited. See `PROJECT.md`'s Non-Goals.

## Decision: Prototype built as a Claude Design Components canvas, not hand-coded

- Status: Accepted
- Date: 2026-09-04
- Context: The app's visual design and interaction flow needed to be explored and confirmed with the owner before any production stack was chosen.
- Decision: Use Claude's Design Components format (a `/design`-generated canvas, published as a Claude Artifact) for the interactive prototype, rather than a hand-coded throwaway mockup or code written directly against a not-yet-chosen production framework.
- Reasoning: Produces a fully interactive, clickable mockup (calendar navigation, modals, live stat recalculation) the owner can review and approve immediately, without first committing to a production stack.
- Consequences: The prototype's source (`prototype/Main.dc.html`) only runs inside the Design Components sandboxed runtime — it is not portable or reusable as production code as-is. A production build will be written fresh, using the prototype purely as a visual/interaction reference. See `ARCHITECTURE.md`, `PHASES.md`.

## Decision: Fintech-dashboard aesthetic — Manrope + Work Sans, oklch palette, dark theme

- Status: Accepted
- Date: 2026-09-04
- Context: The owner asked for a "well professional and aesthetic style... very polished and clean and professional" look, with no existing brand or design system to match (RajuApp is a new, empty project). No design direction was specified up front, and the brief already named a concrete deliverable (a clickable prototype), so a direction was committed to directly rather than sketching alternates first.
- Decision: A clean fintech-dashboard visual language — Manrope (headings/numbers) paired with Work Sans (body), an `oklch()`-defined color system (warm-neutral background, a single deep indigo/blue accent, semantic green/amber/rose status colors for Present/Half-Day/Leave), soft-tinted calendar-cell backgrounds with a status dot, and centered modal dialogs for date entry and salary setup. Originally built light-themed; converted to a dark theme (near-black background, brightened accent and status colors for dark-background contrast) the same day at the owner's request, with layout/structure/typography left unchanged.
- Reasoning: Matches the owner's stated "professional/polished" direction; dark theme was an explicit, direct owner request after reviewing the light version.
- Consequences: Dark theme is now the client-approved, confirmed visual direction (owner approved 2026-09-04) for any production implementation. See `PROJECT.md`, `PHASES.md`.

## Decision: No production stack chosen yet

- Status: **Superseded** (2026-09-04) — see "Production stack locked" below.
- Date: 2026-09-04
- Context: Only the prototyping stage (Phase 0) had been done at the time; the owner had not yet specified a production framework, hosting target, or persistence approach.
- Decision: Not yet made.
- Reasoning: N/A — decision was pending.
- Consequences: Superseded same-day once the owner locked the stack below.

## Decision: Not deployed as a purely client-side/local-storage app

- Status: Accepted
- Date: 2026-09-04
- Context: The owner clarified the app is for someone else, not just themself locally — it must be deployed and reachable in a browser, not confined to one person's browser storage.
- Decision: The app needs real server-side persistence (a database), not localStorage-only state.
- Reasoning: A recipient other than the owner needs to open it in their own browser and see their own persisted data; localStorage is per-browser and wouldn't survive that.
- Consequences: Revises the single-user "purely client-side app" option raised earlier in "Personal, single-user scope" — single-user still holds (see that decision), but a real backend + database is now required. See "Production stack locked" below.

## Decision: Production stack locked — Next.js (TypeScript) + PostgreSQL (Neon/local) + Render + UptimeRobot

- Status: Accepted
- Date: 2026-09-04
- Context: RajuApp needed a production stack lighter than Django for a small, single-page personal tool, deployable so someone else can use it in a browser. Node.js vs. Next.js and the TypeScript question were discussed first: Next.js runs on Node — choosing it doesn't add a separate language, it bundles a Node backend and a React frontend into one project instead of hand-wiring a separate Express API against a separately-chosen frontend. The owner then locked the full stack in one message.
- Decision:
  - **TypeScript** — the app's language, frontend and backend both.
  - **Next.js** — the framework; both the UI and the backend (API routes / route handlers) live in one Next.js project, one language, no separate frontend/backend codebases.
  - **React frontend, AJAX-driven** — the UI is plain React via Next.js (there's no separate server-rendered template layer the way the Django-based `Portfolio` project has, so there's no literal "islands into templates" pattern to build); interactive updates (saving an attendance entry, changing salary, live stat recalculation) go through Next.js API routes called via `fetch`, without full page reloads — carrying forward the same AJAX-driven interaction feel as the approved prototype.
  - **PostgreSQL** — local Postgres for day-to-day development; **Neon** (serverless Postgres) as the production database.
  - **Render (free tier)** — production hosting for the Next.js app.
  - **UptimeRobot** — a keep-alive ping against the deployed app, to prevent Render's free tier from idling/spinning down.
- Reasoning: Owner's explicit choice. Matches the "lighter than Django" requirement (no ORM-migration ceremony, no bundled admin panel, one language across the stack) while still giving real, multi-browser server-side persistence per the "not client-side-only" decision above. Postgres/Render/Neon/UptimeRobot is also a hosting pattern already proven to work end-to-end on a prior project in this workspace (`C:\Portfolio`), so it carries known operational tradeoffs (e.g. Render free tier's idle spin-down, which UptimeRobot exists specifically to counter) rather than unknown ones.
- Consequences: Unblocks `PHASES.md`'s Phase 1 (production project setup). Supersedes "No production stack chosen yet" above. Still open: whether the deployed app needs any access protection (password/PIN), since it will be reachable by URL for someone other than the owner — not yet answered by the owner. See `TASKS.md`.

## Decision: Local PostgreSQL via native Windows install, not Docker

- Status: Accepted
- Date: 2026-09-04
- Context: `PHASES.md`'s Phase 1 (narrowed to local PostgreSQL setup only — see that file) needed a concrete install method. The dev machine has Docker Desktop installed (daemon not currently running) but no native PostgreSQL/`psql`; both a Docker-container Postgres and a native Windows install (available via `winget`, package `PostgreSQL.PostgreSQL.17`) were viable and offered to the owner.
- Decision: Install PostgreSQL natively on Windows (a real background service), not inside a Docker container.
- Reasoning: Owner's explicit choice between the two offered options.
- Consequences: Phase 1 will run PostgreSQL as a native Windows service rather than a container — no Docker dependency for local dev going forward. The actual install has **not been run yet** — the owner has explicitly said not to start Phase 1 execution yet; this decision only fixes the method for whenever Phase 1 does begin. See `TASKS.md`/`PHASES.md`.
