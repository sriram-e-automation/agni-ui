import React from "react";

/* ── Types (mirrored in Progress.d.ts) ── */
export interface ProgressProps {
  /** 0–100 */
  value?: number;
  indeterminate?: boolean;
  tone?: "brand" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  label?: React.ReactNode;
  showValue?: boolean;
  style?: React.CSSProperties;
}
/** Linear progress / loading bar. */

/**
 * AgniUI · Progress
 * Linear determinate/indeterminate bar. value 0–100. tone matches status set.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 4). The determinate fill's WIDTH is
 * the one inline declaration left: it is the value, computed per render, and a
 * class cannot carry it. Everything theme-related — tone, track, radius — is a
 * class, and the indeterminate keyframes stay local to the component.
 */
const TONE = {
  brand:   "bg-action-brand",
  success: "bg-status-success",
  warning: "bg-status-warning",
  error:   "bg-status-error",
  info:    "bg-status-info",
} as const;
const TRACK_H = { sm: "h-[4px]", md: "h-[6px]", lg: "h-[10px]" } as const;

const HEAD = "flex justify-between mb-1 text-xs";
const TRACK = "w-full bg-surface-sunken rounded-full overflow-hidden";
const FILL = "h-full rounded-full";

export function Progress({ value = 0, indeterminate = false, tone = "brand", size = "md", label = null, showValue = false, style = {} }: ProgressProps) {
  const color = TONE[tone] || TONE.brand;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full" style={style}>
      {(label || showValue) && (
        <div className={HEAD}>
          {label && <span className="text-fg-secondary font-medium">{label}</span>}
          {showValue && <span className="text-fg-tertiary font-data">{pct}%</span>}
        </div>
      )}
      <div className={[TRACK, TRACK_H[size] || TRACK_H.md].join(" ")}>
        {indeterminate
          ? <div className={[FILL, color, "w-[40%]"].join(" ")} style={{ animation: "agni-prog 1.3s var(--ease-standard) infinite" }} />
          : <div className={[FILL, color, "transition-[width] duration-normal ease-standard"].join(" ")} style={{ width: pct + "%" }} />}
      </div>
      <style>{`@keyframes agni-prog{0%{margin-left:-40%}100%{margin-left:100%}}`}</style>
    </div>
  );
}
