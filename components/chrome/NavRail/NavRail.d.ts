import * as React from "react";
export interface NavRailItem {
  key: string;
  label: string;
  icon: string;
  /** Roles this page is reachable by. Omit = every role. */
  roles?: string[];
  sub?: { key: string; label: string; roles?: string[] }[];
}
export interface NavRailProps {
  items?: NavRailItem[];
  /** Active page key (matches an item or sub-item key). */
  active?: string;
  onSelect?: (key: string) => void;
  /** Expanded (drawer) vs collapsed (icon rail). */
  open?: boolean;
  onToggleOpen?: (open: boolean) => void;
  /** Overlay-drawer mode (tablet/phone): the toggle becomes ×, selecting closes. */
  overlay?: boolean;
  /** In overlay mode the rail supplies its own scrim + slide-in panel (fixed,
   *  at --z-overlay, 84vw cap on phones). Pass false only when a host already
   *  provides them. @default true */
  scrim?: boolean;
  onClose?: () => void;
  dark?: boolean;
  /** Small signature logo pinned at the bottom while open. */
  footerLogoSrc?: string;
  /** Group keys expanded initially. */
  defaultExpanded?: string[];
  /** Current viewer's role, matched against each `roles` list. Same contract
   *  as core/RoleGate. Omit to show everything. */
  role?: string;
  /* A parent whose every sub-item is withheld is withheld too, so the rail
     never shows an empty group. */
}
/** Desk-app left nav: items-driven with sub-groups, drawer ⇄ icon-rail collapse, overlay mode with its own scrim.
 *  @version 1.0.0
  * States: active · open.
*/
export declare function NavRail(props: NavRailProps): JSX.Element;
