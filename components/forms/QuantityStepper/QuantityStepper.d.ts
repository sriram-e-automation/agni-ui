import * as React from "react";
export interface QuantityStepperProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}
/** Numeric stepper: − / + tickers plus a directly-editable, clamped value.
 *  @version 1.0.0
  * States: disabled.
*/
export declare function QuantityStepper(props: QuantityStepperProps): JSX.Element;
