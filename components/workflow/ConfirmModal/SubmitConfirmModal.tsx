/**
 * @internal Renderer behind the public <ConfirmModal> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React from "react";
import { Modal } from "../feedback/Modal.tsx";
import { Button } from "../core/Button.tsx";
import { REQUEST_FORM_DEFAULTS } from "./RequestForm.tsx";

export interface SubmitConfirmModalProps {
  /** The submitted record ({ id, ...RequestFormValue }); null hides the modal. */
  data?: any;
  onClose?: () => void;
  /** "View request" action. */
  onView?: () => void;
  /** Option catalogs used to resolve labels — same shape as RequestForm's. */
  options?: { types?: any[]; priorities?: any[]; sites?: any[]; people?: any[] };
}

/**
 * AgniUI · SubmitConfirmModal
 * Post-submit confirmation — animated success mark, the new record id, and a
 * compact summary grid, with Done / View request actions. Pairs with
 * RequestForm's onSubmitted payload.
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10a). The success mark's entrance
 * stays an inline animation: it references keyframes this component ships in
 * its own <style>, the same exemption CommandPalette's entrance has.
 */
export function SubmitConfirmModal({ data, onClose, onView, options }: SubmitConfirmModalProps) {
  if (!data) return null;
  const o = { ...REQUEST_FORM_DEFAULTS, ...options };
  const typeLabel = (o.types.find((t) => t.value === data.reqType) || {}).label;
  const prioLabel = (o.priorities.find((p) => p.value === data.priority) || {}).label || "—";
  const siteLabel = (o.sites.find((s) => s.value === data.site) || {}).label || "—";
  const person = o.people.find((p) => p.id === data.assignee);
  const Row = ({ k, v }) => <><span className="text-xs text-fg-tertiary">{k}</span><span className="text-sm text-fg-primary font-medium text-right">{v}</span></>;
  return (
    <Modal open={!!data} onClose={onClose} title={null} size="sm"
      footer={<>
        <Button category="secondary" onClick={onClose}>Done</Button>
        <Button category="primary" icon={<i className="ph ph-arrow-right" />} onClick={onView}>View request</Button>
      </>}>
      <style>{`@keyframes agni-submit-scale-in { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }`}</style>
      <div className="flex flex-col items-center text-center gap-2 pb-1">
        <span className="size-[54px] rounded-full bg-status-success-soft text-status-success inline-flex items-center justify-center text-[30px]"
          style={{ animation: "agni-submit-scale-in var(--dur-normal) var(--ease-emphasized)" }}>
          <i className="ph-fill ph-check-circle" />
        </span>
        <div className="text-lg font-semibold text-fg-primary">Request submitted</div>
        <div className="text-sm text-fg-tertiary">
          <span className="font-data text-fg-brand font-semibold">{data.id}</span> is now in the tracker.
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-y-2 gap-x-4 items-center py-3 px-4 bg-surface-soft border border-line-subtle rounded-md">
        <Row k="Title" v={data.title} />
        <Row k="Type" v={typeLabel} />
        <Row k="Priority" v={prioLabel} />
        <Row k="Site" v={siteLabel} />
        <Row k="Items" v={`${(data.rows || []).filter((r) => r.item).length} line item(s)`} />
        <Row k="Assignee" v={person ? person.name : "—"} />
      </div>
    </Modal>
  );
}
