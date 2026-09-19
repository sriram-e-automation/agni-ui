import * as React from "react";

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
/** Notification-bell popover: Unread/Read tabs + date-grouped list + footer actions.
 *  @version 1.0.0
  * States: loading.
*/
export declare function NotificationsMenu(props: NotificationsMenuProps): JSX.Element;
