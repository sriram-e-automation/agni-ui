import * as React from "react";
export interface ClusterProps {
  children?: React.ReactNode;
  /** Token gap or px number. @default "default" */
  gap?: "tight" | "default" | "loose" | number;
  justify?: "start" | "end" | "center" | "between" | "around";
  align?: React.CSSProperties["alignItems"];
  wrap?: boolean;
  /** Padding: px number or CSS string (e.g. "0 var(--space-4)"). @default 0 */
  padding?: number | string;
  /** Overflow behavior. "clip" = overflow hidden. @default "visible" */
  overflow?: "visible" | "clip" | "auto" | "scroll-x" | "scroll-y";
  style?: React.CSSProperties;
}
export interface StackProps {
  children?: React.ReactNode;
  gap?: "tight" | "default" | "loose" | number;
  align?: React.CSSProperties["alignItems"];
  justify?: "start" | "end" | "center" | "between" | "around";
  wrap?: boolean;
  padding?: number | string;
  overflow?: "visible" | "clip" | "auto" | "scroll-x" | "scroll-y";
  style?: React.CSSProperties;
}
/** Horizontal flex row with token gaps. */
export declare function Cluster(props: ClusterProps): JSX.Element;
/** Vertical flex column with token gaps.
 *  @version 1.0.0
 */
export declare function Stack(props: StackProps): JSX.Element;
