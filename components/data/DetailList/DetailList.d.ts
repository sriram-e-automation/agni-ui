import * as React from "react";
export interface KeyValueItem {
  /** Phosphor icon class shown beside the label (stacked layout only). */
  icon?: string;
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Adds a copy-to-clipboard button after the value. */
  copyable?: boolean;
  /** Render the value in the data/mono face — IDs, numbers, dates. */
  mono?: boolean;
  /** Makes the value a brand-coloured link button. */
  onClick?: () => void;
  /** Span the full row of a grid layout. */
  span?: boolean;
}
export interface KeyValueRowProps extends KeyValueItem {
  /** stacked = label above value · row = label left, value right · bordered = stacked with a divider. @default "stacked" */
  layout?: "stacked" | "row" | "bordered";
  last?: boolean;
  style?: React.CSSProperties;
}
export interface DetailListProps {
  items?: (KeyValueItem | null | false)[];
  /** bordered = divided card (default) · row = label/value columns · grid = auto-fill field grid. */
  layout?: "bordered" | "row" | "grid";
  /** Min column width when layout="grid". @default 200 */
  minCol?: number;
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
export interface CopyButtonProps { value: React.ReactNode; title?: string; }
/** Copy-to-clipboard icon button with a 1.6s confirmation.  * States: loading · error · empty.
*/
export declare const CopyButton: React.ForwardRefExoticComponent<CopyButtonProps & React.RefAttributes<HTMLButtonElement>>;
/** One label + value pair, optionally copyable, mono or a link. */
export declare const KeyValueRow: React.ForwardRefExoticComponent<KeyValueRowProps & React.RefAttributes<HTMLDivElement>>;
/** Stack of KeyValueRows — the read-only field display for record-detail pages.
 *  @version 1.1.0
 */
export declare const DetailList: React.ForwardRefExoticComponent<DetailListProps & React.RefAttributes<HTMLElement>>;
