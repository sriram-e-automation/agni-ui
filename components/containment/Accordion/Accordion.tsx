import React, { forwardRef, useRef } from "react";
import { composeHandlers, getNavigationIndex, useControllableState, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Accordion.d.ts) ── */
export interface AccordionItem { key: string; title: React.ReactNode; icon?: string; content: React.ReactNode; disabled?: boolean; }
export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  items?: AccordionItem[];
  /** Allow multiple panels open at once. */
  multi?: boolean;
  /** Controlled open keys. */
  open?: string[];
  defaultOpen?: string[];
  onOpenChange?: (open: string[]) => void;
  /** Heading level wrapping each trigger, to fit the page outline. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  style?: React.CSSProperties;
}
/** Collapsible stacked sections. */

/**
 * AgniUI · Accordion
 * Stack of collapsible items. items: [{key,title,icon?,content}].
 * `multi` lets several open at once; otherwise single-open.
 *
 * WAI-ARIA accordion: each trigger is a <button aria-expanded aria-controls>
 * inside a heading; each panel is a role="region" labelled by its trigger.
 * Enter / Space toggle · ↑ ↓ move between triggers · Home / End jump.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 5). The row separator is a class on
 * every item except the first, chosen with a ternary that REPLACES rather than
 * appends — `border-t` and `border-t-0` are one conflict group and would
 * otherwise resolve by emit order (rule 5).
 */
const SHELL = "border border-line-subtle rounded-lg overflow-hidden bg-surface-card";
const ROW = "flex items-center gap-2 w-full px-4 py-3 border-none cursor-pointer text-left " +
  "transition-colors duration-fast";
const ROW_OPEN = "bg-surface-soft";
const ROW_SHUT = "bg-transparent hover:bg-surface-soft";
const LABEL = "flex-1 min-w-0 text-sm font-medium text-fg-primary";
const BODY = "px-4 pt-1 pb-4 text-sm text-fg-secondary leading-normal";

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion({
  items = [], multi = false, open: openProp, defaultOpen = [], onOpenChange, headingLevel = 3, id, onKeyDown, style = {}, className = "", ...rest
}, ref) {
  const [open, setOpen] = useControllableState<string[]>({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const base = useStableId(id, "agni-accordion");
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const H = `h${headingLevel}` as "h3";
  const toggle = (k: string) => {
    const has = open.includes(k);
    setOpen(has ? open.filter((x) => x !== k) : multi ? [...open, k] : [k]);
  };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const from = triggers.current.findIndex((el) => el === document.activeElement);
    if (from < 0) return;
    const next = getNavigationIndex(e.key, { count: items.length, current: from, orientation: "vertical", isDisabled: (i) => !!items[i]?.disabled });
    if (next === null || next < 0) return;
    e.preventDefault();
    triggers.current[next]?.focus();
  };
  return (
    <div {...rest} ref={ref} id={id} onKeyDown={composeHandlers(onKeyDown, onKey)} className={[SHELL, className].join(" ")} style={style}>
      {items.map((it, i) => {
        const isOpen = open.includes(it.key);
        const tid = `${base}-trigger-${it.key}`;
        const pid = `${base}-panel-${it.key}`;
        return (
          <div key={it.key} className={i ? "border-t border-line-subtle" : "border-t-0"}>
            <H className="m-0 font-sans font-normal" style={{ letterSpacing: "normal", lineHeight: "inherit" }}>
              <button type="button" id={tid} ref={(el) => { triggers.current[i] = el; }}
                aria-expanded={isOpen} aria-controls={pid} aria-disabled={it.disabled || undefined}
                onClick={() => { if (!it.disabled) toggle(it.key); }}
                className={[ROW, isOpen ? ROW_OPEN : ROW_SHUT, it.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : ""].join(" ")}>
                {it.icon && <i aria-hidden="true" className={["ph", it.icon, "text-[17px] text-fg-brand shrink-0"].join(" ")} />}
                <span className={LABEL}>{it.title}</span>
                <i aria-hidden="true" className={[isOpen ? "ph ph-caret-up" : "ph ph-caret-down", "text-[14px] text-fg-tertiary"].join(" ")} />
              </button>
            </H>
            <div id={pid} role="region" aria-labelledby={tid} hidden={!isOpen} className={BODY}>{isOpen && it.content}</div>
          </div>
        );
      })}
    </div>
  );
});
