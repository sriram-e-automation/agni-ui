# Contributing to AgniUI — the change SOP

This is the standard operating procedure for changing anything in this design system: a token, a component, a card, a rule. It exists so that a change is never invisible to the people consuming it.

The rule behind all of it: **a change that is not written down is a change that breaks someone quietly.**

---

## 0. Before you change anything

| Question | Where the answer is |
| --- | --- |
| Does this component already exist under another name? | `guidelines/rules/component-naming.card.html` — the merge table |
| Is this a new component or a prop on an existing one? | The merge test, same card. Capability goes in props; only a new *shape* earns a new name. |
| What states must it have? | `components/feedback/states.card.html` — error → loading → empty → content |
| What does the card have to show? | Every variant and every state. A component is not done until its card shows its states. |
| Is it one consumer or a pattern? | One consumer is not a pattern. Keep it local until a second module needs it. |

---

## 1. Make the change

**Component work:**

1. Edit `<Name>.tsx`. Tailwind v4 classes over tokens — the rules are in [`tailwind/README.md`](tailwind/README.md), and rule 5 (a conditional class must *replace* the base class, never sit beside it) is the one that bites.
2. Edit `<Name>.d.ts` to match. The `.d.ts` is the published contract — the `.tsx` is the implementation. If they disagree, the `.d.ts` is wrong.
3. Bump `@version` in the `.d.ts` (see the table below).
4. Update the component's `@dsCard` HTML so the new variant/state is visible.
5. If the class strings changed, add the file to `MIGRATED[]` in `tailwind/build.html`, rebuild, and copy the delta into `tailwind/agniui.css`. Forgetting this ships the component unstyled with no error.

**Token work:** edit the layer that owns the value (`brand` → `colors` → `components`, never skip down). Add the light value in `:root` and the dark value in the `[data-theme="dark"]` block; `tokens/system-theme.css` is generated from those. Update `guidelines/foundations/colors.card.html`.

---

## 2. Bump the versions

Two levels, both semver, same rules.

| Change | Component `@version` | Package version |
| --- | --- | --- |
| Prop removed / renamed, default changed, component renamed or retired, token deleted | **major** | at least **minor**; two or more component majors → **major** |
| Prop added, variant / state / component added, token added | **minor** | **minor** |
| Visual fix inside the existing contract, docs, a class swap with no visual delta | **patch** | **patch** |

Two judgement calls worth stating:

- **A changed default is a major**, even though nothing was removed. Every consumer who did not pass that prop gets new behaviour.
- **A visual change with no API change is still a patch entry.** "Nothing changed in the props" is exactly the release that surprises people.

---

## 3. Write the changeset

One file per change, in `.changeset/`, named after the change (`record-table.md`, `pagecontrols-export.md`). It is a two-part file:

```md
---
"@sriram-e-automation/agni-ui": minor
---

PageControls: added `exportAction`, `primaryAction` and `secondaryActions`.
`exportAction.enabled: false` renders the export button visible and disabled with
a reason rather than hiding it — a records page should not change shape per viewer.
The `actions` ReactNode slot still works and renders after the declarative group.
```

Write it for **the person consuming the change**, not for the person who made it. Name the component, say what moved, and say what a consumer has to do. A line that says "refactor" tells nobody anything.

If the change is a **major** on any component, add the migration line explicitly:

> Migration: pass `actions={<Button iconOnly icon={…} />}` to keep the ⋮ button.

## 4. Review

The reviewer checks four things, in this order:

1. **`.d.ts` matches `.tsx`** — the published contract is the one people read.
2. **The card shows the new state.** Not "the code supports it" — the card *shows* it.
3. **The changeset says what a consumer must do**, and the bump level matches the table above.
4. **`readme.md` names the component.** The readme is the index; a component absent from it does not exist as far as the next person is concerned.

## 5. Release

```bash
npx changeset version   # consumes .changeset/*.md → bumps package.json, writes CHANGELOG.md
npx changeset publish   # builds, publishes, tags
```

`changeset version` folds every pending changeset into `CHANGELOG.md` under the new version and deletes them. Then:

1. Re-run `check_design_system` (or `npm run check`) — it must report **no issues**.
2. Update `readme.md`'s component index and totals in the same commit.
3. Tag: `v1.0.0`. Push tags.

**Never hand-edit a released section of `CHANGELOG.md`.** Correct it with a new patch entry.

---

## 6. Retiring a component

Retirement is a three-release sequence, never a delete:

1. **Deprecate** (minor) — add `@deprecated Use <X> instead.` to the `.d.ts`. It still works, still has a card, and the card gains a banner naming the replacement.
2. **Withdraw** (major) — remove the `.d.ts` and the specimen card. The `.tsx` stays, with an `@internal` header naming the replacement, so imports inside the library keep resolving. This is what the Aug 2026 merge did to sixteen components.
3. **Delete** — only when nothing in the repo imports it. Usually never; a dead `.tsx` costs nothing and keeps history readable.

---

## 7. What each file is for

| File | Owns |
| --- | --- |
| `readme.md` | The index. Every component named, every folder explained. Updated on every change. |
| `CHANGELOG.md` | The log. Generated from changesets — do not hand-edit released sections. |
| `CONTRIBUTING.md` | This SOP. |
| `PACKAGING.md` | Getting the library into a git repo and onto a registry. |
| `tailwind/README.md` | The Tailwind v4 migration record and the per-component rules. |
| `docs/*.html` | Audits and the Master Sheet — generated from the manifest and the `.d.ts`, so they cannot drift. Regenerate; do not hand-edit. |
| `guidelines/rules/*.card.html` | The rules, as visible cards. |
