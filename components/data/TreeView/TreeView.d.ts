import * as React from "react";
export interface TreeNode { key: string; label: React.ReactNode; icon?: string; children?: TreeNode[]; /** Shown but inert. */ disabled?: boolean; /** Plain text for typeahead when `label` is a node. */ textValue?: string; }
export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  nodes?: TreeNode[];
  /** Controlled expanded keys. */
  open?: string[];
  defaultOpen?: string[];
  onOpenChange?: (open: string[]) => void;
  /** Controlled selected key. */
  selected?: string | null;
  defaultSelected?: string | null;
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
 *  WAI-ARIA tree: one Tab stop; ↑ ↓ move · → expand / into child · ← collapse /
 *  to parent · Home / End · Enter / Space select · typeahead. Name it with aria-label.
 *  @version 1.1.0
  * States: loading · error · empty · selected.
*/
export declare const TreeView: React.ForwardRefExoticComponent<TreeViewProps & React.RefAttributes<HTMLDivElement>>;
