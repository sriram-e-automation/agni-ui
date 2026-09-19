import { resolveDataState } from "../feedback/DataState.tsx";
import React from "react";

/* ── Types (mirrored in AuditTrail.d.ts) ── */
export interface AuditEntry {
  actor: string;
  action: React.ReactNode;
  ts: string;
  detail?: React.ReactNode;
  icon?: string;
  tone?: "default" | "success" | "warning" | "error" | "info";
}
export interface AuditTrailProps {
  entries?: AuditEntry[];
  style?: React.CSSProperties;
}
/** Read-only chronological activity / audit log. */


/**
 * AgniUI · AuditTrail
 * Chronological activity log. entries: [{actor, action, ts, detail?, icon?, tone?}].
 * Read-only timeline for record history / compliance.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10b). Five tones, five complete
 * class strings — the tone only ever colours the node icon.
 */
const TONE = {
  default: "text-fg-tertiary", success: "text-status-success", warning: "text-status-warning",
  error: "text-status-error", info: "text-status-info",
};

function AuditTrailBody({ entries = [], style = {} }) {
  return (
    <div style={style}>
      {entries.map((e, i) => {
        const last = i === entries.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <span className={["size-[26px] rounded-full bg-surface-soft border border-line-subtle inline-flex items-center justify-center text-[13px]", TONE[e.tone] || TONE.default].join(" ")}>
                <i className={"ph " + (e.icon || "ph-circle")} />
              </span>
              {!last && <span className="w-[2px] flex-1 min-w-0 min-h-[18px] bg-line-subtle my-[2px]" />}
            </div>
            <div className={["min-w-0", last ? "pb-0" : "pb-4"].join(" ")}>
              <div className="text-sm text-fg-primary">
                <strong className="font-semibold">{e.actor}</strong>{" "}
                <span className="text-fg-secondary">{e.action}</span>
              </div>
              {e.detail && <div className="text-xs text-fg-tertiary mt-[2px]">{e.detail}</div>}
              <div className="text-2xs text-fg-tertiary font-data mt-[3px]">{e.ts}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* State contract — error → loading → empty → content, resolved by
   resolveDataState so the precedence matches every other data component. */
export function AuditTrail(props) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.entries && props.entries.length), empty: props.empty,
    shape: "list", rows: props.loadingRows || 5,
    emptyIcon: "ph-clock-counter-clockwise", emptyTitle: "No activity yet",
  });
  if (state !== false) return <div className="w-full" style={props.style || {}}>{state}</div>;
  return <AuditTrailBody {...props} />;
}
