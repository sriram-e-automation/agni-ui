import * as React from "react";

/** One record placed on the calendar by its date. Extra fields are legal. */
export interface CalendarRecord {
  /** Record ID — monospace, first line of a day-panel row. */
  id: string;
  /** The date the record sits on (its requested / created date). Date, ISO, "12 Jun 2026" or "12 Jun" (+ defaultYear). */
  date: string | Date;
  /** ERP status — mapped to a tone via StatusChip. Drives the day-cell count chips. */
  status?: string;
  /** Human title — day-panel row heading. Falls back to id. */
  title?: string;
  /** Second line of the day-panel row (owner, group, …). */
  sublabel?: string;
  [key: string]: any;
}

export type CalendarView = "month" | "week" | "year";

export interface CalendarProps {
  records?: CalendarRecord[];
  /** Controlled view. Omit for uncontrolled. */
  view?: CalendarView;
  /** Uncontrolled initial view. @default "month" */
  defaultView?: CalendarView;
  onViewChange?: (v: CalendarView) => void;
  /** Controlled month/period cursor. Omit for uncontrolled. */
  cursor?: Date;
  /** Uncontrolled initial cursor. @default today */
  defaultCursor?: Date;
  onCursorChange?: (d: Date) => void;
  /** Controlled selected day. Omit for uncontrolled. */
  selectedDate?: Date;
  /** Uncontrolled initial selected day. @default today */
  defaultSelectedDate?: Date;
  onSelectDate?: (d: Date) => void;
  /** Day-panel row / cell click — open the record detail. */
  onRecordClick?: (record: CalendarRecord) => void;
  /**
   * Statuses summarized as day-cell count chips, in order. Records whose
   * status is outside this list still appear in the day panel and roll up
   * into a "+N other" chip. @default ["Approved","In Review","Pending","Rejected"]
   */
  statusOrder?: string[];
  /** Right-hand day panel listing the selected day's records. @default true */
  showPanel?: boolean;
  /** Built-in header: period label · ‹ Today › · Month/Week/Year toggle. @default true */
  showToolbar?: boolean;
  /** Year assumed for day-month date strings like "13 Jun". */
  defaultYear?: number;
  /** Day-panel empty line. @default "No records on this day" */
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
 * AgniUI · Calendar — the "calendar" view type for the Desk App Scaffold.
 * Lays records on a month / week / year grid keyed by each record's date,
 * tones per-day count chips by status (shared StatusChip status→tone map),
 * and lists the selected day's records in a searchable right-hand panel.
 * View · cursor · selected day are each controllable or uncontrolled.
 * @version 1.0.0
  * States: loading · error · empty.
*/
export declare function Calendar(props: CalendarProps): JSX.Element;
