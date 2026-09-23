/**
 * @internal Renderer behind the public <Button> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef } from "react";
import { TipBubble, useTip } from "../../feedback/Tooltip/Tooltip.tsx";
import { composeHandlers, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Button.d.ts) ── */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "title"> {
  children?: React.ReactNode;
  /** Visual intent. @default "primary" */
  category?: "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "brand-soft";
  /** Alias for `category` — the DS-wide word for a visual variant. */
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "brand-soft";
  /** Control height / density. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Leading icon node, e.g. <i className="ph ph-plus" /> */
  icon?: React.ReactNode;
  /** Trailing icon node */
  iconTrailing?: React.ReactNode;
  /** Stretch to fill container width. */
  block?: boolean;
  disabled?: boolean;
  /** Show a spinner and block interaction. */
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  /** Label shown in a DS tooltip on hover/focus (useful for icon-only buttons). */
  title?: string;
  /** Tooltip side. @default "top" */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  /** Escape hatch for runtime-computed values only — not for theming. */
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Primary action control for AgniUI desks.
 * @startingPoint section="Core" subtitle="Buttons in every category & size" viewport="700x180"
 */

/* ── Class tables ────────────────────────────────────────────────────────────
   FULL class strings only. Never build a name by concatenation
   (`bg-${tone}-100`) — Tailwind's scanner reads source as plain text and cannot
   see a class that is assembled at runtime, so it would be absent from the
   compiled CSS. Every string below must appear literally.

   hover/active are `enabled:`-guarded: a disabled <button> can still match
   :hover in some engines, and the old JS implementation short-circuited that
   with a `disabled ? ...` ternary. This preserves that behaviour in CSS.       */

/* Control heights ride --density-control-h via h-control-*, adopted across the
   WHOLE control family in one change (Aug 2026) — Button, Input, Select and its
   renderers, DatePicker, QuantityStepper. At comfortable density and scale 1
   these resolve to exactly the historic 32 / 38 / 44, so nothing moves by
   default; they now also track [data-density] and [data-scale], and pick up the
   44px coarse-pointer floor in tokens/spacing.css that every control used to
   ignore. Do NOT switch one control back to a literal height: the family only
   stays aligned if they all read the same token. See tailwind/README.md rule 6. */
const SIZE = {
  sm: "h-control-sm px-[12px] gap-[6px] text-sm",
  md: "h-control px-[16px] gap-[8px] text-base",
  lg: "h-control-lg px-[20px] gap-[10px] text-md",
} as const;

const ICON_SIZE = { sm: "text-[15px]", md: "text-[17px]", lg: "text-[19px]" } as const;
const SPINNER = { sm: "size-[15px]", md: "size-[17px]", lg: "size-[19px]" } as const;

const CATEGORY = {
  primary:
    "bg-action-brand text-fg-on-brand border-transparent shadow-e-xs " +
    "enabled:hover:bg-action-brand-hover enabled:hover:shadow-e-sm enabled:active:bg-action-brand-press",
  secondary:
    "bg-surface-card text-fg-secondary border-line-default shadow-e-xs " +
    "enabled:hover:bg-surface-soft enabled:hover:shadow-e-sm enabled:active:bg-surface-sunken",
  tertiary:
    "bg-transparent text-fg-brand border-transparent " +
    "enabled:hover:bg-surface-brand-soft enabled:active:bg-[var(--agni-green-100)]",
  ghost:
    "bg-transparent text-fg-secondary border-transparent " +
    "enabled:hover:bg-state-hover enabled:active:bg-state-press",
  danger:
    "bg-[var(--button-danger-bg,var(--status-error))] text-fg-on-brand border-transparent shadow-e-xs " +
    "enabled:hover:bg-[var(--button-danger-bg-hover,var(--status-error-hover))] enabled:hover:shadow-e-sm " +
    "enabled:active:bg-[var(--button-danger-bg-press,var(--status-error-press))]",
  "brand-soft":
    "bg-surface-brand-soft text-fg-brand border-transparent " +
    "enabled:hover:bg-[var(--agni-green-100)] enabled:active:bg-[var(--agni-green-200)]",
} as const;

/* NOTE: `display` is NOT in BASE. Conflicting utilities resolve by emit order
   in the generated stylesheet, never by order in the class string — so a
   conditional "flex" appended after BASE's "inline-flex" would silently lose.
   A conditional must REPLACE the base class, not sit alongside it. */
const BASE =
  "relative items-center justify-center min-w-[var(--min-w-control)] " +
  "font-sans font-semibold leading-none tracking-[0.005em] whitespace-nowrap select-none " +
  "border rounded-md cursor-pointer " +
  "transition-[background-color,box-shadow,scale] duration-fast ease-standard " +
  "enabled:active:scale-[var(--press-scale)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-brand " +
  "disabled:cursor-not-allowed disabled:opacity-[var(--state-disabled-opacity)]";

/**
 * AgniUI · Button
 * Primary action control. Category drives intent; size drives density.
 * Fully interactive: hover, active(press-scale), focus-visible, disabled, loading.
 * States are pure CSS — no hover/press React state, so no re-render on pointer move.
 */
export const ButtonBase = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonBase({
  children,
  variant,                       // alias for category (DS-wide prop vocabulary)
  category = "primary",          // primary | secondary | tertiary | ghost | danger | brand-soft
  size = "md",                   // sm | md | lg
  icon = null,                   // leading ReactNode (e.g. <i className="ph ph-plus" />)
  iconTrailing = null,
  block = false,
  disabled = false,
  loading = false,
  type = "button",
  title,
  tooltipSide = "top",
  onClick, onMouseEnter, onMouseLeave, onMouseDown, onFocus, onBlur,
  style,
  className = "",
  ...rest
}, ref) {
  /* One vocabulary: `variant` is the DS-wide word; `category` stays valid. */
  category = variant || category;
  const tip = useTip(300);
  const hasTip = !!title && !disabled && !loading;
  /* A disabled button fires no mouse events, so its reason has to be carried by
     a wrapper. This is the `disabledReason` contract: a withheld action stays
     visible and explains itself. */
  const offTip = !!title && disabled && !loading;
  const tipId = useStableId(null, "agni-tip");
  /* A labelled button's tooltip is a description; an unlabelled one's is its name. */
  const describes = hasTip && tip.open && !!children;

  const cls = [
    BASE,
    SIZE[size] || SIZE.md,
    CATEGORY[category] || CATEGORY.primary,
    block ? "flex w-full" : "inline-flex",
    className,
  ].join(" ");

  const btn = (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={rest["aria-label"] ?? (!children && title ? title : undefined)}
      aria-describedby={[rest["aria-describedby"], describes ? tipId : null].filter(Boolean).join(" ") || undefined}
      aria-busy={loading || undefined}
      title={offTip ? title : undefined}
      className={cls}
      style={style}
      onClick={composeHandlers(onClick, () => tip.bind.onClick())}
      onMouseEnter={composeHandlers(onMouseEnter, () => { if (hasTip) tip.bind.onMouseEnter(); })}
      onMouseLeave={composeHandlers(onMouseLeave, () => { if (hasTip) tip.bind.onMouseLeave(); })}
      onMouseDown={composeHandlers(onMouseDown, () => { if (hasTip) tip.bind.onMouseDown(); })}
      onFocus={composeHandlers(onFocus, () => { if (hasTip) tip.bind.onFocus(); })}
      onBlur={composeHandlers(onBlur, () => { if (hasTip) tip.bind.onBlur(); })}
      onKeyDown={composeHandlers(rest.onKeyDown, (e) => { if (e.key === "Escape" && tip.open) tip.bind.onBlur(); })}
    >
      {loading && (
        <span
          className={[SPINNER[size] || SPINNER.md, "inline-block rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"].join(" ")}
        />
      )}
      {!loading && icon && (
        <span className={[ICON_SIZE[size] || ICON_SIZE.md, "inline-flex shrink-0"].join(" ")}>{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconTrailing && (
        <span className={[ICON_SIZE[size] || ICON_SIZE.md, "inline-flex shrink-0"].join(" ")}>{iconTrailing}</span>
      )}
      {hasTip && tip.open && <TipBubble id={tipId} label={title} side={tooltipSide} />}
    </button>
  );
  if (!offTip) return btn;
  /* Wrapper owns the hover — the disabled button itself emits nothing. */
  return (
    <span title={title} style={{ display: block ? "flex" : "inline-flex", position: "relative" }}
      onMouseEnter={tip.bind.onMouseEnter} onMouseLeave={tip.bind.onMouseLeave}>
      {btn}
      {tip.open && <TipBubble label={title} side={tooltipSide} />}
    </span>
  );
});
