import * as React from "react";

export interface FileRejection { file: File; reason: "size" | "format"; }

export interface FileUploadProps {
  /** "dropzone" — guided drop area with previews and reject states · "basic" — bare drop target. Inferred as "basic" when only `onFiles` is given. @default "dropzone" */
  variant?: "dropzone" | "basic";
  /** dropzone — controlled list of accepted files. */
  value?: File[];
  onChange?: (files: File[]) => void;
  /** dropzone — rejected files (oversize / wrong format). */
  onReject?: (rejections: FileRejection[]) => void;
  /** basic — accepted files callback. */
  onFiles?: (files: File[]) => void;
  /** dropzone: ["pdf","png"] · basic: ".csv,.xlsx" — either form is accepted and normalised. */
  accept?: string[] | string;
  /** dropzone — per-file size cap in MB. @default 10 */
  maxSizeMB?: number;
  /** @default true */
  multiple?: boolean;
  /** Override the generated instruction line. */
  hint?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/**
 * AgniUI · FileUpload
 * The one file input: drag-drop with format and size guidance, previews and
 * per-file reject states.
 *
 * Merged Aug 2026 — supersedes FileDropzone (now the default `dropzone`
 * variant), which remains as an internal renderer and is no longer part of the
 * documented API.
 * @version 1.0.0
  * States: disabled.
*/
export declare function FileUpload(props: FileUploadProps): JSX.Element;
