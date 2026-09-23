import * as React from "react";
export interface BarProps {
  /** @default "top" */
  position?: "top" | "footer";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Horizontal header / footer chrome bar.
 *  @version 1.1.0
 */
export declare const Bar: React.ForwardRefExoticComponent<BarProps & React.RefAttributes<HTMLDivElement>>;
