import * as React from "react";
import { ActionSpec, ExportActionSpec } from "../core/actionSpec";

export interface PageTab {
  key: string;
  label: string;
  count?: number;
  /** Scope this role can't open — rendered muted and inert. */
  disabled?: boolean;
}
export interface PageViewMode { key: string; icon: string; title?: string; }

export interface PageTitleBarProps {
  title?: string;
  /** Phosphor icon class for the title tile. */
  icon?: string;
  /** One line under the title — record count, owner, last-updated. */
  subtitle?: React.ReactNode;
  /** Status pill beside the title; forwarded to Tag. */
  badge?: { label: React.ReactNode; status?: string; tone?: string } | null;
  /** Back affordance above the title, for a record page inside a list scope. */
  back?: { label?: string; onClick?: () => void } | null;

  /** Scope tabs with count pills. */
  tabs?: PageTab[];
  tab?: string;
  onTabChange?: (key: string) => void;
  /** Counts still arriving — placeholder pills hold the tabs' width. */
  countsLoading?: boolean;

  /** Icon view switcher. When a PageControls is also on screen, the title bar
   *  owns this and PageControls must not repeat it. */
  viewModes?: PageViewMode[];
  viewMode?: string;
  onViewModeChange?: (key: string) => void;

  /** The page's one primary action. `kind` defaults to "primary" here. */
  primaryAction?: ActionSpec | null;
  /** Additional actions, left of the primary one, in order. */
  secondaryActions?: ActionSpec[];
  /** Export, rendered first in the action group. `enabled: false` keeps it
   *  visible but disabled with `disabledReason` as the tooltip. */
  exportAction?: ExportActionSpec | null;
  /** Viewer role — gates any action carrying a `roles` list (core/RoleGate
   *  contract). Omit to show everything. */
  role?: string;
  /** Escape hatch for bespoke right-edge content. Defaults to a ghost ⋮ button
   *  when no declarative action is given; pass null to hide. */
  actions?: React.ReactNode;

  /** Dim the row and make every control inert. */
  disabled?: boolean;
  /** Shimmer the whole row (Loading shape="pageTitleBar"). */
  loading?: boolean;
}

/**
 * AgniUI · PageTitleBar
 * Page heading row: back link · icon tile + title + status badge · subtitle,
 * segmented scope tabs with counts, icon view-mode switcher, and a declarative
 * action group (export · secondary · primary) with a ReactNode escape hatch.
 *
 * States: idle · tabs-loading (countsLoading) · disabled · loading.
 * @version 1.0.0
 */
export declare function PageTitleBar(props: PageTitleBarProps): JSX.Element;
