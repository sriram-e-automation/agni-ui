import * as React from "react";

export interface ButtonMenuItem { label: React.ReactNode; icon?: string; onClick?: () => void; danger?: boolean; }

export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual intent. @default "primary" */
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "brand-soft";
  /** Legacy alias for `variant`. */
  category?: "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "brand-soft";
  /** Control height / density. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Leading icon node, e.g. <i className="ph ph-plus" /> */
  icon?: React.ReactNode;
  /** Trailing icon node. Labelled buttons only. */
  iconTrailing?: React.ReactNode;
  /** Stretch to fill container width. */
  block?: boolean;
  disabled?: boolean;
  /** Spinner + blocked interaction. Labelled buttons only. */
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  /** Tooltip label — and the accessible name for icon-only buttons. */
  title?: string;
  /** @default "top" ("bottom" for icon-only) */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /** Secondary actions in a caret menu — renders the split treatment. */
  items?: ButtonMenuItem[] | null;
  /** Icon-only square control (toolbars, table row actions). Pass `title`. */
  iconOnly?: boolean;
  /** Circular icon control. Implies `iconOnly`. */
  round?: boolean;
  /** Toggled / selected icon control (brand-soft fill). Implies `iconOnly`. */
  active?: boolean;

  style?: React.CSSProperties;
  className?: string;
}

/**
 * AgniUI · Button
 * The single action control: labelled, icon-only, or split.
 *
 * Merged Aug 2026 — supersedes IconButton (`iconOnly` / `round` / `active`) and
 * SplitButton (`items`). Both remain as internal renderers and are no longer
 * part of the documented API.
 *
 * States: hover · press (scale) · focus-visible · disabled · loading · active.
 * @startingPoint section="Core" subtitle="Buttons in every variant, size & shape" viewport="700x180"
 * @version 1.0.0
 */
export declare function Button(props: ButtonProps): JSX.Element;
