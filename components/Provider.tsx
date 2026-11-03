"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { FIXTURES, type EdgeStates, type Fixture } from "@/lib/data";

export type DateRange = { from: string; to: string } | null;
export type HistoryFilter = "all" | "rated" | "unrated";

type Ctx = {
  fixtures: Fixture[];
  rateFixture: (id: string) => void;
  filter: HistoryFilter;
  setFilter: (f: HistoryFilter) => void;
  range: DateRange;
  setRange: (r: DateRange) => void;
  edges: EdgeStates;
  setEdges: (e: Partial<EdgeStates>) => void;
  focusFixture: string | null;
  setFocusFixture: (id: string | null) => void;
  toast: string | null;
  showToast: (message: string) => void;
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
  const [edges, setEdgeState] = useState<EdgeStates>({ managerGap: "gap", managerTrend: "many", draws: true });
  const [focusFixture, setFocusFixture] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const rateFixture = useCallback(
    (id: string) => {
      setFixtures((all) => all.map((f) => (f.id === id ? { ...f, status: "rated", youRating: 7.8, remaining: undefined } : f)));
      showToast("Rating saved. The rating screens are part of Phase 1, so this step is simulated.");
    },
    [showToast],
  );

  const setEdges = useCallback((next: Partial<EdgeStates>) => setEdgeState((e) => ({ ...e, ...next })), []);

  const value = useMemo(
    () => ({ fixtures, rateFixture, filter, setFilter, range, setRange, edges, setEdges, focusFixture, setFocusFixture, toast, showToast }),
    [fixtures, rateFixture, filter, range, edges, setEdges, focusFixture, toast, showToast],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}
