import * as React from "react";
export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Phosphor icon class. @default "ph-tray" */
  icon?: string;
  title?: React.ReactNode;
  message?: React.ReactNode;
  /** Primary action (what creates the first item). */
  action?: React.ReactNode;
  /** sm panel-sized · md default · lg full-region. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Dashed container. @default true — false for side panels and card bodies. */
  bordered?: boolean;
  /** Alias for size="sm". */
  compact?: boolean;
  style?: React.CSSProperties;
}
/** Empty-state block — text + action, never a bare illustration.
 *  The ref is the block; native attributes pass through.
 *  @version 1.1.0
 */
export declare const EmptyState: React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLDivElement>>;
