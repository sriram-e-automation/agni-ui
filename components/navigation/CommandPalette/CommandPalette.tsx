import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { mergeRefs, scrollIntoViewIfNeeded, useFocusTrap, useListNavigation, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in CommandPalette.d.ts) ── */
export interface Command { id?: string; label: string; icon?: string; group?: string; hint?: string; onRun?: () => void; disabled?: boolean; }
export interface CommandPaletteProps {
  open?: boolean;
  onClose?: () => void;
  commands?: Command[];
  placeholder?: string;
  loading?: boolean;
  /** Accessible name of the dialog. @default "Command palette" */
  label?: string;
  id?: string;
  /** Receives the query as the user types (e.g. to fetch remote commands). */
  onQueryChange?: (q: string) => void;
}
/** ⌘K command launcher overlay with keyboard nav. */

/**
 * AgniUI · CommandPalette
 * ⌘K-style command launcher. commands: [{id,label,icon?,group?,hint?,onRun}].
 * Filtered as you type; ↑/↓ to move, Enter to run, Esc to close.
 *
 * A modal dialog (aria-modal, focus trapped, focus returned to the opener on
 * close) holding a combobox + listbox: the search box keeps focus and points at
 * the highlighted command with aria-activedescendant. ↑/↓ PageUp/PageDown move
 * (wrapping), disabled commands are skipped, Home/End stay with the text box.
 * The ref is the dialog panel.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 3). The `active` row index stays in
 * React state — it is shared by the pointer and the keyboard, so it cannot
 * become a `hover:` class: arrowing down has to move the same highlight the
 * mouse moves. onMouseEnter therefore remains, and it is the one place in the
 * migrated set where a pointer handler is correct rather than leftover.
 *
 * The three entrance animations stay INLINE on purpose. They reference this
 * component's own @keyframes, shipped in the <style> below; routing them through
 * arbitrary animate-[…] utilities would make them depend on the compiled
 * stylesheet carrying a keyframes name it does not own. Motion is not
 * theme-varying, so nothing about theming is lost by leaving them inline.
 */
/* backdrop-filter is written as an arbitrary PROPERTY, not backdrop-blur-[3px]:
   Tailwind's backdrop-blur utility composes through nine --tw-backdrop-* custom
   properties declared inside a component-style selector, which the DS token
   compiler flags — the same reason shadow-e-* and press exist as @utility
   instead of arbitrary shadow-[…] / transform values. */
const SCRIM =
  "fixed inset-0 z-modal flex items-start justify-center pt-[12vh] " +
  "bg-[var(--scrim)] [backdrop-filter:blur(3px)]";
const PANEL =
  "w-full max-w-[560px] bg-surface-card border border-line-default rounded-xl " +
  "shadow-e-2xl overflow-hidden";
const SEARCH_ROW = "flex items-center gap-2 px-4 py-3 border-b border-line-subtle";
const FIELD =
  "flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-md text-fg-primary";
const KBD = "font-data text-2xs text-fg-tertiary border border-line-default rounded-xs px-1 py-[2px]";
const KBD_HINT = "font-data text-2xs text-fg-tertiary border border-line-default rounded-xs px-1 py-px";
const LIST = "max-h-[var(--max-h-menu)] overflow-y-auto p-1";
const MSG = "px-6 py-6 text-center text-fg-tertiary text-sm";
const LOADING_ROW = "flex items-center justify-center gap-2 px-6 py-6 text-fg-tertiary text-sm";
const SPINNER = "w-4 h-4 rounded-full border-2 border-line-subtle border-t-fg-brand";
const ROW = "flex items-center gap-3 w-full px-3 py-2 border-none rounded-md text-left";
const ROW_ACTIVE = "bg-surface-brand-soft text-fg-brand cursor-pointer";
const ROW_IDLE = "bg-transparent text-fg-primary cursor-pointer";
const ROW_DISABLED = "bg-transparent text-fg-disabled cursor-not-allowed opacity-[var(--state-disabled-opacity)]";
const ROW_LABEL = "flex-1 min-w-0 text-sm font-medium";
const ROW_GROUP = "text-2xs text-fg-tertiary uppercase tracking-wide";

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette(
  { open = false, onClose, commands = [], placeholder = "Type a command or search…", loading = false, label = "Command palette", id, onQueryChange },
  ref,
) {
  const [q, setQ] = useState("");
  const base = useStableId(id, "agni-cmdk");
  const listId = base + "-list";
  const optId = (i: number) => `${base}-opt-${i}`;
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return commands.filter((c) => !ql || c.label.toLowerCase().includes(ql) || (c.group || "").toLowerCase().includes(ql));
  }, [q, commands]);
  const nav = useListNavigation({ items: filtered, isDisabled: (c) => !!c.disabled, typeahead: false });

  useFocusTrap(panel, open, { initialFocus: input });
  useEffect(() => { if (open) { setQ(""); nav.focusEdge("first"); } }, [open]); // eslint-disable-line
  useEffect(() => { nav.focusEdge("first"); }, [q, filtered.length]); // eslint-disable-line
  useEffect(() => { if (nav.activeIndex >= 0) scrollIntoViewIfNeeded(document.getElementById(optId(nav.activeIndex))); }, [nav.activeIndex]); // eslint-disable-line

  if (!open) return null;

  const run = (c: Command | undefined) => { if (c && !c.disabled) { c.onRun && c.onRun(); onClose && onClose(); } };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose && onClose(); return; }
    if (e.key === "Enter") { e.preventDefault(); run(filtered[nav.activeIndex]); return; }
    /* Home/End belong to the text box (caret), so only vertical keys navigate. */
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) nav.onNavigate(e);
  };
  const activeId = nav.activeIndex >= 0 && !loading ? optId(nav.activeIndex) : undefined;

  return (
    <div onClick={onClose} className={SCRIM}
      style={{ animation: "agni-fade-in var(--dur-fast) var(--ease-standard)" }}>
      <div ref={mergeRefs(ref, panel)} onClick={(e) => e.stopPropagation()} className={PANEL}
        id={base} role="dialog" aria-modal="true" aria-label={label}
        style={{ animation: "agni-scale-pop var(--dur-normal) var(--ease-spring)" }}>
        <div className={SEARCH_ROW}>
          <i aria-hidden="true" className="ph ph-magnifying-glass text-[19px] text-fg-tertiary" />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); onQueryChange?.(e.target.value); }} placeholder={placeholder} className={FIELD}
            role="combobox" aria-label={placeholder} aria-expanded="true" aria-controls={listId}
            aria-autocomplete="list" aria-activedescendant={activeId} autoComplete="off" spellCheck={false}
            onKeyDown={onKey} />
          <kbd aria-hidden="true" className={KBD}>ESC</kbd>
        </div>
        <div id={listId} role="listbox" aria-label={label} aria-busy={loading || undefined} className={LIST}>
          {loading && (
            <div role="status" className={LOADING_ROW}>
              <span aria-hidden="true" className={SPINNER} style={{ animation: "agni-spin .7s linear infinite" }} />
              Loading commands…
            </div>
          )}
          {!loading && filtered.length === 0 && <div role="status" className={MSG}>No commands match “{q}”</div>}
          {!loading && filtered.map((c, i) => (
            <div key={c.id || i} id={optId(i)} role="option" aria-selected={i === nav.activeIndex} aria-disabled={c.disabled || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(c)}
              onMouseEnter={() => !c.disabled && nav.setActiveIndex(i)}
              className={[ROW, c.disabled ? ROW_DISABLED : i === nav.activeIndex ? ROW_ACTIVE : ROW_IDLE].join(" ")}>
              <i aria-hidden="true" className={["ph", c.icon || "ph-arrow-right", "text-[18px] shrink-0"].join(" ")} />
              <span className={ROW_LABEL}>{c.label}</span>
              {c.group && <span className={ROW_GROUP}>{c.group}</span>}
              {c.hint && <kbd className={KBD_HINT}>{c.hint}</kbd>}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-scale-pop{from{opacity:0;transform:scale(.97) translateY(-6px)}}@keyframes agni-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
});
