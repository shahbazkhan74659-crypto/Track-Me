import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, username: user.username });
}
