import * as React from "react";

export interface ChartTooltipRow { label: string; value: React.ReactNode; color: string; }
export interface ChartLegendItem { label: string; color: string; key?: string | number; }

/**
 * AgniUI · ChartKit — shared chart engine (scales, ticks, formatting, a themed
 * floating Tooltip and an interactive Legend). All output themes through the
 * --chart-* CSS variables for light + dark. Mirrors the Theme object pattern.
 */
export interface ChartKitType {
  /** var(--chart-1 … --chart-8), in order. */
  PALETTE: string[];
  /** datum.color ?? PALETTE[i]. */
  color(d: { color?: string } | null | undefined, i: number): string;
  /** Track a container's width in px via ResizeObserver. */
  useSize(ref: React.RefObject<HTMLElement>, fallback?: number): number;
  niceNum(range: number, round: boolean): number;
  /** Round a data max up to a clean axis bound. */
  niceMax(value: number, count?: number): number;
  /** count+1 evenly-spaced tick values from 0…max. */
  ticks(max: number, count?: number): number[];
  /** Compact number format (1.2k, 3.4M). */
  fmt(n: number): string;
  /** Band scale for categorical axes. */
  band(n: number, x0: number, x1: number, pad?: number): {
    step: number; bandwidth: number; start(i: number): number; center(i: number): number;
  };
  /** Floating, theme-aware tooltip card. */
  Tooltip: (props: { visible: boolean; x: number; y: number; w?: number; title?: React.ReactNode; rows: ChartTooltipRow[] }) => JSX.Element | null;
  /** Clickable series legend (toggles visibility). */
  Legend: (props: { items: ChartLegendItem[]; hidden?: Set<string | number>; onToggle?: (key: string | number) => void; align?: "start" | "center" | "end" }) => JSX.Element | null;
  /** One-shot <style> of the shared chart entrance keyframes (reduced-motion aware). */
  Anim: () => JSX.Element;
  /** Blend two #rrggbb colours; t in [0,1]. Returns `b` if either isn't literal hex. */
  lerpColor(a: string, b: string, t: number): string;
}
/** Shared chart engine: palette, sizing hook, axis maths, tooltip, legend,
 *  entrance animation, and the one state treatment all ten charts resolve
 *  through (`chartState` + `isEmptyChart`). Not rendered directly.
 *  @version 1.0.0
 */
export declare const ChartKit: ChartKitType;
