import React from "react";
import { Avatar } from "../core/Avatar.tsx";
import { resolveDataState } from "../feedback/DataState.tsx";

/* ── Types (mirrored in PersonCard.d.ts) ── */
export interface PersonInfo {
  /** Employee ID (monospace meta). */
  id: string;
  name: string;
  /** Role level — uppercase eyebrow (Associate · Senior lead · Director …). */
  role?: string;
  /** Crew (department). */
  crew?: string;
  /** Team within the crew. */
  team?: string;
  /** Optional photo URL — initials otherwise. */
  avatar?: string | null;
  [key: string]: any;
}

export interface PersonCardProps {
  person: PersonInfo;
  /** sm 200px compact (tree nodes) · md 240px default · lg 280px (adds the ID line). @default "md" */
  size?: "sm" | "md" | "lg";
  /** Selection state — brand-soft fill + brand border. */
  selected?: boolean;
  /** De-emphasized (e.g. outside the highlighted reporting path). */
  dimmed?: boolean;
  /** Makes the card interactive (hover lift + press). */
  onClick?: (person: PersonInfo) => void;
  /** Override the size's default width ("100%", 260, …). */
  width?: number | string;
  /** Trailing slot (badge, collapse control …). */
  suffix?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * AgniUI · PersonCard
 * A crew-member card: avatar + name + crew · team, with the role level as an
 * uppercase eyebrow. The node unit of OrgTree; also usable in directories and
 * detail panes. States: rest · hover (lift) · selected (brand) · dimmed.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7d). The `hov`/`press` useState pair
 * is gone — hover lift is `enabled:hover:`, press is `enabled:active:`, both
 * guarded to non-interactive cards by `enabled` (a plain div has no :enabled,
 * so these compile to nothing there; the ternary is what previously guarded
 * it). `width` stays inline — it is a caller override, not a size choice.
 */
const SIZES = {
  sm: { w: 200, pad: "p-[8px_10px]", av: "sm", name: "text-sm", meta: "text-2xs", gap: "gap-2" },
  md: { w: 240, pad: "p-[10px_12px]", av: "md", name: "text-sm", meta: "text-2xs", gap: "gap-2" },
  lg: { w: 280, pad: "p-[12px_14px]", av: "lg", name: "text-md", meta: "text-xs", gap: "gap-3" },
} as const;

const CARD =
  "flex items-center box-border rounded-lg outline-none font-sans text-left " +
  "transition-[box-shadow,border-color,opacity,scale] duration-fast ease-standard";
const CARD_SEL = "bg-surface-brand-soft border border-line-brand shadow-e-xs";
const CARD_OFF =
  "bg-surface-card border border-line-subtle shadow-e-xs " +
  "enabled:hover:border-line-default enabled:hover:shadow-e-md enabled:active:shadow-e-xs enabled:active:[scale:var(--press-scale,0.97)]";
const EYEBROW = "text-2xs font-semibold tracking-wide uppercase mb-px overflow-hidden text-ellipsis whitespace-nowrap";
const NAME = "font-semibold text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap";
const META = "text-fg-secondary mt-px overflow-hidden text-ellipsis whitespace-nowrap";
const IDLINE = "text-2xs font-data text-fg-tertiary mt-[2px]";

export function PersonCard({ person, size = "md", selected = false, dimmed = false, onClick, width, suffix, loading, style = {} }: PersonCardProps) {
  const state = resolveDataState({ loading, shape: "personCard" });
  if (state !== false) return <div style={{ width: width ?? SIZES[size]?.w, ...style }}>{state}</div>;
  const s = SIZES[size] || SIZES.md;
  const interactive = !!onClick;
  const meta = [person.crew, person.team].filter(Boolean).join(" · ");
  const Tag = interactive ? "button" : "div";
  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={() => onClick?.(person)}
      className={[CARD, s.gap, s.pad, selected ? CARD_SEL : CARD_OFF, interactive ? "cursor-pointer" : "cursor-default", dimmed ? "opacity-[0.45]" : "opacity-100"].join(" ")}
      style={{ width: width ?? s.w, ...style }}>
      <Avatar name={person.name} src={person.avatar || null} size={s.av} />
      <div className="flex-1 min-w-0 text-left">
        {person.role && <div className={[EYEBROW, selected ? "text-fg-brand" : "text-fg-tertiary"].join(" ")}>{person.role}</div>}
        <div className={[s.name, NAME].join(" ")}>{person.name}</div>
        {meta && <div className={[s.meta, META].join(" ")}>{meta}</div>}
        {size === "lg" && person.id && <div className={IDLINE}>{person.id}</div>}
      </div>
      {suffix}
    </Tag>
  );
}
