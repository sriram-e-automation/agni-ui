import * as React from "react";

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
  /** Data in flight — axis-only skeleton at the chart's height. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Shown when the chart has no data. String → title; node → as given.
   *  Defaults to "No data for this period". */
  empty?: React.ReactNode;
}
/** Categorical bar chart — grouped/stacked, vertical/horizontal, hover + legend.
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function BarChart(props: BarChartProps): JSX.Element;
