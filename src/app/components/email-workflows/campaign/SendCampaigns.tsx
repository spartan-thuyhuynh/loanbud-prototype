import { useState } from "react";
import { Send, AlertTriangle, CheckCircle2, Sparkles, User } from "lucide-react";
import type { Contact } from "@/app/types";
import type { SavedSegment, EmailTemplate } from "./types";
import { CampaignConfirmationView } from "./send-campaigns/CampaignConfirmationView";

interface SendCampaignsProps {
  contacts: Contact[];
  savedSegments: SavedSegment[];
  templates: EmailTemplate[];
  onSendEmail: (
    recipients: Contact[],
    subject: string,
    body: string,
    senderIdentity: string,
  ) => void;
}

export function SendCampaigns({
  contacts,
  savedSegments,
  templates,
  onSendEmail,
}: SendCampaignsProps) {
  const [selectedSegment, setSelectedSegment] =
    useState<SavedSegment | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [agentName, setAgentName] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getRecipients = () => {
    if (!selectedSegment) return [];
    let result = contacts;
    selectedSegment.filters.forEach((filter) => {
      result = result.filter((contact) => {
        const fieldValue = contact[filter.field];
        return filter.operator === "=" ? fieldValue === filter.value : fieldValue !== filter.value;
      });
    });
    return result;
  };

  const recipients = getRecipients();
  const eligibleRecipients = recipients.filter((r) => !r.optedOut);
  const blockedRecipients = recipients.filter((r) => r.optedOut);

  const handlePreview = () => {
    if (!selectedSegment) { alert("Please select a segment"); return; }
    if (!selectedTemplate) { alert("Please select a template"); return; }
    if (eligibleRecipients.length === 0) { alert("No eligible recipients in this segment"); return; }
    if (selectedTemplate.senderType === "agent" && !agentName.trim()) { alert("Please enter agent name"); return; }
    setShowConfirmation(true);
  };

  const handleSend = () => {
    if (!selectedTemplate) return;
    const senderIdentity =
      selectedTemplate.senderType === "brand"
        ? "LoanBud Brand"
        : `Agent: ${agentName}`;
    onSendEmail(eligibleRecipients, selectedTemplate.subject, selectedTemplate.body, senderIdentity);
    setSelectedSegment(null);
    setSelectedTemplate(null);
    setAgentName("");
    setShowConfirmation(false);
  };

  const previewBody = (contact: Contact) => {
    if (!selectedTemplate) return "";
    return selectedTemplate.body
      .replace(/\{\{first_name\}\}/g, contact.firstName)
      .replace(/\{\{listing_name\}\}/g, contact.listingName);
  };

  const previewSubject = (contact: Contact) => {
    if (!selectedTemplate) return "";
    return selectedTemplate.subject
      .replace(/\{\{first_name\}\}/g, contact.firstName)
      .replace(/\{\{listing_name\}\}/g, contact.listingName);
  };

  if (showConfirmation && selectedTemplate) {
    return (
      <CampaignConfirmationView
        selectedSegment={selectedSegment}
        selectedTemplate={selectedTemplate}
        eligibleRecipients={eligibleRecipients}
        agentName={agentName}
        previewSubject={previewSubject}
        previewBody={previewBody}
        onBack={() => setShowConfirmation(false)}
        onSend={handleSend}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Campaign Setup */}
          <div className="space-y-6">
            {/* Select Segment */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3
                className="text-lg mb-4"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                1. Select Segment
              </h3>
              {savedSegments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm">No saved segments</p>
                  <p className="text-xs mt-1">Go to Segment Builder to create one</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedSegments.map((segment) => (
                    <div
                      key={segment.id}
                      onClick={() => setSelectedSegment(segment)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSegment?.id === segment.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h4 className="font-medium mb-1">{segment.name}</h4>
                      {segment.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {segment.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {segment.filters.length} filter
                        {segment.filters.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Select Template */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3
                className="text-lg mb-4"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                2. Select Template
              </h3>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm">No saved templates</p>
                  <p className="text-xs mt-1">Go to Email Templates to create one</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.senderType === "brand" ? (
                          <Sparkles className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agent Name if needed */}
            {selectedTemplate?.senderType === "agent" && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3
                  className="text-lg mb-4"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  3. Agent Information
                </h3>
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name..."
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview & Send */}
          <div className="space-y-6">
            {/* Recipient Summary */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3
                className="text-lg mb-4"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Recipients Summary
              </h3>
              {!selectedSegment ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Select a segment to see recipients</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="text-sm text-green-700">Eligible</div>
                        <div
                          className="text-2xl text-green-900"
                          style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
                        >
                          {eligibleRecipients.length}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <div>
                        <div className="text-sm text-red-700">Blocked</div>
                        <div
                          className="text-2xl text-red-900"
                          style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
                        >
                          {blockedRecipients.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  {blockedRecipients.length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                      <p className="text-sm text-destructive">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        {blockedRecipients.length} contact(s) will be excluded due to opt-out status
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3
                  className="text-lg mb-4"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Template Preview
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Subject</div>
                    <div className="p-3 bg-muted/30 rounded-lg text-sm">
                      {selectedTemplate.subject}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Body</div>
                    <div className="p-3 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-auto font-mono">
                      {selectedTemplate.body}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handlePreview}
              disabled={
                !selectedSegment ||
                !selectedTemplate ||
                eligibleRecipients.length === 0 ||
                (selectedTemplate?.senderType === "agent" && !agentName.trim())
              }
              className="w-full px-6 py-4 bg-accent text-accent-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              <Send className="w-5 h-5" />
              Preview & Send Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
