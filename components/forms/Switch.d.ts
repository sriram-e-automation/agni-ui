import * as React from "react";
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
/** Boolean toggle switch.
 *  @version 1.0.0
  * States: disabled · checked.
*/
export declare function Switch(props: SwitchProps): JSX.Element;
