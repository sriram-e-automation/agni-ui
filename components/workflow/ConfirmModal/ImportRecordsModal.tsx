/**
 * @internal Renderer behind the public <ConfirmModal> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState } from "react";
import { Modal } from "../../feedback/Modal/Modal.tsx";
import { Button } from "../../primitives/Button/Button.tsx";
import { FileUpload } from "../../forms/FileUpload/FileUpload.tsx";

export interface ImportColumn { name: string; type: string; req: boolean; eg?: string; }
export interface ImportRecordsModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  /** Column format reference table. */
  columns?: ImportColumn[];
  /** Intro callout copy. */
  intro?: React.ReactNode;
  /** CSV text offered by "Download template" (header + example rows). */
  templateCsv?: string;
  templateFilename?: string;
  /** Accepted file extensions. @default ".csv,.xlsx,.xls" */
  accept?: string;
  /** Called with the File once the (simulated) import completes. */
  onImported?: (file: File) => void;
  /** Import failed — renders an inline error banner in place of the success state. */
  error?: React.ReactNode;
}

const DEFAULT_COLUMNS: ImportColumn[] = [
  { name: "Record ID", type: "Text", req: false, eg: "REC-001" },
  { name: "Owner", type: "Text", req: true, eg: "Aravind Prabhu" },
  { name: "Category", type: "Text", req: true, eg: "Type A / Type B / …" },
  { name: "Group", type: "Text", req: false, eg: "Group One / Group Two / …" },
  { name: "Status", type: "Enum", req: true, eg: "Pending · Approved · In Review · Rejected" },
  { name: "Priority", type: "Enum", req: false, eg: "High · Med · Low" },
  { name: "Created", type: "Date", req: false, eg: "DD MMM YYYY" },
];
const DEFAULT_CSV = [
  "Record ID,Owner,Category,Group,Status,Priority,Created",
  "REC-001,Aravind Prabhu,Type A,Group One,Pending,High,20 Jun 2026",
  "REC-002,Priya Menon,Type B,Group Two,Approved,Med,19 Jun 2026",
].join("\n");

/**
 * AgniUI · ImportRecordsModal
 * Bulk-import dialog: format callout, expected-columns reference table with
 * required flags, a "Download template" CSV action, and a FileUpload dropzone
 * with a simulated import → success state.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10a). The reference table's last row
 * drops its rule with `border-b-0`, never `border-none` — the cells beside it
 * still draw, and `border-none` would zero every edge.
 */
const LBL_2XS = "text-2xs font-semibold tracking-wide uppercase text-fg-tertiary";
/* No text-align in the base string: emit order is .text-center → .text-left →
   .text-right, so a base `text-left` beats an appended `text-center`. Each
   header cell emits exactly one alignment utility (rule 5). */
const TH = "py-2 px-2 text-xs font-semibold text-fg-tertiary bg-surface-soft border-b border-line-subtle whitespace-nowrap";
const TD = "py-2 px-2 text-xs";
export const ImportRecordsModal = React.forwardRef<HTMLElement, ImportRecordsModalProps>(function ImportRecordsModal({ open, onClose, title = "Import records", columns = DEFAULT_COLUMNS, intro, templateCsv = DEFAULT_CSV, templateFilename = "records-import-template.csv", accept = ".csv,.xlsx,.xls", onImported, error = null }, ref) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => { setFile(null); setUploading(false); setDone(false); };
  const handleClose = () => { reset(); onClose && onClose(); };
  const handleImport = () => {
    if (!file || uploading || done) return;
    setUploading(true);
    setTimeout(() => { setUploading(false); setDone(true); onImported && onImported(file); }, 1600);
  };
  const downloadTemplate = () => {
    const blob = new Blob([templateCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = templateFilename; a.click();
    URL.revokeObjectURL(url);
  };

  const lbl2xs = LBL_2XS;

  return (
    <Modal ref={ref as never} open={open} onClose={handleClose} title={title} size="md"
      footer={<>
        <Button category="secondary" onClick={handleClose}>Cancel</Button>
        <Button category="primary" icon={<i className="ph ph-upload-simple" />}
          disabled={!file || uploading || done} onClick={handleImport}>
          {uploading ? "Importing…" : done ? "Imported ✓" : "Import"}
        </Button>
      </>}
    >
      <div className="flex gap-2 py-2 px-3 bg-surface-brand-soft border border-line-brand rounded-md mb-4">
        <i className="ph ph-info text-[16px] text-fg-brand shrink-0 mt-px" />
        <span className="text-sm text-fg-secondary leading-normal">
          {intro ?? <>Upload a <strong className="text-fg-primary">.csv</strong> or <strong className="text-fg-primary">.xlsx</strong> file with column headers in the first row. Maximum <strong className="text-fg-primary">500 rows</strong> per import. Required columns are marked below.</>}
        </span>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={lbl2xs}>Expected columns</span>
          <button type="button" onClick={downloadTemplate}
            className="inline-flex items-center gap-1 border-none bg-transparent text-fg-brand font-sans text-xs font-semibold cursor-pointer py-[2px] px-0">
            <i className="ph ph-file-arrow-down text-[13px]" /> Download template
          </button>
        </div>
        <div className="border border-line-subtle rounded-md overflow-hidden">
          <table className="w-full border-collapse font-sans">
            <thead>
              <tr>
                <th className={[TH, "text-left"].join(" ")}>Column</th>
                <th className={[TH, "text-left"].join(" ")}>Type</th>
                <th className={[TH, "text-left"].join(" ")}>Example</th>
                <th className={[TH, "text-center"].join(" ")}>Required</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((c, i) => {
                const rule = i === columns.length - 1 ? "border-b-0" : "border-b border-b-line-subtle";
                return (
                  <tr key={c.name}>
                    <td className={[TD, rule, "font-data text-fg-primary font-medium whitespace-nowrap"].join(" ")}>{c.name}</td>
                    <td className={[TD, rule, "text-fg-secondary"].join(" ")}>{c.type}</td>
                    <td className={[TD, rule, "text-fg-tertiary italic max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"].join(" ")}>{c.eg}</td>
                    <td className={[TD, rule, "text-center"].join(" ")}>
                      {c.req
                        ? <span className="inline-flex items-center gap-[3px] text-2xs font-semibold text-status-error"><i className="ph-fill ph-asterisk text-[8px]" />Required</span>
                        : <span className="text-2xs text-fg-tertiary">Optional</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className={[lbl2xs, "mb-2"].join(" ")}>Upload file</div>
        {error && !done && (
          <div className="flex items-start gap-2 py-2 px-3 mb-3 bg-status-error-soft border border-status-error rounded-md text-status-error text-sm">
            <i className="ph-fill ph-warning-circle text-[16px] shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}
        {done ? (
          <div className="flex flex-col items-center gap-2 py-6 px-5 border-[1.5px] border-dashed border-line-brand rounded-lg bg-surface-brand-soft text-center">
            <span className="size-[40px] rounded-full bg-[var(--agni-green-100)] text-[var(--agni-green-600)] flex items-center justify-center text-[20px]">
              <i className="ph-fill ph-check-circle" />
            </span>
            <div className="text-sm font-semibold text-fg-primary">{file && file.name} imported successfully</div>
            <button type="button" onClick={reset} className="border-none bg-transparent text-fg-brand font-sans text-sm cursor-pointer font-medium">Import another file</button>
          </div>
        ) : (
          <FileUpload
            onFiles={(files) => { setFile(files[0]); setDone(false); }}
            accept={accept}
            multiple={false}
            hint={file ? `${file.name}  ·  ${(file.size / 1024).toFixed(1)} KB — click to change` : "Drag your .csv or .xlsx here, or click to browse"}
          />
        )}
      </div>
    </Modal>
  );
});
