import * as React from "react";

export interface SelectOption { value: string; label: string; icon?: string; disabled?: boolean; }
export interface SelectUser { id: string; name: string; team?: string; avatar?: string; color?: string; }

interface SelectSharedProps {
  id?: string;
  /** Submitted with a native <form> through hidden inputs; the field name for form libraries. */
  name?: string;
  form?: string;
  required?: boolean;
  /** [{value,label,icon?,disabled?}] or string[]. Omit when passing `users`. */
  options?: (SelectOption | string)[];
  /** People roster — renders the avatar/team picker. */
  users?: SelectUser[] | null;
  /** Inline search box for long lists. */
  searchable?: boolean;
  /** Let the user add an option that doesn't exist. Implies `searchable`. */
  creatable?: boolean;
  /** creatable — called with the typed label; return the new value. */
  onCreate?: (label: string) => string | Promise<string> | void;
  /** creatable — verb in the create row. @default "Add" */
  createLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  /** No-results state — string or node. */
  empty?: React.ReactNode;
  /** Clear (×) affordance when a value is set. @default true */
  clearable?: boolean;
  /** Accessible name of the clear button. @default "Clear selection" */
  clearLabel?: string;
  /** multiple + users — cap the number of selections. */
  maxSelections?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Error state — red border + error focus ring + `aria-invalid`. */
  error?: boolean;
  autoFocus?: boolean;
  /** Controlled popup state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires when focus leaves the whole control (trigger + popup). */
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  style?: React.CSSProperties;
  className?: string;
}
export interface SingleSelectProps extends SelectSharedProps {
  multiple?: false;
  /** Controlled value. Omit (and use `defaultValue`) for an uncontrolled select. */
  value?: string | null;
  defaultValue?: string | null;
  /** `null` only when a clearable picker is cleared. */
  onChange?(value: string | null): void;
}
export interface MultipleSelectProps extends SelectSharedProps {
  /** Multi-value: removable chips, or stacked avatars with `users`. */
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}
export type SelectProps = SingleSelectProps | MultipleSelectProps;

/**
 * AgniUI · Select
 * The single picker for every option list: plain dropdown, searchable,
 * creatable, multi-value, and people.
 *
 * WAI-ARIA combobox + listbox — a value picker, so a listbox, not a menu.
 * The trigger is `role="combobox"` and holds focus (plain / multiple:
 * `aria-activedescendant` marks the highlighted option); searchable variants
 * move focus into a search box that drives the listbox the same way.
 *   closed  ↓ ↑ Enter Space open · Home/End open at the edges · typing opens
 *           (plain: typeahead · searchable: seeds the search) ·
 *           Backspace/Delete clear or drop the last chip
 *   open    ↓ ↑ Home End PageUp PageDown move · Enter selects · Escape closes ·
 *           Tab closes (single plain select keeps the highlight)
 * The ref is the focusable trigger (so RHF `<Controller>` can focus on error).
 * Inside a FormField it is labelled by the field label.
 *
 * Merged Aug 2026 — supersedes MultiSelect (`multiple`), SearchSelect
 * (`searchable`), CreatableSelect (`creatable`), UserSelect (`users`) and
 * MultiUserSelect (`users` + `multiple`). All five remain as internal
 * renderers and are no longer part of the documented API.
 * @version 1.1.0
  * States: error · empty · disabled.
*/
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLDivElement>>;
