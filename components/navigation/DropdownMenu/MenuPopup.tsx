/**
 * @internal The menu panel shared by <DropdownMenu> and <Button items> (split
 * treatment) — not part of the documented API. It owns the WAI-ARIA menu
 * pattern so both menus behave identically for a keyboard user:
 *   • opens with focus on the first item (or the last, for ArrowUp on the trigger)
 *   • ArrowUp / ArrowDown move (wrapping) · Home / End jump · typing jumps by label
 *   • Enter / Space activate · Escape closes and returns focus to the trigger
 *   • Tab closes and lets focus continue from the trigger
 */
import React, { useEffect, useRef, useState } from "react";
import { getNavigationIndex, firstEnabled, useTypeahead } from "../../utils/interaction.tsx";

export interface MenuPopupItem {
  label: React.ReactNode;
  /** Phosphor icon name, e.g. "ph-trash". */
  icon?: string;
  /** Extra classes for the icon (size / colour) — replaces the default 16px. */
  iconClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
  danger?: boolean;
  disabled?: boolean;
  /** Tooltip explaining why the item is disabled. */
  disabledReason?: string;
  /** Plain-text label for typeahead when `label` is a node. */
  textValue?: string;
}
export type MenuPopupEntry = MenuPopupItem | "divider";

export interface MenuPopupProps {
  id: string;
  items: MenuPopupEntry[];
  /** Id of the trigger — the menu's accessible name. */
  labelledBy: string;
  /** Which item gets focus on open. */
  initialFocus?: "first" | "last";
  /** Called to close; `restoreFocus` says whether focus goes back to the trigger. */
  onClose: (restoreFocus: boolean) => void;
  className?: string;
  itemClassName: string;
  itemDangerClassName: string;
}

const text = (it: MenuPopupItem) =>
  it.textValue ?? (typeof it.label === "string" || typeof it.label === "number" ? String(it.label) : "");

export function MenuPopup({ id, items, labelledBy, initialFocus = "first", onClose, className = "", itemClassName, itemDangerClassName }: MenuPopupProps) {
  /* Dividers aren't focusable; keep a list of the real items and their positions. */
  const actionable = items.filter((it): it is MenuPopupItem => it !== "divider");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDisabled = (i: number) => !!actionable[i]?.disabled;
  const [active, setActive] = useState(() =>
    firstEnabled(initialFocus === "first" ? 0 : actionable.length - 1, initialFocus === "first" ? 1 : -1,
      { count: actionable.length, current: -1, isDisabled }));
  const type = useTypeahead(() => actionable.map(text), isDisabled);

  useEffect(() => { if (active >= 0) refs.current[active]?.focus({ preventScroll: false }); }, [active]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(true); return; }
    if (e.key === "Tab") { onClose(false); return; }
    const next = getNavigationIndex(e.key, { count: actionable.length, current: active, orientation: "vertical", isDisabled })
      ?? (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey ? type(e.key, active) : null);
    if (next !== null && next >= 0) { e.preventDefault(); setActive(next); }
  };

  let k = -1;
  return (
    <div id={id} role="menu" aria-labelledby={labelledBy} aria-orientation="vertical" tabIndex={-1}
      className={className} onKeyDown={onKeyDown}>
      {items.map((it, i) => {
        if (it === "divider") return <div key={"d" + i} role="separator" className="h-px bg-line-subtle my-1" />;
        const idx = ++k;
        return (
          <button
            key={i}
            ref={(el) => { refs.current[idx] = el; }}
            id={`${id}-item-${idx}`}
            type="button"
            role="menuitem"
            tabIndex={-1}
            aria-disabled={it.disabled || undefined}
            title={it.disabled ? it.disabledReason : undefined}
            onMouseEnter={() => { if (!it.disabled) setActive(idx); }}
            onClick={(e) => {
              if (it.disabled) { e.preventDefault(); return; }
              it.onClick?.(e);
              if (!e.defaultPrevented) onClose(true);
            }}
            className={[it.danger ? itemDangerClassName : itemClassName,
              it.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : ""].join(" ")}
          >
            {it.icon && <i aria-hidden="true" className={["ph", it.icon, it.iconClassName ?? ""].join(" ")} style={it.iconClassName ? undefined : { fontSize: 16 }} />}{it.label}
          </button>
        );
      })}
    </div>
  );
}
