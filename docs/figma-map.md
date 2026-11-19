# RATEM Figma file map

File key `7p8quVPUOpKhAd1RPp0EOV`. Snapshot taken 14 Nov 2026 by reading every page.
Node IDs change when a frame is recaptured and replaced, so find frames by name if an ID here no longer resolves.

| Page | ID | What it holds |
|---|---|---|
| New Phase 2 | `20:13555` | Current redesign work: 11 numbered sections (00–10). The source of truth. |
| Phase 2 | `0:1` | TechAhead's original Phase 2 designs (176 top-level items). Reference only. Grey rectangles hide retired frames. |
| Phase 1 | `4:39482` | The shipped Phase 1 app screens (onboarding, home, Club Hub, journal, profile, settings). |

## New Phase 2 (`20:13555`)

| Section | ID | Contents |
|---|---|---|
| 00 · Start here | `22:13607` | Start here board `32:13955` |
| 01 · Workflow & user flows | `22:13608` | Board `32:14032` |
| 02 · Audit & information architecture | `22:13609` | Board `32:14174` |
| 03 · Foundations | `22:13610` | Board `33:13955` |
| 04 · Components | `22:13611` | Components board `23:13555` (Match card set `27:13802`, RATEM kit `23:13641`, Rating pill `23:13626`, Fans pending pill `61:14314`). Match card quick picks, 16 Nov: rated variants show You (green) above Fans (yellow), Full time `616:14635`, Rated · live `616:14607`; Full time · not rated shows fans only `616:14663`. |
| 05 · Screens (mobile 390) | `22:13612` | Club Hub screens, see below |
| 06 · States & edge cases | `22:13613` | States board `31:13889` |
| 07 · QA, handoff & open questions | `22:13614` | Board `33:14181` (open questions `33:14259`) |
| 08 · My Journal (mobile 390) | `151:14334` | My Journal screens, see below |
| 09 · My Journal · Premium (later) | `358:14334` | Premium previews and backlog |
| 10 · Fan Match Insights (mobile 390) | `398:14334` | Fans' story of a finished match |

### 05 · Screens (Club Hub)

| Frame | ID |
|---|---|
| Club Hub · Default v1.2 | `25:13555` |
| Club Hub · Overview · Nothing to rate v1.2 | `62:14248` |
| Insights · MOTM Race | `29:13784` |
| Insights · Fan Mood | `29:13916` |
| Insights · Players | `30:13850` |
| Insights · Matches | `30:13973` |
| Insights · Manager | `30:14063` |

### 08 · My Journal

Screens row (y 550)

| Frame | ID |
|---|---|
| Home · Default | `378:781` |
| Home · After rating | `380:781` |
| Insights · MOTM Profile | `459:798` |
| Insights · Rating Identity | `456:798` |
| Insights · You vs Fans | `361:781` |
| Insights · Manager & Team | `471:798` |
| Insights · Player Patterns | `360:781` |
| Home · All players (sheet) | `379:781` |
| Home · Rated match · line-up view | `377:781` |

Card spec notes: MOTM Profile `344:14349`, You vs Fans `344:14351`, Manager & Team `344:14353`.

390 screens (16 Nov): the card-only frames `377:781`, `406:781`, `422:781`, `239:781` and `558:14591` were 358 wide. Each is now a flat 390 frame styled like Home · All players (sheet) `379:781`: brand/navy fill, 8px corners, no shadow, no padding. The card inside stretches to the full 390 width and its layers reflow. The frame IDs are unchanged.

Player by player (16 Nov): every captured comparison (`377`, `378`, `380`, `386`, `454`, `462`, `461`, `463`) now opens with a "Picks · You vs Fans" table (MOTM, Lowest, Highest; e.g. `624:14663` in the line-up view) and marks each side's MOTM by swapping that pill's star for a trophy (green you, yellow fans), with a "MOTM key" item in the key.

Post-match story row (y 4776)

| Moment | ID |
|---|---|
| 01 Rating reveal | `176:781` |
| 02 Top 3 | `177:781` |
| 03 Vs your usual | `163:781` |
| 04 By position | `178:781` |
| 05 Manager | `167:781` (floodlit manager scene `777:15531`, 18 Nov) |
| 06 MOTM vs fans | `419:781` (fans' leader row `419:827` picked out; MOTM trophy scene `803:15531`, 18 Nov) |
| 07 Agreement | `166:781` (you-vs-fans scene `812:15531` under the eyebrow since 19 Nov, Michel's mock) |
| 08 Biggest difference | `168:781` (kit number `168:842` restyled like the RATEM kit, 18 Nov) |
| 09 End | `418:781` (moved into slot 9, x 3906, 19 Nov) |

19 Nov: the old card 09 Team rating left the main story (it only repeated the match card). Every story frame's counter and progress bar now match the prototype (9 core cards; extras and rare frames one fewer). The old frame `170:781` became "Not your usual with the fans" in the row below.

States row (y 6030)

| Frame | ID |
|---|---|
| Home · New fan (2 rated) | `386:781` |
| Insights · New fan (2 rated) | `401:781` |
| Story · Not rated yet | `173:781` |
| MOTM Profile · Just rated (Live) | `455:798` |
| Rating Identity · Just rated (Live) | `458:798` |
| You vs Fans · Just rated (Live) | `359:781` |
| Manager & Team · Just rated (Live) | `470:798` |

Card details & mockups row (y 9182)

| Frame | ID |
|---|---|
| MOTM Profile · every swipe card | `465:798` |
| MOTM Picks · filtered to Salah | `457:798` |
| Where You Differ · tap a player | `464:798` |
| Rating by Result · two results | `469:798` |
| Rating by Result · one result | `338:781` |
| You vs Fans · every swipe card | `363:781` |

Drill-downs row (y 14818, moved down 620 on 14 Nov)

| Frame | ID |
|---|---|
| Rating by Result · Wins sheet | `472:798` |
| Rated match · from Wins | `454:798` |
| Rated match · from Where You Differ | `462:798` |
| Rated match · from Rating Range | `461:798` |
| Rated match · from MOTM Picks | `463:798` |

The rest of the original cards, 14 Nov (y 16730). Built natively in Figma (RATEM variables, RATEM kit), not captured.

| Frame | ID |
|---|---|
| Card · Home or Away (MOTM "Your big calls", card 4) | `541:14455` |
| Card · The Manager: You vs the Fans ("More on the manager", card 1) | `541:14543` |
| Card · The Manager by Result ("More on the manager", card 2) | `541:14629` |

Also on 14 Nov: Home or Away was added to the "Your big calls" set in MOTM Profile `459:798`, MOTM Live `455:798` (Live numbers) and the every-swipe-card mockup `465:798`. The "More on the manager" set was appended to Manager & Team `471:798` (set `543:14561`) and Manager & Team Live `470:798` (set `543:15129`).

Post-match story · only when it happens (y 17770). Each frame uses a match where it triggers.

| Moment | Match | ID |
|---|---|---|
| After a win (after 01) | vs Man City | `546:14351` |
| Season high (after 02) | vs Man City | `546:14417` |
| On a run (after 03) | vs Chelsea | `546:14504` |
| Same weakest link (after 07) | vs Salzburg | `548:14351` |
| Against the fans, again (after 08) | vs Salzburg | `548:14443` |
| The manager vs the fans (after 08 since 19 Nov) | vs Man City | `548:14558` |
| Not your usual with the fans (after 08, 19 Nov; replaces card 09 Team rating; only on a 0.5+ shift from your usual team gap, 5+ earlier matches, 100+ fan ratings) | @ Brighton | `170:781` (x 3906) |
| Last vs the same opponent (after 03, 17 Nov) | vs Man City | `727:14951` |
| A steady rating day (card 03 variant, 17 Nov) | @ LASK | `728:14969` |
| MOTM vote · tie at the top (card 06 variant, 18 Nov; prototype `?motmtie=1`; scene `803:15596`) | @ Rapid Wien | `795:15531` |

17 Nov: "Last vs" ranks above After a win, so in vs Man City it takes that slot (2 extras per group). After a win still shows @ Brighton, and Season high there is now 3 / 13.

Rare moments · after launch (y 18760, 16 Nov thread with Michel and Warren). It is its own section, not part of Your Patterns, and it is not for launch. In the prototype it sits behind the review toggle "Rare moments (after launch)", or `?rare=1`.

Updated the same evening after Michel's note:
- Up to 3 records in one match share one gold card, which you swipe through, strongest first.
- The "one in every 5 matches" rule is gone.
- A record has to beat the old one by 0.2 or more (3 points for MOTM share). A smaller gain only updates the shelf.
- Match rating and manager records were added, for nine types in all.

Section 08 is now 21145 tall.

| Frame | ID |
|---|---|
| Story · Rare moment · Biggest gap ever (@ Rapid Wien) | `663:14663` |
| Story · Rare moment · vs Man City · 1 of 3 Highest match rating | `677:14951` |
| Story · Rare moment · vs Man City · 2 of 3 Highest player rating | `663:14821` |
| Story · Rare moment · vs Man City · 3 of 3 Highest manager rating | `677:15025` |
| Story · Rare moment · Boldest MOTM call ever (@ Betis) | `663:14952` |
| Home · Your records (shelf on the 390 screen) | `664:14735` |
| Your records · every tile (y 20040) | `664:14914` |
| Rare moments · rules board (y 20040) | `678:15399` |

The last of TechAhead's original Journal cards (17 Nov, y 20504; section 08 is now 21700 tall). Built natively (RATEM variables and kit).

| Frame | Lives in | ID |
|---|---|---|
| Card · How You Rate Salah (distribution chart) | Rating Identity, under Your Rating Range | `733:14969` |
| Card · Results and Salah | Players, after Player Pattern | `734:14969` |
| Card · Results and Your Players (All, default) | Players, after Player Pattern | `734:15047` |
| Card · When You Strongly Disagreed | You vs Fans, card 3 of 4 in "Players: you vs the fans" | `735:15070` |

The screens show them too: How You Rate (All) in Rating Identity `456:798`, Results and Your Players in Player Patterns `360:781`, and Strongly Disagreed as card 3 of 4 in You vs Fans `361:781`, its Live state `359:781` and the every-swipe-card mockup `363:781`.

390 frames (17 Nov): the last 15 frames at 370 are now 390, flat like `379:781`: `338:781`, `457:798`, `469:798`, `541:14455`, `541:14543`, `541:14629`, `550:14522`, `550:14595`, `550:14897`, `563:14686`, `563:14784`, `563:14969`, `563:15153`, `563:15262`, `564:14660`.

### 09 · My Journal · Premium (later)

Fan DNA preview `239:781`, Fan DNA sheet `241:781`, Story end note `420:781`, Unsung Hero card `358:14341`, Premium backlog `358:14391`.

Fan archetypes (Michel's "RATEM Fan Archetypes" doc, 14 Nov, y 4830): fan identity card from V1.5 `558:14591`, Fan DNA sheet with archetypes `559:14589`, archetype reference board `558:14624`. The older Fan DNA preview `239:781` and sheet `241:781` are labelled "V1, before archetypes".

Premium cards · designed (later), 14 Nov: MOTM in Wins and Losses `550:14522`, MOTM Independence `550:14595`, Player Percentiles `550:14897`, Story · Among all fans `550:14900`. 17 Nov: Story · Advanced Fan Split `729:14969` (casual fans vs season-ticket holders; needs season-ticket data).

Player relationships on Michel's "Player Relationship Logic" (14 Nov, y 3990, sample full season of 30 matches): Unsung Hero `563:14686`, Mr Consistent `563:14784`, Highs & Lows `563:14969`, Scapegoat `563:15153`, Moments Player `563:15262` (replaces Rarely Dominant). Row "Player relationships · Michel's logic" (y 1970): "More types unlock as you rate" on the real 13 matches `564:14660`, rules board `564:14661`. The earlier versions (`552:*`, `358:14341`) were removed.

### 10 · Fan Match Insights

Not rated: Club Hub match card entry `406:781`, 01 Fans' match rating `399:781`, 02 MOTM vote `402:781`, 03 Highest and lowest `400:781`, 04 Most divisive `405:781`, 05 Widest ranges `403:781`, 06 End · not rated `414:781`, 06b End · nothing open to rate `415:781`.

If you rated: Club Hub match card · Your match insights `422:781` (You vs Fans picks table `616:14681`, 16 Nov), Journal story end · fans' view link `421:781`, Rated 01 Highest and lowest `423:781`, Rated 02 Most divisive `425:781`, Rated 03 Widest ranges `426:781`, Rated 04 End `424:781`.

## Phase 2 (`0:1`), TechAhead originals

Named frames worth knowing. The page also has many unnamed "Frame" / "Free" frames, pasted screenshots and large backdrop rectangles.

| Frame | ID |
|---|---|
| My Journal - MOTM Profile - Free | `4:15558`, `4:25183` |
| My Journal - MOTM Profile - Paid | `4:16890` |
| My Journal - Rating Identity - Free | `4:17348`, `4:25509` |
| My Journal - Rating Vs Fans - Free | `4:17588` |
| My Journal - Manager & Team Tendencies - Free | `4:18050` |
| My Journal - Player Relationships - Free | `4:18364` |
| Rating Range for Other Players | `4:18631`, `4:18749`, `4:25743` |
| My Journal / Season journal | `4:25038` (row header `4:25034`) |
| Your Insights | `4:12701` |
| Agreement Score | `4:12892` |
| Biggest Disagreement | `4:13021` |
| Standout Player | `4:13114` |
| Rating Personality - Generous | `4:13219` |
| MOTM Match | `4:13296` |
| MOTM Insights Set 1 / Rating Insights Set 2 / Pattern Insights Set 3 | `4:14167` / `4:14442` / `4:14738` |
| Match Insights - Recap / Fan Comparison / Trends / Final Profile | `4:13500` / `4:13699` / `4:13872` / `4:14008` |
| Match Insights: Vs Fans - Match Consensus | `4:18880`, `4:23548` |
| Match Insights: Vs Fans - Where You Differed | `4:19221`, `4:23889` |
| Your pattern - Manager | `4:16675` |
| Your pattern - Player Tendencies | `4:16814` |
| Club Hub | `4:12285`, `4:24640` |
| See what fans think when you have not rated | `4:12245` |
| Leave a rating | `4:12397` |
| How To Earn Badges | `4:8680` |
| Article - Premium+ Card / Locked Card 1 | `4:9183` / `4:12594` |

## Phase 1 (`4:39482`), shipped app

Mostly 390-wide screens, with row-header frames (240–256 tall) naming each flow.

| Flow | Example frame IDs |
|---|---|
| Splash, onboarding (Onboarding 1–12), get started | `4:44643`, `4:50765`–`4:50801` |
| Log in, create account, forgot password, OTP | `4:44661`, `4:44710`, `4:44911`, `4:45071` |
| Select club, personal / profile details | `4:45019`, `4:44950`, `4:51618` |
| Home (several states) | `4:45131`, `4:45237`, `4:45429`, `4:53827` |
| See what fans think | `4:47367`, `4:47411`, `4:53230` |
| Club Hub | `4:47451`, `4:53308` |
| Public profile (same team / your team) | `4:47642`, `4:53587` |
| My Journal / Season journal | `4:48487`, `4:48620` |
| Search | `4:48859`–`4:49184` |
| My profile, edit profile, change password | `4:49309`, `4:51660`, `4:51687` |
| Notifications and empty states (no connection, no ratings, no results) | `4:49590`–`4:49731` |
| Settings, legal, help, devices, notifications, delete / export data, language | `4:49762`–`4:50188`, `4:51541`–`4:51598` |
| Leave a rating (plus Sections 1 and 2 with variants) | `4:50391`, `4:51890`, `4:52599` |
| Match: Sturm Graz Vs Inter | `4:50546`, `4:50607`, `4:50668` |
| Comment / action / likes bottom sheets, Player Ratings | `4:50942`–`4:51402`, `4:51466` |
