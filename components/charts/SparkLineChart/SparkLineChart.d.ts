import * as React from "react";
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
  /** Data in flight — axis-only skeleton at the chart's height. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Shown when the chart has no data. String → title; node → as given.
   *  Defaults to "No data for this period". */
  empty?: React.ReactNode;
}
/** Compact, axis-less trend (line or bar) for inline KPI / table use.
 *  @version 1.1.0
  * States: loading · error · empty.
*/
export declare const SparkLineChart: React.ForwardRefExoticComponent<SparkLineChartProps & React.RefAttributes<HTMLElement>>;
