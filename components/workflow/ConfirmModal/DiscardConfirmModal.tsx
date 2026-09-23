/**
 * @internal Renderer behind the public <ConfirmModal> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React from "react";
import { Modal } from "../../feedback/Modal/Modal.tsx";
import { Button } from "../../primitives/Button/Button.tsx";

/* ── Types (mirrored in DiscardConfirmModal.d.ts) ── */
export interface DiscardChoiceSpec {
  icon: string;
  tone?: "brand" | "danger";
  title: React.ReactNode;
  desc?: React.ReactNode;
  onClick?: () => void;
}
export interface DiscardConfirmModalProps {
  open?: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  keepLabel?: string;
  onKeepEditing?: () => void;
  /** Full-width choice rows (e.g. Save as draft · Discard). */
  choices?: DiscardChoiceSpec[];
}
/** Unsaved-work confirmation — choice rows + single dismiss action. */


/**
 * AgniUI · DiscardConfirmModal
 * Asks what to do with unsaved work when a form/sheet is dismissed dirty.
 * The real choices are full-width choice rows (no cramped multi-button footer);
 * the footer holds only the single dismissing action ("Keep editing").
 *
 * choices: [{ icon, tone:"brand"|"danger", title, desc, onClick }]
 *
 * Tailwind v4 (migrated Sep 2026, tranche 10a). The row's hover useState is
 * gone — it drove three properties at once (fill, edge, arrow opacity), so the
 * arrow now follows the row through `group-hover:`. Tone is a two-entry table
 * of COMPLETE class strings; the brand edge is written as an arbitrary
 * `border-[var(--text-brand)]` because the accent here is the text-brand rung,
 * not `--border-brand`, and swapping it would be a visual change.
 */
const CHOICE_BASE =
  "group flex items-center gap-3 w-full text-left p-3 cursor-pointer rounded-lg font-sans border " +
  "bg-surface-soft border-line-subtle " +
  "transition-[background-color,border-color] duration-fast ease-standard";
const CHOICE_TONE = {
  danger: "hover:bg-status-error-soft hover:border-status-error",
  brand: "hover:bg-surface-brand-soft hover:border-[var(--text-brand)]",
};
const CHOICE_TILE = { danger: "bg-status-error-soft text-status-error", brand: "bg-surface-brand-soft text-fg-brand" };
const CHOICE_ARROW = { danger: "text-status-error", brand: "text-fg-brand" };
function DiscardChoice({ icon, tone, title, desc, onClick }) {
  const t = tone === "danger" ? "danger" : "brand";
  return (
    <button type="button" onClick={onClick} className={[CHOICE_BASE, CHOICE_TONE[t]].join(" ")}>
      <span className={["size-[36px] shrink-0 rounded-md inline-flex items-center justify-center text-[18px]", CHOICE_TILE[t]].join(" ")}>
        <i className={"ph-fill " + icon} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-fg-primary">{title}</span>
        <span className="block text-xs text-fg-tertiary mt-px">{desc}</span>
      </span>
      <i className={["ph ph-arrow-right text-[15px] shrink-0 opacity-[0.4] group-hover:opacity-100 transition-opacity duration-fast ease-standard", CHOICE_ARROW[t]].join(" ")} />
    </button>
  );
}

export const DiscardConfirmModal = React.forwardRef<HTMLElement, DiscardConfirmModalProps>(function DiscardConfirmModal({
  open,
  title = "Leave without saving?",
  message = "You have unsaved changes. Pick what to do before you leave — this can’t be undone.",
  keepLabel = "Keep editing",
  onKeepEditing,
  choices = [],
}, ref) {
  return (
    <Modal ref={ref as never} open={open} onClose={onKeepEditing} title={title} size="sm"
      footer={<div className="flex w-full justify-center">
        <Button category="ghost" icon={<i className="ph ph-arrow-u-up-left" />} onClick={onKeepEditing}>{keepLabel}</Button>
      </div>}>
      <p className="m-0 mb-3 text-base text-fg-secondary leading-normal">{message}</p>
      <div className="flex flex-col gap-2">
        {choices.map((c, i) => <DiscardChoice key={i} {...c} />)}
      </div>
    </Modal>
  );
});
