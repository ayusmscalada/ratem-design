"use client";

import { shortLabel } from "@/lib/fanMatch";
import type { LineupRating } from "@/lib/journal";
import { Img } from "./ui";

/** One side's headline picks for a match, as short display names ("M. Salah"). */
export type Picks = { motm: string; low: string; high: string };

/**
 * One side's MOTM, highest and lowest rated player, from that side's player ratings.
 * If the MOTM pick shares the top rating, it counts as the highest, so the two never disagree on a tie.
 */
export function picksFrom(lineup: LineupRating[], motm: string, side: "you" | "fans"): Picks {
  const sorted = [...lineup].sort((a, b) => b[side] - a[side] || Number(b.short === motm) - Number(a.short === motm));
  return { motm: shortLabel(motm), high: shortLabel(sorted[0].short), low: shortLabel(sorted[sorted.length - 1].short) };
}

export function Stat({ kind, label, icon, onClick, bare }: { kind: "fan" | "you" | "plain"; label: string; icon: "cup" | "down" | "up"; onClick?: () => void; bare?: boolean }) {
  const file = kind === "plain" ? `${icon}-white.svg` : `${icon}-${kind}.svg`;
  const body = (
    <>
      {!bare && <Img src={file} size={12} />}
      <span>{label}</span>
    </>
  );
  if (!onClick) return <span className={`stat ${kind}`}>{body}</span>;
  return <button className={`stat ${kind}`} onClick={onClick}>{body}</button>;
}

/**
 * Quick comparison for a match the user rated (Michel, 16 Nov): MOTM, lowest and highest,
 * your picks (green) above the fans' (yellow), same columns. Used on the Club Hub match card
 * and at the top of the Journal's player-by-player view.
 */
export function PicksCompare({ you, fans, onFanLow, onFanHigh, className = "" }: { you: Picks; fans: Picks; onFanLow?: () => void; onFanHigh?: () => void; className?: string }) {
  return (
    <div className={`summary-table both ${className}`.trim()} role="table" aria-label="Your picks and the fans' picks for this match">
      <div className="st-row" role="row">
        <span aria-hidden />
        <span className="stat plain-head" role="columnheader"><Img src="cup-white.svg" size={12} />MOTM</span>
        <span className="stat plain-head" role="columnheader"><Img src="down-white.svg" size={12} />Lowest</span>
        <span className="stat plain-head" role="columnheader"><Img src="up-white.svg" size={12} />Highest</span>
      </div>
      <div className="st-row" role="row">
        <span className="row-label you" role="rowheader">You</span>
        <Stat kind="you" icon="cup" label={you.motm} bare />
        <Stat kind="you" icon="down" label={you.low} bare />
        <Stat kind="you" icon="up" label={you.high} bare />
      </div>
      <div className="st-row" role="row">
        <span className="row-label fan" role="rowheader">Fans</span>
        <Stat kind="fan" icon="cup" label={fans.motm} bare />
        <Stat kind="fan" icon="down" label={fans.low} onClick={onFanLow} bare />
        <Stat kind="fan" icon="up" label={fans.high} onClick={onFanHigh} bare />
      </div>
    </div>
  );
}
