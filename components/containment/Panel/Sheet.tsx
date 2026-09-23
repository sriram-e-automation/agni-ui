/**
 * @internal Renderer behind the public <Panel> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useRef } from "react";
import { mergeRefs, useFocusTrap, useScrollLock, useStableId } from "../../utils/interaction.tsx";
import { Tooltip } from "../../feedback/Tooltip/Tooltip.tsx";

/* ── Types (mirrored in Sheet.d.ts) ── */
export interface SheetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional Phosphor icon name shown beside the title, e.g. "ph-plus". */
  icon?: string;
  /** Sticky action bar content (buttons). */
  footer?: React.ReactNode;
  /** Scrollable body. */
  children?: React.ReactNode;
  /** Max width of the centred sheet. Default var(--sheet-max-w). */
  maxWidth?: number | string;
  /** Close when the scrim is clicked. Default true. */
  closeOnScrim?: boolean;
  closeOnEscape?: boolean;
  initialFocus?: React.RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
  closeLabel?: string;
  style?: React.CSSProperties;
}
/** Bottom slide-up form shell: sticky header + scrollable body + sticky footer. */

/**
 * AgniUI · Sheet
 * A centred form shell that rises from the bottom over a scrim, with a sticky
 * header (title + close), a scrollable body, and a sticky footer for actions.
 * Use it for create/edit forms that are longer than a Modal but shouldn't be a
 * full-page route. Esc and scrim-click call onClose (guarded by closeOnScrim).
 *
 * footer: node rendered in the sticky action bar. children: the scrollable body.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 5). The close button's two mouse
 * handlers — which wrote background and colour straight onto the node — are
 * gone, replaced by `hover:`. `maxWidth` stays inline: it is a caller-supplied
 * value that may be a number or any CSS length.
 */
const WRAP = "fixed inset-0 z-overlay flex items-end justify-center font-sans";
const SCRIM = "absolute inset-0 bg-[var(--scrim)] [backdrop-filter:blur(2px)]";
const PANEL =
  "relative w-full max-h-[calc(100vh-40px)] flex flex-col bg-surface-card " +
  "border border-line-default border-b-0 " +
  "rounded-t-[var(--sheet-radius)] shadow-e-2xl";
const HEAD =
  "shrink-0 flex items-center gap-3 px-[var(--sheet-pad-x)] h-[var(--sheet-header-h)] " +
  "border-b border-line-subtle";
const ICON =
  "size-[34px] shrink-0 rounded-md bg-surface-brand-soft text-fg-brand " +
  "inline-flex items-center justify-center text-[18px]";
const TITLE = "text-lg font-semibold text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap";
const SUB = "text-xs text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap";
const CLOSE =
  "size-[36px] shrink-0 border border-line-default rounded-md bg-surface-soft text-fg-secondary " +
  "cursor-pointer inline-flex items-center justify-center text-[18px] " +
  "transition-colors duration-fast hover:bg-surface-sunken hover:text-fg-primary";
const BODY = "flex-1 min-h-0 min-w-0 overflow-y-auto p-[var(--sheet-pad-y)_var(--sheet-pad-x)]";
const FOOT =
  "shrink-0 flex items-center justify-end gap-2 px-[var(--sheet-pad-x)] " +
  "min-h-[var(--sheet-footer-h)] border-t border-line-subtle bg-surface-card";

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(function Sheet({
  open = false,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  children,
  maxWidth = "var(--sheet-max-w)",
  closeOnScrim = true,
  closeOnEscape = true,
  initialFocus,
  restoreFocus = true,
  closeLabel = "Close",
  id,
  onKeyDown,
  style = {},
  ...rest
}, ref) {
  const panel = useRef<HTMLDivElement>(null);
  const base = useStableId(id, "agni-sheet");
  useFocusTrap(panel, open, { initialFocus, restoreFocus });
  useScrollLock(open);

  if (!open) return null;

  return (
    <div className={WRAP}>
      <div aria-hidden="true" onClick={() => closeOnScrim && onClose && onClose()} className={SCRIM}
        style={{ animation: "agni-fade-in var(--dur-fast) var(--ease-standard)" }} />
      <div
        {...rest}
        ref={mergeRefs(ref, panel)}
        id={base}
        role="dialog"
        aria-modal="true"
        aria-labelledby={rest["aria-labelledby"] ?? (title ? base + "-title" : undefined)}
        aria-describedby={rest["aria-describedby"] ?? (subtitle ? base + "-subtitle" : undefined)}
        tabIndex={-1}
        onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented && closeOnEscape && e.key === "Escape") { e.stopPropagation(); onClose?.(); } }}
        onClick={(e) => e.stopPropagation()}
        className={PANEL}
        style={{ maxWidth, animation: "agni-sheet-up var(--dur-normal) var(--ease-emphasized)", outline: "none", ...style }}
      >
        {/* Sticky header */}
        <div className={HEAD}>
          {icon && <span aria-hidden="true" className={ICON}><i className={"ph-bold " + icon} /></span>}
          <div className="flex-1 min-w-0 leading-tight">
            {title && <h2 id={base + "-title"} className={[TITLE, "m-0 font-sans"].join(" ")} style={{ letterSpacing: "normal", lineHeight: "inherit" }}>{title}</h2>}
            {subtitle && <div id={base + "-subtitle"} className={SUB}>{subtitle}</div>}
          </div>
          <Tooltip label={closeLabel} side="bottom">
            <button type="button" onClick={() => onClose && onClose()} aria-label={closeLabel} className={CLOSE}>
              <i aria-hidden="true" className="ph ph-x" />
            </button>
          </Tooltip>
        </div>

        {/* Scrollable body */}
        <div className={BODY}>{children}</div>

        {/* Sticky footer */}
        {footer && <div className={FOOT}>{footer}</div>}
      </div>

      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-sheet-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
});
