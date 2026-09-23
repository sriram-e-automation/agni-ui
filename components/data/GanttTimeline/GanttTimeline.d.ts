import * as React from "react";

/** One bar on the timeline. Extra fields are legal — `groupBy` reads any of them. */
export interface GanttItem {
  /** Record ID — first line of the left label (monospace). */
  id: string;
  /** Human title shown in the hover tooltip. Falls back to id. */
  label?: string;
  /** Second line of the left label (assignee, owner, …). Hidden at size="sm". */
  sublabel?: string;
  /** Bar start — Date, ISO string, "12 Jun 2025" or "12 Jun" (+ defaultYear). */
  start: string | Date;
  /** Bar end (inclusive day). */
  end: string | Date;
  /**
   * Status tone. Canonical keys: approvals · todo · progress · overdue · done ·
   * rejected — record statuses ("In Progress", "Completed", "Yet to start",
   * "Awaiting Approval", …) are auto-mapped. Drives the --kanban-*-dot bar color.
   */
  status?: string;
  /** 0–1 → lighter fill overlay on the bar. */
  progress?: number;
  [key: string]: any;
}

export interface GanttGroupOption {
  /** Item field name to group rows by, e.g. "requestType". */
  key: string;
  /** Toolbar / corner-header label, e.g. "Request type". */
  label: string;
}

export type GanttScale = "day" | "week" | "month" | "quarter" | "year";

export interface GanttTimelineProps {
  items?: GanttItem[];
  /** Fields offered in the "Group by" control (+ automatic "None"). */
  groupOptions?: GanttGroupOption[];
  /** Controlled group-by field (null = flat). Omit for uncontrolled. */
  groupBy?: string | null;
  /** Uncontrolled initial group-by. @default null */
  defaultGroupBy?: string | null;
  onGroupByChange?: (groupBy: string | null) => void;
  /** Controlled zoom scale. Omit for uncontrolled. */
  scale?: GanttScale;
  /** Uncontrolled initial scale. @default "week" */
  defaultScale?: GanttScale;
  onScaleChange?: (scale: GanttScale) => void;
  /** Bar / left-label click — open the record detail. */
  onItemClick?: (item: GanttItem) => void;
  /**
   * Built-in header row with the "Group by" segmented control. Set false
   * when the host page owns grouping UI (e.g. the Desk App Scaffold's
   * page-controls bar). @default true
   */
  showToolbar?: boolean;
  /**
   * Navigator row above the grid: ‹ Today › + live range label (left) and
   * the Days·Weeks·Months·Quarters·Years scale toggle (right). Prev/next
   * page the scroll by scale-relative screenfuls; the view re-homes to
   * today on scale change. Independent of showToolbar — it drives the
   * scrollable canvas, so it still renders when the toolbar is hidden.
   * Set false only when the host owns paging AND scale UI. @default true
   */
  showNavigator?: boolean;
  /** Extra control rendered at the start of the navigator row, before ‹ Today ›/label (e.g. a host-owned "Group by" select). */
  navigatorExtra?: React.ReactNode;
  /** md 44px rows · sm 34px rows (sublabel hidden). @default "md" */
  size?: "md" | "sm";
  /** Year assumed for day-month date strings like "13 Jun". */
  defaultYear?: number;
  /** Empty-state line. @default "No records in this period" */
  emptyLabel?: string;
  style?: React.CSSProperties;
  /** Content in flight — shape-matched skeleton. */
  loading?: boolean;
  /** Skeleton units while loading. @default 5 */
  loadingRows?: number;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Nothing to show. String → EmptyState title; node → as given. */
  empty?: React.ReactNode;
}

/**
 * Horizontal scheduling (Gantt) view: collapsible group rows in a sticky left
 * column, a two-tier sticky time header, status-toned bars (shared kanban
 * tokens), a today line, hover tooltips and a ‹ Today › navigator. Scales:
 * day · week · month · quarter · year.
 * @version 1.1.0
  * States: loading · error · empty.
*/
export declare const GanttTimeline: React.ForwardRefExoticComponent<GanttTimelineProps & React.RefAttributes<HTMLElement>>;
