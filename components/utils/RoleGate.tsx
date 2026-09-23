import React from "react";

/* ── Types (mirrored in RoleGate.d.ts) ── */
export interface RoleGateProps {
  /** Current user's role. */
  role: string;
  /** Roles permitted to see children. */
  allow?: string[] | null;
  /** Roles explicitly denied (overrides allow). */
  deny?: string[] | null;
  /** Rendered when access is denied. */
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}
/** Role-based visibility wrapper. */


/**
 * AgniUI · RoleGate
 * Role-based visibility wrapper. Renders children only when the current `role`
 * is in `allow` (or not in `deny`). Optional `fallback` for denied access.
 * Squad mapping is out of scope — this is single global-role gating.
 */
/* The check itself, exported so components that must FILTER a list (rather than
   wrap one node) share this implementation instead of re-writing it — e.g.
   RecordDetailModal gating sections, panes, actions and assignment. Named in
   lower camelCase on purpose: a capitalised export would land on the public
   window namespace as if it were a component.

   AN ABSENT ROLE MEANS UNGATED. Every gated component defaults `role` to "",
   and the documented contract on all of them is "omit to show everything" — so
   an empty role must pass every list rather than fail every one. Without this
   line a consumer that ships `roles` metadata but never threads `role` through
   loses those actions silently, with no error anywhere: the exact failure this
   predicate exists to prevent. `deny` is still honoured for a real role.
   (RoleGate itself takes `role` as a REQUIRED prop, so passing "" there is a
   programming error, and failing open is the safer of the two wrong answers —
   this gates VISIBILITY, never authority. The server authorises.) */
export function roleAllows(
  role?: string | null,
  allow: string | readonly string[] | null | undefined = null,
  deny: string | readonly string[] | null | undefined = null,
): boolean {
  if (!role) return true;
  let permitted = true;
  if (allow) permitted = allow.includes(role);
  if (deny && deny.includes(role)) permitted = false;
  return permitted;
}

export function RoleGate({ role, allow = null, deny = null, fallback = null, children }: RoleGateProps) {
  return roleAllows(role, allow, deny) ? <>{children}</> : <>{fallback}</>;
}
