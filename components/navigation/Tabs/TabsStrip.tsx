/**
 * @internal Renderer behind the public <Tabs> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useState } from "react";
import { composeHandlers, useControllableState, useRovingFocus, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in Tabs.d.ts) ── */
export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
  /** Tooltip while disabled. @default "Not available for your role" */
  disabledReason?: string;
}
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  tabs?: TabItem[];
  /** Controlled selected key. Omit (and use `defaultValue`) for uncontrolled. */
  value?: string;
  defaultValue?: string;
  onChange?: (key: string) => void;
  /** @default "underline" */
  variant?: "underline" | "segmented";
  size?: "sm" | "md";
  /** "automatic": arrows select as they move · "manual": arrows move, Enter/Space select. @default "automatic" */
  activation?: "automatic" | "manual";
  /** Id of the panel each tab controls — sets aria-controls. Implies tab semantics. */
  getPanelId?: (key: string) => string;
  /** ARIA pattern. Default: "tabs" for underline (or with getPanelId), "radio" for segmented. */
  semantics?: "tabs" | "radio";
  style?: React.CSSProperties;
  className?: string;
}
/** Controlled tab strip — underline (page) or segmented (filter). */

/**
 * AgniUI · Tabs
 * Controlled tab strip. tabs: [{key,label,icon?,badge?}]. Two looks:
 * variant="underline" (page tabs) | "segmented" (filter toggle).
 *
 * Keyboard (roving focus — the strip is one Tab stop): ←/→ move, Home/End jump,
 * disabled tabs are skipped. Page tabs are a WAI-ARIA tablist (tab ids are
 * `${id}-tab-${key}`; pair with `getPanelId` for aria-controls); the
 * segmented filter toggle is a radio group, since it switches a view rather
 * than revealing a panel.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 3). The underline variant's
 * onMouseEnter/Leave pair is gone; hover lives on the INACTIVE class block only,
 * which is also how the old JS behaved (it guarded on !on && !dis).
 *
 * Sep 2026: the segmented track was reconciled with SegmentedControl and
 * PageTitleBar's own — all three pill tracks now share one bed
 * (--agni-neutral-100), one active state (bg-action-brand, literal #fff
 * label) and one count/badge treatment (rgba(255,255,255,.22) on, muted off).
 */
const FONT = { sm: "text-sm", md: "text-base" } as const;

/* ── segmented ─────────────────────────────────────────────────────────── */
const SEG_TRACK = "inline-flex gap-[2px] p-[3px] bg-[var(--agni-neutral-100)] rounded-md";
const SEG_BASE =
  "inline-flex items-center gap-1 border-none px-3 py-1 rounded-sm font-sans font-medium " +
  "whitespace-nowrap transition-[background-color,color] duration-fast ease-standard";
const SEG_ON = "bg-action-brand text-[#fff] shadow-e-xs cursor-pointer";
const SEG_OFF = "bg-transparent text-fg-tertiary cursor-pointer enabled:hover:text-fg-secondary";
const SEG_DISABLED = "bg-transparent text-fg-disabled cursor-not-allowed opacity-[var(--state-disabled-opacity)]";
const SEG_BADGE = "text-2xs font-data font-semibold leading-none px-1 py-[2px] rounded-full";
const SEG_BADGE_ON = "bg-[rgba(255,255,255,0.22)] text-[#fff]";
const SEG_BADGE_OFF = "bg-surface-page text-fg-tertiary";

/* ── underline ─────────────────────────────────────────────────────────── */
const UL_TRACK = "flex gap-1 border-b border-line-subtle";
/* border-0, NOT border-none: `border-none` emits `border-style: none`, which
   zeroes the computed width of the border-b-2 underline below — the active tab
   then draws nothing. The old inline styles got away with it only because the
   `borderBottom` longhand came after `border: none`. README rule 5. */
const UL_BASE =
  "inline-flex items-center gap-2 border-0 bg-transparent px-3 py-2 -mb-px border-b-2 " +
  "font-sans whitespace-nowrap transition-[color,border-color] duration-fast ease-standard";
const UL_ON = "border-b-action-brand font-semibold text-fg-brand cursor-pointer";
const UL_OFF = "border-b-transparent font-medium text-fg-tertiary cursor-pointer enabled:hover:text-fg-secondary";
const UL_DISABLED = "border-b-transparent font-medium text-fg-disabled cursor-not-allowed opacity-[var(--state-disabled-opacity)]";
const UL_BADGE = "text-2xs font-data font-semibold px-1 py-px rounded-full";
const UL_BADGE_ON = "bg-surface-brand-soft text-fg-brand";
const UL_BADGE_OFF = "bg-surface-sunken text-fg-tertiary";

export const TabsStrip = forwardRef<HTMLDivElement, TabsProps>(function TabsStrip({
  tabs = [],
  value,
  defaultValue,
  onChange,
  variant = "underline",   // underline | segmented
  size = "md",
  activation = "automatic",
  getPanelId,
  semantics,
  id,
  onKeyDown,
  style = {},
  className = "",
  ...rest
}, ref) {
  const fs = FONT[size] || FONT.md;
  const seg = variant === "segmented";
  const base = useStableId(id, "agni-tabs");
  const asTabs = (semantics ?? (seg && !getPanelId ? "radio" : "tabs")) === "tabs";
  const [selected, select] = useControllableState<string | undefined>({ value, defaultValue: defaultValue ?? tabs.find((t) => !t.disabled)?.key, onChange: (k) => { if (k !== undefined) onChange?.(k); } });
  const selIdx = tabs.findIndex((t) => t.key === selected);
  const [focusIdx, setFocusIdx] = useState(selIdx);
  const manual = asTabs && activation === "manual";
  const roving = useRovingFocus({
    count: tabs.length,
    current: manual ? (focusIdx >= 0 ? focusIdx : selIdx) : selIdx,
    orientation: "horizontal",
    isDisabled: (i) => !!tabs[i]?.disabled,
    onMove: (i) => { setFocusIdx(i); if (!manual) select(tabs[i].key); },
  });

  return (
    <div
      {...rest}
      ref={ref}
      id={id}
      role={asTabs ? "tablist" : "radiogroup"}
      aria-orientation={asTabs ? "horizontal" : undefined}
      onKeyDown={composeHandlers(onKeyDown, roving.onKeyDown)}
      className={[seg ? SEG_TRACK : UL_TRACK, className].join(" ")}
      style={style}
    >
      {tabs.map((t, i) => {
        const on = selected === t.key;
        const dis = !!t.disabled;
        const state = dis
          ? (seg ? SEG_DISABLED : UL_DISABLED)
          : on ? (seg ? SEG_ON : UL_ON) : (seg ? SEG_OFF : UL_OFF);
        const { ref: itemRef, tabIndex } = roving.getItemProps(i);
        return (
          <button key={t.key} ref={itemRef} tabIndex={tabIndex} type="button"
            id={`${base}-tab-${t.key}`}
            role={asTabs ? "tab" : "radio"}
            aria-selected={asTabs ? on : undefined}
            aria-checked={asTabs ? undefined : on}
            aria-controls={asTabs && getPanelId ? getPanelId(t.key) : undefined}
            aria-disabled={dis || undefined}
            /* aria-disabled rather than disabled: a disabled tab stays discoverable
               (and keeps its reason tooltip) — roving focus skips it. */
            title={dis ? (t.disabledReason ?? "Not available for your role") : undefined}
            onClick={() => { if (!dis) { setFocusIdx(i); select(t.key); } }}
            onKeyDown={(e) => { if (manual && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); if (!dis) select(t.key); } }}
            className={[seg ? SEG_BASE : UL_BASE, fs, state].join(" ")}>
            {t.icon && <i aria-hidden="true" className={["ph", t.icon, "text-[16px]"].join(" ")} />}
            {t.label}
            {t.badge != null && (
              <span className={[
                seg ? SEG_BADGE : UL_BADGE,
                seg ? (on ? SEG_BADGE_ON : SEG_BADGE_OFF) : (on ? UL_BADGE_ON : UL_BADGE_OFF),
              ].join(" ")}>{t.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
});

/** Props for the panel a tab controls: `<div {...tabPanelProps(tabsId, key)}>`. */
export function tabPanelProps(tabsId: string, key: string) {
  return { id: `${tabsId}-panel-${key}`, role: "tabpanel" as const, "aria-labelledby": `${tabsId}-tab-${key}`, tabIndex: 0 };
}
