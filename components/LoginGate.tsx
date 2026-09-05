"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/theme";

const fieldLabelStyle = {
  fontFamily: "var(--font-work-sans), sans-serif",
  fontSize: 11,
  fontWeight: 700,
  color: colors.textMuted,
  letterSpacing: ".04em",
  textTransform: "uppercase" as const,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  border: `1.5px solid ${colors.border}`,
  borderRadius: 10,
  outline: "none",
  padding: "11px 12px",
  fontFamily: "var(--font-work-sans), sans-serif",
  fontSize: 14,
  color: colors.text,
  background: colors.panelBackground,
};

export default function LoginGate() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Login failed.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        width: 320,
        maxWidth: "100%",
        background: colors.panelBackground,
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 20px 60px oklch(0% 0 0 / 0.55)",
      }}
    >
      <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 18, color: colors.text, marginBottom: 4 }}>
        Attendance
      </div>
      <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 13, color: colors.textMuted, marginBottom: 22 }}>
        Sign in to continue.
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={fieldLabelStyle}>Username</div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={fieldLabelStyle}>Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          style={inputStyle}
        />
      </div>

      {error && (
        <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.statusLeave, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={submitting} style={{ width: "100%" }}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
