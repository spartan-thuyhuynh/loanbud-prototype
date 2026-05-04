import { Mail, MessageSquare, Phone, Clock, Sparkles, User, Check } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useAppData } from "../../contexts/AppDataContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionType = "email" | "sms" | "call-reminder";
type SenderIdentityValue = "brand" | "loan-officer";

export interface StepDraft {
  name: string;
  actionType: ActionType;
  templateId?: string;
  templateName?: string;
  senderIdentity?: string;
  subject?: string;
  body?: string;
  smsTemplateId?: string;
  smsTemplateName?: string;
  message?: string;
  note?: string;
  reminderDaysBefore?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const STEP_DEFAULTS: Record<ActionType | "delay", string> = {
  email: "Send Email Step",
  sms: "Send SMS Step",
  "call-reminder": "Call Reminder Step",
  delay: "Wait",
};

export const TYPE_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "email", label: "Send Email" },
  { value: "sms", label: "Send SMS" },
  { value: "call-reminder", label: "Call Reminder" },
];

export const TYPE_ICON_STYLE: Record<ActionType | "delay", string> = {
  email: "border-emerald-500 text-emerald-600",
  sms: "border-purple-400 text-purple-600",
  "call-reminder": "border-blue-400 text-blue-600",
  delay: "border-amber-400 text-amber-600",
};

export const TYPE_ICON_BG: Record<ActionType | "delay", string> = {
  email: "bg-emerald-50 text-emerald-600",
  sms: "bg-purple-50 text-purple-600",
  "call-reminder": "bg-blue-50 text-blue-600",
  delay: "bg-amber-50 text-amber-600",
};

export const TYPE_HOVER_STYLE: Record<ActionType | "delay", string> = {
  email: "hover:border-emerald-300 hover:bg-emerald-50/40",
  sms: "hover:border-purple-300 hover:bg-purple-50/40",
  "call-reminder": "hover:border-blue-300 hover:bg-blue-50/40",
  delay: "hover:border-amber-300 hover:bg-amber-50/40",
};

export const TYPE_BADGE_STYLE: Record<ActionType | "delay", string> = {
  email: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  sms: "bg-purple-50 text-purple-700 border border-purple-200",
  "call-reminder": "bg-blue-50 text-blue-700 border border-blue-200",
  delay: "bg-amber-50 text-amber-700 border border-amber-200",
};

// ─── StepTypeIcon ─────────────────────────────────────────────────────────────

export function StepTypeIcon({ type, size = "md" }: { type: ActionType | "delay"; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  if (type === "email") return <Mail className={cls} />;
  if (type === "sms") return <MessageSquare className={cls} />;
  if (type === "delay") return <Clock className={cls} />;
  return <Phone className={cls} />;
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-foreground mb-1.5 block">
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{children}</p>;
}

// ─── SenderIdentityToggle ─────────────────────────────────────────────────────

export function SenderIdentityToggle({
  value,
  onChange,
}: {
  value: SenderIdentityValue;
  onChange: (v: SenderIdentityValue) => void;
}) {
  const options: { value: SenderIdentityValue; label: string; sub: string; Icon: React.ElementType }[] = [
    { value: "brand", label: "Brand Voice", sub: "Sent as LoanBud brand", Icon: Sparkles },
    { value: "loan-officer", label: "Loan Officer", sub: "Sent as assigned agent", Icon: User },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors ${
              active
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <opt.Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className={`text-sm font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
            </div>
            {active && (
              <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── EmailPreview ─────────────────────────────────────────────────────────────

export function EmailPreview({ subject, body }: { subject: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Subject</span>
          <p className="text-sm font-medium text-foreground mt-0.5">{subject}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Body</span>
          <p className="text-sm text-foreground whitespace-pre-wrap font-mono mt-0.5 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

// ─── SmsPreview ───────────────────────────────────────────────────────────────

export function SmsPreview({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</span>
      </div>
      <div className="p-4">
        <div className="inline-block max-w-xs bg-primary text-primary-foreground rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
}

// ─── StepConfigFields ─────────────────────────────────────────────────────────

export function StepConfigFields({
  draft,
  onChange,
}: {
  draft: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
}) {
  const { adminEmailTemplates, smsTemplates } = useAppData();

  const selectedEmailTpl = adminEmailTemplates.find((t) => t.id === draft.templateId);
  const selectedSmsTpl = smsTemplates.find((t) => t.id === draft.smsTemplateId);

  const handleTypeChange = (type: ActionType) => {
    onChange({
      actionType: type,
      name: draft.name === STEP_DEFAULTS[draft.actionType] ? STEP_DEFAULTS[type] : draft.name,
    });
  };

  return (
    <div className="space-y-5">
      {/* Step name */}
      <div>
        <FieldLabel>Step Name</FieldLabel>
        <Input
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={STEP_DEFAULTS[draft.actionType]}
        />
      </div>

      {/* Type selector */}
      <div>
        <FieldLabel>Type</FieldLabel>
        <div className="flex rounded-lg border border-input overflow-hidden w-fit">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTypeChange(opt.value)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-r border-input last:border-0 transition-colors ${
                draft.actionType === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              <StepTypeIcon type={opt.value} size="sm" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Email-specific */}
      {draft.actionType === "email" && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Email Template</FieldLabel>
            <select
              value={draft.templateId ?? ""}
              onChange={(e) => {
                const tpl = adminEmailTemplates.find((t) => t.id === e.target.value);
                onChange({
                  templateId: e.target.value,
                  templateName: tpl?.name ?? "",
                  subject: tpl?.subject ?? draft.subject,
                  body: tpl?.body ?? draft.body,
                });
              }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="">— Select a template —</option>
              {adminEmailTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.category}
                </option>
              ))}
            </select>
            {selectedEmailTpl && (
              <div className="mt-3">
                <EmailPreview subject={selectedEmailTpl.subject} body={selectedEmailTpl.body} />
              </div>
            )}
          </div>
          <div>
            <FieldLabel>Sender Identity</FieldLabel>
            <SenderIdentityToggle
              value={(draft.senderIdentity as SenderIdentityValue) ?? "brand"}
              onChange={(v) => onChange({ senderIdentity: v })}
            />
          </div>
        </div>
      )}

      {/* SMS-specific */}
      {draft.actionType === "sms" && (
        <div>
          <FieldLabel>SMS Template</FieldLabel>
          <select
            value={draft.smsTemplateId ?? ""}
            onChange={(e) => {
              const tpl = smsTemplates.find((t) => t.id === e.target.value);
              onChange({
                smsTemplateId: e.target.value,
                smsTemplateName: tpl?.name ?? "",
                message: tpl?.message ?? draft.message,
              });
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="">— Select a template —</option>
            {smsTemplates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {selectedSmsTpl && (
            <div className="mt-3">
              <SmsPreview message={selectedSmsTpl.message} />
            </div>
          )}
        </div>
      )}

      {/* Call reminder-specific */}
      {draft.actionType === "call-reminder" && (
        <div>
          <FieldLabel>Remind Before</FieldLabel>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              value={draft.reminderDaysBefore ?? 1}
              onChange={(e) => onChange({ reminderDaysBefore: Math.max(0, Number(e.target.value)) })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">day(s) before this step's scheduled date</span>
          </div>
        </div>
      )}

      {/* Note / Script */}
      <div>
        <FieldLabel>Note / Script</FieldLabel>
        <Textarea
          value={draft.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="Agent notes or message content..."
          rows={3}
        />
      </div>
    </div>
  );
}
