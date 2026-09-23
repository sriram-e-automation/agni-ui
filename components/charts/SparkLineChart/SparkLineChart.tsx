import React, { useState, useRef } from "react";
import { mergeRefs } from "../../utils/interaction.tsx";
import { ChartKit } from "../../utils/ChartKit.tsx";

/* ── Types (mirrored in SparkLineChart.d.ts) ── */
export interface SparkLineChartProps {
  data?: number[];
  /** "line" (default) or "bar". */
  plot?: "line" | "bar";
  /** Fill the area under the line. */
  area?: boolean;
  color?: string;
  /** Height in px. Default 44. */
  height?: number;
  /** Enable the hover tooltip. Default false. */
  showTooltip?: boolean;
  /** Optional category labels for the tooltip title. */
  xLabels?: string[];
  style?: React.CSSProperties;
}
/** Compact, axis-less trend (line or bar) for inline KPI / table use. */


/**
 * AgniUI · SparkLineChart  (MUI X Charts–compatible API)
 * <SparkLineChart data={[…]} plot="line" | "bar" area? color? />
 * A compact, axis-less trend for inline use (table cells, KPI tiles). Optional
 * hover tooltip. Themes via --chart-*.
 */
const { useSize, color, fmt, Tooltip, Anim } = ChartKit;

function SparkLineChartBody({ forwardedRef,
  data = [], plot = "line", area = false, color: c, height = 44,
  showTooltip = false, xLabels, style = {},
}: SparkLineChartProps & { forwardedRef?: React.Ref<HTMLElement> }) {
  const ref = useRef(null);
  const gid = useRef("agniSpark_" + Math.random().toString(36).slice(2, 8)).current;
  const W = useSize(ref, 120);
  const [hover, setHover] = useState(null);
  const stroke = c || "var(--chart-1)";

  const max = Math.max(1, ...data), min = Math.min(0, ...data);
  const H = height, padY = 4;
  const n = Math.max(1, data.length - 1);
  const X = (i) => (W * i) / n;
  const Y = (v) => H - padY - (H - padY * 2) * ((v - min) / (max - min || 1));

  return (
    <div ref={mergeRefs(forwardedRef, ref)} style={{ width: "100%", minWidth: 40, position: "relative", fontFamily: "var(--font-sans)", ...style }}>
      <Anim />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }} onMouseLeave={() => setHover(null)}>
        {plot === "bar" ? (
          data.map((v, i) => { const bw = (W / data.length) * 0.66; const x = (W / data.length) * i + (W / data.length - bw) / 2; const y = Y(v); const active = hover && hover.i === i;
            return <rect key={i} x={x} y={y} width={bw} height={Math.max(0, H - padY - y)} rx="1.5" data-agni-anim style={{ fill: stroke, fillOpacity: active ? 1 : 0.85, transformBox: "fill-box", transformOrigin: "center bottom", animation: "agniRiseY var(--dur-normal) var(--ease-decelerate) both", animationDelay: (i * 30) + "ms" }}
              onMouseMove={(e) => showTooltip && setHover({ i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />; })
        ) : (
          <>
            <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style={{ stopColor: stroke, stopOpacity: 0.25 }} /><stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0 }} /></linearGradient></defs>
            {area && data.length > 1 && <polygon points={`0,${H} ${data.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} ${W},${H}`} fill={`url(#${gid})`} data-agni-anim style={{ animation: "agniChartFade var(--dur-slow) var(--ease-standard) both", animationDelay: "120ms" }} />}
            {data.length > 1 && <polyline points={data.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" pathLength="1" data-agni-anim style={{ stroke, strokeDasharray: 1, animation: "agniChartDraw var(--dur-slow) var(--ease-decelerate) both" }} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
            {hover && <circle cx={X(hover.i)} cy={Y(data[hover.i])} r="3.5" style={{ fill: "var(--chart-mark-stroke)", stroke }} strokeWidth="2" />}
            {showTooltip && data.map((v, i) => { const x0 = i === 0 ? 0 : (X(i - 1) + X(i)) / 2; const x1 = i === data.length - 1 ? W : (X(i) + X(i + 1)) / 2;
              return <rect key={i} x={x0} y={0} width={Math.max(0, x1 - x0)} height={H} fill="transparent" onMouseMove={(e) => setHover({ i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />; })}
          </>
        )}
      </svg>
      {showTooltip && hover && <Tooltip visible x={hover.x} y={hover.y} w={W} title={xLabels ? xLabels[hover.i] : null} rows={[{ label: "Value", color: stroke, value: fmt(data[hover.i]) }]} />}
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export const SparkLineChart = React.forwardRef<HTMLElement, any>(function SparkLineChart(props, ref) {
  const state = ChartKit.chartState(props, { icon: "ph-pulse" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <SparkLineChartBody {...props} forwardedRef={ref} />;
});
