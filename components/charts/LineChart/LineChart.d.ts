import * as React from "react";

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
  /** Data in flight — axis-only skeleton at the chart's height. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Shown when the chart has no data. String → title; node → as given.
   *  Defaults to "No data for this period". */
  empty?: React.ReactNode;
}
/** Line / area trend chart — multi-series, hover crosshair + interactive legend.
 *  @version 1.1.0
  * States: loading · error · empty.
*/
export declare const LineChart: React.ForwardRefExoticComponent<LineChartProps & React.RefAttributes<HTMLElement>>;
