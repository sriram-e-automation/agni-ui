import React, { useRef, useEffect, useState } from "react";
import { Tooltip } from "../feedback/Tooltip.tsx";

/* ── Types (mirrored in NotificationsMenu.d.ts) ── */
export interface NotificationItem {
  /** Stable identity for read/unread + click callbacks. */
  id: string;
  /** Phosphor icon class, e.g. "ph-seal-check". Defaults to "ph-bell". */
  icon?: string;
  /** Optional bold lead line above the message. */
  title?: string;
  message: string;
  /** Pre-formatted display time, e.g. "14:02". */
  time?: string;
  /** Group header the item is bucketed under, e.g. "Today" / "Yesterday" / "03 Jun 2026". */
  date?: string;
  read: boolean;
}

export interface NotificationsMenuProps {
  items?: NotificationItem[];
  /** Items still arriving — renders skeleton rows instead of the list. */
  loading?: boolean;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onMarkAllRead?: () => void;
  onItemClick?: (item: NotificationItem) => void;
  onOpenSettings?: () => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}
/** Notification-bell popover: Unread/Read tabs + date-grouped list + footer actions. */


/**
 * AgniUI · NotificationsMenu
 * Popover for the notification bell — tabbed (Unread / Read), grouped-by-date
 * list with per-item read/unread toggling + a footer for settings / bulk read.
 * Render inside a position:relative trigger wrapper; anchors top-right, same
 * pattern as SettingsMenu. Purely presentational — the host owns data +
 * persistence (mark-as-read calls, counts, polling).
 *
 * Tailwind v4 (migrated Aug 2026, tranche 6b). The two-line clamp on collapsed
 * messages stays inline (-webkit-box + line-clamp is a four-declaration set the
 * expand toggle switches at runtime), and the skeleton shimmer keeps its inline
 * gradient — now on var(--ease-standard), never a bare keyword the scanner
 * would compile as a utility.
 */
const MENU =
  "absolute top-[calc(100%+8px)] right-0 z-dropdown w-[380px] max-h-[520px] flex flex-col " +
  "bg-surface-card border border-line-default rounded-lg shadow-e-xl overflow-hidden";
const HEAD = "flex items-center justify-between px-4 py-3 border-b border-line-subtle shrink-0";
const CLOSE = "size-[28px] border-none bg-transparent rounded-full inline-flex items-center justify-center text-fg-tertiary cursor-pointer hover:text-fg-primary transition-colors duration-fast";
const TAB =
  /* border-0, NOT border-none — the same emit-order pair that killed the Tabs
     underline in tranche 3: border-none is emitted after border-b-2 and its
     border-style: none shorthand zeroes the drawn edge. */
  "flex-1 min-w-0 h-[32px] border-0 border-b-2 bg-transparent font-sans text-sm font-semibold " +
  "cursor-pointer transition-[color,border-color] duration-fast";
const TAB_ON = "border-b-action-brand text-fg-brand";
const TAB_OFF = "border-b-transparent text-fg-tertiary hover:text-fg-secondary";
const GROUP_HEAD = "px-4 pt-2 pb-1 text-2xs font-semibold tracking-wide uppercase text-fg-tertiary";
const ITEM = "flex gap-2 items-start px-4 py-2 transition-colors duration-fast";
const ITEM_UNREAD = "bg-surface-brand-soft";
const ITEM_READ = "bg-transparent";
const ITEM_ICON =
  "relative size-[36px] shrink-0 rounded-md bg-surface-soft border border-line-subtle " +
  "inline-flex items-center justify-center text-fg-brand text-[16px]";
const DOT = "absolute top-[-2px] right-[-2px] size-[9px] rounded-full bg-status-error border-2 border-surface-card";
const READ_MORE = "border-none bg-transparent p-0 mt-1 text-2xs font-semibold text-fg-brand cursor-pointer";
const TOGGLE_BTN =
  "size-[26px] shrink-0 border border-line-subtle rounded-sm bg-surface-card text-fg-tertiary " +
  "inline-flex items-center justify-center cursor-pointer hover:border-line-brand hover:text-fg-brand transition-[border-color,color] duration-fast";
const FOOT = "flex items-center justify-between px-4 py-2 border-t border-line-subtle shrink-0";
const FOOT_LINK = "inline-flex items-center gap-1 border-none bg-transparent text-fg-brand font-sans text-xs font-semibold cursor-pointer";
const MARK_ALL =
  "border border-line-default rounded-md bg-surface-card px-3 py-1 font-sans text-xs font-semibold " +
  "transition-colors duration-fast " +
  "enabled:text-fg-primary enabled:cursor-pointer enabled:hover:border-line-brand " +
  "disabled:text-fg-tertiary disabled:cursor-not-allowed disabled:opacity-60";
const SHIMMER = {
  background: "linear-gradient(90deg, var(--surface-sunken) 25%, var(--surface-soft) 50%, var(--surface-sunken) 75%)",
  backgroundSize: "200% 100%", animation: "agni-shimmer 1.4s var(--ease-standard) infinite",
};

export function NotificationsMenu({
  items = [],           // [{ id, icon, title?, message, time, date, read }]
  loading = false,
  onMarkRead,            // (id) => void
  onMarkUnread,          // (id) => void
  onMarkAllRead,         // () => void
  onItemClick,           // (item) => void
  onOpenSettings,        // () => void
  onClose,
  style = {},
}: NotificationsMenuProps) {
  const ref = useRef(null);
  const [tab, setTab] = useState("unread");
  const [expanded, setExpanded] = useState(() => new Set());

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose && onClose(); };
    const k = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [onClose]);

  const unread = items.filter((n) => !n.read);
  const read = items.filter((n) => n.read);
  const shown = tab === "unread" ? unread : read;

  const groups = [];
  shown.forEach((n) => {
    const key = n.date || "Earlier";
    let g = groups.find((g) => g.key === key);
    if (!g) { g = { key, items: [] }; groups.push(g); }
    g.items.push(n);
  });

  const toggleExpand = (id) => setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div ref={ref} className={MENU} style={{ animation: "agni-pop-in var(--dur-normal) var(--ease-standard)", ...style }}>
      {/* Header */}
      <div className={HEAD}>
        <span className="text-md font-semibold text-fg-primary">Notifications</span>
        <button type="button" onClick={onClose} className={CLOSE}><i className="ph ph-x text-[15px]" /></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-[2px] px-4 pt-2 shrink-0">
        {[["unread", "Unread", unread.length], ["read", "Read", read.length]].map(([key, label, count]) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={[TAB, tab === key ? TAB_ON : TAB_OFF].join(" ")}>
            {label} ({count})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto pt-1 pb-2">
        {loading ? (
          <div className="flex flex-col gap-1 px-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-2 items-center py-2">
                <span className="size-[36px] rounded-md shrink-0" style={SHIMMER} />
                <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
                  <span className="w-[70%] h-[10px] rounded-xs" style={SHIMMER} />
                  <span className="w-[40%] h-[9px] rounded-xs" style={SHIMMER} />
                </div>
              </div>
            ))}
            <style>{`@keyframes agni-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-1">
            <span className="size-[56px] rounded-full bg-surface-brand-soft text-fg-brand inline-flex items-center justify-center text-[26px]">
              <i className="ph ph-bell" />
            </span>
            <div className="text-sm font-semibold text-fg-primary">
              {tab === "unread" ? "You're all caught up" : "No notifications yet"}
            </div>
            <div className="text-xs text-fg-tertiary">
              {tab === "unread" ? "New updates will show up here." : "Read notifications appear here."}
            </div>
          </div>
        ) : groups.map((g) => (
          <div key={g.key}>
            <div className={GROUP_HEAD}>{g.key}</div>
            {g.items.map((n) => {
              const isExpanded = expanded.has(n.id);
              const long = (n.message || "").length > 110;
              return (
                <div key={n.id} onClick={() => onItemClick && onItemClick(n)}
                  className={[ITEM, n.read ? ITEM_READ : ITEM_UNREAD, onItemClick ? "cursor-pointer" : "cursor-default"].join(" ")}>
                  <span className={ITEM_ICON}>
                    <i className={"ph " + (n.icon || "ph-bell")} />
                    {!n.read && <span className={DOT} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {n.title && <div className="text-sm font-semibold text-fg-primary mb-[2px]">{n.title}</div>}
                        <div className="text-xs text-fg-secondary leading-normal"
                          style={isExpanded ? undefined : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {n.message}
                        </div>
                        {long && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleExpand(n.id); }} className={READ_MORE}>
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                      <span className="text-2xs text-fg-tertiary shrink-0 whitespace-nowrap">{n.time}</span>
                    </div>
                  </div>
                  <Tooltip label={n.read ? "Mark as unread" : "Mark as read"} side="left"><button type="button" aria-label={n.read ? "Mark as unread" : "Mark as read"}
                    onClick={(e) => { e.stopPropagation(); const fn = n.read ? onMarkUnread : onMarkRead; fn && fn(n.id); }}
                    className={TOGGLE_BTN}>
                    <i className={"ph " + (n.read ? "ph-envelope-open" : "ph-envelope-simple") + " text-[13px]"} />
                  </button></Tooltip>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={FOOT}>
        <button type="button" onClick={onOpenSettings} className={FOOT_LINK}>
          <i className="ph ph-gear text-[14px]" /> Settings
        </button>
        <button type="button" onClick={onMarkAllRead} disabled={unread.length === 0} className={MARK_ALL}>
          Mark all as read
        </button>
      </div>
      <style>{`@keyframes agni-pop-in { from { transform: translateY(-6px) scale(0.98); } to { transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
}
