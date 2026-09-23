import React from "react";
import { resolveDataState } from "../feedback/DataState.tsx";

/* Tone vocabulary matches StatusChip / Badge, so an event's colour and a
   record's status colour never drift apart.
   Tailwind v4 (migrated Aug 2026, tranche 7a): tones are COMPLETE class
   strings — never assembled from the tone name. */
const TONES = {
  brand:   { row: "border-l-line-brand bg-surface-brand-soft",       tx: "text-fg-brand" },
  success: { row: "border-l-status-success bg-status-success-soft",  tx: "text-status-success-ink" },
  warning: { row: "border-l-status-warning bg-status-warning-soft",  tx: "text-status-warning-ink" },
  error:   { row: "border-l-status-error bg-status-error-soft",      tx: "text-status-error-ink" },
  info:    { row: "border-l-status-info bg-status-info-soft",        tx: "text-status-info-ink" },
  pending: { row: "border-l-status-pending bg-status-pending-soft",  tx: "text-status-pending-ink" },
  neutral: { row: "border-l-line-default bg-surface-soft",           tx: "text-fg-secondary" },
};
const ROW = "border-0 border-l-[3px] rounded-sm p-2 flex items-start gap-2";

export function EventRow({ label, time, meta, tone = "brand", icon, trailing, onClick, loading, style }) {
  const state = resolveDataState({ loading, shape: "eventRow" });
  if (state !== false) return <div style={style}>{state}</div>;
  const t = TONES[tone] || TONES.brand;
  return (
    <div onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={[ROW, t.row, onClick ? "cursor-pointer" : "cursor-default"].join(" ")} style={style}>
      {icon && <i className={["ph", icon, "text-[15px] shrink-0 mt-px", t.tx].join(" ")} />}
      <div className="flex-1 min-w-0">
        <div className={["text-sm font-medium", t.tx].join(" ")}>{label}</div>
        {(time || meta) && (
          <div className="text-2xs font-data text-fg-secondary mt-[2px] flex gap-2 flex-wrap">
            {time && <span>{time}</span>}
            {meta && <span>{meta}</span>}
          </div>
        )}
      </div>
      {trailing}
    </div>
  );
}
