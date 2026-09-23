import * as React from "react";
export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
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
 * role="alert" by default (override with `role`); the ref is the block.
 * @version 1.1.0
 */
export declare const ErrorState: React.ForwardRefExoticComponent<ErrorStateProps & React.RefAttributes<HTMLDivElement>>;
