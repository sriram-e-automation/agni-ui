import React, { forwardRef } from "react";

/* ── Types (mirrored in Pagination.d.ts) ── */
export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** 1-based current page. */
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  /** e.g. "1–25 of 312". */
  totalLabel?: React.ReactNode;
  /** Accessible names — override for localisation. */
  labels?: { nav?: string; previous?: string; next?: string; page?: (n: number) => string };
  style?: React.CSSProperties;
}
/** Windowed pager with prev/next. */

/**
 * AgniUI · Pagination
 * page (1-based), pageCount, onChange. Shows windowed page buttons + prev/next.
 * A navigation landmark ("Pagination"); the current page carries
 * aria-current="page"; every button is named ("Page 4", "Next page").
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7a). Prev/next use disabled: variants
 * instead of the old computed opacity/cursor ternaries.
 */
const BTN =
  "min-w-[32px] h-[32px] px-2 border rounded-md font-data text-sm inline-flex items-center justify-center " +
  "transition-[background-color,border-color,color] duration-fast " +
  "enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-[0.4]";
const BTN_ON = "border-line-brand bg-surface-brand-soft text-fg-brand font-semibold";
const BTN_OFF = "border-line-default bg-surface-card text-fg-secondary font-normal enabled:hover:border-line-brand";

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page = 1, pageCount = 1, onChange, totalLabel = null, labels = {}, style = {}, className = "", ...rest },
  ref,
) {
  const L = { nav: "Pagination", previous: "Previous page", next: "Next page", page: (n: number) => "Page " + n, ...labels };
  const go = (p: number) => { if (p >= 1 && p <= pageCount && p !== page) onChange && onChange(p); };
  const pages: (number | "…")[] = [];
  const win = 1;
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || (i >= page - win && i <= page + win)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav {...rest} ref={ref} aria-label={rest["aria-label"] ?? L.nav} className={["flex items-center justify-between gap-3", className].join(" ")} style={style}>
      {totalLabel && <span className="text-sm text-fg-tertiary">{totalLabel}</span>}
      <div className="flex items-center gap-1 ml-auto">
        <button type="button" aria-label={L.previous} onClick={() => go(page - 1)} disabled={page <= 1} className={[BTN, BTN_OFF].join(" ")}><i aria-hidden="true" className="ph ph-caret-left" /></button>
        {pages.map((p, i) => p === "…"
          ? <span key={"e" + i} aria-hidden="true" className="text-fg-tertiary px-[2px]">…</span>
          : <button key={p} type="button" aria-label={L.page(p)} aria-current={p === page ? "page" : undefined} onClick={() => go(p)} className={[BTN, p === page ? BTN_ON : BTN_OFF].join(" ")}>{p}</button>)}
        <button type="button" aria-label={L.next} onClick={() => go(page + 1)} disabled={page >= pageCount} className={[BTN, BTN_OFF].join(" ")}><i aria-hidden="true" className="ph ph-caret-right" /></button>
      </div>
    </nav>
  );
});
