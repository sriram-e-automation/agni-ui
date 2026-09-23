import * as React from "react";
export interface OptionRowProps {
  /** Phosphor icon class for the leading tile. */
  icon?: string;
  /** Icon colour — defaults to brand. */
  iconTone?: string;
  title: React.ReactNode;
  desc?: React.ReactNode;
  /** Footer left — a quiet label ("Last updated on:"). */
  note?: React.ReactNode;
  /** Footer right — the value or action label. */
  value?: React.ReactNode;
  /** Phosphor icon before the value; also tints it as an action. */
  valueIcon?: string;
  /** Replaces the trailing caret (badge, switch, button). */
  trailing?: React.ReactNode;
  /** card = bordered tile (default) · row = flush list row with hover fill. */
  variant?: "card" | "row";
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: React.CSSProperties;
}
/**
 * Icon + title + description choice row, with an optional note/value footer.
 * One component for tracker cards, support options, settings choices and
 * launcher rows. Use ActionTile for a role-aware page launchpad, DropdownMenu
 * for a menu of actions.
 * @version 1.1.0
  * States: disabled · selected.
*/
export declare const OptionRow: React.ForwardRefExoticComponent<OptionRowProps & React.RefAttributes<HTMLDivElement>>;
