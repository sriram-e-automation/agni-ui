import React, { useState, useEffect, useMemo } from "react";

/* ── Types (mirrored in CommandPalette.d.ts) ── */
export interface Command { id?: string; label: string; icon?: string; group?: string; hint?: string; onRun?: () => void; disabled?: boolean; }
export interface CommandPaletteProps {
  open?: boolean;
  onClose?: () => void;
  commands?: Command[];
  placeholder?: string;
  loading?: boolean;
}
/** ⌘K command launcher overlay with keyboard nav. */

/**
 * AgniUI · CommandPalette
 * ⌘K-style command launcher. commands: [{id,label,icon?,group?,hint?,onRun}].
 * Filtered as you type; ↑/↓ to move, Enter to run, Esc to close.
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

export function CommandPalette({ open = false, onClose, commands = [], placeholder = "Type a command or search…", loading = false }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return commands.filter((c) => !ql || c.label.toLowerCase().includes(ql) || (c.group || "").toLowerCase().includes(ql));
  }, [q, commands]);

  useEffect(() => { if (open) { setQ(""); setActive(0); } }, [open]);
  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => {
      if (e.key === "Escape") onClose && onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") { const c = filtered[active]; if (c && !c.disabled) { c.onRun && c.onRun(); onClose && onClose(); } }
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, filtered, active, onClose]);

  if (!open) return null;

  return (
    <div onClick={onClose} className={SCRIM}
      style={{ animation: "agni-fade-in var(--dur-fast) var(--ease-standard)" }}>
      <div onClick={(e) => e.stopPropagation()} className={PANEL}
        style={{ animation: "agni-scale-pop var(--dur-normal) var(--ease-spring)" }}>
        <div className={SEARCH_ROW}>
          <i className="ph ph-magnifying-glass text-[19px] text-fg-tertiary" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className={FIELD} />
          <kbd className={KBD}>ESC</kbd>
        </div>
        <div className={LIST}>
          {loading && (
            <div className={LOADING_ROW}>
              <span className={SPINNER} style={{ animation: "agni-spin .7s linear infinite" }} />
              Loading commands…
            </div>
          )}
          {!loading && filtered.length === 0 && <div className={MSG}>No commands match “{q}”</div>}
          {!loading && filtered.map((c, i) => (
            <button key={c.id || i} type="button" disabled={c.disabled}
              onClick={() => { if (c.disabled) return; c.onRun && c.onRun(); onClose && onClose(); }}
              onMouseEnter={() => !c.disabled && setActive(i)}
              className={[ROW, c.disabled ? ROW_DISABLED : i === active ? ROW_ACTIVE : ROW_IDLE].join(" ")}>
              <i className={["ph", c.icon || "ph-arrow-right", "text-[18px] shrink-0"].join(" ")} />
              <span className={ROW_LABEL}>{c.label}</span>
              {c.group && <span className={ROW_GROUP}>{c.group}</span>}
              {c.hint && <kbd className={KBD_HINT}>{c.hint}</kbd>}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-scale-pop{from{opacity:0;transform:scale(.97) translateY(-6px)}}@keyframes agni-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
