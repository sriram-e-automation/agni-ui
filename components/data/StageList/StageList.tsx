import React from "react";
import { Tag } from "../../primitives/Tag/Tag.tsx";
import { Button } from "../../primitives/Button/Button.tsx";
import { resolveDataState } from "../../utils/DataState.tsx";
import { roleAllows } from "../../utils/RoleGate.tsx";

/* ── Types (mirrored in StageList.d.ts) ── */
export type StageState = "todo" | "active" | "done" | "blocked" | "skipped";
export interface StageAction {
  key: string;
  label: string;
  icon?: string;
  /** @default "secondary" */
  category?: "primary" | "secondary" | "ghost";
  /** States this action appears on. Omit = every state. */
  when?: StageState[];
}
export interface RecordStage {
  key: string;
  label: string;
  meta?: React.ReactNode;
  icon?: string;
  state: StageState;
  actions?: StageAction[];
  /** Flow key a host opens when the row's primary action fires. */
  flow?: string;
}
export interface StageListProps {
  stages?: RecordStage[];
  onAction?: (stage: RecordStage, action: StageAction) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  style?: React.CSSProperties;
}

/**
 * AgniUI · StageList
 * An ordered pipeline: numbered stage rows, each with a state tone, one line of
 * meta and its own row actions. Shape-only — nothing here knows what the stages
 * are for, so a procurement pipeline, an onboarding checklist and a test plan
 * all render through it.
 *
 * The five states map onto the shared tone vocabulary through `Tag`, so no
 * module invents its own stage colours: todo → todo · active → doing ·
 * done → done · blocked → blocked · skipped → pending.
 *
 * Also mounted by `RecordDetailModal` when it is handed `stages`.
 */
const STATE_META = {
  todo:    { tone: "todo",    label: "Yet to start", icon: "ph-circle-dashed" },
  active:  { tone: "doing",   label: "In progress",  icon: "ph-play-circle" },
  done:    { tone: "done",    label: "Completed",    icon: "ph-check-circle" },
  blocked: { tone: "blocked", label: "Blocked",      icon: "ph-prohibit" },
  skipped: { tone: "pending", label: "Skipped",      icon: "ph-arrow-bend-right-up" },
} as const;

const ROW = {
  display: "flex", alignItems: "flex-start", gap: "var(--space-3)",
  padding: "var(--space-3) var(--space-4)", background: "var(--surface-card)",
  border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)",
};
const SEQ = {
  width: 26, height: 26, flexShrink: 0, marginTop: 1, borderRadius: "var(--radius-full)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", fontWeight: "var(--fw-semibold)",
};

export const StageList = React.forwardRef<HTMLOListElement, StageListProps>(function StageList({ stages = [], onAction, loading = false, empty = "No stages yet", error = null, onRetry, role = "", style = {} }, ref) {
  const state = resolveDataState({
    loading, error, onRetry,
    isEmpty: !stages.length, empty,
    shape: "list", rows: 4, emptyIcon: "ph-list-checks",
  });
  if (state !== false) return <React.Fragment>{state}</React.Fragment>;

  return (
    <ol ref={ref as never} style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {stages.map((s, i) => {
        const meta = STATE_META[s.state] || STATE_META.todo;
        const muted = s.state === "skipped";
        const acts = (s.actions || []).filter((a) => (!a.when || a.when.includes(s.state)) && roleAllows(role, a.roles));
        return (
          <li key={s.key || i} style={ROW}>
            <span style={{
              ...SEQ,
              background: s.state === "done" ? "var(--tone-done-bg)" : muted ? "var(--surface-sunken)" : "var(--surface-brand-soft)",
              color: s.state === "done" ? "var(--tone-done-fg)" : muted ? "var(--text-tertiary)" : "var(--text-brand)",
            }}>
              {s.state === "done" ? <i className="ph-bold ph-check" style={{ fontSize: 13 }} /> : i + 1}
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {s.icon && <i className={"ph " + s.icon} style={{ fontSize: 15, color: "var(--text-tertiary)", flexShrink: 0 }} />}
                <span style={{
                  fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)",
                  color: muted ? "var(--text-tertiary)" : "var(--text-primary)",
                  textDecoration: muted ? "line-through" : "none",
                }}>{s.label}</span>
                <Tag tone={meta.tone} size="sm">{meta.label}</Tag>
              </span>
              {s.meta != null && (
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", lineHeight: "var(--leading-snug)" }}>{s.meta}</span>
              )}
            </span>
            {acts.length > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
                {acts.map((a) => (
                  <Button key={a.key} size="sm" category={a.category || "secondary"}
                    icon={a.icon ? <i className={"ph " + a.icon} /> : undefined}
                    onClick={() => onAction && onAction(s, a)}>{a.label}</Button>
                ))}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
});
