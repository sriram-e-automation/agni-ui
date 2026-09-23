/**
 * @internal Renderer behind the public <FileUpload> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Tooltip } from "../../feedback/Tooltip/Tooltip.tsx";
import { useFieldControl } from "../../utils/field.tsx";
import { composeHandlers, isActivationKey, useControllableState, useStableId } from "../../utils/interaction.tsx";

/* ── Types (mirrored in FileDropzone.d.ts) ── */
export interface FileRejection {
  file: File;
  reason: "size" | "format";
}
export interface FileDropzoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onBlur"> {
  /** Controlled list of accepted files. Omit (and use `defaultValue`) for uncontrolled. */
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** Called with rejected files (oversize / wrong format). */
  onReject?: (rejections: FileRejection[]) => void;
  /** Allowed extensions, e.g. ["pdf","png","jpg"] (no dot needed). */
  accept?: string[];
  /** Per-file size cap in MB. Default 10. */
  maxSizeMB?: number;
  /** Allow multiple files. Default true. */
  multiple?: boolean;
  /** Override the auto-generated "PDF, PNG · up to 10 MB" instruction line. */
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  /** Name of the native file input — the accepted files submit with a <form>. */
  name?: string;
  form?: string;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}
/** Drag-drop file input with format/size guidance, previews and reject states. */


/**
 * AgniUI · FileDropzone
 * Drag-and-drop (or click) file input with a format + size instruction line,
 * a thumbnail/row preview per file, and explicit rejection states for
 * oversize files and unsupported formats.
 *
 * value: File[] (controlled). onChange(nextFiles). accept: extensions like
 * ["pdf","png","jpg"]. maxSizeMB: per-file cap. Rejections surface inline and
 * via onReject(rejections) where each is { file, reason }.
 *
 * The drop area is a keyboard button (Enter / Space open the file picker) and
 * the ref's target. Accepted files are mirrored into the real <input type=file>
 * (when the browser allows it) so a native form submission carries them —
 * dropped files included. Rejections are announced (role="alert").
 */
const EXT = (name = "") => (name.split(".").pop() || "").toLowerCase();
const fmtSize = (b: number) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB";
const ICON = (ext: string) => ({ pdf: "ph-file-pdf", doc: "ph-file-doc", docx: "ph-file-doc", xls: "ph-file-xls", xlsx: "ph-file-xls", csv: "ph-file-csv", png: "ph-file-image", jpg: "ph-file-image", jpeg: "ph-file-image", gif: "ph-file-image", zip: "ph-file-zip" } as Record<string, string>)[ext] || "ph-file";

export const FileDropzone = forwardRef<HTMLDivElement, FileDropzoneProps>(function FileDropzone({
  value,
  defaultValue = [],
  onChange,
  onReject,
  accept = [],
  maxSizeMB = 10,
  multiple = true,
  hint,
  disabled,
  required,
  error,
  name,
  form,
  id,
  onBlur,
  onKeyDown,
  style = {},
  ...rest
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [rejects, setRejects] = useState<FileRejection[]>([]);
  const [files, setFiles] = useControllableState<File[]>({ value, defaultValue, onChange });
  const f = useFieldControl(
    { id, error, disabled, required, "aria-describedby": rest["aria-describedby"], "aria-invalid": rest["aria-invalid"] },
    useStableId(null, "agni-dropzone"),
  );
  const hintId = f.id + "-hint";
  const isDisabled = f.disabled;

  /* Mirror the accepted list into the native input so FormData carries it. */
  useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    try { const dt = new DataTransfer(); files.forEach((x) => dt.items.add(x)); input.files = dt.files; } catch { /* read-only FileList — best effort */ }
  }, [files]);

  const acceptLc = accept.map((a) => a.replace(/^\./, "").toLowerCase());
  const maxBytes = maxSizeMB * 1048576;
  const instruction = hint || `${acceptLc.length ? acceptLc.map((a) => a.toUpperCase()).join(", ") + " · " : ""}up to ${maxSizeMB} MB${multiple ? " each" : ""}`;

  const take = (fileList: FileList | null) => {
    if (isDisabled || !fileList) return;
    const incoming = Array.from(fileList);
    const ok: File[] = [], bad: FileRejection[] = [];
    incoming.forEach((f) => {
      if (acceptLc.length && !acceptLc.includes(EXT(f.name))) bad.push({ file: f, reason: "format" });
      else if (f.size > maxBytes) bad.push({ file: f, reason: "size" });
      else ok.push(f);
    });
    setRejects(bad);
    onReject && bad.length && onReject(bad);
    if (ok.length) setFiles(multiple ? [...files, ...ok] : ok.slice(0, 1));
  };

  const remove = (i: number) => setFiles(files.filter((_, idx) => idx !== i));
  const pick = () => { if (!isDisabled) inputRef.current?.click(); };

  return (
    <div style={{ fontFamily: "var(--font-sans)", ...style }}>
      <div
        {...rest}
        ref={ref}
        id={f.id}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled || undefined}
        aria-invalid={f.invalid || undefined}
        aria-required={f.required || undefined}
        aria-labelledby={rest["aria-labelledby"] ?? f.contextLabelId}
        aria-describedby={[hintId, f.describedBy].filter(Boolean).join(" ")}
        onClick={pick}
        onKeyDown={composeHandlers(onKeyDown, (e) => { if (isActivationKey(e.key)) { e.preventDefault(); pick(); } })}
        onBlur={onBlur}
        onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-5) var(--space-4)", border: `1.5px dashed ${over ? "var(--border-brand)" : f.invalid ? "var(--status-error)" : "var(--border-default)"}`, borderRadius: "var(--radius-lg)", background: over ? "var(--surface-brand-soft)" : "var(--surface-soft)", cursor: isDisabled ? "not-allowed" : "pointer", textAlign: "center", transition: "border-color var(--dur-fast), background var(--dur-fast)", opacity: isDisabled ? 0.6 : 1 }}
      >
        <span aria-hidden="true" style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: "var(--surface-card)", border: "1px solid var(--border-subtle)", color: "var(--text-brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          <i className="ph ph-upload-simple" />
        </span>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-brand)", fontWeight: "var(--fw-semibold)" }}>Click to upload</strong> or drag and drop
        </div>
        <div id={hintId} style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{instruction}</div>
        <input ref={inputRef} type="file" name={name} form={form} multiple={multiple} accept={acceptLc.map((a) => "." + a).join(",")} disabled={isDisabled} tabIndex={-1} aria-hidden="true"
          /* Picking replaces input.files; the mirror effect restores the full list. */
          onChange={(e) => take(e.target.files)} onClick={(e) => e.stopPropagation()} style={{ display: "none" }} />
      </div>

      {rejects.length > 0 && (
        <div role="alert" style={{ marginTop: "var(--space-2)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {rejects.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-2)", borderRadius: "var(--radius-md)", background: "var(--status-error-soft)", border: "1px solid var(--status-error)", color: "var(--status-error)", fontSize: "var(--text-xs)" }}>
              <i aria-hidden="true" className="ph-fill ph-warning-circle" style={{ fontSize: 15, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{r.file.name}</strong> — {r.reason === "size" ? `exceeds ${maxSizeMB} MB (${fmtSize(r.file.size)})` : `unsupported format (.${EXT(r.file.name)})`}
              </span>
              <button type="button" aria-label={"Dismiss " + r.file.name} onClick={(e) => { e.stopPropagation(); setRejects((rs) => rs.filter((_, idx) => idx !== i)); }} style={{ cursor: "pointer", flexShrink: 0, border: "none", background: "transparent", color: "inherit", padding: 0, display: "inline-flex" }}><i aria-hidden="true" className="ph ph-x" /></button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul aria-label="Selected files" style={{ listStyle: "none", margin: 0, padding: 0, marginTop: "var(--space-2)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {files.map((file, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--surface-card)" }}>
              <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", flexShrink: 0, background: "var(--surface-brand-soft)", color: "var(--text-brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}><i className={"ph " + ICON(EXT(file.name))} /></span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-data)" }}>{fmtSize(file.size)}</div>
              </div>
              <i aria-hidden="true" className="ph-fill ph-check-circle" style={{ fontSize: 16, color: "var(--status-success)", flexShrink: 0 }} />
              <Tooltip label="Remove" side="top"><button type="button" onClick={() => remove(i)} aria-label={"Remove " + file.name} disabled={isDisabled} style={{ width: 28, height: 28, border: "none", background: "transparent", color: "var(--text-tertiary)", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-soft)"; e.currentTarget.style.color = "var(--status-error)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; }}>
                <i aria-hidden="true" className="ph ph-trash" />
              </button></Tooltip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
