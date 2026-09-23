import * as React from "react";
export interface ChartLegendEntry { label: React.ReactNode; color: string; }
export interface ChartCardProps {
  title?: React.ReactNode;
  /** Second line — the period or scope the chart covers. */
  subtitle?: React.ReactNode;
  /** Swatch + label pairs, right-aligned in the header. Omit when the chart
   *  renders its own interactive legend. */
  legend?: ChartLegendEntry[];
  /** Header-right slot (used instead of, or after, the legend). */
  actions?: React.ReactNode;
  /** Body padding. @default "16px 18px 18px" */
  pad?: string | number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/**
 * Framing for one chart: title, subtitle, legend and body.
 * Every dashboard chart sits in one of these so titles, spacing and legends
 * stay identical across modules. Use Card for non-chart content.
 * @version 1.0.0
 */
export declare function ChartCard(props: ChartCardProps): JSX.Element;
