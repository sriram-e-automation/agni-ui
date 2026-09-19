import React from "react";

/* ── Types (mirrored in Checkbox.d.ts) ── */
export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  /** Validation failed — red border. Ignored when disabled. */
  error?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
/** Controlled checkbox with optional label + indeterminate state. */

/**
 * AgniUI · Checkbox
 * Controlled checkbox with label. Supports indeterminate + disabled + error.
 *
 * Tailwind v4 (migrated Aug 2026). The box is a fixed 16/18px mark, not a form-row
 * control, so it does NOT ride --density-control-h.
 */
const BOX_SIZE = { sm: "size-[16px] text-[11px]", md: "size-[18px] text-[13px]" } as const;

const BOX =
  "inline-flex items-center justify-center shrink-0 rounded-xs border-[1.5px] " +
  "text-fg-on-brand transition-[background-color,border-color] duration-fast";

const BOX_ON = "bg-action-brand border-action-brand";
const BOX_OFF = "bg-surface-card border-line-strong";
const BOX_ERROR = "bg-surface-card border-status-error";

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  label = null,
  disabled = false,
  error = false,
  size = "md",       // sm | md
  style = {},
  className = "",
  ...rest
}: CheckboxProps) {
  const on = checked || indeterminate;
  const box = on ? BOX_ON : (error && !disabled) ? BOX_ERROR : BOX_OFF;
  return (
    <label
      className={[
        "inline-flex items-center gap-2 select-none",
        disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : "cursor-pointer",
        className,
      ].join(" ")}
      style={style}
      {...rest}
    >
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={[BOX, BOX_SIZE[size] || BOX_SIZE.md, box].join(" ")}
      >
        {indeterminate ? <i className="ph-bold ph-minus" /> : checked ? <i className="ph-bold ph-check" /> : null}
      </span>
      {label && <span className="text-base text-fg-primary">{label}</span>}
    </label>
  );
}
