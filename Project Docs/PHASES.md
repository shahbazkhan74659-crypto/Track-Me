# Development Phases

The project owner has defined the full development roadmap, Phase 0 through Phase 20 (locked 2026-09-04; renumbered twice since — see below). Phase 0 is complete; the production stack is locked (see `DECISIONS.md`). Phase 2 was originally a single broad "Production Project Setup" phase — the owner replaced it with the detailed Phase 2–18 breakdown below in the same message that locked the roadmap. The owner later injected a new Phase 14 ("Mobile View / Mobile Responsive"), pushing what was Phase 14–18 to Phase 15–19 — see `DECISIONS.md`'s "Phase 14 injected for mobile responsiveness" entry. On 2026-09-05, starting Phase 10 surfaced that no phase named the frontend's clickable date-entry modal, so the owner split it out of Phase 10 into a new Phase 13 ("Date Entry Modal on Frontend"), pushing what was Phase 13–19 to Phase 14–20 — see `DECISIONS.md`'s "Phase 13 'Date Entry Modal on Frontend' injected" entry. Do not invent additional phases beyond what is listed here, and do not reorder or renumber these without the owner explicitly directing it — see `CLAUDE.md` rule 3.

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

### Scope
Added a nullable `per_day_salary` column to `users` (one value per account, no history needed), a `requireAuth` helper in `lib/auth.ts` (the first route-protection code, flagged as a gap after Phase 3), and auth-gated `GET`/`PUT /api/salary` routes — `PUT` validates the rate is a positive finite number. Extended the test page with a Salary Setup section, shown only when logged in.

### Completion Criteria
Both routes return 401 when logged out; when logged in, `GET` returns `null` until set, `PUT` rejects non-positive/non-numeric values with 400, a valid `PUT` persists and is reflected by a subsequent `GET`; `npm run build`/`npm run lint` pass clean.

**Status: Complete.** Verified 2026-09-04 end-to-end against the running dev server and `trackme_dev` database (including confirming the persisted value directly via `psql`).

## Phase 5 — Calendar Backend

### Objective
Build the backend behind the calendar.

### Scope
Added `lib/calendar.ts`, a pure, dependency-free calendar utility module: `getTodayIST()` reads the current wall-clock date in Asia/Kolkata via `Intl.DateTimeFormat` (correct regardless of the server process's local timezone — required for correctness on Render, which runs in UTC), while `daysInMonth`, `weekdayOfFirst`, `weekdayOf`, and `buildMonthGrid` do pure Gregorian calendar arithmetic anchored via `Date.UTC(...)`/`getUTC*()` rather than local-time `Date` constructors. `buildMonthGrid` reproduces the approved prototype's 42-cell (6x7), Sunday-first grid algorithm exactly, but timezone-safely, including real year/month/day for leading/trailing adjacent-month cells. Added a `requireAuth`-gated `GET /api/calendar` route (optional `year`/`month` query params, 0-indexed month, defaults to the current IST month) returning `{ today, requested, cells }`. Extended the test page with a Calendar section showing the live IST "today" and a year/month-driven grid. No database schema change — this phase is a pure computation service; the `entries`/attendance table is Phase 6. See `ARCHITECTURE.md`'s "Calendar Backend (Phase 5)" section and `DECISIONS.md`'s Asia/Kolkata entry.

### Completion Criteria
`GET /api/calendar` returns 401 when logged out; 400 when `year`/`month` are given inconsistently, non-integer, or `year` is out of range; with no params, defaults to the current Asia/Kolkata month; the grid is always 42 cells, Sunday-first, with leap-year-correct day counts and correct adjacent-month rollover at Dec/Jan boundaries; the reported "today" reflects the real Asia/Kolkata date regardless of server timezone (verified by forcing `TZ=UTC` and confirming no change); `npm run build`/`npm run lint` pass clean.

**Status: Complete.** Verified 2026-09-05 against the running dev server: calendar math (leap years, days-per-month, weekday-of-first) checked directly, IST-vs-server-timezone independence confirmed by forcing `TZ=UTC`, and 401 on an unauthenticated request confirmed end-to-end. See `ARCHITECTURE.md`.

## Phase 6 — Clickable Date Modal Backend

### Objective
Build the backend behind the clickable per-date entry modal.

### Scope
Added a new `entries` table (`db/schema.sql`): one row per user per calendar date (`UNIQUE (user_id, year, month, day)`, 0-indexed month matching `lib/calendar.ts`'s convention), storing `status` (`'present'|'half'|'leave'`), a dedicated `advance_on` boolean, and the `advance` amount — created and granted to `trackme_app` by the owner via `psql` (superuser-only operation, consistent with every prior schema change). Added an auth-gated `app/api/entries/route.ts` with `GET` (month-scoped list, query params, defaults to current IST month, rolls month over like `/api/calendar`), `PUT` (upserts one date's entry via `ON CONFLICT`, rejecting rather than rolling over an out-of-range month/day since it targets one exact row), and `DELETE` (clears one date's entry, idempotent). Validation reproduces the approved prototype's invariants exactly: `status` is required (the server-side twin of the Done button's disabled-without-status rule), and `advance_on`/`advance` are independent — a ₹0 advance with the checkbox on still persists as `advanceOn: true, advance: 0`, never collapsed to "no advance". Extended the test page with a Date Entry section: calendar cells are now clickable, opening an inline editor (status radio buttons, advance checkbox + amount, Save, and Clear when an entry already exists) that mirrors the prototype's modal. No aggregate earned/advance/net-payable calculations — that's Phase 7.

### Completion Criteria
`GET`/`PUT`/`DELETE` all return 401 when logged out; `PUT`/`DELETE` return 400 for non-integer or out-of-range year/month/day (leap-year-correct), missing/invalid `status`, non-boolean `advanceOn`, or a non-finite/negative `advance` when `advanceOn` is true; saving with `advanceOn: true, advance: 0` round-trips correctly without collapsing to false; upserting an existing date updates it in place; clearing a date removes it and is idempotent; a month's `GET` returns exactly its own saved days, no adjacent-month leakage; `npm run build`/`npm run lint` pass clean.

**Status: Complete.** Verified 2026-09-05 end-to-end against the running dev server and `trackme_dev` database: the owner applied the `entries` table + grants via `psql`, then save/update/clear, the ₹0-advance regression case, month-rollover on `GET`, all 400 validation cases (invalid status, day out of range for both a 30-day and a non-leap-February month, non-numeric advance), and 401-when-logged-out were all confirmed via direct API calls. See `ARCHITECTURE.md`'s "Clickable Date Modal Backend (Phase 6)" section and `DECISIONS.md`.

## Phase 7 — Salary / Advance / Attendance Calculation Backend

### Objective
Build the backend for total salary, advance, leave, and present-day calculations.

### Scope
Added a read-only `GET /api/summary` route (`app/api/summary/route.ts`), `requireAuth`-gated, with the same `year`/`month` query-param contract as `/api/calendar` and `/api/entries GET` (both-or-neither, integers, year `[1900,2200]`, defaults to the current Asia/Kolkata month, rolls an out-of-range month over via `normalizeYearMonth`). It runs two queries in parallel: `users.per_day_salary`, and a single SQL aggregation over `entries` using Postgres `FILTER` clauses (`COUNT(*) FILTER (WHERE status = ...)`, `SUM(advance) FILTER (WHERE advance_on)`) scoped to the requested year/month — no JS-side looping, no new table. Reproduces the approved prototype's exact formula: `earned = presentDays × perDaySalary + halfDays × (perDaySalary ÷ 2)`, `netPayable = earned − advanceTaken`; `leaveDays` is computed and returned but never feeds the money math, matching the prototype. Handles the nullable `per_day_salary` case the prototype never had to (it always assumed a sample rate): day counts and `advanceTaken` are always real numbers, while `earned`/`netPayable` are `null` when no rate is set — the endpoint still returns 200, since a missing rate is a valid account state, not an error. No schema change; `/api/salary` and `/api/entries` are unchanged. Extended the test page with a Summary section (three cards: Earned So Far, Advance Taken, Net Payable) that refreshes on month navigation and — per the owner's explicit ask — immediately after saving or clearing a date entry, and after changing the per-day rate, so the cards recalculate live without a page reload.

### Completion Criteria
Returns 401 when logged out; 400 for year-only/month-only, non-integer, or out-of-range year; a hand-calculated mix of present/half/leave/advance entries matches the formula exactly; a NULL per-day rate yields `earned`/`netPayable: null` (200, not an error) while day counts and advance-taken remain correct; an entry in an adjacent month never leaks into the requested month's totals; the test-page cards visibly update immediately after a save, a clear, and a rate change, with no manual refresh; `npm run build`/`npm run lint` pass clean.

**Status: Complete.** Verified 2026-09-05 against the running dev server and `trackme_dev` database: a hand-calculated case (₹800 rate, 3 present/2 half/1 leave/₹500 advance) matched exactly (`earned: 3200, netPayable: 2700`), an adjacent-month ₹9999 advance entry did not leak into the target month's totals, all 400 validation cases and the 401-logged-out case were confirmed, and the existing real account data (an unrelated in-progress September entry pair) independently cross-checked the same formula. See `ARCHITECTURE.md`'s "Salary / Advance / Attendance Calculation Backend (Phase 7)" section and `DECISIONS.md`.

## Phase 8 — Full Backend Testing & Temporary Page Removal

### Objective
Test every backend engine built in Phases 2–7 end to end, then delete the Phase 2 temporary test HTML page.

### Scope
Wrote a single reusable end-to-end test script, `scripts/test-backend.mjs` (plain Node ESM, no new dependencies — same convention as `scripts/seed-user.mjs`), that exercises every route built in Phases 3–7 (`/api/auth/*`, `/api/salary`, `/api/calendar`, `/api/entries`, `/api/summary`) directly over HTTP against the running dev server, manually capturing and re-attaching the `trackme_session` cookie (Node's `fetch` has no browser-style cookie jar). All entry-table tests run inside a dedicated fake test year (2099, split across a few months so unrelated test groups don't interfere with each other) that can never collide with real attendance data, and are deleted again — plus a pre-flight wipe of any stray rows from a previous interrupted run — so the script is safe to run repeatedly. The single non-month-scoped mutable value in this app, `users.per_day_salary`, is captured before any mutation and restored to its exact original value in a `finally` block, falling back to a direct Postgres `UPDATE` only for the one case `PUT /api/salary` cannot express itself (restoring a `NULL` original rate). Ran the script twice against the live dev server and real `trackme_dev` database, confirmed every assertion passed both times and the real account's per-day rate and current-month entries were provably unchanged before/after (verified via direct `psql` snapshots). Then deleted `app/page.tsx` (the 545-line Phase 2 temporary test harness, extended through every phase 3–7) — the app now has no page component; `/` 404s until Phase 9 builds the real frontend. Updated `app/layout.tsx`'s stale `metadata` (previously described a "Backend Test Page") to reflect the app's current no-frontend-yet state.

### Completion Criteria
`node scripts/test-backend.mjs <username> <password>` runs against the live dev server and exits 0 with every assertion passing (auth, salary, calendar, entries, summary — including the ₹0-advance-must-not-collapse regression case and adjacent-month isolation); the real account's `per_day_salary` and real current-month entries are confirmed unchanged before/after the run; the script is safe to re-run (repeated a second time with identical results); `app/page.tsx` is deleted and `/` now 404s while every `/api/*` route continues to work; `npm run build`/`npm run lint` pass clean with no dangling references to the deleted file.

**Status: Complete.** Verified 2026-09-05 against the running dev server and `trackme_dev` database: the script passed all 73 assertions on two consecutive runs, a `psql` snapshot before and after confirmed the real `per_day_salary` (500) and the four real September 2026 entries were byte-for-byte unchanged, `/` was confirmed to 404 while `/api/auth/session` continued returning 200, and `npm run build`/`npm run lint` both passed clean after the deletion. See `ARCHITECTURE.md`'s "Full Backend Testing & Temporary Page Removal (Phase 8)" section and `DECISIONS.md`.

## Phase 9 — React Frontend: Blank Dark-Themed Shell

### Objective
Start the React frontend on the locked stack with a blank, dark-themed page matching the approved prototype's look.

### Scope
Recreated `app/page.tsx` (deleted in Phase 8) as a genuinely blank shell: a dark div fixed exactly to the viewport (`height:100vh`, `overflow:hidden`, background `oklch(15% 0.01 260)` — the prototype's exact page background — `padding:40px 24px 64px`) containing an inner `max-width:880px` centered column, with no visible content yet. Added `lib/theme.ts`, a minimal TS color-constants module (currently just `pageBackground`/`text`) that Phases 10–12 will extend incrementally with the rest of the prototype's palette (accent, muted text, panel background, status colors, borders) as each phase actually needs them, rather than populating it speculatively now. Added `app/globals.css` (the prototype's base reset — `box-sizing: border-box`, font smoothing — plus `html, body { height: 100%; margin: 0; overflow: hidden; }`, added after an initial pass showed a white background sliver and unwanted page scroll; `<body>` also now carries the dark background directly via `app/layout.tsx`). Updated `app/layout.tsx` to load Manrope (weights 500/600/700/800) and Work Sans (weights 400/500/600) via `next/font/google` (self-hosted at build time, exposed as `--font-manrope`/`--font-work-sans` CSS variables) instead of the prototype's `<link>` tag, and corrected its stale metadata. Disabled Next.js's dev-mode "N" indicator (`next.config.ts`'s `devIndicators: false`) as unnecessary noise now that backend testing is done. No CSS framework/methodology was introduced — plain inline React styles for layout, matching every other page/route already in this codebase. Per the owner's explicit instruction, nothing in this phase touches the backend: no `fetch`, no imports from `lib/db.ts`/`lib/auth.ts`/`lib/calendar.ts`, no `/api/*` reference anywhere in the new frontend files (confirmed via grep). The header (Phase 12), calendar (Phase 10), and stat cards (Phase 11) are intentionally not built yet.

### Completion Criteria
`npm run dev` serves `/` with the correct viewport-fixed dark background (no white sliver, no scroll in either axis), default text color, and both fonts actually loading (confirmed via the rendered HTML's font-variable classnames); `npm run build`/`npm run lint` pass clean; a grep of `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, and `lib/theme.ts` for `fetch(`, `lib/db`, `lib/auth`, `lib/calendar`, and `/api/` returns zero matches, proving no backend connection exists yet.

**Status: Complete.** Verified 2026-09-05: `npm run build`/`npm run lint` both passed clean, the rendered page HTML confirmed the correct background color and both fonts' variable classnames on `<html>`, and a grep across the new/changed frontend files confirmed zero references to `fetch`/`lib/db`/`lib/auth`/`lib/calendar`/`/api/`. The owner then caught a real bug via screenshots — a white default-background sliver and unwanted page scroll (both axes) — traced to the shell using `min-height:100vh` without anything preventing `<body>`/`<html>` from exceeding the viewport; fixed by pinning `html`/`body` to `height:100%; overflow:hidden`, putting the dark background directly on `<body>` too, and changing the page div to an exact `height:100vh` with `overflow:hidden`. Owner confirmed the fix visually ("done now its perfect"). See `ARCHITECTURE.md`'s "Frontend Shell (Phase 9)" section and `DECISIONS.md`.

## Phase 10 — Calendar on Frontend

### Objective
Build the calendar UI on the frontend, matching the approved prototype.

### Scope
The calendar card only: month/year navigation header (prev/next chevrons, "Month YYYY" label, "Today" shortcut), the Sun–Sat weekday row, the 42-cell month grid (adjacent-month days dimmed, today ringed), and the Present/Half-day/Leave/Advance-taken legend. Narrowed 2026-09-05, at the owner's direction, to exclude the clickable date-entry modal — clicking a cell does nothing yet. That modal (status buttons, advance checkbox + amount, Save/Clear) is now its own phase, [Phase 13] "Date Entry Modal on Frontend" (new, inserted the same day) — see `DECISIONS.md`'s "Phase 13 'Date Entry Modal on Frontend' injected" entry. No backend connection (that's Phase 14).

Added `components/CalendarCard.tsx` (`"use client"`, since month navigation needs local React state), reusing `lib/calendar.ts`'s existing `getTodayIST`/`buildMonthGrid`/`normalizeYearMonth` directly (pure, dependency-free, safe to import client-side) rather than re-implementing calendar math — the real current Asia/Kolkata date drives the initial view and the "Today" shortcut, not a hardcoded sample month like the prototype. Extended `lib/theme.ts` with exactly the palette entries this component needs (`textMuted`, `accent`, `border`, `panelBackground`, `panelBorder`, `cellBackground`, `statusPresent`/`statusHalf`/`statusLeave`), continuing Phase 9's incremental-palette approach. Rendered inside `app/page.tsx`'s existing centered column. Two interactive elements (the chevron buttons and the "Today" link) needed `:hover` states, which inline styles can't express — matching the prototype's own approach of moving anything with a `:hover` rule into a real CSS class, added two small classes to `app/globals.css` (`.chevron-btn`, `.today-link`) rather than introducing a CSS framework. No fetch/database/auth import anywhere in the new or changed files (confirmed via grep, same check used in Phase 9).

**Status: Complete.** Verified 2026-09-05: `npm run build` and `npm run lint` both passed clean; a grep of `components/CalendarCard.tsx` and `app/page.tsx` for `fetch(`/`lib/db`/`lib/auth`/`/api/` returned zero matches; the rendered page (checked directly against the running dev server) showed the correct real current month ("September 2026"), exactly 42 grid cells, and the full Present/Half-day/Leave/Advance-taken legend. Browser-based visual/interactive verification (hover states, click navigation, the today ring, adjacent-month dimming) was not performed in this session — Chrome browser automation wasn't connected — so the owner should give it a visual pass in a browser before considering this phase's UI final.

## Phase 11 — Stat Cards on Frontend

### Objective
Build the Total Salary, Advance Taken, and Net Salary stat cards on the frontend, matching the approved prototype.

### Scope
The three-card row (Earned So Far, Advance Taken, Net Payable), styled per the prototype, placed above the calendar card. No per-day rate can be entered yet (Salary Setup is Phase 12) and no attendance/advance can be logged yet (the date-entry modal is Phase 13), so there is no real data source for these numbers this phase — the cards render exactly the "unset rate" state Phase 7's `GET /api/summary` already defines: day counts and advance-taken are real zeros, `earned`/`netPayable` are the null/placeholder case (`DECISIONS.md`'s Phase 7 entry: "Set a rate to see earnings"). Added `lib/format.ts`'s `formatINR` (the prototype's `fmtINR`, exactly) as the first shared currency formatter, for Phase 12/13 to reuse. No backend connection (that's Phase 14).

**Status: Complete.** Verified 2026-09-05: `npm run build`/`npm run lint` passed clean; grep of `components/StatCards.tsx`, `lib/format.ts`, and `app/page.tsx` found no `fetch(`/`lib/db`/`lib/auth`/`/api/` imports or calls (one comment references `/api/summary` by name only, explaining the placeholder-state parallel); the running dev server's rendered HTML confirmed all three card labels, the "Set a rate to see earnings" placeholder, and "No advances taken". As with Phase 10, browser-based visual verification wasn't performed this session (Chrome automation unavailable) — the owner should eyeball spacing/colors against the prototype in a browser.

## Phase 12 — Profile & Salary Setup on Frontend

### Objective
Build the profile name/icon, the Salary Setup button, and the per-day salary display on the frontend, matching the approved prototype.

### Scope
The header row (profile icon/name/subtitle + per-day-salary label + Salary Setup button), placed above the stat cards. Asked the owner whether the Salary Setup modal itself (₹ input, Cancel/Save) belonged in this phase, given its objective text doesn't name it explicitly and no other phase does either (the same gap Phase 10 had with the date-entry modal) — the owner said yes, include it, since Phase 12's own title says "...& Salary Setup" and nothing else claims it. Built as local-only UI state: Save updates the displayed rate in memory only; nothing persists until Phase 14 wires the real `PUT /api/salary` (Phase 4). Save is disabled unless the input is a finite number `> 0` — a deliberate small improvement over the prototype's unvalidated save, previewing the validation `PUT /api/salary` already enforces. Not cross-wired to the stat cards this phase — setting a rate here doesn't change what Phase 11's cards show; that connection is Phase 14, not this one.

**Status: Complete.** Verified 2026-09-05: `npm run build`/`npm run lint` passed clean; grep of the new components and `app/page.tsx` found no `fetch`/`lib/db`/`lib/auth`/`/api/` usage; the running dev server's rendered HTML confirmed "Attendance", "Personal record", "Salary Setup", and "Not set" all render. As with Phases 10–11, the modal's actual open/close/save interactivity wasn't checked in a browser this session (Chrome automation unavailable) — the owner should give it a manual pass, and should expect that setting a rate here won't yet change the stat cards (that's Phase 14, not a bug).

## Phase 13 — Date Entry Modal on Frontend

### Objective
Build the clickable date-entry modal on the frontend (status buttons, advance checkbox + amount, Save/Clear), matching the approved prototype.

### Scope
Inserted into the roadmap 2026-09-05 — see `DECISIONS.md`'s "Phase 13 'Date Entry Modal on Frontend' injected" entry. Split out of Phase 10 because neither Phase 10's "Calendar on Frontend" objective nor any other named phase explicitly covered the clickable modal the prototype's calendar cells open. Local UI state only (an in-memory entries object, as in the prototype) — not yet wired to the real `entries` backend built in Phase 6; that connection happens in Phase 14. Field names (`status`/`advanceOn`/`advance`) match that backend's shape exactly so Phase 14's wiring is a straight swap, not a reshape. Save is disabled if the advance amount is present but not a finite number `≥ 0` (previewing `PUT /api/entries`'s real validation, same spirit as Phase 12's rate-validation addition) — a blank amount still counts as `0`, preserving the "₹0 advance still counts as taken" invariant. Not cross-wired to the stat cards (Phase 11) — entries created here don't change what those cards show; that's Phase 14.

**Status: Complete.** Verified 2026-09-05: `npm run build`/`npm run lint` passed clean; grep of `components/CalendarCard.tsx` and `components/DateEntryModal.tsx` found no real `fetch`/`lib/db`/`lib/auth`/`/api/` usage (one comment references `app/api/entries/route.ts` by name); the running dev server's rendered HTML confirmed exactly 42 grid cells with exactly the number of clickable (current-month) cells matching the real month's day count, and confirmed the modal renders nothing until a cell is clicked. As with Phases 10–12, this phase is almost entirely interactive (click → modal → select status → toggle advance → Save/Clear) and none of that could be verified in a real browser this session (Chrome automation unavailable) — a manual pass matters more here than for prior phases.

## Phase 14 — Wire Frontend to Backend

### Objective
Connect every static card, button, profile element, and the calendar on the frontend to the real backend built in Phases 3–7.

### Scope
Starting this phase surfaced that no phase ever built a frontend login page — asked the owner, who chose to fold a minimal one into this phase rather than split it out (see `DECISIONS.md`'s "Login page folded into Phase 14" entry). `app/page.tsx` became an async Server Component checking the session directly (`lib/auth.ts`'s `getSessionUser`, no client round-trip) and rendering either a new `components/LoginGate.tsx` or the real app; a minimal "Log out" link was added alongside it. A new `components/AttendanceApp.tsx` coordinator now owns all shared state (view, per-day rate, entries, summary) and every fetch/mutation, converting `CalendarCard`, `StatCards`, and `SalarySetupControl` from self-contained placeholders into controlled components — exactly the integration Phases 10–13 deferred. `GET /api/calendar` is deliberately not called (the grid is already correct client-side); see `DECISIONS.md`'s "Frontend does not call GET /api/calendar" entry.

**Status: Complete.** Verified 2026-09-05: `npm run build`/`npm run lint` passed clean (`/` now correctly shows as dynamic/server-rendered, since it reads cookies); grep confirmed real `fetch(` calls to `/api/auth/login`, `/api/auth/logout`, `/api/salary`, `/api/entries`, and `/api/summary`, and confirmed `/api/calendar` appears only in an explanatory code comment, never a real call; the running dev server confirmed the login form renders (username/password fields, submit button) when no session cookie is present. **Real, authenticated verification could not be done this session** — the real account's password isn't known to Claude, and creating a second test account via `scripts/seed-user.mjs` would add a permanent extra row to the real database, contradicting the single-account design without explicit sign-off. Logging in, saving a real entry/rate, and confirming live stat-card recalculation all need the owner's own manual browser check — more important here than any prior phase, since this is the first phase touching real persisted data.

## Phase 15 — Mobile View / Mobile Responsive

### Objective
Make the full site fully mobile responsive.

### Scope
Injected into the roadmap 2026-09-04 (originally Phase 0–18 had no dedicated mobile-responsiveness phase) — see `DECISIONS.md`'s "Phase 14 injected for mobile responsiveness" entry. Placed after Phase 14 (frontend fully wired to the backend) and before end-to-end testing/production readiness, so responsiveness work happens once the app is functionally complete but before final testing and deployment. Renumbered from Phase 14 to Phase 15 on 2026-09-05 when Phase 13 "Date Entry Modal on Frontend" was inserted — see `DECISIONS.md`'s "Phase 13 'Date Entry Modal on Frontend' injected" entry.

**Status: Not started.**

## Phase 16 — End-to-End Testing & Production Readiness

### Objective
Test the fully wired app end to end and make it production-ready for deployment on Render's free tier.

**Status: Not started.**

## Phase 17 — Neon PostgreSQL Setup

### Objective
Provision the Neon PostgreSQL production database and store its connection credentials in `.env`.

**Status: Not started.**

## Phase 18 — Deployment on Render

### Objective
Deploy the app to Render.

**Status: Not started.**

## Phase 19 — UptimeRobot Setup

### Objective
Configure an UptimeRobot keep-alive monitor against the deployed app.

**Status: Not started.**

## Phase 20 — Live Site End-to-End Testing

### Objective
Test the deployed, live site end to end.

**Status: Not started.**
