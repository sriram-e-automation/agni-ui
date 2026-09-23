import * as React from "react";
import { PageTitleBarProps } from "./PageTitleBar";
import { PageControlsProps } from "../data/PageControls";
import { QuickStatsProps } from "../data/QuickStats";

export interface PageHeaderProps {
  /** The heading row. Required — a page header without a title is a toolbar. */
  titleBar: PageTitleBarProps;
  /** The toolbar row beneath it. Pass null on pages with nothing to filter. */
  controls?: PageControlsProps | null;
  /** Click-to-filter stat strip below the card. Pass null to hide. */
  stats?: QuickStatsProps | null;
  /** Show the quick-stats toggle in the toolbar's leading slot. Defaults to
   *  true whenever `stats` is passed and a toolbar is present. */
  statsToggle?: boolean;
  /** Controlled open state for the stats strip. Omit to let PageHeader own it
   *  (open by default) — the page no longer carries this state by hand. */
  statsOpen?: boolean;
  onStatsToggle?: (open: boolean) => void;
  /** @default "Quick stats" */
  statsToggleLabel?: React.ReactNode;

  /** Pin the header to the top of the scroll region. @default false */
  sticky?: boolean;
  /** Offset for the sticky position, in px. @default 0 */
  stickyTop?: number;

  /** Card outline. @default true */
  bordered?: boolean;
  /** Card fill — pass a translucent token over a wallpaper. */
  background?: string;
  /** Frost the card, for wallpapered shells. @default false */
  blur?: boolean;

  /** Viewer role, hoisted to both rows — gates every action carrying a
   *  `roles` list (core/RoleGate contract). Omit to show everything. */
  role?: string;
  /** Dim both rows and make every control inert. */
  disabled?: boolean;
  /** Shimmer both rows together, so the header never half-resolves. */
  loading?: boolean;
  /** Space between the card and the stats strip, in px. @default 8 */
  gap?: number;
  style?: React.CSSProperties;
}

/**
 * AgniUI · PageHeader
 * The whole top of a records page as one component: PageTitleBar and
 * PageControls in a single bordered card, with the optional QuickStats strip
 * beneath it and the sticky behaviour the Desk shell needs.
 *
 * Composes PageTitleBar · PageControls · QuickStats and adds only the chrome
 * that was previously hand-written at every call site: the card shell, the
 * divider between the rows, the sticky wrapper, and the one-switcher rule —
 * when both rows are present the TITLE BAR owns the view switcher and any
 * `viewModes` passed to `controls` is dropped.
 *
 * `role`, `disabled` and `loading` are hoisted: set once, they reach both rows.
 * Per-row values on `titleBar` / `controls` still win where they are stricter.
 *
 * States: idle · loading (both rows shimmer) · disabled · sticky.
 * @version 1.0.0
 */
export declare function PageHeader(props: PageHeaderProps): JSX.Element;
