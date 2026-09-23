/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useRef, useState, useEffect } from "react";

/* ── Types (mirrored in CreatableSelect.d.ts) ── */
export interface CreatableOption {
  value: string;
  label: string;
}
export interface CreatableSelectProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** Called when the user adds a new option. Return the new value (or a Promise);
   *  if omitted, the typed label becomes the value. */
  onCreate?: (label: string) => string | Promise<string> | void;
  options?: Array<string | CreatableOption>;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Verb shown in the create row, e.g. "Add". Default "Add". */
  createLabel?: string;
  disabled?: boolean;
  error?: boolean;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}
/** Search-select that can add a new option inline when nothing matches. */


/**
 * AgniUI · CreatableSelect
 * Search-and-select that also lets the user ADD a new option inline when their
 * query matches nothing. onChange → value; onCreate(label) → should return the
 * new option's value (or a Promise of it); if omitted the label becomes the value.
 * options: string[] or { value, label }[].
 */
function norm(options) {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

/* Same trigger/menu shell as SearchSelect, kept local for the same reason. */
const CS_TRIGGER = "flex items-center gap-2 px-2 border rounded-md transition-[border-color,box-shadow] duration-fast ease-standard";
const CS_ROW = "flex items-center gap-2 p-2 rounded-sm cursor-pointer text-sm";

export function CreatableSelect({
  value = null,
  onChange,
  onCreate,
  options = [],
  placeholder = "Select or add…",
  searchPlaceholder = "Search or type to add…",
  createLabel = "Add",
  disabled = false,
  error = false,
  clearable = true,
  size = "md",
  style = {},
}: CreatableSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState([]); // locally-created options
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  useEffect(() => { if (open) setQ(""); }, [open]);

  const opts = [...norm(options), ...extra];
  const sel = opts.find((o) => o.value === value);
  const ql = q.trim().toLowerCase();
  const filtered = opts.filter((o) => !ql || o.label.toLowerCase().includes(ql));
  const exactMatch = opts.some((o) => o.label.toLowerCase() === ql);
  const canCreate = ql.length > 0 && !exactMatch;
  /* Height rides --density-control-h with the whole control family (Aug 2026). */
  const H_CLS = { sm: "h-control-sm", md: "h-control", lg: "h-control-lg" }[size] || "h-control";
  /* Error EDGE is persistent; the error RING is an open-state affordance (see
     Input's focus-within pair). The error branch must re-test `open` or the
     focus indication vanishes on exactly the controls that need it most. */
  const EDGE = error
    ? (open ? "border-[var(--input-bdr-error)] ring-focus-error" : "border-[var(--input-bdr-error)] [box-shadow:none]")
    : open ? "border-[var(--input-bdr-focus)] ring-focus"
    : "border-[var(--input-bdr)] [box-shadow:none]";

  const create = () => {
    const label = q.trim();
    if (!label) return;
    const v = onCreate ? onCreate(label) : label;
    const apply = (val) => { const value2 = val == null ? label : val; setExtra((e) => [...e, { value: value2, label }]); onChange && onChange(value2); setOpen(false); };
    if (v && typeof v.then === "function") v.then(apply); else apply(v);
  };

  return (
    <div ref={ref} className="relative font-sans" style={style}>
      <div onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          H_CLS, CS_TRIGGER, EDGE,
          disabled ? "bg-[var(--input-bg-disabled)] cursor-not-allowed" : "bg-[var(--input-bg)] cursor-pointer",
        ].join(" ")}>
        <span className={["flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base", sel ? "text-fg-primary" : "text-fg-tertiary"].join(" ")}>{sel ? sel.label : placeholder}</span>
        {clearable && sel && <i className="ph ph-x text-[13px] text-fg-tertiary cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); onChange && onChange(null); }} />}
        <i className={"ph ph-caret-" + (open ? "up" : "down") + " text-[12px] text-fg-tertiary shrink-0"} />
      </div>

      {open && (
        <div className="absolute z-dropdown top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-line-default rounded-md shadow-e-lg overflow-hidden">
          <div className="p-2 border-b border-line-subtle">
            <div className="flex items-center gap-2 h-[32px] px-2 border border-[var(--input-bdr)] rounded-sm bg-surface-soft">
              <i className="ph ph-magnifying-glass text-[14px] text-fg-tertiary" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && canCreate) { e.preventDefault(); create(); } }} placeholder={searchPlaceholder} data-agni-input="" className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-fg-primary" />
            </div>
          </div>
          <div className="max-h-[var(--max-h-menu)] overflow-y-auto p-1">
            {filtered.map((o) => {
              const on = o.value === value;
              /* hover: only when unselected — the old `if (!on)` guard, expressed
                 as emit order rather than as a branch inside a handler. */
              return (
                <div key={o.value} onClick={() => { onChange && onChange(o.value); setOpen(false); }}
                  className={[
                    CS_ROW,
                    on ? "bg-surface-brand-soft text-fg-brand font-semibold"
                       : "bg-transparent text-fg-primary font-normal hover:bg-surface-soft",
                  ].join(" ")}>
                  <span className="flex-1 min-w-0">{o.label}</span>
                  {on && <i className="ph-bold ph-check text-[13px]" />}
                </div>
              );
            })}
            {filtered.length === 0 && !canCreate && <div className="p-3 text-center text-sm text-fg-tertiary">No matches</div>}
          </div>
          {canCreate && (
            <div onClick={create} className="flex items-center gap-2 py-2 px-3 border-t border-line-subtle cursor-pointer text-fg-brand text-sm font-semibold bg-transparent hover:bg-surface-brand-soft">
              <i className="ph-bold ph-plus-circle text-[16px]" />
              <span>{createLabel} “<strong>{q.trim()}</strong>”</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
