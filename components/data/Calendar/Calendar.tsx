import { resolveDataState } from "../../utils/DataState.tsx";
import { EmptyState } from "../../feedback/EmptyState/EmptyState.tsx";
import React from "react";
import { pressableProps } from "../../utils/interaction.tsx";
/* Spoken day names for the day cells. */
const DAY_LABEL = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
import { StatusChip } from "../StatusChip/StatusChip.tsx";

/* ── Types (mirrored in Calendar.d.ts) ── */
export interface CalendarRecord {
  /** Record ID — monospace, first line of a day-panel row. */
  id: string;
  /** The date the record sits on (its requested / created date). Date, ISO, "12 Jun 2026" or "12 Jun" (+ defaultYear). */
  date: string | Date;
  /** ERP status — mapped to a tone via StatusChip. Drives the day-cell count chips. */
  status?: string;
  /** Human title — day-panel row heading. Falls back to id. */
  title?: string;
  /** Second line of the day-panel row (owner, group, …). */
  sublabel?: string;
  [key: string]: any;
}

export type CalendarView = "month" | "week" | "year";

export interface CalendarProps {
  records?: CalendarRecord[];
  /** Controlled view. Omit for uncontrolled. */
  view?: CalendarView;
  /** Uncontrolled initial view. @default "month" */
  defaultView?: CalendarView;
  onViewChange?: (v: CalendarView) => void;
  /** Controlled month/period cursor. Omit for uncontrolled. */
  cursor?: Date;
  /** Uncontrolled initial cursor. @default today */
  defaultCursor?: Date;
  onCursorChange?: (d: Date) => void;
  /** Controlled selected day. Omit for uncontrolled. */
  selectedDate?: Date;
  /** Uncontrolled initial selected day. @default today */
  defaultSelectedDate?: Date;
  onSelectDate?: (d: Date) => void;
  /** Day-panel row / cell-chip click — open the record detail. */
  onRecordClick?: (record: CalendarRecord) => void;
  /**
   * Statuses to summarize as day-cell count chips, in order. Records with a
   * status outside this list are still listed in the day panel.
   * @default ["Approved","In Review","Pending","Rejected"]
   */
  statusOrder?: string[];
  /** Right-hand day panel listing the selected day's records. @default true */
  showPanel?: boolean;
  /** Built-in header: period label · ‹ Today › · Month/Week/Year toggle. @default true */
  showToolbar?: boolean;
  /** Year assumed for day-month date strings like "13 Jun". */
  defaultYear?: number;
  /** Day-panel empty line. @default "No records on this day" */
  emptyLabel?: string;
  style?: React.CSSProperties;
}

const { useState, useMemo, useRef, useEffect } = React;

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DS_MINI = ["S", "M", "T", "W", "T", "F", "S"];
const DEFAULT_ORDER = ["Approved", "In Review", "Pending", "Rejected"];

/* tone → soft bg / fg CSS vars (mirrors StatusChip → Badge tones) */
const TONE_VARS: Record<string, { bg: string; fg: string }> = {
  done:    { bg: "var(--tone-done-bg)",    fg: "var(--tone-done-fg)"    },
  doing:   { bg: "var(--tone-doing-bg)",   fg: "var(--tone-doing-fg)"   },
  todo:    { bg: "var(--tone-todo-bg)",    fg: "var(--tone-todo-fg)"    },
  pending: { bg: "var(--tone-pending-bg)", fg: "var(--tone-pending-fg)" },
  warning: { bg: "var(--tone-warning-bg)", fg: "var(--tone-warning-fg)" },
  error:   { bg: "var(--tone-error-bg)",   fg: "var(--tone-error-fg)"   },
  brand:   { bg: "var(--tone-brand-bg)",   fg: "var(--tone-brand-fg)"   },
  blocked: { bg: "var(--tone-blocked-bg)", fg: "var(--tone-blocked-fg)" },
  neutral: { bg: "var(--tone-todo-bg)",    fg: "var(--tone-todo-fg)"    },
};
const toneVars = (status: string) => TONE_VARS[StatusChip.toneFor(status)] || TONE_VARS.neutral;

/* ── date helpers ── */
function parseDate(v: string | Date, defYear?: number): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(+v) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
  const s = String(v).trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const dmy = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s*(\d{4})?$/.exec(s);
  if (dmy) {
    const m = MONTHS_SHORT.indexOf(dmy[2].slice(0, 3).replace(/^\w/, (c) => c.toUpperCase()));
    if (m >= 0) return new Date(dmy[3] ? +dmy[3] : (defYear ?? new Date().getFullYear()), m, +dmy[1]);
  }
  const d = new Date(s);
  return isNaN(+d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
const startOfWeek = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - x.getDay()); return x; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const longLabel = (d: Date) => `${DAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

/* ── count chip on a day cell ──
   The tone pair is a runtime lookup off the record's status string, so bg/fg
   stay inline; everything around them is a class. */
function CountChip({ status, n, compact }: { status: string; n: number; compact?: boolean }) {
  const v = toneVars(status);
  return (
    <span className={["flex items-center justify-between gap-1 rounded-sm font-sans text-2xs font-semibold leading-[1.4]", compact ? "py-px px-[6px]" : "py-[2px] px-2"].join(" ")}
      style={{ background: v.bg, color: v.fg }}>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{status}</span>
      <span className="font-data">{n}</span>
    </span>
  );
}

/* ── grid day cell (month view) ──
   The `hov` useState is gone — a cell re-rendering on every pointer move is
   35 re-renders per month grid traverse. Hover is a class, applied only when
   the cell is neither an adjacent-month filler nor the selected day (so it
   cannot override the selection fill through emit order). */
const CELL_BASE = "border-r border-b border-line-subtle pt-1 px-1 pb-2 flex flex-col gap-1 min-h-0 cursor-pointer transition-[background-color] duration-fast ease-standard";
function MonthCell({ date, other, today, selected, records, order, onSelect }: any) {
  const isToday = sameDay(date, today);
  const counts: Record<string, number> = {};
  records.forEach((r: CalendarRecord) => { const s = r.status || "—"; counts[s] = (counts[s] || 0) + 1; });
  const shown = order.filter((s: string) => counts[s]);
  const extra = Object.keys(counts).filter((s) => !order.includes(s));
  const wknd = isWeekend(date);
  return (
    <div {...pressableProps(() => onSelect(date), { pressed: !!selected, label: DAY_LABEL.format(date) + (records.length ? `, ${records.length} record${records.length > 1 ? "s" : ""}` : "") })}
      aria-current={isToday ? "date" : undefined}
      className={[
        CELL_BASE, "focus-visible:focus-ring",
        selected ? "bg-surface-brand-soft outline outline-2 outline-line-brand -outline-offset-2" : "outline-none",
        selected ? "" : (wknd && !other ? "bg-surface-soft" : "bg-transparent"),
        !other && !selected ? "hover:bg-surface-soft" : "",
        other ? "opacity-[0.4]" : "opacity-100",
      ].join(" ")}>
      <div className="flex items-center justify-between">
        <span className={[
          "size-[26px] rounded-full inline-flex items-center justify-center font-data text-sm font-semibold",
          isToday ? "bg-surface-brand text-[#fff]" : "bg-transparent text-fg-secondary",
        ].join(" ")}>{date.getDate()}</span>
      </div>
      {!other && (
        <div className="flex flex-col gap-[3px]">
          {shown.map((s: string) => <CountChip key={s} status={s} n={counts[s]} compact />)}
          {extra.length > 0 && (
            <span className="text-2xs text-fg-tertiary font-data pl-[2px]">
              +{extra.reduce((a, s) => a + counts[s], 0)} other
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function MonthView({ cursor, selected, today, byDate, order, onSelect }: any) {
  const yr = cursor.getFullYear(), mo = cursor.getMonth();
  const firstDow = new Date(yr, mo, 1).getDay();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const prevDim = new Date(yr, mo, 0).getDate();
  const cells: { d: Date; other: boolean }[] = [];
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ d: new Date(yr, mo - 1, prevDim - i), other: true });
  for (let i = 1; i <= dim; i++) cells.push({ d: new Date(yr, mo, i), other: false });
  while (cells.length % 7 !== 0 || cells.length < 35) cells.push({ d: new Date(yr, mo + 1, cells.length - dim - firstDow + 1), other: true });
  const rows = cells.length / 7;
  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line-subtle shrink-0">
        {DAYS_SHORT.map((d) => <div key={d} className="py-2 text-center text-2xs font-semibold tracking-wide uppercase text-fg-tertiary">{d}</div>)}
      </div>
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
        <div className="grid grid-cols-7 h-full" style={{ gridTemplateRows: `repeat(${rows}, minmax(96px, 1fr))` }}>
          {cells.map((c, i) => (
            <MonthCell key={i} date={c.d} other={c.other} today={today} selected={!c.other && sameDay(c.d, selected)}
              records={c.other ? [] : (byDate[key(c.d)] || [])} order={order} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({ cursor, selected, today, byDate, order, onSelect }: any) {
  const ws = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line-subtle shrink-0">
        {days.map((d) => {
          const isToday = sameDay(d, today);
          return (
            <div key={+d} className="py-2 text-center">
              <div className="text-2xs font-semibold tracking-wide uppercase text-fg-tertiary mb-1">{DAYS_SHORT[d.getDay()]}</div>
              <div className={[
                "size-[30px] mx-auto rounded-full flex items-center justify-center font-data text-sm font-semibold",
                isToday ? "bg-surface-brand text-[#fff]" : "bg-transparent text-fg-secondary",
              ].join(" ")}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 flex-1 min-h-0 min-w-0 overflow-y-auto">
        {days.map((d) => {
          const recs = byDate[key(d)] || [];
          const counts: Record<string, number> = {};
          recs.forEach((r: CalendarRecord) => { const s = r.status || "—"; counts[s] = (counts[s] || 0) + 1; });
          const shown = order.filter((s: string) => counts[s]);
          const sel = sameDay(d, selected);
          return (
            <div key={+d} {...pressableProps(() => onSelect(d), { pressed: sel, label: DAY_LABEL.format(d) })} className={[
              "focus-visible:focus-ring",
              "border-r border-line-subtle p-2 flex flex-col gap-1 cursor-pointer",
              sel ? "bg-surface-brand-soft outline outline-2 outline-line-brand -outline-offset-2"
                  : (isWeekend(d) ? "bg-surface-soft outline-none" : "bg-transparent outline-none"),
            ].join(" ")}>
              {shown.length ? shown.map((s: string) => <CountChip key={s} status={s} n={counts[s]} />)
                : <span className="text-2xs text-fg-tertiary text-center pt-1">—</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YearView({ cursor, selected, today, byDate, onSelect }: any) {
  const yr = cursor.getFullYear();
  return (
    <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-y-5 gap-x-6 py-4 px-5">
        {Array.from({ length: 12 }, (_, m) => {
          const firstDow = new Date(yr, m, 1).getDay();
          const dim = new Date(yr, m + 1, 0).getDate();
          return (
            <div key={m}>
              <p className="text-sm font-semibold text-fg-primary m-0 mb-2">{MONTHS_FULL[m]}</p>
              <div className="grid grid-cols-7">
                {DS_MINI.map((d, i) => <div key={i} className="h-[20px] flex items-center justify-center text-2xs text-fg-tertiary font-medium">{d}</div>)}
                {Array.from({ length: firstDow }, (_, i) => <div key={`b${i}`} className="h-[26px]" />)}
                {Array.from({ length: dim }, (_, i) => {
                  const date = new Date(yr, m, i + 1);
                  const recs = byDate[key(date)] || [];
                  const isToday = sameDay(date, today);
                  const sel = sameDay(date, selected);
                  const hasRec = recs.length > 0;
                  return (
                    <div key={i} {...pressableProps(() => onSelect(date), { pressed: sel, label: DAY_LABEL.format(date) + (hasRec ? `, ${recs.length} record${recs.length > 1 ? "s" : ""}` : "") })} title={hasRec ? `${recs.length} record${recs.length > 1 ? "s" : ""}` : undefined} className="h-[26px] flex items-center justify-center cursor-pointer">
                      <span className={[
                        "relative size-[22px] rounded-full flex items-center justify-center font-data text-2xs",
                        isToday ? "bg-surface-brand text-[#fff]" : "bg-transparent text-fg-secondary",
                        sel && !isToday ? "[box-shadow:0_0_0_2px_var(--border-brand)]" : "[box-shadow:none]",
                      ].join(" ")}>
                        {i + 1}
                        {hasRec && !isToday && <span className="absolute bottom-px left-1/2 [transform:translateX(-50%)] size-[4px] rounded-full bg-surface-brand" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── right-hand day panel ── */
function DayPanel({ selected, records, onRecordClick, emptyLabel }: any) {
  const [q, setQ] = useState("");
  const filtered = records.filter((r: CalendarRecord) => !q || `${r.id} ${r.title || ""} ${r.sublabel || ""} ${r.status || ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="w-[320px] shrink-0 border-l border-line-subtle flex flex-col overflow-hidden">
      <div className="pt-3 px-3 pb-2 border-b border-line-subtle shrink-0">
        <p className="m-0 text-sm font-semibold text-fg-primary">{longLabel(selected)}</p>
        <p className="m-0 mt-[2px] text-2xs text-fg-tertiary font-data">{records.length} record{records.length === 1 ? "" : "s"}</p>
      </div>
      <div className="py-2 px-3 border-b border-line-subtle shrink-0">
        <div className="flex items-center gap-2 bg-surface-soft border border-line-subtle rounded-md p-2">
          <i className="ph ph-magnifying-glass text-[15px] text-fg-tertiary" />
          <input type="search" aria-label="Search records" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records…" className="flex-1 min-w-0 border-none bg-transparent outline-none font-sans text-sm text-fg-primary" />
          {q && <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="inline-flex border-none bg-transparent p-0 cursor-pointer text-fg-tertiary"><i aria-hidden="true" className="ph ph-x text-[14px]" /></button>}
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto p-3 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 px-3 text-center flex-1 min-w-0">
            <i className="ph ph-calendar-blank text-[34px] text-fg-tertiary" />
            <p className="m-0 text-sm text-fg-tertiary">{q ? "No matching records" : emptyLabel}</p>
          </div>
        ) : filtered.map((r: CalendarRecord, i: number) => (
          <DayRow key={r.id || i} r={r} onClick={onRecordClick} />
        ))}
      </div>
    </div>
  );
}

/* The row's `hov` useState is gone; hover is a class, and it only paints when
   the row is clickable — exactly what the old `hov && clickable` ternary did. */
const DAY_ROW = "rounded-md py-2 px-3 border transition-[background-color,border-color] duration-fast ease-standard";
const DAY_ROW_ON = "border-line-subtle bg-surface-card cursor-pointer hover:border-line-brand hover:bg-surface-brand-soft";
const DAY_ROW_OFF = "border-line-subtle bg-surface-card cursor-default";
function DayRow({ r, onClick }: { r: CalendarRecord; onClick?: (r: CalendarRecord) => void }) {
  const clickable = !!onClick;
  return (
    <div {...pressableProps(clickable ? () => onClick?.(r) : null, { label: [r.id, r.title].filter(Boolean).join(" — ") })}
      className={[DAY_ROW, clickable ? DAY_ROW_ON + " outline-none focus-visible:focus-ring" : DAY_ROW_OFF].join(" ")}>
      <div className="flex items-center justify-between gap-2 mb-[3px]">
        <span className="font-data text-2xs text-fg-tertiary">{r.id}</span>
        {r.status && <StatusChip status={r.status} size="sm" />}
      </div>
      <p className="m-0 text-sm font-medium text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap">{r.title || r.id}</p>
      {r.sublabel && <p className="m-0 mt-px text-2xs text-fg-tertiary">{r.sublabel}</p>}
    </div>
  );
}

/* The system's FOURTH pill track — beds on --agni-neutral-100 with a literal
   #fff active label, matching SegmentedControl. Carried over unchanged; see
   the recorded unification decision. */
const TOG_BTN =
  "border-none cursor-pointer py-1 px-3 rounded-sm font-sans text-sm font-medium " +
  "transition-[background-color,color] duration-fast ease-standard";
const TOG_ON = "bg-action-brand text-[#fff] shadow-e-xs";
const TOG_OFF = "bg-transparent text-fg-tertiary";
function SegToggle({ options, value, onChange }: { options: { k: string; label: string }[]; value: string; onChange: (k: any) => void }) {
  return (
    <div className="flex gap-[2px] p-[3px] bg-[var(--agni-neutral-100)] rounded-md">
      {options.map((o) => {
        const on = value === o.k;
        return <button key={o.k} type="button" onClick={() => onChange(o.k)} className={[TOG_BTN, on ? TOG_ON : TOG_OFF].join(" ")}>{o.label}</button>;
      })}
    </div>
  );
}

/**
 * AgniUI · Calendar
 * A record calendar view type for the Desk App Scaffold. Lays records on a
 * month / week / year grid keyed by each record's date, tones per-day count
 * chips by status (via StatusChip's status→tone map), and lists the selected
 * day's records in a right-hand panel. View / cursor / selection can be
 * controlled or uncontrolled.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 8). Both hover useStates are gone
 * (MonthCell re-rendered on every pointer move across a 35-cell grid). What
 * stays inline: the month grid's computed row template and the CountChip tone
 * pair, which is a runtime lookup off the record's status string.
 */
function CalendarBody({ forwardedRef,
  records = [],
  view,
  defaultView = "month",
  onViewChange,
  cursor,
  defaultCursor,
  onCursorChange,
  selectedDate,
  defaultSelectedDate,
  onSelectDate,
  onRecordClick,
  statusOrder = DEFAULT_ORDER,
  showPanel = true,
  showToolbar = true,
  defaultYear,
  emptyLabel = "No records on this day",
  isEmpty = false,
  empty,
  style = {},
}) {
  const today = useMemo(() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }, []);
  const [viewState, setViewState] = useState(defaultView);
  const [cursorState, setCursorState] = useState(defaultCursor || today);
  const [selState, setSelState] = useState(defaultSelectedDate || today);
  const vw: CalendarView = view ?? viewState;
  const cur = cursor ?? cursorState;
  const sel = selectedDate ?? selState;

  const setView = (v: CalendarView) => { if (view === undefined) setViewState(v); onViewChange?.(v); };
  const setCursor = (d: Date) => { if (cursor === undefined) setCursorState(d); onCursorChange?.(d); };
  const selectDay = (d: Date) => {
    if (selectedDate === undefined) setSelState(d);
    onSelectDate?.(d);
    if (d.getMonth() !== cur.getMonth() || d.getFullYear() !== cur.getFullYear()) setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const byDate = useMemo(() => {
    const map: Record<string, CalendarRecord[]> = {};
    records.forEach((r) => { const d = parseDate(r.date, defaultYear); if (d) (map[key(d)] = map[key(d)] || []).push(r); });
    return map;
  }, [records, defaultYear]);

  const periodLabel = vw === "year" ? String(cur.getFullYear())
    : vw === "week" ? (() => { const ws = startOfWeek(cur), we = addDays(ws, 6);
        return ws.getMonth() === we.getMonth() ? `${ws.getDate()}–${we.getDate()} ${MONTHS_SHORT[ws.getMonth()]} ${ws.getFullYear()}`
          : `${ws.getDate()} ${MONTHS_SHORT[ws.getMonth()]} – ${we.getDate()} ${MONTHS_SHORT[we.getMonth()]} ${we.getFullYear()}`; })()
    : `${MONTHS_FULL[cur.getMonth()]} ${cur.getFullYear()}`;

  const step = (dir: number) => {
    if (vw === "year") setCursor(new Date(cur.getFullYear() + dir, cur.getMonth(), 1));
    else if (vw === "week") setCursor(addDays(cur, dir * 7));
    else setCursor(addMonths(cur, dir));
  };
  const goToday = () => { setCursor(vw === "week" ? today : new Date(today.getFullYear(), today.getMonth(), 1)); selectDay(today); };

  const daySel = byDate[key(sel)] || [];

  return (
    <div ref={forwardedRef as never} className="flex flex-col h-full min-h-0 bg-surface-card border border-line-subtle rounded-lg shadow-e-xs overflow-hidden" style={style}>
      {showToolbar && (
        <div className="flex items-center justify-between gap-3 flex-wrap py-2 px-3 border-b border-line-subtle shrink-0">
          <div className="flex items-center gap-1">
            <button type="button" title="Previous" onClick={() => step(-1)} className={NAV_BTN}><i className="ph ph-caret-left text-[15px]" /></button>
            <button type="button" onClick={goToday} className={[NAV_BTN, "w-auto px-3 text-sm font-medium font-sans"].join(" ")}>Today</button>
            <button type="button" title="Next" onClick={() => step(1)} className={NAV_BTN}><i className="ph ph-caret-right text-[15px]" /></button>
            <span className="ml-1 text-md font-semibold text-fg-primary">{periodLabel}</span>
          </div>
          <SegToggle options={[{ k: "month", label: "Month" }, { k: "week", label: "Week" }, { k: "year", label: "Year" }]} value={vw} onChange={setView} />
        </div>
      )}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {isEmpty
            ? <div className="flex-1 min-w-0 grid place-items-center py-8 px-4">
                {typeof empty === "string" || empty == null
                  ? <EmptyState size="sm" bordered={false} icon="ph-calendar-blank" title={empty || "Nothing in this period"} message="Use ‹ Today › above to move to another period." />
                  : empty}
              </div>
            : <>
                {vw === "month" && <MonthView cursor={cur} selected={sel} today={today} byDate={byDate} order={statusOrder} onSelect={selectDay} />}
                {vw === "week" && <WeekView cursor={cur} selected={sel} today={today} byDate={byDate} order={statusOrder} onSelect={selectDay} />}
                {vw === "year" && <YearView cursor={cur} selected={sel} today={today} byDate={byDate} onSelect={selectDay} />}
              </>}
        </div>
        {showPanel && <DayPanel selected={sel} records={daySel} onRecordClick={onRecordClick} emptyLabel={emptyLabel} />}
      </div>
    </div>
  );
}

const NAV_BTN =
  "size-[32px] inline-flex items-center justify-center border border-line-subtle rounded-md " +
  "bg-surface-card text-fg-secondary cursor-pointer";

/* State contract — loading and error replace the whole view, but an empty
   period must NOT: the navigator lives inside the body, so replacing it would
   trap the user in a period they cannot page out of. Emptiness is forwarded and
   rendered inside the grid region, beneath the navigator row. */
export const Calendar = React.forwardRef<HTMLElement, any>(function Calendar(props, ref) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    shape: "calendar", height: props.height || 420,
  });
  if (state !== false) return <div ref={ref as never} className="w-full" style={props.style || {}}>{state}</div>;
  return <CalendarBody {...props} forwardedRef={ref} isEmpty={!(props.records && props.records.length)} />;
});
