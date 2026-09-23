import * as React from "react";
export interface AttachmentRowProps {
  /** File name — the extension picks the icon unless `kind` is given. */
  name: React.ReactNode;
  /** Secondary line — size, date, uploader. Hidden while uploading. */
  meta?: React.ReactNode;
  /** Force the file-type icon. */
  kind?: "pdf" | "image" | "sheet" | "doc" | "cad" | "file";
  /** 0–100 — replaces `meta` with a progress bar while below 100. */
  progress?: number | null;
  /** true or a message — shows the failure icon and error line. */
  error?: boolean | React.ReactNode;
  onView?: () => void;
  onDownload?: () => void;
  onRemove?: () => void;
  /** Retry action, shown only in the error state. */
  onRetry?: () => void;
  /** Metadata still arriving — shape-matched skeleton row. */
  loading?: boolean;
  style?: React.CSSProperties;
}
/**
 * One attached file: type icon, name, meta, and hover actions —
 * plus uploading (progress), failed (retry) and loading states.
 * Sits between FileUpload / FileDropzone (getting files in) and
 * DocumentPreview (opening one).
 * States: loading · error (upload failed, inline — not the fetch contract) · uploading (via progress).
 * @version 1.1.0
 */
export declare const AttachmentRow: React.ForwardRefExoticComponent<AttachmentRowProps & React.RefAttributes<HTMLDivElement>>;
