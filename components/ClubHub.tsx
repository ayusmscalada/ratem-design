"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CLUB, DIVISIVE, FAN_MEDIAN, FAN_MOOD, MANAGER, MANAGER_SEASON, SEASON, SHIFTS, SQUAD, TEAM_SEASON, UPDATED, type Rating } from "@/lib/data";
import { MatchCard, type RatingsSheet } from "./MatchCard";
import { usePrototype, type HistoryFilter } from "./Provider";
import { FilterSheet } from "./FilterSheet";
import { useRace } from "./Insights";
import { Delta, Img, Kit, RatingPill, Sheet } from "./ui";

function HubHeader() {
  const { showToast } = usePrototype();
  const outside = () => showToast("This action is outside the Club Hub prototype.");
  return (
    <header className="hub-header">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hub-photo" src="/photos/stadium-night.jpg" alt="" fetchPriority="high" />
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="rh-photo" src="/photos/floodlight.jpg" alt="" loading="lazy" />
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
        <span className="yvf-label"><Img src="up-white.svg" size={12} />Top rated</span>
        {cell(you[0], "you", "top")}
        {cell(fan[0], "fan", "top")}
        <span className="yvf-label"><Img src="down-white.svg" size={12} />Lowest rated</span>
        {cell(you[you.length - 1], "you", "lowest")}
        {cell(fan[fan.length - 1], "fan", "lowest")}
      </div>
    </section>
  );
}

function RatingRow({ r, rank, manager }: { r: Rating; rank?: number; manager?: boolean }) {
  return (
    <div className="rating-row">
      {rank && <span className="rating-rank">{rank}.</span>}
      {manager ? (
        <span className="coach-badge" aria-hidden><Img src="tie.svg" w={10} h={24} /></span>
      ) : (
        <Kit no={r.no} size={44} keeper={r.pos === "GK"} />
      )}
      <div className="rating-who">
        <strong>{r.name}</strong>
        {manager ? (
          <small>Manager</small>
        ) : (
          <span className="motm-counts">
            <span className="count you"><Img src="cup-you.svg" size={12} />{r.youMotm}</span>
            <span className="count fan"><Img src="cup-fan.svg" size={12} />{r.fanMotm}</span>
          </span>
        )}
      </div>
      <RatingPill kind="you" value={r.you} />
      <RatingPill kind="fan" value={r.fan} />
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

export function ClubHub() {
  const { fixtures, filter, setFilter, range, focusFixture, setFocusFixture } = usePrototype();
  const [sheet, setSheet] = useState<RatingsSheet | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const closeSheet = useMemo(() => () => setSheet(null), []);

  const visible = fixtures.filter((f) => {
    if (filter === "rated" && f.status !== "rated") return false;
    if (filter === "unrated" && f.status === "rated") return false;
    return !range || (f.date >= range.from && f.date <= range.to);
  });

  useEffect(() => {
    if (!focusFixture) return;
    document.getElementById(`fixture-${focusFixture}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
    const clear = setTimeout(() => setFocusFixture(null), 2200);
    return () => clearTimeout(clear);
  }, [focusFixture, setFocusFixture]);

  return (
    <div className="hub page-in">
      <HubHeader />
      <div className="hub-content">
        <RaceHero />
        <InsightRail />
        <YouVsFans openRatings={setSheet} />

        <section>
          <div className="section-head">
            <h2>Ratings</h2>
            <button onClick={() => setSheet({ mode: "all", scope: "season" })}>See all<Img src="arrow-up-right.svg" size={15} /></button>
          </div>
          <div className="rating-list">
            <RatingRow r={MANAGER} manager />
            <RatingRow r={SQUAD[0]} />
            <RatingRow r={SQUAD[1]} />
          </div>
        </section>

        <section className="history-head">
          <h2>Match History</h2>
          <div className="filter-row">
            {FILTERS.map((f) => (
              <button key={f.id} aria-pressed={filter === f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
            <button className={range ? "on" : ""} aria-pressed={Boolean(range)} onClick={() => setFilterOpen(true)}>Dates</button>
          </div>
        </section>

        {visible.map((f) => <MatchCard key={f.id} fixture={f} focused={focusFixture === f.id} openRatings={setSheet} />)}
        {visible.length === 0 && <p className="empty">No matches fit these filters.</p>}
      </div>

      <RatingsBottomSheet sheet={sheet} onClose={closeSheet} />
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}
