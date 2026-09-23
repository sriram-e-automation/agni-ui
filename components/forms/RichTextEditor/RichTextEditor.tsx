import React, { useRef, useState, useEffect } from "react";

/* ── Types (mirrored in RichTextEditor.d.ts) ── */
export interface RichTextEditorProps {
  /** Initial HTML (seeded once on mount). */
  value?: string;
  /** Receives the HTML string on every edit. */
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Minimum editor height in px. Default 160. */
  minHeight?: number;
  disabled?: boolean;
  error?: boolean;
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
 */
const TOOLS = [
  { cmd: "bold", icon: "ph-text-b", title: "Bold" },
  { cmd: "italic", icon: "ph-text-italic", title: "Italic" },
  { cmd: "underline", icon: "ph-text-underline", title: "Underline" },
  { sep: true },
  { cmd: "insertUnorderedList", icon: "ph-list-bullets", title: "Bulleted list" },
  { cmd: "insertOrderedList", icon: "ph-list-numbers", title: "Numbered list" },
  { sep: true },
  { cmd: "createLink", icon: "ph-link", title: "Insert link", prompt: "Enter URL" },
  { cmd: "removeFormat", icon: "ph-text-strikethrough", title: "Clear formatting" },
];

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write a description…",
  minHeight = 160,
  disabled = false,
  error = false,
  style = {},
}: RichTextEditorProps) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  const [empty, setEmpty] = useState(!value);

  useEffect(() => { if (ref.current) { ref.current.innerHTML = value || ""; setEmpty(!ref.current.textContent.trim()); } }, []); // eslint-disable-line

  const emit = () => { if (!ref.current) return; setEmpty(!ref.current.textContent.trim()); onChange && onChange(ref.current.innerHTML); };
  const exec = (t) => {
    if (disabled) return;
    ref.current && ref.current.focus();
    if (t.prompt) { const url = window.prompt(t.prompt, "https://"); if (!url) return; document.execCommand(t.cmd, false, url); }
    else document.execCommand(t.cmd, false, null);
    emit();
  };

  const bc = error ? "var(--input-bdr-error)" : focused ? "var(--input-bdr-focus)" : "var(--input-bdr)";

  return (
    <div style={{ border: `1px solid ${bc}`, borderRadius: "var(--radius-md)", background: disabled ? "var(--input-bg-disabled)" : "var(--input-bg)", boxShadow: focused ? "var(--focus-ring)" : "none", transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)", overflow: "hidden", fontFamily: "var(--font-sans)", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "var(--space-1) var(--space-1)", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-soft)", flexWrap: "wrap" }}>
        {TOOLS.map((t, i) => t.sep
          ? <span key={i} style={{ width: 1, height: 18, background: "var(--border-default)", margin: "0 3px" }} />
          : <button key={i} type="button" title={t.title} onMouseDown={(e) => { e.preventDefault(); exec(t); }}
              style={{ width: 30, height: 30, border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-secondary)", cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "background var(--dur-fast)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-sunken)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <i className={"ph " + t.icon} />
            </button>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <div
          ref={ref}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emit}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); emit(); }}
          style={{ minHeight, padding: "var(--space-3) var(--space-3)", outline: "none", fontSize: "var(--text-base)", lineHeight: "var(--leading-normal)", color: "var(--text-primary)", overflowY: "auto", maxHeight: 340 }}
        />
        {empty && !focused && <span style={{ position: "absolute", top: 12, left: 14, pointerEvents: "none", fontSize: "var(--text-base)", color: "var(--text-tertiary)" }}>{placeholder}</span>}
      </div>
    </div>
  );
}
