"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CLUB, DIVISIVE, FAN_MEDIAN, FAN_MOOD, MANAGER, MANAGER_SEASON, SEASON, SHIFTS, SQUAD, TEAM_SEASON, UPDATED, type Fixture, type Rating } from "@/lib/data";
import { MatchCard, result, type RatingsSheet } from "./MatchCard";
import { matchesFilter, usePrototype, type HistoryFilter } from "./Provider";
import { FilterSheet } from "./FilterSheet";
import { useRace } from "./Insights";
import { Delta, Img, Kit, Photo, RatingPill, Sheet, TeamLogo } from "./ui";

function HubHeader() {
  const { showToast } = usePrototype();
  const outside = () => showToast("This action is outside the Club Hub prototype.");
  return (
    <header className="hub-header">
      <Photo className="hub-photo" src="/photos/stadium-night.jpg" priority />
      <div className="hub-bar">
        <div className="hub-title"><Img src="shield.svg" w={18.5} h={22} /><span>Club Hub</span></div>
        <button className="view-btn" onClick={outside}>View<Img src="chevron-view.svg" w={10} h={5} /></button>
        <div className="hub-actions">
          <button aria-label="Share" onClick={outside}><Img src="share.svg" size={17.8} /></button>
          <button aria-label="Notifications" onClick={outside}><Img src="bell.svg" size={17.8} /></button>
          <button aria-label="Search" onClick={outside}><Img src="search.svg" size={17.8} /></button>
        </div>
      </div>
      <div className="club-row">
        <span className="club-avatar">
          <Img src="logo-sturm.png" size={42} />
          <span className="club-user"><Img src="avatar-user.png" size={19.5} /></span>
        </span>
        <div className="club-id">
          <strong>{CLUB}</strong>
          <span>Season {SEASON}</span>
        </div>
      </div>
      <div className="club-strip">
        <div className="form-guide" aria-label={`Last ${FAN_MOOD.length} results: ${FAN_MOOD.map((f) => f.result).join(", ")}`}>
          <span>Form</span>
          {FAN_MOOD.map((f) => <em key={f.date} className={`res ${f.result}`} title={`${f.venue} ${f.opp} ${f.score}, ${f.date}`}>{f.result}</em>)}
        </div>
        <span className="updated"><i aria-hidden />{UPDATED.label}, {UPDATED.date}</span>
      </div>
    </header>
  );
}

/** Featured story: the one hero module on the hub. */
function RaceHero() {
  const race = useRace();
  const leaders = race.filter((p) => p.rank === 1);
  const tie = leaders.length > 1;
  const chaser = race.find((p) => p.rank > 1)!;
  const leader = race[0];
  const gap = leader.awards - chaser.awards;
  const mover = race.find((p) => p.move > 0);

  return (
    <section className="race-hero" aria-labelledby="race-hero-title">
      <Photo className="rh-photo" src="/photos/floodlight.jpg" />
      <div className="rh-glow" aria-hidden />
      <p className="rh-eyebrow"><Crown />Season MOTM Race · {SEASON}</p>
      <div className="rh-main">
        <div className="rh-kits" aria-hidden>
          {leaders.slice(0, 2).map((p, i) => <span key={p.name} className={`rh-kit k${i}`}><Kit no={p.no} size={tie ? 62 : 84} keeper={p.pos === "GK"} /></span>)}
        </div>
        <div className="rh-copy">
          <h2 id="race-hero-title">{tie ? `${leaders.map((p) => p.short).join(" & ")}` : leader.short}</h2>
          <p className="rh-stat"><strong className="num">{leader.awards}</strong><span>fan MOTM<br />awards{tie ? " each" : ""}</span></p>
        </div>
      </div>
      <div className="rh-chase">
        {tie ? (
          <span>Level at the top. Next fixture can break the tie.</span>
        ) : (
          <>
            <Kit no={chaser.no} size={26} keeper={chaser.pos === "GK"} />
            <span><b>{chaser.short}</b> <span className="num">{chaser.awards}</span></span>
            <span className="rh-gap"><b className="num">{gap}</b> behind</span>
          </>
        )}
      </div>
      {mover && !tie && <p className="rh-move">▲ {mover.short} moved up to {race.find((p) => p.name === mover.name)!.rank === 2 ? "2nd" : `#${mover.rank}`} {UPDATED.label.replace("Updated ", "")}</p>}
      <Link href="/club-hub/insights/race" scroll={false} className="rh-cta">View full race<Img src="chevron-right.svg" size={16} /></Link>
    </section>
  );
}

function Crown() {
  return (
    <svg width="16" height="11" viewBox="0 0 40 28" aria-hidden>
      <path d="M3 8 12 16 20 3 28 16 37 8 34 26H6Z" fill="#ffd34d" />
    </svg>
  );
}

/** Story rail: one tile per insight, each with its own headline number. */
function InsightRail() {
  const latest = FAN_MOOD[FAN_MOOD.length - 1];
  const shift = [...SHIFTS].sort((a, b) => Math.abs(b.recent - b.season) - Math.abs(a.recent - a.season))[0];
  const tiles = [
    { href: "fan-mood#mood", accent: "green", label: "Fanbase Mood", big: latest.value.toFixed(1), line: <><Delta value={latest.value - FAN_MEDIAN} /> vs fans&apos; median</>, fresh: true },
    { href: "fan-mood#shift", accent: "violet", label: "Confidence Shift", big: <Delta value={shift.recent - shift.season} />, line: <>{shift.short}, last 5 vs season</>, fresh: true },
    { href: "fan-mood#divisive", accent: "coral", label: "Most Divisive", big: <span className="tile-name">{DIVISIVE.short.replace("-", "-​")}</span>, line: <>{DIVISIVE.bands[3].share}% gave 8–10, {DIVISIVE.bands[0].share}% gave 1–3</> },
    { href: "manager#mvt", accent: "blue", label: "Manager vs Team", big: <>{MANAGER_SEASON.toFixed(1)}<small> / {TEAM_SEASON.toFixed(1)}</small></>, line: <>Manager <Delta value={MANAGER_SEASON - TEAM_SEASON} /> vs team</> },
    { href: "matches#extremes", accent: "gold", label: "Best-rated match", big: "8.4", line: <>vs Man City, 4–1 · 12 Jan</> },
  ];
  return (
    <section aria-labelledby="rail-title">
      <div className="section-head">
        <h2 id="rail-title">Insights</h2>
        <Link href="/club-hub/insights/fan-mood" scroll={false}>See all<Img src="arrow-up-right.svg" size={15} /></Link>
      </div>
      <ul className="rail">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={`/club-hub/insights/${t.href}`} scroll={false} className={`tile accent-${t.accent}`}>
              <span className="tile-label">{t.fresh && <span className="new-dot">New</span>}{t.label}</span>
              <strong className="tile-big num">{t.big}</strong>
              <span className="tile-line">{t.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** You vs Fans: the same question answered from both sides, side by side. */
function YouVsFans({ openRatings }: { openRatings: (s: RatingsSheet) => void }) {
  const by = (k: "you" | "fan") => [...SQUAD].sort((a, b) => b[k] - a[k]);
  const you = by("you");
  const fan = by("fan");
  const cell = (r: Rating, k: "you" | "fan", mode: "top" | "lowest") => (
    <button className={`yvf-cell ${k}`} onClick={() => openRatings({ mode, scope: "season", who: k })} aria-label={`${k === "you" ? "Your" : "Fans'"} ${mode === "top" ? "top" : "lowest"} rated: ${r.name}, ${r[k].toFixed(1)}. See list`}>
      <span>{r.name.split(" ").slice(-1)[0].split("-").pop()}</span>
      <b className="num">{r[k].toFixed(1)}</b>
    </button>
  );
  return (
    <section className="yvf" aria-labelledby="yvf-title">
      <div className="yvf-head">
        <h2 id="yvf-title">You vs Fans</h2>
        <span>Season average rating</span>
      </div>
      <div className="yvf-grid">
        <span />
        <span className="pulse-tag"><i className="you" />You</span>
        <span className="pulse-tag"><i className="fan" />Fans</span>
        <span className="yvf-label">Top</span>
        {cell(you[0], "you", "top")}
        {cell(fan[0], "fan", "top")}
        <span className="yvf-label">Lowest</span>
        {cell(you[you.length - 1], "you", "lowest")}
        {cell(fan[fan.length - 1], "fan", "lowest")}
      </div>
    </section>
  );
}

/** The fan's to-do (an open rating), then the club's recent history. */
function MatchCentre({ focus }: { focus: (id: string) => void }) {
  const { fixtures, rateFixture } = usePrototype();
  const task = fixtures.find((f) => f.status === "open");

  return (
    <section className="centre" aria-labelledby="centre-title">
      <h2 id="centre-title" className="sr-only">Match centre</h2>
      {task ? (
        <div className="task">
          <div className="task-head">
            <span className="badge open">Rating open</span>
            <span className="task-clock">Closes in <b className="num">{task.remaining}</b></span>
          </div>
          <div className="task-score">
            <span className="ts-side"><TeamLogo name={task.home} size={36} /><span className="ts-team">{task.home}</span></span>
            <strong className="num">{task.homeScore}–{task.awayScore}</strong>
            <span className="ts-side"><TeamLogo name={task.away} size={36} /><span className="ts-team">{task.away}</span></span>
          </div>
          <p className="task-meta">{task.competition} · {task.dateLabel} · {task.fans} fans have rated so far</p>
          <button className="btn primary block" onClick={() => rateFixture(task.id)}>Rate this match</button>
        </div>
      ) : (
        <div className="task done">
          <span className="task-ok" aria-hidden>✓</span>
          <div>
            <strong>You&apos;re up to date</strong>
            <span>You&apos;ve rated every match that&apos;s open. The next rating opens at full time of the next match.</span>
          </div>
        </div>
      )}
      <RecentResults focus={focus} skip={task?.id} />
    </section>
  );
}

const FINISHED = new Set(["rated", "closed", "open"]);

/**
 * Club history first (client feedback, 3 Nov): the Overview looks back, not ahead.
 * Shows the latest finished matches with fan and user ratings. Live and upcoming
 * fixtures stay out of the Overview so RATEM doesn't read like a live-scores app.
 */
function RecentResults({ focus, skip }: { focus: (id: string) => void; skip?: string }) {
  const { fixtures } = usePrototype();
  const recent = fixtures
    .filter((f) => FINISHED.has(f.status) && f.homeScore !== null && f.id !== skip)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  if (!recent.length) return null;
  const opp = (f: Fixture) => (f.home === CLUB ? f.away : f.home);
  const at = (f: Fixture) => (f.home === CLUB ? "vs" : "@");
  const us = (f: Fixture) => `${f.homeScore}–${f.awayScore}`;
  const word = { W: "Win", D: "Draw", L: "Loss" } as const;

  return (
    <div className="recent">
      <div className="recent-head">
        <h3 id="recent-title">Recent results</h3>
        <a href="#sec-fixtures">All results<Img src="chevron-right.svg" size={12} /></a>
      </div>
      <ul className="recent-list">
        {recent.map((f) => {
          const r = result(f);
          return (
            <li key={f.id}>
              <button
                className="recent-row"
                onClick={() => focus(f.id)}
                aria-label={`${r ? word[r] : ""} ${at(f)} ${opp(f)}, ${us(f)}, ${f.dateLabel}.${f.fanRating ? ` Fans ${f.fanRating.toFixed(1)}.` : ""}${f.youRating ? ` You ${f.youRating.toFixed(1)}.` : ""} Show in fixtures`}
              >
                {r && <em className={`res ${r}`} aria-hidden>{r}</em>}
                <span className="rr-match">
                  <TeamLogo name={opp(f)} size={20} />
                  <span className="rr-text">
                    <b>{at(f)} {opp(f)}</b>
                    <small>{f.dateLabel} · {f.competition}</small>
                  </span>
                </span>
                <strong className="num rr-score">{us(f)}</strong>
                <span className="rr-pills">
                  {f.youRating !== undefined && <RatingPill kind="you" value={f.youRating} />}
                  {f.fanRating !== undefined && <RatingPill kind="fan" value={f.fanRating} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const SECTIONS = [
  { id: "sec-overview", label: "Overview" },
  { id: "sec-insights", label: "Insights" },
  { id: "sec-ratings", label: "Ratings" },
  { id: "sec-fixtures", label: "Fixtures" },
];

/** In-page navigation for the hub's sections, with the current one marked. */
function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  useEffect(() => {
    const root = document.querySelector(".screen");
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
      const first = SECTIONS.find((s) => seen.get(s.id));
      if (first) setActive(first.id);
    }, { root, rootMargin: "-110px 0px -55% 0px" });
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="section-nav" aria-label="Club Hub sections">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined} className={active === s.id ? "on" : ""}
          onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setActive(s.id); }}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}

function RatingRow({ r, rank, manager }: { r: Rating; rank?: number; manager?: boolean }) {
  return (
    <div className="rating-row" role="row">
      {rank && <span className="rating-rank num">{rank}</span>}
      {manager ? (
        <span className="coach-badge" aria-hidden><Img src="tie.svg" w={10} h={24} /></span>
      ) : (
        <Kit no={r.no} size={44} keeper={r.pos === "GK"} />
      )}
      <div className="rating-who" role="rowheader">
        <strong>{r.name}</strong>
        {manager ? (
          <small>Manager</small>
        ) : (
          <span className="motm-counts">
            <small className="pos">{r.pos}</small>
            <span className="count you" aria-label={`Your MOTM picks: ${r.youMotm}`}><Img src="cup-you.svg" size={12} />{r.youMotm}</span>
            <span className="count fan" aria-label={`Fan MOTM awards: ${r.fanMotm}`}><Img src="cup-fan.svg" size={12} />{r.fanMotm}</span>
          </span>
        )}
      </div>
      <span role="cell"><RatingPill kind="you" value={r.you} /></span>
      <span role="cell"><RatingPill kind="fan" value={r.fan} /></span>
    </div>
  );
}

function RatingsHead() {
  return (
    <div className="rating-head" role="row">
      <span role="columnheader">Player <i aria-hidden>·</i> <Img src="cup-white.svg" size={11} /> MOTM picks</span>
      <span role="columnheader">You</span>
      <span role="columnheader">Fans</span>
    </div>
  );
}

function RatingsBottomSheet({ sheet, onClose }: { sheet: RatingsSheet | null; onClose: () => void }) {
  const who = sheet?.who ?? "fan";
  const sorted = useMemo(() => [...SQUAD].sort((a, b) => b[who] - a[who]), [who]);
  const scope = sheet?.scope === "match" ? `${sheet.title}, this match` : `Season fan ranking, ${CLUB} 2025/26`;
  const heading = sheet?.mode === "top" ? "Top rated players" : sheet?.mode === "lowest" ? "Lowest rated players" : "Ratings";
  const picks = sheet?.mode === "top" ? sorted.slice(0, 3) : sheet?.mode === "lowest" ? sorted.slice(-3).reverse() : [];
  const whoLabel = who === "you" ? "You" : "Fans";

  return (
    <Sheet open={Boolean(sheet)} onClose={onClose} label={heading}>
      <div className="sheet-header">
        <div>
          <h2>{heading}</h2>
          <p>{scope}</p>
        </div>
        {sheet?.mode !== "all" && <span className="pulse-tag"><i className={who} />{whoLabel}</span>}
        <button aria-label="Close" onClick={onClose}><Img src="close.svg" size={24} /></button>
      </div>
      {sheet?.mode === "all" ? (
        <div className="sheet-list">
          <RatingRow r={MANAGER} manager />
          {sorted.map((r, i) => <RatingRow key={r.name} r={r} rank={i + 1} />)}
        </div>
      ) : (
        <div className="sheet-list">
          {picks.map((r) => (
            <div className="sheet-pick" key={r.name}>
              <Kit no={r.no} size={32} keeper={r.pos === "GK"} />
              <span>{r.name}<small>{r.pos}</small></span>
              <RatingPill kind={who} value={r[who]} />
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

const FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rated", label: "Rated by you" },
  { id: "unrated", label: "Not rated by you" },
];

const fmt = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function FixtureSkeleton() {
  return (
    <div className="fixture skeleton-card" aria-hidden>
      <div className="skeleton"><span /><span /><span /></div>
    </div>
  );
}

export function ClubHub() {
  const { fixtures, filter, setFilter, range, setRange, focusFixture, setFocusFixture, edges, setEdges } = usePrototype();
  const [sheet, setSheet] = useState<RatingsSheet | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const closeSheet = useMemo(() => () => setSheet(null), []);

  const visible = fixtures.filter((f) => matchesFilter(f, filter, range));
  const filtered = filter !== "all" || Boolean(range);
  const clearFilters = () => { setFilter("all"); setRange(null); };

  useEffect(() => {
    if (!focusFixture) return;
    document.getElementById(`fixture-${focusFixture}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
    const clear = setTimeout(() => setFocusFixture(null), 2200);
    return () => clearTimeout(clear);
  }, [focusFixture, setFocusFixture]);

  /** Jump to a fixture from the match centre, showing it even if a filter would hide it. */
  const focus = (id: string) => {
    if (!visible.some((f) => f.id === id)) clearFilters();
    setFocusFixture(id);
  };

  return (
    <div className="hub page-in">
      <HubHeader />
      <SectionNav />
      <div className="hub-content">
        <div id="sec-overview" className="hub-section">
          <MatchCentre focus={focus} />
          <RaceHero />
        </div>
        <div id="sec-insights" className="hub-section">
          <InsightRail />
          <YouVsFans openRatings={setSheet} />
        </div>

        <section id="sec-ratings" className="hub-section" aria-labelledby="ratings-title">
          <div className="section-head">
            <div>
              <h2 id="ratings-title">Ratings</h2>
              <p className="section-sub">Season average rating · {SEASON}</p>
            </div>
            <button onClick={() => setSheet({ mode: "all", scope: "season" })}>All players<Img src="arrow-up-right.svg" size={15} /></button>
          </div>
          <div className="rating-list" role="table" aria-label="Season average ratings, you and fans">
            <RatingsHead />
            <RatingRow r={MANAGER} manager />
            <RatingRow r={SQUAD[0]} />
            <RatingRow r={SQUAD[1]} />
          </div>
        </section>

        <section id="sec-fixtures" className="hub-section" aria-labelledby="fixtures-title">
          <div className="history-head">
            <h2 id="fixtures-title">Fixtures &amp; results</h2>
            <div className="filter-row" role="group" aria-label="Filter fixtures">
              {FILTERS.map((f) => (
                <button key={f.id} aria-pressed={filter === f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>{f.label}</button>
              ))}
              <button className={range ? "on" : ""} aria-pressed={Boolean(range)} onClick={() => setFilterOpen(true)}>
                {range ? `${fmt(range.from)}${range.to !== range.from ? ` – ${fmt(range.to)}` : ""}` : "Dates"}
              </button>
            </div>
            {edges.history === "ready" && (
              <p className="result-count" aria-live="polite">
                {visible.length} {visible.length === 1 ? "match" : "matches"}
                {filtered && <> · <button className="link" onClick={clearFilters}>Clear filters</button></>}
              </p>
            )}
          </div>

          <div className="fixture-list" aria-busy={edges.history === "loading"}>
            {edges.history === "loading" && <><FixtureSkeleton /><FixtureSkeleton /></>}
            {edges.history === "error" && (
              <div className="state-panel error" role="alert">
                <strong>Couldn&apos;t load fixtures</strong>
                <span>Check your connection, then try again. Your filters are kept.</span>
                <button className="btn secondary" onClick={() => setEdges({ history: "ready" })}>Retry</button>
              </div>
            )}
            {edges.history === "ready" && visible.map((f) => <MatchCard key={f.id} fixture={f} focused={focusFixture === f.id} openRatings={setSheet} />)}
            {edges.history === "ready" && visible.length === 0 && (
              <div className="state-panel">
                <strong>No matches fit these filters</strong>
                <span>{range ? "Try a wider date range, or show every match." : "Show every match to see the whole season."}</span>
                <button className="btn secondary" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </div>
        </section>
      </div>

      <RatingsBottomSheet sheet={sheet} onClose={closeSheet} />
      {/* Remounts on open so the sheet always starts from the filters in use. */}
      <FilterSheet key={filterOpen ? "open" : "closed"} open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}
