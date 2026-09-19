/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useRef, useState, useEffect } from "react";

/* ── Types (mirrored in SearchSelect.d.ts) ── */
export interface SelectOption {
  value: string;
  label: string;
  /** Optional Phosphor icon name, e.g. "ph-user". */
  icon?: string;
}
export interface SearchSelectProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** String options, or { value, label, icon? } objects. */
  options?: Array<string | SelectOption>;
  placeholder?: string;
  searchPlaceholder?: string;
  /** @deprecated Use `empty`. */
  emptyText?: string;
  /** No-results state — string or node (e.g. an <EmptyState>). Supersedes `emptyText`. */
  empty?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  /** Show a clear (×) affordance when a value is selected. Default true. */
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}
/** Single-select with an inline search box for long option lists. */


/**
 * AgniUI · SearchSelect
 * Single-select dropdown with an inline search box for long option lists.
 * options: array of strings, or { value, label, icon? }. onChange → value.
 */
function norm(options) {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

/* Shared with UserSelect in shape, deliberately not extracted — the two差 in
   trigger content and row anatomy, and a shared shell would need props for
   every difference. */
const SS_TRIGGER = "flex items-center gap-2 px-2 border rounded-md transition-[border-color,box-shadow] duration-fast ease-standard";
const SS_MENU = "absolute z-dropdown top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-line-default rounded-md shadow-e-lg overflow-hidden";
const SS_SEARCH = "flex items-center gap-2 h-[32px] px-2 border border-[var(--input-bdr)] rounded-sm bg-surface-soft";
const SS_ROW = "flex items-center gap-2 p-2 rounded-sm cursor-pointer text-sm";

export function SearchSelect({
  value = null,
  onChange,
  options = [],
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches", empty,
  disabled = false,
  error = false,
  clearable = true,
  size = "md",
  style = {},
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  useEffect(() => { if (open) setQ(""); }, [open]);

  const opts = norm(options);
  const sel = opts.find((o) => o.value === value);
  const filtered = opts.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  /* Height rides --density-control-h with the whole control family (Aug 2026). */
  const H_CLS = { sm: "h-control-sm", md: "h-control", lg: "h-control-lg" }[size] || "h-control";
  /* Error EDGE is persistent; the error RING is an open-state affordance (see
     Input's focus-within pair). The error branch must re-test `open` or the
     focus indication vanishes on exactly the controls that need it most. */
  const EDGE = error
    ? (open ? "border-[var(--input-bdr-error)] ring-focus-error" : "border-[var(--input-bdr-error)] [box-shadow:none]")
    : open ? "border-[var(--input-bdr-focus)] ring-focus"
    : "border-[var(--input-bdr)] [box-shadow:none]";

  return (
    <div ref={ref} className="relative font-sans" style={style}>
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          H_CLS, SS_TRIGGER, EDGE,
          disabled ? "bg-[var(--input-bg-disabled)] cursor-not-allowed" : "bg-[var(--input-bg)] cursor-pointer",
        ].join(" ")}
      >
        {sel && sel.icon && <i className={"ph " + sel.icon + " text-[16px] text-fg-tertiary shrink-0"} />}
        <span className={["flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base", sel ? "text-fg-primary" : "text-fg-tertiary"].join(" ")}>{sel ? sel.label : placeholder}</span>
        {clearable && sel && <i className="ph ph-x text-[13px] text-fg-tertiary cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); onChange && onChange(null); }} />}
        <i className={"ph ph-caret-" + (open ? "up" : "down") + " text-[12px] text-fg-tertiary shrink-0"} />
      </div>

      {open && (
        <div className={SS_MENU}>
          <div className="p-2 border-b border-line-subtle">
            <div className={SS_SEARCH}>
              <i className="ph ph-magnifying-glass text-[14px] text-fg-tertiary" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} data-agni-input="" className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-fg-primary" />
            </div>
          </div>
          <div className="max-h-[var(--max-h-menu)] overflow-y-auto p-1">
            {filtered.length === 0 && <div className="p-3 text-center text-sm text-fg-tertiary">{empty ?? emptyText}</div>}
            {filtered.map((o) => {
              const on = o.value === value;
              /* The old hover handlers were guarded by `if (!on)`; as a class the
                 guard is emit order — hover: must not repaint the selected row,
                 so it is only present when the row is not selected. */
              return (
                <div key={o.value} onClick={() => { onChange && onChange(o.value); setOpen(false); }}
                  className={[
                    SS_ROW,
                    on ? "bg-surface-brand-soft text-fg-brand font-semibold"
                       : "bg-transparent text-fg-primary font-normal hover:bg-surface-soft",
                  ].join(" ")}>
                  {o.icon && <i className={"ph " + o.icon + " text-[16px] " + (on ? "text-fg-brand" : "text-fg-tertiary")} />}
                  <span className="flex-1 min-w-0">{o.label}</span>
                  {on && <i className="ph-bold ph-check text-[13px]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
