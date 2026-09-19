/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState, useRef, useEffect } from "react";

/* ── Types (mirrored in MultiSelect.d.ts) ── */
export interface MultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options?: ({ value: string; label: string } | string)[];
  placeholder?: string;
  disabled?: boolean;
  /** Error state — red border + error focus ring (matches Input/Select). */
  error?: boolean;
  /** Control density — min height 32 / 38 / 44. @default "md" */
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}
/** Multi-value picker with removable chips. */


/**
 * AgniUI · MultiSelect
 * Multi-value picker. value: string[]. options: [{value,label}] | string[].
 * Selected values show as removable chips inside the control.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 11). The control's edge and ring are
 * three complete strings (error / open / rest) rather than two independent
 * ternaries — border-colour and box-shadow always change together, and
 * splitting them is how the pair drifts. Only the per-rung font size stays
 * inline; it is a lookup, not a state.
 */
const MS_CONTROL = "flex items-center gap-1 flex-wrap py-1 px-2 bg-[var(--input-bg)] border rounded-md";
/* Error EDGE is persistent; the error RING is an open-state affordance, same as
   Input's focus-within pair. Testing `error` first without re-testing `open`
   either pins the ring on or drops it entirely — both were shipped briefly. */
const MS_ERR_OPEN   = "border-[var(--input-bdr-error)] ring-focus-error";
const MS_ERR_CLOSED = "border-[var(--input-bdr-error)] [box-shadow:none]";
const MS_OPEN  = "border-[var(--input-bdr-focus)] ring-focus";
const MS_REST  = "border-[var(--input-bdr)] [box-shadow:none]";
const MS_CHIP = "inline-flex items-center gap-1 py-[2px] pr-1 pl-2 bg-surface-brand-soft text-fg-brand rounded-sm text-xs font-medium";
const MS_OPTION = "flex items-center gap-2 w-full p-2 border-none cursor-pointer rounded-sm font-sans text-sm text-fg-primary text-left";
const MS_BOX = "size-4 rounded-xs border-[1.5px] text-fg-on-brand inline-flex items-center justify-center text-[11px] shrink-0";

export function MultiSelect({ value = [], onChange, options = [], placeholder = "Select…", disabled = false, error = false, size = "md", style = {} }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  /* Height rides --density-control-h with the whole control family (Aug 2026);
     only the font size varies per size rung now. */
  const MIN_H = { sm: "min-h-control-sm", md: "min-h-control", lg: "min-h-control-lg" };
  const sizes = { sm: { fs: "var(--text-sm)" }, md: { fs: "var(--text-base)" }, lg: { fs: "var(--text-md)" } };
  const s = sizes[size] || sizes.md;

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const toggle = (v) => { const has = value.includes(v); onChange && onChange(has ? value.filter((x) => x !== v) : [...value, v]); };

  return (
    <div ref={ref} className="relative" style={style}>
      <div onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          MIN_H[size] || MIN_H.md, MS_CONTROL,
          error ? (open ? MS_ERR_OPEN : MS_ERR_CLOSED) : open ? MS_OPEN : MS_REST,
          disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : "cursor-pointer opacity-100",
        ].join(" ")}>
        {value.length === 0 && <span className="text-[var(--input-placeholder)]" style={{ fontSize: s.fs }}>{placeholder}</span>}
        {value.map((v) => {
          const o = opts.find((x) => x.value === v);
          return (
            <span key={v} className={MS_CHIP}>
              {o ? o.label : v}
              <span onClick={(e) => { e.stopPropagation(); toggle(v); }} className="cursor-pointer inline-flex text-[12px]"><i className="ph ph-x" /></span>
            </span>
          );
        })}
        <i className={(open ? "ph ph-caret-up" : "ph ph-caret-down") + " ml-auto text-[14px] text-fg-tertiary"} />
      </div>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-dropdown bg-surface-card border border-line-default rounded-md shadow-e-lg p-1 max-h-[var(--max-h-menu)] overflow-y-auto">
          {opts.map((o) => {
            const on = value.includes(o.value);
            return (
              <button key={o.value} type="button" onClick={() => toggle(o.value)}
                className={[MS_OPTION, on ? "bg-surface-brand-soft" : "bg-transparent"].join(" ")}>
                <span className={[MS_BOX, on ? "border-action-brand bg-action-brand" : "border-line-strong bg-transparent"].join(" ")}>{on && <i className="ph-bold ph-check" />}</span>
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
