# Development Phases

The project owner has defined the full development roadmap, Phase 0 through Phase 19 (locked 2026-09-04; renumbered 2026-09-04 to inject Phase 14). Phase 0 is complete; the production stack is locked (see `DECISIONS.md`). Phase 2 was originally a single broad "Production Project Setup" phase — the owner replaced it with the detailed Phase 2–18 breakdown below in the same message that locked the roadmap. The owner later injected a new Phase 14 ("Mobile View / Mobile Responsive"), pushing what was Phase 14–18 to Phase 15–19 — see `DECISIONS.md`'s "Phase 14 injected for mobile responsiveness" entry. Do not invent additional phases beyond what is listed here, and do not reorder or renumber these without the owner explicitly directing it — see `CLAUDE.md` rule 3.

## Phase 0 — Pre-Development (Planning & Prototyping)

### Objective
Define the app's core feature set and confirm its visual design and interaction flow via an interactive prototype, before choosing a production stack or writing production code.

### Scope

**0a. Planning & Definition**
Feature set gathered from the owner's brief: calendar-based attendance entry (Present/Half-Day/Leave), optional per-date advance-salary logging, live earned/advance/net-payable stat cards, and a Salary Setup control (per-day rate only, everything else auto-calculated). No production stack, hosting, or persistence approach has been chosen yet.

- Feature set defined (see `PROJECT.md`)
- Production stack: not yet chosen

**Status: Partially complete.** Feature set is defined; stack/persistence decisions remain open.

**0b. Visual / UX Prototyping**
An interactive Claude Design Components prototype (`prototype/Main.dc.html`, seeded to `prototype/attendance-tracker.html`, published as a Claude Artifact/canvas) implementing the full intended Home page: calendar with month/year navigation, per-date entry modal (status buttons, advance checkbox + amount, Done button), live stat cards, and a Salary Setup modal — all with working interactivity and in-memory sample state. Built 2026-09-04 with a light, warm-neutral fintech-dashboard palette; converted the same day to a dark theme per the owner's request. See `DECISIONS.md`.

**Status: Complete.** The owner reviewed and explicitly approved this version of the design and styling on 2026-09-04.

### Completion Criteria
- 0a: Feature set defined (done); production stack chosen (not yet done).
- 0b: Complete — interactive prototype exists, demonstrates the full intended flow, and is confirmed/approved by the owner (2026-09-04, dark theme).

**Phase 0 overall status: Complete.** 0b was already complete; 0a's remaining open item (production stack) was resolved 2026-09-04 — see `DECISIONS.md`.

## Phase 1 — Local PostgreSQL Setup

### Objective
Get a local PostgreSQL database installed, running, and ready to use for development — on its own, before any application code exists.

### Scope
Install PostgreSQL locally (or run it via a local container) and confirm it's reachable with working credentials and a dev database created. No Next.js project, application schema, or code is written in this phase — that's Phase 2.

### Completion Criteria
A local PostgreSQL server is running and reachable (verified via a client connection), with a dev database created and ready for the application to connect to once it exists.

**Status: Complete.** A PostgreSQL server was already installed and running natively on the machine (Windows service `postgresql-x64-18`, PostgreSQL 18.4, port 5432) — predating this project, likely from another local project — so no fresh `winget` install of v17 was needed; the existing v18 instance was reused instead. A dedicated `trackme_dev` database was created on it and connection verified via `psql` (both to the server and to `trackme_dev` directly). See `DECISIONS.md`'s "Reused pre-existing local PostgreSQL 18" entry.

## Phase 2 — Temporary Backend Test Page

### Objective
A minimal, plain white HTML page whose only purpose is exercising and testing the backend engines built in Phases 3–7, before any real frontend exists.

### Scope
Scaffolded the production Next.js/TypeScript project for the first time (`package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`, App Router `app/` directory) directly at the repo root, alongside the existing `Project Docs/` and `prototype/` directories — matching the layout convention of the sibling `C:\Portfolio` project. Added one bare page (`app/page.tsx`, plain white background, no styling system) as the temporary test harness. No database wiring, `.env`, or real content — those begin in Phases 3–7 when actual backend engines exist to exercise.

### Completion Criteria
`npm install`, `npm run build`, and `npm run lint` all succeed cleanly; `npm run dev` serves the page.

**Status: Complete.** Verified 2026-09-04: dependency install, production build, lint, and a dev-server request all succeeded. See `ARCHITECTURE.md` for the resulting project structure.

## Phase 3 — Login Backend (no signup)

### Objective
Build the backend for logging in to a single, owner-provisioned account. Originally scoped as "Login/Signup Backend"; the owner narrowed this to login-only on 2026-09-04 — see `DECISIONS.md`.

### Scope
Wired up Postgres for the first time (a dedicated, least-privilege `trackme_app` role — Phase 1 had only verified the `postgres` superuser), added a `users`/`sessions` schema (`db/schema.sql`), and built three API routes (`/api/auth/login`, `/api/auth/logout`, `/api/auth/session`) backed by a DB-backed session table and bcrypt-hashed passwords. There is no signup route — the single account is created/reset via a manual script (`scripts/seed-user.mjs`), run once by the owner. Extended the Phase 2 test page with a login form to exercise the new endpoints.

### Completion Criteria
Schema applies cleanly; the seed script creates the account; login/logout/session all work end-to-end (correct login sets a session, wrong credentials are rejected with a generic error, logout clears both the cookie and the DB row); `npm run build`/`npm run lint` pass clean.

**Status: Complete.** Verified 2026-09-04 end-to-end against the running dev server and `trackme_dev` database.

## Phase 4 — Salary Setup Modal Backend

### Objective
Build the backend behind the Salary Setup modal (per-day rate).

**Status: Not started.**

## Phase 5 — Calendar Backend

### Objective
Build the backend behind the calendar.

**Status: Not started.**

## Phase 6 — Clickable Date Modal Backend

### Objective
Build the backend behind the clickable per-date entry modal.

**Status: Not started.**

## Phase 7 — Salary / Advance / Attendance Calculation Backend

### Objective
Build the backend for total salary, advance, leave, and present-day calculations.

**Status: Not started.**

## Phase 8 — Full Backend Testing & Temporary Page Removal

### Objective
Test every backend engine built in Phases 2–7 end to end, then delete the Phase 2 temporary test HTML page.

**Status: Not started.**

## Phase 9 — React Frontend: Blank Dark-Themed Shell

### Objective
Start the React frontend on the locked stack with a blank, dark-themed page matching the approved prototype's look.

**Status: Not started.**

## Phase 10 — Calendar on Frontend

### Objective
Build the calendar UI on the frontend, matching the approved prototype.

**Status: Not started.**

## Phase 11 — Stat Cards on Frontend

### Objective
Build the Total Salary, Advance Taken, and Net Salary stat cards on the frontend, matching the approved prototype.

**Status: Not started.**

## Phase 12 — Profile & Salary Setup on Frontend

### Objective
Build the profile name/icon, the Salary Setup button, and the per-day salary display on the frontend, matching the approved prototype.

**Status: Not started.**

## Phase 13 — Wire Frontend to Backend

### Objective
Connect every static card, button, profile element, and the calendar on the frontend to the real backend built in Phases 3–7.

**Status: Not started.**

## Phase 14 — Mobile View / Mobile Responsive

### Objective
Make the full site fully mobile responsive.

### Scope
Injected into the roadmap 2026-09-04 (originally Phase 0–18 had no dedicated mobile-responsiveness phase) — see `DECISIONS.md`'s "Phase 14 injected for mobile responsiveness" entry. Placed after Phase 13 (frontend fully wired to the backend) and before end-to-end testing/production readiness, so responsiveness work happens once the app is functionally complete but before final testing and deployment.

**Status: Not started.**

## Phase 15 — End-to-End Testing & Production Readiness

### Objective
Test the fully wired app end to end and make it production-ready for deployment on Render's free tier.

**Status: Not started.**

## Phase 16 — Neon PostgreSQL Setup

### Objective
Provision the Neon PostgreSQL production database and store its connection credentials in `.env`.

**Status: Not started.**

## Phase 17 — Deployment on Render

### Objective
Deploy the app to Render.

**Status: Not started.**

## Phase 18 — UptimeRobot Setup

### Objective
Configure an UptimeRobot keep-alive monitor against the deployed app.

**Status: Not started.**

## Phase 19 — Live Site End-to-End Testing

### Objective
Test the deployed, live site end to end.

**Status: Not started.**
