/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState, useRef, useEffect } from "react";

/* ── Types (mirrored in Select.d.ts) ── */
export interface SelectOption { value: string; label: string; }
export interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  /** [{value,label}] or string[] */
  options?: (SelectOption | string)[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Error state — red border + error focus ring (matches Input/SearchSelect). */
  error?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
/** Custom dropdown select with themed menu. */

/**
 * AgniUI · Select
 * Lightweight custom dropdown. options: [{value,label}] or string[].
 * onChange receives the value.
 *
 * Tailwind v4 (migrated Aug 2026). Option hover was an inline
 * onMouseEnter/onMouseLeave pair writing e.currentTarget.style.background; it is
 * now a `hover:` class. The trigger rides h-control-* with the control family.
 */
const SIZE = {
  sm: "h-control-sm px-[10px] text-sm",
  md: "h-control px-[12px] text-base",
  lg: "h-control-lg px-[14px] text-md",
} as const;
const OPT_TEXT = { sm: "text-sm", md: "text-base", lg: "text-md" } as const;

const TRIGGER =
  "flex items-center justify-between gap-2 w-full border rounded-md font-sans " +
  "transition-[border-color,box-shadow] duration-fast ease-standard outline-none";

/* Trigger border reads the layer-3 --input-bdr (→ --border-control) like the rest
   of the control family. Input and Select were the only two controls carrying
   --border-default; both moved onto the control token together (Aug 2026) so the
   pair that sits side by side in every form cannot disagree. The MENU keeps
   --border-default — menus are surfaces, not controls, and match DropdownMenu. */
const TRIGGER_IDLE = "bg-surface-card border-[var(--input-bdr)] cursor-pointer";
const TRIGGER_OPEN = "bg-surface-card border-line-brand cursor-pointer ring-focus";
const TRIGGER_ERROR = "bg-surface-card border-status-error cursor-pointer";
const TRIGGER_ERROR_OPEN = "bg-surface-card border-status-error cursor-pointer ring-focus-error";
const TRIGGER_DISABLED = "bg-surface-soft border-[var(--input-bdr)] cursor-not-allowed opacity-[var(--state-disabled-opacity)]";

const MENU =
  "absolute top-[calc(100%+4px)] left-0 right-0 z-dropdown bg-surface-card " +
  "border border-line-default rounded-md shadow-e-lg p-1 " +
  "max-h-[var(--max-h-menu)] overflow-y-auto";

const OPT =
  "flex items-center justify-between gap-2 w-full px-2 py-2 border-none cursor-pointer " +
  "rounded-sm text-left font-sans transition-colors duration-fast";
const OPT_ON = "bg-surface-brand-soft text-fg-brand font-medium";
const OPT_OFF = "bg-transparent text-fg-primary hover:bg-surface-soft";

export function SelectBasic({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  size = "md",
  disabled = false,
  error = false,
  style = {},
  className = "",
  ...rest
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const current = opts.find((o) => o.value === value);
  const s = SIZE[size] ? size : "md";

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const triggerState = disabled ? TRIGGER_DISABLED
    : error ? (open ? TRIGGER_ERROR_OPEN : TRIGGER_ERROR)
    : (open ? TRIGGER_OPEN : TRIGGER_IDLE);

  return (
    <div ref={ref} className={["relative", className].join(" ")} style={style} {...rest}>
      <button
        type="button" disabled={disabled} onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={[TRIGGER, SIZE[s], triggerState, current ? "text-fg-primary" : "text-fg-tertiary"].join(" ")}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{current ? current.label : placeholder}</span>
        <i className={[open ? "ph ph-caret-up" : "ph ph-caret-down", "shrink-0 text-[14px] text-fg-tertiary"].join(" ")} />
      </button>
      {open && (
        <div className={MENU}>
          {opts.map((o) => {
            const sel = o.value === value;
            return (
              <button
                key={o.value} type="button"
                onClick={() => { onChange && onChange(o.value); setOpen(false); }}
                className={[OPT, OPT_TEXT[s], sel ? OPT_ON : OPT_OFF].join(" ")}
              >
                {o.label}
                {sel && <i className="ph ph-check text-[14px]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
