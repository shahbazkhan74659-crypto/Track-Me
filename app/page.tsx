"use client";

import { useEffect, useState } from "react";

type SessionState = { authenticated: false } | { authenticated: true; username: string };

export default function BackendTestPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [perDaySalary, setPerDaySalary] = useState<number | null>(null);
  const [salaryInput, setSalaryInput] = useState("");
  const [salaryError, setSalaryError] = useState<string | null>(null);

  type TodayIST = { year: number; month: number; day: number; weekday: number };
  type CalendarCell = {
    year: number;
    month: number;
    day: number;
    weekday: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  };

  const [todayIST, setTodayIST] = useState<TodayIST | null>(null);
  const [calendarCells, setCalendarCells] = useState<CalendarCell[]>([]);
  const [calendarRequested, setCalendarRequested] = useState<{ year: number; month: number } | null>(
    null,
  );
  const [yearInput, setYearInput] = useState("");
  const [monthInput, setMonthInput] = useState("");
  const [calendarError, setCalendarError] = useState<string | null>(null);

  async function refreshSession() {
    const res = await fetch("/api/auth/session");
    setSession(await res.json());
  }

  useEffect(() => {
    let ignore = false;

    (async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (!ignore) setSession(data);
    })();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!session?.authenticated) {
        if (!ignore) setPerDaySalary(null);
        return;
      }

      const res = await fetch("/api/salary");
      const data = await res.json();
      if (!ignore) setPerDaySalary(data.perDaySalary);
    })();

    return () => {
      ignore = true;
    };
  }, [session]);

  async function loadCalendar(year?: number, month?: number) {
    setCalendarError(null);
    const qs = year !== undefined && month !== undefined ? `?year=${year}&month=${month}` : "";
    const res = await fetch(`/api/calendar${qs}`);
    const data = await res.json();
    if (!res.ok) {
      setCalendarError(data.error ?? "Failed to load calendar.");
      return;
    }
    setTodayIST(data.today);
    setCalendarCells(data.cells);
    setCalendarRequested(data.requested);
    setYearInput(String(data.requested.year));
    setMonthInput(String(data.requested.month));
  }

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!session?.authenticated) {
        if (!ignore) {
          setTodayIST(null);
          setCalendarCells([]);
          setCalendarRequested(null);
        }
        return;
      }
      await loadCalendar();
    })();

    return () => {
      ignore = true;
    };
  }, [session]);

  function handleLoadCalendar(e: React.FormEvent) {
    e.preventDefault();
    loadCalendar(Number(yearInput), Number(monthInput));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setLoginError(error ?? "Login failed.");
      return;
    }

    setUsername("");
    setPassword("");
    await refreshSession();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshSession();
  }

  async function handleSaveSalary(e: React.FormEvent) {
    e.preventDefault();
    setSalaryError(null);

    const res = await fetch("/api/salary", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perDaySalary: Number(salaryInput) }),
    });

    const data = await res.json();
    if (!res.ok) {
      setSalaryError(data.error ?? "Save failed.");
      return;
    }

    setPerDaySalary(data.perDaySalary);
    setSalaryInput("");
  }

  return (
    <main style={{ background: "#ffffff", color: "#111111", padding: "2rem" }}>
      <h1>Track Me — Backend Test Page</h1>
      <p>
        This is a temporary, unstyled page (Phase 2) for exercising the backend
        engines built in Phases 3–7. Test controls will be added here as each
        engine lands, and this page will be removed once Phase 8 finishes.
      </p>

      <h2>Login (Phase 3)</h2>
      <p>
        Status:{" "}
        {session === null
          ? "checking…"
          : session.authenticated
            ? `logged in as "${session.username}"`
            : "not logged in"}
      </p>

      {session?.authenticated ? (
        <button onClick={handleLogout}>Log out</button>
      ) : (
        <form onSubmit={handleLogin}>
          <div>
            <label>
              Username{" "}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Password{" "}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <button type="submit">Log in</button>
          {loginError ? <p style={{ color: "#b00020" }}>{loginError}</p> : null}
        </form>
      )}

      {session?.authenticated ? (
        <>
          <h2>Salary Setup (Phase 4)</h2>
          <p>Current per-day rate: {perDaySalary === null ? "not set" : `₹${perDaySalary}`}</p>
          <form onSubmit={handleSaveSalary}>
            <label>
              Per-day salary{" "}
              <input
                type="number"
                step="0.01"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
              />
            </label>
            <button type="submit">Save</button>
            {salaryError ? <p style={{ color: "#b00020" }}>{salaryError}</p> : null}
          </form>

          <h2>Calendar (Phase 5)</h2>
          <p>
            Today (Asia/Kolkata):{" "}
            {todayIST
              ? `${todayIST.year}-${todayIST.month}-${todayIST.day} (weekday ${todayIST.weekday}, 0=Sun)`
              : "loading…"}
          </p>
          <form onSubmit={handleLoadCalendar}>
            <label>
              Year{" "}
              <input
                type="number"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
              />
            </label>{" "}
            <label>
              Month (0-11){" "}
              <input
                type="number"
                value={monthInput}
                onChange={(e) => setMonthInput(e.target.value)}
              />
            </label>
            <button type="submit">Load month</button>
            {calendarError ? <p style={{ color: "#b00020" }}>{calendarError}</p> : null}
          </form>
          {calendarRequested ? (
            <p>
              Showing {calendarRequested.year}-{calendarRequested.month}
            </p>
          ) : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 44px)", gap: "2px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} style={{ fontWeight: "bold", textAlign: "center" }}>
                {d}
              </div>
            ))}
            {calendarCells.map((c, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "6px 0",
                  opacity: c.isCurrentMonth ? 1 : 0.4,
                  border: c.isToday ? "2px solid #1a73e8" : "1px solid #ccc",
                }}
              >
                {c.day}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}
