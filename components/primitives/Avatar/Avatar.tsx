import React, { useState } from "react";

/* ── Types (mirrored in Avatar.d.ts) ── */
export interface AvatarProps {
  /** Used for initials + deterministic color. */
  name?: string;
  /** Optional photo URL. */
  src?: string | null;
  /** @default "md" */
  size?: "xs" | "sm" | "md" | "lg";
  /** Show green presence dot. */
  online?: boolean;
  /** Rounded-square instead of circle. */
  square?: boolean;
  /** Saturated identity-color fill + white text, instead of the pastel bg/tinted-text default. */
  solid?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
/** Initials/photo avatar with presence indicator. A photo that fails to load
 *  (broken `src`) falls back to initials automatically. */

/**
 * AgniUI · Avatar
 * Initials avatar with deterministic identity color from the name hash, via
 * the --avatar-N-bg/fg token pairs (light + dark in tokens/colors.css) +
 * presence dot. Pass `src` for a photo. Sizes: xs · sm · md · lg.
 *
 * Tailwind v4 (migrated Aug 2026). Geometry and type scale are literal class
 * tables; the identity colour stays inline because it is derived from the name
 * hash at runtime and cannot be a static class.
 */
const PALETTE = [1, 2, 3, 4, 5, 6].map((n) => [`var(--avatar-${n}-bg)`, `var(--avatar-${n}-fg)`]);
function hash(str = "") { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); }
function initials(name = "") {
  return name.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/* 22 / 28 / 36 / 48 px with the historic round(d × 0.38) type sizes. */
const SIZE_CLS = {
  xs: "size-[22px] text-[8px]",
  sm: "size-[28px] text-[11px]",
  md: "size-[36px] text-[14px]",
  lg: "size-[48px] text-[18px]",
} as const;
/* Presence dot — max(8, d × 0.26). */
const DOT_CLS = {
  xs: "size-[8px]",
  sm: "size-[8px]",
  md: "size-[9px]",
  lg: "size-[12px]",
} as const;

const BASE =
  "relative inline-flex items-center justify-center shrink-0 overflow-hidden " +
  "font-sans font-semibold select-none";

export function Avatar({
  name = "",
  src = null,
  size = "md",     // xs | sm | md | lg
  online = false,
  square = false,
  solid = false,   // true = saturated identity-color fill + white text (opaque chip, no pastel wash)
  style = {},
  className = "",
  ...rest
}: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const showPhoto = src && !broken;
  const [softBg, fg] = PALETTE[hash(name) % PALETTE.length];

  return (
    <span
      className={[
        BASE,
        SIZE_CLS[size] || SIZE_CLS.md,
        square ? "rounded-md" : "rounded-full",
        showPhoto ? "bg-surface-soft" : "",
        className,
      ].join(" ")}
      /* Identity colour is hash-derived — runtime only. */
      style={{
        ...(showPhoto ? {} : { background: solid ? fg : softBg }),
        color: solid ? "var(--text-on-brand)" : fg,
        ...style,
      }}
      {...rest}
    >
      {showPhoto
        ? <img src={src} alt={name} onError={() => setBroken(true)} className="size-full object-cover" />
        : initials(name)}
      {online && (
        <span className={[DOT_CLS[size] || DOT_CLS.md, "absolute -right-px -bottom-px rounded-full bg-status-success border-2 border-surface-card"].join(" ")} />
      )}
    </span>
  );
}
