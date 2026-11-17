"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CLUB } from "@/lib/data";
import { BANDS, FAN_MATCH_MIN, fanMatchFor, type FanMatch } from "@/lib/fanMatch";
import { Crown } from "./Insights";
import { useJournalMatches, useRateAndReveal } from "./Journal";
import { usePrototype } from "./Provider";
import { Img, Kit, TeamLogo } from "./ui";

/*
 * Fan match insights (Michel's question, 12 Nov; Jimmy + Warren agreed): the fanbase's story of one
 * finished match, for anyone, rated or not. Same full-screen story format as your match insights,
 * but fan data only, in fan yellow. Shown only once the rating window has closed, so it can never
 * sway a rating. Your Patterns and You vs Fans stay exclusive to matches you rated: in their place,
 * one small line.
 */

const f1 = (x: number) => x.toFixed(1);
const r1 = (x: number) => Math.round(x * 10) / 10;

/** Moments a rater already saw in You vs Fans (team rating vs the fans, the MOTM vote with their pick). */
const REPEATS_YOU_VS_FANS = ["rating", "motm"];

type Moment = { key: string; tone: "gold" | "coral" | "end"; body: ReactNode };

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="sm-eyebrow">{children}</p>;
}

const matchName = (d: FanMatch) => `${d.fixture.home} ${d.fixture.homeScore}–${d.fixture.awayScore} ${d.fixture.away}`;

function buildMoments(d: FanMatch, end: ReactNode): Moment[] {
  const gap = r1(d.rating - d.usual);
  const [first, second] = d.split;
  const margin = first.share - second.share;
  const winner = d.lineup.find((p) => p.short === first.short)!;
  const top = d.split[0].share;
  const harsh = d.divisive.bands[0], generous = d.divisive.bands[3];

  return [
    {
      key: "rating", tone: "gold",
      body: (
        <>
          <Eyebrow>The fans&apos; match rating</Eyebrow>
          <h2 className="sm-title">{gap > 0 ? "Above the fans' usual" : gap < 0 ? "Below the fans' usual" : "Right on the fans' usual"}</h2>
          <div className="sm-duo">
            <div className="fan"><small>This match</small><strong className="num">{f1(d.rating)}</strong></div>
            <div><small>Fans&apos; usual</small><strong className="num">{f1(d.usual)}</strong></div>
          </div>
          <p className="sm-line">{gap === 0 ? "Level with their usual match rating." : <><b className="num fan">{f1(Math.abs(gap))}</b> {gap > 0 ? "above" : "below"} their usual match rating</>}</p>
          <p className="sm-line muted">Average of the fans&apos; 11 player ratings · {d.fans} fans</p>
        </>
      ),
    },
    {
      key: "motm", tone: "gold",
      body: (
        <>
          <Eyebrow>Fans&apos; MOTM vote</Eyebrow>
          <div className="sm-player"><Crown size={30} /><Kit no={winner.no} size={72} keeper={winner.pos === "GK"} /><h2 className="sm-title">{first.short}</h2></div>
          <ul className="fm-votes" aria-label="Share of fans who picked each player">
            {d.split.map((s, i) => (
              <li key={s.short} className={i === 0 ? "top" : ""}>
                <span className="fm-vn">{s.short}</span>
                <span className="fm-bar"><i style={{ width: `${(s.share / top) * 100}%` }} /></span>
                <b className="num">{s.share}%</b>
              </li>
            ))}
            <li className="rest"><span className="fm-vn">Others</span><span className="fm-bar"><i style={{ width: `${(d.others / top) * 100}%` }} /></span><b className="num">{d.others}%</b></li>
          </ul>
          <p className="sm-line">
            {top >= 50 ? <>More than half the fans picked him</>
              : margin <= 5 ? <>A close vote: <b className="num fan">{margin}</b> points clear of {second.short}</>
              : <><b className="num fan">{margin}</b> points clear of {second.short}</>}
          </p>
        </>
      ),
    },
    {
      key: "highlow", tone: "gold",
      body: (
        <>
          <Eyebrow>Highest and lowest rated</Eyebrow>
          <h2 className="sm-title">{d.high.short} on top</h2>
          <div className="sm-picks fm-hl">
            <div className="fan"><Kit no={d.high.no} size={64} keeper={d.high.pos === "GK"} /><small>Highest</small><b>{d.high.short}</b><strong className="num">{f1(d.high.fans)}</strong></div>
            <div><Kit no={d.low.no} size={64} keeper={d.low.pos === "GK"} /><small>Lowest</small><b>{d.low.short}</b><strong className="num">{f1(d.low.fans)}</strong></div>
          </div>
          <p className="sm-line"><b className="num fan">{f1(d.high.fans - d.low.fans)}</b> between the fans&apos; top and bottom player</p>
        </>
      ),
    },
    {
      key: "divisive", tone: "coral",
      body: (
        <>
          <Eyebrow>Most divisive player</Eyebrow>
          <div className="sm-player"><Kit no={d.divisive.no} size={72} keeper={d.divisive.pos === "GK"} /><h2 className="sm-title">{d.divisive.short}</h2></div>
          <div className="split fm-split" role="img" aria-label={d.divisive.bands.map((s, i) => `${s}% rated him ${BANDS[i]}`).join(", ")}>
            {d.divisive.bands.map((s, i) => (
              <div key={BANDS[i]} className={`band b${i}`} style={{ flexGrow: s }}>
                <strong className="num">{s}%</strong>
                <small>{BANDS[i]}</small>
              </div>
            ))}
          </div>
          <div className="split-ends fm-ends">
            <span><b className="num c-low">{harsh}%</b> rated him 1–3</span>
            <span><b className="num fm-high">{generous}%</b> rated him 8–10</span>
          </div>
          <p className="sm-line">Fans&apos; average <b className="num fan">{f1(d.divisive.fans)}</b>, but few fans landed there</p>
          <p className="sm-line muted">{d.divisive.rated} fans rated him</p>
        </>
      ),
    },
    {
      key: "ranges", tone: "gold",
      body: (
        <>
          <Eyebrow>Widest fan rating ranges</Eyebrow>
          <h2 className="sm-title">Hardest to agree on</h2>
          <ul className="fm-ranges" aria-label="Middle half of the fans' ratings per player">
            {d.ranges.map((p) => (
              <li key={p.short}>
                <Kit no={p.no} size={36} keeper={p.pos === "GK"} clearNo />
                <span className="fm-rn">{p.short}<small>Fans&apos; average {f1(p.fans)}</small></span>
                <b className="num">{f1(p.lo)}–{f1(p.hi)}</b>
                <span className="fm-track" aria-hidden>
                  <i style={{ left: `${((p.lo - 1) / 9) * 100}%`, width: `${((p.hi - p.lo) / 9) * 100}%` }} />
                  <em style={{ left: `${((p.fans - 1) / 9) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <div className="fm-scale" aria-hidden><span>1</span><span>10</span></div>
          <p className="sm-line muted">Range = the middle half of the fans&apos; ratings for each player.</p>
        </>
      ),
    },
    { key: "end", tone: "end", body: end },
  ];
}

export function FanMatchStory({ id, start = 0 }: { id: string; start?: number }) {
  const router = useRouter();
  const { fixtures, edges } = usePrototype();
  const journal = useJournalMatches();
  // Signed out = nothing rated: the fans' view is their main view.
  const rated = edges.account !== "out" && journal.some((m) => m.id === id);
  const rateAndReveal = useRateAndReveal();
  const d = useMemo(() => fanMatchFor(id), [id]);
  const fixture = fixtures.find((f) => f.id === id);
  // The match being viewed is closed, so the button is for the match open for rating right now (Michel, 12 Nov).
  const toRate = fixtures.find((f) => f.status === "open" && !f.youRated);
  const upNext = fixtures.find((f) => f.status === "live");

  const end = d ? (
    <>
      <Eyebrow>{matchName(d)} · {d.fixture.dateLabel}</Eyebrow>
      <h2 className="sm-title big">That&apos;s the fans&apos; view</h2>
      <p className="sm-sub">Final numbers from {d.fans} fans. They won&apos;t change now the rating window has closed.</p>
      {rated ? (
        <div className="sm-actions">
          <Link className="btn primary block" href={`/my-journal/match/${id}`} scroll={false}>Back to your match insights</Link>
          <Link className="btn secondary block" href="/club-hub" scroll={false}>Back to Club Hub</Link>
        </div>
      ) : (
        <>
          <div className="fm-unrated">
            <b>You didn&apos;t rate this one</b>
            <span>Rate the {toRate ? "current" : "next"} match to see how you compare: your patterns and you vs the fans.</span>
          </div>
          <div className="sm-actions">
            {toRate ? (
              <div className="fm-cta">
                <button className="btn primary block" onClick={rateAndReveal}>Rate the Current Match</button>
                <p>{toRate.home} {toRate.homeScore}–{toRate.awayScore} {toRate.away} · rating closes in <b className="num">{toRate.remaining}</b></p>
              </div>
            ) : (
              // Nothing open to rate right now: say when the next one opens instead of a button.
              <p className="fm-next">{upNext ? <>Next to rate: <b>{upNext.home} vs {upNext.away}</b>. Rating opens at full time.</> : <>The next match opens for rating at full time.</>}</p>
            )}
            <Link className="btn secondary block" href="/club-hub" scroll={false}>Back to Club Hub</Link>
          </div>
        </>
      )}
    </>
  ) : null;

  // Rated: Your Patterns and You vs Fans come first, and this is the extra layer. It skips what You vs Fans
  // already showed (the fans' match rating, the MOTM vote) and keeps the fan-only discoveries (Michel, 12 Nov).
  const moments = d ? buildMoments(d, end).filter((x) => !rated || !REPEATS_YOU_VS_FANS.includes(x.key)) : [];
  const [i, setI] = useState(start);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const total = moments.length;
  const go = useCallback((n: number) => setI((cur) => Math.max(0, Math.min(total - 1, cur + n))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") router.push("/club-hub", { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, router]);

  if (!d) {
    // Still rateable, not played yet, or too few ratings: nothing from the fans to show here.
    const open = fixture?.status === "open";
    const few = fixture?.status === "closed" && (fixture.fans ?? 0) < FAN_MATCH_MIN;
    return (
      <div className="story fan-only tone-end">
        <div className="story-top"><Link href="/club-hub" scroll={false} className="story-close" aria-label="Close"><Img src="close.svg" size={22} /></Link></div>
        <div className="story-stage"><div className="sm-body">
          <Eyebrow>Fan match insights</Eyebrow>
          <h2 className="sm-title big">{open ? "Rate this match first" : few ? "Not enough ratings" : "Not ready yet"}</h2>
          <p className="sm-sub">
            {open ? "The fans' view of this match opens when you rate it, or once its rating window closes."
              : few ? `Fan insights need at least ${FAN_MATCH_MIN} fans' ratings for a match.`
              : "Fan insights open once the match's rating window has closed."}
          </p>
          <div className="sm-actions"><Link className="btn secondary block" href="/club-hub" scroll={false}>Back to Club Hub</Link></div>
        </div></div>
      </div>
    );
  }

  const cur = moments[i];
  const opp = d.fixture.home === CLUB ? d.fixture.away : d.fixture.home;
  return (
    <div className={`story fan-only tone-${cur.tone}`} aria-roledescription="story">
      <div className="story-top">
        <div className="story-progress" aria-hidden>
          {moments.map((x, n) => <i key={x.key} className={n < i ? "done" : n === i ? "on" : ""} />)}
        </div>
        <div className="story-head">
          <TeamLogo name={opp} size={26} />
          <span className="story-fx"><b>{matchName(d)}</b><small>{d.fixture.dateLabel} · Final · {d.fans} fans rated</small></span>
          <Link href="/club-hub" scroll={false} className="story-close" aria-label="Close fan match insights"><Img src="close.svg" size={22} /></Link>
        </div>
        {/* In place of Your Patterns / Vs Fans: those stay with matches you rated. */}
        <div className="fm-groups">
          <span className="fm-chip">Fan insights</span>
          {rated
            ? <Link className="fm-note" href={`/my-journal/match/${id}`} scroll={false}>You rated this one · your insights<Img src="chevron-right.svg" size={12} /></Link>
            : <span className="fm-note">You didn&apos;t rate this one</span>}
        </div>
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
