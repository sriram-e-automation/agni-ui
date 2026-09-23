/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useState } from "react";
import { useControllableState } from "../../utils/interaction.tsx";
import { useSelectCore, HiddenValue, shellEdge, TRIGGER_INNER, ICON_BTN, type SelectCommonProps } from "./useSelect.tsx";

/* ── Types (mirrored in CreatableSelect.d.ts) ── */
export interface CreatableOption {
  value: string;
  label: string;
}
export interface CreatableSelectProps extends SelectCommonProps {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled select. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Called when the user adds a new option. Return the new value (or a Promise);
   *  if omitted, the typed label becomes the value. */
  onCreate?: (label: string) => string | Promise<string> | void;
  options?: Array<string | CreatableOption>;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Verb shown in the create row, e.g. "Add". Default "Add". */
  createLabel?: string;
  clearable?: boolean;
  /** Accessible name of the clear button. @default "Clear selection" */
  clearLabel?: string;
}
/** Search-select that can add a new option inline when nothing matches. */


/**
 * AgniUI · CreatableSelect
 * Search-and-select that also lets the user ADD a new option inline when their
 * query matches nothing. onChange → value; onCreate(label) → should return the
 * new option's value (or a Promise of it); if omitted the label becomes the value.
 * options: string[] or { value, label }[].
 */
function norm(options: Array<string | CreatableOption>): CreatableOption[] {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}
/* The "Add …" row is the listbox's last option, so arrows and Enter reach it
   like any other — no special key path. */
const CREATE = { value: "\u0000create", label: "" } as CreatableOption;

/* Same trigger/menu shell as SearchSelect, kept local for the same reason. */
const CS_TRIGGER = "flex items-center gap-2 px-2 border rounded-md transition-[border-color,box-shadow] duration-fast ease-standard";
const CS_ROW = "flex items-center gap-2 p-2 rounded-sm cursor-pointer text-sm";

export const CreatableSelect = forwardRef<HTMLDivElement, CreatableSelectProps>(function CreatableSelect(props, ref) {
  const {
    value, defaultValue = null, onChange, onCreate, options = [], placeholder = "Select or add…",
    searchPlaceholder = "Search or type to add…", createLabel = "Add", clearable = true, clearLabel = "Clear selection",
    size = "md", name, form, style = {}, className = "",
  } = props;
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState<CreatableOption[]>([]); // locally-created options
  const [current, setCurrent] = useControllableState<string | null>({ value, defaultValue, onChange });

  const opts = [...norm(options), ...extra];
  const sel = opts.find((o) => o.value === current);
  const ql = q.trim().toLowerCase();
  const filtered = opts.filter((o) => !ql || o.label.toLowerCase().includes(ql));
  const exactMatch = opts.some((o) => o.label.toLowerCase() === ql);
  const canCreate = ql.length > 0 && !exactMatch;
  const items = canCreate ? [...filtered, CREATE] : filtered;

  const create = () => {
    const label = q.trim();
    if (!label) return;
    const v = onCreate ? onCreate(label) : label;
    const apply = (val: string | void) => {
      const next = val == null ? label : val;
      setExtra((e) => [...e, { value: next, label }]);
      setCurrent(next);
    };
    if (v && typeof (v as Promise<string>).then === "function") (v as Promise<string>).then(apply); else apply(v as string | void);
  };

  const c = useSelectCore({
    props, items, getLabel: (o) => o.label, searchable: true,
    selectedIndex: items.findIndex((o) => o.value === current),
    onCommit: (o) => { if (o === CREATE) create(); else setCurrent(o.value); },
    onClearKey: clearable ? () => { if (current != null) setCurrent(null); } : undefined,
    onSeedQuery: (k) => setQ(k),
  });
  const [wasOpen, setWasOpen] = useState(false);
  if (c.open !== wasOpen) { setWasOpen(c.open); if (!c.open) setQ(""); }
  /* Height rides --density-control-h with the whole control family (Aug 2026). */
  const H_CLS = { sm: "h-control-sm", md: "h-control", lg: "h-control-lg" }[size] || "h-control";
  const createIdx = canCreate ? items.length - 1 : -1;

  return (
    <div {...c.getRootProps()} className={["relative font-sans", className].join(" ")} style={style}>
      <div className={[
          H_CLS, CS_TRIGGER, shellEdge(c.f.invalid, c.open),
          c.f.disabled ? "bg-[var(--input-bg-disabled)] cursor-not-allowed" : "bg-[var(--input-bg)] cursor-pointer",
        ].join(" ")}>
        <div {...c.getTriggerProps(ref)} className={TRIGGER_INNER}>
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
        <div className="absolute z-dropdown top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-line-default rounded-md shadow-e-lg overflow-hidden">
          <div className="p-2 border-b border-line-subtle">
            <div className="flex items-center gap-2 h-[32px] px-2 border border-[var(--input-bdr)] rounded-sm bg-surface-soft">
              <i aria-hidden="true" className="ph ph-magnifying-glass text-[14px] text-fg-tertiary" />
              <input {...c.getSearchProps(searchPlaceholder)} value={q} onChange={(e) => { setQ(e.target.value); c.nav.setActiveIndex(0); }} placeholder={searchPlaceholder} className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-fg-primary" />
            </div>
          </div>
          <div {...c.getListProps()}>
            <div className="max-h-[var(--max-h-menu)] overflow-y-auto p-1">
              {filtered.map((o, i) => {
                const on = o.value === current;
                /* hover: only when unselected — the old `if (!on)` guard, expressed
                   as emit order rather than as a branch inside a handler. */
                return (
                  <div key={o.value} {...c.getOptionProps(i, on)}
                    className={[
                      CS_ROW,
                      on ? "bg-surface-brand-soft text-fg-brand font-semibold"
                         : "bg-transparent text-fg-primary font-normal hover:bg-surface-soft",
                    ].join(" ")}>
                    <span className="flex-1 min-w-0">{o.label}</span>
                    {on && <i aria-hidden="true" className="ph-bold ph-check text-[13px]" />}
                  </div>
                );
              })}
              {filtered.length === 0 && !canCreate && <div role="presentation" className="p-3 text-center text-sm text-fg-tertiary">No matches</div>}
            </div>
            {canCreate && (
              <div {...c.getOptionProps(createIdx, false)} className="flex items-center gap-2 py-2 px-3 border-t border-line-subtle cursor-pointer text-fg-brand text-sm font-semibold bg-transparent hover:bg-surface-brand-soft">
                <i aria-hidden="true" className="ph-bold ph-plus-circle text-[16px]" />
                <span>{createLabel} “<strong>{q.trim()}</strong>”</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
