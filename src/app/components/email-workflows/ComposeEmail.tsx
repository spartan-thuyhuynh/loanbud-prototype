import { useState, useEffect } from 'react';
import { Send, AlertTriangle, Info, Sparkles, User } from 'lucide-react';
import type { Contact } from '@/app/types';

interface ComposeEmailProps {
  preselectedRecipients?: Contact[];
  contacts: Contact[];
  onSend: (
    recipients: Contact[],
    subject: string,
    body: string,
    senderIdentity: string
  ) => void;
}

export function ComposeEmail({
  preselectedRecipients,
  contacts: _contacts,
  onSend,
}: ComposeEmailProps) {
  const [senderIdentity, setSenderIdentity] = useState<'brand' | 'agent'>('brand');
  const [agentName, setAgentName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const recipients = preselectedRecipients || [];
  const eligibleRecipients = recipients.filter((r) => !r.optedOut);
  const blockedRecipients = recipients.filter((r) => r.optedOut);

  useEffect(() => {
    if (preselectedRecipients && preselectedRecipients.length > 0) {
      // Pre-fill template for "New" listings
      const hasNewListings = preselectedRecipients.some(
        (r) => r.listingStatus === 'New'
      );
      if (hasNewListings) {
        setSubject('Claim Your Listing - Fast Approval Available');
        setBody(
          `Hi {{first_name}},\n\nI noticed your listing for {{listing_name}} and wanted to reach out personally.\n\nWe specialize in fast approvals and competitive rates. I'd love to discuss how we can help you move forward quickly.\n\nCan we schedule a quick call this week?\n\nBest regards,\nThe LoanBud Team`
        );
      }
    }
  }, [preselectedRecipients]);

  const handlePreview = () => {
    if (eligibleRecipients.length === 0) {
      alert('No eligible recipients selected');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in subject and body');
      return;
    }
    if (senderIdentity === 'agent' && !agentName.trim()) {
      alert('Please enter agent name');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSend = () => {
    const identity =
      senderIdentity === 'brand'
        ? 'LoanBud Brand'
        : `Agent: ${agentName}`;

    onSend(eligibleRecipients, subject, body, identity);

    // Reset form
    setSubject('');
    setBody('');
    setSenderIdentity('brand');
    setAgentName('');
    setShowConfirmation(false);
  };

  const insertTag = (tag: string) => {
    setBody(body + `{{${tag}}}`);
  };

  const previewBody = (contact: Contact) => {
    return body
      .replace(/\{\{first_name\}\}/g, contact.firstName)
      .replace(/\{\{listing_name\}\}/g, contact.listingName);
  };

  if (showConfirmation) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="border-b border-border bg-card px-8 py-6">
          <h2 className="text-3xl" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Confirm & Send
          </h2>
          <p className="text-muted-foreground mt-1">
            Review before sending
          </p>
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Send Summary */}
            <div className="bg-accent/10 border-2 border-accent rounded-lg p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Ready to Send
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Recipients:</span>{' '}
                      <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                        {eligibleRecipients.length} contacts
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Sender Identity:</span>{' '}
                      <span className="font-medium">
                        {senderIdentity === 'brand' ? 'LoanBud Brand' : `Agent: ${agentName}`}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Call Reminders:</span>{' '}
                      <span className="font-medium">
                        4 tasks will be created per contact (Days 0, 3, 7, 14)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h3 className="text-lg" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  Email Preview
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Subject:</span>
                  <p className="text-lg mt-1" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    {subject}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Example for: {eligibleRecipients[0]?.firstName} {eligibleRecipients[0]?.lastName}
                  </p>
                  <div className="whitespace-pre-wrap">
                    {eligibleRecipients[0] && previewBody(eligibleRecipients[0])}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-6 py-4 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex-1 px-6 py-4 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}
              >
                <Send className="w-5 h-5" />
                Confirm & Send to {eligibleRecipients.length} Recipients
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <h2 className="text-3xl" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
          Compose & Send Email
        </h2>
        <p className="text-muted-foreground mt-1">
          Manual email campaign with personalization
        </p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Recipient Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Recipients
            </h3>
            {recipients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recipients selected</p>
                <p className="text-sm mt-1">Go to Contacts & Segments to build a segment</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700">Eligible:</span>
                    <span
                      className="text-xl text-green-900"
                      style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                    >
                      {eligibleRecipients.length}
                    </span>
                  </div>
                  {blockedRecipients.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-sm text-red-700">Blocked (Opted Out):</span>
                      <span
                        className="text-xl text-red-900"
                        style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                      >
                        {blockedRecipients.length}
                      </span>
                    </div>
                  )}
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

          {/* Sender Identity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Sender Identity
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setSenderIdentity('brand')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  senderIdentity === 'brand'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Sparkles className="w-6 h-6 mb-2 mx-auto text-primary" />
                <div className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  Brand Voice
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Send as LoanBud
                </div>
              </button>
              <button
                onClick={() => setSenderIdentity('agent')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  senderIdentity === 'agent'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <User className="w-6 h-6 mb-2 mx-auto text-primary" />
                <div className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  Specific Agent
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Personal touch
                </div>
              </button>
            </div>
            {senderIdentity === 'agent' && (
              <input
                type="text"
                placeholder="Enter agent name..."
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>

          {/* Email Content */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Email Content
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => insertTag('first_name')}
                  className="px-3 py-1.5 text-xs bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-all"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  + first_name
                </button>
                <button
                  onClick={() => insertTag('listing_name')}
                  className="px-3 py-1.5 text-xs bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-all"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  + listing_name
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">
                  Subject Line
                </label>
                <input
                  type="text"
                  placeholder="Enter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">
                  Email Body
                </label>
                <textarea
                  placeholder="Enter email body... Use {{first_name}} and {{listing_name}} for personalization"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handlePreview}
            disabled={eligibleRecipients.length === 0}
            className="w-full px-6 py-4 bg-accent text-accent-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}
          >
            <Send className="w-5 h-5" />
            Preview & Send
          </button>
        </div>
      </div>
    </div>
  );
}
