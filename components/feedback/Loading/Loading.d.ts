import * as React from "react";

export type LoadingShape =
  | "block" | "circle" | "text" | "heading" | "paragraph" | "button" | "iconButton" | "tag" | "badge" | "avatar"
  | "input" | "select" | "textarea" | "checkbox" | "switch" | "form" | "filterPanel" | "fileDropzone"
  | "card" | "panel" | "accordion" | "modal" | "banner" | "toast" | "emptyState"
  | "stat" | "quickStats" | "list" | "table" | "editableTable" | "pagination" | "tree" | "calendar" | "gantt"
  | "chart" | "barChart" | "lineChart" | "donut" | "gauge" | "sparkline" | "heatmap"
  | "kanban" | "kanbanCard" | "taskCard" | "personCard" | "approvalCard" | "approvalStepper"
  | "auditTrail" | "orgTree" | "documentPreview" | "requestForm" | "eventRow" | "attachmentRow"
  | "navRail" | "shellHeader" | "pageTitleBar" | "pageControls" | "page";

export interface LoadingProps {
  /** When false, children render normally. */
  loading?: boolean;
  /** Which component family the placeholder should mimic. */
  shape?: LoadingShape;
  /** Repeated units — rows, cards, list items (shape-dependent). */
  rows?: number;
  /** Columns for table/kanban/stat/chart shapes. */
  columns?: number;
  width?: number | string;
  height?: number | string;
  /** Dim the real children and float a spinner instead of replacing them. */
  overlay?: boolean;
  /** Screen-reader announcement while loading. */
  label?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface SpinnerProps {
  size?: number;
  /** Stroke color. Defaults to the brand accent. */
  color?: string;
  label?: string;
  style?: React.CSSProperties;
}

export interface LoadingOverlayProps {
  loading?: boolean;
  label?: string;
  /** Blur the underlying content as well as dimming it. */
  blur?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Every shape name — useful for enum controls in the workbench.  * States: loading.
*/
export declare const LoadingShapes: string[];
/** Indeterminate circular indicator. */
export declare function Spinner(props: SpinnerProps): JSX.Element;
/** Dims existing content while new data arrives (refresh-in-place). */
export declare function LoadingOverlay(props: LoadingOverlayProps): JSX.Element;
/** One loading state for every component family, via shape-matched skeletons.
 *  @version 1.0.0
 */
export declare function Loading(props: LoadingProps): JSX.Element;
