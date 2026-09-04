# Technical Decisions

These decisions were made during initial prototyping. They are recorded here as established direction for `ARCHITECTURE.md` and `PHASES.md`. Where reasoning was not explicitly stated by the owner, this is marked rather than guessed.

## Decision: Personal, single-user scope — no authentication planned

- Status: **Partially superseded** (2026-09-04) — the "no authentication" half is reversed by the locked Phase 3 "Login/Signup Backend" (see `PHASES.md`); the single-user-scope half still stands (see "Login/signup added" below).
- Date: 2026-09-04
- Context: The owner described the app explicitly as "for personal use" / "a single user self attendance record app."
- Decision: Treat the app as strictly single-user. No login/authentication system is in scope unless the owner says otherwise.
- Reasoning: Matches the original brief verbatim.
- Consequences: Superseded same-day once the owner locked a roadmap that includes a login/signup phase — see below.

## Decision: Login/Signup backend added to the roadmap

- Status: Accepted
- Date: 2026-09-04
- Context: The owner's locked Phase 0–18 roadmap (see `PHASES.md`) includes Phase 3, "Login/Signup Backend" — reversing the earlier "no authentication planned" decision above. This also resolves the previously-open question (see `TASKS.md`) of whether the deployed app needs any access protection, since it's reachable by anyone with the URL and built for someone other than the owner to use.
- Decision: The production app will have a real login/signup backend (Phase 3). The app's single-user *scope* is unaffected — this isn't becoming a multi-tenant product — but it will no longer be open to anyone with the link; the owner has not further specified whether "single-user" means exactly one fixed account or a signup flow that could, in principle, create more than one.
- Reasoning: Owner's explicit roadmap; specific reasoning beyond that wasn't stated — marked here rather than guessed.
- Consequences: `PROJECT.md`'s Non-Goals ("no login/authentication system is in scope") is now stale and needs correcting. `ARCHITECTURE.md`'s Planned Production Architecture ("Auth: not yet decided") is superseded — auth is now Phase 3, not an open question. See both files.

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
- Context: The owner asked for a "well professional and aesthetic style... very polished and clean and professional" look, with no existing brand or design system to match (the app, later named Track Me, was a new, empty project at the time). No design direction was specified up front, and the brief already named a concrete deliverable (a clickable prototype), so a direction was committed to directly rather than sketching alternates first.
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
- Context: The app (later named Track Me) needed a production stack lighter than Django for a small, single-page personal tool, deployable so someone else can use it in a browser. Node.js vs. Next.js and the TypeScript question were discussed first: Next.js runs on Node — choosing it doesn't add a separate language, it bundles a Node backend and a React frontend into one project instead of hand-wiring a separate Express API against a separately-chosen frontend. The owner then locked the full stack in one message.
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

## Decision: Reused pre-existing local PostgreSQL 18 instead of installing v17 via winget

- Status: Accepted
- Date: 2026-09-04
- Context: When Phase 1 execution began, the machine was checked for an existing install before running the planned `winget` install. PostgreSQL was already present and running as a Windows service (`postgresql-x64-18`, PostgreSQL 18.4, listening on port 5432), installed 2026-07-05 — predating this project's stack-lock conversation, almost certainly for another local project on the same machine. No native PostgreSQL 17 was ever installed via `winget`.
- Decision: Reuse the existing local PostgreSQL 18 service for Track Me's local development rather than installing PostgreSQL 17 alongside it. Created a dedicated `trackme_dev` database on this instance (owner-supplied `postgres` superuser credentials) rather than a fresh v17 instance.
- Reasoning: A working local Postgres server already exists and is reachable; installing a second, differently-versioned instance solely to match the earlier v17 plan would add complexity (port conflicts, service management) for no real benefit. Postgres 18 is a superset of 17 for this app's purposes — no feature this app needs is v17-specific.
- Consequences: Supersedes the "Local PostgreSQL via native Windows install" decision above — that decision's *method* (native Windows service, not Docker) still holds since the existing instance is exactly that, but its *version* (17) and *action* (fresh install via winget) were not carried out. Local dev now runs against PostgreSQL 18.4, not 17. Production (Neon) version compatibility should be double-checked against 18 when Phase 15 (Neon setup) is reached, rather than assuming 17. See `PHASES.md`, `TASKS.md`.
