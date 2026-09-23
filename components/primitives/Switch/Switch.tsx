import React, { forwardRef } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Switch.d.ts) ── */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "type" | "checked" | "defaultChecked"> {
  /** Controlled state. Omit (and use `defaultChecked`) for an uncontrolled switch. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Receives the next state, and the native change event. */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  error?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
/** Boolean toggle switch. */

/**
 * AgniUI · Switch
 * A real <input type="checkbox" role="switch">, visually hidden, followed by the
 * drawn track. Space toggles; screen readers announce "switch, on/off". The
 * track and knob follow the input's :checked state in CSS (tokens/base.css),
 * so it stays correct when a form library sets `input.checked` directly.
 *
 * Tailwind v4 (migrated Aug 2026). Track and knob are fixed marks, not form-row
 * controls, so no --density-control-h. Knob travel is the one computed value —
 * it rides --agni-knob-on, set inline from the track geometry.
 */
const TRACK = { sm: "w-[32px] h-[18px]", md: "w-[40px] h-[22px]" } as const;
const KNOB = { sm: "size-[14px]", md: "size-[18px]" } as const;
const KNOB_ON = { sm: 32 - 14 - 2, md: 40 - 18 - 2 } as const;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({
  checked,
  defaultChecked,
  onChange,
  label = null,
  disabled,
  error,
  required,
  id,
  size = "md",     // sm | md
  style = {},
  className = "",
  ...rest
}, ref) {
  const s = TRACK[size] ? size : "md";
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-switch"),
  );
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
        ref={ref}
        type="checkbox"
        role="switch"
        id={f.id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={f.disabled}
        required={f.required}
        aria-invalid={f.invalid || undefined}
        aria-describedby={f.describedBy}
        onChange={(e) => onChange?.(e.target.checked, e)}
        data-agni-choice=""
      />
      <span
        aria-hidden="true"
        data-agni-mark="switch"
        className={["relative shrink-0 rounded-full transition-colors duration-normal ease-standard", TRACK[s]].join(" ")}
        style={{ ["--agni-knob-on" as string]: KNOB_ON[s] + "px" } as React.CSSProperties}
      >
        <span
          data-glyph="knob"
          className={[KNOB[s], "absolute rounded-full bg-[#fff] shadow-e-sm transition-[left] duration-normal ease-standard"].join(" ")}
          /* Knob inset is track geometry — runtime value. */
          style={{ top: 2 }}
        />
      </span>
      {label && <span className="text-base text-fg-primary">{label}</span>}
    </label>
  );
});
