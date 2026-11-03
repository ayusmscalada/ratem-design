export type FixtureStatus = "live" | "open" | "rated" | "closed" | "awaiting";
export type Rating = { name: string; pos: string; initial: string; no: number; you: number; fan: number; youMotm: number; fanMotm: number };

export type Fixture = {
  id: string;
  date: string;
  dateLabel: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: FixtureStatus;
  fanRating?: number;
  youRating?: number;
  remaining?: string;
  fans?: number;
  expanded?: boolean;
  comment?: string;
};

export const CLUB = "Sturm Graz";

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

export const FIXTURES: Fixture[] = [
  { id: "live", date: "2026-03-03", dateLabel: "Mar 3rd ’26", home: "Sturm Graz", away: "Inter", homeScore: 3, awayScore: 1, status: "live" },
  { id: "open", date: "2026-03-03", dateLabel: "Mar 3rd ’26", home: "Sturm Graz", away: "Inter", homeScore: 3, awayScore: 3, status: "open", fanRating: 7.4, remaining: "23h 15m remaining", fans: 666, expanded: true },
  { id: "rated", date: "2026-03-01", dateLabel: "Mar 1st ’26", home: "Sturm Graz", away: "Inter", homeScore: 3, awayScore: 3, status: "rated", youRating: 7.6, fanRating: 7.2, fans: 666, expanded: true, comment: "Played well all over the pitch. The press won the midfield early, and the second half showed real belief from the whole squad until the final whistle." },
  { id: "awaiting", date: "2026-02-24", dateLabel: "Feb 24th ’26", home: "Sturm Graz", away: "Everton", homeScore: null, awayScore: null, status: "awaiting" },
  { id: "closed", date: "2026-02-18", dateLabel: "Feb 18th ’26", home: "Brighton", away: "Sturm Graz", homeScore: 1, awayScore: 2, status: "closed", fanRating: 6.7, fans: 512 },
  { id: "mci-home", date: "2026-01-12", dateLabel: "Jan 12th ’26", home: "Sturm Graz", away: "Manchester City", homeScore: 4, awayScore: 1, status: "rated", youRating: 8.6, fanRating: 8.4, fans: 842, comment: "Best team performance of the season." },
  { id: "mci-away", date: "2025-11-09", dateLabel: "Nov 9th ’25", home: "Manchester City", away: "Sturm Graz", homeScore: 4, awayScore: 0, status: "closed", fanRating: 4.1, fans: 701 },
];

export type EdgeStates = {
  managerGap: "gap" | "equal";
  managerTrend: "many" | "one" | "none";
  draws: boolean;
};

export const TABS = [
  { id: "fan-sentiment", label: "Fan Sentiment" },
  { id: "player-rankings", label: "Player Rankings" },
  { id: "match-trends", label: "Match Trends" },
  { id: "manager-team", label: "Manager & Team" },
] as const;
export type TabId = (typeof TABS)[number]["id"];

export const MOTM_RACE = [
  { name: "M. Salah", share: 34, votes: "4,120" },
  { name: "V. van Dijk", share: 22, votes: "2,664" },
  { name: "A. Mac Allister", share: 15, votes: "1,818" },
];

export const FAN_MOOD = [
  { opp: "vs CHE", date: "24 Jan", value: 7.3 },
  { opp: "vs ARS", date: "31 Jan", value: 7.6 },
  { opp: "vs BHA", date: "7 Feb", value: 6.8 },
  { opp: "vs NEW", date: "14 Feb", value: 6.7 },
  { opp: "vs EVE", date: "21 Feb", value: 6.7 },
  { opp: "vs INT", date: "28 Feb", value: 5.9 },
];

export const MANAGER_TREND = [
  { opp: "MCI", venue: "A", value: 6.8 },
  { opp: "CHE", venue: "H", value: 6.8 },
  { opp: "ARS", venue: "A", value: 6.1 },
  { opp: "BHA", venue: "H", value: 5.7 },
  { opp: "LIV", venue: "A", value: 5.7 },
];

export const POSITION_RATINGS = [
  { label: "ATTACKERS", value: 7.1 },
  { label: "MIDFIELDERS", value: 7.0 },
  { label: "DEFENDERS", value: 7.3 },
  { label: "GOALKEEPERS", value: 7.8 },
];
