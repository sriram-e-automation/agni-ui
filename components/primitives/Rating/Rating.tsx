import React, { useState } from "react";

/**
 * AgniUI · Rating
 * Star scale — read-only by default (safety rating, review score); pass
 * onChange to let the user set it. `disabled` blocks interaction and dims.
 *
 * Tailwind v4 (migrated Aug 2026). Star geometry and the button reset are
 * classes; the filled-star colour stays inline because `tone` is a caller
 * -supplied colour and the hover preview index is runtime state.
 */
export interface RatingProps {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  tone?: string;
  onChange?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const STAR_SIZE = { sm: "text-[12px]", md: "text-[14px]", lg: "text-[18px]" } as const;
const STAR_BTN = "inline-flex border-none bg-transparent p-0 cursor-pointer outline-none focus-visible:focus-ring rounded-xs";

export function Rating({
  value = 0, max = 5, size = "md", tone = "var(--status-warning)",
  onChange, label, showValue, disabled = false, style, className = "",
}: RatingProps) {
  const [hovIdx, setHovIdx] = useState(0);
  const interactive = !!onChange && !disabled;
  const shown = interactive && hovIdx ? hovIdx : value;
  const title = label || (value + "/" + max);

  return (
    <span
      className={["inline-flex items-center gap-1", disabled ? "opacity-[var(--state-disabled-opacity)]" : "", className].join(" ")}
      style={style}
      title={title}
    >
      <span className="inline-flex gap-px" onMouseLeave={interactive ? () => setHovIdx(0) : undefined}>
        {Array.from({ length: max }).map((_, i) => {
          const n = i + 1;
          const on = n <= shown;
          const star = (
            <i
              className={[on ? "ph-fill ph-star" : "ph ph-star", STAR_SIZE[size] || STAR_SIZE.md].join(" ")}
              /* tone is a caller-supplied colour — runtime value. */
              style={{ color: on ? tone : "var(--border-subtle)" }}
            />
          );
          return interactive
            ? <button key={n} type="button" title={n + "/" + max} onClick={() => onChange(n)} onMouseEnter={() => setHovIdx(n)} className={STAR_BTN}>{star}</button>
            : <React.Fragment key={n}>{star}</React.Fragment>;
        })}
      </span>
      {showValue && <span className="font-data text-xs text-fg-secondary">{value}/{max}</span>}
    </span>
  );
}
