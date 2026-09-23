# AgniUI → Tailwind v4 migration

Status: **the migration is COMPLETE.** Every component family plus the six
picker bodies (tranches 1–11, Sep 2026). What remains is only the deliberate
exemptions: `charts` SVG geometry, `Loading`'s per-shape skeleton geometry,
and `Cluster`/`Stack`, whose props ARE style values. Data part a
(the record-detail rows — EventRow · DetailSection · Pagination ·
BulkActionToolbar · StatCard · AttachmentRow · DocumentPreview) is done:
EventRow tones are complete class strings on the shared -ink text tokens,
AttachmentRow lost its hover useState, Pagination moved to disabled: variants,
and the runtime holdouts are DocumentPreview's hue+alpha icon wash,
StatCard's raw-colour tone escape hatch, AttachmentRow's live progress width,
and DetailSection's caller-supplied minCol/pad.

Data part b (List · TreeView · EditableTable) is done too: List's two
mouse handlers per row are gone; TreeView keeps its per-node depth indent
inline (\`depth * 18\`, computed, not a set of choices) but its hover/select
fills are classes now; EditableTable's cell inputs used onFocus/onBlur to
paint the border and ring — the hover-in-state anti-pattern, on focus instead
of hover — replaced with \`focus:\`.

Migrated so far:
- **core** — `ButtonBase` · `IconButton` · `SplitButton` · `Tag` · `Avatar` ·
  `AvatarStack` · `Card` · `DropdownMenu` · `OptionRow` · `ActionTile` · `Rating`.
  `RoleGate` has no styling and `Badge` delegates to `Tag`, so neither needed work.
- **forms** — fully converted: `Input` · `Textarea` · `SelectBasic` · `Checkbox` ·
  `Radio` · `Switch` · `QuantityStepper` · `FormField`. Height-only for now (bodies
  still inline, converted in a later pass): `MultiSelect` · `SearchSelect` ·
  `CreatableSelect` · `UserSelect` · `MultiUserSelect` · `DatePicker`.
- **navigation** — fully converted: `TabsStrip` · `SegmentedControl` ·
  `Breadcrumbs` · `CommandPalette`. `Tabs` is a two-line dispatcher with no
  classes of its own, so `MIGRATED[]` lists the two renderers (rule: list the
  file that literally contains the strings).
- **feedback** — `Banner` · `Toast` · `Tooltip` (+ `TipBubble`) · `Modal` ·
  `Progress` · `EmptyState` · `ErrorState`. `Notice`, `Skeleton` and
  `DataState` are dispatchers with no class strings of their own.
  **`Loading` stays inline by design** — its ~90 declarations are per-shape
  skeleton geometry (computed widths, row counts, shimmer rects), the same
  rule-4 runtime-computed exemption chart SVG geometry has. That plus `charts/`
  is the permanent ~10%.
- **containment** — `PanelBase` · `Accordion` · `Sheet` · `Drawer`. `Panel` is
  the dispatcher.
- **layout** — `AppShell` · `Bar`. **`Cluster` and `Stack` stay inline by
  design**: their props ARE style values the caller passes through (`gap`,
  `align`, `justify`, `padding`, `overflow`, where `align` accepts any
  `alignItems` and `padding` any CSS string). A class table would either
  restrict the public API or need an entry per combination — the layout
  primitives are the one place where passing a value through IS the contract.
- **chrome, part a** — `ShellFooter` · `PageTitleBar` · `WorkspacePane` ·
  `PanelKit` · `NavRail`. `Theme` is token maps with no markup.
  Part b (same tranche, next pass): `ShellHeader` · `AppSwitcher` ·
  `NotificationsMenu` · `SettingsMenu`. Runtime values kept inline: the brand
  cell's rail-mirroring width, an accent swatch's own colour (fill AND its
  selected halo, which rings in that colour), a wallpaper's image, and the
  collapsed message's -webkit-line-clamp set (four declarations the expand
  toggle switches at runtime). AppTile's per-tile hover useState became the
  `group` pattern — the pin button is always mounted, `hidden
  group-hover:inline-flex` unless pinned. Hover grow is `hover:[scale:1.1]`,
  an arbitrary property on native `scale`, never `scale-110`'s --tw-scale-*
  plumbing.

### The control-height contract (settled, verified)

Every 32/38/44 control now reads `h-control-*`, and the two-line people pickers
read `h-control-people-*` (the same token, +4px). Measured on bare elements at
every scope — `scraps/control-height-probe.html` is the harness:

| scope | sm | md | lg | people md |
| --- | --- | --- | --- | --- |
| default (comfortable, scale 1) | 32 | 38 | 44 | 42 |
| scale=sm | 27.25 | 33.25 | 39.25 | 37.25 |
| scale=lg | 36.75 | 42.75 | 48.75 | 46.75 |
| scale=xl | 41.5 | 47.5 | 53.5 | 51.5 |
| density=compact | 28 | 34 | 40 | 38 |
| density=spacious | 38 | 44 | 50 | 48 |

Default is pixel-identical to the old literals, so nothing moved. Controls now
track density and scale, and pick up the 44px coarse-pointer floor in
`tokens/spacing.css` that every control previously ignored. Re-run the probe
after touching any control's height: one control left on a literal looks correct
at default and only diverges at another scale.

`IconButton` stays literal 32/36/42 — it is a square icon control and its md has
never been 38.

### Border token: one family, one edge colour

Every control edge reads the layer-3 `--input-bdr` (→ `--border-control`, `#888E96`,
documented in `tokens/colors.css` as the form-control edge at ≥3:1 non-text
contrast). Before tranche 2, `Input` and `SelectBasic` alone carried
`--border-default` (`#CBCED1`); the other seven controls already used
`--input-bdr`. Both moved onto the control token in one change — idle borders on
Input and Select are now visibly darker than before, and the pair that sits side
by side in every form agrees again.

Menus keep `--border-default`: a dropdown panel is a surface, not a control, and
matches `DropdownMenu`.

**Still split, deliberately untouched:** `Checkbox` and `Radio` draw their marks
with `--border-strong`, though the `--border-control` comment names
input/checkbox/radio as its scope. Decide that one on its own — it changes how
every form's checkboxes read, and it was not part of this migration.

## The decision

Delivery is **both**, with the prebuilt file as the contract:

1. **`agniui.css` — prebuilt, shipped next to `_ds_bundle.js`.** This is what
   consumers link. They need no Tailwind, no build config, no `@source` line, and
   they cannot get a version skew between the bundle's class names and the CSS
   that styles them. Cards in this repo and any throwaway prototype use this.
2. **`tailwind/agniui.theme.css` — the source config**, imported by the ERP app's
   own Tailwind build so app devs write `bg-surface-card` in feature code against
   the same tokens. The app additionally adds
   `@source "…/_ds_bundle.js";` so utilities used only inside DS components are
   emitted into the app's own CSS too.

Shipping only (2) was rejected: a consumer whose build forgets `@source` gets an
unstyled design system with no error, which is the worst possible failure mode.

## Why `@theme inline` — do not remove it

`@theme` without `inline` emits `--color-surface-card: var(--surface-card)` into
`:root`. A custom property's `var()` resolves **where it is declared**, so that
freezes the value at `:root` — the light one. Every utility in the system would
be permanently light and `[data-theme="dark"]` would silently do nothing.

`@theme inline` instead bakes the reference into the utility body:

```css
.bg-surface-card { background-color: var(--surface-card) }
```

which resolves at the **use site**, inheriting from the nearest `[data-theme]`
scope. This is why the migrated system contains **zero `dark:` variants** —
theming stays a pure token swap, exactly as before.

The same mechanism carries `[data-density]` and `[data-scale]`.

## Name changes forced by Tailwind's namespaces

| Token (unchanged) | Tailwind name | Utility |
| --- | --- | --- |
| `--surface-card` | `--color-surface-card` | `bg-surface-card` |
| `--text-primary` | `--color-fg-primary` | `text-fg-primary` |
| `--border-subtle` | `--color-line-subtle` | `border-line-subtle` |
| `--action-brand` | `--color-action-brand` | `bg-action-brand` |
| `--status-success-text` | `--color-status-success-ink` | `text-status-success-ink` |
| `--shadow-md` | `--shadow-e-md` | `shadow-e-md` |

**`text` → `fg` is not cosmetic.** Tailwind's `--text-*` namespace is *font size*.
Leaving `--text-primary` there would generate a font-size utility whose value is a
colour, and would collide with `--text-sm: 13px`.

`--shadow-e-*` exists because shadows are theme-varying, so they must be aliased
through `@theme inline`, and `--shadow-md: var(--shadow-md)` is self-referential.

Everything else needed no mapping: `--font-*`, `--text-*` (sizes), `--leading-*`,
`--tracking-*` and `--radius-*` were already named on Tailwind v4's namespaces.
Tailwind's own defaults for those are cleared with `--text-*: initial` etc. so
`text-sm` cannot silently mean 14px instead of AgniUI's 13px.

## Spacing rides `--scale`

```css
--spacing: calc(var(--u) * var(--scale));
```

Tailwind derives every numeric utility as `calc(var(--spacing) * N)`, so `p-4`,
`gap-2` and `mt-8` all track `[data-scale]` with no per-component work. The scale
is 1:1 with the existing tokens — `p-4` === `var(--space-4)` === 16px at scale 1.

Control heights do **not** ride this scale (they ride `[data-density]`), so they
get named utilities instead: `h-control`, `h-row`, `py-cell`.

## Rules for migrating a component

1. **Full class strings only.** Never `bg-${tone}-100` or
   `` `text-${size}` ``. Tailwind scans source as plain text; an assembled name is
   invisible to it and will be missing from the CSS with no error. Use a lookup
   table of complete strings (see `SIZE` / `CATEGORY` in `primitives/Button/ButtonBase.tsx`).
2. **Delete hover/press React state.** `useState(false)` + `onMouseEnter` /
   `onMouseLeave` / `onMouseDown` / `onMouseUp` become `hover:` and `active:`.
   This is most of the win: no re-render per pointer move, no hover stuck on
   after a touch, and keyboard focus handled by `focus-visible:`.
3. **Guard interactive states with `enabled:`.** A disabled `<button>` can still
   match `:hover` in some engines; the old JS guarded this with a ternary.
4. **Keep the `style` prop, for runtime-computed values only.** Chart geometry,
   Gantt bar offsets, progress widths and popover coordinates stay inline —
   they cannot be static class names. Everything theme-related must be a class.
5. **A conditional class must REPLACE the base class, never be appended
   alongside it.** Tailwind resolves conflicts by emit order in the generated
   stylesheet, not by position in the `class` attribute, so
   `BASE(inline-flex) + (block ? "flex" : "")` silently keeps `inline-flex`
   forever. Pull the property out of the base string and emit exactly one
   utility from each conflict group:
   `block ? "flex w-full" : "inline-flex"`. This applies to every
   either/or property — display, position, text-align, flex-direction.
   It is the most likely way this migration introduces a silent bug, because
   every other component is copied from `Button`.

   **`text-align` in a shared cell string is the repeat offender.** It has now
   been caught twice in review — `DataTable`'s `thCls` (tranche 9) and
   `ImportRecordsModal`'s `TH` (tranche 10a) — with the identical symptom: a
   base `text-left` beating an appended `text-center`, so a centred column's
   header sits left over centred body cells. The emit order is fixed
   (`.text-center` → `.text-left` → `.text-right`), which is why `text-right`
   appears to work and hides the bug. **A `th`/`td` base string must carry no
   alignment at all**; give every cell exactly one alignment utility, including
   the default `text-left` ones.

   **A `className` handed to a DS component is APPENDED to that component's own
   base string**, so it has to beat that base by emit order too — being spelled
   like a reset is not enough. `<Tabs className="border-0">` (tranche 10d) was
   meant to suppress `TabsStrip`'s own `border-b`, but emit order is `.border`
   → `.border-0` → `.border-b`, so the strip kept its rule and drew a second
   hairline one pixel below the wrapper's. `border-b-0` is the fix. The old
   inline `border:"none"` had always won, which is exactly why the conversion
   looked safe. Treat every class you pass INTO a component as a conflict with
   that component's internals, not with your own markup.
6. **Never change one half of a matched pair.** Button and Input sit side by
   side in every form and share a `32 / 38 / 44` height table. Migrating Button
   to `--spacing` steps (`h-9.5`) made it 33.25px at `data-scale="sm"` next to a
   38px input; moving it to `h-control-*` did the same, because
   `--density-control-h` is `calc(38px * var(--scale))` while every other control
   is still hardcoded. Button therefore uses **literal** `h-[38px]` until the
   whole control family migrates together. Before changing any dimension, check
   what sits beside it — measuring the component alone is not enough.
7. **Layer 3 tokens stay.** Component-role tokens are still the indirection
   point for per-component overrides; reach them with arbitrary values where a
   semantic utility does not exist:
   `bg-[var(--button-danger-bg,var(--status-error))]`.

## Regenerating `agniui.css`

`tailwind/agniui.css` is the compiled artifact consumers link, and it is
**generated**. After migrating a component:

1. add its path to `MIGRATED[]` in `tailwind/build.html`
2. open that page — it compiles with the real Tailwind compiler and reports the
   candidate/rule counts
3. copy `window.__AGNIUI_CSS` into `tailwind/agniui.css`

Forgetting step 1 means the component's utilities are absent from the CSS and it
renders unstyled with no error — the exact failure the Desk App Scaffold hit.
Preflight is excluded on purpose; AgniUI's own reset lives in `@layer base`.

## Remaining work

Nothing outstanding. Permanent by design: `charts` SVG geometry, `Loading`'s
per-shape skeletons, `Cluster`/`Stack` (their props ARE style values). Two
`forms` files still carry pointer-handler hover — `FileDropzone`'s remove
button and `RichTextEditor`'s toolbar — neither is a picker and neither was in
scope; they are the obvious next cleanup if the pattern is ever chased to zero.

`charts/` keeps inline styles for SVG geometry by design; only its containers,
legends and tooltips migrate.

### Tranche 11 — the six picker bodies, and the migration closes (Sep 2026)

MultiSelect · SearchSelect · CreatableSelect · UserSelect · MultiUserSelect ·
DatePicker. Their heights went in tranche 2; this is everything below the
height. 839 rules, `--tw-*` plumbing still 3, nothing removed.

- **The edge/ring pair was the whole point.** All six wrote a `bc` variable for
  border-colour and an independent `boxShadow` ternary for the focus ring — two
  expressions describing one visual state, which is exactly how the pair drifts
  (SearchSelect and UserSelect had already lost the error ring: `bc` went red
  but the shadow branch only tested `open`). Each is now a nested pair that
  tests `error` first and `open` inside BOTH arms, so the ring cannot disagree
  with the edge.
  **The first attempt at this got it wrong in two opposite directions**, which
  is worth recording. Flattening to `error ? ERR : open ? OPEN : REST` reads
  cleanly and is wrong: because the error branch is tested first and carries a
  hard-coded `[box-shadow:none]`, an errored control that is open shows no
  focus ring at all — the affordance disappears on exactly the controls that
  need it. MultiSelect flattened the other way (`error → border + ring`, no
  open test) and painted a permanent red glow on a closed, unfocused control.
  Both compile, neither errors, and both survive a screenshot of the resting
  state. The canonical shape is `Input`'s: persistent error EDGE, error RING
  only on focus — a three-state ternary cannot express it, only a nested one
  can.
- **One token per role.** MultiSelect briefly used `border-status-error` where
  the other five used `border-[var(--input-bdr-error)]`. Both resolve to the
  same hex today, so nothing looked wrong — which is why two spellings for one
  role is precisely the drift this tranche existed to remove. Form controls use
  the input-specific token.
- **Three more list-hover useStates gone,** and all three needed the same care:
  the hover class must not repaint the SELECTED row, because `hover:` variants
  emit after base utilities. In every case the old code expressed this as a
  guard inside the handler (`if (!on)`, `hovered === i && !sel`); as classes the
  guard becomes *presence* — the hover utility is only in the string when the
  row is not selected. `MultiUserSelect` needed a third arm for blocked rows.
  `DatePicker`'s was the worst offender: a `hovered` index in state re-rendered
  all 42 day cells on every pointer move.
- **The checkbox's `border: none` became `border-0`,** per the drawn-edge rule —
  the checked state has no border today, but `border-none` would lose to any
  edge utility added later.
- What stays inline: `SZ.fs` / `SZ.px` / `SZ.icon` per-rung lookups, the avatar
  diameter and its `size * 0.4` font size, the categorical-ramp fill with its
  hex-alpha suffix, the stacked-avatar overlap offset and z-index, and
  `DatePicker`'s `panelPos` (measured at open time).

`Loading`'s shimmer was tokenised to `var(--ease-standard)` in the same pass —
the last bare `ease-in-out` in the system, and the eighth found overall.

### Tranche 10d — RequestDetailModal, and the migration closes (Sep 2026)

1,279 lines, the largest file in the system, behind the two-line public
`RecordDetailModal`. 829 rules, `--tw-*` plumbing still 3.

- **Seven pointer-handler pairs removed, one of them a five-handler set.** The
  effort-log timer button wrote `background`, `color`, `borderColor`,
  `transform` and `opacity` straight onto the element across
  enter/leave/down/up — the most elaborate instance of the anti-pattern in the
  codebase. It is two complete class strings (running / idle) with `hover:`
  and `active:` variants now. The ledger's delete, add-note and edit-note
  buttons had the same shape at smaller scale.
- **Two more bare-keyword animation values.** `ease-out` on the dialog fade
  and `ease-in-out` on the running-timer pulse, both now `var(--ease-standard)`.
  That makes seven found across the migration; the pattern is always an
  animation shorthand written before the easing tokens existed.
- **A style constant that outlived its object.** Converting the effort form
  deleted the shared `inp` object, but one `<select>` still spread it — the
  kind of dangling reference a large file hides well. Caught by grepping the
  file for the old constant names after the edits rather than by reading;
  worth doing on any file this size.
- **The loading/error frame and the real dialog now share `SCRIM` / `DIALOG` /
  `DIALOG_FULL` / `DIALOG_SHEET`.** They were two hand-maintained copies of the
  same shell; open-then-fetch means a user sees both within a second of each
  other, so any drift between them was visible as a jump.
- Still inline: the caller's `containerStyle` / `style`, the two grid templates
  built from the `columns` prop, a field's `gridColumn` span, the number-input
  spinner resets, and the entrance animations referencing this file's own
  keyframes.

### Tranche 10c — RequestForm, and a phantom from real COPY (Sep 2026)

One file (plus `RecordForm`, its two-line dispatcher). Most of it was already
DS components; what converted is the footer's required-field note, the
handling-flag row, the review-summary wrappers and the read-only/submitting
lock. The priority dot's fill stays inline — a runtime lookup off the form's
current priority.

- **The scanner trap reached USER-FACING COPY.** A note hint read "…and
  visible to reviewers." — the bare word `visible` in a genuine product string
  compiled `.visible { visibility: visible }` into the shipped CSS. Every
  previous instance of this trap was in a comment, a title attribute or an
  inline animation value; this is the first from text a user actually reads.
  Reworded to "shared with reviewers", which is the same sentence. **The rule
  now covers copy: within a migrated file, a bare utility word anywhere
  between quote characters compiles.** When the copy genuinely needs the word,
  prefer rewording; if it cannot change, the phantom is harmless but should be
  called out in review rather than shipped silently.
- Caught in one step by the fetch-and-diff rebuild introduced in 10a/10b: the
  added-lines list showed a `.visible` rule that no component asked for.

### Tranche 10a/10b — workflow, the small half (Sep 2026)

Seven components: the five confirm-and-commit renderers behind `ConfirmModal`
(which is a dispatcher with no classes of its own) plus `ApprovalStepper` and
`AuditTrail`.

- **A hover state that correctly SURVIVED.** `ApprovalStepper`'s `hover` index
  opens a popover on focus as well as hover, so pointer and keyboard drive the
  same piece of state — the CommandPalette exemption, kept and now commented in
  the file so the next pass does not "finish the job". `DiscardConfirmModal`'s
  hover, by contrast, drove three properties at once (fill, edge, arrow
  opacity) and became `hover:` + `group-hover:`.
- **The brand accent here is `--text-brand`, not `--border-brand`.** The
  discard choice row's hover edge is written `hover:border-[var(--text-brand)]`
  rather than the semantically-tidier `hover:border-line-brand`, because those
  are different values and swapping them is a visual change nobody asked for.
  Same judgement as Input's border in tranche 2.
- **The error banner is duplicated on purpose.** `ReviewSubmitModal`,
  `BulkActionConfirm` and `ImportRecordsModal` each carry the same six-utility
  inline-error banner. Three lines of markup do not earn a shared component,
  and extracting one would add an import edge between three otherwise
  independent renderers.
- `ImportRecordsModal`'s reference table drops its last rule with `border-b-0`,
  not `border-none` — the cells beside it still draw.
- The `agniui.css` delta (42 inserts) was computed by having `build.html`
  **fetch the shipped file and diff against the fresh compile in the page**,
  which is both cheaper and safer than eyeballing two dumps: it reports
  removals as well as additions, and it proved this tranche removed nothing.
  Use that from now on.

### Tranche 9 — DataTable, and the `data` family closes (Aug 2026)

One component, and the family is done.

- **The hover anti-pattern in its most literal form.** The row's
  `onMouseEnter`/`onMouseLeave` did not set React state — they wrote straight
  to `e.currentTarget.style.background`, so React and the DOM disagreed about
  the row's fill on every re-render. Now `hover:bg-[var(--table-row-hover)]`,
  emitted only on the unselected branch, which is exactly what the handlers'
  `if (!on)` guard did.
- **Cell padding rides density properly for the first time.** `pad` was a
  computed string (`14px` / `12px` / `var(--density-cell-pad)`) interpolated
  into every `th`/`td`; it is a three-entry class table now (`py-[14px]` /
  `py-[12px]` / `py-cell`), which is the first use of the `py-cell` utility
  the theme has shipped unused since tranche 1.
- **`headerStyle` still spreads inline, on purpose.** It is a documented
  caller escape hatch that must beat the component's own header styling, and
  inline always wins — the same reasoning that keeps `panelMenuLabelStyle` a
  style object.
- **Fifth and last shimmer, tokenised.** `agni-shimmer 1.4s
  var(--ease-standard) infinite`; only `Loading`'s copy remains.
- Still inline: per-column widths, the `colgroup` (both tables must agree on
  computed widths), the dark-mode picker surface, and the bottom-fade
  gradient.
- **Rule 5 bit anyway, in review — `text-align` in a base string.** `thCls`
  originally opened with `text-left`, and each `<th>` appended its own
  alignment beside it. Emit order in the compiled sheet is `.text-center` →
  `.text-left` → `.text-right`, so the base `text-left` BEAT every appended
  `text-center`: the select-all header lost its centering, and any
  `align: "center"` column got a left-aligned header over centred body cells
  (the `<td>` side was right, because `tdCls` carries no base alignment).
  Fixed by pulling `text-align` out of `thCls` entirely — every `<th>` now
  emits exactly one alignment utility. Worth noting the shape: the base string
  looked harmless because `text-right` happened to work, and it only worked
  because of where Tailwind emits it.
- **A token that was never defined.** The sort icon's idle colour read
  `--text-quaternary`, which no file in the token closure declares — the
  unsorted arrow had been rendering with no colour of its own since long
  before this migration (`AppSwitcher`'s un-unpinnable pin and
  `RequestDetailModal`'s "(optional)" hints share the same dead reference).
  `tokens/colors.css` now defines it as an alias of `--text-disabled` in both
  themes, and the icon reads `text-fg-tertiary`.
- The rebuild was applied to `agniui.css` as a **verified delta** rather than a
  full rewrite: 19 single-line inserts, each anchored to one unique rule line
  inside the same block, with the result asserted byte-for-byte against the
  compiler's reported length (48,595). Anchors that span a block boundary are
  what broke tranche 6a; a whole-line anchor inside `@layer utilities` cannot.

### Tranche 8 — the schedule containers (Aug 2026)

`GanttTimeline` + `Calendar`. Both are grid engines, so the split is sharp:
geometry the component COMPUTES stays inline, everything theme-related is a
class.

- **Three hover useStates gone, one of them expensive.** Gantt's `hoverRow`
  re-rendered the whole timeline on every pointer move across it; it is the
  `group` pattern now, so the sticky left label cell and the bar's shadow
  follow the row's own `:hover`. Calendar's `MonthCell` held a `hov` key per
  cell (35 cells per month) and `DayRow` one per panel row — both are plain
  `hover:` classes.
- **`shadow-none` is not free.** Both files reached for it as the "off" half of
  a hover pair, and it pulled the whole Tailwind shadow composition chain:
  `--tw-*` plumbing jumped **3 → 17** in one build (`--tw-shadow`,
  `--tw-ring-*`, `--tw-inset-shadow-*`, `--tw-ring-offset-*`). Same trap as
  arbitrary `shadow-[…]`, and the same fix — the arbitrary PROPERTY
  `[box-shadow:none]`, which emits the declaration directly. Back to 3.
  `shadow-e-*` are `@utility` rules and are safe; there is deliberately no
  `shadow-e-none`.
- **Hover must not out-order the selected state.** A calendar cell's fill is
  selected → weekend → transparent, with hover on top of the last two only.
  Since `hover:` variants emit after base utilities, appending
  `hover:bg-surface-soft` unconditionally would repaint the SELECTED day on
  hover. The hover class is therefore emitted only when the cell is neither
  selected nor an adjacent-month filler — rule 5 applied to a variant rather
  than a base class.
- **A fourth and fifth pill track, still not unified.** Gantt's toolbar
  `Segmented` (surface-sunken bed, `--text-on-brand` label) and Calendar's
  `SegToggle` (`--agni-neutral-100` bed, literal `#fff` label) were carried
  over unchanged, bringing the count of same-shape-different-values tracks to
  five. Recorded, not fixed — same standing decision.
- What stays inline: cell widths per scale, tier-1 span widths, bar
  left/width, the today-line offset, the lane's `repeating-linear-gradient`
  cell rules, the bar tooltip's pointer coordinates, the month grid's computed
  `gridTemplateRows`, and the `--kanban-<tone>-dot` / tone-pair colours, which
  are runtime lookups keyed by a record's status string.

### Tranche 7e — KanbanBoard (Aug 2026)

One component. Lane header/body structure, the count pill and the loading
skeleton became classes; the tone lookup (`bg`/`bdr`/`dot`/`lbl` per lane,
keyed by the column's status group) and the dark-mode blur stay inline —
run­time values, not a fixed class set, same as KanbanCard's `tok()` helper.

- **A fourth instance of the tranche-5/6a bare-keyword trap.** The skeleton
  card's shimmer read `"agni-shimmer 1.4s ease-in-out infinite"`; tokenised to
  `var(--ease-standard)`, matching `NotificationsMenu`'s `SHIMMER` constant
  exactly (same gradient, same inline-style-plus-size-classes split). `Loading`
  and `DataTable` still carry the same string unfixed — flagged again in
  "Remaining work" so the next component to touch either one tokenises on
  sight rather than rediscovering this.
- Skeleton bar sizes became literal-pixel arbitrary classes
  (`w-[48%] h-[10px] rounded-xs`), not `--spacing`-scaled utilities — they are
  fixed decorative bone geometry, not values that should grow with
  `data-scale`.

### Decided Aug 2026

- **Control heights adopt `h-control-*`**, with comfortable as the only shipped
  density for now. This happens in ONE change together with the whole control
  family (Button, Input, Select, Textarea, MultiSelect, DatePicker,
  QuantityStepper) — not before. Until then Button/IconButton/SplitButton keep
  **literal** `32 / 38 / 44` so they cannot drift from an unmigrated Input at
  `data-scale` other than `md`. This closes the open decision below.
- **Inline styles stay only where a class cannot go**: runtime-computed values
  (identity-hash colours, caller-supplied tones, index-derived offsets, popover
  coordinates) and the `style` prop escape hatch. Keeping an inline declaration
  "as a fallback" beside a class is not an option — inline always wins, so the
  class would be dead code.

### Tranche 5 — containment + layout (Aug 2026)

Six components across two small families, migrated together because neither is
big enough to be a tranche on its own and they share no dimensions.

- **Two phantom rules, both from strings the scanner cannot tell from usage.**
  Tranche 4 taught it to strip comments; this one found the other half. Sheet's
  inline animation read `"agni-fade-in var(--dur-fast) ease-out"`, and the bare
  CSS keyword `ease-out` inside that value compiled as the `ease-out` UTILITY,
  bringing `--tw-ease` plumbing and a stock `--ease-out` theme entry with it.
  The fix is the right one anyway: the system has easing tokens, so the animation
  now uses `var(--ease-standard)`. **A bare CSS keyword in an inline style value
  is indistinguishable from a utility name** — prefer the token.
- **A probe that asserted the wrong shape.** `rounded-t-[var(--sheet-radius)]`
  compiles to two longhands (`border-top-left-radius` + `border-top-right-radius`),
  not a shorthand, so a probe searching for
  `border-radius: var(--sheet-radius) var(--sheet-radius)` reported MISS on a
  rule that was present. Probe the declaration Tailwind actually emits.
- **Panel's body padding now tracks scale.** It was a literal `16`; it is
  `p-4` — the same 16px at scale 1, but it follows `data-scale` like every other
  spacing step. That is the designed behaviour of the spacing scale and the
  opposite of the control-height rule, where riding spacing steps was the bug.
- **`border-t-0` / `border-b-0`, not `border-none`.** Accordion's first row and
  Sheet's bottom edge suppress one edge while another draws. Same trap as the
  Tabs underline: `border-none` sets `border-style: none` and zeroes every edge.
- Sheet's close button lost the last `onMouseEnter`/`onMouseLeave` pair in the
  two families; `AppShell`'s `sidebarWidth` and `contentPad` and `Drawer`'s
  `width` stay inline as caller-supplied lengths.

### Tranche 6a — the chrome shell frame (Aug 2026)

- **A hand-patch ate an `@media` opener and every border in the system went
  with it.** The 6a diff-insert script had one entry whose anchor included
  `@media (hover: hover) {` while its replacement did not, deleting the opener
  and leaving its close brace behind. The premature close of `@layer utilities`
  made the parser drop everything after it — including
  `@property --tw-border-style`, whose `initial-value: solid` is what every
  `border-style: var(--tw-border-style)` declaration resolves against. Result:
  `.border`, `.border-2`, the Tabs underline, every input shell and every dashed
  state frame computed to NO border, invisible on screen until the bundle
  catches up. `build.html` now reports brace balance and the presence of that
  `@property` on every build; a diff-insert must never use an anchor that spans
  a block boundary.

Five components. The `hover`-in-state anti-pattern was concentrated here and is
now gone from the frame: `WorkspacePane` and `NavRail` each held a `hovered` key
in React state, re-rendering the whole rail on every pointer move across it.
`NavRail`'s was worse than a performance cost — one slot was shared between a
parent row and its sub-items, so hovering a child cleared the parent's highlight.
CSS `:hover` gives each row its own state.

- **A third bare-keyword phantom, same shape as tranche 5's.**
  `PageTitleBar`'s count-placeholder shimmer read
  `"agni-shimmer 1.4s ease-in-out infinite"`, and `ease-in-out` inside that
  inline value compiled as the utility, pulling `--tw-ease` plumbing and a stock
  `--ease-in-out` theme entry. Tokenised to `var(--ease-standard)`. **This will
  recur in `data`**: `Loading` and `DataTable` use the same shimmer string, so
  tokenise them as part of that tranche rather than discovering it again.
- **Another probe needle off by a space.** `min(var(--rail-drawer-w-md),84vw)`
  compiles with a space after the comma. Third probe this session that reported
  MISS on a present rule — always copy the needle out of the compiled output.
- **Open/closed as two complete strings, not per-property ternaries.**
  `WorkspacePane` and `NavRail` change width, gap, justification, margin AND
  padding between collapsed and expanded. One string per state is shorter and
  cannot lose a conflict pair to emit order.
- **`panelMenuLabelStyle` stays a style object.** It is spread onto callers' own
  elements across the scaffold, so converting it to a class would break every
  call site. `panelMenuLabelCls` was added beside it for new markup.
- **A third pill track, noted not fixed.** `PageTitleBar` draws its own
  segmented track, with a different bed and active-label colour from both
  `TabsStrip variant="segmented"` and `SegmentedControl`. Three tracks now carry
  the same shape with three sets of values; unifying them touches every page
  header, so it is recorded on the prop-vocabulary card as a decision to make.

### Not a migration change — Panel's state contract (Aug 2026)

Landed separately from tranche 5, on purpose. The migration surfaced that
`Panel variant="drawer" error="…"` rendered an empty shell: the four state props
resolved inside `PanelBase` only, and `Panel.d.ts` documented them as
inline-only, so the dispatcher forwarded them to `Sheet`/`Drawer` where nothing
read them. That is a capability gap, not a styling bug, so it did not belong in
a tranche — a migration that also changes what a component can do makes both
halves harder to review.

`resolvePanelBody()` (`containment/panelState.tsx`) now holds the contract once
and both paths call it. It returns `suppressFooter` alongside the body, which is
where the real decision lives: a sticky action bar over a body that failed or has
not arrived offers actions that cannot be performed, so **error and loading drop
the footer while `empty` keeps it** — "No files attached" beside an Upload button
is a legitimate pairing and usually the only way out of the empty state. The
header is never dropped: an overlay must stay closable.

### Tranche 4 — feedback (Aug 2026)

Seven components, no dimension changes. Two findings, one of them a build bug
that had been costing every tranche since the first:

- **The candidate scanner was reading COMMENTS as usage.** It harvests anything
  between quote characters, and comment prose sits between the quoted strings
  around it — so a doc comment that *names* a utility in order to explain why the
  component avoids it ("written as an arbitrary property, not
  `backdrop-blur-[3px]`") compiled that utility into the shipped CSS. It dragged
  in nine `--tw-backdrop-*` custom properties, the whole `filter` composition
  chain with its eight `@property` registrations, and an empty phantom rule from
  an ellipsis. `build.html` now strips `/* */` and `//` comments before
  harvesting, and the report prints the `--tw-*` count with a warning if
  `backdrop-blur` ever compiles again. Effect: **`--tw-*` plumbing fell from 25
  entries to 3** (`--tw-leading`, `--tw-font-weight`, `--tw-tracking`, which are
  inherent to those utilities) and the output shrank despite gaining a family.
  It also correctly dropped `.border-x` and `.rounded-r-none`, which only ever
  existed in the comments that explain why QuantityStepper's dividers and
  SplitButton's radius join stay inline.
- **A probe that can never pass.** Two new probes searched the output for
  `[transform:translateX(-50%)]` and `box-shadow:var(--tooltip-shadow)` and
  reported MISS while both rules were present — compiled selectors are
  CSS-escaped (`.\[transform\:translateX\(-50\%\)\]`), so a raw needle never
  matches. Probes for arbitrary utilities must search the DECLARATION
  (`transform: translateX(-50%)`), not the class name.
- **Tooltip's four sides are classes; its animation is not.** The bubble and
  caret positions are static per side, so they became class strings — written as
  arbitrary `[transform:…]` properties rather than `-translate-x-1/2`, which
  routes through `--tw-translate-*` plumbing. The entrance keyframes interpolate
  the side's own transform, so that rule is composed per side at runtime and
  stays inline.
- **`useTip`'s pointer handlers stay.** Rule 2 deletes hover state held in
  React; a tooltip's open DELAY is a timer, which no `:hover` can express. Same
  distinction as CommandPalette's shared keyboard/pointer highlight.

### Tranche 3 — navigation (Aug 2026)

Four components, no dimension changes, so rule 6 did not bite. What it did surface:

- **`border-none` is not `border-0`, and the difference is invisible until it
  isn't.** `border-none` emits `border-style: none`, which zeroes the computed
  width of ANY border utility beside it — so the underline tab strip's
  `border-b-2 border-b-action-brand` shipped with the colour correct and the
  width at 0px, i.e. no underline at all on the active tab. The old inline
  styles survived the same pairing only because the `borderBottom` longhand came
  after `border: none`. Reset with **`border-0`** whenever a border utility has
  to draw on one edge; `border-none` is only safe where nothing draws a border.
  This is rule 5 in a form the rule's wording did not obviously cover — the two
  utilities are the same conflict group even though one looks like a reset and
  the other like a width. Every other `border-none` in the migrated set was
  re-checked; QuantityStepper's divider edges are the one deliberate exception
  and stay inline.
- **The drift alarm asserted a literal 38px.** `templates/admin-ops/ds-base.js`
  probed `h-[38px]` — a class no component has emitted since tranche 2, so the
  alarm fired on every scaffold load and the one console error built to catch a
  genuinely silent failure became noise. It now probes `h-control` and compares
  against a ruler element set to `var(--density-control-h)`, which holds at every
  density and scale (the scaffold runs at `--scale` 0.875, where 38px is simply
  the wrong number). A drift probe must never assert a fixed pixel value.
- **Two pill tracks that are not the same pill track.** `TabsStrip variant="segmented"`
  beds on `--surface-sunken` with `--text-on-brand` labels; `SegmentedControl`
  beds on `--agni-neutral-100` with a literal `#fff`. Both were carried over
  **unchanged**. Unifying them is a visible change to every page title bar and
  view switcher in the desk — the same class of decision as Input's border in
  tranche 2, so it is written down here rather than made in passing.
- **A pointer handler that is correct.** `CommandPalette`'s `onMouseEnter` stays.
  Its `active` index is shared by mouse and keyboard — arrowing down has to move
  the same highlight the pointer moves — so it cannot become a `hover:` class.
  Rule 2 is about hover *styling* held in state, not about state that two input
  methods share.
- **`backdrop-blur-[3px]` drags in nine `--tw-backdrop-*` custom properties**,
  declared inside a component-style selector — the same trap as arbitrary
  `shadow-[…]` and numeric transforms. Written as the arbitrary property
  `[backdrop-filter:blur(3px)]` instead, which emits the declaration directly.
  Caught by `window.__AGNIUI_TW_VARS` before it shipped.
- **Entrance animations stay inline** in `CommandPalette`. They reference
  `@keyframes` the component ships in its own `<style>`; routing them through
  `animate-[…]` utilities would make them depend on the compiled stylesheet
  owning a keyframes name it does not define. Motion is not theme-varying, so
  the class-only rule loses nothing here.

### Traps hit during tranche 1

- `MIGRATED[]` pointed at `core/Button.tsx`, which has been a three-line
  dispatcher since the Aug merge. Its class strings live in `ButtonBase.tsx`, so
  the next regeneration would have dropped every button utility. **List the file
  that literally contains the strings.**
- The serializer swept up the preview host's `html,body{background:transparent}`
  and shipped it inside `agniui.css`, overriding consumer page backgrounds. It
  now keeps only `@layer` / `@property` / `@supports` rules and reports how many
  host rules it dropped.
- Numeric transform utilities (`-translate-y-0.5`) route through
  `--tw-translate-*` custom properties, which the DS token compiler flags as
  unclassified tokens declared under a component selector. Use a direct value
  instead: `[translate:0_-2px]`. `build.html` now exposes
  `window.__AGNIUI_TW_VARS` so new plumbing is visible before it ships.
- A `SCREAMING_CASE` or `PascalCase` export from a component file lands on the
  public `window.<Namespace>` as if it were a component (the shared menu class
  strings briefly showed up as three new "components"). Name shared constants
  in lower camelCase.
- Two conflict groups that must never be classes because they resolve by emit
  order, not class order: SplitButton's radius join (`rounded-md` vs
  `rounded-r-none`) stays an inline style, and IconButton's toggled state
  **replaces** its variant block rather than being appended after it.
- The candidate scanner discarded any string containing `{`, so **every
  `className` written as a template literal was thrown away whole** and none of
  its utilities compiled. That silently cost Tag's status dot (`bg-current` → an
  invisible dot on every status pill), Avatar's presence dot
  (`bg-status-success`, `-right-px`, `-bottom-px` → an uncoloured ring in the
  wrong corner) and Button's loading spinner (`animate-spin` → a static ring).
  The scanner now strips interpolations before filtering, `build.html` probes for
  these exact selectors on every build, and component classNames use the
  `[…].join(" ")` array form.
- `agniui.css`'s banner contained a literal comment terminator, in prose
  describing the `@kind other` marker. It closed the banner early and the parser
  discarded everything up to the next recoverable rule — the `@layer` statements
  and the whole `@layer theme` block. Harmless while that layer only mirrored
  tokens the DS already defines; the moment it carried `--animate-spin` the
  spinner stopped animating, with no error anywhere. Never nest a comment
  terminator in that banner.
- `@keyframes` can land at top level rather than inside a layer, so the
  serializer must keep `CSSKeyframesRule` — otherwise an animation utility
  references a name that does not exist.
- Tailwind's **arbitrary `shadow-[…]`** composes through `--tw-shadow` /
  `--tw-ring-shadow` / `--tw-inset-shadow`, declaring custom properties inside a
  component-style selector — the token compiler flags every one, and it drags ~15
  `@property` registrations into the output. Use an `@utility` that sets
  `box-shadow` directly instead: `ring-focus`, `ring-focus-error` and
  `ring-inset-line` join `shadow-e-*` for exactly this reason. Same rule as
  numeric transforms.
- `bg-white` pulls Tailwind's stock `--color-white` into the theme layer, adding
  a non-DS colour to the token registry. Use `bg-[#fff]` where a literal white is
  genuinely meant (Switch's knob).
- **Picking the "obvious" semantic utility can be a silent redesign.** Migrating
  Input's inline `--border-default` to the semantically-right-looking
  `border-line-control` changed its idle border from `#CBCED1` to `#888E96` and
  left Select as the only control on the old value — a visual change nobody asked
  for, in the exact pair rule 6 exists to protect. Heights had been verified at
  every scale and density; colour had not. When a component's inline value and
  the token that *looks* correct disagree, that is a decision to surface, not a
  detail to fix in passing: check what the sibling control uses before choosing.

## Open decision — RESOLVED Aug 2026

See "Decided" above: `h-control-*` wins, atomically with the control family.
The paragraphs below are kept for the reasoning that led there.

## Historic context — `--density-control-h` vs hardcoded heights

The density token evaluates to `calc(38px * var(--scale))`, but every control in
the system hardcodes `32 / 38 / 44` and ignores density entirely. **These have
never agreed**, and the migration surfaced it rather than caused it. Resolve
before the forms family migrates:

- adopt `h-control-*` across Button, Input, Select, Textarea, MultiSelect,
  DatePicker and QuantityStepper in **one** change (controls then track density
  and scale, and the compact desk genuinely gets 34px controls); or
- treat `--density-control-h` as informational and keep literal heights.

The `h-control-sm` / `h-control` / `h-control-lg` utilities are built and correct
(they reproduce 32/38/44 at comfortable density) but are **unused** until then.
