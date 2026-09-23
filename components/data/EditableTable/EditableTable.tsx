import React, { useState } from "react";
import { Tooltip } from "../../feedback/Tooltip/Tooltip.tsx";
import { resolveDataState } from "../../utils/DataState.tsx";

/* ── Types (mirrored in EditableTable.d.ts) ── */
export interface EditableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  /** For type "select": string options or { value, label }. */
  options?: Array<string | { value: string; label: string }>;
  width?: number | string;
  align?: "left" | "center" | "right";
  placeholder?: string;
}
export interface EditableTableProps {
  columns?: EditableColumn[];
  /** Row objects keyed by column.key. */
  rows?: Array<Record<string, any>>;
  onChange?: (rows: Array<Record<string, any>>) => void;
  addLabel?: string;
  /** @deprecated Use `empty`. */
  emptyText?: string;
  /** No-results state — string or node (e.g. an <EmptyState>). Supersedes `emptyText`. */
  empty?: React.ReactNode;
  /** Template object for a freshly-added row; else cells start empty/0. */
  newRow?: Record<string, any>;
  style?: React.CSSProperties;
}
/** Inline-editable rows with add / edit / delete under fixed columns. */

/**
 * AgniUI · EditableTable
 * Inline-editable rows under fixed columns, with add / edit / delete. Cells edit
 * in place (text · number · select). onChange(rows) fires on every mutation.
 *
 * columns: [{ key, label, type?: "text"|"number"|"select", options?, width?, align?, placeholder? }]
 * rows: array of plain objects keyed by column.key.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7b). Cell inputs used JS
 * onFocus/onBlur to paint the border and ring — the exact hover-in-state
 * anti-pattern rule 2 targets, just on focus instead of hover. Replaced with
 * `focus:`. The delete button's colour-on-hover handler is gone too.
 */
const TH = "text-left px-3 py-2 text-2xs font-semibold tracking-wide uppercase text-fg-tertiary border-b border-line-subtle bg-surface-soft whitespace-nowrap";
const CELL = "px-3 py-2 text-sm text-fg-primary align-middle";
const ROW_EDIT = "bg-surface-brand-soft";
const ROW_PLAIN = "bg-transparent";
const CELL_INPUT =
  "w-full box-border h-[32px] px-2 border border-[var(--input-bdr)] rounded-md bg-[var(--input-bg)] " +
  "text-fg-primary font-sans text-sm outline-none " +
  "transition-[border-color,box-shadow] duration-fast focus:border-[var(--border-brand)] focus:ring-focus";
const ICON_BTN = "size-[28px] border-none bg-transparent cursor-pointer rounded-sm text-[15px]";
const DEL_BTN = ICON_BTN + " text-fg-tertiary hover:text-status-error transition-colors duration-fast";
const ADD_BTN =
  "mt-2 inline-flex items-center gap-2 px-3 py-2 border border-dashed border-line-default rounded-md " +
  "bg-transparent text-fg-brand cursor-pointer font-sans text-sm font-medium " +
  "transition-[background-color,border-color] duration-fast " +
  "hover:bg-surface-brand-soft hover:border-line-brand";

export const EditableTable = React.forwardRef<HTMLDivElement, EditableTableProps>(function EditableTable({
  columns = [],
  rows = [],
  onChange,
  addLabel = "Add row",
  emptyText = "No rows yet", empty,
  newRow,
  loading,
  error,
  onRetry,
  style = {},
}, ref) {
  const [editing, setEditing] = useState(null); // row index in edit mode
  const state = resolveDataState({ loading, error, onRetry, shape: "editableTable" });
  if (state !== false) return <div ref={ref as never} style={style}>{state}</div>;

  const blank = () => newRow ? { ...newRow } : columns.reduce((a, c) => ({ ...a, [c.key]: c.type === "number" ? 0 : "" }), {});
  const setRow = (i, key, val) => onChange && onChange(rows.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const addRow = () => { const next = [...rows, blank()]; onChange && onChange(next); setEditing(next.length - 1); };
  const delRow = (i) => { onChange && onChange(rows.filter((_, idx) => idx !== i)); setEditing(null); };

  return (
    <div ref={ref as never} className="font-sans" style={style}>
      <div className="border border-line-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key} className={TH} style={{ width: c.width, textAlign: c.align || "left" }}>{c.label}</th>)}
                <th className={TH} style={{ width: 84, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-3 py-5 text-center text-sm text-fg-tertiary">{empty ?? emptyText}</td></tr>
              )}
              {rows.map((row, i) => {
                const edit = editing === i;
                return (
                  <tr key={i} className={[i === rows.length - 1 ? "border-b-0" : "border-b border-line-subtle", edit ? ROW_EDIT : ROW_PLAIN].join(" ")}>
                    {columns.map((c) => (
                      <td key={c.key} className={CELL} style={{ textAlign: c.align || "left" }}>
                        {edit ? (
                          c.type === "select" ? (
                            <div className="relative">
                              <select value={row[c.key] ?? ""} onChange={(e) => setRow(i, c.key, e.target.value)}
                                aria-label={`${typeof c.label === "string" ? c.label : c.key}, row ${i + 1}`}
                                className={[CELL_INPUT, "appearance-none pr-6 cursor-pointer"].join(" ")}>
                                <option value="" disabled>{c.placeholder || "Select…"}</option>
                                {(c.options || []).map((o) => { const v = typeof o === "string" ? o : o.value, l = typeof o === "string" ? o : o.label; return <option key={v} value={v}>{l}</option>; })}
                              </select>
                              <i aria-hidden="true" className="ph ph-caret-down absolute right-2 top-1/2 [transform:translateY(-50%)] text-[13px] text-fg-tertiary pointer-events-none" />
                            </div>
                          ) : (
                            <input type={c.type === "number" ? "number" : "text"} value={row[c.key] ?? ""} placeholder={c.placeholder || ""}
                              aria-label={`${typeof c.label === "string" ? c.label : c.key}, row ${i + 1}`} onChange={(e) => setRow(i, c.key, c.type === "number" ? Number(e.target.value) : e.target.value)} data-agni-input=""
                              className={[CELL_INPUT, c.type === "number" ? "font-data" : "font-sans"].join(" ")} style={{ textAlign: c.align || "left" }} />
                          )
                        ) : (
                          <span className={c.type === "number" ? "font-data" : "font-sans"}>{row[c.key] === "" || row[c.key] == null ? <span className="text-fg-disabled">—</span> : (() => { const o = (c.options || []).find((x) => (typeof x === "string" ? x : x.value) === row[c.key]); return o && typeof o !== "string" ? o.label : row[c.key]; })()}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <Tooltip label={edit ? "Done" : "Edit"} side="top"><button type="button" aria-label={edit ? "Done" : "Edit"} onClick={() => setEditing(edit ? null : i)} className={[ICON_BTN, edit ? "text-fg-brand" : "text-fg-tertiary"].join(" ")}><i className={"ph " + (edit ? "ph-check" : "ph-pencil-simple")} /></button></Tooltip>
                      <Tooltip label="Delete" side="top"><button type="button" aria-label="Delete" onClick={() => delRow(i)} className={DEL_BTN}><i className="ph ph-trash" /></button></Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <button type="button" onClick={addRow} className={ADD_BTN}>
        <i className="ph-bold ph-plus" /> {addLabel}
      </button>
    </div>
  );
});
