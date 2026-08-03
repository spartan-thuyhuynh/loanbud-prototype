import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useAppData } from "../../../contexts/AppDataContext";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import UnlayerEditor, { type UnlayerEditorHandle } from "./UnlayerEditor";
import { PlaceholdersPanel } from "./PlaceholdersPanel";
import { extractPlaceholders } from "./placeholderCatalog";
import { htmlToUnlayerDesign } from "./unlayerDesign";
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
    handleCreateAdminEmailTemplate, handleUpdateAdminEmailTemplate,
  } = useAppData();

  const existing = id ? adminEmailTemplates.find((t) => t.id === id) ?? null : null;
  const readOnly = currentUserRole === "loan_officer";

  const [name, setName] = useState(existing?.name ?? "");
  const [subject, setSubject] = useState(existing?.subject ?? "");
  const [folderId, setFolderId] = useState<string | null>(existing?.folderId ?? null);
  const [visibility, setVisibility] = useState<"public" | "admin">(
    existing?.visibleToLoanOfficers === false ? "admin" : "public"
  );
  const [isSystem, setIsSystem] = useState<boolean>(existing?.isSystem ?? false);
  const [editorReady, setEditorReady] = useState(false);
  const unlayerRef = useRef<UnlayerEditorHandle | null>(null);

  const initialDesign = existing?.design ?? htmlToUnlayerDesign(existing?.body ?? "<p></p>");

  const back = () => navigate("/email-workflows/templates");

  const save = async () => {
    if (!name.trim() || !subject.trim()) { toast.error("Name and subject are required."); return; }
    try {
      const { design, html } = await unlayerRef.current!.save();
      const variables = [...new Set([...extractPlaceholders(subject), ...extractPlaceholders(html)])];
      const payload = {
        name,
        subject,
        folderId,
        body: html,
        design,
        visibleToLoanOfficers: visibility === "public",
        isSystem,
        senderType: existing?.senderType ?? "brand" as const,
        variables,
      };
      if (existing) { handleUpdateAdminEmailTemplate(existing.id, payload); toast.success("Template updated."); }
      else { handleCreateAdminEmailTemplate(payload); toast.success("Template created."); }
      back();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save template.");
    }
  };

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
          <h1 className="text-lg font-semibold">{existing ? name || "Edit Template" : "New Template"}</h1>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={back}>Cancel</Button>
            <Button size="sm" disabled={!editorReady} onClick={() => void save()}><Save className="w-4 h-4 mr-1.5" />Save</Button>
          </div>
        )}
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          {readOnly
            ? <div className="prose prose-sm max-w-none h-full overflow-y-auto p-6" dangerouslySetInnerHTML={{ __html: existing?.body ?? "" }} />
            : <UnlayerEditor initialDesign={initialDesign} editorRef={unlayerRef} onReady={() => setEditorReady(true)} />}
        </div>
        {!readOnly && (
          <div className="w-80 shrink-0 border-l border-border overflow-y-auto p-4 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Template settings</h2>
            <div className="space-y-1.5"><FieldLabel>Name</FieldLabel><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5">
              <FieldLabel>Category</FieldLabel>
              <Select value={folderId ?? "__none__"} onValueChange={(v) => setFolderId(v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No folder (Uncategorized)</SelectItem>
                  {folderOptions.map((f) => <SelectItem key={f.id} value={f.id}>{"  ".repeat(f.depth)}{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><FieldLabel>Subject</FieldLabel><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="space-y-1.5">
              <FieldLabel>Visibility</FieldLabel>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as "public" | "admin")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="admin">Admin only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Admin only hides this template from loan officers.</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <FieldLabel>System email</FieldLabel>
                <Switch checked={isSystem} onCheckedChange={setIsSystem} />
              </div>
              <p className="text-xs text-muted-foreground">System templates can&apos;t be sent manually (hidden from Quick Email + workflow pickers).</p>
            </div>
            <PlaceholdersPanel />
          </div>
        )}
        {readOnly && (
          <div className="w-80 shrink-0 border-l border-border overflow-y-auto p-4 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Template settings</h2>
            <div className="space-y-1.5">
              <FieldLabel>Visibility</FieldLabel>
              <p className="text-sm text-foreground">{visibility === "public" ? "Public" : "Admin only"}</p>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>System email</FieldLabel>
              <p className="text-sm text-foreground">{isSystem ? "Yes" : "No"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
