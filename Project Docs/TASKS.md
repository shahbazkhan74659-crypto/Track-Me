# Current Tasks

## Active

None actively in progress.

## Next

The owner locked the full Phase 0–18 roadmap on 2026-09-04 (see `PHASES.md`). [Phase 1] "Local PostgreSQL Setup" is next in line, with its install method already decided (native Windows install via `winget`, package `PostgreSQL.PostgreSQL.17` — not Docker, see `DECISIONS.md`), but **explicitly not started yet** — the owner said "don't start Phase 1" (2026-09-04). Do not run the install, scaffold anything, or start any phase's work until the owner gives the go-ahead.

Note 2026-09-04: a first attempt to jump straight into scaffolding the Next.js project (before Phase 1's database setup) was interrupted and reverted by the owner — "we are not going to start coding yet." The owner then scoped Phase 1 down to local database setup only, separately confirmed not to start executing it yet, and then locked the full downstream roadmap (Phases 2–18) in one message.

Resolved 2026-09-04: the earlier open question — whether the deployed app needs a password/PIN access gate — is answered by the roadmap itself: [Phase 3] is a real Login/Signup Backend. See `DECISIONS.md`'s "Login/signup backend added to the roadmap" entry, which also flags that this reverses the earlier "no authentication planned" decision — `PROJECT.md` and `ARCHITECTURE.md` were updated to match.

**Reminder:** per `CLAUDE.md`'s first rule, nothing gets committed or pushed to git until the owner explicitly says so — this applies to all future work, not just documentation.

## Blocked

None.

## Completed

- [x] [Phase 0a] Define core feature set: calendar attendance entry (Present/Half-Day/Leave + optional per-date advance salary amount), live stat cards (Earned So Far, Advance Taken, Net Payable), Salary Setup (per-day rate, everything else auto-calculated) — 2026-09-04
- [x] [Phase 0b] Build interactive Claude Design Components prototype (`prototype/Main.dc.html`) covering the full Home page flow, with working calendar navigation, date-entry modal, live stat calculations, and salary setup — 2026-09-04
- [x] [Phase 0b] Background review of prototype source found and fixed two real bugs: the "today" ring on the calendar never rendered (`todayKey` was read from the wrong object), and a ₹0 advance was silently treated as no advance (truthiness check on the amount instead of a dedicated flag) — 2026-09-04
- [x] [Phase 0b] Convert prototype to a dark theme (near-black background, brightened indigo accent and status colors for dark-background contrast), layout/structure unchanged — 2026-09-04
- [x] [Phase 0b] Owner reviewed and approved this version of the design and styling — 2026-09-04
- [x] [Phase 0a] Lock production stack: Next.js (TypeScript), React frontend with AJAX-driven updates, PostgreSQL (local dev / Neon production), Render (free tier), UptimeRobot keep-alive — 2026-09-04
- [x] Split Phase 1 to local PostgreSQL setup only, and decide its install method (native Windows, via `winget`) — 2026-09-04
- [x] Lock the full downstream roadmap, Phase 2 through Phase 18 — see `PHASES.md` — 2026-09-04
