/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef } from "react";
import { useControllableState } from "../../utils/interaction.tsx";
import { useSelectCore, HiddenValue, shellEdge, TRIGGER_INNER, ICON_BTN, type SelectCommonProps } from "./useSelect.tsx";

/* ── Types (mirrored in MultiSelect.d.ts) ── */
export interface MultiSelectOption { value: string; label: string; disabled?: boolean; }
export interface MultiSelectProps extends SelectCommonProps {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled select. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  options?: (MultiSelectOption | string)[];
}
/** Multi-value picker with removable chips. */


/**
 * AgniUI · MultiSelect
 * Multi-value picker. value: string[]. options: [{value,label}] | string[].
 * Selected values show as removable chips inside the control.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 11). The control's edge and ring are
 * three complete strings (error / open / rest) rather than two independent
 * ternaries — border-colour and box-shadow always change together, and
 * splitting them is how the pair drifts. Only the per-rung font size stays
 * inline; it is a lookup, not a state.
 */
const MS_CONTROL = "flex items-center gap-1 flex-wrap py-1 px-2 bg-[var(--input-bg)] border rounded-md";
/* Error EDGE is persistent; the error RING is an open-state affordance, same as
   Input's focus-within pair. Testing `error` first without re-testing `open`
   either pins the ring on or drops it entirely — both were shipped briefly. */
const MS_ERR_OPEN   = "border-[var(--input-bdr-error)] ring-focus-error";
const MS_ERR_CLOSED = "border-[var(--input-bdr-error)] [box-shadow:none]";
const MS_OPEN  = "border-[var(--input-bdr-focus)] ring-focus";
const MS_REST  = "border-[var(--input-bdr)] [box-shadow:none]";
const MS_CHIP = "inline-flex items-center gap-1 py-[2px] pr-1 pl-2 bg-surface-brand-soft text-fg-brand rounded-sm text-xs font-medium";
const MS_OPTION = "flex items-center gap-2 w-full p-2 border-none cursor-pointer rounded-sm font-sans text-sm text-fg-primary text-left";
const MS_BOX = "size-4 rounded-xs border-[1.5px] text-fg-on-brand inline-flex items-center justify-center text-[11px] shrink-0";

const MIN_H = { sm: "min-h-control-sm", md: "min-h-control", lg: "min-h-control-lg" } as const;
/* Only the per-rung font size stays inline — a lookup, not a state. */
const FS = { sm: "var(--text-sm)", md: "var(--text-base)", lg: "var(--text-md)" } as const;

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(function MultiSelect(props, ref) {
  const { value, defaultValue = [], onChange, options = [], placeholder = "Select…", size = "md", name, form, style = {}, className = "" } = props;
  const opts: MultiSelectOption[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const [current, setCurrent] = useControllableState<string[]>({ value, defaultValue, onChange });
  const toggle = (v: string) => setCurrent(current.includes(v) ? current.filter((x) => x !== v) : [...current, v]);
  const c = useSelectCore({
    props, items: opts, getLabel: (o) => o.label, isItemDisabled: (o) => !!o.disabled, multiple: true,
    selectedIndex: opts.findIndex((o) => current.includes(o.value)),
    onCommit: (o) => toggle(o.value),
    onClearKey: () => { if (current.length) setCurrent(current.slice(0, -1)); },
  });
  const labelOf = (v: string) => opts.find((x) => x.value === v)?.label ?? v;
  const fs = FS[size] || FS.md;

  return (
    <div {...c.getRootProps()} className={["relative", className].join(" ")} style={style}>
      <div
        onClick={(e) => { if (!c.f.disabled && !(e.target as HTMLElement).closest("button")) { c.setOpen(!c.open); c.triggerRef.current?.focus(); } }}
        className={[
          MIN_H[size] || MIN_H.md, MS_CONTROL, shellEdge(c.f.invalid, c.open),
          c.f.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : "cursor-pointer opacity-100",
        ].join(" ")}>
        {current.map((v) => (
          <span key={v} className={MS_CHIP}>
            {labelOf(v)}
            <button type="button" tabIndex={-1} aria-label={"Remove " + labelOf(v)} disabled={c.f.disabled}
              onClick={(e) => { e.stopPropagation(); toggle(v); c.triggerRef.current?.focus(); }}
              className={[ICON_BTN, "text-[12px]"].join(" ")}><i aria-hidden="true" className="ph ph-x" /></button>
          </span>
        ))}
        <div {...c.getTriggerProps(ref)} className={TRIGGER_INNER}>
          {current.length === 0
            ? <span className="text-[var(--input-placeholder)]" style={{ fontSize: fs }}>{placeholder}</span>
            : <span className="sr-only">{current.length} selected</span>}
          <i aria-hidden="true" className={(c.open ? "ph ph-caret-up" : "ph ph-caret-down") + " ml-auto text-[14px] text-fg-tertiary"} />
          <HiddenValue name={name} form={form} value={current} />
        </div>
      </div>
      {c.open && (
        <div {...c.getListProps()} className="absolute top-[calc(100%+4px)] left-0 right-0 z-dropdown bg-surface-card border border-line-default rounded-md shadow-e-lg p-1 max-h-[var(--max-h-menu)] overflow-y-auto">
          {opts.map((o, i) => {
            const on = current.includes(o.value);
            return (
              <div key={o.value} {...c.getOptionProps(i, on, o.disabled)}
                className={[MS_OPTION, on ? "bg-surface-brand-soft" : "bg-transparent", o.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : ""].join(" ")}>
                <span aria-hidden="true" className={[MS_BOX, on ? "border-action-brand bg-action-brand" : "border-line-strong bg-transparent"].join(" ")}>{on && <i className="ph-bold ph-check" />}</span>
                {o.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
