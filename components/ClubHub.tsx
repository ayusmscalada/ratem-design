"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CLUB, DIVISIVE, LOW_SAMPLE_MATCHES, FAN_MEDIAN, FAN_MOOD, MANAGER, MANAGER_SEASON, SEASON, SHIFTS, SQUAD, TEAM_SEASON, UPDATED, nextUpdate, type Fixture, type Rating } from "@/lib/data";
import { MatchCard, type RatingsSheet } from "./MatchCard";
import { matchesFilter, usePrototype, type HistoryFilter } from "./Provider";
import { FilterSheet } from "./FilterSheet";
import { useRace } from "./Insights";
import { Delta, Img, Kit, Photo, RatingPill, Sheet, TeamLogo } from "./ui";

/*
 * Club Hub = the fanbase. My Journal = the user. (Client rule, 4 Nov.)
 * Nothing on this screen shows the user's own ratings, picks or comparisons, and
 * nothing uses the personal green. Rating numbers use fan yellow.
 */

/**
 * Follow (handbook P1): not following → pending → following → pending → not following, plus a
 * failure that rolls back, signed out (asks to sign in) and restricted (explains why). The label
 * never promises notifications.
 */
function FollowButton() {
  const { follow, toggleFollow, edges } = usePrototype();
  const pending = follow === "pending_follow" || follow === "pending_unfollow";
  const on = follow === "following" || follow === "pending_unfollow";
  const restricted = edges.account === "restricted";
  const label = follow === "pending_follow" ? "Following…" : follow === "pending_unfollow" ? "Unfollowing…" : on ? "Following" : "Follow";
  return (
    <button className={`follow-btn${on ? " on" : ""}${pending ? " pending" : ""}${restricted ? " restricted" : ""}`}
      onClick={toggleFollow} aria-pressed={on} aria-busy={pending} aria-disabled={pending || restricted}
      aria-label={restricted ? `Follow ${CLUB}: not available for this account` : on ? `Following ${CLUB}. Tap to unfollow` : `Follow ${CLUB}`}>
      {pending ? <i className="follow-spin" aria-hidden /> : on ? <span aria-hidden>✓</span> : <span aria-hidden>+</span>}
      {label}
    </button>
  );
}

function HubHeader() {
  const { showToast, fixtures, edges } = usePrototype();
  const archived = edges.season === "archived";
  const next = archived ? null : nextUpdate(fixtures);
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
        </span>
        <div className="club-id">
          <strong>{CLUB}</strong>
          <span>Season {SEASON} · {archived ? "final" : "the fanbase"}</span>
        </div>
        <FollowButton />
      </div>
      {edges.account === "restricted" && <p className="follow-note">Following isn&apos;t available for this account. Everything in Club Hub stays visible.</p>}
      <div className="club-strip">
        <div className="form-guide" aria-label={`Last ${FAN_MOOD.length} results: ${FAN_MOOD.map((f) => f.result).join(", ")}`}>
          <span>Form</span>
          {FAN_MOOD.map((f) => <em key={f.date} className={`res ${f.result}`} title={`${f.venue} ${f.opp} ${f.score}, ${f.date}`}>{f.result}</em>)}
        </div>
        <span className="updated-stack">
          <span className="updated"><i aria-hidden />{archived ? "Season ended · final standings" : `${UPDATED.label}, ${UPDATED.date}`}</span>
          {next && <span className="next-update" title="Club Hub updates when the open match's rating window closes">Next update in <b className="num">{next}</b></span>}
        </span>
      </div>
    </header>
  );
}

function Crown() {
  return (
    <svg width="16" height="11" viewBox="0 0 40 28" aria-hidden>
      <path d="M3 8 12 16 20 3 28 16 37 8 34 26H6Z" fill="#ffd34d" />
    </svg>
  );
}

/** Season MOTM Race teaser: the first thing on the Overview once the fan is up to date. */
function RaceHero() {
  const race = useRace();
  const { fixtures, edges } = usePrototype();
  const archived = edges.season === "archived";
  const next = archived ? null : nextUpdate(fixtures);
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
      <p className="rh-eyebrow"><Crown />Season MOTM Race · {SEASON}{archived && " · Final"}</p>
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
          <span>Level at the top. The next match can break the tie.</span>
        ) : (
          <>
            <Kit no={chaser.no} size={26} keeper={chaser.pos === "GK"} />
            <span><b>{chaser.short}</b> <span className="num">{chaser.awards}</span></span>
            <span className="rh-gap"><b className="num">{gap}</b> behind</span>
          </>
        )}
      </div>
      {edges.sample === "low" && !archived && <p className="low-sample">Early days: only {LOW_SAMPLE_MATCHES} matches rated so far, so the race can still change a lot.</p>}
      {archived && <p className="rh-next">{tie ? "Shared" : `${leader.short} won`} the fans&apos; season MOTM race.</p>}
      {mover && !tie && !archived && <p className="rh-move">▲ {mover.short} moved up to {mover.rank === 2 ? "2nd" : `#${mover.rank}`} {UPDATED.label.replace("Updated ", "")}</p>}
      {next && <p className="rh-next">Standings update when rating closes in <b className="num">{next}</b></p>}
      <Link href="/club-hub/insights/race" scroll={false} className="rh-cta">View full race<Img src="chevron-right.svg" size={16} /></Link>
    </section>
  );
}

/**
 * While the fan still has a match they can rate, the Rate card leads the Overview (option B,
 * Michel, 4 Nov): just the card, no teaser and no lock. The race is about the whole season,
 * not that match, so it's public and always shown, straight after the card.
 */
function OverviewLead({ task }: { task?: Fixture }) {
  return (
    <>
      {task && <RateCard task={task} />}
      <RaceHero />
    </>
  );
}

function RateCard({ task }: { task: Fixture }) {
  const { rateFixture, edges, showToast } = usePrototype();
  const signedOut = edges.account === "out";
  return (
    <section className="centre" aria-labelledby="centre-title">
      <h2 id="centre-title" className="sr-only">Match to rate</h2>
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
        {signedOut ? (
          <>
            <button className="btn primary block" onClick={() => showToast("Sign-in is outside this prototype.")}>Sign in to rate</button>
            <p className="task-hint">Club Hub stays open to everyone. Sign in to add your rating and see this match&apos;s fan verdict straight away.</p>
          </>
        ) : (
          <button className="btn primary block" onClick={() => rateFixture(task.id)}>Rate this match</button>
        )}
      </div>
    </section>
  );
}

/**
 * Fans' highest and lowest rated player this season. Back by Michel's request (4 Nov), placed
 * right under Fan ratings. Fanbase only: it used to compare with "You", which now lives in My Journal.
 */
function FansTopLowest({ openRatings }: { openRatings: (s: RatingsSheet) => void }) {
  const sorted = [...SQUAD].sort((a, b) => b.fan - a.fan);
  const cell = (r: Rating, mode: "top" | "lowest") => (
    <button className={`tl-cell ${mode}`} onClick={() => openRatings({ mode, scope: "season" })}
      aria-label={`Fans' ${mode === "top" ? "highest" : "lowest"} rated: ${r.name}, ${r.fan.toFixed(1)}. See list`}>
      <span className="tl-label"><Img src={mode === "top" ? "up-fan.svg" : "down-fan.svg"} size={12} />{mode === "top" ? "Highest rated" : "Lowest rated"}</span>
      <span className="tl-player">
        <Kit no={r.no} size={34} keeper={r.pos === "GK"} />
        <span className="tl-name">{r.name.split(" ").slice(-1)[0].split("-").pop()}<small>{r.pos}</small></span>
        <b className="num">{r.fan.toFixed(1)}</b>
      </span>
    </button>
  );
  return (
    <div className="top-lowest" role="group" aria-label="Fans' highest and lowest rated player this season">
      {cell(sorted[0], "top")}
      {cell(sorted[sorted.length - 1], "lowest")}
    </div>
  );
}

/** Quick fanbase stats: one tile per insight, each with its own headline number. */
function InsightRail() {
  const { edges } = usePrototype();
  const latest = FAN_MOOD[FAN_MOOD.length - 1];
  const shift = [...SHIFTS].sort((a, b) => Math.abs(b.recent - b.season) - Math.abs(a.recent - a.season))[0];
  const cooled = shift.recent < shift.season;
  const race = useRace();
  const leaders = race.filter((p) => p.rank === 1);
  const tiles = [
    // The race is a season insight, so it's here for everyone, even with a match waiting to be rated (Warren, 4 Nov).
    { href: "race", accent: "gold", label: "Season MOTM Race", art: <span className="tile-art">{leaders.slice(0, 2).map((p) => <Kit key={p.short} no={p.no} size={52} />)}</span>, big: <>{race[0].awards}<small> awards</small></>, line: <>{leaders.length > 1 ? `${leaders.map((p) => p.short).join(" & ")} level` : `${race[0].short} leads`}</> },
    { href: "fan-mood#mood", accent: "sky", label: "Fanbase Mood", big: latest.value.toFixed(1), line: <><Delta value={latest.value - FAN_MEDIAN} /> vs fans&apos; usual</>, fresh: true },
    edges.partial
      ? { href: "fan-mood#shift", accent: "violet", label: "Who's Up, Who's Down", big: "—", line: <>Couldn&apos;t load. Open to try again.</>, fresh: true }
      : { href: "fan-mood#shift", accent: "violet", label: "Who's Up, Who's Down", big: <Delta value={shift.recent - shift.season} />, line: <>Fans have {cooled ? "cooled on" : "warmed to"} {shift.short}</>, fresh: true },
    { href: "fan-mood#divisive", accent: "coral", label: "Most Divisive", big: <span className="tile-name">{DIVISIVE.short.replace("-", "-​")}</span>, line: <>{DIVISIVE.bands[3].share}% gave 8–10, {DIVISIVE.bands[0].share}% gave 1–3</> },
    { href: "manager#mvt", accent: "blue", label: "Manager vs Team", big: <>{MANAGER_SEASON.toFixed(1)}<small> / {TEAM_SEASON.toFixed(1)}</small></>, line: <>Manager <Delta value={MANAGER_SEASON - TEAM_SEASON} /> vs team</> },
    { href: "matches#extremes", accent: "sky", label: "Best-rated match", big: "8.4", line: <>vs Man City, 4–1 · 12 Jan</> },
  ];
  return (
    <section aria-labelledby="rail-title">
      <div className="section-head">
        <h2 id="rail-title">Fanbase insights</h2>
        <Link href="/club-hub/insights/fan-mood" scroll={false}>See all<Img src="arrow-up-right.svg" size={15} /></Link>
      </div>
      <ul className="rail">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={`/club-hub/insights/${t.href}`} scroll={false} className={`tile accent-${t.accent}`}>
              <span className="tile-label">{t.fresh && <span className="new-dot">New</span>}{t.label}</span>
              {t.art}
              <strong className="tile-big num">{t.big}</strong>
              <span className="tile-line">{t.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const SECTIONS = [
  { id: "sec-overview", label: "Overview" },
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
    <div className="rating-row fans-only" role="row">
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
            <span className="count fan" aria-label={`Fan MOTM awards: ${r.fanMotm}`}><Img src="cup-fan.svg" size={12} />{r.fanMotm}</span>
          </span>
        )}
      </div>
      <span role="cell"><RatingPill value={r.fan} /></span>
    </div>
  );
}

function RatingsHead() {
  return (
    <div className="rating-head fans-only" role="row">
      <span role="columnheader">Player <i aria-hidden>·</i> <Img src="cup-white.svg" size={11} /> fan MOTM awards</span>
      <span role="columnheader">Fans</span>
    </div>
  );
}

function RatingsBottomSheet({ sheet, onClose }: { sheet: RatingsSheet | null; onClose: () => void }) {
  const sorted = useMemo(() => [...SQUAD].sort((a, b) => b.fan - a.fan), []);
  const scope = sheet?.scope === "match" ? `${sheet.title}, fans' ratings` : `Season fan ranking, ${CLUB} ${SEASON}`;
  const heading = sheet?.mode === "top" ? "Fans' top rated" : sheet?.mode === "lowest" ? "Fans' lowest rated" : "Fans' ratings";
  const picks = sheet?.mode === "top" ? sorted.slice(0, 3) : sheet?.mode === "lowest" ? sorted.slice(-3).reverse() : [];

  return (
    <Sheet open={Boolean(sheet)} onClose={onClose} label={heading}>
      <div className="sheet-header">
        <div>
          <h2>{heading}</h2>
          <p>{scope}</p>
        </div>
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
              <RatingPill value={r.fan} />
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

const FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Bundesliga", label: "Bundesliga" },
  { id: "Champions League", label: "Champions League" },
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
  const archived = edges.season === "archived";
  // A finished season has nothing left to rate: no Rate card, no live or open matches.
  const task = archived ? undefined : fixtures.find((f) => f.status === "open" && !f.youRated);

  const visible = fixtures.filter((f) => (!archived || f.status === "closed") && matchesFilter(f, filter, range));
  const filtered = filter !== "all" || Boolean(range);
  const clearFilters = () => { setFilter("all"); setRange(null); };

  useEffect(() => {
    if (!focusFixture) return;
    document.getElementById(`fixture-${focusFixture}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
    const clear = setTimeout(() => setFocusFixture(null), 2200);
    return () => clearTimeout(clear);
  }, [focusFixture, setFocusFixture]);

  return (
    <div className="hub page-in">
      <HubHeader />
      <SectionNav />
      {archived && (
        <div className="season-banner" role="note">
          <strong>Season {SEASON} has ended</strong>
          <span>These are the fans&apos; final standings and ratings. Nothing here will change.</span>
        </div>
      )}
      <div className="hub-content">
        <div id="sec-overview" className="hub-section">
          <OverviewLead task={task} />
          <InsightRail />
        </div>

        <section id="sec-ratings" className="hub-section" aria-labelledby="ratings-title">
          <div className="section-head">
            <div>
              <h2 id="ratings-title">Fan ratings</h2>
              <p className="section-sub">Fans&apos; season average · {SEASON}</p>
            </div>
            <button onClick={() => setSheet({ mode: "all", scope: "season" })}>All players<Img src="arrow-up-right.svg" size={15} /></button>
          </div>
          <div className="rating-list" role="table" aria-label="Fans' season average ratings">
            <RatingsHead />
            <RatingRow r={MANAGER} manager />
            <RatingRow r={SQUAD[0]} />
            <RatingRow r={SQUAD[1]} />
          </div>
          <FansTopLowest openRatings={setSheet} />
        </section>

        <section id="sec-fixtures" className="hub-section" aria-labelledby="fixtures-title">
          <div className="history-head">
            <h2 id="fixtures-title">Match rating history</h2>
            <div className="filter-row" role="group" aria-label="Filter matches">
              {FILTERS.map((f) => (
                <button key={f.id} aria-pressed={filter === f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>{f.label}</button>
              ))}
              <button className={range ? "on" : ""} aria-pressed={Boolean(range)} onClick={() => setFilterOpen(true)}>
                {range ? `${fmt(range.from)}${range.to !== range.from ? ` – ${fmt(range.to)}` : ""}` : "Dates"}
              </button>
            </div>
            {edges.history === "ready" && (
              <p className="result-count" aria-live="polite">
                {visible.length} {visible.length === 1 ? "match" : "matches"} · live and played only
                {filtered && <> · <button className="link" onClick={clearFilters}>Clear filters</button></>}
              </p>
            )}
          </div>

          <div className="fixture-list" aria-busy={edges.history === "loading"}>
            {edges.history === "loading" && <><FixtureSkeleton /><FixtureSkeleton /></>}
            {edges.history === "error" && (
              <div className="state-panel error" role="alert">
                <strong>Couldn&apos;t load matches</strong>
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
