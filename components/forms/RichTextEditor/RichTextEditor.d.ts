import * as React from "react";
export interface RichTextEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onBlur" | "onFocus"> {
  /** HTML content. Seeded on mount; later changes apply only while the editor
   *  isn't focused (e.g. a form reset), so the caret never jumps. */
  value?: string;
  /** Alias of `value` for uncontrolled use. */
  defaultValue?: string;
  /** Receives the HTML string on every edit. */
  onChange?: (html: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  placeholder?: string;
  /** Minimum editor height in px. Default 160. */
  minHeight?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  /** Submitted with a native <form> as HTML through a hidden input. */
  name?: string;
  form?: string;
  /** Asks for a link URL (default: window.prompt). Resolve null to cancel. */
  onRequestLink?: () => string | null | Promise<string | null>;
  /** Accessible name of the toolbar. @default "Formatting" */
  toolbarLabel?: string;
  style?: React.CSSProperties;
}
/** Long-text editor: formatting toolbar over a contentEditable surface.
 *  The surface is a labelled multi-line textbox (the ref's target); the toolbar
 *  is a WAI-ARIA toolbar with aria-pressed toggles. Ctrl/⌘+B · I · U · K,
 *  Alt+F10 to the toolbar, Escape back to the text.
 *  @version 1.1.0
  * States: error · disabled.
*/
export declare const RichTextEditor: React.ForwardRefExoticComponent<RichTextEditorProps & React.RefAttributes<HTMLDivElement>>;
