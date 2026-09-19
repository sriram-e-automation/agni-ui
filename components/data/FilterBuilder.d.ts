import * as React from "react";
export interface FilterField { key: string; label: string; }
export interface FilterRule { field: string; op: string; val: string; }
export interface FilterBuilderProps {
  fields?: FilterField[];
  /** Controlled rules array. */
  value?: FilterRule[];
  onChange?: (rules: FilterRule[]) => void;
  style?: React.CSSProperties;
}
/**
 * Compact AND-chained query / filter builder — the RULES half of the filter
 * pair. Use FilterPanel for quick facet narrowing, FilterBuilder for precise
 * or saved queries. Both mount inside PageControls.
 * @version 1.0.0
 */
export declare function FilterBuilder(props: FilterBuilderProps): JSX.Element;
