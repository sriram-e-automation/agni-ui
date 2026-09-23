/**
 * @internal Renderer behind the public <Panel> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef } from "react";
import { useControllableState, useStableId } from "../../utils/interaction.tsx";
import { resolvePanelBody } from "../../utils/panelState.tsx";

/* ── Types (mirrored in Panel.d.ts) ── */
export interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  icon?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  collapsible?: boolean;
  /** Controlled expanded state (collapsible). */
  expanded?: boolean;
  /** Initial expanded state (collapsible). @default true */
  defaultOpen?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
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
 * A named region (labelled by its title). Collapsible: the title is a
 * disclosure <button aria-expanded aria-controls>; actions stay separate
 * controls beside it rather than nested inside the toggle.
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

export const PanelBase = forwardRef<HTMLElement, PanelProps>(function PanelBase({
  title, icon = null, actions = null, children, collapsible = false, expanded, defaultOpen = true, onExpandedChange,
  pad = true, style = {}, loading = false, loadingShape = "paragraph", empty = null, error = null, onRetry, id, className = "", ...rest
}, ref) {
  const [open, setOpen] = useControllableState<boolean>({ value: expanded, defaultValue: defaultOpen, onChange: onExpandedChange });
  const base = useStableId(id, "agni-panel");
  const titleId = base + "-title";
  const bodyId = base + "-body";
  /* One resolver for all three variants — see panelState.tsx. An inline panel
     has no footer to suppress, so only `body` is used here. */
  const { body } = resolvePanelBody({ children, loading, loadingShape, empty, error, onRetry, size: "sm" });
  const heading = (
    <>
      {collapsible && <i aria-hidden="true" className={[open ? "ph ph-caret-down" : "ph ph-caret-right", CARET].join(" ")} />}
      {icon && <i aria-hidden="true" className={["ph", icon, "text-[17px] text-fg-brand shrink-0"].join(" ")} />}
      <span id={titleId} className={TITLE}>{title}</span>
    </>
  );
  return (
    <section {...rest} ref={ref} id={id} aria-labelledby={rest["aria-labelledby"] ?? (title ? titleId : undefined)}
      aria-busy={loading || undefined} className={[SHELL, className].join(" ")} style={style}>
      {(title || actions) && (
        <header className={[HEAD, open ? HEAD_OPEN : "", "cursor-default"].join(" ")}>
          {collapsible ? (
            <button type="button" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(!open)}
              className="flex items-center gap-2 flex-1 min-w-0 border-none bg-transparent p-0 text-left cursor-pointer font-sans rounded-xs">
              {heading}
            </button>
          ) : heading}
          {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div id={bodyId} hidden={!open} className={pad ? "p-4" : "p-0"}>{open && body}</div>
    </section>
  );
});
