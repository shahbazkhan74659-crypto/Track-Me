"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarCard, { type CalendarView, type DateEntry, entryKey } from "@/components/CalendarCard";
import ProfileBadge from "@/components/ProfileBadge";
import SalarySetupControl from "@/components/SalarySetupControl";
import StatCards, { type SummaryData } from "@/components/StatCards";
import type { CalendarCell } from "@/lib/calendar";
import { getTodayIST } from "@/lib/calendar";
import { colors } from "@/lib/theme";

export default function AttendanceApp({ username }: { username: string }) {
  const router = useRouter();
  const [view, setView] = useState<CalendarView>(() => {
    const today = getTodayIST();
    return { year: today.year, month: today.month };
  });
  const [perDaySalary, setPerDaySalary] = useState<number | null>(null);
  const [entries, setEntries] = useState<Record<string, DateEntry>>({});
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const apiFetch = useCallback(
    async (input: string, init?: RequestInit) => {
      const res = await fetch(input, init);
      if (res.status === 401) {
        router.refresh();
        throw new Error("Session expired. Please sign in again.");
      }
      return res;
    },
    [router],
  );

  const refetchEntries = useCallback(
    async (v: CalendarView) => {
      const res = await apiFetch(`/api/entries?year=${v.year}&month=${v.month}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        year: number;
        month: number;
        entries: { day: number; status: DateEntry["status"]; advanceOn: boolean; advance: number }[];
      };
      const map: Record<string, DateEntry> = {};
      for (const e of data.entries) {
        map[entryKey(data.year, data.month, e.day)] = { status: e.status, advanceOn: e.advanceOn, advance: e.advance };
      }
      setEntries(map);
    },
    [apiFetch],
  );

  const refetchSummary = useCallback(
    async (v: CalendarView) => {
      const res = await apiFetch(`/api/summary?year=${v.year}&month=${v.month}`);
      if (!res.ok) return;
      setSummary((await res.json()) as SummaryData);
    },
    [apiFetch],
  );

  useEffect(() => {
    apiFetch("/api/salary").then(async (res) => {
      if (!res.ok) return;
      const data = (await res.json()) as { perDaySalary: number | null };
      setPerDaySalary(data.perDaySalary);
    });
    // Deliberately not calling GET /api/calendar — the grid is already computed
    // correctly and Asia/Kolkata-safe client-side via lib/calendar.ts; that
    // route would just fetch the same shape over the network for no benefit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Plain fetch-on-dependency-change, per this project's stack lock (no
    // SWR/React Query) — the linter's preferred alternatives don't apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchEntries(view);
    refetchSummary(view);
  }, [view, refetchEntries, refetchSummary]);

  const handleSaveSalary = async (rate: number) => {
    const res = await apiFetch("/api/salary", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perDaySalary: rate }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Failed to save.");
    }
    const data = (await res.json()) as { perDaySalary: number };
    setPerDaySalary(data.perDaySalary);
    await refetchSummary(view);
  };

  const handleSaveEntry = async (cell: CalendarCell, entry: DateEntry) => {
    const res = await apiFetch("/api/entries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: cell.year, month: cell.month, day: cell.day, ...entry }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Failed to save.");
    }
    await Promise.all([refetchEntries(view), refetchSummary(view)]);
  };

  const handleClearEntry = async (cell: CalendarCell) => {
    const res = await apiFetch("/api/entries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: cell.year, month: cell.month, day: cell.day }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Failed to clear.");
    }
    await Promise.all([refetchEntries(view), refetchSummary(view)]);
  };

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <ProfileBadge username={username} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <SalarySetupControl perDaySalary={perDaySalary} onSave={handleSaveSalary} />
          <span
            className="today-link"
            onClick={handleLogout}
            style={{ fontFamily: "var(--font-work-sans), sans-serif", fontSize: 12.5, color: colors.textMuted }}
          >
            Log out
          </span>
        </div>
      </div>
      <StatCards summary={summary} />
      <CalendarCard
        view={view}
        onViewChange={setView}
        entries={entries}
        onSaveEntry={handleSaveEntry}
        onClearEntry={handleClearEntry}
      />
    </div>
  );
}
