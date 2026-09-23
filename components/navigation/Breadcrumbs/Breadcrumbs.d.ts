import * as React from "react";
export interface Crumb {
  label: React.ReactNode;
  icon?: string;
  /** Renders the crumb as a link. */
  href?: string;
  /** Renders the crumb as a button — or runs alongside `href` (preventDefault for client routing). */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}
export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items?: Crumb[];
  /** Accessible name of the landmark. @default "Breadcrumb" */
  label?: string;
  style?: React.CSSProperties;
}
/** Breadcrumb trail; last item is the current page (aria-current="page").
 *  A navigation landmark around an ordered list; ancestors are keyboard-operable
 *  links or buttons. The ref is the <nav>.
 *  @version 1.1.0
 */
export declare const Breadcrumbs: React.ForwardRefExoticComponent<BreadcrumbsProps & React.RefAttributes<HTMLElement>>;
