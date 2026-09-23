import * as React from "react";

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Where the panel sits. @default "inline" */
  variant?: "inline" | "sheet" | "drawer";
  title?: React.ReactNode;
  /** sheet — secondary line under the title. */
  subtitle?: React.ReactNode;
  /** Phosphor icon name beside the title, e.g. "ph-plus". */
  icon?: string;
  /** inline — header-right slot. */
  actions?: React.ReactNode;
  /** sheet / drawer — sticky action bar. */
  footer?: React.ReactNode;
  children?: React.ReactNode;

  /** inline — collapse toggle in the header (a disclosure button). */
  collapsible?: boolean;
  /** inline — controlled expanded state. */
  expanded?: boolean;
  /** inline — initial expanded state. @default true */
  defaultOpen?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** inline — body padding. @default true */
  pad?: boolean;
  /* ── The state contract — all three variants (Aug 2026) ──────────────────
     Resolved once in the dispatcher, in the documented precedence
     error → loading → empty → content. The header stays in every state so an
     overlay can always be closed; error and loading DROP the footer, because a
     sticky Save above an ErrorState offers an action that cannot be performed.
     `empty` keeps the footer — the action beside an empty body is usually the
     way out of it. */
  /** Shimmer the body; header intact, footer withheld. */
  loading?: boolean;
  /** Which Loading shape the body shimmers as. @default "paragraph" */
  loadingShape?: string;
  /** Shown instead of children when there is nothing to show. Keeps the footer. */
  empty?: React.ReactNode;
  /** Failure in the body. String/true → the DS ErrorState; node → as given.
   *  Withholds the footer. */
  error?: React.ReactNode | boolean;
  /** Retry action on the error state. */
  onRetry?: () => void;

  /** sheet / drawer — visibility. */
  open?: boolean;
  onClose?: () => void;
  /** drawer — which edge it enters from. @default "right" */
  side?: "right" | "left";
  /** drawer — px width. */
  width?: number;
  /** sheet — max width of the centred sheet. */
  maxWidth?: number | string;
  /** sheet / drawer — dismiss on scrim click. @default true */
  closeOnScrim?: boolean;
  /** sheet / drawer — dismiss on Escape. @default true */
  closeOnEscape?: boolean;
  /** sheet / drawer — element to focus on open. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** sheet / drawer — return focus to the opener on close. @default true */
  restoreFocus?: boolean;
  /** sheet / drawer — accessible name of the close button. @default "Close" */
  closeLabel?: string;

  style?: React.CSSProperties;
}

/**
 * AgniUI · Panel
 * The one titled container: an inline section, a bottom sheet, or a side drawer
 * over a scrim.
 *
 * Merged Aug 2026 — supersedes Sheet (`variant="sheet"`) and Drawer
 * (`variant="drawer"`), which remain as internal renderers and are no longer
 * part of the documented API.
 *
 * inline — a named region; collapsible panels use a disclosure button.
 * sheet / drawer — modal dialogs: labelled, focus trapped and returned to the
 * opener, Escape on the dialog, page scroll locked.
 * The ref is the section (inline) or the dialog panel (overlays).
 * @version 1.1.0
  * States: loading · error · empty · open.
*/
export declare const Panel: React.ForwardRefExoticComponent<PanelProps & React.RefAttributes<HTMLElement>>;
