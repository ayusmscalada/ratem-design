"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePrototype } from "./Provider";
import { Img, NavGlyph } from "./ui";
import { TABS } from "@/lib/data";
import { JOURNAL_TABS } from "@/lib/journal";

function ReviewPanel() {
  const { edges, setEdges } = usePrototype();
  const pathname = usePathname();
  return (
    <aside className="review">
      <p className="review-eyebrow">RATEM prototype</p>
      <h1>Club Hub &amp; My Journal</h1>
      <p className="review-note">Frontend only, using sample data. These controls sit outside the app.</p>
      <h2>Screens</h2>
      <nav>
        <Link href="/club-hub" scroll={false} className={pathname === "/club-hub" ? "on" : ""}>Hub</Link>
        {TABS.map((t) => (
          <Link key={t.id} href={`/club-hub/insights/${t.id}`} scroll={false} className={pathname === `/club-hub/insights/${t.id}` ? "on" : ""}>{t.label}</Link>
        ))}
      </nav>
      <h2>My Journal</h2>
      <nav>
        <Link href="/my-journal" scroll={false} className={pathname === "/my-journal" ? "on" : ""}>Journal home</Link>
        {JOURNAL_TABS.map((t) => (
          <Link key={t.id} href={`/my-journal/${t.id}`} scroll={false} className={pathname === `/my-journal/${t.id}` ? "on" : ""}>{t.label}</Link>
        ))}
        <Link href="/my-journal/match/rated" scroll={false} className={pathname === "/my-journal/match/rated" ? "on" : ""}>Match insights (vs Inter)</Link>
        <Link href="/my-journal/match/open?reveal=1" scroll={false} className={pathname === "/my-journal/match/open" ? "on" : ""}>Rate → reveal (@ Rapid Wien)</Link>
        <Link href="/my-journal/manager?result=W" scroll={false}>Drill-down: Wins → matches</Link>
      </nav>
      <h2>Fan match insights</h2>
      <nav>
        <Link href="/club-hub/match/gladbach" scroll={false} className={pathname === "/club-hub/match/gladbach" ? "on" : ""}>Finished match (@ Gladbach)</Link>
      </nav>
      <label>
        My Journal history
        <select value={edges.journal} onChange={(e) => setEdges({ journal: e.target.value as "full" | "new" })}>
          <option value="full">Full season (13 rated)</option>
          <option value="new">New fan (2 rated)</option>
        </select>
      </label>
      <label>
        Premium previews
        <select value={edges.premium ? "on" : "off"} onChange={(e) => setEdges({ premium: e.target.value === "on" })}>
          <option value="off">Hidden (free launch)</option>
          <option value="on">Shown (how Premium is teased)</option>
        </select>
      </label>
      <label>
        Rare moments (after launch)
        <select value={edges.rare ? "on" : "off"} onChange={(e) => setEdges({ rare: e.target.value === "on" })}>
          <option value="off">Hidden (launch)</option>
          <option value="on">Shown (record card + Your records)</option>
        </select>
      </label>
      <h2>Data states</h2>
      <label>
        Match History
        <select value={edges.history} onChange={(e) => setEdges({ history: e.target.value as "ready" | "loading" | "error" })}>
          <option value="ready">Loaded</option>
          <option value="loading">Loading</option>
          <option value="error">Failed to load</option>
        </select>
      </label>
      <label>
        Season MOTM Race
        <select value={edges.raceTie ? "tie" : "lead"} onChange={(e) => setEdges({ raceTie: e.target.value === "tie" })}>
          <option value="lead">Clear leader</option>
          <option value="tie">Tie at the top</option>
        </select>
      </label>
      <label>
        Match MOTM vote (story card 6)
        <select value={edges.motmTie ? "tie" : "lead"} onChange={(e) => setEdges({ motmTie: e.target.value === "tie" })}>
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
      <h2>Account &amp; season</h2>
      <label>
        Viewer
        <select value={edges.account} onChange={(e) => setEdges({ account: e.target.value as "in" | "out" | "restricted" })}>
          <option value="in">Signed in</option>
          <option value="out">Signed out</option>
          <option value="restricted">Restricted account</option>
        </select>
      </label>
      <label>
        Follow request
        <select value={edges.followResult} onChange={(e) => setEdges({ followResult: e.target.value as "ok" | "fail" })}>
          <option value="ok">Succeeds</option>
          <option value="fail">Fails (connection)</option>
        </select>
      </label>
      <label>
        Season
        <select value={edges.season} onChange={(e) => setEdges({ season: e.target.value as "current" | "archived" })}>
          <option value="current">Current season</option>
          <option value="archived">Season ended (archived)</option>
        </select>
      </label>
      <label>
        Sample size
        <select value={edges.sample} onChange={(e) => setEdges({ sample: e.target.value as "full" | "low" })}>
          <option value="full">16 rated matches</option>
          <option value="low">Early season (3 matches)</option>
        </select>
      </label>
      <label>
        Who&apos;s Up, Who&apos;s Down
        <select value={edges.partial ? "fail" : "ok"} onChange={(e) => setEdges({ partial: e.target.value === "fail" })}>
          <option value="ok">Loaded</option>
          <option value="fail">Failed (partial load)</option>
        </select>
      </label>
      <h2>More data states</h2>
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
  const pathname = usePathname();
  const journal = pathname.startsWith("/my-journal");
  // Post-match insights are full screen: no bottom nav over the story.
  if (pathname.startsWith("/my-journal/match") || pathname.startsWith("/club-hub/match")) return null;
  return (
    <nav className="bottom-nav" aria-label="Main">
      <button onClick={() => showToast("Home isn't part of this prototype.")}>
        <span className="nav-icon"><NavGlyph name="home" /></span>
        Home
      </button>
      <Link href="/club-hub" scroll={false} aria-current={journal ? undefined : "page"}>
        <span className={`nav-icon${journal ? "" : " active"}`}><NavGlyph name="shield" /></span>
        Club Hub
      </Link>
      <Link href="/my-journal" scroll={false} aria-current={journal ? "page" : undefined}>
        <span className={`nav-icon${journal ? " active" : ""}`}><NavGlyph name="book" /></span>
        My Journal
      </Link>
    </nav>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { toast, dismissToast } = usePrototype();
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
        <div className="toast-zone" role="status" aria-live="polite">
          {toast && (
            <div className={`toast ${toast.tone ?? "info"}`} key={toast.message}>
              {toast.tone === "success" && <span className="toast-icon" aria-hidden>✓</span>}
              <span className="toast-msg">{toast.message}</span>
              {toast.action && (
                <button className="toast-action" onClick={() => { const run = toast.action!.run; dismissToast(); run(); }}>{toast.action.label}</button>
              )}
            </div>
          )}
        </div>
        <div id="sheet-root" />
      </div>
    </div>
  );
}
