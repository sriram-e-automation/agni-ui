import React, { forwardRef } from "react";

/* ── Types (mirrored in Breadcrumbs.d.ts) ── */
export interface Crumb {
  label: React.ReactNode;
  icon?: string;
  /** Renders the crumb as a link. */
  href?: string;
  /** Renders the crumb as a button (or runs alongside `href` — preventDefault for client routing). */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}
export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items?: Crumb[];
  /** Accessible name of the landmark. @default "Breadcrumb" */
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}
/** Breadcrumb trail; last item is the current page. */

/**
 * AgniUI · Breadcrumbs
 * items: [{label, icon?, href?, onClick?}]. Last item is the current page (non-clickable).
 *
 * A navigation landmark ("Breadcrumb") around an ordered list; the current page
 * carries aria-current="page"; ancestors are real links (href) or buttons
 * (onClick) so they are reachable and operable by keyboard; separators are
 * hidden from assistive tech.
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
const LINK = "font-medium text-fg-tertiary cursor-pointer hover:text-fg-brand transition-colors duration-fast ease-standard " +
  "border-none bg-transparent p-0 font-sans rounded-xs";
const STATIC = "font-medium text-fg-tertiary cursor-default";
const SEP = "ph ph-caret-right text-xs text-fg-disabled";

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items = [], label = "Breadcrumb", style = {}, className = "", ...rest },
  ref,
) {
  return (
    <nav {...rest} ref={ref} aria-label={rest["aria-label"] ?? label} className={className} style={style}>
      {/* List reset inline — `list-none` isn't in the compiled sheet. */}
      <ol className={[NAV, "m-0 p-0"].join(" ")} style={{ listStyle: "none" }}>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          const content = (
            <>
              {it.icon && <i aria-hidden="true" className={["ph", it.icon, "text-[15px]"].join(" ")} />}
              {it.label}
            </>
          );
          let crumb: React.ReactNode;
          if (last) crumb = <span aria-current="page" className={[CRUMB, CURRENT].join(" ")}>{content}</span>;
          else if (it.href) crumb = <a href={it.href} onClick={it.onClick} className={[CRUMB, LINK].join(" ")} style={{ textDecoration: "none" }}>{content}</a>;
          else if (it.onClick) crumb = <button type="button" onClick={it.onClick} className={[CRUMB, LINK].join(" ")}>{content}</button>;
          else crumb = <span className={[CRUMB, STATIC].join(" ")}>{content}</span>;
          return (
            <li key={i} className="inline-flex items-center gap-1">
              {crumb}
              {!last && <i aria-hidden="true" className={SEP} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
