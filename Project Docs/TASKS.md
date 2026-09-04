# Current Tasks

## Active

None actively in progress.

## Next

Production stack, hosting, and persistence approach have not been chosen yet. The next step is for the project owner to decide these (see `PROJECT.md`'s Constraints and `DECISIONS.md`) so Phase 1 of `PHASES.md` can be defined. Do not start production implementation before that decision is made — see `CLAUDE.md`.

## Blocked

None.

## Completed

- [x] [Phase 0a] Define core feature set: calendar attendance entry (Present/Half-Day/Leave + optional per-date advance salary amount), live stat cards (Earned So Far, Advance Taken, Net Payable), Salary Setup (per-day rate, everything else auto-calculated) — 2026-09-04
- [x] [Phase 0b] Build interactive Claude Design Components prototype (`prototype/Main.dc.html`) covering the full Home page flow, with working calendar navigation, date-entry modal, live stat calculations, and salary setup — 2026-09-04
- [x] [Phase 0b] Background review of prototype source found and fixed two real bugs: the "today" ring on the calendar never rendered (`todayKey` was read from the wrong object), and a ₹0 advance was silently treated as no advance (truthiness check on the amount instead of a dedicated flag) — 2026-09-04
- [x] [Phase 0b] Convert prototype to a dark theme (near-black background, brightened indigo accent and status colors for dark-background contrast), layout/structure unchanged — 2026-09-04
- [x] [Phase 0b] Owner reviewed and approved this version of the design and styling — 2026-09-04
