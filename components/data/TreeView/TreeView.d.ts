import * as React from "react";
export interface TreeNode { key: string; label: React.ReactNode; icon?: string; children?: TreeNode[]; }
export interface TreeViewProps {
  nodes?: TreeNode[];
  defaultOpen?: string[];
  selected?: string;
  onSelect?: (key: string, node: TreeNode) => void;
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
/** Nested expandable tree (BOM, categories, file hierarchy).
 *  @version 1.0.0
  * States: loading · error · empty · selected.
*/
export declare function TreeView(props: TreeViewProps): JSX.Element;
