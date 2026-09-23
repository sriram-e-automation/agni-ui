/* AgniUI · RecordDetailModal — import contract
   ------------------------------------------------------------------
   One generic record-detail dialog. Nothing here is domain-bound: a staged
   pipeline is `stages`, a searchable detail region is a `sections` entry with
   `search`, an activity log is a `panes` entry, a sub-task that takes over the
   body is a `flows` entry, an editable owner is `assignment`. A consumer with
   none of those passes none of them and gets the original dialog unchanged.

   Superset of the pre-Aug-2026 contract — every earlier prop keeps its name,
   default and meaning; everything new is additive and falls back to `record`.
*/

import * as React from "react";
import { ApprovalStep } from "../ApprovalStepper/ApprovalStepper";
import { RecordStage, StageAction, StageState } from "../../data/StageList/StageList";

/* Stage shapes live with the component that owns them (data/StageList) and are
   re-exported here so a page can type a `stages` array from one import. */
export { RecordStage, StageAction, StageState };

/* ── Shared value shapes ───────────────────────────────────────────── */

export interface DetailField {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Render the value in --font-data (IDs, quantities, dates). */
  mono?: boolean;
  /** Grid columns this field spans. @default 1 */
  span?: 1 | 2 | 3;
}

export interface Person {
  name: string;
  role?: string;
  email?: string;
  avatar?: string;
}

export interface RecordDocument {
  name: string;
  type?: "pdf" | "doc" | "xls" | "img" | "cad" | "zip" | "file";
  meta?: string;
}

export interface RecordAuditEntry {
  actor: string; action: string; ts: string; detail?: string; icon?: string;
  tone?: "default" | "success" | "warning" | "error" | "info";
}

export interface RecordResolution {
  state?: "Approved" | "Rejected" | "Completed";
  by?: string; on?: string; remark?: string;
}

/* ── 1 · Sections (the tab strip) ──────────────────────────────────── */

export interface SectionFilter {
  key: string;
  label?: string;
  /** `segmented` for 2–3 short options, `select` for longer lists. */
  control?: "segmented" | "select";
  options: Array<{ value: string; label: string }>;
  /** @default "all" */
  value?: string;
  onChange?: (value: string) => void;
}

export interface SectionSearch {
  placeholder?: string;
  /** Record keys searched when the section renders `rows`/`items`. */
  keys?: string[];
  /** Controlled query; omit for internal state. */
  value?: string;
  onChange?: (q: string) => void;
}

export interface SectionContext {
  query: string;
  filters: Record<string, string>;
  /** Rows/items left after search + filters, when the section supplied them. */
  results: any[];
}

export interface RecordSection {
  key: string;
  label: string;
  /** Phosphor glyph name, e.g. "ph-list-checks". */
  icon?: string;
  /** Count pill next to the label. */
  badge?: number | string;
  /** Field grid — the default body. Mutually exclusive with `content`. */
  rows?: DetailField[];
  /** Arbitrary body. Receives the resolved search/filter state. */
  content?: React.ReactNode | ((ctx: SectionContext) => React.ReactNode);
  /** Adds the search field above the body. `true` = default placeholder.
   *  The modal renders the DS `Input` — no page hand-rolls a raw input. */
  search?: boolean | SectionSearch;
  /** Filter controls rendered on the same row as the search field. */
  filters?: SectionFilter[];
  /** Body scrolls inside the section instead of growing the dialog.
   *  `true` = fill available height; a number caps it in px. */
  scroll?: boolean | number;
  /** Shown when the section has no rows/items after filtering. */
  empty?: React.ReactNode;
  /** Roles this section is visible to. Omit = every role. Matched against
   *  the `role` prop, same contract as core/RoleGate. */
  roles?: string[];
  /** Statuses this section appears for. Omit = every status. */
  when?: string[];
  /** Per-section data state — resolved through DataState, same precedence
   *  as every other data component (error → loading → empty → content). */
  loading?: boolean;
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
}

/* ── 2 · Panes (the right-hand rail) ───────────────────────────────── */

export interface RecordPane {
  key: string;
  label: string;
  icon: string;
  /** Pane body. "audit" and "effort" are built in — supply `content` only
   *  for a custom pane. */
  content?: React.ReactNode;
  /** Toggle is visible but inert. Flows also disable panes via `lockPanes`. */
  disabled?: boolean;
  roles?: string[];
}

/* ── 3 · Footer actions ────────────────────────────────────────────── */

export interface RecordAction {
  key: string;
  label: string;
  icon?: string;
  category?: "primary" | "secondary" | "danger";
  /** Opens the built-in confirmation dialog before firing `onAction`. */
  confirm?: {
    title: string;
    body?: React.ReactNode;
    /** Remark field: hidden · optional · required (blocks submit when empty). */
    remark?: "none" | "optional" | "required";
    remarkLabel?: string;
    confirmLabel?: string;
    danger?: boolean;
  };
  /** Opens a flow instead of firing `onAction`. */
  flow?: string;
  disabled?: boolean;
  /** Statuses this action appears for. Omit = always. */
  when?: string[];
  /** Roles allowed to fire it. Omit = every role. */
  roles?: string[];
}

/* ── 4 · Flows — a task that takes over the dialog body ────────────── */

export interface FlowContext {
  /** Leave the flow and return to the sections. */
  exit: () => void;
  /** Move to another flow by key. */
  go: (key: string) => void;
}

export interface RecordFlow {
  key: string;
  /** Breadcrumb label — rendered after a back arrow above the body. */
  title: React.ReactNode;
  /** Trailing, de-emphasised half of the breadcrumb. */
  crumb?: React.ReactNode;
  content: React.ReactNode | ((ctx: FlowContext) => React.ReactNode);
  /** Replaces the footer while the flow runs. */
  footer?: React.ReactNode | ((ctx: FlowContext) => React.ReactNode);
  /** Expand the dialog to full page on entry. @default true */
  expand?: boolean;
  /** Disable the pane toggles while the flow runs. @default true */
  lockPanes?: boolean;
  /** Hide the essential-details and workflow sections. @default false */
  bare?: boolean;
}

/* ── 5 · Related-record navigation ─────────────────────────────────── */

export interface RecordParent {
  label: React.ReactNode;
  hint?: React.ReactNode;
  onNavigate?: () => void;
}

/* ── 6 · Assignment — an editable owner on the record ──────────────── */

export interface RecordAssignment {
  /** @default "Assigned to" */
  label?: string;
  value?: Person | string | null;
  options?: Person[];
  /** Shows the change menu. Gate it with `roles`. @default false */
  editable?: boolean;
  roles?: string[];
  onChange?: (person: Person) => void;
  /** Where the row sits. @default "workflow" */
  placement?: "workflow" | "header";
}

/* ── 7 · Effort log — the built-in "effort" pane ───────────────────── */
/* Carried over unchanged. Present on the record (not as a top-level prop)
   because the ledger belongs to the record, not to the dialog. */

export interface EffortEntry {
  /** Assignee who logged the effort. */
  by: string;
  /** Formatted start date-time, e.g. "13 Jun 2025, 09:00". */
  startLabel: string;
  /** Formatted end date-time. */
  endLabel: string;
  /** Duration in hours (decimal). */
  hours: number;
  /** Formatted timestamp the entry was recorded. */
  loggedOn: string;
}

export interface RecordEffort {
  /** Enables the "Effort log" pane. Use for approved + assigned tasks. */
  canLog: boolean;
  /** Assignee names eligible to log effort (one or many). */
  assignees: string[];
  /** Existing logged-effort ledger. */
  entries?: EffortEntry[];
}

/* ── The record ────────────────────────────────────────────────────── */
/* Every field here is a FALLBACK for the matching prop, so a page can pass a
   whole record and nothing else (today's usage), or pass explicit props and
   treat `record` as an opaque identity. */

export interface RecordDetailRecord {
  id: string;
  requestType?: string;
  raisedBy?: string;
  raisedOn?: string;
  project?: string;
  /** Drives actionability + the resolution banner. */
  status?: "Pending" | "In Review" | "Awaiting Approval" | "Approved" | "Yet to start" | "In Progress" | "Overdue" | "Completed" | "Rejected" | string;
  workflow?: ApprovalStep[];
  audit?: RecordAuditEntry[];
  /** Rows for the three default sections, used when `sections` is not given. */
  basics?: DetailField[];
  assignment?: DetailField[];
  execution?: DetailField[];
  documents?: RecordDocument[];
  resolution?: RecordResolution;
  /** Present + canLog:true adds the "Effort log" pane for assigned tasks. */
  effort?: RecordEffort | null;
}

/* ── The component ─────────────────────────────────────────────────── */

export interface RecordDetailModalProps {
  open?: boolean;
  record?: RecordDetailRecord | null;
  onClose?: () => void;

  /* Header */
  title?: React.ReactNode;              // default: record.requestType
  subtitle?: React.ReactNode;           // default: record.id in --font-data
  status?: string;                      // default: record.status
  icon?: string;                        // @default "ph-file-text"
  parent?: RecordParent;

  /* Essential details — collapsible */
  essentials?: DetailField[];
  /** @default true */
  defaultEssentialsOpen?: boolean;
  /** Inline summary in the collapsed header. Default: raised-by · project. */
  essentialsSummary?: React.ReactNode;

  /* Approval workflow */
  workflow?: ApprovalStep[];
  /** @default true when `workflow` is non-empty */
  showWorkflow?: boolean;
  /** Copy under the "Approval workflow" eyebrow. */
  workflowHint?: React.ReactNode;
  assignment?: RecordAssignment;

  /* Sections */
  sections?: RecordSection[];
  /** Controlled active section. */
  section?: string;
  onSectionChange?: (key: string) => void;
  /** Document repository — rendered as the trailing folder toggle. */
  documents?: RecordDocument[];

  /* Stages — convenience for a single pipeline section. Equivalent to a
     section whose content is <StageList>. */
  stages?: RecordStage[];
  onStageAction?: (stage: RecordStage, action: StageAction) => void;

  /* Flows */
  flows?: RecordFlow[];
  /** Controlled active flow. `null` = none. */
  flow?: string | null;
  /** @default null */
  defaultFlow?: string | null;
  onFlowChange?: (key: string | null) => void;

  /* Panes */
  audit?: RecordAuditEntry[];
  panes?: RecordPane[];
  /** Pane open on mount. `null` = all closed. @default "audit" */
  defaultPane?: string | null;
  pane?: string | null;                 // controlled
  onPaneChange?: (key: string | null) => void;
  /** @deprecated Use `defaultPane` — it can also express "all closed" (null).
   *  Consulted only when `defaultPane` is absent. Kept for one release. */
  defaultAuditOpen?: boolean;

  /* Expansion */
  /** @default true */
  expandable?: boolean;
  /** @default false */
  defaultExpanded?: boolean;
  expanded?: boolean;                   // controlled
  onExpandedChange?: (expanded: boolean) => void;

  /* Footer */
  actions?: RecordAction[];
  /** Fired by a footer action, with the remark its confirmation captured
   *  (empty string when the action has no remark field). The built-in
   *  approve / reject shapes fire with key "approve" / "reject". */
  onAction?: (key: string, remark: string) => void;
  resolution?: RecordResolution;
  /** Replaces the whole footer. Escape hatch for bespoke bars. */
  footer?: React.ReactNode;

  /* Built-in task actions — kept from the earlier contract */
  /** Enables the "Mark as completed" action for assigned-task statuses
   *  (Yet to start · In Progress · Overdue) when `actions` is not supplied. */
  onComplete?: (remark: string) => void;
  /** Fired when an assignee logs an entry from the built-in Effort log pane. */
  onLogEffort?: (entry: EffortEntry) => void;

  /* Access */
  /** Current viewer's role — matched against every `roles` list on sections,
   *  panes, actions and assignment. Same contract as core/RoleGate. */
  role?: string;
  /** Role has view rights only — every action is withheld. */
  readOnly?: boolean;

  /* State + layout */
  loading?: boolean;
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  busy?: boolean;
  /** @default 3 */
  columns?: 2 | 3;
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

/**
 * Full-record detail dialog — a two-pane shell: a scrollable detail column
 * (essential fields · approval workflow · tabbed sections · document
 * repository) beside a collapsible side rail (activity log · effort log · any
 * pane the page supplies).
 *
 * Everything the dialog shows is declarative. Sections carry their own search,
 * filters, scroll region and data state; `stages` renders an ordered pipeline;
 * `flows` lets a sub-task take over the body with its own breadcrumb and
 * footer; `actions` makes the footer and its confirmations page-supplied; every
 * `roles` list is checked against `role` through the same predicate as
 * core/RoleGate.
 *
 * Passing only `record` reproduces the original approval dialog exactly:
 * six essential fields, three sections, the audit pane, and approve / reject
 * (or "Mark as completed" for assigned tasks) in the footer.
 * @version 1.1.0
  * States: loading · error · busy · open · expanded · readOnly.
*/
export declare const RecordDetailModal: React.ForwardRefExoticComponent<RecordDetailModalProps & React.RefAttributes<HTMLElement>>;
