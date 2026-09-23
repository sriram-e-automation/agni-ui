import * as React from "react";
import { DataColumn } from "../DataTable/DataTable";
import { PageControlsProps } from "../PageControls/PageControls";
import { BulkAction } from "../BulkActionToolbar/BulkActionToolbar";
import { ActionSpec } from "../../utils/actionSpec";

export interface RecordTablePagination {
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  totalLabel?: React.ReactNode;
}

export interface RecordTableProps {
  columns?: DataColumn[];
  rows?: any[];
  /** Field used as the unique row id. @default "id" */
  rowKey?: string;

  selectable?: boolean;
  /** Controlled selection set of rowKey values. Non-empty flips the toolbar
   *  into the bulk bar automatically. */
  selected?: Set<any>;
  onSelect?: (next: Set<any>) => void;
  /** Defaults to clearing `selected`. */
  onClearSelection?: () => void;
  /** Shown in the bulk bar while rows are selected; each entry role-gated. */
  bulkActions?: BulkAction[];

  onRowClick?: (row: any) => void;
  sortAccessor?: (key: string, row: any) => any;
  density?: "compact" | "comfortable" | "spacious";
  /** Fixed header + independently scrolling body. */
  fillHeight?: boolean;
  headerStyle?: React.CSSProperties;
  dark?: boolean;

  /** Trailing per-row actions. A function receives the row, so availability
   *  can depend on the record's own status. The first `rowActionsMax` render
   *  as ghost icon buttons; the rest collapse into one ⋮ menu. Role-gated
   *  per action; if a viewer can use none, the whole column is withheld. */
  rowActions?: ActionSpec[] | ((row: any) => ActionSpec[]);
  /** @default 2 */
  rowActionsMax?: number;
  /** Header label for the action column. @default "" */
  rowActionsLabel?: React.ReactNode;
  /** @default 96 */
  rowActionsWidth?: number | string;

  /** Everything the toolbar takes — search, facets, date range, sort, column
   *  chooser, exportAction, primaryAction, secondaryActions. Pass `null` to
   *  render the table with no toolbar. */
  controls?: PageControlsProps | null;
  /** Rendered beneath the toolbar (inside it in selection mode). */
  pagination?: RecordTablePagination | null;

  /** Rows in flight — column-matched shimmer under the real header. */
  loading?: boolean;
  /** @default 6 */
  loadingRows?: number;
  /** Fetch failed. Takes precedence over loading and empty. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** No rows. String → centered line; node (e.g. EmptyState with an action). */
  empty?: React.ReactNode;

  /** Viewer role — gates row actions, bulk actions and toolbar actions through
   *  the core/RoleGate contract. */
  role?: string;
  /** Dim and make toolbar + row actions inert (e.g. while saving). */
  disabled?: boolean;
  /** Gap between toolbar and table. @default var(--space-3) */
  gap?: string | number;
  style?: React.CSSProperties;
}

/**
 * AgniUI · RecordTable
 * The whole records region as one component — PageControls toolbar, DataTable,
 * per-row action column, selection → BulkActionToolbar, and Pagination.
 * Composes existing parts only; the row-action cell is its sole new chrome.
 *
 * Variants: with / without toolbar (`controls: null`) · selectable ·
 * fillHeight · three densities.
 * States: idle · filtered · searching · selection-mode · loading · error ·
 * empty · disabled.
 * @version 1.1.0
 */
export declare const RecordTable: React.ForwardRefExoticComponent<RecordTableProps & React.RefAttributes<HTMLDivElement>>;
