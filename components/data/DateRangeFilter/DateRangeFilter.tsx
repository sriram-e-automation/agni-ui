import React, { useState, useEffect, useRef } from "react";
import { Button } from "../core/Button.tsx";
import { IconButton } from "../core/IconButton.tsx";
import { DatePicker } from "../forms/DatePicker.tsx";

/* ── Types (mirrored in DateRangeFilter.d.ts) ── */
export interface DateRange {
  start: Date; end: Date; label: string;
  gran?: "week" | "month" | "quarter" | "year" | null;
  gOffset?: number | null;
}
export interface DateRangeFilterProps {
  value?: DateRange | null;
  onChange?: (value: DateRange | null) => void;
  /** Center the panel as a scrimmed dialog (phone layouts). */
  isPhone?: boolean;
}

/**
 * AgniUI · DateRangeFilter
 * Toolbar date filter: compact 1-control trigger (icon idle → joined
 * calendar-check + × when active) opening a fixed-position panel with
 * Week/Month/Quarter/Year granularity tabs, a ← period → navigator, and a
 * custom From→To override. Promoted from the admin-ops scaffold.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7e). The panel's position stays
 * inline — computed from getBoundingClientRect() on open/resize/scroll, the
 * same runtime-value pattern as its sibling FilterPanel.
 */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (d) => d ? `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "—";
const startOfWeek = (d) => { const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; };
const addDays = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const GRANS = ["week","month","quarter","year"];

export function computePeriod(gran, offset, now) {
  const y=now.getFullYear(), m=now.getMonth(), q=Math.floor(m/3), sow=startOfWeek(now);
  if (gran==="week") {
    const s=addDays(sow,offset*7), e=addDays(s,6);
    let lbl;
    if (s.getMonth()===e.getMonth()) lbl=`${s.getDate()}–${e.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`;
    else if (s.getFullYear()===e.getFullYear()) lbl=`${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
    else lbl=`${s.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
    return {start:s, end:e, lbl};
  }
  if (gran==="month") {
    const d=new Date(y,m+offset,1);
    return {start:d, end:new Date(d.getFullYear(),d.getMonth()+1,0), lbl:`${MONTHS[d.getMonth()]} ${d.getFullYear()}`};
  }
  if (gran==="quarter") {
    const totalQ=q+offset, qYear=y+Math.floor(totalQ/4), qNum=((totalQ%4)+4)%4;
    return {start:new Date(qYear,qNum*3,1), end:new Date(qYear,qNum*3+3,0), lbl:`Q${qNum+1} ${qYear}`};
  }
  const yr=y+offset;
  return {start:new Date(yr,0,1), end:new Date(yr,11,31), lbl:`${yr}`};
}

const TRIGGER_ACTIVE_SHELL = "inline-flex items-center h-control border border-line-brand rounded-md overflow-hidden";
const TRIGGER_ACTIVE_BTN = "h-control w-[var(--density-control-h)] inline-flex items-center justify-center text-[18px] cursor-pointer text-fg-brand border-none transition-colors duration-fast";
const TRIGGER_ACTIVE_OPEN = "bg-[var(--agni-green-100)]";
const TRIGGER_ACTIVE_SHUT = "bg-surface-brand-soft";
const CLEAR_BTN = "w-[26px] h-control border-none bg-surface-brand-soft text-fg-brand inline-flex items-center justify-center text-[12px] cursor-pointer";
const TRIGGER_IDLE =
  "h-control w-[var(--density-control-h)] shrink-0 inline-flex items-center justify-center text-[18px] rounded-md cursor-pointer border " +
  "transition-[background-color,border-color,color] duration-fast";
const TRIGGER_IDLE_OPEN = "border-line-brand bg-surface-soft text-fg-brand";
const TRIGGER_IDLE_SHUT = "border-line-default bg-surface-card text-fg-secondary";
const PANEL = "fixed z-overlay overflow-y-auto bg-surface-card border border-line-default rounded-lg shadow-e-lg font-sans";
const PANEL_HEAD = "sticky top-0 flex items-center justify-between px-3 py-3 border-b border-line-subtle bg-surface-card";
const SECTION_LABEL = "text-2xs font-semibold tracking-wide uppercase text-fg-tertiary mb-2";
const GRAN_BTN = "flex-1 min-w-0 py-1 rounded-md border text-sm transition-all duration-fast";
const GRAN_ON = "border-action-brand bg-action-brand text-[#fff] font-semibold";
const GRAN_OFF = "border-line-subtle bg-transparent text-fg-secondary font-medium";
const NAV_BTN = "size-[30px] shrink-0 inline-flex items-center justify-center border border-line-subtle rounded-md bg-surface-card text-fg-secondary cursor-pointer text-[14px]";
const PANEL_FOOT = "sticky bottom-0 flex items-center justify-between gap-2 px-3 py-3 border-t border-line-subtle bg-surface-card";
const CLEAR_LINK = "border-none bg-transparent text-fg-tertiary font-sans text-sm font-medium cursor-pointer py-1 px-[2px]";

export function DateRangeFilter({ value, onChange, isPhone }: DateRangeFilterProps) {
  const [open,    setOpen]    = useState(false);
  const [rect,    setRect]    = useState(null);
  const [gran,    setGran]    = useState("month");
  const [gOffset, setGOffset] = useState(0);
  const [dStart,  setDStart]  = useState(null);
  const [dEnd,    setDEnd]    = useState(null);
  const [custom,  setCustom]  = useState(false);
  const wrapRef  = useRef(null);
  const panelRef = useRef(null);
  const now = new Date();

  const reposition = () => { if(wrapRef.current) setRect(wrapRef.current.getBoundingClientRect()); };

  useEffect(() => {
    if (!open) return;
    const g  = value&&value.gran    ? value.gran    : "month";
    const go = value&&value.gOffset!=null ? value.gOffset : 0;
    setGran(g); setGOffset(go); setCustom(false);
    if (value) { setDStart(value.start); setDEnd(value.end); }
    else { const p=computePeriod(g,go,now); setDStart(p.start); setDEnd(p.end); }
    reposition();
    const onDoc=(e)=>{ if(panelRef.current&&!panelRef.current.contains(e.target)&&wrapRef.current&&!wrapRef.current.contains(e.target)) setOpen(false); };
    const onWin=()=>reposition();
    document.addEventListener("mousedown",onDoc); window.addEventListener("resize",onWin); window.addEventListener("scroll",onWin,true);
    return ()=>{ document.removeEventListener("mousedown",onDoc); window.removeEventListener("resize",onWin); window.removeEventListener("scroll",onWin,true); };
  }, [open]); // eslint-disable-line

  const selectGran = (g) => { setGran(g); setGOffset(0); setCustom(false); const p=computePeriod(g,0,now); setDStart(p.start); setDEnd(p.end); };
  const navigate   = (d) => { const o=gOffset+d; setGOffset(o); setCustom(false); const p=computePeriod(gran,o,now); setDStart(p.start); setDEnd(p.end); };
  const onManual   = (which,d) => { setCustom(true); which==="start"?setDStart(d):setDEnd(d); };

  const invalid   = dStart&&dEnd&&dStart>dEnd;
  const curPeriod = computePeriod(gran, gOffset, now);

  const apply = () => {
    if (dStart&&dEnd&&!invalid) {
      const lbl = custom ? `${fmt(dStart)} – ${fmt(dEnd)}` : curPeriod.lbl;
      onChange && onChange({start:dStart, end:dEnd, label:lbl, gran:custom?null:gran, gOffset:custom?null:gOffset});
      setOpen(false);
    }
  };
  const clear = () => { onChange && onChange(null); setOpen(false); };

  const active  = !!value;
  const PANEL_W = 360;
  const panelPos = isPhone
    ? { left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(92vw,380px)" }
    : rect
      ? { top:rect.bottom+6, left:Math.max(8,Math.min(rect.right-PANEL_W, window.innerWidth-PANEL_W-8)), width:PANEL_W, maxHeight:Math.max(240,window.innerHeight-rect.bottom-14) }
      : { display:"none" };

  return (
    <>
      <div ref={wrapRef} className="inline-flex shrink-0">
        {active ? (
          <div className={TRIGGER_ACTIVE_SHELL}>
            <button type="button" title="Date range" onClick={() => setOpen(o=>!o)}
              className={[TRIGGER_ACTIVE_BTN, open ? TRIGGER_ACTIVE_OPEN : TRIGGER_ACTIVE_SHUT].join(" ")}>
              <i className="ph-fill ph-calendar-check" />
            </button>
            <span className="w-px h-[20px] bg-line-brand shrink-0" />
            <button type="button" title="Clear selected range" onClick={() => clear()} className={CLEAR_BTN}>
              <i className="ph ph-x" />
            </button>
          </div>
        ) : (
          <button type="button" title="Date range" onClick={() => setOpen(o=>!o)}
            className={[TRIGGER_IDLE, open ? TRIGGER_IDLE_OPEN : TRIGGER_IDLE_SHUT].join(" ")}>
            <i className="ph ph-calendar-blank" />
          </button>
        )}
      </div>

      {open && (
        <>
          {isPhone && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-[var(--scrim)] z-overlay" />}
          <div ref={panelRef} className={PANEL} style={panelPos}>
            <div className={PANEL_HEAD}>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-fg-primary">
                <i className="ph ph-calendar-blank text-[15px] text-fg-brand" /> Date range
              </span>
              <IconButton icon={<i className="ph ph-x" />} variant="ghost" size="sm" onClick={() => setOpen(false)} title="Close" />
            </div>
            <div className="p-3">
              <div className={SECTION_LABEL}>Period</div>
              <div className="flex gap-1 mb-3">
                {GRANS.map(g => { const on=gran===g&&!custom; return (
                  <button key={g} type="button" onClick={() => selectGran(g)} className={[GRAN_BTN, on ? GRAN_ON : GRAN_OFF].join(" ")}>
                    {g.charAt(0).toUpperCase()+g.slice(1)}
                  </button>
                ); })}
              </div>
              <div className="flex items-center gap-2 py-2 border-t border-b border-line-subtle mb-3">
                <button type="button" onClick={() => navigate(-1)} className={NAV_BTN}><i className="ph ph-caret-left" /></button>
                <div className={["flex-1 min-w-0 text-center transition-opacity duration-fast", custom ? "opacity-[0.38]" : "opacity-100"].join(" ")}>
                  <div className="text-md font-semibold text-fg-primary leading-[1.2]">{curPeriod.lbl}</div>
                  <div className="text-xs text-fg-tertiary mt-[3px]">{fmt(curPeriod.start)} – {fmt(curPeriod.end)}</div>
                </div>
                <button type="button" onClick={() => navigate(+1)} className={NAV_BTN}><i className="ph ph-caret-right" /></button>
              </div>
              <div>
                <div className={SECTION_LABEL}>Custom range</div>
                <div className="flex items-end gap-2">
                  <label className="flex-1 min-w-0">
                    <span className="block text-xs text-fg-tertiary mb-1">From</span>
                    <DatePicker value={dStart} max={dEnd||undefined} onChange={(d) => onManual("start",d)} size="sm" />
                  </label>
                  <i className="ph ph-arrow-right text-[13px] text-fg-tertiary shrink-0 mb-2" />
                  <label className="flex-1 min-w-0">
                    <span className="block text-xs text-fg-tertiary mb-1">To</span>
                    <DatePicker value={dEnd} min={dStart||undefined} onChange={(d) => onManual("end",d)} size="sm" />
                  </label>
                </div>
                {custom && !invalid && <div className="mt-1 text-xs text-fg-brand inline-flex items-center gap-1"><i className="ph ph-pencil-simple text-[11px]" /> Custom range</div>}
                {invalid && <div className="mt-1 text-xs text-status-error">End date must be on or after start date.</div>}
              </div>
            </div>
            <div className={PANEL_FOOT}>
              <button type="button" onClick={clear} className={CLEAR_LINK}>Clear</button>
              <div className="flex gap-2">
                <Button category="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button category="primary"   size="sm" disabled={!dStart||!dEnd||!!invalid} onClick={apply}>Apply</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* Attached as a static — same pattern as Tag.toneFor / StageList — so callers
   (specimen cards, consuming pages precomputing a default range) can reach it
   as DateRangeFilter.computePeriod without a second, lowercase named export
   that the bundle namespace never exposes (only capitalised exports land on
   window.<Namespace>). */
DateRangeFilter.computePeriod = computePeriod;
