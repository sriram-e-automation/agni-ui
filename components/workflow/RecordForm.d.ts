import * as React from "react";
export interface RequestOption { value: string; label: string; icon?: string; }
export interface RequestPerson { id: string; name: string; team?: string; }
export interface RecordFormValue {
  reqType: string; priority: string | null; category: string | null; site: string | null; title: string;
  qty: number; urgent: boolean; hazardous: boolean; needsQA: boolean;
  rows: { item: string; qty: number; unit: string }[]; files: any[]; desc: string;
  assignee: string | null; members: string[]; note: string;
}
export interface RecordFormProps {
  open?: boolean;
  onClose?: () => void;
  /** Receives { id, ...form } after the review step is confirmed. */
  onSubmitted?: (record: RecordFormValue & { id: string }) => void;
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
  /** New record id generator. */
  makeId?: () => string;
  /** create (default) · edit (prefilled, "Save changes") · view (read-only,
   *  fields inert, footer reduced to Close). */
  mode?: "create" | "edit" | "view";
  /** Prefill / record being edited — merged over the blank form on open. */
  value?: Partial<RecordFormValue> | null;
  /** Commit in flight: primary action spins, fields lock, close is blocked.
   *  Alias: `busy` (the DS-wide word) works identically. */
  submitting?: boolean;
  /** Alias of `submitting`. */
  busy?: boolean;
  /** Server-side failure after submit — error Banner at the top of the form.
   *  Alias: `error` (the DS-wide word) works identically. */
  submitError?: React.ReactNode;
  /** Alias of `submitError`. */
  error?: React.ReactNode;
}
/** Canonical create-record Sheet: full advanced form kit, validation, discard guard, review → submit flow.  * States: error · busy · open · submitting · submitError.
*/
export declare function RecordForm(props: RecordFormProps): JSX.Element;
/** Maps an in-progress form value to ReviewSubmitModal summary rows. */
export declare function buildReviewSummary(data: Partial<RecordFormValue>, opts?: any): { label: string; value: React.ReactNode }[];
/** Default option catalogs (types · priorities · categories · sites · people · units)
 *  a module overrides per desk. Read, not rendered.
 *  @version 1.0.0
 */
export declare const REQUEST_FORM_DEFAULTS: { types: RequestOption[]; priorities: RequestOption[]; categories: string[]; sites: RequestOption[]; people: RequestPerson[]; units: string[] };

/* Renamed Aug 2026 from RequestForm. The library names the shape (a record), not
   one business object; RequestForm remains as the internal renderer. */
