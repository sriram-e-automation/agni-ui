import React from "react";

/* ── Types (mirrored in Cluster.d.ts) ── */
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
/** Vertical flex column with token gaps. */


const GAPS = { tight: "var(--cluster-tight)", default: "var(--cluster-default)", loose: "var(--cluster-loose)" };
const JUSTIFY = { start: "flex-start", end: "flex-end", center: "center", between: "space-between", "space-between": "space-between", around: "space-around" };
const OVERFLOW: Record<string, React.CSSProperties> = {
  visible: { overflow: "visible" },
  clip: { overflow: "hidden" },
  auto: { overflow: "auto" },
  "scroll-x": { overflowX: "auto", overflowY: "hidden", minWidth: 0 },
  "scroll-y": { overflowY: "auto", overflowX: "hidden", minHeight: 0 },
};

/**
 * AgniUI · Cluster
 * Horizontal flex row with token gaps + alignment. The workhorse for toolbars.
 */
export const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(function Cluster({
  children,
  gap = "default",        // tight | default | loose | <number>
  justify = "start",
  align = "center",
  wrap = false,
  padding = 0,
  overflow = "visible",
  style = {},
  ...rest
}, ref) {
  return (
    <div ref={ref as never}
      style={{
        display: "flex", flexDirection: "row",
        alignItems: align, justifyContent: JUSTIFY[justify] || justify,
        gap: GAPS[gap] || gap, flexWrap: wrap ? "wrap" : "nowrap",
        padding, ...(OVERFLOW[overflow] || {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

/**
 * AgniUI · Stack — vertical sibling of Cluster.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack({
  children,
  gap = "default",
  align = "stretch",
  justify = "start",
  wrap = false,
  padding = 0,
  overflow = "visible",
  style = {},
  ...rest
}, ref) {
  return (
    <div ref={ref as never}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: align, justifyContent: JUSTIFY[justify] || justify,
        gap: GAPS[gap] || gap, flexWrap: wrap ? "wrap" : "nowrap",
        padding, ...(OVERFLOW[overflow] || {}), ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
