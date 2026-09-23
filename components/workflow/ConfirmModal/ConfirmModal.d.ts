import * as React from "react";

export interface ConfirmSummaryRow { label: React.ReactNode; value: React.ReactNode; }
export interface ConfirmChoice {
  icon: string;
  tone?: "brand" | "danger";
  title: React.ReactNode;
  desc?: React.ReactNode;
  onClick?: () => void;
}
export interface ConfirmUser { id: string; name: string; team?: string; }
export interface ConfirmImportColumn { name: string; type: string; req: boolean; eg?: string; }

export interface ConfirmModalProps {
  /**
   * Which moment this is. @default "review"
   *   review — check the summary before committing
   *   submitted — the outcome, after the commit landed
   *   discard — unsaved work, offer a way to keep it
   *   bulk — one action across N selected rows
   *   import — bring records in from a file
   */
  variant?: "review" | "submitted" | "discard" | "bulk" | "import";
  open?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  title?: React.ReactNode;
  message?: React.ReactNode;

  /** review — intro line above the summary. */
  intro?: React.ReactNode;
  /** review — label/value rows in the summary card. */
  summary?: ConfirmSummaryRow[];
  /** review — note field: provide the handler to render it. */
  note?: string;
  onNoteChange?: (value: string) => void;
  noteLabel?: React.ReactNode;
  noteHint?: React.ReactNode;
  notePlaceholder?: string;
  optional?: boolean;
  backLabel?: string;
  onBack?: () => void;

  /** submitted — the committed record ({ id, ...values }); null hides the modal. */
  data?: any;
  /** submitted — "View record" action. */
  onView?: () => void;
  /** submitted / record forms — option catalogs used to resolve labels. */
  options?: { types?: any[]; priorities?: any[]; sites?: any[]; people?: any[] };

  /** discard — full-width choice rows (e.g. Save as draft · Discard). */
  choices?: ConfirmChoice[];
  /** discard — dismiss label. */
  keepLabel?: string;
  onKeepEditing?: () => void;

  /** bulk — how many rows the action covers. */
  count?: number;
  /** bulk — destructive styling. @default "default" */
  tone?: "default" | "danger";
  confirmLabel?: string;
  /** Phosphor icon class for the confirm button (without the "ph " prefix). */
  confirmIcon?: string;
  /** bulk — remark textarea. */
  remark?: boolean;
  remarkLabel?: React.ReactNode;
  remarkPlaceholder?: string;
  remarkRequired?: boolean;
  /** bulk — roster renders a required assignee picker. */
  assignees?: ConfirmUser[] | null;
  assignLabel?: React.ReactNode;
  /** bulk / review — fires once validation passes. */
  onConfirm?: (value?: { remark: string; assignee: string | null }) => void;
  /** bulk / review — submitting; disables actions and spinners the confirm button. */
  submitting?: boolean;
  /** bulk / review / import — the action failed; renders an inline error banner. */
  error?: React.ReactNode;

  /** import — expected-column reference table. */
  columns?: ConfirmImportColumn[];
  /** import — CSV offered by "Download template". */
  templateCsv?: string;
  templateFilename?: string;
  /** import — accepted extensions. @default ".csv,.xlsx,.xls" */
  accept?: string;
  /** import — called with the File once the import completes. */
  onImported?: (file: File) => void;
}

/**
 * AgniUI · ConfirmModal
 * The one confirm-and-commit dialog. Variants cover the five moments a desk
 * needs: review before commit, the outcome after it, unsaved work, a bulk
 * action across N rows, and a file import.
 *
 * Merged Aug 2026 — supersedes ReviewSubmitModal, SubmitConfirmModal,
 * DiscardConfirmModal, BulkActionConfirm and ImportRecordsModal. All five remain
 * as internal renderers and are no longer part of the documented API. Names in
 * the library describe what a component *is*, not the verb a screen calls it for.
 * @version 1.1.0
  * States: error · open · submitting.
*/
export declare const ConfirmModal: React.ForwardRefExoticComponent<ConfirmModalProps & React.RefAttributes<HTMLElement>>;
