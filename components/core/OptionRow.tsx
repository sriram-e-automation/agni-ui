import React from "react";

/**
 * AgniUI · OptionRow
 * Icon + title/description row, as a bordered card or a flush list row, with an
 * optional note/value footer. Selectable and clickable.
 *
 * Tailwind v4 (migrated Aug 2026). The hover useState is gone: the row is a
 * `group`, and the trailing caret picks up `group-hover:` — which is what the
 * old `on` boolean existed to do. Hover classes are omitted entirely when
 * disabled, since a <div> has no :enabled state to guard with.
 */
export interface OptionRowProps {
  icon?: string;
  /** Icon tint. Defaults to the brand accent. */
  iconTone?: string;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  /** Footer label, left of the value. */
  note?: React.ReactNode;
  value?: React.ReactNode;
  valueIcon?: string;
  /** Right-side slot; replaces the caret. */
  trailing?: React.ReactNode;
  /** "card" — bordered surface · "flush" — list row. @default "card" */
  variant?: "card" | "flush";
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const CARD_BASE = "bg-surface-card border rounded-lg shadow-e-xs p-[14px]";
const CARD_HOVER = "hover:shadow-e-sm";
const FLUSH_BASE = "border-none rounded-md px-3 py-[9px]";
const FLUSH_HOVER = "hover:bg-surface-soft";

export function OptionRow({
  icon, iconTone, title, desc, note, value, valueIcon, trailing,
  variant = "card", onClick, disabled, selected, style, className = "",
}: OptionRowProps) {
  const card = variant === "card";
  const clickable = !!onClick && !disabled;

  const cls = [
    "group flex flex-col transition-[box-shadow,background-color] duration-fast ease-standard",
    card ? CARD_BASE : FLUSH_BASE,
    card ? (selected ? "border-line-brand" : "border-line-subtle") : "",
    disabled ? "opacity-[var(--state-disabled-opacity)]" : (card ? CARD_HOVER : FLUSH_HOVER),
    clickable ? "cursor-pointer" : "cursor-default",
    (note || value) ? "gap-2.5" : "gap-0",
    className,
  ].join(" ");

  return (
    <div
      className={cls}
      style={style}
      onClick={disabled ? undefined : onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={[
              "inline-flex items-center justify-center shrink-0 rounded-md bg-surface-brand-soft",
              card ? "size-[36px] text-[18px]" : "size-[30px] text-[15px]",
            ].join(" ")}
            /* Caller-supplied tint — runtime value, not a static class. */
            style={{ color: iconTone || "var(--text-brand)" }}
          >
            <i className={"ph " + icon} />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="m-0 text-sm font-semibold text-fg-primary">{title}</p>
          {desc && <p className="mt-0.5 mb-0 text-xs leading-normal text-fg-secondary">{desc}</p>}
        </div>
        {trailing}
        {onClick && !trailing && (
          <i className={[
            "ph ph-caret-right shrink-0 mt-[3px] text-[14px] transition-colors duration-fast",
            disabled ? "text-fg-tertiary" : "text-fg-tertiary group-hover:text-fg-brand",
          ].join(" ")} />
        )}
      </div>
      {(note || value) && (
        <div className="flex items-center gap-1 pt-2 border-t border-line-subtle">
          <span className="text-2xs text-fg-tertiary">{note}</span>
          <span className={[
            "ml-auto inline-flex items-center gap-1 font-data text-xs font-medium",
            valueIcon ? "text-fg-brand" : "text-fg-primary",
          ].join(" ")}>
            {valueIcon && <i className={"ph " + valueIcon} style={{ fontSize: 13 }} />}
            {value}
          </span>
        </div>
      )}
    </div>
  );
}
