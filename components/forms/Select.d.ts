import * as React from "react";

export interface SelectOption { value: string; label: string; icon?: string; }
export interface SelectUser { id: string; name: string; team?: string; avatar?: string; color?: string; }

export interface SelectProps {
  /** string for single, string[] when `multiple`, user id(s) when `users`. */
  value?: string | string[] | null;
  onChange?: (value: any) => void;
  /** [{value,label,icon?}] or string[]. Omit when passing `users`. */
  options?: (SelectOption | string)[];
  /** People roster — renders the avatar/team picker. */
  users?: SelectUser[] | null;
  /** Multi-value: removable chips, or stacked avatars with `users`. */
  multiple?: boolean;
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
  /** multiple + users — cap the number of selections. */
  maxSelections?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Error state — red border + error focus ring, matching Input. */
  error?: boolean;
  style?: React.CSSProperties;
}

/**
 * AgniUI · Select
 * The single picker for every option list: plain dropdown, searchable,
 * creatable, multi-value, and people.
 *
 * Merged Aug 2026 — supersedes MultiSelect (`multiple`), SearchSelect
 * (`searchable`), CreatableSelect (`creatable`), UserSelect (`users`) and
 * MultiUserSelect (`users` + `multiple`). All five remain as internal
 * renderers and are no longer part of the documented API.
 * @version 1.0.0
  * States: error · empty · disabled.
*/
export declare function Select(props: SelectProps): JSX.Element;
