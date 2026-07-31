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
  onReady,
}: {
  initialDesign: UnlayerDesign;
  editorRef?: React.MutableRefObject<UnlayerEditorHandle | null>;
  onReady?: () => void;
}) {
  const ref = useRef<EditorRef>(null);

  useImperativeHandle(
    editorRef,
    () => ({
      save: () =>
        new Promise((resolve, reject) => {
          if (!ref.current?.editor) {
            reject(new Error("Editor is still loading"));
            return;
          }
          ref.current.editor.exportHtml((data) => {
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
        onReady={(unlayer) => {
          unlayer.loadDesign(initialDesign as never);
          onReady?.();
        }}
        minHeight="100%"
        style={{ flex: 1 }}
      />
    </div>
  );
}
