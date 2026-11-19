// Sample data for the Club Hub prototype. Every figure is illustrative and needs
// the approved metric contract before build (handbook §4.1, VALIDATE).

/**
 * RATEM only shows matches that are live or have been played (client decision, 4 Nov).
 * There is no "upcoming" status anywhere in the app.
 */
export type FixtureStatus = "live" | "open" | "closed" | "awaiting";
/** Fan data only. Club Hub never carries the user's own ratings (they live in My Journal). */
export type Rating = { name: string; pos: string; initial: string; no: number; fan: number; fanMotm: number };

export type Fixture = {
  id: string;
  date: string;
  dateLabel: string;
  /** Local kickoff time, 24h. */
  kickoff: string;
  competition: string;
  venue: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: FixtureStatus;
  /** Match clock for live fixtures. */
  minute?: string;
  fanRating?: number;
  remaining?: string;
  fans?: number;
  /**
   * Whether this user has submitted a rating. Used only to reveal that match's fan data while
   * the window is open (rating-visibility rule). The user's own score is never shown in Club Hub.
   */
  youRated?: boolean;
};

export const CLUB = "Sturm Graz";
export const SEASON = "2025/26";
export const RATED_FIXTURES = 16;
/** Data freshness, not "live": the hub refreshes once a fixture's rating window closes. */
/**
 * Club Hub rule (Michel, 4 Nov): Club Hub insights are collective fan opinion, so they only
 * update once a match's 48-hour rating window closes. The MOTM race, Fanbase Mood, ratings etc.
 * stay as they were before that match until then (nothing leaks early). My Journal is the user's
 * own data and can update the moment they rate.
 */
export const UPDATED = { label: "Updated after vs Inter", date: "1 Mar" };

/** While a rating window is open, Club Hub says when its next update lands. */
export function nextUpdate(fixtures: Fixture[]) {
  return fixtures.find((f) => f.status === "open")?.remaining ?? null;
}

/**
 * The RATEM kit (client decision, 4 Nov): one branded kit for every player, whatever the club,
 * so RATEM never borrows another club's identity. Only the number changes per player.
 * The club itself is shown by its crest and name next to the kit.
 */
export const KIT = { base: "#0b3fd6", sky: "#1fb4ff", deep: "#061a6b", centre: "#ffffff", number: "#ffffff", /** Thin near-black outline for clear kit numbers (Michel, 12 Nov). */ outline: "#02040f", /** Goalkeeper: solid RATEM blue, no pattern. */ keeper: "#074aff" };

export const LOGOS: Record<string, string> = {
  "Sturm Graz": "/figma/logo-sturm.png",
  Inter: "/figma/logo-inter.png",
};

export const SQUAD: Rating[] = [
  { name: "Mohamed Salah", pos: "FWD", initial: "M", no: 11, fan: 8.1, fanMotm: 33 },
  { name: "Virgil van Dijk", pos: "DEF", initial: "V", no: 4, fan: 7.8, fanMotm: 22 },
  { name: "Alexis Mac Allister", pos: "MID", initial: "A", no: 10, fan: 7.7, fanMotm: 15 },
  { name: "Alisson Becker", pos: "GK", initial: "A", no: 1, fan: 7.5, fanMotm: 6 },
  { name: "Darwin Núñez", pos: "FWD", initial: "D", no: 9, fan: 6.9, fanMotm: 3 },
  { name: "Trent Alexander-Arnold", pos: "DEF", initial: "T", no: 66, fan: 6.4, fanMotm: 2 },
];

export const MANAGER: Rating = { name: "Head Coach", pos: "Manager", initial: "H", no: 0, fan: 7.6, fanMotm: 0 };

/** Newest first. "Today" in the prototype is Sat 7 Mar 2026. */
export const FIXTURES: Fixture[] = [
  { id: "live", date: "2026-03-07", dateLabel: "Sat 7 Mar", kickoff: "18:00", competition: "Bundesliga", venue: "Red Bull Arena", home: "Red Bull Salzburg", away: "Sturm Graz", homeScore: 1, awayScore: 1, status: "live", minute: "63′" },
  { id: "open", date: "2026-03-04", dateLabel: "Wed 4 Mar", kickoff: "20:30", competition: "Bundesliga", venue: "Allianz Stadion", home: "Rapid Wien", away: "Sturm Graz", homeScore: 0, awayScore: 2, status: "open", fanRating: 7.4, remaining: "23h 15m", fans: 666, youRated: false },
  { id: "rated", date: "2026-03-01", dateLabel: "Sun 1 Mar", kickoff: "21:00", competition: "Champions League", venue: "Merkur Arena", home: "Sturm Graz", away: "Inter", homeScore: 3, awayScore: 3, status: "closed", fanRating: 7.2, fans: 666 },
  { id: "awaiting", date: "2026-02-24", dateLabel: "Tue 24 Feb", kickoff: "21:00", competition: "Champions League", venue: "Merkur Arena", home: "Sturm Graz", away: "Everton", homeScore: null, awayScore: null, status: "awaiting" },
  { id: "closed", date: "2026-02-18", dateLabel: "Wed 18 Feb", kickoff: "21:00", competition: "Champions League", venue: "Amex Stadium", home: "Brighton", away: "Sturm Graz", homeScore: 1, awayScore: 2, status: "closed", fanRating: 6.7, fans: 512 },
  { id: "mci-home", date: "2026-01-12", dateLabel: "Mon 12 Jan", kickoff: "21:00", competition: "Champions League", venue: "Merkur Arena", home: "Sturm Graz", away: "Manchester City", homeScore: 4, awayScore: 1, status: "closed", fanRating: 8.4, fans: 842 },
  { id: "gladbach", date: "2025-12-10", dateLabel: "Wed 10 Dec", kickoff: "18:45", competition: "Champions League", venue: "Borussia-Park", home: "Borussia Mönchengladbach", away: "Sturm Graz", homeScore: 2, awayScore: 2, status: "closed", fanRating: 6.3, fans: 588 },
  { id: "mci-away", date: "2025-11-09", dateLabel: "Sun 9 Nov", kickoff: "17:30", competition: "Champions League", venue: "Etihad Stadium", home: "Manchester City", away: "Sturm Graz", homeScore: 4, awayScore: 0, status: "closed", fanRating: 4.1, fans: 701 },
];

export type EdgeStates = {
  raceTie: boolean;
  mood: "normal" | "none";
  history: "ready" | "loading" | "error";
  managerGap: "gap" | "equal";
  managerTrend: "many" | "one" | "none";
  draws: boolean;
  /** Who is looking: signed in, signed out (Club Hub stays public), or an account that can't follow. */
  account: "in" | "out" | "restricted";
  /** Whether the next Follow / Unfollow request succeeds, to show the error path. */
  followResult: "ok" | "fail";
  /** Current season, or a past season whose standings are final. */
  season: "current" | "archived";
  /** Early in the season only a few matches have closed, so insights rest on a small sample. */
  sample: "full" | "low";
  /** One insight failed to load while the rest of the screen is fine. */
  partial: boolean;
  /** My Journal history: a full season, or a new fan with only 2 rated matches. */
  journal: "full" | "new";
  /** Premium previews: hidden for the free launch, shown to review how Premium will be teased. */
  premium: boolean;
  /** Rare moments (after launch): the gold record card at the end of the story and the "Your records" shelf. */
  rare: boolean;
  /** Story card 6 (Your MOTM vs the fans): the fans' vote has two players level at the top. */
  motmTie: boolean;
};

/** Low-sample example: early season, only this many rating windows have closed. */
export const LOW_SAMPLE_MATCHES = 3;

/** Follow state machine (handbook §Follow). Following never promises notifications. */
export type FollowState = "not_following" | "pending_follow" | "following" | "pending_unfollow";

/** Insight tabs are grouped by the fan question they answer. */
export const TABS = [
  { id: "race", label: "MOTM Race", question: "Who leads the season race?" },
  { id: "fan-mood", label: "Fan Mood", question: "How do fans feel right now?" },
  { id: "players", label: "Players", question: "How are fans rating each player?" },
  { id: "matches", label: "Matches", question: "Which matches stood out?" },
  { id: "manager", label: "Manager", question: "How is the manager rated?" },
] as const;
export type TabId = (typeof TABS)[number]["id"];

/** Season MOTM Race. Measure: fan MOTM awards (fixtures where the fan vote named him MOTM). */
export type RaceEntry = { name: string; short: string; pos: string; no: number; awards: number; move: number };
export const MOTM_RACE: RaceEntry[] = [
  { name: "Mohamed Salah", short: "Salah", pos: "FWD", no: 11, awards: 6, move: 0 },
  { name: "Virgil van Dijk", short: "Van Dijk", pos: "DEF", no: 4, awards: 5, move: 1 },
  { name: "Alexis Mac Allister", short: "Mac Allister", pos: "MID", no: 10, awards: 3, move: -1 },
  { name: "Darwin Núñez", short: "Núñez", pos: "FWD", no: 9, awards: 1, move: 0 },
  { name: "Alisson Becker", short: "Alisson", pos: "GK", no: 1, awards: 1, move: 0 },
];
/** Edge-state variant: Van Dijk draws level after the latest fixture. */
export const MOTM_RACE_TIE: RaceEntry[] = MOTM_RACE.map((p) => (p.short === "Van Dijk" ? { ...p, awards: 6 } : p));

/** Fanbase Mood: fan squad rating per fixture against the fans' own season median. */
export const FAN_MEDIAN = 6.7;
export type MoodFixture = { opp: string; venue: "vs" | "@"; date: string; score: string; result: "W" | "D" | "L"; value: number };
export const FAN_MOOD: MoodFixture[] = [
  { opp: "Chelsea", venue: "vs", date: "24 Jan", score: "2–1", result: "W", value: 7.3 },
  { opp: "Arsenal", venue: "@", date: "31 Jan", score: "0–2", result: "L", value: 5.8 },
  { opp: "Newcastle", venue: "vs", date: "7 Feb", score: "1–1", result: "D", value: 6.6 },
  { opp: "Brighton", venue: "@", date: "18 Feb", score: "2–1", result: "W", value: 6.7 },
  { opp: "Inter", venue: "vs", date: "1 Mar", score: "3–3", result: "D", value: 7.2 },
];
export const MOOD_FANS = 666;

/** "Who's Up, Who's Down" (was Fan Confidence Shift): fans' average over the last 5 matches vs their season average. */
export type Shift = { name: string; short: string; pos: string; no: number; season: number; recent: number; ratings: number[] };
export const SHIFTS: Shift[] = [
  { name: "Darwin Núñez", short: "Núñez", pos: "FWD", no: 9, season: 6.9, recent: 6.0, ratings: [6.8, 6.1, 5.4, 6.2, 5.5] },
  { name: "Trent Alexander-Arnold", short: "Alexander-Arnold", pos: "DEF", no: 66, season: 6.4, recent: 7.1, ratings: [6.6, 6.9, 7.0, 7.4, 7.6] },
  { name: "Mohamed Salah", short: "Salah", pos: "FWD", no: 11, season: 8.1, recent: 8.4, ratings: [8.0, 8.7, 8.1, 8.3, 8.9] },
  { name: "Alexis Mac Allister", short: "Mac Allister", pos: "MID", no: 10, season: 7.7, recent: 7.5, ratings: [7.9, 7.2, 7.6, 7.4, 7.4] },
  { name: "Virgil van Dijk", short: "Van Dijk", pos: "DEF", no: 4, season: 7.8, recent: 7.8, ratings: [7.6, 7.9, 8.0, 7.7, 7.8] },
];

/** Most Divisive Player: the widest split of fan ratings for one player in one fixture. */
export const DIVISIVE = {
  name: "Trent Alexander-Arnold",
  short: "Alexander-Arnold",
  pos: "DEF",
  no: 66,
  fixture: "@ Arsenal",
  date: "31 Jan",
  fans: 498,
  median: 6.0,
  /** Share of fans per rating band. Sums to 100. */
  bands: [
    { label: "1–3", share: 22 },
    { label: "4–5", share: 19 },
    { label: "6–7", share: 18 },
    { label: "8–10", share: 41 },
  ],
};

/** Ratings by Position. Goalkeeper is excluded from this grouping by product decision. */
export const POSITION_RATINGS = [
  { label: "Attack", fan: 7.1 },
  { label: "Midfield", fan: 7.0 },
  { label: "Defence", fan: 7.3 },
];

/** Widest Season Rating Range, per player. Eligible = at least 5 fan-rated appearances. */
export type RangeEntry = { name: string; short: string; pos: string; no: number; low: number; lowAt: string; high: number; highAt: string; apps: number };
export const RANGES: RangeEntry[] = [
  { name: "Mohamed Salah", short: "Salah", pos: "FWD", no: 11, low: 5.4, lowAt: "@ Betis, 24 Jan", high: 8.5, highAt: "vs Inter, 1 Mar", apps: 15 },
  { name: "Darwin Núñez", short: "Núñez", pos: "FWD", no: 9, low: 4.6, lowAt: "@ Arsenal, 31 Jan", high: 7.4, highAt: "vs Chelsea, 24 Jan", apps: 12 },
  { name: "Trent Alexander-Arnold", short: "Alexander-Arnold", pos: "DEF", no: 66, low: 4.9, lowAt: "@ Man City, 9 Nov", high: 7.6, highAt: "vs Inter, 1 Mar", apps: 14 },
  { name: "Virgil van Dijk", short: "Van Dijk", pos: "DEF", no: 4, low: 6.9, lowAt: "@ Man City, 9 Nov", high: 8.6, highAt: "vs Man City, 12 Jan", apps: 16 },
];

export const MANAGER_TREND = [
  { opp: "Man City", code: "MCI", venue: "@", date: "9 Nov", value: 6.8 },
  { opp: "Chelsea", code: "CHE", venue: "vs", date: "24 Jan", value: 6.8 },
  { opp: "Arsenal", code: "ARS", venue: "@", date: "31 Jan", value: 6.1 },
  { opp: "Brighton", code: "BHA", venue: "@", date: "18 Feb", value: 5.7 },
  { opp: "Inter", code: "INT", venue: "vs", date: "1 Mar", value: 5.7 },
];
export const MANAGER_SEASON = 6.4;
export const TEAM_SEASON = 7.1;

/**
 * Rating visibility (Michel, 4 Nov): only the data for that one match waits, until this user
 * rates it OR its rating window closes. Everything else in Club Hub (MOTM race, insights,
 * season ratings) is public whether or not the user has matches to rate. The count of fans
 * who have rated is always fine to show. Not framed as a lock: it isn't a premium feature.
 */
export function fansUnlocked(f: Fixture) {
  return f.status === "closed" || (f.status === "open" && Boolean(f.youRated));
}
