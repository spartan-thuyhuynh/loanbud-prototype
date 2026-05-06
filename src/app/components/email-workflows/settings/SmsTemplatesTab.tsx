import { useState } from "react";
import { MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SmsTemplate, SmsTemplateCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const SMS_CATEGORIES: SmsTemplateCategory[] = ["Follow-up", "Reminder", "Appointment", "Alert", "Custom"];

const CATEGORY_COLORS: Record<SmsTemplateCategory, string> = {
  "Follow-up":   "bg-amber-50 text-amber-700 border-amber-100",
  "Reminder":    "bg-blue-50 text-blue-700 border-blue-100",
  "Appointment": "bg-green-50 text-green-700 border-green-100",
  "Alert":       "bg-red-50 text-red-700 border-red-100",
  "Custom":      "bg-gray-100 text-gray-600 border-gray-200",
};

const emptyForm = { name: "", message: "", category: "Follow-up" as SmsTemplateCategory };

type FormState = typeof emptyForm;

function extractVariables(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

function smsSegments(text: string) {
  return Math.ceil(text.length / 160) || 1;
}

// ── Shared form ────────────────────────────────────────────────────────────

interface SmsFormProps {
  form: FormState;
  onChange: (updates: Partial<FormState>) => void;
}

function SmsForm({ form, onChange }: SmsFormProps) {
  const variables = extractVariables(form.message);
  const segments = smsSegments(form.message);

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <FieldLabel>Template Name</FieldLabel>
        <Input value={form.name} placeholder="e.g. Quick Follow-up" onChange={(e) => onChange({ name: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Category</FieldLabel>
        <Select value={form.category} onValueChange={(v) => onChange({ category: v as SmsTemplateCategory })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {SMS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <FieldLabel>Message</FieldLabel>
          <span className="text-xs text-muted-foreground">{form.message.length} chars · {segments} segment{segments > 1 ? "s" : ""}</span>
        </div>
        <Textarea
          value={form.message}
          placeholder="Hi {{first_name}}, ..."
          rows={5}
          className="resize-none text-sm leading-relaxed"
          onChange={(e) => onChange({ message: e.target.value })}
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

// ── Main tab ────────────────────────────────────────────────────────────────

export function SmsTemplatesTab() {
  const { smsTemplates, handleCreateSmsTemplate, handleUpdateSmsTemplate, handleDeleteSmsTemplate } = useAppData();

  const [selected, setSelected] = useState<SmsTemplate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New modal
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editConfirmSave, setEditConfirmSave] = useState(false);

  const selectTemplate = (t: SmsTemplate) => {
    setSelected(t);
    setConfirmDeleteId(null);
  };

  const openNew = () => {
    setNewForm(emptyForm);
    setNewOpen(true);
  };

  const handleCreate = () => {
    if (!newForm.name.trim() || !newForm.message.trim()) {
      toast.error("Name and message are required.");
      return;
    }
    handleCreateSmsTemplate(newForm);
    toast.success("SMS template created.");
    setNewOpen(false);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditForm({ name: selected.name, message: selected.message, category: selected.category });
    setEditConfirmSave(false);
    setEditOpen(true);
  };

  const handleEditRequestSave = () => {
    if (!editForm.name.trim() || !editForm.message.trim()) {
      toast.error("Name and message are required.");
      return;
    }
    setEditConfirmSave(true);
  };

  const handleEditConfirmSave = () => {
    if (selected) {
      handleUpdateSmsTemplate(selected.id, editForm);
      setSelected({ ...selected, ...editForm });
      toast.success("SMS template updated.");
    }
    setEditOpen(false);
    setEditConfirmSave(false);
  };

  const handleDelete = (id: string) => {
    handleDeleteSmsTemplate(id);
    if (selected?.id === id) setSelected(null);
    setConfirmDeleteId(null);
    toast.success("SMS template deleted.");
  };

  const viewVariables = extractVariables(selected?.message ?? "");
  const viewSegments = smsSegments(selected?.message ?? "");

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
            {smsTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <MessageSquare className="w-7 h-7 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No templates yet.</p>
              </div>
            )}
            {smsTemplates.map((t) => {
              const isActive = selected?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className={`w-full text-left px-3 py-2.5 border-b border-border/40 last:border-b-0 transition-colors ${isActive ? "bg-background shadow-sm" : "hover:bg-background/60"}`}
                >
                  <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>{t.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>{t.category}</span>
                    <span className="text-[10px] text-muted-foreground">{t.characterCount} chars</span>
                  </div>
                </button>
              );
            })}
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
                  {selected.category} · {selected.characterCount} chars
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
              {/* Message box */}
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <SectionHeading label="Message" />
                  <span className="text-xs text-muted-foreground">{selected.characterCount} chars · {viewSegments} segment{viewSegments > 1 ? "s" : ""}</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
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
                <div className="px-4 py-3">
                  <FieldLabel>Category</FieldLabel>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${CATEGORY_COLORS[selected.category]}`}>{selected.category}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground/50" />
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
            <DialogTitle>New SMS Template</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <SmsForm form={newForm} onChange={(u) => setNewForm((f) => ({ ...f, ...u }))} />
          </div>
          <div className="shrink-0 px-6 py-4 border-t border-border bg-background flex gap-2">
            <Button onClick={handleCreate}>Create Template</Button>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditConfirmSave(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>Edit SMS Template</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <SmsForm form={editForm} onChange={(u) => setEditForm((f) => ({ ...f, ...u }))} />
          </div>
          <div className="shrink-0 border-t border-border bg-background">
            {editConfirmSave ? (
              <div className="px-6 py-4 flex items-center justify-between gap-3 bg-amber-50">
                <div>
                  <p className="text-sm font-medium text-amber-900">Save changes?</p>
                  <p className="text-xs text-amber-700 mt-0.5">This will overwrite the existing template.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={handleEditConfirmSave}>Confirm Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditConfirmSave(false)}>Go back</Button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 flex gap-2">
                <Button onClick={handleEditRequestSave}>Save Changes</Button>
                <Button variant="ghost" onClick={() => { setEditOpen(false); setEditConfirmSave(false); }}>Cancel</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionHeading({ label }: { label: string }) {
  return <h3 className="text-sm font-semibold text-foreground">{label}</h3>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{children}</p>;
}
