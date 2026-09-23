import React, { forwardRef, useEffect, useRef } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { useMergedRef, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Checkbox.d.ts) ── */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "type" | "checked" | "defaultChecked"> {
  /** Controlled state. Omit (and use `defaultChecked`) for an uncontrolled box. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Mixed state — shows a dash and sets `aria-checked="mixed"`. */
  indeterminate?: boolean;
  /** Receives the next checked state, and the native change event. */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  /** Validation failed — red border + `aria-invalid`. Ignored when disabled. */
  error?: boolean;
  size?: "sm" | "md";
  /** Style for the outer <label>. */
  style?: React.CSSProperties;
  /** Class for the outer <label>. */
  className?: string;
}
/** Checkbox with optional label + indeterminate state. */

/**
 * AgniUI · Checkbox
 * A real <input type="checkbox">, visually hidden, followed by the drawn box.
 * The box's checked / indeterminate / focus look is driven by the input's own
 * pseudo-classes (tokens/base.css → [data-agni-choice]), so Space toggles it,
 * Tab reaches it, it submits with a <form>, and a form library that writes
 * `input.checked` directly still repaints it. The ref is the native input.
 *
 * Tailwind v4 (migrated Aug 2026). The box is a fixed 16/18px mark, not a form-row
 * control, so it does NOT ride --density-control-h.
 */
const BOX_SIZE = { sm: "size-[16px] text-[11px]", md: "size-[18px] text-[13px]" } as const;

const BOX =
  "inline-flex items-center justify-center shrink-0 rounded-xs border-[1.5px] " +
  "transition-[background-color,border-color] duration-fast";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
  checked,
  defaultChecked,
  indeterminate = false,
  onChange,
  label = null,
  disabled,
  error,
  required,
  id,
  size = "md",       // sm | md
  style = {},
  className = "",
  ...rest
}, ref) {
  const local = useRef<HTMLInputElement>(null);
  const merged = useMergedRef(ref, local);
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-checkbox"),
  );
  /* `indeterminate` is a DOM property with no attribute — it must be set imperatively. */
  useEffect(() => { if (local.current) local.current.indeterminate = !!indeterminate; }, [indeterminate]);

  return (
    <label
      className={[
        "relative inline-flex items-center gap-2 select-none",
        f.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : "cursor-pointer",
        className,
      ].join(" ")}
      style={style}
    >
      <input
        {...rest}
        ref={merged}
        type="checkbox"
        id={f.id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={f.disabled}
        required={f.required}
        aria-checked={indeterminate ? "mixed" : undefined}
        aria-invalid={f.invalid || undefined}
        aria-describedby={f.describedBy}
        onChange={(e) => onChange?.(e.target.checked, e)}
        data-agni-choice=""
      />
      <span
        aria-hidden="true"
        data-agni-mark="checkbox"
        data-invalid={f.invalid && !f.disabled ? "" : undefined}
        className={[BOX, BOX_SIZE[size] || BOX_SIZE.md].join(" ")}
      >
        <i data-glyph="check" className="ph-bold ph-check" />
        <i data-glyph="dash" className="ph-bold ph-minus" />
      </span>
      {label && <span className="text-base text-fg-primary">{label}</span>}
    </label>
  );
});
