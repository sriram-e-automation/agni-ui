import * as React from "react";
import { NotificationItem } from "./NotificationsMenu";
export interface ShellUser { name: string; role?: string; avatarSrc?: string | null; }
export interface ShellProfileItem { icon: string; label: string; danger?: boolean; onClick?: () => void; }
export interface ShellWallpaper { key: string; label: string; src?: string; color?: string; }
export interface ShellHeaderProps {
  /** Wordmark shown when the nav rail is open. */
  logoSrc?: string;
  /** Compact monogram shown when the rail is collapsed / on phones. */
  monogramSrc?: string;
  brandAlt?: string;
  moduleName?: string;
  /** Phosphor icon class for the module tile. @default "ph-squares-four" */
  moduleIcon?: string;
  version?: string;
  /** Breadcrumb: workspace label › current page title. */
  workspaceLabel?: string;
  pageTitle?: string;
  /** Signed-in user (avatar + profile menu identity). */
  user?: ShellUser;
  /** Rows of the profile dropdown after the identity block. */
  profileItems?: ShellProfileItem[];
  /** Names shown as an overlapping presence stack. */
  activeUsers?: string[];
  /** Notification feed — controlled; omit to hide the bell. */
  notifications?: NotificationItem[];
  onNotificationsChange?: (items: NotificationItem[]) => void;
  /** SettingsMenu pass-through — omit the callbacks to hide the gear. */
  dark?: boolean; onDarkChange?: (v: boolean) => void;
  accent?: string | null; onAccentChange?: (v: string | null) => void;
  wallpaper?: string; onWallpaperChange?: (v: string) => void;
  wallpapers?: ShellWallpaper[];
  scale?: string; onScaleChange?: (v: string) => void;
  /** Rail geometry — the brand cell matches the nav rail width. */
  navOpen?: boolean;
  railW?: string;
  isPhone?: boolean;
  /** Phone hamburger callback. */
  onMenu?: () => void;
}
/** Canonical Desk-app top bar: brand cell, module tile + breadcrumb, NotificationsMenu bell, SettingsMenu gear, AvatarStack presence, profile dropdown.
 *  @version 1.0.0
 */
export declare function ShellHeader(props: ShellHeaderProps): JSX.Element;
