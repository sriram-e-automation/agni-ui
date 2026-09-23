import * as React from "react";

export interface TabItem { key: string; label: string; icon?: string; badge?: number; /** Renders muted and inert. */ disabled?: boolean; }
export interface TabTrackItem {
  key: string;
  /** Omit for a compact icon-only segment. */
  label?: string;
  /** Phosphor icon class, e.g. "ph-list". */
  icon?: string;
  /** Count pill after the label. */
  count?: number;
  /** Tooltip — recommended for icon-only segments. */
  title?: string;
  /** Renders muted and inert. */
  disabled?: boolean;
}

export interface TabsProps {
  /** Page tabs — underline or segmented strip. */
  tabs?: TabItem[];
  /** Pill track — scope tabs and view-mode toggles. Takes precedence over `tabs`. */
  items?: TabTrackItem[] | null;
  value?: string;
  onChange?: (key: string) => void;
  /** `tabs` only. @default "underline" */
  variant?: "underline" | "segmented";
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

/**
 * AgniUI · Tabs
 * The one tab component: the page strip (`tabs`) and the pill track (`items`).
 *
 * Merged Aug 2026 — supersedes SegmentedControl (`items`), which remains as an
 * internal renderer and is no longer part of the documented API.
 * @version 1.0.0
 */
export declare function Tabs(props: TabsProps): JSX.Element;
