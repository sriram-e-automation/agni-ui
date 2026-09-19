import * as React from "react";
export interface GaugeProps {
  value?: number;
  valueMin?: number;
  valueMax?: number;
  /** Arc start angle in degrees (0 = top). Default -110. */
  startAngle?: number;
  /** Arc end angle in degrees. Default 110. */
  endAngle?: number;
  /** Filled-arc colour. Default var(--chart-1). */
  color?: string;
  /** Arc stroke width in px. Default 12. */
  thickness?: number;
  /** Override the centred text (else the formatted value). */
  text?: React.ReactNode;
  showValue?: boolean;
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
/** Single-value arc gauge with a centred readout. Themes light + dark.
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function Gauge(props: GaugeProps): JSX.Element;
