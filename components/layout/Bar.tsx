import React from "react";

/* ── Types (mirrored in Bar.d.ts) ── */
export interface BarProps {
  /** @default "top" */
  position?: "top" | "footer";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Horizontal header / footer chrome bar. */

/**
 * AgniUI · Bar
 * Horizontal chrome bar. position="top" (header) | "footer".
 * Defaults to a space-between layout; override `style` freely.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 5). Height and edge come from a
 * two-entry table of complete class strings — the height tokens (`--bar-h`,
 * `--footer-h`) are shell geometry, not control heights, so they do not ride
 * the `h-control-*` density contract.
 */
const VARIANT = {
  top: "h-[var(--bar-h)] border-b border-line-subtle",
  footer: "h-[var(--footer-h)] border-t border-line-subtle",
} as const;

const SHELL = "flex items-center justify-between w-full px-[var(--bar-pad-x)] bg-surface-card shrink-0";

export function Bar({
  position = "top",   // top | footer
  children,
  style = {},
  ...rest
}: BarProps) {
  return (
    <div className={[SHELL, VARIANT[position] || VARIANT.top].join(" ")} style={style} {...rest}>
      {children}
    </div>
  );
}
