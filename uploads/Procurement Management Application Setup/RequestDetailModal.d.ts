import * as React from "react";
import { ApprovalStep } from "./ApprovalStepper";

export interface RequestDetailField { label: React.ReactNode; value: React.ReactNode; }
export interface RequestAuditEntry { actor: string; action: string; ts: string; detail?: string; icon?: string; tone?: "default" | "success" | "warning" | "error" | "info"; }
export interface RequestDocument { name: string; type?: "pdf" | "doc" | "xls" | "img" | "cad" | "zip" | "file"; meta?: string; }
export interface RequestResolution { state?: "Approved" | "Rejected"; by?: string; on?: string; remark?: string; }
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
export interface RequestEffort {
  /** Enables the "Effort log" pane toggle. Use for approved + assigned tasks. */
  canLog: boolean;
  /** Assignee names eligible to log effort (one or many). */
  assignees: string[];
  /** Existing logged-effort ledger. */
  entries?: EffortEntry[];
}

export interface RequestRecord {
  id: string;
  requestType?: string;
  raisedBy?: string;
  raisedOn?: string;
  project?: string;
  /** Drives actionability + resolution banner. */
  status: "Pending" | "In Review" | "Awaiting Approval" | "Approved" | "Yet to start" | "In Progress" | "Overdue" | "Completed" | "Rejected";
  workflow?: ApprovalStep[];
  audit?: RequestAuditEntry[];
  basics?: RequestDetailField[];
  assignment?: RequestDetailField[];
  execution?: RequestDetailField[];
  documents?: RequestDocument[];
  resolution?: RequestResolution;
  /** Present + canLog:true adds the "Effort log" pane for assigned tasks. */
  effort?: RequestEffort | null;
}

export interface RequestDetailModalProps {
  open?: boolean;
  record?: RequestRecord | null;
  onClose?: () => void;
  /** Fired from the confirmation dialog. remark is mandatory when action==="reject". */
  onAction?: (action: "approve" | "reject", remark: string) => void;
  /**
   * Enables the "Mark as completed" footer action for assigned-task statuses
   * (Yet to start · In Progress · Overdue). Confirmed in a dialog that captures
   * an optional closing note; logged effort stays on the record.
   */
  onComplete?: (remark: string) => void;
  /** Fired when an assignee logs a new effort entry from the Effort log pane. */
  onLogEffort?: (entry: EffortEntry) => void;
  /** Detail-grid column count (essential details + tabs). @default 3 */
  columns?: 2 | 3;
  /** Audit pane open by default. @default true */
  defaultAuditOpen?: boolean;
  /** Show the expand-to-full-page toggle in the title bar. @default true */
  expandable?: boolean;
  /** Open already expanded to full page. @default false */
  defaultExpanded?: boolean;
  /** Essential-details section expanded on open. @default true */
  defaultEssentialsOpen?: boolean;
  /** Custom inline summary shown in the collapsed Essential-details header. Defaults to raised-by · divider · project. */
  essentialsSummary?: React.ReactNode;
  /** Spread onto the outer backdrop div — use e.g. paddingRight to shift the modal left when a side panel is open. */
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

/**
 * Full-record "View request" dialog for approval workflows — two-pane shell
 * (detail column + collapsible audit trail) with approve / reject actions and
 * a remarks-capturing confirmation step. Assigned-task statuses add an Effort
 * log pane (effort.canLog) and, with onComplete, a "Mark as completed" action.
 */
export declare function RequestDetailModal(props: RequestDetailModalProps): JSX.Element;
