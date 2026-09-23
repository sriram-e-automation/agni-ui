import { resolveDataState } from "../../utils/DataState.tsx";
import React, { forwardRef } from "react";
import { isActivationKey } from "../../utils/interaction.tsx";

/* ── Types (mirrored in List.d.ts) ── */
export interface ListItem {
  key?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  /** Accessible name for a clickable row when `title` is a node. */
  label?: string;
}
export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  items?: ListItem[];
  divided?: boolean;
  loading?: boolean;
  loadingRows?: number;
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  empty?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Vertical record list with leading/trailing slots. */

/**
 * AgniUI · List
 * Vertical record list. items: [{key,title,subtitle,leading,trailing,meta,onClick}].
 * `leading`/`trailing` are nodes (avatar, icon, badge, button).
 * A real list (<ul>/<li>). A row with onClick is focusable and opens on
 * Enter / Space — only when the key lands on the row itself, never on a
 * control in its trailing slot. The ref is the <ul> (or the state wrapper).
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

const ListBody = forwardRef<HTMLUListElement, ListProps>(function ListBody(
  { items = [], divided = true, style = {}, loading, loadingRows, error, onRetry, empty, className = "", ...rest },
  ref,
) {
  return (
    <ul {...rest} ref={ref} className={[SHELL, "m-0 p-0", className].join(" ")} style={{ listStyle: "none", ...style }}>
      {items.map((it, i) => (
        <li key={it.key ?? i} onClick={it.onClick}
          tabIndex={it.onClick ? 0 : undefined}
          aria-label={it.onClick ? it.label : undefined}
          onKeyDown={it.onClick ? (e) => { if (e.target === e.currentTarget && isActivationKey(e.key)) { e.preventDefault(); it.onClick?.(e); } } : undefined}
          className={[ROW, divided && i ? ROW_DIVIDED : ROW_FIRST, it.onClick ? ROW_CLICK + " outline-none focus-visible:focus-ring" : ROW_STATIC].join(" ")}>
          {it.leading && <div className="shrink-0">{it.leading}</div>}
          <div className="flex-1 min-w-0">
            <div className={TITLE}>{it.title}</div>
            {it.subtitle && <div className={SUBTITLE}>{it.subtitle}</div>}
          </div>
          {it.meta && <div className={META}>{it.meta}</div>}
          {it.trailing && <div className="shrink-0">{it.trailing}</div>}
        </li>
      ))}
    </ul>
  );
});

/* State contract — error → loading → empty → content (resolveDataState owns the
   precedence). The body mounts only with content, so hook order is stable. */
export const List = forwardRef<HTMLUListElement, ListProps>(function List(props, ref) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.items && props.items.length), empty: props.empty,
    shape: "list", rows: props.loadingRows || 4,
    emptyIcon: "ph-list-dashes", emptyTitle: "Nothing in this list",
  });
  if (state !== false) return <div className="w-full" style={props.style || {}}>{state}</div>;
  return <ListBody ref={ref} {...props} />;
});
