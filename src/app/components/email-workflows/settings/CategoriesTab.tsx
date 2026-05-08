import { useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "../../../contexts/AppDataContext";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

const BUILTIN_EMAIL = [
  "Initial Outreach",
  "Follow-up",
  "Nurture",
  "Re-engagement",
  "Custom",
];
const BUILTIN_SMS = ["Follow-up", "Reminder", "Appointment", "Alert", "Custom"];
const BUILTIN_VOICEMAIL = [
  "Initial Outreach",
  "Follow-up",
  "Re-engagement",
  "Custom",
];

interface CategorySectionProps {
  title: string;
  categories: string[];
  builtins: string[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
}

function CategorySection({
  title,
  categories,
  builtins,
  onAdd,
  onDelete,
  onRename,
}: CategorySectionProps) {
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
    toast.success(`Category "${trimmed}" added.`);
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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="rounded-xl border border-border overflow-hidden">
        {categories.map((cat, i) => {
          const isConfirming = confirmDelete === cat;
          const isEditing = editingCat === cat;
          const isLast = i === categories.length - 1;

          if (isEditing) {
            return (
              <div
                key={cat}
                className={`flex items-center gap-1.5 px-3 py-2 bg-background ${!isLast ? "border-b border-border/60" : ""}`}
              >
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
                <Button
                  size="sm"
                  className="h-7 text-xs px-2 shrink-0"
                  onClick={commitEdit}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2 shrink-0"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </div>
            );
          }

          if (isConfirming) {
            return (
              <div
                key={cat}
                className={`px-4 py-2.5 bg-muted/30 ${!isLast ? "border-b border-border/60" : ""}`}
              >
                <p className="text-xs text-muted-foreground mb-1.5">
                  Templates with this category will remain unchanged.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-destructive font-medium flex-1 truncate">
                    Delete "{cat}"?
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 text-xs px-2 shrink-0"
                    onClick={() => {
                      onDelete(cat);
                      setConfirmDelete(null);
                      toast.success(`Category "${cat}" deleted.`);
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2 shrink-0"
                    onClick={() => setConfirmDelete(null)}
                  >
                    No
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cat}
              className={`flex items-center justify-between px-4 py-2.5 bg-background hover:bg-muted/30 group ${!isLast ? "border-b border-border/60" : ""}`}
            >
              <span className="text-sm text-foreground">{cat}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Rename"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditingCat(null);
                    setConfirmDelete(cat);
                  }}
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
      <div className="flex gap-2">
        <Input
          value={inputValue}
          placeholder="New category name..."
          className="h-8 text-sm"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button size="sm" onClick={handleAdd} disabled={!inputValue.trim()}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

export function CategoriesTab() {
  const {
    emailCategories,
    smsCategories,
    voicemailCategories,
    handleAddEmailCategory,
    handleDeleteEmailCategory,
    handleRenameEmailCategory,
    handleAddSmsCategory,
    handleDeleteSmsCategory,
    handleRenameSmsCategory,
    handleAddVoicemailCategory,
    handleDeleteVoicemailCategory,
    handleRenameVoicemailCategory,
  } = useAppData();

  return (
    <div className="overflow-y-auto h-full px-8 py-6 space-y-8 max-w-xl">
      <CategorySection
        title="Email Template Categories"
        categories={emailCategories}
        builtins={BUILTIN_EMAIL}
        onAdd={handleAddEmailCategory}
        onDelete={handleDeleteEmailCategory}
        onRename={handleRenameEmailCategory}
      />
      <CategorySection
        title="SMS Template Categories"
        categories={smsCategories}
        builtins={BUILTIN_SMS}
        onAdd={handleAddSmsCategory}
        onDelete={handleDeleteSmsCategory}
        onRename={handleRenameSmsCategory}
      />
      <CategorySection
        title="Voicemail Record Categories"
        categories={voicemailCategories}
        builtins={BUILTIN_VOICEMAIL}
        onAdd={handleAddVoicemailCategory}
        onDelete={handleDeleteVoicemailCategory}
        onRename={handleRenameVoicemailCategory}
      />
    </div>
  );
}
