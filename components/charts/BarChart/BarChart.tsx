import React, { useState, useRef } from "react";
import { mergeRefs } from "../../utils/interaction.tsx";
import { ChartKit } from "../../utils/ChartKit.tsx";

/* ── Types (mirrored in BarChart.d.ts) ── */
export interface BarSeries {
  data: number[];
  label?: string;
  /** Override the series colour (else var(--chart-N) by index). */
  color?: string;
  /** Series sharing a `stack` id are stacked; others render side-by-side. */
  stack?: string;
}
export interface BarAxis {
  data: Array<string | number>;
  scaleType?: "band";
}
export interface BarDatum { label: string; value: number; color?: string; }

export interface BarChartProps {
  /** MUI-style series. */
  series?: BarSeries[];
  /** Category axis; xAxis[0].data supplies the labels. */
  xAxis?: BarAxis[];
  /** Back-compat shortcut for a single series. */
  data?: BarDatum[];
  /** Bar direction. Default "vertical". */
  layout?: "vertical" | "horizontal";
  height?: number;
  showGrid?: boolean;
  /** Value labels on bars. Defaults on for a single series. */
  showValues?: boolean;
  hideLegend?: boolean;
  hideTooltip?: boolean;
  /** Force one colour for every bar/series. */
  color?: string;
  style?: React.CSSProperties;
}
/** Categorical bar chart — grouped/stacked, vertical/horizontal, hover + legend. */


/**
 * AgniUI · BarChart  (MUI X Charts–compatible API)
 * <BarChart
 *   xAxis={[{ data: ["Q1","Q2",…], scaleType: "band" }]}
 *   series={[{ data:[…], label, color?, stack? }]}
 *   layout="vertical" | "horizontal" />
 *
 * • Multiple series render grouped side-by-side; series sharing a `stack` id
 *   stack on top of each other.
 * • Hover shows a tooltip for the category; the legend toggles series.
 * • Back-compat: pass `data={[{label,value,color?}]}` for a quick single series.
 * Everything themes via --chart-* for light + dark.
 */
const { useSize, color, niceMax, ticks, fmt, band, Tooltip, Legend, Anim } = ChartKit;

function norm(series, xAxis, data) {
  if (series && series.length) {
    const cats = (xAxis && xAxis[0] && xAxis[0].data) || series[0].data.map((_, i) => String(i + 1));
    return { cats, series: series.map((s, i) => ({ label: s.label || "Series " + (i + 1), color: s.color, stack: s.stack, data: s.data || [] })) };
  }
  const d = data || [];
  return { cats: d.map((x) => x.label), series: [{ label: "Value", data: d.map((x) => x.value), perPoint: d.map((x) => x.color) }] };
}

function BarChartBody({ forwardedRef,
  series, xAxis, data, layout = "vertical", height,
  showGrid = true, showValues, hideLegend = false, hideTooltip = false,
  color: singleColor, style = {},
}: BarChartProps & { forwardedRef?: React.Ref<HTMLElement> }) {
  const ref = useRef(null);
  const W = useSize(ref, 460);
  const [hidden, setHidden] = useState(() => new Set());
  const [hover, setHover] = useState(null);
  const horizontal = layout === "horizontal";

  const model = norm(series, xAxis, data);
  const cats = model.cats;
  const single = model.series.length === 1;
  const wantValues = showValues != null ? showValues : single;
  const toggle = (k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Stack groups: series sharing a `stack` id occupy one column; others sit side-by-side.
  const gkey = (s, i) => (s.stack != null ? "s:" + s.stack : "u:" + i);
  const order = [];
  model.series.forEach((s, i) => { const k = gkey(s, i); if (!order.includes(k)) order.push(k); });
  const groups = order.filter((k) => model.series.some((s, i) => gkey(s, i) === k && !hidden.has(i)));

  let maxV = 0;
  cats.forEach((_, ci) => groups.forEach((k) => {
    let sum = 0; model.series.forEach((s, si) => { if (gkey(s, si) === k && !hidden.has(si)) sum += Math.max(0, s.data[ci] || 0); });
    maxV = Math.max(maxV, sum);
  }));
  const max = niceMax(maxV);
  const colorOf = (s, si, ci) => singleColor || (s.perPoint && s.perPoint[ci]) || color(s, si);
  // Shared entrance + hover treatment for every bar segment.
  const barAnim = horizontal
    ? { transformBox: "fill-box", transformOrigin: "left center", animation: "agniRiseX var(--dur-normal) var(--ease-decelerate) both" }
    : { transformBox: "fill-box", transformOrigin: "center bottom", animation: "agniRiseY var(--dur-normal) var(--ease-decelerate) both" };
  const barStyle = (ci) => ({ ...barAnim, animationDelay: (ci * 45) + "ms", opacity: hover && hover.i !== ci ? 0.4 : 1, transition: "opacity var(--dur-fast) var(--ease-standard)" });

  const tickN = 4;
  const H = height || (horizontal ? Math.max(170, cats.length * 46 + 56) : Math.round(W * 0.5));
  const pad = horizontal ? { t: 12, r: 18, b: 34, l: 92 } : { t: wantValues ? 24 : 14, r: 14, b: 36, l: 46 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const vAxis = horizontal ? (v) => pad.l + iw * (v / max) : (v) => pad.t + ih - ih * (v / max);
  const catBand = horizontal ? band(cats.length, pad.t, pad.t + ih, 0.28) : band(cats.length, pad.l, pad.l + iw, 0.28);
  const sub = band(groups.length, 0, catBand.bandwidth, groups.length > 1 ? 0.2 : 0);

  const rows = (ci) => model.series.map((s, si) => ({ si, hide: hidden.has(si) }))
    .filter((r) => !r.hide).map((r) => ({ label: model.series[r.si].label, color: colorOf(model.series[r.si], r.si, ci), value: fmt(model.series[r.si].data[ci] || 0) }));

  return (
    <div ref={mergeRefs(forwardedRef, ref)} style={{ width: "100%", minWidth: 0, position: "relative", fontFamily: "var(--font-sans)", ...style }}>
      <Anim />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* value gridlines + ticks */}
        {showGrid && ticks(max, tickN).map((v, i) => {
          if (horizontal) { const x = vAxis(v); return (
            <g key={i}>
              <line x1={x} y1={pad.t} x2={x} y2={pad.t + ih} style={{ stroke: "var(--chart-grid)" }} strokeWidth="1" />
              <text x={x} y={H - pad.b + 18} textAnchor="middle" fontSize="11" fontFamily="var(--font-data)" style={{ fill: "var(--chart-axis)" }}>{fmt(v)}</text>
            </g>); }
          const y = vAxis(v); return (
            <g key={i}>
              <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} style={{ stroke: "var(--chart-grid)" }} strokeWidth="1" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-data)" style={{ fill: "var(--chart-axis)" }}>{fmt(v)}</text>
            </g>);
        })}

        {/* bars */}
        {cats.map((cat, ci) => {
          const c0 = catBand.start(ci);
          return (
            <g key={ci}>
              {groups.map((gk, gi) => {
                const segs = model.series.map((s, si) => ({ s, si })).filter(({ s, si }) => gkey(s, si) === gk && !hidden.has(si));
                let base = 0;
                const sx = c0 + sub.start(gi);
                return segs.map(({ s, si }) => {
                  const val = Math.max(0, s.data[ci] || 0);
                  const fill = colorOf(s, si, ci);
                  let rect;
                  if (horizontal) {
                    const x = vAxis(base), w2 = vAxis(base + val) - vAxis(base);
                    rect = <rect x={x} y={sx} width={Math.max(0, w2)} height={sub.bandwidth} rx="3" data-agni-anim style={{ fill, ...barStyle(ci) }} />;
                  } else {
                    const y = vAxis(base + val), h2 = vAxis(base) - vAxis(base + val);
                    rect = <rect x={sx} y={y} width={sub.bandwidth} height={Math.max(0, h2)} rx="3" data-agni-anim style={{ fill, ...barStyle(ci) }} />;
                  }
                  const node = <g key={si}>{rect}{wantValues && val > 0 && !horizontal &&
                    <text x={sx + sub.bandwidth / 2} y={vAxis(base + val) - 6} textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-data)" style={{ fill: "var(--text-secondary)" }}>{fmt(val)}</text>}
                    {wantValues && val > 0 && horizontal &&
                    <text x={vAxis(base + val) + 5} y={sx + sub.bandwidth / 2 + 4} textAnchor="start" fontSize="11" fontWeight="600" fontFamily="var(--font-data)" style={{ fill: "var(--text-secondary)" }}>{fmt(val)}</text>}
                  </g>;
                  base += val;
                  return node;
                });
              })}
              {/* category label */}
              {horizontal
                ? <text x={pad.l - 10} y={catBand.center(ci) + 4} textAnchor="end" fontSize="12" fontFamily="var(--font-sans)" style={{ fill: "var(--chart-axis)" }}>{cat}</text>
                : <text x={catBand.center(ci)} y={H - pad.b + 20} textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" style={{ fill: "var(--chart-axis)" }}>{cat}</text>}
            </g>
          );
        })}

        {/* hover hit-areas + highlight */}
        {!hideTooltip && cats.map((cat, ci) => {
          const c0 = catBand.start(ci);
          const hot = hover && hover.i === ci;
          return horizontal ? (
            <rect key={ci} x={pad.l} y={c0} width={iw} height={catBand.bandwidth}
              fill={hot ? "var(--chart-grid)" : "transparent"} opacity={hot ? 0.35 : 1}
              onMouseMove={(e) => setHover({ i: ci, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
              onMouseLeave={() => setHover(null)} style={{ cursor: "default" }} />
          ) : (
            <rect key={ci} x={c0} y={pad.t} width={catBand.bandwidth} height={ih}
              fill={hot ? "var(--chart-grid)" : "transparent"} opacity={hot ? 0.35 : 1}
              onMouseMove={(e) => setHover({ i: ci, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
              onMouseLeave={() => setHover(null)} style={{ cursor: "default" }} />
          );
        })}
      </svg>

      {!hideTooltip && hover && <Tooltip visible x={hover.x} y={hover.y} w={W} title={cats[hover.i]} rows={rows(hover.i)} />}
      {!hideLegend && !single && <Legend items={model.series.map((s, i) => ({ label: s.label, color: color(s, i), key: i }))} hidden={hidden} onToggle={toggle} />}
    </div>
  );
}

/* State contract — error → loading → empty → chart, resolved once in ChartKit
   (see chartState). The body mounts only when there is data, so hook order
   never changes between states. */
export const BarChart = React.forwardRef<HTMLElement, any>(function BarChart(props, ref) {
  const state = ChartKit.chartState(props, { icon: "ph-chart-bar" });
  if (state !== false) {
    return (
      <div style={{ width: "100%", minHeight: props.height || 260, display: "grid", placeItems: "center", ...(props.style || {}) }}>
        {state}
      </div>
    );
  }
  return <BarChartBody {...props} forwardedRef={ref} />;
});
