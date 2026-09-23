import * as React from "react";

export type TagTone = "done" | "doing" | "todo" | "error" | "warning" | "pending" | "blocked" | "brand" | "neutral";

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  children?: React.ReactNode;
  /**
   * "status" — the tone pill · "chip" — the removable token.
   * Inferred when omitted: `tone` or `status` present → status, else chip.
   */
  variant?: "status" | "chip";
  /** Semantic tone. Ignored when `status` resolves one. @default "neutral" */
  tone?: TagTone;
  /** Record status string, mapped to a tone through the shared map. */
  status?: string;
  /** Leading dot. Defaults on when `status` is set, off otherwise. */
  dot?: boolean;
  /** @default "md" */
  size?: "sm" | "md";
  /** chip only — accent hex for the leading dot. */
  color?: string | null;
  /** chip only — renders the close button. */
  onRemove?: ((e: React.MouseEvent<HTMLButtonElement>) => void) | null;
  /** Accessible name of the close button. @default "Remove <text>" */
  removeLabel?: string;
  style?: React.CSSProperties;
}

/**
 * AgniUI · Tag
 * The one label component: status pills and removable chips.
 * Merged Aug 2026 — supersedes Badge (`variant="status"`) and StatusChip
 * (`status="…"`), which remain as internal renderers and are no longer part of
 * the documented API.
 *
 * `Tag.toneFor(status)` resolves a status to its tone; `Tag.statusTones` is the
 * shared map, so no module invents its own status colours.
 * The ref is the outer <span>.
 * @version 1.1.0
 */
export declare const Tag: React.ForwardRefExoticComponent<TagProps & React.RefAttributes<HTMLSpanElement>> & {
  toneFor(status: string): TagTone;
  statusTones: Record<string, TagTone>;
};
