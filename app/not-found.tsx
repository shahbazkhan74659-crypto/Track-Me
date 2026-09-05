import Link from "next/link";
import { colors } from "@/lib/theme";

export default function NotFound() {
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
        <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 34, color: colors.accent, marginBottom: 6 }}>
          404
        </div>
        <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 6 }}>
          Page not found
        </div>
        <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
          The page you&rsquo;re looking for doesn&rsquo;t exist.
        </div>
        <Link href="/" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
          Back to Track Me
        </Link>
      </div>
    </div>
  );
}
