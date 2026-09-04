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

- Status: Open
- Date: 2026-09-04
- Context: Only the prototyping stage (Phase 0) has been done so far; the owner has not yet specified a production framework, hosting target, or persistence approach (local storage vs. a backend + database, web vs. desktop vs. mobile).
- Decision: Not yet made. Do not assume a stack or begin production implementation until the owner decides — see `CLAUDE.md`, `TASKS.md`.
- Reasoning: N/A — decision is pending.
- Consequences: `PHASES.md`'s Phase 1 remains undefined until this is resolved.
