import { useState } from "react";
import { Plus, Trash2, Check, Phone, Mail, Voicemail, Pencil, Zap, Calendar, Workflow, Users, UserCircle, Tag, MessageSquare } from "lucide-react";
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
  name: string;
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
      name: "Opening Call",
      type: "Call",
      dueDate: addDays(today, 0),
      objective: "Introduce yourself, confirm the contact received the opening email, and explain the next step",
      vmScript: "Hi {{first_name}}, this is [Name] from LoanBud. I just sent you an email about your listing — please give me a call back at [phone]. Looking forward to connecting!",
    },
    {
      id: "cadence-3",
      name: "Document Follow-up",
      type: "Call",
      dueDate: addDays(today, 3),
      objective: "Explain which documents are needed and how to upload them in LoanBud",
      vmScript: "Hi {{first_name}}, following up on my last call. Please check the email I sent — it has the document details. Call me back at [phone].",
    },
    {
      id: "cadence-7",
      name: "Action Reminder",
      type: "Call",
      dueDate: addDays(today, 7),
      objective: "Re-state action needed and confirm commitment date",
      vmScript: "Hi {{first_name}}, just a quick check-in on your listing. Give me a call at [phone] — I can help you get this moving quickly.",
    },
    {
      id: "cadence-14",
      name: "Final Follow-up",
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
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] =
    useState(preSelectedSegmentId);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [senderIdentity, setSenderIdentity] = useState<"brand" | "loan-officer" | "custom">("brand");
  const [senderEmail, setSenderEmail] = useState("");
  const [customSenderName, setCustomSenderName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");


  const [channel, setChannel] = useState<"email" | "sms">("email");

  // Delivery / send-mode state
  const [sendMode, setSendMode] = useState<"now" | "scheduled" | "auto">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [triggerDelayMinutes, setTriggerDelayMinutes] = useState(0);
  const [customDelayMinutes, setCustomDelayMinutes] = useState("");

  // 2. Multi-Reminder State — pre-populated with 14-day cadence
  const [reminders, setReminders] = useState<Reminder[]>(default14DayCadence);
  const [selectedReminderId, setSelectedReminderId] = useState<string>(() => default14DayCadence()[0].id);

  // Logic Helpers
  const addReminder = () => {
    const newId = Date.now().toString();
    setReminders((prev) => [...prev, { id: newId, name: "New Task", type: "Call", dueDate: "", objective: "" }]);
    setSelectedReminderId(newId);
  };

  const removeReminder = (id: string) => {
    const filtered = reminders.filter((r) => r.id !== id);
    if (filtered.length === 0) return;
    setReminders(filtered);
    if (selectedReminderId === id) {
      const idx = reminders.findIndex((r) => r.id === id);
      const fallback = reminders[idx > 0 ? idx - 1 : 1];
      setSelectedReminderId(fallback?.id ?? filtered[0].id);
    }
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
    setSenderIdentity(tpl.senderType === "agent" ? "loan-officer" : "brand");
  };

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId);
  const eligibleRecipients = contacts.filter((c) => !c.optedOut);
  const optedOutCount = contacts.filter((c) => c.optedOut).length;

  const senderLabel =
    senderIdentity === "brand"
      ? "LoanBud Brand"
      : senderIdentity === "loan-officer"
        ? "Assigned Loan Officer"
        : customSenderName
          ? senderEmail
            ? `${customSenderName} <${senderEmail}>`
            : customSenderName
          : senderEmail || "Custom";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6 flex items-center gap-8">
        <h2 className="text-2xl font-semibold shrink-0">New Campaign</h2>
        <div className="ml-auto w-80 shrink-0">
          <StepIndicator current={step} />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-6xl mx-auto">

          {/* STEP 1: COMPOSE */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex gap-6 items-start">

                {/* LEFT PANEL — Campaign configuration */}
                <div className="w-72 shrink-0 space-y-5">

                  {/* Channel */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Channel
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={channel === "email" ? "default" : "outline"}
                        onClick={() => setChannel("email")}
                        className="gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </Button>
                      <Button
                        size="sm"
                        variant={channel === "sms" ? "default" : "outline"}
                        onClick={() => setChannel("sms")}
                        className="gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        SMS
                      </Button>
                    </div>
                    {channel === "sms" && (
                      <p className="text-xs text-muted-foreground">
                        SMS will be sent from your registered number
                      </p>
                    )}
                  </div>

                  {/* Campaign Name */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Campaign Name
                    </p>
                    <Input
                      placeholder="e.g. April Broker Outreach"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Description{" "}
                      <span className="normal-case tracking-normal font-normal text-muted-foreground/60">
                        (optional)
                      </span>
                    </p>
                    <Textarea
                      placeholder="What is this campaign for?"
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>

                  {/* Audience */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Audience
                    </p>
                    <Select
                      value={selectedSegmentId}
                      onValueChange={(id) => {
                        setSelectedSegmentId(id);
                        if (!campaignName.trim()) {
                          const seg = segments.find((s) => s.id === id);
                          if (seg) {
                            setCampaignName(
                              `${seg.name} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                            );
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a segment..." />
                      </SelectTrigger>
                      <SelectContent>
                        {segments.map((seg) => (
                          <SelectItem key={seg.id} value={seg.id}>
                            {seg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sender — email only */}
                  {channel === "email" && <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sender
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={senderIdentity === "brand" ? "default" : "outline"}
                        onClick={() => setSenderIdentity("brand")}
                      >
                        Brand Voice
                      </Button>
                      <Button
                        size="sm"
                        variant={senderIdentity === "loan-officer" ? "default" : "outline"}
                        onClick={() => setSenderIdentity("loan-officer")}
                      >
                        Loan Officer
                      </Button>
                      <Button
                        size="sm"
                        variant={senderIdentity === "custom" ? "default" : "outline"}
                        onClick={() => setSenderIdentity("custom")}
                      >
                        Custom Email
                      </Button>
                    </div>
                    {senderIdentity === "loan-officer" && (
                      <p className="text-xs text-muted-foreground">
                        Sends as each contact's assigned loan officer
                      </p>
                    )}
                    {senderIdentity === "custom" && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Display name..."
                          value={customSenderName}
                          onChange={(e) => setCustomSenderName(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Input
                          placeholder="email@example.com"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>}
                </div>

                {/* RIGHT PANEL — Email or SMS content */}
                <div className="flex-1 min-w-0 space-y-4">

                  {channel === "email" && <>
                    {/* Quick Templates */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Quick Templates
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                              <p className="text-muted-foreground mt-0.5 truncate">{tpl.subject}</p>
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

                    {/* Email compose card */}
                    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
                      {/* Subject row */}
                      <div className="flex items-center border-b border-border px-4 py-2.5">
                        <span className="w-14 text-xs font-medium text-muted-foreground shrink-0">Subj</span>
                        <div className="flex-1 min-w-0">
                          <Input
                            placeholder="Subject line..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="border-0 shadow-none h-8 focus-visible:ring-0 px-0 font-medium"
                          />
                        </div>
                      </div>

                      {/* Body area */}
                      <Textarea
                        placeholder="Email body..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="border-0 shadow-none resize-none focus-visible:ring-0 px-4 py-3 min-h-[280px] rounded-none"
                      />

                      {/* Toolbar row */}
                      <div className="flex items-center gap-1 px-3 py-2 border-t border-border bg-muted/30">
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
                  </>}

                  {channel === "sms" && <>
                    {/* SMS compose card */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Message
                      </p>
                      <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
                        <Textarea
                          placeholder="SMS message body... e.g. Hi {{first_name}}, this is LoanBud — just checking in on your listing."
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          className="border-0 shadow-none resize-none focus-visible:ring-0 px-4 py-3 min-h-[280px] rounded-none"
                        />
                        <div className="flex items-center gap-1 px-3 py-2 border-t border-border bg-muted/30">
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
                          <span className="ml-auto text-[10px] text-muted-foreground">
                            {body.length} chars
                          </span>
                        </div>
                      </div>
                    </div>
                  </>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={
                    !selectedSegmentId ||
                    !campaignName.trim() ||
                    (channel === "email" ? !subject.trim() : !body.trim())
                  }
                >
                  Next: Configure Tasks →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: MULTI-REMINDERS */}
          {step === 2 && (() => {
            const activeReminder = reminders.find((r) => r.id === selectedReminderId) ?? reminders[0];
            const getDayDiff = (dueDate: string) => {
              if (!dueDate) return null;
              const today = new Date(); today.setHours(0, 0, 0, 0);
              const due = new Date(dueDate + "T00:00:00");
              const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
              return diff >= 0 ? diff : null;
            };
            const formatDueDate = (dueDate: string) => {
              if (!dueDate) return null;
              const d = new Date(dueDate + "T00:00:00");
              return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            };
            return (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Follow-up Tasks</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      These tasks will be created for every contact in the selected segment.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addReminder} className="gap-1.5 shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    Add Task
                  </Button>
                </div>

                <div className="flex gap-4 border border-border rounded-xl overflow-hidden bg-card shadow-sm min-h-[520px]">

                  {/* Left: task list */}
                  <div className="w-48 shrink-0 border-r border-border flex flex-col">
                    {reminders.map((reminder) => {
                      const isActive = reminder.id === activeReminder.id;
                      const IconMap = { Call: Phone, Email: Mail, Voicemail: Voicemail } as const;
                      const Icon = IconMap[reminder.type as keyof typeof IconMap] ?? Phone;
                      return (
                        <button
                          key={reminder.id}
                          type="button"
                          onClick={() => setSelectedReminderId(reminder.id)}
                          className={`flex flex-col gap-1 px-4 py-3 text-left border-b border-border last:border-b-0 transition-colors ${
                            isActive ? "bg-primary/8 border-l-2 border-l-primary" : "hover:bg-muted/50"
                          }`}
                        >
                          <span className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                            {reminder.name || "Untitled"}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon className="w-3 h-3" />
                            {reminder.type}
                          </div>
                          {formatDueDate(reminder.dueDate) && (
                            <span className="text-[10px] text-muted-foreground/70">
                              {formatDueDate(reminder.dueDate)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: detail panel */}
                  <div className="flex-1 p-6 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative flex items-center group/name flex-1 min-w-0">
                          <Pencil className="absolute left-0 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within/name:text-primary transition-colors pointer-events-none shrink-0" />
                          <Input
                            value={activeReminder.name}
                            onChange={(e) => updateReminder(activeReminder.id, "name", e.target.value)}
                            placeholder="Task name..."
                            className="border-0 shadow-none pl-5 pr-0 h-9 text-base font-semibold focus-visible:ring-0 focus-visible:border-b focus-visible:border-border rounded-none"
                          />
                        </div>
                        {getDayDiff(activeReminder.dueDate) !== null && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium shrink-0">
                            Day {getDayDiff(activeReminder.dueDate)}
                          </span>
                        )}
                      </div>
                      {reminders.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => removeReminder(activeReminder.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="grid gap-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Type</label>
                        <div className="flex gap-2">
                          {([
                            { value: "Call", icon: Phone, label: "Call" },
                            { value: "Email", icon: Mail, label: "Email" },
                            { value: "Voicemail", icon: Voicemail, label: "Voicemail" },
                          ] as const).map(({ value, icon: Icon, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => updateReminder(activeReminder.id, "type", value)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                activeReminder.type === value
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Due Date</label>
                        <Input
                          type="date"
                          className="h-9"
                          value={activeReminder.dueDate}
                          onChange={(e) => updateReminder(activeReminder.id, "dueDate", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        {activeReminder.type === "Email" ? "Email Objective" : "Call Objective"}
                      </label>
                      <Input
                        className="h-9"
                        placeholder="e.g. Check receipt"
                        value={activeReminder.objective}
                        onChange={(e) => updateReminder(activeReminder.id, "objective", e.target.value)}
                      />
                    </div>

                    {(activeReminder.type === "Call" || activeReminder.type === "Voicemail") && (
                      <div className="grid gap-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                          Voicemail Script{" "}
                          <span className="normal-case tracking-normal text-muted-foreground/60">
                            (optional — shown to agent if no answer)
                          </span>
                        </label>
                        <Textarea
                          rows={3}
                          placeholder="e.g. Hi {{first_name}}, this is [Name] from LoanBud — please give me a call back at [phone]."
                          value={activeReminder.vmScript ?? ""}
                          onChange={(e) => updateReminder(activeReminder.id, "vmScript", e.target.value)}
                          className="resize-none text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                  <Button onClick={() => setStep(3)}>Next: Review →</Button>
                </div>
              </div>
            );
          })()}

          {/* STEP 3: REVIEW & SEND */}
          {step === 3 && (() => {
            const fmtDate = (d: string) => d
              ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—";
            const TaskIconMap = { Call: Phone, Email: Mail, Voicemail: Voicemail } as const;
            const typeColors: Record<string, string> = {
              Call: "bg-blue-50 text-blue-600 border-blue-100",
              Email: "bg-green-50 text-green-600 border-green-100",
              Voicemail: "bg-amber-50 text-amber-600 border-amber-100",
            };
            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Review & Send</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {reminders.length} follow-up task{reminders.length !== 1 ? "s" : ""} · {eligibleRecipients.length} recipients
                    {sendMode === "auto" && triggerDelayMinutes > 0 && ` · +${triggerDelayMinutes} min delay`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-5 items-stretch">

                  {/* Left column */}
                  <div className="space-y-4">

                    {/* Campaign stat strip */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign</span>
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Ready</span>
                      </div>
                      <div className="divide-y divide-border">
                        <div className="flex items-start gap-3 px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
                            <Pencil className="w-3 h-3" />
                            Name
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{campaignName || "—"}</p>
                            {campaignDescription && (
                              <p className="text-xs text-muted-foreground mt-0.5">{campaignDescription}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24 shrink-0">
                            <Tag className="w-3 h-3" />
                            Segment
                          </div>
                          <p className="text-sm font-semibold">{selectedSegment?.name ?? "—"}</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24 shrink-0">
                            <Users className="w-3 h-3" />
                            Recipients
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{eligibleRecipients.length} eligible</span>
                            {optedOutCount > 0 && (
                              <span className="text-xs text-red-500">{optedOutCount} opted out</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24 shrink-0">
                            {channel === "sms" ? <MessageSquare className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                            Channel
                          </div>
                          <p className="text-sm font-semibold capitalize">{channel}</p>
                        </div>
                        {channel === "email" && (
                          <div className="flex items-center gap-3 px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24 shrink-0">
                              <UserCircle className="w-3 h-3" />
                              Sender
                            </div>
                            <p className="text-sm font-semibold">{senderLabel}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tasks timeline card */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Follow-up Tasks</span>
                        <span className="text-xs text-muted-foreground">{reminders.length} tasks</span>
                      </div>
                      <div className={`px-5 py-4 space-y-0 ${reminders.length > 4 ? "max-h-72 overflow-y-auto" : ""}`}>
                        {reminders.map((r, idx) => {
                          const TaskIcon = TaskIconMap[r.type as keyof typeof TaskIconMap] ?? Phone;
                          const colorClass = typeColors[r.type] ?? "bg-muted text-muted-foreground border-border";
                          const isLast = idx === reminders.length - 1;
                          return (
                            <div key={r.id} className="flex gap-3">
                              {/* Timeline spine */}
                              <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs shrink-0 ${colorClass}`}>
                                  <TaskIcon className="w-3.5 h-3.5" />
                                </div>
                                {!isLast && <div className="w-px flex-1 my-1 bg-border" />}
                              </div>
                              {/* Content */}
                              <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-4"}`}>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-medium">{r.name || "Untitled"}</span>
                                  {r.dueDate && (
                                    <span className="text-xs text-muted-foreground shrink-0">{fmtDate(r.dueDate)}</span>
                                  )}
                                </div>
                                {r.objective && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.objective}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right column: message preview */}
                  <div>
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {channel === "sms" ? "SMS Preview" : "Email Preview"}
                        </span>
                        {channel === "email" && (
                          <span className="text-xs text-muted-foreground">{senderLabel}</span>
                        )}
                      </div>

                      {channel === "email" && <>
                        {/* Email chrome */}
                        <div className="px-5 pt-4 pb-3 border-b border-border space-y-2.5">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">LB</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="text-sm font-semibold">{senderLabel}</p>
                                <span className="text-xs text-muted-foreground shrink-0">to {selectedSegment?.name ?? "segment"}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{subject || <span className="italic">No subject</span>}</p>
                            </div>
                          </div>
                        </div>
                        {/* Subject line */}
                        <div className="px-5 pt-3 pb-1">
                          <p className="text-sm font-semibold">{subject || <span className="text-muted-foreground italic">No subject</span>}</p>
                        </div>
                        {/* Body */}
                        <div className="px-5 pb-5 flex-1 overflow-auto min-h-72">
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {body || <span className="text-muted-foreground italic">No body</span>}
                          </p>
                        </div>
                      </>}

                      {channel === "sms" && <>
                        {/* SMS phone mockup */}
                        <div className="flex flex-col items-center justify-center flex-1 px-8 py-8 gap-4">
                          <div className="w-full max-w-xs bg-muted/40 rounded-2xl border border-border p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b border-border">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Text Message · {selectedSegment?.name ?? "segment"}</span>
                            </div>
                            <div className="flex justify-end">
                              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                                <p className="text-sm whitespace-pre-wrap leading-snug">
                                  {body || <span className="italic opacity-60">No message</span>}
                                </p>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-right">
                              {body.length} chars · ~{Math.ceil(body.length / 160)} SMS segment{Math.ceil(body.length / 160) !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </>}
                    </div>
                  </div>
                </div>

                {/* Delivery card */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery</span>
                    {sendMode === "now" && (
                      <span className="text-xs text-muted-foreground">Ready to send</span>
                    )}
                    {sendMode === "scheduled" && scheduleDate && (
                      <span className="text-xs text-blue-600 font-medium">
                        Scheduled for {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {scheduleTime}
                      </span>
                    )}
                    {sendMode === "auto" && (
                      <span className="text-xs text-purple-600 font-medium">
                        Active on segment entry{triggerDelayMinutes > 0 ? ` · +${triggerDelayMinutes} min` : ""}
                      </span>
                    )}
                  </div>

                  <div className="p-4 grid grid-cols-3 gap-3">
                    {/* Send Now tile */}
                    <button
                      type="button"
                      onClick={() => setSendMode("now")}
                      className={`relative flex flex-col items-start gap-2.5 rounded-xl border-2 p-4 text-left transition-all ${
                        sendMode === "now"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      {sendMode === "now" && (
                        <span className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </span>
                      )}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${sendMode === "now" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">Send Now</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Deliver immediately to all eligible contacts</p>
                      </div>
                    </button>

                    {/* Schedule tile */}
                    <button
                      type="button"
                      onClick={() => setSendMode("scheduled")}
                      className={`relative flex flex-col items-start gap-2.5 rounded-xl border-2 p-4 text-left transition-all ${
                        sendMode === "scheduled"
                          ? "border-blue-500 bg-blue-50/60 shadow-sm"
                          : "border-border hover:border-blue-300 hover:bg-muted/30"
                      }`}
                    >
                      {sendMode === "scheduled" && (
                        <span className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${sendMode === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">Schedule</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Choose a future date and time to send</p>
                      </div>
                    </button>

                    {/* Auto tile */}
                    <button
                      type="button"
                      onClick={() => setSendMode("auto")}
                      className={`relative flex flex-col items-start gap-2.5 rounded-xl border-2 p-4 text-left transition-all ${
                        sendMode === "auto"
                          ? "border-purple-500 bg-purple-50/60 shadow-sm"
                          : "border-border hover:border-purple-300 hover:bg-muted/30"
                      }`}
                    >
                      {sendMode === "auto" && (
                        <span className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${sendMode === "auto" ? "bg-purple-100 text-purple-600" : "bg-muted text-muted-foreground"}`}>
                        <Workflow className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">Auto-trigger</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Send when a contact enters this segment</p>
                      </div>
                    </button>
                  </div>

                  {/* Auto-trigger delay picker */}
                  {sendMode === "auto" && (
                    <div className="px-4 pb-4 border-t border-purple-100">
                      <div className="mt-3 flex items-center gap-2 bg-purple-50/80 rounded-lg px-4 py-3 flex-wrap">
                        <Workflow className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="text-xs font-medium text-purple-700 shrink-0">Delay after entry:</span>
                        {([
                          { label: "Immediately", value: 0 },
                          { label: "+15 min", value: 15 },
                          { label: "+30 min", value: 30 },
                          { label: "+1 hr", value: 60 },
                        ] as const).map(({ label, value }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => { setTriggerDelayMinutes(value); setCustomDelayMinutes(""); }}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              triggerDelayMinutes === value && customDelayMinutes === ""
                                ? "bg-purple-600 text-white"
                                : "bg-white border border-purple-200 text-purple-700 hover:bg-purple-100"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                        <div className="flex items-center gap-1.5 ml-1">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Custom"
                            value={customDelayMinutes}
                            onChange={(e) => {
                              setCustomDelayMinutes(e.target.value);
                              const n = parseInt(e.target.value, 10);
                              if (!isNaN(n) && n > 0) setTriggerDelayMinutes(n);
                            }}
                            className="h-7 w-20 text-xs border-purple-200 bg-white focus-visible:ring-purple-300"
                          />
                          <span className="text-xs text-purple-600">min</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedule date/time picker — shown inline below tiles */}
                  {sendMode === "scheduled" && (
                    <div className="px-4 pb-4 border-t border-blue-100">
                      <div className="mt-3 flex items-center gap-3 bg-blue-50/80 rounded-lg px-4 py-3">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-xs font-medium text-blue-700 shrink-0">Send on</span>
                        <Input
                          type="date"
                          className="h-8 w-40 text-sm border-blue-200 bg-white focus-visible:ring-blue-300"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                        />
                        <span className="text-xs text-blue-500 shrink-0">at</span>
                        <Input
                          type="time"
                          className="h-8 w-28 text-sm border-blue-200 bg-white focus-visible:ring-blue-300"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                        {!scheduleDate && (
                          <span className="text-xs text-blue-400 italic">— pick a date to continue</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                  <Button
                    className={`gap-2 font-semibold shadow px-6 ${
                      sendMode === "scheduled"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : sendMode === "auto"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-accent text-accent-foreground hover:bg-accent/90"
                    }`}
                    disabled={sendMode === "scheduled" && !scheduleDate}
                    onClick={() =>
                      onSend({
                        reminders,
                        subject,
                        body,
                        segmentId: selectedSegmentId,
                        segmentName: selectedSegment?.name,
                        recipients: eligibleRecipients,
                        senderIdentity: senderLabel,
                        campaignName: campaignName.trim() || `${selectedSegment?.name} - ${new Date().toLocaleDateString()}`,
                        campaignDescription: campaignDescription.trim() || undefined,
                        sendMode,
                        scheduledAt: sendMode === "scheduled"
                          ? new Date(`${scheduleDate}T${scheduleTime}`)
                          : null,
                        channel,
                        triggerDelayMinutes: sendMode === "auto" ? triggerDelayMinutes : undefined,
                      })
                    }
                  >
                    {sendMode === "now" && <><Zap className="w-4 h-4" />Confirm & Send to {eligibleRecipients.length} contacts</>}
                    {sendMode === "scheduled" && <><Calendar className="w-4 h-4" />Schedule Campaign</>}
                    {sendMode === "auto" && <><Workflow className="w-4 h-4" />Activate Auto Campaign</>}
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
