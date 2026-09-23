/**
 * @internal Shared behaviour for the <Select> renderers — not part of the
 * documented API.
 *
 * Pattern choice (WAI-ARIA APG), by what the control does:
 *   • plain / multiple   → SELECT-ONLY COMBOBOX: focus stays on the trigger
 *                          (role="combobox"), the popup is a role="listbox", the
 *                          highlighted option is aria-activedescendant.
 *   • searchable / creatable / users → the same trigger, plus a search box in the
 *                          popup that takes focus and drives the listbox through
 *                          aria-activedescendant (a filtering listbox).
 * A listbox — not a menu — because the user is choosing a VALUE, not running a
 * command; DropdownMenu is the menu.
 *
 * Keyboard:
 *   closed  ↓ / ↑ / Enter / Space / Alt+↓ open · Home / End open at the edges ·
 *           typing opens (plain: jumps by label · searchable: seeds the search) ·
 *           Backspace / Delete clear (clearable) or drop the last chip (multiple)
 *   open    ↓ ↑ Home End PageUp PageDown move · Enter selects (Space too, when
 *           focus is on the trigger) · Escape closes · Tab closes (single: keeps
 *           the highlighted option, per APG)
 */
import React, { useEffect, useRef, useState } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import {
  scrollIntoViewIfNeeded, useControllableState, useListNavigation, useOutsideClick, useStableId,
} from "../../utils/interaction.tsx";

/** Props every Select renderer shares, on top of its value/onChange pair. */
export interface SelectCommonProps {
  id?: string;
  /** Submitted with a native <form> through hidden inputs; also the field name for form libraries. */
  name?: string;
  /** Associates the hidden inputs with a <form> elsewhere in the document. */
  form?: string;
  required?: boolean;
  disabled?: boolean;
  /** Error state — red border + error focus ring + `aria-invalid`. */
  error?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
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
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  style?: React.CSSProperties;
  className?: string;
}

export interface UseSelectCoreOptions<T> {
  props: SelectCommonProps;
  /** The options currently shown (after filtering). */
  items: T[];
  getLabel: (item: T) => string;
  isItemDisabled?: (item: T) => boolean;
  /** Index to highlight when opening — usually the selected option. */
  selectedIndex: number;
  /** Commit an option (click or Enter). The core closes the popup unless `multiple`. */
  onCommit: (item: T, index: number) => void;
  /** Keeps the popup open after a commit (multi-select). */
  multiple?: boolean;
  /** Popup has a search box that takes focus. */
  searchable?: boolean;
  /** Backspace / Delete on the closed trigger. */
  onClearKey?: () => void;
  /** Seed the search box when typing on a closed searchable trigger. */
  onSeedQuery?: (q: string) => void;
  /** Keys the renderer wants first — return true when consumed (e.g. creatable Enter). */
  onExtraKey?: (e: React.KeyboardEvent) => boolean;
}

export function useSelectCore<T>(o: UseSelectCoreOptions<T>) {
  const { props, items, getLabel, isItemDisabled, selectedIndex, onCommit, multiple = false, searchable = false } = o;
  const auto = useStableId(null, "agni-select");
  const f = useFieldControl(
    { id: props.id, error: props.error, disabled: props.disabled, required: props.required,
      "aria-describedby": props["aria-describedby"], "aria-invalid": props["aria-invalid"] },
    auto,
  );
  const listId = f.id + "-listbox";
  const optionId = (i: number) => `${f.id}-opt-${i}`;

  const [open, setOpenState] = useControllableState<boolean>({
    value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  /* A press on non-focusable popup chrome (padding, a notice) blurs with no
     relatedTarget; it must not read as "focus left the control". */
  const pressInside = useRef(false);
  const [openedBy, setOpenedBy] = useState<"first" | "last" | "selected" | "keep">("selected");

  const nav = useListNavigation({
    items, getLabel, isDisabled: isItemDisabled, typeahead: !searchable,
  });

  const setOpen = (next: boolean, how: "first" | "last" | "selected" | "keep" = "selected") => {
    if (next && f.disabled) return;
    if (next) setOpenedBy(how);
    setOpenState(next);
  };
  const close = (restoreFocus = true) => {
    setOpenState(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  /* Place the cursor when the popup opens. */
  useEffect(() => {
    if (!open) { nav.setActiveIndex(-1); return; }
    if (openedBy === "keep") { /* typeahead already placed the cursor */ }
    else if (openedBy === "first") nav.focusEdge("first");
    else if (openedBy === "last") nav.focusEdge("last");
    else if (selectedIndex >= 0) nav.setActiveIndex(selectedIndex);
    else nav.focusEdge("first");
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Keep the highlighted option in view. */
  useEffect(() => {
    if (open && nav.activeIndex >= 0) scrollIntoViewIfNeeded(document.getElementById(optionId(nav.activeIndex)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nav.activeIndex]);

  useOutsideClick([rootRef], () => setOpenState(false), open);

  const commitActive = () => {
    const i = nav.activeIndex;
    if (i < 0 || i >= items.length || nav.isDisabledAt(i)) return false;
    onCommit(items[i], i);
    if (!multiple) close(true);
    return true;
  };

  /* Keys shared by the trigger and the search box while open. */
  const onOpenKey = (e: React.KeyboardEvent, fromSearch: boolean): boolean => {
    if (o.onExtraKey?.(e)) return true;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); return true; }
    if (e.key === "Enter" || (!fromSearch && e.key === " ")) { e.preventDefault(); commitActive(); return true; }
    if (e.key === "ArrowUp" && e.altKey) { e.preventDefault(); if (!multiple) commitActive(); close(true); return true; }
    /* Tab: a trigger-focused popup closes (single keeps the highlight, per APG);
       a searchable popup lets Tab move between its own controls and closes when
       focus leaves the control — see onRootBlur. */
    if (e.key === "Tab") { if (!searchable) { if (!multiple) commitActive(); setOpenState(false); } return false; }
    return nav.onNavigate(e);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(e);
    if (e.defaultPrevented || f.disabled) return;
    if (open) { onOpenKey(e, false); return; }
    switch (e.key) {
      case "ArrowDown": case "Enter": case " ": e.preventDefault(); setOpen(true, "selected"); return;
      case "ArrowUp": e.preventDefault(); setOpen(true, "selected"); return;
      case "Home": e.preventDefault(); setOpen(true, "first"); return;
      case "End": e.preventDefault(); setOpen(true, "last"); return;
      case "Backspace": case "Delete": if (o.onClearKey) { e.preventDefault(); o.onClearKey(); } return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (searchable) { o.onSeedQuery?.(e.key); e.preventDefault(); setOpen(true, "first"); }
      else { setOpen(true, "keep"); if (!nav.onNavigate(e)) nav.setActiveIndex(Math.max(0, selectedIndex)); }
    }
  };

  /* Blur for the WHOLE control — moving between trigger, search and list is not a blur. */
  const onRootBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (rootRef.current && next && rootRef.current.contains(next)) return;
    if (!next && pressInside.current) return;
    if (open) setOpenState(false);
    /* Report the blur from the hidden form element: it carries the name and the
       current value, which is what React Hook Form re-reads on blur. */
    const hidden = triggerRef.current?.querySelector<HTMLElement>("[data-agni-value]");
    props.onBlur?.(hidden ? ({ ...e, type: "blur", target: hidden, currentTarget: hidden } as unknown as React.FocusEvent<HTMLDivElement>) : e);
  };
  const onRootFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const prev = e.relatedTarget as Node | null;
    if (rootRef.current && prev && rootRef.current.contains(prev)) return;
    props.onFocus?.(e);
  };

  useEffect(() => { if (props.autoFocus) triggerRef.current?.focus(); }, [props.autoFocus]);

  /* One stable callback per forwarded ref — a new callback every render would
     re-run React Hook Form's register() ref (and its DOM value read) each time. */
  const fwd = useRef<React.Ref<HTMLDivElement> | undefined>(undefined);
  const merged = React.useCallback((node: HTMLDivElement | null) => {
    triggerRef.current = node;
    const r = fwd.current;
    if (typeof r === "function") r(node); else if (r) (r as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, []);
  const stableRef = (r: React.Ref<HTMLDivElement>) => { fwd.current = r; return merged; };

  const activeId = open && nav.activeIndex >= 0 ? optionId(nav.activeIndex) : undefined;

  return {
    f, open, setOpen, close, nav, listId, optionId, activeId,
    rootRef, triggerRef, searchRef, listRef,
    getRootProps: () => ({
      ref: rootRef,
      onMouseDownCapture: () => { pressInside.current = true; requestAnimationFrame(() => { pressInside.current = false; }); },
      onBlur: onRootBlur,
      onFocus: onRootFocus,
    }),
    getTriggerProps: (ref?: React.Ref<HTMLDivElement>) => ({
      ref: ref ? stableRef(ref) : triggerRef,
      id: f.id,
      role: "combobox" as const,
      tabIndex: f.disabled ? -1 : 0,
      "aria-haspopup": "listbox" as const,
      "aria-expanded": open,
      "aria-controls": open ? listId : undefined,
      "aria-activedescendant": searchable ? undefined : activeId,
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"] ?? f.contextLabelId,
      "aria-describedby": f.describedBy,
      "aria-invalid": f.invalid || undefined,
      "aria-required": f.required || undefined,
      "aria-disabled": f.disabled || undefined,
      /* The shell draws the focus ring (focus-within); this suppresses the
         global :focus-visible halo on the inner trigger, as for Input. */
      "data-agni-input": "",
      onKeyDown: onTriggerKeyDown,
      onClick: () => { if (!f.disabled) setOpen(!open, "selected"); },
    }),
    getSearchProps: (label: string) => ({
      ref: searchRef,
      type: "text",
      role: "combobox" as const,
      "aria-label": label,
      "aria-expanded": true,
      "aria-controls": listId,
      "aria-autocomplete": "list" as const,
      "aria-activedescendant": activeId,
      autoComplete: "off",
      spellCheck: false,
      "data-agni-input": "",
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => { onOpenKey(e, true); },
    }),
    getListProps: () => ({
      ref: listRef,
      id: listId,
      role: "listbox" as const,
      tabIndex: -1,
      "aria-multiselectable": multiple || undefined,
      "aria-labelledby": props["aria-labelledby"] ?? f.contextLabelId ?? f.id,
    }),
    getOptionProps: (i: number, selected: boolean, disabled = false) => ({
      id: optionId(i),
      role: "option" as const,
      "aria-selected": selected,
      "aria-disabled": disabled || undefined,
      "data-agni-option": "",
      "data-active": nav.activeIndex === i ? "" : undefined,
      /* Keep focus where it is — the trigger or the search box owns it. */
      onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
      onMouseMove: () => { if (!disabled && nav.activeIndex !== i) nav.setActiveIndex(i); },
      onClick: () => {
        if (disabled) return;
        onCommit(items[i], i);
        if (!multiple) close(true);
      },
    }),
  };
}

/** Hidden inputs so the value submits with a native <form> (FormData). Render
 *  them INSIDE the trigger: React Hook Form's register() looks for an input
 *  within the element it is given and binds to it. */
export function HiddenValue({ name, form, value }: { name?: string; form?: string; value: string | string[] | null | undefined }) {
  if (!name) return null;
  /* Many values: one hidden <select multiple> — a native form submits every
     selected option, and form libraries read it back as an array. */
  if (Array.isArray(value)) {
    return (
      <select multiple hidden aria-hidden="true" tabIndex={-1} name={name} form={form} value={value} onChange={() => {}} data-agni-value="">
        {value.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }
  return <input type="hidden" name={name} form={form} value={value ?? ""} data-agni-value="" />;
}

/** Shell edge per state — persistent error edge, focus ring while open OR keyboard-focused. */
export function shellEdge(error: boolean, open: boolean) {
  return error
    ? (open ? "border-[var(--input-bdr-error)] ring-focus-error" : "border-[var(--input-bdr-error)] focus-within:ring-focus-error")
    : open ? "border-[var(--input-bdr-focus)] ring-focus"
    : "border-[var(--input-bdr)] focus-within:border-line-brand focus-within:ring-focus";
}

/** Class for the trigger element that sits inside the drawn shell. */
export const TRIGGER_INNER = "flex items-center gap-2 flex-1 min-w-0 h-full outline-none";

/** Small icon button inside a trigger (clear / remove chip) — mouse affordance; keyboard uses Backspace/Delete. */
export const ICON_BTN = "inline-flex items-center justify-center shrink-0 border-none bg-transparent p-0 cursor-pointer text-fg-tertiary";
