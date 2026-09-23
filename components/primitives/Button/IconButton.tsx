/**
 * @internal Renderer behind the public <Button> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef } from "react";
import { TipBubble, useTip } from "../../feedback/Tooltip/Tooltip.tsx";
import { composeHandlers } from "../../utils/interaction.tsx";

/* ── Types (mirrored in IconButton.d.ts) ── */
export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title" | "children"> {
  icon: React.ReactNode;
  /** @default "ghost" */
  variant?: "solid" | "outline" | "ghost";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Circular instead of rounded-square. */
  round?: boolean;
  /** Toggled/selected state (brand-soft fill). */
  active?: boolean;
  disabled?: boolean;
  /** Label shown in a DS tooltip on hover/focus (also the accessible name). */
  title?: string;
  /** Tooltip side. @default "bottom" */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  style?: React.CSSProperties;
  className?: string;
}
/** Icon-only control — toolbars, headers, table row actions. */

/**
 * AgniUI · IconButton
 * Square/round icon-only control. Variants: solid · outline · ghost.
 * Interactive hover/press/focus, optional active (toggled) state.
 *
 * Tailwind v4 (migrated Aug 2026). The hover/press useState pair is gone — both
 * are `enabled:hover:` / `enabled:active:` classes, so a pointer move no longer
 * re-renders, hover cannot stick after a touch, and keyboard focus goes through
 * focus-visible. Heights stay LITERAL (32/36/42) until the whole control family
 * adopts h-control-* in one change — see tailwind/README.md rule 6.
 */
const SIZE = {
  sm: "size-[32px] text-[16px]",
  md: "size-[36px] text-[18px]",
  lg: "size-[42px] text-[20px]",
} as const;

/* Idle + hover + press per variant. Full strings only (README rule 1). */
const VARIANT = {
  solid:
    "bg-action-brand text-fg-on-brand border-transparent " +
    "enabled:hover:bg-action-brand-hover enabled:active:bg-state-press",
  outline:
    "bg-surface-card text-fg-secondary border-line-default " +
    "enabled:hover:bg-surface-soft enabled:active:bg-state-press",
  ghost:
    "bg-transparent text-fg-secondary border-transparent " +
    "enabled:hover:bg-state-hover enabled:active:bg-state-press",
} as const;

/* Toggled — REPLACES the variant block rather than sitting beside it, so the
   conflicting background/color/border utilities never race on emit order
   (README rule 5). Press-scale still applies; the press fill does not, because
   a toggled control must keep reading as toggled while pressed. */
const ACTIVE = "bg-surface-brand-soft text-fg-brand border-line-brand";

const BASE =
  "relative inline-flex items-center justify-center shrink-0 border cursor-pointer " +
  "transition-[background-color,color,scale,border-color] duration-fast ease-standard " +
  "enabled:active:press-icon outline-none focus-visible:focus-ring " +
  "disabled:cursor-not-allowed disabled:opacity-[var(--state-disabled-opacity)]";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({
  icon,
  variant = "ghost",      // solid | outline | ghost
  size = "md",            // sm | md | lg
  round = false,
  active = false,
  disabled = false,
  title,
  tooltipSide = "bottom",
  onClick, onMouseEnter, onMouseLeave, onMouseDown, onFocus, onBlur, onKeyDown,
  type = "button",
  style = {},
  className = "",
  ...rest
}, ref) {
  const tip = useTip(300);
  const hasTip = !!title && !disabled;

  const cls = [
    BASE,
    SIZE[size] || SIZE.md,
    active ? ACTIVE : (VARIANT[variant] || VARIANT.ghost),
    round ? "rounded-full" : "rounded-md",
    className,
  ].join(" ");

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      /* The title is the accessible NAME of an icon-only control, so the bubble
         is aria-hidden rather than a second announcement of the same words. */
      aria-label={rest["aria-label"] ?? title}
      aria-pressed={rest["aria-pressed"] ?? (active || undefined)}
      disabled={disabled}
      className={cls}
      style={style}
      onClick={composeHandlers(onClick, () => tip.bind.onClick())}
      onMouseEnter={composeHandlers(onMouseEnter, () => { if (hasTip) tip.bind.onMouseEnter(); })}
      onMouseLeave={composeHandlers(onMouseLeave, () => { if (hasTip) tip.bind.onMouseLeave(); })}
      onMouseDown={composeHandlers(onMouseDown, () => { if (hasTip) tip.bind.onMouseDown(); })}
      onFocus={composeHandlers(onFocus, () => { if (hasTip) tip.bind.onFocus(); })}
      onBlur={composeHandlers(onBlur, () => { if (hasTip) tip.bind.onBlur(); })}
      onKeyDown={composeHandlers(onKeyDown, (e) => { if (e.key === "Escape" && tip.open) tip.bind.onBlur(); })}
    >
      <span aria-hidden="true" className="inline-flex">{icon}</span>
      {hasTip && tip.open && <TipBubble label={title} side={tooltipSide} decorative />}
    </button>
  );
});
