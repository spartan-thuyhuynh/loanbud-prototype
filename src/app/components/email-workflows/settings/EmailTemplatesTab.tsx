import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminEmailTemplate, EmailTemplateCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const EMAIL_CATEGORIES: EmailTemplateCategory[] = ["Initial Outreach", "Follow-up", "Nurture", "Re-engagement", "Custom"];

const emptyForm = {
  name: "",
  subject: "",
  body: "",
  category: "Initial Outreach" as EmailTemplateCategory,
  senderType: "brand" as "brand" | "loan-officer",
};

function extractVariables(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

export function EmailTemplatesTab() {
  const { adminEmailTemplates, handleCreateAdminEmailTemplate, handleUpdateAdminEmailTemplate, handleDeleteAdminEmailTemplate } = useAppData();

  const [selected, setSelected] = useState<AdminEmailTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selectTemplate = (t: AdminEmailTemplate) => {
    setSelected(t);
    setForm({ name: t.name, subject: t.subject, body: t.body, category: t.category, senderType: t.senderType });
    setIsNew(false);
    setConfirmDeleteId(null);
  };

  const startNew = () => {
    setSelected(null);
    setForm(emptyForm);
    setIsNew(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error("Name, subject, and body are required.");
      return;
    }
    if (isNew) {
      handleCreateAdminEmailTemplate(form);
      toast.success("Email template created.");
      setIsNew(false);
    } else if (selected) {
      handleUpdateAdminEmailTemplate(selected.id, form);
      toast.success("Email template updated.");
    }
  };

  const handleDelete = (id: string) => {
    handleDeleteAdminEmailTemplate(id);
    if (selected?.id === id) { setSelected(null); setIsNew(false); }
    setConfirmDeleteId(null);
    toast.success("Email template deleted.");
  };

  // Group by category for sidebar display
  const byCategory = EMAIL_CATEGORIES.reduce<Record<string, AdminEmailTemplate[]>>((acc, cat) => {
    acc[cat] = adminEmailTemplates.filter((t) => t.category === cat);
    return acc;
  }, {});

  const variables = extractVariables(`${form.subject} ${form.body}`);

  return (
    <div className="flex h-full min-h-0">
      {/* Left panel */}
      <div className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <Button size="sm" className="w-full" onClick={startNew}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />New Template
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {EMAIL_CATEGORIES.map((cat) =>
            byCategory[cat].length > 0 ? (
              <div key={cat}>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/50">
                  {cat}
                </div>
                {byCategory[cat].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className={`w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted/40 transition-colors ${selected?.id === t.id && !isNew ? "bg-muted" : ""}`}
                  >
                    <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{t.senderType.replace("-", " ")}</p>
                  </button>
                ))}
              </div>
            ) : null,
          )}
          {adminEmailTemplates.length === 0 && !isNew && (
            <p className="px-3 py-4 text-xs text-muted-foreground">No templates yet.</p>
          )}
        </div>
      </div>

      {/* Right panel */}
      {(selected || isNew) ? (
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{isNew ? "New Email Template" : "Edit Email Template"}</h2>
            {!isNew && selected && (
              confirmDeleteId === selected.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive">Delete?</span>
                  <Button variant="destructive" size="sm" className="h-7 text-xs px-2" onClick={() => handleDelete(selected.id)}>Yes</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setConfirmDeleteId(null)}>No</Button>
                </div>
              ) : (
                <button onClick={() => setConfirmDeleteId(selected.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Template Name</Label>
            <Input value={form.name} placeholder="e.g. New Listing Claim" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as EmailTemplateCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMAIL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Sender Type</Label>
              <Select value={form.senderType} onValueChange={(v) => setForm((f) => ({ ...f, senderType: v as "brand" | "loan-officer" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="loan-officer">Loan Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subject Line</Label>
            <Input value={form.subject} placeholder="e.g. Claim Your Listing - Fast Approval Available" onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea
              value={form.body}
              placeholder={"Hi {{first_name}},\n\n..."}
              rows={8}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
          </div>

          {variables.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Detected variables:</p>
              <div className="flex flex-wrap gap-1.5">
                {variables.map((v) => (
                  <Badge key={v} variant="secondary" className="text-xs font-mono">{`{{${v}}}`}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleSave}>{isNew ? "Create Template" : "Save Changes"}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setSelected(null); setIsNew(false); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Select a template or create a new one.
        </div>
      )}
    </div>
  );
}
