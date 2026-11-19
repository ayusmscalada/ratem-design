"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ALIGNED_WITHIN, MANAGER_USUAL_MIN, MY_POSITIONS, STORY_EXTRA, avg, managerUsualBefore, fanSplitFor, lineupFor, rareMoments, storyExtras, type JournalMatch, type LineupRating, type RareRecord, type RunChip, type StoryRun } from "@/lib/journal";
import { fanMatchFor, motmTieDemo, motmVotesFor, voteLeaders } from "@/lib/fanMatch";
import { Crown, PosIcon } from "./Insights";
import { ManagerScene } from "./ManagerScene";
import { MotmScene } from "./MotmScene";
import { VsScene } from "./VsScene";
import { PremiumBadge, label, useJournalMatches } from "./Journal";
import { usePrototype } from "./Provider";
import { Delta, Img, Kit, RecordMedal, TeamLogo } from "./ui";

/*
 * Post-match insights as full-screen story moments (team decision, 3 Nov): hierarchy, one key
 * number, one visual, at most one short line. Your Patterns first, then Vs Fans.
 * The first moment is the rating → patterns reveal: your new match rating drops into your recent
 * matches next to the real fixtures, and your season average visibly moves.
 */

const f1 = (x: number) => x.toFixed(1);
const r1 = (x: number) => Math.round(x * 10) / 10;
const GROUPS: Record<string, string> = { DEF: "Defence", MID: "Midfield", FWD: "Attack" };

/** `card`: moments that share one card (the rare records) share one progress segment and one count. */
type StoryMoment = { key: string; group: "you" | "fans" | "rare" | "end"; tone: string; body: ReactNode; card?: string };

function CountUp({ from, to, run }: { from: number; to: number; run: boolean }) {
  const [v, setV] = useState(run ? from : to);
  useEffect(() => {
    if (!run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now() + 700; // after the new bar lands
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - start) / 700));
      setV(from + (to - from) * k);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, run]);
  return <>{f1(run ? v : to)}</>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="sm-eyebrow">{children}</p>;
}

const RESULT_NAME = { W: "win", D: "draw", L: "loss" } as const;

/** A short run of ratings, oldest first, each with its fixture label (for the "on a run" moments). */
function RunChips({ chips, usual, fans }: { chips: RunChip[]; usual?: number; fans?: boolean }) {
  return (
    <ol className="sm-run" aria-label={chips.map((c) => `${c.label} ${c.date}: ${f1(c.v)}${c.fans !== undefined ? `, fans ${f1(c.fans)}` : ""}`).join(". ")}>
      {chips.map((c) => (
        <li key={c.date} className={fans ? (c.v > (c.fans ?? 0) ? "up" : "down") : usual !== undefined && c.v >= usual ? "up" : "down"}>
          <strong className="num">{f1(c.v)}</strong>
          {fans && c.fans !== undefined && <span className="num fan">{f1(c.fans)}</span>}
          <b>{c.label}</b>
          <small>{c.date}</small>
        </li>
      ))}
    </ol>
  );
}

function RunRow({ run, dir }: { run: StoryRun; dir: "up" | "down" }) {
  return (
    <div className="sm-runrow">
      <div className="sm-runhead">
        <Kit no={run.p.no} size={40} keeper={run.p.pos === "GK"} />
        <span><b>{run.p.short}</b><small><span className="num">{run.n}</span> in a row {dir === "up" ? "above" : "below"} your usual <span className="num">{f1(run.p.usual)}</span></small></span>
      </div>
      <RunChips chips={run.chips} usual={run.p.usual} />
    </div>
  );
}

/**
 * Moments from TechAhead's original Match Insights rows that only appear when they happen (14 Nov): the core 9 stay
 * as they are (10 until card 9 Team rating came out, 19 Nov), and at most STORY_EXTRA.perGroup extra moments join
 * each group, strongest first.
 */
function extraMoments(m: JournalMatch, matches: JournalMatch[], soFar: string, fansLine: ReactNode, rare: RareRecord[]) {
  const e = storyExtras(m, matches);
  const you: { after: string; moment: StoryMoment }[] = [];
  const fans: { after: string; moment: StoryMoment }[] = [];
  // A season high that is also your all-time high shows once, as the rare moment: Season high moves on to the next player.
  const highs = e.highs.filter((x) => !rare.some((r) => r.kind === "high" && r.p?.short === x.p.short));
  if (highs.length) {
    const h = { ...highs[0], others: highs.slice(1).map((x) => x.p.short) };
    you.push({ after: "podium", moment: {
      key: "high", group: "you", tone: "gold",
      body: (
        <>
          <Eyebrow>Season high</Eyebrow>
          <div className="sm-player"><Kit no={h.p.no} size={72} keeper={h.p.pos === "GK"} /><h2 className="sm-title">{h.p.short}</h2></div>
          <div className="sm-duo">
            <div className="you"><small>Today</small><strong className="num">{f1(h.p.you)}</strong></div>
            <Delta value={r1(h.p.you - h.prevBest)} className="big" />
            <div><small>Best before</small><strong className="num">{f1(h.prevBest)}</strong></div>
          </div>
          <p className="sm-line">Your highest rating for him this season. The best before was {h.prevAt}.</p>
          {h.others.length > 0 && <p className="sm-line muted">Also a season high from you: {h.others.slice(0, 3).join(", ")}{h.others.length > 3 ? ` and ${h.others.length - 3} more` : ""}.</p>}
        </>
      ),
    } });
  }
  // Last vs this opponent (the original "Last vs Manchester City", 17 Nov). It ranks above "After a win": a repeat
  // fixture is the rarer story. The player is the biggest change since then, skipping one already shown as a season high.
  const lv = e.lastVs;
  const lvRow = lv?.rows.find((x) => x.p.short !== highs[0]?.p.short);
  if (lv && lvRow) {
    const { p, before } = lvRow;
    you.push({ after: "usual", moment: {
      key: "lastvs", group: "you", tone: "blue",
      body: (
        <>
          <Eyebrow>Last vs {lv.prev.opp}</Eyebrow>
          <div className="sm-player"><Kit no={p.no} size={72} keeper={p.pos === "GK"} /><h2 className="sm-title">{p.short}</h2></div>
          <div className="sm-duo">
            <div><small>Last time</small><strong className="num">{f1(before)}</strong></div>
            <Delta value={r1(p.you - before)} className="big" />
            <div className="you"><small>Today</small><strong className="num">{f1(p.you)}</strong></div>
          </div>
          <p className="sm-line">{label(lv.prev)} on {lv.prev.date}, {lv.prev.score} {lv.prev.result}: you rated him <b className="num">{f1(before)}</b>.</p>
          <p className="sm-line muted">Your match rating then <b className="num">{f1(lv.teamBefore)}</b>, today <b className="num">{f1(lv.teamToday)}</b>.</p>
        </>
      ),
    } });
  }
  if (e.result) {
    const r = e.result, word = RESULT_NAME[m.result];
    you.push({ after: "rating", moment: {
      key: "result", group: "you", tone: "you",
      body: (
        <>
          <Eyebrow>After a {word}</Eyebrow>
          <h2 className="sm-title">{r.gap > 0 ? `Better than your usual ${word}` : `Not your usual ${word}`}</h2>
          <div className="sm-duo">
            <div className="you"><small>This match</small><strong className="num">{f1(r.today)}</strong></div>
            <Delta value={r.gap} className="big" />
            <div><small>Your usual {word}</small><strong className="num">{f1(r.usual)}</strong></div>
          </div>
          <p className="sm-line">{m.score} {m.result}, and you rated the team <b className="num">{f1(Math.abs(r.gap))}</b> {r.gap > 0 ? "above" : "below"} your average after your other <b className="num">{r.n}</b> {word === "loss" ? "losses" : `${word}s`}.</p>
        </>
      ),
    } });
  }
  if (e.run) {
    const { up, down } = e.run;
    you.push({ after: "usual", moment: {
      key: "run", group: "you", tone: up && !down ? "you" : "coral",
      body: (
        <>
          <Eyebrow>On a run</Eyebrow>
          <h2 className="sm-title">{up && down ? "One up, one down" : up ? `A strong run for ${up.p.short}` : `A tough run for ${down!.p.short}`}</h2>
          {up && <RunRow run={up} dir="up" />}
          {down && <RunRow run={down} dir="down" />}
          <p className="sm-line muted">Above / below = at least 0.3 from your usual (median) rating for him.</p>
        </>
      ),
    } });
  }
  // Not your usual with the fans (19 Nov): the old Team rating card, now only on a strong deviation from your usual
  // team gap with the fans. It goes first in the Vs Fans extras, so it is never cut by the per-group limit.
  if (e.teamShift) {
    const t = e.teamShift;
    const sg = (g: number) => (g > 0 ? `+${f1(g)}` : g < 0 ? `−${f1(-g)}` : "0.0");
    const usualLine = t.usual > 0 ? <>You usually rate the team <b className="num">{f1(t.usual)}</b> higher than other fans</>
      : t.usual < 0 ? <>You usually rate the team <b className="num">{f1(-t.usual)}</b> lower than other fans</>
      : <>You usually rate the team level with other fans</>;
    const todayLine = t.today === 0 ? <>today you were level with them{soFar}</>
      : <>today you rated them <b className="num">{f1(Math.abs(t.today))}</b> {t.today > 0 ? "higher" : "lower"}{soFar}</>;
    fans.unshift({ after: "difference", moment: {
      key: "teamshift", group: "fans", tone: t.shift < 0 ? "coral" : "gold",
      body: (
        <>
          <Eyebrow>Team rating</Eyebrow>
          <h2 className="sm-title">Not your usual with the fans</h2>
          <div className="sm-duo">
            <div><small>Usually</small><strong className="num">{sg(t.usual)}</strong><small className="sm-duo-n">vs the fans</small></div>
            <Delta value={t.shift} className="big" />
            <div className="you"><small>Today</small><strong className="num">{sg(t.today)}</strong><small className="sm-duo-n">vs the fans{soFar}</small></div>
          </div>
          <p className="sm-line">{usualLine}, but {todayLine}.</p>
          <p className="sm-line muted">Team rating today: you <b className="num">{f1(t.you)}</b>, fans <b className="num">{f1(t.fans)}</b>{soFar}. Your usual is your typical gap over {t.n} earlier matches.</p>
          {fansLine}
        </>
      ),
    } });
  }
  if (e.manager) {
    const g = e.manager;
    fans.push({ after: "difference", moment: {
      key: "mgrfans", group: "fans", tone: g.gap < 0 ? "coral" : "gold",
      body: (
        <>
          <Eyebrow>The manager vs the fans</Eyebrow>
          <h2 className="sm-title">{g.gap < 0 ? "Tougher on him than the fans" : "Kinder to him than the fans"}</h2>
          <div className="sm-duo">
            <div className="you"><small>You</small><strong className="num">{f1(g.you)}</strong></div>
            <Delta value={g.gap} className="big" />
            <div className="fan"><small>Fans{soFar}</small><strong className="num">{f1(g.fans)}</strong></div>
          </div>
          <p className="sm-line">You rated the manager <b className="num">{f1(Math.abs(g.gap))}</b> {g.gap < 0 ? "lower" : "higher"} than the fans{soFar}.</p>
          {fansLine}
        </>
      ),
    } });
  }
  if (e.fanRun) {
    const f = e.fanRun;
    fans.push({ after: "difference", moment: {
      key: "fanrun", group: "fans", tone: f.dir === "above" ? "gold" : "coral",
      body: (
        <>
          <Eyebrow>Against the fans, again</Eyebrow>
          <div className="sm-player"><Kit no={f.p.no} size={64} keeper={f.p.pos === "GK"} /><h2 className="sm-title">{f.p.short}</h2></div>
          <p className="sm-line"><b className="num">{f.n}</b> matches in a row you&apos;ve rated him {f.dir} the fans.</p>
          <RunChips chips={f.chips} fans />
          <p className="sm-key"><span><i className="you" />You</span><span><i className="fan" />Fans</span></p>
          {fansLine}
        </>
      ),
    } });
  }
  if (e.weakest) {
    const w = e.weakest.p;
    fans.push({ after: "agreement", moment: {
      key: "weakest", group: "fans", tone: "blue",
      body: (
        <>
          <Eyebrow>Same weakest link</Eyebrow>
          <div className="sm-player"><Kit no={w.no} size={72} keeper={w.pos === "GK"} /><h2 className="sm-title">{w.short}</h2></div>
          <div className="sm-duo">
            <div className="you"><small>You</small><strong className="num">{f1(w.you)}</strong></div>
            <Delta value={r1(w.you - w.fans)} className="big" />
            <div className="fan"><small>Fans{soFar}</small><strong className="num">{f1(w.fans)}</strong></div>
          </div>
          <p className="sm-line">Your lowest-rated player, and the fans&apos;{soFar} too.</p>
          {fansLine}
        </>
      ),
    } });
  }
  return { you: you.slice(0, STORY_EXTRA.perGroup), fans: fans.slice(0, STORY_EXTRA.perGroup) };
}

const RARE_TITLE: Record<RareRecord["kind"], string> = {
  teamHigh: "Your highest match rating ever",
  teamLow: "Your lowest match rating ever",
  high: "Your highest player rating ever",
  low: "Your lowest player rating ever",
  mgrHigh: "Your highest manager rating ever",
  mgrLow: "Your lowest manager rating ever",
  gap: "Your biggest gap ever",
  motm: "Your boldest MOTM call ever",
  split: "Your biggest split with the fans",
};

/**
 * Rare moment (after launch, 16 Nov thread): one gold card when this match set a new personal record across your
 * whole RATEM history. Shows the record, the old one it beat, and how much history stands behind "ever".
 * Up to three records in one match share this card (Michel, 16 Nov evening): you swipe through them, strongest first.
 */
function RareCard({ r, i, n }: { r: RareRecord; i: number; n: number }) {
  const pct = r.kind === "motm";
  const val = (x: number) => (pct ? `${x}%` : f1(x));
  const fan = r.p ? lineupFor(r.m).find((p) => p.short === r.p!.short) : undefined;
  const highest = (what: string) => <>The {r.kind.endsWith("Low") || r.kind === "low" ? "lowest" : "highest"} of the <b className="num">{what === "player" ? r.ratings : r.matches}</b> {what} ratings you&apos;ve given on RATEM.</>;
  const evidence = {
    teamHigh: highest("match"),
    teamLow: highest("match"),
    high: highest("player"),
    low: highest("player"),
    mgrHigh: highest("manager"),
    mgrLow: highest("manager"),
    gap: <>Across all <b className="num">{r.matches}</b> matches you&apos;ve rated on RATEM.</>,
    motm: <>You&apos;ve never been this far from the fans on a MOTM, across <b className="num">{r.matches}</b> matches.</>,
    split: <>Your widest gap with the fans on one player, across <b className="num">{r.matches}</b> matches.</>,
  }[r.kind];
  return (
    <>
      <span className="sm-rec-medal"><RecordMedal size={50} /></span>
      {n > 1 && <span className="sm-rec-dots" aria-hidden>{Array.from({ length: n }, (_, k) => <i key={k} className={k === i ? "on" : ""} />)}</span>}
      <Eyebrow>{n > 1 ? `New personal record · ${i + 1} of ${n}` : "New personal record"}</Eyebrow>
      <h2 className="sm-title">{RARE_TITLE[r.kind]}</h2>
      {r.kind === "gap" && r.p && r.q ? (
        <>
          <strong className="sm-hero num gold">{f1(r.value)}</strong>
          <p className="sm-sub">between your highest and lowest-rated player in one match</p>
          <div className="sm-rec-pair">
            {[{ p: r.p, tag: "Highest" }, { p: r.q, tag: "Lowest" }].map(({ p, tag }) => (
              <div key={tag}>
                <Kit no={p.no} size={40} keeper={p.pos === "GK"} />
                <span><small>{tag}</small><b>{p.short}</b></span>
                <strong className="num">{f1(p.you)}</strong>
              </div>
            ))}
          </div>
        </>
      ) : r.kind === "teamHigh" || r.kind === "teamLow" ? (
        <>
          <strong className="sm-hero num gold">{f1(r.value)}</strong>
          <p className="sm-sub">Your match rating: the average of your 11 player ratings, {r.m.score} {r.m.result}</p>
        </>
      ) : r.kind === "mgrHigh" || r.kind === "mgrLow" ? (
        <>
          <div className="sm-player"><span className="sm-rec-coach" aria-hidden><Img src="tie.svg" w={14} h={34} /></span><b className="sm-rec-name">Head Coach</b></div>
          <strong className="sm-hero num gold">{f1(r.value)}</strong>
        </>
      ) : r.p ? (
        <>
          <div className="sm-player"><Kit no={r.p.no} size={64} keeper={r.p.pos === "GK"} /><b className="sm-rec-name">{r.p.short}</b></div>
          {r.kind === "split" && fan ? (
            <div className="sm-duo">
              <div className="you"><small>You</small><strong className="num">{f1(fan.you)}</strong></div>
              <Delta value={r1(fan.you - fan.fans)} className="big" />
              <div className="fan"><small>Fans</small><strong className="num">{f1(fan.fans)}</strong></div>
            </div>
          ) : (
            <strong className="sm-hero num gold">{val(r.value)}</strong>
          )}
          {r.kind === "motm" && <p className="sm-sub">of fans also picked him. Most went for {r.m.fanMotm.replace(" ", " ")}.</p>}
        </>
      ) : null}
      <p className="sm-rec-old">Old record <b className="num">{val(r.prev.value)}</b> · {r.prev.at}</p>
      <p className="sm-line">{evidence}</p>
      {n > 1 && i < n - 1 && <p className="sm-rec-next">Swipe for your next record</p>}
      <Link className="sm-rec-saved" href="/my-journal" scroll={false}>Saved to Your records<Img src="chevron-right.svg" size={14} /></Link>
    </>
  );
}

function buildMoments(m: JournalMatch, lineup: LineupRating[], matches: JournalMatch[], reveal: boolean, live: { remaining: string } | null, premium: ReactNode, fanView: boolean, premiumOn: boolean, rare: RareRecord[], motmTie = false): StoryMoment[] {
  const teamYou = avg(lineup.map((p) => p.you));
  const idx = matches.findIndex((x) => x.id === m.id);
  const older = matches.slice(idx + 1);
  const prev5 = older.slice(0, 5).reverse();
  const before = avg(older.map((x) => x.you));
  const after = avg([m, ...older].map((x) => x.you));

  const byYou = [...lineup].sort((a, b) => b.you - a.you);
  const tie = byYou[0].you === byYou[1].you;
  const podium = [byYou[1], byYou[0], byYou[2]];
  const rankOf = (p: LineupRating) => 1 + byYou.filter((q) => q.you > p.you).length;

  const usualPick = [...lineup].sort((a, b) => Math.abs(b.you - b.usual) - Math.abs(a.you - a.usual))[0];
  const usualGap = r1(usualPick.you - usualPick.usual);
  // A steady rating day (the original card, 17 Nov): nobody moved STORY_EXTRA.steady or more from your usual, so card 3
  // says so instead of calling a small change "well above".
  const steady = Math.abs(usualGap) < STORY_EXTRA.steady;

  const groups = (["FWD", "MID", "DEF"] as const).map((g) => {
    const today = avg(lineup.filter((p) => p.pos === g).map((p) => p.you));
    const yours = MY_POSITIONS.find((x) => x.label === GROUPS[g])!.you;
    return { label: GROUPS[g], today, yours, gap: r1(today - yours) };
  });
  const bestGroup = [...groups].sort((a, b) => b.today - a.today)[0];
  // Lead with the biggest change from your usual (Michel, 17 Nov): harder to spot than which group scored highest.
  const lead = [...groups].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap) || b.today - a.today)[0];

  // Usual = your earlier ratings of this same manager only, never including today (Warren, 18 Nov).
  const mgrBase = managerUsualBefore(m, matches);
  const mgrGap = mgrBase.usual === null ? 0 : r1(m.manager - mgrBase.usual);
  const mgrVsTeam = r1(m.manager - teamYou);
  // One contextual sentence: today vs your usual, then vs your team rating (Warren, 18 Nov).
  const vsTeam = mgrVsTeam === 0 ? null : <><b className="num">{f1(Math.abs(mgrVsTeam))}</b> {mgrVsTeam > 0 ? "above" : "below"} your team&apos;s performance</>;
  const mgrStory = mgrBase.usual === null
    ? <>Your first {mgrBase.n ? `${mgrBase.n + 1} matches` : "match"} rating this manager. {vsTeam ? <>Today he&apos;s {vsTeam}.</> : "Level with your team today."}</>
    : mgrGap === 0
      ? <>You rated your manager right on your usual{vsTeam ? <>, {vsTeam}</> : ", level with your team"}.</>
      : <>You rated your manager {mgrGap > 0 ? "higher" : "lower"} than usual{!vsTeam ? ", level with your team's performance" : (mgrGap > 0) === (mgrVsTeam > 0) ? <>, and {vsTeam} too</> : <>, but still {vsTeam}</>}.</>;

  const aligned = lineup.filter((p) => Math.abs(p.you - p.fans) <= ALIGNED_WITHIN + 1e-9);
  const biggest = [...lineup].sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans))[0];
  const bigGap = r1(biggest.you - biggest.fans);
  const votes = motmTie ? motmTieDemo(motmVotesFor(m), m.myMotm) : motmVotesFor(m);
  const topShare = votes.split[0].share;
  // Everyone level at the top gets the leader treatment (Michel, 18 Nov). Usually that's one player.
  const leaders = voteLeaders(votes);
  const tied = leaders.length > 1;
  const agree = tied ? leaders.includes(m.myMotm) : m.myMotm === m.fanMotm;
  const listNames = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0]);
  const motmLine = !tied ? (m.myMotm !== m.fanMotm && <>. Most went with {m.fanMotm}</>)
    : agree ? <>, level at the top with {listNames(leaders.filter((x) => x !== m.myMotm))}</>
    : <>. {listNames(leaders)} are level at the top</>;
  const soFar = live ? " so far" : "";
  const fansLine = live ? <p className="sm-live"><i className="live-dot" aria-hidden />Fans&apos; numbers update as they rate · final in <b className="num">{live.remaining}</b></p> : null;

  const core: StoryMoment[] = [
    {
      key: "rating", group: "you", tone: "you",
      body: (
        <>
          <Eyebrow>{reveal ? <span className="sm-chip">Just rated</span> : null}Your match rating</Eyebrow>
          <strong className="sm-hero num you">{f1(teamYou)}</strong>
          <p className="sm-sub">Average of your 11 player ratings</p>
          <div className={`sm-bars${reveal ? " reveal" : ""}`} role="img" aria-label={`Your last matches, oldest first: ${prev5.map((x) => `${label(x)} ${f1(x.you)}`).join(", ")}, then this match ${f1(teamYou)}.`}>
            {prev5.map((x) => (
              <div key={x.id} className="sm-bar"><span style={{ height: `${x.you * 10}%` }}><b className="num">{f1(x.you)}</b></span><small>{x.venue} {x.code}</small></div>
            ))}
            <div className="sm-bar new"><span style={{ height: `${teamYou * 10}%` }}><b className="num">{f1(teamYou)}</b></span><small>This match</small></div>
          </div>
          {older.length > 0 && <p className="sm-line">Your season average <b className="num">{f1(before)}</b> → <b className="num you"><CountUp from={before} to={after} run={reveal} /></b></p>}
        </>
      ),
    },
    {
      key: "podium", group: "you", tone: "gold",
      body: (
        <>
          <Eyebrow>Your top 3</Eyebrow>
          <h2 className="sm-title">{tie ? `${byYou[0].short} & ${byYou[1].short}` : byYou[0].short}</h2>
          <div className="podium sm-podium" role="list" aria-label="Your three highest-rated players this match">
            {podium.map((p) => {
              const rank = rankOf(p);
              return (
                <div key={p.short} role="listitem" className={`step r${rank}`} style={{ ["--h" as string]: `${40 + ((p.you - byYou[2].you + 0.5) / (byYou[0].you - byYou[2].you + 0.5)) * 60}%` }}>
                  <div className="step-kit">
                    {rank === 1 && <Crown size={30} />}
                    <Kit no={p.no} size={rank === 1 ? 76 : 58} keeper={p.pos === "GK"} />
                  </div>
                  <div className="step-block">
                    <strong className="num">{f1(p.you)}</strong>
                    <span className="step-name">{p.short}</span>
                    <span className="medal">{tie && rank === 1 ? "=1" : rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="sm-line">{tie ? "Level at the top of your ratings." : <><b className="num">{f1(byYou[0].you - byYou[1].you)}</b> clear of {byYou[1].short}{byYou[2].you === byYou[1].you && ` and ${byYou[2].short}`}</>}</p>
        </>
      ),
    },
    {
      key: "usual", group: "you", tone: "you",
      body: steady ? (
        <>
          <Eyebrow>Compared with your usual</Eyebrow>
          <h2 className="sm-title">A steady rating day</h2>
          <p className="sm-sub">Every player within <b className="num">{f1(Math.abs(usualGap))}</b> of your usual rating for him</p>
          <ul className="sm-chips steady" aria-label="Player by player, today against your usual">
            {lineup.map((p) => <li key={p.short}>{p.short}<Delta value={r1(p.you - p.usual)} /></li>)}
          </ul>
          <p className="sm-line">No big shift this match. Your season profile keeps building.</p>
          <p className="sm-line muted">Your usual = your median rating for each player.</p>
        </>
      ) : (
        <>
          <Eyebrow>Different from your usual</Eyebrow>
          <div className="sm-player"><Kit no={usualPick.no} size={72} keeper={usualPick.pos === "GK"} /><h2 className="sm-title">{usualPick.short}</h2></div>
          <div className="sm-duo">
            <div className="you"><small>Today</small><strong className="num">{f1(usualPick.you)}</strong></div>
            <Delta value={usualGap} className="big" />
            <div><small>Your usual</small><strong className="num">{f1(usualPick.usual)}</strong></div>
          </div>
          <p className="sm-line">{usualGap > 0 ? "Well above how you usually rate him." : "Well below how you usually rate him."}</p>
        </>
      ),
    },
    {
      key: "positions", group: "you", tone: "blue",
      body: (
        <>
          <Eyebrow>Your ratings by position</Eyebrow>
          <h2 className="sm-title pos">{Math.abs(lead.gap) < 0.1 ? "Right on your usual" : <>You rated the {lead.label.toLowerCase()} <span className="num you">{f1(Math.abs(lead.gap))}</span> {lead.gap > 0 ? "above" : "below"} your usual</>}</h2>
          <p className="sm-sub">{bestGroup === lead ? <>Also your top group today, at <b className="num">{f1(bestGroup.today)}</b>.</> : <>{bestGroup.label} was still your top group today, at <b className="num">{f1(bestGroup.today)}</b>.</>}</p>
          <div className="sm-pos" role="table" aria-label="Your ratings today by position, against your usual">
            {groups.map((g) => (
              <div className={`sm-pos-row${g === lead ? " lead" : ""}`} role="row" key={g.label}>
                <span className="sm-pos-who" role="rowheader"><PosIcon label={g.label} /><span><b>{g.label}</b><small>Your usual <b className="num">{f1(g.yours)}</b></small></span></span>
                <span className="sm-pos-today" role="cell"><strong className="num">{f1(g.today)}</strong><small>Today</small></span>
                <span role="cell"><Delta value={g.gap} className="big" /></span>
              </div>
            ))}
          </div>
          <p className="sm-line muted">Your usual is your season average for each group. Goalkeeper not included.</p>
        </>
      ),
    },
    {
      key: "manager", group: "you", tone: "you",
      body: (
        <>
          <Eyebrow>The manager</Eyebrow>
          <ManagerScene />
          <h2 className="sm-title">{mgrBase.usual === null ? "Building your usual" : mgrGap > 0 ? "Above your usual" : mgrGap < 0 ? "Below your usual" : "Right on your usual"}</h2>
          <div className="sm-duo even">
            <div className="you"><small>Today</small><strong className="num">{f1(m.manager)}</strong></div>
            {mgrBase.usual !== null && <Delta value={mgrGap} className="big" />}
            {mgrBase.usual !== null
              ? <div><small>Your usual</small><strong className="num">{f1(mgrBase.usual)}</strong><small className="sm-duo-n">over {mgrBase.n} matches</small></div>
              : <div className="pending"><small>Your usual</small><strong className="num">–</strong><small className="sm-duo-n">after {MANAGER_USUAL_MIN} matches</small></div>}
          </div>
          <p className="sm-line sm-mgr-story">{mgrStory}</p>
        </>
      ),
    },
    {
      key: "motm", group: "fans", tone: "gold",
      body: (
        <>
          <Eyebrow>Your MOTM vs the fans</Eyebrow>
          <MotmScene />
          <h2 className="sm-title">{agree ? "You and the fans agree" : "You went your own way"}</h2>
          {/* The full fans' vote, with where your pick landed (Michel, 12 Nov). The fans' view skips this for raters. */}
          <ul className="fm-votes sm-votes" aria-label={`The fans' MOTM vote${soFar}`}>
            {votes.split.map((v) => (
              <li key={v.short} className={`${leaders.includes(v.short) ? "top" : ""}${v.short === m.myMotm ? " mine" : ""}`}>
                <span className="fm-vn">{v.short}{v.short === m.myMotm && <em className="you-tag">You</em>}</span>
                <span className="fm-bar"><i style={{ width: `${(v.share / topShare) * 100}%` }} /></span>
                <b className="num">{v.share}%</b>
              </li>
            ))}
            <li className="rest"><span className="fm-vn">Others</span><span className="fm-bar"><i style={{ width: `${(votes.others / topShare) * 100}%` }} /></span><b className="num">{votes.others}%</b></li>
          </ul>
          <p className="sm-line"><b className="num fan">{m.fanMotmShare}%</b> of fans{soFar} also picked {m.myMotm}{motmLine}</p>
          {fansLine}
        </>
      ),
    },
    {
      key: "agreement", group: "fans", tone: "gold",
      body: (
        <>
          <Eyebrow>Agreement with the fans</Eyebrow>
          {/* Michel's mock (18 Nov); moved under the eyebrow on his 19 Nov comment, consistent with cards 5 and 6. */}
          <VsScene />
          <strong className="sm-hero num"><span className="you">{aligned.length}</span><small> of 11</small></strong>
          <p className="sm-sub">ratings within {ALIGNED_WITHIN} of the fans{soFar}</p>
          <ul className="sm-chips" aria-label="Player by player">
            {lineup.map((p) => {
              const ok = Math.abs(p.you - p.fans) <= ALIGNED_WITHIN + 1e-9;
              return <li key={p.short} className={ok ? "ok" : ""}>{ok ? "✓ " : ""}{p.short}{!ok && <Delta value={p.you - p.fans} />}</li>;
            })}
          </ul>
          {fansLine}
        </>
      ),
    },
    {
      key: "difference", group: "fans", tone: "coral",
      body: (
        <>
          <Eyebrow>Biggest difference</Eyebrow>
          <div className="sm-player"><Kit no={biggest.no} size={72} keeper={biggest.pos === "GK"} /><h2 className="sm-title">{biggest.short}</h2></div>
          <div className="sm-duo">
            <div className="you"><small>You</small><strong className="num">{f1(biggest.you)}</strong></div>
            <Delta value={bigGap} className="big" />
            <div className="fan"><small>Fans{soFar}</small><strong className="num">{f1(biggest.fans)}</strong></div>
          </div>
          <p className="sm-line">You rated him <b className="num">{f1(Math.abs(bigGap))}</b> {bigGap > 0 ? "higher" : "lower"} than the fans{soFar}.</p>
          {fansLine}
        </>
      ),
    },
    // Core card 9 "Team rating" was removed (19 Nov): it only repeated the match card. It now returns as the
    // "Not your usual with the fans" extra, only on a strong deviation (TEAM_SHIFT in lib/journal.ts).
    {
      key: "end", group: "end", tone: "end",
      body: (
        <>
          <Eyebrow>{label(m)} · {m.date}</Eyebrow>
          <h2 className="sm-title big">That&apos;s your match</h2>
          <p className="sm-sub">It&apos;s already in your Journal: your season average, MOTM profile and player patterns now include it.</p>
          <div className="sm-actions">
            <Link className="btn primary block" href="/my-journal" scroll={false}>Go to My Journal</Link>
            <Link className="btn secondary block" href="/club-hub" scroll={false}>Back to Club Hub</Link>
          </div>
          {/* The fans' view of the match is a secondary layer for someone who rated (Michel, 12 Nov). */}
          {fanView ? (
            <Link className="sm-more" href={`/club-hub/match/${m.id}`} scroll={false}>
              <span><b>More from this match: the fans&apos; view</b><small>Highest and lowest rated, most divisive, widest ranges</small></span>
              <Img src="chevron-right.svg" size={14} />
            </Link>
          ) : live ? (
            <p className="sm-more wait">The fans&apos; view of this match opens when its window closes in <b className="num">{live.remaining}</b>.</p>
          ) : null}
          {premium}
        </>
      ),
    },
  ];

  // Extra moments only when they happen, each after the core moment it builds on.
  const extra = extraMoments(m, matches, soFar, fansLine, rare);
  const slots = new Map<string, StoryMoment[]>();
  for (const x of [...extra.you, ...extra.fans]) slots.set(x.after, [...(slots.get(x.after) ?? []), x.moment]);
  // Premium (later): where your rating for the biggest-difference player sits among all fans (TechAhead's
  // "Player vs Fans Percentile"). Sample: the real figure needs every fan's rating for him in this match.
  if (premiumOn) {
    const share = Math.max(3, Math.min(97, Math.round(50 + bigGap * 35)));
    const higher = bigGap >= 0;
    slots.set("difference", [...(slots.get("difference") ?? []), {
      key: "percentile", group: "fans", tone: "coral",
      body: (
        <>
          <Eyebrow><PremiumBadge />Among all fans</Eyebrow>
          <div className="sm-player"><Kit no={biggest.no} size={64} keeper={biggest.pos === "GK"} /><h2 className="sm-title">{biggest.short}</h2></div>
          <strong className="sm-hero num you">{higher ? share : 100 - share}<small>%</small></strong>
          <p className="sm-sub">of the {m.fansRated} fans who rated him{soFar} gave him {higher ? "less" : "more"} than your <b className="num">{f1(biggest.you)}</b></p>
          {fansLine}
        </>
      ),
    }]);
    // Premium (later): Advanced Fan Split (TechAhead's Premium+ card), casual fans vs season-ticket holders.
    // Sample: the real split needs RATEM to know which fans hold a season ticket.
    const split = fanSplitFor(m);
    const gap = r1(split.season.v - split.casual.v);
    const closer = Math.abs(teamYou - split.casual.v) <= Math.abs(teamYou - split.season.v) ? "the casual fans" : "the season-ticket holders";
    const row = (k: string, name: string, v: number, n: number | null) => (
      <li key={k} className={k}>
        <span className="sm-split-who">{name}{n !== null && <small>{n} fans</small>}</span>
        <span className="sm-split-bar"><i style={{ width: `${v * 10}%` }} /></span>
        <b className="num">{f1(v)}</b>
      </li>
    );
    slots.set("difference", [...(slots.get("difference") ?? []), {
      key: "fansplit", group: "fans", tone: "gold",
      body: (
        <>
          <Eyebrow><PremiumBadge />Advanced Fan Split</Eyebrow>
          <h2 className="sm-title">{gap < 0 ? "Season-ticket holders were tougher" : gap > 0 ? "Season-ticket holders were kinder" : "Both groups saw it the same"}</h2>
          <ul className="sm-split" aria-label={`Match rating${soFar}: season-ticket holders ${f1(split.season.v)}, casual fans ${f1(split.casual.v)}, you ${f1(teamYou)}`}>
            {row("season", "Season-ticket holders", split.season.v, split.season.n)}
            {row("casual", "Casual fans", split.casual.v, split.casual.n)}
            {row("you", "You", teamYou, null)}
          </ul>
          <p className="sm-line"><b className="num">{f1(Math.abs(gap))}</b> apart{soFar}. You rated closer to {closer}.</p>
          {fansLine}
        </>
      ),
    }]);
  }
  const all = core.flatMap((c) => [c, ...(slots.get(c.key) ?? [])]);
  // Rare moment (after launch): its own gold card after Vs Fans, just before the end. Up to three records share it.
  if (rare.length) all.splice(all.length - 1, 0, ...rare.map((r, k): StoryMoment => ({ key: `rare-${r.kind}`, card: "rare", group: "rare", tone: "record", body: <RareCard r={r} i={k} n={rare.length} /> })));
  return all;
}

export function MatchStory({ id, reveal, start = 0, startKey }: { id: string; reveal: boolean; start?: number; startKey?: string }) {
  const router = useRouter();
  const { fixtures, rateFixture, edges } = usePrototype();
  const matches = useJournalMatches();
  const m = matches.find((x) => x.id === id);
  const openFixture = fixtures.find((f) => f.id === "open");
  const liveRemaining = m?.id === "open" && openFixture?.status === "open" ? openFixture.remaining ?? "" : null;
  const live = useMemo(() => (liveRemaining === null ? null : { remaining: liveRemaining }), [liveRemaining]);
  // Premium preview on the end card: what's extra, and a reminder that these moments stay free.
  // Premium preview on the end card: this match feeds your Fan DNA (Warren). These insights stay free.
  const premium = useMemo(() => (edges.premium ? (
    <Link className="prem-quiet in-story" href="/my-journal?dna=1" scroll={false}>
      <PremiumBadge />
      <span><b>This match is part of your Fan DNA</b><small>See what makes you unique as a fan. These match insights stay free.</small></span>
      <Img src="chevron-right.svg" size={14} />
    </Link>
  ) : null), [edges.premium]);
  const fanView = Boolean(m && fanMatchFor(m.id));
  const rare = useMemo(() => (edges.rare && m ? rareMoments(matches).shown.get(m.id) ?? [] : []), [edges.rare, m, matches]);
  const moments = useMemo(() => (m ? buildMoments(m, lineupFor(m), matches, reveal, live, premium, fanView, edges.premium, rare, edges.motmTie) : []), [m, matches, reveal, live, premium, fanView, edges.premium, rare, edges.motmTie]);
  const [i, setI] = useState(Math.max(0, start));
  // ?m=rare (or ?m=rare-gap for one record): jump to the rare moment once it exists (the review toggle can switch on after the first render).
  const rareStart = start < 0 ? Math.max(moments.findIndex((x) => x.key === startKey), moments.findIndex((x) => x.group === "rare")) : -1;
  const jumped = useRef(false);
  useEffect(() => {
    if (rareStart < 0 || jumped.current) return;
    jumped.current = true;
    setI(rareStart);
  }, [rareStart]);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const total = moments.length;
  const go = useCallback((n: number) => setI((cur) => Math.max(0, Math.min(total - 1, cur + n))), [total]);

  // A reveal link means "just rated": opened directly (review link), it records that rating.
  const needsRating = reveal && id === "open" && Boolean(openFixture && !openFixture.youRated);
  useEffect(() => {
    if (needsRating) rateFixture("open");
  }, [needsRating, rateFixture]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") router.push("/my-journal", { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, router]);

  if (!m) {
    const notRated = id === "open" && openFixture && !openFixture.youRated;
    return (
      <div className="story tone-end">
        <div className="story-top"><Link href="/my-journal" scroll={false} className="story-close" aria-label="Close"><Img src="close.svg" size={22} /></Link></div>
        <div className="story-stage"><div className="sm-body">
          {notRated ? (
            <>
              <Eyebrow>Match insights</Eyebrow>
              <h2 className="sm-title big">Rate this match first</h2>
              <p className="sm-sub">{openFixture.home} {openFixture.homeScore}–{openFixture.awayScore} {openFixture.away}. Your insights are ready the moment you rate.</p>
              <div className="sm-actions"><button className="btn primary block" onClick={() => { rateFixture("open"); router.replace("/my-journal/match/open?reveal=1", { scroll: false }); }}>Rate this match</button></div>
            </>
          ) : (
            <>
              <Eyebrow>Match insights</Eyebrow>
              <h2 className="sm-title big">No insights for this match</h2>
              <p className="sm-sub">You haven&apos;t rated it, so there&apos;s nothing personal to show.</p>
              <div className="sm-actions"><Link className="btn secondary block" href="/my-journal" scroll={false}>Back to My Journal</Link></div>
            </>
          )}
        </div></div>
      </div>
    );
  }

  const cur = moments[i];
  const firstFans = moments.findIndex((x) => x.group === "fans");
  const rareAt = moments.findIndex((x) => x.group === "rare");
  // Records that share the gold card share one progress segment and one count.
  const cards = moments.map((x) => x.card ?? x.key).filter((c, n, all) => all.indexOf(c) === n);
  const at = cards.indexOf(cur.card ?? cur.key);
  return (
    <div className={`story tone-${cur.tone}`} aria-roledescription="story">
      <div className="story-top">
        <div className="story-progress" aria-hidden>
          {cards.map((c, n) => <i key={c} className={n < at ? "done" : n === at ? "on" : ""} />)}
        </div>
        <div className="story-head">
          <TeamLogo name={m.opp} size={26} />
          <span className="story-fx"><b>{label(m)}</b><small>{m.date} · {m.score} {m.result}</small></span>
          <Link href="/my-journal" scroll={false} className="story-close" aria-label="Close match insights"><Img src="close.svg" size={22} /></Link>
        </div>
        <nav className="story-groups" aria-label="Insight groups">
          <button className={cur.group === "you" ? "on" : ""} aria-current={cur.group === "you" ? "step" : undefined} onClick={() => setI(0)}>Your Patterns</button>
          <button className={cur.group === "fans" ? "on" : ""} aria-current={cur.group === "fans" ? "step" : undefined} onClick={() => setI(firstFans)}>Vs Fans</button>
          {rareAt >= 0 && <button className={`rare${cur.group === "rare" ? " on" : ""}`} aria-current={cur.group === "rare" ? "step" : undefined} onClick={() => setI(rareAt)}><RecordMedal size={13} />Rare moment</button>}
        </nav>
      </div>
      <div
        className="story-stage"
        onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s || (e.target as HTMLElement).closest("a,button")) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) return go(dx < 0 ? 1 : -1);
          const box = e.currentTarget.getBoundingClientRect();
          go(e.clientX - box.left < box.width * 0.3 ? -1 : 1);
        }}
      >
        <div className="sm-body" key={cur.key} aria-live="polite">{cur.body}</div>
      </div>
      <div className="story-foot">
        <button onClick={() => go(-1)} disabled={i === 0} aria-label="Previous moment"><Img src="back.svg" w={15.5} h={11.5} /></button>
        <span className="num">{at + 1} / {cards.length}</span>
        <button onClick={() => go(1)} disabled={i === total - 1} aria-label="Next moment" className="fwd"><Img src="back.svg" w={15.5} h={11.5} /></button>
      </div>
    </div>
  );
}
