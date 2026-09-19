import * as React from "react";
export interface ApprovalStep {
  label: React.ReactNode;
  status: "done" | "current" | "pending" | "rejected";
  actor?: string;
  ts?: string;
  /** Optional detail line shown in the hover popover when `interactive`. */
  detail?: string;
}
export interface ApprovalStepperProps {
  steps?: ApprovalStep[];
  orientation?: "horizontal" | "vertical";
  /** Reveal a hover/focus popover (actor · ts · detail) on each node. */
  interactive?: boolean;
  style?: React.CSSProperties;
}
/** Multi-stage approval progress indicator.
 *  @version 1.0.0
 */
export declare function ApprovalStepper(props: ApprovalStepperProps): JSX.Element;
