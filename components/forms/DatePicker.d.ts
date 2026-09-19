import * as React from "react";
export interface DatePickerProps {
  /** Selected date, or null for empty. */
  value?: Date | null;
  /** Called with a Date on selection, or null on clear. */
  onChange?: (value: Date | null) => void;
  /** Earliest selectable date (days before are disabled). */
  min?: Date | null;
  /** Latest selectable date (days after are disabled). */
  max?: Date | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  /** Pass true to force dark-mode panel (auto-detected from DOM ancestor by default). */
  dark?: boolean;
  /** Applied to the trigger wrapper element. */
  style?: React.CSSProperties;
}
/** Custom calendar date picker, fully themed with DS tokens. onChange → Date | null.
 *  @version 1.0.0
  * States: error · disabled.
*/
export declare function DatePicker(props: DatePickerProps): JSX.Element;
