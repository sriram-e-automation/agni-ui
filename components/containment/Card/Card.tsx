import React from "react";
import { Loading } from "../feedback/Loading.tsx";
import { EmptyState } from "../feedback/EmptyState.tsx";
import { ErrorState } from "../feedback/ErrorState.tsx";

/* ── Types (mirrored in Card.d.ts) ── */
export interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned header actions. */
  actions?: React.ReactNode;
  /** Pad the body. @default true */
  pad?: boolean;
  /** Hover elevation + pointer cursor. */
  interactive?: boolean;
  /** Shimmer the body, header intact. */
  loading?: boolean;
  /** Which Loading shape the body shimmers as. @default "paragraph" */
  loadingShape?: string;
  /** Shown instead of children when there is nothing to show. String → the DS
   *  EmptyState at panel size; node → rendered as given. */
  empty?: React.ReactNode;
  /** Failure in the body. String/true → the DS ErrorState; node → as given. */
  error?: React.ReactNode | boolean;
  /** Retry action on the error state. */
  onRetry?: () => void;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  className?: string;
}
/** Surface container with optional header + actions. */

/**
 * AgniUI · Card
 * Surface container. The fundamental pane unit across desks.
 * Optional header (title + actions) and padded/flush body.
 *
 * Tailwind v4 (migrated Aug 2026). The interactive hover elevation is pure CSS
 * — the old onMouseEnter/onMouseLeave handlers that wrote boxShadow and
 * borderColor onto the node are gone.
 */
const BASE = "bg-surface-card border border-line-subtle rounded-lg shadow-e-xs overflow-hidden";
const INTERACTIVE =
  "cursor-pointer transition-[box-shadow,border-color] duration-fast ease-standard " +
  "hover:shadow-e-md hover:border-line-default";

export function Card({
  children,
  title = null,
  subtitle = null,
  actions = null,
  pad = true,
  interactive = false,
  loading = false,
  loadingShape = "paragraph",
  empty = null,
  error = null,
  onRetry,
  style = {},
  bodyStyle = {},
  className = "",
  ...rest
}: CardProps) {
  /* State precedence: error → loading → empty → children. A failed load must
     never read as an empty region. */
  let body: React.ReactNode = children;
  if (error) body = typeof error === "string" || error === true
    ? <ErrorState size="sm" bordered={false} message={error === true ? undefined : error} onRetry={onRetry} />
    : error;
  else if (loading) body = <Loading loading shape={loadingShape as any} />;
  else if (empty && !children) body = typeof empty === "string"
    ? <EmptyState size="sm" bordered={false} title={empty} />
    : empty;

  return (
    <div className={[BASE, interactive ? INTERACTIVE : "", className].join(" ")} style={style} {...rest}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line-subtle">
          <div className="min-w-0">
            {title && <div className="text-md font-semibold text-fg-primary">{title}</div>}
            {subtitle && <div className="text-sm text-fg-tertiary mt-0.5">{subtitle}</div>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={pad ? "p-4" : ""} style={bodyStyle}>{body}</div>
    </div>
  );
}
