import React, { useState, useEffect } from "react";
import { Button } from "../core/Button.tsx";
import { IconButton } from "../core/IconButton.tsx";
import { Avatar } from "../core/Avatar.tsx";
import { Badge } from "../core/Badge.tsx";
import { StatusChip } from "../data/StatusChip.tsx";
import { Tabs } from "../navigation/Tabs.tsx";
import { Modal } from "../feedback/Modal.tsx";
import { Textarea } from "../forms/Textarea.tsx";
import { RichTextEditor } from "../forms/RichTextEditor.tsx";
import { DatePicker } from "../forms/DatePicker.tsx";
import { ApprovalStepper } from "./ApprovalStepper.tsx";
import { AuditTrail } from "./AuditTrail.tsx";
import { DocumentPreview } from "./DocumentPreview.tsx";

/* ── Types (mirrored in RequestDetailModal.d.ts) ── */
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
  /** Show the expand-to-full-page toggle in the title bar. @default true */
  expandable?: boolean;
  /** Open already expanded to full page. @default false */
  defaultExpanded?: boolean;
  /** Essential-details section expanded on open. @default true */
  defaultEssentialsOpen?: boolean;
  /** Custom inline summary shown in the collapsed Essential-details header.
   *  Defaults to raised-by · divider · project. */
  essentialsSummary?: React.ReactNode;
  /** Audit pane open by default. @default true */
  defaultAuditOpen?: boolean;
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


/**
 * AgniUI · RequestDetailModal
 * Full-record "View request" dialog for approval workflows. A wide two-pane
 * shell: a scrollable detail column (essential fields · workflow stepper ·
 * tabbed sections · document repository) beside a collapsible audit-trail pane.
 * Reviewers approve or reject from the footer; the action is confirmed in a
 * second dialog that captures remarks (mandatory on rejection).
 *
 * Drives three resolution states from `record.status`:
 *   "Pending" / "In Review" → actionable (Approve · Reject in the footer)
 *   "Approved"              → resolved banner, no actions
 *   "Rejected"             → resolved banner with the rejection remark
 */
const FIELD_LABEL = {
  fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)",
  textTransform: "uppercase", color: "var(--text-tertiary)", lineHeight: 1.2,
};
const FIELD_VALUE = { fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", marginTop: 5, lineHeight: "var(--leading-snug)" };

function EssentialField({ label, children, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <span style={FIELD_LABEL}>{label}</span>
      <span style={{ ...FIELD_VALUE, fontFamily: mono ? "var(--font-data)" : "var(--font-sans)", fontWeight: mono ? "var(--fw-regular)" : "var(--fw-medium)" }}>{children}</span>
    </div>
  );
}

/* Eyebrow-label / value grid — mirrors the essential-details rhythm so every
   tab reads consistently (label: 11px uppercase eyebrow, value: 13px below). */
function DetailGrid({ rows, columns = 3 }) {
  if (!rows || !rows.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: "18px 20px" }}>
      {rows.map((r, i) => <EssentialField key={i} label={r.label}>{r.value}</EssentialField>)}
    </div>
  );
}

/* ── Confirmation dialog — remarks mandatory for rejection ─────────── */
function ActionConfirm({ action, record, onCancel, onConfirm }) {
  const [remark, setRemark] = useState("");
  const [tried, setTried] = useState(false);
  useEffect(() => { setRemark(""); setTried(false); }, [action]);
  if (!action) return null;

  const reject = action === "reject";
  const complete = action === "complete";
  const missing = reject && !remark.trim();
  const submit = () => { setTried(true); if (missing) return; onConfirm(action, remark.trim()); };
  const title = reject ? "Reject request" : complete ? "Mark task as completed" : "Approve request";

  return (
    <Modal open={!!action} onClose={onCancel} danger={reject} size="md"
      title={title}
      footer={<>
        <Button category="secondary" onClick={onCancel}>Cancel</Button>
        <Button category={reject ? "danger" : "primary"} icon={<i className={"ph " + (reject ? "ph-x-circle" : "ph-check-circle")} />} onClick={submit}>
          {reject ? "Reject request" : complete ? "Mark completed" : "Approve request"}
        </Button>
      </>}>
      <p style={{ margin: "0 0 14px", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }}>
        {reject
          ? <>This returns <strong style={{ color: "var(--text-primary)" }}>{record.id}</strong> to the requester. Add a reason so they know what to fix — this is recorded in the audit trail.</>
          : complete
          ? <>This marks <strong style={{ color: "var(--text-primary)" }}>{record.id}</strong> as completed and closes the task. Logged effort is kept on the record — add a closing note if there is anything reviewers should know.</>
          : <>This approves <strong style={{ color: "var(--text-primary)" }}>{record.id}</strong> and advances it to the next stage. Add a note if there is anything the next approver should know.</>}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-secondary)" }}>
            {reject ? "Reason for rejection" : complete ? "Closing note" : "Remarks"}
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: reject ? "var(--status-error)" : "var(--text-tertiary)", fontWeight: reject ? "var(--fw-semibold)" : "var(--fw-regular)" }}>
            {reject ? "Required" : "Optional"}
          </span>
        </span>
        <Textarea value={remark} onChange={setRemark} rows={3} error={tried && missing}
          placeholder={reject ? "e.g. Cost centre missing — re-submit with the budget code." : complete ? "e.g. Fit checks passed — handed over to QA." : "e.g. Approved against Q3 capex. Expedite procurement."} />
        {tried && missing && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--status-error)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <i className="ph-fill ph-warning-circle" /> A reason is required to reject a request.
          </span>
        )}
      </div>
    </Modal>
  );
}

export function RequestDetailModal({ open, record, onClose, onAction, onComplete, onLogEffort, columns = 3, defaultAuditOpen = true, expandable = true, defaultExpanded = false, defaultEssentialsOpen = true, essentialsSummary, style = {}, containerStyle = {} }: RequestDetailModalProps) {
  const cols = Number(columns) === 2 ? 2 : 3;
  const [tab, setTab] = useState("basic");
  const [full, setFull] = useState(!!defaultExpanded);
  const [essOpen, setEssOpen] = useState(defaultEssentialsOpen !== false);
  const [rightPane, setRightPane] = useState(defaultAuditOpen ? "audit" : null);   // 'audit' | 'effort' | null
  const [confirm, setConfirm] = useState(null);   // 'approve' | 'reject' | null
  const [effortEntries, setEffortEntries] = useState([]);
  const [narrow, setNarrow] = useState(typeof window !== "undefined" && window.innerWidth < 760);

  /* Track narrow viewports so side panes overlay instead of squeezing the body. */
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 760);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTab("basic");
    setFull(!!defaultExpanded);
    setEssOpen(defaultEssentialsOpen !== false);
    setRightPane(defaultAuditOpen ? "audit" : null);
    setConfirm(null);
  }, [open, record && record.id]);
  /* Reload the effort ledger whenever the record (or its effort) changes —
     keyed on the effort reference so swapping the record prop in place works. */
  useEffect(() => {
    setEffortEntries((record && record.effort && record.effort.entries) || []);
  }, [record && record.id, record && record.effort]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape" && !confirm) onClose && onClose(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, confirm, onClose]);

  if (!open || !record) return null;

  const actionable = record.status === "Pending" || record.status === "In Review" || record.status === "Awaiting Approval";
  const completable = !!onComplete && (record.status === "Yet to start" || record.status === "In Progress" || record.status === "Overdue");
  const resolved = record.resolution;   // { state:'Approved'|'Rejected', by, on, remark }
  const docs = record.documents || [];
  const canLogEffort = !!(record.effort && record.effort.canLog);
  const effortAssignees = (record.effort && record.effort.assignees) || [];
  const pane = rightPane === "effort" && !canLogEffort ? "audit" : rightPane;

  const TABS = [
    { key: "basic",      label: "Basic details",      icon: "ph-info" },
    { key: "assignment", label: "Assignment",         icon: "ph-user-switch" },
    { key: "execution",  label: "Execution",          icon: "ph-gear" },
  ];

  const handleConfirm = (action, remark) => {
    setConfirm(null);
    if (action === "complete") { onComplete && onComplete(remark); return; }
    onAction && onAction(action, remark);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: "var(--z-modal)", background: "var(--modal-scrim)", backdropFilter: "blur(2px)",
      display: "flex", alignItems: full ? "stretch" : "flex-end", justifyContent: "center", fontFamily: "var(--font-sans)",
      animation: "agni-fade-in var(--dur-fast) ease-out", ...containerStyle,
    }}>
      <div role="dialog" aria-modal="true" aria-label={"Request " + record.id} onClick={(e) => e.stopPropagation()} style={{
        position: "relative", width: "100%", maxWidth: full ? "none" : 1040, height: full ? "100vh" : "min(900px, calc(100vh - 24px))", display: "flex", flexDirection: "column",
        background: "var(--surface-card)", border: full ? "none" : "1px solid var(--border-default)", borderBottom: "none",
        borderTopLeftRadius: full ? 0 : "var(--sheet-radius)", borderTopRightRadius: full ? 0 : "var(--sheet-radius)",
        boxShadow: "var(--shadow-2xl)", overflow: "hidden", animation: "agni-sheet-up var(--dur-normal) var(--ease-emphasized)", ...style,
      }}>
        {/* ── Title bar — request type · status · audit toggle · close ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px 14px 20px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "var(--radius-md)", background: "var(--surface-brand-soft)", color: "var(--text-brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="ph-fill ph-file-text" />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{record.requestType || "Request"}</span>
              <StatusChip status={record.status} size="sm" />
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-data)", marginTop: 2 }}>{record.id}</div>
          </div>
          <PaneToggle icon="ph-clock-counter-clockwise" label="Activity log" iconOnly={narrow} active={pane === "audit"}
            title={pane === "audit" ? "Hide activity log" : "Show activity log"}
            onClick={() => setRightPane((v) => (v === "audit" ? null : "audit"))} />
          {canLogEffort && (
            <PaneToggle icon="ph-timer" label="Effort log" iconOnly={narrow} active={pane === "effort"}
              title="Log time effort for this task"
              onClick={() => setRightPane((v) => (v === "effort" ? null : "effort"))} />
          )}
          {expandable && (
            <IconButton size="sm" variant="ghost" title={full ? "Exit full page" : "Expand to full page"} onClick={() => setFull((v) => !v)} icon={<i className={full ? "ph ph-corners-in" : "ph ph-corners-out"} />} />
          )}
          <IconButton size="sm" variant="ghost" title="Close" onClick={onClose} icon={<i className="ph ph-x" />} />
        </div>

        {/* ── Body — detail column + audit pane ── */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}>
          {/* Detail column */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Essential details — named, collapsible section. flexShrink:0 keeps it
                 from being crushed when the tab content below is very long. */}
              <section style={{ background: "var(--surface-soft)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", flexShrink: 0 }}>
                <button type="button" onClick={() => setEssOpen((v) => !v)} aria-expanded={essOpen}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left" }}>
                  <span style={FIELD_LABEL}>Essential details</span>
                  {!essOpen && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1, justifyContent: "flex-end" }}>
                      {essentialsSummary != null ? essentialsSummary : (
                        <React.Fragment>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "var(--text-sm)", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden" }}><Avatar name={record.raisedBy || ""} size="xs" />{record.raisedBy || "—"}</span>
                          <span style={{ width: 1, height: 16, background: "var(--border-default)", flexShrink: 0 }} />
                          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{record.project || record.requestType || "—"}</span>
                        </React.Fragment>
                      )}
                    </span>
                  )}
                  {essOpen && <span style={{ flex: 1 }} />}
                  <i className="ph ph-caret-down" style={{ fontSize: 14, color: "var(--text-tertiary)", flexShrink: 0, transform: essOpen ? "rotate(180deg)" : "none", transition: "transform var(--dur-fast)" }} />
                </button>
                {essOpen && (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: "16px 20px", padding: "4px 18px 16px" }}>
                  <EssentialField label="Request ID" mono>{record.id}</EssentialField>
                  <EssentialField label="Raised by">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                      <Avatar name={record.raisedBy || ""} size="xs" />{record.raisedBy || "—"}
                    </span>
                  </EssentialField>
                  <EssentialField label="Raised on" mono>{record.raisedOn || "—"}</EssentialField>
                  <EssentialField label="Type">{record.requestType || "—"}</EssentialField>
                  <EssentialField label="Status"><StatusChip status={record.status} size="sm" /></EssentialField>
                  <EssentialField label="Project">{record.project || "—"}</EssentialField>
                </div>
                )}
              </section>

              {/* Workflow */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Approval workflow</span>
                  <span style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                  <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-tertiary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <i className="ph ph-cursor-click" /> Hover a stage for details
                  </span>
                </div>
                <div style={{ paddingTop: 6, paddingBottom: 2 }}>
                  <ApprovalStepper interactive steps={record.workflow || []} />
                </div>
              </section>

              {/* Tabs + document repository toggle */}
              <section style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--border-subtle)" }}>
                  <Tabs size="sm" tabs={TABS} value={tab === "docs" ? "" : tab} onChange={setTab} style={{ border: "none", flex: 1 }} />
                  <button type="button" onClick={() => setTab("docs")} title="Document repository"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer",
                      padding: "8px 10px", marginBottom: -1, borderBottom: "2px solid " + (tab === "docs" ? "var(--action-brand)" : "transparent"),
                      color: tab === "docs" ? "var(--text-brand)" : "var(--text-tertiary)", fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-sm)", fontWeight: tab === "docs" ? "var(--fw-semibold)" : "var(--fw-medium)",
                    }}>
                    <i className="ph ph-folders" style={{ fontSize: 16 }} />
                    {docs.length > 0 && <span style={{ fontSize: "var(--text-2xs)", fontFamily: "var(--font-data)", fontWeight: "var(--fw-semibold)", padding: "1px 6px", borderRadius: "var(--radius-full)", background: tab === "docs" ? "var(--surface-brand-soft)" : "var(--surface-sunken)" }}>{docs.length}</span>}
                  </button>
                </div>

                <div style={{ paddingTop: 16 }}>
                  {tab === "basic" && <DetailGrid rows={record.basics} columns={cols} />}
                  {tab === "assignment" && <DetailGrid rows={record.assignment} columns={cols} />}
                  {tab === "execution" && <DetailGrid rows={record.execution} columns={cols} />}
                  {tab === "docs" && (
                    docs.length ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                        {docs.map((d, i) => <DocumentPreview key={i} name={d.name} type={d.type} meta={d.meta} onView={() => {}} onDownload={() => {}} />)}
                      </div>
                    ) : (
                      <div style={{ padding: "28px 0", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                        <i className="ph ph-folder-dashed" style={{ fontSize: 26, display: "block", marginBottom: 8 }} />
                        No documents attached to this request.
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>

            {/* Footer — actions or resolution banner */}
            <div style={{ flexShrink: 0, borderTop: "1px solid var(--border-default)", padding: "12px 20px", background: "var(--modal-bg)" }}>
              {actionable ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ flex: 1, fontSize: "var(--text-xs)", color: "var(--text-tertiary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i className="ph ph-shield-check" style={{ fontSize: 15 }} /> Your decision is recorded against this request.
                  </span>
                  <Button category="secondary" icon={<i className="ph ph-x-circle" />} style={{ color: "var(--status-error)", border: "1px solid var(--status-error)" }} onClick={() => setConfirm("reject")}>Reject</Button>
                  <Button category="primary" icon={<i className="ph ph-check-circle" />} onClick={() => setConfirm("approve")}>Approve</Button>
                </div>
              ) : completable ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                    <ResolutionBanner status={record.status} resolution={resolved} />
                  </div>
                  {canLogEffort && (
                    <Button category="secondary" icon={<i className="ph ph-timer" />} onClick={() => setRightPane("effort")}>Log effort</Button>
                  )}
                  <Button category="primary" icon={<i className="ph ph-check-circle" />} onClick={() => setConfirm("complete")}>Mark as completed</Button>
                </div>
              ) : (
                <ResolutionBanner status={record.status} resolution={resolved} />
              )}
            </div>
          </div>

          {/* Audit pane */}
          {pane === "audit" && (
            <aside style={{ width: narrow ? "100%" : 372, flexShrink: 0, borderLeft: narrow ? "none" : "1px solid var(--border-subtle)", background: "var(--surface-soft)", display: "flex", flexDirection: "column", minHeight: 0, ...(narrow ? { position: "absolute", inset: 0, zIndex: 5 } : {}) }}>
              <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="ph ph-clock-counter-clockwise" style={{ fontSize: 16 }} /> Audit trail
                </span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 18px" }}>
                <AuditTrail entries={record.audit || []} />
              </div>
            </aside>
          )}

          {/* Effort log pane — assignees log time against an assigned task */}
          {pane === "effort" && canLogEffort && (
            <EffortPanel entries={effortEntries} assignees={effortAssignees} narrow={narrow}
              onAdd={(entry) => { setEffortEntries((p) => [entry, ...p]); onLogEffort && onLogEffort(entry); }}
              onDelete={(idx) => setEffortEntries((p) => p.filter((_, i) => i !== idx))}
              onEditNote={(idx, note) => setEffortEntries((p) => p.map((e, i) => i === idx ? { ...e, note } : e))} />
          )}
        </div>
      </div>

      <ActionConfirm action={confirm} record={record} onCancel={() => setConfirm(null)} onConfirm={handleConfirm} />
      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-sheet-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes agni-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </div>
  );
}

/* ── Title-bar pane toggle (Activity log / Effort log) ───────────── */
function PaneToggle({ icon, label, active, title, onClick, iconOnly }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={label} style={{
      display: "inline-flex", alignItems: "center", gap: iconOnly ? 0 : 6, height: 32, width: iconOnly ? 32 : "auto", padding: iconOnly ? 0 : "0 11px", justifyContent: "center", borderRadius: "var(--radius-md)", cursor: "pointer",
      fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)", whiteSpace: "nowrap", flexShrink: 0,
      border: "1px solid " + (active ? "var(--action-brand)" : "var(--border-default)"),
      background: active ? "var(--surface-brand-soft)" : "transparent",
      color: active ? "var(--text-brand)" : "var(--text-secondary)",
      transition: "background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast)",
    }}>
      <i className={"ph " + icon} style={{ fontSize: 16 }} /> {iconOnly ? null : label}
    </button>
  );
}

/* ── Effort log pane ─────────────────────────────────────────────
   Lets the assignee(s) of an approved + assigned task record time
   spent: a start/end date-time form that computes hours, and the
   ledger of entries logged so far (who · window · when). */
function parseDT(date, time) {
  if (!date || !time) return null;
  const d = new Date(date + "T" + time);
  return isNaN(d.getTime()) ? null : d;
}
function fmtDT(d) {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const p = (n) => String(n).padStart(2, "0");
  return p(d.getDate()) + " " + M[d.getMonth()] + " " + d.getFullYear() + ", " + p(d.getHours()) + ":" + p(d.getMinutes());
}
function fmtHours(h) {
  if (h == null) return "—";
  const r = Math.round(h * 100) / 100;
  return (Number.isInteger(r) ? r : r.toFixed(2)) + " h";
}

/* ── 24-hour time field (HH:MM) ──────────────────────────────────────── */
function TimeField24({ value, disabled, onChange, style }) {
  const parts = (value || "00:00").split(":");
  const hh = Math.max(0, Math.min(23, parseInt(parts[0]) || 0));
  const mm = Math.max(0, Math.min(59, parseInt(parts[1]) || 0));
  const pad2 = (n) => String(n).padStart(2, "0");
  const emit = (nh, nm) => onChange && onChange(pad2(nh) + ":" + pad2(nm));
  const numSty = {
    width: 32, textAlign: "center", border: "none", outline: "none", background: "transparent",
    fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)",
    color: disabled ? "var(--text-secondary)" : "var(--text-primary)",
    padding: 0, MozAppearance: "textfield", WebkitAppearance: "none", appearance: "textfield",
    cursor: disabled ? "not-allowed" : "text",
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1,
      padding: "6px 9px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
      background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      boxSizing: "border-box", width: "100%", ...style }}>
      <input type="number" min={0} max={23} value={hh} disabled={disabled}
        onFocus={(e) => e.target.select()}
        onChange={(e) => emit(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)), mm)}
        style={numSty} />
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", userSelect: "none", lineHeight: 1 }}>:</span>
      <input type="number" min={0} max={59} value={mm} disabled={disabled}
        onFocus={(e) => e.target.select()}
        onChange={(e) => emit(hh, Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
        style={numSty} />
    </div>
  );
}

/* ── Collapsible section used by the Effort log pane ─────────────── */
function EffortSection({ icon, title, open, onToggle, meta, children, fillHeight }) {
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", ...(fillHeight ? { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 } : {}) }}>
      <button type="button" onClick={onToggle} aria-expanded={open} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", border: "none",
        background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left", flexShrink: 0,
      }}>
        <i className={"ph " + icon} style={{ fontSize: 16, color: "var(--text-secondary)" }} />
        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{title}</span>
        <span style={{ flex: 1 }} />
        {meta}
        <i className="ph ph-caret-down" style={{ fontSize: 14, color: "var(--text-tertiary)", transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur-fast)" }} />
      </button>
      {open && <div style={{ padding: "2px 14px 14px", ...(fillHeight ? { flex: 1, overflowY: "auto", minHeight: 0 } : {}) }}>{children}</div>}
    </div>
  );
}

function EffortPanel({ entries, assignees, onAdd, onDelete, onEditNote, narrow }) {
  const pad2 = (n) => String(n).padStart(2, "0");
  const dVal = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  const tVal = (d) => pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  const today = new Date().toISOString().slice(0, 10);
  /* Convert a "YYYY-MM-DD" string to a local-midnight Date for DatePicker. */
  const strToDate = (s) => {
    if (!s) return null;
    const p = s.split("-");
    return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
  };
  const [sd, setSd] = useState(today);
  const [st, setSt] = useState("09:00");
  const [ed, setEd] = useState(today);
  const [et, setEt] = useState("12:00");
  const [by, setBy] = useState(assignees[0] || "");
  const [note, setNote] = useState("");
  const [timer, setTimer] = useState("idle");
  const [startedAt, setStartedAt] = useState(null);
  const [stoppedAt, setStoppedAt] = useState(null);
  const [noteModal, setNoteModal] = useState(null);   // index of entry being edited
  const [noteDraft, setNoteDraft] = useState("");
  const [activeSection, setActiveSection] = useState("form"); // "form" | "ledger" | null — mutual exclusion
  const [noteKey, setNoteKey] = useState(0);           // remounts the rich-text editor after a log
  const [, tick] = useState(0);

  /* Notes are HTML now (RichTextEditor) — treat empty markup as no note. */
  const noteHasText = (html) => !!html && html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;

  useEffect(() => {
    if (timer !== "running") return;
    const h = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(h);
  }, [timer]);

  const handleStart = () => {
    if (timer === "running") return;
    const now = new Date();
    setSd(dVal(now)); setSt(tVal(now));
    setStartedAt(now); setStoppedAt(null);
    setTimer("running");
  };
  const handleStop = () => {
    if (timer !== "running") return;
    const now = new Date();
    setEd(dVal(now)); setEt(tVal(now));
    setStoppedAt(now);
    setTimer("stopped");
  };
  const resetTimer = () => {
    setTimer("idle"); setStartedAt(null); setStoppedAt(null);
    setSd(today); setSt("09:00"); setEd(today); setEt("12:00");
  };

  /* End-field change handlers — manual edit while running stops the timer. */
  const handleEndDateChange = (date) => {
    if (!date) return;
    const v = dVal(date);
    setEd(v);
    if (timer === "running") { setStoppedAt(parseDT(v, et) || new Date()); setTimer("stopped"); }
  };
  const handleEndTimeChange = (v) => {
    setEt(v);
    if (timer === "running") { setStoppedAt(parseDT(ed, v) || new Date()); setTimer("stopped"); }
  };

  const start = parseDT(sd, st);
  const end   = parseDT(ed, et);
  const precise = startedAt && stoppedAt ? (stoppedAt.getTime() - startedAt.getTime()) / 3600000 : null;
  const hrs = timer === "stopped" && precise != null ? precise
    : start && end ? (end.getTime() - start.getTime()) / 3600000 : null;
  const running  = timer === "running";
  const elapsedMs = running && startedAt ? Math.max(0, Date.now() - startedAt.getTime()) : 0;
  const invalid  = running || hrs == null || hrs <= 0;
  const canLog   = !running && hrs != null && hrs > 0 && !!by;
  const total    = entries.reduce((a, e) => a + (e.hours || 0), 0);
  const fmtElapsed = (ms) => {
    const s = Math.floor(ms / 1000);
    return pad2(Math.floor(s / 3600)) + ":" + pad2(Math.floor((s % 3600) / 60)) + ":" + pad2(s % 60);
  };

  const submit = () => {
    if (!canLog) return;
    const sD = startedAt || start, eD = stoppedAt || end;
    onAdd({ by, note: noteHasText(note) ? note : "", startLabel: fmtDT(sD), endLabel: fmtDT(eD), hours: Math.round(hrs * 100) / 100, loggedOn: fmtDT(new Date()) });
    setNote(""); setNoteKey((k) => k + 1); resetTimer();
  };

  /* state-driven locks: start freezes on Start; end freezes on Stop */
  const startFrozen = timer !== "idle";
  const endFrozen   = false; // end always editable; manual change while running stops the timer
  const frozen = { background: "var(--surface-sunken)", color: "var(--text-secondary)", cursor: "not-allowed" };
  const fLbl = { fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", lineHeight: 1.2, marginBottom: 5, display: "block" };
  const inp  = { width: "100%", boxSizing: "border-box", padding: "7px 9px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-primary)", outline: "none", colorScheme: "light dark" };

  /* Duration box theme per state */
  const durBg  = running ? "var(--surface-brand-soft)" : (invalid ? "var(--surface-sunken)"    : "var(--status-success-soft)");
  const durBdr = running ? "var(--action-brand)"       : (invalid ? "var(--border-subtle)"      : "var(--status-success)");
  const durIco = running ? "ph-timer"                  : (invalid ? "ph-hourglass"               : "ph-check-circle");
  const durClr = running ? "var(--text-brand)"         : (invalid ? "var(--text-tertiary)"       : "var(--status-success)");

  return (
    <aside style={{ width: narrow ? "100%" : 372, flexShrink: 0, borderLeft: narrow ? "none" : "1px solid var(--border-subtle)", background: "var(--surface-soft)", display: "flex", flexDirection: "column", minHeight: 0, position: "relative", ...(narrow ? { position: "absolute", inset: 0, zIndex: 5 } : {}) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <i className="ph ph-timer" style={{ fontSize: 16 }} /> Effort log
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "14px 16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Log effort — collapsible form accordion */}
        <EffortSection icon="ph-timer" title="Log effort" open={activeSection === "form"} onToggle={() => setActiveSection((v) => v === "form" ? null : "form")} fillHeight={activeSection === "form"}>

          {/* Timer row — single Start/Stop toggle button */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingTop: 2 }}>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Timer</span>
            <button type="button"
              title={running ? "Stop timer — stamps the end date & time" : "Start timer — stamps the start date & time"}
              onClick={running ? handleStop : handleStart}
              onMouseEnter={(e) => { e.currentTarget.style.background = running ? "var(--status-error)" : "var(--action-brand)"; e.currentTarget.style.color = "var(--text-on-brand)"; e.currentTarget.style.borderColor = running ? "var(--status-error)" : "var(--action-brand)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = running ? "var(--status-error-soft)" : "var(--surface-brand-soft)"; e.currentTarget.style.color = running ? "var(--status-error)" : "var(--text-brand)"; e.currentTarget.style.borderColor = running ? "var(--status-error)" : "var(--action-brand)"; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; e.currentTarget.style.opacity = "0.8"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.opacity = "1"; }}
              style={{
                marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
                height: 30, padding: "0 14px", borderRadius: "var(--radius-md)", cursor: "pointer",
                fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", whiteSpace: "nowrap",
                border: "1px solid " + (running ? "var(--status-error)" : "var(--action-brand)"),
                background: running ? "var(--status-error-soft)" : "var(--surface-brand-soft)",
                color: running ? "var(--status-error)" : "var(--text-brand)",
                transition: "background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast), transform var(--dur-fast)",
              }}>
              <i className={"ph " + (running ? "ph-stop" : "ph-play")} style={{ fontSize: 13 }} />
              {running ? "Stop" : "Start"}
            </button>
          </div>

          <div style={{ marginBottom: 11 }}>
            <span style={fLbl}>Start</span>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 7 }}>
              <DatePicker value={strToDate(sd)} disabled={startFrozen} max={strToDate(ed)} size="sm"
                onChange={(d) => d && setSd(dVal(d))} style={{ width: "100%" }} />
              <TimeField24 value={st} disabled={startFrozen} onChange={setSt} />
            </div>
          </div>

          <div style={{ marginBottom: 11 }}>
            <span style={fLbl}>End</span>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 7 }}>
              <DatePicker value={strToDate(ed)} min={strToDate(sd)} size="sm"
                onChange={handleEndDateChange} style={{ width: "100%" }} />
              <TimeField24 value={et} onChange={handleEndTimeChange} />
            </div>
          </div>

          {assignees.length > 1 && (
            <div style={{ marginBottom: 11 }}>
              <span style={fLbl}>Logged by</span>
              <select value={by} onChange={(e) => setBy(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          {/* Duration — ticks live when running */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: "var(--radius-md)", marginBottom: 12, background: durBg, border: "1px solid " + durBdr }}>
            <i className={"ph " + durIco} style={{ fontSize: 16, color: durClr }} />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Duration</span>
            {running && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--status-success)", flexShrink: 0, animation: "agni-pulse 1.2s ease-in-out infinite" }} />}
            <span style={{ marginLeft: "auto", whiteSpace: "nowrap", fontFamily: "var(--font-data)", fontWeight: "var(--fw-bold)", fontSize: running ? "var(--text-lg)" : "var(--text-md)", letterSpacing: running ? "0.04em" : 0, color: running ? "var(--text-brand)" : (invalid ? "var(--text-tertiary)" : "var(--text-primary)") }}>
              {running ? fmtElapsed(elapsedMs) : (invalid ? (hrs != null && hrs <= 0 ? "End \u2264 start" : "\u2014") : fmtHours(hrs))}
            </span>
          </div>

          {/* Notes — optional rich text, carried into the ledger card */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ ...fLbl, marginBottom: 6 }}>Notes <span style={{ fontWeight:"var(--fw-regular)", textTransform:"none", letterSpacing:0, color:"var(--text-quaternary)" }}>(optional)</span></span>
            <RichTextEditor key={noteKey} value={note} onChange={setNote} minHeight={80} placeholder="Add context, blockers or remarks…" />
          </div>

          <Button category="primary" size="sm" icon={<i className="ph ph-plus" />} disabled={!canLog} onClick={submit} style={{ width: "100%" }}>Log effort</Button>
        </EffortSection>

        {/* Logged effort — collapsible ledger accordion · total lives here, collapsed by default */}
        <EffortSection icon="ph-list-checks" title="Logged effort" open={activeSection === "ledger"} onToggle={() => setActiveSection((v) => v === "ledger" ? null : "ledger")} fillHeight={activeSection === "ledger"}
          meta={<React.Fragment>
            <span style={{ fontSize: "var(--text-2xs)", fontFamily: "var(--font-data)", color: "var(--text-tertiary)" }}>{entries.length}</span>
            <span style={{ fontSize: "var(--text-2xs)", fontFamily: "var(--font-data)", fontWeight: "var(--fw-semibold)", color: "var(--text-brand)", background: "var(--surface-brand-soft)", borderRadius: "var(--radius-full)", padding: "2px 9px" }}>{fmtHours(total)} total</span>
          </React.Fragment>}>

        {entries.length === 0 ? (
          <div style={{ padding: "22px 0", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>
            <i className="ph ph-timer" style={{ fontSize: 24, display: "block", marginBottom: 7 }} />
            No effort logged yet. Use the form above to add the first entry.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {entries.map((e, i) => (
              <div key={i} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {/* Card body */}
                <div style={{ padding: "11px 12px" }}>
                  {/* Assignee + hours + delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Avatar name={e.by || ""} size="xs" />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.by}</span>
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontFamily: "var(--font-data)", fontWeight: "var(--fw-bold)", color: "var(--text-brand)", background: "var(--surface-brand-soft)", borderRadius: "var(--radius-full)", padding: "2px 9px", flexShrink: 0, whiteSpace: "nowrap" }}>{fmtHours(e.hours)}</span>
                    <button type="button" title="Delete this entry" onClick={() => onDelete && onDelete(i)}
                      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:24, height:24, borderRadius:"var(--radius-sm)", border:"none", background:"transparent", cursor:"pointer", color:"var(--text-tertiary)", flexShrink:0, transition:"color var(--dur-fast), background var(--dur-fast)" }}
                      onMouseEnter={(ev)=>{ev.currentTarget.style.color="var(--status-error)";ev.currentTarget.style.background="var(--status-error-soft)"; }}
                      onMouseLeave={(ev)=>{ev.currentTarget.style.color="var(--text-tertiary)";ev.currentTarget.style.background="transparent"; }}>
                      <i className="ph ph-trash" style={{ fontSize: 14 }} />
                    </button>
                  </div>
                  {/* Start → End stacked */}
                  <div style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: "3px 7px", alignItems: "center", fontSize: "var(--text-xs)", fontFamily: "var(--font-data)", color: "var(--text-secondary)", marginBottom: 6 }}>
                    <i className="ph ph-play-circle" style={{ fontSize: 13, color: "var(--text-tertiary)" }} />
                    <span><span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", marginRight: 5 }}>Start</span>{e.startLabel}</span>
                    <i className="ph ph-stop-circle" style={{ fontSize: 13, color: "var(--text-tertiary)" }} />
                    <span><span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", marginRight: 5 }}>End</span>{e.endLabel}</span>
                  </div>
                  {/* Logged on + add-note icon (no note yet) */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "var(--text-2xs)", color: "var(--text-tertiary)" }}>
                    <i className="ph ph-clock" style={{ fontSize: 12 }} />
                    <span>Logged on {e.loggedOn}</span>
                    {!e.note && (
                      <button type="button" title="Add a note" onClick={() => { setNoteModal(i); setNoteDraft(""); }}
                        style={{ marginLeft: "auto", display:"inline-flex", alignItems:"center", gap:4, border:"none", background:"transparent", cursor:"pointer", color:"var(--text-tertiary)", fontSize:"var(--text-2xs)", padding:"2px 4px", borderRadius:"var(--radius-sm)", transition:"color var(--dur-fast)" }}
                        onMouseEnter={(ev)=>ev.currentTarget.style.color="var(--text-brand)"}
                        onMouseLeave={(ev)=>ev.currentTarget.style.color="var(--text-tertiary)"}>
                        <i className="ph ph-note-pencil" style={{ fontSize: 13 }} /> Add note
                      </button>
                    )}
                  </div>
                </div>
                {/* With-note variant: separator + note text */}
                {e.note && (
                  <>
                    <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 12px" }} />
                    <div style={{ padding: "8px 12px", display:"flex", alignItems:"flex-start", gap:7 }}>
                      <i className="ph ph-note" style={{ fontSize: 13, color: "var(--text-brand)", flexShrink:0, marginTop:2 }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)", flex:1, minWidth:0, overflowWrap:"anywhere" }} dangerouslySetInnerHTML={{ __html: e.note }} />
                      <button type="button" title="Edit note" onClick={() => { setNoteModal(i); setNoteDraft(e.note); }}
                        style={{ display:"inline-flex", border:"none", background:"transparent", cursor:"pointer", color:"var(--text-tertiary)", padding:2, borderRadius:"var(--radius-sm)", flexShrink:0, transition:"color var(--dur-fast)" }}
                        onMouseEnter={(ev)=>ev.currentTarget.style.color="var(--text-brand)"}
                        onMouseLeave={(ev)=>ev.currentTarget.style.color="var(--text-tertiary)"}>
                        <i className="ph ph-pencil-simple" style={{ fontSize: 12 }} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        </EffortSection>
      </div>

      {/* Note editor modal — opens when user clicks "Add note" or "Edit note" */}
      {noteModal !== null && (
        <div style={{ position:"absolute", inset:0, zIndex:20, display:"flex", flexDirection:"column", justifyContent:"flex-end", background:"rgba(0,0,0,0.32)", backdropFilter:"blur(2px)" }}
          onClick={(ev) => { if (ev.target === ev.currentTarget) setNoteModal(null); }}>
          <div style={{ background:"var(--surface-card)", borderRadius:"var(--radius-lg) var(--radius-lg) 0 0", padding:"18px 16px 24px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <i className="ph ph-note-pencil" style={{ fontSize:18, color:"var(--text-brand)" }} />
              <span style={{ fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>
                {entries[noteModal] && entries[noteModal].note ? "Edit note" : "Add note"}
              </span>
              <button type="button" onClick={() => setNoteModal(null)} title="Cancel"
                style={{ marginLeft:"auto", display:"inline-flex", border:"none", background:"transparent", cursor:"pointer", color:"var(--text-tertiary)", padding:4, borderRadius:"var(--radius-sm)" }}>
                <i className="ph ph-x" style={{ fontSize:16 }} />
              </button>
            </div>
            <RichTextEditor key={noteModal} value={noteDraft} onChange={setNoteDraft} minHeight={104}
              placeholder="Add context, blockers or remarks…" />
            <div style={{ display:"flex", gap:8 }}>
              {entries[noteModal] && entries[noteModal].note && (
                <button type="button" onClick={() => { onEditNote && onEditNote(noteModal, ""); setNoteModal(null); }}
                  style={{ flex:1, height:36, borderRadius:"var(--radius-md)", border:"1px solid var(--border-default)", background:"transparent", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:"var(--text-sm)", color:"var(--status-error)", fontWeight:"var(--fw-medium)" }}>
                  Remove note
                </button>
              )}
              <button type="button" disabled={!noteHasText(noteDraft)}
                onClick={() => { onEditNote && onEditNote(noteModal, noteHasText(noteDraft) ? noteDraft : ""); setNoteModal(null); }}
                style={{ flex:2, height:36, borderRadius:"var(--radius-md)", border:"none", background: noteHasText(noteDraft) ? "var(--action-brand)" : "var(--surface-sunken)", cursor: noteHasText(noteDraft) ? "pointer" : "not-allowed", fontFamily:"var(--font-sans)", fontSize:"var(--text-sm)", color: noteHasText(noteDraft) ? "var(--text-on-brand)" : "var(--text-quaternary)", fontWeight:"var(--fw-semibold)" }}>
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function ResolutionBanner({ status, resolution }) {
  /* banner: pending · approved · approved+assigned · rejected · overdue */
  const rejected = status === "Rejected";
  const done = status === "Approved" || status === "Completed";
  const assigned = status === "Yet to start" || status === "In Progress" || status === "Overdue";
  const overdue = status === "Overdue";
  const tone = rejected ? "var(--status-error)" : overdue ? "var(--status-warning)" : (done || assigned) ? "var(--status-success)" : "var(--text-tertiary)";
  const soft = rejected ? "var(--status-error-soft)" : overdue ? "var(--status-warning-soft)" : (done || assigned) ? "var(--status-success-soft)" : "var(--surface-sunken)";
  const icon = rejected ? "ph-x-circle" : assigned ? "ph-user-check" : done ? "ph-check-circle" : "ph-info";
  const label = rejected ? "Request rejected" : assigned ? (overdue ? "Approved & assigned · overdue" : "Approved & assigned") : done ? "Request approved" : status;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 14px", background: soft, borderRadius: "var(--radius-md)" }}>
      <span style={{ color: tone, fontSize: 19, flexShrink: 0, lineHeight: 1, marginTop: 1 }}><i className={"ph-fill " + icon} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>
          {label}
          {resolution && resolution.by && <span style={{ fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}> · {resolution.by}{resolution.on ? " · " + resolution.on : ""}</span>}
        </div>
        {resolution && resolution.remark && (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 3, lineHeight: "var(--leading-normal)" }}>
            “{resolution.remark}”
          </div>
        )}
      </div>
    </div>
  );
}
