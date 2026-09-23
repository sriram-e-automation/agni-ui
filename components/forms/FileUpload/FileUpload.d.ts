import * as React from "react";

export interface FileRejection { file: File; reason: "size" | "format"; }

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onBlur"> {
  /** "dropzone" — guided drop area with previews and reject states · "basic" — bare drop target. Inferred as "basic" when only `onFiles` is given. @default "dropzone" */
  variant?: "dropzone" | "basic";
  /** dropzone — controlled list of accepted files. Omit (and use `defaultValue`) for uncontrolled. */
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** dropzone — rejected files (oversize / wrong format). */
  onReject?: (rejections: FileRejection[]) => void;
  /** basic: the batch just picked/dropped · dropzone: the full accepted list. */
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
  required?: boolean;
  error?: boolean;
  /** Name of the native file input — the files submit with a <form>. */
  name?: string;
  form?: string;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
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
 *
 * The drop area is a keyboard button (Enter / Space open the picker), labelled
 * by a surrounding FormField and described by its instruction line; it is the
 * ref's target. Rejections are announced. Accepted files are mirrored into the
 * native input so `name` submits them — dropped ones too.
 * @version 1.1.0
  * States: disabled · error.
*/
export declare const FileUpload: React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLDivElement>>;
