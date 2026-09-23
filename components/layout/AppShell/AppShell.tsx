import React from "react";

/* ── Types (mirrored in AppShell.d.ts) ── */
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
 */

/**
 * AgniUI · AppShell
 * The desk frame: fixed top header, left nav rail, flexible content, footer.
 * All regions are optional. `children` render in the content area.
 *
 *   <AppShell header={<Bar.../>} sidebar={<Nav/>} sidebarWidth="248px" footer={<Bar position="footer"/>}>
 *     …content…
 *   </AppShell>
 *
 * Tailwind v4 (migrated Aug 2026, tranche 5). Two values stay inline because
 * they are caller-supplied CSS lengths, not choices from a set: `sidebarWidth`
 * (any length, animated as the rail collapses) and `contentPad`.
 */
const SHELL = "h-full flex flex-col bg-surface-page overflow-hidden";
const HEADER = "shrink-0 relative z-[20]";
const MID = "flex-1 min-h-0 min-w-0 flex flex-row";
const RAIL = "shrink-0 min-h-0 transition-[width] duration-normal ease-standard";
const CONTENT = "flex-1 min-w-0 min-h-0 overflow-auto";
const FOOTER = "shrink-0 z-[20]";

export function AppShell({
  header = null,
  sidebar = null,
  sidebarWidth = "var(--rail-drawer-w-md)",
  footer = null,
  contentPad,
  contentStyle = {},
  style = {},
  children,
  ...rest
}: AppShellProps) {
  return (
    <div className={SHELL} style={style} {...rest}>
      {header && <div className={HEADER}>{header}</div>}

      <div className={MID}>
        {sidebar && <div className={RAIL} style={{ width: sidebarWidth }}>{sidebar}</div>}
        <div className={CONTENT} style={{ padding: contentPad != null ? contentPad : "var(--pane-pad)", ...contentStyle }}>
          {children}
        </div>
      </div>

      {footer && <div className={FOOTER}>{footer}</div>}
    </div>
  );
}
