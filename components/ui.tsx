"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LOGOS } from "@/lib/data";

export function Img({ src, size, w, h, alt = "", style }: { src: string; size?: number; w?: number; h?: number; alt?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src.startsWith("/") ? src : `/figma/${src}`} alt={alt} width={size ?? w} height={size ?? h} style={style} />;
}

export function TeamLogo({ name }: { name: string }) {
  const src = LOGOS[name];
  if (src) return <Img src={src} size={16} />;
  return <span className="team-badge">{name[0]}</span>;
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
    <span className={`rating-pill ${kind}`}>
      <Img src={kind === "you" ? "star-you.svg" : "star-fan.svg"} w={9.6} h={9} />
      {value.toFixed(1)}
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
