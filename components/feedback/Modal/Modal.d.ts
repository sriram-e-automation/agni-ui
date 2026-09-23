import * as React from "react";
export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Action row, e.g. Cancel + Confirm buttons. */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Red header icon for destructive confirmations (and role="alertdialog"). */
  danger?: boolean;
  closeOnScrim?: boolean;
  /** Close on Escape. @default true */
  closeOnEscape?: boolean;
  /** Element to focus on open — default: first focusable in the dialog, else the panel. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** Return focus to the opener on close. @default true */
  restoreFocus?: boolean;
  /** Accessible name of the close button. @default "Close" */
  closeLabel?: string;
  /** @default "dialog" ("alertdialog" when danger) */
  role?: "dialog" | "alertdialog";
  style?: React.CSSProperties;
}
/** Centered modal dialog over a scrim (Esc + scrim-click close).
 *
 *  WAI-ARIA modal dialog: labelled by `title`, described by the body; focus
 *  moves in on open, is trapped while open and returns to the opener on close.
 *  Escape is handled on the dialog, so nested dialogs close one at a time.
 *  Page scroll is locked while open. The ref is the dialog panel.
 *  @version 1.1.0
  * States: open.
*/
export declare const Modal: React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<HTMLDivElement>>;
