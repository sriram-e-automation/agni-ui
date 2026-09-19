---
name: agniui-design
description: Use this skill to generate well-branded interfaces and assets for AgniUI — the Agnikul Cosmos ERP design system (custom React layer over Frappe/ERPNext) — for production or throwaway prototypes/mocks. Contains the design guidelines, 3-layer tokens (light+dark), fonts, brand assets, reusable React components, the Desk App Scaffold, and ERP pattern kits.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

AgniUI is a **desktop-first, data-dense enterprise ERP** system — not a consumer
app and not Material Design 3. Honor that: dense spacing, small type, role-gated
desks, calm operational tone. Every surface must work in **both light and dark
mode** (token-level swap via `data-theme="dark"`).

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out
of `assets/` and create static HTML files for the user to view. If working on
production code, copy assets and read the rules here to become an expert in
designing with this brand.

Key facts to load before generating:
- **Tokens are 3-layer** (`tokens/brand.css` → `colors.css` → `components.css`).
  Never hardcode a hex — reference a CSS custom property. Change `--brand-primary`
  to re-theme everything.
- **Layout is auto-layout only** — flex with token gaps + padding (`Cluster`/`Stack`
  or `.al-h`/`.al-v`), never sibling margins. Sizing vocabulary: **hug / fill /
  fixed** per axis with clamp tokens; pinned overlays use `.pin-*` constraints;
  grid, containers & phone safe-areas live in `tokens/layout.css`. Component-level
  responsiveness uses **container queries** (`.agni-pane`/`.cq` → `@container pane`),
  not viewport media — a component scales to its pane, not the window.
- **Fractional scaling** — spacing derives off `--u` × step × `--scale`; set display
  size with `data-scale="sm|md|lg|xl"` (on `<html>` for the desk, or a subtree).
  Icons size off `--icon-sm/md/lg`; type stays fixed. Never hardcode `px` sizes —
  reference `--space-*` / `--density-*` / `--icon-*` so scaling reaches everything.
- **Icons are Phosphor only** (regular/bold/fill/duotone via CDN), never emoji or
  hand-drawn SVG icons.
- **Components** ship in `_ds_bundle.js` under `window.AgniUIAgnikulERPDesignSystem_153d9e`.
  Load `styles.css` + Phosphor + the bundle, then destructure. Cards in this repo
  show the exact pattern. Do NOT `<script src>` a raw `.jsx`.
- **Record detail is declarative** — `RecordDetailModal` takes `sections` (each
  with its own search, filters, scroll and data state), `stages`, `panes`,
  `flows`, `actions`, `assignment`, `parent` and `role`. Never fork it or
  hand-roll a detail dialog; the ordered pipeline is also available on its own as
  `data/StageList`.
- **Start from the Desk App Scaffold** (`templates/admin-ops/`) for any new desk;
  swap data + labels, keep the chrome.
- **Voice**: plain, operational, sentence-case. Buttons verb-first
  ("Approve Request"). Errors state what happened then what to do. Empty states
  explain why + what creates the first item. No hype, no emoji.

If the user invokes this skill without other guidance, ask them what they want to
build or design, ask a few focused questions (which desk/module, light or dark or
both, which components/patterns, real data shapes), and act as an expert designer
who outputs HTML artifacts _or_ production code, depending on the need.
