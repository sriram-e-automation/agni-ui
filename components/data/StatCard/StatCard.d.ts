import * as React from "react";
export interface StatCaption { label: React.ReactNode; value: React.ReactNode; }
export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Denominator — renders as "value / total". */
  total?: number | string | null;
  /** Semantic tone for the dot/icon, or a raw colour. @default "brand" */
  tone?: "brand" | "success" | "warning" | "error" | "info" | "pending" | "neutral" | string;
  /** Phosphor icon class — replaces the tone dot. */
  icon?: string;
  /** Footer captions. Omit and pass remainingLabel to auto-derive taken/remaining. */
  captions?: StatCaption[];
  /** With `total`, auto-builds "Taken · n" and "<remainingLabel> · n". */
  remainingLabel?: string;
  onClick?: () => void;
  selected?: boolean;
  style?: React.CSSProperties;
  /** Value in flight — shape-matched skeleton. */
  loading?: boolean;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
}
/**
 * One measured value with an optional denominator and footer captions —
 * leave balances, quota, per-record counts.
 * Not the same as QuickStats: that is a click-to-filter strip bound to a list,
 * this is a standalone figure. Use QuickStats above a records region, StatCard
 * anywhere else.
 * States: loading · error (empty does not apply — single value, not a collection).
 * @version 1.1.0
 */
export declare const StatCard: React.ForwardRefExoticComponent<StatCardProps & React.RefAttributes<HTMLElement>>;
