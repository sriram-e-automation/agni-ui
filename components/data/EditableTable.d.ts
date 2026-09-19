import * as React from "react";
export interface EditableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  /** For type "select": string options or { value, label }. */
  options?: Array<string | { value: string; label: string }>;
  width?: number | string;
  align?: "left" | "center" | "right";
  placeholder?: string;
}
export interface EditableTableProps {
  columns?: EditableColumn[];
  /** Row objects keyed by column.key. */
  rows?: Array<Record<string, any>>;
  onChange?: (rows: Array<Record<string, any>>) => void;
  addLabel?: string;
  /** @deprecated Use `empty`. */
  emptyText?: string;
  /** No-results state — string or node (e.g. an <EmptyState>). Supersedes `emptyText`. */
  empty?: React.ReactNode;
  /** Template object for a freshly-added row; else cells start empty/0. */
  newRow?: Record<string, any>;
  /** Rows still arriving — shape-matched skeleton table. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  style?: React.CSSProperties;
}
/** Inline-editable rows with add / edit / delete under fixed columns.
 *  States: loading · error · empty.
 *  @version 1.1.0
 */
export declare function EditableTable(props: EditableTableProps): JSX.Element;
