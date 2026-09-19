# RequestDetailModal updates — for the AgniUI design-system project

This conversation can only read the design-system project, not write to it. Drop these files in (or ask Claude inside that project to apply them):

- `RequestDetailModal.tsx` → `components/erp/RequestDetailModal.tsx`
- `RequestDetailModal.d.ts` → `components/erp/RequestDetailModal.d.ts`
- Rebuild `_ds_bundle.js` afterwards so consumers (incl. the Desk App Scaffold at `templates/admin-ops/`, which uses the bundled component) pick the changes up.

## What changed

1. **Full-page expand** — new title-bar toggle (ph-corners-out / ph-corners-in) beside Activity log stretches the sheet to fill the viewport (square corners, no side margins) and back. Props: `expandable` (default true), `defaultExpanded` (default false).
2. **Collapsible "Essential details"** — the top section is now named with a caret toggle; collapsed it shows raised-by (avatar) | divider | project inline. Props: `defaultEssentialsOpen` (default true), `essentialsSummary` (ReactNode override for the collapsed summary). The section also gets `flexShrink:0` so long tab content can't crush it.

State resets on each open. Consider refreshing `request-detail.card.html` to demo both.
