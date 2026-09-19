import React, { useState, useMemo, useRef, useEffect } from "react";
import { Checkbox } from "../forms/Checkbox.tsx";
import { IconButton } from "../core/IconButton.tsx";
import { EmptyState } from "../feedback/EmptyState.tsx";
import { ErrorState } from "../feedback/ErrorState.tsx";
import { roleAllows } from "../core/RoleGate.tsx";

/* ── Types (mirrored in DataTable.d.ts) ── */
export interface DataColumn {
  key: string;
  label: React.ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  /** Custom cell renderer: (value, row) => node. */
  render?: (value: any, row: any) => React.ReactNode;
  /** Set false to disable sorting on this column. */
  sortable?: boolean;
}
export interface ColumnPicker {
  /** Visible column keys (controlled). */
  visible: string[];
  onChange: (next: string[]) => void;
  /** Max simultaneously visible columns. @default 5 */
  max?: number;
  /** Keys tagged DEFAULT in the picker. */
  defaults?: string[];
}
export interface ActionColumn {
  /** Roles the cell renders for. Omit = every role. */
  roles?: string[];
  label?: React.ReactNode;
  width?: number | string;
  render: (row: any) => React.ReactNode;
}
export interface DataTableProps {
  columns?: DataColumn[];
  rows?: any[];
  /** Field used as the unique row id. @default "id" */
  rowKey?: string;
  selectable?: boolean;
  /** Controlled selection set of rowKey values. */
  selected?: Set<any>;
  onSelect?: (next: Set<any>) => void;
  onRowClick?: (row: any) => void;
  density?: "compact" | "comfortable" | "spacious";
  /** @deprecated Use `empty`. Kept working for existing consumers. */
  emptyText?: string;
  /** No-rows state. String → centered line; node (e.g. <EmptyState>) → rendered
   *  in place of the body so an empty table can carry its own action. */
  empty?: React.ReactNode;
  /** Rows in flight — shimmer body (shape="table"). */
  loading?: boolean;
  /** Row count used by the loading skeleton. @default 6 */
  loadingRows?: number;
  /** Fetch failed. String/true → the DS ErrorState; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Fill parent height: fixed header table + independently scrolling body with a bottom-fade indicator. */
  fillHeight?: boolean;
  /** ⋮ column chooser in the last header cell (needs `columns` to list every choosable column). */
  columnPicker?: ColumnPicker;
  /** Trailing per-row action cell (e.g. a View button). */
  actionColumn?: ActionColumn;
  /** Custom sort value: (key, row) => comparable. Falls back to row[key]. */
  sortAccessor?: (key: string, row: any) => any;
  /** Extra styles merged into header cells (e.g. dark glass tint). */
  headerStyle?: React.CSSProperties;
  dark?: boolean;
  style?: React.CSSProperties;
}
/**
 * Sortable, selectable data table with sticky header.
 * @startingPoint section="Data" subtitle="Sortable, selectable data table" viewport="760x420"
 */


/**
 * AgniUI · DataTable
 * Sortable, selectable table. columns: [{key,label,width,align,render?,sortable?}].
 * rows: object[] keyed by `rowKey`. Selection is controlled-optional (selected
 * Set + onSelect). Click a sortable header to sort. Two body modes: default
 * (single sticky-header table) and `fillHeight` (fixed header table + separate
 * scrolling body, colgroup-synced, with a more-below fade). Optional column
 * picker (max-N chooser), trailing action column, and sortAccessor for
 * computed sort values.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 9). Cell padding now rides the
 * density classes (`py-cell` / 12 / 14) instead of a computed string, and the
 * row's two `element.style.background` writes are a `hover:` variant emitted
 * only on the unselected branch. Still inline: per-column widths and the
 * colgroup, the caller's `headerStyle` escape hatch, the dark-mode picker
 * surface, and the bottom-fade gradient.
 */
export function DataTable({
  columns = [], rows = [], rowKey = "id",
  selectable = false, selected, onSelect, onRowClick,
  density = "compact", emptyText = "No rows", empty,
  loading = false, loadingRows = 6, error = null, onRetry,
  fillHeight = false, columnPicker, actionColumn: actionColumnProp, sortAccessor,
  headerStyle, dark = false, role = "", style = {},
}: DataTableProps) {
  /* Withheld from this role, the whole trailing cell goes — leaving an empty
     column would still tell the viewer an action exists. */
  const actionColumn = actionColumnProp && roleAllows(role, actionColumnProp.roles) ? actionColumnProp : null;
  /* Theming reads the nearest [data-theme] ancestor (the Theme mechanism);
     `dark` stays as an explicit override for hosts outside a Theme. */
  const rootRef = useRef(null);
  const [autoDark, setAutoDark] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const a = el.closest("[data-theme]");
    setAutoDark(a ? a.getAttribute("data-theme") === "dark" : false);
  }, []);
  const isDark = dark || autoDark;
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [internalSel, setInternalSel] = useState(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [moreBelow, setMoreBelow] = useState(false);
  const pickerRef = useRef(null);
  const bodyRef = useRef(null);
  const sel = selected != null ? selected : internalSel;
  const setSel = onSelect || setInternalSel;

  const visCols = columnPicker ? columns.filter(c => columnPicker.visible.includes(c.key)) : columns;

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const getVal = (r) => sortAccessor ? sortAccessor(sort.key, r) : r[sort.key];
    return [...rows].sort((a, b) => {
      const av = getVal(a), bv = getVal(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""));
      return cmp * sort.dir;
    });
  }, [rows, sort, sortAccessor]);

  const checkScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    setMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 6);
  };
  useEffect(() => { if (fillHeight) setTimeout(checkScroll, 80); }, [rows, visCols.length, fillHeight]);
  useEffect(() => {
    if (!showPicker) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [showPicker]);

  const allOn = sorted.length > 0 && sorted.every((r) => sel.has(r[rowKey]));
  const toggleAll = () => { setSel(allOn ? new Set() : new Set(sorted.map((r) => r[rowKey]))); };
  const toggleRow = (k) => { const n = new Set(sel); n.has(k) ? n.delete(k) : n.add(k); setSel(n); };
  const clickSort = (c) => { if (c.sortable === false) return; setSort((s) => s.key === c.key ? { key: c.key, dir: -s.dir } : { key: c.key, dir: 1 }); };
  const toggleCol = (key) => {
    if (!columnPicker) return;
    const { visible, onChange, max = 5 } = columnPicker;
    if (visible.includes(key)) { if (visible.length > 1) onChange(visible.filter(k => k !== key)); }
    else if (visible.length < max) onChange([...visible, key]);
  };
  const pad = density === "spacious" ? "py-[14px]" : density === "comfortable" ? "py-[12px]" : "py-cell";

  /* th/td carry their theme in classes; only width, per-column align and the
     caller's `headerStyle` escape hatch stay inline. NOTE: no text-align in
     the base string — emit order is .text-center → .text-left → .text-right,
     so a base `text-left` would beat an appended `text-center` (rule 5). Each
     cell emits exactly one alignment utility. */
  const thCls = [
    "px-[14px]", pad,
    "bg-[var(--table-header-bg)] text-[var(--table-header-fg)] font-semibold text-2xs tracking-wide uppercase",
    "whitespace-nowrap border-b border-b-[var(--table-cell-bdr)]",
    fillHeight ? "" : "sticky top-0 z-[1]",
  ].join(" ");
  const tdCls = ["px-[14px]", pad, "text-sm text-fg-primary border-b border-b-[var(--table-cell-bdr)] whitespace-nowrap"].join(" ");
  const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };

  const sortIcon = (c) => {
    if (c.sortable === false) return null;
    const isSorted = sort.key === c.key;
    return <i className={[
      "ph text-[11px] transition-[color] duration-fast ease-standard",
      isSorted ? (sort.dir === 1 ? "ph-arrow-up" : "ph-arrow-down") : "ph-arrows-down-up",
      isSorted ? "text-fg-brand opacity-100" : "text-fg-tertiary opacity-[0.5]",
    ].join(" ")} />;
  };

  const headCells = (
    <tr>
      {selectable && <th className={[thCls, "w-[44px] text-center"].join(" ")} style={headerStyle}><Checkbox checked={allOn} onChange={toggleAll} size="sm" /></th>}
      {visCols.map((c) => (
        <th key={c.key} onClick={() => clickSort(c)}
          className={[thCls, ALIGN[c.align] || ALIGN.left, "select-none", c.sortable === false ? "cursor-default" : "cursor-pointer"].join(" ")}
          style={{ width: c.width, ...headerStyle }}>
          <span className="inline-flex items-center gap-1">{c.label}{sortIcon(c)}</span>
        </th>
      ))}
      {(actionColumn || columnPicker) && (
        <th className={[thCls, "text-right pr-1"].join(" ")} style={{ width: actionColumn && actionColumn.width, ...headerStyle }}>
          <div className="inline-flex items-center gap-1 justify-end w-full">
            {actionColumn && <span>{actionColumn.label ?? "Action"}</span>}
            {columnPicker && (
              <div className="relative" ref={pickerRef}>
                <IconButton icon={<i className="ph ph-dots-three-vertical" />} variant="ghost" size="sm" onClick={() => setShowPicker(p => !p)} title="Select columns" />
                {showPicker && <div className="absolute right-0 top-[calc(100%+4px)] z-dropdown border border-line-default rounded-md shadow-e-md py-2 px-0 min-w-[200px]"
                  style={{ background: isDark ? "var(--surface-soft)" : "var(--surface-card)" }}>
                  <div className="pt-1 px-3 pb-2 text-xs font-semibold text-fg-tertiary tracking-wide uppercase border-b border-line-subtle mb-1">Columns (max {columnPicker.max ?? 5})</div>
                  {columns.map(c => { const on = columnPicker.visible.includes(c.key), dis = !on && columnPicker.visible.length >= (columnPicker.max ?? 5); return <label key={c.key} className={["flex items-center gap-2 py-2 px-3", dis ? "cursor-not-allowed opacity-[0.35]" : "cursor-pointer opacity-100"].join(" ")}><Checkbox checked={on} disabled={dis} onChange={() => toggleCol(c.key)} size="sm" /><span className="text-sm text-fg-primary">{c.label}</span>{(columnPicker.defaults || []).includes(c.key) && <span className="ml-auto text-2xs text-fg-tertiary">DEFAULT</span>}</label>; })}
                </div>}
              </div>
            )}
          </div>
        </th>
      )}
    </tr>
  );

  /* The row's two pointer handlers wrote straight to element.style.background —
     the hover-in-JS anti-pattern in its most direct form. Selected rows never
     took the hover fill, which is exactly what emitting the hover variant only
     on the unselected branch does. */
  const bodyRows = sorted.map((r) => {
    const k = r[rowKey], on = sel.has(k);
    return (
      <tr key={k} onClick={onRowClick ? () => onRowClick(r) : undefined}
        className={[
          "transition-[background-color] duration-fast ease-standard",
          on ? "bg-[var(--table-row-selected)]" : "bg-transparent hover:bg-[var(--table-row-hover)]",
          onRowClick ? "cursor-pointer" : "cursor-default",
        ].join(" ")}>
        {selectable && <td className={[tdCls, "text-center"].join(" ")} onClick={(e) => e.stopPropagation()}><Checkbox checked={on} onChange={() => toggleRow(k)} size="sm" /></td>}
        {visCols.map((c) => <td key={c.key} className={[tdCls, ALIGN[c.align] || ALIGN.left].join(" ")}>{c.render ? c.render(r[c.key], r) : r[c.key]}</td>)}
        {(actionColumn || columnPicker) && <td className={[tdCls, "text-right"].join(" ")} onClick={(e) => e.stopPropagation()}>{actionColumn ? actionColumn.render(r) : null}</td>}
      </tr>
    );
  });
  /* State precedence: error → loading → empty → rows. The header always stays,
     so column widths never jump between states. */
  const span = visCols.length + (selectable ? 1 : 0) + (actionColumn || columnPicker ? 1 : 0);
  const stateRow = (node) => <tr><td colSpan={span} className="p-0 border-b-0">{node}</td></tr>;
  /* Shimmer keeps its inline gradient (theme colours, not a fixed class) but
     rides var(--ease-standard): a bare `ease-in-out` in an inline animation
     value compiles as the utility and drags in --tw-ease plumbing. */
  const SHIMMER = { background: "linear-gradient(90deg, var(--surface-sunken) 25%, var(--surface-soft) 50%, var(--surface-sunken) 75%)", backgroundSize: "200% 100%", animation: "agni-shimmer 1.4s var(--ease-standard) infinite" };
  const SKEL_W = ["w-[62%]", "w-[78%]", "w-[44%]", "w-[70%]", "w-[52%]"];
  const skeletonRows = Array.from({ length: loadingRows }).map((_, i) => (
    <tr key={"agni-sk-" + i}>
      {selectable && <td className={[tdCls, "text-center"].join(" ")}><div className="size-[16px] rounded-[4px] mx-auto" style={SHIMMER} /></td>}
      {visCols.map((c, j) => <td key={c.key} className={[tdCls, ALIGN[c.align] || ALIGN.left].join(" ")}><div className={[SKEL_W[j % SKEL_W.length], "h-[11px] rounded-xs"].join(" ")} style={SHIMMER} /></td>)}
      {(actionColumn || columnPicker) && <td className={[tdCls, "text-right"].join(" ")}><div className="w-[58px] h-[24px] rounded-sm ml-auto" style={SHIMMER} /></td>}
    </tr>
  ));

  let overlay = null;
  if (error) overlay = stateRow(typeof error === "string" || error === true
    ? <ErrorState size="sm" bordered={false} message={error === true ? undefined : error} onRetry={onRetry} />
    : error);
  else if (loading) overlay = null;
  else if (sorted.length === 0) overlay = stateRow(
    empty == null
      ? <div className="p-10 text-center text-fg-tertiary text-sm">{emptyText}</div>
      : typeof empty === "string" ? <EmptyState size="sm" bordered={false} title={empty} /> : empty
  );
  const bodyContent = error ? overlay : loading ? skeletonRows : (overlay || bodyRows);
  const shimmerKeys = loading ? <style>{`@keyframes agni-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style> : null;

  if (!fillHeight) {
    return (
      <div ref={rootRef} className="border border-[var(--card-bdr)] rounded-lg overflow-auto bg-[var(--card-bg)]" style={style}>
        <table className="w-full border-collapse font-sans">
          <thead>{headCells}</thead>
          <tbody>{bodyContent}</tbody>
        </table>
        {shimmerKeys}
      </div>
    );
  }

  /* fillHeight — colgroup keeps the fixed header table + scrolling body table in sync */
  const cgEl = (
    <colgroup>
      {selectable && <col style={{ width: 48, minWidth: 48 }} />}
      {visCols.map(c => <col key={c.key} style={{ width: c.width || 120, minWidth: typeof c.width === "number" ? Math.min(c.width, 80) : 80 }} />)}
      {(actionColumn || columnPicker) && <col style={{ width: (actionColumn && actionColumn.width) || 90, minWidth: 90 }} />}
    </colgroup>
  );
  const tableCls = "w-full min-w-[680px] table-fixed border-collapse font-sans";
  return (
    <div ref={rootRef} className="relative border border-[var(--card-bdr)] rounded-lg bg-[var(--card-bg)] flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden" style={style}>
      <table className={[tableCls, "shrink-0"].join(" ")}>{cgEl}<thead>{headCells}</thead></table>
      <div className="flex-1 min-h-0 min-w-0 relative">
        {moreBelow && (
          <div className="absolute bottom-0 left-0 right-0 h-[48px] pointer-events-none z-[2] rounded-b-lg"
            style={{ background: isDark ? "linear-gradient(to bottom, transparent, rgba(6,16,74,0.92))" : "linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))" }} />
        )}
        <div ref={bodyRef} onScroll={checkScroll} className="absolute inset-0 overflow-y-auto overflow-x-auto">
          <table className={tableCls}>{cgEl}<tbody>{bodyContent}</tbody></table>
          {shimmerKeys}
        </div>
      </div>
    </div>
  );
}
