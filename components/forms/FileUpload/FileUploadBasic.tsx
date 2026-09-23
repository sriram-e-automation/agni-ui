/**
 * @internal Renderer behind the public <FileUpload> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useState, useRef } from "react";
import { useFieldControl } from "../../utils/field.tsx";
import { composeHandlers, isActivationKey, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in FileUpload.d.ts) ── */
export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  /** Name of the native file input — picked files submit with a <form>. */
  name?: string;
  form?: string;
  style?: React.CSSProperties;
}
/** Drag-and-drop file dropzone. */


/**
 * AgniUI · FileUpload
 * Drag-and-drop dropzone. onFiles(FileList|File[]) fires on drop or pick.
 * Presentational — wire `onFiles` to your own upload logic.
 */
export const FileUploadBasic = forwardRef<HTMLDivElement, FileUploadProps>(function FileUploadBasic({
  onFiles, accept, multiple = true, hint = "Drag files here or click to browse", disabled, required, error,
  name, form, id, onKeyDown, style = {}, ...rest
}, ref) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-upload"),
  );
  const hintId = f.id + "-hint";
  const handle = (files: FileList | null) => { if (files && files.length && onFiles) onFiles(Array.from(files)); };
  const pick = () => { if (!f.disabled) input.current?.click(); };
  return (
    <div
      {...rest}
      ref={ref}
      id={f.id}
      role="button"
      tabIndex={f.disabled ? -1 : 0}
      aria-disabled={f.disabled || undefined}
      aria-invalid={f.invalid || undefined}
      aria-required={f.required || undefined}
      aria-labelledby={rest["aria-labelledby"] ?? f.contextLabelId}
      aria-describedby={[hintId, f.describedBy].filter(Boolean).join(" ")}
      onClick={pick}
      onKeyDown={composeHandlers(onKeyDown, (e) => { if (isActivationKey(e.key)) { e.preventDefault(); pick(); } })}
      onDragOver={(e) => { e.preventDefault(); if (!f.disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (!f.disabled) handle(e.dataTransfer.files); }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
        padding: "var(--space-6) var(--space-5)", textAlign: "center", cursor: f.disabled ? "not-allowed" : "pointer",
        border: `1.5px dashed ${over ? "var(--border-brand)" : f.invalid ? "var(--status-error)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)", background: over ? "var(--surface-brand-soft)" : "var(--surface-soft)",
        opacity: f.disabled ? 0.6 : 1,
        transition: "all var(--dur-fast)", ...style,
      }}
    >
      <i aria-hidden="true" className="ph ph-cloud-arrow-up" style={{ fontSize: 30, color: over ? "var(--text-brand)" : "var(--text-tertiary)" }} />
      <div id={hintId} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{hint}</div>
      <input ref={input} type="file" name={name} form={form} accept={accept} multiple={multiple} disabled={f.disabled}
        /* No `required` here: a display:none control that fails validation blocks
           submit with no visible bubble. The requirement is on the drop area. */
        tabIndex={-1} aria-hidden="true" onClick={(e) => e.stopPropagation()} onChange={(e) => handle(e.target.files)} style={{ display: "none" }} />
    </div>
  );
});
