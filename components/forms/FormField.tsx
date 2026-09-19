import React from "react";

/* ── Types (mirrored in FormField.d.ts) ── */
export interface FormFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  /** Helper text under the control (suppressed while `error` is set). */
  hint?: React.ReactNode;
  /** Validation message — replaces the hint, shown with a warning icon. */
  error?: React.ReactNode;
  /** Span the full row of a FormSection grid. */
  span?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * AgniUI · FormField
 * Label + control + hint/error wrapper on the --field-* grid rhythm.
 * Promoted from the admin-ops scaffold & work-orders kit (both hand-rolled it).
 *
 * Tailwind v4 (migrated Aug 2026). The label gap keeps reading --field-label-gap
 * as an arbitrary value: it is a layer-3 rhythm token with no Tailwind namespace.
 */
export function FormField({ label, required, hint, error, span, children, style = {}, className = "" }: FormFieldProps) {
  return (
    <div
      className={[
        "flex flex-col gap-[var(--field-label-gap)] min-w-0",
        span ? "col-span-full" : "",
        className,
      ].join(" ")}
      style={style}
    >
      {label && (
        <span className="inline-flex items-center text-sm font-semibold text-fg-primary">
          {label}
          {required && <span className="ml-[3px] font-bold text-[var(--required-mark)]">*</span>}
        </span>
      )}
      {children}
      {error
        ? <span className="inline-flex items-center gap-1 text-xs text-status-error"><i className="ph-fill ph-warning-circle text-[12px]" />{error}</span>
        : hint && <span className="text-xs text-fg-tertiary">{hint}</span>}
    </div>
  );
}
