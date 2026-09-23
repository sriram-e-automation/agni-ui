import React, { useState, useRef, useEffect } from "react";

/* ── Types (mirrored in DatePicker.d.ts) ── */
export interface DatePickerProps {
  /** Selected date, or null for empty. */
  value?: Date | null;
  /** Called with a Date on selection, or null on clear. */
  onChange?: (value: Date | null) => void;
  /** Earliest selectable date (days before are disabled). */
  min?: Date | null;
  /** Latest selectable date (days after are disabled). */
  max?: Date | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  /** Pass true to force dark-mode panel (auto-detected from DOM ancestor by default). */
  dark?: boolean;
  /** Applied to the trigger wrapper element. */
  style?: React.CSSProperties;
}
/** Custom calendar date picker, fully themed with DS tokens. onChange → Date | null. */


/**
 * AgniUI · DatePicker
 * Fully custom calendar picker. All styling via DS tokens (inline styles only).
 * onChange receives a Date object (or null on clear).
 *
 * Props:
 *   value       Date | null
 *   onChange    (d: Date | null) => void
 *   min         Date | null  — disables days before this
 *   max         Date | null  — disables days after this
 *   placeholder string
 *   disabled    boolean
 *   error       boolean
 *   size        "sm" | "md" | "lg"
 *   style       CSSProperties  — applied to the trigger wrapper
 */

const CAL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const CAL_DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }

function formatDisplay(d) {
  if (!d) return "";
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(d.getDate()).padStart(2,"0")} ${mo[d.getMonth()]} ${d.getFullYear()}`;
}

function buildCells(year, month) {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const total    = daysInMonth(year, month);
  const prevTotal= daysInMonth(year, month === 0 ? 11 : month - 1);
  const cells    = [];

  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ d: new Date(year, month - 1, prevTotal - i), out: true });
  for (let d = 1; d <= total; d++)
    cells.push({ d: new Date(year, month, d), out: false });
  const trail = 42 - cells.length;
  for (let d = 1; d <= trail; d++)
    cells.push({ d: new Date(year, month + 1, d), out: true });

  return cells;
}

export function DatePicker({
  value      = null,
  onChange,
  min        = null,
  max        = null,
  placeholder = "Select date",
  disabled   = false,
  error      = false,
  size       = "md",
  dark       = false,
  style      = {},
}: DatePickerProps) {
  const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

  const [open,         setOpen]         = useState(false);
  const [focused,      setFocused]      = useState(false);
  const [viewYear,     setViewYear]     = useState(() => (value || today).getFullYear());
  const [viewMonth,    setViewMonth]    = useState(() => (value || today).getMonth());
  const [panelPos,     setPanelPos]     = useState({});
  const [resolvedDark, setResolvedDark] = useState(dark);
  const triggerRef = useRef(null);
  const panelRef   = useRef(null);

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
  const EDGE = error
    ? ((focused || open) ? "border-[var(--input-bdr-error)] ring-focus-error" : "border-[var(--input-bdr-error)] [box-shadow:none]")
    : (focused || open) ? "border-[var(--input-bdr-focus)] ring-focus"
    : "border-[var(--input-bdr)] [box-shadow:none]";

  /* ── Resolve dark mode: prop → nearest data-theme ancestor ── */
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) { setResolvedDark(dark); return; }
    const ancestor = el.closest('[data-theme]');
    setResolvedDark(ancestor ? ancestor.getAttribute('data-theme') === 'dark' : dark);
  }, [dark, open]);

  /* ── Position the panel ─────────────────────────────────────── */
  const reposition = () => {
    if (!triggerRef.current) return;
    const r    = triggerRef.current.getBoundingClientRect();
    const PW   = 272; // panel width
    const PH   = 316; // estimated panel height
    const left = clamp(r.left, 8, window.innerWidth - PW - 8);
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const top = spaceBelow >= PH ? r.bottom + 6 : r.top - PH - 6;
    setPanelPos({ top, left, width: PW });
  };

  useEffect(() => {
    if (!open) return;
    if (value) { setViewYear(value.getFullYear()); setViewMonth(value.getMonth()); }
    reposition();

    const onDoc = (e) => {
      if (
        panelRef.current   && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
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

  /* ── Month navigation ───────────────────────────────────────── */
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  /* ── Day helpers ────────────────────────────────────────────── */
  const isOutOfRange = (d) => (min && d < min) || (max && d > max);

  const selectDay = (d) => {
    if (isOutOfRange(d)) return;
    onChange && onChange(d);
    setOpen(false);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    if (!isOutOfRange(today)) { onChange && onChange(today); setOpen(false); }
  };

  const cells = buildCells(viewYear, viewMonth);

  /* ── Shared sub-styles ──────────────────────────────────────── */
  const navBtn = "size-[28px] shrink-0 inline-flex items-center justify-center border border-line-subtle rounded-sm " +
    "bg-surface-card text-fg-secondary cursor-pointer text-[13px] " +
    "transition-[background-color,border-color] duration-fast ease-standard hover:bg-surface-soft";
  const footBtn = "border-none bg-transparent p-1 rounded-sm cursor-pointer font-sans text-xs font-medium";

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────── */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(o => !o)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); !disabled && setOpen(o => !o); } }}
        className={[
          H_CLS,
          "inline-flex items-center gap-2 border rounded-md select-none w-full box-border",
          "transition-[border-color,box-shadow] duration-fast ease-standard",
          EDGE,
          disabled ? "bg-[var(--input-bg-disabled)] opacity-[0.5] cursor-not-allowed" : "bg-[var(--input-bg)] opacity-100 cursor-pointer",
        ].join(" ")}
        style={{ padding: `0 ${SZ.px}px`, ...style }}
      >
        <i
          className={`ph ${value ? "ph-calendar-check" : "ph-calendar-blank"} shrink-0 ${value ? "text-fg-brand" : "text-fg-tertiary"}`}
          style={{ fontSize: SZ.icon }}
        />
        <span className={[
          "flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
          value ? "font-data text-fg-primary" : "font-sans text-fg-tertiary",
        ].join(" ")} style={{ fontSize: SZ.fs }}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value ? (
          <span
            role="button"
            aria-label="Clear date"
            onClick={(e) => { e.stopPropagation(); onChange && onChange(null); }}
            className="inline-flex items-center justify-center size-[18px] rounded-full text-fg-tertiary text-[11px] shrink-0 cursor-pointer"
          >
            <i className="ph ph-x" />
          </span>
        ) : (
          <i className="ph ph-caret-down text-fg-tertiary text-[11px] shrink-0" />
        )}
      </div>

      {/* ── Calendar panel ──────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          data-theme={resolvedDark ? "dark" : undefined}
          className="fixed z-popover bg-surface-card border border-line-default rounded-lg shadow-e-lg font-sans pt-3 px-3 pb-2"
          style={panelPos}
        >
          {/* Month / year navigation */}
          <div className="flex items-center gap-1 mb-2">
            <button type="button" className={navBtn} onClick={prevMonth}>
              <i className="ph ph-caret-left" />
            </button>
            <div className="flex-1 min-w-0 text-center font-semibold text-sm text-fg-primary tracking-[-0.01em]">
              {CAL_MONTHS[viewMonth]} {viewYear}
            </div>
            <button type="button" className={navBtn} onClick={nextMonth}>
              <i className="ph ph-caret-right" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-[2px]">
            {CAL_DAYS_SHORT.map(d => (
              <div key={d} className="text-center py-[3px] text-2xs font-semibold tracking-wide uppercase text-fg-tertiary">{d}</div>
            ))}
          </div>

          {/* Day grid — the `hovered` index useState is gone; it re-rendered all
             42 cells on every pointer move. Hover is a class, present only on
             cells that are neither selected nor out of range — exactly what the
             old `hov` expression computed. */}
          <div className="grid grid-cols-7 gap-px">
            {cells.map((cell, i) => {
              const sel  = isSameDay(cell.d, value);
              const tod  = isSameDay(cell.d, today);
              const dis  = isOutOfRange(cell.d);

              return (
                <button
                  key={i}
                  type="button"
                  disabled={dis}
                  onClick={() => selectDay(cell.d)}
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
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-line-subtle flex justify-between items-center">
            <button type="button" onClick={goToday} className={footBtn + " text-fg-brand"}>
              Today
            </button>
            {value && (
              <button type="button"
                onClick={() => { onChange && onChange(null); setOpen(false); }}
                className={footBtn + " text-fg-tertiary"}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
