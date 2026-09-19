import React from "react";

/* ── Types (mirrored in EmptyState.d.ts) ── */
export interface EmptyStateProps {
  /** Phosphor icon class. @default "ph-tray" */
  icon?: string;
  title?: React.ReactNode;
  message?: React.ReactNode;
  /** Primary action (what creates the first item). */
  action?: React.ReactNode;
  /** sm panel-sized · md default · lg full-region. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Dashed container. @default true — false for side panels and card bodies. */
  bordered?: boolean;
  /** Alias for size="sm". */
  compact?: boolean;
  style?: React.CSSProperties;
}
/** Empty-state block — text + action, never a bare illustration. */

/**
 * AgniUI · EmptyState
 * Explains why a region is empty and what creates the first item.
 * Never a bare illustration — always carries text + a primary action.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 4). `bordered` adds classes rather
 * than switching between a border and `border-none`: a div has no border by
 * default, so there is no conflict group to lose on emit order (rule 5).
 */
const SIZE = {
  sm: { pad: "px-5 py-7 gap-[11px]", ring: "size-[44px]", glyph: "text-[22px]", title: "text-base" },
  md: { pad: "px-10 py-16 gap-[14px]", ring: "size-[60px]", glyph: "text-[30px]", title: "text-md" },
  lg: { pad: "px-12 py-[88px] gap-[14px]", ring: "size-[68px]", glyph: "text-[34px]", title: "text-md" },
} as const;

const SHELL = "flex flex-col items-center justify-center text-center rounded-lg";
const BORDERED = "border border-dashed border-line-default bg-surface-card";
const FLUSH = "bg-transparent";
const RING = "rounded-full bg-surface-brand-soft flex items-center justify-center shrink-0";

export function EmptyState({ icon = "ph-tray", title = "Nothing here yet", message, action = null, size, bordered = true, compact = false, style = {} }: EmptyStateProps) {
  const s = SIZE[size || (compact ? "sm" : "md")] || SIZE.md;
  return (
    <div className={[SHELL, s.pad, bordered ? BORDERED : FLUSH].join(" ")} style={style}>
      <div className={[RING, s.ring].join(" ")}>
        <i className={["ph", icon, s.glyph, "text-fg-brand"].join(" ")} />
      </div>
      <div>
        <div className={[s.title, "font-semibold text-fg-primary"].join(" ")}>{title}</div>
        {message && <div className="text-sm text-fg-tertiary mt-1 max-w-[360px]">{message}</div>}
      </div>
      {action}
    </div>
  );
}
