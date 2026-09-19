import React, { useState, useRef, useEffect } from "react";
import { roleAllows } from "./RoleGate.tsx";

/* ── Types (mirrored in DropdownMenu.d.ts) ── */
export interface MenuItem { label: React.ReactNode; icon?: string; onClick?: () => void; danger?: boolean; }
export interface DropdownMenuProps {
  /** Element that opens the menu (e.g. an IconButton). */
  trigger: React.ReactNode;
  /** Menu items, plus literal "divider". */
  items?: (MenuItem | "divider")[];
  align?: "start" | "end";
  /** Blocks opening; dims the trigger. */
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
/** Click-to-open action menu anchored to a trigger. */

/**
 * AgniUI · DropdownMenu
 * Click `trigger` to open a menu of items. items: [{label,icon,onClick,danger?}]
 * or the string "divider". Anchors below-left by default; align="end" flips right.
 *
 * Tailwind v4 (migrated Aug 2026). Item hover was an inline
 * onMouseEnter/onMouseLeave pair writing e.currentTarget.style.background —
 * now `hover:` classes, one string per item kind. The @keyframes stays in a
 * <style> tag: an entrance animation cannot be expressed as a utility.
 */
/* Shared with SplitButton so the two menu panels can never drift. Lower-case
   names on purpose: a capitalised export would be exposed on the public window
   namespace as if it were a component. */
export const menuPanelCls =
  "absolute top-[calc(100%+6px)] z-dropdown min-w-[var(--min-w-menu)] " +
  "bg-surface-card border border-line-default rounded-md shadow-e-xl p-1";

export const menuItemCls =
  "flex items-center gap-2 w-full px-2 py-2 border-none rounded-sm cursor-pointer " +
  "text-left bg-transparent font-sans text-sm font-medium " +
  "transition-colors duration-fast text-fg-secondary hover:bg-surface-soft";

export const menuItemDangerCls =
  "flex items-center gap-2 w-full px-2 py-2 border-none rounded-sm cursor-pointer " +
  "text-left bg-transparent font-sans text-sm font-medium " +
  "transition-colors duration-fast text-status-error hover:bg-status-error-soft";

export function DropdownMenu({ trigger, items = [], align = "start", disabled = false, role = "", style = {}, className = "" }: DropdownMenuProps) {
  /* Role gating happens here rather than at the call site because a menu is
     where withheld actions live, and a page filtering its own array would have
     to re-implement the check and tidy up the dividers left behind. */
  const visible = (() => {
    const kept = items.filter((it) => it === "divider" || roleAllows(role, it.roles));
    /* Drop dividers that a removed item left stranded at an edge or doubled. */
    return kept.filter((it, i, a) => it !== "divider" || (i > 0 && i < a.length - 1 && a[i - 1] !== "divider"));
  })();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);

  return (
    <div
      ref={ref}
      className={["relative inline-flex", disabled ? "opacity-[var(--state-disabled-opacity)]" : "", className].join(" ")}
      style={style}
    >
      <span
        onClick={() => !disabled && setOpen((o) => !o)}
        className={disabled ? "inline-flex cursor-not-allowed" : "inline-flex"}
      >
        {trigger}
      </span>
      {open && (
        <div className={[menuPanelCls, align === "end" ? "right-0" : "left-0", "animate-[agni-menu-in_var(--dur-fast)_var(--ease-standard)]"].join(" ")}>
          {visible.map((it, i) => it === "divider"
            ? <div key={"d" + i} className="h-px bg-line-subtle my-1" />
            : (
              <button key={i} type="button" onClick={() => { it.onClick && it.onClick(); setOpen(false); }}
                className={it.danger ? menuItemDangerCls : menuItemCls}>
                {it.icon && <i className={"ph " + it.icon} style={{ fontSize: 16 }} />}{it.label}
              </button>
            ))}
        </div>
      )}
      <style>{`@keyframes agni-menu-in{from{opacity:0;transform:translateY(-4px)}}`}</style>
    </div>
  );
}
