import * as React from "react";
export interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  names?: string[];
  /** Avatars shown before collapsing into a +N chip. @default 3 */
  max?: number;
  /** @default "xs" */
  size?: "xs" | "sm" | "md" | "lg";
  /** Saturated identity-color fill (passed to Avatar). */
  solid?: boolean;
  style?: React.CSSProperties;
}
/** Overlapping identity avatars with a +N overflow chip.
 *  One named group to AT ("Asha Rao, Ben Ito and 2 more"); `aria-label` overrides.
 *  @version 1.1.0
 */
export declare const AvatarStack: React.ForwardRefExoticComponent<AvatarStackProps & React.RefAttributes<HTMLDivElement>>;
