import React, { useState, useRef } from "react";
import { ChartKit } from "./ChartKit.tsx";

/* ── Types (mirrored in Heatmap.d.ts) ── */
export interface HeatmapAxis {
  /** Category labels along this axis, in order. */
  data: Array<string | number>;
}
export interface HeatmapSeries {
  /** Cells as [xIndex, yIndex, value]. */
  data: Array<[number, number, number]>;
}
export interface HeatmapProps {
  series?: HeatmapSeries[];
  /** Column axis; xAxis[0].data supplies the labels. */
  xAxis?: HeatmapAxis[];
  /** Row axis; yAxis[0].data supplies the labels. */
  yAxis?: HeatmapAxis[];
  /** Pin the ramp's low end (else min of the data, floored at 0). */
  min?: number;
  /** Pin the ramp's high end (else max of the data). */
  max?: number;
  /** Intensity ramp stops, low→high (literal hex). */
  colors?: string[];
  height?: number;
  /** Print the value inside each cell when it fits. */
  showValues?: boolean;
  hideTooltip?: boolean;
  style?: React.CSSProperties;
}
/** Grid heatmap — value→colour intensity ramp, scale bar, hover lift + tooltip. */


/**
 * AgniUI · Heatmap  (MUI X Charts–compatible API)
 * <Heatmap
 *   xAxis={[{ data: ["M","T","W","T","F","S","S"] }]}
 *   yAxis={[{ data: ["6am","10am","12pm","5pm","8pm"] }]}
 *   series={[{ data: [[xIndex, yIndex, value], …] }]} />
 *
 * A grid of cells coloured by value across a low→high intensity ramp. Hover a
 * cell to lift it and read x · y · value; a gradient scale bar shows the range.
 * `min`/`max` pin the ramp ends (else auto from the data). `colors` overrides
 * the ramp stops (literal hex; cells are colour-lerped so CSS vars cannot be
 * used directly). Defaults mirror the chart palette and flip for dark mode.
 */
const { useSize, fmt, Tooltip, Anim, lerpColor } = ChartKit;

/* Multi-stop ramp: blend across an array of hex stops by t in [0,1]. */
function ramp(stops, t) {
  const k = Math.max(0, Math.min(1, t));
  if (stops.length === 1) return stops[0];
  const seg = k * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(seg));
  return lerpColor(stops[i], stops[i + 1], seg - i);
}

/* Default ramps follow the chart palette (chart-2 blue -> chart-3 amber),
   with a lifted dark variant. Literal hexes are required because cells are
   colour-LERPed; hues mirror tokens/charts.css. */
const RAMP_LIGHT = ["#E8F1FE", "#1570EF", "#DC6803"];
const RAMP_DARK  = ["#1B2C5F", "#6BB0FF", "#F5A65B"];

function HeatmapBody({
  series = [], xAxis, yAxis, min: minProp, max: maxProp,
  colors: colorsProp,
  height, showValues = false, hideTooltip = false, style = {},
}: HeatmapProps) {
  const ref = useRef(null);
  const dark = !!(ref.current && ref.current.closest && ref.current.closest('[data-theme="dark"]'));
  const colors = colorsProp || (dark ? RAMP_DARK : RAMP_LIGHT);
  const gid = useRef("agniHeat_" + Math.random().toString(36).slice(2, 8)).current;
  const W = useSize(ref, 440);
  const [hover, setHover] = useState(null);

  const xLabels = (xAxis && xAxis[0] && xAxis[0].data) || [];
  const yLabels = (yAxis && yAxis[0] && yAxis[0].data) || [];
  const cells = (series && series[0] && series[0].data) || [];
  const nx = xLabels.length || (cells.reduce((m, c) => Math.max(m, c[0] + 1), 0));
  const ny = yLabels.length || (cells.reduce((m, c) => Math.max(m, c[1] + 1), 0));

  const vals = cells.map((c) => c[2]);
  const vMin = minProp != null ? minProp : Math.min(0, ...vals);
  const vMax = maxProp != null ? maxProp : Math.max(1, ...vals);
  const norm = (v) => (v - vMin) / (vMax - vMin || 1);

  const padL = 46, padT = 40, padB = 26, gap = 4;
  const rowH = 32;
  const H = height || (padT + ny * rowH + padB);
  const gw = W - padL, gh = H - padT - padB;
  const cw = nx ? gw / nx : gw, ch = ny ? gh / ny : gh;

  const lo = colors[0], hi = colors[colors.length - 1];

  return (
    <div ref={ref} style={{ width: "100%", minWidth: 0, position: "relative", fontFamily: "var(--font-sans)", ...style }}>
      <Anim />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} onMouseLeave={() => setHover(null)}>
        {/* scale bar */}
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            {colors.map((c, i) => <stop key={i} offset={(i / (colors.length - 1)) * 100 + "%"} stopColor={c} />)}
          </linearGradient>
        </defs>
        <text x={padL} y={16} fontSize="11" fontFamily="var(--font-data)" style={{ fill: "var(--chart-axis)" }}>{fmt(vMin)}</text>
        <rect x={padL + 24} y={8} width={Math.min(160, gw - 80)} height={9} rx="4.5" fill={`url(#${gid})`} />
        <text x={padL + 24 + Math.min(160, gw - 80) + 6} y={16} fontSize="11" fontFamily="var(--font-data)" style={{ fill: "var(--chart-axis)" }}>{fmt(vMax)}</text>

        {/* cells */}
        {cells.map((c, idx) => {
          const [xi, yi, v] = c;
          const x = padL + xi * cw, y = padT + yi * ch;
          const on = hover && hover.xi === xi && hover.yi === yi;
          const fill = ramp(colors, norm(v));
          return (
            <g key={idx}>
              <rect x={x + gap / 2} y={y + gap / 2} width={Math.max(0, cw - gap)} height={Math.max(0, ch - gap)} rx="4"
                data-agni-anim
                style={{
                  fill, stroke: on ? "var(--text-primary)" : "transparent", strokeWidth: on ? 1.5 : 0, cursor: "default",
                  transformBox: "fill-box", transformOrigin: "center",
                  transform: on ? "scale(1.06)" : "scale(1)",
                  animation: "agniChartPop var(--dur-normal) var(--ease-spring) backwards",
                  animationDelay: ((xi + yi) * 28) + "ms",
                  transition: "transform var(--dur-fast) var(--ease-spring), stroke-width var(--dur-fast)",
                }}
                onMouseMove={(e) => !hideTooltip && setHover({ xi, yi, v, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />
              {showValues && cw - gap > 22 && (
                <text x={x + cw / 2} y={y + ch / 2 + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-data)" pointerEvents="none"
                  style={{ fill: norm(v) > 0.55 ? "#fff" : "var(--text-secondary)" }}>{fmt(v)}</text>
              )}
            </g>
          );
        })}

        {/* axis labels */}
        {xLabels.map((l, i) => <text key={i} x={padL + i * cw + cw / 2} y={H - padB + 18} textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" style={{ fill: "var(--chart-axis)" }}>{l}</text>)}
        {yLabels.map((l, i) => <text key={i} x={padL - 10} y={padT + i * ch + ch / 2 + 4} textAnchor="end" fontSize="12" fontFamily="var(--font-sans)" style={{ fill: "var(--chart-axis)" }}>{l}</text>)}
      </svg>

      {!hideTooltip && hover && hover.x != null && (
        <Tooltip visible x={hover.x} y={hover.y} w={W}
          title={`${yLabels[hover.yi] != null ? yLabels[hover.yi] : hover.yi} · ${xLabels[hover.xi] != null ? xLabels[hover.xi] : hover.xi}`}
          rows={[{ label: "Value", color: ramp(colors, norm(hover.v)), value: fmt(hover.v) }]} />
      )}
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export function Heatmap(props) {
  const state = ChartKit.chartState(props, { icon: "ph-grid-four" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <HeatmapBody {...props} />;
}
