import React from "react";

/* ── Types (mirrored in Tag.d.ts) ── */
export type TagTone = "done" | "doing" | "todo" | "error" | "warning" | "pending" | "blocked" | "brand" | "neutral";

export interface TagProps {
  children?: React.ReactNode;
  /** "status" — tone pill · "chip" — removable token. Inferred from tone/status/onRemove. */
  variant?: "status" | "chip";
  /** Semantic tone. Ignored when `status` resolves one. */
  tone?: TagTone;
  /** Record status string — resolved to a tone through the shared map. */
  status?: string;
  /** Leading dot. Defaults on for `status`, off elsewhere. */
  dot?: boolean;
  /** @default "md" */
  size?: "sm" | "md";
  /** chip only — accent hex for the leading dot. */
  color?: string | null;
  /** chip only — renders the close button. */
  onRemove?: (() => void) | null;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * AgniUI · Tag
 * One label component. `variant="status"` is the tone pill (was Badge /
 * StatusChip); `variant="chip"` is the removable filter token. `status` maps a
 * record status to a tone through STATUS_TONE so one term always reads the same
 * colour. Badge and StatusChip remain as internal renderers only.
 *
 * Tailwind v4 (migrated Aug 2026). Tone and size are FULL literal class strings
 * picked from a lookup table — never assembled — so the compiler can see them.
 * The remove button's hover is pure CSS: no React state, no re-render per
 * pointer move.
 */
const STATUS_TONE: Record<string, TagTone> = {
  "Approved": "done", "Completed": "done", "Closed": "done", "Done": "done",
  "In Review": "doing", "In Progress": "doing", "Reviewing": "doing",
  "Awaiting Approval": "pending", "Pending": "pending", "Queued": "pending",
  "Draft": "neutral", "Yet to start": "neutral",
  "Overdue": "warning", "On Hold": "warning",
  "Rejected": "error", "Failed": "error", "Cancelled": "error",
  "Blocked": "blocked",
};

/* Layer-3 tone tokens have no Tailwind namespace of their own, so they are
   reached as arbitrary values. Full strings only (README rule 1). */
const TONE_CLS: Record<TagTone, string> = {
  done:    "text-[var(--tone-done-fg)] bg-[var(--tone-done-bg)]",
  doing:   "text-[var(--tone-doing-fg)] bg-[var(--tone-doing-bg)]",
  todo:    "text-[var(--tone-todo-fg)] bg-[var(--tone-todo-bg)]",
  error:   "text-[var(--tone-error-fg)] bg-[var(--tone-error-bg)]",
  warning: "text-[var(--tone-warning-fg)] bg-[var(--tone-warning-bg)]",
  pending: "text-[var(--tone-pending-fg)] bg-[var(--tone-pending-bg)]",
  blocked: "text-[var(--tone-blocked-fg)] bg-[var(--tone-blocked-bg)]",
  brand:   "text-[var(--tone-brand-fg)] bg-[var(--tone-brand-bg)]",
  neutral: "text-[var(--tone-todo-fg)] bg-[var(--tone-todo-bg)]",
};

const STATUS_BASE =
  "inline-flex items-center gap-1 font-sans font-semibold leading-none " +
  "tracking-[0.01em] whitespace-nowrap rounded-full";
const STATUS_SIZE = {
  sm: "text-2xs px-1.5 py-0.5",
  md: "text-xs px-2 py-[3px]",
} as const;
const DOT_SIZE = { sm: "size-[5px]", md: "size-[6px]" } as const;

const CHIP_BASE =
  "inline-flex items-center gap-1 py-[3px] pl-2 font-sans text-xs font-medium " +
  "leading-none whitespace-nowrap text-fg-secondary bg-surface-soft " +
  "border border-line-subtle rounded-sm";

const REMOVE_CLS =
  "inline-flex items-center justify-center size-4 ml-px p-0 border-none " +
  "cursor-pointer rounded-xs text-[12px] bg-transparent text-fg-tertiary " +
  "transition-[background-color,color] duration-fast " +
  "hover:bg-state-press hover:text-fg-primary";

export function Tag({
  children,
  variant,
  tone,
  status,
  dot,
  size = "md",
  color = null,
  onRemove = null,
  style = {},
  className = "",
  ...rest
}: TagProps) {
  const kind = variant || (tone || status ? "status" : "chip");

  if (kind === "status") {
    const t = tone || STATUS_TONE[status as string] || "neutral";
    const showDot = dot ?? !!status;
    return (
      <span
        className={[STATUS_BASE, STATUS_SIZE[size] || STATUS_SIZE.md, TONE_CLS[t] || TONE_CLS.neutral, className].join(" ")}
        style={style}
        {...rest}
      >
        {showDot && <span className={[DOT_SIZE[size] || DOT_SIZE.md, "rounded-full bg-current shrink-0"].join(" ")} />}
        {children || status}
      </span>
    );
  }

  return (
    <span
      className={[CHIP_BASE, onRemove ? "pr-1" : "pr-2", className].join(" ")}
      style={style}
      {...rest}
    >
      {(dot ?? !!color) && (
        <span
          className="size-[7px] rounded-full shrink-0"
          /* Runtime-computed accent — cannot be a static class. */
          style={{ background: color || "var(--text-secondary)" }}
        />
      )}
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove" className={REMOVE_CLS}>
          <i className="ph ph-x" />
        </button>
      )}
    </span>
  );
}

/** Resolve a record status to its tone. Exposed so apps can extend / inspect the map. */
Tag.toneFor = (status: string): TagTone => STATUS_TONE[status] || "neutral";
/** The shared status → tone map. */
Tag.statusTones = STATUS_TONE;
