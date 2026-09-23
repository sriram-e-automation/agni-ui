import { resolveDataState } from "../../utils/DataState.tsx";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { composeHandlers, mergeRefs, useControllableState, useStableId, useTypeahead } from "../../utils/interaction.tsx";

/* ── Types (mirrored in TreeView.d.ts) ── */
export interface TreeNode { key: string; label: React.ReactNode; icon?: string; children?: TreeNode[]; disabled?: boolean; /** Plain text for typeahead when `label` is a node. */ textValue?: string; }
export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  nodes?: TreeNode[];
  /** Controlled expanded keys. */
  open?: string[];
  defaultOpen?: string[];
  onOpenChange?: (open: string[]) => void;
  /** Controlled selected key. */
  selected?: string | null;
  defaultSelected?: string | null;
  onSelect?: (key: string, node: TreeNode) => void;
  loading?: boolean;
  loadingRows?: number;
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  empty?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Nested expandable tree (BOM, categories, file hierarchy). */

/**
 * AgniUI · TreeView
 * Nested expandable tree. nodes: [{key,label,icon?,children?}].
 * Controlled selection via `selected` + `onSelect`.
 *
 * WAI-ARIA tree view: role="tree" / "treeitem" / "group", aria-level,
 * aria-expanded, aria-selected; one Tab stop with roving focus over the
 * VISIBLE nodes. ↑ ↓ move · → expand, or step into the first child · ← collapse,
 * or step out to the parent · Home / End · Enter / Space select (and toggle a
 * branch) · typing jumps by label. Name the tree with aria-label.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7b). Depth indent stays inline — it
 * is `depth * 18`, computed per node, not a choice from a set. The row's two
 * mouse handlers are gone; hover is guarded off the SELECTED row only via
 * :not, matching what the old ternary computed.
 */
const ROW =
  "flex items-center gap-2 py-1 px-2 cursor-pointer rounded-sm transition-colors duration-fast";
const ROW_ON = "bg-surface-brand-soft text-fg-brand";
const ROW_OFF = "bg-transparent text-fg-secondary hover:bg-surface-soft";
const CARET_ON = "text-[13px] w-[13px] shrink-0 text-fg-tertiary";
const CARET_OFF = "text-[8px] w-[13px] shrink-0 text-fg-tertiary";

type Flat = { node: TreeNode; depth: number; parent: string | null; hasKids: boolean };
const labelText = (n: TreeNode) => n.textValue ?? (typeof n.label === "string" || typeof n.label === "number" ? String(n.label) : n.key);

const TreeViewBody = forwardRef<HTMLDivElement, TreeViewProps>(function TreeViewBody({
  nodes = [], open: openProp, defaultOpen = [], onOpenChange, selected: selProp, defaultSelected = null, onSelect,
  loading, loadingRows, error, onRetry, empty, id, onKeyDown, style = {}, className = "", ...rest
}, ref) {
  const [open, setOpen] = useControllableState<string[]>({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [selected, setSelected] = useControllableState<string | null, [TreeNode]>({
    value: selProp, defaultValue: defaultSelected, onChange: (k, n) => { if (k != null) onSelect?.(k, n); },
  });
  const base = useStableId(id, "agni-tree");
  const refs = useRef(new Map<string, HTMLDivElement | null>());
  const treeRef = useRef<HTMLDivElement | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  /* The visible nodes, in order — the keyboard walks this list. */
  const flat: Flat[] = [];
  const walk = (list: TreeNode[], depth: number, parent: string | null) => {
    for (const n of list) {
      const hasKids = !!(n.children && n.children.length);
      flat.push({ node: n, depth, parent, hasKids });
      if (hasKids && open.includes(n.key)) walk(n.children!, depth + 1, n.key);
    }
  };
  walk(nodes, 0, null);
  const idx = (k: string | null) => flat.findIndex((f) => f.node.key === k);
  const tabKey = (focusKey && idx(focusKey) >= 0 ? focusKey : null) ?? (selected && idx(selected) >= 0 ? selected : null) ?? flat[0]?.node.key ?? null;
  const type = useTypeahead(() => flat.map((f) => labelText(f.node)), (i) => !!flat[i]?.node.disabled);

  const focus = (k: string) => { setFocusKey(k); refs.current.get(k)?.focus(); };
  useEffect(() => { if (focusKey && treeRef.current?.contains(document.activeElement)) refs.current.get(focusKey)?.focus(); }, [focusKey, base]);

  const toggle = (k: string) => setOpen(open.includes(k) ? open.filter((x) => x !== k) : [...open, k]);
  const activate = (f: Flat) => {
    if (f.node.disabled) return;
    if (f.hasKids) toggle(f.node.key);
    setSelected(f.node.key, f.node);
  };

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = idx(tabKey);
    if (i < 0) return;
    const f = flat[i];
    const move = (to: number) => { if (to >= 0 && to < flat.length) { e.preventDefault(); focus(flat[to].node.key); } };
    switch (e.key) {
      case "ArrowDown": move(i + 1); return;
      case "ArrowUp": move(i - 1); return;
      case "Home": move(0); return;
      case "End": move(flat.length - 1); return;
      case "ArrowRight":
        e.preventDefault();
        if (f.hasKids && !open.includes(f.node.key)) toggle(f.node.key);
        else if (f.hasKids) move(i + 1);
        return;
      case "ArrowLeft":
        e.preventDefault();
        if (f.hasKids && open.includes(f.node.key)) toggle(f.node.key);
        else if (f.parent) focus(f.parent);
        return;
      case "Enter": case " ": e.preventDefault(); activate(f); return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const to = type(e.key, i);
      if (to !== null) move(to);
    }
  };

  /* Render nested so role="group" wraps each branch's children. */
  const renderLevel = (list: TreeNode[], depth: number): React.ReactNode => list.map((node, pos) => {
    const hasKids = !!(node.children && node.children.length);
    const isOpen = open.includes(node.key);
    const isSel = selected === node.key;
    return (
      <div key={node.key} role="none">
        <div
          ref={(el) => { refs.current.set(node.key, el); }}
          id={`${base}-${node.key}`}
          role="treeitem"
          aria-level={depth + 1}
          aria-setsize={list.length}
          aria-posinset={pos + 1}
          aria-expanded={hasKids ? isOpen : undefined}
          aria-selected={isSel}
          aria-disabled={node.disabled || undefined}
          tabIndex={node.key === tabKey ? 0 : -1}
          onFocus={() => setFocusKey(node.key)}
          onClick={() => activate({ node, depth, parent: null, hasKids })}
          className={[ROW, isSel ? ROW_ON : ROW_OFF, "outline-none focus-visible:focus-ring", node.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : ""].join(" ")}
          style={{ paddingLeft: "calc(var(--space-2) + " + depth * 18 + "px)" }}>
          <i aria-hidden="true" className={[hasKids ? (isOpen ? "ph ph-caret-down" : "ph ph-caret-right") : "ph ph-dot", hasKids ? CARET_ON : CARET_OFF].join(" ")} />
          <i aria-hidden="true" className={["ph", node.icon || (hasKids ? (isOpen ? "ph-folder-open" : "ph-folder") : "ph-file"), "text-[16px] shrink-0", isSel ? "text-fg-brand" : "text-fg-tertiary"].join(" ")} />
          <span className={["text-sm whitespace-nowrap", isSel ? "font-medium" : "font-normal"].join(" ")}>{node.label}</span>
        </div>
        {hasKids && isOpen && <div role="group">{renderLevel(node.children!, depth + 1)}</div>}
      </div>
    );
  });

  return (
    <div {...rest} ref={mergeRefs(ref, treeRef)} id={base} role="tree" onKeyDown={composeHandlers(onKeyDown, onKey)}
      className={["bg-surface-card border border-line-subtle rounded-md p-1", className].join(" ")} style={style}>
      {renderLevel(nodes, 0)}
    </div>
  );
});

/* State contract — error → loading → empty → content (resolveDataState owns the
   precedence). The body mounts only with content, so hook order is stable. */
export const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(function TreeView(props, ref) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.nodes && props.nodes.length), empty: props.empty,
    shape: "tree", rows: props.loadingRows || 4,
    emptyIcon: "ph-tree-structure", emptyTitle: "No nodes to show",
  });
  if (state !== false) return <div className="w-full" style={props.style || {}}>{state}</div>;
  return <TreeViewBody ref={ref} {...props} />;
});
