import { cookies } from "next/headers";
import AttendanceApp from "@/components/AttendanceApp";
import LoginGate from "@/components/LoginGate";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { colors } from "@/lib/theme";

export default async function HomePage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: colors.pageBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <LoginGate />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: colors.pageBackground,
        color: colors.text,
        padding: "40px 24px 64px",
      }}
    >
      <AttendanceApp username={user.username} />
    </div>
  );
}
