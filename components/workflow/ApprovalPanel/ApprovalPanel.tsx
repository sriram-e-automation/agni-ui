import React from "react";
import { Card } from "../../containment/Card/Card.tsx";
import { Tag } from "../../primitives/Tag/Tag.tsx";
import { ApprovalStepper } from "../ApprovalStepper/ApprovalStepper.tsx";
import { AuditTrail } from "../AuditTrail/AuditTrail.tsx";
import { Textarea } from "../../primitives/Textarea/Textarea.tsx";
import { renderActions, visibleActions } from "../../utils/actionSpec.tsx";
import { DataState } from "../../utils/DataState.tsx";

/**
 * AgniUI · ApprovalPanel
 * The approval block that sits on a record page: current stage + stepper,
 * the decision actions the viewer's role can take, an optional comment field
 * the decision carries, and the audit trail beneath.
 *
 * RecordDetailModal composes the same three parts inside a dialog. This is the
 * in-page form of it — the two must not drift, so both read ApprovalStepper and
 * AuditTrail rather than drawing their own.
 *
 * Decisions are declarative: `decisions` is an ActionSpec list, so a role that
 * can only recommend sees Recommend, and a role that can approve sees Approve /
 * Reject / Hold. `requireComment` blocks the decision until the note is filled,
 * which is how a rejection reason is enforced without a second dialog.
 */
const HEAD = "flex flex-wrap items-center justify-between gap-2";
const EYEBROW = "text-2xs font-data font-semibold tracking-wide uppercase text-fg-tertiary";
const STAGE = "font-sans text-base font-semibold text-fg-primary m-0";
const SECTION = "flex flex-col gap-2 pt-4 mt-4 border-t border-line-subtle";
const NOTE = "text-xs text-fg-tertiary m-0";

export const ApprovalPanel = React.forwardRef<HTMLElement, any>(function ApprovalPanel({
  title = "Approval",
  steps = [],
  orientation = "horizontal",
  interactive = true,
  status,
  stage,
  decisions = [],
  comment,
  onCommentChange,
  commentPlaceholder = "Add a note for the next approver",
  requireComment = false,
  showComment = true,
  entries = [],
  showAudit = true,
  auditTitle = "Activity",
  role = "",
  readOnly = false,
  submitting = false,
  loading = false,
  error,
  onRetry,
  empty,
  style = {},
}, ref) {
  const [local, setLocal] = React.useState("");
  const value = comment !== undefined ? comment : local;
  const setValue = (v: string) => { onCommentChange ? onCommentChange(v) : setLocal(v); };

  const available = visibleActions(decisions, role);
  const blocked = requireComment && !String(value || "").trim();
  const specs = available.map(d => ({
    ...d,
    disabled: d.disabled || readOnly || submitting || (blocked && d.kind !== "ghost" && d.kind !== "tertiary"),
    disabledReason: blocked && !d.disabled ? "Add a note before deciding" : d.disabledReason,
    loading: submitting && d.loading !== false && d.kind === "primary",
  }));

  const body = (
    <div className="flex flex-col gap-3" style={{ opacity: readOnly ? 0.72 : 1 }}>
      <div className={HEAD}>
        <div className="flex flex-col gap-[2px] min-w-0">
          <span className={EYEBROW}>{title}</span>
          {stage && <h3 className={STAGE}>{stage}</h3>}
        </div>
        {status && <Tag variant="status" status={status} size="md">{status}</Tag>}
      </div>

      {steps.length > 0 && <ApprovalStepper steps={steps} orientation={orientation} interactive={interactive} />}

      {showComment && specs.length > 0 && (
        <div className="flex flex-col gap-1">
          <Textarea value={value} onChange={setValue} rows={3} placeholder={commentPlaceholder} disabled={readOnly || submitting} />
          {requireComment && <p className={NOTE}>A note is required before this decision can be recorded.</p>}
        </div>
      )}

      {specs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {renderActions(specs, { role, size: "md", keyPrefix: "ap" })}
        </div>
      )}

      {showAudit && (
        <div className={SECTION}>
          <span className={EYEBROW}>{auditTitle}</span>
          <AuditTrail entries={entries} empty="No activity yet" />
        </div>
      )}
    </div>
  );

  return (
    <Card ref={ref as never} style={style}>
      <DataState loading={loading} error={error} onRetry={onRetry} empty={empty} isEmpty={!!empty && steps.length === 0 && entries.length === 0} shape="approvalStepper">
        {body}
      </DataState>
    </Card>
  );
});
