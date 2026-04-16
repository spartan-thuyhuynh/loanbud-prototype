import { useState, useRef, Fragment } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Mic,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Zap,
  GitBranch,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TriggerNode {
  id: string;
  nodeType: "trigger";
  label: string;
  event: "status-change" | "manual";
  status?: string;
}

interface ConditionNode {
  id: string;
  nodeType: "condition";
  label: string;
  field: string;
  operator: "==" | "!=" | ">" | "<" | "contains" | "is-empty" | "is-not-empty";
  value: string;
  trueBranch: FlowNode[];
  falseBranch: FlowNode[];
}

interface ActionNode {
  id: string;
  nodeType: "action";
  label: string;
  actionType: "email" | "call-reminder" | "sms-reminder" | "voicemail-reminder";
  delayDays: number;
  subject?: string;
  note?: string;
}

type FlowNode = TriggerNode | ConditionNode | ActionNode;

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: "standard" | "variant";
  status?: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
  nodes: FlowNode[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTION_TYPE_CONFIG = {
  email: {
    icon: Mail,
    color: "text-teal-600",
    border: "border-teal-300",
    leftBorder: "border-l-teal-400",
    badge: "bg-teal-100 text-teal-700",
    label: "Email",
  },
  "call-reminder": {
    icon: Phone,
    color: "text-blue-600",
    border: "border-blue-300",
    leftBorder: "border-l-blue-400",
    badge: "bg-blue-100 text-blue-700",
    label: "Call",
  },
  "sms-reminder": {
    icon: MessageSquare,
    color: "text-purple-600",
    border: "border-purple-300",
    leftBorder: "border-l-purple-400",
    badge: "bg-purple-100 text-purple-700",
    label: "SMS",
  },
  "voicemail-reminder": {
    icon: Mic,
    color: "text-amber-600",
    border: "border-amber-300",
    leftBorder: "border-l-amber-400",
    badge: "bg-amber-100 text-amber-700",
    label: "Voicemail",
  },
} as const;

function getNodeConfig(node: FlowNode) {
  if (node.nodeType === "trigger") {
    return {
      icon: Zap,
      color: "text-amber-600",
      border: "border-amber-300",
      leftBorder: "border-l-amber-400",
      badge: "bg-amber-100 text-amber-700",
      label: "Trigger",
    };
  }
  if (node.nodeType === "condition") {
    return {
      icon: GitBranch,
      color: "text-violet-600",
      border: "border-violet-300",
      leftBorder: "border-l-violet-400",
      badge: "bg-violet-100 text-violet-700",
      label: "Condition",
    };
  }
  return ACTION_TYPE_CONFIG[node.actionType];
}

function generateId() {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const initialWorkflows: Workflow[] = [
  {
    id: "active-workflow",
    name: "Active Workflow",
    description: "Multi-step engagement sequence for active applications across all active statuses.",
    type: "standard",
    active: true,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "aw-trig", nodeType: "trigger", label: "Workflow Start", event: "manual" },
      { id: "aw-a0", nodeType: "action", label: "Welcome Email", actionType: "email", delayDays: 0, subject: "Welcome to LoanBud" },
      { id: "aw-a1", nodeType: "action", label: "Intro Call", actionType: "call-reminder", delayDays: 1, note: "Introduce yourself and confirm next steps." },
      { id: "aw-a3", nodeType: "action", label: "Day 3 Follow-up", actionType: "email", delayDays: 3, subject: "Checking In" },
      { id: "aw-a5", nodeType: "action", label: "Check-in Call", actionType: "call-reminder", delayDays: 5, note: "Check progress and answer questions." },
      { id: "aw-a7", nodeType: "action", label: "Mid-Sequence Email", actionType: "email", delayDays: 7, subject: "Mid-Sequence Update" },
      { id: "aw-a10", nodeType: "action", label: "SMS Nudge", actionType: "sms-reminder", delayDays: 10, note: "Quick reminder to take action." },
      { id: "aw-a14", nodeType: "action", label: "Final Follow-up Email", actionType: "email", delayDays: 14, subject: "Final Follow-up" },
      { id: "aw-a17", nodeType: "action", label: "Last Attempt Call", actionType: "call-reminder", delayDays: 17, note: "Final outreach before sequence ends." },
    ],
  },
  {
    id: "new-variant",
    name: "New",
    description: "Onboarding sequence triggered when a borrower's status changes to New.",
    type: "variant",
    status: "New",
    active: true,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "new-trig", nodeType: "trigger", label: "Status → New", event: "status-change", status: "New" },
      { id: "new-a0", nodeType: "action", label: "Claim Your Listing", actionType: "email", delayDays: 0, subject: "Welcome — Claim Your Listing Today", note: "Introduce LoanBud and invite them to claim their listing." },
      {
        id: "new-cond1",
        nodeType: "condition",
        label: "Check Contact Method",
        field: "hasEmail",
        operator: "==",
        value: "true",
        trueBranch: [
          { id: "new-yes-a1", nodeType: "action", label: "Getting Started Guide", actionType: "email", delayDays: 1, subject: "Here's How to Get Started", note: "Send guide on uploading documents." },
          { id: "new-yes-a3", nodeType: "action", label: "Profile Completion Email", actionType: "email", delayDays: 3, subject: "Your Profile Is Almost Ready" },
        ],
        falseBranch: [
          { id: "new-no-a1", nodeType: "action", label: "Welcome Intro Call", actionType: "call-reminder", delayDays: 1, note: "Warm welcome call. Explain the onboarding process." },
          { id: "new-no-sms", nodeType: "action", label: "SMS Prompt", actionType: "sms-reminder", delayDays: 3, note: "Hi [Name], just a quick reminder to finish your LoanBud setup!" },
        ],
      },
      { id: "new-a5", nodeType: "action", label: "Onboarding Check-in", actionType: "call-reminder", delayDays: 5, note: "Check if they have questions about onboarding." },
      { id: "new-a10", nodeType: "action", label: "SMS Nudge", actionType: "sms-reminder", delayDays: 10, note: "Quick reminder to complete your setup." },
      { id: "new-a14", nodeType: "action", label: "Final Onboarding Email", actionType: "email", delayDays: 14, subject: "Last Chance to Complete Your Profile" },
      { id: "new-a17", nodeType: "action", label: "Last Attempt Call", actionType: "call-reminder", delayDays: 17, note: "Final call to push for profile completion." },
    ],
  },
  {
    id: "draft-variant",
    name: "Draft",
    description: "Guide borrowers through document upload and application submission.",
    type: "variant",
    status: "Draft",
    active: true,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "draft-trig", nodeType: "trigger", label: "Status → Draft", event: "status-change", status: "Draft" },
      { id: "draft-a0", nodeType: "action", label: "Upload Your Documents", actionType: "email", delayDays: 0, subject: "Action Required: Upload Your Documents" },
      { id: "draft-a1", nodeType: "action", label: "Submission Assistance Call", actionType: "call-reminder", delayDays: 1, note: "Call to assist with document upload." },
      { id: "draft-a3", nodeType: "action", label: "Document Checklist", actionType: "email", delayDays: 3, subject: "Here's Your Document Checklist" },
      { id: "draft-a5", nodeType: "action", label: "Progress Check Call", actionType: "call-reminder", delayDays: 5, note: "Follow up to see if documents are ready." },
      { id: "draft-a7", nodeType: "action", label: "Submission Deadline Reminder", actionType: "email", delayDays: 7, subject: "Don't Forget to Submit Your Application" },
      { id: "draft-a10", nodeType: "action", label: "SMS Submit Reminder", actionType: "sms-reminder", delayDays: 10, note: "Your application is still in draft. Submit when ready." },
      { id: "draft-a14", nodeType: "action", label: "Final Submission Nudge", actionType: "email", delayDays: 14, subject: "Final Reminder: Submit Your Application" },
      { id: "draft-a17", nodeType: "action", label: "Last Submission Call", actionType: "call-reminder", delayDays: 17, note: "Final call to understand blockers and encourage submission." },
    ],
  },
  {
    id: "submitted-variant",
    name: "Submitted",
    description: "Review and follow-up sequence for submitted applications.",
    type: "variant",
    status: "Submitted",
    active: true,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "sub-trig", nodeType: "trigger", label: "Status → Submitted", event: "status-change", status: "Submitted" },
      { id: "sub-a0", nodeType: "action", label: "Application Received", actionType: "email", delayDays: 0, subject: "We've Received Your Application" },
      { id: "sub-a1", nodeType: "action", label: "Review Kickoff Call", actionType: "call-reminder", delayDays: 1, note: "Walk through what happens next in the review process." },
      { id: "sub-a3", nodeType: "action", label: "Missing Items Request", actionType: "email", delayDays: 3, subject: "Action Required: Missing Documents" },
      { id: "sub-a5", nodeType: "action", label: "Items Follow-up Call", actionType: "call-reminder", delayDays: 5, note: "Follow up on any missing items." },
      { id: "sub-a7", nodeType: "action", label: "Status Update Email", actionType: "email", delayDays: 7, subject: "Application Status Update" },
      { id: "sub-a10", nodeType: "action", label: "SMS Status Check", actionType: "sms-reminder", delayDays: 10, note: "Your application is under review. We'll be in touch." },
      { id: "sub-a14", nodeType: "action", label: "Review Progress Email", actionType: "email", delayDays: 14, subject: "Your Application: Next Steps" },
      { id: "sub-a17", nodeType: "action", label: "Final Review Call", actionType: "call-reminder", delayDays: 17, note: "Check in on final review status." },
    ],
  },
  {
    id: "on-hold-variant",
    name: "On Hold",
    description: "Escalation sequence for applications placed on hold.",
    type: "variant",
    status: "On Hold",
    active: false,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "hold-trig", nodeType: "trigger", label: "Status → On Hold", event: "status-change", status: "On Hold" },
      { id: "hold-a0", nodeType: "action", label: "Application On Hold", actionType: "email", delayDays: 0, subject: "Your Application Has Been Placed On Hold" },
      { id: "hold-a1", nodeType: "action", label: "Hold Explanation Call", actionType: "call-reminder", delayDays: 1, note: "Explain the hold reason and walk through resolution steps." },
      { id: "hold-a3", nodeType: "action", label: "Resolution Steps Email", actionType: "email", delayDays: 3, subject: "Steps to Resume Your Application" },
      { id: "hold-a5", nodeType: "action", label: "Hold Check-in Call", actionType: "call-reminder", delayDays: 5, note: "Check if the borrower has resolved the hold issue." },
      { id: "hold-a7", nodeType: "action", label: "Hold Status Reminder", actionType: "email", delayDays: 7, subject: "Reminder: Application Still On Hold" },
      { id: "hold-a10", nodeType: "action", label: "SMS Hold Reminder", actionType: "sms-reminder", delayDays: 10, note: "Your application is still on hold. Please contact us." },
      { id: "hold-a14", nodeType: "action", label: "Escalation Email", actionType: "email", delayDays: 14, subject: "Urgent: Application On Hold — Action Needed" },
      { id: "hold-a17", nodeType: "action", label: "Final Hold Resolution Call", actionType: "call-reminder", delayDays: 17, note: "Final call to resolve or close the application." },
    ],
  },
  {
    id: "closure-workflow",
    name: "Closure Workflow",
    description: "Short wrap-up sequence for declined or closed applications.",
    type: "standard",
    active: true,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "cw-trig", nodeType: "trigger", label: "Workflow Start", event: "manual" },
      { id: "cw-a0", nodeType: "action", label: "Outcome Notification", actionType: "email", delayDays: 0, subject: "Application Outcome" },
      { id: "cw-a1", nodeType: "action", label: "Optional Follow-up Call", actionType: "call-reminder", delayDays: 1, note: "Call to explain outcome and answer questions." },
      { id: "cw-a3", nodeType: "action", label: "Final Check-in SMS", actionType: "sms-reminder", delayDays: 3, note: "Final SMS check-in after closure." },
    ],
  },
  {
    id: "declined-variant",
    name: "Declined",
    description: "Empathetic closure sequence for declined applications.",
    type: "variant",
    status: "Declined",
    active: true,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "dec-trig", nodeType: "trigger", label: "Status → Declined", event: "status-change", status: "Declined" },
      { id: "dec-a0", nodeType: "action", label: "Decline Notification", actionType: "email", delayDays: 0, subject: "Update on Your Application" },
      { id: "dec-a1", nodeType: "action", label: "Decline Explanation Call", actionType: "call-reminder", delayDays: 1, note: "Explain the decline reason and discuss next steps." },
      { id: "dec-a3", nodeType: "action", label: "Follow-up SMS", actionType: "sms-reminder", delayDays: 3, note: "Thank you for your application. We're here if you have questions." },
    ],
  },
  {
    id: "closed-variant",
    name: "Closed",
    description: "Wrap-up sequence for closed applications.",
    type: "variant",
    status: "Closed",
    active: true,
    createdAt: "2024-01-10",
    createdBy: "Admin",
    nodes: [
      { id: "cls-trig", nodeType: "trigger", label: "Status → Closed", event: "status-change", status: "Closed" },
      { id: "cls-a0", nodeType: "action", label: "Closure Confirmation", actionType: "email", delayDays: 0, subject: "Your Application Has Been Closed" },
      { id: "cls-a1", nodeType: "action", label: "Wrap-up Call", actionType: "call-reminder", delayDays: 1, note: "Close out the relationship and gather feedback." },
      { id: "cls-a3", nodeType: "action", label: "Closure SMS", actionType: "sms-reminder", delayDays: 3, note: "Your application has been closed. Thank you for working with us." },
    ],
  },
];

// ─── Condition constants ───────────────────────────────────────────────────────

const CONDITION_FIELDS = [
  { value: "hasEmail", label: "Has Email" },
  { value: "hasPhone", label: "Has Phone" },
  { value: "daysSinceContact", label: "Days Since Contact" },
  { value: "loanAmount", label: "Loan Amount" },
  { value: "creditScore", label: "Credit Score" },
  { value: "applicationStatus", label: "Application Status" },
];

const CONDITION_OPERATORS: { value: ConditionNode["operator"]; label: string }[] = [
  { value: "==", label: "equals" },
  { value: "!=", label: "not equals" },
  { value: ">", label: "greater than" },
  { value: "<", label: "less than" },
  { value: "contains", label: "contains" },
  { value: "is-empty", label: "is empty" },
  { value: "is-not-empty", label: "is not empty" },
];

// ─── Inline Edit Forms ────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-border rounded-md px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary";

function TriggerEditForm({
  values,
  onChange,
}: {
  values: Partial<TriggerNode>;
  onChange: (v: Partial<TriggerNode>) => void;
}) {
  return (
    <>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Label</label>
        <input className={inputCls} value={values.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Event</label>
        <select className={inputCls} value={values.event ?? "manual"} onChange={(e) => onChange({ event: e.target.value as TriggerNode["event"] })}>
          <option value="manual">Manual</option>
          <option value="status-change">Status Change</option>
        </select>
      </div>
      {values.event === "status-change" && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Status</label>
          <input className={inputCls} value={values.status ?? ""} onChange={(e) => onChange({ status: e.target.value })} placeholder="e.g. New, Draft" />
        </div>
      )}
    </>
  );
}

function ConditionEditForm({
  values,
  onChange,
}: {
  values: Partial<ConditionNode>;
  onChange: (v: Partial<ConditionNode>) => void;
}) {
  const noValue = values.operator === "is-empty" || values.operator === "is-not-empty";
  return (
    <>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Label</label>
        <input className={inputCls} value={values.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Field</label>
        <select className={inputCls} value={values.field ?? ""} onChange={(e) => onChange({ field: e.target.value })}>
          <option value="">Select field…</option>
          {CONDITION_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Operator</label>
        <select className={inputCls} value={values.operator ?? "=="} onChange={(e) => onChange({ operator: e.target.value as ConditionNode["operator"] })}>
          {CONDITION_OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {!noValue && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Value</label>
          <input className={inputCls} value={values.value ?? ""} onChange={(e) => onChange({ value: e.target.value })} placeholder="Compare value" />
        </div>
      )}
    </>
  );
}

function ActionEditForm({
  values,
  onChange,
}: {
  values: Partial<ActionNode>;
  onChange: (v: Partial<ActionNode>) => void;
}) {
  return (
    <>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Label</label>
        <input className={inputCls} value={values.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Type</label>
        <select className={inputCls} value={values.actionType ?? "email"} onChange={(e) => onChange({ actionType: e.target.value as ActionNode["actionType"] })}>
          <option value="email">Email</option>
          <option value="call-reminder">Call Reminder</option>
          <option value="sms-reminder">SMS Reminder</option>
          <option value="voicemail-reminder">Voicemail Reminder</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Delay (days)</label>
        <input type="number" min={0} className={inputCls} value={values.delayDays ?? 0} onChange={(e) => onChange({ delayDays: parseInt(e.target.value) || 0 })} />
      </div>
      {values.actionType === "email" && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Subject</label>
          <input className={inputCls} value={values.subject ?? ""} onChange={(e) => onChange({ subject: e.target.value })} placeholder="Email subject" />
        </div>
      )}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Note</label>
        <textarea rows={2} className={inputCls + " resize-none"} value={values.note ?? ""} onChange={(e) => onChange({ note: e.target.value })} placeholder="Agent notes..." />
      </div>
    </>
  );
}

// ─── NodeCard ─────────────────────────────────────────────────────────────────

interface NodeCardProps {
  node: FlowNode;
  isReadOnly: boolean;
  onUpdate: (updated: FlowNode) => void;
  onDelete: () => void;
}

function getSummary(node: FlowNode): string {
  if (node.nodeType === "trigger") {
    return node.event === "manual" ? "Manual trigger" : `Status changes to "${node.status ?? "…"}"`;
  }
  if (node.nodeType === "condition") {
    const op = CONDITION_OPERATORS.find((o) => o.value === node.operator)?.label ?? node.operator;
    if (node.operator === "is-empty" || node.operator === "is-not-empty") return `${node.field} ${op}`;
    return `${node.field} ${op} "${node.value}"`;
  }
  const day = node.delayDays === 0 ? "Day 0" : `Day ${node.delayDays}`;
  if (node.subject) return `${day} · ${node.subject}`;
  if (node.note) return `${day} · ${node.note.slice(0, 50)}${node.note.length > 50 ? "…" : ""}`;
  return day;
}

function NodeCard({ node, isReadOnly, onUpdate, onDelete }: NodeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<FlowNode>>({});

  const cfg = getNodeConfig(node);
  const Icon = cfg.icon;
  const isTrigger = node.nodeType === "trigger";

  function startEdit() {
    setEditValues({ ...node });
    setIsEditing(true);
  }

  function saveEdit() {
    onUpdate({ ...node, ...editValues } as FlowNode);
    setIsEditing(false);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditValues({});
  }

  return (
    <div
      className={`relative w-full max-w-xs rounded-lg border bg-card shadow-sm transition-shadow border-l-4 ${cfg.leftBorder} ${cfg.border} ${isEditing ? "shadow-md" : "group hover:shadow-md"}`}
    >
      {/* Top-right area: badge + hover actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
        {!isReadOnly && !isEditing && (
          <>
            <button
              onClick={startEdit}
              className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {!isTrigger && (
              <button
                onClick={onDelete}
                className="p-1 rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 pr-28">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
          <p className="font-semibold text-sm leading-tight">{node.label}</p>
        </div>
        {!isEditing && <p className="text-xs text-muted-foreground mt-0.5">{getSummary(node)}</p>}
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {node.nodeType === "trigger" && (
            <TriggerEditForm
              values={editValues as Partial<TriggerNode>}
              onChange={(v) => setEditValues((prev) => ({ ...prev, ...v }))}
            />
          )}
          {node.nodeType === "condition" && (
            <ConditionEditForm
              values={editValues as Partial<ConditionNode>}
              onChange={(v) => setEditValues((prev) => ({ ...prev, ...v }))}
            />
          )}
          {node.nodeType === "action" && (
            <ActionEditForm
              values={editValues as Partial<ActionNode>}
              onChange={(v) => setEditValues((prev) => ({ ...prev, ...v }))}
            />
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={saveEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-md text-xs hover:opacity-90 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs hover:bg-muted transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AddNodeButton ────────────────────────────────────────────────────────────

function AddNodeButton({ onAdd }: { onAdd: (node: FlowNode) => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"main" | "action">("main");

  function close() {
    setOpen(false);
    setStep("main");
  }

  function handleCondition() {
    onAdd({
      id: generateId(),
      nodeType: "condition",
      label: "New Condition",
      field: "hasEmail",
      operator: "==",
      value: "true",
      trueBranch: [],
      falseBranch: [],
    });
    close();
  }

  function handleAction(actionType: ActionNode["actionType"]) {
    onAdd({
      id: generateId(),
      nodeType: "action",
      label: ACTION_TYPE_CONFIG[actionType].label + " Step",
      actionType,
      delayDays: 0,
    });
    close();
  }

  return (
    <div className="relative flex flex-col items-center z-10">
      {open ? (
        <div className="bg-card border border-border rounded-lg shadow-lg p-1.5 min-w-[160px]">
          {step === "main" ? (
            <div className="space-y-0.5">
              <button
                onClick={handleCondition}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted text-left transition-colors"
              >
                <GitBranch className="w-4 h-4 text-violet-600 flex-shrink-0" />
                Condition
              </button>
              <button
                onClick={() => setStep("action")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted text-left transition-colors"
              >
                <Plus className="w-4 h-4 text-foreground flex-shrink-0" />
                Action…
              </button>
              <button
                onClick={close}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {(Object.entries(ACTION_TYPE_CONFIG) as [ActionNode["actionType"], (typeof ACTION_TYPE_CONFIG)[keyof typeof ACTION_TYPE_CONFIG]][]).map(([type, conf]) => {
                const Ic = conf.icon;
                return (
                  <button
                    key={type}
                    onClick={() => handleAction(type)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted text-left transition-colors"
                  >
                    <Ic className={`w-4 h-4 flex-shrink-0 ${conf.color}`} />
                    {conf.label}
                  </button>
                );
              })}
              <button
                onClick={() => setStep("main")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-background"
          title="Add node"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Thin vertical connector line
function Connector() {
  return <div className="w-px h-5 bg-border mx-auto" />;
}

// ─── BranchRenderer & ConditionBranches (mutually recursive) ─────────────────

interface BranchRendererProps {
  nodes: FlowNode[];
  setNodes: (nodes: FlowNode[]) => void;
  isReadOnly: boolean;
}

function BranchRenderer({ nodes, setNodes, isReadOnly }: BranchRendererProps) {
  function handleUpdate(updated: FlowNode) {
    setNodes(nodes.map((n) => (n.id === updated.id ? updated : n)));
  }

  function handleDelete(nodeId: string) {
    setNodes(nodes.filter((n) => n.id !== nodeId));
  }

  function insertAfter(index: number, newNode: FlowNode) {
    const next = [...nodes];
    next.splice(index + 1, 0, newNode);
    setNodes(next);
  }

  function insertAtEnd(newNode: FlowNode) {
    setNodes([...nodes, newNode]);
  }

  if (nodes.length === 0) {
    if (isReadOnly) {
      return <p className="text-xs text-muted-foreground italic py-4 text-center">No nodes</p>;
    }
    return (
      <div className="flex flex-col items-center py-2">
        <Connector />
        <AddNodeButton onAdd={insertAtEnd} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Connector />
      {nodes.map((node, i) => (
        <Fragment key={node.id}>
          <NodeCard
            node={node}
            isReadOnly={isReadOnly}
            onUpdate={handleUpdate}
            onDelete={() => handleDelete(node.id)}
          />

          {node.nodeType === "condition" && (
            <ConditionBranches
              condition={node}
              onUpdate={handleUpdate}
              isReadOnly={isReadOnly}
            />
          )}

          {i < nodes.length - 1 ? (
            isReadOnly ? (
              <Connector />
            ) : (
              <>
                <Connector />
                <AddNodeButton onAdd={(n) => insertAfter(i, n)} />
                <Connector />
              </>
            )
          ) : (
            !isReadOnly && (
              <>
                <Connector />
                <AddNodeButton onAdd={insertAtEnd} />
              </>
            )
          )}
        </Fragment>
      ))}
    </div>
  );
}

function ConditionBranches({
  condition,
  onUpdate,
  isReadOnly,
}: {
  condition: ConditionNode;
  onUpdate: (updated: FlowNode) => void;
  isReadOnly: boolean;
}) {
  return (
    <div className="w-full mt-3 mb-1">
      {/* Branch header */}
      <div className="flex gap-4 px-2">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
            YES
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
            NO
          </span>
        </div>
      </div>

      {/* Branch columns */}
      <div className="flex gap-4 w-full mt-2">
        <div className="flex-1 min-w-0 border-l-2 border-emerald-200 pl-2">
          <BranchRenderer
            nodes={condition.trueBranch}
            setNodes={(nodes) => onUpdate({ ...condition, trueBranch: nodes })}
            isReadOnly={isReadOnly}
          />
        </div>
        <div className="w-px bg-border self-stretch" />
        <div className="flex-1 min-w-0 border-l-2 border-red-200 pl-2">
          <BranchRenderer
            nodes={condition.falseBranch}
            setNodes={(nodes) => onUpdate({ ...condition, falseBranch: nodes })}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}

// ─── NodeFlowEditor ───────────────────────────────────────────────────────────

interface NodeFlowEditorProps {
  workflow: Workflow;
  onBack: () => void;
  onUpdateWorkflow: (updated: Workflow) => void;
}

function NodeFlowEditor({ workflow, onBack, onUpdateWorkflow }: NodeFlowEditorProps) {
  const isStandard = workflow.type === "standard";

  function setNodes(nodes: FlowNode[]) {
    onUpdateWorkflow({ ...workflow, nodes });
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-5 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Flows
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-semibold">{workflow.name}</h2>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
              workflow.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${workflow.active ? "bg-green-500" : "bg-gray-400"}`} />
            {workflow.active ? "Active" : "Inactive"}
          </span>
          {isStandard && (
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
              Standard Template
            </span>
          )}
        </div>
        {workflow.description && (
          <p className="text-muted-foreground mt-1 text-sm">{workflow.description}</p>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8 bg-muted/20">
        <div className="max-w-2xl mx-auto pb-16">
          <BranchRenderer
            nodes={workflow.nodes}
            setNodes={setNodes}
            isReadOnly={isStandard}
          />
        </div>
      </div>
    </div>
  );
}

// ─── WorkflowList ─────────────────────────────────────────────────────────────

interface WorkflowListProps {
  workflows: Workflow[];
  onSelect: (workflow: Workflow) => void;
  onUpdateDescription: (workflowId: string, description: string) => void;
}

function WorkflowList({ workflows, onSelect, onUpdateDescription }: WorkflowListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [descValue, setDescValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit(wf: Workflow) {
    setEditingId(wf.id);
    setDescValue(wf.description);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function saveEdit(workflowId: string) {
    onUpdateDescription(workflowId, descValue);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-8 py-6">
        <h2 className="text-3xl font-semibold mb-2">Email Flows</h2>
        <p className="text-muted-foreground">
          Node-based workflow editor. Click a workflow name to view and edit its flow.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Active</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date Created</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Created By</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {workflows.map((wf) => (
                <tr key={wf.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onSelect(wf)}
                      className="font-medium text-foreground hover:text-primary hover:underline text-left transition-colors"
                    >
                      {wf.name}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {wf.type === "standard" ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        Standard
                      </span>
                    ) : (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                        Variant
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        wf.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${wf.active ? "bg-green-500" : "bg-gray-400"}`} />
                      {wf.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    {editingId === wf.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          ref={inputRef}
                          className="flex-1 min-w-0 border border-border rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          value={descValue}
                          onChange={(e) => setDescValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(wf.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <button onClick={() => saveEdit(wf.id)} className="p-1 rounded hover:bg-green-50 text-green-600 flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="p-1 rounded hover:bg-muted text-muted-foreground flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(wf)}
                        className="text-muted-foreground text-left hover:text-foreground group flex items-center gap-1.5 w-full"
                      >
                        <span className="truncate">
                          {wf.description || <span className="italic opacity-40">Add description…</span>}
                        </span>
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-shrink-0 transition-opacity" />
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{wf.createdAt}</td>
                  <td className="px-5 py-4 text-muted-foreground">{wf.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── FlowBuilder (root) ───────────────────────────────────────────────────────

export function FlowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [selected, setSelected] = useState<Workflow | null>(null);

  function handleUpdateWorkflow(updated: Workflow) {
    setWorkflows((prev) => prev.map((wf) => (wf.id === updated.id ? updated : wf)));
    setSelected(updated);
  }

  function handleUpdateDescription(workflowId: string, description: string) {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === workflowId ? { ...wf, description } : wf))
    );
  }

  if (selected) {
    return (
      <NodeFlowEditor
        workflow={selected}
        onBack={() => setSelected(null)}
        onUpdateWorkflow={handleUpdateWorkflow}
      />
    );
  }

  return (
    <WorkflowList
      workflows={workflows}
      onSelect={setSelected}
      onUpdateDescription={handleUpdateDescription}
    />
  );
}
