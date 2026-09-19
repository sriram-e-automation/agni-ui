import * as React from "react";
import { QuickStatItem } from "./QuickStats";
import { ChartLegendEntry } from "../charts/ChartCard";
import { DateRange } from "./DateRangeFilter";
import { ActionSpec, ExportActionSpec } from "../core/actionSpec";

export interface StatsOverviewChart {
  key?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  legend?: ChartLegendEntry[];
  /** Header-right slot for this card only. */
  actions?: React.ReactNode;
  /** Grid columns this card spans. @default 1 */
  span?: number;
  /** The chart itself — any DS chart, or any node. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface StatsOverviewProps {
  title?: React.ReactNode;
  /** Eyebrow above the title. */
  subtitle?: React.ReactNode;

  /** Click-to-filter strip. Omit for a charts-only block. */
  stats?: QuickStatItem[];
  statValue?: string | null;
  onStatChange?: (key: string | null, item?: QuickStatItem | null) => void;
  /** Show each card's share of the `key: null` total. */
  showShare?: boolean;

  /** Chart cards, in order. */
  charts?: StatsOverviewChart[];
  /** Max columns a card may span. @default 2 */
  columns?: number;
  /** Grid breakpoint per card, in px — the grid is auto-fit, so this is what
   *  actually decides the column count in the available width. @default 320 */
  minColumnWidth?: number;

  /** Period selector in the heading row. */
  dateRange?: DateRange | null;
  onDateRangeChange?: (value: DateRange | null) => void;

  primaryAction?: ActionSpec | null;
  secondaryActions?: ActionSpec[];
  /** `enabled: false` keeps it visible but disabled. */
  exportAction?: ExportActionSpec | null;
  /** Escape hatch, after the declarative group. */
  actions?: React.ReactNode;
  role?: string;

  /** Covers the stats strip. Per-chart states belong on each chart. */
  loading?: boolean;
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  empty?: React.ReactNode;

  /** @default var(--space-4) */
  gap?: string | number;
  style?: React.CSSProperties;
}

/**
 * AgniUI · StatsOverview
 * The dashboard header block — heading + date range + actions, the QuickStats
 * click-to-filter strip, and an auto-fit grid of ChartCards.
 * Owns the grid only; each chart is the caller's node, framed by ChartCard.
 *
 * Variants: stats-only · charts-only · both · with/without heading row.
 * States: idle · filtered (a stat card selected) · loading · error · empty.
 * @version 1.0.0
 */
export declare function StatsOverview(props: StatsOverviewProps): JSX.Element;
