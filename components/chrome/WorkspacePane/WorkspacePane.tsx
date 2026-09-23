import React from "react";

/* ── Types (mirrored in WorkspacePane.d.ts) ── */
export interface WorkspaceItem {
  key: string;
  icon: string;        // phosphor class, e.g. "ph-rocket"
  label: string;
  badge?: number;
  launch?: boolean;    // shows a launch arrow when expanded
}
export interface WorkspacePaneProps {
  /** Items, plus literal "divider" / "spacer" strings. */
  items?: (WorkspaceItem | "divider" | "spacer")[];
  open?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onSelect?: (key: string) => void;
  /** Key of the currently active/selected item — renders with brand background. */
  activeKey?: string | null;
  /** Title shown in the header when the pane is expanded. @default "Workspace" */
  title?: string;
  style?: React.CSSProperties;
}
/** Right-hand collapsible utility rail. */

/**
 * AgniUI · WorkspacePane
 * Right-hand collapsible utility rail. Items are objects
 * { key, icon, label, badge?, launch? } or the strings "divider" / "spacer".
 * Collapsed → icon rail; expanded → labelled drawer.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 6). The `hover` useState is gone —
 * it re-rendered the whole rail on every pointer move across it, and left the
 * hover stuck on after a touch. Hover is now `hover:` on the inactive row only,
 * which is what the old ternary computed anyway.
 *
 * Open vs collapsed is a pair of complete class strings rather than a set of
 * `open ? … : …` fragments: nearly every property differs between the two
 * states (width, gap, justification, margin, padding), so one string per state
 * is both shorter and immune to a conflict pair racing on emit order.
 */
const SHELL =
  "shrink-0 h-full flex flex-col border-l border-line-subtle overflow-hidden " +
  "transition-[width] duration-normal ease-standard";
const HEAD_OPEN = "flex items-center justify-between pt-[10px] px-3 pb-2 shrink-0";
const HEAD_SHUT = "flex items-center justify-center pt-[10px] pb-2 shrink-0";
const EYEBROW = "text-2xs font-semibold tracking-wide uppercase text-fg-tertiary pl-1 whitespace-nowrap";
const TOGGLE =
  "size-[36px] rounded-md border-none cursor-pointer bg-transparent text-fg-tertiary text-[18px] " +
  "inline-flex items-center justify-center transition-colors duration-fast hover:bg-state-hover";
const ROW_BASE = "relative flex items-center h-[40px] border-none cursor-pointer rounded-md shrink-0 transition-colors duration-fast";
const ROW_OPEN = "gap-3 justify-start w-[calc(100%-12px)] my-px mx-[6px] px-3";
const ROW_SHUT = "gap-0 justify-center w-[40px] my-px mx-auto px-0";
const ROW_ON = "bg-surface-brand-soft text-fg-brand";
const ROW_OFF = "bg-transparent text-fg-secondary hover:bg-state-hover hover:text-fg-brand";
const ICON = "relative text-[19px] inline-flex shrink-0";
const BADGE =
  "absolute top-[-6px] right-[-8px] min-w-[16px] h-[16px] px-[3px] rounded-full " +
  "bg-status-error text-fg-on-brand text-[10px] font-bold font-data " +
  "inline-flex items-center justify-center border-[1.5px] border-surface-card";
const LABEL = "flex-1 min-w-0 text-left text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis";
const LIST = "flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden";
const DIVIDER = "h-px bg-line-subtle my-[6px] mx-3";

export function WorkspacePane({
  items = [],
  open = false,
  onToggleOpen,
  onSelect,
  title = "Workspace",
  activeKey = null,
  style = {},
}: WorkspacePaneProps) {
  const Row = (item) => {
    const isActive = item.key === activeKey;
    return (
      <button
        key={item.key} type="button" aria-label={item.label}
        onClick={() => onSelect && onSelect(item.key)}
        className={[ROW_BASE, open ? ROW_OPEN : ROW_SHUT, isActive ? ROW_ON : ROW_OFF].join(" ")}
      >
        <span className={ICON}>
          <i className={(isActive ? "ph-fill " : "ph ") + item.icon} />
          {item.badge != null && <span className={BADGE}>{item.badge}</span>}
        </span>
        {open && <span className={LABEL}>{item.label}</span>}
        {open && item.launch && <i className="ph ph-arrow-up-right text-[13px] opacity-[0.5] shrink-0" />}
      </button>
    );
  };

  return (
    <div className={SHELL} style={{ width: open ? 232 : "var(--workspace-rail-w)", ...style }}>
      {/* Toggle + title */}
      <div className={open ? HEAD_OPEN : HEAD_SHUT}>
        {open && <span className={EYEBROW}>{title}</span>}
        <button
          type="button" aria-label={open ? "Collapse" : "Expand"}
          onClick={() => onToggleOpen && onToggleOpen(!open)}
          className={TOGGLE}
        >
          <i className={open ? "ph ph-caret-line-right" : "ph ph-caret-line-left"} />
        </button>
      </div>

      {/* Items */}
      <div className={LIST}>
        {items.map((item, i) => {
          if (item === "divider") return <div key={"d" + i} className={DIVIDER} />;
          if (item === "spacer") return <div key={"s" + i} className="flex-1 min-w-0" />;
          return Row(item);
        })}
      </div>
    </div>
  );
}
