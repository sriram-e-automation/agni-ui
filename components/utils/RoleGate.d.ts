import * as React from "react";
export interface RoleGateProps {
  /** Current user's role. */
  role: string;
  /** Roles permitted to see children. */
  allow?: string[] | null;
  /** Roles explicitly denied (overrides allow). */
  deny?: string[] | null;
  /** Rendered when access is denied. */
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}
/** Role-based visibility wrapper. */
export declare function RoleGate(props: RoleGateProps): JSX.Element;

/** The role check itself, shared with every component that gates a LIST rather
 *  than a single node (DropdownMenu · BulkActionToolbar · PageControls ·
 *  DataTable · StageList · NavRail · RecordDetailModal), so the rule has one
 *  implementation.
 *
 *  An absent or empty `role` returns true — "no role supplied" means UNGATED,
 *  matching the documented contract on every component that takes `role`
 *  ("omit to show everything"). This gates visibility, never authority.
 *  @version 1.0.0
 */
export declare function roleAllows(role: string, allow?: string[] | null, deny?: string[] | null): boolean;
