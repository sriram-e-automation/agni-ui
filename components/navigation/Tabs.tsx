import React from "react";
import { TabsStrip } from "./TabsStrip.tsx";
import { SegmentedControl } from "./SegmentedControl.tsx";

/**
 * AgniUI · Tabs
 * One tab strip. `tabs` renders the page strip (underline or segmented);
 * `items` renders the pill track used for scope / view switching.
 * SegmentedControl remains as an internal renderer.
 */
export function Tabs({ items = null, ...p }: any) {
  if (items) return <SegmentedControl items={items} {...p} />;
  return <TabsStrip {...p} />;
}
