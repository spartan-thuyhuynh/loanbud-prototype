import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import type { EmailTemplate } from "./types";
import { TemplateLibraryPanel } from "./email-templates/TemplateLibraryPanel";
import { TemplateEditorPanel } from "./email-templates/TemplateEditorPanel";
import { TemplateViewerPanel } from "./email-templates/TemplateViewerPanel";
import { Button } from "../../ui/button";

export type { EmailTemplate };

interface EmailTemplatesProps {
  templates: EmailTemplate[];
  onSaveTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export function EmailTemplates({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
}: EmailTemplatesProps) {
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [senderType, setSenderType] = useState<"brand" | "agent">("brand");
  const [category, setCategory] = useState("Initial Outreach");
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);

  const handleSave = () => {
    if (!templateName.trim() || !subject.trim() || !body.trim()) {
      alert("Please fill in all fields");
      return;
    }
    const newTemplate: EmailTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      subject,
      body,
      senderType,
      category,
      createdAt: new Date(),
    };
    onSaveTemplate(newTemplate);
    resetForm();
  };

  const resetForm = () => {
    setTemplateName("");
    setSubject("");
    setBody("");
    setSenderType("brand");
    setCategory("Initial Outreach");
    setShowNewTemplate(false);
  };

  const handleSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowNewTemplate(false);
  };

  const handleDelete = (id: string) => {
    onDeleteTemplate(id);
    if (selectedTemplate?.id === id) setSelectedTemplate(null);
  };

  const handleNew = () => {
    setShowNewTemplate(true);
    setSelectedTemplate(null);
    resetForm();
  };

  const handleLoadSample = (
    sample: Omit<EmailTemplate, "id" | "createdAt">,
  ) => {
    setTemplateName(sample.name);
    setSubject(sample.subject);
    setBody(sample.body);
    setSenderType(sample.senderType);
    setCategory(sample.category);
    setShowNewTemplate(true);
    setSelectedTemplate(null);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          <TemplateLibraryPanel
            templates={templates}
            selectedTemplateId={selectedTemplate?.id ?? null}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onNew={handleNew}
            onLoadSample={handleLoadSample}
          />

          {/* Right Column - Template Editor/Viewer */}
          <div className="col-span-2">
            {!showNewTemplate && !selectedTemplate ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3
                  className="text-xl mb-2"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Select or Create a Template
                </h3>
                <p className="text-muted-foreground mb-6">
                  Choose from your saved templates, start with a sample, or
                  create a new one
                </p>
                <Button
                  onClick={() => {
                    setShowNewTemplate(true);
                    resetForm();
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create New Template
                </Button>
              </div>
            ) : showNewTemplate ? (
              <TemplateEditorPanel
                templateName={templateName}
                subject={subject}
                body={body}
                senderType={senderType}
                category={category}
                onChangeTemplateName={setTemplateName}
                onChangeSubject={setSubject}
                onChangeBody={setBody}
                onChangeSenderType={setSenderType}
                onChangeCategory={setCategory}
                onSave={handleSave}
              />
            ) : (
              selectedTemplate && (
                <TemplateViewerPanel template={selectedTemplate} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
