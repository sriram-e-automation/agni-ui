import * as React from "react";
export interface AuditEntry {
  actor: string;
  action: React.ReactNode;
  ts: string;
  detail?: React.ReactNode;
  icon?: string;
  tone?: "default" | "success" | "warning" | "error" | "info";
}
export interface AuditTrailProps {
  entries?: AuditEntry[];
  style?: React.CSSProperties;
  /** Content in flight — shape-matched skeleton. */
  loading?: boolean;
  /** Skeleton units while loading. @default 5 */
  loadingRows?: number;
  /** Fetch failed. true/string → ErrorState with retry; node → as given. */
  error?: React.ReactNode | boolean;
  onRetry?: () => void;
  /** Nothing to show. String → EmptyState title; node → as given. */
  empty?: React.ReactNode;
}
/** Read-only chronological activity / audit log.
 *  @version 1.1.0
  * States: loading · error · empty.
*/
export declare const AuditTrail: React.ForwardRefExoticComponent<AuditTrailProps & React.RefAttributes<HTMLElement>>;
