import { Mail, MessageSquare, Phone, Clock } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useAppData } from "../../contexts/AppDataContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionType = "email" | "sms" | "call-reminder";

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
  email: "border-blue-400 text-blue-600",
  sms: "border-violet-400 text-violet-600",
  "call-reminder": "border-amber-400 text-amber-600",
  delay: "border-border text-muted-foreground",
};

export const TYPE_ICON_BG: Record<ActionType | "delay", string> = {
  email: "bg-blue-100 text-blue-600",
  sms: "bg-violet-100 text-violet-600",
  "call-reminder": "bg-amber-100 text-amber-600",
  delay: "bg-muted text-muted-foreground",
};

export const TYPE_HOVER_STYLE: Record<ActionType | "delay", string> = {
  email: "hover:border-blue-300 hover:bg-blue-50/40",
  sms: "hover:border-violet-300 hover:bg-violet-50/40",
  "call-reminder": "hover:border-amber-300 hover:bg-amber-50/40",
  delay: "hover:border-border hover:bg-muted/40",
};

export const TYPE_BADGE_STYLE: Record<ActionType | "delay", string> = {
  email: "bg-blue-50 text-blue-700 border border-blue-200",
  sms: "bg-violet-50 text-violet-700 border border-violet-200",
  "call-reminder": "bg-amber-50 text-amber-700 border border-amber-200",
  delay: "bg-muted text-muted-foreground border border-border",
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

// ─── StepConfigLeft ───────────────────────────────────────────────────────────

export function StepConfigLeft({
  draft,
  onChange,
}: {
  draft: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
}) {
  const { senderIdentities } = useAppData();

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

      {/* Sender Identity (email only) */}
      {draft.actionType === "email" && (
        <div>
          <FieldLabel>Sender Identity</FieldLabel>
          <select
            value={draft.senderIdentity ?? ""}
            onChange={(e) => onChange({ senderIdentity: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="">— Select identity —</option>
            {senderIdentities.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName} ({s.emailAddress})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Call reminder timing */}
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
            <span className="text-sm text-muted-foreground">day(s) before scheduled date</span>
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
          rows={4}
        />
      </div>
    </div>
  );
}

// ─── StepConfigRight ──────────────────────────────────────────────────────────

export function StepConfigRight({
  draft,
  onChange,
}: {
  draft: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
}) {
  const { adminEmailTemplates, smsTemplates } = useAppData();

  const selectedEmailTpl = adminEmailTemplates.find((t) => t.id === draft.templateId);
  const selectedSmsTpl = smsTemplates.find((t) => t.id === draft.smsTemplateId);

  if (draft.actionType === "email") {
    return (
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
        </div>
        {selectedEmailTpl ? (
          <EmailPreview subject={selectedEmailTpl.subject} body={selectedEmailTpl.body} />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center py-10 text-center gap-2">
            <Mail className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Select a template to preview</p>
          </div>
        )}
      </div>
    );
  }

  if (draft.actionType === "sms") {
    return (
      <div className="space-y-4">
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
        </div>
        {selectedSmsTpl ? (
          <SmsPreview message={selectedSmsTpl.message} />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center py-10 text-center gap-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Select a template to preview</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-center">
      <Phone className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">Call Reminder</p>
      <p className="text-xs text-muted-foreground/70 max-w-[180px]">A reminder will be sent to the assigned agent at the configured time.</p>
    </div>
  );
}

// ─── StepConfigFields (kept for backwards compat) ─────────────────────────────

export function StepConfigFields({
  draft,
  onChange,
}: {
  draft: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
}) {
  return (
    <div className="grid divide-x divide-border" style={{ gridTemplateColumns: '2fr 3fr' }}>
      <div className="pr-6">
        <StepConfigLeft draft={draft} onChange={onChange} />
      </div>
      <div className="pl-6">
        <StepConfigRight draft={draft} onChange={onChange} />
      </div>
    </div>
  );
}
