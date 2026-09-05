import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getTodayIST, normalizeYearMonth } from "@/lib/calendar";

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

  const [salaryResult, aggResult] = await Promise.all([
    pool.query<{ per_day_salary: string | null }>(
      "SELECT per_day_salary FROM users WHERE id = $1",
      [user.id],
    ),
    pool.query<{
      present_days: string;
      half_days: string;
      leave_days: string;
      advance_taken: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'present') AS present_days,
         COUNT(*) FILTER (WHERE status = 'half') AS half_days,
         COUNT(*) FILTER (WHERE status = 'leave') AS leave_days,
         COALESCE(SUM(advance) FILTER (WHERE advance_on), 0) AS advance_taken
       FROM entries
       WHERE user_id = $1 AND year = $2 AND month = $3`,
      [user.id, requested.year, requested.month],
    ),
  ]);

  const rawRate = salaryResult.rows[0]?.per_day_salary ?? null;
  const perDaySalary = rawRate === null ? null : Number(rawRate);

  const agg = aggResult.rows[0];
  const presentDays = Number(agg.present_days);
  const halfDays = Number(agg.half_days);
  const leaveDays = Number(agg.leave_days);
  const advanceTaken = Number(agg.advance_taken);

  const earned =
    perDaySalary === null ? null : presentDays * perDaySalary + halfDays * (perDaySalary / 2);
  const netPayable = earned === null ? null : earned - advanceTaken;

  return NextResponse.json({
    year: requested.year,
    month: requested.month,
    perDaySalary,
    presentDays,
    halfDays,
    leaveDays,
    advanceTaken,
    earned,
    netPayable,
  });
}
