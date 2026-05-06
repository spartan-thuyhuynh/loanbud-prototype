import { useRef, useState } from "react";
import { Mic, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { VoicemailScript, VoicemailCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { AudioPlayer } from "../../AudioPlayer";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

const VM_CATEGORIES: VoicemailCategory[] = ["Initial Outreach", "Follow-up", "Re-engagement", "Custom"];

const CATEGORY_COLORS: Record<VoicemailCategory, string> = {
  "Initial Outreach": "bg-blue-50 text-blue-700 border-blue-100",
  "Follow-up":        "bg-amber-50 text-amber-700 border-amber-100",
  "Re-engagement":    "bg-purple-50 text-purple-700 border-purple-100",
  "Custom":           "bg-gray-100 text-gray-600 border-gray-200",
};

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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60 > 0 ? ` ${seconds % 60}s` : ""}`.trim();
}

export function VoicemailScriptsTab() {
  const { voicemailScripts, handleCreateVoicemailScript, handleUpdateVoicemailScript, handleDeleteVoicemailScript } = useAppData();

  const [selected, setSelected] = useState<VoicemailScript | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [audioFileName, setAudioFileName] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectScript = (s: VoicemailScript) => {
    setSelected(s);
    setForm({ name: s.name, scriptText: s.scriptText, audioUrl: s.audioUrl, estimatedDurationSeconds: s.estimatedDurationSeconds, category: s.category });
    setAudioFileName(s.audioUrl ? (s.audioUrl.startsWith("data:") ? "Uploaded recording" : s.audioUrl.split("/").pop() ?? "") : "");
    setIsNew(false);
    setIsEditing(false);
    setConfirmSave(false);
    setConfirmDeleteId(null);
  };

  const startNew = () => {
    setSelected(null);
    setForm(emptyForm);
    setAudioFileName("");
    setIsNew(true);
    setIsEditing(true);
    setConfirmSave(false);
    setConfirmDeleteId(null);
  };

  const startEditing = () => {
    // Reset form to current saved values before editing
    if (selected) {
      setForm({ name: selected.name, scriptText: selected.scriptText, audioUrl: selected.audioUrl, estimatedDurationSeconds: selected.estimatedDurationSeconds, category: selected.category });
      setAudioFileName(selected.audioUrl ? (selected.audioUrl.startsWith("data:") ? "Uploaded recording" : selected.audioUrl.split("/").pop() ?? "") : "");
    }
    setIsEditing(true);
    setConfirmSave(false);
  };

  const cancelEditing = () => {
    if (isNew) {
      setSelected(null);
      setIsNew(false);
    } else if (selected) {
      // Restore form to saved values
      setForm({ name: selected.name, scriptText: selected.scriptText, audioUrl: selected.audioUrl, estimatedDurationSeconds: selected.estimatedDurationSeconds, category: selected.category });
      setAudioFileName(selected.audioUrl ? (selected.audioUrl.startsWith("data:") ? "Uploaded recording" : selected.audioUrl.split("/").pop() ?? "") : "");
    }
    setIsEditing(false);
    setConfirmSave(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((f) => ({ ...f, audioUrl: dataUrl }));
      setAudioFileName(file.name);
      const audio = new Audio(dataUrl);
      audio.addEventListener("loadedmetadata", () => {
        const dur = Math.round(audio.duration);
        setForm((f) => ({ ...f, estimatedDurationSeconds: isFinite(dur) ? dur : f.estimatedDurationSeconds }));
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveAudio = () => {
    setForm((f) => ({ ...f, audioUrl: "" }));
    setAudioFileName("");
  };

  const handleRequestSave = () => {
    if (!form.name.trim() || !form.scriptText.trim()) {
      toast.error("Name and transcript are required.");
      return;
    }
    setConfirmSave(true);
  };

  const handleConfirmSave = () => {
    if (isNew) {
      handleCreateVoicemailScript(form);
      toast.success("Voicemail record created.");
      setIsNew(false);
      setIsEditing(false);
    } else if (selected) {
      handleUpdateVoicemailScript(selected.id, form);
      // Update local selected so view mode reflects new values immediately
      setSelected({ ...selected, ...form });
      toast.success("Voicemail record updated.");
      setIsEditing(false);
    }
    setConfirmSave(false);
  };

  const handleDelete = (id: string) => {
    handleDeleteVoicemailScript(id);
    if (selected?.id === id) { setSelected(null); setIsNew(false); setIsEditing(false); }
    setConfirmDeleteId(null);
    toast.success("Voicemail record deleted.");
  };

  const variables = extractVariables(isEditing ? form.scriptText : (selected?.scriptText ?? ""));

  return (
    <div className="flex h-full min-h-0">

      {/* ── Left sidebar ── */}
      <div className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/20">
        <div className="px-3 py-3 border-b border-border">
          <button
            onClick={startNew}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Record
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {voicemailScripts.length === 0 && !isNew && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Mic className="w-7 h-7 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No voicemail records yet.</p>
            </div>
          )}
          {voicemailScripts.map((s) => {
            const isActive = selected?.id === s.id && !isNew;
            return (
              <button
                key={s.id}
                onClick={() => selectScript(s)}
                className={`w-full text-left px-3 py-2.5 transition-colors border-b border-border/40 last:border-b-0 ${
                  isActive ? "bg-background shadow-sm" : "hover:bg-background/60"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <p className={`text-sm font-medium truncate flex-1 ${isActive ? "text-primary" : "text-foreground"}`}>
                    {s.name}
                  </p>
                  {s.audioUrl && (
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" title="Has recording" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[s.category]}`}>
                    {s.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{formatDuration(s.estimatedDurationSeconds)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel ── */}
      {(selected || isNew) ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Panel header — hidden in edit mode */}
          <div className={`px-6 py-4 border-b border-border bg-background flex items-center justify-between shrink-0 ${isEditing ? "hidden" : ""}`}>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {isNew ? "New Voicemail Record" : (selected?.name ?? "")}
              </h2>
              {!isNew && selected && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.category} · {formatDuration(selected.estimatedDurationSeconds)}
                  {selected.audioUrl && " · Recording attached"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Edit button — only in view mode for existing records */}
              {!isNew && !isEditing && selected && (
                <Button size="sm" variant="outline" onClick={startEditing}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              )}

              {/* Delete — only in view mode */}
              {!isNew && !isEditing && selected && (
                confirmDeleteId === selected.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-destructive font-medium">Delete?</span>
                    <Button variant="destructive" size="sm" className="h-7 text-xs px-2.5" onClick={() => handleDelete(selected.id)}>Yes</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setConfirmDeleteId(null)}>No</Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(selected.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Body */}
          {isEditing ? (
            /* ── Edit mode ── */
            <>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                <section className="space-y-4">
                  <SectionHeading label="Identity" />
                  <div className="space-y-1.5">
                    <FieldLabel>Record Name</FieldLabel>
                    <Input
                      value={form.name}
                      placeholder="e.g. Initial Outreach Script"
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <FieldLabel>Category</FieldLabel>
                      <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as VoicemailCategory }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {VM_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>Duration (seconds)</FieldLabel>
                      <Input
                        type="number"
                        min={5}
                        max={300}
                        value={form.estimatedDurationSeconds}
                        onChange={(e) => setForm((f) => ({ ...f, estimatedDurationSeconds: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </section>

                <Divider />

                <section className="space-y-3">
                  <SectionHeading label="Recording" />
                  {form.audioUrl ? (
                    <div className="border border-border rounded-xl bg-muted/20 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Mic className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-xs font-medium text-foreground truncate">{audioFileName || "Recording"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAudio}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2"
                          aria-label="Remove recording"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="px-4 py-3">
                        <AudioPlayer src={form.audioUrl} />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Upload Recording</p>
                        <p className="text-xs text-muted-foreground mt-0.5">.mp3, .wav, .m4a</p>
                      </div>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                </section>

                <Divider />

                <section className="space-y-3">
                  <div>
                    <SectionHeading label="Transcript" />
                    <p className="text-xs text-muted-foreground mt-0.5">Word-for-word text of the recording — used as a reference during calls.</p>
                  </div>
                  <Textarea
                    value={form.scriptText}
                    placeholder="Hi {{first_name}}, this is [Agent Name] from LoanBud..."
                    rows={6}
                    className="resize-none text-sm leading-relaxed"
                    onChange={(e) => setForm((f) => ({ ...f, scriptText: e.target.value }))}
                  />
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
                </section>
              </div>

              {/* Edit footer — save confirm or normal actions */}
              <div className="shrink-0 border-t border-border bg-background">
                {confirmSave ? (
                  <div className="px-6 py-4 flex items-center justify-between gap-3 bg-amber-50 border-t border-amber-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-amber-900">Save changes?</p>
                      <p className="text-xs text-amber-700 mt-0.5">This will overwrite the existing record.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" onClick={handleConfirmSave}>{isNew ? "Create" : "Confirm Save"}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmSave(false)}>Go back</Button>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-4 flex items-center gap-2">
                    <Button onClick={handleRequestSave}>{isNew ? "Create Record" : "Save Changes"}</Button>
                    <Button variant="ghost" onClick={cancelEditing}>Cancel</Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── View mode ── */
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {selected && (
                <>
                  {/* Recording box */}
                  <div className="rounded-xl border border-border bg-background overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <SectionHeading label="Recording" />
                    </div>
                    <div className="p-4">
                      {selected.audioUrl ? (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/20">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Mic className="w-3 h-3 text-primary" />
                            </div>
                            <p className="text-xs font-medium text-foreground truncate">
                              {selected.audioUrl.startsWith("data:") ? "Uploaded recording" : selected.audioUrl.split("/").pop()}
                            </p>
                          </div>
                          <div className="px-4 py-3">
                            <AudioPlayer src={selected.audioUrl} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-4 px-4 rounded-lg border border-dashed border-border text-muted-foreground">
                          <Mic className="w-4 h-4 opacity-40" />
                          <p className="text-sm">No recording attached.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transcript box */}
                  <div className="rounded-xl border border-border bg-background overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <SectionHeading label="Transcript" />
                      <p className="text-xs text-muted-foreground mt-0.5">Word-for-word text of the recording.</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.scriptText}</p>
                      {variables.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-border">
                          <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground pt-2">Variables</p>
                          <div className="flex flex-wrap gap-1.5">
                            {variables.map((v) => (
                              <Badge key={v} variant="secondary" className="text-xs font-mono px-2 py-0.5">{`{{${v}}}`}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Mic className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No record selected</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pick a record from the list or create a new one.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return <h3 className="text-sm font-semibold text-foreground">{label}</h3>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{children}</p>;
}


function Divider() {
  return <hr className="border-border" />;
}
