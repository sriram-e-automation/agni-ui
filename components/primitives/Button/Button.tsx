import React, { forwardRef } from "react";
import { ButtonBase, type ButtonProps as BaseProps } from "./ButtonBase.tsx";
import { IconButton } from "./IconButton.tsx";
import { SplitButton, type SplitItem } from "./SplitButton.tsx";

/* ── Types (mirrored in Button.d.ts) ── */
export type ButtonMenuItem = SplitItem;
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "brand-soft" | "solid" | "outline";
export interface ButtonProps extends Omit<BaseProps, "variant" | "category"> {
  variant?: ButtonVariant;
  /** Legacy alias for `variant`. */
  category?: ButtonVariant;
  /** Secondary actions in a caret menu — renders the split treatment. */
  items?: (ButtonMenuItem | "divider")[] | null;
  /** Accessible name of the split caret. @default "More actions" */
  menuLabel?: string;
  /** Square icon-only control; `title` becomes its accessible name. */
  iconOnly?: boolean;
  /** Circular icon-only control (implies iconOnly). */
  round?: boolean;
  /** Toggled state for an icon-only control — sets `aria-pressed` (implies iconOnly). */
  active?: boolean;
}

/**
 * AgniUI · Button
 * The one action control. Merged Aug 2026 — supersedes IconButton
 * (`iconOnly` / `round` / `active`) and SplitButton (`items`), which remain as
 * internal renderers.
 *   • `items` → primary action + caret menu
 *   • `iconOnly` (implied by `round` or `active`) → square/round icon control
 *   • otherwise → the labelled button
 *
 * Every treatment forwards its ref to the (primary) native <button> and passes
 * native attributes and events through — id, name, value, form, aria-*,
 * onFocus, onBlur, onKeyDown, … — composing them with its own handlers.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { items = null, iconOnly = false, round = false, active = false, menuLabel, ...p },
  ref,
) {
  if (items && items.length) {
    const cat = p.variant || p.category;
    const splitCat = cat === "secondary" || cat === "danger" ? cat : "primary";
    return <SplitButton ref={ref} items={items} menuLabel={menuLabel} {...p} variant={splitCat} category={undefined} />;
  }
  if (iconOnly || round || active) {
    const { variant, category, icon, children, loading, block, iconTrailing, ...native } = p;
    const cat = variant || category || "ghost";
    const v = cat === "solid" || cat === "outline" || cat === "ghost" ? cat
      : cat === "primary" ? "solid" : cat === "secondary" ? "outline" : "ghost";
    return <IconButton ref={ref} {...native} icon={icon ?? children} variant={v} round={round} active={active} />;
  }
  const { variant, category, ...rest } = p;
  const cat = variant || category;
  /* solid/outline are icon-only words; map them for a labelled button. */
  const mapped = cat === "solid" ? "primary" : cat === "outline" ? "secondary" : cat;
  return <ButtonBase ref={ref} {...rest} variant={mapped} />;
});
