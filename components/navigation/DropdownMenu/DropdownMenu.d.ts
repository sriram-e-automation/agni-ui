import * as React from "react";
export interface MenuItem {
  label: React.ReactNode;
  /** Phosphor icon name, e.g. "ph-trash". */
  icon?: string;
  /** Runs on click / Enter / Space. Call e.preventDefault() to keep the menu open. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
  danger?: boolean;
  /** Shown but inert (aria-disabled); focusable so its reason can be read. */
  disabled?: boolean;
  /** Tooltip explaining why the item is disabled. */
  disabledReason?: string;
  /** Plain-text label for typeahead when `label` is a node. */
  textValue?: string;
  /** Roles this item is shown to. Omit = every role. Dividers left stranded
   *  by a withheld item are removed with it. */
  roles?: string | string[];
}
export interface DropdownMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** Element that opens the menu (e.g. a Button). It is cloned with the menu-button
   *  ARIA (aria-haspopup, aria-expanded, aria-controls), an id and key handling —
   *  pass a DS Button or any focusable element that forwards its ref. */
  trigger: React.ReactNode;
  /** Menu items, plus literal "divider". */
  items?: (MenuItem | "divider")[];
  align?: "start" | "end";
  /** Blocks opening; dims the trigger. */
  disabled?: boolean;
  /** Current viewer's role, matched against each `roles` list below. Same
   *  contract as utils/RoleGate. Omit to show everything. */
  role?: string;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: React.CSSProperties;
}
/** Click-to-open action menu anchored to a trigger.
 *
 *  WAI-ARIA menu button. Trigger: Enter / Space / ↓ open on the first item,
 *  ↑ on the last. Menu: ↑ ↓ (wrapping) · Home / End · typeahead · Enter / Space
 *  run · Escape closes back to the trigger · Tab closes and moves on.
 *  The ref is the wrapper element.
 *  @version 1.1.0
  * States: disabled.
*/
export declare const DropdownMenu: React.ForwardRefExoticComponent<DropdownMenuProps & React.RefAttributes<HTMLDivElement>>;
