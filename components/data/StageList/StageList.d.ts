import * as React from "react";

/** Where a stage sits in its pipeline. Maps onto the shared tone vocabulary:
 *  todo → todo · active → doing · done → done · blocked → blocked ·
 *  skipped → pending. */
export type StageState = "todo" | "active" | "done" | "blocked" | "skipped";

export interface StageAction {
  key: string;
  label: string;
  /** Phosphor glyph name, e.g. "ph-eye". */
  icon?: string;
  /** @default "secondary" */
  category?: "primary" | "secondary" | "ghost";
  /** States this action appears on. Omit = every state. */
  when?: StageState[];
  /** Roles this action is shown to. Omit = every role. */
  roles?: string[];
}

export interface RecordStage {
  key: string;
  label: string;
  /** One line of fact under the label. */
  meta?: React.ReactNode;
  icon?: string;
  state: StageState;
  /** Row actions — typically Preview and Open. */
  actions?: StageAction[];
  /** Flow key the host opens when the row's primary action fires.
   *  StageList only reports it back through `onAction`; it opens nothing. */
  flow?: string;
}

export interface StageListProps {
  stages?: RecordStage[];
  onAction?: (stage: RecordStage, action: StageAction) => void;
  /** Content in flight — skeleton rows. */
  loading?: boolean;
  /** Shown when `stages` is empty. String → EmptyState title; node → as given.
   *  @default "No stages yet" */
  empty?: React.ReactNode;
  /** Fetch failed. true/string → ErrorState with onRetry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Current viewer's role, matched against each `roles` list. Same contract
   *  as core/RoleGate. Omit to show everything. */
  role?: string;
  style?: React.CSSProperties;
}

/**
 * AgniUI · StageList
 * An ordered pipeline — numbered stage rows, each with a state tone, one line of
 * meta and its own row actions. Shape-only: nothing in it knows what the stages
 * are for, so a procurement pipeline, an onboarding checklist and a test plan
 * all render through the same component.
 *
 * States resolve their tone through `Tag`, so no module invents stage colours.
 * `RecordDetailModal` mounts this internally when handed `stages`.
 * Resolves `error → loading → empty → content` through `DataState`.
 * @version 1.0.0
  * States: loading · error · empty.
*/
export declare function StageList(props: StageListProps): JSX.Element;
