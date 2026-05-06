import { useState } from "react";
import { Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminEmailTemplate, EmailTemplateCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const EMAIL_CATEGORIES: EmailTemplateCategory[] = ["Initial Outreach", "Follow-up", "Nurture", "Re-engagement", "Custom"];

const CATEGORY_COLORS: Record<EmailTemplateCategory, string> = {
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

// ── Shared form ────────────────────────────────────────────────────────────

interface TemplateFormProps {
  form: FormState;
  onChange: (updates: Partial<FormState>) => void;
}

function TemplateForm({ form, onChange }: TemplateFormProps) {
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
              {EMAIL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
            {variables.map((v) => (
              <Badge key={v} variant="secondary" className="text-xs font-mono px-2 py-0.5">{`{{${v}}}`}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────────────────

interface TemplateModalProps {
  open: boolean;
  title: string;
  form: FormState;
  confirmSave: boolean;
  saveLabel: string;
  onOpenChange: (open: boolean) => void;
  onChange: (updates: Partial<FormState>) => void;
  onRequestSave: () => void;
  onConfirmSave: () => void;
  onCancelConfirm: () => void;
}

function TemplateModal({ open, title, form, confirmSave, saveLabel, onOpenChange, onChange, onRequestSave, onConfirmSave, onCancelConfirm }: TemplateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <TemplateForm form={form} onChange={onChange} />
        </div>
        <div className="shrink-0 border-t border-border bg-background">
          {confirmSave ? (
            <div className="px-6 py-4 flex items-center justify-between gap-3 bg-amber-50">
              <div>
                <p className="text-sm font-medium text-amber-900">Save changes?</p>
                <p className="text-xs text-amber-700 mt-0.5">This will overwrite the existing template.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={onConfirmSave}>Confirm Save</Button>
                <Button size="sm" variant="ghost" onClick={onCancelConfirm}>Go back</Button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 flex items-center gap-2">
              <Button onClick={onRequestSave}>{saveLabel}</Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main tab ────────────────────────────────────────────────────────────────

export function EmailTemplatesTab() {
  const { adminEmailTemplates, handleCreateAdminEmailTemplate, handleUpdateAdminEmailTemplate, handleDeleteAdminEmailTemplate } = useAppData();

  const [selected, setSelected] = useState<AdminEmailTemplate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New modal
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editConfirmSave, setEditConfirmSave] = useState(false);

  const selectTemplate = (t: AdminEmailTemplate) => {
    setSelected(t);
    setConfirmDeleteId(null);
  };

  const openNew = () => {
    setNewForm(emptyForm);
    setNewOpen(true);
  };

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

  const handleEditRequestSave = () => {
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

  const byCategory = EMAIL_CATEGORIES.reduce<Record<string, AdminEmailTemplate[]>>((acc, cat) => {
    acc[cat] = adminEmailTemplates.filter((t) => t.category === cat);
    return acc;
  }, {});

  const viewVariables = extractVariables(`${selected?.subject ?? ""} ${selected?.body ?? ""}`);

  return (
    <>
      <div className="flex h-full min-h-0">

        {/* ── Left sidebar ── */}
        <div className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/20">
          <div className="px-3 py-3 border-b border-border">
            <Button className="w-full" onClick={openNew}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Template
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {adminEmailTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Mail className="w-7 h-7 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No templates yet.</p>
              </div>
            )}
            {EMAIL_CATEGORIES.map((cat) =>
              byCategory[cat].length > 0 ? (
                <div key={cat}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border/50">
                    {cat}
                  </div>
                  {byCategory[cat].map((t) => {
                    const isActive = selected?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => selectTemplate(t)}
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
          </div>
        </div>

        {/* ── Right panel ── */}
        {selected ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-foreground">{selected.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.category} · {selected.senderType.replace("-", " ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={openEdit}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                {confirmDeleteId === selected.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-destructive font-medium">Delete?</span>
                    <Button variant="destructive" size="sm" className="h-7 text-xs px-2.5" onClick={() => handleDelete(selected.id)}>Yes</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setConfirmDeleteId(null)}>No</Button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(selected.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* View body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Subject box */}
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <SectionHeading label="Subject Line" />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-foreground">{selected.subject}</p>
                </div>
              </div>

              {/* Body box */}
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <SectionHeading label="Body" />
                </div>
                <div className="px-4 py-4 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                  {viewVariables.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border">
                      <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Variables</p>
                      <div className="flex flex-wrap gap-1.5">
                        {viewVariables.map((v) => (
                          <Badge key={v} variant="secondary" className="text-xs font-mono px-2 py-0.5">{`{{${v}}}`}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta box */}
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <SectionHeading label="Details" />
                </div>
                <div className="px-4 py-3 flex gap-6">
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${CATEGORY_COLORS[selected.category]}`}>{selected.category}</span>
                  </div>
                  <div>
                    <FieldLabel>Sender Type</FieldLabel>
                    <p className="text-sm text-foreground capitalize">{selected.senderType.replace("-", " ")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Mail className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No template selected</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pick a template from the list or create a new one.</p>
            </div>
          </div>
        )}
      </div>

      {/* New modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>New Email Template</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TemplateForm form={newForm} onChange={(u) => setNewForm((f) => ({ ...f, ...u }))} />
          </div>
          <div className="shrink-0 px-6 py-4 border-t border-border bg-background flex gap-2">
            <Button onClick={handleCreate}>Create Template</Button>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <TemplateModal
        open={editOpen}
        title="Edit Email Template"
        form={editForm}
        confirmSave={editConfirmSave}
        saveLabel="Save Changes"
        onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditConfirmSave(false); } }}
        onChange={(u) => setEditForm((f) => ({ ...f, ...u }))}
        onRequestSave={handleEditRequestSave}
        onConfirmSave={handleEditConfirmSave}
        onCancelConfirm={() => setEditConfirmSave(false)}
      />
    </>
  );
}

function SectionHeading({ label }: { label: string }) {
  return <h3 className="text-sm font-semibold text-foreground">{label}</h3>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{children}</p>;
}
