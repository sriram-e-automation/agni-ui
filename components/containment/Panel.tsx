import React from "react";
import { PanelBase } from "./PanelBase.tsx";
import { Sheet } from "./Sheet.tsx";
import { Drawer } from "./Drawer.tsx";
import { resolvePanelBody } from "./panelState.tsx";

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
 */
export function Panel({ variant = "inline", ...p }: any) {
  if (variant === "inline") return <PanelBase {...p} />;

  const { loading, loadingShape, empty, error, onRetry, children, footer, ...rest } = p;
  /* md sizing: an overlay body has far more room than an inline panel. */
  const { body, suppressFooter } = resolvePanelBody({ children, loading, loadingShape, empty, error, onRetry, size: "md" });
  const shared = { ...rest, footer: suppressFooter ? null : footer, children: body };

  if (variant === "sheet") return <Sheet {...shared} />;
  return <Drawer {...shared} />;
}
