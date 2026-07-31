import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useAppData } from "../../../contexts/AppDataContext";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import HtmlEditor, { type HtmlEditorHandle } from "./HtmlEditor";
import { PlaceholdersPanel } from "./PlaceholdersPanel";
import { extractPlaceholders } from "./placeholderCatalog";
import { FieldLabel } from "./TemplateTabShared";

export function EmailTemplateEditorPage() {
  const { id } = useParams();
  return <EmailTemplateEditorPageInner key={id ?? "new"} />;
}

function EmailTemplateEditorPageInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    adminEmailTemplates, templateFolders, currentUserRole,
    handleCreateAdminEmailTemplate, handleUpdateAdminEmailTemplate, handleDeleteAdminEmailTemplate,
  } = useAppData();

  const existing = id ? adminEmailTemplates.find((t) => t.id === id) ?? null : null;
  const readOnly = currentUserRole === "loan_officer";

  const [name, setName] = useState(existing?.name ?? "");
  const [subject, setSubject] = useState(existing?.subject ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [folderId, setFolderId] = useState<string | null>(existing?.folderId ?? null);
  const editorRef = useRef<HtmlEditorHandle | null>(null);

  const back = () => navigate("/email-workflows/templates");

  const save = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) { toast.error("Name, subject, and body are required."); return; }
    const variables = [...new Set([...extractPlaceholders(subject), ...extractPlaceholders(body)])];
    const payload = { name, subject, body, folderId, visibleToLoanOfficers: existing?.visibleToLoanOfficers ?? null, senderType: existing?.senderType ?? "brand" as const, variables };
    if (existing) { handleUpdateAdminEmailTemplate(existing.id, payload); toast.success("Template updated."); }
    else { handleCreateAdminEmailTemplate(payload); toast.success("Template created."); }
    back();
  };

  const remove = () => { if (existing) { handleDeleteAdminEmailTemplate(existing.id); toast.success("Template deleted."); back(); } };

  // Flat, depth-annotated folders for the select.
  const folderOptions: { id: string; name: string; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const f of templateFolders.filter((tf) => tf.parentId === parentId)) { folderOptions.push({ id: f.id, name: f.name, depth }); walk(f.id, depth + 1); }
  };
  walk(null, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={back}><ArrowLeft className="w-4 h-4 mr-1.5" />Back</Button>
          <h1 className="text-lg font-semibold">{existing ? "Edit Template" : "New Template"}</h1>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {existing && <Button variant="outline" size="sm" onClick={remove}><Trash2 className="w-4 h-4 mr-1.5" />Delete</Button>}
            <Button size="sm" onClick={save}><Save className="w-4 h-4 mr-1.5" />Save</Button>
          </div>
        )}
      </div>
      <div className="flex flex-1 min-h-0 gap-4 p-6 overflow-y-auto">
        <div className="flex-1 space-y-4 min-w-0">
          <div className="space-y-1.5"><FieldLabel>Template Name</FieldLabel><Input value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5">
            <FieldLabel>Category (Folder)</FieldLabel>
            <Select value={folderId ?? "__none__"} onValueChange={(v) => setFolderId(v === "__none__" ? null : v)} disabled={readOnly}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No folder (Uncategorized)</SelectItem>
                {folderOptions.map((f) => <SelectItem key={f.id} value={f.id}>{"  ".repeat(f.depth)}{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><FieldLabel>Subject Line</FieldLabel><Input value={subject} disabled={readOnly} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="space-y-1.5">
            <FieldLabel>Body</FieldLabel>
            {readOnly
              ? <div className="prose prose-sm max-w-none rounded-xl border border-border bg-card p-4" dangerouslySetInnerHTML={{ __html: body }} />
              : <HtmlEditor value={body} onChange={setBody} editorRef={editorRef} />}
          </div>
        </div>
        {!readOnly && (
          <div className="w-72 shrink-0">
            <PlaceholdersPanel onInsert={(token) => editorRef.current?.insertText(token)} />
          </div>
        )}
      </div>
    </div>
  );
}
