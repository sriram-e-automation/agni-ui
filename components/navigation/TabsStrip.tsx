/**
 * @internal Renderer behind the public <Tabs> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React from "react";

/* ── Types (mirrored in Tabs.d.ts) ── */
export interface TabItem { key: string; label: string; icon?: string; badge?: number; disabled?: boolean; }
export interface TabsProps {
  tabs?: TabItem[];
  value?: string;
  onChange?: (key: string) => void;
  /** @default "underline" */
  variant?: "underline" | "segmented";
  size?: "sm" | "md";
  style?: React.CSSProperties;
  className?: string;
}
/** Controlled tab strip — underline (page) or segmented (filter). */

/**
 * AgniUI · Tabs
 * Controlled tab strip. tabs: [{key,label,icon?,badge?}]. Two looks:
 * variant="underline" (page tabs) | "segmented" (filter toggle).
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

export function TabsStrip({
  tabs = [],
  value,
  onChange,
  variant = "underline",   // underline | segmented
  size = "md",
  style = {},
  className = "",
}: TabsProps) {
  const fs = FONT[size] || FONT.md;
  const seg = variant === "segmented";

  return (
    <div className={[seg ? SEG_TRACK : UL_TRACK, className].join(" ")} style={style}>
      {tabs.map((t) => {
        const on = value === t.key;
        const dis = !!t.disabled;
        const state = dis
          ? (seg ? SEG_DISABLED : UL_DISABLED)
          : on ? (seg ? SEG_ON : UL_ON) : (seg ? SEG_OFF : UL_OFF);
        return (
          <button key={t.key} type="button" disabled={dis}
            title={dis ? "Not available for your role" : undefined}
            onClick={() => !dis && onChange && onChange(t.key)}
            className={[seg ? SEG_BASE : UL_BASE, fs, state].join(" ")}>
            {t.icon && <i className={["ph", t.icon, "text-[16px]"].join(" ")} />}
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
}
