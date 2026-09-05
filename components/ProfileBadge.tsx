import { colors } from "@/lib/theme";

export default function ProfileBadge({ username }: { username: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        title={username}
        style={{
          position: "relative",
          width: 40,
          height: 40,
          borderRadius: 11,
          background: "linear-gradient(135deg, oklch(70% 0.15 262), oklch(55% 0.14 262))",
          boxShadow: "inset 0 0 0 1px oklch(100% 0 0 / 0.15)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Custom profile glyph: head + shoulders built from two clipped circles, not a library icon */}
        <span
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "oklch(20% 0.02 260 / 0.9)",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: -9,
            left: "50%",
            transform: "translateX(-50%)",
            width: 27,
            height: 22,
            borderRadius: "50% 50% 0 0 / 60% 60% 0 0",
            background: "oklch(20% 0.02 260 / 0.9)",
          }}
        />
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
          {username}
        </div>
        <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.textMuted }}>
          Personal record
        </div>
      </div>
    </div>
  );
}
