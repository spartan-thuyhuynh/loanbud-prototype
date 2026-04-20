import { Save, Sparkles, User } from "lucide-react";
import { templateCategories } from "../campaign-data";

interface TemplateEditorPanelProps {
  templateName: string;
  subject: string;
  body: string;
  senderType: "brand" | "agent";
  category: string;
  onChangeTemplateName: (v: string) => void;
  onChangeSubject: (v: string) => void;
  onChangeBody: (v: string) => void;
  onChangeSenderType: (v: "brand" | "agent") => void;
  onChangeCategory: (v: string) => void;
  onSave: () => void;
}

export function TemplateEditorPanel({
  templateName,
  subject,
  body,
  senderType,
  category,
  onChangeTemplateName,
  onChangeSubject,
  onChangeBody,
  onChangeSenderType,
  onChangeCategory,
  onSave,
}: TemplateEditorPanelProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-xl"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          {templateName || "New Template"}
        </h3>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Template
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Template Name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => onChangeTemplateName(e.target.value)}
            placeholder="e.g., New Listing Outreach"
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onChangeCategory(e.target.value)}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {templateCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-muted-foreground">
            Subject Line
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onChangeSubject(subject + "{{first_name}}")}
              className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              + first_name
            </button>
            <button
              onClick={() => onChangeSubject(subject + "{{listing_name}}")}
              className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              + listing_name
            </button>
          </div>
        </div>
        <input
          type="text"
          value={subject}
          onChange={(e) => onChangeSubject(e.target.value)}
          placeholder="Enter subject line..."
          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-muted-foreground">
            Email Body
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onChangeBody(body + "{{first_name}}")}
              className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              + first_name
            </button>
            <button
              onClick={() => onChangeBody(body + "{{listing_name}}")}
              className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              + listing_name
            </button>
          </div>
        </div>
        <textarea
          value={body}
          onChange={(e) => onChangeBody(e.target.value)}
          placeholder="Enter email body..."
          rows={14}
          className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono text-sm"
        />
      </div>
    </div>
  );
}
