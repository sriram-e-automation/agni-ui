import React, { forwardRef } from "react";
import { FileDropzone, type FileDropzoneProps, type FileRejection } from "./FileDropzone.tsx";
import { FileUploadBasic } from "./FileUploadBasic.tsx";

/* ── Types (mirrored in FileUpload.d.ts) ── */
export type { FileRejection };
export interface FileUploadProps extends Omit<FileDropzoneProps, "accept"> {
  /** "dropzone" (default) — guided area with rules, previews, rejects · "basic" — bare drop target. */
  variant?: "dropzone" | "basic";
  /** Extensions — a string (".csv,.xlsx") or an array (["csv","xlsx"]). */
  accept?: string | string[];
  /** basic: the batch just picked/dropped · dropzone: the full accepted list (same as onChange). */
  onFiles?: (files: File[]) => void;
}

/**
 * AgniUI · FileUpload
 * One file input. `variant="dropzone"` (default) is the guided drop area with
 * format/size rules, previews and reject states; `variant="basic"` is the bare
 * drop target. FileDropzone remains as an internal renderer.
 *
 * Both accept vocabularies work either way: a string (".csv,.xlsx") and an
 * array (["csv","xlsx"]) are normalised for whichever renderer runs, so callers
 * written against either former component keep working.
 *
 * The drop area is a keyboard button (Enter / Space open the picker) and the
 * ref's target; `name` submits the files with a native <form>.
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  { variant, accept, onFiles, onChange, value, defaultValue, onReject, maxSizeMB, ...p },
  ref,
) {
  /* An onFiles callback or a string `accept` is the old basic contract. */
  const kind = variant || (onFiles && !onChange ? "basic" : "dropzone");

  if (kind === "basic") {
    const acceptStr = Array.isArray(accept)
      ? accept.map((a) => (a.startsWith(".") ? a : "." + a)).join(",")
      : accept;
    const { hint, ...basic } = p;
    return <FileUploadBasic ref={ref} accept={acceptStr} onFiles={onFiles} hint={hint} {...basic} />;
  }

  const acceptArr = typeof accept === "string"
    ? accept.split(",").map((a) => a.trim().replace(/^\./, "")).filter(Boolean)
    : accept;
  return (
    <FileDropzone
      ref={ref}
      {...p}
      accept={acceptArr}
      value={value}
      defaultValue={defaultValue}
      onReject={onReject}
      maxSizeMB={maxSizeMB}
      onChange={(files: File[]) => { onChange?.(files); onFiles?.(files); }}
    />
  );
});
