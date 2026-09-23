/* AgniUI — the public surface.
 *
 * This file decides what is public. Anything NOT exported here is internal:
 * that is how ButtonBase, IconButton, SplitButton and the other retired
 * renderers stay reachable inside the library while being absent from the
 * published API.
 *
 * Generated from the .d.ts contracts. Each line points at a component folder's
 * index.ts barrel (utilities at components/utils). Add a line when you add a component;
 * the four-check review gate in CONTRIBUTING.md checks that you did.
 */

import "./styles.css";

/* ── primitives ──────────────────────────────────────────────── */
export { Avatar } from "./components/primitives/Avatar";
export type { AvatarProps } from "./components/primitives/Avatar";
export { AvatarStack } from "./components/primitives/AvatarStack";
export type { AvatarStackProps } from "./components/primitives/AvatarStack";
export { Button } from "./components/primitives/Button";
export type { ButtonMenuItem, ButtonProps, ButtonVariant } from "./components/primitives/Button";
export { Checkbox } from "./components/primitives/Checkbox";
export type { CheckboxProps } from "./components/primitives/Checkbox";
export { Input } from "./components/primitives/Input";
export type { InputProps } from "./components/primitives/Input";
export { Radio, RadioGroup } from "./components/primitives/Radio";
export type { RadioProps, RadioGroupProps, RadioOption } from "./components/primitives/Radio";
export { Rating } from "./components/primitives/Rating";
export type { RatingProps } from "./components/primitives/Rating";
export { Select } from "./components/primitives/Select";
export type { SelectOption, SelectUser, SelectProps, SingleSelectProps, MultipleSelectProps } from "./components/primitives/Select";
export { Switch } from "./components/primitives/Switch";
export type { SwitchProps } from "./components/primitives/Switch";
export { Tag } from "./components/primitives/Tag";
export type { TagTone, TagProps } from "./components/primitives/Tag";
export { Textarea } from "./components/primitives/Textarea";
export type { TextareaProps } from "./components/primitives/Textarea";

/* ── forms ───────────────────────────────────────────────────── */
export { DatePicker } from "./components/forms/DatePicker";
export type { DatePickerProps, DatePickerLabels } from "./components/forms/DatePicker";
export { FileUpload } from "./components/forms/FileUpload";
export type { FileRejection, FileUploadProps } from "./components/forms/FileUpload";
export { FormField } from "./components/forms/FormField";
export type { FormFieldProps } from "./components/forms/FormField";
export { FormSection } from "./components/forms/FormSection";
export type { FormSectionProps } from "./components/forms/FormSection";
export { QuantityStepper } from "./components/forms/QuantityStepper";
export type { QuantityStepperProps } from "./components/forms/QuantityStepper";
export { RichTextEditor } from "./components/forms/RichTextEditor";
export type { RichTextEditorProps } from "./components/forms/RichTextEditor";

/* ── navigation ──────────────────────────────────────────────── */
export { ActionTile } from "./components/navigation/ActionTile";
export type { ActionTileProps } from "./components/navigation/ActionTile";
export { Breadcrumbs } from "./components/navigation/Breadcrumbs";
export type { Crumb, BreadcrumbsProps } from "./components/navigation/Breadcrumbs";
export { CommandPalette } from "./components/navigation/CommandPalette";
export type { Command, CommandPaletteProps } from "./components/navigation/CommandPalette";
export { DropdownMenu } from "./components/navigation/DropdownMenu";
export type { MenuItem, DropdownMenuProps } from "./components/navigation/DropdownMenu";
export { Tabs } from "./components/navigation/Tabs";
export type { TabItem, TabTrackItem, TabsProps } from "./components/navigation/Tabs";

/* ── data ────────────────────────────────────────────────────── */
export { AttachmentRow } from "./components/data/AttachmentRow";
export type { AttachmentRowProps } from "./components/data/AttachmentRow";
export { BulkActionToolbar } from "./components/data/BulkActionToolbar";
export type { BulkAction, BulkActionToolbarProps } from "./components/data/BulkActionToolbar";
export { Calendar } from "./components/data/Calendar";
export type { CalendarRecord, CalendarView, CalendarProps } from "./components/data/Calendar";
export { DataTable } from "./components/data/DataTable";
export type { DataColumn, ColumnPicker, ActionColumn, DataTableProps, DataSort } from "./components/data/DataTable";
export { DateRangeFilter, computePeriod } from "./components/data/DateRangeFilter";
export type { DateRange, DateRangeFilterProps } from "./components/data/DateRangeFilter";
export { CopyButton, KeyValueRow, DetailList } from "./components/data/DetailList";
export type { KeyValueItem, KeyValueRowProps, DetailListProps, CopyButtonProps } from "./components/data/DetailList";
export { DetailSection } from "./components/data/DetailSection";
export type { DetailSectionProps } from "./components/data/DetailSection";
export { DocumentPreview } from "./components/data/DocumentPreview";
export type { DocumentPreviewProps } from "./components/data/DocumentPreview";
export { EditableTable } from "./components/data/EditableTable";
export type { EditableColumn, EditableTableProps } from "./components/data/EditableTable";
export { EventRow } from "./components/data/EventRow";
export type { EventRowProps } from "./components/data/EventRow";
export { FilterBuilder } from "./components/data/FilterBuilder";
export type { FilterField, FilterRule, FilterBuilderProps } from "./components/data/FilterBuilder";
export { FilterPanel } from "./components/data/FilterPanel";
export type { FilterSection, FilterValue, FilterPanelProps } from "./components/data/FilterPanel";
export { GanttTimeline } from "./components/data/GanttTimeline";
export type { GanttItem, GanttGroupOption, GanttScale, GanttTimelineProps } from "./components/data/GanttTimeline";
export { KanbanBoard } from "./components/data/KanbanBoard";
export type { KanbanPerson, KanbanBoardProps } from "./components/data/KanbanBoard";
export { List } from "./components/data/List";
export type { ListItem, ListProps } from "./components/data/List";
export { OptionRow } from "./components/data/OptionRow";
export type { OptionRowProps } from "./components/data/OptionRow";
export { OrgTree } from "./components/data/OrgTree";
export type { OrgPerson, OrgTreeProps } from "./components/data/OrgTree";
export { PageControls } from "./components/data/PageControls";
export type { PageControlsColumn, PageControlsSort, PageControlsViewMode, PageControlsPagination, PageControlsProps } from "./components/data/PageControls";
export { Pagination } from "./components/data/Pagination";
export type { PaginationProps } from "./components/data/Pagination";
export { PersonCard } from "./components/data/PersonCard";
export type { PersonInfo, PersonCardProps } from "./components/data/PersonCard";
export { QuickStats } from "./components/data/QuickStats";
export type { QuickStatItem, QuickStatsProps } from "./components/data/QuickStats";
export { normalizeRecord, RecordCard } from "./components/data/RecordCard";
export type { RecordCardApp, RecordCardPerson, RecordCardEffort, RecordCardRecord, RecordCardProps } from "./components/data/RecordCard";
export { RecordTable } from "./components/data/RecordTable";
export type { RecordTablePagination, RecordTableProps } from "./components/data/RecordTable";
export { StageList } from "./components/data/StageList";
export type { StageState, StageAction, RecordStage, StageListProps } from "./components/data/StageList";
export { StatCard } from "./components/data/StatCard";
export type { StatCaption, StatCardProps } from "./components/data/StatCard";
export { StatsOverview } from "./components/data/StatsOverview";
export type { StatsOverviewChart, StatsOverviewProps } from "./components/data/StatsOverview";
export { TreeView } from "./components/data/TreeView";
export type { TreeNode, TreeViewProps } from "./components/data/TreeView";

/* ── charts ──────────────────────────────────────────────────── */
export { BarChart } from "./components/charts/BarChart";
export type { BarSeries, BarAxis, BarDatum, BarChartProps } from "./components/charts/BarChart";
export { ChartCard } from "./components/charts/ChartCard";
export type { ChartLegendEntry, ChartCardProps } from "./components/charts/ChartCard";
export { DonutChart } from "./components/charts/DonutChart";
export type { DonutDatum, DonutChartProps } from "./components/charts/DonutChart";
export { Gauge } from "./components/charts/Gauge";
export type { GaugeProps } from "./components/charts/Gauge";
export { Heatmap } from "./components/charts/Heatmap";
export type { HeatmapAxis, HeatmapSeries, HeatmapProps } from "./components/charts/Heatmap";
export { LineChart } from "./components/charts/LineChart";
export type { LineSeries, LineAxis, LineDatum, LineChartProps } from "./components/charts/LineChart";
export { PieChart } from "./components/charts/PieChart";
export type { PieDatum, PieSeries, PieChartProps } from "./components/charts/PieChart";
export { RadarChart } from "./components/charts/RadarChart";
export type { RadarSeries, RadarConfig, RadarChartProps } from "./components/charts/RadarChart";
export { ScatterChart } from "./components/charts/ScatterChart";
export type { ScatterPoint, ScatterSeries, ScatterAxis, ScatterChartProps } from "./components/charts/ScatterChart";
export { SparkLineChart } from "./components/charts/SparkLineChart";
export type { SparkLineChartProps } from "./components/charts/SparkLineChart";

/* ── feedback ────────────────────────────────────────────────── */
export { EmptyState } from "./components/feedback/EmptyState";
export type { EmptyStateProps } from "./components/feedback/EmptyState";
export { ErrorState } from "./components/feedback/ErrorState";
export type { ErrorStateProps } from "./components/feedback/ErrorState";
export { Spinner, LoadingOverlay, Loading, LoadingShapes } from "./components/feedback/Loading";
export type { LoadingShape, LoadingProps, SpinnerProps, LoadingOverlayProps } from "./components/feedback/Loading";
export { Modal } from "./components/feedback/Modal";
export type { ModalProps } from "./components/feedback/Modal";
export { Notice } from "./components/feedback/Notice";
export type { NoticeProps } from "./components/feedback/Notice";
export { Progress } from "./components/feedback/Progress";
export type { ProgressProps } from "./components/feedback/Progress";
export { Tooltip, TipBubble, useTip } from "./components/feedback/Tooltip";
export type { TooltipProps, TipBubbleProps } from "./components/feedback/Tooltip";

/* ── containment ─────────────────────────────────────────────── */
export { Accordion } from "./components/containment/Accordion";
export type { AccordionItem, AccordionProps } from "./components/containment/Accordion";
export { Card } from "./components/containment/Card";
export type { CardProps } from "./components/containment/Card";
export { Panel } from "./components/containment/Panel";
export type { PanelProps } from "./components/containment/Panel";

/* ── layout ──────────────────────────────────────────────────── */
export { AppShell } from "./components/layout/AppShell";
export type { AppShellProps } from "./components/layout/AppShell";
export { Bar } from "./components/layout/Bar";
export type { BarProps } from "./components/layout/Bar";
export { Cluster, Stack } from "./components/layout/Cluster";
export type { ClusterProps, StackProps } from "./components/layout/Cluster";

/* ── chrome ──────────────────────────────────────────────────── */
export { AppSwitcher } from "./components/chrome/AppSwitcher";
export type { LauncherApp, AppCategory, AppSwitcherProps } from "./components/chrome/AppSwitcher";
export { NavRail } from "./components/chrome/NavRail";
export type { NavRailItem, NavRailProps } from "./components/chrome/NavRail";
export { NotificationsMenu } from "./components/chrome/NotificationsMenu";
export type { NotificationItem, NotificationsMenuProps } from "./components/chrome/NotificationsMenu";
export { PageTitleBar } from "./components/chrome/PageTitleBar";
export type { PageTab, PageViewMode, PageTitleBarProps } from "./components/chrome/PageTitleBar";
export { PanelIconMenu, MenuRow, PanelEmpty, panelMenuLabelStyle, PanelKit } from "./components/chrome/PanelKit";
export type { PanelIconMenuProps, MenuRowProps, PanelEmptyProps } from "./components/chrome/PanelKit";
export { SettingsMenu } from "./components/chrome/SettingsMenu";
export type { SettingsMenuProps } from "./components/chrome/SettingsMenu";
export { ShellFooter } from "./components/chrome/ShellFooter";
export type { ShellFooterProps } from "./components/chrome/ShellFooter";
export { ShellHeader } from "./components/chrome/ShellHeader";
export type { ShellUser, ShellProfileItem, ShellWallpaper, ShellHeaderProps } from "./components/chrome/ShellHeader";
export { WorkspacePane } from "./components/chrome/WorkspacePane";
export type { WorkspaceItem, WorkspacePaneProps } from "./components/chrome/WorkspacePane";

/* ── workflow ────────────────────────────────────────────────── */
export { ApprovalPanel } from "./components/workflow/ApprovalPanel";
export type { ApprovalPanelProps } from "./components/workflow/ApprovalPanel";
export { ApprovalStepper } from "./components/workflow/ApprovalStepper";
export type { ApprovalStep, ApprovalStepperProps } from "./components/workflow/ApprovalStepper";
export { AuditTrail } from "./components/workflow/AuditTrail";
export type { AuditEntry, AuditTrailProps } from "./components/workflow/AuditTrail";
export { ConfirmModal } from "./components/workflow/ConfirmModal";
export type { ConfirmSummaryRow, ConfirmChoice, ConfirmUser, ConfirmImportColumn, ConfirmModalProps } from "./components/workflow/ConfirmModal";
export { RecordDetailModal } from "./components/workflow/RecordDetailModal";
export type { DetailField, Person, RecordDocument, RecordAuditEntry, RecordResolution, SectionFilter, SectionSearch, SectionContext, RecordSection, RecordPane, RecordAction, FlowContext, RecordFlow, RecordParent, RecordAssignment, EffortEntry, RecordEffort, RecordDetailRecord, RecordDetailModalProps } from "./components/workflow/RecordDetailModal";
export { RecordForm, buildReviewSummary, REQUEST_FORM_DEFAULTS } from "./components/workflow/RecordForm";
export type { RequestOption, RequestPerson, RecordFormValue, RecordFormProps } from "./components/workflow/RecordForm";

/* ── utils — shared logic & contracts ────────────────────────── */
export { RoleGate, roleAllows } from "./components/utils";
export { ChartKit } from "./components/utils";
export { resolveDataState, DataState } from "./components/utils";
export { Theme } from "./components/utils";
export type { RoleGateProps } from "./components/utils";
export type { ChartTooltipRow, ChartLegendItem, ChartKitType } from "./components/utils";
export type { DataStateProps } from "./components/utils";
export type { AccentPreset, Mode, ModePref, ThemeApi } from "./components/utils";
export type { ActionSpec, ExportActionSpec } from "./components/utils";

/* ── utils — forms, fields & interaction ─────────────────────── */
export { fieldProps, createChangeEvent, createBlurEvent } from "./components/utils";
export type { EventFieldProps, FieldHelpers, ValueFieldProps } from "./components/utils";
export { FieldContext, useFieldContext, useFieldControl } from "./components/utils";
export type { FieldContextValue, FieldControlInput } from "./components/utils";
export {
  useStableId, mergeRefs, useMergedRef, composeHandlers, useControllableState,
  useFocusTrap, useScrollLock, pressableProps, useListNavigation, useRovingFocus,
} from "./components/utils";
