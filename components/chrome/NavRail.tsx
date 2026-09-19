import React, { useState } from "react";
import { IconButton } from "../core/IconButton.tsx";
import { roleAllows } from "../core/RoleGate.tsx";

export interface NavRailItem { key: string; label: string; icon: string; roles?: string[]; sub?: { key: string; label: string; roles?: string[] }[]; }
export interface NavRailProps {
  items?: NavRailItem[];
  /** Active page key (matches an item or sub-item key). */
  active?: string;
  onSelect?: (key: string) => void;
  /** Expanded (drawer) vs collapsed (icon rail). */
  open?: boolean;
  onToggleOpen?: (open: boolean) => void;
  /** Overlay-drawer mode (tablet/phone): the toggle becomes ×, selecting closes. */
  overlay?: boolean;
  /** In overlay mode the rail supplies its own scrim + slide-in panel. Pass
   *  false only when a host already provides them. @default true */
  scrim?: boolean;
  onClose?: () => void;
  dark?: boolean;
  /** Small signature logo pinned at the bottom while open. */
  footerLogoSrc?: string;
  /** Group keys expanded initially. */
  defaultExpanded?: string[];
}

/**
 * AgniUI · NavRail
 * The desk-app left nav — items-driven, with expandable sub-groups, a
 * collapse toggle (drawer ⇄ icon rail), an overlay-drawer mode for
 * tablet/phone, and collapsed-state active tick + tooltips. Width comes
 * from the host container (--rail-drawer-w-md / --rail-w).
 */
/* Light and dark are two tables of COMPLETE class strings. The `dark` prop is
   the documented explicit override (theming otherwise comes from the nearest
   [data-theme] scope), and three values differ between the two: the rail bed,
   the active row fill and the hover fill. */
const RAIL = "w-full h-full flex flex-col border-r border-line-subtle overflow-y-auto overflow-x-hidden";
const BED = { light: "bg-surface-card", dark: "bg-surface-page" };
const HEAD_OPEN = "flex items-center justify-between pt-[14px] px-[14px] pb-[10px] border-b border-line-subtle shrink-0";
const HEAD_SHUT = "flex items-center justify-center pt-[14px] pb-[10px] border-b border-line-subtle shrink-0";
const MENU_LABEL = "inline-flex items-center gap-2 text-fg-secondary font-medium text-sm";
const ROW = "flex items-center mx-2 my-px rounded-md cursor-pointer select-none relative transition-colors duration-fast";
const ROW_OPEN = "gap-3 justify-start px-4 py-[11px]";
const ROW_SHUT = "gap-0 justify-center px-0 py-[11px]";
const ROW_ON = { light: "bg-[var(--agni-green-600)] text-[#fff]", dark: "bg-action-brand text-[#fff]" };
const ROW_OFF = {
  light: "bg-transparent text-fg-secondary hover:bg-[var(--agni-green-50)] hover:text-fg-brand",
  dark: "bg-transparent text-fg-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-fg-brand",
};
const TICK = "absolute right-[3px] top-1/2 [transform:translateY(-50%)] w-[3px] h-4 rounded-[2px] bg-fg-brand";
const SUB = "px-4 pl-12 py-2 cursor-pointer select-none text-sm transition-colors duration-fast";
const SUB_ON = "font-medium text-fg-brand bg-surface-brand-soft";
const SUB_OFF = {
  light: "font-normal text-fg-secondary bg-transparent hover:bg-[var(--agni-green-50)] hover:text-fg-primary",
  dark: "font-normal text-fg-secondary bg-transparent hover:bg-[rgba(255,255,255,0.05)] hover:text-fg-primary",
};
const FOOT = "px-3 py-3 border-t border-line-subtle flex items-center justify-center shrink-0";

export function NavRail({ items = [], active, onSelect, open = true, onToggleOpen, overlay = false, scrim = true, onClose, dark = false, footerLogoSrc, defaultExpanded = [], role = "" }: NavRailProps) {
  /* A desk shows only the pages its role can reach. A parent whose every
     sub-item is withheld is withheld too, so no empty group is left behind. */
  const nav = items
    .filter((it) => roleAllows(role, it.roles))
    .map((it) => (it.sub ? { ...it, sub: it.sub.filter((s) => roleAllows(role, s.roles)) } : it))
    .filter((it) => !(it.sub && it.sub.length === 0));
  /* The `hovered` useState is gone: it re-rendered the whole rail on every
     pointer move and made a parent and its sub-item fight over one slot. Each
     row now owns its own :hover. */
  const [expanded, setExpanded] = useState(() => Object.fromEntries(defaultExpanded.map(k => [k, true])));
  const isParentActive = (item) => active === item.key || (item.sub && item.sub.some(s => s.key === active));
  const mode = dark ? "dark" : "light";
  const select = (key) => { onSelect && onSelect(key); overlay && onClose && onClose(); };
  const rail = (
    <div className={[RAIL, BED[mode]].join(" ")}>
      <div className={open ? HEAD_OPEN : HEAD_SHUT}>
        {open && <span className={MENU_LABEL}><i className="ph ph-list" /> Menu</span>}
        <IconButton icon={<i className={overlay ? "ph ph-x" : (open ? "ph ph-sidebar-simple" : "ph ph-sidebar")} />} variant="ghost" size="sm" onClick={() => overlay ? (onClose && onClose()) : (onToggleOpen && onToggleOpen(!open))} title={overlay ? "Close" : (open ? "Collapse" : "Expand")} />
      </div>
      <div className="flex-1 min-w-0 py-2">
        {nav.map(item => {
          const pActive = isParentActive(item), hasSub = item.sub && item.sub.length > 0, isOpen = expanded[item.key];
          return (
            <div key={item.key}>
              <div
                onClick={() => hasSub ? setExpanded(p => ({ ...p, [item.key]: !p[item.key] })) : select(item.key)}
                title={!open ? item.label : undefined}
                className={[ROW, open ? ROW_OPEN : ROW_SHUT, pActive ? ROW_ON[mode] : ROW_OFF[mode]].join(" ")}>
                <i className={["ph", item.icon, "text-[20px] shrink-0"].join(" ")} />
                {open && <>
                  <span className={["flex-1 min-w-0 text-sm", pActive ? "font-semibold" : "font-medium"].join(" ")}>{item.label}</span>
                  {hasSub && <i className={["ph", isOpen ? "ph-caret-up" : "ph-caret-down", "text-xs opacity-[0.7]"].join(" ")} />}
                </>}
                {!open && pActive && <span className={TICK} />}
              </div>
              {open && hasSub && isOpen && (
                <div className="mb-1">
                  {item.sub.map(sub => (
                    <div key={sub.key} onClick={() => select(sub.key)}
                      className={[SUB, active === sub.key ? SUB_ON : SUB_OFF[mode]].join(" ")}>
                      {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {open && footerLogoSrc && (
        <div className={FOOT}>
          <img src={footerLogoSrc} alt="" className={["h-[18px]", dark ? "opacity-[0.4]" : "opacity-[0.5]"].join(" ")} />
        </div>
      )}
    </div>
  );
  /* Overlay mode owns its scrim and slide-in panel, so a host never hand-rolls
     a drawer around the rail. The scrim's opacity and the panel's transform are
     driven by `open` and stay inline — they animate between two runtime values
     rather than switching between two static looks. */
  if (overlay && scrim) {
    return (
      <div className="fixed inset-0 z-overlay" style={{ pointerEvents: open ? "auto" : "none" }}>
        <div onClick={onClose} className="absolute inset-0 bg-[var(--scrim)] [backdrop-filter:blur(2px)] transition-[opacity] duration-normal ease-standard"
          style={{ opacity: open ? 1 : 0 }}></div>
        <div className="absolute left-0 top-0 bottom-0 w-[min(var(--rail-drawer-w-md),84vw)] shadow-e-xl transition-[transform] duration-normal ease-standard"
          style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}>
          {rail}
        </div>
      </div>
    );
  }
  return rail;
}
