import * as React from "react";
export interface TooltipProps {
  label: React.ReactNode;
  /** The anchor. A single element receives aria-describedby while the tip is open. */
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
/** Hover/focus tooltip around a single child. Opens on hover and keyboard
 *  focus, describes its anchor (aria-describedby), and dismisses on Escape
 *  without moving the pointer (WCAG 1.4.13).
 *  @version 1.1.0
 */
export declare const Tooltip: React.ForwardRefExoticComponent<TooltipProps & React.RefAttributes<HTMLSpanElement>>;
/** Bare styled tooltip bubble + caret; render inside a position:relative anchor. */
export declare function TipBubble(props: TipBubbleProps): JSX.Element;
/** Open state + handlers for an anchored tooltip (spread `bind` onto the anchor). */
export declare function useTip(delay?: number): { open: boolean; bind: React.HTMLAttributes<HTMLElement> };
