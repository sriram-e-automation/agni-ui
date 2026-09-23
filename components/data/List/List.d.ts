import * as React from "react";
export interface ListItem {
  key?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  meta?: React.ReactNode;
  /** Makes the row focusable; Enter / Space activate. */
  onClick?: (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  /** Accessible name for a clickable row when `title` is a node. */
  label?: string;
}
export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  items?: ListItem[];
  divided?: boolean;
  style?: React.CSSProperties;
  /** Content in flight — shape-matched skeleton. */
  loading?: boolean;
  /** Skeleton units while loading. @default 4 */
  loadingRows?: number;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Nothing to show. String → EmptyState title; node → as given. */
  empty?: React.ReactNode;
}
/** Vertical record list with leading/trailing slots.
 *  @version 1.1.0
  * States: loading · error · empty.
*/
export declare const List: React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLUListElement>>;
