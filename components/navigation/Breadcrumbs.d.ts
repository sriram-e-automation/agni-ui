import * as React from "react";
export interface Crumb { label: React.ReactNode; icon?: string; onClick?: () => void; }
export interface BreadcrumbsProps { items?: Crumb[]; style?: React.CSSProperties; }
/** Breadcrumb trail; last item is the current page.
 *  @version 1.0.0
 */
export declare function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
