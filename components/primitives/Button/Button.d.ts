import * as React from "react";

export interface ButtonMenuItem {
  label: React.ReactNode;
  /** Phosphor icon name, e.g. "ph-trash". */
  icon?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
  danger?: boolean;
  disabled?: boolean;
  /** Tooltip explaining why the item is disabled. */
  disabledReason?: string;
  /** Plain-text label for typeahead when `label` is a node. */
  textValue?: string;
}

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "brand-soft" | "solid" | "outline";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "title"> {
  children?: React.ReactNode;
  /** Visual intent. `solid` / `outline` are the icon-only words. @default "primary" */
  variant?: ButtonVariant;
  /** Legacy alias for `variant`. */
  category?: ButtonVariant;
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

  /** Secondary actions in a caret menu (plus literal "divider") — renders the split treatment. */
  items?: (ButtonMenuItem | "divider")[] | null;
  /** Accessible name of the split caret. @default "More actions" */
  menuLabel?: string;
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
 * The ref is the (primary) native <button>; native attributes and events
 * (id, name, value, form, aria-*, onFocus, onBlur, onKeyDown, …) pass through
 * and compose with the tooltip handlers — `e.preventDefault()` in yours skips
 * the built-in behaviour. Icon-only: `title` is the accessible name. Split: the
 * caret is a WAI-ARIA menu button (↓/↑ open, arrows/Home/End/typeahead move,
 * Escape returns focus). Tooltips dismiss on Escape.
 *
 * States: hover · press (scale) · focus-visible · disabled · loading · active.
 * @startingPoint section="Core" subtitle="Buttons in every variant, size & shape" viewport="700x180"
 * @version 1.1.0
 */
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
