import React, { forwardRef } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Input.d.ts) ── */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "value" | "defaultValue" | "prefix"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled field. */
  value?: string | number;
  defaultValue?: string | number;
  /** Receives the raw value string, and the native change event as 2nd arg. */
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  /** Invalid — red edge + `aria-invalid`. Inherited from a surrounding FormField's `error`. */
  error?: boolean;
  /** Style for the outer shell. */
  style?: React.CSSProperties;
  /** Style for the native <input>. */
  inputStyle?: React.CSSProperties;
  /** Class for the outer shell. */
  className?: string;
  /** Class for the native <input>. */
  inputClassName?: string;
}
/** Text field with prefix/suffix icons + focus ring. */

/**
 * AgniUI · Input
 * Text field with optional prefix/suffix icon, sizes, error + disabled states.
 * NOTE: onChange receives the raw VALUE (string) first, then the event.
 *
 * The ref, `id`, `name` and every native attribute and event (onFocus, onBlur,
 * onKeyDown, autoComplete, inputMode, required, …) land on the real <input>, so
 * it drops into a <form>, a label and a form library like a native input.
 *
 * Tailwind v4 (migrated Aug 2026). The focus useState is gone — the ring is
 * `focus-within:` on the shell, so typing no longer re-renders the wrapper.
 * Height rides h-control-* with the rest of the control family.
 */
const SIZE = {
  sm: "h-control-sm px-[10px] text-sm",
  md: "h-control px-[12px] text-base",
  lg: "h-control-lg px-[14px] text-md",
} as const;

const SHELL =
  "flex items-center gap-2 border rounded-md " +
  "transition-[border-color,box-shadow] duration-fast ease-standard";

/* Idle → focus. error REPLACES the idle/focus block rather than being appended
   after it, so the border-color utilities never race on emit order.
   Border reads the layer-3 --input-bdr (→ --border-control, the documented
   form-control edge at ≥3:1 non-text contrast), same as every other control in
   the family — not --border-default, which Input and Select alone used to carry. */
const IDLE = "bg-surface-card border-[var(--input-bdr)] focus-within:border-line-brand focus-within:ring-focus";
const ERROR = "bg-surface-card border-status-error focus-within:ring-focus-error";
const DISABLED = "bg-surface-soft border-[var(--input-bdr)] opacity-[var(--state-disabled-opacity)]";

const FIELD =
  "flex-1 min-w-0 h-full border-none outline-none bg-transparent " +
  "font-sans text-inherit text-fg-primary";

const AFFIX = "inline-flex shrink-0 text-[17px] text-fg-tertiary";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  value,
  defaultValue,
  onChange,
  placeholder = "",
  type = "text",
  size = "md",          // sm | md | lg
  prefixIcon = null,
  suffixIcon = null,
  error,
  disabled,
  required,
  id,
  style = {},
  inputStyle = {},
  className = "",
  inputClassName = "",
  ...rest
}, ref) {
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-input"),
  );
  return (
    <div
      className={[SHELL, SIZE[size] || SIZE.md, f.disabled ? DISABLED : f.invalid ? ERROR : IDLE, className].join(" ")}
      style={style}
    >
      {prefixIcon && <span aria-hidden="true" className={AFFIX}>{prefixIcon}</span>}
      <input
        {...rest}
        ref={ref}
        id={f.id}
        type={type} value={value} defaultValue={defaultValue} placeholder={placeholder}
        disabled={f.disabled} required={f.required}
        aria-invalid={f.invalid || undefined}
        aria-describedby={f.describedBy}
        onChange={(e) => onChange?.(e.target.value, e)}
        data-agni-input=""
        className={[FIELD, inputClassName].join(" ")}
        style={inputStyle}
      />
      {suffixIcon && <span aria-hidden="true" className={AFFIX}>{suffixIcon}</span>}
    </div>
  );
});
