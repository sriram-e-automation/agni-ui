import React, { forwardRef } from "react";
import { Tag } from "../Tag/Tag.tsx";

/**
 * @internal Retired Aug 2026 — merged into <Tag variant="status">.
 * Kept so existing imports inside the library keep resolving. Not part of the
 * documented API: no .d.ts, no specimen card. Use Tag in new work.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  tone?: "done" | "doing" | "todo" | "error" | "warning" | "pending" | "blocked" | "brand" | "neutral";
  dot?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone = "neutral", dot = false, size = "md", style = {}, children, ...rest }, ref) {
  return <Tag ref={ref} variant="status" tone={tone} dot={dot} size={size} style={style} {...rest}>{children}</Tag>;
});
