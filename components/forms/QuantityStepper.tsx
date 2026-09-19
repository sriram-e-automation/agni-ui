import React from "react";

/* ── Types (mirrored in QuantityStepper.d.ts) ── */
export interface QuantityStepperProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
  className?: string;
}
/** Numeric stepper: − / + tickers plus a directly-editable, clamped value. */

/**
 * AgniUI · QuantityStepper
 * Numeric stepper with − / + tickers and a directly-editable value. Clamps to
 * [min, max] and steps by `step`. onChange receives the clamped number.
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

export function QuantityStepper({
  value = 0,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  size = "md",
  style = {},
  className = "",
}: QuantityStepperProps) {
  const s = SHELL_H[size] ? size : "md";
  const clamp = (n) => Math.max(min, Math.min(max, n));
  const set = (n) => { if (!disabled && onChange) onChange(clamp(n)); };

  const Tick = ({ dir, icon, dis }) => (
    <button
      type="button"
      tabIndex={-1}
      disabled={disabled || dis}
      onClick={() => set((Number(value) || 0) + dir * step)}
      className={[TICK, TICK_W[s]].join(" ")}
    >
      <i className={"ph-bold " + icon} />
    </button>
  );

  return (
    <div
      className={[
        SHELL, SHELL_H[s],
        disabled ? "bg-[var(--input-bg-disabled)] opacity-60" : "bg-[var(--input-bg)]",
        className,
      ].join(" ")}
      style={style}
    >
      <Tick dir={-1} icon="ph-minus" dis={Number(value) <= min} />
      <input
        type="text"
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(e) => { const raw = e.target.value.replace(/[^0-9-]/g, ""); if (raw === "" || raw === "-") { set(min); return; } const v = parseInt(raw, 10); set(isNaN(v) ? min : v); }}
        className={[FIELD, FIELD_W[s]].join(" ")}
        /* The two divider edges stay inline: `border-none` and `border-x` are the
           same conflict group and would resolve by emit order, not class order
           (README rule 5). */
        style={{ borderLeft: "1px solid var(--border-subtle)", borderRight: "1px solid var(--border-subtle)" }}
      />
      <Tick dir={1} icon="ph-plus" dis={Number(value) >= max} />
    </div>
  );
}
