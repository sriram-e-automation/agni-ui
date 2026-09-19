import { resolveDataState } from "../feedback/DataState.tsx";
import React, { useState, useRef, useEffect } from "react";

/* ── Types (mirrored in ChartKit.d.ts) ── */
export interface ChartTooltipRow { label: string; value: React.ReactNode; color: string; }
export interface ChartLegendItem { label: string; color: string; key?: string | number; }

/**
 * AgniUI · ChartKit — shared chart engine (scales, ticks, formatting, a themed
 * floating Tooltip and an interactive Legend). All output themes through the
 * --chart-* CSS variables for light + dark. Mirrors the Theme object pattern.
 */
export interface ChartKitType {
  /** var(--chart-1 … --chart-8), in order. */
  PALETTE: string[];
  /** datum.color ?? PALETTE[i]. */
  color(d: { color?: string } | null | undefined, i: number): string;
  /** Track a container's width in px via ResizeObserver. */
  useSize(ref: React.RefObject<HTMLElement>, fallback?: number): number;
  niceNum(range: number, round: boolean): number;
  /** Round a data max up to a clean axis bound. */
  niceMax(value: number, count?: number): number;
  /** count+1 evenly-spaced tick values from 0…max. */
  ticks(max: number, count?: number): number[];
  /** Compact number format (1.2k, 3.4M). */
  fmt(n: number): string;
  /** Band scale for categorical axes. */
  band(n: number, x0: number, x1: number, pad?: number): {
    step: number; bandwidth: number; start(i: number): number; center(i: number): number;
  };
  /** Floating, theme-aware tooltip card. */
  Tooltip: (props: { visible: boolean; x: number; y: number; w?: number; title?: React.ReactNode; rows: ChartTooltipRow[] }) => JSX.Element | null;
  /** Clickable series legend (toggles visibility). */
  Legend: (props: { items: ChartLegendItem[]; hidden?: Set<string | number>; onToggle?: (key: string | number) => void; align?: "start" | "center" | "end" }) => JSX.Element | null;
  /** One-shot <style> of the shared chart entrance keyframes (reduced-motion aware). */
  Anim: () => JSX.Element;
  /** Blend two #rrggbb colours; t in [0,1]. Returns `b` if either isn't literal hex. */
  lerpColor(a: string, b: string, t: number): string;
}


/**
 * AgniUI · ChartKit
 * Shared engine for the chart family — the same primitives MUI X Charts builds
 * on (scales, ticks, a floating tooltip, an interactive legend), but rendered
 * as themed SVG/HTML driven entirely by the --chart-* CSS variables, so every
 * chart themes for light + dark with zero JS theming.
 *
 * Exposed (mirrors the Theme object pattern):
 *   ChartKit.PALETTE          var(--chart-1..8) in order
 *   ChartKit.color(d, i)      d.color ?? palette[i]
 *   ChartKit.useSize(ref)     tracks container width (ResizeObserver) → px
 *   ChartKit.niceMax(v)       round a max up to a clean axis bound
 *   ChartKit.ticks(max, n)    n+1 evenly-spaced tick values
 *   ChartKit.fmt(n)           compact number (1.2k, 3.4M)
 *   ChartKit.band(n,x0,x1,p)  band scale (start/center/bandwidth)
 *   ChartKit.Tooltip          floating, theme-aware tooltip card
 *   ChartKit.Legend           clickable series legend (toggle visibility)
 *   ChartKit.Anim             one-shot <style> of chart entrance keyframes
 *   ChartKit.lerpColor(a,b,t) blend two hex colours (heatmap intensity ramp)
 *
 * MOTION — every chart shares one entrance + interaction vocabulary, driven by
 * the --dur-* / --ease-* motion tokens:
 *   • entrance  bars rise from baseline · arcs sweep · lines draw · slices &
 *               cells pop in, lightly staggered so the eye reads the build
 *   • interaction  hovering one datum lifts it and fades its siblings
 *               (highlight-scope), matching the MUI X Charts default feel
 * All entrance animations are gated behind prefers-reduced-motion: reduce →
 * the element simply renders in its final state (the keyframe `from` is the
 * only hidden state, so killing the animation leaves it visible).
 */
const PALETTE = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)",
];
const color = (d, i) => (d && d.color) || PALETTE[i % PALETTE.length];

function useSize(ref, fallback = 480) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width) || fallback);
    return () => ro.disconnect();
  }, []);
  return w;
}

function niceNum(range, round) {
  const exp = Math.floor(Math.log10(range || 1));
  const frac = (range || 1) / Math.pow(10, exp);
  let nf;
  if (round) nf = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  else nf = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nf * Math.pow(10, exp);
}
function niceMax(v, count = 4) {
  if (!isFinite(v) || v <= 0) return 1;
  const step = niceNum(niceNum(v, false) / count, true);
  return Math.ceil(v / step) * step;
}
function ticks(max, count = 4) {
  return Array.from({ length: count + 1 }, (_, i) => Math.round(((max / count) * i) * 100) / 100);
}
function fmt(n) {
  if (n == null || isNaN(n)) return "";
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(n * 100) / 100);
}
function band(n, x0, x1, pad = 0.3) {
  const step = n ? (x1 - x0) / n : (x1 - x0);
  const bw = step * (1 - pad);
  return { step, bandwidth: bw, start: (i) => x0 + step * i + (step - bw) / 2, center: (i) => x0 + step * i + step / 2 };
}

/* Floating tooltip — anchors near the pointer, clamps inside the chart box. */
function Tooltip({ visible, x, y, w, title, rows }) {
  if (!visible) return null;
  const TW = 168;
  const left = Math.max(6, Math.min((w || 0) - TW - 6, x + 14));
  const top = Math.max(6, y - 12);
  return (
    <div style={{
      position: "absolute", left, top, width: TW, pointerEvents: "none", zIndex: 5,
      background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-bdr)",
      borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", padding: "var(--space-2) var(--space-2)",
      fontFamily: "var(--font-sans)", transition: "left .06s linear, top .06s linear",
    }}>
      {title != null && <div style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", marginBottom: "var(--space-1)" }}>{title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: r.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: "var(--text-xs)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" , minWidth: 0}}>{r.label}</span>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", fontFamily: "var(--font-data)" }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Interactive legend — click an item to toggle that series. */
function Legend({ items, hidden, onToggle, align = "center" }) {
  if (!items || items.length <= 0) return null;
  const just = align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1) var(--space-4)", justifyContent: just, padding: "var(--space-2) var(--space-1) 0", fontFamily: "var(--font-sans)" }}>
      {items.map((it, i) => {
        const off = hidden && hidden.has(it.key != null ? it.key : i);
        return (
          <button key={i} type="button" onClick={() => onToggle && onToggle(it.key != null ? it.key : i)} disabled={!onToggle}
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", border: "none", background: "transparent", padding: "2px 0", cursor: onToggle ? "pointer" : "default", opacity: off ? 0.42 : 1, transition: "opacity var(--dur-fast)" }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: it.color, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--fw-medium)", color: "var(--chart-legend-fg)", textDecoration: off ? "line-through" : "none" }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* One-shot keyframe sheet shared by the whole chart family. Rendering it more
   than once is harmless (identical @keyframes + a static media rule). Elements
   opt in with style={{animation:…}} + a data-agni-anim marker so the
   reduced-motion rule can switch them all off in one place. */
function Anim() {
  return <style>{`
@keyframes agniRiseY{from{transform:scaleY(0)}}
@keyframes agniRiseX{from{transform:scaleX(0)}}
@keyframes agniChartFade{from{opacity:0}}
@keyframes agniChartPop{from{opacity:0;transform:scale(.4)}}
@keyframes agniChartDraw{from{stroke-dashoffset:1}}
@media (prefers-reduced-motion: reduce){[data-agni-anim]{animation:none!important}}
`}</style>;
}

/* Blend two #rrggbb colours; t in [0,1]. Used by the heatmap intensity ramp.
   Falls back to `b` if either side isn't a literal hex (e.g. a CSS var). */
function lerpColor(a, b, t) {
  const hex = (c) => { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c || ""); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null; };
  const ca = hex(a), cb = hex(b);
  if (!ca || !cb) return b;
  const k = Math.max(0, Math.min(1, t));
  const ch = (i) => Math.round(ca[i] + (cb[i] - ca[i]) * k);
  return `rgb(${ch(0)}, ${ch(1)}, ${ch(2)})`;
}

/* True when a chart has been handed nothing to draw. Covers every chart's data
   shape: series[].data, a flat data[], radar series, Heatmap cells, Gauge value. */
export function isEmptyChart(p) {
  if (!p) return true;
  const hasSeries = Array.isArray(p.series) && p.series.some(s => Array.isArray(s && s.data) ? s.data.length > 0 : (s && s.value != null));
  const hasData = Array.isArray(p.data) && p.data.length > 0;
  const hasCells = Array.isArray(p.cells) && p.cells.length > 0;
  const hasRows = Array.isArray(p.rows) && p.rows.length > 0;
  const hasValue = p.value != null && !Number.isNaN(Number(p.value));
  return !(hasSeries || hasData || hasCells || hasRows || hasValue);
}

/* One state treatment for all ten charts — done here, not ten times. */
export function chartState(p, opts) {
  const h = (opts && opts.height) || p.height || 260;
  return resolveDataState({
    loading: p.loading, error: p.error, onRetry: p.onRetry,
    isEmpty: isEmptyChart(p), empty: p.empty,
    shape: "chart", height: h,
    emptyIcon: (opts && opts.icon) || "ph-chart-bar",
    emptyTitle: "No data for this period",
  });
}

export const ChartKit = { PALETTE, color, useSize, niceNum, niceMax, ticks, fmt, band, Tooltip, Legend, Anim, lerpColor, isEmptyChart, chartState };
