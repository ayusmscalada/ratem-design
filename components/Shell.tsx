"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePrototype } from "./Provider";
import { Img } from "./ui";
import { TABS } from "@/lib/data";

function ReviewPanel() {
  const { edges, setEdges } = usePrototype();
  const pathname = usePathname();
  return (
    <aside className="review">
      <p className="review-eyebrow">RATEM prototype</p>
      <h1>Club Hub</h1>
      <p className="review-note">Frontend only, using sample data. These controls sit outside the app.</p>
      <h2>Screens</h2>
      <nav>
        <Link href="/club-hub" scroll={false} className={pathname === "/club-hub" ? "on" : ""}>Hub</Link>
        {TABS.map((t) => (
          <Link key={t.id} href={`/club-hub/insights/${t.id}`} scroll={false} className={pathname.endsWith(t.id) ? "on" : ""}>{t.label}</Link>
        ))}
      </nav>
      <h2>Data states</h2>
      <label>
        Season MOTM Race
        <select value={edges.raceTie ? "tie" : "lead"} onChange={(e) => setEdges({ raceTie: e.target.value === "tie" })}>
          <option value="lead">Clear leader</option>
          <option value="tie">Tie at the top</option>
        </select>
      </label>
      <label>
        Fanbase Mood
        <select value={edges.mood} onChange={(e) => setEdges({ mood: e.target.value as "normal" | "none" })}>
          <option value="normal">Rated fixtures</option>
          <option value="none">No fixtures yet</option>
        </select>
      </label>
      <label>
        Fan Manager Rating
        <select value={edges.managerGap} onChange={(e) => setEdges({ managerGap: e.target.value as "gap" | "equal" })}>
          <option value="gap">Home and away differ</option>
          <option value="equal">Home and away equal</option>
        </select>
      </label>
      <label>
        Manager Rating Trend
        <select value={edges.managerTrend} onChange={(e) => setEdges({ managerTrend: e.target.value as "many" | "one" | "none" })}>
          <option value="many">Five fixtures</option>
          <option value="one">One fixture</option>
          <option value="none">No fixtures</option>
        </select>
      </label>
      <label>
        Team Rating by Result
        <select value={edges.draws ? "yes" : "no"} onChange={(e) => setEdges({ draws: e.target.value === "yes" })}>
          <option value="yes">Season has draws</option>
          <option value="no">Season has no draws</option>
        </select>
      </label>
    </aside>
  );
}

function BottomNav() {
  const { showToast } = usePrototype();
  const soon = () => showToast("Home and My Journal aren't part of this Club Hub prototype.");
  return (
    <nav className="bottom-nav" aria-label="Main">
      <button onClick={soon}>
        <span className="nav-icon"><span className="mask mask-home" /></span>
        Home
      </button>
      <Link href="/club-hub" scroll={false} aria-current="page">
        <span className="nav-icon active"><span className="mask mask-shield" /></span>
        Club Hub
      </Link>
      <button onClick={soon}>
        <span className="nav-icon"><Img src="nav-book.svg" size={24} /></span>
        My Journal
      </button>
    </nav>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { toast } = usePrototype();
  const scroller = useRef<HTMLDivElement>(null);
  const offsets = useRef<Record<string, number>>({});

  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollTop = offsets.current[pathname] ?? 0;
  }, [pathname]);

  return (
    <div className="stage">
      <ReviewPanel />
      <div className="phone">
        <div className="status-bar" aria-hidden>
          <Img src="status-time.svg" w={33} h={13} />
          <Img src="status-right.svg" w={71} h={13} />
        </div>
        <div
          className="screen"
          ref={scroller}
          onScroll={(e) => {
            offsets.current[pathname] = e.currentTarget.scrollTop;
          }}
        >
          {children}
        </div>
        <BottomNav />
        {toast && <div className="toast" role="status">{toast}</div>}
        <div id="sheet-root" />
      </div>
    </div>
  );
}
