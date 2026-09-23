import React from "react";
import { RequestForm } from "./RequestForm.tsx";

/**
 * AgniUI · RecordForm
 * Renamed Aug 2026 from RequestForm — the library names the shape (a record),
 * never one business object. RequestForm remains as the internal renderer.
 */
export function RecordForm(props: any) {
  return <RequestForm {...props} />;
}
