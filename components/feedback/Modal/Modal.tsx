import React, { forwardRef, useRef } from "react";
import { mergeRefs, useFocusTrap, useScrollLock, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Modal.d.ts) ── */
export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
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
  /** Close on Escape. @default true */
  closeOnEscape?: boolean;
  /** Element to focus on open — default: the first focusable in the body, else the panel. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** Return focus to the opener on close. @default true */
  restoreFocus?: boolean;
  /** Accessible name of the close button. @default "Close" */
  closeLabel?: string;
  /** "alertdialog" for confirmations that interrupt. @default "dialog" (auto "alertdialog" when danger) */
  role?: "dialog" | "alertdialog";
  style?: React.CSSProperties;
}
/** Centered modal dialog over a scrim (Esc + scrim-click close). */

/**
 * AgniUI · Modal / Dialog
 * Centered dialog over a scrim. Closes on scrim-click + Escape.
 * sizes: sm · md · lg. Pass `footer` for the action row; `danger` tints the header.
 *
 * WAI-ARIA modal dialog: labelled by its title, described by its body, focus
 * moved in on open (initialFocus → first focusable → panel), trapped while
 * open, returned to the opener on close. Escape is handled on the dialog
 * itself, so nested dialogs close one at a time. Page scroll is locked while
 * open. A scrim click closes only when the press also started on the scrim.
 * The ref is the dialog panel.
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

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal({
  open = false,
  onClose,
  title,
  children,
  footer = null,
  size = "md",
  danger = false,
  closeOnScrim = true,
  closeOnEscape = true,
  initialFocus,
  restoreFocus = true,
  closeLabel = "Close",
  role,
  id,
  onKeyDown,
  style = {},
  ...rest
}, ref) {
  const panel = useRef<HTMLDivElement>(null);
  const pressedScrim = useRef(false);
  const base = useStableId(id, "agni-modal");
  const titleId = base + "-title";
  const bodyId = base + "-body";
  useFocusTrap(panel, open, { initialFocus, restoreFocus });

  useScrollLock(open);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => { pressedScrim.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (closeOnScrim && pressedScrim.current && e.target === e.currentTarget) onClose?.(); }}
      className={SCRIM}
      style={{ animation: "agni-fade-in var(--dur-normal) var(--ease-standard)" }}>
      <div
        {...rest}
        ref={mergeRefs(ref, panel)}
        id={base}
        role={role ?? (danger ? "alertdialog" : "dialog")}
        aria-modal="true"
        aria-labelledby={rest["aria-labelledby"] ?? (title ? titleId : undefined)}
        aria-describedby={rest["aria-describedby"] ?? bodyId}
        tabIndex={-1}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented && closeOnEscape && e.key === "Escape") { e.stopPropagation(); onClose?.(); }
        }}
        className={[PANEL, WIDTH[size] || WIDTH.md].join(" ")}
        style={{ animation: "agni-scale-pop var(--dur-normal) var(--ease-spring)", outline: "none", ...style }}>
        {title && (
          <div className={HEAD}>
            {danger && <span aria-hidden="true" className={DANGER_CHIP}><i className="ph-fill ph-warning" /></span>}
            <h2 id={titleId} className="flex-1 min-w-0 m-0 font-sans text-md font-semibold text-fg-primary" style={{ letterSpacing: "normal", lineHeight: "inherit" }}>{title}</h2>
            <button type="button" onClick={onClose} aria-label={closeLabel} className={CLOSE}><i aria-hidden="true" className="ph ph-x" /></button>
          </div>
        )}
        <div id={bodyId} className={BODY}>{children}</div>
        {footer && <div className={FOOT}>{footer}</div>}
      </div>
      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-scale-pop{from{opacity:0;transform:scale(.96) translateY(8px)}}`}</style>
    </div>
  );
});
