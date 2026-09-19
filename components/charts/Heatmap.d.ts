import * as React from "react";

export interface HeatmapAxis {
  /** Category labels along this axis, in order. */
  data: Array<string | number>;
}
export interface HeatmapSeries {
  /** Cells as [xIndex, yIndex, value]. */
  data: Array<[number, number, number]>;
}
export interface HeatmapProps {
  series?: HeatmapSeries[];
  /** Column axis; xAxis[0].data supplies the labels. */
  xAxis?: HeatmapAxis[];
  /** Row axis; yAxis[0].data supplies the labels. */
  yAxis?: HeatmapAxis[];
  /** Pin the ramp's low end (else min of the data, floored at 0). */
  min?: number;
  /** Pin the ramp's high end (else max of the data). */
  max?: number;
  /** Intensity ramp stops, low→high (literal hex). */
  colors?: string[];
  height?: number;
  /** Print the value inside each cell when it fits. */
  showValues?: boolean;
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
/** Grid heatmap — value→colour intensity ramp, scale bar, hover lift + tooltip.
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function Heatmap(props: HeatmapProps): JSX.Element;
