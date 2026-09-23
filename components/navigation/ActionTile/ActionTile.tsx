import React from "react";

/**
 * AgniUI · ActionTile
 * Large tap target for a desk's primary entry points: icon, title, description,
 * optional count badge, and a trailing arrow that reacts on hover.
 *
 * Tailwind v4 (migrated Aug 2026). It is a real <button>, so every hover/press
 * state is `enabled:`-guarded CSS and the hover useState is gone. The tone tint
 * stays inline: it is a caller-supplied colour fed through color-mix.
 */
export interface ActionTileProps {
  icon?: string;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  /** Accent for the icon tile. Defaults to the brand action colour. */
  tone?: string;
  /** Count badge on the icon. `false`/null hides it. */
  badge?: React.ReactNode | false | null;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const BASE =
  "group text-left flex items-start gap-3 p-4 bg-surface-card border rounded-lg font-sans " +
  "transition-[border-color,box-shadow,translate] duration-fast ease-standard " +
  "outline-none focus-visible:focus-ring " +
  "disabled:cursor-not-allowed disabled:opacity-[var(--state-disabled-opacity)]";

const IDLE =
  "border-line-subtle cursor-pointer " +
  "enabled:hover:border-line-brand enabled:hover:shadow-e-md " +
  /* Direct `translate` value, not -translate-y-0.5: the numeric utility routes
     through --tw-translate-* custom properties, which the DS token compiler
     reads as unclassified tokens declared under a component selector. This also
     keeps the historic flat -2px instead of a --scale-multiplied step. */
  "enabled:hover:[translate:0_-2px]";

export function ActionTile({ icon, title, desc, tone, badge, onClick, disabled, style, className = "" }: ActionTileProps) {
  const c = tone || "var(--action-brand)";
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      className={[BASE, disabled ? "border-line-subtle" : IDLE, className].join(" ")}
      style={style}
    >
      <span
        className="relative inline-flex items-center justify-center shrink-0 size-[42px] rounded-md text-[21px]"
        /* color-mix over a caller-supplied tone — runtime value. */
        style={{ background: "color-mix(in oklch, " + c + " 12%, transparent)", color: c }}
      >
        <i className={"ph " + icon} />
        {badge != null && badge !== false && (
          <span className="absolute -top-[5px] -right-[5px] inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 box-border rounded-full bg-status-error text-fg-on-brand text-[10px] font-bold border-2 border-surface-card">
            {badge}
          </span>
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-fg-primary mb-[3px]">{title}</span>
        {desc && <span className="block text-xs leading-snug text-fg-tertiary">{desc}</span>}
      </span>
      <i className={[
        "ph ph-arrow-right shrink-0 mt-0.5 text-[15px] transition-colors duration-fast",
        disabled ? "text-fg-tertiary" : "text-fg-tertiary group-hover:text-fg-brand",
      ].join(" ")} />
    </button>
  );
}
