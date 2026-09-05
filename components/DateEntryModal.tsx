"use client";

import { useState } from "react";
import { colors } from "@/lib/theme";
import type { DateEntry, Status } from "@/components/CalendarCard";

interface DateEntryModalProps {
  title: string;
  existingEntry: DateEntry | null;
  onClose: () => void;
  onSave: (entry: DateEntry) => Promise<void>;
  onClear: () => Promise<void>;
}

const STATUS_OPTIONS: { value: Status; label: string; color: string; soft: string }[] = [
  { value: "present", label: "Present", color: colors.statusPresent, soft: colors.statusPresentSoft },
  { value: "half", label: "Half-Day", color: colors.statusHalf, soft: colors.statusHalfSoft },
  { value: "leave", label: "Leave", color: colors.statusLeave, soft: colors.statusLeaveSoft },
];

function StatusIcon({ value, color }: { value: Status; color: string }) {
  if (value === "present") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  if (value === "half") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1.5}>
        <path d="M12 3a9 9 0 000 18V3z" />
        <circle cx="12" cy="12" r="8.25" fill="none" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

export default function DateEntryModal({ title, existingEntry, onClose, onSave, onClear }: DateEntryModalProps) {
  const [draftStatus, setDraftStatus] = useState<Status | null>(existingEntry?.status ?? null);
  const [draftAdvanceOn, setDraftAdvanceOn] = useState(existingEntry?.advanceOn ?? false);
  const [draftAdvanceAmt, setDraftAdvanceAmt] = useState(
    existingEntry?.advanceOn ? String(existingEntry.advance) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmt = Number(draftAdvanceAmt);
  const amountInvalid = draftAdvanceOn && draftAdvanceAmt.trim() !== "" && !(Number.isFinite(parsedAmt) && parsedAmt >= 0);
  const canSave = draftStatus !== null && !amountInvalid;

  const save = async () => {
    if (!canSave || draftStatus === null || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        status: draftStatus,
        advanceOn: draftAdvanceOn,
        advance: draftAdvanceOn ? (Number(draftAdvanceAmt) || 0) : 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onClear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear.");
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "oklch(5% 0 0 / 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Date entry"
        style={{
          width: 320,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: colors.panelBackground,
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 20px 60px oklch(0% 0 0 / 0.55)",
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 15, color: colors.text }}>
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {existingEntry && (
              <span
                onClick={clear}
                style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.statusLeave, cursor: "pointer", fontWeight: 600 }}
              >
                Clear
              </span>
            )}
            <span onClick={onClose} style={{ cursor: "pointer", color: colors.textMuted, display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {STATUS_OPTIONS.map((opt) => {
            const selected = draftStatus === opt.value;
            const iconColor = selected ? opt.color : colors.textMuted;
            return (
              <div
                key={opt.value}
                className="status-btn"
                onClick={() => setDraftStatus(opt.value)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "14px 8px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: `1.5px solid ${selected ? opt.color : colors.border}`,
                  background: selected ? opt.soft : colors.cellBackground,
                  transition: "all 0.15s ease",
                }}
              >
                <StatusIcon value={opt.value} color={iconColor} />
                <span style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 11, fontWeight: 600, color: iconColor }}>
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", marginBottom: 2 }}>
          <input
            type="checkbox"
            checked={draftAdvanceOn}
            onChange={() => setDraftAdvanceOn((v) => !v)}
            style={{ width: 16, height: 16, accentColor: colors.accent, cursor: "pointer" }}
          />
          <span style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 13, color: colors.text, fontWeight: 500 }}>
            Advance Salary
          </span>
        </label>

        {draftAdvanceOn && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 10,
              border: `1.5px solid ${colors.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                padding: "10px 12px",
                background: colors.inputPrefixBackground,
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 700,
                color: colors.textMuted,
                fontSize: 14,
              }}
            >
              ₹
            </span>
            <input
              type="number"
              min="0"
              placeholder="0"
              aria-label="Advance amount"
              value={draftAdvanceAmt}
              onChange={(e) => setDraftAdvanceAmt(e.target.value)}
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                outline: "none",
                padding: "10px 12px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                background: colors.panelBackground,
              }}
            />
          </div>
        )}

        {error && (
          <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.statusLeave, marginTop: 12 }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={!canSave || saving}
          style={{
            width: "100%",
            marginTop: 18,
            padding: 13,
            borderRadius: 10,
            border: "none",
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: canSave && !saving ? "pointer" : "not-allowed",
            background: canSave && !saving ? colors.accent : colors.disabledControlBackground,
            color: canSave && !saving ? colors.pageBackground : colors.disabledControlText,
            transition: "background 0.15s ease",
          }}
        >
          {saving ? "Saving…" : "Done"}
        </button>
      </div>
    </div>
  );
}
