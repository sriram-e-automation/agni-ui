import * as React from "react";
export interface AccentPreset { key: string; label: string; color: string; }
/** Resolved appearance. `"system"` is a preference, never a resolved value. */
export type Mode = "light" | "dark";
export type ModePref = Mode | "system";
export interface ThemeApi {
  /** Accent presets for the picker. */
  accents: AccentPreset[];
  /** Inline CSS-var overrides for an accent. Spread onto a container. */
  deriveAccentVars(accent: string | null, dark?: boolean): React.CSSProperties;
  /** Is the OS asking for dark right now? */
  prefersDark(): boolean;
  /** Collapse a preference to the mode that should render. */
  resolveMode(pref: ModePref): Mode;
  /** Subscribe to OS preference changes; returns an unsubscribe function. */
  watchSystemMode(cb: (mode: Mode) => void): () => void;
  /** Stored preference — `"system"` when the user has not overridden. */
  storedMode(): ModePref;
  /** Persist a preference; `"system"` clears the override. */
  storeMode(pref: ModePref): void;
}
/** Runtime theming helper object (mode + accent).
 *  @version 1.0.0
 */
export declare const Theme: ThemeApi;
