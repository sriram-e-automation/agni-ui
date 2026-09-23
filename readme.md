# AgniUI — Agnikul Cosmos ERP Design System

The design system governing the **custom React layer** of Agnikul Cosmos's ERP platform (a bespoke React front end over a custom Frappe / ERPNext application). AgniUI provides the foundational layer — layout, color, typography — plus a kit of interactive React primitives and a canonical "Desk App" shell that every internal operations module (Administration, Product, Business, Process & Support Operations) is built from.

> **Brand in one line:** Agnikul's forest-green flame on launch-sky navy. *"Launch anywhere, anytime, affordably."*

---

## Fonts (open-licensed)

The brand uses **Plus Jakarta Sans** (display), **Poppins** (UI/body) and **IBM Plex Mono** (data/numerics) — all open-licensed (SIL OFL) and served from Google Fonts. Plus Jakarta Sans is the geometric-humanist display face; it replaced the commercially-licensed face an earlier brief specified, so the whole type system is freely embeddable. **This substitution is permanent** (decided Aug 2026). Display falls back Plus Jakarta Sans → Poppins → system.

---

## What's in here (index / manifest)

| Path | What it is |
| --- | --- |
| `styles.css` | **Root stylesheet — consumers link this one file.** `@import`s the whole token closure. || `tokens/system-theme.css` | **Generated.** Re-applies the dark tokens under `@media (prefers-color-scheme: dark)` and adds an explicit `[data-theme="light"]` scope, making the OS preference the default mode. |
| `tokens/` | 3-layer CSS custom properties: `brand` → `colors` (semantic, light+dark) → `components`, plus `fonts`, `typography`, `spacing` (+ density), `layout` (containers · safe areas · sizing/constraint/auto-layout utilities), `elevation`, `states`, `charts` (data-viz palette), `forms` (sheet + field-grid rhythm), `base`. |
| `components/core/` | `Button` · `Avatar` · `AvatarStack` · `Tag` · `Card` · `DropdownMenu` · `RoleGate` (role-based visibility) · `OptionRow` (icon + title + description choice row — trackers, support options, settings) · `ActionTile` (module landing-page launchpad tile) · `Rating` (star scale, read-only or settable) · `actionSpec` (internal — the `ActionSpec` / `ExportActionSpec` contract every grouped component takes its actions as) |
| `components/forms/` | `Input` · `Textarea` · `Select` · `DatePicker` · `QuantityStepper` · `RichTextEditor` · `FileUpload` · `Checkbox` · `Switch` · `Radio`/`RadioGroup` · `FormField` (label + control + hint/error) · `FormSection` (brand-rule heading + field grid) |
| `components/navigation/` | `Tabs` · `Breadcrumbs` · `CommandPalette` |
| `components/data/` | `DataTable` · `List` · `TreeView` · `Pagination` · `EditableTable` · `GanttTimeline` (grouped scheduling bars — group-by rows · navigator row with ‹ Today › paging + day/week/month/quarter/year toggle · status-toned bars · today line) · `Calendar` (record calendar view type — month/week/year grid keyed by each record's date · status-toned per-day count chips · searchable selected-day panel · ‹ Today › nav) · `StageList` (ordered stage pipeline — five states · row actions) · `QuickStats` (click-to-filter stat card strip) · `DateRangeFilter` (granularity tabs + period navigator + custom range popover) · `FilterPanel` (facet popover — the facets half of the filter pair) · `FilterBuilder` (AND-chained rule builder — the rules half) · `PageControls` (the one records toolbar — search · facet filters · date range · sort · column chooser · view switcher · declarative export/primary/secondary actions · bulk-selection bar · pagination) · **`RecordTable`** (the whole records region — PageControls + DataTable + per-row action column + selection + pagination) · **`StatsOverview`** (the dashboard block — QuickStats strip + auto-fit ChartCard grid) · `RecordCard` (one record contract, presets kanban · approval · task) · `KanbanBoard` / `PersonCard` · `OrgTree` · `BulkActionToolbar` · `DocumentPreview` · **the record-detail family:** `DetailSection` (read-only counterpart to FormSection) · `DetailList` + `KeyValueRow` + `CopyButton` · `StatCard` (one measured figure) · `AttachmentRow` (file row with uploading/failed states) · `EventRow` (agenda entry on the shared tone vocabulary) |
| `components/charts/` | `BarChart` · `LineChart` · `PieChart` · `DonutChart` · `ScatterChart` · `SparkLineChart` · `Gauge` · `RadarChart` · `Heatmap` (+ `ChartKit` engine) · `ChartCard` (title · subtitle · legend framing) — **MUI X Charts–compatible API** (`series` / `xAxis` / `yAxis` / `radar`), themed SVG with animated entrance (bars rise · arcs sweep · lines draw · slices & cells pop) + highlight-on-hover, interactive legends, light+dark via the `--chart-*` palette, all reduced-motion aware. No CSS-in-JS / external lib. |
| `components/feedback/` | `Notice` (inline banner · toast) · `Tooltip` · `Modal` · `Progress` · `EmptyState` · `ErrorState` (failure block — message · detail · retry; consumed by DataTable / KanbanBoard / Card / RecordDetailModal `error` props) · **`Loading`** (shape-matched skeleton for every component family, + `Spinner` / `LoadingOverlay`) · **`DataState`** / `resolveDataState` (one implementation of the error → loading → empty → content precedence; data components call it rather than re-implementing the order) |
| `components/containment/` | `Panel` (inline · `variant="sheet"` bottom slide-up · `variant="drawer"` side panel over a scrim) · `Accordion` |
| `components/workflow/` | The domain-bound approval-workflow layer (the one family that knows what a request/approval is): `ApprovalStepper` (hover-interactive) · `AuditTrail` · **`ApprovalPanel`** (the in-page approval block — stage + stepper + role-gated decisions + required note + audit) · `RecordForm` · `RecordDetailModal` (two-pane "View request" dialog: workflow + audit + approve/reject, plus an Effort-log pane and a Mark-as-completed action for assigned tasks). |
| `components/layout/` | `AppShell` · `Bar` · `Cluster` · `Stack` |
| `components/chrome/` | `ShellHeader` · `ShellFooter` · `NavRail` (drawer ⇄ icon rail ⇄ overlay — overlay mode owns its own scrim and slide-in panel) · `PageTitleBar` · **`PageHeader`** · `WorkspacePane` · `AppSwitcher` · `SettingsMenu` · `NotificationsMenu` · `PanelKit` · `Theme` (theming helper) |
| `templates/admin-ops/` | **Desk App Scaffold** — the canonical full-screen desk shell: list / kanban / card / timeline (Gantt) / calendar content views, a Crew directory page (DataTable roster · OrgTree reporting line-up · member profile), workspace side panels (Approvals · Tasks with effort logging · Calendar · Support · AI). |
| `guidelines/foundations/` | Foundation specimen cards — Layout (grid · sizing · auto-layout · scaling) · Colors · Type · Spacing · Brand · Accessibility. |
| `guidelines/rules/` | How to use the system — **`component-naming.card.html`** (the naming rule, the merge test, the Aug 2026 merge table), **`naming.card.html`** (one word per concept, the state contract, the head-to-head decisions on record), **`patterns.card.html`** (page anatomy · the five content views · record lifecycle · record-detail page), **`groups.card.html`** (the seven page blocks, the shared `ActionSpec` contract, the pairing rules) and **`versioning.card.html`** (the two version levels, bump rules, the changeset, the review gate, the retirement sequence). |
| `tailwind/` | The Tailwind v4 migration layer — `agniui.theme.css` (`@theme inline` re-export of layer 2), `agniui.css`, `build.html`, the migrated Button card, and `tailwind/README.md` with the per-component rules. |
| `assets/logos/` | Wordmark, flame monogram, Automation badge, full logo — the only brand graphics. |
| `SKILL.md` · `thumbnail.html` | The consuming-project skill prompt, and the homepage tile. |
| `templates/repo-scaffold/` | **The publishable-package scaffold** for `sriram-e-automation/agni-ui` — `src/index.ts` (the public surface), `package.json`, the Vite library build, Changesets config, CI + release workflows, PR template. Its `README.md` is the step-by-step first push. It sits under `templates/` because those files are repo sources, not design-system sources, and must not be compiled into the bundle. |
| `github.md` | The repository association and sync record. |
| `CHANGELOG.md` | The release log. Package-level semver, generated from changesets — do not hand-edit released sections. |
| `CONTRIBUTING.md` | **The change SOP** — what to check before changing anything, how to bump the two version levels, how to write the changeset, the four-check review gate, and the three-release retirement sequence. |
| `PACKAGING.md` | **Getting AgniUI into a git repo and onto a registry** — registries and scopes explained from scratch, the repo layout, `package.json`, the GitHub Actions release workflow, and how a consuming app installs it. |
| `_ds_bundle.js` · `_ds_manifest.json` · `_adherence.oxlintrc.json` | **Generated — never hand-edit.** Rewritten from source on every change. |
| `uploads/` | Original source material: brand SVGs and reference screenshots. |
| `docs/Audit Findings.html` | **Open/closed ledger** — every outstanding item across the system, what's already shipped, and decisions recorded as closed on purpose. Supersedes the five prior point-in-time audits. |
| `docs/Master Sheet.html` | **One-page index of the whole system** — tokens by layer, every component with its variants and states, specimen cards by group, the bundle contract, the four patterns and the template. Generated from `_ds_manifest.json` + the components' `.d.ts`, so it can't drift; regenerate rather than hand-edit. |

## Components (full index)

**How the families are organised.** Families are named after the **shape** of what they hold, not the domain they serve — `data/` is anything that displays records, `core/` anything shape-only, `chrome/` the persistent frame. The one exception is **`workflow/`**, the approval layer that genuinely knows what a request, approval and audit entry are; if a component would work unchanged in a product with no approvals, it does not belong there. (Aug 2026: `erp/` was retired under this rule — 9 domain-bound pieces to `workflow/`, 9 shape-generic ones to `data/`, `RoleGate` to `core/`. Folder moves don't change the runtime namespace; every component is still reached flat off the bundle.)

**A component is not done until its card shows its states.** Shipping in the bundle is half of it — without a specimen showing variants and states, the next person re-invents it in their page. Both rules, and the head-to-head decisions behind them, are on `guidelines/rules/naming.card.html`.

**Merged, Aug 2026 — one name per job.** Sixteen components collapsed into five and two dropped their domain word, under the rule in `guidelines/rules/component-naming.card.html`: name the shape not the business object, nouns never verbs, capability in props.

| Now | Absorbed | Selector |
| --- | --- | --- |
| `Tag` | Badge · StatusChip | `status` · `tone` · `variant="chip"` |
| `Button` | IconButton · SplitButton | `items` · `iconOnly` / `round` / `active` |
| `Select` | MultiSelect · SearchSelect · CreatableSelect · UserSelect · MultiUserSelect | `multiple` · `searchable` · `creatable` · `users` |
| `Panel` | Sheet · Drawer | `variant="inline" | "sheet" | "drawer"` |
| `Notice` | Toast · Banner | `variant="inline" | "toast"` |
| `Tabs` | SegmentedControl | `tabs` (page strip) · `items` (pill track) |
| `FileUpload` | FileDropzone | `variant="dropzone" | "basic"` |
| `Loading` | Skeleton | `shape`, incl. `block` · `circle` |
| `ConfirmModal` | ReviewSubmitModal · SubmitConfirmModal · DiscardConfirmModal · BulkActionConfirm · ImportRecordsModal | `variant="review" | "submitted" | "discard" | "bulk" | "import"` |
| `RecordCard` | KanbanCard · ApprovalCard · TaskCard | `preset="kanban" | "approval" | "task"` |
| `RecordDetailModal` | RequestDetailModal | renamed |
| `RecordForm` | RequestForm | renamed |

Retired names are **not deleted**: each keeps its `.tsx`, loses its `.d.ts` and its specimen card, and gains an `@internal` header naming its replacement. Imports inside the library keep resolving; the documented surface is the merged set.

- **core** — Button · Avatar · **AvatarStack** · Tag · Card · DropdownMenu · RoleGate · **OptionRow** · **ActionTile** · **Rating**
- **forms** — Input · Textarea · Select · DatePicker · QuantityStepper · RichTextEditor · FileUpload · Checkbox · Switch · Radio · RadioGroup · **FormField** · **FormSection**
- **navigation** — Tabs · Breadcrumbs · CommandPalette
- **data** — DataTable · List · TreeView · Pagination · EditableTable · GanttTimeline · Calendar · **QuickStats** · **DateRangeFilter** · **FilterPanel** (facets) · **FilterBuilder** (rules) · **PageControls** · **RecordTable** · **StatsOverview** · **StageList** · **RecordCard** (one record contract, three presets: kanban · approval · task) · KanbanBoard · PersonCard · OrgTree · BulkActionToolbar · DocumentPreview · **DetailSection** · **DetailList** (+ KeyValueRow · CopyButton) · **StatCard** · **AttachmentRow** · **EventRow**
- **charts** — BarChart · LineChart · PieChart · DonutChart · ScatterChart · SparkLineChart · Gauge · RadarChart · Heatmap · ChartKit · **ChartCard** (title · subtitle · legend framing for one chart)
- **feedback** — **Notice** (inline banner · toast) · Tooltip · Modal · Progress · EmptyState · **ErrorState** · **Loading** · **DataState** (the state contract in one place — every data component resolves error → loading → empty → content through it)
- **containment** — Panel (inline · sheet · drawer) · Accordion
- **workflow** — ApprovalStepper · AuditTrail · **ApprovalPanel** · **RecordForm** · **RecordDetailModal** · **ConfirmModal** (review · submitted · discard · bulk · import) — the one family that names the domain; nothing here belongs in a product without approvals
- **layout** — AppShell · Bar · Cluster · Stack
- **chrome** — **ShellHeader** · **ShellFooter** · **NavRail** · **PageTitleBar** · WorkspacePane · AppSwitcher · SettingsMenu · NotificationsMenu · **PanelKit** (PanelIconMenu · MenuRow · PanelEmpty) · Theme

Shell chrome: `ShellHeader` (brand cell · module tile + breadcrumb · NotificationsMenu bell · SettingsMenu gear · AvatarStack presence · profile menu) and `ShellFooter` (signature + copyright) are the canonical desk-app top/bottom bars — the Desk App Scaffold consumes them from the bundle rather than hand-rolling chrome.

### Grouped components — the seven page blocks

A module page is assembled from seven composed components, not from forty primitives. Each owns a region of the page, composes existing DS parts rather than redrawing them, and exposes everything inside it through props. They live in their normal families (a group is a component, not a folder) and share one card group, **Groups**, plus the index card `guidelines/rules/groups.card.html`.

| Group | Family | Ver | Owns |
| --- | --- | --- | --- |
| `PageTitleBar` | chrome | 1.0.0 | Back · icon tile + title + status badge · subtitle · scope tabs with counts · view switcher · action group |
| `PageControls` | data | 1.0.0 | Search · facets · date range · sort · column chooser · view switcher · action group · bulk bar · pagination |
| `PageHeader` | chrome | 1.0.0 | The whole page top — PageTitleBar over PageControls in one card, optional QuickStats strip, sticky wrapper, hoisted role/disabled/loading |
| `RecordTable` | data | 1.0.0 | The whole records region — PageControls + DataTable + per-row action column + selection + pagination |
| `StatsOverview` | data | 1.0.0 | The dashboard block — heading + date range + actions, QuickStats strip, auto-fit ChartCard grid |
| `ApprovalPanel` | workflow | 1.0.0 | The in-page approval block — stage + status, stepper, role-gated decisions + required note, audit trail |
| `RecordForm` | workflow | 1.0.0 | The create / edit surface — FormSection grids, validation, review &amp; submit |
| `RecordDetailModal` | workflow | 1.0.0 | The record dialog — the same approval parts, opened over a list |

**Every group takes its actions as data, not JSX.** `primaryAction`, `secondaryActions` and `exportAction` are `ActionSpec` / `ExportActionSpec` objects (`components/core/actionSpec`), so the group role-gates, sizes and disables its own actions instead of trusting each page to do it the same way. The `actions` ReactNode slot survives on every group as the escape hatch and renders after the declarative set.

Three decisions inside that contract are deliberate and go in opposite directions:

- **A withheld export is disabled, not hidden** (`exportAction.enabled: false`, with `disabledReason` as its tooltip). A records page that changes shape per viewer looks broken to whoever asks why a colleague has a button they don't.
- **A withheld row-action column is hidden.** The opposite call for the opposite reason: a column that renders empty for every row is whitespace advertising nothing. If a viewer's role matches no row action, `RecordTable` drops the trailing column entirely.
- **Row actions may be a function of the row** (`rowActions={row => […]}`). Availability usually depends on the record, not only the viewer — an approved request cannot be approved again.

Pairing rules: when `PageTitleBar` and `PageControls` are both on screen the **title bar owns the view switcher** — `PageHeader` enforces this for you and is the preferred way to mount the pair; when using `RecordTable`, do not also mount `PageControls` or `Pagination` — pass them through `controls` and `pagination`; use `ApprovalPanel` when the approval sits on a record page and `RecordDetailModal` when it opens over a list.

All components are bundled and reached at runtime via `window.AgniUIAgnikulERPDesignSystem_153d9e` (run `check_design_system` to confirm the namespace). Cards `<script src>` the generated `_ds_bundle.js` — never the raw `.jsx`. Current totals: **134 named exports — 129 renderable components + 5 non-component exports** (the `ChartKit` chart engine, the `PanelKit` side-panel bundle, the `Theme` helper, `LoadingShapes`, `REQUEST_FORM_DEFAULTS`) · **66 specimen cards** · **726 tokens**. `docs/Master Sheet.html` follows the same convention.

### Styling approach — Tailwind v4 over the same tokens

Components use **Tailwind v4 utility classes over the token layer** (migrated from inline styles that read CSS custom properties; complete Sep 2026). The 3-layer token architecture is unchanged and remains the source of truth; `tailwind/agniui.theme.css` re-exports layer 2 under Tailwind's namespaces via `@theme inline`, so theming stays a pure token swap and the system contains **zero `dark:` variants**. Full detail, naming changes and per-component rules: **`tailwind/README.md`**.

Two mechanisms make it work, and both are load-bearing:

- **`@theme inline`** — plain `@theme` resolves `var(--surface-card)` at `:root`, freezing every utility at its light value and silently breaking dark mode. `inline` bakes the reference into the utility body so it resolves at the use site.
- **Cascade layers** (`tokens/layers.css`) — AgniUI's reset now sits in `@layer base`. While it was unlayered, `button, input, select, textarea { color: inherit }` beat *every* Tailwind text-colour utility, because unlayered CSS wins over any layer regardless of specificity.

Spacing rides `--spacing: calc(var(--u) * var(--scale))`, so `p-4`/`gap-2` track `data-scale` automatically and stay 1:1 with `--space-N`. Control heights ride `data-density` instead, via named utilities (`h-control`, `h-row`, `py-cell`).

**Status: complete (Sep 2026, tranche 11).** Every component family is migrated, including the six picker bodies. What remains is deliberate exemption, not backlog: `charts/` SVG geometry, `Loading`'s per-shape skeleton geometry, and `Cluster` / `Stack`, whose props *are* style values passed through to the caller. Runtime-computed values stay inline everywhere by rule — chart geometry, Gantt bar offsets, progress widths, popover coordinates, identity-hash colours. Control heights now ride `h-control-*`, so every control tracks density, scale and the coarse-pointer 44px floor. Full detail, the per-tranche findings and the traps: **`tailwind/README.md`**.

---

## THEMING — three token layers

No component holds a hardcoded color. Every value resolves down a chain:

```
brand.primary (#3F7343)            ← tokens/brand.css      (admin-editable)
  → action.brand / agni-green-600  ← tokens/colors.css     (semantic, light+dark)
    → button.primary.bg            ← tokens/components.css  (component role)
      → <Button category="primary">
```

- **Layer 1 — `tokens/brand.css`**: raw brand values (`--brand-primary`, `--brand-accent`, `--brand-navy`…). Change one to re-skin everything.
- **Layer 2 — `tokens/colors.css`**: meaning-based semantics (`--action-brand`, `--surface-card`, `--status-*`, `--text-*`) that reference brand tokens and carry a **paired light + dark value**.
- **Layer 3 — `tokens/components.css`**: component-scoped roles (`--button-primary-bg`, `--input-bdr`, `--table-header-bg`…) referencing semantics.

**Mode switch is a token-level swap.** The default appearance follows the **operating system** (`prefers-color-scheme`); `data-theme="light" | "dark"` on any element overrides it for that subtree. Both are resolved in CSS by `tokens/system-theme.css` — generated from the `[data-theme="dark"]` blocks, so authoring stays one light value in `:root` and one dark value in the dark block. `Theme.resolveMode()` / `watchSystemMode()` / `storedMode()` expose the resolved mode to an app that needs it as a value. No duplicated component code. **Density** is the same mechanism (`data-density="compact|comfortable|spacious"`; **comfortable is the default** — the reference admin app opts into compact). **Accent** overrides are produced by `Theme.deriveAccentVars(accent, dark)` and spread as inline vars. Scope for this version is a **single global theme**; the layering does not block per-module theming later.

## ACCESSIBILITY (validated per mode)

- Targets: body text **≥ 4.5:1**, large/bold text **≥ 3:1**, and non-text (borders, icons, focus ring) **≥ 3:1**, encoded as `--a11y-*` tokens. Verified computationally in the July 2026 foundations audit; badge-tone foregrounds and the dark primary-action ramp were deepened to pass.
- Focus is a **solid 2px brand ring offset by 2px of surface** (`--focus-ring`, error variant `--focus-ring-error`) on `:focus-visible`, never removed without replacement. (Replaced the earlier translucent halo, which computed 1.32:1.)
- **Status-as-text** uses `--status-*-text` (deepened/lifted per mode); the base `--status-*` hue serves fills and ≥3:1 indicators. Form-control edges use `--border-control` (≥3:1).
- At the phone breakpoint every density mode raises controls to the **44px touch floor**.
- Status hues stay **constant across modes** — only tone/saturation shifts — so success/warning/error stay recognizable. Dark values are validated independently; a light-mode pass is **not** assumed to pass in dark.

## DECISIONS ON RECORD (Aug 2026)

The foundation decisions that were open are now closed. The reasoning for each is on `guidelines/rules/naming.card.html`.

- **Default appearance — the operating system.** An unattributed document follows `prefers-color-scheme`; `data-theme="light" | "dark"` overrides per subtree, and the Settings toggle persists a user override that then wins over the OS. Specimen cards pin `data-theme="light"` on `<html>` so their light halves stay light on a dark-mode machine.
- **Status terminology — two vocabularies, kept deliberately.** *Record status* (Pending · In Review · Approved · Rejected · On Hold) answers "has this been decided?"; *work status* (Yet to start · In progress · Overdue · Completed · Rejected) answers "how far along is it?". Pick by what the surface is about; never mix strings from the two sets in one control. Both resolve tone through the single map in `Tag`, so they can't drift apart visually. The board's `Approvals` lane is the one place both appear on screen.
- **Fonts — the substitution is permanent.** Plus Jakarta Sans (display) · Poppins (UI) · IBM Plex Mono (data) are the type system. The commercially-licensed face named in the original brief is not coming back; the whole stack is SIL OFL and freely embeddable.
- **The two scaffold-local parts stay local.** The attendance grid and the AI composer remain in the template, not the library. Promote each when a second module needs it — one consumer is not a pattern.
- **The state contract is closed.** All ten charts (once, in `ChartKit.chartState`), `GanttTimeline`, `Calendar`, `List`, `TreeView`, `QuickStats`, `OrgTree`, `AuditTrail`, `DocumentPreview`, `RecordCard`, `DetailList`, `StatCard`, `AttachmentRow`, `EventRow`, `PersonCard` and `EditableTable` take `loading` / `empty` / `error` + `onRetry` (only where that state genuinely applies — a single value has no "empty"), resolved through `DataState`. Every `.d.ts` carries an explicit `States:` line in its doc comment, generated from its own declared props. `docs/Audit Findings.html` is the current open/closed ledger.
- **The three segmented pill tracks are unified (Sep 2026).** `TabsStrip`'s segmented variant, `SegmentedControl` and `PageTitleBar`'s own view/tab tracks now share one bed (`--agni-neutral-100`) and one active state (`bg-action-brand`, literal `#fff` label) — previously each had its own values.
- **Every specimen card carries a usage snippet and a responsive note (Sep 2026).** Each of the 66 cards has a copy-paste JSX snippet and a desktop/tablet/phone behavior note grounded in the component's actual code (container-width switches, viewport-clamped popovers, token-driven sizing) rather than invented breakpoints.

## CONTENT FUNDAMENTALS

How copy is written across AgniUI desks (derived from the reference app):

- **Voice — neutral, operational, third-person.** This is internal back-office software, not marketing. Labels name the object or action plainly: *"New record", "Quick stats", "All applications", "Assigned to me"*. No "we", rarely "you" ("Records assigned to you will appear here").
- **Casing — Sentence case everywhere** for labels, buttons, menu items, page titles (*"New record"*, not *"New Record"*). **UPPERCASE** is reserved for tiny meta labels: table column headers and section eyebrows (*"RECORD ID", "CREATED", "APPEARANCE"*), always paired with `--tracking-wide`.
- **Terse over chatty.** Buttons are 1–2 words (*Export, Filter, Approve, View*). Empty states are one line of fact + one line of guidance: *"No records yet" / "Records assigned to you will appear here"*.
- **Status language is fixed, and there are two vocabularies.** *Record status* — Pending · In Review · Approved · Rejected · On Hold — for anything asking whether a record has been decided. *Work status* — Yet to start · In progress · Overdue · Completed · Rejected — for anything asking how far along it is. Reuse these exact strings; `Tag` resolves either to a tone. Don't mix the two sets in one control.
- **Numbers & IDs are monospace** (`--font-data`): record IDs (`REC-2401`), version tags (`v1.0.0`), counts, dates. This is a strong, consistent brand tell.
- **No emoji.** Iconography is carried entirely by Phosphor glyphs (see below).
- **Vibe:** calm, dense, trustworthy, engineering-grade. Mission-control, not consumer app.

---

## VISUAL FOUNDATIONS

- **Color** — A forest-green brand (`--agni-green-600` `#3F7343`, the flame & action color) on a near-white sage-gray page (`--surface-page` `#F6F7F6`) with white cards. Green is used decisively for the primary action, active nav, selection and brand moments; it is *not* sprinkled around. Status uses a 6-hue semantic set: success green `#079455`, warning amber `#DC6803`, info blue `#1570EF`, error red `#D92D20`, pending slate `#5C6B82`, blocked maroon `#9F1239`, each with a soft tint background and a deepened `--status-*-text` variant for status-coloured text. A separate **categorical chart palette** (`--chart-1`…`--chart-6`: green · blue · amber · violet · teal · rose, in `tokens/charts.css`) drives data-viz series and is tuned to read clearly on BOTH the light page and the dark navy (each value is lifted in the dark scope). **Dark theme** swaps to a deep launch-sky navy (`--agni-navy-900` `#060B2E`, cards `#0C1340`) with a lightened mint-green accent (`#7ED4A4`) for legibility.
- **Type** — Plus Jakarta Sans for headings (geometric-humanist, confident), Poppins for dense UI body (rounded, legible), IBM Plex Mono for IDs/numbers. Tight tracking on display, wide tracking on uppercase micro-labels. Scale runs small (desks are information-dense) but holds an **accessible floor for all age groups**: body 14px, table 13px, uppercase micro-labels 11px — hierarchy is carried by size + weight + colour together, never size alone. The scale is deliberately **px-fixed** (WCAG 1.4.4 is met via browser zoom; density-critical desks don't rescale with the browser font-size preference). Fonts load from Google Fonts via `@import` in `tokens/fonts.css` — no local `@font-face`, so the manifest lists no font files; an offline deployment should self-host and add `@font-face` there.
- **Spacing & density** — 8-point spacing system with 4px half-steps: majors (8·16·24·32·40·48·64·80) set structural rhythm; half-steps (4·12·20) handle dense ERP micro-spacing. Every sizeable token derives off an atomic unit `--u` (4px) × step × `--scale`, so the whole system scales coherently from one variable. Three density modes via `data-density` (default `comfortable`; the reference admin app opts into `compact`; `spacious` for review/approval surfaces). Panes own their padding (`--pane-pad`); the shell owns the frame.
- **Fractional scaling** — desk-level zoom via `--scale` rungs (`data-scale="sm|md|lg|xl"` → 0.875 / 1 / 1.125 / 1.25), snapped (not fluid) so pixels stay whole and tables crisp. Spacing, control heights (`--density-control-h`), and icons all track it; **type stays fixed** for ERP predictability. Because a custom property's `var()` resolves at the element that *declares* it, the derivations are re-declared on every `[data-scale]` scope — so scaling works document-wide (set on `<html>`) OR on a subtree. The Desk App Scaffold exposes it as a **Display size** control (SettingsMenu, persisted; mirrored onto `<html>` so portaled overlays scale too). See `guidelines/foundations/scaling.card.html`.
- **Layout & grid** — one responsive structure per desk: top/footer **bars**, a left nav **rail**, a column-grid **content** region, and an optional right workspace rail. Three breakpoints (`--bp-tablet` 640, `--bp-desktop` 1024, `--bp-wide` 1440) step the grid 12 → 8 → 4 columns and collapse the rail (248 → 72 → overlay) via token swaps — no per-component code. NOTE: `--bp-*` tokens are informational (CSS can't read vars in media queries); when changing a breakpoint, update BOTH the token and the literal `@media` values in `tokens/spacing.css`. See `guidelines/foundations/layout-grid.card.html`.
- **Sizing, constraints & auto layout** (`tokens/layout.css`) — the Figma-aligned layout contract. Container widths `--container-sm/md/lg/xl` (640/960/1200/1440) + `.agni-container` / `.agni-grid` (+ `.span-*`, auto-collapsing below desktop); phone **safe-area** tokens (`--safe-*`, `--page-margin-*`). Per-axis sizing vocabulary **hug / fill / fixed** (`.w-hug/.w-fill/.w-fixed`, `.grow`, `.limits`) with canonical clamps (`--min-w-control` 64 · `--min-w-field` 160 · `--max-w-field` 480 · `--max-w-prose` 640 · `--max-h-menu` 320 · `--max-h-modal`). **Constraints** (`.pin-*` left/right/top/bottom/stretch/center/scale) apply only to overlay children inside `position:relative` parents. Every component declares the 8-property **auto-layout contract**: direction · gap · padding · alignment · distribution · wrapping · overflow · clip — flex with token gaps, never sibling margins. **Container-query fit**: `.agni-pane` / `.cq` establish `container: pane / inline-size` + `min-width:0`, so components query their *pane* (via `@container pane (...)`) not the viewport — the key to dropping a component into a 320px menu or a 960px pane unchanged. **Icons** size off control height (`--icon-sm/md/lg`, `.icon` box) with an absolute `--icon-stroke` that never thickens on zoom. See `guidelines/foundations/layout-sizing.card.html` + `auto-layout.card.html` + `scaling.card.html`.
- **Stacking** — z-index is a token scale (`--z-sticky 10 · --z-bar 100 · --z-dropdown 600 · --z-overlay 700 · --z-modal 800 · --z-popover 850 · --z-toast 900 · --z-tooltip 950`). Local stacking inside a component stays numeric (0–5); anything floating over the page uses the scale. Popovers (DatePicker) sit above modals so pickers work inside modal forms.
- **Backgrounds** — Flat and quiet. Sage-gray page, white cards. The one signature gradient: the right-hand WorkspacePane fades white → pale sage (`--agni-green-150`) in light mode, solid navy in dark. No photos, no textures, no decorative  in-app — the flame monogram is the only brand graphic.
- **Corners & cards** — Cards are `--radius-lg` (12px), 1px `--border-subtle`, `--shadow-xs` at rest. Controls are `--radius-md` (8px); pills/badges are `--radius-full`. Cards lift to `--shadow-md` + `--border-default` on hover when interactive.
- **Borders over shadows.** The system leans on hairline borders (`--border-subtle`) to separate regions; shadows are reserved for things that float (menus, toasts, modals, the app launcher).
- **Elevation** — `xs → 2xl` scale, navy-tinted in light, deepened in dark. Popovers use `xl`, the app-switcher modal uses `2xl`.
- **Motion** — Quick and functional. `--dur-fast` (120ms) for hover/press, `--dur-normal` (220ms) for drawers/menus, `--ease-standard` (`cubic-bezier(.2,0,0,1)`) for most things; `--ease-spring` only for pop-in moments (menu, toast, launcher). No infinite/decorative loops. Reduced-motion safe (entrance-only).
- **Hover / press** — Hover = subtle overlay or one-step-darker action color + small shadow lift. Press = darker still **and** a slight scale-down (`--press-scale` 0.97 for buttons, 0.92 for icon buttons). Selection = brand-soft fill + brand text/border.
- **Focus** — 3px brand halo (`--focus-ring`) on `:focus-visible`, error variant for invalid fields. Never removed without replacement.
- **Transparency & blur** — Used sparingly: the scrim behind the app launcher (`--scrim` + `backdrop-filter: blur(4px)`), and a blurred sticky table header in dark mode. Otherwise surfaces are opaque.

---

## ICONOGRAPHY

- **Phosphor Icons** are the sole icon system, loaded from CDN (`@phosphor-icons/web@2.1.1`). The reference app and all cards load the `regular`, `bold`, `fill` and `duotone` weights and render glyphs as `<i className="ph ph-…">`.
  - `ph` = regular (default UI), `ph-bold` = emphasis/brand marks, `ph-fill` = status/selected, `ph-duotone` = occasional richer accents.
  - Sizes are set in px on the `<i>` (16–20px in UI chrome, 30–48px in empty states).
- **No emoji, no ad-hoc unicode glyphs, no hand-drawn SVG icons.** If a needed glyph is missing, pick the nearest Phosphor name rather than inventing artwork.
- **Brand artwork** lives in `assets/logos/` as SVG: the flame **monogram** (`agnikul-monogram-flame.svg`, used in the collapsed rail), the **wordmark** (`agnikul-wordmark.svg`, expanded header), the **full logo with tagline** (`agnikul-full.svg`) and the **Automation team badge** (`automation-logo.svg`, in the footer "Designed & developed by"). These are the only raster/vector brand graphics — everything else is type + Phosphor.

---

## Using AgniUI

1. Link the stylesheet: `<link rel="stylesheet" href="styles.css">`.
2. Load Phosphor (regular/bold/fill) from CDN.
3. Load the compiled bundle and destructure components: `const { Button, AppShell, Bar } = window.AgniUIAgnikulERPDesignSystem_153d9e;`
4. For a new desk module, start from the **Desk App Scaffold** template — swap `data.js` and the labels; the chrome (header, nav, WorkspacePane, AppSwitcher, Settings/accent, theming) comes for free. For a page inside it, start from the **grouped components** above rather than assembling primitives.
5. Toggle dark mode with `data-theme="dark"` and density with `data-density="compact|comfortable|spacious"` on a container; apply an accent with `style={{ ...Theme.deriveAccentVars(accent, dark) }}`. Set display size with `data-scale="sm|md|lg|xl"` (on `<html>` for the whole desk, or any subtree).

---

## Changing AgniUI — versioning &amp; the SOP

Two levels of version live in this repo and they answer different questions:

<<<<<<< HEAD
- **Package version** — the number consumers install (`@sriram-e-automation/agni-ui@1.0.0`). One number for the whole library, logged in `CHANGELOG.md`.
=======
- **Package version** — the number consumers install (`@agnikul/agniui@1.0.0`). One number for the whole library, logged in `CHANGELOG.md`.
>>>>>>> 28b2ee8 (Initial commit of existing code)
- **Component version** — the `@version` tag in each `<Name>.d.ts`. Answers "has *this* component's contract changed since I last read its card?" without diffing a whole release.

Bump rules are identical at both levels. **Major:** a prop removed or renamed, *a default changed*, a component renamed or retired, a token deleted. **Minor:** a prop, variant, state, component or token added. **Patch:** a visual fix inside the existing contract, docs, a class swap with no visual delta. A component major forces at least a package minor.

The procedure — what to check before changing anything, how to write the changeset, the four-check review gate (`.d.ts` matches `.tsx` · the card *shows* the new state · the changeset says what a consumer must do · the readme names the component), and the three-release retirement sequence — is in **`CONTRIBUTING.md`**, with the at-the-keyboard summary on `guidelines/rules/versioning.card.html`.

<<<<<<< HEAD
Getting the system into a git repo and onto a registry as `@sriram-e-automation/agni-ui` — registries and scopes explained from scratch, the repo layout, `package.json`, the GitHub Actions release workflow, and how a consuming app installs it — is in **`PACKAGING.md`**.
=======
Getting the system into a git repo and onto a registry as `@agnikul/agniui` — registries and scopes explained from scratch, the repo layout, `package.json`, the GitHub Actions release workflow, and how a consuming app installs it — is in **`PACKAGING.md`**.
>>>>>>> 28b2ee8 (Initial commit of existing code)
