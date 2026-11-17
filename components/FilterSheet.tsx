"use client";

import { useState } from "react";
import { matchesFilter, usePrototype, type HistoryFilter } from "./Provider";
import { Img, Sheet } from "./ui";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CHIPS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Bundesliga", label: "Bundesliga" },
  { id: "Champions League", label: "Champions League" },
];

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function FilterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { fixtures, filter, setFilter, range, setRange } = usePrototype();
  // Opens on the filters currently applied, so nothing the fan set is lost.
  const [chip, setChip] = useState(filter);
  const [month, setMonth] = useState(() => {
    const d = range ? new Date(`${range.from}T12:00:00`) : new Date(2026, 2, 7);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [from, setFrom] = useState<string | null>(range?.from ?? null);
  const [to, setTo] = useState<string | null>(range && range.to !== range.from ? range.to : null);
  const draft = from ? { from, to: to ?? from } : null;
  const count = fixtures.filter((f) => matchesFilter(f, chip, draft)).length;
  const label = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const summary = !from ? "Any date" : !to ? `${label(from)} (tap another day for a range)` : `${label(from)} – ${label(to)}`;

  const offset = (new Date(month.y, month.m, 1).getDay() + 6) % 7;
  const days = new Date(month.y, month.m + 1, 0).getDate();

  const shift = (by: number) =>
    setMonth(({ y, m }) => {
      const next = new Date(y, m + by, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });

  const pick = (day: string) => {
    if (!from || to) {
      setFrom(day);
      setTo(null);
    } else if (day < from) {
      setTo(from);
      setFrom(day);
    } else {
      setTo(day);
    }
  };

  const apply = () => {
    setFilter(chip);
    setRange(from ? { from, to: to ?? from } : null);
    onClose();
  };

  const clear = () => {
    setChip("all");
    setFilter("all");
    setFrom(null);
    setTo(null);
    setRange(null);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} label="Filter">
      <div className="sheet-header">
        <div><h2>Filter</h2></div>
        <button aria-label="Close" onClick={onClose}><Img src="close.svg" size={24} /></button>
      </div>
      <div className="sheet-filters">
        {CHIPS.map((c) => (
          <button key={c.id} aria-pressed={chip === c.id} className={chip === c.id ? "on" : ""} onClick={() => setChip(c.id)}>{c.label}</button>
        ))}
      </div>
      <div className="calendar">
        <p>Dates</p>
        <p className="calendar-summary" aria-live="polite">{summary}</p>
        <div className="calendar-caption">
          <strong>{MONTHS[month.m]} {month.y}</strong>
          <button aria-label="Previous month" onClick={() => shift(-1)}>‹</button>
          <button aria-label="Next month" onClick={() => shift(1)}>›</button>
        </div>
        <div className="calendar-grid weekdays">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: offset }, (_, i) => <span key={`gap-${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const day = iso(month.y, month.m, i + 1);
            const end = day === from || day === to;
            const within = Boolean(from && to && day > from && day < to);
            return (
              <button key={day} className={end ? "end" : within ? "within" : ""} aria-pressed={end} onClick={() => pick(day)}>{i + 1}</button>
            );
          })}
        </div>
      </div>
      <div className="sheet-actions">
        <button onClick={clear}>Clear all</button>
        <button className="primary" onClick={apply} disabled={count === 0} aria-describedby="filter-count">
          {count === 0 ? "No matches" : `Show ${count} ${count === 1 ? "match" : "matches"}`}
        </button>
      </div>
      <p id="filter-count" className="sheet-hint" aria-live="polite">
        {count === 0 ? "Nothing matches this combination. Widen the dates or pick another filter." : " "}
      </p>
    </Sheet>
  );
}
