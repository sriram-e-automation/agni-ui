import React from "react";

/* ── Types (mirrored in FormSection.d.ts) ── */
export interface FormSectionProps {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  /** Equal grid tracks for the fields. minmax(0,1fr) prevents overflow. */
  cols?: 2 | 3;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * AgniUI · FormSection
 * Brand-rule section heading + a fixed-column field grid on the --field-* rhythm.
 * Pair with FormField children (`span` makes a field full-width).
 */
export function FormSection({ title, desc, cols, children, style = {} }: FormSectionProps) {
  return (
    <section style={{ display:"flex", flexDirection:"column", gap:"var(--space-3)", ...style }}>
      {(title || desc) && (
        <div style={{ display:"flex", flexDirection:"column", gap:2, borderLeft:"2px solid var(--border-brand)", paddingLeft:"var(--space-3)" }}>
          {title && <h3 style={{ margin:0, fontSize:"var(--text-md)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>{title}</h3>}
          {desc && <p style={{ margin:0, fontSize:"var(--text-xs)", color:"var(--text-tertiary)" }}>{desc}</p>}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols||2}, minmax(0, 1fr))`, gap:"var(--field-gap) var(--field-col-gap)" }} data-form-cols={cols||2}>
        {children}
      </div>
    </section>
  );
}
