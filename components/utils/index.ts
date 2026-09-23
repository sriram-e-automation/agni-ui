/* AgniUI utilities — shared logic and contracts with no visual of their own.
 * Components import the source files directly; this barrel is for consumers. */
export type { ActionSpec, ExportActionSpec } from "./actionSpec";
export { ChartKit } from "./ChartKit";
export type { ChartTooltipRow, ChartLegendItem, ChartKitType } from "./ChartKit.d";
export { resolveDataState, DataState } from "./DataState";
export type { DataStateProps } from "./DataState.d";
export { resolvePanelBody } from "./panelState";
export { RoleGate, roleAllows } from "./RoleGate";
export type { RoleGateProps } from "./RoleGate.d";
export { Theme } from "./Theme";
export type { AccentPreset, Mode, ModePref, ThemeApi } from "./Theme.d";

/* Form-library adapters — React Hook Form register() / Formik field → AgniUI controls. */
export { fieldProps, createChangeEvent, createBlurEvent } from "./form";
export type { EventFieldProps, FieldHelpers, ValueFieldProps } from "./form";

/* Field context — build a custom control that <FormField> wires like the DS ones. */
export { FieldContext, useFieldContext, useFieldControl } from "./field";
export type { FieldContextValue, FieldControlInput } from "./field";

/* Interaction helpers the DS components are built on — ids, refs, handler
   composition, controlled state, focus and keyboard. */
export {
  useStableId, mergeRefs, useMergedRef, setRef, composeHandlers, useControllableState,
  useOutsideClick, useFocusTrap, useScrollLock, getFocusable, pressableProps,
  getNavigationIndex, useListNavigation, useRovingFocus, useTypeahead, isActivationKey,
} from "./interaction";
export type { PossibleRef, ControllableStateOptions, FocusTrapOptions, Orientation, NavigateOptions, ListNavigationOptions } from "./interaction";
