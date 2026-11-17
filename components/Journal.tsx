"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  AGREEMENT, ALIGNED_WITHIN, BASELINE, CLUB, JOURNAL_MATCHES, JOURNAL_TABS, MIN_MATCHES, MY_PLAYERS, MY_POSITIONS, OPEN_MATCH,
  PLAYER_VS_FANS, RANGE_ALL, SEASON, STREAK, avg, fansManagerFor, FAN_MIN_RATINGS, kitOf, lineupFor, motmBoldest, motmByPosition, motmOutput, motmPicks, motmProfile, motmStandout, MOTM_MIN, patternOf, playerMatches, season, subsFor, type JournalMatch, type Result, type JournalTabId, type LineupRating, type MyPlayer,
} from "@/lib/journal";
import { RATED_FIXTURES } from "@/lib/data";
import { Crown, PosIcon, Skeleton } from "./Insights";
import { usePrototype } from "./Provider";
import { Delta, Img, Kit, Moment, NavGlyph, Photo, PlayerFilter, Sheet, TeamLogo, useSwap } from "./ui";

/**
 * One header photo per page, chosen for what the page is about (credits: public/photos/CREDITS.md).
 * Calm, uncrowded images only: busy crowds fight the title text.
 */
const JOURNAL_PHOTOS: Record<"home" | JournalTabId, { src: string; pos: string }> = {
  home: { src: "/photos/journal-home.jpg", pos: "center 18%" },
  motm: { src: "/photos/journal-motm.jpg", pos: "center 22%" },
  identity: { src: "/photos/journal-identity.jpg", pos: "center 70%" },
  "vs-fans": { src: "/photos/journal-vs-fans.jpg", pos: "center 35%" },
  manager: { src: "/photos/journal-manager.jpg", pos: "center 82%" },
  players: { src: "/photos/journal-players.jpg", pos: "center 60%" },
};

/*
 * My Journal = the user (green). Fans appear only as a labelled comparison (yellow).
 * Unlike Club Hub, everything here updates the moment the fan rates (Michel, 4 Nov).
 */

const f1 = (x: number) => x.toFixed(1);
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** Your rated matches, newest first. The open match joins the moment you rate it. */
export function useJournalMatches(): JournalMatch[] {
  const { fixtures, edges } = usePrototype();
  const openRated = Boolean(fixtures.find((f) => f.id === "open")?.youRated);
  const base = edges.journal === "new" ? JOURNAL_MATCHES.slice(0, 2) : JOURNAL_MATCHES;
  return openRated ? [OPEN_MATCH, ...base] : base;
}

/** Rate the open match, then go straight to its insights with the reveal (rating → patterns). */
export function useRateAndReveal() {
  const { rateFixture } = usePrototype();
  const router = useRouter();
  return () => {
    rateFixture("open");
    router.push("/my-journal/match/open?reveal=1", { scroll: false });
  };
}

export function YouPill({ value, label = "You" }: { value: number | null; label?: string }) {
  return (
    <span className="rating-pill you" aria-label={`${label}: ${value === null ? "no rating" : f1(value)}`}>
      <small aria-hidden>{label}</small>
      <b aria-hidden>{value === null ? "—" : f1(value)}</b>
    </span>
  );
}

export function FanPill({ value, live }: { value: number; live?: boolean }) {
  return (
    <span className="rating-pill fan" aria-label={`Fans${live ? " (live)" : ""}: ${f1(value)}`}>
      <small aria-hidden>Fans</small>
      <b aria-hidden>{f1(value)}</b>
    </span>
  );
}

export const label = (m: Pick<JournalMatch, "venue" | "opp">) => `${m.venue} ${m.opp}`;

/* ---------------- home ---------------- */

function JournalHeader({ rated, matched, compared }: { rated: number; matched: number; compared: number }) {
  return (
    <header className="j-header">
      <Photo className="hub-photo" src={JOURNAL_PHOTOS.home.src} position={JOURNAL_PHOTOS.home.pos} priority />
      <div className="hub-bar">
        <div className="hub-title"><NavGlyph name="book" size={20} /><span>My Journal</span></div>
      </div>
      <div className="club-row">
        <span className="club-avatar j-avatar"><Img src="avatar-user.png" size={60} /></span>
        <div className="club-id">
          <strong>Your season</strong>
          <span><TeamLogo name={CLUB} size={14} /> {CLUB} supporter · {SEASON}</span>
        </div>
      </div>
      <dl className="j-stats">
        <div><dt>Matches rated</dt><dd className="num">{rated}<small> of {RATED_FIXTURES + 1}</small></dd></div>
        <div><dt>Rating streak</dt><dd className="num">{Math.min(STREAK, rated)}<small> in a row</small></dd></div>
        <div><dt>MOTM with fans</dt><dd className="num">{matched}<small> of {compared}</small></dd></div>
      </dl>
      <p className="j-fresh"><i aria-hidden />Your Journal updates as soon as you rate</p>
    </header>
  );
}

/**
 * The match to rate, or the latest insights. Kept to one compact row (Warren, 9 Nov) so it supports
 * the Journal instead of competing with it.
 */
function MatchInsightsEntry({ matches }: { matches: JournalMatch[] }) {
  const { fixtures } = usePrototype();
  const rateAndReveal = useRateAndReveal();
  const open = fixtures.find((f) => f.id === "open");
  const latest = matches[0];

  if (open && !open.youRated) {
    return (
      <section className="j-entry compact prompt" aria-labelledby="j-entry-title">
        <TeamLogo name={open.home} size={30} />
        <div className="je-text">
          <b id="j-entry-title">Rate {open.home} {open.homeScore}–{open.awayScore}</b>
          <small><span className="je-open">Rating open</span> · closes in <b className="num">{open.remaining}</b></small>
        </div>
        <button className="btn primary je-btn" onClick={rateAndReveal}>Rate</button>
      </section>
    );
  }
  if (!latest) return null;
  return (
    <Link className="j-entry compact ready" href={`/my-journal/match/${latest.id}`} scroll={false} aria-labelledby="j-entry-title">
      <TeamLogo name={latest.opp} size={30} />
      <div className="je-text">
        <b id="j-entry-title">{latest.id === "open" && <span className="new-dot">New</span>}Your insights · {label(latest)}</b>
        <small>{latest.date} · {latest.score} {latest.result} · your top 3, vs your usual, how fans saw it</small>
      </div>
      <YouPill value={latest.you} />
      <Img src="chevron-right.svg" size={16} />
    </Link>
  );
}

function JournalRail({ matches, enough }: { matches: JournalMatch[]; enough: boolean }) {
  const s = season(matches);
  const sf = season(useSettled(matches).compared);
  const top = [...MY_PLAYERS].sort((a, b) => b.you - a.you)[0];
  const dash = "—";
  const tiles: { id: JournalTabId; accent: string; label: string; big: ReactNode; line: ReactNode; art?: ReactNode }[] = [
    { id: "motm", accent: "green", label: "MOTM Profile", big: enough ? <>{sf.motmMatched}<small>/{sf.rated}</small></> : dash, line: enough ? "MOTM picks that matched the fans" : `After ${MIN_MATCHES} rated matches` },
    { id: "identity", accent: "sky", label: "Rating Identity", big: enough ? f1(BASELINE.you) : dash, line: enough ? <>Your usual rating · fans {f1(BASELINE.fans)}</> : `After ${MIN_MATCHES} rated matches` },
    { id: "vs-fans", accent: "gold", label: "You vs Fans", big: enough ? <>{AGREEMENT.season}<small>%</small></> : dash, line: enough ? `of your ratings within ${ALIGNED_WITHIN} of fans` : `After ${MIN_MATCHES} rated matches` },
    { id: "manager", accent: "blue", label: "Manager & Team", big: enough ? <>{f1(s.managerAvg)}<small> / {f1(s.teamAvg)}</small></> : dash, line: enough ? "Your manager vs team rating" : `After ${MIN_MATCHES} rated matches` },
    { id: "players", accent: "violet", label: "Player Patterns", art: enough ? <span className="tile-art"><Kit no={top.no} size={52} /></span> : undefined, big: enough ? <span className="tile-name">{top.short}</span> : dash, line: enough ? <>Your top-rated player · {f1(top.you)}</> : `After ${MIN_MATCHES} rated matches` },
  ];
  return (
    <section aria-labelledby="j-rail-title">
      <div className="section-head">
        <div>
          <h2 id="j-rail-title">Your season insights</h2>
          <p className="section-sub">From your {s.rated} rated {s.rated === 1 ? "match" : "matches"} · {SEASON}</p>
        </div>
        <Link href="/my-journal/motm" scroll={false}>See all<Img src="arrow-up-right.svg" size={15} /></Link>
      </div>
      <ul className="rail">
        {tiles.map((t) => (
          <li key={t.id}>
            <Link href={`/my-journal/${t.id}`} scroll={false} className={`tile accent-${t.accent}`}>
              <span className="tile-label">{t.label}</span>
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

/** Small rating pill with a star: green = you, yellow = fans (same pattern as the line-up in Club Hub). */
function Xs({ who, value, provisional }: { who: "you" | "fan"; value: number; provisional?: boolean }) {
  return (
    <span className={`xs-pill ${who}`} aria-label={`${who === "you" ? "You" : provisional ? "Fans (live)" : "Fans"}: ${f1(value)}`}>
      <Img src={`star-xs-${who}.svg`} w={8} h={7.5} />{f1(value)}
    </span>
  );
}

/** While the match's rating window is open, the fans' numbers are provisional ("so far"). */
function useProvisional(m: JournalMatch) {
  const { fixtures } = usePrototype();
  const open = fixtures.find((f) => f.id === "open");
  return m.id === "open" && open?.status === "open" ? open.remaining ?? "" : null;
}

/**
 * Pitch rows, top to bottom: attack → midfield → defence → goalkeeper, as seen from behind your own goal (Michel, 12 Nov).
 * Each row is mirrored too, so right-sided players sit on the right (Salah on the right wing, Alexander-Arnold at right-back).
 */
const PITCH_ROWS = [[10, 9, 8], [7, 6, 5], [4, 3, 2, 1], [0]];
const POS_GROUPS: { pos: LineupRating["pos"]; label: string }[] = [
  { pos: "GK", label: "Goalkeeper" }, { pos: "DEF", label: "Defence" }, { pos: "MID", label: "Midfield" }, { pos: "FWD", label: "Attack" },
];

const noSubscribe = () => () => {};
/**
 * Review links (?lineup=pitch, ?players=all, ?dna=1) open a view straight away. Read after hydration so
 * the server render and the first client render match.
 */
function useReviewParam(key: string, value: string) {
  return useSyncExternalStore(noSubscribe, () => new URLSearchParams(window.location.search).get(key) === value, () => false);
}

/**
 * Player-by-player comparison for one rated match (Michel and Warren, 9 Nov): always available once
 * the user has rated. List view first (easiest to compare), pitch view one tap away.
 */
function LineupCompare({ m, focus }: { m: JournalMatch; focus?: DrillFocus | null }) {
  const pitchLink = useReviewParam("lineup", "pitch");
  const [picked, setView] = useState<"list" | "pitch" | null>(null);
  const view = picked ?? (pitchLink ? "pitch" : "list");
  const remaining = useProvisional(m);
  const prov = remaining !== null;
  // Opened from a player drill-down: that player's row carries the same numbers as the card you came from.
  const lineup = lineupFor(m).map((p) => (focus && p.short === focus.short ? { ...p, you: focus.you ?? p.you, fans: focus.fans ?? p.fans } : p));
  const subs = subsFor(m);
  const isGap = (you: number, fans: number) => Math.abs(you - fans) > ALIGNED_WITHIN + 1e-9;
  const aligned = lineup.filter((p) => !isGap(p.you, p.fans)).length;
  const big = [...lineup].sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans))[0];
  const fansLabel = "Fans";
  const row = (key: string, name: ReactNode, you: number, fans: number) => (
    <div className={`jl-tr${isGap(you, fans) ? " gap" : ""}${focus?.short === key ? " focus" : ""}`} role="row" key={key}>
      <span role="rowheader" className="jl-who">{name}</span>
      <span role="cell"><Xs who="you" value={you} /></span>
      <span role="cell"><Xs who="fan" value={fans} provisional={prov} /></span>
      <span role="cell"><Delta value={you - fans} /></span>
    </div>
  );
  return (
    <div className="jl">
      <div className="jl-top">
        <p className="jl-sum">You agreed with the fans{prov ? " so far" : ""} on <b className="num">{aligned}</b> of 11 · biggest gap <b>{big.short}</b> <Delta value={big.you - big.fans} /></p>
        <div className="jl-view" role="tablist" aria-label="Comparison view">
          <button role="tab" aria-selected={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")}>List</button>
          <button role="tab" aria-selected={view === "pitch"} className={view === "pitch" ? "on" : ""} onClick={() => setView("pitch")}>Pitch</button>
        </div>
      </div>
      {view === "list" ? (
        <div className="jl-list" role="table" aria-label={`Player by player: your rating and the fans'${prov ? " so far" : ""}`}>
          <div className="jl-tr head" role="row"><span role="columnheader">Player</span><span role="columnheader">You</span><span role="columnheader">{fansLabel}</span><span role="columnheader">Gap</span></div>
          {row("coach", <><span className="jl-coach" aria-hidden><Img src="tie-xs.svg" w={3.2} h={7.8} /></span>Head Coach</>, m.manager, fansManagerFor(m))}
          {POS_GROUPS.map((g) => (
            <div role="rowgroup" key={g.pos}>
              <div className="jl-group" role="row"><span role="columnheader">{g.label}</span></div>
              {lineup.filter((p) => p.pos === g.pos).map((p) => row(p.short, <><Kit no={p.no} size={22} keeper={p.pos === "GK"} />{p.short}</>, p.you, p.fans))}
            </div>
          ))}
          <div role="rowgroup">
            <div className="jl-group" role="row"><span role="columnheader">Subs</span></div>
            {subs.map((s) => row(s.short, <><Kit no={s.no} size={22} />{s.short}</>, s.you, s.fans))}
          </div>
        </div>
      ) : (
        <>
          <div className="manager-row jl-manager">
            <span className="manager-name"><Img src="tie-xs.svg" w={3.2} h={7.8} />Head Coach</span>
            <Xs who="you" value={m.manager} />
            <Xs who="fan" value={fansManagerFor(m)} provisional={prov} />
          </div>
          <div className="pitch jl-pitch" role="list" aria-label="Line-up: your rating and the fans' rating per player">
            {PITCH_ROWS.map((r, i) => (
              <div className={`pitch-row${r.length === 1 ? " solo" : ""}`} key={i}>
                {r.map((idx) => {
                  const p = lineup[idx];
                  return (
                    <div role="listitem" className={`player-card jl-card${isGap(p.you, p.fans) ? " gap" : ""}${focus?.short === p.short ? " focus" : ""}`} key={p.short}>
                      <Kit no={p.no} size={36} keeper={p.pos === "GK"} clearNo />
                      <span className="player-name">{p.short}</span>
                      <span className="jl-pills"><Xs who="you" value={p.you} /><Xs who="fan" value={p.fans} provisional={prov} /></span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="bench jl-bench">
            <h3>Subs</h3>
            <div className="bench-grid">
              {subs.map((s) => (
                <div className={`bench-player${isGap(s.you, s.fans) ? " gap" : ""}`} key={s.short}>
                  <span className="bench-name">{s.short}</span>
                  <span className="bench-ratings"><Xs who="you" value={s.you} /><Xs who="fan" value={s.fans} provisional={prov} /></span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <p className="jl-key"><span><i className="you" />You</span><span><i className="fan" />{fansLabel}</span>{prov ? <span className="pill-live">Live</span> : <span className="pill-final">Final</span>}<span><i className="gap" />More than {ALIGNED_WITHIN} apart</span></p>
    </div>
  );
}

function MatchCardJ({ m, open, onToggle, focus }: { m: JournalMatch; open: boolean; onToggle: () => void; focus?: DrillFocus | null }) {
  const remaining = useProvisional(m);
  const prov = remaining !== null;
  return (
    <li className={`jm-card${prov ? " prov" : ""}`}>
      <div className="jm-head">
        <TeamLogo name={m.opp} size={28} />
        <span className="jm-who">
          <b>{label(m)}</b>
          <small>{m.date} · {m.competition}</small>
        </span>
        <span className="jm-score"><span className="num">{m.score}</span><em className={`res ${m.result}`}>{m.result}</em></span>
        <YouPill value={m.you} />
        <span className="jm-fan"><FanPill value={m.fans} live={prov} />{prov ? <span className="pill-live">Live</span> : <span className="pill-final">Final</span>}</span>
      </div>
      {prov ? (
        <p className="jm-status prov"><span className="fx-live"><i className="live-dot" aria-hidden />Updating live as fans rate · final in <b className="num">{remaining}</b></span></p>
      ) : (
        <p className="jm-status final">Final fan rating · {m.fansRated} fans rated</p>
      )}
      <div className="jm-actions">
        <button className="jm-lineup" aria-expanded={open} aria-controls={`jl-${m.id}`} onClick={onToggle}>
          <span>Player by player: you vs the fans</span>
          <Img src="dropdown.svg" size={12} style={{ transform: open ? "rotate(180deg)" : undefined }} />
        </button>
        <Link className="jm-insights" href={`/my-journal/match/${m.id}`} scroll={false} aria-label={`Your match insights for ${label(m)}, ${m.date}`}>Insights<Img src="chevron-right.svg" size={14} /></Link>
      </div>
      <div id={`jl-${m.id}`} className={`expand${open ? " open" : ""}`}>
        <div>{open && <LineupCompare m={m} focus={focus} />}</div>
      </div>
    </li>
  );
}

function RatedMatches({ matches }: { matches: JournalMatch[] }) {
  const [all, setAll] = useState(false);
  // The newest match opens with its comparison, so it's there straight away (and follows a new rating).
  const [picked, setOpenId] = useState<string | null | undefined>(undefined);
  const openId = picked === undefined ? matches[0]?.id ?? null : picked;
  const shown = all ? matches : matches.slice(0, 6);
  return (
    <section aria-labelledby="j-matches-title">
      <div className="section-head">
        <div>
          <h2 id="j-matches-title">Your rated matches</h2>
          <p className="section-sub">Your team rating next to the fans&apos; · newest first</p>
        </div>
      </div>
      {matches.length === 0 ? (
        <div className="state-panel">
          <strong>No rated matches yet</strong>
          <span>Rate a match in Club Hub and it lands here straight away, with your match insights.</span>
          <Link className="btn secondary" href="/club-hub" scroll={false}>Go to Club Hub</Link>
        </div>
      ) : (
        <ul className="j-matches cards">
          {shown.map((m) => <MatchCardJ key={m.id} m={m} open={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} />)}
        </ul>
      )}
      {matches.length > 6 && (
        <button className="j-more" onClick={() => setAll(!all)} aria-expanded={all}>{all ? "Show fewer" : `Show all ${matches.length}`}</button>
      )}
    </section>
  );
}

/* ---------------- your player ratings (Michel + Warren, 9 Nov: easy to explore) ---------------- */

type RankSort = "you" | "fans" | "gap" | "motm";
const RANK_SORTS: { id: RankSort; label: string }[] = [
  { id: "you", label: "Your rating" },
  { id: "fans", label: "Fans' rating" },
  { id: "gap", label: "Biggest gap" },
  { id: "motm", label: "MOTM picks" },
];
const rankBy = (sort: RankSort) => (a: MyPlayer, b: MyPlayer) =>
  sort === "you" ? b.you - a.you : sort === "fans" ? b.fans - a.fans : sort === "gap" ? Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans) : b.myMotm - a.myMotm || b.you - a.you;

/**
 * Your season average minus the fans', spelled out so it can't be read as an MOTM count (Michel, 12 Nov):
 * "↑ 0.3 vs fans", "↓ 0.7 vs fans", "Same as fans".
 */
function VsFansGap({ value }: { value: number }) {
  const r = Math.round(value * 10) / 10;
  if (r === 0) return <span className="vs-gap level">Same as fans</span>;
  return (
    <span className={`vs-gap ${r > 0 ? "up" : "down"}`} aria-label={`${f1(Math.abs(r))} ${r > 0 ? "higher" : "lower"} than the fans`}>
      <i aria-hidden>{r > 0 ? "↑" : "↓"}</i>
      <b className="num">{f1(Math.abs(r))}</b> vs fans
    </span>
  );
}

function MyRatingRow({ p, rank }: { p: MyPlayer; rank: number }) {
  return (
    <div className="rating-row j-row-rating" role="row">
      <span className="rating-rank num">{rank}</span>
      <Kit no={p.no} size={40} keeper={p.pos === "GK"} />
      <div className="rating-who" role="rowheader">
        <strong>{p.name}</strong>
        <span className="motm-counts">
          <small className="pos">{p.pos}</small>
          <span className="count you" aria-label={`Your MOTM picks: ${p.myMotm}`}><Img src="cup-you.svg" size={12} />{p.myMotm}</span>
          <VsFansGap value={p.you - p.fans} />
        </span>
      </div>
      <span role="cell"><YouPill value={p.you} /></span>
      <span role="cell"><FanPill value={p.fans} /></span>
    </div>
  );
}

function SortChips({ value, onChange, label: aria }: { value: RankSort; onChange: (s: RankSort) => void; label: string }) {
  return (
    <div className="j-sort" role="group" aria-label={aria}>
      {RANK_SORTS.map((s) => <button key={s.id} aria-pressed={value === s.id} className={value === s.id ? "on" : ""} onClick={() => onChange(s.id)}>{s.label}</button>)}
    </div>
  );
}

function MyPlayerRatings({ matches }: { matches: JournalMatch[] }) {
  const { live, remaining } = useSettled(matches);
  const sheetLink = useReviewParam("players", "all");
  const [sheetPicked, setSheet] = useState<boolean | null>(null);
  const sheet = sheetPicked ?? sheetLink;
  const [sort, setSort] = useState<RankSort>("you");
  const [pos, setPos] = useState<string>("All");
  const byYou = [...MY_PLAYERS].sort(rankBy("you"));
  const top = byYou[0];
  const low = byYou[byYou.length - 1];
  const motm = [...MY_PLAYERS].sort(rankBy("motm"))[0];
  const s = season(matches);
  const ranked = [...MY_PLAYERS].sort(rankBy(sort));
  const inSheet = ranked.filter((p) => pos === "All" || p.pos === pos);
  const head = (
    <div className="rating-head j-head" role="row">
      <span role="columnheader">Player <i aria-hidden>·</i> <Img src="cup-you.svg" size={11} /> your MOTM picks · you vs fans</span>
      <span role="columnheader">You</span>
      <span role="columnheader">Fans</span>
    </div>
  );
  const cell = (kind: "top" | "low" | "motm", p: MyPlayer, icon: string, title: string, big: string, small: string) => (
    <div className={`j-tl-cell ${kind}`}>
      <span className="tl-label"><Img src={icon} size={12} />{title}</span>
      <Kit no={p.no} size={40} keeper={p.pos === "GK"} />
      <span className="j-tl-name">{p.short}</span>
      <b className="num">{big}</b>
      <small>{small}</small>
    </div>
  );
  return (
    <section aria-labelledby="j-ratings-title">
      <div className="section-head">
        <div>
          <h2 id="j-ratings-title">Your player ratings</h2>
          <p className="section-sub">Your season average · {s.rated} matches · {SEASON}</p>
        </div>
        <button onClick={() => setSheet(true)}>All {MY_PLAYERS.length} players<Img src="arrow-up-right.svg" size={15} /></button>
      </div>
      <SortChips value={sort} onChange={setSort} label="Rank players by" />
      <div className="rating-list" role="table" aria-label={`Your top three players by ${RANK_SORTS.find((x) => x.id === sort)!.label.toLowerCase()}`}>
        {head}
        {ranked.slice(0, 3).map((p, i) => <MyRatingRow key={p.name} p={p} rank={i + 1} />)}
      </div>
      <div className="j-tl" role="group" aria-label="Your highest rated, lowest rated and most picked player">
        {cell("top", top, "up-you.svg", "Highest rated", f1(top.you), `Fans ${f1(top.fans)}`)}
        {cell("low", low, "down-you.svg", "Lowest rated", f1(low.you), `Fans ${f1(low.fans)}`)}
        {cell("motm", motm, "cup-you.svg", "Most MOTM picks", String(motm.myMotm), `of ${s.rated} matches`)}
      </div>
      <p className="j-final-note">{live ? <>Includes {label(live)}: fans are still rating, so the fans&apos; numbers can change until the window closes in {remaining}.</> : <>Fans&apos; numbers are final once a match&apos;s rating window closes. A just-rated match shows straight away, marked Live until then.</>}</p>
      <Sheet open={sheet} onClose={() => setSheet(false)} label="Your player ratings">
        <div className="sheet-header">
          <div>
            <h2>Your player ratings</h2>
            <p>Your season average, with the fans&apos; for the same matches</p>
          </div>
          <button aria-label="Close" onClick={() => setSheet(false)}><Img src="close.svg" size={24} /></button>
        </div>
        <div className="j-sheet-filters">
          <SortChips value={sort} onChange={setSort} label="Sort players by" />
          <div className="j-sort pos" role="group" aria-label="Filter by position">
            {["All", "FWD", "MID", "DEF", "GK"].map((p) => <button key={p} aria-pressed={pos === p} className={pos === p ? "on" : ""} onClick={() => setPos(p)}>{p === "All" ? "All positions" : p}</button>)}
          </div>
        </div>
        <div className="sheet-list rating-list" role="table" aria-label="All players">
          {head}
          {pos === "All" && sort !== "motm" && sort !== "gap" && (
            <div className="rating-row j-row-rating" role="row">
              <span className="rating-rank num" />
              <span className="coach-badge" aria-hidden><Img src="tie.svg" w={10} h={24} /></span>
              <div className="rating-who" role="rowheader"><strong>Head Coach</strong><small>Manager</small></div>
              <span role="cell"><YouPill value={s.managerAvg} /></span>
              <span role="cell"><FanPill value={avg(matches.map(fansManagerFor))} /></span>
            </div>
          )}
          {inSheet.map((p, i) => <MyRatingRow key={p.name} p={p} rank={i + 1} />)}
          {inSheet.length === 0 && <div className="state-panel"><strong>No players here yet</strong><span>Rate this position in 5+ matches and it shows up.</span></div>}
        </div>
      </Sheet>
    </section>
  );
}

/* ---------------- your fan identity (Warren, 9 Nov: what your ratings say about you) ---------------- */

function fanIdentity(matches: JournalMatch[]) {
  const s = season(matches);
  const strictGap = BASELINE.you - BASELINE.fans;
  const strict = strictGap <= -0.15
    ? { judge: "A tough judge", chip: "Tougher than the fans" }
    : strictGap >= 0.15 ? { judge: "A generous judge", chip: "Kinder than the fans" } : { judge: "In step with the fans", chip: "Right with the fans" };
  const groups = [...MY_POSITIONS].sort((a, b) => b.you - a.you);
  const topG = groups[0], lowG = groups[groups.length - 1];
  const pos = topG.label === "Attack" ? { who: "backs the attack", chip: "Attack-minded" }
    : topG.label === "Midfield" ? { who: "values the midfield", chip: "Midfield purist" } : { who: "trusts the defence", chip: "Defence first" };
  const share = s.motmMatched / Math.max(1, s.rated);
  const motm = share >= 0.6 ? "In tune on MOTM" : share <= 0.4 ? "Your own MOTM mind" : "Sometimes your own pick";
  const w = s.result[0], l = s.result[2];
  const swing = w.you !== null && l.you !== null ? w.you - l.you : 0;
  const fanSwing = w.fans !== null && l.fans !== null ? w.fans - l.fans : 0;
  const result = swing - fanSwing >= 0.2 ? "Rides the result" : swing - fanSwing <= -0.2 ? "Steady whatever the score" : "Moved by results, like the fans";
  return {
    headline: strict.judge.startsWith("In step") ? `In step with the fans, and ${pos.who.replace("backs", "backing").replace("values", "valuing").replace("trusts", "trusting")}` : `${strict.judge} who ${pos.who}`,
    traits: [
      { title: strict.chip, ev: <>Your usual <b className="num">{f1(BASELINE.you)}</b> · fans <b className="num">{f1(BASELINE.fans)}</b></> },
      { title: pos.chip, ev: <>{topG.label} <b className="num">{f1(topG.you)}</b> · {lowG.label.toLowerCase()} <b className="num">{f1(lowG.you)}</b></> },
      { title: motm, ev: <><b className="num">{s.motmMatched}</b> of {s.rated} MOTM picks matched the fans</> },
      { title: result, ev: <><b className="num">+{f1(swing)}</b> after wins vs losses · fans +{f1(fanSwing)}</> },
    ],
  };
}

/* ---------------- Premium (Warren, 9 Nov: "Your Fan DNA") ---------------- */

export function PremiumBadge() {
  return (
    <span className="prem-badge">
      <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M12 2.5 14.9 8.6 21.5 9.4 16.6 14 17.9 20.6 12 17.3 6.1 20.6 7.4 14 2.5 9.4 9.1 8.6Z" fill="currentColor" /></svg>
      Premium
    </span>
  );
}

export function usePremiumCta() {
  const { showToast } = usePrototype();
  return useCallback(() => showToast("Premium comes after the free launch. This preview shows how it will be offered."), [showToast]);
}

/** Fan DNA only speaks once there's enough history to back a personal conclusion (Warren). */
export const DNA_MIN_MATCHES = 10;

/** The one free sentence that previews Fan DNA: where you part ways with the fanbase, both directions. */
function dnaLine() {
  const gaps = [...MY_PLAYERS].filter((p) => p.apps >= MIN_MATCHES).map((p) => ({ p, gap: p.you - p.fans }));
  const harsh = [...gaps].sort((a, b) => a.gap - b.gap)[0];
  const kind = [...gaps].sort((a, b) => b.gap - a.gap)[0];
  return { harsh, kind, text: `You're tougher on ${harsh.p.short} than most fans, but consistently rate ${kind.p.short} higher than the fanbase.` };
}

/** A personality scale: where you sit between two ends (0–100). */
function DnaScale({ left, right, at, note }: { left: string; right: string; at: number; note: ReactNode }) {
  return (
    <div className="dna-scale">
      <div className="dna-ends"><span>{left}</span><span>{right}</span></div>
      <div className="dna-track" aria-hidden><i style={{ left: `${Math.max(4, Math.min(96, at))}%` }} /></div>
      <p>{note}</p>
    </div>
  );
}

/**
 * What Premium's Fan DNA would contain: your rating personality, biggest disagreements with the fans,
 * how your opinions changed over the season. One item per section is shown in full; the rest is the offer.
 * Archetype names wait for Michel's "Rater archetype" document.
 */
function FanDnaSheet({ open, onClose, matches }: { open: boolean; onClose: () => void; matches: JournalMatch[] }) {
  const cta = usePremiumCta();
  const line = dnaLine();
  const disagree = [...MY_PLAYERS].filter((p) => p.apps >= MIN_MATCHES).sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans));
  const moved = [...MY_PLAYERS].sort((a, b) => Math.abs(b.last6[5].v - b.last6[0].v) - Math.abs(a.last6[5].v - a.last6[0].v))[0];
  const strictAt = 50 + (BASELINE.you - BASELINE.fans) * 100; // −0.2 → 30: towards "tough"
  return (
    <Sheet open={open} onClose={onClose} label="Your Fan DNA">
      <div className="sheet-header">
        <div>
          <h2><PremiumBadge /> Your Fan DNA</h2>
          <p>What makes you unique as a fan · from your {matches.length} rated matches</p>
        </div>
        <button aria-label="Close" onClick={onClose}><Img src="close.svg" size={24} /></button>
      </div>
      <div className="dna">
        <p className="dna-hero">{line.text}</p>

        <section className="dna-sec">
          <h3>Your rating personality</h3>
          <DnaScale left="Tough" right="Generous" at={strictAt} note={<>Your usual <b className="num">{f1(BASELINE.you)}</b> vs the fans&apos; <b className="num">{f1(BASELINE.fans)}</b>: a little tougher than most.</>} />
          <div className="prem-hidden" aria-hidden>
            <DnaScale left="Steady" right="Swings big" at={62} note="How far your ratings move from match to match." />
            <DnaScale left="With the crowd" right="Own mind" at={42} note="How often you land where the fanbase lands." />
          </div>
        </section>

        <section className="dna-sec">
          <h3>Your biggest disagreements with the fans</h3>
          <div className="dna-row">
            <Kit no={disagree[0].no} size={32} keeper={disagree[0].pos === "GK"} />
            <span><b>{disagree[0].short}</b><small>You {f1(disagree[0].you)} · fans {f1(disagree[0].fans)}</small></span>
            <Delta value={disagree[0].you - disagree[0].fans} />
          </div>
          <div className="prem-hidden" aria-hidden>
            {disagree.slice(1, 3).map((p) => (
              <div className="dna-row" key={p.name}>
                <Kit no={p.no} size={32} keeper={p.pos === "GK"} />
                <span><b>{p.short}</b><small>You {f1(p.you)} · fans {f1(p.fans)}</small></span>
                <Delta value={p.you - p.fans} />
              </div>
            ))}
          </div>
        </section>

        <section className="dna-sec">
          <h3>How your opinions changed this season</h3>
          <div className="prem-hidden" aria-hidden>
            <div className="dna-row">
              <Kit no={moved.no} size={32} keeper={moved.pos === "GK"} />
              <span><b>{moved.short}</b><small>{f1(moved.last6[0].v)} {moved.last6[0].label} → {f1(moved.last6[5].v)} {moved.last6[5].label}</small></span>
              <Delta value={moved.last6[5].v - moved.last6[0].v} />
            </div>
          </div>
        </section>

        <div className="dna-offer">
          <strong>See your full Fan DNA</strong>
          <span>Your complete rating personality, every big disagreement and how your views moved, season after season.</span>
          <button className="btn prem-cta block" onClick={cta}>Get Premium · after launch</button>
          <small>Free stays free: your fan identity, player ratings, line-ups and match insights.</small>
        </div>
      </div>
    </Sheet>
  );
}

/** Small Fan DNA preview inside the free identity card: one real sentence, then the offer. */
function FanDnaPreview({ matches }: { matches: JournalMatch[] }) {
  const dnaLink = useReviewParam("dna", "1");
  const [picked, setOpen] = useState<boolean | null>(null);
  const open = picked ?? dnaLink;
  if (matches.length < DNA_MIN_MATCHES) {
    return <p className="dna-wait"><PremiumBadge /> Your Fan DNA appears after {DNA_MIN_MATCHES} rated matches. You&apos;ve rated {matches.length}.</p>;
  }
  return (
    <>
      <button className="dna-preview" onClick={() => setOpen(true)}>
        <span className="dna-top"><PremiumBadge /><b>Your Fan DNA</b></span>
        <span className="dna-line">{dnaLine().text}</span>
        <span className="dna-more">See what makes you unique<Img src="chevron-right.svg" size={14} /></span>
      </button>
      <FanDnaSheet open={open} onClose={() => setOpen(false)} matches={matches} />
    </>
  );
}

function FanIdentity({ matches, enough }: { matches: JournalMatch[]; enough: boolean }) {
  const { edges } = usePrototype();
  const { compared } = useSettled(matches);
  if (!enough) return null;
  const id = fanIdentity(compared);
  return (
    <section className="j-identity" aria-labelledby="j-identity-title">
      <p className="j-identity-eyebrow">Your fan identity</p>
      <h2 id="j-identity-title">{id.headline}</h2>
      <ul className="j-traits">
        {id.traits.map((t) => <li key={t.title}><b>{t.title}</b><span>{t.ev}</span></li>)}
      </ul>
      <p className="j-identity-foot">From your {BASELINE.ratings} player ratings this season · it changes as you rate.</p>
      {edges.premium && <FanDnaPreview matches={matches} />}
    </section>
  );
}

export function JournalHome() {
  const { edges } = usePrototype();
  const matches = useJournalMatches();
  const s = season(matches);
  const sf = season(useSettled(matches).compared);
  const enough = s.rated >= MIN_MATCHES;
  return (
    <div className="journal page-in">
      <JournalHeader rated={s.rated} matched={sf.motmMatched} compared={sf.rated} />
      <div className="hub-content">
        <FanIdentity matches={matches} enough={enough} />
        <MatchInsightsEntry matches={matches} />
        {!enough && (
          <div className="state-panel j-early">
            <strong>Your fan identity is on its way</strong>
            <span>Your season patterns start after {MIN_MATCHES} rated matches. You&apos;ve rated {s.rated}, so {MIN_MATCHES - s.rated} more to go. Every match you rate still gets its own insights.</span>
            {edges.premium && <small className="dna-wait-inline"><PremiumBadge /> Fan DNA appears after {DNA_MIN_MATCHES} rated matches.</small>}
          </div>
        )}
        <JournalRail matches={matches} enough={enough} />
        {enough && <MyPlayerRatings matches={matches} />}
        <RatedMatches matches={matches} />
      </div>
    </div>
  );
}

/* ---------------- tabs: shared bits ---------------- */

const eligible = MY_PLAYERS.filter((p) => p.apps >= 5);
const playerOptions = (list: MyPlayer[]) => list.map((p) => ({ id: p.short, label: p.name, short: p.short, meta: `${p.apps} ratings` }));

function YouVsFans({ you, fans, youLabel = "You", fansLabel = "Fans" }: { you: number; fans: number; youLabel?: string; fansLabel?: string }) {
  return (
    <div className="vs-pair j-pair">
      <div className="you"><small>{youLabel}</small><strong className="num">{f1(you)}</strong></div>
      <span className="vs">vs</span>
      <div className="fans"><small>{fansLabel}</small><strong className="num">{f1(fans)}</strong></div>
    </div>
  );
}

const gapWords = (gap: number, unit = "") => {
  const r = Math.round(gap * 10) / 10;
  return r === 0 ? "the same as the fans" : `${f1(Math.abs(r))}${unit} ${r > 0 ? "above" : "below"} the fans`;
};

/* ---------------- Live / Final for fan comparisons (Michel + Warren, 10 Nov) ---------------- */

/**
 * Journal cards update the moment you rate. Cards that compare you with the fans include the just-rated match
 * straight away, with a subtle note that the fans' side can still change until its rating window closes.
 * Cards built only from your own ratings need no note.
 */
function useSettled(matches: JournalMatch[]) {
  const { fixtures } = usePrototype();
  const open = fixtures.find((f) => f.id === "open");
  const live = open?.status === "open" ? matches.find((m) => m.id === "open") ?? null : null;
  return { compared: matches, live, remaining: live ? open?.remaining ?? "" : null };
}

function SettledLine({ live, remaining, count }: { live: JournalMatch | null; remaining: string | null; count: number }) {
  if (live) {
    return (
      <p className="j-settled is-live">
        <span className="pill-live">Live</span>
        <span>Includes {label(live)}. Your ratings are in, but fans are still rating, so this can change until the window closes in <b className="num">{remaining}</b>.</span>
      </p>
    );
  }
  return (
    <p className="j-settled">
      <span className="pill-final">Final</span>
      <span>All {count} matches final · same matches for you and the fans</span>
    </p>
  );
}

/** A short personal takeaway under the numbers: what they say about you (Warren, 10 Nov). */
function Takeaway({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="j-takeaway">
      <small>What this says about you</small>
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  );
}

/* ---------------- MOTM Profile (11 Nov): podium on top, then two sets of cards you swipe through ---------------- */

const times = (n: number) => (n === 1 ? "once" : n === 2 ? "twice" : `${n} times`);

/** Review links that carry a value (?motm=Salah, ?differ=1, ?results=two). Read after hydration. */
function useReviewValue(key: string) {
  return useSyncExternalStore(noSubscribe, () => new URLSearchParams(window.location.search).get(key), () => null);
}

/* ---------------- Drill-downs (Warren + Michel, 13 Nov): insight → the fixtures behind it → one match ---------------- */

/**
 * A view's state kept in the URL (?result=W, ?differ=Salah) without a reload, so Back from a match lands on the
 * same sheet with the same filter still selected.
 */
function useUrlParam(key: string): [string | null, (v: string | null) => void] {
  const params = useSearchParams();
  const pathname = usePathname();
  // Sheets open after hydration only (they portal into the phone), so the server render and the first client render match.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const set = useCallback((v: string | null) => {
    const q = new URLSearchParams(window.location.search);
    if (v) q.set(key, v);
    else q.delete(key);
    const s = q.toString();
    window.history.replaceState(null, "", `${pathname}${s ? `?${s}` : ""}`);
  }, [key, pathname]);
  return [hydrated ? params.get(key) : null, set];
}

const RESULT_TITLE = { W: "Wins", D: "Draws", L: "Losses" } as const;
const matchOn = (date: string) => JOURNAL_MATCHES.find((m) => m.date === date) ?? null;
/** "Salah vs Man City, 12 Jan" / "@ Betis, 24 Oct" → the date, and the player's name when it leads. */
const atParts = (at: string) => {
  const [who, date] = at.split(", ");
  return { date, player: who.split(/ (?:vs|@) /)[0].replace(/^(vs|@).*/, "") || null };
};

/** Set when a match is opened from a drill-down in this visit, so Back steps back (same scroll, same sheet). */
let drillOpened = false;

/** One fixture behind an insight: opens that match's rated-match detail. `from` = "kind:value" for the way back. */
function DrillLink({ m, from, className, label: aria, children }: { m: JournalMatch; from: string; className?: string; label: string; children: ReactNode }) {
  return (
    <Link className={className} href={`/my-journal/rated/${m.id}?from=${encodeURIComponent(from)}`} onClick={() => { drillOpened = true; }} aria-label={aria}>
      {children}
    </Link>
  );
}

/** Where a drill-down started: the Back link and its label. */
function drillBack(from: string | null) {
  const [kind, v = ""] = (from ?? "").split(":");
  const q = encodeURIComponent(v);
  if (kind === "result" && v in RESULT_TITLE) return { href: `/my-journal/manager?result=${v}`, label: `${RESULT_TITLE[v as Result]} · Rating by Result` };
  if (kind === "differ" && v) return { href: `/my-journal/vs-fans?differ=${q}`, label: `${v} · Where You Differ` };
  if (kind === "range") return { href: `/my-journal/identity${v ? `?range=${q}` : ""}`, label: v ? `${v} · Your Rating Range` : "Your Rating Range" };
  if (kind === "motm" && v) return { href: `/my-journal/motm?motm=${q}`, label: `${v} · Your MOTM Picks` };
  return { href: "/my-journal", label: "My Journal" };
}

type DrillFocus = { short: string; you?: number; fans?: number; line: ReactNode };

/** What brought you to this match, in one line, and the player to highlight in the line-up. */
function drillFocus(from: string | null, m: JournalMatch, matches: JournalMatch[]): DrillFocus | { short: ""; line: ReactNode } | null {
  const [kind, v = ""] = (from ?? "").split(":");
  if (kind === "result") {
    const group = matches.filter((x) => x.result === m.result);
    const sorted = [...group].sort((a, b) => b.you - a.you);
    const rank = group.length > 1 ? (sorted[0] === m ? "Your highest-rated" : sorted[sorted.length - 1] === m ? "Your lowest-rated" : null) : null;
    const word = RESULT_ONE[m.result];
    return {
      short: "",
      line: <>{rank ? <>{rank} {word}</> : <>One of your {group.length} {RESULT_WORD[m.result]}</>}: you gave the team <b className="num">{f1(m.you)}</b>, against your <b className="num">{f1(avg(group.map((x) => x.you)))}</b> average after {RESULT_WORD[m.result]}.</>,
    };
  }
  const p = MY_PLAYERS.find((x) => x.short === v);
  if (kind === "differ" && p) {
    const r = playerMatches(p).find((x) => x.date === m.date);
    if (!r) return null;
    return { short: p.short, you: r.you, fans: r.fans, line: <>{p.short} in this match: <b className="num">{f1(r.you)}</b> from you, <b className="num j-fan">{f1(r.fans)}</b> from the fans.</> };
  }
  if (kind === "range") {
    const low = p ? { at: p.lowAt, v: p.low } : { at: RANGE_ALL.lowAt, v: RANGE_ALL.low };
    const high = p ? { at: p.highAt, v: p.high } : { at: RANGE_ALL.highAt, v: RANGE_ALL.high };
    const end = atParts(low.at).date === m.date ? { ...low, word: "lowest" } : { ...high, word: "highest" };
    const who = p?.short ?? atParts(end.at).player ?? "";
    return { short: who, you: end.v, line: <>Your {end.word} rating{p ? ` for ${p.short}` : ""} this season: <b className="num">{f1(end.v)}</b>{p ? "" : ` for ${who}`}.</> };
  }
  if (kind === "motm" && v) {
    const rating = lineupFor(m).find((x) => x.short === v)?.you;
    return { short: v, line: <>You named {v} your Man of the Match{rating !== undefined && <> and gave him <b className="num">{f1(rating)}</b></>}.{m.fanMotm === v ? " The fans picked him too." : ` The fans went with ${m.fanMotm}.`}</> };
  }
  return null;
}

/**
 * The third level of a drill-down: the match's existing rated-match detail (score, your team rating vs the fans',
 * player by player). Back returns to the sheet or card you came from, with the same filter still selected.
 */
export function RatedMatchPage({ id, from }: { id: string; from: string | null }) {
  const router = useRouter();
  const matches = useJournalMatches();
  const [open, setOpen] = useState(true);
  const m = matches.find((x) => x.id === id);
  const back = drillBack(from);
  const goBack = (e: React.MouseEvent) => {
    if (!drillOpened) return;
    e.preventDefault();
    drillOpened = false;
    router.back();
  };
  const focus = m ? drillFocus(from, m, matches) : null;
  return (
    <div className="journal rm page-in">
      <header className="rm-bar">
        <Link href={back.href} className="rm-back" aria-label={`Back to ${back.label}`} onClick={goBack} scroll={false}>
          <Img src="back.svg" w={15.5} h={11.5} />
        </Link>
        <div className="rm-title">
          <small>{back.label}</small>
          <h1>{m ? <>{label(m)} · {m.date}</> : "Match"}</h1>
        </div>
      </header>
      <div className="hub-content">
        {!m ? (
          <div className="state-panel">
            <strong>This match isn&apos;t in your Journal</strong>
            <span>Only matches you&apos;ve rated have a detail page.</span>
          </div>
        ) : (
          <>
            {focus && <p className="rm-why">{focus.line}</p>}
            <ul className="j-matches cards">
              <MatchCardJ m={m} open={open} onToggle={() => setOpen(!open)} focus={focus && focus.short ? (focus as DrillFocus) : null} />
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Related cards you swipe through, so the MOTM Profile doesn't become a long scroll (Michel, 10 Nov).
 * The review link ?sets=open stacks every card for the Figma spec.
 */
function SwipeSet({ id, title, sub, cards }: { id: string; title: string; sub: string; cards: { key: string; node: ReactNode }[] }) {
  const open = useReviewParam("sets", "open");
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const step = (el: HTMLDivElement) => el.clientWidth + 12;
  // The carousel takes the height of the card on screen, so a short card never leaves a gap under it.
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = track.current?.children[at];
    if (open || !el) return;
    const ro = new ResizeObserver(() => setHeight((el as HTMLElement).offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [at, open]);
  // Review link ?card=split,standout opens a set on that card (e.g. to show a card's Live line in a Figma frame).
  const linked = useReviewValue("card");
  const start = linked ? cards.findIndex((c) => linked.split(",").includes(c.key)) : -1;
  useEffect(() => {
    const el = track.current;
    if (open || !el || start <= 0) return;
    el.scrollTo({ left: start * step(el), behavior: "instant" });
  }, [open, start]);
  const go = (i: number) => track.current?.scrollTo({ left: i * step(track.current), behavior: "smooth" });
  return (
    <section className={`j-set${open ? " open" : ""}`} aria-labelledby={`${id}-title`} aria-roledescription="carousel">
      <div className="j-set-head">
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{sub}</p>
        </div>
        {!open && <span className="j-set-count num" aria-live="polite">{at + 1} / {cards.length}</span>}
      </div>
      <div
        className="j-set-track"
        ref={track}
        style={!open && height ? { height } : undefined}
        onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / step(e.currentTarget)))}
        // Swiping cards must not also swipe to the next Journal tab.
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      >
        {cards.map((c, i) => <div className="j-set-slide" key={c.key} aria-roledescription="slide" aria-label={`${i + 1} of ${cards.length}`}>{c.node}</div>)}
      </div>
      {!open && (
        <div className="j-set-dots">
          {cards.map((c, i) => <button key={c.key} aria-label={`Show card ${i + 1} of ${cards.length}`} aria-current={i === at} className={i === at ? "on" : ""} onClick={() => go(i)} />)}
        </div>
      )}
    </section>
  );
}

/** Block height by rank: the leader is always clearly the tallest, then 2nd, then 3rd (Michel, 10 Nov). */
const STEP_H = [0, 150, 122, 102];

/** Fixed at the top: who you name MOTM and how highly you rate them, with the player filter (Michel, 10 Nov). */
function MyMotmPicks({ matches }: { matches: JournalMatch[] }) {
  const { playerFilter, setPlayerFilter } = usePrototype();
  const linked = useReviewValue("motm");
  const data = motmPicks(matches);
  const options = data.players.filter((p) => p.picks >= MOTM_MIN.filter).map((p) => ({ id: p.short, label: p.short, short: p.short, meta: `${p.picks} picks` }));
  const value = playerFilter.jmotm ?? (linked && options.some((o) => o.id === linked) ? linked : "all");
  const { shown, loading } = useSwap(value);
  const sel = data.players.find((p) => p.short === shown && p.picks >= MOTM_MIN.filter);
  const ranked = data.players;
  if (ranked.length < 2) return null;
  const rankOf = (picks: number) => 1 + ranked.filter((q) => q.picks > picks).length;
  const top = ranked.slice(0, 3).map((x) => ({ ...x, rank: rankOf(x.picks), kit: kitOf(x.short) }));
  const order = [top[1], top[0], top[2]].filter(Boolean);
  const tie = top[1].picks === top[0].picks;
  const k = sel ? kitOf(sel.short) : null;
  return (
    <Moment id="picks" accent="gold" question="Who do you name MOTM, and how highly do you rate them?" title="Your MOTM Picks"
      context={sel ? `${sel.short} · your Man of the Match ${times(sel.picks)} · ${SEASON}` : `Your Man of the Match in ${data.n} matches · ${SEASON}`}
      filter={<PlayerFilter label="Player" options={options} value={value} onChange={(id) => setPlayerFilter("jmotm", id)} />}
      note={<>Avg rating = the rating you gave your MOTM in that match. The filter lists players you&apos;ve picked {MOTM_MIN.filter}+ times.</>}>
      {loading ? <Skeleton rows={3} /> : sel ? (
        <div className="swap-in j-stack">
          <div className="div-hero">
            {k && <Kit no={k.no} size={56} keeper={k.keeper} />}
            <div><strong className="answer-big">{sel.short}</strong></div>
          </div>
          <div className="mp-stats">
            <div><strong className="num">{sel.picks}</strong><small>MOTM picks</small></div>
            <div><strong className="num">{f1(sel.avg)}</strong><small>avg rating</small></div>
            <div><strong className="num">{sel.matched}<small>/{sel.picks}</small></strong><small>fans picked him too</small></div>
          </div>
          <div className="j-table" role="table" aria-label={`The matches you named ${sel.short} MOTM`}>
            <div className="j-tr head mp-tr" role="row"><span role="columnheader">Match</span><span role="columnheader">Your rating</span><span role="columnheader">Fans&apos; MOTM</span><span aria-hidden /></div>
            {sel.matches.map((m, i) => (
              <DrillLink key={m.id} m={m} from={`motm:${sel.short}`} className="j-tr mp-tr j-tr-link" label={`${label(m)}, ${m.date}: you gave ${sel.short} ${f1(sel.ratings[i])}. Fans' MOTM: ${m.fanMotm}. Open the match`}>
                <span role="cell" className="j-fx"><b>{label(m)}</b><small>{m.date}</small></span>
                <span role="cell"><Xs who="you" value={sel.ratings[i]} /></span>
                <span role="cell" className={`j-pick fan${m.fanMotm === sel.short ? " same" : ""}`}>{m.fanMotm === sel.short ? <>Same<i> ✓</i></> : m.fanMotm}</span>
                <span aria-hidden className="j-go"><Img src="chevron-right.svg" size={14} /></span>
              </DrillLink>
            ))}
          </div>
          <p className="moment-note"><Img src="info.svg" size={12} />Tap a match to open it.</p>
        </div>
      ) : (
        <div className="swap-in j-stack">
          <div className="answer">
            <strong className="answer-big">Avg <span className="num">{f1(data.avg)}</span></strong>
            <span className="answer-line">is what your MOTM picks get from you. {tie ? <>{top[0].short} and {top[1].short} are level on <b className="num">{top[0].picks}</b> picks.</> : <><b>{top[0].short}</b> leads with <b className="num">{top[0].picks}</b> picks.</>}</span>
          </div>
          <div className="podium compact" role="group" aria-label="Your three most picked players. Tap one to see the matches you picked him">
            {order.map((x) => (
              <button key={x.short} disabled={x.picks < MOTM_MIN.filter} onClick={() => setPlayerFilter("jmotm", x.short)} aria-label={`${x.rank === 1 && tie ? "Joint 1st" : `No. ${x.rank}`}: ${x.short}, ${x.picks} picks, average ${f1(x.avg)}. Show the matches`} className={`step r${x.rank}`} style={{ ["--h" as string]: `${STEP_H[x.rank]}px` }}>
                <span className="step-kit">
                  {x.rank === 1 && <Crown />}
                  {x.kit && <Kit no={x.kit.no} size={x.rank === 1 ? 56 : 42} keeper={x.kit.keeper} />}
                </span>
                <span className="step-name">{x.short}</span>
                <span className="step-block">
                  <strong className="num">{x.picks}</strong>
                  <small>picks</small>
                  <span className="step-avg">avg <b className="num">{f1(x.avg)}</b></span>
                  <span className="medal">{x.rank === 1 && tie ? "=1" : x.rank}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="movers-key"><span>Tap a player to see the matches you picked him</span></p>
        </div>
      )}
    </Moment>
  );
}

/** Big moment: the MOTM call the fewest fans agreed with (Warren, 10 Nov). */
function MotmBoldest({ matches }: { matches: JournalMatch[] }) {
  const { live, remaining } = useSettled(matches);
  const b = motmBoldest(matches);
  const k = b ? kitOf(b.myMotm) : null;
  return (
    <Moment id="boldest" accent="coral" question="What was your boldest MOTM call?" title="Your Boldest Call"
      context={`Your MOTM vs the fans' votes · ${matches.length} matches · ${SEASON}`}
      note={<>Share of fans who named the same MOTM as you in that match. Only matches with {MOTM_MIN.boldVotes}+ fan votes count.</>}>
      {b ? (
        <>
          <div className="bold-hero">
            {k && <Kit no={k.no} size={72} keeper={k.keeper} />}
            <div>
              <strong className="answer-big">{b.myMotm}</strong>
              <span className="answer-line">{label(b)} · {b.date} · {b.score} {b.result}</span>
            </div>
          </div>
          <p className="bold-line">Only <b className="num">{b.fanMotmShare}%</b> of fans agreed with you</p>
          <div className="bold-waffle" role="img" aria-label={`${b.fanMotmShare} in every 100 fans also picked ${b.myMotm}`}>
            {Array.from({ length: 100 }, (_, i) => <i key={i} className={i < b.fanMotmShare ? "on" : ""} />)}
          </div>
          <p className="answer-line">Most fans went with <b>{b.fanMotm}</b>. <span className="num">{b.fansRated}</span> fans rated this match.</p>
          {live?.id === b.id && <SettledLine live={live} remaining={remaining} count={matches.length} />}
        </>
      ) : <p className="answer-line">Shows once a match you rated has {MOTM_MIN.boldVotes}+ fan MOTM votes.</p>}
    </Moment>
  );
}

/** Main split insight: the pair of players you and the fans keep splitting on, whichever side picked whom. */
function MotmSplit({ matches }: { matches: JournalMatch[] }) {
  const { compared, live, remaining } = useSettled(matches);
  const p = motmProfile(compared);
  const pair = p.topPair;
  const youPicked = (name: string) => (pair ? pair.matches.filter((m) => m.myMotm === name).length : 0);
  const [left, right] = pair ? (youPicked(pair.a) >= youPicked(pair.b) ? [pair.a, pair.b] : [pair.b, pair.a]) : ["", ""];
  const kl = kitOf(left), kr = kitOf(right);
  return (
    <Moment id="split" accent="green" question="Which MOTM call do you and the fans keep splitting on?" title="Your MOTM Split"
      context={`When your MOTM and the fans' were different · ${p.n} matches · ${SEASON}`}
      note={<>A split = you and the fans named different players. The pair counts either way round. Shown once the same pair splits {MOTM_MIN.pair}+ times.</>}>
      {pair ? (
        <>
          <div className="answer">
            <strong className="answer-big">{left} vs {right}</strong>
            <span className="answer-line">Your most common MOTM split: <b className="num">{pair.n}</b> of your <b className="num">{p.splits.length}</b> splits</span>
          </div>
          <div className="split-face" role="img" aria-label={`${left} and ${right}: you and the fans split on them ${times(pair.n)}`}>
            <div className="sf-side">
              <span className="sf-kit l">{kl && <Kit no={kl.no} size={64} keeper={kl.keeper} />}</span>
              <b>{left}</b>
              <small>Your pick <span className="num">{youPicked(left)}</span> · fans&apos; <span className="num">{pair.n - youPicked(left)}</span></small>
            </div>
            <div className="sf-mid"><strong className="num">{pair.n}</strong><small>splits</small></div>
            <div className="sf-side">
              <span className="sf-kit r">{kr && <Kit no={kr.no} size={64} keeper={kr.keeper} />}</span>
              <b>{right}</b>
              <small>Your pick <span className="num">{youPicked(right)}</span> · fans&apos; <span className="num">{pair.n - youPicked(right)}</span></small>
            </div>
          </div>
          <div className="j-table" role="table" aria-label={`The matches where you split on ${left} and ${right}`}>
            <div className="j-tr head" role="row"><span role="columnheader">Match</span><span role="columnheader">You</span><span role="columnheader">Fans</span></div>
            {pair.matches.map((m) => {
              const isLive = live?.id === m.id;
              return (
                <div className={`j-tr${isLive ? " is-live" : ""}`} role="row" key={m.id}>
                  <span role="cell" className="j-fx"><b>{label(m)}</b><small>{isLive ? <><span className="pill-live">Live</span> fans still rating</> : m.date}</small></span>
                  <span role="cell" className="j-pick you">{m.myMotm}</span>
                  <span role="cell" className="j-pick fan">{m.fanMotm}{isLive && <i> so far</i>}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="state-panel j-early">
          <strong>No regular split yet</strong>
          <span>
            Your most common split shows once the same two players split you and the fans {MOTM_MIN.pair} times.
            {p.closestPair && <> Closest so far: {p.closestPair.a} vs {p.closestPair.b}, {times(p.closestPair.n)}.</>}
          </span>
        </div>
      )}
      <SettledLine live={live} remaining={remaining} count={p.n} />
    </Moment>
  );
}

/** Lowest MOTM agreement by fan pick: the fans' MOTM you're least likely to back too. */
function MotmAgreement({ matches }: { matches: JournalMatch[] }) {
  const { compared, live, remaining } = useSettled(matches);
  const p = motmProfile(compared);
  const low = p.lowest;
  const k = low ? kitOf(low.name) : null;
  const chrono = [...compared].reverse();
  return (
    <Moment id="agreement" accent="sky" question="When do you disagree most with the fans' MOTM?" title="Where You Disagree Most"
      context={`Your MOTM vs the fans' · ${p.n} matches · ${SEASON}`}
      note={<>For each player the fans named MOTM: how often you picked him too. Players need {MOTM_MIN.fanPick}+ matches as the fans&apos; MOTM.</>}>
      {low ? (
        <div className="j-stack">
          <div className="div-hero">
            {k && <Kit no={k.no} size={52} keeper={k.keeper} />}
            <div><strong className="answer-big">{low.name}</strong></div>
          </div>
          <p className="answer-line">You disagree most when <b>{low.name}</b> is the fans&apos; MOTM. You picked him too in only <b className="num">{low.agreed} of {low.n}</b> of those matches.</p>
        </div>
      ) : (
        <p className="answer-line">This shows once at least two players have been the fans&apos; MOTM {MOTM_MIN.fanPick}+ times.</p>
      )}
      <div className="j-table j-fanpick" role="table" aria-label="How often you agreed, by the fans' MOTM">
        <div className="j-tr head" role="row"><span role="columnheader">When the fans&apos; MOTM was</span><span role="columnheader">Matches</span><span role="columnheader">You agreed</span></div>
        {p.byFanPick.map((e) => {
          const ok = e.n >= MOTM_MIN.fanPick;
          return (
            <div className={`j-tr${low && e.name === low.name ? " low" : ""}${ok ? "" : " few"}`} role="row" key={e.name}>
              <span role="cell" className="j-fx"><b>{e.name}</b></span>
              <span role="cell" className="num">{e.n}</span>
              <span role="cell">{ok ? <><b className="num">{e.agreed} of {e.n}</b> <small className="num">{Math.round((e.agreed / e.n) * 100)}%</small></> : <small>Needs {MOTM_MIN.fanPick}+</small>}</span>
            </div>
          );
        })}
      </div>
      <div className="j-overall">
        <p className="answer-line">Overall you picked the same MOTM as the fans <b className="num">{p.matched} of {p.n}</b> times</p>
        <ol className="j-dots" style={{ gridTemplateColumns: `repeat(${Math.max(13, chrono.length)}, 1fr)` }} aria-label={`Match by match, oldest first: ${chrono.map((m) => `${label(m)} ${m.myMotm === m.fanMotm ? "same" : "different"}`).join(", ")}`}>
          {chrono.map((m) => <li key={m.id} className={m.myMotm === m.fanMotm ? "same" : "diff"} title={`${label(m)}, ${m.date}: you ${m.myMotm}, fans ${m.fanMotm}`}>{m.myMotm === m.fanMotm ? "✓" : ""}</li>)}
        </ol>
        <p className="j-dots-key"><span><i className="same" />Same pick</span><span><i className="diff" />Different</span><span>Oldest → newest</span></p>
      </div>
      <SettledLine live={live} remaining={remaining} count={p.n} />
    </Moment>
  );
}

/** MOTM Picks by Position (TechAhead's original card, brought back by Michel). Your own picks only. */
function MotmByPosition({ matches }: { matches: JournalMatch[] }) {
  const rows = motmByPosition(matches);
  const n = matches.length;
  const top = [...rows].sort((a, b) => b.n - a.n)[0];
  return (
    <Moment id="bypos" accent="green" question="Which positions get your MOTM?" title="MOTM Picks by Position"
      context={`Your Man of the Match in ${n} matches · ${SEASON}`}>
      <div className="answer">
        <strong className="answer-big">{top.label} first</strong>
        <span className="answer-line"><b className="num">{top.n} of {n}</b> of your MOTM picks were {top.pos === "GK" ? "goalkeepers" : `in ${top.label.toLowerCase()}`}</span>
      </div>
      <ul className="pos-list" aria-label="Your MOTM picks by position">
        {rows.map((r) => (
          <li key={r.pos}>
            <span className="pos-name">{r.label}</span>
            <b className="num">{r.n}</b>
            <span className="pos-share num">{Math.round((r.n / Math.max(1, n)) * 100)}%</span>
            <span className="pos-bar" aria-hidden><i style={{ width: `${(r.n / Math.max(1, top.n)) * 100}%` }} /></span>
          </li>
        ))}
      </ul>
    </Moment>
  );
}

const GA_PARTS = [
  { k: "goal", label: "Goal" },
  { k: "assist", label: "Assist" },
  { k: "both", label: "Both" },
  { k: "none", label: "Neither" },
] as const;

/** How often your MOTM scores or assists, with the rating impact as a smaller supporting line. */
function MotmOutput({ matches }: { matches: JournalMatch[] }) {
  const o = motmOutput(matches);
  if (!o.n) return null;
  const pct = Math.round((o.withGA / o.n) * 100);
  return (
    <Moment id="output" accent="gold" question="How often does your MOTM score or assist?" title="Goals & Assists"
      context={`Your MOTM in ${o.n} matches · ${SEASON}`}
      note={<>From match data: goals and assists per player. If an assist wasn&apos;t recorded, that pick counts as a goal only. Rating impact needs {MOTM_MIN.impact}+ picks on each side.</>}>
      <div className="answer">
        <strong className="answer-big"><span className="num">{pct}%</span></strong>
        <span className="answer-line">of your MOTM picks recorded a goal or assist · <b className="num">{o.withGA} of {o.n}</b></span>
      </div>
      <div className="ga-bar" aria-hidden>
        {GA_PARTS.map((g) => (o.parts[g.k] ? <i key={g.k} className={`ga-${g.k}`} style={{ flexGrow: o.parts[g.k] }} /> : null))}
      </div>
      <ul className="ga-key" aria-label="What your MOTM did">
        {GA_PARTS.map((g) => <li key={g.k}><i className={`ga-${g.k}`} />{g.label}<b className="num">{o.parts[g.k]}</b></li>)}
      </ul>
      {o.impact && (
        <p className="ga-impact">
          <span className="ga-impact-tag">Rating impact</span>
          <span>Your MOTM picks average <b className="num">{f1(o.impact.with)}</b> with a goal or assist, versus <b className="num">{f1(o.impact.without)}</b> without one.</span>
        </p>
      )}
    </Moment>
  );
}

const sign1 = (v: number) => `${v >= 0 ? "+" : "−"}${f1(Math.abs(v))}`;

/**
 * MOTM Standout Factor (Michel + Warren, 11 Nov): how far your MOTM stands above your next-best player, per match,
 * averaged over the season. Fans: their own MOTM and their next-best, same matches. Plus your biggest standout.
 */
function MotmStandout({ matches }: { matches: JournalMatch[] }) {
  const { compared, live, remaining } = useSettled(matches);
  const s = motmStandout(compared);
  const youR = s ? Math.round(s.you * 10) : 0, fansR = s ? Math.round(s.fans * 10) : 0;
  const verdict = youR > fansR ? "Your MOTM picks tend to stand out more clearly than the fans’." : youR < fansR ? "The fans’ MOTM picks tend to stand out more clearly than yours." : "Your MOTM picks stand out about as clearly as the fans’.";
  const where = (rows: { m: JournalMatch }[]) => `${rows.length} ${rows.length === 1 ? "match" : "matches"} (${rows.map((r) => label(r.m)).join(", ")})`;
  const below = s ? [s.youBelow.length ? `Your MOTM wasn’t your top-rated player in ${where(s.youBelow)}` : "", s.fansBelow.length ? `the fans’ wasn’t theirs in ${where(s.fansBelow)}` : ""].filter(Boolean) : [];
  const belowLine = below.length ? below.join(", and ").replace(/^t/, "T") + `. ${below.length > 1 ? "Both count" : "That counts"} as a negative gap.` : "";
  return (
    <Moment id="standout" accent="violet" question="How clearly does your MOTM stand out?" title="Your Standout Factor"
      context={`Your MOTM vs your next-best player · same ${compared.length} matches as the fans · ${SEASON}`}
      note={<>Each match: your MOTM&apos;s rating minus your next-highest rated player, then averaged over the season. A tie counts as +0.0, and if you rated someone higher than your MOTM, that match counts as negative. Fans = their most-voted MOTM minus their next-highest average, in the same matches.</>}>
      {s ? (
        <>
          <div className="vs-pair j-pair">
            <div className="you"><small>You</small><strong className="num">{sign1(s.you)}</strong></div>
            <span className="vs">vs</span>
            <div className="fans"><small>Fans</small><strong className="num">{sign1(s.fans)}</strong></div>
          </div>
          <p className="answer-line center">{verdict}</p>
          <p className="ga-impact">
            <span className="ga-impact-tag">Biggest standout</span>
            <span>{label(s.top.m)}: you rated {s.top.you.motm} <b className="num">{f1(s.top.you.rating)}</b> and your next-best, {s.top.you.next}, <b className="num">{f1(s.top.you.nextRating)}</b>. That&apos;s <b className="num">{sign1(s.top.you.gap)}</b>, your biggest gap this season.</span>
          </p>
          {belowLine && <p className="j-onematch">{belowLine}</p>}
          <SettledLine live={live} remaining={remaining} count={compared.length} />
        </>
      ) : <p className="answer-line">Shows after {MOTM_MIN.impact} rated matches.</p>}
    </Moment>
  );
}

/* ---------------- Rating Identity ---------------- */

/** One plain sentence on what your baseline says about you. */
function leanLine(gap: number, who?: string) {
  const a = Math.abs(Math.round(gap * 10) / 10);
  if (a < 0.1) return who ? `You see ${who} the way most fans do` : "You rate the way most fans do";
  const deg = a < 0.3 ? "a bit " : a < 0.6 ? "" : "much ";
  if (gap < 0) return who ? `You're ${deg}tougher on ${who} than most fans` : `You're ${deg}tougher than most fans`;
  return who ? `You rate ${who} ${deg}higher than most fans` : `You're ${deg}more generous than most fans`;
}

function Baseline({ matches }: { matches: JournalMatch[] }) {
  const { playerFilter, setPlayerFilter } = usePrototype();
  const { compared, live, remaining } = useSettled(matches);
  const value = playerFilter.jbase ?? "all";
  const { shown, loading } = useSwap(value);
  const p = eligible.find((x) => x.short === shown);
  const you = p ? p.you : BASELINE.you;
  const fans = p ? p.fans : BASELINE.fans;
  const n = p ? p.apps : BASELINE.ratings;
  return (
    <Moment id="baseline" accent="green" question="What's your usual rating, and how does it compare?" title="Your Rating Baseline"
      context={p ? `${p.name} · your ${p.apps} ratings vs the fans', same matches` : `Your ${BASELINE.ratings} player ratings vs the fans', same matches · ${SEASON}`}
      filter={<PlayerFilter label="Player" options={playerOptions(eligible)} value={value} onChange={(id) => setPlayerFilter("jbase", id)} />}
      note={<>Same method on both sides: the median of the same {n} player ratings, yours and the fans&apos; average for that player in that match. Players need {MIN_MATCHES}+ of your ratings.</>}>
      {loading ? <Skeleton rows={3} /> : (
        <div className="swap-in j-stack">
          {p && <div className="div-hero"><Kit no={p.no} size={52} keeper={p.pos === "GK"} /><div><strong className="answer-big">{p.short}</strong></div></div>}
          <YouVsFans you={you} fans={fans} youLabel="Your usual" fansLabel="Fans' usual" />
          <Takeaway title={leanLine(you - fans, p?.short)}>
            You rate {p ? p.short : "players"} <b className="num">{gapWords(you - fans)}</b>, across the same {n} ratings.
          </Takeaway>
        </div>
      )}
      <SettledLine live={live} remaining={remaining} count={compared.length} />
    </Moment>
  );
}

function RangeCard() {
  const { playerFilter, setPlayerFilter } = usePrototype();
  const linked = useReviewValue("range");
  const value = playerFilter.jrange ?? (linked && eligible.some((x) => x.short === linked) ? linked : "all");
  const { shown, loading } = useSwap(value);
  const p = eligible.find((x) => x.short === shown);
  const r = p ? { low: p.low, lowAt: p.lowAt, high: p.high, highAt: p.highAt, usualLow: p.usualLow, usualHigh: p.usualHigh } : RANGE_ALL;
  const take = !p ? "A 9 from you means something"
    : r.usualLow >= 7 ? `${p.short} rarely drops below ${f1(r.usualLow)} with you`
    : r.usualHigh <= 7 ? `${p.short} rarely gets above ${f1(r.usualHigh)} from you`
    : `${p.short} usually lands ${f1(r.usualLow)}–${f1(r.usualHigh)} with you`;
  return (
    <Moment id="range" accent="sky" question="How wide do your ratings go?" title="Your Rating Range"
      context={p ? `${p.name} · your ${p.apps} ratings · ${SEASON}` : `All your player ratings · ${SEASON}`}
      filter={<PlayerFilter label="Player" options={playerOptions(eligible)} value={value} onChange={(id) => setPlayerFilter("jrange", id)} />}
      note={<>Usual range = the middle half of your ratings. Extremes = your single lowest and highest rating this season; tap one to open that match. Players need {MIN_MATCHES}+ of your ratings.</>}>
      {loading ? <Skeleton rows={3} /> : (
        <div className="swap-in j-stack">
          <div className="answer">
            <strong className="answer-big">Usually <span className="num">{f1(r.usualLow)}–{f1(r.usualHigh)}</span></strong>
            <span className="answer-line">{p ? <>Where you normally rate {p.short}: half your ratings for him land here</> : <>Where you normally rate: half your ratings land here</>}</span>
          </div>
          <div className="range-scale2 j-range" role="img" aria-label={`Usual range ${f1(r.usualLow)} to ${f1(r.usualHigh)}, inside your full range from ${f1(r.low)} to ${f1(r.high)}`}>
            <div className="rs-track">
              <i className="j-full" style={{ left: `${r.low * 10}%`, right: `${100 - r.high * 10}%` }} />
              <i className="j-usual" style={{ left: `${r.usualLow * 10}%`, right: `${100 - r.usualHigh * 10}%` }} />
              <span className="j-usual-tag" style={{ left: `${(r.usualLow + r.usualHigh) * 5}%` }}>Usual</span>
              <em className="low num" style={{ left: `${r.low * 10}%` }}>{f1(r.low)}</em>
              <em className="high num" style={{ left: `${r.high * 10}%` }}>{f1(r.high)}</em>
            </div>
            <div className="rs-axis"><span>0</span><span>5</span><span>10</span></div>
          </div>
          <div className="j-extremes">
            <p className="j-ext-head"><b>Your extremes</b><span>The two ends of your full range, {f1(r.low)} to {f1(r.high)}. Single ratings, not your usual.</span></p>
            <div className="range-ends j-ext">
              {([["low", r.low, r.lowAt, "Your lowest"], ["high", r.high, r.highAt, "Your highest"]] as const).map(([k, v, at, word]) => {
                const m = matchOn(atParts(at).date);
                const body = <><em className={`j-ext-pill ${k} num`}>{f1(v)}</em><span><small>{word}</small><b>{at}</b></span>{m && <span className="j-go" aria-hidden><Img src="chevron-right.svg" size={14} /></span>}</>;
                return m ? <DrillLink key={k} m={m} from={`range:${p?.short ?? ""}`} className={`j-ext-row ${k}`} label={`${word}: ${f1(v)}, ${at}. Open the match`}>{body}</DrillLink> : <div key={k} className={`j-ext-row ${k}`}>{body}</div>;
              })}
            </div>
          </div>
          <Takeaway title={take}>
            {p ? <>Half your ratings for him sit between <b className="num">{f1(r.usualLow)}</b> and <b className="num">{f1(r.usualHigh)}</b>.</>
              : <>Half your ratings land between <b className="num">{f1(r.usualLow)}</b> and <b className="num">{f1(r.usualHigh)}</b>, so your <b className="num">{f1(r.high)}</b> for {r.highAt.split(",")[0]} really stood out.</>}
          </Takeaway>
        </div>
      )}
    </Moment>
  );
}

/* ---------------- You vs Fans ---------------- */

function Agreement({ matches }: { matches: JournalMatch[] }) {
  const { compared, live, remaining } = useSettled(matches);
  const change = AGREEMENT.last5 - AGREEMENT.prev5;
  return (
    <Moment id="agree" accent="gold" question="How often do you agree with the fans?" title="Agreement with Fans"
      context={`${AGREEMENT.seasonN} comparisons with ${FAN_MIN_RATINGS}+ fan ratings · ${SEASON}`}
      note={<>Agreed = your rating within {ALIGNED_WITHIN} of the fans&apos; average for that player in that match. Each player you rated counts once per match, when {FAN_MIN_RATINGS}+ fans rated him too. Your own rating is never in the fan average.</>}>
      <div className="answer">
        <strong className="answer-big"><span className="num">{AGREEMENT.season}%</span> agreed</strong>
        <span className="answer-line">of your <b className="num">{AGREEMENT.seasonN}</b> comparisons were close to the fans&apos;</span>
      </div>
      <div className="shift-nums j-trend">
        <div><small>Previous 5 matches</small><strong className="num">{AGREEMENT.prev5}%</strong><small className="j-count num">{AGREEMENT.prev5N} comparisons</small></div>
        <span className="shift-arrow" aria-hidden>→</span>
        <div><small>Latest 5 matches</small><strong className="num">{AGREEMENT.last5}%</strong><small className="j-count num">{AGREEMENT.last5N} comparisons</small></div>
      </div>
      <p className="j-pp"><span className={`delta ${change >= 0 ? "up" : "down"}`}>{change >= 0 ? "+" : "−"}{Math.abs(change)} pts</span></p>
      <p className="answer-line">{change >= 0 ? "You've been agreeing with the fans more lately." : "You've been drifting from the fans lately."}</p>
      <SettledLine live={live} remaining={remaining} count={compared.length} />
    </Moment>
  );
}

/** Tap a player in Where You Differ: match by match, so you can see where the gap comes from (Warren, 10 Nov). */
function PlayerDiffSheet({ p, onClose }: { p: MyPlayer | null; onClose: () => void }) {
  const rows = p ? playerMatches(p) : [];
  const gap = p ? p.you - p.fans : 0;
  const lower = rows.filter((r) => r.you < r.fans).length;
  return (
    <Sheet open={Boolean(p)} onClose={onClose} label={p ? `${p.short}: you vs the fans, match by match` : "Player"}>
      {p && (
        <>
          <div className="sheet-header">
            <div>
              <h2>{p.short}: you vs the fans</h2>
              <p>Match by match · the {rows.length} latest matches you both rated</p>
            </div>
            <button aria-label="Close" onClick={onClose}><Img src="close.svg" size={24} /></button>
          </div>
          <div className="jd">
            <div className="div-hero">
              <Kit no={p.no} size={52} keeper={p.pos === "GK"} />
              <div>
                <strong className="answer-big">{gap < 0 ? "You rate him lower" : gap > 0 ? "You rate him higher" : "You rate him the same"}</strong>
                <span className="answer-line">Season: <b className="num">{f1(p.you)}</b> from you, <b className="num">{f1(p.fans)}</b> from the fans</span>
              </div>
            </div>
            <p className="answer-line">{gap < 0 ? "Lower" : "Higher"} than the fans in <b className="num">{gap < 0 ? lower : rows.length - lower} of {rows.length}</b> of these matches.</p>
            <div className="j-table jd-table" role="table" aria-label={`${p.short}, match by match`}>
              <div className="j-tr head" role="row"><span role="columnheader">Match</span><span role="columnheader">You</span><span role="columnheader">Fans</span><span role="columnheader">Gap</span><span aria-hidden /></div>
              {rows.map((r) => {
                const m = matchOn(r.date);
                const cls = `j-tr${Math.abs(r.you - r.fans) > ALIGNED_WITHIN ? " gap" : ""}`;
                const cells = (
                  <>
                    <span role="cell" className="j-fx"><b>{r.label}</b><small>{r.date}</small></span>
                    <span role="cell"><Xs who="you" value={r.you} /></span>
                    <span role="cell"><Xs who="fan" value={r.fans} /></span>
                    <span role="cell"><Delta value={r.you - r.fans} /></span>
                    <span aria-hidden className="j-go"><Img src="chevron-right.svg" size={14} /></span>
                  </>
                );
                return m ? (
                  <DrillLink key={r.label + r.date} m={m} from={`differ:${p.short}`} className={`${cls} j-tr-link`} label={`${r.label}, ${r.date}: ${p.short} ${f1(r.you)} from you, ${f1(r.fans)} from the fans. Open the match`}>{cells}</DrillLink>
                ) : <div className={cls} role="row" key={r.label + r.date}>{cells}</div>;
              })}
            </div>
            <p className="moment-note"><Img src="info.svg" size={12} />Same fixtures only: a match counts when you and {FAN_MIN_RATINGS}+ fans rated him. Gaps over {ALIGNED_WITHIN} are highlighted. Tap a match to open it.</p>
          </div>
        </>
      )}
    </Sheet>
  );
}

function WhereYouDiffer({ matches }: { matches: JournalMatch[] }) {
  const { compared, live, remaining } = useSettled(matches);
  // The open player lives in the URL (?differ=Salah), so Back from a match returns to his sheet.
  const [linked, setPicked] = useUrlParam("differ");
  const sorted = [...eligible].sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans));
  const lead = sorted[0];
  const openName = linked === "1" ? lead.short : linked;
  const openP = sorted.find((p) => p.short === openName) ?? null;
  return (
    <Moment id="differ" accent="coral" question="Who do you rate differently from the fans?" title="Where You Differ"
      context={`Your season average vs the fans', same fixtures · ${SEASON}`}
      note={<>Ranked by the size of the gap, either way. Same fixtures only: a match counts when you and {FAN_MIN_RATINGS}+ fans rated that player. Players need {MIN_MATCHES}+ of your ratings.</>}>
      <div className="answer">
        <strong className="answer-big">You rate {lead.short} {lead.you < lead.fans ? "lower" : "higher"}</strong>
        <span className="answer-line"><b className="num">{f1(lead.you)}</b> from you, <b className="num">{f1(lead.fans)}</b> from the fans</span>
      </div>
      <p className="movers-key"><span>You · Fans · gap · tap a player for match by match</span></p>
      <ul className="movers j-differ">
        {sorted.map((p) => {
          const g = Math.round((p.you - p.fans) * 10) / 10;
          return (
            <li key={p.name}>
              <button className="j-row j-row-btn" onClick={() => setPicked(p.short)} aria-label={`${p.short}: you ${f1(p.you)}, fans ${f1(p.fans)}. ${g === 0 ? "Same as the fans" : g > 0 ? "You rate him higher" : "You rate him lower"}. Open match by match`}>
                <Kit no={p.no} size={28} keeper={p.pos === "GK"} />
                <span className="mv-name">{p.short}</span>
                <span className="j-nums"><b className="you num">{f1(p.you)}</b><b className="fan num">{f1(p.fans)}</b></span>
                <span className={`j-dir ${g > 0 ? "up" : g < 0 ? "down" : "level"}`} aria-hidden>{g > 0 ? "↑" : g < 0 ? "↓" : "="}</span>
                <Delta value={p.you - p.fans} />
                <Img src="chevron-right.svg" size={14} />
              </button>
            </li>
          );
        })}
      </ul>
      <SettledLine live={live} remaining={remaining} count={compared.length} />
      <PlayerDiffSheet p={openP} onClose={() => setPicked(null)} />
    </Moment>
  );
}

/* ---------------- You vs Fans swipe set (Michel + Warren, 11 Nov): related player cards live together ---------------- */

const vsRows = eligible.map((p) => {
  const c = PLAYER_VS_FANS[p.short] ?? { above: 0, level: p.apps, below: 0 };
  const n = c.above + c.level + c.below;
  const lean = c.above / n >= 0.5 ? "higher" : c.below / n >= 0.5 ? "lower" : c.level / n >= 0.5 ? "level" : "mixed";
  return { p, ...c, n, lean, oneSided: Math.max(c.above, c.below) / n, agree: c.level / n };
});
const LEAN_WORD = { higher: "Usually higher", lower: "Usually lower", level: "With the fans", mixed: "Mixed" } as const;

/**
 * Above or Below the Fans (the original "Your Ratings v Fans" card, Above/Below Fan Average): per player, how often
 * your rating sat above, level with or below the fans'. One layer deeper than Where You Differ: how consistent the gap is.
 * The overall "you rate below the fans" verdict already lives in Rating Identity (your usual rating), so it isn't repeated.
 */
function AboveBelowFans({ matches }: { matches: JournalMatch[] }) {
  const { compared, live, remaining } = useSettled(matches);
  const rows = [...vsRows].sort((a, b) => b.oneSided - a.oneSided);
  const lead = rows[0];
  const leadDir = lead.below >= lead.above ? "below" : "above";
  return (
    <Moment id="abovebelow" accent="coral" question="Are you usually above or below the fans on a player?" title="Above or Below the Fans"
      context={`Every match you and ${FAN_MIN_RATINGS}+ fans rated him · ${SEASON}`}
      note={<>Above / below = more than {ALIGNED_WITHIN} from the fans&apos; average for him in that match; level = within {ALIGNED_WITHIN}. A match counts when {FAN_MIN_RATINGS}+ fans rated him. Players need {MIN_MATCHES}+ of your ratings.</>}>
      <div className="answer">
        <strong className="answer-big">Usually {leadDir} the fans on {lead.p.short}</strong>
        <span className="answer-line"><b className="num">{leadDir === "below" ? lead.below : lead.above} of {lead.n}</b> of his matches</span>
      </div>
      <p className="ab-key"><span><i className="up" />Above the fans</span><span><i className="level" />Level</span><span><i className="down" />Below</span></p>
      <ul className="ab-list">
        {rows.map((r) => (
          <li key={r.p.short} aria-label={`${r.p.short}: above the fans in ${r.above}, level in ${r.level}, below in ${r.below} of ${r.n} matches. ${LEAN_WORD[r.lean as keyof typeof LEAN_WORD]}`}>
            <Kit no={r.p.no} size={28} keeper={r.p.pos === "GK"} />
            <div className="ab-mid">
              <span className="ab-name">{r.p.short}<small className="num">{r.above} · {r.level} · {r.below}</small></span>
              <span className="ab-bar" aria-hidden>
                <i className="up" style={{ flexGrow: r.above }} />
                <i className="level" style={{ flexGrow: r.level }} />
                <i className="down" style={{ flexGrow: r.below }} />
              </span>
            </div>
            <span className={`ab-lean ${r.lean}`}>{LEAN_WORD[r.lean as keyof typeof LEAN_WORD]}</span>
          </li>
        ))}
      </ul>
      <SettledLine live={live} remaining={remaining} count={compared.length} />
    </Moment>
  );
}

/** Where You Agree Most (the original "Players You Agree With Fans On Most"): the players you see the same way as the fans. */
function AgreeMost({ matches }: { matches: JournalMatch[] }) {
  const { compared, live, remaining } = useSettled(matches);
  const rows = [...vsRows].sort((a, b) => b.agree - a.agree || b.n - a.n).slice(0, 3);
  const lead = rows[0];
  return (
    <Moment id="agreemost" accent="gold" question="Which players do you see the same way as the fans?" title="Where You Agree Most"
      context={`Matches within ${ALIGNED_WITHIN} of the fans, per player · ${SEASON}`}
      note={<>Agreed = your rating within {ALIGNED_WITHIN} of the fans&apos; average for him in that match. A match counts when {FAN_MIN_RATINGS}+ fans rated him. Players need {MIN_MATCHES}+ of your ratings.</>}>
      <div className="answer">
        <strong className="answer-big">In step with the fans on {lead.p.short}</strong>
        <span className="answer-line">Within {ALIGNED_WITHIN} of the fans in <b className="num">{lead.level} of {lead.n}</b> of his matches</span>
      </div>
      <ol className="agree-list">
        {rows.map((r) => (
          <li key={r.p.short}>
            <Kit no={r.p.no} size={28} keeper={r.p.pos === "GK"} />
            <div className="ag-mid">
              <span className="ab-name">{r.p.short}<small className="num">{r.level} of {r.n} matches</small></span>
              <span className="ag-bar" aria-hidden><i style={{ width: `${Math.round(r.agree * 100)}%` }} /></span>
            </div>
            <strong className="num ag-pct">{Math.round(r.agree * 100)}%</strong>
          </li>
        ))}
      </ol>
      <SettledLine live={live} remaining={remaining} count={compared.length} />
    </Moment>
  );
}

/* ---------------- Manager & Team ---------------- */

/**
 * Manager vs Team (Warren, 13 Nov): both numbers come from exactly the same matches and the same method (a plain
 * average of your ratings), and the card says so, so the comparison is like for like.
 */
function ManagerVsTeamYou({ matches }: { matches: JournalMatch[] }) {
  const s = season(matches);
  const usual = median(matches.map((m) => m.manager));
  const last = matches[0];
  const diff = s.managerAvg - s.teamAvg;
  const lastGap = Math.round((last.manager - usual) * 10) / 10;
  return (
    <Moment id="mvt" accent="blue" question="Do you rate the manager above or below the players?" title="Manager vs Team"
      context={`Your ratings · same ${s.rated} matches · ${SEASON}`}
      note={<>Manager = the average of your manager ratings. Team = the average of your 11 player ratings per match, averaged over the same matches. Your usual manager rating = the median of yours.</>}>
      <div className="vs-pair">
        <div><small>Manager</small><strong className="num">{f1(s.managerAvg)}</strong></div>
        <span className="vs">vs</span>
        <div><small>Team</small><strong className="num">{f1(s.teamAvg)}</strong></div>
      </div>
      <p className="j-same"><i aria-hidden>=</i><span>Like for like: both use the same <b className="num">{s.rated}</b> matches</span></p>
      <p className="answer-line center">You rate the manager <b className="num">{f1(Math.abs(diff))}</b> {diff < 0 ? "below" : "above"} the team</p>
      <div className="j-baseline-row">
        <span>Last match · {label(last)}, {last.date}</span>
        <b className="num">{f1(last.manager)}</b>
        <span>{lastGap === 0 ? "right on your usual" : <><Delta value={lastGap} /> vs your usual <b className="num">{f1(usual)}</b></>}</span>
      </div>
    </Moment>
  );
}

const RESULT_WORD = { W: "wins", D: "draws", L: "losses" } as const;
const RESULT_ONE = { W: "win", D: "draw", L: "loss" } as const;
const matchesWord = (n: number) => `${n} ${n === 1 ? "match" : "matches"}`;

/**
 * The fixtures behind one Rating by Result average (Warren + Michel, 13 Nov): a light sheet over the card, not a new
 * analytics screen. Newest first, your team rating per match, your highest and lowest marked. Tapping a match opens
 * its rated-match detail; Back returns here with the same result selected (it's kept in the URL as ?result=W).
 */
function ResultSheet({ sample, result, onPick, onClose }: { sample: JournalMatch[]; result: Result | null; onPick: (r: Result) => void; onClose: () => void }) {
  const have = (["W", "D", "L"] as Result[]).filter((r) => sample.some((m) => m.result === r));
  const r = result && have.includes(result) ? result : null;
  const rows = r ? sample.filter((m) => m.result === r) : [];
  const average = rows.length ? avg(rows.map((m) => m.you)) : 0;
  const sorted = [...rows].sort((a, b) => b.you - a.you);
  const hi = rows.length > 1 ? sorted[0] : null;
  const lo = rows.length > 1 ? sorted[sorted.length - 1] : null;
  return (
    <Sheet open={Boolean(r)} onClose={onClose} label={r ? `${RESULT_TITLE[r]}: the matches behind your average` : "Matches"}>
      {r && (
        <>
          <div className="sheet-header">
            <div>
              <h2>{RESULT_TITLE[r]}: your team rating</h2>
              <p>{matchesWord(rows.length)} · your average <b className="num">{f1(average)}</b> · newest first</p>
            </div>
            <button aria-label="Close" onClick={onClose}><Img src="close.svg" size={24} /></button>
          </div>
          {have.length > 1 && (
            <div className="sheet-filters rs-filters" role="tablist" aria-label="Result">
              {have.map((x) => (
                <button key={x} role="tab" aria-selected={x === r} className={x === r ? "on" : ""} onClick={() => onPick(x)}>
                  {RESULT_TITLE[x]} <span className="num">{sample.filter((m) => m.result === x).length}</span>
                </button>
              ))}
            </div>
          )}
          <div className="jd">
            {lo && hi && (
              <p className="answer-line">
                Your lowest-rated {RESULT_ONE[r]} was <b>{label(lo)} ({lo.score})</b>: <b className="num">{f1(lo.you)}</b>, <b className="num">{f1(average - lo.you)}</b> below your average after {RESULT_WORD[r]}.
              </p>
            )}
            <ul className="j-matches rs-list" aria-label={`Your ${RESULT_WORD[r]}, newest first`}>
              {rows.map((m) => {
                const tag = m === hi ? "hi" : m === lo ? "lo" : null;
                return (
                  <li key={m.id} className={tag ?? undefined}>
                    <DrillLink m={m} from={`result:${r}`} label={`${label(m)}, ${m.date}, ${m.score}. Your team rating ${f1(m.you)}${tag === "hi" ? ", your highest" : tag === "lo" ? ", your lowest" : ""}. Open the match`}>
                      <TeamLogo name={m.opp} size={28} />
                      <span className="jm-who">
                        <b>{label(m)}</b>
                        <small>{m.date} · {m.competition}</small>
                        {tag && <i className={`rs-tag ${tag}`}>{tag === "hi" ? "Your highest" : "Your lowest"}</i>}
                      </span>
                      <span className="jm-score"><span className="num">{m.score}</span><em className={`res ${m.result}`}>{m.result}</em></span>
                      <YouPill value={m.you} />
                      <Img src="chevron-right.svg" size={14} />
                    </DrillLink>
                  </li>
                );
              })}
            </ul>
            <p className="moment-note"><Img src="info.svg" size={12} />Team rating = the average of your 11 player ratings in that match. Tap a match to open it.</p>
          </div>
        </>
      )}
    </Sheet>
  );
}

/**
 * Your Rating by Result (Michel + Warren, 10 Nov): only the results you've actually rated. One result type: no
 * comparison. Two: just those two. An average from a single match is flagged. Fans: exactly the same matches.
 * 13 Nov: each tile says how many matches it's built from, and tapping it opens the matches behind it.
 * Review links: ?results=two (wins + one loss, no draws), ?results=one (wins only), ?result=W (opens the Wins sheet).
 */
function ResultEffect({ matches }: { matches: JournalMatch[] }) {
  const { live, remaining } = useSettled(matches);
  const mode = useReviewValue("results");
  const [picked, setPicked] = useUrlParam("result");
  const sample = mode === "one" ? matches.filter((m) => m.result === "W")
    : mode === "two" ? [...matches.filter((m) => m.result === "W"), ...matches.filter((m) => m.result === "L").slice(0, 1)]
    : matches;
  const s = season(sample);
  const have = s.result.filter((r) => r.n > 0);
  const best = have[0], worst = have[have.length - 1];
  const youGap = have.length > 1 && best.you !== null && worst.you !== null ? Number(f1(best.you)) - Number(f1(worst.you)) : null;
  const fanGap = have.length > 1 && best.fans !== null && worst.fans !== null ? Number(f1(best.fans)) - Number(f1(worst.fans)) : null;
  const single = have.filter((r) => r.n === 1);
  const sheet = picked && picked in RESULT_TITLE ? (picked as Result) : null;
  return (
    <Moment id="result" accent="sky" question="Does the result change how you rate the team?" title="Your Rating by Result"
      context={`Your team rating · ${s.rated} matches · ${SEASON}`}
      note={<>Team rating = the average of your 11 player ratings. Fans = their team rating in exactly the same matches. Only results you&apos;ve rated are shown.</>}>
      {have.length < 2 ? (
        <div className="state-panel j-early">
          <strong>Needs two different results</strong>
          <span>All {s.rated} matches you&apos;ve rated so far were {RESULT_WORD[have[0]?.r ?? "W"]}, so there&apos;s nothing to compare yet. This fills in once you rate a {have[0]?.r === "W" ? "draw or a loss" : "different result"}.</span>
        </div>
      ) : (
        <>
          <div className="result-tiles" style={{ gridTemplateColumns: `repeat(${have.length}, 1fr)` }}>
            {have.map((r) => (
              <button key={r.r} className={`rtile ${r.r}${r.n === 1 ? " one" : ""}`} onClick={() => setPicked(r.r)}
                aria-label={`${RESULT_TITLE[r.r]}: your team rating ${r.you === null ? "none" : f1(r.you)} over ${matchesWord(r.n)}. Show the matches`}>
                <span className="rtile-go" aria-hidden><Img src="chevron-right.svg" size={12} /></span>
                <em className={`res ${r.r}`}>{r.r}</em>
                <strong className="num">{r.you === null ? "—" : f1(r.you)}</strong>
                <small>{RESULT_TITLE[r.r]}</small>
                <b className="rtile-n">{matchesWord(r.n)}</b>
                {r.n === 1 && <span className="rtile-flag">First read</span>}
              </button>
            ))}
          </div>
          <p className="movers-key"><span>Tap a result to see the matches behind it</span></p>
          {youGap !== null && (
            <p className="answer-line">After {RESULT_WORD[best.r]} you rate the squad <b className="num">{f1(youGap)}</b> higher than after {RESULT_WORD[worst.r]}.{fanGap !== null && <> Fans: <b className="num j-fan">{f1(fanGap)}</b>.</>}</p>
          )}
          {single.length > 0 && (
            <p className="j-onematch">Your {single.map((r) => RESULT_ONE[r.r]).join(" and ")} average is based on a single match, so treat it as a first read.</p>
          )}
          <SettledLine live={live} remaining={remaining} count={sample.length} />
          <ResultSheet sample={sample} result={sheet} onPick={setPicked} onClose={() => setPicked(null)} />
        </>
      )}
    </Moment>
  );
}

/* ---------------- Player Patterns ---------------- */

const counts = (p: MyPlayer) => {
  const ps = p.last6.map((x) => patternOf(x.v, p.you));
  return { above: ps.filter((x) => x === "above").length, around: ps.filter((x) => x === "around").length, below: ps.filter((x) => x === "below").length };
};
const patternHeadline = (p: MyPlayer) => {
  const c = counts(p);
  if (c.above >= 4) return `${p.short} is running above your usual`;
  if (c.below >= 4) return `${p.short} is running below your usual`;
  if (c.around >= 4) return `${p.short} is steady around your usual`;
  return `${p.short}: up and down around your usual`;
};

function PlayerPattern() {
  const { playerFilter, setPlayerFilter } = usePrototype();
  const value = playerFilter.jpattern ?? "all";
  const { shown, loading } = useSwap(value);
  const p = eligible.find((x) => x.short === shown);
  const first = MY_PLAYERS[0].last6[0], lastF = MY_PLAYERS[0].last6[5];
  return (
    <Moment id="pattern" accent="violet" question="Is a player above or below how you usually rate him?" title="Player Pattern"
      context={p ? `${p.name} · your last 6 ratings vs your usual ${f1(p.you)}` : `Your last 6 ratings per player · ${first.label} ${first.date} → ${lastF.label} ${lastF.date}`}
      filter={<PlayerFilter label="Player" options={playerOptions(eligible)} value={value} onChange={(id) => setPlayerFilter("jpattern", id)} />}
      note={<>Above / below = at least 0.3 from your usual (median) rating for that player. Players need {MIN_MATCHES}+ of your ratings.</>}>
      {loading ? <Skeleton rows={4} /> : p ? (
        <div className="swap-in">
          <div className="answer">
            <strong className="answer-big">{patternHeadline(p)}</strong>
            <span className="answer-line"><b className="num">{counts(p).above}</b> above, <b className="num">{counts(p).around}</b> around, <b className="num">{counts(p).below}</b> below in his last 6</span>
          </div>
          <div className="seq j-seq six" aria-label={`${p.short}, your ratings oldest first: ${p.last6.map((x) => `${x.label} ${x.date} ${x.v}`).join(", ")}`}>
            {p.last6.map((x) => (
              <div key={x.date} className={patternOf(x.v, p.you)}>
                <strong className="num">{f1(x.v)}</strong>
                <b>{x.label}</b>
                <small>{x.date}</small>
              </div>
            ))}
          </div>
          <p className="j-dots-key"><span><i className="above" />Above usual</span><span><i className="around" />Around</span><span><i className="below" />Below</span></p>
        </div>
      ) : (
        <div className="swap-in">
          <ul className="movers j-patterns">
            {eligible.map((x) => (
              <li key={x.name}>
                <button onClick={() => setPlayerFilter("jpattern", x.short)} aria-label={`${patternHeadline(x)}. Show his last 6`}>
                  <Kit no={x.no} size={28} keeper={x.pos === "GK"} />
                  <span className="mv-name">{x.short}<small>usual {f1(x.you)}</small></span>
                  <span className="j-mini" aria-hidden>{x.last6.map((y) => <i key={y.date} className={patternOf(y.v, x.you)} />)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="j-dots-key"><span><i className="above" />Above usual</span><span><i className="around" />Around</span><span><i className="below" />Below</span><span>Oldest → newest</span></p>
        </div>
      )}
    </Moment>
  );
}

function UnsungHero({ matches }: { matches: JournalMatch[] }) {
  const p = [...eligible].sort((a, b) => (b.top3 - b.myMotm) - (a.top3 - a.myMotm))[0];
  return (
    <Moment id="unsung" accent="gold" question="Who do you rate highly but rarely crown?" title="Your Unsung Hero"
      context={`Your ratings · ${matches.length} matches · ${SEASON}`}
      note={<>Top 3 = one of your three highest-rated players in that match.</>}>
      <div className="div-hero">
        <Kit no={p.no} size={60} keeper={p.pos === "GK"} />
        <div>
          <strong className="answer-big">{p.short}</strong>
          <span className="answer-line">In your top 3 in <b className="num">{p.top3}</b> of <b className="num">{p.apps}</b> matches, your MOTM only <b className="num">{p.myMotm}</b> {p.myMotm === 1 ? "time" : "times"}</span>
        </div>
      </div>
      <div className="vs-pair j-pair">
        <div className="you"><small>Your top 3</small><strong className="num">{p.top3}</strong></div>
        <span className="vs">vs</span>
        <div className="you"><small>Your MOTM</small><strong className="num">{p.myMotm}</strong></div>
      </div>
    </Moment>
  );
}

function MyPositions() {
  const top = [...MY_POSITIONS].sort((a, b) => b.you - a.you)[0];
  const fanTop = [...MY_POSITIONS].sort((a, b) => b.fans - a.fans)[0];
  return (
    <Moment id="positions" accent="blue" question="Which part of the team do you rate highest?" title="Your Ratings by Position"
      context={`Your season average vs the fans' · ${SEASON} · outfield positions`}
      note={<>Goalkeeper not included. Same matches for you and the fans.</>}>
      <div className="answer">
        <strong className="answer-big">You rate {top.label.toLowerCase()} highest</strong>
        <span className="answer-line">{fanTop.label === top.label ? "So do the fans." : <>The fans rate {fanTop.label.toLowerCase()} highest.</>}</span>
      </div>
      <div className="pos-table" role="table" aria-label="Your average rating by position vs the fans">
        <div className="pos-row j-pos head" role="row"><span role="columnheader">Position</span><span role="columnheader">You</span><span role="columnheader">Fans</span><span role="columnheader">Gap</span></div>
        {MY_POSITIONS.map((r) => (
          <div className={`pos-row j-pos${r.label === top.label ? " is-top you" : ""}`} role="row" key={r.label}>
            <span role="cell" className="pos-name"><PosIcon label={r.label} />{r.label}</span>
            <span role="cell" className="num pill-you">{f1(r.you)}</span>
            <span role="cell" className="num pill-fan">{f1(r.fans)}</span>
            <span role="cell"><Delta value={r.you - r.fans} /></span>
          </div>
        ))}
      </div>
    </Moment>
  );
}

/* ---------------- tab screen ---------------- */

let lastIndex = -1;

/** Premium cards, shown only with the review toggle: designed later, after the free Journal (Michel, 11 Nov). */
function PremiumLater({ children }: { children: ReactNode }) {
  return (
    <section className="j-premium-later" aria-label="Premium cards, later">
      <p className="j-premium-head"><PremiumBadge /><span>Premium · later. Identity cards like Unsung Hero and Mr Consistent come after the free Journal.</span></p>
      {children}
    </section>
  );
}

export function JournalTab({ tab }: { tab: JournalTabId }) {
  const { edges, fixtures } = usePrototype();
  const router = useRouter();
  const rateAndReveal = useRateAndReveal();
  const toRate = fixtures.some((f) => f.status === "open" && !f.youRated);
  const matches = useJournalMatches();
  const enough = matches.length >= MIN_MATCHES;
  const active = useRef<HTMLAnchorElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const index = JOURNAL_TABS.findIndex((t) => t.id === tab);
  const prev = JOURNAL_TABS[index - 1];
  const next = JOURNAL_TABS[index + 1];
  const [dir] = useState(() => (index >= lastIndex ? "fwd" : "back"));
  useEffect(() => {
    lastIndex = index;
    active.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [index]);

  const content: Record<JournalTabId, ReactNode> = {
    motm: (
      <>
        <MyMotmPicks matches={matches} />
        <SwipeSet id="calls" title="Your big calls" sub="Swipe through your boldest MOTM moments" cards={[
          { key: "boldest", node: <MotmBoldest matches={matches} /> },
          { key: "split", node: <MotmSplit matches={matches} /> },
          { key: "agreement", node: <MotmAgreement matches={matches} /> },
        ]} />
        <SwipeSet id="look" title="What you look for" sub="What your MOTM picks have in common" cards={[
          { key: "bypos", node: <MotmByPosition matches={matches} /> },
          { key: "output", node: <MotmOutput matches={matches} /> },
          { key: "standout", node: <MotmStandout matches={matches} /> },
        ]} />
      </>
    ),
    identity: <><Baseline matches={matches} /><RangeCard /></>,
    "vs-fans": (
      <>
        <Agreement matches={matches} />
        <SwipeSet id="players-vs" title="Players: you vs the fans" sub="Who you differ on, how often, and where you agree" cards={[
          { key: "differ", node: <WhereYouDiffer matches={matches} /> },
          { key: "abovebelow", node: <AboveBelowFans matches={matches} /> },
          { key: "agreemost", node: <AgreeMost matches={matches} /> },
        ]} />
      </>
    ),
    manager: <><ManagerVsTeamYou matches={matches} /><ResultEffect matches={matches} /></>,
    // Identity / archetype cards (Unsung Hero, Mr Consistent, …) are premium and come after the free Journal (Michel, 11 Nov).
    players: (
      <>
        <PlayerPattern />
        <MyPositions />
        {edges.premium && <PremiumLater><UnsungHero matches={matches} /></PremiumLater>}
      </>
    ),
  };

  return (
    <div className="insights journal">
      <header className="insights-bar j-bar">
        <Photo className="ib-photo" src={JOURNAL_PHOTOS[tab].src} position={JOURNAL_PHOTOS[tab].pos} priority />
        <Link href="/my-journal" scroll={false} aria-label="Back to My Journal" className="ib-back"><Img src="back.svg" w={15.5} h={11.5} /></Link>
        <div className="ib-title">
          <span className="ib-crest j-avatar"><Img src="avatar-user.png" size={40} /></span>
          <div>
            <h1>My Journal</h1>
            <p>Your ratings · {matches.length} matches · {SEASON}</p>
            <p className="j-fresh-line">Updates as soon as you rate</p>
          </div>
        </div>
      </header>
      <nav className="tabs" aria-label="Your insight categories">
        {JOURNAL_TABS.map((t) => (
          <Link key={t.id} ref={t.id === tab ? active : undefined} href={`/my-journal/${t.id}`} scroll={false} aria-current={t.id === tab ? "page" : undefined} className={t.id === tab ? "on" : ""}>{t.label}</Link>
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
          if (to) router.push(`/my-journal/${to.id}`, { scroll: false });
        }}
      >
        {enough ? content[tab] : (
          <div className="state-panel j-early">
            <strong>Your season patterns start after {MIN_MATCHES} rated matches</strong>
            <span>You&apos;ve rated {matches.length}. Rate {MIN_MATCHES - matches.length} more and this fills in. Every match you rate still gets its own insights.</span>
            {/* Straight into the normal rating flow (Michel, 12 Nov). */}
            {toRate ? <button className="btn secondary" onClick={rateAndReveal}>Rate the Match</button> : <small className="j-next-open">The next match opens for rating at full time.</small>}
          </div>
        )}
        <div className="tab-foot">
          <div className="dots" aria-hidden>{JOURNAL_TABS.map((t) => <i key={t.id} className={t.id === tab ? "on" : ""} />)}</div>
          {next ? (
            <Link className="next-tab" href={`/my-journal/${next.id}`} scroll={false}>Next: {next.label}<Img src="chevron-right.svg" size={17.6} /></Link>
          ) : (
            <Link className="next-tab" href="/my-journal" scroll={false}>Back to My Journal<Img src="chevron-right.svg" size={17.6} /></Link>
          )}
        </div>
      </div>
    </div>
  );
}
