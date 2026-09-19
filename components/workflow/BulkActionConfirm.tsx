/**
 * @internal Renderer behind the public <ConfirmModal> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState, useEffect } from "react";
import { Modal } from "../feedback/Modal.tsx";
import { Button } from "../core/Button.tsx";
import { Textarea } from "../forms/Textarea.tsx";
import { UserSelect } from "../forms/UserSelect.tsx";

/* ── Types (mirrored in BulkActionConfirm.d.ts) ── */
export interface BulkActionConfirmUser { id: string; name: string; team?: string; }
export interface BulkActionConfirmProps {
  open?: boolean;
  count?: number;
  title?: React.ReactNode;
  message?: React.ReactNode;
  /** "default" | "danger" (destructive styling). @default "default" */
  tone?: "default" | "danger";
  confirmLabel?: string;
  /** Phosphor icon class for confirm (without "ph " prefix). */
  confirmIcon?: string;
  /** Render an optional remark textarea. */
  remark?: boolean;
  remarkLabel?: React.ReactNode;
  remarkPlaceholder?: string;
  remarkRequired?: boolean;
  /** Provide a user list to render a required assignee picker. */
  assignees?: BulkActionConfirmUser[] | null;
  assignLabel?: React.ReactNode;
  onCancel?: () => void;
  /** Fires with the captured values once validation passes. */
  onConfirm?: (value: { remark: string; assignee: string | null }) => void;
  /** Submitting — disables both buttons and shows a spinner on confirm. */
  submitting?: boolean;
  /** Submit failed — renders an inline error banner above the fields. */
  error?: React.ReactNode;
}
/** Confirmation for a bulk action on N rows — optional remark + assignee, with validation. */


/**
 * AgniUI · BulkActionConfirm
 * Confirms a bulk action on N selected rows. Encapsulates the count-aware copy,
 * an optional remark field, and an optional assignee picker (for reassignment),
 * with built-in required-field validation. `onConfirm({ remark, assignee })`.
 *
 * Pair with BulkActionToolbar: the toolbar fires the action, this confirms it.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10a). The error banner and the
 * field-level validation line are the shared shapes across this family; the
 * banner is repeated verbatim in ReviewSubmitModal rather than extracted —
 * three lines of markup do not earn a shared component.
 */
const ERR_BANNER = "flex items-start gap-2 py-2 px-3 mb-3 bg-status-error-soft border border-status-error rounded-md text-status-error text-sm";
const FIELD_ERR = "text-xs text-status-error inline-flex items-center gap-1";
export function BulkActionConfirm({
  open,
  count = 0,
  title,
  message,
  tone = "default",          // "default" | "danger"
  confirmLabel = "Confirm",
  confirmIcon = "ph-check-circle",
  remark = false,
  remarkLabel = "Remarks",
  remarkPlaceholder = "",
  remarkRequired = false,
  assignees = null,          // array → renders a required UserSelect
  assignLabel = "New assignee",
  onCancel,
  onConfirm,
  submitting = false,
  error = null,
}: BulkActionConfirmProps) {
  const [remarkVal, setRemarkVal] = useState("");
  const [assignee, setAssignee]   = useState(null);
  const [tried, setTried]         = useState(false);
  useEffect(() => { if (open) { setRemarkVal(""); setAssignee(null); setTried(false); } }, [open]);
  if (!open) return null;

  const danger = tone === "danger";
  const missingAssignee = assignees && !assignee;
  const missingRemark   = remark && remarkRequired && !remarkVal.trim();
  const submit = () => { setTried(true); if (missingAssignee || missingRemark || submitting) return; onConfirm && onConfirm({ remark: remarkVal.trim(), assignee }); };

  return (
    <Modal open={open} onClose={submitting ? undefined : onCancel} danger={danger} size="md" title={title}
      footer={<>
        <Button category="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button category={danger ? "danger" : "primary"} icon={<i className={"ph " + confirmIcon} />} loading={submitting} onClick={submit}>{confirmLabel}</Button>
      </>}>
      {error && (
        <div className={ERR_BANNER}>
          <i className="ph-fill ph-warning-circle text-[16px] shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}
      {message && <p className="m-0 mb-3 text-sm text-fg-secondary leading-normal">{message}</p>}

      {assignees && (
        <div className={["flex flex-col gap-1", remark ? "mb-4" : "mb-1"].join(" ")}>
          <span className="text-sm font-medium text-fg-secondary">{assignLabel}</span>
          <UserSelect value={assignee} onChange={setAssignee} users={assignees} error={tried && missingAssignee} />
          {tried && missingAssignee && <span className={FIELD_ERR}><i className="ph-fill ph-warning-circle" /> Pick a person to assign these to.</span>}
        </div>
      )}

      {remark && (
        <div className="flex flex-col gap-1">
          <span className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-fg-secondary">{remarkLabel}</span>
            <span className={["text-xs", remarkRequired ? "text-status-error font-semibold" : "text-fg-tertiary font-normal"].join(" ")}>{remarkRequired ? "Required" : "Optional"}</span>
          </span>
          <Textarea value={remarkVal} onChange={setRemarkVal} rows={2} error={tried && missingRemark} placeholder={remarkPlaceholder} />
          {tried && missingRemark && <span className={FIELD_ERR}><i className="ph-fill ph-warning-circle" /> A reason is required.</span>}
        </div>
      )}
    </Modal>
  );
}
