import * as React from "react";
export interface AccordionItem { key: string; title: React.ReactNode; icon?: string; content: React.ReactNode; }
export interface AccordionProps {
  items?: AccordionItem[];
  /** Allow multiple panels open at once. */
  multi?: boolean;
  defaultOpen?: string[];
  style?: React.CSSProperties;
}
/** Collapsible stacked sections.
 *  @version 1.0.0
 */
export declare function Accordion(props: AccordionProps): JSX.Element;
