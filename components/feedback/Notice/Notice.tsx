import React from "react";
import { Banner } from "./Banner.tsx";
import { Toast } from "./Toast.tsx";

/**
 * AgniUI · Notice
 * One notification component. `variant="inline"` (default) is the full-width
 * banner in the page; `variant="toast"` is the floating card. Banner and Toast
 * remain as internal renderers.
 */
export function Notice({ variant = "inline", ...p }: any) {
  if (variant === "toast") return <Toast {...p} />;
  return <Banner {...p} />;
}
