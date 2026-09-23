import * as React from "react";
export interface ShellFooterProps {
  /** Text before the signature logo. @default "Designed & developed by" */
  signatureText?: string;
  /** Signature logo image at the left edge. */
  signatureLogoSrc?: string;
  signatureAlt?: string;
  /** Right-edge line. @default "© <year> Agnikul Cosmos" */
  copyright?: string;
  /** Replace the default content entirely. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Canonical Desk-app footer bar — signature left, copyright right. Pairs with ShellHeader.
 *  @version 1.0.0
 */
export declare function ShellFooter(props: ShellFooterProps): JSX.Element;
