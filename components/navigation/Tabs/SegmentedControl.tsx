/**
 * @internal Renderer behind the public <Tabs> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef } from "react";
import { composeHandlers, useControllableState, useRovingFocus } from "../../utils/interaction.tsx";

/* ── Types (mirrored in SegmentedControl.d.ts) ── */
export interface SegmentedControlItem {
  key: string;
  /** Text label. Omit (icon only) for compact square segments. */
  label?: string;
  /** Phosphor icon class, e.g. "ph-list". */
  icon?: string;
  /** Count pill after the label. */
  count?: number;
  /** Tooltip — recommended for icon-only segments. */
  title?: string;
  /** Renders muted and inert. */
  disabled?: boolean;
}
export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  items: SegmentedControlItem[];
  /** Controlled selected key. Omit (and use `defaultValue`) for uncontrolled. */
  value?: string;
  defaultValue?: string;
  onChange?: (key: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * AgniUI · SegmentedControl
 * Pill-track scope tabs / view-mode toggle. Promoted from the admin-ops
 * scaffold + work-orders kit (page title bars & list/card view switches).
 * Text segments get an optional count pill; icon-only segments render square.
 *
 * A view / scope switch with no panels, so it is a WAI-ARIA radio group: one
 * Tab stop, ←/→ (and ↑/↓) move AND select, Home/End jump, disabled segments
 * are skipped. Icon-only segments are named by `title`. Name the group with
 * `aria-label` ("View", "Scope").
 *
 * Tailwind v4 (migrated Aug 2026, tranche 3). Sep 2026: this track's values
 * (--agni-neutral-100 bed, literal #fff active label) are now the system
 * standard — TabsStrip's segmented variant and PageTitleBar's own track were
 * reconciled to match.
 *
 * The icon-only square keeps riding --density-control-h - 6px (the same
 * contract as h-control-sm) so it tracks density and scale on both axes.
 */
const TRACK = "inline-flex gap-[2px] p-[3px] bg-[var(--agni-neutral-100)] rounded-md";
const BASE =
  "inline-flex items-center justify-center border-none rounded-sm font-sans " +
  "transition-[background-color,color] duration-fast ease-standard";
const ON = "bg-action-brand text-[#fff] shadow-e-xs cursor-pointer";
const OFF = "bg-transparent text-fg-tertiary cursor-pointer enabled:hover:text-fg-secondary";
const DISABLED = "bg-transparent text-fg-disabled cursor-not-allowed opacity-[var(--state-disabled-opacity)]";
const SQUARE = "w-[calc(var(--density-control-h)_-_6px)] h-control-sm text-[16px]";
const TEXT = "gap-1 px-3 py-1 text-sm font-medium";
const COUNT = "text-2xs font-data font-semibold leading-none px-1 py-[2px] rounded-full";
const COUNT_ON = "bg-[rgba(255,255,255,0.22)] text-[#fff]";
const COUNT_OFF = "bg-surface-page text-fg-tertiary";

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  { items = [], value, defaultValue, onChange, onKeyDown, style = {}, className = "", ...rest },
  ref,
) {
  const [selected, select] = useControllableState<string | undefined>({
    value, defaultValue: defaultValue ?? items.find((i) => !i.disabled)?.key, onChange: (k) => { if (k !== undefined) onChange?.(k); },
  });
  const roving = useRovingFocus({
    count: items.length,
    current: items.findIndex((i) => i.key === selected),
    orientation: "both",
    isDisabled: (i) => !!items[i]?.disabled,
    onMove: (i) => select(items[i].key),
  });
  return (
    <div {...rest} ref={ref} role="radiogroup" onKeyDown={composeHandlers(onKeyDown, roving.onKeyDown)}
      className={[TRACK, className].join(" ")} style={style}>
      {items.map((it, i) => {
        const on = selected === it.key;
        const dis = !!it.disabled;
        const iconOnly = !it.label;
        const state = dis ? DISABLED : on ? ON : OFF;
        const { ref: itemRef, tabIndex } = roving.getItemProps(i);
        return (
          <button key={it.key} ref={itemRef} tabIndex={tabIndex} type="button" title={it.title}
            role="radio" aria-checked={on} aria-disabled={dis || undefined}
            aria-label={iconOnly ? (it.title ?? it.key) : undefined}
            onClick={() => { if (!dis) select(it.key); }}
            className={[BASE, iconOnly ? SQUARE : TEXT, state].join(" ")}>
            {iconOnly ? <i aria-hidden="true" className={["ph", it.icon].join(" ")} /> : (
              <>
                {it.icon && <i aria-hidden="true" className={["ph", it.icon, "text-[14px]"].join(" ")} />}
                {it.label}
                {it.count != null && (
                  <span className={[COUNT, on ? COUNT_ON : COUNT_OFF].join(" ")}>{it.count}</span>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
});
