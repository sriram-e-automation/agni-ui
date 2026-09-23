import React from "react";

export const ChartCard = React.forwardRef<HTMLDivElement, any>(function ChartCard({ title, subtitle, legend, actions, pad = "16px 18px 18px", children, style }, ref) {
  return (
    <div ref={ref as never} style={{ background:"var(--surface-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-lg)", padding:pad, display:"flex", flexDirection:"column", minWidth:0, ...style }}>
      {(title || subtitle || legend || actions) && (
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:"var(--space-2)", marginBottom:"var(--space-4)", flexWrap:"wrap" }}>
          <div>
            {title && <div style={{ fontSize:"var(--text-md)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>{title}</div>}
            {subtitle && <div style={{ fontSize:"var(--text-xs)", color:"var(--text-tertiary)", marginTop:2 }}>{subtitle}</div>}
          </div>
          {legend && (
            <div style={{ display:"flex", gap:"var(--space-3)", flexWrap:"wrap" }}>
              {legend.map(l => (
                <span key={l.label} style={{ display:"inline-flex", alignItems:"center", gap:"var(--space-1)", fontSize:"var(--text-xs)", color:"var(--text-secondary)" }}>
                  <span style={{ width:11, height:11, borderRadius:3, background:l.color }}></span>{l.label}
                </span>
              ))}
            </div>
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
});
