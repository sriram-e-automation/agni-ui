import { resolveDataState } from "../feedback/DataState.tsx";
import React from "react";

/* ── Types (mirrored in List.d.ts) ── */
export interface ListItem {
  key?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: () => void;
}
export interface ListProps {
  items?: ListItem[];
  divided?: boolean;
  style?: React.CSSProperties;
}
/** Vertical record list with leading/trailing slots. */

/**
 * AgniUI · List
 * Vertical record list. items: [{key,title,subtitle,leading,trailing,meta,onClick}].
 * `leading`/`trailing` are nodes (avatar, icon, badge, button).
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7b). The two mouse handlers per row
 * are gone — hover is `hover:` on rows that have an onClick, guarded so a
 * non-clickable row never shows a hover fill.
 */
const SHELL = "bg-surface-card border border-line-subtle rounded-lg overflow-hidden";
const ROW = "flex items-center gap-3 px-4 py-3 transition-colors duration-fast";
const ROW_DIVIDED = "border-t border-line-subtle";
const ROW_FIRST = "border-t-0";
const ROW_CLICK = "cursor-pointer hover:bg-surface-soft";
const ROW_STATIC = "cursor-default";
const TITLE = "text-sm font-medium text-fg-primary whitespace-nowrap overflow-hidden text-ellipsis";
const SUBTITLE = "text-xs text-fg-tertiary mt-px whitespace-nowrap overflow-hidden text-ellipsis";
const META = "text-xs text-fg-tertiary font-data shrink-0";

function ListBody({ items = [], divided = true, style = {} }) {
  return (
    <div className={SHELL} style={style}>
      {items.map((it, i) => (
        <div key={it.key ?? i} onClick={it.onClick}
          className={[ROW, divided && i ? ROW_DIVIDED : ROW_FIRST, it.onClick ? ROW_CLICK : ROW_STATIC].join(" ")}>
          {it.leading && <div className="shrink-0">{it.leading}</div>}
          <div className="flex-1 min-w-0">
            <div className={TITLE}>{it.title}</div>
            {it.subtitle && <div className={SUBTITLE}>{it.subtitle}</div>}
          </div>
          {it.meta && <div className={META}>{it.meta}</div>}
          {it.trailing && <div className="shrink-0">{it.trailing}</div>}
        </div>
      ))}
    </div>
  );
}

/* State contract — error → loading → empty → content (resolveDataState owns the
   precedence). The body mounts only with content, so hook order is stable. */
export function List(props) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.items && props.items.length), empty: props.empty,
    shape: "list", rows: props.loadingRows || 4,
    emptyIcon: "ph-list-dashes", emptyTitle: "Nothing in this list",
  });
  if (state !== false) return <div className="w-full" style={props.style || {}}>{state}</div>;
  return <ListBody {...props} />;
}
