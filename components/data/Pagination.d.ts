import * as React from "react";
export interface PaginationProps {
  /** 1-based current page. */
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  /** e.g. "1–25 of 312". */
  totalLabel?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Windowed pager with prev/next.
 *  @version 1.0.0
 */
export declare function Pagination(props: PaginationProps): JSX.Element;
