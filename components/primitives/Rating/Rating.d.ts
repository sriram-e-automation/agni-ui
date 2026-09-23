import * as React from "react";
export interface RatingProps {
  /** Filled stars. */
  value?: number;
  /** Total stars. @default 5 */
  max?: number;
  /** Star size — 12 / 14 / 18px. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Filled-star colour. @default warning */
  tone?: string;
  /** Pass to make it settable — omit for a read-only display. */
  onChange?: (value: number) => void;
  /** Tooltip text; defaults to "value/max". */
  label?: string;
  /** Show the numeric value beside the stars. */
  showValue?: boolean;
  /** Blocks interaction even when onChange is set; dims the control. */
  disabled?: boolean;
  style?: React.CSSProperties;
}
/**
 * Star scale — read-only by default (safety rating, review score);
 * pass onChange to let the user set it.
 * @version 1.0.0
  * States: disabled.
*/
export declare function Rating(props: RatingProps): JSX.Element;
