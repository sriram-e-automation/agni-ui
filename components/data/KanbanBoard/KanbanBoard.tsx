import React from "react";
import { KanbanCard } from "./KanbanCard.tsx";
import { EmptyState } from "../feedback/EmptyState.tsx";
import { ErrorState } from "../feedback/ErrorState.tsx";

export interface KanbanPerson { id: string; name: string; team?: string; }
export interface KanbanBoardProps {
  /** Lane labels, in display order. */
  columns?: string[];
  /** Lane label → cards (KanbanCard props spread onto each). */
  board?: Record<string, any[]>;
  /** People roster passed to each card's assignee picker. */
  assignees?: KanbanPerson[];
  dark?: boolean;
  onView?: (card: any, column: string) => void;
  onApprove?: (card: any, column: string) => void;
  onReject?: (card: any, column: string) => void;
  /** Lane label → kanban tone token group (defaults cover the standard six). */
  toneMap?: Record<string, string>;
  /** Lanes that fill the viewport width before horizontal scroll. @default 4 */
  visibleLanes?: number;
  /** Replace the default KanbanCard renderer. */
  renderCard?: (card: any, column: string) => React.ReactNode;
  /** Cards in flight — every lane shows shimmer cards. */
  loading?: boolean;
  /** Skeleton cards per lane while loading. @default 3 */
  loadingCards?: number;
  /** Per-lane empty copy: string for all lanes, or lane label → string/node.
   *  @default "No items" */
  empty?: React.ReactNode | Record<string, React.ReactNode>;
  /** Board-level failure. String/true → the DS ErrorState; node → as given. */
  error?: React.ReactNode | boolean;
  /** Lane label → failure for that lane only (partial fetch). */
  laneErrors?: Record<string, React.ReactNode | boolean>;
  /** Retry action on any error state. */
  onRetry?: (column?: string) => void;
}

const DEFAULT_TONES = { "Approvals": "approvals", "Yet to start": "todo", "In progress": "progress", "Overdue": "overdue", "Completed": "done", "Rejected": "rejected" };

/**
 * AgniUI · KanbanBoard
 * Lane layout for assignment boards — tone-tinted sticky lane headers with
 * count pills, independently scrolling lane bodies, and a horizontal scroll
 * region sized so `visibleLanes` lanes fill the width. Renders DS KanbanCard
 * per card by default; the host owns data + filtering.
 */
export function KanbanBoard({ columns = [], board = {}, assignees = [], dark = false, onView, onApprove, onReject, toneMap, visibleLanes = 4, renderCard, loading = false, loadingCards = 3, empty, error = null, laneErrors, onRetry }: KanbanBoardProps) {
  /* Theming reads the nearest [data-theme] ancestor; `dark` is the override. */
  const rootRef = React.useRef(null);
  const [autoDark, setAutoDark] = React.useState(false);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const a = el.closest("[data-theme]");
    setAutoDark(a ? a.getAttribute("data-theme") === "dark" : false);
  }, []);
  const isDark = dark || autoDark;
  const tones = toneMap || DEFAULT_TONES;
  const tone = (col) => { const g = tones[col] || "todo"; return { bg: `var(--kanban-${g}-bg)`, bdr: `var(--kanban-${g}-bdr)`, dot: `var(--kanban-${g}-dot)`, lbl: `var(--kanban-${g}-label)` }; };
  const gapCount = (visibleLanes - 1) * 12;

  if (error) return (
    <div className="flex-1 min-h-0 min-w-0 grid place-items-center">
      {typeof error === "string" || error === true
        ? <ErrorState message={error === true ? undefined : error} onRetry={onRetry ? () => onRetry() : undefined} />
        : error}
    </div>
  );

  /* Lane body states: lane error → loading skeleton → empty → cards.
     Shimmer keeps its inline gradient (theme-derived colours, not a fixed class)
     but the easing is var(--ease-standard) — a bare `ease-in-out` keyword here
     compiles as the utility and drags in --tw-ease plumbing. */
  const SHIMMER = { background: "linear-gradient(90deg, var(--surface-sunken) 25%, var(--surface-soft) 50%, var(--surface-sunken) 75%)", backgroundSize: "200% 100%", animation: "agni-shimmer 1.4s var(--ease-standard) infinite" };
  const skeletonCard = (i) => (
    <div key={"agni-sk-" + i} className="bg-surface-card border border-line-subtle rounded-md p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-[20px] h-[20px] rounded-[5px]" style={SHIMMER} />
        <div className="w-[48%] h-[10px] rounded-xs" style={SHIMMER} />
      </div>
      <div className="w-[72%] h-[12px] rounded-xs" style={SHIMMER} />
      <div className="grid grid-cols-2 gap-1">
        <div className="h-[9px] rounded-xs" style={SHIMMER} />
        <div className="h-[9px] rounded-xs" style={SHIMMER} />
      </div>
      <div className="w-full h-[28px] rounded-sm" style={SHIMMER} />
    </div>
  );
  const emptyFor = (col) => {
    const node = empty && typeof empty === "object" && !React.isValidElement(empty) ? empty[col] : empty;
    if (node == null) return <div className="text-center py-4 px-1 text-fg-tertiary text-xs">No items</div>;
    return typeof node === "string"
      ? <EmptyState size="sm" bordered={false} icon="ph-tray" title={node} style={{ padding: "var(--space-5) var(--space-3)" }} />
      : node;
  };

  return (
    <div ref={rootRef} className="flex-1 min-h-0 min-w-0 flex flex-col">
      <div style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "hidden", display: "grid", gridAutoFlow: "column", gridAutoColumns: `minmax(300px, calc((100% - ${gapCount}px) / ${visibleLanes}))`, gap: "var(--pane-gap)", paddingBottom: "var(--space-2)" }}>
        {columns.map(col => { const t = tone(col); const cards = board[col] || []; const laneErr = laneErrors ? laneErrors[col] : null; return (
          <div key={col} className="flex flex-col min-h-0 h-full border border-line-subtle rounded-lg">
            <div className="py-2 px-3 flex items-center gap-2 shrink-0 rounded-t-lg" style={{ borderBottom: "1px solid " + t.bdr, background: isDark ? `color-mix(in srgb, ${t.bg} 60%, transparent)` : t.bg, backdropFilter: isDark ? "blur(8px)" : "none", WebkitBackdropFilter: isDark ? "blur(8px)" : "none" }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
              <span className="text-sm font-semibold flex-1 min-w-0" style={{ color: t.lbl }}>{col}</span>
              <span className="text-xs font-data bg-[var(--agni-neutral-100)] rounded-full px-2 py-px min-w-[20px] text-center" style={{ color: t.dot }}>{loading ? "·" : cards.length}</span>
            </div>
            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-visible p-2 flex flex-col gap-2 bg-surface-sunken rounded-b-lg">
              {laneErr
                ? (typeof laneErr === "string" || laneErr === true
                    ? <ErrorState size="sm" bordered={false} title="Lane didn't load" message={laneErr === true ? undefined : laneErr} onRetry={onRetry ? () => onRetry(col) : undefined} />
                    : laneErr)
                : loading
                  ? Array.from({ length: loadingCards }).map((_, i) => skeletonCard(col + i))
                  : <React.Fragment>
                      {cards.map(card => renderCard
                        ? <React.Fragment key={card.id}>{renderCard(card, col)}</React.Fragment>
                        : <KanbanCard key={card.id} status={col} {...card} assignees={assignees}
                            onApprove={() => onApprove && onApprove(card, col)} onReject={() => onReject && onReject(card, col)} onClick={() => onView && onView(card, col)} />)}
                      {cards.length === 0 && emptyFor(col)}
                    </React.Fragment>}
            </div>
          </div>
        ); })}
      </div>
      {loading && <style>{`@keyframes agni-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>}
    </div>
  );
}
