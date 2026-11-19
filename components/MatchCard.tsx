"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CLUB, MANAGER, SQUAD, fansUnlocked, type Fixture, type Rating } from "@/lib/data";
import { fanMatchFor, shortLabel } from "@/lib/fanMatch";
import { lineupFor } from "@/lib/journal";
import { PicksCompare, Stat, picksFrom, type Picks } from "./Picks";
import { useJournalMatches } from "./Journal";
import { usePrototype } from "./Provider";
import { Img, Kit, PendingPill, RatingPill, TeamLogo } from "./ui";

export type RatingsSheet = { mode: "all" | "top" | "lowest"; scope: "season" | "match"; title?: string };

const LINEUP = [[0], [1, 2], [3, 4], [5], [6, 7], [8, 9], [10]];
const SHORT = ["Alisson", "Trent", "Van Dijk", "Konaté", "Robertson", "Mac Allister", "Gravenberch", "Szoboszlai", "Salah", "Núñez", "Díaz"];
const NUMBERS = [1, 66, 4, 5, 26, 10, 38, 8, 11, 9, 7];
const BENCH = ["Kelleher", "Gomez", "Tsimikas", "Endo", "Elliott", "Jones", "Jota", "Gakpo", "Chiesa"];

function teamRow(f: Fixture, side: "home" | "away") {
  const team = f[side];
  const score = f[`${side}Score`];
  const other = f[side === "home" ? "awayScore" : "homeScore"];
  const lost = score !== null && other !== null && score < other;
  return (
    <div className={`team-row${lost ? " lost" : ""}`} key={side}>
      <TeamLogo name={team} size={24} />
      <span className="team-name">{team}</span>
      {score !== null && <span className="team-score">{score}</span>}
    </div>
  );
}

/** W / D / L from the club's point of view. Only for finished matches. */
export function result(f: Fixture): "W" | "D" | "L" | null {
  if (f.status === "live" || f.homeScore === null || f.awayScore === null) return null;
  const us = f.home === CLUB ? f.homeScore : f.awayScore;
  const them = f.home === CLUB ? f.awayScore : f.homeScore;
  return us > them ? "W" : us < them ? "L" : "D";
}

function FanXs({ value }: { value: string }) {
  return (
    <span className="xs-pill fan">
      <Img src="star-xs-fan.svg" w={8} h={7.5} />
      {value}
    </span>
  );
}

/** Line-up player: the RATEM kit with his number, his name, and the fans' rating. */
function PlayerCard({ index }: { index: number }) {
  const fan = (6.4 + ((index * 7) % 19) / 10).toFixed(1);
  return (
    <div className="player-card">
      <Kit no={NUMBERS[index]} size={34} keeper={index === 0} />
      <span className="player-name">{SHORT[index]}</span>
      <FanXs value={fan} />
    </div>
  );
}

function Lineup() {
  return (
    <>
      <div className="manager-row">
        <span className="manager-name"><Img src="tie-xs.svg" w={3.2} h={7.8} />{MANAGER.name}</span>
        <span className="tiny-rating fan"><Img src="star-xs-fan.svg" w={8} h={7.5} />{MANAGER.fan.toFixed(1)}</span>
      </div>
      <div className="pitch">
        {LINEUP.map((row, i) => (
          <div className={`pitch-row${row.length === 1 ? " solo" : ""}`} key={i}>
            {row.map((p) => <PlayerCard key={p} index={p} />)}
          </div>
        ))}
      </div>
      <div className="bench">
        <h3>On Bench</h3>
        <div className="bench-grid">
          {BENCH.map((name, i) => (
            <div className="bench-player" key={name}>
              <span className="bench-name">{name}</span>
              <span className="bench-ratings">
                <span className="tiny-rating fan"><Img src="star-xs-fan.svg" w={8} h={7.5} />{(6.9 + i / 20).toFixed(1)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function short(r: Rating) {
  const [first, ...rest] = r.name.split(" ");
  return `${first[0]}. ${rest.join(" ").split("-").pop()}`;
}

type Badge = { label: string; tone: "live" | "open" | "muted" };

/** One status vocabulary for every match, always text plus colour. Only live or played matches exist. */
export function fixtureBadge(f: Fixture): Badge {
  switch (f.status) {
    case "live": return { label: `Live ${f.minute ?? ""}`.trim(), tone: "live" };
    case "open": return { label: "Rating open", tone: "open" };
    case "closed": return { label: "Full time", tone: "muted" };
    case "awaiting": return { label: "Result pending", tone: "muted" };
  }
}

export function StatusBadge({ fixture }: { fixture: Fixture }) {
  const b = fixtureBadge(fixture);
  return (
    <span className={`badge ${b.tone}`}>
      {b.tone === "live" && <i className="live-dot" aria-hidden />}
      {b.label}
    </span>
  );
}

/**
 * While the window is open, the fans' numbers for this match keep updating in real time as more
 * fans rate (Warren + Michel, 4 Nov). The prototype only simulates the growing count.
 */
function useLiveFans(base: number | undefined, live: boolean) {
  const [extra, setExtra] = useState(0);
  useEffect(() => {
    if (!live || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setExtra((n) => n + 1 + Math.floor(Math.random() * 3)), 4000);
    return () => clearInterval(t);
  }, [live]);
  return base === undefined ? undefined : base + (live ? extra : 0);
}

/** Only an open match has an action: rate it to see what the fans think of this match. */
function ActionArea({ fixture }: { fixture: Fixture }) {
  const { rateFixture } = usePrototype();
  if (fixture.status !== "open") return null;
  if (fixture.youRated) {
    return (
      <div className="fx-action done">
        <span className="fx-live"><i className="live-dot" aria-hidden />Updating live as fans rate · final in <b className="num">{fixture.remaining}</b></span>
        <Link className="fx-insights" href={`/my-journal/match/${fixture.id}`} scroll={false}>Your match insights<Img src="chevron-right.svg" size={14} /></Link>
      </div>
    );
  }
  // Full-width row under the score, so the action never competes with the teams for space.
  return (
    <div className="fx-action">
      <span className="fx-prompt">Rate the match to see how fans rated it</span>
      <button className="btn primary" onClick={() => rateFixture(fixture.id)}>Rate now</button>
    </div>
  );
}

function footnote(f: Fixture) {
  switch (f.status) {
    case "live": return "Rating opens at full time.";
    case "open": return f.youRated ? null : `${f.fans} fans have rated so far.`;
    case "closed": return "Final fan rating.";
    case "awaiting": return "Score not confirmed yet. Rating opens once the result is confirmed.";
  }
}

export function MatchCard({ fixture, focused, openRatings }: { fixture: Fixture; focused: boolean; openRatings: (s: RatingsSheet) => void }) {
  const [open, setOpen] = useState(false);
  const unlocked = fansUnlocked(fixture);
  const pending = fixture.status === "open" && !unlocked;
  const fixtureName = `${fixture.home} vs ${fixture.away}`;
  const r = result(fixture);
  const note = footnote(fixture);
  // Shown once the user has rated (or the window closed); keeps updating until the 48h are up.
  const live = fixture.status === "open" && unlocked;
  const fans = useLiveFans(fixture.fans, live);
  // Finished matches: the fans' story of the match, for anyone, rated or not (12 Nov).
  const fm = fanMatchFor(fixture.id);
  // Rated: the way in is your own insights first; the fans' view waits at the end of them (Michel, 12 Nov).
  // Signed out = nothing rated, so they get the fans' view as their main view.
  const { edges } = usePrototype();
  const journal = useJournalMatches();
  const mine = edges.account !== "out" ? journal.find((m) => m.id === fixture.id) : undefined;
  const rated = Boolean(mine);
  // Quick picks (Michel, 16 Nov): rated = your picks (green) next to the fans' (yellow); not rated = fans only.
  const lineup = mine ? lineupFor(mine) : null;
  const fanPicks: Picks = fm
    ? { motm: shortLabel(fm.split[0].short), low: shortLabel(fm.low.short), high: shortLabel(fm.high.short) }
    : mine && lineup ? picksFrom(lineup, mine.fanMotm, "fans") : { motm: short(SQUAD[1]), low: short(SQUAD[5]), high: short(SQUAD[1]) };
  const yourPicks = mine && lineup ? picksFrom(lineup, mine.myMotm, "you") : null;
  const lowSheet = () => openRatings({ mode: "lowest", scope: "match", title: fixtureName });
  const highSheet = () => openRatings({ mode: "top", scope: "match", title: fixtureName });

  return (
    <article id={`fixture-${fixture.id}`} className={`fixture is-${fixture.status}${focused ? " focused" : ""}`} aria-label={`${fixtureName}, ${fixture.dateLabel}, ${fixtureBadge(fixture).label}`}>
      <header className="fx-meta">
        <span className="fx-when"><b>{fixture.competition}</b><span>{fixture.dateLabel}, {fixture.kickoff}</span></span>
        {r && fixture.status !== "awaiting" && <em className={`res ${r}`} title={{ W: "Win", D: "Draw", L: "Loss" }[r]}>{r}<span className="sr-only">{{ W: " win", D: " draw", L: " loss" }[r]}</span></em>}
        <StatusBadge fixture={fixture} />
      </header>
      <div className="fixture-main">
        <div className="team-info">{teamRow(fixture, "home")}{teamRow(fixture, "away")}</div>
        <div className="fixture-ratings">
          {unlocked && fixture.fanRating !== undefined && <RatingPill value={fixture.fanRating} />}
          {live && <span className="pill-live">Live</span>}
          {pending && <PendingPill fans={fixture.fans} />}
        </div>
      </div>
      <p className="fx-venue"><Img src="stadium.svg" w={13} h={13} /><span>{fixture.venue}{note && <> · {note}</>}</span></p>
      <ActionArea fixture={fixture} />

      {unlocked && (yourPicks ? (
        // Rated: your picks (green) on top of the fans' (yellow), same columns, for a quick side-by-side.
        <PicksCompare you={yourPicks} fans={fanPicks} onFanLow={lowSheet} onFanHigh={highSheet} />
      ) : (
        <div className="summary-table fans-only" role="table" aria-label="Fans' picks for this match">
          <span className="stat plain-head" role="columnheader"><Img src="cup-white.svg" size={12} />Fans&apos; MOTM</span>
          <span className="stat plain-head" role="columnheader"><Img src="down-white.svg" size={12} />Lowest</span>
          <span className="stat plain-head" role="columnheader"><Img src="up-white.svg" size={12} />Highest</span>
          <Stat kind="fan" icon="cup" label={fanPicks.motm} />
          <Stat kind="fan" icon="down" label={fanPicks.low} onClick={lowSheet} />
          <Stat kind="fan" icon="up" label={fanPicks.high} onClick={highSheet} />
        </div>
      ))}

      {fm && (rated ? (
        <Link className="fx-fan-insights mine" href={`/my-journal/match/${fixture.id}`} scroll={false}>
          <Img src="cup-you.svg" size={14} />
          <span className="fans-label">Your match insights<small>Your patterns, then you vs the fans · the fans&apos; view at the end</small></span>
          <Img src="chevron-right.svg" size={14} />
        </Link>
      ) : (
        <Link className="fx-fan-insights" href={`/club-hub/match/${fixture.id}`} scroll={false}>
          <Img src="cup-fan.svg" size={14} />
          <span className="fans-label">Fan match insights<small>MOTM vote, most divisive, highest and lowest</small></span>
          <Img src="chevron-right.svg" size={14} />
        </Link>
      ))}

      {unlocked && (
        <button className="fans-think" aria-expanded={open} aria-controls={`lineup-${fixture.id}`} onClick={() => setOpen(!open)}>
          <span className="fan-avatars" aria-hidden>
            <Img src="fan-1.png" size={16} />
            <Img src="fan-2.png" size={16} />
            <Img src="fan-3.png" size={16} />
          </span>
          <span className="fans-label">Line-up &amp; fan player ratings<small>{fans} fans rated{live ? " so far" : ""}</small></span>
          <span className="lineup-toggle">{open ? "Hide" : "Show"}<Img src="dropdown.svg" size={12} style={{ transform: open ? "rotate(180deg)" : undefined }} /></span>
        </button>
      )}
      {unlocked && (
        <div id={`lineup-${fixture.id}`} className={`expand${open ? " open" : ""}`}>
          <div>{open && <Lineup />}</div>
        </div>
      )}
    </article>
  );
}
