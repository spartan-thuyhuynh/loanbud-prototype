import { useRef, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";

interface CategoryManagerModalProps {
  open: boolean;
  title: string;
  categories: string[];
  builtins: string[];
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
}

export function CategoryManagerModal({ open, title, categories, builtins, onOpenChange, onAdd, onDelete, onRename }: CategoryManagerModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast.error(`"${trimmed}" already exists.`);
      return;
    }
    onAdd(trimmed);
    setInputValue("");
    toast.success(`"${trimmed}" added.`);
  };

  const startEdit = (cat: string) => {
    setConfirmDelete(null);
    setEditingCat(cat);
    setEditValue(cat);
    setTimeout(() => editInputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (!editingCat) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty.");
      return;
    }
    if (trimmed === editingCat) {
      setEditingCat(null);
      return;
    }
    if (categories.includes(trimmed)) {
      toast.error(`"${trimmed}" already exists.`);
      return;
    }
    onRename(editingCat, trimmed);
    setEditingCat(null);
    toast.success(`Renamed to "${trimmed}".`);
  };

  const cancelEdit = () => setEditingCat(null);

  const handleClose = (o: boolean) => {
    if (!o) {
      setConfirmDelete(null);
      setEditingCat(null);
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs p-0 flex flex-col gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">{title}</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-72 py-1">
          {categories.map((cat) => {
            const isBuiltin = builtins.includes(cat);
            const isConfirming = confirmDelete === cat;
            const isEditing = editingCat === cat;

            if (isEditing) {
              return (
                <div key={cat} className="flex items-center gap-1.5 px-4 py-2">
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
                <div key={cat} className="px-4 py-2 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Templates with this category will remain unchanged.
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-destructive font-medium flex-1 truncate">Delete "{cat}"?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 text-xs px-2 shrink-0"
                      onClick={() => { onDelete(cat); setConfirmDelete(null); toast.success(`"${cat}" deleted.`); }}
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
                key={cat}
                className="flex items-center justify-between px-4 py-2 hover:bg-muted/40 group"
              >
                <span className="text-sm text-foreground truncate">{cat}</span>
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Rename"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingCat(null); setConfirmDelete(cat); }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-border flex gap-2">
          <Input
            value={inputValue}
            placeholder="New category..."
            className="h-8 text-sm"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          <Button size="sm" onClick={handleAdd} disabled={!inputValue.trim()}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
