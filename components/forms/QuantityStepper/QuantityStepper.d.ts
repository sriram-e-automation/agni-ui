import * as React from "react";
export interface QuantityStepperProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step" | "type"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled stepper. */
  value?: number;
  defaultValue?: number;
  /** Receives the clamped number. */
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** PageUp / PageDown step. @default step × 10 */
  largeStep?: number;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  /** Accessible names of the tickers. @default "Decrease" / "Increase" */
  decrementLabel?: string;
  incrementLabel?: string;
  style?: React.CSSProperties;
  className?: string;
}
/** Numeric stepper: − / + tickers plus a directly-editable, clamped value.
 *  WAI-ARIA spinbutton on a native input (the ref's target): ↑ ↓ step ·
 *  PageUp / PageDown large step · Home / End min / max.
 *  @version 1.1.0
  * States: disabled · error.
*/
export declare const QuantityStepper: React.ForwardRefExoticComponent<QuantityStepperProps & React.RefAttributes<HTMLInputElement>>;
