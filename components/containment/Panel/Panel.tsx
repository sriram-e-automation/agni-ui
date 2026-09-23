import React, { forwardRef } from "react";
import { PanelBase, type PanelProps as InlineProps } from "./PanelBase.tsx";
import { Sheet, type SheetProps } from "./Sheet.tsx";
import { Drawer, type DrawerProps } from "./Drawer.tsx";
import { resolvePanelBody } from "../../utils/panelState.tsx";

/* ── Types (mirrored in Panel.d.ts) ── */
export interface PanelProps
  extends Omit<InlineProps, "title">,
    Omit<SheetProps, keyof InlineProps | "title">,
    Omit<DrawerProps, keyof InlineProps | keyof SheetProps | "title"> {
  /** Where the panel sits. @default "inline" */
  variant?: "inline" | "sheet" | "drawer";
  title?: React.ReactNode;
}

/**
 * AgniUI · Panel
 * One container with a header. `variant` chooses where it sits: inline in the
 * page, a bottom sheet, or a side drawer. Sheet and Drawer remain as internal
 * renderers.
 *
 * The state contract (`loading` · `empty` · `error` + `onRetry`) applies to ALL
 * THREE variants as of Aug 2026. It used to resolve inside PanelBase only, so a
 * record drawer whose fetch failed rendered an empty shell — the state props
 * were silently dropped. The dispatcher now resolves the body once, through the
 * same `resolvePanelBody` the inline variant uses, and hands the result down as
 * children; the overlays need no state logic of their own.
 *
 * A failed or loading overlay also loses its footer (see resolvePanelBody):
 * a sticky Save above an ErrorState offers an action that cannot be performed.
 * `empty` keeps the footer, because the action beside an empty body is usually
 * the way out of it.
 *
 * inline → a named region (collapsible: a disclosure button); sheet / drawer →
 * modal dialogs with the Modal focus contract. The ref is the outer element
 * (inline) or the dialog panel (overlays).
 */
export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel({ variant = "inline", ...p }, ref) {
  if (variant === "inline") {
    const { open, onClose, side, width, maxWidth, closeOnScrim, closeOnEscape, initialFocus, restoreFocus, closeLabel, subtitle, footer, ...inline } = p;
    return <PanelBase ref={ref} {...inline} />;
  }

  const { loading, loadingShape, empty, error, onRetry, children, footer, collapsible, expanded, defaultOpen, onExpandedChange, pad, actions, ...rest } = p;
  /* md sizing: an overlay body has far more room than an inline panel. */
  const { body, suppressFooter } = resolvePanelBody({ children, loading, loadingShape, empty, error, onRetry, size: "md" });
  const shared = { ...rest, footer: suppressFooter ? null : footer, children: body };
  const dialogRef = ref as React.Ref<HTMLDivElement>;

  if (variant === "sheet") return <Sheet ref={dialogRef} {...(shared as SheetProps)} />;
  const { subtitle, icon, maxWidth, ...drawer } = shared;
  return <Drawer ref={dialogRef} {...(drawer as DrawerProps)} />;
});
