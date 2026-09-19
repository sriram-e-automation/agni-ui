import { resolveDataState } from "../feedback/DataState.tsx";
import React, { useState } from "react";

/* ── Types (mirrored in TreeView.d.ts) ── */
export interface TreeNode { key: string; label: React.ReactNode; icon?: string; children?: TreeNode[]; }
export interface TreeViewProps {
  nodes?: TreeNode[];
  defaultOpen?: string[];
  selected?: string;
  onSelect?: (key: string, node: TreeNode) => void;
  style?: React.CSSProperties;
}
/** Nested expandable tree (BOM, categories, file hierarchy). */

/**
 * AgniUI · TreeView
 * Nested expandable tree. nodes: [{key,label,icon?,children?}].
 * Controlled selection via `selected` + `onSelect`.
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

function Node({ node, depth, open, setOpen, selected, onSelect }) {
  const hasKids = node.children && node.children.length > 0;
  const isOpen = open.has(node.key);
  const isSel = selected === node.key;
  return (
    <div>
      <div
        onClick={() => { if (hasKids) setOpen((p) => { const n = new Set(p); n.has(node.key) ? n.delete(node.key) : n.add(node.key); return n; }); onSelect && onSelect(node.key, node); }}
        className={[ROW, isSel ? ROW_ON : ROW_OFF].join(" ")}
        style={{ paddingLeft: "calc(var(--space-2) + " + depth * 18 + "px)" }}>
        <i className={[hasKids ? (isOpen ? "ph ph-caret-down" : "ph ph-caret-right") : "ph ph-dot", hasKids ? CARET_ON : CARET_OFF].join(" ")} />
        <i className={["ph", node.icon || (hasKids ? (isOpen ? "ph-folder-open" : "ph-folder") : "ph-file"), "text-[16px] shrink-0", isSel ? "text-fg-brand" : "text-fg-tertiary"].join(" ")} />
        <span className={["text-sm whitespace-nowrap", isSel ? "font-medium" : "font-normal"].join(" ")}>{node.label}</span>
      </div>
      {hasKids && isOpen && node.children.map((c) => <Node key={c.key} node={c} depth={depth + 1} open={open} setOpen={setOpen} selected={selected} onSelect={onSelect} />)}
    </div>
  );
}

function TreeViewBody({ nodes = [], defaultOpen = [], selected, onSelect, style = {} }) {
  const [open, setOpen] = useState(new Set(defaultOpen));
  return (
    <div className="bg-surface-card border border-line-subtle rounded-md p-1" style={style}>
      {nodes.map((n) => <Node key={n.key} node={n} depth={0} open={open} setOpen={setOpen} selected={selected} onSelect={onSelect} />)}
    </div>
  );
}

/* State contract — error → loading → empty → content (resolveDataState owns the
   precedence). The body mounts only with content, so hook order is stable. */
export function TreeView(props) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.nodes && props.nodes.length), empty: props.empty,
    shape: "tree", rows: props.loadingRows || 4,
    emptyIcon: "ph-tree-structure", emptyTitle: "No nodes to show",
  });
  if (state !== false) return <div className="w-full" style={props.style || {}}>{state}</div>;
  return <TreeViewBody {...props} />;
}
