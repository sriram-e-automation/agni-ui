# RecordDetailModal — update instructions for the AgniUI design system

Drop this folder into the AgniUI project and follow the steps below. The goal:
**one generic record-detail dialog**, so `ProcurementRequestModal` (1,733 lines
in the consuming project) can be deleted and every future desk module gets the
same dialog without forking it.

Files in this package:

| File | What to do with it |
| --- | --- |
| `RecordDetailModal.d.ts` | The target contract. Replaces `components/workflow/RecordDetailModal.d.ts`. |
| `INSTRUCTIONS.md` | This file. |

---

## Naming — settled, do not re-open

Under the AgniUI rule (name the shape, not the business object; nouns never
verbs; capability in props), none of this earns a new modal name.

- **`RecordDetailModal`** — extended in place. No `ProcurementRequestModal`,
  no `RecordWorkspaceModal`, no v2 file.
- **`StageList`** — one genuinely new shape, lands in `components/data/`.
  Ordered stage rows with a state tone, a meta line and row actions. Nothing
  procurement in it; usable outside a dialog.
- **`DetailPaneButton`** — does not exist. The pane toggle is `Button` with
  `iconOnly` + `active`.
- **`StagePreviewModal`** — does not exist. A stage's preview content is
  domain data; the consuming page owns it and opens it from `onStageAction`.

New nouns introduced by the contract, all shape-named: `RecordSection`,
`RecordStage`, `RecordPane`, `RecordFlow`, `RecordAction`, `RecordParent`,
`RecordAssignment`, `DetailField`, `Person`.

---

## What changes, and why

Every item below exists today as hardcoded markup in one consuming page. Each
becomes a declarative prop.

1. **`sections[]`** — the tab strip. Today: three fixed tabs
   (`record.basics` / `assignment` / `execution`) plus a documents toggle.
   Target: an array the page supplies, each entry either a `rows` field grid or
   arbitrary `content`, gated by `roles` and `when` (status).
2. **`section.search` · `filters` · `scroll`** — a section can carry a search
   field, segmented/select filters and its own scroll region. The modal renders
   the DS `Input` and controls, applies the filtering, and hands the survivors
   to `content(ctx)`. Consuming pages currently hand-roll a raw
   `<input data-agni-input>`; that must not survive the migration.
3. **`stages[]` + `StageList`** — an ordered pipeline with a tone chip per
   state (`todo · active · done · blocked · skipped`) and row actions.
4. **`essentials[]`** — the collapsible top section takes its fields from the
   page instead of hardcoding six. `defaultEssentialsOpen` and
   `essentialsSummary` stay as they are.
5. **`panes[]` · `defaultPane` · `pane` / `onPaneChange`** — the right rail
   becomes a list. `audit` and `effort` stay built in. `defaultPane` accepts
   `null` for "all closed" — the current `defaultAuditOpen` boolean cannot
   express that, which is why one consumer hardcoded `useState(null)`.
   Keep `defaultAuditOpen` working as a deprecated alias for one release.
6. **`flows[]` · `flow` · `defaultFlow` · `onFlowChange`** — a task that takes
   over the dialog body: breadcrumb above the content, page-supplied body and
   footer, auto-expand to full page (`expand`, default true), pane toggles
   locked (`lockPanes`, default true). This is the generic form of the
   grouping / quotation / decision / purchase-order sub-flows that one page
   currently runs by mutating internal state.
7. **`expanded` / `onExpandedChange`** — the full-page toggle becomes
   optionally controlled, so a page can force full page when a flow opens.
   `expandable` and `defaultExpanded` keep their current behaviour.
8. **`parent`** — a back breadcrumb to the record this one was opened from.
   Replaces a page-side "show parent" boolean.
9. **`assignment`** — an editable owner row beside the workflow (label, value,
   `options: Person[]`, `editable`, `roles`, `onChange`). Replaces a page-level
   `people` array plus a bespoke override menu.
10. **`role`** — the viewer's role, matched against every `roles` list on
    sections, panes, actions and assignment. Same contract as `core/RoleGate`;
    reuse it internally rather than re-implementing the check.
11. **`actions[]` + `onAction(key, remark)`** — the footer becomes declarative.
    Each action carries its own confirmation copy and remark rule
    (`none · optional · required`). The three current shapes (approve/reject,
    mark completed, resolution banner) must still render identically when a
    page passes no `actions`. `footer` remains the escape hatch.
12. **Data states stay** — `loading` (skeleton in the frame), `error` +
    `onRetry` (ErrorState), `readOnly`, `busy`. A consumer dropped all four when
    it forked; the merged component must keep them, and every section resolves
    its own state through `DataState`.

---

## Order of work

1. Land `components/data/StageList.tsx` + `.d.ts` + a specimen card showing all
   five stage states. *A component is not done until its card shows its states.*
2. Add the additive props to `components/workflow/RequestDetailModal.tsx`
   (the internal renderer) behind their current defaults, so every existing call
   site renders byte-identically with no prop changes.
3. Replace `components/workflow/RecordDetailModal.d.ts` with the file in this
   package.
4. Update `components/workflow/request-detail.card.html` to show: sections with
   search + filters, a stage section, `defaultPane={null}`, a flow, and the
   loading / error / readOnly states.
5. Regenerate `_ds_bundle.js`, `_ds_manifest.json` and `docs/Master Sheet.html`.
   Never hand-edit them.
6. Add `StageList` to the `data` family list in `SKILL.md` and to
   `docs/Coverage Checklist.html` phase 7 (the `loading`/`empty`/`error`
   contract applies to it too).

## Acceptance

- Existing call sites compile and render unchanged with no prop edits.
- A page can express: collapsible essentials · full-page toggle · approval
  workflow with confirmations · activity log closed on open · a searchable,
  scrollable section · a stage pipeline — passing only props.
- No string in `workflow/` or `data/` names a business object (no "request",
  "RFQ", "purchase", "vendor") outside the `workflow` family's existing
  approval vocabulary.
