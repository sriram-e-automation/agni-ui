import React from "react";

/* ── Types (mirrored in Textarea.d.ts) ── */
export interface TextareaProps {
  value?: string;
  onChange?: (value: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
/** Multi-line text field. */

/**
 * AgniUI · Textarea — multi-line text field. onChange receives the value.
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

export function Textarea({ value, onChange, placeholder = "", rows = 4, error = false, disabled = false, style = {}, className = "", ...rest }: TextareaProps) {
  return (
    <textarea
      value={value} placeholder={placeholder} rows={rows} disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.value, e)}
      className={[BASE, disabled ? DISABLED : error ? ERROR : IDLE, className].join(" ")}
      style={style}
      {...rest}
    />
  );
}
