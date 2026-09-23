import React from "react";
import { Tag } from "../core/Tag.tsx";

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

export function StatusChip({ status, tone, dot = true, size = "md", style = {}, children }: StatusChipProps) {
  return <Tag variant="status" status={status} tone={tone} dot={dot} size={size} style={style}>{children || status}</Tag>;
}

StatusChip.toneFor = (status: string) => Tag.toneFor(status);
