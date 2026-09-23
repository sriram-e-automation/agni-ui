import React from "react";
import { RequestDetailModal } from "./RequestDetailModal.tsx";

/**
 * AgniUI · RecordDetailModal
 * Renamed Aug 2026 from RequestDetailModal — the library names the shape
 * (a record), never one business object. RequestDetailModal remains as the
 * internal renderer.
 */
export const RecordDetailModal = React.forwardRef<HTMLElement, any>(function RecordDetailModal(props, ref) {
  return <RequestDetailModal ref={ref as never} {...props} />;
});
