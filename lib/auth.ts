import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";

export const SESSION_COOKIE_NAME = "trackme_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await pool.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)", [
    token,
    userId,
    expiresAt,
  ]);

  return { token, expiresAt };
}

export async function getSessionUser(token: string | undefined): Promise<{ id: number; username: string } | null> {
  if (!token) return null;

  const result = await pool.query<{ id: number; username: string }>(
    `SELECT users.id, users.username
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = $1 AND sessions.expires_at > now()`,
    [token],
  );

  return result.rows[0] ?? null;
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await pool.query("DELETE FROM sessions WHERE id = $1", [token]);
}

export async function requireAuth(
  request: NextRequest,
): Promise<{ id: number; username: string } | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getSessionUser(token);
}
