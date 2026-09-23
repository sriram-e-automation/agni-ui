import React, { forwardRef } from "react";
import { TabsStrip, tabPanelProps, type TabItem, type TabsProps as StripProps } from "./TabsStrip.tsx";
import { SegmentedControl, type SegmentedControlItem } from "./SegmentedControl.tsx";

/* ── Types (mirrored in Tabs.d.ts) ── */
export type { TabItem };
export type TabTrackItem = SegmentedControlItem;
export interface TabsProps extends StripProps {
  /** Pill-track items — renders the scope / view switch instead of `tabs`. */
  items?: TabTrackItem[] | null;
}

/**
 * AgniUI · Tabs
 * One tab strip. `tabs` renders the page strip (underline or segmented);
 * `items` renders the pill track used for scope / view switching.
 * SegmentedControl remains as an internal renderer.
 *
 * Page tabs are a WAI-ARIA tablist; the pill track is a radio group (it
 * switches a view, it doesn't reveal a panel). Both are one Tab stop with
 * arrow-key roving focus. `Tabs.panelProps(tabsId, key)` wires a panel.
 */
const TabsBase = forwardRef<HTMLDivElement, TabsProps>(function Tabs({ items = null, ...p }, ref) {
  if (items) {
    const { tabs, variant, size, activation, getPanelId, semantics, ...track } = p;
    return <SegmentedControl ref={ref} items={items} {...track} />;
  }
  return <TabsStrip ref={ref} {...p} />;
});

export const Tabs = Object.assign(TabsBase, {
  /** Props for the panel a tab controls. */
  panelProps: tabPanelProps,
});
