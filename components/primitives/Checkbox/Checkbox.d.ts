import * as React from "react";
export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  /** Validation failed — red border. Ignored when disabled. */
  error?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
/** Controlled checkbox with optional label + indeterminate state.
 *  @version 1.0.0
  * States: error · disabled · checked · indeterminate.
*/
export declare function Checkbox(props: CheckboxProps): JSX.Element;
