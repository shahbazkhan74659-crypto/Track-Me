"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import { colors } from "@/lib/theme";

interface SalarySetupControlProps {
  perDaySalary: number | null;
  onSave: (rate: number) => Promise<void>;
}

export default function SalarySetupControl({ perDaySalary, onSave }: SalarySetupControlProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    setDraft(perDaySalary === null ? "" : String(perDaySalary));
    setError(null);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const parsedDraft = Number(draft);
  const canSave = draft.trim() !== "" && Number.isFinite(parsedDraft) && parsedDraft > 0;

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(parsedDraft);
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 13, color: colors.textMuted }}>
          {perDaySalary === null ? "Not set" : `${formatINR(perDaySalary)} / day`}
        </span>
        <button type="button" className="btn-outline" onClick={openModal}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <circle cx="9" cy="6" r="2" fill={colors.panelBackground} />
            <line x1="4" y1="12" x2="20" y2="12" />
            <circle cx="15" cy="12" r="2" fill={colors.panelBackground} />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="11" cy="18" r="2" fill={colors.panelBackground} />
          </svg>
          Salary Setup
        </button>
      </div>

      {modalOpen && (
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
            style={{
              width: 300,
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
            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 4 }}>
              Salary Setup
            </div>
            <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              Set your per-day salary. Everything else is calculated automatically.
            </div>
            <div
              style={{
                fontFamily: "var(--font-work-sans), sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: colors.textMuted,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Per Day Salary
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1.5px solid ${colors.border}`,
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  padding: "11px 12px",
                  background: colors.inputPrefixBackground,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 700,
                  color: colors.textMuted,
                  fontSize: 15,
                }}
              >
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                style={{
                  flex: 1,
                  width: "100%",
                  border: "none",
                  outline: "none",
                  padding: "11px 12px",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: colors.text,
                  background: colors.panelBackground,
                }}
              />
            </div>
            {error && (
              <div style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12, color: colors.statusLeave, marginBottom: 8 }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button type="button" className="btn-outline" onClick={closeModal} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={save} disabled={!canSave || saving} style={{ flex: 1 }}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
