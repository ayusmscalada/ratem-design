"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { FIXTURES, type EdgeStates, type Fixture } from "@/lib/data";

export type DateRange = { from: string; to: string } | null;
export type HistoryFilter = "all" | "rated" | "unrated";
export type Toast = { message: string; tone?: "success" | "info"; action?: { label: string; run: () => void } };

type Ctx = {
  fixtures: Fixture[];
  rateFixture: (id: string) => void;
  filter: HistoryFilter;
  setFilter: (f: HistoryFilter) => void;
  range: DateRange;
  setRange: (r: DateRange) => void;
  edges: EdgeStates;
  setEdges: (e: Partial<EdgeStates>) => void;
  /** Per-card player filter. Kept for this session only, so a fresh visit starts on "All". */
  playerFilter: Record<string, string>;
  setPlayerFilter: (card: string, player: string) => void;
  focusFixture: string | null;
  setFocusFixture: (id: string | null) => void;
  toast: Toast | null;
  showToast: (toast: string | Toast) => void;
  dismissToast: () => void;
};

const PrototypeContext = createContext<Ctx | null>(null);

export function usePrototype() {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype must be used inside Provider");
  return ctx;
}

export function Provider({ children }: { children: ReactNode }) {
  const [fixtures, setFixtures] = useState(FIXTURES);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [range, setRange] = useState<DateRange>(null);
  const [edges, setEdgeState] = useState<EdgeStates>({ raceTie: false, mood: "normal", history: "ready", managerGap: "gap", managerTrend: "many", draws: true });
  const [playerFilter, setFilters] = useState<Record<string, string>>({});
  const setPlayerFilter = useCallback((card: string, player: string) => setFilters((f) => ({ ...f, [card]: player })), []);
  const [focusFixture, setFocusFixture] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((next: string | Toast) => {
    const t = typeof next === "string" ? { message: next } : next;
    setToast(t);
    if (timer.current) clearTimeout(timer.current);
    // Toasts with an action stay long enough to reach the button.
    timer.current = setTimeout(() => setToast(null), t.action ? 6000 : 2800);
  }, []);

  const rateFixture = useCallback(
    (id: string) => {
      let before: Fixture | undefined;
      setFixtures((all) => all.map((f) => {
        if (f.id !== id) return f;
        before = f;
        return { ...f, status: "rated", youRating: 7.8 };
      }));
      showToast({
        tone: "success",
        message: "Rating saved. (Rating screens are Phase 1, so this step is simulated.)",
        action: {
          label: "Undo",
          run: () => {
            if (before) setFixtures((all) => all.map((f) => (f.id === id ? before! : f)));
            showToast("Rating removed. The window is still open.");
          },
        },
      });
    },
    [showToast],
  );

  const setEdges = useCallback((next: Partial<EdgeStates>) => setEdgeState((e) => ({ ...e, ...next })), []);

  const value = useMemo(
    () => ({ fixtures, rateFixture, filter, setFilter, range, setRange, edges, setEdges, playerFilter, setPlayerFilter, focusFixture, setFocusFixture, toast, showToast, dismissToast }),
    [fixtures, rateFixture, filter, range, edges, setEdges, playerFilter, setPlayerFilter, focusFixture, toast, showToast, dismissToast],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

/** The one definition of the fixtures filter, shared by the list and the filter sheet. */
export function matchesFilter(f: Fixture, filter: HistoryFilter, range: DateRange) {
  if (filter === "rated" && f.status !== "rated") return false;
  if (filter === "unrated" && f.status !== "open" && f.status !== "closed") return false;
  return !range || (f.date >= range.from && f.date <= range.to);
}
