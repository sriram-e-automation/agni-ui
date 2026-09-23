import * as React from "react";
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
  /** Data in flight — axis-only skeleton at the chart's height. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Shown when the chart has no data. String → title; node → as given.
   *  Defaults to "No data for this period". */
  empty?: React.ReactNode;
}
/** Responsive donut / proportion chart with legend (themes via --chart-* tokens).
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function DonutChart(props: DonutChartProps): JSX.Element;
