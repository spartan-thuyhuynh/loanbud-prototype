import { useState } from 'react';
import { EmailTemplates, type EmailTemplate } from './campaign/EmailTemplates';

export function TemplatesView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  return (
    <EmailTemplates
      templates={templates}
      onSaveTemplate={(template) => setTemplates([...templates, template])}
      onDeleteTemplate={(id) => setTemplates(templates.filter((t) => t.id !== id))}
    />
  );
}
