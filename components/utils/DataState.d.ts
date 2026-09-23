import * as React from "react";
import { LoadingShape } from "../feedback/Loading/Loading";

export interface DataStateProps {
  /** Content in flight — renders the shape-matched Loading skeleton. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with onRetry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** The owning component's answer to "do I have nothing to show?". */
  isEmpty?: boolean;
  /** What the empty state says. String → EmptyState title; node → as given. */
  empty?: React.ReactNode;
  /** Skeleton shape while loading. @default "paragraph" */
  shape?: LoadingShape;
  rows?: number;
  columns?: number;
  height?: number | string;
  /** EmptyState / ErrorState size. @default "sm" */
  size?: "sm" | "md" | "lg";
  emptyIcon?: string;
  emptyTitle?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * The state contract in one place: error → loading → empty → content, in that
 * fixed precedence, so a failed fetch never reads as an empty region.
 * Data components call `resolveDataState(...)` and return its result when it is
 * not `false`; `<DataState>` is the same logic as a wrapper.
 * @version 1.0.0
  * States: loading · error · empty.
*/
export declare function resolveDataState(props: DataStateProps): React.ReactNode | false;
/** Wrapper form of the contract: renders children only when there is content,
 *  otherwise the resolved error / loading / empty node. */
export declare function DataState(props: DataStateProps): JSX.Element;
