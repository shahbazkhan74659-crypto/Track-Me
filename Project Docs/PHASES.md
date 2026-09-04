# Development Phases

The project owner has defined Phase 0 (prototyping, complete) and locked the production stack (see `DECISIONS.md`), which Phase 1 below is scoped directly from. Beyond Phase 1, no further numbered phases have been defined yet. Do not invent additional phases beyond what is listed here — see `CLAUDE.md` rule 3.

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

## Phase 1 — Production Project Setup

### Objective
Initialize the real, deployable Next.js (TypeScript) project on the locked stack, and confirm it runs end-to-end — a working page served locally, backed by a real Postgres connection — before building out the app's actual features on top of it.

### Scope
Scaffold a Next.js + TypeScript project; connect it to a local PostgreSQL database for development; define the initial schema for attendance entries and the per-day salary rate (see `ARCHITECTURE.md`'s Planned Production Architecture for the intended shape, carried over from the prototype's `entries` structure). Provision the Neon (production) database and a Render deployment, and confirm a minimal deployed page loads over the public URL. Configure the UptimeRobot keep-alive ping against that deployed URL. Building out the actual calendar/attendance UI and API routes is not part of this phase's scope — that follows in a later phase once the base project is confirmed working.

### Completion Criteria
`next dev` serves a page locally with a confirmed local Postgres connection; the same project is deployed on Render and reachable at a public URL, backed by Neon; UptimeRobot is monitoring that URL.

**Status: Not started.**
