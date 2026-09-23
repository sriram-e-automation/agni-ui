import * as React from "react";
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "value" | "defaultValue" | "prefix"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled field. */
  value?: string | number;
  defaultValue?: string | number;
  /** Receives the raw value string first, then the native change event. */
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  /** Invalid — red edge + `aria-invalid`. Inherited from a surrounding FormField's `error`. */
  error?: boolean;
  /** Style / class for the outer shell. */
  style?: React.CSSProperties;
  className?: string;
  /** Style / class for the native <input>. */
  inputStyle?: React.CSSProperties;
  inputClassName?: string;
}
/** Text field with prefix/suffix icons + focus ring.
 *
 *  The ref, `id`, `name` and every native attribute and event (onFocus, onBlur,
 *  onKeyDown, autoComplete, required, …) land on the real <input>. Inside a
 *  FormField it takes the field's id, `aria-describedby` (hint/error),
 *  `aria-invalid`, `required` and `disabled` automatically.
 *  Forms: `{...fieldProps(register("x"))}` (React Hook Form) or
 *  `{...fieldProps(formik.getFieldProps("x"))}` (Formik) — see utils/form.
 *  @version 1.1.0
  * States: error · disabled.
*/
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
