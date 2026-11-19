// Sample data for My Journal: the user's own ratings. Every figure is illustrative and needs the
// approved metric contract before build (handbook §4.1, VALIDATE).
//
// My Journal = the user (green). Fans appear only as a labelled comparison (yellow).
// Unlike Club Hub, My Journal updates the moment the user rates (Michel, 4 Nov).

import { CLUB, SEASON } from "./data";

export { CLUB, SEASON };

export const JOURNAL_TABS = [
  { id: "motm", label: "MOTM Profile", question: "Why do you pick your MOTM?" },
  { id: "identity", label: "Rating Identity", question: "What kind of rater are you?" },
  { id: "vs-fans", label: "You vs Fans", question: "How close are you to the fanbase?" },
  { id: "manager", label: "Manager & Team", question: "How do you judge the manager and the side?" },
  { id: "players", label: "Player Patterns", question: "How do your ratings move per player?" },
] as const;
export type JournalTabId = (typeof JOURNAL_TABS)[number]["id"];

/** Your season patterns need enough history to be honest. Below this, cards explain instead. */
export const MIN_MATCHES = 5;
/** You're "aligned" with the fans on a player when your rating is within this of the fans' average. */
export const ALIGNED_WITHIN = 0.3;

export type Result = "W" | "D" | "L";
export type MotmGA = "goal" | "assist" | "both" | "none";
/**
 * One match you rated. `you` / `fans` are team averages (the mean of the 11 player ratings),
 * `manager` is your manager rating. `fanMotmShare` = share of fans who picked your MOTM.
 */
export type JournalMatch = {
  id: string;
  opp: string;
  code: string;
  venue: "vs" | "@";
  date: string;
  score: string;
  result: Result;
  competition: string;
  you: number;
  fans: number;
  manager: number;
  myMotm: string;
  fanMotm: string;
  fanMotmShare: number;
  /** What your MOTM did in that match: from match events (API-Football /fixtures/events). An unrecorded assist counts as goal only. */
  myMotmGA: MotmGA;
  /** Fans who had rated when this sample was taken. */
  fansRated: number;
  /** Who managed the team in this match. Unset = the current head coach. A manager's usual only counts his own matches. */
  coach?: string;
};

/** The open match (Rapid Wien 0–2). Exists in the Journal only once you've rated it. */
export const OPEN_MATCH: JournalMatch = {
  id: "open", opp: "Rapid Wien", code: "RAP", venue: "@", date: "4 Mar", score: "2–0", result: "W", competition: "Bundesliga",
  you: 7.5, fans: 7.4, manager: 7.3, myMotm: "Salah", fanMotm: "Van Dijk", fanMotmShare: 24, myMotmGA: "goal", fansRated: 666,
};

/** Your 13 rated matches this season, newest first. Score is from Sturm Graz's side. */
export const JOURNAL_MATCHES: JournalMatch[] = [
  { id: "rated", opp: "Inter", code: "INT", venue: "vs", date: "1 Mar", score: "3–3", result: "D", competition: "Champions League", you: 7.0, fans: 7.2, manager: 5.9, myMotm: "Salah", fanMotm: "Salah", fanMotmShare: 46, myMotmGA: "both", fansRated: 666 },
  { id: "closed", opp: "Brighton", code: "BHA", venue: "@", date: "18 Feb", score: "2–1", result: "W", competition: "Champions League", you: 6.4, fans: 6.7, manager: 6.0, myMotm: "Van Dijk", fanMotm: "Salah", fanMotmShare: 21, myMotmGA: "none", fansRated: 512 },
  { id: "newcastle", opp: "Newcastle", code: "NEW", venue: "vs", date: "7 Feb", score: "1–1", result: "D", competition: "Bundesliga", you: 6.9, fans: 6.6, manager: 6.6, myMotm: "Mac Allister", fanMotm: "Mac Allister", fanMotmShare: 38, myMotmGA: "assist", fansRated: 540 },
  { id: "arsenal", opp: "Arsenal", code: "ARS", venue: "@", date: "31 Jan", score: "0–2", result: "L", competition: "Champions League", you: 5.6, fans: 5.8, manager: 5.8, myMotm: "Van Dijk", fanMotm: "Van Dijk", fanMotmShare: 44, myMotmGA: "none", fansRated: 498 },
  { id: "chelsea", opp: "Chelsea", code: "CHE", venue: "vs", date: "24 Jan", score: "2–1", result: "W", competition: "Bundesliga", you: 7.6, fans: 7.3, manager: 7.0, myMotm: "Salah", fanMotm: "Salah", fanMotmShare: 52, myMotmGA: "goal", fansRated: 610 },
  { id: "mci-home", opp: "Man City", code: "MCI", venue: "vs", date: "12 Jan", score: "4–1", result: "W", competition: "Champions League", you: 8.2, fans: 8.4, manager: 7.4, myMotm: "Salah", fanMotm: "Salah", fanMotmShare: 58, myMotmGA: "both", fansRated: 842 },
  { id: "gladbach", opp: "Gladbach", code: "BMG", venue: "@", date: "10 Dec", score: "2–2", result: "D", competition: "Champions League", you: 6.5, fans: 6.3, manager: 6.3, myMotm: "Van Dijk", fanMotm: "Salah", fanMotmShare: 27, myMotmGA: "none", fansRated: 588 },
  { id: "salzburg", opp: "Salzburg", code: "SAL", venue: "vs", date: "29 Nov", score: "3–0", result: "W", competition: "Bundesliga", you: 7.7, fans: 7.5, manager: 7.1, myMotm: "Salah", fanMotm: "Van Dijk", fanMotmShare: 31, myMotmGA: "goal", fansRated: 575 },
  { id: "mci-away", opp: "Man City", code: "MCI", venue: "@", date: "9 Nov", score: "0–4", result: "L", competition: "Champions League", you: 4.6, fans: 4.1, manager: 5.0, myMotm: "Alisson", fanMotm: "Alisson", fanMotmShare: 33, myMotmGA: "none", fansRated: 701 },
  { id: "lask", opp: "LASK", code: "LAS", venue: "@", date: "1 Nov", score: "1–0", result: "W", competition: "Bundesliga", you: 7.2, fans: 7.0, manager: 6.8, myMotm: "Salah", fanMotm: "Salah", fanMotmShare: 41, myMotmGA: "goal", fansRated: 530 },
  { id: "betis", opp: "Betis", code: "BET", venue: "@", date: "24 Oct", score: "1–2", result: "L", competition: "Champions League", you: 5.3, fans: 5.9, manager: 5.2, myMotm: "Mac Allister", fanMotm: "Van Dijk", fanMotmShare: 8, myMotmGA: "assist", fansRated: 560 },
  { id: "austria", opp: "Austria Wien", code: "AUS", venue: "vs", date: "18 Oct", score: "2–0", result: "W", competition: "Bundesliga", you: 7.4, fans: 7.1, manager: 7.0, myMotm: "Salah", fanMotm: "Salah", fanMotmShare: 47, myMotmGA: "goal", fansRated: 515 },
  { id: "wolfsberg", opp: "Wolfsberger", code: "WAC", venue: "@", date: "4 Oct", score: "1–1", result: "D", competition: "Bundesliga", you: 6.6, fans: 6.5, manager: 6.1, myMotm: "Salah", fanMotm: "Salah", fanMotmShare: 44, myMotmGA: "goal", fansRated: 490 },
];

/** Your season-level numbers, from the matches above (and the open match once you've rated it). */
export function season(matches: JournalMatch[]) {
  const n = matches.length;
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const motmMatched = matches.filter((m) => m.myMotm === m.fanMotm).length;
  const byResult = (r: Result) => matches.filter((m) => m.result === r);
  return {
    rated: n,
    teamAvg: mean(matches.map((m) => m.you)),
    fansTeamAvg: mean(matches.map((m) => m.fans)),
    managerAvg: mean(matches.map((m) => m.manager)),
    motmMatched,
    result: (["W", "D", "L"] as Result[]).map((r) => ({ r, n: byResult(r).length, you: byResult(r).length ? mean(byResult(r).map((m) => m.you)) : null, fans: byResult(r).length ? mean(byResult(r).map((m) => m.fans)) : null })),
  };
}

/** Matches in a row you've rated (current run). */
export const STREAK = 6;
/** Your usual (median) player rating vs the fans' median for the same matches. */
export const BASELINE = { you: 6.8, fans: 7.0, ratings: 143 };
/** Your usual (median) manager rating. Shown once, inside Manager vs Team (handbook P2-BASE-01). */
export const MANAGER_BASELINE = 6.4;
/** Share of your player ratings within ALIGNED_WITHIN of the fans' average. */
export const AGREEMENT = { season: 58, seasonN: 136, last5: 64, last5N: 45, prev5: 51, prev5N: 42 };
/**
 * A you-vs-fans comparison only counts once this many fans rated that player in that match (Warren, 10 Nov).
 * The user's own rating is never part of the fan average.
 */
export const FAN_MIN_RATINGS = 20;
/** Middle half of all your player ratings ("where you usually land"). */
export const RANGE_ALL = { low: 3.5, lowAt: "Alexander-Arnold @ Man City, 9 Nov", high: 9.5, highAt: "Salah vs Man City, 12 Jan", usualLow: 6.2, usualHigh: 7.6 };

/** Your season average per outfield group vs the fans' (goalkeeper excluded, as in Club Hub). */
export const MY_POSITIONS = [
  { label: "Attack", you: 7.3, fans: 7.1 },
  { label: "Midfield", you: 7.0, fans: 7.0 },
  { label: "Defence", you: 6.5, fans: 7.3 },
];

export type Pattern = "above" | "around" | "below";
/** A player as you rate him. `last6` is chronological (oldest first) with fixture labels. */
export type MyPlayer = {
  name: string; short: string; pos: string; no: number;
  you: number; fans: number; apps: number;
  low: number; lowAt: string; high: number; highAt: string; usualLow: number; usualHigh: number;
  myMotm: number; top3: number;
  last6: { label: string; date: string; v: number }[];
};

const LAST6 = [
  { label: "vs MCI", date: "12 Jan" },
  { label: "vs CHE", date: "24 Jan" },
  { label: "@ ARS", date: "31 Jan" },
  { label: "vs NEW", date: "7 Feb" },
  { label: "@ BHA", date: "18 Feb" },
  { label: "vs INT", date: "1 Mar" },
];
const seq = (vs: number[]) => LAST6.map((f, i) => ({ ...f, v: vs[i] }));

/** Players you've rated. Eligible for player filters: 5+ of your ratings. */
export const MY_PLAYERS: MyPlayer[] = [
  { name: "Mohamed Salah", short: "Salah", pos: "FWD", no: 11, you: 8.4, fans: 8.1, apps: 13, low: 6.5, lowAt: "@ Betis, 24 Oct", high: 9.5, highAt: "vs Man City, 12 Jan", usualLow: 7.8, usualHigh: 9.0, myMotm: 7, top3: 11, last6: seq([9.5, 8.6, 7.4, 8.2, 7.6, 8.9]) },
  { name: "Virgil van Dijk", short: "Van Dijk", pos: "DEF", no: 4, you: 8.0, fans: 7.8, apps: 13, low: 6.8, lowAt: "@ Man City, 9 Nov", high: 8.9, highAt: "@ Arsenal, 31 Jan", usualLow: 7.6, usualHigh: 8.4, myMotm: 3, top3: 9, last6: seq([8.1, 7.9, 8.9, 7.8, 8.4, 7.7]) },
  { name: "Alexis Mac Allister", short: "Mac Allister", pos: "MID", no: 10, you: 7.7, fans: 7.7, apps: 12, low: 6.4, lowAt: "@ Betis, 24 Oct", high: 8.7, highAt: "vs Newcastle, 7 Feb", usualLow: 7.3, usualHigh: 8.1, myMotm: 2, top3: 9, last6: seq([7.8, 7.6, 7.1, 8.7, 7.4, 7.9]) },
  { name: "Darwin Núñez", short: "Núñez", pos: "FWD", no: 9, you: 6.2, fans: 6.9, apps: 11, low: 4.2, lowAt: "@ Arsenal, 31 Jan", high: 8.1, highAt: "vs Austria Wien, 18 Oct", usualLow: 5.6, usualHigh: 6.8, myMotm: 0, top3: 2, last6: seq([6.9, 6.0, 4.2, 6.1, 5.4, 5.8]) },
  { name: "Trent Alexander-Arnold", short: "Alexander-Arnold", pos: "DEF", no: 66, you: 5.9, fans: 6.4, apps: 12, low: 3.5, lowAt: "@ Man City, 9 Nov", high: 7.8, highAt: "vs Inter, 1 Mar", usualLow: 5.2, usualHigh: 6.6, myMotm: 0, top3: 1, last6: seq([5.4, 6.2, 5.0, 6.4, 6.9, 7.8]) },
  { name: "Alisson Becker", short: "Alisson", pos: "GK", no: 1, you: 7.6, fans: 7.5, apps: 13, low: 6.6, lowAt: "@ Betis, 24 Oct", high: 8.8, highAt: "@ Man City, 9 Nov", usualLow: 7.2, usualHigh: 8.0, myMotm: 1, top3: 4, last6: seq([7.4, 7.7, 7.9, 7.5, 7.2, 7.6]) },
];

/**
 * Per player, every match you and FAN_MIN_RATINGS+ fans rated him: how often your rating was above the fans'
 * average, level with it (within ALIGNED_WITHIN), or below it. Sums to his apps. From the original "Your Ratings
 * v Fans" card (Above/Below Fan Average), now a swipe card in You vs Fans (12 Nov).
 */
export const PLAYER_VS_FANS: Record<string, { above: number; level: number; below: number }> = {
  Salah: { above: 7, level: 5, below: 1 },
  "Van Dijk": { above: 4, level: 7, below: 2 },
  "Mac Allister": { above: 2, level: 8, below: 2 },
  "Núñez": { above: 1, level: 2, below: 8 },
  "Alexander-Arnold": { above: 1, level: 3, below: 8 },
  Alisson: { above: 2, level: 9, below: 2 },
};

/* ---------- MOTM Profile (Michel, 10 Nov): new insights instead of "your MOTM picks" ---------- */

/** Minimum samples before an MOTM insight speaks, so it never rests on one or two matches (Warren). */
export const MOTM_MIN = { pair: 3, fanPick: 3, impact: 3, filter: 2, boldVotes: 100 };

/** Kit number for a player name (players you've rated, then the line-up). */
export function kitOf(name: string) {
  const p = MY_PLAYERS.find((x) => x.short === name) ?? LINEUP.find((x) => x.short === name);
  return p ? { no: p.no, keeper: p.pos === "GK" } : null;
}

export type SplitPair = { a: string; b: string; n: number; matches: JournalMatch[] };

/**
 * Compares your MOTM with the fans'. Pass Final matches only (same matches on both sides).
 * - Most common split pair: unordered, so {Van Dijk, Salah} counts whichever side picked whom.
 * - Agreement by fan pick: for each player the fans named MOTM, how often you picked him too.
 */
export function motmProfile(matches: JournalMatch[]) {
  const splits = matches.filter((m) => m.myMotm !== m.fanMotm);
  const pairs = new Map<string, SplitPair>();
  for (const m of splits) {
    const [a, b] = [m.myMotm, m.fanMotm].sort();
    const e = pairs.get(a + "|" + b) ?? { a, b, n: 0, matches: [] };
    e.n++;
    e.matches.push(m);
    pairs.set(a + "|" + b, e);
  }
  const topPair = [...pairs.values()].sort((x, y) => y.n - x.n)[0] ?? null;
  const fanPicks = new Map<string, { name: string; n: number; agreed: number }>();
  for (const m of matches) {
    const e = fanPicks.get(m.fanMotm) ?? { name: m.fanMotm, n: 0, agreed: 0 };
    e.n++;
    if (m.myMotm === m.fanMotm) e.agreed++;
    fanPicks.set(m.fanMotm, e);
  }
  const rate = (e: { n: number; agreed: number }) => e.agreed / e.n;
  const eligible = [...fanPicks.values()].filter((e) => e.n >= MOTM_MIN.fanPick).sort((x, y) => rate(x) - rate(y) || y.n - x.n);
  const tooFew = [...fanPicks.values()].filter((e) => e.n < MOTM_MIN.fanPick).sort((x, y) => y.n - x.n);
  return {
    n: matches.length,
    matched: matches.length - splits.length,
    splits,
    topPair: topPair && topPair.n >= MOTM_MIN.pair ? topPair : null,
    closestPair: topPair,
    byFanPick: [...eligible, ...tooFew],
    lowest: eligible.length >= 2 ? eligible[0] : null,
  };
}

/**
 * Your MOTM's output: goal / assist / both / neither, and the rating you gave your MOTM with a goal or assist
 * vs without (Michel's "MOTM rating impact"). Your own picks, so every rated match counts straight away.
 */
export function motmOutput(matches: JournalMatch[]) {
  const count = (g: MotmGA) => matches.filter((m) => m.myMotmGA === g).length;
  const parts = { goal: count("goal"), assist: count("assist"), both: count("both"), none: count("none") };
  const ratingOf = (m: JournalMatch) => lineupFor(m).find((p) => p.short === m.myMotm)?.you;
  const ratings = (withGA: boolean) => matches.filter((m) => (m.myMotmGA !== "none") === withGA).map(ratingOf).filter((v): v is number => v !== undefined);
  const withR = ratings(true), withoutR = ratings(false);
  return {
    n: matches.length,
    parts,
    withGA: matches.length - parts.none,
    impact: withR.length >= MOTM_MIN.impact && withoutR.length >= MOTM_MIN.impact
      ? { with: avg(withR), without: avg(withoutR), nWith: withR.length, nWithout: withoutR.length }
      : null,
  };
}

/** Kit and position for a player name. */
export function playerOf(name: string) {
  const p = MY_PLAYERS.find((x) => x.short === name) ?? LINEUP.find((x) => x.short === name);
  return p ? { no: p.no, pos: p.pos, keeper: p.pos === "GK" } : null;
}

const motmRatingOf = (m: JournalMatch) => lineupFor(m).find((p) => p.short === m.myMotm)?.you;
const isNum = (v: number | undefined): v is number => v !== undefined;

/**
 * Your MOTM picks with the rating you gave them that match (Michel, 10 Nov): overall average, and per player
 * picks, average and how often the fans picked him too. Your own picks, so every rated match counts at once.
 */
export function motmPicks(matches: JournalMatch[]) {
  const by = new Map<string, { short: string; picks: number; ratings: number[]; matched: number; matches: JournalMatch[] }>();
  for (const m of matches) {
    const e = by.get(m.myMotm) ?? { short: m.myMotm, picks: 0, ratings: [], matched: 0, matches: [] };
    e.picks++;
    const r = motmRatingOf(m);
    if (r !== undefined) e.ratings.push(r);
    if (m.myMotm === m.fanMotm) e.matched++;
    e.matches.push(m);
    by.set(m.myMotm, e);
  }
  const players = [...by.values()].map((e) => ({ ...e, avg: avg(e.ratings) })).sort((a, b) => b.picks - a.picks || b.avg - a.avg);
  return { n: matches.length, avg: avg(matches.map(motmRatingOf).filter(isNum)), players };
}

/** Your boldest MOTM call: the pick the smallest share of fans agreed with (Warren). Needs enough fan votes. */
export function motmBoldest(matches: JournalMatch[]) {
  const b = matches.filter((m) => m.fansRated >= MOTM_MIN.boldVotes).sort((x, y) => x.fanMotmShare - y.fanMotmShare)[0];
  return b ?? null;
}

export type StandoutSide = { motm: string; rating: number; next: string; nextRating: number; gap: number };

/**
 * MOTM Standout Factor (Michel + Warren, 11 Nov): per match, your MOTM's rating minus your next-highest rated
 * player, then averaged over the season. Fans: their most-voted MOTM minus their next-highest average, in the
 * same matches. A tie counts as +0.0. If someone else got a higher rating than the MOTM, the gap is negative.
 */
export function motmStandout(matches: JournalMatch[]) {
  const rows = matches.flatMap((m) => {
    const l = lineupFor(m);
    const side = (k: "you" | "fans", motm: string): StandoutSide | null => {
      const p = l.find((x) => x.short === motm);
      if (!p) return null;
      const next = l.filter((x) => x !== p).sort((a, b) => b[k] - a[k])[0];
      return { motm: p.short, rating: p[k], next: next.short, nextRating: next[k], gap: Math.round((p[k] - next[k]) * 10) / 10 };
    };
    const you = side("you", m.myMotm), fans = side("fans", m.fanMotm);
    return you && fans ? [{ m, you, fans }] : [];
  });
  if (rows.length < MOTM_MIN.impact) return null;
  const top = [...rows].sort((a, b) => b.you.gap - a.you.gap)[0];
  return {
    n: rows.length,
    you: avg(rows.map((r) => r.you.gap)),
    fans: avg(rows.map((r) => r.fans.gap)),
    top,
    youBelow: rows.filter((r) => r.you.gap < 0),
    fansBelow: rows.filter((r) => r.fans.gap < 0),
  };
}

/** Your MOTM picks by position (TechAhead's original card, brought back by Michel). */
export function motmByPosition(matches: JournalMatch[]) {
  const groups = [
    { pos: "FWD", label: "Attack" },
    { pos: "MID", label: "Midfield" },
    { pos: "DEF", label: "Defence" },
    { pos: "GK", label: "Goalkeeper" },
  ];
  return groups.map((g) => ({ ...g, n: matches.filter((m) => playerOf(m.myMotm)?.pos === g.pos).length }));
}

/** One player match by match, your rating vs the fans' (same fixtures only), for Where You Differ. */
export function playerMatches(p: MyPlayer) {
  const gap = p.you - p.fans;
  const wobble = [0.1, -0.2, 0, 0.2, -0.1, 0];
  return [...p.last6].reverse().map((x, i) => ({ label: x.label, date: x.date, you: x.v, fans: r1(x.v - gap + wobble[i]) }));
}

export function patternOf(v: number, base: number): Pattern {
  return v >= base + 0.3 ? "above" : v <= base - 0.3 ? "below" : "around";
}

/* ---------- one match, player by player (feeds the post-match story) ---------- */

export type LineupRating = { short: string; pos: "GK" | "DEF" | "MID" | "FWD"; no: number; you: number; fans: number; usual: number };

const LINEUP: Omit<LineupRating, "you" | "fans">[] = [
  { short: "Alisson", pos: "GK", no: 1, usual: 7.6 },
  { short: "Alexander-Arnold", pos: "DEF", no: 66, usual: 5.9 },
  { short: "Van Dijk", pos: "DEF", no: 4, usual: 8.0 },
  { short: "Konaté", pos: "DEF", no: 5, usual: 7.0 },
  { short: "Robertson", pos: "DEF", no: 26, usual: 6.8 },
  { short: "Mac Allister", pos: "MID", no: 10, usual: 7.7 },
  { short: "Gravenberch", pos: "MID", no: 38, usual: 6.8 },
  { short: "Szoboszlai", pos: "MID", no: 8, usual: 7.0 },
  { short: "Salah", pos: "FWD", no: 11, usual: 8.4 },
  { short: "Núñez", pos: "FWD", no: 9, usual: 6.2 },
  { short: "Díaz", pos: "FWD", no: 7, usual: 7.1 },
];
// Zero-sum spreads, so each match's 11 ratings average to its team rating.
const YOU_SPREAD = [0.1, -1.0, 0.6, -0.2, -0.4, 0.4, -0.5, 0.0, 1.3, -0.9, 0.6];
const FAN_SPREAD = [0.1, -0.3, 0.7, -0.1, -0.3, 0.3, -0.4, 0.1, 0.8, -0.3, -0.6];
const r1 = (x: number) => Math.round(Math.min(10, Math.max(1, x)) * 10) / 10;

/** Per-player ratings for one match. The open match is hand-tuned; the rest follow the spreads. */
export function lineupFor(m: JournalMatch): LineupRating[] {
  if (m.id === "open") {
    // Averages 7.5 (OPEN_MATCH.you). 6 of 11 within 0.3 of the fans; Salah is the biggest gap (+1.2).
    const you = [7.4, 6.1, 8.4, 7.5, 7.0, 7.9, 6.9, 7.5, 9.4, 6.4, 8.0];
    const fans = [7.3, 7.1, 8.4, 7.2, 7.0, 7.5, 7.0, 7.3, 8.2, 6.8, 7.6];
    return LINEUP.map((p, i) => ({ ...p, you: you[i], fans: fans[i] }));
  }
  const sum = [...m.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const you = arrange(YOU_SPREAD, sum % 7, LINEUP.findIndex((p) => p.short === m.myMotm));
  const fans = arrange(FAN_SPREAD, (sum * 3) % 11, LINEUP.findIndex((p) => p.short === m.fanMotm));
  const out = LINEUP.map((p, i) => ({ ...p, you: r1(m.you + you[i]), fans: r1(m.fans + fans[i]) }));
  const gap = STANDOUT_GAP[m.id];
  if (gap) {
    // Set the next-best player on each side so the MOTM stands out by a varied, realistic margin.
    const setNext = (k: "you" | "fans", motm: string, g: number, name?: string) => {
      const mi = out.findIndex((p) => p.short === motm);
      if (mi < 0) return;
      const next = r1(out[mi][k] - g);
      let ni = -1;
      out.forEach((p, i) => {
        if (i === mi) return;
        if (g >= 0 && p[k] > next) out[i] = { ...p, [k]: next };
        if (ni < 0 || out[i][k] > out[ni][k]) ni = i;
      });
      if (name) {
        ni = out.findIndex((p) => p.short === name);
        out.forEach((p, i) => { if (i !== mi && i !== ni && p[k] >= next) out[i] = { ...p, [k]: r1(next - 0.1) }; });
      }
      out[ni] = { ...out[ni], [k]: next };
    };
    setNext("you", m.myMotm, gap[0], gap[2]);
    setNext("fans", m.fanMotm, gap[1]);
  }
  return out;
}

/**
 * Sample: per match, [your MOTM minus your next-best player, the fans' MOTM minus their next-best].
 * 0 = a tie. Negative = someone else got a higher rating than the MOTM (Betis for you, Wolfsberger for the fans).
 * Optional third value: who your next-best player was.
 */
const STANDOUT_GAP: Record<string, [number, number, string?]> = {
  rated: [0.6, 0.3], closed: [0.3, 0.5], newcastle: [0.7, 0.0], arsenal: [1.0, 0.4], chelsea: [0.9, 0.6],
  "mci-home": [1.4, 0.4, "Van Dijk"], gladbach: [0.5, 0.6], salzburg: [1.1, 0.2], "mci-away": [1.0, 0.9], lask: [0.0, 0.4],
  betis: [-0.3, 0.2], austria: [0.9, 0.5], wolfsberg: [0.5, -0.2],
};

/** Rotate a zero-sum spread per match, then give the biggest share to that side's MOTM pick. */
function arrange(spread: number[], shift: number, motm: number) {
  const out = spread.map((_, i) => spread[(i + shift) % spread.length]);
  if (motm < 0) return out;
  const top = out.indexOf(Math.max(...out));
  [out[top], out[motm]] = [out[motm], out[top]];
  return out;
}

export const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

/* ---------- line-up comparison (Michel, 9 Nov): every rated match, you vs the fans, player by player ---------- */

export type SubRating = { short: string; no: number; you: number; fans: number };
const SUBS = [
  { short: "Jota", no: 20, you: -0.3, fans: -0.1 },
  { short: "Gakpo", no: 18, you: 0.2, fans: 0.0 },
  { short: "Elliott", no: 19, you: -0.6, fans: -0.4 },
];
/** Substitutes who came on (rated by you and the fans). */
export function subsFor(m: JournalMatch): SubRating[] {
  return SUBS.map((s) => ({ short: s.short, no: s.no, you: r1(m.you + s.you), fans: r1(m.fans + s.fans) }));
}
/** The fans' manager rating for that match (sample). */
export function fansManagerFor(m: JournalMatch) {
  return m.id === "open" ? 7.1 : r1(m.fans - 0.3);
}

/* ---------- Premium (later): previews only. The free experience launches first (Michel, 9 Nov). ---------- */

/** Fan percentile: share of fans who rated the player lower than you, across the season. */
export const PERCENTILES = [
  { short: "Salah", no: 11, pct: 92 },
  { short: "Van Dijk", no: 4, pct: 84 },
  { short: "Mac Allister", no: 10, pct: 61 },
  { short: "Alexander-Arnold", no: 66, pct: 23 },
  { short: "Núñez", no: 9, pct: 18 },
];

/* ---------- 14 Nov: the rest of TechAhead's original Journal cards, redesigned ---------- */

const round1 = (x: number) => Math.round(x * 10) / 10;
const median1 = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
const pairKey = (a: string, b: string) => [a, b].sort().join(" vs ");

/**
 * MOTM agreement at home vs away (original "MOTM Agreement Home/Away"). Fan comparison, so it includes a just-rated
 * match with the Live line. Each side needs MOTM_MIN.fanPick+ matches before it speaks.
 */
export function motmByVenue(matches: JournalMatch[]) {
  const side = (venue: "vs" | "@") => {
    const ms = matches.filter((m) => m.venue === venue);
    const splits = ms.filter((m) => m.myMotm !== m.fanMotm);
    const pairs = new Map<string, number>();
    for (const m of splits) pairs.set(pairKey(m.myMotm, m.fanMotm), (pairs.get(pairKey(m.myMotm, m.fanMotm)) ?? 0) + 1);
    const top = [...pairs.entries()].sort((a, b) => b[1] - a[1])[0];
    return { venue, n: ms.length, agreed: ms.length - splits.length, matches: ms, splits, topPair: top && top[1] >= 2 ? { pair: top[0], n: top[1] } : null };
  };
  return { home: side("vs"), away: side("@") };
}

/**
 * Your manager rating vs the fans' (original "Manager Baseline vs Fans"): usual (median) on both sides over the same
 * matches, and match by match how often you were above, level with (within ALIGNED_WITHIN) or below the fans.
 */
export function managerVsFans(matches: JournalMatch[]) {
  const rows = matches.map((m) => ({ m, you: m.manager, fans: fansManagerFor(m), gap: round1(m.manager - fansManagerFor(m)) }));
  const above = rows.filter((r) => r.gap > ALIGNED_WITHIN + 1e-9);
  const below = rows.filter((r) => r.gap < -ALIGNED_WITHIN - 1e-9);
  return {
    n: rows.length,
    you: median1(rows.map((r) => r.you)),
    fans: median1(rows.map((r) => r.fans)),
    above, below, level: rows.length - above.length - below.length,
    biggest: [...rows].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0] ?? null,
  };
}

/** Your manager rating by result (original "Manager Rating by Result"), next to your team rating for the same matches. */
export function managerByResult(matches: JournalMatch[]) {
  return (["W", "D", "L"] as Result[]).map((r) => {
    const ms = matches.filter((m) => m.result === r);
    return { r, n: ms.length, you: ms.length ? avg(ms.map((m) => m.manager)) : null, fans: ms.length ? avg(ms.map(fansManagerFor)) : null, team: ms.length ? avg(ms.map((m) => m.you)) : null };
  });
}

/**
 * Post-match story moments that only appear when they happen (14 Nov), from TechAhead's original Match Insights rows.
 * The core 10 moments stay the same; at most STORY_EXTRA.perGroup extra moments join each group, strongest first.
 */
/**
 * Your usual manager rating going into a match (Warren, 18 Nov): the median of your earlier ratings of the same
 * manager. The match itself never counts towards its own baseline, and a new manager starts from zero.
 * `n` is how many matches it rests on. Below MANAGER_USUAL_MIN there is no usual yet.
 */
export const MANAGER_USUAL_MIN = 3;
export const HEAD_COACH = "head-coach";
export function managerUsualBefore(m: JournalMatch, matches: JournalMatch[]): { usual: number | null; n: number } {
  const i = matches.findIndex((x) => x.id === m.id);
  const coach = m.coach ?? HEAD_COACH;
  const earlier = matches.slice(i + 1).filter((x) => (x.coach ?? HEAD_COACH) === coach);
  return { usual: earlier.length >= MANAGER_USUAL_MIN ? median1(earlier.map((x) => x.manager)) : null, n: earlier.length };
}

export const STORY_EXTRA = { resultGap: 0.5, resultMin: 3, highMin: 4, run: 3, managerGap: 0.5, perGroup: 2, steady: 0.8 };
/**
 * "Not your usual with the fans" (19 Nov): the old core card 9 (Team rating) came out of the main story, because it only
 * repeated what the match card already shows (client). It comes back only on a strong deviation from your usual
 * relationship with the fans (product): your team gap with the fans today is at least `shift` away from your usual
 * gap. Trust rules: at least `minMatches` earlier matches with final fan ratings, at least `minFans` fan ratings for
 * this match, the fans' average never includes your own rating, and it says "so far" until the window closes.
 * No record wording ("biggest ever"): records belong to Rare moments.
 */
export const TEAM_SHIFT = { shift: 0.5, minMatches: 5, minFans: 100 };

const teamOf = (m: JournalMatch) => avg(lineupFor(m).map((p) => p.you));
const n1 = (x: number) => Number(x.toFixed(1));
const fxLabel = (m: JournalMatch) => `${m.venue} ${m.code}`;

export type RunChip = { label: string; date: string; v: number; fans?: number };
export type StoryRun = { p: LineupRating; n: number; chips: RunChip[] };
export type StoryExtras = {
  result: { usual: number; today: number; gap: number; n: number } | null;
  high: { p: LineupRating; prevBest: number; prevAt: string; others: string[] } | null;
  /** Every season high this match, biggest jump first (high = the first). */
  highs: { p: LineupRating; prevBest: number; prevAt: string }[];
  run: { up: StoryRun | null; down: StoryRun | null } | null;
  weakest: { p: LineupRating } | null;
  manager: { you: number; fans: number; gap: number } | null;
  /** Your team gap with the fans today vs your usual gap (median over earlier matches). Gap = your team rating minus the fans'. */
  teamShift: { usual: number; today: number; shift: number; n: number; you: number; fans: number } | null;
  fanRun: (StoryRun & { dir: "above" | "below" }) | null;
  /**
   * Last vs this opponent (the original "Last vs Manchester City", 17 Nov): the last time you rated a match against
   * them, and every player in both line-ups, the biggest change first. The story picks the first one not already shown.
   */
  lastVs: { prev: JournalMatch; rows: { p: LineupRating; before: number }[]; teamBefore: number; teamToday: number } | null;
};

export function storyExtras(m: JournalMatch, matches: JournalMatch[]): StoryExtras {
  const lineup = lineupFor(m);
  const idx = matches.findIndex((x) => x.id === m.id);
  const older = matches.slice(idx + 1);
  const chain = [m, ...older];
  const at = (x: JournalMatch, short: string) => lineupFor(x).find((p) => p.short === short)!;

  // The result: a win, draw or loss you rated well away from your usual for that result.
  const same = older.filter((x) => x.result === m.result);
  let result: StoryExtras["result"] = null;
  if (same.length >= STORY_EXTRA.resultMin) {
    const today = n1(teamOf(m)), usual = n1(avg(same.map(teamOf)));
    const gap = round1(today - usual);
    if (Math.abs(gap) >= STORY_EXTRA.resultGap) result = { usual, today, gap, n: same.length };
  }

  // Season high: a player rated above his best earlier rating this season (needs highMin earlier ratings).
  const highs = lineup.flatMap((p) => {
    const prev = older.map((x) => ({ x, v: at(x, p.short).you }));
    if (prev.length < STORY_EXTRA.highMin) return [];
    const best = prev.reduce((a, b) => (b.v > a.v ? b : a));
    return p.you > best.v ? [{ p, prevBest: best.v, prevAt: `${fxLabel(best.x)}, ${best.x.date}`, jump: p.you - best.v }] : [];
  }).sort((a, b) => b.jump - a.jump || b.p.you - a.p.you);
  const high = highs.length ? { p: highs[0].p, prevBest: highs[0].prevBest, prevAt: highs[0].prevAt, others: highs.slice(1).map((h) => h.p.short) } : null;

  // On a run: run+ matches in a row above (or below) your usual for a player, ending with this match.
  const streak = (test: (x: JournalMatch) => boolean) => { let n = 0; for (const x of chain) { if (test(x)) n++; else break; } return n; };
  const chips = (short: string, n: number, withFans = false): RunChip[] => chain.slice(0, Math.min(n, 5)).reverse().map((x) => {
    const p = at(x, short);
    return { label: fxLabel(x), date: x.date, v: p.you, ...(withFans ? { fans: p.fans } : {}) };
  });
  const runs = (dir: 1 | -1) => lineup.map((p) => ({ p, n: streak((x) => dir * (at(x, p.short).you - p.usual) >= 0.3 - 1e-9) }))
    .filter((r) => r.n >= STORY_EXTRA.run).sort((a, b) => b.n - a.n)[0] ?? null;
  const upR = runs(1), downR = runs(-1);
  const run = upR || downR ? {
    up: upR ? { ...upR, chips: chips(upR.p.short, upR.n) } : null,
    down: downR ? { ...downR, chips: chips(downR.p.short, downR.n) } : null,
  } : null;

  // Same weakest link: your lowest-rated player is the fans' lowest-rated too.
  const lowYou = [...lineup].sort((a, b) => a.you - b.you)[0];
  const lowFans = [...lineup].sort((a, b) => a.fans - b.fans)[0];
  const weakest = lowYou.short === lowFans.short ? { p: lowYou } : null;

  // The manager, you vs the fans, this match.
  const mf = fansManagerFor(m), mg = round1(m.manager - mf);
  const manager = Math.abs(mg) >= STORY_EXTRA.managerGap ? { you: m.manager, fans: mf, gap: mg } : null;

  // Against the fans, again: run+ matches in a row above (or below) the fans on one player.
  const fanRuns = lineup.flatMap((p) => (["above", "below"] as const).map((dir) => ({
    p, dir, n: streak((x) => { const q = at(x, p.short); const g = round1(q.you - q.fans); return dir === "above" ? g > ALIGNED_WITHIN + 1e-9 : g < -ALIGNED_WITHIN - 1e-9; }),
  }))).filter((r) => r.n >= STORY_EXTRA.run).sort((a, b) => b.n - a.n)[0];
  const fanRun = fanRuns ? { ...fanRuns, chips: chips(fanRuns.p.short, fanRuns.n, true) } : null;

  // Last vs this opponent: the last match you rated against the same team this season.
  const prevVs = older.find((x) => x.opp === m.opp) ?? null;
  const lastVs = prevVs ? {
    prev: prevVs,
    rows: lineup.map((p) => ({ p, before: at(prevVs, p.short).you })).sort((a, b) => Math.abs(b.p.you - b.before) - Math.abs(a.p.you - a.before) || b.p.you - a.p.you),
    teamBefore: n1(teamOf(prevVs)), teamToday: n1(teamOf(m)),
  } : null;

  // Not your usual with the fans: today's team gap vs your usual team gap, on match-level team averages.
  const teamGapOf = (x: JournalMatch) => round1(x.you - x.fans);
  let teamShift: StoryExtras["teamShift"] = null;
  if (older.length >= TEAM_SHIFT.minMatches && m.fansRated >= TEAM_SHIFT.minFans) {
    const usual = round1(median1(older.map(teamGapOf))), today = teamGapOf(m), shift = round1(today - usual);
    if (Math.abs(shift) >= TEAM_SHIFT.shift - 1e-9) teamShift = { usual, today, shift, n: older.length, you: m.you, fans: m.fans };
  }

  return { result, high, highs: highs.map(({ p, prevBest, prevAt }) => ({ p, prevBest, prevAt })), run, weakest, manager, fanRun, lastVs, teamShift };
}

/* ---------- 17 Nov: the last of TechAhead's original cards ---------- */

/**
 * Every rating you gave each player this season, match by match (sample). It matches MY_PLAYERS: the median is his
 * usual, the lowest and highest sit at lowAt / highAt, and the last 6 are the ones in Player Pattern. null = he
 * didn't play. Feeds How You Rate (the original distribution chart) and Results and Your Players (the original
 * "Results Influence How You Rate Salah").
 */
const SEASON_IDS = ["rated", "closed", "newcastle", "arsenal", "chelsea", "mci-home", "gladbach", "salzburg", "mci-away", "lask", "betis", "austria", "wolfsberg"];
const PLAYER_SEASON_RAW: Record<string, (number | null)[]> = {
  //                  INT  BHA  NEW  ARS  CHE  MCI  BMG  SAL  @MCI LASK BET  AUS  WAC
  Salah:             [8.9, 7.6, 8.2, 7.4, 8.6, 9.5, 8.3, 9.2, 7.8, 8.4, 6.5, 9.1, 9.0],
  "Van Dijk":        [7.7, 8.4, 7.8, 8.9, 7.9, 8.1, 7.3, 8.6, 6.8, 8.2, 7.5, 8.5, 8.0],
  "Mac Allister":    [7.9, 7.4, 8.7, 7.1, 7.6, 7.8, 7.5, 8.2, 7.2, 8.0, 6.4, 8.3, null],
  "Núñez":           [5.8, 5.4, 6.1, 4.2, 6.0, 6.9, null, 6.8, null, 6.5, 6.2, 8.1, 6.3],
  "Alexander-Arnold": [7.8, 6.9, 6.4, 5.0, 6.2, 5.4, 5.6, 6.0, 3.5, 6.8, 4.8, null, 5.8],
  Alisson:           [7.6, 7.2, 7.5, 7.9, 7.7, 7.4, 7.0, 8.0, 8.8, 8.1, 6.6, 8.3, 7.1],
};

/** One player's season: every match you rated him, newest first. */
export function playerSeason(short: string) {
  const raw = PLAYER_SEASON_RAW[short] ?? [];
  return SEASON_IDS.flatMap((id, i) => {
    const m = JOURNAL_MATCHES.find((x) => x.id === id);
    return m && raw[i] != null ? [{ m, v: raw[i] as number }] : [];
  });
}

/** One-point rating bands, as in the original "How You Rate Salah" chart. */
export const RATING_BANDS = [
  { id: "u5", label: "Under 5", lo: 0, hi: 5 },
  { id: "5", label: "5–5.9", lo: 5, hi: 6 },
  { id: "6", label: "6–6.9", lo: 6, hi: 7 },
  { id: "7", label: "7–7.9", lo: 7, hi: 8 },
  { id: "8", label: "8–8.9", lo: 8, hi: 9 },
  { id: "9", label: "9–10", lo: 9, hi: 10.01 },
];
/** All your player ratings this season per band (sample: BASELINE.ratings in all, median 6.8, middle half 6.2–7.6). */
export const ALL_BANDS = [9, 21, 50, 42, 16, 5];

export function bandCounts(values: number[]) {
  return RATING_BANDS.map((b) => values.filter((v) => v >= b.lo - 1e-9 && v < b.hi - 1e-9).length);
}

/** Your average rating for a player after a win, a draw and a loss. */
export function playerByResult(short: string) {
  const rows = playerSeason(short);
  return (["W", "D", "L"] as Result[]).map((r) => {
    const vs = rows.filter((x) => x.m.result === r).map((x) => x.v);
    return { r, n: vs.length, avg: vs.length ? round1(avg(vs)) : null };
  });
}

/**
 * When You Strongly Disagreed (the original card): your ratings 2.0 or more away from the fans' average for that
 * player in that match, this season (sample, out of AGREEMENT.seasonN compared ratings).
 */
export const STRONG_GAP = 2.0;
export const STRONG_DISAGREE: { short: string; id: string; you: number; fans: number }[] = [
  { short: "Salah", id: "salzburg", you: 9.2, fans: 7.0 },
  { short: "Núñez", id: "arsenal", you: 4.2, fans: 6.4 },
  { short: "Van Dijk", id: "arsenal", you: 8.9, fans: 6.8 },
  { short: "Salah", id: "lask", you: 8.4, fans: 6.3 },
  { short: "Salah", id: "austria", you: 9.1, fans: 7.1 },
];

/**
 * Advanced Fan Split (the original Premium+ card): casual fans vs season-ticket holders, this match. Sample: the real
 * split needs RATEM to know which fans hold a season ticket.
 */
export function fanSplitFor(m: JournalMatch) {
  const fans = avg(lineupFor(m).map((p) => p.fans));
  const st = Math.round(m.fansRated * 0.38);
  return {
    season: { n: st, v: round1(fans - 0.3) },
    casual: { n: m.fansRated - st, v: round1(fans + 0.2) },
  };
}

/* ---------- Rare moments (after launch), 16 Nov thread: Michel, Warren, Jimmy ---------- */

/**
 * A rare moment = a new personal record in your whole RATEM history. It is its own thing, not part of Your Patterns:
 * one gold card at the end of the post-match story, and every record you hold sits on a "Your records" shelf.
 * - "Ever" has to mean something: nothing shows until you've rated `minMatches` matches before this one.
 * - Up to `perMatch` records in one match (Michel, 16 Nov evening), shown as ONE gold card you swipe through,
 *   strongest first. There is no "one card in every N matches" rule any more: the thresholds keep them rare.
 * - A record has to beat the old one clearly: by `margin` rating points (`marginPct` points for MOTM share).
 *   A tie isn't a record, and only edging past it quietly updates the shelf, without a card.
 * - Strongest = beats its old record by the most, measured in those margins.
 * - Player records ("your lowest ever for Salah, across 113 matches you've rated him") need `minPlayer` ratings
 *   of that player, so they come with more seasons. Not in this sample.
 */
export const RARE = { minMatches: 30, minPlayer: 20, perMatch: 3, margin: 0.2, marginPct: 3 };
export type RareKind = "teamHigh" | "teamLow" | "high" | "low" | "mgrHigh" | "mgrLow" | "gap" | "motm" | "split";
/** Also the tie-break when two records are equally strong. */
export const RARE_ORDER: RareKind[] = ["teamHigh", "teamLow", "high", "low", "gap", "motm", "split", "mgrHigh", "mgrLow"];
export const RARE_NAME: Record<RareKind, string> = {
  teamHigh: "Highest match rating",
  teamLow: "Lowest match rating",
  high: "Highest player rating",
  low: "Lowest player rating",
  mgrHigh: "Highest manager rating",
  mgrLow: "Lowest manager rating",
  gap: "Biggest gap in a match",
  motm: "Boldest MOTM call",
  split: "Biggest split with the fans",
};
const RARE_LOWER = new Set<RareKind>(["teamLow", "low", "mgrLow", "motm"]);
/** Sample: the fan rated 60 matches last season (2024/25), and these were their records going into this one. */
export const RARE_PAST: { matches: number; perMatch: number } & Record<RareKind, number> = {
  matches: 60, perMatch: 11, teamHigh: 7.8, teamLow: 4.7, high: 9.2, low: 3.7, mgrHigh: 7.2, mgrLow: 5.1, gap: 2.7, motm: 12, split: 2.0,
};

export type RareRecord = {
  kind: RareKind;
  value: number;
  m: JournalMatch;
  /** The player behind it: the rating (high, low), your highest-rated (gap), your MOTM (motm), the split (split). */
  p?: LineupRating;
  /** gap: your lowest-rated player that match. */
  q?: LineupRating;
  /** The record it beat, and where that one was set. */
  prev: { value: number; at: string };
  /** How clearly it beat the old record, in margins (1 = exactly the margin). Below 1 = shelf only. */
  strength: number;
  /** Matches you had rated, this one included, and the player ratings behind them. */
  matches: number;
  ratings: number;
};

/** Your records, oldest match first. Needs last season behind it (the full sample), so a new fan has none. */
export function rareMoments(matches: JournalMatch[]) {
  const past = matches.length >= JOURNAL_MATCHES.length ? RARE_PAST : null;
  const held = new Map<RareKind, RareRecord | { value: number; at: string }>();
  if (past) for (const k of RARE_ORDER) held.set(k, { value: past[k], at: "last season" });
  const shown = new Map<string, RareRecord[]>();
  const chrono = [...matches].reverse();
  chrono.forEach((m, i) => {
    const lineup = lineupFor(m);
    const byYou = [...lineup].sort((a, b) => b.you - a.you);
    const top = byYou[0], bottom = byYou[byYou.length - 1];
    const split = [...lineup].sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans))[0];
    const now: Record<RareKind, { value: number; p?: LineupRating; q?: LineupRating }> = {
      teamHigh: { value: n1(m.you) },
      teamLow: { value: n1(m.you) },
      high: { value: top.you, p: top },
      low: { value: bottom.you, p: bottom },
      mgrHigh: { value: m.manager },
      mgrLow: { value: m.manager },
      gap: { value: round1(top.you - bottom.you), p: top, q: bottom },
      motm: { value: m.fanMotmShare, p: lineup.find((p) => p.short === m.myMotm) ?? top },
      split: { value: round1(Math.abs(split.you - split.fans)), p: split },
    };
    const total = (past?.matches ?? 0) + i + 1;
    const broken: RareRecord[] = [];
    for (const k of RARE_ORDER) {
      const old = held.get(k);
      const prev = old ? { value: old.value, at: "m" in old ? `${fxLabel(old.m)}, ${old.m.date}` : old.at } : null;
      const by = prev ? (RARE_LOWER.has(k) ? prev.value - now[k].value : now[k].value - prev.value) : 0;
      if (prev && by <= 1e-9) continue; // not better (a tie doesn't count)
      const strength = by / (k === "motm" ? RARE.marginPct : RARE.margin);
      const rec: RareRecord = { kind: k, ...now[k], m, prev: prev ?? { value: now[k].value, at: "" }, strength, matches: total, ratings: total * RARE_PAST.perMatch };
      held.set(k, rec);
      if (prev && strength >= 1 - 1e-9) broken.push(rec);
    }
    if (broken.length && total - 1 >= RARE.minMatches) {
      shown.set(m.id, broken.sort((a, b) => b.strength - a.strength || RARE_ORDER.indexOf(a.kind) - RARE_ORDER.indexOf(b.kind)).slice(0, RARE.perMatch));
    }
  });
  const total = (past?.matches ?? 0) + matches.length;
  const records = [...held.values()].filter((r): r is RareRecord => "m" in r)
    .sort((a, b) => matches.indexOf(a.m) - matches.indexOf(b.m) || b.strength - a.strength || RARE_ORDER.indexOf(a.kind) - RARE_ORDER.indexOf(b.kind));
  /** Did this record get revealed on a gold card? */
  const onCard = (r: RareRecord) => Boolean(shown.get(r.m.id)?.some((x) => x.kind === r.kind));
  return { shown, records, onCard, total, enough: total >= RARE.minMatches, latest: matches[0]?.id ?? null };
}

/* ---------- Premium (later), 14 Nov: the original paid and identity cards ---------- */

/** Your MOTM in wins vs losses (original Paid "In Wins / In Losses"): who you crown, and the rating you give them. */
export function motmByResult(matches: JournalMatch[]) {
  return (["W", "L"] as Result[]).map((r) => {
    const ms = matches.filter((m) => m.result === r);
    const by = new Map<string, number>();
    for (const m of ms) by.set(m.myMotm, (by.get(m.myMotm) ?? 0) + 1);
    const picks = [...by.entries()].sort((a, b) => b[1] - a[1]).map(([short, n]) => ({ short, n }));
    const ratings = ms.map((m) => lineupFor(m).find((p) => p.short === m.myMotm)?.you).filter((v): v is number => v !== undefined);
    return { r, n: ms.length, picks, avg: ratings.length ? avg(ratings) : null };
  });
}

/**
 * Low MOTM agreement (original Paid "Low MOTM Agreement Identity"): how often you match the fans' MOTM, placed
 * among all fans who rated 10+ matches. Sample distribution; needs the real one before build.
 */
export const MOTM_INDEPENDENCE = { fansMedian: 74, moreIndependentThan: 71, fansCompared: 8240 };

/** Scapegoat (original identity card): the player whose rating from you drops most after a loss. */
export function scapegoat(matches: JournalMatch[]) {
  const wins = matches.filter((m) => m.result === "W"), losses = matches.filter((m) => m.result === "L");
  if (wins.length < 3 || losses.length < 3) return null;
  const rows = lineupFor(matches[0]).map((p) => {
    const w = avg(wins.map((m) => lineupFor(m).find((q) => q.short === p.short)!.you));
    const l = avg(losses.map((m) => lineupFor(m).find((q) => q.short === p.short)!.you));
    return { p, wins: w, losses: l, drop: w - l };
  }).sort((a, b) => b.drop - a.drop);
  return { top: rows[0], next: rows[1], nWins: wins.length, nLosses: losses.length };
}

/* ---------- Fan archetypes (Michel's "RATEM Fan Archetypes" doc, 14 Nov) ---------- */

export type ArchetypeId = "realist" | "critic" | "optimist" | "reactor" | "loyalist" | "technician" | "moment" | "maverick" | "specialist" | "streak" | "scout";
export type Archetype = { id: ArchetypeId; name: string; colour: string; line: string; min: string; tier: "Free" | "Premium"; phase: "V1.5" | "V2" | "V3"; needs?: string };

/** The doc's list and rollout. V1 shows none; V1.5 (premium launch) adds the first five, free. */
export const ARCHETYPES: Archetype[] = [
  { id: "realist", name: "The Realist", colour: "#34d399", line: "You rate in line with most fans.", min: "5 matches", tier: "Free", phase: "V1.5" },
  { id: "critic", name: "The Critic", colour: "#ff7a6b", line: "You set higher standards.", min: "8 matches", tier: "Free", phase: "V1.5" },
  { id: "optimist", name: "The Optimist", colour: "#ffd34d", line: "You see the positives more than most fans.", min: "8 matches", tier: "Free", phase: "V1.5" },
  { id: "reactor", name: "The Reactor", colour: "#3d7bff", line: "Match results shape your ratings.", min: "10 matches", tier: "Free", phase: "V1.5" },
  { id: "loyalist", name: "The Loyalist", colour: "#9b8cff", line: "You back your players more than most fans.", min: "10 matches", tier: "Free", phase: "V1.5" },
  { id: "technician", name: "The Technician", colour: "#ff9f43", line: "You reward the invisible work.", min: "15 matches", tier: "Premium", phase: "V2", needs: "Pass and involvement stats" },
  { id: "moment", name: "The Moment Rater", colour: "#c58b5c", line: "Goals define your ratings.", min: "15 matches", tier: "Premium", phase: "V2", needs: "Goals per player" },
  { id: "maverick", name: "The Maverick", colour: "#e6e9f2", line: "You often see the game differently.", min: "12 matches", tier: "Premium", phase: "V2" },
  { id: "specialist", name: "The Specialist", colour: "#c86cf0", line: "You know one position inside out.", min: "15 matches", tier: "Premium", phase: "V2" },
  { id: "streak", name: "The Streak Defender", colour: "#a0603a", line: "You stick with your players.", min: "20 matches", tier: "Premium", phase: "V3", needs: "A full season" },
  { id: "scout", name: "The Scout", colour: "#2ecc71", line: "You spot talent before everyone else.", min: "Full season", tier: "Premium", phase: "V3", needs: "Season-end comparison" },
];
export const archetype = (id: ArchetypeId) => ARCHETYPES.find((a) => a.id === id)!;

/**
 * Sample numbers the archetypes need that the prototype can't compute: how steadily you rate the same players
 * (consistency) and the share of the fans' MOTM picks who scored (the doc's 45%).
 */
export const ARCHETYPE_SAMPLE = { consistency: 74, fansMotmScored: 45 };

export type DnaTrait = { id: ArchetypeId; slight: boolean; trait: string; evidence: string; meaning: string };

/**
 * Your Fan DNA: one primary archetype and up to 3 supporting traits ("a touch of …"), each as
 * Trait → Evidence → Interpretation. Comparisons are relative to the fans (the doc's overview: how you rate
 * differently from the average supporter), so the Reactor needs a bigger win/loss swing than the fans', not just > 0.8.
 */
export function fanDna(matches: JournalMatch[]) {
  const n = matches.length;
  const gap = round1(BASELINE.you - BASELINE.fans);
  const s = season(matches);
  const w = s.result[0], l = s.result[2];
  const swing = w.you !== null && l.you !== null ? w.you - l.you : 0;
  const fanSwing = w.fans !== null && l.fans !== null ? w.fans - l.fans : 0;
  const rel = round1(swing - fanSwing);
  const el = MY_PLAYERS.filter((p) => p.apps >= MIN_MATCHES);
  const below = el.filter((p) => p.you < p.fans), above = el.filter((p) => p.you > p.fans);
  const low = [...el].sort((a, b) => (a.you - a.fans) - (b.you - b.fans)).slice(0, 2).filter((p) => p.you < p.fans);
  const scored = matches.filter((m) => m.myMotmGA === "goal" || m.myMotmGA === "both").length;
  const scoredPct = Math.round((scored / Math.max(1, n)) * 100);
  const sign = (x: number) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x).toFixed(1)}`;
  const traits: DnaTrait[] = [];
  // Primary candidates (the doc's thresholds; the first five are the V1.5 set).
  if (n >= 8 && gap <= -0.6 && below.length / el.length >= 0.6) traits.push({ id: "critic", slight: false, trait: "You set higher standards.", evidence: `You rate ${sign(gap)} vs the fans, below them on ${below.length} of ${el.length} players.`, meaning: "You see what needs improving." });
  if (n >= 8 && gap >= 0.6 && above.length / el.length >= 0.6) traits.push({ id: "optimist", slight: false, trait: "You see the positives more than most fans.", evidence: `You rate ${sign(gap)} vs the fans, above them on ${above.length} of ${el.length} players.`, meaning: "You focus on what players do well." });
  if (n >= 10 && rel > 0.8) traits.push({ id: "reactor", slight: false, trait: "Match results shape your ratings.", evidence: `${sign(swing)} after wins vs losses, the fans ${sign(fanSwing)}.`, meaning: "The result changes how you see the whole side." });
  if (n >= 10 && el.filter((p) => p.you - p.fans >= 0.8).length / el.length >= 0.6) traits.push({ id: "loyalist", slight: false, trait: "You back your players more than most fans.", evidence: `0.8+ above the fans on most of your players.`, meaning: "You believe in them when others doubt." });
  if (n >= 5 && Math.abs(gap) <= 0.4 && ARCHETYPE_SAMPLE.consistency >= 70) traits.push({ id: "realist", slight: false, trait: "You rate in line with most fans.", evidence: `Your usual ${BASELINE.you.toFixed(1)} vs the fans' ${BASELINE.fans.toFixed(1)} (${sign(gap)}), and you rate the same players steadily: ${ARCHETYPE_SAMPLE.consistency}% consistency.`, meaning: "You see what most supporters see." });
  // Supporting traits: a lean in an archetype's direction that doesn't reach its threshold.
  if (gap <= -0.15 && gap > -0.6 && low.length) traits.push({ id: "critic", slight: true, trait: "A touch of the Critic", evidence: `Tougher than the fans on ${low.map((p) => `${p.short} (${sign(round1(p.you - p.fans))})`).join(" and ")}.`, meaning: "You notice what needs improving." });
  if (gap >= 0.15 && gap < 0.6) traits.push({ id: "optimist", slight: true, trait: "A touch of the Optimist", evidence: `${sign(gap)} vs the fans on average.`, meaning: "You lean towards the positives." });
  if (rel >= 0.3 && rel <= 0.8) traits.push({ id: "reactor", slight: true, trait: "A touch of the Reactor", evidence: `${sign(swing)} after wins vs losses, the fans ${sign(fanSwing)}.`, meaning: "Results move you a little more than most." });
  if (scoredPct > ARCHETYPE_SAMPLE.fansMotmScored && scoredPct < 65) traits.push({ id: "moment", slight: true, trait: "A touch of the Moment Rater", evidence: `${scored} of your ${n} MOTMs scored. The fans' MOTMs: ${ARCHETYPE_SAMPLE.fansMotmScored}%.`, meaning: "Goals catch your eye." });
  const primary = traits.find((t) => !t.slight) ?? null;
  const supporting = traits.filter((t) => t.slight).slice(0, 3);
  const pos = [...MY_POSITIONS].sort((a, b) => b.you - a.you);
  const posGap = [...MY_POSITIONS].sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans))[0];
  const byGap = [...matches].sort((a, b) => Math.abs(a.you - a.fans) - Math.abs(b.you - b.fans));
  const contro = [...el].sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans))[0];
  return {
    n, gap, primary, supporting,
    glance: { agreement: AGREEMENT.season, consistency: ARCHETYPE_SAMPLE.consistency, bias: `Favours ${pos[0].label.toLowerCase()}` },
    tendencies: [
      `You rate ${sign(gap)} vs the fans on average`,
      `You disagree most on ${posGap.label === "Attack" ? "attackers" : posGap.label === "Midfield" ? "midfielders" : "defenders"} (${sign(round1(posGap.you - posGap.fans))})`,
      `Results move you ${rel >= 0.15 ? "a little more than" : rel <= -0.15 ? "less than" : "as much as"} the fans (${sign(swing)} after wins vs losses)`,
    ],
    patterns: { aligned: byGap[0], apart: byGap[byGap.length - 1], player: contro },
    opposite: gap <= 0 ? archetype("optimist") : archetype("critic"),
    later: ARCHETYPES.filter((a) => a.phase !== "V1.5" && !traits.some((t) => t.id === a.id)),
  };
}

/** Highs & Lows (original identity card): often in your top 3 AND often in your bottom 3. Ties go to more swings. */
export function highsLows(matches: JournalMatch[]) {
  const rows = lineupFor(matches[0]).map((p) => {
    let top = 0, bottom = 0;
    for (const m of matches) {
      const s = [...lineupFor(m)].sort((a, b) => b.you - a.you);
      if (s.slice(0, 3).some((q) => q.short === p.short)) top++;
      if (s.slice(-3).some((q) => q.short === p.short)) bottom++;
    }
    return { p, top, bottom, of: matches.length };
  });
  return rows.sort((a, b) => Math.min(b.top, b.bottom) - Math.min(a.top, a.bottom) || (b.top + b.bottom) - (a.top + a.bottom))[0] ?? null;
}

/** Rarely Dominant, but Unstoppable: in your top 3 only now and then, but well above his usual when he is. */
export function rarelyDominant(matches: JournalMatch[]) {
  const rows = lineupFor(matches[0]).map((p) => {
    const tops = matches.filter((m) => [...lineupFor(m)].sort((a, b) => b.you - a.you).slice(0, 3).some((q) => q.short === p.short));
    const ratings = tops.map((m) => lineupFor(m).find((q) => q.short === p.short)!.you);
    return { p, n: tops.length, of: matches.length, avgTop: ratings.length ? avg(ratings) : 0, best: tops.length ? Math.max(...ratings) : 0, matches: tops };
  }).filter((r) => r.n >= 2 && r.n <= Math.max(2, Math.floor(matches.length / 5)));
  return rows.sort((a, b) => (b.avgTop - b.p.usual) - (a.avgTop - a.p.usual))[0] ?? null;
}
