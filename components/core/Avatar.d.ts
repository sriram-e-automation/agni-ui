import * as React from "react";
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
}
/** Initials/photo avatar with presence indicator. A photo that fails to load
 *  (broken `src`) falls back to initials automatically.
 *  @version 1.0.0
 */
export declare function Avatar(props: AvatarProps): JSX.Element;
