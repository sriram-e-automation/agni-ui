import * as React from "react";
export interface LauncherApp { label: string; icon: string; }
export interface AppCategory { key: string; label: string; icon: string; apps: LauncherApp[]; }
export interface AppSwitcherProps {
  open?: boolean;
  onClose?: () => void;
  /** Pinned quick actions shown above the grid. */
  quickActions?: LauncherApp[];
  categories?: AppCategory[];
  /** Apps pinned to the rail (max 5). */
  pinnedApps?: LauncherApp[];
  onPinChange?: (apps: LauncherApp[]) => void;
  /** A tile or quick action was chosen. The launcher closes unless you preventDefault. */
  onLaunch?: (app: LauncherApp, e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name of the dialog. @default "All applications" */
  label?: string;
  id?: string;
}
/** Full-screen ERP application launcher overlay — a modal dialog (focus
 *  trapped, search focused first, Escape closes). Pin buttons sit beside each
 *  tile and are revealed on hover or keyboard focus.
 *  @version 1.1.0
  * States: open.
*/
export declare const AppSwitcher: React.ForwardRefExoticComponent<AppSwitcherProps & React.RefAttributes<HTMLDivElement>>;
