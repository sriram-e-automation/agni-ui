import * as React from "react";

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  badge?: number;
  /** Shown but inert (aria-disabled); skipped by arrow keys. */
  disabled?: boolean;
  /** Tooltip while disabled. @default "Not available for your role" */
  disabledReason?: string;
}
export interface TabTrackItem {
  key: string;
  /** Omit for a compact icon-only segment. */
  label?: string;
  /** Phosphor icon class, e.g. "ph-list". */
  icon?: string;
  /** Count pill after the label. */
  count?: number;
  /** Tooltip — and the accessible name of an icon-only segment. */
  title?: string;
  /** Renders muted and inert. */
  disabled?: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Page tabs — underline or segmented strip. */
  tabs?: TabItem[];
  /** Pill track — scope tabs and view-mode toggles. Takes precedence over `tabs`. */
  items?: TabTrackItem[] | null;
  /** Controlled selected key. Omit (and use `defaultValue`) for uncontrolled. */
  value?: string;
  defaultValue?: string;
  onChange?: (key: string) => void;
  /** `tabs` only. @default "underline" */
  variant?: "underline" | "segmented";
  size?: "sm" | "md";
  /** "automatic": arrows select as they move · "manual": Enter / Space select. @default "automatic" */
  activation?: "automatic" | "manual";
  /** Id of the panel each tab controls — sets aria-controls (tab ids are `${id}-tab-${key}`). */
  getPanelId?: (key: string) => string;
  /** ARIA pattern. Default: "tabs" for underline (or with getPanelId), "radio" for segmented / items. */
  semantics?: "tabs" | "radio";
  style?: React.CSSProperties;
}

/**
 * AgniUI · Tabs
 * The one tab component: the page strip (`tabs`) and the pill track (`items`).
 *
 * Page tabs are a WAI-ARIA tablist; the pill track (and the segmented look) is
 * a radio group, since it switches a view rather than revealing a panel. Both
 * are one Tab stop: ← → move (↑ ↓ too on the track), Home / End jump, disabled
 * entries are skipped. `Tabs.panelProps(tabsId, key)` returns the matching
 * panel's id / role / aria-labelledby. The ref is the strip element.
 *
 * Merged Aug 2026 — supersedes SegmentedControl (`items`), which remains as an
 * internal renderer and is no longer part of the documented API.
 * @version 1.1.0
 */
export declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>> & {
  panelProps(tabsId: string, key: string): { id: string; role: "tabpanel"; "aria-labelledby": string; tabIndex: 0 };
};
