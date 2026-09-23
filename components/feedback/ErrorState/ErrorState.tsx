import React, { forwardRef } from "react";
import { Button } from "../../primitives/Button/Button.tsx";

/* ── Types (mirrored in ErrorState.d.ts) ── */
export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Phosphor icon class. @default "ph-warning-octagon" */
  icon?: string;
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
/** Failure block — what failed, and the way back. */

/**
 * AgniUI · ErrorState
 * The failure counterpart to EmptyState: says what failed and offers the way
 * back. Use inside any region that loads data — table, board, card, pane.
 * Never a bare icon: always text, and a retry unless nothing can be retried.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 4). Padding, ring and glyph sizes are
 * carried in the same size table shape as EmptyState — the two sit side by side
 * in the state contract and must stay dimensionally in step (rule 6).
 */
const SIZE = {
  sm: { pad: "px-5 py-7", ring: "size-[42px]", glyph: "text-[20px]", title: "text-base" },
  md: { pad: "px-8 py-12", ring: "size-[54px]", glyph: "text-[26px]", title: "text-md" },
  lg: { pad: "px-10 py-[72px]", ring: "size-[60px]", glyph: "text-[30px]", title: "text-md" },
} as const;

const SHELL = "flex flex-col items-center justify-center text-center gap-3 rounded-lg";
const BORDERED = "border border-dashed border-line-default bg-surface-card";
const FLUSH = "bg-transparent";
const RING = "rounded-full bg-status-error-soft flex items-center justify-center shrink-0";
const DETAIL = "font-data text-2xs text-fg-tertiary mt-2 break-words max-w-[380px]";

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState({
  icon = "ph-warning-octagon", title = "Couldn't load this", message,
  detail, onRetry, retryLabel = "Try again", action = null,
  size = "md", bordered = true, style = {}, className = "", role = "alert", ...rest
}, ref) {
  const s = SIZE[size] || SIZE.md;
  return (
    <div {...rest} ref={ref} role={role} className={[SHELL, s.pad, bordered ? BORDERED : FLUSH, className].join(" ")} style={style}>
      <div aria-hidden="true" className={[RING, s.ring].join(" ")}>
        <i className={["ph", icon, s.glyph, "text-status-error"].join(" ")} />
      </div>
      <div>
        <div className={[s.title, "font-semibold text-fg-primary"].join(" ")}>{title}</div>
        {message && <div className="text-sm text-fg-tertiary mt-1 max-w-[380px]">{message}</div>}
        {detail && <div className={DETAIL}>{detail}</div>}
      </div>
      {(onRetry || action) && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {onRetry && <Button category="secondary" size={size === "sm" ? "sm" : "md"} icon={<i aria-hidden="true" className="ph ph-arrow-clockwise" />} onClick={onRetry}>{retryLabel}</Button>}
          {action}
        </div>
      )}
    </div>
  );
});
