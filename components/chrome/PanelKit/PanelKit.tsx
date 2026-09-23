import React, { forwardRef, useState, useRef, useEffect } from "react";
import { getFocusable, mergeRefs, useFocusTrap, useStableId } from "../../utils/interaction.tsx";
import { EmptyState } from "../../feedback/EmptyState/EmptyState.tsx";

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
export interface MenuRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  type?: "radio" | "checkbox";
  label?: React.ReactNode;
  checked?: boolean;
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

/* The popover is a small non-modal dialog (its content is free-form: labels,
   rows, actions), labelled by its trigger: focus moves in on open and back on
   close, ↑ / ↓ step between its controls, Escape closes. */
export const PanelIconMenu = forwardRef<HTMLDivElement, PanelIconMenuProps>(function PanelIconMenu({ icon, active, title, width = 224, children }, fwd) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const base = useStableId(null, "agni-panel-menu");
  useFocusTrap(pop, open);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={mergeRefs(fwd, ref)} className="relative shrink-0">
      <style>{`@keyframes agni-panel-menu-in { from { opacity:0; transform:scale(0.97) translateY(4px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
      <button type="button" id={base + "-trigger"} title={title} aria-label={title}
        aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? base : undefined}
        onClick={() => setOpen(o => !o)}
        className={[TRIGGER, open ? TRIGGER_OPEN : active ? TRIGGER_ACTIVE : TRIGGER_REST].join(" ")}>
        <i aria-hidden="true" className={"ph " + icon} />
        {active && <span className={DOT}><span className="sr-only">(active)</span></span>}
      </button>
      {open && (
        <div ref={pop} id={base} role="dialog" aria-labelledby={base + "-trigger"}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); return; }
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
            const items = getFocusable(pop.current);
            const at = items.indexOf(document.activeElement as HTMLElement);
            const next = items[(at + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
            if (next) { e.preventDefault(); next.focus(); }
          }}
          className={POPOVER} style={{ width, animation: "agni-panel-menu-in var(--dur-fast) ease" }}>
          {children}
        </div>
      )}
    </div>
  );
});

export const MenuRow = forwardRef<HTMLButtonElement, MenuRowProps>(function MenuRow({ type, label, checked, className = "", ...rest }, ref) {
  return (
    <button {...rest} ref={ref} type="button"
      role={type === "radio" ? "radio" : type === "checkbox" ? "checkbox" : undefined}
      aria-checked={type ? !!checked : undefined}
      className={[ROW, className].join(" ")}>
      <span aria-hidden="true" className={[MARK, type === "radio" ? "rounded-full" : "rounded-xs", checked ? MARK_ON : MARK_OFF].join(" ")}>
        {checked && <i className={type === "radio" ? "ph-bold ph-circle" : "ph-bold ph-check"}
          style={{ fontSize: type === "radio" ? 7 : 11 }} />}
      </span>
      {label}
    </button>
  );
});

/** Side-panel empty state — the DS EmptyState at panel size, unbordered. */
export const PanelEmpty = forwardRef<HTMLDivElement, PanelEmptyProps>(function PanelEmpty({ icon, text, title, action }, ref) {
  return <EmptyState ref={ref} icon={icon} size="sm" bordered={false} title={title ?? text} message={title ? text : undefined} action={action} />;
});

export const PanelKit = { PanelIconMenu, MenuRow, PanelEmpty, panelMenuLabelStyle, panelMenuLabelCls };
