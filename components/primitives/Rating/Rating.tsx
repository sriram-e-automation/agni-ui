import React, { forwardRef, useState } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { useControllableState, useRovingFocus, useStableId } from "../../utils/interaction.tsx";

/**
 * AgniUI · Rating
 * Star scale — read-only by default (safety rating, review score); pass
 * onChange (or defaultValue) to let the user set it. `disabled` blocks
 * interaction and dims.
 *
 * Interactive, it is a WAI-ARIA radio group: one Tab stop (the current star),
 * ArrowRight/ArrowDown move to the next star and ArrowLeft/ArrowUp to the
 * previous one — selecting as they go, as radios do — Home/End jump to the
 * ends, and each star is a radio named "n out of max". Read-only, it is a single
 * image labelled "n out of max". With a `name` it submits through a hidden input.
 *
 * Tailwind v4 (migrated Aug 2026). Star geometry and the button reset are
 * classes; the filled-star colour stays inline because `tone` is a caller
 * -supplied colour and the hover preview index is runtime state.
 */
export interface RatingProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onChange" | "defaultValue"> {
  /** Controlled value. */
  value?: number;
  /** Initial value for an uncontrolled, interactive rating. */
  defaultValue?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  tone?: string;
  /** Makes the rating interactive. Receives the new value. */
  onChange?: (value: number) => void;
  /** Accessible name of the group (e.g. "Safety rating"). */
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  /** Submitted with a native <form> through a hidden input. */
  name?: string;
  form?: string;
  /** Fires when focus leaves the whole group. */
  onBlur?: (e: React.FocusEvent<HTMLSpanElement>) => void;
  style?: React.CSSProperties;
  className?: string;
}

const STAR_SIZE = { sm: "text-[12px]", md: "text-[14px]", lg: "text-[18px]" } as const;
const STAR_BTN = "inline-flex border-none bg-transparent p-0 cursor-pointer outline-none focus-visible:focus-ring rounded-xs";

export const Rating = forwardRef<HTMLSpanElement, RatingProps>(function Rating({
  value, defaultValue, max = 5, size = "md", tone = "var(--status-warning)",
  onChange, label, showValue, disabled, readOnly = false, required, error, name, form, id, onBlur,
  style, className = "", ...rest
}, ref) {
  const [hovIdx, setHovIdx] = useState(0);
  const [current, setCurrent] = useControllableState<number>({ value, defaultValue: defaultValue ?? 0, onChange });
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-rating"),
  );
  const interactive = (!!onChange || defaultValue !== undefined) && !f.disabled && !readOnly;
  const shown = interactive && hovIdx ? hovIdx : current;
  const summary = `${current} out of ${max}`;
  const roving = useRovingFocus({
    count: max,
    current: Math.max(0, Math.round(current) - 1),
    orientation: "both",
    loop: false,
    onMove: (i) => setCurrent(i + 1),
  });

  const star = (n: number) => {
    const on = n <= shown;
    return (
      <i
        aria-hidden="true"
        className={[on ? "ph-fill ph-star" : "ph ph-star", STAR_SIZE[size] || STAR_SIZE.md].join(" ")}
        /* tone is a caller-supplied colour — runtime value. */
        style={{ color: on ? tone : "var(--border-subtle)" }}
      />
    );
  };

  return (
    <span
      {...rest}
      ref={ref}
      id={f.id}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? (rest["aria-label"] ?? label) : [label, summary].filter(Boolean).join(": ")}
      aria-labelledby={interactive ? (rest["aria-labelledby"] ?? (label ? undefined : f.contextLabelId)) : undefined}
      aria-describedby={f.describedBy}
      aria-disabled={f.disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-required={interactive && f.required ? true : undefined}
      aria-invalid={f.invalid || undefined}
      className={["inline-flex items-center gap-1", f.disabled ? "opacity-[var(--state-disabled-opacity)]" : "", className].join(" ")}
      style={style}
      title={interactive ? undefined : (label || summary)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.(e); }}
    >
      <span className="inline-flex gap-px" onMouseLeave={interactive ? () => setHovIdx(0) : undefined}
        onKeyDown={interactive ? roving.onKeyDown : undefined}>
        {Array.from({ length: max }).map((_, i) => {
          const n = i + 1;
          if (!interactive) return <React.Fragment key={n}>{star(n)}</React.Fragment>;
          const { ref: itemRef, tabIndex } = roving.getItemProps(i);
          return (
            <button
              key={n}
              ref={itemRef}
              tabIndex={tabIndex}
              type="button"
              role="radio"
              aria-checked={Math.round(current) === n}
              aria-label={`${n} out of ${max}`}
              title={n + "/" + max}
              onClick={() => setCurrent(n)}
              onMouseEnter={() => setHovIdx(n)}
              className={STAR_BTN}
            >
              {star(n)}
            </button>
          );
        })}
      </span>
      {showValue && <span aria-hidden="true" className="font-data text-xs text-fg-secondary">{current}/{max}</span>}
      {name && <input type="hidden" name={name} form={form} value={current} />}
    </span>
  );
});
