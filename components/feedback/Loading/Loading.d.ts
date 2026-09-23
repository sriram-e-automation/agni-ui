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

export interface LoadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
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

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  size?: number;
  /** Stroke color. Defaults to the brand accent. */
  color?: string;
  label?: string;
  style?: React.CSSProperties;
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
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
/** Indeterminate circular indicator (role="status", named by `label`). */
export declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<HTMLSpanElement>>;
/** Dims existing content while new data arrives (refresh-in-place). The dimmed
 *  content is `inert` — unreachable by keyboard as well as pointer. */
export declare const LoadingOverlay: React.ForwardRefExoticComponent<LoadingOverlayProps & React.RefAttributes<HTMLDivElement>>;
/** One loading state for every component family, via shape-matched skeletons.
 *  role="status" with an announced `label`. The ref is the skeleton root.
 *  @version 1.1.0
 */
export declare const Loading: React.ForwardRefExoticComponent<LoadingProps & React.RefAttributes<HTMLDivElement>>;
