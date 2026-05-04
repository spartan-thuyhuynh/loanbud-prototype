import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { VoicemailScript, VoicemailCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const VM_CATEGORIES: VoicemailCategory[] = ["Initial Outreach", "Follow-up", "Re-engagement", "Custom"];

const emptyForm = {
  name: "",
  scriptText: "",
  audioUrl: "",
  estimatedDurationSeconds: 20,
  category: "Initial Outreach" as VoicemailCategory,
};

function extractVariables(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

export function VoicemailScriptsTab() {
  const { voicemailScripts, handleCreateVoicemailScript, handleUpdateVoicemailScript, handleDeleteVoicemailScript } = useAppData();

  const [selected, setSelected] = useState<VoicemailScript | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selectScript = (s: VoicemailScript) => {
    setSelected(s);
    setForm({ name: s.name, scriptText: s.scriptText, audioUrl: s.audioUrl, estimatedDurationSeconds: s.estimatedDurationSeconds, category: s.category });
    setIsNew(false);
    setConfirmDeleteId(null);
  };

  const startNew = () => {
    setSelected(null);
    setForm(emptyForm);
    setIsNew(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.scriptText.trim()) {
      toast.error("Name and script text are required.");
      return;
    }
    if (isNew) {
      handleCreateVoicemailScript(form);
      toast.success("Voicemail script created.");
      setIsNew(false);
    } else if (selected) {
      handleUpdateVoicemailScript(selected.id, form);
      toast.success("Voicemail script updated.");
    }
  };

  const handleDelete = (id: string) => {
    handleDeleteVoicemailScript(id);
    if (selected?.id === id) { setSelected(null); setIsNew(false); }
    setConfirmDeleteId(null);
    toast.success("Voicemail script deleted.");
  };

  const variables = extractVariables(form.scriptText);

  return (
    <div className="flex h-full min-h-0">
      {/* Left panel */}
      <div className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <Button size="sm" className="w-full" onClick={startNew}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />New Script
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {voicemailScripts.map((s) => (
            <button
              key={s.id}
              onClick={() => selectScript(s)}
              className={`w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted/40 transition-colors ${selected?.id === s.id && !isNew ? "bg-muted" : ""}`}
            >
              <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.estimatedDurationSeconds}s · {s.category}</p>
            </button>
          ))}
          {voicemailScripts.length === 0 && !isNew && (
            <p className="px-3 py-4 text-xs text-muted-foreground">No scripts yet.</p>
          )}
        </div>
      </div>

      {/* Right panel */}
      {(selected || isNew) ? (
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{isNew ? "New Voicemail Script" : "Edit Voicemail Script"}</h2>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Script Name</Label>
              <Input value={form.name} placeholder="e.g. Initial Outreach Script" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as VoicemailCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VM_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Estimated Duration (seconds)</Label>
              <Input
                type="number"
                min={5}
                max={120}
                value={form.estimatedDurationSeconds}
                onChange={(e) => setForm((f) => ({ ...f, estimatedDurationSeconds: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Script Text</Label>
            <Textarea
              value={form.scriptText}
              placeholder="Hi {{first_name}}, this is [Agent Name] from LoanBud..."
              rows={5}
              onChange={(e) => setForm((f) => ({ ...f, scriptText: e.target.value }))}
            />
          </div>

          {variables.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <Badge key={v} variant="secondary" className="text-xs font-mono">{`{{${v}}}`}</Badge>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Recording URL (optional)</Label>
            <Input
              value={form.audioUrl}
              placeholder="https://..."
              onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">URL to a pre-recorded audio file for ringless voicemail drop.</p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleSave}>{isNew ? "Create Script" : "Save Changes"}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setSelected(null); setIsNew(false); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Select a script or create a new one.
        </div>
      )}
    </div>
  );
}
