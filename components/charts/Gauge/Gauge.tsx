import React, { useRef } from "react";
import { mergeRefs } from "../../utils/interaction.tsx";
import { ChartKit } from "../../utils/ChartKit.tsx";

/* ── Types (mirrored in Gauge.d.ts) ── */
export interface GaugeProps {
  value?: number;
  valueMin?: number;
  valueMax?: number;
  /** Arc start angle in degrees (0 = top). Default -110. */
  startAngle?: number;
  /** Arc end angle in degrees. Default 110. */
  endAngle?: number;
  /** Filled-arc colour. Default var(--chart-1). */
  color?: string;
  /** Arc stroke width in px. Default 12. */
  thickness?: number;
  /** Override the centred text (else the formatted value). */
  text?: React.ReactNode;
  showValue?: boolean;
  height?: number;
  style?: React.CSSProperties;
}
/** Single-value arc gauge with a centred readout. Themes light + dark. */


/**
 * AgniUI · Gauge  (MUI X Charts–compatible API)
 * <Gauge value={68} valueMin={0} valueMax={100} startAngle={-110} endAngle={110} />
 * A single-value arc gauge with the value (or a custom `text`) in the centre.
 * The filled arc uses `color` (default var(--chart-1)); the track uses
 * --chart-track. Themes for light + dark.
 */
const { useSize, fmt, Anim } = ChartKit;

function polar(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function GaugeBody({ forwardedRef,
  value = 0, valueMin = 0, valueMax = 100,
  startAngle = -110, endAngle = 110,
  color = "var(--chart-1)", thickness = 12, text, height, showValue = true, style = {},
}: GaugeProps & { forwardedRef?: React.Ref<HTMLElement> }) {
  const ref = useRef(null);
  const W = useSize(ref, 200);
  const size = height ? Math.min(W, height * 1.6) : Math.min(W, 240);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.4;
  const frac = Math.max(0, Math.min(1, (value - valueMin) / (valueMax - valueMin || 1)));
  const valAngle = startAngle + (endAngle - startAngle) * frac;
  const vh = size * 0.62;

  return (
    <div ref={mergeRefs(forwardedRef, ref)} style={{ width: "100%", minWidth: 0, display: "flex", justifyContent: "center", fontFamily: "var(--font-sans)", ...style }}>
      <Anim />
      <svg viewBox={`0 0 ${size} ${vh}`} style={{ width: size, height: "auto", display: "block", overflow: "visible" }}>
        <path d={arcPath(cx, cy, r, startAngle, endAngle)} fill="none" style={{ stroke: "var(--chart-track)" }} strokeWidth={thickness} strokeLinecap="round" />
        {frac > 0 && <path d={arcPath(cx, cy, r, startAngle, valAngle)} fill="none" pathLength="1" data-agni-anim style={{ stroke: color, strokeDasharray: 1, animation: "agniChartDraw var(--dur-slow) var(--ease-decelerate) both" }} strokeWidth={thickness} strokeLinecap="round" />}
        {showValue && (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.2} fontWeight="700" fontFamily="var(--font-data)" style={{ fill: "var(--text-primary)" }}>
            {text != null ? text : fmt(value)}
          </text>
        )}
      </svg>
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export const Gauge = React.forwardRef<HTMLElement, any>(function Gauge(props, ref) {
  const state = ChartKit.chartState(props, { icon: "ph-gauge" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <GaugeBody {...props} forwardedRef={ref} />;
});
