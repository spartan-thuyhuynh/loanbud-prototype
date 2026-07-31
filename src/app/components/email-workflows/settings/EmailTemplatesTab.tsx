import { useEffect, useState } from "react";
import { EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";
import type { AdminEmailTemplate } from "../../../types";
import type { TeamRole } from "../../../config/team";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { EmailTemplateFolderTree } from "./EmailTemplateFolderTree";
import { canRoleSeeFolder, canRoleSeeTemplate, resolveTemplateVisibleToLO } from "./templateVisibility";
import {
  DetailSection,
  FieldLabel,
  TemplateDetailHeader,
  TemplateEmptyState,
  TemplateModalShell,
  TemplateSidebarShell,
} from "./TemplateTabShared";

type VisibilityOverride = "inherit" | "show" | "hide";

const emptyForm = {
  name: "",
  subject: "",
  body: "",
  folderId: null as string | null,
  visibility: "inherit" as VisibilityOverride,
  senderType: "brand" as "brand" | "loan-officer",
};

type FormState = typeof emptyForm;

function extractVariables(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

function visibilityFromTemplate(visibleToLoanOfficers: boolean | null): VisibilityOverride {
  if (visibleToLoanOfficers === null) return "inherit";
  return visibleToLoanOfficers ? "show" : "hide";
}

function visibilityToValue(visibility: VisibilityOverride): boolean | null {
  if (visibility === "inherit") return null;
  return visibility === "show";
}

// ── Form ──────────────────────────────────────────────────────────────────────

function TemplateForm({
  form,
  folders,
  onChange,
}: {
  form: FormState;
  folders: { id: string; name: string; depth: number }[];
  onChange: (updates: Partial<FormState>) => void;
}) {
  const variables = extractVariables(`${form.subject} ${form.body}`);
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <FieldLabel>Template Name</FieldLabel>
        <Input value={form.name} placeholder="e.g. New Listing Claim" onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Folder</FieldLabel>
        <Select value={form.folderId ?? "__none__"} onValueChange={(v) => onChange({ folderId: v === "__none__" ? null : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No folder (Uncategorized)</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f.id} value={f.id}>{"  ".repeat(f.depth)}{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Visible to Loan Officers</FieldLabel>
        <Select value={form.visibility} onValueChange={(v) => onChange({ visibility: v as VisibilityOverride })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="inherit">Inherit from folder</SelectItem>
            <SelectItem value="show">Show to loan officers</SelectItem>
            <SelectItem value="hide">Hide from loan officers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Subject Line</FieldLabel>
        <Input value={form.subject} placeholder="e.g. Claim Your Listing — Fast Approval Available" onChange={(e) => onChange({ subject: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Body</FieldLabel>
        <Textarea
          value={form.body}
          placeholder={"Hi {{first_name}},\n\n..."}
          rows={8}
          className="resize-none text-sm leading-relaxed"
          onChange={(e) => onChange({ body: e.target.value })}
        />
      </div>
      {variables.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Detected variables</p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => <Badge key={v} variant="secondary" className="text-xs font-mono px-2 py-0.5">{`{{${v}}}`}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

export function EmailTemplatesTab() {
  const {
    adminEmailTemplates,
    handleCreateAdminEmailTemplate,
    handleUpdateAdminEmailTemplate,
    handleDeleteAdminEmailTemplate,
    templateFolders,
    currentUserRole,
    handleSetCurrentUserRole,
    handleCreateFolder,
    handleRenameFolder,
    handleMoveFolder,
    handleSetFolderVisibility,
    handleDeleteFolder,
    handleMoveTemplateToFolder,
  } = useAppData();

  const isAdmin = currentUserRole !== "loan_officer";

  const [selected, setSelected] = useState<AdminEmailTemplate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editConfirmSave, setEditConfirmSave] = useState(false);

  useEffect(() => {
    if (selected && !canRoleSeeTemplate(selected, templateFolders, currentUserRole)) {
      setSelected(null);
    }
  }, [currentUserRole, selected, templateFolders]);

  const openNew = () => { setNewForm(emptyForm); setNewOpen(true); };

  const handleCreate = () => {
    if (!newForm.name.trim() || !newForm.subject.trim() || !newForm.body.trim()) {
      toast.error("Name, subject, and body are required.");
      return;
    }
    handleCreateAdminEmailTemplate({
      name: newForm.name,
      subject: newForm.subject,
      body: newForm.body,
      folderId: newForm.folderId,
      visibleToLoanOfficers: visibilityToValue(newForm.visibility),
      senderType: newForm.senderType,
      variables: extractVariables(`${newForm.subject} ${newForm.body}`),
    });
    toast.success("Email template created.");
    setNewOpen(false);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditForm({
      name: selected.name,
      subject: selected.subject,
      body: selected.body,
      folderId: selected.folderId,
      visibility: visibilityFromTemplate(selected.visibleToLoanOfficers),
      senderType: selected.senderType,
    });
    setEditConfirmSave(false);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editForm.name.trim() || !editForm.subject.trim() || !editForm.body.trim()) {
      toast.error("Name, subject, and body are required.");
      return;
    }
    setEditConfirmSave(true);
  };

  const handleEditConfirmSave = () => {
    if (selected) {
      const updates = {
        name: editForm.name,
        subject: editForm.subject,
        body: editForm.body,
        folderId: editForm.folderId,
        visibleToLoanOfficers: visibilityToValue(editForm.visibility),
        senderType: editForm.senderType,
        variables: extractVariables(`${editForm.subject} ${editForm.body}`),
      };
      handleUpdateAdminEmailTemplate(selected.id, updates);
      setSelected({ ...selected, ...updates });
      toast.success("Email template updated.");
    }
    setEditOpen(false);
    setEditConfirmSave(false);
  };

  const handleDelete = (id: string) => {
    handleDeleteAdminEmailTemplate(id);
    if (selected?.id === id) setSelected(null);
    setConfirmDeleteId(null);
    toast.success("Email template deleted.");
  };

  // ── Role-filtered folder tree ──────────────────────────────────────────────

  const visibleFolders = templateFolders.filter((f) => canRoleSeeFolder(f, templateFolders, currentUserRole));
  const visibleTemplates = adminEmailTemplates.filter((t) => canRoleSeeTemplate(t, templateFolders, currentUserRole));

  // Flat, depth-annotated list of ALL folders (unfiltered) for the form's folder select.
  const allFoldersWithDepth = (() => {
    const out: { id: string; name: string; depth: number }[] = [];
    const walk = (parentId: string | null, depth: number) => {
      for (const f of templateFolders.filter((tf) => tf.parentId === parentId)) {
        out.push({ id: f.id, name: f.name, depth });
        walk(f.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  })();

  const viewVariables = extractVariables(`${selected?.subject ?? ""} ${selected?.body ?? ""}`);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-border shrink-0">
          <span className="text-[11px] text-muted-foreground">View as</span>
          <Select value={currentUserRole} onValueChange={(v) => handleSetCurrentUserRole(v as TeamRole)}>
            <SelectTrigger className="h-7 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="loan_officer">Loan Officer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 min-h-0">
          <TemplateSidebarShell
            newLabel="New Template"
            onNew={openNew}
            isEmpty={visibleTemplates.length === 0 && visibleFolders.length === 0}
            emptyIcon={<Mail className="w-7 h-7 text-muted-foreground/30 mb-2" />}
            emptyText="No templates yet."
            hideActions={!isAdmin}
          >
            <EmailTemplateFolderTree
              folders={templateFolders}
              templates={adminEmailTemplates}
              currentUserRole={currentUserRole}
              selectedId={selected?.id ?? null}
              onSelectTemplate={(t) => { setSelected(t); setConfirmDeleteId(null); }}
              onMoveTemplate={handleMoveTemplateToFolder}
              onMoveFolder={handleMoveFolder}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onSetFolderVisibility={handleSetFolderVisibility}
            />
          </TemplateSidebarShell>

          {selected ? (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="rounded-xl border border-border bg-card">
                <TemplateDetailHeader
                  name={selected.name}
                  subtitle={
                    !resolveTemplateVisibleToLO(selected, templateFolders) && isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border">
                        <EyeOff className="w-3 h-3" /> Hidden from loan officers
                      </span>
                    ) : null
                  }
                  itemId={selected.id}
                  confirmDeleteId={confirmDeleteId}
                  onEdit={openEdit}
                  onDelete={() => handleDelete(selected.id)}
                  onRequestDelete={setConfirmDeleteId}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  readOnly={!isAdmin}
                />
              </div>
              <div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <DetailSection label="Subject Line" contentClassName="px-4 py-3">
                    <p className="text-sm text-foreground">{selected.subject}</p>
                  </DetailSection>
                  <DetailSection label="Body">
                    <div className="space-y-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                      {viewVariables.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border">
                          <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Variables</p>
                          <div className="flex flex-wrap gap-1.5">
                            {viewVariables.map((v) => <Badge key={v} variant="secondary" className="text-xs font-mono px-2 py-0.5">{`{{${v}}}`}</Badge>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </DetailSection>
                </div>
              </div>
            </div>
          ) : (
            <TemplateEmptyState
              icon={<Mail className="w-5 h-5 text-muted-foreground/50" />}
              label="No template selected"
              hint="Pick a template from the list or create a new one."
            />
          )}
        </div>
      </div>

      <TemplateModalShell open={newOpen} title="New Email Template" saveLabel="Create Template" onOpenChange={setNewOpen} onSave={handleCreate}>
        <TemplateForm form={newForm} folders={allFoldersWithDepth} onChange={(u) => setNewForm((f) => ({ ...f, ...u }))} />
      </TemplateModalShell>

      <TemplateModalShell
        open={editOpen}
        title="Edit Email Template"
        saveLabel="Save Changes"
        confirmSave={editConfirmSave}
        itemLabel="template"
        onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditConfirmSave(false); } }}
        onSave={handleEditSave}
        onConfirmSave={handleEditConfirmSave}
        onCancelConfirm={() => setEditConfirmSave(false)}
      >
        <TemplateForm form={editForm} folders={allFoldersWithDepth} onChange={(u) => setEditForm((f) => ({ ...f, ...u }))} />
      </TemplateModalShell>
    </>
  );
}
