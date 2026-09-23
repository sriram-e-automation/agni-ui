import React from "react";

/* ── Types (mirrored in Theme.d.ts) ── */
export interface AccentPreset { key: string; label: string; color: string; }
export interface ThemeApi {
  /** Accent presets for the picker. */
  accents: AccentPreset[];
  /** Inline CSS-var overrides for an accent. Spread onto a container. */
  deriveAccentVars(accent: string | null, dark?: boolean): React.CSSProperties;
}
/** Runtime theming helper object (dark + accent). */


/**
 * AgniUI · Theme
 * Runtime theming helper. `deriveAccentVars(accent, dark)` returns an inline
 * style object that re-points the brand tokens to a chosen accent — spread it
 * onto a container: <div style={{ ...Theme.deriveAccentVars(accent, dark) }}>.
 * Pair with <SettingsMenu> for the dark-mode + accent picker UI.
 */
function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const SCALES = {
  forest:  { base: "#3F7343", hover: "#335C36", press: "#294829", soft: "#EEF4EC", softDark: "rgba(126,212,164,0.12)", text: "#3F7343", textDark: "#7ED4A4" },
  sky:     { base: "#1570EF", hover: "#175CD3", press: "#1849A9", soft: "#EFF8FF", softDark: "rgba(107,176,255,0.14)", text: "#175CD3", textDark: "#6BB0FF" },
  violet:  { base: "#5925DC", hover: "#4A1FB8", press: "#3E1C96", soft: "#F4F3FF", softDark: "rgba(155,124,255,0.14)", text: "#5925DC", textDark: "#9B7CFF" },
  amber:   { base: "#DC6803", hover: "#B25201", press: "#93420A", soft: "#FFFAEB", softDark: "rgba(245,166,91,0.14)",  text: "#B25201", textDark: "#F5A65B" },
  crimson: { base: "#D92D20", hover: "#B42318", press: "#912018", soft: "#FEF3F2", softDark: "rgba(255,138,128,0.14)", text: "#B42318", textDark: "#FF8A80" },
  teal:    { base: "#0E9384", hover: "#107569", press: "#125D56", soft: "#F0FDF9", softDark: "rgba(94,210,196,0.14)",  text: "#107569", textDark: "#5ED2C4" },
};

const MODE_KEY = "agniui:mode";
const mq = () =>
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

export const Theme = {
  /** Ordered accent presets for the SettingsMenu swatch picker. */
  accents: [
    { key: "forest",  label: "Forest",  color: "#3F7343" },
    { key: "sky",     label: "Sky",     color: "#1570EF" },
    { key: "violet",  label: "Violet",  color: "#5925DC" },
    { key: "amber",   label: "Amber",   color: "#DC6803" },
    { key: "crimson", label: "Crimson", color: "#D92D20" },
    { key: "teal",    label: "Teal",    color: "#0E9384" },
  ],

  /** Returns inline CSS-var overrides for the chosen accent (forest = default → {}). */
  deriveAccentVars(accent, dark = false) {
    if (!accent || accent === "forest" || !SCALES[accent]) return {};
    const s = SCALES[accent];
    return {
      "--action-brand": s.base,
      "--action-brand-hover": s.hover,
      "--action-brand-press": s.press,
      "--text-brand": dark ? s.textDark : s.text,
      "--border-brand": dark ? s.textDark : s.base,
      "--surface-brand-soft": dark ? s.softDark : s.soft,
      "--agni-green-600": dark ? s.textDark : s.base,
      "--agni-green-700": s.hover,
      "--agni-green-50": dark ? s.softDark : s.soft,
      "--tone-brand-fg": dark ? s.textDark : s.hover,
      "--tone-brand-bg": dark ? s.softDark : s.soft,
      "--focus-ring": `0 0 0 3px ${hexToRgba(s.base, 0.2)}`,
    };
  },

  /* ── Mode: the default is the operating system's preference ──────────────
     tokens/system-theme.css already resolves an unattributed document to the
     OS mode in pure CSS. These helpers are for the app that needs the
     resolved mode as a VALUE — to set data-theme on a subtree, or to pass a
     `dark` flag to a component that still takes one. ────────────────────── */

  /** Is the OS asking for dark right now? */
  prefersDark() {
    const m = mq();
    return m ? m.matches : false;
  },

  /** "system" | "light" | "dark"  ->  "light" | "dark". */
  resolveMode(pref) {
    if (pref === "light" || pref === "dark") return pref;
    return Theme.prefersDark() ? "dark" : "light";
  },

  /** Call cb("light"|"dark") when the OS preference changes. Returns an
      unsubscribe function; safe to call where matchMedia is absent. */
  watchSystemMode(cb) {
    const m = mq();
    if (!m) return () => {};
    const handler = (e) => cb(e.matches ? "dark" : "light");
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  },

  /** Read the stored preference ("system" when the user has not chosen). */
  storedMode() {
    try { return localStorage.getItem(MODE_KEY) || "system"; } catch { return "system"; }
  },

  /** Persist a preference. Pass "system" to clear the override. */
  storeMode(pref) {
    try {
      if (pref === "system") localStorage.removeItem(MODE_KEY);
      else localStorage.setItem(MODE_KEY, pref);
    } catch { /* storage unavailable — session-only */ }
  },
};
