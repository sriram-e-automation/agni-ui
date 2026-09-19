import * as React from "react";
export interface DocumentPreviewProps {
  name: React.ReactNode;
  /** File type → icon/color. */
  type?: "pdf" | "doc" | "xls" | "img" | "cad" | "zip" | "file";
  meta?: React.ReactNode;
  onView?: () => void;
  onDownload?: () => void;
  style?: React.CSSProperties;
  /** Value in flight — shape-matched skeleton. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
}
/** Attachment / document preview row with actions.
 *  States: loading · error (empty does not apply — single value, not a collection).
 *  @version 1.0.0
 */
export declare function DocumentPreview(props: DocumentPreviewProps): JSX.Element;
