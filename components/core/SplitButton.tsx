/**
 * @internal Renderer behind the public <Button> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState, useRef, useEffect } from "react";
import { ButtonBase as Button } from "./ButtonBase.tsx";
import { menuPanelCls, menuItemCls, menuItemDangerCls } from "./DropdownMenu.tsx";

/* ── Types (mirrored in SplitButton.d.ts) ── */
export interface SplitItem { label: React.ReactNode; icon?: string; onClick?: () => void; danger?: boolean; }
export interface SplitButtonProps {
  children?: React.ReactNode;
  /** Main (default) action. */
  onClick?: () => void;
  /** Secondary actions in the caret menu. */
  items?: SplitItem[];
  category?: "primary" | "secondary" | "danger";
  /** Alias for `category` — the DS-wide word for a visual variant. */
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}
/** Primary action + caret menu of secondary actions. */

/**
 * AgniUI · SplitButton
 * Primary action + a caret that opens secondary actions.
 * children = main label; onClick = main action; items = [{label,icon,onClick,danger?}].
 *
 * Tailwind v4 (migrated Aug 2026). The caret shares the menu class strings with
 * DropdownMenu so the two panels can never drift, and its height reads the same
 * --density-control-h token as ButtonBase.
 */
const CARET_H = { sm: "h-control-sm", md: "h-control", lg: "h-control-lg" } as const;

const CARET_CAT = {
  primary: "bg-action-brand text-fg-on-brand enabled:hover:bg-action-brand-hover",
  secondary: "bg-surface-card text-fg-secondary ring-inset-line enabled:hover:bg-surface-soft",
  danger: "bg-status-error text-fg-on-brand enabled:hover:bg-status-error-hover",
} as const;

const CARET_BASE =
  "inline-flex items-center justify-center w-[34px] ml-px border-none cursor-pointer " +
  "rounded-r-md text-[15px] transition-colors duration-fast outline-none " +
  "focus-visible:focus-ring disabled:cursor-not-allowed " +
  "disabled:opacity-[var(--state-disabled-opacity)]";

export function SplitButton({ children, onClick, items = [], variant, category = "primary", size = "md", icon = null, disabled = false, style = {} }: SplitButtonProps) {
  category = variant || category;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex" style={style}>
      <Button category={category} size={size} icon={icon} onClick={onClick} disabled={disabled}
        /* Radius join stays inline: `rounded-md` vs `rounded-r-none` resolve by
           emit order in the generated sheet, not class order (README rule 5),
           so a utility here would be a coin flip. */
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>{children}</Button>
      <button
        type="button" disabled={disabled} onClick={() => setOpen((o) => !o)} aria-label="More actions"
        aria-expanded={open}
        className={[CARET_BASE, CARET_H[size] || CARET_H.md, CARET_CAT[category] || CARET_CAT.primary].join(" ")}
      >
        <i className={open ? "ph ph-caret-up" : "ph ph-caret-down"} />
      </button>
      {open && (
        <div className={[menuPanelCls, "right-0"].join(" ")}>
          {items.map((it, i) => (
            <button key={i} type="button" onClick={() => { it.onClick && it.onClick(); setOpen(false); }}
              className={it.danger ? menuItemDangerCls : menuItemCls}>
              {it.icon && <i className={"ph " + it.icon} style={{ fontSize: 16 }} />}{it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
