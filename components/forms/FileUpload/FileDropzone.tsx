/**
 * @internal Renderer behind the public <FileUpload> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useRef, useState } from "react";
import { Tooltip } from "../feedback/Tooltip.tsx";

/* ── Types (mirrored in FileDropzone.d.ts) ── */
export interface FileRejection {
  file: File;
  reason: "size" | "format";
}
export interface FileDropzoneProps {
  /** Controlled list of accepted files. */
  value?: File[];
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
 */
const EXT = (name = "") => (name.split(".").pop() || "").toLowerCase();
const fmtSize = (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB";
const ICON = (ext) => ({ pdf: "ph-file-pdf", doc: "ph-file-doc", docx: "ph-file-doc", xls: "ph-file-xls", xlsx: "ph-file-xls", csv: "ph-file-csv", png: "ph-file-image", jpg: "ph-file-image", jpeg: "ph-file-image", gif: "ph-file-image", zip: "ph-file-zip" }[ext] || "ph-file");

export function FileDropzone({
  value = [],
  onChange,
  onReject,
  accept = [],
  maxSizeMB = 10,
  multiple = true,
  hint,
  disabled = false,
  style = {},
}: FileDropzoneProps) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const [rejects, setRejects] = useState([]);

  const acceptLc = accept.map((a) => a.replace(/^\./, "").toLowerCase());
  const maxBytes = maxSizeMB * 1048576;
  const instruction = hint || `${acceptLc.length ? acceptLc.map((a) => a.toUpperCase()).join(", ") + " · " : ""}up to ${maxSizeMB} MB${multiple ? " each" : ""}`;

  const take = (fileList) => {
    if (disabled) return;
    const incoming = Array.from(fileList);
    const ok = [], bad = [];
    incoming.forEach((f) => {
      if (acceptLc.length && !acceptLc.includes(EXT(f.name))) bad.push({ file: f, reason: "format" });
      else if (f.size > maxBytes) bad.push({ file: f, reason: "size" });
      else ok.push(f);
    });
    setRejects(bad);
    onReject && bad.length && onReject(bad);
    if (ok.length) onChange && onChange(multiple ? [...value, ...ok] : ok.slice(0, 1));
  };

  const remove = (i) => onChange && onChange(value.filter((_, idx) => idx !== i));

  return (
    <div style={{ fontFamily: "var(--font-sans)", ...style }}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-5) var(--space-4)", border: `1.5px dashed ${over ? "var(--border-brand)" : "var(--border-default)"}`, borderRadius: "var(--radius-lg)", background: over ? "var(--surface-brand-soft)" : "var(--surface-soft)", cursor: disabled ? "not-allowed" : "pointer", textAlign: "center", transition: "border-color var(--dur-fast), background var(--dur-fast)", opacity: disabled ? 0.6 : 1 }}
      >
        <span style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: "var(--surface-card)", border: "1px solid var(--border-subtle)", color: "var(--text-brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          <i className="ph ph-upload-simple" />
        </span>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-brand)", fontWeight: "var(--fw-semibold)" }}>Click to upload</strong> or drag and drop
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{instruction}</div>
        <input ref={inputRef} type="file" multiple={multiple} accept={acceptLc.map((a) => "." + a).join(",")} disabled={disabled} onChange={(e) => { take(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
      </div>

      {rejects.length > 0 && (
        <div style={{ marginTop: "var(--space-2)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {rejects.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-2)", borderRadius: "var(--radius-md)", background: "var(--status-error-soft)", border: "1px solid var(--status-error)", color: "var(--status-error)", fontSize: "var(--text-xs)" }}>
              <i className="ph-fill ph-warning-circle" style={{ fontSize: 15, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{r.file.name}</strong> — {r.reason === "size" ? `exceeds ${maxSizeMB} MB (${fmtSize(r.file.size)})` : `unsupported format (.${EXT(r.file.name)})`}
              </span>
              <i className="ph ph-x" onClick={(e) => { e.stopPropagation(); setRejects((rs) => rs.filter((_, idx) => idx !== i)); }} style={{ cursor: "pointer", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div style={{ marginTop: "var(--space-2)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {value.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--surface-card)" }}>
              <span style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", flexShrink: 0, background: "var(--surface-brand-soft)", color: "var(--text-brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}><i className={"ph " + ICON(EXT(f.name))} /></span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-data)" }}>{fmtSize(f.size)}</div>
              </div>
              <i className="ph-fill ph-check-circle" style={{ fontSize: 16, color: "var(--status-success)", flexShrink: 0 }} />
              <Tooltip label="Remove" side="top"><button type="button" onClick={() => remove(i)} aria-label="Remove" style={{ width: 28, height: 28, border: "none", background: "transparent", color: "var(--text-tertiary)", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-soft)"; e.currentTarget.style.color = "var(--status-error)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; }}>
                <i className="ph ph-trash" />
              </button></Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
