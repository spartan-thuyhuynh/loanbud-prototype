import { useState } from 'react';
import { SegmentBuilder, type SavedSegment } from './campaign/SegmentBuilder';
import { EmailTemplates, type EmailTemplate } from './campaign/EmailTemplates';
import { SendCampaigns } from './campaign/SendCampaigns';
import { PerformanceAnalytics } from './campaign/PerformanceAnalytics';
import type { Contact, EmailRecord } from '@/app/types';

interface CampaignManagerProps {
  contacts: Contact[];
  emailHistory: EmailRecord[];
  onSendEmail: (
    recipients: Contact[],
    subject: string,
    body: string,
    senderIdentity: string
  ) => void;
}

type SubTab = 'segments' | 'templates' | 'send' | 'performance';

interface TabConfig {
  id: SubTab;
  label: string;
}

const tabs: TabConfig[] = [
  { id: 'segments', label: 'Segment Builder' },
  { id: 'templates', label: 'Email Templates' },
  { id: 'send', label: 'Send Campaigns' },
  { id: 'performance', label: 'Performance' },
];

export function CampaignManager({
  contacts,
  emailHistory,
  onSendEmail,
}: CampaignManagerProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('segments');
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Horizontal Tabs */}
      <div className="border-b border-border bg-card">
        <div className="px-8 pt-6 pb-4">
          <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Campaign Manager
          </h2>
          <p className="text-muted-foreground">
            Build segments, create templates, and launch email campaigns
          </p>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="px-8">
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-3 relative transition-all duration-200
                    ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-sans)', fontWeight: isActive ? 600 : 400 }}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'segments' && (
          <SegmentBuilder
            contacts={contacts}
            savedSegments={savedSegments}
            onSaveSegment={(segment) => setSavedSegments([...savedSegments, segment])}
            onDeleteSegment={(id) =>
              setSavedSegments(savedSegments.filter((s) => s.id !== id))
            }
          />
        )}
        {activeTab === 'templates' && (
          <EmailTemplates
            templates={templates}
            onSaveTemplate={(template) => setTemplates([...templates, template])}
            onDeleteTemplate={(id) => setTemplates(templates.filter((t) => t.id !== id))}
          />
        )}
        {activeTab === 'send' && (
          <SendCampaigns
            contacts={contacts}
            savedSegments={savedSegments}
            templates={templates}
            onSendEmail={onSendEmail}
          />
        )}
        {activeTab === 'performance' && (
          <PerformanceAnalytics emailHistory={emailHistory} />
        )}
      </div>
    </div>
  );
}
