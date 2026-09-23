import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { composeHandlers, mergeRefs, useControllableState, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in DatePicker.d.ts) ── */
export interface DatePickerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "type" | "onBlur"> {
  /** Selected date, or null for empty (controlled). */
  value?: Date | null;
  /** Initial date for an uncontrolled picker. */
  defaultValue?: Date | null;
  /** Called with a Date on selection, or null on clear. */
  onChange?: (value: Date | null) => void;
  /** Earliest selectable date (days before are disabled). */
  min?: Date | null;
  /** Latest selectable date (days after are disabled). */
  max?: Date | null;
  placeholder?: string;
  error?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  /** Submitted with a native <form> as an ISO date (yyyy-mm-dd) through a hidden input. */
  name?: string;
  form?: string;
  /** Controlled popup state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires when focus leaves the whole control (trigger + calendar). */
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  /** Accessible names for the chrome — override for localisation. */
  labels?: Partial<DatePickerLabels>;
  /** Pass true to force dark-mode panel (auto-detected from DOM ancestor by default). */
  dark?: boolean;
  /** Applied to the trigger wrapper element. */
  style?: React.CSSProperties;
  className?: string;
}
export interface DatePickerLabels {
  dialog: string; previousMonth: string; nextMonth: string; today: string; clear: string; clearDate: string;
}
const LABELS: DatePickerLabels = {
  dialog: "Choose date", previousMonth: "Previous month", nextMonth: "Next month",
  today: "Today", clear: "Clear", clearDate: "Clear date",
};
/** Custom calendar date picker, fully themed with DS tokens. onChange → Date | null. */


/**
 * AgniUI · DatePicker
 * Fully custom calendar picker. onChange receives a Date object (or null on clear).
 *
 * WAI-ARIA date picker dialog: the trigger is a <button aria-haspopup="dialog">;
 * the calendar is a non-modal dialog holding a role="grid" of days with roving
 * focus. On open, focus goes to the selected day (else today).
 *   ← → one day · ↑ ↓ one week · Home / End start / end of week ·
 *   PageUp / PageDown one month (Shift: one year) · Enter / Space select ·
 *   Escape closes and returns focus to the trigger · Tab cycles the dialog.
 * On the closed trigger: Enter / Space / ↓ open · Backspace / Delete clear.
 * The ref is the trigger button.
 */

const CAL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const CAL_DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  if (!a || !b) return false;
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }

function formatDisplay(d: Date | null | undefined) {
  if (!d) return "";
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(d.getDate()).padStart(2,"0")} ${mo[d.getMonth()]} ${d.getFullYear()}`;
}

function buildCells(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const total    = daysInMonth(year, month);
  const prevTotal= daysInMonth(year, month === 0 ? 11 : month - 1);
  const cells: { d: Date; out: boolean }[] = [];

  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ d: new Date(year, month - 1, prevTotal - i), out: true });
  for (let d = 1; d <= total; d++)
    cells.push({ d: new Date(year, month, d), out: false });
  const trail = 42 - cells.length;
  for (let d = 1; d <= trail; d++)
    cells.push({ d: new Date(year, month + 1, d), out: true });

  return cells;
}

function toISO(d: Date | null | undefined) {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addMonths(d: Date, n: number) {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
  x.setDate(Math.min(d.getDate(), daysInMonth(x.getFullYear(), x.getMonth())));
  return x;
}
const LONG = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker({
  value,
  defaultValue = null,
  onChange,
  min        = null,
  max        = null,
  placeholder = "Select date",
  disabled,
  error,
  required,
  id,
  name,
  form,
  size       = "md",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onBlur,
  onKeyDown,
  labels: labelsProp,
  dark       = false,
  style      = {},
  className  = "",
  ...rest
}, ref) {
  const L = { ...LABELS, ...labelsProp };
  const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  const [current, setCurrent] = useControllableState<Date | null>({ value, defaultValue, onChange });
  const [open, setOpenState] = useControllableState<boolean>({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-date"),
  );
  const dialogId = f.id + "-dialog";
  const monthId = f.id + "-month";

  const [focused,      setFocused]      = useState(false);
  const [cursor,       setCursor]       = useState<Date>(() => current || today);
  const [panelPos,     setPanelPos]     = useState<React.CSSProperties>({});
  const [resolvedDark, setResolvedDark] = useState(dark);
  const shellRef   = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const viewYear = cursor.getFullYear();
  const viewMonth = cursor.getMonth();

  /* Height rides --density-control-h with the whole control family (Aug 2026);
     the rest of the size rung (font, padding, icon) stays literal. */
  const H_CLS = { sm: "h-control-sm", md: "h-control", lg: "h-control-lg" }[size] || "h-control";
  const SZ = {
    sm: { fs: "var(--text-sm)",  px: 10, icon: 15 },
    md: { fs: "var(--text-base)", px: 12, icon: 17 },
    lg: { fs: "var(--text-md)",  px: 14, icon: 19 },
  }[size] || { fs: "var(--text-base)", px: 12, icon: 17 };

  /* Error EDGE is persistent; the error RING is a focus/open affordance (see
     Input's focus-within pair). The error branch must re-test focus or the
     focus indication vanishes on exactly the controls that need it most. */
  const EDGE = f.invalid
    ? ((focused || open) ? "border-[var(--input-bdr-error)] ring-focus-error" : "border-[var(--input-bdr-error)] [box-shadow:none]")
    : (focused || open) ? "border-[var(--input-bdr-focus)] ring-focus"
    : "border-[var(--input-bdr)] [box-shadow:none]";

  const setOpen = (next: boolean) => { if (next && f.disabled) return; setOpenState(next); };
  const close = (restore: boolean) => { setOpenState(false); if (restore) triggerRef.current?.focus(); };

  /* ── Resolve dark mode: prop → nearest data-theme ancestor ── */
  useEffect(() => {
    const el = shellRef.current;
    if (!el) { setResolvedDark(dark); return; }
    const ancestor = el.closest('[data-theme]');
    setResolvedDark(ancestor ? ancestor.getAttribute('data-theme') === 'dark' : dark);
  }, [dark, open]);

  /* ── Position the panel ─────────────────────────────────────── */
  const reposition = () => {
    if (!shellRef.current) return;
    const r    = shellRef.current.getBoundingClientRect();
    const PW   = 272; // panel width
    const PH   = 316; // estimated panel height
    const left = clamp(r.left, 8, window.innerWidth - PW - 8);
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const top = spaceBelow >= PH ? r.bottom + 6 : r.top - PH - 6;
    setPanelPos({ top, left, width: PW });
  };

  useEffect(() => {
    if (!open) return;
    setCursor(current || today);
    reposition();

    const onDoc = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(tgt) &&
        shellRef.current && !shellRef.current.contains(tgt)
      ) setOpenState(false);
    };
    const onResize = () => reposition();
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("resize",     onResize);
    window.addEventListener("scroll",     onResize, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("resize",     onResize);
      window.removeEventListener("scroll",     onResize, true);
    };
  }, [open]); // eslint-disable-line

  /* Roving focus: the cursor day is the grid's one tab stop and holds focus. */
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      const btn = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${toISO(cursor)}"]`);
      if (btn && panelRef.current && (panelRef.current.contains(document.activeElement) || document.activeElement === triggerRef.current || document.activeElement === document.body)) btn.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open, cursor]); // eslint-disable-line

  /* ── Day helpers ────────────────────────────────────────────── */
  const isOutOfRange = (d: Date) => !!((min && d < min) || (max && d > max));

  const selectDay = (d: Date) => {
    if (isOutOfRange(d)) return;
    setCurrent(d);
    close(true);
  };

  const goToday = () => {
    setCursor(today);
    if (!isOutOfRange(today)) { setCurrent(today); close(true); }
  };

  const onGridKey = (e: React.KeyboardEvent) => {
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowLeft":  next = addDays(cursor, -1); break;
      case "ArrowRight": next = addDays(cursor, 1); break;
      case "ArrowUp":    next = addDays(cursor, -7); break;
      case "ArrowDown":  next = addDays(cursor, 7); break;
      case "Home":       next = addDays(cursor, -cursor.getDay()); break;
      case "End":        next = addDays(cursor, 6 - cursor.getDay()); break;
      case "PageUp":     next = addMonths(cursor, e.shiftKey ? -12 : -1); break;
      case "PageDown":   next = addMonths(cursor, e.shiftKey ? 12 : 1); break;
      default: return;
    }
    e.preventDefault();
    setCursor(next);
  };

  const onDialogKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); return; }
    if (e.key === "Tab" && panelRef.current) {
      /* Non-modal, but Tab cycles inside while open so focus can't fall behind it. */
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]):not([tabindex='-1'])"));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  const onTriggerKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); }
    else if ((e.key === "Backspace" || e.key === "Delete") && current && !f.disabled) { e.preventDefault(); setCurrent(null); }
  };

  /* Blur for the WHOLE control — the panel is portalled by position, not by DOM. */
  const within = (n: Node | null) => !!n && (!!shellRef.current?.contains(n) || !!panelRef.current?.contains(n));
  const onAnyBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (within(e.relatedTarget as Node | null)) return;
    setFocused(false);
    onBlur?.(e);
  };

  const cells = buildCells(viewYear, viewMonth);
  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  /* ── Shared sub-styles ──────────────────────────────────────── */
  const navBtn = "size-[28px] shrink-0 inline-flex items-center justify-center border border-line-subtle rounded-sm " +
    "bg-surface-card text-fg-secondary cursor-pointer text-[13px] " +
    "transition-[background-color,border-color] duration-fast ease-standard hover:bg-surface-soft";
  const footBtn = "border-none bg-transparent p-1 rounded-sm cursor-pointer font-sans text-xs font-medium";

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────── */}
      <div
        ref={shellRef}
        className={[
          H_CLS,
          "inline-flex items-center gap-2 border rounded-md select-none w-full box-border",
          "transition-[border-color,box-shadow] duration-fast ease-standard",
          EDGE,
          f.disabled ? "bg-[var(--input-bg-disabled)] opacity-[0.5] cursor-not-allowed" : "bg-[var(--input-bg)] opacity-100 cursor-pointer",
          className,
        ].join(" ")}
        style={{ padding: `0 ${SZ.px}px`, ...style }}
      >
        <button
          {...rest}
          ref={mergeRefs(ref, triggerRef)}
          id={f.id}
          type="button"
          disabled={f.disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          aria-labelledby={rest["aria-labelledby"] ?? (f.contextLabelId ? `${f.contextLabelId} ${f.id}` : undefined)}
          aria-describedby={f.describedBy}
          aria-invalid={f.invalid || undefined}
          aria-required={f.required || undefined}
          data-agni-input=""
          onClick={() => setOpen(!open)}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={onAnyBlur}
          onKeyDown={composeHandlers(onKeyDown, onTriggerKey)}
          className={["flex items-center gap-2 flex-1 min-w-0 h-full border-none bg-transparent p-0 text-left outline-none font-sans", f.disabled ? "cursor-not-allowed" : "cursor-pointer"].join(" ")}
        >
          <i
            aria-hidden="true"
            className={`ph ${current ? "ph-calendar-check" : "ph-calendar-blank"} shrink-0 ${current ? "text-fg-brand" : "text-fg-tertiary"}`}
            style={{ fontSize: SZ.icon }}
          />
          <span className={[
            "flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
            current ? "font-data text-fg-primary" : "font-sans text-fg-tertiary",
          ].join(" ")} style={{ fontSize: SZ.fs }}>
            {current ? formatDisplay(current) : placeholder}
          </span>
        </button>
        {current && !f.disabled ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={L.clearDate}
            onBlur={onAnyBlur}
            onClick={() => { setCurrent(null); triggerRef.current?.focus(); }}
            className="inline-flex items-center justify-center size-[18px] rounded-full text-fg-tertiary text-[11px] shrink-0 cursor-pointer border-none bg-transparent p-0"
          >
            <i aria-hidden="true" className="ph ph-x" />
          </button>
        ) : (
          <i aria-hidden="true" className="ph ph-caret-down text-fg-tertiary text-[11px] shrink-0" />
        )}
        {name && <input type="hidden" name={name} form={form} value={toISO(current)} />}
      </div>

      {/* ── Calendar panel ──────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-label={L.dialog}
          data-theme={resolvedDark ? "dark" : undefined}
          onKeyDown={onDialogKey}
          onBlur={onAnyBlur}
          className="fixed z-popover bg-surface-card border border-line-default rounded-lg shadow-e-lg font-sans pt-3 px-3 pb-2"
          style={panelPos}
        >
          {/* Month / year navigation */}
          <div className="flex items-center gap-1 mb-2">
            <button type="button" aria-label={L.previousMonth} className={navBtn} onClick={() => setCursor(addMonths(cursor, -1))}>
              <i aria-hidden="true" className="ph ph-caret-left" />
            </button>
            <div id={monthId} aria-live="polite" className="flex-1 min-w-0 text-center font-semibold text-sm text-fg-primary tracking-[-0.01em]">
              {CAL_MONTHS[viewMonth]} {viewYear}
            </div>
            <button type="button" aria-label={L.nextMonth} className={navBtn} onClick={() => setCursor(addMonths(cursor, 1))}>
              <i aria-hidden="true" className="ph ph-caret-right" />
            </button>
          </div>

          <div ref={gridRef} role="grid" aria-labelledby={monthId} onKeyDown={onGridKey}>
            {/* Day-of-week headers */}
            <div role="row" className="grid grid-cols-7 mb-[2px]">
              {CAL_DAYS_SHORT.map(d => (
                <div key={d} role="columnheader" className="text-center py-[3px] text-2xs font-semibold tracking-wide uppercase text-fg-tertiary">{d}</div>
              ))}
            </div>

            {/* Day grid — hover is a class, present only on cells that are
               neither selected nor out of range. */}
            <div role="rowgroup" className="flex flex-col gap-px">
            {weeks.map((week, w) => (
              <div key={w} role="row" className="grid grid-cols-7 gap-px">
                {week.map((cell, i) => {
                  const sel  = isSameDay(cell.d, current);
                  const tod  = isSameDay(cell.d, today);
                  const dis  = isOutOfRange(cell.d);
                  const cur  = isSameDay(cell.d, cursor);
                  return (
                    <div key={i} role="gridcell" aria-selected={sel || undefined}>
                      <button
                        type="button"
                        data-date={toISO(cell.d)}
                        tabIndex={cur ? 0 : -1}
                        aria-disabled={dis || undefined}
                        aria-current={tod ? "date" : undefined}
                        aria-label={LONG.format(cell.d)}
                        onClick={() => { setCursor(cell.d); selectDay(cell.d); }}
                        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); selectDay(cell.d); } }}
                        className={[
                          "w-full aspect-square inline-flex items-center justify-center rounded-sm p-0 font-data text-sm border-[1.5px]",
                          "transition-[background-color,border-color] duration-fast ease-standard",
                          tod && !sel ? "border-line-brand" : "border-transparent",
                          sel ? "bg-action-brand text-fg-on-brand font-semibold"
                            : (cell.out || dis) ? "bg-transparent text-fg-disabled font-normal"
                            : tod ? "bg-transparent text-fg-brand font-medium"
                            : "bg-transparent text-fg-primary font-normal",
                          !sel && !dis ? "hover:bg-surface-brand-soft" : "",
                          cell.out ? "opacity-[0.35]" : "opacity-100",
                          dis ? "cursor-not-allowed" : "cursor-pointer",
                        ].join(" ")}
                      >
                        {cell.d.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-line-subtle flex justify-between items-center">
            <button type="button" onClick={goToday} className={footBtn + " text-fg-brand"}>
              {L.today}
            </button>
            {current && (
              <button type="button"
                onClick={() => { setCurrent(null); close(true); }}
                className={footBtn + " text-fg-tertiary"}>
                {L.clear}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
});
