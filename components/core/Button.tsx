import React from "react";
import { ButtonBase } from "./ButtonBase.tsx";
import { IconButton } from "./IconButton.tsx";
import { SplitButton } from "./SplitButton.tsx";

/**
 * AgniUI · Button
 * The one action control. Merged Aug 2026 — supersedes IconButton
 * (`iconOnly` / `round` / `active`) and SplitButton (`items`), which remain as
 * internal renderers.
 *   • `items` → primary action + caret menu
 *   • `iconOnly` (implied by `round` or `active`) → square/round icon control
 *   • otherwise → the labelled button
 */
export function Button({ items = null, iconOnly = false, round = false, active = false, ...p }: any) {
  if (items && items.length) return <SplitButton items={items} {...p} />;
  if (iconOnly || round || active) {
    const cat = p.variant || p.category || "ghost";
    const v = cat === "solid" || cat === "outline" || cat === "ghost" ? cat
      : cat === "primary" ? "solid" : cat === "secondary" ? "outline" : "ghost";
    return (
      <IconButton
        icon={p.icon} variant={v} size={p.size} round={round} active={active}
        disabled={p.disabled} title={p.title} tooltipSide={p.tooltipSide}
        onClick={p.onClick} style={p.style}
      />
    );
  }
  return <ButtonBase {...p} />;
}
