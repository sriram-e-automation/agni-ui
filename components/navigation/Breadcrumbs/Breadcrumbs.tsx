import React from "react";

/* ── Types (mirrored in Breadcrumbs.d.ts) ── */
export interface Crumb { label: React.ReactNode; icon?: string; onClick?: () => void; }
export interface BreadcrumbsProps { items?: Crumb[]; style?: React.CSSProperties; className?: string; }
/** Breadcrumb trail; last item is the current page. */

/**
 * AgniUI · Breadcrumbs
 * items: [{label, icon?, onClick?}]. Last item is the current page (non-clickable).
 *
 * Tailwind v4 (migrated Aug 2026, tranche 3). The two onMouseEnter/Leave
 * handlers that wrote colour straight onto the node are gone — hover is a
 * `hover:` class on the clickable crumb only, so a trail no longer mutates the
 * DOM on every pointer move and the last crumb can never be hovered by mistake.
 */
const NAV = "flex items-center gap-1 flex-wrap";
const CRUMB = "inline-flex items-center gap-1 text-sm whitespace-nowrap";
/* Current page vs. an ancestor. Each block owns colour, weight and cursor, so
   no two of them can race on emit order. */
const CURRENT = "font-semibold text-fg-primary cursor-default";
const LINK = "font-medium text-fg-tertiary cursor-pointer hover:text-fg-brand transition-colors duration-fast ease-standard";
const STATIC = "font-medium text-fg-tertiary cursor-default";
const SEP = "ph ph-caret-right text-xs text-fg-disabled";

export function Breadcrumbs({ items = [], style = {}, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={[NAV, className].join(" ")} style={style}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        const clickable = !last && !!it.onClick;
        return (
          <React.Fragment key={i}>
            <span
              onClick={clickable ? it.onClick : undefined}
              className={[CRUMB, last ? CURRENT : clickable ? LINK : STATIC].join(" ")}>
              {it.icon && <i className={["ph", it.icon, "text-[15px]"].join(" ")} />}
              {it.label}
            </span>
            {!last && <i className={SEP} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
