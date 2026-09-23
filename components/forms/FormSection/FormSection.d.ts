import * as React from "react";
export interface FormSectionProps {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  /** Equal grid tracks for the fields. minmax(0,1fr) prevents overflow. */
  cols?: 2 | 3;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Brand-rule section heading + fixed-column FormField grid.
 *  @version 1.0.0
 */
export declare function FormSection(props: FormSectionProps): JSX.Element;
