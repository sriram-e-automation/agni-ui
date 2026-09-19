import React, { useState, useEffect } from "react";
import { TipBubble, useTip } from "../feedback/Tooltip.tsx";
import { Input } from "../forms/Input.tsx";

/* ── Types (mirrored in AppSwitcher.d.ts) ── */
export interface LauncherApp { label: string; icon: string; }
export interface AppCategory { key: string; label: string; icon: string; apps: LauncherApp[]; }
export interface AppSwitcherProps {
  open?: boolean;
  onClose?: () => void;
  /** Pinned quick actions shown above the grid. */
  quickActions?: LauncherApp[];
  categories?: AppCategory[];
}
/** Full-screen ERP application launcher overlay. */


/**
 * AgniUI · AppSwitcher
 * Full-screen ERP launcher overlay. quickActions: [{label,icon}].
 * categories: [{key,label,icon,apps:[{label,icon}]}]. App labels may use \n.
 * pinnedApps: [{label,icon}] — max 5; shown in "Pinned to rail" section.
 * onPinChange(apps) — fired when user pins/unpins.
 */

/* ── Per-tile component ─────────────────────────────────────────────
   Tailwind v4 (migrated Aug 2026, tranche 6b). The per-tile `hov` useState is
   gone — it existed to (a) style the tile on hover and (b) MOUNT the pin
   button. (a) is plain `hover:`; (b) is the `group` pattern: the pin button is
   always mounted and hidden until the tile is hovered, unless the app is
   already pinned. The tooltip timer (useTip) stays — a delay is real state. */
const TILE =
  "group relative flex flex-col items-center gap-2 pt-4 px-2 pb-3 min-h-[104px] " +
  "border border-line-subtle rounded-lg bg-surface-card cursor-pointer " +
  "transition-[border-color,box-shadow,translate] duration-fast " +
  "hover:border-line-brand hover:shadow-e-md hover:[translate:0_-2px]";
const PIN_BASE =
  "absolute top-[6px] right-[6px] size-[22px] rounded-sm border-none items-center justify-center " +
  "text-[13px] transition-[background-color,color] duration-fast";
const PIN_PINNED = "inline-flex bg-surface-brand-soft text-fg-brand cursor-pointer hover:bg-action-brand hover:text-fg-on-brand";
const PIN_CAN = "hidden group-hover:inline-flex bg-surface-sunken text-fg-secondary cursor-pointer hover:bg-surface-brand-soft hover:text-fg-brand";
const PIN_FULL = "hidden group-hover:inline-flex bg-surface-sunken text-[var(--text-quaternary)] cursor-not-allowed";
const TILE_ICON =
  "size-[44px] shrink-0 rounded-md inline-flex items-center justify-center text-[23px] border " +
  "transition-[background-color,color,border-color] duration-fast";
const TILE_ICON_PINNED = "bg-surface-brand-soft text-fg-brand border-line-brand";
const TILE_ICON_REST = "bg-surface-soft text-fg-secondary border-transparent";
const TILE_LABEL = "text-xs font-medium text-fg-secondary text-center leading-snug whitespace-pre-line";

function AppTile({ app, isPinned, canPin, onPinToggle }) {
  const pinTip = useTip(300);
  const pinLabel = isPinned ? "Unpin from rail" : canPin ? "Pin to rail" : "Rail full — unpin an app first";
  return (
    <button type="button" className={TILE}>
      <button
        type="button"
        aria-label={pinLabel}
        onClick={(e) => { pinTip.bind.onClick(); e.stopPropagation(); if (isPinned || canPin) onPinToggle(); }}
        className={[PIN_BASE, isPinned ? PIN_PINNED : canPin ? PIN_CAN : PIN_FULL].join(" ")}
        onFocus={pinTip.bind.onFocus} onBlur={pinTip.bind.onBlur}
        onMouseEnter={pinTip.bind.onMouseEnter} onMouseLeave={pinTip.bind.onMouseLeave}
      >
        <i className={"ph " + (isPinned ? "ph-push-pin-slash" : "ph-push-pin")} />
        {pinTip.open && <TipBubble label={pinLabel} side="bottom" />}
      </button>
      <span className={[TILE_ICON, isPinned ? TILE_ICON_PINNED : TILE_ICON_REST].join(" ")}>
        <i className={"ph " + app.icon} />
      </span>
      <span className={TILE_LABEL}>{app.label}</span>
    </button>
  );
}

const SCRIM =
  "fixed inset-0 z-modal bg-[var(--scrim)] [backdrop-filter:blur(4px)] " +
  "flex items-start justify-center px-6 py-12 overflow-y-auto";
const PANEL =
  "w-full max-w-[920px] bg-surface-page border border-line-default rounded-2xl shadow-e-2xl overflow-hidden";
const HEADER = "flex items-center gap-4 px-6 py-5 border-b border-line-subtle bg-surface-card";
const LAUNCH_TILE = "size-[38px] rounded-md bg-action-brand text-fg-on-brand inline-flex items-center justify-center text-[20px] shrink-0";
const CLOSE =
  "size-[36px] rounded-md border border-line-default bg-surface-card text-fg-secondary cursor-pointer " +
  "text-[17px] shrink-0 transition-colors duration-fast hover:border-line-brand hover:text-fg-primary";
const EYEBROW = "text-2xs font-semibold tracking-wide uppercase text-fg-tertiary mb-2";
const QUICK =
  "inline-flex items-center gap-2 px-3 py-2 border border-line-default rounded-full bg-surface-card " +
  "cursor-pointer font-sans text-sm font-medium text-fg-secondary " +
  "transition-[background-color,color,border-color] duration-fast " +
  "hover:bg-surface-brand-soft hover:text-fg-brand hover:border-line-brand";
const SECTION_HEAD = "flex items-center gap-2 mb-3";
const SECTION_RULE = "flex-1 min-w-0 h-px bg-line-subtle";
const COUNT_PILL = "text-2xs font-data text-fg-tertiary bg-surface-sunken rounded-full py-[2px] px-2";
const GRID = "grid grid-cols-[repeat(auto-fill,minmax(108px,1fr))] gap-2";

export function AppSwitcher({
  open = false,
  onClose,
  quickActions = [],
  categories = [],
  pinnedApps = [],
  onPinChange,
}: AppSwitcherProps) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, onClose]);

  useEffect(() => { if (open) setQ(""); }, [open]);

  if (!open) return null;

  const ql = q.trim().toLowerCase();
  const filtered = categories
    .map((c) => ({ ...c, apps: c.apps.filter((a) => !ql || a.label.toLowerCase().includes(ql)) }))
    .filter((c) => c.apps.length > 0);

  const isPinned = (app) => pinnedApps.some((p) => p.icon === app.icon && p.label === app.label);
  const pinToggle = (app) => {
    if (!onPinChange) return;
    if (isPinned(app)) {
      onPinChange(pinnedApps.filter((p) => !(p.icon === app.icon && p.label === app.label)));
    } else if (pinnedApps.length < 5) {
      onPinChange([...pinnedApps, app]);
    }
  };

  return (
    <div onClick={onClose} className={SCRIM} style={{ animation: "agni-fade-in var(--dur-normal) var(--ease-standard)" }}>
      <div onClick={(e) => e.stopPropagation()} className={PANEL}
        style={{ animation: "agni-scale-pop var(--dur-normal) var(--ease-spring)" }}>
        {/* Header */}
        <div className={HEADER}>
          <span className={LAUNCH_TILE}><i className="ph-bold ph-dots-nine" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-md font-semibold text-fg-primary">All applications</div>
            <div className="text-xs text-fg-tertiary">Jump to any Agnikul desk</div>
          </div>
          <Input
            value={q}
            onChange={setQ}
            placeholder="Search apps…"
            prefixIcon={<i className="ph ph-magnifying-glass" />}
            style={{ width: 260, maxWidth: "40%" }}
            autoFocus
          />
          <button type="button" onClick={onClose} className={CLOSE}><i className="ph ph-x" /></button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto">

          {/* Quick actions */}
          {quickActions.length > 0 && !ql && (
            <div className="mb-6">
              <div className={EYEBROW}>Quick actions</div>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((a, i) => (
                  <button key={i} type="button" className={QUICK}>
                    <i className={"ph " + a.icon + " text-[17px]"} /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pinned to rail */}
          {pinnedApps.length > 0 && !ql && (
            <div className="mb-6">
              <div className={SECTION_HEAD}>
                <i className="ph ph-push-pin-fill text-[16px] text-fg-brand" />
                <span className="text-sm font-semibold text-fg-primary">Pinned to rail</span>
                <span className={SECTION_RULE} />
                <span className={COUNT_PILL}>{pinnedApps.length} / 5</span>
              </div>
              <div className={GRID}>
                {pinnedApps.map((app, i) => (
                  <AppTile key={"pin" + i} app={app} isPinned={true} canPin={false}
                    onPinToggle={() => onPinChange && onPinChange(pinnedApps.filter((_, j) => j !== i))} />
                ))}
              </div>
            </div>
          )}

          {/* All categories */}
          {filtered.map((cat) => (
            <div key={cat.key} className="mb-6">
              <div className={SECTION_HEAD}>
                <i className={"ph " + cat.icon + " text-[18px] text-fg-brand"} />
                <span className="text-sm font-semibold text-fg-primary">{cat.label}</span>
                <span className={SECTION_RULE} />
              </div>
              <div className={GRID}>
                {cat.apps.map((app, i) => (
                  <AppTile key={cat.key + i} app={app}
                    isPinned={isPinned(app)}
                    canPin={!isPinned(app) && pinnedApps.length < 5}
                    onPinToggle={() => pinToggle(app)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-fg-tertiary">
              <i className="ph ph-magnifying-glass text-[32px] opacity-[0.4] block mb-2" />
              <span className="text-sm">No apps match "{q}"</span>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes agni-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes agni-scale-pop { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
