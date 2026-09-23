import React, { forwardRef } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { useControllableState, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Radio.d.ts) ── */
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "type" | "checked" | "defaultChecked"> {
  /** Controlled state. Omit (and use `defaultChecked`) for an uncontrolled radio. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Fires when this radio becomes checked. */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  /** Validation failed — red border + `aria-invalid`. Ignored when disabled. */
  error?: boolean;
  /** Control scale — 18px / 16px dot (matches Checkbox/Switch sm·md). @default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
export interface RadioOption { value: string; label: React.ReactNode; disabled?: boolean; }
export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onBlur"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled group. */
  value?: string | null;
  defaultValue?: string | null;
  /** Receives the selected option's value, and the native change event. */
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Fires when focus leaves the whole group (not when it moves between radios). */
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  options?: (RadioOption | string)[];
  /** Shared `name` for the radios — generated when omitted. */
  name?: string;
  direction?: "row" | "column";
  gap?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}
/** Single radio control. */
/** Managed group of radios. */

/**
 * AgniUI · Radio / RadioGroup
 * Real <input type="radio"> controls, visually hidden, each followed by its drawn
 * ring (tokens/base.css → [data-agni-choice]). Radios sharing a `name` get the
 * platform's own keyboard model: one Tab stop for the group, arrow keys move
 * AND select, Space selects. RadioGroup supplies the shared name, the
 * `role="radiogroup"` wrapper and its label/description wiring.
 *
 * Tailwind v4 (migrated Aug 2026). Fixed 16/18px mark — not a form-row control,
 * so no --density-control-h.
 */
const RING_SIZE = { sm: "size-[16px]", md: "size-[18px]" } as const;
const DOT_SIZE = { sm: "size-[8px]", md: "size-[9px]" } as const;

const RING = "inline-flex items-center justify-center shrink-0 rounded-full border-[1.5px] transition-[border-color,box-shadow] duration-fast";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { checked, defaultChecked, onChange, label = null, disabled, error, required, id, size = "md", style = {}, className = "", ...rest },
  ref,
) {
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-radio"),
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
        type="radio"
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
        data-agni-mark="radio"
        data-invalid={f.invalid && !f.disabled ? "" : undefined}
        className={[RING, RING_SIZE[size] || RING_SIZE.md].join(" ")}
      >
        <span data-glyph="dot" className={[DOT_SIZE[size] || DOT_SIZE.md, "rounded-full"].join(" ")} />
      </span>
      {label && <span className={[size === "sm" ? "text-sm" : "text-base", "text-fg-primary"].join(" ")}>{label}</span>}
    </label>
  );
});

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup({
  value, defaultValue = null, onChange, onBlur, options = [], name, direction = "column", gap = 10, size = "md",
  disabled, required, error, id, style = {}, ...rest
}, ref) {
  const opts: RadioOption[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const groupName = useStableId(name, "agni-radios");
  const [current, setCurrent] = useControllableState<string | null, [React.ChangeEvent<HTMLInputElement>]>({
    value, defaultValue,
    onChange: (v, e) => { if (v != null) onChange?.(v, e); },
  });
  /* The group, not a radio, takes the FormField id and label. */
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-radiogroup"),
  );
  return (
    <div
      {...rest}
      ref={ref}
      id={f.id}
      role="radiogroup"
      aria-labelledby={rest["aria-labelledby"] ?? f.contextLabelId}
      aria-describedby={f.describedBy}
      aria-invalid={f.invalid || undefined}
      aria-required={f.required || undefined}
      aria-disabled={f.disabled || undefined}
      className={direction === "row" ? "flex flex-row flex-wrap" : "flex flex-col"}
      /* gap is a caller-supplied number — runtime value. */
      style={{ gap, ...style }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.(e); }}
    >
      {opts.map((o, i) => (
        <Radio
          key={o.value}
          id={`${f.id}-${i}`}
          name={groupName}
          value={o.value}
          checked={current === o.value}
          onChange={(on, e) => { if (on) setCurrent(o.value, e); }}
          label={o.label}
          disabled={f.disabled || o.disabled}
          /* required on every radio in a named group is the HTML rule for "one must be picked". */
          required={f.required}
          error={f.invalid}
          size={size}
        />
      ))}
    </div>
  );
});
