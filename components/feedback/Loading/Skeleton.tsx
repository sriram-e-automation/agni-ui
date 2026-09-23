/**
 * @internal Renderer behind the public <Loading> — not part of the documented API
 * (no .d.ts, no specimen card). Import the public component instead.
 */
import React from "react";
import { Loading } from "./Loading.tsx";

export interface SkeletonProps {
  variant?: "line" | "block" | "circle";
  width?: number | string;
  height?: number | string;
  lines?: number;
  radius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ variant = "line", width, height, lines = 1, radius, style = {} }: SkeletonProps) {
  const shape = variant === "line" ? "text" : variant;
  return <Loading shape={shape as any} width={width} height={height} lines={lines} radius={radius} style={style} />;
}
