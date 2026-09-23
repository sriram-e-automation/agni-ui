/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useRef, useState, useEffect } from "react";

/* ── Types (mirrored in UserSelect.d.ts) ── */
export interface UserOption {
  id: string;
  name: string;
  /** Team / role subtext shown under the name. */
  team?: string;
  /** Optional avatar image URL; falls back to coloured initials. */
  avatar?: string;
  /** Optional avatar accent colour (hex); else auto-assigned. */
  color?: string;
}
export interface UserSelectProps {
  value?: string | null;
  onChange?: (userId: string | null) => void;
  users?: UserOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** @deprecated Use `empty`. */
  emptyText?: string;
  /** No-results state — string or node (e.g. an <EmptyState>). Supersedes `emptyText`. */
  empty?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}
/** Searchable people picker — avatar + crew name + team/role subtext. */


/**
 * AgniUI · UserSelect
 * Searchable single-select for people. Each option shows an avatar (initials or
 * image) with the crew name and a team / role subtext. onChange → user id.
 * users: [{ id, name, team?, avatar?, color? }]. Search matches name + team.
 */
const initials = (name = "") => name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const FALLBACK = [1, 2, 3, 4, 5, 6].map((n) => `var(--chart-${n})`);  /* categorical identity ramp */
const colorFor = (u, i) => u.color || FALLBACK[i % FALLBACK.length];

/* The avatar's diameter and its 0.4x font size are caller-supplied numbers, and
   the fill is a categorical-ramp lookup with a hex alpha suffix — both stay
   inline. Everything structural is a class. */
function Avatar({ user, i, size = 30 }) {
  return user.avatar
    ? <img src={user.avatar} alt={user.name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
    : <span className="rounded-full shrink-0 inline-flex items-center justify-center font-bold font-sans"
        style={{ width: size, height: size, background: colorFor(user, i) + "22", color: colorFor(user, i), fontSize: size * 0.4 }}>{initials(user.name)}</span>;
}

export function UserSelect({
  value = null,
  onChange,
  users = [],
  placeholder = "Assign a person…",
  searchPlaceholder = "Search people…",
  emptyText = "No people found", empty,
  disabled = false,
  error = false,
  clearable = true,
  size = "md",
  style = {},
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  useEffect(() => { if (open) setQ(""); }, [open]);

  const sel = users.find((u) => u.id === value);
  const ql = q.trim().toLowerCase();
  const filtered = users.filter((u) => !ql || (u.name + " " + (u.team || "")).toLowerCase().includes(ql));
  /* People pickers are two-line controls: they ride the same token as the rest of
     the family at a +4px offset (h-control-people-*), so a density or scale
     change moves them in step instead of leaving them at a literal 36/42/48. */
  const H_CLS = { sm: "h-control-people-sm", md: "h-control-people", lg: "h-control-people-lg" }[size] || "h-control-people";
  /* Error EDGE is persistent; the error RING is an open-state affordance (see
     Input's focus-within pair). The error branch must re-test `open` or the
     focus indication vanishes on exactly the controls that need it most. */
  const EDGE = error
    ? (open ? "border-[var(--input-bdr-error)] ring-focus-error" : "border-[var(--input-bdr-error)] [box-shadow:none]")
    : open ? "border-[var(--input-bdr-focus)] ring-focus"
    : "border-[var(--input-bdr)] [box-shadow:none]";

  return (
    <div ref={ref} className="relative font-sans" style={style}>
      <div onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          H_CLS, "flex items-center gap-2 px-2 border rounded-md transition-[border-color,box-shadow] duration-fast ease-standard",
          EDGE,
          disabled ? "bg-[var(--input-bg-disabled)] cursor-not-allowed" : "bg-[var(--input-bg)] cursor-pointer",
        ].join(" ")}>
        {sel ? (
          <>
            <Avatar user={sel} i={users.indexOf(sel)} size={26} />
            <div className="flex-1 min-w-0 leading-[1.2]">
              <div className="text-sm font-medium text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap">{sel.name}</div>
              {sel.team && <div className="text-2xs text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap">{sel.team}</div>}
            </div>
          </>
        ) : (
          <span className="flex-1 min-w-0 text-base text-fg-tertiary">{placeholder}</span>
        )}
        {clearable && sel && <i className="ph ph-x text-[13px] text-fg-tertiary cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); onChange && onChange(null); }} />}
        <i className={"ph ph-caret-" + (open ? "up" : "down") + " text-[12px] text-fg-tertiary shrink-0"} />
      </div>

      {open && (
        <div className="absolute z-dropdown top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-line-default rounded-md shadow-e-lg overflow-hidden">
          <div className="p-2 border-b border-line-subtle">
            <div className="flex items-center gap-2 h-[32px] px-2 border border-[var(--input-bdr)] rounded-sm bg-surface-soft">
              <i className="ph ph-magnifying-glass text-[14px] text-fg-tertiary" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} data-agni-input="" className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-fg-primary" />
            </div>
          </div>
          <div className="max-h-[var(--max-h-menu)] overflow-y-auto p-1">
            {filtered.length === 0 && <div className="p-3 text-center text-sm text-fg-tertiary">{empty ?? emptyText}</div>}
            {filtered.map((u) => {
              const on = u.id === value;
              /* Hover was a pair of handlers writing background directly, guarded
                 by `if (!on)`. As a class the guard becomes emit order: the
                 selected row's bg- utility must WIN over hover:, so the hover
                 class is only present when the row is not selected. */
              return (
                <div key={u.id} onClick={() => { onChange && onChange(u.id); setOpen(false); }}
                  className={[
                    "flex items-center gap-2 p-2 rounded-sm cursor-pointer",
                    on ? "bg-surface-brand-soft" : "bg-transparent hover:bg-surface-soft",
                  ].join(" ")}>
                  <Avatar user={u} i={users.indexOf(u)} size={32} />
                  <div className="flex-1 min-w-0 leading-[1.25]">
                    <div className={["text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap", on ? "text-fg-brand" : "text-fg-primary"].join(" ")}>{u.name}</div>
                    {u.team && <div className="text-2xs text-fg-tertiary overflow-hidden text-ellipsis whitespace-nowrap">{u.team}</div>}
                  </div>
                  {on && <i className="ph-bold ph-check text-[14px] text-fg-brand shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
