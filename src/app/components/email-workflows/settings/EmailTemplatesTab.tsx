import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import type { AdminEmailTemplate, EmailTemplateCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { CategoryManagerModal } from "./CategoryManagerModal";
import {
  DetailSection,
  FieldLabel,
  TemplateDetailHeader,
  TemplateEmptyState,
  TemplateModalShell,
  TemplateSidebarShell,
} from "./TemplateTabShared";

const EMAIL_CATEGORY_BUILTINS = ["Initial Outreach", "Follow-up", "Nurture", "Re-engagement", "Custom"];

const CATEGORY_COLORS: Record<string, string> = {
  "Initial Outreach": "bg-blue-50 text-blue-700 border-blue-100",
  "Follow-up":        "bg-amber-50 text-amber-700 border-amber-100",
  "Nurture":          "bg-green-50 text-green-700 border-green-100",
  "Re-engagement":    "bg-purple-50 text-purple-700 border-purple-100",
  "Custom":           "bg-gray-100 text-gray-600 border-gray-200",
};

const emptyForm = {
  name: "",
  subject: "",
  body: "",
  category: "Initial Outreach" as EmailTemplateCategory,
  senderType: "brand" as "brand" | "loan-officer",
};

type FormState = typeof emptyForm;

function extractVariables(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

// ── Form ──────────────────────────────────────────────────────────────────────

function TemplateForm({
  form,
  categories,
  onChange,
}: {
  form: FormState;
  categories: string[];
  onChange: (updates: Partial<FormState>) => void;
}) {
  const variables = extractVariables(`${form.subject} ${form.body}`);
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <FieldLabel>Template Name</FieldLabel>
        <Input value={form.name} placeholder="e.g. New Listing Claim" onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel>Category</FieldLabel>
          <Select value={form.category} onValueChange={(v) => onChange({ category: v as EmailTemplateCategory })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Sender Type</FieldLabel>
          <Select value={form.senderType} onValueChange={(v) => onChange({ senderType: v as "brand" | "loan-officer" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="loan-officer">Loan Officer</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
    emailCategories,
    handleAddEmailCategory,
    handleDeleteEmailCategory,
  } = useAppData();

  const [selected, setSelected] = useState<AdminEmailTemplate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editConfirmSave, setEditConfirmSave] = useState(false);

  const openNew = () => { setNewForm(emptyForm); setNewOpen(true); };

  const handleCreate = () => {
    if (!newForm.name.trim() || !newForm.subject.trim() || !newForm.body.trim()) {
      toast.error("Name, subject, and body are required.");
      return;
    }
    handleCreateAdminEmailTemplate(newForm);
    toast.success("Email template created.");
    setNewOpen(false);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditForm({ name: selected.name, subject: selected.subject, body: selected.body, category: selected.category, senderType: selected.senderType });
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
      handleUpdateAdminEmailTemplate(selected.id, editForm);
      setSelected({ ...selected, ...editForm });
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

  const byCategory = emailCategories.reduce<Record<string, AdminEmailTemplate[]>>((acc, cat) => {
    acc[cat] = adminEmailTemplates.filter((t) => t.category === cat);
    return acc;
  }, {});

  const viewVariables = extractVariables(`${selected?.subject ?? ""} ${selected?.body ?? ""}`);

  return (
    <>
      <div className="flex h-full min-h-0">
        <TemplateSidebarShell
          newLabel="New Template"
          onNew={openNew}
          onCategories={() => setCatModalOpen(true)}
          isEmpty={adminEmailTemplates.length === 0}
          emptyIcon={<Mail className="w-7 h-7 text-muted-foreground/30 mb-2" />}
          emptyText="No templates yet."
        >
          {emailCategories.map((cat) =>
            byCategory[cat]?.length > 0 ? (
              <div key={cat}>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border/50">
                  {cat}
                </div>
                {byCategory[cat].map((t) => {
                  const isActive = selected?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setSelected(t); setConfirmDeleteId(null); }}
                      className={`w-full text-left px-3 py-2.5 border-b border-border/40 last:border-b-0 transition-colors ${isActive ? "bg-background shadow-sm" : "hover:bg-background/60"}`}
                    >
                      <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{t.senderType.replace("-", " ")}</p>
                    </button>
                  );
                })}
              </div>
            ) : null,
          )}
        </TemplateSidebarShell>

        {selected ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TemplateDetailHeader
              name={selected.name}
              subtitle={`${selected.category} · ${selected.senderType.replace("-", " ")}`}
              itemId={selected.id}
              confirmDeleteId={confirmDeleteId}
              onEdit={openEdit}
              onDelete={() => handleDelete(selected.id)}
              onRequestDelete={setConfirmDeleteId}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
              <DetailSection label="Details" contentClassName="px-4 py-3">
                <div className="flex gap-6">
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${CATEGORY_COLORS[selected.category] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{selected.category}</span>
                  </div>
                  <div>
                    <FieldLabel>Sender Type</FieldLabel>
                    <p className="text-sm text-foreground capitalize">{selected.senderType.replace("-", " ")}</p>
                  </div>
                </div>
              </DetailSection>
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

      <TemplateModalShell open={newOpen} title="New Email Template" saveLabel="Create Template" onOpenChange={setNewOpen} onSave={handleCreate}>
        <TemplateForm form={newForm} categories={emailCategories} onChange={(u) => setNewForm((f) => ({ ...f, ...u }))} />
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
        <TemplateForm form={editForm} categories={emailCategories} onChange={(u) => setEditForm((f) => ({ ...f, ...u }))} />
      </TemplateModalShell>

      <CategoryManagerModal
        open={catModalOpen}
        title="Email Template Categories"
        categories={emailCategories}
        builtins={EMAIL_CATEGORY_BUILTINS}
        onOpenChange={setCatModalOpen}
        onAdd={handleAddEmailCategory}
        onDelete={handleDeleteEmailCategory}
      />
    </>
  );
}
