"use client";

import { useState } from "react";
import { CLUB, MANAGER, SQUAD, type Fixture, type Rating } from "@/lib/data";
import { usePrototype } from "./Provider";
import { Img, Jersey, RatingPill, TeamLogo } from "./ui";

export type RatingsSheet = { mode: "all" | "top" | "lowest"; scope: "season" | "match"; title?: string; who?: "you" | "fan" };

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

/** W / D / L from the user's club's point of view. Only for finished matches. */
export function result(f: Fixture): "W" | "D" | "L" | null {
  if (f.status === "live" || f.homeScore === null || f.awayScore === null) return null;
  const us = f.home === CLUB ? f.homeScore : f.awayScore;
  const them = f.home === CLUB ? f.awayScore : f.homeScore;
  return us > them ? "W" : us < them ? "L" : "D";
}

function XsRating({ kind, value }: { kind: "you" | "fan"; value: string }) {
  return (
    <span className="player-side">
      <span className={`xs-pill ${kind}`}>
        <Img src={kind === "you" ? "star-xs-you.svg" : "star-xs-fan.svg"} w={8} h={7.5} />
        {value}
      </span>
      <span className={`xs-pill arrow ${kind}`}>
        <Img src={kind === "you" ? "down-you.svg" : "down-fan.svg"} size={12} />
      </span>
    </span>
  );
}

function PlayerCard({ index, rated }: { index: number; rated: boolean }) {
  const fan = (6.4 + ((index * 7) % 19) / 10).toFixed(1);
  const you = (6.1 + ((index * 5) % 23) / 10).toFixed(1);
  return (
    <div className="player-card">
      {rated && <XsRating kind="you" value={you} />}
      <span className="player-info">
        <Jersey small initial={SHORT[index][0]} no={NUMBERS[index]} />
        <span className="player-name">{SHORT[index]}</span>
      </span>
      <XsRating kind="fan" value={fan} />
    </div>
  );
}

function Lineup({ rated }: { rated: boolean }) {
  return (
    <>
      <div className="manager-row">
        {rated && <span className="tiny-rating you"><Img src="star-xs-you.svg" w={8} h={7.5} />{MANAGER.you.toFixed(1)}</span>}
        <span className="manager-name"><Img src="tie-xs.svg" w={3.2} h={7.8} />{MANAGER.name}</span>
        <span className="tiny-rating fan"><Img src="star-xs-fan.svg" w={8} h={7.5} />{MANAGER.fan.toFixed(1)}</span>
      </div>
      <div className="pitch">
        {LINEUP.map((row, i) => (
          <div className={`pitch-row${row.length === 1 ? " solo" : ""}`} key={i}>
            {row.map((p) => <PlayerCard key={p} index={p} rated={rated} />)}
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
                {rated && <span className="tiny-rating you"><Img src="star-xs-you.svg" w={8} h={7.5} />{(6.6 + i / 10).toFixed(1)}</span>}
                <span className="tiny-rating fan"><Img src="star-xs-fan.svg" w={8} h={7.5} />{(6.9 + i / 20).toFixed(1)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Stat({ kind, label, icon, onClick }: { kind: "you" | "fan" | "plain"; label: string; icon: "cup" | "down" | "up"; onClick?: () => void }) {
  const file = kind === "plain" ? `${icon}-white.svg` : `${icon}-${kind}.svg`;
  const body = (
    <>
      <Img src={file} size={12} />
      <span>{label}</span>
    </>
  );
  if (!onClick) return <span className={`stat ${kind}`}>{body}</span>;
  return <button className={`stat ${kind}`} onClick={onClick}>{body}</button>;
}

function short(r: Rating) {
  const [first, ...rest] = r.name.split(" ");
  return `${first[0]}. ${rest.join(" ").split("-").pop()}`;
}

function Comment({ text }: { text: string }) {
  const { showToast } = usePrototype();
  const [more, setMore] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const toggle = (v: "up" | "down") => setVote((c) => (c === v ? null : v));
  return (
    <div className="comment">
      <p>
        <span className={more ? "" : "clamp"}>{text}</span>
        <button onClick={() => setMore(!more)}>{more ? "See Less" : "See More"}</button>
      </p>
      <button className={`vote${vote === "up" ? " on" : ""}`} aria-pressed={vote === "up"} aria-label="Like" onClick={() => toggle("up")}>
        <Img src="like.svg" size={17.6} />
        {66 + (vote === "up" ? 1 : 0)}
      </button>
      <button className={`vote${vote === "down" ? " on" : ""}`} aria-pressed={vote === "down"} aria-label="Dislike" onClick={() => toggle("down")}>
        <Img src="dislike.svg" size={17.6} />
        {66 + (vote === "down" ? 1 : 0)}
      </button>
      <button className="vote" aria-label="More options" onClick={() => showToast("Comment options are part of Phase 1.")}>
        <Img src="more.svg" size={24} style={{ transform: "rotate(-90deg)" }} />
      </button>
    </div>
  );
}

type Badge = { label: string; tone: "live" | "open" | "done" | "next" | "muted" };

/** One status vocabulary for every fixture, always text plus colour. */
export function fixtureBadge(f: Fixture): Badge {
  switch (f.status) {
    case "upcoming": return { label: "Upcoming", tone: "next" };
    case "live": return { label: `Live ${f.minute ?? ""}`.trim(), tone: "live" };
    case "open": return { label: "Rating open", tone: "open" };
    case "rated": return { label: "Rated", tone: "done" };
    case "closed": return { label: "Full time", tone: "muted" };
    case "awaiting": return { label: "Result pending", tone: "muted" };
  }
}

export function StatusBadge({ fixture }: { fixture: Fixture }) {
  const b = fixtureBadge(fixture);
  return (
    <span className={`badge ${b.tone}`}>
      {b.tone === "live" && <i className="live-dot" aria-hidden />}
      {b.tone === "done" && <span aria-hidden>✓</span>}
      {b.label}
    </span>
  );
}

function ActionArea({ fixture }: { fixture: Fixture }) {
  const { rateFixture } = usePrototype();
  switch (fixture.status) {
    case "upcoming":
      return (
        <div className="fx-kickoff">
          <strong className="num">{fixture.kickoff}</strong>
          <small>Kickoff</small>
        </div>
      );
    case "open":
      // Full-width row under the score, so the action never competes with the teams for space.
      return (
        <div className="fx-action">
          <span>Rating closes in <b className="num">{fixture.remaining}</b></span>
          <button className="btn primary" onClick={() => rateFixture(fixture.id)}>Rate now</button>
        </div>
      );
    default:
      return null;
  }
}

function footnote(f: Fixture) {
  switch (f.status) {
    case "upcoming": return "Rating opens at full time.";
    case "live": return "Rating opens at full time.";
    case "closed": return "Rating window closed.";
    case "awaiting": return "Score not confirmed yet. Rating opens once the result is confirmed.";
    default: return null;
  }
}

export function MatchCard({ fixture, focused, openRatings }: { fixture: Fixture; focused: boolean; openRatings: (s: RatingsSheet) => void }) {
  const { showToast } = usePrototype();
  const [open, setOpen] = useState(false);
  const rated = fixture.status === "rated";
  const hasDetails = fixture.status === "open" || fixture.status === "rated" || fixture.status === "closed";
  const fixtureName = `${fixture.home} vs ${fixture.away}`;
  const r = result(fixture);
  const note = footnote(fixture);

  return (
    <article id={`fixture-${fixture.id}`} className={`fixture is-${fixture.status}${focused ? " focused" : ""}`} aria-label={`${fixtureName}, ${fixture.dateLabel}, ${fixtureBadge(fixture).label}`}>
      <header className="fx-meta">
        <span className="fx-when"><b>{fixture.competition}</b><span>{fixture.dateLabel}, {fixture.kickoff}</span></span>
        {r && fixture.status !== "awaiting" && <em className={`res ${r}`} title={{ W: "Win", D: "Draw", L: "Loss" }[r]}>{r}<span className="sr-only">{{ W: " win", D: " draw", L: " loss" }[r]}</span></em>}
        <StatusBadge fixture={fixture} />
        {rated && (
          <button className="icon-btn" aria-label="Share your rating" onClick={() => showToast("Sharing is part of Phase 1.")}>
            <Img src="share.svg" size={16} />
          </button>
        )}
      </header>
      <div className="fixture-main">
        <div className="team-info">{teamRow(fixture, "home")}{teamRow(fixture, "away")}</div>
        {fixture.status !== "open" && <ActionArea fixture={fixture} />}
        <div className="fixture-ratings">
          {rated && fixture.youRating && <RatingPill kind="you" value={fixture.youRating} />}
          {fixture.fanRating && <RatingPill kind="fan" value={fixture.fanRating} />}
        </div>
      </div>
      <p className="fx-venue"><Img src="stadium.svg" w={13} h={13} /><span>{fixture.venue}{note && <> · {note}</>}</span></p>
      {fixture.status === "open" && <ActionArea fixture={fixture} />}

      {rated && (
        <>
          <div className="summary-table" role="table" aria-label="Match picks, you and fans">
            <span role="columnheader" />
            <span className="stat plain-head" role="columnheader"><Img src="cup-white.svg" size={12} />MOTM</span>
            <span className="stat plain-head" role="columnheader"><Img src="down-white.svg" size={12} />Lowest</span>
            <span className="stat plain-head" role="columnheader"><Img src="up-white.svg" size={12} />Highest</span>
            <span className="row-label you" role="rowheader">You</span>
            <Stat kind="you" icon="cup" label={short(SQUAD[0])} />
            <Stat kind="you" icon="down" label={short(SQUAD[5])} onClick={() => openRatings({ mode: "lowest", scope: "match", title: fixtureName, who: "you" })} />
            <Stat kind="you" icon="up" label={short(SQUAD[0])} onClick={() => openRatings({ mode: "top", scope: "match", title: fixtureName, who: "you" })} />
            <span className="row-label fan" role="rowheader">Fans</span>
            <Stat kind="fan" icon="cup" label={short(SQUAD[1])} />
            <Stat kind="fan" icon="down" label={short(SQUAD[5])} onClick={() => openRatings({ mode: "lowest", scope: "match", title: fixtureName, who: "fan" })} />
            <Stat kind="fan" icon="up" label={short(SQUAD[1])} onClick={() => openRatings({ mode: "top", scope: "match", title: fixtureName, who: "fan" })} />
          </div>
          {fixture.comment && <Comment text={fixture.comment} />}
        </>
      )}

      {hasDetails && (
        <button className="fans-think" aria-expanded={open} aria-controls={`lineup-${fixture.id}`} onClick={() => setOpen(!open)}>
          <span className="fan-avatars" aria-hidden>
            <Img src="fan-1.png" size={16} />
            <Img src="fan-2.png" size={16} />
            <Img src="fan-3.png" size={16} />
          </span>
          <span className="fans-label">Line-up &amp; player ratings<small>{fixture.fans} fans rated</small></span>
          <span className="lineup-toggle">{open ? "Hide" : "Show"}<Img src="dropdown.svg" size={12} style={{ transform: open ? "rotate(180deg)" : undefined }} /></span>
        </button>
      )}
      {hasDetails && (
        <div id={`lineup-${fixture.id}`} className={`expand${open ? " open" : ""}`}>
          <div>{open && <Lineup rated={rated} />}</div>
        </div>
      )}
    </article>
  );
}
