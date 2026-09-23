import * as React from "react";
export interface RichTextEditorProps {
  /** Initial HTML (seeded once on mount). */
  value?: string;
  /** Receives the HTML string on every edit. */
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Minimum editor height in px. Default 160. */
  minHeight?: number;
  disabled?: boolean;
  error?: boolean;
  style?: React.CSSProperties;
}
/** Long-text editor: formatting toolbar over a contentEditable surface.
 *  @version 1.0.0
  * States: error · disabled.
*/
export declare function RichTextEditor(props: RichTextEditorProps): JSX.Element;
