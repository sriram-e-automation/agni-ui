import { resolveDataState } from "../../utils/DataState.tsx";
import React from "react";
import { PersonCard } from "../PersonCard/PersonCard.tsx";

/* ── Types (mirrored in OrgTree.d.ts) ── */
export interface OrgPerson {
  id: string;
  name: string;
  role?: string;
  crew?: string;
  team?: string;
  avatar?: string | null;
  /** id of this person's manager — empty/unknown ⇒ tree root. */
  reportsTo?: string | null;
  [key: string]: any;
}

export interface OrgTreeProps {
  /** Flat list — the tree is built from reportsTo links. */
  people?: OrgPerson[];
  /** Render only the subtree under this person. */
  rootId?: string;
  /** Node card size. @default "sm" */
  cardSize?: "sm" | "md";
  /** Highlighted person (brand card + highlighted path to root). */
  selectedId?: string | null;
  onPersonClick?: (person: OrgPerson) => void;
  /** Collapse/expand toggles on nodes with reports. @default true */
  collapsible?: boolean;
  /** ids collapsed on first render. */
  defaultCollapsed?: string[];
  /** Optional hierarchy legend chips ("Director" › "Vice president" › …). */
  legend?: string[];
  /** @default "No people to display" */
  emptyLabel?: string;
  style?: React.CSSProperties;
}

const { useState, useMemo } = React;

const STUB = 26;           /* px — elbow connector run          */
const VGAP = 10;           /* px — vertical gap between sibling rows */
const LINE = "var(--border-default)";

/* Tailwind v4 (migrated Aug 2026, tranche 7d). The `hov` useState is gone;
   hover is `hover:border-line-brand hover:text-fg-brand`, guarded off the
   collapsed state exactly as the old ternary was. */
const COLLAPSE_BTN =
  "inline-flex items-center gap-[3px] shrink-0 h-[20px] px-2 rounded-full border cursor-pointer " +
  "font-data text-2xs font-semibold transition-colors duration-fast";
const COLLAPSE_ON = "border-line-brand bg-surface-brand-soft text-fg-brand";
const COLLAPSE_OFF = "border-line-default bg-surface-card text-fg-tertiary hover:border-line-brand hover:text-fg-brand";

function CollapseBtn({ count, collapsed, onToggle }: { count: number; collapsed: boolean; onToggle: () => void }) {
  return (
    <button type="button" title={collapsed ? `Show ${count} report${count > 1 ? "s" : ""}` : "Hide reports"}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={[COLLAPSE_BTN, collapsed ? COLLAPSE_ON : COLLAPSE_OFF].join(" ")}>
      {count}<i className={["ph", collapsed ? "ph-caret-right" : "ph-caret-left", "text-[9px]"].join(" ")} />
    </button>
  );
}

function Node({ node, cardSize, selectedId, pathIds, onPersonClick, collapsible, collapsed, toggle }: any) {
  const kids = node.reports || [];
  const isCollapsed = collapsed.has(node.id);
  const onPath = pathIds.has(node.id);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <PersonCard person={node} size={cardSize} selected={selectedId === node.id}
        onClick={onPersonClick}
        suffix={collapsible && kids.length > 0 ? <CollapseBtn count={kids.length} collapsed={isCollapsed} onToggle={() => toggle(node.id)} /> : undefined}
        style={onPath && selectedId !== node.id ? { borderColor: "var(--border-brand)" } : undefined} />
      {kids.length > 0 && !isCollapsed && (
        <React.Fragment>
          <span style={{ width: STUB, height: 1, background: LINE, flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {kids.map((k: any, i: number) => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", position: "relative", padding: `${VGAP / 2}px 0 ${VGAP / 2}px ${STUB}px` }}>
                <span style={{ position: "absolute", left: 0, width: 1, background: LINE, top: i === 0 ? "50%" : 0, bottom: i === kids.length - 1 ? "50%" : 0 }} />
                <span style={{ position: "absolute", left: 0, top: "50%", width: STUB, height: 1, background: LINE }} />
                <Node node={k} cardSize={cardSize} selectedId={selectedId} pathIds={pathIds} onPersonClick={onPersonClick}
                  collapsible={collapsible} collapsed={collapsed} toggle={toggle} />
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function isDescendantSelected(node: any, selectedId: string): boolean {
  return (node.reports || []).some((k: any) => k.id === selectedId || isDescendantSelected(k, selectedId));
}

/**
 * AgniUI · OrgTree
 * Reporting line-up as a horizontal bracket tree: the root (e.g. Director) on
 * the left, reports fanning right through elbow connectors — PersonCard nodes,
 * collapsible branches with report counts, and a brand-highlighted path from
 * the selected person up to the root. Scrolls both axes inside its container.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7d). The elbow connectors (STUB/VGAP
 * lines) stay inline — their position and length are computed per node from
 * the tree structure, not a themeable choice.
 */
function OrgTreeBody({ forwardedRef,
  people = [],
  rootId,
  cardSize = "sm",
  selectedId = null,
  onPersonClick,
  collapsible = true,
  defaultCollapsed = [],
  legend,
  emptyLabel = "No people to display",
  style = {},
}) {
  const [collapsed, setCollapsed] = useState(() => new Set(defaultCollapsed));
  const toggle = (id: string) => setCollapsed((cur) => { const n = new Set(cur); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  /* Home the viewport on the root card (it sits vertically centered against
     the full tree height, so a fresh mount can otherwise show whitespace). */
  React.useEffect(() => {
    const c = scrollRef.current, r = rootRef.current;
    if (!c || !r) return;
    const cr = c.getBoundingClientRect(), rr = r.getBoundingClientRect();
    c.scrollTop += (rr.top + rr.height / 2) - (cr.top + cr.height / 2);
  }, []);

  const roots = useMemo(() => {
    const byId: Record<string, any> = {};
    people.forEach((p) => { byId[p.id] = { ...p, reports: [] }; });
    const r: any[] = [];
    people.forEach((p) => {
      if (p.reportsTo && byId[p.reportsTo]) byId[p.reportsTo].reports.push(byId[p.id]);
      else r.push(byId[p.id]);
    });
    if (rootId && byId[rootId]) return [byId[rootId]];
    return r;
  }, [people, rootId]);

  /* Path from selected person up to the root — highlighted borders. */
  const pathIds = useMemo(() => {
    const s = new Set<string>();
    if (!selectedId) return s;
    const byId: Record<string, OrgPerson> = {};
    people.forEach((p) => { byId[p.id] = p; });
    let cur = byId[selectedId];
    while (cur) { s.add(cur.id); cur = cur.reportsTo ? byId[cur.reportsTo] : undefined; }
    return s;
  }, [people, selectedId]);

  if (!people.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-fg-tertiary" style={style}>
        <i className="ph ph-tree-structure text-[30px] opacity-[0.5]" />
        <span className="text-sm">{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div ref={forwardedRef as never} style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%", ...style }}>
      {legend && legend.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap px-[2px] pb-3 shrink-0">
          {legend.map((l, i) => (
            <React.Fragment key={l}>
              {i > 0 && <i className="ph ph-caret-right text-[10px] text-fg-tertiary" />}
              <span className="whitespace-nowrap text-2xs font-semibold tracking-wide uppercase text-fg-tertiary py-[3px] px-2 border border-line-subtle rounded-full bg-surface-soft">{l}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", minHeight: 0 , minWidth: 0}}>
        <div style={{ display: "flex", flexDirection: "column", gap: VGAP, padding: 2, width: "max-content" }}>
          {roots.map((r, i) => (
            <div key={r.id} ref={i === 0 ? rootRef : undefined}>
              <Node node={r} cardSize={cardSize} selectedId={selectedId} pathIds={pathIds}
                onPersonClick={onPersonClick} collapsible={collapsible} collapsed={collapsed} toggle={toggle} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* State contract — error → loading → empty → content, resolved by
   resolveDataState so the precedence matches every other data component. */
export const OrgTree = React.forwardRef<HTMLElement, any>(function OrgTree(props, ref) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.people && props.people.length), empty: props.empty,
    shape: "tree", rows: props.loadingRows || 5,
    emptyIcon: "ph-tree-structure", emptyTitle: "No reporting line to show",
  });
  if (state !== false) return <div style={{ width: "100%", ...(props.style || {}) }}>{state}</div>;
  return <OrgTreeBody {...props} forwardedRef={ref} />;
});
