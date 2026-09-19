/**
 * @internal Renderer behind the public <ConfirmModal> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React from "react";
import { Modal } from "../feedback/Modal.tsx";
import { Button } from "../core/Button.tsx";
import { Textarea } from "../forms/Textarea.tsx";

/* ── Types (mirrored in ReviewSubmitModal.d.ts) ── */
export interface ReviewSummaryRow { label: React.ReactNode; value: React.ReactNode; }
export interface ReviewSubmitModalProps {
  open?: boolean;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  /** Label/value rows shown in the summary card (values may be nodes). */
  summary?: ReviewSummaryRow[];
  note?: string;
  /** Provide to render the note field; omit to hide it. */
  onNoteChange?: (value: string) => void;
  noteLabel?: React.ReactNode;
  noteHint?: React.ReactNode;
  notePlaceholder?: string;
  optional?: boolean;
  backLabel?: string;
  confirmLabel?: string;
  /** Phosphor icon class for the confirm button (without "ph " prefix). */
  confirmIcon?: string;
  onBack?: () => void;
  onConfirm?: () => void;
  /** Submitting — disables both buttons and shows a spinner on confirm. */
  submitting?: boolean;
  /** Submit failed — renders an inline error banner above the actions. */
  error?: React.ReactNode;
}
/** Pre-submit review dialog — summary card + optional note + confirm. */


/**
 * AgniUI · ReviewSubmitModal
 * The second step of a two-step commit: confirm a record summary and capture an
 * optional note before filing. Generic — pass a `summary` array of label/value
 * rows (values may be nodes: avatars, badges, dots) and wire the note field.
 *
 * summary: [{ label, value }]
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10a). Nothing here is runtime-
 * computed, so the file carries no inline styles at all.
 */
const ROW_LABEL = "text-xs text-fg-tertiary tracking-wide uppercase";
const ROW_VAL = "text-sm text-fg-primary font-medium text-right inline-flex items-center justify-end gap-1";
export function ReviewSubmitModal({
  open,
  title = "Review and submit",
  intro = "Confirm the details below, then submit.",
  summary = [],
  note = "",
  onNoteChange,
  noteLabel = "Note",
  noteHint,
  notePlaceholder = "",
  optional = true,
  backLabel = "Back",
  confirmLabel = "Submit",
  confirmIcon = "ph-paper-plane-tilt",
  onBack,
  onConfirm,
  submitting = false,
  error = null,
}: ReviewSubmitModalProps) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={submitting ? undefined : onBack} title={title} size="md"
      footer={<>
        <Button category="secondary" icon={<i className="ph ph-arrow-left" />} onClick={onBack} disabled={submitting}>{backLabel}</Button>
        <Button category="primary" icon={<i className={"ph " + confirmIcon} />} loading={submitting} onClick={onConfirm}>{confirmLabel}</Button>
      </>}>
      <p className="m-0 mb-3 text-sm text-fg-secondary leading-normal">{intro}</p>
      {error && (
        <div className="flex items-start gap-2 py-2 px-3 mb-3 bg-status-error-soft border border-status-error rounded-md text-status-error text-sm">
          <i className="ph-fill ph-warning-circle text-[16px] shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-4 items-center py-3 px-4 bg-surface-soft border border-line-subtle rounded-md">
        {summary.map((r, i) => (
          <React.Fragment key={i}>
            <span className={ROW_LABEL}>{r.label}</span>
            <span className={ROW_VAL}>{r.value}</span>
          </React.Fragment>
        ))}
      </div>

      {onNoteChange && (
        <div className="mt-4 flex flex-col gap-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-fg-secondary">{noteLabel}</span>
            <span className="text-xs text-fg-tertiary">{optional ? "Optional" : "Required"}</span>
          </span>
          <Textarea value={note} onChange={onNoteChange} rows={3} placeholder={notePlaceholder} />
          {noteHint && <span className="text-xs text-fg-tertiary">{noteHint}</span>}
        </div>
      )}
    </Modal>
  );
}
