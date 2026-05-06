import { useRef, useState } from "react";
import { Mic, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { VoicemailScript, VoicemailCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { AudioPlayer } from "../../AudioPlayer";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
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

type FormState = typeof emptyForm;

function extractVariables(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60 > 0 ? ` ${seconds % 60}s` : ""}`.trim();
}

// ── Shared form fields ──────────────────────────────────────────────────────

interface RecordFormProps {
  form: FormState;
  audioFileName: string;
  onChange: (updates: Partial<FormState>) => void;
  onAudioFileName: (name: string) => void;
}

function RecordForm({ form, audioFileName, onChange, onAudioFileName }: RecordFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variables = extractVariables(form.scriptText);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onChange({ audioUrl: dataUrl });
      onAudioFileName(file.name);
      const audio = new Audio(dataUrl);
      audio.addEventListener("loadedmetadata", () => {
        const dur = Math.round(audio.duration);
        if (isFinite(dur)) onChange({ estimatedDurationSeconds: dur });
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Identity */}
      <section className="space-y-4">
        <SectionHeading label="Identity" />
        <div className="space-y-1.5">
          <FieldLabel>Record Name</FieldLabel>
          <Input
            value={form.name}
            placeholder="e.g. Initial Outreach Script"
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Category</FieldLabel>
          <Select value={form.category} onValueChange={(v) => onChange({ category: v as VoicemailCategory })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VM_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </section>

      <Divider />

      {/* Recording */}
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
                onClick={() => { onChange({ audioUrl: "" }); onAudioFileName(""); }}
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

      {/* Transcript */}
      <section className="space-y-3">
        <div>
          <SectionHeading label="Transcript" />
          <p className="text-xs text-muted-foreground mt-0.5">Word-for-word text of the recording — used as a reference during calls.</p>
        </div>
        <Textarea
          value={form.scriptText}
          placeholder="Hi {{first_name}}, this is [Agent Name] from LoanBud..."
          rows={5}
          className="resize-none text-sm leading-relaxed"
          onChange={(e) => onChange({ scriptText: e.target.value })}
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
  );
}

// ── Main tab ────────────────────────────────────────────────────────────────

export function VoicemailScriptsTab() {
  const { voicemailScripts, handleCreateVoicemailScript, handleUpdateVoicemailScript, handleDeleteVoicemailScript } = useAppData();

  // New-record modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState(emptyForm);
  const [modalAudioFileName, setModalAudioFileName] = useState("");

  // Right-panel state
  const [selected, setSelected] = useState<VoicemailScript | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editAudioFileName, setEditAudioFileName] = useState("");
  const [editConfirmSave, setEditConfirmSave] = useState(false);

  const selectScript = (s: VoicemailScript) => {
    setSelected(s);
    setConfirmDeleteId(null);
  };

  const openEditModal = () => {
    if (!selected) return;
    setEditForm({ name: selected.name, scriptText: selected.scriptText, audioUrl: selected.audioUrl, estimatedDurationSeconds: selected.estimatedDurationSeconds, category: selected.category });
    setEditAudioFileName(selected.audioUrl ? (selected.audioUrl.startsWith("data:") ? "Uploaded recording" : selected.audioUrl.split("/").pop() ?? "") : "");
    setEditConfirmSave(false);
    setEditModalOpen(true);
  };

  const handleEditRequestSave = () => {
    if (!editForm.name.trim() || !editForm.scriptText.trim()) {
      toast.error("Name and transcript are required.");
      return;
    }
    setEditConfirmSave(true);
  };

  const handleEditConfirmSave = () => {
    if (selected) {
      handleUpdateVoicemailScript(selected.id, editForm);
      setSelected({ ...selected, ...editForm });
      toast.success("Voicemail record updated.");
    }
    setEditModalOpen(false);
    setEditConfirmSave(false);
  };

  const handleDelete = (id: string) => {
    handleDeleteVoicemailScript(id);
    if (selected?.id === id) setSelected(null);
    setConfirmDeleteId(null);
    toast.success("Voicemail record deleted.");
  };

  // Modal create
  const openModal = () => {
    setModalForm(emptyForm);
    setModalAudioFileName("");
    setModalOpen(true);
  };

  const handleModalCreate = () => {
    if (!modalForm.name.trim() || !modalForm.scriptText.trim()) {
      toast.error("Name and transcript are required.");
      return;
    }
    handleCreateVoicemailScript(modalForm);
    toast.success("Voicemail record created.");
    setModalOpen(false);
  };

  const variables = extractVariables(selected?.scriptText ?? "");

  return (
    <>
      <div className="flex h-full min-h-0">

        {/* ── Left sidebar ── */}
        <div className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/20">
          <div className="px-3 py-3 border-b border-border">
            <Button className="w-full" onClick={openModal}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Record
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {voicemailScripts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Mic className="w-7 h-7 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No voicemail records yet.</p>
              </div>
            )}
            {voicemailScripts.map((s) => {
              const isActive = selected?.id === s.id;
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
        {selected ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* Panel header */}
            <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-foreground">{selected.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.category} · {formatDuration(selected.estimatedDurationSeconds)}
                  {selected.audioUrl && " · Recording attached"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={openEditModal}>
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
                  <button
                    onClick={() => setConfirmDeleteId(selected.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
            </div>
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

      {/* ── New Record Modal ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>New Voicemail Record</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <RecordForm
              form={modalForm}
              audioFileName={modalAudioFileName}
              onChange={(u) => setModalForm((f) => ({ ...f, ...u }))}
              onAudioFileName={setModalAudioFileName}
            />
          </div>
          <div className="shrink-0 px-6 py-4 border-t border-border bg-background flex items-center gap-2">
            <Button onClick={handleModalCreate}>Create Record</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Record Modal ── */}
      <Dialog open={editModalOpen} onOpenChange={(open) => { if (!open) { setEditModalOpen(false); setEditConfirmSave(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>Edit Voicemail Record</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <RecordForm
              form={editForm}
              audioFileName={editAudioFileName}
              onChange={(u) => setEditForm((f) => ({ ...f, ...u }))}
              onAudioFileName={setEditAudioFileName}
            />
          </div>
          <div className="shrink-0 border-t border-border bg-background">
            {editConfirmSave ? (
              <div className="px-6 py-4 flex items-center justify-between gap-3 bg-amber-50">
                <div>
                  <p className="text-sm font-medium text-amber-900">Save changes?</p>
                  <p className="text-xs text-amber-700 mt-0.5">This will overwrite the existing record.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={handleEditConfirmSave}>Confirm Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditConfirmSave(false)}>Go back</Button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 flex items-center gap-2">
                <Button onClick={handleEditRequestSave}>Save Changes</Button>
                <Button variant="ghost" onClick={() => { setEditModalOpen(false); setEditConfirmSave(false); }}>Cancel</Button>
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

function Divider() {
  return <hr className="border-border" />;
}
