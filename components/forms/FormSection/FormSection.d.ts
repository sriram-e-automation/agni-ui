import * as React from "react";
export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  /** Equal grid tracks for the fields. minmax(0,1fr) prevents overflow. */
  cols?: 2 | 3;
  /** Heading level for `title`, to fit the page outline. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Brand-rule section heading + fixed-column FormField grid.
 *  A named region: labelled by its title, described by `desc`. The ref is the <section>.
 *  @version 1.1.0
 */
export declare const FormSection: React.ForwardRefExoticComponent<FormSectionProps & React.RefAttributes<HTMLElement>>;
