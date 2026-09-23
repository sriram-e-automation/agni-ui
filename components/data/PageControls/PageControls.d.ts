import * as React from "react";
import { FilterSection, FilterValue } from "./FilterPanel";
import { DateRange } from "./DateRangeFilter";
import { BulkAction } from "./BulkActionToolbar";
import { ActionSpec, ExportActionSpec } from "../core/actionSpec";

export interface PageControlsColumn { key: string; label: React.ReactNode; }
export interface PageControlsSort { value: string; label: string; }
export interface PageControlsViewMode { key: string; icon: string; title?: string; }
export interface PageControlsPagination {
  /** 1-based current page. */
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  /** e.g. "1–25 of 312". */
  totalLabel?: React.ReactNode;
}

export interface PageControlsProps {
  /** Free-text search value (controlled). Omit onSearch to hide the field. */
  search?: string;
  onSearch?: (value: string) => void;
  /** @default "Search…" */
  searchPlaceholder?: string;
  /** Spinner in the search field while results are in flight. */
  searching?: boolean;

  /** Facet sections for the built-in FilterPanel. Omit to hide the funnel. */
  filterSections?: FilterSection[];
  filterValue?: FilterValue;
  onFilterChange?: (value: FilterValue) => void;

  /** Date range (controlled). Pass onDateRangeChange to show the date filter. */
  dateRange?: DateRange | null;
  onDateRangeChange?: (value: DateRange | null) => void;

  /** Sort choices; renders a compact labelled Select. */
  sortOptions?: PageControlsSort[];
  sort?: string;
  onSortChange?: (value: string) => void;

  /** Column chooser — same contract as DataTable's picker, hoisted here so
   *  table and card views share one chooser. */
  columns?: PageControlsColumn[];
  visibleColumns?: string[];
  onColumnsChange?: (next: string[]) => void;
  /** Max simultaneously visible columns. @default 5 */
  maxColumns?: number;

  /** Icon view switcher. Pass only on pages WITHOUT a PageTitleBar — when both
   *  are on screen the title bar owns the switcher. */
  viewModes?: PageControlsViewMode[];
  viewMode?: string;
  onViewModeChange?: (key: string) => void;

  /** Selection mode: >0 replaces the controls row with the bulk action bar. */
  selectionCount?: number;
  bulkActions?: BulkAction[];
  onClearSelection?: () => void;
  /** Current viewer's role, matched against each `roles` list. Same contract
   *  as core/RoleGate. Omit to show everything. */
  role?: string;
  /* Forwarded to BulkActionToolbar, which gates each bulkActions entry by its
     own `roles`. The `actions` slot is a ReactNode — gate that one at the call
     site with core/RoleGate. */
  /** Extra reset work when the "N filters · ✕" pill is cleared (search, facets
   *  and date range are cleared through their own handlers automatically). */
  onClearFilters?: () => void;

  /** Left-group slot — quick-stats toggle, scope switch, result count. */
  leading?: React.ReactNode;

  /** The page's one primary action. `kind` defaults to "primary" here; set it
   *  explicitly to change the button treatment (e.g. "danger", "brand-soft"),
   *  and pass `items` for the split-button treatment. */
  primaryAction?: ActionSpec | null;
  /** Additional actions, in order, left of the primary one. Each carries its
   *  own `kind` / `size` / `iconOnly` / `disabled` / `loading` / `roles`. */
  secondaryActions?: ActionSpec[];
  /** Export, rendered first in the action group. `enabled: false` keeps it
   *  VISIBLE but disabled with `disabledReason` as the tooltip — a records
   *  page should not change shape per viewer. Omit or pass null to leave it
   *  off entirely. Two or more `formats` renders the split menu. */
  exportAction?: ExportActionSpec | null;
  /** Height for every declarative action. @default "md" */
  actionSize?: "sm" | "md" | "lg";
  /** Right-edge escape hatch for anything the specs can't express; rendered
   *  after the declarative group. */
  actions?: React.ReactNode;
  /** Renders a right-aligned Pagination row beneath the controls. */
  pagination?: PageControlsPagination | null;

  /** Shimmer placeholder for the whole row (Loading shape="pageControls"). */
  loading?: boolean;
  /** Dim and make every control inert — e.g. while a record is being saved. */
  disabled?: boolean;
  /** Center the filter/date popovers as scrimmed dialogs (phone layouts). */
  isPhone?: boolean;
  style?: React.CSSProperties;
}

/**
 * AgniUI · PageControls
 * The one toolbar above a records region — search, filters, date range, sort,
 * column chooser, optional view switcher, primary action and pagination.
 * Composes FilterPanel · DateRangeFilter · BulkActionToolbar · Pagination.
 * States: idle · filtered · searching · selection-mode · disabled · loading.
 * @version 1.0.0
 */
export declare function PageControls(props: PageControlsProps): JSX.Element;
