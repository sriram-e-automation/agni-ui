/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useRef, useState, useEffect, useCallback } from "react";

/* ── Types (mirrored in MultiUserSelect.d.ts) ── */
export interface MultiUserSelectUser {
  id: string;
  name: string;
  team?: string;
  avatar?: string;
  color?: string;
}

export interface MultiUserSelectProps {
  /** Array of selected user ids */
  value?: string[];
  onChange?: (userIds: string[]) => void;
  users?: MultiUserSelectUser[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** @deprecated Use `empty`. */
  emptyText?: string;
  /** No-results state — string or node (e.g. an <EmptyState>). Supersedes `emptyText`. */
  empty?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  /** Cap the number of selections allowed */
  maxSelections?: number;
  style?: React.CSSProperties;
}

/**
 * Searchable multi-select for people.
 * Trigger shows stacked avatar chips; dropdown stays open with checkbox rows.
 * onChange receives the updated array of selected user ids.
 */


/**
 * AgniUI · MultiUserSelect
 * Searchable multi-select for people. Trigger shows avatar-chip pills for
 * each selection; dropdown stays open with checkbox rows until dismissed.
 * users: [{ id, name, team?, avatar?, color? }]
 * value: string[]   onChange: (ids: string[]) => void
 */

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const FALLBACK = [1, 2, 3, 4, 5, 6].map((n) => `var(--chart-${n})`);  /* categorical identity ramp */
const colorFor  = (u, i) => u.color || FALLBACK[i % FALLBACK.length];

/* ── Inline avatar (no DS dep) ─────────────────────────────────────── */
function Av({ user, idx, size = 28 }) {
  const bg  = colorFor(user, idx) + "22";
  const fg  = colorFor(user, idx);
  /* Diameter and the 0.38x font size are caller-supplied numbers; the fill is a
     ramp lookup with a hex alpha suffix. Both stay inline. */
  return user.avatar
    ? <img src={user.avatar} alt={user.name} className="rounded-full object-cover shrink-0" style={{ width:size, height:size }} />
    : <span className="rounded-full shrink-0 inline-flex items-center justify-center font-bold font-sans select-none"
        style={{ width:size, height:size, background:bg, color:fg, fontSize:size*0.38 }}>
        {initials(user.name)}
      </span>;
}

/* ── Stacked avatar row shown in the closed trigger ────────────────── */
const MAX_CHIPS = 3;
function TriggerContent({ selected, users, placeholder }) {
  if (!selected.length) {
    return <span className="flex-1 min-w-0 text-base text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap">{placeholder}</span>;
  }

  const visible = selected.slice(0, MAX_CHIPS);
  const overflow = selected.length - MAX_CHIPS;

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
      {/* Stacked avatars — the overlap offset and stacking index are computed
          per position, so they stay inline. */}
      <div className="flex items-center">
        {visible.map((u, vi) => {
          const gi = users.indexOf(u);
          return (
            <span key={u.id} className="[box-shadow:0_0_0_2px_var(--input-bg)] rounded-full shrink-0"
              style={{ marginLeft: vi > 0 ? -8 : 0, zIndex: MAX_CHIPS - vi }}>
              <Av user={u} idx={gi} size={24} />
            </span>
          );
        })}
        {overflow > 0 && (
          <span className="-ml-2 size-[24px] rounded-full bg-surface-soft border-2 border-[var(--input-bg)] inline-flex items-center justify-center text-[10px] font-semibold text-fg-secondary shrink-0 z-0">
            +{overflow}
          </span>
        )}
      </div>
      {/* Name summary */}
      <span className="text-sm text-fg-primary font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
        {selected.length === 1
          ? selected[0].name
          : `${selected[0].name} +${selected.length - 1}`}
      </span>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export function MultiUserSelect({
  value       = [],
  onChange,
  users       = [],
  placeholder         = "Assign members…",
  searchPlaceholder   = "Search people…",
  emptyText           = "No people found",
  empty,
  disabled    = false,
  error       = false,
  size        = "md",
  maxSelections,
  style       = {},
}: MultiUserSelectProps) {
  const [open, setOpen]   = useState(false);
  const [q,    setQ]      = useState("");
  const ref               = useRef(null);
  const inputRef          = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  /* Auto-focus search when opening */
  useEffect(() => {
    if (open) { setQ(""); setTimeout(() => inputRef.current && inputRef.current.focus(), 40); }
  }, [open]);

  const toggle = useCallback((uid) => {
    if (!onChange) return;
    const next = value.includes(uid) ? value.filter((id) => id !== uid) : [...value, uid];
    if (maxSelections && next.length > maxSelections) return;
    onChange(next);
  }, [value, onChange, maxSelections]);

  const clearAll = useCallback((e) => {
    e.stopPropagation();
    onChange && onChange([]);
  }, [onChange]);

  const ql       = q.trim().toLowerCase();
  const filtered = users.filter((u) => !ql || (u.name + " " + (u.team || "")).toLowerCase().includes(ql));
  const selected = users.filter((u) => value.includes(u.id));

  /* Two-line people control — rides h-control-people-* off the same density
     token as the rest of the family (Aug 2026). */
  const H_CLS = { sm: "min-h-control-people-sm", md: "min-h-control-people", lg: "min-h-control-people-lg" }[size] || "min-h-control-people";
  /* Error EDGE is persistent; the error RING is an open-state affordance (see
     Input's focus-within pair). The error branch must re-test `open` or the
     focus indication vanishes on exactly the controls that need it most. */
  const EDGE = error
    ? (open ? "border-[var(--input-bdr-error)] ring-focus-error" : "border-[var(--input-bdr-error)] [box-shadow:none]")
    : open ? "border-[var(--input-bdr-focus)] ring-focus"
    : "border-[var(--input-bdr)] [box-shadow:none]";

  const atMax = maxSelections && value.length >= maxSelections;

  return (
    <div ref={ref} className="relative font-sans" style={style}>

      {/* ── Trigger ── */}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          H_CLS,
          "flex items-center gap-2 px-2 border rounded-md box-border transition-[border-color,box-shadow] duration-fast ease-standard",
          EDGE,
          disabled ? "bg-[var(--input-bg-disabled)] cursor-not-allowed" : "bg-[var(--input-bg)] cursor-pointer",
        ].join(" ")}>
        <TriggerContent selected={selected} users={users} placeholder={placeholder} />

        {/* Chip count badge */}
        {selected.length > 0 && (
          <span className="text-2xs font-semibold bg-surface-brand-soft text-fg-brand rounded-full py-[2px] px-2 shrink-0 leading-[1.5]">
            {selected.length}
          </span>
        )}

        {/* Clear all */}
        {selected.length > 0 && (
          <i className="ph ph-x text-[13px] text-fg-tertiary cursor-pointer shrink-0" onClick={clearAll} />
        )}
        <i className={"ph ph-caret-" + (open ? "up" : "down") + " text-[12px] text-fg-tertiary shrink-0"} />
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-dropdown top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-line-default rounded-md shadow-e-lg overflow-hidden">

          {/* Search */}
          <div className="p-2 border-b border-line-subtle">
            <div className="flex items-center gap-2 h-[32px] px-2 border border-[var(--input-bdr)] rounded-sm bg-surface-soft">
              <i className="ph ph-magnifying-glass text-[14px] text-fg-tertiary" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                data-agni-input=""
                className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-fg-primary" />
              {q && <i className="ph ph-x text-[12px] text-fg-tertiary cursor-pointer shrink-0" onClick={() => setQ("")} />}
            </div>
          </div>

          {/* Max-selections notice */}
          {atMax && !ql && (
            <div className="py-1 px-3 text-xs text-fg-tertiary border-b border-line-subtle bg-surface-soft">
              Max {maxSelections} member{maxSelections === 1 ? "" : "s"} selected
            </div>
          )}

          {/* List */}
          <div className="max-h-[var(--max-h-menu)] overflow-y-auto p-1">
            {filtered.length === 0 && (
              <div className="p-3 text-center text-sm text-fg-tertiary">{empty ?? emptyText}</div>
            )}
            {filtered.map((u) => {
              const gi      = users.indexOf(u);
              const checked = value.includes(u.id);
              const blocked = !checked && atMax;
              /* The `hov` useState is gone — it re-rendered the whole list on
                 every pointer move across it. Hover is a class, present only on
                 rows that are neither checked (whose fill must win by emit
                 order) nor blocked (which are not actionable). */
              return (
                <div key={u.id}
                  onClick={() => !blocked && toggle(u.id)}
                  className={[
                    "flex items-center gap-2 p-2 rounded-sm transition-[background-color] duration-fast ease-standard",
                    blocked ? "cursor-not-allowed opacity-[0.45]" : "cursor-pointer opacity-100",
                    checked ? "bg-surface-brand-soft" : blocked ? "bg-transparent" : "bg-transparent hover:bg-surface-soft",
                  ].join(" ")}>

                  {/* Checkbox — border-0 rather than border-none, so a drawn edge
                      could never lose to it by emit order. */}
                  <span className={[
                    "size-[18px] rounded-sm shrink-0 inline-flex items-center justify-center",
                    "transition-[background-color,border-color] duration-fast ease-standard",
                    checked ? "border-0 bg-surface-brand" : "border-[1.5px] border-line-default bg-transparent",
                  ].join(" ")}>
                    {checked && <i className="ph-bold ph-check text-[10px] text-fg-on-brand" />}
                  </span>

                  <Av user={u} idx={gi} size={32} />

                  <div className="flex-1 min-w-0 leading-[1.25]">
                    <div className={["text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap", checked ? "text-fg-brand" : "text-fg-primary"].join(" ")}>
                      {u.name}
                    </div>
                    {u.team && (
                      <div className="text-2xs text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap">
                        {u.team}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-line-subtle flex items-center justify-between gap-2">
            <span className="text-xs text-fg-tertiary">
              {selected.length === 0
                ? "No members selected"
                : `${selected.length} member${selected.length === 1 ? "" : "s"} selected`}
            </span>
            <button
              onClick={() => setOpen(false)}
              className={[
                "h-[28px] px-3 rounded-sm bg-surface-brand text-fg-on-brand border-none text-xs font-semibold font-sans cursor-pointer",
                selected.length === 0 ? "opacity-[0.5]" : "opacity-100",
              ].join(" ")}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
