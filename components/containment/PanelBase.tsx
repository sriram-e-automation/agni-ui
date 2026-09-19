/**
 * @internal Renderer behind the public <Panel> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState } from "react";
import { resolvePanelBody } from "./panelState.tsx";

/* ── Types (mirrored in Panel.d.ts) ── */
export interface PanelProps {
  title?: React.ReactNode;
  icon?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  pad?: boolean;
  style?: React.CSSProperties;
  /** Shimmer the body, header intact. */
  loading?: boolean;
  /** Which Loading shape the body shimmers as. @default "paragraph" */
  loadingShape?: string;
  /** Shown instead of children when there is nothing to show. */
  empty?: React.ReactNode;
  /** Failure in the body. String/true → the DS ErrorState; node → as given. */
  error?: React.ReactNode | boolean;
  /** Retry action on the error state. */
  onRetry?: () => void;
}
/** Section container with header + optional collapse. */

/**
 * AgniUI · Panel
 * Section container with a header (title + actions) and optional collapse.
 * Lighter than Card — for grouping fields/widgets inside a page region.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 5). The body's padding moved from a
 * literal 16 to `p-4`, which is the same 16px at scale 1 but now tracks
 * `data-scale` like every other spacing step in the system. That is the
 * intended behaviour of the spacing scale — unlike control HEIGHTS, which ride
 * density and are deliberately not spacing steps.
 */
const SHELL = "bg-[var(--panel-bg)] border border-line-subtle rounded-lg overflow-hidden";
const HEAD = "flex items-center gap-2 px-3 py-2 select-none";
const HEAD_OPEN = "border-b border-line-subtle";
const CARET = "text-[14px] text-fg-tertiary shrink-0";
const TITLE = "flex-1 min-w-0 text-sm font-semibold text-fg-primary";

export function PanelBase({ title, icon = null, actions = null, children, collapsible = false, defaultOpen = true, pad = true, style = {}, loading = false, loadingShape = "paragraph", empty = null, error = null, onRetry }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  /* One resolver for all three variants — see panelState.tsx. An inline panel
     has no footer to suppress, so only `body` is used here. */
  const { body } = resolvePanelBody({ children, loading, loadingShape, empty, error, onRetry, size: "sm" });
  return (
    <section className={SHELL} style={style}>
      {(title || actions) && (
        <header
          onClick={collapsible ? () => setOpen((o) => !o) : undefined}
          className={[HEAD, open ? HEAD_OPEN : "", collapsible ? "cursor-pointer" : "cursor-default"].join(" ")}
        >
          {collapsible && <i className={[open ? "ph ph-caret-down" : "ph ph-caret-right", CARET].join(" ")} />}
          {icon && <i className={["ph", icon, "text-[17px] text-fg-brand shrink-0"].join(" ")} />}
          <span className={TITLE}>{title}</span>
          {actions && <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>{actions}</div>}
        </header>
      )}
      {open && <div className={pad ? "p-4" : "p-0"}>{body}</div>}
    </section>
  );
}
