/**
 * @internal Renderer behind the public <Tabs> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React from "react";

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
export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value?: string;
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

export function SegmentedControl({ items = [], value, onChange, style = {}, className = "" }: SegmentedControlProps) {
  return (
    <div className={[TRACK, className].join(" ")} style={style}>
      {items.map((it) => {
        const on = value === it.key;
        const dis = !!it.disabled;
        const iconOnly = !it.label;
        const state = dis ? DISABLED : on ? ON : OFF;
        return (
          <button key={it.key} type="button" title={it.title} disabled={dis}
            onClick={() => !dis && onChange && onChange(it.key)}
            className={[BASE, iconOnly ? SQUARE : TEXT, state].join(" ")}>
            {iconOnly ? <i className={["ph", it.icon].join(" ")} /> : (
              <>
                {it.icon && <i className={["ph", it.icon, "text-[14px]"].join(" ")} />}
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
}
