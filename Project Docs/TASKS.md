# Current Tasks

## Active

None actively in progress.

## Next

[Phase 1] "Local PostgreSQL Setup" is defined and ready to start (see `PHASES.md`): get a local PostgreSQL database installed, running, and ready to use — no application code yet. [Phase 2] "Production Project Setup" (Next.js scaffold, schema, Neon/Render/UptimeRobot) follows once Phase 1 is done.

Note 2026-09-04: a first attempt to jump straight into scaffolding the Next.js project (before Phase 1's database setup) was interrupted and reverted by the owner — "we are not going to start coding yet." The owner then explicitly scoped Phase 1 down to local database setup only. Do not scaffold the Next.js project until Phase 1 is actually complete.

Still open, not blocking Phase 1: whether the deployed app needs a simple password/PIN access gate, since it will be reachable by anyone with the URL (see `DECISIONS.md`'s "Production stack locked" entry).

## Blocked

None.

## Completed

- [x] [Phase 0a] Define core feature set: calendar attendance entry (Present/Half-Day/Leave + optional per-date advance salary amount), live stat cards (Earned So Far, Advance Taken, Net Payable), Salary Setup (per-day rate, everything else auto-calculated) — 2026-09-04
- [x] [Phase 0b] Build interactive Claude Design Components prototype (`prototype/Main.dc.html`) covering the full Home page flow, with working calendar navigation, date-entry modal, live stat calculations, and salary setup — 2026-09-04
- [x] [Phase 0b] Background review of prototype source found and fixed two real bugs: the "today" ring on the calendar never rendered (`todayKey` was read from the wrong object), and a ₹0 advance was silently treated as no advance (truthiness check on the amount instead of a dedicated flag) — 2026-09-04
- [x] [Phase 0b] Convert prototype to a dark theme (near-black background, brightened indigo accent and status colors for dark-background contrast), layout/structure unchanged — 2026-09-04
- [x] [Phase 0b] Owner reviewed and approved this version of the design and styling — 2026-09-04
- [x] [Phase 0a] Lock production stack: Next.js (TypeScript), React frontend with AJAX-driven updates, PostgreSQL (local dev / Neon production), Render (free tier), UptimeRobot keep-alive — 2026-09-04
