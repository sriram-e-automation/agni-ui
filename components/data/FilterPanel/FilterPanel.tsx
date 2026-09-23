import React, { useState, useRef, useEffect } from "react";
import { mergeRefs, useFocusTrap, useStableId } from "../../utils/interaction.tsx";
import { Button } from "../../primitives/Button/Button.tsx";
import { IconButton } from "../../primitives/Button/IconButton.tsx";

export interface FilterSection {
  /** Key in the value object, e.g. "status". */
  key: string;
  label: string;
  options: string[];
  /** Optional option → color map rendered as a leading dot. */
  dots?: Record<string, string>;
}
export type FilterValue = Record<string, string[]> | null;
export interface FilterPanelProps {
  sections?: FilterSection[];
  /** Controlled map of section key → checked options; null = no filter. */
  value?: FilterValue;
  onChange?: (value: FilterValue) => void;
  /** Center the panel as a scrimmed dialog (phone layouts). */
  isPhone?: boolean;
}

/**
 * AgniUI · FilterPanel
 * Toolbar funnel filter — compact 36px trigger (badge + × clear when active)
 * opening a fixed-position popover of multi-select option pills per section.
 * Mirrors DateRangeFilter's trigger/panel pattern exactly; the two sit
 * side-by-side in list toolbars.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7c). The panel's position (top/left/
 * width/maxHeight) stays inline — it is computed from the trigger's
 * getBoundingClientRect() every open + resize + scroll, the definition of a
 * runtime value. Everything else — trigger states, pills, sticky bars — is
 * classes.
 */
const TRIGGER_ACTIVE_SHELL = "inline-flex items-center h-[36px] border border-line-brand rounded-md overflow-hidden";
const TRIGGER_ACTIVE_BTN = "relative size-[36px] border-none inline-flex items-center justify-center text-[18px] cursor-pointer text-fg-brand transition-colors duration-fast";
const TRIGGER_ACTIVE_OPEN = "bg-[var(--agni-green-100)]";
const TRIGGER_ACTIVE_SHUT = "bg-surface-brand-soft";
const COUNT_BADGE =
  "absolute top-[5px] right-[5px] min-w-[16px] h-[16px] rounded-full bg-action-brand text-[#fff] text-[10px] font-bold font-data " +
  "flex items-center justify-center px-[3px] box-border leading-none pointer-events-none";
const CLEAR_BTN = "w-[26px] h-[36px] border-none bg-surface-brand-soft text-fg-brand inline-flex items-center justify-center text-[12px] cursor-pointer";
const TRIGGER_IDLE =
  "size-[36px] shrink-0 inline-flex items-center justify-center text-[18px] rounded-md cursor-pointer border " +
  "transition-[background-color,border-color,color] duration-fast";
const TRIGGER_IDLE_OPEN = "border-line-brand bg-surface-soft text-fg-brand";
const TRIGGER_IDLE_SHUT = "border-line-default bg-surface-card text-fg-secondary";
const PANEL = "fixed z-overlay overflow-y-auto bg-surface-card border border-line-default rounded-lg shadow-e-lg font-sans";
const PANEL_HEAD = "sticky top-0 z-[1] flex items-center justify-between px-3 py-3 border-b border-line-subtle bg-surface-card";
const SECTION_LABEL = "text-2xs font-semibold tracking-wide uppercase text-fg-tertiary mb-2";
const PILL = "inline-flex items-center gap-1 px-2 py-1 rounded-md border text-sm cursor-pointer whitespace-nowrap transition-all duration-fast";
const PILL_ON = "border-action-brand bg-surface-brand-soft text-fg-brand font-semibold";
const PILL_OFF = "border-line-subtle bg-surface-card text-fg-secondary font-medium";
const PANEL_FOOT = "sticky bottom-0 flex items-center justify-between gap-2 px-3 py-3 border-t border-line-subtle bg-surface-card";
const CLEAR_LINK = "border-none bg-transparent text-fg-tertiary font-sans text-sm font-medium cursor-pointer py-1 px-[2px]";

export const FilterPanelBase = React.forwardRef<HTMLDivElement, FilterPanelProps>(function FilterPanel({ sections = [], value, onChange, isPhone }, ref) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [draft, setDraft] = useState({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogId = useStableId(null, "agni-filters");
  /* Non-modal popover dialog: focus moves in on open, Tab stays inside while
     it's open, and focus returns to the trigger on close. */
  useFocusTrap(panelRef, open);
  const expander = { "aria-haspopup": "dialog" as const, "aria-expanded": open, "aria-controls": open ? dialogId : undefined };

  const reposition = () => { if (wrapRef.current) setRect(wrapRef.current.getBoundingClientRect()); };

  useEffect(() => {
    if (!open) return;
    setDraft(value ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, [...v]])) : {});
    reposition();
    const onDoc = (e) => { if (panelRef.current && !panelRef.current.contains(e.target) && wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onWin = () => reposition();
    document.addEventListener("mousedown", onDoc); window.addEventListener("resize", onWin); window.addEventListener("scroll", onWin, true);
    return () => { document.removeEventListener("mousedown", onDoc); window.removeEventListener("resize", onWin); window.removeEventListener("scroll", onWin, true); };
  }, [open]); // eslint-disable-line

  const toggle = (field, val) => setDraft(p => { const c = p[field] || []; return { ...p, [field]: c.includes(val) ? c.filter(v => v !== val) : [...c, val] }; });
  const isOn = (field, val) => (draft[field] || []).includes(val);
  const apply = () => { const c = Object.fromEntries(Object.entries(draft).filter(([_, v]) => (v as string[]).length)); onChange && onChange(Object.keys(c).length ? c : null); setOpen(false); };
  const clear = () => { onChange && onChange(null); setOpen(false); };

  const active = !!(value && Object.values(value).some(v => v && v.length));
  const count = active ? Object.values(value).filter(v => v && v.length).length : 0;

  const PANEL_W = 280;
  const panelPos = isPhone
    ? { left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(92vw,320px)" }
    : rect
      ? { top: rect.bottom + 6, left: Math.max(8, Math.min(rect.right - PANEL_W, window.innerWidth - PANEL_W - 8)), width: PANEL_W, maxHeight: Math.max(240, window.innerHeight - rect.bottom - 14) }
      : { display: "none" };

  const renderPills = (field, opts, dotMap) => (
    <div className="flex flex-wrap gap-1">
      {opts.map(opt => {
        const on = isOn(field, opt);
        const dot = dotMap ? dotMap[opt] : null;
        return (
          <button key={opt} type="button" aria-pressed={on} onClick={() => toggle(field, opt)} className={[PILL, on ? PILL_ON : PILL_OFF].join(" ")}>
            {dot && <span className="size-[7px] rounded-full shrink-0" style={{ background: dot }} />}
            {opt}
            {on && <i className="ph-fill ph-check text-[11px]" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div ref={mergeRefs(ref, wrapRef)} className="inline-flex shrink-0">
        {active ? (
          <div className={TRIGGER_ACTIVE_SHELL}>
            <button type="button" title="Filters" aria-label={"Filters, " + count + " active"} {...expander} onClick={() => setOpen(o => !o)}
              className={[TRIGGER_ACTIVE_BTN, open ? TRIGGER_ACTIVE_OPEN : TRIGGER_ACTIVE_SHUT].join(" ")}>
              <i className="ph-fill ph-funnel" />
              <span aria-hidden="true" className={COUNT_BADGE}>{count}</span>
            </button>
            <span className="w-px h-[20px] bg-line-brand shrink-0" />
            <button type="button" title="Clear filters" aria-label="Clear filters" onClick={() => clear()} className={CLEAR_BTN}>
              <i aria-hidden="true" className="ph ph-x" />
            </button>
          </div>
        ) : (
          <button type="button" title="Filter" aria-label="Filter" {...expander} onClick={() => setOpen(o => !o)}
            className={[TRIGGER_IDLE, open ? TRIGGER_IDLE_OPEN : TRIGGER_IDLE_SHUT].join(" ")}>
            <i className="ph ph-funnel" />
          </button>
        )}
      </div>

      {open && (
        <>
          {isPhone && <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 bg-[var(--scrim)] z-overlay" />}
          <div ref={panelRef} id={dialogId} role="dialog" aria-modal={isPhone || undefined} aria-labelledby={dialogId + "-title"}
            onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); setOpen(false); } }}
            className={PANEL} style={panelPos}>
            <div className={PANEL_HEAD}>
              <span id={dialogId + "-title"} className="inline-flex items-center gap-2 text-sm font-semibold text-fg-primary">
                <i className="ph ph-funnel text-[15px] text-fg-brand" /> Filters
              </span>
              <IconButton icon={<i className="ph ph-x" />} variant="ghost" size="sm" onClick={() => setOpen(false)} title="Close" />
            </div>
            <div className="p-3 flex flex-col gap-3">
              {sections.map(sec => (
                <div key={sec.key} role="group" aria-labelledby={dialogId + "-" + sec.key}>
                  <div id={dialogId + "-" + sec.key} className={SECTION_LABEL}>{sec.label}</div>
                  {renderPills(sec.key, sec.options, sec.dots || null)}
                </div>
              ))}
            </div>
            <div className={PANEL_FOOT}>
              <button type="button" onClick={clear} className={CLEAR_LINK}>Clear</button>
              <div className="flex gap-2">
                <Button category="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button category="primary" size="sm" onClick={apply}>Apply</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export const FilterPanel = FilterPanelBase;
