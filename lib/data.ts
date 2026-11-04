// Sample data for the Club Hub prototype. Every figure is illustrative and needs
// the approved metric contract before build (handbook §4.1, VALIDATE).

export type FixtureStatus = "upcoming" | "live" | "open" | "rated" | "closed" | "awaiting";
export type Rating = { name: string; pos: string; initial: string; no: number; you: number; fan: number; youMotm: number; fanMotm: number };

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
  youRating?: number;
  remaining?: string;
  fans?: number;
  comment?: string;
};

export const CLUB = "Sturm Graz";
export const SEASON = "2025/26";
export const RATED_FIXTURES = 16;
/** Data freshness, not "live": the hub refreshes once a fixture's rating window closes. */
export const UPDATED = { label: "Updated after vs Inter", date: "1 Mar" };

/** The club's kit, used for jerseys so they match the user's club. */
export const KIT = { base: "#111111", stripe: "#ffffff", number: "#ffffff", trim: "#ffffff" };

export const LOGOS: Record<string, string> = {
  "Sturm Graz": "/figma/logo-sturm.png",
  Inter: "/figma/logo-inter.png",
};

export const SQUAD: Rating[] = [
  { name: "Mohamed Salah", pos: "FWD", initial: "M", no: 11, you: 8.5, fan: 8.1, youMotm: 12, fanMotm: 33 },
  { name: "Virgil van Dijk", pos: "DEF", initial: "V", no: 4, you: 8.1, fan: 7.8, youMotm: 7, fanMotm: 22 },
  { name: "Alexis Mac Allister", pos: "MID", initial: "A", no: 10, you: 7.9, fan: 7.7, youMotm: 5, fanMotm: 15 },
  { name: "Alisson Becker", pos: "GK", initial: "A", no: 1, you: 7.5, fan: 7.5, youMotm: 2, fanMotm: 6 },
  { name: "Darwin Núñez", pos: "FWD", initial: "D", no: 9, you: 7.3, fan: 6.9, youMotm: 3, fanMotm: 3 },
  { name: "Trent Alexander-Arnold", pos: "DEF", initial: "T", no: 66, you: 5.8, fan: 6.4, youMotm: 1, fanMotm: 2 },
];

export const MANAGER: Rating = { name: "Head Coach", pos: "Manager", initial: "H", no: 0, you: 7.2, fan: 7.6, youMotm: 0, fanMotm: 0 };

/** Newest first. "Today" in the prototype is Sat 7 Mar 2026. */
export const FIXTURES: Fixture[] = [
  { id: "next", date: "2026-03-14", dateLabel: "Sat 14 Mar", kickoff: "17:00", competition: "Bundesliga", venue: "Merkur Arena", home: "Sturm Graz", away: "Austria Wien", homeScore: null, awayScore: null, status: "upcoming" },
  { id: "live", date: "2026-03-07", dateLabel: "Sat 7 Mar", kickoff: "18:00", competition: "Bundesliga", venue: "Red Bull Arena", home: "Red Bull Salzburg", away: "Sturm Graz", homeScore: 1, awayScore: 1, status: "live", minute: "63′" },
  { id: "open", date: "2026-03-04", dateLabel: "Wed 4 Mar", kickoff: "20:30", competition: "Bundesliga", venue: "Allianz Stadion", home: "Rapid Wien", away: "Sturm Graz", homeScore: 0, awayScore: 2, status: "open", fanRating: 7.4, remaining: "23h 15m", fans: 666 },
  { id: "rated", date: "2026-03-01", dateLabel: "Sun 1 Mar", kickoff: "21:00", competition: "Champions League", venue: "Merkur Arena", home: "Sturm Graz", away: "Inter", homeScore: 3, awayScore: 3, status: "rated", youRating: 7.6, fanRating: 7.2, fans: 666, comment: "Played well all over the pitch. The press won the midfield early, and the second half showed real belief from the whole squad until the final whistle." },
  { id: "awaiting", date: "2026-02-24", dateLabel: "Tue 24 Feb", kickoff: "21:00", competition: "Champions League", venue: "Merkur Arena", home: "Sturm Graz", away: "Everton", homeScore: null, awayScore: null, status: "awaiting" },
  { id: "closed", date: "2026-02-18", dateLabel: "Wed 18 Feb", kickoff: "21:00", competition: "Champions League", venue: "Amex Stadium", home: "Brighton", away: "Sturm Graz", homeScore: 1, awayScore: 2, status: "closed", fanRating: 6.7, fans: 512 },
  { id: "mci-home", date: "2026-01-12", dateLabel: "Mon 12 Jan", kickoff: "21:00", competition: "Champions League", venue: "Merkur Arena", home: "Sturm Graz", away: "Manchester City", homeScore: 4, awayScore: 1, status: "rated", youRating: 8.6, fanRating: 8.4, fans: 842, comment: "Best team performance of the season." },
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
};

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

/** Fan Confidence Shift: last 5 fixtures' fan average against the season fan average. */
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
  { label: "Attack", fan: 7.1, you: 7.6 },
  { label: "Midfield", fan: 7.0, you: 7.4 },
  { label: "Defence", fan: 7.3, you: 6.9 },
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
  { opp: "Man City", venue: "@", date: "9 Nov", value: 6.8 },
  { opp: "Chelsea", venue: "vs", date: "24 Jan", value: 6.8 },
  { opp: "Arsenal", venue: "@", date: "31 Jan", value: 6.1 },
  { opp: "Brighton", venue: "@", date: "18 Feb", value: 5.7 },
  { opp: "Inter", venue: "vs", date: "1 Mar", value: 5.7 },
];
export const MANAGER_SEASON = 6.4;
export const TEAM_SEASON = 7.1;
