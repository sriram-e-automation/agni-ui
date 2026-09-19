/**
 * @internal Preset renderer behind the public <RecordCard> — not part of the documented
 * API (no .d.ts, no specimen card). Use RecordCard with the matching preset.
 */
import React, { useState } from "react";
import { Avatar } from "../core/Avatar.tsx";
import { Badge } from "../core/Badge.tsx";
import { Button } from "../core/Button.tsx";
import { Tooltip } from "../feedback/Tooltip.tsx";
import { BulkActionConfirm } from "../workflow/BulkActionConfirm.tsx";

/* ── Types (mirrored in KanbanCard.d.ts) ── */
export type KanbanStatus =
  | "Approvals"
  | "Yet to start"
  | "In progress"
  | "Overdue"
  | "Completed"
  | "Rejected";

export interface KanbanCardApp {
  name: string;
  /** Phosphor icon name, e.g. "ph-shopping-cart" */
  icon?: string;
}

export interface KanbanCardPerson {
  id?: string;
  name: string;
}

export interface KanbanCardProps {
  /** Drives the accent tint, the status badge, and which footer variant renders. */
  status?: KanbanStatus;
  /** Section 1 — optional application identity (name + icon). Include in GLOBAL request views; omit inside a single application. */
  app?: KanbanCardApp | null;
  /** Render the status pill in the type row. Needed in card view & mobile, where the kanban column doesn't carry the status. */
  showStatus?: boolean;
  /** Section 2 — the request / process type, e.g. "Purchase request". */
  requestType?: string;
  /** Section 3 — record meta. */
  id?: string;
  date?: string;
  requestedBy?: string;
  /** Project or crew name the request is raised for. */
  requestedFor?: string;
  priority?: "High" | "Med" | "Low" | null;

  /** Section 4 — owner shown for Yet to start / In progress / Overdue / Completed. */
  assignee?: string | KanbanCardPerson | null;
  assignedOn?: string;   // Yet to start
  startedOn?: string;    // In progress
  dueSince?: string;     // Overdue
  completedOn?: string;  // Completed
  /** Day count rendered alongside the date (in / over / taken). */
  days?: number | null;
  /** Rejected status only. */
  rejectedBy?: string | KanbanCardPerson | null;

  /** People list for the "Approve & assign" picker (Approvals status). */
  assignees?: KanbanCardPerson[] | null;
  /** Fired after the Approve & assign confirmation modal is confirmed. */
  onApprove?: (payload: { assignee: string | null; remark: string }) => void;
  /** Fired after the Reject confirmation modal is confirmed. */
  onReject?: (payload: { remark: string }) => void;
  onClick?: () => void;
  /** An action is in flight — footer actions show a spinner and lock. */
  busy?: boolean;
  /** Read-only card (viewer role): footer actions removed, card stays readable. */
  disabled?: boolean;
  /** Selection ring (bulk select / open in a side pane). */
  selected?: boolean;
  style?: React.CSSProperties;
}

/**
 * AgniUI · KanbanCard
 * Generic board card for any process / request / application. Sections are
 * divided by hairline separators — (1) optional application identity,
 * (2) request type, (3) record details (eyebrow + value, two columns),
 * (4) a status-driven footer. The status selects the footer variant:
 *
 *   Approvals     → "Approve & assign" + "Reject" (open DS confirm modal)
 *   Yet to start  → Assigned to · Assigned on
 *   In progress   → Assigned to · Started <date> (N days in)
 *   Overdue       → Assigned to · Due since <date> (N days over)
 *   Completed     → Assigned to · Completed <date> (N days taken)
 *   Rejected      → Rejected by
 *
 * Variants
 *   app          — include the application identity row. Use in GLOBAL request
 *                  views; omit when the card already sits inside one application.
 *   showStatus   — render the status pill in the type row. Needed in CARD view
 *                  and MOBILE, where the kanban column doesn't carry the status.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7d). The `hover` useState is gone —
 * hover is `hover:`, guarded off `selected` exactly as the old ternary was.
 * `tok(status, …)` and the priority-dot colour stay inline: both are runtime
 * lookups keyed by the `status` prop (a --kanban-* token per status group),
 * not a fixed set of classes.
 */
const GROUP = {
  "Approvals":"approvals", "Yet to start":"todo", "In progress":"progress",
  "Overdue":"overdue", "Completed":"done", "Rejected":"rejected",
};
const BADGE = {
  "Approvals":"pending", "Yet to start":"todo", "In progress":"doing",
  "Overdue":"warning", "Completed":"done", "Rejected":"error",
};
const tok = (status, k) => `var(--kanban-${GROUP[status] || "todo"}-${k})`;
const PRI = { High:"var(--status-error)", Med:"var(--status-warning)", Low:"var(--status-success)" };

const Sep = () => <div className="h-px bg-line-subtle -mx-3" />;

function Detail({ label, children }) {
  return (
    <div className="flex flex-col gap-[3px] min-w-0">
      <span className="text-2xs font-semibold tracking-wide uppercase text-fg-tertiary">{label}</span>
      <span className="flex items-center gap-1 min-w-0">{children}</span>
    </div>
  );
}

function ActorRow({ label, name, tone }) {
  if (!name) return null;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar name={name} size="xs" className="size-[20px] text-[10px]" />
      <span className="text-2xs text-fg-tertiary shrink-0">{label}</span>
      <span className="text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: tone || "var(--text-primary)" }}>{name}</span>
    </div>
  );
}

function TimeFact({ icon, label, date, days, suffix, tone }) {
  if (!date) return null;
  const dayTxt = days == null ? "" : `  ·  ${days} day${days === 1 ? "" : "s"} ${suffix}`;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <i className={["ph", icon, "text-[14px] shrink-0"].join(" ")} style={{ color: tone || "var(--text-tertiary)" }} />
      <span className="text-2xs text-fg-tertiary shrink-0">{label}</span>
      <span className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: tone || "var(--text-secondary)" }}>{date}{dayTxt}</span>
    </div>
  );
}

function Footer({ status, assignee, assignedOn, startedOn, dueSince, completedOn, days, rejectedBy, onApprove, onReject, busy, disabled }) {
  const name = (p) => (p ? (typeof p === "string" ? p : p.name) : null);

  if (status === "Approvals") {
    return (
      <div className="flex gap-2 items-stretch">
        <Button category="secondary" size="sm" onClick={onReject} title="Reject" disabled={busy || disabled}
          icon={<i className="ph ph-x" />} className="shrink-0 px-3 text-status-error" />
        <Button category="primary" size="sm" onClick={onApprove} loading={busy} disabled={disabled}
          icon={<i className="ph ph-check" />} className="flex-1 min-w-0">Approve &amp; assign</Button>
      </div>
    );
  }
  if (status === "Yet to start") {
    return <div className="flex flex-col gap-2"><ActorRow label="Assigned to" name={name(assignee)} /><TimeFact icon="ph-calendar-blank" label="Assigned on" date={assignedOn} /></div>;
  }
  if (status === "In progress") {
    return <div className="flex flex-col gap-2"><ActorRow label="Assigned to" name={name(assignee)} /><TimeFact icon="ph-play-circle" label="Started" date={startedOn} days={days} suffix="in" /></div>;
  }
  if (status === "Overdue") {
    return <div className="flex flex-col gap-2"><ActorRow label="Assigned to" name={name(assignee)} /><TimeFact icon="ph-warning-circle" label="Due since" date={dueSince} days={days} suffix="over" tone="var(--status-error)" /></div>;
  }
  if (status === "Completed") {
    return <div className="flex flex-col gap-2"><ActorRow label="Assigned to" name={name(assignee)} /><TimeFact icon="ph-check-circle" label="Completed" date={completedOn} days={days} suffix="taken" tone="var(--status-success)" /></div>;
  }
  if (status === "Rejected") {
    return <div className="flex flex-col gap-2"><ActorRow label="Rejected by" name={name(rejectedBy)} tone="var(--status-error)" /></div>;
  }
  return null;
}

const CARD = "flex flex-col shrink-0 relative bg-surface-card rounded-lg overflow-hidden font-sans border transition-[box-shadow,border-color,opacity] duration-fast ease-standard";
const CARD_SEL = "border-line-brand outline outline-1 outline-line-brand shadow-e-xs";
const CARD_OFF = "border-line-subtle outline-none shadow-e-xs hover:border-line-default hover:shadow-e-md";

export function KanbanCard({
  status = "Yet to start",
  app = null,
  showStatus = false,
  requestType = "Request",
  id,
  date,
  requestedBy,
  requestedFor,
  priority = null,
  assignee = null,
  assignedOn, startedOn, dueSince, completedOn,
  days = null,
  rejectedBy = null,
  assignees = null,
  onApprove,
  onReject,
  onClick,
  busy = false,
  disabled = false,
  selected = false,
  style = {},
}: KanbanCardProps) {
  const [modal, setModal] = useState(null);   // null | "approve" | "reject"
  const people = assignees || [];

  return (
    <>
      <div
        onClick={onClick}
        aria-busy={busy || undefined}
        className={[CARD, selected ? CARD_SEL : CARD_OFF, onClick ? "cursor-pointer" : "cursor-default"].join(" ")}
        style={{ opacity: busy ? 0.86 : 1, ...style }}>
        <div className="p-3 flex flex-col gap-3">

          {app && (
            <>
              <div className="flex items-center gap-1">
                {app.icon && <i className={["ph", app.icon, "text-[13px]"].join(" ")} style={{ color: tok(status, "label") }} />}
                <span className="text-2xs font-semibold tracking-wide uppercase" style={{ color: tok(status, "label") }}>{app.name}</span>
              </div>
              <Sep />
            </>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              {priority && <Tooltip label={priority} side="top"><span aria-label={priority} className="size-[7px] rounded-full shrink-0" style={{ background: PRI[priority] || "var(--text-tertiary)" }} /></Tooltip>}
              <span className="text-sm font-semibold text-fg-primary leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap">{requestType}</span>
            </span>
            {showStatus && <Badge tone={BADGE[status] || "todo"} dot size="sm" className="shrink-0">{status}</Badge>}
          </div>

          <Sep />

          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            {id   && <Detail label="Request ID"><span className="text-xs font-data text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap">{id}</span></Detail>}
            {date && <Detail label="Request date"><span className="text-xs font-data text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap">{date}</span></Detail>}
            {requestedBy && (
              <Detail label="Requested by">
                <Avatar name={requestedBy} size="xs" className="size-[18px] text-[8px]" />
                <span className="text-xs text-fg-secondary overflow-hidden text-ellipsis whitespace-nowrap">{requestedBy}</span>
              </Detail>
            )}
            {requestedFor && <Detail label="Requested for"><span className="text-xs text-fg-secondary overflow-hidden text-ellipsis whitespace-nowrap">{requestedFor}</span></Detail>}
          </div>

          <Sep />
          <Footer
            status={status} assignee={assignee}
            assignedOn={assignedOn} startedOn={startedOn} dueSince={dueSince} completedOn={completedOn}
            days={days} rejectedBy={rejectedBy} busy={busy} disabled={disabled}
            onApprove={(e) => { e && e.stopPropagation(); setModal("approve"); }}
            onReject={(e) => { e && e.stopPropagation(); setModal("reject"); }}
          />
        </div>
      </div>

      <BulkActionConfirm
        open={modal === "approve"}
        count={1}
        title="Approve & assign request"
        message={<>Approve <strong style={{ color:"var(--text-primary)" }}>{requestType}{id ? ` (${id})` : ""}</strong> and assign it to an owner to begin work.</>}
        assignees={people}
        assignLabel="Assign to"
        confirmLabel="Approve & assign"
        confirmIcon="ph-check"
        remark remarkLabel="Note (optional)" remarkPlaceholder="Anything the assignee should know…"
        onCancel={() => setModal(null)}
        onConfirm={(payload) => { setModal(null); onApprove && onApprove(payload); }}
      />

      <BulkActionConfirm
        open={modal === "reject"}
        count={1}
        tone="danger"
        title="Reject request"
        message={<>Reject <strong style={{ color:"var(--text-primary)" }}>{requestType}{id ? ` (${id})` : ""}</strong>. The requester is notified with your reason.</>}
        confirmLabel="Reject request"
        confirmIcon="ph-x-circle"
        remark remarkLabel="Reason" remarkRequired remarkPlaceholder="Why is this being rejected?"
        onCancel={() => setModal(null)}
        onConfirm={(payload) => { setModal(null); onReject && onReject(payload); }}
      />
    </>
  );
}
