import React, { forwardRef } from "react";
import { useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in FormSection.d.ts) ── */
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

/**
 * AgniUI · FormSection
 * Brand-rule section heading + a fixed-column field grid on the --field-* rhythm.
 * Pair with FormField children (`span` makes a field full-width).
 * The <section> is a named region: labelled by its title, described by `desc`.
 */
export const FormSection = forwardRef<HTMLElement, FormSectionProps>(function FormSection(
  { title, desc, cols, headingLevel = 3, children, id, style = {}, ...rest },
  ref,
) {
  const base = useStableId(id, "agni-section");
  const titleId = base + "-title";
  const descId = base + "-desc";
  const H = `h${headingLevel}` as "h3";
  return (
    <section
      {...rest}
      ref={ref}
      id={id}
      aria-labelledby={rest["aria-labelledby"] ?? (title ? titleId : undefined)}
      aria-describedby={rest["aria-describedby"] ?? (desc ? descId : undefined)}
      style={{ display:"flex", flexDirection:"column", gap:"var(--space-3)", ...style }}>
      {(title || desc) && (
        <div style={{ display:"flex", flexDirection:"column", gap:2, borderLeft:"2px solid var(--border-brand)", paddingLeft:"var(--space-3)" }}>
          {title && <H id={titleId} style={{ margin:0, fontSize:"var(--text-md)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>{title}</H>}
          {desc && <p id={descId} style={{ margin:0, fontSize:"var(--text-xs)", color:"var(--text-tertiary)" }}>{desc}</p>}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols||2}, minmax(0, 1fr))`, gap:"var(--field-gap) var(--field-col-gap)" }} data-form-cols={cols||2}>
        {children}
      </div>
    </section>
  );
});
