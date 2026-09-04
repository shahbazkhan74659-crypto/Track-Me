# Project

## Overview

RajuApp is a personal attendance and salary record app, built for a single owner to track their own day-by-day attendance (Present / Half-Day / Leave) and any salary advances taken, and to see their earned and net-payable salary for the current month update live as they log it.

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

- Not a multi-user or multi-tenant product. No login/authentication system is in scope — this is a personal, single-user tool (see `DECISIONS.md`).
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

Pre-development / prototyping stage. One interactive visual prototype exists and has been reviewed and approved by the client, including a dark-theme revision. No production backend, framework, persistence, or deployment exists yet. See `PHASES.md` and `TASKS.md`.

## Constraints

To be defined — production platform target (web app, desktop, mobile), hosting, and persistence approach have not yet been decided.

## Scope

A single-owner personal attendance/salary tool. Not a multi-user or multi-tenant product.

## Success Criteria

To be defined.
