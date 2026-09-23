/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useState } from "react";
import { useControllableState } from "../../utils/interaction.tsx";
import { useSelectCore, HiddenValue, shellEdge, TRIGGER_INNER, ICON_BTN, type SelectCommonProps } from "./useSelect.tsx";

/* ── Types (mirrored in SearchSelect.d.ts) ── */
export interface SelectOption {
  value: string;
  label: string;
  /** Optional Phosphor icon name, e.g. "ph-user". */
  icon?: string;
  disabled?: boolean;
}
export interface SearchSelectProps extends SelectCommonProps {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled select. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** String options, or { value, label, icon? } objects. */
  options?: Array<string | SelectOption>;
  placeholder?: string;
  searchPlaceholder?: string;
  /** @deprecated Use `empty`. */
  emptyText?: string;
  /** No-results state — string or node (e.g. an <EmptyState>). Supersedes `emptyText`. */
  empty?: React.ReactNode;
  /** Show a clear (×) affordance when a value is selected. Default true. */
  clearable?: boolean;
  /** Accessible name of the clear button. @default "Clear selection" */
  clearLabel?: string;
}
/** Single-select with an inline search box for long option lists. */


/**
 * AgniUI · SearchSelect
 * Single-select dropdown with an inline search box for long option lists.
 * options: array of strings, or { value, label, icon? }. onChange → value.
 */
function norm(options: Array<string | SelectOption>): SelectOption[] {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

/* Shared with UserSelect in shape, deliberately not extracted — the two差 in
   trigger content and row anatomy, and a shared shell would need props for
   every difference. */
const SS_TRIGGER = "flex items-center gap-2 px-2 border rounded-md transition-[border-color,box-shadow] duration-fast ease-standard";
const SS_MENU = "absolute z-dropdown top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-line-default rounded-md shadow-e-lg overflow-hidden";
const SS_SEARCH = "flex items-center gap-2 h-[32px] px-2 border border-[var(--input-bdr)] rounded-sm bg-surface-soft";
const SS_ROW = "flex items-center gap-2 p-2 rounded-sm cursor-pointer text-sm";

export const SearchSelect = forwardRef<HTMLDivElement, SearchSelectProps>(function SearchSelect(props, ref) {
  const {
    value, defaultValue = null, onChange, options = [], placeholder = "Select…", searchPlaceholder = "Search…",
    emptyText = "No matches", empty, clearable = true, clearLabel = "Clear selection", size = "md",
    name, form, style = {}, className = "",
  } = props;
  const [q, setQ] = useState("");
  const [current, setCurrent] = useControllableState<string | null>({ value, defaultValue, onChange });
  const opts = norm(options);
  const sel = opts.find((o) => o.value === current);
  const filtered = opts.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  const c = useSelectCore({
    props, items: filtered, getLabel: (o) => o.label, isItemDisabled: (o) => !!o.disabled, searchable: true,
    selectedIndex: filtered.findIndex((o) => o.value === current),
    onCommit: (o) => setCurrent(o.value),
    onClearKey: clearable ? () => { if (current != null) setCurrent(null); } : undefined,
    onSeedQuery: (k) => setQ(k),
  });
  /* A fresh search every time the popup opens (a seeded key is kept). */
  const [wasOpen, setWasOpen] = useState(false);
  if (c.open !== wasOpen) { setWasOpen(c.open); if (!c.open) setQ(""); }
  /* Height rides --density-control-h with the whole control family (Aug 2026). */
  const H_CLS = { sm: "h-control-sm", md: "h-control", lg: "h-control-lg" }[size] || "h-control";

  return (
    <div {...c.getRootProps()} className={["relative font-sans", className].join(" ")} style={style}>
      <div
        className={[
          H_CLS, SS_TRIGGER, shellEdge(c.f.invalid, c.open),
          c.f.disabled ? "bg-[var(--input-bg-disabled)] cursor-not-allowed" : "bg-[var(--input-bg)] cursor-pointer",
        ].join(" ")}
      >
        <div {...c.getTriggerProps(ref)} className={TRIGGER_INNER}>
          {sel && sel.icon && <i aria-hidden="true" className={"ph " + sel.icon + " text-[16px] text-fg-tertiary shrink-0"} />}
          <span className={["flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base", sel ? "text-fg-primary" : "text-fg-tertiary"].join(" ")}>{sel ? sel.label : placeholder}</span>
          <HiddenValue name={name} form={form} value={current} />
        </div>
        {clearable && sel && !c.f.disabled && (
          <button type="button" tabIndex={-1} aria-label={clearLabel} className={[ICON_BTN, "text-[13px]"].join(" ")}
            onClick={() => { setCurrent(null); c.triggerRef.current?.focus(); }}><i aria-hidden="true" className="ph ph-x" /></button>
        )}
        <i aria-hidden="true" onClick={() => c.triggerRef.current?.click()} className={"ph ph-caret-" + (c.open ? "up" : "down") + " text-[12px] text-fg-tertiary shrink-0"} />
      </div>

      {c.open && (
        <div className={SS_MENU}>
          <div className="p-2 border-b border-line-subtle">
            <div className={SS_SEARCH}>
              <i aria-hidden="true" className="ph ph-magnifying-glass text-[14px] text-fg-tertiary" />
              <input {...c.getSearchProps(searchPlaceholder)} value={q} onChange={(e) => { setQ(e.target.value); c.nav.setActiveIndex(0); }} placeholder={searchPlaceholder} className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-fg-primary" />
            </div>
          </div>
          <div {...c.getListProps()} className="max-h-[var(--max-h-menu)] overflow-y-auto p-1">
            {filtered.length === 0 && <div role="presentation" className="p-3 text-center text-sm text-fg-tertiary">{empty ?? emptyText}</div>}
            {filtered.map((o, i) => {
              const on = o.value === current;
              /* hover: only when unselected — the old `if (!on)` guard, expressed
                 as emit order rather than as a branch inside a handler. */
              return (
                <div key={o.value} {...c.getOptionProps(i, on, o.disabled)}
                  className={[
                    SS_ROW,
                    on ? "bg-surface-brand-soft text-fg-brand font-semibold"
                       : "bg-transparent text-fg-primary font-normal hover:bg-surface-soft",
                    o.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : "",
                  ].join(" ")}>
                  {o.icon && <i aria-hidden="true" className={"ph " + o.icon + " text-[16px] " + (on ? "text-fg-brand" : "text-fg-tertiary")} />}
                  <span className="flex-1 min-w-0">{o.label}</span>
                  {on && <i aria-hidden="true" className="ph-bold ph-check text-[13px]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
