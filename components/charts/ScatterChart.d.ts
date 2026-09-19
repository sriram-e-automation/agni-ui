import * as React from "react";
export interface ScatterPoint { x: number; y: number; id?: string | number; }
export interface ScatterSeries { data: ScatterPoint[]; label?: string; color?: string; }
export interface ScatterAxis { min?: number; max?: number; }
export interface ScatterChartProps {
  series?: ScatterSeries[];
  xAxis?: ScatterAxis[];
  yAxis?: ScatterAxis[];
  height?: number;
  showGrid?: boolean;
  hideLegend?: boolean;
  hideTooltip?: boolean;
  markerSize?: number;
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
/** Scatter / point chart — multiple x/y series, hover highlight + legend.
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function ScatterChart(props: ScatterChartProps): JSX.Element;
