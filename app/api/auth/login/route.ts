import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const result = await pool.query<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE username = $1",
    [username],
  );
  const user = result.rows[0];

  const invalidResponse = () =>
    NextResponse.json({ error: "Invalid username or password." }, { status: 401 });

  if (!user) return invalidResponse();

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) return invalidResponse();

  const { token, expiresAt } = await createSession(user.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return response;
}
