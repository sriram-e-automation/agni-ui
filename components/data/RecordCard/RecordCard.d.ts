import * as React from "react";

export interface RecordCardApp { name: string; icon?: string; }
export interface RecordCardPerson { id?: string; name: string; team?: string; }
export interface RecordCardEffort { total?: string; intervals?: number; running?: boolean; current?: string; startedAt?: string; }

/**
 * The shared record contract — one shape for table rows, board cards, approval
 * rows and the detail modal. Legacy field names are accepted and normalized
 * (`owner` → requestedBy, `group` → requestedFor, `lane` → status, `type` →
 * requestType, `raisedOn` → date).
 */
export interface RecordCardRecord {
  id: string;
  requestType?: string;
  /** Canonical status / lane label. */
  status?: string;
  /** Application identity — include in cross-app views, omit inside one app. */
  app?: RecordCardApp | null;
  /** Raised on. */
  date?: string;
  requestedBy?: string;
  requestedFor?: string;
  category?: string;
  priority?: "High" | "Med" | "Low" | null;
  assignee?: string | RecordCardPerson | null;
  assignees?: (string | RecordCardPerson)[] | null;
  assignedOn?: string;
  startedOn?: string;
  dueSince?: string;
  completedOn?: string;
  days?: number | null;
  rejectedBy?: string | RecordCardPerson | null;
  effort?: RecordCardEffort | null;
  /** Extra fields are legal and pass through untouched. */
  [key: string]: any;
}

export interface RecordCardProps {
  record?: RecordCardRecord;
  /** Which treatment renders. @default "kanban" */
  preset?: "kanban" | "approval" | "task";
  /** Lane context — overrides record.status (e.g. the board column). */
  status?: string;
  /** Roster for the approve-and-assign picker (kanban preset). */
  people?: RecordCardPerson[] | null;
  /** Show the status pill in the type row — card views and mobile. */
  showStatus?: boolean;
  onView?: () => void;
  onApprove?: (payload: { assignee: string | null; remark: string }) => void;
  onReject?: (payload: { remark: string }) => void;
  onComplete?: () => void;
  onStartLogging?: (record: RecordCardRecord) => void;
  onStopLogging?: (record: RecordCardRecord, notes: string) => void;
  /** Selection ring. */
  selected?: boolean;
  /** An action is in flight — footer actions spin and lock. */
  busy?: boolean;
  /** Viewer role — actions withheld, card stays readable. */
  disabled?: boolean;
  /** approval preset: category → { dept, icon, clr } strip meta. */
  categoryMeta?: Record<string, any>;
  /** approval preset: category → request-type label. */
  typeByCategory?: Record<string, string>;
  /** task preset: lane label → kanban tone token group. */
  laneTones?: Record<string, string>;
  /** task preset: app name → accent colour. */
  appColors?: Record<string, string>;
  style?: React.CSSProperties;
  /** Content in flight — shape-matched skeleton. */
  loading?: boolean;
  /** Skeleton units while loading. @default 1 */
  loadingRows?: number;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Nothing to show. String → EmptyState title; node → as given. */
  empty?: React.ReactNode;
}

/** Normalize any legacy record shape to RecordCardRecord.  * States: loading · error · empty · disabled · busy · selected.
*/
export declare function normalizeRecord(input?: any): RecordCardRecord;

/**
 * AgniUI · RecordCard
 * The single card entry point for a record. One contract, three presets:
 * kanban (status-driven footer) · approval (department strip + approve/reject) ·
 * task (app strip + effort logging). Reach for this rather than KanbanCard /
 * ApprovalCard / TaskCard directly — those remain exported as the preset
 * renderers. PersonCard stays separate: a crew member is not a record.
 * @version 1.1.0
 */
export declare const RecordCard: React.ForwardRefExoticComponent<RecordCardProps & React.RefAttributes<HTMLDivElement>>;
