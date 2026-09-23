import React, { forwardRef } from "react";
import { FieldContext, type FieldContextValue } from "../../utils/field.tsx";
import { useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in FormField.d.ts) ── */
export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label?: React.ReactNode;
  required?: boolean;
  /** Helper text under the control (suppressed while `error` is set). */
  hint?: React.ReactNode;
  /** Validation message — replaces the hint, shown with a warning icon. */
  error?: React.ReactNode;
  /** Disable the control inside. */
  disabled?: boolean;
  /** Span the full row of a FormSection grid. */
  span?: boolean;
  /** Id for the control inside. Generated when omitted; the label points at it. */
  htmlFor?: string;
  children?: React.ReactNode;
}

/**
 * AgniUI · FormField
 * Label + control + hint/error wrapper on the --field-* grid rhythm.
 * Promoted from the admin-ops scaffold & work-orders kit (both hand-rolled it).
 *
 * Provides FieldContext: the control inside reads its `id`, `aria-describedby`
 * (hint or error), `aria-invalid`, `required` and `disabled` from here, so the
 * `<label for>` pairing and the error announcement need no ids from the page.
 *
 * Tailwind v4 (migrated Aug 2026). The label gap keeps reading --field-label-gap
 * as an arbitrary value: it is a layer-3 rhythm token with no Tailwind namespace.
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { label, required = false, hint, error, disabled = false, span, htmlFor, children, style = {}, className = "", ...rest },
  ref,
) {
  const controlId = useStableId(htmlFor, "agni-field");
  const hasError = !!error;
  const ctx: FieldContextValue = {
    controlId,
    labelId: controlId + "-label",
    hintId: !hasError && hint ? controlId + "-hint" : undefined,
    errorId: hasError ? controlId + "-error" : undefined,
    invalid: hasError,
    required,
    disabled,
  };
  return (
    <FieldContext.Provider value={ctx}>
      <div
        ref={ref}
        className={[
          "flex flex-col gap-[var(--field-label-gap)] min-w-0",
          span ? "col-span-full" : "",
          className,
        ].join(" ")}
        style={style}
        {...rest}
      >
        {label && (
          <label id={ctx.labelId} htmlFor={controlId} className="inline-flex items-center text-sm font-semibold text-fg-primary">
            {label}
            {required && <span aria-hidden="true" className="ml-[3px] font-bold text-[var(--required-mark)]">*</span>}
          </label>
        )}
        {children}
        {hasError
          ? <span id={ctx.errorId} role="alert" className="inline-flex items-center gap-1 text-xs text-status-error"><i aria-hidden="true" className="ph-fill ph-warning-circle text-[12px]" />{error}</span>
          : hint && <span id={ctx.hintId} className="text-xs text-fg-tertiary">{hint}</span>}
      </div>
    </FieldContext.Provider>
  );
});
