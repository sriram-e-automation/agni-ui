import React, { useState, useRef, useEffect } from "react";
import { Bar } from "../layout/Bar.tsx";
import { Avatar } from "../core/Avatar.tsx";
import { AvatarStack } from "../core/AvatarStack.tsx";
import { NotificationsMenu, NotificationItem } from "./NotificationsMenu.tsx";
import { SettingsMenu } from "./SettingsMenu.tsx";

export interface ShellUser { name: string; role?: string; avatarSrc?: string | null; }
export interface ShellProfileItem { icon: string; label: string; danger?: boolean; onClick?: () => void; }
export interface ShellWallpaper { key: string; label: string; src?: string; color?: string; }
export interface ShellHeaderProps {
  /** Wordmark shown when the nav rail is open. */
  logoSrc?: string;
  /** Compact monogram shown when the rail is collapsed / on phones. */
  monogramSrc?: string;
  brandAlt?: string;
  /** Module identity block. */
  moduleName?: string;
  /** Phosphor icon class for the module tile. @default "ph-squares-four" */
  moduleIcon?: string;
  version?: string;
  /** Breadcrumb: workspace label › current page title. */
  workspaceLabel?: string;
  pageTitle?: string;
  /** Signed-in user (drives the avatar + profile menu identity). */
  user?: ShellUser;
  /** Rows of the profile dropdown after the identity block. */
  profileItems?: ShellProfileItem[];
  /** Names shown as an overlapping presence stack. */
  activeUsers?: string[];
  /** Notification feed — controlled; the header raises read/unread mutations. */
  notifications?: NotificationItem[];
  onNotificationsChange?: (items: NotificationItem[]) => void;
  /** SettingsMenu pass-through. Omit dark/onDarkChange etc. to hide the gear. */
  dark?: boolean; onDarkChange?: (v: boolean) => void;
  accent?: string | null; onAccentChange?: (v: string | null) => void;
  wallpaper?: string; onWallpaperChange?: (v: string) => void;
  wallpapers?: ShellWallpaper[];
  scale?: string; onScaleChange?: (v: string) => void;
  /** Rail geometry — the logo cell matches the nav rail width. */
  navOpen?: boolean;
  railW?: string;
  isPhone?: boolean;
  /** Phone hamburger callback. */
  onMenu?: () => void;
}

/* 36px round chrome button (bell / gear) with active ring + optional count badge. */
const ROUND =
  "relative size-[36px] rounded-full border inline-flex items-center justify-center " +
  "cursor-pointer text-[17px] shrink-0 transition-[background-color,border-color,color] duration-fast";
const ROUND_ON = "border-action-brand bg-surface-brand-soft text-fg-brand";
const ROUND_OFF = "border-line-default bg-surface-soft text-fg-secondary hover:border-line-brand";
const COUNT_BADGE =
  "absolute top-[-2px] right-[-2px] min-w-[16px] h-[16px] px-[3px] rounded-full " +
  "bg-status-error text-[#fff] text-2xs font-semibold font-data " +
  "inline-flex items-center justify-center border-2 border-surface-card";

function RoundBtn({ icon, activeIcon, on, count, title, onClick }) {
  return (
    <button type="button" onClick={onClick} onMouseDown={(e) => e.stopPropagation()} title={title}
      className={[ROUND, on ? ROUND_ON : ROUND_OFF].join(" ")}>
      <i className={"ph " + (on && activeIcon ? activeIcon : icon)} />
      {count > 0 && <span className={COUNT_BADGE}>{count > 9 ? "9+" : count}</span>}
    </button>
  );
}

const POPOVER =
  "absolute top-[calc(100%+8px)] right-0 z-dropdown w-[240px] p-2 bg-surface-card " +
  "border border-line-default rounded-lg shadow-e-xl";
const PROFILE_ROW =
  "flex items-center gap-2 w-full border-none bg-transparent p-2 rounded-md cursor-pointer " +
  "font-sans text-sm font-medium text-left transition-colors duration-fast";
const PROFILE_ROW_NORMAL = "text-fg-primary hover:bg-surface-soft";
const PROFILE_ROW_DANGER = "text-status-error hover:bg-status-error-soft";

function ProfileMenu({ user, items, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose && onClose(); };
    const k = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [onClose]);
  return (
    <div ref={ref} className={POPOVER} style={{ animation: "agni-shell-pop-in var(--dur-normal) var(--ease-standard)" }}>
      <div className="flex items-center gap-2 px-2 pt-1 pb-2">
        <Avatar name={user.name} src={user.avatarSrc} size="sm" online />
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap">{user.name}</div>
          {user.role && <div className="text-xs text-fg-tertiary">{user.role}</div>}
        </div>
      </div>
      <div className="h-px bg-line-subtle mx-2 mt-[2px] mb-1" />
      {items.map((it, i) => (
        <button key={i} type="button" onClick={() => { it.onClick && it.onClick(); onClose && onClose(); }}
          className={[PROFILE_ROW, it.danger ? PROFILE_ROW_DANGER : PROFILE_ROW_NORMAL].join(" ")}>
          <i className={["ph", it.icon, "text-[17px]", it.danger ? "text-status-error" : "text-fg-secondary"].join(" ")} />
          {it.label}
        </button>
      ))}
      <style>{`@keyframes agni-shell-pop-in { from { transform: translateY(-6px) scale(0.98); } to { transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
}

/**
 * AgniUI · ShellHeader
 * The canonical Desk-app top bar. Composes DS chrome end-to-end: rail-aligned
 * brand cell (wordmark ⇄ monogram), module tile + name + breadcrumb,
 * NotificationsMenu behind a badged bell, SettingsMenu behind the gear,
 * AvatarStack presence, and the user's profile dropdown. Purely
 * presentational — the host owns all state (theme, scale, notifications).
 *
 * Tailwind v4 (migrated Aug 2026, tranche 6b). The brand cell's width stays
 * inline: it mirrors the caller's rail width and animates with the collapse.
 * ProfileMenu's two mouse handlers are gone; the danger row hover moved to a
 * class pair that REPLACES the normal pair (one conflict group per row state).
 */
const SEP = "w-px h-[28px] bg-line-subtle shrink-0";
const MODULE_TILE = "size-[36px] shrink-0 rounded-md bg-action-brand text-[#fff] items-center justify-center text-[20px]";
const HAMBURGER =
  "size-[38px] rounded-md border border-line-default bg-surface-soft text-fg-secondary " +
  "inline-flex items-center justify-center cursor-pointer text-[20px] shrink-0";

export function ShellHeader({
  logoSrc, monogramSrc, brandAlt = "Logo",
  moduleName = "Module Name", moduleIcon = "ph-squares-four", version,
  workspaceLabel = "Workspace", pageTitle,
  user = { name: "User" }, profileItems = [],
  activeUsers = [],
  notifications, onNotificationsChange,
  dark, onDarkChange, accent, onAccentChange,
  wallpaper, onWallpaperChange, wallpapers, scale, onScaleChange,
  navOpen = true, railW = "var(--rail-drawer-w-md)", isPhone = false, onMenu,
}: ShellHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifItems = notifications || [];
  const unreadCount = notifItems.filter((n) => !n.read).length;
  const setNotif = (fn) => onNotificationsChange && onNotificationsChange(fn(notifItems));
  const hasNotifications = !!notifications;
  const hasSettings = !!onDarkChange || !!onAccentChange || !!onScaleChange;
  return (
    <Bar position="top" style={{ padding: 0, gap: 0 }}>
      <div className="flex items-center w-full h-full">
        {isPhone ? (
          <div className="flex items-center gap-2 px-3 shrink-0 h-full">
            <button type="button" onClick={onMenu} title="Menu" className={HAMBURGER}>
              <i className="ph ph-list" />
            </button>
            {monogramSrc && <img src={monogramSrc} alt={brandAlt} className="h-[26px]" />}
          </div>
        ) : (
          <div className="shrink-0 h-full flex items-center justify-center px-5 box-border border-r border-line-subtle transition-[width] duration-normal ease-standard"
            style={{ width: railW }}>
            {navOpen
              ? (logoSrc && <img src={logoSrc} alt={brandAlt} className="h-[28px] max-w-full block" />)
              : (monogramSrc && <img src={monogramSrc} alt={brandAlt} className="h-[28px]" />)}
          </div>
        )}
        <div className={["flex items-center flex-1 min-w-0", isPhone ? "gap-[8px] px-[10px]" : "gap-[12px] px-[20px]"].join(" ")}>
          <span className={[MODULE_TILE, isPhone ? "hidden" : "inline-flex"].join(" ")}>
            <i className={"ph-bold " + moduleIcon} />
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-md text-fg-primary">{moduleName}</span>
              {!isPhone && version && <span className="text-xs text-fg-tertiary font-data">{version}</span>}
            </div>
            {!isPhone && pageTitle && <div className="flex items-center gap-1 text-xs text-fg-tertiary mt-px">
              <span>{workspaceLabel}</span><i className="ph ph-caret-right text-2xs" />
              <span className="text-fg-secondary font-medium">{pageTitle}</span>
            </div>}
          </div>
        </div>
        <div className="flex items-center gap-2 pr-[var(--bar-pad-x)] shrink-0">
          {!isPhone && hasNotifications && (
            <div className="relative">
              <RoundBtn icon="ph-bell" on={notifOpen} count={unreadCount} title="Notifications" onClick={() => setNotifOpen(o => !o)} />
              {notifOpen && (
                <NotificationsMenu
                  items={notifItems}
                  onMarkRead={(id) => setNotif((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))}
                  onMarkUnread={(id) => setNotif((p) => p.map((n) => n.id === id ? { ...n, read: false } : n))}
                  onMarkAllRead={() => setNotif((p) => p.map((n) => ({ ...n, read: true })))}
                  onItemClick={(n) => { if (!n.read) setNotif((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x)); }}
                  onOpenSettings={hasSettings ? () => { setNotifOpen(false); setSettingsOpen(true); } : undefined}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>
          )}
          {hasSettings && (
            <div className="relative">
              <RoundBtn icon="ph-gear" activeIcon="ph-x" on={settingsOpen} count={0} title="Settings" onClick={() => setSettingsOpen(o => !o)} />
              {settingsOpen && (
                <SettingsMenu
                  dark={dark} onDarkChange={onDarkChange}
                  accent={accent} onAccentChange={onAccentChange}
                  wallpaper={wallpaper} onWallpaperChange={onWallpaperChange}
                  wallpapers={wallpapers}
                  scale={scale} onScaleChange={onScaleChange}
                  onClose={() => setSettingsOpen(false)}
                />
              )}
            </div>
          )}
          {!isPhone && activeUsers.length > 0 && <>
            <span className={SEP} />
            <div title={"Active now · " + activeUsers.join(", ")}>
              <AvatarStack names={activeUsers} max={4} size="md" />
            </div>
          </>}
          {!isPhone && <span className={SEP} />}
          <div className="relative">
            <button type="button" onClick={() => setProfileOpen(o => !o)} onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-2 pl-1 border-none bg-transparent cursor-pointer text-inherit font-sans">
              <Avatar name={user.name} src={user.avatarSrc} online />
              {!isPhone && <>
                <div className="leading-tight text-left">
                  <div className="text-sm font-semibold text-fg-primary">{user.name}</div>
                  {user.role && <div className="text-xs text-fg-tertiary">{user.role}</div>}
                </div>
                <i className={["ph", profileOpen ? "ph-caret-up" : "ph-caret-down", "text-fg-tertiary text-xs"].join(" ")} />
              </>}
            </button>
            {profileOpen && <ProfileMenu user={user} items={profileItems} onClose={() => setProfileOpen(false)} />}
          </div>
        </div>
      </div>
    </Bar>
  );
}
