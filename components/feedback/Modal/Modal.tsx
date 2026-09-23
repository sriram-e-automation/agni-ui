import React, { useEffect } from "react";

/* ── Types (mirrored in Modal.d.ts) ── */
export interface ModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Action row, e.g. Cancel + Confirm buttons. */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Red header icon for destructive confirmations. */
  danger?: boolean;
  closeOnScrim?: boolean;
  style?: React.CSSProperties;
}
/** Centered modal dialog over a scrim (Esc + scrim-click close). */

/**
 * AgniUI · Modal / Dialog
 * Centered dialog over a scrim. Closes on scrim-click + Escape.
 * sizes: sm · md · lg. Pass `footer` for the action row; `danger` tints the header.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 4). backdrop-filter is written as an
 * arbitrary PROPERTY, not `backdrop-blur-[3px]`: that utility composes through
 * nine --tw-backdrop-* custom properties declared inside a component-style
 * selector, which the DS token compiler flags. Entrance animations stay inline
 * against the component's own local keyframes.
 */
const WIDTH = { sm: "max-w-[400px]", md: "max-w-[520px]", lg: "max-w-[720px]" } as const;

const SCRIM =
  "fixed inset-0 z-modal flex items-center justify-center p-6 " +
  "bg-[var(--modal-scrim)] [backdrop-filter:blur(3px)]";
const PANEL =
  "w-full max-h-[var(--max-h-modal)] flex flex-col bg-[var(--modal-bg)] " +
  "border border-line-default rounded-xl shadow-e-2xl overflow-hidden";
const HEAD = "flex items-center gap-3 px-5 py-4 border-b border-line-subtle";
const DANGER_CHIP =
  "w-[30px] h-[30px] rounded-md bg-status-error-soft text-status-error " +
  "inline-flex items-center justify-center text-[17px] shrink-0";
const CLOSE =
  "w-[30px] h-[30px] shrink-0 border-none bg-transparent text-fg-tertiary cursor-pointer " +
  "text-[17px] rounded-sm transition-colors duration-fast hover:text-fg-primary";
const BODY = "px-5 py-5 overflow-y-auto text-base text-fg-secondary leading-normal";
const FOOT = "flex justify-end gap-2 px-5 py-3 border-t border-line-default bg-[var(--modal-bg)]";

export function Modal({
  open = false,
  onClose,
  title,
  children,
  footer = null,
  size = "md",
  danger = false,
  closeOnScrim = true,
  style = {},
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div onClick={() => closeOnScrim && onClose && onClose()} className={SCRIM}
      style={{ animation: "agni-fade-in var(--dur-normal) var(--ease-standard)" }}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className={[PANEL, WIDTH[size] || WIDTH.md].join(" ")}
        style={{ animation: "agni-scale-pop var(--dur-normal) var(--ease-spring)", ...style }}>
        {title && (
          <div className={HEAD}>
            {danger && <span className={DANGER_CHIP}><i className="ph-fill ph-warning" /></span>}
            <span className="flex-1 min-w-0 text-md font-semibold text-fg-primary">{title}</span>
            <button type="button" onClick={onClose} className={CLOSE}><i className="ph ph-x" /></button>
          </div>
        )}
        <div className={BODY}>{children}</div>
        {footer && <div className={FOOT}>{footer}</div>}
      </div>
      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-scale-pop{from{opacity:0;transform:scale(.96) translateY(8px)}}`}</style>
    </div>
  );
}
