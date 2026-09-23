import React, { useState, useRef } from "react";
import { mergeRefs } from "../../utils/interaction.tsx";
import { ChartKit } from "../../utils/ChartKit.tsx";

/* ── Types (mirrored in RadarChart.d.ts) ── */
export interface RadarSeries {
  /** One value per metric, in metric order. */
  data: number[];
  label?: string;
  /** Override the series colour (else var(--chart-N) by index). */
  color?: string;
}
export interface RadarConfig {
  /** Axis labels, one per spoke (in order). */
  metrics: string[];
  /** Pin the outer-ring value (else auto-rounded to a clean bound). */
  max?: number;
}
export interface RadarChartProps {
  series?: RadarSeries[];
  /** MUI-style radar config; `radar.metrics` supplies the axes. */
  radar?: RadarConfig;
  /** Shortcut for `radar.metrics`. */
  metrics?: string[];
  /** Pin the outer-ring value. */
  max?: number;
  height?: number;
  /** Number of concentric grid rings. Default 4. */
  levels?: number;
  /** Polygon fill opacity. Default 0.18. */
  fillOpacity?: number;
  hideLegend?: boolean;
  hideTooltip?: boolean;
  style?: React.CSSProperties;
}
/** Polar radar/spider chart — multi-series, hover-to-highlight, toggle legend. */


/**
 * AgniUI · RadarChart  (MUI X Charts–compatible API)
 * <RadarChart
 *   radar={{ metrics: ["Mass","Thrust","ΔV","Reliability","Cost","Reuse"] }}
 *   series={[{ label, data:[…one value per metric…], color? }]} />
 *
 * Plots one closed polygon per series over a shared polar grid. Hover a vertex
 * to highlight that series (siblings fade) and read the metric value; the
 * legend toggles series. `radar.max` (or `max`) pins the outer ring; otherwise
 * it auto-rounds to a clean bound. Themes via --chart-*.
 */
const { useSize, color, niceMax, fmt, Tooltip, Legend, Anim } = ChartKit;

function RadarChartBody({ forwardedRef,
  series = [], radar = {}, metrics: metricsProp, max: maxProp,
  height, levels = 4, hideLegend = false, hideTooltip = false,
  fillOpacity = 0.18, style = {},
}: RadarChartProps & { forwardedRef?: React.Ref<HTMLElement> }) {
  const ref = useRef(null);
  const W = useSize(ref, 360);
  const [hidden, setHidden] = useState(() => new Set());
  const [hover, setHover] = useState(null);

  const metrics = (radar && radar.metrics) || metricsProp || [];
  const N = metrics.length;
  const toggle = (k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });

  let maxV = 0;
  series.forEach((s, si) => { if (!hidden.has(si)) (s.data || []).forEach((v) => { maxV = Math.max(maxV, v || 0); }); });
  const max = maxProp || (radar && radar.max) || niceMax(maxV) || 1;

  const box = height ? Math.min(W, height) : Math.min(W, 320);
  const cx = box / 2, cy = box / 2;
  const R = box / 2 - 34;                 // leave room for axis labels
  const ang = (i) => (-90 + (360 / N) * i) * Math.PI / 180;
  const pt = (i, frac) => [cx + R * frac * Math.cos(ang(i)), cy + R * frac * Math.sin(ang(i))];
  const poly = (frac) => Array.from({ length: N }, (_, i) => pt(i, frac).join(",")).join(" ");

  const colorOf = (s, i) => s.color || color(s, i);

  if (!N) return <div ref={mergeRefs(forwardedRef, ref)} style={{ width: "100%", minWidth: 0, ...style }} />;

  return (
    <div ref={mergeRefs(forwardedRef, ref)} style={{ width: "100%", minWidth: 0, position: "relative", fontFamily: "var(--font-sans)", ...style }}>
      <Anim />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${box} ${box}`} style={{ width: box, height: box, overflow: "visible" }} onMouseLeave={() => setHover(null)}>
          {/* concentric grid rings */}
          {Array.from({ length: levels }, (_, l) => (
            <polygon key={l} points={poly((l + 1) / levels)} fill="none" style={{ stroke: "var(--chart-grid)" }} strokeWidth="1" />
          ))}
          {/* spokes + axis labels */}
          {metrics.map((m, i) => {
            const [ex, ey] = pt(i, 1), [lx, ly] = pt(i, 1.16);
            const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
            return (
              <g key={i}>
                <line x1={cx} y1={cy} x2={ex} y2={ey} style={{ stroke: "var(--chart-grid)" }} strokeWidth="1" />
                <text x={lx} y={ly + 4} textAnchor={anchor} fontSize="11" fontFamily="var(--font-sans)" style={{ fill: "var(--chart-axis)" }}>{m}</text>
              </g>
            );
          })}
          {/* series polygons */}
          {series.map((s, si) => {
            if (hidden.has(si)) return null;
            const c = colorOf(s, si);
            const faded = hover && hover.si !== si;
            const pts = (s.data || []).map((v, i) => pt(i, Math.max(0, Math.min(1, (v || 0) / max))));
            return (
              <g key={si} data-agni-anim style={{
                transformBox: "view-box", transformOrigin: `${cx}px ${cy}px`,
                opacity: faded ? 0.25 : 1,
                animation: "agniChartPop var(--dur-normal) var(--ease-spring) backwards", animationDelay: (si * 70) + "ms",
                transition: "opacity var(--dur-fast) var(--ease-standard)",
              }}>
                <polygon points={pts.map((p) => p.join(",")).join(" ")} style={{ fill: c, fillOpacity, stroke: c, strokeWidth: 2, strokeLinejoin: "round" }} />
                {pts.map((p, i) => {
                  const on = hover && hover.si === si && hover.mi === i;
                  return <circle key={i} cx={p[0]} cy={p[1]} r={on ? 5 : 3.5} style={{ fill: c, stroke: "var(--chart-mark-stroke)", strokeWidth: 1.5, cursor: "default", transition: "r var(--dur-fast)" }}
                    onMouseMove={(e) => !hideTooltip && setHover({ si, mi: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />;
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {!hideTooltip && hover && hover.x != null && (() => {
        const s = series[hover.si];
        return <Tooltip visible x={hover.x} y={hover.y} w={box} title={s.label || "Series " + (hover.si + 1)}
          rows={[{ label: metrics[hover.mi], color: colorOf(s, hover.si), value: fmt(s.data[hover.mi]) }]} />;
      })()}

      {!hideLegend && series.length > 1 && (
        <Legend items={series.map((s, i) => ({ label: s.label || "Series " + (i + 1), color: colorOf(s, i), key: i }))} hidden={hidden} onToggle={toggle} />
      )}
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export const RadarChart = React.forwardRef<HTMLElement, any>(function RadarChart(props, ref) {
  const state = ChartKit.chartState(props, { icon: "ph-polygon" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <RadarChartBody {...props} forwardedRef={ref} />;
});
