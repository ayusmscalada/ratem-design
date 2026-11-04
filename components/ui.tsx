"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KIT, LOGOS } from "@/lib/data";

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
export function Photo({ className, src, priority }: { className: string; src: string; priority?: boolean }) {
  const { ref, broken, onError } = useBroken();
  if (broken) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} className={className} src={src} alt="" onError={onError} fetchPriority={priority ? "high" : undefined} loading={priority ? undefined : "lazy"} />;
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

export function RatingPill({ kind, value }: { kind: "you" | "fan"; value: number }) {
  return (
    <span className={`rating-pill ${kind}`} aria-label={`${kind === "you" ? "Your rating" : "Fan rating"} ${value.toFixed(1)}`}>
      <small aria-hidden>{kind === "you" ? "You" : "Fans"}</small>
      <b aria-hidden>{value.toFixed(1)}</b>
    </span>
  );
}

export function Jersey({ initial, no, manager, small }: { initial: string; no?: number; manager?: boolean; small?: boolean }) {
  return (
    <span className={`jersey${small ? " small" : ""}`}>
      <span className="jersey-a">{initial}</span>
      <span className="jersey-b">{manager ? <Img src="tie.svg" w={8.5} h={20.7} /> : no}</span>
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

/** Club kit jersey. Colours come from KIT so the shirts always match the user's club. */
export function Kit({ no, size = 56, keeper, label }: { no?: number | string; size?: number; keeper?: boolean; label?: string }) {
  const id = useId().replace(/:/g, "");
  const base = keeper ? "#3ddc84" : KIT.base;
  return (
    <svg className="kit" width={size} height={size * 0.94} viewBox="0 0 64 60" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <clipPath id={`k${id}`}>
          <path d="M20 3 26 1Q32 8 38 1L44 3 62 14 55 28 48 24 48 59 16 59 16 24 9 28 2 14Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#k${id})`}>
        <rect width="64" height="60" fill={base} />
        {!keeper && [22, 32, 42].map((x) => <rect key={x} x={x - 2.5} y="0" width="5" height="60" fill={KIT.stripe} />)}
      </g>
      <path d="M20 3 26 1Q32 8 38 1L44 3 62 14 55 28 48 24 48 59 16 59 16 24 9 28 2 14Z" fill="none" stroke={keeper ? "#0b3d22" : KIT.trim} strokeOpacity=".55" strokeWidth="1.2" />
      {no !== undefined && size >= 36 && (
        <text x="32" y="45" textAnchor="middle" className="kit-no" fill={keeper ? "#0b3d22" : "#fff"} stroke={keeper ? "none" : "#111"} strokeWidth="3" paintOrder="stroke">{no}</text>
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
export function Moment({ id, question, title, context, accent = "blue", filter, children, note, action, isNew }: {
  id?: string; question: string; title: string; context?: ReactNode; accent?: "blue" | "green" | "gold" | "coral" | "violet";
  filter?: ReactNode; children: ReactNode; note?: ReactNode; action?: ReactNode; isNew?: boolean;
}) {
  return (
    <section id={id} className={`moment accent-${accent}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="moment-top">
        <div>
          <p className="moment-q">{isNew && <span className="new-dot">New</span>}{question}</p>
          <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
          {context && <p className="moment-context">{context}</p>}
        </div>
        {filter}
      </div>
      {children}
      {action && <div className="moment-action">{action}</div>}
      {note && <p className="moment-note"><Img src="info.svg" size={12} />{note}</p>}
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
