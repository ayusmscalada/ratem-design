# RATEM Club Hub prototype

A frontend-only Next.js prototype of the Phase 2 Club Hub from the RATEM DESIGN Figma file. There is no backend, and all data is sample data in `lib/data.ts`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. It redirects to `/club-hub`.

`npm run dev` and `npm run build` use webpack because Turbopack fails on this Windows drive with a file lock error (`EBUSY`).

## Flow

```
Club Hub
├─ Your Insights card ─ Fan Sentiment → Player Rankings → Match Trends → Manager & Team → back to hub
├─ Fans/You chips ──── Top rated or Lowest rated sheet
├─ Ratings, See all ── full Ratings sheet
└─ Match History
   ├─ All / Rated by you / Not rated by you, plus Dates sheet
   ├─ Rate Now ─────── fixture becomes Rated (simulated; the rating screens are Phase 1)
   └─ See what fans think ─ expands the line-up and bench

Match Trends, Season Rating Extremes ─ opens that exact fixture in Match History
```

Back from any insight tab returns to the same scroll position in the hub. On desktop, the panel beside the phone jumps between screens and switches the data states.

## Source

- Layouts: the frames under "Club Hub Changes" (nodes 4:24640, 4:24831, 4:24109, 4:24210, 4:24375).
- Filter and top rated sheets: Phase 1 nodes 4:51705 and 4:51097.
- Corrections: the Club Hub staging audit pages placed beside those frames.
- Assets: exported from Figma into `public/figma/`.

## Audit changes applied

| Audit item | What the prototype does |
| --- | --- |
| Season MOTM Race | Shows the leader and two alternatives with vote counts |
| Podium cards | Removed from Player Rankings; top and lowest sheets stay |
| Widest Season Rating Range | Spread and range now show 3.1 and 5.4 to 8.5 |
| Season Rating Extremes | Replaces the two long quote cards; each entry opens its fixture |
| Duplicate Fanbase Rating Trend | Removed from Match Trends |
| CH-12 Fan Manager Rating | Equal values show "No gap" with no arrow |
| CH-13 Manager Rating Trend | Separate states for zero, one and many fixtures |
| CH-14 Team Rating by Result | Shows sample counts; draws hide when there are none |
| CH-15 Position ratings | Neutral wording and aligned bars |
| CH-16 Match history | "Rate now" countdown, "Rating closed", "Awaiting confirmed result", clear space above the nav |
| CH-17 Sheets | Scope subtitle, full names, close by drag, button, backdrop or Esc |

## Sample data corrections

Figma placeholders and contradictions were replaced so each card agrees with itself:

- Fan Manager Rating: the stats (8.4, 4.1, 5 and 7 matches) now match the card's copy (7.2, 6.4, 12 and 13 matches).
- Manager Rating Trend: the drop is 1.1 points, matching the plotted 6.8 to 5.7.
- Fan Mood: the chart now falls from 7.3 to 5.9, matching its copy.
- `[X.X]` in Fanbase Rating Baseline is 6.7, matching the gauge.
- Salah is listed as a forward.

## Open questions for the product owner

- The hub shows Sturm Graz, but the insight copy uses Liverpool players. The prototype keeps both as designed, so player names need one consistent club.
- Most Controversial Match keeps the designed copy and "No collective verdict". The audit asks for a same-player disagreement metric first.
- The Your Insights chip links are inferred: Player Trends → Player Rankings, Fan Comparison → Fan Sentiment, Rating Patterns → Match Trends.
- The hub frame contains two near-identical Fans/You cards. The prototype shows one.
