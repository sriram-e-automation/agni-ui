import * as React from "react";
export interface FormFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  /** Helper text under the control (suppressed while `error` is set). */
  hint?: React.ReactNode;
  /** Validation message — replaces the hint, shown with a warning icon. */
  error?: React.ReactNode;
  /** Span the full row of a FormSection grid. */
  span?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Label + control + hint/error wrapper on the --field-* grid rhythm.
 *  @version 1.0.0
  * States: error.
*/
export declare function FormField(props: FormFieldProps): JSX.Element;
