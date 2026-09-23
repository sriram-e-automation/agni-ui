import * as React from "react";
export interface WorkspaceItem {
  key: string;
  icon: string;        // phosphor class, e.g. "ph-rocket"
  label: string;
  badge?: number;
  launch?: boolean;    // shows a launch arrow when expanded
}
export interface WorkspacePaneProps {
  /** Items, plus literal "divider" / "spacer" strings. */
  items?: (WorkspaceItem | "divider" | "spacer")[];
  open?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onSelect?: (key: string) => void;
  /** Key of the currently active/selected item — renders with brand background. */
  activeKey?: string | null;
  /** Title shown in the header when the pane is expanded. @default "Workspace" */
  title?: string;
  style?: React.CSSProperties;
}
/** Right-hand collapsible utility rail.
 *  @version 1.0.0
  * States: open.
*/
export declare function WorkspacePane(props: WorkspacePaneProps): JSX.Element;
