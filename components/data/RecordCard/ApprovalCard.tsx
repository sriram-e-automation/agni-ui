/**
 * @internal Preset renderer behind the public <RecordCard> — not part of the documented
 * API (no .d.ts, no specimen card). Use RecordCard with the matching preset.
 */
import React, { useState } from "react";
import { pressableProps } from "../../utils/interaction.tsx";
import { Avatar } from "../../primitives/Avatar/Avatar.tsx";

export interface ApprovalCategoryMeta { dept: string; icon: string; clr: string; }
export interface ApprovalCardProps {
  /** Record row: { id, owner, category, group, status, date }. */
  row: any;
  onView?: () => void;
  onQuickReject?: () => void;
  /** Persistent active ring (e.g. while its detail modal is open). */
  highlight?: boolean;
  /** Alias for `highlight` — the DS-wide word for record selection. */
  selected?: boolean;
  /** Category → { dept, icon, clr } strip meta. */
  categoryMeta?: Record<string, ApprovalCategoryMeta>;
  /** Category → request-type label. */
  typeByCategory?: Record<string, string>;
}

const DEFAULT_CAT_META: Record<string, ApprovalCategoryMeta> = {
  "Type A": { dept: "Procurement", icon: "ph-shopping-cart", clr: "var(--text-brand)" },
  "Type B": { dept: "Services", icon: "ph-gear", clr: "var(--status-warning)" },
  "Type C": { dept: "Materials", icon: "ph-package", clr: "var(--status-info)" },
  "Type D": { dept: "Maintenance", icon: "ph-wrench", clr: "var(--status-error)" },
  "Type E": { dept: "Travel", icon: "ph-airplane-tilt", clr: "var(--hue-violet)" },
};
const DEFAULT_TYPE_BY_CAT = { "Type A": "Purchase request", "Type B": "Service request", "Type C": "Material request", "Type D": "Maintenance request", "Type E": "Travel request" };

/**
 * AgniUI · ApprovalCard
 * Pending-approval card for workspace side panels: department strip, status
 * dot + request type, ID/date/requester grid, and ✗ quick-reject +
 * "Approve & assign" actions.
 */
export const ApprovalCard = React.forwardRef<HTMLDivElement, ApprovalCardProps>(function ApprovalCard({ row, onView, onQuickReject, highlight, selected, categoryMeta, typeByCategory }, ref) {
  highlight = selected || highlight;   /* `selected` is the DS-wide word */
  const [hov, setHov] = useState(false);
  const cats = categoryMeta || DEFAULT_CAT_META;
  const meta = cats[row.category] || Object.values(cats)[0];
  const reqType = (typeByCategory || DEFAULT_TYPE_BY_CAT)[row.category] || "Request";
  const dotClr = row.status === "In Review" ? "var(--status-info)" : "var(--status-warning)";
  const active = hov || highlight;
  const fLbl = { fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 3 };
  const fVal = { fontSize: "var(--text-xs)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  const fMono = { ...fVal, fontFamily: "var(--font-data)" };
  return (
    <div ref={ref as never} {...pressableProps(onView)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="outline-none focus-visible:focus-ring"
      style={{ background: highlight ? "var(--surface-brand-soft)" : "var(--surface-card)", border: "1.5px solid " + (active ? "var(--action-brand)" : "var(--border-subtle)"),
        borderRadius: "var(--radius-lg)", overflow: "hidden", cursor: "pointer", flexShrink: 0,
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast), background var(--dur-fast)",
        boxShadow: active ? "0 0 0 3px var(--surface-brand-soft)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", padding: "var(--space-2) var(--space-3) var(--space-2)", borderBottom: "1px solid var(--border-subtle)" }}>
        <i className={"ph " + meta.icon} style={{ fontSize: 14, color: meta.clr }} />
        <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-bold)", letterSpacing: "0.06em", textTransform: "uppercase", color: meta.clr }}>{meta.dept}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-3) 0" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotClr, flexShrink: 0 }} />
        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>{reqType}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3) var(--space-2)", padding: "var(--space-3) var(--space-3) var(--space-3)" }}>
        <div><div style={fLbl}>Request ID</div><div style={fMono}>{row.id}</div></div>
        <div><div style={fLbl}>Request date</div><div style={fMono}>{row.date}</div></div>
        <div style={{ minWidth: 0 }}><div style={fLbl}>Requested by</div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", minWidth: 0 }}>
            <Avatar name={row.owner} size="xs" />
            <span style={fVal}>{row.owner}</span>
          </div>
        </div>
        <div style={{ minWidth: 0 }}><div style={fLbl}>Requested for</div><div style={fVal}>{row.group}</div></div>
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)", padding: "0 var(--space-3) var(--space-3)" }}>
        <button type="button" title="Reject" onClick={(e) => { e.stopPropagation(); onQuickReject && onQuickReject(); }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 38, borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--status-error)", cursor: "pointer", flexShrink: 0, fontSize: 17, transition: "all var(--dur-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--status-error-soft)"; e.currentTarget.style.borderColor = "var(--status-error)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-card)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}>
          <i className="ph ph-x" />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onView && onView(); }}
          style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", height: 38, borderRadius: "var(--radius-md)", border: "none", background: "var(--action-brand)", color: "#fff", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", transition: "opacity var(--dur-fast)" , minWidth: 0}}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
          <i className="ph ph-check-circle" style={{ fontSize: 16 }} /> Approve &amp; assign
        </button>
      </div>
    </div>
  );
});
