"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CLUB, MANAGER, SQUAD, type Rating } from "@/lib/data";
import { MatchCard, type RatingsSheet } from "./MatchCard";
import { usePrototype, type HistoryFilter } from "./Provider";
import { FilterSheet } from "./FilterSheet";
import { Img, Jersey, RatingPill, Sheet } from "./ui";

function HubHeader() {
  const { showToast } = usePrototype();
  const outside = () => showToast("This action is outside the Club Hub prototype.");
  return (
    <header className="hub-header">
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
        <strong>{CLUB}</strong>
      </div>
    </header>
  );
}

function InsightsEntry() {
  const chips = [
    { label: "Player Trends", icon: "profile.svg", href: "player-rankings" },
    { label: "Fan Comparison", icon: "people.svg", href: "fan-sentiment" },
    { label: "Rating Patterns", icon: "star-outline.svg", href: "match-trends" },
  ];
  return (
    <section className="card insights-entry">
      <Link href="/club-hub/insights/fan-sentiment" scroll={false} className="insights-head">
        <Img src="insights-icon.svg" size={40} />
        <h2>Your Insights</h2>
        <Img src="chevron-right.svg" size={17.6} />
      </Link>
      <div className="insights-chips">
        {chips.map((c) => (
          <Link key={c.label} href={`/club-hub/insights/${c.href}`} scroll={false}>
            <Img src={c.icon} size={17.6} />
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function SummaryChip({ kind, icon, label, onClick }: { kind: "you" | "fan"; icon: "cup" | "down" | "up"; label: string; onClick?: () => void }) {
  return (
    <button className={`stat ${kind}`} onClick={onClick} disabled={!onClick}>
      <Img src={`${icon}-${kind}.svg`} size={12} />
      <span>{label}</span>
    </button>
  );
}

function SeasonPulse({ openRatings }: { openRatings: (s: RatingsSheet) => void }) {
  const row = (kind: "you" | "fan", title: string) => (
    <>
      <div className="pulse-tag"><i className={kind} />{title}</div>
      <div className="pulse-row">
        <SummaryChip kind={kind} icon="cup" label="M. Salah" />
        <SummaryChip kind={kind} icon="down" label="T. Arnold" onClick={() => openRatings({ mode: "lowest", scope: "season", who: kind })} />
        <SummaryChip kind={kind} icon="up" label="M. Salah" onClick={() => openRatings({ mode: "top", scope: "season", who: kind })} />
      </div>
    </>
  );
  return (
    <section className="card pulse">
      {row("fan", "Fans")}
      <div className="rule" />
      {row("you", "You")}
    </section>
  );
}

function RatingRow({ r, rank, manager }: { r: Rating; rank?: number; manager?: boolean }) {
  return (
    <div className="rating-row">
      {rank && <span className="rating-rank">{rank}.</span>}
      <Jersey initial={r.initial} no={r.no} manager={manager} />
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
              <Jersey small initial={r.initial} no={r.no} />
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
        <InsightsEntry />
        <SeasonPulse openRatings={setSheet} />

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
