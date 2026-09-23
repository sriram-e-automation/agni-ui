import React, { forwardRef, useState, useRef, useCallback, useEffect } from "react";
import { useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Tooltip.d.ts) ── */
export interface TooltipProps {
  label: React.ReactNode;
  /** The anchor. A single element receives `aria-describedby` while the tip is open. */
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  /** Hover/focus open delay in ms. @default 300 */
  delay?: number;
  /** Id of the bubble — generated when omitted. */
  id?: string;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: React.CSSProperties;
}
export interface TipBubbleProps {
  label: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  id?: string;
  /** The anchor already carries this text as its name — hide the bubble from AT. */
  decorative?: boolean;
  style?: React.CSSProperties;
}
/** Hover/focus tooltip around a single child. */

/* Position of the bubble and its caret, per side. Written as arbitrary
   PROPERTIES rather than Tailwind's -translate-x-1/2 etc: the numeric transform
   utilities route through --tw-translate-* custom properties, which the DS token
   compiler flags as unclassified tokens declared under a component selector.
   `[transform:…]` emits the declaration directly. */
const SIDE = {
  top: {
    bubble: "bottom-[calc(100%+8px)] left-1/2 [transform:translateX(-50%)]",
    caret: "bottom-[-4px] left-1/2 [transform:translateX(-50%)_rotate(45deg)]",
    from: "translateX(-50%)",
  },
  bottom: {
    bubble: "top-[calc(100%+8px)] left-1/2 [transform:translateX(-50%)]",
    caret: "top-[-4px] left-1/2 [transform:translateX(-50%)_rotate(-135deg)]",
    from: "translateX(-50%)",
  },
  left: {
    bubble: "right-[calc(100%+8px)] top-1/2 [transform:translateY(-50%)]",
    caret: "right-[-4px] top-1/2 [transform:translateY(-50%)_rotate(-45deg)]",
    from: "translateY(-50%)",
  },
  right: {
    bubble: "left-[calc(100%+8px)] top-1/2 [transform:translateY(-50%)]",
    caret: "left-[-4px] top-1/2 [transform:translateY(-50%)_rotate(135deg)]",
    from: "translateY(-50%)",
  },
} as const;

const BUBBLE =
  "absolute z-tooltip whitespace-nowrap px-2 py-1 rounded-[var(--tooltip-radius)] " +
  "bg-[var(--tooltip-bg)] text-[var(--tooltip-fg)] border border-[var(--tooltip-bdr)] " +
  "font-sans text-xs font-medium leading-snug pointer-events-none " +
  "[box-shadow:var(--tooltip-shadow)]";
const CARET =
  "absolute size-[8px] bg-[var(--tooltip-bg)] " +
  "border-r border-b border-r-[var(--tooltip-bdr)] border-b-[var(--tooltip-bdr)]";

/**
 * AgniUI · TipBubble
 * The bare styled tooltip bubble + caret. Render inside a `position:relative`
 * anchor (button/span). Shared by <Tooltip> and any icon control that shows a
 * tooltip (IconButton, table row actions, …) so every tooltip looks identical.
 *
 * The entrance animation stays inline: its keyframes interpolate the side's own
 * transform, so the rule is composed per side at runtime and cannot be a class.
 */
export function TipBubble({ label, side = "top", id, decorative = false, style = {} }: TipBubbleProps) {
  const s = SIDE[side] || SIDE.top;
  return (
    <span id={id} role={decorative ? undefined : "tooltip"} aria-hidden={decorative || undefined} className={[BUBBLE, s.bubble].join(" ")}
      style={{ animation: "agni-tip-in var(--dur-fast) var(--ease-standard)", ...style }}>
      {label}
      <span aria-hidden="true" className={[CARET, s.caret].join(" ")} />
      <style>{`@keyframes agni-tip-in{from{opacity:0;transform:${s.from} scale(0.94)}}`}</style>
    </span>
  );
}

/**
 * useTip(delay) — open/close state + handlers for an anchored tooltip.
 * Spread `bind` onto the anchor element; render <TipBubble> when `open`.
 * Used by primitives (IconButton, …) that don't want an extra wrapper node.
 *
 * These pointer handlers are NOT the hover-in-state anti-pattern the migration
 * removes elsewhere: a tooltip's delay timer is real state that no CSS
 * :hover can express.
 */
export function useTip(delay = 300) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (t.current) { clearTimeout(t.current); t.current = null; } };
  const show = useCallback(() => { clear(); t.current = setTimeout(() => setOpen(true), delay); }, [delay]);
  const hide = useCallback(() => { clear(); setOpen(false); }, []);
  useEffect(() => clear, []);
  return {
    open,
    bind: {
      onMouseEnter: show, onMouseLeave: hide,
      onFocus: show, onBlur: hide,
      onMouseDown: hide, onClick: hide,
    },
  };
}

/**
 * AgniUI · Tooltip
 * Hover/focus tooltip. Wraps a single child; `label` is the content. Themed via
 * --tooltip-* tokens (flips for dark). Adds a caret and an open delay.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip({ label, children, side = "top", delay = 300, id, open: openProp, onOpenChange, style = {} }, ref) {
  const tip = useTip(delay);
  const tipId = useStableId(id, "agni-tooltip");
  const controlled = openProp !== undefined;
  const open = (controlled ? openProp : tip.open) && label != null && label !== "";
  const lastOpen = useRef(open);
  useEffect(() => { if (lastOpen.current !== open) { lastOpen.current = open; onOpenChange?.(open); } }, [open, onOpenChange]);
  /* WCAG 1.4.13 — a tooltip must be dismissable without moving the pointer. */
  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape" && open) tip.bind.onBlur(); };
  /* Describe the anchor itself, not the wrapper, so AT reads the tip with it. */
  const child = React.Children.count(children) === 1 ? React.Children.toArray(children)[0] : children;
  const anchor = React.isValidElement<{ "aria-describedby"?: string }>(child)
    ? React.cloneElement(child, {
        "aria-describedby": [child.props["aria-describedby"], open ? tipId : null].filter(Boolean).join(" ") || undefined,
      })
    : child;
  return (
    <span ref={ref} className="relative inline-flex" {...tip.bind} onKeyDown={onKeyDown}>
      {anchor}
      {open && <TipBubble id={tipId} label={label} side={side} style={style} />}
    </span>
  );
});
