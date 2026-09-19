import * as React from "react";
export interface QuickStatItem {
  /** Filter key emitted on click; null = "all" card (clears the filter). */
  key: string | null;
  icon: string;
  label: string;
  value: string | number;
  /** Accent color — hex or token; defaults to brand. */
  accent?: string;
}
export interface QuickStatsProps {
  items: QuickStatItem[];
  /** Currently selected filter key (null = none). */
  value?: string | null;
  /** Called with the clicked key (or null to clear) and the clicked item. */
  onChange?: (key: string | null, item?: QuickStatItem | null) => void;
  /** Show each card's share of the key:null card's total as a % pill. */
  showShare?: boolean;
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
/** Click-to-filter stat card strip for list pages.
 *  @version 1.0.0
  * States: loading · error · empty.
*/
export declare function QuickStats(props: QuickStatsProps): JSX.Element;
