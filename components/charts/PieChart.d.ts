import * as React from "react";

export interface PieDatum {
  value: number;
  label?: string;
  id?: string | number;
  color?: string;
}
export interface PieSeries {
  data: PieDatum[];
  /** 0 = pie; >0 and <1 = fraction of outer radius; >=1 = absolute px → donut. */
  innerRadius?: number;
  outerRadius?: number;
  /** Gap between slices, in degrees. Default 1.5. */
  paddingAngle?: number;
  cornerRadius?: number;
}
export interface PieChartProps {
  series?: PieSeries[];
  /** Back-compat shortcut for a single series. */
  data?: PieDatum[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  /** Caption under the donut centre number. */
  centerLabel?: string;
  /** Override the donut centre number (defaults to the visible total). */
  centerValue?: number | string;
  hideLegend?: boolean;
  hideTooltip?: boolean;
  legendAlign?: "start" | "center";
  height?: number;
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
/** Pie / donut proportion chart — hover highlight, interactive legend, centre total.
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function PieChart(props: PieChartProps): JSX.Element;
