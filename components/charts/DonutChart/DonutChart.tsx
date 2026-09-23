import React from "react";
import { PieChart } from "../PieChart/PieChart.tsx";

/* ── Types (mirrored in DonutChart.d.ts) ── */
export interface DonutDatum {
  label: string;
  value: number;
  /** Override the auto-assigned categorical palette colour for this slice. */
  color?: string;
}
export interface DonutChartProps {
  data?: DonutDatum[];
  /** Show the inline legend (label · value · %). Default true. */
  legend?: boolean;
  /** Ring thickness as a fraction of the radius (0.15–0.7). Default 0.4. */
  thickness?: number;
  /** Caption under the centred number. Default "total". Pass "" to hide. */
  centerLabel?: string;
  /** Override the centred number (defaults to the summed total). */
  centerValue?: number | string;
  style?: React.CSSProperties;
}
/** Responsive donut / proportion chart with legend (themes via --chart-* tokens). */


/**
 * AgniUI · DonutChart
 * Back-compat alias over <PieChart> with an inner radius — kept so existing
 * `<DonutChart data={…} />` call sites keep working. New code can use
 * <PieChart series={[{ data, innerRadius }]} /> directly.
 */
export const DonutChart = React.forwardRef<HTMLElement, DonutChartProps>(function DonutChart({
  data = [], legend = true, thickness = 0.4, centerLabel = "total", centerValue, style = {}, ...state
}, ref) {
  return (
    <PieChart ref={ref as never}
      data={data}
      innerRadius={1 - Math.max(0.15, Math.min(0.7, thickness))}
      centerLabel={centerLabel}
      centerValue={centerValue}
      hideLegend={!legend}
      style={style}
      {...state}
    />
  );
});

/* State contract: loading · error · onRetry · empty pass straight through to
   PieChart, which resolves error → loading → empty → chart. No second wrapper
   here — but they must be forwarded, or a loading donut would fall through to
   PieChart's emptiness test and misreport as "No data for this period". */
