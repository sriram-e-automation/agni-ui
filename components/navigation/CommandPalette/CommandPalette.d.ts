import * as React from "react";
export interface Command { id?: string; label: string; icon?: string; group?: string; hint?: string; onRun?: () => void; /** Renders muted; not selectable or runnable. */ disabled?: boolean; }
export interface CommandPaletteProps {
  open?: boolean;
  onClose?: () => void;
  commands?: Command[];
  placeholder?: string;
  /** Commands are still arriving async — shows a spinner row instead of the list. */
  loading?: boolean;
  /** Accessible name of the dialog. @default "Command palette" */
  label?: string;
  id?: string;
  /** Receives the query as the user types (e.g. to fetch remote commands). */
  onQueryChange?: (q: string) => void;
}
/** ⌘K command launcher overlay with keyboard nav.
 *  Modal dialog (focus trapped, returned to the opener on close) around a
 *  combobox + listbox: ↑ ↓ PageUp PageDown move · Enter runs · Escape closes.
 *  The ref is the dialog panel.
 *  @version 1.1.0
  * States: loading · open.
*/
export declare const CommandPalette: React.ForwardRefExoticComponent<CommandPaletteProps & React.RefAttributes<HTMLDivElement>>;
