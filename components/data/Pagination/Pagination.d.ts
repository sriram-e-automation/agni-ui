import * as React from "react";
export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** 1-based current page. */
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  /** e.g. "1–25 of 312". */
  totalLabel?: React.ReactNode;
  /** Accessible names — override for localisation. */
  labels?: { nav?: string; previous?: string; next?: string; page?: (n: number) => string };
  style?: React.CSSProperties;
}
/** Windowed pager with prev/next. A "Pagination" navigation landmark; the
 *  current page carries aria-current="page"; every button is named.
 *  @version 1.1.0
 */
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
