import * as React from "react";
export interface ProgressProps {
  /** 0–100 */
  value?: number;
  indeterminate?: boolean;
  tone?: "brand" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  label?: React.ReactNode;
  showValue?: boolean;
  style?: React.CSSProperties;
}
/** Linear progress / loading bar.
 *  @version 1.0.0
  * States: indeterminate.
*/
export declare function Progress(props: ProgressProps): JSX.Element;
