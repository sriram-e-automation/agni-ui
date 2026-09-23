import * as React from "react";
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
 * Toolbar funnel filter — compact trigger + popover of multi-select option
 * pills per section. The FACETS half of the filter pair; FilterBuilder is the
 * RULES half. Both mount inside PageControls.
 * @version 1.1.0
 */
export declare const FilterPanel: React.ForwardRefExoticComponent<FilterPanelProps & React.RefAttributes<HTMLDivElement>>;
