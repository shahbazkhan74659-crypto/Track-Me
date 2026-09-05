import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getTodayIST, normalizeYearMonth, daysInMonth } from "@/lib/calendar";

const VALID_STATUSES = ["present", "half", "leave"] as const;
type Status = (typeof VALID_STATUSES)[number];

function isValidStatus(value: unknown): value is Status {
  return typeof value === "string" && (VALID_STATUSES as readonly string[]).includes(value);
}

/**
 * Validates that year/month/day identify a real calendar date, without rolling
 * month/year over (unlike GET's navigation semantics) — PUT/DELETE identify one
 * exact row, so an out-of-range month/day must be rejected, not normalized into
 * a different date.
 */
function parseDateIdentity(
  year: unknown,
  month: unknown,
  day: unknown,
): { year: number; month: number; day: number } | { error: string } {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return { error: "year, month, and day must be integers." };
  }
  const y = year as number;
  const m = month as number;
  const d = day as number;

  if (y < 1900 || y > 2200) {
    return { error: "year must be between 1900 and 2200." };
  }
  if (m < 0 || m > 11) {
    return { error: "month must be between 0 and 11." };
  }
  const maxDay = daysInMonth(y, m);
  if (d < 1 || d > maxDay) {
    return { error: `day must be between 1 and ${maxDay} for the given year/month.` };
  }
  return { year: y, month: m, day: d };
}

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const yearParam = request.nextUrl.searchParams.get("year");
  const monthParam = request.nextUrl.searchParams.get("month");

  if ((yearParam === null) !== (monthParam === null)) {
    return NextResponse.json(
      { error: "year and month must be provided together." },
      { status: 400 },
    );
  }

  let year: number;
  let month: number;

  if (yearParam === null && monthParam === null) {
    const today = getTodayIST();
    year = today.year;
    month = today.month;
  } else {
    const yearNum = Number(yearParam);
    const monthNum = Number(monthParam);

    if (
      yearParam!.trim() === "" ||
      monthParam!.trim() === "" ||
      !Number.isInteger(yearNum) ||
      !Number.isInteger(monthNum)
    ) {
      return NextResponse.json(
        { error: "year and month must be integers." },
        { status: 400 },
      );
    }

    if (yearNum < 1900 || yearNum > 2200) {
      return NextResponse.json(
        { error: "year must be between 1900 and 2200." },
        { status: 400 },
      );
    }

    year = yearNum;
    month = monthNum;
  }

  const requested = normalizeYearMonth(year, month);

  const result = await pool.query<{
    day: number;
    status: Status;
    advance_on: boolean;
    advance: string;
  }>(
    `SELECT day, status, advance_on, advance
     FROM entries
     WHERE user_id = $1 AND year = $2 AND month = $3
     ORDER BY day`,
    [user.id, requested.year, requested.month],
  );

  const entries = result.rows.map((row) => ({
    day: row.day,
    status: row.status,
    advanceOn: row.advance_on,
    advance: Number(row.advance),
  }));

  return NextResponse.json({ year: requested.year, month: requested.month, entries });
}

export async function PUT(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as {
    year?: unknown;
    month?: unknown;
    day?: unknown;
    status?: unknown;
    advanceOn?: unknown;
    advance?: unknown;
  };

  const parsed = parseDateIdentity(body.year, body.month, body.day);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { year, month, day } = parsed;

  if (!isValidStatus(body.status)) {
    return NextResponse.json(
      { error: "status must be one of 'present', 'half', 'leave'." },
      { status: 400 },
    );
  }
  const status = body.status;

  if (typeof body.advanceOn !== "boolean") {
    return NextResponse.json({ error: "advanceOn must be a boolean." }, { status: 400 });
  }
  const advanceOn = body.advanceOn;

  let advance = 0;
  if (advanceOn) {
    if (typeof body.advance !== "number" || !Number.isFinite(body.advance) || body.advance < 0) {
      return NextResponse.json(
        { error: "advance must be a finite number >= 0 when advanceOn is true." },
        { status: 400 },
      );
    }
    advance = body.advance;
  }

  await pool.query(
    `INSERT INTO entries (user_id, year, month, day, status, advance_on, advance, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (user_id, year, month, day)
     DO UPDATE SET
       status = EXCLUDED.status,
       advance_on = EXCLUDED.advance_on,
       advance = EXCLUDED.advance,
       updated_at = now()`,
    [user.id, year, month, day, status, advanceOn, advance],
  );

  return NextResponse.json({ year, month, day, status, advanceOn, advance });
}

export async function DELETE(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as { year?: unknown; month?: unknown; day?: unknown };

  const parsed = parseDateIdentity(body.year, body.month, body.day);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { year, month, day } = parsed;

  await pool.query(
    "DELETE FROM entries WHERE user_id = $1 AND year = $2 AND month = $3 AND day = $4",
    [user.id, year, month, day],
  );

  return NextResponse.json({ cleared: true, year, month, day });
}
