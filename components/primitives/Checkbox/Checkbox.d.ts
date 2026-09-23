import * as React from "react";
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "type" | "checked" | "defaultChecked"> {
  /** Controlled state. Omit (and use `defaultChecked`) for an uncontrolled box. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Mixed state — dash mark + `aria-checked="mixed"`. */
  indeterminate?: boolean;
  /** Receives the next checked state first, then the native change event. */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  /** Validation failed — red border + `aria-invalid`. Ignored when disabled. */
  error?: boolean;
  size?: "sm" | "md";
  /** Style / class for the outer <label>. */
  style?: React.CSSProperties;
  className?: string;
}
/** Checkbox with optional label + indeterminate state.
 *
 *  A real, visually-hidden <input type="checkbox"> drives the drawn box, so Tab
 *  reaches it, Space toggles it, it submits with a <form>, and a form library
 *  writing `input.checked` directly still repaints it. The ref is the input.
 *  @version 1.1.0
  * States: error · disabled · checked · indeterminate.
*/
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
