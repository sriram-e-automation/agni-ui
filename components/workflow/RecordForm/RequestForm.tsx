/**
 * @internal Renderer behind the public <RecordForm> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React, { useState, useEffect } from "react";
import { Sheet } from "../../containment/Panel/Sheet.tsx";
import { Button } from "../../primitives/Button/Button.tsx";
import { Avatar } from "../../primitives/Avatar/Avatar.tsx";
import { Badge } from "../../primitives/Badge/Badge.tsx";
import { FormField } from "../../forms/FormField/FormField.tsx";
import { FormSection } from "../../forms/FormSection/FormSection.tsx";
import { Input } from "../../primitives/Input/Input.tsx";
import { Select } from "../../primitives/Select/Select.tsx";
import { CreatableSelect } from "../../primitives/Select/CreatableSelect.tsx";
import { SearchSelect } from "../../primitives/Select/SearchSelect.tsx";
import { RadioGroup } from "../../primitives/Radio/Radio.tsx";
import { Checkbox } from "../../primitives/Checkbox/Checkbox.tsx";
import { QuantityStepper } from "../../forms/QuantityStepper/QuantityStepper.tsx";
import { FileDropzone } from "../../forms/FileUpload/FileDropzone.tsx";
import { RichTextEditor } from "../../forms/RichTextEditor/RichTextEditor.tsx";
import { UserSelect } from "../../primitives/Select/UserSelect.tsx";
import { MultiUserSelect } from "../../primitives/Select/MultiUserSelect.tsx";
import { EditableTable } from "../../data/EditableTable/EditableTable.tsx";
import { DiscardConfirmModal } from "../ConfirmModal/DiscardConfirmModal.tsx";
import { ReviewSubmitModal } from "../ConfirmModal/ReviewSubmitModal.tsx";
import { Banner } from "../../feedback/Notice/Banner.tsx";

export interface RequestOption { value: string; label: string; icon?: string; }
export interface RequestPerson { id: string; name: string; team?: string; }
export interface RequestFormValue {
  reqType: string; priority: string | null; category: string | null; site: string | null; title: string;
  qty: number; urgent: boolean; hazardous: boolean; needsQA: boolean;
  rows: { item: string; qty: number; unit: string }[]; files: any[]; desc: string;
  assignee: string | null; members: string[]; note: string;
}
export interface RequestFormProps {
  open?: boolean;
  onClose?: () => void;
  /** Receives { id, ...form } after the review step is confirmed. */
  onSubmitted?: (record: RequestFormValue & { id: string }) => void;
  /** Form grid columns. @default 2 */
  cols?: 2 | 3;
  title?: string;
  subtitle?: string;
  /** Option catalogs — defaults ship a generic ERP set. */
  types?: RequestOption[];
  priorities?: RequestOption[];
  categories?: string[];
  sites?: RequestOption[];
  people?: RequestPerson[];
  units?: string[];
  /** New record id generator. @default "REC-" + random */
  makeId?: () => string;
  /** create (default) · edit (prefilled, "Save changes") · view (read-only). */
  mode?: "create" | "edit" | "view";
  /** Prefill / record being edited — merged over the blank form on open. */
  value?: Partial<RequestFormValue> | null;
  /** Commit in flight: the primary action spins and the form locks. Alias of the DS-wide `busy`. */
  submitting?: boolean;
  /** Alias of `submitting` — the DS-wide word for "this record's own action is committing". */
  busy?: boolean;
  /** Server-side failure after submit — banner at the top of the form. Alias of the DS-wide `error`. */
  submitError?: React.ReactNode;
  /** Alias of `submitError`. */
  error?: React.ReactNode;
}

export const REQUEST_FORM_DEFAULTS = {
  types: [
    { value: "purchase", label: "Purchase request" },
    { value: "fabrication", label: "Fabrication order" },
    { value: "service", label: "Service request" },
  ],
  priorities: [{ value: "high", label: "High" }, { value: "med", label: "Medium" }, { value: "low", label: "Low" }],
  categories: ["Avionics", "Propulsion", "Structures", "Ground systems", "Consumables"],
  sites: [
    { value: "chennai", label: "Chennai HQ", icon: "ph-buildings" },
    { value: "shar", label: "Sriharikota Launch Complex", icon: "ph-rocket" },
    { value: "blr", label: "Bengaluru Lab", icon: "ph-flask" },
    { value: "hyd", label: "Hyderabad Facility", icon: "ph-factory" },
  ],
  people: [
    { id: "u1", name: "Aravind Prabhu", team: "Propulsion · Lead" },
    { id: "u2", name: "Meera Krishnan", team: "Avionics · Engineer" },
    { id: "u3", name: "Rohit Sharma", team: "Structures · Engineer" },
    { id: "u4", name: "Priya Nair", team: "Quality · Reviewer" },
    { id: "u5", name: "Karthik Reddy", team: "Ground Systems · Engineer" },
  ],
  units: ["Nos", "kg", "m", "set", "L"],
};

const PRIO_TONE = { high: "var(--status-error)", med: "var(--status-warning)", low: "var(--status-success)" };
/* Summary values sit in ReviewSubmitModal's right-aligned value column. */
const SUMMARY_WRAP = "inline-flex flex-wrap gap-1 justify-end";
const blank = () => ({
  reqType: "purchase", priority: null, category: null, site: null, title: "",
  qty: 1, urgent: false, hazardous: false, needsQA: true,
  rows: [{ item: "", qty: 1, unit: "Nos" }], files: [], desc: "", assignee: null, members: [], note: "",
});

/** Maps the in-progress form to the summary rows ReviewSubmitModal renders. */
export function buildReviewSummary(data, opts = REQUEST_FORM_DEFAULTS) {
  const typeLabel = (opts.types.find((t) => t.value === data.reqType) || {}).label || "—";
  const prioLabel = (opts.priorities.find((p) => p.value === data.priority) || {}).label || "—";
  const siteLabel = (opts.sites.find((s) => s.value === data.site) || {}).label || "—";
  const person = opts.people.find((p) => p.id === data.assignee);
  const members = (data.members || []).map((id) => opts.people.find((p) => p.id === id)).filter(Boolean);
  const itemCount = data.rows.filter((r) => r.item).length;
  const flags = [data.urgent && "Expedite", data.hazardous && "Hazardous", data.needsQA && "QA sign-off"].filter(Boolean);
  const rows = [
    { label: "Title", value: data.title || "—" },
    { label: "Type", value: typeLabel },
    { label: "Priority", value: <><span className="size-[7px] rounded-full inline-block" style={{ background: PRIO_TONE[data.priority] || "var(--text-tertiary)" }} />{prioLabel}</> },
    { label: "Category", value: data.category || "—" },
    { label: "Site", value: siteLabel },
    { label: "Line items", value: itemCount + " item" + (itemCount === 1 ? "" : "s") },
    { label: "Assignee", value: <>{person && <Avatar name={person.name} size="xs" />}{person ? person.name : "—"}</> },
    { label: "Members", value: members.length ? <span className={SUMMARY_WRAP}>{members.map((m) => <span key={m.id} className="inline-flex items-center gap-1"><Avatar name={m.name} size="xs" /><span className="text-xs">{m.name.split(" ")[0]}</span></span>)}</span> : "—" },
  ];
  if (flags.length) rows.push({ label: "Handling", value: <span className={SUMMARY_WRAP}>{flags.map((fl) => <Badge key={fl} tone="neutral" size="sm">{fl}</Badge>)}</span> });
  return rows;
}

/**
 * AgniUI · RequestForm
 * The canonical create-record slide-up Sheet: the full advanced form kit on
 * the --field-* grid (Radio · Input · Select · CreatableSelect · SearchSelect ·
 * QuantityStepper · Checkbox flags · EditableTable line items · FileDropzone ·
 * RichTextEditor · UserSelect / MultiUserSelect), required-field validation on
 * submit, a discard-confirm guard when dirty, and a two-step review → submit
 * commit. All option catalogs are props with generic ERP defaults.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10c). Almost all of this file is DS
 * components already; what converted is the footer's required-field note, the
 * handling-flag row and the read-only/submitting lock on the body. The one
 * inline value left is the priority dot's fill — a runtime lookup keyed by the
 * form's current priority.
 */
export const RequestForm = React.forwardRef<HTMLDivElement, RequestFormProps>(function RequestForm({ open, onClose, onSubmitted, cols = 2, title, subtitle,
  mode = "create", value = null, submitting, busy = false, submitError, error = null,
  types = REQUEST_FORM_DEFAULTS.types, priorities = REQUEST_FORM_DEFAULTS.priorities, categories = REQUEST_FORM_DEFAULTS.categories,
  sites = REQUEST_FORM_DEFAULTS.sites, people = REQUEST_FORM_DEFAULTS.people, units = REQUEST_FORM_DEFAULTS.units,
  makeId = () => "REC-" + String(Math.floor(Math.random() * 900) + 100) }, ref) {
  /* submitting/submitError are the names this component shipped with; busy/error
     are the DS-wide words for the same two ideas. Either spelling works. */
  submitting = submitting ?? busy;
  submitError = submitError ?? error;
  const readOnly = mode === "view";
  const heading = title ?? (mode === "edit" ? "Edit request" : readOnly ? "Request details" : "New request");
  const subheading = subtitle ?? (mode === "edit" ? "Update this record" : readOnly ? "Read-only — you don't have edit rights on this record" : "Create a record in the tracker");
  const [f, setF] = useState(blank);
  const [tried, setTried] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [review, setReview] = useState(false);
  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));
  const opts = { types, priorities, categories, sites, people, units };

  useEffect(() => { if (open) { setF({ ...blank(), ...(value || {}) }); setTried(false); setDiscard(false); setReview(false); } }, [open, value]);

  const miss = {
    title: !f.title.trim(), priority: !f.priority, category: !f.category,
    site: !f.site, assignee: !f.assignee, members: f.members.length === 0,
  };
  const hasMiss = Object.values(miss).some(Boolean);
  const dirty = f.title.trim() || f.priority || f.category || f.site || f.assignee || f.members.length || f.desc.replace(/<[^>]*>/g, "").trim() || f.files.length || f.rows.some((r) => r.item);

  const requestClose = () => { if (submitting) return; if (dirty && !readOnly) setDiscard(true); else onClose && onClose(); };
  const handleSubmit = () => { if (submitting) return; setTried(true); if (hasMiss) return; setReview(true); };
  const confirmSubmit = () => { setReview(false); onSubmitted && onSubmitted({ id: makeId(), ...f }); };
  const saveDraft = () => { onClose && onClose(); };
  const Field = FormField;

  return (
    <>
      <Sheet ref={ref} open={open} onClose={requestClose} icon="ph-plus"
        maxWidth={cols === 3 ? "min(1180px, 96vw)" : "var(--sheet-max-w)"}
        title={heading} subtitle={subheading}
        footer={readOnly
          ? <Button category="secondary" onClick={() => onClose && onClose()}>Close</Button>
          : <>
            <span className="mr-auto text-xs text-fg-tertiary inline-flex items-center gap-1">
              <span className="text-[var(--required-mark)] font-bold">*</span> indicates a required field
            </span>
            {mode === "create" && <Button category="secondary" icon={<i className="ph ph-file-dashed" />} onClick={saveDraft} disabled={submitting}>Save as draft</Button>}
            <Button category="primary" icon={<i className="ph ph-paper-plane-tilt" />} onClick={handleSubmit} loading={submitting}>
              {mode === "edit" ? "Save changes" : "Submit request"}
            </Button>
          </>}
      >
        <div aria-readonly={readOnly || undefined} className={[
          "flex flex-col gap-[var(--field-section-gap)] transition-opacity duration-fast ease-standard",
          readOnly || submitting ? "pointer-events-none" : "pointer-events-auto",
          submitting ? "opacity-[0.7]" : "opacity-100",
        ].join(" ")}>
          {submitError && <Banner tone="error" title="Couldn't submit this request">{submitError}</Banner>}
          <FormSection title="Request details" desc="What you need and how urgent it is." cols={cols}>
            <Field label="Request type" required span>
              <RadioGroup value={f.reqType} onChange={(v) => set({ reqType: v })} options={types} direction="row" gap={20} />
            </Field>
            <Field label="Title" required error={tried && miss.title ? "Give the request a short title" : null}>
              <Input value={f.title} onChange={(v) => set({ title: v })} placeholder="e.g. Stage-2 avionics bracket" error={!!(tried && miss.title)} />
            </Field>
            <Field label="Priority" required error={tried && miss.priority ? "Select a priority" : null}>
              <Select value={f.priority} onChange={(v) => set({ priority: v })} options={priorities} placeholder="Select priority…" error={tried && miss.priority} />
            </Field>
            <Field label="Category" required hint="Type to add a new category" error={tried && miss.category ? "Select or add a category" : null}>
              <CreatableSelect value={f.category} onChange={(v) => set({ category: v })} options={categories} placeholder="Select or add…" error={tried && miss.category} />
            </Field>
            <Field label="Site / location" required error={tried && miss.site ? "Select a site" : null}>
              <SearchSelect value={f.site} onChange={(v) => set({ site: v })} options={sites} placeholder="Search sites…" error={tried && miss.site} />
            </Field>
          </FormSection>
          <FormSection title="Specifications" desc="Quantity and handling flags." cols={cols}>
            <Field label="Quantity">
              <QuantityStepper value={f.qty} onChange={(v) => set({ qty: v })} min={1} max={9999} />
            </Field>
            <Field label="Handling" span>
              <div className="flex flex-wrap gap-y-3 gap-x-6">
                <Checkbox checked={f.urgent} onChange={(v) => set({ urgent: v })} label="Expedite / urgent" />
                <Checkbox checked={f.hazardous} onChange={(v) => set({ hazardous: v })} label="Hazardous material" />
                <Checkbox checked={f.needsQA} onChange={(v) => set({ needsQA: v })} label="Requires QA sign-off" />
              </div>
            </Field>
          </FormSection>
          <FormSection title="Line items" desc="Add, edit or remove the items this request covers." cols={cols}>
            <Field span>
              <EditableTable rows={f.rows} onChange={(rows) => set({ rows })} addLabel="Add item"
                newRow={{ item: "", qty: 1, unit: units[0] }}
                columns={[
                  { key: "item", label: "Item / part" },
                  { key: "qty", label: "Qty", type: "number", width: 96, align: "right" },
                  { key: "unit", label: "Unit", type: "select", width: 120, options: units },
                ]} />
            </Field>
          </FormSection>
          <FormSection title="Attachments & description" desc="Drawings, specs and a written brief." cols={cols}>
            <Field label="Attachments" span hint="Drawings, datasheets or photos help reviewers act faster.">
              <FileDropzone value={f.files} onChange={(files) => set({ files })} accept={["pdf", "png", "jpg", "jpeg", "step", "stp"]} maxSizeMB={10} />
            </Field>
            <Field label="Description" span>
              <RichTextEditor value={f.desc} onChange={(desc) => set({ desc })} placeholder="Describe the request, context and acceptance criteria…" />
            </Field>
          </FormSection>
          <FormSection title="Assignment" desc="Who should own this request." cols={cols}>
            <Field label="Assignee" required error={tried && miss.assignee ? "Pick a person to own this" : null}>
              <UserSelect value={f.assignee} onChange={(v) => set({ assignee: v })} users={people} error={tried && miss.assignee} />
            </Field>
            <Field label="Team members" required error={tried && miss.members ? "Assign at least one member" : null}>
              <MultiUserSelect value={f.members} onChange={(v) => set({ members: v })} users={people} placeholder="Assign members…" error={tried && miss.members} />
            </Field>
          </FormSection>
        </div>
      </Sheet>
      <DiscardConfirmModal open={discard}
        onKeepEditing={() => setDiscard(false)}
        choices={[
          { icon: "ph-file-dashed", tone: "brand", title: "Save as draft", desc: "Keep your progress to finish later", onClick: () => { setDiscard(false); saveDraft(); } },
          { icon: "ph-trash", tone: "danger", title: "Discard request", desc: "Delete everything you’ve entered", onClick: () => { setDiscard(false); onClose && onClose(); } },
        ]} />
      <ReviewSubmitModal open={review}
        intro="Confirm the details below, then submit. The request is routed to the assignee for review — add a note if there is anything they should know first."
        summary={buildReviewSummary(f, opts)}
        note={f.note} onNoteChange={(note) => set({ note })}
        noteLabel="Note for the assignee"
        noteHint="Added to the record’s history and shared with reviewers."
        notePlaceholder="e.g. Needed before the Stage-2 integration window on 30 Jun."
        backLabel="Back to form" confirmLabel={mode === "edit" ? "Save changes" : "Submit request"}
        onBack={() => setReview(false)}
        onConfirm={confirmSubmit} />
    </>
  );
});
