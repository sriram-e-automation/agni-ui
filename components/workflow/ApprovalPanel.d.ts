import * as React from "react";
import { ApprovalStep } from "./ApprovalStepper";
import { AuditEntry } from "./AuditTrail";
import { ActionSpec } from "../core/actionSpec";

export interface ApprovalPanelProps {
  /** Eyebrow above the stage name. @default "Approval" */
  title?: React.ReactNode;
  /** Current stage name, e.g. "Finance review". */
  stage?: React.ReactNode;
  /** Record status string — resolved to a tone through Tag's shared map. */
  status?: string;

  steps?: ApprovalStep[];
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Hover/focus popover on each stepper node. @default true */
  interactive?: boolean;

  /** The decisions this viewer can take. Give the affirmative one
   *  `kind: "primary"` and the rejection `kind: "danger"`; gate the rest with
   *  `roles`. An empty list (or a role that matches none) hides the whole
   *  decision block, comment field included. */
  decisions?: ActionSpec[];

  /** @default true — hidden automatically when there are no decisions. */
  showComment?: boolean;
  /** Controlled comment; omit to let the panel hold it. */
  comment?: string;
  onCommentChange?: (value: string) => void;
  commentPlaceholder?: string;
  /** Block every non-ghost decision until the note is non-empty — how a
   *  rejection reason is enforced without a second dialog. */
  requireComment?: boolean;

  /** @default true */
  showAudit?: boolean;
  auditTitle?: React.ReactNode;
  entries?: AuditEntry[];

  /** Viewer role — gates each decision's `roles` list. */
  role?: string;
  /** Decided already / viewer may only read: dimmed, controls inert. */
  readOnly?: boolean;
  /** Decision in flight — spinner on the primary, everything else inert. */
  submitting?: boolean;

  loading?: boolean;
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  empty?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * AgniUI · ApprovalPanel
 * The in-page approval block: stage + status, ApprovalStepper, the role-gated
 * decision actions with their required note, and the AuditTrail beneath.
 * RecordDetailModal is the dialog form of the same three parts; both read the
 * same components so they cannot drift.
 *
 * Variants: horizontal / vertical stepper · with or without comment · with or
 * without audit · decisions-hidden (read-only viewer).
 * States: idle · comment-required (decisions blocked) · submitting ·
 * readOnly · loading · error · empty.
 * @version 1.0.0
 */
export declare function ApprovalPanel(props: ApprovalPanelProps): JSX.Element;
