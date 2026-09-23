/**
 * @internal The state-body resolver shared by every Panel variant.
 * Not part of the documented API.
 */
import React from "react";
import { Loading } from "../feedback/Loading/Loading.tsx";
import { EmptyState } from "../feedback/EmptyState/EmptyState.tsx";
import { ErrorState } from "../feedback/ErrorState/ErrorState.tsx";

/**
 * One implementation of the state contract for Panel, so the inline section,
 * the bottom sheet and the side drawer cannot drift apart.
 *
 * Returns `{ body, suppressFooter }` in the documented precedence
 * error → loading → empty → content.
 *
 * `suppressFooter` is the decision this resolver exists to carry: a sticky
 * action bar over a body that failed or has not arrived offers actions that
 * cannot be performed — a Save button above an ErrorState. So error and loading
 * drop the footer, while `empty` KEEPS it: "No files attached" beside an Upload
 * action is a legitimate pairing, and often the only way out of the empty state.
 * The header always stays, in every state, because the user must be able to
 * close an overlay.
 */
export function resolvePanelBody({ children, loading, loadingShape = "paragraph", empty, error, onRetry, size = "sm" }) {
  if (error) {
    return {
      body: typeof error === "string" || error === true
        ? <ErrorState size={size} bordered={false} message={error === true ? undefined : error} onRetry={onRetry} />
        : error,
      suppressFooter: true,
    };
  }
  if (loading) {
    return { body: <Loading loading shape={loadingShape as any} />, suppressFooter: true };
  }
  if (empty && !children) {
    return {
      body: typeof empty === "string" ? <EmptyState size={size} bordered={false} title={empty} /> : empty,
      suppressFooter: false,
    };
  }
  return { body: children, suppressFooter: false };
}
