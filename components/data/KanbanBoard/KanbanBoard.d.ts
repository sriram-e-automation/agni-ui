import * as React from "react";
export interface KanbanPerson { id: string; name: string; team?: string; }
export interface KanbanBoardProps {
  /** Lane labels, in display order. */
  columns?: string[];
  /** Lane label → cards (KanbanCard props spread onto each). */
  board?: Record<string, any[]>;
  /** People roster passed to each card's assignee picker. */
  assignees?: KanbanPerson[];
  /** Explicit dark override. Theming normally resolves from the nearest
   *  [data-theme] ancestor (the Theme component) — only pass this outside one. */
  dark?: boolean;
  onView?: (card: any, column: string) => void;
  onApprove?: (card: any, column: string) => void;
  onReject?: (card: any, column: string) => void;
  /** Lane label → kanban tone token group. */
  toneMap?: Record<string, string>;
  /** Lanes that fill the viewport width before horizontal scroll. @default 4 */
  visibleLanes?: number;
  /** Replace the default KanbanCard renderer. */
  renderCard?: (card: any, column: string) => React.ReactNode;
  /** Cards in flight — every lane shows shimmer cards, count pills read "·". */
  loading?: boolean;
  /** Skeleton cards per lane while loading. @default 3 */
  loadingCards?: number;
  /** Per-lane empty copy: string for all lanes, or lane label → string/node.
   *  @default "No items" */
  empty?: React.ReactNode | Record<string, React.ReactNode>;
  /** Board-level failure — replaces the whole region. String/true → the DS
   *  ErrorState; node → as given. */
  error?: React.ReactNode | boolean;
  /** Lane label → failure for that lane only (partial fetch). */
  laneErrors?: Record<string, React.ReactNode | boolean>;
  /** Retry action; receives the lane label for a lane-level error. */
  onRetry?: (column?: string) => void;
}
/** Kanban lane layout: tone-tinted sticky headers + count pills, scrolling lane bodies, DS KanbanCard by default.
 *  @version 1.1.0
  * States: loading · error · empty.
*/
export declare const KanbanBoard: React.ForwardRefExoticComponent<KanbanBoardProps & React.RefAttributes<HTMLDivElement>>;
