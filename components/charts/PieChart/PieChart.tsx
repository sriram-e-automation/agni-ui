import React, { useState, useRef } from "react";
import { ChartKit } from "./ChartKit.tsx";

/* ── Types (mirrored in PieChart.d.ts) ── */
export interface PieDatum {
  value: number;
  label?: string;
  id?: string | number;
  color?: string;
}
export interface PieSeries {
  data: PieDatum[];
  /** 0 = pie; >0 and <1 = fraction of outer radius; >=1 = absolute px → donut. */
  innerRadius?: number;
  outerRadius?: number;
  /** Gap between slices, in degrees. Default 1.5. */
  paddingAngle?: number;
  cornerRadius?: number;
}
export interface PieChartProps {
  series?: PieSeries[];
  /** Back-compat shortcut for a single series. */
  data?: PieDatum[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  /** Caption under the donut centre number. */
  centerLabel?: string;
  /** Override the donut centre number (defaults to the visible total). */
  centerValue?: number | string;
  hideLegend?: boolean;
  hideTooltip?: boolean;
  legendAlign?: "start" | "center";
  height?: number;
  style?: React.CSSProperties;
}
/** Pie / donut proportion chart — hover highlight, interactive legend, centre total. */


/**
 * AgniUI · PieChart  (MUI X Charts–compatible API)
 * <PieChart series={[{
 *   data: [{ id, value, label, color? }],
 *   innerRadius?, outerRadius?, paddingAngle?, cornerRadius?
 * }]} />
 *
 * innerRadius > 0 makes it a donut. Hover highlights a slice and shows its
 * value/percent; the legend toggles slices. Back-compat: pass
 * `data={[{label,value,color?}]}` (+ `innerRadius`). Themes via --chart-*.
 */
const { useSize, color, fmt, Tooltip, Legend, Anim } = ChartKit;

function arc(cx, cy, rO, rI, a0, a1, corner = 0) {
  const pt = (r, deg) => { const a = (deg * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const large = a1 - a0 > 180 ? 1 : 0;
  const [ox0, oy0] = pt(rO, a0), [ox1, oy1] = pt(rO, a1), [ix1, iy1] = pt(rI, a1), [ix0, iy0] = pt(rI, a0);
  if (rI <= 0.5) return `M ${cx} ${cy} L ${ox0} ${oy0} A ${rO} ${rO} 0 ${large} 1 ${ox1} ${oy1} Z`;
  return `M ${ox0} ${oy0} A ${rO} ${rO} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${rI} ${rI} 0 ${large} 0 ${ix0} ${iy0} Z`;
}

function PieChartBody({
  series, data, innerRadius, outerRadius, paddingAngle = 1.5,
  centerLabel, centerValue, hideLegend = false, hideTooltip = false,
  height, legendAlign = "center", style = {},
}: PieChartProps) {
  const ref = useRef(null);
  const W = useSize(ref, 320);
  const [hidden, setHidden] = useState(() => new Set());
  const [hover, setHover] = useState(null);

  const s0 = series && series[0];
  const raw = (s0 && s0.data) || data || [];
  const items = raw.map((d, i) => ({ id: d.id != null ? d.id : i, label: d.label != null ? d.label : "Item " + (i + 1), value: d.value, color: d.color }));
  const iR = (s0 && s0.innerRadius != null ? s0.innerRadius : innerRadius) || 0;
  const pad = (s0 && s0.paddingAngle != null ? s0.paddingAngle : paddingAngle);

  const toggle = (k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const vis = items.filter((it) => !hidden.has(it.id));
  const total = vis.reduce((s, d) => s + (d.value || 0), 0) || 1;

  const showLegend = !hideLegend;
  const box = height || Math.max(150, Math.min(showLegend ? W * 0.5 : W * 0.8, 230));
  const cx = box / 2, cy = box / 2;
  const rO = (outerRadius || box * 0.46);
  const rIabs = iR > 0 && iR < 1 ? rO * iR : (iR >= 1 ? iR : 0);
  const donut = rIabs > 0;

  let a0 = -90;
  const segs = vis.map((it, i) => {
    const sweep = (it.value / total) * (360 - pad * vis.length);
    const seg = { ...it, i, c: it.color || color(it, items.indexOf(it)), a0: a0 + pad / 2, a1: a0 + pad / 2 + sweep, pct: Math.round((it.value / total) * 100) };
    a0 += sweep + pad;
    return seg;
  });
  const centerNum = centerValue != null ? centerValue : (donut ? total : null);

  return (
    <div ref={ref} style={{ width: "100%", minWidth: 0, position: "relative", display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap", fontFamily: "var(--font-sans)", ...style }}>
      <Anim />
      <svg viewBox={`0 0 ${box} ${box}`} style={{ width: box, height: box, flexShrink: 0 }}
        onMouseLeave={() => setHover(null)}>
        {segs.map((sg, idx) => {
          const active = hover && hover.id === sg.id;
          return (
            <path key={sg.id} d={arc(cx, cy, rO, rIabs, sg.a0, sg.a1)} data-agni-anim
              style={{ fill: sg.c, stroke: "var(--chart-mark-stroke)", strokeWidth: donut ? 1.5 : 1, cursor: "default",
                transformBox: "view-box", transformOrigin: `${cx}px ${cy}px`,
                transform: active ? "scale(1.05)" : "scale(1)",
                opacity: hover && !active ? 0.55 : 1,
                animation: "agniChartPop var(--dur-normal) var(--ease-spring) backwards", animationDelay: (idx * 40) + "ms",
                transition: "transform var(--dur-fast) var(--ease-spring), opacity var(--dur-fast) var(--ease-standard)" }}
              onMouseMove={(e) => setHover({ id: sg.id, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />
          );
        })}
        {donut && (
          <g style={{ pointerEvents: "none" }}>
            <text x={cx} y={cy - (centerLabel ? 2 : -box * 0.02)} textAnchor="middle" fontSize={box * 0.18} fontWeight="700" fontFamily="var(--font-data)" style={{ fill: "var(--text-primary)" }}>{centerNum != null ? fmt(centerNum) : ""}</text>
            {centerLabel && <text x={cx} y={cy + box * 0.12} textAnchor="middle" fontSize={box * 0.075} fontFamily="var(--font-sans)" style={{ fill: "var(--text-tertiary)" }}>{centerLabel}</text>}
          </g>
        )}
      </svg>

      {showLegend && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: "1 1 150px", minWidth: 150, justifyContent: legendAlign === "center" ? "center" : "flex-start" }}>
          {items.map((it, i) => {
            const off = hidden.has(it.id);
            const pct = Math.round(((it.value || 0) / (items.filter((x) => !hidden.has(x.id)).reduce((s, d) => s + d.value, 0) || 1)) * 100);
            return (
              <button key={it.id} type="button" onClick={() => toggle(it.id)}
                onMouseEnter={() => !off && setHover({ id: it.id })} onMouseLeave={() => setHover(null)}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", border: "none", background: "transparent", padding: 0, cursor: "pointer", opacity: off ? 0.42 : 1, textAlign: "left" }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: it.color || color(it, i), flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--chart-legend-fg)", textDecoration: off ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" , minWidth: 0}}>{it.label}</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", fontFamily: "var(--font-data)" }}>{fmt(it.value)}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-data)", width: 34, textAlign: "right" }}>{off ? "—" : pct + "%"}</span>
              </button>
            );
          })}
        </div>
      )}

      {!hideTooltip && hover && hover.x != null && (() => { const sg = segs.find((x) => x.id === hover.id); return sg ? <Tooltip visible x={hover.x} y={hover.y} w={box} title={sg.label} rows={[{ label: "Value", color: sg.c, value: fmt(sg.value) + " · " + sg.pct + "%" }]} /> : null; })()}
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export function PieChart(props) {
  const state = ChartKit.chartState(props, { icon: "ph-chart-pie" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <PieChartBody {...props} />;
}
