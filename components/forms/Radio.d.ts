import * as React from "react";
export interface RadioProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  /** Validation failed — red border. Ignored when disabled. */
  error?: boolean;
  /** Control scale — matches Checkbox/Switch sm·md. @default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: ({ value: string; label: string; disabled?: boolean } | string)[];
  direction?: "row" | "column";
  gap?: number;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
/** Single radio control.  * States: error · disabled · checked.
*/
export declare function Radio(props: RadioProps): JSX.Element;
/** Managed group of radios.
 *  @version 1.0.0
 */
export declare function RadioGroup(props: RadioGroupProps): JSX.Element;
