import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await pool.query<{ per_day_salary: string | null }>(
    "SELECT per_day_salary FROM users WHERE id = $1",
    [user.id],
  );

  const raw = result.rows[0]?.per_day_salary ?? null;
  return NextResponse.json({ perDaySalary: raw === null ? null : Number(raw) });
}

export async function PUT(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { perDaySalary } = (await request.json()) as { perDaySalary?: unknown };

  if (typeof perDaySalary !== "number" || !Number.isFinite(perDaySalary) || perDaySalary <= 0) {
    return NextResponse.json(
      { error: "perDaySalary must be a positive number." },
      { status: 400 },
    );
  }

  await pool.query("UPDATE users SET per_day_salary = $1 WHERE id = $2", [
    perDaySalary,
    user.id,
  ]);

  return NextResponse.json({ perDaySalary });
}
