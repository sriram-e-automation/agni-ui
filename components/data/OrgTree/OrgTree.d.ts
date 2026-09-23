import * as React from "react";
import { PersonInfo } from "./PersonCard";

/** A crew member with a reporting link. Extra fields are legal. */
export interface OrgPerson extends PersonInfo {
  /** id of this person's manager — empty/unknown ⇒ tree root. */
  reportsTo?: string | null;
}

export interface OrgTreeProps {
  /** Flat list — the tree is built from reportsTo links. */
  people?: OrgPerson[];
  /** Render only the subtree under this person. */
  rootId?: string;
  /** Node card size. @default "sm" */
  cardSize?: "sm" | "md";
  /** Highlighted person — brand card + highlighted path up to the root. */
  selectedId?: string | null;
  onPersonClick?: (person: OrgPerson) => void;
  /** Collapse/expand toggles (report-count pills) on nodes with reports. @default true */
  collapsible?: boolean;
  /** ids collapsed on first render. */
  defaultCollapsed?: string[];
  /** Optional hierarchy legend chips ("Director" › "Vice president" › …). */
  legend?: string[];
  /** @default "No people to display" */
  emptyLabel?: string;
  style?: React.CSSProperties;
  /** Content in flight — shape-matched skeleton. */
  loading?: boolean;
  /** Skeleton units while loading. @default 5 */
  loadingRows?: number;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Nothing to show. String → EmptyState title; node → as given. */
  empty?: React.ReactNode;
}

/**
 * AgniUI · OrgTree
 * Reporting line-up as a horizontal bracket tree: the root (e.g. Director) on
 * the left, reports fanning right through elbow connectors — PersonCard nodes,
 * collapsible branches with report counts, and a brand-highlighted path from
 * the selected person up to the root. Scrolls both axes inside its container.
 * @version 1.0.0
  * States: loading · error · empty.
*/
export declare function OrgTree(props: OrgTreeProps): JSX.Element;
