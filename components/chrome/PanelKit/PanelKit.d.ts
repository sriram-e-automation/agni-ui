import * as React from "react";
export interface PanelIconMenuProps {
  /** Phosphor icon class (without "ph "). */
  icon: string;
  /** Shows the active dot + brand ring. */
  active?: boolean;
  title?: string;
  /** Popover width. @default 224 */
  width?: number;
  children?: React.ReactNode;
}
export interface MenuRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  type?: "radio" | "checkbox";
  label?: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
}
export interface PanelEmptyProps {
  icon: string;
  /** Body line — becomes the title when no `title` is given. */
  text?: React.ReactNode;
  title?: React.ReactNode;
  action?: React.ReactNode;
}
/** 38px icon trigger + anchored popover with active dot.  * States: active.
*/
export declare const PanelIconMenu: React.ForwardRefExoticComponent<PanelIconMenuProps & React.RefAttributes<HTMLDivElement>>;
/** Radio/checkbox menu row for PanelIconMenu content. */
export declare const MenuRow: React.ForwardRefExoticComponent<MenuRowProps & React.RefAttributes<HTMLButtonElement>>;
/** Side-panel empty state — delegates to EmptyState at size="sm", unbordered. */
export declare const PanelEmpty: React.ForwardRefExoticComponent<PanelEmptyProps & React.RefAttributes<HTMLDivElement>>;
/** Uppercase section label style for menu content. */
export declare const panelMenuLabelStyle: React.CSSProperties;
/** Bundle object: { PanelIconMenu, MenuRow, PanelEmpty, panelMenuLabelStyle }.
 *  @version 1.1.0
 */
export declare const PanelKit: { PanelIconMenu: typeof PanelIconMenu; MenuRow: typeof MenuRow; PanelEmpty: typeof PanelEmpty; panelMenuLabelStyle: React.CSSProperties };
