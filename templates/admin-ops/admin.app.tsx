/* AgniUI — Desk App Scaffold.
   The CANONICAL Desk-app shell for the whole design system: rail-aligned
   header, collapsible left nav, page title + controls, quick-stats,
   a content region (table / card / kanban / empty), the right Workspace
   pane, the App Switcher overlay, and the signature footer.

   This file is intentionally generic — swap data.js + the labels below
   for a real module. All chrome (Workspace pane, App Switcher, Settings
   accent picker, theming) is consumed straight from the DS bundle:
   WorkspacePane · AppSwitcher · SettingsMenu · Theme.                    */
const { useState, useRef, useEffect, useLayoutEffect } = React;
/* The DS bundle loads from the helmet and may settle AFTER this module
   evaluates (load-order race — intermittent React #130). Bind the namespace
   lazily via `let` bindings and gate the root render until it exists. */
const DS_NS = "AgniUIAgnikulERPDesignSystem_153d9e";
let DS; // bound only once the namespace's exports actually exist (see bindDS)
let StatusChip, Sheet, SearchSelect, CreatableSelect, UserSelect, MultiUserSelect, FileDropzone, DiscardConfirmModal, ReviewSubmitModal, BulkActionConfirm, KanbanCard,
    Button, IconButton, Avatar, Badge, Tag, Input, DatePicker, DSRecordForm,
    SplitButton, Modal, FileUpload,
    AppShell, Bar, Cluster,
    BarChart, LineChart, DonutChart, GanttTimeline, Calendar,
    DataTable, Tabs, PersonCard, OrgTree,
    WorkspacePane, AppSwitcher, SettingsMenu, NotificationsMenu, Theme,
    RecordDetailModal, BulkActionToolbar, ConfirmModal, Panel,
    QuantityStepper, RichTextEditor, EditableTable,
    Select, RadioGroup, Checkbox, Textarea,
    ShellHeader, ShellFooter, AvatarStack, FilterPanel, DateRangeFilter,
    FormField, FormSection, Field,
    NavRail, DSPageTitleBar, DSQuickStats, TaskCard, DSKanbanBoard, DSSubmitConfirmModal, ImportRecordsModal, ApprovalCard,
    PanelIconMenu, MenuRow, PanelEmpty, DSEmptyState, ErrorState, DSPageControls,
    RecordCard, DropdownMenu, Card,
    DetailSection, DetailList, KeyValueRow, CopyButton, StatCard, AttachmentRow,
    OptionRow, ActionTile, Rating, ChartCard, EventRow;
function bindDS() {
  const ns = window[DS_NS];
  /* The namespace object is created BEFORE its exports are attached —
     readiness must be a sentinel export, never object truthiness. Gate on the
     NEWEST exports this file destructures so a stale bundle keeps us polling. */
  if (!ns || !ns.AppShell || !ns.AppSwitcher || !ns.NavRail || !ns.RecordForm || !ns.PanelEmpty || !ns.KanbanBoard || !ns.ConfirmModal || !ns.EmptyState || !ns.ErrorState || !ns.PageControls || !ns.RecordCard || !ns.DetailSection || !ns.OptionRow || !ns.ChartCard) return false;
  DS = ns;
  ({
    Button, Avatar, Tag, Input, DatePicker,
    Modal, FileUpload,
    AppShell, Bar, Cluster,
    BarChart, LineChart, DonutChart, GanttTimeline, Calendar,
    DataTable, Tabs, PersonCard, OrgTree,
    WorkspacePane, AppSwitcher, SettingsMenu, NotificationsMenu, Theme,
    RecordDetailModal, BulkActionToolbar, ConfirmModal, Panel,
    QuantityStepper, RichTextEditor, EditableTable,
    Select, RadioGroup, Checkbox, Textarea,
    ShellHeader, ShellFooter, AvatarStack, FilterPanel, DateRangeFilter,
    FormField, FormSection, NavRail,
    PageTitleBar: DSPageTitleBar, QuickStats: DSQuickStats, KanbanBoard: DSKanbanBoard,
    RecordForm: DSRecordForm,
    PanelIconMenu, MenuRow, PanelEmpty,
    EmptyState: DSEmptyState, ErrorState, PageControls: DSPageControls,
    RecordCard, DropdownMenu, Card,
    DetailSection, DetailList, KeyValueRow, CopyButton, StatCard, AttachmentRow,
    OptionRow, ActionTile, Rating, ChartCard, EventRow,
  } = DS);
  Field = FormField;
  /* Page-local aliases over the public API. The library exposes one component
     per job (Button · Tag · Panel · Select · FileUpload · ConfirmModal ·
     RecordCard); these keep this module's call sites unchanged. */
  Badge = (p) => <Tag variant="status" {...p} />;
  StatusChip = (p) => <Tag {...p} />;
  IconButton = (p) => <Button iconOnly {...p} />;
  SplitButton = (p) => <Button {...p} />;
  Sheet = (p) => <Panel variant="sheet" {...p} />;
  SearchSelect = (p) => <Select searchable {...p} />;
  CreatableSelect = (p) => <Select creatable {...p} />;
  UserSelect = (p) => <Select {...p} />;
  MultiUserSelect = (p) => <Select multiple {...p} />;
  FileDropzone = (p) => <FileUpload {...p} />;
  DiscardConfirmModal = (p) => <ConfirmModal variant="discard" {...p} />;
  ReviewSubmitModal = (p) => <ConfirmModal variant="review" {...p} />;
  BulkActionConfirm = (p) => <ConfirmModal variant="bulk" {...p} />;
  ImportRecordsModal = (p) => <ConfirmModal variant="import" {...p} />;
  DSSubmitConfirmModal = (p) => <ConfirmModal variant="submitted" {...p} />;
  KanbanCard = (p) => <RecordCard preset="kanban" record={p} status={p.status} people={p.assignees || p.people} showStatus={p.showStatus} selected={p.selected} busy={p.busy} disabled={p.disabled} onApprove={p.onApprove} onReject={p.onReject} onView={p.onClick} style={p.style} />;
  TaskCard = ({ card, lane, ...r }) => <RecordCard preset="task" record={card} status={lane} {...r} />;
  ApprovalCard = ({ row, highlight, ...r }) => <RecordCard preset="approval" record={row} selected={highlight} {...r} />;
  return true;
}
bindDS();

/* ── Types — data contracts for the scaffold (window.SCAFFOLD_* seeds) ── */
interface ScaffoldRecord { id: string; owner: string; category: string; group: string; status: string; date: string; }
interface BoardApp { name: string; icon: string; }
interface EffortInfo { total: string; intervals: number; running?: boolean; current?: string; startedAt?: string; }
interface BoardCard {
  id: string; app?: BoardApp; requestType: string; requestedBy: string; requestedFor: string;
  date: string; priority: "High" | "Med" | "Low";
  assignee?: string; assignees?: string[]; assignedOn?: string; startedOn?: string;
  dueSince?: string; completedOn?: string; days?: number; effort?: EffortInfo; rejectedBy?: string;
}
interface Person { id: string; name: string; team: string; }
interface NotificationEntry { id: string; icon?: string; title?: string; message: string; time?: string; date?: string; read: boolean; }
interface Wallpaper { key: string; label: string; src?: string; color?: string; }
declare global {
  interface Window {
    SCAFFOLD_RECORDS?: ScaffoldRecord[];
    SCAFFOLD_BOARD?: Record<string, BoardCard[]>;
    SCAFFOLD_BOARD_PEOPLE?: Person[];
    SCAFFOLD_NOTIFICATIONS?: NotificationEntry[];
    recordTone?: (s: string) => string;
  }
}
type ViewMode = "list" | "kanban" | "card" | "timeline" | "calendar";
type PageKey = "quick" | "dashboard" | "requests" | "assignments" | "records" | string;

interface HeaderProps {
  navOpen: boolean; railW: string; dark: boolean; setDark: (v: boolean) => void;
  accent: string | null; setAccent: (v: string | null) => void;
  wallpaper: string; setWallpaper: (v: string) => void;
  scale: string; setScale: (v: string) => void;
  isPhone: boolean; onMenu?: () => void; active: PageKey;
}
interface ScaffoldNavProps {
  active: PageKey; setActive: (k: PageKey) => void;
  navOpen: boolean; setNavOpen: (v: boolean) => void;
  dark: boolean; overlay?: boolean; onClose?: () => void;
}
interface PageTitleBarProps {
  active: PageKey; tab: string; setTab: (t: string) => void; dark: boolean;
  viewMode?: ViewMode; setViewMode?: (v: ViewMode) => void;
}
/** Fetch state every records view accepts — spread as {...dataState}. */
interface DataState { loading?: boolean; error?: React.ReactNode | boolean; onRetry?: () => void; }
interface KanbanBoardProps extends DataState { q: string; dark: boolean; onView?: (card: BoardCard, col: string) => void; }
interface RecordsTableProps extends DataState { q: string; dark: boolean; statFilter: string | null; filterVals: Record<string, unknown>; onView?: (row: ScaffoldRecord) => void; }
interface AvatarStackProps { names?: string[]; max?: number; size?: "xs" | "sm" | "md" | "lg"; solid?: boolean; }
interface AdminAppImplProps { formColumns?: 2 | 3; detailColumns?: 2 | 3; }

const RAIL_OPEN   = "var(--rail-drawer-w-md)";
const RAIL_CLOSED = "var(--rail-w)";

/* ── Viewport breakpoints — mirror spacing.css (--bp-tablet 640 · --bp-desktop
   1024). phone <640 · tablet 640–1023 · desktop ≥1024. Tokens already restyle
   widths/grid; this hook drives the chrome decisions tokens can't express:
   rail MODE (drawer ⇄ icon ⇄ overlay) and whether the workspace pane mounts. */
function useBreakpoint() {
  const read = () => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    return w < 640 ? "phone" : w < 1024 ? "tablet" : "desktop";
  };
  const [bp, setBp] = useState(read);
  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setBp(read())); };
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return bp;
}

const DARK_CSS = `
  .admin-app[data-theme="dark"] input[type="checkbox"] { accent-color:#7ED4A4; }
  @keyframes agni-scale-in {
    from { opacity: 0; transform: scale(0.97) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes agni-stat-in {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0);     }
  }
  @keyframes agni-effort-pulse {
    0%,100% { opacity: 1;   transform: scale(1);   }
    50%     { opacity: 0.35; transform: scale(0.82); }
  }
`;



/* ── Left nav ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { key:"quick",       label:"Quick access",    icon:"ph-lightning"        },
  { key:"dashboard",   label:"Dashboard",       icon:"ph-chart-pie-slice"  },
  { key:"requests",    label:"Request tracker", icon:"ph-list-checks"      },
  { key:"assignments", label:"Assignments",     icon:"ph-kanban"           },
  { key:"crew",        label:"Crew directory",  icon:"ph-users-three"      },
];

/* ── Quick-stats ───────────────────────────────────────────────── */
const STAT_CARDS = [
  { icon:"ph-stack",        label:"All records", value:"28", accent:"var(--text-brand)", filterKey:null,     filterVal:null       },
  { icon:"ph-clock",        label:"Pending",     value:"08", accent:"var(--status-warning)", filterKey:"status", filterVal:"Pending"  },
  { icon:"ph-check-circle", label:"Approved",    value:"10", accent:"var(--status-success)", filterKey:"status", filterVal:"Approved" },
  { icon:"ph-hourglass",    label:"In review",   value:"07", accent:"var(--status-info)", filterKey:"status", filterVal:"In Review"},
  { icon:"ph-x-circle",     label:"Rejected",    value:"03", accent:"var(--status-error)", filterKey:"status", filterVal:"Rejected" },
];

/* ── Workspace pane items (consumed by DS <WorkspacePane>) ───────── */
/* Base items — pinned apps are injected dynamically from AdminApp state */
const BASE_WORKSPACE_ITEMS_TOP = [
  { key:"apps", icon:"ph-dots-nine", label:"App switcher" },
  "divider",
];
const BASE_WORKSPACE_ITEMS_BOTTOM = [
  "spacer",
  "divider",
  { key:"tasks",     icon:"ph-check-square",   label:"Tasks",      badge:3,  launch:true },
  { key:"approvals", icon:"ph-seal-check",      label:"Approvals",  badge:7,  launch:true },
  { key:"calendar",  icon:"ph-calendar-blank",  label:"Calendar",             launch:true },
  "divider",
  { key:"support",   icon:"ph-headset",         label:"Support",              launch:true },
  { key:"ai",        icon:"ph-robot",           label:"AI Chat",              launch:true },
];

const VIEW_MODES = [
  { key:"list",     icon:"ph-list",         title:"List view"     },
  { key:"kanban",   icon:"ph-kanban",       title:"Kanban view"   },
  { key:"card",     icon:"ph-squares-four", title:"Card view"     },
  { key:"timeline", icon:"ph-timer",        title:"Timeline view" },
  { key:"calendar", icon:"ph-calendar-dots",title:"Calendar view" },
];

const PRIS = ["High","Med","Low"];
const priOf = (id) => PRIS[parseInt(id.replace(/\D/g,""))%3];
const iniOf = (name) => name.split(" ").map(n=>n[0]).join("").slice(0,2);
const updOf = (d) => d.replace("Jun 2026","Jul 2026").replace("May 2026","Jun 2026");
const PRI_C = { High:"var(--status-error)", Med:"var(--status-warning)", Low:"var(--text-tertiary)" };

const ALL_COLS = [
  { key:"id",       label:"Record ID" },{ key:"date",    label:"Created"   },
  { key:"owner",    label:"Owner"     },{ key:"status",  label:"Status"    },
  { key:"category", label:"Category"  },{ key:"group",   label:"Group"     },
  { key:"priority", label:"Priority"  },{ key:"assignee",label:"Assignee"  },
  { key:"updated",  label:"Updated"   },
];
const DEFAULT_COLS = ["id","date","owner","status"];

/* Pixel widths shared between the fixed thead table and scrollable tbody table */
const COL_W = { chk:48, id:110, date:110, owner:170, status:110, category:120, group:120, priority:82, assignee:80, updated:110, action:90 };

/* ── App Switcher data (passed to DS <AppSwitcher>) ─────────────── */
const APP_SWITCHER_QUICK = [
  { label:"Add new task",       icon:"ph-plus-circle" },
  { label:"Book Food",          icon:"ph-fork-knife"  },
  { label:"Book Daily commute", icon:"ph-car"         },
];

const APP_CATEGORIES = [
  { key:"wellness", label:"Employee Wellness",  icon:"ph-heartbeat", apps:[
    { label:"Payroll\nManagement",     icon:"ph-money"       },
    { label:"HR\nOperations",          icon:"ph-users-three" },
    { label:"Food &\nBeverages",       icon:"ph-fork-knife"  },
    { label:"Recruitment\nManagement", icon:"ph-briefcase"   },
  ]},
  { key:"bizops",   label:"Business Operations", icon:"ph-trend-up", apps:[
    { label:"Sourcing\nManagement",    icon:"ph-package"       },
    { label:"Procurement\nManagement", icon:"ph-shopping-cart" },
    { label:"Inventory\nManagement",   icon:"ph-warehouse"     },
    { label:"Finance\nManagement",     icon:"ph-bank"          },
    { label:"Budget\nManagement",      icon:"ph-chart-pie"     },
    { label:"Expense\nManagement",     icon:"ph-receipt"       },
  ]},
  { key:"process",  label:"Process Operations",  icon:"ph-gear-six", apps:[
    { label:"Quality\nManagement",   icon:"ph-seal-check"  },
    { label:"Safety\nManagement",    icon:"ph-shield-check"},
    { label:"Program\nManagement",   icon:"ph-terminal"    },
  ]},
  { key:"support",  label:"Support Operations",  icon:"ph-wrench", apps:[
    { label:"Maintenance\nManagement",       icon:"ph-wrench"   },
    { label:"Engineering &\nInfrastructure", icon:"ph-hard-hat" },
    { label:"Packaging\nManagement",         icon:"ph-package"  },
    { label:"Information\nTechnology",       icon:"ph-desktop"  },
    { label:"Fleet\nManagement",             icon:"ph-truck"    },
  ]},
  { key:"product",  label:"Product",              icon:"ph-stack", apps:[
    { label:"CAD\nManagement",               icon:"ph-cube"         },
    { label:"Design For\nRealization",       icon:"ph-pencil-ruler" },
    { label:"Manufacturing\nManagement",     icon:"ph-factory"      },
    { label:"Instrumentation\nand Software", icon:"ph-circuit-board"},
  ]},
];

/* ══════ 1 · Header ═════════════════════════════════════════════*/
/* ── Content backgrounds — user-set via Settings, persisted locally.
   Subtle solid-tint options (soft, theme-adaptive tokens) come first and are
   the default; image wallpapers are opt-in extras further down the list. ── */
const WALLPAPERS = [
  { key:"sage",   label:"Sage",       color:"var(--surface-brand-soft)" },
  { key:"sky",    label:"Sky",        color:"var(--hue-info-soft)" },
  { key:"sand",   label:"Sand",       color:"var(--hue-warning-soft)" },
  { key:"lilac",  label:"Lilac",      color:"var(--hue-violet-soft)" },
  { key:"none",   label:"None" },
  { key:"earth",  label:"Earth orbit", src:"wallpapers/earth.jpg" },
  { key:"space",  label:"Deep space", src:"wallpapers/space.png" },
  { key:"aurora", label:"Aurora",     src:"wallpapers/aurora.png" },
  { key:"dawn",   label:"Dawn",       src:"wallpapers/dawn.png" },
];
const WALLPAPER_LS_KEY = "agni-admin-wallpaper";
const SCALE_LS_KEY = "agni-admin-scale";

/* Header — thin wrapper over the DS ShellHeader (chrome). All chrome sub-
   components (brand cell, module tile, NotificationsMenu bell, SettingsMenu
   gear, AvatarStack presence, profile menu) live in the DS bundle. */
function Header({ navOpen, railW, dark, setDark, accent, setAccent, wallpaper, setWallpaper, scale, setScale, isPhone, onMenu, active }: HeaderProps) {
  const [notifItems, setNotifItems] = useState<NotificationEntry[]>(() => window.SCAFFOLD_NOTIFICATIONS || []);
  return (
    <ShellHeader
      logoSrc="../../assets/logos/agnikul-wordmark.svg"
      monogramSrc="../../assets/logos/agnikul-monogram-flame.svg"
      brandAlt="Agnikul"
      moduleName="Module Name" version="v1.0.0"
      workspaceLabel="Workspace" pageTitle={(PAGE_META[active]||{}).title||"Records"}
      user={{ name:"Aravind Prabhu", role:"Workspace · Lead" }}
      profileItems={[{ icon:"ph-arrows-left-right", label:"Switch desk" }, { icon:"ph-sign-out", label:"Log out", danger:true }]}
      activeUsers={(window.SCAFFOLD_BOARD_PEOPLE || []).map((p) => p.name)}
      notifications={notifItems} onNotificationsChange={setNotifItems}
      dark={dark} onDarkChange={setDark} accent={accent} onAccentChange={setAccent}
      wallpaper={wallpaper} onWallpaperChange={setWallpaper} wallpapers={WALLPAPERS}
      scale={scale} onScaleChange={setScale}
      navOpen={navOpen} railW={railW} isPhone={isPhone} onMenu={onMenu}
    />
  );
}

/* ══════ 2 · Nav ════════════════════════════════════════════════*/
function ScaffoldNav({ active, setActive, navOpen, setNavOpen, dark, overlay=false, onClose }: ScaffoldNavProps) {
  return <NavRail items={NAV_ITEMS} active={active} onSelect={setActive} open={navOpen} onToggleOpen={setNavOpen} overlay={overlay} onClose={onClose} dark={dark}
    footerLogoSrc="../../assets/logos/automation-logo.svg" defaultExpanded={["records"]} />;
}


/* ══════ 3 · Page title bar ════════════════════════════════════*/
const PAGE_META = {
  quick:       { title:"Quick access",    icon:"ph-lightning",       tabs:[] },
  dashboard:   { title:"Dashboard",       icon:"ph-chart-pie-slice", tabs:[] },
  requests:    { title:"Request tracker", icon:"ph-list-checks",
    tabs:[{key:"all",label:"All",count:28},{key:"your",label:"Mine",count:8},{key:"team",label:"Team",count:14},{key:"org",label:"Organisation",count:6}] },
  assignments: { title:"Assignments",     icon:"ph-kanban",          tabs:[] },
  crew:        { title:"Crew directory",  icon:"ph-users-three",     tabs:[],
    views:[{ key:"list", icon:"ph-list", title:"Table view" }, { key:"tree", icon:"ph-tree-structure", title:"Reporting line-up" }] },
};
function PageTitleBar({ active, tab, setTab, dark, viewMode, setViewMode }: PageTitleBarProps) {
  const meta = PAGE_META[active] || PAGE_META["records"];
  const showViewModes = setViewMode && (meta.tabs.length > 0 || !!meta.views);
  return <DSPageTitleBar title={meta.title} icon={meta.icon} tabs={meta.tabs} tab={tab} onTabChange={setTab}
    viewModes={showViewModes ? (meta.views || VIEW_MODES) : []} viewMode={viewMode} onViewModeChange={setViewMode} />;
}

/* ══════ 3.5 · Date-range filter ════════════════════════════════
   Granularity tab (Week · Month · Quarter · Year) + ← period →
   navigator so any past or future period is reachable. Custom
   From→To overrides the navigator. Trigger stays compact: 36px
   icon-only when idle; a joined calendar-check + × pair (~62px)
   when active — no text label. Fixed-position panel escapes the
   toolbar's overflow:hidden.                                       */
const DR_MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
/* ══════ 3.6 · Filter panel ═════════════════════════════════════
   Multi-field popover filter. Mirrors DateRangeFilter's compact
   trigger + fixed-position panel pattern exactly.
   Idle: 36px funnel outline. Active: filled funnel + count badge
   + × clear. Options are Status, Priority, Category, Group.      */
const FP_STATUS_DOT  = { Pending:"var(--status-warning)", Approved:"var(--status-success)", "In Review":"var(--status-info)", Rejected:"var(--status-error)" };
const FP_STATUSES    = ['Pending','Approved','In Review','Rejected'];
const FP_PRIORITIES  = ['High','Med','Low'];
const FP_CATEGORIES  = ['Type A','Type B','Type C','Type D','Type E'];
const FP_GROUPS      = ['Group One','Group Two','Group Three','Group Four','Group Five'];
const FP_SECTIONS = [
  { key:"status",   label:"Status",   options:FP_STATUSES,   dots:FP_STATUS_DOT },
  { key:"priority", label:"Priority", options:FP_PRIORITIES, dots:PRI_C },
  { key:"category", label:"Category", options:FP_CATEGORIES },
  { key:"group",    label:"Group",    options:FP_GROUPS },
];


/* ══════ Import Records Modal — DS ImportRecordsModal (defaults match this module's format) ══*/
function ImportModal({ open, onClose }) { return <ImportRecordsModal open={open} onClose={onClose} />; }
function downloadImportTemplate() {
  const csv = [
    "Record ID,Owner,Category,Group,Status,Priority,Created",
    "REC-001,Aravind Prabhu,Type A,Group One,Pending,High,20 Jun 2026",
    "REC-002,Priya Menon,Type B,Group Two,Approved,Med,19 Jun 2026",
  ].join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "records-import-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ══════ Request Form — slide-up Sheet ═════════════════════════
   The canonical create-record form. Demonstrates the full advanced
   form kit on the --field-* grid: Radio · Checkbox · SearchSelect ·
   Select · CreatableSelect · FileDropzone · RichTextEditor ·
   EditableTable · QuantityStepper · UserSelect · MultiUserSelect.
   Mandatory fields are marked with a red asterisk and validated on
   submit.                                                            */

const REQ_TYPES = [
  { value:"purchase",    label:"Purchase request" },
  { value:"fabrication", label:"Fabrication order" },
  { value:"service",     label:"Service request"  },
];
const REQ_PRIORITIES = [
  { value:"high", label:"High" }, { value:"med", label:"Medium" }, { value:"low", label:"Low" },
];
const REQ_CATEGORIES = ["Avionics","Propulsion","Structures","Ground systems","Consumables"];
const REQ_SITES = [
  { value:"chennai",  label:"Chennai HQ",                 icon:"ph-buildings" },
  { value:"shar",     label:"Sriharikota Launch Complex", icon:"ph-rocket"    },
  { value:"blr",      label:"Bengaluru Lab",              icon:"ph-flask"     },
  { value:"hyd",      label:"Hyderabad Facility",         icon:"ph-factory"   },
];
const REQ_PEOPLE = [
  { id:"u1", name:"Aravind Prabhu",  team:"Propulsion · Lead"        },
  { id:"u2", name:"Meera Krishnan",  team:"Avionics · Engineer"      },
  { id:"u3", name:"Rohit Sharma",    team:"Structures · Engineer"    },
  { id:"u4", name:"Priya Nair",      team:"Quality · Reviewer"       },
  { id:"u5", name:"Karthik Reddy",   team:"Ground Systems · Engineer"},
];
const REQ_UNITS = ["Nos","kg","m","set","L"];

/* Field / FormSection come from the DS bundle (Field = FormField alias, see bindDS). */

/* RequestForm / SubmitConfirmModal — DS erp components fed this module's option catalogs. */
const REQ_OPTS = { types:REQ_TYPES, priorities:REQ_PRIORITIES, categories:REQ_CATEGORIES, sites:REQ_SITES, people:REQ_PEOPLE, units:REQ_UNITS };
function RequestForm(props) { return <DSRecordForm {...REQ_OPTS} {...props} />; }
function SubmitConfirmModal(props) { return <DSSubmitConfirmModal options={REQ_OPTS} {...props} />; }

/* ══════ 4 · Page controls ══════════════════════════════════════*/
/* ══════ 3.9 · Timeline (Gantt) view ══════════════════════════
   Flattens the board lanes into DS <GanttTimeline> items. Start/end derive
   from each lane's own fields (assignedOn · startedOn+days · dueSince ·
   completedOn); day-month strings resolve against TL_YEAR. Group-by is
   owned by the page-controls bar; the scale toggle lives in the Gantt's
   own navigator row (‹ Today › left · Days…Years right).                 */
const TL_YEAR = 2026;
const TL_LANE_STATUS = { "Approvals":"approvals", "Yet to start":"todo", "In progress":"progress", "Overdue":"overdue", "Completed":"done", "Rejected":"rejected" };
const GANTT_GROUPS = [
  { key:"requestType", label:"Request type" },
  { key:"application", label:"Application"  },
  { key:"id",          label:"Request ID"   },
];
const tlParse = (s) => {   /* "12 Jun 2025" | "13 Jun" → Date */
  if (!s) return null;
  const p = String(s).trim().split(/\s+/);
  const M = DR_MONTHS.indexOf(p[1]);
  return M < 0 ? null : new Date(p[2] ? +p[2] : TL_YEAR, M, +p[0]);
};
const tlAdd = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function tlRange(card, lane) {
  const created = tlParse(card.date);
  if (lane === "Yet to start") { const s = tlParse(card.assignedOn) || created; return [s, tlAdd(s, 4)]; }
  if (lane === "In progress")  { const s = tlParse(card.startedOn)  || created; return [s, tlAdd(s, card.days || 5)]; }
  if (lane === "Overdue")      { const e = tlParse(card.dueSince);  return [created, e ? tlAdd(e, 3) : tlAdd(created, 10)]; }
  if (lane === "Completed")    { return [created, tlParse(card.completedOn) || tlAdd(created, 5)]; }
  if (lane === "Rejected")     { return [created, tlAdd(created, 2)]; }
  return [created, tlAdd(created, 3)];   /* Approvals — review window */
}

function buildTimelineItems(q) {
  const items = [];
  Object.entries(window.SCAFFOLD_BOARD || {}).forEach(([lane, cards]) => {
    (cards || []).forEach((card) => {
      const [s, e] = tlRange(card, lane);
      if (!s || !e) return;
      items.push({
        id: card.id, label: card.requestType,
        sublabel: card.assignee || card.requestedBy,
        requestType: card.requestType,
        application: card.app ? card.app.name : "—",
        start: s, end: e,
        status: TL_LANE_STATUS[lane] || "todo",
        progress: lane === "In progress" ? Math.min(0.9, (card.days || 3) / 10) : undefined,
        lane, card,
      });
    });
  });
  const needle = (q || "").toLowerCase();
  return needle ? items.filter((it) => (it.id + " " + it.requestType + " " + it.application + " " + (it.sublabel || "")).toLowerCase().includes(needle)) : items;
}
/* Restricts items to those overlapping the page's date-range filter — this is
   what replaced the Gantt's own ‹ Today › navigator + scale toggle. */
function filterTimelineItemsByRange(items, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) return items;
  const s = new Date(dateRange.start), e = new Date(dateRange.end);
  return items.filter((it) => it.end >= s && it.start <= e);
}

function TimelineView({ q, groupBy, dateRange, onView, loading, error, onRetry }) {
  /* Read lazily so a bundle-load timing gap can't crash the shell — same
     pattern as the RDM lazy read in AdminApp. */
  const GT = (window.AgniUIAgnikulERPDesignSystem_153d9e || {}).GanttTimeline || GanttTimeline;
  if (!GT) return <PlaceholderPage icon="ph-timer" title="Timeline view" />;
  /* Scale + visible range now come entirely from the shared date-range filter
     (Week/Month/Quarter/Year granularity + prev/next) beside the search bar —
     no separate Gantt navigator/scale toolbar. */
  const scale = (dateRange && dateRange.gran) || "week";
  const items = filterTimelineItemsByRange(buildTimelineItems(q), dateRange);
  return (
    <GT loading={loading} error={error} onRetry={onRetry}       items={items}
      groupOptions={GANTT_GROUPS}
      groupBy={groupBy === "none" ? null : groupBy}
      scale={scale}
      showToolbar={false}
      showNavigator={false}
      defaultYear={TL_YEAR}
      onItemClick={(it) => onView && onView(it.card, it.lane)}
      emptyLabel={dateRange ? "No records in this date range" : "No records match your filters"}
      style={{ flex: 1, minHeight: 0 }}
    />
  );
}

/* ══════ 3.95 · Calendar view ══════════════════════════════════
   Lays the record set on a month/week/year grid keyed by each record's
   date (its requested date). Day cells summarize by status — Approved
   reads as "completed"; the selected day's records fill the side panel.
   Same filter contract as the table / card views (search + stat filter). */
function CalendarView({ q, statFilter, filterVals, onView, loading, error, onRetry }) {
  const Cal = (window.AgniUIAgnikulERPDesignSystem_153d9e || {}).Calendar || Calendar;
  if (!Cal) return <PlaceholderPage icon="ph-calendar-dots" title="Calendar view" />;
  let rows = (window.SCAFFOLD_RECORDS || []).filter(r => (r.owner+r.category+r.group+r.id).toLowerCase().includes(q.toLowerCase()));
  if (statFilter && statFilter.key) rows = rows.filter(r => r[statFilter.key] === statFilter.val);
  if (filterVals) Object.entries(filterVals).forEach(([k, v]) => { if (v != null && v !== "") rows = rows.filter(r => String(r[k]) === String(v)); });
  const records = rows.map(r => ({ ...r, title: r.owner, sublabel: `${r.category} · ${r.group}` }));
  return (
    <Cal loading={loading} error={error} onRetry={onRetry}       records={records}
      defaultYear={2026}
      defaultCursor={new Date(2026, 5, 1)}
      defaultSelectedDate={new Date(2026, 5, 12)}
      statusOrder={["Approved", "In Review", "Pending", "Rejected"]}
      onRecordClick={(rec) => onView && onView(rec)}
      style={{ flex: 1, minHeight: 0 }}
    />
  );
}

function PageControls({ q, setQ, statsOpen, setStatsOpen, active, dark, viewMode, setViewMode, dateRange, setDateRange, filterVals, setFilterVals, isPhone, onImport, onNewRecord, variant="full", assignedTo="me", setAssignedTo, ganttGroupBy, setGanttGroupBy, selectionCount = 0, bulkActions, onClearSelection }) {
  const segBg="var(--agni-neutral-100)";
  const segOn="var(--action-brand)";
  const ctrlBdr="var(--border-default)";

  /* Dashboard: analytics surface — only a date range + export, no table chrome. */
  if (variant==="dashboard") {
    return (
      <Cluster wrap justify="space-between" gap="default" style={{ alignItems:"center", rowGap:8 }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:"var(--text-sm)", color:"var(--text-tertiary)" }}>
          <i className="ph ph-funnel-simple" style={{ fontSize:15 }} /> Filter the period to refine every chart below
        </span>
        <Cluster wrap gap="tight" style={{ alignItems:"center", rowGap:8, justifyContent:"flex-end" }}>
          <DateRangeFilter value={dateRange} onChange={setDateRange} isPhone={isPhone} />
          <Button category="secondary" icon={<i className="ph ph-export" />}>Export</Button>
        </Cluster>
      </Cluster>
    );
  }

  /* Crew directory: search + export only — the roster is read-only here. */
  if (variant==="crew") {
    return (
      <Cluster wrap justify="space-between" gap="default" style={{ alignItems:"center", rowGap:8 }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:"var(--text-sm)", color:"var(--text-tertiary)" }}>
          <i className="ph ph-users-three" style={{ fontSize:15 }} /> {(window.SCAFFOLD_CREW||[]).length} members — open a member to view their profile
        </span>
        <Cluster wrap gap="tight" style={{ alignItems:"center", rowGap:8, flex:"1 1 260px", justifyContent:"flex-end" }}>
          <IconButton icon={<i className="ph ph-export" />} variant="outline" title="Export" />
          <div style={{ flex:"1 1 160px", minWidth:140, maxWidth:280 }}><Input value={q} onChange={setQ} placeholder="Search crew…" prefixIcon={<i className="ph ph-magnifying-glass" />} /></div>
        </Cluster>
      </Cluster>
    );
  }

  /* The records toolbar is the DS PageControls; this module only supplies its
     slots — the quick-stats toggle and scope switch on the left, the Gantt
     group-by, export and create action on the right. */
  const leading = (
    <Cluster wrap gap="tight" style={{ alignItems:"center", rowGap:8 }}>
      <button type="button" onClick={() => setStatsOpen(p=>!p)} style={{ display:"inline-flex", alignItems:"center", gap:8, border:"1px solid "+ctrlBdr, background:"transparent", padding:"7px 12px", borderRadius:"var(--radius-md)", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:"var(--text-sm)", fontWeight:"var(--fw-medium)", color:"var(--text-secondary)" }}>
        Quick stats <i className={statsOpen?"ph ph-caret-up":"ph ph-caret-down"} style={{ fontSize:"var(--text-xs)" }} />
      </button>
      {setAssignedTo && (
        <button type="button" onClick={() => setAssignedTo(p => p==="me"?"all":"me")}
          title={assignedTo==="me" ? "Showing: Mine — click to see all requests" : "Showing: All requests — click to see mine"}
          style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:34, height:34, border:"1px solid "+(assignedTo==="me"?"var(--action-brand)":ctrlBdr), background:assignedTo==="me"?"var(--surface-brand-soft)":"transparent", borderRadius:"var(--radius-md)", cursor:"pointer", color:assignedTo==="me"?"var(--text-brand)":"var(--text-secondary)", transition:"background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast)", flexShrink:0 }}>
          <i className={assignedTo==="me"?"ph-fill ph-user":"ph ph-users"} style={{ fontSize:16 }} />
        </button>
      )}
    </Cluster>
  );
  const actions = (
    <Cluster wrap gap="tight" style={{ alignItems:"center", rowGap:8 }}>
      {viewMode==="timeline" && setGanttGroupBy && <>
        <span style={{ fontSize:"var(--text-2xs)", fontWeight:"var(--fw-semibold)", letterSpacing:"var(--tracking-wide)", textTransform:"uppercase", color:"var(--text-tertiary)", flexShrink:0 }}>Group by</span>
        <Select size="sm" value={ganttGroupBy || "none"} onChange={setGanttGroupBy} style={{ width:150, flexShrink:0 }}
          options={[{ value:"none", label:"None" }, ...GANTT_GROUPS.map(g => ({ value:g.key, label:g.label }))]} />
        <span style={{ width:1, height:24, background:"var(--border-subtle)", flexShrink:0 }} />
      </>}
      <IconButton icon={<i className="ph ph-export" />} variant="outline" title="Export" />
      {active === "assignments"
        ? <Button variant="primary" icon={<i className="ph ph-plus" />} onClick={onNewRecord}>New assignment</Button>
        : <SplitButton variant="primary" icon={<i className="ph ph-plus" />}
            onClick={onNewRecord}
            items={[
              { label:"Import records",    icon:"ph-upload-simple",   onClick: onImport },
              "divider",
              { label:"Download template", icon:"ph-file-arrow-down", onClick: downloadImportTemplate },
            ]}>
            New record
          </SplitButton>
      }
    </Cluster>
  );
  return (
    <DSPageControls
      search={q} onSearch={setQ} searchPlaceholder="Search…"
      filterSections={FP_SECTIONS} filterValue={filterVals} onFilterChange={setFilterVals}
      dateRange={dateRange} onDateRangeChange={setDateRange}
      selectionCount={selectionCount} bulkActions={bulkActions} onClearSelection={onClearSelection}
      leading={leading} actions={actions} isPhone={isPhone} dark={dark} />
  );
}

/* ══════ 5 · Quick-stats — DS QuickStats with {key,val} filter mapping ══*/
function QuickStats({ statFilter, setStatFilter }) {
  const items = STAT_CARDS.map(s => ({ key: s.filterKey === null ? null : s.filterKey + ":" + s.filterVal, icon: s.icon, label: s.label, value: s.value, accent: s.accent, filterKey: s.filterKey, filterVal: s.filterVal }));
  const value = statFilter ? statFilter.key + ":" + statFilter.val : null;
  return <DSQuickStats items={items} value={value} showShare style={{ marginTop: 8 }}
    onChange={(k, item) => setStatFilter(item ? { key: item.filterKey, val: item.filterVal } : null)} />;
}


/* ══════ 6 · Empty state — DS EmptyState (this module only maps its copy) ════*/
function EmptyState({ title="No records yet", sub="Records assigned to you will appear here", action }) {
  return <DSEmptyState icon="ph-tray" title={title} message={sub}
    action={action !== undefined ? action : <Button category="secondary" icon={<i className="ph ph-plus" />}>Create record</Button>} />;
}

/* Bulk-action confirmation moved to the DS bundle (BulkActionConfirm). */


/* ══════ 7 · Records table — DS DataTable (fillHeight + column picker +
   action column); the host owns filtering, cell renderers and bulk logic. ══*/
function RecordsTable({ q, dark, statFilter, filterVals, onView, loading, error, onRetry }: RecordsTableProps) {
  const [visCols, setVisCols] = useState(DEFAULT_COLS);
  const [checked, setChecked] = useState(new Set());
  const [bulk, setBulk]       = useState(null);   // 'approve' | 'assign' | 'delete'
  const [, setTick]           = useState(0);

  /* Bulk actions operate on the checked ids; mutate the shared records in place
     (prototype persistence) then clear the selection. */
  const applyBulk = (action, payload) => {
    const ids = new Set(checked);
    if (action==="delete") {
      for (let i=window.SCAFFOLD_RECORDS.length-1;i>=0;i--) if (ids.has(window.SCAFFOLD_RECORDS[i].id)) window.SCAFFOLD_RECORDS.splice(i,1);
    } else {
      window.SCAFFOLD_RECORDS.forEach(r => {
        if (!ids.has(r.id)) return;
        if (action==="approve") { r.status="Approved"; r.__remark=payload; }
        if (action==="assign")  { r.__assignee=payload; }
      });
    }
    setBulk(null); setChecked(new Set()); setTick(t=>t+1);
  };

  let rows = window.SCAFFOLD_RECORDS.filter(r => (r.owner+r.category+r.group+r.id).toLowerCase().includes(q.toLowerCase()));
  if (statFilter&&statFilter.key) rows = rows.filter(r => r[statFilter.key]===statFilter.val);
  if (filterVals) {
    Object.entries(filterVals).forEach(([k,vals]) => {
      if(vals&&vals.length) {
        if(k==='priority') rows=rows.filter(r=>vals.includes(priOf(r.id)));
        else rows=rows.filter(r=>vals.includes(r[k]));
      }
    });
  }

  const renderCell = (key, row) => {
    const pri=priOf(row.id);
    if (key==="id")       return <span style={{ fontFamily:"var(--font-data)", color:"var(--text-secondary)", whiteSpace:"nowrap" }}>{row.id}</span>;
    if (key==="date")     return <span style={{ fontFamily:"var(--font-data)", fontSize:"var(--text-sm)", color:"var(--text-tertiary)", whiteSpace:"nowrap" }}>{row.date}</span>;
    if (key==="owner")    return <span style={{ display:"inline-flex", alignItems:"center", gap:8, whiteSpace:"nowrap" }}><Avatar name={row.owner} size="sm" /><span style={{ fontWeight:"var(--fw-medium)" }}>{row.owner}</span></span>;
    if (key==="status")   return <Badge tone={window.recordTone(row.status)} dot>{row.status}</Badge>;
    if (key==="category") return <span style={{ color:"var(--text-secondary)", fontSize:"var(--text-sm)" }}>{row.category}</span>;
    if (key==="group")    return <Badge tone="brand">{row.group}</Badge>;
    if (key==="priority") return <span style={{ fontSize:"var(--text-xs)", fontWeight:"var(--fw-semibold)", color:PRI_C[pri], background:PRI_C[pri]+"1A", padding:"2px 7px", borderRadius:"var(--radius-full)" }}>{pri}</span>;
    if (key==="assignee") return <span style={{ fontFamily:"var(--font-data)", color:"var(--text-secondary)" }}>{iniOf(row.owner)}</span>;
    if (key==="updated")  return <span style={{ fontFamily:"var(--font-data)", fontSize:"var(--text-sm)", color:"var(--text-tertiary)" }}>{updOf(row.date)}</span>;
    return null;
  };
  const columns = ALL_COLS.map(c => ({ key:c.key, label:c.label, width:COL_W[c.key]||120, render:(v,row)=>renderCell(c.key,row) }));

  const PRI_ORD = { High:0, Med:1, Low:2 };
  const sortAccessor = (key, row) =>
    key==="priority" ? (PRI_ORD[priOf(row.id)] ?? 99) :
    key==="updated"  ? updOf(row.date) :
    key==="assignee" ? row.owner : (row[key] || "");

  if (rows.length===0&&!q&&!statFilter) return <EmptyState title="No matching records" sub="Try adjusting your search or filters" />;

  return (
    <div style={{ position:"relative", display:"flex", flexDirection:"column", flex:1, minHeight:0 }}>
      <DataTable columns={columns} rows={rows} selectable selected={checked} onSelect={setChecked}
        loading={loading} error={error} onRetry={onRetry}
        fillHeight dark={dark} sortAccessor={sortAccessor} emptyText="No matching records"
        headerStyle={{ background: dark ? "rgba(0,7,62,0.72)" : "var(--agni-green-50)", backdropFilter: dark ? "blur(8px)" : "none", WebkitBackdropFilter: dark ? "blur(8px)" : "none", padding:"var(--density-cell-pad) 16px", fontSize:"var(--text-xs)", color:"var(--text-secondary)", borderBottom:"1px solid var(--border-subtle)" }}
        columnPicker={{ visible:visCols, onChange:setVisCols, max:5, defaults:DEFAULT_COLS }}
        actionColumn={{ width:COL_W.action, render:(row) => <Button category="secondary" size="sm" icon={<i className="ph ph-eye" />} onClick={() => onView && onView(row)}>View</Button> }}
      />
      {/* Bulk-action bar — appears when rows are selected (Section-5 pattern) */}
      <BulkActionToolbar
        count={checked.size}
        onClear={() => setChecked(new Set())}
        actions={[
          { label:"Approve", icon:"ph-check",      onClick:() => setBulk("approve") },
          { label:"Assign",  icon:"ph-user-plus",  onClick:() => setBulk("assign") },
          { label:"Delete",  icon:"ph-trash", danger:true, onClick:() => setBulk("delete") },
        ]}
        style={{ position:"absolute", left:"50%", bottom:16, transform:"translateX(-50%)", width:"calc(100% - 32px)", maxWidth:640, zIndex:5 }}
      />
      {bulk && BulkActionConfirm && (() => {
        const n = checked.size + " request" + (checked.size === 1 ? "" : "s");
        if (bulk === "delete") return <BulkActionConfirm open count={checked.size} tone="danger" title="Delete selected requests" message={<>This permanently removes <strong style={{ color:"var(--text-primary)" }}>{n}</strong> from the tracker. This can’t be undone.</>} confirmLabel={"Delete " + n} confirmIcon="ph-trash" onCancel={() => setBulk(null)} onConfirm={() => applyBulk("delete")} />;
        if (bulk === "assign") return <BulkActionConfirm open count={checked.size} title="Assign selected requests" message={<>Reassign <strong style={{ color:"var(--text-primary)" }}>{n}</strong> to a new owner. They’ll be notified.</>} confirmLabel={"Assign " + n} confirmIcon="ph-user-switch" assignees={REQ_PEOPLE} onCancel={() => setBulk(null)} onConfirm={({ assignee }) => applyBulk("assign", (REQ_PEOPLE.find(p => p.id === assignee) || {}).name)} />;
        return <BulkActionConfirm open count={checked.size} title="Approve selected requests" message={<>Approve <strong style={{ color:"var(--text-primary)" }}>{n}</strong> and advance each to the next stage.</>} confirmLabel={"Approve " + n} confirmIcon="ph-check-circle" remark remarkLabel="Remarks" remarkPlaceholder="e.g. Batch-approved against Q3 capex." onCancel={() => setBulk(null)} onConfirm={({ remark }) => applyBulk("approve", remark)} />;
      })()}
    </div>
  );
}

/* ══════ 8 · Card view ══════════════════════════════════════════*/
function CardView({ q, dark, statFilter, filterVals, onView, loading, error, onRetry }) {
  if (error) return <ErrorState message={typeof error === "string" ? error : undefined} onRetry={onRetry} />;
  if (loading) return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"var(--pane-gap)" }}>
      {[0,1,2,3,4,5].map(i => <Card key={i} loading loadingShape="kanbanCard" pad={false} />)}
    </div>
  );
  let rows = window.SCAFFOLD_RECORDS.filter(r => (r.owner+r.category+r.group+r.id).toLowerCase().includes(q.toLowerCase()));
  if (statFilter&&statFilter.key) rows = rows.filter(r => r[statFilter.key]===statFilter.val);
  if (filterVals) {
    Object.entries(filterVals).forEach(([k,vals]) => {
      if(vals&&vals.length) {
        if(k==='priority') rows=rows.filter(r=>vals.includes(priOf(r.id)));
        else rows=rows.filter(r=>vals.includes(r[k]));
      }
    });
  }
  if (!rows.length) return <EmptyState title="No records" sub="No records match your filters" />;
  /* One record shape, the DS card. Approval-status rows get the approval
     preset (department strip + approve/reject); everything else reads as a
     kanban card with its status pill. */
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"var(--pane-gap)", alignItems:"start" }}>
      {rows.map(row => {
        const pending = row.status === "Pending" || row.status === "In Review";
        return <RecordCard key={row.id} preset={pending ? "approval" : "kanban"}
          record={{ id:row.id, requestType:CARD_TYPE_BY_CAT[row.category] || "Request", category:row.category,
                    status:pending ? row.status : CARD_LANE[row.status] || "Yet to start",
                    date:row.date, owner:row.owner, group:row.group, priority:priOf(row.id),
                    assignee:row.status === "Approved" ? row.owner : null,
                    completedOn:row.status === "Approved" ? row.date : undefined,
                    rejectedBy:row.status === "Rejected" ? row.owner : undefined }}
          showStatus onView={() => onView && onView(row)} />;
      })}
    </div>
  );
}

/* Record status → KanbanCard lane, so the card footer always has a variant. */
const CARD_LANE = { "Approved":"Completed", "Rejected":"Rejected", "Pending":"Approvals", "In Review":"Approvals" };
const CARD_TYPE_BY_CAT = { "Type A":"Purchase request", "Type B":"Fabrication order", "Type C":"Service request", "Type D":"Maintenance request", "Type E":"Transfer request" };

/* ══════ 9 · Kanban ═════════════════════════════════════════════*/
const KANBAN_COLS = ["Approvals","Yet to start","In progress","Overdue","Completed","Rejected"];
/* Column → token group. Tones read CSS vars so they theme in light/dark automatically. */
/* ══════ 8.5 · Crew directory ══════════════════════════════════
   Roster (window.SCAFFOLD_CREW) shown two ways — the DS DataTable
   and the OrgTree reporting line-up — plus a per-member profile
   page. Hierarchy: Associate → Senior associate → Senior lead →
   Vice president → Director.                                      */
const CREW_LEVELS = ["Director", "Vice president", "Senior lead", "Senior associate", "Associate"];
const crewStatusTone = (s) => s === "Active" ? "done" : s === "On leave" ? "warning" : "neutral";
const crewFilter = (q) => (window.SCAFFOLD_CREW || []).filter(p =>
  (p.name + " " + p.id + " " + p.crew + " " + p.team + " " + p.role).toLowerCase().includes((q || "").toLowerCase()));

function CrewTable({ q, onOpen }) {
  const DT = (window[DS_NS] || {}).DataTable || DataTable;
  const SC = (window[DS_NS] || {}).StatusChip || StatusChip;
  if (!DT) return <PlaceholderPage icon="ph-users-three" title="Crew directory" />;
  const rows = crewFilter(q);
  const columns = [
    { key:"name", label:"Member", width:250, render:(v, r) => (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Avatar name={r.name} size="sm" />
        <div style={{ minWidth:0 }}>
          <div style={{ fontWeight:"var(--fw-semibold)", color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</div>
          <div style={{ fontSize:"var(--text-2xs)", color:"var(--text-tertiary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.email}</div>
        </div>
      </div>) },
    { key:"id",     label:"Employee ID", width:120, render:(v) => <span style={{ fontFamily:"var(--font-data)", fontSize:"var(--text-xs)" }}>{v}</span> },
    { key:"role",   label:"Role" },
    { key:"crew",   label:"Crew" },
    { key:"team",   label:"Team" },
    { key:"status", label:"Status", width:110, render:(v) => SC ? <SC status={v} tone={crewStatusTone(v)} size="sm" /> : v },
    { key:"joined", label:"Joined", width:120, render:(v) => <span style={{ fontFamily:"var(--font-data)", fontSize:"var(--text-xs)" }}>{v}</span> },
  ];
  return <DT columns={columns} rows={rows} onRowClick={onOpen} emptyText="No crew members match your search" style={{ flex:1, minHeight:0 }} />;
}

function CrewTree({ q, onOpen }) {
  const OT = (window[DS_NS] || {}).OrgTree || OrgTree;
  if (!OT) return <PlaceholderPage icon="ph-tree-structure" title="Reporting line-up" />;
  const people = window.SCAFFOLD_CREW || [];
  /* Search doesn't prune the tree (links would break) — it highlights the
     first match and its reporting path instead. */
  const hit = q ? (people.find(p => (p.name + " " + p.id).toLowerCase().includes(q.toLowerCase())) || {}).id || null : null;
  return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", background:"var(--surface-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-lg)", boxShadow:"var(--shadow-xs)", padding:14, boxSizing:"border-box" }}>
      <OT people={people} legend={CREW_LEVELS} selectedId={hit} onPersonClick={onOpen} />
    </div>
  );
}

/* ── Profile page — rebuilt from the reference EmployeeProfile.tsx
   (hrops_desk): identity header bar (back · ID–name · BGV · status ·
   work status | safety rating · logs · actions), pending-actions bar,
   1/4 Employee Information panel + 3/4 tabbed detail region
   (Attendance & Leaves · Basic Details · Employment Tracker ·
   Documents). Restyled onto AgniUI tokens + DS components.          */
/* Crew profile parts are DS components now (promoted Aug 2026 — see
   components/data/detail.card.html). These thin aliases keep the page's call
   sites unchanged; no markup lives here any more. */
const CrewCopyBtn = ({ value }) => <CopyButton value={value} />;
const CrewField = ({ label, value, copyable, mono, span }) =>
  <KeyValueRow label={label} value={value} copyable={copyable} mono={mono} span={span} />;
const CrewSection = ({ icon, title, children, grid = true, onEdit }) =>
  <DetailSection icon={icon} title={title} grid={grid} onEdit={onEdit}>{children}</DetailSection>;

/* ── Demo profile data — deterministic per person (template seed data;
   swap for real API fields when wiring a module) ── */
const crewSeed = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const CREW_DESIG = { "Director":"Director", "Vice president":"Vice President", "Senior lead":"Senior Lead Engineer", "Senior associate":"Senior Engineer", "Associate":"Engineer" };
function crewDemo(p) {
  const n = crewSeed(p.id);
  const parts = p.name.toLowerCase().split(" ");
  const guardians = ["Ramaswamy K", "Lakshmi Narayanan", "Venkatesan S", "Sarala Devi", "Krishnamoorthy R", "Janaki Raman"];
  const intern = p.type === "Intern";
  return {
    designation: CREW_DESIG[p.role] || p.role,
    workMobile: "+91 44 6697 " + String(2000 + (n % 7999)),
    personalEmail: parts[0] + "." + (parts[1] || "k").slice(0, 6) + "@gmail.com",
    guardian: guardians[n % guardians.length],
    marital: n % 3 === 0 ? "Single" : "Married",
    presentAddr: "No. " + ((n % 40) + 2) + ", " + ["Gandhi Street", "Kamaraj Avenue", "Beach Road", "Anna Salai"][n % 4] + ", Taramani, Chennai 600113",
    permanentAddr: ((n % 80) + 1) + ", " + ["Temple Street", "Mint Street", "Car Street", "Bazaar Road"][(n >> 2) % 4] + ", " + ["Madurai 625001", "Coimbatore 641001", "Thanjavur 613001", "Salem 636001"][(n >> 4) % 4],
    emergencyName: guardians[(n + 2) % guardians.length],
    emergencyRelation: n % 3 === 0 ? "Parent" : "Spouse",
    emergencyPhone: "+91 94441 " + String(20000 + (n % 79999)).slice(0, 5),
    aadhaar: "XXXX XXXX " + (4000 + (n % 5999)),
    pan: (p.name[0] || "A").toUpperCase() + (parts[1] || "k")[0].toUpperCase() + "APK" + (1000 + (n % 8999)) + "FGH"[n % 3],
    pf: intern ? "" : "TN/MAS/" + (45000 + (n % 9999)) + "/" + (100 + (n % 899)),
    uan: intern ? "" : "1005" + String(10000000 + (n % 89999999)),
    bank: ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"][n % 4],
    accountNo: "XXXXXX" + (300000 + (n % 699999)),
    ifsc: ["SBIN0004321", "HDFC0000241", "ICIC0000038", "UTIB0000094"][n % 4],
    micr: "6000020" + ((n % 89) + 10),
    branch: "Taramani, Chennai",
    professional: intern ? [] : [{ role: ["Systems Engineer", "Design Engineer", "Test Engineer", "Project Engineer"][n % 4], org: ["ISRO — LPSC", "HAL Bengaluru", "L&T Defence", "Tata Advanced Systems"][(n >> 1) % 4], span: "Jun 2015 – Dec 2018" }],
    education: [{ degree: ["B.E. Aeronautical Engineering", "B.Tech Mechanical Engineering", "M.Tech Aerospace Engineering", "B.E. Electronics & Communication"][n % 4], inst: ["Anna University, Chennai", "IIT Madras", "NIT Trichy", "MIT Chromepet"][(n >> 3) % 4], year: String(2008 + (n % 12)) }],
    passport: n % 2 === 0 ? { no: "M" + (7000000 + (n % 999999)), place: "Chennai", issued: "12 Feb 2021", valid: "11 Feb 2031" } : null,
    health: n % 4 === 0 ? "Allergic to penicillin. No other known conditions." : "No known allergies or medical conditions.",
    online: p.status === "Active" && n % 3 !== 0,
    bgv: intern ? "Not initiated" : n % 5 === 0 ? "In progress" : "Verified",
    safety: n % 7 === 0 ? 4 : 5,
    rr: 1 + (n % 4),
    assets: 2 + (n % 3),
    insuranceExpiry: intern ? null : "31 Mar 2027",
    payslipMonth: "Jun 2026",
    salaryUpdated: "01 Apr 2026",
    bonusOn: n % 2 === 0 ? "15 Nov 2025" : null,
    pending: [
      ...(intern ? [{ icon: "ph-arrows-clockwise", label: "142d left — Update conversion" }] : []),
      ...(intern || n % 5 === 0 ? [{ icon: "ph-shield-check", label: "Update BG verification" }] : []),
      ...(intern ? [{ icon: "ph-first-aid", label: "Update insurance" }] : []),
    ],
  };
}

/* ── Attendance calendar (deterministic demo) ── */
const CREW_ATT = {
  present:  { label: "Active day",        color: "var(--status-success)" },
  noact:    { label: "No activity",       color: "var(--surface-sunken)" },
  casual:   { label: "Sick/Casual leave", color: "var(--status-warning)" },
  lop:      { label: "LOP",               color: "var(--status-error)" },
  festival: { label: "Festival leave",    color: "var(--status-info)" },
  weekoff:  { label: "Week off",          color: "var(--border-subtle)" },
  holiday:  { label: "National holiday",  color: "var(--status-pending)" },
};
const CREW_HOLIDAYS = ["0-1", "0-15", "4-1", "7-15", "9-2"]; /* NY · Pongal · May Day · Independence · Gandhi Jayanti */
function crewDayKind(id, y, m, d) {
  if (new Date(y, m, d) > new Date()) return "noact";
  if (CREW_HOLIDAYS.includes(m + "-" + d)) return "holiday";
  const dow = new Date(y, m, d).getDay();
  if (dow === 0 || dow === 6) return "weekoff";
  const h = crewSeed(id + "·" + y + "·" + m + "·" + d) % 100;
  if (h < 3) return "casual";
  if (h < 4) return "lop";
  if (h < 6) return "festival";
  if (h < 9) return "noact";
  return "present";
}
const CREW_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CrewLeaveCard = ({ title, tone, taken, total, remainingLabel = "Remaining" }) =>
  <StatCard label={title} tone={tone} value={taken} total={total} remainingLabel={remainingLabel} />;

function CrewAttendanceTab({ p }) {
  const years = [2025, 2026];
  const [year, setYear] = useState(2026);
  /* Counts derive from the same generator that paints the calendar. */
  const counts = { casual:0, lop:0, festival:0 };
  for (let m = 0; m < 12; m++) {
    const dim = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) { const k = crewDayKind(p.id, year, m, d); if (counts[k] != null) counts[k]++; }
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Leave balance cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:10 }}>
        <CrewLeaveCard title="Sick / Casual leave" tone="var(--status-warning)" taken={counts.casual} total={12} />
        <CrewLeaveCard title="LOP" tone="var(--status-error)" taken={counts.lop} total={null} />
        <CrewLeaveCard title="Festival leave" tone="var(--status-info)" taken={counts.festival} total={3} />
        <CrewLeaveCard title="Medical" tone="var(--status-success)" taken={0} total={5} remainingLabel="Balance" />
        <CrewLeaveCard title="Bereavement" tone="var(--status-pending)" taken={0} total={null} />
        <CrewLeaveCard title="Marriage" tone="var(--status-blocked)" taken={0} total={3} remainingLabel="Balance" />
      </div>

      {/* Year calendar */}
      <div style={{ background:"var(--surface-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-lg)", boxShadow:"var(--shadow-xs)", padding:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:12 }}>
          <span style={{ fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)", flex:"1 1 auto" }}>Attendance activity</span>
          <div style={{ display:"flex", gap:4 }}>
            {years.map(y => (
              <button key={y} type="button" onClick={() => setYear(y)}
                style={{ cursor:"pointer", fontFamily:"var(--font-data)", fontSize:"var(--text-xs)", padding:"4px 12px", borderRadius:"var(--radius-full)", border:"1px solid " + (year === y ? "var(--action-brand)" : "var(--border-subtle)"), background: year === y ? "var(--surface-brand-soft)" : "var(--surface-card)", color: year === y ? "var(--text-brand)" : "var(--text-secondary)" }}>
                {y}
              </button>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", marginBottom:12 }}>
          {Object.keys(CREW_ATT).map(k => (
            <span key={k} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:"var(--text-2xs)", color:"var(--text-tertiary)" }}>
              <span style={{ width:9, height:9, borderRadius:3, background:CREW_ATT[k].color, border:"1px solid var(--border-subtle)", boxSizing:"border-box" }}></span>
              {CREW_ATT[k].label}
            </span>
          ))}
        </div>
        {/* Month rows */}
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {CREW_MONTHS.map((mo, m) => {
            const dim = new Date(year, m + 1, 0).getDate();
            return (
              <div key={mo} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:30, flexShrink:0, fontFamily:"var(--font-data)", fontSize:"var(--text-2xs)", color:"var(--text-tertiary)" }}>{mo}</span>
                <div style={{ flex:1, display:"grid", gridTemplateColumns:"repeat(31, 1fr)", gap:2 }}>
                  {Array.from({ length: 31 }, (_, i) => {
                    if (i >= dim) return <span key={i}></span>;
                    const k = crewDayKind(p.id, year, m, i + 1);
                    return <span key={i} title={CREW_ATT[k].label + " — " + String(i + 1).padStart(2, "0") + " " + mo + " " + year}
                      style={{ height:18, borderRadius:3, background:CREW_ATT[k].color, border:"1px solid var(--border-subtle)", boxSizing:"border-box", cursor:"default" }}></span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Basic Details tab — section cards mirroring the reference ── */
/* Label/value pairs, not a chronological log — so this is DetailList, not
   AuditTrail (decision recorded in guidelines/naming.card.html). */
const CrewHistoryCard = ({ rows }) => <DetailList items={rows} layout="row" />;

function CrewBasicTab({ p, demo }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <CrewSection icon="ph-user-circle" title="Basic information" onEdit={() => {}}>
        <CrewField label="Full name" value={p.name} />
        <CrewField label="Parent / Guardian name" value={demo.guardian} />
        <CrewField label="Date of birth" value={p.dob} mono />
        <CrewField label="Gender" value={p.gender} />
        <CrewField label="Marital status" value={demo.marital} />
        <CrewField label="Nationality" value="Indian" />
        <CrewField label="Blood group" value={p.blood} mono />
      </CrewSection>

      <CrewSection icon="ph-address-book" title="Contact information" onEdit={() => {}}>
        <CrewField label="Present address" value={demo.presentAddr} span />
        <CrewField label="Permanent address" value={demo.permanentAddr} span />
        <CrewField label="Emergency contact name" value={demo.emergencyName} />
        <CrewField label="Emergency contact number" value={demo.emergencyPhone} mono copyable />
        <CrewField label="Emergency contact relationship" value={demo.emergencyRelation} />
      </CrewSection>

      <CrewSection icon="ph-identification-card" title="Identification details" onEdit={() => {}}>
        <CrewField label="Aadhaar number" value={demo.aadhaar} mono copyable />
        <CrewField label="PAN number" value={demo.pan} mono copyable />
        <CrewField label="PF number" value={demo.pf} mono copyable />
        <CrewField label="UAN number" value={demo.uan} mono copyable />
      </CrewSection>

      <CrewSection icon="ph-money" title="Salary account details" onEdit={() => {}}>
        <CrewField label="Bank name" value={demo.bank} />
        <CrewField label="Account holder name" value={p.name} />
        <CrewField label="Account type" value="Savings" />
        <CrewField label="Account number" value={demo.accountNo} mono copyable />
        <CrewField label="IFSC code" value={demo.ifsc} mono copyable />
        <CrewField label="MICR code" value={demo.micr} mono copyable />
        <CrewField label="Branch" value={demo.branch} />
      </CrewSection>

      <CrewSection icon="ph-briefcase" title="Professional history" grid={false} onEdit={() => {}}>
        {demo.professional.length === 0
          ? <p style={{ margin:0, fontSize:"var(--text-sm)", color:"var(--text-tertiary)", fontStyle:"italic" }}>No professional history added.</p>
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:10 }}>
              {demo.professional.map((it, i) => (
                <CrewHistoryCard key={i} rows={[{ label:"Designation", value:it.role }, { label:"Company", value:it.org }, { label:"Duration", value:it.span }]} />
              ))}
            </div>}
      </CrewSection>

      <CrewSection icon="ph-graduation-cap" title="Education details" grid={false} onEdit={() => {}}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:10 }}>
          {demo.education.map((it, i) => (
            <CrewHistoryCard key={i} rows={[{ label:"Degree", value:it.degree }, { label:"Institute", value:it.inst }, { label:"Completion year", value:it.year }]} />
          ))}
        </div>
      </CrewSection>

      <CrewSection icon="ph-identification-badge" title="Passport details" grid={!!demo.passport} onEdit={() => {}}>
        {demo.passport ? (
          <React.Fragment>
            <CrewField label="Passport number" value={demo.passport.no} mono copyable />
            <CrewField label="Place of issue" value={demo.passport.place} />
            <CrewField label="Date of issue" value={demo.passport.issued} mono />
            <CrewField label="Valid upto" value={demo.passport.valid} mono />
          </React.Fragment>
        ) : <p style={{ margin:0, fontSize:"var(--text-sm)", color:"var(--text-tertiary)", fontStyle:"italic" }}>No passport details added.</p>}
      </CrewSection>

      <CrewSection icon="ph-first-aid-kit" title="Allergy & medical details" grid={false} onEdit={() => {}}>
        <p style={{ margin:0, fontSize:"var(--text-sm)", color:"var(--text-secondary)", lineHeight:"var(--leading-normal)" }}>{demo.health}</p>
      </CrewSection>
    </div>
  );
}

/* ── Employment Tracker tab ── */
const CrewTrackerCard = ({ icon, title, desc, note, value, action }) =>
  <OptionRow icon={icon} title={title} desc={desc} note={note} value={value} valueIcon={action} onClick={() => {}} />;

function CrewTrackerTab({ p, demo }) {
  const cards = [
    { icon:"ph-user-plus",        title:"Onboarding",               desc:"Review onboarding information and joining details.",            note:"Onboarded date:",              value:p.joined },
    { icon:"ph-file-text",        title:"Offer letter",             desc:"Access and download the signed offer letter.",                  note:"Signed offer letter",          value:"View", action:"ph-eye" },
    { icon:"ph-chart-line-up",    title:"Salary structure",         desc:"View the approved salary structure and revisions.",             note:"Last updated on:",             value:demo.salaryUpdated },
    { icon:"ph-list-checks",      title:"Roles & responsibilities", desc:"Active roles mapped to this employee across contexts.",         note:"No. of R & R:",                value:String(demo.rr) },
    { icon:"ph-heartbeat",        title:"Health insurance",         desc:"View health insurance enrollment and policy details.",          note:"Policy expiry date:",          value:demo.insuranceExpiry || "Not insured" },
    { icon:"ph-receipt",          title:"Payslips",                 desc:"Latest: " + demo.payslipMonth + ".",                            note:"Latest payslip",               value:"Download " + demo.payslipMonth, action:"ph-download-simple" },
    { icon:"ph-gift",             title:"Bonus",                    desc:"Access and view bonus details.",                                note:"Last bonus on:",               value:demo.bonusOn || "—" },
    { icon:"ph-laptop",           title:"Asset details",            desc:"View & manage the assigned asset details.",                     note:"Total assets assigned:",       value:String(demo.assets) },
    { icon:"ph-files",            title:"Tax form",                 desc:"Review tax declarations and statutory forms.",                  note:"FY 2026–27 declaration",       value:"View", action:"ph-eye" },
    { icon:"ph-sign-out",         title:"Exit process",             desc:"No exit process initiated.",                                    note:"Status:",                      value:"Initiate", action:"ph-plus-circle" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:10 }}>
      {cards.map(c => <CrewTrackerCard key={c.title} {...c} />)}
    </div>
  );
}

/* ── Documents tab ── */
const CrewFileRow = ({ name, meta }) =>
  <AttachmentRow name={name} meta={meta} kind="pdf" onView={() => {}} onDownload={() => {}} />;

function CrewDocsTab({ p, demo }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <CrewSection icon="ph-identification-card" title="Identification documents" grid={false} onEdit={() => {}}>
        <div style={{ display:"flex", flexDirection:"column", gap:2, margin:"-6px -6px" }}>
          <CrewFileRow name="Aadhaar card copy" meta="PDF · 1.2 MB" />
          <CrewFileRow name="PAN card copy" meta="PDF · 0.8 MB" />
        </div>
      </CrewSection>
      <CrewSection icon="ph-briefcase" title="Employment documents" grid={false} onEdit={() => {}}>
        <div style={{ display:"flex", flexDirection:"column", gap:2, margin:"-6px -6px" }}>
          <CrewFileRow name="Signed offer letter" meta="PDF · 2.4 MB" />
          <CrewFileRow name="Resume" meta="PDF · 1.1 MB" />
        </div>
      </CrewSection>
      <CrewSection icon="ph-paperclip" title="Additional documents" grid={false} onEdit={() => {}}>
        {demo.bonusOn
          ? <div style={{ display:"flex", flexDirection:"column", gap:2, margin:"-6px -6px" }}><CrewFileRow name="Bonus acknowledgement form" meta="PDF · 0.3 MB" /></div>
          : <p style={{ margin:0, fontSize:"var(--text-sm)", color:"var(--text-tertiary)", fontStyle:"italic" }}>No additional documents uploaded.</p>}
      </CrewSection>
    </div>
  );
}

/* ── Left panel — Employee Information (photo card + work/personal info) ── */
const CrewInfoRow = ({ icon, label, value, copyable, mono, last, onClick }) =>
  <KeyValueRow layout="bordered" icon={icon} label={label} value={value} copyable={copyable} mono={mono} last={last} onClick={onClick} />;
const CrewOrgRow = ({ label, value, last }) =>
  <KeyValueRow layout="row" label={label} value={value} last={last} />;

function CrewInfoPanel({ p, demo, manager, onOpen }) {
  const initials = p.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const card = { background:"var(--surface-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-md)", overflow:"hidden" };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Profile card */}
      <div style={{ background:"var(--surface-soft)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-lg)", padding:10, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", gap:10 }}>
          {/* Portrait placeholder — swap for the employee photo */}
          <div title="Employee photo" style={{ width:104, height:130, flexShrink:0, borderRadius:"var(--radius-md)", background:"var(--surface-brand-soft)", border:"1px solid var(--border-subtle)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
            <span style={{ fontFamily:"var(--font-display)", fontSize:"var(--text-xl)", color:"var(--text-brand)" }}>{initials}</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:"var(--text-2xs)", color: demo.online ? "var(--status-success)" : "var(--text-tertiary)" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background: demo.online ? "var(--status-success)" : "var(--status-pending)" }}></span>
              {demo.online ? "Online" : "Offline"}
            </span>
          </div>
          <div style={{ flex:1, minWidth:0, ...card }}>
            <CrewOrgRow label="Department" value={p.crew} />
            <CrewOrgRow label="Crew" value={p.team} />
            <CrewOrgRow label="Sub team" value="—" last />
          </div>
        </div>
        <div style={card}>
          <CrewOrgRow label="Employment type" value={p.type} />
          <CrewOrgRow label="Designation" value={demo.designation} last />
        </div>
      </div>

      {/* Work information */}
      <div>
        <h3 style={{ margin:"0 0 8px", display:"flex", alignItems:"center", gap:7, fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>
          <i className="ph-fill ph-toolbox" style={{ fontSize:16, color:"var(--text-brand)" }} /> Work information
        </h3>
        <div style={{ ...card, borderRadius:"var(--radius-lg)" }}>
          <CrewInfoRow icon="ph-calendar-dots" label="Date of joining" value={p.joined} mono />
          <CrewInfoRow icon="ph-buildings" label="Work location" value={p.location} />
          <CrewInfoRow icon="ph-user-circle-check" label="Reports to" value={manager ? manager.name : "—"} onClick={manager ? () => onOpen(manager) : undefined} />
          <CrewInfoRow icon="ph-envelope-simple" label="Work email" value={p.email} mono copyable />
          <CrewInfoRow icon="ph-phone" label="Work mobile" value={demo.workMobile} mono copyable last />
        </div>
      </div>

      {/* Personal information */}
      <div>
        <h3 style={{ margin:"0 0 8px", display:"flex", alignItems:"center", gap:7, fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>
          <i className="ph-fill ph-user" style={{ fontSize:16, color:"var(--text-brand)" }} /> Personal information
        </h3>
        <div style={{ ...card, borderRadius:"var(--radius-lg)" }}>
          <CrewInfoRow icon="ph-phone" label="Personal mobile" value={p.phone} mono copyable />
          <CrewInfoRow icon="ph-envelope-simple" label="Personal email" value={demo.personalEmail} mono copyable last />
        </div>
      </div>
    </div>
  );
}

/* ── Header bar pieces ── */
const CrewStars = ({ value }) => <Rating value={value} label={"Safety rating " + value + "/5"} />;

const CREW_BGV_ICON = {
  "Verified":      { icon:"ph-fill ph-check-circle",         color:"var(--status-success)" },
  "In progress":   { icon:"ph-fill ph-hourglass-simple-high", color:"var(--status-info)" },
  "Not initiated": { icon:"ph-fill ph-warning-circle",        color:"var(--status-pending)" },
};

/* Employee actions — DS DropdownMenu (was a hand-rolled popover). */
function CrewActionsMenu({ p }) {
  const items = [
    { label:"Terminate", icon:"ph-prohibit", danger:true },
    { label:"Suspend", icon:"ph-pause-circle" },
    { label:"Mark as absconded", icon:"ph-user-minus" },
    { label:"Mark as inactive", icon:"ph-moon" },
    "divider",
    { label:"End / extend term", icon:"ph-calendar-check" },
    ...(p.type !== "Full-time" ? [{ label:"Convert employment type", icon:"ph-arrows-left-right" }] : []),
  ];
  return <DropdownMenu align="end" items={items}
    trigger={<IconButton icon={<i className="ph-fill ph-dots-three-outline-vertical" />} variant="outline" title="Employee actions" />} />;
}

/* ── Main profile page ── */
function CrewProfilePage({ person, onBack, onOpen }) {
  const [tab, setTab] = useState("attendance");
  const SC = (window[DS_NS] || {}).StatusChip || StatusChip;
  const TabsC = (window[DS_NS] || {}).Tabs || Tabs;
  const all = window.SCAFFOLD_CREW || [];
  const p = all.find(x => x.id === person.id) || person;
  const demo = crewDemo(p);
  const manager = all.find(x => x.id === p.reportsTo);
  const bgv = CREW_BGV_ICON[demo.bgv] || CREW_BGV_ICON["Not initiated"];
  useEffect(() => { setTab("attendance"); }, [p.id]);

  return (
    <div data-screen-label={"Crew profile — " + p.name} style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", gap:10 }}>
      {/* ── Identity header bar ── */}
      <div style={{ background:"var(--surface-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-lg)", boxShadow:"var(--shadow-xs)", padding:"10px 14px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <IconButton icon={<i className="ph ph-arrow-left" />} variant="outline" title="Back to Crew directory" onClick={onBack} />
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", flex:"1 1 300px", minWidth:0 }}>
          <span style={{ fontSize:"var(--text-md)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>
            <span style={{ fontFamily:"var(--font-data)", fontWeight:"var(--fw-medium)", color:"var(--text-secondary)" }}>{p.id}</span>
            <span style={{ color:"var(--text-tertiary)", padding:"0 7px" }}>—</span>{p.name}
          </span>
          <i className={bgv.icon} title={"Background verification: " + demo.bgv} style={{ fontSize:18, color:bgv.color }} />
          <span style={{ width:1, height:16, background:"var(--border-subtle)" }}></span>
          {SC && <SC status={p.status} tone={crewStatusTone(p.status)} size="sm" />}
          <span style={{ width:1, height:16, background:"var(--border-subtle)" }}></span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:"var(--text-xs)", fontWeight:"var(--fw-semibold)", padding:"3px 10px", borderRadius:"var(--radius-full)", border:"1px solid " + (demo.online ? "var(--status-success)" : "var(--border-subtle)"), color: demo.online ? "var(--status-success)" : "var(--text-tertiary)" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background: demo.online ? "var(--status-success)" : "var(--status-pending)" }}></span>
            {demo.online ? "Online" : "Offline"}
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:"var(--text-xs)", fontWeight:"var(--fw-medium)", color:"var(--text-secondary)" }}>Safety rating</span>
            <CrewStars value={demo.safety} />
          </span>
          <Button category="secondary" size="sm" icon={<i className="ph-bold ph-clock-counter-clockwise" />}>View logs</Button>
          <CrewActionsMenu p={p} />
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ flex:1, minHeight:0, display:"flex", gap:12 }}>
        {/* Left — Employee information */}
        <div style={{ flex:"0 0 296px", minWidth:0, overflowY:"auto", paddingBottom:8 }}>
          <CrewInfoPanel p={p} demo={demo} manager={manager} onOpen={onOpen} />
        </div>

        {/* Right — pending actions + tabs */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:10 }}>
          {demo.pending.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", padding:"9px 14px", background:"var(--status-warning-soft)", border:"1px solid var(--status-warning)", borderRadius:"var(--radius-lg)" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)", color:"var(--status-warning)", flex:"1 1 auto" }}>
                <i className="ph-fill ph-warning" /> Pending action{demo.pending.length > 1 ? "s" : ""} ({demo.pending.length})
              </span>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {demo.pending.map(a => (
                  <button key={a.label} type="button"
                    style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 11px", borderRadius:"var(--radius-md)", border:"1px solid var(--border-subtle)", background:"var(--surface-card)", cursor:"pointer", fontSize:"var(--text-xs)", fontWeight:"var(--fw-semibold)", color:"var(--status-warning)", boxShadow:"var(--shadow-xs)", fontFamily:"var(--font-sans)", whiteSpace:"nowrap" }}>
                    <i className={"ph-bold " + a.icon} style={{ fontSize:12 }} /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {TabsC && (
            <TabsC value={tab} onChange={setTab} size="sm"
              tabs={[
                { key:"attendance", label:"Attendance & Leaves", icon:"ph-calendar-check" },
                { key:"basic",      label:"Basic Details",       icon:"ph-user-circle" },
                { key:"tracker",    label:"Employment Tracker",  icon:"ph-briefcase" },
                { key:"documents",  label:"Documents",           icon:"ph-files" },
              ]} />
          )}

          <div style={{ flex:1, minHeight:0, overflowY:"auto", paddingBottom:8 }}>
            {tab === "attendance" && <CrewAttendanceTab p={p} />}
            {tab === "basic" && <CrewBasicTab p={p} demo={demo} />}
            {tab === "tracker" && <CrewTrackerTab p={p} demo={demo} />}
            {tab === "documents" && <CrewDocsTab p={p} demo={demo} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Kanban — DS KanbanBoard; the host filters lanes by the toolbar search. */
function KanbanBoard({ q, dark, onView, loading, error, onRetry }: KanbanBoardProps) {
  const filter = (cards) => cards.filter(c => !q || ((c.requestType||"")+" "+(c.requestedBy||"")+" "+(c.id||"")).toLowerCase().includes(q.toLowerCase()));
  const board = Object.fromEntries(KANBAN_COLS.map(col => [col, filter((window.SCAFFOLD_BOARD||{})[col]||[])]));
  return <DSKanbanBoard columns={KANBAN_COLS} board={board} assignees={window.SCAFFOLD_BOARD_PEOPLE||[]} dark={dark} onView={onView}
    loading={loading} error={error} onRetry={onRetry} empty="Nothing in this lane" />;
}


/* ══════ Quick access — app launchpad ═══════════════════════════
   App identity + role-aware quick actions. The Lead role sees
   create / approvals / assignments / dashboard / import / team. */
const QA_ACTIONS = [
  { key:"create",     icon:"ph-plus-circle",     tone:"#3F7343", title:"Create request",   desc:"Start a new record in the tracker",   go:"requests" },
  { key:"approvals",  icon:"ph-seal-check",       tone:"#5925DC", title:"Review approvals", desc:"Items awaiting your sign-off",          go:"requests", badge:7 },
  { key:"assignments",icon:"ph-kanban",           tone:"#1570EF", title:"My assignments",   desc:"Track work across the board",           go:"assignments" },
  { key:"dashboard",  icon:"ph-chart-pie-slice",  tone:"#DC6803", title:"View dashboard",   desc:"Analytics across every request",        go:"dashboard" },
  { key:"import",     icon:"ph-upload-simple",     tone:"#079455", title:"Import records",   desc:"Bulk-load from a template file",        go:"requests" },
  { key:"team",       icon:"ph-users-three",       tone:"#717680", title:"Team overview",    desc:"See workload across the team",          go:"requests" },
];

function QuickAccessPage({ onNavigate, onNewRequest }) {
  return (
    <div style={{ padding:"var(--pane-pad)", maxWidth:1080, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>
      {/* Hero */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:18, flexWrap:"wrap", background:"linear-gradient(135deg, var(--surface-brand-soft) 0%, var(--surface-card) 72%)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-xl)", padding:"24px", marginBottom:22 }}>
        <span style={{ width:64, height:64, flexShrink:0, borderRadius:"var(--radius-lg)", background:"var(--action-brand)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:33, boxShadow:"var(--shadow-md)" }}>
          <i className="ph-bold ph-squares-four" />
        </span>
        <div style={{ flex:"1 1 320px", minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:10, flexWrap:"wrap" }}>
            <h1 style={{ margin:0, fontSize:"var(--text-2xl)", fontFamily:"var(--font-display)", color:"var(--text-primary)" }}>Records Operations</h1>
            <span style={{ fontFamily:"var(--font-data)", fontSize:"var(--text-xs)", color:"var(--text-tertiary)" }}>v1.0.0</span>
          </div>
          <p style={{ margin:"8px 0 0", fontSize:"var(--text-md)", color:"var(--text-secondary)", lineHeight:"var(--leading-normal)", maxWidth:560, textWrap:"pretty" }}>
            Central workspace for creating, tracking and approving operational records across the Agnikul programme. Pick up where you left off, or jump straight into a task below.
          </p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginTop:14, padding:"5px 11px 5px 5px", borderRadius:"var(--radius-full)", background:"var(--surface-card)", border:"1px solid var(--border-subtle)" }}>
            <span style={{ width:22, height:22, borderRadius:"50%", background:"var(--action-brand)", color:"#fff", fontSize:"var(--text-2xs)", fontWeight:"var(--fw-bold)", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>AP</span>
            <span style={{ fontSize:"var(--text-xs)", color:"var(--text-secondary)" }}>Aravind Prabhu · <strong style={{ color:"var(--text-brand)" }}>Lead</strong></span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:"var(--text-2xs)", fontWeight:"var(--fw-semibold)", letterSpacing:"var(--tracking-wide)", textTransform:"uppercase", color:"var(--text-tertiary)" }}>Quick actions</span>
        <span style={{ fontSize:"var(--text-xs)", color:"var(--text-tertiary)" }}>· tailored to your role</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(246px, 1fr))", gap:"var(--pane-gap)" }}>
        {QA_ACTIONS.map(a => (
          <ActionTile key={a.key} icon={a.icon} title={a.title} desc={a.desc} tone={a.tone} badge={a.badge}
            onClick={() => a.key === "create" ? onNewRequest() : onNavigate(a.go)} />
        ))}
      </div>
    </div>
  );
}

/* ══════ Dashboard — analytical charts ══════════════════════════
   Charts are now first-class DS components (BarChart · LineChart ·
   DonutChart) consumed from the bundle. Series colours come from the
   light/dark-safe --chart-* palette; data points drive the values. */
const DASH_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun"];
const DASH_TREND = [
  { data:[18,24,21,30,27,34], label:"Raised",   area:true, color:"var(--chart-2)" },
  { data:[12,16,15,22,20,27], label:"Approved", area:true, color:"var(--chart-1)" },
];
/* Plan vs actual, grouped bars across categories. */
const DASH_CATS = ["Avionics","Propulsion","Structures","Ground","Payload"];
const DASH_BARS = [
  { data:[19,12,23,8,15], label:"Planned", color:"var(--chart-4)" },
  { data:[14,15,18,6,12], label:"Actual",  color:"var(--chart-2)" },
];
/* Status split: status-evocative hues mapped onto dark-safe --chart tokens. */
const DASH_DONUT = [
  { label:"Approved",  value:10, color:"var(--chart-1)" },
  { label:"Pending",   value:8,  color:"var(--chart-3)" },
  { label:"In review", value:7,  color:"var(--chart-2)" },
  { label:"Rejected",  value:3,  color:"var(--chart-6)" },
];

/* ChartCard is a DS component (components/charts/ChartCard/ChartCard.tsx) — bound in bindDS. */

function DashboardView({ dateRange, dark }) {
  const sub = dateRange ? dateRange.label : "All time";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"var(--pane-gap)", width:"100%", minWidth:0, paddingBottom:4 }}>
      <ChartCard title="Requests over time" subtitle={sub}>
        <LineChart xAxis={[{ data:DASH_MONTHS, scaleType:"point" }]} series={DASH_TREND} />
      </ChartCard>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:"var(--pane-gap)", width:"100%", minWidth:0 }}>
        <ChartCard title="Planned vs actual" subtitle={sub}>
          <BarChart xAxis={[{ data:DASH_CATS, scaleType:"band" }]} series={DASH_BARS} />
        </ChartCard>
        <ChartCard title="Status distribution" subtitle={sub}>
          <DonutChart data={DASH_DONUT} />
        </ChartCard>
      </div>
    </div>
  );
}

/* Stub screens are just EmptyState — no bespoke placeholder block. */
const PlaceholderPage = ({ icon, title }) =>
  <DSEmptyState icon={icon} title={title} message="This page is part of the scaffold and has no content yet." />;

/* ══════ Footer — signature at left edge (DS ShellFooter) ═══════*/
function Footer() {
  return <ShellFooter signatureLogoSrc="../../assets/logos/automation-logo.svg" signatureAlt="Automation" />;
}

/* ══════ Record → RecordDetailModal mapper ════════════════════*
   Derives the workflow, audit trail and resolution from a row's status so the
   View dialog reads consistently across Pending / Approved / Rejected. The raw
   row is mutated in place when a reviewer acts (prototype-only persistence). */
const WF_STAGES   = ["Submitted", "Finance review", "Head approval", "PO issued"];
const WF_ACTORS   = ["Meera Krishnan", "R. Sharma", "A. Prabhu", "Procurement"];
const WF_DETAILS  = ["Request raised and routed for review.", "Budget code verified against the cost centre.", "Department head sign-off.", "Purchase order raised to the vendor."];
const REQ_TYPE_BY_CAT = { "Type A":"Purchase request", "Type B":"Service request", "Type C":"Material request", "Type D":"Maintenance request", "Type E":"Travel request" };

function buildRequest(row) {
  const status = row.status;
  const ts = (d) => d;
  const inReview = status === "In Review";
  const cur = inReview ? 1 : 2;   // pending sits at Head approval, in-review at Finance

  let workflow;
  if (status === "Approved") {
    workflow = WF_STAGES.map((label, i) => ({ label, status:"done", actor:WF_ACTORS[i], ts:ts(updOf(row.date)), detail:WF_DETAILS[i] }));
  } else if (status === "Rejected") {
    workflow = WF_STAGES.map((label, i) => ({ label, status: i < 2 ? "done" : i === 2 ? "rejected" : "pending", actor:WF_ACTORS[i], ts: i <= 2 ? ts(updOf(row.date)) : "—", detail:WF_DETAILS[i] }));
  } else {
    workflow = WF_STAGES.map((label, i) => ({ label, status: i < cur ? "done" : i === cur ? "current" : "pending", actor:WF_ACTORS[i], ts: i < cur ? ts(row.date) : "—", detail:WF_DETAILS[i] }));
  }

  const audit = [
    { actor:row.owner, action:"created the request", ts:row.date + " · 09:12", icon:"ph-plus", tone:"info" },
    { actor:"R. Sharma", action:"completed finance review", ts:row.date + " · 14:30", icon:"ph-check", tone:"success" },
    { actor:"System", action:"validated cost centre", ts:row.date + " · 14:31", icon:"ph-shield-check", tone:"default" },
  ];
  if (status === "Approved") audit.push({ actor:"A. Prabhu", action:"approved the request", ts:updOf(row.date) + " · 10:05", icon:"ph-seal-check", tone:"success" });
  if (status === "Rejected") audit.push({ actor:"A. Prabhu", action:"rejected the request", ts:updOf(row.date) + " · 11:20", icon:"ph-x-circle", tone:"error", detail: row.__remark || undefined });

  let resolution = null;
  if (status === "Approved") resolution = { state:"Approved", by:"A. Prabhu", on:updOf(row.date), remark: row.__remark || "Approved against the project budget. Proceed to procurement." };
  if (status === "Rejected") resolution = { state:"Rejected", by:"A. Prabhu", on:updOf(row.date), remark: row.__remark || "Returned to requester — cost centre and budget code missing." };

  const pri = priOf(row.id);
  return {
    id: row.id,
    requestType: REQ_TYPE_BY_CAT[row.category] || "Request",
    raisedBy: row.owner,
    raisedOn: row.date,
    project: row.group,
    status,
    workflow,
    audit,
    basics: [
      { label:"Category",       value:row.category },
      { label:"Priority",       value:pri },
      { label:"Quantity",       value:"12 Nos" },
      { label:"Estimated cost", value:"₹ 4,80,000" },
      { label:"Needed by",      value:updOf(row.date) },
    ],
    assignment: [
      { label:"Assignee",    value:row.owner + " · Requester" },
      { label:"Reviewer",    value:"R. Sharma · Finance" },
      { label:"Approver",    value:"A. Prabhu · Dept. Head" },
      { label:"Cost centre", value:"CC-4100" },
    ],
    execution: [
      { label:"Current stage", value: status === "Approved" ? "PO issued" : status === "Rejected" ? "Returned to requester" : WF_STAGES[cur] },
      { label:"SLA",           value: status === "Pending" || status === "In Review" ? "2 days remaining" : "Closed" },
      { label:"Linked PO",     value: status === "Approved" ? "PO-2026-114" : "Not issued" },
      { label:"Vendor",        value:"Bharat Aerospace Pvt Ltd" },
    ],
    documents: [
      { name:row.id + "-spec.pdf",   type:"pdf", meta:"248 KB · " + row.date },
      { name:"drawing.step",          type:"cad", meta:"1.1 MB · " + row.date },
      { name:"cost-estimate.xlsx",    type:"xls", meta:"64 KB · " + row.date },
    ],
    resolution,
  };
}

/* ══════ Kanban card → RecordDetailModal mapper ════════════════
   Board cards carry a different field set than table rows, so they map
   through their own builder. The lane (column) drives the modal status,
   the workflow state and whether the Effort log pane is available. */
const COL_STATUS = {
  "Approvals":   "Awaiting Approval",
  "Yet to start":"Yet to start",
  "In progress": "In Progress",
  "Overdue":     "Overdue",
  "Completed":   "Completed",
  "Rejected":    "Rejected",
};
const EFFORT_COLS = ["Yet to start", "In Progress", "Overdue"];

/* Seed a realistic ledger so the Effort log isn't empty on first open. */
function seedEffort(card, status, who) {
  const yr = " 2026, ";
  if (status === "Yet to start") {
    const d = (card.assignedOn || "13 Jun");
    return [{ by:who, startLabel:d+yr+"10:00", endLabel:d+yr+"11:30", hours:1.5, loggedOn:d+yr+"11:32" }];
  }
  if (status === "In Progress") {
    const d = (card.startedOn || "08 Jun");
    return [
      { by:who, startLabel:d+yr+"14:00", endLabel:d+yr+"17:30", hours:3.5, loggedOn:d+yr+"17:33" },
      { by:who, startLabel:d+yr+"09:00", endLabel:d+yr+"13:00", hours:4,   loggedOn:d+yr+"13:05" },
    ];
  }
  const d = (card.dueSince || "04 Jun");   // Overdue
  return [
    { by:who, startLabel:d+yr+"09:30", endLabel:d+yr+"18:00", hours:8.5, loggedOn:d+yr+"18:10" },
    { by:who, startLabel:"03 Jun"+yr+"10:00", endLabel:"03 Jun"+yr+"16:00", hours:6, loggedOn:"03 Jun"+yr+"16:04" },
  ];
}

function buildRequestFromCard(card, col) {
  const status   = COL_STATUS[col] || col;
  const who       = card.assignee || card.requestedBy;
  const approved  = status === "Yet to start" || status === "In Progress" || status === "Overdue" || status === "Completed";
  const rejected  = status === "Rejected";
  const awaiting  = status === "Awaiting Approval";
  const canEffort = EFFORT_COLS.indexOf(status) !== -1;

  let workflow;
  if (rejected) {
    workflow = WF_STAGES.map((label, i) => ({ label, status: i < 2 ? "done" : i === 2 ? "rejected" : "pending", actor:WF_ACTORS[i], ts: i <= 2 ? updOf(card.date) : "—", detail:WF_DETAILS[i] }));
  } else if (awaiting) {
    workflow = WF_STAGES.map((label, i) => ({ label, status: i < 2 ? "done" : i === 2 ? "current" : "pending", actor:WF_ACTORS[i], ts: i < 2 ? card.date : "—", detail:WF_DETAILS[i] }));
  } else {
    workflow = WF_STAGES.map((label, i) => ({ label, status:"done", actor:WF_ACTORS[i], ts:updOf(card.date), detail:WF_DETAILS[i] }));
  }

  const audit = [
    { actor:card.requestedBy, action:"created the request", ts:card.date + " · 09:12", icon:"ph-plus", tone:"info" },
    { actor:"R. Sharma", action:"completed finance review", ts:card.date + " · 14:30", icon:"ph-check", tone:"success" },
  ];
  if (approved) audit.push({ actor:"A. Prabhu", action:"approved the request", ts:updOf(card.date) + " · 10:05", icon:"ph-seal-check", tone:"success" });
  if (approved && who) audit.push({ actor:"A. Prabhu", action:"assigned to " + who, ts:(card.assignedOn || updOf(card.date)) + " · 10:06", icon:"ph-user-switch", tone:"default" });
  if (rejected) audit.push({ actor:card.rejectedBy || "A. Prabhu", action:"rejected the request", ts:updOf(card.date) + " · 11:20", icon:"ph-x-circle", tone:"error" });

  let resolution = null;
  if (status === "Completed")  resolution = { state:"Approved", by:who, on:card.completedOn || updOf(card.date) };
  else if (approved)           resolution = { state:"Approved", by:who, on:card.assignedOn || card.startedOn || card.dueSince || updOf(card.date) };
  else if (rejected)           resolution = { state:"Rejected", by:card.rejectedBy || "A. Prabhu", on:updOf(card.date), remark:"Returned to requester — cost centre and budget code missing." };

  return {
    id: card.id,
    requestType: card.requestType,
    raisedBy: card.requestedBy,
    raisedOn: card.date,
    project: card.requestedFor,
    status,
    workflow,
    audit,
    basics: [
      { label:"Application",   value: card.app ? card.app.name : "—" },
      { label:"Priority",      value: card.priority || "—" },
      { label:"Requested for", value: card.requestedFor },
      { label:"Quantity",      value:"12 Nos" },
      { label:"Estimated cost",value:"₹ 4,80,000" },
    ],
    assignment: [
      { label:"Assignee",    value: who + (card.assignee ? " · Owner" : " · Requester") },
      { label:"Approver",    value:"A. Prabhu · Dept. Head" },
      { label:"Assigned on", value: card.assignedOn || "—" },
      { label:"Cost centre", value:"CC-4100" },
    ],
    execution: [
      { label:"Current stage", value: status },
      { label:"Started on",    value: card.startedOn || "—" },
      { label:"Days active",   value: card.days != null ? card.days + " days" : "—" },
      { label:"Due",           value: card.dueSince ? "Overdue since " + card.dueSince : (card.assignedOn || "—") },
    ],
    documents: [
      { name:card.id + "-spec.pdf", type:"pdf", meta:"248 KB · " + card.date },
      { name:"drawing.step",         type:"cad", meta:"1.1 MB · " + card.date },
    ],
    resolution,
    effort: canEffort ? { canLog:true, assignees:[who], entries: card.__effort || seedEffort(card, status, who) } : null,
  };
}

/* ══════ Approvals Panel ═══════════════════════════════════════
   Slide-in drawer listing all records awaiting approval.
   Opens from the Workspace rail "Approvals" item.            */
/* ApprovalCard comes from the DS bundle (erp/ApprovalCard — category meta defaults match this module). */


/* ══════ Google-style workspace side panels ════════════════════
   Slim rail stays put; clicking an item slides a content panel in
   beside it. Each item has its own header + content.            */
const PANEL_META = {
  approvals: { label:"Approvals",     icon:"ph-seal-check" },
  tasks:     { label:"Tasks",         icon:"ph-check-square" },
  calendar:  { label:"Calendar",      icon:"ph-calendar-blank" },
  support:   { label:"Support",       icon:"ph-headset" },
  ai:        { label:"AI assistant",  icon:"ph-robot" },
};

/* PanelEmpty comes from the DS bundle (chrome/PanelKit). */


/* ── Approvals ── */
function ApprovalsContent({ onView, onTick, selectedId }) {
  const [q, setQ] = useState("");
  const pending  = (window.SCAFFOLD_RECORDS || []).filter(r => r.status === "Pending" || r.status === "In Review");
  const filtered = pending.filter(r => !q || (r.id+r.owner+r.category+r.group).toLowerCase().includes(q.toLowerCase()));
  return (
    <React.Fragment>
      <div style={{ padding:"12px 16px 0", flexShrink:0 }}><Input value={q} onChange={setQ} placeholder="Search" /></div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px 20px", display:"flex", flexDirection:"column", gap:14 }}>
        {filtered.length === 0
          ? <PanelEmpty icon="ph-seal-check" text="No pending approvals" />
          : filtered.map(row => <ApprovalCard key={row.id} row={row} highlight={row.id === selectedId} onView={() => onView(row)} onQuickReject={() => { row.status="Rejected"; onTick(); }} />)}
      </div>
    </React.Fragment>
  );
}

/* ── Tasks — assigned work, mirrors the Approvals panel ──
   Cards read straight from the board's assigned lanes. Selecting a card
   (or "Log effort") opens the record detail with the Effort log pane;
   the ✓ quick action marks the task completed (moves it to Completed). */
const TASK_LANES = ["Overdue", "In progress", "Yet to start"];
const TASK_LANE_TONE = { "Overdue":"overdue", "In progress":"progress", "Yet to start":"todo" };
const TASK_APP_CLR = {
  Procurement:"var(--text-brand)", Fabrication:"var(--status-warning)",
  IT:"var(--hue-info)", Facilities:"var(--hue-violet)",
};


/* TaskCard comes from the DS bundle (erp/TaskCard). */


/* PanelIconMenu comes from the DS bundle (chrome/PanelKit). */
const menuLabelStyle = { fontSize:"var(--text-2xs)", fontWeight:"var(--fw-semibold)", letterSpacing:"var(--tracking-wide)", textTransform:"uppercase", color:"var(--text-tertiary)", padding:"6px 8px 4px" };
/* MenuRow comes from the DS bundle (chrome/PanelKit). */

/* Applications + sort keys for the Tasks panel filter/sort menus. */
const TASK_FILTER_APPS = ["Procurement", "Fabrication", "IT", "Facilities"];
const TASK_SORT_OPTS = [
  { key:"status", label:"Status (lane order)" },
  { key:"effort", label:"Effort logged (high → low)" },
];
const effortMinutes = (c) => {
  const t = c.effort && c.effort.total;
  if (!t) return -1;
  const h = /(\d+)\s*h/.exec(t), m = /(\d+)\s*m/.exec(t);
  return (h ? +h[1] : 0) * 60 + (m ? +m[1] : 0);
};

function TasksContent({ onViewTask, onCompleteTask, onStopLogging, onStartLogging, onNewTask, selectedId }) {
  const [q, setQ] = useState("");
  const [appF, setAppF]   = useState([]);
  const [typeF, setTypeF] = useState([]);
  const [sortBy, setSortBy] = useState("status");

  const board = window.SCAFFOLD_BOARD || {};
  const types = Array.from(new Set(TASK_LANES.flatMap((l) => (board[l] || []).map((c) => c.requestType)).filter(Boolean)));
  const toggle = (setter, val) => setter((cur) => cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]);

  const match = (c) => {
    if (q && !((c.id||"")+" "+(c.requestType||"")+" "+(c.assignee||"")+" "+(c.app?c.app.name:"")).toLowerCase().includes(q.toLowerCase())) return false;
    if (appF.length  && !appF.includes(c.app ? c.app.name : "")) return false;
    if (typeF.length && !typeF.includes(c.requestType)) return false;
    return true;
  };
  const sortFn = (a, b) => {
    const ra = a.effort && a.effort.running ? 1 : 0, rb = b.effort && b.effort.running ? 1 : 0;
    if (rb !== ra) return rb - ra;                 // running effort always floats to the top
    if (sortBy === "effort") return effortMinutes(b) - effortMinutes(a);
    return 0;
  };
  const lanes = TASK_LANES.map((lane) => ({ lane, cards: (board[lane] || []).filter(match).slice().sort(sortFn) }));
  const total = lanes.reduce((a, l) => a + l.cards.length, 0);
  const filterCount = appF.length + typeF.length;
  return (
    <React.Fragment>
      <div style={{ padding:"12px 16px 0", flexShrink:0, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}><Input value={q} onChange={setQ} placeholder="Search" prefixIcon={<i className="ph ph-magnifying-glass" />} /></div>
        <button type="button" title="New task" onClick={() => onNewTask && onNewTask()}
          style={{ width:38, height:38, borderRadius:"var(--radius-md)", border:"none", background:"var(--action-brand)", color:"#fff", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0, transition:"opacity var(--dur-fast)" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity="0.88"}
          onMouseLeave={(e) => e.currentTarget.style.opacity="1"}>
          <i className="ph ph-plus" />
        </button>
        <PanelIconMenu icon="ph-sliders-horizontal" title="Filter & sort" active={filterCount > 0 || sortBy !== "status"}>
          <div style={menuLabelStyle}>Sort by</div>
          {TASK_SORT_OPTS.map((o) => <MenuRow key={o.key} type="radio" label={o.label} checked={sortBy === o.key} onClick={() => setSortBy(o.key)} />)}
          <div style={{ height:1, background:"var(--border-subtle)", margin:"6px 4px" }} />
          <div style={menuLabelStyle}>Application</div>
          {TASK_FILTER_APPS.map((a) => <MenuRow key={a} type="check" label={a} checked={appF.includes(a)} onClick={() => toggle(setAppF, a)} />)}
          <div style={{ height:1, background:"var(--border-subtle)", margin:"6px 4px" }} />
          <div style={menuLabelStyle}>Request type</div>
          {types.map((t) => <MenuRow key={t} type="check" label={t} checked={typeF.includes(t)} onClick={() => toggle(setTypeF, t)} />)}
          {filterCount > 0 && (
            <>
              <div style={{ height:1, background:"var(--border-subtle)", margin:"6px 4px" }} />
              <button type="button" onClick={() => { setAppF([]); setTypeF([]); }}
                style={{ display:"flex", alignItems:"center", gap:7, width:"100%", padding:"7px 8px", borderRadius:"var(--radius-md)", border:"none", background:"transparent", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:"var(--text-sm)", fontWeight:"var(--fw-medium)", color:"var(--text-secondary)" }}
                onMouseEnter={(e) => e.currentTarget.style.background="var(--surface-soft)"}
                onMouseLeave={(e) => e.currentTarget.style.background="transparent"}>
                <i className="ph ph-x" style={{ fontSize:14 }} /> Clear filters
              </button>
            </>
          )}
        </PanelIconMenu>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {total === 0
          ? <PanelEmpty icon="ph-check-square" text={filterCount || q ? "No tasks match your filters" : "No assigned tasks"} />
          : lanes.map(({ lane, cards }) => cards.length === 0 ? null : (
            <React.Fragment key={lane}>
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 2px 0" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:`var(--kanban-${TASK_LANE_TONE[lane]}-dot)`, flexShrink:0 }} />
                <span style={{ fontSize:"var(--text-2xs)", fontWeight:"var(--fw-semibold)", letterSpacing:"var(--tracking-wide)", textTransform:"uppercase", color:"var(--text-tertiary)", flex:1 }}>{lane}</span>
                <span style={{ fontSize:"var(--text-2xs)", fontFamily:"var(--font-data)", color:"var(--text-tertiary)" }}>{cards.length}</span>
              </div>
              {cards.map((card) => (
                <TaskCard key={card.id} card={card} lane={lane}
                  onView={() => onViewTask(card, lane)}
                  onQuickComplete={() => onCompleteTask(card, lane)}
                  onStopLogging={onStopLogging}
                  onStartLogging={onStartLogging}
                  selected={card.id === selectedId} />
              ))}
            </React.Fragment>
          ))}
      </div>
    </React.Fragment>
  );
}

/* ── Calendar ── */
const WS_AGENDA = [
  { date:"Thu, 25 Jun", events:[{ label:"Monthly safety meeting", time:"11:30 – 12:30", type:"Meeting" }] },
  { date:"Fri, 26 Jun", events:[{ label:"Muharram / Ashura (tentative)", type:"Holiday" }] },
  { date:"Mon, 7 Jul",  events:[{ label:"Procurement review", time:"15:00 – 16:00", type:"Meeting" }] },
  { date:"Thu, 16 Jul", events:[{ label:"Rath Yatra", type:"Holiday" }] },
  { date:"Tue, 21 Jul", events:[{ label:"Vendor sync — propulsion", time:"10:00 – 10:45", type:"Meeting" }] },
];
const WS_EVENT_TYPES = ["Meeting", "Holiday"];
const WS_AGENDA_SORT_OPTS = [
  { key:"soonest", label:"Soonest first" },
  { key:"latest",  label:"Latest first"  },
];
function CalendarContent() {
  /* Event type → shared tone vocabulary (StatusChip / Badge / EventRow). */
  const TONE = { Meeting:"brand", Holiday:"success", Review:"info", Deadline:"warning", Training:"pending" };
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState([]);
  const [sortBy, setSortBy] = useState("soonest");
  const toggle = (val) => setTypeF((cur) => cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]);

  const days = WS_AGENDA
    .map((day) => ({
      ...day,
      events: day.events.filter((ev) => {
        if (typeF.length && !typeF.includes(ev.type)) return false;
        if (q && !((ev.label+" "+day.date).toLowerCase().includes(q.toLowerCase()))) return false;
        return true;
      }),
    }))
    .filter((day) => day.events.length > 0);
  const ordered = sortBy === "latest" ? days.slice().reverse() : days;
  const filterCount = typeF.length;
  const total = ordered.reduce((a, d) => a + d.events.length, 0);

  return (
    <React.Fragment>
      <div style={{ padding:"12px 16px 0", flexShrink:0, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}><Input value={q} onChange={setQ} placeholder="Search" prefixIcon={<i className="ph ph-magnifying-glass" />} /></div>
        <PanelIconMenu icon="ph-sliders-horizontal" title="Filter & sort" active={filterCount > 0 || sortBy !== "soonest"}>
          <div style={menuLabelStyle}>Sort by</div>
          {WS_AGENDA_SORT_OPTS.map((o) => <MenuRow key={o.key} type="radio" label={o.label} checked={sortBy === o.key} onClick={() => setSortBy(o.key)} />)}
          <div style={{ height:1, background:"var(--border-subtle)", margin:"6px 4px" }} />
          <div style={menuLabelStyle}>Event type</div>
          {WS_EVENT_TYPES.map((t) => <MenuRow key={t} type="check" label={t} checked={typeF.includes(t)} onClick={() => toggle(t)} />)}
          {filterCount > 0 && (
            <>
              <div style={{ height:1, background:"var(--border-subtle)", margin:"6px 4px" }} />
              <button type="button" onClick={() => setTypeF([])}
                style={{ display:"flex", alignItems:"center", gap:7, width:"100%", padding:"7px 8px", borderRadius:"var(--radius-md)", border:"none", background:"transparent", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:"var(--text-sm)", fontWeight:"var(--fw-medium)", color:"var(--text-secondary)" }}
                onMouseEnter={(e) => e.currentTarget.style.background="var(--surface-soft)"}
                onMouseLeave={(e) => e.currentTarget.style.background="transparent"}>
                <i className="ph ph-x" style={{ fontSize:14 }} /> Clear filters
              </button>
            </>
          )}
        </PanelIconMenu>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px 20px", display:"flex", flexDirection:"column", gap:16 }}>
        {total === 0
          ? <PanelEmpty icon="ph-calendar-blank" text={filterCount || q ? "No events match your filters" : "No upcoming events"} />
          : ordered.map((day, i) => (
          <div key={i}>
            <div style={{ fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)", marginBottom:8 }}>{day.date}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {day.events.map((ev, j) => (
                <EventRow key={j} label={ev.label} time={ev.time} tone={TONE[ev.type] || "brand"} />
              ))}
            </div>
          </div>
        ))}
        <button type="button" style={{ display:"inline-flex", alignItems:"center", gap:8, alignSelf:"flex-start", marginTop:4, border:"none", background:"transparent", color:"var(--text-brand)", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)" }}>
          <i className="ph ph-plus" style={{ fontSize:16 }} /> Create an event
        </button>
      </div>
    </React.Fragment>
  );
}

/* ── Support ── */
function SupportContent() {
  const opts = [
    { icon:"ph-chats-circle",     title:"Live chat",      desc:"Typical reply in 2 min" },
    { icon:"ph-envelope-simple",  title:"Email support",  desc:"support@agnikul.in" },
    { icon:"ph-book-open",        title:"Documentation",  desc:"Guides & API reference" },
    { icon:"ph-ticket",           title:"Raise a ticket", desc:"Track an issue to resolution" },
  ];
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"14px 16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
      {opts.map((o, i) => (
        <button key={i} type="button"
          style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 13px", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-lg)", background:"var(--surface-card)", cursor:"pointer", textAlign:"left", transition:"all var(--dur-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor="var(--border-brand)"; e.currentTarget.style.background="var(--surface-soft)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--border-subtle)"; e.currentTarget.style.background="var(--surface-card)"; }}>
          <span style={{ width:38, height:38, borderRadius:"var(--radius-md)", background:"var(--surface-brand-soft)", color:"var(--text-brand)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0 }}><i className={"ph "+o.icon} /></span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:"var(--text-sm)", fontWeight:"var(--fw-semibold)", color:"var(--text-primary)" }}>{o.title}</div>
            <div style={{ fontSize:"var(--text-xs)", color:"var(--text-tertiary)" }}>{o.desc}</div>
          </div>
          <i className="ph ph-caret-right" style={{ fontSize:14, color:"var(--text-tertiary)", flexShrink:0 }} />
        </button>
      ))}
    </div>
  );
}

/* ── AI assistant ── */
function AIContent() {
  const sugg = ["Summarise pending approvals", "Draft a purchase request", "Find overdue tasks"];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"flex", gap:10 }}>
          <span style={{ width:30, height:30, borderRadius:"var(--radius-full)", background:"var(--surface-brand-soft)", color:"var(--text-brand)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}><i className="ph ph-robot" /></span>
          <div style={{ background:"var(--surface-soft)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-lg)", padding:"11px 13px", fontSize:"var(--text-sm)", color:"var(--text-primary)", lineHeight:"var(--leading-normal)" }}>
            Hi! I'm your workspace assistant. Ask me to summarise approvals, draft a request, or find a record.
          </div>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {sugg.map(s => (
            <button key={s} type="button" style={{ border:"1px solid var(--border-default)", borderRadius:"var(--radius-full)", background:"var(--surface-card)", color:"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:"var(--text-xs)", padding:"7px 12px", transition:"all var(--dur-fast)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor="var(--border-brand)"; e.currentTarget.style.color="var(--text-brand)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--border-default)"; e.currentTarget.style.color="var(--text-secondary)"; }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"12px 14px", borderTop:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <Input placeholder="Ask anything…" style={{ flex:1 }} inputStyle={{ borderRadius:"var(--radius-full)", background:"var(--surface-soft)" }} />
        <button type="button" title="Send" style={{ width:38, height:38, borderRadius:"var(--radius-full)", border:"none", background:"var(--action-brand)", color:"#fff", cursor:"pointer", fontSize:16, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><i className="ph ph-paper-plane-tilt" /></button>
      </div>
    </div>
  );
}

/* ── Generic side-panel shell (Google-style header + content) ── */
function WorkspaceSidePanel({ panelKey, railOpen, onClose, onView, onViewTask, onCompleteTask, onStopLogging, onStartLogging, onNewTask, onTick, selectedApprovalId, selectedTaskId }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelKey) return;
    const handler = (e) => {
      const inDialog = e.target && e.target.closest && e.target.closest('[role="dialog"]');
      if (panelRef.current && !panelRef.current.contains(e.target) && !inDialog) onClose();
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [panelKey, onClose]);

  useEffect(() => {
    if (!panelKey) return;
    const k = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [panelKey, onClose]);

  if (!panelKey) return null;
  const meta = PANEL_META[panelKey] || { label:panelKey, icon:"ph-square" };
  const rightOffset = railOpen ? 232 : "var(--workspace-rail-w)";
  const iconBtn = { width:30, height:30, borderRadius:"var(--radius-md)", border:"none", background:"transparent", color:"var(--text-tertiary)", cursor:"pointer", fontSize:16, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background var(--dur-fast)" };
  return (
    <React.Fragment>
      {/* Backdrop scrim with blur — excludes header, footer, rail */}
      <div style={{ position:"fixed", top:"var(--bar-h)", left:0, bottom:"var(--footer-h)", right:rightOffset, zIndex:"var(--z-overlay)", background:"rgba(0,0,0,0.18)", backdropFilter:"blur(4px)", pointerEvents:"none" }} />
      <div ref={panelRef} style={{
        position:"fixed", top:"var(--bar-h)", bottom:"var(--footer-h)", right:rightOffset, width:392, zIndex:"var(--z-modal)",
        background:"var(--surface-card)", border:"1px solid var(--border-default)", borderRight:"none",
        borderTopLeftRadius:"var(--radius-xl)", borderBottomLeftRadius:"var(--radius-xl)",
        boxShadow:"var(--shadow-2xl)", display:"flex", flexDirection:"column",
        animation:"agni-slide-in-right var(--dur-normal) var(--ease-standard)", overflow:"hidden",
      }}>
        {/* Google-style header */}
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"12px 12px 12px 16px", borderBottom:"1px solid var(--border-subtle)", flexShrink:0 }}>
          <i className={"ph "+meta.icon} style={{ fontSize:18, color:"var(--text-brand)" }} />
          <span style={{ flex:1, fontSize:"var(--text-2xs)", fontWeight:"var(--fw-bold)", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text-secondary)" }}>{meta.label}</span>
          <button type="button" title="Open full page" style={iconBtn}
            onMouseEnter={(e) => e.currentTarget.style.background="var(--state-hover-overlay)"}
            onMouseLeave={(e) => e.currentTarget.style.background="transparent"}>
            <i className="ph ph-arrow-square-out" />
          </button>
          <button type="button" onClick={onClose} title="Close" style={iconBtn}
            onMouseEnter={(e) => e.currentTarget.style.background="var(--state-hover-overlay)"}
            onMouseLeave={(e) => e.currentTarget.style.background="transparent"}>
            <i className="ph ph-x" />
          </button>
        </div>
        {/* Content */}
        {panelKey === "approvals" && <ApprovalsContent onView={onView} onTick={onTick} selectedId={selectedApprovalId} />}
        {panelKey === "tasks"     && <TasksContent onViewTask={onViewTask} onCompleteTask={onCompleteTask} onStopLogging={onStopLogging} onStartLogging={onStartLogging} onNewTask={onNewTask} selectedId={selectedTaskId} />}
        {panelKey === "calendar"  && <CalendarContent />}
        {panelKey === "support"   && <SupportContent />}
        {panelKey === "ai"        && <AIContent />}
      </div>
      <style>{"@keyframes agni-slide-in-right{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}"}</style>
    </React.Fragment>
  );
}

/* ══════ Root ═══════════════════════════════════════════════*/
/* Gate: waits for the DS bundle namespace before mounting the app, so the
   render never races the helmet script (whichever settles first works). */
function AdminApp(props) {
  const [ready, setReady] = useState(() => bindDS());
  useEffect(() => {
    if (ready) return;
    const t = setInterval(() => { if (bindDS()) { clearInterval(t); setReady(true); } }, 40);
    return () => clearInterval(t);
  }, [ready]);
  if (!ready) return null;
  return <AdminAppImpl {...props} />;
}

function AdminAppImpl({ formColumns = 2, detailColumns = 3 }: AdminAppImplProps) {
  const cols = Number(formColumns) === 3 ? 3 : 2;
  const detailCols = Number(detailColumns) === 2 ? 2 : 3;

  /* Read RecordDetailModal lazily so any bundle-load timing gap is bypassed. */
  const RDM = (window.AgniUIAgnikulERPDesignSystem_153d9e || {}).RecordDetailModal || RecordDetailModal;

  /* Board-card → RecordDetailModal mapper — defined inside AdminApp so it
     shares the component closure and avoids any module-scope caching issue. */
  const _COL_STATUS = { "Approvals":"Awaiting Approval", "Yet to start":"Yet to start", "In progress":"In Progress", "Overdue":"Overdue", "Completed":"Completed", "Rejected":"Rejected" };
  const _EFFORT_COLS = ["Yet to start", "In Progress", "Overdue"];
  const _seedEffort = (card, status, who) => {
    const yr = " 2026, ";
    if (status === "Yet to start") { const d = card.assignedOn || "13 Jun"; return [{ by:who, startLabel:d+yr+"10:00", endLabel:d+yr+"11:30", hours:1.5, loggedOn:d+yr+"11:32" }]; }
    if (status === "In Progress")  { const d = card.startedOn  || "08 Jun"; return [{ by:who, startLabel:d+yr+"14:00", endLabel:d+yr+"17:30", hours:3.5, loggedOn:d+yr+"17:33" }, { by:who, startLabel:d+yr+"09:00", endLabel:d+yr+"13:00", hours:4, loggedOn:d+yr+"13:05" }]; }
    const d = card.dueSince || "04 Jun";
    return [{ by:who, startLabel:d+yr+"09:30", endLabel:d+yr+"18:00", hours:8.5, loggedOn:d+yr+"18:10" }, { by:who, startLabel:"03 Jun"+yr+"10:00", endLabel:"03 Jun"+yr+"16:00", hours:6, loggedOn:"03 Jun"+yr+"16:04" }];
  };
  const _buildRec = (card, col) => {
    const status   = _COL_STATUS[col] || col;
    const who      = card.assignee || card.requestedBy;
    const approved = status==="Yet to start"||status==="In Progress"||status==="Overdue"||status==="Completed";
    const rejected = status==="Rejected";
    const awaiting = status==="Awaiting Approval";
    const canEffort = _EFFORT_COLS.indexOf(status) !== -1;
    let workflow;
    if (rejected)      workflow = WF_STAGES.map((lbl,i)=>({ label:lbl, status:i<2?"done":i===2?"rejected":"pending", actor:WF_ACTORS[i], ts:i<=2?updOf(card.date):"—", detail:WF_DETAILS[i] }));
    else if (awaiting) workflow = WF_STAGES.map((lbl,i)=>({ label:lbl, status:i<2?"done":i===2?"current":"pending",  actor:WF_ACTORS[i], ts:i<2?card.date:"—",            detail:WF_DETAILS[i] }));
    else               workflow = WF_STAGES.map((lbl,i)=>({ label:lbl, status:"done",                                actor:WF_ACTORS[i], ts:updOf(card.date),              detail:WF_DETAILS[i] }));
    const audit = [
      { actor:card.requestedBy, action:"created the request",      ts:card.date+" · 09:12",        icon:"ph-plus",        tone:"info"    },
      { actor:"R. Sharma",      action:"completed finance review",  ts:card.date+" · 14:30",        icon:"ph-check",       tone:"success" },
    ];
    if (approved)      audit.push({ actor:"A. Prabhu",              action:"approved the request",  ts:updOf(card.date)+" · 10:05", icon:"ph-seal-check",  tone:"success" });
    if (approved&&who) audit.push({ actor:"A. Prabhu",              action:"assigned to "+who,       ts:(card.assignedOn||updOf(card.date))+" · 10:06", icon:"ph-user-switch", tone:"default" });
    if (rejected)      audit.push({ actor:card.rejectedBy||"A. Prabhu", action:"rejected the request", ts:updOf(card.date)+" · 11:20", icon:"ph-x-circle", tone:"error" });
    let resolution = null;
    if (status==="Completed")  resolution = { state:"Approved", by:who, on:card.completedOn||updOf(card.date) };
    else if (approved)         resolution = { state:"Approved", by:who, on:card.assignedOn||card.startedOn||card.dueSince||updOf(card.date) };
    else if (rejected)         resolution = { state:"Rejected", by:card.rejectedBy||"A. Prabhu", on:updOf(card.date), remark:"Returned to requester — cost centre and budget code missing." };
    return {
      id:card.id, requestType:card.requestType, raisedBy:card.requestedBy, raisedOn:card.date, project:card.requestedFor, status, workflow, audit, resolution,
      basics:[{ label:"Application", value:card.app?card.app.name:"—" },{ label:"Priority", value:card.priority||"—" },{ label:"Requested for", value:card.requestedFor },{ label:"Quantity", value:"12 Nos" },{ label:"Estimated cost", value:"₹ 4,80,000" }],
      assignment:[{ label:"Assignee", value:who+(card.assignee?" · Owner":" · Requester") },{ label:"Approver", value:"A. Prabhu · Dept. Head" },{ label:"Assigned on", value:card.assignedOn||"—" },{ label:"Cost centre", value:"CC-4100" }],
      execution:[{ label:"Current stage", value:status },{ label:"Started on", value:card.startedOn||"—" },{ label:"Days active", value:card.days!=null?card.days+" days":"—" },{ label:"Due", value:card.dueSince?"Overdue since "+card.dueSince:(card.assignedOn||"—") }],
      documents:[{ name:card.id+"-spec.pdf", type:"pdf", meta:"248 KB · "+card.date },{ name:"drawing.step", type:"cad", meta:"1.1 MB · "+card.date }],
      effort: canEffort ? { canLog:true, assignees:[who], entries:card.__effort||_seedEffort(card,status,who) } : null,
    };
  };
  const [active,    setActive]    = useState("quick");
  const [navOpen,   setNavOpen]   = useState(true);
  const [tab,       setTab]       = useState("all");
  const [statsOpen, setStatsOpen] = useState(false);
  const [q,         setQ]         = useState("");
  /* Appearance — the default follows the OS; the Settings toggle overrides it
     for this session and persists. Theme.watchSystemMode keeps an
     un-overridden desk in step when the OS flips. */
  const [modePref, setModePref] = useState(() => Theme.storedMode());
  const [sysMode,  setSysMode]  = useState(() => Theme.resolveMode("system"));
  const dark = (modePref === "system" ? sysMode : modePref) === "dark";
  const setDark = (v: boolean) => { const p = v ? "dark" : "light"; setModePref(p); Theme.storeMode(p); };
  useEffect(() => Theme.watchSystemMode(setSysMode), []);
  const [accent,    setAccent]    = useState(null);
  const [statFilter,setStatFilter]= useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filterVals, setFilterVals] = useState(null);
  const [viewMode,  setViewMode]  = useState("list");
  const [crewView,  setCrewView]  = useState("list");
  const [crewPerson, setCrewPerson] = useState(null);
  const [ganttGroupBy, setGanttGroupBy] = useState("requestType");
  const [assignedTo, setAssignedTo] = useState("me");
  const [rightOpen, setRightOpen] = useState(false);
  const [appSwOpen, setAppSwOpen] = useState(false);

  /* Pinned apps — persisted in localStorage; injected into workspace rail */
  const [pinnedApps, setPinnedApps] = useState(() => {
    try { return JSON.parse(localStorage.getItem("agni-pinned-apps") || "[]"); } catch { return []; }
  });
  const handlePinChange = (apps) => {
    setPinnedApps(apps);
    try { localStorage.setItem("agni-pinned-apps", JSON.stringify(apps)); } catch {}
  };
  const workspaceItems = [
    ...BASE_WORKSPACE_ITEMS_TOP,
    ...pinnedApps.map((a, i) => ({ key: "pin-" + i, icon: a.icon, label: a.label.replace(/\n/g, " "), launch: true })),
    ...(pinnedApps.length > 0 ? ["divider"] : []),
    ...BASE_WORKSPACE_ITEMS_BOTTOM.map((it) => {
      if (!it || typeof it !== "object") return it;
      /* Live counts — tasks from the board's assigned lanes, approvals from pending records */
      if (it.key === "tasks")     return { ...it, badge: TASK_LANES.reduce((a, k) => a + ((window.SCAFFOLD_BOARD || {})[k] || []).length, 0) };
      if (it.key === "approvals") return { ...it, badge: (window.SCAFFOLD_RECORDS || []).filter((r) => r.status === "Pending" || r.status === "In Review").length };
      return it;
    }),
  ];
  const [navOverlay,setNavOverlay]= useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [submitted, setSubmitted]     = useState(null);
  const [viewRow, setViewRow]         = useState(null);
  const [boardCard, setBoardCard]     = useState(null);   // { card, status } from the kanban board
  const [, setTick]                   = useState(0);
  const [wsPanel, setWsPanel]         = useState(null); // active workspace side panel key
  const viewRec = viewRow ? buildRequest(viewRow) : null;
  let boardRec = null;
  try { boardRec = boardCard ? _buildRec(boardCard.card, boardCard.status) : null; } catch(e) { console.error("_buildRec failed:", e); }
  const openBoardCard = (card, col) => {
    const status = _COL_STATUS[col] || col;
    if (_EFFORT_COLS.indexOf(status) !== -1 && !card.__effort) {
      card.__effort = _seedEffort(card, status, card.assignee || card.requestedBy);
    }
    setBoardCard({ card, status: col });
  };
  const handleLogEffort = (entry) => {
    if (!boardCard) return;
    const c = boardCard.card;
    c.__effort = [entry, ...(c.__effort || [])];
  };
  /* Stops an in-progress effort session from the Tasks panel: folds the elapsed
     time into the running total, bumps the interval count, and files the note
     into the card's effort ledger (same shape as the detail modal's log). */
  const stopLogging = (card, notes) => {
    if (!card.effort) return;
    const startedAt = card.effort.startedAt, current = card.effort.current;
    card.effort = { total: card.effort.total, intervals: (card.effort.intervals || 0) + 1, running: false };
    card.__effort = [{ by: card.assignee || card.requestedBy, startLabel: startedAt, endLabel: "just now", hours: null, duration: current, note: notes || undefined, loggedOn: "just now" }, ...(card.__effort || [])];
    setTick((t) => t + 1);
  };
  /* Starts an effort session straight from the Tasks panel card — no modal,
     just flips the card into the running state so the timer starts ticking. */
  const startLogging = (card) => {
    const now = new Date().toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
    card.effort = { total: (card.effort && card.effort.total) || "0m", intervals: (card.effort && card.effort.intervals) || 0, running: true, current: "0m", startedAt: now };
    setTick((t) => t + 1);
  };
  /* Completing a task moves its card to the Completed lane (prototype
     persistence) — used by the Tasks panel ✓ and the detail modal action. */
  const completeTask = (card, lane, remark) => {
    const arr = (window.SCAFFOLD_BOARD || {})[lane] || [];
    const i = arr.indexOf(card);
    if (i >= 0) arr.splice(i, 1);
    card.completedOn = "20 Jun";
    if (card.days == null) card.days = 4;
    if (remark) card.__remark = remark;
    window.SCAFFOLD_BOARD["Completed"] = window.SCAFFOLD_BOARD["Completed"] || [];
    window.SCAFFOLD_BOARD["Completed"].unshift(card);
    setTick((t) => t + 1);
  };
  const handleReview = (action, remark) => {
    if (!viewRow) return;
    viewRow.status = action === "approve" ? "Approved" : "Rejected";
    viewRow.__remark = remark;
    setTick((t) => t + 1);
  };

  const bp = useBreakpoint();
  const isPhone   = bp === "phone";
  const isDesktop = bp === "desktop";

  /* Leaving small screens dismisses the overlay drawer so it can't linger. */
  useEffect(() => { if (isDesktop) setNavOverlay(false); }, [isDesktop]);

  useEffect(() => {
    if (document.getElementById("__admin-dark-css")) return;
    const el=document.createElement("style"); el.id="__admin-dark-css"; el.textContent=DARK_CSS;
    document.head.appendChild(el); return () => el.remove();
  }, []);

  /* Rail mode by breakpoint: desktop = user drawer⇄icon · tablet = persistent icon
     rail (toggle opens the overlay) · phone = no inline rail, nav is overlay-only. */
  const inlineNavOpen = isDesktop && navOpen;
  const railW  = isPhone ? "0px" : (inlineNavOpen ? RAIL_OPEN : RAIL_CLOSED);
  const pageBg = "var(--surface-page)";
  const cardBg = dark ? "rgba(6,16,74,0.60)" : "var(--surface-card)";

  /* Background — default is a subtle sage tint; user pick persists across sessions. */
  const [wallpaper, setWallpaper] = useState(() => {
    try { return localStorage.getItem(WALLPAPER_LS_KEY) || "sage"; } catch (e) { return "sage"; }
  });
  useEffect(() => { try { localStorage.setItem(WALLPAPER_LS_KEY, wallpaper); } catch (e) {} }, [wallpaper]);

  /* Display size — fractional --scale rung; persists across sessions. Mirrored
     onto <html> so portaled overlays (modals, dropdowns rendered at body level,
     outside .admin-app) scale with the desk too. */
  const [scale, setScale] = useState(() => {
    try { return localStorage.getItem(SCALE_LS_KEY) || "md"; } catch (e) { return "md"; }
  });
  useEffect(() => {
    try { localStorage.setItem(SCALE_LS_KEY, scale); } catch (e) {}
    const prev = document.documentElement.getAttribute("data-scale");
    document.documentElement.setAttribute("data-scale", scale);
    return () => { if (prev) document.documentElement.setAttribute("data-scale", prev); else document.documentElement.removeAttribute("data-scale"); };
  }, [scale]);
  const wpEntry = WALLPAPERS.find((w) => w.key === wallpaper);
  const wpSrc = (wpEntry || {}).src || null;
  const wpColor = (wpEntry || {}).color || null;

  /* Records fetch state, spread into every records view as {...dataState}.
     The seeds are local, so the scaffold simulates one short fetch on first
     paint to exercise the DS loading states. Swap this for your real fetch:
     { loading, error, onRetry } is all the views need. */
  const [booting, setBooting] = useState(true);
  useEffect(() => { const t = setTimeout(() => setBooting(false), 650); return () => clearTimeout(t); }, []);
  const dataState = { loading: booting, error: null, onRetry: () => setBooting(true) };

  /* Workspace pane: gradient bg (white → sage) in light mode, navy in dark. */
  const workspaceBg = dark
    ? "var(--surface-page)"
    : "linear-gradient(180deg, var(--surface-card) 0%, var(--agni-green-150) 100%)";

  const content = () => {
    if (active==="quick")       return <QuickAccessPage onNavigate={setActive} onNewRequest={() => setRequestOpen(true)} />;
    if (active==="dashboard")   return <DashboardView dateRange={dateRange} dark={dark} />;
    if (active==="assignments") return <KanbanBoard q={q} dark={dark} onView={openBoardCard} {...dataState} />;
    if (active==="crew") {
      if (crewPerson) return <CrewProfilePage person={crewPerson} onBack={() => setCrewPerson(null)} onOpen={setCrewPerson} />;
      if (crewView==="tree") return <CrewTree q={q} onOpen={setCrewPerson} />;
      return <CrewTable q={q} onOpen={setCrewPerson} />;
    }
    if (active==="requests") {
      if (tab==="your") return <EmptyState />;
      if (viewMode==="kanban")   return <KanbanBoard q={q} dark={dark} onView={openBoardCard} {...dataState} />;
      if (viewMode==="card")     return <CardView q={q} dark={dark} statFilter={statFilter} filterVals={filterVals} onView={setViewRow} {...dataState} />;
      if (viewMode==="timeline") return <TimelineView q={q} groupBy={ganttGroupBy} dateRange={dateRange} onView={openBoardCard} />;
      if (viewMode==="calendar") return <CalendarView q={q} statFilter={statFilter} filterVals={filterVals} onView={setViewRow} {...dataState} />;
      return <RecordsTable q={q} dark={dark} statFilter={statFilter} filterVals={filterVals} onView={setViewRow} {...dataState} />;
    }
    return <PlaceholderPage icon="ph-rows" title={(PAGE_META[active]||{}).title || active} />;
  };

  return (
    <div className="admin-app" data-theme={dark ? "dark" : "light"} data-density="comfortable" data-scale={scale} style={{ height:"100%", ...Theme.deriveAccentVars(accent, dark) }}>
      <AppShell
        header={<Header navOpen={inlineNavOpen} railW={railW} dark={dark} setDark={setDark} accent={accent} setAccent={setAccent} wallpaper={wallpaper} setWallpaper={setWallpaper} scale={scale} setScale={setScale} isPhone={isPhone} onMenu={() => setNavOverlay(true)} active={active} />}
        sidebar={isPhone ? null : <ScaffoldNav active={active} setActive={setActive} navOpen={inlineNavOpen} setNavOpen={isDesktop ? setNavOpen : () => setNavOverlay(true)} dark={dark} />}
        sidebarWidth={railW}
        contentPad="0"
        contentStyle={{ height:"100%", display:"flex", flexDirection:"row" }}
        footer={<Footer />}
      >
        {/* Main column — no page scroll; table card handles its own scroll.
            Background (user-set in Settings) paints behind every page here. */}
        <div style={{ flex:1, minWidth:0, overflow:"hidden", display:"flex", flexDirection:"column",
          background: wpSrc ? `url("${wpSrc}") center / cover no-repeat` : (wpColor || undefined) }}>
          {/* Sticky toolbar — hidden on the Quick access landing page */}
          {active!=="quick" && (
          <div style={{ position:"sticky", top:0, zIndex:"var(--z-sticky)", background: (wpSrc || wpColor) ? "transparent" : pageBg, flexShrink:0 }}>
            <div style={{ padding:"var(--pane-pad) var(--pane-pad) 0" }}>
              <div style={{ background:cardBg, backdropFilter: dark ? "blur(14px)" : "none", WebkitBackdropFilter: dark ? "blur(14px)" : "none", borderRadius:"var(--radius-lg)", border:"1px solid var(--border-subtle)", overflow:"visible" }}>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border-subtle)" }}>
                  <PageTitleBar active={active} tab={tab} setTab={setTab} dark={dark} viewMode={active==="crew"?crewView:viewMode} setViewMode={active==="crew" ? (crewPerson ? undefined : setCrewView) : setViewMode} />
                </div>
                {!(active==="crew" && crewPerson) && <div style={{ padding:"10px 16px" }}>
                  <PageControls q={q} setQ={setQ} statsOpen={statsOpen} setStatsOpen={setStatsOpen} active={active} viewMode={viewMode} setViewMode={setViewMode} dateRange={dateRange} setDateRange={setDateRange} filterVals={filterVals} setFilterVals={setFilterVals} isPhone={isPhone} onImport={() => setImportOpen(true)} onNewRecord={() => setRequestOpen(true)} variant={active==="dashboard"?"dashboard":active==="crew"?"crew":"full"} assignedTo={assignedTo} setAssignedTo={setAssignedTo} ganttGroupBy={ganttGroupBy} setGanttGroupBy={setGanttGroupBy} />
                </div>}
              </div>
              {active==="requests"&&statsOpen&&<QuickStats statFilter={statFilter} setStatFilter={setStatFilter} />}
            </div>
          </div>
          )}

          {/* Content — flex column so views can fill remaining height.
              minHeight:0 keeps this flex item bounded to the space under the
              sticky toolbar so height-filling views (kanban lanes) scroll
              internally instead of expanding and clipping. */}
          <div style={{ flex:1, minHeight:0, padding: active==="quick" ? "0" : "8px var(--pane-pad) var(--pane-pad)", display:"flex", flexDirection:"column", overflowY: active==="quick"||active==="dashboard" ? "auto" : "visible" }}>
            {content()}
          </div>
        </div>

        {/* Right workspace pane — desktop only; folds away on tablet/phone (layout guide) */}
        {isDesktop && (
        <WorkspacePane
          items={workspaceItems}
          title="Workspace"
          activeKey={appSwOpen ? "apps" : wsPanel}
          open={rightOpen}
          onToggleOpen={setRightOpen}
          onSelect={(key) => { if (key === "apps") setAppSwOpen(true); else setWsPanel(p => p === key ? null : key); }}
          style={{ background: workspaceBg }}
        />
        )}
      </AppShell>

      {/* Nav overlay drawer — tablet (rail toggle) & phone (header menu) */}
      {!isDesktop && (
        <ScaffoldNav active={active} setActive={setActive} navOpen={navOverlay} setNavOpen={() => {}} dark={dark} overlay onClose={() => setNavOverlay(false)} />
      )}

      {/* Import records modal */}
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />

      {/* Create-request form (slide-up Sheet) + submission confirmation */}
      <RequestForm
        open={requestOpen}
        cols={cols}
        onClose={() => setRequestOpen(false)}
        onSubmitted={(data) => { setRequestOpen(false); setSubmitted(data); }}
      />
      <SubmitConfirmModal
        data={submitted}
        onClose={() => setSubmitted(null)}
        onView={() => { setSubmitted(null); setActive("requests"); }}
      />

      {/* Detail-modal placement while a workspace side panel is open — offset
          below the header/above the footer and past the rail (so both stay
          visible, never covered) and cap the sheet height to fit that gap. */}
      {/* View-request detail modal — approve / reject with audit trail */}
      {RDM && (
        <RDM
          open={!!viewRow}
          record={viewRec}
          columns={detailCols}
          onClose={() => setViewRow(null)}
          onAction={handleReview}
          containerStyle={wsPanel ? { top:"var(--bar-h)", left:railW, bottom:"var(--footer-h)", right: rightOpen ? 612 : 440 } : {}}
          style={wsPanel ? { height:"min(900px, calc(100vh - var(--bar-h) - var(--footer-h) - 24px))" } : {}}
        />
      )}

      {/* Workspace side panels — Google-style, slide in beside the rail */}
      <WorkspaceSidePanel
        panelKey={wsPanel}
        railOpen={rightOpen}
        onClose={() => setWsPanel(null)}
        onView={(row) => { setViewRow(row); }}
        onViewTask={(card, lane) => openBoardCard(card, lane)}
        onCompleteTask={(card, lane) => completeTask(card, lane)}
        onStopLogging={(card, notes) => stopLogging(card, notes)}
        onStartLogging={(card) => startLogging(card)}
        onNewTask={() => setRequestOpen(true)}
        onTick={() => setTick((t) => t + 1)}
        selectedApprovalId={viewRow ? viewRow.id : null}
        selectedTaskId={boardCard ? boardCard.card.id : null}
      />

      {/* Board card detail modal — opened from a kanban card · adds Effort log */}
      {RDM && (
        <RDM
          open={!!boardCard}
          record={boardRec}
          columns={detailCols}
          onClose={() => setBoardCard(null)}
          onAction={() => setBoardCard(null)}
          onComplete={boardCard && _EFFORT_COLS.indexOf(_COL_STATUS[boardCard.status] || boardCard.status) !== -1
            ? (remark) => { completeTask(boardCard.card, boardCard.status, remark); setBoardCard(null); }
            : undefined}
          onLogEffort={handleLogEffort}
          containerStyle={wsPanel ? { top:"var(--bar-h)", left:railW, bottom:"var(--footer-h)", right: rightOpen ? 612 : 440 } : {}}
          style={wsPanel ? { height:"min(900px, calc(100vh - var(--bar-h) - var(--footer-h) - 24px))" } : {}}
        />
      )}

      {/* App Switcher scrim — same content blur, excludes header / footer / rail */}
      {appSwOpen && (
        <div style={{ position:"fixed", top:"var(--bar-h)", left:0, bottom:"var(--footer-h)", right:"var(--workspace-rail-w)", zIndex:"var(--z-overlay)", background:"rgba(0,0,0,0.18)", backdropFilter:"blur(4px)", pointerEvents:"none" }} />
      )}

      {/* App Switcher overlay — consumed from the DS bundle */}}
      <AppSwitcher
        open={appSwOpen}
        onClose={() => setAppSwOpen(false)}
        quickActions={APP_SWITCHER_QUICK}
        categories={APP_CATEGORIES}
        pinnedApps={pinnedApps}
        onPinChange={handlePinChange}
      />
    </div>
  );
}

module.exports = { AdminApp };
