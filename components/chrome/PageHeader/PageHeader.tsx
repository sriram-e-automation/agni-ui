import React from "react";
import { PageTitleBar } from "../PageTitleBar/PageTitleBar.tsx";
import { PageControls } from "../../data/PageControls/PageControls.tsx";
import { QuickStats } from "../../data/QuickStats/QuickStats.tsx";

/**
 * AgniUI · PageHeader
 * The whole top of a records page as one component: the PageTitleBar row and
 * the PageControls toolbar inside a single bordered card, with the optional
 * QuickStats strip beneath it and the sticky behaviour the Desk shell needs.
 *
 * It composes existing DS parts and adds only the chrome that used to be
 * hand-written at every call site — the card shell, the divider between the
 * two rows, the sticky wrapper, and the rule that when both rows are present
 * the TITLE BAR owns the view switcher so the toolbar never repeats it.
 *
 * `role` and `disabled` are hoisted: set once here and they reach both rows.
 * `loading` shimmers both rows together, so the header never half-resolves.
 *
 * Tailwind v4 — no class strings of its own beyond the wrappers.
 */
export const PageHeader = React.forwardRef<HTMLDivElement, any>(function PageHeader({
  titleBar, controls = null, stats = null,
  statsToggle, statsOpen, onStatsToggle, statsToggleLabel = "Quick stats",
  sticky = false, stickyTop = 0,
  bordered = true, background = "var(--surface-card)", blur = false,
  role = "", disabled = false, loading = false,
  gap = 8, style = {},
}, ref) {
  const tb = titleBar || {};
  const hasControls = controls !== null && controls !== false;
  const hasStats = stats !== null && stats !== false;

  /* The quick-stats toggle lives in the toolbar's leading slot. Controlled
     when `statsOpen` is passed, self-managing otherwise — the scaffold was
     carrying this state by hand on every page that had a stats strip. */
  const [openSelf, setOpenSelf] = React.useState(true);
  const controlled = statsOpen !== undefined;
  const open = controlled ? !!statsOpen : openSelf;
  const showToggle = (statsToggle ?? hasStats) && hasControls;
  const toggle = () => {
    if (!controlled) setOpenSelf(v => !v);
    if (onStatsToggle) onStatsToggle(!open);
  };

  /* One switcher per page. When a toolbar is present the title bar keeps the
     view modes and the toolbar's copy is dropped, whatever the caller passed. */
  const ctrl = hasControls ? { ...controls } : null;
  if (ctrl && tb.viewModes && tb.viewModes.length) {
    delete ctrl.viewModes; delete ctrl.viewMode; delete ctrl.onViewModeChange;
  }
  if (ctrl && showToggle) {
    ctrl.leading = (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" onClick={toggle} disabled={disabled}
          aria-expanded={open}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid var(--border-default)", background: open ? "var(--surface-sunken)" : "transparent",
            padding: "7px 12px", borderRadius: "var(--radius-md)", cursor: disabled ? "default" : "pointer",
            font: "var(--fw-medium) var(--text-xs)/1 var(--font-sans)", color: "var(--text-secondary)",
            opacity: disabled ? 0.55 : 1, whiteSpace: "nowrap",
          }}>
          {statsToggleLabel}
          <i className={open ? "ph ph-caret-up" : "ph ph-caret-down"} style={{ fontSize: "var(--text-xs)" }} />
        </button>
        {controls.leading}
      </div>
    );
  }

  const card = (
    <div style={{
      background, borderRadius: "var(--radius-lg)",
      border: bordered ? "1px solid var(--border-subtle)" : "none",
      backdropFilter: blur ? "blur(14px)" : undefined,
      WebkitBackdropFilter: blur ? "blur(14px)" : undefined,
      overflow: "hidden",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: hasControls ? "1px solid var(--border-subtle)" : "none" }}>
        <PageTitleBar {...tb} role={tb.role ?? role} disabled={disabled || tb.disabled} loading={loading || tb.loading} />
      </div>
      {hasControls && (
        <div style={{ padding: "10px 16px" }}>
          <PageControls {...ctrl} role={ctrl.role ?? role} disabled={disabled || ctrl.disabled} loading={loading || ctrl.loading} />
        </div>
      )}
    </div>
  );

  const body = (
    <div style={{ display: "flex", flexDirection: "column", gap, ...(sticky ? {} : style) }}>
      {card}
      {hasStats && open && <QuickStats {...stats} loading={loading || stats.loading} />}
    </div>
  );

  if (!sticky) return body;
  return (
    <div ref={ref as never} style={{ position: "sticky", top: stickyTop, zIndex: "var(--z-sticky)", flexShrink: 0, ...style }}>
      {body}
    </div>
  );
});
