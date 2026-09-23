import React from "react";
import { Input } from "../forms/Input.tsx";
import { Select } from "../forms/Select.tsx";
import { IconButton } from "../core/IconButton.tsx";
import { FilterPanel } from "./FilterPanel.tsx";
import { DateRangeFilter } from "./DateRangeFilter.tsx";
import { Pagination } from "./Pagination.tsx";
import { BulkActionToolbar } from "./BulkActionToolbar.tsx";
import { renderActions, exportToAction } from "../core/actionSpec.tsx";
import { Loading } from "../feedback/Loading.tsx";

/* ── Types (mirrored in PageControls.d.ts) ── */
export interface PageControlsColumn { key: string; label: React.ReactNode; }
export interface PageControlsSort { value: string; label: string; }
export interface PageControlsViewMode { key: string; icon: string; title?: string; }
export interface PageControlsPagination { page?: number; pageCount?: number; onChange?: (page: number) => void; totalLabel?: React.ReactNode; }
export interface PageControlsBulkAction { label: React.ReactNode; icon?: string; onClick?: () => void; danger?: boolean; }

export interface PageControlsProps {
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  searching?: boolean;
  filterSections?: any[];
  filterValue?: Record<string, string[]> | null;
  onFilterChange?: (value: Record<string, string[]> | null) => void;
  dateRange?: any;
  onDateRangeChange?: (value: any) => void;
  sortOptions?: PageControlsSort[];
  sort?: string;
  onSortChange?: (value: string) => void;
  columns?: PageControlsColumn[];
  visibleColumns?: string[];
  onColumnsChange?: (next: string[]) => void;
  maxColumns?: number;
  viewModes?: PageControlsViewMode[];
  viewMode?: string;
  onViewModeChange?: (key: string) => void;
  selectionCount?: number;
  bulkActions?: PageControlsBulkAction[];
  onClearSelection?: () => void;
  onClearFilters?: () => void;
  leading?: React.ReactNode;
  primaryAction?: any;
  secondaryActions?: any[];
  exportAction?: any;
  actionSize?: "sm" | "md" | "lg";
  role?: string;
  actions?: React.ReactNode;
  pagination?: PageControlsPagination | null;
  loading?: boolean;
  disabled?: boolean;
  isPhone?: boolean;
  style?: React.CSSProperties;
}

/**
 * AgniUI · PageControls
 * The one toolbar above a records region — search, filters, date range, sort,
 * column chooser, optional view switcher, and the page's primary action.
 * It composes the DS parts (FilterPanel · DateRangeFilter · BulkActionToolbar ·
 * Pagination · Select · Input · IconButton) rather than redrawing any of them —
 * this component contributes only its own local chrome (the filter-count pill
 * and the column-visibility popover), never a second date picker or a second
 * bulk bar.
 *
 * States: idle · filtered (count + clear) · searching · selection-mode
 * (BulkActionToolbar takes the row) · disabled · loading.
 *
 * Pairing rule: when a PageTitleBar is on screen it owns the view-mode
 * switcher — pass `viewModes` here only on pages without one.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7f). FilterSummary and ColumnPicker
 * are this component's own chrome, migrated to classes; every other control in
 * the row is an existing DS component used as-is.
 */
const divider = <span className="w-px h-[22px] bg-line-subtle shrink-0" />;

const SUMMARY = "inline-flex items-center gap-2 h-[34px] pl-3 pr-1 rounded-md bg-surface-brand-soft text-fg-brand font-sans text-xs font-semibold shrink-0 whitespace-nowrap";
const SUMMARY_CLEAR = "size-6 grid place-items-center border-none bg-transparent text-inherit rounded-sm text-[13px] enabled:cursor-pointer disabled:cursor-default";

function FilterSummary({ count, onClear, disabled }: any) {
  return (
    <span className={SUMMARY}>
      <span className="font-data">{count}</span>
      {count === 1 ? "facet" : "facets"}
      <button type="button" onClick={onClear} disabled={disabled} aria-label="Clear all active facets" className={SUMMARY_CLEAR}>
        <i className="ph-bold ph-x" />
      </button>
    </span>
  );
}

const POPOVER = "absolute right-0 top-[calc(100%+6px)] z-dropdown min-w-[208px] py-2 bg-surface-card border border-line-subtle rounded-md shadow-e-lg";
const POPOVER_HEAD = "px-3 pt-1 pb-2 text-2xs font-data font-semibold text-fg-tertiary tracking-wide uppercase";
const ROW = "flex items-center gap-2 px-3 py-1 text-sm";

function ColumnPicker({ columns, visible, onChange, max = 5, disabled }: any) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const away = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  const toggle = (key: string) => {
    const on = visible.includes(key);
    if (on) { if (visible.length > 1) onChange(visible.filter((k: string) => k !== key)); }
    else if (visible.length < max) onChange([...visible, key]);
  };
  return (
    <div ref={ref} className="relative shrink-0">
      <IconButton icon={<i className="ph ph-columns" />} variant="outline" title="Columns" active={open} disabled={disabled} onClick={() => setOpen(o => !o)} />
      {open && (
        <div className={POPOVER}>
          <div className={POPOVER_HEAD}>Columns · {visible.length}/{max}</div>
          {columns.map((c: any) => {
            const on = visible.includes(c.key);
            const dis = !on && visible.length >= max;
            return (
              <label key={c.key} className={[ROW, dis ? "cursor-default text-fg-disabled" : "cursor-pointer text-fg-primary"].join(" ")}>
                <input type="checkbox" checked={on} disabled={dis} onChange={() => toggle(c.key)} className="accent-[var(--action-brand)] size-[14px]" />
                {c.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PageControls({
  search, onSearch, searchPlaceholder = "Search…", searching = false,
  filterSections, filterValue = null, onFilterChange,
  dateRange, onDateRangeChange,
  sortOptions, sort, onSortChange,
  columns, visibleColumns, onColumnsChange, maxColumns = 5,
  viewModes, viewMode, onViewModeChange,
  selectionCount = 0, bulkActions = [], onClearSelection, onClearFilters, role = "",
  leading, primaryAction, secondaryActions, exportAction, actionSize = "md", actions, pagination = null,
  loading = false, disabled = false, isPhone = false, style = {},
}: PageControlsProps) {
  if (loading) return <div style={style}><Loading loading shape="pageControls" /></div>;

  /* Selection mode — the toolbar is replaced by the bulk bar so the row never
     grows and the destructive actions can't hide behind a filter popover. */
  if (selectionCount > 0) {
    return (
      <div className="flex flex-col gap-2" style={style}>
        <BulkActionToolbar count={selectionCount} actions={bulkActions} onClear={onClearSelection} role={role} />
        {pagination && <div className="flex justify-end"><Pagination {...pagination} /></div>}
      </div>
    );
  }

  const facets = filterValue ? Object.values(filterValue).reduce((n, v) => n + (v ? v.length : 0), 0) : 0;
  const activeCount = facets + (search ? 1 : 0) + (dateRange ? 1 : 0);
  const exp = exportToAction(exportAction, role);
  const actionSpecs = [
    ...(exp ? [exp] : []),
    ...(secondaryActions || []),
    ...(primaryAction ? [{ kind: "primary", ...primaryAction }] : []),
  ];
  const clearAll = () => {
    onFilterChange && onFilterChange(null);
    onSearch && onSearch("");
    onDateRangeChange && onDateRangeChange(null);
    onClearFilters && onClearFilters();
  };

  return (
    <div className="flex flex-col gap-2" style={{ opacity: disabled ? 0.55 : 1, ...style }}>
      <div aria-disabled={disabled || undefined} className={["flex flex-wrap items-center justify-between gap-2", disabled ? "pointer-events-none" : "pointer-events-auto"].join(" ")}>
        <div className="flex flex-wrap items-center gap-2">
          {leading}
          {activeCount > 0 && <FilterSummary count={activeCount} onClear={clearAll} disabled={disabled} />}
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 justify-end" style={{ flexBasis: 260 }}>
          {sortOptions && sortOptions.length > 0 && (
            <React.Fragment>
              <span className="text-2xs font-data font-semibold tracking-wide uppercase text-fg-tertiary shrink-0">Sort</span>
              <Select size="sm" value={sort} onChange={onSortChange} options={sortOptions} disabled={disabled} style={{ width: 158, flexShrink: 0 }} />
              {divider}
            </React.Fragment>
          )}
          {columns && columns.length > 0 && onColumnsChange && (
            <ColumnPicker columns={columns} visible={visibleColumns || columns.slice(0, maxColumns).map(c => c.key)} onChange={onColumnsChange} max={maxColumns} disabled={disabled} />
          )}
          {filterSections && filterSections.length > 0 && (
            <FilterPanel sections={filterSections} value={filterValue} onChange={onFilterChange} isPhone={isPhone} />
          )}
          {onDateRangeChange && (
            <DateRangeFilter value={dateRange} onChange={onDateRangeChange} isPhone={isPhone} />
          )}
          {onSearch && (
            <div className="flex-[1_1_160px] min-w-[140px] max-w-[280px]">
              <Input value={search} onChange={onSearch} placeholder={searchPlaceholder} disabled={disabled}
                prefixIcon={<i className="ph ph-magnifying-glass" />}
                suffixIcon={searching
                  ? <i className="ph ph-circle-notch inline-block" style={{ animation: "agni-spin .8s linear infinite" }} />
                  : (search ? <button type="button" onClick={() => onSearch("")} aria-label="Clear search" className="border-none bg-transparent text-inherit cursor-pointer p-0 text-[14px] grid place-items-center"><i className="ph ph-x" /></button> : undefined)} />
            </div>
          )}
          {viewModes && viewModes.length > 0 && (
            <div className="inline-flex gap-[2px] p-[2px] bg-surface-sunken rounded-md shrink-0">
              {viewModes.map(v => {
                const on = v.key === viewMode;
                return (
                  <IconButton key={v.key} icon={<i className={"ph " + v.icon} />} size="sm" variant={on ? "solid" : "ghost"}
                    active={on} title={v.title || v.key} disabled={disabled} onClick={() => onViewModeChange && onViewModeChange(v.key)} />
                );
              })}
            </div>
          )}
          {actionSpecs.length > 0 && <>{divider}{renderActions(actionSpecs, { role, size: actionSize, disabled, keyPrefix: "pc" })}</>}
          {actions}
        </div>
      </div>
      {pagination && <div className="flex justify-end"><Pagination {...pagination} /></div>}
      <style>{`@keyframes agni-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
