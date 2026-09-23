import React from "react";
import { FileDropzone } from "./FileDropzone.tsx";
import { FileUploadBasic } from "./FileUploadBasic.tsx";

/**
 * AgniUI · FileUpload
 * One file input. `variant="dropzone"` (default) is the guided drop area with
 * format/size rules, previews and reject states; `variant="basic"` is the bare
 * drop target. FileDropzone remains as an internal renderer.
 *
 * Both accept vocabularies work either way: a string (".csv,.xlsx") and an
 * array (["csv","xlsx"]) are normalised for whichever renderer runs, so callers
 * written against either former component keep working.
 */
export function FileUpload({ variant, accept, onFiles, onChange, ...p }: any) {
  /* An onFiles callback or a string `accept` is the old basic contract. */
  const kind = variant || (onFiles && !onChange ? "basic" : "dropzone");

  if (kind === "basic") {
    const acceptStr = Array.isArray(accept)
      ? accept.map((a: string) => (a.startsWith(".") ? a : "." + a)).join(",")
      : accept;
    return <FileUploadBasic accept={acceptStr} onFiles={onFiles} {...p} />;
  }

  const acceptArr = typeof accept === "string"
    ? accept.split(",").map((a) => a.trim().replace(/^\./, "")).filter(Boolean)
    : accept;
  return (
    <FileDropzone
      accept={acceptArr}
      onChange={(files: File[]) => { onChange && onChange(files); onFiles && onFiles(files); }}
      {...p}
    />
  );
}
