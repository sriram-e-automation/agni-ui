import * as React from "react";
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
  /** Background options. Provide `src` for an image swatch, or `color` for a subtle solid-tint swatch. Omitting both renders a "none" swatch. Section hidden when empty. */
  wallpapers?: { key: string; label: string; src?: string; color?: string }[];
  /** Called on click-outside / Escape. */
  onClose?: () => void;
  style?: React.CSSProperties;
}
/** Appearance popover: dark-mode toggle + accent swatches + optional background picker.
 *  @version 1.1.0
 */
export declare const SettingsMenu: React.ForwardRefExoticComponent<SettingsMenuProps & React.RefAttributes<HTMLDivElement>>;
