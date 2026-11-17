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
  { label: "Defence", you: 6.8, fans: 7.3 },
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
