"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { FAN_MOOD, MANAGER_TREND, MOTM_RACE, POSITION_RATINGS, TABS, type TabId } from "@/lib/data";
import { usePrototype } from "./Provider";
import { Card, Img, Jersey } from "./ui";

function SeasonMotmRace() {
  return (
    <Card title="Season MOTM Race">
      <div className="race">
        <p className="body-xs">Mohamed Salah leads season MOTM voting with <b>34%</b> of eligible ballots across 12 fixtures.</p>
        <div className="race-list">
          {MOTM_RACE.map((p, i) => (
            <div key={p.name}>
              <div className="race-row">
                <span className={`race-rank${i === 0 ? " lead" : ""}`}>{i + 1}</span>
                <span className={i === 0 ? "race-name lead" : "race-name"}>{p.name}</span>
                <b>{p.share}%</b>
                <small>({p.votes})</small>
              </div>
              <div className="race-track"><span style={{ width: `${p.share}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="race-foot"><span>Total eligible ballots</span><b>12,118 across 12 fixtures</b></div>
      </div>
    </Card>
  );
}

function FanMood() {
  const W = 280;
  const H = 144;
  const x = (i: number) => 10 + (i * (W - 20)) / (FAN_MOOD.length - 1);
  const y = (v: number) => H - (v / 10) * H;
  return (
    <Card title="Fan Mood / Team Rating Trend">
      <div className="mood">
        <p className="body-xs">Fanbase squad ratings finished <b className="bad">1.4 points lower</b> across the last six eligible matches (7.3 → 5.9).</p>
        <div className="chart-box">
          <div className="chart-plot">
            <div className="chart-y">{[10, 8, 6, 4, 2, 0].map((n) => <span key={n}>{n}</span>)}</div>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Fan squad rating fell from 7.3 to 5.9 across six matches">
              {[2, 4, 6, 8].map((g) => <line key={g} x1="0" x2={W} y1={y(g)} y2={y(g)} className="grid" />)}
              {FAN_MOOD.slice(1).map((p, i) => (
                <line key={p.opp} x1={x(i)} y1={y(FAN_MOOD[i].value)} x2={x(i + 1)} y2={y(p.value)} className={p.value < FAN_MOOD[i].value ? "down" : p.value > FAN_MOOD[i].value ? "up" : "flat"} />
              ))}
              {FAN_MOOD.map((p, i) => (
                <g key={p.opp}>
                  <circle cx={x(i)} cy={y(p.value)} r={i === FAN_MOOD.length - 1 ? 6 : 3.5} className={i === FAN_MOOD.length - 1 ? "last" : "dot"} />
                  <text x={Math.min(x(i), W - 14)} y={y(p.value) - 10} textAnchor="middle">{p.value.toFixed(1)}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="chart-x">
            {FAN_MOOD.map((p) => <div key={p.opp}><span>{p.opp}</span><small>{p.date}</small></div>)}
          </div>
        </div>
        <div className="change-badge">
          <span className="change-icon"><Img src="trend-down.svg" size={16} /></span>
          <div><b>-1.4 Squad Rating Dip</b><small>Last 6 match trajectory</small></div>
          <span className="change-pill">7.3 → 5.9</span>
        </div>
      </div>
    </Card>
  );
}

function FanBaseline() {
  return (
    <Card title="Fanbase Rating Baseline">
      <p className="body-xs plain">The fanbase rates this squad generously, with a median rating of 6.7 across the season. The collective bar sits high. Supporters have been willing to reward performances.</p>
      <div className="baseline">
        <span>FAN MEDIAN</span>
        <strong>6.7</strong>
        <div className="gauge"><i style={{ width: "66.9%" }} /><b style={{ left: "66.9%" }} /></div>
      </div>
    </Card>
  );
}

function WidestRange() {
  return (
    <Card title="Widest Season Rating Range" gap={15}>
      <div className="range-player">
        <Jersey small initial="M" no={11} />
        <strong>Mohamed Salah</strong>
        <span>Forward</span>
      </div>
      <p className="body-sm">Mohamed Salah’s fanbase match average ranged from 5.4 to 8.5 this season, a 3.1-point spread across eligible appearances.</p>
      <div className="range-fixtures">
        <span><Img src="range-low.svg" size={12} />vs Betis, 24 Jan 2026</span>
        <span><Img src="range-high.svg" size={12} style={{ transform: "scaleY(-1)" }} />vs Inter, 3 Mar 2026</span>
      </div>
      <div className="range-panel">
        <div className="range-spread"><span>Spread</span><strong>3.1</strong></div>
        <div className="rule" />
        <span className="range-label">Rating Range</span>
        <div className="range-scale">
          <div className="range-track">
            <i style={{ left: "54%", right: "15%" }} />
            <em className="low" style={{ left: "54%" }}>5.4</em>
            <em className="high" style={{ left: "85%" }}>8.5</em>
          </div>
          <div className="range-axis"><span>0</span><span>5</span><span>10</span></div>
        </div>
      </div>
    </Card>
  );
}

function SeasonExtremes() {
  const { setFocusFixture } = usePrototype();
  const router = useRouter();
  const open = (id: string) => {
    setFocusFixture(id);
    router.push("/club-hub", { scroll: false });
  };
  return (
    <Card title="Season Rating Extremes">
      <div className="extremes">
        <button onClick={() => open("mci-home")}>
          <small>Highest fan-rated match</small>
          <span>vs. Manchester City (H)</span>
          <em className="win">4-1 WIN</em>
          <strong className="good"><Img src="stadium.svg" w={20} h={19.9} />8.4</strong>
          <u>12 Jan 2026<Img src="arrow-up-right.svg" size={15} /></u>
        </button>
        <button onClick={() => open("mci-away")}>
          <small>Lowest fan-rated match</small>
          <span>vs. Manchester City (A)</span>
          <em className="loss">0-4 LOSS</em>
          <strong className="poor"><Img src="plane.svg" w={25.8} h={22.7} />4.1</strong>
          <u>9 Nov 2025<Img src="arrow-up-right.svg" size={15} /></u>
        </button>
      </div>
    </Card>
  );
}

function Controversial() {
  return (
    <Card title="Most Controversial Match">
      <div className="contro-head">
        <span>Sturm Graz vs Arsenal, 27 Oct 2025</span>
        <em>RECORD SPREAD</em>
      </div>
      <p className="contro-copy">
        The fanbase was most divided after this match. Fan ratings ranged from <b className="c-low">3.0</b> to <b className="c-high">9.5</b>, with a median of <b>6.2</b>. This is the widest spread of opinion recorded this season.
      </p>
      <div className="contro-viz">
        <div className="contro-labels"><span className="c-low">HARSH (3.0)</span><span>MEDIAN (6.2)</span><span className="c-high">GENEROUS (9.5)</span></div>
        <div className="contro-bar">
          <i style={{ left: "30%", right: "5%" }} />
          <b className="m-low" style={{ left: "30%" }} />
          <b className="m-high" style={{ left: "95%" }} />
          <b className="m-mid" style={{ left: "62%" }}><span>6.2</span></b>
        </div>
        <h3>NO COLLECTIVE VERDICT</h3>
        <small>Supporters saw the same match very differently.</small>
      </div>
    </Card>
  );
}

function FanManager() {
  const { edges } = usePrototype();
  const equal = edges.managerGap === "equal";
  const home = equal ? 7.7 : 7.2;
  const away = equal ? 7.7 : 6.4;
  return (
    <Card title="Fan Manager Rating">
      <p className="body-sm muted">{equal ? "Home and away manager ratings are closely matched" : "Fans rate the manager higher at home"}</p>
      <div className="venue-stack">
        <div className="venue">
          <div><strong className="good"><Img src="stadium.svg" w={20} h={19.9} />{home.toFixed(1)}</strong><small>{equal ? 5 : 12} Eligible Matches</small></div>
          <span>HOME RATING</span>
        </div>
        <div className="gap-divider">
          <span>{!equal && <Img src="gap-caret.svg" w={5.8} h={2.9} />}{equal ? "NO GAP" : "0.8 PT GAP"}</span>
        </div>
        <div className="venue">
          <div><strong className={equal ? "good" : "poor"}><Img src="plane.svg" w={25.8} h={22.7} />{away.toFixed(1)}</strong><small>{equal ? 7 : 13} Eligible Matches</small></div>
          <span>AWAY RATING</span>
        </div>
      </div>
      <blockquote>
        {equal
          ? "Fans rated the manager 7.7 at home and 7.7 away. No displayed home/away difference."
          : "The fanbase rates the manager noticeably higher at home: 7.2 vs 6.4 away, a 0.8-point difference across 12 home and 13 away matches."}
      </blockquote>
    </Card>
  );
}

function ManagerTrend() {
  const { edges } = usePrototype();
  const y = (v: number) => ((7.2 - v) / (7.2 - 5.2)) * 144;
  const avgLine = y(6.4) + 24;
  return (
    <Card title="Manager Rating Trend">
      <p className="body-xs plain">How fan opinion of the manager has shifted across recent matches.</p>
      <div className="trend-card">
        {edges.managerTrend === "none" && (
          <div className="trend-empty"><strong>No trend yet</strong><span>No qualifying fixtures have a fan manager rating so far.</span></div>
        )}
        {edges.managerTrend === "one" && (
          <div className="trend-empty"><strong>Latest eligible rating: 7.7</strong><span>More qualifying fixtures are needed for a trend.</span></div>
        )}
        {edges.managerTrend === "many" && (
          <>
            <p className="trend-avg">SEASON AVG 6.4</p>
            <div className="trend-plot">
              <div className="trend-baseline" style={{ top: avgLine }} />
              {MANAGER_TREND.map((p) => (
                <div className="trend-col" key={p.opp}>
                  <span className={`trend-point ${p.value >= 6.4 ? "above" : "below"}`} style={{ top: y(p.value) }}>{p.value.toFixed(1)}</span>
                  <small>{p.opp}<br />({p.venue})</small>
                </div>
              ))}
            </div>
            <div className="trend-foot">
              <div><strong><Img src="arrow-red.svg" size={13.3} />1.1 pts</strong><small>over the last 5<br />matches</small></div>
              <div><strong>3</strong><small>straight matches<br />below season average</small></div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function Bar({ label, value, tone }: { label: ReactNode; value: number; tone: string }) {
  return (
    <div className="bar">
      <div className="bar-head"><span>{label}</span><b>{value.toFixed(1)} / 10</b></div>
      <div className="bar-track"><i className={tone} style={{ width: `${value * 10}%` }} /></div>
    </div>
  );
}

function TeamByResult() {
  const { edges } = usePrototype();
  return (
    <Card title="Team Rating by Result">
      <div className="bars tight">
        <Bar label="WINS (12)" value={8.1} tone="win" />
        {edges.draws && <Bar label="DRAWS (2)" value={7.4} tone="draw" />}
        <Bar label="LOSSES (1)" value={7.3} tone="loss" />
      </div>
    </Card>
  );
}

function PositionRatings() {
  return (
    <Card title="Average Fan Player Rating by Position">
      <p className="body-sm">Midfielders had the lowest average fan player rating among the displayed position groups this season (7.0).</p>
      <div className="bars">
        {POSITION_RATINGS.map((p) => <Bar key={p.label} label={p.label} value={p.value} tone="white" />)}
      </div>
      <p className="info-chip"><Img src="info.svg" size={12} />Goalkeepers included in Club Hub position grouping.</p>
    </Card>
  );
}

const CONTENT: Record<TabId, ReactNode> = {
  "fan-sentiment": (<><SeasonMotmRace /><FanMood /><FanBaseline /></>),
  "player-rankings": (<><WidestRange /></>),
  "match-trends": (<><SeasonExtremes /><Controversial /></>),
  "manager-team": (<><FanManager /><ManagerTrend /><TeamByResult /><PositionRatings /></>),
};

export function Insights({ tab }: { tab: TabId }) {
  const active = useRef<HTMLAnchorElement>(null);
  const index = TABS.findIndex((t) => t.id === tab);
  const next = TABS[index + 1];

  useEffect(() => {
    active.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  return (
    <div className="insights">
      <header className="insights-bar">
        <Link href="/club-hub" scroll={false} aria-label="Back to Club Hub"><Img src="back.svg" w={15.5} h={11.5} /></Link>
        <h1>Club Hub</h1>
      </header>
      <div className="insights-body">
        <nav className="tabs" aria-label="Insight categories">
          {TABS.map((t) => (
            <Link key={t.id} ref={t.id === tab ? active : undefined} href={`/club-hub/insights/${t.id}`} scroll={false} aria-current={t.id === tab ? "page" : undefined} className={t.id === tab ? "on" : ""}>{t.label}</Link>
          ))}
        </nav>
        <div className="tab-panel" key={tab}>
          {CONTENT[tab]}
          {next ? (
            <Link className="next-tab" href={`/club-hub/insights/${next.id}`} scroll={false}>Next: {next.label}<Img src="chevron-right.svg" size={17.6} /></Link>
          ) : (
            <Link className="next-tab" href="/club-hub" scroll={false}>Back to Club Hub<Img src="chevron-right.svg" size={17.6} /></Link>
          )}
        </div>
      </div>
    </div>
  );
}
