// Fan match insights: the fanbase's story of one finished match (Michel + Warren + Jimmy, 12 Nov).
// Fan data only, so it belongs with Club Hub (fan yellow, nothing personal). Every figure is
// illustrative and needs the approved metric contract before build (handbook §4.1, VALIDATE).
//
// Rules:
// - Only once the match's rating window has closed (48h). While a match can still be rated, the
//   rate-first rule stays: no fan numbers before you rate.
// - Final numbers only, with sample thresholds: the match needs FAN_MATCH_MIN fan ratings, and a
//   player-level insight needs FAN_MIN_RATINGS ratings for that player.
// - Your Patterns and You vs Fans stay exclusive to matches you rated.

import { FAN_MEDIAN, FIXTURES, type Fixture } from "./data";
import { FAN_MIN_RATINGS, JOURNAL_MATCHES, lineupFor, type JournalMatch, type LineupRating } from "./journal";

export { FAN_MIN_RATINGS };

/** A match needs this many fans' ratings before its fan insights show. */
export const FAN_MATCH_MIN = 100;

/** Rating bands for the divisive-player split, harshest first. */
export const BANDS = ["1–3", "4–5", "6–7", "8–10"] as const;

type Extra = {
  /** Fans' MOTM vote, most votes first: [player, % of fans]. The rest are grouped as "Others". */
  split: [string, number][];
  /** The player with most fans at both ends of the scale. Shares per band sum to 100. */
  divisive: { short: string; bands: [number, number, number, number] };
  /** Widest middle half of the fans' ratings: [player, low, high]. */
  ranges: [string, number, number][];
};

const EXTRA: Record<string, Extra> = {
  rated: {
    split: [["Salah", 46], ["Van Dijk", 17], ["Mac Allister", 13], ["Szoboszlai", 8]],
    divisive: { short: "Díaz", bands: [18, 20, 24, 38] },
    ranges: [["Díaz", 4.5, 8.5], ["Alexander-Arnold", 5.0, 8.5], ["Núñez", 5.5, 8.0]],
  },
  closed: {
    split: [["Salah", 38], ["Van Dijk", 21], ["Konaté", 14], ["Gravenberch", 9]],
    divisive: { short: "Alisson", bands: [26, 18, 20, 36] },
    ranges: [["Alisson", 4.0, 8.5], ["Szoboszlai", 5.0, 7.5], ["Díaz", 5.0, 7.5]],
  },
  "mci-home": {
    split: [["Salah", 58], ["Szoboszlai", 14], ["Díaz", 9], ["Mac Allister", 7]],
    divisive: { short: "Robertson", bands: [6, 9, 20, 65] },
    ranges: [["Robertson", 6.5, 9.0], ["Núñez", 7.0, 9.0], ["Konaté", 7.5, 9.0]],
  },
  gladbach: {
    split: [["Salah", 31], ["Van Dijk", 27], ["Robertson", 12], ["Szoboszlai", 9]],
    divisive: { short: "Núñez", bands: [21, 17, 22, 40] },
    ranges: [["Núñez", 4.0, 8.5], ["Alexander-Arnold", 4.0, 7.0], ["Díaz", 4.5, 7.0]],
  },
  "mci-away": {
    split: [["Alisson", 33], ["Van Dijk", 18], ["Salah", 12], ["Mac Allister", 9]],
    divisive: { short: "Alexander-Arnold", bands: [52, 20, 12, 16] },
    ranges: [["Alexander-Arnold", 2.0, 6.0], ["Díaz", 2.5, 5.0], ["Salah", 3.0, 5.5]],
  },
};

/** Full names, for the short "M. Salah" labels on the Club Hub match card. */
export const FULL_NAME: Record<string, string> = {
  Alisson: "Alisson Becker", "Alexander-Arnold": "Trent Alexander-Arnold", "Van Dijk": "Virgil van Dijk", Konaté: "Ibrahima Konaté",
  Robertson: "Andy Robertson", "Mac Allister": "Alexis Mac Allister", Gravenberch: "Ryan Gravenberch", Szoboszlai: "Dominik Szoboszlai",
  Salah: "Mohamed Salah", Núñez: "Darwin Núñez", Díaz: "Luis Díaz",
};

export type FanMatch = {
  fixture: Fixture;
  fans: number;
  rating: number;
  usual: number;
  lineup: LineupRating[];
  split: { short: string; share: number }[];
  others: number;
  high: LineupRating;
  low: LineupRating;
  divisive: LineupRating & { bands: number[]; rated: number };
  ranges: (LineupRating & { lo: number; hi: number })[];
};

/** Fan insights for a finished match, or null while it can still be rated / without data. */
export function fanMatchFor(id: string): FanMatch | null {
  const fixture = FIXTURES.find((f) => f.id === id);
  const m = JOURNAL_MATCHES.find((x) => x.id === id);
  const extra = EXTRA[id];
  if (!fixture || fixture.status !== "closed" || !m || !extra) return null;
  // Fan side only: the fans' average per player for this match.
  const lineup = lineupFor(m).map((p) => ({ ...p, you: 0 }));
  const of = (short: string) => lineup.find((p) => p.short === short)!;
  const byFans = [...lineup].sort((a, b) => b.fans - a.fans);
  const split = extra.split.map(([short, share]) => ({ short, share }));
  return {
    fixture,
    fans: fixture.fans ?? m.fansRated,
    rating: fixture.fanRating ?? m.fans,
    usual: FAN_MEDIAN,
    lineup,
    split,
    others: 100 - split.reduce((a, s) => a + s.share, 0),
    high: byFans[0],
    low: byFans[byFans.length - 1],
    divisive: { ...of(extra.divisive.short), bands: extra.divisive.bands, rated: Math.round((fixture.fans ?? m.fansRated) * 0.95) },
    ranges: extra.ranges.map(([short, lo, hi]) => ({ ...of(short), lo, hi })),
  };
}

/**
 * The fans' MOTM vote for a match you rated, for You vs Fans (Michel, 12 Nov: show where your pick landed in the
 * vote there, so the fans' view doesn't repeat it). Uses the stored split when there is one; otherwise it's built
 * from the fans' pick and your pick's share, with the next players by fan rating.
 */
export function motmVotesFor(m: JournalMatch) {
  const extra = EXTRA[m.id];
  if (extra) {
    const split = extra.split.map(([short, share]) => ({ short, share }));
    return { split, others: 100 - split.reduce((a, x) => a + x.share, 0) };
  }
  const mine = m.fanMotmShare;
  const split = [{ short: m.fanMotm, share: m.myMotm === m.fanMotm ? mine : mine + 5 }];
  if (m.myMotm !== m.fanMotm) split.push({ short: m.myMotm, share: mine });
  const used = new Set(split.map((x) => x.short));
  let left = 100 - split.reduce((a, x) => a + x.share, 0);
  let cap = split[split.length - 1].share - 1;
  for (const pl of lineupFor(m).filter((x) => !used.has(x.short)).sort((a, b) => b.fans - a.fans)) {
    if (split.length >= 4) break;
    const share = Math.min(cap, Math.round(left * 0.3));
    if (share < 3) break;
    split.push({ short: pl.short, share });
    left -= share;
    cap = share - 1;
  }
  return { split, others: left };
}

/** "M. Salah" style label, as on the Club Hub match card. */
export function shortLabel(short: string) {
  const [first, ...rest] = (FULL_NAME[short] ?? short).split(" ");
  return rest.length ? `${first[0]}. ${rest.join(" ").split("-").pop()}` : first;
}
