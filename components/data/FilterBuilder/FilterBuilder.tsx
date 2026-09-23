import React, { useState } from "react";
import { Button } from "../core/Button.tsx";

/* ── Types (mirrored in FilterBuilder.d.ts) ── */
export interface FilterField { key: string; label: string; }
export interface FilterRule { field: string; op: string; val: string; }
export interface FilterBuilderProps {
  fields?: FilterField[];
  /** Controlled rules array. */
  value?: FilterRule[];
  onChange?: (rules: FilterRule[]) => void;
  style?: React.CSSProperties;
}
/** Compact AND-chained query / filter builder. */

/**
 * AgniUI · FilterBuilder
 * The RULES half of the filter pair: rows of {field, operator, value} chained
 * with AND, for saved views and precise queries. Its sibling FilterPanel is the
 * FACETS half — a popover of multi-select option pills for quick narrowing.
 * Both mount inside PageControls.
 * Compact query builder: rows of {field, operator, value}. fields:[{key,label}].
 * Controlled via `value` (array of rules) + onChange, or uncontrolled.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7c). The remove button's disabled
 * state moved from a computed opacity/cursor pair to `disabled:`.
 */
const OPS = ["is", "is not", "contains", ">", "<", "between"];
const SEL = "h-[34px] px-2 border border-[var(--input-bdr)] rounded-md bg-[var(--input-bg)] font-sans text-sm text-fg-primary";
const REMOVE =
  "size-[34px] shrink-0 border border-line-default rounded-md bg-surface-card text-fg-tertiary text-[15px] " +
  "enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-[0.4]";

export function FilterBuilder({ fields = [], value, onChange, style = {} }: FilterBuilderProps) {
  const [internal, setInternal] = useState([{ field: fields[0]?.key || "", op: "is", val: "" }]);
  const rules = value != null ? value : internal;
  const set = onChange || setInternal;

  const update = (i, patch) => set(rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = () => set([...rules, { field: fields[0]?.key || "", op: "is", val: "" }]);
  const remove = (i) => set(rules.filter((_, idx) => idx !== i));

  return (
    <div className="bg-surface-card border border-line-subtle rounded-lg p-3" style={style}>
      <div className="flex flex-col gap-2">
        {rules.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-fg-tertiary w-[36px] shrink-0">{i === 0 ? "Where" : "and"}</span>
            <select value={r.field} onChange={(e) => update(i, { field: e.target.value })} className={[SEL, "flex-1 min-w-0"].join(" ")}>
              {fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
            <select value={r.op} onChange={(e) => update(i, { op: e.target.value })} className={[SEL, "w-[110px]"].join(" ")}>
              {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input value={r.val} onChange={(e) => update(i, { val: e.target.value })} placeholder="value"
              className={[SEL, "flex-1 min-w-0"].join(" ")} />
            <button type="button" onClick={() => remove(i)} disabled={rules.length === 1} className={REMOVE}>
              <i className="ph ph-trash" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Button category="tertiary" size="sm" icon={<i className="ph ph-plus" />} onClick={add}>Add condition</Button>
      </div>
    </div>
  );
}
