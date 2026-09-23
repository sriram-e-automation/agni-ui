import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { mergeRefs, useRovingFocus, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in RichTextEditor.d.ts) ── */
export interface RichTextEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onBlur" | "onFocus"> {
  /** HTML content. Seeded on mount; later changes are applied only while the
   *  editor is not focused (e.g. a form reset), so the caret never jumps. */
  value?: string;
  /** Alias of `value` for uncontrolled use. */
  defaultValue?: string;
  /** Receives the HTML string on every edit. */
  onChange?: (html: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  placeholder?: string;
  /** Minimum editor height in px. Default 160. */
  minHeight?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  /** Submitted with a native <form> as HTML through a hidden input. */
  name?: string;
  form?: string;
  /** Asks for a link URL. Default: window.prompt. Resolve null to cancel. */
  onRequestLink?: () => string | null | Promise<string | null>;
  /** Accessible name of the toolbar. @default "Formatting" */
  toolbarLabel?: string;
  style?: React.CSSProperties;
}
/** Long-text editor: formatting toolbar over a contentEditable surface. */


/**
 * AgniUI · RichTextEditor
 * Lightweight long-text editor: a formatting toolbar over a contentEditable
 * surface. onChange receives the HTML string. Content is seeded once on mount
 * (uncontrolled thereafter) so the caret never jumps while typing.
 *
 * Toolbar: bold · italic · underline · bullet list · numbered list · link ·
 * clear formatting. Uses document.execCommand (broadly supported for these).
 *
 * Accessibility: the surface is a labelled role="textbox" (multi-line) carrying
 * the FormField's id, description and invalid state; the ref is that surface.
 * The toolbar is a WAI-ARIA toolbar — one Tab stop, ←/→ move, Home/End —
 * whose toggles report aria-pressed for the current selection.
 * Keys: Ctrl/⌘+B · I · U (native) · Ctrl/⌘+K link · Alt+F10 jumps to the
 * toolbar · Escape in the toolbar returns to the text, selection intact.
 */
type Tool = { cmd: string; icon: string; title: string; toggle?: boolean; link?: boolean } | { sep: true };
const TOOLS: Tool[] = [
  { cmd: "bold", icon: "ph-text-b", title: "Bold", toggle: true },
  { cmd: "italic", icon: "ph-text-italic", title: "Italic", toggle: true },
  { cmd: "underline", icon: "ph-text-underline", title: "Underline", toggle: true },
  { sep: true },
  { cmd: "insertUnorderedList", icon: "ph-list-bullets", title: "Bulleted list", toggle: true },
  { cmd: "insertOrderedList", icon: "ph-list-numbers", title: "Numbered list", toggle: true },
  { sep: true },
  { cmd: "createLink", icon: "ph-link", title: "Insert link", link: true },
  { cmd: "removeFormat", icon: "ph-text-strikethrough", title: "Clear formatting" },
];
const BUTTONS = TOOLS.filter((t): t is Exclude<Tool, { sep: true }> => !("sep" in t));

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(function RichTextEditor({
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  placeholder = "Write a description…",
  minHeight = 160,
  disabled,
  readOnly = false,
  required,
  error,
  name,
  form,
  id,
  onRequestLink,
  toolbarLabel = "Formatting",
  style = {},
  ...rest
}, fwd) {
  const ref = useRef<HTMLDivElement>(null);
  const range = useRef<Range | null>(null);
  const initial = value ?? defaultValue ?? "";
  const [html, setHtml] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [empty, setEmpty] = useState(!initial);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [toolIdx, setToolIdx] = useState(0);
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-rte"),
  );
  const editable = !f.disabled && !readOnly;

  useEffect(() => { if (ref.current) { ref.current.innerHTML = initial; setEmpty(!ref.current.textContent?.trim()); } }, []); // eslint-disable-line
  /* External value changes (form reset) apply only when the user isn't typing. */
  useEffect(() => {
    if (value === undefined || !ref.current || focused || value === ref.current.innerHTML) return;
    ref.current.innerHTML = value;
    setHtml(value);
    setEmpty(!ref.current.textContent?.trim());
  }, [value]); // eslint-disable-line

  const refreshState = () => {
    const next: Record<string, boolean> = {};
    for (const t of BUTTONS) if (t.toggle) { try { next[t.cmd] = document.queryCommandState(t.cmd); } catch { next[t.cmd] = false; } }
    setActive(next);
  };
  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) range.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreRange = () => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (range.current && sel) { sel.removeAllRanges(); sel.addRange(range.current); }
  };
  useEffect(() => {
    const onSel = () => { if (ref.current && document.activeElement === ref.current) { saveRange(); refreshState(); } };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const emit = () => {
    if (!ref.current) return;
    setEmpty(!ref.current.textContent?.trim());
    setHtml(ref.current.innerHTML);
    onChange?.(ref.current.innerHTML);
  };
  const exec = async (t: (typeof BUTTONS)[number]) => {
    if (!editable) return;
    restoreRange();
    if (t.link) {
      const url = onRequestLink ? await onRequestLink() : window.prompt("Enter URL", "https://");
      if (!url) return;
      restoreRange();
      document.execCommand(t.cmd, false, url);
    } else document.execCommand(t.cmd, false);
    saveRange();
    refreshState();
    emit();
  };

  const roving = useRovingFocus({ count: BUTTONS.length, current: toolIdx, orientation: "horizontal", onMove: setToolIdx });

  const onEditorKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.altKey && e.key === "F10") { e.preventDefault(); saveRange(); document.getElementById(`${f.id}-tool-${toolIdx}`)?.focus(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault(); saveRange();
      const link = BUTTONS.find((b) => b.link);
      if (link) exec(link);
    }
  };

  const bc = f.invalid ? "var(--input-bdr-error)" : focused ? "var(--input-bdr-focus)" : "var(--input-bdr)";
  let bi = -1;

  return (
    <div style={{ border: `1px solid ${bc}`, borderRadius: "var(--radius-md)", background: f.disabled ? "var(--input-bg-disabled)" : "var(--input-bg)", boxShadow: focused ? (f.invalid ? "var(--focus-ring-error)" : "var(--focus-ring)") : "none", transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)", overflow: "hidden", fontFamily: "var(--font-sans)", opacity: f.disabled ? "var(--state-disabled-opacity)" : undefined, ...style }}>
      <div
        role="toolbar"
        aria-label={toolbarLabel}
        aria-controls={f.id}
        aria-disabled={!editable || undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape") { e.preventDefault(); restoreRange(); return; }
          roving.onKeyDown(e);
        }}
        style={{ display: "flex", alignItems: "center", gap: 2, padding: "var(--space-1) var(--space-1)", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-soft)", flexWrap: "wrap" }}
      >
        {TOOLS.map((t, i) => {
          if ("sep" in t) return <span key={i} role="separator" aria-orientation="vertical" style={{ width: 1, height: 18, background: "var(--border-default)", margin: "0 3px" }} />;
          const idx = ++bi;
          const { ref: itemRef, tabIndex } = roving.getItemProps(idx);
          const on = !!(t.toggle && active[t.cmd]);
          return (
            <button key={i} ref={itemRef} id={`${f.id}-tool-${idx}`} tabIndex={tabIndex} type="button"
              title={t.title} aria-label={t.title} aria-pressed={t.toggle ? on : undefined} disabled={!editable}
              /* Mouse: act on mousedown so the editor never loses its selection.
                 Keyboard (detail === 0): act on click, from the saved selection. */
              onMouseDown={(e) => { e.preventDefault(); exec(t); }}
              onClick={(e) => { if (e.detail === 0) exec(t); }}
              style={{ width: 30, height: 30, border: "none", borderRadius: "var(--radius-sm)", background: on ? "var(--surface-sunken)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-secondary)", cursor: editable ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "background var(--dur-fast)" }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--surface-sunken)"; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              <i aria-hidden="true" className={"ph " + t.icon} />
            </button>
          );
        })}
      </div>
      <div style={{ position: "relative" }}>
        <div
          {...rest}
          ref={mergeRefs(fwd, ref)}
          id={f.id}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={rest["aria-labelledby"] ?? f.contextLabelId}
          aria-describedby={f.describedBy}
          aria-invalid={f.invalid || undefined}
          aria-required={f.required || undefined}
          aria-disabled={f.disabled || undefined}
          aria-readonly={readOnly || undefined}
          aria-placeholder={placeholder}
          tabIndex={f.disabled ? -1 : 0}
          contentEditable={editable}
          suppressContentEditableWarning
          onInput={emit}
          onKeyDown={onEditorKey}
          onFocus={(e) => { setFocused(true); refreshState(); onFocus?.(e); }}
          onBlur={(e) => { saveRange(); setFocused(false); emit(); onBlur?.(e); }}
          style={{ minHeight, padding: "var(--space-3) var(--space-3)", outline: "none", fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)", color: "var(--text-primary)", overflowY: "auto", maxHeight: 340 }}
        />
        {empty && !focused && <span aria-hidden="true" style={{ position: "absolute", top: 12, left: 14, pointerEvents: "none", fontSize: "var(--text-base)", color: "var(--text-tertiary)" }}>{placeholder}</span>}
      </div>
      {name && <input type="hidden" name={name} form={form} value={html} />}
    </div>
  );
});
