import React from "react";
import { Loading } from "../feedback/Loading/Loading.tsx";
import { EmptyState } from "../feedback/EmptyState/EmptyState.tsx";
import { ErrorState } from "../feedback/ErrorState/ErrorState.tsx";

/* One implementation of the state contract, so every data component resolves
   error → loading → empty → content in the same order with the same defaults.
   Components own only the question "am I empty?"; this owns what that looks
   like. Returns null-ish (false) when content should render. */
export interface DataStateInput {
  loading?: boolean;
  /** String/true → the DS ErrorState; node → rendered as given. */
  error?: React.ReactNode | boolean;
  isEmpty?: boolean;
  empty?: React.ReactNode;
  onRetry?: () => void;
  /** Loading skeleton shape. */
  shape?: string;
  rows?: number;
  columns?: number;
  height?: number | string;
  size?: "sm" | "md" | "lg";
  emptyIcon?: string;
  emptyTitle?: React.ReactNode;
}

export function resolveDataState({ loading, error, isEmpty, empty, onRetry, shape = "paragraph", rows, columns, height, size = "sm", emptyIcon, emptyTitle }: DataStateInput): React.ReactNode | false {
  if (error) {
    return (typeof error === "string" || error === true)
      ? <ErrorState size={size} bordered={false} message={error === true ? undefined : error} onRetry={onRetry} />
      : error;
  }
  if (loading) return <Loading loading shape={shape as never} rows={rows} columns={columns} height={height} />;
  if (isEmpty) {
    if (empty == null) return <EmptyState size={size} bordered={false} icon={emptyIcon} title={emptyTitle || "Nothing to show"} />;
    return typeof empty === "string" ? <EmptyState size={size} bordered={false} icon={emptyIcon} title={empty} /> : empty;
  }
  return false;
}

/** Wrapper form — renders children only when there is content to show. */
export function DataState(props: DataStateInput & { children?: React.ReactNode }) {
  const state = resolveDataState(props);
  return state === false ? (props.children ?? null) : state;
}
