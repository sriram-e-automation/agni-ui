import * as React from "react";
export interface TooltipProps {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  /** Hover/focus open delay in ms. @default 300 */
  delay?: number;
  style?: React.CSSProperties;
}
/** Hover/focus tooltip around a single child. */
export declare function Tooltip(props: TooltipProps): JSX.Element;
/** Bare styled tooltip bubble + caret; render inside a position:relative anchor. */
export declare function TipBubble(props: { label: React.ReactNode; side?: "top" | "bottom" | "left" | "right"; style?: React.CSSProperties }): JSX.Element;
/** Open state + handlers for an anchored tooltip (spread `bind` onto the anchor).
 *  @version 1.0.0
 */
export declare function useTip(delay?: number): { open: boolean; bind: React.HTMLAttributes<HTMLElement> };
