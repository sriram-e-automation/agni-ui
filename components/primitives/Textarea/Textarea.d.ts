import * as React from "react";
export interface TextareaProps {
  value?: string;
  onChange?: (value: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}
/** Multi-line text field.
 *  @version 1.0.0
  * States: error · disabled.
*/
export declare function Textarea(props: TextareaProps): JSX.Element;
