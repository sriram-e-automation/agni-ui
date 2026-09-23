import React from "react";
import { Bar } from "../layout/Bar.tsx";

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

/**
 * AgniUI · ShellFooter
 * The canonical Desk-app footer bar — signature at the left edge,
 * copyright at the right. Pairs with ShellHeader; pass as AppShell's
 * `footer` so overlays can anchor to --footer-h.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 6). Height and edge come from `Bar`,
 * which owns the shell geometry — this component only fills it.
 */
const META = "text-xs text-fg-tertiary";

export function ShellFooter({ signatureText = "Designed & developed by", signatureLogoSrc, signatureAlt = "", copyright, children, style }: ShellFooterProps) {
  return (
    <Bar position="footer" style={style}>
      {children ?? <>
        <span className={["inline-flex items-center gap-1", META].join(" ")}>
          {signatureText}
          {signatureLogoSrc && <img src={signatureLogoSrc} alt={signatureAlt} className="h-[22px]" />}
        </span>
        <span className={META}>{copyright ?? `© ${new Date().getFullYear()} Agnikul Cosmos`}</span>
      </>}
    </Bar>
  );
}
