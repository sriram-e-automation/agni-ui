/**
 * @internal Renderer behind the public <Notice> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef } from "react";

/* ── Types (mirrored in Toast.d.ts) ── */
export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: "info" | "success" | "warning" | "error";
  title?: React.ReactNode;
  message?: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
  /** Accessible name of the close button. @default "Dismiss" */
  closeLabel?: string;
  style?: React.CSSProperties;
}
/** Inline notification toast. */

/**
 * AgniUI · Toast
 * Inline notification surface. tone: info | success | warning | error.
 * Stateless presentational unit — drive visibility from your own store.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 4). The entrance animation stays
 * inline: it references this component's own @keyframes, shipped in the <style>
 * below, so routing it through an arbitrary animate-[…] utility would make it
 * depend on the compiled stylesheet owning a keyframes name it does not define.
 * Motion is not theme-varying, so nothing about theming is lost.
 */
const TONES = {
  info:    { icon: "ph-info",         bdr: "border-l-status-info",    chip: "bg-status-info-soft text-status-info" },
  success: { icon: "ph-check-circle", bdr: "border-l-status-success", chip: "bg-status-success-soft text-status-success" },
  warning: { icon: "ph-warning",      bdr: "border-l-status-warning", chip: "bg-status-warning-soft text-status-warning" },
  error:   { icon: "ph-x-circle",     bdr: "border-l-status-error",   chip: "bg-status-error-soft text-status-error" },
} as const;

const SHELL =
  "flex items-start gap-3 w-[360px] max-w-full p-3 bg-surface-card " +
  "border border-line-subtle border-l-[3px] rounded-md shadow-e-lg";
const CHIP = "w-[28px] h-[28px] rounded-sm shrink-0 inline-flex items-center justify-center text-[17px]";
const CLOSE =
  "w-6 h-6 shrink-0 border-none bg-transparent text-fg-tertiary cursor-pointer text-[15px] " +
  "rounded-xs transition-colors duration-fast hover:text-fg-primary";

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { tone = "info", title, message, onClose, action = null, closeLabel = "Dismiss", role, style = {}, className = "", ...rest },
  ref,
) {
  const t = TONES[tone] || TONES.info;
  /* Errors interrupt (assertive); everything else waits its turn (polite). */
  return (
    <div {...rest} ref={ref} role={role ?? (tone === "error" ? "alert" : "status")} aria-atomic="true"
      className={[SHELL, t.bdr, className].join(" ")}
      style={{ animation: "agni-toast-in var(--dur-normal) var(--ease-spring)", ...style }}>
      <span aria-hidden="true" className={[CHIP, t.chip].join(" ")}>
        <i className={["ph-fill", t.icon].join(" ")} />
      </span>
      <div className="flex-1 min-w-0">
        {title && <div className="text-sm font-semibold text-fg-primary">{title}</div>}
        {message && <div className="text-sm text-fg-secondary mt-0.5">{message}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label={closeLabel} className={CLOSE}><i aria-hidden="true" className="ph ph-x" /></button>
      )}
      <style>{`@keyframes agni-toast-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } }`}</style>
    </div>
  );
});
