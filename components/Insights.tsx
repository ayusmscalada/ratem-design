"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CLUB, DIVISIVE, FAN_MEDIAN, FAN_MOOD, MANAGER_SEASON, MANAGER_TREND, MOOD_FANS, MOTM_RACE, MOTM_RACE_TIE,
  POSITION_RATINGS, RANGES, RATED_FIXTURES, SEASON, SHIFTS, TABS, TEAM_SEASON, UPDATED, nextUpdate, type RaceEntry, type TabId,
} from "@/lib/data";
import { usePrototype } from "./Provider";
import { Delta, Img, Kit, Moment, Photo, PlayerFilter, TeamLogo, useSwap } from "./ui";

/* ---------- helpers ---------- */

/** Standard competition ranking: equal totals share a rank, no invented order. */
export function ranked(list: RaceEntry[]) {
  const sorted = [...list].sort((a, b) => b.awards - a.awards);
  return sorted.map((p) => ({ ...p, rank: 1 + sorted.filter((q) => q.awards > p.awards).length, tied: sorted.filter((q) => q.awards === p.awards).length > 1 }));
}

export function useRace() {
  const { edges } = usePrototype();
  return ranked(edges.raceTie ? MOTM_RACE_TIE : MOTM_RACE);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function Crown({ size = 26 }: { size?: number }) {
  return (
    <svg className="crown" width={size} height={size * 0.7} viewBox="0 0 40 28" aria-hidden>
      <path d="M3 8 12 16 20 3 28 16 37 8 34 26H6Z" fill="#ffd34d" stroke="#b8860b" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Updating">
      {Array.from({ length: rows }, (_, i) => <span key={i} style={{ width: `${90 - i * 18}%` }} />)}
    </div>
  );
}

/* ---------- MOTM Race ---------- */

function Podium({ race }: { race: ReturnType<typeof ranked> }) {
  const top = race.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);
  const max = top[0].awards;
  return (
    <div className="podium" role="list" aria-label="Top three in the season MOTM race">
      {order.map((p) => (
        <div key={p.name} role="listitem" className={`step r${p.rank}`} style={{ ["--h" as string]: `${46 + (p.awards / max) * 54}%` }}>
          <div className="step-kit">
            {p.rank === 1 && <Crown />}
            <Kit no={p.no} size={p.rank === 1 ? 64 : 50} keeper={p.pos === "GK"} />
          </div>
          <div className="step-block">
            <strong className="num">{p.awards}</strong>
            <span className="step-name">{p.short}</span>
            <small>{p.pos}</small>
            <span className="medal" aria-label={`Rank ${p.tied ? "equal " : ""}${p.rank}`}>{p.tied ? "=" : ""}{p.rank}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function raceHeadline(race: ReturnType<typeof ranked>) {
  const leaders = race.filter((p) => p.rank === 1);
  if (leaders.length > 1) return { title: `${leaders.map((p) => p.short).join(" and ")} are level`, line: `${plural(leaders[0].awards, "award")} each` };
  const next = race.find((p) => p.rank > 1)!;
  const gap = race[0].awards - next.awards;
  return { title: `${race[0].short} leads by ${gap}`, line: `${race[0].awards} awards to ${next.short}'s ${next.awards}` };
}

function SeasonMotmRace() {
  const race = useRace();
  const head = raceHeadline(race);
  return (
    <Moment id="race" accent="gold" question="Who leads the season race?" title="Season MOTM Race" context={`${CLUB} · ${SEASON} · after ${RATED_FIXTURES} rated fixtures`}
      note={<>Fan MOTM awards: fixtures where the fan vote named the player Man of the Match. Equal totals share a rank.</>}>
      <div className="answer">
        <strong className="answer-big">{head.title}</strong>
        <span className="answer-line">{head.line}</span>
      </div>
      <Podium race={race} />
      <ol className="standings" aria-label="Full standings">
        {race.map((p) => (
          <li key={p.name}>
            <span className="st-rank num">{p.tied ? "=" : ""}{p.rank}</span>
            <Kit no={p.no} size={28} keeper={p.pos === "GK"} />
            <span className="st-name">{p.name}<small>{p.pos}</small></span>
            <span className={`st-move ${p.move > 0 ? "up" : p.move < 0 ? "down" : ""}`}>
              {p.move > 0 ? `▲ ${p.move}` : p.move < 0 ? `▼ ${-p.move}` : "–"}
              <span className="sr-only">{p.move > 0 ? `up ${p.move} place since last fixture` : p.move < 0 ? `down ${-p.move} place since last fixture` : "no change since last fixture"}</span>
            </span>
            <b className="num">{p.awards}</b>
          </li>
        ))}
      </ol>
      <p className="standings-key">▲▼ Places moved since the previous fixture</p>
    </Moment>
  );
}

/* ---------- Fan Mood ---------- */

function moodWord(diff: number) {
  if (diff >= 0.3) return "Above their usual";
  if (diff <= -0.3) return "Below their usual";
  return "In line with their usual";
}

function FanbaseMood() {
  const { edges } = usePrototype();
  if (edges.mood === "none") {
    return (
      <Moment id="mood" accent="sky" question="How do fans feel about the team right now?" title="Fanbase Mood">
        <div className="empty-state"><strong>No mood yet</strong><span>Fanbase Mood appears once the first match&apos;s rating window closes.</span></div>
      </Moment>
    );
  }
  const latest = FAN_MOOD[FAN_MOOD.length - 1];
  const diff = latest.value - FAN_MEDIAN;
  const y = (v: number) => 100 - ((v - 5) / 4) * 100;
  return (
    <Moment id="mood" accent="sky" isNew question="How do fans feel about the team right now?" title="Fanbase Mood"
      context={`After ${latest.venue} ${latest.opp} ${latest.score}, ${latest.date} · ${MOOD_FANS} fans rated`}
      note={<>Squad rating is the average of every fan player rating in that fixture. The fans&apos; median covers {RATED_FIXTURES} rated fixtures.</>}>
      <div className="mood-hero">
        <div className="mood-dial" style={{ ["--p" as string]: `${latest.value * 10}%` }}>
          <strong className="num">{latest.value.toFixed(1)}</strong>
          <small>squad rating</small>
        </div>
        <div className="mood-read">
          <span className="mood-word">{moodWord(diff)}</span>
          <span><Delta value={diff} /> vs fans&apos; season median of <b className="num">{FAN_MEDIAN.toFixed(1)}</b></span>
        </div>
      </div>
      <div className="form-strip" role="img" aria-label={`Last ${FAN_MOOD.length} fixtures: ${FAN_MOOD.map((f) => `${f.venue} ${f.opp} ${f.value.toFixed(1)}`).join(", ")}. Median ${FAN_MEDIAN}.`}>
        <span className="form-median" style={{ top: `calc(120px * ${y(FAN_MEDIAN) / 100})` }}><i>median {FAN_MEDIAN.toFixed(1)}</i></span>
        {FAN_MOOD.map((f, i) => (
          <div key={f.date} className={`form-col ${f.value >= FAN_MEDIAN ? "above" : "below"}${i === FAN_MOOD.length - 1 ? " latest" : ""}`}>
            <div className="form-track"><span className="num" style={{ top: `${y(f.value)}%` }}>{f.value.toFixed(1)}</span></div>
            <em className={`res ${f.result}`}>{f.result}</em>
            <b>{f.venue} {f.opp}</b>
            <small>{f.date}</small>
          </div>
        ))}
      </div>
    </Moment>
  );
}

function FanConfidenceShift() {
  const { playerFilter, setPlayerFilter, edges, setEdges } = usePrototype();
  const value = playerFilter.shift ?? "all";
  const { shown, loading } = useSwap(value);
  const sorted = [...SHIFTS].sort((a, b) => Math.abs(b.recent - b.season) - Math.abs(a.recent - a.season));
  const player = SHIFTS.find((s) => s.short === shown);
  const options = SHIFTS.map((s) => ({ id: s.short, label: s.name, short: s.short, meta: s.pos }));
  const lead = sorted[0];

  return (
    <Moment id="shift" accent="violet" isNew failed={edges.partial ? { onRetry: () => setEdges({ partial: false }) } : undefined} question="Which players are fans warming to, or cooling on?" title="Who's Up, Who's Down"
      context={player ? `${player.name} · his last 5 matches vs his whole season` : "Fan ratings in the last 5 matches, compared with the whole season"}
      filter={<PlayerFilter label="Player" options={options} value={value} onChange={(id) => setPlayerFilter("shift", id)} />}
      note={<>We compare each player&apos;s average fan rating in the last 5 matches with his season average. Players need 8+ fan-rated matches.</>}>
      {loading ? <Skeleton rows={4} /> : player ? (
        <div className="swap-in">
          <div className="shift-hero">
            <Kit no={player.no} size={60} keeper={player.pos === "GK"} />
            <div className="shift-nums">
              <div><small>All season</small><strong className="num">{player.season.toFixed(1)}</strong></div>
              <span className="shift-arrow" aria-hidden>→</span>
              <div><small>Lately</small><strong className="num">{player.recent.toFixed(1)}</strong></div>
              <Delta value={player.recent - player.season} className="big" />
            </div>
          </div>
          <div className="seq" aria-label={`${player.short}'s fan ratings over the last 5 fixtures`}>
            {player.ratings.map((r, i) => (
              <div key={i} className={r >= player.season ? "above" : "below"}>
                <strong className="num">{r.toFixed(1)}</strong>
                <b>{FAN_MOOD[i].venue} {FAN_MOOD[i].opp}</b>
                <small>{FAN_MOOD[i].date}</small>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="swap-in">
          <div className="answer">
            <strong className="answer-big">Fans have {lead.recent < lead.season ? "cooled on" : "warmed to"} {lead.short}</strong>
            <span className="answer-line">Rated <b className="num">{lead.recent.toFixed(1)}</b> lately, {lead.recent < lead.season ? "down" : "up"} from <b className="num">{lead.season.toFixed(1)}</b> across the season</span>
          </div>
          <p className="movers-key"><span>All season → lately</span></p>
          <ul className="movers">
            {sorted.map((s) => (
              <li key={s.name}>
                <button onClick={() => setPlayerFilter("shift", s.short)} aria-label={`${s.name}: ${s.season} all season, ${s.recent} lately. Show detail`}>
                  <Kit no={s.no} size={28} keeper={s.pos === "GK"} />
                  <span className="mv-name">{s.short}</span>
                  <span className="mv-from num">{s.season.toFixed(1)} → {s.recent.toFixed(1)}</span>
                  <Delta value={s.recent - s.season} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Moment>
  );
}

function MostDivisive() {
  const d = DIVISIVE;
  const harsh = d.bands[0];
  const generous = d.bands[d.bands.length - 1];
  return (
    <Moment id="divisive" accent="coral" question="Which player split the fans most?" title="Most Divisive Player" context={`${d.fixture}, ${d.date} · ${d.fans} fans rated him`}
      note={<>Divisive = most fans at both ends of the scale (1–3 and 8–10) for one player in one fixture this season.</>}>
      <div className="div-hero">
        <Kit no={d.no} size={64} keeper={d.pos === "GK"} />
        <div>
          <strong className="answer-big">{d.short}</strong>
          <span className="answer-line">Median rating <b className="num">{d.median.toFixed(1)}</b>, but few fans landed there</span>
        </div>
      </div>
      <div className="split" role="img" aria-label={d.bands.map((b) => `${b.share}% rated ${b.label}`).join(", ")}>
        {d.bands.map((b, i) => (
          <div key={b.label} className={`band b${i}`} style={{ flexGrow: b.share }}>
            <strong className="num">{b.share}%</strong>
            <small>{b.label}</small>
          </div>
        ))}
      </div>
      <div className="split-ends">
        <span><b className="num c-low">{harsh.share}%</b> rated him {harsh.label}</span>
        <span><b className="num c-high">{generous.share}%</b> rated him {generous.label}</span>
      </div>
    </Moment>
  );
}

/* ---------- Players ---------- */

/** Small supporting icons per position group (Michel, 5 Nov): subtle line art, the rating stays the focus. */
const POS_ICONS: Record<string, ReactNode> = {
  // a boot striking a ball
  Attack: (<><path d="M2.5 7h4.6l1.6 2.6 5.3 1.4c2.1.6 3.5 1.7 3.5 3.4V16H2.5Z" /><path d="M5 16v1.8M9.2 16v1.8M13.6 16v1.8M9.6 10.4l-.9 1.5M11.8 11l-.8 1.4" /><circle cx="20.6" cy="11" r="2.4" /></>),
  // connected nodes: a passing network
  Midfield: (<><path d="M5.5 6 12 12l6.5-6M12 12l-6 6.5M12 12l6 6.5M5.5 6h13" /><circle cx="5.5" cy="6" r="2" /><circle cx="18.5" cy="6" r="2" /><circle cx="12" cy="12" r="2.2" /><circle cx="6" cy="18.5" r="2" /><circle cx="18" cy="18.5" r="2" /></>),
  // a shield: protection and solidity
  Defence: (<><path d="M12 2.8 19.2 5.6v5.6c0 4.6-3 8-7.2 10-4.2-2-7.2-5.4-7.2-10V5.6Z" /><path d="M12 6.6v11" /></>),
};

export function PosIcon({ label }: { label: string }) {
  return (
    <svg className="pos-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {POS_ICONS[label]}
    </svg>
  );
}

function RatingsByPosition() {
  const top = [...POSITION_RATINGS].sort((a, b) => b.fan - a.fan)[0];
  return (
    <Moment id="position" accent="blue" question="How do fans rate each part of the team?" title="Ratings by Position" context={`Fans' season average player rating · ${SEASON} · outfield positions`}
      note={<>Fans&apos; average across all {RATED_FIXTURES} rated matches.</>}>
      <div className="answer">
        <strong className="answer-big">Fans rate {top.label.toLowerCase()} highest</strong>
        <span className="answer-line">{top.fan.toFixed(1)} average across the season</span>
      </div>
      <div className="pos-table" role="table" aria-label="Average rating by position">
        {/* No "vs top" column: the three averages tell the story, the top group is simply highlighted (Michel, 4 Nov). */}
        <div className="pos-row fans-only head" role="row"><span role="columnheader">Position</span><span role="columnheader">Fans</span></div>
        {POSITION_RATINGS.map((p) => (
          <div className={`pos-row fans-only${p.label === top.label ? " is-top" : ""}`} role="row" key={p.label}>
            <span role="cell" className="pos-name"><PosIcon label={p.label} />{p.label}{p.label === top.label && <span className="pos-top">Highest</span>}</span>
            <span role="cell" className="num pill-fan">{p.fan.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </Moment>
  );
}

function WidestRange() {
  const { playerFilter, setPlayerFilter } = usePrototype();
  const value = playerFilter.range ?? "all";
  const { shown, loading } = useSwap(value);
  const widest = [...RANGES].sort((a, b) => b.high - b.low - (a.high - a.low))[0];
  const p = RANGES.find((r) => r.short === shown) ?? widest;
  const spread = p.high - p.low;
  const options = RANGES.map((r) => ({ id: r.short, label: r.name, short: r.short, meta: `${r.apps} apps` }));

  return (
    <Moment id="range" accent="gold" question="Which player’s ratings varied the most?" title="Widest Rating Range"
      context={shown === "all" ? `Widest spread in the squad · ${SEASON}` : `${p.name} · ${p.apps} fan-rated appearances`}
      filter={<PlayerFilter label="Player" options={options} value={value} onChange={(id) => setPlayerFilter("range", id)} />}
      note={<>Range = the difference between a player&apos;s highest and lowest fan rating this season. Players need 5+ rated appearances to qualify.</>}>
      {loading ? <Skeleton rows={3} /> : (
        <div className="swap-in">
          <div className="div-hero">
            <Kit no={p.no} size={56} keeper={p.pos === "GK"} />
            <div>
              <strong className="answer-big">{p.short}</strong>
              <span className="answer-line"><b className="num">{spread.toFixed(1)}</b>-point range, {p.low.toFixed(1)} to {p.high.toFixed(1)}</span>
            </div>
          </div>
          <div className="range-scale2" aria-hidden>
            <div className="rs-track">
              <i style={{ left: `${p.low * 10}%`, right: `${100 - p.high * 10}%` }} />
              <em className="low num" style={{ left: `${p.low * 10}%` }}>{p.low.toFixed(1)}</em>
              <em className="high num" style={{ left: `${p.high * 10}%` }}>{p.high.toFixed(1)}</em>
            </div>
            <div className="rs-axis"><span>0</span><span>5</span><span>10</span></div>
          </div>
          <div className="range-ends">
            <div><small>Lowest</small><b>{p.lowAt}</b></div>
            <div><small>Highest</small><b>{p.highAt}</b></div>
          </div>
        </div>
      )}
    </Moment>
  );
}

/* ---------- Matches ---------- */

function SeasonExtremes() {
  const { setFocusFixture, setFilter, setRange } = usePrototype();
  const router = useRouter();
  const open = (id: string) => {
    setFilter("all");
    setRange(null);
    setFocusFixture(id);
    router.push("/club-hub", { scroll: false });
  };
  return (
    <Moment id="extremes" accent="blue" question="Which matches did fans rate highest and lowest?" title="Season Extremes" context={`Fan squad rating · ${SEASON}`}>
      <div className="extremes2">
        <button className="ext high" onClick={() => open("mci-home")}>
          <small>Highest</small>
          <strong className="num">8.4</strong>
          <b>vs Man City</b>
          <span>4–1 win · 12 Jan</span>
          <u>View match<Img src="arrow-up-right.svg" size={14} /></u>
        </button>
        <button className="ext low" onClick={() => open("mci-away")}>
          <small>Lowest</small>
          <strong className="num">4.1</strong>
          <b>@ Man City</b>
          <span>0–4 loss · 9 Nov</span>
          <u>View match<Img src="arrow-up-right.svg" size={14} /></u>
        </button>
      </div>
    </Moment>
  );
}

function Controversial() {
  return (
    <Moment id="controversial" accent="coral" question="Which match divided the fanbase most?" title="Most Controversial Match" context="vs Arsenal · 27 Oct · 512 fans rated"
      note="Spread = highest minus lowest fan squad rating submitted for the match.">
      <div className="answer">
        <strong className="answer-big">No collective verdict</strong>
        <span className="answer-line">Fan ratings ran from 3.0 to 9.5, the widest spread this season</span>
      </div>
      <div className="contro2" aria-hidden>
        <div className="c2-track">
          <i style={{ left: "30%", right: "5%" }} />
          <em className="low num" style={{ left: "30%" }}>3.0</em>
          <em className="mid num" style={{ left: "62%" }}>6.2<small>median</small></em>
          <em className="high num" style={{ left: "95%" }}>9.5</em>
        </div>
        <div className="rs-axis"><span>0</span><span>5</span><span>10</span></div>
      </div>
    </Moment>
  );
}

function TeamByResult() {
  const { edges } = usePrototype();
  const rows = [
    { label: "Wins", n: 12, v: 8.1, tone: "W" },
    { label: "Draws", n: edges.draws ? 2 : 0, v: edges.draws ? 7.4 : null, tone: "D" },
    { label: "Losses", n: edges.draws ? 2 : 4, v: 6.2, tone: "L" },
  ];
  return (
    <Moment id="result" accent="sky" question="Does the result change how fans rate the team?" title="Team Rating by Result" context={`Fan squad rating · ${RATED_FIXTURES} rated fixtures`}>
      <div className="result-tiles">
        {rows.map((r) => (
          <div key={r.label} className={`rtile ${r.tone}`}>
            <em className={`res ${r.tone}`}>{r.tone}</em>
            <strong className="num">{r.v === null ? "—" : r.v.toFixed(1)}</strong>
            <small>{r.v === null ? "No draws yet" : `${r.label} · ${r.n}`}</small>
          </div>
        ))}
      </div>
      <p className="answer-line">After wins, fans rate the squad <b className="num">{(8.1 - 6.2).toFixed(1)}</b> points higher than after losses.</p>
    </Moment>
  );
}

/* ---------- Manager ---------- */

function ManagerVsTeam() {
  const diff = MANAGER_SEASON - TEAM_SEASON;
  return (
    <Moment id="mvt" accent="blue" question="Do fans rate the manager above or below the players?" title="Manager vs Team" context={`Fan ratings · same ${RATED_FIXTURES} fixtures · ${SEASON}`}
      note="Team = average of all fan player ratings. Both figures use the same fixtures.">
      <div className="vs-pair">
        <div><small>Manager</small><strong className="num">{MANAGER_SEASON.toFixed(1)}</strong></div>
        <span className="vs">vs</span>
        <div><small>Team</small><strong className="num">{TEAM_SEASON.toFixed(1)}</strong></div>
      </div>
      <p className="answer-line center">Fans rate the manager <b className="num">{Math.abs(diff).toFixed(1)}</b> {diff < 0 ? "below" : "above"} the team</p>
    </Moment>
  );
}

function HomeAway() {
  const { edges } = usePrototype();
  const equal = edges.managerGap === "equal";
  const home = equal ? 7.7 : 7.2;
  const away = equal ? 7.7 : 6.4;
  return (
    <Moment id="venue" accent="sky" question="Is the manager rated differently home and away?" title="Manager: Home vs Away" context={`Fan manager rating · ${equal ? "5 home, 7 away" : "8 home, 8 away"} fixtures`}>
      <div className="vs-pair">
        <div><small><Img src="stadium.svg" w={16} h={16} />Home</small><strong className="num">{home.toFixed(1)}</strong></div>
        <span className="vs">vs</span>
        <div><small><Img src="plane.svg" w={18} h={16} />Away</small><strong className="num">{away.toFixed(1)}</strong></div>
      </div>
      <p className="answer-line center">{equal ? "No difference between home and away" : <>Home is <Delta value={home - away} /> higher than away</>}</p>
    </Moment>
  );
}

function ManagerTrend() {
  const { edges } = usePrototype();
  const lo = 5, hi = 7.5;
  const y = (v: number) => ((hi - v) / (hi - lo)) * 100;
  const first = MANAGER_TREND[0];
  const last = MANAGER_TREND[MANAGER_TREND.length - 1];
  return (
    <Moment id="mtrend" accent="violet" question="How has the manager's fan rating moved?" title="Manager Rating Trend" context={`Last ${MANAGER_TREND.length} fixtures · season average ${MANAGER_SEASON.toFixed(1)}`}>
      {edges.managerTrend === "none" && <div className="empty-state"><strong>No trend yet</strong><span>The trend appears once fans have rated the manager in a fixture.</span></div>}
      {edges.managerTrend === "one" && <div className="empty-state"><strong className="num">7.7</strong><span>Only one rated fixture so far (vs Inter, 1 Mar). A trend needs at least two.</span></div>}
      {edges.managerTrend === "many" && (
        <>
          <div className="answer">
            <strong className="answer-big">{last.value < first.value ? "Down" : "Up"} <span className="num">{Math.abs(last.value - first.value).toFixed(1)}</span> points</strong>
            <span className="answer-line">{first.value.toFixed(1)} {first.venue} {first.opp} → {last.value.toFixed(1)} {last.venue} {last.opp}</span>
          </div>
          <div className="mt-plot" role="img" aria-label={`Manager rating ${MANAGER_TREND.map((p) => `${p.venue} ${p.opp} ${p.value}`).join(", ")}. Season average ${MANAGER_SEASON}.`}>
            <span className="form-median" style={{ top: `calc(120px * ${y(MANAGER_SEASON) / 100})` }}><i>avg {MANAGER_SEASON.toFixed(1)}</i></span>
            {MANAGER_TREND.map((p) => (
              <div className="mt-col" key={p.date}>
                <div className="mt-track"><span className={`num ${p.value >= MANAGER_SEASON ? "above" : "below"}`} style={{ top: `${y(p.value)}%` }}>{p.value.toFixed(1)}</span></div>
                {/* Tight chart: crest + three-letter code (Michel, 5 Nov). Roomier cards use crest + full name. */}
                <TeamLogo name={p.opp} size={24} />
                <b title={`${p.venue} ${p.opp}`}>{p.venue} {p.code}</b>
                <small>{p.date}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </Moment>
  );
}

/* ---------- screen ---------- */

const CONTENT: Record<TabId, ReactNode> = {
  race: <SeasonMotmRace />,
  "fan-mood": (<><FanbaseMood /><FanConfidenceShift /><MostDivisive /></>),
  players: (<><RatingsByPosition /><WidestRange /></>),
  matches: (<><SeasonExtremes /><Controversial /><TeamByResult /></>),
  manager: (<><ManagerVsTeam /><HomeAway /><ManagerTrend /></>),
};

let lastIndex = -1;

export function Insights({ tab }: { tab: TabId }) {
  const router = useRouter();
  const active = useRef<HTMLAnchorElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const index = TABS.findIndex((t) => t.id === tab);
  const prev = TABS[index - 1];
  const next = TABS[index + 1];
  const { fixtures, edges } = usePrototype();
  const archived = edges.season === "archived";
  const nextHub = archived ? null : nextUpdate(fixtures);

  // Slide in from the side the fan is moving towards.
  const [dir] = useState(() => (index >= lastIndex ? "fwd" : "back"));

  useEffect(() => {
    lastIndex = index;
    active.current?.scrollIntoView({ inline: "center", block: "nearest" });
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView({ block: "start" });
  }, [tab, index]);

  return (
    <div className="insights">
      <header className="insights-bar">
        <Photo className="ib-photo" src="/photos/pitch-aerial.jpg" priority />
        <Link href="/club-hub" scroll={false} aria-label="Back to Club Hub" className="ib-back"><Img src="back.svg" w={15.5} h={11.5} /></Link>
        <div className="ib-title">
          <span className="ib-crest"><Img src="logo-sturm.png" size={30} /></span>
          <div>
            <h1>Insights</h1>
            <p>{CLUB} · {SEASON} · {archived ? "Season ended · final" : `${UPDATED.label}, ${UPDATED.date}`}</p>
            {nextHub && <p className="next-update">Updates when rating closes in <b className="num">{nextHub}</b></p>}
          </div>
        </div>
      </header>
      <nav className="tabs" aria-label="Insight categories">
        {TABS.map((t) => (
          <Link key={t.id} ref={t.id === tab ? active : undefined} href={`/club-hub/insights/${t.id}`} scroll={false} aria-current={t.id === tab ? "page" : undefined} className={t.id === tab ? "on" : ""}>{t.label}</Link>
        ))}
      </nav>
      <div
        className={`tab-panel ${dir}`}
        key={tab}
        onPointerDown={(e) => { if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(e.clientY - s.y) * 1.5) return;
          const to = dx < 0 ? next : prev;
          if (to) router.push(`/club-hub/insights/${to.id}`, { scroll: false });
        }}
      >
        {CONTENT[tab]}
        <div className="tab-foot">
          <div className="dots" aria-hidden>{TABS.map((t) => <i key={t.id} className={t.id === tab ? "on" : ""} />)}</div>
          {next ? (
            <Link className="next-tab" href={`/club-hub/insights/${next.id}`} scroll={false}>Next: {next.label}<Img src="chevron-right.svg" size={17.6} /></Link>
          ) : (
            <Link className="next-tab" href="/club-hub" scroll={false}>Back to Club Hub<Img src="chevron-right.svg" size={17.6} /></Link>
          )}
        </div>
      </div>
    </div>
  );
}
