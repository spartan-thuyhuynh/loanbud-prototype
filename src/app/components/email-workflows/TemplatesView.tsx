import { useState } from 'react';
import { EmailTemplates, type EmailTemplate } from './campaign/EmailTemplates';

export function TemplatesView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-8 py-5 shrink-0">
        <h1 className="text-3xl font-semibold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Reusable email templates for campaigns and workflows</p>
      </div>
      <div className="flex-1 overflow-auto">
        <EmailTemplates
          templates={templates}
          onSaveTemplate={(template) => setTemplates([...templates, template])}
          onDeleteTemplate={(id) => setTemplates(templates.filter((t) => t.id !== id))}
        />
      </div>
    </div>
  );
}
