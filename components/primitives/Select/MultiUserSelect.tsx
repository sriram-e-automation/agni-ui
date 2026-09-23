/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useState } from "react";
import { useControllableState } from "../../utils/interaction.tsx";
import { useSelectCore, HiddenValue, shellEdge, TRIGGER_INNER, ICON_BTN, type SelectCommonProps } from "./useSelect.tsx";

/* ── Types (mirrored in MultiUserSelect.d.ts) ── */
export interface MultiUserSelectUser {
  id: string;
  name: string;
  team?: string;
  avatar?: string;
  color?: string;
}

export interface MultiUserSelectProps extends SelectCommonProps {
  /** Array of selected user ids. Omit (and use `defaultValue`) for an uncontrolled picker. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (userIds: string[]) => void;
  users?: MultiUserSelectUser[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** @deprecated Use `empty`. */
  emptyText?: string;
  /** No-results state — string or node (e.g. an <EmptyState>). Supersedes `emptyText`. */
  empty?: React.ReactNode;
  /** Cap the number of selections allowed */
  maxSelections?: number;
  /** Accessible name of the clear-all button. @default "Clear all" */
  clearLabel?: string;
  /** Label of the popup's close button. @default "Done" */
  doneLabel?: string;
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
const colorFor  = (u: MultiUserSelectUser, i: number) => u.color || FALLBACK[i % FALLBACK.length];

/* ── Inline avatar (no DS dep) ─────────────────────────────────────── */
function Av({ user, idx, size = 28 }: { user: MultiUserSelectUser; idx: number; size?: number }) {
  const bg  = colorFor(user, idx) + "22";
  const fg  = colorFor(user, idx);
  /* Diameter and the 0.38x font size are caller-supplied numbers; the fill is a
     ramp lookup with a hex alpha suffix. Both stay inline. */
  return user.avatar
    ? <img src={user.avatar} alt="" className="rounded-full object-cover shrink-0" style={{ width:size, height:size }} />
    : <span className="rounded-full shrink-0 inline-flex items-center justify-center font-bold font-sans select-none"
        style={{ width:size, height:size, background:bg, color:fg, fontSize:size*0.38 }}>
        {initials(user.name)}
      </span>;
}

/* ── Stacked avatar row shown in the closed trigger ────────────────── */
const MAX_CHIPS = 3;
function TriggerContent({ selected, users, placeholder }: { selected: MultiUserSelectUser[]; users: MultiUserSelectUser[]; placeholder: string }) {
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
export const MultiUserSelect = forwardRef<HTMLDivElement, MultiUserSelectProps>(function MultiUserSelect(props, ref) {
  const {
    value, defaultValue = [], onChange, users = [], placeholder = "Assign members…", searchPlaceholder = "Search people…",
    emptyText = "No people found", empty, size = "md", maxSelections, clearLabel = "Clear all", doneLabel = "Done",
    name, form, style = {}, className = "",
  } = props;
  const [q, setQ] = useState("");
  const [current, setCurrent] = useControllableState<string[]>({ value, defaultValue, onChange });

  const atMax = !!maxSelections && current.length >= maxSelections;
  const toggle = (uid: string) => {
    const next = current.includes(uid) ? current.filter((id) => id !== uid) : [...current, uid];
    if (maxSelections && next.length > maxSelections) return;
    setCurrent(next);
  };

  const ql       = q.trim().toLowerCase();
  const filtered = users.filter((u) => !ql || (u.name + " " + (u.team || "")).toLowerCase().includes(ql));
  const selected = users.filter((u) => current.includes(u.id));
  const blockedAt = (u: MultiUserSelectUser) => !current.includes(u.id) && atMax;

  const c = useSelectCore({
    props, items: filtered, getLabel: (u) => u.name, isItemDisabled: blockedAt, searchable: true, multiple: true,
    selectedIndex: filtered.findIndex((u) => current.includes(u.id)),
    onCommit: (u) => toggle(u.id),
    onClearKey: () => { if (current.length) setCurrent(current.slice(0, -1)); },
    onSeedQuery: (k) => setQ(k),
  });
  const [wasOpen, setWasOpen] = useState(false);
  if (c.open !== wasOpen) { setWasOpen(c.open); if (!c.open) setQ(""); }

  /* Two-line people control — rides h-control-people-* off the same density
     token as the rest of the family (Aug 2026). */
  const H_CLS = { sm: "min-h-control-people-sm", md: "min-h-control-people", lg: "min-h-control-people-lg" }[size] || "min-h-control-people";

  return (
    <div {...c.getRootProps()} className={["relative font-sans", className].join(" ")} style={style}>

      {/* ── Trigger ── */}
      <div
        className={[
          H_CLS,
          "flex items-center gap-2 px-2 border rounded-md box-border transition-[border-color,box-shadow] duration-fast ease-standard",
          shellEdge(c.f.invalid, c.open),
          c.f.disabled ? "bg-[var(--input-bg-disabled)] cursor-not-allowed" : "bg-[var(--input-bg)] cursor-pointer",
        ].join(" ")}>
        <div {...c.getTriggerProps(ref)} className={TRIGGER_INNER}>
          <TriggerContent selected={selected} users={users} placeholder={placeholder} />
          {/* Chip count badge */}
          {selected.length > 0 && (
            <span className="text-2xs font-semibold bg-surface-brand-soft text-fg-brand rounded-full py-[2px] px-2 shrink-0 leading-[1.5]">
              {selected.length}<span className="sr-only"> selected</span>
            </span>
          )}
          <HiddenValue name={name} form={form} value={current} />
        </div>

        {/* Clear all */}
        {selected.length > 0 && !c.f.disabled && (
          <button type="button" tabIndex={-1} aria-label={clearLabel} className={[ICON_BTN, "text-[13px]"].join(" ")}
            onClick={() => { setCurrent([]); c.triggerRef.current?.focus(); }}><i aria-hidden="true" className="ph ph-x" /></button>
        )}
        <i aria-hidden="true" onClick={() => c.triggerRef.current?.click()} className={"ph ph-caret-" + (c.open ? "up" : "down") + " text-[12px] text-fg-tertiary shrink-0"} />
      </div>

      {/* ── Dropdown ── */}
      {c.open && (
        <div className="absolute z-dropdown top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-line-default rounded-md shadow-e-lg overflow-hidden">

          {/* Search */}
          <div className="p-2 border-b border-line-subtle">
            <div className="flex items-center gap-2 h-[32px] px-2 border border-[var(--input-bdr)] rounded-sm bg-surface-soft">
              <i aria-hidden="true" className="ph ph-magnifying-glass text-[14px] text-fg-tertiary" />
              <input
                {...c.getSearchProps(searchPlaceholder)}
                value={q}
                onChange={(e) => { setQ(e.target.value); c.nav.setActiveIndex(0); }}
                placeholder={searchPlaceholder}
                className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-fg-primary" />
              {q && (
                <button type="button" tabIndex={-1} aria-label="Clear search" className={[ICON_BTN, "text-[12px]"].join(" ")}
                  onClick={() => { setQ(""); c.searchRef.current?.focus(); }}><i aria-hidden="true" className="ph ph-x" /></button>
              )}
            </div>
          </div>

          {/* Max-selections notice */}
          {atMax && !ql && (
            <div role="status" className="py-1 px-3 text-xs text-fg-tertiary border-b border-line-subtle bg-surface-soft">
              Max {maxSelections} member{maxSelections === 1 ? "" : "s"} selected
            </div>
          )}

          {/* List */}
          <div {...c.getListProps()} className="max-h-[var(--max-h-menu)] overflow-y-auto p-1">
            {filtered.length === 0 && (
              <div role="presentation" className="p-3 text-center text-sm text-fg-tertiary">{empty ?? emptyText}</div>
            )}
            {filtered.map((u, i) => {
              const gi      = users.indexOf(u);
              const checked = current.includes(u.id);
              const blocked = blockedAt(u);
              /* Hover is a class, present only on rows that are neither checked
                 (whose fill must win by emit order) nor blocked (not actionable). */
              return (
                <div key={u.id} {...c.getOptionProps(i, checked, blocked)}
                  className={[
                    "flex items-center gap-2 p-2 rounded-sm transition-[background-color] duration-fast ease-standard",
                    blocked ? "cursor-not-allowed opacity-[0.45]" : "cursor-pointer opacity-100",
                    checked ? "bg-surface-brand-soft" : blocked ? "bg-transparent" : "bg-transparent hover:bg-surface-soft",
                  ].join(" ")}>

                  {/* Checkbox — border-0 rather than border-none, so a drawn edge
                      could never lose to it by emit order. */}
                  <span aria-hidden="true" className={[
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
            <span className="text-xs text-fg-tertiary" aria-live="polite">
              {selected.length === 0
                ? "No members selected"
                : `${selected.length} member${selected.length === 1 ? "" : "s"} selected`}
            </span>
            <button
              type="button"
              onClick={() => c.close(true)}
              className={[
                "h-[28px] px-3 rounded-sm bg-surface-brand text-fg-on-brand border-none text-xs font-semibold font-sans cursor-pointer",
                selected.length === 0 ? "opacity-[0.5]" : "opacity-100",
              ].join(" ")}>
              {doneLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
