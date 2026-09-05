import { colors } from "@/lib/theme";

export default function ProfileBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: "linear-gradient(135deg, oklch(70% 0.15 262), oklch(55% 0.14 262))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 15, color: colors.pageBackground }}>
          A
        </span>
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: colors.text,
            letterSpacing: "-.01em",
          }}
        >
          Attendance
        </div>
        <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.textMuted }}>
          Personal record
        </div>
      </div>
    </div>
  );
}
