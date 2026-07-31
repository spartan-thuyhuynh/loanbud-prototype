import { toast } from "sonner";
import { PLACEHOLDER_GROUPS } from "./placeholderCatalog";

export function PlaceholdersPanel() {
  const copy = (token: string) => {
    void navigator.clipboard?.writeText(`{{${token}}}`);
    toast.success(`Copied {{${token}}}`);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1 h-4 bg-primary rounded" />
        <h3 className="text-sm font-semibold text-foreground">PLACEHOLDERS</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Click to copy, then paste into any text block.</p>
      <div className="space-y-4">
        {PLACEHOLDER_GROUPS.map((g) => (
          <div key={g.label}>
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5">{g.label}</p>
            <div className="space-y-1.5">
              {g.tokens.map((tk) => (
                <button
                  key={tk.token}
                  type="button"
                  onClick={() => copy(tk.token)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted font-mono text-sm text-foreground transition-colors"
                >
                  {`{{${tk.token}}}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
