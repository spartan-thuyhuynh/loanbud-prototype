import { useState } from "react";
import { X, Plus, Pencil, Trash2, Users, ShieldCheck, Check } from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import { INTERNAL_USERS } from "@/app/config/team";
import type { LoGroup } from "@/app/types";

interface LoGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DraftGroup {
  id?: string;
  name: string;
  description: string;
  memberNames: string[];
  isActive: boolean;
}

const EMPTY_DRAFT: DraftGroup = { name: "", description: "", memberNames: [], isActive: true };

/**
 * RFC-008 (story -05): manage named groups of internal-team users. A group is a
 * selectable round-robin fallback pool in bulk-create. Admin / super-admin only.
 */
export function LoGroupsModal({ isOpen, onClose }: LoGroupsModalProps) {
  const { loGroups, handleCreateLoGroup, handleUpdateLoGroup, handleDeleteLoGroup } = useAppData();
  const [draft, setDraft] = useState<DraftGroup | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const startCreate = () => { setDraft({ ...EMPTY_DRAFT }); setError(""); };
  const startEdit = (g: LoGroup) => {
    setDraft({ id: g.id, name: g.name, description: g.description ?? "", memberNames: [...g.memberNames], isActive: g.isActive });
    setError("");
  };

  const toggleMember = (name: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      memberNames: draft.memberNames.includes(name)
        ? draft.memberNames.filter((n) => n !== name)
        : [...draft.memberNames, name],
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.name.trim()) { setError("Group name is required."); return; }
    if (draft.memberNames.length === 0) { setError("Add at least one member."); return; }
    if (draft.id) {
      handleUpdateLoGroup(draft.id, {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        memberNames: draft.memberNames,
        isActive: draft.isActive,
      });
    } else {
      handleCreateLoGroup({
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        memberNames: draft.memberNames,
        isActive: draft.isActive,
      });
    }
    setDraft(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-8 max-w-lg w-full mx-4 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">LO Groups</h3>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary/70 uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10">
              RFC-008
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin / super-admin only — used as round-robin fallback pools.
        </p>

        {draft ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Group name <span className="text-destructive">*</span></label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. SBA Team"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="What this group handles"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Members <span className="text-destructive">*</span></label>
              <div className="grid grid-cols-2 gap-1.5">
                {INTERNAL_USERS.map((u) => {
                  const checked = draft.memberNames.includes(u.name);
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleMember(u.name)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                        checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${checked ? "bg-primary text-primary-foreground" : "border border-border"}`}>
                        {checked && <Check className="w-3 h-3" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium truncate">{u.name}</span>
                        <span className="block text-[10px] text-muted-foreground capitalize">{u.role.replace("_", " ")}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} className="rounded border-border" />
              Active
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={saveDraft} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {draft.id ? "Save changes" : "Create group"}
              </button>
              <button onClick={() => setDraft(null)} className="px-4 py-2.5 border-2 border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {loGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Users className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No LO groups yet</p>
              </div>
            ) : (
              loGroups.map((g) => (
                <div key={g.id} className="p-3.5 border border-border rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{g.name}</span>
                        {!g.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                        )}
                      </div>
                      {g.description && <p className="text-xs text-muted-foreground mt-0.5">{g.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(g)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteLoGroup(g.id)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {g.memberNames.map((m) => (
                      <span key={m} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
            <button
              onClick={startCreate}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 border-dashed border-border text-muted-foreground rounded-lg text-sm hover:border-primary/40 hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" /> New group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
