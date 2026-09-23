import * as React from "react";
export interface LauncherApp { label: string; icon: string; }
export interface AppCategory { key: string; label: string; icon: string; apps: LauncherApp[]; }
export interface AppSwitcherProps {
  open?: boolean;
  onClose?: () => void;
  /** Pinned quick actions shown above the grid. */
  quickActions?: LauncherApp[];
  categories?: AppCategory[];
}
/** Full-screen ERP application launcher overlay.
 *  @version 1.0.0
  * States: open.
*/
export declare function AppSwitcher(props: AppSwitcherProps): JSX.Element;
