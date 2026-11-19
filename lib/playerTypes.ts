// Player relationships (premium): Michel's "Ratem Player Relationship Logic" doc, 14 Nov.
// Each type is revealed only when a player passes every threshold; when several pass, the doc's tie-breaks pick one.
// The rules need a long season (12+ appearances per player, 7+ losses for Scapegoat), so the premium preview uses a
// constructed full sample season. Every figure is illustrative.

import { lineupFor, type JournalMatch, type Result } from "./journal";

export type TypeId = "unsung" | "consistent" | "highslows" | "scapegoat" | "moments";
export type SeasonMatch = { id: string; label: string; date: string; result: Result; ratings: Record<string, number>; motm: string };
export type PlayerInfo = { short: string; no: number; pos: "GK" | "DEF" | "MID" | "FWD" };

export const SQUAD: PlayerInfo[] = [
  { short: "Alisson", no: 1, pos: "GK" }, { short: "Alexander-Arnold", no: 66, pos: "DEF" }, { short: "Van Dijk", no: 4, pos: "DEF" },
  { short: "Konaté", no: 5, pos: "DEF" }, { short: "Robertson", no: 26, pos: "DEF" }, { short: "Mac Allister", no: 10, pos: "MID" },
  { short: "Gravenberch", no: 38, pos: "MID" }, { short: "Szoboszlai", no: 8, pos: "MID" }, { short: "Salah", no: 11, pos: "FWD" },
  { short: "Núñez", no: 9, pos: "FWD" }, { short: "Díaz", no: 7, pos: "FWD" },
];

/* ---------------- the doc's thresholds ---------------- */

export const RULES = {
  minApps: 12,
  highslows: { min: 3, share: 0.15, gap: 2.5 },
  moments: { min: 3, rating: 9, maxShare: 0.25, restBelow: 7.5 },
  consistent: { share: 0.9, band: 0.5 },
  unsung: { top3: 10, withoutShare: 0.9, maxMotm: 2 },
  scapegoat: { losses: 7, wd: 7, bottom: 7, bottomShare: 0.5, drop: 2.0 },
};

/* ---------------- full sample season (30 matches) ---------------- */

const OPP = ["Wolfsberger", "Austria Wien", "Betis", "LASK", "Man City", "Salzburg", "Gladbach", "Man City", "Chelsea", "Arsenal", "Newcastle", "Brighton", "Inter", "Rapid Wien", "Hartberg", "Celtic", "Klagenfurt", "Altach", "Ajax", "Lyon", "Rapid Wien", "Wolfsberger", "LASK", "Benfica", "Austria Wien", "Salzburg", "Hartberg", "PSV", "Klagenfurt", "Altach"];
const CODE: Record<string, string> = { Wolfsberger: "WAC", "Austria Wien": "AUS", Betis: "BET", LASK: "LAS", "Man City": "MCI", Salzburg: "SAL", Gladbach: "BMG", Chelsea: "CHE", Arsenal: "ARS", Newcastle: "NEW", Brighton: "BHA", Inter: "INT", "Rapid Wien": "RAP", Hartberg: "HAR", Celtic: "CEL", Klagenfurt: "KLA", Altach: "ALT", Ajax: "AJA", Lyon: "LYO", Benfica: "BEN", PSV: "PSV" };
const RES = "WDLWWLWDWLWWLWDWWLWDWLWWDLWWLD".split("") as Result[];
const DATES = ["9 Aug", "16 Aug", "23 Aug", "30 Aug", "13 Sep", "20 Sep", "27 Sep", "4 Oct", "18 Oct", "24 Oct", "1 Nov", "9 Nov", "22 Nov", "29 Nov", "6 Dec", "10 Dec", "13 Dec", "20 Dec", "17 Jan", "24 Jan", "31 Jan", "7 Feb", "14 Feb", "18 Feb", "21 Feb", "28 Feb", "1 Mar", "7 Mar", "14 Mar", "21 Mar"];

function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
const r1 = (x: number) => Math.round(Math.min(10, Math.max(1, x)) * 10) / 10;

const TAA_HIGH = new Set([1, 4, 8, 11, 14, 19, 23, 26]);
const TAA_LOW = new Set([3, 7, 12, 16, 20, 24]);
const MOMENTS = new Set([6, 10, 15, 27]);
const UNSUNG = new Set([0, 3, 4, 8, 11, 13, 14, 16, 19, 21, 23, 25, 26, 29]);
const UNSUNG_MOTM = 13;
const DIAZ_SPARED = new Set([22]);

/** A constructed full season: the five relationship patterns are built in, everything else is ordinary noise. */
export const SEASON_FULL: SeasonMatch[] = (() => {
  const rand = rng(11);
  const w = (s: number) => (rand() - 0.5) * s;
  return RES.map((res, i) => {
    const level = (res === "W" ? 7.1 : res === "D" ? 6.5 : 5.6) + w(0.3);
    const v: Record<string, number> = {};
    v["Alisson"] = i === 9 ? 8.6 : i === 21 ? 6.1 : 7.2 + ((i * 7) % 6) / 10 * 0.9;
    v["Van Dijk"] = level + 0.2 + w(0.5);
    v["Konaté"] = level - 0.1 + w(0.6);
    v["Robertson"] = level - 0.2 + w(0.6);
    v["Gravenberch"] = level - 0.2 + w(0.6);
    v["Szoboszlai"] = level + 0.0 + w(0.6);
    v["Salah"] = level + 0.9 + w(0.4);
    v["Mac Allister"] = level + 0.1 + w(0.4);
    v["Alexander-Arnold"] = TAA_HIGH.has(i) ? 8.75 + w(0.3) : TAA_LOW.has(i) ? 4.9 + w(0.6) : level + 0.05 + w(0.3);
    v["Núñez"] = MOMENTS.has(i) ? 9.3 + w(0.5) : level - 0.5 + w(0.8);
    v["Díaz"] = res === "L" && !DIAZ_SPARED.has(i) ? 4.7 + w(0.5) : level + 0.3 + w(0.4);
    if (UNSUNG.has(i)) {
      // Among your best, but someone else gets the MOTM (once, he does).
      v["Mac Allister"] = 8.0 + w(0.3);
      if (i === UNSUNG_MOTM) v["Mac Allister"] = 9.1;
      else v["Salah"] = Math.max(v["Salah"], v["Mac Allister"] + 0.4 + rand() * 0.3);
    }
    if (MOMENTS.has(i)) v["Salah"] = Math.min(v["Salah"], 8.6);
    const ratings = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, r1(x)]));
    const motm = Object.entries(ratings).sort((a, b) => b[1] - a[1])[0][0];
    const opp = OPP[i];
    return { id: `s${i + 1}`, label: `${i % 2 ? "@" : "vs"} ${CODE[opp]}`, date: DATES[i], result: res, ratings, motm };
  });
})();

/** The same shape from the real Journal (13 matches), for the honest "not yet" view. */
export function seasonFromJournal(matches: JournalMatch[]): SeasonMatch[] {
  return [...matches].reverse().map((m) => ({
    id: m.id, label: `${m.venue} ${m.code}`, date: m.date, result: m.result,
    ratings: Object.fromEntries(lineupFor(m).map((p) => [p.short, p.you])), motm: m.myMotm,
  }));
}

/* ---------------- the rules ---------------- */

const median = (xs: number[]) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); const k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

type Row = { p: PlayerInfo; apps: number; ratings: { m: SeasonMatch; v: number; top3: boolean; bottom3: boolean; motm: boolean }[] };

function rows(season: SeasonMatch[]): Row[] {
  return SQUAD.map((p) => ({
    p,
    apps: season.filter((m) => p.short in m.ratings).length,
    ratings: season.filter((m) => p.short in m.ratings).map((m) => {
      const order = Object.entries(m.ratings).sort((a, b) => b[1] - a[1]).map(([k]) => k);
      return { m, v: m.ratings[p.short], top3: order.slice(0, 3).includes(p.short), bottom3: order.slice(-3).includes(p.short), motm: m.motm === p.short };
    }),
  }));
}

export type HighsLows = { p: PlayerInfo; apps: number; top: number; bottom: number; topMedian: number; bottomMedian: number; low: number; high: number };
export type Moments = { p: PlayerInfo; apps: number; moments: { m: SeasonMatch; v: number }[]; restMedian: number };
export type Consistent = { p: PlayerInfo; apps: number; inBand: number; lo: number; hi: number; outliers: number[]; all: number[] };
export type Unsung = { p: PlayerInfo; apps: number; top3: number; motm: number };
export type Scapegoat = { p: PlayerInfo; apps: number; losses: number; bottomInLosses: number; wdAvg: number; lossAvg: number; next: { p: PlayerInfo; drop: number } | null };

export function playerTypes(season: SeasonMatch[]) {
  const all = rows(season).filter((r) => r.apps >= RULES.minApps);

  // Highs & Lows: repeated top-3 AND bottom-3 finishes, each 15%+ of appearances, top-3 median 2.5+ above bottom-3 median.
  const hl = all.map((r) => {
    const top = r.ratings.filter((x) => x.top3), bottom = r.ratings.filter((x) => x.bottom3);
    return { p: r.p, apps: r.apps, top: top.length, bottom: bottom.length, topMedian: median(top.map((x) => x.v)), bottomMedian: median(bottom.map((x) => x.v)), low: Math.min(...r.ratings.map((x) => x.v)), high: Math.max(...r.ratings.map((x) => x.v)) };
  }).filter((x) => x.top >= RULES.highslows.min && x.bottom >= RULES.highslows.min && x.top / x.apps >= RULES.highslows.share && x.bottom / x.apps >= RULES.highslows.share && x.topMedian - x.bottomMedian >= RULES.highslows.gap)
    .sort((a, b) => (b.topMedian - b.bottomMedian) - (a.topMedian - a.bottomMedian));

  // Moments Player: 3+ ratings of 9.0+, no more than 25% of appearances, your MOTM every time, median of the rest below 7.5.
  const mo = all.map((r) => {
    const nine = r.ratings.filter((x) => x.v >= RULES.moments.rating);
    return { p: r.p, apps: r.apps, nine, rest: r.ratings.filter((x) => x.v < RULES.moments.rating).map((x) => x.v) };
  }).filter((x) => x.nine.length >= RULES.moments.min && x.nine.length / x.apps <= RULES.moments.maxShare && x.nine.every((n) => n.motm) && median(x.rest) < RULES.moments.restBelow)
    .map((x) => ({ p: x.p, apps: x.apps, moments: x.nine.map((n) => ({ m: n.m, v: n.v })), restMedian: median(x.rest) }))
    .sort((a, b) => b.moments.length - a.moments.length || a.restMedian - b.restMedian);

  // Mr Consistent: the narrowest band holding 90%+ of his ratings is no wider than 0.5.
  const co = all.map((r) => {
    const s = r.ratings.map((x) => x.v).sort((a, b) => a - b);
    const k = Math.ceil(s.length * RULES.consistent.share);
    let best = { lo: s[0], hi: s[s.length - 1] };
    for (let i = 0; i + k - 1 < s.length; i++) if (s[i + k - 1] - s[i] < best.hi - best.lo) best = { lo: s[i], hi: s[i + k - 1] };
    const inBand = s.filter((v) => v >= best.lo - 1e-9 && v <= best.hi + 1e-9).length;
    return { p: r.p, apps: r.apps, inBand, lo: best.lo, hi: best.hi, outliers: s.filter((v) => v < best.lo - 1e-9 || v > best.hi + 1e-9), all: r.ratings.map((x) => x.v) };
  }).filter((x) => x.hi - x.lo <= RULES.consistent.band + 1e-9)
    .sort((a, b) => b.inBand / b.apps - a.inBand / a.apps || (a.hi - a.lo) - (b.hi - b.lo) || b.apps - a.apps);

  // Unsung Hero: 10+ top-3 finishes, no MOTM in 90%+ of them, 2 MOTMs at most.
  const un = all.map((r) => {
    const top = r.ratings.filter((x) => x.top3);
    return { p: r.p, apps: r.apps, top3: top.length, motm: top.filter((x) => x.motm).length };
  }).filter((x) => x.top3 >= RULES.unsung.top3 && (x.top3 - x.motm) / x.top3 >= RULES.unsung.withoutShare && x.motm <= RULES.unsung.maxMotm)
    .sort((a, b) => (b.top3 - b.motm) - (a.top3 - a.motm) || (b.top3 - b.motm) / b.top3 - (a.top3 - a.motm) / a.top3 || b.top3 - a.top3 || b.apps - a.apps);

  // Scapegoat: 7+ losses and 7+ wins/draws rated; bottom 3 in 7+ losses and 50%+ of losses; 2.0+ lower in losses.
  const sgAll = all.map((r) => {
    const l = r.ratings.filter((x) => x.m.result === "L"), wd = r.ratings.filter((x) => x.m.result !== "L");
    return { p: r.p, apps: r.apps, losses: l.length, wd: wd.length, bottomInLosses: l.filter((x) => x.bottom3).length, wdAvg: mean(wd.map((x) => x.v)), lossAvg: mean(l.map((x) => x.v)) };
  });
  const sg = sgAll.filter((x) => x.losses >= RULES.scapegoat.losses && x.wd >= RULES.scapegoat.wd && x.bottomInLosses >= RULES.scapegoat.bottom && x.bottomInLosses / x.losses >= RULES.scapegoat.bottomShare && x.wdAvg - x.lossAvg >= RULES.scapegoat.drop)
    .sort((a, b) => (b.wdAvg - b.lossAvg) - (a.wdAvg - a.lossAvg) || b.bottomInLosses - a.bottomInLosses || b.bottomInLosses / b.losses - a.bottomInLosses / a.losses || a.lossAvg - b.lossAvg);
  const sgTop = sg[0] ?? null;
  const nextDrop = sgTop ? [...sgAll].filter((x) => x.p !== sgTop.p).sort((a, b) => (b.wdAvg - b.lossAvg) - (a.wdAvg - a.lossAvg))[0] : null;

  return {
    matches: season.length,
    losses: season.filter((m) => m.result === "L").length,
    unsung: (un[0] ?? null) as Unsung | null,
    consistent: (co[0] ?? null) as Consistent | null,
    highslows: (hl[0] ?? null) as HighsLows | null,
    scapegoat: sgTop ? ({ ...sgTop, next: nextDrop ? { p: nextDrop.p, drop: nextDrop.wdAvg - nextDrop.lossAvg } : null } as Scapegoat) : null,
    moments: (mo[0] ?? null) as Moments | null,
  };
}
