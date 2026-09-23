/**
 * @internal Renderer behind the public <Button> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useRef, useState } from "react";
import { ButtonBase as Button, type ButtonProps as BaseProps } from "./ButtonBase.tsx";
import { menuPanelCls, menuItemCls, menuItemDangerCls } from "../../navigation/DropdownMenu/DropdownMenu.tsx";
import { MenuPopup, type MenuPopupItem } from "../../navigation/DropdownMenu/MenuPopup.tsx";
import { useOutsideClick, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Button.d.ts as ButtonMenuItem) ── */
export type SplitItem = MenuPopupItem;
export interface SplitButtonProps extends Omit<BaseProps, "category" | "variant"> {
  /** Secondary actions in the caret menu (plus literal "divider"). */
  items?: (SplitItem | "divider")[];
  category?: "primary" | "secondary" | "danger";
  /** Alias for `category` — the DS-wide word for a visual variant. */
  variant?: "primary" | "secondary" | "danger";
  /** Accessible name of the caret. @default "More actions" */
  menuLabel?: string;
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

export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton({
  children, items = [], variant, category = "primary", size = "md", disabled = false,
  menuLabel = "More actions", style = {}, className = "", ...rest
}, ref) {
  const cat = variant || category;
  const [open, setOpen] = useState(false);
  const [edge, setEdge] = useState<"first" | "last">("first");
  const wrap = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLButtonElement>(null);
  const menuId = useStableId(null, "agni-split-menu");
  const caretId = menuId + "-trigger";
  useOutsideClick([wrap], () => setOpen(false), open);

  const show = (e: "first" | "last") => { setEdge(e); setOpen(true); };

  return (
    <div ref={wrap} className={["relative inline-flex", className].join(" ")} style={style}>
      <Button {...rest} ref={ref} category={cat} size={size} disabled={disabled}
        /* Radius join stays inline: `rounded-md` vs `rounded-r-none` resolve by
           emit order in the generated sheet, not class order (README rule 5),
           so a utility here would be a coin flip. */
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>{children}</Button>
      <button
        ref={caret} id={caretId}
        type="button" disabled={disabled} aria-label={menuLabel}
        aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
        onClick={() => (open ? setOpen(false) : show("first"))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); show("first"); }
          else if (e.key === "ArrowUp") { e.preventDefault(); show("last"); }
        }}
        className={[CARET_BASE, CARET_H[size] || CARET_H.md, CARET_CAT[cat] || CARET_CAT.primary].join(" ")}
      >
        <i aria-hidden="true" className={open ? "ph ph-caret-up" : "ph ph-caret-down"} />
      </button>
      {open && (
        <MenuPopup
          id={menuId} items={items} labelledBy={caretId} initialFocus={edge}
          onClose={(restore) => { setOpen(false); if (restore) caret.current?.focus(); }}
          className={[menuPanelCls, "right-0"].join(" ")}
          itemClassName={menuItemCls} itemDangerClassName={menuItemDangerCls}
        />
      )}
    </div>
  );
});
