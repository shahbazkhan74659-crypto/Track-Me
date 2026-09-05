"use client";

import { useEffect } from "react";
import { colors } from "@/lib/theme";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
      <div
        style={{
          width: 320,
          maxWidth: "100%",
          background: colors.panelBackground,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 18,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 20px 60px oklch(0% 0 0 / 0.55)",
        }}
      >
        <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 6 }}>
          Something went wrong
        </div>
        <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
          An unexpected error occurred. You can try again.
        </div>
        <button type="button" className="btn-primary" onClick={() => retry()} style={{ width: "100%" }}>
          Try again
        </button>
      </div>
    </div>
  );
}
