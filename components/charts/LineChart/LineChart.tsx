import React, { useState, useRef } from "react";
import { mergeRefs } from "../../utils/interaction.tsx";
import { ChartKit } from "../../utils/ChartKit.tsx";

/* ── Types (mirrored in LineChart.d.ts) ── */
export interface LineSeries {
  data: number[];
  label?: string;
  color?: string;
  /** Fill the area under this line. */
  area?: boolean;
  /** Show dots at each point. Default true. */
  showMark?: boolean;
}
export interface LineAxis {
  data: Array<string | number>;
  scaleType?: "point";
}
export interface LineDatum { label: string; value: number; }

export interface LineChartProps {
  series?: LineSeries[];
  xAxis?: LineAxis[];
  /** Back-compat shortcut for a single series. */
  data?: LineDatum[];
  /** Back-compat: fill the area (single-series mode). */
  area?: boolean;
  /** Force one colour for every series. */
  color?: string;
  height?: number;
  showGrid?: boolean;
  hideLegend?: boolean;
  hideTooltip?: boolean;
  style?: React.CSSProperties;
}
/** Line / area trend chart — multi-series, hover crosshair + interactive legend. */


/**
 * AgniUI · LineChart  (MUI X Charts–compatible API)
 * <LineChart
 *   xAxis={[{ data: ["Jan",…], scaleType: "point" }]}
 *   series={[{ data:[…], label, color?, area?, showMark? }]} />
 *
 * • Multiple line/area series with a shared category axis.
 * • Hover snaps a crosshair to the nearest category and shows every visible
 *   series in the tooltip; the legend toggles series.
 * • Back-compat: pass `data={[{label,value}]}` (+ `color`, `area`).
 * Themes via --chart-* for light + dark.
 */
const { useSize, color, niceMax, ticks, fmt, Tooltip, Legend } = ChartKit;

function norm(series, xAxis, data, area) {
  if (series && series.length) {
    const cats = (xAxis && xAxis[0] && xAxis[0].data) || series[0].data.map((_, i) => String(i + 1));
    return { cats, series: series.map((s, i) => ({ label: s.label || "Series " + (i + 1), color: s.color, area: s.area, showMark: s.showMark !== false, data: s.data || [] })) };
  }
  const d = data || [];
  return { cats: d.map((x) => x.label), series: [{ label: "Value", area, showMark: true, data: d.map((x) => x.value) }] };
}

function LineChartBody({ forwardedRef,
  series, xAxis, data, area, color: singleColor,
  height, showGrid = true, hideLegend = false, hideTooltip = false, style = {},
}: LineChartProps & { forwardedRef?: React.Ref<HTMLElement> }) {
  const ref = useRef(null);
  const gid = useRef("agniLineFill_" + Math.random().toString(36).slice(2, 8)).current;
  const W = useSize(ref, 640);
  const [hidden, setHidden] = useState(() => new Set());
  const [hover, setHover] = useState(null);

  const model = norm(series, xAxis, data, area);
  const cats = model.cats;
  const single = model.series.length === 1;
  const toggle = (k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });

  let maxV = 0;
  model.series.forEach((s, si) => { if (!hidden.has(si)) s.data.forEach((v) => { maxV = Math.max(maxV, v || 0); }); });
  const max = niceMax(maxV);

  const tickN = 4;
  const H = height || Math.round(W * 0.34);
  const pad = { t: 18, r: 18, b: 34, l: 44 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const n = Math.max(1, cats.length - 1);
  const X = (i) => pad.l + (iw * i) / n;
  const Y = (v) => pad.t + ih - (ih * (v || 0)) / max;
  const colorOf = (s, si) => singleColor || color(s, si);

  const rows = (ci) => model.series.map((s, si) => ({ s, si })).filter(({ si }) => !hidden.has(si))
    .map(({ s, si }) => ({ label: s.label, color: colorOf(s, si), value: fmt(s.data[ci]) }));

  return (
    <div ref={mergeRefs(forwardedRef, ref)} style={{ width: "100%", minWidth: 0, position: "relative", fontFamily: "var(--font-sans)", ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          {model.series.map((s, si) => (
            <linearGradient key={si} id={gid + si} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: colorOf(s, si), stopOpacity: 0.24 }} />
              <stop offset="100%" style={{ stopColor: colorOf(s, si), stopOpacity: 0 }} />
            </linearGradient>
          ))}
        </defs>

        {showGrid && ticks(max, tickN).map((v, i) => {
          const y = Y(v);
          return (
            <g key={i}>
              <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} style={{ stroke: "var(--chart-grid)" }} strokeWidth="1" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-data)" style={{ fill: "var(--chart-axis)" }}>{fmt(v)}</text>
            </g>
          );
        })}

        {/* areas + lines */}
        {model.series.map((s, si) => {
          if (hidden.has(si)) return null;
          const pts = s.data.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
          const areaPts = `${X(0)},${pad.t + ih} ${pts} ${X(s.data.length - 1)},${pad.t + ih}`;
          return (
            <g key={si}>
              {s.area && s.data.length > 1 && <polygon points={areaPts} fill={`url(#${gid + si})`} />}
              {s.data.length > 1 && <polyline points={pts} fill="none" style={{ stroke: colorOf(s, si) }} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
            </g>
          );
        })}

        {/* hover crosshair + marks */}
        {hover != null && (
          <line x1={X(hover.i)} y1={pad.t} x2={X(hover.i)} y2={pad.t + ih} style={{ stroke: "var(--chart-axis)" }} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        )}
        {model.series.map((s, si) => {
          if (hidden.has(si)) return null;
          return s.data.map((v, i) => {
            const active = hover != null && hover.i === i;
            if (!s.showMark && !active) return null;
            return <circle key={si + "-" + i} cx={X(i)} cy={Y(v)} r={active ? 5 : 3.5} style={{ fill: "var(--chart-mark-stroke)", stroke: colorOf(s, si) }} strokeWidth={active ? 3 : 2} />;
          });
        })}

        {/* x labels */}
        {cats.map((c, i) => (
          <text key={i} x={X(i)} y={H - pad.b + 20} textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" style={{ fill: "var(--chart-axis)" }}>{c}</text>
        ))}

        {/* hit areas */}
        {!hideTooltip && cats.map((c, i) => {
          const x0 = i === 0 ? pad.l : (X(i - 1) + X(i)) / 2;
          const x1 = i === cats.length - 1 ? W - pad.r : (X(i) + X(i + 1)) / 2;
          return <rect key={i} x={x0} y={pad.t} width={Math.max(0, x1 - x0)} height={ih} fill="transparent"
            onMouseMove={(e) => setHover({ i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
            onMouseLeave={() => setHover(null)} />;
        })}
      </svg>

      {!hideTooltip && hover != null && <Tooltip visible x={hover.x} y={hover.y} w={W} title={cats[hover.i]} rows={rows(hover.i)} />}
      {!hideLegend && !single && <Legend items={model.series.map((s, i) => ({ label: s.label, color: colorOf(s, i), key: i }))} hidden={hidden} onToggle={toggle} />}
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export const LineChart = React.forwardRef<HTMLElement, any>(function LineChart(props, ref) {
  const state = ChartKit.chartState(props, { icon: "ph-chart-line" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <LineChartBody {...props} forwardedRef={ref} />;
});
