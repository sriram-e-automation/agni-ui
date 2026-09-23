/**
 * @internal Renderer behind the public <RecordDetailModal> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { setRef, useFocusTrap, useScrollLock } from "../../utils/interaction.tsx";
import { Button } from "../../primitives/Button/Button.tsx";
import { IconButton } from "../../primitives/Button/IconButton.tsx";
import { Avatar } from "../../primitives/Avatar/Avatar.tsx";
import { Badge } from "../../primitives/Badge/Badge.tsx";
import { ErrorState } from "../../feedback/ErrorState/ErrorState.tsx";
import { Loading } from "../../feedback/Loading/Loading.tsx";
import { StatusChip } from "../../data/StatusChip/StatusChip.tsx";
import { Tabs } from "../../navigation/Tabs/Tabs.tsx";
import { Input } from "../../primitives/Input/Input.tsx";
import { SelectBasic } from "../../primitives/Select/SelectBasic.tsx";
import { DropdownMenu } from "../../navigation/DropdownMenu/DropdownMenu.tsx";
import { StageList } from "../../data/StageList/StageList.tsx";
import { roleAllows } from "../../utils/RoleGate.tsx";
import { resolveDataState } from "../../utils/DataState.tsx";
import { Modal } from "../../feedback/Modal/Modal.tsx";
import { Textarea } from "../../primitives/Textarea/Textarea.tsx";
import { RichTextEditor } from "../../forms/RichTextEditor/RichTextEditor.tsx";
import { DatePicker } from "../../forms/DatePicker/DatePicker.tsx";
import { ApprovalStepper } from "../ApprovalStepper/ApprovalStepper.tsx";
import { AuditTrail } from "../AuditTrail/AuditTrail.tsx";
import { DocumentPreview } from "../../data/DocumentPreview/DocumentPreview.tsx";

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
  /** Record still being fetched — the dialog opens with a skeleton body so the
   *  open action feels instant (open-then-fetch). */
  loading?: boolean;
  /** Fetch failed. String/true → the DS ErrorState in the dialog body. */
  error?: React.ReactNode | boolean;
  /** Retry the fetch from the error state. */
  onRetry?: () => void;
  /** Role has view rights only — approve / reject / complete are withheld. */
  readOnly?: boolean;
  /** A decision is committing — footer actions lock. */
  busy?: boolean;
  /** Spread onto the outer backdrop div — use e.g. paddingRight to shift the modal left when a side panel is open. */
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;

  /* ── Additive props (Aug 2026) ───────────────────────────────────────────
     The generic contract that folded a consuming project's 1,700-line
     ProcurementRequestModal back into this one component. Every one is
     optional and every one falls back to the record, so a call site that
     passes none of them renders exactly what it did before.
     Authoritative documentation lives in RecordDetailModal.d.ts — these are
     restated loosely here because this file is the internal renderer. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: string;
  icon?: string;
  parent?: any;
  essentials?: any[] | null;
  workflow?: ApprovalStep[] | null;
  showWorkflow?: boolean;
  workflowHint?: React.ReactNode;
  assignment?: any;
  sections?: any[] | null;
  section?: string;
  onSectionChange?: (key: string) => void;
  documents?: RequestDocument[] | null;
  stages?: any[] | null;
  onStageAction?: (stage: any, action: any) => void;
  flows?: any[] | null;
  flow?: string | null;
  defaultFlow?: string | null;
  onFlowChange?: (key: string | null) => void;
  audit?: RequestAuditEntry[] | null;
  panes?: any[] | null;
  /** Pane open on mount. `null` = all closed. Supersedes defaultAuditOpen. */
  defaultPane?: string | null;
  pane?: string | null;
  onPaneChange?: (key: string | null) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  actions?: any[] | null;
  resolution?: RequestResolution | null;
  footer?: React.ReactNode;
  role?: string;
  columnsOverride?: never;
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
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10d) — the last and largest file in
 * the system. Seven pointer-handler pairs are gone, including the effort
 * timer's five-handler set that wrote background, colour, border, transform
 * and opacity straight onto the element. Two more bare-keyword animation
 * values were tokenised on the way through (`ease-out` on the dialog fade,
 * `ease-in-out` on the running-timer pulse).
 *
 * What stays inline, and why:
 *   · `containerStyle` / `style` — documented caller escape hatches
 *   · the two grid templates built from the `columns` prop, and a field's
 *     `gridColumn` span, which is per-field data
 *   · the effort ledger's number-input spinner resets (no utility form)
 *   · entrance animations referencing keyframes this file ships itself
 */
const FIELD_LABEL = "text-2xs font-semibold tracking-wide uppercase text-fg-tertiary leading-[1.2]";
const FIELD_VALUE = "text-sm text-fg-primary mt-1 leading-snug";

/* Shell — shared by the loading/error frame and the real dialog, so the two
   cannot drift. Full-page vs sheet is TWO complete strings: they differ on
   max-width, height, border and top radius at once (rule 5).
   No font-family/weight in FIELD_VALUE's base: `mono` swaps both, and an
   appended font-data would lose to a base font-sans by emit order. */
const SCRIM = "fixed inset-0 z-modal bg-[var(--modal-scrim)] [backdrop-filter:blur(2px)] flex justify-center font-sans";
const DIALOG = "relative w-full flex flex-col bg-surface-card shadow-e-2xl overflow-hidden border-b-0";
const DIALOG_FULL = "max-w-none h-screen border-0 rounded-t-none";
const DIALOG_SHEET = "max-w-[1040px] h-[min(900px,calc(100vh-24px))] border border-line-default rounded-t-[var(--sheet-radius)]";
const TITLE_BAR = "flex items-center gap-3 py-3 pr-4 pl-5 border-b border-line-subtle shrink-0";
const TITLE_ICON = "size-[34px] shrink-0 rounded-md bg-surface-brand-soft text-fg-brand inline-flex items-center justify-center text-[18px]";
const FOOTER_NOTE = "text-xs text-fg-tertiary inline-flex items-center gap-1";
/* Side rail. Narrow OVERLAYS the detail column rather than squeezing it, so the
   two states differ on width, border, position and z at once. */
const PANE = "shrink-0 bg-surface-soft flex flex-col min-h-0";
const PANE_WIDE = "w-[372px] border-l border-line-subtle relative";
const PANE_NARROW = "w-full border-l-0 absolute inset-0 z-[5]";
/* Number inputs: the spinner resets have no utility form. */
const NUM_RESET = { MozAppearance: "textfield", WebkitAppearance: "none", appearance: "textfield" };
/* Effort timer toggle. Running and idle differ on fill, ink and edge in every
   state (rest, hover, press), so each is one complete string. */
const TIMER_BTN = "ml-auto inline-flex items-center gap-1 h-[30px] px-3 rounded-md cursor-pointer border " +
  "font-sans text-sm font-semibold whitespace-nowrap " +
  "transition-[background-color,color,border-color,scale] duration-fast ease-standard active:[scale:0.95] active:opacity-[0.8]";
const TIMER_BTN_RUN = "border-status-error bg-status-error-soft text-status-error hover:bg-status-error hover:text-fg-on-brand";
const TIMER_BTN_IDLE = "border-action-brand bg-surface-brand-soft text-fg-brand hover:bg-action-brand hover:text-fg-on-brand";
const LEDGER_EYEBROW = "text-fg-tertiary text-2xs font-semibold uppercase tracking-wide mr-1";

function EssentialField({ label, children, mono }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className={FIELD_LABEL}>{label}</span>
      <span className={[FIELD_VALUE, mono ? "font-data font-normal" : "font-sans font-medium"].join(" ")}>{children}</span>
    </div>
  );
}

/* Eyebrow-label / value grid — mirrors the essential-details rhythm so every
   tab reads consistently (label: 11px uppercase eyebrow, value: 13px below).
   The column count is a caller-supplied number, so the template stays inline. */
function DetailGrid({ rows, columns = 3 }) {
  if (!rows || !rows.length) return null;
  return (
    <div className="grid gap-y-4 gap-x-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {rows.map((r, i) => <EssentialField key={i} label={r.label}>{r.value}</EssentialField>)}
    </div>
  );
}

/* ── Confirmation dialog ─────────────────────────────────────────────
   Two ways in. Without `config` it renders the three built-in decisions
   (approve · reject · complete) with the copy this dialog has always used, so
   an existing call site is unchanged. With `config` it renders a declarative
   RecordAction confirmation: the page owns the title, body, remark rule and
   button label, and `remark: "required"` blocks submit exactly the way a
   rejection always has. */
function ActionConfirm({ action, config, record, onCancel, onConfirm }) {
  const [remark, setRemark] = useState("");
  const [tried, setTried] = useState(false);
  useEffect(() => { setRemark(""); setTried(false); }, [action]);
  if (!action) return null;

  const reject = !config && action === "reject";
  const complete = !config && action === "complete";
  const rule = config ? (config.remark || "none") : (reject ? "required" : "optional");
  const danger = config ? !!config.danger : reject;
  const missing = rule === "required" && !remark.trim();
  const submit = () => { setTried(true); if (missing) return; onConfirm(action, remark.trim()); };
  const title = config ? config.title : reject ? "Reject request" : complete ? "Mark task as completed" : "Approve request";
  const confirmLabel = config
    ? (config.confirmLabel || config.title)
    : reject ? "Reject request" : complete ? "Mark completed" : "Approve request";
  const remarkLabel = config
    ? (config.remarkLabel || "Remarks")
    : reject ? "Reason for rejection" : complete ? "Closing note" : "Remarks";

  return (
    <Modal open={!!action} onClose={onCancel} danger={danger} size="md"
      title={title}
      footer={<>
        <Button category="secondary" onClick={onCancel}>Cancel</Button>
        <Button category={danger ? "danger" : "primary"} icon={<i className={"ph " + (danger ? "ph-x-circle" : "ph-check-circle")} />} onClick={submit}>
          {confirmLabel}
        </Button>
      </>}>
      <p className="m-0 mb-3 text-sm text-fg-secondary leading-normal">
        {config
          ? config.body
          : reject
          ? <>This returns <strong className="text-fg-primary">{record.id}</strong> to the requester. Add a reason so they know what to fix — this is recorded in the audit trail.</>
          : complete
          ? <>This marks <strong className="text-fg-primary">{record.id}</strong> as completed and closes the task. Logged effort is kept on the record — add a closing note if there is anything reviewers should know.</>
          : <>This approves <strong className="text-fg-primary">{record.id}</strong> and advances it to the next stage. Add a note if there is anything the next approver should know.</>}
      </p>
      {rule !== "none" && (
      <div className="flex flex-col gap-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-fg-secondary">
            {remarkLabel}
          </span>
          <span className={["text-xs", rule === "required" ? "text-status-error font-semibold" : "text-fg-tertiary font-normal"].join(" ")}>
            {rule === "required" ? "Required" : "Optional"}
          </span>
        </span>
        <Textarea value={remark} onChange={setRemark} rows={3} error={tried && missing}
          placeholder={reject ? "e.g. Cost centre missing — re-submit with the budget code." : complete ? "e.g. Fit checks passed — handed over to QA." : "e.g. Approved against Q3 capex. Expedite procurement."} />
        {tried && missing && (
          <span className="text-xs text-status-error inline-flex items-center gap-1">
            <i className="ph-fill ph-warning-circle" /> {config ? "A remark is required for this action." : "A reason is required to reject a request."}
          </span>
        )}
      </div>
      )}
    </Modal>
  );
}

export const RequestDetailModal = React.forwardRef<HTMLDivElement, RequestDetailModalProps>(function RequestDetailModal({
  open, record, onClose, onAction, onComplete, onLogEffort,
  loading = false, error = null, onRetry, readOnly = false, busy = false, columns = 3,
  /* Header */
  title, subtitle, status, icon = "ph-file-text", parent = null,
  /* Essential details */
  essentials = null, defaultEssentialsOpen = true, essentialsSummary,
  /* Workflow */
  workflow = null, showWorkflow, workflowHint, assignment = null,
  /* Sections */
  sections = null, section, onSectionChange, documents = null,
  stages = null, onStageAction,
  /* Flows */
  flows = null, flow, defaultFlow = null, onFlowChange,
  /* Panes */
  audit = null, panes = null, defaultPane, pane: paneProp, onPaneChange, defaultAuditOpen = true,
  /* Expansion */
  expandable = true, defaultExpanded = false, expanded, onExpandedChange,
  /* Footer */
  actions = null, resolution = null, footer = null,
  /* Access */
  role = "",
  style = {}, containerStyle = {},
}, fwd) {
  const cols = Number(columns) === 2 ? 2 : 3;
  /* null = "first section", which reproduces the old default of "basic". */
  const [tab, setTab] = useState(null);
  const [full, setFull] = useState(!!defaultExpanded);
  const [essOpen, setEssOpen] = useState(defaultEssentialsOpen !== false);
  /* defaultPane supersedes defaultAuditOpen and can express "all closed" (null),
     which the boolean never could. defaultAuditOpen stays as a deprecated alias
     for one release: it is only consulted when defaultPane is not supplied. */
  const paneDefault = defaultPane !== undefined ? defaultPane : (defaultAuditOpen ? "audit" : null);
  const [rightPane, setRightPane] = useState(paneDefault);
  const [flowKey, setFlowKey] = useState(defaultFlow || null);
  const [confirm, setConfirm] = useState(null);   // { key, config } | null
  const [effortEntries, setEffortEntries] = useState([]);
  /* Per-section search + filter state, keyed by section. Sections without
     search/filters never touch it. */
  const [secState, setSecState] = useState({});
  const [narrow, setNarrow] = useState(typeof window !== "undefined" && window.innerWidth < 760);

  /* Panes overlay instead of squeezing the body once the DIALOG is narrow — not
     once the window is. The two differ whenever the dialog is embedded (a
     specimen card, a split view): reading window width alone left the audit
     pane absolutely positioned over the whole detail column in any container
     that mounted narrow and was then widened, because only a window `resize`
     could correct it. ResizeObserver watches the dialog itself; the window
     listener stays as the fallback where ResizeObserver is unavailable.

     The ref is a STATE-holding callback ref, not a useRef. Three branches
     (loading, error, record) each render their own dialog node and attach the
     same ref, so a `useRef` + effect keyed on those flags could re-run while
     `.current` still pointed at the previous node — or at null — and the
     observer would attach to nothing. A callback ref re-keys the effect on the
     actual element. The measurement also falls back to offsetWidth/clientWidth
     rather than discarding a zero: the first RO callback can legitimately
     report contentRect.width === 0, and swallowing it froze `narrow` at its
     mount value for the life of the dialog. */
  const [dialogEl, setDialogEl] = useState<HTMLElement | null>(null);
  const trapRef = useRef<HTMLElement | null>(null);
  /* The forwarded ref lands on the dialog panel (loading shell or loaded dialog). */
  const fwdRef = useRef(fwd); fwdRef.current = fwd;
  const dialogRef = useCallback((node: HTMLElement | null) => {
    trapRef.current = node; setDialogEl(node); setRef(fwdRef.current, node as HTMLDivElement | null);
  }, []);
  useEffect(() => {
    if (typeof ResizeObserver !== "undefined") return;
    const onResize = () => setNarrow(window.innerWidth < 760);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => {
    const el = dialogEl;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = (rectW) => {
      const w = rectW || el.offsetWidth || el.clientWidth;
      if (w) setNarrow(w < 760);
    };
    measure(0);
    const ro = new ResizeObserver((entries) => {
      const e = entries && entries[0];
      measure(e && e.contentRect ? e.contentRect.width : 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [dialogEl]);

  useEffect(() => {
    if (!open) return;
    setTab(null);
    setFull(!!defaultExpanded);
    setEssOpen(defaultEssentialsOpen !== false);
    setRightPane(paneDefault);
    setFlowKey(defaultFlow || null);
    setConfirm(null);
    setSecState({});
  }, [open, record && record.id]);
  /* Reload the effort ledger whenever the record (or its effort) changes —
     keyed on the effort reference so swapping the record prop in place works. */
  useEffect(() => {
    setEffortEntries((record && record.effort && record.effort.entries) || []);
  }, [record && record.id, record && record.effort]);
  /* Modal dialog contract: focus in on open, trapped, returned on close. The
     trap re-arms when the loading shell is swapped for the loaded dialog.
     Escape is handled on the dialog (onDialogKey), not on document, so a
     nested note editor or ConfirmModal closes first. */
  useFocusTrap(trapRef, !!open, { rearmKey: dialogEl });
  useScrollLock(!!open);
  const onDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !confirm) { e.stopPropagation(); onClose && onClose(); }
  };

  /* ── Controlled / uncontrolled resolution ── */
  const isFull = expanded !== undefined ? !!expanded : full;
  const setFullState = (v) => { onExpandedChange && onExpandedChange(v); if (expanded === undefined) setFull(v); };
  const activeFlowKey = flow !== undefined ? flow : flowKey;
  const setFlowState = (k) => { onFlowChange && onFlowChange(k); if (flow === undefined) setFlowKey(k); };

  const flowList = flows || [];
  const activeFlow = activeFlowKey ? flowList.find((f) => f.key === activeFlowKey) || null : null;

  /* A flow expands the dialog to full page on entry unless it opts out. */
  useEffect(() => {
    if (activeFlow && activeFlow.expand !== false && !isFull) setFullState(true);
  }, [activeFlowKey]);

  if (!open) return null;

  /* Open-then-fetch: the dialog frame appears immediately; the body carries the
     skeleton or the failure, so the modal never opens onto nothing. */
  if (loading || error || !record) {
    if (!loading && !error) return null;
    return (
      <div onClick={onClose} className={[SCRIM, isFull ? "items-stretch" : "items-end"].join(" ")}
        style={{ animation: "agni-fade-in var(--dur-fast) var(--ease-standard)", ...containerStyle }}>
        <div role="dialog" aria-modal="true" aria-busy={loading || undefined} aria-label="Request" ref={dialogRef} tabIndex={-1} onKeyDown={onDialogKey} onClick={(e) => e.stopPropagation()}
          className={[DIALOG, isFull ? DIALOG_FULL : DIALOG_SHEET].join(" ")}
          style={{ animation: "agni-sheet-up var(--dur-normal) var(--ease-emphasized)", ...style }}>
          <div className={TITLE_BAR}>
            <span className={TITLE_ICON}>
              <i className={"ph-fill " + icon} />
            </span>
            <div className="min-w-0 flex-1 text-md font-semibold text-fg-primary">
              {error ? "Request unavailable" : "Loading request…"}
            </div>
            <IconButton icon={<i className="ph ph-x" />} variant="ghost" title="Close" onClick={onClose} />
          </div>
          <div className={[
            "flex-1 min-h-0 min-w-0 overflow-y-auto",
            error ? "p-0 grid place-items-center" : "py-[22px] px-6 block",
          ].join(" ")}>
            {error
              ? (typeof error === "string" || error === true
                  ? <ErrorState title="Couldn't load this request" message={error === true ? undefined : error} onRetry={onRetry} action={<Button category="tertiary" onClick={onClose}>Close</Button>} />
                  : error)
              : <Loading loading shape="requestForm" rows={6} columns={cols} />}
          </div>
        </div>
        <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-sheet-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  /* ── Header / body values: every one falls back to the record, so a call site
     that passes none of the new props renders exactly what it always did. ── */
  const hTitle = title != null ? title : (record.requestType || "Request");
  const hSubtitle = subtitle != null ? subtitle : record.id;
  const hStatus = status != null ? status : record.status;
  const wf = workflow || record.workflow || [];
  const aud = audit || record.audit || [];
  const docs = documents || record.documents || [];
  const res = resolution || record.resolution;
  const wfVisible = showWorkflow !== undefined ? !!showWorkflow : wf.length > 0;

  const actionable = !readOnly && (hStatus === "Pending" || hStatus === "In Review" || hStatus === "Awaiting Approval");
  const completable = !readOnly && !!onComplete && (hStatus === "Yet to start" || hStatus === "In Progress" || hStatus === "Overdue");
  const canLogEffort = !!(record.effort && record.effort.canLog);
  const effortAssignees = (record.effort && record.effort.assignees) || [];

  /* ── Panes ── */
  const BUILTIN_PANES = [
    { key: "audit", label: "Activity log", icon: "ph-clock-counter-clockwise" },
    ...(canLogEffort ? [{ key: "effort", label: "Effort log", icon: "ph-timer" }] : []),
  ];
  const paneList = (panes || BUILTIN_PANES).filter((p) => roleAllows(role, p.roles));
  const panesLocked = !!(activeFlow && activeFlow.lockPanes !== false);
  const rawPane = paneProp !== undefined ? paneProp : rightPane;
  /* A pane that is no longer available (effort on a record that can't log it,
     or one gated out by role) falls back rather than rendering blank. */
  const pane = paneList.some((p) => p.key === rawPane) ? rawPane : null;
  const setPaneState = (k) => { onPaneChange && onPaneChange(k); if (paneProp === undefined) setRightPane(k); };
  const togglePane = (k) => setPaneState(pane === k ? null : k);

  /* ── Sections ── */
  const defaultSections = [
    { key: "basic",      label: "Basic details", icon: "ph-info",        rows: record.basics },
    { key: "assignment", label: "Assignment",    icon: "ph-user-switch", rows: record.assignment },
    { key: "execution",  label: "Execution",     icon: "ph-gear",        rows: record.execution },
  ];
  const stageSection = stages
    ? [{ key: "stages", label: "Stages", icon: "ph-list-checks", badge: stages.length,
         content: () => <StageList stages={stages} onAction={(s, a) => {
           if (a && a.key && s.flow && flowList.some((f) => f.key === s.flow)) setFlowState(s.flow);
           onStageAction && onStageAction(s, a);
         }} /> }]
    : [];
  const sectionList = [...(sections || defaultSections), ...stageSection]
    .filter((s) => roleAllows(role, s.roles))
    .filter((s) => !s.when || s.when.includes(hStatus));

  const activeSection = section !== undefined ? section : tab;
  const currentKey = activeSection || (sectionList[0] && sectionList[0].key) || "docs";
  const setTabState = (k) => { onSectionChange && onSectionChange(k); if (section === undefined) setTab(k); };
  const current = sectionList.find((s) => s.key === currentKey);

  /* ── Footer actions ── */
  const actionList = (actions || []).filter((a) =>
    (!a.when || a.when.includes(hStatus)) && roleAllows(role, a.roles) && !readOnly);

  const fireAction = (a) => {
    if (a.flow) { setFlowState(a.flow); return; }
    if (a.confirm) { setConfirm({ key: a.key, config: a.confirm }); return; }
    onAction && onAction(a.key, "");
  };

  const handleConfirm = (action, remark) => {
    setConfirm(null);
    if (!confirm || !confirm.config) {
      if (action === "complete") { onComplete && onComplete(remark); return; }
      onAction && onAction(action, remark);
      return;
    }
    onAction && onAction(action, remark);
  };

  /* ── Section body: search / filters / scroll / own data state ── */
  const secBits = secState[currentKey] || { q: "", filters: {} };
  const searchCfg = current && current.search ? (current.search === true ? {} : current.search) : null;
  const filterCfgs = (current && current.filters) || [];
  const query = searchCfg && searchCfg.value !== undefined ? searchCfg.value : secBits.q;
  const setQuery = (v) => {
    if (searchCfg && searchCfg.onChange) searchCfg.onChange(v);
    if (!searchCfg || searchCfg.value === undefined) setSecState((p) => ({ ...p, [currentKey]: { ...secBits, q: v } }));
  };
  const filterVal = (f) => (f.value !== undefined ? f.value : (secBits.filters[f.key] || "all"));
  const setFilterVal = (f, v) => {
    f.onChange && f.onChange(v);
    if (f.value === undefined) setSecState((p) => ({ ...p, [currentKey]: { ...secBits, filters: { ...secBits.filters, [f.key]: v } } }));
  };
  const filterState = {};
  filterCfgs.forEach((f) => { filterState[f.key] = filterVal(f); });

  const matches = (row) => {
    const q = (query || "").trim().toLowerCase();
    const keys = (searchCfg && searchCfg.keys) || null;
    if (q) {
      const hay = keys
        ? keys.map((k) => row && row[k]).filter((v) => typeof v === "string" || typeof v === "number")
        : [row && row.label, row && row.value].filter((v) => typeof v === "string" || typeof v === "number");
      if (!hay.join(" ").toLowerCase().includes(q)) return false;
    }
    /* A filter narrows rows that actually carry its key; "all" is the pass-all
       value. A row without the key is never hidden — the filter simply does not
       apply to it. */
    for (const f of filterCfgs) {
      const v = filterState[f.key];
      if (!v || v === "all") continue;
      if (row && row[f.key] !== undefined && String(row[f.key]) !== String(v)) return false;
    }
    return true;
  };
  const rawRows = (current && current.rows) || null;
  const results = rawRows ? rawRows.filter(matches) : [];

  const renderSectionBody = () => {
    if (currentKey === "docs") {
      return docs.length ? (
        <div className="grid grid-cols-2 gap-2">
          {docs.map((d, i) => <DocumentPreview key={i} name={d.name} type={d.type} meta={d.meta} onView={() => {}} onDownload={() => {}} />)}
        </div>
      ) : (
        <div className="py-6 px-0 text-center text-fg-tertiary text-sm">
          <i className="ph ph-folder-dashed text-[26px] block mb-2" />
          No documents attached to this request.
        </div>
      );
    }
    if (!current) return null;

    /* Every section resolves its own state through the shared contract. */
    const st = resolveDataState({
      loading: current.loading, error: current.error, onRetry: current.onRetry,
      isEmpty: rawRows ? results.length === 0 : false,
      empty: current.empty != null ? current.empty : "Nothing to show here",
      shape: "paragraph", rows: 4,
    });
    if (st !== false) return st;

    if (typeof current.content === "function") return current.content({ query, filters: filterState, results });
    if (current.content != null) return current.content;
    /* `results`, never `rawRows` — the grid has to show the survivors, not the
       whole array. `matches` passes every row when there is no query and every
       filter is "all", so this is also the unfiltered path. */
    return <DetailGrid rows={results} columns={cols} />;
  };

  /* The scroll cap is a caller-supplied pixel number, so the wrapper keeps a
     style object; its class half is constant. */
  const scrollCfg = current && current.scroll;
  const bodyWrapCls = scrollCfg
    ? ["pt-4 min-h-0 overflow-y-auto", typeof scrollCfg === "number" ? "flex-none" : "flex-1"].join(" ")
    : "pt-4";
  const bodyWrapStyle = typeof scrollCfg === "number" ? { maxHeight: scrollCfg } : undefined;

  /* ── Assignment row ── */
  const asgVisible = !!assignment && roleAllows(role, assignment.roles);
  const asgPerson = assignment && (typeof assignment.value === "string" ? { name: assignment.value } : assignment.value);
  const AssignmentRow = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={FIELD_LABEL}>{(assignment && assignment.label) || "Assigned to"}</span>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-fg-primary">
        {asgPerson ? <Avatar name={asgPerson.name} size="xs" /> : null}
        {asgPerson ? asgPerson.name : "Unassigned"}
        {asgPerson && asgPerson.role && <span className="font-normal text-fg-tertiary">· {asgPerson.role}</span>}
      </span>
      {assignment.editable && !readOnly && (
        <DropdownMenu align="start"
          trigger={<Button size="sm" category="tertiary" icon={<i className="ph ph-user-switch" />}>Change</Button>}
          items={(assignment.options || []).map((p) => ({
            label: p.role ? p.name + " · " + p.role : p.name,
            icon: "ph-user",
            onClick: () => assignment.onChange && assignment.onChange(p),
          }))} />
      )}
    </div>
  );

  const flowCtx = { exit: () => setFlowState(null), go: (k) => setFlowState(k) };
  const flowBare = !!(activeFlow && activeFlow.bare);

  return (
    <div onClick={onClose} className={[SCRIM, isFull ? "items-stretch" : "items-end"].join(" ")}
      style={{ animation: "agni-fade-in var(--dur-fast) var(--ease-standard)", ...containerStyle }}>
      <div role="dialog" aria-modal="true" aria-label={"Request " + record.id} ref={dialogRef} tabIndex={-1} onKeyDown={onDialogKey} onClick={(e) => e.stopPropagation()}
        className={[DIALOG, isFull ? DIALOG_FULL : DIALOG_SHEET].join(" ")}
        style={{ animation: "agni-sheet-up var(--dur-normal) var(--ease-emphasized)", ...style }}>
        {/* ── Title bar — record type · status · pane toggles · close ── */}
        <div className={TITLE_BAR}>
          <span className={TITLE_ICON}>
            <i className={"ph-fill " + icon} />
          </span>
          <div className="min-w-0 flex-1">
            {parent && (
              <button type="button" onClick={parent.onNavigate}
                className={["inline-flex items-center gap-1 border-none bg-transparent p-0 mb-[2px] font-sans text-xs text-fg-tertiary", parent.onNavigate ? "cursor-pointer" : "cursor-default"].join(" ")}>
                <i className="ph ph-arrow-left text-[13px]" />
                {parent.label}
                {parent.hint && <span className="text-fg-disabled">· {parent.hint}</span>}
              </button>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-md font-semibold text-fg-primary whitespace-nowrap">{hTitle}</span>
              {hStatus && <StatusChip status={hStatus} size="sm" />}
            </div>
            <div className="text-xs text-fg-tertiary font-data mt-[2px]">{hSubtitle}</div>
          </div>
          {asgVisible && assignment.placement === "header" && <AssignmentRow />}
          {paneList.map((p) => (
            <PaneToggle key={p.key} icon={p.icon} label={p.label} iconOnly={narrow} active={pane === p.key}
              disabled={p.disabled || panesLocked}
              title={panesLocked ? "Close this task to use the side panes" : (pane === p.key ? "Hide " + p.label.toLowerCase() : "Show " + p.label.toLowerCase())}
              onClick={() => { if (p.disabled || panesLocked) return; togglePane(p.key); }} />
          ))}
          {expandable && (
            <IconButton size="sm" variant="ghost" title={isFull ? "Exit full page" : "Expand to full page"} onClick={() => setFullState(!isFull)} icon={<i className={isFull ? "ph ph-corners-in" : "ph ph-corners-out"} />} />
          )}
          <IconButton size="sm" variant="ghost" title="Close" onClick={onClose} icon={<i className="ph ph-x" />} />
        </div>

        {/* ── Body — detail column + side pane ── */}
        <div className="flex-1 min-h-0 min-w-0 flex relative">
          {/* Detail column */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            <div className="flex-1 min-w-0 overflow-y-auto py-4 px-5 flex flex-col gap-5">

              {!flowBare && (
              <React.Fragment>
              {/* Essential details — named, collapsible section. shrink-0 keeps it
                 from being crushed when the tab content below is very long. */}
              <section className="bg-surface-soft border border-line-subtle rounded-lg overflow-hidden shrink-0">
                <button type="button" onClick={() => setEssOpen((v) => !v)} aria-expanded={essOpen}
                  className="w-full flex items-center gap-2 py-3 px-4 border-none bg-transparent cursor-pointer font-sans text-left">
                  <span className={FIELD_LABEL}>Essential details</span>
                  {!essOpen && (
                    <span className="inline-flex items-center gap-3 min-w-0 flex-1 justify-end">
                      {essentialsSummary != null ? essentialsSummary : (
                        <React.Fragment>
                          <span className="inline-flex items-center gap-2 text-sm text-fg-secondary whitespace-nowrap overflow-hidden"><Avatar name={record.raisedBy || ""} size="xs" />{record.raisedBy || "—"}</span>
                          <span className="w-px h-4 bg-line-default shrink-0" />
                          <span className="text-sm text-fg-secondary whitespace-nowrap overflow-hidden text-ellipsis">{record.project || record.requestType || "—"}</span>
                        </React.Fragment>
                      )}
                    </span>
                  )}
                  {essOpen && <span className="flex-1 min-w-0" />}
                  <i className={["ph ph-caret-down text-[14px] text-fg-tertiary shrink-0 transition-[transform] duration-fast ease-standard", essOpen ? "[transform:rotate(180deg)]" : "[transform:none]"].join(" ")} />
                </button>
                {essOpen && (
                <div className="grid gap-y-4 gap-x-5 pt-1 px-4 pb-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {essentials ? essentials.map((f, i) => (
                    <div key={i} className="min-w-0" style={{ gridColumn: f.span && f.span > 1 ? "span " + Math.min(f.span, cols) : undefined }}>
                      <EssentialField label={f.label} mono={f.mono}>{f.value}</EssentialField>
                    </div>
                  )) : (
                    <React.Fragment>
                      <EssentialField label="Request ID" mono>{record.id}</EssentialField>
                      <EssentialField label="Raised by">
                        <span className="inline-flex items-center gap-2">
                          <Avatar name={record.raisedBy || ""} size="xs" />{record.raisedBy || "—"}
                        </span>
                      </EssentialField>
                      <EssentialField label="Raised on" mono>{record.raisedOn || "—"}</EssentialField>
                      <EssentialField label="Type">{record.requestType || "—"}</EssentialField>
                      <EssentialField label="Status"><StatusChip status={hStatus} size="sm" /></EssentialField>
                      <EssentialField label="Project">{record.project || "—"}</EssentialField>
                    </React.Fragment>
                  )}
                </div>
                )}
              </section>

              {/* Workflow */}
              {wfVisible && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className={FIELD_LABEL}>Approval workflow</span>
                  <span className="flex-1 min-w-0 h-px bg-line-subtle" />
                  <span className="text-2xs text-fg-tertiary inline-flex items-center gap-1">
                    {workflowHint != null ? workflowHint : <><i className="ph ph-cursor-click" /> Hover a stage for details</>}
                  </span>
                </div>
                <div className="pt-1 pb-[2px]">
                  <ApprovalStepper interactive steps={wf} />
                </div>
                {asgVisible && assignment.placement !== "header" && (
                  <div className="mt-3 pt-3 border-t border-line-subtle">
                    <AssignmentRow />
                  </div>
                )}
              </section>
              )}
              </React.Fragment>
              )}

              {activeFlow ? (
                /* ── Flow — a task takes over the body. The dialog owns the
                   breadcrumb and the shell; the page owns the content. ── */
                <section className="flex flex-col min-h-0 flex-1">
                  <div className="flex items-center gap-2 pb-3 border-b border-line-subtle">
                    <Button size="sm" category="tertiary" icon={<i className="ph ph-arrow-left" />} onClick={() => setFlowState(null)}>Back</Button>
                    <span className="text-sm font-semibold text-fg-primary">{activeFlow.title}</span>
                    {activeFlow.crumb != null && (
                      <span className="text-xs text-fg-tertiary">{activeFlow.crumb}</span>
                    )}
                  </div>
                  <div className="pt-4 flex-1 min-h-0">
                    {typeof activeFlow.content === "function" ? activeFlow.content(flowCtx) : activeFlow.content}
                  </div>
                </section>
              ) : (
              /* Sections + document repository toggle */
              <section className="flex flex-col min-h-0">
                <div className="flex items-end justify-between gap-3 border-b border-line-subtle">
                  <Tabs size="sm" tabs={sectionList.map((s) => ({ key: s.key, label: s.label, icon: s.icon, badge: s.badge }))}
                    value={currentKey === "docs" ? "" : currentKey} onChange={setTabState} className="border-b-0 flex-1 min-w-0" />
                  <button type="button" onClick={() => setTabState("docs")} title="Document repository"
                    className={[
                      "inline-flex items-center gap-1 border-0 bg-transparent cursor-pointer p-2 -mb-px font-sans text-sm border-b-2",
                      currentKey === "docs"
                        ? "border-b-action-brand text-fg-brand font-semibold"
                        : "border-b-transparent text-fg-tertiary font-medium",
                    ].join(" ")}>
                    <i className="ph ph-folders text-[16px]" />
                    {docs.length > 0 && <span className={[
                      "text-2xs font-data font-semibold py-px px-1 rounded-full",
                      currentKey === "docs" ? "bg-surface-brand-soft" : "bg-surface-sunken",
                    ].join(" ")}>{docs.length}</span>}
                  </button>
                </div>

                {/* Search + filters — the DS controls, so no page hand-rolls a raw input */}
                {(searchCfg || filterCfgs.length > 0) && currentKey !== "docs" && (
                  <div className="flex items-center gap-2 flex-wrap pt-3">
                    {searchCfg && (
                      <div className="flex-[1_1_240px] min-w-[180px] max-w-[var(--max-w-field)]">
                        <Input size="sm" value={query} onChange={setQuery}
                          placeholder={searchCfg.placeholder || "Search…"}
                          prefixIcon={<i className="ph ph-magnifying-glass" />}
                          aria-label={searchCfg.placeholder || "Search"}
                          suffixIcon={query ? <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="inline-flex border-none bg-transparent p-0 cursor-pointer text-inherit"><i aria-hidden="true" className="ph ph-x" /></button> : undefined} />
                      </div>
                    )}
                    {filterCfgs.map((f) => (
                      f.control === "select" ? (
                        <div key={f.key} className="min-w-[160px]">
                          <SelectBasic size="sm" value={filterVal(f)} options={f.options} placeholder={f.label || "All"}
                            onChange={(v) => setFilterVal(f, v)} />
                        </div>
                      ) : (
                        <Tabs key={f.key} items={f.options.map((o) => ({ key: o.value, label: o.label }))}
                          value={filterVal(f)} onChange={(v) => setFilterVal(f, v)} />
                      )
                    ))}
                  </div>
                )}

                <div className={bodyWrapCls} style={bodyWrapStyle}>{renderSectionBody()}</div>
              </section>
              )}
            </div>

            {/* Footer — flow footer · declarative actions · the built-in shapes */}
            <div className="shrink-0 border-t border-line-default py-3 px-5 bg-[var(--modal-bg)]">
              {activeFlow && activeFlow.footer != null ? (
                typeof activeFlow.footer === "function" ? activeFlow.footer(flowCtx) : activeFlow.footer
              ) : activeFlow ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 min-w-0" />
                  <Button category="secondary" onClick={() => setFlowState(null)}>Back to record</Button>
                </div>
              ) : footer != null ? footer : actions ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex-[1_1_260px] min-w-0">
                    {res ? <ResolutionBanner status={hStatus} resolution={res} /> : (
                      <span className={FOOTER_NOTE}>
                        <i className="ph ph-shield-check text-[15px]" /> Your decision is recorded against this record.
                      </span>
                    )}
                  </div>
                  {actionList.map((a) => (
                    <Button key={a.key} category={a.category || "secondary"} disabled={a.disabled || busy}
                      loading={busy && (a.category === "primary")}
                      icon={a.icon ? <i className={"ph " + a.icon} /> : undefined}
                      onClick={() => fireAction(a)}>{a.label}</Button>
                  ))}
                </div>
              ) : actionable ? (
                <div className="flex items-center gap-2">
                  <span className={[FOOTER_NOTE, "flex-1 min-w-0"].join(" ")}>
                    <i className="ph ph-shield-check text-[15px]" /> Your decision is recorded against this request.
                  </span>
                  <Button category="secondary" disabled={busy} icon={<i className="ph ph-x-circle" />} className="text-status-error border-status-error" onClick={() => setConfirm({ key: "reject", config: null })}>Reject</Button>
                  <Button category="primary" loading={busy} icon={<i className="ph ph-check-circle" />} onClick={() => setConfirm({ key: "approve", config: null })}>Approve</Button>
                </div>
              ) : completable ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-[1_1_260px] min-w-0">
                    <ResolutionBanner status={hStatus} resolution={res} />
                  </div>
                  {canLogEffort && (
                    <Button category="secondary" icon={<i className="ph ph-timer" />} onClick={() => setPaneState("effort")}>Log effort</Button>
                  )}
                  <Button category="primary" loading={busy} icon={<i className="ph ph-check-circle" />} onClick={() => setConfirm({ key: "complete", config: null })}>Mark as completed</Button>
                </div>
              ) : (
                <ResolutionBanner status={hStatus} resolution={res} />
              )}
            </div>
          </div>

          {/* Side panes — audit and effort are built in; anything else is the
              page's own content, rendered in the same rail. */}
          {pane === "audit" && (
            <aside className={[PANE, narrow ? PANE_NARROW : PANE_WIDE].join(" ")}>
              <div className="flex items-center py-3 px-4 border-b border-line-subtle shrink-0">
                <span className="text-sm font-semibold text-fg-primary inline-flex items-center gap-2">
                  <i className="ph ph-clock-counter-clockwise text-[16px]" /> Audit trail
                </span>
              </div>
              <div className="flex-1 min-w-0 overflow-y-auto p-4">
                <AuditTrail entries={aud} />
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

          {pane && pane !== "audit" && pane !== "effort" && (() => {
            const p = paneList.find((x) => x.key === pane);
            if (!p) return null;
            return (
              <aside className={[PANE, narrow ? PANE_NARROW : PANE_WIDE].join(" ")}>
                <div className="flex items-center py-3 px-4 border-b border-line-subtle shrink-0">
                  <span className="text-sm font-semibold text-fg-primary inline-flex items-center gap-2">
                    <i className={"ph " + p.icon + " text-[16px]"} /> {p.label}
                  </span>
                </div>
                <div className="flex-1 min-w-0 overflow-y-auto p-4">{p.content}</div>
              </aside>
            );
          })()}
        </div>
      </div>

      <ActionConfirm action={confirm && confirm.key} config={confirm && confirm.config} record={record}
        onCancel={() => setConfirm(null)} onConfirm={handleConfirm} />
      <style>{`@keyframes agni-fade-in{from{opacity:0}}@keyframes agni-sheet-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes agni-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </div>
  );
});

/* ── Title-bar pane toggle (Activity log / Effort log) ───────────── */
const PANE_TOGGLE = "inline-flex items-center h-[32px] justify-center rounded-md font-sans text-sm whitespace-nowrap shrink-0 border " +
  "transition-[background-color,border-color,color] duration-fast ease-standard";
const PANE_TOGGLE_ON = "border-action-brand bg-surface-brand-soft text-fg-brand font-semibold";
const PANE_TOGGLE_OFF = "border-line-default bg-transparent text-fg-secondary font-medium";
function PaneToggle({ icon, label, active, title, onClick, iconOnly, disabled }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={label} disabled={!!disabled} aria-pressed={!!active}
      className={[
        PANE_TOGGLE, active ? PANE_TOGGLE_ON : PANE_TOGGLE_OFF,
        iconOnly ? "gap-0 w-[32px] px-0" : "gap-[6px] w-auto px-[11px]",
        disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : "cursor-pointer opacity-100",
      ].join(" ")}>
      <i className={"ph " + icon + " text-[16px]"} /> {iconOnly ? null : label}
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
  /* The spinner resets (-moz-appearance / -webkit-appearance) have no utility
     form, so the two inputs keep a tiny style object; the rest is classes. */
  const numCls = ["w-[32px] text-center border-none outline-none bg-transparent font-sans text-sm p-0",
    disabled ? "text-fg-secondary cursor-not-allowed" : "text-fg-primary cursor-text"].join(" ");
  return (
    <div className={[
      "inline-flex items-center justify-center gap-px py-1 px-2 border border-line-default rounded-md box-border w-full",
      disabled ? "bg-surface-sunken" : "bg-surface-card",
    ].join(" ")} style={style}>
      <input type="number" aria-label="Hours" min={0} max={23} value={hh} disabled={disabled}
        onFocus={(e) => e.target.select()}
        onChange={(e) => emit(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)), mm)}
        className={numCls} style={NUM_RESET} />
      <span aria-hidden="true" className="text-sm text-fg-tertiary select-none leading-none">:</span>
      <input type="number" aria-label="Minutes" min={0} max={59} value={mm} disabled={disabled}
        onFocus={(e) => e.target.select()}
        onChange={(e) => emit(hh, Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
        className={numCls} style={NUM_RESET} />
    </div>
  );
}

/* ── Collapsible section used by the Effort log pane ─────────────── */
function EffortSection({ icon, title, open, onToggle, meta, children, fillHeight }) {
  return (
    <div className={[
      "bg-surface-card border border-line-subtle rounded-lg overflow-hidden",
      fillHeight ? "flex flex-col flex-1 min-h-0" : "",
    ].join(" ")}>
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="w-full flex items-center gap-2 p-3 border-none bg-transparent cursor-pointer font-sans text-left shrink-0">
        <i className={"ph " + icon + " text-[16px] text-fg-secondary"} />
        <span className="text-sm font-semibold text-fg-primary whitespace-nowrap">{title}</span>
        <span className="flex-1 min-w-0" />
        {meta}
        <i className={["ph ph-caret-down text-[14px] text-fg-tertiary transition-[transform] duration-fast ease-standard", open ? "[transform:rotate(180deg)]" : "[transform:none]"].join(" ")} />
      </button>
      {open && <div className={["pt-[2px] px-3 pb-3", fillHeight ? "flex-1 overflow-y-auto min-h-0" : ""].join(" ")}>{children}</div>}
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
  /* The note editor is a dialog nested in the record dialog: its own trap sits
     on top of the stack, so Tab stays inside it until it closes. */
  const noteRef = useRef<HTMLDivElement>(null);
  useFocusTrap(noteRef, noteModal !== null);
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
  const fLbl = FIELD_LABEL + " mb-1 block";

  /* Duration box theme per state — three complete class strings, since running /
     invalid / valid each change fill, edge, icon and ink together. */
  const durCls = running ? "bg-surface-brand-soft border-action-brand text-fg-brand"
    : invalid ? "bg-surface-sunken border-line-subtle text-fg-tertiary"
    : "bg-status-success-soft border-status-success text-status-success";
  const durIco = running ? "ph-timer" : (invalid ? "ph-hourglass" : "ph-check-circle");

  return (
    <aside className={[PANE, narrow ? PANE_NARROW : PANE_WIDE].join(" ")}>
      <div className="flex items-center gap-2 py-3 px-4 border-b border-line-subtle shrink-0">
        <span className="text-sm font-semibold text-fg-primary inline-flex items-center gap-2">
          <i className="ph ph-timer text-[16px]" /> Effort log
        </span>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-hidden pt-3 px-4 pb-4 flex flex-col gap-3">
        {/* Log effort — collapsible form accordion */}
        <EffortSection icon="ph-timer" title="Log effort" open={activeSection === "form"} onToggle={() => setActiveSection((v) => v === "form" ? null : "form")} fillHeight={activeSection === "form"}>

          {/* Timer row — single Start/Stop toggle button. Its five inline
             pointer handlers (which wrote background, colour, border, transform
             and opacity straight onto the element) are hover:/active: now. */}
          <div className="flex items-center gap-1 mb-3 pt-[2px]">
            <span className={FIELD_LABEL}>Timer</span>
            <button type="button"
              title={running ? "Stop timer — stamps the end date & time" : "Start timer — stamps the start date & time"} aria-label={running ? "Stop timer — stamps the end date & time" : "Start timer — stamps the start date & time"}
              onClick={running ? handleStop : handleStart}
              className={[TIMER_BTN, running ? TIMER_BTN_RUN : TIMER_BTN_IDLE].join(" ")}>
              <i className={"ph " + (running ? "ph-stop" : "ph-play") + " text-[13px]"} />
              {running ? "Stop" : "Start"}
            </button>
          </div>

          <div className="mb-3">
            <span className={fLbl}>Start</span>
            <div className="grid grid-cols-[1.4fr_1fr] gap-2">
              <DatePicker value={strToDate(sd)} disabled={startFrozen} max={strToDate(ed)} size="sm"
                onChange={(d) => d && setSd(dVal(d))} />
              <TimeField24 value={st} disabled={startFrozen} onChange={setSt} />
            </div>
          </div>

          <div className="mb-3">
            <span className={fLbl}>End</span>
            <div className="grid grid-cols-[1.4fr_1fr] gap-2">
              <DatePicker value={strToDate(ed)} min={strToDate(sd)} size="sm"
                onChange={handleEndDateChange} />
              <TimeField24 value={et} onChange={handleEndTimeChange} />
            </div>
          </div>

          {assignees.length > 1 && (
            <div className="mb-3">
              <span className={fLbl}>Logged by</span>
              <select aria-label="Logged by" value={by} onChange={(e) => setBy(e.target.value)}
                className="w-full box-border p-2 rounded-md border border-line-default bg-surface-card font-sans text-sm text-fg-primary outline-none cursor-pointer [color-scheme:light_dark]">
                {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          {/* Duration — ticks live when running */}
          <div className={["flex items-center gap-2 py-2 px-3 rounded-md mb-3 border", durCls].join(" ")}>
            <i className={"ph " + durIco + " text-[16px]"} />
            <span className="text-xs text-fg-secondary">Duration</span>
            {running && <span className="size-[7px] rounded-full bg-status-success shrink-0" style={{ animation: "agni-pulse 1.2s var(--ease-standard) infinite" }} />}
            <span className={[
              "ml-auto whitespace-nowrap font-data font-bold",
              running ? "text-lg tracking-[0.04em] text-fg-brand" : (invalid ? "text-md tracking-[0] text-fg-tertiary" : "text-md tracking-[0] text-fg-primary"),
            ].join(" ")}>
              {running ? fmtElapsed(elapsedMs) : (invalid ? (hrs != null && hrs <= 0 ? "End \u2264 start" : "\u2014") : fmtHours(hrs))}
            </span>
          </div>

          {/* Notes — optional rich text, carried into the ledger card */}
          <div className="mb-3">
            <span className={fLbl}>Notes <span className="font-normal normal-case tracking-[0] text-[var(--text-quaternary)]">(optional)</span></span>
            <RichTextEditor key={noteKey} value={note} onChange={setNote} minHeight={80} placeholder="Add context, blockers or remarks…" />
          </div>

          <Button category="primary" size="sm" icon={<i className="ph ph-plus" />} disabled={!canLog} onClick={submit} className="w-full">Log effort</Button>
        </EffortSection>

        {/* Logged effort — collapsible ledger accordion · total lives here, collapsed by default */}
        <EffortSection icon="ph-list-checks" title="Logged effort" open={activeSection === "ledger"} onToggle={() => setActiveSection((v) => v === "ledger" ? null : "ledger")} fillHeight={activeSection === "ledger"}
          meta={<React.Fragment>
            <span className="text-2xs font-data text-fg-tertiary">{entries.length}</span>
            <span className="text-2xs font-data font-semibold text-fg-brand bg-surface-brand-soft rounded-full py-[2px] px-2">{fmtHours(total)} total</span>
          </React.Fragment>}>

        {entries.length === 0 ? (
          <div className="py-5 px-0 text-center text-fg-tertiary text-xs">
            <i className="ph ph-timer text-[24px] block mb-2" />
            No effort logged yet. Use the form above to add the first entry.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((e, i) => (
              <div key={i} className="bg-surface-card border border-line-subtle rounded-md overflow-hidden">
                {/* Card body */}
                <div className="p-3">
                  {/* Assignee + hours + delete */}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={e.by || ""} size="xs" />
                    <span className="text-sm font-medium text-fg-primary min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{e.by}</span>
                    <span className="ml-auto text-xs font-data font-bold text-fg-brand bg-surface-brand-soft rounded-full py-[2px] px-2 shrink-0 whitespace-nowrap">{fmtHours(e.hours)}</span>
                    <button type="button" title="Delete this entry" aria-label="Delete this entry" onClick={() => onDelete && onDelete(i)}
                      className="inline-flex items-center justify-center size-6 rounded-sm border-none bg-transparent cursor-pointer text-fg-tertiary shrink-0 transition-[color,background-color] duration-fast ease-standard hover:text-status-error hover:bg-status-error-soft">
                      <i className="ph ph-trash text-[14px]" />
                    </button>
                  </div>
                  {/* Start → End stacked */}
                  <div className="grid grid-cols-[14px_1fr] gap-y-[3px] gap-x-2 items-center text-xs font-data text-fg-secondary mb-1">
                    <i className="ph ph-play-circle text-[13px] text-fg-tertiary" />
                    <span><span className={LEDGER_EYEBROW}>Start</span>{e.startLabel}</span>
                    <i className="ph ph-stop-circle text-[13px] text-fg-tertiary" />
                    <span><span className={LEDGER_EYEBROW}>End</span>{e.endLabel}</span>
                  </div>
                  {/* Logged on + add-note icon (no note yet) */}
                  <div className="flex items-center gap-1 text-2xs text-fg-tertiary">
                    <i className="ph ph-clock text-[12px]" />
                    <span>Logged on {e.loggedOn}</span>
                    {!e.note && (
                      <button type="button" title="Add a note" aria-label="Add a note" onClick={() => { setNoteModal(i); setNoteDraft(""); }}
                        className="ml-auto inline-flex items-center gap-1 border-none bg-transparent cursor-pointer text-fg-tertiary text-2xs py-[2px] px-1 rounded-sm transition-[color] duration-fast ease-standard hover:text-fg-brand">
                        <i className="ph ph-note-pencil text-[13px]" /> Add note
                      </button>
                    )}
                  </div>
                </div>
                {/* With-note variant: separator + note text */}
                {e.note && (
                  <>
                    <div className="h-px bg-line-subtle mx-3" />
                    <div className="py-2 px-3 flex items-start gap-2">
                      <i className="ph ph-note text-[13px] text-fg-brand shrink-0 mt-[2px]" />
                      <span className="text-xs text-fg-secondary leading-normal flex-1 min-w-0 [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: e.note }} />
                      <button type="button" title="Edit note" aria-label="Edit note" onClick={() => { setNoteModal(i); setNoteDraft(e.note); }}
                        className="inline-flex border-none bg-transparent cursor-pointer text-fg-tertiary p-[2px] rounded-sm shrink-0 transition-[color] duration-fast ease-standard hover:text-fg-brand">
                        <i className="ph ph-pencil-simple text-[12px]" />
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
        <div className="absolute inset-0 z-[20] flex flex-col justify-end bg-[rgba(0,0,0,0.32)] [backdrop-filter:blur(2px)]"
          onClick={(ev) => { if (ev.target === ev.currentTarget) setNoteModal(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="agni-note-editor-title" ref={noteRef}
            onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setNoteModal(null); } }}
            className="bg-surface-card rounded-t-lg pt-4 px-4 pb-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <i aria-hidden="true" className="ph ph-note-pencil text-[18px] text-fg-brand" />
              <span id="agni-note-editor-title" className="text-sm font-semibold text-fg-primary">
                {entries[noteModal] && entries[noteModal].note ? "Edit note" : "Add note"}
              </span>
              <button type="button" onClick={() => setNoteModal(null)} title="Cancel"
                className="ml-auto inline-flex border-none bg-transparent cursor-pointer text-fg-tertiary p-1 rounded-sm">
                <i className="ph ph-x text-[16px]" />
              </button>
            </div>
            <RichTextEditor key={noteModal} value={noteDraft} onChange={setNoteDraft} minHeight={104}
              placeholder="Add context, blockers or remarks…" />
            <div className="flex gap-2">
              {entries[noteModal] && entries[noteModal].note && (
                <button type="button" onClick={() => { onEditNote && onEditNote(noteModal, ""); setNoteModal(null); }}
                  className="flex-1 min-w-0 h-[36px] rounded-md border border-line-default bg-transparent cursor-pointer font-sans text-sm text-status-error font-medium">
                  Remove note
                </button>
              )}
              <button type="button" disabled={!noteHasText(noteDraft)}
                onClick={() => { onEditNote && onEditNote(noteModal, noteHasText(noteDraft) ? noteDraft : ""); setNoteModal(null); }}
                className={[
                  "flex-[2] h-[36px] rounded-md border-none font-sans text-sm font-semibold",
                  noteHasText(noteDraft)
                    ? "bg-action-brand text-fg-on-brand cursor-pointer"
                    : "bg-surface-sunken text-[var(--text-quaternary)] cursor-not-allowed",
                ].join(" ")}>
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

const BANNER_TONE = {
  rejected: { wrap: "bg-status-error-soft", ink: "text-status-error", icon: "ph-x-circle" },
  overdue:  { wrap: "bg-status-warning-soft", ink: "text-status-warning", icon: "ph-user-check" },
  assigned: { wrap: "bg-status-success-soft", ink: "text-status-success", icon: "ph-user-check" },
  done:     { wrap: "bg-status-success-soft", ink: "text-status-success", icon: "ph-check-circle" },
  pending:  { wrap: "bg-surface-sunken", ink: "text-fg-tertiary", icon: "ph-info" },
};
function ResolutionBanner({ status, resolution }) {
  /* banner: pending · approved · approved+assigned · rejected · overdue */
  const rejected = status === "Rejected";
  const done = status === "Approved" || status === "Completed";
  const assigned = status === "Yet to start" || status === "In Progress" || status === "Overdue";
  const overdue = status === "Overdue";
  const t = BANNER_TONE[rejected ? "rejected" : overdue ? "overdue" : assigned ? "assigned" : done ? "done" : "pending"];
  const label = rejected ? "Request rejected" : assigned ? (overdue ? "Approved & assigned · overdue" : "Approved & assigned") : done ? "Request approved" : status;
  return (
    <div className={["flex items-start gap-3 p-3 rounded-md", t.wrap].join(" ")}>
      <span className={["text-[19px] shrink-0 leading-none mt-px", t.ink].join(" ")}><i className={"ph-fill " + t.icon} /></span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-fg-primary">
          {label}
          {resolution && resolution.by && <span className="font-normal text-fg-secondary"> · {resolution.by}{resolution.on ? " · " + resolution.on : ""}</span>}
        </div>
        {resolution && resolution.remark && (
          <div className="text-xs text-fg-secondary mt-[3px] leading-normal">
            “{resolution.remark}”
          </div>
        )}
      </div>
    </div>
  );
}
