import { resolveDataState } from "../feedback/DataState.tsx";
import React, { useState } from "react";

/* ── Types (mirrored in QuickStats.d.ts) ── */
export interface QuickStatItem {
  /** Filter key emitted on click; null = "all" card (clears the filter). */
  key: string | null;
  icon: string;
  label: string;
  value: string | number;
  /** Accent color — hex or token; defaults to brand. */
  accent?: string;
}
export interface QuickStatsProps {
  items: QuickStatItem[];
  /** Currently selected filter key (null = none). */
  value?: string | null;
  /** Called with the clicked key (or null to clear) and the clicked item. */
  onChange?: (key: string | null, item?: QuickStatItem | null) => void;
  /** Show each card's share of the key:null card's total as a % pill. */
  showShare?: boolean;
  style?: React.CSSProperties;
}

/**
 * AgniUI · QuickStats
 * Click-to-filter stat card strip above a records table. Promoted from the
 * admin-ops scaffold & work-orders kit. Cards with key:null act as "all".
 */
function QuickStatsBody({ items = [], value = null, onChange, showShare = false, style = {} }) {
  const [hov, setHov] = useState(null);
  const total = Number((items.find(s => s.key === null) || {}).value) || 0;
  return (
    <div style={{ display:"flex", gap:"var(--space-2)", flexWrap:"wrap", ...style }}>
      <style>{`@keyframes agni-stat-in { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
      {items.map((s, i) => {
        const accent = s.accent || "var(--text-brand)";
        const isSel = s.key !== null && value === s.key;
        const isHov = hov === i;
        const pct = showShare && s.key !== null && total > 0 ? Math.round((Number(s.value) / total) * 100) : null;
        const tint = (pct2) => `color-mix(in srgb, ${accent} ${pct2}%, transparent)`;
        return (
          <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            onClick={() => onChange && (s.key === null || isSel ? onChange(null, null) : onChange(s.key, s))}
            style={{ flex:"1 1 130px", minWidth:130, padding:"var(--space-2) var(--space-3)", background:isSel?tint(9):isHov?"var(--surface-soft)":"var(--surface-card)", border:"1.5px solid "+(isSel?accent:isHov?tint(44):"var(--border-subtle)"), borderRadius:"var(--radius-md)", cursor:"pointer", boxShadow:isSel?`0 0 0 3px ${tint(12)}`:isHov?"var(--shadow-sm)":"none", transition:"background var(--dur-fast), border-color var(--dur-fast), box-shadow var(--dur-fast)", userSelect:"none", animation:`agni-stat-in 180ms cubic-bezier(0,0,0,1) ${i*45}ms both` }}>
            <div style={{ display:"flex", alignItems:"center", gap:"var(--space-2)" }}>
              <span style={{ width:28, height:28, borderRadius:"var(--radius-sm)", flexShrink:0, background:isSel?accent:tint(11), color:isSel?"#fff":accent, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:15, transition:"all var(--dur-fast)" }}><i className={"ph "+s.icon} /></span>
              <div>
                <div style={{ fontSize:"var(--text-md)", fontWeight:"var(--fw-bold)", color:"var(--text-primary)", fontFamily:"var(--font-data)", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:"var(--text-xs)", color:isSel?accent:"var(--text-tertiary)", marginTop:1, fontWeight:isSel?"var(--fw-semibold)":400 }}>{s.label}</div>
              </div>
              {pct !== null && (
                <span title={pct+"% of "+total+" total"} style={{ marginLeft:"auto", flexShrink:0, minWidth:34, textAlign:"center", padding:"3px var(--space-1)", borderRadius:"var(--radius-full)", fontSize:"var(--text-2xs)", fontFamily:"var(--font-data)", fontWeight:"var(--fw-semibold)", color:isSel?"#fff":accent, background:isSel?accent:tint(11) }}>{pct}%</span>
              )}
              {isSel && <i className="ph-fill ph-check-circle" style={{ marginLeft: pct !== null ? 0 : "auto", color:accent, fontSize:16 }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* State contract — error → loading → empty → content (resolveDataState owns the
   precedence). The body mounts only with content, so hook order is stable. */
export function QuickStats(props) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    isEmpty: !(props.items && props.items.length), empty: props.empty,
    shape: "stat", rows: props.loadingRows || 4,
    emptyIcon: "ph-chart-bar", emptyTitle: "No stats yet",
  });
  if (state !== false) return <div style={{ width: "100%", ...(props.style || {}) }}>{state}</div>;
  return <QuickStatsBody {...props} />;
}
