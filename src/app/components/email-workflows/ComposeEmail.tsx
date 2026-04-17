import { useState } from "react";
import { Send, Plus, Trash2, Check } from "lucide-react";
import type { Segment } from "@/app/types";
import { store } from "@/app/data/store";
import { sampleTemplates } from "./campaign/campaign-data";
import { useAppData } from "@/app/contexts/AppDataContext";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// New Interface for Multi-Reminders
interface Reminder {
  id: string;
  type: string;
  dueDate: string;
  objective: string;
  vmScript?: string;
}

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toDateInputValue(d);
}

function default14DayCadence(): Reminder[] {
  const today = new Date();
  return [
    {
      id: "cadence-0",
      type: "Call",
      dueDate: addDays(today, 0),
      objective: "Introduce yourself, confirm the contact received the opening email, and explain the next step",
      vmScript: "Hi {{first_name}}, this is [Name] from LoanBud. I just sent you an email about your listing — please give me a call back at [phone]. Looking forward to connecting!",
    },
    {
      id: "cadence-3",
      type: "Call",
      dueDate: addDays(today, 3),
      objective: "Explain which documents are needed and how to upload them in LoanBud",
      vmScript: "Hi {{first_name}}, following up on my last call. Please check the email I sent — it has the document details. Call me back at [phone].",
    },
    {
      id: "cadence-7",
      type: "Call",
      dueDate: addDays(today, 7),
      objective: "Re-state action needed and confirm commitment date",
      vmScript: "Hi {{first_name}}, just a quick check-in on your listing. Give me a call at [phone] — I can help you get this moving quickly.",
    },
    {
      id: "cadence-14",
      type: "Call",
      dueDate: addDays(today, 14),
      objective: "Final follow-up — close the loop and confirm next steps or conclude the sequence",
      vmScript: "Hi {{first_name}}, this is my final follow-up regarding your listing. Please call me at [phone] — I'd love to help you move forward.",
    },
  ];
}

const STEPS = ["Setup Content", "Schedule Tasks", "Review & Send"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const active = num === current;
        const done = num < current;
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                  active || done
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : num}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  active
                    ? "font-semibold text-foreground"
                    : done
                      ? "text-primary"
                      : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 mb-5 transition-colors ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ComposeEmail() {
  const { contacts, handleCompose } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedSegmentId: string = (location.state as { segmentId?: string } | null)?.segmentId ?? "";

  const onSend = (params: Parameters<typeof handleCompose>[0]) => {
    handleCompose(params);
    navigate("/email-workflows/history");
  };
  const onCancel = () => navigate(-1);

  const segments: Segment[] = store.segments.read();

  // 1. Unified State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSegmentId, setSelectedSegmentId] =
    useState(preSelectedSegmentId);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [senderIdentity, setSenderIdentity] = useState<"brand" | "agent">(
    "brand",
  );
  const [agentName, setAgentName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showBodyPreview, setShowBodyPreview] = useState(false);

  // 2. Multi-Reminder State — pre-populated with 14-day cadence
  const [reminders, setReminders] = useState<Reminder[]>(default14DayCadence);

  // Logic Helpers
  const addReminder = () => {
    setReminders([
      ...reminders,
      { id: Date.now().toString(), type: "Call", dueDate: "", objective: "" },
    ]);
  };

  const removeReminder = (id: string) => {
    if (reminders.length > 1)
      setReminders(reminders.filter((r) => r.id !== id));
  };

  const updateReminder = (id: string, field: keyof Reminder, value: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

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

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId);
  const eligibleRecipients = contacts.filter((c) => !c.optedOut);
  const optedOutCount = contacts.filter((c) => c.optedOut).length;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <h2 className="text-2xl font-semibold mb-4">New Campaign</h2>
        <StepIndicator current={step} />
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">

          {/* STEP 1: SEGMENT + CONTENT */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Segment & Template */}
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">
                      1. Select User Segment
                    </label>
                    <Select
                      value={selectedSegmentId}
                      onValueChange={setSelectedSegmentId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a segment..." />
                      </SelectTrigger>
                      <SelectContent>
                        {segments.map((seg) => (
                          <SelectItem key={seg.id} value={seg.id}>
                            {seg.name} ({seg.contactCount.toLocaleString()} contacts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">
                      2. Quick Templates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleTemplates.map((tpl, idx) => {
                        const isSelected = selectedTemplateId === String(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleTemplateSelect(idx)}
                            className={`relative p-3 text-left border-2 rounded-lg text-xs transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2">
                                <Check className="w-3.5 h-3.5 text-primary" />
                              </span>
                            )}
                            <p className="font-semibold pr-4">{tpl.name}</p>
                            <p className="text-muted-foreground mt-0.5 truncate">
                              {tpl.subject}
                            </p>
                            <div className="flex gap-1 mt-1.5">
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 border-blue-200"
                              >
                                {tpl.category}
                              </Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Sender Identity & Editor */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold">
                    3. Email Content
                  </label>

                  {/* Sender toggle */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={senderIdentity === "brand" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSenderIdentity("brand")}
                    >
                      Brand Voice
                    </Button>
                    <Button
                      size="sm"
                      variant={senderIdentity === "agent" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSenderIdentity("agent")}
                    >
                      Specific Agent
                    </Button>
                  </div>

                  {senderIdentity === "agent" && (
                    <Input
                      placeholder="Agent name..."
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                    />
                  )}

                  <Input
                    placeholder="Subject line..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="font-medium"
                  />

                  <div className="grid gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Body</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[11px] font-mono text-primary"
                          onClick={() => insertTag("first_name")}
                        >
                          + first_name
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[11px] font-mono text-primary"
                          onClick={() => insertTag("listing_name")}
                        >
                          + listing_name
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      rows={9}
                      placeholder="Email body..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedSegmentId || !subject.trim()}
                >
                  Next: Configure Tasks →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: MULTI-REMINDERS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Follow-up Tasks</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addReminder}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </Button>
              </div>

              <div className="space-y-3">
                {reminders.map((reminder, idx) => (
                  <div
                    key={reminder.id}
                    className="p-5 border border-border rounded-xl bg-card shadow-sm relative group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Task {idx + 1}
                        </span>
                        {reminder.dueDate && (() => {
                          const today = new Date(); today.setHours(0,0,0,0);
                          const due = new Date(reminder.dueDate + "T00:00:00");
                          const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
                          return diff >= 0 ? (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Day {diff}</span>
                          ) : null;
                        })()}
                      </div>
                      {reminders.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeReminder(reminder.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="grid gap-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                          Type
                        </label>
                        <Select
                          value={reminder.type}
                          onValueChange={(v) =>
                            updateReminder(reminder.id, "type", v)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Voicemail">Voicemail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                          Due Date
                        </label>
                        <Input
                          type="date"
                          className="h-9"
                          value={reminder.dueDate}
                          onChange={(e) =>
                            updateReminder(reminder.id, "dueDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                          {reminder.type === "Email" ? "Email Objective" : "Call Objective"}
                        </label>
                        <Input
                          className="h-9"
                          placeholder="e.g. Check receipt"
                          value={reminder.objective}
                          onChange={(e) =>
                            updateReminder(reminder.id, "objective", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    {(reminder.type === "Call" || reminder.type === "Voicemail") && (
                      <div className="grid gap-1.5 mt-3">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                          Voicemail Script <span className="normal-case tracking-normal text-muted-foreground/60">(optional — shown to agent if no answer)</span>
                        </label>
                        <Textarea
                          rows={2}
                          placeholder="e.g. Hi {{first_name}}, this is [Name] from LoanBud — please give me a call back at [phone]."
                          value={reminder.vmScript ?? ""}
                          onChange={(e) =>
                            updateReminder(reminder.id, "vmScript", e.target.value)
                          }
                          className="resize-none text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next: Review →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SEND */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review & Send</h3>

              <div className="bg-card border border-border rounded-xl divide-y overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-muted/40">
                  <span className="text-sm font-semibold">Campaign Summary</span>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 text-sm items-center">
                  <span className="text-muted-foreground">Target Segment</span>
                  <span className="col-span-2 font-medium">
                    {selectedSegment?.name}
                    <span className="text-muted-foreground font-normal ml-2">
                      ({selectedSegment?.contactCount.toLocaleString()} contacts)
                    </span>
                  </span>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 text-sm items-center">
                  <span className="text-muted-foreground">Eligible</span>
                  <div className="col-span-2 flex gap-2">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {eligibleRecipients.length} eligible
                    </Badge>
                    <Badge className="bg-red-100 text-red-600 border-red-200">
                      {optedOutCount} opted out
                    </Badge>
                  </div>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 text-sm items-start">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="col-span-2 font-medium">{subject}</span>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 text-sm items-start">
                  <span className="text-muted-foreground">Sender</span>
                  <span className="col-span-2">
                    {senderIdentity === "brand" ? "LoanBud Brand" : `Agent: ${agentName}`}
                  </span>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 text-sm items-start">
                  <span className="text-muted-foreground">Tasks</span>
                  <div className="col-span-2 space-y-1">
                    {reminders.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant="outline">{r.type}</Badge>
                        <span>due {r.dueDate || "—"}</span>
                        {r.objective && (
                          <span className="text-muted-foreground italic truncate">
                            "{r.objective}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Email Body Preview</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setShowBodyPreview((v) => !v)}
                    >
                      {showBodyPreview ? "Hide" : "Show"}
                    </Button>
                  </div>
                  {showBodyPreview && (
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 rounded-lg p-3 max-h-48 overflow-auto text-foreground">
                      {body}
                    </pre>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-semibold shadow px-6"
                  onClick={() =>
                    onSend({
                      reminders,
                      subject,
                      body,
                      segmentId: selectedSegmentId,
                      segmentName: selectedSegment?.name,
                      recipients: eligibleRecipients,
                      senderIdentity:
                        senderIdentity === "brand" ? "Brand" : agentName,
                      campaignName: `${selectedSegment?.name} - ${new Date().toLocaleDateString()}`,
                    })
                  }
                >
                  <Send className="w-4 h-4" />
                  Confirm & Send to {eligibleRecipients.length} contacts
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
