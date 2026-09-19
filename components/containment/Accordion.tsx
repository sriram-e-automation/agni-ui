import React, { useState } from "react";

/* ── Types (mirrored in Accordion.d.ts) ── */
export interface AccordionItem { key: string; title: React.ReactNode; icon?: string; content: React.ReactNode; }
export interface AccordionProps {
  items?: AccordionItem[];
  /** Allow multiple panels open at once. */
  multi?: boolean;
  defaultOpen?: string[];
  style?: React.CSSProperties;
}
/** Collapsible stacked sections. */

/**
 * AgniUI · Accordion
 * Stack of collapsible items. items: [{key,title,icon?,content}].
 * `multi` lets several open at once; otherwise single-open.
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

export function Accordion({ items = [], multi = false, defaultOpen = [], style = {} }: AccordionProps) {
  const [open, setOpen] = useState(new Set(defaultOpen));
  const toggle = (k) => setOpen((prev) => {
    const n = new Set(multi ? prev : []);
    if (prev.has(k)) { if (multi) n.delete(k); else return new Set(); } else n.add(k);
    return n;
  });
  return (
    <div className={SHELL} style={style}>
      {items.map((it, i) => {
        const isOpen = open.has(it.key);
        return (
          <div key={it.key} className={i ? "border-t border-line-subtle" : "border-t-0"}>
            <button type="button" onClick={() => toggle(it.key)}
              className={[ROW, isOpen ? ROW_OPEN : ROW_SHUT].join(" ")}>
              {it.icon && <i className={["ph", it.icon, "text-[17px] text-fg-brand shrink-0"].join(" ")} />}
              <span className={LABEL}>{it.title}</span>
              <i className={[isOpen ? "ph ph-caret-up" : "ph ph-caret-down", "text-[14px] text-fg-tertiary"].join(" ")} />
            </button>
            {isOpen && <div className={BODY}>{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
