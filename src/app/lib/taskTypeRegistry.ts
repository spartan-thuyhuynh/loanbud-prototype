import {
  Phone,
  Mail,
  MessageSquare,
  Mic,
  FileText,
  Calendar,
  StickyNote,
  ClipboardCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { OutcomeRule } from "@/app/types";

// ── Task Type IDs ─────────────────────────────────────────────────────────────

/**
 * Phase 1 ships: Call | Email | SMS | Voicemail
 * Future phases: Document | Meeting | Note | Review | Approval | Custom
 * Adding a new type = one new entry in TASK_TYPE_REGISTRY — no other changes needed.
 */
export type TaskTypeId =
  | "Call"
  | "Email"
  | "SMS"
  | "Voicemail"
  | "Document"
  | "Meeting"
  | "Note"
  | "Review"
  | "Approval"
  | "Custom";

/** Task types exposed in the Create/Edit Task UI in Phase 1 */
export const ACTIVE_TASK_TYPES: TaskTypeId[] = ["Call", "Email", "SMS", "Voicemail"];

// ── Disposition Sets ──────────────────────────────────────────────────────────

export type DispositionSetId =
  | "call-dispositions"
  | "voicemail-dispositions"
  | "email-dispositions"
  | "sms-dispositions"
  | "meeting-dispositions"
  | "document-dispositions"
  | "review-dispositions"
  | "approval-dispositions"
  | "generic-dispositions";

export const DISPOSITION_SETS: Record<DispositionSetId, string[]> = {
  "call-dispositions": [
    "Answered",
    "Left Voicemail",
    "Drop Voicemail",
    "No Answer",
  ],
  "voicemail-dispositions": [
    "Voicemail Dropped",
    "Answered Instead",
    "Not Needed",
  ],
  "email-dispositions": ["Sent", "Replied", "Bounced", "Not Needed"],
  "sms-dispositions": ["Sent", "Replied", "Failed", "Not Needed"],
  // Future
  "meeting-dispositions": ["Attended", "No-Show", "Rescheduled", "Cancelled"],
  "document-dispositions": [
    "Received",
    "Partial — Follow Up Needed",
    "Not Available",
    "Waived",
  ],
  "review-dispositions": [
    "Approved",
    "Needs Revision",
    "Rejected",
    "Escalated",
  ],
  "approval-dispositions": ["Approved", "Denied", "Pending More Info"],
  "generic-dispositions": ["Completed", "Not Needed", "Deferred"],
};

// ── Completion Field Descriptors ──────────────────────────────────────────────

export type CompletionFieldType =
  | "disposition-picker"
  | "textarea"
  | "text"
  | "date";

export interface TaskCompletionField {
  key: string;
  label: string;
  type: CompletionFieldType;
  required: boolean;
  dispositionSetId?: DispositionSetId;
  placeholder?: string;
}

export interface TaskTypeSpecificField {
  key: string;
  label: string;
  type: "text" | "textarea" | "url";
  placeholder?: string;
}

// ── Primary Action Descriptor ─────────────────────────────────────────────────

export type PrimaryActionHandler = "dialer" | "email-composer" | "sms-composer" | "manual";

export interface TaskPrimaryAction {
  /** Label shown on the Action button. Use {contactName} as a placeholder. */
  label: string;
  icon: LucideIcon;
  handler: PrimaryActionHandler;
}

// ── Task Type Config ──────────────────────────────────────────────────────────

export interface TaskTypeConfig {
  id: TaskTypeId;
  label: string;
  icon: LucideIcon;
  /** Tailwind text color class, e.g. "text-blue-600" */
  color: string;
  /** Tailwind badge classes, e.g. "bg-blue-100 text-blue-700" */
  badgeColor: string;
  /** Maps to WorkflowStep.actionType when creating workflow steps */
  workflowActionType?: string;
  completionFields: TaskCompletionField[];
  typeSpecificFields: TaskTypeSpecificField[];
  primaryAction: TaskPrimaryAction;
  defaultOutcomeRules?: OutcomeRule[];
}

// ── Default Outcome Rules ─────────────────────────────────────────────────────

export const DEFAULT_CALL_OUTCOME_RULES: OutcomeRule[] = [
  { disposition: "Answered", action: "advance" },
  { disposition: "Left Voicemail", action: "advance" },
  { disposition: "Drop Voicemail", action: "advance" },
  { disposition: "No Answer", action: "advance" },
];

export const DEFAULT_VOICEMAIL_OUTCOME_RULES: OutcomeRule[] = [
  { disposition: "Voicemail Dropped", action: "advance" },
  { disposition: "Answered Instead", action: "advance" },
  { disposition: "Not Needed", action: "skip-remaining" },
];

// ── Registry ──────────────────────────────────────────────────────────────────

export const TASK_TYPE_REGISTRY: Record<TaskTypeId, TaskTypeConfig> = {
  Call: {
    id: "Call",
    label: "Call",
    icon: Phone,
    color: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700",
    workflowActionType: "call-reminder",
    completionFields: [
      {
        key: "disposition",
        label: "Call Disposition",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "call-dispositions",
      },
      {
        key: "outcome",
        label: "Post-Call Note",
        type: "textarea",
        required: false,
        placeholder: "Optional notes about the call…",
      },
    ],
    typeSpecificFields: [
      { key: "triggerContext", label: "Call Objective", type: "textarea", placeholder: "What is the goal of this call?" },
      { key: "notes", label: "Voicemail Script", type: "textarea", placeholder: "Script to use if voicemail is reached…" },
    ],
    primaryAction: {
      label: "Call {contactName}",
      icon: Phone,
      handler: "dialer",
    },
    defaultOutcomeRules: DEFAULT_CALL_OUTCOME_RULES,
  },

  Voicemail: {
    id: "Voicemail",
    label: "Voicemail",
    icon: Mic,
    color: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700",
    workflowActionType: "voicemail-reminder",
    completionFields: [
      {
        key: "disposition",
        label: "Outcome",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "voicemail-dispositions",
      },
    ],
    typeSpecificFields: [
      { key: "notes", label: "Voicemail Script", type: "textarea", placeholder: "Script to leave as voicemail…" },
    ],
    primaryAction: {
      label: "Drop Voicemail",
      icon: Mic,
      handler: "dialer",
    },
    defaultOutcomeRules: DEFAULT_VOICEMAIL_OUTCOME_RULES,
  },

  Email: {
    id: "Email",
    label: "Email",
    icon: Mail,
    color: "text-teal-600",
    badgeColor: "bg-teal-100 text-teal-700",
    workflowActionType: "email",
    completionFields: [
      {
        key: "disposition",
        label: "Email Status",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "email-dispositions",
      },
      {
        key: "outcome",
        label: "Note",
        type: "textarea",
        required: false,
        placeholder: "Optional notes…",
      },
    ],
    typeSpecificFields: [
      { key: "triggerContext", label: "Email Subject", type: "text", placeholder: "Subject line of the email…" },
    ],
    primaryAction: {
      label: "Compose Email",
      icon: Mail,
      handler: "email-composer",
    },
  },

  SMS: {
    id: "SMS",
    label: "SMS",
    icon: MessageSquare,
    color: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700",
    workflowActionType: "sms",
    completionFields: [
      {
        key: "disposition",
        label: "SMS Status",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "sms-dispositions",
      },
    ],
    typeSpecificFields: [
      { key: "notes", label: "Message Content", type: "textarea", placeholder: "SMS message text…" },
    ],
    primaryAction: {
      label: "Send SMS",
      icon: MessageSquare,
      handler: "sms-composer",
    },
  },

  // ── Future types — registry entries pre-defined, not yet shown in UI ─────────

  Document: {
    id: "Document",
    label: "Document",
    icon: FileText,
    color: "text-orange-600",
    badgeColor: "bg-orange-100 text-orange-700",
    completionFields: [
      {
        key: "disposition",
        label: "Document Status",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "document-dispositions",
      },
      { key: "outcome", label: "Notes", type: "textarea", required: false },
    ],
    typeSpecificFields: [
      { key: "triggerContext", label: "Document Required", type: "text" },
      { key: "notes", label: "Instructions", type: "textarea" },
    ],
    primaryAction: { label: "Collect Document", icon: FileText, handler: "manual" },
  },

  Meeting: {
    id: "Meeting",
    label: "Meeting",
    icon: Calendar,
    color: "text-emerald-600",
    badgeColor: "bg-emerald-100 text-emerald-700",
    completionFields: [
      {
        key: "disposition",
        label: "Meeting Outcome",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "meeting-dispositions",
      },
      { key: "outcome", label: "Meeting Notes", type: "textarea", required: false },
    ],
    typeSpecificFields: [
      { key: "triggerContext", label: "Agenda", type: "textarea" },
    ],
    primaryAction: { label: "Log Meeting", icon: Calendar, handler: "manual" },
  },

  Note: {
    id: "Note",
    label: "Note",
    icon: StickyNote,
    color: "text-yellow-600",
    badgeColor: "bg-yellow-100 text-yellow-700",
    completionFields: [
      { key: "outcome", label: "Note Content", type: "textarea", required: true, placeholder: "Write your note…" },
    ],
    typeSpecificFields: [],
    primaryAction: { label: "Add Note", icon: StickyNote, handler: "manual" },
  },

  Review: {
    id: "Review",
    label: "Review",
    icon: ClipboardCheck,
    color: "text-indigo-600",
    badgeColor: "bg-indigo-100 text-indigo-700",
    completionFields: [
      {
        key: "disposition",
        label: "Review Decision",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "review-dispositions",
      },
      { key: "outcome", label: "Reviewer Notes", type: "textarea", required: false },
    ],
    typeSpecificFields: [
      { key: "triggerContext", label: "What to Review", type: "text" },
    ],
    primaryAction: { label: "Submit Review", icon: ClipboardCheck, handler: "manual" },
  },

  Approval: {
    id: "Approval",
    label: "Approval",
    icon: ShieldCheck,
    color: "text-rose-600",
    badgeColor: "bg-rose-100 text-rose-700",
    completionFields: [
      {
        key: "disposition",
        label: "Approval Decision",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "approval-dispositions",
      },
      { key: "outcome", label: "Reason / Notes", type: "textarea", required: false },
    ],
    typeSpecificFields: [
      { key: "triggerContext", label: "What needs approval", type: "text" },
    ],
    primaryAction: { label: "Submit Decision", icon: ShieldCheck, handler: "manual" },
  },

  Custom: {
    id: "Custom",
    label: "Custom",
    icon: Wrench,
    color: "text-gray-600",
    badgeColor: "bg-gray-100 text-gray-700",
    completionFields: [
      {
        key: "disposition",
        label: "Outcome",
        type: "disposition-picker",
        required: true,
        dispositionSetId: "generic-dispositions",
      },
      { key: "outcome", label: "Notes", type: "textarea", required: false },
    ],
    typeSpecificFields: [
      { key: "triggerContext", label: "Task Description", type: "textarea" },
    ],
    primaryAction: { label: "Complete Task", icon: Wrench, handler: "manual" },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the config for the given task type, falling back to Custom for unknown types. */
export function getTaskTypeConfig(taskType: string): TaskTypeConfig {
  return TASK_TYPE_REGISTRY[taskType as TaskTypeId] ?? TASK_TYPE_REGISTRY.Custom;
}

/** Returns the disposition options for a given task type. */
export function getDispositionsForTaskType(taskType: string): string[] {
  const config = getTaskTypeConfig(taskType);
  const firstDispositionField = config.completionFields.find(
    (f) => f.type === "disposition-picker" && f.dispositionSetId,
  );
  if (!firstDispositionField?.dispositionSetId) return DISPOSITION_SETS["generic-dispositions"];
  return DISPOSITION_SETS[firstDispositionField.dispositionSetId];
}

/** Returns the default outcome rules for a task type (used when WorkflowStep.outcomeRules is not set). */
export function getDefaultOutcomeRules(taskType: string): OutcomeRule[] {
  return getTaskTypeConfig(taskType).defaultOutcomeRules ?? [];
}
