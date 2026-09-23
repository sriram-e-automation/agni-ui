import * as React from "react";
export interface AppShellProps {
  /** Top header region — usually a <Bar position="top">. */
  header?: React.ReactNode;
  /** Left nav region. */
  sidebar?: React.ReactNode;
  /** Width of the sidebar column (CSS length). @default var(--rail-drawer-w-md) */
  sidebarWidth?: string;
  /** Bottom footer region — usually a <Bar position="footer">. */
  footer?: React.ReactNode;
  /** Override content padding (e.g. "0" to let panes own their padding). */
  contentPad?: string;
  contentStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
/**
 * Full-height desk frame: header · sidebar · content · footer.
 * @startingPoint section="Layout" subtitle="Full desk frame: header, rail, content, footer" viewport="1280x720"
 * @version 1.1.0
 */
export declare const AppShell: React.ForwardRefExoticComponent<AppShellProps & React.RefAttributes<HTMLDivElement>>;
