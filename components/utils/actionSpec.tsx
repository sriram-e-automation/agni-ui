import React from "react";
import { Button } from "../primitives/Button/Button.tsx";

/* AgniUI · actionSpec (internal)
   The one declarative action contract shared by the grouped components
   (PageTitleBar · PageControls · RecordTable · ApprovalPanel · StatsOverview).

   Why it exists: those groups used to expose a single `actions: ReactNode`
   slot, which meant every consumer hand-built its own Button row and the
   groups could not reason about role gating, sizing or disabled state. A spec
   object lets the group own all of that while the ReactNode slot stays as the
   escape hatch for anything genuinely bespoke.

   Exports are lower camelCase on purpose — a PascalCase export from any
   component file lands on the public window namespace as if it were a
   component. */

export interface ActionSpec {
  key?: string;
  label?: React.ReactNode;
  /** Phosphor class, e.g. "ph-plus". */
  icon?: string;
  /** Button variant. @default "secondary" */
  kind?: "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "brand-soft";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  round?: boolean;
  active?: boolean;
  disabled?: boolean;
  /** Reason shown as the tooltip while disabled. */
  disabledReason?: string;
  loading?: boolean;
  /** Drop the action entirely (vs. `disabled`, which keeps it visible). */
  hidden?: boolean;
  title?: string;
  /** Secondary choices — renders Button's split treatment. */
  items?: { label: React.ReactNode; icon?: string; onClick?: () => void; danger?: boolean }[] | null;
  /** Same contract as core/RoleGate: shown only if the viewer's role matches. */
  roles?: string[];
  onClick?: () => void;
}

export function visibleActions(list: ActionSpec[] | null | undefined, role?: string): ActionSpec[] {
  if (!list || !list.length) return [];
  return list.filter(a => a && !a.hidden && (!a.roles || !a.roles.length || !role || a.roles.indexOf(role) > -1));
}

export function renderActions(
  list: ActionSpec[] | null | undefined,
  opts: { role?: string; size?: "sm" | "md" | "lg"; disabled?: boolean; keyPrefix?: string } = {},
): React.ReactNode[] {
  const { role, size = "md", disabled = false, keyPrefix = "a" } = opts;
  return visibleActions(list, role).map((a, i) => {
    const off = disabled || !!a.disabled;
    return (
      <Button
        key={a.key || keyPrefix + i}
        variant={a.kind || "secondary"}
        size={a.size || size}
        icon={a.icon ? <i className={"ph " + a.icon} /> : undefined}
        iconOnly={a.iconOnly}
        round={a.round}
        active={a.active}
        disabled={off}
        loading={a.loading}
        items={a.items || null}
        title={off && a.disabledReason ? a.disabledReason : (a.title || (a.iconOnly && typeof a.label === "string" ? a.label : undefined))}
        onClick={a.onClick}
      >
        {a.iconOnly ? undefined : a.label}
      </Button>
    );
  });
}

/* ── Export action ─────────────────────────────────────────────────────────
   Its own shape rather than an ActionSpec, because export is the one action
   every records page has and it carries a format list. `enabled: false`
   renders it DISABLED with a reason — hiding an export a role can't use makes
   the page look different per user; disabling it explains itself. Omit the
   prop (or pass null) to leave it off the page entirely. */

export interface ExportActionSpec {
  /** @default true. false → visible but disabled, with `disabledReason`. */
  enabled?: boolean;
  /** @default "Export" */
  label?: string;
  /** @default "ph-export" */
  icon?: string;
  /** @default "secondary" */
  kind?: ActionSpec["kind"];
  iconOnly?: boolean;
  /** Spinner while the file is being produced. */
  loading?: boolean;
  /** Two or more → split button with a format menu; one/none → plain button. */
  formats?: { key: string; label: React.ReactNode; icon?: string }[];
  /** @default "Not available for your role" */
  disabledReason?: string;
  roles?: string[];
  onExport?: (formatKey?: string) => void;
}

export function exportToAction(x: ExportActionSpec | null | undefined, role?: string): ActionSpec | null {
  if (!x) return null;
  if (x.roles && x.roles.length && role && x.roles.indexOf(role) < 0) return null;
  const on = x.enabled !== false;
  const formats = x.formats || [];
  return {
    key: "export",
    label: x.label || "Export",
    icon: x.icon || "ph-export",
    kind: x.kind || "secondary",
    iconOnly: x.iconOnly,
    disabled: !on,
    disabledReason: on ? undefined : (x.disabledReason || "Not available for your role"),
    loading: x.loading,
    items: formats.length > 1 && on
      ? formats.map(f => ({ label: f.label, icon: f.icon, onClick: () => x.onExport && x.onExport(f.key) }))
      : null,
    onClick: () => x.onExport && x.onExport(formats.length === 1 ? formats[0].key : undefined),
  };
}
