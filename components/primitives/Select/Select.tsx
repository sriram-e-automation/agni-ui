import React from "react";
import { SelectBasic } from "./SelectBasic.tsx";
import { MultiSelect } from "./MultiSelect.tsx";
import { SearchSelect } from "./SearchSelect.tsx";
import { CreatableSelect } from "./CreatableSelect.tsx";
import { UserSelect } from "./UserSelect.tsx";
import { MultiUserSelect } from "./MultiUserSelect.tsx";

/**
 * AgniUI · Select
 * One picker. Capability flags choose the treatment; the five former
 * components remain as internal renderers.
 *   users + multiple → people multi-select · users → people picker
 *   multiple → chip multi-select · creatable → add-inline · searchable → search box
 */
export function Select({ multiple = false, searchable = false, creatable = false, users = null, ...p }: any) {
  if (users) return multiple ? <MultiUserSelect users={users} {...p} /> : <UserSelect users={users} {...p} />;
  if (multiple) return <MultiSelect {...p} />;
  if (creatable) return <CreatableSelect {...p} />;
  if (searchable) return <SearchSelect {...p} />;
  return <SelectBasic {...p} />;
}
