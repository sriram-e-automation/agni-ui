import * as React from "react";
export interface Command { id?: string; label: string; icon?: string; group?: string; hint?: string; onRun?: () => void; /** Renders muted; not selectable or runnable. */ disabled?: boolean; }
export interface CommandPaletteProps {
  open?: boolean;
  onClose?: () => void;
  commands?: Command[];
  placeholder?: string;
  /** Commands are still arriving async — shows a spinner row instead of the list. */
  loading?: boolean;
}
/** ⌘K command launcher overlay with keyboard nav.
 *  @version 1.0.0
  * States: loading · open.
*/
export declare function CommandPalette(props: CommandPaletteProps): JSX.Element;
