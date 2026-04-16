import { Plus, Trash2, FileText, Sparkles, User } from "lucide-react";
import type { EmailTemplate } from "../types";
import { sampleTemplates } from "../campaign-data";

interface TemplateLibraryPanelProps {
  templates: EmailTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onLoadSample: (sample: Omit<EmailTemplate, "id" | "createdAt">) => void;
}

export function TemplateLibraryPanel({
  templates,
  selectedTemplateId,
  onSelect,
  onDelete,
  onNew,
  onLoadSample,
}: TemplateLibraryPanelProps) {
  return (
    <div className="col-span-1 space-y-6">
      {/* Your Templates */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
          >
            Your Templates
          </h3>
          <button
            onClick={onNew}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No templates yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => onSelect(template)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(template.id);
                    }}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                    {template.category}
                  </span>
                  {template.senderType === "brand" ? (
                    <Sparkles className="w-3 h-3 text-primary" />
                  ) : (
                    <User className="w-3 h-3 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Templates */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3
          className="text-lg mb-4"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          Sample Templates
        </h3>
        <div className="space-y-2">
          {sampleTemplates.map((sample, index) => (
            <div
              key={index}
              onClick={() => onLoadSample(sample)}
              className="p-3 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-all"
            >
              <div className="font-medium text-sm mb-1">{sample.name}</div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                  {sample.category}
                </span>
                {sample.senderType === "brand" ? (
                  <Sparkles className="w-3 h-3 text-primary" />
                ) : (
                  <User className="w-3 h-3 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
