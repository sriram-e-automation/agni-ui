import React from "react";
import { Avatar } from "./Avatar.tsx";

export interface AvatarStackProps {
  names?: string[];
  /** Avatars shown before collapsing into a +N chip. @default 3 */
  max?: number;
  /** @default "xs" */
  size?: "xs" | "sm" | "md" | "lg";
  /** Saturated identity-color fill (passed to Avatar). */
  solid?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * AgniUI · AvatarStack
 * Overlapping identity avatars — shows up to `max`, then a +N overflow chip
 * (full name list on the chip's title). Used in the shell header (active
 * users) and kanban/task cards (multi-assignee).
 *
 * Tailwind v4 (migrated Aug 2026). The negative overlap margin and the stacking
 * order are computed per index, so they stay inline; everything else is classes.
 */
const CHIP_CLS = {
  xs: "size-[22px] text-2xs",
  sm: "size-[28px] text-2xs",
  md: "size-[36px] text-xs",
  lg: "size-[48px] text-xs",
} as const;

const CHIP_BASE =
  "relative z-0 inline-flex items-center justify-center rounded-full " +
  "bg-surface-soft text-fg-secondary font-data font-semibold " +
  "outline-2 outline-surface-card";

export function AvatarStack({ names = [], max = 3, size = "xs", solid = false, style, className = "" }: AvatarStackProps) {
  const dims = { xs: 22, sm: 28, md: 36, lg: 48 };
  const d = dims[size] || dims.xs;
  const overlap = -Math.round(d * 0.36);
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className={["inline-flex items-center", className].join(" ")} style={style}>
      {shown.map((n, i) => (
        <span
          key={n + i}
          title={n}
          className="relative rounded-full"
          /* Overlap + stack order are index-derived. */
          style={{ marginLeft: i === 0 ? 0 : overlap, zIndex: shown.length - i }}
        >
          <span className="inline-flex rounded-full outline-2 outline-surface-card">
            <Avatar name={n} size={size} solid={solid} />
          </span>
        </span>
      ))}
      {extra > 0 && (
        <span
          title={names.slice(max).join(", ")}
          className={[CHIP_BASE, CHIP_CLS[size] || CHIP_CLS.xs].join(" ")}
          style={{ marginLeft: overlap }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
