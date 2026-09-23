import React from "react";
import { QuickStats } from "../QuickStats/QuickStats.tsx";
import { ChartCard } from "../../charts/ChartCard/ChartCard.tsx";
import { DateRangeFilter } from "../DateRangeFilter/DateRangeFilter.tsx";
import { renderActions, exportToAction } from "../../utils/actionSpec.tsx";

/**
 * AgniUI · StatsOverview
 * The dashboard header block: an optional heading row with a date range and
 * actions, the click-to-filter QuickStats strip, and a responsive grid of
 * ChartCards beneath.
 *
 * It owns the GRID and nothing else — each chart is whatever node the caller
 * passes (BarChart, LineChart, Gauge, a DataTable), framed by the DS ChartCard
 * so titles, padding and legends stay identical across modules. Per-chart
 * loading / error / empty is the chart's own contract; `loading` here covers
 * the stats strip and puts every card into its skeleton at once.
 *
 * Columns collapse by container query, not viewport, so the block works
 * unchanged inside a 960px pane or a full-width page.
 */
const EYEBROW = "text-2xs font-data font-semibold tracking-wide uppercase text-fg-tertiary";
const TITLE = "font-sans text-lg font-semibold text-fg-primary m-0";

export const StatsOverview = React.forwardRef<HTMLDivElement, any>(function StatsOverview({
  title,
  subtitle,
  stats = [],
  statValue = null,
  onStatChange,
  showShare = false,
  charts = [],
  columns = 2,
  minColumnWidth = 320,
  dateRange,
  onDateRangeChange,
  primaryAction,
  secondaryActions,
  exportAction,
  actions,
  role = "",
  loading = false,
  error,
  onRetry,
  empty,
  gap = "var(--space-4)",
  style = {},
}, ref) {
  const exp = exportToAction(exportAction, role);
  const specs = [
    ...(exp ? [exp] : []),
    ...(secondaryActions || []),
    ...(primaryAction ? [{ kind: "primary", ...primaryAction }] : []),
  ];
  const rendered = renderActions(specs, { role, size: "md", keyPrefix: "so" });
  const showHead = !!(title || subtitle || onDateRangeChange || rendered.length || actions);

  return (
    <div ref={ref as never} className="agni-pane flex flex-col" style={{ gap, ...style }}>
      {showHead && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-[2px] min-w-0">
            {subtitle && <span className={EYEBROW}>{subtitle}</span>}
            {title && <h2 className={TITLE}>{title}</h2>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onDateRangeChange && <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />}
            {rendered}
            {actions}
          </div>
        </div>
      )}

      {stats.length > 0 && (
        <QuickStats items={stats} value={statValue} onChange={onStatChange} showShare={showShare}
          loading={loading} error={error} onRetry={onRetry} empty={empty} />
      )}

      {charts.length > 0 && (
        <div style={{
          display: "grid",
          gap: "var(--space-4)",
          gridTemplateColumns: `repeat(auto-fit, minmax(min(${minColumnWidth}px, 100%), 1fr))`,
          ...(columns ? { maxWidth: "100%" } : {}),
        }}>
          {charts.map((c: any, i: number) => (
            <ChartCard key={c.key || i} title={c.title} subtitle={c.subtitle} legend={c.legend} actions={c.actions}
              style={{ gridColumn: c.span && c.span > 1 ? `span ${Math.min(c.span, columns)}` : undefined, ...(c.style || {}) }}>
              {c.children}
            </ChartCard>
          ))}
        </div>
      )}
    </div>
  );
});
