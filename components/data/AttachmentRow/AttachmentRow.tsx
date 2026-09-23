import React from "react";
import { resolveDataState } from "../feedback/DataState.tsx";

/* Tailwind v4 (migrated Aug 2026, tranche 7a). The row's `hov` useState is
   gone (hover: on the row); the upload bar's width is the live percentage and
   stays inline. Kind tints are complete class strings. */
const KINDS = {
  pdf:   { icon:"ph-fill ph-file-pdf",   tint:"text-status-error" },
  image: { icon:"ph-fill ph-file-image", tint:"text-status-info" },
  sheet: { icon:"ph-fill ph-file-xls",   tint:"text-status-success" },
  doc:   { icon:"ph-fill ph-file-doc",   tint:"text-status-info" },
  cad:   { icon:"ph-fill ph-cube",       tint:"text-status-pending" },
  file:  { icon:"ph-fill ph-file",       tint:"text-fg-tertiary" },
};

function kindOf(name, kind) {
  if (kind) return KINDS[kind] || KINDS.file;
  const ext = String(name || "").split(".").pop().toLowerCase();
  if (ext === "pdf") return KINDS.pdf;
  if (["png","jpg","jpeg","gif","webp","svg"].includes(ext)) return KINDS.image;
  if (["csv","xls","xlsx"].includes(ext)) return KINDS.sheet;
  if (["doc","docx","txt","rtf"].includes(ext)) return KINDS.doc;
  if (["step","stp","iges","stl","dwg"].includes(ext)) return KINDS.cad;
  return KINDS.file;
}

const ROW = "flex items-center gap-3 px-3 py-2 rounded-md bg-transparent hover:bg-surface-soft transition-colors duration-fast";
const NAME = "m-0 text-sm font-medium text-fg-primary overflow-hidden text-ellipsis whitespace-nowrap";
const ACT =
  "size-[26px] border border-line-subtle bg-surface-card rounded-sm inline-flex items-center justify-center " +
  "cursor-pointer text-fg-secondary text-[14px] p-0 transition-[border-color,color] duration-fast " +
  "hover:border-line-brand hover:text-fg-brand";

export function AttachmentRow({ name, meta, kind, progress, error, loading, onView, onDownload, onRemove, onRetry, style }) {
  const state = resolveDataState({ loading, shape: "attachmentRow" });
  if (state !== false) return <div style={style}>{state}</div>;
  const k = kindOf(name, kind);
  const uploading = progress != null && progress < 100 && !error;
  return (
    <div className={ROW} style={style}>
      <i className={[error ? "ph-fill ph-warning-circle" : k.icon, "text-[20px] shrink-0", error ? "text-status-error" : k.tint].join(" ")} />
      <div className="flex-1 min-w-0">
        <p className={NAME}>{name}</p>
        {error
          ? <p className="m-0 text-2xs text-status-error-ink">{error === true ? "Upload failed" : error}</p>
          : uploading
            ? <div className="mt-1 h-[4px] rounded-full bg-surface-sunken overflow-hidden">
                <span className="block h-full bg-action-brand rounded-full" style={{ width: progress + "%" }}></span>
              </div>
            : <p className="m-0 text-2xs font-data text-fg-tertiary">{meta}</p>}
      </div>
      <div className="flex gap-1 shrink-0">
        {error && onRetry && <button type="button" title="Retry" onClick={onRetry} className={ACT}><i className="ph ph-arrow-clockwise" /></button>}
        {!uploading && !error && onView && <button type="button" title="View" onClick={onView} className={ACT}><i className="ph ph-eye" /></button>}
        {!uploading && !error && onDownload && <button type="button" title="Download" onClick={onDownload} className={ACT}><i className="ph ph-download-simple" /></button>}
        {onRemove && <button type="button" title="Remove" onClick={onRemove} className={ACT}><i className="ph ph-x" /></button>}
      </div>
    </div>
  );
}
