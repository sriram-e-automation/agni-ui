import * as React from "react";
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "type" | "checked" | "defaultChecked"> {
  /** Controlled state. Omit (and use `defaultChecked`) for an uncontrolled switch. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Receives the next state first, then the native change event. */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  error?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
/** Boolean toggle switch — a real <input type="checkbox" role="switch">.
 *  Space toggles; announced as "switch, on/off". The ref is the input.
 *  @version 1.1.0
  * States: disabled · checked.
*/
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
