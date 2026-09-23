/**
 * @internal Renderer behind the public <Select> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef } from "react";
import { useControllableState } from "../../utils/interaction.tsx";
import { useSelectCore, HiddenValue, type SelectCommonProps } from "./useSelect.tsx";

/* ── Types (mirrored in Select.d.ts) ── */
export interface SelectOption { value: string; label: string; icon?: string; disabled?: boolean; }
export interface SelectProps extends SelectCommonProps {
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled select. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** [{value,label}] or string[] */
  options?: (SelectOption | string)[];
}
/** Custom dropdown select with themed menu. */

/**
 * AgniUI · Select
 * Lightweight custom dropdown. options: [{value,label}] or string[].
 * onChange receives the value.
 *
 * Tailwind v4 (migrated Aug 2026). Option hover was an inline
 * onMouseEnter/onMouseLeave pair writing e.currentTarget.style.background; it is
 * now a `hover:` class. The trigger rides h-control-* with the control family.
 */
const SIZE = {
  sm: "h-control-sm px-[10px] text-sm",
  md: "h-control px-[12px] text-base",
  lg: "h-control-lg px-[14px] text-md",
} as const;
const OPT_TEXT = { sm: "text-sm", md: "text-base", lg: "text-md" } as const;

const TRIGGER =
  "flex items-center justify-between gap-2 w-full border rounded-md font-sans " +
  "transition-[border-color,box-shadow] duration-fast ease-standard outline-none";

/* Trigger border reads the layer-3 --input-bdr (→ --border-control) like the rest
   of the control family. Input and Select were the only two controls carrying
   --border-default; both moved onto the control token together (Aug 2026) so the
   pair that sits side by side in every form cannot disagree. The MENU keeps
   --border-default — menus are surfaces, not controls, and match DropdownMenu. */
const TRIGGER_IDLE = "bg-surface-card border-[var(--input-bdr)] cursor-pointer";
const TRIGGER_OPEN = "bg-surface-card border-line-brand cursor-pointer ring-focus";
const TRIGGER_ERROR = "bg-surface-card border-status-error cursor-pointer";
const TRIGGER_ERROR_OPEN = "bg-surface-card border-status-error cursor-pointer ring-focus-error";
const TRIGGER_DISABLED = "bg-surface-soft border-[var(--input-bdr)] cursor-not-allowed opacity-[var(--state-disabled-opacity)]";

const MENU =
  "absolute top-[calc(100%+4px)] left-0 right-0 z-dropdown bg-surface-card " +
  "border border-line-default rounded-md shadow-e-lg p-1 " +
  "max-h-[var(--max-h-menu)] overflow-y-auto";

const OPT =
  "flex items-center justify-between gap-2 w-full px-2 py-2 border-none cursor-pointer " +
  "rounded-sm text-left font-sans transition-colors duration-fast";
const OPT_ON = "bg-surface-brand-soft text-fg-brand font-medium";
const OPT_OFF = "bg-transparent text-fg-primary hover:bg-surface-soft";

export const SelectBasic = forwardRef<HTMLDivElement, SelectProps>(function SelectBasic(props, ref) {
  const {
    value, defaultValue = null, onChange, options = [], placeholder = "Select…", size = "md",
    name, form, style = {}, className = "",
  } = props;
  const opts: SelectOption[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const [current, setCurrent] = useControllableState<string | null>({
    value, defaultValue, onChange: (v) => { if (v != null) onChange?.(v); },
  });
  const selectedIndex = opts.findIndex((o) => o.value === current);
  const sel = selectedIndex >= 0 ? opts[selectedIndex] : undefined;
  const s = SIZE[size] ? size : "md";
  const c = useSelectCore({
    props, items: opts, getLabel: (o) => o.label, isItemDisabled: (o) => !!o.disabled,
    selectedIndex, onCommit: (o) => setCurrent(o.value),
  });

  const triggerState = c.f.disabled ? TRIGGER_DISABLED
    : c.f.invalid ? (c.open ? TRIGGER_ERROR_OPEN : TRIGGER_ERROR)
    : (c.open ? TRIGGER_OPEN : TRIGGER_IDLE);

  return (
    <div {...c.getRootProps()} className={["relative", className].join(" ")} style={style}>
      <div
        {...c.getTriggerProps(ref)}
        /* This trigger IS the drawn control, so it keeps the global focus halo. */
        data-agni-input={undefined}
        className={[TRIGGER, SIZE[s], triggerState, sel ? "text-fg-primary" : "text-fg-tertiary"].join(" ")}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{sel ? sel.label : placeholder}</span>
        <i aria-hidden="true" className={[c.open ? "ph ph-caret-up" : "ph ph-caret-down", "shrink-0 text-[14px] text-fg-tertiary"].join(" ")} />
        <HiddenValue name={name} form={form} value={current} />
      </div>
      {c.open && (
        <div {...c.getListProps()} className={MENU}>
          {opts.map((o, i) => {
            const on = o.value === current;
            return (
              <div
                key={o.value}
                {...c.getOptionProps(i, on, o.disabled)}
                className={[OPT, OPT_TEXT[s], on ? OPT_ON : OPT_OFF, o.disabled ? "cursor-not-allowed opacity-[var(--state-disabled-opacity)]" : ""].join(" ")}
              >
                <span className="inline-flex items-center gap-2">
                  {o.icon && <i aria-hidden="true" className={"ph " + o.icon + " text-[16px] text-fg-tertiary"} />}
                  {o.label}
                </span>
                {on && <i aria-hidden="true" className="ph ph-check text-[14px]" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
