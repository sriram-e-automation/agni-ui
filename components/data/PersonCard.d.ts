import * as React from "react";

/** A crew member. Extra fields are legal (email, phone, reportsTo …). */
export interface PersonInfo {
  /** Employee ID (monospace meta, shown at size="lg"). */
  id: string;
  name: string;
  /** Role level — uppercase eyebrow (Associate · Senior lead · Director …). */
  role?: string;
  /** Crew (department). */
  crew?: string;
  /** Team within the crew. */
  team?: string;
  /** Optional photo URL — initials otherwise. */
  avatar?: string | null;
  [key: string]: any;
}

export interface PersonCardProps {
  person: PersonInfo;
  /** sm 200px compact (tree nodes) · md 240px default · lg 280px (adds the ID line). @default "md" */
  size?: "sm" | "md" | "lg";
  /** Selection state — brand-soft fill + brand border. */
  selected?: boolean;
  /** De-emphasized (e.g. outside the highlighted reporting path). */
  dimmed?: boolean;
  /** Makes the card interactive (hover lift + press scale). */
  onClick?: (person: PersonInfo) => void;
  /** Override the size's default width ("100%", 260, …). */
  width?: number | string;
  /** Trailing slot (badge, collapse control …). */
  suffix?: React.ReactNode;
  /** Person record still arriving — shape-matched skeleton card. */
  loading?: boolean;
  style?: React.CSSProperties;
}

/**
 * AgniUI · PersonCard
 * A crew-member card: avatar + name + crew · team, with the role level as an
 * uppercase eyebrow. The node unit of OrgTree; also usable in directories and
 * detail panes. States: rest · hover (lift) · selected (brand) · dimmed · loading.
 * @version 1.1.0
 */
export declare function PersonCard(props: PersonCardProps): JSX.Element;
