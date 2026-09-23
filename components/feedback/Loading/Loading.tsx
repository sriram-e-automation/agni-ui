import React, { forwardRef, useEffect, useRef } from "react";

/* ── Types (mirrored in Loading.d.ts) ── */
export type LoadingShape =
  | "block" | "circle" | "text" | "heading" | "paragraph" | "button" | "iconButton" | "tag" | "badge" | "avatar"
  | "input" | "select" | "textarea" | "checkbox" | "switch" | "form" | "filterPanel" | "fileDropzone"
  | "card" | "panel" | "accordion" | "modal" | "banner" | "toast" | "emptyState"
  | "stat" | "quickStats" | "list" | "table" | "editableTable" | "pagination" | "tree" | "calendar" | "gantt"
  | "chart" | "barChart" | "lineChart" | "donut" | "gauge" | "sparkline" | "heatmap"
  | "kanban" | "kanbanCard" | "taskCard" | "personCard" | "approvalCard" | "approvalStepper"
  | "auditTrail" | "orgTree" | "documentPreview" | "requestForm" | "eventRow" | "attachmentRow"
  | "navRail" | "shellHeader" | "pageTitleBar" | "pageControls" | "page";

export interface LoadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** When false, children render normally. */
  loading?: boolean;
  /** Which component family the placeholder should mimic. */
  shape?: LoadingShape;
  /** Repeated units — rows, cards, list items, columns (shape-dependent). */
  rows?: number;
  /** Alias for `rows` on text shapes. */
  lines?: number;
  /** block — corner radius. */
  radius?: string;
  /** Columns for table/kanban/stat shapes. */
  columns?: number;
  width?: number | string;
  height?: number | string;
  /** Dim the real children and float a spinner instead of replacing them. Use for refresh-in-place. */
  overlay?: boolean;
  /** Screen-reader announcement while loading. */
  label?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  size?: number;
  /** Stroke color. Defaults to the brand accent. */
  color?: string;
  label?: string;
  style?: React.CSSProperties;
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  label?: string;
  /** Blur the underlying content as well as dimming it. */
  blur?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/* ── Shimmer primitives ── */
const SH: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--surface-sunken) 25%, var(--surface-soft) 50%, var(--surface-sunken) 75%)",
  backgroundSize: "200% 100%", animation: "agni-shimmer 1.4s var(--ease-standard) infinite",
};
const KEYS = (
  <style>{`@keyframes agni-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes agni-spin{to{transform:rotate(360deg)}}`}</style>
);
const Bar = ({ w = "100%", h = 12, r = "var(--radius-xs)", style = {} }: any) => (
  <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...SH, ...style }} />
);
const Dot = ({ d = 36, style = {} }: any) => (
  <div style={{ width: d, height: d, borderRadius: "50%", flexShrink: 0, ...SH, ...style }} />
);
const Box = ({ w = "100%", h = 80, r = "var(--radius-md)", style = {} }: any) => (
  <div style={{ width: w, height: h, borderRadius: r, ...SH, ...style }} />
);
const Row = ({ children, gap = 10, style = {} }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap, ...style }}>{children}</div>
);
const Col = ({ children, gap = 10, style = {} }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>
);
const Frame = ({ children, pad = 16, style = {} }: any) => (
  <div style={{
    border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
    background: "var(--surface-card, var(--surface-page))", padding: pad, ...style,
  }}>{children}</div>
);
const rep = (n: number, fn: (i: number) => React.ReactNode) => Array.from({ length: n }).map((_, i) => fn(i));

/* ── Shape registry: one entry per component family ── */
const SHAPES: Record<string, (o: { rows: number; columns: number }) => React.ReactNode> = {
  /* Primitives (absorbed from Skeleton, Aug 2026) — honour width/height/radius */
  block: () => <Box />,
  circle: () => <Dot />,

  /* Core / typography */
  text: ({ rows }) => <Col gap={8}>{rep(rows, i => <Bar key={i} w={i === rows - 1 && rows > 1 ? "60%" : "100%"} />)}</Col>,
  heading: () => <Col gap={10}><Bar w="42%" h={20} r="var(--radius-sm, 4px)" /><Bar w="66%" h={12} /></Col>,
  paragraph: ({ rows }) => <Col gap={8}>{rep(Math.max(rows, 3), i => <Bar key={i} w={i === Math.max(rows, 3) - 1 ? "45%" : "100%"} h={11} />)}</Col>,
  button: () => <Bar w={112} h={36} r="var(--radius-md)" />,
  iconButton: () => <Bar w={36} h={36} r="var(--radius-md)" />,
  tag: ({ rows }) => <Row gap={8}>{rep(Math.max(rows, 3), i => <Bar key={i} w={64} h={22} r="var(--radius-pill, 999px)" />)}</Row>,
  badge: () => <Bar w={48} h={20} r="var(--radius-pill, 999px)" />,
  avatar: () => <Row gap={12}><Dot d={36} /><Col gap={6} style={{ flex: 1 , minWidth: 0}}><Bar w="38%" h={11} /><Bar w="24%" h={9} /></Col></Row>,

  /* Forms */
  input: () => <Col gap={7}><Bar w={92} h={10} /><Bar h={38} r="var(--radius-md)" /></Col>,
  select: () => <Col gap={7}><Bar w={78} h={10} /><Bar h={38} r="var(--radius-md)" /></Col>,
  textarea: () => <Col gap={7}><Bar w={84} h={10} /><Box h={96} /></Col>,
  checkbox: ({ rows }) => <Col gap={12}>{rep(Math.max(rows, 3), i => <Row key={i} gap={10}><Bar w={16} h={16} r="var(--radius-xs)" /><Bar w={`${45 + (i % 3) * 12}%`} h={11} /></Row>)}</Col>,
  switch: ({ rows }) => <Col gap={14}>{rep(Math.max(rows, 2), i => <Row key={i} gap={12} style={{ justifyContent: "space-between" }}><Bar w="46%" h={11} /><Bar w={38} h={20} r="var(--radius-pill, 999px)" /></Row>)}</Col>,
  form: ({ rows, columns }) => (
    <Col gap={18}>
      <Bar w={148} h={13} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-4)" }}>
        {rep(Math.max(rows, 4), i => <Col key={i} gap={7}><Bar w="52%" h={10} /><Bar h={38} r="var(--radius-md)" /></Col>)}
      </div>
      <Row gap={10} style={{ justifyContent: "flex-end" }}><Bar w={96} h={36} r="var(--radius-md)" /><Bar w={112} h={36} r="var(--radius-md)" /></Row>
    </Col>
  ),
  filterPanel: ({ rows }) => <Col gap={16}>{rep(Math.max(rows, 3), i => <Col key={i} gap={8}><Bar w="40%" h={10} /><Bar h={34} r="var(--radius-md)" /></Col>)}</Col>,
  fileDropzone: () => (
    <div style={{ border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", justifyItems: "center", gap: "var(--space-3)" }}>
      <Dot d={40} /><Bar w={180} h={11} /><Bar w={120} h={9} />
    </div>
  ),

  /* Containment / feedback */
  card: () => <Frame><Col gap={12}><Row gap={12}><Dot d={32} /><Col gap={6} style={{ flex: 1 , minWidth: 0}}><Bar w="46%" h={12} /><Bar w="28%" h={9} /></Col></Row><Bar h={10} /><Bar w="72%" h={10} /></Col></Frame>,
  panel: ({ rows }) => (
    <Frame pad={0}>
      <Row gap={12} style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-subtle)", justifyContent: "space-between" }}>
        <Bar w={150} h={12} /><Bar w={72} h={26} r="var(--radius-md)" />
      </Row>
      <Col gap={12} style={{ padding: "var(--space-4)" }}>{rep(Math.max(rows, 3), i => <Bar key={i} w={i % 3 === 2 ? "62%" : "100%"} h={11} />)}</Col>
    </Frame>
  ),
  accordion: ({ rows }) => <Col gap={0}>{rep(Math.max(rows, 3), i => (
    <Row key={i} gap={12} style={{ justifyContent: "space-between", padding: "var(--space-4) var(--space-1)", borderBottom: "1px solid var(--border-subtle)" }}>
      <Bar w={`${38 + (i % 3) * 10}%`} h={12} /><Bar w={14} h={14} r="var(--radius-xs)" />
    </Row>
  ))}</Col>,
  modal: () => (
    <Frame pad={0} style={{ boxShadow: "var(--shadow-lg, 0 12px 32px rgba(0,0,0,.14))" }}>
      <Row gap={12} style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-subtle)", justifyContent: "space-between" }}>
        <Bar w={190} h={14} /><Bar w={18} h={18} r="var(--radius-xs)" />
      </Row>
      <Col gap={12} style={{ padding: "var(--space-5)" }}><Bar h={11} /><Bar h={11} /><Bar w="58%" h={11} /><Box h={72} style={{ marginTop: "var(--space-1)" }} /></Col>
      <Row gap={10} style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--border-subtle)", justifyContent: "flex-end" }}>
        <Bar w={92} h={34} r="var(--radius-md)" /><Bar w={112} h={34} r="var(--radius-md)" />
      </Row>
    </Frame>
  ),
  banner: () => <Frame pad={14}><Row gap={12}><Dot d={22} /><Col gap={7} style={{ flex: 1 , minWidth: 0}}><Bar w="34%" h={11} /><Bar w="72%" h={10} /></Col></Row></Frame>,
  toast: () => <Frame pad={14} style={{ width: 320, boxShadow: "var(--shadow-md, 0 6px 18px rgba(0,0,0,.10))" }}><Row gap={12}><Dot d={20} /><Col gap={6} style={{ flex: 1 , minWidth: 0}}><Bar w="52%" h={11} /><Bar w="86%" h={9} /></Col></Row></Frame>,
  emptyState: () => <Col gap={14} style={{ alignItems: "center", padding: "var(--space-8) 0" }}><Dot d={48} /><Bar w={200} h={13} /><Bar w={280} h={10} /><Bar w={128} h={34} r="var(--radius-md)" style={{ marginTop: "var(--space-1)" }} /></Col>,

  /* Data */
  stat: () => <Frame><Col gap={10}><Bar w="52%" h={10} /><Bar w="38%" h={24} r="var(--radius-sm, 4px)" /><Bar w={64} h={18} r="var(--radius-pill, 999px)" /></Col></Frame>,
  quickStats: ({ columns }) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-3)" }}>
      {rep(columns, i => <Frame key={i}><Col gap={10}><Bar w="56%" h={10} /><Bar w="42%" h={22} r="var(--radius-sm, 4px)" /><Bar w={58} h={16} r="var(--radius-pill, 999px)" /></Col></Frame>)}
    </div>
  ),
  list: ({ rows }) => <Col gap={0}>{rep(rows, i => (
    <Row key={i} gap={12} style={{ padding: "var(--space-3) var(--space-1)", borderBottom: "1px solid var(--border-subtle)" }}>
      <Dot d={30} /><Col gap={6} style={{ flex: 1 , minWidth: 0}}><Bar w={`${36 + (i % 4) * 9}%`} h={11} /><Bar w="26%" h={9} /></Col><Bar w={62} h={20} r="var(--radius-pill, 999px)" />
    </Row>
  ))}</Col>,
  table: ({ rows, columns }) => (
    <Frame pad={0}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-4)", padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-sunken)" }}>
        {rep(columns, i => <Bar key={i} w={i === 0 ? "70%" : "54%"} h={10} />)}
      </div>
      {rep(rows, r => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-4)", padding: "var(--space-3) var(--space-4)", borderBottom: r === rows - 1 ? "none" : "1px solid var(--border-subtle)" }}>
          {rep(columns, c => <Bar key={c} w={c === 0 ? "84%" : `${44 + ((r + c) % 4) * 12}%`} h={11} />)}
        </div>
      ))}
    </Frame>
  ),
  editableTable: ({ rows, columns }) => (
    <Frame pad={0}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-3)", padding: "var(--space-3) var(--space-3)", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-sunken)" }}>
        {rep(columns, i => <Bar key={i} w="58%" h={10} />)}
      </div>
      {rep(rows, r => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-3)", padding: "var(--space-2) var(--space-3)", borderBottom: "1px solid var(--border-subtle)" }}>
          {rep(columns, c => <Bar key={c} h={30} r="var(--radius-sm, 4px)" />)}
        </div>
      ))}
    </Frame>
  ),
  pagination: () => <Row gap={10} style={{ justifyContent: "space-between" }}><Bar w={150} h={11} /><Row gap={6}>{rep(5, i => <Bar key={i} w={30} h={30} r="var(--radius-md)" />)}</Row></Row>,
  tree: ({ rows }) => <Col gap={12}>{rep(Math.max(rows, 5), i => (
    <Row key={i} gap={10} style={{ paddingLeft: (i % 3) * 20 }}><Bar w={12} h={12} r="var(--radius-xs)" /><Bar w={`${30 + (i % 4) * 11}%`} h={11} /></Row>
  ))}</Col>,
  calendar: () => (
    <Frame pad={14}>
      <Row gap={12} style={{ justifyContent: "space-between", marginBottom: "var(--space-3)" }}><Bar w={130} h={13} /><Row gap={6}><Bar w={28} h={28} r="var(--radius-md)" /><Bar w={28} h={28} r="var(--radius-md)" /></Row></Row>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "var(--space-2)" }}>
        {rep(7, i => <Bar key={`h${i}`} h={9} />)}
        {rep(35, i => <Bar key={i} h={30} r="var(--radius-sm, 4px)" />)}
      </div>
    </Frame>
  ),
  gantt: ({ rows }) => (
    <Frame pad={14}>
      <Row gap={8} style={{ marginBottom: "var(--space-3)" }}>{rep(8, i => <Bar key={i} h={9} style={{ flex: 1, minWidth: 0 }} />)}</Row>
      <Col gap={12}>{rep(Math.max(rows, 5), i => (
        <Row key={i} gap={12}><Bar w={110} h={11} /><div style={{ flex: 1, position: "relative", height: 16 , minWidth: 0}}><Bar w={`${28 + (i % 4) * 16}%`} h={16} r="var(--radius-pill, 999px)" style={{ marginLeft: `${(i % 5) * 11}%` }} /></div></Row>
      ))}</Col>
    </Frame>
  ),

  /* Charts */
  chart: ({ columns }) => (
    <Frame pad={16}>
      <Row gap={12} style={{ justifyContent: "space-between", marginBottom: "var(--space-4)" }}><Bar w={160} h={12} /><Bar w={80} h={10} /></Row>
      <Row gap={10} style={{ alignItems: "flex-end", height: 150 }}>
        {rep(Math.max(columns, 7), i => <Bar key={i} h={50 + ((i * 37) % 62) * 1.5} r="var(--radius-sm, 4px)" style={{ alignSelf: "flex-end", flex: 1, minWidth: 0 }} />)}
      </Row>
      <Row gap={10} style={{ marginTop: "var(--space-3)" }}>{rep(Math.max(columns, 7), i => <Bar key={i} h={8} style={{ flex: 1, minWidth: 0 }} />)}</Row>
    </Frame>
  ),
  barChart: ({ columns }) => SHAPES.chart({ rows: 0, columns }) as any,
  lineChart: () => (
    <Frame pad={16}>
      <Bar w={160} h={12} style={{ marginBottom: "var(--space-4)" }} />
      <Box h={160} />
      <Row gap={10} style={{ marginTop: "var(--space-3)" }}>{rep(7, i => <Bar key={i} h={8} style={{ flex: 1, minWidth: 0 }} />)}</Row>
    </Frame>
  ),
  donut: () => (
    <Frame pad={16}>
      <Row gap={22}>
        <div style={{ position: "relative", width: 132, height: 132, flexShrink: 0 }}>
          <Dot d={132} />
          <div style={{ position: "absolute", inset: 34, borderRadius: "50%", background: "var(--surface-card, var(--surface-page))" }} />
        </div>
        <Col gap={12} style={{ flex: 1 , minWidth: 0}}>{rep(4, i => <Row key={i} gap={10}><Bar w={10} h={10} r="var(--radius-xs)" /><Bar w={`${40 + (i % 3) * 15}%`} h={10} /></Row>)}</Col>
      </Row>
    </Frame>
  ),
  gauge: () => <Frame pad={16}><Col gap={14} style={{ alignItems: "center" }}><Box h={90} w={180} r="180px 180px 0 0" /><Bar w={96} h={20} r="var(--radius-sm, 4px)" /><Bar w={128} h={9} /></Col></Frame>,
  sparkline: () => <Bar h={34} r="var(--radius-sm, 4px)" />,
  heatmap: ({ rows, columns }) => (
    <Frame pad={16}>
      <Bar w={150} h={12} style={{ marginBottom: "var(--space-4)" }} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(columns, 10)}, minmax(0,1fr))`, gap: "var(--space-1)" }}>
        {rep(Math.max(columns, 10) * Math.max(rows, 5), i => <Bar key={i} h={18} r="var(--radius-xs)" />)}
      </div>
    </Frame>
  ),

  /* ERP */
  kanbanCard: () => <Frame pad={12}><Col gap={10}><Row gap={8}><Bar w={56} h={18} r="var(--radius-pill, 999px)" /><Bar w={44} h={18} r="var(--radius-pill, 999px)" /></Row><Bar w="88%" h={12} /><Bar w="56%" h={10} /><Row gap={8} style={{ justifyContent: "space-between" }}><Bar w={72} h={9} /><Dot d={22} /></Row></Col></Frame>,
  kanban: ({ rows, columns }) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-3)", alignItems: "start" }}>
      {rep(columns, c => (
        <Col key={c} gap={10} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
          <Row gap={8} style={{ justifyContent: "space-between", marginBottom: 2 }}><Bar w="52%" h={10} /><Bar w={22} h={16} r="var(--radius-pill, 999px)" /></Row>
          {rep(Math.max(rows, 2), i => <div key={i}>{SHAPES.kanbanCard({ rows: 0, columns: 0 })}</div>)}
        </Col>
      ))}
    </div>
  ),
  taskCard: () => <Frame pad={14}><Col gap={10}><Row gap={10} style={{ justifyContent: "space-between" }}><Bar w="54%" h={12} /><Bar w={58} h={18} r="var(--radius-pill, 999px)" /></Row><Bar w="80%" h={10} /><Row gap={10} style={{ justifyContent: "space-between" }}><Row gap={8}><Dot d={22} /><Bar w={78} h={9} /></Row><Bar w={64} h={9} /></Row></Col></Frame>,
  personCard: () => <Frame pad={14}><Row gap={14}><Dot d={44} /><Col gap={7} style={{ flex: 1 , minWidth: 0}}><Bar w="44%" h={12} /><Bar w="30%" h={10} /><Bar w="60%" h={9} /></Col><Bar w={72} h={28} r="var(--radius-md)" /></Row></Frame>,
  approvalCard: () => <Frame pad={16}><Col gap={12}><Row gap={10} style={{ justifyContent: "space-between" }}><Bar w="42%" h={12} /><Bar w={70} h={20} r="var(--radius-pill, 999px)" /></Row><Bar w="72%" h={10} /><Bar w="52%" h={10} /><Row gap={10} style={{ marginTop: "var(--space-1)" }}><Bar w={96} h={32} r="var(--radius-md)" /><Bar w={88} h={32} r="var(--radius-md)" /></Row></Col></Frame>,
  approvalStepper: ({ rows }) => (
    <Row gap={0} style={{ justifyContent: "space-between" }}>
      {rep(Math.max(rows, 4), i => (
        <Row key={i} gap={0} style={{ flex: i === Math.max(rows, 4) - 1 ? "0 0 auto" : 1, alignItems: "center" }}>
          <Col gap={8} style={{ alignItems: "center" }}><Dot d={28} /><Bar w={62} h={9} /></Col>
          {i !== Math.max(rows, 4) - 1 && <Bar h={3} style={{ flex: 1, margin: "0 var(--space-2)", alignSelf: "flex-start", marginTop: "var(--space-3)" , minWidth: 0}} />}
        </Row>
      ))}
    </Row>
  ),
  eventRow: () => <Row gap={10} style={{ padding: "var(--space-2)" }}><Bar w={3} h={34} r="var(--radius-xs)" /><Col gap={7} style={{ flex: 1, minWidth: 0 }}><Bar w="46%" h={11} /><Bar w="30%" h={9} /></Col></Row>,
  attachmentRow: () => <Row gap={12} style={{ padding: "var(--space-2) var(--space-3)" }}><Dot d={20} /><Col gap={6} style={{ flex: 1, minWidth: 0 }}><Bar w="42%" h={11} /><Bar w="24%" h={9} /></Col></Row>,
  auditTrail: ({ rows }) => <Col gap={0}>{rep(Math.max(rows, 4), i => (
    <Row key={i} gap={14} style={{ alignItems: "flex-start", paddingBottom: "var(--space-5)" }}>
      <Col gap={0} style={{ alignItems: "center" }}><Dot d={22} />{i !== Math.max(rows, 4) - 1 && <Bar w={2} h={44} style={{ marginTop: "var(--space-1)" }} />}</Col>
      <Col gap={7} style={{ flex: 1, paddingTop: 3 , minWidth: 0}}><Bar w={`${40 + (i % 3) * 12}%`} h={11} /><Bar w="30%" h={9} /></Col>
    </Row>
  ))}</Col>,
  orgTree: () => (
    <Col gap={26} style={{ alignItems: "center" }}>
      <Box w={150} h={54} />
      <Row gap={18}>{rep(3, i => <Box key={i} w={130} h={54} />)}</Row>
      <Row gap={14}>{rep(4, i => <Box key={i} w={106} h={48} />)}</Row>
    </Col>
  ),
  documentPreview: () => (
    <Frame pad={0}>
      <Row gap={12} style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-subtle)", justifyContent: "space-between" }}><Bar w={180} h={11} /><Row gap={6}><Bar w={28} h={28} r="var(--radius-md)" /><Bar w={28} h={28} r="var(--radius-md)" /></Row></Row>
      <div style={{ padding: "var(--space-5)", background: "var(--surface-sunken)" }}><Box h={280} style={{ background: "var(--surface-soft)" }} /></div>
    </Frame>
  ),
  requestForm: ({ columns }) => (
    <Frame pad={20}>
      <Col gap={20}>
        <Col gap={8}><Bar w="34%" h={15} /><Bar w="56%" h={10} /></Col>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: "var(--space-4)" }}>
          {rep(6, i => <Col key={i} gap={7}><Bar w="48%" h={10} /><Bar h={38} r="var(--radius-md)" /></Col>)}
        </div>
        <Col gap={7}><Bar w="24%" h={10} /><Box h={90} /></Col>
        <Row gap={10} style={{ justifyContent: "flex-end" }}><Bar w={92} h={36} r="var(--radius-md)" /><Bar w={124} h={36} r="var(--radius-md)" /></Row>
      </Col>
    </Frame>
  ),

  /* Chrome */
  navRail: ({ rows }) => (
    <Col gap={8} style={{ width: 232, padding: "var(--space-3)", borderRight: "1px solid var(--border-subtle)", height: "100%", boxSizing: "border-box" }}>
      <Row gap={10} style={{ marginBottom: "var(--space-3)" }}><Dot d={28} /><Bar w={104} h={12} /></Row>
      {rep(Math.max(rows, 6), i => <Row key={i} gap={10} style={{ padding: "var(--space-2) 0" }}><Bar w={18} h={18} r="var(--radius-xs)" /><Bar w={`${52 + (i % 3) * 14}%`} h={11} /></Row>)}
    </Col>
  ),
  shellHeader: () => (
    <Row gap={16} style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--border-subtle)", justifyContent: "space-between" }}>
      <Row gap={12}><Dot d={28} /><Bar w={128} h={12} /></Row>
      <Bar w={280} h={32} r="var(--radius-md)" />
      <Row gap={10}><Bar w={30} h={30} r="var(--radius-md)" /><Bar w={30} h={30} r="var(--radius-md)" /><Dot d={30} /></Row>
    </Row>
  ),
  pageControls: () => (
    <Row gap={8} style={{ justifyContent: "space-between", flexWrap: "wrap", rowGap: "var(--space-2)" }}>
      <Row gap={8}><Bar w={112} h={34} r="var(--radius-md)" /><Bar w={34} h={34} r="var(--radius-md)" /></Row>
      <Row gap={8}><Bar w={34} h={34} r="var(--radius-md)" /><Bar w={34} h={34} r="var(--radius-md)" /><Bar w={112} h={34} r="var(--radius-md)" /><Bar w={196} h={34} r="var(--radius-md)" /><Bar w={128} h={34} r="var(--radius-md)" /></Row>
    </Row>
  ),
  pageTitleBar: () => (
    <Col gap={14}>
      <Bar w={190} h={9} />
      <Row gap={16} style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <Col gap={9}><Bar w={260} h={20} r="var(--radius-sm, 4px)" /><Bar w={340} h={10} /></Col>
        <Row gap={10}><Bar w={98} h={36} r="var(--radius-md)" /><Bar w={124} h={36} r="var(--radius-md)" /></Row>
      </Row>
    </Col>
  ),
  page: ({ rows, columns }) => (
    <Col gap={22}>
      {SHAPES.pageTitleBar({ rows: 0, columns: 0 })}
      {SHAPES.pageControls({ rows: 0, columns: 0 })}
      {SHAPES.quickStats({ rows: 0, columns: Math.max(columns, 4) })}
      {SHAPES.table({ rows: Math.max(rows, 5), columns: Math.max(columns, 5) })}
    </Col>
  ),
};

/** Every shape name — useful for enum controls in the workbench. */
export const LoadingShapes = Object.keys(SHAPES);

const DEFAULTS: Record<string, { rows: number; columns: number }> = {
  table: { rows: 6, columns: 5 }, editableTable: { rows: 5, columns: 5 },
  list: { rows: 5, columns: 1 }, quickStats: { rows: 1, columns: 4 },
  kanban: { rows: 2, columns: 4 }, chart: { rows: 1, columns: 8 }, barChart: { rows: 1, columns: 8 },
  heatmap: { rows: 5, columns: 12 }, form: { rows: 4, columns: 2 }, requestForm: { rows: 6, columns: 2 },
  page: { rows: 5, columns: 4 }, navRail: { rows: 6, columns: 1 },
};

/**
 * AgniUI · Spinner
 * Indeterminate circular indicator. Use inside buttons, inline, or in an overlay.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 20, color, label = "Loading", style = {}, ...rest },
  ref,
) {
  return (
    <span {...rest} ref={ref} role="status" aria-label={label} style={{ display: "inline-flex", ...style }}>
      <span aria-hidden="true" style={{
        width: size, height: size, borderRadius: "50%", display: "inline-block",
        border: `${Math.max(2, Math.round(size / 10))}px solid var(--border-subtle)`,
        borderTopColor: color || "var(--text-brand, currentColor)",
        animation: "agni-spin .7s linear infinite",
      }} />
      {KEYS}
    </span>
  );
});

/**
 * AgniUI · LoadingOverlay
 * Keeps existing content on screen and dims it while new data arrives.
 * Use for refresh-in-place; use Loading (skeleton) for first paint.
 */
export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(function LoadingOverlay(
  { loading = true, label = "Loading", blur = false, style = {}, children, ...rest },
  ref,
) {
  /* Dimmed content must be unreachable by keyboard too, not just by pointer —
     `inert` (set imperatively: React 18 has no boolean prop for it). */
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = content.current;
    if (!el) return;
    if (loading) el.setAttribute("inert", ""); else el.removeAttribute("inert");
  }, [loading]);
  return (
    <div {...rest} ref={ref} style={{ position: "relative", ...style }}>
      <div ref={content} aria-busy={loading || undefined} style={{
        opacity: loading ? 0.45 : 1,
        filter: loading && blur ? "blur(1.5px)" : "none",
        pointerEvents: loading ? "none" : "auto",
        transition: "opacity .18s ease, filter .18s ease",
      }}>{children}</div>
      {loading && (
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          background: "color-mix(in oklab, var(--surface-page) 42%, transparent)",
          borderRadius: "var(--radius-md)",
        }}>
          <Spinner size={26} label={label} />
        </div>
      )}
    </div>
  );
});

/**
 * AgniUI · Loading
 * One loading state for every component family. `shape` picks a skeleton that
 * mirrors the real component's silhouette, so layout doesn't jump on data arrival.
 * Set `overlay` to dim existing children instead of replacing them.
 */
export const Loading = forwardRef<HTMLDivElement, LoadingProps>(function Loading({
  loading = true, shape = "text", rows, columns, width, height, radius, lines,
  overlay = false, label = "Loading", style = {}, children, ...rest
}, ref) {
  if (!loading) return <>{children}</>;
  if (overlay) return <LoadingOverlay {...rest} ref={ref} loading label={label} style={style}>{children}</LoadingOverlay>;

  const d = DEFAULTS[shape] || { rows: 3, columns: 3 };
  const render = SHAPES[shape] || SHAPES.text;

  /* block / circle are sized by the caller, not by a silhouette. */
  if (shape === "block") return <Box w={width || "100%"} h={height || 80} r={radius} style={style} />;
  if (shape === "circle") return <Dot d={(width || height || 36) as any} style={style} />;

  return (
    <div {...rest} ref={ref} role="status" aria-busy="true" aria-live="polite"
      style={{ width: width || "100%", height, ...style }}>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{label}</span>
      {render({ rows: rows ?? lines ?? d.rows, columns: columns ?? d.columns })}
      {KEYS}
    </div>
  );
});
