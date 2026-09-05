import { formatINR } from "@/lib/format";
import { colors } from "@/lib/theme";

const labelStyle = {
  fontFamily: "var(--font-work-sans), sans-serif",
  fontSize: 11,
  fontWeight: 700,
  color: colors.textMuted,
  letterSpacing: ".05em",
  textTransform: "uppercase" as const,
  marginBottom: 10,
};

const subtextStyle = {
  fontFamily: "var(--font-work-sans), sans-serif",
  fontSize: 12,
  color: colors.textMuted,
};

export default function StatCards() {
  // No per-day rate or entries can be set yet (Salary Setup is Phase 12, the
  // date-entry modal is Phase 13, the backend isn't wired until Phase 14) —
  // this is the same "unset rate" state GET /api/summary already returns:
  // earned/netPayable are null, day counts and advance are real zeros.
  const perDaySalary: number | null = null;
  const advanceTaken = 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20, marginBottom: 24 }}>
      <div
        style={{
          background: colors.panelBackground,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 1px 2px oklch(0% 0 0 / 0.3), 0 8px 20px oklch(0% 0 0 / 0.32)",
        }}
      >
        <div style={labelStyle}>Earned so far</div>
        <div
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          {perDaySalary === null ? "—" : formatINR(0)}
        </div>
        <div style={subtextStyle}>{perDaySalary === null ? "Set a rate to see earnings" : ""}</div>
      </div>

      <div
        style={{
          background: colors.panelBackground,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 1px 2px oklch(0% 0 0 / 0.3), 0 8px 20px oklch(0% 0 0 / 0.32)",
        }}
      >
        <div style={labelStyle}>Advance taken</div>
        <div
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: colors.statusLeave,
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          {formatINR(advanceTaken)}
        </div>
        <div style={subtextStyle}>{advanceTaken > 0 ? "Deducted from this month" : "No advances taken"}</div>
      </div>

      <div
        style={{
          background: colors.netPanelBackground,
          border: `1px solid ${colors.netPanelBorder}`,
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 1px 2px oklch(0% 0 0 / 0.3), 0 8px 20px oklch(0% 0 0 / 0.32)",
        }}
      >
        <div style={{ ...labelStyle, color: colors.netAccentTextMuted }}>Net payable</div>
        <div
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: colors.netAccentText,
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          {perDaySalary === null ? "—" : formatINR(0)}
        </div>
        <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.netAccentTextMuted }}>
          {perDaySalary === null ? "Set a rate to see earnings" : "This month, after advances"}
        </div>
      </div>
    </div>
  );
}
