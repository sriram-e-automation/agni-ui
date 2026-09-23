import * as React from "react";
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned header actions. */
  actions?: React.ReactNode;
  /** Pad the body. @default true */
  pad?: boolean;
  /** Hover elevation + pointer cursor. */
  interactive?: boolean;
  /** Shimmer the body, header intact. */
  loading?: boolean;
  /** Which Loading shape the body shimmers as. @default "paragraph" */
  loadingShape?: string;
  /** Shown instead of children when there is nothing to show. String → the DS
   *  EmptyState at panel size; node → rendered as given. */
  empty?: React.ReactNode;
  /** Failure in the body. String/true → the DS ErrorState; node → as given.
   *  Takes precedence over loading and empty. */
  error?: React.ReactNode | boolean;
  /** Retry action on the error state. */
  onRetry?: () => void;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}
/** Surface container with optional header + actions.
 *  `interactive` + `onClick` makes the whole card a keyboard button (focusable,
 *  Enter / Space). Native attributes and events pass through; the ref is the card.
 *  @version 1.1.0
  * States: loading · error · empty.
*/
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
