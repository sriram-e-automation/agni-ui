import * as React from "react";
export interface BulkAction {
  label: React.ReactNode;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
  /** Roles allowed to fire it. Omit = every role. A withheld bulk action is
   *  not rendered at all — the most destructive bar in the system should never
   *  show an action the viewer cannot perform. */
  roles?: string[];
}
export interface BulkActionToolbarProps {
  /** Number of selected rows; toolbar hides at 0. */
  count?: number;
  actions?: BulkAction[];
  onClear?: () => void;
  /** Current viewer's role, matched against each `roles` list. Same contract
   *  as core/RoleGate. Omit to show everything. */
  role?: string;
  style?: React.CSSProperties;
}
/** Selection action bar for bulk operations over a table.
 *  @version 1.0.0
 */
export declare function BulkActionToolbar(props: BulkActionToolbarProps): JSX.Element;
