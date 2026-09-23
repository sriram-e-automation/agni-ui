import React, { useState } from "react";
import { resolveDataState } from "../../utils/DataState.tsx";

/* ── Types (mirrored in DetailList.d.ts) ── */

export const CopyButton = React.forwardRef<HTMLButtonElement, any>(function CopyButton({ value, title = "Copy" }, ref) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    try { navigator.clipboard && navigator.clipboard.writeText(String(value)); } catch (err) {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button ref={ref as never} type="button" title={copied ? "Copied" : title} aria-label={copied ? "Copied" : title} onClick={copy}
      style={{ border:"none", background:"transparent", cursor:"pointer", padding:2, display:"inline-flex", color: copied ? "var(--status-success)" : "var(--text-tertiary)", fontSize:14, flexShrink:0 }}>
      <i aria-hidden="true" className={copied ? "ph-fill ph-check-circle" : "ph ph-copy"} />
      {/* Announce the result — the icon swap alone is silent. */}
      <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
    </button>
  );
});

export const KeyValueRow = React.forwardRef<HTMLDivElement, any>(function KeyValueRow({ icon, label, value, copyable, mono, onClick, span, layout = "stacked", last, style }, ref) {
  const val = onClick
    ? <button type="button" onClick={onClick} style={{ margin:0, padding:0, border:"none", background:"transparent", cursor:"pointer", textAlign:"left", fontSize:"var(--text-sm)", fontWeight:"var(--fw-medium)", color:"var(--text-brand)", fontFamily:"var(--font-sans)", flex:1, overflowWrap:"anywhere" , minWidth: 0}}>{value || "—"}</button>
    : <p style={{ margin:0, fontSize:"var(--text-sm)", fontWeight:"var(--fw-medium)", color:"var(--text-primary)", fontFamily: mono ? "var(--font-data)" : "var(--font-sans)", flex:1, overflowWrap:"anywhere" , minWidth: 0}}>{value || "—"}</p>;

  if (layout === "row") {
    return (
      <div style={{ display:"flex", alignItems:"baseline", gap:"var(--space-3)", padding:"var(--space-2) var(--space-3)", borderBottom: last ? "none" : "1px solid var(--border-subtle)", ...style }}>
        <p style={{ margin:0, width:"38%", flexShrink:0, fontSize:"var(--text-2xs)", color:"var(--text-tertiary)" }}>{label}</p>
        <div style={{ display:"flex", alignItems:"center", gap:"var(--space-1)", flex:1, minWidth:0 }}>{val}{copyable && value ? <CopyButton value={value} /> : null}</div>
      </div>
    );
  }
  return (
    <div ref={ref as never} style={{ gridColumn: span ? "1 / -1" : undefined, padding: layout === "bordered" ? "9px 12px" : 0, borderBottom: layout === "bordered" && !last ? "1px solid var(--border-subtle)" : undefined, ...style }}>
      <span style={{ display:"flex", alignItems:"center", gap:"var(--space-1)", margin:"0 0 3px", fontSize:"var(--text-2xs)", fontWeight:"var(--fw-semibold)", letterSpacing:"var(--tracking-wide)", textTransform:"uppercase", color:"var(--text-tertiary)" }}>
        {icon ? <i className={"ph " + icon} style={{ fontSize:14 }} /> : null}{label}
      </span>
      <div style={{ display:"flex", alignItems:"center", gap:"var(--space-1)", paddingLeft: icon ? 20 : 0 }}>{val}{copyable && value ? <CopyButton value={value} /> : null}</div>
    </div>
  );
});

function DetailListBody({ forwardedRef, items = [], layout = "bordered", minCol = 200, style }) {
  const rows = items.filter(Boolean);
  if (layout === "grid") {
    return (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(" + minCol + "px, 1fr))", gap:"var(--space-3) var(--space-5)", ...style }}>
        {rows.map((it, i) => <KeyValueRow key={it.label + i} {...it} layout="stacked" />)}
      </div>
    );
  }
  return (
    <div ref={forwardedRef as never} style={{ background:"var(--surface-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-md)", overflow:"hidden", ...style }}>
      {rows.map((it, i) => <KeyValueRow key={it.label + i} {...it} layout={layout} last={i === rows.length - 1} />)}
    </div>
  );
}

/* State contract — the same three props every data component takes. */
export const DetailList = React.forwardRef<HTMLElement, any>(function DetailList(props, ref) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.items && props.items.filter(Boolean).length), empty: props.empty,
    shape: "list", rows: props.loadingRows || 4,
    emptyIcon: "ph-list-dashes", emptyTitle: "No details recorded",
  });
  if (state !== false) return <div style={{ width: "100%", ...(props.style || {}) }}>{state}</div>;
  return <DetailListBody {...props} forwardedRef={ref} />;
});
