import { useRef, useImperativeHandle } from "react";
import type React from "react";
import EmailEditor, { type EditorRef } from "react-email-editor";
import type { UnlayerDesign } from "../../../types";

export interface UnlayerEditorHandle {
  /** Exports the current design + rendered HTML. */
  save: () => Promise<{ design: UnlayerDesign; html: string }>;
}

export default function UnlayerEditor({
  initialDesign,
  editorRef,
}: {
  initialDesign: UnlayerDesign;
  editorRef?: React.MutableRefObject<UnlayerEditorHandle | null>;
}) {
  const ref = useRef<EditorRef>(null);

  useImperativeHandle(
    editorRef,
    () => ({
      save: () =>
        new Promise((resolve) => {
          ref.current?.editor?.exportHtml((data) => {
            resolve({ design: data.design as unknown as UnlayerDesign, html: data.html });
          });
        }),
    }),
    [],
  );

  return (
    <div className="h-full min-h-0 flex">
      <EmailEditor
        ref={ref}
        // `onReady` receives the live editor instance directly, so we don't
        // need to rely on `ref.current` being populated yet.
        onReady={(unlayer) => unlayer.loadDesign(initialDesign as never)}
        minHeight="100%"
        style={{ flex: 1 }}
      />
    </div>
  );
}
