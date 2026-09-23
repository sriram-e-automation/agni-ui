import React from "react";
import { Tag } from "../../primitives/Tag/Tag.tsx";

/**
 * @internal Retired Aug 2026 — merged into <Tag status="…">.
 * Kept so existing imports inside the library keep resolving. Not part of the
 * documented API: no .d.ts, no specimen card. Use Tag in new work.
 */
export interface StatusChipProps {
  status?: string;
  tone?: "done" | "doing" | "todo" | "pending" | "blocked" | "warning" | "error" | "brand" | "neutral";
  dot?: boolean;
  size?: "sm" | "md";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const StatusChipBase = React.forwardRef<HTMLElement, StatusChipProps>(function StatusChip({ status, tone, dot = true, size = "md", style = {}, children }, ref) {
  return <Tag ref={ref as never} variant="status" status={status} tone={tone} dot={dot} size={size} style={style}>{children || status}</Tag>;
});

export const StatusChip = Object.assign(StatusChipBase, { toneFor: (status: string) => Tag.toneFor(status) });
