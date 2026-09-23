import type * as React from "react";

/**
 * AgniUI · form-library adapters
 *
 * AgniUI controls call `onChange(value, event?)` — the value first, because that
 * is what a page almost always wants. Form libraries that are spread straight
 * onto an input expect `onChange(event)` instead:
 *
 *   React Hook Form   {...register("email")}       → { name, onChange(e), onBlur(e), ref }
 *   Formik            {...field} / getFieldProps() → { name, value, onChange(e), onBlur(e), checked? }
 *
 * `fieldProps()` converts one into the other. Native-backed controls (Input,
 * Textarea, Checkbox, Radio, Switch) hand over the real DOM event; custom
 * controls (Select, DatePicker, QuantityStepper, Rating, RichTextEditor,
 * FileUpload) have no single native element, so the adapter synthesises an event
 * shaped `{ target: { name, value } }` — which is all either library reads.
 *
 *   <Input    {...fieldProps(register("email"))} />
 *   <Select   {...fieldProps(register("site"))} options={sites} />
 *   <Checkbox {...fieldProps(formik.getFieldProps({ name: "agree", type: "checkbox" }))} label="I agree" />
 *
 * React Hook Form's <Controller> needs no adapter: its `field` already speaks
 * value-first, so `render={({ field }) => <Select {...field} options={…} />}` works
 * as is, including `field.ref` for focus-on-error. Formik's `useField` helpers can
 * be passed as the second argument to route changes through `setValue`.
 */

/** Anything shaped like RHF `register()` output or a Formik `field`. */
export interface EventFieldProps {
  name: string;
  onChange: (event: any) => unknown;
  onBlur?: (event: any) => unknown;
  ref?: React.Ref<any>;
  value?: unknown;
  checked?: boolean;
  /** RHF register() extras, passed through untouched. */
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

/** Formik `useField()` helpers — optional second argument. */
export interface FieldHelpers<V = unknown> {
  setValue: (value: V, shouldValidate?: boolean) => unknown;
  setTouched?: (touched: boolean, shouldValidate?: boolean) => unknown;
}

/** The value-first props every AgniUI form control accepts. */
export interface ValueFieldProps<V = any> {
  name: string;
  onChange: (value: V, event?: React.SyntheticEvent | Event) => void;
  onBlur: (event?: React.FocusEvent<any>) => void;
  ref?: React.Ref<any>;
  value?: V;
  checked?: boolean;
  required?: boolean;
  disabled?: boolean;
}

/* The last value each adapted field reported, so a synthesised blur can carry
   it: React Hook Form re-reads the value on blur, and a blur without one would
   clear the field. Keyed by the library's onChange function, then the name. */
const lastValues = new WeakMap<(...a: any[]) => unknown, Map<string, unknown>>();
const remember = (fn: (...a: any[]) => unknown, name: string, v: unknown) => {
  let m = lastValues.get(fn); if (!m) { m = new Map(); lastValues.set(fn, m); } m.set(name, v);
};

/** A minimal change-event lookalike: `{ target: { name, value }, type: "change" }`. */
export function createChangeEvent<V>(name: string, value: V, extra: { checked?: boolean; type?: string } = {}) {
  const target = { name, value, id: name, ...extra };
  return {
    type: "change", target, currentTarget: target, nativeEvent: undefined,
    defaultPrevented: false, bubbles: true, cancelable: false,
    persist() {}, preventDefault() {}, stopPropagation() {}, isDefaultPrevented: () => false, isPropagationStopped: () => false,
  };
}

/** A minimal blur-event lookalike. Pass `value` when the library reads it on blur. */
export function createBlurEvent(name: string, value?: unknown, hasValue = value !== undefined) {
  const target = hasValue ? { name, id: name, value } : { name, id: name };
  return {
    type: "blur", target, currentTarget: target, nativeEvent: undefined,
    defaultPrevented: false, bubbles: true, cancelable: false,
    persist() {}, preventDefault() {}, stopPropagation() {}, isDefaultPrevented: () => false, isPropagationStopped: () => false,
  };
}

/**
 * Adapt event-first field props (RHF `register()`, Formik `field`) to AgniUI's
 * value-first contract. Pass Formik's `useField` helpers as `helpers` to write
 * through `setValue` / `setTouched` instead of synthesised events.
 */
export function fieldProps<V = any>(field: EventFieldProps, helpers?: FieldHelpers<V>): ValueFieldProps<V> {
  const { name, onChange, onBlur, ref, value, checked, ...passthrough } = field;
  const out: ValueFieldProps<V> = {
    ...passthrough,
    name,
    ref,
    onChange: (next: V, event?: React.SyntheticEvent | Event) => {
      if (helpers) { helpers.setValue(next); return; }
      /* A real DOM event whose target is the named native input carries
         everything the library reads (type, checked, value). Anything else —
         custom controls, or an event from an inner element — is synthesised. */
      const t = event && (event.target as HTMLInputElement | null);
      remember(onChange, name, next);
      if (t && typeof t === "object" && "name" in t && t.name === name) onChange(event);
      else onChange(createChangeEvent(name, next, typeof next === "boolean" ? { checked: next, type: "checkbox" } : {}));
    },
    onBlur: (event?: React.FocusEvent<any>) => {
      if (helpers?.setTouched) { helpers.setTouched(true); return; }
      if (!onBlur) return;
      const t = event && (event.target as HTMLInputElement | null);
      if (t && "name" in t && t.name === name) { onBlur(event); return; }
      const known = lastValues.get(onChange)?.has(name);
      /* Unknown value (blurred before any change): fall back to the value the
         caller passed, if any; RHF register() callers should prefer <Controller>
         for controls with no native input (DatePicker, Rating, RichTextEditor). */
      const v = known ? lastValues.get(onChange)!.get(name) : value;
      onBlur(createBlurEvent(name, v, known || value !== undefined));
    },
  };
  if (value !== undefined) out.value = value as V;
  if (checked !== undefined) out.checked = checked;
  return out;
}
