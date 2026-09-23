import React, { forwardRef, useRef, useState } from "react";
import { roleAllows } from "../../utils/RoleGate.tsx";
import { composeHandlers, mergeRefs, useControllableState, useOutsideClick, useStableId } from "../../utils/interaction.tsx";
import { MenuPopup, type MenuPopupItem } from "./MenuPopup.tsx";

/* ── Types (mirrored in DropdownMenu.d.ts) ── */
export interface MenuItem extends MenuPopupItem {
  /** Roles allowed to see this item; omit to always show. */
  roles?: string | string[];
}
export interface DropdownMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** Element that opens the menu (e.g. a Button). Receives the ARIA + keyboard wiring. */
  trigger: React.ReactNode;
  /** Menu items, plus literal "divider". */
  items?: (MenuItem | "divider")[];
  align?: "start" | "end";
  /** Blocks opening; dims the trigger. */
  disabled?: boolean;
  /** Viewer's role — items whose `roles` exclude it are hidden. */
  role?: string;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
/** Click-to-open action menu anchored to a trigger. */

/**
 * AgniUI · DropdownMenu
 * Click `trigger` to open a menu of items. items: [{label,icon,onClick,danger?}]
 * or the string "divider". Anchors below-left by default; align="end" flips right.
 *
 * Keyboard (WAI-ARIA menu button): Enter / Space / ArrowDown on the trigger open
 * with the first item focused, ArrowUp with the last; inside, arrows, Home/End
 * and typeahead move; Escape closes back to the trigger. The trigger element is
 * cloned with `aria-haspopup`, `aria-expanded`, `aria-controls` and an id — pass
 * a DS <Button> (it forwards refs) or any focusable element.
 *
 * Tailwind v4 (migrated Aug 2026). The @keyframes stays in a <style> tag: an
 * entrance animation cannot be expressed as a utility.
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

type TriggerProps = {
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  ref?: React.Ref<HTMLElement>;
};

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu({
  trigger, items = [], align = "start", disabled = false, role = "",
  open: openProp, defaultOpen = false, onOpenChange, id, style = {}, className = "", ...rest
}, ref) {
  /* Role gating happens here rather than at the call site because a menu is
     where withheld actions live, and a page filtering its own array would have
     to re-implement the check and tidy up the dividers left behind. */
  const visible = (() => {
    const kept = items.filter((it) => it === "divider" || roleAllows(role, it.roles));
    /* Drop dividers that a removed item left stranded at an edge or doubled. */
    return kept.filter((it, i, a) => it !== "divider" || (i > 0 && i < a.length - 1 && a[i - 1] !== "divider"));
  })();
  const [open, setOpen] = useControllableState<boolean>({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [focusEdge, setFocusEdge] = useState<"first" | "last">("first");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuId = useStableId(id ? id + "-menu" : null, "agni-menu");
  const trigId = useStableId(null, "agni-menu-trigger");

  useOutsideClick([rootRef], () => setOpen(false), open);

  const show = (edge: "first" | "last") => { if (disabled) return; setFocusEdge(edge); setOpen(true); };
  const close = (restore: boolean) => { setOpen(false); if (restore) triggerRef.current?.focus(); };

  const onTriggerClick = () => { if (open) setOpen(false); else show("first"); };
  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); show("first"); }
    else if (e.key === "ArrowUp") { e.preventDefault(); show("last"); }
  };

  /* Wire the caller's trigger element; a non-element trigger gets a plain button. */
  const a11y = {
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    "aria-disabled": disabled || undefined,
  };
  let triggerNode: React.ReactNode;
  if (React.isValidElement<TriggerProps>(trigger)) {
    const tp = trigger.props;
    const tRef = (trigger as unknown as { ref?: React.Ref<HTMLElement> }).ref;
    triggerNode = React.cloneElement(trigger as React.ReactElement<TriggerProps & typeof a11y>, {
      ...a11y,
      id: tp.id ?? trigId,
      ref: mergeRefs(tRef, triggerRef),
      onClick: composeHandlers(tp.onClick, onTriggerClick),
      onKeyDown: composeHandlers(tp.onKeyDown, onTriggerKeyDown),
    });
  } else {
    triggerNode = (
      <button type="button" id={trigId} ref={(el) => { triggerRef.current = el; }} disabled={disabled} {...a11y}
        onClick={onTriggerClick} onKeyDown={onTriggerKeyDown}
        className="inline-flex items-center border-none bg-transparent p-0 cursor-pointer font-sans text-inherit">
        {trigger}
      </button>
    );
  }
  const labelledBy = (React.isValidElement<TriggerProps>(trigger) && trigger.props.id) || trigId;

  return (
    <div
      {...rest}
      ref={mergeRefs(ref, rootRef)}
      id={id}
      className={["relative inline-flex", disabled ? "opacity-[var(--state-disabled-opacity)]" : "", className].join(" ")}
      style={style}
    >
      <span className={disabled ? "inline-flex cursor-not-allowed" : "inline-flex"}>{triggerNode}</span>
      {open && (
        <MenuPopup
          id={menuId}
          items={visible}
          labelledBy={labelledBy}
          initialFocus={focusEdge}
          onClose={close}
          className={[menuPanelCls, align === "end" ? "right-0" : "left-0", "animate-[agni-menu-in_var(--dur-fast)_var(--ease-standard)]"].join(" ")}
          itemClassName={menuItemCls}
          itemDangerClassName={menuItemDangerCls}
        />
      )}
      <style>{`@keyframes agni-menu-in{from{opacity:0;transform:translateY(-4px)}}`}</style>
    </div>
  );
});
