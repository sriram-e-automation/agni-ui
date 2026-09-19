import { resolveDataState } from "../feedback/DataState.tsx";
import React from "react";
import { Tooltip } from "../feedback/Tooltip.tsx";

/* ── Types (mirrored in DocumentPreview.d.ts) ── */
export interface DocumentPreviewProps {
  name: React.ReactNode;
  /** File type → icon/color. */
  type?: "pdf" | "doc" | "xls" | "img" | "cad" | "zip" | "file";
  meta?: React.ReactNode;
  onView?: () => void;
  onDownload?: () => void;
  style?: React.CSSProperties;
}
/** Attachment / document preview row with actions. */

/**
 * AgniUI · DocumentPreview
 * File/document card — type icon, name, meta, and actions (view / download).
 * For attachment lists, drawing previews, PO/invoice docs.
 *
 * Tailwind v4 (migrated Aug 2026, tranche 7a). The type icon's wash stays
 * inline: it is the hue token + "1A" alpha, composed at runtime from the map.
 */
const TYPE = {
  pdf:   { icon: "ph-file-pdf",   color: "var(--hue-error)"        },
  doc:   { icon: "ph-file-doc",   color: "var(--hue-info)"         },
  xls:   { icon: "ph-file-xls",   color: "var(--hue-success)"      },
  img:   { icon: "ph-file-image", color: "var(--hue-violet)"       },
  cad:   { icon: "ph-cube",       color: "var(--hue-warning)"      },
  zip:   { icon: "ph-file-zip",   color: "var(--agni-neutral-500)" },
  file:  { icon: "ph-file",       color: "var(--agni-neutral-500)" },
};

const CARD = "flex items-center gap-3 p-3 bg-surface-card border border-line-subtle rounded-md";
const ICON_WELL = "size-[40px] shrink-0 rounded-sm inline-flex items-center justify-center text-[22px]";
const NAME = "text-sm font-medium text-fg-primary whitespace-nowrap overflow-hidden text-ellipsis";
const ACT =
  "size-[32px] border border-line-default rounded-sm bg-surface-card text-fg-secondary cursor-pointer text-[16px] " +
  "transition-[border-color,color] duration-fast hover:border-line-brand hover:text-fg-brand";

function DocumentPreviewBody({ name, type = "file", meta, onView, onDownload, style = {} }) {
  const t = TYPE[type] || TYPE.file;
  return (
    <div className={CARD} style={style}>
      <span className={ICON_WELL} style={{ background: t.color + "1A", color: t.color }}>
        <i className={"ph-fill " + t.icon} />
      </span>
      <div className="flex-1 min-w-0">
        <div className={NAME}>{name}</div>
        {meta && <div className="text-xs text-fg-tertiary font-data mt-px">{meta}</div>}
      </div>
      <div className="flex gap-1 shrink-0">
        {onView && <Tooltip label="View" side="top"><button type="button" onClick={onView} aria-label="View" className={ACT}><i className="ph ph-eye" /></button></Tooltip>}
        {onDownload && <Tooltip label="Download" side="top"><button type="button" onClick={onDownload} aria-label="Download" className={ACT}><i className="ph ph-download-simple" /></button></Tooltip>}
      </div>
    </div>
  );
}

/* State contract — a single value has no "empty", so loading and error only. */
export function DocumentPreview(props) {
  const state = resolveDataState({
    loading: props.loading, error: props.error, onRetry: props.onRetry,
    shape: "card", height: 120,
  });
  if (state !== false) return <div className="w-full" style={props.style || {}}>{state}</div>;
  return <DocumentPreviewBody {...props} />;
}
