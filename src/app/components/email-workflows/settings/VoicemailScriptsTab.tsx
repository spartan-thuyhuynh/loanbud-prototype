import { useRef, useState } from "react";
import { Mic, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { VoicemailScript, VoicemailCategory } from "../../../types";
import { useAppData } from "../../../contexts/AppDataContext";
import { AudioPlayer } from "../../AudioPlayer";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { CategoryManagerModal } from "./CategoryManagerModal";
import {
  DetailSection,
  FieldLabel,
  SectionHeading,
  TemplateDetailHeader,
  TemplateEmptyState,
  TemplateModalShell,
  TemplateSidebarShell,
} from "./TemplateTabShared";

const VOICEMAIL_CATEGORY_BUILTINS = ["Initial Outreach", "Follow-up", "Re-engagement", "Custom"];

const CATEGORY_COLORS: Record<string, string> = {
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

function Divider() {
  return <hr className="border-border" />;
}

// ── Form ──────────────────────────────────────────────────────────────────────

function RecordForm({
  form,
  audioFileName,
  categories,
  onChange,
  onAudioFileName,
}: {
  form: FormState;
  audioFileName: string;
  categories: string[];
  onChange: (updates: Partial<FormState>) => void;
  onAudioFileName: (name: string) => void;
}) {
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
      <section className="space-y-4">
        <SectionHeading label="Identity" />
        <div className="space-y-1.5">
          <FieldLabel>Record Name</FieldLabel>
          <Input value={form.name} placeholder="e.g. Initial Outreach Script" onChange={(e) => onChange({ name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Category</FieldLabel>
          <Select value={form.category} onValueChange={(v) => onChange({ category: v as VoicemailCategory })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
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
              {variables.map((v) => <Badge key={v} variant="secondary" className="text-xs font-mono px-2 py-0.5">{`{{${v}}}`}</Badge>)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

export function VoicemailScriptsTab() {
  const {
    voicemailScripts,
    handleCreateVoicemailScript,
    handleUpdateVoicemailScript,
    handleDeleteVoicemailScript,
    voicemailCategories,
    handleAddVoicemailCategory,
    handleDeleteVoicemailCategory,
  } = useAppData();

  const [selected, setSelected] = useState<VoicemailScript | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [newAudioFileName, setNewAudioFileName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editAudioFileName, setEditAudioFileName] = useState("");
  const [editConfirmSave, setEditConfirmSave] = useState(false);

  const openNew = () => { setNewForm(emptyForm); setNewAudioFileName(""); setNewOpen(true); };

  const handleCreate = () => {
    if (!newForm.name.trim() || !newForm.scriptText.trim()) {
      toast.error("Name and transcript are required.");
      return;
    }
    handleCreateVoicemailScript(newForm);
    toast.success("Voicemail record created.");
    setNewOpen(false);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditForm({ name: selected.name, scriptText: selected.scriptText, audioUrl: selected.audioUrl, estimatedDurationSeconds: selected.estimatedDurationSeconds, category: selected.category });
    setEditAudioFileName(selected.audioUrl ? (selected.audioUrl.startsWith("data:") ? "Uploaded recording" : selected.audioUrl.split("/").pop() ?? "") : "");
    setEditConfirmSave(false);
    setEditOpen(true);
  };

  const handleEditSave = () => {
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
    setEditOpen(false);
    setEditConfirmSave(false);
  };

  const handleDelete = (id: string) => {
    handleDeleteVoicemailScript(id);
    if (selected?.id === id) setSelected(null);
    setConfirmDeleteId(null);
    toast.success("Voicemail record deleted.");
  };

  const variables = extractVariables(selected?.scriptText ?? "");

  return (
    <>
      <div className="flex h-full min-h-0">
        <TemplateSidebarShell
          newLabel="New Record"
          onNew={openNew}
          onCategories={() => setCatModalOpen(true)}
          isEmpty={voicemailScripts.length === 0}
          emptyIcon={<Mic className="w-7 h-7 text-muted-foreground/30 mb-2" />}
          emptyText="No voicemail records yet."
        >
          {voicemailScripts.map((s) => {
            const isActive = selected?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { setSelected(s); setConfirmDeleteId(null); }}
                className={`w-full text-left px-3 py-2.5 transition-colors border-b border-border/40 last:border-b-0 ${isActive ? "bg-background shadow-sm" : "hover:bg-background/60"}`}
              >
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <p className={`text-sm font-medium truncate flex-1 ${isActive ? "text-primary" : "text-foreground"}`}>{s.name}</p>
                  {s.audioUrl && <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" title="Has recording" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[s.category] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{s.category}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDuration(s.estimatedDurationSeconds)}</span>
                </div>
              </button>
            );
          })}
        </TemplateSidebarShell>

        {selected ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TemplateDetailHeader
              name={selected.name}
              subtitle={`${selected.category} · ${formatDuration(selected.estimatedDurationSeconds)}${selected.audioUrl ? " · Recording attached" : ""}`}
              itemId={selected.id}
              confirmDeleteId={confirmDeleteId}
              onEdit={openEdit}
              onDelete={() => handleDelete(selected.id)}
              onRequestDelete={setConfirmDeleteId}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <DetailSection label="Recording" contentClassName="p-4">
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
              </DetailSection>
              <DetailSection label="Transcript" contentClassName="p-4">
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground -mt-1">Word-for-word text of the recording.</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.scriptText}</p>
                  {variables.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-border">
                      <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground pt-2">Variables</p>
                      <div className="flex flex-wrap gap-1.5">
                        {variables.map((v) => <Badge key={v} variant="secondary" className="text-xs font-mono px-2 py-0.5">{`{{${v}}}`}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>
          </div>
        ) : (
          <TemplateEmptyState
            icon={<Mic className="w-5 h-5 text-muted-foreground/50" />}
            label="No record selected"
            hint="Pick a record from the list or create a new one."
          />
        )}
      </div>

      <TemplateModalShell open={newOpen} title="New Voicemail Record" saveLabel="Create Record" onOpenChange={setNewOpen} onSave={handleCreate}>
        <RecordForm
          form={newForm}
          audioFileName={newAudioFileName}
          categories={voicemailCategories}
          onChange={(u) => setNewForm((f) => ({ ...f, ...u }))}
          onAudioFileName={setNewAudioFileName}
        />
      </TemplateModalShell>

      <TemplateModalShell
        open={editOpen}
        title="Edit Voicemail Record"
        saveLabel="Save Changes"
        confirmSave={editConfirmSave}
        itemLabel="record"
        onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditConfirmSave(false); } }}
        onSave={handleEditSave}
        onConfirmSave={handleEditConfirmSave}
        onCancelConfirm={() => setEditConfirmSave(false)}
      >
        <RecordForm
          form={editForm}
          audioFileName={editAudioFileName}
          categories={voicemailCategories}
          onChange={(u) => setEditForm((f) => ({ ...f, ...u }))}
          onAudioFileName={setEditAudioFileName}
        />
      </TemplateModalShell>

      <CategoryManagerModal
        open={catModalOpen}
        title="Voicemail Record Categories"
        categories={voicemailCategories}
        builtins={VOICEMAIL_CATEGORY_BUILTINS}
        onOpenChange={setCatModalOpen}
        onAdd={handleAddVoicemailCategory}
        onDelete={handleDeleteVoicemailCategory}
      />
    </>
  );
}
