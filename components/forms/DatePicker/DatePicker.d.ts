import * as React from "react";
export interface DatePickerLabels {
  dialog: string; previousMonth: string; nextMonth: string; today: string; clear: string; clearDate: string;
}
export interface DatePickerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "type" | "onBlur"> {
  /** Selected date, or null for empty (controlled). */
  value?: Date | null;
  /** Initial date for an uncontrolled picker. */
  defaultValue?: Date | null;
  /** Called with a Date on selection, or null on clear. */
  onChange?: (value: Date | null) => void;
  /** Earliest selectable date (days before are disabled). */
  min?: Date | null;
  /** Latest selectable date (days after are disabled). */
  max?: Date | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  /** Submitted with a native <form> as yyyy-mm-dd through a hidden input. */
  name?: string;
  form?: string;
  /** Controlled popup state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires when focus leaves the whole control (trigger + calendar). */
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  /** Accessible names for the chrome — override for localisation. */
  labels?: Partial<DatePickerLabels>;
  /** Pass true to force dark-mode panel (auto-detected from DOM ancestor by default). */
  dark?: boolean;
  /** Applied to the trigger wrapper element. */
  style?: React.CSSProperties;
  className?: string;
}
/** Custom calendar date picker, fully themed with DS tokens. onChange → Date | null.
 *
 *  WAI-ARIA date picker dialog. Trigger: Enter / Space / ↓ open, Backspace /
 *  Delete clear. Calendar grid (roving focus, opens on the selected day):
 *  ← → day · ↑ ↓ week · Home / End week edges · PageUp / PageDown month
 *  (Shift: year) · Enter / Space select · Escape back to the trigger.
 *  The ref is the trigger button.
 *  @version 1.1.0
  * States: error · disabled.
*/
export declare const DatePicker: React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLButtonElement>>;
