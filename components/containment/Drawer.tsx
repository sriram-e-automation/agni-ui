/**
 * @internal Renderer behind the public <Panel> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useEffect } from "react";

/* ── Types (mirrored in Drawer.d.ts) ── */
export interface DrawerProps {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  width?: number;
  style?: React.CSSProperties;
}
/** Slide-in side panel over a scrim (detail / filters / edit). */

/**
 * AgniUI · Drawer
 * Slide-in side panel over a scrim. side: right (default) | left.
 * Used for record detail, filters, contextual editing.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 5). `width` stays inline (a
 * caller-supplied number) and so does the slide-in animation, whose name is
 * composed from `side` at runtime. The two side-dependent borders are separate
 * properties, so they are plain conditional classes with nothing to race.
 */
const SCRIM = "fixed inset-0 z-overlay bg-[var(--modal-scrim)] flex";
const PANEL = "max-w-[92vw] h-full flex flex-col bg-[var(--drawer-bg)] shadow-e-2xl";
const HEAD = "flex items-center gap-3 px-5 py-4 border-b border-line-subtle shrink-0";
const TITLE = "flex-1 min-w-0 text-md font-semibold text-fg-primary";
const CLOSE =
  "size-[30px] border-none bg-transparent text-fg-tertiary cursor-pointer text-[17px] " +
  "rounded-sm transition-colors duration-fast hover:text-fg-primary";
const BODY = "flex-1 min-w-0 overflow-y-auto p-5";
const FOOT = "flex justify-end gap-2 px-5 py-3 border-t border-line-subtle shrink-0";

export function Drawer({ open = false, onClose, title, children, footer = null, side = "right", width = 420, style = {} }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;

  return (
    <div onClick={onClose} className={[SCRIM, side === "left" ? "justify-start" : "justify-end"].join(" ")}
      style={{ animation: "agni-fade-in var(--dur-fast) var(--ease-standard)" }}>
      <div onClick={(e) => e.stopPropagation()}
        className={[PANEL, side === "right" ? "border-l border-line-default" : "border-r border-line-default"].join(" ")}
        style={{ width, animation: `agni-drawer-${side} var(--dur-normal) var(--ease-emphasized)`, ...style }}>
        {title && (
          <div className={HEAD}>
            <span className={TITLE}>{title}</span>
            <button type="button" onClick={onClose} className={CLOSE}><i className="ph ph-x" /></button>
          </div>
        )}
        <div className={BODY}>{children}</div>
        {footer && <div className={FOOT}>{footer}</div>}
      </div>
      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-drawer-right{from{transform:translateX(100%)}}@keyframes agni-drawer-left{from{transform:translateX(-100%)}}`}</style>
    </div>
  );
}
