import * as React from "react";
export interface DetailSectionProps {
  /** Phosphor icon class for the header, e.g. "ph-identification-card". */
  icon?: string;
  title?: React.ReactNode;
  /** Optional second line in the header. */
  desc?: React.ReactNode;
  /** Header-right slot (buttons, badges) — rendered before the edit pencil. */
  actions?: React.ReactNode;
  /** Shows the edit pencil and calls back on click. */
  onEdit?: () => void;
  /** Auto-fill field grid (default) vs a plain padded body. @default true */
  grid?: boolean;
  /** Min column width for the grid. @default 200 */
  minCol?: number;
  /** Body padding. @default 16 */
  pad?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/**
 * Read-only counterpart to FormSection: titled card + auto-fill field grid.
 * The record-detail page container — pair with DetailList / KeyValueRow.
 * Use FormSection when the fields are editable inputs.
 * @version 1.1.0
 */
export declare const DetailSection: React.ForwardRefExoticComponent<DetailSectionProps & React.RefAttributes<HTMLDivElement>>;
