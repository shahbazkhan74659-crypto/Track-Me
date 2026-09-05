"use client";

import { useState } from "react";
import { buildMonthGrid, getTodayIST, normalizeYearMonth } from "@/lib/calendar";
import { colors } from "@/lib/theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />
      <span style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.textMuted }}>
        {label}
      </span>
    </div>
  );
}

export default function CalendarCard() {
  const today = getTodayIST();
  const [view, setView] = useState({ year: today.year, month: today.month });

  const cells = buildMonthGrid(view.year, view.month, today);

  const prevMonth = () => setView(({ year, month }) => normalizeYearMonth(year, month - 1));
  const nextMonth = () => setView(({ year, month }) => normalizeYearMonth(year, month + 1));
  const goToday = () => setView({ year: today.year, month: today.month });

  return (
    <div
      style={{
        background: colors.panelBackground,
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 1px 2px oklch(0% 0 0 / 0.3), 0 8px 24px oklch(0% 0 0 / 0.34)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className="chevron-btn" onClick={prevMonth} aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: colors.text,
              minWidth: 150,
              textAlign: "center",
            }}
          >
            {MONTH_NAMES[view.month]} {view.year}
          </div>
          <button type="button" className="chevron-btn" onClick={nextMonth} aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <span
          className="today-link"
          onClick={goToday}
          style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12.5, fontWeight: 600, color: colors.accent }}
        >
          Today
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8, marginBottom: 8 }}>
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            style={{
              textAlign: "center",
              fontFamily: "var(--font-work-sans), sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: colors.textMuted,
              letterSpacing: ".04em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8 }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 60,
              borderRadius: 12,
              background: colors.cellBackground,
              border: `1px solid ${cell.isCurrentMonth ? colors.border : "transparent"}`,
              boxShadow: cell.isToday ? `0 0 0 2px ${colors.accent}` : "none",
              opacity: cell.isCurrentMonth ? 1 : 0.3,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                fontWeight: cell.isCurrentMonth ? 600 : 500,
                color: cell.isCurrentMonth ? colors.text : colors.textMuted,
              }}
            >
              {cell.day}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 18,
          paddingTop: 16,
          borderTop: `1px solid ${colors.panelBorder}`,
          flexWrap: "wrap",
        }}
      >
        <LegendDot color={colors.statusPresent} label="Present" />
        <LegendDot color={colors.statusHalf} label="Half-day" />
        <LegendDot color={colors.statusLeave} label="Leave" />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: colors.accent,
              color: colors.pageBackground,
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ₹
          </span>
          <span style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.textMuted }}>
            Advance taken
          </span>
        </div>
      </div>
    </div>
  );
}
