# Architecture

This describes the **actual current implementation**. As of Phase 2 (2026-09-04), two things coexist in the repo: the approved interactive design prototype (unchanged, not deployable), and the first real slice of the production app — a scaffolded Next.js/TypeScript project with a single bare test page. No backend engine, database wiring, or real frontend exists yet. See `DECISIONS.md` for the reasoning behind building it this way, and `PROJECT.md`/`PHASES.md` for what comes next. The **Planned Production Architecture** section below records the locked stack for what's not yet built — see `CLAUDE.md` rule 9: do not treat anything still marked planned there as implemented until it actually is.

## System Overview

The repository (`C:\RajuApp`) root now contains the production Next.js project directly (`package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`, `app/`), alongside the pre-existing `Project Docs/` and `prototype/` directories — following the layout convention of the sibling `C:\Portfolio` project (app code at repo root, not nested in a subdirectory).

`prototype/` (unchanged from Phase 0, kept as the visual/interaction reference):

- `Main.dc.html` — hand-authored Claude Design Components source: the entire app in one file (markup with `{{hole}}`/`sc-if`/`sc-for` templating, plus a `class Component extends DCLogic` JS logic block).
- `canvas.json` — the single-artboard canvas layout manifest (positions `Main.dc.html` as the one artboard, launches focused).
- `attendance-tracker.html` — the seeded, publishable payload: `Main.dc.html`/`canvas.json` bundled with the Design Components editor/runtime into one self-contained page.

The seeded file has been published as a Claude Artifact (Design canvas) at `https://claude.ai/code/artifact/7dbcdd35-2167-4212-917e-1740c0fe785c` — this is how the prototype is actually viewed and interacted with. It is **not** a standalone deployable web app; `.dc.html` source only runs inside the Design Components sandboxed preview runtime, and it is not wired to the Next.js project in any way — production code is being written fresh.

## Production App (Phase 2 scaffold)

- **Framework**: Next.js 16.3.4, App Router, TypeScript 5.9.3 (pinned below latest — see note), React 19.2.8.
- **Structure**: `app/layout.tsx` (minimal root HTML/body shell) and `app/page.tsx` (the Phase 2 temporary backend test page — plain white background, no styling system, to be removed per Phase 8). No other routes, components, or API routes exist yet.
- **Tooling**: ESLint 9 via `eslint-config-next`'s native flat config (`eslint.config.mjs` imports it directly — no `FlatCompat` shim needed on this version).
- **TypeScript version note**: pinned to `5.9.3` rather than the newest published `7.0.x` (TypeScript's new native/Go-based rewrite) because `typescript-eslint` — a dependency of `eslint-config-next` — does not yet support TS 7. Revisit this pin once `typescript-eslint` adds support.
- **Not yet run**: `npm run dev` / `npm run build` / `npm run lint` all verified working during Phase 2, but the app has not been deployed anywhere.

## Login Backend (Phase 3 scaffold)

- **Database access**: `lib/db.ts` exports a singleton `pg.Pool` (cached on `global` in dev to survive hot reload) reading `DATABASE_URL` from `.env.local` (gitignored; `.env.example` documents the shape). The connection uses a dedicated, least-privilege Postgres role `trackme_app` — not the `postgres` superuser — created during Phase 3, scoped to `CONNECT` on `trackme_dev` and CRUD on just the `users`/`sessions` tables. See `DECISIONS.md`.
- **Schema** (`db/schema.sql`, applied by hand via `psql`, no ORM/migration tool): `users (id, username unique, password_hash, created_at)` and `sessions (id text primary key — the opaque session token itself, user_id fk, created_at, expires_at)`.
- **Auth logic** (`lib/auth.ts`): `createSession`/`getSessionUser`/`deleteSession`, a 32-byte random hex token as the session id, 30-day expiry, cookie name `trackme_session` (httpOnly, `sameSite: lax`, `secure` in production).
- **API routes**: `app/api/auth/login/route.ts` (POST — bcrypt-verifies against `users`, generic "invalid username or password" error regardless of which part was wrong, sets the session cookie on success), `app/api/auth/logout/route.ts` (POST — deletes the session row, clears the cookie), `app/api/auth/session/route.ts` (GET — reports `{ authenticated, username? }` from the current cookie).
- **No signup route exists.** The single account is created/reset via `scripts/seed-user.mjs` (`node scripts/seed-user.mjs <username> <password>`), run manually by the owner — not part of the running app. See `DECISIONS.md`'s "Phase 3 narrowed to login-only" entry.
- **Test harness**: `app/page.tsx` (the Phase 2 temporary page) now includes a plain login form exercising all three auth routes and showing live session status — this is the intended use of that page per its own Phase 2 objective.
- **Not yet built**: no shared middleware guarding routes — each protected route calls `requireAuth` itself (see below) rather than a central middleware layer; no rate limiting on login attempts; no password reset.

## Salary Setup Backend (Phase 4)

- **Schema**: `users.per_day_salary NUMERIC(10,2)`, nullable — `NULL` means the owner hasn't set a rate yet (no assumed default, unlike the prototype's sample ₹800). Added via `db/schema.sql`'s `CREATE TABLE` (fresh installs) and applied to the already-existing `trackme_dev` table with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- **Auth helper**: `lib/auth.ts` now exports `requireAuth(request)`, wrapping `getSessionUser` with the session-cookie read — the first reusable route-protection helper (Phases 5–7 should use it rather than re-implementing the cookie lookup).
- **API routes** (`app/api/salary/route.ts`): `GET` and `PUT`, both `requireAuth`-gated (401 if not logged in). `PUT` validates `perDaySalary` is a finite number `> 0` (400 otherwise) and updates the logged-in user's row.
- **Test harness**: `app/page.tsx`'s Salary Setup section (visible only when authenticated) exercises both routes — shows the current rate (or "not set"), and a form to save a new one.

## Calendar Backend (Phase 5)

- **`lib/calendar.ts`**: pure, dependency-free calendar utility module, reused by every future phase that touches dates (Phase 6 entries, Phase 7 calculations). Exports `getTodayIST()` (current Asia/Kolkata date via `Intl.DateTimeFormat`, timezone-independent of the server process — see `DECISIONS.md` for why this matters), `normalizeYearMonth(year, month)` (rolls any integer month into 0-11 range with year carry, e.g. for Dec/Jan navigation rollover), `daysInMonth`, `weekdayOfFirst`, `weekdayOf` (all UTC-anchored Gregorian arithmetic, leap-year correct), and `buildMonthGrid(year, month, today?)` (the fixed 6x7/42-cell, Sunday-first grid, including real year/month/day for leading/trailing adjacent-month cells — reproduces the approved prototype's `computeCells` algorithm exactly, but timezone-safely).
- **API route** (`app/api/calendar/route.ts`): `GET` only, `requireAuth`-gated (401 if not logged in). Optional `year`/`month` query params (0-indexed month, matching the entries-key convention); omitting both defaults to the current Asia/Kolkata month. Returns 400 if only one of `year`/`month` is given, either is non-integer, or `year` is outside `[1900, 2200]`. Response shape: `{ today: {year, month, day, weekday}, requested: {year, month}, cells: CalendarCell[] }` (42 entries).
- **Test harness**: `app/page.tsx`'s Calendar section (visible only when authenticated) shows the live Asia/Kolkata "today" reading, a year/month input form, and a plain 7-column grid rendering of the 42 returned cells (dimmed for adjacent-month days, bordered for today).
- **Not yet built**: no persistence — this phase is a pure computation service. The `entries`/attendance table (status, advance amount, keyed by date) is Phase 6, not this phase.

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

**Partially built** — the Next.js project itself now exists (see "Production App" above); everything below it (backend engines, database wiring, real frontend, deployment) is still planned. Recorded here so the remaining work has a target — see `DECISIONS.md`'s "Production stack locked" entry and `PHASES.md`.

- **Framework:** Next.js, written in TypeScript, for both the frontend and the backend — one project, one language. No separate Express/API server.
- **Frontend:** Plain React (via Next.js), not a server-rendered-template-plus-islands layer — there's no separate template engine to embed React into, unlike the `core`/Django-templates approach used in `C:\Portfolio`. Interactive actions (saving a date entry, changing salary, live stat recalculation) call Next.js API routes via `fetch` (AJAX-style, no full page reloads), carrying forward the interaction feel already established by the prototype.
- **Backend:** Next.js API routes / route handlers, same project as the frontend.
- **Database:** PostgreSQL — a local Postgres install for day-to-day development, Neon (serverless Postgres) in production. Replaces the prototype's in-memory `entries` object with real persisted rows; the prototype's entry shape (`{ status, advanceOn, advance }` keyed by date) and its invariants above are the intended starting schema shape, not a redesign.
- **Hosting:** Render, free tier.
- **Uptime:** An UptimeRobot monitor pinging the deployed app, to counter Render free tier's idle spin-down (same reason this pattern is used in `C:\Portfolio`).
- **Auth:** A real login/signup backend, per `PHASES.md`'s Phase 3 — resolves the earlier open question of whether the deployed app needs access protection. The app remains single-user in scope (not multi-tenant); see `DECISIONS.md`'s "Login/signup backend added to the roadmap" entry.
