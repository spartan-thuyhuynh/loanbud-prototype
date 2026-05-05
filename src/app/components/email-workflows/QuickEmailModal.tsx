import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Paperclip, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Link2, Smile,
  Undo2, Redo2, ChevronDown,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";

interface QuickEmailModalProps {
  toEmail: string;
  toName: string;
  onClose: () => void;
  initialSubject?: string;
  onSend?: (subject: string, body: string, sender: string) => void;
}

const SENDER_OPTIONS = [
  { value: "system", label: "System (support@loanbud.io)" },
  { value: "brand", label: "LoanBud Brand (noreply@loanbud.io)" },
  { value: "lo", label: "Assigned Loan Officer" },
];

const FONT_FAMILIES = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana"];
const FONT_SIZES = ["10px", "12px", "14px", "16px", "18px", "20px", "24px"];

export function QuickEmailModal({ toEmail, toName, onClose, initialSubject, onSend }: QuickEmailModalProps) {
  const { adminEmailTemplates } = useAppData();
  const [sender, setSender] = useState(SENDER_OPTIONS[0].value);
  const [subject, setSubject] = useState(initialSubject ?? "");
  const [cc, setCc] = useState(false);
  const [bcc, setBcc] = useState(false);
  const [ccValue, setCcValue] = useState("");
  const [bccValue, setBccValue] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("14px");
  const [wordCount, setWordCount] = useState(0);
  const [sent, setSent] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const updateWordCount = useCallback(() => {
    const text = bodyRef.current?.innerText ?? "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.fontFamily = fontFamily;
      bodyRef.current.style.fontSize = fontSize;
    }
  }, [fontFamily, fontSize]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    bodyRef.current?.focus();
  };

  const applyFont = (family: string) => { setFontFamily(family); exec("fontName", family); };
  const applySize = (size: string) => {
    setFontSize(size);
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const span = document.createElement("span");
    span.style.fontSize = size;
    range.surroundContents(span);
  };

  const handleTemplateSelect = (templateId: string) => {
    const tpl = adminEmailTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    setSubject(tpl.subject);
    if (bodyRef.current) {
      bodyRef.current.innerHTML = tpl.body;
      updateWordCount();
    }
  };

  const handleSend = () => {
    const body = bodyRef.current?.innerHTML ?? "";
    if (!subject.trim() && !bodyRef.current?.innerText?.trim()) return;
    onSend?.(subject, body, sender);
    setSent(true);
    setTimeout(onClose, 1400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).map((f) => f.name);
    setFileNames((prev) => [...prev, ...files]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ maxHeight: "92vh" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-base font-semibold text-gray-900">Compose Email</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Email body ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Fields */}
            <div className="divide-y divide-gray-100">

              {/* From + Template row */}
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <FieldRow label="From">
                  <select
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="flex-1 text-sm bg-transparent focus:outline-none appearance-none pr-6"
                  >
                    {SENDER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none shrink-0" />
                </FieldRow>
                <FieldRow label="Template">
                  <select
                    defaultValue=""
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="flex-1 text-sm bg-transparent focus:outline-none appearance-none pr-6 text-gray-700"
                  >
                    <option value="" disabled className="text-gray-400">Select template</option>
                    {adminEmailTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none shrink-0" />
                </FieldRow>
              </div>

              {/* Application row */}
              <FieldRow label="Application">
                <span className="flex-1 text-sm text-gray-400">Select application</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </FieldRow>

              {/* To row */}
              <div className="flex items-center px-4 py-2.5 gap-3">
                <span className="text-sm text-gray-500 w-20 shrink-0">To</span>
                <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                  <span className="bg-gray-100 rounded-full px-2.5 py-0.5 text-sm text-gray-700">
                    {toName} &lt;{toEmail}&gt;
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setCc((v) => !v)}
                    className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${cc ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    CC
                  </button>
                  <button
                    onClick={() => setBcc((v) => !v)}
                    className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${bcc ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    BCC
                  </button>
                </div>
              </div>

              {/* CC row */}
              {cc && (
                <div className="flex items-center px-4 py-2 gap-3">
                  <span className="text-sm text-gray-500 w-20 shrink-0">CC</span>
                  <input
                    type="email"
                    value={ccValue}
                    onChange={(e) => setCcValue(e.target.value)}
                    placeholder="Add CC recipients"
                    className="flex-1 text-sm focus:outline-none bg-transparent placeholder:text-gray-400"
                  />
                </div>
              )}

              {/* BCC row */}
              {bcc && (
                <div className="flex items-center px-4 py-2 gap-3">
                  <span className="text-sm text-gray-500 w-20 shrink-0">BCC</span>
                  <input
                    type="email"
                    value={bccValue}
                    onChange={(e) => setBccValue(e.target.value)}
                    placeholder="Add BCC recipients"
                    className="flex-1 text-sm focus:outline-none bg-transparent placeholder:text-gray-400"
                  />
                </div>
              )}

              {/* Subject row */}
              <div className="flex items-center px-4 py-2.5 gap-3">
                <span className="text-sm text-gray-500 w-20 shrink-0">Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject line *"
                  className="flex-1 text-sm focus:outline-none bg-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Files row */}
              <div className="flex items-center px-4 py-2.5 gap-3">
                <span className="text-sm text-gray-500 w-20 shrink-0">Files ({fileNames.length})</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Upload from computer
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                {fileNames.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {fileNames.map((n, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{n}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Rich text editor ── */}
            <div className="flex flex-col flex-1 border-t border-gray-200 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 flex-wrap">
                {/* Font family */}
                <select
                  value={fontFamily}
                  onChange={(e) => applyFont(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-1.5 py-1 mr-1 bg-white focus:outline-none"
                >
                  {FONT_FAMILIES.map((f) => <option key={f}>{f}</option>)}
                </select>
                {/* Font size */}
                <select
                  value={fontSize}
                  onChange={(e) => applySize(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-1.5 py-1 mr-2 bg-white focus:outline-none"
                >
                  {FONT_SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>

                <ToolDivider />
                <ToolBtn title="Undo" onClick={() => exec("undo")}><Undo2 className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Redo" onClick={() => exec("redo")}><Redo2 className="w-3.5 h-3.5" /></ToolBtn>
                <ToolDivider />
                <ToolBtn title="Bold" onClick={() => exec("bold")}><Bold className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Italic" onClick={() => exec("italic")}><Italic className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Underline" onClick={() => exec("underline")}><Underline className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>
                <ToolDivider />
                <ToolBtn title="Align left" onClick={() => exec("justifyLeft")}><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Align center" onClick={() => exec("justifyCenter")}><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Align right" onClick={() => exec("justifyRight")}><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Justify" onClick={() => exec("justifyFull")}><AlignJustify className="w-3.5 h-3.5" /></ToolBtn>
                <ToolDivider />
                <ToolBtn title="Bullet list" onClick={() => exec("insertUnorderedList")}><List className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Outdent" onClick={() => exec("outdent")}><Outdent className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Indent" onClick={() => exec("indent")}><Indent className="w-3.5 h-3.5" /></ToolBtn>
                <ToolDivider />
                <ToolBtn title="Insert link" onClick={() => { const url = prompt("URL"); if (url) exec("createLink", url); }}><Link2 className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn title="Emoji" onClick={() => exec("insertText", "😊")}><Smile className="w-3.5 h-3.5" /></ToolBtn>
              </div>

              {/* Editable body */}
              <div
                ref={bodyRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateWordCount}
                className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-800 focus:outline-none min-h-0"
                style={{ fontFamily, fontSize }}
              />

              {/* Word count */}
              <div className="flex items-center justify-end px-5 py-2 border-t border-gray-100 text-xs text-gray-400">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </div>
            </div>
          </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200">
          {sent ? (
            <span className="text-sm text-green-600 font-medium flex items-center gap-2">
              <Send className="w-4 h-4" /> Sent!
            </span>
          ) : (
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">{children}</div>
    </div>
  );
}

function ToolBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
    >
      {children}
    </button>
  );
}

function ToolDivider() {
  return <div className="w-px h-4 bg-gray-200 mx-1" />;
}
