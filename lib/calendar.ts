export interface TodayIST {
  year: number;
  month: number; // 0-indexed (0 = January), matches the entry-key convention
  day: number;
  weekday: number; // 0 = Sunday .. 6 = Saturday
}

/**
 * Returns the current wall-clock date in Asia/Kolkata (IST, UTC+5:30, no DST),
 * independent of the server process's local timezone.
 */
export function getTodayIST(referenceDate: Date = new Date()): TodayIST {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(referenceDate);

  const map = Object.fromEntries(
    parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  );

  const year = Number(map.year);
  const month = Number(map.month) - 1;
  const day = Number(map.day);
  const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();

  return { year, month, day, weekday };
}

/**
 * Rolls (year, month) into canonical form (month forced into 0-11, year adjusted),
 * e.g. (2026, 12) -> (2027, 0); (2026, -1) -> (2025, 11).
 */
export function normalizeYearMonth(year: number, month: number): { year: number; month: number } {
  const d = new Date(Date.UTC(year, month, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

/** Number of days in (year, month), leap-year correct. month is 0-indexed. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Weekday (0=Sun..6=Sat) of the 1st of (year, month). */
export function weekdayOfFirst(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 1)).getUTCDay();
}

/** Weekday (0=Sun..6=Sat) of an arbitrary (year, month, day). */
export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day)).getUTCDay();
}

export interface CalendarCell {
  year: number;
  month: number; // 0-indexed
  day: number;
  weekday: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Builds the fixed 6x7 (42-cell) grid for (year, month), Sunday-first,
 * including real leading/trailing adjacent-month dates.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  today: TodayIST = getTodayIST(),
): CalendarCell[] {
  const { year: y, month: m } = normalizeYearMonth(year, month);
  const firstWeekday = weekdayOfFirst(y, m);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const dayOffset = i - firstWeekday + 1;
    const cellDate = new Date(Date.UTC(y, m, dayOffset));
    const cy = cellDate.getUTCFullYear();
    const cm = cellDate.getUTCMonth();
    const cd = cellDate.getUTCDate();
    const weekday = cellDate.getUTCDay();

    cells.push({
      year: cy,
      month: cm,
      day: cd,
      weekday,
      isCurrentMonth: cy === y && cm === m,
      isToday: cy === today.year && cm === today.month && cd === today.day,
    });
  }
  return cells;
}
