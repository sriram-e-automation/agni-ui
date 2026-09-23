import * as React from "react";
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Used for initials + deterministic color — and the accessible name. */
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
  /** Accessible name override. @default name */
  alt?: string;
  /** Hide from assistive tech — when the name is already written next to it. */
  decorative?: boolean;
  style?: React.CSSProperties;
}
/** Initials/photo avatar with presence indicator. A photo that fails to load
 *  (broken `src`) falls back to initials automatically.
 *  Announced once as an image named for the person ("Asha Rao, online").
 *  The ref is the outer <span>.
 *  @version 1.1.0
 */
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLSpanElement>>;
