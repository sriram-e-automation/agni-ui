import React, { forwardRef } from "react";
import { SelectBasic } from "./SelectBasic.tsx";
import { MultiSelect } from "./MultiSelect.tsx";
import { SearchSelect, type SelectOption } from "./SearchSelect.tsx";
import { CreatableSelect } from "./CreatableSelect.tsx";
import { UserSelect, type UserOption } from "./UserSelect.tsx";
import { MultiUserSelect } from "./MultiUserSelect.tsx";
import type { SelectCommonProps } from "./useSelect.tsx";

/* ── Types (mirrored in Select.d.ts) ── */
export type { SelectOption };
export type SelectUser = UserOption;

interface SelectSharedProps extends SelectCommonProps {
  /** [{value,label,icon?,disabled?}] or string[]. Omit when passing `users`. */
  options?: (SelectOption | string)[];
  searchPlaceholder?: string;
  /** No-results state — string or node. */
  empty?: React.ReactNode;
  /** Clear (×) affordance when a value is set. @default true */
  clearable?: boolean;
  clearLabel?: string;
  /** creatable — called with the typed label; return the new value. */
  onCreate?: (label: string) => string | Promise<string> | void;
  /** creatable — verb in the create row. @default "Add" */
  createLabel?: string;
  /** Inline search box for long lists. */
  searchable?: boolean;
  /** Let the user add an option that doesn't exist. Implies `searchable`. */
  creatable?: boolean;
  /** People roster — renders the avatar/team picker. */
  users?: SelectUser[] | null;
  /** multiple + users — cap the number of selections. */
  maxSelections?: number;
}
export interface SingleSelectProps extends SelectSharedProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  /** `null` only when a clearable picker is cleared. Method syntax on purpose:
   *  a handler typed `(value: string) => void` stays assignable. */
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
 * One picker. Capability flags choose the treatment; the five former
 * components remain as internal renderers.
 *   users + multiple → people multi-select · users → people picker
 *   multiple → chip multi-select · creatable → add-inline · searchable → search box
 *
 * Every treatment is a combobox + listbox (see useSelect.tsx for the keyboard
 * model), forwards its ref to the focusable trigger, submits through hidden
 * inputs when given a `name`, and runs controlled (`value`) or uncontrolled
 * (`defaultValue`).
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(props, ref) {
  const { multiple = false, searchable = false, creatable = false, users = null, ...p } = props as SelectSharedProps & { multiple?: boolean; value?: unknown; defaultValue?: unknown; onChange?: unknown };
  /* The public union guarantees value/onChange match `multiple`; each renderer
     is typed for its own shape, so the hand-off is deliberately untyped. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any: any = p;
  if (users) return multiple ? <MultiUserSelect ref={ref} users={users} {...any} /> : <UserSelect ref={ref} users={users} {...any} />;
  if (multiple) return <MultiSelect ref={ref} {...any} />;
  if (creatable) return <CreatableSelect ref={ref} {...any} />;
  if (searchable) return <SearchSelect ref={ref} {...any} />;
  return <SelectBasic ref={ref} {...any} />;
});
