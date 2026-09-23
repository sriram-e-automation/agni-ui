import * as React from "react";

/**
 * AgniUI · interaction utilities
 * The shared plumbing every interactive component uses for ids, refs, event
 * composition, controlled/uncontrolled state, dismissal, focus and keyboard
 * navigation — so a keyboard user gets the same behaviour from every menu,
 * listbox, tab strip and dialog, and no component re-implements the rules.
 */

/* ── Refs ──────────────────────────────────────────────────────────────────── */

export type PossibleRef<T> = React.Ref<T> | undefined | null;

/** Assign `value` to a callback ref or a ref object. */
export function setRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref && typeof ref === "object") (ref as React.MutableRefObject<T | null>).current = value;
}

/** One callback ref that feeds several refs — the forwarded ref and a local one. */
export function mergeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => { for (const r of refs) setRef(r, node); };
}

/** `mergeRefs`, memoised on the refs so React doesn't detach/reattach every render. */
export function useMergedRef<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(mergeRefs(...refs), refs);
}

/* ── Events ────────────────────────────────────────────────────────────────── */

/**
 * Compose a consumer handler with the component's own. The consumer runs first;
 * calling `e.preventDefault()` in it skips the internal behaviour — the one
 * standard way to opt out of, say, a menu closing on select.
 */
export function composeHandlers<E extends { defaultPrevented: boolean }>(
  external?: ((e: E) => void) | null,
  internal?: ((e: E) => void) | null,
): (e: E) => void {
  return (e: E) => {
    external?.(e);
    if (!e.defaultPrevented) internal?.(e);
  };
}

/* ── Ids ───────────────────────────────────────────────────────────────────── */

/**
 * A stable, SSR-safe unique id. A caller-supplied `id` always wins, so labels,
 * `aria-describedby` and tests can target a known value.
 */
export function useStableId(idProp?: string | null, prefix = "agni"): string {
  const auto = React.useId().replace(/:/g, "");
  return idProp || `${prefix}-${auto}`;
}

/* ── State ─────────────────────────────────────────────────────────────────── */

export interface ControllableStateOptions<T, A extends unknown[]> {
  /** Controlled value. `undefined` means uncontrolled. */
  value?: T;
  /** Initial value when uncontrolled. */
  defaultValue: T;
  /** Called with the next value (and any extra args) on every change. */
  onChange?: ((value: T, ...args: A) => void) | null;
}

/**
 * Controlled when `value` is defined, uncontrolled otherwise — the same rule as a
 * native input. Uncontrolled mode is what lets a component be spread with React
 * Hook Form's `register()`, which never passes a value.
 */
export function useControllableState<T, A extends unknown[] = []>(
  { value, defaultValue, onChange }: ControllableStateOptions<T, A>,
): [T, (next: T, ...args: A) => void, boolean] {
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState<T>(defaultValue);
  const current = controlled ? (value as T) : inner;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const set = React.useCallback((next: T, ...args: A) => {
    if (!controlled) setInner(next);
    onChangeRef.current?.(next, ...args);
  }, [controlled]);
  return [current, set, controlled];
}

/* ── Dismissal ─────────────────────────────────────────────────────────────── */

/** Call `handler` on a pointer-down outside every element in `refs`. */
export function useOutsideClick(
  refs: React.RefObject<HTMLElement | null>[],
  handler: (e: MouseEvent | TouchEvent) => void,
  enabled = true,
): void {
  const h = React.useRef(handler);
  h.current = handler;
  React.useEffect(() => {
    if (!enabled) return;
    const listener = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null;
      if (refs.some((r) => r.current && t && r.current.contains(t))) return;
      h.current(e);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

/* ── Focus ─────────────────────────────────────────────────────────────────── */

const FOCUSABLE = [
  "a[href]", "area[href]", "button:not([disabled])", "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])", "textarea:not([disabled])", "iframe", "audio[controls]", "video[controls]",
  "[contenteditable]:not([contenteditable=false])", "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Tabbable descendants of `root`, in DOM order, skipping hidden ones. */
export function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
      && (el.offsetParent !== null || el === document.activeElement));
}

export interface FocusTrapOptions {
  /** Element to focus on open. Defaults to the first tabbable, else the container. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** Return focus to the element that had it before opening. @default true */
  restoreFocus?: boolean;
  /** Re-arm when this changes — for a dialog that swaps its root element
   *  (e.g. a loading shell replaced by the loaded dialog). */
  rearmKey?: unknown;
}

/* Open traps, innermost last. Only the top one handles Tab, so a confirm dialog
   opened over a record dialog keeps focus without the outer trap fighting it. */
const trapStack: HTMLElement[] = [];

/**
 * Keep Tab / Shift+Tab inside `ref` while `active`, move focus in on open, and
 * give it back to the opener on close — the modal-dialog focus contract.
 * Nested traps stack: only the innermost open one is active.
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  { initialFocus, restoreFocus = true, rearmKey }: FocusTrapOptions = {},
): void {
  React.useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const opener = document.activeElement as HTMLElement | null;
    const target = initialFocus?.current || getFocusable(root)[0] || root;
    if (target === root && !root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
    /* Defer one frame: the dialog may still be mounting its content. */
    const raf = requestAnimationFrame(() => { if (!root.contains(document.activeElement)) target.focus({ preventScroll: true }); });
    trapStack.push(root);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      /* Innermost wins: a trap that contains another open trap stands down.
         (Effects mount child-first, so push order alone can't decide nesting.) */
      const leaves = trapStack.filter((r) => !trapStack.some((o) => o !== r && r.contains(o)));
      if (leaves[leaves.length - 1] !== root) return;
      const items = getFocusable(root);
      if (!items.length) { e.preventDefault(); root.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey && (cur === first || !root.contains(cur))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (cur === last || !root.contains(cur))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      const at = trapStack.lastIndexOf(root);
      if (at >= 0) trapStack.splice(at, 1);
      /* Only take focus back if it is still ours to give: inside the closing
         dialog, or dropped to <body> because the dialog unmounted. A click that
         closed a popover by focusing another field keeps that field focused. */
      const now = document.activeElement;
      const ours = !now || now === document.body || root.contains(now);
      if (restoreFocus && ours && opener && typeof opener.focus === "function" && document.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, rearmKey]);
}

/** Lock page scroll while an overlay is open; nested locks restore in order. */
export function useScrollLock(active: boolean): void {
  React.useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}

/* ── Keyboard navigation ───────────────────────────────────────────────────── */

export type Orientation = "vertical" | "horizontal" | "both";

export interface NavigateOptions {
  /** Number of items. */
  count: number;
  /** Currently active index, or -1 for none. */
  current: number;
  orientation?: Orientation;
  /** Wrap from last to first and back. @default true */
  loop?: boolean;
  /** Items the cursor must skip over. */
  isDisabled?: (index: number) => boolean;
  /** Right-to-left layouts swap ArrowLeft / ArrowRight. */
  dir?: "ltr" | "rtl";
}

/** Step from `from` by `delta`, skipping disabled items. Returns -1 when nothing is enabled. */
function step(from: number, delta: 1 | -1, { count, loop = true, isDisabled }: NavigateOptions): number {
  if (!count) return -1;
  let i = from;
  for (let n = 0; n < count; n++) {
    i += delta;
    if (i < 0) { if (!loop) return from; i = count - 1; }
    if (i >= count) { if (!loop) return from; i = 0; }
    if (!isDisabled?.(i)) return i;
  }
  return -1;
}

/** First enabled index at or after `from` (or at or before, for delta -1). */
export function firstEnabled(from: number, delta: 1 | -1, opts: NavigateOptions): number {
  if (from >= 0 && from < opts.count && !opts.isDisabled?.(from)) return from;
  return step(from, delta, { ...opts, loop: false });
}

/**
 * Map a key press to the next active index for a 1-D collection (listbox, menu,
 * tab list, radio group, toolbar). Returns `null` if the key isn't a navigation
 * key for this orientation, so the caller can let it through.
 */
export function getNavigationIndex(key: string, opts: NavigateOptions): number | null {
  const { orientation = "vertical", count, current, dir = "ltr" } = opts;
  const next = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const prev = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const vert = orientation !== "horizontal";
  const horiz = orientation !== "vertical";
  if ((vert && key === "ArrowDown") || (horiz && key === next)) {
    return current < 0 ? firstEnabled(0, 1, opts) : step(current, 1, opts);
  }
  if ((vert && key === "ArrowUp") || (horiz && key === prev)) {
    return current < 0 ? firstEnabled(count - 1, -1, opts) : step(current, -1, opts);
  }
  if (key === "Home") return firstEnabled(0, 1, opts);
  if (key === "End") return firstEnabled(count - 1, -1, opts);
  return null;
}

/**
 * Typeahead: accumulate printable keys for ~500ms and find the next item whose
 * label starts with the buffer, searching from after the current item.
 */
export function useTypeahead(getLabels: () => string[], isDisabled?: (i: number) => boolean) {
  const buf = React.useRef("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return React.useCallback((key: string, current: number): number | null => {
    if (key.length !== 1 || key === " " && !buf.current) return null;
    buf.current += key.toLowerCase();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { buf.current = ""; }, 500);
    const labels = getLabels();
    const n = labels.length;
    /* A repeated single letter cycles through matches; a longer buffer refines. */
    const same = buf.current.split("").every((c) => c === buf.current[0]);
    const needle = same ? buf.current[0] : buf.current;
    const start = same || current < 0 ? current + 1 : current;
    for (let k = 0; k < n; k++) {
      const i = (start + k + n) % n;
      if (!isDisabled?.(i) && labels[i].toLowerCase().startsWith(needle)) return i;
    }
    return null;
  }, [getLabels, isDisabled]);
}

export interface ListNavigationOptions<T> {
  items: T[];
  /** Plain-text label per item — enables typeahead. */
  getLabel?: (item: T) => string;
  isDisabled?: (item: T) => boolean;
  orientation?: Orientation;
  loop?: boolean;
  /** Turn typeahead off (e.g. a combobox where typing goes to the text box). */
  typeahead?: boolean;
}

/**
 * Active-descendant navigation for listbox / menu / combobox popups. Focus stays
 * on one element (the trigger, search box or list) while `activeIndex` moves;
 * the component renders `aria-activedescendant` and the highlight from it.
 */
export function useListNavigation<T>({
  items, getLabel, isDisabled, orientation = "vertical", loop = true, typeahead = true,
}: ListNavigationOptions<T>) {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const disabledAt = React.useCallback((i: number) => !!isDisabled?.(items[i]), [items, isDisabled]);
  const labels = React.useCallback(() => items.map((it) => (getLabel ? getLabel(it) : "")), [items, getLabel]);
  const type = useTypeahead(labels, disabledAt);

  /* Clamp when the list shrinks (filtering). */
  React.useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(items.length ? firstEnabled(items.length - 1, -1, { count: items.length, current: -1, isDisabled: disabledAt }) : -1);
  }, [items.length, activeIndex, disabledAt]);

  /** Handle a navigation key; returns true when it was consumed. */
  const onNavigate = React.useCallback((e: React.KeyboardEvent): boolean => {
    const opts = { count: items.length, current: activeIndex, orientation, loop, isDisabled: disabledAt };
    let next = getNavigationIndex(e.key, opts);
    if (next === null && (e.key === "PageDown" || e.key === "PageUp")) {
      next = e.key === "PageDown"
        ? firstEnabled(Math.min(items.length - 1, Math.max(0, activeIndex) + 10), -1, opts)
        : firstEnabled(Math.max(0, activeIndex - 10), 1, opts);
    }
    if (next === null && typeahead && getLabel && !e.ctrlKey && !e.metaKey && !e.altKey) next = type(e.key, activeIndex);
    if (next === null || next < 0) return false;
    e.preventDefault();
    setActiveIndex(next);
    return true;
  }, [items.length, activeIndex, orientation, loop, disabledAt, typeahead, getLabel, type]);

  return {
    activeIndex, setActiveIndex, onNavigate,
    /** Move the cursor to the first (or last) enabled item. */
    focusEdge: (edge: "first" | "last") => setActiveIndex(firstEnabled(edge === "first" ? 0 : items.length - 1, edge === "first" ? 1 : -1, { count: items.length, current: -1, isDisabled: disabledAt })),
    isDisabledAt: disabledAt,
  };
}

/**
 * Roving tabindex for composite widgets where each item takes real focus (tabs,
 * radio group, toolbar). Returns an onKeyDown for the container and the
 * tabIndex each item should carry. Only the current item is in the Tab order.
 */
export function useRovingFocus({
  count, current, orientation = "horizontal", loop = true, isDisabled, onMove, dir,
}: NavigateOptions & { onMove: (index: number) => void }) {
  const refs = React.useRef<(HTMLElement | null)[]>([]);
  const fallback = firstEnabled(0, 1, { count, current: -1, isDisabled });
  const tabStop = current >= 0 && current < count && !isDisabled?.(current) ? current : fallback;
  const onKeyDown = (e: React.KeyboardEvent) => {
    const from = refs.current.findIndex((el) => el === document.activeElement);
    const next = getNavigationIndex(e.key, { count, current: from >= 0 ? from : tabStop, orientation, loop, isDisabled, dir });
    if (next === null || next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onMove(next);
  };
  return {
    onKeyDown,
    getItemProps: (index: number) => ({
      ref: (el: HTMLElement | null) => { refs.current[index] = el; },
      tabIndex: index === tabStop ? 0 : -1,
    }),
  };
}

/** Keep the active option visible inside a scrolling popup. */
export function scrollIntoViewIfNeeded(el: Element | null | undefined): void {
  if (el && typeof (el as HTMLElement).scrollIntoView === "function") (el as HTMLElement).scrollIntoView({ block: "nearest" });
}

/** Is this a key that should activate a button-like element? */
export const isActivationKey = (key: string) => key === "Enter" || key === " ";

/**
 * Make a non-button element (a card, a calendar cell, a row) operable like a
 * button: focusable, role="button", Enter / Space activate. Keys that bubble
 * up from a control INSIDE the element are ignored, so a card with its own
 * buttons keeps them working. Use a real <button> whenever the content allows.
 */
export function pressableProps<E extends HTMLElement = HTMLElement>(
  onPress: ((e: React.MouseEvent<E> | React.KeyboardEvent<E>) => void) | undefined | null,
  opts: { label?: string; disabled?: boolean; pressed?: boolean; selected?: boolean; role?: string } = {},
) {
  if (!onPress) return {};
  return {
    role: opts.role ?? "button",
    tabIndex: opts.disabled ? -1 : 0,
    "aria-label": opts.label,
    "aria-disabled": opts.disabled || undefined,
    "aria-pressed": opts.pressed,
    "aria-selected": opts.selected,
    onClick: (e: React.MouseEvent<E>) => { if (!opts.disabled) onPress(e); },
    onKeyDown: (e: React.KeyboardEvent<E>) => {
      if (e.target !== e.currentTarget || opts.disabled) return;
      if (isActivationKey(e.key)) { e.preventDefault(); onPress(e); }
    },
  };
}

