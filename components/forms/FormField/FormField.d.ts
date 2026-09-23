import * as React from "react";
export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label?: React.ReactNode;
  required?: boolean;
  /** Helper text under the control (suppressed while `error` is set). */
  hint?: React.ReactNode;
  /** Validation message — replaces the hint, shown with a warning icon, announced (role="alert"). */
  error?: React.ReactNode;
  /** Disable the control inside. */
  disabled?: boolean;
  /** Span the full row of a FormSection grid. */
  span?: boolean;
  /** Id for the control inside. Generated when omitted; the <label> points at it. */
  htmlFor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Label + control + hint/error wrapper on the --field-* grid rhythm.
 *
 *  Wires its control without ids from the page: the DS control inside takes the
 *  field's id (so `<label for>` works), `aria-describedby` → hint or error,
 *  `aria-invalid` while `error` is set, and `required` / `disabled`. Controls
 *  whose focus target isn't labelable (Select, DatePicker, RichTextEditor, …)
 *  are named through `aria-labelledby` instead. Build your own control on the
 *  same contract with `useFieldControl` from utils.
 *  @version 1.1.0
  * States: error.
*/
export declare const FormField: React.ForwardRefExoticComponent<FormFieldProps & React.RefAttributes<HTMLDivElement>>;
