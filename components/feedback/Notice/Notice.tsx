import React, { forwardRef } from "react";
import { Banner, type BannerProps } from "./Banner.tsx";
import { Toast } from "./Toast.tsx";

/* ── Types (mirrored in Notice.d.ts) ── */
export interface NoticeProps extends BannerProps {
  /** "inline" — full-width banner in the page · "toast" — floating card. @default "inline" */
  variant?: "inline" | "toast";
  /** toast — body copy. */
  message?: React.ReactNode;
  /** toast — dismiss affordance. */
  onClose?: () => void;
  /** toast — accessible name of the close button. @default "Dismiss" */
  closeLabel?: string;
}

/**
 * AgniUI · Notice
 * One notification component. `variant="inline"` (default) is the full-width
 * banner in the page; `variant="toast"` is the floating card. Banner and Toast
 * remain as internal renderers.
 *
 * Live region by tone: error (and inline warning) → role="alert", else
 * role="status"; override with `role`. Dismiss / close buttons are labelled.
 * The ref is the notice element.
 */
export const Notice = forwardRef<HTMLDivElement, NoticeProps>(function Notice(
  { variant = "inline", message, onClose, closeLabel, onDismiss, dismissLabel, tone, children, ...p },
  ref,
) {
  if (variant === "toast") {
    return (
      <Toast ref={ref} {...p} tone={tone === "brand" ? "info" : tone} message={message ?? children}
        onClose={onClose ?? onDismiss ?? undefined} closeLabel={closeLabel ?? dismissLabel} />
    );
  }
  return <Banner ref={ref} {...p} tone={tone} onDismiss={onDismiss ?? onClose ?? null} dismissLabel={dismissLabel ?? closeLabel}>{children ?? message}</Banner>;
});
