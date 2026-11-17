"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KIT, LOGOS, LOW_SAMPLE_MATCHES } from "@/lib/data";
import { usePrototype } from "./Provider";

export function Img({ src, size, w, h, alt = "", style }: { src: string; size?: number; w?: number; h?: number; alt?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src.startsWith("/") ? src : `/figma/${src}`} alt={alt} width={size ?? w} height={size ?? h} style={style} />;
}

/**
 * Reports an image that failed to load, including failures that happen before
 * hydration (when React's onError has not been attached yet).
 */
function useBroken() {
  const ref = useRef<HTMLImageElement>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);
  return { ref, broken, onError: () => setBroken(true) };
}

/** Decorative photo that removes itself if it fails, leaving the brand gradient behind it. */
export function Photo({ className, src, priority, position }: { className: string; src: string; priority?: boolean; position?: string }) {
  const { ref, broken, onError } = useBroken();
  if (broken) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} className={className} src={src} alt="" onError={onError} style={position ? { objectPosition: position } : undefined} fetchPriority={priority ? "high" : undefined} loading={priority ? undefined : "lazy"} />;
}

const CREST_COLOURS = ["#c8102e", "#6cabdd", "#034694", "#ef0107", "#0057b8", "#241f20", "#fdb913"];

/** Club crest. Uses the real logo when we have one, otherwise a neutral shield with the club's initials. */
export function TeamLogo({ name, size = 16 }: { name: string; size?: number }) {
  const { ref, broken, onError } = useBroken();
  const src = LOGOS[name];
  // eslint-disable-next-line @next/next/no-img-element
  if (src && !broken) return <img ref={ref} className="crest" src={src} width={size} height={size} alt="" onError={onError} />;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  const colour = CREST_COLOURS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % CREST_COLOURS.length];
  return (
    <svg className="crest" width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M16 1.5 29 5v10.5C29 23 23.5 28.5 16 30.5 8.5 28.5 3 23 3 15.5V5Z" fill={colour} stroke="#fff" strokeWidth="1.6" />
      <text x="16" y="20" textAnchor="middle" fill="#fff" fontSize={initials.length > 2 ? 8.5 : 11} fontWeight="700" fontFamily="var(--display)">{initials}</text>
    </svg>
  );
}

export function Card({ title, children, gap = 9 }: { title: string; children: ReactNode; gap?: number }) {
  return (
    <section className="card" style={{ gap }}>
      <h2 className="card-title">{title}</h2>
      <div className="rule" />
      {children}
    </section>
  );
}

/** Fans' rating. Club Hub only ever shows fan numbers, in fan yellow. */
export function RatingPill({ value }: { value: number }) {
  return (
    <span className="rating-pill fan" aria-label={`Fans' rating ${value.toFixed(1)}`}>
      <small aria-hidden>Fans</small>
      <b aria-hidden>{value.toFixed(1)}</b>
    </span>
  );
}

/**
 * The fans' number for a match this user hasn't rated yet, while its window is open.
 * Deliberately not a lock: it's a normal step, not a premium feature (Michel, 4 Nov).
 */
export function PendingPill({ fans }: { fans?: number }) {
  return (
    <span className="rating-pill pending" aria-label={`Rate this match to see the fans' rating${fans ? `. ${fans} fans have rated so far` : ""}`}>
      <small aria-hidden>Fans</small>
      <b aria-hidden>?</b>
    </span>
  );
}

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener.current?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;
  const root = document.getElementById("sheet-root");
  if (!root) return null;

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={{ transform: drag ? `translateY(${drag}px)` : undefined, transition: drag ? "none" : undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sheet-handle-zone"
          onPointerDown={(e) => {
            start.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => start.current !== null && setDrag(Math.max(0, e.clientY - start.current))}
          onPointerUp={() => {
            start.current = null;
            if (drag > 90) onClose();
            setDrag(0);
          }}
        >
          <div className="sheet-handle" />
        </div>
        {children}
        <div className="sheet-footer-bar" />
      </div>
    </div>,
    root,
  );
}

// Set on the element (not only via CSS) so Figma captures keep the bold display face for kit numbers.
const KIT_NO_FONT = { fontFamily: "var(--font-display), 'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 700 } as const;

const SHIRT = "M20 3 26 1Q32 8 38 1L44 3 62 14 55 28 48 24 48 59 16 59 16 24 9 28 2 14Z";

/** Kit size tiers. Large carries the RATEM wordmark, medium a compact badge, small drops the number so the badge stays readable. */
export function kitTier(size: number): "L" | "M" | "S" {
  return size >= 60 ? "L" : size >= 30 ? "M" : "S";
}

/**
 * The RATEM kit: one branded shirt for every player, whatever the club (client decision, 4 Nov).
 * Only the number changes. The club is identified by its crest and name, never by kit colours.
 * Goalkeepers wear the keeper version: solid RATEM blue, no pattern, same badge (Michel, 4 Nov).
 */
export function Kit({ no, size = 56, label, keeper, clearNo }: { no?: number | string; size?: number; label?: string; keeper?: boolean; clearNo?: boolean }) {
  const id = useId().replace(/:/g, "");
  const tier = kitTier(size);
  const showNo = no !== undefined && tier !== "S";
  return (
    <svg className={`kit kit-${tier}${keeper ? " kit-gk" : ""}`} width={size} height={size * 0.94} viewBox="0 0 64 60" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <clipPath id={`k${id}`}><path d={SHIRT} /></clipPath>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a6bff" />
          <stop offset="1" stopColor={KIT.base} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#k${id})`}>
        {keeper ? (
          <rect width="64" height="60" fill={KIT.keeper} />
        ) : (
          <>
            <rect width="64" height="60" fill={`url(#g${id})`} />
            {/* stripes, symmetric around the centre: sky, deep, white, deep, sky */}
            <rect x="17.5" y="0" width="6" height="60" fill={KIT.sky} />
            <rect x="23.5" y="0" width="5.5" height="60" fill={KIT.deep} />
            <rect x="29" y="0" width="6" height="60" fill={KIT.centre} />
            <rect x="35" y="0" width="5.5" height="60" fill={KIT.deep} />
            <rect x="40.5" y="0" width="6" height="60" fill={KIT.sky} />
            {/* sleeve cuffs */}
            <path d="M2 14 9 28 11.6 26.7 4.6 12.6Z" fill={KIT.centre} />
            <path d="M62 14 55 28 52.4 26.7 59.4 12.6Z" fill={KIT.centre} />
          </>
        )}
        {/* collar */}
        <path d="M26 1Q32 8 38 1L35.5 0.4Q32 4.6 28.5 0.4Z" fill={KIT.deep} />
      </g>
      <path d={SHIRT} fill="none" stroke={KIT.deep} strokeWidth="1.6" strokeLinejoin="round" />
      {tier === "L" && (
        <g aria-hidden>
          <rect x="37.5" y="11" width="16" height="6.4" rx="1.6" fill={KIT.deep} stroke={KIT.sky} strokeWidth=".6" />
          <text x="45.5" y="15.7" textAnchor="middle" className="kit-badge" fill="#fff" fontSize="4.6">RATEM</text>
        </g>
      )}
      {tier === "M" && (
        <g aria-hidden>
          <circle cx="43" cy="15" r="4.6" fill={KIT.deep} stroke={KIT.sky} strokeWidth=".8" />
          <text x="43" y="17.4" textAnchor="middle" className="kit-badge" fill="#fff" fontSize="6.4">R</text>
        </g>
      )}
      {tier === "S" && (
        <g aria-hidden>
          <circle cx="32" cy="31" r="11" fill={KIT.deep} stroke="#fff" strokeWidth="1.6" />
          <text x="32" y="36.6" textAnchor="middle" className="kit-badge" fill="#fff" fontSize="15">R</text>
        </g>
      )}
      {showNo && (
        // Two layers (outline under, white on top) instead of paint-order, so Figma captures render it the same as browsers.
        // clearNo (Michel, 12 Nov): bigger number with a thin near-black outline, readable on every stripe and the keeper kit.
        <g aria-hidden>
          <text x="32" y="47" textAnchor="middle" className="kit-no" style={KIT_NO_FONT} fontSize={clearNo ? 25 : 20} fill={clearNo ? KIT.outline : KIT.deep} stroke={clearNo ? KIT.outline : KIT.deep} strokeWidth={clearNo ? 3 : 3.4} strokeLinejoin="round">{no}</text>
          <text x="32" y="47" textAnchor="middle" className="kit-no" style={KIT_NO_FONT} fontSize={clearNo ? 25 : 20} fill={KIT.number}>{no}</text>
        </g>
      )}
    </svg>
  );
}

/** Signed difference with an explicit +/− and words for screen readers. Never colour alone. */
export function Delta({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const r = Math.round(value * 10) / 10;
  const tone = r > 0 ? "up" : r < 0 ? "down" : "flat";
  const text = r > 0 ? `+${r.toFixed(1)}` : r < 0 ? `−${Math.abs(r).toFixed(1)}` : "0.0";
  return <span className={`delta ${tone} ${className}`}>{text}{suffix}</span>;
}

/** One insight. Order follows the handbook: question, title, context, answer, evidence, action, disclosure. */
export function Moment({ id, question, title, context, accent = "blue", filter, children, note, action, isNew, failed }: {
  id?: string; question: string; title: string; context?: ReactNode; accent?: "blue" | "sky" | "gold" | "coral" | "violet" | "green";
  filter?: ReactNode; children: ReactNode; note?: ReactNode; action?: ReactNode; isNew?: boolean;
  /** Partial failure: this card couldn't load, the rest of the screen is fine. */
  failed?: { onRetry: () => void };
}) {
  const { edges } = usePrototype();
  const lowSample = edges.sample === "low" && edges.season === "current" && !failed;
  return (
    <section id={id} className={`moment accent-${accent}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="moment-top">
        <div>
          <p className="moment-q">{isNew && <span className="new-dot">New</span>}{question}</p>
          <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
          {context && <p className="moment-context">{context}</p>}
        </div>
        {!failed && filter}
      </div>
      {lowSample && <p className="low-sample">Early days: based on only {LOW_SAMPLE_MATCHES} rated matches, so this can still change a lot.</p>}
      {failed ? (
        <div className="state-panel error card-error" role="alert">
          <strong>Couldn&apos;t load this insight</strong>
          <span>The rest of Club Hub is up to date. Try again in a moment.</span>
          <button className="btn secondary" onClick={failed.onRetry}>Try again</button>
        </div>
      ) : children}
      {action && !failed && <div className="moment-action">{action}</div>}
      {note && !failed && <p className="moment-note"><Img src="info.svg" size={12} />{note}</p>}
    </section>
  );
}

export type FilterOption = { id: string; label: string; short?: string; meta?: string };

/**
 * In-card player filter ("All ↓"). Lists only players eligible for this card,
 * keeps the fan inside the insight, and defaults to All.
 */
export function PlayerFilter({ options, value, onChange, label }: { options: FilterOption[]; value: string; onChange: (id: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const picked = options.find((o) => o.id === value);
  const current = value === "all" || !picked ? "All" : picked.short ?? picked.label;

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    const away = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = [...(list.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
        const at = items.indexOf(document.activeElement as HTMLButtonElement);
        items[(at + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      }
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const pick = (id: string) => {
    setOpen(false);
    if (id !== value) onChange(id);
  };

  return (
    <div className="pfilter" ref={wrap}>
      <button className={`pfilter-btn${value !== "all" ? " on" : ""}`} aria-haspopup="listbox" aria-expanded={open} aria-label={`${label}: ${current}. Change player`} onClick={() => setOpen(!open)}>
        <span>{current}</span>
        <Img src="dropdown.svg" size={12} style={{ transform: open ? "rotate(180deg)" : undefined }} />
      </button>
      {open && (
        <ul className="pfilter-list" role="listbox" aria-label={label} ref={list}>
          {[{ id: "all", label: "All players", meta: "Default" }, ...options].map((o) => (
            <li key={o.id}>
              <button role="option" aria-selected={o.id === value} onClick={() => pick(o.id)}>
                <span>{o.label}</span>
                {o.meta && <small>{o.meta}</small>}
              </button>
            </li>
          ))}
          <li className="pfilter-foot">Only players with enough data for this insight are listed.</li>
        </ul>
      )}
    </div>
  );
}

/** Briefly shows a skeleton when the card's player changes, so the whole card visibly refreshes together. */
export function useSwap(key: string) {
  const [shown, setShown] = useState(key);
  useEffect(() => {
    if (key === shown) return;
    const t = setTimeout(() => setShown(key), 450);
    return () => clearTimeout(t);
  }, [key, shown]);
  return { shown, loading: key !== shown };
}

/**
 * Nav icons as inline SVG drawn in currentColor. (They used CSS masks before, which some
 * renderers, including the Figma capture, turn into plain white boxes.)
 */
export function NavGlyph({ name, size = 24 }: { name: "home" | "shield" | "book"; size?: number }) {
  if (name === "shield") {
    return (
      <svg className="nav-glyph" width={size * 0.77} height={size * 0.917} viewBox="0 0 18.5237 22" fill="currentColor" aria-hidden>
        <path d="M18.16 2.75a1.1 1.1 0 0 0-.83-.29C13.35 2.81 10.87 1.05 9.99.27a1.1 1.1 0 0 0-1.45 0C7.65 1.05 5.16 2.8 1.2 2.47A1.1 1.1 0 0 0 0 3.58v9.3c.01.25.25 6.14 8.91 9.07.23.07.48.07.71 0 8.66-2.92 8.9-8.82 8.9-9.07V3.57c0-.31-.13-.61-.36-.82ZM17.42 12.85c0 .2-.29 5.37-8.17 8.05C1.37 18.24 1.11 13.07 1.1 12.87V3.56c4.39.38 7.17-1.6 8.16-2.46.99.87 3.76 2.84 8.16 2.47v9.28Z" />
        <path d="M15.77 4.72c-2.83-.11-4.94-1.14-6.2-1.99a.55.55 0 0 0-.61 0c-1.27.85-3.37 1.87-6.21 1.99a.55.55 0 0 0-.53.55v7.55c-.06.35.89 4.82 7.04 6.8 6.14-1.98 7.1-6.47 7.04-6.87V5.27a.55.55 0 0 0-.53-.55Z" />
      </svg>
    );
  }
  if (name === "home") {
    return (
      <svg className="nav-glyph" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.83 8.01 14.28 2.77c-1.28-1.02-3.28-1.03-4.55-.01L3.18 8.01c-.94.75-1.51 2.25-1.31 3.43l1.26 7.54C3.42 20.67 4.99 22 6.7 22h10.6c1.69 0 3.29-1.36 3.58-3.03l1.26-7.54c.18-1.17-.39-2.67-1.31-3.42ZM12.75 18a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 1.5 0v3Z" />
      </svg>
    );
  }
  return (
    <svg className="nav-glyph" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.74V4.67c0-1.2-.98-2.09-2.17-1.99h-.06c-2.1.18-5.29 1.25-7.07 2.37l-.17.11c-.29.18-.77.18-1.06 0l-.25-.15C9.44 3.9 6.26 2.84 4.16 2.67 2.97 2.57 2 3.47 2 4.66v12.08c0 .96.78 1.86 1.74 1.98l.29.04c2.17.29 5.52 1.39 7.44 2.44l.04.02c.27.15.7.15.96 0 1.92-1.06 5.28-2.17 7.46-2.46l.33-.04c.96-.12 1.74-1.02 1.74-1.98Z" />
      <path d="M12 5.49v15M7.75 8.49H5.5M8.5 11.49h-3" />
    </svg>
  );
}
