import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getTodayIST, normalizeYearMonth, buildMonthGrid } from "@/lib/calendar";

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

  const today = getTodayIST();

  let year: number;
  let month: number;

  if (yearParam === null && monthParam === null) {
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
  const cells = buildMonthGrid(requested.year, requested.month, today);

  return NextResponse.json({ today, requested, cells });
}
