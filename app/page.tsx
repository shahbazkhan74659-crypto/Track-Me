"use client";

import { useEffect, useState } from "react";

type SessionState = { authenticated: false } | { authenticated: true; username: string };

export default function BackendTestPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

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
    </main>
  );
}
