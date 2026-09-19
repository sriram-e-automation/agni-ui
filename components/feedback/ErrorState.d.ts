import * as React from "react";
export interface ErrorStateProps {
  /** Phosphor icon class. @default "ph-warning-octagon" */
  icon?: string;
  /** @default "Couldn't load this" */
  title?: React.ReactNode;
  message?: React.ReactNode;
  /** Technical detail — request id, status code, server message. Monospaced. */
  detail?: React.ReactNode;
  /** Renders the retry button. */
  onRetry?: () => void;
  /** @default "Try again" */
  retryLabel?: string;
  /** Extra action beside retry (e.g. "Contact support"). */
  action?: React.ReactNode;
  /** sm panel-sized · md default · lg full-region. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Dashed container. @default true */
  bordered?: boolean;
  style?: React.CSSProperties;
}
/**
 * AgniUI · ErrorState
 * The failure counterpart to EmptyState — what failed, and the way back.
 * Consumed internally by DataTable, KanbanBoard, Card and RequestDetailModal
 * through their `error` props.
 * @version 1.0.0
 */
export declare function ErrorState(props: ErrorStateProps): JSX.Element;
