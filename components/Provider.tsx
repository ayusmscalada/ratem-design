"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CLUB, FIXTURES, type EdgeStates, type Fixture, type FollowState } from "@/lib/data";

export type DateRange = { from: string; to: string } | null;
/** Fan-focused filters only: Club Hub never filters by what the user did. */
export type HistoryFilter = "all" | "Bundesliga" | "Champions League";
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
  follow: FollowState;
  toggleFollow: () => void;
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
  const [edges, setEdgeState] = useState<EdgeStates>({ raceTie: false, mood: "normal", history: "ready", managerGap: "gap", managerTrend: "many", draws: true, account: "in", followResult: "ok", season: "current", sample: "full", partial: false, journal: "full", premium: false });
  const [follow, setFollow] = useState<FollowState>("not_following");
  const followTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Review links: any state can be opened straight from the URL, e.g. ?account=out&season=archived&follow=following.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const next: Partial<EdgeStates> = {};
    const pick = <K extends keyof EdgeStates>(key: K, allowed: string[]) => {
      const v = q.get(key);
      if (v && allowed.includes(v)) (next as Record<string, unknown>)[key] = v;
    };
    pick("account", ["in", "out", "restricted"]);
    pick("followResult", ["ok", "fail"]);
    pick("season", ["current", "archived"]);
    pick("sample", ["full", "low"]);
    if (q.get("partial") === "1") next.partial = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of the review link on load
    if (q.get("rated") === "open") setFixtures((all) => all.map((f) => (f.id === "open" ? { ...f, youRated: true } : f)));
    pick("journal", ["full", "new"]);
    if (q.get("premium") === "1") next.premium = true;
    if (Object.keys(next).length) setEdgeState((e) => ({ ...e, ...next }));
    const fol = q.get("follow");
    if (fol === "following" || fol === "pending_follow" || fol === "pending_unfollow") setFollow(fol);
  }, []);
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
        // The window stays open; rating reveals the fans' verdict for this match.
        return { ...f, youRated: true };
      }));
      showToast({
        tone: "success",
        message: "Rating saved. Your match insights are in My Journal. (Rating screens are Phase 1, so this step is simulated.)",
        action: {
          label: "Undo",
          run: () => {
            if (before) setFixtures((all) => all.map((f) => (f.id === id ? before! : f)));
            showToast("Rating removed.");
          },
        },
      });
    },
    [showToast],
  );

  const setEdges = useCallback((next: Partial<EdgeStates>) => setEdgeState((e) => ({ ...e, ...next })), []);

  /**
   * Follow / Unfollow with a pending step and a real failure path. Signed-out and restricted
   * accounts never reach the request: they get the reason instead.
   */
  const toggleFollow = useCallback(() => {
    if (follow === "pending_follow" || follow === "pending_unfollow") return;
    if (edges.account === "out") {
      showToast({ message: `Sign in to follow ${CLUB}.`, action: { label: "Sign in", run: () => showToast("Sign-in is outside this prototype.") } });
      return;
    }
    if (edges.account === "restricted") {
      showToast("Following isn't available for this account.");
      return;
    }
    const wasFollowing = follow === "following";
    setFollow(wasFollowing ? "pending_unfollow" : "pending_follow");
    if (followTimer.current) clearTimeout(followTimer.current);
    followTimer.current = setTimeout(() => {
      if (edges.followResult === "fail") {
        setFollow(wasFollowing ? "following" : "not_following");
        showToast({ message: `Couldn't ${wasFollowing ? "unfollow" : "follow"} ${CLUB}. Check your connection and try again.`, action: { label: "Retry", run: () => setEdges({ followResult: "ok" }) } });
        return;
      }
      setFollow(wasFollowing ? "not_following" : "following");
      showToast(wasFollowing
        ? { message: `You've unfollowed ${CLUB}.`, action: { label: "Undo", run: () => setFollow("following") } }
        : { tone: "success", message: `You're following ${CLUB}.` });
    }, 900);
  }, [follow, edges.account, edges.followResult, showToast, setEdges]);


  const value = useMemo(
    () => ({ fixtures, rateFixture, filter, setFilter, range, setRange, edges, setEdges, playerFilter, setPlayerFilter, focusFixture, setFocusFixture, follow, toggleFollow, toast, showToast, dismissToast }),
    [fixtures, rateFixture, filter, range, edges, setEdges, playerFilter, setPlayerFilter, focusFixture, follow, toggleFollow, toast, showToast, dismissToast],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

/** The one definition of the fixtures filter, shared by the list and the filter sheet. */
export function matchesFilter(f: Fixture, filter: HistoryFilter, range: DateRange) {
  if (filter !== "all" && f.competition !== filter) return false;
  return !range || (f.date >= range.from && f.date <= range.to);
}
