import React from "react";
import { RequestForm } from "./RequestForm.tsx";

/**
 * AgniUI · RecordForm
 * Renamed Aug 2026 from RequestForm — the library names the shape (a record),
 * never one business object. RequestForm remains as the internal renderer.
 */
export const RecordForm = React.forwardRef<HTMLElement, any>(function RecordForm(props, ref) {
  return <RequestForm ref={ref as never} {...props} />;
});
