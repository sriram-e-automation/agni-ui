# Changelog — AgniUI

All notable changes to this design system. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Versioning starts fresh at 1.0.0 (Sep 2026).** Everything built before this release — the token architecture, the component families, the Aug 2026 naming merge, the Tailwind v4 migration — is the *content* of 1.0.0, not a history of releases. Nothing was published under an earlier number, so there is nothing for a consumer to upgrade from.

**Two levels of version live in this repo and they mean different things.**

- **Package version** — the number consumers install (`@agnikul/agniui@1.0.0`). One number for the whole library. It is what this file logs.
- **Component version** — the `@version` tag in each `<Name>.d.ts`. It answers "has *this* component's contract changed since I last read its card?" without diffing the whole release. Every component starts at `1.0.0`.

Bump rules are identical at both levels:

| Change | Bump |
| --- | --- |
| A prop removed or renamed · a default changed · a component renamed or retired · a token deleted | **major** |
| A prop added · a variant, state or component added · a token added | **minor** |
| A visual fix inside an existing contract · docs · a Tailwind class swap with no visual delta | **patch** |

A component's major bump forces at least a **minor** on the package; two or more component majors in one release make it a package major. A visual change with no API change is still a package **patch** and a component **patch** — write it down, because "nothing changed in the props" is exactly the release that surprises people.

The SOP for producing an entry here is in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## [Unreleased]

_Nothing yet._

---

## [1.0.0] — 2026-09-01

First versioned release. The system as it stands: foundations, ten component families, the seven grouped page blocks, and the Tailwind v4 layer.

### Foundations

- **Three token layers** — `brand` → `colors` (semantic, paired light + dark) → `components` (component roles). No component holds a hardcoded colour, so a re-skin is one file.
- **Modes as attributes, not props** — `data-theme` (defaulting to the OS preference), `data-density` (compact · comfortable · spacious), `data-scale` (sm · md · lg · xl). 726 tokens across 32 theme scopes.
- **Accessibility validated per mode** — body text ≥ 4.5:1, large/bold and non-text ≥ 3:1, computed rather than assumed; a solid 2px focus ring on `:focus-visible`; a 44px touch floor at the phone breakpoint in every density.
- **Type** — Plus Jakarta Sans (display) · Poppins (UI) · IBM Plex Mono (data), all SIL OFL and freely embeddable.

### Components — 134 exports, 66 specimen cards

- **core · forms · navigation · data · charts · feedback · containment · workflow · layout · chrome.** Families are named after the *shape* of what they hold, not the domain they serve; `workflow/` is the single deliberate exception, holding the pieces that genuinely know what a request and an approval are.
- **One name per job.** Sixteen components collapsed into five and two dropped their domain word under the rule on `guidelines/rules/component-naming.card.html`: `Tag`, `Button`, `Select`, `Panel`, `Notice`, `Tabs`, `FileUpload`, `Loading`, `ConfirmModal`, `RecordCard`, `RecordDetailModal`, `RecordForm`. Retired names keep their `.tsx` with an `@internal` header naming the replacement, so internal imports resolve; they have no `.d.ts` and no card, so they are not part of the documented surface.
- **One state contract**, resolved in `DataState`: error → loading → empty → content, in that fixed precedence, so a failed fetch never reads as an empty region.
- **A component is not done until its card shows its states.** 66 cards, each with a live instance and the full state matrix.

### The seven grouped page blocks

A module page is assembled from these, not from forty primitives. Each owns a region, composes existing DS parts rather than redrawing them, and exposes everything inside it through props.

| Group | Family | Owns |
| --- | --- | --- |
| `PageTitleBar` | chrome | Back · icon tile + title + status badge · subtitle · scope tabs with counts · view switcher · action group |
| `PageControls` | data | Search · facets · date range · sort · column chooser · view switcher · action group · bulk bar · pagination |
| `RecordTable` | data | The whole records region — PageControls + DataTable + per-row action column + selection + pagination |
| `StatsOverview` | data | The dashboard block — heading + date range + actions, QuickStats strip, auto-fit ChartCard grid |
| `ApprovalPanel` | workflow | The in-page approval block — stage + status, stepper, role-gated decisions + required note, audit trail |
| `RecordForm` | workflow | The create / edit surface — FormSection grids, validation, review & submit |
| `RecordDetailModal` | workflow | The record dialog — the same approval parts, opened over a list |

**Every group takes its actions as data, not JSX.** `primaryAction`, `secondaryActions` and `exportAction` are `ActionSpec` / `ExportActionSpec` objects (`components/core/actionSpec`), carrying `kind` · `size` · `iconOnly` · `disabled` + `disabledReason` · `loading` · `items` (split treatment) · `roles`. The `actions` ReactNode slot survives on every group as the escape hatch and renders after the declarative set.

Three decisions inside that contract are deliberate, and two of them point in opposite directions:

- **A withheld export is disabled, not hidden** (`exportAction.enabled: false`, with `disabledReason` as its tooltip). A records page that changes shape per viewer looks broken to whoever asks why a colleague has a button they don't.
- **A withheld row-action column is hidden.** The opposite call for the opposite reason: a column that renders empty on every row is whitespace advertising nothing.
- **Row actions may be a function of the row** (`rowActions={row => […]}`). Availability usually depends on the record, not only the viewer — an approved request cannot be approved again.

### Styling — Tailwind v4 over the same tokens

Migration complete (tranche 11). `@theme inline` re-exports the semantic token layer under Tailwind's namespaces, so utilities resolve at the use site and the system contains **zero `dark:` variants** — theming stays a pure token swap. Spacing rides `--spacing`, so `p-4` tracks `data-scale`; control heights ride `h-control-*`, so they track `data-density` and the coarse-pointer floor.

Fourteen deliberate exemptions, not backlog: `charts` and `GanttTimeline` (runtime-computed SVG geometry), `Loading` (per-shape skeleton bones), and `Cluster` / `Stack` (their props *are* style values). Detail and per-tranche findings: `tailwind/README.md`.

### Process

- `@version` on every component contract; `CHANGELOG.md`; `CONTRIBUTING.md` (bump table, changeset format, four-check review gate, three-release retirement sequence); `guidelines/rules/versioning.card.html`.
- `PACKAGING.md` — the path to a git repo and a registry as `@agnikul/agniui`.

### Known open items

- Six data components accept some but not all of `loading` / `error` / `empty`: `AttachmentRow`, `DocumentPreview`, `EditableTable`, `EventRow`, `PersonCard`, `StatCard`.
- Only the grouped components declare a `States:` line in their doc comment; elsewhere the state surface is inferred from props.
- ~~Three segmented pill tracks carried three sets of values.~~ Resolved Sep 2026 — unified on the `--agni-neutral-100` / literal `#fff` style across `TabsStrip`, `SegmentedControl` and `PageTitleBar`. is recorded rather than done in passing.

Full open/closed ledger: `docs/Audit Findings.html`. Component-by-component reference: `docs/Master Sheet.html`.
