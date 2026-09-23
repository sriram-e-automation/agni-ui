import * as React from "react";
export interface DateRange {
  start: Date; end: Date; label: string;
  gran?: "week" | "month" | "quarter" | "year" | null;
  gOffset?: number | null;
}
export interface DateRangeFilterProps {
  value?: DateRange | null;
  onChange?: (value: DateRange | null) => void;
  /** Center the panel as a scrimmed dialog (phone layouts). */
  isPhone?: boolean;
}
/** Compact toolbar date filter — granularity tabs + period navigator + custom From→To. */
export declare function DateRangeFilter(props: DateRangeFilterProps): JSX.Element;
/** Compute {start,end,lbl} for a granularity + offset from `now`.
 *  @version 1.0.0
 */
export declare function computePeriod(gran: "week" | "month" | "quarter" | "year", offset: number, now: Date): { start: Date; end: Date; lbl: string };
