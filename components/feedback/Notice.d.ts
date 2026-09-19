import * as React from "react";

export interface NoticeProps {
  /** "inline" — full-width banner in the page · "toast" — floating card. @default "inline" */
  variant?: "inline" | "toast";
  /** @default "info" */
  tone?: "info" | "success" | "warning" | "error" | "brand";
  title?: React.ReactNode;
  /** inline — body copy. */
  children?: React.ReactNode;
  /** toast — body copy. */
  message?: React.ReactNode;
  /** Trailing action node (a Button). */
  action?: React.ReactNode;
  /** inline — dismiss affordance. */
  onDismiss?: (() => void) | null;
  /** toast — dismiss affordance. */
  onClose?: () => void;
  /** Override the Phosphor icon class. */
  icon?: string;
  style?: React.CSSProperties;
}

/**
 * AgniUI · Notice
 * The one notification: an inline banner in the page, or a floating toast.
 *
 * Merged Aug 2026 — supersedes Banner (`variant="inline"`) and Toast
 * (`variant="toast"`), which remain as internal renderers and are no longer
 * part of the documented API.
 * @version 1.0.0
 */
export declare function Notice(props: NoticeProps): JSX.Element;
