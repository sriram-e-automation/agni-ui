import React from "react";

/* ── Types (mirrored in Radio.d.ts) ── */
export interface RadioProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  /** Validation failed — red border. Ignored when disabled. */
  error?: boolean;
  /** Control scale — 18px / 16px dot (matches Checkbox/Switch sm·md). @default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
export interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: ({ value: string; label: string; disabled?: boolean } | string)[];
  direction?: "row" | "column";
  gap?: number;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
/** Single radio control. */
/** Managed group of radios. */

/**
 * AgniUI · Radio / RadioGroup
 * RadioGroup manages selection; pass options [{value,label}] or render <Radio>.
 *
 * Tailwind v4 (migrated Aug 2026). Fixed 16/18px mark — not a form-row control,
 * so no --density-control-h.
 */
const RING_SIZE = { sm: "size-[16px]", md: "size-[18px]" } as const;
const DOT_SIZE = { sm: "size-[8px]", md: "size-[9px]" } as const;

const RING = "inline-flex items-center justify-center shrink-0 rounded-full border-[1.5px] transition-colors duration-fast";
const RING_ON = "border-action-brand";
const RING_OFF = "border-line-strong";
const RING_ERROR = "border-status-error";

export function Radio({ checked = false, onChange, label = null, disabled = false, error = false, size = "md", style = {}, className = "", ...rest }: RadioProps) {
  const ring = checked ? RING_ON : (error && !disabled) ? RING_ERROR : RING_OFF;
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
        onClick={() => !disabled && onChange && onChange(true)}
        className={[RING, RING_SIZE[size] || RING_SIZE.md, ring].join(" ")}
      >
        {checked && <span className={[DOT_SIZE[size] || DOT_SIZE.md, "rounded-full bg-action-brand"].join(" ")} />}
      </span>
      {label && <span className={[size === "sm" ? "text-sm" : "text-base", "text-fg-primary"].join(" ")}>{label}</span>}
    </label>
  );
}

export function RadioGroup({ value, onChange, options = [], direction = "column", gap = 10, size = "md", style = {} }: RadioGroupProps) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div
      className={direction === "row" ? "flex flex-row" : "flex flex-col"}
      /* gap is a caller-supplied number — runtime value. */
      style={{ gap, ...style }}
    >
      {opts.map((o) => (
        <Radio key={o.value} checked={value === o.value} onChange={() => onChange && onChange(o.value)} label={o.label} disabled={o.disabled} size={size} />
      ))}
    </div>
  );
}
