import React from "react";

/* ── Types (mirrored in Switch.d.ts) ── */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
/** Boolean toggle switch. */

/**
 * AgniUI · Switch
 * Toggle control. onChange receives the next boolean.
 *
 * Tailwind v4 (migrated Aug 2026). Track and knob are fixed marks, not form-row
 * controls, so no --density-control-h. The knob offset is the one genuinely
 * computed value and stays inline.
 */
const TRACK = { sm: "w-[32px] h-[18px]", md: "w-[40px] h-[22px]" } as const;
const KNOB = { sm: "size-[14px]", md: "size-[18px]" } as const;
const KNOB_TOP = { sm: 2, md: 2 } as const;
const KNOB_ON = { sm: 32 - 14 - 2, md: 40 - 18 - 2 } as const;

export function Switch({
  checked = false,
  onChange,
  label = null,
  disabled = false,
  size = "md",     // sm | md
  style = {},
  className = "",
  ...rest
}: SwitchProps) {
  const s = TRACK[size] ? size : "md";
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
        className={[
          "relative shrink-0 rounded-full transition-colors duration-normal ease-standard",
          TRACK[s],
          checked ? "bg-action-brand" : "bg-line-strong",
        ].join(" ")}
      >
        <span
          className={[KNOB[s], "absolute rounded-full bg-[#fff] shadow-e-sm transition-[left] duration-normal ease-standard"].join(" ")}
          /* Knob travel is derived from the track geometry — runtime value. */
          style={{ top: KNOB_TOP[s], left: checked ? KNOB_ON[s] : 2 }}
        />
      </span>
      {label && <span className="text-base text-fg-primary">{label}</span>}
    </label>
  );
}
