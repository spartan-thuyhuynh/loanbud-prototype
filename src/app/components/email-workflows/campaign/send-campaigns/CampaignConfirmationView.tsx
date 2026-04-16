import { Send, AlertTriangle } from "lucide-react";
import type { Contact } from "@/app/types";
import type { SavedSegment, EmailTemplate } from "../types";

interface CampaignConfirmationViewProps {
  selectedSegment: SavedSegment | null;
  selectedTemplate: EmailTemplate;
  eligibleRecipients: Contact[];
  agentName: string;
  previewSubject: (contact: Contact) => string;
  previewBody: (contact: Contact) => string;
  onBack: () => void;
  onSend: () => void;
}

export function CampaignConfirmationView({
  selectedSegment,
  selectedTemplate,
  eligibleRecipients,
  agentName,
  previewSubject,
  previewBody,
  onBack,
  onSend,
}: CampaignConfirmationViewProps) {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-accent/10 border-2 border-accent rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3
                className="text-xl mb-3"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Confirm Campaign Send
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Segment:</span>{" "}
                  <span className="font-medium">{selectedSegment?.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Template:</span>{" "}
                  <span className="font-medium">{selectedTemplate.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Recipients:</span>{" "}
                  <span
                    className="font-medium"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {eligibleRecipients.length} contacts
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Sender Identity:
                  </span>{" "}
                  <span className="font-medium">
                    {selectedTemplate.senderType === "brand"
                      ? "LoanBud Brand"
                      : `Agent: ${agentName}`}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Call Reminders:
                  </span>{" "}
                  <span className="font-medium">
                    4 tasks will be created per contact (Days 0, 3, 7, 14)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b border-border">
            <h3
              className="text-lg"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Email Preview
            </h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">Subject:</span>
              <p
                className="text-lg mt-1"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                {eligibleRecipients[0] &&
                  previewSubject(eligibleRecipients[0])}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Example for: {eligibleRecipients[0]?.firstName}{" "}
                {eligibleRecipients[0]?.lastName}
              </p>
              <div className="whitespace-pre-wrap">
                {eligibleRecipients[0] && previewBody(eligibleRecipients[0])}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-4 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
          >
            Back to Edit
          </button>
          <button
            onClick={onSend}
            className="flex-1 px-6 py-4 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
          >
            <Send className="w-5 h-5" />
            Confirm & Send to {eligibleRecipients.length} Recipients
          </button>
        </div>
      </div>
    </div>
  );
}
