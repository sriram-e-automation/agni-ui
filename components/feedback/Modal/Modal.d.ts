import * as React from "react";
export interface ModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Action row, e.g. Cancel + Confirm buttons. */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Red header icon for destructive confirmations. */
  danger?: boolean;
  closeOnScrim?: boolean;
  style?: React.CSSProperties;
}
/** Centered modal dialog over a scrim (Esc + scrim-click close).
 *  @version 1.0.0
  * States: open.
*/
export declare function Modal(props: ModalProps): JSX.Element;
