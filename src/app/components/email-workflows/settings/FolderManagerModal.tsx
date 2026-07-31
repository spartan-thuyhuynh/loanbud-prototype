import { useRef, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { TemplateFolder } from "../../../types";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { getDescendantFolderIds } from "./templateVisibility";

interface FolderManagerModalProps {
  open: boolean;
  folders: TemplateFolder[];
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, parentId: string | null) => void;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, newParentId: string | null) => void;
  onSetVisibility: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}

/** Depth-first order with a `depth` for indentation. Cycle-safe: relies on parentId tree, no infinite loop for well-formed data. */
function orderedWithDepth(folders: TemplateFolder[]): { folder: TemplateFolder; depth: number }[] {
  const out: { folder: TemplateFolder; depth: number }[] = [];
  const childrenOf = (id: string | null) => folders.filter((f) => f.parentId === id);
  const walk = (id: string | null, depth: number) => {
    for (const f of childrenOf(id)) {
      out.push({ folder: f, depth });
      walk(f.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export function FolderManagerModal({
  open,
  folders,
  onOpenChange,
  onCreate,
  onRename,
  onMove,
  onSetVisibility,
  onDelete,
}: FolderManagerModalProps) {
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const rows = orderedWithDepth(folders);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed, newParentId === "" ? null : newParentId);
    setNewName("");
    setNewParentId("");
    toast.success(`"${trimmed}" added.`);
  };

  const startEdit = (folder: TemplateFolder) => {
    setConfirmDelete(null);
    setEditingId(folder.id);
    setEditValue(folder.name);
    setTimeout(() => editInputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error("Folder name cannot be empty.");
      return;
    }
    onRename(editingId, trimmed);
    setEditingId(null);
    toast.success(`Renamed to "${trimmed}".`);
  };

  const cancelEdit = () => setEditingId(null);

  const handleClose = (o: boolean) => {
    if (!o) {
      setConfirmDelete(null);
      setEditingId(null);
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 flex flex-col gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">Manage Folders</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-96 py-1">
          {rows.map(({ folder, depth }) => {
            const isConfirming = confirmDelete === folder.id;
            const isEditing = editingId === folder.id;
            const excluded = new Set([folder.id, ...getDescendantFolderIds(folder.id, folders)]);
            const parentOptions = folders.filter((f) => !excluded.has(f.id));

            if (isEditing) {
              return (
                <div key={folder.id} className="flex items-center gap-1.5 px-4 py-2" style={{ paddingLeft: 16 + depth * 14 }}>
                  <Input
                    ref={editInputRef}
                    value={editValue}
                    className="h-7 text-sm flex-1"
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                  />
                  <Button size="sm" className="h-7 text-xs px-2" onClick={commitEdit}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={cancelEdit}>Cancel</Button>
                </div>
              );
            }

            if (isConfirming) {
              return (
                <div key={folder.id} className="px-4 py-2 bg-muted/30" style={{ paddingLeft: 16 + depth * 14 }}>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Templates in this folder move to Uncategorized; subfolders move up one level.
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-destructive font-medium flex-1 truncate">Delete "{folder.name}"?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 text-xs px-2 shrink-0"
                      onClick={() => { onDelete(folder.id); setConfirmDelete(null); toast.success(`"${folder.name}" deleted.`); }}
                    >
                      Yes
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2 shrink-0" onClick={() => setConfirmDelete(null)}>
                      No
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={folder.id}
                className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-muted/40 group"
                style={{ paddingLeft: 16 + depth * 14 }}
              >
                <span className="text-sm text-foreground truncate flex-1">{folder.name}</span>
                <select
                  value={folder.parentId ?? ""}
                  onChange={(e) => onMove(folder.id, e.target.value === "" ? null : e.target.value)}
                  className="h-7 text-xs border border-border rounded-md bg-background px-1.5 max-w-[110px]"
                  title="Move to parent folder"
                >
                  <option value="">— Top level —</option>
                  {parentOptions.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 shrink-0" title="Visible to Loan Officers">
                  <Switch
                    checked={folder.visibleToLoanOfficers}
                    onCheckedChange={(checked) => onSetVisibility(folder.id, checked)}
                  />
                </div>
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(folder)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Rename"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setConfirmDelete(folder.id); }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p className="px-4 py-3 text-xs text-muted-foreground">No folders yet.</p>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={newName}
              placeholder="New folder..."
              className="h-8 text-sm flex-1"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            />
            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="h-8 text-xs border border-border rounded-md bg-background px-1.5 max-w-[110px]"
              title="Parent folder"
            >
              <option value="">— Top level —</option>
              {rows.map(({ folder }) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
