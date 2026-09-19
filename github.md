repo: sriram-e-automation/agni-ui
branch: main
path: (repo root — AgniUI is the whole repository)

## Last sync

date: 2026-09-01T12:20:03Z
direction: outbound — this project is the source of truth; the repo is empty and awaiting the first push

### Updated in this project

- Read `sriram-e-automation/agni-ui@main` — newly created, empty repository. Nothing to import.
- Generated `templates/repo-scaffold/` — the publishable-package scaffold: `src/index.ts` (110 values + 206 types, derived from the `.d.ts` contracts), `package.json`, Vite library build, Changesets config, CI + release workflows, PR template. It sits under `templates/` because those files are repo sources, not design-system sources, and must not be compiled into the bundle.
- Its `README.md` carries the step-by-step first push, first publish, and the consuming app's `.npmrc`.
- Scope decided: the repo lives under the personal account `sriram-e-automation`, so the package is `@sriram-e-automation/agni-ui` — scope matches the account login exactly, no org needed.

## Screen map

| Project file | Repo destination |
| --- | --- |
| `templates/repo-scaffold/src/index.ts` | `src/index.ts` — the public surface |
| `templates/repo-scaffold/package.json` · `vite.config.ts` · `tsconfig*.json` | repo root |
| `templates/repo-scaffold/.changeset/` | `.changeset/` |
| `templates/repo-scaffold/.github/workflows/ci.yml` · `release.yml` | `.github/workflows/` |
| `templates/repo-scaffold/.github/pull_request_template.md` | `.github/` |
| `templates/repo-scaffold/.gitignore` · `.npmrc.example` | repo root |
| `components/` | `src/components/` |
| `tokens/` · `styles.css` | `src/tokens/` · `src/styles.css` |
| `tailwind/agniui.css` · `tailwind/agniui.theme.css` | `src/` |
| `assets/logos/` | `src/assets/logos/` |
| `readme.md` · `CHANGELOG.md` · `CONTRIBUTING.md` · `PACKAGING.md` | repo root |
| `guidelines/` · `docs/` · `*.card.html` | `docs/` — reference, not shipped |

Not synced, by design: `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, `_thumbnail.*`, `scraps/`, `uploads/`, `templates/admin-ops/`.
