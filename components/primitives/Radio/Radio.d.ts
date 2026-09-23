import * as React from "react";
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "type" | "checked" | "defaultChecked"> {
  /** Controlled state. Omit (and use `defaultChecked`) for an uncontrolled radio. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Fires when this radio becomes checked. */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  /** Validation failed — red border + `aria-invalid`. Ignored when disabled. */
  error?: boolean;
  /** Control scale — matches Checkbox/Switch sm·md. @default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
export interface RadioOption { value: string; label: React.ReactNode; disabled?: boolean; }
export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onBlur"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled group. */
  value?: string | null;
  defaultValue?: string | null;
  /** Receives the selected option's value, then the native change event. */
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Fires when focus leaves the whole group — not when it moves between radios. */
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  options?: (RadioOption | string)[];
  /** Shared `name` for the radios — generated when omitted. */
  name?: string;
  direction?: "row" | "column";
  gap?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}
/** Single radio control — a real <input type="radio">; the ref is the input.
 *  @version 1.1.0
  * States: error · disabled · checked.
*/
export declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
/** Managed group of radios: `role="radiogroup"`, one shared `name`, and the
 *  platform keyboard model — one Tab stop, arrow keys move and select.
 *  The ref is the group element.
 *  @version 1.1.0
 */
export declare const RadioGroup: React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>;
