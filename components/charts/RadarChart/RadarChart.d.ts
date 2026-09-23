import * as React from "react";

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
  /** Data in flight — axis-only skeleton at the chart's height. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Shown when the chart has no data. String → title; node → as given.
   *  Defaults to "No data for this period". */
  empty?: React.ReactNode;
}
/** Polar radar/spider chart — multi-series, hover-to-highlight, toggle legend.
 *  @version 1.1.0
  * States: loading · error · empty.
*/
export declare const RadarChart: React.ForwardRefExoticComponent<RadarChartProps & React.RefAttributes<HTMLElement>>;
