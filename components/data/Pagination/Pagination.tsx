import React from "react";

/* ── Types (mirrored in Pagination.d.ts) ── */
export interface PaginationProps {
  /** 1-based current page. */
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  /** e.g. "1–25 of 312". */
  totalLabel?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Windowed pager with prev/next. */

/**
 * AgniUI · Pagination
 * page (1-based), pageCount, onChange. Shows windowed page buttons + prev/next.
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

export function Pagination({ page = 1, pageCount = 1, onChange, totalLabel = null, style = {} }: PaginationProps) {
  const go = (p) => { if (p >= 1 && p <= pageCount && p !== page) onChange && onChange(p); };
  const pages = [];
  const win = 1;
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || (i >= page - win && i <= page + win)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="flex items-center justify-between gap-3" style={style}>
      {totalLabel && <span className="text-sm text-fg-tertiary">{totalLabel}</span>}
      <div className="flex items-center gap-1 ml-auto">
        <button type="button" onClick={() => go(page - 1)} disabled={page <= 1} className={[BTN, BTN_OFF].join(" ")}><i className="ph ph-caret-left" /></button>
        {pages.map((p, i) => p === "…"
          ? <span key={"e" + i} className="text-fg-tertiary px-[2px]">…</span>
          : <button key={p} type="button" onClick={() => go(p)} className={[BTN, p === page ? BTN_ON : BTN_OFF].join(" ")}>{p}</button>)}
        <button type="button" onClick={() => go(page + 1)} disabled={page >= pageCount} className={[BTN, BTN_OFF].join(" ")}><i className="ph ph-caret-right" /></button>
      </div>
    </div>
  );
}
