import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SmsTemplate, SmsTemplateCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const SMS_CATEGORIES: SmsTemplateCategory[] = ["Follow-up", "Reminder", "Appointment", "Alert", "Custom"];

const emptyForm = { name: "", message: "", category: "Follow-up" as SmsTemplateCategory };

function extractVariables(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

export function SmsTemplatesTab() {
  const { smsTemplates, handleCreateSmsTemplate, handleUpdateSmsTemplate, handleDeleteSmsTemplate } = useAppData();

  const [selected, setSelected] = useState<SmsTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selectTemplate = (t: SmsTemplate) => {
    setSelected(t);
    setForm({ name: t.name, message: t.message, category: t.category });
    setIsNew(false);
    setConfirmDeleteId(null);
  };

  const startNew = () => {
    setSelected(null);
    setForm(emptyForm);
    setIsNew(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Name and message are required.");
      return;
    }
    if (isNew) {
      handleCreateSmsTemplate(form);
      toast.success("SMS template created.");
      setIsNew(false);
    } else if (selected) {
      handleUpdateSmsTemplate(selected.id, form);
      toast.success("SMS template updated.");
    }
  };

  const handleDelete = (id: string) => {
    handleDeleteSmsTemplate(id);
    if (selected?.id === id) { setSelected(null); setIsNew(false); }
    setConfirmDeleteId(null);
    toast.success("SMS template deleted.");
  };

  const variables = extractVariables(form.message);
  const segments = Math.ceil(form.message.length / 160) || 1;

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
          {smsTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTemplate(t)}
              className={`w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted/40 transition-colors ${selected?.id === t.id && !isNew ? "bg-muted" : ""}`}
            >
              <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.characterCount} chars · {t.category}</p>
            </button>
          ))}
          {smsTemplates.length === 0 && !isNew && (
            <p className="px-3 py-4 text-xs text-muted-foreground">No templates yet.</p>
          )}
        </div>
      </div>

      {/* Right panel */}
      {(selected || isNew) ? (
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{isNew ? "New SMS Template" : "Edit SMS Template"}</h2>
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
            <Input value={form.name} placeholder="e.g. Quick Follow-up" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as SmsTemplateCategory }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SMS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Message</Label>
              <span className="text-xs text-muted-foreground">{form.message.length} chars · {segments} segment{segments > 1 ? "s" : ""}</span>
            </div>
            <Textarea
              value={form.message}
              placeholder="Hi {{first_name}}, ..."
              rows={4}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>

          {variables.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <Badge key={v} variant="secondary" className="text-xs font-mono">{`{{${v}}}`}</Badge>
              ))}
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
