import * as React from "react";
export interface DataColumn {
  key: string;
  label: React.ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  /** Custom cell renderer: (value, row) => node. */
  render?: (value: any, row: any) => React.ReactNode;
  /** Set false to disable sorting on this column. */
  sortable?: boolean;
}
export interface ColumnPicker {
  /** Visible column keys (controlled). */
  visible: string[];
  onChange: (next: string[]) => void;
  /** Max simultaneously visible columns. @default 5 */
  max?: number;
  /** Keys tagged DEFAULT in the picker. */
  defaults?: string[];
}
export interface ActionColumn {
  /** Roles the cell renders for. Omit = every role. Withheld, the whole
   *  trailing column goes — an empty one still advertises the action. */
  roles?: string[];
  label?: React.ReactNode;
  width?: number | string;
  render: (row: any) => React.ReactNode;
}
export interface DataTableProps {
  columns?: DataColumn[];
  rows?: any[];
  /** Field used as the unique row id. @default "id" */
  rowKey?: string;
  selectable?: boolean;
  /** Controlled selection set of rowKey values. */
  selected?: Set<any>;
  onSelect?: (next: Set<any>) => void;
  onRowClick?: (row: any) => void;
  density?: "compact" | "comfortable" | "spacious";
  /** @deprecated Use `empty` — kept working for existing consumers. */
  emptyText?: string;
  /** No-rows state. String → centered line; node (e.g. <EmptyState action={…}>)
   *  → rendered in the body, so an empty table can carry its own action. */
  empty?: React.ReactNode;
  /** Rows in flight — column-matched shimmer rows under the real header. */
  loading?: boolean;
  /** Skeleton row count while loading. @default 6 */
  loadingRows?: number;
  /** Fetch failed. String/true → the DS ErrorState; node → as given.
   *  Takes precedence over loading and empty. */
  error?: React.ReactNode | boolean;
  /** Retry action on the error state. */
  onRetry?: () => void;
  /** Fill parent height: fixed header + independently scrolling body with a bottom-fade indicator. */
  fillHeight?: boolean;
  /** ⋮ column chooser in the last header cell. */
  columnPicker?: ColumnPicker;
  /** Trailing per-row action cell (e.g. a View button). */
  actionColumn?: ActionColumn;
  /** Custom sort value: (key, row) => comparable. Falls back to row[key]. */
  sortAccessor?: (key: string, row: any) => any;
  /** Current viewer's role, matched against each `roles` list. Same contract
   *  as core/RoleGate. Omit to show everything. */
  role?: string;
  /** Extra styles merged into header cells (e.g. dark glass tint). */
  headerStyle?: React.CSSProperties;
  /** Explicit dark override. Theming normally resolves from the nearest
   *  [data-theme] ancestor (the Theme component) — only pass this outside one. */
  dark?: boolean;
  style?: React.CSSProperties;
}
/** Sortable, selectable table with sticky header; fillHeight mode adds fixed header + scrolling body, column picker, action column.
 *  @version 1.0.0
  * States: loading · error · empty · selected.
*/
export declare function DataTable(props: DataTableProps): JSX.Element;
