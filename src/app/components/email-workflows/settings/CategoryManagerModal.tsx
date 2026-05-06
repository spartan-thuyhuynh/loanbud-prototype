import { useState } from "react";
import { Lock, Plus, Trash2, X } from "lucide-react";
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
}

export function CategoryManagerModal({ open, title, categories, builtins, onOpenChange, onAdd, onDelete }: CategoryManagerModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setConfirmDelete(null); onOpenChange(o); }}>
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
            return (
              <div
                key={cat}
                className="flex items-center justify-between px-4 py-2 hover:bg-muted/40 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isBuiltin
                    ? <Lock className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                    : <span className="w-3 shrink-0" />
                  }
                  <span className="text-sm text-foreground truncate">{cat}</span>
                </div>
                {!isBuiltin && (
                  isConfirming ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-destructive font-medium">Delete?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => { onDelete(cat); setConfirmDelete(null); toast.success(`"${cat}" deleted.`); }}
                      >
                        Yes
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setConfirmDelete(null)}>
                        No
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(cat)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
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
