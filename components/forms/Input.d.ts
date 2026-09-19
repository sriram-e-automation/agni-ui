import * as React from "react";
export interface InputProps {
  value?: string;
  /** Receives the raw value string (and the event as 2nd arg). */
  onChange?: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}
/** Text field with prefix/suffix icons + focus ring.
 *  @version 1.0.0
  * States: error · disabled.
*/
export declare function Input(props: InputProps): JSX.Element;
