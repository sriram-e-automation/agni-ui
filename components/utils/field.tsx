import * as React from "react";

/**
 * AgniUI · field context
 * <FormField> owns the ids of its label, hint and error; the control inside it
 * reads them from here so `<label for>`, `aria-describedby` and `aria-invalid`
 * are wired without the page passing a single id. A control used outside a
 * FormField simply gets no context and falls back to its own props.
 */
export interface FieldContextValue {
  /** Id the control must carry — the label's `htmlFor` points at it. */
  controlId: string;
  labelId: string;
  hintId?: string;
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

export const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useFieldContext(): FieldContextValue | null {
  return React.useContext(FieldContext);
}

/** Props a control reads to describe itself — all optional, all overridable. */
export interface FieldControlInput {
  id?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
}

/**
 * Merge a control's own props with its FormField context. The control's
 * explicit props win; describedby ids are concatenated, not replaced.
 */
export function useFieldControl(props: FieldControlInput, fallbackId: string) {
  const ctx = useFieldContext();
  const invalid = !!(props.error ?? ctx?.invalid) || props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const describedBy = [props["aria-describedby"], ctx?.errorId, ctx?.hintId].filter(Boolean).join(" ") || undefined;
  return {
    id: props.id ?? ctx?.controlId ?? fallbackId,
    invalid,
    required: props.required ?? ctx?.required ?? false,
    disabled: props.disabled ?? ctx?.disabled ?? false,
    labelledBy: props["aria-labelledby"] ?? undefined,
    /** The label id when inside a FormField — for controls whose focusable isn't a labelable element. */
    contextLabelId: ctx?.labelId,
    describedBy,
  };
}
