import * as React from "react";
export interface AccordionItem { key: string; title: React.ReactNode; icon?: string; content: React.ReactNode; /** Shown but inert; skipped by arrow keys. */ disabled?: boolean; }
export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  items?: AccordionItem[];
  /** Allow multiple panels open at once. */
  multi?: boolean;
  /** Controlled open keys. */
  open?: string[];
  defaultOpen?: string[];
  onOpenChange?: (open: string[]) => void;
  /** Heading level wrapping each trigger, to fit the page outline. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  style?: React.CSSProperties;
}
/** Collapsible stacked sections.
 *  WAI-ARIA accordion: heading-wrapped <button aria-expanded aria-controls>
 *  triggers and labelled region panels. Enter / Space toggle · ↑ ↓ between
 *  triggers · Home / End. The ref is the outer element.
 *  @version 1.1.0
 */
export declare const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
