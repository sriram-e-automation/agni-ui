import React, { useState, useRef, useEffect } from "react";
import { EmptyState } from "../feedback/EmptyState.tsx";

export interface PanelIconMenuProps {
  /** Phosphor icon class (without "ph "). */
  icon: string;
  /** Shows the active dot + brand ring. */
  active?: boolean;
  title?: string;
  /** Popover width. @default 224 */
  width?: number;
  children?: React.ReactNode;
}
export interface MenuRowProps {
  type?: "radio" | "checkbox";
  label?: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
}
export interface PanelEmptyProps { icon: string; text?: React.ReactNode; title?: React.ReactNode; action?: React.ReactNode; }

/** Uppercase section label style for PanelIconMenu content.
 *  Kept as a STYLE OBJECT, not a class: it is spread onto callers' own elements
 *  across the scaffold, so turning it into a className would break every one. */
export const panelMenuLabelStyle: React.CSSProperties = { fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "var(--space-1) var(--space-2) var(--space-1)" };
/** The same rhythm as a class, for new markup inside a panel menu. */
export const panelMenuLabelCls = "text-2xs font-semibold tracking-wide uppercase text-fg-tertiary px-2 py-1";

/**
 * AgniUI · PanelKit
 * Primitives for workspace side-panel toolbars: PanelIconMenu (38px icon
 * trigger + anchored popover with active dot), MenuRow (radio/checkbox row),
 * PanelEmpty (centered empty state), panelMenuLabelStyle.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 6). MenuRow's two mouse handlers are
 * gone. The trigger's three-way state (rest · active · open) is a table of
 * complete class strings — `active || open` shares the brand ring, but `open`
 * alone changes the background, so the two cannot be composed by appending.
 */
const TRIGGER =
  "relative size-[38px] rounded-md border inline-flex items-center justify-center " +
  "cursor-pointer text-[17px] transition-[background-color,border-color,color] duration-fast";
const TRIGGER_REST = "border-line-default bg-surface-card text-fg-secondary hover:border-line-brand";
const TRIGGER_ACTIVE = "border-action-brand bg-surface-card text-fg-brand";
const TRIGGER_OPEN = "border-action-brand bg-surface-brand-soft text-fg-brand";
const DOT = "absolute top-[5px] right-[5px] size-[8px] rounded-full bg-action-brand border-2 border-surface-card";
const POPOVER =
  "absolute top-[44px] right-0 z-dropdown bg-surface-card border border-line-default " +
  "rounded-lg shadow-e-lg p-2";
const ROW =
  "flex items-center gap-2 w-full p-2 rounded-md border-none bg-transparent cursor-pointer " +
  "text-left font-sans text-sm text-fg-primary transition-colors duration-fast hover:bg-surface-soft";
const MARK = "size-4 shrink-0 border-[1.5px] inline-flex items-center justify-center text-[#fff] text-[11px]";
const MARK_ON = "border-action-brand bg-action-brand";
const MARK_OFF = "border-line-strong bg-transparent";

export function PanelIconMenu({ icon, active, title, width = 224, children }: PanelIconMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className="relative shrink-0">
      <style>{`@keyframes agni-panel-menu-in { from { opacity:0; transform:scale(0.97) translateY(4px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
      <button type="button" title={title} onClick={() => setOpen(o => !o)}
        className={[TRIGGER, open ? TRIGGER_OPEN : active ? TRIGGER_ACTIVE : TRIGGER_REST].join(" ")}>
        <i className={"ph " + icon} />
        {active && <span className={DOT} />}
      </button>
      {open && (
        <div className={POPOVER} style={{ width, animation: "agni-panel-menu-in var(--dur-fast) ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuRow({ type, label, checked, onClick }: MenuRowProps) {
  return (
    <button type="button" onClick={onClick} className={ROW}>
      <span className={[MARK, type === "radio" ? "rounded-full" : "rounded-xs", checked ? MARK_ON : MARK_OFF].join(" ")}>
        {checked && <i className={type === "radio" ? "ph-bold ph-circle" : "ph-bold ph-check"}
          style={{ fontSize: type === "radio" ? 7 : 11 }} />}
      </span>
      {label}
    </button>
  );
}

/** Side-panel empty state — the DS EmptyState at panel size, unbordered. */
export function PanelEmpty({ icon, text, title, action }: PanelEmptyProps) {
  return <EmptyState icon={icon} size="sm" bordered={false} title={title ?? text} message={title ? text : undefined} action={action} />;
}

export const PanelKit = { PanelIconMenu, MenuRow, PanelEmpty, panelMenuLabelStyle, panelMenuLabelCls };
