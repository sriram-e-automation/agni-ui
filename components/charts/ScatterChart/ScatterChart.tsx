import React, { useState, useRef } from "react";
import { ChartKit } from "./ChartKit.tsx";

/* ── Types (mirrored in ScatterChart.d.ts) ── */
export interface ScatterPoint { x: number; y: number; id?: string | number; }
export interface ScatterSeries { data: ScatterPoint[]; label?: string; color?: string; }
export interface ScatterAxis { min?: number; max?: number; }
export interface ScatterChartProps {
  series?: ScatterSeries[];
  xAxis?: ScatterAxis[];
  yAxis?: ScatterAxis[];
  height?: number;
  showGrid?: boolean;
  hideLegend?: boolean;
  hideTooltip?: boolean;
  markerSize?: number;
  style?: React.CSSProperties;
}
/** Scatter / point chart — multiple x/y series, hover highlight + legend. */


/**
 * AgniUI · ScatterChart  (MUI X Charts–compatible API)
 * <ScatterChart series={[{ data:[{x,y,id}], label, color? }]}
 *               xAxis={[{min,max}]} yAxis={[{min,max}]} />
 * Multiple point series; hover highlights the nearest point. Themes via --chart-*.
 */
const { useSize, color, niceMax, ticks, fmt, Tooltip, Legend } = ChartKit;

function ScatterChartBody({
  series = [], xAxis, yAxis, height, showGrid = true,
  hideLegend = false, hideTooltip = false, markerSize = 5, style = {},
}: ScatterChartProps) {
  const ref = useRef(null);
  const W = useSize(ref, 480);
  const [hidden, setHidden] = useState(() => new Set());
  const [hover, setHover] = useState(null);
  const toggle = (k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const ser = series.map((s, i) => ({ label: s.label || "Series " + (i + 1), color: s.color, data: s.data || [] }));
  const visPts = ser.flatMap((s, si) => hidden.has(si) ? [] : s.data);
  const xs = visPts.map((p) => p.x), ys = visPts.map((p) => p.y);
  const xMin = (xAxis && xAxis[0] && xAxis[0].min != null) ? xAxis[0].min : Math.min(0, ...xs);
  const xMax = (xAxis && xAxis[0] && xAxis[0].max != null) ? xAxis[0].max : niceMax(Math.max(1, ...xs));
  const yMin = (yAxis && yAxis[0] && yAxis[0].min != null) ? yAxis[0].min : Math.min(0, ...ys);
  const yMax = (yAxis && yAxis[0] && yAxis[0].max != null) ? yAxis[0].max : niceMax(Math.max(1, ...ys));

  const H = height || Math.round(W * 0.6);
  const pad = { t: 14, r: 16, b: 32, l: 46 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, tickN = 4;
  const PX = (v) => pad.l + iw * ((v - xMin) / (xMax - xMin || 1));
  const PY = (v) => pad.t + ih - ih * ((v - yMin) / (yMax - yMin || 1));

  return (
    <div ref={ref} style={{ width: "100%", minWidth: 0, position: "relative", fontFamily: "var(--font-sans)", ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {showGrid && ticks(yMax - yMin, tickN).map((t, i) => { const v = yMin + t; const y = PY(v); return (
          <g key={"y" + i}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} style={{ stroke: "var(--chart-grid)" }} strokeWidth="1" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-data)" style={{ fill: "var(--chart-axis)" }}>{fmt(v)}</text>
          </g>); })}
        {showGrid && ticks(xMax - xMin, tickN).map((t, i) => { const v = xMin + t; const x = PX(v); return (
          <text key={"x" + i} x={x} y={H - pad.b + 18} textAnchor="middle" fontSize="11" fontFamily="var(--font-data)" style={{ fill: "var(--chart-axis)" }}>{fmt(v)}</text>); })}

        {ser.map((s, si) => hidden.has(si) ? null : s.data.map((p, pi) => {
          const active = hover && hover.si === si && hover.pi === pi;
          return <circle key={si + "-" + pi} cx={PX(p.x)} cy={PY(p.y)} r={active ? markerSize + 2.5 : markerSize}
            style={{ fill: color(s, si), fillOpacity: active ? 1 : 0.78, stroke: "var(--chart-mark-stroke)", strokeWidth: 1, cursor: "pointer" }}
            onMouseMove={(e) => setHover({ si, pi, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
            onMouseLeave={() => setHover(null)} />;
        }))}
      </svg>

      {!hideTooltip && hover && (() => { const p = ser[hover.si].data[hover.pi]; return <Tooltip visible x={hover.x} y={hover.y} w={W} title={ser[hover.si].label} rows={[{ label: "x, y", color: color(ser[hover.si], hover.si), value: fmt(p.x) + ", " + fmt(p.y) }]} />; })()}
      {!hideLegend && ser.length > 1 && <Legend items={ser.map((s, i) => ({ label: s.label, color: color(s, i), key: i }))} hidden={hidden} onToggle={toggle} />}
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export function ScatterChart(props) {
  const state = ChartKit.chartState(props, { icon: "ph-chart-scatter" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <ScatterChartBody {...props} />;
}
