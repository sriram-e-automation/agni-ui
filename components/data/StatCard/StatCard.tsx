import { resolveDataState } from "../../utils/DataState.tsx";
import React from "react";
import { pressableProps } from "../../utils/interaction.tsx";

/* Tailwind v4 (migrated Aug 2026, tranche 7a). `tone` also accepts a raw CSS
   colour (the old escape hatch), so the icon/dot tint stays an inline value
   resolved from this map — the shell, type and layout are classes. */
const TONES = {
  brand:   "var(--text-brand)",
  success: "var(--status-success)",
  warning: "var(--status-warning)",
  error:   "var(--status-error)",
  info:    "var(--status-info)",
  pending: "var(--status-pending)",
  neutral: "var(--text-tertiary)",
};

const SHELL = "bg-surface-card border rounded-lg p-3 flex flex-col gap-2";
const SHELL_ON = "border-line-brand shadow-e-sm";
const SHELL_OFF = "border-line-subtle shadow-e-xs";

function StatCardBody({ forwardedRef, label, value, total, tone = "brand", icon, captions, remainingLabel, onClick, selected, style }) {
  const c = TONES[tone] || tone;
  const rows = captions || (total != null && remainingLabel
    ? [{ label: "Taken", value: value }, { label: remainingLabel, value: Math.max(Number(total) - Number(value), 0) }]
    : null);
  const interactive = !!onClick;
  return (
    <div ref={forwardedRef as never} {...pressableProps(interactive ? onClick : null)}
      className={[SHELL, selected ? SHELL_ON : SHELL_OFF, interactive ? "cursor-pointer hover:border-line-brand transition-[border-color,box-shadow] duration-fast" : "cursor-default"].join(" ")}
      style={style}>
      <div className="flex items-center gap-2">
        {icon
          ? <i className={["ph", icon, "text-[15px] shrink-0"].join(" ")} style={{ color: c }} />
          : <span className="size-[8px] rounded-full shrink-0" style={{ background: c }}></span>}
        <span className="text-xs font-semibold text-fg-secondary">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-data font-semibold text-fg-primary leading-none">{value}</span>
        {total != null && <span className="text-xs font-data text-fg-tertiary">/ {total}</span>}
      </div>
      {rows && (
        <div className="flex gap-3 flex-wrap text-2xs text-fg-tertiary">
          {rows.map((r, i) => (
            <span key={i}>{r.label} · <span className="font-data text-fg-secondary">{r.value}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}

/* State contract — a single value has no "empty", so loading and error only. */
export const StatCard = React.forwardRef<HTMLElement, any>(function StatCard(props, ref) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    shape: "stat", height: 86,
  });
  if (state !== false) return <div ref={ref as never} className="w-full" style={props.style || {}}>{state}</div>;
  return <StatCardBody {...props} forwardedRef={ref} />;
});
