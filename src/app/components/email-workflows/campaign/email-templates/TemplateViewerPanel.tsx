import { Sparkles, User } from "lucide-react";
import type { EmailTemplate } from "../types";

interface TemplateViewerPanelProps {
  template: EmailTemplate;
}

export function TemplateViewerPanel({ template }: TemplateViewerPanelProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-xl mb-2"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
          >
            {template.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-muted text-xs rounded-full">
              {template.category}
            </span>
            {template.senderType === "brand" ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Brand Voice
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                Agent Personal
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Subject</div>
          <div className="p-3 bg-muted/30 rounded-lg">{template.subject}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Body</div>
          <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {template.body}
          </div>
        </div>
      </div>
    </div>
  );
}
