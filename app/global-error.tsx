"use client";

import { colors } from "@/lib/theme";

// Deliberately minimal and self-contained: this replaces the entire root
// layout (fonts included) when the layout itself throws, so it can't rely
// on anything the layout would normally provide.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          width: "100%",
          background: colors.pageBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
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
          <div style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 6 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
            {error.message || "An unexpected error occurred."}
          </div>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: colors.accent,
              color: colors.pageBackground,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
