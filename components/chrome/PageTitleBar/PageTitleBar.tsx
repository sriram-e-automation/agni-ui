import React from "react";
import { useRovingFocus } from "../../utils/interaction.tsx";
import { Cluster } from "../../layout/Cluster/Cluster.tsx";
import { IconButton } from "../../primitives/Button/IconButton.tsx";
import { Tag } from "../../primitives/Tag/Tag.tsx";
import { renderActions, exportToAction, visibleActions } from "../../utils/actionSpec.tsx";
import { Loading } from "../../feedback/Loading/Loading.tsx";

export interface PageTab {
  key: string;
  label: string;
  count?: number;
  /** Scope this role can't open — rendered muted and inert. */
  disabled?: boolean;
}
export interface PageViewMode { key: string; icon: string; title?: string; }
export interface PageTitleBarProps {
  title?: string;
  /** Phosphor icon class for the title tile. */
  icon?: string;
  tabs?: PageTab[];
  tab?: string;
  onTabChange?: (key: string) => void;
  viewModes?: PageViewMode[];
  viewMode?: string;
  onViewModeChange?: (key: string) => void;
  /** One line under the title — record count, owner, last-updated. */
  subtitle?: React.ReactNode;
  /** Status pill beside the title. Passes straight to Tag. */
  badge?: { label: React.ReactNode; status?: string; tone?: string } | null;
  /** Back affordance at the left edge (record pages inside a list scope). */
  back?: { label?: string; onClick?: () => void } | null;
  /** Declarative page actions, right-edge, after the view switcher. */
  primaryAction?: any;
  secondaryActions?: any[];
  /** Records-page export, rendered as the first secondary action. */
  exportAction?: any;
  /** Viewer role — gates every action carrying a `roles` list. */
  role?: string;
  /** Right-edge extras; defaults to a ghost ⋮ button when no declarative
   *  action is given. Pass null to hide. */
  actions?: React.ReactNode;
  /** Dim and make the whole row inert. */
  disabled?: boolean;
  /** Shimmer the whole row (shape="pageTitleBar"). */
  loading?: boolean;
  /** Counts still arriving — renders a placeholder pill instead of nothing, so
   *  the tabs don't reflow when the numbers land. */
  countsLoading?: boolean;
}

/**
 * AgniUI · PageTitleBar
 * Page heading row: icon tile + title at left; segmented scope tabs (with
 * count pills), icon view-mode switcher, and an actions slot at right.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 6). Sep 2026: this track's values
 * were already the system standard (--agni-neutral-100 bed, literal #fff
 * active label) — TabsStrip's segmented variant and SegmentedControl now
 * match it, so all three pill tracks in the system are visually identical.
 *
 * The count placeholder's shimmer keeps its inline background-image: it is a
 * gradient + animation pair local to this component's keyframes.
 */
const TRACK = "flex gap-[2px] p-[3px] bg-[var(--agni-neutral-100)] rounded-md";
const TAB =
  "inline-flex items-center gap-1 border-none px-3 py-1 rounded-sm font-sans text-sm font-medium " +
  "transition-[background-color,color] duration-fast";
const TAB_ON = "bg-action-brand text-[#fff] shadow-e-xs cursor-pointer";
const TAB_OFF = "bg-transparent text-fg-tertiary cursor-pointer enabled:hover:text-fg-secondary";
const TAB_DIS = "bg-transparent text-fg-disabled cursor-not-allowed opacity-[0.7]";
const PILL = "text-2xs font-data font-semibold leading-none px-1 py-[2px] rounded-full";
const PILL_ON = "bg-[rgba(255,255,255,0.22)] text-[#fff]";
const PILL_OFF = "bg-surface-page text-fg-tertiary";
const VIEW_TRACK = "flex gap-px p-[2px] bg-[var(--agni-neutral-100)] rounded-md";
const VIEW_BTN =
  "size-[32px] border-none rounded-sm inline-flex items-center justify-center cursor-pointer text-[16px] " +
  "transition-[background-color,color] duration-fast";
const VIEW_ON = "bg-action-brand text-[#fff]";
const VIEW_OFF = "bg-transparent text-fg-tertiary hover:text-fg-secondary";
const TITLE = "inline-flex items-center gap-2 text-xl m-0 text-fg-primary";
const TILE = "size-[28px] rounded-sm bg-surface-brand-soft text-fg-brand inline-flex items-center justify-center text-[15px]";

const SUB = "m-0 mt-[2px] font-sans text-xs text-fg-tertiary";
const BACK = "inline-flex items-center gap-1 h-[26px] px-2 -ml-2 border-none bg-transparent rounded-sm font-sans text-xs font-medium text-fg-tertiary cursor-pointer hover:text-fg-brand hover:bg-surface-brand-soft transition-[background-color,color] duration-fast";

export const PageTitleBar = React.forwardRef<HTMLElement, PageTitleBarProps>(function PageTitleBar({ title, icon, tabs = [], tab, onTabChange, viewModes = [], viewMode, onViewModeChange, subtitle, badge = null, back = null, primaryAction, secondaryActions, exportAction, role, actions, disabled = false, loading = false, countsLoading = false }, ref) {
  const showViewModes = onViewModeChange && viewModes.length > 0;
  /* Scope tabs and the view switch are single-choice tracks with no panels:
     radio groups with roving focus — the same model as Tabs' pill track. */
  const scopeRoving = useRovingFocus({
    count: tabs.length, current: tabs.findIndex((t) => t.key === tab), orientation: "horizontal",
    isDisabled: (i) => !!tabs[i]?.disabled, onMove: (i) => onTabChange && onTabChange(tabs[i].key),
  });
  const viewRoving = useRovingFocus({
    count: viewModes.length, current: viewModes.findIndex((v) => v.key === viewMode), orientation: "horizontal",
    onMove: (i) => onViewModeChange && onViewModeChange(viewModes[i].key),
  });
  if (loading) return <Loading ref={ref as never} loading shape="pageTitleBar" />;

  const exp = exportToAction(exportAction, role);
  const specs = [...(exp ? [exp] : []), ...(secondaryActions || []), ...(primaryAction ? [{ kind: "primary", ...primaryAction }] : [])];
  const declared = visibleActions(specs, role);
  const rendered = renderActions(specs, { role, size: "md", disabled, keyPrefix: "pt" });
  const trailing = actions === undefined
    ? (declared.length ? null : <IconButton icon={<i className="ph ph-dots-three-vertical" />} variant="ghost" title="More" disabled={disabled} />)
    : actions;

  return (
    <Cluster ref={ref as never} wrap justify="space-between" gap="default" style={{ alignItems: "center", rowGap: "var(--space-2)", opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div className="min-w-0">
        {back && (
          <button type="button" className={BACK} onClick={back.onClick}>
            <i aria-hidden="true" className="ph-bold ph-arrow-left" />{back.label || "Back"}
          </button>
        )}
        <h1 className={TITLE}>
          {icon && <span aria-hidden="true" className={TILE}><i className={"ph-bold " + icon} /></span>}
          {title}
          {badge && <Tag variant="status" status={badge.status} tone={badge.tone as any} size="sm">{badge.label}</Tag>}
        </h1>
        {subtitle && <p className={SUB}>{subtitle}</p>}
      </div>
      <Cluster gap="tight" style={{ alignItems: "center" }}>
        {tabs.length > 0 && (
          <div role="radiogroup" aria-label="Scope" onKeyDown={scopeRoving.onKeyDown} className={TRACK}>
            {tabs.map((t, i) => {
              const on = tab === t.key;
              const dis = !!t.disabled;
              return (
                <button key={t.key} {...scopeRoving.getItemProps(i)} type="button" role="radio" aria-checked={on} aria-disabled={dis || undefined}
                  title={dis ? "Not available for your role" : undefined}
                  onClick={() => !dis && onTabChange && onTabChange(t.key)}
                  className={[TAB, dis ? TAB_DIS : on ? TAB_ON : TAB_OFF].join(" ")}>
                  {t.label}
                  {countsLoading
                    ? <span className={[PILL, "w-[18px] h-[13px] p-0"].join(" ")}
                        style={{ background: "linear-gradient(90deg, var(--surface-sunken) 25%, var(--surface-soft) 50%, var(--surface-sunken) 75%)", backgroundSize: "200% 100%", animation: "agni-shimmer 1.4s var(--ease-standard) infinite" }} />
                    : t.count != null && <span className={[PILL, on ? PILL_ON : PILL_OFF].join(" ")}>{t.count}</span>}
                </button>
              );
            })}
          </div>
        )}
        {showViewModes && <>
          {tabs.length > 0 && <span className="w-px h-[22px] bg-line-subtle shrink-0" />}
          <div role="radiogroup" aria-label="View" onKeyDown={viewRoving.onKeyDown} className={VIEW_TRACK}>
            {viewModes.map((v, i) => {
              const on = viewMode === v.key;
              return (
                <button key={v.key} {...viewRoving.getItemProps(i)} type="button" role="radio" aria-checked={on}
                  title={v.title} aria-label={v.title ?? v.key} onClick={() => onViewModeChange!(v.key)}
                  className={[VIEW_BTN, on ? VIEW_ON : VIEW_OFF].join(" ")}>
                  <i aria-hidden="true" className={"ph " + v.icon} />
                </button>
              );
            })}
          </div>
        </>}
        {rendered.length > 0 && <>
          {(tabs.length > 0 || showViewModes) && <span className="w-px h-[22px] bg-line-subtle shrink-0" />}
          {rendered}
        </>}
        {trailing}
        {countsLoading && <style>{`@keyframes agni-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>}
      </Cluster>
    </Cluster>
  );
});
