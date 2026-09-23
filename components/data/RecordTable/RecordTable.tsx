import React from "react";
import { DataTable } from "./DataTable.tsx";
import { PageControls } from "./PageControls.tsx";
import { Button } from "../core/Button.tsx";
import { renderActions, visibleActions } from "../core/actionSpec.tsx";

/**
 * AgniUI · RecordTable
 * The records region in one component: the PageControls toolbar, the DataTable
 * beneath it, the per-row action column, selection → bulk bar, and pagination.
 *
 * It composes existing DS parts and adds nothing of its own but the row-action
 * cell (icon buttons up to `rowActionsMax`, the remainder collapsed into one ⋮
 * menu). Every part is still available separately — reach for RecordTable when
 * a page shows one list of records, which is the overwhelming majority.
 *
 * The state contract lives on the table: error → loading → empty → rows, all
 * resolved by DataTable through DataState. The toolbar stays interactive during
 * loading (you can still change the filter that is loading) but goes inert on
 * `disabled`.
 *
 * Tailwind v4 — no class strings of its own beyond the two wrappers.
 */

export function RecordTable({
  columns = [], rows = [], rowKey = "id",
  selectable = false, selected, onSelect, onRowClick, sortAccessor,
  density, fillHeight = false, headerStyle, dark,
  rowActions, rowActionsMax = 2, rowActionsLabel = "", rowActionsWidth = 96,
  controls, bulkActions = [], onClearSelection,
  pagination = null,
  loading = false, loadingRows = 6, error, onRetry, empty,
  role = "", disabled = false, gap = "var(--space-3)", style = {},
}: any) {
  const selCount = selected ? (selected.size || 0) : 0;

  /* Row actions → DataTable's trailing action column. Withheld entirely when
     the viewer's role can use none of them: an empty column still advertises
     an action they cannot take. */
  const actionColumn = React.useMemo(() => {
    if (!rowActions) return undefined;
    const forRow = (row: any) => visibleActions(typeof rowActions === "function" ? rowActions(row) : rowActions, role);
    const probe = forRow(rows[0] || {});
    if (!probe.length && typeof rowActions !== "function") return undefined;
    return {
      label: rowActionsLabel,
      width: rowActionsWidth,
      render: (row: any) => {
        const list = forRow(row);
        if (!list.length) return null;
        const inline = list.slice(0, rowActionsMax);
        const overflow = list.slice(rowActionsMax);
        return (
          <div className="flex items-center justify-end gap-1">
            {renderActions(inline.map(a => ({ ...a, size: a.size || "sm", kind: a.kind || "ghost", iconOnly: a.iconOnly !== false && !!a.icon })), { role, size: "sm", disabled, keyPrefix: "ra" })}
            {overflow.length > 0 && (
              <Button size="sm" variant="ghost" iconOnly title="More actions"
                icon={<i className="ph ph-dots-three-vertical" />} disabled={disabled}
                items={overflow.map(a => ({ label: a.label, icon: a.icon, onClick: a.onClick, danger: a.kind === "danger" }))} />
            )}
          </div>
        );
      },
    };
  }, [rowActions, rowActionsMax, rowActionsLabel, rowActionsWidth, role, disabled, rows]);

  return (
    <div className="flex flex-col min-h-0" style={{ gap, ...style }}>
      {controls !== null && controls !== false && (
        <PageControls
          {...(controls || {})}
          role={role}
          disabled={disabled || (controls && controls.disabled)}
          selectionCount={selectable ? selCount : 0}
          bulkActions={bulkActions}
          onClearSelection={onClearSelection || (() => onSelect && onSelect(new Set()))}
          pagination={pagination}
        />
      )}
      <DataTable
        columns={columns} rows={rows} rowKey={rowKey}
        selectable={selectable} selected={selected} onSelect={onSelect}
        onRowClick={onRowClick} sortAccessor={sortAccessor}
        density={density} fillHeight={fillHeight} headerStyle={headerStyle} dark={dark}
        actionColumn={actionColumn} role={role}
        loading={loading} loadingRows={loadingRows} error={error} onRetry={onRetry} empty={empty}
      />
    </div>
  );
}
