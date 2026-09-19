import * as React from "react";
export interface MenuItem {
  label: React.ReactNode;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
  /** Roles this item is shown to. Omit = every role. Dividers left stranded
   *  by a withheld item are removed with it. */
  roles?: string[];
}
export interface DropdownMenuProps {
  /** Element that opens the menu (e.g. an IconButton). */
  trigger: React.ReactNode;
  /** Menu items, plus literal "divider". */
  items?: (MenuItem | "divider")[];
  align?: "start" | "end";
  /** Blocks opening; dims the trigger. */
  disabled?: boolean;
  /** Current viewer's role, matched against each `roles` list below. Same
   *  contract as core/RoleGate. Omit to show everything. */
  role?: string;

  style?: React.CSSProperties;
}
/** Click-to-open action menu anchored to a trigger.
 *  @version 1.0.0
  * States: disabled.
*/
export declare function DropdownMenu(props: DropdownMenuProps): JSX.Element;
