import * as React from "react";
export interface ActionTileProps {
  /** Phosphor icon class, e.g. "ph-file-plus". */
  icon: string;
  title: React.ReactNode;
  desc?: React.ReactNode;
  /** Accent colour for the icon tile — a token or hex. @default brand */
  tone?: string;
  /** Count badge on the icon (e.g. pending approvals). */
  badge?: number | string | false;
  onClick?: () => void;
  /** Role denies this action — dimmed and inert. Prefer this over hiding it. */
  disabled?: boolean;
  style?: React.CSSProperties;
}
/**
 * Launchpad tile: icon + title + description + arrow, with lift on hover.
 * The unit of a module landing page ("Quick access"). Wrap in RoleGate, or pass
 * `disabled`, to express permissions. Use OptionRow inside panels and settings.
 * @version 1.0.0
  * States: disabled.
*/
export declare function ActionTile(props: ActionTileProps): JSX.Element;
