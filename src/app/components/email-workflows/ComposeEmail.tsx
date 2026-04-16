import { useState } from "react";
import { Send, Users, ChevronRight } from "lucide-react";
import type { Contact, Segment } from "@/app/types";
import { store } from "@/app/data/store";
import { sampleTemplates } from "./campaign/campaign-data";
import type { ComposeSubmitParams } from "./campaign/types";

interface ComposeEmailProps {
  contacts: Contact[];
  preSelectedSegmentId?: string;
  onSend: (params: ComposeSubmitParams) => void;
  onCancel: () => void;
}

const STEPS = ["Select Recipients", "Email Content", "Follow-up Reminder", "Review & Send"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const active = num === current;
        const done = num < current;
        return (
          <div key={num} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {num}
              </div>
              <span
                className={`text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ComposeEmail({
  contacts,
  preSelectedSegmentId = "",
  onSend,
  onCancel,
}: ComposeEmailProps) {
  const segments: Segment[] = store.segments.read();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSegmentId, setSelectedSegmentId] = useState(preSelectedSegmentId);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [senderIdentity, setSenderIdentity] = useState<"brand" | "agent">("brand");
  const [agentName, setAgentName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [followUpTaskType, setFollowUpTaskType] = useState("Call");
  const [followUpDueDate, setFollowUpDueDate] = useState("");
  const [followUpObjective, setFollowUpObjective] = useState("");
  const [followUpVmScript, setFollowUpVmScript] = useState("");

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId);
  const eligibleRecipients = contacts.filter((c) => !c.optedOut);
  const optedOutCount = contacts.filter((c) => c.optedOut).length;

  const previewContacts = contacts.slice(0, 5);

  const insertTag = (tag: string) => {
    setBody((prev) => prev + `{{${tag}}}`);
  };

  const handleTemplateSelect = (idx: number) => {
    const tpl = sampleTemplates[idx];
    setSelectedTemplateId(String(idx));
    setSubject(tpl.subject);
    setBody(tpl.body);
    setSenderIdentity(tpl.senderType);
  };

  const handleSend = () => {
    const segment = selectedSegment!;
    const today = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const campaignName = `${segment.name} – ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const tpl = selectedTemplateId !== "" ? sampleTemplates[Number(selectedTemplateId)] : null;

    onSend({
      recipients: eligibleRecipients,
      subject,
      body,
      senderIdentity: senderIdentity === "brand" ? "LoanBud Brand" : `Agent: ${agentName}`,
      segmentId: selectedSegmentId,
      segmentName: segment.name,
      templateId: selectedTemplateId || "custom",
      templateName: tpl ? tpl.name : "Custom",
      campaignName,
      followUp: {
        taskType: followUpTaskType,
        dueDate: new Date(followUpDueDate),
        objective: followUpObjective,
        vmScript: followUpVmScript,
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <h2
          className="text-3xl mb-1"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          New Campaign
        </h2>
        <p className="text-muted-foreground text-sm">
          Step {step} of 4 — {STEPS[step - 1]}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <StepIndicator current={step} />

          {/* Step 1 — Select Recipients */}
          {step === 1 && (
            <div className="space-y-4">
              <h3
                className="text-lg"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Select a Segment
              </h3>
              <div className="space-y-2">
                {segments.map((seg) => (
                  <div
                    key={seg.id}
                    onClick={() => setSelectedSegmentId(seg.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSegmentId === seg.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-primary" />
                        <span
                          className="font-medium"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {seg.name}
                        </span>
                      </div>
                      <span
                        className="text-sm px-2 py-0.5 bg-muted rounded-full"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {seg.contactCount.toLocaleString()} contacts
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSegmentId && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                    <span
                      className="text-sm font-semibold"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Contact Preview (first 5)
                    </span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-700">
                        Eligible: {eligibleRecipients.length}
                      </span>
                      <span className="text-red-600">
                        Opted out: {optedOutCount}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {previewContacts.map((c) => (
                      <div
                        key={c.id}
                        className="px-4 py-3 flex items-center justify-between text-sm"
                      >
                        <span>
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="text-muted-foreground">{c.email}</span>
                        {c.optedOut && (
                          <span className="text-xs text-red-500 ml-2">
                            opted out
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={onCancel}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedSegmentId}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Email Content */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Template picker */}
              <div>
                <h3
                  className="text-lg mb-3"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Choose a Template
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {sampleTemplates.map((tpl, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleTemplateSelect(idx)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplateId === String(idx)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div
                        className="font-medium text-sm mb-2"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {tpl.name}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {tpl.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                          {tpl.senderType === "brand" ? "Brand" : "Agent"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sender Identity */}
              <div>
                <h3
                  className="text-base mb-3 font-semibold"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Sender Identity
                </h3>
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => setSenderIdentity("brand")}
                    className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                      senderIdentity === "brand"
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    Brand Voice
                  </button>
                  <button
                    onClick={() => setSenderIdentity("agent")}
                    className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                      senderIdentity === "agent"
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    Specific Agent
                  </button>
                </div>
                {senderIdentity === "agent" && (
                  <input
                    type="text"
                    placeholder="Agent name..."
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                )}
              </div>

              {/* Subject + Body */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject..."
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-muted-foreground">
                      Email Body
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => insertTag("first_name")}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded hover:bg-primary/20 transition-all"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        + first_name
                      </button>
                      <button
                        onClick={() => insertTag("listing_name")}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded hover:bg-primary/20 transition-all"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        + listing_name
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    placeholder="Email body..."
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!subject.trim() || !body.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Follow-up Reminder */}
          {step === 3 && (
            <div className="space-y-6">
              <h3
                className="text-lg"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Configure Follow-up Reminder
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Task Type
                  </label>
                  <select
                    value={followUpTaskType}
                    onChange={(e) => setFollowUpTaskType(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Voicemail">Voicemail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={followUpDueDate}
                    onChange={(e) => setFollowUpDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Call Objective <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={followUpObjective}
                    onChange={(e) => setFollowUpObjective(e.target.value)}
                    placeholder="e.g. Confirm receipt of email, discuss listing options..."
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>

                {(followUpTaskType === "Call" || followUpTaskType === "Voicemail") && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      VM Script{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={followUpVmScript}
                      onChange={(e) => setFollowUpVmScript(e.target.value)}
                      rows={4}
                      placeholder="Hi {{first_name}}, this is [Name] from LoanBud..."
                      className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!followUpDueDate || !followUpObjective.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Review & Send */}
          {step === 4 && (
            <div className="space-y-6">
              <h3
                className="text-lg"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Review & Send
              </h3>

              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                <div className="px-5 py-4 flex items-start justify-between">
                  <span className="text-sm text-muted-foreground w-36">
                    Segment
                  </span>
                  <span className="text-sm flex-1 font-medium">
                    {selectedSegment?.name}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({selectedSegment?.contactCount.toLocaleString()} contacts)
                    </span>
                  </span>
                </div>
                <div className="px-5 py-4 flex items-start justify-between">
                  <span className="text-sm text-muted-foreground w-36">
                    Eligible
                  </span>
                  <span className="text-sm flex-1">
                    <span className="text-green-700 font-medium">
                      {eligibleRecipients.length} eligible
                    </span>{" "}
                    /{" "}
                    <span className="text-red-500">
                      {optedOutCount} opted out
                    </span>
                  </span>
                </div>
                <div className="px-5 py-4 flex items-start justify-between">
                  <span className="text-sm text-muted-foreground w-36">
                    Template
                  </span>
                  <span className="text-sm flex-1 font-medium">
                    {selectedTemplateId !== ""
                      ? sampleTemplates[Number(selectedTemplateId)].name
                      : "Custom"}
                  </span>
                </div>
                <div className="px-5 py-4 flex items-start justify-between">
                  <span className="text-sm text-muted-foreground w-36">
                    Subject
                  </span>
                  <span className="text-sm flex-1">{subject}</span>
                </div>
                <div className="px-5 py-4 flex items-start justify-between">
                  <span className="text-sm text-muted-foreground w-36">
                    Sender
                  </span>
                  <span className="text-sm flex-1">
                    {senderIdentity === "brand"
                      ? "LoanBud Brand"
                      : `Agent: ${agentName}`}
                  </span>
                </div>
                <div className="px-5 py-4 flex items-start justify-between">
                  <span className="text-sm text-muted-foreground w-36">
                    Follow-up
                  </span>
                  <span className="text-sm flex-1">
                    <span className="font-medium">{followUpTaskType}</span> on{" "}
                    {followUpDueDate} —{" "}
                    <span className="italic">"{followUpObjective}"</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSend}
                  className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-2 text-sm font-semibold shadow"
                >
                  <Send className="w-4 h-4" />
                  Confirm & Send to {eligibleRecipients.length} contacts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
