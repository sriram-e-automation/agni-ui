import React from "react";

/* ── Types (mirrored in DetailSection.d.ts) ── */

/* Tailwind v4 (migrated Aug 2026, tranche 7a). Two props stay inline because
   they are caller-supplied values: `minCol` (the grid's minmax floor) and
   `pad` (any number). */
const SHELL = "bg-surface-card border border-line-subtle rounded-lg shadow-e-xs overflow-hidden";
const HEAD = "flex items-center gap-2 px-4 py-3 border-b border-line-subtle bg-surface-soft";
const EDIT = "border-none bg-transparent cursor-pointer p-[2px] inline-flex text-fg-tertiary text-[15px] hover:text-fg-brand transition-colors duration-fast";

export function DetailSection({ icon, title, desc, actions, onEdit, grid = true, minCol = 200, pad = 16, children, style }) {
  return (
    <div className={SHELL} style={style}>
      {(title || icon || actions || onEdit) && (
        <div className={HEAD}>
          {icon && <i className={["ph", icon, "text-[16px] text-fg-brand shrink-0"].join(" ")} />}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-fg-primary">{title}</span>
            {desc && <p className="mt-px mb-0 mx-0 text-2xs text-fg-tertiary">{desc}</p>}
          </div>
          {actions}
          {onEdit && (
            <button type="button" title={"Edit " + (typeof title === "string" ? title : "section")} onClick={onEdit} className={EDIT}>
              <i className="ph-fill ph-pencil-simple" />
            </button>
          )}
        </div>
      )}
      <div className={grid ? "grid gap-[var(--space-3)_var(--space-5)]" : undefined}
        style={{ padding: pad, ...(grid ? { gridTemplateColumns: "repeat(auto-fill, minmax(" + minCol + "px, 1fr))" } : {}) }}>
        {children}
      </div>
    </div>
  );
}
