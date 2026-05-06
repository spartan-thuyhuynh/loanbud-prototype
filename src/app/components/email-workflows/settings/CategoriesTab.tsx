import { useState } from "react";
import { Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "../../../contexts/AppDataContext";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

const BUILTIN_EMAIL = ["Initial Outreach", "Follow-up", "Nurture", "Re-engagement", "Custom"];
const BUILTIN_SMS = ["Follow-up", "Reminder", "Appointment", "Alert", "Custom"];
const BUILTIN_VOICEMAIL = ["Initial Outreach", "Follow-up", "Re-engagement", "Custom"];

interface CategorySectionProps {
  title: string;
  categories: string[];
  builtins: string[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
}

function CategorySection({ title, categories, builtins, onAdd, onDelete }: CategorySectionProps) {
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
    toast.success(`Category "${trimmed}" added.`);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="rounded-xl border border-border overflow-hidden">
        {categories.map((cat, i) => {
          const isBuiltin = builtins.includes(cat);
          const isConfirming = confirmDelete === cat;
          return (
            <div
              key={cat}
              className={`flex items-center justify-between px-4 py-2.5 bg-background ${i < categories.length - 1 ? "border-b border-border/60" : ""}`}
            >
              <div className="flex items-center gap-2">
                {isBuiltin && <Lock className="w-3 h-3 text-muted-foreground/40" />}
                <span className="text-sm text-foreground">{cat}</span>
                {isBuiltin && <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">built-in</span>}
              </div>
              {!isBuiltin && (
                isConfirming ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-destructive font-medium">Delete?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => { onDelete(cat); setConfirmDelete(null); toast.success(`Category "${cat}" deleted.`); }}
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
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
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
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
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
    handleAddSmsCategory,
    handleDeleteSmsCategory,
    handleAddVoicemailCategory,
    handleDeleteVoicemailCategory,
  } = useAppData();

  return (
    <div className="overflow-y-auto h-full px-8 py-6 space-y-8 max-w-xl">
      <CategorySection
        title="Email Template Categories"
        categories={emailCategories}
        builtins={BUILTIN_EMAIL}
        onAdd={handleAddEmailCategory}
        onDelete={handleDeleteEmailCategory}
      />
      <CategorySection
        title="SMS Template Categories"
        categories={smsCategories}
        builtins={BUILTIN_SMS}
        onAdd={handleAddSmsCategory}
        onDelete={handleDeleteSmsCategory}
      />
      <CategorySection
        title="Voicemail Record Categories"
        categories={voicemailCategories}
        builtins={BUILTIN_VOICEMAIL}
        onAdd={handleAddVoicemailCategory}
        onDelete={handleDeleteVoicemailCategory}
      />
    </div>
  );
}
