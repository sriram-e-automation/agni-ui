import React from "react";
import { SubmitConfirmModal } from "./SubmitConfirmModal.tsx";
import { DiscardConfirmModal } from "./DiscardConfirmModal.tsx";
import { ReviewSubmitModal } from "./ReviewSubmitModal.tsx";
import { BulkActionConfirm } from "./BulkActionConfirm.tsx";
import { ImportRecordsModal } from "./ImportRecordsModal.tsx";

/**
 * AgniUI · ConfirmModal
 * One dialog for every confirm-and-commit moment. `variant` picks the shape;
 * the five former action-named modals remain as internal renderers.
 *   review — summary + optional note, before committing
 *   submitted — the outcome: success mark, record id, summary
 *   discard — unsaved work: choice rows + keep editing
 *   bulk — N rows: optional remark and assignee, validated
 *   import — file import: expected columns, template, dropzone
 */
export const ConfirmModal = React.forwardRef<HTMLElement, any>(function ConfirmModal({ variant = "review", ...p }, ref) {
  if (variant === "submitted") return <SubmitConfirmModal ref={ref as never} {...p} />;
  if (variant === "discard") return <DiscardConfirmModal ref={ref as never} {...p} />;
  if (variant === "bulk") return <BulkActionConfirm ref={ref as never} {...p} />;
  if (variant === "import") return <ImportRecordsModal ref={ref as never} {...p} />;
  return <ReviewSubmitModal ref={ref as never} {...p} />;
});
