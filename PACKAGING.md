# PACKAGING.md — getting AgniUI into a git repo and onto a registry

This is the path from "a folder of components" to "a library our apps install". Written for someone doing it for the first time.

---

## Part 1 — the concepts, in plain terms

**A package** is a folder with a `package.json`. That file names it, versions it, and says which file to load when someone writes `import { Button } from "@agnikul/agniui"`.

**A registry** is a server that stores published versions of packages. `npm install` downloads from one. There are two that matter here:

| | **npmjs.com** (public npm) | **GitHub Packages** |
| --- | --- | --- |
| Who can install | Anyone on the internet | Only people with access to your GitHub org |
| Cost | Free for public; paid for private | Included with your GitHub plan |
| Setup for consumers | None | One `.npmrc` line + a GitHub token |
| Good for | Open-source libraries | **Internal company libraries — this one** |

**GitHub Packages** is simply npm's registry, hosted by GitHub, with GitHub's permissions in front of it. If you can see the repo, you can install the package. That is the whole idea, and it is why it fits an internal ERP design system: you do not want AgniUI on the public internet, and you do not want to pay npm for a private org.

**A scope** is the `@something/` prefix. `@agnikul/agniui` is the package `agniui` in the scope `agnikul`. GitHub Packages **requires** the scope to match your GitHub organisation name exactly — if the org is `agnikul-cosmos`, the package must be `@agnikul-cosmos/agniui`. Pick the name once; renaming later means every consuming app changes its imports.

> **Recommended name: `@agnikul/agniui`** (adjust the scope to the real org login). Short, matches the system's name, and leaves room for siblings later (`@agnikul/agniui-icons`).

**Semantic versioning** — `MAJOR.MINOR.PATCH`. Major = something broke. Minor = something was added. Patch = something was fixed. Consumers write `"^1.0.0"`, which means "1.0.0 or newer, but never 2.x" — so your major bumps never reach them by surprise. The bump rules for this repo are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Part 2 — the repository

### Recommended: one repo, `agnikul/agniui`

Do **not** put the design system inside the ERP app's repo. A shared library needs its own version history and its own release cadence; buried in an app repo it silently becomes app code again.

### Structure to move into it

```
agniui/
├─ src/
│  ├─ components/       # exactly what is here today
│  ├─ tokens/           # the 3-layer CSS
│  ├─ styles.css
│  └─ index.ts          # NEW — the public surface (see below)
├─ dist/                # built output, git-ignored, published
├─ .changeset/          # pending change entries
├─ .github/workflows/   # CI + release
├─ package.json
├─ tsconfig.json
├─ CHANGELOG.md
├─ CONTRIBUTING.md
└─ readme.md
```

`src/index.ts` is the one file that decides what is public. Everything not exported from it is internal, and that is how `ButtonBase`, `IconButton` and the other retired renderers stay reachable inside the library while being absent from the published API:

```ts
export { Button } from "./components/core/Button";
export { Tag } from "./components/core/Tag";
export { RecordTable } from "./components/data/RecordTable";
export { ApprovalPanel } from "./components/workflow/ApprovalPanel";
// … one line per documented component
export type { ActionSpec, ExportActionSpec } from "./components/core/actionSpec";
```

### `package.json`

```json
{
  "name": "@agnikul/agniui",
  "version": "1.0.0",
  "description": "Agnikul Cosmos ERP design system",
  "license": "UNLICENSED",
  "private": false,
  "type": "module",
  "main": "./dist/agniui.cjs",
  "module": "./dist/agniui.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/agniui.js", "require": "./dist/agniui.cjs" },
    "./styles.css": "./dist/styles.css",
    "./agniui.css": "./dist/agniui.css",
    "./tokens/*": "./dist/tokens/*"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "publishConfig": { "registry": "https://npm.pkg.github.com" },
  "repository": { "type": "git", "url": "git+https://github.com/agnikul/agniui.git" },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.build.json --emitDeclarationOnly",
    "check": "tsc --noEmit && eslint src",
    "release": "changeset publish"
  }
}
```

Three lines deserve a note:

- **`peerDependencies`** — React is the *app's* React, not a second copy bundled inside AgniUI. Two Reacts in one page break hooks with an error that reads like nonsense. Always a peer dep for a component library.
- **`publishConfig.registry`** — this is what sends `npm publish` to GitHub instead of public npm. Nothing else is needed on the publishing side.
- **`files: ["dist"]`** — only the built output ships. Nobody installing the package needs your cards or audits.

### Two things that must ship with the CSS

AgniUI's runtime is CSS custom properties plus a prebuilt Tailwind sheet. Consumers link both, in this order:

```ts
import "@agnikul/agniui/styles.css";   // the token closure — required
import "@agnikul/agniui/agniui.css";   // the prebuilt utilities — required
```

An app that runs its own Tailwind build imports `tailwind/agniui.theme.css` instead of the second line, and adds `@source "node_modules/@agnikul/agniui/dist/agniui.js";` so utilities used only inside DS components are emitted into the app's own CSS. Both routes are described in `tailwind/README.md`; shipping the prebuilt file is deliberate, because a consumer who forgets the `@source` line gets an unstyled design system with **no error**.

---

## Part 3 — the steps, in order

### One-time setup

```bash
# 1. create the repo on GitHub (private), then locally:
git init && git branch -M main
git remote add origin https://github.com/agnikul/agniui.git

# 2. move the sources into src/, add package.json / tsconfig / vite.config
# 3. build tooling
npm i -D vite typescript @vitejs/plugin-react @changesets/cli eslint
npx changeset init

# 4. first commit
git add -A && git commit -m "chore: initial import of AgniUI 1.0.0"
git push -u origin main
```

### Publishing from CI (the way to do it)

Publishing from a laptop means the release depends on whose laptop it was. Do it from GitHub Actions — `GITHUB_TOKEN` is provided automatically and already has permission to publish to your own org's registry.

`.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
  packages: write
  pull-requests: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://npm.pkg.github.com
      - run: npm ci
      - run: npm run check
      - run: npm run build
      - uses: changesets/action@v1
        with:
          version: npx changeset version
          publish: npx changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

What this does, day to day:

1. You merge a PR that contains a component change **and its changeset file**.
2. The action opens (or updates) a PR titled **"Version Packages"** — that PR bumps `package.json` and writes the `CHANGELOG.md` entry from your changesets.
3. When you merge *that* PR, the action publishes to GitHub Packages and tags the release.

You never run `npm publish` by hand, and the changelog cannot drift from what shipped.

### Consuming it in the ERP app

One file at the app's root, `.npmrc`:

```
@agnikul:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The token is a GitHub **classic personal access token** with the single scope `read:packages`. Each developer puts theirs in their shell profile; CI uses its own `GITHUB_TOKEN`. **Never commit a token** — the `${GITHUB_TOKEN}` form above reads it from the environment, which is why it is safe to commit that `.npmrc`.

Then:

```bash
npm i @agnikul/agniui
```

```tsx
import "@agnikul/agniui/styles.css";
import "@agnikul/agniui/agniui.css";
import { RecordTable, PageTitleBar } from "@agnikul/agniui";
```

---

## Part 4 — before the first publish

- [ ] Scope matches the GitHub org login exactly.
- [ ] `src/index.ts` exports every documented component and **no** retired renderer.
- [ ] `react` / `react-dom` are peer dependencies, not dependencies.
- [ ] `npm pack --dry-run` lists only `dist/` — no cards, no audits, no `uploads/`.
- [ ] A throwaway app installs the tarball and renders a `Button` with correct colours (this catches a missing CSS export, the most common first-publish miss).
- [ ] `dist/index.d.ts` resolves in the consuming app's editor — types are half the value of a shared library.
- [ ] The repo is private and the org's package visibility is set to match.

## Part 5 — after it is live

- **Branch protection on `main`**: PRs only, CI green, one review. The SOP in `CONTRIBUTING.md` assumes this.
- **A `canary` tag for risky work**: `npx changeset publish --tag canary` publishes without moving `latest`, so an app can opt in with `npm i @agnikul/agniui@canary`.
- **Keep the design system project and the repo in sync.** This project is where components are designed and their cards live; the repo is where they ship. Whichever direction you edit in, the other must follow in the same change — a component that exists in one and not the other is the failure mode this whole document exists to prevent.
