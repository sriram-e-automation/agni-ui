import React from "react";
import { Tooltip } from "../../feedback/Tooltip/Tooltip.tsx";
import { roleAllows } from "../../utils/RoleGate.tsx";

/* ── Types (mirrored in BulkActionToolbar.d.ts) ── */
export interface BulkAction { label: React.ReactNode; icon?: string; onClick?: () => void; danger?: boolean; roles?: string[]; }
export interface BulkActionToolbarProps {
  /** Number of selected rows; toolbar hides at 0. */
  count?: number;
  actions?: BulkAction[];
  onClear?: () => void;
  role?: string;
  style?: React.CSSProperties;
}
/** Selection action bar for bulk operations over a table. */

/**
 * AgniUI · BulkActionToolbar
 * Appears when ≥1 row is selected. Shows the count, a clear button, and a row
 * of actions. Pin it above/below a DataTable.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7a). The bar sits on the INVERSE
 * surface, so its hover fill and danger text come from the -on-inverse tokens
 * rather than the normal state overlays.
 */
const BAR =
  "flex items-center gap-3 py-2 pr-3 pl-4 bg-surface-inverse text-fg-inverse rounded-md shadow-e-lg";
const ACTION =
  "inline-flex items-center gap-1 px-2 py-1 border-none bg-transparent cursor-pointer " +
  "font-sans text-sm font-medium rounded-sm opacity-[0.92] " +
  "transition-colors duration-fast hover:bg-[var(--state-hover-on-inverse)]";
const CLEAR =
  "size-[28px] border-none bg-transparent text-inherit cursor-pointer text-[16px] rounded-sm opacity-[0.8] " +
  "transition-colors duration-fast hover:bg-[var(--state-hover-on-inverse)]";

export const BulkActionToolbar = React.forwardRef<HTMLDivElement, BulkActionToolbarProps>(function BulkActionToolbar({ count = 0, actions = [], onClear, role = "", style = {} }, ref) {
  if (!count) return null;
  /* A bulk bar is the most destructive control in the system — an action the
     viewer may not perform must not be on it at all. */
  const allowed = actions.filter((a) => roleAllows(role, a.roles));
  return (
    <div ref={ref as never} className={BAR} style={{ animation: "agni-bulk-in var(--dur-normal) var(--ease-spring)", ...style }}>
      <span className="text-sm font-semibold"><span className="font-data">{count}</span> selected</span>
      <span className="w-px h-[20px] bg-current opacity-[0.25]" />
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {allowed.map((a, i) => (
          <button key={i} type="button" onClick={a.onClick}
            className={[ACTION, a.danger ? "text-[var(--status-error-on-inverse)]" : "text-inherit"].join(" ")}>
            {a.icon && <i className={["ph", a.icon, "text-[16px]"].join(" ")} />}{a.label}
          </button>
        ))}
      </div>
      <Tooltip label="Clear selection" side="top"><button type="button" onClick={onClear} aria-label="Clear selection" className={CLEAR}><i className="ph ph-x" /></button></Tooltip>
      <style>{`@keyframes agni-bulk-in{from{opacity:0;transform:translateY(8px)}}`}</style>
    </div>
  );
});
