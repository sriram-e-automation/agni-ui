import React, { forwardRef } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Textarea.d.ts) ── */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "defaultValue"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled field. */
  value?: string;
  defaultValue?: string;
  /** Receives the raw value string, and the native change event as 2nd arg. */
  onChange?: (value: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Invalid — red edge + `aria-invalid`. Inherited from a surrounding FormField's `error`. */
  error?: boolean;
}
/** Multi-line text field. */

/**
 * AgniUI · Textarea — multi-line text field. onChange receives the value.
 * The ref and every native attribute and event land on the real <textarea>.
 *
 * Tailwind v4 (migrated Aug 2026). Focus is `focus:` rather than a useState, so
 * keystrokes no longer re-render. No h-control here: height comes from `rows`.
 */
const BASE =
  "w-full px-3 py-2 resize-y font-sans text-base leading-normal text-fg-primary " +
  "border rounded-md outline-none " +
  "transition-[border-color,box-shadow] duration-fast ease-standard";

const IDLE = "bg-[var(--input-bg)] border-[var(--input-bdr)] focus:border-[var(--input-bdr-focus)] focus:ring-focus";
const ERROR = "bg-[var(--input-bg)] border-[var(--input-bdr-error)] focus:ring-focus-error";
const DISABLED = "bg-[var(--input-bg-disabled)] border-[var(--input-bdr)] opacity-[var(--state-disabled-opacity)]";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { value, defaultValue, onChange, placeholder = "", rows = 4, error, disabled, required, id, style = {}, className = "", ...rest },
  ref,
) {
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-textarea"),
  );
  return (
    <textarea
      {...rest}
      ref={ref}
      id={f.id}
      value={value} defaultValue={defaultValue} placeholder={placeholder} rows={rows}
      disabled={f.disabled} required={f.required}
      aria-invalid={f.invalid || undefined}
      aria-describedby={f.describedBy}
      onChange={(e) => onChange?.(e.target.value, e)}
      className={[BASE, f.disabled ? DISABLED : f.invalid ? ERROR : IDLE, className].join(" ")}
      style={style}
    />
  );
});
