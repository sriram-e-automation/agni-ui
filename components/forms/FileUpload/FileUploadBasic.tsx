/**
 * @internal Renderer behind the public <FileUpload> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState, useRef } from "react";

/* ── Types (mirrored in FileUpload.d.ts) ── */
export interface FileUploadProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Drag-and-drop file dropzone. */


/**
 * AgniUI · FileUpload
 * Drag-and-drop dropzone. onFiles(FileList|File[]) fires on drop or pick.
 * Presentational — wire `onFiles` to your own upload logic.
 */
export function FileUploadBasic({ onFiles, accept, multiple = true, hint = "Drag files here or click to browse", style = {} }: FileUploadProps) {
  const [over, setOver] = useState(false);
  const ref = useRef(null);
  const handle = (files) => { if (files && files.length && onFiles) onFiles(Array.from(files)); };
  return (
    <div
      onClick={() => ref.current && ref.current.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
        padding: "var(--space-6) var(--space-5)", textAlign: "center", cursor: "pointer",
        border: `1.5px dashed ${over ? "var(--border-brand)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)", background: over ? "var(--surface-brand-soft)" : "var(--surface-soft)",
        transition: "all var(--dur-fast)", ...style,
      }}
    >
      <i className="ph ph-cloud-arrow-up" style={{ fontSize: 30, color: over ? "var(--text-brand)" : "var(--text-tertiary)" }} />
      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{hint}</div>
      <input ref={ref} type="file" accept={accept} multiple={multiple} onChange={(e) => handle(e.target.files)} style={{ display: "none" }} />
    </div>
  );
}
