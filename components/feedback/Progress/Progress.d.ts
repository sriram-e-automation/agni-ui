import * as React from "react";
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value?: number;
  indeterminate?: boolean;
  tone?: "brand" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  /** Visible label — also the progressbar's accessible name. */
  label?: React.ReactNode;
  showValue?: boolean;
  /** Spoken value, e.g. "3 of 5 steps". Defaults to the percentage. */
  valueText?: string;
  style?: React.CSSProperties;
}
/** Linear progress / loading bar — role="progressbar" with aria-valuenow
 *  (omitted and aria-busy while indeterminate). The ref is the bar.
 *  @version 1.1.0
  * States: indeterminate.
*/
export declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
