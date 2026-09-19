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
export interface MenuRowProps {
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
export declare function PanelIconMenu(props: PanelIconMenuProps): JSX.Element;
/** Radio/checkbox menu row for PanelIconMenu content. */
export declare function MenuRow(props: MenuRowProps): JSX.Element;
/** Side-panel empty state — delegates to EmptyState at size="sm", unbordered. */
export declare function PanelEmpty(props: PanelEmptyProps): JSX.Element;
/** Uppercase section label style for menu content. */
export declare const panelMenuLabelStyle: React.CSSProperties;
/** Bundle object: { PanelIconMenu, MenuRow, PanelEmpty, panelMenuLabelStyle }.
 *  @version 1.0.0
 */
export declare const PanelKit: { PanelIconMenu: typeof PanelIconMenu; MenuRow: typeof MenuRow; PanelEmpty: typeof PanelEmpty; panelMenuLabelStyle: React.CSSProperties };
