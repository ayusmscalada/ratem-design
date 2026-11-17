"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ALIGNED_WITHIN, MY_POSITIONS, avg, lineupFor, type JournalMatch, type LineupRating } from "@/lib/journal";
import { fanMatchFor, motmVotesFor } from "@/lib/fanMatch";
import { Crown } from "./Insights";
import { PremiumBadge, label, useJournalMatches } from "./Journal";
import { usePrototype } from "./Provider";
import { Delta, Img, Kit, TeamLogo } from "./ui";

/*
 * Post-match insights as full-screen story moments (team decision, 3 Nov): hierarchy, one key
 * number, one visual, at most one short line. Your Patterns first, then Vs Fans.
 * The first moment is the rating → patterns reveal: your new match rating drops into your recent
 * matches next to the real fixtures, and your season average visibly moves.
 */

const f1 = (x: number) => x.toFixed(1);
const r1 = (x: number) => Math.round(x * 10) / 10;
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const GROUPS: Record<string, string> = { DEF: "Defence", MID: "Midfield", FWD: "Attack" };

type StoryMoment = { key: string; group: "you" | "fans" | "end"; tone: string; body: ReactNode };

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

function buildMoments(m: JournalMatch, lineup: LineupRating[], matches: JournalMatch[], reveal: boolean, live: { remaining: string } | null, premium: ReactNode, fanView: boolean): StoryMoment[] {
  const teamYou = avg(lineup.map((p) => p.you));
  const teamFans = avg(lineup.map((p) => p.fans));
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

  const groups = (["FWD", "MID", "DEF"] as const).map((g) => {
    const today = avg(lineup.filter((p) => p.pos === g).map((p) => p.you));
    const yours = MY_POSITIONS.find((x) => x.label === GROUPS[g])!.you;
    return { label: GROUPS[g], today, yours, gap: r1(today - yours) };
  });
  const bestGroup = [...groups].sort((a, b) => b.today - a.today)[0];

  const managerUsual = median(matches.map((x) => x.manager));
  const mgrGap = r1(m.manager - managerUsual);
  const mgrVsTeam = r1(m.manager - teamYou);

  const aligned = lineup.filter((p) => Math.abs(p.you - p.fans) <= ALIGNED_WITHIN + 1e-9);
  const biggest = [...lineup].sort((a, b) => Math.abs(b.you - b.fans) - Math.abs(a.you - a.fans))[0];
  const bigGap = r1(biggest.you - biggest.fans);
  const teamGap = r1(teamYou - teamFans);
  const votes = motmVotesFor(m);
  const topShare = votes.split[0].share;
  const soFar = live ? " so far" : "";
  const fansLine = live ? <p className="sm-live"><i className="live-dot" aria-hidden />Fans&apos; numbers update as they rate · final in <b className="num">{live.remaining}</b></p> : null;

  return [
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
      body: (
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
          <h2 className="sm-title">{bestGroup.label} led the way</h2>
          <div className="sm-table" role="table" aria-label="Your ratings today by position vs your season average">
            <div className="sm-tr head" role="row"><span role="columnheader">Position</span><span role="columnheader">Today</span><span role="columnheader">Your avg</span><span role="columnheader">Gap</span></div>
            {groups.map((g) => (
              <div className={`sm-tr${g.label === bestGroup.label ? " top" : ""}`} role="row" key={g.label}>
                <span role="cell">{g.label}</span>
                <b role="cell" className="num you">{f1(g.today)}</b>
                <span role="cell" className="num">{f1(g.yours)}</span>
                <span role="cell"><Delta value={g.gap} /></span>
              </div>
            ))}
          </div>
          <p className="sm-line muted">Goalkeeper not included.</p>
        </>
      ),
    },
    {
      key: "manager", group: "you", tone: "you",
      body: (
        <>
          <Eyebrow>The manager</Eyebrow>
          <h2 className="sm-title">{mgrGap > 0 ? "Above your usual" : mgrGap < 0 ? "Below your usual" : "Right on your usual"}</h2>
          <div className="sm-duo">
            <div className="you"><small>Today</small><strong className="num">{f1(m.manager)}</strong></div>
            <Delta value={mgrGap} className="big" />
            <div><small>Your usual</small><strong className="num">{f1(managerUsual)}</strong></div>
          </div>
          <p className="sm-line">{mgrVsTeam === 0 ? "Level with your team rating today." : <><b className="num">{f1(Math.abs(mgrVsTeam))}</b> {mgrVsTeam > 0 ? "above" : "below"} your team rating today</>}</p>
        </>
      ),
    },
    {
      key: "motm", group: "fans", tone: "gold",
      body: (
        <>
          <Eyebrow>Your MOTM vs the fans</Eyebrow>
          <h2 className="sm-title">{m.myMotm === m.fanMotm ? "You and the fans agree" : "You went your own way"}</h2>
          {/* The full fans' vote, with where your pick landed (Michel, 12 Nov). The fans' view skips this for raters. */}
          <ul className="fm-votes sm-votes" aria-label={`The fans' MOTM vote${soFar}`}>
            {votes.split.map((v, n) => (
              <li key={v.short} className={`${n === 0 ? "top" : ""}${v.short === m.myMotm ? " mine" : ""}`}>
                <span className="fm-vn">{v.short}{v.short === m.myMotm && <em className="you-tag">You</em>}</span>
                <span className="fm-bar"><i style={{ width: `${(v.share / topShare) * 100}%` }} /></span>
                <b className="num">{v.share}%</b>
              </li>
            ))}
            <li className="rest"><span className="fm-vn">Others</span><span className="fm-bar"><i style={{ width: `${(votes.others / topShare) * 100}%` }} /></span><b className="num">{votes.others}%</b></li>
          </ul>
          <p className="sm-line"><b className="num fan">{m.fanMotmShare}%</b> of fans{soFar} also picked {m.myMotm}{m.myMotm !== m.fanMotm && <>. Most went with {m.fanMotm}</>}</p>
          {fansLine}
        </>
      ),
    },
    {
      key: "agreement", group: "fans", tone: "gold",
      body: (
        <>
          <Eyebrow>Agreement with the fans</Eyebrow>
          <strong className="sm-hero num"><span className="you">{aligned.length}</span><small> of 11</small></strong>
          <p className="sm-sub">players within {ALIGNED_WITHIN} of the fans{soFar}</p>
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
    {
      key: "team", group: "fans", tone: "gold",
      body: (
        <>
          <Eyebrow>Team rating</Eyebrow>
          <h2 className="sm-title">{teamGap > 0 ? "A little kinder than the fans" : teamGap < 0 ? "A little harder than the fans" : "Right with the fans"}</h2>
          <div className="sm-duo">
            <div className="you"><small>You</small><strong className="num">{f1(teamYou)}</strong></div>
            <Delta value={teamGap} className="big" />
            <div className="fan"><small>Fans{soFar}</small><strong className="num">{f1(teamFans)}</strong></div>
          </div>
          <p className="sm-line">{live ? `${m.fansRated} fans have rated so far.` : `${m.fansRated} fans rated this match.`}</p>
          {fansLine}
        </>
      ),
    },
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
}

export function MatchStory({ id, reveal, start = 0 }: { id: string; reveal: boolean; start?: number }) {
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
  const moments = useMemo(() => (m ? buildMoments(m, lineupFor(m), matches, reveal, live, premium, fanView) : []), [m, matches, reveal, live, premium, fanView]);
  const [i, setI] = useState(start);
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
  return (
    <div className={`story tone-${cur.tone}`} aria-roledescription="story">
      <div className="story-top">
        <div className="story-progress" aria-hidden>
          {moments.map((x, n) => <i key={x.key} className={n < i ? "done" : n === i ? "on" : ""} />)}
        </div>
        <div className="story-head">
          <TeamLogo name={m.opp} size={26} />
          <span className="story-fx"><b>{label(m)}</b><small>{m.date} · {m.score} {m.result}</small></span>
          <Link href="/my-journal" scroll={false} className="story-close" aria-label="Close match insights"><Img src="close.svg" size={22} /></Link>
        </div>
        <nav className="story-groups" aria-label="Insight groups">
          <button className={cur.group === "you" ? "on" : ""} aria-current={cur.group === "you" ? "step" : undefined} onClick={() => setI(0)}>Your Patterns</button>
          <button className={cur.group === "fans" ? "on" : ""} aria-current={cur.group === "fans" ? "step" : undefined} onClick={() => setI(firstFans)}>Vs Fans</button>
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
        <span className="num">{i + 1} / {total}</span>
        <button onClick={() => go(1)} disabled={i === total - 1} aria-label="Next moment" className="fwd"><Img src="back.svg" w={15.5} h={11.5} /></button>
      </div>
    </div>
  );
}
