import React from "react";
import { useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in ApprovalStepper.d.ts) ── */
export interface ApprovalStep {
  label: React.ReactNode;
  status: "done" | "current" | "pending" | "rejected";
  actor?: string;
  ts?: string;
  /** Optional detail line shown in the hover popover when `interactive`. */
  detail?: string;
}
export interface ApprovalStepperProps extends React.HTMLAttributes<HTMLOListElement> {
  steps?: ApprovalStep[];
  orientation?: "horizontal" | "vertical";
  /** Reveal a hover/focus popover (actor · ts · detail) on each node. */
  interactive?: boolean;
  style?: React.CSSProperties;
}
/** Multi-stage approval progress indicator. */


/**
 * AgniUI · ApprovalStepper
 * Multi-stage approval progress. steps: [{label, status, actor?, ts?, detail?}]
 * where status ∈ done | current | pending | rejected. Horizontal or vertical.
 *
 * Pass `interactive` to reveal a hover/focus popover on each node showing the
 * actor, timestamp and an optional `detail` line — used inside record-detail
 * views where the inline actor/ts would crowd the rail.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10b). The `hover` index STAYS: the
 * popover opens on focus as well as hover, so pointer and keyboard share one
 * piece of state — the same exemption CommandPalette's active index has. Rule
 * 2 is about hover styling held in state, not state two input methods share.
 * The tooltip's entrance animation stays inline; it references keyframes this
 * component ships itself.
 */
const NODE = {
  done:     { cls: "bg-status-success text-fg-on-brand border-0 [box-shadow:none]", icon: "ph-check",       line: "bg-status-success" },
  current:  { cls: "bg-status-warning text-fg-on-brand border-0 [box-shadow:0_0_0_4px_var(--status-warning-soft)]", icon: "ph-dot-outline", line: "bg-line-default" },
  pending:  { cls: "bg-surface-sunken text-fg-tertiary border-[1.5px] border-line-default [box-shadow:none]", icon: "",       line: "bg-line-default" },
  rejected: { cls: "bg-status-error text-fg-on-brand border-0 [box-shadow:none]",   icon: "ph-x",           line: "bg-status-error" },
};
const CIRCLE = "size-[28px] rounded-full inline-flex items-center justify-center text-[15px] shrink-0 font-data font-semibold outline-none relative";
const TIP =
  "absolute bottom-[calc(100%+10px)] left-1/2 [transform:translateX(-50%)] z-tooltip w-max max-w-[220px] " +
  "text-left whitespace-normal p-2 rounded-md bg-surface-inverse text-fg-inverse shadow-e-lg pointer-events-none";
const STATUS_TEXT = { rejected: "Rejected", current: "Awaiting action", done: "Completed" };

/* An ordered list of steps: the current one carries aria-current="step", each
   marker speaks its full state ("Step 2 of 4: Manager approval, Completed"),
   and the interactive detail tip describes the focused marker and closes on
   Escape. The ref is the list element. */
export const ApprovalStepper = React.forwardRef<HTMLOListElement, ApprovalStepperProps>(function ApprovalStepper(
  { steps = [], orientation = "horizontal", interactive = false, style = {}, ...rest },
  ref,
) {
  const vert = orientation === "vertical";
  const [hover, setHover] = React.useState(-1);
  const base = useStableId(null, "agni-steps");
  return (
    <ol {...rest} ref={ref} className={["flex m-0 p-0", vert ? "flex-col items-stretch" : "flex-row items-start"].join(" ")} style={{ listStyle: "none", ...style }}>
      {steps.map((s, i) => {
        const n = NODE[s.status] || NODE.pending;
        const last = i === steps.length - 1;
        const tipOpen = interactive && hover === i && (s.actor || s.ts || s.detail);
        const tipId = `${base}-tip-${i}`;
        const spoken = `Step ${i + 1} of ${steps.length}: ${typeof s.label === "string" ? s.label : ""}, ${STATUS_TEXT[s.status as keyof typeof STATUS_TEXT] || "Not started"}`;
        const circle = (
          <div
            role="img"
            aria-label={spoken}
            aria-describedby={tipOpen ? tipId : undefined}
            onKeyDown={interactive ? (e) => { if (e.key === "Escape" && hover === i) setHover(-1); } : undefined}
            tabIndex={interactive ? 0 : undefined}
            onMouseEnter={interactive ? () => setHover(i) : undefined}
            onMouseLeave={interactive ? () => setHover(-1) : undefined}
            onFocus={interactive ? () => setHover(i) : undefined}
            onBlur={interactive ? () => setHover(-1) : undefined}
            className={[CIRCLE, n.cls, interactive ? "cursor-help" : "cursor-default", tipOpen ? "z-[5]" : "z-[1]"].join(" ")}
          >
            {n.icon ? <i aria-hidden="true" className={"ph-bold " + n.icon} /> : <span aria-hidden="true">{i + 1}</span>}
            {tipOpen && (
              <span id={tipId} role="tooltip" className={TIP} style={{ animation: "agni-step-tip var(--dur-fast) var(--ease-standard)" }}>
                <span className="block font-sans text-xs font-semibold capitalize">
                  {STATUS_TEXT[s.status] || "Not started"}
                </span>
                {s.actor && <span className="block font-sans text-xs opacity-[0.9] mt-[2px]">{s.actor}</span>}
                {s.detail && <span className="block font-sans text-2xs opacity-[0.78] mt-[3px] leading-[1.4]">{s.detail}</span>}
                {s.ts && <span className="block font-data text-2xs opacity-[0.72] mt-[3px]">{s.ts}</span>}
                <span className="absolute top-full left-1/2 [transform:translateX(-50%)] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-surface-inverse" />
              </span>
            )}
          </div>
        );
        return (
          <li key={i} aria-current={s.status === "current" ? "step" : undefined} className={["flex relative", vert ? "flex-row items-start flex-none gap-3" : "flex-col items-center flex-1 gap-0"].join(" ")}>
            <div className={["flex items-center", vert ? "flex-col w-auto" : "flex-row w-full"].join(" ")}>
              {!vert && <div className={["flex-1 min-w-0 h-[2px]", i > 0 ? (NODE[steps[i-1].status] || NODE.pending).line : "bg-transparent"].join(" ")} />}
              {circle}
              {!vert && <div className={["flex-1 min-w-0 h-[2px]", !last ? n.line : "bg-transparent"].join(" ")} />}
              {vert && !last && <div className={["w-[2px] flex-1 min-h-[26px] my-[2px]", n.line].join(" ")} />}
            </div>
            <div className={["max-w-full min-w-0", vert ? "text-left mt-[2px] pt-[2px] pb-[14px] px-0" : "text-center mt-2 py-0 px-1"].join(" ")}>
              <div className={["text-sm font-semibold leading-tight", s.status === "pending" ? "text-fg-tertiary" : "text-fg-primary"].join(" ")}>{s.label}</div>
              {!interactive && s.actor && <div className="text-xs text-fg-tertiary mt-px">{s.actor}</div>}
              {!interactive && s.ts && <div className="text-2xs text-fg-tertiary font-data mt-px">{s.ts}</div>}
            </div>
          </li>
        );
      })}
      <style>{`@keyframes agni-step-tip{from{opacity:0;transform:translateX(-50%) translateY(4px)}}`}</style>
    </ol>
  );
});
