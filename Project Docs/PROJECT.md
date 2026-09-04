# Project

## Overview

**Track Me** (app name, chosen 2026-09-04 — "for now," per the owner, so treat it as the current working name rather than permanently final) is a personal attendance and salary record app, built for a single owner to track their own day-by-day attendance (Present / Half-Day / Leave) and any salary advances taken, and to see their earned and net-payable salary for the current month update live as they log it. The project's folder/repo on disk (`C:\RajuApp`) and its GitHub remote (`Track-Me`) predate this name and are not being renamed to match — this file is the source of truth for the app's actual name.

The app currently exists only as a client-approved, interactive visual prototype (`prototype/Main.dc.html`, published as a Claude Design canvas/Artifact). No production backend, framework, or database has been built. See `ARCHITECTURE.md` for what actually exists, and `DECISIONS.md` for decisions made so far.

## Problem

The owner has no simple, personal place to log daily attendance and salary advances and see, at a glance, how much they've earned and are owed so far in the current month.

## Purpose

Give the owner one place to mark each day's attendance status, optionally record a salary advance taken on that day, and see live, automatically-calculated salary figures derived from a single per-day rate.

## Goals

- A calendar-based Home page: navigate month/year, click any date to log its status.
- Per-date entry: three states — Present, Half-Day, Leave — plus an optional "Advance Salary" amount for that date.
- Live stat cards: Earned So Far (this month), Advance Taken (this month), Net Payable (Earned − Advance).
- A Salary Setup control: owner sets only a per-day salary rate; everything else is calculated automatically from it.
- Professional, clean, polished visual design (client-approved dark theme, 2026-09-04 — see `DECISIONS.md`).

## Non-Goals

- Not a multi-user or multi-tenant product — it's a personal, single-user tool. (A login backend, Phase 3 in `PHASES.md`, gates access since the app is deployed for someone other than the owner — this adds authentication, it does not make the app multi-tenant. See `DECISIONS.md`.)
- No self-service signup. There is exactly one account, created directly by the owner via a manual provisioning script (`scripts/seed-user.mjs`) — not a signup form. The person borrowing the app logs in with that account; they cannot create their own.
- Not a payroll/HR system for teams or organizations.
- Not intended to model complex pay structures (overtime, taxes, deductions beyond a simple advance) unless the owner asks for that later.

## Target Users

The app owner only — a single personal user, self-tracking their own attendance and salary.

## Core Features

Per the original brief and the approved prototype:

- Calendar with month/year navigation; every date clickable.
- Date entry form: Present / Half-Day / Leave icon buttons, an "Advance Salary" checkbox that reveals a ₹ amount field, and a Done button (always visible, even when the amount field is hidden).
- Live stat cards showing income earned so far this month and the final (net) salary so far, including advances taken.
- Salary Setup: owner sets a per-day salary; present/half-day pay, totals, and net payable are all derived automatically.

The existing prototype (`prototype/Main.dc.html`) implements all of the above as a fully interactive mockup with in-memory sample data. See `ARCHITECTURE.md`.

## Current Status

Early production build. The approved interactive prototype still exists as a visual/interaction reference. The real Next.js/TypeScript project is now under construction: Phase 2 scaffolded it, and Phase 3 added a working login backend (single owner-provisioned account, DB-backed sessions) wired to the local `trackme_dev` Postgres database. No real frontend, salary/calendar/advance backend engines, or deployment exist yet. See `PHASES.md` and `TASKS.md`.

## Constraints

Production stack locked 2026-09-04: Next.js (TypeScript), React frontend with AJAX-driven updates, PostgreSQL (local for dev, Neon for production), deployed on Render's free tier with an UptimeRobot keep-alive ping. See `DECISIONS.md`. Must be deployed and reachable in a browser — it's for someone other than the owner to use, not confined to one person's local browser storage. Access protection is resolved: Phase 3's login backend gates the app (see above); there is no separate password/PIN layer beyond that login.

## Scope

A single-owner personal attendance/salary tool. Not a multi-user or multi-tenant product.

## Success Criteria

To be defined.
