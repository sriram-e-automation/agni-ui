import React, { forwardRef } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { composeHandlers, useControllableState, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in QuantityStepper.d.ts) ── */
export interface QuantityStepperProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step" | "type"> {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled stepper. */
  value?: number;
  defaultValue?: number;
  /** Receives the clamped number. */
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** PageUp / PageDown step. @default step × 10 */
  largeStep?: number;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  /** Accessible names of the tickers. */
  decrementLabel?: string;
  incrementLabel?: string;
  /** Style / class for the outer shell. */
  style?: React.CSSProperties;
  className?: string;
}
/** Numeric stepper: − / + tickers plus a directly-editable, clamped value. */

/**
 * AgniUI · QuantityStepper
 * Numeric stepper with − / + tickers and a directly-editable value. Clamps to
 * [min, max] and steps by `step`. onChange receives the clamped number.
 *
 * WAI-ARIA spinbutton: the value box is a native <input role="spinbutton">
 * carrying aria-valuenow/min/max. ↑/↓ step · PageUp/PageDown step ×10 ·
 * Home/End jump to min/max (when finite). The −/+ tickers are mouse
 * affordances outside the Tab order — the keyboard already has every step.
 * The ref, `id`, `name` and native events land on the input.
 *
 * Tailwind v4 (migrated Aug 2026). Ticker hover is a `enabled:hover:` class
 * instead of inline mouse handlers, and the shell rides h-control-* with the
 * rest of the control family.
 */
const SHELL_H = { sm: "h-control-sm", md: "h-control", lg: "h-control-lg" } as const;
const TICK_W = { sm: "w-[28px]", md: "w-[34px]", lg: "w-[40px]" } as const;
const FIELD_W = { sm: "w-[42px] text-sm", md: "w-[48px] text-base", lg: "w-[56px] text-md" } as const;

const SHELL =
  "inline-flex items-center max-w-full box-border overflow-hidden " +
  "border border-[var(--input-bdr)] rounded-md";

const TICK =
  "inline-flex items-center justify-center h-full shrink-0 border-none bg-transparent " +
  "text-[14px] transition-colors duration-fast " +
  "enabled:text-fg-secondary enabled:cursor-pointer enabled:hover:bg-surface-soft " +
  "disabled:text-fg-disabled disabled:cursor-not-allowed";

const FIELD =
  "flex-1 min-w-0 h-full border-none outline-none text-center " +
  "bg-transparent font-data font-semibold text-fg-primary";

export const QuantityStepper = forwardRef<HTMLInputElement, QuantityStepperProps>(function QuantityStepper({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  largeStep,
  disabled,
  error,
  required,
  id,
  size = "md",
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  style = {},
  className = "",
  onKeyDown,
  ...rest
}, ref) {
  const s = SHELL_H[size] ? size : "md";
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const [current, setCurrent] = useControllableState<number>({ value, defaultValue: defaultValue ?? clamp(0), onChange });
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-stepper"),
  );
  const num = Number(current) || 0;
  const set = (n: number) => { if (!f.disabled && !rest.readOnly) setCurrent(clamp(n)); };
  const big = largeStep ?? step * 10;

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const map: Record<string, number | undefined> = {
      ArrowUp: num + step, ArrowDown: num - step, PageUp: num + big, PageDown: num - big,
      Home: Number.isFinite(min) ? min : undefined, End: Number.isFinite(max) ? max : undefined,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    set(next);
  };

  const tick = (dir: -1 | 1, icon: string, dis: boolean, label: string) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      aria-controls={f.id}
      disabled={f.disabled || dis}
      onClick={() => set(num + dir * step)}
      className={[TICK, TICK_W[s]].join(" ")}
    >
      <i aria-hidden="true" className={"ph-bold " + icon} />
    </button>
  );

  return (
    <div
      className={[
        SHELL, SHELL_H[s],
        f.disabled ? "bg-[var(--input-bg-disabled)] opacity-60" : "bg-[var(--input-bg)]",
        f.invalid ? "border-status-error" : "",
        className,
      ].join(" ")}
      style={style}
    >
      {tick(-1, "ph-minus", num <= min, decrementLabel)}
      <input
        {...rest}
        ref={ref}
        id={f.id}
        type="text"
        inputMode="numeric"
        role="spinbutton"
        aria-valuenow={num}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-invalid={f.invalid || undefined}
        aria-describedby={f.describedBy}
        aria-labelledby={rest["aria-labelledby"]}
        value={current}
        disabled={f.disabled}
        required={f.required}
        onKeyDown={composeHandlers(onKeyDown, onKey)}
        onChange={(e) => { const raw = e.target.value.replace(/[^0-9-]/g, ""); if (raw === "" || raw === "-") { set(min); return; } const v = parseInt(raw, 10); set(isNaN(v) ? min : v); }}
        className={[FIELD, FIELD_W[s]].join(" ")}
        /* The two divider edges stay inline: `border-none` and `border-x` are the
           same conflict group and would resolve by emit order, not class order
           (README rule 5). */
        style={{ borderLeft: "1px solid var(--border-subtle)", borderRight: "1px solid var(--border-subtle)" }}
      />
      {tick(1, "ph-plus", num >= max, incrementLabel)}
    </div>
  );
});
