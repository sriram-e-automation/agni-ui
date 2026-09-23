import { resolveDataState } from "../../utils/DataState.tsx";
import React from "react";
import { pressableProps } from "../../utils/interaction.tsx";

/* ── Types (mirrored in GanttTimeline.d.ts) ── */
/** One bar on the timeline. Extra fields are legal — `groupBy` reads any of them. */
export interface GanttItem {
  /** Record ID — first line of the left label (monospace). */
  id: string;
  /** Human title shown in the hover tooltip. Falls back to id. */
  label?: string;
  /** Second line of the left label (assignee, owner, …). Hidden at size="sm". */
  sublabel?: string;
  /** Bar start — Date, ISO string, "12 Jun 2025" or "12 Jun" (+ defaultYear). */
  start: string | Date;
  /** Bar end (inclusive day). */
  end: string | Date;
  /**
   * Status tone. Canonical keys: approvals · todo · progress · overdue · done ·
   * rejected — record statuses ("In Progress", "Completed", "Yet to start",
   * "Awaiting Approval", …) are auto-mapped. Drives the --kanban-*-dot bar color.
   */
  status?: string;
  /** 0–1 → lighter fill overlay on the bar. */
  progress?: number;
  [key: string]: any;
}

export interface GanttGroupOption {
  /** Item field name to group rows by, e.g. "requestType". */
  key: string;
  /** Toolbar / corner-header label, e.g. "Request type". */
  label: string;
}

export type GanttScale = "day" | "week" | "month" | "quarter" | "year";

export interface GanttTimelineProps {
  items?: GanttItem[];
  /** Fields offered in the "Group by" control (+ automatic "None"). */
  groupOptions?: GanttGroupOption[];
  /** Controlled group-by field (null = flat). Omit for uncontrolled. */
  groupBy?: string | null;
  /** Uncontrolled initial group-by. @default null */
  defaultGroupBy?: string | null;
  onGroupByChange?: (groupBy: string | null) => void;
  /** Controlled zoom scale. Omit for uncontrolled. */
  scale?: GanttScale;
  /** Uncontrolled initial scale. @default "week" */
  defaultScale?: GanttScale;
  onScaleChange?: (scale: GanttScale) => void;
  /** Bar / left-label click — open the record detail. */
  onItemClick?: (item: GanttItem) => void;
  /**
   * Built-in header row with the "Group by" segmented control. Set false
   * when the host page owns grouping UI (e.g. the Desk App Scaffold's
   * page-controls bar). @default true
   */
  showToolbar?: boolean;
  /**
   * Navigator row above the grid: ‹ Today › + live range label (left) and
   * the Days·Weeks·Months·Quarters·Years scale toggle (right). Prev/next
   * page the scroll by scale-relative screenfuls; the view re-homes to
   * today on scale change. Independent of showToolbar — it drives the
   * scrollable canvas, so it still renders when the toolbar is hidden.
   * Set false only when the host owns paging AND scale UI. @default true
   */
  showNavigator?: boolean;
  /** Extra control rendered at the start of the navigator row, before ‹ Today ›/label (e.g. a host-owned "Group by" select). */
  navigatorExtra?: React.ReactNode;
  /** md 44px rows · sm 34px rows (sublabel hidden). @default "md" */
  size?: "md" | "sm";
  /** Year assumed for day-month date strings like "13 Jun". */
  defaultYear?: number;
  /** Empty-state line. @default "No records in this period" */
  emptyLabel?: string;
  style?: React.CSSProperties;
}

/**
 * Horizontal scheduling (Gantt) view: collapsible group rows in a sticky left
 * column, a two-tier sticky time header, status-toned bars (shared kanban
 * tokens), a today line, hover tooltips and a ‹ Today › navigator. Scales:
 * day · week · month · quarter · year.
 */

const { useState, useMemo, useRef, useEffect } = React;

/**
 * AgniUI · GanttTimeline
 * Horizontal scheduling (Gantt) view for request/task records.
 *
 * - Group rows by any item field (request type, application, request ID, …) —
 *   groups render as collapsible header rows in the sticky left column.
 * - Five zoom scales: day · week · month · quarter · year — each its own
 *   two-tier time header (e.g. day cells under a "Jun 2026" span; quarter
 *   cells under a year span; year cells under a decade span).
 * - Built-in navigator row: ‹ Today › + a live range label (left) and the
 *   Days·Weeks·Months·Quarters·Years scale toggle (right). Prev/next page
 *   the grid by scale-relative screenfuls; the view re-homes to today on
 *   scale change. The row renders independent of showToolbar, since it
 *   drives the scrollable canvas it lives in — it still shows when the
 *   host owns group-by chrome externally (e.g. the Desk App Scaffold).
 * - Bars are tinted by the shared kanban status tokens (--kanban-*-dot), carry
 *   an optional progress fill, a hover tooltip and an onItemClick target.
 * - Fully tokenized via --gantt-* (tokens/components.css); light + dark safe.
 *
 * Controlled or uncontrolled: pass `scale`/`groupBy` + onChange to control from
 * outside chrome (e.g. page controls), or let the built-in toolbar drive them.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 8). Everything the grid COMPUTES
 * stays inline — cell widths, span widths, bar left/width, the today-line
 * offset, the repeating-gradient cell rules, the tooltip's pointer
 * coordinates, and the `--kanban-<tone>-dot` bar colour (a runtime lookup off
 * the item's status). The `hoverRow` key is gone: row hover is the `group`
 * pattern, so the sticky label cell and the bar shadow follow the row without
 * re-rendering the whole timeline on every pointer move.
 */

/* ── Date helpers ─────────────────────────────────────────────── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86400000;

/* Accepts Date, ISO, "12 Jun 2025" or "12 Jun" (defaultYear). */
function parseDate(v, defaultYear) {
  if (v instanceof Date) return v;
  if (typeof v !== "string") return null;
  const m = v.trim().match(/^(\d{1,2})\s+([A-Za-z]{3,})\.?\s*(\d{4})?$/);
  if (m) {
    const mi = MONTHS.findIndex((x) => m[2].toLowerCase().startsWith(x.toLowerCase()));
    if (mi >= 0) return new Date(m[3] ? +m[3] : (defaultYear || new Date().getFullYear()), mi, +m[1]);
  }
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
const startOfWeek = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmt = (d) => d ? `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "—";

/* Scale-aware navigator label built from the cell at the chart's left edge:
   day → "4 JUL 26" · week → "28 JUN – 04 JUL 26" · month → "JUN 2026" ·
   quarter → "Q1 2026 · JAN, FEB & MAR" · year → "2026". */
function navLabel(cell, scale) {
  if (!cell) return "";
  const s = cell.start;
  const MON = (d) => MONTHS[d.getMonth()].toUpperCase();
  const yy  = (d) => String(d.getFullYear()).slice(-2);
  const dd  = (d) => String(d.getDate()).padStart(2, "0");
  if (scale === "day")   return `${s.getDate()} ${MON(s)} ${yy(s)}`;
  if (scale === "week")  { const e = addDays(s, 6); return `${dd(s)} ${MON(s)} – ${dd(e)} ${MON(e)} ${yy(e)}`; }
  if (scale === "month") return `${MON(s)} ${s.getFullYear()}`;
  if (scale === "quarter") {
    const q = Math.floor(s.getMonth() / 3) + 1;
    const m = [0, 1, 2].map((i) => MONTHS[s.getMonth() + i].toUpperCase());
    return `Q${q} ${s.getFullYear()} · ${m[0]}, ${m[1]} & ${m[2]}`;
  }
  return String(s.getFullYear());
}

/* ── Scale → cell builders ────────────────────────────────────── */
const SCALES = [
  { key: "day",     label: "Days"     },
  { key: "week",    label: "Weeks"    },
  { key: "month",   label: "Months"   },
  { key: "quarter", label: "Quarters" },
  { key: "year",    label: "Years"    },
];
const CELL_W = { day: 36, week: 68, month: 92, quarter: 88, year: 84 };

/* Builds the tier-2 cells + tier-1 spans covering [min, max]. Keeps emitting
   future cells until at least `minCells` exist, so the grid fills the viewport
   width even when the data range is short (no blank right-hand gutter). */
function buildCells(scale, min, max, minCells = 0) {
  const cells = [];
  const need = (c, stop) => c < stop || cells.length < minCells;
  if (scale === "day") {
    let c = addDays(min, -4);
    const stop = addDays(max, 5);
    while (need(c, stop)) { const n = addDays(c, 1); cells.push({ start: c, end: n, label: String(c.getDate()).padStart(2, "0"), t1: `${MONTHS[c.getMonth()]} ${c.getFullYear()}` }); c = n; }
  } else if (scale === "week") {
    let c = startOfWeek(addDays(min, -7));
    const stop = addDays(startOfWeek(addDays(max, 7)), 7);
    while (need(c, stop)) { cells.push({ start: c, end: addDays(c, 7), label: String(c.getDate()).padStart(2, "0"), t1: `${MONTHS[c.getMonth()]} ${c.getFullYear()}` }); c = addDays(c, 7); }
  } else if (scale === "month") {
    let c = new Date(min.getFullYear(), min.getMonth() - 1, 1);
    const stop = new Date(max.getFullYear(), max.getMonth() + 2, 1);
    while (need(c, stop)) { cells.push({ start: c, end: new Date(c.getFullYear(), c.getMonth() + 1, 1), label: MONTHS[c.getMonth()], t1: String(c.getFullYear()) }); c = new Date(c.getFullYear(), c.getMonth() + 1, 1); }
  } else if (scale === "quarter") {
    let c = new Date(min.getFullYear(), Math.floor(min.getMonth() / 3) * 3 - 3, 1);
    const stop = new Date(max.getFullYear(), Math.floor(max.getMonth() / 3) * 3 + 6, 1);
    while (need(c, stop)) { cells.push({ start: c, end: new Date(c.getFullYear(), c.getMonth() + 3, 1), label: "Q" + (Math.floor(c.getMonth() / 3) + 1), t1: String(c.getFullYear()) }); c = new Date(c.getFullYear(), c.getMonth() + 3, 1); }
  } else {
    /* year — whole-year cells grouped under a decade span */
    let c = new Date(min.getFullYear() - 1, 0, 1);
    const stop = new Date(max.getFullYear() + 2, 0, 1);
    while (need(c, stop)) { const n = new Date(c.getFullYear() + 1, 0, 1); cells.push({ start: c, end: n, label: String(c.getFullYear()), t1: `${Math.floor(c.getFullYear() / 10) * 10}s` }); c = n; }
  }
  /* tier-1 spans: contiguous cells sharing t1 */
  const spans = [];
  cells.forEach((c) => {
    const last = spans[spans.length - 1];
    if (last && last.label === c.t1) last.count++;
    else spans.push({ label: c.t1, count: 1 });
  });
  return { cells, spans };
}

/* Date → px, linear within the containing cell (handles uneven cell lengths). */
function px(date, cells, cellW) {
  if (!cells.length || !date) return 0;
  if (date <= cells[0].start) return 0;
  const last = cells[cells.length - 1];
  if (date >= last.end) return cells.length * cellW;
  const i = cells.findIndex((c) => date >= c.start && date < c.end);
  const c = cells[i];
  return i * cellW + ((date - c.start) / (c.end - c.start)) * cellW;
}

/* ── Status → token tone (shared with KanbanCard / StatusChip) ── */
const STATUS_TONE = {
  approvals: "approvals", "awaiting approval": "approvals",
  todo: "todo", "yet to start": "todo", pending: "todo",
  progress: "progress", "in progress": "progress", "in review": "progress",
  overdue: "overdue",
  done: "done", completed: "done", approved: "done",
  rejected: "rejected", blocked: "rejected",
};
const toneOf = (status) => STATUS_TONE[String(status || "").toLowerCase()] || "todo";

/* ── Segmented control (toolbar) ──────────────────────────────────
   Carried over unchanged in value terms — this is the FOURTH pill track in
   the system (TabsStrip segmented · SegmentedControl · PageTitleBar), and
   unifying them is the recorded open decision, not a migration change. */
const SEG_WRAP = "inline-flex gap-[2px] p-[2px] bg-surface-sunken rounded-md shrink-0";
const SEG_BTN =
  "border-none cursor-pointer py-1 px-3 rounded-sm font-sans text-sm font-medium whitespace-nowrap " +
  "transition-[background-color,color] duration-fast ease-standard";
const SEG_ON = "bg-action-brand text-fg-on-brand shadow-e-xs";
const SEG_OFF = "bg-transparent text-fg-tertiary";
function Segmented({ options, value, onChange, title }) {
  return (
    <div role="group" aria-label={title} className={SEG_WRAP}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button key={o.key} type="button" onClick={() => onChange(o.key)} aria-pressed={on}
            className={[SEG_BTN, on ? SEG_ON : SEG_OFF].join(" ")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Navigator — ‹ [scale-aware range label · jump to today] › ──
   The center label reflects the current scale AND acts as the "today"
   toggle: clicking it re-homes the grid to today. Prev/next page by scale. */
const NAV_BTN =
  "size-[28px] inline-flex items-center justify-center border-none bg-transparent cursor-pointer " +
  "text-fg-secondary text-[14px] shrink-0 transition-[background-color] duration-fast ease-standard " +
  "hover:bg-surface-soft";
const NAV_TODAY =
  "h-[28px] w-auto min-w-[96px] inline-flex items-center justify-center gap-2 px-3 border-none " +
  "bg-transparent cursor-pointer font-sans text-sm font-semibold text-fg-primary whitespace-nowrap " +
  "shrink-0 transition-[background-color] duration-fast ease-standard hover:bg-surface-soft";
function Navigator({ onPrev, onToday, onNext, label }) {
  return (
    <div className="inline-flex items-center gap-2 shrink-0">
      <div className="inline-flex items-center border border-line-default rounded-md bg-surface-card overflow-hidden">
        <button type="button" aria-label="Previous" onClick={onPrev} className={[NAV_BTN, "border-r border-r-line-default"].join(" ")}>
          <i className="ph ph-caret-left" />
        </button>
        <button type="button" onClick={onToday} aria-label="Jump to today" className={NAV_TODAY}>
          <i className="ph ph-crosshair text-[13px] text-fg-tertiary shrink-0" />
          {label || "Today"}
        </button>
        <button type="button" aria-label="Next" onClick={onNext} className={[NAV_BTN, "border-l border-l-line-default"].join(" ")}>
          <i className="ph ph-caret-right" />
        </button>
      </div>
    </div>
  );
}

/* ── Bar tooltip ──────────────────────────────────────────────── */
function BarTip({ tip }) {
  if (!tip) return null;
  const { item, x, y } = tip;
  return (
    <div className="fixed z-tooltip pointer-events-none bg-surface-card border border-line-default rounded-md shadow-e-lg py-2 px-3 min-w-[190px] max-w-[240px] font-sans"
      style={{ left: Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 250), top: y + 14 }}>
      <div className="flex items-center gap-1 mb-1">
        <span className="size-[8px] rounded-full shrink-0" style={{ background: `var(--kanban-${toneOf(item.status)}-dot)` }} />
        <span className="text-sm font-semibold text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap">{item.label || item.id}</span>
      </div>
      <div className="text-xs font-data text-fg-secondary">{item.id}</div>
      <div className="text-xs text-fg-tertiary mt-[3px]">{fmt(item._s)} → {fmt(item._e)} · {Math.max(1, Math.round((item._e - item._s) / DAY))}d</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
function GanttTimelineBody({ forwardedRef,
  items = [],
  groupOptions = [],
  groupBy: groupByProp, defaultGroupBy = null, onGroupByChange,
  scale: scaleProp, defaultScale = "week", onScaleChange,
  onItemClick,
  showToolbar = true,
  showNavigator = true,
  navigatorExtra = null,
  size = "md",
  defaultYear,
  emptyLabel = "No records in this period",
  style = {},
}) {
  const [scaleState, setScaleState] = useState(defaultScale);
  const [groupState, setGroupState] = useState(defaultGroupBy);
  const [collapsed, setCollapsed] = useState({});
  const [tip, setTip] = useState(null);
  const [viewLabel, setViewLabel] = useState("");
  const [availW, setAvailW] = useState(0);
  const scrollRef = useRef(null);
  const rafRef = useRef(null);

  const scale = scaleProp !== undefined ? scaleProp : scaleState;
  const groupBy = groupByProp !== undefined ? groupByProp : groupState;
  const setScale = (s) => { if (scaleProp === undefined) setScaleState(s); onScaleChange && onScaleChange(s); };
  const setGroup = (g) => { if (groupByProp === undefined) setGroupState(g); onGroupByChange && onGroupByChange(g); };

  const sm = size === "sm";
  const rowH = sm ? "var(--gantt-row-h-sm)" : "var(--gantt-row-h-md)";
  const barH = sm ? "var(--gantt-bar-h-sm)" : "var(--gantt-bar-h-md)";
  const leftW = sm ? 200 : 236;

  /* Parse dates once per items/scale change. */
  const parsed = useMemo(() => items
    .map((it) => ({ ...it, _s: parseDate(it.start, defaultYear), _e: parseDate(it.end, defaultYear) }))
    .filter((it) => it._s && it._e && it._e >= it._s), [items, defaultYear]);

  const cellW = CELL_W[scale] || 80;
  const minCells = availW ? Math.ceil((availW - leftW) / cellW) : 0;

  const { cells, spans } = useMemo(() => {
    if (!parsed.length) return { cells: [], spans: [] };
    const min = new Date(Math.min(...parsed.map((i) => +i._s)));
    const max = new Date(Math.max(...parsed.map((i) => +i._e)));
    return buildCells(scale, min, max, minCells);
  }, [parsed, scale, minCells]);

  const chartW = cells.length * cellW;

  /* Grouping */
  const groups = useMemo(() => {
    if (!groupBy) return [{ key: null, label: null, items: parsed }];
    const map = new Map();
    parsed.forEach((it) => {
      const k = it[groupBy] != null ? String(it[groupBy]) : "—";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(it);
    });
    return [...map.entries()].map(([label, list]) => ({ key: label, label, items: list }));
  }, [parsed, groupBy]);

  const today = new Date();
  const todayX = (cells.length && today >= cells[0].start && today < cells[cells.length - 1].end) ? px(today, cells, cellW) : null;

  /* ── Navigator — pages the scroll position by roughly one screenful of
     the chart at the current scale; label reflects the tier-1 span sitting
     at the chart's left edge. Re-homes to today whenever scale changes. ── */
  const updateViewLabel = () => {
    const el = scrollRef.current;
    if (!el || !cells.length) return;
    const idx = Math.min(cells.length - 1, Math.max(0, Math.floor(el.scrollLeft / cellW)));
    setViewLabel(navLabel(cells[idx], scale));
  };
  const onGridScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => { rafRef.current = null; updateViewLabel(); });
  };
  const page = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth - leftW) * 0.9, behavior: "smooth" });
  };
  const goToday = () => {
    const el = scrollRef.current;
    if (!el || todayX == null) return;
    el.scrollTo({ left: Math.max(0, todayX - (el.clientWidth - leftW) * 0.3), behavior: "smooth" });
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !cells.length) return;
    if (todayX != null) el.scrollLeft = Math.max(0, todayX - (el.clientWidth - leftW) * 0.3);
    requestAnimationFrame(updateViewLabel);
  }, [scale, cells, cellW]);

  /* Seed the label immediately from the left-edge cell so it never sits on the
     "Today" fallback when the grid doesn't overflow / today is out of range. */
  useEffect(() => {
    if (cells.length) setViewLabel(navLabel(cells[0], scale));
  }, [cells, scale]);

  /* Track the visible width so the grid can emit enough trailing cells to fill
     it — otherwise a short data range leaves a blank right-hand gutter. */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setAvailW(el.clientWidth));
    ro.observe(el);
    setAvailW(el.clientWidth);
    return () => ro.disconnect();
  }, [parsed.length]);

  const groupToolbarOpts = [{ key: "__none", label: "None" }, ...groupOptions.map((g) => ({ key: g.key, label: g.label }))];

  const headerCellCls = "box-border shrink-0 flex items-center font-sans text-[var(--gantt-header-fg)] border-b border-b-[var(--gantt-grid-line)]";
  const t1H = 26, t2H = 26;

  return (
    <div ref={forwardedRef as never} className="flex flex-col min-h-0 min-w-0 border border-line-subtle rounded-lg bg-surface-card overflow-hidden font-sans" style={style}>

      {/* ── Chrome — group-by toolbar (optional) + navigator w/ scale toggle ── */}
      {((showToolbar && groupOptions.length > 0) || (showNavigator && parsed.length > 0)) && (
        <div className="border-b border-b-[var(--gantt-grid-line)] shrink-0">
          {showToolbar && groupOptions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap py-2 px-3">
              <span className="text-2xs font-semibold tracking-wide uppercase text-fg-tertiary">Group by</span>
              <Segmented title="Group by" options={groupToolbarOpts} value={groupBy || "__none"} onChange={(k) => setGroup(k === "__none" ? null : k)} />
            </div>
          )}
          {showNavigator && parsed.length > 0 && (
            <div className={[
              "flex items-center gap-2 flex-wrap px-[12px]",
              showToolbar && groupOptions.length > 0
                ? "py-[8px] border-t border-t-[var(--gantt-grid-line)]"
                : "py-[10px] border-t-0",
            ].join(" ")}>
              {navigatorExtra}
              <Navigator onPrev={() => page(-1)} onToday={goToday} onNext={() => page(1)} label={viewLabel} />
              <span className="flex-1 min-w-0" />
              <Segmented title="Timeline scale" options={SCALES} value={scale} onChange={setScale} />
            </div>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {parsed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 px-5 text-fg-tertiary">
          <i className="ph ph-chart-bar-horizontal text-[30px] opacity-[0.35]" />
          <span className="text-sm">{emptyLabel}</span>
        </div>
      ) : (
        <div ref={scrollRef} onScroll={onGridScroll} className="flex-1 min-h-0 min-w-0 overflow-auto relative">
          <div className="relative" style={{ minWidth: leftW + chartW }}>

            {/* Sticky two-tier time header */}
            <div className="sticky top-0 z-[4] flex bg-[var(--gantt-header-bg)] [backdrop-filter:blur(6px)]">
              {/* Corner */}
              <div className={[headerCellCls, "sticky left-0 z-[5] px-3 bg-[var(--gantt-header-bg)] border-r border-r-[var(--gantt-grid-line)] text-2xs font-semibold tracking-wide uppercase"].join(" ")}
                style={{ width: leftW, height: t1H + t2H }}>
                {groupBy ? (groupOptions.find((g) => g.key === groupBy) || {}).label || groupBy : "Record"}
              </div>
              <div className="shrink-0" style={{ width: chartW }}>
                {/* Tier 1 */}
                <div className="flex" style={{ height: t1H }}>
                  {spans.map((s, i) => (
                    <div key={i} className={[headerCellCls, "px-2 text-xs font-semibold whitespace-nowrap overflow-hidden", i === 0 ? "border-l-0" : "border-l border-l-[var(--gantt-grid-line)]"].join(" ")}
                      style={{ width: s.count * cellW, height: t1H }}>{s.label}</div>
                  ))}
                </div>
                {/* Tier 2 */}
                <div className="flex" style={{ height: t2H }}>
                  {cells.map((c, i) => (
                    <div key={i} className={[headerCellCls, "justify-center text-2xs font-data", i === 0 ? "border-l-0" : "border-l border-l-[var(--gantt-grid-line)]"].join(" ")}
                      style={{ width: cellW, height: t2H }}>{c.label}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rows */}
            {groups.map((g) => {
              const isCollapsed = g.key != null && collapsed[g.key];
              return (
                <React.Fragment key={g.key == null ? "__flat" : g.key}>
                  {g.key != null && (
                    <div {...pressableProps(() => setCollapsed((p) => ({ ...p, [g.key]: !p[g.key] })))}
                      aria-expanded={!isCollapsed}
                      className="flex cursor-pointer select-none outline-none focus-visible:focus-ring bg-[var(--gantt-group-bg)] border-b border-b-[var(--gantt-grid-line)]">
                      <div className="sticky left-0 z-[2] shrink-0 box-border flex items-center gap-2 px-3 h-[32px] bg-[var(--gantt-group-bg)] border-r border-r-[var(--gantt-grid-line)]" style={{ width: leftW }}>
                        <i aria-hidden="true" className={"ph text-[11px] text-fg-tertiary shrink-0 " + (isCollapsed ? "ph-caret-right" : "ph-caret-down")} />
                        <span className="text-xs font-semibold text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap">{g.label}</span>
                        <span className="text-2xs font-data text-fg-tertiary bg-surface-card border border-line-subtle rounded-full px-2 leading-[16px] shrink-0">{g.items.length}</span>
                      </div>
                      <div className="shrink-0" style={{ width: chartW }} />
                    </div>
                  )}
                  {!isCollapsed && g.items.map((it) => {
                    const x0 = px(it._s, cells, cellW);
                    const x1 = Math.max(x0 + 6, px(addDays(it._e, 1), cells, cellW));
                    const tone = toneOf(it.status);
                    const rowKey = (g.key || "") + "/" + it.id;
                    /* Row hover was a `hoverRow` key in React state — one re-render of the
                       whole timeline per pointer move across it. It is the `group` pattern
                       now: the row paints itself, and the sticky label cell and the bar
                       shadow follow through group-hover:. */
                    return (
                      <div key={rowKey}
                        className="group flex border-b border-b-[var(--gantt-grid-line)] bg-transparent hover:bg-[var(--gantt-row-hover)] transition-[background-color] duration-fast ease-standard"
                        style={{ height: rowH }}>
                        {/* Left label cell */}
                        <div className={[
                          "sticky left-0 z-[2] shrink-0 box-border flex items-center gap-2",
                          "bg-surface-card group-hover:bg-[var(--gantt-row-hover)] border-r border-r-[var(--gantt-grid-line)]",
                          "transition-[background-color] duration-fast ease-standard",
                          groupBy ? "pl-[30px] pr-[14px]" : "px-[14px]",
                          onItemClick ? "cursor-pointer" : "cursor-default",
                        ].join(" ")} style={{ width: leftW }}
                          {...pressableProps(onItemClick ? () => onItemClick(it) : null, { label: typeof it.label === "string" ? `${it.id} ${it.label}` : String(it.id) })}>
                          <span className="size-[7px] rounded-full shrink-0" style={{ background: `var(--kanban-${tone}-dot)` }} />
                          <div className="min-w-0 leading-[1.25]">
                            <div className="text-xs font-data font-medium text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap">{it.id}</div>
                            {!sm && it.sublabel && <div className="text-2xs text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap mt-px">{it.sublabel}</div>}
                          </div>
                        </div>
                        {/* Lane — the cell rules are a repeating gradient computed from cellW. */}
                        <div className="relative shrink-0" style={{ width: chartW, backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${cellW - 1}px, var(--gantt-grid-line) ${cellW - 1}px, var(--gantt-grid-line) ${cellW}px)` }}>
                          <button type="button"
                            onClick={() => onItemClick && onItemClick(it)}
                            onMouseEnter={(e) => setTip({ item: it, x: e.clientX, y: e.clientY })}
                            onMouseMove={(e) => setTip({ item: it, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTip(null)}
                            className={[
                              "absolute top-1/2 [transform:translateY(-50%)] border-none p-0 rounded-full overflow-hidden",
                              "[box-shadow:none] group-hover:shadow-e-sm",
                              onItemClick ? "cursor-pointer" : "cursor-default",
                            ].join(" ")}
                            style={{ left: x0, width: Math.max(6, x1 - x0), height: barH, background: `var(--kanban-${tone}-dot)` }}>
                            {it.progress != null && (
                              <span className="absolute inset-0 bg-[rgba(255,255,255,0.38)] rounded-l-full" style={{ width: `${Math.min(100, Math.max(0, it.progress * 100))}%` }} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Today line */}
            {todayX != null && (
              <div className="absolute top-0 bottom-0 w-0 border-l-2 border-l-[var(--gantt-today)] z-[3] pointer-events-none" style={{ left: leftW + todayX }}>
                <span className="sticky block -ml-1 size-[8px] rounded-full bg-[var(--gantt-today)]" style={{ top: t1H + t2H - 9 }} />
              </div>
            )}
          </div>
        </div>
      )}

      <BarTip tip={tip} />
    </div>
  );
}

/* State contract — loading and error replace the whole view, but an empty period
   must NOT: the navigator (‹ Today › + the day/week/month/quarter/year toggle)
   lives inside the body, so replacing it would trap the user in a period they
   cannot page out of. The body already renders its own in-grid empty state
   beneath the navigator row — a string `empty` just retitles it. */
export const GanttTimeline = React.forwardRef<HTMLElement, any>(function GanttTimeline(props, ref) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    shape: "gantt", height: props.height || 320,
  });
  if (state !== false) return <div ref={ref as never} className="w-full" style={props.style || {}}>{state}</div>;
  return <GanttTimelineBody {...props} forwardedRef={ref} emptyLabel={typeof props.empty === "string" ? props.empty : props.emptyLabel} />;
});
