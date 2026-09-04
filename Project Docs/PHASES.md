# Development Phases

The project owner has not yet defined a numbered production build roadmap beyond the initial prototyping stage recorded below as **Phase 0 — Pre-Development**. Do not invent additional phases beyond what is listed here — see `CLAUDE.md` rule 3. When the owner defines Phase 1 and beyond (production stack, implementation order), record it here.

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

**Phase 0 overall status: 0b complete; 0a (stack/persistence decisions) still open.**
