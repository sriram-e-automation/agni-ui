import * as React from "react";
export interface RatingProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onChange" | "defaultValue"> {
  /** Filled stars (controlled). */
  value?: number;
  /** Initial value for an uncontrolled, settable rating. */
  defaultValue?: number;
  /** Total stars. @default 5 */
  max?: number;
  /** Star size — 12 / 14 / 18px. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Filled-star colour. @default warning */
  tone?: string;
  /** Pass to make it settable — omit for a read-only display. */
  onChange?: (value: number) => void;
  /** Accessible name of the group; tooltip when read-only. */
  label?: string;
  /** Show the numeric value beside the stars. */
  showValue?: boolean;
  /** Blocks interaction even when onChange is set; dims the control. */
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  /** Submitted with a native <form> through a hidden input. */
  name?: string;
  form?: string;
  /** Fires when focus leaves the whole group. */
  onBlur?: (e: React.FocusEvent<HTMLSpanElement>) => void;
}
/**
 * Star scale — read-only by default (safety rating, review score);
 * pass onChange to let the user set it.
 * Settable: a radio group — one Tab stop, arrow keys move and select, Home/End.
 * Read-only: one image labelled "n out of max".
 * @version 1.1.0
  * States: disabled.
*/
export declare const Rating: React.ForwardRefExoticComponent<RatingProps & React.RefAttributes<HTMLSpanElement>>;
