import * as React from "react";
export interface AvatarStackProps {
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
 *  @version 1.0.0
 */
export declare function AvatarStack(props: AvatarStackProps): JSX.Element;
