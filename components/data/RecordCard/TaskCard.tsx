/**
 * @internal Preset renderer behind the public <RecordCard> — not part of the documented
 * API (no .d.ts, no specimen card). Use RecordCard with the matching preset.
 */
import React, { useState } from "react";
import { Modal } from "../feedback/Modal.tsx";
import { Button } from "../core/Button.tsx";
import { Avatar } from "../core/Avatar.tsx";
import { AvatarStack } from "../core/AvatarStack.tsx";

export interface TaskEffort { total?: string; intervals?: number; running?: boolean; current?: string; startedAt?: string; }
export interface TaskCardData {
  id: string; requestType?: string; requestedBy?: string; requestedFor?: string;
  app?: { name: string; icon: string };
  assignee?: string; assignees?: string[]; assignedOn?: string; startedOn?: string; dueSince?: string;
  effort?: TaskEffort;
}
export interface TaskCardProps {
  card: TaskCardData;
  /** Lane label — drives the status chip tone + date field ("Overdue" / "In progress" / "Yet to start"). */
  lane?: string;
  onView?: () => void;
  onQuickComplete?: () => void;
  /** Called with (card, notes) when the stop-logging dialog is confirmed. */
  onStopLogging?: (card: TaskCardData, notes: string) => void;
  onStartLogging?: (card: TaskCardData) => void;
  selected?: boolean;
  /** Lane label → kanban tone token group (defaults cover Overdue / In progress / Yet to start). */
  laneTones?: Record<string, string>;
  /** App name → accent color for the app strip. */
  appColors?: Record<string, string>;
}

const DEFAULT_LANE_TONES = { "Overdue": "overdue", "In progress": "progress", "Yet to start": "todo", "Completed": "done", "Rejected": "rejected" };
const DEFAULT_APP_COLORS = { Procurement: "var(--text-brand)", Fabrication: "var(--status-warning)", IT: "var(--hue-info)", Facilities: "var(--hue-violet)" };

/**
 * AgniUI · TaskCard
 * Assignment card for task lists / workspace panels — app strip + lane chip,
 * ID / dates / assignee grid, an effort-logging block (running banner, ongoing
 * session or logged-total row) and quick actions: ✓ complete, start/stop
 * logging (stop opens a save-log dialog with notes).
 */
export function TaskCard({ card, lane = "Yet to start", onView, onQuickComplete, onStopLogging, onStartLogging, selected, laneTones, appColors }: TaskCardProps) {
  const [hov, setHov] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [endAt, setEndAt] = useState(null);
  const [notes, setNotes] = useState("");
  const tone = (laneTones || DEFAULT_LANE_TONES)[lane] || "todo";
  const appName = card.app ? card.app.name : "General";
  const appIcon = card.app ? card.app.icon : "ph-squares-four";
  const appClr = (appColors || DEFAULT_APP_COLORS)[appName] || "var(--text-brand)";
  const dueLbl = lane === "Overdue" ? "Overdue since" : lane === "In progress" ? "Started on" : "Assigned on";
  const dueVal = lane === "Overdue" ? card.dueSince : lane === "In progress" ? card.startedOn : card.assignedOn;
  const who = card.assignee || card.requestedBy;
  const team = Array.isArray(card.assignees) && card.assignees.length > 1 ? card.assignees : null;
  const active = lane === "In progress" || lane === "Overdue";
  const effort = active ? card.effort : null;
  const running = !!(effort && effort.running);
  const fLbl = { fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 3 };
  const fVal = { fontSize: "var(--text-xs)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  const fMono = { ...fVal, fontFamily: "var(--font-data)" };
  const fmtClock = (d) => d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";
  const openStop = (e) => { e.stopPropagation(); setEndAt(new Date()); setNotes(""); setStopOpen(true); };
  const confirmStop = () => { onStopLogging && onStopLogging(card, notes); setStopOpen(false); };
  return (
    <div onClick={onView} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: selected ? "var(--surface-brand-soft)" : "var(--surface-card)",
        border: "1.5px solid " + (running ? "var(--status-success)" : (selected || hov) ? "var(--action-brand)" : "var(--border-subtle)"),
        borderRadius: "var(--radius-lg)", overflow: "hidden", cursor: "pointer", flexShrink: 0,
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast), background var(--dur-fast)",
        boxShadow: running ? "0 0 0 3px var(--status-success-soft)" : (selected || hov) ? "0 0 0 3px var(--surface-brand-soft)" : "none" }}>
      <style>{`@keyframes agni-effort-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.45; transform:scale(0.8); } }`}</style>
      {running && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", background: "var(--status-success-soft)", borderBottom: "1px solid var(--status-success)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--status-success)", flexShrink: 0, animation: "agni-effort-pulse 1.4s ease-in-out infinite" }} />
          <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-bold)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--status-success)", flex: 1 , minWidth: 0}}>Logging effort</span>
          <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-data)", fontWeight: "var(--fw-semibold)", color: "var(--status-success)" }}>{effort.current}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", padding: "var(--space-2) var(--space-3) var(--space-2)", borderBottom: "1px solid var(--border-subtle)" }}>
        <i className={"ph " + appIcon} style={{ fontSize: 14, color: appClr }} />
        <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-bold)", letterSpacing: "0.06em", textTransform: "uppercase", color: appClr, flex: 1 , minWidth: 0}}>{appName}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", color: `var(--kanban-${tone}-label)`, background: `var(--kanban-${tone}-bg)`, border: `1px solid var(--kanban-${tone}-bdr)`, borderRadius: "var(--radius-full)", padding: "2px var(--space-2)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: `var(--kanban-${tone}-dot)` }} />{lane}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-3) 0" }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>{card.requestType}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3) var(--space-2)", padding: "var(--space-3) var(--space-3) var(--space-3)" }}>
        <div><div style={fLbl}>Task ID</div><div style={fMono}>{card.id}</div></div>
        <div><div style={fLbl}>{dueLbl}</div><div style={{ ...fMono, color: lane === "Overdue" ? "var(--status-error)" : "var(--text-primary)", fontWeight: lane === "Overdue" ? "var(--fw-semibold)" : "var(--fw-regular)" }}>{dueVal || "—"}</div></div>
        <div style={{ minWidth: 0 }}><div style={fLbl}>{team ? "Assignees" : "Assignee"}</div>
          {team
            ? <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minWidth: 0 }}>
                <AvatarStack names={team} />
                <span style={{ ...fVal, color: "var(--text-tertiary)" }}>{team.length} people</span>
              </div>
            : <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", minWidth: 0 }}>
                <Avatar name={who} size="xs" />
                <span style={fVal}>{who}</span>
              </div>}
        </div>
        <div style={{ minWidth: 0 }}><div style={fLbl}>Requested for</div><div style={fVal}>{card.requestedFor}</div></div>
      </div>
      {effort && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", margin: "0 var(--space-3) var(--space-3)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--surface-soft)", border: "1px solid var(--border-subtle)" }}>
          <i className="ph ph-timer" style={{ fontSize: 16, color: running ? "var(--status-success)" : "var(--text-secondary)" }} />
          {running ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Ongoing session</span>
                <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-data)", fontWeight: "var(--fw-semibold)", color: "var(--status-success)" }}>{effort.current} elapsed</span>
              </div>
              <span style={{ fontSize: "var(--text-2xs)", fontFamily: "var(--font-data)", color: "var(--text-secondary)", background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)", padding: "2px var(--space-2)", whiteSpace: "nowrap" }}>since {effort.startedAt || "—"}</span>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Effort logged</span>
                <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-data)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>{effort.total}</span>
              </div>
              <span style={{ fontSize: "var(--text-2xs)", fontFamily: "var(--font-data)", color: "var(--text-secondary)", background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)", padding: "2px var(--space-2)", whiteSpace: "nowrap" }}>{effort.intervals} interval{effort.intervals === 1 ? "" : "s"}</span>
            </>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: "var(--space-2)", padding: "0 var(--space-3) var(--space-3)" }}>
        <button type="button" title="Mark as completed" onClick={(e) => { e.stopPropagation(); onQuickComplete && onQuickComplete(); }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 38, borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--status-success)", cursor: "pointer", flexShrink: 0, fontSize: 17, transition: "all var(--dur-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--status-success-soft)"; e.currentTarget.style.borderColor = "var(--status-success)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-card)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}>
          <i className="ph ph-check" />
        </button>
        {running
          ? <button type="button" onClick={openStop}
              style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", height: 38, borderRadius: "var(--radius-md)", border: "1px solid var(--status-error)", background: "var(--status-error-soft)", color: "var(--status-error)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", transition: "opacity var(--dur-fast)" , minWidth: 0}}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
              <i className="ph ph-stop-circle" style={{ fontSize: 16 }} /> Stop logging
            </button>
          : <button type="button" onClick={(e) => { e.stopPropagation(); onStartLogging && onStartLogging(card); }}
              style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", height: 38, borderRadius: "var(--radius-md)", border: "none", background: "var(--action-brand)", color: "#fff", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", transition: "opacity var(--dur-fast)" , minWidth: 0}}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
              <i className="ph ph-timer" style={{ fontSize: 16 }} /> Start logging
            </button>}
      </div>
      {stopOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Modal open={stopOpen} onClose={() => setStopOpen(false)} title="Save effort log" size="sm"
            footer={<>
              <Button category="secondary" onClick={() => setStopOpen(false)}>Cancel</Button>
              <Button category="primary" onClick={confirmStop}>Save log</Button>
            </>}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3) var(--space-2)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--surface-soft)", border: "1px solid var(--border-subtle)" }}>
                <div><div style={fLbl}>Start time</div><div style={fMono}>{effort && effort.startedAt || "—"}</div></div>
                <div><div style={fLbl}>End time</div><div style={fMono}>{fmtClock(endAt)}</div></div>
                <div><div style={fLbl}>Duration</div><div style={{ ...fMono, color: "var(--status-success)", fontWeight: "var(--fw-semibold)" }}>{effort && effort.current}</div></div>
              </div>
              <div>
                <div style={{ ...fLbl, marginBottom: "var(--space-1)" }}>Notes</div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="What did you work on during this session?"
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-primary)", background: "var(--surface-card)" }} />
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
