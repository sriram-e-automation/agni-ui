import * as React from "react";
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "defaultValue"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled field. */
  value?: string;
  defaultValue?: string;
  /** Receives the raw value string first, then the native change event. */
  onChange?: (value: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Invalid — red edge + `aria-invalid`. Inherited from a surrounding FormField's `error`. */
  error?: boolean;
}
/** Multi-line text field. The ref and every native attribute and event land on
 *  the real <textarea>; FormField wiring and form-library use as for Input.
 *  @version 1.1.0
  * States: error · disabled.
*/
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
