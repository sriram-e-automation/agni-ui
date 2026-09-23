/**
 * @internal Renderer behind the public <Notice> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React from "react";

/* ── Types (mirrored in Banner.d.ts) ── */
export interface BannerProps {
  tone?: "info" | "success" | "warning" | "error" | "brand";
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: (() => void) | null;
  /** Override the phosphor icon class. */
  icon?: string;
  style?: React.CSSProperties;
}
/** Full-width inline alert banner. */

/**
 * AgniUI · Banner
 * Full-width inline alert for page/section context. tone: info|success|warning|error|brand.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 4). Tones are a table of COMPLETE
 * class strings, never assembled from the tone name — an interpolated class name
 * is invisible to the compiler and would ship a colourless banner with no error.
 */
const TONES = {
  info:    { icon: "ph-info",         cls: "bg-status-info-soft border-status-info",       fg: "text-status-info" },
  success: { icon: "ph-check-circle", cls: "bg-status-success-soft border-status-success", fg: "text-status-success" },
  warning: { icon: "ph-warning",      cls: "bg-status-warning-soft border-status-warning", fg: "text-status-warning" },
  error:   { icon: "ph-x-circle",     cls: "bg-status-error-soft border-status-error",     fg: "text-status-error" },
  brand:   { icon: "ph-rocket",       cls: "bg-surface-brand-soft border-line-brand",      fg: "text-fg-brand" },
} as const;

const SHELL = "flex items-start gap-3 p-3 border rounded-md";
const TITLE = "text-sm font-semibold text-fg-primary";
const BODY = "text-sm text-fg-secondary";
const DISMISS =
  "w-6 h-6 shrink-0 border-none bg-transparent text-fg-tertiary cursor-pointer text-[15px] " +
  "rounded-xs transition-colors duration-fast hover:text-fg-primary";

export function Banner({ tone = "info", title, children, action = null, onDismiss = null, icon, style = {} }: BannerProps) {
  const t = TONES[tone] || TONES.info;
  return (
    <div className={[SHELL, t.cls].join(" ")} style={style}>
      <i className={["ph-fill", icon || t.icon, "text-[19px] shrink-0 mt-px", t.fg].join(" ")} />
      <div className="flex-1 min-w-0">
        {title && <div className={TITLE}>{title}</div>}
        {children && <div className={[BODY, title ? "mt-0.5" : ""].join(" ")}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onDismiss && (
        <button type="button" onClick={onDismiss} className={DISMISS}><i className="ph ph-x" /></button>
      )}
    </div>
  );
}
