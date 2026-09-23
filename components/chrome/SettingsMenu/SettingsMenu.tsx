import React, { forwardRef, useRef, useEffect } from "react";
import { mergeRefs, useFocusTrap, useStableId } from "../../utils/interaction.tsx";
import { Theme } from "../../utils/Theme.tsx";
import { Switch } from "../../primitives/Switch/Switch.tsx";
import { Tooltip } from "../../feedback/Tooltip/Tooltip.tsx";

/* ── Types (mirrored in SettingsMenu.d.ts) ── */
export interface SettingsMenuProps {
  dark?: boolean;
  onDarkChange?: (dark: boolean) => void;
  /** Accent key from Theme.accents. @default "forest" */
  accent?: string;
  onAccentChange?: (accent: string) => void;
  /** Selected background key. */
  wallpaper?: string;
  onWallpaperChange?: (key: string) => void;
  /** Selected display-size rung (fractional --scale). Section hidden unless onScaleChange is provided. */
  scale?: string;
  onScaleChange?: (scale: string) => void;
  /** Display-size rungs. @default S·M·L·XL → --scale 0.875/1/1.125/1.25 */
  scaleOptions?: { key: string; label: string }[];
  /** Background options. Provide `src` for an image swatch, or `color` for a subtle solid-tint swatch (e.g. a soft token). Omitting both renders a "none" swatch. Section hidden when empty. */
  wallpapers?: { key: string; label: string; src?: string; color?: string }[];
  /** Called on click-outside / Escape. */
  onClose?: () => void;
  style?: React.CSSProperties;
}
/** Appearance popover: dark-mode toggle + accent swatches + optional background picker. */


/**
 * AgniUI · SettingsMenu
 * Popover for appearance settings — dark mode + accent picker.
 * Render inside a position:relative trigger wrapper; it anchors top-right.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 6b). Swatches keep two things inline
 * because they are runtime values: an accent's own colour (its fill AND its
 * selected halo, which rings in that colour), and a wallpaper's image. The
 * hover grow is `hover:[scale:…]` — an arbitrary property on the native
 * `scale`, not scale-110, which routes through --tw-scale-* plumbing.
 */
const MENU = "absolute top-[calc(100%+8px)] right-0 z-dropdown w-[260px] p-2 bg-surface-card border border-line-default rounded-lg shadow-e-xl";
const EYEBROW = "px-2 pt-1 pb-2 text-2xs font-semibold tracking-wide uppercase text-fg-tertiary";
const EYEBROW_MID = "px-2 py-1 text-2xs font-semibold tracking-wide uppercase text-fg-tertiary";
const DIVIDER = "h-px bg-line-subtle mx-2 my-1";
const ROW_LABEL = "inline-flex items-center gap-2 text-sm font-medium text-fg-primary";
const SCALE_BTN =
  "flex-1 min-w-0 h-[32px] rounded-md cursor-pointer font-data text-xs font-semibold border " +
  "transition-[background-color,border-color,color] duration-fast";
const SCALE_ON = "bg-action-brand text-fg-on-brand border-action-brand";
const SCALE_OFF = "bg-surface-soft text-fg-secondary border-line-default hover:border-line-brand";
const ACCENT_BTN = "size-[30px] rounded-full cursor-pointer relative transition-[scale] duration-fast hover:[scale:1.1]";
const ACCENT_CHECK = "ph-bold ph-check text-fg-on-brand text-[13px] absolute inset-0 flex items-center justify-center";
const WALL_BTN =
  "w-[64px] h-[40px] rounded-md cursor-pointer relative inline-flex items-center justify-center " +
  "text-fg-tertiary text-[15px] transition-[scale,border-color] duration-fast hover:[scale:1.05]";
const WALL_ON = "border-2 border-action-brand [box-shadow:0_0_0_2px_var(--surface-brand-soft)]";
const WALL_OFF = "border border-line-default shadow-e-xs";
const WALL_TICK = "absolute right-[3px] bottom-[3px] size-[16px] rounded-full bg-action-brand text-fg-on-brand inline-flex items-center justify-center";

export const SettingsMenu = forwardRef<HTMLDivElement, SettingsMenuProps>(function SettingsMenu({
  dark = false,
  onDarkChange,
  accent = "forest",
  onAccentChange,
  wallpaper,
  onWallpaperChange,
  wallpapers = [],           // [{ key, label, src? or color? }] — neither = none swatch
  scale = "md",
  onScaleChange,
  scaleOptions = [{ key: "sm", label: "S" }, { key: "md", label: "M" }, { key: "lg", label: "L" }, { key: "xl", label: "XL" }],
  onClose,
  style = {},
}, fwd) {
  const ref = useRef<HTMLDivElement>(null);
  const base = useStableId(null, "agni-settings");
  /* Non-modal popover dialog: focus in on open, back to the gear on close. */
  useFocusTrap(ref, true);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose && onClose(); };
    document.addEventListener("mousedown", h);
    return () => { document.removeEventListener("mousedown", h); };
  }, [onClose]);

  return (
    <div
      ref={mergeRefs(fwd, ref)}
      role="dialog"
      aria-label="Settings"
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose && onClose(); } }}
      className={MENU}
      /* Transform-only pop. Visibility must NOT depend on the animation reaching
         its end frame — if the animation engine stalls (play-pending in a
         backgrounded/streamed frame) an opacity:0 start frame would leave the
         popover invisible-but-clickable. Base opacity stays 1; frame-0 is visible. */
      style={{ animation: "agni-pop-in var(--dur-normal) var(--ease-standard)", ...style }}
    >
      <div className={EYEBROW}>Appearance</div>

      {/* Dark mode row */}
      <div className="flex items-center justify-between p-2 rounded-md">
        <span id={base + "-dark"} className={ROW_LABEL}>
          <i aria-hidden="true" className={[dark ? "ph ph-moon-stars" : "ph ph-sun", "text-[18px] text-fg-secondary"].join(" ")} />
          Dark mode
        </span>
        <Switch checked={dark} onChange={onDarkChange} size="sm" aria-labelledby={base + "-dark"} />
      </div>

      {/* Display size — fractional scale rungs. Sets data-scale on the app root. */}
      {onScaleChange && (
        <React.Fragment>
          <div className={DIVIDER} />
          <div className={EYEBROW_MID}>Display size</div>
          <div className="flex gap-1 px-2 pt-1 pb-2">
            {scaleOptions.map((s) => {
              const on = (scale || "md") === s.key;
              return (
                <button
                  key={s.key} type="button" aria-label={s.label} aria-pressed={on}
                  onClick={() => onScaleChange(s.key)}
                  className={[SCALE_BTN, on ? SCALE_ON : SCALE_OFF].join(" ")}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </React.Fragment>
      )}

      <div className={DIVIDER} />

      {/* Accent picker */}
      <div className={EYEBROW_MID}>Accent</div>
      <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2">
        {Theme.accents.map((a) => {
          const on = (accent || "forest") === a.key;
          return (
            <Tooltip key={a.key} label={a.label} side="top">
            <button
              type="button" aria-label={a.label} aria-pressed={on}
              onClick={() => onAccentChange && onAccentChange(a.key)}
              className={ACCENT_BTN}
              /* fill + selected halo are the swatch's own colour — runtime values */
              style={{
                background: a.color,
                border: on ? "2px solid var(--surface-card)" : "2px solid transparent",
                boxShadow: on ? `0 0 0 2px ${a.color}` : "var(--shadow-xs)",
              }}
            >
              {on && <i className={ACCENT_CHECK} />}
            </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Background picker — rendered only when the host supplies options */}
      {wallpapers.length > 0 && (
        <React.Fragment>
          <div className={DIVIDER} />
          <div className={EYEBROW_MID}>Background</div>
          <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2">
            {wallpapers.map((w) => {
              const on = wallpaper === w.key;
              return (
                <Tooltip key={w.key} label={w.label} side="top">
                <button
                  type="button" aria-label={w.label} aria-pressed={on}
                  onClick={() => onWallpaperChange && onWallpaperChange(w.key)}
                  className={[WALL_BTN, on ? WALL_ON : WALL_OFF].join(" ")}
                  style={{ background: w.src ? `url("${w.src}") center / cover no-repeat` : (w.color || "var(--surface-soft)") }}
                >
                  {!w.src && !w.color && <i className="ph ph-prohibit" />}
                  {on && <span className={WALL_TICK}><i className="ph-bold ph-check text-[10px]" /></span>}
                </button>
                </Tooltip>
              );
            })}
          </div>
        </React.Fragment>
      )}
      <style>{`@keyframes agni-pop-in { from { transform: translateY(-6px) scale(0.98); } to { transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
});
