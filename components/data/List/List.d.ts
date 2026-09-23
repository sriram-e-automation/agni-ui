import * as React from "react";
export interface ListItem {
  key?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: () => void;
}
export interface ListProps {
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
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function List(props: ListProps): JSX.Element;
