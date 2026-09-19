import { resolveDataState } from "../feedback/DataState.tsx";
import React from "react";
import { KanbanCard } from "./KanbanCard.tsx";
import { ApprovalCard } from "./ApprovalCard.tsx";
import { TaskCard } from "./TaskCard.tsx";

/* ── Types (mirrored in RecordCard.d.ts) ── */
export interface RecordCardApp { name: string; icon?: string; }
export interface RecordCardPerson { id?: string; name: string; team?: string; }
export interface RecordCardEffort { total?: string; intervals?: number; running?: boolean; current?: string; startedAt?: string; }

export interface RecordCardRecord {
  id: string;
  requestType?: string;
  /** Canonical status / lane label. */
  status?: string;
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
  [key: string]: any;
}

export interface RecordCardProps {
  record?: RecordCardRecord;
  preset?: "kanban" | "approval" | "task";
  status?: string;
  people?: RecordCardPerson[] | null;
  showStatus?: boolean;
  onView?: () => void;
  onApprove?: (payload: { assignee: string | null; remark: string }) => void;
  onReject?: (payload: { remark: string }) => void;
  onComplete?: () => void;
  onStartLogging?: (record: RecordCardRecord) => void;
  onStopLogging?: (record: RecordCardRecord, notes: string) => void;
  selected?: boolean;
  busy?: boolean;
  disabled?: boolean;
  categoryMeta?: Record<string, any>;
  typeByCategory?: Record<string, string>;
  laneTones?: Record<string, string>;
  appColors?: Record<string, string>;
  style?: React.CSSProperties;
}

const nameOf = (p: any) => (p ? (typeof p === "string" ? p : p.name) : null);

/**
 * One record, one contract. Accepts the canonical record and the legacy field
 * names the older cards shipped with (`owner` → requestedBy, `group` →
 * requestedFor, `lane` → status), so a table row, a board card and an approval
 * row all normalize to the same object.
 */
export function normalizeRecord(input: any = {}): RecordCardRecord {
  const r = input || {};
  return {
    ...r,
    id: r.id,
    requestType: r.requestType || r.type,
    status: r.status || r.lane,
    date: r.date || r.raisedOn,
    requestedBy: r.requestedBy || r.owner || r.raisedBy,
    requestedFor: r.requestedFor || r.group || r.project,
    assignee: r.assignee ?? null,
    assignees: r.assignees ?? null,
  };
}

/**
 * AgniUI · RecordCard
 * The single card entry point for a record — request, approval, task,
 * application. `preset` picks the treatment; the record contract is the same
 * for all three, so a view can switch presets without reshaping its data.
 *
 *   kanban   (default) status-driven footer — board and card views
 *   approval          department strip + reject / approve & assign
 *   task              app strip + effort logging (start / stop / complete)
 *
 * States: rest · hover · selected · busy (action in flight) · disabled
 * (viewer role). PersonCard stays separate: a crew member is not a record.
 */
function RecordCardBody({
  record, preset = "kanban", status, people = null, showStatus,
  onView, onApprove, onReject, onComplete, onStartLogging, onStopLogging,
  selected = false, busy = false, disabled = false,
  categoryMeta, typeByCategory, laneTones, appColors, style = {},
}) {
  const rec = normalizeRecord(record || {});
  const lane = status || rec.status || "Yet to start";

  if (preset === "approval") {
    return (
      <ApprovalCard
        row={{ id: rec.id, owner: rec.requestedBy, category: rec.category, group: rec.requestedFor, status: lane, date: rec.date }}
        onView={onView}
        onQuickReject={disabled ? undefined : () => onReject && onReject({ remark: "" })}
        highlight={selected}
        categoryMeta={categoryMeta}
        typeByCategory={typeByCategory || (rec.category && rec.requestType ? { [rec.category]: rec.requestType } : undefined)}
      />
    );
  }

  if (preset === "task") {
    return (
      <TaskCard
        card={{
          id: rec.id, requestType: rec.requestType, requestedBy: rec.requestedBy, requestedFor: rec.requestedFor,
          app: rec.app as any, assignee: nameOf(rec.assignee) || undefined,
          assignees: (rec.assignees || []).map(nameOf).filter(Boolean) as string[],
          assignedOn: rec.assignedOn, startedOn: rec.startedOn, dueSince: rec.dueSince, effort: rec.effort as any,
        }}
        lane={lane}
        selected={selected}
        onView={onView}
        onQuickComplete={disabled ? undefined : onComplete}
        onStartLogging={disabled ? undefined : (onStartLogging ? () => onStartLogging(rec) : undefined)}
        onStopLogging={disabled ? undefined : (onStopLogging ? (_c: any, notes: string) => onStopLogging(rec, notes) : undefined)}
        laneTones={laneTones}
        appColors={appColors}
      />
    );
  }

  return (
    <KanbanCard
      status={lane as any}
      app={rec.app as any}
      showStatus={showStatus}
      requestType={rec.requestType}
      id={rec.id}
      date={rec.date}
      requestedBy={rec.requestedBy}
      requestedFor={rec.requestedFor}
      priority={rec.priority}
      assignee={rec.assignee as any}
      assignedOn={rec.assignedOn}
      startedOn={rec.startedOn}
      dueSince={rec.dueSince}
      completedOn={rec.completedOn}
      days={rec.days}
      rejectedBy={rec.rejectedBy as any}
      assignees={(people || rec.assignees) as any}
      onApprove={onApprove}
      onReject={onReject}
      onClick={onView}
      selected={selected}
      busy={busy}
      disabled={disabled}
      style={style}
    />
  );
}

/* A single record has no "empty" — but a board or grid needs to render
   placeholders through the same component it renders records with, so
   loading and error are part of the contract. */
export function RecordCard(props) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !props.loading && !props.error && !props.record,
    empty: props.empty, shape: "card", height: 168,
    emptyIcon: "ph-file-dashed", emptyTitle: "No record",
  });
  if (state !== false) return <div style={{ width: "100%", ...(props.style || {}) }}>{state}</div>;
  return <RecordCardBody {...props} />;
}
