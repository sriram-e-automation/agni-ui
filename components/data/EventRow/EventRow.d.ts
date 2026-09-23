import * as React from "react";
export interface EventRowProps {
  label: React.ReactNode;
  /** Time or range, rendered in the data face. */
  time?: React.ReactNode;
  /** Second data-face detail (location, owner). */
  meta?: React.ReactNode;
  /** Same tone vocabulary as StatusChip / Badge. @default "brand" */
  tone?: "brand" | "success" | "warning" | "error" | "info" | "pending" | "neutral";
  /** Phosphor icon class. */
  icon?: string;
  /** Right-edge slot (badge, icon button). */
  trailing?: React.ReactNode;
  onClick?: () => void;
  /** Event still arriving — shape-matched skeleton row. */
  loading?: boolean;
  style?: React.CSSProperties;
}
/**
 * One agenda entry: tone bar + label + time/meta.
 * Panels and day views group these under a date heading. Tones come from the
 * shared status vocabulary — never map event types to ad-hoc colours.
 * States: loading (empty/error are the owning list's job — a single row has no "no results").
 * @version 1.1.0
 */
export declare function EventRow(props: EventRowProps): JSX.Element;
