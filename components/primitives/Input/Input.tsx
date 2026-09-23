import React from "react";

/* ── Types (mirrored in Input.d.ts) ── */
export interface InputProps {
  value?: string;
  /** Receives the raw value string (and the event as 2nd arg). */
  onChange?: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  className?: string;
}
/** Text field with prefix/suffix icons + focus ring. */

/**
 * AgniUI · Input
 * Text field with optional prefix/suffix icon, sizes, error + disabled states.
 * NOTE: onChange receives the raw VALUE (string), not the event.
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

export function Input({
  value,
  onChange,
  placeholder = "",
  type = "text",
  size = "md",          // sm | md | lg
  prefixIcon = null,
  suffixIcon = null,
  error = false,
  disabled = false,
  style = {},
  inputStyle = {},
  className = "",
  ...rest
}: InputProps) {
  return (
    <div
      className={[SHELL, SIZE[size] || SIZE.md, disabled ? DISABLED : error ? ERROR : IDLE, className].join(" ")}
      style={style}
    >
      {prefixIcon && <span className={AFFIX}>{prefixIcon}</span>}
      <input
        type={type} value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value, e)}
        data-agni-input=""
        className={FIELD}
        style={inputStyle}
        {...rest}
      />
      {suffixIcon && <span className={AFFIX}>{suffixIcon}</span>}
    </div>
  );
}
